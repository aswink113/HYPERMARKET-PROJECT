import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginModalProps {
  onLoginSuccess: (email: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('admin@hypermarket.com');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      confetti({ particleCount: 60, spread: 70 });
      onLoginSuccess(email);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    confetti({ particleCount: 40, spread: 50 });
    onLoginSuccess(demoEmail);
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '20px'
    }}>
      <div className="card animate-fade-in" style={{
        width: '420px',
        maxWidth: '100%',
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        background: '#ffffff'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '12px'
          }}>
            <Sparkles size={28} />
          </div>
          <h2 style={{ fontSize: '24px', margin: 0 }}>HYPERVISION ADMIN</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Camera Analytics & Smart Store Operations Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>User Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '11px', marginTop: '8px', fontSize: '14px' }}>
            Sign In to Hypervision
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
            QUICK DEMO ONE-CLICK LOGINS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '12px', justifyContent: 'space-between' }}
              onClick={() => handleQuickDemo('admin@hypermarket.com')}
            >
              <span>🔑 Super Admin (All Access)</span>
              <strong style={{ fontSize: '11px' }}>admin@hypermarket.com</strong>
            </button>
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '12px', justifyContent: 'space-between' }}
              onClick={() => handleQuickDemo('sarah.mgr@hypermarket.com')}
            >
              <span>🏬 Store Manager (Westside)</span>
              <strong style={{ fontSize: '11px' }}>sarah.mgr@hypermarket.com</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
