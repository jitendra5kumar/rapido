import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import zoneRoutes from './zone.routes.js';
import cityRoutes from './city.routes.js';
import alertRoutes from './alert.routes.js';
import vehicleCustomRoutes from './vehicleCustom.routes.js';
import vehicletype from './vehicle.routes.js';
import driverRoutes from "./driver.routes.js"
import serviceRoute from './service.routes.js'
import driverdocRoutes from './driverDocument.route.js'

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/zone', zoneRoutes);
router.use('/city', cityRoutes);
router.use('/alert', alertRoutes);
router.use('/vehicle-custom', vehicleCustomRoutes);
router.use('/type',vehicletype)

router.use("/driver", driverRoutes)
router.use("/service", serviceRoute)
router.use("/driver-doc", driverdocRoutes)




export default router;
