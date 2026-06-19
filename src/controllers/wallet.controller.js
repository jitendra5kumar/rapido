import {
  createRechargeOrderService,
  verifyPaymentService,
  markFailedService,
} from "../services/wallet.service.js";

// =============================
// CREATE ORDER CONTROLLER
// =============================
export const createRechargeOrder = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { amount } = req.body;

    const result = await createRechargeOrderService(user_id, amount);

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// VERIFY PAYMENT CONTROLLER
// =============================
export const verifyRechargePayment = async (req, res) => {
  try {
    const result = await verifyPaymentService(req.body);

    return res.status(200).json({
      success: true,
      message: "Payment verified & wallet updated",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// FAILED PAYMENT CONTROLLER
// =============================
export const markPaymentFailed = async (req, res) => {
  try {
    const { razorpay_order_id, reason } = req.body;

    const result = await markFailedService(
      razorpay_order_id,
      reason
    );

    return res.status(200).json({
      success: true,
      message: "Payment marked failed",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};