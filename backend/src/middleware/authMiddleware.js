const jwt = require('jsonwebtoken');
const User = require('../models/User');
const createError = require('../utils/createError');

// Guard for protected routes. Usage: router.get('/me', protect, getMe)
async function protect(req, res, next) {
  // 1. Read the Authorization header. Expected format: "Bearer <token>"
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw createError(401, 'Not authorized: no token provided');
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    throw createError(401, 'Not authorized: no token provided');
  }

  // 2. Verify the signature and expiry. If the token is fake, altered, or
  //    expired, jwt.verify throws and errorHandler replies with a 401.
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. The token is valid, but the user might have been deleted since.
  const user = await User.findById(decoded.id);
  if (!user) {
    throw createError(401, 'Not authorized: user no longer exists');
  }

  // 4. Remember who is asking, then continue to the controller.
  req.user = user;
  next();
}

module.exports = { protect };