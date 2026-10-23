import React, { useState } from 'react';
import type { SecurityEvent } from '../../mockData';
import { ShieldAlert, AlertOctagon, HelpCircle, Film, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SecurityReviewProps {
  events: SecurityEvent[];
  onUpdateEventStatus: (eventId: string, newStatus: SecurityEvent['status'], notes?: string) => void;
}

export const SecurityReview: React.FC<SecurityReviewProps> = ({ events, onUpdateEventStatus }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [reviewNotes, setReviewNotes] = useState<string>('');

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  const handleDecision = (status: SecurityEvent['status']) => {
    if (!activeEvent) return;
    onUpdateEventStatus(activeEvent.id, status, reviewNotes);
    
    if (status === 'No Concern' || status === 'Confirmed Incident') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Policy Warning Banner as per Brief Section 6 */}
      <div className="card" style={{ background: '#fff7ed', borderLeft: '4px solid #f97316', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertOctagon color="#ea580c" size={24} style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '15px', color: '#9a3412', margin: 0 }}>
              Human Decision Required — Strict Loss Prevention Policy Rule
            </h3>
            <p style={{ fontSize: '13px', color: '#c2410c', marginTop: '4px', margin: 0 }}>
              AI models flag ambiguous motion cues for human evaluation only. Automated accusations, searches, or law enforcement referrals strictly prohibited by model outputs alone (Brief Section 6 & 8).
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* Events Queue List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert color="var(--primary)" size={18} />
            Restricted Review Queue ({events.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛡️</div>
                No security alerts or incidents flagged for review.
              </div>
            ) : (
              events.map((evt) => {
                const isSelected = evt.id === selectedEventId;

                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      gap: '12px'
                    }}
                  >
                    <img 
                      src={evt.thumbnailUrl} 
                      alt={evt.eventType} 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{evt.id}</span>
                        <span className={`badge ${
                          evt.status === 'Pending Review' ? 'badge-danger' : 
                          evt.status === 'No Concern' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {evt.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '2px' }}>
                        {evt.eventType}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {evt.cameraName} • {evt.timestamp.split(' ')[1]}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Clip Inspection Player & Audit Form */}
        {activeEvent && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>
                  Event Inspection: {activeEvent.id} — {activeEvent.eventType}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Recorded on {activeEvent.cameraName} at {activeEvent.timestamp} ({activeEvent.clipDurationSec}s clip)
                </p>
              </div>

              <span className="badge badge-primary" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <Lock size={12} /> Restricted Role Access
              </span>
            </div>

            {/* Video Simulation Box */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '320px',
              backgroundColor: '#090d16',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={activeEvent.thumbnailUrl} 
                alt="Event Clip Frame" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} 
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(37, 99, 235, 0.9)',
                color: 'white',
                borderRadius: '50%',
                padding: '16px',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
              }}>
                <Film size={32} />
              </div>

              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                Confidence Score: {(activeEvent.confidence * 100).toFixed(0)}%
              </div>
            </div>

            {/* AI Context Notes */}
            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                AI Vision Pipeline Context:
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                {activeEvent.notes}
              </div>
            </div>

            {/* Staff Audit Decision Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '14px', margin: 0 }}>Reviewer Verdict & Audit Logging</h4>
              
              <textarea
                placeholder="Enter reviewer operational notes or observations..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  fontFamily: 'inherit',
                  fontSize: '13px'
                }}
              />

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary"
                  style={{ background: '#10b981' }}
                  onClick={() => handleDecision('No Concern')}
                >
                  Mark as No Concern (Normal Activity)
                </button>

                <button 
                  className="btn btn-secondary"
                  onClick={() => handleDecision('Needs Follow-Up')}
                >
                  <HelpCircle size={16} /> Needs Floor Staff Check
                </button>

                <button 
                  className="btn btn-danger"
                  onClick={() => handleDecision('Confirmed Incident')}
                >
                  <AlertOctagon size={16} /> Confirm Policy Incident
                </button>
              </div>

              {activeEvent.reviewedBy && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span>Last Reviewed by: <strong>{activeEvent.reviewedBy}</strong></span>
                  <span>•</span>
                  <span>At: {activeEvent.reviewedAt}</span>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
