const express = require('express');
const router = express.Router();
const guideController = require('../Controllers/guideController');
const protect = require('../util/middlewares');

router.post('/create-guide',  protect(['client']) , guideController.createGuide);
router.get('/get-all-guides', guideController.getTourGuides);
router.get('/guide/:id', protect(['client', 'guide', 'admin']) , guideController.getGuide);
router.get('/guide-tours/:guideId' , guideController.guideTours);
router.get('/accept-application' , guideController.acceptApplication) 
router.patch('/update-guide' , guideController.updateGuide) // not finished yet
router.delete('/delete-guide' , protect(['guide']) , guideController.deleteGuide) 

module.exports = router;
