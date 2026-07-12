import express from 'express'
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.route('/')
  .get(getExpenses)
  .post(authorize('Fleet Manager', 'Financial Analyst'), createExpense)

router.route('/:id')
  .get(getExpense)
  .put(authorize('Fleet Manager', 'Financial Analyst'), updateExpense)
  .delete(authorize('Fleet Manager', 'Financial Analyst'), deleteExpense)

export default router
