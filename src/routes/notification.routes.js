// routes/notification.routes.js

import express from "express";
import { sendRoleNotification } from "../controllers/notification.controller.js";

const router = express.Router();

// 🔹 Send notification by role (rider / driver / both)
router.post("/send-role", sendRoleNotification);

export default router;