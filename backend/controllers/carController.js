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