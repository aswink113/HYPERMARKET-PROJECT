export interface ProduceBin {
  id: string;
  name: string;
  category: string;
  cameraId: string;
  cameraName: string;
  storeId: string;
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
