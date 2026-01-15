import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('auth_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check URL for token from OAuth callback
  useEffect(() => {
    // No need to check URL anymore - the server sets an HTTP-only cookie
    // axios will automatically send it with requests
    const storedToken = localStorage.getItem('auth_token');
    console.log('AuthContext: Checking authentication...');

    // Check if we have a token in localStorage
    if (storedToken) {
      console.log('✓ Token found in localStorage');
      // Verify it's still valid
      authAPI
        .verify()
        .then((response) => {
          console.log('✓ Token verified');
          setUser(response.data.user);
          setIsAuthenticated(true);
          setLoading(false);
        })
        .catch((err) => {
          console.warn('⚠️  Token verification failed:', err.response?.status);
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          setLoading(false);
        });
    } else {
      // No token in localStorage, try to verify with cookie
      console.log('No token in localStorage, trying cookie-based auth...');
      authAPI
        .verify()
        .then((response) => {
          console.log('✓ Cookie-based authentication successful');
          // Store token in localStorage if verification succeeds
          // Actually, we can't do this since we got here without a token in localStorage
          // But axios will keep sending the cookie automatically
          setUser(response.data.user);
          setIsAuthenticated(true);
          setLoading(false);
        })
        .catch((err) => {
          console.log('Not authenticated (expected on first visit)');
          setIsAuthenticated(false);
          setLoading(false);
        });
    }
  }, []);

  // OAuth login - redirect to Discord
  const loginWithDiscord = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.getLoginUrl();
      if (response.data.authUrl) {
        console.log('✓ Got OAuth URL, redirecting...');
        console.log('URL:', response.data.authUrl);
        // Redirect to Discord OAuth
        // Using a small delay to ensure UI updates
        setTimeout(() => {
          window.location.href = response.data.authUrl;
        }, 100);
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
