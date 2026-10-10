import React, { useState } from 'react';
import type { AttendanceRecord, StaffShift } from '../saasData';
import { Clock, UserCheck, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StaffAttendanceProps {
  records: AttendanceRecord[];
  shifts: StaffShift[];
  onAddClockEvent: (event: Omit<AttendanceRecord, 'id'>) => void;
}

export const StaffAttendance: React.FC<StaffAttendanceProps> = ({ records, onAddClockEvent }) => {
  const [employeeId, setEmployeeId] = useState<string>('EMP-104');
  const [employeeName, setEmployeeName] = useState<string>('Carlos Ramirez');
  const [authMethod, setAuthMethod] = useState<AttendanceRecord['authMethod']>('Tablet PIN');

  const handleClockIn = () => {
    onAddClockEvent({
      employeeId,
      employeeName,
      storeId: 'STORE-01',
      department: 'Produce & Fresh Foods',
      shiftDate: new Date().toISOString().split('T')[0],
      clockInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      breakDurationMinutes: 0,
      authMethod,
      status: 'Punctual',
      cameraOccupancySignal: 'Zone Occupied'
    });

    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Policy Safeguard Banner from PDF Addendum Section 1 & 4 */}
      <div className="card" style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <ShieldCheck color="#059669" size={24} style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '15px', color: '#065f46', margin: 0 }}>
              SaaS Staff Attendance — Authoritative Credentialed Source of Truth
            </h3>
            <p style={{ fontSize: '13px', color: '#047857', marginTop: '4px', margin: 0 }}>
              Attendance is strictly driven by authenticated staff clock events (Tablet PIN, Web Portal, Badge). IP cameras provide optional anonymous occupancy signals and <strong>never automatic identity matching or automatic time deductions</strong> (PDF Addendum Section 1 & 4).
            </p>
          </div>
        </div>
      </div>

      {/* Clock Terminal & Shift Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* Authoritative Kiosk Terminal Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock color="var(--primary)" size={18} /> Store Time Kiosk Terminal
          </h3>

          <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CURRENT SERVER TIMESTAMP</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--primary)' }}>
              {new Date().toLocaleTimeString()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Canonical Time Zone: UTC-05:00 (Store Terminal #1)
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Select Employee</label>
              <select
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  setEmployeeName(e.target.value === 'EMP-104' ? 'Carlos Ramirez' : 'Elena Rostova');
                }}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
              >
                <option value="EMP-104">EMP-104: Carlos Ramirez (Produce)</option>
                <option value="EMP-108">EMP-108: Elena Rostova (Cashier)</option>
                <option value="EMP-112">EMP-112: David Kim (Inventory)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Punch Authentication Method</label>
              <select
                value={authMethod}
                onChange={(e) => setAuthMethod(e.target.value as AttendanceRecord['authMethod'])}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
              >
                <option value="Tablet PIN">Store Kiosk PIN Attestation</option>
                <option value="NFC Badge">Hardware NFC Badge Scan</option>
                <option value="Web Portal">Authenticated Web Portal</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-primary" style={{ padding: '12px', background: '#10b981' }} onClick={handleClockIn}>
                CLOCK IN PUNCH
              </button>
              <button className="btn btn-secondary" style={{ padding: '12px' }}>
                START BREAK
              </button>
            </div>
          </div>
        </div>

        {/* Live Attendance Log & Camera Occupancy Alignment */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck color="var(--primary)" size={18} /> Today's Staff Timesheet & Camera Occupancy Signal
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Employee</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Clock In / Out</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Auth Method</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Camera Signal</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rec.employeeName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rec.department}</div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 'bold' }}>{rec.clockInTime}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Out: {rec.clockOutTime || 'Active Shift'}</div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-primary">{rec.authMethod}</span>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${
                        rec.status === 'Punctual' ? 'badge-success' : 
                        rec.status === 'Late Entry' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {rec.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: rec.cameraOccupancySignal === 'Zone Occupied' ? 'var(--success)' : 'var(--text-muted)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: rec.cameraOccupancySignal === 'Zone Occupied' ? 'var(--success)' : 'var(--text-muted)' }} />
                        {rec.cameraOccupancySignal}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
