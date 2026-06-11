import * as driverReportService from "../services/driverReport.service.js";
import { asyncHandler, response } from "../utils/index.js";

// CREATE DRIVER REPORT
export const createDriverReportController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = {
    ...req.body,
    reporterId: userId,
  };
console.log(data);
  const report = await driverReportService.createDriverReport(data);

  response.success(res, "Driver report submitted successfully", report, 201);
});

// GET ALL DRIVER REPORTS (Admin)
export const getDriverReportsController = asyncHandler(async (req, res) => {
  const filters = req.query;
  const reports = await driverReportService.getDriverReports(filters);

  response.success(res, "Driver reports fetched successfully", reports);
});

// GET DRIVER REPORT BY ID
export const getDriverReportByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await driverReportService.getDriverReportById(id);

  if (!report) {
    return response.error(res, "Driver report not found", 404);
  }

  response.success(res, "Driver report fetched successfully", report);
});

// GET USER'S DRIVER REPORTS
export const getUserDriverReportsController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const reports = await driverReportService.getUserDriverReports(userId);

  response.success(res, "Your driver reports fetched successfully", reports);
});

// UPDATE DRIVER REPORT STATUS (Admin)
export const updateDriverReportStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  const { status, resolutionNotes } = req.body;

  const report = await driverReportService.updateDriverReportStatus(id, adminId, status, resolutionNotes);

  if (!report) {
    return response.error(res, "Driver report not found", 404);
  }

  response.success(res, "Driver report status updated successfully", report);
});

// DELETE DRIVER REPORT (Admin)
export const deleteDriverReportController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await driverReportService.deleteDriverReport(id);

  if (!deleted) {
    return response.error(res, "Driver report not found", 404);
  }

  response.success(res, "Driver report deleted successfully");
});