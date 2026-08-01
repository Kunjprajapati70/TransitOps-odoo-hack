const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');

// Helper to check and create upcoming maintenance alerts
const checkMaintenanceAlerts = async (log) => {
  try {
    const today = new Date();
    const start = new Date(log.startDate);
    const timeDiff = start.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff > 0 && daysDiff <= 3 && log.status === 'Scheduled') {
      const vehicle = await Vehicle.findById(log.vehicle);
      if (vehicle) {
        const message = `Upcoming maintenance scheduled for vehicle ${vehicle.name} (${vehicle.registrationNumber}) on ${start.toLocaleDateString()} (In ${daysDiff} days). Type: ${log.type}.`;
        const existing = await Notification.findOne({ type: 'upcoming_maintenance', message });
        if (!existing) {
          await Notification.create({
            type: 'upcoming_maintenance',
            message
          });
        }
      }
    }
  } catch (err) {
    console.error('Error generating maintenance notifications:', err.message);
  }
};

// @desc    Get all maintenance logs
// @route   GET /api/maintenance
// @access  Private
exports.getMaintenanceLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, vehicleId } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (vehicleId) {
      query.vehicle = vehicleId;
    }

    const count = await MaintenanceLog.countDocuments(query);
    const logs = await MaintenanceLog.find(query)
      .populate('vehicle')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Ensure we trigger check notifications for scheduled ones
    for (const log of logs) {
      await checkMaintenanceAlerts(log);
    }

    res.json({
      success: true,
      data: logs,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get log by ID
// @route   GET /api/maintenance/:id
// @access  Private
exports.getMaintenanceById = async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id).populate('vehicle');
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }
    await checkMaintenanceAlerts(log);
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a maintenance log
// @route   POST /api/maintenance
// @access  Private (Fleet Manager Only)
exports.createMaintenanceLog = async (req, res) => {
  try {
    const { vehicle: vehicleId, type, description, cost, startDate, endDate, status } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const resolvedStatus = status || 'Scheduled';

    const log = await MaintenanceLog.create({
      vehicle: vehicleId,
      type,
      description,
      cost,
      startDate,
      endDate,
      status: resolvedStatus
    });

    // If starting off directly as 'In Progress', set vehicle status to 'In Shop'
    if (resolvedStatus === 'In Progress') {
      vehicle.status = 'In Shop';
      await vehicle.save();
    }

    await checkMaintenanceAlerts(log);

    const populatedLog = await MaintenanceLog.findById(log._id).populate('vehicle');
    res.status(201).json({ success: true, data: populatedLog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a maintenance log
// @route   PUT /api/maintenance/:id
// @access  Private (Fleet Manager Only)
exports.updateMaintenanceLog = async (req, res) => {
  try {
    const { status } = req.body;
    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const vehicle = await Vehicle.findById(log.vehicle);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Associated vehicle not found' });
    }

    const oldStatus = log.status;
    const newStatus = status;

    if (newStatus && oldStatus !== newStatus) {
      if (newStatus === 'In Progress') {
        // Maintenance starts: vehicle status = In Shop
        vehicle.status = 'In Shop';
        await vehicle.save();
      } else if (newStatus === 'Completed' || newStatus === 'Cancelled') {
        // Maintenance ends: vehicle status = Available (if currently In Shop)
        if (vehicle.status === 'In Shop') {
          vehicle.status = 'Available';
          await vehicle.save();
        }
      }
    }

    // Apply other updates
    if (req.body.type) log.type = req.body.type;
    if (req.body.description) log.description = req.body.description;
    if (req.body.cost) log.cost = req.body.cost;
    if (req.body.startDate) log.startDate = req.body.startDate;
    if (req.body.endDate) log.endDate = req.body.endDate;
    if (newStatus) log.status = newStatus;

    await log.save();
    await checkMaintenanceAlerts(log);

    const populatedLog = await MaintenanceLog.findById(log._id).populate('vehicle');
    res.json({ success: true, data: populatedLog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a maintenance log
// @route   DELETE /api/maintenance/:id
// @access  Private (Fleet Manager Only)
exports.deleteMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    // If deleting an ongoing maintenance record, restore vehicle status
    if (log.status === 'In Progress') {
      const vehicle = await Vehicle.findById(log.vehicle);
      if (vehicle && vehicle.status === 'In Shop') {
        vehicle.status = 'Available';
        await vehicle.save();
      }
    }

    await MaintenanceLog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Maintenance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
