const express = require("express");
const User = require('../models/auth');
const adminController = require('../controller/admin');
const autherization = require('../middleware/auth');

const router = express.Router();



router.get('/getall',autherization.protect,autherization.authorize('admin'), adminController.fetchAllUnverifiedUsers);
router.patch('/adduser/:id',autherization.protect,autherization.authorize('admin'), adminController.addUser);
router.get('/select/:id',autherization.protect,autherization.authorize('admin'), adminController.getUser);
router.delete('/delete', autherization.protect,autherization.authorize('admin'), adminController.deleteUser);
router.patch('/changerole',autherization.protect,autherization.authorize('admin'),  adminController.changeRole);

module.exports = router;