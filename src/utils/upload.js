import { uploadToS3 } from "../controllers/s3.controller.js";

// utils/upload.js
export const processImageUpload = async (imageData, userId) => {
  // If it's a base64 string
  if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
    const base64Data = imageData.split(';base64,').pop();
    const buffer = Buffer.from(base64Data, 'base64');
    const mimeType = imageData.split(';')[0].split(':')[1];
    const extension = mimeType.split('/')[1];
    const filename = `city_${Date.now()}_${userId}.${extension}`;
    
    return await uploadToS3(buffer, filename, mimeType, "cities");
  }
  
  // If it's a file
  if (imageData.buffer) {
    return await uploadToS3(
      imageData.buffer,
      imageData.originalname,
      imageData.mimetype,
      "cities"
    );
  }
  
  throw new Error("Invalid image format");
};