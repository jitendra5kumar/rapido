import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema(
  {
 name: {
      type: String,
      required: true,
    },
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
    },
    // 📍 Center point of zone
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    // 📏 Radius of zone in KM
    radiusInKm: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// 🚀 Important for geo queries
zoneSchema.index({ location: '2dsphere' });

export default mongoose.model('Zone', zoneSchema);