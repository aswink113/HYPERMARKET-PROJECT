import React from 'react';
import { Database, Search, Bell } from 'lucide-react';
import type { UserProfile } from '../../types';

interface HeaderProps {
  activeTab: string;
  dbConnected: boolean;
  pendingSecurityCount: number;
  currentUser: UserProfile;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  dbConnected,
  pendingSecurityCount,
  currentUser,
  onNavigateTab
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Store Overview Dashboard';
      case 'liveView':
        return 'Camera Live Feeds & Controls';
      case 'produceBins':
        return 'Produce Bins & Display Availability';
      case 'analyticsSettings':
        return 'Analytics & Edge AI Settings';
      case 'securityReview':
        return 'Restricted Loss-Prevention Review';
      case 'staffAttendance':
        return 'Staff Attendance & Time Kiosk';
      case 'masterData':
        return 'Store Master Data Management (Departments & Designations)';
      case 'storeManagement':
        return 'Multi-Store Branch & SaaS Client Admin';
      case 'cameraLinking':
        return 'Hardware Camera Linking & ONVIF Setup';
      case 'myProfile':
        return 'User Profile & Security Settings';
      default:
        return 'HyperVision Analytics Portal';
    }
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', margin: 0 }}>
          {getTabTitle()}
        </h2>

        {/* PostgreSQL Live DB Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          background: dbConnected ? '#f0fdf4' : '#eff6ff',
          border: `1px solid ${dbConnected ? '#bbf7d0' : '#bfdbfe'}`,
          color: dbConnected ? '#166534' : '#1e40af',
          fontSize: '11px',
          fontWeight: 600
        }}>
          <Database size={13} color={dbConnected ? '#16a34a' : '#2563eb'} />
          <span>{dbConnected ? 'PostgreSQL: ipcamera (Live)' : 'Database Connected'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search cameras, SKU, or alerts..." 
            style={{
              padding: '7px 12px 7px 34px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
              fontSize: '13px',
              outline: 'none',
              width: '240px',
              background: 'var(--bg-subtle)'
            }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => onNavigateTab('securityReview')}>
          <Bell size={20} color="var(--text-muted)" />
          {pendingSecurityCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--danger)',
              color: 'white',
              borderRadius: '50%',
              width: '14px',
              height: '14px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {pendingSecurityCount}
            </span>
          )}
        </div>

        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', borderLeft: '1px solid var(--border-light)', cursor: 'pointer' }}
          onClick={() => onNavigateTab('myProfile')}
        >
          <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ fontSize: '12px' }}>
            <div style={{ fontWeight: 600 }}>{currentUser.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{currentUser.role.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
