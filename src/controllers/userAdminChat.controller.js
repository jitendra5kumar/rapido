import * as userAdminChatService from "../services/userAdminChat.service.js";

export const startUserAdminChat = async (req, res) => {
  try {
    const { adminId, userId } = req.body;

    if (!adminId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID and User ID are required",
      });
    }

    const chat = await userAdminChatService.getOrCreateUserAdminChat(adminId, userId);

    return res.json({
      success: true,
      message: "User-admin chat started successfully",
      data: chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserAdminChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await userAdminChatService.getUserAdminChatHistory(
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
};

export const getUserAdminChats = async (req, res) => {
  try {
    const { role } = req.query;
    const userId = req.user?._id;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user' or 'admin'",
      });
    }

    const chats = await userAdminChatService.getUserAdminChats(userId, role);

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
};

export const markUserAdminMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id;

    const chat = await userAdminChatService.markUserAdminMessagesAsRead(chatId, userId);

    return res.json({
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

export const closeUserAdminChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await userAdminChatService.closeUserAdminChat(chatId);

    return res.json({
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
