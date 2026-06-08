import mongoose from "mongoose";

const supportChatSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        senderType: {
          type: String,
          enum: ["user", "admin"],
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

supportChatSchema.index({ adminId: 1, userId: 1 }, { unique: true });

const SupportChat = mongoose.model("SupportChat", supportChatSchema);

export default SupportChat;
