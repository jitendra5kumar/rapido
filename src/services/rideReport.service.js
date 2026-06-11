import RideReport from "../models/rideReport.model.js";
import Ride from "../models/ride.model.js";

export const createRideReport = async (data) => {
  // Check if ride exists
  const ride = await Ride.findById(data.rideId);
  if (!ride) {
    throw new Error("Ride not found");
  }

  // Check if user was part of the ride (rider or driver)
 

  // Check if report already exists for this ride by this user
  const existingReport = await RideReport.findOne({
    rideId: data.rideId,
    reporterId: data.reporterId,
  });
  if (existingReport) {
    throw new Error("You have already reported this ride");
  }

  const report = await RideReport.create(data);
  return await report.populate([
    { path: "rideId", select: "pickupLocation dropLocation fare status" },
    { path: "reporterId", select: "name email phone" },
  ]);
};


export const getRideReports = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.reason) {
    query.reason = filters.reason;
  }

  return await RideReport.find(query)
    .populate("rideId", "pickupLocation dropLocation fare status createdAt")
    .populate("reporterId", "name email phone")
    .populate("resolvedBy", "name email")
    .sort({ createdAt: -1 });
};


export const getRideReportById = async (id) => {
  return await RideReport.findById(id)
    .populate("rideId")
    .populate("reporterId", "name email phone")
    .populate("resolvedBy", "name email");
};


export const getUserReports = async (userId) => {
  return await RideReport.find({ reporterId: userId })
    .populate("rideId", "pickupLocation dropLocation fare status createdAt")
    .sort({ createdAt: -1 });
};


export const updateReportStatus = async (id, adminId, status, resolutionNotes) => {
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

  return await RideReport.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("rideId")
    .populate("reporterId", "name email phone")
    .populate("resolvedBy", "name email");
};


export const deleteRideReport = async (id) => {
  return await RideReport.findByIdAndDelete(id);
};