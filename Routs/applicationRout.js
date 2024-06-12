const express = require('express');
const router = express.Router();
const ApplicationController = require('../Controllers/applicationController');
const protect = require('../util/middlewares');


router.post('/create-tour-application', protect(['client']) , ApplicationController.createTourAppliaction);
router.post('/create-guide-application', protect(['client']) , ApplicationController.createGuideApplication);
router.delete('/cancel-application/:appId' , ApplicationController.cancelApplication);//not finished yet
router.get('/get-application/:appId' , protect(['client' , 'guide']) , ApplicationController.getApplication);//not finished yet
router.get('/get-user-application/:userId' , protect(['client']) , ApplicationController.getUserApplication);//not finished yet
router.get('/get-guide-application/:guideId' , protect(['guide']) , ApplicationController.getGuideApplication);//not finished yet
router.get('/get-all-applications' , protect(['admin']), ApplicationController.getAllApplications); //not finished yet


module.exports = router;