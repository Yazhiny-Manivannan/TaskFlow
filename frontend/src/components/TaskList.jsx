import { Link } from 'react-router-dom';
import { formatDate, isOverdue } from '../utils/taskHelpers';

// Draws the tasks it receives and reports button clicks to the page.
function TaskList({ tasks, busyId, onComplete, onDelete }) {
  return (
    <ul className="task-list" data-testid="task-list">
      {tasks.map((task) => {
        const priorityClass = task.priority === 'High' ? 'badge badge-high' : 'badge';
        const statusClass = task.status === 'Completed' ? 'badge badge-completed' : 'badge';
        const isBusy = busyId === task._id;

        return (
          <li className="task-item" key={task._id} data-testid="task-item" data-task-id={task._id}>
            <div className="task-item-top">
              <h3 className="task-item-title" data-testid="task-item-title">
                {task.title}
              </h3>
              <div>
                <span className={priorityClass} data-testid="task-item-priority">
                  {task.priority}
                </span>{' '}
                <span className={statusClass} data-testid="task-item-status">
                  {task.status}
                </span>
              </div>
            </div>

            {task.description && (
              <p className="task-item-description" data-testid="task-item-description">
                {task.description}
              </p>
            )}

            <div className="task-meta">
              <span data-testid="task-item-due">Due: {formatDate(task.dueDate)}</span>
              {isOverdue(task) && (
                <span className="badge badge-overdue" data-testid="task-item-overdue">
                  Overdue
                </span>
              )}
            </div>

            <div className="task-actions">
              <Link
                to={'/tasks/' + task._id}
                className="btn btn-small btn-secondary"
                data-testid="task-view"
              >
                View
              </Link>
              <Link
                to={'/tasks/' + task._id + '/edit'}
                className="btn btn-small btn-secondary"
                data-testid="task-edit"
              >
                Edit
              </Link>
              {task.status !== 'Completed' && (
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => onComplete(task)}
                  disabled={isBusy}
                  data-testid="task-complete"
                >
                  Complete
                </button>
              )}
              <button
                type="button"
                className="btn btn-small btn-danger-outline"
                onClick={() => onDelete(task)}
                disabled={isBusy}
                data-testid="task-delete"
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default TaskList;