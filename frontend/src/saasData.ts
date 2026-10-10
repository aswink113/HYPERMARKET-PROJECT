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
  cameraControlsAllowed: boolean; // If false, client cannot toggle camera analytics or edit parameters
  themeCustomization: {
    brandTitle: string;
    primaryColor: string;
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  storeId: string;
  department: string;
  shiftDate: string;
  clockInTime: string;
  clockOutTime?: string;
  breakDurationMinutes: number;
  authMethod: 'Tablet PIN' | 'Web Portal' | 'NFC Badge';
  status: 'Punctual' | 'Late Entry' | 'Missed Punch' | 'On Break';
  cameraOccupancySignal?: 'Zone Occupied' | 'Zone Inactive';
}

export interface StaffShift {
  id: string;
  employeeId: string;
  employeeName: string;
  storeId: string;
  role: string;
  plannedStart: string;
  plannedEnd: string;
  approvedStatus: 'Approved' | 'Pending Swap' | 'Draft';
}

export const MOCK_TENANT_CONFIGS: Record<string, TenantConfig> = {};

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export const MOCK_SHIFTS: StaffShift[] = [];

