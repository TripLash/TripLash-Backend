const User = require('../Models/userModel');
const GuideApp = require('../Models/GuideAppModel');
const TourApp = require('../Models/TourAppModel');
const Guide = require('../Models/guideModel');
const Tour = require('../Models/tourModel');
const catchAsync = require('../util/catchAsync');


exports.getProfile = catchAsync(async(req , res , next) =>{
    const user = req.user;
    
    res.status(200).json({
        status: 'success',
        data:{
            user
        }
    })
});


//for admin only
exports.getAllUsers = catchAsync(async(req , res , next) =>{
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        data:{
            users
        }
    })
});


exports.UpdateUser = catchAsync(async(req , res , next) =>{
    // Update user object based on req.user._id
    const user = req.user;
    const updates = req.body;
    // Update each field in the user object
    Object.keys(updates).forEach(key => {
        user[key] = updates[key];
    });

    // Save the updated user object
    await user.save();

    res.status(200).json({ user });
});


exports.deleteAccount = catchAsync(async(req , res , next) =>{
    const user = req.user;
    await User.findByIdAndDelete(req.user);
    //delete applications of this user from guide and tour applications
    await GuideApp.findOneAndDelete({user: user});
    await TourApp.findOneAndDelete({user: user});
    //delete tours that user create 
    await Tour.deleteMany({user: user});
    //if there is guide delete it 
    const guide  = await Guide.find({user: user});
    //delete guide tours
    await Tour.deleteMany({user: guide._id});
    if(guide){
        await Guide.findByIdAndDelete(guide._id);
    }


    return res.status(200).json({
        status:'user deleted successfully!'
    })
});

//for admin only
exports.deleteUser = catchAsync(async(req ,res , next) => {
    const user = req.params.userId;
    console.log(user);
    await User.findByIdAndDelete(user);
    //delete applications of this user from guide and tour applications
    await GuideApp.findOneAndDelete({user: user});
    await TourApp.findOneAndDelete({user: user});
    //delete tours that user create 
    await Tour.deleteMany({user: user});
    //if there is guide delete it 
    const guide  = await Guide.find({user: user});
    if(guide){
        await Guide.findByIdAndDelete(guide._id);
    }


    return res.status(200).json({
        status:'user deleted successfully!',
        user
    })
});

//for admin only
exports.getUser = catchAsync(async(req , res , next) =>{
    const id = req.params.userId;
    const user = await User.findById(id);
    
    res.status(200).json({ user });
});

//for admin only
exports.addAdmin = catchAsync(async(req , res , next) =>{
    const id = req.params.userId;
    const user = await User.findById(id);
    await user.addRole('admin');
    await user.save();
    res.status(200).json({ user });
});

//for admin only
exports.removeAdmin = catchAsync(async(req , res , next) =>{
    const id = req.params.userId;
    const user = await User.findById(id);
    await user.removeRole('admin');
    await user.save();
    res.status(200).json({ user });
});