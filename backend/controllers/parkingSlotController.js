const ParkingSlot = require('../models/ParkingSlot');

// @route   GET /api/slots
// @desc    Get all parking slots
// @access  Public
exports.getAllParkingSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({});
    res.json(slots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/slots/available
// @desc    Get all available parking slots
// @access  Public
exports.getAvailableParkingSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ slotStatus: 'available' });
    res.json(slots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/slots/:id
// @desc    Get a specific parking slot by ID
// @access  Public
exports.getParkingSlotById = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ msg: 'Parking slot not found' });
    }
    res.json(slot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/slots
// @desc    Create new parking slots (for initial setup)
// @access  Private (e.g., admin only)
exports.createParkingSlots = async (req, res) => {
  const { slots } = req.body; // Expecting an array of { slotNo: "A1" }
  if (!Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ msg: 'Please provide an array of slots.' });
  }

  try {
    const newSlots = await ParkingSlot.insertMany(slots.map(s => ({ slotNo: s.slotNo })));
    res.status(201).json(newSlots);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) { // Duplicate key error
      return res.status(400).json({ msg: 'One or more slot numbers already exist.' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/slots/:id
// @desc    Update a parking slot's status
// @access  Private (e.g., admin only)
exports.updateParkingSlot = async (req, res) => {
  const { slotStatus } = req.body;
  if (!slotStatus) {
    return res.status(400).json({ msg: 'Please provide a slotStatus.' });
  }

  try {
    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.id,
      { $set: { slotStatus } },
      { new: true } // Return the updated document
    );
    if (!slot) {
      return res.status(404).json({ msg: 'Parking slot not found' });
    }
    res.json(slot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};