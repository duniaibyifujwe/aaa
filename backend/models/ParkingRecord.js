const mongoose = require('mongoose');

const parkingRecordSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  entryTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  exitTime: {
    type: Date
  },
  duration: {
    type: Number // Duration in minutes
  },
  parkingFee: {
    type: Number
  },
  status: {
    type: String, // 'parked', 'exited'
    required: true,
    default: 'parked'
  }
}, { timestamps: true });

module.exports = mongoose.model('ParkingRecord', parkingRecordSchema);