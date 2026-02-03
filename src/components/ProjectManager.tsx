import React, { useState } from 'react';
import { Plus, Database, Server, MoreHorizontal, RefreshCw, Trash2, Edit2, CheckCircle2, AlertTriangle, Loader2, Globe, Shield } from 'lucide-react';
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
  
  // General Info
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [dbType, setDbType] = useState<'postgres' | 'mysql' | 'mongodb' | 'supabase'>('postgres'); // Default to Postgres per screenshot

  // Connection Details (Matching Screenshot)
  const [dbHost, setDbHost] = useState(''); // db.ref.supabase.co
  const [dbPort, setDbPort] = useState('5432');
  const [dbName, setDbName] = useState('postgres');
  const [dbUser, setDbUser] = useState('postgres');
  const [dbPass, setDbPass] = useState('');
  
  // Critical for Web Access
  const [apiKey, setApiKey] = useState('');
  const [tableName, setTableName] = useState('registrations'); // Default table
  
  // Connection Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'none' | 'success' | 'failed'>('none');
  const [testMessage, setTestMessage] = useState('');

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setAppName('');
    setDbType('postgres');
    setDescription('');
    
    setDbHost('');
    setDbPort('5432');
    setDbName('postgres');
    setDbUser('postgres');
    setDbPass('');
    setApiKey('');
    setTableName('registrations');

    setTestStatus('none');
    setTestMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (app: ConnectedApp) => {
    setIsEditing(true);
    setEditId(app.id);
    setAppName(app.name);
    setDbType(app.dbType);
    setDescription(app.description);

    setDbHost(app.dbHost || '');
    setDbPort(app.dbPort || '5432');
    setDbName(app.dbName || 'postgres');
    setDbUser(app.dbUser || 'postgres');
    setDbPass(app.dbPass || '');
    setApiKey(app.apiKey || '');
    setTableName(app.tableName || 'registrations');

    setTestStatus('none');
    setTestMessage('');
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  // Helper to get Project ID from Host
  const getProjectId = (host: string) => {
    // Expected format: db.abcdefghijkl.supabase.co
    const parts = host.split('.');
    if (parts.length >= 2 && parts[0] === 'db') {
      return parts[1];
    }
    return null;
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus('none');
    setTestMessage('');

    // Logic: Web Apps CANNOT use TCP (Host/Port/Pass). We must use HTTP (Url/Key).
    // We construct the URL from the Host.
    const projectId = getProjectId(dbHost);

    if (!projectId) {
      setTestStatus('failed');
      setTestMessage('Invalid Host format. Expected: db.[project-ref].supabase.co');
      setIsTesting(false);
      return;
    }

    if (!apiKey) {
      setTestStatus('failed');
      setTestMessage('API Key is required for Web Connection.');
      setIsTesting(false);
      return;
    }

    try {
      const derivedUrl = `https://${projectId}.supabase.co`;
      
      // Try to fetch 1 record from the specified table
      const response = await fetch(`${derivedUrl}/rest/v1/${tableName}?select=count&limit=1`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('Connection Successful!');
      } else if (response.status === 404) {
        setTestStatus('failed');
        setTestMessage(`Table '${tableName}' not found.`);
      } else if (response.status === 401) {
        setTestStatus('failed');
        setTestMessage('Unauthorized. Check API Key.');
      } else {
        setTestStatus('failed');
        setTestMessage(`Error: ${response.statusText}`);
      }
    } catch (err) {
      setTestStatus('failed');
      setTestMessage('Network Error. Check Host URL.');
    }
    setIsTesting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mockConnString = `${dbType}://${dbUser}:***@${dbHost}:${dbPort}/${dbName}`;

    const appData: Partial<ConnectedApp> = {
        name: appName,
        dbType: 'supabase', // Force internal type to Supabase for logic handling
        connectionString: mockConnString,
        description,
        status: testStatus === 'success' ? 'connected' : 'error',
        lastSync: 'Just now',
        
        // Save the fields
        dbHost,
        dbPort,
        dbUser,
        dbPass,
        dbName,
        apiKey,
        tableName
    };

    if (isEditing && editId) {
      onUpdateApp(editId, appData);
    } else {
      const newApp: ConnectedApp = {
        id: `app-${Date.now()}`,
        userCount: 0,
        ...appData as any
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
          <p className="text-slate-500 mt-1">Configure connections to external Supabase / PostgreSQL instances.</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); openAddModal(); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Connect Database
        </button>
      </div>

      {apps.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <Database className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-600">No Databases Connected</h3>
          <p className="text-slate-400 max-w-md mx-auto mt-2">Add your Supabase connection details to start managing users.</p>
          <button
             onClick={(e) => { e.stopPropagation(); openAddModal(); }}
             className="mt-6 text-indigo-600 font-medium hover:underline"
          >
            Create first connection
          </button>
        </div>
      )}

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
                  <Globe className="h-6 w-6 text-indigo-600" />
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
                  <span className="truncate">{app.dbHost}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" /> Table: {app.tableName}
                  </span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Sync: {app.lastSync}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">{app.userCount} Users Found</span>
              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">Live Data</span>
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
                
                {/* Database Type */}
                <div className="col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Database Type</label>
                   <select 
                     value={dbType}
                     onChange={(e) => setDbType(e.target.value as any)}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                   >
                     <option value="postgres">PostgreSQL</option>
                     <option value="mysql">MySQL</option>
                   </select>
                </div>

                {/* Host / Port */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Host</label>
                  <input
                    type="text"
                    required
                    value={dbHost}
                    onChange={(e) => setDbHost(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                    placeholder="db.ref.supabase.co"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Copy "Host" from your Supabase Database Settings.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
                  <input
                    type="text"
                    value={dbPort}
                    onChange={(e) => setDbPort(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    placeholder="5432"
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Database</label>
                  <input
                    type="text"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="postgres"
                  />
                </div>

                {/* User / Pass */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">User</label>
                  <input
                    type="text"
                    value={dbUser}
                    onChange={(e) => setDbUser(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="postgres"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={dbPass}
                    onChange={(e) => setDbPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                
                {/* IMPORTANT: API Key Field */}
                <div className="col-span-2 bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                   <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-amber-700" />
                      <label className="block text-sm font-bold text-amber-900">Supabase API Key (Required)</label>
                   </div>
                   <input
                    type="password"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-mono text-xs bg-white"
                    placeholder="anon public key (starts with eyJ...)"
                  />
                   <p className="text-[10px] text-amber-700 mt-2 leading-tight">
                     <strong>Why is this needed?</strong> Web browsers cannot connect directly to Port 5432 (TCP). This app uses the Host above to find your project, but requires the API Key to authenticate safely over HTTP.
                   </p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Table (Registration)</label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="registrations"
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
                     {isTesting ? 'Verifying...' : 'Test Connection'}
                   </button>
                </div>
                
                {testStatus === 'success' && (
                   <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-medium animate-fade-in">
                    <CheckCircle2 className="h-3 w-3" /> {testMessage}
                  </div>
                )}
                {testStatus === 'failed' && (
                   <div className="mt-2 text-xs text-red-600 flex items-center gap-1 font-medium animate-fade-in">
                    <AlertTriangle className="h-3 w-3" /> {testMessage}
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