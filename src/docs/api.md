# API Documentation

## Authentication Endpoints

### POST /api/auth/send-otp
Send OTP to a phone number.

**Request Body:**
```json
{
  "phone": "1234567890"
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
Verify the OTP and mark the phone number as verified.

**Request Body:**
```json
{
  "phone": "1234567890",
  "otp": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "phone": "1234567890",
    "otpVerified": true
  }
}
```

### POST /api/auth/complete-profile
Complete registration after OTP verification with name, gender and referral code.

**Request Body:**
```json
{
  "phone": "1234567890",
  "name": "John Doe",
  "gender": "male",
  "referral_code": "AB12CD34"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile completed and logged in",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "phone": "1234567890",
      "role": "rider",
      "gender": "male",
      "referral_code": "AB12CD34"
    }
  }
}
```

### POST /api/auth/logout
Logout the authenticated user and invalidate the stored session token.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "success": true
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