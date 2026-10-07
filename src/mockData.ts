export interface Camera {
  id: string;
  name: string;
  location: string;
  storeId: string;
  status: 'online' | 'offline' | 'warning';
  ipAddress: string;
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

export interface ProduceBin {
  id: string;
  name: string;
  category: string;
  cameraId: string;
  cameraName: string;
  fillPercentage: number;
  status: 'OK' | 'LOW' | 'LIKELY_EMPTY' | 'VIEW_BLOCKED';
  confidence: number;
  lastChecked: string;
  mappedSKU: string;
  pricePerKg: number;
  targetWeightKg: number;
  estVisibleWeightKg: number;
  polygonPoints: { x: number; y: number }[];
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
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

export const INITIAL_ANALYTICS_SETTINGS: AnalyticsToggle[] = [
  {
    id: 'ana-1',
    key: 'peopleTracking',
    name: 'Customer Flow & Dwell Tracking',
    description: 'Anonymous zone visits, foot traffic counts, average & peak dwell estimations.',
    enabled: true,
    accuracy: 94.2,
    dataPurpose: 'Store layout optimization & staffing allocation',
    model: 'YOLOv8-PersonTrack-v2.1',
    requiresReview: false
  },
  {
    id: 'ana-2',
    key: 'produceAvailability',
    name: 'Produce Availability & Bin Fill',
    description: 'Real-time visible bin fill estimates (OK / Low / Likely Empty / View Blocked).',
    enabled: true,
    accuracy: 91.8,
    dataPurpose: 'Automated restock alerts and fresh display compliance',
    model: 'ShelfSeg-ProduceNet-v1.4',
    requiresReview: false
  },
  {
    id: 'ana-3',
    key: 'queueDetection',
    name: 'Checkout Queue & Wait Time',
    description: 'Queue length estimation and wait-time threshold alerts for cashier staffing.',
    enabled: true,
    accuracy: 89.5,
    dataPurpose: 'Checkout speed and queue length management',
    model: 'QueueDepth-v3.0',
    requiresReview: false
  },
  {
    id: 'ana-4',
    key: 'safetyMonitoring',
    name: 'Safety & Housekeeping Cues',
    description: 'Detects fallen produce, blocked aisles, or potential floor spill hazard areas.',
    enabled: false,
    accuracy: 86.0,
    dataPurpose: 'Floor safety and prompt spill response',
    model: 'HazardSpot-v1.0',
    requiresReview: true
  },
  {
    id: 'ana-5',
    key: 'lossPrevention',
    name: 'Loss Prevention Cue Flagging (Human-Reviewed)',
    description: 'Flags suspicious item movement for human audit. *Never an automatic accusation.*',
    enabled: true,
    accuracy: 83.4,
    dataPurpose: 'Controlled security event review queue',
    model: 'ActionCue-LPR-v0.9 (Shadow Pilot)',
    requiresReview: true
  }
];

export const MOCK_CAMERAS: Camera[] = [
  {
    id: 'CAM-01',
    name: 'CAM-01: Produce Overhead Section A',
    location: 'Produce Zone - Bin Array 1-4',
    storeId: 'STORE-01 (Downtown Hypermarket)',
    status: 'online',
    ipAddress: '192.168.10.101',
    resolution: '4K (3840x2160)',
    fps: 30,
    fov: '110° Wide Angle',
    retentionDays: 14,
    codecs: 'H.265 / RTSP ONVIF Profile T',
    analyticsActive: {
      peopleTracking: true,
      produceAvailability: true,
      queueDetection: false,
      safetyMonitoring: false,
      lossPrevention: true
    },
    streamUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    posterUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    configuredRegions: 4,
    lastHeartbeat: 'Just now'
  },
  {
    id: 'CAM-02',
    name: 'CAM-02: Produce Overhead Section B',
    location: 'Produce Zone - Organic Bins 5-8',
    storeId: 'STORE-01 (Downtown Hypermarket)',
    status: 'online',
    ipAddress: '192.168.10.102',
    resolution: '1080p (1920x1080)',
    fps: 25,
    fov: '90° Fixed',
    retentionDays: 14,
    codecs: 'H.264 / RTSP ONVIF Profile T',
    analyticsActive: {
      peopleTracking: true,
      produceAvailability: true,
      queueDetection: false,
      safetyMonitoring: true,
      lossPrevention: false
    },
    streamUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80',
    posterUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80',
    configuredRegions: 4,
    lastHeartbeat: 'Just now'
  },
  {
    id: 'CAM-03',
    name: 'CAM-03: Main Entrance & Entry Flow',
    location: 'Main Foyer & Cart Return',
    storeId: 'STORE-01 (Downtown Hypermarket)',
    status: 'online',
    ipAddress: '192.168.10.103',
    resolution: '4K (3840x2160)',
    fps: 30,
    fov: '120° Wide Angle',
    retentionDays: 30,
    codecs: 'H.265 / RTSP',
    analyticsActive: {
      peopleTracking: true,
      produceAvailability: false,
      queueDetection: false,
      safetyMonitoring: true,
      lossPrevention: true
    },
    streamUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
    posterUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    configuredRegions: 2,
    lastHeartbeat: '1 min ago'
  },
  {
    id: 'CAM-04',
    name: 'CAM-04: Checkout Express Lanes 1-6',
    location: 'Front End Cashier Zone',
    storeId: 'STORE-01 (Downtown Hypermarket)',
    status: 'warning',
    ipAddress: '192.168.10.104',
    resolution: '1080p (1920x1080)',
    fps: 20,
    fov: '85° Corridor View',
    retentionDays: 14,
    codecs: 'H.264 / ONVIF Profile S',
    analyticsActive: {
      peopleTracking: true,
      produceAvailability: false,
      queueDetection: true,
      safetyMonitoring: false,
      lossPrevention: true
    },
    streamUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80',
    posterUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=600&q=80',
    configuredRegions: 6,
    lastHeartbeat: 'Frame drops detected'
  }
];

export const MOCK_PRODUCE_BINS: ProduceBin[] = [
  {
    id: 'BIN-101',
    name: 'Red Delicious Apples (Bin 1)',
    category: 'Fruits - Apples',
    cameraId: 'CAM-01',
    cameraName: 'CAM-01 Overhead Produce',
    fillPercentage: 78,
    status: 'OK',
    confidence: 0.94,
    lastChecked: '2 mins ago',
    mappedSKU: 'SKU-APP-RED-01',
    pricePerKg: 3.49,
    targetWeightKg: 40,
    estVisibleWeightKg: 31.2,
    polygonPoints: [{ x: 10, y: 15 }, { x: 40, y: 15 }, { x: 40, y: 45 }, { x: 10, y: 45 }]
  },
  {
    id: 'BIN-102',
    name: 'Organic Cavendish Bananas (Bin 2)',
    category: 'Fruits - Tropical',
    cameraId: 'CAM-01',
    cameraName: 'CAM-01 Overhead Produce',
    fillPercentage: 18,
    status: 'LOW',
    confidence: 0.89,
    lastChecked: '1 min ago',
    mappedSKU: 'SKU-BAN-ORG-02',
    pricePerKg: 1.99,
    targetWeightKg: 50,
    estVisibleWeightKg: 9.0,
    polygonPoints: [{ x: 50, y: 15 }, { x: 85, y: 15 }, { x: 85, y: 45 }, { x: 50, y: 45 }]
  },
  {
    id: 'BIN-103',
    name: 'Fresh Hydroponic Spinach (Bin 3)',
    category: 'Greens - Leafy',
    cameraId: 'CAM-01',
    cameraName: 'CAM-01 Overhead Produce',
    fillPercentage: 5,
    status: 'LIKELY_EMPTY',
    confidence: 0.96,
    lastChecked: 'Just now',
    mappedSKU: 'SKU-SPN-HYD-03',
    pricePerKg: 4.99,
    targetWeightKg: 15,
    estVisibleWeightKg: 0.75,
    polygonPoints: [{ x: 10, y: 55 }, { x: 40, y: 55 }, { x: 40, y: 88 }, { x: 10, y: 88 }]
  },
  {
    id: 'BIN-104',
    name: 'Roma Tomatoes (Bin 4)',
    category: 'Vegetables - Tomatoes',
    cameraId: 'CAM-01',
    cameraName: 'CAM-01 Overhead Produce',
    fillPercentage: 0,
    status: 'VIEW_BLOCKED',
    confidence: 0.42,
    lastChecked: '5 mins ago',
    mappedSKU: 'SKU-TOM-ROM-04',
    pricePerKg: 2.89,
    targetWeightKg: 35,
    estVisibleWeightKg: 0.0,
    polygonPoints: [{ x: 50, y: 55 }, { x: 85, y: 55 }, { x: 85, y: 88 }, { x: 50, y: 88 }]
  },
  {
    id: 'BIN-105',
    name: 'Haas Avocados Premium (Bin 5)',
    category: 'Fruits - Tropical',
    cameraId: 'CAM-02',
    cameraName: 'CAM-02 Organic Bins',
    fillPercentage: 82,
    status: 'OK',
    confidence: 0.92,
    lastChecked: '4 mins ago',
    mappedSKU: 'SKU-AVO-HAS-05',
    pricePerKg: 5.99,
    targetWeightKg: 30,
    estVisibleWeightKg: 24.6,
    polygonPoints: [{ x: 15, y: 20 }, { x: 45, y: 20 }, { x: 45, y: 50 }, { x: 15, y: 50 }]
  },
  {
    id: 'BIN-106',
    name: 'Organic Navel Oranges (Bin 6)',
    category: 'Fruits - Citrus',
    cameraId: 'CAM-02',
    cameraName: 'CAM-02 Organic Bins',
    fillPercentage: 22,
    status: 'LOW',
    confidence: 0.88,
    lastChecked: '3 mins ago',
    mappedSKU: 'SKU-ORA-NAV-06',
    pricePerKg: 3.19,
    targetWeightKg: 45,
    estVisibleWeightKg: 9.9,
    polygonPoints: [{ x: 55, y: 20 }, { x: 85, y: 20 }, { x: 85, y: 50 }, { x: 55, y: 50 }]
  }
];

export const MOCK_TRAFFIC_HOURLY = [
  { hour: '08:00', visitors: 45, avgDwellSec: 52, produceVisits: 28 },
  { hour: '09:00', visitors: 110, avgDwellSec: 64, produceVisits: 75 },
  { hour: '10:00', visitors: 195, avgDwellSec: 78, produceVisits: 142 },
  { hour: '11:00', visitors: 280, avgDwellSec: 85, produceVisits: 210 },
  { hour: '12:00', visitors: 340, avgDwellSec: 92, produceVisits: 265 },
  { hour: '13:00', visitors: 310, avgDwellSec: 88, produceVisits: 230 },
  { hour: '14:00', visitors: 260, avgDwellSec: 74, produceVisits: 185 },
  { hour: '15:00', visitors: 290, avgDwellSec: 82, produceVisits: 215 },
  { hour: '16:00', visitors: 380, avgDwellSec: 105, produceVisits: 310 },
  { hour: '17:00', visitors: 450, avgDwellSec: 118, produceVisits: 385 },
  { hour: '18:00', visitors: 420, avgDwellSec: 110, produceVisits: 350 },
  { hour: '19:00', visitors: 240, avgDwellSec: 68, produceVisits: 175 }
];

export const MOCK_SALES_CORRELATION = [
  { time: '10:00', organicBananasFill: 75, posUnitsSold: 12, trafficCount: 195 },
  { time: '11:00', organicBananasFill: 58, posUnitsSold: 18, trafficCount: 280 },
  { time: '12:00', organicBananasFill: 40, posUnitsSold: 22, trafficCount: 340 },
  { time: '13:00', organicBananasFill: 25, posUnitsSold: 15, trafficCount: 310 },
  { time: '14:00', organicBananasFill: 18, posUnitsSold: 6, trafficCount: 260 },
  { time: '15:00', organicBananasFill: 95, posUnitsSold: 28, trafficCount: 290 },
  { time: '16:00', organicBananasFill: 78, posUnitsSold: 32, trafficCount: 380 },
  { time: '17:00', organicBananasFill: 52, posUnitsSold: 41, trafficCount: 450 }
];

export const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'SEC-8091',
    timestamp: '2026-10-07 11:42:15',
    cameraId: 'CAM-01',
    cameraName: 'CAM-01 Produce Overhead',
    location: 'Produce High-Value Display A',
    eventType: 'Possible Concealment',
    confidence: 0.87,
    status: 'Pending Review',
    clipDurationSec: 18,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    notes: 'Shopper selected multiple items near organic bin and moved hand towards jacket pocket. Human decision required under store policy.'
  },
  {
    id: 'SEC-8088',
    timestamp: '2026-10-07 10:15:30',
    cameraId: 'CAM-03',
    cameraName: 'CAM-03 Entrance Foyer',
    location: 'Entry Corridor B',
    eventType: 'Blocked Aisle',
    confidence: 0.94,
    status: 'Needs Follow-Up',
    reviewedBy: 'M. Vance (LP Lead)',
    reviewedAt: '2026-10-07 10:22:00',
    clipDurationSec: 45,
    thumbnailUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80',
    notes: 'Unattended stocking cart placed across main emergency egress path for > 15 minutes.'
  },
  {
    id: 'SEC-8075',
    timestamp: '2026-10-07 09:30:12',
    cameraId: 'CAM-01',
    cameraName: 'CAM-01 Produce Overhead',
    location: 'Produce Bin 3 Area',
    eventType: 'Possible Concealment',
    confidence: 0.72,
    status: 'No Concern',
    reviewedBy: 'M. Vance (LP Lead)',
    reviewedAt: '2026-10-07 09:35:10',
    clipDurationSec: 14,
    thumbnailUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=400&q=80',
    notes: 'Customer put personal item in reusable shopper tote bag. Verified normal behavior.'
  }
];

export const MOCK_STAFF_TASKS = [
  {
    id: 'TSK-401',
    title: 'Restock Hydroponic Spinach (Bin 3)',
    priority: 'HIGH',
    status: 'Pending',
    createdAt: '10 mins ago',
    binId: 'BIN-103',
    assignedRole: 'Produce Staff',
    reason: 'Camera flagged fill at 5% (Likely Empty)'
  },
  {
    id: 'TSK-402',
    title: 'Restock Organic Bananas (Bin 2)',
    priority: 'MEDIUM',
    status: 'In Progress',
    createdAt: '25 mins ago',
    binId: 'BIN-102',
    assignedRole: 'Produce Staff',
    reason: 'Fill estimated at 18% (Low stock threshold met)'
  },
  {
    id: 'TSK-403',
    title: 'Clean Lens / Clear Occlusion on CAM-01 Bin 4',
    priority: 'LOW',
    status: 'Pending',
    createdAt: '1 hour ago',
    binId: 'BIN-104',
    assignedRole: 'Store Maintenance',
    reason: 'View Blocked signal received from camera vision pipeline'
  }
];
