import { useState } from 'react';
import { LogOut, Menu, X, Home, Zap, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BotStatus from '../components/BotStatus';
import WebSocketConfig from '../components/WebSocketConfig';
import QuoteManagement from '../components/QuoteManagement';

export default function Dashboard() {
  const { logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('status');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'status', label: 'Bot Status', icon: Home },
    { id: 'websocket', label: 'WebSocket Config', icon: Zap },
    { id: 'quotes', label: 'Quotes', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings, disabled: true },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'status':
        return <BotStatus />;
      case 'websocket':
        return <WebSocketConfig />;
      case 'quotes':
        return <QuoteManagement />;
      case 'settings':
        return <div className="text-gray-500">Settings coming soon...</div>;
      default:
        return <BotStatus />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">VeraBot</h1>
          <p className="text-sm text-gray-400">Admin Dashboard</p>
        </div>

        <nav className="flex-grow p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <h2 className="text-2xl font-semibold text-gray-900">
            {menuItems.find((item) => item.id === currentPage)?.label ||
              'Dashboard'}
          </h2>

          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString()} at{' '}
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-grow overflow-auto p-6">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
