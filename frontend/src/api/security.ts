import { request } from './client';
import type { SecurityEvent } from '../types';

export const securityApi = {
  getSecurityEvents: () => request<SecurityEvent[]>('/security-events/'),
  updateSecurityEvent: (id: string, data: { status: SecurityEvent['status']; reviewedBy?: string; reviewedAt?: string; notes?: string }) => 
    request<SecurityEvent>(`/security-events/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
};
