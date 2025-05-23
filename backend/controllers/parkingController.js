const Car = require('../models/Car');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingRecord = require('../models/ParkingRecord');
const calculateParkingFee = require('../utils/feeCalculator');

// @route   POST /api/parkin/entry
// @desc    Record a car entry
// @access  Public
exports.recordEntry = async (req, res) => {
  const { plateNo, driverName, phoneNo, slotNo } = req.body;

  if (!plateNo || !driverName || !phoneNo) {
    return res.status(400).json({ msg: 'Please provide plateNo, driverName, and phoneNo for entry.' });
  }

  try {
    // 1. Find or Create Car
    let car = await Car.findOne({ plateNo: plateNo.toUpperCase() });
    if (!car) {
      car = new Car({ plateNo, driverName, phoneNo });
      await car.save();
    }

    // 2. Find Available Slot
    let parkingSlot;
    if (slotNo) {
      parkingSlot = await ParkingSlot.findOne({ slotNo: slotNo.toUpperCase() });
      if (!parkingSlot) {
        return res.status(404).json({ msg: 'Specified parking slot not found.' });
      }
      if (parkingSlot.slotStatus === 'occupied') {
        return res.status(400).json({ msg: `Slot ${slotNo} is already occupied.` });
      }
    } else {
      parkingSlot = await ParkingSlot.findOne({ slotStatus: 'available' });
      if (!parkingSlot) {
        return res.status(404).json({ msg: 'No available parking slots at this time.' });
      }
    }

    // Check if the car is already parked (active record)
    const activeParkingRecord = await ParkingRecord.findOne({ car: car._id, status: 'parked' });
    if (activeParkingRecord) {
      return res.status(400).json({ msg: `Car with plate number ${plateNo} is already parked in slot ${parkingSlot.slotNo}.` });
    }

    // 3. Update Slot Status
    parkingSlot.slotStatus = 'occupied';
    await parkingSlot.save();

    // 4. Create ParkingRecord
    const parkingRecord = new ParkingRecord({
      car: car._id,
      slot: parkingSlot._id,
      entryTime: new Date(),
      status: 'parked'
    });
    await parkingRecord.save();

    // Populate car and slot details for the response
    const populatedRecord = await ParkingRecord.findById(parkingRecord._id)
      .populate('car', 'plateNo driverName')
      .populate('slot', 'slotNo slotStatus');

    res.status(201).json({
      message: 'Car successfully parked.',
      parkingRecord: populatedRecord,
      updatedSlot: parkingSlot
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/parkin/exit
// @desc    Record a car exit and calculate fees
// @access  Public
exports.recordExit = async (req, res) => {
  const { plateNo } = req.body;

  if (!plateNo) {
    return res.status(400).json({ msg: 'Please provide plateNo for exit.' });
  }

  try {
    // 1. Find Car
    const car = await Car.findOne({ plateNo: plateNo });
    if (!car) {
      return res.status(404).json({ msg: 'Car not found.' });
    }

    // 2. Find Active ParkingRecord for this car
    const parkingRecord = await ParkingRecord.findOne({ car: car._id, status: 'parked' });
    if (!parkingRecord) {
      return res.status(404).json({ msg: `Car with plate number ${plateNo} is not currently parked.` });
    }

    // 3. Calculate Duration
    const exitTime = new Date();
    const durationMs = exitTime.getTime() - parkingRecord.entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60)); // Duration in minutes, rounded up

    // 4. Calculate Parking Fee
    const parkingFee = calculateParkingFee(durationMinutes);

    // 5. Update ParkingRecord
    parkingRecord.exitTime = exitTime;
    parkingRecord.duration = durationMinutes;
    parkingRecord.parkingFee = parkingFee;
    parkingRecord.status = 'exited';
    await parkingRecord.save();

    // 6. Update Slot Status
    const parkingSlot = await ParkingSlot.findById(parkingRecord.slot);
    if (parkingSlot) { // Check if slot still exists
      parkingSlot.slotStatus = 'available';
      await parkingSlot.save();
    }

    // Populate car and slot details for the response
    const populatedRecord = await ParkingRecord.findById(parkingRecord._id)
      .populate('car', 'plateNo driverName')
      .populate('slot', 'slotNo');

    res.status(200).json({
      message: 'Car exited successfully.',
      parkingRecord: populatedRecord,
      updatedSlot: parkingSlot
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/parkin/history
// @desc    Get all parking records (or by plateNo if provided)
// @access  Public
exports.getParkingHistory = async (req, res) => {
  const { plateNo } = req.query; // Query parameter for filtering

  try {
    let query = {};
    if (plateNo) {
      const car = await Car.findOne({ plateNo: plateNo.toUpperCase() });
      if (!car) {
        return res.status(404).json({ msg: 'Car not found for provided plate number.' });
      }
      query.car = car._id;
    }

    const records = await ParkingRecord.find(query)
      .populate('car', 'plateNo driverName phoneNo')
      .populate('slot', 'slotNo')
      .sort({ entryTime: -1 }); // Sort by most recent entry first

    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// const ParkingRecord = require('../models/ParkingRecord');
// const ParkingSlot = require('../models/ParkingSlot');
// const Car = require('../models/Car');
// const mongoose = require('mongoose');

// Helper function to calculate parking fee
// const calculateParkingFee = (entryTime, exitTime) => {
//     const durationMs = exitTime - entryTime;
//     const durationMinutes = Math.ceil(durationMs / (1000 * 60)); // Duration in minutes, rounded up

//     // Example simple tiered pricing:
//     // First 30 minutes: free
//     // Next 30 minutes (up to 1 hour): $5
//     // After 1 hour: $3 per additional hour (or part thereof)
//     // Or, a simpler flat rate:
//     const HOURLY_RATE = 5; // $5 per hour
//     const MIN_CHARGE_MINUTES = 15; // Minimum charge after X minutes, e.g., first 15 mins free

//     if (durationMinutes <= MIN_CHARGE_MINUTES) {
//         return 0; // Free parking for short stays
//     }

//     // A simpler flat rate per hour (or part of an hour)
//     const hours = Math.ceil(durationMinutes / 60); // Round up to the nearest hour
//     return hours * HOURLY_RATE;
// };


// @route   POST api/parkin/entry
// @desc    Record a car entry
// @access  Public
exports.recordEntry = async (req, res) => {
    const { plateNo, driverName, phoneNo, slotNo } = req.body;

    try {
        let car = await Car.findOne({ plateNo: plateNo.toUpperCase() });

        // If car doesn't exist, create it
        if (!car) {
            car = new Car({
                plateNo: plateNo.toUpperCase(),
                driverName,
                phoneNo
            });
            await car.save();
        } else {
            // Update driver/phone if provided and different
            let changed = false;
            if (driverName && car.driverName !== driverName) {
                car.driverName = driverName;
                changed = true;
            }
            if (phoneNo && car.phoneNo !== phoneNo) {
                car.phoneNo = phoneNo;
                changed = true;
            }
            if (changed) {
                await car.save();
            }
        }

        // Check if car is already parked
        const existingParking = await ParkingRecord.findOne({
            car: car._id,
            status: 'parked'
        });
        if (existingParking) {
            return res.status(400).json({ msg: `Car ${plateNo} is already parked in slot ${existingParking.slot.slotNo}.` });
        }


        let parkingSlot;
        if (slotNo) {
            // If a specific slot is requested, find it and check availability
            parkingSlot = await ParkingSlot.findOne({ slotNo: slotNo.toUpperCase() });
            if (!parkingSlot) {
                return res.status(404).json({ msg: 'Requested parking slot not found.' });
            }
            if (parkingSlot.slotStatus === 'occupied') {
                return res.status(400).json({ msg: `Parking slot ${slotNo} is currently occupied.` });
            }
        } else {
            // If no specific slot, find the first available slot
            parkingSlot = await ParkingSlot.findOneAndUpdate(
                { slotStatus: 'available' },
                { $set: { slotStatus: 'occupied' } },
                { new: true } // Return the updated document
            );

            if (!parkingSlot) {
                return res.status(400).json({ msg: 'No available parking slots.' });
            }
        }

        // If a slot was chosen by the user and is available, occupy it
        if (slotNo && parkingSlot && parkingSlot.slotStatus === 'available') {
            parkingSlot.slotStatus = 'occupied';
            await parkingSlot.save();
        }


        const parkingRecord = new ParkingRecord({
            car: car._id,
            slot: parkingSlot._id,
            entryTime: new Date(),
            status: 'parked'
        });

        await parkingRecord.save();

        // Populate to send back meaningful data
        await parkingRecord.populate('car', ['plateNo', 'driverName', 'phoneNo']);
        await parkingRecord.populate('slot', 'slotNo');

        res.status(201).json({ msg: 'Car parked successfully', parkingRecord });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/parkin/exit
// @desc    Record a car exit and calculate fees
// @access  Public
exports.recordExit = async (req, res) => {
    const { plateNo } = req.body;

    try {
        const car = await Car.findOne({ plateNo: plateNo });
        if (!car) {
            return res.status(404).json({ msg: 'Car not found.' });
        }

        const parkingRecord = await ParkingRecord.findOne({ car: car._id, status: 'parked' });
        if (!parkingRecord) {
            return res.status(404).json({ msg: 'Car is not currently parked.' });
        }

        const exitTime = new Date();
        const parkingFee = calculateParkingFee(parkingRecord.entryTime, exitTime);
        const durationMinutes = Math.ceil((exitTime - parkingRecord.entryTime) / (1000 * 60));

        parkingRecord.exitTime = exitTime;
        parkingRecord.duration = durationMinutes;
        parkingRecord.parkingFee = parkingFee;
        parkingRecord.status = 'exited_unpaid'; // Set status to exited but unpaid
        await parkingRecord.save();

        // Update parking slot status to available
        const parkingSlot = await ParkingSlot.findById(parkingRecord.slot);
        if (parkingSlot) {
            parkingSlot.slotStatus = 'available';
            await parkingSlot.save();
        }

        await parkingRecord.populate('car', ['plateNo', 'driverName']);
        await parkingRecord.populate('slot', 'slotNo');

        res.json({ msg: 'Car exited successfully', parkingRecord });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/parkin/history
// @desc    Get all parking records or filter by plateNo or status
// @access  Public
exports.getParkingHistory = async (req, res) => {
    try {
        const { plateNo, status } = req.query; // Added 'status' to query parameters
        const query = {};

        if (plateNo) {
            const car = await Car.findOne({ plateNo: plateNo.toUpperCase() });
            if (car) {
                query.car = car._id;
            } else {
                return res.json([]); // If car not found, return empty array
            }
        }

        if (status) { // Filter by status if provided
            query.status = status;
        }

        const history = await ParkingRecord.find(query)
            .populate('car', ['plateNo', 'driverName', 'phoneNo'])
            .populate('slot', 'slotNo')
            .sort({ entryTime: -1 }); // Sort by most recent entry first

        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/payments
// @desc    Record a payment for a parking record
// @access  Public
exports.recordPayment = async (req, res) => {
    const { parkingRecordId, amountPaid } = req.body;

    // Validate parkingRecordId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(parkingRecordId)) {
        return res.status(400).json({ msg: 'Invalid Parking Record ID format.' });
    }

    try {
        const parkingRecord = await ParkingRecord.findById(parkingRecordId);

        if (!parkingRecord) {
            return res.status(404).json({ msg: 'Parking record not found.' });
        }

        if (parkingRecord.status === 'paid') {
            return res.status(400).json({ msg: 'This parking record has already been paid.' });
        }

        if (parkingRecord.status === 'parked') {
            return res.status(400).json({ msg: 'Cannot process payment for a car still parked. Process exit first.' });
        }

        // Basic validation: Check if amount paid is sufficient
        if (amountPaid < parkingRecord.parkingFee) {
            return res.status(400).json({ msg: `Amount paid ($${amountPaid.toFixed(2)}) is less than required fee ($${parkingRecord.parkingFee.toFixed(2)}).` });
        }

        // Create new Payment record
        const payment = new Payment({
            parkingRecord: parkingRecord._id,
            amountPaid,
            paymentTime: new Date()
        });
        await payment.save();

        // Update parking record status to 'paid'
        parkingRecord.status = 'paid';
        await parkingRecord.save();

        res.status(201).json({ msg: 'Payment recorded successfully', payment });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/slots
// @desc    Get all parking slots
// @access  Public
exports.getAllParkingSlots = async (req, res) => {
    try {
        const slots = await ParkingSlot.find();
        res.json(slots);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/slots/available
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

// @route   GET api/slots/:id
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

// @route   POST api/slots
// @desc    Create new parking slots (for initial setup)
// @access  Public
exports.createParkingSlots = async (req, res) => {
    const { slots } = req.body; // Expects an array of { slotNo: "A1" }

    if (!Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({ msg: 'Please provide an array of slot objects.' });
    }

    try {
        const results = [];
        for (const slotData of slots) {
            if (!slotData.slotNo) {
                continue; // Skip invalid slot data
            }
            const formattedSlotNo = slotData.slotNo.toUpperCase();
            // Check if slot already exists to prevent duplicates
            const existingSlot = await ParkingSlot.findOne({ slotNo: formattedSlotNo });
            if (existingSlot) {
                results.push({ slotNo: formattedSlotNo, status: 'skipped', reason: 'already exists' });
                continue;
            }

            const newSlot = new ParkingSlot({
                slotNo: formattedSlotNo,
                slotStatus: 'available'
            });
            await newSlot.save();
            results.push({ slotNo: formattedSlotNo, status: 'created', id: newSlot._id });
        }

        res.status(201).json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/slots/:id
// @desc    Update a parking slot's status
// @access  Public
exports.updateParkingSlot = async (req, res) => {
    const { slotStatus } = req.body; // Can be 'available' or 'occupied'
    const { id } = req.params;

    if (!slotStatus || !['available', 'occupied'].includes(slotStatus)) {
        return res.status(400).json({ msg: 'Please provide a valid slotStatus (available or occupied).' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'Invalid slot ID format.' });
    }

    try {
        const slot = await ParkingSlot.findById(id);
        if (!slot) {
            return res.status(404).json({ msg: 'Parking slot not found.' });
        }

        slot.slotStatus = slotStatus;
        await slot.save();
        res.json({ msg: 'Parking slot updated', slot });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @route   GET api/cars
// @desc    Get all registered cars
// @access  Public
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find();
        res.json(cars);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/cars/:plateNo
// @desc    Get a specific car by plate number
// @access  Public
exports.getCarByPlateNo = async (req, res) => {
    try {
        const car = await Car.findOne({ plateNo: req.params.plateNo.toUpperCase() });
        if (!car) {
            return res.status(404).json({ msg: 'Car not found' });
        }
        res.json(car);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/cars
// @desc    Register a new car
// @access  Public
exports.registerCar = async (req, res) => {
    const { plateNo, driverName, phoneNo } = req.body;

    try {
        let car = await Car.findOne({ plateNo: plateNo.toUpperCase() });

        if (car) {
            return res.status(400).json({ msg: 'Car with this plate number already registered.' });
        }

        car = new Car({
            plateNo: plateNo.toUpperCase(),
            driverName,
            phoneNo
        });

        await car.save();
        res.status(201).json(car);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};