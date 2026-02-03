import React, { useState } from 'react';
import { Plus, Copy, Eye, EyeOff, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { ConnectedApp } from '../types';

interface AppManagerProps {
  apps: ConnectedApp[];
  onAddApp: (app: ConnectedApp) => void;
  onDeleteApp: (appId: string) => void;
}

export const AppManager: React.FC<AppManagerProps> = ({ apps, onAddApp, onDeleteApp }) => {
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [showNewAppForm, setShowNewAppForm] = useState(false);
  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    subscriptionTier: 'free' as const
  });

  const generateApiKey = (): string => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `sk_live_${timestamp}${randomStr}`;
  };

  const handleAddApp = () => {
    if (!newApp.name || !newApp.description) {
      alert('Please fill in all fields');
      return;
    }

    const app: ConnectedApp = {
      id: `app-${Date.now()}`,
      name: newApp.name,
      description: newApp.description,
      databaseId: `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'connected',
      apiKey: generateApiKey(),
      userCount: 0
    };

    onAddApp(app);
    setNewApp({ name: '', description: '', subscriptionTier: 'free' });
    setShowNewAppForm(false);
  };

  const copyToClipboard = (text: string, appId: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Connected Apps</h2>
          <p className="text-gray-600 mt-2">Manage applications and their integration settings</p>
        </div>
        <button
          onClick={() => setShowNewAppForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add New App
        </button>
      </div>

      {/* New App Form */}
      {showNewAppForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Register New Application</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Name
              </label>
              <input
                type="text"
                value={newApp.name}
                onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                placeholder="e.g., SocialFlow, Analytics Dashboard"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newApp.description}
                onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                placeholder="What does this app do?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddApp}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create App
              </button>
              <button
                onClick={() => setShowNewAppForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-600">No connected apps yet. Create your first app to get started.</p>
          </div>
        ) : (
          apps.map((app) => (
            <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* App Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{app.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {app.status === 'connected' ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <AlertCircle size={20} className="text-red-500" />
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  app.status === 'connected'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>

              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{app.userCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Database ID</p>
                    <p className="text-sm font-mono text-gray-700">{app.databaseId.substring(0, 8)}...</p>
                  </div>
                </div>
              </div>

              {/* API Key Section */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">API Key</label>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <code className="text-xs font-mono text-gray-600 flex-1">
                    {showApiKey[app.id] ? app.apiKey : '•'.repeat(20)}
                  </code>
                  <button
                    onClick={() => setShowApiKey({ ...showApiKey, [app.id]: !showApiKey[app.id] })}
                    className="text-gray-600 hover:text-gray-800"
                    title={showApiKey[app.id] ? 'Hide' : 'Show'}
                  >
                    {showApiKey[app.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(app.apiKey, app.id)}
                    className="text-gray-600 hover:text-gray-800"
                    title="Copy API Key"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Webhook URL */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Webhook URL</label>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <code className="text-xs font-mono text-gray-600 flex-1 truncate">
                    https://arunika-monitoring.pages.dev/api/webhooks
                  </code>
                  <button
                    onClick={() => copyToClipboard('https://arunika-monitoring.pages.dev/api/webhooks', app.id)}
                    className="text-gray-600 hover:text-gray-800"
                    title="Copy Webhook URL"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Integration Instructions */}
              <details className="mb-6">
                <summary className="text-sm font-semibold text-blue-600 cursor-pointer hover:text-blue-700">
                  Integration Instructions
                </summary>
                <div className="mt-3 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg space-y-2">
                  <p>
                    <strong>1. Setup:</strong> Copy the API Key above
                  </p>
                  <p>
                    <strong>2. Install SDK:</strong> Download arunikaSdk.ts from documentation
                  </p>
                  <p>
                    <strong>3. Initialize:</strong> Create ArunikaSDK instance with your credentials
                  </p>
                  <p>
                    <strong>4. Use:</strong> Call registerUser() on user signup, logActivity() for tracking
                  </p>
                  <p>
                    <a href="https://github.com/dinurpradipta12/Arunika-Monitoring/blob/main/INTEGRATION.md"
                       target="_blank"
                       className="text-blue-600 hover:underline">
                      View full documentation →
                    </a>
                  </p>
                </div>
              </details>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => alert('Feature coming soon!')}
                  className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                >
                  Test Connection
                </button>
                <button
                  onClick={() => onDeleteApp(app.id)}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  title="Delete app"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Integration Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Integrate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-semibold mb-2">For Frontend Apps (React, Vue, etc):</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Import ArunikaSDK</li>
              <li>Initialize with your API Key</li>
              <li>Call registerUser() on signup</li>
              <li>Use logActivity() to track events</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold mb-2">For Backend Apps (Node.js, Python, etc):</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Make POST request to webhook URL</li>
              <li>Include X-API-Key header</li>
              <li>Send user data as JSON payload</li>
              <li>Monitor for real-time updates</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppManager;
