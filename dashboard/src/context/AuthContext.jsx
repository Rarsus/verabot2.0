import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('auth_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check URL for token from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const oauthError = params.get('error');

    if (token) {
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Store token and authenticate
      localStorage.setItem('auth_token', token);
      setIsAuthenticated(true);

      // Fetch user info
      authAPI
        .getUser()
        .then((response) => {
          setUser(response.data.user);
        })
        .catch(() => {
          // Failed to get user info, but keep token
        });
    } else if (oauthError) {
      setError(`OAuth error: ${oauthError}`);
      window.history.replaceState({}, document.title, '/login');
    }
  }, []);

  // OAuth login - redirect to Discord
  const loginWithDiscord = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.getLoginUrl();
      if (response.data.authUrl) {
        // Redirect to Discord OAuth
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate login');
      setLoading(false);
    }
  }, []);

  // Legacy token-based login (for backwards compatibility)
  const login = useCallback(async (token) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.verify(token);
      localStorage.setItem('auth_token', token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore logout errors
    }
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    loginWithDiscord,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
