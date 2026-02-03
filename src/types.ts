export interface User {
  id: string;
  name: string;
  email: string;
  sourceAppId: string; // The ID of the app they registered from
  sourceAppName: string;
  status: 'active' | 'pending' | 'suspended';
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  registeredAt: string;
  lastActive: string;
}

export interface ConnectedApp {
  id: string;
  name: string;
  dbType: 'postgres' | 'mysql' | 'mongodb' | 'api';
  connectionString: string; // Mocked connection string
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