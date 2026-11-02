// Same email rule as the backend: something@something.something, no spaces.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns an object like { name: 'Full name is required' }.
// An empty object means the form is valid.
export function validateRegisterForm(values) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const { password, confirmPassword } = values;

  if (!name) {
    errors.name = 'Full name is required';
  } else if (name.length < 2) {
    errors.name = 'Full name must be at least 2 characters';
  } else if (name.length > 50) {
    errors.name = 'Full name must be at most 50 characters';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (email.length > 100) {
    errors.email = 'Email must be at most 100 characters';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Passwords are not trimmed, because spaces can be part of a password.
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (password.length > 72) {
    errors.password = 'Password must be at most 72 characters';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

// Used by the login page. Only checks that the fields are filled in,
// like the backend does, so a failed login never reveals the password rules.
export function validateLoginForm(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
}

// Used by the task form (create and edit). Same limits as the backend.
export function validateTaskForm(values) {
  const errors = {};
  const title = values.title.trim();

  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length > 100) {
    errors.title = 'Title must be at most 100 characters';
  }

  if (values.description.trim().length > 500) {
    errors.description = 'Description must be at most 500 characters';
  }

  // Past due dates are allowed. The due date is optional.
  return errors;
}

// Converts the backend's list [{ field, message }] into { field: message }.
// If a field has several messages, the first one is kept.
export function backendErrorsToObject(errorList = []) {
  const result = {};
  errorList.forEach(({ field, message }) => {
    if (field && !result[field]) {
      result[field] = message;
    }
  });
  return result;
}