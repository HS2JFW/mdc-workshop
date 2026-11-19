import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  UserCheck,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  Building,
  Briefcase
} from 'lucide-react';
import {
  loadPmsUsers,
  savePmsUser,
  deletePmsUser,
  getActivePmsUser,
  setActivePmsUser,
  PMS_ROLE_META,
  type PmsUserPermission,
  type PmsUserRole
} from '../data/pmsDataService';

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChanged?: (user: PmsUserPermission) => void;
}

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  isOpen,
  onClose,
  onUserChanged
}) => {
  const [users, setUsers] = useState<PmsUserPermission[]>(() => loadPmsUsers());
  const [activeUser, setActiveUser] = useState<PmsUserPermission>(() => getActivePmsUser());
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formPosition, setFormPosition] = useState<string>('');
  const [formDept, setFormDept] = useState<string>('กลุ่มงานส่งเสริมคุณธรรม');
  const [formRole, setFormRole] = useState<PmsUserRole>('data_owner');
  const [formCanView, setFormCanView] = useState<boolean>(true);
  const [formCanSubmit, setFormCanSubmit] = useState<boolean>(true);
  const [formCanReview, setFormCanReview] = useState<boolean>(false);
  const [formCanApprove, setFormCanApprove] = useState<boolean>(false);

  useEffect(() => {
    const handleSync = () => {
      setUsers(loadPmsUsers());
      setActiveUser(getActivePmsUser());
    };
    window.addEventListener('moral-pms-users-updated', handleSync);
    return () => window.removeEventListener('moral-pms-users-updated', handleSync);
  }, []);

  if (!isOpen) return null;

  const handleRolePresetChange = (role: PmsUserRole) => {
    setFormRole(role);
    if (role === 'executive') {
      setFormCanView(true);
      setFormCanSubmit(true);
      setFormCanReview(true);
      setFormCanApprove(true);
    } else if (role === 'approver') {
      setFormCanView(true);
      setFormCanSubmit(false);
      setFormCanReview(true);
      setFormCanApprove(true);
    } else if (role === 'reviewer') {
      setFormCanView(true);
      setFormCanSubmit(true);
      setFormCanReview(true);
      setFormCanApprove(false);
    } else if (role === 'data_owner') {
      setFormCanView(true);
      setFormCanSubmit(true);
      setFormCanReview(false);
      setFormCanApprove(false);
    } else if (role === 'viewer') {
      setFormCanView(true);
      setFormCanSubmit(false);
      setFormCanReview(false);
      setFormCanApprove(false);
    } else if (role === 'admin') {
      setFormCanView(true);
      setFormCanSubmit(true);
      setFormCanReview(true);
      setFormCanApprove(true);
    }
  };

  const handleSelectActiveUser = (u: PmsUserPermission) => {
    const nextActive = setActivePmsUser(u.userId);
    setActiveUser(nextActive);
    if (onUserChanged) onUserChanged(nextActive);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPosition.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุล และตำแหน่งให้ครบถ้วน');
      return;
    }

    const targetId = editingUserId || `usr-${Date.now().toString().slice(-5)}`;
    const userPayload: PmsUserPermission = {
      userId: targetId,
      userName: formName.trim(),
      position: formPosition.trim(),
      department: formDept.trim() || 'ศูนย์คุณธรรม (องค์การมหาชน)',
      role: formRole,
      canView: formCanView,
      canSubmit: formCanSubmit,
      canReview: formCanReview,
      canApprove: formCanApprove,
      assignedProjectIds: ['all']
    };

    savePmsUser(userPayload);
    setIsAddingNew(false);
    setEditingUserId(null);
    setFormName('');
    setFormPosition('');
  };

  const handleStartEdit = (u: PmsUserPermission) => {
    setEditingUserId(u.userId);
    setFormName(u.userName);
    setFormPosition(u.position);
    setFormDept(u.department);
    setFormRole(u.role);
    setFormCanView(u.canView);
    setFormCanSubmit(u.canSubmit);
    setFormCanReview(u.canReview);
    setFormCanApprove(u.canApprove);
    setIsAddingNew(true);
  };

  const handleDeleteUser = (u: PmsUserPermission) => {
    if (confirm(`ยืนยันการลบบัญชีและสิทธิ์ของ "${u.userName}" หรือไม่?`)) {
      deletePmsUser(u.userId);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="moral-modal-card moral-permissions-modal-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '880px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="moral-modal-header moral-permissions-modal-header"
          style={{
            padding: '18px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={22} color="#60a5fa" />
            </div>
            <div>
              <h3 className="moral-modal-title" style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                การกำหนดสิทธิ์ผู้ใช้งานและผู้อนุมัติ (User Permissions & Roles)
              </h3>
              <p className="moral-modal-sub" style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                ตามกรอบธรรมาภิบาลข้อมูล หน้า 4, 5, 7 • กำหนดตำแหน่ง ใครเป็นคน Approve และใครมีสิทธิ์ดูได้
              </p>
            </div>
          </div>

          <button
            type="button"
            className="moral-modal-close-btn"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Active User Switcher Banner */}
          <div
            className="moral-modal-active-user-bar"
            style={{
              padding: '14px 18px',
              borderRadius: '14px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '15px'
                }}
              >
                {activeUser.userName.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#14532d' }}>
                    {activeUser.userName}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      backgroundColor: PMS_ROLE_META[activeUser.role].badgeBg,
                      color: PMS_ROLE_META[activeUser.role].color
                    }}
                  >
                    {PMS_ROLE_META[activeUser.role].label}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                  ตำแหน่ง: <strong>{activeUser.position}</strong> ({activeUser.department}) • สิทธิ์ปัจจุบัน:
                  {activeUser.canApprove ? ' [✓ มีสิทธิ์ Approve]' : ' [✗ ไม่มีสิทธิ์ Approve]'}
                  {activeUser.canView ? ' [✓ มีสิทธิ์ดู]' : ''}
                  {activeUser.canSubmit ? ' [✓ บันทึกผลได้]' : ''}
                </div>
              </div>
            </div>

            <span style={{ fontSize: '11px', color: '#047857', fontStyle: 'italic', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '8px' }}>
              คลิกปุ่ม &quot;สลับใช้บทบาทนี้&quot; ด้านล่างเพื่อทดสอบระบบตามสิทธิ์จริง
            </span>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
              รายชื่อผู้ใช้งานและบทบาทในระบบ ({users.length} ท่าน)
            </div>
            {!isAddingNew && (
              <button
                type="button"
                onClick={() => {
                  setEditingUserId(null);
                  setFormName('');
                  setFormPosition('');
                  setFormRole('data_owner');
                  handleRolePresetChange('data_owner');
                  setIsAddingNew(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} />
                <span>เพิ่มผู้ใช้งาน / กำหนดสิทธิ์ใหม่</span>
              </button>
            )}
          </div>

          {/* Add / Edit Form */}
          {isAddingNew && (
            <form
              onSubmit={handleSaveForm}
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #3b82f6',
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e40af' }}>
                  {editingUserId ? '✏️ แก้ไขข้อมูลผู้ใช้งานและสิทธิ์' : '➕ เพิ่มผู้ใช้งานใหม่และกำหนดสิทธิ์'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ยกเลิก
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    ชื่อ - นามสกุล:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ดร.สมศักดิ์ มุ่งมั่น"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    ตำแหน่ง:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ผู้อำนวยการ / ผู้ตรวจสอบ / เจ้าหน้าที่โครงการ"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    กลุ่มงาน / สังกัด:
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น กลุ่มงานนโยบายและยุทธศาสตร์"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  เลือกบทบาทหลักตามเอกสารข้อเสนอ PMS:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {(['executive', 'approver', 'reviewer', 'data_owner', 'viewer', 'admin'] as PmsUserRole[]).map((r) => {
                    const isSelected = formRole === r;
                    const meta = PMS_ROLE_META[r];
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRolePresetChange(r)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#1e40af' : '#1e293b' }}>
                          {meta.label}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                          {meta.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permission Checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  กำหนดสิทธิ์จำเพาะ (Permissions Matrix):
                </label>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formCanView}
                      onChange={(e) => setFormCanView(e.target.checked)}
                    />
                    <span>มีสิทธิ์ดูข้อมูลโครงการ (Can View)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formCanSubmit}
                      onChange={(e) => setFormCanSubmit(e.target.checked)}
                    />
                    <span>มีสิทธิ์บันทึก/ส่งผลงาน (Can Submit)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formCanReview}
                      onChange={(e) => setFormCanReview(e.target.checked)}
                    />
                    <span>มีสิทธิ์ตรวจสอบ/ส่งกลับแก้ไข (Can Review)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#047857', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formCanApprove}
                      onChange={(e) => setFormCanApprove(e.target.checked)}
                    />
                    <span>มีสิทธิ์อนุมัติ/รับรองผล (Can Approve) ★</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '7px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  บันทึกข้อมูลสิทธิ์
                </button>
              </div>
            </form>
          )}

          {/* User List Table */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>ชื่อ - นามสกุล</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>ตำแหน่ง / สังกัด</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>บทบาท (Role)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>สิทธิ์ Approve</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>สิทธิ์ View</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>การใช้งาน</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isActive = activeUser.userId === u.userId;
                  const roleMeta = PMS_ROLE_META[u.role] || PMS_ROLE_META.viewer;

                  return (
                    <tr
                      key={u.userId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isActive ? '#f0fdf4' : '#ffffff',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: isActive ? '#22c55e' : '#e2e8f0',
                              color: isActive ? '#ffffff' : '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '12px'
                            }}
                          >
                            {u.userName.charAt(0)}
                          </div>
                          <div>
                            <div>{u.userName}</div>
                            {isActive && (
                              <div style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700 }}>
                                ● บัญชีใช้งานขณะนี้
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Briefcase size={12} color="#64748b" />
                          <span>{u.position}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Building size={11} color="#94a3b8" />
                          <span>{u.department}</span>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: roleMeta.badgeBg,
                            color: roleMeta.color
                          }}
                        >
                          {roleMeta.label.split('(')[0].trim()}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {u.canApprove ? (
                          <span style={{ color: '#059669', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={15} /> อนุมัติได้
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>ไม่มีสิทธิ์</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {u.canView ? (
                          <span style={{ color: '#2563eb', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Eye size={14} /> ดูได้
                          </span>
                        ) : (
                          <span style={{ color: '#ef4444' }}>ซ่อน</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => handleSelectActiveUser(u)}
                              style={{
                                padding: '5px 9px',
                                borderRadius: '6px',
                                border: '1px solid #86efac',
                                backgroundColor: '#f0fdf4',
                                color: '#15803d',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              title="สลับใช้งานบทบาทของผู้ใช้นี้ เพื่อทดสอบหน้าจอ"
                            >
                              <UserCheck size={12} />
                              <span>สลับใช้บทบาทนี้</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartEdit(u)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            แก้ไข
                          </button>

                          {users.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              style={{
                                padding: '5px 7px',
                                borderRadius: '6px',
                                border: '1px solid #fecaca',
                                backgroundColor: '#fff1f2',
                                color: '#e11d48',
                                cursor: 'pointer'
                              }}
                              title="ลบผู้ใช้"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Document Reference Box */}
          <div
            className="moral-modal-doc-ref-box"
            style={{
              padding: '14px 18px',
              backgroundColor: '#f8fafc',
              borderRadius: '14px',
              border: '1px dashed #cbd5e1',
              fontSize: '12.5px',
              color: '#64748b',
              lineHeight: 1.6
            }}
          >
            <strong style={{ color: '#1e293b', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
              อ้างอิงเอกสารข้อเสนอ PMS หน้า 5 (6.1 คุณภาพข้อมูลและสิทธิ์ใช้งาน) & หน้า 7 (7.1 โครงสร้างการรับผิดชอบ):
            </strong>
            <ul className="moral-modal-doc-ref-list" style={{ margin: 0, paddingLeft: 0 }}>
              <li><strong>ผู้บริหารเจ้าภาพ:</strong> กำกับเป้าหมาย อ่านรายงาน และบันทึกข้อสั่งการ</li>
              <li><strong>ผู้ตรวจสอบ (Reviewer):</strong> ตรวจสอบความครบถ้วน ถูกต้อง และส่งกลับแก้ไขก่อนเสนอรับรอง</li>
              <li><strong>ผู้มีอำนาจรับรองผล (Approver):</strong> มีอำนาจรับรองผลการดำเนินงาน ยืนยันผลตามบทบาท</li>
              <li><strong>ผู้มีสิทธิ์ดูอย่างเดียว (Viewer):</strong> ดูข้อมูลความก้าวหน้าเพื่อประโยชน์สาธารณะ โดยไม่สามารถแก้ไขข้อมูลผลงานหรือกดอนุมัติได้</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
