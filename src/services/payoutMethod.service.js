import PayoutMethod from "../models/payoutMethod.model.js";

// Default empty payout doc returned when none exists
const emptyPayout = () => ({
  bank: { holderName: "", bankName: "", accountNumber: "", ifscCode: "" },
  upi: { vpa: "" },
  activeMethod: "none",
});

// GET driver's payout method
export const getMyPayoutMethod = async (driverId) => {
  const doc = await PayoutMethod.findOne({ driverId });
  return doc ?? emptyPayout();
};

// SAVE / UPDATE bank account
export const saveBankAccount = async (driverId, { holderName, bankName, accountNumber, ifscCode }) => {
  if (!holderName?.trim() || !bankName?.trim() || !accountNumber?.trim() || !ifscCode?.trim()) {
    throw new Error("All bank fields (holderName, bankName, accountNumber, ifscCode) are required.");
  }

  if (ifscCode.trim().length !== 11) {
    throw new Error("IFSC code must be exactly 11 characters.");
  }

  return await PayoutMethod.findOneAndUpdate(
    { driverId },
    {
      $set: {
        "bank.holderName":    holderName.trim(),
        "bank.bankName":      bankName.trim(),
        "bank.accountNumber": accountNumber.trim(),
        "bank.ifscCode":      ifscCode.trim().toUpperCase(),
        activeMethod: "bank",
      },
    },
    { upsert: true, new: true }
  );
};

// SAVE / UPDATE UPI ID
export const saveUpiId = async (driverId, { vpa }) => {
  if (!vpa?.trim()) {
    throw new Error("UPI VPA is required.");
  }
  if (!vpa.trim().includes("@")) {
    throw new Error('Invalid UPI ID. Must contain "@" (e.g. name@upi).');
  }

  return await PayoutMethod.findOneAndUpdate(
    { driverId },
    {
      $set: {
        "upi.vpa":   vpa.trim().toLowerCase(),
        activeMethod: "upi",
      },
    },
    { upsert: true, new: true }
  );
};

// SET active payout method
export const setActiveMethod = async (driverId, activeMethod) => {
  if (!["bank", "upi"].includes(activeMethod)) {
    throw new Error('activeMethod must be "bank" or "upi".');
  }

  return await PayoutMethod.findOneAndUpdate(
    { driverId },
    { $set: { activeMethod } },
    { upsert: true, new: true }
  );
};
