const mongoose = require('mongoose');

const FuelLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: false
  },
  quantity: { // Liters
    type: Number,
    required: [true, 'Fuel quantity (Liters) is required'],
    min: [0, 'Quantity cannot be negative']
  },
  cost: {
    type: Number,
    required: [true, 'Fuel cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FuelLog', FuelLogSchema);
