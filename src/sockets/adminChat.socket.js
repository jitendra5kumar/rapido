import * as adminChatService from "../services/adminChat.service.js";

const activeAdminSockets = {}; // Store admin socket connections

export const initAdminChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Admin socket connected:", socket.id);

    // Admin joins their chat room
    socket.on("admin:join_chat", (data) => {
      try {
        const { chatId, userId, role } = data;
        const roomName = `admin_chat_${chatId}`;

        socket.join(roomName);
        activeAdminSockets[userId] = socket.id;

        console.log(`Admin ${userId} joined room: ${roomName}`);

        // Notify other admin that this admin is online
        socket.to(roomName).emit("admin:user_online", {
          userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error joining admin chat:", error);
        socket.emit("error", {
          message: "Failed to join chat",
        });
      }
    });

    // Admin sends message
    socket.on("admin:send_message", async (data) => {
      try {
        const { chatId, senderId, senderType, message } = data;
        const roomName = `admin_chat_${chatId}`;

        // Save message to database
        const updatedChat = await adminChatService.saveAdminMessage(
          chatId,
          senderId,
          senderType,
          message
        );

        // Emit message to both admins in the chat
        io.to(roomName).emit("admin:receive_message", {
          senderId,
          senderType,
          message,
          timestamp: new Date(),
          chatId,
        });

        // Update unread count for other admin
        socket.to(roomName).emit("admin:unread_update", {
          unreadCount: updatedChat.unreadCount + 1,
        });

        console.log(`Message sent in chat ${chatId}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", {
          message: "Failed to send message",
        });
      }
    });

    // Mark messages as read
    socket.on("admin:mark_as_read", async (data) => {
      try {
        const { chatId, userId } = data;
        const roomName = `admin_chat_${chatId}`;

        await adminChatService.markAdminMessagesAsRead(chatId, userId);

        // Notify other admin
        socket.to(roomName).emit("admin:messages_read", {
          userId,
          timestamp: new Date(),
        });

        console.log(`Messages marked as read in chat ${chatId}`);
      } catch (error) {
        console.error("Error marking as read:", error);
        socket.emit("error", {
          message: "Failed to mark messages as read",
        });
      }
    });

    // Typing indicator
    socket.on("admin:typing", (data) => {
      try {
        const { chatId, userId } = data;
        const roomName = `admin_chat_${chatId}`;

        socket.to(roomName).emit("admin:user_typing", {
          userId,
        });
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    });

    // Stop typing
    socket.on("admin:stop_typing", (data) => {
      try {
        const { chatId, userId } = data;
        const roomName = `admin_chat_${chatId}`;

        socket.to(roomName).emit("admin:user_stop_typing", {
          userId,
        });
      } catch (error) {
        console.error("Error stopping typing:", error);
      }
    });

    // Archive chat
    socket.on("admin:archive_chat", async (data) => {
      try {
        const { chatId, userId } = data;
        const roomName = `admin_chat_${chatId}`;

        await adminChatService.archiveAdminChat(chatId);

        io.to(roomName).emit("admin:chat_archived", {
          userId,
          timestamp: new Date(),
        });

        socket.leave(roomName);
        console.log(`Chat ${chatId} archived`);
      } catch (error) {
        console.error("Error archiving chat:", error);
        socket.emit("error", {
          message: "Failed to archive chat",
        });
      }
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      // Remove admin from active sockets
      for (const [userId, socketId] of Object.entries(activeAdminSockets)) {
        if (socketId === socket.id) {
          delete activeAdminSockets[userId];
          console.log(`Admin ${userId} disconnected`);
          break;
        }
      }
    });

    // Health check
    socket.on("admin:ping", () => {
      socket.emit("admin:pong", {
        timestamp: new Date(),
      });
    });
  });
};

export const getActiveAdminSocket = (userId) => {
  return activeAdminSockets[userId];
};

export const isAdminOnline = (userId) => {
  return !!activeAdminSockets[userId];
};
