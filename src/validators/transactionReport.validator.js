import { body, param } from "express-validator";

export const createTransactionReport = [
  body("transactionId")
    .isMongoId()
    .withMessage("Transaction ID must be a valid MongoDB ID"),
  body("reason")
    .isIn(["wrong_amount", "payment_failed", "duplicate_charge", "refund_issue", "unauthorized", "other"])
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

export const getTransactionReport = [
  param("id")
    .isMongoId()
    .withMessage("Report ID must be a valid MongoDB ID"),
];