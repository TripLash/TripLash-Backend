const User = require('../Models/userModel');
const catchAsync = require('../util/catchAsync');


exports.getUser = catchAsync(async(req , res , next) =>{
    const user = req.user;
    
    res.status(200).json({
        status: 'success',
        data:{
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            mobile: user.mobile,
            user_type: user.user_type,
            language: user.language,
            currancy: user.currancy
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

//TODO
exports.UpdateUser = catchAsync(async(req , res , next) =>{

});

//TODO
exports.deleteUser = catchAsync(async(req , res , next) =>{

})