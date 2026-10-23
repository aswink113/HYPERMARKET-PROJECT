export interface Store {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  address: string;
  status: 'active' | 'maintenance' | 'setup';
  cameraCount: number;
  managerName: string;
  managerEmail: string;
  clientUsername: string;
  clientPassword: string;
  createdAt: string;
}

export interface TenantConfig {
  tenantId: string;
  storeId: string;
  clientName: string;
  enabledModules: {
    storeOverview: boolean;
    cameraLiveView: boolean;
    produceBins: boolean;
    analyticsSettings: boolean;
    securityReview: boolean;
    staffAttendance: boolean;
  };
  visibleCharts: {
    trafficDwellChart: boolean;
    produceFillAlerts: boolean;
    posSalesCorrelation: boolean;
  };
  cameraControlsAllowed: boolean;
  themeCustomization: {
    brandTitle: string;
    primaryColor: string;
  };
}
