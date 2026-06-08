import { body, param } from "express-validator";

export const createSubAdminSetting = [
  body("city").optional().isString().withMessage("City must be a string"),
  body("userId").optional().isMongoId().withMessage("User ID must be a valid Mongo ID"),
  body("supportEmail").optional().isEmail().withMessage("Support email must be valid"),
  body("supportPhone").optional().isString().withMessage("Support phone must be a string"),
  body("contactAddress").optional().isString().withMessage("Contact address must be a string"),
  body("socialMedia").optional().isObject().withMessage("Social media must be an object"),
  body("socialMedia.facebook").optional().isString().withMessage("Facebook link must be a string"),
  body("socialMedia.twitter").optional().isString().withMessage("Twitter link must be a string"),
  body("socialMedia.instagram").optional().isString().withMessage("Instagram link must be a string"),
  body("socialMedia.linkedin").optional().isString().withMessage("LinkedIn link must be a string"),
  body("razorpayKey").optional().isString().withMessage("Razorpay key must be a string"),
];

export const getSubAdminSettingByCity = [
  param("city").trim().notEmpty().withMessage("City is required"),
];
