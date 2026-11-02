const createError = require('../utils/createError');

// A MongoDB ObjectId is exactly 24 hexadecimal characters.
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// Usage: router.get('/:id', validateObjectId, getTask)
// Rejects bad IDs with a 400 before any database query is made.
function validateObjectId(req, res, next) {
  const id = req.params.id;

  if (typeof id !== 'string' || !OBJECT_ID_REGEX.test(id)) {
    throw createError(400, 'Invalid task ID format');
  }

  next();
}

module.exports = validateObjectId;