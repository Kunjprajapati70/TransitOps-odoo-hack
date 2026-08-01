const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    index: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Vehicle name is required']
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required']
  },
  type: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['Truck', 'Van', 'Mini', 'Other']
  },
  maxLoadCapacity: {
    type: Number,
    required: [true, 'Maximum load capacity is required']
  },
  currentOdometer: {
    type: Number,
    required: [true, 'Current odometer is required'],
    default: 0
  },
  acquisitionCost: {
    type: Number,
    required: [true, 'Acquisition cost is required']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
    default: 'Available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
