import Coupon from "../models/coupon.model.js";

const normalizeCode = (code) => code.trim().toUpperCase();

export const createCoupon = async (data, userId) => {
  const coupon = await Coupon.create({
    ...data,
    code: normalizeCode(data.code),
    createdById: userId,
    updatedById: userId,
  });
  return coupon;
};

export const getCoupons = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.code) query.code = normalizeCode(filters.code);
  if (filters.vehicleId) query.vehicleId = filters.vehicleId;
  return await Coupon.find(query).sort({ createdAt: -1 });
};

export const getCouponById = async (id) => {
  return await Coupon.findById(id);
};

export const updateCoupon = async (id, data, userId) => {
  if (data.code) data.code = normalizeCode(data.code);
  const coupon = await Coupon.findByIdAndUpdate(
    id,
    {
      ...data,
      updatedById: userId,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  return coupon;
};

export const deleteCoupon = async (id) => {
  return await Coupon.findByIdAndDelete(id);
};

export const applyCoupon = async (code, orderAmount, vehicleId) => {
  const normalizedCode = normalizeCode(code);
  const coupon = await Coupon.findOne({ code: normalizedCode, status: "active" });
  if (!coupon) {
    throw new Error("Coupon not found or inactive");
  }

  const now = new Date();
  if (coupon.startDate && coupon.startDate > now) {
    throw new Error("Coupon is not active yet");
  }
  if (coupon.expiryDate && coupon.expiryDate < now) {
    throw new Error("Coupon has expired");
  }
  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    throw new Error(`Minimum order amount is ${coupon.minOrderAmount}`);
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  if (coupon.vehicleId && (!vehicleId || coupon.vehicleId.toString() !== vehicleId)) {
    throw new Error("Coupon is not valid for the selected vehicle");
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (orderAmount * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
    discount = coupon.maxDiscountAmount;
  }

  return {
    coupon,
    discount,
    finalAmount: Math.max(orderAmount - discount, 0),
  };
};
