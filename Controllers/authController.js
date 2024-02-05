const User = require('../Models/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const jwt = require('jsonwebtoken');
const {ms_signup_invalid_password} = require('../util/error_messages');

const generateAccessToken = id =>{
    return jwt.sign({ id } , process.env.JWT_SECRET , {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user , statusCode , req , res) =>{
    const token = generateAccessToken(user._id);
    
    // not used in RestAPI
    // res.cookie('jwt' , token , {
    //     expires: new Date(
    //         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    //     ),
    //     httpOnly: true,
    //     secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    // });

    // user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            mobile: user.mobile,
            user_types: user.user_types,
            language: user.language,
            currancy: user.currancy
        }
    })
};

exports.signup = catchAsync(async(req , res , next) => {
    const {name, mobile, email, password, language} = req.body;
    const nameArray = name.split(' ');
    const firstName = nameArray[0];
    const lastName = nameArray.slice(1).join(' ');
    // lastname = ;
    const newUser = await User.create({
        firstname: firstName,
        lastname: lastName,
        email,
        mobile,
        password,
        language
    })

    createSendToken(newUser , 201 , req , res)
});

exports.login = catchAsync(async(req , res , next) =>{
    
    console.log(req.body);
    let user; // get user by email or mobile
    if(req.body.email){
        user = await User.findOne({ email: req.body.email }).select('+password');
    }else{
        user = await User.findOne({ mobile: req.body.mobile }).select('+password');
    }
    
    if(!user || !(await user.checkPassword(req.body.password , user.password))){
        return next(new AppError(ms_signup_invalid_password[user.language] , 400));
    }

    createSendToken(user , 200 , req , res);
});