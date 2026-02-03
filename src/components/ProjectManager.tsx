import React, { useState } from 'react';
import { Plus, Database, Server, MoreHorizontal, Code, Copy, Terminal, ExternalLink, X, Settings, Trash2, Edit2, Network } from 'lucide-react';
import { ConnectedApp } from '../types';

interface ProjectManagerProps {
  apps: ConnectedApp[];
  onAddApp: (app: ConnectedApp) => void;
  onUpdateApp: (id: string, updates: Partial<ConnectedApp>) => void;
  onDeleteApp: (id: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ apps, onAddApp, onUpdateApp, onDeleteApp }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState<ConnectedApp | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newAppName, setNewAppName] = useState('');
  const [newDbId, setNewDbId] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setNewAppName('');
    setNewDbId('');
    setNewDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (app: ConnectedApp) => {
    setIsEditing(true);
    setEditId(app.id);
    setNewAppName(app.name);
    setNewDbId(app.databaseId);
    setNewDesc(app.description);
    setIsModalOpen(true);
    setActiveMenuId(null); // Close menu
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && editId) {
      // Update existing
      onUpdateApp(editId, {
        name: newAppName,
        databaseId: newDbId,
        description: newDesc
      });
    } else {
      // Add new
      const newApp: ConnectedApp = {
        id: `app-${Date.now()}`,
        name: newAppName,
        databaseId: newDbId,
        description: newDesc,
        status: 'connected', // Simulating instant connection
        apiKey: `sk_live_${Math.random().toString(36).substring(7)}_${Date.now().toString(36)}`,
        userCount: 0
      };
      onAddApp(newApp);
      setViewingApp(newApp); // Show integration guide for new apps
    }
    
    setIsModalOpen(false);
    // Reset form
    setNewAppName('');
    setNewDbId('');
    setNewDesc('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10" onClick={() => setActiveMenuId(null)}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Connected Projects</h1>
          <p className="text-slate-500 mt-1">Manage external tool connections and retrieve API keys.</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); openAddModal(); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Connect Project
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
                    <Edit2 className="h-4 w-4" /> Edit Details
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); alert('Settings module coming soon.'); setActiveMenuId(null); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" /> App Settings
                  </button>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteApp(app.id); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Disconnect
                  </button>
                </div>
              )}
            </div>

            <div onClick={() => setViewingApp(app)} className="cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <Server className="h-6 w-6 text-indigo-600" />
                </div>
                <div className={`mr-8 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  app.status === 'connected' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {app.status === 'connected' ? 'Online' : 'Error'}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{app.name}</h3>
              <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{app.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                  <Database className="h-3 w-3 mr-2 text-slate-400" />
                  <span className="truncate flex-1">{app.databaseId}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">{app.userCount} Active Users</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setViewingApp(app); }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
              >
                <Code className="h-4 w-4" /> Integration
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">{isEditing ? 'Edit Project' : 'Connect New Project'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. SocialFlow V2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Database ID / Connection String</label>
                <input
                  type="text"
                  required
                  value={newDbId}
                  onChange={(e) => setNewDbId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                  placeholder="db_prod_xyz_123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                  placeholder="Brief description of the tool..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm"
                >
                  {isEditing ? 'Save Changes' : 'Generate Keys'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Integration Guide Modal */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setViewingApp(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-0 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-indigo-600" />
                  Integration Guide
                </h2>
                <p className="text-sm text-slate-500">Connecting <span className="font-semibold text-slate-700">{viewingApp.name}</span></p>
              </div>
              <button 
                onClick={() => setViewingApp(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              {/* API Key Section */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="bg-slate-200 text-slate-600 h-5 w-5 rounded flex items-center justify-center text-xs">1</span>
                  Credentials
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-lg p-4 relative group">
                    <div className="text-xs text-slate-400 mb-1">API_KEY</div>
                    <code className="text-green-400 font-mono text-sm break-all">{viewingApp.apiKey}</code>
                    <button onClick={() => copyToClipboard(viewingApp.apiKey)} className="absolute right-3 top-3 text-slate-400 hover:text-white"><Copy className="h-4 w-4" /></button>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 relative group">
                    <div className="text-xs text-slate-400 mb-1">DATABASE_ID</div>
                    <code className="text-blue-400 font-mono text-sm break-all">{viewingApp.databaseId}</code>
                    <button onClick={() => copyToClipboard(viewingApp.databaseId)} className="absolute right-3 top-3 text-slate-400 hover:text-white"><Copy className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>

               {/* Data Ingestion / Scraping Section */}
               <div className="space-y-3">
                 <label className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                   <span className="bg-slate-200 text-slate-600 h-5 w-5 rounded flex items-center justify-center text-xs">2</span>
                   Pushing Data (Webhooks)
                 </label>
                 <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-3">
                      To "scrape" or sync user data from your external application into SnailLabs, send a POST request whenever a user event occurs (signup, subscription change, etc).
                    </p>
                    <div className="bg-slate-900 text-slate-300 p-4 rounded-md font-mono text-xs overflow-x-auto">
                      <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
                        <span className="text-indigo-400 font-bold">Node.js / Fetch Example</span>
                      </div>
                      <pre>{`// Example: Sending data when a user registers in your app
const syncUserToHub = async (userData) => {
  const response = await fetch('https://api.snaillabs.dom/v1/ingest/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${viewingApp.apiKey}',
      'X-Database-ID': '${viewingApp.databaseId}'
    },
    body: JSON.stringify({
      email: userData.email,
      name: userData.fullName,
      status: 'active',
      plan: 'pro_tier',
      timestamp: new Date().toISOString()
    })
  });
  
  const result = await response.json();
  console.log('Synced to SnailLabs:', result);
};`}</pre>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <Network className="h-3 w-3" />
                      Data will appear in the "User Management" tab within 5 seconds of the request.
                    </p>
                 </div>
              </div>

              {/* Javascript SDK Section */}
              <div className="space-y-3">
                 <label className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                   <span className="bg-slate-200 text-slate-600 h-5 w-5 rounded flex items-center justify-center text-xs">3</span>
                   Client-Side SDK
                 </label>
                 <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">For frontend analytics, initialize the tracker in your root component:</p>
                    <div className="bg-slate-900 text-slate-300 p-3 rounded-md font-mono text-xs overflow-x-auto">
                      <pre>{`import { SnailTracker } from '@snaillabs/tracker-sdk';

SnailTracker.init({
  apiKey: '${viewingApp.apiKey}',
  databaseId: '${viewingApp.databaseId}'
});`}</pre>
                    </div>
                 </div>
              </div>

            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setViewingApp(null)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;