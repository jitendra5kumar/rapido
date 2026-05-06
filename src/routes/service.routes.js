import express from "express";
import {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
} from "../controllers/service.controller.js";
import upload from "../../uploads/upload.js";

const router = express.Router();


// ➤ Create
router.post(
    "/",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "icon", maxCount: 1 }
    ]),
    createService
);
// ➤ Get All
router.get("/", getAllServices);

// ➤ Get One
router.get("/:id", getServiceById);

// ➤ Update
router.put(
    "/:id",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "icon", maxCount: 1 }
    ]),
    updateService
);

// ➤ Delete
router.delete("/:id", deleteService);

export default router;