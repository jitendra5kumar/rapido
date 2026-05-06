import admin from "../config/firebase.js";
import User from "../models/user.model.js";

export const sendNotificationByRole = async (role, title, body) => {
  let roles = [];

  if (role === "both") {
    roles = ["rider", "driver"];
  } else {
    roles = [role];
  }

  // 🔥 USE FCM TOKEN (NOT firebase_uid)
  const users = await User.find({
    role: { $in: roles },
    fcm_token: { $exists: true, $ne: null },
  });

  const tokens = users
    .map((u) => u.fcm_token)
    .filter(Boolean);

  if (!tokens.length) {
    throw new Error("No FCM tokens found");
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