const express = require("express");

const leadController = require('../controller/lead');
const autherization = require('../middleware/auth');

const router = express.Router();

router.post('/create',autherization.protect, autherization.authorize('admin', 'employee', 'employee-2', 'manager'), leadController.createLead);
router.get('/view/:id', autherization.protect, autherization.authorize('admin', 'employee', 'employee-2','manager'), leadController.viewLead);
router.get('/view/', autherization.protect, autherization.authorize('admin', 'employee','employee-2','manager'), leadController.fetchAll);
router.patch('/update/:id', autherization.protect, autherization.authorize('admin', 'employee','employee-2', 'manager'), leadController.updateLead);
router.patch('/delete/:id', autherization.protect, autherization.authorize('admin', 'employee', 'employee-2', 'manager'), leadController.deleteLead);
router.get('/viewdelete',autherization.protect, autherization.authorize('admin', 'manager'), leadController.viewDelete);
router.get('/restoredelete/:id',autherization.protect, autherization.authorize('admin', 'manager'), leadController.restore);
router.delete('/remove/:id', autherization.protect, autherization.authorize('admin', 'manager'), leadController.remove);

module.exports = router;