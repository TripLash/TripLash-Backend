const notificationController = require('../Controllers/notificationController');
const express = require('express');
const router = express.Router();
const protect = require('../util/middlewares');

router.get('/get-notifications', protect(['client', 'guide']),  notificationController.getAllNotifications);
router.get('/get-notifications-count', protect(['client', 'guide']),  notificationController.getNotificationCount);
router.post('/create-notification', protect(['client', 'guide']),  notificationController.createNotification);
router.get('/delete-notification/:notificationId', protect(['client', 'guide']),  notificationController.deleteNotification);
router.post('/delete-all-notifications', protect(['client', 'guide']),  notificationController.deleteAllNotifications);

module.exports = router;