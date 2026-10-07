import React from 'react';
import { LayoutDashboard, Video, ShoppingBag, Sliders, ShieldAlert, Building2, Link, User, Sparkles, LogOut } from 'lucide-react';
import type { UserProfile, Store } from '../mockData';

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
    { id: 'liveView', label: 'Camera Live Streams', icon: Video },
    { id: 'produceBins', label: 'Produce Fill & Bins', icon: ShoppingBag, badge: lowStockBinCount > 0 ? lowStockBinCount : null, badgeColor: 'badge-warning' },
    { id: 'analyticsSettings', label: 'Analytics & Camera Rules', icon: Sliders },
    { id: 'securityReview', label: 'Security Review Queue', icon: ShieldAlert, badge: pendingSecurityCount > 0 ? pendingSecurityCount : null, badgeColor: 'badge-danger' },
    
    // Admin Exclusive Features
    ...(isSuperAdmin ? [
      { id: 'storeManagement', label: 'Manage Stores & Branches', icon: Building2 },
      { id: 'cameraLinking', label: 'Link IP Cameras (ONVIF)', icon: Link }
    ] : []),

    { id: 'myProfile', label: 'My Profile & Account', icon: User }
  ];

  return (
    <div className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>HYPERVISION</h1>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Camera Analytics & Admin</div>
        </div>
      </div>

      {/* Store Branch Switcher Dropdown */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-subtle)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>SELECTED STORE CONTEXT</div>
        <select
          value={activeStoreId}
          onChange={(e) => onSelectActiveStore(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-medium)',
            fontSize: '12px',
            fontWeight: 600,
            background: 'white',
            color: 'var(--text-main)',
            outline: 'none'
          }}
        >
          {stores.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span className={`badge ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Footer & Logout */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{currentUser.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{currentUser.role.toUpperCase()}</div>
          </div>
        </div>

        <button 
          onClick={onLogout}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};
