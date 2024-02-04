const express = require('express');

const router  = express.Router();
const authController = require('../Controllers/authController');
const userController = require('../Controllers/userController');


router.post('/signup' , authController.signup);
router.post('/login', authController.login);

router.get('/getProfile/:id' , userController.getUser);
router.get('/getUsers' , userController.getAllUsers);