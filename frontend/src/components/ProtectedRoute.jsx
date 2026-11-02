import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards pages that need a login. Used in the route table in Step 5C-2.
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // A saved token is still being checked with the server. Do not redirect yet.
  if (isLoading) {
    return <p data-testid="auth-loading">Loading...</p>;
  }

  // Not logged in: go to the login page. "from" remembers where the visitor
  // wanted to go, so the login page can send them back after login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in: show the requested page.
  return <Outlet />;
}

export default ProtectedRoute;