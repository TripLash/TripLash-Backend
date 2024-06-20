const express = require('express');
const router  = express.Router();
const authController = require('../Controllers/authController');
const userController = require('../Controllers/userController');
const protect = require('../util/middlewares');

router.post('/signup' , authController.signup);
router.post('/login', authController.login);
router.post('/logout', protect(['client', 'guide']) , authController.logout)

router.get('/get-profile', protect(['client']), userController.getProfile);
router.get('/get-all-users' , protect(['admin']) , userController.getAllUsers);
router.get('/get-user/:userId' , protect(['admin']) , userController.getUser);

router.delete('/delete-user/', protect(['admin']) , userController.deleteUser);//not implemented
router.delete('/delete-account/', protect(['client', 'guide']) , userController.deleteAccount);
router.patch('/update-profile/', protect(['client', 'guide']), userController.UpdateUser); 
router.patch('/add-admin/:userId' , protect(['admin']) , userController.addAdmin);

// reset password
router.post('/check-email', authController.checkEmail);
router.post('/send-verification-code', authController.sendVerificationCodeApi);
router.post('/verify-code', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);

module.exports = router;