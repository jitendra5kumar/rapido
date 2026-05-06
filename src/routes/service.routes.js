import express from "express";
import {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
} from "../controllers/service.controller.js";

const router = express.Router();

// ➤ Create
router.post("/", createService);

// ➤ Get All
router.get("/", getAllServices);

// ➤ Get One
router.get("/:id", getServiceById);

// ➤ Update
router.put("/:id", updateService);

// ➤ Delete
router.delete("/:id", deleteService);

export default router;