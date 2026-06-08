import * as supportChatService from "../services/supportChat.service.js";

export const initSupportChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Support chat socket connected:", socket.id);

    socket.on("support:join_chat", (data) => {
      const { chatId, userId, role } = data;
      const roomName = `support_chat_${chatId}`;

      socket.join(roomName);
      socket.userId = userId;
      socket.role = role;

      console.log(`${role} ${userId} joined support room: ${roomName}`);
      socket.to(roomName).emit("support:user_online", {
        userId,
        role,
        timestamp: new Date(),
      });
    });

    socket.on("support:send_message", async (data) => {
      try {
        const { chatId, senderId, senderType, message } = data;
        const roomName = `support_chat_${chatId}`;

        const updatedChat = await supportChatService.saveSupportMessage(
          chatId,
          senderId,
          senderType,
          message
        );

        io.to(roomName).emit("support:receive_message", {
          chatId,
          senderId,
          senderType,
          message,
          timestamp: new Date(),
        });

        socket.to(roomName).emit("support:unread_update", {
          unreadCount: updatedChat.unreadCount,
        });
      } catch (error) {
        console.error("Support chat send_message error:", error.message);
        socket.emit("support:error", {
          message: "Failed to send support message",
        });
      }
    });
  });
};
