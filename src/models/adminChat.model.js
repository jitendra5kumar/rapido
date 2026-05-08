import mongoose from "mongoose";

const adminChatSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subAdminId: {
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
          enum: ["admin", "subAdmin"],
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
      enum: ["active", "archived"],
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

// Index for quick lookup - one chat per admin-subAdmin pair
adminChatSchema.index({ adminId: 1, subAdminId: 1 }, { unique: true });

const AdminChat = mongoose.model("AdminChat", adminChatSchema);

export default AdminChat;
