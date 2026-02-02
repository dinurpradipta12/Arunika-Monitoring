import React, { useState } from 'react';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for better UX
    setTimeout(() => {
      if (email === 'adminsc@snaillabs.dom' && password === 'sc1234') {
        onLogin();
      } else {
        setError('Invalid credentials. Access denied.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 p-6 flex flex-col items-center">
          <div className="bg-white p-3 rounded-full shadow-inner mb-4">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-white">SnailLabs DevHub</h2>
          <p className="text-indigo-100 text-sm mt-1">Restricted Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">Authorized personnel only. All activities are monitored.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
