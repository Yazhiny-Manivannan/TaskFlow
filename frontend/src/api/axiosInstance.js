import axios from 'axios';

// The only place where the key name is defined, so it is never mistyped elsewhere.
export const TOKEN_KEY = 'taskflow_token';

// Reads VITE_API_URL from frontend/.env. The fallback is for safety only.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // give up after 10 seconds instead of waiting forever
});

// The authentication context registers a function here. It is called when the
// server rejects a token we sent (expired, invalid, or the user was deleted).
let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// ---------- REQUEST INTERCEPTOR ----------
// Runs before EVERY request. If a token is saved, it is added to the headers.
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- RESPONSE INTERCEPTOR ----------
// Runs after EVERY response. On failure it turns the error into one simple shape:
// { status, message, errors }
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    let status = null;
    let message = 'Something went wrong. Please try again.';
    let errors = [];

    if (error.response) {
      // The server replied with an error (400, 401, 404, 409, 500...).
      status = error.response.status;
      message = error.response.data?.message || message;
      errors = error.response.data?.errors || [];

      // A 401 on a request that CARRIED a token means the login is no longer
      // valid, so we ask the context to clear it. A 401 on a request without a
      // token (for example a wrong password at login) is left alone.
      const tokenWasSent = Boolean(error.config?.headers?.Authorization);
      if (status === 401 && tokenWasSent && unauthorizedHandler) {
        unauthorizedHandler();
      }
    } else if (error.code === 'ECONNABORTED') {
      message = 'The server took too long to respond. Please try again.';
    } else {
      // No reply at all: backend stopped, wrong address, or no internet.
      message = 'Cannot reach the server. Please check that the backend is running.';
    }

    // Everything a page needs is in this object. Pages never read raw Axios errors.
    return Promise.reject({ status, message, errors });
  }
);

export default axiosInstance;