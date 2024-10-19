import fs from "fs"
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js"
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js"

const registerUser = asyncHandler(async (req, res) => {
  // get user details
  const { fullName, username, email, password } = req.body;

  // data validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All Fields Are Required");
  }

  // check existing data conflict
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser){
    throw new apiError(409, "User with same Email or Username already exist!");
}

// handle file upload and validation
  const uploadedFiles = req.files;

  if(!uploadedFiles || !uploadedFiles.avatar || uploadedFiles.avatar.length === 0){
    throw new apiError(400, "Avatar is Required")
  }
  
  const avatarLocalPath = uploadedFiles.avatar[0].path;
  let coverImageLocalPath;
  if(uploadedFiles.coverImage && uploadedFiles.coverImage.length > 0){
    coverImageLocalPath = uploadedFiles.coverImage[0].path
  }

  // cloudinary file upload
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    let coverImage;
    
    if(!avatar){
      fs.unlinkSync(coverImageLocalPath)
      throw new apiError(400, "Avatar is Required")
    }else{
      coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }

    // new user Creation
  const user = await User.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatar.url,
      coverImage: coverImage?.url || ""
    })

    // Check is the created and make a response data
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){ throw new apiError(500, "Internal Server Erorr while user Creation")}

    return res.status(201).json(new apiResponse(201, createdUser, "User Register Successfully"))

});

export { registerUser };
