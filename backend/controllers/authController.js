const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists with this email.' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password, // Password will be hashed by pre-save middleware
      role: role || 'attendant', // Use provided role or default to 'attendant'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      msg: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('Error during user registration:', err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials (email not found).' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials (password incorrect).' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      msg: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('Error during user login:', err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/auth/logout
// @desc    (Frontend-driven) Invalidate token (optional, client-side only for JWT)
// @access  Public
exports.logoutUser = (req, res) => {
  // For JWT, logout is primarily handled on the client side by deleting the token.
  // If you were using HTTP-only cookies, you'd clear the cookie here.
  // For stateless JWTs, there's no server-side session to destroy unless you implement
  // a token blacklisting mechanism, which is more complex.
  res.json({ msg: 'Logout successful (token invalidated on client side).' });
};