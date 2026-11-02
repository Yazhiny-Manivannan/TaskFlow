const express = require('express');
const {
  createTask,
  getTasks,
  getTaskStats,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// Every task route needs a valid token. This line guards all routes below it.
router.use(protect);

router.post('/', createTask);
router.get('/', getTasks);

// Fixed paths like /stats MUST come before the /:id routes.
// Otherwise Express would read the word "stats" as a task id.
router.get('/stats', getTaskStats);

router.get('/:id', validateObjectId, getTaskById);
router.put('/:id', validateObjectId, updateTask);
router.patch('/:id/status', validateObjectId, updateTaskStatus);
router.delete('/:id', validateObjectId, deleteTask);

module.exports = router;