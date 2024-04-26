const express = require('express');
const router = express.Router();
const ApplicationController = require('../Controllers/applicationController')


router.post('/create-tour-application/', ApplicationController.createTourAppliaction);

module.exports = router;