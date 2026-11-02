import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import { backendErrorsToObject, validateRegisterForm } from '../utils/validation';
import '../styles/forms.css';

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '' };

function RegisterPage() {
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({}); // { fieldName: 'message' }
  const [serverError, setServerError] = useState(''); // general error, not tied to one field
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Runs every time the user types. The input's "name" tells us which value to change.
  function handleChange(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));

    // Remove the old error for this field as soon as the user edits it.
    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }));
    }
    setServerError('');
  }

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    if (isSubmitting) return; // ignore double clicks

    // 1. Check the form in the browser first.
    const foundErrors = validateRegisterForm(values);
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }

    // 2. Send it to the backend.
    setIsSubmitting(true);
    setErrors({});
    setServerError('');

    try {
      await registerUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      // 3. Success: go to the login page and pass a message along.
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (error) {
      // axiosInstance gives us { status, message, errors }.
      const fieldErrors = backendErrorsToObject(error.errors);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors); // show each message under its own input
      } else {
        setServerError(error.message); // for example "Cannot reach the server"
      }
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-subtitle">Register to start managing your tasks.</p>

        {serverError && (
          <div className="alert alert-error" role="alert" data-testid="register-error">
            {serverError}
          </div>
        )}

        {/* noValidate turns off the browser's own pop-up messages,
            so our messages are shown instead. */}
        <form onSubmit={handleSubmit} noValidate>
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={handleChange}
              aria-invalid={Boolean(errors.name)}
              data-testid="register-name"
            />
            {errors.name && (
              <p className="field-error" data-testid="register-name-error">
                {errors.name}
              </p>
            )}
          </div>

          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              data-testid="register-email"
            />
            {errors.email && (
              <p className="field-error" data-testid="register-email-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
              data-testid="register-password"
            />
            {errors.password && (
              <p className="field-error" data-testid="register-password-error">
                {errors.password}
              </p>
            )}
          </div>

          <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
            <label htmlFor="register-confirm-password">Confirm password</label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleChange}
              aria-invalid={Boolean(errors.confirmPassword)}
              data-testid="register-confirm-password"
            />
            {errors.confirmPassword && (
              <p className="field-error" data-testid="register-confirm-password-error">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-block"
            disabled={isSubmitting}
            data-testid="register-submit"
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" data-testid="register-login-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;