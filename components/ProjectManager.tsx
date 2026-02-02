import React, { useState } from 'react';
import { Plus, Database, Server, MoreHorizontal, Code, Copy, Terminal, ExternalLink, X } from 'lucide-react';
import { ConnectedApp } from '../types';

interface ProjectManagerProps {
  apps: ConnectedApp[];
  onAddApp: (app: ConnectedApp) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ apps, onAddApp }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState<ConnectedApp | null>(null);
  
  // Form State
  const [newAppName, setNewAppName] = useState('');
  const [newDbId, setNewDbId] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
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
    setIsModalOpen(false);
    setViewingApp(newApp); // Immediately show integration guide
    
    // Reset form
    setNewAppName('');
    setNewDbId('');
    setNewDesc('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you'd show a toast here
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Connected Projects</h1>
          <p className="text-slate-500 mt-1">Manage external tool connections and retrieve API keys.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Connect Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <div key={app.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <Server className="h-6 w-6 text-indigo-600" />
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
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
                onClick={() => setViewingApp(app)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
              >
                <Code className="h-4 w-4" /> Integration
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Connect New Project</h2>
            <form onSubmit={handleAdd} className="space-y-4">
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
                <p className="text-xs text-slate-500 mt-1">Found in your app's environment configuration.</p>
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
                  Generate Keys
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Integration Guide Modal */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-indigo-600" />
                  Integration Guide
                </h2>
                <p className="text-sm text-slate-500">How to connect <span className="font-semibold text-slate-700">{viewingApp.name}</span></p>
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
                <label className="text-sm font-semibold text-slate-900 uppercase tracking-wide">1. Your API Credentials</label>
                <div className="bg-slate-900 rounded-lg p-4 relative group">
                  <div className="text-xs text-slate-400 mb-1">SNAILLABS_API_KEY</div>
                  <code className="text-green-400 font-mono text-sm break-all">{viewingApp.apiKey}</code>
                  <button 
                    onClick={() => copyToClipboard(viewingApp.apiKey)}
                    className="absolute right-3 top-3 p-2 text-slate-400 hover:text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy Key"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 relative group">
                  <div className="text-xs text-slate-400 mb-1">LINKED_DATABASE_ID</div>
                  <code className="text-blue-400 font-mono text-sm break-all">{viewingApp.databaseId}</code>
                  <button 
                    onClick={() => copyToClipboard(viewingApp.databaseId)}
                    className="absolute right-3 top-3 p-2 text-slate-400 hover:text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy ID"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Javascript Snippet */}
              <div className="space-y-3">
                 <label className="text-sm font-semibold text-slate-900 uppercase tracking-wide">2. Installation (React/Next.js)</label>
                 <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">Install the SnailLabs SDK in your application:</p>
                    <div className="bg-slate-900 text-slate-300 p-3 rounded-md font-mono text-sm mb-4">
                      npm install @snaillabs/tracker-sdk
                    </div>
                    <p className="text-sm text-slate-600 mb-2">Initialize in your root component:</p>
                    <div className="bg-slate-900 text-slate-300 p-3 rounded-md font-mono text-xs overflow-x-auto">
                      <pre>{`import { SnailTracker } from '@snaillabs/tracker-sdk';

// Initialize with your credentials
SnailTracker.init({
  apiKey: '${viewingApp.apiKey}',
  databaseId: '${viewingApp.databaseId}',
  environment: 'production'
});`}</pre>
                    </div>
                 </div>
              </div>

               {/* HTML Snippet */}
               <div className="space-y-3">
                 <label className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Alternative: HTML Script Tag</label>
                 <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">Add this to the <code className="text-red-500 text-xs bg-red-50 p-0.5 rounded">&lt;head&gt;</code> of your website:</p>
                    <div className="bg-slate-900 text-slate-300 p-3 rounded-md font-mono text-xs overflow-x-auto relative group">
                      <pre>{`<script 
  src="https://cdn.snaillabs.dom/tracker.js" 
  data-api-key="${viewingApp.apiKey}"
  data-db-id="${viewingApp.databaseId}"
  async
></script>`}</pre>
                      <button 
                        onClick={() => copyToClipboard(`<script src="https://cdn.snaillabs.dom/tracker.js" data-api-key="${viewingApp.apiKey}" data-db-id="${viewingApp.databaseId}" async></script>`)}
                        className="absolute right-3 top-3 p-2 text-slate-400 hover:text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setViewingApp(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
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