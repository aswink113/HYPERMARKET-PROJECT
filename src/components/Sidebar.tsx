import React from 'react';
import { LayoutDashboard, Video, ShoppingBag, Sliders, ShieldAlert, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingSecurityCount: number;
  lowStockBinCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingSecurityCount,
  lowStockBinCount
}) => {
  const menuItems = [
    { id: 'overview', label: 'Store Overview', icon: LayoutDashboard },
    { id: 'liveView', label: 'Camera Live Streams', icon: Video },
    { id: 'produceBins', label: 'Produce Fill & Bins', icon: ShoppingBag, badge: lowStockBinCount > 0 ? lowStockBinCount : null, badgeColor: 'badge-warning' },
    { id: 'analyticsSettings', label: 'Analytics & Camera Rules', icon: Sliders },
    { id: 'securityReview', label: 'Security Review Queue', icon: ShieldAlert, badge: pendingSecurityCount > 0 ? pendingSecurityCount : null, badgeColor: 'badge-danger' },
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
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Camera Analytics & Operations</div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
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
                fontSize: '14px',
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

      {/* User / Store Info Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-subtle)' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>STORE #104 - DOWNTOWN</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ONVIF Profile T Connected</div>
      </div>
    </div>
  );
};
