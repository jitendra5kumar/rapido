import * as earningsService from '../services/earnings.service.js';
import { asyncHandler, response } from '../utils/index.js';

export const getTodayEarningsController = asyncHandler(async (req, res) => {
  const driverId = req.user.id;
  const result = await earningsService.getTodayEarnings(driverId);
  response.success(res, "Today's earnings fetched successfully", result);
});

export const getWeeklyEarningsController = asyncHandler(async (req, res) => {
  const driverId = req.user.id;
  const result = await earningsService.getWeeklyEarnings(driverId);
  response.success(res, "Weekly earnings fetched successfully", result);
});

export const getEarningsSummaryController = asyncHandler(async (req, res) => {
  const driverId = req.user.id;
  const result = await earningsService.getEarningsSummary(driverId);
  response.success(res, "Earnings summary fetched successfully", result);
});

export const getEarningsHistoryController = asyncHandler(async (req, res) => {
  const driverId = req.user.id;
  const result = await earningsService.getEarningsHistory(driverId);
  response.success(res, "Earnings history fetched successfully", result);
});
