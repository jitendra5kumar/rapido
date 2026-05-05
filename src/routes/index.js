import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import vehicletype from './vehicle.routes.js';
import driverRoutes from "./driver.routes.js"
import serviceRoute from './service.routes.js'

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/type', vehicletype);
router.use("/driver", driverRoutes)
router.use("/service", serviceRoute)




export default router;
