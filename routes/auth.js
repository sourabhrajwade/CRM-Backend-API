const express = require("express");

const authController = require('../controller/auth');
const autherization = require('../middleware/auth');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:resettoken', authController.resetPassword);
router.put('/updatedetails',autherization.protect,authController.updateDetail );
router.put('/updatepassword',autherization.protect,authController.updatePassword )
router.get('/logout', authController.logout);
// Protect all routes after this middleware
// router.use(authController.autherize);


module.exports = router;