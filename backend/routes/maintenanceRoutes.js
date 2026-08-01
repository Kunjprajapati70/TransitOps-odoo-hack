const express = require('express');
const router = express.Router();
const { getMaintenanceLogs, getMaintenanceById, createMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getMaintenanceLogs)
  .post(protect, authorize('Fleet Manager', 'Admin'), createMaintenanceLog);

router.route('/:id')
  .get(protect, getMaintenanceById)
  .put(protect, authorize('Fleet Manager', 'Admin'), updateMaintenanceLog)
  .delete(protect, authorize('Fleet Manager', 'Admin'), deleteMaintenanceLog);

module.exports = router;
