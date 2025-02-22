import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import fs from "fs";
import fetch from "node-fetch";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  let uploadResult;

  try {
    uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "filevault-uploads",
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
  } finally {
    // Always delete the file, even if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }

  return uploadResult; // Might be undefined if upload failed
};

const downloadFromCloudinary = async (url, outputPath) => {
  try {
    // Fetch the file from the URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Create a writable stream to save the file
    const fileStream = fs.createWriteStream(outputPath);

    // Pipe the response body to the file stream
    response.body.pipe(fileStream);

    // Handle errors during the write process
    fileStream.on("error", (err) => {
      console.error("Error writing file:", err);
    });

    return fileStream;
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

const deleteFromCloudinary = async (url) => {
  const publicId =
    "filevault-uploads/" + url.split("/filevault-uploads/")[1].split(".")[0];
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
};

export { uploadOnCloudinary, downloadFromCloudinary, deleteFromCloudinary };
