const express = require('express');
const router = express.Router();
const { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getDrivers)
  .post(protect, authorize('Safety Officer', 'Admin'), createDriver);

router.route('/:id')
  .get(protect, getDriverById)
  .put(protect, authorize('Safety Officer', 'Admin'), updateDriver)
  .delete(protect, authorize('Safety Officer', 'Admin'), deleteDriver);

module.exports = router;
