const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles (with filters, search, pagination)
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, type } = req.query;

    const query = {};

    // Search filter (name, model, registrationNumber)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Role-specific/status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Type filter
    if (type && type !== 'All') {
      query.type = type;
    }

    const count = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: vehicles,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private (Fleet Manager Only)
exports.createVehicle = async (req, res) => {
  try {
    const { registrationNumber, name, model, type, maxLoadCapacity, currentOdometer, acquisitionCost, purchaseDate, status } = req.body;

    // Check duplicate registration
    const duplicate = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase().trim() });
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Vehicle with registration number ${registrationNumber} already exists` });
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      name,
      model,
      type,
      maxLoadCapacity,
      currentOdometer,
      acquisitionCost,
      purchaseDate,
      status: status || 'Available'
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Fleet Manager Only)
exports.updateVehicle = async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    // Check duplicate registry if registration number is modified
    if (registrationNumber) {
      const existingVehicle = await Vehicle.findById(req.params.id);
      if (existingVehicle && existingVehicle.registrationNumber !== registrationNumber.toUpperCase().trim()) {
        const duplicate = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase().trim() });
        if (duplicate) {
          return res.status(400).json({ success: false, message: `Vehicle with registration number ${registrationNumber} already exists` });
        }
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Fleet Manager Only)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
