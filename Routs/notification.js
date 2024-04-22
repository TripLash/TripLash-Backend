const notificationController = require('../Controllers/notificationController');
const express = require('express');
const router = express.Router();
const protect = require('../util/middlewares');

router.get('/get-notifications/', protect(['client', 'guide']),  notificationController.getAllNotifications);
router.get('/get-notifications-count/', protect(['client', 'guide']),  notificationController.getNotificationCount);

module.exports = router;