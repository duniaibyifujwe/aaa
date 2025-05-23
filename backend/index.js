const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const allRoutes = require('./routes/routes'); // Import the consolidated routes file

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false })); // Allows us to get data in req.body
app.use(cors()); // Enable CORS for all routes (important for React frontend)

// Use all routes from the consolidated file
app.use(allRoutes);

// Simple root route
app.get('/', (req, res) => res.send('Parking Management API is running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));