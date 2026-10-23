import React, { useState } from 'react';
import type { Department, Designation } from '../../saasData';
import { 
  Building2, 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  MapPin, 
  Hash, 
  CheckCircle, 
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MasterDataManagementProps {
  departments: Department[];
  designations: Designation[];
  onAddDepartment: (dept: Partial<Department>) => Promise<Department | void>;
  onEditDepartment: (id: string, dept: Partial<Department>) => Promise<Department | void>;
  onDeleteDepartment: (id: string) => Promise<void>;
  onAddDesignation: (desig: Partial<Designation>) => Promise<Designation | void>;
  onEditDesignation: (id: string, desig: Partial<Designation>) => Promise<Designation | void>;
  onDeleteDesignation: (id: string) => Promise<void>;
}

export const MasterDataManagement: React.FC<MasterDataManagementProps> = ({
  departments,
  designations,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
  onAddDesignation,
  onEditDesignation,
  onDeleteDesignation
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'departments' | 'designations'>('departments');
  const [searchQuery, setSearchQuery] = useState('');

  // Department Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptFloorZone, setDeptFloorZone] = useState('');
  const [deptDescription, setDeptDescription] = useState('');

  // Designation Modal State
  const [showDesigModal, setShowDesigModal] = useState(false);
  const [editingDesig, setEditingDesig] = useState<Designation | null>(null);
  const [desigTitle, setDesigTitle] = useState('');
  const [desigDepartment, setDesigDepartment] = useState('');
  const [desigLevel, setDesigLevel] = useState('Associate');

  // Open Add Department
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setDeptFloorZone('Floor 1 - Zone A');
    setDeptDescription('');
    setShowDeptModal(true);
  };

  // Open Edit Department
  const handleOpenEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code || '');
    setDeptFloorZone(dept.floorZone || '');
    setDeptDescription(dept.description || '');
    setShowDeptModal(true);
  };

  // Save Department (Add or Edit)
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    if (editingDept) {
      await onEditDepartment(editingDept.id, {
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        floorZone: deptFloorZone.trim(),
        description: deptDescription.trim()
      });
    } else {
      await onAddDepartment({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase() || deptName.trim().substring(0, 4).toUpperCase(),
        floorZone: deptFloorZone.trim(),
        description: deptDescription.trim()
      });
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    }
    setShowDeptModal(false);
  };

  // Delete Department
  const handleDeleteDept = async (dept: Department) => {
    if (window.confirm(`Are you sure you want to delete department "${dept.name}"? This department will be removed from all dropdown options.`)) {
      await onDeleteDepartment(dept.id);
    }
  };

  // Open Add Designation
  const handleOpenAddDesig = () => {
    setEditingDesig(null);
    setDesigTitle('');
    setDesigDepartment(departments[0]?.name || '');
    setDesigLevel('Associate');
    setShowDesigModal(true);
  };

  // Open Edit Designation
  const handleOpenEditDesig = (desig: Designation) => {
    setEditingDesig(desig);
    setDesigTitle(desig.title);
    setDesigDepartment(desig.department || (departments[0]?.name || ''));
    setDesigLevel(desig.level || 'Associate');
    setShowDesigModal(true);
  };

  // Save Designation
  const handleSaveDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigTitle.trim()) return;

    if (editingDesig) {
      await onEditDesignation(editingDesig.id, {
        title: desigTitle.trim(),
        department: desigDepartment,
        level: desigLevel
      });
    } else {
      await onAddDesignation({
        title: desigTitle.trim(),
        department: desigDepartment,
        level: desigLevel
      });
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    }
    setShowDesigModal(false);
  };

  // Delete Designation
  const handleDeleteDesig = async (desig: Designation) => {
    if (window.confirm(`Are you sure you want to delete designation "${desig.title}"?`)) {
      await onDeleteDesignation(desig.id);
    }
  };

  // Filtered lists
  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.floorZone && d.floorZone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDesignations = designations.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.department && d.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.level && d.level.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Title */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                <Layers size={24} color="#60a5fa" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
                Store Master Data Management
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', maxWidth: '680px' }}>
              Configure centralized store organizational structures. Departments and designations created here automatically populate employee registration forms, kiosk filters, and roster shifts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {activeSubTab === 'departments' ? (
              <button 
                className="btn btn-primary"
                onClick={handleOpenAddDept}
                style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600 }}
              >
                <Plus size={16} /> Add Department
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={handleOpenAddDesig}
                style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600 }}
              >
                <Plus size={16} /> Add Designation
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveSubTab('departments')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeSubTab === 'departments' ? '#2563eb' : 'rgba(255,255,255,0.08)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Building2 size={16} />
              Departments ({departments.length})
            </button>

            <button
              onClick={() => setActiveSubTab('designations')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeSubTab === 'designations' ? '#2563eb' : 'rgba(255,255,255,0.08)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Briefcase size={16} />
              Designations ({designations.length})
            </button>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder={`Search ${activeSubTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {activeSubTab === 'departments' ? (
          <div>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Active Store Departments
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  These departments appear dynamically in the employee department dropdown when onboarding or editing staff.
                </span>
              </div>
              <span className="badge badge-primary">{filteredDepartments.length} Departments</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Code / ID</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Department Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Store Floor / Zone</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Operational Scope</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No departments found matching "{searchQuery}". Click "Add Department" above to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <tr key={dept.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ 
                            fontFamily: 'monospace', 
                            fontWeight: 700, 
                            color: 'var(--primary)', 
                            background: 'var(--bg-subtle)', 
                            padding: '3px 8px', 
                            borderRadius: '4px',
                            border: '1px solid var(--border-light)'
                          }}>
                            {dept.code || dept.id}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={16} color="var(--primary)" />
                            {dept.name}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                            <MapPin size={14} color="#64748b" />
                            {dept.floorZone || 'General Floor'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '320px' }}>
                          {dept.description || 'General departmental operational duty and staff coverage zone.'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              onClick={() => handleOpenEditDept(dept)}
                              title="Edit Department"
                            >
                              <Edit2 size={13} color="var(--primary)" /> Edit
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '6px 10px', fontSize: '12px', borderColor: '#fca5a5', color: '#dc2626' }}
                              onClick={() => handleDeleteDept(dept)}
                              title="Delete Department"
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
        ) : (
          <div>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Active Staff Designations & Titles
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Designations mapped to store departments for role allocation and hierarchy levels.
                </span>
              </div>
              <span className="badge badge-primary">{filteredDesignations.length} Designations</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Designation Title</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Associated Department</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Hierarchy Level</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDesignations.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No designations found matching "{searchQuery}". Click "Add Designation" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredDesignations.map((desig) => (
                      <tr key={desig.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Briefcase size={16} color="var(--primary)" />
                            {desig.title}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="badge badge-secondary">{desig.department || 'Store Wide'}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge ${desig.level === 'Executive' || desig.level === 'Manager' ? 'badge-primary' : 'badge-neutral'}`}>
                            {desig.level || 'Associate'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              onClick={() => handleOpenEditDesig(desig)}
                              title="Edit Designation"
                            >
                              <Edit2 size={13} color="var(--primary)" /> Edit
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '6px 10px', fontSize: '12px', borderColor: '#fca5a5', color: '#dc2626' }}
                              onClick={() => handleDeleteDesig(desig)}
                              title="Delete Designation"
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
        )}
      </div>

      {/* Add / Edit Department Modal */}
      {showDeptModal && (
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
            width: '480px',
            maxWidth: '100%',
            background: 'white',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', margin: 0 }}>
                  {editingDept ? `Edit Department: ${editingDept.name}` : 'Create New Department'}
                </h3>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setShowDeptModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDept} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Department Name *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Frozen Foods & Dairy"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    <Hash size={13} style={{ display: 'inline', verticalAlign: '-1px' }} /> Department Code
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. FRZ"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    <MapPin size={13} style={{ display: 'inline', verticalAlign: '-1px' }} /> Store Floor / Zone
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Floor 1 - Aisle 4"
                    value={deptFloorZone}
                    onChange={(e) => setDeptFloorZone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Description / Operational Scope
                </label>
                <textarea 
                  rows={3}
                  placeholder="Describe this department's function, inventory coverage, or team duties..."
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowDeptModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <CheckCircle size={16} /> {editingDept ? 'Update Department' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Designation Modal */}
      {showDesigModal && (
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
            width: '480px',
            maxWidth: '100%',
            background: 'white',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', margin: 0 }}>
                  {editingDesig ? `Edit Designation: ${editingDesig.title}` : 'Create New Designation'}
                </h3>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setShowDesigModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDesig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Designation Title *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Lead Cashier / Shift Supervisor"
                  value={desigTitle}
                  onChange={(e) => setDesigTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Department
                  </label>
                  <select
                    value={desigDepartment}
                    onChange={(e) => setDesigDepartment(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Hierarchy Level
                  </label>
                  <select
                    value={desigLevel}
                    onChange={(e) => setDesigLevel(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', background: 'white' }}
                  >
                    <option value="Associate">Associate</option>
                    <option value="Senior Associate">Senior Associate</option>
                    <option value="Lead">Lead / Supervisor</option>
                    <option value="Specialist">Specialist</option>
                    <option value="Manager">Manager</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowDesigModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <CheckCircle size={16} /> {editingDesig ? 'Update Designation' : 'Save Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
