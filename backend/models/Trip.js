const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  tripId: {
    type: String,
    required: [true, 'Trip ID is required'],
    unique: true,
    index: true,
    uppercase: true,
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Source address is required']
  },
  destination: {
    type: String,
    required: [true, 'Destination address is required']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver is required']
  },
  cargoWeight: {
    type: Number,
    required: [true, 'Cargo weight is required'],
    min: [0, 'Cargo weight cannot be negative']
  },
  plannedDistance: {
    type: Number,
    required: [true, 'Planned distance is required'],
    min: [0, 'Planned distance cannot be negative']
  },
  revenue: {
    type: Number,
    required: [true, 'Revenue is required'],
    min: [0, 'Revenue cannot be negative']
  },
  dispatchDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  fuelConsumed: {
    type: Number,
    default: 0,
    min: [0, 'Fuel consumed cannot be negative']
  },
  status: {
    type: String,
    required: true,
    enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', TripSchema);
