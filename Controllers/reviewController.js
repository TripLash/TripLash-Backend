const Review = require('../Models/reviewModel');
const catchAsync = require('../util/catchAsync');
const {sendFCMNotification} = require('../util/generics');
const Tour = require('../Models/tourModel');
const Guide = require('../Models/guideModel')
const {NOTIFICATION_TYPES} = require('../constants/notification-types');


exports.createReview = catchAsync(async (req, res, next) => {
    const {review , guide , tour , rating , photos , reviewType} = req.body;
    const user = req.user;

    console.log(review  , guide , tour , rating , photos , reviewType);
    const newReview = await  Review.create({
        review,
        tour,
        guide,
        rating,
        user,
        reviewType
    })
    if (req.files && req.files.length > 0) {
        newReview.photos = req.files.map(file => file.path);
        await newReview.save();
    }
    const tourObj = await Tour.findById(tour);
    const guideObj = await Guide.findById(guide);
    if(reviewType == 'tour review'){
        await sendFCMNotification(tourObj.user, 'New Review', `New review from ${user.firstname} ${user.lastname}`, NOTIFICATION_TYPES.MENU);
    }else if(reviewType == 'guide review'){
        await sendFCMNotification(guideObj, 'New Review', `New review from ${user.firstname} ${user.lastname}`, NOTIFICATION_TYPES.MENU);
    }
        res.status(201).json({
        status: "success",
        message: 'created',
        newReview
    })
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { rating } = req.query;

    const tour = await Tour.findById(id);
    const guide = await Guide.findById(id);

    let filter = {};

    if (tour) {
        filter.tour = id;
        console.log('tour');
    } 
    if (guide) {
        filter.guide = id;
        console.log('guide');
    }

    if (rating) {
        filter.rating = rating;
    }

    const reviews = await Review.find(filter)
        .populate('user')
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: "success",
        reviewsQuantity: reviews.length,
        reviews
    });
});

// DELETE review endpoint
exports.deleteReview = catchAsync(async (req, res, next) => {
    const reviewId = req.params.reviewId;
    console.log(reviewId);
    // Check if review exists
    const review = await Review.findById(reviewId);
    console.log(review);
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
