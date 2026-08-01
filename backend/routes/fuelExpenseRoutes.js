const express = require('express');
const router = express.Router();
const {
  getFuelLogs, createFuelLog, updateFuelLog, deleteFuelLog,
  getExpenses, createExpense, updateExpense, deleteExpense
} = require('../controllers/fuelExpenseController');
const { protect, authorize } = require('../middleware/auth');

// Fuel routes
router.route('/fuel')
  .get(protect, getFuelLogs)
  .post(protect, authorize('Financial Analyst', 'Admin'), createFuelLog);

router.route('/fuel/:id')
  .put(protect, authorize('Financial Analyst', 'Admin'), updateFuelLog)
  .delete(protect, authorize('Financial Analyst', 'Admin'), deleteFuelLog);

// Expenses routes
router.route('/expenses')
  .get(protect, getExpenses)
  .post(protect, authorize('Financial Analyst', 'Admin'), createExpense);

router.route('/expenses/:id')
  .put(protect, authorize('Financial Analyst', 'Admin'), updateExpense)
  .delete(protect, authorize('Financial Analyst', 'Admin'), deleteExpense);

module.exports = router;
