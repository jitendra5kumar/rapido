import { asyncHandler } from "../utils/index.js";
import {
  createReviewService,
  getDriverReviewsService,
  getRiderReviewsService,
} from "../services/review.service.js";

export const createReview = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let {
      driverId,
      riderId,
      rating,
      review,
      targetType,
    } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "rating is required",
      });
    }

    // Determine targetType and target IDs automatically if not specified
    if (!targetType) {
      if (role === "driver") {
        targetType = "rider";
      } else {
        targetType = "driver";
      }
    }

    let actualRiderId;
    let actualDriverId;

    if (targetType === "driver") {
      actualRiderId = userId;
      actualDriverId = driverId;
      if (!actualDriverId) {
        return res.status(400).json({
          success: false,
          message: "driverId is required when rating a driver",
        });
      }
    } else if (targetType === "rider") {
      actualRiderId = riderId;
      actualDriverId = userId;
      if (!actualRiderId) {
        return res.status(400).json({
          success: false,
          message: "riderId is required when rating a rider",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid targetType. Must be 'driver' or 'rider'",
      });
    }

    const data = await createReviewService({
      riderId: actualRiderId,
      driverId: actualDriverId,
      rating,
      review,
      targetType,
    });

    return res.status(201).json({
      success: true,
      message: "Rating added successfully",
      data,
    });
  } catch (error) {
    console.log("ddd",error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const getDriverReviews = asyncHandler(async (req, res) => {
  try {
    const { driverId } = req.params;

    const reviews = await getDriverReviewsService(driverId);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const getRiderReviews = asyncHandler(async (req, res) => {
  try {
    const { riderId } = req.params;

    const reviews = await getRiderReviewsService(riderId);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});