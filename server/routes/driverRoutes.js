import express from 'express'
import {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../controllers/driverController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.route('/')
  .get(getDrivers)
  .post(authorize('Fleet Manager'), createDriver)

router.route('/:id')
  .get(getDriver)
  .put(authorize('Fleet Manager'), updateDriver)
  .delete(authorize('Fleet Manager'), deleteDriver)

export default router
