import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Activity, 
  AlertCircle, 
  Database, 
  Sparkles,
  ArrowUpRight,
  RefreshCcw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardStats, User, ConnectedApp } from '../types';
import { generateDashboardInsight } from '../services/geminiService';

interface DashboardProps {
  users: User[];
  apps: ConnectedApp[];
  onNavigate: (view: any) => void;
}

const mockChartData = [
  { name: 'Mon', active: 400, new: 240 },
  { name: 'Tue', active: 300, new: 139 },
  { name: 'Wed', active: 200, new: 980 },
  { name: 'Thu', active: 278, new: 390 },
  { name: 'Fri', active: 189, new: 480 },
  { name: 'Sat', active: 239, new: 380 },
  { name: 'Sun', active: 349, new: 430 },
];

const Dashboard: React.FC<DashboardProps> = ({ users, apps, onNavigate }) => {
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);

  const stats: DashboardStats = {
    totalUsers: users.length,
    pendingApprovals: users.filter(u => u.status === 'pending').length,
    activeApps: apps.filter(a => a.status === 'connected').length,
    monthlyRevenue: users.filter(u => u.subscriptionTier !== 'free').length * 29, // Mock calc
  };

  const fetchInsight = async () => {
    setLoadingInsight(true);
    const result = await generateDashboardInsight(stats, users, apps);
    setInsight(result);
    setLoadingInsight(false);
  };

  useEffect(() => {
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">System Overview</h1>
        <button 
          onClick={fetchInsight} 
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${loadingInsight ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </button>
      </div>

      {/* AI Insight Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <h3 className="font-semibold text-indigo-100">AI Executive Summary</h3>
          </div>
          <p className="text-white/90 leading-relaxed max-w-3xl">
            {loadingInsight ? "Analyzing system metrics..." : insight}
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform origin-bottom-right" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium">Total Users</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.totalUsers}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 mr-1" /> +12% this week
          </p>
        </div>

        <div 
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-amber-400"
          onClick={() => onNavigate('users')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium">Pending Approvals</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.pendingApprovals}</p>
          <p className="text-xs text-amber-600 mt-1">Requires attention</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium">Active Apps</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.activeApps}</p>
          <p className="text-xs text-slate-400 mt-1">All systems operational</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium">MRR (Est.)</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">${stats.monthlyRevenue}</p>
          <p className="text-xs text-slate-400 mt-1">Based on active subs</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">User Activity Growth</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                itemStyle={{ color: '#475569' }}
              />
              <Area type="monotone" dataKey="active" stroke="#4f46e5" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
