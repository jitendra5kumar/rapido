import { asyncHandler } from "../utils/index.js";
import {
  setPlatformPercentService,
  setSubAdminCommissionService,
  getSubAdminCommissionService,
} from "../services/commissionService.js";

// =====================================
// SET PLATFORM PERCENT
// =====================================

export const setPlatformPercent =
  asyncHandler(async (req, res) => {
    try {
      const { platform_percent } =
        req.body;

      const setting =
        await setPlatformPercentService(
          platform_percent
        );

      res.status(200).json({
        success: true,
        message:
          "Platform percent updated",
        setting,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

// =====================================
// SET SUB ADMIN COMMISSION
// =====================================

export const setSubAdminCommission =
  asyncHandler(async (req, res) => {
    try {
      const adminId = req.user.id;

      const {
        sub_admin_id,
        commission_percent,
      } = req.body;

      const commission =
        await setSubAdminCommissionService(
          {
            adminId,
            sub_admin_id,
            commission_percent,
          }
        );

      res.status(200).json({
        success: true,
        message:
          "Sub admin commission updated",
        commission,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

// =====================================
// GET ALL COMMISSION
// =====================================

export const getSubAdminCommission =
  asyncHandler(async (req, res) => {
    try {
      const commissions =
        await getSubAdminCommissionService();

      res.status(200).json({
        success: true,
        count: commissions.length,
        commissions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });