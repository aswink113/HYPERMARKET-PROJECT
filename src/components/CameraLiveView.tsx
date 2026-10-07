import React, { useState } from 'react';
import type { Camera, ProduceBin } from '../mockData';
import { Video, Eye, Settings, Play, Pause, RefreshCw, Maximize2, Layers } from 'lucide-react';

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
  const [fullScreen, setFullScreen] = useState<boolean>(false);

  const activeCamera = cameras.find(c => c.id === selectedCameraId) || cameras[0];
  const cameraBins = produceBins.filter(b => b.cameraId === activeCamera.id);

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              src={activeCamera.streamUrl} 
              alt={activeCamera.name}
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

            {/* Live Watermark & Rec Indicator */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                {new Date().toLocaleTimeString()}
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
                onClick={() => setIsPlaying(true)} 
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
    </div>
  );
};
