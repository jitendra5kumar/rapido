import * as adminService from '../services/admin.service.js';
import { asyncHandler, response } from '../utils/index.js';

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
