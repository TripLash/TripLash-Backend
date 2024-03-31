const express = require('express');

const router  = express.Router();
const protect = require('../util/middlewares');
const tourController = require('../Controllers/tourController');

router.get('/get-tours/' , tourController.getTours);
router.get('/get-tour/:id' , tourController.getTour);
router.post('/create-tour/' , protect(['guide']), tourController.createTour);
router.get('/topTours/' , tourController.aliasTopTours); // don't work why???s


module.exports = router;
