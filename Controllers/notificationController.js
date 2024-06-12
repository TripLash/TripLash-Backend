const Notification = require('../Models/notificationModels');
const catchAsync = require('../util/catchAsync');

// get all notifications
exports.getAllNotifications = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1
    const limit = parseInt(req.query.limit) || 10; // Number of notifications per page, default to 10
    const skip = (page - 1) * limit; // Calculate the number of notifications to skip
    
    
    // Update the readStatus of all notifications for the user
    await Notification.updateMany(
        { user: req.user._id, readStatus: false }, // Only update unread notifications
        { $set: { readStatus: true } }
    );

    // Query notifications based on user ID and apply pagination
    const notifications = await Notification.find({ user: req.user._id })
        .populate('user', 'firstname lastname photo')
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
});

exports.deleteAllNotifications = catchAsync(async(req , res , next) =>{
    const notifications = await Notification.deleteMany({user: req.user._id});
    res.status(200).json({
        status: 'success'
    })
});

exports.deleteNotification = catchAsync(async(req , res , next) =>{
    const notification = await Notification.findByIdAndDelete(req.params.notificationId);
    res.status(200).json({
        status: 'success'
    })
})

// just for testing
exports.createNotification = catchAsync(async(req , res , next) =>{
    let body = req.body;
    body.user = req.user._id
    const notification = await Notification.create(body);
    res.status(200).json({
        status: 'success',
        data: {
            notification
        }
    })
})