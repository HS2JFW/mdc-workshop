import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Trash2,
  Plus,
  FolderKanban,
  Building,
  MapPin,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  AlertCircle,
  User
} from 'lucide-react';
import type { ProjectSummary, TaskProjectRecord } from '../data/taskProjectSqliteService';
import { saveProjectTasksToSqlite } from '../data/taskProjectSqliteService';
import { THAILAND_77_PROVINCES } from '../data/moralProjectsRealtimeStore';

interface ProjectEditModalProps {
  project: ProjectSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedProject: ProjectSummary) => void;
  canEdit?: boolean;
}

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  project,
  isOpen,
  onClose,
  onSaved,
  canEdit = true
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'tasks'>('info');

  // Form States - General Info
  const [projectName, setProjectName] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Form States - Tasks / WBS
  const [tasks, setTasks] = useState<TaskProjectRecord[]>([]);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<number>(0); // 0 = all

  // UI States
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when project changes
  useEffect(() => {
    if (project) {
      setProjectName(project.projectName || '');
      setOrganization(project.organization || 'ศูนย์คุณธรรม (องค์การมหาชน)');
      setProvince(project.province || 'กรุงเทพมหานคร');
      setSummary(
        project.summary ||
          `โครงการ "${project.projectName}" ขับเคลื่อนแผนงานเชิงยุทธศาสตร์ WBS 3 ระยะ ในพื้นที่ จ.${project.province} เพื่อเสริมสร้างและประเมินพฤติกรรมคุณธรรมเชิงประจักษ์ตามเป้าหมายตัวชี้วัด`
      );
      setStartDate(project.startDate || new Date().toISOString().slice(0, 10));
      setEndDate(project.endDate || '2026-12-31');

      // Deep clone tasks
      setTasks(
        project.tasks && project.tasks.length > 0
          ? JSON.parse(JSON.stringify(project.tasks))
          : [
              {
                id: `tsk-${project.projectId}-1`,
                project_id: project.projectId,
                project_name: project.projectName,
                province: project.province,
                phase_no: 1,
                phase_name: 'ระยะที่ 1 : การเตรียมการและชี้แจงเป้าหมาย',
                task_code: 'T-1.1',
                task_name: 'จัดประชุมชี้แจงกรอบแนวทางขับเคลื่อนโครงการ',
                start_date: new Date().toISOString().slice(0, 10),
                end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                duration_days: 30,
                status: 'เสร็จสิ้น',
                progress_percent: 100,
                responsible_person: 'คณะทำงานพื้นที่'
              }
            ]
      );
      setErrorMessage(null);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  // Calculate live stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'เสร็จสิ้น').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'กำลังดำเนินงาน').length;
  const notStartedTasks = tasks.filter((t) => t.status === 'รอเริ่ม').length;
  const sumProgress = tasks.reduce((sum, t) => sum + (Number(t.progress_percent) || 0), 0);
  const calculatedOverallProgress = totalTasks > 0 ? Math.round(sumProgress / totalTasks) : 0;

  // Task Handlers
  const handleTaskChange = (idx: number, field: keyof TaskProjectRecord, value: any) => {
    setTasks((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };

      // Auto update status if progress is changed
      if (field === 'progress_percent') {
        const numVal = Math.min(100, Math.max(0, Number(value) || 0));
        copy[idx].progress_percent = numVal;
        if (numVal >= 100) {
          copy[idx].status = 'เสร็จสิ้น';
        } else if (numVal > 0) {
          copy[idx].status = 'กำลังดำเนินงาน';
        } else {
          copy[idx].status = 'รอเริ่ม';
        }
      }

      // Auto update progress if status is changed
      if (field === 'status') {
        if (value === 'เสร็จสิ้น') copy[idx].progress_percent = 100;
        else if (value === 'รอเริ่ม') copy[idx].progress_percent = 0;
        else if (value === 'กำลังดำเนินงาน' && (copy[idx].progress_percent === 0 || copy[idx].progress_percent === 100)) {
          copy[idx].progress_percent = 50;
        }
      }

      return copy;
    });
  };

  const handleAddTask = (phaseNo: number = 1) => {
    const phaseNames: Record<number, string> = {
      1: 'ระยะที่ 1 : การเตรียมการและชี้แจงเป้าหมาย',
      2: 'ระยะที่ 2 : การดำเนินงานและประเมินผลเชิงประจักษ์',
      3: 'ระยะที่ 3 : การขยายผลและสรุปรายงานความก้าวหน้า'
    };
    const phaseTasks = tasks.filter((t) => t.phase_no === phaseNo);
    const nextSeq = phaseTasks.length + 1;

    const newTask: TaskProjectRecord = {
      id: `tsk-${project.projectId}-${Date.now().toString().slice(-5)}`,
      project_id: project.projectId,
      project_name: projectName,
      province: province,
      organization: organization,
      phase_no: phaseNo,
      phase_name: phaseNames[phaseNo] || `ระยะที่ ${phaseNo}`,
      task_code: `T-${phaseNo}.${nextSeq}`,
      task_name: 'กิจกรรมใหม่',
      task_description: '',
      deliverable: '',
      start_date: startDate || new Date().toISOString().slice(0, 10),
      end_date: endDate || new Date().toISOString().slice(0, 10),
      duration_days: 30,
      status: 'รอเริ่ม',
      progress_percent: 0,
      responsible_person: 'คณะทำงาน'
    };

    setTasks((prev) => [...prev, newTask]);
  };

  const handleDeleteTask = (idx: number) => {
    if (tasks.length <= 1) {
      alert('โครงการจำเป็นต้องมีกิจกรรมการดำเนินงานอย่างน้อย 1 กิจกรรม');
      return;
    }
    setTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save handler
  const handleSave = async () => {
    if (!projectName.trim()) {
      setErrorMessage('กรุณาระบุชื่อโครงการ');
      return;
    }

    if (!canEdit) {
      setErrorMessage('คุณไม่มีสิทธิ์ในการบันทึกหรือแก้ไขข้อมูล (จำเป็นต้องเป็น Data Owner หรือ Admin)');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Prepare payload
      const updatedTasks = tasks.map((t) => ({
        ...t,
        project_name: projectName,
        province: province,
        organization: organization
      }));

      await saveProjectTasksToSqlite({
        projectId: project.projectId,
        projectName,
        province,
        organization,
        tasks: updatedTasks
      });

      const updatedSummary: ProjectSummary = {
        ...project,
        projectName,
        province,
        organization,
        summary,
        startDate,
        endDate,
        tasks: updatedTasks,
        totalTasks: updatedTasks.length,
        completedTasks,
        inProgressTasks,
        notStartedTasks,
        overallProgress: calculatedOverallProgress
      };

      onSaved(updatedSummary);
      onClose();
    } catch (err: any) {
      console.error('Error saving edited project:', err);
      setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTasksWithIndex = tasks
    .map((task, originalIndex) => ({ task, originalIndex }))
    .filter(({ task }) => selectedPhaseFilter === 0 || task.phase_no === selectedPhaseFilter);

  return (
    <div
      className="moral-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="moral-modal-container"
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1.5px solid #cbd5e1',
          animation: 'modalSlideUp 0.25s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}
            >
              <FolderKanban size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  แก้ไขข้อมูลโครงการ
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    border: '1px solid #c7d2fe'
                  }}
                >
                  รหัส: {project.projectId}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                ปรับปรุงข้อมูลโครงการ หน่วยงาน จังหวัด รายละเอียด และขั้นตอนการดำเนินงาน (WBS)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s ease'
            }}
            title="ปิดหน้าต่าง"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher & Quick Stat Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                border: activeTab === 'info' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: activeTab === 'info' ? '#eff6ff' : '#ffffff',
                color: activeTab === 'info' ? '#1d4ed8' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={16} />
              <span>1. ข้อมูลทั่วไปโครงการ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                border: activeTab === 'tasks' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: activeTab === 'tasks' ? '#eff6ff' : '#ffffff',
                color: activeTab === 'tasks' ? '#1d4ed8' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={16} />
              <span>2. ขั้นตอนแผนงาน WBS ({tasks.length})</span>
            </button>
          </div>

          {/* Quick Progress Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              ความก้าวหน้าเฉลี่ย:{' '}
              <strong style={{ color: calculatedOverallProgress >= 100 ? '#10b981' : '#2563eb', fontSize: '15px' }}>
                {calculatedOverallProgress}%
              </strong>
            </div>
            <div
              style={{
                width: 100,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e2e8f0',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${calculatedOverallProgress}%`,
                  backgroundColor: calculatedOverallProgress >= 100 ? '#10b981' : '#2563eb',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div
            style={{
              margin: '14px 24px 0',
              padding: '10px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#b91c1c',
              fontSize: '0.88rem'
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#ffffff'
          }}
        >
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Project Name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: '6px'
                  }}
                >
                  ชื่อโครงการ <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="ระบุชื่อโครงการ..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Organization & Province */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      marginBottom: '6px'
                    }}
                  >
                    หน่วยงาน / องค์กรผู้รับผิดชอบ
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="เช่น สำนักงานพัฒนาชุมชน..."
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.92rem',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <Building
                      size={18}
                      color="#94a3b8"
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      marginBottom: '6px'
                    }}
                  >
                    จังหวัดที่ดำเนินงาน
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.92rem',
                        color: '#0f172a',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    >
                      {THAILAND_77_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                    <MapPin
                      size={18}
                      color="#94a3b8"
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      marginBottom: '6px'
                    }}
                  >
                    วันที่เริ่มโครงการ
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      marginBottom: '6px'
                    }}
                  >
                    วันที่สิ้นสุดโครงการ
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Summary / Description */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: '6px'
                  }}
                >
                  บทสรุปและวัตถุประสงค์โครงการ
                </label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="อธิบายสรุปสาระสำคัญ เป้าหมาย และขอบเขตการดำเนินงาน..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.92rem',
                    color: '#0f172a',
                    outline: 'none',
                    lineHeight: 1.5,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              {/* Task Toolbar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                {/* Phase Filter Tabs */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 0, label: 'ทั้งหมด' },
                    { id: 1, label: 'ระยะที่ 1' },
                    { id: 2, label: 'ระยะที่ 2' },
                    { id: 3, label: 'ระยะที่ 3' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPhaseFilter(p.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: selectedPhaseFilter === p.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: selectedPhaseFilter === p.id ? '#2563eb' : '#f8fafc',
                        color: selectedPhaseFilter === p.id ? '#ffffff' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Add Task Button */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleAddTask(selectedPhaseFilter > 0 ? selectedPhaseFilter : 1)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={15} />
                    <span>เพิ่มกิจกรรม ({selectedPhaseFilter > 0 ? `ระยะที่ ${selectedPhaseFilter}` : 'ระยะที่ 1'})</span>
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredTasksWithIndex.map(({ task, originalIndex }) => (
                  <div
                    key={task.id || `task-${originalIndex}`}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Top Row: Phase + Code + Delete */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                          value={task.phase_no}
                          onChange={(e) => {
                            const newPhase = Number(e.target.value);
                            handleTaskChange(originalIndex, 'phase_no', newPhase);
                            const phaseNames: Record<number, string> = {
                              1: 'ระยะที่ 1 : การเตรียมการและชี้แจงเป้าหมาย',
                              2: 'ระยะที่ 2 : การดำเนินงานและประเมินผลเชิงประจักษ์',
                              3: 'ระยะที่ 3 : การขยายผลและสรุปรายงานความก้าวหน้า'
                            };
                            handleTaskChange(originalIndex, 'phase_name', phaseNames[newPhase] || `ระยะที่ ${newPhase}`);
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#1e293b'
                          }}
                        >
                          <option value={1}>ระยะที่ 1</option>
                          <option value={2}>ระยะที่ 2</option>
                          <option value={3}>ระยะที่ 3</option>
                        </select>

                        <input
                          type="text"
                          value={task.task_code}
                          onChange={(e) => handleTaskChange(originalIndex, 'task_code', e.target.value)}
                          placeholder="รหัส เช่น T-1.1"
                          style={{
                            width: 70,
                            padding: '4px 8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            color: '#334155'
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(originalIndex)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '4px'
                        }}
                        title="ลบกิจกรรมนี้"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Task Name */}
                    <div style={{ marginBottom: '10px' }}>
                      <input
                        type="text"
                        value={task.task_name}
                        onChange={(e) => handleTaskChange(originalIndex, 'task_name', e.target.value)}
                        placeholder="ชื่อกิจกรรมย่อย..."
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1.2px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Progress Slider + Status + Responsible */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.4fr 1fr 1fr',
                        gap: '12px',
                        alignItems: 'center'
                      }}
                    >
                      {/* Progress Slider */}
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.78rem',
                            color: '#475569',
                            marginBottom: '4px'
                          }}
                        >
                          <span>ความก้าวหน้า:</span>
                          <strong style={{ color: task.progress_percent >= 100 ? '#10b981' : '#2563eb' }}>
                            {task.progress_percent}%
                          </strong>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={task.progress_percent}
                          onChange={(e) => handleTaskChange(originalIndex, 'progress_percent', Number(e.target.value))}
                          style={{ width: '100%', cursor: 'pointer' }}
                        />
                      </div>

                      {/* Status Dropdown */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '4px' }}>
                          สถานะ:
                        </label>
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskChange(originalIndex, 'status', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            fontSize: '0.82rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            fontWeight: 600,
                            color:
                              task.status === 'เสร็จสิ้น'
                                ? '#059669'
                                : task.status === 'กำลังดำเนินงาน'
                                ? '#2563eb'
                                : '#64748b'
                          }}
                        >
                          <option value="รอเริ่ม">รอเริ่ม</option>
                          <option value="กำลังดำเนินงาน">กำลังดำเนินงาน</option>
                          <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                        </select>
                      </div>

                      {/* Responsible Person */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '4px' }}>
                          ผู้รับผิดชอบ:
                        </label>
                        <input
                          type="text"
                          value={task.responsible_person || ''}
                          onChange={(e) => handleTaskChange(originalIndex, 'responsible_person', e.target.value)}
                          placeholder="ชื่อหรือคณะทำงาน..."
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            fontSize: '0.82rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              opacity: isSaving ? 0.75 : 1
            }}
          >
            <Save size={16} />
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
