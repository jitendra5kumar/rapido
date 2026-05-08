import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authMiddleware, requireRoles } from '../middlewares/index.js';
import { handleValidationErrors } from '../middlewares/error.middleware.js';
import {
  createSubAdmin as createSubAdminValidator,
  updateSubAdmin as updateSubAdminValidator,
  getSubAdminById as getSubAdminByIdValidator,
  deleteSubAdmin as deleteSubAdminValidator,
  resetUserPassword as resetUserPasswordValidator,

  updateUserStatus as updateUserStatusValidator
} from '../validators/admin.validator.js';

const router = express.Router();

// Super admin only routes
router.use(authMiddleware);
router.use(requireRoles('admin'));

router.post('/sub-admin',  createSubAdminValidator,  handleValidationErrors,  adminController.createSubAdmin);

router.get('/sub-admin', adminController.getSubAdmins);

router.get('/sub-admin/:subAdminId', getSubAdminByIdValidator, handleValidationErrors, adminController.getSubAdminById);

router.put('/sub-admin/:subAdminId', updateSubAdminValidator, handleValidationErrors, adminController.updateSubAdmin);

router.delete('/sub-admin/:subAdminId', deleteSubAdminValidator, handleValidationErrors, adminController.deleteSubAdmin);

router.post('/reset-password',  resetUserPasswordValidator,  handleValidationErrors,  adminController.resetUserPassword);

router.post('/update-user-status',  updateUserStatusValidator,  handleValidationErrors, adminController.updateUserStatus);

// Chat Management Routes
router.get('/chats', adminController.getChatDashboard);

router.post('/chats/:chatId/reply', adminController.respondToChat);


export default router;
