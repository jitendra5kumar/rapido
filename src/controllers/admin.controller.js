import * as adminService from '../services/admin.service.js';
import { asyncHandler, response } from '../utils/index.js';
import { getChatNotifications, sendSubAdminReply } from '../services/chat-notification.service.js';

export const createSubAdmin = asyncHandler(async (req, res) => {
  const { name, phone, password, email } = req.body;

  const subAdmin = await adminService.createSubAdmin({
    name,
    phone,
    password,
    email,
  });

  return response.success(res, 'Sub admin created successfully', subAdmin, 201);
});

export const getSubAdmins = asyncHandler(async (req, res) => {
  const subAdmins = await adminService.getSubAdmins();

  return response.success(
    res,
    'Sub admins fetched successfully',
    subAdmins
  );
});

export const getSubAdminById = asyncHandler(async (req, res) => {
  const subAdmin = await adminService.getSubAdminById(
    req.params.subAdminId
  );

  return response.success(
    res,
    'Sub admin fetched successfully',
    subAdmin
  );
});

export const updateSubAdmin = asyncHandler(async (req, res) => {
  const { name, email, status } = req.body;

  const subAdmin = await adminService.updateSubAdmin(
    req.params.subAdminId,
    { name, email, status }
  );

  return response.success(res, 'Sub admin updated successfully', subAdmin);
});

export const deleteSubAdmin = asyncHandler(async (req, res) => {
  const result = await adminService.deleteSubAdmin(req.params.subAdminId);

  return response.success(res, result.message, result);
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const { userId, newPassword } = req.body;

  const result = await adminService.resetUserPassword(userId, newPassword);

  return response.success(res, result.message, result);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId, status } = req.body;

  const result = await adminService.updateUserStatus(userId, status);

  return response.success(res, result.message, result);
});

// =====================================================
// CHAT MANAGEMENT ENDPOINTS
// =====================================================

export const getChatDashboard = asyncHandler(async (req, res) => {
  const adminId = req.user?._id;
  const { page = 1, limit = 20 } = req.query;

  const chatData = await getChatNotifications(
    adminId,
    parseInt(page),
    parseInt(limit)
  );

  return response.success(
    res,
    'Chat dashboard fetched successfully',
    chatData
  );
});

export const respondToChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;
  const adminId = req.user?._id;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Reply message is required',
    });
  }

  const updatedChat = await sendSubAdminReply(chatId, adminId, message);

  return response.success(
    res,
    'Reply sent successfully',
    updatedChat,
    201
  );
});
