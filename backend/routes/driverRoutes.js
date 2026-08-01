const express = require('express');
const router = express.Router();
const { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getDrivers)
  .post(protect, authorize('Safety Officer'), createDriver);

router.route('/:id')
  .get(protect, getDriverById)
  .put(protect, authorize('Safety Officer'), updateDriver)
  .delete(protect, authorize('Safety Officer'), deleteDriver);

module.exports = router;
