const nodemailer = require('nodemailer');


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
