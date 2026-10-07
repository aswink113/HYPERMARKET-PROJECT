import React, { useState } from 'react';
import type { Store } from '../mockData';
import { Store as StoreIcon, Plus, MapPin, Video, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StoreManagementProps {
  stores: Store[];
  onAddStore: (store: Omit<Store, 'id' | 'cameraCount' | 'createdAt'>) => void;
  onSelectActiveStore: (storeId: string) => void;
  activeStoreId: string;
}

export const StoreManagement: React.FC<StoreManagementProps> = ({
  stores,
  onAddStore,
  onSelectActiveStore,
  activeStoreId
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country] = useState<string>('United States');
  const [address, setAddress] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('');
  const [managerEmail, setManagerEmail] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    onAddStore({
      name,
      code,
      city: city || 'Metropolis',
      country,
      address: address || '123 Hypermarket Way',
      status: 'active',
      managerName: managerName || 'Store Admin',
      managerEmail: managerEmail || 'admin@hypermarket.com'
    });

    confetti({ particleCount: 50, spread: 60 });
    setShowModal(false);
    setName('');
    setCode('');
    setAddress('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', borderLeft: '4px solid var(--success)' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 color="var(--success)" />
            Hypermarket Store Network & Multi-Location Management
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Admin portal to provision new store locations, configure camera feeds, and delegate manager access.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add New Store Branch
        </button>
      </div>

      {/* Store Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {stores.map((s) => {
          const isActive = s.id === activeStoreId;

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
                backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-card)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="badge badge-primary">{s.code}</span>
                  <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {s.status.toUpperCase()}
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', margin: '4px 0' }}>{s.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <MapPin size={14} /> {s.address}, {s.city}, {s.country}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--bg-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>IP Cameras</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={14} color="var(--primary)" /> {s.cameraCount} Streams
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Manager</div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{s.managerName}</div>
                </div>
              </div>

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

      {/* Add Store Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{ width: '480px', maxWidth: '90%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StoreIcon color="var(--primary)" /> Provision New Hypermarket Branch
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Street Address</label>
                <input
                  type="text"
                  placeholder="700 North Avenue"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Assigned Manager</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Manager Email</label>
                  <input
                    type="email"
                    placeholder="jane@hypermarket.com"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Store Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
