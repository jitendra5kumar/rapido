import * as cityService from "../services/city.service.js";
import { asyncHandler, response } from "../utils/index.js";
import { uploadToS3 } from "../controllers/s3.controller.js";
import { processImageUpload } from "../utils/upload.js";

export const createCity = asyncHandler(async (req, res) => {
  const { name, image: base64Image } = req.body;
  const userId = req.user.id;

  if (!name?.trim()) {
    return response.error(res, "City name is required", 400);
  }

  let imageUrl;

  if (req.file) {
    imageUrl = await processImageUpload(req.file, userId);
  } else if (base64Image) {
    imageUrl = await processImageUpload(base64Image, userId);
  } else {
    return response.error(res, "City image is required", 400);
  }

  const city = await cityService.createCity(userId, {
    name,
    image: imageUrl,
  });

  return response.success(res, "City created successfully", city, 201);
});

export const updateCity = asyncHandler(async (req, res) => {
  const { cityId } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  let image;

  if (req.file) {
    image = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "cities"
    );
  }

  const city = await cityService.updateCity(cityId, userId, {
    name,
    image,
  });

  response.success(res, "City updated successfully", city);
});

export const getCity = asyncHandler(async (req, res) => {
  const { cityId } = req.params;

  const city = await cityService.getCityById(cityId);

  response.success(res, 'City fetched successfully', city);
});

export const getAllCities = asyncHandler(async (req, res) => {
  const cities = await cityService.getAllCities();

  response.success(res, 'Cities fetched successfully', cities);
});

export const getUserCities = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const cities = await cityService.getUserCities(userId);

  response.success(res, 'Your cities fetched successfully', cities);
});

export const deleteCity = asyncHandler(async (req, res) => {
  const { cityId } = req.params;
  const userId = req.user.id;

  const result = await cityService.deleteCity(cityId, userId);

  response.success(res, result.message);
});
