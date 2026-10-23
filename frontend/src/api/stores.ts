import { request } from './client';
import type { Store, TenantConfig } from '../types';

export const storeApi = {
  getStores: () => request<Store[]>('/stores/'),
  createStore: (data: Omit<Store, 'id' | 'cameraCount' | 'createdAt'>) => 
    request<Store>('/stores/', { method: 'POST', body: JSON.stringify(data) }),
  updateStore: (id: string, data: Store) => 
    request<Store>(`/stores/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStore: (id: string) => 
    request<{ message: string }>(`/stores/${id}/`, { method: 'DELETE' }),

  getTenantConfigs: () => request<Record<string, TenantConfig>>('/tenant-configs'),
  updateTenantConfig: (storeId: string, data: Partial<TenantConfig>) => 
    request<TenantConfig>(`/tenant-configs/${storeId}`, { method: 'PUT', body: JSON.stringify(data) }),
};
