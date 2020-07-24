const express = require("express");

const contactController = require('../controller/contact');

const router = express.Router();

router.post('/create', contactController.createContact);

router.post('/getbyemail', contactController.getContactbyEmail);    

router.get('/all', contactController.getAllContacts);    



module.exports = router;