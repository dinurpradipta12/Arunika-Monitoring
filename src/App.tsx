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
  const fetchAllRemoteUsers = async () => {
    let allUsers: User[] = [];

    for (const app of apps) {
      if (app.dbType === 'supabase' && app.apiUrl && app.apiKey) {
        try {
          // Fetch from the configured table (Defaulting to 'registrations' based on user need)
          // We order by created_at desc to get newest first
          const tableName = app.tableName || 'registrations';
          const response = await fetch(`${app.apiUrl}/rest/v1/${tableName}?select=*&order=created_at.desc`, {
            headers: {
              'apikey': app.apiKey,
              'Authorization': `Bearer ${app.apiKey}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            // MAP SQL COLUMNS TO FRONTEND TYPES
            // SQL: id, name, email, password, whatsapp, reason, status, created_at
            const mappedUsers: User[] = data.map((record: any) => {
              // Normalize Status: Database 'approved'/'active' -> Frontend 'active'
              const rawStatus = (record.status || 'pending').toLowerCase();
              let feStatus: 'active' | 'pending' | 'suspended' = 'pending';
              
              if (rawStatus === 'approved' || rawStatus === 'active') feStatus = 'active';
              else if (rawStatus === 'rejected' || rawStatus === 'suspended') feStatus = 'suspended';

              return {
                id: record.id?.toString(),
                name: record.name || record.full_name || 'Unknown User',
                email: record.email || 'no-email',
                phoneNumber: record.whatsapp, // Specific to your SQL
                password: record.password,    // Specific to your SQL
                sourceAppId: app.id,
                sourceAppName: app.name,
                status: feStatus,
                subscriptionTier: 'free', // Default, unless updated later
                registeredAt: record.created_at || new Date().toISOString(),
                subscriptionEnd: record.subscription_expiry, // Might be null for pending
                lastActive: record.last_updated || record.created_at || 'Never',
                reason: record.reason // Specific to your SQL
              };
            });
            
            allUsers = [...allUsers, ...mappedUsers];
            updateAppUserCount(app.id, mappedUsers.length);
          }
        } catch (error) {
          console.error(`Failed to fetch from ${app.name}`, error);
        }
      }
    }
    
    // Update state to reflect database reality
    if (apps.length > 0) {
      setUsers(allUsers);
    }
  };

  const updateAppUserCount = (appId: string, count: number) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, userCount: count, lastSync: new Date().toLocaleTimeString() } : a));
  };

  // Poll for updates (Simulation of Realtime)
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAllRemoteUsers();
    const interval = setInterval(fetchAllRemoteUsers, 5000); // 5s polling for faster feedback
    return () => clearInterval(interval);
  }, [isAuthenticated, apps.length]);

  /* ---------- LOGIC UPDATE USER (DUAL TABLE) ---------- */
  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    // 1. Optimistic UI Update
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));

    // 2. Real Backend Update
    const userToUpdate = users.find(u => u.id === id);
    if (!userToUpdate) return;

    const app = apps.find(a => a.id === userToUpdate.sourceAppId);
    if (app && app.dbType === 'supabase' && app.apiUrl && app.apiKey) {
       try {
         const tableName = app.tableName || 'registrations';

         // === SCENARIO 1: APPROVING A USER ===
         if (updates.status === 'active') {
           
           // A. Update 'registrations' table status to 'approved'
           await fetch(`${app.apiUrl}/rest/v1/${tableName}?id=eq.${id}`, {
             method: 'PATCH',
             headers: {
               'apikey': app.apiKey,
               'Authorization': `Bearer ${app.apiKey}`,
               'Content-Type': 'application/json',
               'Prefer': 'return=minimal'
             },
             body: JSON.stringify({ status: 'approved' }) // Match SQL 'approved' enum/varchar
           });

           // B. Insert into 'users' table (Active Users Table)
           // We create a new entry in the 'users' table as per your SQL schema
           const subscriptionExpiry = updates.subscriptionEnd || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();
           
           const newUserPayload = {
             user_id: `USR-${id}-${Date.now()}`, // Generate a unique string ID
             full_name: userToUpdate.name,
             email: userToUpdate.email,
             role: 'viewer',
             whatsapp: userToUpdate.phoneNumber,
             status: 'active',
             subscription_expiry: subscriptionExpiry,
             performance_score: 0
           };

           await fetch(`${app.apiUrl}/rest/v1/users`, {
             method: 'POST',
             headers: {
               'apikey': app.apiKey,
               'Authorization': `Bearer ${app.apiKey}`,
               'Content-Type': 'application/json',
               'Prefer': 'return=minimal'
             },
             body: JSON.stringify(newUserPayload)
           });

           console.log("User approved: Updated registration and created active user record.");
         } 
         // === SCENARIO 2: REJECTING/SUSPENDING ===
         else if (updates.status === 'suspended') {
           await fetch(`${app.apiUrl}/rest/v1/${tableName}?id=eq.${id}`, {
             method: 'PATCH',
             headers: {
               'apikey': app.apiKey,
               'Authorization': `Bearer ${app.apiKey}`,
               'Content-Type': 'application/json',
               'Prefer': 'return=minimal'
             },
             body: JSON.stringify({ status: 'rejected' })
           });
         }
         // === SCENARIO 3: UPDATING SUBSCRIPTION ONLY ===
         else if (updates.subscriptionEnd) {
           // We might need to update the 'users' table specifically for sub updates
           // Assumption: We look up by email since IDs might differ between tables
           await fetch(`${app.apiUrl}/rest/v1/users?email=eq.${userToUpdate.email}`, {
             method: 'PATCH',
             headers: {
               'apikey': app.apiKey,
               'Authorization': `Bearer ${app.apiKey}`,
               'Content-Type': 'application/json'
             },
             body: JSON.stringify({ subscription_expiry: updates.subscriptionEnd })
           });
         }

         // Trigger refresh to sync state
         setTimeout(fetchAllRemoteUsers, 500);

       } catch (err) {
         console.error("Database sync failed", err);
         alert("Failed to sync with database. Check console for details.");
       }
    }
  };

  const handleExtendSubscription = (id: string, plan: 'weekly' | 'monthly' | 'yearly') => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    // Logic to calculate new date
    const currentEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : new Date();
    // If expired, start from today
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
    setUsers(prev => prev.filter(u => u.sourceAppId !== id));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: React.ElementType; label: string; }) => (
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
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