import React from 'react';
import type { ProduceBin, SecurityEvent, Camera } from '../mockData';
import { 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  Eye,
  ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface OverviewProps {
  produceBins: ProduceBin[];
  securityEvents: SecurityEvent[];
  cameras: Camera[];
  trafficData: any[];
  salesData: any[];
  onNavigateTab: (tab: string) => void;
}

export const StoreOverview: React.FC<OverviewProps> = ({
  produceBins,
  securityEvents,
  cameras,
  trafficData,
  salesData,
  onNavigateTab
}) => {
  const lowOrEmptyBins = produceBins.filter(b => b.status === 'LOW' || b.status === 'LIKELY_EMPTY');
  const pendingSecurity = securityEvents.filter(s => s.status === 'Pending Review');
  const onlineCameras = cameras.filter(c => c.status === 'online');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Metric 1 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
            <Eye size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Online IP Cameras</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onlineCameras.length} / {cameras.length}
              <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 'normal', display: 'flex', alignItems: 'center' }}>
                <ArrowUpRight size={14} /> 100% Stream
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: lowOrEmptyBins.length > 0 ? 'var(--warning-light)' : 'var(--success-light)', borderRadius: 'var(--radius-md)', color: lowOrEmptyBins.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Produce Bins Needing Restock</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {lowOrEmptyBins.length} Bins
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--purple-light)', borderRadius: 'var(--radius-md)', color: 'var(--purple)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Hourly Traffic & Dwell</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {trafficData.length > 0 ? trafficData[trafficData.length - 1].visitors : 0} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>visits/hr</span>
            </div>
          </div>
        </div>


        {/* Metric 4 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: pendingSecurity.length > 0 ? 'var(--danger-light)' : 'var(--success-light)', borderRadius: 'var(--radius-md)', color: pendingSecurity.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Security Review Queue</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {pendingSecurity.length} Pending
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Foot Traffic & Dwell Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', margin: 0 }}>Customer Flow & Dwell Pattern (Today)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Anonymous zone entry counts aggregated by hour (Section 3 Traffic Requirement)
              </p>
            </div>
            <button className="btn btn-outline" style={{ fontSize: '12px' }} onClick={() => onNavigateTab('traffic')}>
              Detailed Analytics →
            </button>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" name="Total Visitors" />
                <Area type="monotone" dataKey="produceVisits" stroke="#10b981" strokeWidth={2} fillOpacity={0.2} fill="#10b981" name="Produce Zone Dwellers" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Produce Fill Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', margin: 0 }}>Produce Fill Alerts</h3>
              <button className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => onNavigateTab('bins')}>
                View Bins
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {produceBins.map((bin) => {
                const getStatusBadge = (s: string) => {
                  switch (s) {
                    case 'OK': return <span className="badge badge-success">OK</span>;
                    case 'LOW': return <span className="badge badge-warning">LOW</span>;
                    case 'LIKELY_EMPTY': return <span className="badge badge-danger">EMPTY</span>;
                    default: return <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>BLOCKED</span>;
                  }
                };

                return (
                  <div key={bin.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{bin.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Conf: {(bin.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{bin.fillPercentage}%</span>
                      {getStatusBadge(bin.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* POS Sales vs Vision Fill Correlation */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', margin: 0 }}>POS Sales & Visible Stock Correlation (Bananas Bin 2)</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Cross-referencing camera visible fill % with POS timestamped units sold (Section 2 & 7)
            </p>
          </div>
          <span className="badge badge-primary">POS Integrated Feed</span>
        </div>

        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Bar dataKey="organicBananasFill" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Bin Fill % (Camera)" />
              <Bar dataKey="posUnitsSold" fill="#10b981" radius={[4, 4, 0, 0]} name="Units Sold (POS)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
