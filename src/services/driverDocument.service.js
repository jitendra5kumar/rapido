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

  // 🔥 SAFE UPDATE HANDLING
  Object.keys(updates).forEach((key) => {
    const keys = key.split(".");

    if (keys.length === 2) {
      const [main, sub] = keys;

      if (doc[main] && doc[main][sub]) {
        doc[main][sub].status = updates[key];
      }

    } else if (keys.length === 1) {
      if (doc[key]) {
        doc[key].status = updates[key];
      }
    }
  });

  // 🔁 FIXED STATUS LOGIC
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

export const getallDriverDocuments = async (filter, options) => {
  const docs = await DriverDocument.paginate(filter, {
    ...options,
    populate: [
      {
        path: "user_id",
        select: "name email phone profileImage",
      },
    ],
  });



  return docs;
};