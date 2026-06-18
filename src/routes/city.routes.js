import express from 'express';
import * as cityController from '../controllers/city.controller.js';
import { authMiddleware, requireRoles } from '../middlewares/index.js';
import { createCity as createCityValidator, updateCity as updateCityValidator, getCity as getCityValidator, deleteCity as deleteCityValidator } from '../validators/city.validator.js';
import { handleValidationErrors } from '../middlewares/error.middleware.js';

const router = express.Router();

// All city routes require authentication


// POST /api/city - Create a new city
router.post('/',requireRoles('admin', 'sub_admin'),authMiddleware, createCityValidator, handleValidationErrors, cityController.createCity);

// PUT /api/city/:cityId - Update city
router.put('/:cityId',requireRoles('admin', 'sub_admin'),authMiddleware, updateCityValidator, handleValidationErrors, cityController.updateCity);

// GET /api/city/:cityId - Get city by ID
router.get('/:cityId', getCityValidator, handleValidationErrors, cityController.getCity);

// GET /api/city - Get all cities
router.get('/', cityController.getAllCities);

// GET /api/city/user/my - Get cities created by current user
router.get('/user/my',authMiddleware, cityController.getUserCities);

// DELETE /api/city/:cityId - Delete city
router.delete('/:cityId',requireRoles('admin', 'sub_admin'),authMiddleware, deleteCityValidator, handleValidationErrors, cityController.deleteCity);

export default router;
