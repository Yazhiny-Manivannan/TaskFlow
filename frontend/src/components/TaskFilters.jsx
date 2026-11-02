import { PRIORITIES, STATUSES } from '../utils/taskHelpers';

// The search box and the two dropdowns. The page owns the values,
// so this component only shows them and reports changes.
function TaskFilters({ search, status, priority, onSearchChange, onStatusChange, onPriorityChange, onClear }) {
  return (
    <div className="filters" data-testid="task-filters">
      <div className="form-group">
        <label htmlFor="task-search">Search by title</label>
        <input
          id="task-search"
          type="text"
          maxLength={100}
          placeholder="Type to search..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          data-testid="task-search"
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-filter-status">Status</label>
        <select
          id="task-filter-status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          data-testid="task-filter-status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="task-filter-priority">Priority</label>
        <select
          id="task-filter-priority"
          value={priority}
          onChange={(event) => onPriorityChange(event.target.value)}
          data-testid="task-filter-priority"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={onClear}
        data-testid="task-filter-clear"
      >
        Clear
      </button>
    </div>
  );
}

export default TaskFilters;