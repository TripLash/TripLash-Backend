const express = require('express');
const router = express.Router();
const guideController = require('../Controllers/guideController');
const protect = require('../util/middlewares');

router.post('/create-guide',  protect(['client']) , guideController.createGuide);
router.get('/get-guides', guideController.getTourGuides);
router.get('/guide/:id',guideController.getGuideById);
router.get('/guide-tours/:guideId' , guideController.guideTours); // not finished yet
router.get('/accept-application' , guideController.acceptApplication) // not finished yet

module.exports = router;
