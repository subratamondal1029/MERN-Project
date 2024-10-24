import fs from "fs";
import { Video } from "../models/video.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const uploadVideoWithDetails = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;

  if (!title?.trim() || !description?.trim())
    throw new apiError(400, "title or description is required");

  const uploadedFiles = req.files;

  let thumbnailLocalPath = uploadedFiles?.thumbnail?.[0]?.path;
  if (
    !uploadedFiles ||
    !uploadedFiles.video ||
    uploadedFiles.video.length === 0
  ) {
    if (thumbnailLocalPath) fs.unlinkSync(thumbnailLocalPath);
    throw new apiError(400, "Video is Required");
  }

  const videoLocalPath = uploadedFiles.video[0].path;

  const video = await uploadFileOnCloudinary(videoLocalPath);

  if (!video) {
    if (thumbnailLocalPath) fs.unlinkSync(thumbnailLocalPath);
    throw new apiError(500, "Error while uploading video");
  }
  const thumbnail = await uploadFileOnCloudinary(thumbnailLocalPath);

  const videoDetails = await Video.create({
    title: title.trim(),
    description: description.trim(),
    isPublished: isPublished ? Boolean(isPublished) : true,
    videoFile: video.url,
    duration: video.duration,
    thumbnail: thumbnail.url,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new apiResponse(201, videoDetails, "Video Uploaded Successfully"));
});

// TODO: add comment, likes and views
const getSingleVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  res
    .status(200)
    .json(new apiResponse(200, video[0], "Video fetched Successfully"));
});

export { uploadVideoWithDetails, getSingleVideo };
// TODO: stucture file upload on clodinary
