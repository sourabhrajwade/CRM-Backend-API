const crypto = require("crypto");

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
    role: 'guest',
    isVerified: false
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
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).json({
      message: 'Link is invalid or expired',

    });
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  sendTokenResponse(user, 200, res);
};

exports.updateDetail = async (req, res, next) => {
  try {
    const fieldToUpdate = {
      firstname: req.body.firstname, 
      lastname: req.body.lastname,
      email: req.body.email,
      phone: req.body.phone
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldToUpdate, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      message: "DEtails updated",
      user
    })
  }catch(err) {
    console.log(err);
    res.status(500).json({
      message: "There was error in updating details ",
  
    });
  }
};

exports.updatePassword = async(req, res, next) => {
  
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(req.body.currentPassword))) {
    res.status(401).json({
      message: "password incorrect"
    });
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
};

exports.logout = async (req, res, next ) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10*1000),
    httpOnly: true
  });
  res.status(200).json({
    message: "Logout"
  });
};