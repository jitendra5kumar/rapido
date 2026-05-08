import { razorpay } from "../config/razorpay.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import User from "../models/user.model.js";
import Commission from "../models/Commission.js";
import Setting from "../models/Setting.js";

import crypto from "crypto";

// =============================
// CREATE ORDER SERVICE
// =============================

export const createRechargeOrderService =
  async (user_id, amount) => {
    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order =
      await razorpay.orders.create(
        options
      );

    const transaction =
      await WalletTransaction.create({
        user_id,
        amount: Number(amount),
        razorpay_order_id: order.id,
        status: "created",
      });

    return {
      order,
      transaction,
    };
  };

// =============================
// VERIFY PAYMENT SERVICE
// =============================

export const verifyPaymentService =
  async (data) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = data;

    // =============================
    // FIND TRANSACTION
    // =============================

    const transaction =
      await WalletTransaction.findOne({
        razorpay_order_id,
      });

    if (!transaction) {
      throw new Error(
        "Transaction not found"
      );
    }

    // prevent duplicate verification

    if (transaction.status === "success") {
      return {
        success: true,
        message:
          "Payment already verified",
        transaction,
      };
    }

    // =============================
    // VERIFY SIGNATURE
    // =============================

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env
          .RAZORPAY_KEY_SECRET
      )
      .update(body.toString())
      .digest("hex");

    // =============================
    // INVALID SIGNATURE
    // =============================

    if (
      expectedSignature !==
      razorpay_signature
    ) {
      transaction.status = "failed";

      transaction.failure_reason =
        "Signature mismatch";

      await transaction.save();

      throw new Error(
        "Payment verification failed"
      );
    }

    // =============================
    // PAYMENT SUCCESS
    // =============================

    transaction.status = "success";

    transaction.razorpay_payment_id =
      razorpay_payment_id;

    transaction.razorpay_signature =
      razorpay_signature;

    await transaction.save();

    // =============================
    // FIND DRIVER
    // =============================

    const driver =
      await User.findById(
        transaction.user_id
      );

    if (!driver) {
      throw new Error(
        "Driver not found"
      );
    }

    // =============================
    // DRIVER WALLET UPDATE
    // =============================

    await User.findByIdAndUpdate(
      driver._id,
      {
        $inc: {
          wallet: transaction.amount,
        },
      }
    );

    // =============================
    // PLATFORM PERCENT
    // =============================

    const setting =
      await Setting.findOne();

    const platformPercent =
      setting?.platform_percent || 0;

    const platformAmount =
      (transaction.amount *
        platformPercent) /
      100;

    // =============================
    // SUB ADMIN COMMISSION
    // =============================

    let subAdminAmount = 0;

    let subAdminId = null;

    // driver under sub admin
    if (driver.referred_by_id) {
      subAdminId =
        driver.referred_by_id;

      const commission =
        await Commission.findOne({
          sub_admin_id:
            subAdminId,
        });

      if (commission) {
        subAdminAmount =
          (transaction.amount *
            commission.commission_percent) /
          100;

        // add money to sub admin

        await User.findByIdAndUpdate(
          subAdminId,
          {
            $inc: {
              wallet:
                subAdminAmount,
            },
          }
        );
      }
    }

    // =============================
    // ADMIN PROFIT
    // =============================

    const adminProfit =
      transaction.amount -
      platformAmount -
      subAdminAmount;

    // =============================
    // FIND ADMIN
    // =============================

    const admin =
      await User.findOne({
        role: "admin",
      });

    if (admin) {
      await User.findByIdAndUpdate(
        admin._id,
        {
          $inc: {
            wallet: adminProfit,
          },
        }
      );
    }

    // =============================
    // RESPONSE
    // =============================

    return {
      success: true,

      message:
        "Payment verified successfully",

      transaction,

      distribution: {
        rechargeAmount:
          transaction.amount,

        platformPercent,

        platformAmount,

        subAdminAmount,

        adminProfit,
      },
    };
  };

// =============================
// MARK FAILED SERVICE
// =============================

export const markFailedService =
  async (order_id, reason) => {
    const tx =
      await WalletTransaction.findOneAndUpdate(
        {
          razorpay_order_id:
            order_id,
        },
        {
          status: "failed",

          failure_reason:
            reason ||
            "Payment failed",
        },
        {
          new: true,
        }
      );

    return tx;
  };