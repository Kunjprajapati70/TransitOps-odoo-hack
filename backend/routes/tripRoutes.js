const express = require('express');
const router = express.Router();
const { getTrips, getTripById, createTrip, updateTrip, deleteTrip } = require('../controllers/tripController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getTrips)
  .post(protect, authorize('Dispatcher'), createTrip);

router.route('/:id')
  .get(protect, getTripById)
  .put(protect, authorize('Dispatcher'), updateTrip)
  .delete(protect, authorize('Dispatcher'), deleteTrip);

module.exports = router;
