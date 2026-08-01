const express = require('express');
const router = express.Router();
const { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getVehicles)
  .post(protect, authorize('Fleet Manager', 'Admin'), createVehicle);

router.route('/:id')
  .get(protect, getVehicleById)
  .put(protect, authorize('Fleet Manager', 'Admin'), updateVehicle)
  .delete(protect, authorize('Fleet Manager', 'Admin'), deleteVehicle);

module.exports = router;
