const Admin = require("./../models/admin");
const User = require("./../models/auth");

exports.fetchAllUnverifiedUsers = async (req, res, next) => {
  const tobeVertifieduser = await User.find();
  console.log(tobeVertifieduser);
  return res.status(200).json({
    message: "List of user.",
    tobeVertifieduser,
  });
};

exports.getUser = async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id });

  return res.status(200).json({
    message: "user selected",
    user,
  });
};

exports.addUser = async (req, res, next) => {
  const updateField = {
    role: req.body.role,
    isVerified: true,
  };
  const user = await User.findByIdAndUpdate(req.params.id, updateField, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(400).json({
      message: "User donoes not exist",
    });
  } else {
    res.status(200).json({
      message: "User added",
      user,
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findOneAndDelete({ _id: userId });
  res.status(200).json({
    message: "user deleted successfully",
  });
};

exports.changeRole = async (req, res, next) => {
  const userId = req.params.id;
  const assignRole = { role: req.body.role };

  const user = await User.findByIdAndUpdate(userId, assignRole, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(400).json({
      message: "User does not exist",
    });
  } else {
    res.status(200).json({
      message: "Role updated",
      user,
    });
  }
};
