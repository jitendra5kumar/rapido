import mongoose from "mongoose";

const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
    },

    type: {
      type: String,
      enum: ["ride", "delivery", "rental"],
      required: true,
    },

    service_category_image_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },

    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    created_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    deleted_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 slug auto generate
serviceCategorySchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

// 🔥 index
serviceCategorySchema.index({ service_id: 1, status: 1 });

export default mongoose.model("ServiceCategory", serviceCategorySchema);