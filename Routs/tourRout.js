const express = require('express');

const router  = express.Router();
const protect = require('../util/middlewares');
const tourController = require('../Controllers/tourController');

router.get('/get-all-tours' , tourController.getTours);
router.get('/get-tour/:id' , tourController.getTour);
router.post('/create-tour' , protect(['guide' , 'client']), tourController.createTour);
router.get('/top-tours' , tourController.aliasTopTours); // don't work why???s
router.delete('/delete-tour/:id', protect(['guide' , 'client', 'admin']), tourController.deleteTour); // not finished yet
router.patch('/update-tour/:tourId' , tourController.updateTour); // not finished yet

module.exports = router;
