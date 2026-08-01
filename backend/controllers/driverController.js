const Driver = require('../models/Driver');
const Notification = require('../models/Notification');

// Helper to check and create expired license alerts
const checkLicenseAlerts = async (driver) => {
  try {
    const today = new Date();
    const expiry = new Date(driver.licenseExpiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff <= 0) {
      // Already expired
      const message = `Driver license for ${driver.name} (License No: ${driver.licenseNumber}) has expired on ${expiry.toLocaleDateString()}!`;
      // Check if notification already exists
      const existing = await Notification.findOne({ type: 'expired_license', message });
      if (!existing) {
        await Notification.create({
          type: 'expired_license',
          message
        });
      }
    } else if (daysDiff <= 30) {
      // Expiring soon (within 30 days)
      const message = `Driver license for ${driver.name} (License No: ${driver.licenseNumber}) is expiring soon in ${daysDiff} days (on ${expiry.toLocaleDateString()}).`;
      const existing = await Notification.findOne({ type: 'expired_license', message });
      if (!existing) {
        await Notification.create({
          type: 'expired_license',
          message
        });
      }
    }
  } catch (err) {
    console.error('Error generating driver license notifications:', err.message);
  }
};

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
exports.getDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, category } = req.query;

    const query = {};

    // Search query (name, licenseNumber, email)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.licenseCategory = category;
    }

    const count = await Driver.countDocuments(query);
    const drivers = await Driver.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Proactively check expiry alerts for fetched drivers
    for (const d of drivers) {
      await checkLicenseAlerts(d);
    }

    res.json({
      success: true,
      data: drivers,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get driver by ID
// @route   GET /api/drivers/:id
// @access  Private
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    await checkLicenseAlerts(driver);
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a driver
// @route   POST /api/drivers
// @access  Private (Safety Officer Only)
exports.createDriver = async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, email, safetyScore, status, profilePhoto } = req.body;

    // Check unique license number and email
    const duplicateLicense = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase().trim() });
    if (duplicateLicense) {
      return res.status(400).json({ success: false, message: `License number ${licenseNumber} is already registered` });
    }

    const duplicateEmail = await Driver.findOne({ email: email.toLowerCase().trim() });
    if (duplicateEmail) {
      return res.status(400).json({ success: false, message: `Email ${email} is already registered` });
    }

    const driver = await Driver.create({
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      email,
      safetyScore: safetyScore !== undefined ? safetyScore : 100,
      status: status || 'Available',
      profilePhoto
    });

    await checkLicenseAlerts(driver);

    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a driver
// @route   PUT /api/drivers/:id
// @access  Private (Safety Officer Only)
exports.updateDriver = async (req, res) => {
  try {
    const { licenseNumber, email } = req.body;
    const existingDriver = await Driver.findById(req.params.id);
    if (!existingDriver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Unique checks
    if (licenseNumber && existingDriver.licenseNumber !== licenseNumber.toUpperCase().trim()) {
      const duplicateLicense = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase().trim() });
      if (duplicateLicense) {
        return res.status(400).json({ success: false, message: `License number ${licenseNumber} is already registered` });
      }
    }

    if (email && existingDriver.email !== email.toLowerCase().trim()) {
      const duplicateEmail = await Driver.findOne({ email: email.toLowerCase().trim() });
      if (duplicateEmail) {
        return res.status(400).json({ success: false, message: `Email ${email} is already registered` });
      }
    }

    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await checkLicenseAlerts(driver);

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a driver
// @route   DELETE /api/drivers/:id
// @access  Private (Safety Officer Only)
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
