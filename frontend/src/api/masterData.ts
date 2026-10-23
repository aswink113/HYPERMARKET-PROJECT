import { request } from './client';
import type { Department, Designation } from '../types';

export const masterDataApi = {
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
};
