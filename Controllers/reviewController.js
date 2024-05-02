const Review = require('../Models/reviewModel');
const catchAsync = require('../util/catchAsync');
const {sendFCMNotification} = require('../util/generics');
const Tour = require('../Models/tourModel');
const {NOTIFICATION_TYPES} = require('../constants/notification-types');

exports.createReview = catchAsync(async (req, res, next) => {
    const {review , tour , rating , photos} = req.body;
    const user = req.user;

    console.log(review  , tour , rating , photos);
    const newReview = await  Review.create({
        review,
        tour,
        rating,
        user,
        photos
    })
    const tourObj = await Tour.findById(tour);
    await sendFCMNotification(tourObj.user, 'New Review', `New review from ${user.firstname} ${user.lastname}`, NOTIFICATION_TYPES.MENU);
    res.status(201).json({
        status: "success",
        message: 'created',
        newReview
    })
});

exports.getAllReviews = catchAsync(async (req, res, next)=> {
    const { tourId } = req.params;
    const { rating } = req.query;

    const filter = { tour: tourId };
    if (rating) {
        filter.rating = rating;
    }
    const reviews = await Review.find(filter).populate('user', 'firstname lastname').sort({ createdAt: -1 });
    
    // console.log(reviews)
    res.status(200).json(reviews);
});

// DELETE review endpoint
exports.deleteReview = catchAsync(async (req, res, next) => {
    const reviewId = req.params.reviewId;

    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({ status: "fail", message: "Review not found" });
    }

    // Check if the user is authorized to delete the review
    if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ status: "fail", message: "You are not authorized to delete this review" });
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ status: "success", message: "Review deleted successfully" });
});

// UPDATE review endpoint
exports.updateReview = catchAsync(async (req, res, next) => {
    const reviewId = req.params.reviewId;
    const { review, rating } = req.body;

    // Check if review exists
    const existingReview = await Review.findById(reviewId);
    if (!existingReview) {
        return res.status(404).json({ status: "fail", message: "Review not found" });
    }

    // Check if the user is authorized to update the review
    if (existingReview.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ status: "fail", message: "You are not authorized to update this review" });
    }

    // Update the review
    existingReview.review = review || existingReview.review;
    existingReview.rating = rating || existingReview.rating;
    await existingReview.save();

    res.status(200).json({ status: "success", data: existingReview });
});
