// services/notification.service.js

import admin from "../config/firebase.js";
import User from "../models/user.model.js";

export const sendNotificationByRole = async (role, title, body) => {
  let roles = [];

  if (role === "both") {
    roles = ["rider", "driver"];
  } else {
    roles = [role];
  }

  const users = await User.find({
    role: { $in: roles },
    firebase_uid: { $exists: true, $ne: null },
  });

  const tokens = users.map((u) => u.firebase_uid);

  if (!tokens.length) {
    throw new Error("No tokens found");
  }

  const response = await admin.messaging().sendMulticast({
    tokens,
    notification: {
      title,
      body,
    },
  });

  return response;
};