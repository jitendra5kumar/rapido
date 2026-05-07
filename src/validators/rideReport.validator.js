import { body, param, query } from "express-validator";

export const createRideReport = [
  body("rideId")
    .isMongoId()
    .withMessage("Ride ID must be a valid MongoDB ID"),
  body("reason")
    .isIn(["wrong_fare", "driver_behavior", "vehicle_issue", "route_issue", "payment_issue", "other"])
    .withMessage("Invalid reason"),
  body("description")
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
];

export const updateReportStatus = [
  param("id")
    .isMongoId()
    .withMessage("Report ID must be a valid MongoDB ID"),
  body("status")
    .isIn(["pending", "investigating", "resolved", "dismissed"])
    .withMessage("Invalid status"),
  body("resolutionNotes")
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Resolution notes must be between 10 and 500 characters"),
];

export const getRideReport = [
  param("id")
    .isMongoId()
    .withMessage("Report ID must be a valid MongoDB ID"),
];