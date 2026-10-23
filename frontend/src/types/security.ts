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
