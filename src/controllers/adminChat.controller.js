import * as adminChatService from "../services/adminChat.service.js";
import { asyncHandler } from "../utils/index.js";

export const startAdminChat = asyncHandler(async (req, res) => {
  try {
    const { adminId, subAdminId } = req.body;
    const currentUserId = req.user?._id;

    // Validate that current user is one of the participants
    if (
      currentUserId.toString() !== adminId &&
      currentUserId.toString() !== subAdminId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only chat with other admins",
      });
    }

    if (!adminId || !subAdminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID and SubAdmin ID are required",
      });
    }

    const chat = await adminChatService.getOrCreateAdminChat(adminId, subAdminId);

    res.json({
      success: true,
      message: "Admin chat started successfully",
      data: chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const getAdminChatHistory = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await adminChatService.getAdminChatHistory(
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
});

export const getMyAdminChats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const chats = await adminChatService.getAdminChats(userId);

    res.json({
      success: true,
      message: "Admin chats fetched successfully",
      data: chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const markAdminMessagesAsRead = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const chat = await adminChatService.markAdminMessagesAsRead(chatId, userId);

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
});

export const archiveAdminChat = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await adminChatService.archiveAdminChat(chatId);

    res.json({
      success: true,
      message: "Chat archived successfully",
      data: chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const getAdminUnreadCount = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await adminChatService.getAdminUnreadCount(userId);

    res.json({
      success: true,
      message: "Unread count fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
