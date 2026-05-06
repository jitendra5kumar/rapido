import { DriverDocument } from "../models/driverDocument.model.js";

export const createOrUpdateDriverDocument = async (user_id, payload) => {
  const doc = await DriverDocument.findOneAndUpdate(
    { user_id },
    {
      $set: payload,
    },
    {
      new: true,
      upsert: true,
    }
  );

  return doc;
};