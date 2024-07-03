const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/reviewController');
const protect = require('../util/middlewares');
const {upload} = require('../util/generics');

router.post('/create-review', protect(['client', 'guide']),  upload.array('photos'),reviewController.createReview);
router.get('/get-reviews/:id', reviewController.getAllReviews);
// Delete review route
router.delete('/delete-review/:reviewId', protect(['client', 'guide']), reviewController.deleteReview);
// Update review route
router.patch('/update-review/:reviewId', protect(['client', 'guide']), reviewController.updateReview);



module.exports = router;