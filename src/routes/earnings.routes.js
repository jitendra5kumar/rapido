import express from 'express';
import {
  getTodayEarningsController,
  getWeeklyEarningsController,
  getEarningsSummaryController,
  getEarningsHistoryController,
} from '../controllers/earnings.controller.js';
import { authMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/today', getTodayEarningsController);
router.get('/weekly', getWeeklyEarningsController);
router.get('/summary', getEarningsSummaryController);
router.get('/history', getEarningsHistoryController);

export default router;
