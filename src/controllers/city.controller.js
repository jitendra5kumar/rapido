import * as cityService from '../services/city.service.js';
import { asyncHandler } from '../utils/index.js';
import { response } from '../utils/index.js';

export const createCity = asyncHandler(async (req, res) => {
  const { name, image } = req.body;
  const userId = req.user.id;

  const city = await cityService.createCity(userId, {
    name,
    image,
  });

  response.success(res, 'City created successfully', city, 201);
});

export const updateCity = asyncHandler(async (req, res) => {
  const { cityId } = req.params;
  const { name, image } = req.body;
  const userId = req.user.id;

  const city = await cityService.updateCity(cityId, userId, {
    name,
    image,
  });

  response.success(res, 'City updated successfully', city);
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
