const Guide = require('../Models/guideModel');
const User = require('../Models/userModel')
const Tour = require('../Models/tourModel')
const catchAsync = require('../util/catchAsync');

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
exports.getTourGuides = catchAsync(async (req ,res ,next) => {
    const guides = await Guide.find().populate('user', 'firstname lastname country city birth_date').populate({
            path: 'languages',
            select: 'name experience'
        });

    res.json(guides);
})