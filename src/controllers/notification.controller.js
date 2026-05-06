// controllers/notification.controller.js

import { sendNotificationByRole } from "../services/notification.service.js";

export const sendRoleNotification = async (req, res) => {
  try {
    const { role, title, body } = req.body;

    const result = await sendNotificationByRole(role, title, body);

    res.json({
      success: true,
      message: "Notification sent successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};