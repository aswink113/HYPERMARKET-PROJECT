export * from './types/store';
export * from './types/attendance';
export * from './types/user';

import type { TenantConfig, AttendanceRecord, StaffShift } from './types';

export const MOCK_TENANT_CONFIGS: Record<string, TenantConfig> = {};
export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [];
export const MOCK_SHIFTS: StaffShift[] = [];
