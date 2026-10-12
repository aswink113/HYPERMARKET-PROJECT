import type { Store, Camera, ProduceBin, SecurityEvent, AnalyticsToggle, UserProfile } from './mockData';
import type { TenantConfig, AttendanceRecord, Department, Designation } from './saasData';

const API_BASE_URL = 'http://127.0.0.1:8001/api';

// Helper for fetch with error handling
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // 1. Stores & Clients
  getStores: () => request<Store[]>('/stores/'),
  createStore: (data: Omit<Store, 'id' | 'cameraCount' | 'createdAt'>) => 
    request<Store>('/stores/', { method: 'POST', body: JSON.stringify(data) }),
  updateStore: (id: string, data: Store) => 
    request<Store>(`/stores/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStore: (id: string) => 
    request<{ message: string }>(`/stores/${id}/`, { method: 'DELETE' }),

  // 2. Tenant Configs
  getTenantConfigs: () => request<Record<string, TenantConfig>>('/tenant-configs'),
  updateTenantConfig: (storeId: string, data: Partial<TenantConfig>) => 
    request<TenantConfig>(`/tenant-configs/${storeId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // 3. Cameras
  getCameras: () => request<Camera[]>('/cameras/'),
  createCamera: (data: Omit<Camera, 'id' | 'lastHeartbeat'>) => 
    request<Camera>('/cameras/', { method: 'POST', body: JSON.stringify(data) }),
  deleteCamera: (id: string) => 
    request<{ message: string }>(`/cameras/${id}/`, { method: 'DELETE' }),
  updateCamera: (id: string, data: Partial<Camera>) => 
    request<Camera>(`/cameras/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateCameraAnalytics: (id: string, analyticsActive: Camera['analyticsActive']) => 
    request<Camera>(`/cameras/${id}/analytics/`, { method: 'PUT', body: JSON.stringify({ analyticsActive }) }),

  // 4. Produce Bins
  getProduceBins: () => request<ProduceBin[]>('/produce-bins/'),

  // 5. Security Events
  getSecurityEvents: () => request<SecurityEvent[]>('/security-events/'),
  updateSecurityEvent: (id: string, data: { status: SecurityEvent['status']; reviewedBy?: string; reviewedAt?: string; notes?: string }) => 
    request<SecurityEvent>(`/security-events/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),

  // 6. Attendance Records
  getAttendance: () => request<AttendanceRecord[]>('/attendance/'),
  createAttendance: (data: Omit<AttendanceRecord, 'id'>) => 
    request<AttendanceRecord>('/attendance/', { method: 'POST', body: JSON.stringify(data) }),

  // 7. Analytics Settings
  getAnalyticsSettings: () => request<AnalyticsToggle[]>('/analytics-settings/'),
  updateAnalyticsSetting: (id: string, enabled: boolean) => 
    request<AnalyticsToggle>(`/analytics-settings/${id}/`, { method: 'PUT', body: JSON.stringify({ enabled }) }),

  // 8. Authentication & Users / Staff
  getUsers: () => request<UserProfile[]>('/users/'),
  createUser: (data: Partial<UserProfile>) =>
    request<UserProfile>('/users/', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id: string) =>
    request<{ message: string }>(`/users/${id}/`, { method: 'DELETE' }),
  login: (identifier: string, password?: string) => 
    request<{ user: UserProfile; storeId?: string }>('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify({ identifier, password }) 
    }),
  updateUser: (id: string, data: Partial<UserProfile>) =>
    request<UserProfile>(`/users/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

  // 9. Master Data (Departments & Designations)
  getDepartments: () => request<Department[]>('/departments/'),
  createDepartment: (data: Partial<Department>) =>
    request<Department>('/departments/', { method: 'POST', body: JSON.stringify(data) }),
  updateDepartment: (id: string, data: Partial<Department>) =>
    request<Department>(`/departments/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteDepartment: (id: string) =>
    request<{ message?: string }>(`/departments/${id}/`, { method: 'DELETE' }),

  getDesignations: () => request<Designation[]>('/designations/'),
  createDesignation: (data: Partial<Designation>) =>
    request<Designation>('/designations/', { method: 'POST', body: JSON.stringify(data) }),
  updateDesignation: (id: string, data: Partial<Designation>) =>
    request<Designation>(`/designations/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteDesignation: (id: string) =>
    request<{ message?: string }>(`/designations/${id}/`, { method: 'DELETE' }),

  // 10. Status
  checkStatus: () => request<{ status: string; database: string }>('/status')
};

