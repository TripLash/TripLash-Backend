const User = require('../Models/userModel');
const catchAsync = require('../util/catchAcync')


exports.getUser = catchAsync(async(req , res , next) =>{
    const user = await User.findById(req.param.id);

    res.status(200).json({
        status: 'success',
        data:{
            user
        }
    })
});

exports.getAllUsers = catchAsync(async(req , res , next) =>{
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        data:{
            users
        }
    })
});