import Chat from "../models/chat.model.js";

export const getOrCreateChat = async (
  senderId,
  senderRole,
  receiverId,
  receiverRole
) => {
  try {
    let chat = await Chat.findOne({
      participants: {
        $all: [
          { $elemMatch: { userId: senderId } },
          { $elemMatch: { userId: receiverId } },
        ],
      },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [
          {
            userId: senderId,
            role: senderRole,
          },
          {
            userId: receiverId,
            role: receiverRole,
          },
        ],
      });
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
    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    chat.messages.push({
      senderId,
      senderType,
      message,
      timestamp: new Date(),
    });

    chat.lastMessage = message;
    chat.lastMessageTime = new Date();
    chat.unreadCount += 1;

    if (rideId && !chat.rideId) {
      chat.rideId = rideId;
    }

    await chat.save();

    return chat;
  } catch (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }
};

export const getChatHistory = async (
  chatId,
  page = 1,
  limit = 50
) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate("participants.userId", "name email phone role")
      .lean();

    if (!chat) {
      throw new Error("Chat not found");
    }

    const totalMessages = chat.messages.length;

    const startIndex = Math.max(
      0,
      totalMessages - page * limit
    );

    const endIndex = Math.max(
      0,
      totalMessages - (page - 1) * limit
    );

    const messages = chat.messages
      .slice(startIndex, endIndex)
      .reverse();

    return {
      chat: {
        ...chat,
        messages,
      },
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to get chat history: ${error.message}`
    );
  }
};

export const markMessagesAsRead = async (
  chatId,
  userId
) => {
  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    let updated = false;

    chat.messages.forEach((msg) => {
      if (
        msg.senderId.toString() !== userId &&
        !msg.isRead
      ) {
        msg.isRead = true;
        msg.readAt = new Date();
        updated = true;
      }
    });

    if (updated) {
      chat.unreadCount = 0;
      await chat.save();
    }

    return chat;
  } catch (error) {
    throw new Error(
      `Failed to mark messages as read: ${error.message}`
    );
  }
};

export const getUserChats = async (userId) => {
  try {
    const chats = await Chat.find({
      "participants.userId": userId,
    })
      .populate(
        "participants.userId",
        "name email phone role"
      )
      .sort({ lastMessageTime: -1 })
      .lean();

    return chats;
  } catch (error) {
    throw new Error(
      `Failed to get user chats: ${error.message}`
    );
  }
};

export const closeChat = async (chatId) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        status: "closed",
      },
      {
        new: true,
      }
    );

    return chat;
  } catch (error) {
    throw new Error(
      `Failed to close chat: ${error.message}`
    );
  }
};

export const sendMessage = async (
  chatId,
  senderId,
  senderRole,
  message
) => {
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        messages: {
          senderId,
          senderRole,
          message,
          timestamp: new Date(),
        },
      },
      lastMessage: message,
      lastMessageTime: new Date(),
    },
    { new: true }
  );

  return chat;
};