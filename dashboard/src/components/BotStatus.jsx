import { useState, useEffect } from 'react';
import { Loader, Server } from 'lucide-react';
import Alert from './Alert';
import { botAPI } from '../services/api';

export default function BotStatus() {
  const [status, setStatus] = useState(null);
  const [info, setInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBotData = async () => {
    try {
      const [statusRes, infoRes, statsRes] = await Promise.all([
        botAPI.getStatus(),
        botAPI.getInfo(),
        botAPI.getStats(),
      ]);

      setStatus(statusRes.data);
      setInfo(infoRes.data);
      setStats(statsRes.data);
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Failed to fetch bot data',
        message: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alert && <Alert {...alert} onDismiss={() => setAlert(null)} />}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Bot Status</h3>
          </div>

          {status && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`inline-block w-3 h-3 rounded-full ${status.online ? 'bg-green-500' : 'bg-red-500'}`}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium text-gray-900">{formatUptime(status.uptime)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Latency:</span>
                <span className="font-medium text-gray-900">{status.latency}ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Memory:</span>
                <span className="font-medium text-gray-900">{formatBytes(status.memory)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bot Info</h3>

          {info && (
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Name</span>
                <p className="font-medium text-gray-900">{info.username}</p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">ID</span>
                <p className="font-mono text-sm text-gray-900 break-all">{info.userId}</p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">Version</span>
                <p className="font-medium text-gray-900">{info.version}</p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">Prefix</span>
                <p className="font-medium text-gray-900">{info.prefix}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Guilds</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{stats.guildCount || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600 font-medium">Commands</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{stats.commandCount || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">Users</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">{stats.userCount || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-600 font-medium">Messages</p>
            <p className="text-3xl font-bold text-orange-900 mt-2">{stats.messageCount || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function formatUptime(ms) {
  if (!ms) return 'N/A';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}
