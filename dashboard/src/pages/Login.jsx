import { useState } from 'react';
import { Loader } from 'lucide-react';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token.trim()) {
      setError('Please enter a bot token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await login(token);
      if (!success) {
        setError('Invalid token');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">VeraBot Dashboard</h1>
            <p className="text-gray-600 mt-2">Admin Management Panel</p>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your bot admin token"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                This token is used to verify admin access. It is NOT stored and only used for this session.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Features</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Monitor bot status and statistics</li>
              <li>✓ Manage quotes and tags</li>
              <li>✓ Configure WebSocket services</li>
              <li>✓ View command information</li>
              <li>✓ Manage guild settings</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-white text-sm mt-6">
          VeraBot v2.12.0 • Dashboard Admin Panel
        </p>
      </div>
    </div>
  );
}
