const express = require('express');
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;