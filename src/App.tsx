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

// Storage Key
const STORAGE_KEY = 'sl_devhub_connected_apps';
const INITIAL_USERS: User[] = [];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // Initialize apps from localStorage if available
  const [apps, setApps] = useState<ConnectedApp[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load saved connections", e);
      return [];
    }
  });

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Persist apps to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ---------- HELPER: Extract URL from Host ---------- */
  const getApiUrlFromHost = (host?: string) => {
    if (!host) return null;
    const parts = host.split('.');
    if (parts.length >= 2 && parts[0] === 'db') {
      // db.ref.supabase.co -> https://ref.supabase.co
      return `https://${parts[1]}.supabase.co`;
    }
    return null;
  };

  /* ---------- REAL DATA FETCHING (DUAL TABLE) ---------- */
  const fetchAllRemoteUsers = async () => {
    let allUsers: User[] = [];

    for (const app of apps) {
      const apiUrl = getApiUrlFromHost(app.dbHost);
      
      // We need API Key and URL to proceed
      if (apiUrl && app.apiKey) {
        const headers = {
          'apikey': app.apiKey,
          'Authorization': `Bearer ${app.apiKey}`
        };

        const registrationTable = app.tableName || 'registrations';
        const usersTable = 'users';

        // --- FETCH 1: REGISTRATIONS (Pending/Rejected) ---
        const fetchRegistrations = async () => {
          try {
            const response = await fetch(`${apiUrl}/rest/v1/${registrationTable}?select=*&order=created_at.desc`, { headers });
            if (!response.ok) return [];
            const data = await response.json();

            return data.map((record: any) => {
              let feStatus: 'active' | 'pending' | 'suspended' = 'pending';
              const rawStatus = (record.status || 'pending').toLowerCase();
              
              if (rawStatus === 'rejected') feStatus = 'suspended';
              else feStatus = 'pending'; // Approved ones should be deleted, so remaining are pending

              return {
                id: `REG-${record.id}`, // Prefix to avoid collision
                originalId: record.id?.toString(),
                name: record.name || 'Unknown Candidate',
                email: record.email || 'no-email',
                phoneNumber: record.whatsapp,
                password: record.password,
                sourceAppId: app.id,
                sourceAppName: app.name,
                status: feStatus,
                subscriptionTier: 'free',
                registeredAt: record.created_at || new Date().toISOString(),
                lastActive: record.created_at || 'Never',
                reason: record.reason,
                originTable: 'registrations'
              } as User & { originTable: string, originalId: string };
            });
          } catch (e) {
            console.error(`Error fetching registrations for ${app.name}`, e);
            return [];
          }
        };

        // --- FETCH 2: USERS (Active Users) ---
        const fetchActiveUsers = async () => {
          try {
            const response = await fetch(`${apiUrl}/rest/v1/${usersTable}?select=*`, { headers });
            if (!response.ok) return [];
            const data = await response.json();

            return data.map((record: any) => ({
              id: `USR-${record.user_id || record.id}`,
              originalId: record.user_id || record.id,
              name: record.full_name || record.name || 'Active User',
              email: record.email,
              phoneNumber: record.whatsapp,
              password: '***', 
              sourceAppId: app.id,
              sourceAppName: app.name,
              status: 'active',
              subscriptionTier: record.role === 'admin' ? 'pro' : 'free',
              registeredAt: record.last_updated || new Date().toISOString(),
              subscriptionEnd: record.subscription_expiry,
              lastActive: record.last_updated || 'Recently',
              reason: 'Imported from Users Table',
              originTable: 'users'
            } as User & { originTable: string, originalId: string }));
          } catch (e) {
            console.error(`Error fetching users for ${app.name}`, e);
            return [];
          }
        };

        // Execute both fetches in parallel
        const [regData, usersData] = await Promise.all([fetchRegistrations(), fetchActiveUsers()]);

        const activeEmails = new Set(usersData.map((u: any) => u.email));
        
        // Filter registrations: Ensure we don't show anyone who is already in Users table
        const filteredRegs = regData.filter((r: any) => !activeEmails.has(r.email));

        allUsers = [...allUsers, ...usersData, ...filteredRegs];
        
        updateAppUserCount(app.id, usersData.length + filteredRegs.length);
      }
    }
    
    if (apps.length > 0) {
      setUsers(allUsers);
    }
  };

  const updateAppUserCount = (appId: string, count: number) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, userCount: count, lastSync: new Date().toLocaleTimeString() } : a));
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAllRemoteUsers();
    const interval = setInterval(fetchAllRemoteUsers, 5000); 
    return () => clearInterval(interval);
  }, [isAuthenticated, apps.length]);

  /* ---------- UPDATE HANDLER ---------- */
  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    // Optimistic Update
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));

    const userToUpdate = users.find(u => u.id === id) as any; // Cast to access originTable
    if (!userToUpdate) return;

    const app = apps.find(a => a.id === userToUpdate.sourceAppId);
    const apiUrl = getApiUrlFromHost(app?.dbHost);

    if (app && apiUrl && app.apiKey) {
       try {
         const headers = {
            'apikey': app.apiKey,
            'Authorization': `Bearer ${app.apiKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
         };

         // === SCENARIO 1: APPROVING (Move from Registration -> Users) ===
         if (updates.status === 'active' && userToUpdate.originTable === 'registrations') {
            
            const realId = userToUpdate.originalId; 
            const regTable = app.tableName || 'registrations';

            const subscriptionExpiry = updates.subscriptionEnd || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();
            
            // 1. Insert into Users Table
            const newUserPayload = {
               user_id: `USR-${Date.now()}`, 
               full_name: userToUpdate.name,
               email: userToUpdate.email,
               role: 'viewer',
               whatsapp: userToUpdate.phoneNumber,
               status: 'active',
               subscription_expiry: subscriptionExpiry,
               performance_score: 100
            };

            const createRes = await fetch(`${apiUrl}/rest/v1/users`, {
               method: 'POST',
               headers,
               body: JSON.stringify(newUserPayload)
            });

            if (createRes.ok) {
                // 2. DELETE from Registrations Table (Clean up pending queue)
                await fetch(`${apiUrl}/rest/v1/${regTable}?id=eq.${realId}`, {
                    method: 'DELETE',
                    headers
                });
                console.log("Approved: User created and Registration deleted.");
                
                // Immediately remove from local state to prevent UI flicker before next sync
                setUsers(prev => prev.filter(u => u.id !== id));
            } else {
                alert("Failed to create user in database. Registration was not deleted.");
            }
         }

         // === SCENARIO 2: REJECTING ===
         else if (updates.status === 'suspended' && userToUpdate.originTable === 'registrations') {
            const realId = userToUpdate.originalId;
            const regTable = app.tableName || 'registrations';
            await fetch(`${apiUrl}/rest/v1/${regTable}?id=eq.${realId}`, {
               method: 'PATCH',
               headers,
               body: JSON.stringify({ status: 'rejected' })
            });
         }

         // === SCENARIO 3: UPDATING EXISTING USER (Subscription) ===
         else if (userToUpdate.originTable === 'users') {
            const realId = userToUpdate.originalId;
            
            if (updates.subscriptionEnd) {
               // Update based on user_id
               await fetch(`${apiUrl}/rest/v1/users?user_id=eq.${realId}`, {
                  method: 'PATCH',
                  headers,
                  body: JSON.stringify({ subscription_expiry: updates.subscriptionEnd })
               });
            }
         }

         // Force Refresh to sync valid state
         setTimeout(fetchAllRemoteUsers, 800);

       } catch (err) {
         console.error("Database sync failed", err);
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
    if (!confirm('Disconnect this database?')) return;
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