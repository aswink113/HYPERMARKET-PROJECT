import React, { useState } from 'react';
import type { Camera, Store } from '../mockData';
import { Video, Plus, Link, Network, Trash2, Edit } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CameraLinkingProps {
  cameras: Camera[];
  stores: Store[];
  onAddCamera: (camera: Omit<Camera, 'id' | 'lastHeartbeat'>) => void;
  onEditCamera?: (cameraId: string, updatedData: Partial<Camera>) => void;
  onDeleteCamera: (cameraId: string) => void;
}

export const CameraLinking: React.FC<CameraLinkingProps> = ({
  cameras,
  stores,
  onAddCamera,
  onEditCamera,
  onDeleteCamera
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCameraId, setEditingCameraId] = useState<string | null>(null);

  const [name, setName] = useState<string>('');
  const [storeId, setStoreId] = useState<string>(stores[0]?.id || '');

  React.useEffect(() => {
    if (stores.length > 0) {
      if (!storeId || !stores.some(s => s.id === storeId)) {
        setStoreId(stores[0].id);
      }
    }
  }, [stores, storeId]);

  const [location, setLocation] = useState<string>('');
  const [ipAddress, setIpAddress] = useState<string>('');
  const [rtspPort, setRtspPort] = useState<string>('554');
  const [cameraUsername, setCameraUsername] = useState<string>('admin');
  const [cameraPassword, setCameraPassword] = useState<string>('');
  const [streamPath, setStreamPath] = useState<string>('/Streaming/Channels/101');
  const [resolution] = useState<string>('1080p (1920x1080)');
  const [fps] = useState<number>(30);
  const [fov] = useState<string>('110° Wide Angle');
  const [retentionDays] = useState<number>(14);

  const openAddModal = () => {
    setEditingCameraId(null);
    setName('');
    setLocation('');
    setIpAddress('');
    setRtspPort('554');
    setCameraUsername('admin');
    setCameraPassword('');
    setStreamPath('/Streaming/Channels/101');
    setShowModal(true);
  };

  const openEditModal = (cam: Camera) => {
    setEditingCameraId(cam.id);
    setName(cam.name);
    setLocation(cam.location);
    setStoreId(cam.storeId);
    setIpAddress(cam.ipAddress || '');
    setRtspPort(cam.rtspPort || '554');
    setCameraUsername(cam.cameraUsername || 'admin');
    setCameraPassword(cam.cameraPassword || '');
    setStreamPath(cam.streamPath || '/Streaming/Channels/101');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !ipAddress) return;

    // Construct exact RTSP stream URL with credentials, host, port, and stream path
    const auth = cameraUsername && cameraPassword ? `${encodeURIComponent(cameraUsername)}:${encodeURIComponent(cameraPassword)}@` : '';
    const formattedPath = streamPath.startsWith('/') ? streamPath : `/${streamPath}`;
    const finalStreamUrl = `rtsp://${auth}${ipAddress.trim()}:${rtspPort.trim() || '554'}${formattedPath}`;

    if (editingCameraId && onEditCamera) {
      onEditCamera(editingCameraId, {
        name,
        location,
        storeId,
        ipAddress: ipAddress.trim(),
        rtspPort: rtspPort.trim() || '554',
        streamPath: streamPath.trim() || '/Streaming/Channels/101',
        cameraUsername: cameraUsername.trim(),
        cameraPassword: cameraPassword.trim(),
        streamUrl: finalStreamUrl,
        posterUrl: finalStreamUrl
      });
    } else {
      onAddCamera({
        name,
        location,
        storeId,
        status: 'online',
        ipAddress: ipAddress.trim(),
        rtspPort: rtspPort.trim() || '554',
        streamPath: streamPath.trim() || '/Streaming/Channels/101',
        cameraUsername: cameraUsername.trim(),
        cameraPassword: cameraPassword.trim(),
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
        streamUrl: finalStreamUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        posterUrl: finalStreamUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'
      });
    }

    setShowModal(false);
    confetti({ particleCount: 50, spread: 60 });
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
          onClick={openAddModal}
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
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', color: 'var(--primary)', borderColor: 'var(--border-light)' }}
                          onClick={() => openEditModal(cam)}
                          title="Edit Camera Configuration"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', color: 'var(--danger)', borderColor: 'var(--border-light)' }}
                          onClick={() => onDeleteCamera(cam.id)}
                          title="Unlink Camera"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{ width: '540px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', margin: 'auto' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video color="var(--primary)" /> {editingCameraId ? `Edit IP Camera Setup (${editingCameraId})` : 'Provision & Link IP Hardware Camera'}
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
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--border-medium)', 
                      fontSize: '13px', 
                      background: '#ffffff',
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    {stores.length === 0 ? (
                      <option value="">No stores available - Add store first</option>
                    ) : (
                      stores.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code || s.id})</option>
                      ))
                    )}
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

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>IP Camera Host / IP Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="192.168.0.199 or hostname"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>RTSP Port</label>
                  <input
                    type="text"
                    placeholder="554"
                    value={rtspPort}
                    onChange={(e) => setRtspPort(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* ONVIF / RTSP IP Camera Authentication */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                  <span>ONVIF / RTSP Camera Credentials</span>
                  <span className="badge badge-success" style={{ fontSize: '10px' }}>Auth Enabled</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Camera Username</label>
                    <input
                      type="text"
                      placeholder="admin"
                      value={cameraUsername}
                      onChange={(e) => setCameraUsername(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Camera Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={cameraPassword}
                      onChange={(e) => setCameraPassword(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#ffffff' }}
                    />
                  </div>
                </div>
              </div>

              {/* Stream Path Quick Presets */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>RTSP Stream Path</label>
                <input
                  type="text"
                  placeholder="/Streaming/Channels/101"
                  value={streamPath}
                  onChange={(e) => setStreamPath(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', marginBottom: '6px' }}
                />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setStreamPath('/Streaming/Channels/101')}
                    className="btn btn-outline"
                    style={{ fontSize: '11px', padding: '4px 8px', background: streamPath === '/Streaming/Channels/101' ? '#eff6ff' : 'transparent', borderColor: streamPath === '/Streaming/Channels/101' ? 'var(--primary)' : 'var(--border-medium)' }}
                  >
                    Hikvision Main (/Streaming/Channels/101)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStreamPath('/Streaming/Channels/102')}
                    className="btn btn-outline"
                    style={{ fontSize: '11px', padding: '4px 8px', background: streamPath === '/Streaming/Channels/102' ? '#eff6ff' : 'transparent', borderColor: streamPath === '/Streaming/Channels/102' ? 'var(--primary)' : 'var(--border-medium)' }}
                  >
                    Hikvision Sub (/Streaming/Channels/102)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStreamPath('/cam/realmonitor?channel=1&subtype=0')}
                    className="btn btn-outline"
                    style={{ fontSize: '11px', padding: '4px 8px', background: streamPath.includes('realmonitor') ? '#eff6ff' : 'transparent', borderColor: streamPath.includes('realmonitor') ? 'var(--primary)' : 'var(--border-medium)' }}
                  >
                    Dahua / CP PLUS
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Direct Full RTSP / HTTP URL (Computed Source)</label>
                <input
                  type="text"
                  readOnly
                  value={
                    ipAddress.trim()
                      ? `rtsp://${cameraUsername && cameraPassword ? `${cameraUsername}:${cameraPassword}@` : ''}${ipAddress.trim()}:${rtspPort || '554'}${streamPath.startsWith('/') ? streamPath : '/' + streamPath}`
                      : 'rtsp://admin:pass@192.168.0.199:554/Streaming/Channels/101'
                  }
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#f1f5f9', color: '#334155', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCameraId ? 'Save Camera Changes' : 'Link Camera Hardware'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
