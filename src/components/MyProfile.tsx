import React, { useState } from 'react';
import type { UserProfile, Store } from '../mockData';
import { User, Shield, Key, CheckCircle2, Save } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MyProfileProps {
  user: UserProfile;
  stores: Store[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSwitchUserRole: (role: UserProfile['role']) => void;
}

export const MyProfile: React.FC<MyProfileProps> = ({
  user,
  stores,
  onUpdateProfile,
  onSwitchUserRole
}) => {
  const [name, setName] = useState<string>(user.name);
  const [phone, setPhone] = useState<string>(user.phone);
  const [department, setDepartment] = useState<string>(user.department);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, phone, department });
    confetti({ particleCount: 40, spread: 50 });
  };

  const assignedStore = stores.find(s => s.id === user.assignedStoreId);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Profile Header Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src={user.avatar} 
            alt={user.name} 
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '22px', margin: 0 }}>{user.name}</h2>
              <span className={`badge ${user.role === 'super_admin' ? 'badge-danger' : 'badge-primary'}`}>
                {user.role.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {user.email} • {user.department}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Assigned Access Scope: <strong>{user.assignedStoreId === 'ALL' ? 'All Network Stores (Global)' : assignedStore?.name || user.assignedStoreId}</strong>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher for Demonstration */}
        <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>DEMO: SIMULATE USER ROLE</div>
          <select 
            value={user.role} 
            onChange={(e) => onSwitchUserRole(e.target.value as UserProfile['role'])}
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
          >
            <option value="super_admin">Super Administrator (Full Network Access)</option>
            <option value="store_manager">Store Manager (Single Store Access)</option>
            <option value="lp_reviewer">Loss Prevention Officer (Security Queue)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Profile Edit Details Form */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User color="var(--primary)" size={18} /> Edit Account Details & Credentials
          </h3>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Department / Organization</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
              />
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={16} color="var(--primary)" /> Change Password
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Security & Access Rights Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 style={{ fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--primary)" /> Active Permissions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {user.permissions.map((p) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: '4px' }}>
                  <CheckCircle2 size={14} color="var(--success)" />
                  <span style={{ fontWeight: 500 }}>{p.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: '#f8fafc' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>Account Security Log</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>• Joined: <strong>{user.joinedDate}</strong></div>
              <div>• MFA Auth: <strong style={{ color: 'var(--success)' }}>Enforced (Hardware Key)</strong></div>
              <div>• Session IP: <strong>192.168.10.45</strong></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
