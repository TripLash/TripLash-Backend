const express = require('express');
const router = express.Router();
const guideController = require('../Controllers/guideController');
const protect = require('../util/middlewares');

router.post('/createGuide/',  protect(['client']) , guideController.createGuide);
router.get('/get-guides/', guideController.getTourGuides);
module.exports = router;
