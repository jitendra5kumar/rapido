import express from "express";

import {
  createReview,
  getDriverReviews,
  getRiderReviews,
} from "../controllers/review.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// rider give review or driver give review
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

// get all reviews of rider
router.get(
  "/rider/:riderId",
  getRiderReviews
);

export default router;