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
