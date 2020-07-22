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

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
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
  const user = User.findOne({ email }).select("password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(400).json({
      message: "Invalid login credentials",
    });
  }

  generateJWTToken(user, res);
};
