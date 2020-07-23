const express = require("express");

const adminController = require('../controller/admin');

const router = express.Router();

router.get('/getall', adminController.fetchAllUnverifiedUsers);
router.patch('/adduser', adminController.addUser);
router.delete('/deleteuser', adminController.deleteUser);
router.patch('/changerole', adminController.changeRole);

module.exports = router;