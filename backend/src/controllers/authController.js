const jwt = require('jsonwebtoken');
const User = require('../models/User');
const createError = require('../utils/createError');
const { validateRegister, validateLogin } = require('../utils/validators');

// Creates a signed token that contains only the user's id.
function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Check your backend/.env file.');
  }
  return jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

// POST /api/auth/register
async function register(req, res) {
  const body = req.body || {};

  // 1. Validate the input.
  const errors = validateRegister(body);
  if (errors.length > 0) {
    throw createError(400, 'Validation failed', errors);
  }

  // 2. Clean the input.
  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();

  // 3. Reject a duplicate email.
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email is already registered', [
      { field: 'email', message: 'Email is already registered' },
    ]);
  }

  // 4. Create the user. The model hashes the password automatically.
  const user = await User.create({ name, email, password: body.password });

  // 5. Reply with the user (no password) and a token.
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token: generateToken(user._id) },
  });
}

// POST /api/auth/login
async function login(req, res) {
  const body = req.body || {};

  const errors = validateLogin(body);
  if (errors.length > 0) {
    throw createError(400, 'Validation failed', errors);
  }

  const email = body.email.trim().toLowerCase();

  // The password is hidden by default, so we ask for it explicitly here.
  const user = await User.findOne({ email }).select('+password');

  // Same message for "no such email" and "wrong password", so an attacker
  // cannot discover which emails are registered.
  if (!user || !(await user.matchPassword(body.password))) {
    throw createError(401, 'Invalid email or password');
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token: generateToken(user._id) },
  });
}

// GET /api/auth/me  (protected: the "protect" middleware runs first)
async function getMe(req, res) {
  res.status(200).json({
    success: true,
    message: 'Current user retrieved',
    data: { user: req.user },
  });
}

module.exports = { register, login, getMe };