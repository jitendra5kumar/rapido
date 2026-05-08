import express from "express";

import {
  saveConfig,
  getConfig,
  updateSingleField,
} from "../controllers/config.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { handleValidationErrors } from "../middlewares/error.middleware.js";

const router = express.Router();


// CREATE OR UPDATE FULL CONFIG
router.post("/save",authMiddleware, handleValidationErrors,saveConfig);


// GET CONFIG
router.get("/", handleValidationErrors,getConfig);


// UPDATE SINGLE FIELD
router.patch("/update-field",authMiddleware,handleValidationErrors, updateSingleField);

export default router;