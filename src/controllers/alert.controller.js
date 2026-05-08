import * as alertService from '../services/alert.service.js';
import { asyncHandler } from '../utils/index.js';
import { response } from '../utils/index.js';

export const createAlert = asyncHandler(async (req, res) => {
  const { title, message, image, linkUrl, userType, users, status, isBroadcast } = req.body;
  const userId = req.user.id;

  const alert = await alertService.createAlert(userId, {
    title,
    message,
    image,
    linkUrl,
    userType,
    users,
    status,
    isBroadcast,
  });

  response.success(res, 'Alert created successfully', alert, 201);
});

export const updateAlert = asyncHandler(async (req, res) => {
  const { alertId } = req.params;
  const { title, message, image, linkUrl, userType, users, status, isBroadcast } = req.body;
  const userId = req.user.id;

  const alert = await alertService.updateAlert(alertId, userId, {
    title,
    message,
    image,
    linkUrl,
    userType,
    users,
    status,
    isBroadcast,
  });

  response.success(res, 'Alert updated successfully', alert);
});

export const getAlert = asyncHandler(async (req, res) => {
  const { alertId } = req.params;

  const alert = await alertService.getAlertById(alertId);

  response.success(res, 'Alert fetched successfully', alert);
});

export const getAllAlerts = asyncHandler(async (req, res) => {
  const { userType, status } = req.query;

  const alerts = await alertService.getAllAlerts({
    userType,
    status,
  });

  response.success(res, 'Alerts fetched successfully', alerts);
});

export const getAlertsByUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;

  const alerts = await alertService.getAlertsByUser(userId);

  response.success(res, 'Alerts fetched successfully', alerts);
});

export const getAlertsByUserType = asyncHandler(async (req, res) => {
  const { userType } = req.params;

  const alerts = await alertService.getAlertsByUserType(userType);

  response.success(res, 'Alerts fetched successfully', alerts);
});

export const deleteAlert = asyncHandler(async (req, res) => {
  const { alertId } = req.params;
  const userId = req.user.id;

  const result = await alertService.deleteAlert(alertId, userId);

  response.success(res, result.message);
});
