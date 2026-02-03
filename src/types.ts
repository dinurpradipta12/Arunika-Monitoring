export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string; // WhatsApp
  password?: string; // For display purpose as requested
  sourceAppId: string; // The ID of the app they registered from
  sourceAppName: string;
  status: 'active' | 'pending' | 'suspended';
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  registeredAt: string;
  subscriptionEnd?: string; // ISO Date string
  lastActive: string;
}

export interface ConnectedApp {
  id: string;
  name: string;
  dbType: 'postgres' | 'mysql' | 'mongodb' | 'supabase';
  connectionString: string; // Used for display
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  userCount: number;
  description: string;
  
  // Fields for Real Data Fetching
  apiUrl?: string;
  apiKey?: string;
  tableName?: string;
}

export interface DashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  activeApps: number;
  monthlyRevenue: number;
}

export type ViewState = 'dashboard' | 'apps' | 'users' | 'settings';