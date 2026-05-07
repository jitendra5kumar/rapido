import express from 'express';

import * as userController from '../controllers/user.controller.js';
<<<<<<< HEAD
import {authMiddleware, requireRoles } from '../middlewares/index.js';
import { changeUserRole as changeUserRoleValidator } from '../validators/user.validator.js';
import { handleValidationErrors } from '../middlewares/error.middleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.patch('/role/:userId', authMiddleware, requireRoles('admin', 'sub_admin'), changeUserRoleValidator, handleValidationErrors, userController.changeUserRole);
=======
import { authMiddleware, rateLimitMiddleware } from '../middlewares/index.js';

const router = express.Router();

// 👤 Get user profile (protected)
router.get(
  '/profile',
  authMiddleware,
  rateLimitMiddleware,
  userController.getProfile
);
>>>>>>> 4faba7af4e25a661464174652fbf5f8416a0a7e6

export default router;