import React, { useRef, useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ExternalLink,
  Copy,
  Check,
  CheckSquare,
  Square,
  X,
  CalendarDays,
  Video,
  FileText,
  Clock,
  Trash2,
  Sparkles,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  MapPin,
  Database,
  Users,
  UserPlus,
  UserCheck,
  Search,
  Maximize2,
  Minimize2,
  Paperclip
} from 'lucide-react';
import {
  type CalendarTeam,
  type CalendarTeamMember,
  loadCalendarTeams,
  saveCalendarTeams,
  getActiveCalendarTeam,
  setActiveCalendarTeam,
  createCalendarTeam,
  addMemberToActiveTeam,
  removeMemberFromActiveTeam,
  searchAvailableUsers,
  getAvatarColorForUser
} from '../data/calendarTeamService';
import { extractTextFromFile } from '../../../lib/moralEvaluationService';
import {
  THAILAND_77_PROVINCES,
  PROJECT_STATE_META,
  type MoralTrackedProject,
  type MoralMeetingEvent,
  type MeetingDocument,
  type MeetingStatus,
  loadTrackedProjects,
  loadProjectMeetings,
  saveProjectMeetings,
  addAttachmentToMeeting,
  removeAttachmentFromMeeting,
  createNewTrackedProject,
  updateTrackedProjectProvince,
  updateProjectStateFromMeetingSummary,
  summarizeAndClassifyProjectStateWithAI
} from '../data/moralProjectsRealtimeStore';
import {
  fetchTaskProjectsFromSqlite,
  updateTaskProgressFromMeetingInSqlite,
  analyzeMeetingMinutesWithTasksAI,
  syncNewTrackedProjectToSqlite,
  appendNewDiscoveredTasksToProject,
  savePmsMeetingReport,
  getPmsMeetingReportByMeetingId,
  type ProjectSummary,
  type DiscoveredTaskProposal,
  type MeetingAnalysisSyncResult,
  type PmsMeetingReportRecord
} from '../data/taskProjectSqliteService';
import { addPmsDecisionAction } from '../data/pmsDataService';
import { NewTasksReconciliationModal } from '../components/NewTasksReconciliationModal';
import { PmsMeetingReportModal } from '../components/PmsMeetingReportModal';

export interface PublicKnowledgeMeetingViewProps {
  onBack?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  initialProjectId?: string;
  initialMeetingId?: string;
}

export const PublicKnowledgeMeetingView: React.FC<PublicKnowledgeMeetingViewProps> = ({
  onBack,
  onToggleFullscreen,
  isFullscreen = true,
  initialProjectId,
  initialMeetingId
}) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Projects state (loaded from shared real-time store)
  const [projects, setProjects] = useState<MoralTrackedProject[]>(() => loadTrackedProjects());
  const [sqliteProjects, setSqliteProjects] = useState<ProjectSummary[]>([]);

  // Meetings list state (loaded from shared real-time store)
  const [meetings, setMeetings] = useState<MoralMeetingEvent[]>(() => loadProjectMeetings());

  // Drag state for calendar grid (2D scrolling)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);

  // Filter states
  const [filterBooking, setFilterBooking] = useState(true);
  const [filterMeeting, setFilterMeeting] = useState(true);
  const [filterClose, setFilterClose] = useState(true);

  // Date States
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 6, 8)); // July 8, 2026
  const [currentMonth, setCurrentMonth] = useState<number>(6); // July (0-indexed)
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // Selected event for popover dialog
  const [activeEvent, setActiveEvent] = useState<MoralMeetingEvent | null>(null);

  // State for confirm booking / create meeting dialog
  const [confirmBookingSlot, setConfirmBookingSlot] = useState<{ dateStr: string; hourStr: string } | null>(null);
  const [bookingProjectId, setBookingProjectId] = useState<string>(initialProjectId || '');
  const [bookingTopic, setBookingTopic] = useState<string>('');
  const [bookingType, setBookingType] = useState<MeetingStatus>('meeting');
  const [bookingDocuments, setBookingDocuments] = useState<MeetingDocument[]>([]);

  useEffect(() => {
    if (initialProjectId) {
      setBookingProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  // Jump to & focus target meeting if initialMeetingId is provided
  useEffect(() => {
    if (initialMeetingId) {
      const allMeetings = loadProjectMeetings();
      setMeetings(allMeetings);
      const target = allMeetings.find((m) => m.id === initialMeetingId);
      if (target) {
        if (target.date) {
          const parts = target.date.split('-');
          if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const d = parseInt(parts[2], 10);
            setSelectedDate(new Date(y, m, d));
            setCurrentMonth(m);
            setCurrentYear(y);
          }
        }
        setActiveEvent(target);

        // Smooth scroll grid to the exact day & hour slot
        setTimeout(() => {
          if (gridContainerRef.current) {
            const parts = (target.date || '').split('-');
            const day = parts.length === 3 ? parseInt(parts[2], 10) : 1;
            const colWidth = 195;
            const timeLabelWidth = 124;
            const targetScrollLeft = timeLabelWidth + (day - 1) * colWidth - (gridContainerRef.current.clientWidth - colWidth) / 2;

            let targetTop = 0;
            if (target.timeStart) {
              const h = parseInt(target.timeStart.split(':')[0], 10);
              const hourIndex = Math.max(0, h - 8);
              targetTop = hourIndex * 85;
            }

            gridContainerRef.current.scrollTo({
              left: Math.max(0, targetScrollLeft),
              top: Math.max(0, targetTop - 60),
              behavior: 'smooth'
            });
          }
        }, 120);
      }
    }
  }, [initialMeetingId]);

  // State for alert dialog
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  // Copy Link State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy AI Summary State
  const [copiedSummaryId, setCopiedSummaryId] = useState<string | null>(null);

  // AI Minutes Drop & Summarization State
  const [isDropOverMinutes, setIsDropOverMinutes] = useState<boolean>(false);
  const [isSummarizingMinutes, setIsSummarizingMinutes] = useState<boolean>(false);
  const [dbSyncBanner, setDbSyncBanner] = useState<string | null>(null);

  // PMS Form Viewer Modal & Reconciliation Modal state
  const [isPmsReportModalOpen, setIsPmsReportModalOpen] = useState<boolean>(false);
  const [selectedPmsReport, setSelectedPmsReport] = useState<PmsMeetingReportRecord | null>(null);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState<boolean>(false);
  const [pendingReconciliation, setPendingReconciliation] = useState<{
    targetEvent: MoralMeetingEvent;
    matchedSqliteProj: ProjectSummary;
    syncResult: MeetingAnalysisSyncResult;
    rawSummary: any;
    docName: string;
  } | null>(null);

  // Hovered empty grid cell state
  const [hoveredCellKey, setHoveredCellKey] = useState<string | null>(null);

  // File input ref for meeting minutes
  const minutesFileInputRef = useRef<HTMLInputElement>(null);

  // Team management state
  const [teams, setTeams] = useState<CalendarTeam[]>(() => loadCalendarTeams());
  const [activeTeam, setActiveTeam] = useState<CalendarTeam>(() => getActiveCalendarTeam());
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>('');
  const [newTeamNameInput, setNewTeamNameInput] = useState<string>('');
  const [isSlotAddUserModalOpen, setIsSlotAddUserModalOpen] = useState<MoralMeetingEvent | null>(null);
  const [bookingAttendees, setBookingAttendees] = useState<CalendarTeamMember[]>([]);

  // Custom new user addition state inside team modal
  const [newCustomUserName, setNewCustomUserName] = useState<string>('');
  const [newCustomUserRole, setNewCustomUserRole] = useState<string>('ผู้ร่วมขับเคลื่อน');
  const [newCustomUserDept, setNewCustomUserDept] = useState<string>('ศูนย์คุณธรรม / เครือข่าย');

  // Load SQLite projects for dropdown and linkage
  const loadSqlite = async () => {
    try {
      const data = await fetchTaskProjectsFromSqlite();
      setSqliteProjects(data);
      if (data.length > 0 && !bookingProjectId) {
        setBookingProjectId(data[0].projectId);
      }
    } catch (e) {
      console.error('Failed to load sqlite projects for meetings:', e);
    }
  };

  // Listen to external DB & Team updates
  useEffect(() => {
    loadSqlite();
    const handleSync = () => {
      setProjects(loadTrackedProjects());
      setMeetings(loadProjectMeetings());
      loadSqlite();
      setTeams(loadCalendarTeams());
      setActiveTeam(getActiveCalendarTeam());
    };
    window.addEventListener('moral-projects-db-updated', handleSync);
    window.addEventListener('moral-calendar-teams-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('moral-projects-db-updated', handleSync);
      window.removeEventListener('moral-calendar-teams-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleToggleAttendeeInMeeting = (eventId: string, member: CalendarTeamMember) => {
    const nextMeetings = meetings.map((m) => {
      if (m.id === eventId) {
        const curAttendees = m.attendees || [];
        const exists = curAttendees.some((a) => a.userId === member.userId);
        const nextAttendees = exists
          ? curAttendees.filter((a) => a.userId !== member.userId)
          : [...curAttendees, member];
        return { ...m, attendees: nextAttendees };
      }
      return m;
    });
    setMeetings(nextMeetings);
    saveProjectMeetings(nextMeetings);

    if (activeEvent && activeEvent.id === eventId) {
      const curAttendees = activeEvent.attendees || [];
      const exists = curAttendees.some((a) => a.userId === member.userId);
      const nextAttendees = exists
        ? curAttendees.filter((a) => a.userId !== member.userId)
        : [...curAttendees, member];
      setActiveEvent({ ...activeEvent, attendees: nextAttendees });
    }

    if (isSlotAddUserModalOpen && isSlotAddUserModalOpen.id === eventId) {
      const curAttendees = isSlotAddUserModalOpen.attendees || [];
      const exists = curAttendees.some((a) => a.userId === member.userId);
      const nextAttendees = exists
        ? curAttendees.filter((a) => a.userId !== member.userId)
        : [...curAttendees, member];
      setIsSlotAddUserModalOpen({ ...isSlotAddUserModalOpen, attendees: nextAttendees });
    }
  };

  const handleAddMemberToTeam = (member: CalendarTeamMember) => {
    const updated = addMemberToActiveTeam(member);
    setActiveTeam(updated);
    setTeams(loadCalendarTeams());
  };

  const handleRemoveMemberFromTeam = (userId: string) => {
    const updated = removeMemberFromActiveTeam(userId);
    setActiveTeam(updated);
    setTeams(loadCalendarTeams());
  };

  const handleCreateNewTeam = () => {
    if (!newTeamNameInput.trim()) return;
    const newTeam = createCalendarTeam(newTeamNameInput.trim());
    setActiveTeam(newTeam);
    setTeams(loadCalendarTeams());
    setNewTeamNameInput('');
  };

  const handleAddCustomUserToTeam = () => {
    if (!newCustomUserName.trim()) return;
    const newMember: CalendarTeamMember = {
      userId: `usr-custom-${Date.now()}`,
      userName: newCustomUserName.trim(),
      position: newCustomUserRole.trim() || 'ผู้ร่วมขับเคลื่อน',
      department: newCustomUserDept.trim() || 'ศูนย์คุณธรรม',
      role: 'custom_member',
      roleLabel: newCustomUserRole.trim() || 'สมาชิกทีม',
      roleBg: '#eff6ff',
      roleColor: '#1d4ed8',
      avatarBg: getAvatarColorForUser(newCustomUserName.trim())
    };
    handleAddMemberToTeam(newMember);
    setNewCustomUserName('');
    setTeamSearchQuery('');
  };

  // Months array
  const monthNamesTh = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonthCount = getDaysInMonth(currentYear, currentMonth);

  // Empty days before day 1 of month (Sunday = 0)
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Days array for detail table
  const daysOfMonth = Array.from({ length: daysInMonthCount }, (_, i) => {
    const dayNum = i + 1;
    const dateObj = new Date(currentYear, currentMonth, dayNum);
    const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    return {
      dayNum,
      dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
      dayName: dayNames[dateObj.getDay()]
    };
  });

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Auto-scroll to selected date column
  useEffect(() => {
    if (gridContainerRef.current) {
      const day = selectedDate.getDate();
      const colWidth = 195;
      const timeLabelWidth = 124;
      const targetScrollLeft = timeLabelWidth + (day - 1) * colWidth - (gridContainerRef.current.clientWidth - colWidth) / 2;

      gridContainerRef.current.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth'
      });
    }
  }, [selectedDate]);

  // 2D Scroll-drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('select') || target.closest('#document-popover')) {
      return;
    }

    if (!gridContainerRef.current) return;
    setIsDragging(true);
    setDragMoved(false);
    setStartX(e.pageX - gridContainerRef.current.offsetLeft);
    setStartY(e.pageY - gridContainerRef.current.offsetTop);
    setScrollLeft(gridContainerRef.current.scrollLeft);
    setScrollTop(gridContainerRef.current.scrollTop);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !gridContainerRef.current) return;
    const x = e.pageX - gridContainerRef.current.offsetLeft;
    const y = e.pageY - gridContainerRef.current.offsetTop;
    if (Math.hypot(x - startX, y - startY) < 7) return;
    e.preventDefault();
    setDragMoved(true);
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    gridContainerRef.current.scrollLeft = scrollLeft - walkX;
    gridContainerRef.current.scrollTop = scrollTop - walkY;
  };

  const handleSlotClick = (e: React.MouseEvent, event: MoralMeetingEvent) => {
    if (dragMoved) return;
    e.stopPropagation();
    setDbSyncBanner(null);
    setActiveEvent(activeEvent?.id === event.id ? null : event);
  };

  // Single-click empty cell to open Create Meeting dialog with Project Dropdown
  const handleCellClick = (dateStr: string, hourStr: string) => {
    if (dragMoved) return;

    const defaultProj = sqliteProjects[0];
    if (defaultProj) {
      setBookingProjectId(defaultProj.projectId);
      setBookingTopic(`ประชุมติดตามและขับเคลื่อน: ${defaultProj.projectName}`);
    } else {
      setBookingTopic('ประชุมติดตามและขับเคลื่อนโครงการคุณธรรม');
    }
    setBookingType('meeting');
    setBookingDocuments([]);
    setActiveEvent(null);
    setConfirmBookingSlot({ dateStr, hourStr });
  };

  // Upload attachment files to a meeting
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>, meetingId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let currentList = loadProjectMeetings();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || 'file';
      const sizeFormatted = file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : Math.round(file.size / 1024) + ' KB';

      const doc: MeetingDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        uploadedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        fileType: ext,
        size: sizeFormatted
      };
      currentList = addAttachmentToMeeting(meetingId, doc);
    }

    setMeetings([...currentList]);
    const updatedTarget = currentList.find((m) => m.id === meetingId);
    if (updatedTarget) {
      setActiveEvent(updatedTarget);
    }
    e.target.value = '';
  };

  // Delete an attachment from a meeting
  const handleAttachmentDelete = (meetingId: string, docId: string) => {
    const updatedList = removeAttachmentFromMeeting(meetingId, docId);
    setMeetings([...updatedList]);
    const updatedTarget = updatedList.find((m) => m.id === meetingId);
    if (updatedTarget) {
      setActiveEvent(updatedTarget);
    }
  };

  // Copy Meeting URL to clipboard
  const handleCopyLink = async (e: React.MouseEvent, url: string, eventId: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(eventId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      setAlertDialog({
        title: 'ลิงก์การประชุม',
        message: `คัดลอกลิงก์การประชุมนี้: ${url}`
      });
    }
  };

  // Process dropped or selected meeting minutes file (.docx, .docs, .doc, .txt, .pdf)
  // AI summarizes into DB + classifies project state (1. เริ่มต้น, 2. กำลังดำเนินงาน, 3. เสร็จสิ้นการดำเนินงาน)
  const handleMinutesFileProcess = async (file: File, targetEvent: MoralMeetingEvent) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExts = ['docx', 'docs', 'doc', 'txt', 'pdf'];

    if (!allowedExts.includes(ext)) {
      setAlertDialog({
        title: 'รูปแบบไฟล์ไม่รองรับ',
        message: 'กรุณาอัปโหลดไฟล์บันทึกการประชุมในรูปแบบ .docx, .docs, .doc, .txt หรือ .pdf (เฉพาะ PDF ชนิด Text เท่านั้น)'
      });
      return;
    }

    setIsSummarizingMinutes(true);
    setDbSyncBanner(null);
    try {
      const rawText = await extractTextFromFile(file);
      const summary = await summarizeAndClassifyProjectStateWithAI(rawText, targetEvent, file.name);
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

      const newDoc: MeetingDocument = {
        id: `doc-min-${Date.now()}`,
        name: file.name,
        uploadedAt: nowStr
      };

      const nextMeetings = meetings.map((m) => {
        if (m.id === targetEvent.id) {
          const existsDoc = m.documents.some((d) => d.name === file.name);
          return {
            ...m,
            type: 'close' as MeetingStatus,
            documents: existsDoc ? m.documents : [...m.documents, newDoc],
            aiSummary: summary
          };
        }
        return m;
      });

      setMeetings(nextMeetings);
      saveProjectMeetings(nextMeetings);

      // Update Project State & AI Summary in Database
      const updatedProjects = updateProjectStateFromMeetingSummary(
        targetEvent.projectId,
        targetEvent.id,
        targetEvent.topic,
        targetEvent.date,
        summary
      );
      setProjects(updatedProjects);

      setActiveEvent((prev) => {
        if (!prev || prev.id !== targetEvent.id) return prev;
        const existsDoc = prev.documents.some((d) => d.name === file.name);
        return {
          ...prev,
          type: 'close',
          documents: existsDoc ? prev.documents : [...prev.documents, newDoc],
          aiSummary: summary
        };
      });

      // Cross-analyze with SQLite table "task_project"
      let taskSyncNote = '';
      try {
        const sqliteProjects = await fetchTaskProjectsFromSqlite();
        const matchedSqliteProj = sqliteProjects.find(
          (sp) =>
            sp.projectId === targetEvent.projectId ||
            sp.projectName === targetEvent.projectName ||
            sp.projectName.includes(targetEvent.projectName) ||
            targetEvent.projectName.includes(sp.projectName)
        );

        if (matchedSqliteProj && matchedSqliteProj.tasks.length > 0) {
          const syncResult = await analyzeMeetingMinutesWithTasksAI(
            rawText,
            matchedSqliteProj.tasks,
            targetEvent.topic
          );

          // Build PMS Meeting Report Record (FORM-REP-02 & FORM-DIR-01)
          const rep02 = syncResult.extractedFormRep02;
          const pmsReport: PmsMeetingReportRecord = {
            id: `REP02-${targetEvent.id}`,
            meetingId: targetEvent.id,
            projectId: matchedSqliteProj.projectId,
            projectName: matchedSqliteProj.projectName,
            province: matchedSqliteProj.province,
            meetingDate: targetEvent.date,
            meetingTopic: targetEvent.topic,
            reportingPeriod: rep02?.reportingPeriod || 'ประจำเดือน',
            executiveSummary: rep02?.executiveSummary || summary.overview,
            sourceFileName: file.name,
            obstaclesAndRisks: rep02?.obstaclesAndRisks || ['ระยะเวลาจัดกิจกรรมต้องประสานงานพื้นที่ล่วงหน้า'],
            correctiveSolutions: rep02?.correctiveSolutions || ['แต่งตั้งคณะทำงานประสานงานประจำจุด'],
            updatedTasks: (syncResult.taskUpdates || []).map((u) => ({
              id: u.id,
              task_code: u.task_code,
              task_name: u.task_name,
              new_status: u.new_status,
              new_progress: u.new_progress,
              rationale: u.rationale
            })),
            addedTasks: (syncResult.newTasksDiscovered || []).map((nt) => ({
              task_code: nt.suggested_task_code,
              task_name: nt.task_name,
              phase_name: nt.phase_name,
              start_date: nt.start_date,
              end_date: nt.end_date,
              responsible_person: nt.responsible_person,
              reason_added: nt.reason_added
            })),
            directives: (syncResult.extractedDirectives || (summary.actionItems || []).map((item) => ({
              directiveText: item,
              responsiblePerson: `ผู้รับผิดชอบโครงการ (${targetEvent.province})`,
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
              priority: 'ด่วน' as const
            }))),
            createdAt: new Date().toISOString()
          };

          // Save PMS Report to storage
          await savePmsMeetingReport(pmsReport);

          // Check if there are newly discovered tasks that are NOT in the plan
          if (syncResult.newTasksDiscovered && syncResult.newTasksDiscovered.length > 0) {
            setPendingReconciliation({
              targetEvent,
              matchedSqliteProj,
              syncResult,
              rawSummary: summary,
              docName: file.name
            });
            setIsReconciliationModalOpen(true);
            taskSyncNote = ` • ตรวจพบ ${syncResult.newTasksDiscovered.length} กิจกรรมใหม่นอกแผนเดิม (กรุณาตรวจสอบใน Reconciliation Modal)`;
          } else if (syncResult.taskUpdates && syncResult.taskUpdates.length > 0) {
            const updates = syncResult.taskUpdates.map((u) => ({
              id: u.id,
              status: u.new_status,
              progress_percent: u.new_progress,
              last_meeting_id: targetEvent.id,
              last_meeting_notes: `${targetEvent.topic}: ${u.rationale}`
            }));

            await updateTaskProgressFromMeetingInSqlite(
              updates,
              targetEvent.id,
              targetEvent.topic
            );
            taskSyncNote = ` และซิงค์อัปเดต ${updates.length} ขั้นตอนในตาราง task_project เรียบร้อยแล้ว`;
          }
        }
      } catch (sqliteErr) {
        console.warn('Sync meeting with task_project note:', sqliteErr);
      }

      // Sync AI-extracted action items into PMS Decision Actions
      if (Array.isArray(summary.actionItems) && summary.actionItems.length > 0) {
        summary.actionItems.slice(0, 2).forEach((item) => {
          addPmsDecisionAction({
            projectId: targetEvent.projectId,
            projectName: targetEvent.projectName,
            issueTopic: `มติที่ประชุม: ${targetEvent.topic}`,
            directiveText: item,
            responsiblePerson: `ผู้รับผิดชอบโครงการ (${targetEvent.province})`,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            status: 'ระหว่างดำเนินการ',
            followUpResult: 'บันทึกอัตโนมัติจากการถอดความบันทึกการประชุมด้วย AI'
          });
        });
      }

      const stateLabel = PROJECT_STATE_META[summary.detectedState]?.label || summary.detectedState;
      setDbSyncBanner(
        `อัปเดตฐานข้อมูลสำเร็จ: โครงการ "${targetEvent.projectName}" (จ.${targetEvent.province}) อยู่ในสถานะ [${stateLabel}] (${summary.progressPercent}%)${taskSyncNote}`
      );
    } catch (err) {
      console.error('Minutes AI summary error:', err);
      setAlertDialog({
        title: 'เกิดข้อผิดพลาดในการอ่านไฟล์',
        message: 'ไม่สามารถอ่านเนื้อหาจากไฟล์ได้ กรุณาตรวจสอบว่าเป็นไฟล์ข้อความหรือ PDF ชนิด Text (ไม่ใช่ไฟล์สแกนรูปภาพ)'
      });
    } finally {
      setIsSummarizingMinutes(false);
    }
  };

  const handleConfirmReconciliation = async (approvedTasks: DiscoveredTaskProposal[]) => {
    if (!pendingReconciliation) return;
    const { targetEvent, matchedSqliteProj, syncResult } = pendingReconciliation;

    try {
      // 1. Append new tasks to Implementation Plan (task_project)
      const appendRes = await appendNewDiscoveredTasksToProject(
        matchedSqliteProj.projectId,
        approvedTasks,
        targetEvent.id,
        targetEvent.topic
      );

      // 2. Also update existing tasks
      if (syncResult.taskUpdates && syncResult.taskUpdates.length > 0) {
        const updates = syncResult.taskUpdates.map((u) => ({
          id: u.id,
          status: u.new_status,
          progress_percent: u.new_progress,
          last_meeting_id: targetEvent.id,
          last_meeting_notes: `${targetEvent.topic}: ${u.rationale}`
        }));
        await updateTaskProgressFromMeetingInSqlite(
          updates,
          targetEvent.id,
          targetEvent.topic
        );
      }

      // 3. Update PMS report addedTasks
      const pmsReport = getPmsMeetingReportByMeetingId(targetEvent.id);
      if (pmsReport) {
        pmsReport.addedTasks = approvedTasks.map((t) => ({
          task_code: t.suggested_task_code,
          task_name: t.task_name,
          phase_name: t.phase_name,
          start_date: t.start_date,
          end_date: t.end_date,
          responsible_person: t.responsible_person,
          reason_added: t.reason_added
        }));
        await savePmsMeetingReport(pmsReport);
      }

      const updatedProg = appendRes.updatedProject?.overallProgress || targetEvent.aiSummary?.progressPercent || 50;
      setDbSyncBanner(
        `✓ บรรจุเพิ่ม ${approvedTasks.length} กิจกรรมใหม่เข้า Implementation Plan สำเร็จ! ความก้าวหน้าโครงการ "${matchedSqliteProj.projectName}" ปรับเป็น ${updatedProg}%`
      );
    } catch (err) {
      console.error('Reconciliation error:', err);
    } finally {
      setIsReconciliationModalOpen(false);
      setPendingReconciliation(null);
    }
  };

  const handleCancelReconciliation = async () => {
    if (!pendingReconciliation) return;
    const { targetEvent, syncResult } = pendingReconciliation;
    // If skipped, still apply updates to existing tasks
    if (syncResult.taskUpdates && syncResult.taskUpdates.length > 0) {
      const updates = syncResult.taskUpdates.map((u) => ({
        id: u.id,
        status: u.new_status,
        progress_percent: u.new_progress,
        last_meeting_id: targetEvent.id,
        last_meeting_notes: `${targetEvent.topic}: ${u.rationale}`
      }));
      await updateTaskProgressFromMeetingInSqlite(
        updates,
        targetEvent.id,
        targetEvent.topic
      );
    }
    setIsReconciliationModalOpen(false);
    setPendingReconciliation(null);
  };

  const handleMinutesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeEvent) {
      handleMinutesFileProcess(file, activeEvent);
    }
    e.target.value = '';
  };

  const handleCopyAiSummary = async (e: React.MouseEvent, evt: MoralMeetingEvent) => {
    e.stopPropagation();
    if (!evt.aiSummary) return;
    const stateMeta = PROJECT_STATE_META[evt.aiSummary.detectedState];
    const formatted = [
      `📌 สรุปบันทึกการประชุม: ${evt.topic}`,
      `ชื่อโครงการ: ${evt.projectName} | จังหวัด: ${evt.province}`,
      `สถานะโครงการ (AI ประเมิน): ${stateMeta ? stateMeta.label : evt.aiSummary.detectedState} (ความก้าวหน้า ${evt.aiSummary.progressPercent}%)`,
      `เหตุผลประกอบสถานะ: ${evt.aiSummary.stateRationale}`,
      `วันที่ประชุม: ${evt.date} (${evt.timeStart}-${evt.timeEnd} น.) | ไฟล์ต้นฉบับ: ${evt.aiSummary.sourceFileName}`,
      ``,
      `■ ภาพรวมการประชุม:`,
      evt.aiSummary.overview,
      ``,
      `■ ประเด็นสำคัญ:`,
      ...evt.aiSummary.keyPoints.map((p, i) => `${i + 1}. ${p}`),
      ``,
      `■ มติ/แนวทางขับเคลื่อนต่อ:`,
      ...evt.aiSummary.actionItems.map((a) => `- ${a}`)
    ].join('\n');

    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedSummaryId(evt.id);
      setTimeout(() => setCopiedSummaryId(null), 2500);
    } catch {
      // ignore
    }
  };

  const handleMarkAsCompleted = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    const nextMeetings = meetings.map((m) =>
      m.id === eventId ? { ...m, type: 'close' as MeetingStatus } : m
    );
    setMeetings(nextMeetings);
    saveProjectMeetings(nextMeetings);
    setActiveEvent((prev) => (prev && prev.id === eventId ? { ...prev, type: 'close' } : prev));
  };

  const handleDeleteMeeting = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    if (window.confirm('คุณต้องการยกเลิกนัดหมายการประชุมนี้ใช่หรือไม่?')) {
      const nextMeetings = meetings.filter((m) => m.id !== eventId);
      setMeetings(nextMeetings);
      saveProjectMeetings(nextMeetings);
      setActiveEvent(null);
    }
  };

  // Filter meetings by status
  const visibleMeetings = meetings.filter((m) => {
    if (m.type === 'booking' && !filterBooking) return false;
    if (m.type === 'meeting' && !filterMeeting) return false;
    if (m.type === 'close' && !filterClose) return false;
    return true;
  });

  return (
    <div
      className="moral-calendar-workspace-root"
      style={{
        padding: 0,
        margin: 0,
        width: '100%',
        height: isFullscreen ? '100vh' : '100%',
        maxHeight: isFullscreen ? '100vh' : '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        backgroundColor: '#0b1528'
      }}
    >
      {/* Hidden File Input for Completed Meeting Minutes (.docx, .docs, .doc, .txt, .pdf) */}
      <input
        ref={minutesFileInputRef}
        type="file"
        accept=".docx,.docs,.doc,.txt,.pdf"
        style={{ display: 'none' }}
        onChange={handleMinutesInputChange}
      />

      {/* =========================================================
          PANEL A: LEFT SIDEBAR (Mini Calendar & Meeting Filters)
          FIXED WIDTH: 380px, HEIGHT: 100vh, FLUSH ZERO-GAP NEXT TO MAIN MENU
         ========================================================= */}
      <aside
        style={{
          width: '380px',
          minWidth: '380px',
          maxWidth: '380px',
          height: isFullscreen ? '100vh' : '100%',
          maxHeight: isFullscreen ? '100vh' : '100%',
          backgroundColor: '#0b1528',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          margin: 0,
          borderRight: '2px solid rgba(207, 168, 83, 0.45)',
          boxShadow: '6px 0 24px rgba(0, 0, 0, 0.28)',
          flexShrink: 0,
          overflow: 'hidden',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 20
        }}
      >
        {/* =========================================================
            FIXED TOP HEADER:
            ปุ่ม ย้อนกลับไปหน้าโครงการ และ ปฎิทินการประชุม
            FIX ติดด้านบนไม่มีช่องว่าง (top: 0) & ซ้ายติดเมนูด้านซ้าย ไม่มีช่องว่าง (left: 0)
           ========================================================= */}
        <div
          style={{
            flexShrink: 0,
            width: '100%',
            backgroundColor: '#0b1528',
            borderBottom: '1px solid rgba(207, 168, 83, 0.35)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            zIndex: 30,
            margin: 0,
            padding: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', borderBottom: (onBack || onToggleFullscreen) ? '1px solid rgba(255, 255, 255, 0.1)' : 'none' }}>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                  padding: '12px 18px',
                  border: 'none',
                  backgroundColor: 'rgba(207, 168, 83, 0.15)',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  margin: 0,
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(207, 168, 83, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(207, 168, 83, 0.15)';
                }}
                title="ย้อนกลับไปหน้าโครงการ"
              >
                <ChevronLeft size={17} color="#cfa853" />
                <span>ย้อนกลับไปหน้าโครงการ</span>
              </button>
            )}

            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 14px',
                  border: 'none',
                  borderLeft: onBack ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
                  backgroundColor: isFullscreen ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  color: isFullscreen ? '#38bdf8' : '#cbd5e1',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  margin: 0,
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isFullscreen ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isFullscreen ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.08)';
                }}
                title={isFullscreen ? 'ย่อเพื่อแสดงเมนูด้านบน' : 'ขยายเต็มหน้าจอ'}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                <span>{isFullscreen ? 'ย่อเมนู' : 'เต็มหน้าจอ'}</span>
              </button>
            )}
          </div>

          <div
            style={{
              padding: '14px 18px 12px 18px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={20} color="#cfa853" />
              <span>ปฎิทินการประชุม</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              นัดหมายการประชุม & ถอดบันทึกการประชุมด้วย AI
            </div>
          </div>
        </div>

        {/* Scrollable Sidebar Body below the fixed top header */}
        <div
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            padding: '16px 18px 20px 18px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}
        >
          {/* Mini Calendar Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: '#cfa853', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarDays size={15} />
              <span>{monthNamesTh[currentMonth]} {currentYear + 543}</span>
            </h4>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear((y) => y - 1);
                  } else {
                    setCurrentMonth((m) => m - 1);
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#ffffff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear((y) => y + 1);
                  } else {
                    setCurrentMonth((m) => m + 1);
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#ffffff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Mini Calendar Weekday Labels */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.45)',
              marginBottom: '6px'
            }}
          >
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Mini Calendar Days Grid (+30% size) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '5px',
              fontSize: '13.5px',
              textAlign: 'center',
              marginBottom: '14px',
              paddingBottom: '14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonthCount }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;

              return (
                <span
                  key={`m-day-${day}`}
                  onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                  style={{
                    padding: '6px 0',
                    borderRadius: '8px',
                    color: isSelected ? '#0b1528' : '#ffffff',
                    backgroundColor: isSelected ? '#cfa853' : 'transparent',
                    fontWeight: isSelected ? 800 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {day}
                </span>
              );
            })}
          </div>

          {/* Status Filters */}
          <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '7px', letterSpacing: '0.04em' }}>
              ตัวกรองสถานะการประชุม
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                onClick={() => setFilterMeeting(!filterMeeting)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11.5px' }}
              >
                {filterMeeting ? <CheckSquare size={14} color="#ef4444" /> : <Square size={14} color="rgba(255,255,255,0.3)" />}
                <span>Meeting (นัดหมายทางการ)</span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', marginLeft: 'auto' }} />
              </div>
              <div
                onClick={() => setFilterBooking(!filterBooking)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11.5px' }}
              >
                {filterBooking ? <CheckSquare size={14} color="#cfa853" /> : <Square size={14} color="rgba(255,255,255,0.3)" />}
                <span>Booking (รอตอบรับ/เปิดจอง)</span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cfa853', marginLeft: 'auto' }} />
              </div>
              <div
                onClick={() => setFilterClose(!filterClose)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11.5px' }}
              >
                {filterClose ? <CheckSquare size={14} color="#10b981" /> : <Square size={14} color="rgba(255,255,255,0.3)" />}
                <span>Closed (เสร็จสิ้น / AI สรุปผล)</span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', marginLeft: 'auto' }} />
              </div>
            </div>
          </div>

          {/* =========================================================
              TEAM MANAGEMENT SECTION (แทนที่กล่อง SQLite เดิมตามคำสั่ง)
              ด้านล่างปฏิทิน: แสดงสมาชิกทีม, ปุ่มสร้างทีม, ค้นหาและ Add user เข้าทีม
             ========================================================= */}
          <div
            style={{
              marginTop: 'auto',
              padding: '12px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              border: '1.5px solid rgba(207, 168, 83, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '9px'
            }}
          >
            {/* Header: Title, Count badge, and Create/Manage Team Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} color="#cfa853" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>ทีมขับเคลื่อน</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: 'rgba(207, 168, 83, 0.2)',
                    color: '#cfa853',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    border: '1px solid rgba(207, 168, 83, 0.4)'
                  }}
                >
                  {activeTeam.members.length} คน
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsTeamModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '7px',
                  border: '1px solid #cfa853',
                  backgroundColor: 'rgba(207, 168, 83, 0.15)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(207, 168, 83, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(207, 168, 83, 0.15)';
                }}
                title="สร้างทีมใหม่ หรือ ค้นหา User เพื่อ Add เข้าทีม"
              >
                <UserPlus size={12} color="#cfa853" />
                <span>สร้างทีม / เพิ่ม User</span>
              </button>
            </div>

            {/* Current Team Name */}
            <div
              style={{
                fontSize: '10.5px',
                color: '#cbd5e1',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={activeTeam.name}
            >
              🏷️ <strong style={{ color: '#cfa853' }}>{activeTeam.name}</strong>
            </div>

            {/* Member Chips preview list */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxHeight: '120px',
                overflowY: 'auto',
                paddingRight: '2px'
              }}
            >
              {activeTeam.members.map((member) => (
                <div
                  key={member.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 7px',
                    borderRadius: '7px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: member.avatarBg || '#2563eb',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {member.userName.charAt(0)}
                    </div>
                    <span
                      style={{
                        color: '#f8fafc',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={member.userName}
                    >
                      {member.userName}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '8.5px',
                      fontWeight: 700,
                      color: member.roleColor || '#93c5fd',
                      backgroundColor: member.roleBg || 'rgba(37, 99, 235, 0.15)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      marginLeft: '4px'
                    }}
                  >
                    {member.roleLabel || member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

        {/* =========================================================
            PANEL B: RIGHT 2D DRAGGABLE & SCROLLABLE CALENDAR GRID
            INDEPENDENT SCROLLING (บน-ล่าง-ซ้าย-ขวา)
           ========================================================= */}
        <div
          ref={gridContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            height: isFullscreen ? '100vh' : '100%',
            maxHeight: isFullscreen ? '100vh' : '100%',
            overflow: 'auto',
            backgroundColor: '#ffffff',
            cursor: isDragging ? 'grabbing' : 'grab',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Scrollable grid canvas (+30% Horizontal & Vertical Grid Size) */}
          <div
            style={{
              width: `${124 + daysInMonthCount * 195}px`,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {/* Header Sticky Days Row */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #b4c0cf',
                backgroundColor: '#f8fafc',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}
            >
              {/* Corner GMT Time cell */}
              <div
                style={{
                  width: '124px',
                  height: '85px',
                  borderRight: '1px solid #b4c0cf',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8fafc',
                  position: 'sticky',
                  left: 0,
                  zIndex: 20
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0f172a', fontSize: '12.5px', fontWeight: 800 }}>
                  <Clock size={14} color="#00247c" />
                  <span>เวลา / วันที่</span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>GMT+7 (ไทย)</span>
              </div>

              {/* Day column headers */}
              {daysOfMonth.map((day, idx) => {
                const isSelectedDay =
                  selectedDate.getDate() === day.dayNum &&
                  selectedDate.getMonth() === currentMonth &&
                  selectedDate.getFullYear() === currentYear;

                return (
                  <div
                    key={`day-hdr-${idx}`}
                    style={{
                      width: '195px',
                      height: '85px',
                      textAlign: 'center',
                      borderRight: '1px solid #b4c0cf',
                      backgroundColor: isSelectedDay ? '#eff6ff' : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: isSelectedDay ? '#1d4ed8' : '#64748b' }}>
                      {day.dayName}
                    </span>
                    <span
                      style={{
                        fontSize: '17px',
                        fontWeight: 800,
                        color: isSelectedDay ? '#ffffff' : '#0f172a',
                        backgroundColor: isSelectedDay ? '#2563eb' : 'transparent',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '3px'
                      }}
                    >
                      {day.dayNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time Grid Rows */}
            {hours.map((hour) => (
              <div
                key={`row-${hour}`}
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #c0cbd8',
                  minHeight: '110px'
                }}
              >
                {/* Left Sticky Hour Column */}
                <div
                  style={{
                    width: '124px',
                    borderRight: '1px solid #b4c0cf',
                    backgroundColor: '#ffffff',
                    position: 'sticky',
                    left: 0,
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#475569'
                  }}
                >
                  {hour}
                </div>

                {/* Day Cells */}
                {daysOfMonth.map((day) => {
                  const cellDateStr = day.dateStr;
                  const cellKey = `${cellDateStr}-${hour}`;
                  const slotEvents = visibleMeetings.filter(
                    (m) => m.date === cellDateStr && m.timeStart === hour
                  );
                  const isSlotEmpty = slotEvents.length === 0;
                  const isCellHovered = isSlotEmpty && hoveredCellKey === cellKey;
                  const isSelectedDayCol =
                    selectedDate.getDate() === day.dayNum &&
                    selectedDate.getMonth() === currentMonth &&
                    selectedDate.getFullYear() === currentYear;

                  return (
                    <div
                      key={`cell-${cellKey}`}
                      onMouseEnter={() => {
                        if (isSlotEmpty) setHoveredCellKey(cellKey);
                      }}
                      onMouseLeave={() => {
                        setHoveredCellKey((prev) => (prev === cellKey ? null : prev));
                      }}
                      onClick={() => handleCellClick(cellDateStr, hour)}
                      style={{
                        width: '195px',
                        borderRight: '1px solid #c0cbd8',
                        position: 'relative',
                        backgroundColor: isCellHovered
                          ? '#fef9c3'
                          : isSelectedDayCol
                          ? 'rgba(37, 99, 235, 0.03)'
                          : 'transparent',
                        boxShadow: isCellHovered ? 'inset 0 0 0 1.5px #eab308' : 'none',
                        transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                        cursor: 'pointer'
                      }}
                    >
                      {isCellHovered && (
                        <span
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#b45309',
                            pointerEvents: 'none',
                            zIndex: 1
                          }}
                        >
                          <Plus size={20} strokeWidth={2.6} />
                        </span>
                      )}

                      {slotEvents.map((evt) => {
                        const isClose = evt.type === 'close';
                        const isMeeting = evt.type === 'meeting';
                        const isBooking = evt.type === 'booking';

                        const linkedProj = projects.find((p) => p.id === evt.projectId);
                        const currentProjState = evt.aiSummary?.detectedState || linkedProj?.state || 'เริ่มต้น';
                        const stateMeta = PROJECT_STATE_META[currentProjState] || PROJECT_STATE_META['เริ่มต้น'];

                        let blockBg = '#cfa853';
                        let textColor = '#ffffff';
                        let blockBorder = 'none';

                        if (isClose) {
                          blockBg = evt.aiSummary ? '#ecfdf5' : '#f1f5f9';
                          textColor = evt.aiSummary ? '#065f46' : '#475569';
                          blockBorder = evt.aiSummary ? '1.5px solid #10b981' : '1.5px solid #94a3b8';
                        } else if (isMeeting) {
                          blockBg = '#fef2f2';
                          textColor = '#991b1b';
                          blockBorder = '1.5px solid #ef4444';
                        } else if (isBooking) {
                          blockBg = '#fffbeb';
                          textColor = '#92400e';
                          blockBorder = '1.5px solid #f59e0b';
                        }

                        const isPopoverActive = activeEvent?.id === evt.id;
                        const hourNum = parseInt(hour.split(':')[0], 10);
                        const openOnLeft = day.dayNum > 22;
                        const alignBottom = hourNum >= 14;

                        return (
                          <div
                            key={evt.id}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: isPopoverActive ? 50 : 2 }}
                          >
                            {/* Meeting Block Pill */}
                            <div
                              onClick={(e) => handleSlotClick(e, evt)}
                              style={{
                                backgroundColor: blockBg,
                                color: textColor,
                                border: blockBorder,
                                padding: '6px 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                margin: '4px',
                                borderRadius: '10px',
                                height: 'calc(100% - 8px)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                boxShadow: isPopoverActive
                                  ? '0 0 0 2.5px #2563eb, 0 6px 14px rgba(37, 99, 235, 0.22)'
                                  : '0 2px 6px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.18s ease'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: 800, fontSize: '9.5px' }}>
                                  {evt.timeStart}-{evt.timeEnd}
                                </span>
                                <span
                                  style={{
                                    fontSize: '8.5px',
                                    fontWeight: 800,
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    backgroundColor: evt.aiSummary ? stateMeta.bgLight : isMeeting ? '#fee2e2' : isBooking ? '#fef3c7' : '#e2e8f0',
                                    color: evt.aiSummary ? stateMeta.color : textColor,
                                    border: evt.aiSummary ? `1px solid ${stateMeta.border}` : 'none',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {evt.aiSummary ? stateMeta.label : isMeeting ? 'Meeting' : isBooking ? 'Booking' : 'เสร็จสิ้น'}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  lineHeight: 1.2,
                                  marginTop: '2px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical'
                                }}
                              >
                                {evt.projectName}
                              </div>
                              <div style={{ fontSize: '9px', opacity: 0.9, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                📍 จ.{evt.province} • {evt.topic}
                              </div>

                              {/* Attendees & Add user button row in slot */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginTop: '4px',
                                  paddingTop: '3px',
                                  borderTop: '1px solid rgba(0, 0, 0, 0.08)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', minWidth: 0 }}>
                                  {evt.attendees && evt.attendees.length > 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                      <div style={{ display: 'flex', marginLeft: '1px' }}>
                                        {evt.attendees.slice(0, 3).map((a, i) => (
                                          <div
                                            key={a.userId}
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              borderRadius: '50%',
                                              backgroundColor: a.avatarBg || '#2563eb',
                                              color: '#ffffff',
                                              fontSize: '8.5px',
                                              fontWeight: 800,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              marginLeft: i > 0 ? '-4px' : '0',
                                              border: '1.5px solid #ffffff',
                                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                            }}
                                            title={`${a.userName} (${a.roleLabel || a.role})`}
                                          >
                                            {a.userName.charAt(0)}
                                          </div>
                                        ))}
                                      </div>
                                      <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#334155', marginLeft: '2px' }}>
                                        {evt.attendees.length} คน
                                      </span>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '8px', color: '#64748b', fontStyle: 'italic' }}>
                                      ยังไม่มีคน
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSlotAddUserModalOpen(evt);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    padding: '2px 5px',
                                    borderRadius: '5px',
                                    border: '1px solid rgba(37, 99, 235, 0.4)',
                                    backgroundColor: '#ffffff',
                                    color: '#1d4ed8',
                                    fontSize: '8.5px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                                    transition: 'all 0.12s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#eff6ff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                  }}
                                  title="เพิ่ม/แก้ไข ผู้เข้าร่วมประชุมใน Slot นี้"
                                >
                                  <UserPlus size={10} color="#2563eb" />
                                  <span>Add user</span>
                                </button>
                              </div>
                            </div>

                            {/* ====================================================
                                SIDE POPOVER DIALOG
                                - แสดงชื่อโครงการ, จังหวัด, สถานะ State ปัจจุบัน (1. เริ่มต้น / 2. กำลังดำเนินงาน / 3. เสร็จสิ้นการดำเนินงาน)
                                - ช่องอัปโหลด/Drop บันทึกการประชุมเมื่อประชุมเสร็จ เพื่อให้ AI สรุปลงฐานข้อมูลและตรวจความคืบหน้า State
                               ==================================================== */}
                            {isPopoverActive && (
                              <div
                                id="document-popover"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  position: 'absolute',
                                  top: alignBottom ? undefined : '2px',
                                  bottom: alignBottom ? '2px' : undefined,
                                  left: openOnLeft ? undefined : 'calc(100% + 8px)',
                                  right: openOnLeft ? 'calc(100% + 8px)' : undefined,
                                  width: '540px',
                                  maxHeight: '700px',
                                  overflowY: 'auto',
                                  backgroundColor: '#ffffff',
                                  borderRadius: '20px',
                                  boxShadow: '0 4px 0 #cbd5e1, 0 20px 45px rgba(15, 23, 42, 0.32), 0 6px 14px rgba(0, 0, 0, 0.1)',
                                  border: '1.5px solid #cbd5e1',
                                  padding: '24px',
                                  zIndex: 120,
                                  color: '#0f172a',
                                  cursor: 'default',
                                  fontFamily: "'Kanit', sans-serif"
                                }}
                              >
                                {/* Popover Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '10px' }}>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <span
                                        style={{
                                          fontSize: '12px',
                                          fontWeight: 800,
                                          color: stateMeta.color,
                                          backgroundColor: stateMeta.bgLight,
                                          padding: '3px 10px',
                                          borderRadius: '999px',
                                          border: `1px solid ${stateMeta.border}`
                                        }}
                                      >
                                        สถานะโครงการ: {stateMeta.label}
                                      </span>
                                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', backgroundColor: '#eff6ff', padding: '3px 9px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                                        📍 จ.{evt.province}
                                      </span>
                                      {isClose && (
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857', backgroundColor: '#ecfdf5', padding: '3px 9px', borderRadius: '6px', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                          <CheckCircle2 size={13} />
                                          ประชุมเสร็จแล้ว
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#2563eb', marginTop: '8px' }}>
                                      โครงการ: {evt.projectName}
                                    </div>
                                    <h4 style={{ fontSize: '16.5px', fontWeight: 800, margin: '4px 0 0 0', color: '#0f172a', lineHeight: 1.35 }}>
                                      {evt.topic}
                                    </h4>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setActiveEvent(null)}
                                    style={{
                                      background: '#f1f5f9',
                                      border: 'none',
                                      color: '#64748b',
                                      cursor: 'pointer',
                                      padding: '6px',
                                      borderRadius: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'background 0.15s ease'
                                    }}
                                  >
                                    <X size={18} />
                                  </button>
                                </div>

                                {/* Project & Time Metadata */}
                                <div style={{ fontSize: '14px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                                  <div><strong>ชื่อโครงการ:</strong> {evt.projectName}</div>
                                  <div><strong>พื้นที่ดำเนินการ:</strong> จังหวัด{evt.province}</div>
                                  <div><strong>วันที่ประชุม:</strong> {evt.date} ({evt.timeStart} – {evt.timeEnd} น.)</div>
                                </div>

                                {/* Meeting Attendees Section in Popover */}
                                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Users size={16} color="#2563eb" />
                                      <span>ผู้เข้าร่วมประชุมใน Slot นี้ ({(evt.attendees || []).length} คน)</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setIsSlotAddUserModalOpen(evt)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        border: '1px solid #2563eb',
                                        backgroundColor: '#eff6ff',
                                        color: '#1d4ed8',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <UserPlus size={13} />
                                      <span>+ จัดการผู้เข้าร่วม</span>
                                    </button>
                                  </div>

                                  {(!evt.attendees || evt.attendees.length === 0) ? (
                                    <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                                      ยังไม่ได้ระบุผู้เข้าร่วมประชุม คลิก "+ จัดการผู้เข้าร่วม" เพื่อเลือกคนจากในทีม
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                      {evt.attendees.map((att) => (
                                        <div
                                          key={att.userId}
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '4px 9px',
                                            borderRadius: '999px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '13px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: '18px',
                                              height: '18px',
                                              borderRadius: '50%',
                                              backgroundColor: att.avatarBg || '#2563eb',
                                              color: '#ffffff',
                                              fontSize: '9.5px',
                                              fontWeight: 800,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center'
                                            }}
                                          >
                                            {att.userName.charAt(0)}
                                          </div>
                                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{att.userName}</span>
                                          <span
                                            style={{
                                              fontSize: '11px',
                                              color: att.roleColor || '#2563eb',
                                              backgroundColor: att.roleBg || '#eff6ff',
                                              padding: '1px 6px',
                                              borderRadius: '4px',
                                              fontWeight: 700
                                            }}
                                          >
                                            {att.roleLabel || att.role}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleToggleAttendeeInMeeting(evt.id, att)}
                                            style={{
                                              background: 'transparent',
                                              border: 'none',
                                              color: '#94a3b8',
                                              cursor: 'pointer',
                                              padding: '0 2px',
                                              display: 'flex',
                                              alignItems: 'center'
                                            }}
                                            title="นำออกจาก Slot นี้"
                                          >
                                            <X size={13} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Meeting Attachments & Documents Section in Popover */}
                                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Paperclip size={16} color="#2563eb" />
                                      <span>เอกสารและไฟล์แนบของการประชุม ({(evt.documents || []).length} ไฟล์)</span>
                                    </div>
                                    <label
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        border: '1px solid #2563eb',
                                        backgroundColor: '#eff6ff',
                                        color: '#1d4ed8',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Plus size={13} />
                                      <span>+ แนบไฟล์เพิ่ม</span>
                                      <input
                                        type="file"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleAttachmentUpload(e, evt.id)}
                                      />
                                    </label>
                                  </div>

                                  {(!evt.documents || evt.documents.length === 0) ? (
                                    <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                                      ยังไม่มีไฟล์แนบในนัดหมายนี้ คลิก "+ แนบไฟล์เพิ่ม" เพื่ออัปโหลดเอกสาร
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {evt.documents.map((doc) => {
                                        const ext = (doc.fileType || doc.name.split('.').pop() || 'file').toLowerCase();
                                        let tagColor = '#3b82f6';
                                        let tagBg = '#eff6ff';
                                        if (ext === 'pdf') { tagColor = '#dc2626'; tagBg = '#fef2f2'; }
                                        else if (ext === 'docx' || ext === 'doc') { tagColor = '#2563eb'; tagBg = '#eff6ff'; }
                                        else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') { tagColor = '#059669'; tagBg = '#ecfdf5'; }
                                        else if (ext === 'sql' || ext === 'sqlite') { tagColor = '#7c3aed'; tagBg = '#f5f3ff'; }

                                        return (
                                          <div
                                            key={doc.id}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              padding: '6px 10px',
                                              borderRadius: '8px',
                                              backgroundColor: '#ffffff',
                                              border: '1px solid #cbd5e1',
                                              fontSize: '13.5px'
                                            }}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                              <span
                                                style={{
                                                  fontSize: '11px',
                                                  fontWeight: 800,
                                                  color: tagColor,
                                                  backgroundColor: tagBg,
                                                  padding: '2px 6px',
                                                  borderRadius: '4px',
                                                  textTransform: 'uppercase',
                                                  flexShrink: 0
                                                }}
                                              >
                                                {ext.slice(0, 4)}
                                              </span>
                                              <span
                                                title={doc.name}
                                                style={{
                                                  fontWeight: 600,
                                                  color: '#1e293b',
                                                  whiteSpace: 'nowrap',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  maxWidth: '280px'
                                                }}
                                              >
                                                {doc.name}
                                              </span>
                                              {doc.size && (
                                                <span style={{ fontSize: '11.5px', color: '#64748b', flexShrink: 0 }}>
                                                  ({doc.size})
                                                </span>
                                              )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                              {doc.uploadedAt && (
                                                <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>{doc.uploadedAt}</span>
                                              )}
                                              <button
                                                type="button"
                                                onClick={() => handleAttachmentDelete(evt.id, doc.id)}
                                                style={{
                                                  background: 'transparent',
                                                  border: 'none',
                                                  color: '#ef4444',
                                                  cursor: 'pointer',
                                                  padding: '2px',
                                                  display: 'flex',
                                                  alignItems: 'center'
                                                }}
                                                title="ลบไฟล์แนบนี้"
                                              >
                                                <Trash2 size={15} />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* DB Sync Confirmation Banner */}
                                {dbSyncBanner && (
                                  <div
                                    style={{
                                      backgroundColor: '#ecfdf5',
                                      border: '1.5px solid #10b981',
                                      borderRadius: '10px',
                                      padding: '10px 14px',
                                      marginBottom: '14px',
                                      fontSize: '13.5px',
                                      fontWeight: 700,
                                      color: '#065f46',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}
                                  >
                                    <Database size={16} color="#059669" style={{ flexShrink: 0 }} />
                                    <span>{dbSyncBanner}</span>
                                  </div>
                                )}

                                {/* =========================================================
                                    AI MEETING SUMMARY & 3-STATE PROGRESS CLASSIFICATION
                                   ========================================================= */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                                  {evt.aiSummary ? (
                                    <div
                                      style={{
                                        backgroundColor: '#f0fdf4',
                                        border: '1px solid #86efac',
                                        borderRadius: '14px',
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 800, fontSize: '14.5px' }}>
                                          <Sparkles size={17} color="#16a34a" />
                                          <span>AI สรุปบันทึกการประชุม & ตรวจความคืบหน้า</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => handleCopyAiSummary(e, evt)}
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            border: '1px solid #86efac',
                                            backgroundColor: copiedSummaryId === evt.id ? '#16a34a' : '#ffffff',
                                            color: copiedSummaryId === evt.id ? '#ffffff' : '#166534',
                                            fontSize: '12.5px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                          }}
                                        >
                                          {copiedSummaryId === evt.id ? <Check size={13} /> : <Copy size={13} />}
                                          <span>{copiedSummaryId === evt.id ? 'คัดลอกแล้ว' : 'คัดลอกสรุป'}</span>
                                        </button>
                                      </div>

                                      {/* Detected 3-State Progress Box */}
                                      {(() => {
                                        const detMeta = PROJECT_STATE_META[evt.aiSummary.detectedState] || PROJECT_STATE_META['เริ่มต้น'];
                                        return (
                                          <div
                                            style={{
                                              backgroundColor: detMeta.bgLight,
                                              border: `1.5px solid ${detMeta.border}`,
                                              borderRadius: '10px',
                                              padding: '10px 14px'
                                            }}
                                          >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                              <span style={{ fontSize: '13.5px', fontWeight: 800, color: detMeta.color }}>
                                                สถานะปัจจุบัน: {detMeta.label}
                                              </span>
                                              <span style={{ fontSize: '13.5px', fontWeight: 800, color: detMeta.color }}>
                                                ความคืบหน้า {evt.aiSummary.progressPercent}%
                                              </span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '6px' }}>
                                              <div style={{ width: `${evt.aiSummary.progressPercent}%`, height: '100%', backgroundColor: detMeta.color, borderRadius: '999px' }} />
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.45 }}>
                                              <strong>การวิเคราะห์ State โดย AI:</strong> {evt.aiSummary.stateRationale}
                                            </div>
                                          </div>
                                        );
                                      })()}

                                      <div style={{ fontSize: '12px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        <FileText size={13} />
                                        <span>ไฟล์: <strong>{evt.aiSummary.sourceFileName}</strong></span>
                                        <span>•</span>
                                        <span>อัปเดตฐานข้อมูลเมื่อ {evt.aiSummary.summarizedAt}</span>
                                      </div>

                                      {/* Overview */}
                                      <div style={{ backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '14px', color: '#1e293b', lineHeight: 1.5 }}>
                                        <div style={{ fontWeight: 700, color: '#166534', marginBottom: '4px', fontSize: '13.5px' }}>
                                          📌 ภาพรวมการประชุม:
                                        </div>
                                        {evt.aiSummary.overview}
                                      </div>

                                      {/* Key Points */}
                                      <div style={{ backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '13.5px', color: '#334155', lineHeight: 1.45 }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>
                                          💡 ประเด็นสำคัญจากการประชุม:
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          {evt.aiSummary.keyPoints.map((pt, idx) => (
                                            <li key={idx}>{pt}</li>
                                          ))}
                                        </ul>
                                      </div>

                                      {/* Action Items */}
                                      {evt.aiSummary.actionItems.length > 0 && (
                                        <div style={{ backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '13.5px', color: '#334155', lineHeight: 1.45 }}>
                                          <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: '5px' }}>
                                            🚀 มติที่ประชุม / การขับเคลื่อนต่อ:
                                          </div>
                                          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {evt.aiSummary.actionItems.map((act, idx) => (
                                              <li key={idx}>{act}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {/* Button to open PMS Meeting Report (FORM-REP-02 / FORM-DIR-01) */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const existing = getPmsMeetingReportByMeetingId(evt.id);
                                          if (existing) {
                                            setSelectedPmsReport(existing);
                                          } else {
                                            setSelectedPmsReport({
                                              id: `REP02-${evt.id}`,
                                              meetingId: evt.id,
                                              projectId: evt.projectId,
                                              projectName: evt.projectName,
                                              province: evt.province,
                                              meetingDate: evt.date,
                                              meetingTopic: evt.topic,
                                              reportingPeriod: 'ประจำเดือน',
                                              executiveSummary: evt.aiSummary?.overview || 'รายงานความก้าวหน้าโครงการจากการประชุม',
                                              sourceFileName: evt.aiSummary?.sourceFileName || 'บันทึกการประชุม',
                                              obstaclesAndRisks: ['การประสานงานในพื้นที่ต้องวางแผนล่วงหน้า'],
                                              correctiveSolutions: ['มีมติมอบหมายผู้ประสานงานประจำจุด'],
                                              updatedTasks: [],
                                              addedTasks: [],
                                              directives: (evt.aiSummary?.actionItems || []).map((item) => ({
                                                directiveText: item,
                                                responsiblePerson: `ผู้รับผิดชอบโครงการ (${evt.province})`,
                                                dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                                                priority: 'ด่วน' as const
                                              })),
                                              createdAt: new Date().toISOString()
                                            });
                                          }
                                          setIsPmsReportModalOpen(true);
                                        }}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: '8px',
                                          padding: '10px 16px',
                                          borderRadius: '10px',
                                          border: '1.5px solid #2563eb',
                                          backgroundColor: '#eff6ff',
                                          color: '#1d4ed8',
                                          fontSize: '13.5px',
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          width: '100%',
                                          boxShadow: '0 1px 3px rgba(37, 99, 235, 0.12)',
                                          marginTop: '6px'
                                        }}
                                      >
                                        <FileText size={17} color="#2563eb" />
                                        <span>เปิดดูฟอร์มรายงานผลการประชุม (FORM-REP-02 / FORM-DIR-01)</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        backgroundColor: '#fffbeb',
                                        border: '1px solid #fde68a',
                                        borderRadius: '12px',
                                        padding: '12px 14px',
                                        fontSize: '13.5px',
                                        color: '#92400e',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                      }}
                                    >
                                      <AlertCircle size={17} color="#d97706" style={{ flexShrink: 0 }} />
                                      <span>เมื่อประชุมเสร็จแล้ว กรุณาอัปโหลดไฟล์บันทึกการประชุมด้านล่าง เพื่อให้ AI สรุปผลลงฐานข้อมูลและตรวจสถานะความคืบหน้า (State 1 / 2 / 3)</span>
                                    </div>
                                  )}

                                  {/* Drag & Drop Zone for Meeting Minutes */}
                                  <div
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsDropOverMinutes(true);
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsDropOverMinutes(false);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsDropOverMinutes(false);
                                      const droppedFile = e.dataTransfer.files?.[0];
                                      if (droppedFile) {
                                        handleMinutesFileProcess(droppedFile, evt);
                                      }
                                    }}
                                    onClick={() => {
                                      if (!isSummarizingMinutes) {
                                        minutesFileInputRef.current?.click();
                                      }
                                    }}
                                    style={{
                                      border: isDropOverMinutes ? '2px dashed #2563eb' : '1.5px dashed #94a3b8',
                                      backgroundColor: isDropOverMinutes ? '#eff6ff' : '#f8fafc',
                                      borderRadius: '14px',
                                      padding: '16px',
                                      textAlign: 'center',
                                      cursor: isSummarizingMinutes ? 'wait' : 'pointer',
                                      transition: 'all 0.18s ease'
                                    }}
                                  >
                                    {isSummarizingMinutes ? (
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                                        <Loader2 size={24} color="#2563eb" className="spin" />
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1d4ed8' }}>
                                          AI กำลังสรุปบันทึกการประชุมและประเมิน State โครงการลงฐานข้อมูล...
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                                          <div
                                            style={{
                                              width: '38px',
                                              height: '38px',
                                              borderRadius: '10px',
                                              backgroundColor: '#e0f2fe',
                                              color: '#0284c7',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center'
                                            }}
                                          >
                                            <Upload size={20} />
                                          </div>
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                                          {evt.aiSummary
                                            ? 'อัปโหลดบันทึกการประชุมฉบับใหม่ (AI สรุปและอัปเดต State โครงการ)'
                                            : 'อัปโหลดบันทึกการประชุม (เมื่อประชุมเสร็จ) เพื่อให้ AI สรุปลงฐานข้อมูล'}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
                                          AI จะจำแนกสถานะ: <span style={{ color: '#2563eb' }}>1. เริ่มต้น</span> • <span style={{ color: '#d97706' }}>2. กำลังดำเนินงาน</span> • <span style={{ color: '#059669' }}>3. เสร็จสิ้นการดำเนินงาน</span> • <span style={{ color: '#7c3aed' }}>4. เกินระยะเวลาการดำเนินงาน</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                                          รองรับไฟล์ .docx, .docs, .doc, .txt, .pdf (ชนิด Text)
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Online Room & COPY LINK BUTTON */}
                                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                                    ห้องประชุมออนไลน์ (Online Room)
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                      type="text"
                                      readOnly
                                      value={evt.meetingUrl}
                                      style={{
                                        flex: 1,
                                        fontSize: '13.5px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        backgroundColor: '#ffffff',
                                        color: '#1e293b'
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopyLink(e, evt.meetingUrl, evt.id)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        fontSize: '13.5px',
                                        fontWeight: 700,
                                        border: 'none',
                                        backgroundColor: copiedId === evt.id ? '#10b981' : '#2563eb',
                                        color: '#ffffff',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {copiedId === evt.id ? <Check size={15} /> : <Copy size={15} />}
                                      <span>{copiedId === evt.id ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                                    </button>
                                  </div>

                                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                    <a
                                      href={evt.meetingUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        color: '#2563eb',
                                        textDecoration: 'none'
                                      }}
                                    >
                                      <Video size={16} />
                                      <span>เข้าสู่ห้องประชุมทันที</span>
                                      <ExternalLink size={14} />
                                    </a>

                                    {!isClose && (
                                      <button
                                        type="button"
                                        onClick={(e) => handleMarkAsCompleted(e, evt.id)}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '5px',
                                          padding: '6px 12px',
                                          borderRadius: '8px',
                                          border: '1px solid #a7f3d0',
                                          backgroundColor: '#ecfdf5',
                                          color: '#047857',
                                          fontSize: '13px',
                                          fontWeight: 700,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <CheckCircle2 size={14} />
                                        <span>บันทึกว่าประชุมเสร็จแล้ว</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons: Delete */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteMeeting(e, evt.id)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      padding: '6px 14px',
                                      borderRadius: '8px',
                                      border: '1px solid #fecaca',
                                      backgroundColor: '#fef2f2',
                                      color: '#dc2626',
                                      fontSize: '13px',
                                      fontWeight: 600,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Trash2 size={15} />
                                    ยกเลิกนัดหมาย
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

      {/* =========================================================
          DIALOG 1: CREATE MEETING DIALOG WITH PROJECT DROPDOWN LIST
         ========================================================= */}
      {confirmBookingSlot && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 21, 40, 0.58)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setConfirmBookingSlot(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '24px 28px',
              borderRadius: '18px',
              width: '460px',
              maxWidth: '92vw',
              boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
              border: '1px solid #cbd5e1'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={18} color="#2563eb" />
              <span>สร้างการประชุมโครงการคุณธรรม</span>
            </h3>
            <p style={{ color: '#475569', fontSize: '12.5px', lineHeight: 1.5, marginBottom: '16px' }}>
              กำหนดนัดหมายการประชุมในวันที่{' '}
              <strong style={{ color: '#2563eb' }}>{confirmBookingSlot.dateStr}</strong> เวลา{' '}
              <strong style={{ color: '#2563eb' }}>{confirmBookingSlot.hourStr} น.</strong>
            </p>

            {/* Project Name Dropdown List */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>
                เลือกชื่อโครงการ (เชื่อมโยงจากโครงการภายใต้ศูนย์คุณธรรม):
              </label>
              <select
                value={bookingProjectId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setBookingProjectId(nextId);
                  const foundSqlite = sqliteProjects.find((p) => p.projectId === nextId);
                  if (foundSqlite) {
                    setBookingTopic(`ประชุมติดตามและขับเคลื่อน: ${foundSqlite.projectName}`);
                  } else {
                    const foundLocal = projects.find((p) => p.id === nextId);
                    if (foundLocal) {
                      setBookingTopic(`ประชุมติดตามและขับเคลื่อน: ${foundLocal.name}`);
                    }
                  }
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #94a3b8',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {sqliteProjects.length > 0 ? (
                  sqliteProjects.map((proj) => (
                    <option key={proj.projectId} value={proj.projectId}>
                      {proj.projectName} (จ.{proj.province || 'กทม.'})
                    </option>
                  ))
                ) : (
                  projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} (จ.{proj.province} • {PROJECT_STATE_META[proj.state].label})
                    </option>
                  ))
                )}
              </select>

              {(() => {
                const chosenSqlite = sqliteProjects.find((p) => p.projectId === bookingProjectId);
                if (chosenSqlite) {
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '11.5px', color: '#475569' }}>
                      <span>จังหวัด: <strong>จ.{chosenSqlite.province || 'กทม.'}</strong></span>
                      <span>•</span>
                      <span style={{ color: '#2563eb', fontWeight: 700 }}>
                        ความคืบหน้า: {chosenSqlite.overallProgress}% ({chosenSqlite.completedTasks}/{chosenSqlite.totalTasks} กิจกรรม)
                      </span>
                      {chosenSqlite.organization && (
                        <>
                          <span>•</span>
                          <span>หน่วยงาน: {chosenSqlite.organization}</span>
                        </>
                      )}
                    </div>
                  );
                }
                const chosenLocal = projects.find((p) => p.id === bookingProjectId);
                if (!chosenLocal) return null;
                const stMeta = PROJECT_STATE_META[chosenLocal.state];
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '11.5px', color: '#475569' }}>
                    <span>จังหวัดของโครงการ: <strong>จ.{chosenLocal.province}</strong></span>
                    <span>•</span>
                    <span style={{ color: stMeta.color, fontWeight: 700 }}>
                      สถานะปัจจุบัน: {stMeta.label} ({chosenLocal.progressPercent}%)
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Meeting Topic Input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>
                หัวข้อการประชุม:
              </label>
              <input
                type="text"
                value={bookingTopic}
                onChange={(e) => setBookingTopic(e.target.value)}
                placeholder="ระบุวาระหรือหัวข้อการประชุม..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Meeting Type Selector */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>
                ประเภทการนัดหมาย:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setBookingType('meeting')}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: bookingType === 'meeting' ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    backgroundColor: bookingType === 'meeting' ? '#fef2f2' : '#ffffff',
                    color: bookingType === 'meeting' ? '#991b1b' : '#475569',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Meeting (นัดหมายทางการ)
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('booking')}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: bookingType === 'booking' ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                    backgroundColor: bookingType === 'booking' ? '#fffbeb' : '#ffffff',
                    color: bookingType === 'booking' ? '#92400e' : '#475569',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Booking (จองเวลาประชุม)
                </button>
              </div>
            </div>

            {/* Team Attendees Selection */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  ผู้เข้าร่วมประชุม (จากทีม: <span style={{ color: '#2563eb' }}>{activeTeam.name}</span>):
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  เลือกแล้ว {bookingAttendees.length} คน
                </span>
              </div>
              <div
                style={{
                  maxHeight: '125px',
                  overflowY: 'auto',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '6px 8px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {activeTeam.members.map((member) => {
                  const isChecked = bookingAttendees.some((b) => b.userId === member.userId);
                  return (
                    <div
                      key={member.userId}
                      onClick={() => {
                        if (isChecked) {
                          setBookingAttendees((prev) => prev.filter((b) => b.userId !== member.userId));
                        } else {
                          setBookingAttendees((prev) => [...prev, member]);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        backgroundColor: isChecked ? '#eff6ff' : '#ffffff',
                        border: isChecked ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        fontSize: '11.5px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        {isChecked ? <CheckSquare size={14} color="#2563eb" /> : <Square size={14} color="#94a3b8" />}
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: member.avatarBg || '#2563eb',
                            color: '#ffffff',
                            fontSize: '9px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {member.userName.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{member.userName}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '9px',
                          color: member.roleColor || '#2563eb',
                          backgroundColor: member.roleBg || '#eff6ff',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}
                      >
                        {member.roleLabel || member.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meeting Attachments Section during creation */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Paperclip size={13} color="#2563eb" />
                  <span>เอกสาร/ไฟล์แนบประกอบการประชุม ({bookingDocuments.length} ไฟล์):</span>
                </label>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #2563eb',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={12} />
                  <span>+ แนบไฟล์</span>
                  <input
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      const added: MeetingDocument[] = [];
                      for (let i = 0; i < files.length; i++) {
                        const f = files[i];
                        const ext = f.name.split('.').pop()?.toLowerCase() || 'file';
                        const sizeFormatted = f.size > 1024 * 1024
                          ? (f.size / (1024 * 1024)).toFixed(1) + ' MB'
                          : Math.round(f.size / 1024) + ' KB';
                        added.push({
                          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                          name: f.name,
                          uploadedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                          fileType: ext,
                          size: sizeFormatted
                        });
                      }
                      setBookingDocuments((prev) => [...prev, ...added]);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {bookingDocuments.length === 0 ? (
                <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', padding: '6px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  ยังไม่มีไฟล์แนบ (สามารถคลิก "+ แนบไฟล์" หรือแนบเพิ่มเติมภายหลังได้)
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '110px', overflowY: 'auto' }}>
                  {bookingDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#334155', textTransform: 'uppercase', flexShrink: 0 }}>
                          {doc.fileType || 'FILE'}
                        </span>
                        <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '240px', fontWeight: 600, color: '#1e293b' }}>
                          {doc.name}
                        </span>
                        {doc.size && <span style={{ fontSize: '10px', color: '#64748b', flexShrink: 0 }}>({doc.size})</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setBookingDocuments((prev) => prev.filter((d) => d.id !== doc.id))}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                        title="ลบไฟล์นี้"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setConfirmBookingSlot(null);
                  setBookingDocuments([]);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  const chosenSqlite = sqliteProjects.find((p) => p.projectId === bookingProjectId);
                  const chosenLocal = projects.find((p) => p.id === bookingProjectId);
                  const pId = chosenSqlite?.projectId || chosenLocal?.id || (sqliteProjects[0]?.projectId ?? 'proj-default');
                  const pName = chosenSqlite?.projectName || chosenLocal?.name || (sqliteProjects[0]?.projectName ?? 'โครงการคุณธรรม');
                  const pProv = chosenSqlite?.province || chosenLocal?.province || (sqliteProjects[0]?.province ?? 'กรุงเทพมหานคร');

                  const hourInt = parseInt(confirmBookingSlot.hourStr.split(':')[0], 10);
                  const newMeeting: MoralMeetingEvent = {
                    id: `meet-new-${Date.now()}`,
                    projectId: pId,
                    projectName: pName,
                    province: pProv,
                    topic: bookingTopic.trim() || `ประชุมขับเคลื่อน ${pName}`,
                    type: bookingType,
                    date: confirmBookingSlot.dateStr,
                    timeStart: confirmBookingSlot.hourStr,
                    timeEnd: `${String(hourInt + 1).padStart(2, '0')}:00`,
                    meetingUrl: `https://meet.google.com/moral-${Math.random().toString(36).substring(7)}`,
                    documents: bookingDocuments,
                    category: 'ชุมชนคุณธรรม',
                    attendees: bookingAttendees,
                    teamId: activeTeam.id
                  };
                  const nextMeetings = [...meetings, newMeeting];
                  setMeetings(nextMeetings);
                  saveProjectMeetings(nextMeetings);
                  setActiveEvent(newMeeting);
                  setConfirmBookingSlot(null);
                  setBookingDocuments([]);
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)'
                }}
              >
                ยืนยันสร้างการประชุม
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          DIALOG 2: ALERT DIALOG
         ========================================================= */}
      {alertDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 21, 40, 0.55)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setAlertDialog(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '24px 28px',
              borderRadius: '18px',
              width: '380px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
              border: '1px solid #cbd5e1'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 800, color: '#b91c1c' }}>
              {alertDialog.title}
            </h3>
            <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.5, marginBottom: '18px' }}>
              {alertDialog.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setAlertDialog(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          DIALOG 3: TEAM MANAGEMENT & USER SEARCH MODAL (สร้างทีม / ค้นหา User / Add เข้าทีม)
         ========================================================= */}
      {isTeamModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 21, 40, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            padding: '16px'
          }}
          onClick={() => setIsTeamModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '24px 28px',
              borderRadius: '20px',
              width: '560px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 50px rgba(0,0,0,0.3)',
              border: '1px solid #cbd5e1'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} color="#b45309" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#0f172a' }}>
                    จัดการทีมและค้นหาผู้ใช้ (Team Directory)
                  </h3>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                    ค้นหาบุคลากรจากฐานข้อมูลสิทธิ์ผู้ใช้เพื่อเพิ่มเข้าสู่ทีม และจัดการสมาชิก
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Section 1: Active Team Selection & Create New Team */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                ทีมที่กำลังใช้งานอยู่ (Active Team):
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={activeTeam.id}
                  onChange={(e) => {
                    const sel = setActiveCalendarTeam(e.target.value);
                    setActiveTeam(sel);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0f172a',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.members.length} คน)
                    </option>
                  ))}
                </select>
              </div>

              {/* Inline Create New Team Option */}
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อเพื่อสร้างทีมใหม่..."
                  value={newTeamNameInput}
                  onChange={(e) => setNewTeamNameInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    color: '#0f172a'
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateNewTeam}
                  disabled={!newTeamNameInput.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '7px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: newTeamNameInput.trim() ? '#2563eb' : '#94a3b8',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: newTeamNameInput.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Plus size={14} />
                  <span>สร้างทีมใหม่</span>
                </button>
              </div>
            </div>

            {/* Section 2: Search User & Add to Team */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Search size={14} color="#2563eb" />
                  <span>ค้นหา User เพื่อ Add เข้าสู่ทีม</span>
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  ค้นหาจากไดเรกทอรีสิทธิ์ผู้ใช้
                </span>
              </div>

              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="text"
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  placeholder="พิมพ์ชื่อผู้ใช้, ตำแหน่ง, ฝ่าย หรือสิทธิ์ (เช่น ดร., ประธาน, ผอ., เจ้าหน้าที่, Reviewer)..."
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '10px',
                    border: '1.5px solid #94a3b8',
                    fontSize: '12.5px',
                    color: '#0f172a',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Search Results Display */}
              {(() => {
                const results = searchAvailableUsers(
                  teamSearchQuery,
                  activeTeam.members.map((m) => m.userId)
                );

                if (results.length > 0) {
                  return (
                    <div
                      style={{
                        maxHeight: '160px',
                        overflowY: 'auto',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px'
                      }}
                    >
                      {results.map((u) => (
                        <div
                          key={u.userId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: u.avatarBg || '#2563eb',
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              {u.userName.charAt(0)}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                                {u.userName}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                                {u.position} • {u.department}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: u.roleColor || '#1d4ed8',
                                backgroundColor: u.roleBg || '#eff6ff',
                                padding: '2px 7px',
                                borderRadius: '4px'
                              }}
                            >
                              {u.roleLabel || u.role}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddMemberToTeam(u)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(16, 185, 129, 0.25)'
                              }}
                            >
                              <UserPlus size={12} />
                              <span>Add เข้าทีม</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                if (teamSearchQuery.trim()) {
                  return (
                    <div style={{ padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '10px', backgroundColor: '#fffbeb', fontSize: '11.5px', color: '#92400e' }}>
                      <div style={{ fontWeight: 700, marginBottom: '6px' }}>ไม่พบผู้ใช้ในระบบที่ตรงกับ "{teamSearchQuery}"</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="ชื่อ-นามสกุล บุคลากรใหม่..."
                          value={newCustomUserName || teamSearchQuery}
                          onChange={(e) => setNewCustomUserName(e.target.value)}
                          style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newCustomUserName.trim()) setNewCustomUserName(teamSearchQuery);
                            handleAddCustomUserToTeam();
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '11.5px',
                            cursor: 'pointer'
                          }}
                        >
                          + เพิ่มเข้าทีม
                        </button>
                      </div>
                    </div>
                  );
                }

                return null;
              })()}
            </div>

            {/* Section 3: Current Team Members List with Remove button */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  สมาชิกในทีมปัจจุบัน ({activeTeam.members.length} คน):
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  สามารถลบหรือจัดการผู้ใช้ได้
                </span>
              </div>

              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '8px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {activeTeam.members.map((member) => (
                  <div
                    key={member.userId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: member.avatarBg || '#2563eb',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {member.userName.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                          {member.userName}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                          {member.position} • {member.department}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: member.roleColor || '#1d4ed8',
                          backgroundColor: member.roleBg || '#eff6ff',
                          padding: '2px 7px',
                          borderRadius: '4px'
                        }}
                      >
                        {member.roleLabel || member.role}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMemberFromTeam(member.userId)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 6px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                        title="ลบออกจากทีม"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                style={{
                  padding: '8px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)'
                }}
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          DIALOG 4: SLOT ADD USER MODAL (เลือกคนที่อยู่ใน team เข้ามาประชุมใน slot นี้)
         ========================================================= */}
      {isSlotAddUserModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 21, 40, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            padding: '16px'
          }}
          onClick={() => setIsSlotAddUserModalOpen(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '22px 26px',
              borderRadius: '20px',
              width: '500px',
              maxWidth: '94vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 50px rgba(0,0,0,0.3)',
              border: '1px solid #cbd5e1'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <UserPlus size={18} color="#2563eb" />
                  <span>จัดการผู้เข้าร่วมประชุมใน Slot นี้</span>
                </h3>
                <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700, marginTop: '3px' }}>
                  {isSlotAddUserModalOpen.projectName} (จ.{isSlotAddUserModalOpen.province})
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  หัวข้อ: {isSlotAddUserModalOpen.topic} | วันที่ {isSlotAddUserModalOpen.date} ({isSlotAddUserModalOpen.timeStart} – {isSlotAddUserModalOpen.timeEnd} น.)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSlotAddUserModalOpen(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Instruction Banner */}
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '9px 12px', marginBottom: '14px', fontSize: '11.5px', color: '#1e40af', lineHeight: 1.4 }}>
              เลือกบุคลากรจากทีม <strong style={{ color: '#1d4ed8' }}>"{activeTeam.name}"</strong> ที่จะเข้าร่วมการประชุมใน slot นี้ (ติ๊กเลือกเพื่อ Add เข้า หรือติ๊กออกเพื่อถอดชื่อ)
            </div>

            {/* Members Checklist */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '260px',
                overflowY: 'auto',
                padding: '4px'
              }}
            >
              {activeTeam.members.map((member) => {
                const curAttendees = isSlotAddUserModalOpen.attendees || [];
                const isSelected = curAttendees.some((a) => a.userId === member.userId);

                return (
                  <div
                    key={member.userId}
                    onClick={() => handleToggleAttendeeInMeeting(isSlotAddUserModalOpen.id, member)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                      border: isSelected ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
                      {isSelected ? (
                        <CheckSquare size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                      ) : (
                        <Square size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                      )}
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: member.avatarBg || '#2563eb',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {member.userName.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#1e40af' : '#0f172a' }}>
                          {member.userName}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                          {member.position} • {member.department}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        color: member.roleColor || '#1d4ed8',
                        backgroundColor: member.roleBg || '#eff6ff',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        flexShrink: 0,
                        marginLeft: '6px'
                      }}
                    >
                      {member.roleLabel || member.role}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Link to Add more user to team */}
            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => {
                  setIsSlotAddUserModalOpen(null);
                  setIsTeamModalOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <UserPlus size={13} />
                <span>+ ค้นหาและเพิ่ม User คนใหม่เข้าทีม</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSlotAddUserModalOpen(null)}
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
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Tasks Reconciliation Modal (Scope Change / Implementation Plan Gap Update) */}
      {isReconciliationModalOpen && pendingReconciliation && (
        <NewTasksReconciliationModal
          isOpen={isReconciliationModalOpen}
          projectName={pendingReconciliation.matchedSqliteProj.projectName}
          province={pendingReconciliation.matchedSqliteProj.province}
          meetingTopic={pendingReconciliation.targetEvent.topic}
          newTasks={pendingReconciliation.syncResult.newTasksDiscovered || []}
          onConfirm={handleConfirmReconciliation}
          onCancel={handleCancelReconciliation}
        />
      )}

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
