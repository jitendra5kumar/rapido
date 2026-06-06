import mongoose from "mongoose";

const userAdminChatSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

userAdminChatSchema.index({ adminId: 1, userId: 1 }, { unique: true });

const UserAdminChat = mongoose.model("UserAdminChat", userAdminChatSchema);

export default UserAdminChat;
