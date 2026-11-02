// The allowed values. They match the backend exactly (Task.js).
export const PRIORITIES = ['Low', 'Medium', 'High'];
export const STATUSES = ['Pending', 'In Progress', 'Completed'];

// Overdue rule, the SAME as the backend stats endpoint:
// a task is overdue when it has a due date, the due date is before the start
// of today (UTC), and the status is not Completed.
export function isOverdue(task) {
  if (!task.dueDate || task.status === 'Completed') {
    return false;
  }
  const now = new Date();
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return new Date(task.dueDate).getTime() < startOfToday;
}

// Shows a date like "1 Dec 2026". We format in UTC, because due dates are stored
// as midnight UTC. Using local time could show the wrong day in some countries.
export function formatDate(isoString) {
  if (!isoString) {
    return 'No due date';
  }
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// Converts a stored date into the "2026-12-01" format that <input type="date"> needs.
// Used by the edit form in Step 6D. An empty string means "no due date".
export function toDateInputValue(isoString) {
  return isoString ? isoString.slice(0, 10) : '';
}