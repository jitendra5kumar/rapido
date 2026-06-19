import express from 'express';

import * as userController from '../controllers/user.controller.js';
import {authMiddleware, requireRoles } from '../middlewares/index.js';
import { changeUserRole as changeUserRoleValidator, updateProfile as updateProfileValidator } from '../validators/user.validator.js';
import { handleValidationErrors } from '../middlewares/error.middleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.patch('/profile-update', authMiddleware, updateProfileValidator, handleValidationErrors, userController.updateProfile);
router.patch('/role/:userId', authMiddleware, requireRoles('admin', 'sub_admin'), changeUserRoleValidator, handleValidationErrors, userController.changeUserRole);
router.get('/all-users', authMiddleware, requireRoles('admin', 'sub_admin'), userController.getallUsers);



export default router;