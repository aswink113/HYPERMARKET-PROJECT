import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      style={{
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
      }}
      className="animate-fade-in"
    >
      <CheckCircle color="var(--success)" size={18} />
      <span>{message}</span>
    </div>
  );
};
