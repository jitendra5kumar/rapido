import express from "express";
import * as userAdminChatController from "../controllers/userAdminChat.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/start", userAdminChatController.startUserAdminChat);
router.get("/:chatId/history", userAdminChatController.getUserAdminChatHistory);
router.get("/list", userAdminChatController.getUserAdminChats);
router.put("/:chatId/read", userAdminChatController.markUserAdminMessagesAsRead);
router.put("/:chatId/close", userAdminChatController.closeUserAdminChat);

export default router;
