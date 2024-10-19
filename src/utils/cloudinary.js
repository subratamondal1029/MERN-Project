import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a file
const uploadFile = async (filePath) => {
    try {
        if(!filePath) return null;

        // upload in cloudinary
      const fileResponse = await cloudinary.uploader.upload(filePath, {resource_type: "auto"})

        // if file uploaded remove file from server
        fs.unlinkSync(filePath)
        return fileResponse;
    } catch (error) {
        fs.unlinkSync(filePath)
        return null;
    }
}

export default uploadFile