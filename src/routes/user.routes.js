import express from 'express';
import * as userController from '../controllers/user.controller.js';
import {authMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);

export default router;
