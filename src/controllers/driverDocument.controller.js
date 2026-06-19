import { uploadToS3 } from "../controllers/s3.controller.js";
import { createOrUpdateDriverDocument, getallDriverDocuments, updateDocumentStatusService } from "../services/driverDocument.service.js";

import { processImageUpload } from "../utils/upload.js";

export const uploadDriverDocuments = async (req, res) => {
  try {
    const user_id = req.user.id;
    const files = req.files;
    const body = req.body;

    const payload = {};

    // Aadhaar Front
    if (files?.aadhaar_front?.[0]) {
      const file = files.aadhaar_front[0];
      const url = await processImageUpload(file, user_id);
      payload["aadhaar.front.url"] = url;

      if (body.aadhaar_number) {
        payload["aadhaar.front.number"] = body.aadhaar_number;
      }
    }

    // Aadhaar Back
    if (files?.aadhaar_back?.[0]) {
      const file = files.aadhaar_back[0];
      const url = await processImageUpload(file, user_id);
      payload["aadhaar.back.url"] = url;
    }

    // PAN
    if (files?.pan?.[0]) {
      const file = files.pan[0];
      const url = await processImageUpload(file, user_id);
      payload["pan.url"] = url;

      if (body.pan_number) {
        payload["pan.number"] = body.pan_number;
      }
    }

    // RC
    if (files?.rc?.[0]) {
      const file = files.rc[0];
      const url = await processImageUpload(file, user_id);
      payload["rc.url"] = url;

      if (body.rc_number) {
        payload["rc.number"] = body.rc_number;
      }
    }

    // DL
    if (files?.dl?.[0]) {
      const file = files.dl[0];
      const url = await processImageUpload(file, user_id);
      payload["dl.url"] = url;

      if (body.dl_number) {
        payload["dl.number"] = body.dl_number;
      }
    }

    // Insurance
    if (files?.insurance?.[0]) {
      const file = files.insurance[0];
      const url = await processImageUpload(file, user_id);
      payload["insurance.url"] = url;

      if (body.policy_number) {
        payload["insurance.policy_number"] = body.policy_number;
      }
    }

    // Save / Update
    const doc = await createOrUpdateDriverDocument(
      user_id,
      payload
    );

    return res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Upload Driver Documents Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateDocumentStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const adminId = req.user._id; // 👈 from auth middleware

        const updated = await updateDocumentStatusService(
            id,
            updates,
            adminId
        );

        res.status(200).json({
            success: true,
            message: "Document status updated successfully",
            data: updated,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllDriverDocumentsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, overall_status } = req.query;

    const filter = {};

    if (overall_status) {
      filter.overall_status = overall_status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
        sort: { createdAt: -1 },
    };

    const docs = await getallDriverDocuments(filter, options);
    res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

