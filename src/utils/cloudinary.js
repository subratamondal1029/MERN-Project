import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a file
const uploadFileOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    // upload in cloudinary
    const fileResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    // if file uploaded remove file from server
    fs.unlinkSync(filePath);
    return fileResponse;
  } catch (error) {
    fs.unlinkSync(filePath);
    return null;
  }
};

//NOTE: assignment from tutorial
const deleteCloudinaryFile = async (url) => {
  try {
    if (!url) return;
    // http://res.cloudinary.com/dvwuableu/image/upload/v1729327636/j8adqg3mzgmty6axjdp1.png
    const public_id = url.split("/").pop().split(".")[0];

    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw error;
  }
};

export { uploadFileOnCloudinary, deleteCloudinaryFile };
