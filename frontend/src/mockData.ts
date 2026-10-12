export interface Store {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  address: string;
  status: 'active' | 'maintenance' | 'setup';
  cameraCount: number;
  managerName: string;
  managerEmail: string;
  clientUsername: string;
  clientPassword: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: 'super_admin' | 'store_manager' | 'lp_reviewer' | 'analyst' | 'associate';
  assignedStoreId: string; // 'ALL' or specific store ID
  avatar: string;
  facePhotos?: string[]; // Up to 3 facial photos to increase biometric accuracy
  phone: string;
  gender?: string;
  designation?: string;
  department: string;
  joinedDate: string;
  permissions: string[];
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  storeId: string;
  status: 'online' | 'offline' | 'warning';
  ipAddress: string;
  rtspPort?: string;
  streamPath?: string;
  cameraUsername?: string;
  cameraPassword?: string;
  resolution: string;
  fps: number;
  fov: string;
  retentionDays: number;
  codecs: string;
  analyticsActive: {
    peopleTracking: boolean;
    produceAvailability: boolean;
    queueDetection: boolean;
    safetyMonitoring: boolean;
    lossPrevention: boolean;
  };
  streamUrl: string;
  posterUrl: string;
  configuredRegions: number;
  lastHeartbeat: string;
}

export interface ProduceBin {
  id: string;
  name: string;
  category: string;
  cameraId: string;
  cameraName: string;
  storeId: string;
  fillPercentage: number;
  status: 'OK' | 'LOW' | 'LIKELY_EMPTY' | 'VIEW_BLOCKED';
  confidence: number;
  lastChecked: string;
  mappedSKU: string;
  pricePerKg: number;
  targetWeightKg: number;
  estVisibleWeightKg: number;
  polygonPoints: { x: number; y: number }[];
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  storeId: string;
  location: string;
  eventType: 'Possible Concealment' | 'Unusual Dwell' | 'Restricted Area' | 'Blocked Aisle';
  confidence: number;
  status: 'Pending Review' | 'No Concern' | 'Needs Follow-Up' | 'Confirmed Incident';
  reviewedBy?: string;
  reviewedAt?: string;
  clipDurationSec: number;
  thumbnailUrl: string;
  notes?: string;
}

export interface AnalyticsToggle {
  id: string;
  key: keyof Camera['analyticsActive'];
  name: string;
  description: string;
  enabled: boolean;
  accuracy: number;
  dataPurpose: string;
  model: string;
  requiresReview: boolean;
}

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

export const MOCK_TRAFFIC_HOURLY: any[] = [];

export const MOCK_SALES_CORRELATION: any[] = [];

export const MOCK_SECURITY_EVENTS: SecurityEvent[] = [];

export const MOCK_STAFF_TASKS: any[] = [];

