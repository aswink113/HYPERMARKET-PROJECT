import React, { useState } from 'react';
import type { Camera, Store } from '../mockData';
import { Video, Plus, Link, Network, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CameraLinkingProps {
  cameras: Camera[];
  stores: Store[];
  onAddCamera: (camera: Omit<Camera, 'id' | 'lastHeartbeat'>) => void;
  onDeleteCamera: (cameraId: string) => void;
}

export const CameraLinking: React.FC<CameraLinkingProps> = ({
  cameras,
  stores,
  onAddCamera,
  onDeleteCamera
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [storeId, setStoreId] = useState<string>(stores[0]?.id || 'STORE-01');
  const [location, setLocation] = useState<string>('');
  const [ipAddress, setIpAddress] = useState<string>('192.168.10.110');
  const [resolution, setResolution] = useState<string>('4K (3840x2160)');
  const [fps] = useState<number>(30);
  const [fov] = useState<string>('110° Wide Angle');
  const [retentionDays] = useState<number>(14);
  const [streamUrl, setStreamUrl] = useState<string>('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    onAddCamera({
      name,
      location,
      storeId,
      status: 'online',
      ipAddress,
      resolution,
      fps,
      fov,
      retentionDays,
      codecs: 'H.265 / RTSP ONVIF Profile T',
      analyticsActive: {
        peopleTracking: true,
        produceAvailability: true,
        queueDetection: false,
        safetyMonitoring: false,
        lossPrevention: false
      },
      streamUrl,
      posterUrl: streamUrl,
      configuredRegions: 3
    });

    confetti({ particleCount: 50, spread: 60 });
    setShowModal(false);
    setName('');
    setLocation('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', borderLeft: '4px solid var(--primary)' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link color="var(--primary)" />
            IP Camera Provisioning & RTSP / ONVIF Integration
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Link new hardware security streams, map camera regions, and set retention schedules per store branch.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Link New IP Camera
        </button>
      </div>

      {/* Linked Cameras Table */}
      <div className="card">
        <h3 style={{ fontSize: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Network size={18} color="var(--primary)" /> Registered Hardware Cameras ({cameras.length})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '12px', fontWeight: 600 }}>Camera Name / ID</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Assigned Store</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>IP & Stream Protocol</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Resolution / FPS</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Retention</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cameras.map((cam) => {
                const store = stores.find(s => s.id === cam.storeId);

                return (
                  <tr key={cam.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cam.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cam.location}</div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-primary">{store?.name || cam.storeId}</span>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>{cam.ipAddress}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cam.codecs}</div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div>{cam.resolution}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cam.fps} FPS • {cam.fov}</div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <strong>{cam.retentionDays} Days</strong>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${cam.status === 'online' ? 'badge-success' : 'badge-warning'}`}>
                        {cam.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', color: 'var(--danger)', borderColor: 'var(--border-light)' }}
                        onClick={() => onDeleteCamera(cam.id)}
                        title="Unlink Camera"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Camera Modal */}
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
          <div className="card animate-fade-in" style={{ width: '520px', maxWidth: '90%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video color="var(--primary)" /> Provision & Link IP Hardware Camera
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Camera Identifier / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAM-05: Bakery & Produce Overhead"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Assign Store Location *</label>
                  <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
                  >
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Physical Location / Zone *</label>
                  <input
                    type="text"
                    required
                    placeholder="Produce Aisle B"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Camera IP Address</label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Resolution & FPS</label>
                  <input
                    type="text"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>RTSP Stream URL / Video Source</label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Link Camera Hardware
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
