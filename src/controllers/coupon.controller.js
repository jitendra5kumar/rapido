import * as couponService from "../services/coupon.service.js";
import { asyncHandler, response } from "../utils/index.js";

// CREATE COUPON CODE
export const createCouponController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const coupon = await couponService.createCoupon(req.body, userId);
  response.success(res, "Coupon created successfully", coupon, 201);
});

// GET ALL COUPONS
export const getCouponsController = asyncHandler(async (req, res) => {
  const filters = req.query;
  const coupons = await couponService.getCoupons(filters);
  response.success(res, "Coupons fetched successfully", coupons);
});

// GET COUPON BY ID
export const getCouponByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await couponService.getCouponById(id);
  if (!coupon) {
    return response.error(res, "Coupon not found", 404);
  }
  response.success(res, "Coupon fetched successfully", coupon);
});

// UPDATE COUPON CODE
export const updateCouponController = asyncHandler(async (req, res) => {

  console.log(req.body)
  const { id } = req.params;
  const userId = req.user.id;
  const coupon = await couponService.updateCoupon(id, req.body, userId);
  if (!coupon) {
    return response.error(res, "Coupon not found", 404);
  }
  response.success(res, "Coupon updated successfully", coupon);
});

// DELETE COUPON CODE
export const deleteCouponController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await couponService.deleteCoupon(id);
  if (!deleted) {
    return response.error(res, "Coupon not found", 404);
  }
  response.success(res, "Coupon deleted successfully");
});

// APPLY COUPON CODE
export const applyCouponController = asyncHandler(async (req, res) => {
  const { code, orderAmount, vehicleId } = req.body;
  const result = await couponService.applyCoupon(code, Number(orderAmount), vehicleId);
  response.success(res, "Coupon applied successfully", result);
});