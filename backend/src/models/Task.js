const mongoose = require('mongoose');

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title is required'],
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must be at most 500 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: PRIORITIES,
        message: 'Priority must be one of: Low, Medium, High',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Status must be one of: Pending, In Progress, Completed',
      },
      default: 'Pending',
    },
    dueDate: {
      type: Date,
      default: null, // a due date is optional
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true, // fast lookup of "all tasks of this user"
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

// Speeds up the dashboard filters (owner + status) and newest-first listing.
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, createdAt: -1 });

// Remove the internal version field from API responses.
taskSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
module.exports.PRIORITIES = PRIORITIES;
module.exports.STATUSES = STATUSES;