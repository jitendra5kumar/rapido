import express from 'express';
import * as alertController from '../controllers/alert.controller.js';
import { authMiddleware, requireRoles } from '../middlewares/index.js';
import { createAlert as createAlertValidator, updateAlert as updateAlertValidator, getAlert as getAlertValidator, deleteAlert as deleteAlertValidator, getAlertsByType as getAlertsByTypeValidator } from '../validators/alert.validator.js';
import { handleValidationErrors } from '../middlewares/error.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireRoles('admin', 'sub_admin'), createAlertValidator, handleValidationErrors, alertController.createAlert);

router.put('/:alertId',requireRoles('admin', 'sub_admin'), updateAlertValidator, handleValidationErrors, alertController.updateAlert);

router.get('/type/:userType', getAlertsByTypeValidator, handleValidationErrors, alertController.getAlertsByUserType);

router.get('/created-by', alertController.getAlertsByUser);

router.get('/', alertController.getAllAlerts);

router.get('/:alertId', getAlertValidator, handleValidationErrors, alertController.getAlert);

router.delete('/:alertId', deleteAlertValidator, handleValidationErrors, alertController.deleteAlert);

export default router;
