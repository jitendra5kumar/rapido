import * as supportChatService from "../services/supportChat.service.js";
import { asyncHandler } from "../utils/index.js";

export const startSupportChat = asyncHandler(async (req, res) => {
  try {
    const { adminId, userId } = req.body;

   if (!adminId && !userId) {
     return res.status(400).json({
       success: false,
       message: "Admin ID and User ID are required",
     });
   }

    const chat = await supportChatService.getOrCreateSupportChat(adminId, userId);

    return res.json({
      success: true,
      message: "Support chat started successfully",
      data: chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const saveSupportMessage = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const senderId = req.user?._id;

    if (!chatId || !message) {
      return res.status(400).json({
        success: false,
        message: "Chat ID and message are required",
      });
    }

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const senderType = req.user?.role === "user" ? "user" : "admin";
    const chat = await supportChatService.saveSupportMessage(
      chatId,
      senderId,
      senderType,
      message
    );

    return res.json({
      success: true,
      message: "Support message saved successfully",
      data: chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const getSupportChatHistory = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await supportChatService.getSupportChatHistory(
      chatId,
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    return res.json({
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
});

export const getSupportChats = asyncHandler(async (req, res) => {
  try {
    const { role } = req.query;
    const userId = req.user?._id;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user' or 'admin'",
      });
    }

    const chats = await supportChatService.getSupportChats(userId, role);

    return res.json({
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
});
