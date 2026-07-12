import express from 'express'
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.route('/')
  .get(getVehicles)
  .post(authorize('Fleet Manager'), createVehicle)

router.route('/:id')
  .get(getVehicle)
  .put(authorize('Fleet Manager'), updateVehicle)
  .delete(authorize('Fleet Manager'), deleteVehicle)

export default router
