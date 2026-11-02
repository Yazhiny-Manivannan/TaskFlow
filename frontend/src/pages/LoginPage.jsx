import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { backendErrorsToObject, validateLoginForm } from '../utils/validation';
import '../styles/forms.css';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after login. ProtectedRoute saves the page the visitor wanted
  // in location.state.from. If there is none, we use the dashboard.
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  // The register page sends { registered: true } after a successful signup.
  const justRegistered = Boolean(location.state?.registered);

  const [values, setValues] = useState({ email: '', password: '' });
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
    const foundErrors = validateLoginForm(values);
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }

    // 2. Ask the context to log in. It saves the token and the user.
    setIsSubmitting(true);
    setErrors({});
    setServerError('');

    try {
      await login({ email: values.email.trim(), password: values.password });

      // 3. Success: go to the page the visitor wanted (or the dashboard).
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const fieldErrors = backendErrorsToObject(error.errors);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setServerError(error.message);
      }
      setIsSubmitting(false);
    }
  }

  const emailGroupClass = errors.email ? 'form-group has-error' : 'form-group';
  const passwordGroupClass = errors.password ? 'form-group has-error' : 'form-group';

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to manage your tasks.</p>

        {justRegistered && !serverError && (
          <div className="alert alert-success" role="status" data-testid="login-success">
            Registration successful. Please log in.
          </div>
        )}

        {serverError && (
          <div className="alert alert-error" role="alert" data-testid="login-error">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={emailGroupClass}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              data-testid="login-email"
            />
            {errors.email && (
              <p className="field-error" data-testid="login-email-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className={passwordGroupClass}>
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
              data-testid="login-password"
            />
            {errors.password && (
              <p className="field-error" data-testid="login-password-error">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-block"
            disabled={isSubmitting}
            data-testid="login-submit"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          No account yet?{' '}
          <Link to="/register" data-testid="login-register-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;