import { body, param, query } from "express-validator";

export const createCoupon = [
  body("title")
    .notEmpty()
    .withMessage("Coupon title is required"),
  body("code")
    .notEmpty()
    .withMessage("Coupon code is required"),
  body("discountType")
    .isIn(["percentage", "fixed"])
    .withMessage("Discount type must be percentage or fixed"),
  body("vehicleId")
    .optional()
    .isMongoId()
    .withMessage("Vehicle ID must be a valid MongoDB ID"),
  body("discountValue")
    .isFloat({ min: 0 })
    .withMessage("Discount value must be a number >= 0"),
  body("minOrderAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum order amount must be a number >= 0"),
  body("maxDiscountAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max discount amount must be a number >= 0"),
  body("usageLimit")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Usage limit must be an integer >= 0"),
  body("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Start date must be a valid date"),
  body("expiryDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Expiry date must be a valid date"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be active or inactive"),
];

export const updateCoupon = [
  param("id")
    .isMongoId()
    .withMessage("Coupon ID must be a valid MongoDB ID"),
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Coupon title cannot be empty"),
  body("code")
    .optional()
    .notEmpty()
    .withMessage("Coupon code cannot be empty"),
  body("discountType")
    .optional()
    .isIn(["percentage", "fixed"])
    .withMessage("Discount type must be percentage or fixed"),
  body("discountValue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount value must be a number >= 0"),
  body("vehicleId")
    .optional()
    .isMongoId()
    .withMessage("Vehicle ID must be a valid MongoDB ID"),
  body("minOrderAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum order amount must be a number >= 0"),
  body("maxDiscountAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max discount amount must be a number >= 0"),
  body("usageLimit")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Usage limit must be an integer >= 0"),
  body("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Start date must be a valid date"),
  body("expiryDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Expiry date must be a valid date"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be active or inactive"),
];

export const getCoupon = [
  param("id")
    .isMongoId()
    .withMessage("Coupon ID must be a valid MongoDB ID"),
];

export const applyCoupon = [
  body("code")
    .notEmpty()
    .withMessage("Coupon code is required"),
  body("orderAmount")
    .isFloat({ min: 0 })
    .withMessage("Order amount must be a number >= 0"),
  body("vehicleId")
    .optional()
    .isMongoId()
    .withMessage("Vehicle ID must be a valid MongoDB ID"),
];