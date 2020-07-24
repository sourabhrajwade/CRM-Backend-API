const express = require("express");

const leadController = require('../controller/lead');

const router = express.Router();

router.post('/create', leadController.createLead);
router.post('/view/:id', leadController.createLead);
router.get('/view/', leadController.fetchAll);
router.patch('/update/:id', leadController.updateLead);
router.delete('/delete/:id', leadController.deleteLead);


module.exports = router;