import * as chatService from "../services/chat.service.js";
import Chat from "../models/chat.model.js";

export const startChat = async (req, res) => {
  try {
    const senderId = req.user.id

    const { senderRole, receiverId, receiverRole } = req.body;

    if (
      !receiverId ||
      !senderRole ||
      !receiverRole
    ) {
      return res.status(400).json({
        success: false,
        message: "Sender and receiver details are required",
      });
    }


    const chat = await chatService.getOrCreateChat(
      senderId,
      senderRole,
      receiverId,
      receiverRole
    );

    return res.status(200).json({
      success: true,
      message: "Chat started successfully",
      data: chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await chatService.getChatHistory(
      chatId,
      Number(page),
      Number(limit)
    );

    return res.status(200).json({
      success: true,
      message: "Chat history fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await chatService.getUserChats(userId);

    return res.status(200).json({
      success: true,
      message: "Chats fetched successfully",
      data: chats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const chat = await chatService.markMessagesAsRead(
      chatId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      data: chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await chatService.closeChat(chatId);

    return res.status(200).json({
      success: true,
      message: "Chat closed successfully",
      data: chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({
      "participants.userId": userId,
      status: "active",
    }).select("unreadCount");

    const totalUnread = chats.reduce(
      (sum, chat) => sum + (chat.unreadCount || 0),
      0
    );

    return res.status(200).json({
      success: true,
      message: "Unread count fetched successfully",
      data: {
        totalUnread,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId, message } = req.body;

    const senderId = req.user.id;
    const senderRole = req.user.role;

    const chat = await chatService.sendMessage(
      chatId,
      senderId,
      senderRole,
      message
    );

    return res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};