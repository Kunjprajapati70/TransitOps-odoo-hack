import express from 'express'
import {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
} from '../controllers/tripController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.route('/')
  .get(getTrips)
  .post(authorize('Fleet Manager', 'Driver'), createTrip)

router.route('/:id')
  .get(getTrip)
  .put(authorize('Fleet Manager', 'Driver'), updateTrip)
  .delete(authorize('Fleet Manager'), deleteTrip)

export default router
