import AdminChat from "../models/adminChat.model.js";
import User from "../models/user.model.js";

export const getOrCreateAdminChat = async (adminId, subAdminId) => {
  try {
    let chat = await AdminChat.findOne({
      $or: [
        { adminId, subAdminId },
        { adminId: subAdminId, subAdminId: adminId },
      ],
    });

    if (!chat) {
      // Ensure both are valid admin/sub-admin users
      const admin = await User.findById(adminId);
      const subAdmin = await User.findById(subAdminId);

      if (!admin || !subAdmin) {
        throw new Error("Admin or SubAdmin not found");
      }

      if (admin.role !== "admin" || subAdmin.role !== "admin") {
        throw new Error("Both users must have admin role");
      }

      // Create new chat with proper roles
      const isInitiatorAdmin = admin.role === "admin";
      chat = new AdminChat({
        adminId: isInitiatorAdmin ? adminId : subAdminId,
        subAdminId: isInitiatorAdmin ? subAdminId : adminId,
      });

      await chat.save();
    }

    return chat;
  } catch (error) {
    throw new Error(`Failed to get or create admin chat: ${error.message}`);
  }
};

export const saveAdminMessage = async (
  chatId,
  senderId,
  senderType,
  message
) => {
  try {
    const chat = await AdminChat.findByIdAndUpdate(
      chatId,
      {
        $push: {
          messages: {
            senderId,
            senderType,
            message,
            timestamp: new Date(),
          },
        },
        lastMessage: message,
        lastMessageTime: new Date(),
      },
      { new: true }
    );

    if (!chat) {
      throw new Error("Chat not found");
    }

    return chat;
  } catch (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }
};

export const getAdminChatHistory = async (chatId, page = 1, limit = 50) => {
  try {
    const chat = await AdminChat.findById(chatId)
      .populate("adminId", "name email phone")
      .populate("subAdminId", "name email phone")
      .lean();

    if (!chat) {
      throw new Error("Chat not found");
    }

    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - page * limit);
    const endIndex = Math.max(0, totalMessages - (page - 1) * limit);

    const messages = chat.messages.slice(startIndex, endIndex).reverse();

    return {
      chat: {
        ...chat,
        messages,
      },
      pagination: {
        page,
        limit,
        total: totalMessages,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get chat history: ${error.message}`);
  }
};

export const getAdminChats = async (userId) => {
  try {
    // Get all chats where user is either admin or subAdmin
    const chats = await AdminChat.find({
      $or: [{ adminId: userId }, { subAdminId: userId }],
      status: "active",
    })
      .populate("adminId", "name email phone")
      .populate("subAdminId", "name email phone")
      .sort({ lastMessageTime: -1 })
      .lean();

    return chats;
  } catch (error) {
    throw new Error(`Failed to get admin chats: ${error.message}`);
  }
};

export const markAdminMessagesAsRead = async (chatId, userId) => {
  try {
    const chat = await AdminChat.findByIdAndUpdate(
      chatId,
      {
        $set: {
          "messages.$[elem].isRead": true,
          "messages.$[elem].readAt": new Date(),
        },
        unreadCount: 0,
      },
      {
        arrayFilters: [
          {
            "elem.senderId": { $ne: userId },
            "elem.isRead": false,
          },
        ],
        new: true,
      }
    );

    return chat;
  } catch (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`);
  }
};

export const archiveAdminChat = async (chatId) => {
  try {
    const chat = await AdminChat.findByIdAndUpdate(
      chatId,
      { status: "archived" },
      { new: true }
    );

    return chat;
  } catch (error) {
    throw new Error(`Failed to archive chat: ${error.message}`);
  }
};

export const getAdminUnreadCount = async (userId) => {
  try {
    const chats = await AdminChat.find({
      $or: [{ adminId: userId }, { subAdminId: userId }],
      status: "active",
    }).select("unreadCount");

    const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

    return {
      totalUnread,
      chats,
    };
  } catch (error) {
    throw new Error(`Failed to get unread count: ${error.message}`);
  }
};
