const express = require("express");

const adminController = require('../controller/admin');

// const multer = require("multer");

const router = express.Router();

router.get('/user', adminController.fetchAllUnverifiedUsers);

module.exports = router;