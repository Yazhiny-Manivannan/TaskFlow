import axiosInstance from './axiosInstance';

// Every function returns only the "data" part of the backend reply.
// Errors arrive as { status, message, errors } (see axiosInstance.js).

// Removes empty filter values. The backend rejects ?status= (empty) with a 400,
// so we only send filters that really have a value.
function cleanParams(params) {
  const result = {};
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (typeof value === 'string' && value.trim() !== '') {
      result[key] = value.trim();
    }
  });
  return result;
}

// GET /api/tasks?search=...&status=...&priority=...
// Returns: { count, tasks }
export async function getTasks(filters = {}) {
  const response = await axiosInstance.get('/tasks', { params: cleanParams(filters) });
  return response.data.data;
}

// GET /api/tasks/stats
// Returns: { stats: { total, pending, inProgress, completed, overdue } }
export async function getTaskStats() {
  const response = await axiosInstance.get('/tasks/stats');
  return response.data.data;
}

// GET /api/tasks/:id
// Returns: { task }
export async function getTask(id) {
  const response = await axiosInstance.get('/tasks/' + id);
  return response.data.data;
}

// POST /api/tasks
// Sends: { title, description, priority, status, dueDate }
// Returns: { task }
export async function createTask(taskData) {
  const response = await axiosInstance.post('/tasks', taskData);
  return response.data.data;
}

// PUT /api/tasks/:id
// Sends the whole task (title is required). Returns: { task }
export async function updateTask(id, taskData) {
  const response = await axiosInstance.put('/tasks/' + id, taskData);
  return response.data.data;
}

// PATCH /api/tasks/:id/status
// Sends: { status }. Returns: { task }
export async function updateTaskStatus(id, status) {
  const response = await axiosInstance.patch('/tasks/' + id + '/status', { status });
  return response.data.data;
}

// DELETE /api/tasks/:id
// Returns: { id }
export async function deleteTask(id) {
  const response = await axiosInstance.delete('/tasks/' + id);
  return response.data.data;
}