const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const FuelLog = require('../models/FuelLog');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
exports.getTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;

    const query = {};

    // Search source, destination, tripId
    if (search) {
      query.$or = [
        { tripId: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    const count = await Trip.countDocuments(query);
    const trips = await Trip.find(query)
      .populate('vehicle')
      .populate('driver')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: trips,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Private
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver');

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validations for Dispatching
const validateForDispatch = async (vehicleId, driverId, cargoWeight) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new Error('Selected vehicle does not exist');
  }

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw new Error('Selected driver does not exist');
  }

  // Check vehicle status
  if (vehicle.status !== 'Available') {
    throw new Error(`Vehicle status is '${vehicle.status}'. It must be 'Available' to dispatch.`);
  }

  // Check driver status
  if (driver.status !== 'Available') {
    throw new Error(`Driver status is '${driver.status}'. They must be 'Available' to dispatch.`);
  }

  // Check driver license expiration
  const today = new Date();
  if (new Date(driver.licenseExpiryDate) < today) {
    throw new Error(`Driver license expired on ${new Date(driver.licenseExpiryDate).toLocaleDateString()}! Blocked from trip dispatch.`);
  }

  // Check driver suspended status
  if (driver.status === 'Suspended') {
    throw new Error('Driver is suspended! Blocked from trip dispatch.');
  }

  // Check capacity
  if (cargoWeight > vehicle.maxLoadCapacity) {
    throw new Error(`Cargo weight (${cargoWeight} kg) exceeds vehicle's maximum load capacity (${vehicle.maxLoadCapacity} kg).`);
  }

  // Check if vehicle has active trips (just in case status check missed it)
  const activeVehicleTrip = await Trip.findOne({ vehicle: vehicleId, status: 'Dispatched' });
  if (activeVehicleTrip) {
    throw new Error('This vehicle already has an active dispatched trip.');
  }

  // Check if driver has active trips
  const activeDriverTrip = await Trip.findOne({ driver: driverId, status: 'Dispatched' });
  if (activeDriverTrip) {
    throw new Error('This driver already has an active dispatched trip.');
  }

  return { vehicle, driver };
};

// @desc    Create a trip (Draft or Dispatched)
// @route   POST /api/trips
// @access  Private (Dispatcher Only)
exports.createTrip = async (req, res) => {
  try {
    const { tripId, source, destination, vehicle: vehicleId, driver: driverId, cargoWeight, plannedDistance, revenue, status } = req.body;

    // Check duplicate trip ID
    const duplicate = await Trip.findOne({ tripId: tripId.toUpperCase().trim() });
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Trip ID ${tripId} already exists` });
    }

    let resolvedStatus = status || 'Draft';
    
    // If starting off directly as Dispatched, run validation and perform automations
    if (resolvedStatus === 'Dispatched') {
      const { vehicle, driver } = await validateForDispatch(vehicleId, driverId, cargoWeight);
      
      const trip = await Trip.create({
        tripId,
        source,
        destination,
        vehicle: vehicleId,
        driver: driverId,
        cargoWeight,
        plannedDistance,
        revenue,
        dispatchDate: new Date(),
        status: 'Dispatched'
      });

      // Update statuses
      vehicle.status = 'On Trip';
      await vehicle.save();
      
      driver.status = 'On Trip';
      await driver.save();

      return res.status(201).json({ success: true, data: trip });
    }

    // Creating as Draft (no strict status locks yet, but we validate capacity and references exist)
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(400).json({ success: false, message: 'Vehicle not found' });

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(400).json({ success: false, message: 'Driver not found' });

    if (cargoWeight > vehicle.maxLoadCapacity) {
      return res.status(400).json({ success: false, message: `Cargo weight exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg)` });
    }

    const trip = await Trip.create({
      tripId,
      source,
      destination,
      vehicle: vehicleId,
      driver: driverId,
      cargoWeight,
      plannedDistance,
      revenue,
      status: 'Draft'
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a trip (Handles state transitions)
// @route   PUT /api/trips/:id
// @access  Private (Dispatcher Only)
exports.updateTrip = async (req, res) => {
  try {
    const { status, fuelConsumed } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const oldStatus = trip.status;
    const newStatus = status;

    // Strict state modifications check
    if (oldStatus === 'Completed' || oldStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Completed or Cancelled trips cannot be modified' });
    }

    // Check transition
    if (newStatus && oldStatus !== newStatus) {
      const vehicle = await Vehicle.findById(trip.vehicle);
      const driver = await Driver.findById(trip.driver);

      if (newStatus === 'Dispatched') {
        // Transitioning from Draft to Dispatched
        await validateForDispatch(trip.vehicle, trip.driver, trip.cargoWeight);
        
        trip.dispatchDate = new Date();
        vehicle.status = 'On Trip';
        driver.status = 'On Trip';
        await vehicle.save();
        await driver.save();
      } 
      else if (newStatus === 'Completed') {
        // Transitioning from Dispatched to Completed
        // Change statuses back/Available
        vehicle.status = 'Available';
        driver.status = 'Available';
        
        // Auto update vehicle odometer
        vehicle.currentOdometer += trip.plannedDistance;
        await vehicle.save();
        await driver.save();

        trip.completionDate = new Date();
        trip.fuelConsumed = fuelConsumed || 0;

        // Auto generate Fuel Log if any fuel consumed is declared
        if (trip.fuelConsumed > 0) {
          await FuelLog.create({
            vehicle: trip.vehicle,
            trip: trip._id,
            quantity: trip.fuelConsumed,
            cost: parseFloat((trip.fuelConsumed * 1.35).toFixed(2)), // ~$1.35/litre average
            date: new Date()
          });
        }
      } 
      else if (newStatus === 'Cancelled') {
        // Transitioning to Cancelled — revert both vehicle and driver
        if (vehicle) { vehicle.status = 'Available'; await vehicle.save(); }
        if (driver) { driver.status = 'Available'; await driver.save(); }
      }
    }

    // Apply other body changes if draft
    if (oldStatus === 'Draft') {
      if (req.body.source) trip.source = req.body.source;
      if (req.body.destination) trip.destination = req.body.destination;
      if (req.body.cargoWeight) trip.cargoWeight = req.body.cargoWeight;
      if (req.body.plannedDistance) trip.plannedDistance = req.body.plannedDistance;
      if (req.body.revenue) trip.revenue = req.body.revenue;
    }

    if (newStatus) {
      trip.status = newStatus;
    }

    await trip.save();
    
    // FETCH FULL TRIP WITH REFS AFTER AUTO UPDATES
    const updatedTrip = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.json({ success: true, data: updatedTrip });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a trip (Draft status only)
// @route   DELETE /api/trips/:id
// @access  Private (Dispatcher Only)
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.status !== 'Draft') {
      return res.status(400).json({ success: false, message: 'Only Draft trips can be deleted' });
    }

    await Trip.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
