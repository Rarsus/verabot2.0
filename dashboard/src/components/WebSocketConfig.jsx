import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import Alert from './Alert';
import { websocketAPI } from '../services/api';

export default function WebSocketConfig() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    enabled: false,
    webhookUrl: '',
    allowedActions: [],
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await websocketAPI.getServices();
      setServices(response.data);
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Failed to load services',
        message: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service.name);
    setFormData({
      enabled: service.enabled,
      webhookUrl: service.webhookUrl || '',
      allowedActions: service.allowedActions || [],
    });
  };

  const handleSave = async () => {
    try {
      await websocketAPI.updateService(editingService, formData);
      setAlert({
        type: 'success',
        title: 'Configuration saved',
        message: `WebSocket service "${editingService}" has been updated.`,
      });
      setEditingService(null);
      fetchServices();
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Failed to save configuration',
        message: error.response?.data?.message || error.message,
      });
    }
  };

  const handleTestConnection = async (serviceName) => {
    try {
      await websocketAPI.testConnection(serviceName);
      setAlert({
        type: 'success',
        title: 'Connection successful',
        message: `Connected to "${serviceName}" successfully.`,
      });
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Connection failed',
        message: error.response?.data?.message || error.message,
      });
    }
  };

  const handleToggle = async (serviceName, currentState) => {
    try {
      await websocketAPI.toggleService(serviceName, !currentState);
      setAlert({
        type: 'success',
        title: 'Service updated',
        message: `Service "${serviceName}" is now ${!currentState ? 'enabled' : 'disabled'}.`,
      });
      fetchServices();
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Failed to update service',
        message: error.response?.data?.message || error.message,
      });
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

      <div className="grid gap-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-900">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {service.description || 'External WebSocket service'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    service.isConnected ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span className="text-sm font-medium text-gray-700">
                  {service.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            {editingService === service.name ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        webhookUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="wss://webhook.example.com/..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Enabled
                    </span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-600">Status: </span>
                  <span
                    className={`font-medium ${
                      service.enabled ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {service.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Allowed Actions: </span>
                  <span className="font-medium">
                    {service.allowedActions?.length || 0} actions
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => handleTestConnection(service.name)}
                    className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition font-medium text-sm"
                  >
                    Test Connection
                  </button>
                  <button
                    onClick={() =>
                      handleToggle(service.name, service.enabled)
                    }
                    className={`px-4 py-2 border rounded-lg transition font-medium text-sm ${
                      service.enabled
                        ? 'text-orange-600 border-orange-600 hover:bg-orange-50'
                        : 'text-green-600 border-green-600 hover:bg-green-50'
                    }`}
                  >
                    {service.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No WebSocket services configured.</p>
          <p className="text-sm text-gray-400 mt-1">
            Add services in src/config/external-actions.js
          </p>
        </div>
      )}
    </div>
  );
}
