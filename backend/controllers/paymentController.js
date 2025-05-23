const Payment = require('../models/Payment');
const ParkingRecord = require('../models/ParkingRecord');

// @route   POST /api/payments
// @desc    Record a payment for a parking record
// @access  Public
exports.recordPayment = async (req, res) => {
  const { parkingRecordId, amountPaid } = req.body;

  if (!parkingRecordId || amountPaid === undefined || amountPaid === null) {
    return res.status(400).json({ msg: 'Please provide parkingRecordId and amountPaid.' });
  }

  try {
    const parkingRecord = await ParkingRecord.findById(parkingRecordId);
    if (!parkingRecord) {
      return res.status(404).json({ msg: 'Parking record not found.' });
    }

    if (parkingRecord.status !== 'exited_unpaid') {
      return res.status(400).json({ msg: 'Cannot process payment for a car that has not exited.' });
    }

    if (amountPaid < parkingRecord.parkingFee) {
      // You might want to handle partial payments or warnings here
      return res.status(400).json({ msg: `Amount paid ($${amountPaid}) is less than the parking fee ($${parkingRecord.parkingFee}).` });
    }

    // Check if a payment already exists for this record
    let payment = await Payment.findOne({ parkingRecord: parkingRecordId });
    if (payment) {
      return res.status(400).json({ msg: 'Payment already recorded for this parking record.' });
    }

    payment = new Payment({
      parkingRecord: parkingRecordId,
      amountPaid,
      paymentDate: new Date()
    });

    await payment.save();

    // Optionally update the ParkingRecord to mark it as paid if you add a 'paid' field
    parkingRecord.status = 'paid';
    await parkingRecord.save();

    res.status(201).json({ message: 'Payment recorded successfully.', payment });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/payments
// @desc    Get all payments
// @access  Public
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('parkingRecord', 'car slot entryTime exitTime parkingFee'); // Populate related parking record details

    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/payments/:id
// @desc    Get a specific payment by ID
// @access  Public
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('parkingRecord', 'car slot entryTime exitTime parkingFee');

    if (!payment) {
      return res.status(404).json({ msg: 'Payment not found' });
    }
    res.json(payment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/payments/daily-revenue
// @desc    Calculate total revenue for a specific day
// @access  Public
exports.getDailyRevenue = async (req, res) => {
  const { date } = req.query; // date format: YYYY-MM-DD

  if (!date) {
    return res.status(400).json({ msg: 'Please provide a date in YYYY-MM-DD format.' });
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0); // Start of the day in UTC

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999); // End of the day in UTC

    const payments = await Payment.find({
      paymentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);

    res.json({ date, totalRevenue });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};