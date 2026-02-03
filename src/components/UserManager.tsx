import React, { useState } from 'react';
import { Search, Filter, Check, X, MoreVertical, BadgeCheck, Clock, RefreshCw, Loader2, Database } from 'lucide-react';
import { User, ConnectedApp } from '../types';

interface UserManagerProps {
  users: User[];
  apps: ConnectedApp[];
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, apps, onUpdateUser }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('pending'); // Default to pending as requested
  const [search, setSearch] = useState('');
  
  // Sync Simulation State
  const [isSyncing, setIsSyncing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredUsers = users
    .filter(u => filter === 'all' || u.status === filter)
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate fetching data from external databases
    setTimeout(() => {
      setIsSyncing(false);
      alert(`Sync Complete: Scanned ${apps.length} connected databases. No new external records found.`);
    }, 2000);
  };

  const handleApprove = (id: string, appName: string) => {
    if (window.confirm(`Approving this user will grant them access to "${appName}". Continue?`)) {
      setProcessingId(id);
      // Simulate API call to external app to update user status
      setTimeout(() => {
        onUpdateUser(id, { status: 'active', registeredAt: new Date().toISOString() });
        setProcessingId(null);
      }, 1000);
    }
  };

  const handleReject = (id: string) => {
    if (window.confirm("Are you sure you want to reject this user?")) {
       onUpdateUser(id, { status: 'suspended' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Approvals</h1>
          <p className="text-slate-500 mt-1">Monitor and approve new user registrations from connected apps.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleSync}
             disabled={isSyncing}
             className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
           >
             {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
             {isSyncing ? 'Syncing DB...' : 'Sync Databases'}
           </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-1">
           <button 
             onClick={() => setFilter('pending')}
             className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${filter === 'pending' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
             Pending Approval ({users.filter(u => u.status === 'pending').length})
           </button>
           <button 
             onClick={() => setFilter('active')}
             className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${filter === 'active' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
             Active Users
           </button>
           <button 
             onClick={() => setFilter('all')}
             className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${filter === 'all' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
             All Records
           </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email or app..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Origin Application</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Requested Plan</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Database className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="font-medium">No users found</p>
                      <p className="text-xs">Try running a Database Sync to fetch new records.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-slate-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-slate-700 text-xs font-medium border border-slate-200 shadow-sm">
                         <Database className="h-3 w-3 text-indigo-500" />
                         {user.sourceAppName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium border border-amber-100">
                          <Clock className="h-3 w-3" /> Awaiting Approval
                        </span>
                      )}
                      {user.status === 'active' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium border border-emerald-100">
                          <BadgeCheck className="h-3 w-3" /> Synced & Active
                        </span>
                      )}
                      {user.status === 'suspended' && (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-full text-xs font-medium border border-red-100">
                          <X className="h-3 w-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-slate-600 font-mono text-xs uppercase tracking-wider">{user.subscriptionTier}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleReject(user.id)}
                            disabled={processingId === user.id}
                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleApprove(user.id, user.sourceAppName)}
                            disabled={processingId === user.id}
                            className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm flex items-center gap-2 disabled:opacity-70"
                          >
                            {processingId === user.id && <Loader2 className="h-3 w-3 animate-spin" />}
                            Approve Access
                          </button>
                        </div>
                      ) : (
                        <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;