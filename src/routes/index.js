import express from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import userRoutes from './user.routes.js';
import zoneRoutes from './zone.routes.js';
import cityRoutes from './city.routes.js';
import alertRoutes from './alert.routes.js';
import vehicleCustomRoutes from './vehicleCustom.routes.js';
import vehicletype from './vehicle.routes.js';
import driverRoutes from './driver.routes.js';
import earningsRoutes from './earnings.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import serviceRoute from './service.routes.js';
import driverdocRoutes from './driverDocument.route.js';
import rideRoutes from './ride.routes.js';
import rideReportRoutes from './rideReport.routes.js';
import driverReportRoutes from './driverReport.routes.js';
import transactionReportRoutes from './transactionReport.routes.js';
import appSettingRoutes from './appSetting.routes.js';
import couponRoutes from './coupon.routes.js';
import subAdminSettingRoutes from './subAdminSetting.routes.js';
import DriverVehicle from "./driverVehicle.route.js"
import Notification  from './notification.routes.js';
import walletRoutes  from './wallet.route.js';
import chatRoutes from './chat.routes.js';
import adminChatRoutes from './adminChat.routes.js';
import supportChatRoutes from './supportChat.routes.js';
import reviewRoutes from './review.routes.js';



const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/zone', zoneRoutes);
router.use('/city', cityRoutes);
router.use('/alert', alertRoutes);
router.use('/vehicle-custom', vehicleCustomRoutes);
router.use('/vehicle', vehicletype);

router.use('/ride', rideRoutes);
router.use('/ride-reports', rideReportRoutes);
router.use('/transaction-reports', transactionReportRoutes);
router.use('/app-settings', appSettingRoutes);
router.use('/subadmin-settings', subAdminSettingRoutes);
router.use('/coupon-codes', couponRoutes);
router.use('/driver', driverRoutes)
router.use('/services', serviceRoute)
router.use('/driver-doc', driverdocRoutes)
router.use('/driver-vehicle', DriverVehicle)
router.use('/notifications', Notification)
router.use('/wallet', walletRoutes)
router.use('/driver-reports', driverReportRoutes)
router.use('/chat', chatRoutes)
router.use('/admin-chat', adminChatRoutes)
router.use('/support-chat', supportChatRoutes)
router.use('/review', reviewRoutes)
router.use('/earnings', earningsRoutes)
router.use('/dashboard', dashboardRoutes)





export default router;
