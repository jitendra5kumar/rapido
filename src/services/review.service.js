import Review from "../models/review.model.js";
import User from "../models/user.model.js";

export const createReviewService = async (data) => {
  const { riderId, driverId, rating, review, targetType } = data;

  // check already reviewed
  const existingReview = await Review.findOne({
    riderId,
    driverId,
    targetType,
  });

  if (existingReview) {
    throw new Error(`You already rated this ${targetType}`);
  }

  const newReview = await Review.create({
    riderId,
    driverId,
    rating,
    review,
    targetType,
  });

  // ⭐ Update average rating of the target user
  const targetUserId = targetType === "driver" ? driverId : riderId;

  const stats = await Review.aggregate([
    {
      $match: {
        ...(targetType === "driver" ? { driverId: newReview.driverId } : { riderId: newReview.riderId }),
        targetType,
      },
    },
    {
      $group: {
        _id: targetType === "driver" ? "$driverId" : "$riderId",
        averageRating: {
          $avg: "$rating",
        },
        totalReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  if (stats.length > 0) {
    const avgRating = Number(stats[0].averageRating.toFixed(1));
    await User.findByIdAndUpdate(targetUserId, {
      rating: avgRating,
      average_rating: avgRating,
      total_reviews: stats[0].totalReviews,
    });
  }

  return newReview;
};

export const getDriverReviewsService = async (driverId) => {
  return await Review.find({ driverId, targetType: "driver" })
    .populate("riderId", "name profile_image_id")
    .sort({ createdAt: -1 });
};

export const getRiderReviewsService = async (riderId) => {
  return await Review.find({ riderId, targetType: "rider" })
    .populate("driverId", "name profile_image_id")
    .sort({ createdAt: -1 });
};