import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar" data-testid="navbar">
      <Link to="/dashboard" className="navbar-brand" data-testid="navbar-brand">
        TaskFlow
      </Link>

      <div className="navbar-right">
        <span className="navbar-user" data-testid="navbar-user">
          {user?.name}
        </span>
        <button
          type="button"
          className="btn-logout"
          onClick={logout}
          data-testid="logout-button"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;