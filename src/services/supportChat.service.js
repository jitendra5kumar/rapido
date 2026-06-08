import SupportChat from "../models/supportChat.model.js";
import User from "../models/user.model.js";

export const getOrCreateSupportChat = async (adminId, userId) => {
  try {
    let chat = await SupportChat.findOne({ adminId, userId });

    if (!chat) {
      const admin = await User.findById(adminId);
      const user = await User.findById(userId);

      if (!admin && !user) {
        throw new Error("Admin or user not found");
      }

   

      chat = new SupportChat({ adminId, userId });
      await chat.save();
    }

    return chat;
  } catch (error) {
    throw new Error(`Failed to get or create support chat: ${error.message}`);
  }
};

export const saveSupportMessage = async (chatId, senderId, senderType, message) => {
  try {
    const chat = await SupportChat.findByIdAndUpdate(
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
    throw new Error(`Failed to save support message: ${error.message}`);
  }
};

export const getSupportChatHistory = async (chatId, page = 1, limit = 50) => {
  try {
    const chat = await SupportChat.findById(chatId)
      .populate("adminId", "name email phone")
      .populate("userId", "name email phone")
      .lean();

    if (!chat) {
      throw new Error("Chat not found");
    }

    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - page * limit);
    const endIndex = Math.max(0, totalMessages - (page - 1) * limit);

    const messages = chat.messages.slice(startIndex, endIndex);

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
    throw new Error(`Failed to get support chat history: ${error.message}`);
  }
};

export const getSupportChats = async (userId, role) => {
  try {
    const query = role === "admin" ? { adminId: userId } : { userId };
    const chats = await SupportChat.find(query)
      .populate("adminId", "name email phone")
      .populate("userId", "name email phone")
      .sort({ lastMessageTime: -1 })
      .lean();

    return chats;
  } catch (error) {
    throw new Error(`Failed to get support chats: ${error.message}`);
  }
};
