import { request } from './client';
import type { Camera } from '../types';

export const cameraApi = {
  getCameras: () => request<Camera[]>('/cameras/'),
  createCamera: (data: Omit<Camera, 'id' | 'lastHeartbeat'>) => 
    request<Camera>('/cameras/', { method: 'POST', body: JSON.stringify(data) }),
  deleteCamera: (id: string) => 
    request<{ message: string }>(`/cameras/${id}/`, { method: 'DELETE' }),
  updateCamera: (id: string, data: Partial<Camera>) => 
    request<Camera>(`/cameras/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateCameraAnalytics: (id: string, analyticsActive: Camera['analyticsActive']) => 
    request<Camera>(`/cameras/${id}/analytics/`, { method: 'PUT', body: JSON.stringify({ analyticsActive }) }),
};
