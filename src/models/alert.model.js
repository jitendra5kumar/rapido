import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String, 
    },

    linkUrl: {
      type: String,
      trim: true,
    },
  
    userType: {
      type: String,
      enum: ['ALL', 'USER', 'DRIVER', 'SUB_ADMIN'],
      default: 'ALL',
    },
    // 👇 specific users ko bhejna ho to (optional)
    users:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    isBroadcast: {
      type: Boolean,
      default: true, // ALL type alerts ke liye
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Alert', alertSchema);