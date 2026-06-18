import express from 'express';
import { getDashboardStatsController } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', getDashboardStatsController);

export default router;
