// controllers/notification.controller.js

import { getAllNotificationsService, sendNotificationByRole } from "../services/notification.service.js";

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

export const getAllNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
    } = req.query;

    const data = await getAllNotificationsService({
      page: Number(page),
      limit: Number(limit),
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      ...data,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
