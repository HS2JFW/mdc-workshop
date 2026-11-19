import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Printer,
  Share2,
  X,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  ClipboardList,
  Calendar,
  Building,
  User,
  Clock,
  Sliders,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import {
  type PmsMeetingReportRecord,
  savePmsMeetingReport
} from '../data/taskProjectSqliteService';

export interface PmsMeetingReportModalProps {
  isOpen: boolean;
  report: PmsMeetingReportRecord | null;
  onClose: () => void;
  onSaveReport?: (updated: PmsMeetingReportRecord) => void;
}

export const PmsMeetingReportModal: React.FC<PmsMeetingReportModalProps> = ({
  isOpen,
  report,
  onClose,
  onSaveReport
}) => {
  const [draft, setDraft] = useState<PmsMeetingReportRecord | null>(report);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'rep02' | 'dir01'>('rep02');
  const [copied, setCopied] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Synchronize draft when report changes or modal opens
  useEffect(() => {
    if (report) {
      setDraft(JSON.parse(JSON.stringify(report)));
      setIsDirty(false);
      setIsEditing(false);
    }
  }, [report, isOpen]);

  // Handle ESC key and Ctrl+S
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBack();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditing) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditing, isDirty, draft]);

  if (!isOpen || !draft) return null;

  // Navigation: Back Button
  const handleBack = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'คุณมีการแก้ไขข้อมูลที่ยังไม่ได้บันทึก ต้องการย้อนกลับโดยไม่บันทึกหรือไม่?'
      );
      if (!confirmLeave) return;
    }
    setIsEditing(false);
    setIsDirty(false);
    onClose();
  };

  // Action: Save Form
  const handleSave = async () => {
    if (!draft) return;
    const updated: PmsMeetingReportRecord = {
      ...draft,
      updatedAt: new Date().toISOString()
    };

    if (onSaveReport) {
      onSaveReport(updated);
    }
    try {
      await savePmsMeetingReport(updated);
    } catch (err) {
      console.warn('savePmsMeetingReport error:', err);
    }

    setDraft(updated);
    setIsDirty(false);
    setIsEditing(false);
    setSaveToast('บันทึกการแก้ไขแบบฟอร์มเรียบร้อยแล้ว!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Action: Cancel Edit
  const handleCancelEdit = () => {
    if (isDirty) {
      const confirmCancel = window.confirm('ยกเลิกการแก้ไขและคืนค่าข้อมูลเดิมใช่หรือไม่?');
      if (!confirmCancel) return;
    }
    if (report) {
      setDraft(JSON.parse(JSON.stringify(report)));
    }
    setIsDirty(false);
    setIsEditing(false);
  };

  // Action: Print / PDF
  const handlePrint = () => {
    window.print();
  };

  // Action: Copy Summary
  const handleCopySummary = async () => {
    const text = `แบบรายงานผลการประชุม (PMS Form)
โครงการ: ${draft.projectName} (${draft.province})
หัวข้อ: ${draft.meetingTopic}
วันที่: ${draft.meetingDate}
สรุปผล: ${draft.executiveSummary}
จำนวนกิจกรรมที่คืบหน้า: ${draft.updatedTasks.length} กิจกรรม
จำนวนกิจกรรมที่เพิ่มเข้าแผน: ${draft.addedTasks.length} กิจกรรม
มติที่ประชุม: ${draft.directives.map((d) => d.directiveText).join('; ')}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Draft Mutations
  const updateMetadata = (field: keyof PmsMeetingReportRecord, val: any) => {
    setDraft((prev) => (prev ? { ...prev, [field]: val } : prev));
    setIsDirty(true);
  };

  // Updated Tasks Mutations
  const updateUpdatedTask = (index: number, field: string, val: any) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const copy = [...prev.updatedTasks];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, updatedTasks: copy };
    });
    setIsDirty(true);
  };

  const addUpdatedTask = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      const newTask = {
        id: `custom-task-${Date.now()}`,
        task_code: `${prev.updatedTasks.length + 1}.0`,
        task_name: 'ระบุขั้นตอน/กิจกรรมใหม่',
        new_status: 'กำลังดำเนินงาน',
        new_progress: 50,
        rationale: 'อัปเดตความก้าวหน้าจากการประชุม'
      };
      return { ...prev, updatedTasks: [...prev.updatedTasks, newTask] };
    });
    setIsDirty(true);
  };

  const removeUpdatedTask = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const copy = [...prev.updatedTasks];
      copy.splice(index, 1);
      return { ...prev, updatedTasks: copy };
    });
    setIsDirty(true);
  };

  // Added Tasks Mutations
  const updateAddedTask = (index: number, field: string, val: any) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const copy = [...prev.addedTasks];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, addedTasks: copy };
    });
    setIsDirty(true);
  };

  const addAddedTask = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      const newTask = {
        task_code: `ADD-${prev.addedTasks.length + 1}`,
        task_name: 'ระบุชื่อกิจกรรมที่บรรจุเพิ่มเติม',
        phase_name: 'ระยะดำเนินงาน',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        responsible_person: 'คณะทำงาน',
        reason_added: 'บรรจุเพิ่มเติมตามมติที่ประชุม'
      };
      return { ...prev, addedTasks: [...prev.addedTasks, newTask] };
    });
    setIsDirty(true);
  };

  const removeAddedTask = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const copy = [...prev.addedTasks];
      copy.splice(index, 1);
      return { ...prev, addedTasks: copy };
    });
    setIsDirty(true);
  };

  // Obstacles Mutations
  const updateObstacle = (index: number, val: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const copy = [...(prev.obstaclesAndRisks || [])];
      copy[index] = val;
      return { ...prev, obstaclesAndRisks: copy };
    });
    setIsDirty(true);
  };

  const addObstacle = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        obstaclesAndRisks: [...(prev.obstaclesAndRisks || []), 'ระบุปัญหา อุปสรรค หรือความเสี่ยง']
      };
    });
    setIsDirty(true);
  };

  const removeObstacle = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const copy = [...(prev.obstaclesAndRisks || [])];
      copy.splice(index, 1);
      return { ...prev, obstaclesAndRisks: copy };
    });
    setIsDirty(true);
  };

  // Solutions Mutations
  const updateSolution = (index: number, val: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const copy = [...(prev.correctiveSolutions || [])];
      copy[index] = val;
      return { ...prev, correctiveSolutions: copy };
    });
    setIsDirty(true);
  };

  const addSolution = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        correctiveSolutions: [...(prev.correctiveSolutions || []), 'ระบุแนวทางแก้ไขและการสนับสนุน']
      };
    });
    setIsDirty(true);
  };

  const removeSolution = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const copy = [...(prev.correctiveSolutions || [])];
      copy.splice(index, 1);
      return { ...prev, correctiveSolutions: copy };
    });
    setIsDirty(true);
  };

  // Directives Mutations (FORM-DIR-01)
  const updateDirective = (index: number, field: string, val: any) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const copy = [...(prev.directives || [])];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, directives: copy };
    });
    setIsDirty(true);
  };

  const addDirective = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      const newDir = {
        directiveText: 'ระบุข้อสั่งการหรือมติที่ประชุมใหม่',
        responsiblePerson: 'ผู้จัดการโครงการและคณะทำงาน',
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        priority: 'ด่วน' as const
      };
      return { ...prev, directives: [...(prev.directives || []), newDir] };
    });
    setIsDirty(true);
  };

  const removeDirective = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const copy = [...(prev.directives || [])];
      copy.splice(index, 1);
      return { ...prev, directives: copy };
    });
    setIsDirty(true);
  };

  return (
    <div
      className="moral-pms-fullscreen-workspace"
      style={{
        position: 'fixed',
        inset: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        backgroundColor: '#f1f5f9',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Kanit', sans-serif"
      }}
    >
      {/* 1. TOP HEADER BAR (Full Screen Header with Back Button and Edit Controls) */}
      <header
        className="moral-pms-fullscreen-header"
        style={{
          minHeight: 68,
          backgroundColor: '#1e3a8a', // MDC Deep Royal Blue
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 24px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
          zIndex: 100
        }}
      >
        {/* Left Side: Back Button & Form Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="moral-pms-header-back-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 20px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '0.94rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.15s ease'
            }}
            title="ย้อนกลับ (Back)"
          >
            <ArrowLeft size={19} />
            <span>ย้อนกลับ</span>
          </button>

          <div style={{ width: 1, height: 36, backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />

          {/* Form Identity Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileText size={22} color="#ffffff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: '#3b82f6',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontWeight: 700,
                    letterSpacing: '0.5px'
                  }}
                >
                  PMS OFFICIAL FORM
                </span>
                <span
                  style={{
                    backgroundColor: '#10b981',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontWeight: 700
                  }}
                >
                  {activeTab === 'rep02' ? 'FORM-REP-02' : 'FORM-DIR-01'}
                </span>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                  {activeTab === 'rep02'
                    ? 'แบบฟอร์มรายงานความก้าวหน้าโครงการและผลผลิต WBS'
                    : 'แบบบันทึกข้อสั่งการและมติที่ประชุม'}
                </h2>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  color: '#bfdbfe',
                  maxWidth: '55vw',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                โครงการ: <strong>{draft.projectName}</strong> ({draft.province}) • วาระ: {draft.meetingTopic}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Edit / Save / Print / Share Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Toast Notification */}
          {saveToast && (
            <div
              style={{
                backgroundColor: '#065f46',
                border: '1px solid #34d399',
                color: '#ecfdf5',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <CheckCircle2 size={16} color="#34d399" />
              <span>{saveToast}</span>
            </div>
          )}

          {/* Edit / Save Toggle Buttons */}
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                backgroundColor: '#f59e0b', // Amber-500
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.15s ease'
              }}
              title="คลิกเพื่อเริ่มแก้ไขส่วนต่างๆ ของฟอร์ม"
            >
              <Edit3 size={16} />
              <span>แก้ไขฟอร์ม (Edit)</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  backgroundColor: '#10b981', // Emerald-500
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.45)',
                  transition: 'all 0.15s ease'
                }}
                title="บันทึกข้อมูลการแก้ไขทั้งหมด"
              >
                <Save size={16} />
                <span>บันทึกการแก้ไข</span>
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#fecaca',
                  border: '1px solid rgba(254, 202, 202, 0.4)',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="ยกเลิกการแก้ไขและคืนค่าเดิม"
              >
                <RotateCcw size={15} />
                <span>ยกเลิก</span>
              </button>
            </div>
          )}

          {/* Copy Summary Button */}
          <button
            type="button"
            onClick={handleCopySummary}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '8px 13px',
              borderRadius: 8,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
            title="คัดลอกสรุปย่อ"
          >
            {copied ? <Check size={15} color="#86efac" /> : <Share2 size={15} />}
            <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
          </button>

          {/* Print / PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '8px 13px',
              borderRadius: 8,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
            title="พิมพ์เอกสาร หรือบันทึกเป็น PDF"
          >
            <Printer size={15} />
            <span>พิมพ์ / PDF</span>
          </button>

          {/* Close Window (X) */}
          <button
            type="button"
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.8
            }}
            title="ปิดหน้าต่างแบบฟอร์ม"
          >
            <X size={22} />
          </button>
        </div>
      </header>

      {/* 2. SUB-HEADER: TABS & EDIT STATUS BANNER */}
      <nav
        style={{
          height: 48,
          minHeight: 48,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', gap: 4, height: '100%' }}>
          <button
            type="button"
            onClick={() => setActiveTab('rep02')}
            style={{
              padding: '0 20px',
              border: 'none',
              borderBottom: activeTab === 'rep02' ? '3px solid #2563eb' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'rep02' ? '#1e40af' : '#64748b',
              fontWeight: activeTab === 'rep02' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={17} color={activeTab === 'rep02' ? '#2563eb' : '#64748b'} />
            <span>FORM-REP-02: รายงานความก้าวหน้าโครงการและผลผลิต WBS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dir01')}
            style={{
              padding: '0 20px',
              border: 'none',
              borderBottom: activeTab === 'dir01' ? '3px solid #2563eb' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'dir01' ? '#1e40af' : '#64748b',
              fontWeight: activeTab === 'dir01' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <ClipboardList size={17} color={activeTab === 'dir01' ? '#2563eb' : '#64748b'} />
            <span>FORM-DIR-01: แบบบันทึกข้อสั่งการและมติที่ประชุม</span>
          </button>
        </div>

        <div>
          {isEditing ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <Edit3 size={13} color="#d97706" />
              <span>โหมดแก้ไขข้อมูลกำลังทำงาน • คลิกพิมพ์หรือปรับเปลี่ยนข้อมูลในแต่ละส่วนได้โดยตรง</span>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={14} color="#059669" />
              <span>แบบฟอร์มมาตรฐานทางการ PMS ศูนย์คุณธรรม • กดปุ่ม "แก้ไขฟอร์ม" เพื่อแก้ไข</span>
            </div>
          )}
        </div>
      </nav>

      {/* 3. DOCUMENT BODY (Full Viewport Scrollable Document Canvas) */}
      <main
        className="moral-pms-fullscreen-body"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px 48px 32px',
          backgroundColor: '#f1f5f9'
        }}
      >
        {/* Document Paper Container */}
        <div
          className="moral-pms-paper-card"
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
            border: '1px solid #cbd5e1',
            padding: '32px 40px'
          }}
        >
          {/* Paper Formal Header */}
          <div
            style={{
              borderBottom: '2px solid #1e3a8a',
              paddingBottom: 16,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span
                  style={{
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 4
                  }}
                >
                  {activeTab === 'rep02' ? 'FORM-REP-02' : 'FORM-DIR-01'}
                </span>
                <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600 }}>
                  ระบบบริหารผลการดำเนินงาน Performance Management System (PMS)
                </span>
              </div>
              <h1 style={{ margin: '4px 0', fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                {activeTab === 'rep02'
                  ? 'รายงานผลความก้าวหน้าโครงการและผลผลิต WBS'
                  : 'แบบบันทึกข้อสั่งการและมติที่ประชุมตามแผนงาน'}
              </h1>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569' }}>
                ศูนย์คุณธรรม (องค์การมหาชน) • กลุ่มงานยุทธศาสตร์และพัฒนานวัตกรรมคุณธรรม
              </p>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
              <div>รหัสเอกสาร: <strong>{draft.id}</strong></div>
              <div>วันที่สกัด/สร้าง: {draft.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10)}</div>
              {draft.updatedAt && (
                <div style={{ color: '#059669', fontWeight: 600 }}>แก้ไขล่าสุด: {draft.updatedAt.slice(0, 10)}</div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: FORM-REP-02 (รายงานความก้าวหน้าโครงการและผลผลิต WBS)                */}
          {/* ========================================================================= */}
          {activeTab === 'rep02' && (
            <div>
              {/* SECTION 1: Form Metadata */}
              <section
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  backgroundColor: '#f8fafc',
                  padding: '20px',
                  marginBottom: 24
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building size={17} color="#2563eb" />
                    <span>ข้อมูลทั่วไปโครงการและวาระการประชุม (Project & Meeting Information)</span>
                  </h3>
                  {isEditing && (
                    <span style={{ fontSize: '0.76rem', color: '#d97706', fontWeight: 600 }}>
                      * สามารถพิมพ์แก้ไขข้อความในช่องด้านล่างได้
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  {/* Project Name */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                      ชื่อโครงการคุณธรรม
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.projectName}
                        onChange={(e) => updateMetadata('projectName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: '1px solid #94a3b8',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          backgroundColor: '#ffffff'
                        }}
                      />
                    ) : (
                      <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>
                        {draft.projectName}
                      </strong>
                    )}
                  </div>

                  {/* Province */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                      จังหวัดดำเนินงาน
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.province}
                        onChange={(e) => updateMetadata('province', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: '1px solid #94a3b8',
                          fontSize: '0.88rem',
                          backgroundColor: '#ffffff'
                        }}
                      />
                    ) : (
                      <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>
                        {draft.province}
                      </strong>
                    )}
                  </div>

                  {/* Meeting Topic */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                      วาระการประชุม / หัวข้อ
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.meetingTopic}
                        onChange={(e) => updateMetadata('meetingTopic', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: '1px solid #94a3b8',
                          fontSize: '0.88rem',
                          color: '#2563eb',
                          fontWeight: 700,
                          backgroundColor: '#ffffff'
                        }}
                      />
                    ) : (
                      <strong style={{ fontSize: '0.92rem', color: '#2563eb', display: 'block' }}>
                        {draft.meetingTopic}
                      </strong>
                    )}
                  </div>

                  {/* Meeting Date */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                      วันที่จัดประชุม
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.meetingDate}
                        onChange={(e) => updateMetadata('meetingDate', e.target.value)}
                        placeholder="YYYY-MM-DD หรือ วันที่"
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: '1px solid #94a3b8',
                          fontSize: '0.88rem',
                          backgroundColor: '#ffffff'
                        }}
                      />
                    ) : (
                      <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>
                        {draft.meetingDate}
                      </strong>
                    )}
                  </div>

                  {/* Reporting Period */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                      รอบการประเมิน / รายงาน
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.reportingPeriod || ''}
                        onChange={(e) => updateMetadata('reportingPeriod', e.target.value)}
                        placeholder="เช่น ประจำเดือนมกราคม 2567 / ไตรมาส 1"
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: '1px solid #94a3b8',
                          fontSize: '0.88rem',
                          color: '#059669',
                          fontWeight: 600,
                          backgroundColor: '#ffffff'
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 600, display: 'block' }}>
                        {draft.reportingPeriod || 'ประจำเดือน'}
                      </span>
                    )}
                  </div>

                  {/* Source File */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                      เอกสารต้นฉบับ / แหล่งข้อมูล
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.sourceFileName || ''}
                        onChange={(e) => updateMetadata('sourceFileName', e.target.value)}
                        placeholder="ชื่อไฟล์บันทึกการประชุม"
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: '1px solid #94a3b8',
                          fontSize: '0.88rem',
                          backgroundColor: '#ffffff'
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.88rem', color: '#475569', display: 'block' }}>
                        {draft.sourceFileName || 'บันทึกการประชุม'}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* SECTION 2: Executive Summary */}
              <section
                style={{
                  border: '1px solid #bfdbfe',
                  borderRadius: 10,
                  backgroundColor: '#eff6ff',
                  padding: '20px',
                  marginBottom: 24
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.96rem',
                      color: '#1e40af',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Sparkles size={18} color="#2563eb" />
                    <span>สรุปผลความก้าวหน้าภาพรวมจากการประชุม (Executive Summary)</span>
                  </h3>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Edit3 size={13} />
                      <span>แก้ไขส่วนสรุป</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div>
                    <textarea
                      rows={5}
                      value={draft.executiveSummary}
                      onChange={(e) => updateMetadata('executiveSummary', e.target.value)}
                      placeholder="ระบุข้อความสรุปภาพรวมความก้าวหน้าโครงการจากการประชุม..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid #93c5fd',
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        color: '#1e3a8a',
                        backgroundColor: '#ffffff',
                        fontFamily: 'inherit'
                      }}
                    />
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, textAlign: 'right' }}>
                      ความยาว: {draft.executiveSummary.length} ตัวอักษร
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#1e3a8a',
                      lineHeight: 1.65,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {draft.executiveSummary}
                  </p>
                )}
              </section>

              {/* SECTION 3: Updated Tasks Table */}
              <section style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.96rem',
                      color: '#1e293b',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span>
                      รายการขั้นตอนที่ได้รับการอัปเดตความก้าวหน้าในที่ประชุม ({draft.updatedTasks.length} รายการ)
                    </span>
                  </h3>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={addUpdatedTask}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        borderRadius: 6,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} />
                      <span>เพิ่มขั้นตอนในตาราง</span>
                    </button>
                  )}
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflowX: 'auto', backgroundColor: '#ffffff' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#f8fafc',
                          color: '#475569',
                          textAlign: 'left',
                          borderBottom: '2px solid #e2e8f0'
                        }}
                      >
                        <th style={{ padding: '10px 12px', width: 85 }}>รหัสงาน</th>
                        <th style={{ padding: '10px 12px', minWidth: 220 }}>ชื่อขั้นตอน / กิจกรรม (Task Name)</th>
                        <th style={{ padding: '10px 12px', width: 140 }}>สถานะ</th>
                        <th style={{ padding: '10px 12px', width: 140 }}>ความคืบหน้า</th>
                        <th style={{ padding: '10px 12px', minWidth: 240 }}>เหตุผลและข้อเท็จจริงในที่ประชุม (Rationale)</th>
                        {isEditing && <th style={{ padding: '10px 12px', width: 50, textAlign: 'center' }}>ลบ</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {draft.updatedTasks.length === 0 ? (
                        <tr>
                          <td colSpan={isEditing ? 6 : 5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                            ไม่มีขั้นตอนที่ได้รับการปรับความคืบหน้า
                          </td>
                        </tr>
                      ) : (
                        draft.updatedTasks.map((t, idx) => (
                          <tr key={t.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            {/* Code */}
                            <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={t.task_code}
                                  onChange={(e) => updateUpdatedTask(idx, 'task_code', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    borderRadius: 4,
                                    border: '1px solid #cbd5e1',
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    fontSize: '0.82rem'
                                  }}
                                />
                              ) : (
                                t.task_code
                              )}
                            </td>

                            {/* Task Name */}
                            <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={t.task_name}
                                  onChange={(e) => updateUpdatedTask(idx, 'task_name', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '5px 8px',
                                    borderRadius: 4,
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.84rem'
                                  }}
                                />
                              ) : (
                                t.task_name
                              )}
                            </td>

                            {/* Status */}
                            <td style={{ padding: '10px 12px' }}>
                              {isEditing ? (
                                <select
                                  value={t.new_status}
                                  onChange={(e) => updateUpdatedTask(idx, 'new_status', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '5px 8px',
                                    borderRadius: 4,
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                  }}
                                >
                                  <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                                  <option value="กำลังดำเนินงาน">กำลังดำเนินงาน</option>
                                  <option value="รอเริ่ม">รอเริ่ม</option>
                                </select>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '3px 10px',
                                    borderRadius: 4,
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    backgroundColor:
                                      t.new_status === 'เสร็จสิ้น'
                                        ? '#dcfce7'
                                        : t.new_status === 'กำลังดำเนินงาน'
                                        ? '#dbeafe'
                                        : '#f1f5f9',
                                    color:
                                      t.new_status === 'เสร็จสิ้น'
                                        ? '#15803d'
                                        : t.new_status === 'กำลังดำเนินงาน'
                                        ? '#1d4ed8'
                                        : '#64748b'
                                  }}
                                >
                                  {t.new_status}
                                </span>
                              )}
                            </td>

                            {/* Progress */}
                            <td style={{ padding: '10px 12px' }}>
                              {isEditing ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={t.new_progress}
                                    onChange={(e) =>
                                      updateUpdatedTask(idx, 'new_progress', Math.max(0, Math.min(100, Number(e.target.value))))
                                    }
                                    style={{
                                      width: 60,
                                      padding: '4px 6px',
                                      borderRadius: 4,
                                      border: '1px solid #cbd5e1',
                                      fontSize: '0.82rem',
                                      fontWeight: 700
                                    }}
                                  />
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>%</span>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div
                                    style={{
                                      flex: 1,
                                      height: 7,
                                      backgroundColor: '#e2e8f0',
                                      borderRadius: 4,
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <div
                                      style={{
                                        height: '100%',
                                        width: `${t.new_progress}%`,
                                        backgroundColor: t.new_progress === 100 ? '#10b981' : '#3b82f6'
                                      }}
                                    />
                                  </div>
                                  <span style={{ fontWeight: 700, fontSize: '0.8rem', minWidth: 32 }}>
                                    {t.new_progress}%
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Rationale */}
                            <td style={{ padding: '10px 12px', color: '#475569', fontSize: '0.82rem' }}>
                              {isEditing ? (
                                <textarea
                                  rows={2}
                                  value={t.rationale || ''}
                                  onChange={(e) => updateUpdatedTask(idx, 'rationale', e.target.value)}
                                  placeholder="ระบุข้อเท็จจริงหรือผลผลิตที่รายงานในที่ประชุม..."
                                  style={{
                                    width: '100%',
                                    padding: '5px 8px',
                                    borderRadius: 4,
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.82rem',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              ) : (
                                t.rationale
                              )}
                            </td>

                            {/* Delete row action */}
                            {isEditing && (
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => removeUpdatedTask(idx)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: 4
                                  }}
                                  title="ลบแถวนี้"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SECTION 4: Added Tasks (Reconciliation Section) */}
              <section style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.96rem',
                      color: '#c2410c',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Sparkles size={18} color="#ea580c" />
                    <span>
                      กิจกรรมใหม่ที่บรรจุเพิ่มเติมเข้า Implementation Plan ({draft.addedTasks?.length || 0} รายการ)
                    </span>
                  </h3>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={addAddedTask}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        backgroundColor: '#ea580c',
                        color: '#ffffff',
                        borderRadius: 6,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} />
                      <span>บรรจุขั้นตอนใหม่เข้าแผนงาน</span>
                    </button>
                  )}
                </div>

                <div
                  style={{
                    border: '1px solid #fed7aa',
                    borderRadius: 8,
                    overflowX: 'auto',
                    backgroundColor: '#fffaf5'
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#ffedd5',
                          color: '#9a3412',
                          textAlign: 'left',
                          borderBottom: '2px solid #fed7aa'
                        }}
                      >
                        <th style={{ padding: '10px 12px', width: 85 }}>รหัส</th>
                        <th style={{ padding: '10px 12px', minWidth: 200 }}>ชื่อกิจกรรมใหม่</th>
                        <th style={{ padding: '10px 12px', width: 170 }}>ระยะเวลา</th>
                        <th style={{ padding: '10px 12px', width: 150 }}>ผู้รับผิดชอบ</th>
                        <th style={{ padding: '10px 12px', minWidth: 220 }}>เหตุผลที่บรรจุเข้าแผน</th>
                        {isEditing && <th style={{ padding: '10px 12px', width: 50, textAlign: 'center' }}>ลบ</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {!draft.addedTasks || draft.addedTasks.length === 0 ? (
                        <tr>
                          <td colSpan={isEditing ? 6 : 5} style={{ padding: '20px', textAlign: 'center', color: '#9a3412' }}>
                            ไม่มีกิจกรรมใหม่ที่บรรจุเพิ่มในรอบนี้
                          </td>
                        </tr>
                      ) : (
                        draft.addedTasks.map((at, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #fed7aa' }}>
                            {/* Code */}
                            <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#c2410c' }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={at.task_code}
                                  onChange={(e) => updateAddedTask(idx, 'task_code', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    borderRadius: 4,
                                    border: '1px solid #fdba74',
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    fontSize: '0.82rem'
                                  }}
                                />
                              ) : (
                                at.task_code
                              )}
                            </td>

                            {/* Task Name */}
                            <td style={{ padding: '10px 12px', fontWeight: 600, color: '#7c2d12' }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={at.task_name}
                                  onChange={(e) => updateAddedTask(idx, 'task_name', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '5px 8px',
                                    borderRadius: 4,
                                    border: '1px solid #fdba74',
                                    fontSize: '0.84rem'
                                  }}
                                />
                              ) : (
                                at.task_name
                              )}
                            </td>

                            {/* Dates */}
                            <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#475569' }}>
                              {isEditing ? (
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <input
                                    type="text"
                                    value={at.start_date || ''}
                                    placeholder="เริ่ม"
                                    onChange={(e) => updateAddedTask(idx, 'start_date', e.target.value)}
                                    style={{
                                      width: '50%',
                                      padding: '4px 6px',
                                      borderRadius: 4,
                                      border: '1px solid #fdba74',
                                      fontSize: '0.78rem'
                                    }}
                                  />
                                  <input
                                    type="text"
                                    value={at.end_date || ''}
                                    placeholder="สิ้นสุด"
                                    onChange={(e) => updateAddedTask(idx, 'end_date', e.target.value)}
                                    style={{
                                      width: '50%',
                                      padding: '4px 6px',
                                      borderRadius: 4,
                                      border: '1px solid #fdba74',
                                      fontSize: '0.78rem'
                                    }}
                                  />
                                </div>
                              ) : (
                                `${at.start_date} ถึง ${at.end_date}`
                              )}
                            </td>

                            {/* Responsible */}
                            <td style={{ padding: '10px 12px', fontSize: '0.82rem' }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={at.responsible_person || ''}
                                  onChange={(e) => updateAddedTask(idx, 'responsible_person', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    borderRadius: 4,
                                    border: '1px solid #fdba74',
                                    fontSize: '0.82rem'
                                  }}
                                />
                              ) : (
                                at.responsible_person
                              )}
                            </td>

                            {/* Reason Added */}
                            <td style={{ padding: '10px 12px', fontSize: '0.82rem', color: '#9a3412' }}>
                              {isEditing ? (
                                <textarea
                                  rows={2}
                                  value={at.reason_added || ''}
                                  onChange={(e) => updateAddedTask(idx, 'reason_added', e.target.value)}
                                  placeholder="ระบุเหตุผลในการบรรจุเข้าแผน..."
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    borderRadius: 4,
                                    border: '1px solid #fdba74',
                                    fontSize: '0.82rem',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              ) : (
                                at.reason_added
                              )}
                            </td>

                            {/* Delete action */}
                            {isEditing && (
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => removeAddedTask(idx)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: 4
                                  }}
                                  title="ลบแถวนี้"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SECTION 5: Obstacles, Risks & Corrective Solutions */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {/* Obstacles Box */}
                <div
                  style={{
                    border: '1px solid #fecaca',
                    borderRadius: 10,
                    padding: '16px 18px',
                    backgroundColor: '#fef2f2'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: '#b91c1c',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>ปัญหา อุปสรรค และความเสี่ยง</span>
                    </h4>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={addObstacle}
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          color: '#b91c1c',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Plus size={12} />
                        <span>เพิ่ม</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {draft.obstaclesAndRisks?.map((obs, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="text"
                            value={obs}
                            onChange={(e) => updateObstacle(i, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '5px 8px',
                              borderRadius: 4,
                              border: '1px solid #fca5a5',
                              fontSize: '0.82rem',
                              color: '#991b1b',
                              backgroundColor: '#ffffff'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeObstacle(i)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.84rem', color: '#991b1b', lineHeight: 1.6 }}>
                      {draft.obstaclesAndRisks?.map((obs, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>{obs}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Solutions Box */}
                <div
                  style={{
                    border: '1px solid #bbf7d0',
                    borderRadius: 10,
                    padding: '16px 18px',
                    backgroundColor: '#f0fdf4'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: '#15803d',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>แนวทางแก้ไขและการสนับสนุนที่ต้องการ</span>
                    </h4>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={addSolution}
                        style={{
                          background: '#dcfce7',
                          border: '1px solid #86efac',
                          color: '#15803d',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Plus size={12} />
                        <span>เพิ่ม</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {draft.correctiveSolutions?.map((sol, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="text"
                            value={sol}
                            onChange={(e) => updateSolution(i, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '5px 8px',
                              borderRadius: 4,
                              border: '1px solid #86efac',
                              fontSize: '0.82rem',
                              color: '#166534',
                              backgroundColor: '#ffffff'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeSolution(i)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.84rem', color: '#166534', lineHeight: 1.6 }}>
                      {draft.correctiveSolutions?.map((sol, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>{sol}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: FORM-DIR-01 (แบบบันทึกข้อสั่งการและมติที่ประชุม)                     */}
          {/* ========================================================================= */}
          {activeTab === 'dir01' && (
            <div>
              <section
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  backgroundColor: '#ffffff',
                  padding: '20px',
                  marginBottom: 20
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      แบบบันทึกข้อสั่งการและมติที่ประชุม (FORM-DIR-01)
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                      รวบรวมข้อสั่งการและมติที่ประชุม เพื่อนำไปติดตามผลในระบบบริหารผลการดำเนินงาน (PMS)
                    </p>
                  </div>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={addDirective}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 14px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        borderRadius: 6,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} />
                      <span>เพิ่มข้อสั่งการ</span>
                    </button>
                  )}
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#f8fafc',
                          color: '#475569',
                          textAlign: 'left',
                          borderBottom: '2px solid #e2e8f0'
                        }}
                      >
                        <th style={{ padding: '10px 12px', width: 50, textAlign: 'center' }}>ลำดับ</th>
                        <th style={{ padding: '10px 12px', minWidth: 260 }}>ข้อสั่งการ / มติที่ประชุม (Directive Text)</th>
                        <th style={{ padding: '10px 12px', width: 180 }}>ผู้รับผิดชอบ</th>
                        <th style={{ padding: '10px 12px', width: 140 }}>กำหนดเสร็จ</th>
                        <th style={{ padding: '10px 12px', width: 120, textAlign: 'center' }}>ลำดับความสำคัญ</th>
                        {isEditing && <th style={{ padding: '10px 12px', width: 50, textAlign: 'center' }}>ลบ</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {!draft.directives || draft.directives.length === 0 ? (
                        <tr>
                          <td colSpan={isEditing ? 6 : 5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                            ไม่มีข้อสั่งการในที่ประชุมนี้
                          </td>
                        </tr>
                      ) : (
                        draft.directives.map((dir, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            {/* Index */}
                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                              {idx + 1}
                            </td>

                            {/* Directive Text */}
                            <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>
                              {isEditing ? (
                                <textarea
                                  rows={2}
                                  value={dir.directiveText}
                                  onChange={(e) => updateDirective(idx, 'directiveText', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    borderRadius: 4,
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.84rem',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              ) : (
                                dir.directiveText
                              )}
                            </td>

                            {/* Responsible */}
                            <td style={{ padding: '10px 12px', color: '#475569' }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={dir.responsiblePerson || ''}
                                  onChange={(e) => updateDirective(idx, 'responsiblePerson', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '5px 8px',
                                    borderRadius: 4,
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.84rem'
                                  }}
                                />
                              ) : (
                                dir.responsiblePerson
                              )}
                            </td>

                            {/* Due Date */}
                            <td style={{ padding: '10px 12px', color: '#475569' }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={dir.dueDate || ''}
                                  placeholder="YYYY-MM-DD"
                                  onChange={(e) => updateDirective(idx, 'dueDate', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '5px 8px',
                                    borderRadius: 4,
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.84rem'
                                  }}
                                />
                              ) : (
                                dir.dueDate
                              )}
                            </td>

                            {/* Priority */}
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              {isEditing ? (
                                <select
                                  value={dir.priority}
                                  onChange={(e) => updateDirective(idx, 'priority', e.target.value)}
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: 4,
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.8rem',
                                    fontWeight: 700
                                  }}
                                >
                                  <option value="ด่วนที่สุด">ด่วนที่สุด</option>
                                  <option value="ด่วน">ด่วน</option>
                                  <option value="ปกติ">ปกติ</option>
                                </select>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '3px 10px',
                                    borderRadius: 4,
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    backgroundColor:
                                      dir.priority === 'ด่วนที่สุด'
                                        ? '#fee2e2'
                                        : dir.priority === 'ด่วน'
                                        ? '#ffedd5'
                                        : '#e2e8f0',
                                    color:
                                      dir.priority === 'ด่วนที่สุด'
                                        ? '#b91c1c'
                                        : dir.priority === 'ด่วน'
                                        ? '#c2410c'
                                        : '#475569'
                                  }}
                                >
                                  {dir.priority || 'ปกติ'}
                                </span>
                              )}
                            </td>

                            {/* Delete action */}
                            {isEditing && (
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => removeDirective(idx)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: 4
                                  }}
                                  title="ลบแถวนี้"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* 4. FULLSCREEN BOTTOM FOOTER BAR */}
      <footer
        style={{
          height: 48,
          minHeight: 48,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.05)',
          zIndex: 90
        }}
      >
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          แบบฟอร์มทางการ: <strong>{activeTab === 'rep02' ? 'FORM-REP-02' : 'FORM-DIR-01'}</strong> • รหัสโครงการ: {draft.projectId} • ศูนย์คุณธรรม (องค์การมหาชน)
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isDirty && (
            <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 600 }}>
              * มีการแก้ไขที่ยังไม่ได้บันทึก
            </span>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={handleSave}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 16px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Save size={14} />
              <span>บันทึกการแก้ไข</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleBack}
            style={{
              padding: '6px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            ย้อนกลับ
          </button>
        </div>
      </footer>
    </div>
  );
};
