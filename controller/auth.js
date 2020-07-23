const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const utils = require("util");
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
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateJWTToken = (user, res) => {
  const token = signToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOption);
  user.password = undefined;
  res.status(200).json({
    message: "token denerated",
    token,
    data: {
      user,
    },
  });
};

exports.autherize = async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      message: "The are not logged in. Please log in again. ",
    });
  }

  // 2) Verification token
  const decoded = await utils.promisify(
    jwt.verify(token, process.env.JWT_SECRET)
  );

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.staus(401).json({
      message: "The user belonging to this token does no longer exist.",
    });
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      message: "User recently changed password! Please log in again.",
    });
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'manager', 'employee]. role='user'
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
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
      html: message,
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
    passwordResetExpires: { $gt: Date.now() },
  });
  // token expires
  if (!user) {
    return error(res, 400, "Token expired");
  }
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.isVerified = true;
  await user.save().then(
    res.status(200).json({
      message: "Request send to Admin for approval",
    })
  );
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Provide login credentials",
    });
  }
  const user = await User.findOne({ email }).select("+password");
  const match = await bcrypt.compare(password, user.password);
  if (!user || !match) {
    return res.status(400).json({
      message: "Invalid login credentials",
    });
  }

  generateJWTToken(user, res);
};

exports.forgetPassword = async (req, res, next) => {
  const email = req.body.email;
  const user = User.findOne({ email });
  if (!user) {
    return error(res, 404, "User not found.");
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/resetpassword/${resetToken}`;
  const message = `Forget your password. Follow the link ${resetURL}.\n If you didn't, ignore the link.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset link is valid for 10 minutes.",
      message,
    });
    res.status(200).json({
      message: "Token sent via email. ",
    });
  } catch (err) {
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await (await user).save({ validateBeforeSave: false });
    return next(
      res.status(500).json({
        message: "There was an error sending the mail. Please try again.",
      })
    );
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

  generateJWTToken(user, res);
};
