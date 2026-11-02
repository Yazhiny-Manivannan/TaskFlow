import { useNavigate } from 'react-router-dom';
import { createTask } from '../api/tasksApi';
import TaskForm from '../components/TaskForm';
import '../styles/forms.css';

function CreateTaskPage() {
  const navigate = useNavigate();

  // TaskForm calls this with the cleaned data. If it throws, the form shows the error.
  async function handleSubmit(taskData) {
    await createTask(taskData);
    navigate('/dashboard', { state: { message: 'Task created successfully.' } });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Create task</h1>
        <p>Fill in the details below.</p>
      </div>

      <div className="form-card">
        <TaskForm
          submitLabel="Create task"
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
}

export default CreateTaskPage;