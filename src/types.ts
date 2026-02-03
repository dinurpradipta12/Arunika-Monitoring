export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string; // Mapped from 'whatsapp' column
  password?: string; 
  sourceAppId: string; 
  sourceAppName: string;
  status: 'active' | 'pending' | 'suspended';
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  registeredAt: string;
  subscriptionEnd?: string; // Mapped from 'subscription_expiry'
  lastActive: string;
  reason?: string; // New field from 'registrations' table
}

export interface ConnectedApp {
  id: string;
  name: string;
  dbType: 'postgres' | 'mysql' | 'mongodb' | 'supabase';
  connectionString: string; 
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  userCount: number;
  description: string;
  
  // Fields for Real Data Fetching
  apiUrl?: string;
  apiKey?: string;
  tableName?: string; // Should be 'registrations' for approval flow
}

export interface DashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  activeApps: number;
  monthlyRevenue: number;
}

export type ViewState = 'dashboard' | 'apps' | 'users' | 'settings';