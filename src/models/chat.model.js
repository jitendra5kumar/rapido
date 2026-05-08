import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      default: null,
    },

    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        senderType: {
          type: String,
          enum: ["user", "driver"],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        readAt: Date,
      },
    ],

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },

    lastMessage: String,
    lastMessageTime: Date,
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup
chatSchema.index({ driverId: 1, userId: 1 }, { unique: true });
chatSchema.index({ rideId: 1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
