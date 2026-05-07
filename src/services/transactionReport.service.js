import TransactionReport from "../models/transactionReport.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";

export const createTransactionReport = async (data) => {
  const transaction = await WalletTransaction.findById(data.transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (transaction.user_id.toString() !== data.reporterId) {
    throw new Error("You can only report your own transaction");
  }

  const existingReport = await TransactionReport.findOne({
    transactionId: data.transactionId,
    reporterId: data.reporterId,
  });

  if (existingReport) {
    throw new Error("You have already reported this transaction");
  }

  const report = await TransactionReport.create(data);
  return await report.populate([
    { path: "transactionId", select: "amount currency status type failure_reason createdAt" },
    { path: "reporterId", select: "name email phone" },
    { path: "resolvedBy", select: "name email" },
  ]);
};

export const getTransactionReports = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.reason) {
    query.reason = filters.reason;
  }

  if (filters.transactionId) {
    query.transactionId = filters.transactionId;
  }

  return await TransactionReport.find(query)
    .populate("transactionId", "amount currency status type failure_reason createdAt")
    .populate("reporterId", "name email phone")
    .populate("resolvedBy", "name email")
    .sort({ createdAt: -1 });
};

export const getTransactionReportById = async (id) => {
  return await TransactionReport.findById(id)
    .populate("transactionId")
    .populate("reporterId", "name email phone")
    .populate("resolvedBy", "name email");
};

export const getUserTransactionReports = async (userId) => {
  return await TransactionReport.find({ reporterId: userId })
    .populate("transactionId", "amount currency status type failure_reason createdAt")
    .sort({ createdAt: -1 });
};

export const updateTransactionReportStatus = async (id, adminId, status, resolutionNotes) => {
  const updateData = {
    status,
    resolvedBy: adminId,
  };

  if (status === "resolved" || status === "dismissed") {
    updateData.resolvedAt = new Date();
  }

  if (resolutionNotes) {
    updateData.resolutionNotes = resolutionNotes;
  }

  return await TransactionReport.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("transactionId")
    .populate("reporterId", "name email phone")
    .populate("resolvedBy", "name email");
};

export const deleteTransactionReport = async (id) => {
  return await TransactionReport.findByIdAndDelete(id);
};