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

export interface TrackedUnknownPerson {
  personKey: string;
  firstSeen: string;
  lastSeen: string;
  scanCount: number;
  latestSnapshot: string;
  snapshots: string[];
  embedding?: number[];
}
