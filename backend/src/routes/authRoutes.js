const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes: anyone can call these.
router.post('/register', register);
router.post('/login', login);

// Protected route: "protect" runs first and blocks the request without a valid token.
router.get('/me', protect, getMe);

module.exports = router;