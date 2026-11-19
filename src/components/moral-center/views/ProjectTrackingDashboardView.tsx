import React, { useState, useEffect, useRef } from 'react';
import {
  FolderKanban,
  Activity,
  Plus,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Database,
  Building,
  User,
  Info,
  Eye,
  Shield,
  ShieldCheck,
  Calculator,
  Clock,
  Edit3,
  Paperclip
} from 'lucide-react';
import './ProjectTrackingDashboardView.css';
import { Project360Modal } from '../components/Project360Modal';
import { ProjectEditModal } from '../components/ProjectEditModal';
import { UserPermissionsModal } from '../components/UserPermissionsModal';
import { KpiProcessCalculatorModal } from '../components/KpiProcessCalculatorModal';
import { PmsMeetingReportModal } from '../components/PmsMeetingReportModal';
import {
  type TaskProjectRecord,
  type ProjectSummary,
  type PmsMeetingReportRecord,
  fetchTaskProjectsFromSqlite,
  saveProjectTasksToSqlite,
  updateTaskProgressFromMeetingInSqlite,
  deleteProjectTasksFromSqlite,
  decomposeProjectWithAI,
  getPmsMeetingReportsForProject,
  savePmsMeetingReport
} from '../data/taskProjectSqliteService';
import {
  getActivePmsUser,
  PMS_ROLE_META,
  type PmsUserPermission
} from '../data/pmsDataService';
import { parseProjectDocument, type ParsedDocumentResult } from '../../../lib/projectDocumentParser';
import {
  THAILAND_77_PROVINCES,
  loadProjectMeetings,
  type MoralMeetingEvent,
  type MeetingDocument
} from '../data/moralProjectsRealtimeStore';

export interface ProjectTrackingDashboardViewProps {
  onOpenCalendar?: (project?: ProjectSummary, targetMeetingId?: string) => void;
  onOpenRealtime?: () => void;
}

export const ProjectTrackingDashboardView: React.FC<ProjectTrackingDashboardViewProps> = ({
  onOpenCalendar,
  onOpenRealtime
}) => {
  // State: Active User Permissions & Role Management
  const [activeUser, setActiveUser] = useState<PmsUserPermission>(() => getActivePmsUser());
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);
  const [isKpiCalcModalOpen, setIsKpiCalcModalOpen] = useState<boolean>(false);
  const [kpiCalcInitialId, setKpiCalcInitialId] = useState<string | undefined>(undefined);
  const [isPmsReportModalOpen, setIsPmsReportModalOpen] = useState<boolean>(false);
  const [selectedPmsReport, setSelectedPmsReport] = useState<PmsMeetingReportRecord | null>(null);

  // State: Projects and statistics
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectMeetings, setProjectMeetings] = useState<MoralMeetingEvent[]>(() => loadProjectMeetings());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('ทั้งหมด');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  useEffect(() => {
    const handleFocus = () => {
      setProjectMeetings(loadProjectMeetings());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // State: Expanded projects (Record<projectId, boolean>) - allows toggling hide/show for each project
  const [expandedProjectIds, setExpandedProjectIds] = useState<Record<string, boolean>>({});
  const [selected360Project, setSelected360Project] = useState<ProjectSummary | null>(null);

  // State: Edit Project Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null);

  const handleOpenEditModal = (p: ProjectSummary) => {
    setEditingProject(p);
    setIsEditModalOpen(true);
  };

  const handleProjectSaved = async (updated: ProjectSummary) => {
    await loadProjects();
    setAlertMessage({
      title: 'บันทึกการแก้ไขโครงการสำเร็จ!',
      desc: `อัปเดตข้อมูลโครงการ "${updated.projectName}" เรียบร้อยแล้ว`,
      type: 'success'
    });
  };

  // State: Create Project Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createStep, setCreateStep] = useState<'upload' | 'review'>('upload');
  const [isDropActive, setIsDropActive] = useState<boolean>(false);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [parsedDoc, setParsedDoc] = useState<ParsedDocumentResult | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [newProjectProvince, setNewProjectProvince] = useState<string>('ระยอง');
  const [isDecomposingAI, setIsDecomposingAI] = useState<boolean>(false);

  // State: AI Extracted Review Plan
  const [reviewedProjectName, setReviewedProjectName] = useState<string>('');
  const [reviewedSummary, setReviewedSummary] = useState<string>('');
  const [reviewedOrg, setReviewedOrg] = useState<string>('');
  const [reviewedTasks, setReviewedTasks] = useState<TaskProjectRecord[]>([]);
  const [isSavingTasks, setIsSavingTasks] = useState<boolean>(false);

  // Notification message
  const [alertMessage, setAlertMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle expand/collapse for a specific project (ซ่อนขั้นตอนไว้เป็นค่าเริ่มต้น กดดูถึงจะแสดงออกมา)
  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjectIds((prev) => {
      const current = Boolean(prev[projectId]);
      return {
        ...prev,
        [projectId]: !current
      };
    });
  };

  // Toggle all projects expand / collapse
  const handleToggleAllProjects = (expandAll: boolean) => {
    const nextMap: Record<string, boolean> = {};
    if (expandAll) {
      projects.forEach((p) => {
        nextMap[p.projectId] = true;
      });
    }
    setExpandedProjectIds(nextMap);
  };

  // Load project records on mount
  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTaskProjectsFromSqlite();
      setProjects(data);

      // Default: ซ่อนขั้นตอนงานไว้ทั้งหมด (Collapsed by default) ตามความต้องการของผู้ใช้
      setExpandedProjectIds({});
    } catch (e) {
      console.error('Failed to load projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();

    const handleSync = () => {
      loadProjects();
    };

    const handleUserSync = () => {
      setActiveUser(getActivePmsUser());
    };

    window.addEventListener('moral-projects-db-updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('moral-pms-users-updated', handleUserSync);

    return () => {
      window.removeEventListener('moral-projects-db-updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('moral-pms-users-updated', handleUserSync);
    };
  }, []);

  // Compute aggregate statistics
  const totalProjects = projects.length;

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tasks.some((t) => t.task_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProvince =
      selectedProvinceFilter === 'ทั้งหมด' || p.province === selectedProvinceFilter;

    let matchesDateRange = true;
    if (startDateFilter || endDateFilter) {
      const pMeetings = projectMeetings.filter(
        (m) => m.projectId === p.projectId || m.projectName === p.projectName
      );
      const meetingDates = pMeetings.map((m) => m.date).filter(Boolean);
      const allDates = [
        p.startDate,
        p.endDate,
        ...p.tasks.map((t) => t.start_date || t.end_date || ''),
        ...meetingDates
      ].filter(Boolean);

      const normalizeDate = (dStr: string): string => {
        if (!dStr) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;
        const parsed = Date.parse(dStr);
        if (!isNaN(parsed)) {
          return new Date(parsed).toISOString().slice(0, 10);
        }
        return dStr;
      };

      const normalized = allDates
        .map(normalizeDate)
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));

      if (normalized.length > 0) {
        const minDate = normalized.reduce((min, cur) => (cur < min ? cur : min), normalized[0]);
        const maxDate = normalized.reduce((max, cur) => (cur > max ? cur : max), normalized[0]);

        if (startDateFilter && endDateFilter) {
          matchesDateRange = minDate <= endDateFilter && maxDate >= startDateFilter;
        } else if (startDateFilter) {
          matchesDateRange = maxDate >= startDateFilter;
        } else if (endDateFilter) {
          matchesDateRange = minDate <= endDateFilter;
        }
      }
    }

    return matchesSearch && matchesProvince && matchesDateRange;
  });

  // Handle file drop for Project Creation
  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    setIsParsingFile(true);
    try {
      const result = await parseProjectDocument(file);
      setParsedDoc(result);
      setManualText(result.text);
    } catch (err: any) {
      setAlertMessage({
        title: 'เกิดข้อผิดพลาดในการอ่านไฟล์',
        desc: String(err?.message || err),
        type: 'error'
      });
    } finally {
      setIsParsingFile(false);
    }
  };

  // Run AI Decomposition
  const handleRunAIDecomposition = async () => {
    const contentToAnalyze = manualText.trim() || parsedDoc?.text || '';
    if (!contentToAnalyze) {
      setAlertMessage({
        title: 'กรุณาใส่เนื้อหาเอกสารโครงการ',
        desc: 'กรุณา Drop ไฟล์เอกสาร (.docx, .odt, .xlsx, .csv, .pdf) หรือพิมพ์เนื้อหาในกล่องข้อความ',
        type: 'info'
      });
      return;
    }

    setIsDecomposingAI(true);
    try {
      const result = await decomposeProjectWithAI(contentToAnalyze, parsedDoc?.fileName, newProjectProvince);
      setReviewedProjectName(result.projectName);
      setReviewedSummary(result.summary);
      setReviewedOrg(result.organization);
      setNewProjectProvince(result.province);

      // Flatten phases into task list
      const flatTasks: TaskProjectRecord[] = [];
      for (const ph of result.phases) {
        for (const t of ph.tasks) {
          flatTasks.push(t);
        }
      }
      setReviewedTasks(flatTasks);
      setCreateStep('review');
    } catch (err: any) {
      setAlertMessage({
        title: 'เกิดข้อผิดพลาดในการวิเคราะห์ด้วย AI',
        desc: String(err?.message || err),
        type: 'error'
      });
    } finally {
      setIsDecomposingAI(false);
    }
  };

  // Confirm and Save into SQLite task_project
  const handleConfirmSaveProject = async () => {
    if (!reviewedProjectName.trim()) {
      setAlertMessage({
        title: 'กรุณาระบุชื่อโครงการ',
        desc: 'ชื่อโครงการไม่สามารถเว้นว่างได้',
        type: 'info'
      });
      return;
    }

    setIsSavingTasks(true);
    try {
      const projectId = reviewedTasks[0]?.project_id || `PRJ-${Date.now().toString().slice(-6)}`;
      
      const payloadTasks = reviewedTasks.map((t) => ({
        ...t,
        project_id: projectId,
        project_name: reviewedProjectName,
        province: newProjectProvince,
        organization: reviewedOrg,
        duration_days: calculateDuration(t.start_date, t.end_date)
      }));

      await saveProjectTasksToSqlite({
        projectId,
        projectName: reviewedProjectName,
        province: newProjectProvince,
        organization: reviewedOrg,
        tasks: payloadTasks
      });

      setAlertMessage({
        title: 'บันทึกโครงการสำเร็จ!',
        desc: `จัดเก็บข้อมูลโครงการ "${reviewedProjectName}" และบันทึก ${payloadTasks.length} ขั้นตอนลงในระบบฐานข้อมูลเรียบร้อยแล้ว`,
        type: 'success'
      });

      setIsCreateModalOpen(false);
      resetCreateState();
      await loadProjects();

      // Ensure newly created project is expanded
      setExpandedProjectIds((prev) => ({
        ...prev,
        [projectId]: true
      }));
    } catch (err: any) {
      setAlertMessage({
        title: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        desc: String(err?.message || err),
        type: 'error'
      });
    } finally {
      setIsSavingTasks(false);
    }
  };

  const calculateDuration = (start: string, end: string): number => {
    try {
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  const resetCreateState = () => {
    setCreateStep('upload');
    setParsedDoc(null);
    setManualText('');
    setReviewedProjectName('');
    setReviewedSummary('');
    setReviewedOrg('');
    setReviewedTasks([]);
  };

  // Delete project confirmation with permission check
  const handleDeleteProject = async (projectId: string, name: string) => {
    if (!activeUser.canSubmit) {
      setAlertMessage({
        title: 'ไม่มีสิทธิ์ในการลบโครงการ',
        desc: `คุณกำลังเข้าใช้งานในฐานะ "${activeUser.userName}" (${activeUser.position}) ซึ่งเป็นสิทธิ์ดูอย่างเดียว (Viewer) ไม่สามารถลบโครงการได้`,
        type: 'error'
      });
      return;
    }
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโครงการ "${name}" และงานทั้งหมดในตาราง task_project?`)) {
      await deleteProjectTasksFromSqlite(projectId);
      await loadProjects();
      setAlertMessage({
        title: 'ลบโครงการเรียบร้อยแล้ว',
        desc: `ลบข้อมูลโครงการและ Tasks ของ "${name}" สำเร็จ`,
        type: 'info'
      });
    }
  };

  return (
    <div className="proj-tracking-container">
      {/* Alert Toast Notification */}
      {alertMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 28,
            zIndex: 9999,
            backgroundColor: alertMessage.type === 'success' ? '#ecfdf5' : alertMessage.type === 'error' ? '#fef2f2' : '#eff6ff',
            border: `1px solid ${alertMessage.type === 'success' ? '#10b981' : alertMessage.type === 'error' ? '#ef4444' : '#3b82f6'}`,
            borderRadius: 10,
            padding: '14px 18px',
            maxWidth: 420,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start'
          }}
        >
          {alertMessage.type === 'success' ? (
            <CheckCircle2 size={22} color="#059669" />
          ) : (
            <AlertCircle size={22} color="#2563eb" />
          )}
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: '#0f172a' }}>{alertMessage.title}</h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>{alertMessage.desc}</p>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="proj-tracking-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div className="proj-tracking-title-group" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h1>
            <FolderKanban size={28} color="#2563eb" />
            โครงการภายใต้ศูนย์คุณธรรม
          </h1>
        </div>

        <div className="proj-tracking-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Active User Badge & Role Pill */}
          <div
            onClick={() => setIsPermissionModalOpen(true)}
            title="คลิกเพื่อจัดการตำแหน่งและสิทธิ์ผู้ใช้งาน (ใครเป็นตำแหน่งอะไร, ใครเป็นคน Approve, ใครมีสิทธิ์ดู)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: activeUser.canApprove ? '#fef3c7' : activeUser.canReview ? '#ede9fe' : '#e0f2fe',
                color: activeUser.canApprove ? '#b45309' : activeUser.canReview ? '#6d28d9' : '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {activeUser.canApprove ? <ShieldCheck size={16} /> : <User size={16} />}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                {activeUser.userName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {activeUser.position} • <span style={{ color: activeUser.canApprove ? '#b45309' : activeUser.canReview ? '#7c3aed' : '#2563eb', fontWeight: 700 }}>{PMS_ROLE_META[activeUser.role]?.label}</span>
              </div>
            </div>
          </div>

          {/* User Permission Management Button */}
          <button
            type="button"
            className="proj-btn-secondary"
            onClick={() => setIsPermissionModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 13px',
              fontSize: '0.84rem',
              fontWeight: 700,
              backgroundColor: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1'
            }}
            title="กำหนดสิทธิ์ผู้ใช้งาน ตำแหน่ง และผู้อนุมัติ"
          >
            <Shield size={16} color="#475569" />
            <span>สิทธิ์ผู้ใช้งาน & ผู้อนุมัติ</span>
          </button>

          {/* KPI Calculation Process Button */}
          <button
            type="button"
            className="proj-btn-secondary"
            onClick={() => {
              setKpiCalcInitialId(undefined);
              setIsKpiCalcModalOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 13px',
              fontSize: '0.84rem',
              fontWeight: 700,
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0'
            }}
            title="แสดงขั้นตอนการคิดคำนวณ KPI ตามเอกสารข้อเสนอ ดร.ณพิชญา เทพรอด"
          >
            <Calculator size={16} color="#16a34a" />
            <span>ขั้นตอนคำนวณ KPI</span>
          </button>

          {/* Button: ติดตามโครงการกิจกรรมคุณธรรม Real Time (ข้างปุ่มสร้างโครงการใหม่) */}
          {onOpenRealtime && (
            <button
              type="button"
              className="proj-btn-realtime"
              onClick={onOpenRealtime}
              title="เปิดระบบติดตามโครงการคุณธรรมแบบ Real-Time (AI Meeting State Tracker & แผนที่ 3D 77 จังหวัด)"
            >
              <Activity size={17} />
              <span>ติดตามโครงการกิจกรรมคุณธรรม Real Time</span>
            </button>
          )}

          {/* Create Project Button */}
          <button
            className="proj-btn-primary"
            onClick={() => {
              if (!activeUser.canSubmit) {
                setAlertMessage({
                  title: 'ไม่มีสิทธิ์สร้างโครงการ',
                  desc: `คุณกำลังเข้าใช้งานในฐานะ "${activeUser.userName}" (${activeUser.position}) ซึ่งเป็นสิทธิ์ดูอย่างเดียว (Viewer) หากต้องการสร้างโครงการโปรดเปลี่ยนเป็นสิทธิ์ Data Owner หรือ Admin`,
                  type: 'error'
                });
                return;
              }
              resetCreateState();
              setIsCreateModalOpen(true);
            }}
            style={{
              opacity: activeUser.canSubmit ? 1 : 0.75
            }}
            title={activeUser.canSubmit ? 'สร้างโครงการใหม่' : 'ต้องมีสิทธิ์ Data Owner หรือ Admin ในการสร้างโครงการ'}
          >
            <Sparkles size={17} />
            สร้างโครงการใหม่
          </button>

          <button className="proj-btn-secondary" onClick={loadProjects} title="รีเฟรชข้อมูล">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="proj-filter-bar">
        <div className="proj-search-input-wrap">
          <Search size={16} className="proj-search-icon" />
          <input
            type="text"
            placeholder="ค้นหาชื่อโครงการ หรือ ชื่องานย่อย..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={15} color="#64748b" />
          <select
            className="proj-filter-select"
            value={selectedProvinceFilter}
            onChange={(e) => setSelectedProvinceFilter(e.target.value)}
          >
            <option value="ทั้งหมด">ทุกจังหวัด ({totalProjects})</option>
            {THAILAND_77_PROVINCES.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>

          {/* Date range filter: จากวันที่ - ถึงวันที่ */}
          <div className="proj-date-range-filter">
            <span className="proj-date-filter-label">
              <Calendar size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} />
              ช่วงเวลา:
            </span>
            <input
              type="date"
              className="proj-date-input"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              title="จากวันที่"
            />
            <span className="proj-date-filter-sep">–</span>
            <input
              type="date"
              className="proj-date-input"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              title="ถึงวันที่"
            />
            {(startDateFilter || endDateFilter) && (
              <button
                type="button"
                className="proj-date-clear-btn"
                onClick={() => {
                  setStartDateFilter('');
                  setEndDateFilter('');
                }}
                title="ล้างช่วงเวลาค้นหา"
              >
                ล้างวันที่
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Projects List with Tasks Schedule Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <RefreshCw size={32} className="spin-animate" color="#2563eb" style={{ marginBottom: 12 }} />
          <p>กำลังเชื่อมต่อฐานข้อมูลโครงการ...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '70px 20px', background: '#ffffff', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
          <FolderKanban size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#334155' }}>ยังไม่มีโครงการในระบบ หรือไม่พบผลการค้นหา</h3>
          <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.9rem' }}>
            เริ่มต้นสร้างโครงการใหม่โดยการ Drop ไฟล์เอกสาร (.docx, .odt, .xlsx, .csv, .pdf) เพื่อให้ AI ช่วยแตกขั้นตอนงาน
          </p>
          <button className="proj-btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} />
            สร้างโครงการใหม่ตอนนี้
          </button>
        </div>
      ) : (
        <div className="proj-list">
          {filteredProjects.map((p, pIdx) => {
            const isExpanded = Boolean(expandedProjectIds[p.projectId]);
            return (
              <div key={p.projectId} className="proj-card mdc-style">
                {/* 1. Card Top Header: Circular Logo + Org Name + URL on Left, Calendar Button on Right */}
                <div className="mdc-proj-top-header">
                  <div className="mdc-proj-top-header-left">
                    <div className="mdc-proj-logo-circle">
                      <img
                        src="/moral-center-logo.png"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://mdc.moralcenter.or.th/themes/mdc1_v2/assets/images/logo.png';
                        }}
                        alt="ศูนย์คุณธรรม"
                      />
                    </div>
                    <div className="mdc-proj-meta-top">
                      <div className="mdc-proj-org-title">
                        {p.organization || 'ศูนย์คุณธรรม (องค์การมหาชน)'}
                      </div>
                      <div className="mdc-proj-url-text">
                        https://mdc.moralcenter.or.th/project/{p.projectId}
                      </div>
                    </div>
                  </div>

                  {/* Top-Right of each Project Card: Calendar Button */}
                  <div className="mdc-proj-top-header-right">
                    <button
                      type="button"
                      className="mdc-proj-card-calendar-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCalendar?.(p);
                      }}
                      title={`เปิดปฏิทินนัดหมายการประชุม & ถอดบันทึก AI สำหรับโครงการ ${p.projectName}`}
                    >
                      <Calendar size={15} />
                      <span>ปฏิทินนัดหมายการประชุม</span>
                    </button>
                  </div>
                </div>

                {/* 2. Main Title in Royal Blue (#2544a8) with Sequence Number on Left and Edit / Delete on Right */}
                <div className="mdc-proj-title-row">
                  <h2 className="mdc-proj-main-title">
                    <span className="mdc-proj-seq-num">{pIdx + 1}. </span>
                    {p.projectName}
                  </h2>
                  <div className="mdc-proj-title-actions">
                    <button
                      type="button"
                      className="mdc-proj-title-action-btn edit"
                      onClick={() => handleOpenEditModal(p)}
                      title={`แก้ไขข้อมูลโครงการ ${p.projectName}`}
                    >
                      <Edit3 size={15} />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      type="button"
                      className="mdc-proj-title-action-btn delete"
                      onClick={() => handleDeleteProject(p.projectId, p.projectName)}
                      title={`ลบโครงการ ${p.projectName}`}
                    >
                      <Trash2 size={15} />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>

                {/* 3. Description Paragraph */}
                <p className="mdc-proj-description">
                  {p.summary ||
                    `โครงการ "${p.projectName}" ขับเคลื่อนแผนงานเชิงยุทธศาสตร์ WBS 3 ระยะ ในพื้นที่ จ.${p.province} เพื่อเสริมสร้างและประเมินพฤติกรรมคุณธรรมเชิงประจักษ์ตามเป้าหมายตัวชี้วัด`}
                </p>

                {/* 4. Tags Row */}
                <div className="mdc-proj-tags-row">
                  <span className="mdc-proj-tags-label">Tags : </span>
                  <span className="mdc-proj-tag-pill">{p.province}</span>
                  <span className="mdc-proj-tag-pill">{p.projectId}</span>
                  <span className="mdc-proj-tag-pill">แผนงาน WBS 3 ระยะ</span>
                  <span className="mdc-proj-tag-pill">ความก้าวหน้า {p.overallProgress}%</span>
                  <span className="mdc-proj-tag-pill">{p.totalTasks} กิจกรรม</span>
                </div>

                {/* 5. Date Row */}
                <div className="mdc-proj-date-row">
                  <Clock size={13} className="mdc-proj-clock-icon" />
                  <span>วันที่อัปเดตล่าสุด : {p.endDate || '11 มิถุนายน 2569'}</span>
                </div>

                {/* 6. Attached Files Row Grouped by Meeting (แสดงเรียงตามลำดับนัดหมายล่าสุด 3, 2, 1) */}
                {(() => {
                  const pMeetings = projectMeetings.filter(
                    (m) => m.projectId === p.projectId || m.projectName === p.projectName
                  );
                  // Sort chronologically ascending to compute correct meeting sequence numbers 1, 2, 3...
                  const sortedAsc = [...pMeetings].sort((a, b) => {
                    const dComp = (a.date || '').localeCompare(b.date || '');
                    if (dComp !== 0) return dComp;
                    return (a.timeStart || '').localeCompare(b.timeStart || '');
                  });
                  const meetingsWithSeq = sortedAsc.map((m, idx) => ({ ...m, seqNum: idx + 1 }));
                  // Display in reverse chronological order (e.g. 3, 2, 1)
                  const displayMeetings = [...meetingsWithSeq].reverse();

                  return (
                    <div className="mdc-proj-meeting-row">
                      <span className="mdc-proj-meeting-label">การประชุม : </span>
                      <div className="mdc-proj-meetings-list">
                        {displayMeetings.length === 0 ? (
                          <button
                            type="button"
                            className="mdc-meeting-add-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCalendar?.(p);
                            }}
                            title="คลิกเพื่อเปิดปฏิทินและสร้างนัดหมายการประชุมสำหรับโครงการนี้"
                          >
                            <Calendar size={12} style={{ marginRight: 4 }} />
                            <span>ยังไม่มีการประชุม (+ นัดหมายในปฏิทิน)</span>
                          </button>
                        ) : (
                          displayMeetings.map((meet) => {
                            const docs = meet.documents || [];
                            const isClose = meet.type === 'close';
                            return (
                              <button
                                key={meet.id}
                                type="button"
                                className={`mdc-meeting-seq-btn ${isClose ? 'is-close' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenCalendar?.(p, meet.id);
                                }}
                                title={`เปิดหน้านัดหมาย: ประชุมครั้งที่ ${meet.seqNum}\nหัวข้อ: ${meet.topic}\nวันที่: ${meet.date || '-'} (${meet.timeStart || ''} - ${meet.timeEnd || ''} น.)\n${docs.length > 0 ? `มีไฟล์แนบ ${docs.length} รายการ` : 'ยังไม่มีไฟล์แนบ'}\nคลิกเพื่อเปิดดูรายละเอียด & ไฟล์แนบในปฏิทิน`}
                              >
                                <Calendar size={13} className="mdc-meeting-seq-icon" />
                                <span className="mdc-meeting-seq-text">ประชุมครั้งที่ {meet.seqNum}</span>
                                {docs.length > 0 && (
                                  <span className="mdc-meeting-files-tag" title={`มีไฟล์แนบ ${docs.length} ไฟล์`}>
                                    <Paperclip size={10} style={{ marginRight: 2 }} />
                                    {docs.length}
                                  </span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 7. Progress Bar */}
                <div className="mdc-proj-progress-row">
                  <span className="mdc-proj-progress-label">ความก้าวหน้าโครงการ</span>
                  <div className="mdc-proj-progress-track">
                    <div
                      className="mdc-proj-progress-fill"
                      style={{
                        width: `${p.overallProgress}%`,
                        backgroundColor:
                          p.overallProgress >= 100
                            ? '#10b981'
                            : p.overallProgress >= 50
                            ? '#2563eb'
                            : '#f59e0b'
                      }}
                    />
                  </div>
                  <span className="mdc-proj-progress-pct">{p.overallProgress}%</span>
                </div>

                {/* 8. Bottom Action Bar (ปุ่มควบคุมทั้งหมดอยู่ด้านล่าง) */}
                <div className="mdc-proj-bottom-bar">
                  <div className="mdc-proj-bottom-left">
                    <button
                      type="button"
                      className="proj-btn-primary"
                      onClick={() => setSelected360Project(p)}
                      title="ดูข้อมูลโครงการแบบ 360°"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Eye size={14} />
                      <span>ข้อมูล 360°</span>
                    </button>

                    <button
                      type="button"
                      className="proj-btn-secondary"
                      onClick={() => {
                        setKpiCalcInitialId(undefined);
                        setIsKpiCalcModalOpen(true);
                      }}
                      title="ดูขั้นตอนการคิดคำนวณ KPI และสูตรการประเมินผลโครงการนี้"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 12px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        color: '#15803d',
                        borderColor: '#bbf7d0',
                        background: '#f0fdf4'
                      }}
                    >
                      <Calculator size={14} color="#16a34a" />
                      <span>คำนวณ KPI</span>
                    </button>

                    <button
                      type="button"
                      className="proj-btn-secondary"
                      onClick={() => {
                        const reports = getPmsMeetingReportsForProject(p.projectId);
                        if (reports.length > 0) {
                          setSelectedPmsReport(reports[0]);
                        } else {
                          setSelectedPmsReport({
                            id: `REP02-${p.projectId}`,
                            meetingId: 'PMS-CURRENT',
                            projectId: p.projectId,
                            projectName: p.projectName,
                            province: p.province,
                            meetingDate: new Date().toISOString().slice(0, 10),
                            meetingTopic: 'รายงานติดตามความก้าวหน้าโครงการประจำรอบ',
                            reportingPeriod: 'ประจำเดือน / ไตรมาส',
                            executiveSummary: `โครงการ "${p.projectName}" (จ.${p.province}) มีความคืบหน้ารวม ${p.overallProgress}% โดยดำเนินงานเสร็จสิ้นแล้ว ${p.completedTasks} จากทั้งหมด ${p.totalTasks} กิจกรรมตามแผน WBS`,
                            sourceFileName: 'ระบบติดตามความก้าวหน้า PMS',
                            obstaclesAndRisks: [
                              'การประสานงานพื้นที่ต้องรักษาความต่อเนื่องตามแผน',
                              'การจัดเก็บหลักฐานเชิงประจักษ์ในแต่ละระยะ'
                            ],
                            correctiveSolutions: [
                              'จัดประชุมติดตามผลการดำเนินงานเป็นประจำ',
                              'ใช้ระบบบันทึกความดีและติดตามผ่านดิจิทัล'
                            ],
                            updatedTasks: p.tasks.map((t) => ({
                              id: t.id,
                              task_code: t.task_code,
                              task_name: t.task_name,
                              new_status: t.status,
                              new_progress: t.progress_percent,
                              rationale: t.notes || 'ดำเนินงานตามแผนงาน WBS'
                            })),
                            addedTasks: p.tasks.filter((t) => t.notes?.includes('เพิ่มจากมติที่ประชุม')).map((t) => ({
                              task_code: t.task_code,
                              task_name: t.task_name,
                              phase_name: t.phase_name,
                              start_date: t.start_date,
                              end_date: t.end_date,
                              responsible_person: t.responsible_person || '',
                              reason_added: t.notes || 'บรรจุเพิ่มเติมตามมติที่ประชุม'
                            })),
                            directives: [
                              {
                                directiveText: `เร่งรัดการดำเนินกิจกรรมในระยะที่ 2 และส่งมอบผลผลิตให้ตรงตามกำหนดเวลา`,
                                responsiblePerson: 'ผู้จัดการโครงการและคณะทำงานพื้นที่',
                                dueDate: p.endDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                                priority: 'ด่วน'
                              }
                            ],
                            createdAt: new Date().toISOString()
                          });
                        }
                        setIsPmsReportModalOpen(true);
                      }}
                      title="ดูแบบฟอร์มรายงานผลความก้าวหน้าโครงการและ WBS (FORM-REP-02)"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 12px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        color: '#1d4ed8',
                        borderColor: '#bfdbfe',
                        background: '#eff6ff'
                      }}
                    >
                      <FileText size={14} color="#2563eb" />
                      <span>ดูฟอร์ม FORM-REP-02</span>
                    </button>
                  </div>

                  <div className="mdc-proj-bottom-right">
                    <button
                      type="button"
                      className="proj-btn-secondary"
                      onClick={() => toggleProjectExpand(p.projectId)}
                      title={isExpanded ? 'คลิกเพื่อซ่อนขั้นตอนการดำเนินงาน' : 'คลิกเพื่อแสดงขั้นตอนการดำเนินงาน'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        color: isExpanded ? '#334155' : '#2563eb',
                        borderColor: isExpanded ? '#cbd5e1' : '#93c5fd',
                        background: isExpanded ? '#f8fafc' : '#eff6ff',
                        padding: '6px 14px'
                      }}
                    >
                      <span>{isExpanded ? 'ซ่อนขั้นตอน' : 'แสดงขั้นตอน'}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Tasks Table Section */}
                {isExpanded && (
                  <div className="proj-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ margin: 0, fontSize: '0.96rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Database size={16} color="#2563eb" />
                        ตารางแผนการดำเนินงานและติดตามขั้นตอน
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        คลิกเปลี่ยนสถานะหรือความคืบหน้าของแต่ละกิจกรรมได้โดยตรง
                      </span>
                    </div>

                    <div className="proj-tasks-table-wrap">
                      <table className="proj-tasks-table">
                        <thead>
                          <tr>
                            <th style={{ width: 55, textAlign: 'center' }}>ลำดับ</th>
                            <th style={{ width: 80 }}>รหัส</th>
                            <th>ขั้นตอน / กิจกรรม (Task Name)</th>
                            <th>ผลผลิต (Deliverable)</th>
                            <th style={{ width: 140 }}>ช่วงเวลาดำเนินงาน</th>
                            <th style={{ width: 60, textAlign: 'center' }}>วัน</th>
                            <th style={{ width: 130 }}>ผู้รับผิดชอบ</th>
                            <th style={{ width: 110 }}>สถานะ</th>
                            <th style={{ width: 120 }}>ความคืบหน้า</th>
                            <th>หมายเหตุ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.tasks.map((task, idx) => (
                            <tr key={task.id}>
                              <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b', fontSize: '0.82rem' }}>
                                {idx + 1}
                              </td>
                              <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#2563eb' }}>
                                {task.task_code}
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                                  <span>{task.task_name}</span>
                                  {(task.notes?.includes('เพิ่มจากมติที่ประชุม') || task.last_meeting_id) && (
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        backgroundColor: '#fff7ed',
                                        color: '#c2410c',
                                        border: '1px solid #fed7aa',
                                        padding: '1px 6px',
                                        borderRadius: 4,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 3
                                      }}
                                    >
                                      ✨ เพิ่มจากมติที่ประชุม
                                    </span>
                                  )}
                                </div>
                                {task.task_description && (
                                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                                    {task.task_description}
                                  </div>
                                )}
                              </td>
                              <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                                {task.deliverable || '-'}
                              </td>
                              <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                {task.start_date} ถึง {task.end_date}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.82rem' }}>
                                {task.duration_days}
                              </td>
                              <td style={{ fontSize: '0.8rem', color: '#334155' }}>
                                <User size={12} style={{ display: 'inline', marginRight: 4, color: '#64748b' }} />
                                {task.responsible_person || '-'}
                              </td>
                              <td>
                                <select
                                  value={task.status}
                                  onChange={async (e) => {
                                    const newStat = e.target.value as any;
                                    const newProg = newStat === 'เสร็จสิ้น' ? 100 : newStat === 'รอเริ่ม' ? 0 : 50;
                                    await updateTaskProgressFromMeetingInSqlite([
                                      { id: task.id, status: newStat, progress_percent: newProg }
                                    ]);
                                    await loadProjects();
                                  }}
                                  className={`status-badge ${
                                    task.status === 'เสร็จสิ้น'
                                      ? 'completed'
                                      : task.status === 'กำลังดำเนินงาน'
                                      ? 'in-progress'
                                      : 'not-started'
                                  }`}
                                  style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                                >
                                  <option value="รอเริ่ม">รอเริ่ม</option>
                                  <option value="กำลังดำเนินงาน">กำลังดำเนินงาน</option>
                                  <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                                </select>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                                    <div
                                      style={{
                                        width: `${task.progress_percent}%`,
                                        height: '100%',
                                        background: task.progress_percent >= 100 ? '#10b981' : '#3b82f6'
                                      }}
                                    />
                                  </div>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 600, minWidth: 32, textAlign: 'right' }}>
                                    {task.progress_percent}%
                                  </span>
                                </div>
                              </td>
                              <td style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: 220 }}>
                                {task.notes || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ====================================================================
          MODAL: CREATE PROJECT (DROPZONE & AI TASK DECOMPOSITION)
         ==================================================================== */}
      {isCreateModalOpen && (
        <div className="proj-modal-overlay">
          <div className="proj-modal-card">
            <div className="proj-modal-header">
              <h2 className="proj-modal-title">
                <Sparkles size={22} color="#2563eb" />
                {createStep === 'upload' ? 'สร้างโครงการใหม่ด้วย AI จากเอกสาร' : 'ตรวจสอบและยืนยันแผนงานขั้นตอน (WBS & Timeline)'}
              </h2>
              <button className="proj-modal-close-btn" onClick={() => setIsCreateModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="proj-modal-body">
              {/* STEP 1: UPLOAD & DROPZONE */}
              {createStep === 'upload' && (
                <>
                  <div
                    className={`proj-dropzone ${isDropActive ? 'active' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDropActive(true);
                    }}
                    onDragLeave={() => setIsDropActive(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.odt,.xlsx,.xls,.csv,.pdf,.txt"
                      style={{ display: 'none' }}
                      onChange={handleFileInputChange}
                    />

                    <div className="proj-dropzone-icon">
                      <Upload size={24} />
                    </div>

                    <h3 className="proj-dropzone-title">
                      คลิกเพื่อเลือกไฟล์ หรือลากเอกสารโครงการมาวางที่นี่
                    </h3>

                    <p className="proj-dropzone-sub">
                      รองรับไฟล์เอกสารข้อความโครงการ (Text-based): .docx, .odt, .xlsx, .csv, .pdf (ไม่ใช้ภาพสแกน)
                    </p>

                    <div className="proj-dropzone-tags">
                      <span className="proj-format-tag">.DOCX</span>
                      <span className="proj-format-tag">.ODT</span>
                      <span className="proj-format-tag">.XLSX / .XLS</span>
                      <span className="proj-format-tag">.CSV</span>
                      <span className="proj-format-tag">.PDF (Text)</span>
                    </div>
                  </div>

                  {/* File Loaded Indicator */}
                  {parsedDoc && (
                    <div className="proj-file-info-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText size={20} color="#2563eb" />
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{parsedDoc.fileName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            ขนาด {(parsedDoc.fileSize / 1024).toFixed(1)} KB • สกัดข้อความสำเร็จ ({parsedDoc.text.length} ตัวอักษร)
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: 4 }}>
                        ✓ พร้อมวิเคราะห์ WBS
                      </span>
                    </div>
                  )}

                  {/* Metadata fields */}
                  <div className="proj-form-group">
                    <label>จังหวัดพื้นที่ดำเนินงาน</label>
                    <select
                      value={newProjectProvince}
                      onChange={(e) => setNewProjectProvince(e.target.value)}
                    >
                      {THAILAND_77_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  {/* Text Preview / Manual Paste Box */}
                  <div className="proj-form-group">
                    <label>
                      เนื้อหารายละเอียดโครงการ (ตรวจสอบหรือคัดลอกข้อความเพิ่มเติมได้ที่นี่)
                    </label>
                    <textarea
                      rows={6}
                      placeholder="หากไม่มีไฟล์ สามารถพิมพ์หรือวางเค้าโครงงานโครงการ วัตถุประสงค์ ขั้นตอนการทำงาน และระยะเวลาลงในกล่องนี้ได้โดยตรง..."
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* STEP 2: REVIEW & EDIT EXTRACTED PLAN */}
              {createStep === 'review' && (
                <>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10 }}>
                    <Info size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: '0.84rem', color: '#1e40af' }}>
                      AI ได้สรุปชื่อโครงการและแตกขั้นตอนงาน (WBS) เป็น <strong>{reviewedTasks.length} ขั้นตอน</strong> ท่านสามารถแก้ไขชื่องาน วันที่เริ่ม-สิ้นสุด และผู้รับผิดชอบบนตารางก่อนกด <strong>"Confirm บันทึกข้อมูลลงระบบ"</strong>
                    </span>
                  </div>

                  <div className="proj-form-row">
                    <div className="proj-form-group">
                      <label>ชื่อโครงการ (Project Name)</label>
                      <input
                        type="text"
                        value={reviewedProjectName}
                        onChange={(e) => setReviewedProjectName(e.target.value)}
                      />
                    </div>

                    <div className="proj-form-group">
                      <label>หน่วยงานผู้รับผิดชอบ (Organization)</label>
                      <input
                        type="text"
                        value={reviewedOrg}
                        onChange={(e) => setReviewedOrg(e.target.value)}
                        placeholder="เช่น สำนักงานพัฒนาชุมชนจังหวัด / ศูนย์คุณธรรม"
                      />
                    </div>
                  </div>

                  <div className="proj-form-group">
                    <label>สรุปวัตถุประสงค์และภาพรวม (AI Summary)</label>
                    <textarea
                      rows={2}
                      value={reviewedSummary}
                      onChange={(e) => setReviewedSummary(e.target.value)}
                    />
                  </div>

                  {/* Interactive Editable Task Table */}
                  <div className="proj-form-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>ตารางแผนการดำเนินงานและกำหนดวันเวลา (WBS Schedule)</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>รวม {reviewedTasks.length} รายการ</span>
                    </label>

                    <div className="proj-tasks-table-wrap" style={{ maxHeight: 340, overflowY: 'auto' }}>
                      <table className="proj-tasks-table">
                        <thead>
                          <tr>
                            <th style={{ width: 55, textAlign: 'center' }}>ลำดับ</th>
                            <th style={{ width: 70 }}>รหัส</th>
                            <th>ขั้นตอน / ชื่องาน (Task Name)</th>
                            <th style={{ width: 130 }}>วันเริ่มต้น</th>
                            <th style={{ width: 130 }}>วันสิ้นสุด</th>
                            <th style={{ width: 60, textAlign: 'center' }}>วัน</th>
                            <th style={{ width: 130 }}>ผู้รับผิดชอบ</th>
                            <th style={{ width: 110 }}>สถานะ</th>
                            <th style={{ width: 40 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviewedTasks.map((task, idx) => (
                            <tr key={task.id || idx}>
                              <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b', fontSize: '0.82rem' }}>
                                {idx + 1}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={task.task_code}
                                  onChange={(e) => {
                                    const updated = [...reviewedTasks];
                                    updated[idx].task_code = e.target.value;
                                    setReviewedTasks(updated);
                                  }}
                                  style={{ width: '100%', padding: '4px 6px', fontSize: '0.8rem', fontWeight: 700 }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={task.task_name}
                                  onChange={(e) => {
                                    const updated = [...reviewedTasks];
                                    updated[idx].task_name = e.target.value;
                                    setReviewedTasks(updated);
                                  }}
                                  style={{ width: '100%', padding: '4px 6px', fontSize: '0.84rem' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="date"
                                  value={task.start_date}
                                  onChange={(e) => {
                                    const updated = [...reviewedTasks];
                                    updated[idx].start_date = e.target.value;
                                    updated[idx].duration_days = calculateDuration(e.target.value, task.end_date);
                                    setReviewedTasks(updated);
                                  }}
                                  style={{ width: '100%', padding: '4px 6px', fontSize: '0.78rem' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="date"
                                  value={task.end_date}
                                  onChange={(e) => {
                                    const updated = [...reviewedTasks];
                                    updated[idx].end_date = e.target.value;
                                    updated[idx].duration_days = calculateDuration(task.start_date, e.target.value);
                                    setReviewedTasks(updated);
                                  }}
                                  style={{ width: '100%', padding: '4px 6px', fontSize: '0.78rem' }}
                                />
                              </td>
                              <td style={{ textAlign: 'center', fontSize: '0.82rem', fontWeight: 600 }}>
                                {task.duration_days}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={task.responsible_person || ''}
                                  onChange={(e) => {
                                    const updated = [...reviewedTasks];
                                    updated[idx].responsible_person = e.target.value;
                                    setReviewedTasks(updated);
                                  }}
                                  placeholder="ผู้รับผิดชอบ"
                                  style={{ width: '100%', padding: '4px 6px', fontSize: '0.78rem' }}
                                />
                              </td>
                              <td>
                                <select
                                  value={task.status}
                                  onChange={(e) => {
                                    const updated = [...reviewedTasks];
                                    updated[idx].status = e.target.value as any;
                                    updated[idx].progress_percent =
                                      e.target.value === 'เสร็จสิ้น' ? 100 : e.target.value === 'รอเริ่ม' ? 0 : 50;
                                    setReviewedTasks(updated);
                                  }}
                                  style={{ width: '100%', padding: '4px 6px', fontSize: '0.78rem' }}
                                >
                                  <option value="รอเริ่ม">รอเริ่ม</option>
                                  <option value="กำลังดำเนินงาน">กำลังดำเนินงาน</option>
                                  <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                                </select>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  onClick={() => {
                                    const updated = reviewedTasks.filter((_, i) => i !== idx);
                                    setReviewedTasks(updated);
                                  }}
                                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                  title="ลบงานนี้"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="proj-modal-footer">
              {createStep === 'upload' ? (
                <>
                  <button className="proj-btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                    ยกเลิก
                  </button>
                  <button
                    className="proj-btn-primary"
                    disabled={isDecomposingAI || isParsingFile}
                    onClick={handleRunAIDecomposition}
                  >
                    {isDecomposingAI ? (
                      <>
                        <RefreshCw size={16} className="spin-animate" />
                        AI กำลังวิเคราะห์และแยกขั้นตอนงาน...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        ให้ AI สรุปและแยกขั้นตอนงาน (WBS)
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button className="proj-btn-secondary" onClick={() => setCreateStep('upload')}>
                    กลับไปแก้ไขไฟล์
                  </button>
                  <button
                    className="proj-btn-confirm"
                    disabled={isSavingTasks}
                    onClick={handleConfirmSaveProject}
                  >
                    {isSavingTasks ? (
                      <>
                        <RefreshCw size={16} className="spin-animate" />
                        กำลังบันทึกลงตาราง task_project...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Confirm บันทึกโครงการ
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Project 360 Comprehensive Modal */}
      {selected360Project && (
        <Project360Modal
          project={selected360Project}
          onClose={() => setSelected360Project(null)}
        />
      )}

      {/* Project Edit Modal */}
      {isEditModalOpen && editingProject && (
        <ProjectEditModal
          project={editingProject}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProject(null);
          }}
          onSaved={handleProjectSaved}
          canEdit={activeUser.canSubmit}
        />
      )}

      {/* User Permissions & Role Management Modal */}
      <UserPermissionsModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onUserChanged={(u) => setActiveUser(u)}
      />

      {/* KPI Step-by-Step Calculation Engine Modal */}
      <KpiProcessCalculatorModal
        isOpen={isKpiCalcModalOpen}
        onClose={() => setIsKpiCalcModalOpen(false)}
        initialKpiId={kpiCalcInitialId}
      />

      {/* Official PMS Meeting Report Form Modal (FORM-REP-02 & FORM-DIR-01) */}
      {isPmsReportModalOpen && selectedPmsReport && (
        <PmsMeetingReportModal
          isOpen={isPmsReportModalOpen}
          report={selectedPmsReport}
          onClose={() => {
            setIsPmsReportModalOpen(false);
            setSelectedPmsReport(null);
          }}
          onSaveReport={(updated) => {
            savePmsMeetingReport(updated);
            setSelectedPmsReport(updated);
          }}
        />
      )}
    </div>
  );
};
