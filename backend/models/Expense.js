const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: false
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: false
  },
  toll: {
    type: Number,
    default: 0,
    min: [0, 'Toll cost cannot be negative']
  },
  parking: {
    type: Number,
    default: 0,
    min: [0, 'Parking cost cannot be negative']
  },
  repair: {
    type: Number,
    default: 0,
    min: [0, 'Repair cost cannot be negative']
  },
  other: {
    type: Number,
    default: 0,
    min: [0, 'Other cost cannot be negative']
  },
  description: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', ExpenseSchema);
