import express from 'express'
import {
  getFuelLogs,
  getFuelLog,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
} from '../controllers/fuelController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.route('/')
  .get(getFuelLogs)
  .post(authorize('Fleet Manager', 'Driver'), createFuelLog)

router.route('/:id')
  .get(getFuelLog)
  .put(authorize('Fleet Manager', 'Driver'), updateFuelLog)
  .delete(authorize('Fleet Manager'), deleteFuelLog)

export default router
