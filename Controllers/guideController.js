const Guide = require('../Models/guideModel');
const User = require('../Models/userModel')
const Tour = require('../Models/tourModel');
const identity = require('../Models/IDModel');
const catchAsync = require('../util/catchAsync');
const Review = require('../Models/reviewModel');
const GuideApplication = require('../Models/GuideAppModel');
const TourApplication = require('../Models/TourAppModel');
const AppError = require('../util/appError');
const ApiFeature = require('../util/apiFeatures');
const {sendFCMNotification} = require('../util/generics');
const {NOTIFICATION_TYPES} = require('../constants/notification-types');

exports.addID = catchAsync(async (req , res , next) =>{
    const {id , name} = req.body;
    await identity.create({
        id,
        name
    });

    res.status(200).json({
        message: 'ID created'
    })
})

exports.createGuide = catchAsync(async (req, res, next) => {
    const {
        languages,
        aboutYou,
        hourPrice,
        halfDayPrice, 
        dayPrice,
        included,
        guideIn,
        identity_photo,
        identity_ID,
        show_tours,
        fav_activities,
        city,
        country
    } = req.body;

    const user = req.user;

    try {
        const identity_check = await identity.findOne({id: identity_ID});
        if (user && identity_check) {
            // Assuming addRole and save methods exist in the User model to handle role assignment
            await user.addRole('guide');
            await user.save();

            const newGuide = await Guide.create({
                user,
                languages,
                aboutYou,
                hourPrice,
                halfDayPrice,
                dayPrice,
                included,
                guideIn,
                identity_photo,
                identity_ID,
                show_tours,
                fav_activities,
                city,
                country
            });

            res.status(201).json({
                status: 'success',
                data: {
                    newGuide
                }
            });
        } else {
            res.status(400).json({
                status: 'fail',
                message: 'User identity not verified or user not provided'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all tour guides so the client can reserve  a guide for a specific trip
//TODO: faviorate guides
exports.getTourGuides = catchAsync(async (req ,res ,next) => {
    const languages = req.query.languages; // Expecting a comma-separated list of languages
    const hourPrice = req.query.hourPrice; // Expecting a number

    let query = {};

    if (languages) {
    const languageArray = languages.split(',').map(lang => lang.trim());
    query['languages.name'] = { $all: languageArray };
    }

    if (hourPrice) {
    query.hourPrice = { $lte: parseFloat(hourPrice) };
    }
    
    const guides = await Guide.find(query).populate('user', 'firstname lastname country city birth_date photo').populate({
        path: 'languages',
        select: 'name experience'
    });

    res.json({
        status:'success',
        guidesQuantity: guides.length,
        data:guides
    });
})

exports.getGuide = catchAsync(async (req, res, next) => {
    const guideId = req.params.id;
    // console.log(guideId._id.toString());

    try {
        const guide = await Guide.findById(guideId)
            .populate('user', 'firstname lastname country city birth_date photo')
            .populate({
                path: 'languages',
                select: 'name experience'
            })
            .select('-__v'); // Exclude the '__v' field from the response

        if (!guide) {
            return res.status(404).json({ status: 'fail', message: 'Guide not found' });
        }
        const reviews = await Review.find({ reviewType: 'guide review' , guide: guide._id});
        const user = await User.findById(guide.user);
        // console.log(user);
        const tours = await Tour.find({ user: user });
        // console.log(tours);

        res.status(200).json({ 
            status: 'success',
             data: guide,
             reviewsQuantity: reviews.length,
             reviews,
             toursQuantity: tours.length,
             tours
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
});


exports.guideTours = catchAsync(async (req , res , next) =>{
    // const guideId = req.params.guideId;
    const user = req.user;
    const guide = await Guide.find({user: user});
    const tours = await Tour.find({user: guide._id});

    // handle tours that user requested (user tours)
    const userTours = await GuideApplication.find({tour_guide: guide._id});

    if(!tours && !userTours){
        return next(new AppError('there is no tour for this guide'));
    }

    res.status(200).json({
        status: 'success',
        toursquantity: tours.length + userTours.length,
        tours,
        userTours
    })
});

exports.guideToursAdmin = catchAsync(async (req , res , next) =>{
    const guideId = req.params.guideId;
    const tours = await Tour.find({user: guideId});

    // handle tours that user requested (user tours)
    const userTours = await GuideApplication.find({tour_guide: guideId});

    if(!tours && !userTours){
        return next(new AppError('there is no tour for this guide'));
    }

    res.status(200).json({
        status: 'success',
        toursquantity: tours.length + userTours.length,
        tours,
        userTours
    })
});


exports.updateGuide = catchAsync(async (req , res ,next) =>{
    const user = req.user;
    
    if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // console.log('Updating guide for user:', user._id); // Debug log

    const updatedData = req.body;
    
    // Find the guide document
    const guide = await Guide.findOne({ user: user._id });

    if (!guide) {
        console.log('Guide not found for user:', user._id); // Debug log
        return res.status(404).json({ message: 'Guide not found' });
    }

    // Update specific fields
    if (updatedData.languages) {
        updatedData.languages.forEach(updatedLang => {
            const lang = guide.languages.id(updatedLang._id);
            if (lang) {
                if (updatedLang.experience) {
                    lang.experience = updatedLang.experience;
                }
                if (updatedLang.name) {
                    lang.name = updatedLang.name;
                }
            }
        });
    }

    // Update other fields directly
    Object.keys(updatedData).forEach(key => {
        if (key !== 'languages') {
            guide[key] = updatedData[key];
        }
    });

    // Save the updated guide document
    const updatedGuide = await guide.save();

    console.log('Updated guide:', updatedGuide); // Debug log
    res.status(200).json(updatedGuide);
})


exports.deleteGuideAccount = catchAsync(async (req , res , next) =>{
    const guideId = req.params.guideId;
    const guide = Guide.findById(guideId);
    const userId = guide.user;
    const user = User.findById(userId);
    //delete guide
    await Guide.findByIdAndDelete(guideId);
    //delete applicaions
    await GuideApplication.deleteMany({tour_guide: guideId});
    await TourApplication.deleteMany({'tour.user': guideId});
    //delete tours
    await Tour.deleteMany({user: guideId});
    //delete reviews
    await Review.deleteMany({guide: guideId});
    //delete role from user 
    await user.removeRole('admin');
    await user.save();
    
    res.status(200).json({
        status:'Guide deleted successfully!'
    })
});

//for admin only
exports.deleteGuide = catchAsync(async(req ,res , next) => {
    const guideId = req.params.guideId;
    const guide = Guide.findById(guideId);
    const userId = guide.user;
    const user = User.findById(userId);
    //delete guide
    await Guide.findByIdAndDelete(guideId);
    //delete applicaions
    await GuideApplication.deleteMany({tour_guide: guideId});
    await TourApplication.deleteMany({'tour.user': guideId});
    //delete tours
    await Tour.deleteMany({user: guideId});
    //delete reviews
    await Review.deleteMany({guide: guideId});
    //delete role from user 
    await user.removeRole('admin');
    await user.save();
    
    
    res.status(200).json({
        status:'Guide deleted successfully!',
        user,
        guide
    })
});

//add notification here for client
exports.acceptApplication = catchAsync(async (req , res ,next) =>{
    //make application's status upcomming
    const appId = req.params
    const application = await GuideApplication.findById(appId);
    application.status = 'upcomming';
    await application.save();

    const pendingApplications = await GuideApplication.find({ status: 'pendening' });
    
    // add notification for client
    //use application.user as the id of the user
    //message: guide (applicaiton.guide) accepted you (application.tour.title) Tour application
    const guide_name = `${application.guide.firstname} ${application.guide.lastname}`
    await sendFCMNotification(application.user, 'Application Accepted', `${guide_name} accepted you ${application.tour.title} Tour application`, NOTIFICATION_TYPES.MENU);
    

    res.status(200).json({
        status:'success',
        pendingApplications: pendingApplications
    })

});

//for admin only
exports.addGuide = catchAsync(async (req , res ,next) =>{
    const {
        languages,
        aboutYou,
        hourPrice,
        halfDayPrice, // Fix variable name here
        dayPrice,
        included,
        guideIn,
        identity_photo,
        identity_check,
        show_tours,
        fav_activities,
        city,
        country
    } = req.body;

    const userId = req.params.userId;
    const user = await User.findById(userId);
    console.log(user);

    try {
        if (user && identity_check) {
            // Assuming addRole and save methods exist in the User model to handle role assignment
            await user.addRole('guide');
            await user.save();

            const newGuide = await Guide.create({
                user,
                languages,
                aboutYou,
                hourPrice,
                halfDayPrice, // Fix variable name here
                dayPrice,
                included,
                guideIn,
                identity_photo,
                identity_check,
                show_tours,
                fav_activities,
                city,
                country
            });

            res.status(201).json({
                status: 'success',
                data: {
                    newGuide
                }
            });
        } else {
            res.status(400).json({
                status: 'fail',
                message: 'User identity not verified or user not provided'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


