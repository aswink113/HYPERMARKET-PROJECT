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

export const MOCK_TENANT_CONFIGS: Record<string, TenantConfig> = {
  'STORE-01': {
    tenantId: 'TNT-001',
    storeId: 'STORE-01',
    clientName: 'Downtown Hypermarket Flagship',
    enabledModules: {
      storeOverview: true,
      cameraLiveView: true,
      produceBins: true,
      analyticsSettings: true,
      securityReview: true,
      staffAttendance: true
    },
    visibleCharts: {
      trafficDwellChart: true,
      produceFillAlerts: true,
      posSalesCorrelation: true
    },
    cameraControlsAllowed: true,
    themeCustomization: {
      brandTitle: 'HYPERVISION PRO',
      primaryColor: '#2563eb'
    }
  },
  'STORE-02': {
    tenantId: 'TNT-002',
    storeId: 'STORE-02',
    clientName: 'Westside Megastore (Client Portal)',
    enabledModules: {
      storeOverview: true,
      cameraLiveView: true,
      produceBins: true,
      analyticsSettings: false, // Hidden for read-only client
      securityReview: false,    // Restricted security queue hidden for standard client
      staffAttendance: true
    },
    visibleCharts: {
      trafficDwellChart: true,
      produceFillAlerts: true,
      posSalesCorrelation: false
    },
    cameraControlsAllowed: false, // Read-only client view
    themeCustomization: {
      brandTitle: 'WESTSIDE RETAIL DASHBOARD',
      primaryColor: '#0d9488'
    }
  }
};

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'ATT-901',
    employeeId: 'EMP-104',
    employeeName: 'Carlos Ramirez',
    storeId: 'STORE-01',
    department: 'Produce & Fresh Foods',
    shiftDate: '2026-10-07',
    clockInTime: '08:02 AM',
    clockOutTime: '04:30 PM',
    breakDurationMinutes: 45,
    authMethod: 'Tablet PIN',
    status: 'Punctual',
    cameraOccupancySignal: 'Zone Occupied'
  },
  {
    id: 'ATT-902',
    employeeId: 'EMP-108',
    employeeName: 'Elena Rostova',
    storeId: 'STORE-01',
    department: 'Front End Cashiers',
    shiftDate: '2026-10-07',
    clockInTime: '09:18 AM',
    breakDurationMinutes: 30,
    authMethod: 'NFC Badge',
    status: 'Late Entry',
    cameraOccupancySignal: 'Zone Occupied'
  },
  {
    id: 'ATT-903',
    employeeId: 'EMP-112',
    employeeName: 'David Kim',
    storeId: 'STORE-01',
    department: 'Inventory & Receiving',
    shiftDate: '2026-10-07',
    clockInTime: '07:55 AM',
    breakDurationMinutes: 15,
    authMethod: 'Web Portal',
    status: 'On Break',
    cameraOccupancySignal: 'Zone Inactive'
  }
];

export const MOCK_SHIFTS: StaffShift[] = [
  {
    id: 'SHF-301',
    employeeId: 'EMP-104',
    employeeName: 'Carlos Ramirez',
    storeId: 'STORE-01',
    role: 'Produce Specialist',
    plannedStart: '08:00 AM',
    plannedEnd: '04:30 PM',
    approvedStatus: 'Approved'
  },
  {
    id: 'SHF-302',
    employeeId: 'EMP-108',
    employeeName: 'Elena Rostova',
    storeId: 'STORE-01',
    role: 'Head Cashier',
    plannedStart: '09:00 AM',
    plannedEnd: '05:30 PM',
    approvedStatus: 'Approved'
  }
];
