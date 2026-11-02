import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getTask, updateTask } from '../api/tasksApi';
import { toDateInputValue } from '../utils/taskHelpers';
import TaskForm from '../components/TaskForm';
import '../styles/forms.css';

function EditTaskPage() {
  const { id } = useParams(); // the :id from the address
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the task once when the page opens.
  useEffect(() => {
    let cancelled = false;

    getTask(id)
      .then((data) => {
        if (!cancelled) setTask(data.task);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message); // for example "Task not found"
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(taskData) {
    await updateTask(id, taskData);
    navigate('/dashboard', { state: { message: 'Task updated successfully.' } });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Edit task</h1>
      </div>

      {isLoading && <p data-testid="task-loading">Loading task...</p>}

      {!isLoading && error && (
        <div className="alert alert-error" role="alert" data-testid="task-load-error">
          {error} <Link to="/dashboard">Back to the dashboard</Link>
        </div>
      )}

      {!isLoading && task && (
        <div className="form-card">
          <TaskForm
            initialValues={{
              title: task.title,
              description: task.description || '',
              priority: task.priority,
              status: task.status,
              dueDate: toDateInputValue(task.dueDate),
            }}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard')}
          />
        </div>
      )}
    </div>
  );
}

export default EditTaskPage;