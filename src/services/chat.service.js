import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Driver from "../models/driver.model.js";
import redis from "../cache/redisClient.js";

export const getOrCreateChat = async (driverId, userId) => {
  try {
    const participantKey = `chat:participant:${driverId}:${userId}`;
    let chatId = await redis.get(participantKey);

    if (!chatId) {
      chatId = await redis.incr('chat:id:next');
      const metaKey = `chat:meta:${chatId}`;
      const now = Date.now();
      await redis.hmset(metaKey, {
        id: chatId,
        driverId,
        userId,
        status: 'open',
        createdAt: now,
        lastMessageTime: now,
        lastMessage: '',
        rideId: '',
      });
      await redis.set(participantKey, chatId);
      await redis.zadd(`user:chats:${userId}`, now, chatId);
      await redis.zadd(`driver:chats:${driverId}`, now, chatId);
      await redis.expire(metaKey, 60 * 60);
      await redis.expire(`chat:messages:${chatId}`, 60 * 60);
    }

    const meta = await redis.hgetall(`chat:meta:${chatId}`);
    return { ...meta, id: chatId };
  } catch (error) {
    throw new Error(`Failed to get or create chat: ${error.message}`);
  }
};

export const saveMessage = async (
  chatId,
  senderId,
  senderType,
  message,
  rideId = null
) => {
  try {
    const msg = {
      senderId,
      senderType,
      message,
      timestamp: Date.now(),
      isRead: false,
    };

    const messagesKey = `chat:messages:${chatId}`;
    await redis.rpush(messagesKey, JSON.stringify(msg));

    const metaKey = `chat:meta:${chatId}`;
    const now = Date.now();
    await redis.hset(metaKey, 'lastMessage', message, 'lastMessageTime', now);

    if (rideId) await redis.hset(metaKey, 'rideId', rideId);

    try {
      const meta = await redis.hgetall(metaKey);
      if (meta.userId) await redis.zadd(`user:chats:${meta.userId}`, now, chatId);
      if (meta.driverId) await redis.zadd(`driver:chats:${meta.driverId}`, now, chatId);
    } catch (e) {
      console.error('Redis update sorted sets error (saveMessage):', e.message);
    }

    try {
      await redis.expire(metaKey, 60 * 60);
      await redis.expire(messagesKey, 60 * 60);
    } catch (e) {
      console.error('Redis expire error (saveMessage):', e.message);
    }

    const meta = await redis.hgetall(metaKey);
    return { ...meta, id: chatId };
  } catch (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }
};

export const getChatHistory = async (chatId, page = 1, limit = 50) => {
  try {
    const messagesKey = `chat:messages:${chatId}`;
    const totalMessages = await redis.llen(messagesKey);
    if (totalMessages === 0) {
      const meta = await redis.hgetall(`chat:meta:${chatId}`);
      if (!meta || Object.keys(meta).length === 0) throw new Error('Chat not found');
      return {
        chat: { ...meta, messages: [] },
        pagination: { page, limit, total: 0 },
      };
    }

    const startIndex = Math.max(0, totalMessages - page * limit);
    const endIndex = Math.max(0, totalMessages - (page - 1) * limit) - 1;

    const msgs = await redis.lrange(messagesKey, startIndex, endIndex);
    const messages = msgs.map((m) => JSON.parse(m)).reverse();

    const meta = await redis.hgetall(`chat:meta:${chatId}`);

    return {
      chat: { ...meta, messages },
      pagination: { page, limit, total: totalMessages },
    };
  } catch (error) {
    throw new Error(`Failed to get chat history: ${error.message}`);
  }
};

export const markMessagesAsRead = async (chatId, userId) => {
  try {
    const messagesKey = `chat:messages:${chatId}`;
    const msgs = await redis.lrange(messagesKey, 0, -1);
    if (!msgs || msgs.length === 0) return null;
    const updated = msgs.map((m) => {
      const obj = JSON.parse(m);
      if (obj.senderId !== userId && !obj.isRead) {
        obj.isRead = true;
        obj.readAt = Date.now();
      }
      return JSON.stringify(obj);
    });

    const multi = redis.multi();
    multi.del(messagesKey);
    if (updated.length) multi.rpush(messagesKey, ...updated);
    await multi.exec();

    try {
      await redis.hset(`chat:meta:${chatId}`, 'unreadCount', 0);
      await redis.expire(`chat:meta:${chatId}`, 60 * 60);
      await redis.expire(messagesKey, 60 * 60);
    } catch (e) {
      console.error('Redis meta update error (markMessagesAsRead):', e.message);
    }

    const meta = await redis.hgetall(`chat:meta:${chatId}`);
    return { ...meta, id: chatId };
  } catch (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`);
  }
};

export const getUserChats = async (userId, role) => {
  try {
    const zkey = role === 'driver' ? `driver:chats:${userId}` : `user:chats:${userId}`;
    const chatIds = await redis.zrevrange(zkey, 0, -1);
    const chats = [];
    for (const id of chatIds) {
      const meta = await redis.hgetall(`chat:meta:${id}`);
      chats.push({ ...meta, id });
    }

    return chats;
  } catch (error) {
    throw new Error(`Failed to get user chats: ${error.message}`);
  }
};

export const closeChat = async (chatId) => {
  try {
    const metaKey = `chat:meta:${chatId}`;
    await redis.hset(metaKey, 'status', 'closed');
    await redis.expire(metaKey, 60 * 60);
    return await redis.hgetall(metaKey);
  } catch (error) {
    throw new Error(`Failed to close chat: ${error.message}`);
  }
};
