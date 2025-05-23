const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNo: {
    type: String,
    required: true,
    unique: true
  },
  slotStatus: {
    type: String, // 
    enum:['occupied', 'available', 'reserved'],
    required: true,
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);