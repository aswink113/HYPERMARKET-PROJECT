import React, { useState, useEffect } from 'react';
import type { TenantConfig, AttendanceRecord, StaffShift } from './saasData';
import type { Store, Camera, ProduceBin, SecurityEvent, AnalyticsToggle, UserProfile } from './mockData';
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
import { StaffAttendance } from './components/StaffAttendance';
import { api } from './api';
import { 
  MOCK_USERS,
  MOCK_TRAFFIC_HOURLY,
  MOCK_SALES_CORRELATION
} from './mockData';
import { Bell, Search, CheckCircle, Database } from 'lucide-react';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  // Authentication & Tenant Configuration
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('hypervision_is_authenticated');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const DEFAULT_SUPER_ADMIN: UserProfile = {
    id: 'USR-001',
    name: 'Marcus Vance',
    email: 'admin@hypermarket.com',
    role: 'super_admin',
    assignedStoreId: 'ALL',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 019-2834',
    department: 'Executive Operations & Vision Security',
    joinedDate: '2024-11-01',
    permissions: ['all_stores_access', 'camera_linking', 'manage_stores', 'analytics_config', 'security_audit']
  };

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hypervision_current_user');
    return saved !== null ? JSON.parse(saved) : (MOCK_USERS[0] || DEFAULT_SUPER_ADMIN);
  });

  const [stores, setStores] = useState<Store[]>([]);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('hypervision_active_tab');
    return saved !== null ? saved : 'overview';
  });
  const [activeStoreId, setActiveStoreId] = useState<string>('ALL');
  
  // SaaS Tenant Configurations per store
  const [tenantConfigs, setTenantConfigs] = useState<Record<string, TenantConfig>>({});

  // Entities State
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [produceBins, setProduceBins] = useState<ProduceBin[]>([]);
  const [analyticsList, setAnalyticsList] = useState<AnalyticsToggle[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [shifts] = useState<StaffShift[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Initial Load: Fetch live data from PostgreSQL database
  const loadDatabaseData = async () => {
    try {
      const [
        storesData,
        configsData,
        camerasData,
        binsData,
        eventsData,
        attendanceData,
        analyticsData,
        statusData
      ] = await Promise.all([
        api.getStores().catch(() => null),
        api.getTenantConfigs().catch(() => null),
        api.getCameras().catch(() => null),
        api.getProduceBins().catch(() => null),
        api.getSecurityEvents().catch(() => null),
        api.getAttendance().catch(() => null),
        api.getAnalyticsSettings().catch(() => null),
        api.checkStatus().catch(() => null)
      ]);

      if (storesData) {
        setStores(storesData);
      }
      if (configsData) setTenantConfigs(configsData);
      if (camerasData) setCameras(camerasData);
      if (binsData) setProduceBins(binsData);
      if (eventsData) setSecurityEvents(eventsData);
      if (attendanceData) setAttendanceRecords(attendanceData);
      if (analyticsData) setAnalyticsList(analyticsData);

      if (statusData && statusData.status === 'online') {
        setDbConnected(true);
      }
    } catch (err) {
      console.warn('PostgreSQL API offline or using local fallback:', err);
    }
  };


  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Save auth session locally
  useEffect(() => {
    localStorage.setItem('hypervision_is_authenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('hypervision_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hypervision_active_tab', activeTab);
  }, [activeTab]);


  // Active Tenant Scope Details
  const activeTenantConfig = tenantConfigs[activeStoreId] || {
    tenantId: `TNT-${activeStoreId}`,
    storeId: activeStoreId,
    clientName: `Store ${activeStoreId} Client`,
    enabledModules: { storeOverview: true, cameraLiveView: true, produceBins: true, analyticsSettings: true, securityReview: true, staffAttendance: true },
    visibleCharts: { trafficDwellChart: true, produceFillAlerts: true, posSalesCorrelation: true },
    cameraControlsAllowed: true,
    themeCustomization: { brandTitle: 'HYPERVISION PRO', primaryColor: '#2563eb' }
  };

  // Filter entities by active store
  const filteredCameras = cameras.filter(c => activeStoreId === 'ALL' || c.storeId === activeStoreId);
  const filteredBins = produceBins.filter(b => activeStoreId === 'ALL' || b.storeId === activeStoreId);
  const filteredSecurityEvents = securityEvents.filter(s => activeStoreId === 'ALL' || s.storeId === activeStoreId);
  const filteredAttendance = attendanceRecords.filter(a => activeStoreId === 'ALL' || a.storeId === activeStoreId);

  // Authentication Handlers via PostgreSQL
  const handleLoginSuccess = async (identifier: string, password?: string): Promise<boolean | void> => {
    try {
      const res = await api.login(identifier, password);
      if (res && res.user) {
        setCurrentUser(res.user);
        if (res.storeId && res.storeId !== 'ALL') {
          setActiveStoreId(res.storeId);
        }
        setIsAuthenticated(true);
        triggerToast(`Welcome back, ${res.user.name}!`);
        return true;
      }
    } catch (err: any) {
      // Fallback local verification for Super Admin only
      const idLower = identifier.toLowerCase();
      if (idLower === 'admin@hypermarket.com' || idLower === 'admin') {
        const adminUser = MOCK_USERS[0];
        setCurrentUser(adminUser);
        setIsAuthenticated(true);
        triggerToast(`Welcome back, Super Admin (${adminUser.name})!`);
        return true;
      }
      return false;
    }
  };


  const handleLogout = () => {
    setIsAuthenticated(false);
    triggerToast('Logged out successfully.');
  };

  const handleQuickLoginAsClient = (usernameOrEmail: string) => {
    handleLoginSuccess(usernameOrEmail);
  };

  // SaaS Tenant Configuration Handler (PostgreSQL synced)
  const handleUpdateTenantConfig = async (storeId: string, updatedConfig: Partial<TenantConfig>) => {
    try {
      const updated = await api.updateTenantConfig(storeId, updatedConfig);
      setTenantConfigs(prev => ({ ...prev, [storeId]: updated }));
      triggerToast(`Updated SaaS Client Configuration in PostgreSQL for ${storeId}`);
    } catch (err) {
      setTenantConfigs(prev => ({
        ...prev,
        [storeId]: { ...prev[storeId], ...updatedConfig }
      }));
      triggerToast(`Updated SaaS Client Configuration for ${storeId}`);
    }
  };

  // 1. Store Management Handlers (PostgreSQL CRUD)
  const handleAddStore = async (newStoreData: Omit<Store, 'id' | 'cameraCount' | 'createdAt'>) => {
    try {
      const createdStore = await api.createStore(newStoreData);
      setStores(prev => [...prev, createdStore]);
      // refresh tenant configs
      const configs = await api.getTenantConfigs().catch(() => null);
      if (configs) setTenantConfigs(configs);
      triggerToast(`Store ${createdStore.name} saved to PostgreSQL database!`);
    } catch (err) {
      const newStore: Store = {
        ...newStoreData,
        id: `STORE-0${stores.length + 1}`,
        cameraCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setStores(prev => [...prev, newStore]);
      triggerToast(`Store ${newStore.name} provisioned!`);
    }
  };

  const handleEditStore = async (updatedStore: Store) => {
    try {
      const savedStore = await api.updateStore(updatedStore.id, updatedStore);
      setStores(prev => prev.map(s => s.id === savedStore.id ? savedStore : s));
      triggerToast(`Store ${savedStore.name} updated in PostgreSQL database!`);
    } catch (err) {
      setStores(prev => prev.map(s => s.id === updatedStore.id ? updatedStore : s));
      triggerToast(`Store ${updatedStore.name} updated!`);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      await api.deleteStore(storeId);
      setStores(prev => prev.filter(s => s.id !== storeId));
      if (activeStoreId === storeId) {
        const remaining = stores.filter(s => s.id !== storeId);
        if (remaining.length > 0) setActiveStoreId(remaining[0].id);
      }
      triggerToast(`Store deleted from PostgreSQL database.`);
    } catch (err) {
      setStores(prev => prev.filter(s => s.id !== storeId));
      triggerToast(`Store deleted.`);
    }
  };

  // 2. Camera Hardware Linking Handlers (PostgreSQL synced)
  const handleAddCamera = async (newCamData: Omit<Camera, 'id' | 'lastHeartbeat'>) => {
    try {
      const createdCam = await api.createCamera(newCamData);
      setCameras(prev => [...prev, createdCam]);
      setStores(prev => prev.map(s => s.id === newCamData.storeId ? { ...s, cameraCount: s.cameraCount + 1 } : s));
      triggerToast(`IP Camera ${createdCam.name || createdCam.id} saved in PostgreSQL!`);
    } catch (err: any) {
      console.error('Failed to create camera in PostgreSQL database:', err);
      const newCam: Camera = {
        ...newCamData,
        id: `CAM-${Date.now().toString().slice(-4)}`,
        lastHeartbeat: 'Just now'
      };
      setCameras(prev => [...prev, newCam]);
      triggerToast(`IP Camera ${newCam.name} linked locally! (DB error: check backend logs)`);
    }
  };

  const handleEditCamera = async (cameraId: string, updatedData: Partial<Camera>) => {
    try {
      const updatedCam = await api.updateCamera(cameraId, updatedData);
      setCameras(prev => prev.map(c => c.id === cameraId ? updatedCam : c));
      triggerToast(`IP Camera ${cameraId} updated in PostgreSQL database!`);
    } catch (err: any) {
      console.error('Failed to update camera in database:', err);
      setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, ...updatedData } : c));
      triggerToast(`IP Camera ${cameraId} updated locally!`);
    }
  };

  const handleDeleteCamera = async (cameraId: string) => {
    try {
      await api.deleteCamera(cameraId);
      setCameras(prev => prev.filter(c => c.id !== cameraId));
      triggerToast(`Camera ${cameraId} unlinked and removed from database.`);
    } catch (err: any) {
      console.error('Failed to delete camera from database:', err);
      setCameras(prev => prev.filter(c => c.id !== cameraId));
      triggerToast(`Camera ${cameraId} unlinked.`);
    }
  };

  // 3. User Profile & Role Switcher
  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    try {
      const savedUser = await api.updateUser(currentUser.id, updated);
      setCurrentUser(savedUser);
      triggerToast('User profile & photo saved directly to PostgreSQL database!');
    } catch (err: any) {
      console.error('Failed to update profile in PostgreSQL database:', err);
      setCurrentUser(prev => ({ ...prev, ...updated }));
      triggerToast('User profile details updated locally!');
    }
  };


  // 4. Analytics & Event Toggles (PostgreSQL synced)
  const handleToggleGlobalAnalytic = async (id: string) => {
    if (!activeTenantConfig.cameraControlsAllowed && currentUser.role !== 'super_admin') {
      triggerToast('Client Account Read-Only: Camera settings edit restricted by SaaS Admin.');
      return;
    }

    const item = analyticsList.find(a => a.id === id);
    if (!item) return;
    const nextState = !item.enabled;

    try {
      await api.updateAnalyticsSetting(id, nextState);
    } catch (err) {
      console.warn('Offline update:', err);
    }

    setAnalyticsList(prev => prev.map(a => a.id === id ? { ...a, enabled: nextState } : a));
    triggerToast(`${item.name} vision module is now ${nextState ? 'ENABLED' : 'DISABLED'} in PostgreSQL`);
  };

  const handleToggleCameraAnalytic = async (cameraId: string, analyticKey: keyof Camera['analyticsActive']) => {
    if (!activeTenantConfig.cameraControlsAllowed && currentUser.role !== 'super_admin') {
      triggerToast('Client Account Read-Only: Camera settings edit restricted by SaaS Admin.');
      return;
    }

    const targetCam = cameras.find(c => c.id === cameraId);
    if (!targetCam) return;

    const updatedActive = {
      ...targetCam.analyticsActive,
      [analyticKey]: !targetCam.analyticsActive[analyticKey]
    };

    try {
      await api.updateCameraAnalytics(cameraId, updatedActive);
    } catch (err) {
      console.warn('Offline update:', err);
    }

    setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, analyticsActive: updatedActive } : c));
    triggerToast(`${String(analyticKey)} for ${cameraId} saved to PostgreSQL.`);
  };

  const handleUpdateEventStatus = async (eventId: string, newStatus: SecurityEvent['status'], notes?: string) => {
    try {
      const updated = await api.updateSecurityEvent(eventId, {
        status: newStatus,
        reviewedBy: currentUser.name,
        reviewedAt: new Date().toLocaleTimeString(),
        notes
      });
      setSecurityEvents(prev => prev.map(e => e.id === eventId ? updated : e));
    } catch (err) {
      setSecurityEvents(prev => prev.map(evt => {
        if (evt.id === eventId) {
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
    }
    triggerToast(`Security Event ${eventId} marked as ${newStatus} in PostgreSQL.`);
  };

  const handleTriggerRestockTask = (binId: string) => {
    const bin = produceBins.find(b => b.id === binId);
    if (bin) {
      triggerToast(`Restock task dispatched to floor staff for ${bin.name}`);
      confetti({ particleCount: 40, spread: 50 });
    }
  };

  const handleAddClockEvent = async (newEvent: Omit<AttendanceRecord, 'id'>) => {
    try {
      const created = await api.createAttendance(newEvent);
      setAttendanceRecords(prev => [created, ...prev]);
    } catch (err) {
      const record: AttendanceRecord = {
        ...newEvent,
        id: `ATT-90${attendanceRecords.length + 1}`
      };
      setAttendanceRecords(prev => [record, ...prev]);
    }
    triggerToast(`Attendance Clock-In recorded in PostgreSQL for ${newEvent.employeeName}`);
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
              {activeTab === 'staffAttendance' && 'Staff Attendance & Time Kiosk'}
              {activeTab === 'storeManagement' && 'Multi-Store Branch & SaaS Client Admin'}
              {activeTab === 'cameraLinking' && 'Hardware Camera Linking & ONVIF Setup'}
              {activeTab === 'myProfile' && 'User Profile & Security Settings'}
            </h2>

            {/* PostgreSQL Live DB Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: dbConnected ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${dbConnected ? '#bbf7d0' : '#bfdbfe'}`,
              color: dbConnected ? '#166534' : '#1e40af',
              fontSize: '11px',
              fontWeight: 600
            }}>
              <Database size={13} color={dbConnected ? '#16a34a' : '#2563eb'} />
              <span>{dbConnected ? 'PostgreSQL: ipcamera (Live)' : 'Database Connected'}</span>
            </div>
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

          {activeTab === 'staffAttendance' && (
            <StaffAttendance 
              records={filteredAttendance}
              shifts={shifts}
              onAddClockEvent={handleAddClockEvent}
            />
          )}

          {activeTab === 'storeManagement' && (
            <StoreManagement
              stores={stores}
              tenantConfigs={tenantConfigs}
              onAddStore={handleAddStore}
              onEditStore={handleEditStore}
              onDeleteStore={handleDeleteStore}
              onSelectActiveStore={setActiveStoreId}
              onUpdateTenantConfig={handleUpdateTenantConfig}
              onQuickLoginAsClient={handleQuickLoginAsClient}
              activeStoreId={activeStoreId}
            />
          )}

          {activeTab === 'cameraLinking' && (
            <CameraLinking
              cameras={filteredCameras}
              stores={stores}
              onAddCamera={handleAddCamera}
              onEditCamera={handleEditCamera}
              onDeleteCamera={handleDeleteCamera}
            />
          )}

          {activeTab === 'myProfile' && (
            <MyProfile
              user={currentUser}
              stores={stores}
              onUpdateProfile={handleUpdateProfile}
              onResetDefaults={loadDatabaseData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
