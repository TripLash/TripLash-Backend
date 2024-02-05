const express = require('express');

const router  = express.Router();
const authController = require('../Controllers/authController');
const userController = require('../Controllers/userController');
const protect = require('../util/middlewares');

router.post('/signup/' , authController.signup);
router.post('/login/', authController.login);

router.get('/get-profile/', protect(['client']), userController.getUser);
router.get('/getUsers' , userController.getAllUsers);

module.exports = router;