const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// ==========================================
// FUEL LOGS CRUD
// ==========================================

// @desc    Get all fuel logs
// @route   GET /api/fuel-expenses/fuel
// @access  Private
exports.getFuelLogs = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const query = {};
    if (vehicleId) {
      query.vehicle = vehicleId;
    }

    const logs = await FuelLog.find(query)
      .populate('vehicle')
      .populate('trip')
      .sort({ date: -1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a fuel log
// @route   POST /api/fuel-expenses/fuel
// @access  Private (Financial Analyst Only)
exports.createFuelLog = async (req, res) => {
  try {
    const { vehicle: vehicleId, trip: tripId, quantity, cost, date } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (tripId) {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, message: 'Trip not found' });
      }
    }

    const log = await FuelLog.create({
      vehicle: vehicleId,
      trip: tripId,
      quantity,
      cost,
      date: date || new Date()
    });

    const populatedLog = await FuelLog.findById(log._id).populate('vehicle').populate('trip');
    res.status(201).json({ success: true, data: populatedLog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a fuel log
// @route   PUT /api/fuel-expenses/fuel/:id
// @access  Private (Financial Analyst Only)
exports.updateFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('vehicle').populate('trip');

    if (!log) {
      return res.status(404).json({ success: false, message: 'Fuel record not found' });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a fuel log
// @route   DELETE /api/fuel-expenses/fuel/:id
// @access  Private (Financial Analyst Only)
exports.deleteFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Fuel record not found' });
    }
    res.json({ success: true, message: 'Fuel record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// EXPENDITURES CRUD
// ==========================================

// @desc    Get all expenses
// @route   GET /api/fuel-expenses/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const query = {};
    if (vehicleId) {
      query.vehicle = vehicleId;
    }

    const expenses = await Expense.find(query)
      .populate('vehicle')
      .populate('trip')
      .sort({ date: -1 });

    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an expense
// @route   POST /api/fuel-expenses/expenses
// @access  Private (Financial Analyst Only)
exports.createExpense = async (req, res) => {
  try {
    const { vehicle: vehicleId, trip: tripId, toll, parking, repair, other, description, date } = req.body;

    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }
    }

    if (tripId) {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, message: 'Trip not found' });
      }
    }

    const expense = await Expense.create({
      vehicle: vehicleId,
      trip: tripId,
      toll: toll || 0,
      parking: parking || 0,
      repair: repair || 0,
      other: other || 0,
      description,
      date: date || new Date()
    });

    const populatedExpense = await Expense.findById(expense._id).populate('vehicle').populate('trip');
    res.status(201).json({ success: true, data: populatedExpense });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/fuel-expenses/expenses/:id
// @access  Private (Financial Analyst Only)
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('vehicle').populate('trip');

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/fuel-expenses/expenses/:id
// @access  Private (Financial Analyst Only)
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }
    res.json({ success: true, message: 'Expense record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
