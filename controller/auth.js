const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const utils = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/auth");


const sendEmail = require("./../utils/sendMail");

const error = (res, code, message) => {
  return res.status(code).json({
    message,
  });
};  
// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};



exports.signup = async (req, res, next) => {

  const user = await User.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  
  sendTokenResponse(user, 200, res);
  // Verify email

};


exports.login = async (req, res, next) => {
  try{
  const { email, password, passwordConfirm } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      message: "Provide login credentials",
    });
  }
  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  console.log(password);
  const match = await user.correctPassword(password, user.password);
  if (!user || !match) {
    return res.status(400).json({
      message: "Invalid login credentials",
    });
  }

  sendTokenResponse(user, 200, res);
  
}
catch(err) {
  console.log(err);
  res.status(400).json({
    message: err
  })
}
};

exports.forgotPassword = async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (!user) {
    return error(res, 404, "User not found.");
  }
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/resetpassword/${resetToken}`;
  // console.log(resetURL);
  const message = `Forget your password. Follow the link ${resetURL}.\n If you didn't, ignore the link.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset link is valid for 10 minutes.",
      message
    });
    res.status(200).json({
      message: "Token sent via email. ",
    });
    console.log(sendEmail);
  } catch (err) {
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    (await user).save({ validateBeforeSave: false });
    
      res.status(500).json({
        message: "There was an error sending the mail. Please try again.",
    
      });
  }
};



exports.resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
      return next(error(res, 400, 'Link is invalid or expired'));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  sendTokenResponse(user, 200, res);
};
