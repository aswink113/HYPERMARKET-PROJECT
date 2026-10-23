import React, { useState } from 'react';
import type { ProduceBin } from '../mockData';
import { RefreshCw, Filter } from 'lucide-react';

interface ProduceMapProps {
  produceBins: ProduceBin[];
  onTriggerRestockTask?: (binId: string) => void;
}

export const ProduceMap: React.FC<ProduceMapProps> = ({ produceBins, onTriggerRestockTask }) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedBinId, setSelectedBinId] = useState<string>(produceBins[0]?.id || '');

  const categories = ['All', ...Array.from(new Set(produceBins.map(b => b.category)))];
  const filteredBins = filterCategory === 'All' 
    ? produceBins 
    : produceBins.filter(b => b.category === filterCategory);

  const activeBin = produceBins.find(b => b.id === selectedBinId) || produceBins[0];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Category Filters */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="var(--primary)" />
          <strong style={{ fontSize: '14px' }}>Filter Category:</strong>
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn ${filterCategory === cat ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 12px', fontSize: '13px' }}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredBins.length}</strong> produce bins under vision scan
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Produce Bin Grid Cards */}
        {filteredBins.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>📦</div>
            <h3 style={{ fontSize: '16px', margin: 0 }}>No Produce Bins Detected</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, maxWidth: '360px' }}>
              No produce bins are currently configured for this store. They will appear here once cameras and bin regions are mapped.
            </p>
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filteredBins.map((bin) => {
            const isSelected = bin.id === activeBin.id;
            const statusConfig = {
              OK: { color: '#10b981', bg: '#ecfdf5', label: 'OK (Optimal Stock)' },
              LOW: { color: '#f59e0b', bg: '#fffbeb', label: 'LOW STOCK' },
              LIKELY_EMPTY: { color: '#ef4444', bg: '#fef2f2', label: 'LIKELY EMPTY' },
              VIEW_BLOCKED: { color: '#64748b', bg: '#f1f5f9', label: 'VIEW BLOCKED' }
            }[bin.status];

            return (
              <div
                key={bin.id}
                className="card"
                onClick={() => setSelectedBinId(bin.id)}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{bin.id}</span>
                    <span 
                      className="badge"
                      style={{ background: statusConfig.bg, color: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', marginTop: '6px', marginBottom: '2px' }}>{bin.name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{bin.category}</div>
                </div>

                {/* Fill Percentage Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span>Visible Fill</span>
                    <strong style={{ color: statusConfig.color }}>{bin.fillPercentage}%</strong>
                  </div>

                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${bin.fillPercentage}%`, 
                        height: '100%', 
                        background: statusConfig.color, 
                        transition: 'width 0.4s ease' 
                      }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                  <span>SKU: {bin.mappedSKU}</span>
                  <span>Cam: {bin.cameraId}</span>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Selected Bin Details & Action Panel */}
        {activeBin && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>BIN INSPECTION DETAILS</div>
              <h3 style={{ fontSize: '18px', margin: '4px 0 0 0' }}>{activeBin.name}</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SKU Mapping: {activeBin.mappedSKU}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Camera Source:</span>
                <strong>{activeBin.cameraName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Model Confidence:</span>
                <strong style={{ color: 'var(--success)' }}>{(activeBin.confidence * 100).toFixed(0)}%</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Est. Visible Weight:</span>
                <strong>~{activeBin.estVisibleWeightKg} kg / {activeBin.targetWeightKg} kg</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Unit Price:</span>
                <strong>${activeBin.pricePerKg.toFixed(2)} / kg</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Vision Scan:</span>
                <span>{activeBin.lastChecked}</span>
              </div>
            </div>

            {/* Restock Dispatch CTA */}
            {(activeBin.status === 'LOW' || activeBin.status === 'LIKELY_EMPTY' || activeBin.status === 'VIEW_BLOCKED') && (
              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                <button 
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => onTriggerRestockTask && onTriggerRestockTask(activeBin.id)}
                >
                  <RefreshCw size={16} /> Dispatch Restock Task to Floor Staff
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
