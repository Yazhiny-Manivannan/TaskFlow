const { PRIORITIES, STATUSES } = require('../models/Task');

// Simple email format check: something@something.something, with no spaces.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Due dates must look like 2026-12-31 or 2026-12-31T10:30:00Z
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/;

// True only for real, non-blank text. Rejects numbers, objects, arrays, null.
// This also blocks "NoSQL injection" attempts such as {"email": {"$gt": ""}}.
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// ---------- AUTH VALIDATORS ----------

// Returns a list of problems. An empty list means the input is valid.
function validateRegister(body) {
  const errors = [];
  const { name, email, password, confirmPassword } = body;

  // Full name: required, 2 to 50 characters
  if (!isNonEmptyString(name)) {
    errors.push({ field: 'name', message: 'Full name is required' });
  } else if (name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Full name must be at least 2 characters' });
  } else if (name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Full name must be at most 50 characters' });
  }

  // Email: required, valid format, at most 100 characters
  if (!isNonEmptyString(email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (email.trim().length > 100) {
    errors.push({ field: 'email', message: 'Email must be at most 100 characters' });
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Password: required, 8 to 72 characters. We do NOT trim passwords,
  // because spaces can be a real part of a password.
  if (typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  } else if (password.length > 72) {
    errors.push({ field: 'password', message: 'Password must be at most 72 characters' });
  }

  // Confirm password: required and must match
  if (typeof confirmPassword !== 'string' || confirmPassword.length === 0) {
    errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
  } else if (confirmPassword !== password) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  return errors;
}

function validateLogin(body) {
  const errors = [];
  const { email, password } = body;

  if (!isNonEmptyString(email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  }
  if (typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
}

// ---------- TASK VALIDATORS ----------

// Used for creating a task and for updating one (PUT).
// Rules: title is required. Everything else is optional, but must be valid if sent.
function validateTask(body) {
  const errors = [];
  const { title, description, priority, status, dueDate } = body;

  // Title: required, 1 to 100 characters after trimming
  if (!isNonEmptyString(title)) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (title.trim().length > 100) {
    errors.push({ field: 'title', message: 'Title must be at most 100 characters' });
  }

  // Description: optional text, at most 500 characters
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be text' });
    } else if (description.trim().length > 500) {
      errors.push({ field: 'description', message: 'Description must be at most 500 characters' });
    }
  }

  // Priority: optional, but must be exactly Low, Medium, or High
  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    errors.push({ field: 'priority', message: 'Priority must be one of: Low, Medium, High' });
  }

  // Status: optional, but must be exactly Pending, In Progress, or Completed
  if (status !== undefined && !STATUSES.includes(status)) {
    errors.push({
      field: 'status',
      message: 'Status must be one of: Pending, In Progress, Completed',
    });
  }

  // Due date: optional. null or "" means "no due date". Past dates are allowed.
  if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
    if (
      typeof dueDate !== 'string' ||
      !DATE_REGEX.test(dueDate) ||
      Number.isNaN(Date.parse(dueDate))
    ) {
      errors.push({
        field: 'dueDate',
        message: 'Due date must be a valid date, for example 2026-12-31',
      });
    }
  }

  return errors;
}

// Used by PATCH /api/tasks/:id/status. Only "status" is accepted, and it is required.
function validateStatusUpdate(body) {
  const errors = [];
  if (!STATUSES.includes(body.status)) {
    errors.push({
      field: 'status',
      message: 'Status must be one of: Pending, In Progress, Completed',
    });
  }
  return errors;
}

// Used by GET /api/tasks?search=...&status=...&priority=...
// All three are optional. If sent, they must be valid.
function validateTaskQuery(query) {
  const errors = [];
  const { search, status, priority } = query;

  if (search !== undefined) {
    if (typeof search !== 'string') {
      errors.push({ field: 'search', message: 'Search must be text' });
    } else if (search.trim().length > 100) {
      errors.push({ field: 'search', message: 'Search must be at most 100 characters' });
    }
  }

  // A value that is not a string (for example ?status=a&status=b) is also rejected.
  if (status !== undefined && !STATUSES.includes(status)) {
    errors.push({
      field: 'status',
      message: 'Status filter must be one of: Pending, In Progress, Completed',
    });
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    errors.push({
      field: 'priority',
      message: 'Priority filter must be one of: Low, Medium, High',
    });
  }

  return errors;
}

module.exports = {
  isNonEmptyString,
  validateRegister,
  validateLogin,
  validateTask,
  validateStatusUpdate,
  validateTaskQuery,
};