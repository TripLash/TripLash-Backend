const express = require('express');
const router = express.Router();
const ApplicationController = require('../Controllers/applicationController');
const protect = require('../util/middlewares');


router.post('/create-tour-application', protect(['client']) , ApplicationController.createTourAppliaction);
router.post('/create-guide-application', protect(['client']) , ApplicationController.createGuideApplication);
router.delete('/cancel-application/:appId' , ApplicationController.cancelApplication);
router.get('/get-application/:appId' , protect(['client' , 'guide']) , ApplicationController.getApplication);
router.get('/get-user-application' , protect(['client']) , ApplicationController.getUserApplications);
router.get('/get-guide-application' , protect(['guide']) , ApplicationController.getGuideApplications);
router.get('/get-all-tours-applications' , protect(['admin']) , ApplicationController.getAllToursApplications);
router.get('/get-all-guides-applications' , protect(['admin']) , ApplicationController.getAllGuidesApplications);


module.exports = router;