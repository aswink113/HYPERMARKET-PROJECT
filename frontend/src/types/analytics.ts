import type { Camera } from './camera';

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

export interface HourlyTrafficData {
  hour: string;
  footTraffic: number;
  avgDwellMin: number;
  queueAlerts: number;
}

export interface SalesCorrelationData {
  timeWindow: string;
  produceZoneTraffic: number;
  registerSalesCount: number;
  conversionRate: number;
}
