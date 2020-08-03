const express = require("express");

const serviceController = require('../controller/service');
const autherization = require('../middleware/auth');

const router = express.Router();

router.post('/create', autherization.protect, autherization.authorize('admin', 'employee','employee-2', 'manager'), serviceController.createRequest);

router.get('/select/:id', autherization.protect, autherization.authorize('admin', 'employee','employee-2', 'manager'), serviceController.selectService);

router.patch('/update/:id', autherization.protect, autherization.authorize('admin', 'employee','employee-2', 'manager'), serviceController.updateStatus);

module.exports = router;