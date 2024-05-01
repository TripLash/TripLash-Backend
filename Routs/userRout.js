const express = require('express');
const router  = express.Router();
const authController = require('../Controllers/authController');
const userController = require('../Controllers/userController');
const protect = require('../util/middlewares');

router.post('/signup' , authController.signup);
router.post('/login', authController.login);
router.post('/logout', protect(['client', 'guide']) , authController.logout) //not finished yet

router.get('/get-profile', protect(['client']), userController.getProfile);
router.get('/get-all-users' , userController.getAllUsers);
router.get('/get-user/:userId' , userController.getUser); //not finished yet

router.delete('/delete-user/', protect(['client', 'guide']) , userController.deleteUser); //not finished yet
router.patch('/update-profile/', protect(['client', 'guide']), userController.UpdateUser);  //not finished yet


// reset password
router.post('/check-email', authController.checkEmail);
router.post('/send-verification-code', authController.sendVerificationCodeApi);
router.post('/verify-code', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);

module.exports = router;