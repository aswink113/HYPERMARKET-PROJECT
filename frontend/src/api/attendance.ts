import { request } from './client';
import type { AttendanceRecord, TrackedUnknownPerson } from '../types';

export const attendanceApi = {
  getAttendance: () => request<AttendanceRecord[]>('/attendance/'),
  createAttendance: (data: Omit<AttendanceRecord, 'id'>) => 
    request<AttendanceRecord>('/attendance/', { method: 'POST', body: JSON.stringify(data) }),

  getUnknownFaces: () => request<TrackedUnknownPerson[]>('/unknown-faces/'),
  saveUnknownFace: (data: Partial<TrackedUnknownPerson>) => 
    request<TrackedUnknownPerson>('/unknown-faces/', { method: 'POST', body: JSON.stringify(data) }),
};
