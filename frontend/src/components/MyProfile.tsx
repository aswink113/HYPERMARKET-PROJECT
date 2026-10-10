import React, { useState, useRef } from 'react';
import type { UserProfile, Store } from '../mockData';
import { User, Shield, Key, CheckCircle2, Save, Camera, ZoomIn, ZoomOut, RotateCw, Check, X, Crop } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MyProfileProps {
  user: UserProfile;
  stores: Store[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSwitchUserRole?: (role: UserProfile['role']) => void;
  onResetDefaults?: () => void;
}

export const MyProfile: React.FC<MyProfileProps> = ({
  user,
  stores: _stores,
  onUpdateProfile,
  onSwitchUserRole: _onSwitchUserRole,
  onResetDefaults
}) => {
  const [name, setName] = useState<string>(user?.name || 'ASWIN K');
  const [phone, setPhone] = useState<string>(user?.phone || '+1 (555) 019-2834');
  const [department, setDepartment] = useState<string>(user?.department || 'Executive Operations & Vision Security');
  const [avatar, setAvatar] = useState<string>(user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');


  // Crop Modal States
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCropImageSrc(reader.result);
          setZoom(1);
          setRotation(0);
          setPan({ x: 0, y: 0 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const generateCroppedImage = () => {
    if (!cropImageSrc || !imageRef.current) return;

    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Draw circular clip path
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.save();
    ctx.translate(size / 2 + pan.x, size / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const img = imageRef.current;
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW = size;
    let drawH = size;

    if (aspect > 1) {
      drawW = size * aspect;
    } else {
      drawH = size / aspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    const croppedBase64 = canvas.toDataURL('image/png');
    setAvatar(croppedBase64);
    setCropImageSrc(null);
    confetti({ particleCount: 30, spread: 40 });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, phone, department, avatar });
    confetti({ particleCount: 40, spread: 50 });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Profile Header Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={avatar} 
              alt={user.name} 
              style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <label 
              htmlFor="avatar-upload" 
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '50%',
                padding: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              title="Upload & Crop Profile Picture"
            >
              <Camera size={14} />
            </label>
            <input 
              id="avatar-upload"
              type="file" 
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '22px', margin: 0 }}>{user?.name || name}</h2>
              <span className="badge badge-danger">
                SUPER ADMIN
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {user?.email || 'admin@hypermarket.com'} • {department}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Assigned Access Scope: <strong>All Network Stores (Global)</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Photo Crop Modal */}
      {cropImageSrc && (
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
          zIndex: 2000,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{
            width: '440px',
            maxWidth: '100%',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crop size={18} color="var(--primary)" /> Crop & Adjust Profile Photo
              </h3>
              <button 
                type="button" 
                onClick={() => setCropImageSrc(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Interactive Circular Crop Viewport */}
            <div 
              style={{
                position: 'relative',
                width: '240px',
                height: '240px',
                margin: '0 auto',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid var(--primary)',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.4)',
                cursor: isDragging ? 'grabbing' : 'grab',
                background: '#0f172a'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img 
                ref={imageRef}
                src={cropImageSrc} 
                alt="Crop Target"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              />
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Drag to position photo inside circle
            </div>

            {/* Crop Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <ZoomOut size={16} color="var(--text-muted)" />
                <input 
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--primary)' }}
                />
                <ZoomIn size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '11px', width: '36px', textAlign: 'right', fontWeight: 600 }}>{(zoom * 100).toFixed(0)}%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                >
                  <RotateCw size={14} /> Rotate 90°
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setCropImageSrc(null)}
                style={{ fontSize: '13px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={generateCroppedImage}
                style={{ fontSize: '13px', background: '#10b981' }}
              >
                <Check size={16} /> Crop & Apply DP
              </button>
            </div>
          </div>
        </div>
      )}



      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Profile Edit Details Form */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User color="var(--primary)" size={18} /> Edit Account Details & Credentials
          </h3>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Department / Organization</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
              />
            </div>




            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={16} color="var(--primary)" /> Change Password
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Security & Access Rights Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 style={{ fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--primary)" /> Active Permissions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(user?.permissions || []).map((p) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: '4px' }}>
                  <CheckCircle2 size={14} color="var(--success)" />
                  <span style={{ fontWeight: 500 }}>{p.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
              ))}
            </div>

          </div>

          <div className="card" style={{ background: '#f8fafc' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>Account Security Log</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>• Joined: <strong>{user.joinedDate}</strong></div>
              <div>• MFA Auth: <strong style={{ color: 'var(--success)' }}>Enforced (Hardware Key)</strong></div>
              <div>• Session Storage: <strong style={{ color: 'var(--success)' }}>Persistent (Saved to Browser)</strong></div>
              <div>• Session IP: <strong>192.168.10.45</strong></div>
            </div>

            {onResetDefaults && (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  onClick={onResetDefaults}
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: '12px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  Reset App Data to Defaults
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
