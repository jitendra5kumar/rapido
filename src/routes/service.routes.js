import express from "express";

import {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
} from "../controllers/service.controller.js";

import upload from "../../uploads/upload.js";
import authMiddleware, { requireRoles } from "../middlewares/auth.middleware.js";
import { rateLimitMiddleware } from "../middlewares/index.js";

const router = express.Router();

// 🔐 Create Service (Admin only)
router.post(
    "/",
    authMiddleware,
    rateLimitMiddleware,
    upload.fields([
        { name: "image", maxCount: 1 },
    ]),
    createService
);

// 📦 Get All Services (Public)
router.get("/", getAllServices);

// 🔍 Get Single Service (Public)
router.get("/:id", getServiceById);

// ✏️ Update Service (Admin only)
router.put(
    "/:id",
    authMiddleware,
    rateLimitMiddleware,
    requireRoles('admin', 'sub_admin'),
    upload.fields([
        { name: "image", maxCount: 1 },
    ]),
    updateService
);

// ❌ Delete Service (Admin only)
router.delete(
    "/:id",
    authMiddleware,
    rateLimitMiddleware,
    requireRoles('admin', 'sub_admin'),
    deleteService
);

export default router;