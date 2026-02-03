import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Boxes, Settings, LogOut, Command, Menu, X } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProjectManager from './components/ProjectManager';
import UserManager from './components/UserManager';
import { User, ConnectedApp, ViewState } from './types';

// Initial Mock Data with Database Context
const INITIAL_APPS: ConnectedApp[] = [
  {
    id: 'app-1',
    name: 'SocialFlow App',
    dbType: 'postgres',
    connectionString: 'postgres://admin:***@sf-prod.db:5432/users',
    status: 'connected',
    lastSync: '2 mins ago',
    userCount: 12,
    description: 'Main social media automation platform database.'
  },
  {
    id: 'app-2',
    name: 'SnailAnalytics V2',
    dbType: 'mongodb',
    connectionString: 'mongodb+srv://read_only:***@cluster0.sa.net/analytics',
    status: 'connected',
    lastSync: '1 hour ago',
    userCount: 45,
    description: 'Tracking and telemetry data store.'
  }
];

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', sourceAppId: 'app-1', sourceAppName: 'SocialFlow App', status: 'active', subscriptionTier: 'pro', registeredAt: '2023-10-01', lastActive: '2023-10-25' },
  { id: 'u2', name: 'Bob Smith', email: 'bob@example.com', sourceAppId: 'app-1', sourceAppName: 'SocialFlow App', status: 'pending', subscriptionTier: 'free', registeredAt: '2023-10-26', lastActive: '2023-10-26' },
  { id: 'u3', name: 'Charlie Davis', email: 'charlie@tech.co', sourceAppId: 'app-2', sourceAppName: 'SnailAnalytics V2', status: 'active', subscriptionTier: 'enterprise', registeredAt: '2023-09-15', lastActive: '2023-10-24' },
  { id: 'u4', name: 'Diana Prince', email: 'diana@corp.net', sourceAppId: 'app-1', sourceAppName: 'SocialFlow App', status: 'pending', subscriptionTier: 'pro', registeredAt: '2023-10-27', lastActive: '2023-10-27' },
  { id: 'u5', name: 'Ethan Hunt', email: 'ethan@imf.org', sourceAppId: 'app-2', sourceAppName: 'SnailAnalytics V2', status: 'active', subscriptionTier: 'pro', registeredAt: '2023-10-05', lastActive: '2023-10-22' },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [apps, setApps] = useState<ConnectedApp[]>(INITIAL_APPS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mobile check
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const handleAddApp = (newApp: ConnectedApp) => {
    setApps(prev => [...prev, newApp]);
  };

  const handleUpdateApp = (appId: string, updates: Partial<ConnectedApp>) => {
    setApps(prev => prev.map(app => app.id === appId ? { ...app, ...updates } : app));
  };

  const handleDeleteApp = (appId: string) => {
    if (window.confirm('Are you sure you want to disconnect this database? This will stop user monitoring.')) {
      setApps(prev => prev.filter(app => app.id !== appId));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-500 hover:bg-white hover:text-indigo-600'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'
        } bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300 absolute md:relative z-20 h-full`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 text-white">
            <Command className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">DevHub</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Database Monitor</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monitoring</p>
          </div>
          <NavItem view="dashboard" icon={LayoutDashboard} label="Overview" />
          <NavItem view="users" icon={Users} label="User Approvals" />
          
          <div className="px-4 pb-2 pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Configuration</p>
          </div>
          <NavItem view="apps" icon={Boxes} label="Database Connections" />
          <NavItem view="settings" icon={Settings} label="System Settings" />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-800">Admin SC</span>
              <span className="text-xs text-slate-500">Database Admin</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
               <img src="https://picsum.photos/200" alt="Admin" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <Dashboard users={users} apps={apps} onNavigate={setCurrentView} />
            )}
            {currentView === 'apps' && (
              <ProjectManager 
                apps={apps} 
                onAddApp={handleAddApp} 
                onUpdateApp={handleUpdateApp}
                onDeleteApp={handleDeleteApp}
              />
            )}
            {currentView === 'users' && (
              <UserManager users={users} apps={apps} onUpdateUser={handleUpdateUser} />
            )}
            {currentView === 'settings' && (
              <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                <Settings className="h-16 w-16 mb-4 opacity-20" />
                <p>Global system settings configuration would go here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;