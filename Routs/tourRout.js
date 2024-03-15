const express = require('express');

const router  = express.Router();
const protect = require('../util/middlewares');
const tourController = require('../Controllers/tourController');

router.get('/AllTours/' , tourController.GetAllTours);
router.get('/Tour/:id' , tourController.GetTour);
router.post('/newTour/' , tourController.CreateTour);
router.get('/topTours/' , tourController.aliasTopTours); // don't work why???s


module.exports = router;
