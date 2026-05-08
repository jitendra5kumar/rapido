import { sendNotificationByRole } from "../services/notification.service.js";
import admin from "../config/firebase.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

// Send notification to sub-admin about new chat message
export const notifySubAdminChatMessage = async (chatId, senderType, senderName, messagePreview) => {
  try {
    // Get chat details
    const chat = await Chat.findById(chatId)
      .populate("driverId userId", "name email phone");

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Get admin/sub-admin users
    const admins = await User.find({
      role: "admin",
      status: "active",
      fcm_token: { $exists: true, $ne: null },
    }).select("_id fcm_token name");

    if (!admins.length) {
      console.log("No active admin users found for chat notification");
      return;
    }

    const tokens = admins
      .map((admin) => admin.fcm_token)
      .filter(Boolean);

    // Determine sender and receiver details
    let senderDetails = {};
    let receiverDetails = {};

    if (senderType === "driver") {
      senderDetails = {
        name: chat.driverId?.name || "Driver",
        id: chat.driverId?._id,
      };
      receiverDetails = {
        name: chat.userId?.name || "User",
        id: chat.userId?._id,
      };
    } else {
      senderDetails = {
        name: chat.userId?.name || "User",
        id: chat.userId?._id,
      };
      receiverDetails = {
        name: chat.driverId?.name || "Driver",
        id: chat.driverId?._id,
      };
    }

    const notificationTitle = `New Chat Message from ${senderDetails.name}`;
    const notificationBody = `To: ${receiverDetails.name} - "${messagePreview.substring(0, 50)}..."`;

    // Send FCM notification
    const message = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
      data: {
        type: "chat_notification",
        chatId: chatId.toString(),
        senderId: senderDetails.id?.toString() || "",
        senderType,
        senderName: senderDetails.name,
      },
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);

    console.log(
      `Chat notification sent to ${response.successCount} admins, ${response.failureCount} failed`
    );

    // Store notification in database for chat dashboard
    try {
      // This can be extended to store in a notifications collection if needed
      // For now, we're just logging to console
      console.log("Chat message notification:", {
        chatId,
        senderType,
        senderName,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("Failed to store chat notification:", err.message);
    }

    return response;
  } catch (error) {
    console.error("Failed to notify admins about chat:", error.message);
    // Don't throw - chat should succeed even if notification fails
  }
};

// Get all chat notifications for admin dashboard
export const getChatNotifications = async (adminId, page = 1, limit = 20) => {
  try {
    // Get all chats with recent messages
    const chats = await Chat.find({ status: "active" })
      .populate("driverId userId", "name email phone")
      .sort({ lastMessageTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Chat.countDocuments({ status: "active" });

    return {
      chats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get chat notifications: ${error.message}`);
  }
};

// Send reply from sub-admin to user/driver
export const sendSubAdminReply = async (chatId, adminId, replyMessage) => {
  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Add admin message to chat
    chat.messages.push({
      senderId: adminId,
      senderType: "admin",
      message: replyMessage,
      timestamp: new Date(),
    });

    chat.lastMessage = replyMessage;
    chat.lastMessageTime = new Date();

    await chat.save();

    // Emit real-time notification via socket if available
    if (global.io) {
      const roomName = `chat_${chatId}`;
      global.io.to(roomName).emit("admin_reply", {
        adminId,
        message: replyMessage,
        timestamp: new Date(),
        senderType: "admin",
      });
    }

    // Send notification to both user and driver
    const notificationTitle = "Admin Reply";
    const notificationBody = `Admin replied: "${replyMessage.substring(0, 50)}..."`;

    await sendNotificationByRole("user", notificationTitle, notificationBody);
    await sendNotificationByRole("driver", notificationTitle, notificationBody);

    return chat;
  } catch (error) {
    throw new Error(`Failed to send admin reply: ${error.message}`);
  }
};
