import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY, setUnauthorizedHandler } from '../api/axiosInstance';
import { getCurrentUser, loginUser, registerUser } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // True while we are checking a saved token after a page load.
  // It starts as true only if a token exists, so logged-out visitors never wait.
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  // Removes the token and forgets the user. Used by logout and by 401 handling.
  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // 1. Register the central 401 handler. (This effect must stay ABOVE the
  //    restore effect, so it is ready before /auth/me is called.)
  useEffect(() => {
    setUnauthorizedHandler(clearAuth);
    return () => setUnauthorizedHandler(null);
  }, [clearAuth]);

  // 2. Restore the login after a refresh. Runs once when the app starts.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      return; // no token, nothing to restore
    }

    let cancelled = false;

    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        // A 401 has already cleared the token through the handler above.
        // Any other failure (for example the server is down) just leaves
        // us logged out for now, and the token stays for the next refresh.
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true; // ignore the result if the component is gone
    };
  }, []);

  // Login: save the token, keep the user. Errors go back to the login form.
  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, token } = await loginUser(credentials);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  // Register: our backend returns a token too, so the user is logged in at once.
  const register = useCallback(async (formData) => {
    const { user: newUser, token } = await registerUser(formData);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(newUser);
    return newUser;
  }, []);

  // Logout: JWTs are stateless, so "logging out" means deleting our copy.
  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  // Rebuilt only when something it contains changes.
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Shortcut for pages: const { user, logout } = useAuth();
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}