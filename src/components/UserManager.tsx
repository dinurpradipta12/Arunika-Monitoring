import React, { useState } from 'react';
import { Search, Filter, Check, X, MoreVertical, BadgeCheck, Clock, RefreshCw, Loader2, Database, Eye, EyeOff, Calendar, Phone, Key, CreditCard, Server, ShieldCheck, CheckCheck, FileText } from 'lucide-react';
import { User, ConnectedApp } from '../types';

interface UserManagerProps {
  users: User[];
  apps: ConnectedApp[];
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onExtendSubscription?: (userId: string, plan: 'weekly' | 'monthly' | 'yearly') => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, apps, onUpdateUser, onExtendSubscription }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('pending');
  const [search, setSearch] = useState('');
  
  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  // Sync Simulation State
  const [isSyncing, setIsSyncing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredUsers = users
    .filter(u => filter === 'all' || u.status === filter)
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  
  const pendingCount = users.filter(u => u.status === 'pending').length;

  const selectedUserApp = selectedUser ? apps.find(a => a.id === selectedUser.sourceAppId) : null;

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsFetchingDetails(true);
    setShowPassword(false);
    setTimeout(() => {
      setIsFetchingDetails(false);
    }, 800);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1500);
  };

  const handleApproveAll = () => {
    const pendingUsers = users.filter(u => u.status === 'pending');
    if (pendingUsers.length === 0) return;

    if (window.confirm(`Are you sure you want to approve all ${pendingUsers.length} pending users?`)) {
      setProcessingId('bulk-approve');
      
      setTimeout(() => {
        pendingUsers.forEach((user) => {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          
          onUpdateUser(user.id, { 
            status: 'active', 
            registeredAt: new Date().toISOString(),
            subscriptionEnd: nextMonth.toISOString()
          });
        });
        setProcessingId(null);
      }, 1500);
    }
  };

  const handleApprove = (id: string, appName: string) => {
    if (window.confirm(`Approving this user will grant them access to "${appName}". Continue?`)) {
      setProcessingId(id);
      
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      onUpdateUser(id, { 
        status: 'active', 
        registeredAt: new Date().toISOString(),
        subscriptionEnd: nextMonth.toISOString()
      });
      
      // Keep loading spinner briefly to show action
      setTimeout(() => setProcessingId(null), 2000);
    }
  };

  const handleReject = (id: string) => {
    if (window.confirm("Are you sure you want to reject this user?")) {
       onUpdateUser(id, { status: 'suspended' });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Approvals</h1>
          <p className="text-slate-500 mt-1">Manage registrations from 'registrations' table.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleApproveAll}
             disabled={pendingCount === 0 || processingId !== null}
             className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {processingId === 'bulk-approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
             Approve All ({pendingCount})
           </button>
           <button 
             onClick={handleSync}
             disabled={isSyncing}
             className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
           >
             {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
             {isSyncing ? 'Fetching...' : 'Force Sync'}
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
              placeholder="Search users by name or email..."
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
                <th className="px-6 py-4">Database Origin</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Subscription</th>
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
                      <p className="text-xs">Waiting for data from 'registrations' table...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleUserClick(user)}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 hover:border-indigo-400 transition-colors">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 hover:text-indigo-600">{user.name}</p>
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
                          <Clock className="h-3 w-3" /> Waiting
                        </span>
                      )}
                      {user.status === 'active' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium border border-emerald-100">
                          <BadgeCheck className="h-3 w-3" /> Approved
                        </span>
                      )}
                      {user.status === 'suspended' && (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-full text-xs font-medium border border-red-100">
                          <X className="h-3 w-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-slate-600 font-mono text-xs uppercase tracking-wider block">{user.subscriptionTier}</span>
                       {user.status === 'active' && user.subscriptionEnd && (
                         <span className="text-[10px] text-slate-400">Exp: {new Date(user.subscriptionEnd).toLocaleDateString()}</span>
                       )}
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
                            Approve
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleUserClick(user)}
                          className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                        >
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

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-all" onClick={(e) => e.stopPropagation()}>
            
            <div className="bg-indigo-600 px-6 py-5 flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl font-bold border border-white/30 shadow-inner">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedUser.name}</h2>
                  <p className="text-indigo-100 text-sm flex items-center gap-1 opacity-90">
                    <Database className="h-3 w-3" /> 
                    {selectedUserApp ? selectedUserApp.name : 'Unknown App'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-white/70 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 min-h-[400px]">
              {isFetchingDetails ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 py-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-20"></div>
                    <Server className="h-12 w-12 text-indigo-600 relative z-10" />
                  </div>
                  <div className="text-center">
                     <p className="font-medium text-slate-800">Syncing with DB...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Status & Reason */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                       <FileText className="h-4 w-4 text-slate-500" />
                       <span className="text-xs font-bold text-slate-600 uppercase">Registration Reason</span>
                    </div>
                    <p className="text-sm text-slate-700 italic">"{selectedUser.reason || 'No reason provided.'}"</p>
                  </div>

                  {/* Personal Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
                      <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Database className="h-3 w-3" /> Email Address</p>
                      <p className="text-sm font-medium text-slate-800 break-all select-all">{selectedUser.email}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
                      <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Phone className="h-3 w-3" /> WhatsApp (DB)</p>
                      <p className="text-sm font-medium text-slate-800 font-mono select-all">{selectedUser.phoneNumber || '-'}</p>
                    </div>
                  </div>

                  {/* Security Section (Password) */}
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                        <Key className="h-3 w-3" /> Stored Password
                      </p>
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-amber-600 hover:text-amber-800 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="font-mono text-sm text-slate-800 bg-white px-3 py-2 rounded border border-amber-200 break-all">
                      {showPassword ? (selectedUser.password || '••••••') : '••••••••••••••••'}
                    </p>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Subscription Management */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-indigo-600" />
                        Subscription (Users Table)
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        new Date(selectedUser.subscriptionEnd || '') < new Date() 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedUser.subscriptionEnd 
                          ? `Exp: ${formatDate(selectedUser.subscriptionEnd)}` 
                          : 'No Active Sub'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => onExtendSubscription?.(selectedUser.id, 'weekly')}
                        className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                      >
                        <span className="text-xs text-slate-500 group-hover:text-indigo-600">Weekly</span>
                        <span className="font-bold text-slate-800 text-lg group-hover:text-indigo-700">+7 D</span>
                      </button>
                      <button 
                        onClick={() => onExtendSubscription?.(selectedUser.id, 'monthly')}
                        className="flex flex-col items-center justify-center p-3 border border-indigo-200 bg-indigo-50/50 rounded-xl hover:bg-indigo-100 transition-all group relative overflow-hidden"
                      >
                        <span className="text-xs text-indigo-600">Monthly</span>
                        <span className="font-bold text-indigo-900 text-lg">+1 M</span>
                      </button>
                      <button 
                        onClick={() => onExtendSubscription?.(selectedUser.id, 'yearly')}
                        className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                      >
                        <span className="text-xs text-slate-500 group-hover:text-indigo-600">Yearly</span>
                        <span className="font-bold text-slate-800 text-lg group-hover:text-indigo-700">+1 Y</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => setSelectedUser(null)}
                      className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;