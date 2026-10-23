export * from './types/store';
export * from './types/camera';
export * from './types/produce';
export * from './types/security';
export * from './types/user';
export * from './types/analytics';

import type {
  Store,
  UserProfile,
  Camera,
  ProduceBin,
  SecurityEvent,
  AnalyticsToggle,
  HourlyTrafficData,
  SalesCorrelationData
} from './types';

export const MOCK_STORES: Store[] = [];

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'USR-001',
    name: 'Marcus Vance',
    email: 'admin@hypermarket.com',
    role: 'super_admin',
    assignedStoreId: 'ALL',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 019-2834',
    department: 'Executive Operations & Vision Security',
    joinedDate: '2024-11-01',
    permissions: ['all_stores_access', 'camera_linking', 'manage_stores', 'analytics_config', 'security_audit']
  }
];

export const INITIAL_ANALYTICS_SETTINGS: AnalyticsToggle[] = [];
export const MOCK_CAMERAS: Camera[] = [];
export const MOCK_PRODUCE_BINS: ProduceBin[] = [];
export const MOCK_TRAFFIC_HOURLY: HourlyTrafficData[] = [];
export const MOCK_SALES_CORRELATION: SalesCorrelationData[] = [];
export const MOCK_SECURITY_EVENTS: SecurityEvent[] = [];
export const MOCK_STAFF_TASKS: any[] = [];
