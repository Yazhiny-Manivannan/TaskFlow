// Builds an error that the central error handler turns into a JSON response.
// Example: throw createError(404, 'Task not found');
function createError(statusCode, message, errors) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (errors) {
    error.errors = errors;
  }
  return error;
}

module.exports = createError;