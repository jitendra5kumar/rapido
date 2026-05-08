import * as rideReportService from "../services/rideReport.service.js";
import { asyncHandler, response } from "../utils/index.js";

// CREATE RIDE REPORT
export const createRideReportController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = {
    ...req.body,
    reporterId: userId,
  };

  const report = await rideReportService.createRideReport(data);

  response.success(res, "Ride report submitted successfully", report, 201);
});

// GET ALL RIDE REPORTS (Admin)
export const getRideReportsController = asyncHandler(async (req, res) => {
  const filters = req.query;
  const reports = await rideReportService.getRideReports(filters);

  response.success(res, "Ride reports fetched successfully", reports);
});

// GET RIDE REPORT BY ID
export const getRideReportByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await rideReportService.getRideReportById(id);

  if (!report) {
    return response.error(res, "Ride report not found", 404);
  }

  response.success(res, "Ride report fetched successfully", report);
});

// GET USER'S RIDE REPORTS
export const getUserRideReportsController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const reports = await rideReportService.getUserReports(userId);

  response.success(res, "Your ride reports fetched successfully", reports);
});

// UPDATE REPORT STATUS (Admin)
export const updateReportStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  const { status, resolutionNotes } = req.body;

  const report = await rideReportService.updateReportStatus(id, adminId, status, resolutionNotes);

  if (!report) {
    return response.error(res, "Ride report not found", 404);
  }

  response.success(res, "Report status updated successfully", report);
});

// DELETE RIDE REPORT (Admin)
export const deleteRideReportController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await rideReportService.deleteRideReport(id);

  if (!deleted) {
    return response.error(res, "Ride report not found", 404);
  }

  response.success(res, "Ride report deleted successfully");
});