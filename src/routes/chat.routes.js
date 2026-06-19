import express from "express";
import * as chatController from "../controllers/chat.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Start Chat
router.post(
  "/start",
  chatController.startChat
);

// Get Chat History
router.get(
  "/:chatId/history",
  chatController.getChatHistory
);

// Get User Chats
router.get(
  "/user/:userId",
  chatController.getUserChats
);

router.post("/send", chatController.sendMessage);


// Mark Messages Read
router.put(
  "/:chatId/read",
  chatController.markAsRead
);

// Close Chat
router.put(
  "/:chatId/close",
  chatController.closeChat
);

// Get Unread Count
router.get(
  "/:userId/unread",
  chatController.getUnreadCount
);

export default router;