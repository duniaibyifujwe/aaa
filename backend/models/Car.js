// models/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  plateNo: {
    type: String,
    required: true,
    unique: true
    // You might want to add validation for plate number format
  },
  driverName: {
    type: String,
    required: true
  },
  phoneNo: {
    type: String,
    required: true
    // You might want to add validation for phone number format
  }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
