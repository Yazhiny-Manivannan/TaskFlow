import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTask } from '../api/tasksApi';
import { formatDate, isOverdue } from '../utils/taskHelpers';
import '../styles/forms.css';
import '../styles/tasks.css';

// Shows date and time of when a task was created or changed.
function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-GB');
}

function TaskDetailPage() {
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getTask(id)
      .then((data) => {
        if (!cancelled) setTask(data.task);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div>
      <div className="page-header">
        <h1>Task details</h1>
      </div>

      {isLoading && <p data-testid="task-loading">Loading task...</p>}

      {!isLoading && error && (
        <div className="alert alert-error" role="alert" data-testid="task-load-error">
          {error} <Link to="/dashboard">Back to the dashboard</Link>
        </div>
      )}

      {!isLoading && task && (
        <div className="detail-card" data-testid="task-detail">
          <h2 data-testid="task-detail-title">{task.title}</h2>

          <dl className="detail-list">
            <dt>Description</dt>
            <dd data-testid="task-detail-description">
              {task.description ? task.description : 'No description'}
            </dd>

            <dt>Priority</dt>
            <dd data-testid="task-detail-priority">{task.priority}</dd>

            <dt>Status</dt>
            <dd data-testid="task-detail-status">
              {task.status}
              {isOverdue(task) && (
                <span className="badge badge-overdue" data-testid="task-detail-overdue">
                  {' '}Overdue
                </span>
              )}
            </dd>

            <dt>Due date</dt>
            <dd data-testid="task-detail-due">{formatDate(task.dueDate)}</dd>

            <dt>Created</dt>
            <dd data-testid="task-detail-created">{formatDateTime(task.createdAt)}</dd>

            <dt>Last updated</dt>
            <dd data-testid="task-detail-updated">{formatDateTime(task.updatedAt)}</dd>
          </dl>

          <div className="form-actions">
            <Link
              to={'/tasks/' + task._id + '/edit'}
              className="btn"
              data-testid="task-detail-edit"
            >
              Edit
            </Link>
            <Link to="/dashboard" className="btn btn-secondary" data-testid="task-detail-back">
              Back
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDetailPage;