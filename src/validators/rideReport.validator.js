import { body, param, query } from "express-validator";

export const createRideReport = [
  body("rideId")
    .isMongoId()
    .withMessage("Ride ID must be a valid MongoDB ID"),
  body("reason")
    .optional()
    .isString()
    .withMessage("Reason must be a string"),
  body("description")
    .optional()
    .isLength({ min: 1, max: 500 })
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
    .isLength({ min: 1, max: 500 })
    .withMessage("Resolution notes must be between 10 and 500 characters"),
];

export const getRideReport = [
  param("id")
    .isMongoId()
    .withMessage("Report ID must be a valid MongoDB ID"),
];