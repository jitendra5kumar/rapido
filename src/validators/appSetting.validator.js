import { body } from "express-validator";

export const createAppSetting = [
  body("firstRideDiscount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("First ride discount must be a number >= 0"),
  body("minWithdraw")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum withdraw amount must be a number >= 0"),
  body("driverMinWallet")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Driver minimum wallet amount must be a number >= 0"),
];