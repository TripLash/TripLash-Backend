const nodemailer = require('nodemailer');
const admin = require('../firebase-admin');
const Notification = require('../Models/notificationModels');
const {NOTIFICATION_TYPES } = require('../constants/notification-types');
const User = require('../Models/userModel');
const multer = require('multer');
const path = require('path');

exports.generateVerificationCode = () => {
    const min = 1000; // Minimum 4-digit number
    const max = 9999; // Maximum 4-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;

}
// Create a nodemailer transporter using your Gmail account
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.sendVerificationCode = async (email, generated_code) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is: ${generated_code}`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Verification code sent to ${email}`);
  } catch (error) {
    console.error(`Error sending verification code: ${error.message}`);
    throw error;
  }
}


exports.validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};



exports.sendFCMNotification = async (user, title, body, notification_type) => {
  try {
    const userObj = await User.findById(user);

    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: userObj.fcmToken,
    };
    if (notification_type == NOTIFICATION_TYPES.MENU) {
      await Notification.create({ title: title, body: body, user: user._id });
    }
    // Send the message using Firebase Admin SDK
    console.log(userObj.fcmToken)
    await admin.messaging().send(message);
  } catch (error) {
    console.error(`Error sending FCM notification: ${error.message}`);
  }
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the destination folder where files will be stored
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for each uploaded file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize multer upload middleware
exports.upload = multer({ storage: storage });