import React, { useState } from 'react';
import { Search, Filter, Check, X, MoreVertical, BadgeCheck, Clock } from 'lucide-react';
import { User, ConnectedApp } from '../types';

interface UserManagerProps {
  users: User[];
  apps: ConnectedApp[];
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, apps, onUpdateUser }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [search, setSearch] = useState('');

  const filteredUsers = users
    .filter(u => filter === 'all' || u.status === filter)
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleApprove = (id: string) => {
    onUpdateUser(id, { status: 'active', registeredAt: new Date().toISOString() });
  };

  const handleReject = (id: string) => {
    onUpdateUser(id, { status: 'suspended' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1">Approve registrations and monitor subscriptions.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setFilter('all')}
             className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
           >
             All
           </button>
           <button 
             onClick={() => setFilter('pending')}
             className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
           >
             Pending
           </button>
           <button 
             onClick={() => setFilter('active')}
             className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'active' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
           >
             Active
           </button>
        </div>
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
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Source App</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-slate-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                         {user.sourceAppName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium">
                          <Clock className="h-3 w-3" /> Approval Needed
                        </span>
                      )}
                      {user.status === 'active' && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium">
                          <BadgeCheck className="h-3 w-3" /> Active
                        </span>
                      )}
                      {user.status === 'suspended' && (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                          <X className="h-3 w-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="bg-transparent border border-transparent hover:border-slate-300 rounded px-2 py-1 outline-none text-slate-700"
                        value={user.subscriptionTier}
                        onChange={(e) => onUpdateUser(user.id, { subscriptionTier: e.target.value as any })}
                      >
                        <option value="free">Free Tier</option>
                        <option value="pro">Pro Plan</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleReject(user.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                            <X className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleApprove(user.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button className="text-slate-400 hover:text-slate-600">
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
