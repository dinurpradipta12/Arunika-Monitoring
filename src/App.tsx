import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Boxes,
  Settings,
  LogOut,
  Command,
  Menu,
  X
} from 'lucide-react';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProjectManager from './components/ProjectManager';
import UserManager from './components/UserManager';

import { User, ConnectedApp, ViewState } from './types';

/* =======================
   MOCK DATA (SAFE)
======================= */
const INITIAL_APPS: ConnectedApp[] = [
  {
    id: 'app-1',
    name: 'SocialFlow App',
    dbType: 'postgres',
    connectionString: 'postgres://admin:***@sf-prod.db:5432/users',
    status: 'connected',
    lastSync: '2 mins ago',
    userCount: 12,
    description: 'Main social media automation platform database.',
  },
  {
    id: 'app-2',
    name: 'SnailAnalytics V2',
    dbType: 'mongodb',
    connectionString: 'mongodb+srv://read_only:***@cluster0.sa.net/analytics',
    status: 'connected',
    lastSync: '1 hour ago',
    userCount: 45,
    description: 'Tracking and telemetry data store.',
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    sourceAppId: 'app-1',
    sourceAppName: 'SocialFlow App',
    status: 'active',
    subscriptionTier: 'pro',
    registeredAt: '2023-10-01',
    lastActive: '2023-10-25',
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    sourceAppId: 'app-1',
    sourceAppName: 'SocialFlow App',
    status: 'pending',
    subscriptionTier: 'free',
    registeredAt: '2023-10-26',
    lastActive: '2023-10-26',
  },
];

/* =======================
   APP
======================= */
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [apps, setApps] = useState<ConnectedApp[]>(INITIAL_APPS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /* ---------- Responsive ---------- */
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ---------- Handlers ---------- */
  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
  };

  const handleAddApp = (app: ConnectedApp) => {
    setApps(prev => [...prev, app]);
  };

  const handleUpdateApp = (id: string, updates: Partial<ConnectedApp>) => {
    setApps(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  const handleDeleteApp = (id: string) => {
    if (!confirm('Disconnect this database?')) return;
    setApps(prev => prev.filter(a => a.id !== id));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  /* ---------- LOGIN GUARD ---------- */
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  /* ---------- NAV ITEM ---------- */
  const NavItem = ({
    view,
    icon: Icon,
    label,
  }: {
    view: ViewState;
    icon: React.ElementType;
    label: string;
  }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        currentView === view
          ? 'bg-indigo-600 text-white'
          : 'text-slate-500 hover:bg-white hover:text-indigo-600'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  /* ---------- RENDER ---------- */
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
        } bg-slate-50 border-r transition-all duration-300 absolute md:relative z-20`}
      >
        <div className="p-6 border-b flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Command />
          </div>
          <div>
            <h1 className="font-bold">DevHub</h1>
            <p className="text-xs text-slate-500">Database Monitor</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Overview" />
          <NavItem view="users" icon={Users} label="User Approvals" />
          <NavItem view="apps" icon={Boxes} label="Database Connections" />
          <NavItem view="settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-6">
          <button
            className="md:hidden"
            onClick={() => setIsSidebarOpen(v => !v)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </header>

        <div className="flex-1 p-6 overflow-auto">
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
            <UserManager
              users={users}
              apps={apps}
              onUpdateUser={handleUpdateUser}
            />
          )}

          {currentView === 'settings' && (
            <div className="text-center text-slate-400 mt-20">
              <Settings className="mx-auto mb-4 h-12 w-12" />
              <p>Settings page coming soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;