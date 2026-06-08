import express from "express";
import * as supportChatController from "../controllers/supportChat.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/start", supportChatController.startSupportChat);
router.post("/:chatId/message", supportChatController.saveSupportMessage);
router.get("/:chatId/history", supportChatController.getSupportChatHistory);
router.get("/list", supportChatController.getSupportChats);


export default router;
