import express from "express";

import { getAllNotifications, sendRoleNotification } from "../controllers/notification.controller.js";
import authMiddleware, { requireRoles } from "../middlewares/auth.middleware.js";
import { rateLimitMiddleware } from "../middlewares/index.js";

const router = express.Router();

// 🔔 Send notification by role (rider / driver / both)
router.post(
  "/send-role",
  authMiddleware,
  rateLimitMiddleware,
  requireRoles('admin', 'sub_admin'),
  sendRoleNotification
);

router.get("/notifications",authMiddleware,getAllNotifications );


export default router;