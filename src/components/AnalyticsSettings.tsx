import React from 'react';
import type { AnalyticsToggle, Camera } from '../mockData';
import { Sliders, Shield, Cpu } from 'lucide-react';

interface AnalyticsSettingsProps {
  analyticsList: AnalyticsToggle[];
  cameras: Camera[];
  onToggleGlobalAnalytic: (id: string) => void;
  onToggleCameraAnalytic: (cameraId: string, analyticKey: keyof Camera['analyticsActive']) => void;
}

export const AnalyticsSettings: React.FC<AnalyticsSettingsProps> = ({
  analyticsList,
  cameras,
  onToggleGlobalAnalytic,
  onToggleCameraAnalytic
}) => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', borderLeft: '4px solid var(--primary)' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders color="var(--primary)" />
            Individual Analytics & Edge AI Controls
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Enable or disable specific computer vision modules across the hypermarket or configure fine-grained per-camera operational rules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>System Status</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--success)' }}>
              ● Edge Processing Nominal
            </div>
          </div>
        </div>
      </div>

      {/* Global Module Controls */}
      <div>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-main)' }}>
          1. Global Vision Pipeline Modules (Master Switches)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {analyticsList.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: item.enabled ? 'var(--primary-light)' : 'var(--bg-subtle)', color: item.enabled ? 'var(--primary)' : 'var(--text-light)' }}>
                      <Cpu size={18} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 600 }}>{item.name}</span>
                  </div>

                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={item.enabled} 
                      onChange={() => onToggleGlobalAnalytic(item.id)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {item.description}
                </p>

                {item.requiresReview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--warning)', background: 'var(--warning-light)', padding: '6px 10px', borderRadius: '4px', marginBottom: '8px' }}>
                    <Shield size={14} />
                    <span>Requires Staff Human Verification. No automated action taken.</span>
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Model: <strong style={{ color: 'var(--text-main)' }}>{item.model}</strong></span>
                <span>Accuracy: <strong style={{ color: 'var(--success)' }}>{item.accuracy}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Camera Matrix Grid */}
      <div className="card" style={{ marginTop: '10px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>
          2. Per-Camera Analytic Assignment Matrix
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          According to Project Scope (Section 2), not every camera view is suitable for every analytic task. Enable only matching analytics.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '12px', fontWeight: 600 }}>Camera Name & Location</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Customer Dwell</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Produce Fill %</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Queue Depth</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Safety Hazard</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Loss Prevention Cues</th>
              </tr>
            </thead>
            <tbody>
              {cameras.map((cam) => (
                <tr key={cam.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cam.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cam.location}</div>
                  </td>

                  {(
                    [
                      'peopleTracking',
                      'produceAvailability',
                      'queueDetection',
                      'safetyMonitoring',
                      'lossPrevention'
                    ] as (keyof Camera['analyticsActive'])[]
                  ).map((key) => {
                    const isChecked = cam.analyticsActive[key];
                    return (
                      <td key={key} style={{ padding: '12px' }}>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleCameraAnalytic(cam.id, key)}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
