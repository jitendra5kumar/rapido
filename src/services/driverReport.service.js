import DriverReport from "../models/driverReport.model.js";
import Driver from "../models/driver.model.js";
import Ride from "../models/ride.model.js";

export const createDriverReport = async (data) => {
  const driver = await Driver.findById(data.driverId);
  if (!driver) {
    throw new Error("Driver not found");
  }

  if (data.rideId) {
    const ride = await Ride.findById(data.rideId);
    if (!ride) {
      throw new Error("Ride not found");
    }

    if (ride.riderId.toString() !== data.reporterId && ride.driverId.toString() !== data.reporterId) {
      throw new Error("You can only report rides you participated in");
    }
  }

  const existingReport = await DriverReport.findOne({
    driverId: data.driverId,
    reporterId: data.reporterId,
    rideId: data.rideId || null,
  });

  if (existingReport) {
    throw new Error("You have already reported this driver for this ride");
  }

  const report = await DriverReport.create(data);
  return await report.populate([
    { path: "driverId", select: "userId status" },
    { path: "rideId", select: "pickupLocation dropLocation fare status" },
    { path: "reporterId", select: "name email phone" },
  ]);
};

export const getDriverReports = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.reason) {
    query.reason = filters.reason;
  }

  if (filters.driverId) {
    query.driverId = filters.driverId;
  }

  return await DriverReport.find(query)
    .populate("driverId", "userId status")
    .populate("rideId", "pickupLocation dropLocation fare status createdAt")
    .populate("reporterId", "name email phone")
    .populate("resolvedBy", "name email")
    .sort({ createdAt: -1 });
};

export const getDriverReportById = async (id) => {
  return await DriverReport.findById(id)
    .populate("driverId")
    .populate("rideId")
    .populate("reporterId", "name email phone")
    .populate("resolvedBy", "name email");
};

export const getUserDriverReports = async (userId) => {
  return await DriverReport.find({ reporterId: userId })
    .populate("driverId", "userId status")
    .populate("rideId", "pickupLocation dropLocation fare status createdAt")
    .sort({ createdAt: -1 });
};

export const updateDriverReportStatus = async (id, adminId, status, resolutionNotes) => {
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

  return await DriverReport.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("driverId")
    .populate("rideId")
    .populate("reporterId", "name email phone")
    .populate("resolvedBy", "name email");
};

export const deleteDriverReport = async (id) => {
  return await DriverReport.findByIdAndDelete(id);
};