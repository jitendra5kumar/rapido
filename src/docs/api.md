# API Documentation

## Authentication Endpoints

### POST /api/auth/send-otp
Send OTP for registration/login.

**Request Body:**
```json
{
  "phone": "1234567890",
  "name": "John Doe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### POST /api/auth/verify-otp
Verify OTP and complete registration/login.

**Request Body:**
```json
{
  "phone": "1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified and logged in",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "phone": "1234567890",
      "role": "rider"
    }
  }
}
```

### POST /api/auth/login
Login with phone and password.

**Request Body:**
```json
{
  "phone": "1234567890",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "phone": "1234567890",
      "role": "rider"
    }
  }
}
```

## User Endpoints

### GET /api/user/profile
Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "phone": "1234567890",
    "role": "rider",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Error Responses
All endpoints return errors in the following format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Rate Limiting
All auth endpoints are rate limited to 100 requests per 15 minutes per IP.

## Authentication
Use JWT token in Authorization header for protected routes.