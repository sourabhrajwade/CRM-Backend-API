const express = require("express");

const contactController = require('../controller/contact');
const authCheck = require('../middleware/auth');
const User = require('../models/auth');
const autherization = require('../middleware/auth');
const router = express.Router();

router.post('/create',autherization.protect, autherization.authorize('admin', 'employee'), authCheck.protect,contactController.createContact);

router.post('/getbyemail',autherization.protect, autherization.authorize('admin', 'employee','employee-2','manager'), contactController.getContactbyEmail);    

router.get('/all', autherization.protect, autherization.authorize('admin', 'employee','employee-2','manager', 'guest'), contactController.getAllContacts);    

router.patch('/update', autherization.protect, autherization.authorize('admin','manager'), contactController.updateContact);

router.delete('/delete/:id', autherization.protect, autherization.authorize('admin','manager'), contactController.delete);

module.exports = router;