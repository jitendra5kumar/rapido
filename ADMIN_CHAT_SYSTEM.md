# 👥 Admin-to-SubAdmin Chat System

## Overview
This system enables real-time communication exclusively between admins and sub-admins. Only users with admin role can access this chat system.

---

## 📁 File Structure

```
src/
├── models/
│   └── adminChat.model.js         # Admin chat schema
├── services/
│   └── adminChat.service.js       # Admin chat business logic
├── controllers/
│   └── adminChat.controller.js    # Admin chat API endpoints
├── routes/
│   └── adminChat.routes.js        # Admin chat routes
└── sockets/
    └── adminChat.socket.js        # Real-time socket events
```

---

## 🗄️ Database Schema

### AdminChat Model
```javascript
{
  adminId: ObjectId,               // Reference to Admin User
  subAdminId: ObjectId,            // Reference to SubAdmin User
  messages: [
    {
      senderId: ObjectId,          // Admin who sent message
      senderType: "admin|subAdmin",
      message: String,
      timestamp: Date,
      isRead: Boolean,
      readAt: Date
    }
  ],
  status: "active|archived",
  lastMessage: String,
  lastMessageTime: Date,
  unreadCount: Number,
  timestamps: true
}
```

**Unique Index**: One chat per admin-subAdmin pair

---

## 🔌 Socket.io Events

### Client Events (Admin/SubAdmin Sends)

#### 1. **admin:join_chat** - Join chat room
```javascript
socket.emit('admin:join_chat', {
  chatId: "chat_id_here",
  userId: "admin_id_here",
  role: "admin"
});
```

#### 2. **admin:send_message** - Send message
```javascript
socket.emit('admin:send_message', {
  chatId: "chat_id_here",
  senderId: "admin_id_here",
  senderType: "admin",
  message: "Hello SubAdmin!"
});
```

#### 3. **admin:mark_as_read** - Mark messages as read
```javascript
socket.emit('admin:mark_as_read', {
  chatId: "chat_id_here",
  userId: "admin_id_here"
});
```

#### 4. **admin:typing** - Typing indicator
```javascript
socket.emit('admin:typing', {
  chatId: "chat_id_here",
  userId: "admin_id_here"
});
```

#### 5. **admin:stop_typing** - Stop typing
```javascript
socket.emit('admin:stop_typing', {
  chatId: "chat_id_here",
  userId: "admin_id_here"
});
```

#### 6. **admin:archive_chat** - Archive conversation
```javascript
socket.emit('admin:archive_chat', {
  chatId: "chat_id_here",
  userId: "admin_id_here"
});
```

#### 7. **admin:ping** - Health check
```javascript
socket.emit('admin:ping');
```

### Server Events (Admin/SubAdmin Receives)

#### 1. **admin:receive_message** - New message
```javascript
{
  senderId: "admin_id",
  senderType: "admin",
  message: "Hello!",
  timestamp: Date,
  chatId: "chat_id"
}
```

#### 2. **admin:user_online** - User came online
```javascript
{
  userId: "admin_id",
  timestamp: Date
}
```

#### 3. **admin:messages_read** - Messages marked as read
```javascript
{
  userId: "admin_id",
  timestamp: Date
}
```

#### 4. **admin:user_typing** - User typing
```javascript
{
  userId: "admin_id"
}
```

#### 5. **admin:user_stop_typing** - Stop typing
```javascript
{
  userId: "admin_id"
}
```

#### 6. **admin:chat_archived** - Chat archived
```javascript
{
  userId: "admin_id",
  timestamp: Date
}
```

#### 7. **admin:unread_update** - Unread count changed
```javascript
{
  unreadCount: 5
}
```

#### 8. **admin:pong** - Ping response
```javascript
{
  timestamp: Date
}
```

---

## 🌐 REST API Endpoints

### Base URL
```
/api/admin-chat
```

### Endpoints

#### 1. **POST /start** - Start Chat
Start conversation between two admins
```
POST /api/admin-chat/start
Authorization: Bearer {token}

Body:
{
  "adminId": "admin_id_1",
  "subAdminId": "admin_id_2"
}

Response:
{
  "success": true,
  "message": "Admin chat started successfully",
  "data": { AdminChat object }
}
```

#### 2. **GET /list** - Get All Chats
Fetch all chats for current admin
```
GET /api/admin-chat/list
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Admin chats fetched successfully",
  "data": [ { AdminChat objects sorted by lastMessageTime } ]
}
```

#### 3. **GET /:chatId/history** - Get Chat History
Fetch messages with pagination
```
GET /api/admin-chat/{chatId}/history?page=1&limit=50
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Chat history fetched successfully",
  "data": {
    "chat": { AdminChat object with messages },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100
    }
  }
}
```

#### 4. **PUT /:chatId/read** - Mark as Read
Mark unread messages as read
```
PUT /api/admin-chat/{chatId}/read
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Messages marked as read",
  "data": { AdminChat object }
}
```

#### 5. **PUT /:chatId/archive** - Archive Chat
Archive a conversation
```
PUT /api/admin-chat/{chatId}/archive
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Chat archived successfully",
  "data": { AdminChat object }
}
```

#### 6. **GET /unread/count** - Get Unread Count
Get total unread messages
```
GET /api/admin-chat/unread/count
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Unread count fetched successfully",
  "data": {
    "totalUnread": 5,
    "chats": [ { Chats with unreadCount } ]
  }
}
```

---

## 📱 Frontend Integration Example

### JavaScript/React
```javascript
import io from 'socket.io-client';

// Connect
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Join chat with another admin
socket.emit('admin:join_chat', {
  chatId: 'admin_chat_123',
  userId: 'admin_id_456',
  role: 'admin'
});

// Send message
socket.emit('admin:send_message', {
  chatId: 'admin_chat_123',
  senderId: 'admin_id_456',
  senderType: 'admin',
  message: 'Need to discuss driver policy'
});

// Listen for messages
socket.on('admin:receive_message', (data) => {
  console.log(`Message from ${data.senderId}: ${data.message}`);
});

// Show typing indicator
socket.emit('admin:typing', {
  chatId: 'admin_chat_123',
  userId: 'admin_id_456'
});

socket.on('admin:user_typing', (data) => {
  console.log(`${data.userId} is typing...`);
});

// Mark as read
socket.emit('admin:mark_as_read', {
  chatId: 'admin_chat_123',
  userId: 'admin_id_456'
});

// Archive chat
socket.emit('admin:archive_chat', {
  chatId: 'admin_chat_123',
  userId: 'admin_id_456'
});
```

---

## 🔐 Security Features

1. **Authentication Required** - All endpoints require JWT token
2. **Admin-Only Access** - Only users with "admin" role can use this system
3. **User Validation** - Verifies both participants are admins
4. **Participant Verification** - Users can only chat with other admins
5. **Unique Chat Index** - Prevents duplicate conversations
6. **Message Encryption Ready** - Database structure supports encrypted messages
7. **Read Receipts** - Track when messages are read
8. **Archive Feature** - Soft delete chats without losing history

---

## ⚙️ Configuration

Uses existing infrastructure:
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Authentication**: JWT tokens
- **Redis**: Optional caching

---

## 🚀 Usage Workflow

### Starting Admin Chat
1. Admin clicks "Chat" with another admin
2. Frontend calls `POST /api/admin-chat/start`
3. Backend returns chat ID
4. Frontend joins socket room: `admin:join_chat`

### Messaging Flow
1. Admin types message
2. Emit `admin:typing` event
3. Other admin sees "is typing..."
4. Send message via `admin:send_message`
5. Backend saves to database
6. Other admin gets `admin:receive_message` event

### Reading Messages
1. Admin opens chat
2. Socket emits `admin:mark_as_read`
3. Unread count updates in database
4. Other admin sees `admin:messages_read` event

### Archiving
1. Admin archives chat
2. Chat status changes to "archived"
3. Other admin notified via `admin:chat_archived`
4. Chat disappears from active list

---

## 📊 Performance Considerations

1. **One-to-One Index** - Fast lookup of chat between two admins
2. **Message Pagination** - Default limit 50 messages per page
3. **Unread Count Cache** - Stored in document for quick access
4. **Socket Rooms** - Messages isolated to specific chat rooms
5. **Active Socket Tracking** - Know who's online

---

## 🔄 Future Enhancements

1. Message search
2. Bulk export chats
3. Message reactions/emojis
4. Message editing/deletion
5. File attachments
6. Bot notifications
7. Scheduled messages
8. Chat templates
9. Admin groups (more than 2 people)
10. Chat priorities (urgent/normal)

---

## 🐛 Error Handling

All endpoints return:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common errors:
- `You can only chat with other admins`
- `Admin or SubAdmin not found`
- `Both users must have admin role`
- `Chat not found`
- `Unauthorized`

---

## 📞 Support

Refer to:
- Socket.io docs: https://socket.io/docs/
- Mongoose: https://mongoosejs.com/docs/
