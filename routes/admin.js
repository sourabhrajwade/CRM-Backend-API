const express = require("express");

const adminController = require('../controller/admin');

// const multer = require("multer");

const router = express.Router();

router.get('/user', adminController.getUser);
// router.post('/login', authController.login);
// router.post('/forgotPassword', authController.forgotPassword);
// router.patch('/resetPassword/:token', authController.resetPassword);
// router.patch('/verifypassword/:token', authController.verifyuser);

// Protect all routes after this middleware
// router.use(authController.protect);

// router.patch('/updateMyPassword', authController.updatePassword);
module.exports = router;