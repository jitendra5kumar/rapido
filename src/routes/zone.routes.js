import express from 'express';
import * as zoneController from '../controllers/zone.controller.js';
import { authMiddleware } from '../middlewares/index.js';
import { createZone as createZoneValidator, updateZone as updateZoneValidator, getZone as getZoneValidator, deleteZone as deleteZoneValidator } from '../validators/zone.validator.js';
import { handleValidationErrors } from '../middlewares/error.middleware.js';

const router = express.Router();

// All zone routes require authentication
router.use(authMiddleware);

// POST /api/zone - Create a new zone
router.post('/', createZoneValidator, handleValidationErrors, zoneController.createZone);

// PUT /api/zone/:zoneId - Update zone
router.put('/:zoneId', updateZoneValidator, handleValidationErrors, zoneController.updateZone);

// GET /api/zone/:zoneId - Get zone by ID
router.get('/:zoneId', getZoneValidator, handleValidationErrors, zoneController.getZone);

// GET /api/zone - Get all zones for current user
router.get('/', zoneController.getUserZones);

// DELETE /api/zone/:zoneId - Delete zone
router.delete('/:zoneId', deleteZoneValidator, handleValidationErrors, zoneController.deleteZone);

export default router;
