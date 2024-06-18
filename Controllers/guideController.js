const Guide = require('../Models/guideModel');
const User = require('../Models/userModel')
const Tour = require('../Models/tourModel')
const catchAsync = require('../util/catchAsync');
const Review = require('../Models/reviewModel');
const GuideApplication = require('../Models/GuideAppModel');
const TourApplication = require('../Models/TourAppModel');
const AppError = require('../util/appError');
const ApiFeature = require('../util/apiFeatures');


exports.createGuide = catchAsync(async (req, res, next) => {
    const {
        languages,
        liveIn,
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

    const user = req.user;

    // console.log(user);

    try {
        if (user && identity_check) {
            // Assuming addRole and save methods exist in the User model to handle role assignment
            await user.addRole('guide');
            await user.save();

            const newGuide = await Guide.create({
                user,
                languages,
                liveIn, // Uncomment if liveIn is supposed to be included
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

// Get all tour guides so the client can reserve  a guide for a specific trip
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
    
    const guides = await Guide.find(query).populate('user', 'firstname lastname country city birth_date').populate({
        path: 'languages',
        select: 'name experience'
    });

    res.json({
        status:'success',
        guidesQuantity: guides.length,
        data:guides
    });
})

//TODO: don't find any guide why?
exports.getGuide = catchAsync(async (req, res, next) => {
    const guideId = req.user;
    console.log(guideId._id.toString());

    try {
        const guide = await Guide.findById(guideId._id)
            .populate('user', 'firstname lastname country city birth_date')
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
        console.log(user);
        const tours = await Tour.find({ user: user });
        console.log(tours);

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
    const guideId = req.params.guideId;
    const tours = await Tour.find({user: guideId});

    //TODO handle tours that user requested (user tours)

    if(!tours){
        return next(new AppError('there is no tour for this guide'));
    }

    res.status(200).json({
        status: 'success',
        toursquantity: tours.length,
        tours
    })
});

//TODO
exports.updateGuide = catchAsync(async (req , res ,next) =>{

})

//TODO guide don't deleted
exports.deleteGuide = catchAsync(async (req , res , next) =>{
    const guide = req.user;
    //delete guide
    await Guide.findByIdAndDelete(guide);
    //delete applicaions
    await GuideApplication.deleteMany({tour_guide: guide});
    await TourApplication.deleteMany({'tour.user': guide});
    //delete tours
    await Tour.deleteMany({user: guide});
    //delete reviews
    await Review.deleteMany({guide: guide});
    
    
    res.status(200).json({
        status:'Guide deleted successfully!'
    })
})

//TODO add notification here for client
exports.acceptApplication = catchAsync(async (req , res ,next) =>{
    //make application's status upcomming
    const appId = req.params
    const application = await GuideApplication.findById(appId);
    application.status = 'upcomming';
    await application.save();

    const pendingApplications = await GuideApplication.find({ status: 'pendening' });
    
    //TODO: add notification for client
    //use application.user as the id of the user
    
    
    
    //add tour to guide's tours
    // const guide = await Guide.findById(application.guide);
    // guide.tours.push(application.tour);
    // await guide.save();

    res.status(200).json({
        status:'success',
        pendingApplications: pendingApplications
    })

})
