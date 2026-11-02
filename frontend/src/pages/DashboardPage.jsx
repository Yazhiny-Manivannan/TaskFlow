import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteTask, getTasks, getTaskStats, updateTaskStatus } from '../api/tasksApi';
import StatsCards from '../components/StatsCards';
import TaskFilters from '../components/TaskFilters';
import TaskList from '../components/TaskList';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/dashboard.css';
import '../styles/tasks.css';
import '../styles/actions.css';

function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();

  // ---------- Stats ----------
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const loadStats = useCallback(async () => {
    try {
      const data = await getTaskStats();
      setStats(data.stats);
      setStatsError('');
    } catch (err) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  function handleStatsRetry() {
    setStatsLoading(true);
    loadStats();
  }

  // ---------- Filters ----------
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  function handleClearFilters() {
    setSearchText('');
    setDebouncedSearch('');
    setStatus('');
    setPriority('');
  }

  const filtersActive = Boolean(debouncedSearch.trim() || status || priority);

  // ---------- Tasks ----------
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getTasks({ search: debouncedSearch, status, priority })
      .then((data) => {
        if (!cancelled) {
          setTasks(data.tasks);
          setTasksError('');
        }
      })
      .catch((err) => {
        if (!cancelled) setTasksError(err.message);
      })
      .finally(() => {
        if (!cancelled) setTasksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, status, priority, reloadKey]);

  // ---------- Actions: complete and delete ----------
  const [busyId, setBusyId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  // The Create and Edit pages send a message with navigate(). We show it once.
  const [message, setMessage] = useState(location.state?.message || '');
  const [actionError, setActionError] = useState('');

  function refreshAll() {
    setReloadKey((key) => key + 1);
    loadStats();
  }

  async function handleComplete(task) {
    setBusyId(task._id);
    setMessage('');
    setActionError('');
    try {
      await updateTaskStatus(task._id, 'Completed');
      setMessage('Task marked as completed.');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
      refreshAll();
    }
  }

  function handleDeleteClick(task) {
    setMessage('');
    setActionError('');
    setTaskToDelete(task);
  }

  async function handleDeleteConfirm() {
    const task = taskToDelete;
    setBusyId(task._id);
    try {
      await deleteTask(task._id);
      setMessage('Task deleted.');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
      setTaskToDelete(null);
      refreshAll();
    }
  }

  function handleDeleteCancel() {
    setTaskToDelete(null);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p data-testid="dashboard-welcome">Welcome, {user.name}.</p>
      </div>

      {statsLoading && <p data-testid="stats-loading">Loading statistics...</p>}

      {!statsLoading && statsError && (
        <div className="alert alert-error" role="alert" data-testid="stats-error">
          {statsError}{' '}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleStatsRetry}
            data-testid="stats-retry"
          >
            Retry
          </button>
        </div>
      )}

      {!statsLoading && !statsError && stats && <StatsCards stats={stats} />}

      <div className="section-header">
        <h2 className="section-title">My tasks</h2>
        <Link to="/tasks/new" className="btn" data-testid="task-create-link">
          New task
        </Link>
      </div>

      {message && (
        <div className="alert alert-success" role="status" data-testid="task-message">
          {message}
        </div>
      )}

      {actionError && (
        <div className="alert alert-error" role="alert" data-testid="task-action-error">
          {actionError}
        </div>
      )}

      <TaskFilters
        search={searchText}
        status={status}
        priority={priority}
        onSearchChange={setSearchText}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onClear={handleClearFilters}
      />

      {tasksLoading && <p data-testid="task-loading">Loading tasks...</p>}

      {!tasksLoading && tasksError && (
        <div className="alert alert-error" role="alert" data-testid="task-error">
          {tasksError}{' '}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setReloadKey((key) => key + 1)}
            data-testid="task-retry"
          >
            Retry
          </button>
        </div>
      )}

      {!tasksLoading && !tasksError && tasks.length === 0 && (
        <div className="empty-state" data-testid="task-empty">
          {filtersActive
            ? 'No tasks match your search or filters.'
            : 'You have no tasks yet. Click "New task" to create your first one.'}
        </div>
      )}

      {!tasksLoading && !tasksError && tasks.length > 0 && (
        <TaskList
          tasks={tasks}
          busyId={busyId}
          onComplete={handleComplete}
          onDelete={handleDeleteClick}
        />
      )}

      {taskToDelete && (
        <ConfirmDialog
          title="Delete task?"
          message={'Are you sure you want to delete "' + taskToDelete.title + '"? This cannot be undone.'}
          confirmLabel="Delete"
          isBusy={busyId === taskToDelete._id}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}

export default DashboardPage;