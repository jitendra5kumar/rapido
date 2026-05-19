# 💬 Chat System Documentation

## Overview
The chat system enables real-time communication between drivers and users. Admin/sub-admin users receive notifications about new chat messages and can monitor conversations.

---

## 📁 File Structure

```
src/
├── models/
│   └── chat.model.js              # Chat database schema
├── services/
│   ├── chat.service.js            # Chat business logic
│   └── chat-notification.service.js # Admin notifications
├── controllers/
│   └── chat.controller.js         # Chat API endpoints
├── routes/
│   └── chat.routes.js             # Chat routes
└── sockets/
    └── chat.socket.js             # Real-time socket events
```

---


## 🗄️ Database Schema

### Chat Model
```javascript
{
  driverId: ObjectId,              // Reference to Driver
  userId: ObjectId,                // Reference to User
  rideId: ObjectId,                // Associated ride (optional)
  messages: [
    {
      senderId: ObjectId,          // User who sent message
      senderType: "user|driver|admin",
      message: String,
      timestamp: Date,
      isRead: Boolean,
      readAt: Date
    }
  ],
  status: "active|closed",
  lastMessage: String,
  lastMessageTime: Date,
  unreadCount: Number,
  timestamps: true
}
```

---

## 🔌 Socket.io Events

### Client Events (Sent by Client)

#### 1. **join_chat** - Join a chat room
```javascript
socket.emit('join_chat', {
  chatId: "chat_id_here",
  userId: "user_id_here",
  role: "user|driver"
});
```

#### 2. **send_message** - Send a message
```javascript
socket.emit('send_message', {
  chatId: "chat_id_here",
  senderId: "user_id_here",
  senderType: "user|driver",
  message: "Hello there!",
  rideId: "ride_id_here" // optional
});
```

#### 3. **mark_as_read** - Mark messages as read
```javascript
socket.emit('mark_as_read', {
  chatId: "chat_id_here",
  userId: "user_id_here"
});
```

#### 4. **typing** - Indicate user is typing
```javascript
socket.emit('typing', {
  chatId: "chat_id_here",
  userId: "user_id_here",
  role: "user|driver"
});
```

#### 5. **stop_typing** - Stop typing indicator
```javascript
socket.emit('stop_typing', {
  chatId: "chat_id_here",
  userId: "user_id_here"
});
```

#### 6. **close_chat** - Close a chat
```javascript
socket.emit('close_chat', {
  chatId: "chat_id_here",
  userId: "user_id_here"
});
```

### Server Events (Received by Client)

#### 1. **receive_message** - New message received
```javascript
{
  senderId: "user_id",
  senderType: "user|driver",
  message: "Hello!",
  timestamp: Date,
  chatId: "chat_id"
}
```

#### 2. **user_online** - User comes online
```javascript
{
  userId: "user_id",
  role: "user|driver",
  timestamp: Date
}
```

#### 3. **messages_read** - Messages marked as read
```javascript
{
  userId: "user_id",
  timestamp: Date
}
```

#### 4. **user_typing** - User is typing
```javascript
{
  userId: "user_id",
  role: "user|driver"
}
```

#### 5. **user_stop_typing** - User stopped typing
```javascript
{
  userId: "user_id"
}
```

#### 6. **chat_closed** - Chat has been closed
```javascript
{
  userId: "user_id",
  timestamp: Date
}
```

#### 7. **unread_update** - Unread count updated
```javascript
{
  unreadCount: 5
}
```

#### 8. **admin_reply** - Admin/sub-admin sent a reply
```javascript
{
  adminId: "admin_id",
  message: "Admin response",
  timestamp: Date,
  senderType: "admin"
}
```

---

## 🌐 REST API Endpoints

### Base URL
```
/api/chat
```

### Endpoints

#### 1. **POST /start** - Start/Create Chat
Create a new chat between driver and user
```
POST /api/chat/start
Authorization: Bearer {token}

Body:
{
  "driverId": "driver_id",
  "userId": "user_id"
}

Response:
{
  "success": true,
  "message": "Chat started successfully",
  "data": { Chat object }
}
```

#### 2. **GET /:chatId/history** - Get Chat History
Fetch message history with pagination
```
GET /api/chat/{chatId}/history?page=1&limit=50
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Chat history fetched successfully",
  "data": {
    "chat": { Chat object with messages array },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100
    }
  }
}
```

#### 3. **GET /user/:userId** - Get User's Chats
Get all chats for a user/driver
```
GET /api/chat/user/{userId}?role=user
Authorization: Bearer {token}

Query Parameters:
  role: "user" or "driver" (required)

Response:
{
  "success": true,
  "message": "User chats fetched successfully",
  "data": [ { Chat objects } ]
}
```

#### 4. **PUT /:chatId/read** - Mark as Read
Mark all unread messages as read
```
PUT /api/chat/{chatId}/read
Authorization: Bearer {token}

Body:
{
  "userId": "user_id"
}

Response:
{
  "success": true,
  "message": "Messages marked as read",
  "data": { Chat object }
}
```

#### 5. **PUT /:chatId/close** - Close Chat
Close a chat conversation
```
PUT /api/chat/{chatId}/close
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Chat closed successfully",
  "data": { Chat object }
}
```

#### 6. **GET /:userId/:role/unread** - Get Unread Count
Get total unread messages count
```
GET /api/chat/{userId}/{role}/unread
Authorization: Bearer {token}

Path Parameters:
  role: "user" or "driver"

Response:
{
  "success": true,
  "message": "Unread count fetched successfully",
  "data": {
    "totalUnread": 5,
    "chats": [ { Chat objects with unreadCount } ]
  }
}
```

---

## 📱 Frontend Integration Examples

### JavaScript/React
```javascript
import io from 'socket.io-client';

// Connect to socket
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Join chat
socket.emit('join_chat', {
  chatId: 'chat123',
  userId: 'user456',
  role: 'user'
});

// Send message
socket.emit('send_message', {
  chatId: 'chat123',
  senderId: 'user456',
  senderType: 'user',
  message: 'Hello driver!'
});

// Listen for new messages
socket.on('receive_message', (data) => {
  console.log('New message:', data.message);
  // Update UI with new message
});

// Listen for typing
socket.on('user_typing', (data) => {
  console.log(`${data.role} is typing...`);
});

// Mark as read
socket.emit('mark_as_read', {
  chatId: 'chat123',
  userId: 'user456'
});
```

---

## 🔔 Admin/Sub-Admin Features

### Chat Notification Service
The `chat-notification.service.js` handles:
1. Sending FCM notifications to all sub-admins about new chat messages
2. Providing a dashboard view of active chats
3. Allowing sub-admins to send replies to chats

### Admin API Functions

#### Get Chat Dashboard (All Active Chats)
```javascript
import { getChatNotifications } from '../services/chat-notification.service.js';

const chatData = await getChatNotifications(adminId, page=1, limit=20);
```

#### Send Admin Reply
```javascript
import { sendSubAdminReply } from '../services/chat-notification.service.js';

await sendSubAdminReply(
  chatId,
  adminId,
  'This is admin response message'
);
```

### Notification Flow
1. User/Driver sends message via socket
2. Socket handler saves message to database
3. `notifySubAdminChatMessage()` is called
4. FCM notifications sent to all active sub-admins
5. Notification includes:
   - Sender name
   - Receiver name
   - Message preview (first 50 chars)
   - Chat ID for quick access

---

## 🔐 Security Features

1. **Authentication Required** - All endpoints require JWT token
2. **Message Validation** - Messages are validated before saving
3. **Unique Chat Index** - One chat per driver-user pair
4. **Read Timestamps** - Track when messages are read
5. **Status Management** - Control chat state (active/closed)
6. **Socket Authentication** - Can be extended with token verification

---

## ⚙️ Configuration

The chat system uses the existing:
- **Database**: MongoDB (via Mongoose)
- **Real-time**: Socket.io (configured in `src/config/socket.js`)
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Redis**: For caching (optional)

---

## 🚀 Usage Workflow

### Starting a Chat
1. User initiates chat with driver
2. Frontend calls `POST /api/chat/start`
3. Backend creates chat document if not exists
4. Frontend joins socket room with `join_chat`

### Sending Messages
1. User types message
2. Frontend shows typing indicator via `typing` event
3. User submits message via `send_message` event
4. Backend saves message and notifies sub-admin
5. Other participant receives `receive_message` event

### Reading Messages
1. User opens chat window
2. Frontend calls `mark_as_read` via socket
3. Unread count decreases for sender
4. Other participant sees `messages_read` event

### Closing Chat
1. Either participant calls `close_chat`
2. Chat status changes to "closed"
3. Both participants notified via `chat_closed` event

---

## 🐛 Error Handling

All endpoints return error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common errors:
- `Invalid role. Must be 'user' or 'driver'`
- `Chat not found`
- `User ID is required`
- `Failed to save message`

---

## 📊 Performance Considerations

1. **Message Pagination** - History fetched with limit (default: 50)
2. **Indexing** - Composite index on driverId + userId for quick lookups
3. **Unread Count** - Cached in document for fast retrieval
4. **Socket Room Strategy** - Messages isolated to chat rooms
5. **Real-time Updates** - Direct socket emit instead of polling

---

## 🔄 Future Enhancements

1. Message editing/deletion
2. File/image attachments
3. Message search functionality
4. Chat archiving
5. Typing preview optimization
6. Read receipts UI
7. Chat export/history backup
8. Bot auto-replies for common questions

---

## 📞 Support

For issues or questions, refer to:
- Socket.io documentation: https://socket.io/docs/
- Firebase messaging: https://firebase.google.com/docs/cloud-messaging/
- Mongoose schema: https://mongoosejs.com/docs/schema.html
