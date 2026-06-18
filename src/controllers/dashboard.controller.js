import * as dashboardService from '../services/dashboard.service.js';
import { asyncHandler, response } from '../utils/index.js';

export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const driverId = req.user.id;
  const result = await dashboardService.getDashboardStats(driverId);
  response.success(res, "Dashboard stats fetched successfully", result);
});
