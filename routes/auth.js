const express = require("express");

const authController = require('../controller/auth');


const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/verifypassword/:token', authController.verifyuser);

// Protect all routes after this middleware
// router.use(authController.autherize);


module.exports = router;