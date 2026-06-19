import express from "express";

import {
  createReview,
  getDriverReviews,
  getallreviews
} from "../controllers/review.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// rider give review
router.post(
  "/",
  authMiddleware,
  createReview
);

// get all reviews of driver
router.get(
  "/driver/:driverId",
  getDriverReviews
);

// get all reviews
router.get(
  "/",
  getallreviews
);

export default router;