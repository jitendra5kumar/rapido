import 'dotenv/config';
import axios from "axios";

export const uploadToImgBB = async (fileBuffer) => {
  try {
    if (!fileBuffer) {
      throw new Error("File buffer missing");
    }

    const base64Image = fileBuffer.toString("base64");

    const params = new URLSearchParams();
    params.append("key", process.env.IMGBB_API_KEY); // ensure correct env
    params.append("image", base64Image);

    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

  

    const imageUrl =
      response.data?.data?.url ||
      response.data?.data?.display_url;

    if (!imageUrl) {
      throw new Error("Invalid ImgBB response");
    }

    return imageUrl;
  } catch (error) {
    console.log("ImgBB ERROR DETAILS:", error.response?.data || error.message);
    throw new Error("Image upload failed");
  }
};