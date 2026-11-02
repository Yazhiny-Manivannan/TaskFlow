import { Link } from 'react-router-dom';

// Shown for any URL that no route matches, for example /abc.
function NotFoundPage() {
  return (
    <div style={{ padding: '2rem' }} data-testid="not-found">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/dashboard">Go to the dashboard</Link>
    </div>
  );
}

export default NotFoundPage;