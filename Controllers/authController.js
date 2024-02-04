const User = require('../Models/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const jwt = require('jsonwebtoken');


const signToken = id =>{
    return jwt.sign({ id } , process.env.JWT_SECRET , {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user , statusCode , req , res) =>{
    const token = signToken(user._id);

    res.cookie('jwt' , token , {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    })
};

exports.signup = catchAsync(async(req , res , next) => {
    const newUser = await User.create({
       //how to get the first and last name while there is name only???????
       fname: req.body.fname,
       lname: req.body.lname,
       email: req.body.email,
       mobile: req.body.mobile,
       password: req.body.password
    })

    createSendToken(newUser , 201 , req , res)
});

exports.login = catchAsync(async(req , res , next) =>{
    const { email , mobile , password } = req.body;

    if((!email && !mobile )|| !password){
        return next(new AppError('please enter email or mobile and password!' , 400))
    }

    if(email){
        const user = await User.findOne({ email }).select('+password');
    }else{
        const user = await User.findOne({ mobile }).select('+password');
    }

    // console.log(user)

    if(!user || !(await user.corrctPassword(password , user.password))){
        return next(new AppError('please enter valid email or mobile or password' , 400));
    }

    createSendToken(user , 200 , req , res);

});