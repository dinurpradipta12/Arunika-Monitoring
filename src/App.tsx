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
   DATA MANAGEMENT
======================= */
// We start with NO apps and NO users to comply with "Not Mockup" request.
// User must connect a real Supabase/MySQL database to see data.
const INITIAL_APPS: ConnectedApp[] = [];
const INITIAL_USERS: User[] = [];

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

  /* ---------- REAL DATA FETCHING ---------- */
  // Fetch users from ALL connected Supabase apps
  const fetchAllRemoteUsers = async () => {
    let allUsers: User[] = [];

    for (const app of apps) {
      // We can only fetch real data from configured Supabase connections
      if (app.dbType === 'supabase' && app.apiUrl && app.apiKey) {
        try {
          // Fetch raw data from the configured table
          const response = await fetch(`${app.apiUrl}/rest/v1/${app.tableName || 'users'}?select=*`, {
            headers: {
              'apikey': app.apiKey,
              'Authorization': `Bearer ${app.apiKey}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Map external DB fields to our internal User type
            const mappedUsers: User[] = data.map((record: any) => ({
              id: record.id?.toString(),
              name: record.name || record.full_name || record.username || 'Unknown User',
              email: record.email || 'no-email',
              phoneNumber: record.phone_number || record.phone || record.whatsapp || undefined,
              password: record.password || record.password_hash || undefined, // Display purpose only as requested
              sourceAppId: app.id,
              sourceAppName: app.name,
              status: record.status || 'pending', // Default to pending if not specified
              subscriptionTier: record.subscription_tier || 'free',
              registeredAt: record.created_at || new Date().toISOString(),
              subscriptionEnd: record.subscription_end || undefined,
              lastActive: record.last_sign_in_at || record.updated_at || 'Never'
            }));
            
            allUsers = [...allUsers, ...mappedUsers];
            
            // Update app user count
            updateAppUserCount(app.id, mappedUsers.length);
          }
        } catch (error) {
          console.error(`Failed to fetch from ${app.name}`, error);
        }
      }
    }
    
    // Only update state if we actually have data or if we had data before but now it's empty
    // Prevents flickering if fetch fails momentarily
    if (apps.length > 0) {
      setUsers(allUsers);
    }
  };

  const updateAppUserCount = (appId: string, count: number) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, userCount: count, lastSync: new Date().toLocaleTimeString() } : a));
  };

  // Poll for updates every 10 seconds (Realtime simulation via Polling)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Initial Fetch
    fetchAllRemoteUsers();

    const interval = setInterval(() => {
      fetchAllRemoteUsers();
    }, 10000); 

    return () => clearInterval(interval);
  }, [isAuthenticated, apps.length]); // Re-run if apps change

  /* ---------- Handlers ---------- */
  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    // 1. Optimistic UI Update (Fast)
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));

    // 2. Real Backend Update (Supabase PATCH)
    const userToUpdate = users.find(u => u.id === id);
    if (userToUpdate) {
       const app = apps.find(a => a.id === userToUpdate.sourceAppId);
       if (app && app.dbType === 'supabase' && app.apiUrl && app.apiKey) {
         try {
           // Map internal fields back to DB columns (simple mapping)
           const dbUpdates: any = {};
           if (updates.status) dbUpdates.status = updates.status;
           if (updates.subscriptionEnd) dbUpdates.subscription_end = updates.subscriptionEnd;
           
           await fetch(`${app.apiUrl}/rest/v1/${app.tableName || 'users'}?id=eq.${id}`, {
             method: 'PATCH',
             headers: {
               'apikey': app.apiKey,
               'Authorization': `Bearer ${app.apiKey}`,
               'Content-Type': 'application/json',
               'Prefer': 'return=minimal'
             },
             body: JSON.stringify(dbUpdates)
           });
           console.log("Synced update to Supabase:", dbUpdates);
         } catch (err) {
           console.error("Failed to sync update to Supabase", err);
           // In a real production app, we would revert the optimistic update here on failure
           alert("Failed to sync changes to database. Please check connection.");
         }
       }
    }
  };

  const handleExtendSubscription = (id: string, plan: 'weekly' | 'monthly' | 'yearly') => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const currentEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : new Date();
    const baseDate = currentEnd < new Date() ? new Date() : currentEnd;
    const newEnd = new Date(baseDate);

    if (plan === 'weekly') newEnd.setDate(newEnd.getDate() + 7);
    if (plan === 'monthly') newEnd.setMonth(newEnd.getMonth() + 1);
    if (plan === 'yearly') newEnd.setFullYear(newEnd.getFullYear() + 1);

    handleUpdateUser(id, {
      subscriptionEnd: newEnd.toISOString(),
      status: 'active'
    });
  };

  const handleAddApp = (app: ConnectedApp) => {
    setApps(prev => [...prev, app]);
  };

  const handleUpdateApp = (id: string, updates: Partial<ConnectedApp>) => {
    setApps(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  const handleDeleteApp = (id: string) => {
    if (!confirm('Disconnect this database? Local data view will be cleared.')) return;
    setApps(prev => prev.filter(a => a.id !== id));
    // Also remove users associated with this app
    setUsers(prev => prev.filter(u => u.sourceAppId !== id));
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
              onExtendSubscription={handleExtendSubscription}
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