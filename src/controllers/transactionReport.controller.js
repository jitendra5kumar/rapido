import * as transactionReportService from "../services/transactionReport.service.js";
import { asyncHandler, response } from "../utils/index.js";

// CREATE TRANSACTION REPORT
export const createTransactionReportController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = {
    ...req.body,
    reporterId: userId,
  };

  const report = await transactionReportService.createTransactionReport(data);

  response.success(res, "Transaction report submitted successfully", report, 201);
});

// GET ALL TRANSACTION REPORTS (Admin)
export const getTransactionReportsController = asyncHandler(async (req, res) => {
  const filters = req.query;
  const reports = await transactionReportService.getTransactionReports(filters);

  response.success(res, "Transaction reports fetched successfully", reports);
});

// GET TRANSACTION REPORT BY ID
export const getTransactionReportByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await transactionReportService.getTransactionReportById(id);

  if (!report) {
    return response.error(res, "Transaction report not found", 404);
  }

  response.success(res, "Transaction report fetched successfully", report);
});

// GET USER'S TRANSACTION REPORTS
export const getUserTransactionReportsController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const reports = await transactionReportService.getUserTransactionReports(userId);

  response.success(res, "Your transaction reports fetched successfully", reports);
});

// UPDATE TRANSACTION REPORT STATUS (Admin)
export const updateTransactionReportStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  const { status, resolutionNotes } = req.body;

  const report = await transactionReportService.updateTransactionReportStatus(id, adminId, status, resolutionNotes);

  if (!report) {
    return response.error(res, "Transaction report not found", 404);
  }

  response.success(res, "Transaction report status updated successfully", report);
});

// DELETE TRANSACTION REPORT (Admin)
export const deleteTransactionReportController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await transactionReportService.deleteTransactionReport(id);

  if (!deleted) {
    return response.error(res, "Transaction report not found", 404);
  }

  response.success(res, "Transaction report deleted successfully");
});