import express from "express";
import * as chatController from "../controllers/chat.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);
// Start or get chat between driver and user
router.post("/start",  chatController.startChat);

// Get chat history
router.get(
  "/:chatId/history",
  
  chatController.getChatHistory
);

// Get all chats for a user
router.get(
  "/user/:userId",
  
  chatController.getUserChats
);

// Mark messages as read
router.put(
  "/:chatId/read",
  
  chatController.markAsRead
);

// Close chat
router.put(
  "/:chatId/close",
  
  chatController.closeChat
);

// Get unread count
router.get(
  "/:userId/:role/unread",
  
  chatController.getUnreadCount
);

export default router;
