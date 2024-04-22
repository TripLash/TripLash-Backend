const Notification = require('../Models/notificationModels');
const catchAsync = require('../util/catchAsync');

// get all notifications
exports.getAllNotifications = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1
    const limit = parseInt(req.query.limit) || 10; // Number of notifications per page, default to 10
    const skip = (page - 1) * limit; // Calculate the number of notifications to skip

    // Query notifications based on user ID and apply pagination
    const notifications = await Notification.find({ user: req.user._id })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Optionally, you can sort by createdAt in descending order

    const totalNotifications = await Notification.countDocuments({ user: req.user._id });

    res.status(200).json({
        status: 'success',
        data: {
            notifications,
            totalNotifications,
            currentPage: page,
            totalPages: Math.ceil(totalNotifications / limit)
        }
    });
});

// get notification count
exports.getNotificationCount = catchAsync(async(req , res , next) =>{
    const notificationCounts = await Notification.find({user: req.user._id, readStatus: false}).count();
    res.status(200).json({
        status: 'success',
        count: notificationCounts
    })
})