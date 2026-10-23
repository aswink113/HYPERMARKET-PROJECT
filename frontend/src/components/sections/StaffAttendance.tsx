import React, { useState, useEffect } from 'react';
import type { AttendanceRecord, StaffShift, Department } from '../../saasData';
import type { UserProfile, Camera } from '../../mockData';
import { 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  UserPlus, 
  Camera as CameraIcon, 
  Users, 
  CheckCircle, 
  Plus,
  Edit2,
  Trash2,
  Search,
  User,
  Mail,
  Building,
  Upload,
  Link as LinkIcon,
  Radio,
  Scan,
  CheckSquare,
  Square,
  ZoomIn,
  Eye,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BACKEND_URL, API_BASE_URL } from '../../api';

export interface TrackedUnknownPerson {
  personKey: string;
  firstSeen: string;
  lastSeen: string;
  scanCount: number;
  latestSnapshot: string;
  snapshots: string[];
  embedding?: number[];
}

interface StaffAttendanceProps {
  records: AttendanceRecord[];
  shifts?: StaffShift[];
  staffUsers?: UserProfile[];
  departments?: Department[];
  activeCamera?: Camera | null;
  onAddClockEvent: (event: Omit<AttendanceRecord, 'id'>) => void;
  onAddStaff?: (staff: Partial<UserProfile>) => Promise<UserProfile | void>;
  onEditStaff?: (staffId: string, updatedData: Partial<UserProfile>) => Promise<UserProfile | void>;
  onDeleteStaff?: (staffId: string) => Promise<void>;
}

export const StaffAttendance: React.FC<StaffAttendanceProps> = ({
  records,
  shifts: _shifts,
  staffUsers = [],
  departments = [],
  activeCamera,
  onAddClockEvent,
  onAddStaff,
  onEditStaff,
  onDeleteStaff
}) => {
  // Clock Terminal state
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [authMethod, setAuthMethod] = useState<AttendanceRecord['authMethod']>('Tablet PIN');
  const [currentTime, setCurrentTime] = useState<string>(() => new Date().toLocaleTimeString());

  // Staff Search & Filter State
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('ALL');

  // Edit Staff Modal State
  const [editingStaff, setEditingStaff] = useState<UserProfile | null>(null);
  const [editStaffName, setEditStaffName] = useState<string>('');
  const [editStaffGender, setEditStaffGender] = useState<string>('Male');
  const [editStaffDesignation, setEditStaffDesignation] = useState<string>('');
  const [editStaffDepartment, setEditStaffDepartment] = useState<string>('');
  const [editStaffEmail, setEditStaffEmail] = useState<string>('');
  const [editStaffRole, setEditStaffRole] = useState<UserProfile['role']>('associate');
  const [editStaffPhotos, setEditStaffPhotos] = useState<string[]>(['', '', '']);
  const [capturingSlotIndex, setCapturingSlotIndex] = useState<number | null>(null);

  // Unknown Person Detection & Quick Staff Onboarding state
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);
  const [enrollmentMode, setEnrollmentMode] = useState<'new' | 'existing'>('new');
  const [targetExistingStaffId, setTargetExistingStaffId] = useState<string>('');
  const [newStaffId, setNewStaffId] = useState<string>('');
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffGender, setNewStaffGender] = useState<string>('Male');
  const [newStaffDesignation, setNewStaffDesignation] = useState<string>('Floor Staff');
  const [newStaffEmail, setNewStaffEmail] = useState<string>('');
  const [newStaffDepartment, setNewStaffDepartment] = useState<string>(() => departments[0]?.name || 'Produce & Fresh Foods');
  const [newStaffRole, setNewStaffRole] = useState<UserProfile['role']>('associate');
  const [newStaffPhotos, setNewStaffPhotos] = useState<string[]>(['', '', '']);
  const [addCapturingSlotIndex, setAddCapturingSlotIndex] = useState<number | null>(null);
  const [pendingEnrolledKeys, setPendingEnrolledKeys] = useState<string[]>([]);

  // Vision Passing Detection Simulation & Unknown Faces History Log
  const [passingAlert, setPassingAlert] = useState<{
    id: string;
    detectedAt: string;
    recognizedStaff: UserProfile | null;
    snapshotUrl: string;
  } | null>(null);

  // List of grouped distinct unknown persons detected (persisted in localStorage so non-added past faces are never removed when new faces appear)
  const [trackedUnknownPersons, setTrackedUnknownPersons] = useState<TrackedUnknownPerson[]>(() => {
    try {
      const saved = localStorage.getItem('hypermarket_tracked_unknown_persons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not load tracked unknown persons from storage', e);
    }
    return [];
  });
  const [showAllUnknownModal, setShowAllUnknownModal] = useState<boolean>(false);
  const [activeSubView, setActiveSubView] = useState<'attendanceKiosk' | 'unknownPersons'>('attendanceKiosk');
  const [selectedPersonKeys, setSelectedPersonKeys] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Load tracked unknown faces from PostgreSQL API on mount and whenever switching to unknownPersons subview
  useEffect(() => {
    const fetchUnknownFacesFromBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/unknown-faces/?t=${Date.now()}`);
        if (res.ok) {
          const data: TrackedUnknownPerson[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTrackedUnknownPersons(prev => {
              const prevMap = new Map(prev.map(p => [p.personKey, p]));
              data.forEach(item => {
                if (!prevMap.has(item.personKey)) {
                  prevMap.set(item.personKey, item);
                }
              });
              return Array.from(prevMap.values());
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch unknown faces from backend API', err);
      }
    };
    fetchUnknownFacesFromBackend();
  }, [activeSubView]);

  // Automatically save all tracked non-added unknown faces to localStorage whenever updated
  useEffect(() => {
    try {
      if (trackedUnknownPersons.length > 0) {
        localStorage.setItem('hypermarket_tracked_unknown_persons', JSON.stringify(trackedUnknownPersons));
      }
    } catch (e) {
      console.warn('Could not save tracked unknown persons to storage', e);
    }
  }, [trackedUnknownPersons]);

  // Cosine distance calculation between two feature vectors
  const computeCosineSimilarity = (v1?: number[], v2?: number[]): number => {
    if (!v1 || !v2 || v1.length === 0 || v2.length === 0 || v1.length !== v2.length) return 0;
    let dot = 0, n1 = 0, n2 = 0;
    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
      n1 += v1[i] * v1[i];
      n2 += v2[i] * v2[i];
    }
    const mag = Math.sqrt(n1) * Math.sqrt(n2);
    return mag === 0 ? 0 : dot / mag;
  };

  // Group detected unknown face: matches against existing unknown persons or creates new person group
  const processDetectedUnknownFace = (snapUrl: string, embedding?: number[]) => {
    setTrackedUnknownPersons(prev => {
      const nowStr = new Date().toLocaleTimeString();
      let matchedIndex = -1;

      // Check if this detected face belongs to an already seen unknown person
      if (embedding && embedding.length > 0) {
        for (let i = 0; i < prev.length; i++) {
          const sim = computeCosineSimilarity(embedding, prev[i].embedding);
          if (sim >= 0.36) { // Same person threshold
            matchedIndex = i;
            break;
          }
        }
      }

      // If matched, group it with this person and update scan count + latest snapshot
      if (matchedIndex >= 0) {
        const updated = [...prev];
        const existing = updated[matchedIndex];
        const updatedSnapshots = existing.snapshots.includes(snapUrl) 
          ? existing.snapshots 
          : [snapUrl, ...existing.snapshots.slice(0, 4)];

        updated[matchedIndex] = {
          ...existing,
          lastSeen: nowStr,
          scanCount: existing.scanCount + 1,
          latestSnapshot: snapUrl,
          snapshots: updatedSnapshots,
          embedding: embedding || existing.embedding
        };
        return updated;
      }

      // Otherwise, add as a NEW distinct unknown person and append while preserving all past non-added faces
      const existingNums = prev.map(p => {
        const m = p.personKey.match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      });
      const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
      const newPersonId = `UNKNOWN-${nextNum.toString().padStart(3, '0')}`;
      const newPerson: TrackedUnknownPerson = {
        personKey: newPersonId,
        firstSeen: nowStr,
        lastSeen: nowStr,
        scanCount: 1,
        latestSnapshot: snapUrl,
        snapshots: [snapUrl],
        embedding
      };
      return [newPerson, ...prev];
    });

    // Also persist asynchronously to backend PostgreSQL endpoint
    fetch(`${API_BASE_URL}/unknown-faces/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personKey: `UNKNOWN`, // backend will handle or assign
        firstSeen: new Date().toLocaleTimeString(),
        lastSeen: new Date().toLocaleTimeString(),
        scanCount: 1,
        latestSnapshot: snapUrl,
        snapshots: [snapUrl],
        embedding: embedding || []
      })
    }).catch(err => console.warn('Could not sync unknown face to backend', err));
  };

  // Toggle selection for a specific unknown person
  const handleToggleSelectPerson = (personKey: string) => {
    setSelectedPersonKeys(prev => 
      prev.includes(personKey) ? prev.filter(k => k !== personKey) : [...prev, personKey]
    );
  };

  // Select all tracked unknown persons
  const handleSelectAllPersons = () => {
    setSelectedPersonKeys(trackedUnknownPersons.map(p => p.personKey));
  };

  // Clear selection
  const handleDeselectAllPersons = () => {
    setSelectedPersonKeys([]);
  };

  // Convert selected unknown person(s) snapshots into enrollment modal (up to 3 distinct photos)
  const handleAddSelectedToEmployee = (targetMode: 'new' | 'existing' = 'new') => {
    const selectedPersons = trackedUnknownPersons.filter(p => selectedPersonKeys.includes(p.personKey));
    if (selectedPersons.length === 0) return;

    // Collect snapshots across the selected persons
    const gatheredSnaps: string[] = [];
    for (const sp of selectedPersons) {
      for (const s of sp.snapshots) {
        if (!gatheredSnaps.includes(s) && gatheredSnaps.length < 3) {
          gatheredSnaps.push(s);
        }
      }
    }
    // Pad to 3 items
    while (gatheredSnaps.length < 3) {
      gatheredSnaps.push('');
    }

    setEnrollmentMode(targetMode);
    if (targetMode === 'existing' && staffUsers.length > 0 && !targetExistingStaffId) {
      setTargetExistingStaffId(staffUsers[0].id);
    }
    setPendingEnrolledKeys(selectedPersons.map(p => p.personKey));
    setNewStaffPhotos(gatheredSnaps);
    setShowAddStaffModal(true);
  };

  // Enroll a single unknown person with their gathered angle snapshots
  const handleEnrollSinglePerson = (person: TrackedUnknownPerson, targetMode: 'new' | 'existing' = 'new') => {
    const snaps = [
      person.latestSnapshot || '',
      person.snapshots[1] || '',
      person.snapshots[2] || ''
    ];
    setEnrollmentMode(targetMode);
    if (targetMode === 'existing' && staffUsers.length > 0 && !targetExistingStaffId) {
      setTargetExistingStaffId(staffUsers[0].id);
    }
    setPendingEnrolledKeys([person.personKey]);
    setNewStaffPhotos(snaps);
    setShowAddStaffModal(true);
  };

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update selected staff default when staffUsers list changes
  useEffect(() => {
    if (staffUsers.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staffUsers[0].id);
    }
  }, [staffUsers, selectedStaffId]);

  const currentSelectedStaff = staffUsers.find(u => u.id === selectedStaffId) || staffUsers[0];

  const handleClockIn = (staffToClock?: UserProfile) => {
    const target = staffToClock || currentSelectedStaff;
    if (!target) return;

    onAddClockEvent({
      employeeId: target.id,
      employeeName: target.name,
      storeId: target.assignedStoreId || 'NISA-ST-01',
      department: target.department || 'Floor Operations',
      shiftDate: new Date().toISOString().split('T')[0],
      clockInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      breakDurationMinutes: 0,
      authMethod,
      status: 'Punctual',
      cameraOccupancySignal: 'Zone Occupied'
    });

    confetti({ particleCount: 50, spread: 60 });
  };



  // Continuous Auto-Scanning State & Manual Scan State
  const [isAutoScanning, setIsAutoScanning] = useState<boolean>(true);
  const [isScanningFace, setIsScanningFace] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<string>('');
  const [isCurrentlyChecking, setIsCurrentlyChecking] = useState<boolean>(false);

  // References to keep loop running smoothly without dependency restarts
  const passingAlertRef = React.useRef(passingAlert);
  passingAlertRef.current = passingAlert;
  const showModalRef = React.useRef(showAddStaffModal);
  showModalRef.current = showAddStaffModal;
  const editingStaffRef = React.useRef(editingStaff);
  editingStaffRef.current = editingStaff;

  // Auto-Scan interval effect: continuously scans camera every 2.5 seconds
  useEffect(() => {
    let interval: any = null;

    if (isAutoScanning && activeCamera) {
      interval = setInterval(async () => {
        // If a modal is open where the user is actively typing/enrolling, temporarily skip this tick
        if (showModalRef.current || editingStaffRef.current) return;

        setIsCurrentlyChecking(true);
        try {
          const res = await fetch(`${API_BASE_URL}/cameras/${activeCamera.id}/scan-face/?t=${Date.now()}`);
          const data = await res.json();
          setLastScanTime(new Date().toLocaleTimeString());

          if (data.detected) {
            // Real Biometric recognition from backend SFace deep neural network!
            let matchedStaff: UserProfile | null = null;
            if (data.matchedStaff && data.matchedStaff.id) {
              matchedStaff = staffUsers.find(u => u.id === data.matchedStaff.id) || (data.matchedStaff as UserProfile);
            }

            const snapUrl = data.faceCrop || (data.snapshotUrl ? `${BACKEND_URL}${data.snapshotUrl}` : `${API_BASE_URL}/cameras/${activeCamera.id}/snapshot/?t=${Date.now()}`);

            const newAlert = {
              id: `FACE-${Date.now().toString().slice(-4)}`,
              detectedAt: new Date().toLocaleTimeString(),
              recognizedStaff: matchedStaff,
              snapshotUrl: snapUrl
            };

            setPassingAlert(newAlert);

            // If no registered staff biometric matched, list & group as unknown person
            if (!matchedStaff) {
              processDetectedUnknownFace(newAlert.snapshotUrl, data.faceEmbedding);
            }
          }
        } catch (e) {
          console.warn('Auto face scan loop error:', e);
        } finally {
          setIsCurrentlyChecking(false);
        }
      }, 2500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoScanning, activeCamera, staffUsers]);

  const handleSimulatePassingScan = async () => {
    if (!activeCamera) return;

    setIsScanningFace(true);
    setScanMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/cameras/${activeCamera.id}/scan-face/?t=${Date.now()}`);
      const data = await res.json();
      setIsScanningFace(false);

      if (!data.detected) {
        // No face detected in camera visual
        setScanMessage('Camera scanned: No human face detected in current camera frame.');
        setTimeout(() => setScanMessage(''), 5000);
        return;
      }

      // Real face detected in the camera frame!
      let matchedStaff: UserProfile | null = null;
      if (data.matchedStaff && data.matchedStaff.id) {
        matchedStaff = staffUsers.find(u => u.id === data.matchedStaff.id) || (data.matchedStaff as UserProfile);
      }

      const snapUrl = data.faceCrop || (data.snapshotUrl ? `${BACKEND_URL}${data.snapshotUrl}` : `${API_BASE_URL}/cameras/${activeCamera.id}/snapshot/?t=${Date.now()}`);

      const newAlert = {
        id: `FACE-${Date.now().toString().slice(-4)}`,
        detectedAt: new Date().toLocaleTimeString(),
        recognizedStaff: matchedStaff,
        snapshotUrl: snapUrl
      };

      setPassingAlert(newAlert);

      if (!matchedStaff) {
        processDetectedUnknownFace(newAlert.snapshotUrl, data.faceEmbedding);
      }

      confetti({ particleCount: 35, spread: 55 });
    } catch (e) {
      console.warn('Face detection call error:', e);
      setIsScanningFace(false);
      setScanMessage('Face detection service temporarily unavailable.');
      setTimeout(() => setScanMessage(''), 5000);
    }
  };

  // Handle manual file upload for a specific slot (0, 1, or 2)
  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>, slotIdx: number, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      if (isEdit) {
        setEditStaffPhotos(prev => {
          const next = [...prev];
          next[slotIdx] = b64;
          return next;
        });
      } else {
        setNewStaffPhotos(prev => {
          const next = [...prev];
          next[slotIdx] = b64;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Grab live camera frame for a specific slot (0, 1, or 2)
  const handleCaptureSlotFromCamera = async (slotIdx: number, isEdit: boolean) => {
    if (!activeCamera) return;
    if (isEdit) setCapturingSlotIndex(slotIdx);
    else setAddCapturingSlotIndex(slotIdx);

    try {
      const snapUrl = `${API_BASE_URL}/cameras/${activeCamera.id}/snapshot/?t=${Date.now()}`;
      const res = await fetch(snapUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        if (isEdit) {
          setEditStaffPhotos(prev => {
            const next = [...prev];
            next[slotIdx] = b64;
            return next;
          });
          setCapturingSlotIndex(null);
        } else {
          setNewStaffPhotos(prev => {
            const next = [...prev];
            next[slotIdx] = b64;
            return next;
          });
          setAddCapturingSlotIndex(null);
        }
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.warn('Camera snapshot error:', e);
      if (isEdit) setCapturingSlotIndex(null);
      else setAddCapturingSlotIndex(null);
    }
  };

  // Remove a photo from a specific slot
  const handleRemovePhotoSlot = (slotIdx: number, isEdit: boolean) => {
    if (isEdit) {
      setEditStaffPhotos(prev => {
        const next = [...prev];
        next[slotIdx] = '';
        return next;
      });
    } else {
      setNewStaffPhotos(prev => {
        const next = [...prev];
        next[slotIdx] = '';
        return next;
      });
    }
  };

  // Save new employee or attach face to existing employee
  const handleSaveNewStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    const validPhotos = newStaffPhotos.filter(p => !!p.trim());
    const primaryAvatar = validPhotos[0] || '';

    if (enrollmentMode === 'existing') {
      if (!targetExistingStaffId) return;
      const targetUser = staffUsers.find(u => u.id === targetExistingStaffId);
      if (!targetUser) return;

      const combinedPhotos = [
        ...(targetUser.facePhotos || (targetUser.avatar ? [targetUser.avatar] : [])),
        ...validPhotos
      ].slice(0, 3);

      if (onAddStaff) {
        await onAddStaff({
          id: targetUser.id,
          avatar: combinedPhotos[0] || targetUser.avatar,
          facePhotos: combinedPhotos
        });
        setSelectedStaffId(targetUser.id);
      }
    } else {
      if (!newStaffName.trim()) return;

      if (onAddStaff) {
        const created = await onAddStaff({
          id: newStaffId.trim() || undefined,
          name: newStaffName.trim(),
          gender: newStaffGender,
          designation: newStaffDesignation.trim(),
          email: newStaffEmail.trim() || `${newStaffName.toLowerCase().replace(/\s+/g, '.')}@hypermarket.com`,
          department: newStaffDepartment,
          role: newStaffRole,
          avatar: primaryAvatar,
          facePhotos: validPhotos
        });

        if (created) {
          setSelectedStaffId(created.id);
        }
      }
    }

    // If this enrollment was performed using unknown person face(s), remove only those successfully added faces from the unknown list
    if (pendingEnrolledKeys.length > 0) {
      setTrackedUnknownPersons(prev => prev.filter(p => !pendingEnrolledKeys.includes(p.personKey)));
      setSelectedPersonKeys(prev => prev.filter(k => !pendingEnrolledKeys.includes(k)));
      setPendingEnrolledKeys([]);
    }

    setShowAddStaffModal(false);
    setNewStaffId('');
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffDesignation('Floor Staff');
    setNewStaffPhotos(['', '', '']);
    setPassingAlert(null);
    confetti({ particleCount: 60, spread: 70 });
  };

  // Open Edit Staff Modal
  const handleOpenEditStaff = (staff: UserProfile) => {
    setEditingStaff(staff);
    setEditStaffName(staff.name);
    setEditStaffGender(staff.gender || 'Male');
    setEditStaffDesignation(staff.designation || 'Staff Associate');
    setEditStaffDepartment(staff.department || 'Produce & Fresh Foods');
    setEditStaffEmail(staff.email || '');
    setEditStaffRole(staff.role || 'associate');
    
    // Populate up to 3 existing photos
    const currentPhotos = (staff.facePhotos && staff.facePhotos.length > 0)
      ? [...staff.facePhotos]
      : (staff.avatar ? [staff.avatar] : []);
    
    setEditStaffPhotos([
      currentPhotos[0] || '',
      currentPhotos[1] || '',
      currentPhotos[2] || ''
    ]);
  };

  // Save changes to edited staff
  const handleSaveEditedStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    const validPhotos = editStaffPhotos.filter(p => !!p.trim());
    const primaryAvatar = validPhotos[0] || '';

    if (onEditStaff) {
      await onEditStaff(editingStaff.id, {
        name: editStaffName.trim(),
        gender: editStaffGender,
        designation: editStaffDesignation.trim(),
        department: editStaffDepartment,
        email: editStaffEmail.trim(),
        role: editStaffRole,
        avatar: primaryAvatar,
        facePhotos: validPhotos
      });
    }

    setEditingStaff(null);
    confetti({ particleCount: 40, spread: 60 });
  };

  // Delete staff confirmation
  const handleDeleteStaffClick = async (staff: UserProfile) => {
    const confirmed = window.confirm(`Are you sure you want to delete staff member "${staff.name}" (${staff.id})? This cannot be undone.`);
    if (confirmed && onDeleteStaff) {
      await onDeleteStaff(staff.id);
      if (selectedStaffId === staff.id) {
        const remaining = staffUsers.filter(u => u.id !== staff.id);
        if (remaining.length > 0) setSelectedStaffId(remaining[0].id);
        else setSelectedStaffId('');
      }
    }
  };

  // Filtered staff list for Staff Directory
  const filteredStaffList = staffUsers.filter(staff => {
    const matchesSearch = 
      staff.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      staff.id.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      (staff.designation || '').toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      (staff.department || '').toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      (staff.email || '').toLowerCase().includes(staffSearchQuery.toLowerCase());
    
    const matchesDept = selectedDepartmentFilter === 'ALL' || staff.department === selectedDepartmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner & Policy Rule */}
      <div className="card" style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <ShieldCheck color="#059669" size={24} style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '15px', color: '#065f46', margin: 0 }}>
              AI Vision Camera Staff Detection & Attendance Gateway
            </h3>
            <p style={{ fontSize: '13px', color: '#047857', marginTop: '4px', margin: 0 }}>
              Continuously inspects camera stream for human face visual biometrics. When an unknown face is detected, prompts enrollment with face data. When recognized staff face passes, logs instant attendance.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Continuous Auto Face Scan Toggle */}
          <button 
            className={`btn ${isAutoScanning ? 'btn-primary' : 'btn-outline'}`} 
            style={{ 
              fontSize: '13px', 
              background: isAutoScanning ? '#10b981' : 'white',
              borderColor: isAutoScanning ? '#059669' : 'var(--border-medium)',
              color: isAutoScanning ? 'white' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => {
              const next = !isAutoScanning;
              setIsAutoScanning(next);
              if (next) {
                setScanMessage('Auto Face Scanner ACTIVE: Continuously scanning camera stream for human faces in real time...');
              } else {
                setScanMessage('Auto Face Scanner paused.');
                setTimeout(() => setScanMessage(''), 3000);
              }
            }}
          >
            <Radio size={16} className={isAutoScanning ? 'alert-pulse' : ''} color={isAutoScanning ? 'white' : 'var(--success)'} /> 
            {isAutoScanning ? (
              <span>
                Auto Face Scan: ON {isCurrentlyChecking ? '(Scanning...)' : (lastScanTime ? `(${lastScanTime})` : '(Live)')}
              </span>
            ) : 'Auto Face Scan: OFF'}
          </button>

          {/* Single Scan Button */}
          <button 
            className="btn btn-outline" 
            style={{ fontSize: '13px', background: 'white' }}
            onClick={handleSimulatePassingScan}
            disabled={isScanningFace}
          >
            <Scan size={16} color="var(--primary)" /> {isScanningFace ? 'Scanning Now...' : 'Scan Once Now'}
          </button>
          
          <button 
            className="btn btn-primary" 
            style={{ fontSize: '13px' }}
            onClick={() => {
              setNewStaffPhotos(['', '', '']);
              setShowAddStaffModal(true);
            }}
          >
            <UserPlus size={16} /> Add Staff Member
          </button>
        </div>
      </div>

      {/* Sub-Section Navigation Tabs: Attendance Kiosk vs Unknown Persons Group */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', borderBottom: '2px solid var(--border-light)', paddingBottom: '4px' }}>
        <button
          className={`btn ${activeSubView === 'attendanceKiosk' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '13px', padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setActiveSubView('attendanceKiosk')}
        >
          <Clock size={16} /> Staff Attendance & Live Kiosk
        </button>

        <button
          className={`btn ${activeSubView === 'unknownPersons' ? 'btn-primary' : 'btn-outline'}`}
          style={{ 
            fontSize: '13px', 
            padding: '9px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            position: 'relative',
            background: activeSubView === 'unknownPersons' ? '#d97706' : 'white',
            borderColor: activeSubView === 'unknownPersons' ? '#b45309' : 'var(--border-medium)',
            color: activeSubView === 'unknownPersons' ? 'white' : 'var(--text-main)'
          }}
          onClick={() => setActiveSubView('unknownPersons')}
        >
          <Users size={16} /> Unknown Persons Group Log
          {trackedUnknownPersons.length > 0 && (
            <span style={{ 
              background: activeSubView === 'unknownPersons' ? 'white' : '#d97706', 
              color: activeSubView === 'unknownPersons' ? '#d97706' : 'white',
              fontSize: '11px',
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: 700
            }}>
              {trackedUnknownPersons.length}
            </span>
          )}
        </button>
      </div>

      {/* Camera Scan Status Feedback Message */}
      {scanMessage && (
        <div className="card animate-fade-in" style={{ background: '#f8fafc', borderLeft: '4px solid #64748b', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CameraIcon size={16} color="#64748b" />
            <span>{scanMessage}</span>
          </div>
          <button 
            className="btn btn-outline" 
            style={{ padding: '2px 8px', fontSize: '11px' }}
            onClick={() => setScanMessage('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Unknown Face / Recognized Staff Detection Popup Card */}
      {passingAlert && (
        <div className="card animate-fade-in" style={{ 
          background: passingAlert.recognizedStaff ? '#eff6ff' : '#fffbeb', 
          borderLeft: `4px solid ${passingAlert.recognizedStaff ? 'var(--primary)' : 'var(--warning)'}`,
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div 
              style={{ position: 'relative', width: '84px', height: '84px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid white', boxShadow: 'var(--shadow-sm)', background: '#0f172a', cursor: 'pointer' }}
              title="Click to view full image"
              onClick={() => setPreviewImage({
                url: passingAlert.snapshotUrl,
                title: passingAlert.recognizedStaff ? `${passingAlert.recognizedStaff.name} - Face Match Snapshot` : 'Unknown Face Snapshot',
                subtitle: `Spotted at ${passingAlert.detectedAt}`
              })}
            >
              <img 
                src={passingAlert.snapshotUrl} 
                alt="Camera Face Crop" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{ position: 'absolute', bottom: 4, right: 4, width: 10, height: 10, borderRadius: '50%', background: '#10b981', border: '1px solid white' }} />
              <div 
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'rgba(0,0,0,0.3)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  opacity: 0, 
                  transition: 'opacity 0.2s' 
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              >
                <ZoomIn size={18} color="white" />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${passingAlert.recognizedStaff ? 'badge-primary' : 'badge-warning'}`}>
                  {passingAlert.recognizedStaff ? 'RECOGNIZED STAFF FACE' : 'UNKNOWN FACE DETECTED'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{passingAlert.detectedAt}</span>
              </div>
              
              <h4 style={{ fontSize: '16px', margin: '4px 0 2px 0' }}>
                {passingAlert.recognizedStaff ? passingAlert.recognizedStaff.name : 'Unknown Face Spotted in Camera'}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {passingAlert.recognizedStaff 
                  ? `Department: ${passingAlert.recognizedStaff.department} (${passingAlert.recognizedStaff.id})`
                  : 'Face biometric was spotted in the live stream with no matching employee record. You can enroll them or attach to existing staff.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {passingAlert.recognizedStaff ? (
              <button 
                className="btn btn-primary" 
                style={{ fontSize: '13px', background: '#10b981' }}
                onClick={() => {
                  handleClockIn(passingAlert.recognizedStaff!);
                  setPassingAlert(null);
                }}
              >
                <CheckCircle size={16} /> Record Attendance ({passingAlert.recognizedStaff.name})
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-primary" 
                  style={{ fontSize: '13px' }}
                  onClick={() => {
                    setEnrollmentMode('new');
                    setNewStaffPhotos([passingAlert.snapshotUrl, '', '']);
                    setShowAddStaffModal(true);
                  }}
                >
                  <UserPlus size={15} /> Add as New Employee
                </button>

                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '13px', background: '#0284c7', color: 'white', border: 'none' }}
                  onClick={() => {
                    setEnrollmentMode('existing');
                    if (staffUsers.length > 0 && !targetExistingStaffId) {
                      setTargetExistingStaffId(staffUsers[0].id);
                    }
                    setNewStaffPhotos([passingAlert.snapshotUrl, '', '']);
                    setShowAddStaffModal(true);
                  }}
                >
                  <LinkIcon size={15} /> Link to Existing Staff
                </button>
              </>
            )}

            <button 
              className="btn btn-outline" 
              style={{ fontSize: '13px' }}
              onClick={() => setPassingAlert(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Compact Quick-Access Banner when in attendanceKiosk mode */}
      {activeSubView === 'attendanceKiosk' && trackedUnknownPersons.length > 0 && (
        <div className="card animate-fade-in" style={{ 
          background: '#fffbeb', 
          border: '1px solid #fde68a', 
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#f59e0b', color: 'white', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
              <Users size={18} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
                {trackedUnknownPersons.length} Grouped Unknown {trackedUnknownPersons.length === 1 ? 'Person' : 'Persons'} Detected
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#b45309' }}>
                Continuous faces have been aggregated into distinct profiles with cumulative visits.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-primary" 
              style={{ fontSize: '12px', background: '#d97706', borderColor: '#b45309' }}
              onClick={() => setActiveSubView('unknownPersons')}
            >
              <Users size={14} /> Open Unknown Persons Section ({trackedUnknownPersons.length})
            </button>
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '12px', background: 'white' }}
              onClick={() => setShowAllUnknownModal(true)}
            >
              Quick View ({trackedUnknownPersons.reduce((acc, p) => acc + p.scanCount, 0)} scans)
            </button>
          </div>
        </div>
      )}

      {/* View All Unknown Detections Modal */}
      {showAllUnknownModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{
            width: '900px',
            maxWidth: '100%',
            background: 'white',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={22} color="var(--primary)" />
                <div>
                  <h3 style={{ fontSize: '18px', margin: 0 }}>All Detected Unknown Persons & Face History</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Grouped by facial biometric identity with cumulative scan counts.
                  </p>
                </div>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setShowAllUnknownModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {trackedUnknownPersons.map((person) => (
                  <div key={person.personKey} style={{ 
                    border: '1px solid var(--border-light)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '14px', 
                    background: 'var(--bg-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div 
                        style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#0f172a', border: '2px solid white', boxShadow: 'var(--shadow-sm)', flexShrink: 0, position: 'relative', cursor: 'pointer' }}
                        title="Click to view full image"
                        onClick={() => setPreviewImage({
                          url: person.latestSnapshot,
                          title: `${person.personKey} - Latest Snapshot`,
                          subtitle: `Last seen: ${person.lastSeen} | First seen: ${person.firstSeen}`
                        })}
                      >
                        <img src={person.latestSnapshot} alt={person.personKey} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <ZoomIn size={18} color="white" />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                            {person.personKey}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '2px 6px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setPreviewImage({
                              url: person.latestSnapshot,
                              title: `${person.personKey} - Latest Snapshot`,
                              subtitle: `Last seen: ${person.lastSeen} | First seen: ${person.firstSeen}`
                            })}
                          >
                            <Eye size={11} /> View
                          </button>
                        </div>
                        <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>
                          Detected {person.scanCount} times
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Last: {person.lastSeen}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          First: {person.firstSeen}
                        </div>
                      </div>
                    </div>

                    {/* Snapshots history strip */}
                    {person.snapshots.length > 1 && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Angles:</span>
                        {person.snapshots.slice(0, 3).map((snap, sIdx) => (
                          <div 
                            key={sIdx} 
                            style={{ width: '28px', height: '28px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-medium)', cursor: 'pointer', position: 'relative' }}
                            title={`View Angle ${sIdx + 1}`}
                            onClick={() => setPreviewImage({
                              url: snap,
                              title: `${person.personKey} - Captured Face Angle ${sIdx + 1}`,
                              subtitle: `Observation photo from camera stream`
                            })}
                          >
                            <img src={snap} alt={`angle-${sIdx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: '11px', padding: '6px 10px', flex: 1, justifyContent: 'center' }}
                        onClick={() => {
                          setShowAllUnknownModal(false);
                          handleEnrollSinglePerson(person, 'new');
                        }}
                      >
                        <UserPlus size={13} /> Add Employee
                      </button>

                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '11px', padding: '6px 10px', flex: 1, justifyContent: 'center', background: '#0284c7', color: 'white', border: 'none' }}
                        onClick={() => {
                          setShowAllUnknownModal(false);
                          handleEnrollSinglePerson(person, 'existing');
                        }}
                      >
                        <LinkIcon size={13} /> Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
              <button className="btn btn-outline" onClick={() => setShowAllUnknownModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 1: STAFF ATTENDANCE & LIVE KIOSK */}
      {activeSubView === 'attendanceKiosk' && (
        <>
          {/* Clock Terminal & Shift Overview Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            
            {/* Authoritative Kiosk Terminal Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Clock color="var(--primary)" size={18} /> Store Time Kiosk Terminal
            </h3>
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '12px', padding: '4px 8px' }}
              onClick={() => {
                setNewStaffPhotos(['', '', '']);
                setShowAddStaffModal(true);
              }}
            >
              <Plus size={14} /> New Staff
            </button>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>LIVE CLOCK TIMESTAMP</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--primary)' }}>
              {currentTime}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Canonical Time Zone: Local Active Terminal
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Select Employee ({staffUsers.length} enrolled)
              </label>
              {staffUsers.length === 0 ? (
                <div style={{ padding: '8px', background: '#fffbeb', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: '#b45309' }}>
                  No staff members enrolled yet. Click "Add Staff Member" to register your staff.
                </div>
              ) : (
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
                >
                  {staffUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.id}: {user.name} ({user.department || 'Staff'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Punch Authentication Method</label>
              <select
                value={authMethod}
                onChange={(e) => setAuthMethod(e.target.value as AttendanceRecord['authMethod'])}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
              >
                <option value="Tablet PIN">Store Kiosk PIN Attestation</option>
                <option value="NFC Badge">Hardware NFC Badge Scan</option>
                <option value="Web Portal">Authenticated Web Portal</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              <button 
                className="btn btn-primary" 
                style={{ padding: '12px', background: '#10b981' }} 
                onClick={() => handleClockIn()}
                disabled={!currentSelectedStaff}
              >
                CLOCK IN PUNCH
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '12px' }}
                onClick={() => handleSimulatePassingScan()}
              >
                AI VISION SCAN
              </button>
            </div>
          </div>
        </div>

        {/* Live Attendance Log & Camera Occupancy Alignment */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <UserCheck color="var(--primary)" size={18} /> Today's Staff Timesheet & Camera Occupancy Signal
            </h3>
            <span className="badge badge-primary">{records.length} Punches Recorded</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Employee</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Clock In / Out</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Auth Method</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Camera Signal</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No staff attendance records logged today yet. Use the Clock Kiosk on the left or Camera Vision Scan to punch in.
                    </td>
                  </tr>
                ) : (
                  records.map((rec) => (
                    <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rec.employeeName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rec.department}</div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 'bold' }}>{rec.clockInTime}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Out: {rec.clockOutTime || 'Active Shift'}</div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span className="badge badge-primary">{rec.authMethod}</span>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${
                          rec.status === 'Punctual' ? 'badge-success' : 
                          rec.status === 'Late Entry' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {rec.status}
                        </span>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: rec.cameraOccupancySignal === 'Zone Occupied' ? 'var(--success)' : 'var(--text-muted)' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: rec.cameraOccupancySignal === 'Zone Occupied' ? 'var(--success)' : 'var(--text-muted)' }} />
                          {rec.cameraOccupancySignal}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Complete Staff Directory & Face Management Table */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Users color="var(--primary)" size={20} /> Registered Staff Directory & Face Biometrics ({staffUsers.length})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Complete record of enrolled personnel, assigned departments, biometric snapshots, and credential actions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search staff, ID, role..."
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px' }}
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartmentFilter}
              onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', background: 'white' }}
            >
              <option value="ALL">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>

            <button 
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '7px 12px' }}
              onClick={() => {
                setNewStaffPhotos(['', '', '']);
                setShowAddStaffModal(true);
              }}
            >
              <UserPlus size={14} /> Add New Staff
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '12px', fontWeight: 600 }}>Staff Profile</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Staff ID</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Gender</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Designation</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Contact Email</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>System Role</th>
                <th style={{ padding: '12px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaffList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {staffUsers.length === 0 
                      ? 'No staff members enrolled in database yet. Click "Add Staff Member" or use the Vision Scan button above to register staff.'
                      : 'No staff members matching your search/filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredStaffList.map((staff) => (
                  <tr key={staff.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s ease' }}>
                    {/* Staff Profile with Face Photo */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid white', boxShadow: 'var(--shadow-sm)', position: 'relative', zIndex: 3 }}>
                            {staff.avatar ? (
                              <img src={staff.avatar} alt={staff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <User size={20} color="#94a3b8" />
                            )}
                          </div>
                          {staff.facePhotos && staff.facePhotos.length > 1 && (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid white', marginLeft: '-12px', zIndex: 2 }}>
                              <img src={staff.facePhotos[1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          {staff.facePhotos && staff.facePhotos.length > 2 && (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid white', marginLeft: '-10px', zIndex: 1 }}>
                              <img src={staff.facePhotos[2]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {staff.name}
                            {staff.facePhotos && staff.facePhotos.length > 0 && (
                              <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '10px', background: '#dbeafe', color: '#1e40af', fontWeight: 500 }}>
                                {staff.facePhotos.length} {staff.facePhotos.length === 1 ? 'angle' : 'angles'}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Joined {staff.joinedDate || 'Recent'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Staff ID */}
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', color: '#1e293b' }}>
                        {staff.id}
                      </span>
                    </td>

                    {/* Gender */}
                    <td style={{ padding: '12px' }}>
                      <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                        {staff.gender || 'Not Specified'}
                      </span>
                    </td>

                    {/* Designation */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{staff.designation || 'Staff'}</div>
                    </td>

                    {/* Department */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <Building size={13} /> {staff.department || 'General'}
                      </div>
                    </td>

                    {/* Official Email */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        <Mail size={13} /> {staff.email}
                      </div>
                    </td>

                    {/* System Role */}
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${staff.role === 'store_manager' || staff.role === 'super_admin' ? 'badge-primary' : 'badge-secondary'}`}>
                        {staff.role}
                      </span>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          className="btn btn-outline"
                          title="Edit Staff Member"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          onClick={() => handleOpenEditStaff(staff)}
                        >
                          <Edit2 size={13} color="var(--primary)" /> Edit
                        </button>
                        
                        <button 
                          className="btn btn-outline"
                          title="Delete Staff Member"
                          style={{ padding: '6px 10px', fontSize: '12px', borderColor: '#fca5a5', color: '#dc2626' }}
                          onClick={() => handleDeleteStaffClick(staff)}
                        >
                          <Trash2 size={13} color="#dc2626" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

  {/* SUB-SECTION 2: DEDICATED UNKNOWN PERSONS GROUP LOG & SELECTION ENROLLMENT */}
  {activeSubView === 'unknownPersons' && (
    <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'white', padding: '24px' }}>
      
      {/* Header & Batch Action Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#fef3c7', padding: '8px', borderRadius: 'var(--radius-sm)', color: '#d97706' }}>
              <Users size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Unknown Persons Biometric Registry & Group Log
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Continuous camera detections are automatically grouped by face biometrics into unique profiles. Select one or more persons to register as new employees or link with their captured faces.
              </p>
            </div>
          </div>
        </div>

        {/* Selection Toolbar and Batch Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {trackedUnknownPersons.length > 0 && (
            <>
              <button 
                type="button"
                className="btn btn-outline" 
                style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={selectedPersonKeys.length === trackedUnknownPersons.length ? handleDeselectAllPersons : handleSelectAllPersons}
              >
                {selectedPersonKeys.length === trackedUnknownPersons.length ? (
                  <>
                    <CheckSquare size={14} color="var(--primary)" /> Deselect All
                  </>
                ) : (
                  <>
                    <Square size={14} /> Select All ({trackedUnknownPersons.length})
                  </>
                )}
              </button>

              {/* Primary Batch Action: Add Selected to New Employee */}
              <button
                type="button"
                className="btn btn-primary"
                disabled={selectedPersonKeys.length === 0}
                style={{ 
                  fontSize: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: selectedPersonKeys.length > 0 ? '#10b981' : '#94a3b8',
                  borderColor: selectedPersonKeys.length > 0 ? '#059669' : '#94a3b8',
                  cursor: selectedPersonKeys.length > 0 ? 'pointer' : 'not-allowed'
                }}
                onClick={() => handleAddSelectedToEmployee('new')}
              >
                <UserPlus size={14} /> Add Selected Faces to New Employee ({selectedPersonKeys.length})
              </button>

              {/* Batch Action: Link Selected Faces to Existing Staff */}
              <button
                type="button"
                className="btn btn-secondary"
                disabled={selectedPersonKeys.length === 0}
                style={{ 
                  fontSize: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: selectedPersonKeys.length > 0 ? '#0284c7' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  cursor: selectedPersonKeys.length > 0 ? 'pointer' : 'not-allowed'
                }}
                onClick={() => handleAddSelectedToEmployee('existing')}
              >
                <LinkIcon size={14} /> Link Selected Faces to Staff ({selectedPersonKeys.length})
              </button>

              <button 
                type="button"
                className="btn btn-outline" 
                style={{ fontSize: '12px', color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => {
                  if (window.confirm('Clear all detected unknown person records?')) {
                    setTrackedUnknownPersons([]);
                    setSelectedPersonKeys([]);
                  }
                }}
              >
                <Trash2 size={13} /> Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Unknown Persons Grid */}
      {trackedUnknownPersons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)' }}>
          <Users size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '16px', color: 'var(--text-main)', margin: '0 0 6px 0' }}>No Unknown Persons Detected Yet</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 16px auto' }}>
            When the camera detects an unidentified human face during auto or manual scans, it will automatically group repeated observations here.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary" 
              style={{ fontSize: '13px' }}
              onClick={handleSimulatePassingScan}
              disabled={isScanningFace}
            >
              <Scan size={15} /> Run Live Scan Now
            </button>
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '13px' }}
              onClick={() => setActiveSubView('attendanceKiosk')}
            >
              <Clock size={15} /> Back to Kiosk Terminal
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing {trackedUnknownPersons.length} distinct grouped individuals &middot; {selectedPersonKeys.length} selected
            </span>
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '12px', padding: '4px 10px' }}
              onClick={() => setShowAllUnknownModal(true)}
            >
              Open Inspection Modal
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {trackedUnknownPersons.map((person) => {
              const isSelected = selectedPersonKeys.includes(person.personKey);
              return (
                <div 
                  key={person.personKey} 
                  style={{ 
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-medium)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '16px', 
                    background: isSelected ? '#f0fdf4' : 'var(--bg-subtle)',
                    boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    transition: 'all 0.15s ease-in-out'
                  }}
                >
                  {/* Top Checkbox & Key row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelectPerson(person.personKey);
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}} // Handled by label click
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <span className="badge badge-warning" style={{ fontSize: '11px', fontWeight: 700 }}>
                        {person.personKey}
                      </span>
                    </label>

                    <span style={{ 
                      fontSize: '11px', 
                      background: '#2563eb', 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      fontWeight: 700 
                    }}>
                      {person.scanCount} {person.scanCount === 1 ? 'Observation' : 'Observations'}
                    </span>
                  </div>

                  {/* Main Thumbnail and Info */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div 
                      style={{ 
                        width: '84px', 
                        height: '84px', 
                        borderRadius: 'var(--radius-md)', 
                        overflow: 'hidden', 
                        background: '#0f172a',
                        flexShrink: 0,
                        border: '2px solid white',
                        boxShadow: 'var(--shadow-sm)',
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                      title="Click to view full size image"
                      onClick={() => setPreviewImage({
                        url: person.latestSnapshot,
                        title: `${person.personKey} - Latest Snapshot`,
                        subtitle: `Last seen: ${person.lastSeen} | First seen: ${person.firstSeen}`
                      })}
                    >
                      <img 
                        src={person.latestSnapshot} 
                        alt={`Unknown person ${person.personKey}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div 
                        style={{ 
                          position: 'absolute', 
                          inset: 0, 
                          background: 'rgba(0,0,0,0.3)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          opacity: 0, 
                          transition: 'opacity 0.2s' 
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                      >
                        <ZoomIn size={20} color="white" />
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 700 }}>
                          {person.personKey}
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '2px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setPreviewImage({
                            url: person.latestSnapshot,
                            title: `${person.personKey} - Latest Face Snapshot`,
                            subtitle: `Observations: ${person.scanCount} times | Last seen: ${person.lastSeen}`
                          })}
                        >
                          <Eye size={12} /> View Photo
                        </button>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                        Last Seen: {person.lastSeen}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                        First Seen: {person.firstSeen}
                      </div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                        Grouped: {person.snapshots.length} Face {person.snapshots.length === 1 ? 'Angle' : 'Angles'} Saved
                      </div>
                    </div>
                  </div>

                  {/* Face Angles Preview Strip */}
                  {person.snapshots.length > 0 && (
                    <div style={{ background: 'white', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                          Captured Angle Snapshots ({person.snapshots.length})
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--primary)', cursor: 'pointer' }}
                          onClick={() => setPreviewImage({
                            url: person.latestSnapshot,
                            title: `${person.personKey} - Captured Face Angle`,
                            subtitle: `Click any angle thumbnail to inspect in full resolution`
                          })}
                        >
                          Click thumbnail to inspect
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                        {person.snapshots.map((snap, sIdx) => (
                          <div 
                            key={sIdx} 
                            title={`Click to view Snapshot ${sIdx + 1}`}
                            style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '4px', 
                              overflow: 'hidden', 
                              border: '1px solid var(--border-medium)',
                              flexShrink: 0,
                              background: '#0f172a',
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                            onClick={() => setPreviewImage({
                              url: snap,
                              title: `${person.personKey} - Angle Snapshot #${sIdx + 1}`,
                              subtitle: `Captured Face Biometric Angle`
                            })}
                          >
                            <img src={snap} alt={`angle-${sIdx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Individual Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '4px' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ fontSize: '11px', padding: '6px 10px', flex: 1, justifyContent: 'center' }}
                      onClick={() => handleEnrollSinglePerson(person, 'new')}
                    >
                      <UserPlus size={13} /> Add as Employee
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '6px 10px', flex: 1, justifyContent: 'center', background: '#0284c7', color: 'white', border: 'none' }}
                      onClick={() => handleEnrollSinglePerson(person, 'existing')}
                    >
                      <LinkIcon size={13} /> Link to Staff
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '11px', padding: '6px 8px', color: '#64748b' }}
                      title="Remove from log"
                      onClick={() => {
                        setTrackedUnknownPersons(prev => prev.filter(p => p.personKey !== person.personKey));
                        setSelectedPersonKeys(prev => prev.filter(k => k !== person.personKey));
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{
            width: '520px',
            maxWidth: '100%',
            background: 'white',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', margin: 0 }}>Edit Staff: {editingStaff.name} ({editingStaff.id})</h3>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setEditingStaff(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 3 Photos Section for Biometric Accuracy (Replace Any Photo) */}
              <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="var(--primary)" /> Biometric Face Data (3 Angle Slots)
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                    {editStaffPhotos.filter(p => !!p).length} / 3 Enrolled
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
                  You can replace any photo individually by grabbing a fresh frame from the live camera or uploading a new picture.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[0, 1, 2].map((slotIdx) => {
                    const slotLabels = ['Angle 1 (Front)', 'Angle 2 (Left/Tilt)', 'Angle 3 (Right/Exp)'];
                    const photo = editStaffPhotos[slotIdx];
                    const isCapturing = capturingSlotIndex === slotIdx;

                    return (
                      <div key={slotIdx} style={{ background: 'white', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{slotLabels[slotIdx]}</div>
                        <div style={{ width: '74px', height: '74px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
                          {photo ? (
                            <img src={photo} alt={`Angle ${slotIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={28} color="#64748b" />
                          )}
                          {photo && (
                            <span style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: '50%', background: '#10b981', border: '1px solid white' }} />
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                          {/* Replace via Camera */}
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ fontSize: '11px', padding: '4px 6px', justifyContent: 'center' }}
                            onClick={() => handleCaptureSlotFromCamera(slotIdx, true)}
                            disabled={isCapturing}
                          >
                            <CameraIcon size={12} color="var(--primary)" /> {isCapturing ? 'Grabbing...' : (photo ? 'Replace Cam' : 'Grab Cam')}
                          </button>

                          {/* Replace via File Upload */}
                          <label className="btn btn-outline" style={{ fontSize: '11px', padding: '4px 6px', justifyContent: 'center', cursor: 'pointer', margin: 0 }}>
                            <Upload size={12} color="#0284c7" /> {photo ? 'Replace File' : 'Upload File'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              onChange={(e) => handleUploadPhoto(e, slotIdx, true)} 
                            />
                          </label>

                          {/* Remove / Clear */}
                          {photo && (
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ fontSize: '10px', padding: '3px 6px', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5' }}
                              onClick={() => handleRemovePhotoSlot(slotIdx, true)}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Staff Name & ID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Staff ID</label>
                  <input 
                    type="text" 
                    disabled 
                    value={editingStaff.id}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: '#f8fafc', color: '#64748b' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Staff Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={editStaffName}
                    onChange={(e) => setEditStaffName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Gender & Designation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Gender</label>
                  <select
                    value={editStaffGender}
                    onChange={(e) => setEditStaffGender(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Designation *</label>
                  <input 
                    type="text" 
                    required 
                    value={editStaffDesignation}
                    onChange={(e) => setEditStaffDesignation(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Department & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Department</label>
                  <select
                    value={editStaffDepartment}
                    onChange={(e) => setEditStaffDepartment(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
                  >
                    {departments.length === 0 ? (
                      <option value="Produce & Fresh Foods">Produce & Fresh Foods</option>
                    ) : (
                      departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Official Email</label>
                  <input 
                    type="email" 
                    value={editStaffEmail}
                    onChange={(e) => setEditStaffEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>System Access Role</label>
                <select
                  value={editStaffRole}
                  onChange={(e) => setEditStaffRole(e.target.value as UserProfile['role'])}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
                >
                  <option value="associate">Store Associate</option>
                  <option value="store_manager">Store Manager</option>
                  <option value="lp_reviewer">Loss Prevention Reviewer</option>
                  <option value="analyst">Data & Analytics Officer</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setEditingStaff(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <CheckCircle size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff / Register Unknown Person Modal */}
      {showAddStaffModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{
            width: '520px',
            maxWidth: '100%',
            background: 'white',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', margin: 0 }}>Staff Facial Enrollment & Profile Registration</h3>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setShowAddStaffModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Tabs: Create New vs Add to Existing */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
              <button
                type="button"
                className={`btn ${enrollmentMode === 'new' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, fontSize: '13px', padding: '8px' }}
                onClick={() => setEnrollmentMode('new')}
              >
                <Plus size={14} /> Register New Staff
              </button>
              <button
                type="button"
                className={`btn ${enrollmentMode === 'existing' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, fontSize: '13px', padding: '8px' }}
                onClick={() => {
                  setEnrollmentMode('existing');
                  if (staffUsers.length > 0 && !targetExistingStaffId) {
                    setTargetExistingStaffId(staffUsers[0].id);
                  }
                }}
              >
                <Users size={14} /> Add Face to Existing Staff
              </button>
            </div>

            <form onSubmit={handleSaveNewStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 3 Photos Section for Higher Biometric Accuracy */}
              <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="var(--primary)" /> Biometric Face Data (Up to 3 Photos for High Accuracy)
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                    {newStaffPhotos.filter(p => !!p).length} / 3 Uploaded
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
                  Uploading multiple angles (e.g. Front, Left Angle, Right Angle) significantly increases facial recognition accuracy in camera streams.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[0, 1, 2].map((slotIdx) => {
                    const slotLabels = ['Angle 1 (Front)', 'Angle 2 (Left/Tilt)', 'Angle 3 (Right/Exp)'];
                    const photo = newStaffPhotos[slotIdx];
                    const isCapturing = addCapturingSlotIndex === slotIdx;

                    return (
                      <div key={slotIdx} style={{ background: 'white', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{slotLabels[slotIdx]}</div>
                        <div style={{ width: '74px', height: '74px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
                          {photo ? (
                            <img src={photo} alt={`Slot ${slotIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={28} color="#64748b" />
                          )}
                          {photo && (
                            <span style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: '50%', background: '#10b981', border: '1px solid white' }} />
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                          {/* Camera Grab Button */}
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ fontSize: '11px', padding: '4px 6px', justifyContent: 'center' }}
                            onClick={() => handleCaptureSlotFromCamera(slotIdx, false)}
                            disabled={isCapturing}
                          >
                            <CameraIcon size={12} color="var(--primary)" /> {isCapturing ? 'Grabbing...' : (photo ? 'Replace Cam' : 'Grab Cam')}
                          </button>

                          {/* Upload File Input Button */}
                          <label className="btn btn-outline" style={{ fontSize: '11px', padding: '4px 6px', justifyContent: 'center', cursor: 'pointer', margin: 0 }}>
                            <Upload size={12} color="#0284c7" /> {photo ? 'Replace File' : 'Upload File'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              onChange={(e) => handleUploadPhoto(e, slotIdx, false)} 
                            />
                          </label>

                          {/* Remove Button */}
                          {photo && (
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ fontSize: '10px', padding: '3px 6px', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5' }}
                              onClick={() => handleRemovePhotoSlot(slotIdx, false)}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {enrollmentMode === 'existing' ? (
                /* Add Face to Existing Staff Mode */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#eff6ff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', display: 'block' }}>
                    Select Existing Staff Member to Attach Face Data:
                  </label>
                  {staffUsers.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#b45309' }}>
                      No existing staff members found. Please switch to "Register New Staff" to create an employee first.
                    </div>
                  ) : (
                    <select
                      value={targetExistingStaffId}
                      onChange={(e) => setTargetExistingStaffId(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
                    >
                      {staffUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.id} — {u.name} ({u.designation || u.department || 'Staff'})
                        </option>
                      ))}
                    </select>
                  )}
                  <p style={{ fontSize: '12px', color: '#1e40af', margin: 0 }}>
                    Attaching this camera snapshot will update this employee's face recognition profile in the database.
                  </p>
                </div>
              ) : (
                /* Register New Staff Mode */
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Staff ID (Optional)
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. EMP-101"
                        value={newStaffId}
                        onChange={(e) => setNewStaffId(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Staff Name *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Rahul Sharma"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Gender</label>
                      <select
                        value={newStaffGender}
                        onChange={(e) => setNewStaffGender(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Designation *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Senior Cashier / Produce Attendant"
                        value={newStaffDesignation}
                        onChange={(e) => setNewStaffDesignation(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Department</label>
                      <select
                        value={newStaffDepartment}
                        onChange={(e) => setNewStaffDepartment(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
                      >
                        {departments.length === 0 ? (
                          <option value="Produce & Fresh Foods">Produce & Fresh Foods</option>
                        ) : (
                          departments.map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Official Email
                      </label>
                      <input 
                        type="email" 
                        placeholder="e.g. rahul@hypermarket.com"
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>System Access Role</label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as UserProfile['role'])}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
                    >
                      <option value="associate">Store Associate</option>
                      <option value="store_manager">Store Manager</option>
                      <option value="lp_reviewer">Loss Prevention Reviewer</option>
                      <option value="analyst">Data & Analytics Officer</option>
                    </select>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowAddStaffModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <UserPlus size={16} /> {enrollmentMode === 'existing' ? 'Update Existing Staff Face Data' : 'Save & Register Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Image Preview / Inspection Lightbox Modal */}
      {previewImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '24px'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="card animate-fade-in" 
            style={{
              maxWidth: '680px',
              width: '100%',
              background: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #334155', background: '#1e293b' }}>
              <div>
                <h4 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 600 }}>
                  {previewImage.title}
                </h4>
                {previewImage.subtitle && (
                  <p style={{ margin: '3px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>
                    {previewImage.subtitle}
                  </p>
                )}
              </div>
              <button 
                type="button"
                className="btn btn-outline" 
                style={{ padding: '6px 10px', fontSize: '13px', background: 'transparent', color: '#cbd5e1', borderColor: '#475569' }}
                onClick={() => setPreviewImage(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Image Canvas with High Contrast Background */}
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', minHeight: '360px', maxHeight: '65vh', overflow: 'hidden' }}>
              <img 
                src={previewImage.url} 
                alt={previewImage.title} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '60vh', 
                  objectFit: 'contain', 
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  border: '2px solid #334155'
                }} 
              />
            </div>

            {/* Modal Footer Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #334155', background: '#1e293b' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                AI Vision SFace Biometric Crop
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={previewImage.url}
                  download="face-biometric.jpg"
                  className="btn btn-outline"
                  style={{ fontSize: '12px', padding: '6px 12px', color: '#cbd5e1', borderColor: '#475569', textDecoration: 'none' }}
                >
                  Download Photo
                </a>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '6px 16px' }}
                  onClick={() => setPreviewImage(null)}
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
