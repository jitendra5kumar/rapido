import Review from "../models/review.model.js";
import User from "../models/user.model.js";

export const createReviewService = async (data) => {
  const { riderId, driverId, rating, review } = data;

  // check already reviewed
  const existingReview = await Review.findOne({
    riderId,
    driverId,
  });

  if (existingReview) {
    throw new Error("You already reviewed this driver");
  }

  const newReview = await Review.create({
    riderId,
    driverId,
    rating,
    review,
  });

  // ⭐ Update driver average rating
  const stats = await Review.aggregate([
    {
      $match: {
        driverId: newReview.driverId,
      },
    },
    {
      $group: {
        _id: "$driverId",
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
    await User.findByIdAndUpdate(driverId, {
      average_rating: Number(
        stats[0].averageRating.toFixed(1)
      ),
      total_reviews: stats[0].totalReviews,
    });
  }

  return newReview;
};

export const getDriverReviewsService = async (
  driverId
) => {
  return await Review.find({ driverId })
    .populate("riderId", "name profile_image_id")
    .sort({ createdAt: -1 });
};

export const getallreviewsService=async()=>{
  return await Review.find({})
  .populate("riderId", "name profile_image_id")
  .populate("driverId", "name profile_image_id")
  .sort({ createdAt: -1 });
}
