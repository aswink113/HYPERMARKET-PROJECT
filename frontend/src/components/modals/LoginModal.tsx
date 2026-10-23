import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginModalProps {
  onLoginSuccess: (identifier: string, password?: string) => Promise<boolean | void> | boolean | void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState<string>('admin@hypermarket.com');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!identifier || !password) return;

    const success = await onLoginSuccess(identifier.trim(), password.trim());
    if (success !== false) {
      confetti({ particleCount: 60, spread: 70 });
    } else {
      setLoginError('Invalid username/email or password. Please try again or use the quick demo logins below.');
    }
  };

  const handleQuickDemo = async (demoId: string, demoPass: string) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setLoginError(null);
    confetti({ particleCount: 40, spread: 50 });
    await onLoginSuccess(demoId, demoPass);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '24px',
      overflowY: 'auto'
    }}>
      <div className="card animate-fade-in" style={{
        width: '460px',
        maxWidth: '100%',
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
        background: '#ffffff',
        margin: 'auto'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '10px'
          }}>
            <Sparkles size={28} />
          </div>
          <h2 style={{ fontSize: '22px', margin: 0, fontWeight: 700 }}>HYPERVISION PORTAL</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Client & Admin Multi-Store Camera Analytics Portal
          </p>
        </div>

        {/* Error Alert */}
        {loginError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            marginBottom: '14px',
            fontSize: '12px',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Username or Email Address
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. client_downtown or admin@hypermarket.com"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setLoginError(null);
              }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError(null);
                }}
                style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '11px', marginTop: '6px', fontSize: '14px', fontWeight: 600 }}>
            Sign In to Dashboard
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px', letterSpacing: '0.5px' }}>
            SUPER ADMIN CREDENTIALS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Super Admin Login */}
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '12px', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc' }}
              onClick={() => handleQuickDemo('admin@hypermarket.com', 'admin123')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👑 Super Admin</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                admin@hypermarket.com
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
