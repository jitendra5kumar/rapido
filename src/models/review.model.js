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
  },
  {
    timestamps: true,
  }
);

// 🚫 One rider can review one driver only once
reviewSchema.index(
  { riderId: 1, driverId: 1 },
  { unique: true }
);

// ✅ Validate rider & driver roles
reviewSchema.pre("validate", async function (next) {
  try {
    const User = mongoose.model("User");

    const rider = await User.findById(this.riderId);
    const driver = await User.findById(this.driverId);

    if (!rider) {
      return next(new Error("Rider not found"));
    }

    if (!driver) {
      return next(new Error("Driver not found"));
    }

    if (rider.role !== "rider") {
      return next(new Error("Only riders can give review"));
    }

    if (driver.role !== "driver") {
      return next(new Error("Review can only be given to driver"));
    }

    next();
  } catch (err) {
    next(err);
  }
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;