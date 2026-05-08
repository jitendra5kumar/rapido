import express from 'express';

import * as userController from '../controllers/user.controller.js';
import {authMiddleware, requireRoles } from '../middlewares/index.js';
import { changeUserRole as changeUserRoleValidator } from '../validators/user.validator.js';
import { handleValidationErrors } from '../middlewares/error.middleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.patch('/role/:userId', authMiddleware, requireRoles('admin', 'sub_admin'), changeUserRoleValidator, handleValidationErrors, userController.changeUserRole);



export default router;