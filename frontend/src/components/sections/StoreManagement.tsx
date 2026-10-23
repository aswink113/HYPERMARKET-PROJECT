import React, { useState } from 'react';
import type { Store } from '../mockData';
import type { TenantConfig } from '../saasData';
import {
  Store as StoreIcon,
  Plus,
  MapPin,
  Building2,
  Sliders,
  Edit3,
  Trash2,
  KeyRound,
  UserCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StoreManagementProps {
  stores: Store[];
  tenantConfigs: Record<string, TenantConfig>;
  onAddStore: (store: Omit<Store, 'id' | 'cameraCount' | 'createdAt'>) => void;
  onEditStore: (store: Store) => void;
  onDeleteStore: (storeId: string) => void;
  onSelectActiveStore: (storeId: string) => void;
  onUpdateTenantConfig: (storeId: string, updatedConfig: Partial<TenantConfig>) => void;
  onQuickLoginAsClient?: (usernameOrEmail: string) => void;
  activeStoreId: string;
}

export const StoreManagement: React.FC<StoreManagementProps> = ({
  stores,
  tenantConfigs,
  onAddStore,
  onEditStore,
  onDeleteStore,
  onSelectActiveStore,
  onUpdateTenantConfig,
  onQuickLoginAsClient,
  activeStoreId
}) => {
  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null);

  // Form states for Add / Edit
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('United States');
  const [address, setAddress] = useState<string>('');
  const [status, setStatus] = useState<Store['status']>('active');
  const [managerName, setManagerName] = useState<string>('');
  const [managerEmail, setManagerEmail] = useState<string>('');
  const [clientUsername, setClientUsername] = useState<string>('');
  const [clientPassword, setClientPassword] = useState<string>('');

  // UI helpers
  const [showCardPasswords, setShowCardPasswords] = useState<Record<string, boolean>>({});
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);
  const [showFormPassword, setShowFormPassword] = useState<boolean>(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const openAddModal = () => {
    setName('');
    setCode('');
    setCity('');
    setCountry('');
    setAddress('');
    setStatus('active');
    setManagerName('');
    setManagerEmail('');
    setClientUsername('');
    setClientPassword('');
    setShowFormPassword(false);
    setShowAddModal(true);
  };

  const openEditModal = (s: Store) => {
    setEditingStore(s);
    setName(s.name);
    setCode(s.code);
    setCity(s.city);
    setCountry(s.country);
    setAddress(s.address);
    setStatus(s.status);
    setManagerName(s.managerName);
    setManagerEmail(s.managerEmail);
    setClientUsername(s.clientUsername || `client_${s.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
    setClientPassword(s.clientPassword || 'password123');
    setShowFormPassword(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    onAddStore({
      name,
      code,
      city: city || 'Metropolis',
      country,
      address: address || '123 Hypermarket Way',
      status,
      managerName: managerName || 'Store Admin',
      managerEmail: managerEmail || `${code.toLowerCase()}@hypermarket.com`,
      clientUsername: clientUsername || `client_${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      clientPassword: clientPassword || generateRandomPassword()
    });

    confetti({ particleCount: 50, spread: 60 });
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore || !name || !code) return;

    onEditStore({
      ...editingStore,
      name,
      code,
      city,
      country,
      address,
      status,
      managerName,
      managerEmail,
      clientUsername,
      clientPassword
    });

    confetti({ particleCount: 40, spread: 50 });
    setEditingStore(null);
  };

  const handleConfirmDelete = () => {
    if (deletingStoreId) {
      onDeleteStore(deletingStoreId);
      setDeletingStoreId(null);
    }
  };

  const togglePasswordVisibility = (storeId: string) => {
    setShowCardPasswords(prev => ({ ...prev, [storeId]: !prev[storeId] }));
  };

  const handleCopyCredentials = (s: Store) => {
    const textToCopy = `HYPERVISION CLIENT PORTAL\nStore: ${s.name} (${s.code})\nUsername: ${s.clientUsername}\nPassword: ${s.clientPassword}\nManager Email: ${s.managerEmail}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedStoreId(s.id);
    setTimeout(() => {
      setCopiedStoreId(null);
    }, 2500);
  };

  const targetDeleteStore = stores.find(s => s.id === deletingStoreId);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', borderLeft: '4px solid var(--success)' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 color="var(--success)" />
            Hypermarket SaaS Tenant & Store Network Management
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Super Admin Portal: Provision store tenants, manage client login credentials, edit configurations, and delete branches.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openAddModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Provision New Client / Store
        </button>
      </div>

      {/* Store Cards Grid with SaaS Customizations, Credentials & Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {stores.map((s) => {
          const isActive = s.id === activeStoreId;
          const tenant = tenantConfigs[s.id] || {
            cameraControlsAllowed: true,
            enabledModules: { analyticsSettings: true, securityReview: true }
          };
          const isPasswordVisible = showCardPasswords[s.id] || false;
          const isCopied = copiedStoreId === s.id;

          return (
            <div
              key={s.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-card)',
                boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                {/* Header with badges & Edit / Dlt Action buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-primary">{s.code}</span>
                    <span className={`badge ${s.status === 'active' ? 'badge-success' : s.status === 'setup' ? 'badge-warning' : 'badge-danger'}`}>
                      {s.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => openEditModal(s)}
                      className="btn btn-outline"
                      style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Edit Store Details & Credentials"
                    >
                      <Edit3 size={13} color="var(--primary)" /> Edit
                    </button>
                    <button
                      onClick={() => setDeletingStoreId(s.id)}
                      className="btn btn-outline"
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--danger)',
                        borderColor: 'rgba(239, 68, 68, 0.3)'
                      }}
                      title="Delete Store Branch"
                    >
                      <Trash2 size={13} color="var(--danger)" /> Dlt
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', margin: '4px 0' }}>{s.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <MapPin size={14} /> {s.address}, {s.city}, {s.country}
                </div>
              </div>

              {/* Client Login Credentials Box */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #bfdbfe',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <KeyRound size={14} /> Client Portal Login Credentials
                  </div>

                  <button
                    onClick={() => handleCopyCredentials(s)}
                    className="btn btn-outline"
                    style={{
                      padding: '2px 8px',
                      fontSize: '11px',
                      background: isCopied ? 'var(--success)' : '#ffffff',
                      color: isCopied ? '#ffffff' : 'var(--text-main)',
                      borderColor: isCopied ? 'var(--success)' : '#bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Copy Login Details"
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>USERNAME / LOGIN ID</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{s.clientUsername || `client_${s.code.toLowerCase()}`}</span>
                  </div>

                  <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>PASSWORD</span>
                      <span style={{ fontWeight: 600, fontFamily: isPasswordVisible ? 'inherit' : 'monospace', color: '#0f172a' }}>
                        {isPasswordVisible ? (s.clientPassword || 'password123') : '••••••••'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(s.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                    >
                      {isPasswordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Manager: <strong>{s.managerName}</strong> ({s.managerEmail})</span>
                  {onQuickLoginAsClient && (
                    <button
                      onClick={() => onQuickLoginAsClient(s.clientUsername || s.managerEmail)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="Login as this client to view their dashboard"
                    >
                      <LogIn size={11} /> Test Login
                    </button>
                  )}
                </div>
              </div>

              {/* SaaS Client Feature Customization */}
              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={14} /> SaaS Client Feature Customization
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span>Camera Edit Rights:</span>
                  <button
                    className={`btn ${tenant.cameraControlsAllowed ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                    onClick={() => onUpdateTenantConfig(s.id, { cameraControlsAllowed: !tenant.cameraControlsAllowed })}
                  >
                    {tenant.cameraControlsAllowed ? 'Client Editable' : 'Locked (Dashboard Only)'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span>Analytics Tab:</span>
                  <button
                    className={`btn ${tenant.enabledModules.analyticsSettings ? 'btn-secondary' : 'btn-outline'}`}
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                    onClick={() => onUpdateTenantConfig(s.id, {
                      enabledModules: { ...tenant.enabledModules, analyticsSettings: !tenant.enabledModules.analyticsSettings }
                    })}
                  >
                    {tenant.enabledModules.analyticsSettings ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>

              {/* Footer Switch Context button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Added: {s.createdAt}</span>

                <button
                  className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => onSelectActiveStore(s.id)}
                >
                  {isActive ? 'Active Store' : 'Switch Context'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD STORE MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{ width: '520px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', margin: 'auto' }}>

            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StoreIcon color="var(--primary)" /> Provision New Hypermarket Branch & Client
            </h3>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Store Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro North Hypermarket"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Store Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="HYP-MN-04"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>City</label>
                  <input
                    type="text"
                    placeholder="Metropolis"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Store Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Store['status'])}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  >
                    <option value="active">Active (Operational)</option>
                    <option value="setup">Setup (Onboarding)</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Street Address</label>
                <input
                  type="text"
                  placeholder="700 North Avenue, Suite 100"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              {/* Client Login Credentials Section */}
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={16} /> Client Dashboard Login Credentials
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Client Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="client_username"
                      value={clientUsername}
                      onChange={(e) => setClientUsername(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 600 }}>Password *</label>
                      <button
                        type="button"
                        onClick={() => setClientPassword(generateRandomPassword())}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        <RefreshCw size={10} /> Auto-Gen
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={clientPassword}
                        onChange={(e) => setClientPassword(e.target.value)}
                        style={{ width: '100%', padding: '7px 30px 7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#ffffff' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showFormPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Manager Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Manager Email</label>
                    <input
                      type="email"
                      placeholder="jane@hypermarket.com"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#ffffff' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Provision Store & Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STORE MODAL */}
      {editingStore && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{ width: '520px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', margin: 'auto' }}>

            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 color="var(--primary)" /> Edit Store & Client Credentials ({editingStore.code})
            </h3>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Store Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Store Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Store Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Store['status'])}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  >
                    <option value="active">Active (Operational)</option>
                    <option value="setup">Setup (Onboarding)</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              {/* Client Login Credentials Edit Section */}
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KeyRound size={16} /> Update Client Dashboard Login Credentials
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Client Username *</label>
                    <input
                      type="text"
                      required
                      value={clientUsername}
                      onChange={(e) => setClientUsername(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 600 }}>Password *</label>
                      <button
                        type="button"
                        onClick={() => setClientPassword(generateRandomPassword())}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        <RefreshCw size={10} /> Auto-Gen
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        required
                        value={clientPassword}
                        onChange={(e) => setClientPassword(e.target.value)}
                        style={{ width: '100%', padding: '7px 30px 7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#ffffff' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showFormPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Manager Name</label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Manager Email</label>
                    <input
                      type="email"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#ffffff' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingStore(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingStoreId && targetDeleteStore && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{ width: '440px', maxWidth: '100%', padding: '24px', borderTop: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '50%', color: 'var(--danger)' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Delete Store Branch?</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Action cannot be undone</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Are you sure you want to delete <strong>{targetDeleteStore.name}</strong> ({targetDeleteStore.code})?
            </p>

            <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              ⚠️ This will revoke client credentials for <strong>{targetDeleteStore.clientUsername}</strong> and remove all associated camera allocations.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeletingStoreId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleConfirmDelete}
                style={{ background: 'var(--danger)', color: 'white' }}
              >
                Yes, Delete Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

