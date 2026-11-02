const Task = require('../models/Task');
const createError = require('../utils/createError');
const {
  validateTask,
  validateTaskQuery,
  validateStatusUpdate,
} = require('../utils/validators');

// Makes user text safe to use inside a regular expression.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// POST /api/tasks
async function createTask(req, res) {
  const body = req.body || {};

  // 1. Validate the input.
  const errors = validateTask(body);
  if (errors.length > 0) {
    throw createError(400, 'Validation failed', errors);
  }

  // 2. Copy ONLY the allowed fields. The owner comes from the token, never from the body.
  const data = {
    title: body.title.trim(),
    owner: req.user._id,
  };
  if (typeof body.description === 'string') data.description = body.description.trim();
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.status !== undefined) data.status = body.status;
  if (body.dueDate) data.dueDate = new Date(body.dueDate); // null or "" means no due date

  // 3. Save and reply.
  const task = await Task.create(data);

  res.status(201).json({
    success: true,
    message: 'Task created',
    data: { task },
  });
}

// GET /api/tasks?search=...&status=...&priority=...
async function getTasks(req, res) {
  const { search, status, priority } = req.query;

  // 1. Validate the optional filters.
  const errors = validateTaskQuery(req.query);
  if (errors.length > 0) {
    throw createError(400, 'Invalid query parameters', errors);
  }

  // 2. Always start with the owner filter. This is the isolation rule.
  const filter = { owner: req.user._id };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search && search.trim()) {
    filter.title = { $regex: escapeRegex(search.trim()), $options: 'i' }; // case-insensitive
  }

  // 3. Newest first. _id is a tie-breaker so the order is always repeatable.
  const tasks = await Task.find(filter).sort({ createdAt: -1, _id: -1 });

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved',
    data: { count: tasks.length, tasks },
  });
}

// GET /api/tasks/stats
async function getTaskStats(req, res) {
  // "Today" starts at midnight UTC. A task due today is not overdue yet.
  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  // One database query that counts everything for this user only.
  const result = await Task.aggregate([
    // 1. Isolation rule: only the logged-in user's tasks.
    { $match: { owner: req.user._id } },

    // 2. Put all of them in one group and count by condition.
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gt: ['$dueDate', null] }, // has a due date
                  { $lt: ['$dueDate', startOfToday] }, // before today
                  { $ne: ['$status', 'Completed'] }, // not finished
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // A user with no tasks gets no group at all, so we fall back to zeros.
  const counts = result[0] || {};

  res.status(200).json({
    success: true,
    message: 'Task statistics retrieved',
    data: {
      stats: {
        total: counts.total || 0,
        pending: counts.pending || 0,
        inProgress: counts.inProgress || 0,
        completed: counts.completed || 0,
        overdue: counts.overdue || 0,
      },
    },
  });
}

// GET /api/tasks/:id
async function getTaskById(req, res) {
  // The query needs BOTH the id and the owner. Someone else's task is "not found".
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

  if (!task) {
    throw createError(404, 'Task not found');
  }

  res.status(200).json({
    success: true,
    message: 'Task retrieved',
    data: { task },
  });
}

// PUT /api/tasks/:id
async function updateTask(req, res) {
  const body = req.body || {};

  // 1. Validate the input (same rules as creating a task).
  const errors = validateTask(body);
  if (errors.length > 0) {
    throw createError(400, 'Validation failed', errors);
  }

  // 2. Find the task. It must belong to the logged-in user.
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    throw createError(404, 'Task not found');
  }

  // 3. Change ONLY the allowed fields. The owner can never be changed.
  task.title = body.title.trim();
  if (typeof body.description === 'string') task.description = body.description.trim();
  if (body.priority !== undefined) task.priority = body.priority;
  if (body.status !== undefined) task.status = body.status;
  if (body.dueDate !== undefined) {
    // null or "" clears the due date. A valid date string sets it.
    task.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  }

  // 4. Save (the model validates again and updates "updatedAt") and reply.
  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated',
    data: { task },
  });
}

// PATCH /api/tasks/:id/status
async function updateTaskStatus(req, res) {
  const body = req.body || {};

  // 1. Only "status" is read, and it must be one of the three allowed values.
  const errors = validateStatusUpdate(body);
  if (errors.length > 0) {
    throw createError(400, 'Validation failed', errors);
  }

  // 2. Find the task. It must belong to the logged-in user.
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    throw createError(404, 'Task not found');
  }

  // 3. Change the status only, then save. "updatedAt" is refreshed automatically
  //    (if the status is the same as before, Mongoose sees no change and keeps the old time).
  task.status = body.status;
  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task status updated',
    data: { task },
  });
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  // Find and delete in one step. The query needs BOTH the id and the owner.
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

  if (!task) {
    throw createError(404, 'Task not found');
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted',
    data: { id: task._id },
  });
}

module.exports = {
  createTask,
  getTasks,
  getTaskStats,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};