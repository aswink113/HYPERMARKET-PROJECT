import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { StoreOverview } from './components/StoreOverview';
import { CameraLiveView } from './components/CameraLiveView';
import { AnalyticsSettings } from './components/AnalyticsSettings';
import { SecurityReview } from './components/SecurityReview';
import { ProduceMap } from './components/ProduceMap';
import { StoreManagement } from './components/StoreManagement';
import { CameraLinking } from './components/CameraLinking';
import { MyProfile } from './components/MyProfile';
import { LoginModal } from './components/LoginModal';
import { 
  MOCK_STORES,
  MOCK_USERS,
  MOCK_CAMERAS, 
  MOCK_PRODUCE_BINS, 
  INITIAL_ANALYTICS_SETTINGS, 
  MOCK_SECURITY_EVENTS, 
  MOCK_TRAFFIC_HOURLY, 
  MOCK_SALES_CORRELATION
} from './mockData';
import type { Camera, ProduceBin, SecurityEvent, AnalyticsToggle, Store, UserProfile } from './mockData';
import { Bell, Search, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  // Authentication & Context State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]);
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [activeStoreId, setActiveStoreId] = useState<string>('STORE-01');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Entity State Management
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

  // Filter entities by active store context
  const filteredCameras = cameras.filter(c => activeStoreId === 'ALL' || c.storeId === activeStoreId);
  const filteredBins = produceBins.filter(b => activeStoreId === 'ALL' || b.storeId === activeStoreId);
  const filteredSecurityEvents = securityEvents.filter(s => activeStoreId === 'ALL' || s.storeId === activeStoreId);

  // Authentication Handlers
  const handleLoginSuccess = (email: string) => {
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || MOCK_USERS[0];
    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    triggerToast(`Welcome back, ${foundUser.name}!`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    triggerToast('Logged out successfully.');
  };

  // 1. Store Management Handlers
  const handleAddStore = (newStoreData: Omit<Store, 'id' | 'cameraCount' | 'createdAt'>) => {
    const newStore: Store = {
      ...newStoreData,
      id: `STORE-0${stores.length + 1}`,
      cameraCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setStores(prev => [...prev, newStore]);
    triggerToast(`Branch store ${newStore.name} created successfully!`);
  };

  // 2. Camera Hardware Linking Handlers
  const handleAddCamera = (newCamData: Omit<Camera, 'id' | 'lastHeartbeat'>) => {
    const newCam: Camera = {
      ...newCamData,
      id: `CAM-0${cameras.length + 1}`,
      lastHeartbeat: 'Just now'
    };
    setCameras(prev => [...prev, newCam]);
    // Increment store camera count
    setStores(prev => prev.map(s => s.id === newCamData.storeId ? { ...s, cameraCount: s.cameraCount + 1 } : s));
    triggerToast(`IP Camera ${newCam.id} linked to store!`);
  };

  const handleDeleteCamera = (cameraId: string) => {
    setCameras(prev => prev.filter(c => c.id !== cameraId));
    triggerToast(`Camera ${cameraId} unlinked.`);
  };

  // 3. User Profile Update
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...updated }));
    triggerToast('User profile details updated.');
  };

  const handleSwitchUserRole = (role: UserProfile['role']) => {
    setCurrentUser(prev => ({ ...prev, role }));
    triggerToast(`Simulating user role: ${role.toUpperCase()}`);
  };

  // 4. Analytics & Event Toggles
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

  const handleUpdateEventStatus = (eventId: string, newStatus: SecurityEvent['status'], notes?: string) => {
    setSecurityEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        triggerToast(`Security Event ${eventId} marked as ${newStatus}`);
        return {
          ...evt,
          status: newStatus,
          reviewedBy: currentUser.name,
          reviewedAt: new Date().toLocaleTimeString(),
          notes: notes || evt.notes
        };
      }
      return evt;
    }));
  };

  const handleTriggerRestockTask = (binId: string) => {
    const bin = produceBins.find(b => b.id === binId);
    if (bin) {
      triggerToast(`Restock task dispatched to floor staff for ${bin.name}`);
      confetti({ particleCount: 40, spread: 50 });
    }
  };

  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  const pendingSecurityCount = filteredSecurityEvents.filter(s => s.status === 'Pending Review').length;
  const lowStockBinCount = filteredBins.filter(b => b.status === 'LOW' || b.status === 'LIKELY_EMPTY').length;

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingSecurityCount={pendingSecurityCount}
        lowStockBinCount={lowStockBinCount}
        currentUser={currentUser}
        stores={stores}
        activeStoreId={activeStoreId}
        onSelectActiveStore={setActiveStoreId}
        onLogout={handleLogout}
      />

      {/* Main Content View */}
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
              {activeTab === 'storeManagement' && 'Multi-Store Branch Management'}
              {activeTab === 'cameraLinking' && 'Hardware Camera Linking & ONVIF Setup'}
              {activeTab === 'myProfile' && 'User Profile & Security Settings'}
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

            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveTab('securityReview')}>
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

            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', borderLeft: '1px solid var(--border-light)', cursor: 'pointer' }}
              onClick={() => setActiveTab('myProfile')}
            >
              <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ fontSize: '12px' }}>
                <div style={{ fontWeight: 600 }}>{currentUser.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{currentUser.role.replace('_', ' ')}</div>
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
              produceBins={filteredBins}
              securityEvents={filteredSecurityEvents}
              cameras={filteredCameras}
              trafficData={MOCK_TRAFFIC_HOURLY}
              salesData={MOCK_SALES_CORRELATION}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'liveView' && (
            <CameraLiveView 
              cameras={filteredCameras}
              produceBins={filteredBins}
              onToggleCameraAnalytic={handleToggleCameraAnalytic}
            />
          )}

          {activeTab === 'produceBins' && (
            <ProduceMap 
              produceBins={filteredBins}
              onTriggerRestockTask={handleTriggerRestockTask}
            />
          )}

          {activeTab === 'analyticsSettings' && (
            <AnalyticsSettings 
              analyticsList={analyticsList}
              cameras={filteredCameras}
              onToggleGlobalAnalytic={handleToggleGlobalAnalytic}
              onToggleCameraAnalytic={handleToggleCameraAnalytic}
            />
          )}

          {activeTab === 'securityReview' && (
            <SecurityReview 
              events={filteredSecurityEvents}
              onUpdateEventStatus={handleUpdateEventStatus}
            />
          )}

          {activeTab === 'storeManagement' && (
            <StoreManagement
              stores={stores}
              onAddStore={handleAddStore}
              onSelectActiveStore={setActiveStoreId}
              activeStoreId={activeStoreId}
            />
          )}

          {activeTab === 'cameraLinking' && (
            <CameraLinking
              cameras={cameras}
              stores={stores}
              onAddCamera={handleAddCamera}
              onDeleteCamera={handleDeleteCamera}
            />
          )}

          {activeTab === 'myProfile' && (
            <MyProfile
              user={currentUser}
              stores={stores}
              onUpdateProfile={handleUpdateProfile}
              onSwitchUserRole={handleSwitchUserRole}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
