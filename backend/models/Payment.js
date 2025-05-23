const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  parkingRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingRecord',
    required: true,
    unique: true // A parking record should have only one payment
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);