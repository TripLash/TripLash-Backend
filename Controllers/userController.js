const User = require('../Models/userModel');
const catchAsync = require('../util/catchAsync');


exports.getProfile = catchAsync(async(req , res , next) =>{
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

exports.deleteUser = catchAsync(async(req , res , next) =>{
    await User.findByIdAndDelete(req.user._id);
    return res.status(200).json({
        status: 'success'
    })
})

exports.getUser = catchAsync(async(req , res , next) =>{
    const id = req.params.userId;
    const user = await User.findById(id);
    
    res.status(200).json({ user });
});

exports.addAdmin = catchAsync(async(req , res , next) =>{
    const id = req.params.userId;
    const user = await User.findById(id);
    await user.addRole('admin');
    await user.save();
    res.status(200).json({ user });
});
//TODO:
exports.deleteUser = catchAsync(async(req , res , next) =>{
    await User.findByIdAndDelete(req.user._id);
    //delete applications of this user from guide and tour applications
    //delete tours that user create 
    //if there is guide delete it 
    return res.status(200).json({
        status:'user deleted successfully!'
    })
});