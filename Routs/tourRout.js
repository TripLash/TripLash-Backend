const express = require('express');

const router  = express.Router();
const protect = require('../util/middlewares');
const tourController = require('../Controllers/tourController');
const {upload} = require('../util/generics');


router.get('/get-all-tours' , tourController.getTours);
router.get('/get-all-tours-protect/', protect(['client', 'guide', 'admin']) , tourController.getTours);
router.get('/get-tour/:id' , tourController.getTour);
router.get('/get-tour-protect/:id' , protect(['client']) , tourController.getTour);
router.post('/create-tour' , protect(['guide' , 'client' , 'admin']), upload.array('photos'), tourController.createTour);
router.delete('/delete-tour/:id', protect(['guide' , 'client', 'admin']), tourController.deleteTour);
router.patch('/update-tour/:tourId' , upload.array('photos'), tourController.updateTour); // not finished yet
router.delete('/delete-all-tours' , protect(['admin']) , tourController.deleteAllTours);
router.get('/get-last-search/', protect(['client', 'guide', 'admin']) , tourController.getLastSearch);
router.get('/dashboard/', protect(['admin']) , tourController.dashboard);



module.exports = router;
