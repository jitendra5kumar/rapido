import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderType: {
      type: String,
      enum: ["user", "driver", "admin"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        role: {
          type: String,
          enum: ["user", "driver", "admin"],
          required: true,
        },
      },
    ],

    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      default: null,
    },

    messages: [messageSchema],

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageTime: {
      type: Date,
      default: null,
    },

    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Find chats by participant
chatSchema.index({ "participants.userId": 1 });

// Find chats by ride
chatSchema.index({ rideId: 1 });

// Sort latest chats quickly
chatSchema.index({ lastMessageTime: -1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;