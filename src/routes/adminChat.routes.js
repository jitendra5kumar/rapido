import express from "express";
import * as adminChatController from "../controllers/adminChat.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Start or get chat between two admins
router.post("/start", adminChatController.startAdminChat);

// Get all admin chats for current user
router.get("/list", adminChatController.getMyAdminChats);

// Get chat history
router.get(
  "/:chatId/history",
  adminChatController.getAdminChatHistory
);

// Mark messages as read
router.put(
  "/:chatId/read",
  adminChatController.markAdminMessagesAsRead
);

// Archive chat
router.put(
  "/:chatId/archive",
  adminChatController.archiveAdminChat
);

// Get unread count
router.get(
  "/unread/count",
  adminChatController.getAdminUnreadCount
);

export default router;
