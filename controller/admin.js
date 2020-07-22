const Admin = require("./../models/admin");
const User = require("./../models/auth");

exports.fetchAllUnverifiedUsers = async (req, res, next) => {
    const tobeVertifieduser =  await User.find({isVerified: true});
   console.log(tobeVertifieduser);
   return res.status(200).json({
       message: "List of user to be verified",
       tobeVertifieduser
   })
};

exports.addUser = async (req, res, next) => {
    const id = req.body.id
    const assignRole = req.body.role
    const user = await User.findOne({_id:id});
    if (!user) {
        return res.status(400).json({
            message: "User donoes not exist",
            
        });
    }
    user.isVerified === true;
    user.role = assignRole;
    res.status(200).json({
        message: "User added",
        user
    });
}

exports.deleteUser = async (req, res, next) => {
    const id = req.body.id;
    const user = await User.findOne({_id:id});
    if (!user) {
        return res.status(400).json({
            message: "User does not exist",
            
        });
    }
    user.findOneAndDelete({_id:id});
}

exports.changeRole = async (req, res, next) => {
    const id = req.body.id
    const assignRole = req.body.role
    const id = req.body.id;
    const user = await User.findOne({_id:id});
    if (!user) {
        return res.status(400).json({
            message: "User does not exist",
            
        });
    }
    user.role = assignRole;
}