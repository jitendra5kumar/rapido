import * as chatService from "../services/chat.service.js";
import Chat from "../models/chat.model.js";

export const startChat = async (req, res) => {
  try {
    const { driverId, userId } = req.body;

    if (!driverId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Driver ID and User ID are required",
      });
    }

    const chat = await chatService.getOrCreateChat(driverId, userId);

    res.json({
      success: true,
      message: "Chat started successfully",
      data: chat,
    });
  } catch (error) {
    res.status(500).json({
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
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      message: "Chat history fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    if (!["user", "driver"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user' or 'driver'",
      });
    }

    const chats = await chatService.getUserChats(userId, role);

    res.json({
      success: true,
      message: "User chats fetched successfully",
      data: chats,
    });
  } catch (error) {
    res.status(500).json({
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

    const chat = await chatService.markMessagesAsRead(chatId, userId);

    res.json({
      success: true,
      message: "Messages marked as read",
      data: chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await chatService.closeChat(chatId);

    res.json({
      success: true,
      message: "Chat closed successfully",
      data: chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const { userId, role } = req.params;

    const query =
      role === "driver"
        ? { driverId: userId }
        : { userId };

 
    res.json({
      success: true,
      message: "Unread count fetched successfully",
    
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
