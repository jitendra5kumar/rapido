import {
  createReviewService,
  getallreviewsService,
  getDriverReviewsService,
} from "../services/review.service.js";

export const createReview = async (req, res) => {
  try {
    const riderId = req.user.id;

    const {
      driverId,
      rating,
      review,
    } = req.body;

    if (!driverId || !rating) {
      return res.status(400).json({
        success: false,
        message:
          "driverId and rating are required",
      });
    }

    const data = await createReviewService({
      riderId,
      driverId,
      rating,
      review,
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDriverReviews = async (
  req,
  res
) => {
  try {
    const { driverId } = req.params;

    const reviews =
      await getDriverReviewsService(driverId);

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
};

export const getallreviews=async(req,res)=>{
  try {
    const reviews =
      await getallreviewsService();

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
} 