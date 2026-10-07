import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { StoreOverview } from './components/StoreOverview';
import { CameraLiveView } from './components/CameraLiveView';
import { AnalyticsSettings } from './components/AnalyticsSettings';
import { SecurityReview } from './components/SecurityReview';
import { ProduceMap } from './components/ProduceMap';
import { 
  MOCK_CAMERAS, 
  MOCK_PRODUCE_BINS, 
  INITIAL_ANALYTICS_SETTINGS, 
  MOCK_SECURITY_EVENTS, 
  MOCK_TRAFFIC_HOURLY, 
  MOCK_SALES_CORRELATION
} from './mockData';
import type { Camera, ProduceBin, SecurityEvent, AnalyticsToggle } from './mockData';
import { Bell, Search, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // State Management
  const [cameras, setCameras] = useState<Camera[]>(MOCK_CAMERAS);
  const [produceBins] = useState<ProduceBin[]>(MOCK_PRODUCE_BINS);
  const [analyticsList, setAnalyticsList] = useState<AnalyticsToggle[]>(INITIAL_ANALYTICS_SETTINGS);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(MOCK_SECURITY_EVENTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Toggle Global Analytic Switch
  const handleToggleGlobalAnalytic = (id: string) => {
    setAnalyticsList(prev => prev.map(item => {
      if (item.id === id) {
        const updated = !item.enabled;
        triggerToast(`${item.name} vision module is now ${updated ? 'ENABLED' : 'DISABLED'}`);
        return { ...item, enabled: updated };
      }
      return item;
    }));
  };

  // 2. Toggle Per-Camera Specific Analytic
  const handleToggleCameraAnalytic = (cameraId: string, analyticKey: keyof Camera['analyticsActive']) => {
    setCameras(prev => prev.map(cam => {
      if (cam.id === cameraId) {
        const currentState = cam.analyticsActive[analyticKey];
        const updatedState = !currentState;
        triggerToast(`${analyticKey} for ${cam.id} turned ${updatedState ? 'ON' : 'OFF'}`);
        return {
          ...cam,
          analyticsActive: {
            ...cam.analyticsActive,
            [analyticKey]: updatedState
          }
        };
      }
      return cam;
    }));
  };

  // 3. Update Security Review Status
  const handleUpdateEventStatus = (eventId: string, newStatus: SecurityEvent['status'], notes?: string) => {
    setSecurityEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        triggerToast(`Security Event ${eventId} marked as ${newStatus}`);
        return {
          ...evt,
          status: newStatus,
          reviewedBy: 'M. Vance (LP Lead)',
          reviewedAt: new Date().toLocaleTimeString(),
          notes: notes || evt.notes
        };
      }
      return evt;
    }));
  };

  // 4. Trigger Restock Dispatch
  const handleTriggerRestockTask = (binId: string) => {
    const bin = produceBins.find(b => b.id === binId);
    if (bin) {
      triggerToast(`Restock task dispatched to floor staff for ${bin.name}`);
      confetti({ particleCount: 40, spread: 50 });
    }
  };

  const pendingSecurityCount = securityEvents.filter(s => s.status === 'Pending Review').length;
  const lowStockBinCount = produceBins.filter(b => b.status === 'LOW' || b.status === 'LIKELY_EMPTY').length;

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingSecurityCount={pendingSecurityCount}
        lowStockBinCount={lowStockBinCount}
      />

      {/* Main View Area */}
      <div className="main-content">
        {/* Top Header */}
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', margin: 0 }}>
              {activeTab === 'overview' && 'Store Overview Dashboard'}
              {activeTab === 'liveView' && 'Camera Live Feeds & Controls'}
              {activeTab === 'produceBins' && 'Produce Bins & Display Availability'}
              {activeTab === 'analyticsSettings' && 'Analytics & Edge AI Settings'}
              {activeTab === 'securityReview' && 'Restricted Loss-Prevention Review'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search cameras, SKU, or alerts..." 
                style={{
                  padding: '7px 12px 7px 34px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-light)',
                  fontSize: '13px',
                  outline: 'none',
                  width: '240px',
                  background: 'var(--bg-subtle)'
                }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="var(--text-muted)" />
              {pendingSecurityCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--danger)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '14px',
                  height: '14px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {pendingSecurityCount}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', borderLeft: '1px solid var(--border-light)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                MV
              </div>
              <div style={{ fontSize: '12px' }}>
                <div style={{ fontWeight: 600 }}>M. Vance</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Store Manager</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Toast Feedback Notification */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--text-main)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            zIndex: 1000
          }} className="animate-fade-in">
            <CheckCircle color="var(--success)" size={18} />
            {toastMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="content-body">
          {activeTab === 'overview' && (
            <StoreOverview 
              produceBins={produceBins}
              securityEvents={securityEvents}
              cameras={cameras}
              trafficData={MOCK_TRAFFIC_HOURLY}
              salesData={MOCK_SALES_CORRELATION}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'liveView' && (
            <CameraLiveView 
              cameras={cameras}
              produceBins={produceBins}
              onToggleCameraAnalytic={handleToggleCameraAnalytic}
            />
          )}

          {activeTab === 'produceBins' && (
            <ProduceMap 
              produceBins={produceBins}
              onTriggerRestockTask={handleTriggerRestockTask}
            />
          )}

          {activeTab === 'analyticsSettings' && (
            <AnalyticsSettings 
              analyticsList={analyticsList}
              cameras={cameras}
              onToggleGlobalAnalytic={handleToggleGlobalAnalytic}
              onToggleCameraAnalytic={handleToggleCameraAnalytic}
            />
          )}

          {activeTab === 'securityReview' && (
            <SecurityReview 
              events={securityEvents}
              onUpdateEventStatus={handleUpdateEventStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
