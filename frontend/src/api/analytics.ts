import { request } from './client';
import type { AnalyticsToggle } from '../types';

export const analyticsApi = {
  getAnalyticsSettings: () => request<AnalyticsToggle[]>('/analytics-settings/'),
  updateAnalyticsSetting: (id: string, enabled: boolean) => 
    request<AnalyticsToggle>(`/analytics-settings/${id}/`, { method: 'PUT', body: JSON.stringify({ enabled }) }),
};
