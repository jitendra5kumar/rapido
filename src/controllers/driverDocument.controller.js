import { uploadToImgBB } from "../services/imgbb.service.js";
import { createOrUpdateDriverDocument } from "../services/driverDocument.service.js";
import { asyncHandler } from "../utils/index.js";

// 👉 Upload Driver Documents
export const uploadDriverDocuments = asyncHandler(async (req, res) => {
    try {
        const user_id = req.user.id;
        const files = req.files;
        const body = req.body;

        const payload = {};

        // Aadhaar Front
        if (files?.aadhaar_front?.[0]) {
            const url = await uploadToImgBB(files.aadhaar_front[0].buffer);

            payload["aadhaar.front.url"] = url;

            if (body.aadhaar_number) {
                payload["aadhaar.front.number"] = body.aadhaar_number;
            }
        }

        // Aadhaar Back
        if (files?.aadhaar_back?.[0]) {
            const url = await uploadToImgBB(files.aadhaar_back[0].buffer);

            payload["aadhaar.back.url"] = url;
        }

        // PAN
        if (files?.pan?.[0]) {
            const url = await uploadToImgBB(files.pan[0].buffer);

            payload["pan.url"] = url;

            if (body.pan_number) {
                payload["pan.number"] = body.pan_number;
            }
        }

        // RC Front
        if (files?.rc_front?.[0]) {
            const url = await uploadToImgBB(files.rc_front[0].buffer);

            payload["rc.front.url"] = url;

            if (body.rc_number) {
                payload["rc.front.number"] = body.rc_number;
            }
        }

        // RC Back
        if (files?.rc_back?.[0]) {
            const url = await uploadToImgBB(files.rc_back[0].buffer);

            payload["rc.back.url"] = url;
        }

        // DL Front
        if (files?.dl_front?.[0]) {
            const url = await uploadToImgBB(files.dl_front[0].buffer);

            payload["dl.front.url"] = url;

            if (body.dl_number) {
                payload["dl.front.number"] = body.dl_number;
            }
        }

        // DL Back
        if (files?.dl_back?.[0]) {
            const url = await uploadToImgBB(files.dl_back[0].buffer);

            payload["dl.back.url"] = url;
        }

        if (body.licenseType) {
            payload["dl.licenseType"] = body.licenseType;
        }

        // Insurance
        if (files?.insurance?.[0]) {
            const url = await uploadToImgBB(files.insurance[0].buffer);

            payload["insurance.url"] = url;

            if (body.policy_number) {
                payload["insurance.policy_number"] = body.policy_number;
            }
        }
                // 🚀 Save / Update
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
});


export const updateDocumentStatusController = asyncHandler(async (req, res) => {
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
});

// 👉 Upload Dedicated Driving License (DL) Documents
export const uploadDlDocument = asyncHandler(async (req, res) => {
    try {
        const user_id = req.user.id;
        const files = req.files;
        const { dl_number, licenseType } = req.body;

        if (!dl_number) {
            return res.status(400).json({
                success: false,
                message: "Driving License number is required",
            });
        }

        if (!licenseType) {
            return res.status(400).json({
                success: false,
                message: "License Type is required",
            });
        }

        const payload = {};
        payload["dl.licenseType"] = licenseType;

        // DL Front
        if (files?.dl_front?.[0]) {
            const url = await uploadToImgBB(files.dl_front[0].buffer);
            payload["dl.front.url"] = url;
            payload["dl.front.number"] = dl_number;
        } else {
            return res.status(400).json({
                success: false,
                message: "DL Front Side image is required",
            });
        }

        // DL Back
        if (files?.dl_back?.[0]) {
            const url = await uploadToImgBB(files.dl_back[0].buffer);
            payload["dl.back.url"] = url;
        } else {
            return res.status(400).json({
                success: false,
                message: "DL Back Side image is required",
            });
        }

        // Save / Update using existing service
        const doc = await createOrUpdateDriverDocument(user_id, payload);

        return res.status(200).json({
            success: true,
            message: "Driving License uploaded successfully",
            data: doc,
        });
    } catch (error) {
        console.error("Error in uploadDlDocument:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// 👉 Upload Profile Selfie / Avatar to ImgBB
export const uploadAvatarController = asyncHandler(async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Profile photo (avatar) file is required",
            });
        }

        const url = await uploadToImgBB(file.buffer);

        return res.status(200).json({
            success: true,
            message: "Profile photo uploaded successfully",
            url,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// 👉 Update DL Info (license number & license type only — no image re-upload)
export const updateDlInfoController = asyncHandler(async (req, res) => {
    try {
        const user_id = req.user.id;
        const { dl_number, licenseType } = req.body;

        if (!dl_number && !licenseType) {
            return res.status(400).json({
                success: false,
                message: "Provide at least dl_number or licenseType to update",
            });
        }

        const payload = {};
        if (dl_number)    payload["dl.front.number"] = dl_number;
        if (licenseType)  payload["dl.licenseType"] = licenseType;

        const doc = await createOrUpdateDriverDocument(user_id, payload);

        return res.status(200).json({
            success: true,
            message: "Driving License info updated successfully",
            data: doc,
        });
    } catch (error) {
        console.error("Error in updateDlInfoController:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});