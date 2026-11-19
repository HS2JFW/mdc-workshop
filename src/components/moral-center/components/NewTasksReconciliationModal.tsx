import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  User,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  FileText
} from 'lucide-react';
import type { DiscoveredTaskProposal } from '../data/taskProjectSqliteService';

export interface NewTasksReconciliationModalProps {
  isOpen: boolean;
  projectName: string;
  province: string;
  meetingTopic: string;
  newTasks: DiscoveredTaskProposal[];
  onConfirm: (approvedTasks: DiscoveredTaskProposal[]) => void;
  onCancel: () => void;
}

export const NewTasksReconciliationModal: React.FC<NewTasksReconciliationModalProps> = ({
  isOpen,
  projectName,
  province,
  meetingTopic,
  newTasks: initialTasks,
  onConfirm,
  onCancel
}) => {
  const [tasks, setTasks] = useState<DiscoveredTaskProposal[]>(() => [...initialTasks]);

  // Keep synced if initialTasks change
  React.useEffect(() => {
    setTasks([...initialTasks]);
  }, [initialTasks]);

  if (!isOpen) return null;

  const handleUpdateField = (index: number, field: keyof DiscoveredTaskProposal, val: any) => {
    setTasks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleRemoveTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddNewRow = () => {
    const nextIdx = tasks.length + 1;
    const nowStr = new Date().toISOString().slice(0, 10);
    const futureStr = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const newTask: DiscoveredTaskProposal = {
      temp_id: `manual-new-${Date.now()}`,
      phase_no: 2,
      phase_name: 'ระยะที่ 2: ดำเนินกิจกรรมและติดตามหน้างาน',
      suggested_task_code: `T-2.${nextIdx + 2}`,
      task_name: 'กิจกรรมเพิ่มเติมจากการประชุม',
      task_description: 'ระบุรายละเอียดงานตามมติที่ประชุม',
      deliverable: 'ผลผลิตหรือหลักฐานงาน',
      start_date: nowStr,
      end_date: futureStr,
      duration_days: 14,
      status: 'รอเริ่ม',
      progress_percent: 0,
      responsible_person: 'คณะทำงาน',
      reason_added: `มติที่ประชุมเรื่อง "${meetingTopic}"`
    };
    setTasks((prev) => [...prev, newTask]);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="moral-modal-card moral-tasks-recon-modal-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 960,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #f97316',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          className="moral-modal-header moral-tasks-recon-modal-header"
          style={{
            padding: '16px 20px',
            backgroundColor: '#fff7ed',
            borderBottom: '1px solid #fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#ea580c',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#9a3412' }}>
                Reconciliation Engine: ตรวจพบกิจกรรมใหม่ที่ไม่อยู่ใน Implementation Plan เดิม
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.84rem', color: '#c2410c' }}>
                ระบบตรวจพบว่าที่ประชุมมีมติเพิ่มกิจกรรมใหม่ <strong>{tasks.length} รายการ</strong> กรุณาตรวจสอบก่อนบรรจุเข้าแผนงาน
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="moral-modal-close-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#9a3412',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Project Context Banner */}
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '0.82rem',
            color: '#475569',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16
          }}
        >
          <div>
            <strong>โครงการ:</strong> {projectName} ({province})
          </div>
          <div>
            <strong>การประชุม:</strong> {meetingTopic}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: '#1e40af',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0 }} />
            <span>
              ตามระเบียบ PMS ศูนย์คุณธรรม เมื่อมีมติเพิ่มงานนอกแผนเดิม ระบบจะอัปเดตบรรจุเข้าตาราง{' '}
              <strong>task_project</strong> ก่อนหน้า แล้วคำนวณร้อยละความก้าวหน้ารวม (Overall Progress %) ใหม่ทันที
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
              รายการกิจกรรมใหม่ที่นำเสนอเข้า Implementation Plan ({tasks.length} รายการ)
            </h4>
            <button
              type="button"
              onClick={handleAddNewRow}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              <Plus size={14} /> เพิ่มกิจกรรมเพิ่มเติม
            </button>
          </div>

          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
              ไม่มีรายการกิจกรรมใหม่ (คุณได้ลบรายการออกทั้งหมดแล้ว)
            </div>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', width: 65 }}>ระยะ</th>
                    <th style={{ padding: '8px 10px', width: 80 }}>รหัส</th>
                    <th style={{ padding: '8px 10px' }}>ชื่อกิจกรรม / รายละเอียด</th>
                    <th style={{ padding: '8px 10px', width: 140 }}>ผลผลิต (Deliverable)</th>
                    <th style={{ padding: '8px 10px', width: 110 }}>วันเริ่ม - สิ้นสุด</th>
                    <th style={{ padding: '8px 10px', width: 110 }}>ผู้รับผิดชอบ</th>
                    <th style={{ padding: '8px 10px', width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <tr
                      key={task.temp_id || idx}
                      style={{
                        borderTop: '1px solid #e2e8f0',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                      }}
                    >
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <select
                          value={task.phase_no}
                          onChange={(e) => handleUpdateField(idx, 'phase_no', Number(e.target.value))}
                          style={{
                            padding: '4px',
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.78rem'
                          }}
                        >
                          <option value={1}>ระยะ 1</option>
                          <option value={2}>ระยะ 2</option>
                          <option value={3}>ระยะ 3</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <input
                          type="text"
                          value={task.suggested_task_code}
                          onChange={(e) => handleUpdateField(idx, 'suggested_task_code', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px 6px',
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: '#ea580c'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <input
                          type="text"
                          value={task.task_name}
                          onChange={(e) => handleUpdateField(idx, 'task_name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px 6px',
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            fontWeight: 600,
                            marginBottom: 4
                          }}
                        />
                        <div style={{ fontSize: '0.74rem', color: '#c2410c' }}>
                          📌 <strong>เหตุผลที่เพิ่ม:</strong> {task.reason_added || 'มติที่ประชุม'}
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <input
                          type="text"
                          value={task.deliverable}
                          onChange={(e) => handleUpdateField(idx, 'deliverable', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px 6px',
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.78rem'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <input
                          type="date"
                          value={task.start_date}
                          onChange={(e) => handleUpdateField(idx, 'start_date', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '2px 4px',
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.74rem',
                            marginBottom: 4
                          }}
                        />
                        <input
                          type="date"
                          value={task.end_date}
                          onChange={(e) => handleUpdateField(idx, 'end_date', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '2px 4px',
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.74rem'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <input
                          type="text"
                          value={task.responsible_person}
                          onChange={(e) => handleUpdateField(idx, 'responsible_person', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px 6px',
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.78rem'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px 6px', verticalAlign: 'top', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: 4
                          }}
                          title="ลบรายการนี้"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#64748b',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            ข้าม (ไม่เพิ่มเข้าแผนเดิม)
          </button>
          <button
            type="button"
            disabled={tasks.length === 0}
            onClick={() => onConfirm(tasks)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 20px',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: '#ea580c',
              border: 'none',
              borderRadius: 8,
              cursor: tasks.length === 0 ? 'not-allowed' : 'pointer',
              opacity: tasks.length === 0 ? 0.6 : 1,
              boxShadow: '0 2px 4px rgba(234, 88, 12, 0.3)'
            }}
          >
            <CheckCircle2 size={18} />
            <span>ยืนยันบรรจุเข้า Implementation Plan ({tasks.length} รายการ)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
