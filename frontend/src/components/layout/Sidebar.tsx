import React from 'react';
import { LayoutDashboard, Video, ShoppingBag, Sliders, ShieldAlert, Building2, Link, User, Sparkles, LogOut, Clock, Layers } from 'lucide-react';
import type { UserProfile, Store } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingSecurityCount: number;
  lowStockBinCount: number;
  currentUser: UserProfile;
  stores: Store[];
  activeStoreId: string;
  onSelectActiveStore: (storeId: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingSecurityCount,
  lowStockBinCount,
  currentUser,
  stores,
  activeStoreId,
  onSelectActiveStore,
  onLogout
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';

  const menuItems = [
    { id: 'overview', label: 'Store Overview', icon: LayoutDashboard },
    { id: 'liveView', label: 'Live Cameras & Vision', icon: Video },
    { id: 'produceBins', label: 'Produce Bins', icon: ShoppingBag, badge: lowStockBinCount > 0 ? lowStockBinCount : undefined, badgeColor: 'var(--warning)' },
    { id: 'staffAttendance', label: 'Staff Attendance', icon: Clock },
    { id: 'masterData', label: 'Master Data', icon: Layers },
    { id: 'storeManagement', label: 'Store Management', icon: Building2 },
    { id: 'cameraLinking', label: 'Camera Linking', icon: Link },
    { id: 'analyticsSettings', label: 'Analytics Settings', icon: Sliders },
    { id: 'securityReview', label: 'Security Review', icon: ShieldAlert, badge: pendingSecurityCount > 0 ? pendingSecurityCount : undefined, badgeColor: 'var(--danger)' },
    { id: 'myProfile', label: 'My Profile', icon: User }
  ];

  return (
    <aside className="sidebar">
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Sparkles size={18} />
        </div>
        <div>
          <h1 style={{ fontSize: '16px', margin: 0, fontWeight: 700 }}>HyperVision</h1>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Multi-Store Vision AI</div>
        </div>
      </div>

      {/* Store Filter / Context Switcher */}
      <div style={{ padding: '0 12px 12px 12px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Current Branch Scope
        </label>
        <select
          value={activeStoreId}
          onChange={(e) => onSelectActiveStore(e.target.value)}
          style={{
            width: '100%',
            marginTop: '4px',
            padding: '6px 8px',
            fontSize: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-main)',
            color: 'var(--text-main)',
            fontWeight: 500,
            cursor: 'pointer'
          }}
          disabled={!isSuperAdmin && currentUser.assignedStoreId !== 'ALL'}
        >
          {isSuperAdmin && <option value="ALL">All Stores (Global Network)</option>}
          {stores.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      <nav className="nav-menu">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                border: 'none',
                background: isActive ? 'var(--bg-subtle)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span style={{
                  background: item.badgeColor || 'var(--primary)',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '10px',
                  fontWeight: 700
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout button at bottom */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', marginTop: 'auto' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 12px',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--danger)',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
