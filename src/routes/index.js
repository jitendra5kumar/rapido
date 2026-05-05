import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import vehicletype from './vehicle.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/type',vehicletype)

export default router;
