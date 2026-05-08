import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Driver from "../models/driver.model.js";

export const getOrCreateChat = async (driverId, userId) => {
  try {
    let chat = await Chat.findOne({
      driverId,
      userId,
    });

    if (!chat) {
      chat = new Chat({
        driverId,
        userId,
      });
      await chat.save();
    }

    return chat;
  } catch (error) {
    throw new Error(`Failed to get or create chat: ${error.message}`);
  }
};

export const saveMessage = async (
  chatId,
  senderId,
  senderType,
  message,
  rideId = null
) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
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

    if (rideId && !chat.rideId) {
      chat.rideId = rideId;
      await chat.save();
    }

    return chat;
  } catch (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }
};

export const getChatHistory = async (chatId, page = 1, limit = 50) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate("driverId", "userId rcNumber numberPlate")
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
    throw new Error(`Failed to get chat history: ${error.message}`);
  }
};

export const markMessagesAsRead = async (chatId, userId) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
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

export const getUserChats = async (userId, role) => {
  try {
    const query =
      role === "driver"
        ? { driverId: userId }
        : { userId };

    const chats = await Chat.find(query)
      .populate(
        role === "driver" ? "userId" : "driverId",
        "name email phone"
      )
      .sort({ lastMessageTime: -1 })
      .lean();

    return chats;
  } catch (error) {
    throw new Error(`Failed to get user chats: ${error.message}`);
  }
};

export const closeChat = async (chatId) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { status: "closed" },
      { new: true }
    );

    return chat;
  } catch (error) {
    throw new Error(`Failed to close chat: ${error.message}`);
  }
};
