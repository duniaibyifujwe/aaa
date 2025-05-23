const express = require('express');
const router = express.Router();

// Import all controllers
const parkingSlotController = require('../controllers/parkingSlotController');
const carController = require('../controllers/carController');
const parkingController = require('../controllers/parkingController');
const paymentController = require('../controllers/paymentController');

// --- Parking Slots Routes ---
router.get('/api/slots', parkingSlotController.getAllParkingSlots);
router.get('/api/slots/available', parkingSlotController.getAvailableParkingSlots);
router.get('/api/slots/:id', parkingSlotController.getParkingSlotById);
router.post('/api/slots', parkingSlotController.createParkingSlots);
router.put('/api/slots/:id', parkingSlotController.updateParkingSlot);

// --- Car Routes ---
router.get('/api/cars', carController.getAllCars);
router.get('/api/cars/:plateNo', carController.getCarByPlateNo);
router.post('/api/cars', carController.registerCar);


// Get car by plate number
router.delete('/api/cars/:id',  carController.deleteCar);
router.put('/api/cars/:id',carController.updateCar); // Update a car by ID






// --- Parking Entry/Exit Routes ---
router.post('/api/parkin/entry', parkingController.recordEntry);
router.post('/api/parkin/exit', parkingController.recordExit);
router.get('/api/parkin/history', parkingController.getParkingHistory);

// --- Payment Routes ---
router.post('/api/payments', paymentController.recordPayment);
router.get('/api/payments', paymentController.getAllPayments);
router.get('/api/payments/daily-revenue', paymentController.getDailyRevenue);
router.get('/api/payments/:id', paymentController.getPaymentById);

const { registerUser, loginUser, logoutUser } = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', loginUser);

// @route   GET api/auth/logout
// @desc    Simulated logout (client-side token removal)
router.get('/logout', logoutUser); // You could use POST if clearing a cookie


module.exports = router;