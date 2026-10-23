import React, { useState } from 'react';
import type { Camera, ProduceBin } from '../mockData';
import { Video, Eye, Settings, Play, Pause, RefreshCw, Maximize2, Layers, Flame } from 'lucide-react';

interface CameraLiveViewProps {
  cameras: Camera[];
  produceBins: ProduceBin[];
  onToggleCameraAnalytic?: (cameraId: string, analyticKey: keyof Camera['analyticsActive']) => void;
}

export const CameraLiveView: React.FC<CameraLiveViewProps> = ({ cameras, produceBins, onToggleCameraAnalytic }) => {
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || 'CAM-01');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showRegions, setShowRegions] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<boolean>(false);
  const [streamKey, setStreamKey] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>(() => new Date().toLocaleTimeString());

  // Keep live stream clock ticking continuously
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCamera = cameras.find(c => c.id === selectedCameraId) || cameras[0] || null;
  const cameraBins = produceBins.filter(b => activeCamera?.id ? b.cameraId === activeCamera.id : false);

  // Compute live visual stream URL
  const getCameraVisualUrl = (cam: Camera | null) => {
    if (!cam) return '';
    // If the stream URL is an RTSP stream, route through our Django real-time MJPEG proxy
    if (cam.streamUrl && cam.streamUrl.startsWith('rtsp://')) {
      return `http://127.0.0.1:8001/api/cameras/${cam.id}/stream/?t=${streamKey}`;
    }
    return cam.streamUrl || `http://127.0.0.1:8001/api/cameras/${cam.id}/stream/?t=${streamKey}`;
  };

  const handleSyncFeed = () => {
    setStreamError(false);
    setIsPlaying(true);
    setStreamKey(prev => prev + 1);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
            <Video size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>IP Camera Live Stream & Analytics Overlay</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              ONVIF Profile T High-Definition Stream Feed with Edge AI Bin Detection
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${showHeatmap ? 'btn-primary' : 'btn-outline'}`}
            style={showHeatmap ? { background: '#ea580c', borderColor: '#ea580c' } : {}}
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            <Flame size={16} />
            {showHeatmap ? 'Full-Body Heatmap ON' : 'Full-Body Heatmap OFF'}
          </button>

          <button 
            className={`btn ${showOverlays ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowOverlays(!showOverlays)}
          >
            <Layers size={16} />
            {showOverlays ? 'Overlays ON' : 'Overlays OFF'}
          </button>
          
          <button 
            className={`btn ${showRegions ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setShowRegions(!showRegions)}
          >
            <Eye size={16} />
            {showRegions ? 'Regions Visible' : 'Hide Bounding Boxes'}
          </button>

          <button 
            className="btn btn-outline"
            onClick={() => setFullScreen(!fullScreen)}
          >
            <Maximize2 size={16} />
            {fullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {!activeCamera || cameras.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '20px', background: 'var(--bg-subtle)', borderRadius: '50%', color: 'var(--text-muted)' }}>
            <Video size={48} />
          </div>
          <h3 style={{ fontSize: '18px', margin: 0 }}>No Cameras Connected Yet</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '440px', margin: 0 }}>
            No IP or RTSP camera streams have been linked to this store branch. You can connect a new camera stream via the "Link IP Cameras (ONVIF)" tab.
          </p>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: fullScreen ? '1fr' : '2fr 1fr', gap: '20px' }}>
        {/* Main Video Stream Container */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
          {/* Header info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`badge ${activeCamera.status === 'online' ? 'badge-success' : 'badge-warning'}`}>
                ● {activeCamera.status.toUpperCase()}
              </span>
              <strong style={{ fontSize: '15px' }}>{activeCamera.name}</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({activeCamera.ipAddress})</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>{activeCamera.resolution}</span>
              <span>•</span>
              <span>{activeCamera.fps} FPS</span>
              <span>•</span>
              <span>{activeCamera.codecs}</span>
            </div>
          </div>

          {/* Player Screen Frame */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '460px',
            backgroundColor: '#0f172a',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)'
          }}>
            {/* Stream Image */}
            <img 
              key={`${activeCamera.id}-${streamKey}`}
              src={streamError ? (activeCamera.posterUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80') : getCameraVisualUrl(activeCamera)} 
              alt={activeCamera.name}
              onLoad={() => setStreamError(false)}
              onError={() => {
                console.warn('Real camera stream failed or reconnecting, falling back to snapshot/poster');
                setStreamError(true);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isPlaying ? 'none' : 'brightness(0.7) blur(1px)'
              }}
            />

            {/* Bounding Box Overlays */}
            {showRegions && showOverlays && cameraBins.map((bin) => {
              const statusColors: Record<string, string> = {
                OK: '#10b981',
                LOW: '#f59e0b',
                LIKELY_EMPTY: '#ef4444',
                VIEW_BLOCKED: '#64748b'
              };
              const color = statusColors[bin.status] || '#2563eb';
              const p = bin.polygonPoints[0] || { x: 10, y: 10 };
              
              return (
                <div 
                  key={bin.id}
                  style={{
                    position: 'absolute',
                    top: `${p.y}%`,
                    left: `${p.x}%`,
                    width: '32%',
                    height: '35%',
                    border: `2px dashed ${color}`,
                    borderRadius: '8px',
                    backgroundColor: `${color}22`,
                    boxShadow: `0 0 12px ${color}66`,
                    padding: '8px',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    pointerEvents: 'none',
                    backdropFilter: 'blur(2px)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', background: color, padding: '2px 6px', borderRadius: '4px' }}>
                      {bin.id} - {bin.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '11px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                      {bin.fillPercentage}% Fill
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                      {bin.name}
                    </p>
                    <div style={{ fontSize: '10px', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Conf: {(bin.confidence * 100).toFixed(0)}%</span>
                      <span>~{bin.estVisibleWeightKg} kg</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Full-Body Thermal Heatmap Overlay */}
            {showHeatmap && (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  zIndex: 2,
                  mixBlendMode: 'screen',
                  overflow: 'hidden'
                }}
              >
                {/* Thermal color map gradient simulation across scene zones */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 45% 65%, rgba(239, 68, 68, 0.45) 0%, rgba(249, 115, 22, 0.35) 25%, rgba(234, 179, 8, 0.25) 45%, rgba(34, 197, 94, 0.15) 60%, rgba(59, 130, 246, 0.08) 80%, transparent 100%)',
                  opacity: 0.85
                }} />

                {/* Body 1 Thermal Signature Blob (Center Active Traffic Zone) */}
                <div style={{
                  position: 'absolute',
                  top: '42%',
                  left: '42%',
                  width: '160px',
                  height: '240px',
                  borderRadius: '50% 50% 45% 45%',
                  background: 'radial-gradient(ellipse at center, rgba(255, 0, 0, 0.6) 0%, rgba(255, 130, 0, 0.5) 30%, rgba(255, 220, 0, 0.35) 55%, rgba(0, 180, 255, 0.2) 75%, transparent 100%)',
                  filter: 'blur(12px)',
                  transform: 'rotate(-3deg)'
                }} />

                {/* Body 2 Thermal Signature Blob (Right Walkway Zone) */}
                <div style={{
                  position: 'absolute',
                  top: '48%',
                  left: '52%',
                  width: '120px',
                  height: '200px',
                  borderRadius: '50% 50% 40% 40%',
                  background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.5) 0%, rgba(245, 158, 11, 0.4) 35%, rgba(16, 185, 129, 0.2) 65%, transparent 100%)',
                  filter: 'blur(14px)'
                }} />

                {/* High Density Heat Spot (Vending / Doorway Entry) */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '30%',
                  width: '130px',
                  height: '180px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(220, 38, 38, 0.45) 0%, rgba(251, 146, 60, 0.3) 40%, rgba(59, 130, 246, 0.1) 75%, transparent 100%)',
                  filter: 'blur(16px)'
                }} />

                {/* Thermal Color Scale Bar Legend */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(6px)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  color: 'white',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <Flame size={13} color="#f97316" /> Full-Body Thermal Intensity
                  </div>
                  <div style={{
                    width: '130px',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'linear-gradient(to right, #3b82f6, #10b981, #eab308, #f97316, #ef4444, #ffffff)'
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8' }}>
                    <span>Low Flow</span>
                    <span>Med Dwell</span>
                    <span>High Heat</span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Watermark & Rec Indicator */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', alignItems: 'center', zIndex: 3 }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.85)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white', display: 'inline-block' }} className="alert-pulse" />
                LIVE RTSP STREAM
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', color: '#94a3b8', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                {currentTime}
              </div>
            </div>

            {/* Video Controls Bar overlay at bottom */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Stream Quality: 1080p60</span>
              <button 
                onClick={handleSyncFeed} 
                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
              >
                <RefreshCw size={14} /> Sync Feed
              </button>
            </div>
          </div>
        </div>

        {/* Camera Selector & Toggle Settings Panel */}
        {!fullScreen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Camera Picker */}
            <div className="card">
              <h3 style={{ fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={18} color="var(--primary)" />
                Select Camera Feed
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cameras.map(cam => (
                  <div
                    key={cam.id}
                    onClick={() => setSelectedCameraId(cam.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedCameraId === cam.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      backgroundColor: selectedCameraId === cam.id ? 'var(--primary-light)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: selectedCameraId === cam.id ? 'var(--primary)' : 'var(--text-main)' }}>
                        {cam.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {cam.location}
                      </div>
                    </div>
                    <span className={`badge ${cam.status === 'online' ? 'badge-success' : 'badge-warning'}`}>
                      {cam.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-Camera Analytics Toggle Controls */}
            <div className="card">
              <h3 style={{ fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} color="var(--primary)" />
                Active Analytics for {activeCamera.id}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Turn individual edge vision algorithms ON/OFF specifically for this camera stream.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'peopleTracking', label: 'Customer Dwell & Flow', desc: 'Track visitor traffic counts & time' },
                  { key: 'produceAvailability', label: 'Produce Fill Estimation', desc: 'Scan bin fill % and empty alerts' },
                  { key: 'queueDetection', label: 'Checkout Queue Watch', desc: 'Monitor line lengths & wait times' },
                  { key: 'safetyMonitoring', label: 'Safety Hazard Spotting', desc: 'Spill & path obstacle detection' },
                  { key: 'lossPrevention', label: 'Security Cue Flagging', desc: 'Human-reviewed item concealment' },
                ].map((item) => {
                  const key = item.key as keyof Camera['analyticsActive'];
                  const isChecked = activeCamera.analyticsActive[key];

                  return (
                    <div 
                      key={key} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isChecked ? 'var(--bg-subtle)' : 'transparent',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>

                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {
                            if (onToggleCameraAnalytic) {
                              onToggleCameraAnalytic(activeCamera.id, key);
                            }
                          }}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
