const crypto = require("crypto");
// const { promisify } = require('util');
const jwt = require("jsonwebtoken");
const User = require("./../models/auth");
// const catchAsync = require('./../utils/catchAsync');
// const AppError = require('./../utils/appError');
const sendEmail = require("./../utils/sendMail");

const error = (res, code, message) => {
  return res.status(code).json({
    message,
  });
};
exports.signup = async (req, res, next) => {
  const newUser = await User.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  // get user to send verification link
  const user = await User.findOne({ email: newUser.email });
  if (!user) {
    return error(res, 500, "User not found, Register again");
  }
  // Generate the random reset token
  const verificationToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // Send email
  const verificationURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verifypassword/${verificationToken}`;
  const message = `<h1>Follow the link to activate your guest account</h1>
                    <a>${verificationURL}</a>`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Activate your account",
      message,
    });
    res.status(200).json({
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return error(
      res,
      500,
      "There was an error sendong the mail, Please try again"
    );
  }
};

exports.verifyuser = async (req, res, next) => {
  const recievedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
    const user = await User.findOne({
        passwordResetToken: recievedToken, 
        passwordResetExpires: {$gt: Date.now()}
    });
    // token expires 
    if (!user) {
        return error(res, 400, 'Token expired')
    }
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.isVerified = true;
    await user.save().then(
        res.status(200).json({
            message: 'Request send to Admin for approval'
        })
    );

};


