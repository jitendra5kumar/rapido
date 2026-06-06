import * as chatService from "../services/chat.service.js";
import { notifySubAdminChatMessage } from "../services/chat-notification.service.js";

const activeSockets = {}; // Store socket connections { userId: socketId, ... }

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);

    // User joins a chat room
    socket.on("join_chat", (data) => {
      const { chatId, userId, role } = data;
      const roomName = `chat_${chatId}`;

      socket.join(roomName);
      activeSockets[userId] = socket.id;

      console.log(`${role} ${userId} joined chat room: ${roomName}`);

      // Notify other user that this user is online
      socket.to(roomName).emit("user_online", {
        userId,
        role,
        timestamp: new Date(),
      });
    });

    // Handle new message
    socket.on("send_message", async (data) => {
      try {
        const { chatId, senderId, senderType, message, rideId } = data;
        const roomName = `chat_${chatId}`;
console.log(`Received message in chat ${chatId} from ${senderType} ${senderId}: ${message}`);
        // Save message to database
        const updatedChat = await chatService.saveMessage(
          chatId,
          senderId,
          senderType,
          message,
          rideId
        );

        // Emit message to both users in the chat
        io.to(roomName).emit("receive_message", {
          senderId,
          senderType,
          message,
          timestamp: new Date(),
          chatId,
        });

        // Update unread count for other user
        const otherUser =
          senderType === "driver" ? updatedChat.userId : updatedChat.driverId;
        socket.to(roomName).emit("unread_update", {
          unreadCount: updatedChat.unreadCount + 1,
        });

        // 🔔 Notify sub-admin about new message
        const senderDisplayName =
          senderType === "driver" ? "Driver" : "User";
        await notifySubAdminChatMessage(
          chatId,
          senderType,
          senderDisplayName,
          message
        );

      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", {
          message: "Failed to send message",
        });
      }
    });

    // Mark messages as read
    socket.on("mark_as_read", async (data) => {
      try {
        const { chatId, userId } = data;
        const roomName = `chat_${chatId}`;
console.log(`Marking messages as read in chat ${chatId} for user ${userId}`);
        await chatService.markMessagesAsRead(chatId, userId);

        // Notify other user that messages are read
        socket.to(roomName).emit("messages_read", {
          userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error marking as read:", error);
        socket.emit("error", {
          message: "Failed to mark messages as read",
        });
      }
    });

    // Typing indicator
    socket.on("typing", (data) => {
      const { chatId, userId, role } = data;
      const roomName = `chat_${chatId}`;
console.log(`User ${userId} (${role}) is typing in chat ${chatId}`);
      socket.to(roomName).emit("user_typing", {
        userId,
        role,
      });
    });

    // Stop typing
    socket.on("stop_typing", (data) => {
      const { chatId, userId } = data;
      const roomName = `chat_${chatId}`;

      socket.to(roomName).emit("user_stop_typing", {
        userId,
      });
    });

    // Close chat
    socket.on("close_chat", async (data) => {
      try {
        const { chatId, userId } = data;
        const roomName = `chat_${chatId}`;

        await chatService.closeChat(chatId);

        io.to(roomName).emit("chat_closed", {
          userId,
          timestamp: new Date(),
        });

        socket.leave(roomName);
      } catch (error) {
        console.error("Error closing chat:", error);
        socket.emit("error", {
          message: "Failed to close chat",
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      // Remove user from active sockets
      for (const [userId, socketId] of Object.entries(activeSockets)) {
        if (socketId === socket.id) {
          delete activeSockets[userId];
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });

    // Verify user connection
    socket.on("verify_connection", (data) => {
      const { userId } = data;
      socket.emit("connection_verified", {
        userId,
        socketId: socket.id,
        timestamp: new Date(),
      });
    });
  });
};

export const getActiveSocket = (userId) => {
  return activeSockets[userId];
};

export const isUserOnline = (userId) => {
  return !!activeSockets[userId];
};
