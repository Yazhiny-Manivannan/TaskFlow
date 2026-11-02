import { useState } from 'react';
import { PRIORITIES, STATUSES } from '../utils/taskHelpers';
import { backendErrorsToObject, validateTaskForm } from '../utils/validation';

const EMPTY_VALUES = {
  title: '',
  description: '',
  priority: 'Medium',
  status: 'Pending',
  dueDate: '',
};

// Used by both the Create page and the Edit page.
//   initialValues: starting values (the Edit page passes the existing task)
//   submitLabel:   text on the button, for example "Create task"
//   onSubmit:      async function that receives the cleaned task data
//   onCancel:      called when the user clicks Cancel
function TaskForm({ initialValues, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));

    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }));
    }
    setServerError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    // 1. Check the form in the browser first.
    const foundErrors = validateTaskForm(values);
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }

    // 2. Build the data. An empty due date becomes null ("no due date").
    const taskData = {
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate ? values.dueDate : null,
    };

    setIsSubmitting(true);
    setErrors({});
    setServerError('');

    try {
      await onSubmit(taskData); // the page decides what happens on success
    } catch (error) {
      // axiosInstance gives us { status, message, errors }.
      const fieldErrors = backendErrorsToObject(error.errors);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setServerError(error.message);
      }
      setIsSubmitting(false);
    }
  }

  const titleClass = errors.title ? 'form-group has-error' : 'form-group';
  const descriptionClass = errors.description ? 'form-group has-error' : 'form-group';
  const priorityClass = errors.priority ? 'form-group has-error' : 'form-group';
  const statusClass = errors.status ? 'form-group has-error' : 'form-group';
  const dueDateClass = errors.dueDate ? 'form-group has-error' : 'form-group';

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="task-form">
      {serverError && (
        <div className="alert alert-error" role="alert" data-testid="task-form-error">
          {serverError}
        </div>
      )}

      <div className={titleClass}>
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          aria-invalid={Boolean(errors.title)}
          data-testid="task-title"
        />
        {errors.title && (
          <p className="field-error" data-testid="task-title-error">
            {errors.title}
          </p>
        )}
      </div>

      <div className={descriptionClass}>
        <label htmlFor="task-description">Description (optional)</label>
        <textarea
          id="task-description"
          name="description"
          rows={4}
          value={values.description}
          onChange={handleChange}
          aria-invalid={Boolean(errors.description)}
          data-testid="task-description"
        />
        {errors.description && (
          <p className="field-error" data-testid="task-description-error">
            {errors.description}
          </p>
        )}
      </div>

      <div className={priorityClass}>
        <label htmlFor="task-priority">Priority</label>
        <select
          id="task-priority"
          name="priority"
          value={values.priority}
          onChange={handleChange}
          data-testid="task-priority"
        >
          {PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        {errors.priority && (
          <p className="field-error" data-testid="task-priority-error">
            {errors.priority}
          </p>
        )}
      </div>

      <div className={statusClass}>
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          name="status"
          value={values.status}
          onChange={handleChange}
          data-testid="task-status"
        >
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="field-error" data-testid="task-status-error">
            {errors.status}
          </p>
        )}
      </div>

      <div className={dueDateClass}>
        <label htmlFor="task-due-date">Due date (optional)</label>
        <input
          id="task-due-date"
          name="dueDate"
          type="date"
          value={values.dueDate}
          onChange={handleChange}
          aria-invalid={Boolean(errors.dueDate)}
          data-testid="task-due-date"
        />
        {errors.dueDate && (
          <p className="field-error" data-testid="task-due-date-error">
            {errors.dueDate}
          </p>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn"
          disabled={isSubmitting}
          data-testid="task-submit"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          data-testid="task-cancel"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default TaskForm;