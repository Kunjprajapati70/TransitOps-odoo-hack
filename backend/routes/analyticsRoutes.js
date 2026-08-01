const express = require('express');
const router = express.Router();
const { getDashboardData, getROIReport, getDriverReport, getFuelReport, exportCSV, exportPDF } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardData);
router.get('/reports/roi', protect, getROIReport);
router.get('/reports/drivers', protect, getDriverReport);
router.get('/reports/fuel', protect, getFuelReport);
router.get('/export/csv/:reportType', protect, exportCSV);
router.get('/export/pdf/:reportType', protect, exportPDF);

module.exports = router;
