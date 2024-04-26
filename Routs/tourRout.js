const express = require('express');

const router  = express.Router();
const protect = require('../util/middlewares');
const tourController = require('../Controllers/tourController');

router.get('/get-tours/' , tourController.getTours);
router.get('/get-tour/:id' , tourController.getTour);
router.post('/create-tour/' , protect(['guide']), tourController.createTour);
router.get('/topTours/' , tourController.aliasTopTours); // don't work why???s
router.delete('/deleteTour/:toutId' , tourController.deleteTour); // not finished yet
router.patch('/updateTour/:toutId' , tourController.updateTour); // not finished yet

module.exports = router;
