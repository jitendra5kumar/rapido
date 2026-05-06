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

export const updateDocumentStatusService = async (
  documentId,
  updates,
  adminId
) => {
  const doc = await DriverDocument.findById(documentId);

  if (!doc) {
    throw new Error("Document not found");
  }

  // 🔁 Dynamic update (aadhaar.front.status, pan.status etc.)
  Object.keys(updates).forEach((key) => {
    const keys = key.split(".");

    if (keys.length === 2) {
      // e.g. aadhaar.front
      doc[keys[0]][keys[1]].status = updates[key];
    } else if (keys.length === 1) {
      // e.g. pan
      doc[key].status = updates[key];
    }
  });

  // 🔁 Auto overall status logic
  const allStatuses = [
    doc.aadhaar?.front?.status,
    doc.aadhaar?.back?.status,
    doc.pan?.status,
    doc.rc?.status,
    doc.dl?.status,
    doc.insurance?.status,
  ];

  if (allStatuses.every((s) => s === "approved")) {
    doc.overall_status = "verified";
  } else if (allStatuses.some((s) => s === "rejected")) {
    doc.overall_status = "rejected";
  } else {
    doc.overall_status = "under_review";
  }

  doc.verified_by = adminId;

  await doc.save();

  return doc;
};