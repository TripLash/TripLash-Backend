const Guide = require('../Models/guideModel');
const User = require('../Models/userModel')
const Tour = require('../Models/tourModel')
const catchAsync = require('../util/catchAsync');

exports.createGuide = catchAsync(async(req , res , next)=>{

    const {userId , languages , liveIn , aboutYou ,  hourPrice ,
     hdayPrice , dayPrice , included , guideIn , identity_photo , 
    identity_check , show_tours , fav_activities
    } = req.body;

    const user = await User.findOne(User.userId);

    console.log(user);

    if(user && identity_check){

        await user.addRole('guide');
        await user.save();

        const newGuide = await Guide.create({
            user,
            languages,
            liveIn , 
            aboutYou ,
            hourPrice , 
            hdayPrice , 
            dayPrice , 
            included , 
            guideIn , 
            identity_photo , 
            identity_check ,
            show_tours , 
            fav_activities
        })

        res.status(200).json({
            status: 'success',
            data:{
                newGuide
            }
        })
    }
})