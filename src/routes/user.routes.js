import express from 'express';

import * as userController from '../controllers/user.controller.js';
import { authMiddleware, rateLimitMiddleware } from '../middlewares/index.js';

const router = express.Router();

// 👤 Get user profile (protected)
router.get(
  '/profile',
  authMiddleware,
  rateLimitMiddleware,
  userController.getProfile
);

export default router;