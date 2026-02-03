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
  
  // Visual Connection Fields (User Input)
  dbHost?: string;      // e.g., db.ref.supabase.co
  dbPort?: string;      // e.g., 5432
  dbUser?: string;      // e.g., postgres
  dbPass?: string;      // Saved but not used for API (security)
  dbName?: string;      // e.g., postgres
  
  // Functional Fields
  apiKey?: string;      // REQUIRED for Web Browser to access Supabase
  tableName?: string;   // 'registrations'
  
  connectionString: string; // Display string
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  userCount: number;
  description: string;
}

export interface DashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  activeApps: number;
  monthlyRevenue: number;
}

export type ViewState = 'dashboard' | 'apps' | 'users' | 'settings';