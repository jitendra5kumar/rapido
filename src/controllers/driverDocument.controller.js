import { uploadToImgBB } from "../services/imgbb.service.js";
import { createOrUpdateDriverDocument } from "../services/driverDocument.service.js";

// 👉 Upload Driver Documents
export const uploadDriverDocuments = async (req, res) => {
  try {
    const user_id = req.user.id; // assuming auth middleware

    const files = req.files;

    let payload = {};

    // 🚀 Aadhaar Front
    if (files?.aadhaar_front?.[0]) {
      const url = await uploadToImgBB(files.aadhaar_front[0].buffer);

      payload["aadhaar.front.url"] = url;
      payload["aadhaar.front.status"] = "pending";
    }

    // 🚀 Aadhaar Back
    if (files?.aadhaar_back?.[0]) {
      const url = await uploadToImgBB(files.aadhaar_back[0].buffer);

      payload["aadhaar.back.url"] = url;
      payload["aadhaar.back.status"] = "pending";
    }

    // 🚀 PAN
    if (files?.pan?.[0]) {
      const url = await uploadToImgBB(files.pan[0].buffer);

      payload["pan.url"] = url;
      payload["pan.status"] = "pending";
    }

    // 🚀 DL
    if (files?.dl?.[0]) {
      const url = await uploadToImgBB(files.dl[0].buffer);

      payload["dl.url"] = url;
      payload["dl.status"] = "pending";
    }

    const doc = await createOrUpdateDriverDocument(user_id, payload);

    return res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};