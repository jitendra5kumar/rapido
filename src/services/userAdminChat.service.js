import UserAdminChat from "../models/userAdminChat.model.js";
import User from "../models/user.model.js";

export const getOrCreateUserAdminChat = async (adminId, userId) => {
  try {
    let chat = await UserAdminChat.findOne({ adminId, userId });

    if (!chat) {
      const admin = await User.findById(adminId);
      const user = await User.findById(userId);

      if (!admin || !user) {
        throw new Error("Admin or user not found");
      }

      if (!["admin", "sub_admin"].includes(admin.role)) {
        throw new Error("adminId must belong to an admin or sub-admin");
      }

      chat = new UserAdminChat({ adminId, userId });
      await chat.save();
    }

    return chat;
  } catch (error) {
    throw new Error(`Failed to get or create user-admin chat: ${error.message}`);
  }
};

export const saveUserAdminMessage = async (chatId, senderId, senderType, message) => {
  try {
    const chat = await UserAdminChat.findByIdAndUpdate(
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
        $inc: { unreadCount: 1 },
      },
      { new: true }
    );

    if (!chat) {
      throw new Error("Chat not found");
    }

    return chat;
  } catch (error) {
    throw new Error(`Failed to save user-admin message: ${error.message}`);
  }
};

export const getUserAdminChatHistory = async (chatId, page = 1, limit = 50) => {
  try {
    const chat = await UserAdminChat.findById(chatId)
      .populate("adminId", "name email phone")
      .populate("userId", "name email phone")
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
    throw new Error(`Failed to get user-admin chat history: ${error.message}`);
  }
};

export const getUserAdminChats = async (userId, role) => {
  try {
    const query = role === "admin" ? { adminId: userId } : { userId };
    const chats = await UserAdminChat.find(query)
      .populate("adminId", "name email phone")
      .populate("userId", "name email phone")
      .sort({ lastMessageTime: -1 })
      .lean();

    return chats;
  } catch (error) {
    throw new Error(`Failed to get user-admin chats: ${error.message}`);
  }
};

export const markUserAdminMessagesAsRead = async (chatId, userId) => {
  try {
    const chat = await UserAdminChat.findById(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    chat.messages = chat.messages.map((msg) => {
      if (msg.senderId.toString() !== userId.toString() && !msg.isRead) {
        msg.isRead = true;
        msg.readAt = new Date();
      }
      return msg;
    });

    chat.unreadCount = 0;
    await chat.save();

    return chat;
  } catch (error) {
    throw new Error(`Failed to mark user-admin messages as read: ${error.message}`);
  }
};

export const closeUserAdminChat = async (chatId) => {
  try {
    const chat = await UserAdminChat.findByIdAndUpdate(
      chatId,
      { status: "closed" },
      { new: true }
    );

    return chat;
  } catch (error) {
    throw new Error(`Failed to close user-admin chat: ${error.message}`);
  }
};
