import * as payoutMethodService from "../services/payoutMethod.service.js";
import { asyncHandler, response } from "../utils/index.js";

// GET /payout-method/my — fetch driver's saved payout method
export const getMyPayoutMethodController = asyncHandler(async (req, res) => {
  const driverId = req.user.id;

  const data = await payoutMethodService.getMyPayoutMethod(driverId);

  response.success(res, "Payout method fetched successfully", data);
});

// PUT /payout-method/bank — add / update bank account
export const saveBankAccountController = asyncHandler(async (req, res) => {
  const driverId = req.user.id;

  const doc = await payoutMethodService.saveBankAccount(driverId, req.body);

  response.success(res, "Bank account saved successfully", doc);
});

// PUT /payout-method/upi — add / update UPI ID
export const saveUpiIdController = asyncHandler(async (req, res) => {
  const driverId = req.user.id;

  const doc = await payoutMethodService.saveUpiId(driverId, req.body);

  response.success(res, "UPI ID saved successfully", doc);
});

// PATCH /payout-method/active — switch active method
export const setActiveMethodController = asyncHandler(async (req, res) => {
  const driverId = req.user.id;
  const { activeMethod } = req.body;

  const doc = await payoutMethodService.setActiveMethod(driverId, activeMethod);

  response.success(res, "Active payout method updated", doc);
});
