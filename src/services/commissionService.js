import Commission from "../models/Commission.js";
import Setting from "../models/Setting.js";
import User from "../models/user.model.js";

// =====================================
// SET PLATFORM PERCENT
// =====================================

export const setPlatformPercentService =
  async (platform_percent) => {
    let setting = await Setting.findOne();

    if (setting) {
      setting.platform_percent =
        platform_percent;

      await setting.save();
    } else {
      setting = await Setting.create({
        platform_percent,
      });
    }

    return setting;
  };

// =====================================
// SET SUB ADMIN COMMISSION
// =====================================

export const setSubAdminCommissionService =
  async ({
    adminId,
    sub_admin_id,
    commission_percent,
  }) => {
    // check sub admin exists

    const subAdmin = await User.findOne({
      _id: sub_admin_id,
      role: "sub_admin",
    });

    if (!subAdmin) {
      throw new Error(
        "Sub admin not found"
      );
    }

    let commission =
      await Commission.findOne({
        sub_admin_id,
      });

    if (commission) {
      commission.commission_percent =
        commission_percent;

      await commission.save();
    } else {
      commission =
        await Commission.create({
          sub_admin_id,
          commission_percent,
          set_by_admin: adminId,
        });
    }

    return commission;
  };

// =====================================
// GET ALL SUB ADMIN COMMISSION
// =====================================

export const getSubAdminCommissionService =
  async () => {
    return await Commission.find()
      .populate(
        "sub_admin_id",
        "name phone referral_code wallet"
      )
      .populate(
        "set_by_admin",
        "name phone"
      )
      .sort({ createdAt: -1 });
  };