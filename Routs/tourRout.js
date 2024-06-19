const express = require('express');

const router  = express.Router();
const protect = require('../util/middlewares');
const tourController = require('../Controllers/tourController');
const {upload} = require('../util/generics');


router.get('/get-all-tours' , tourController.getTours);
router.get('/get-all-tours-protect/', protect(['client', 'guide', 'admin']) , tourController.getTours);
router.get('/get-tour/:id' , tourController.getTour);
router.post('/create-tour' , protect(['guide' , 'client']), upload.array('photos'), tourController.createTour);
router.delete('/delete-tour/:id', protect(['guide' , 'client', 'admin']), tourController.deleteTour);
router.patch('/update-tour/:tourId' , tourController.updateTour); // not finished yet
router.delete('/delete-all-tours' , protect(['admin']) , tourController.deleteAllTours);
router.get('/get-last-search/', protect(['client', 'guide', 'admin']) , tourController.getLastSearch);



module.exports = router;
