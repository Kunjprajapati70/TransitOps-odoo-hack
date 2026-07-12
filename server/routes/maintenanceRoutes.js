import express from 'express'
import {
  getMaintenances,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from '../controllers/maintenanceController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.route('/')
  .get(getMaintenances)
  .post(authorize('Fleet Manager', 'Safety Officer'), createMaintenance)

router.route('/:id')
  .get(getMaintenance)
  .put(authorize('Fleet Manager', 'Safety Officer'), updateMaintenance)
  .delete(authorize('Fleet Manager'), deleteMaintenance)

export default router
