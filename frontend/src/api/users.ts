import { request } from './client';
import type { UserProfile } from '../types';

export const userApi = {
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
  checkStatus: () => request<{ status: string; database: string }>('/status')
};
