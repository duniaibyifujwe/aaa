const Car = require('../models/Car');

// @route   GET /api/cars
// @desc    Get all registered cars
// @access  Public
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find({});
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
// @desc    Register a new car (can be used independently or during entry)
// @access  Private (e.g., admin/attendant)
exports.registerCar = async (req, res) => {
  const { plateNo, driverName, phoneNo } = req.body;

  if (!plateNo || !driverName || !phoneNo) {
    return res.status(400).json({ msg: 'Please enter all fields: plateNo, driverName, phoneNo' });
  }

  try {
    let car = await Car.findOne({ plateNo: plateNo.toUpperCase() });
    if (car) {
      return res.status(400).json({ msg: 'Car with this plate number already exists' });
    }

    car = new Car({
      plateNo,
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
const ParkingRecord = require('../models/ParkingRecord'); // Assuming you have this model for deletion check

// @route   GET /api/cars
// @desc    Get all registered cars
// @access  Private (as per frontend's authenticated calls)
exports.getCars = async (req, res) => { // Renamed from getAllCars for consistency
    try {
        const cars = await Car.find({});
        res.json(cars);
    } catch (err) {
        console.error('Error in getCars:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/cars/:plateNo
// @desc    Get a specific car by plate number
// @access  Private (or Public, depending on your app's needs)
exports.getCarByPlateNo = async (req, res) => {
    try {
        const car = await Car.findOne({ plateNo: req.params.plateNo.toUpperCase() });
        if (!car) {
            return res.status(404).json({ msg: 'Car not found' });
        }
        res.json(car);
    } catch (err) {
        console.error('Error in getCarByPlateNo:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/cars
// @desc    Register a new car
// @access  Private (e.g., admin/attendant)
exports.registerCar = async (req, res) => {
    const { plateNo, driverName, phoneNo } = req.body;

    if (!plateNo || !driverName || !phoneNo) {
        return res.status(400).json({ msg: 'Please enter all fields: plateNo, driverName, phoneNo' });
    }

    try {
        let car = await Car.findOne({ plateNo: plateNo.toUpperCase() });
        if (car) {
            return res.status(400).json({ msg: 'Car with this plate number already exists' });
        }

        car = new Car({
            plateNo: plateNo.toUpperCase(), // Ensure plateNo is stored in uppercase
            driverName,
            phoneNo
        });

        await car.save();
        res.status(201).json(car); // Return the created car object
    } catch (err) {
        console.error('Error in registerCar:', err.message);
        res.status(500).send('Server Error');
    }
};


// @route   PUT /api/cars/:id
// @desc    Update a car by ID
// @access  Private (e.g., attendant, admin)
exports.updateCar = async (req, res) => {
    const { driverName, phoneNo } = req.body; // Plate number is typically not updated for a car
    
    // Validate ID format (important for Mongoose)
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'Invalid Car ID format.' });
    }

    try {
        let car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ msg: 'Car not found.' });
        }

        // Update fields only if they are provided in the request body
        if (driverName !== undefined) {
            car.driverName = driverName;
        }
        if (phoneNo !== undefined) {
            car.phoneNo = phoneNo;
        }

        await car.save();
        res.json({ msg: 'Car updated successfully', car }); // Return updated car
    } catch (err) {
        console.error('Error in updateCar:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /api/cars/:id
// @desc    Delete a car by ID
// @access  Private (e.g., admin, or attendant with restrictions)
exports.deleteCar = async (req, res) => {
    // Validate ID format
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'Invalid Car ID format.' });
    }

    try {
        // --- Important Check: Prevent deletion if car is currently parked ---
        const parkingRecord = await ParkingRecord.findOne({ car: req.params.id, status: 'parked' });
        if (parkingRecord) {
            return res.status(400).json({ msg: `Cannot delete car: It is currently parked in slot ${parkingRecord.slotNo}. Please exit the car first.` });
        }

        // Optional: Also check if the car has any *historical* parking records
        // If you want to keep history, you might prevent deletion or soft-delete.
        // const hasHistory = await ParkingRecord.findOne({ car: req.params.id });
        // if (hasHistory) {
        //     return res.status(400).json({ msg: 'Cannot delete car: It has associated parking history. Consider archiving instead.' });
        // }


        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ msg: 'Car not found.' });
        }

        res.json({ msg: 'Car deleted successfully' });
    } catch (err) {
        console.error('Error in deleteCar:', err.message);
        res.status(500).send('Server Error');
    }
};