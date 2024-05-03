const Guide = require('../Models/guideModel');
const User = require('../Models/userModel')
const Tour = require('../Models/tourModel')
const catchAsync = require('../util/catchAsync');
const Review = require('../Models/reviewModel');
const GuideApplication = require('../Models/GuideAppModel');
const AppError = require('../util/appError');


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
        fav_activities
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
                fav_activities
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
//TODO filter
exports.getTourGuides = catchAsync(async (req ,res ,next) => {
    const guides = await Guide.find().populate('user', 'firstname lastname country city birth_date').populate({
            path: 'languages',
            select: 'name experience'
        });

    res.json(guides);
})

exports.getGuideById = catchAsync(async (req, res, next) => {
    const guideId = req.params.id;

    try {
        const guide = await Guide.findById(guideId)
            .populate('user', 'firstname lastname country city birth_date')
            .populate({
                path: 'languages',
                select: 'name experience'
            })
            .select('-__v'); // Exclude the '__v' field from the response

        if (!guide) {
            return res.status(404).json({ status: 'fail', message: 'Guide not found' });
        }

        res.json({ status: 'success', data: guide });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
});

exports.guideTours = catchAsync(async (req , res , next) =>{
    const guideId = req.params.guideId;
    const tours = await Tour.find({user: guideId});

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

//TODO
exports.deleteGuide = catchAsync(async (req , res , next) =>{
  //delete applicaions
  //await GuideApplication.deleteMany({guide: guideId});
  //delete reviews
})

//TODO
exports.acceptApplication = catchAsync(async (req , res ,next) =>{
    //if tour.tourCategory == 'user'
})
