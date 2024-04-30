const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/reviewController');
const protect = require('../util/middlewares');


router.post('/create-review', protect(['client', 'guide']),  reviewController.createReview);
router.get('/get-reviews/:id', reviewController.getAllReviews);
// Delete review route
router.post('/delete-review/:reviewId', protect(['client', 'guide']), reviewController.deleteReview);
// Update review route
router.post('/update-review/:reviewId', protect(['client', 'guide']), reviewController.updateReview);



module.exports = router;