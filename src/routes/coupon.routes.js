import express from "express";
import * as couponController from "../controllers/coupon.controller.js";
import { authMiddleware, requireRoles } from "../middlewares/index.js";
import { createCoupon as createCouponValidator, updateCoupon as updateCouponValidator, applyCoupon as applyCouponValidator, getCoupon as getCouponValidator } from "../validators/coupon.validator.js";
import { handleValidationErrors } from "../middlewares/error.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", requireRoles("admin", "sub_admin"), createCouponValidator, handleValidationErrors, couponController.createCouponController);
router.get("/", requireRoles("admin", "sub_admin"), couponController.getCouponsController);
router.get("/:id", requireRoles("admin", "sub_admin"), getCouponValidator, handleValidationErrors, couponController.getCouponByIdController);
router.put("/:id", requireRoles("admin", "sub_admin"), updateCouponValidator, handleValidationErrors, couponController.updateCouponController);
router.delete("/:id", requireRoles("admin", "sub_admin"), getCouponValidator, handleValidationErrors, couponController.deleteCouponController);
router.post("/apply", applyCouponValidator, handleValidationErrors, couponController.applyCouponController);

export default router;