import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    targetType: {
      type: String,
      required: true,
      default: "driver",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🚫 Unique index for rider/driver pair per rating direction
reviewSchema.index(
  { riderId: 1, driverId: 1, targetType: 1 },
  { unique: true }
);



const Review = mongoose.model("Review", reviewSchema);

export default Review;