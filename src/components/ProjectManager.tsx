import React, { useState } from 'react';
import { Plus, Database, Server, MoreHorizontal, Code, Activity, RefreshCw, X, Settings, Trash2, Edit2, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { ConnectedApp } from '../types';

interface ProjectManagerProps {
  apps: ConnectedApp[];
  onAddApp: (app: ConnectedApp) => void;
  onUpdateApp: (id: string, updates: Partial<ConnectedApp>) => void;
  onDeleteApp: (id: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ apps, onAddApp, onUpdateApp, onDeleteApp }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [appName, setAppName] = useState('');
  const [dbType, setDbType] = useState<'postgres' | 'mysql' | 'mongodb'>('postgres');
  const [dbHost, setDbHost] = useState('');
  const [dbPort, setDbPort] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [description, setDescription] = useState('');
  
  // Connection Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'none' | 'success' | 'failed'>('none');

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setAppName('');
    setDbType('postgres');
    setDbHost('');
    setDbPort('5432');
    setDbUser('');
    setDescription('');
    setTestStatus('none');
    setIsModalOpen(true);
  };

  const openEditModal = (app: ConnectedApp) => {
    setIsEditing(true);
    setEditId(app.id);
    setAppName(app.name);
    setDbType(app.dbType as any);
    // Parse simulated connection string for display
    const parts = app.connectionString.split('@');
    setDbHost(parts[1] ? parts[1].split(':')[0] : 'localhost');
    setDbUser('admin'); 
    setDbPort('5432');
    setDescription(app.description);
    setTestStatus('none');
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestStatus('none');
    // Simulate network request
    setTimeout(() => {
      setIsTesting(false);
      // Random success/fail for demo purposes, mostly success
      setTestStatus(Math.random() > 0.1 ? 'success' : 'failed');
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct simulated connection string
    const mockConnString = `${dbType}://${dbUser}:***@${dbHost}:${dbPort}/${appName.toLowerCase().replace(/\s/g, '_')}`;

    if (isEditing && editId) {
      onUpdateApp(editId, {
        name: appName,
        dbType,
        connectionString: mockConnString,
        description,
        status: 'connected'
      });
    } else {
      const newApp: ConnectedApp = {
        id: `app-${Date.now()}`,
        name: appName,
        dbType,
        connectionString: mockConnString,
        description,
        status: 'connected',
        lastSync: 'Just now',
        userCount: 0
      };
      onAddApp(newApp);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10" onClick={() => setActiveMenuId(null)}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Database Connections</h1>
          <p className="text-slate-500 mt-1">Configure connections to external application databases for monitoring.</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); openAddModal(); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Connect Database
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <div key={app.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group relative">
            
            {/* Dropdown Menu */}
            <div className="absolute top-4 right-4">
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === app.id ? null : app.id); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              
              {activeMenuId === app.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-10 overflow-hidden animate-fade-in">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditModal(app); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" /> Edit Configuration
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteApp(app.id); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Disconnect
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <Database className="h-6 w-6 text-indigo-600" />
                </div>
                <div className={`mr-8 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  app.status === 'connected' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {app.status === 'connected' ? 'Connected' : 'Error'}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{app.name}</h3>
              <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{app.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 font-mono overflow-hidden">
                  <Server className="h-3 w-3 mr-2 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{app.connectionString}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" /> Type: {app.dbType.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Last sync: {app.lastSync}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">{app.userCount} Users Monitored</span>
              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">Live</span>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">{isEditing ? 'Edit Connection' : 'New Database Connection'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Application Name</label>
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. My SaaS App"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Database Type</label>
                  <select
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="mongodb">MongoDB</option>
                  </select>
                </div>

                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
                  <input
                    type="text"
                    value={dbPort}
                    onChange={(e) => setDbPort(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="5432"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Host / Endpoint</label>
                  <input
                    type="text"
                    required
                    value={dbHost}
                    onChange={(e) => setDbHost(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                    placeholder="db.production.internal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={dbUser}
                    onChange={(e) => setDbUser(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="admin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                    placeholder="What does this app do?"
                  />
                </div>
              </div>

              {/* Connection Test Area */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                   <span className="text-sm text-slate-600 font-medium">Connectivity</span>
                   <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="text-xs bg-white border border-slate-300 px-3 py-1 rounded hover:bg-slate-50 transition-colors"
                   >
                     {isTesting ? 'Pinging...' : 'Test Connection'}
                   </button>
                </div>
                {isTesting && (
                  <div className="mt-2 text-xs text-indigo-600 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Attempting handshake with {dbHost || 'host'}...
                  </div>
                )}
                {!isTesting && testStatus === 'success' && (
                   <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-medium animate-fade-in">
                    <CheckCircle2 className="h-3 w-3" /> Connection Successful (Latency: 45ms)
                  </div>
                )}
                {!isTesting && testStatus === 'failed' && (
                   <div className="mt-2 text-xs text-red-600 flex items-center gap-1 font-medium animate-fade-in">
                    <AlertTriangle className="h-3 w-3" /> Connection Refused: Check firewall rules.
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTesting}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm disabled:opacity-70"
                >
                  {isEditing ? 'Save Configuration' : 'Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;