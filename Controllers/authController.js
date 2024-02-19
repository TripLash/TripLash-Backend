const User = require('../Models/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const jwt = require('jsonwebtoken');
const { ms_signup_invalid_password, ms_reset_password_expire_date, ms_reset_password_invalid_code, ms_reset_password_changed, ms_signup_email_exists, ms_signup_email_dont_exists } = require('../util/error_messages');
const { sendVerificationCode, generateVerificationCode, validateEmail } = require('../util/generics');



const generateAccessToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, req, res) => {
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

exports.signup = catchAsync(async (req, res, next) => {
    const { name, mobile, email, password, language } = req.body;
    const nameArray = name.split(' ');
    const firstName = nameArray[0];
    const lastName = nameArray.slice(1).join(' ');
    // lastname = ;
    const user = await User.findOne({email});
    if (user){
        return res.status(400).json({
            status: "failed",
            message: ms_signup_email_exists[user.language]
        })
    }
    const newUser = await User.create({
        firstname: firstName,
        lastname: lastName,
        email,
        mobile,
        password,
        language
    })

    createSendToken(newUser, 201, req, res)
});

exports.login = catchAsync(async (req, res, next) => {

    const {username} = req.body;
    let user; // get user by email or mobile
    // console.log(req.body);
    if (validateEmail(username)) {
        user = await User.findOne({ email: username }).select('+password');
    }else{
        user = await User.findOne({ mobile: username }).select('+password');
    }
    if (!user) {
        return res.status(400).json({
            status: 'failed',
            message: ms_signup_email_dont_exists['E']
        });
    }
    if (!user || !(await user.checkPassword(req.body.password, user.password))) {
        // return next(new AppError(ms_signup_invalid_password[user.language], 400));
        return res.status(400).json({
            status: 'failed',
            message: ms_signup_invalid_password[user.language]
        });
    }

    createSendToken(user, 200, req, res);
});

// check email 
exports.checkEmail = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            status: "failed"
        })
    }
    return res.status(200).json({
        status: "success"
    })
})

// send verification code
exports.sendVerificationCodeApi = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const generated_code = generateVerificationCode();
    const user = await User.findOne({ email });
    if (!user){
        return res.status(400).json({
            status: "failed"
        })
    }
    user.code = generated_code;
    user.code_timestamps = Date.now()

    await user.save()
    await sendVerificationCode(email, generated_code);
    return res.status(200).json({
        status: "success"
    })
});


function check_code(user, code, res) {
    if (user && user.code === code) {
        const currentTime = Date.now();
        const timeDifference = currentTime - user.code_timestamps;
        const expirationTime = 60 * 1000; // 1 minute in milliseconds

        // Check if the code is still valid (within the expiration time)
        if (timeDifference <= expirationTime) {
            console.log('Verification successful');

            // Clear the verification code and timestamp after successful verification
            //   user.code = undefined;
            //   await user.save();
            return true;
        } else {
            console.log('Verification code has expired');
            return res.status(400).json({
                status: "failed",
                message: ms_reset_password_expire_date[user.language]
            })
        }
    } else {
        console.log('Invalid verification code');
        return res.status(400).json({
            status: "failed",
            message: ms_reset_password_invalid_code[user.language]
        })
    }
}
// verify code with email 
exports.verifyEmail = catchAsync(async (req, res, next) => {
    const { code, email } = req.body;
    const user = await User.findOne({ email });
    const validation_result = check_code(user, code, res);
    if (validation_result !== true){
        return validation_result;
    }
    return res.status(200).json({
        status: "success",
    });

})
// reset password 
exports.resetPassword = catchAsync(async (req, res, next) => {
    const { email, newPassword, code } = req.body;
    const user = await User.findOne({ email });
    const validation_result = check_code(user, code, res);
    if (validation_result !== true) return validation_result;
    
    user.code = undefined;
    // set new password and remove verification code and timestamp
    user.password = newPassword;
    await user.save();
    const generated_token = generateAccessToken(user._id);
    
    return res.status(200).json({
        status: "success",
        token: generated_token,
        message: ms_reset_password_changed[user.language]
    });
})
