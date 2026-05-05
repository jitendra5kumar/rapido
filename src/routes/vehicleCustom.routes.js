import express from 'express';
import * as vehicleCustomController from '../controllers/vehicleCustom.controller.js';
import { authMiddleware, requireRoles } from '../middlewares/index.js';
import { createVehicleCustom as createVehicleCustomValidator, updateVehicleCustom as updateVehicleCustomValidator, getVehicleCustom as getVehicleCustomValidator, deleteVehicleCustom as deleteVehicleCustomValidator, getVehicleCustoms as getVehicleCustomsValidator } from '../validators/vehicleCustom.validator.js';
import { handleValidationErrors } from '../middlewares/error.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireRoles('admin', 'sub_admin'), createVehicleCustomValidator, handleValidationErrors, vehicleCustomController.createVehicleCustom);
router.put('/:vehicleCustomId', requireRoles('admin', 'sub_admin'), updateVehicleCustomValidator, handleValidationErrors, vehicleCustomController.updateVehicleCustom);
router.delete('/:vehicleCustomId', requireRoles('admin', 'sub_admin'), deleteVehicleCustomValidator, handleValidationErrors, vehicleCustomController.deleteVehicleCustom);

router.get('/', getVehicleCustomsValidator, handleValidationErrors, vehicleCustomController.getVehicleCustoms);
router.get('/:vehicleCustomId', getVehicleCustomValidator, handleValidationErrors, vehicleCustomController.getVehicleCustom);

export default router;
