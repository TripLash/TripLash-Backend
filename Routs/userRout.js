const express = require('express');

const router  = express.Router();
const authController = require('../Controllers/authController');
const userController = require('../Controllers/userController');
const protect = require('../util/middlewares');

router.post('/signup/' , authController.signup);
router.post('/login/', authController.login);
router.post('/logout/' , authController.logout) //not finished yet

router.get('/get-profile/', protect(['client']), userController.getUser);
router.get('/getUsers' , userController.getAllUsers);

router.delete('/deleteUser/:userId' , userController.deleteUser); //not finished yet
router.patch('/updateUser/:userId' , userController.UpdateUser);  //not finished yet


// reset password
router.post('/check-email/', authController.checkEmail);
router.post('/send-verification-code/', authController.sendVerificationCodeApi);
router.post('/verify-code/', authController.verifyEmail);
router.post('/reset-password/', authController.resetPassword);

module.exports = router;