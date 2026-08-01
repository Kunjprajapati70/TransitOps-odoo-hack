const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required']
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    index: true,
    uppercase: true,
    trim: true
  },
  licenseCategory: {
    type: String,
    required: [true, 'License category is required'],
    enum: ['LMV', 'HMV', 'Other']
  },
  licenseExpiryDate: {
    type: Date,
    required: [true, 'License expiry date is required']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  safetyScore: {
    type: Number,
    min: [0, 'Safety score cannot be less than 0'],
    max: [105, 'Safety score cannot exceed 105'], // normally 100, but allow slight headroom
    default: 100
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
    default: 'Available'
  },
  profilePhoto: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', DriverSchema);
