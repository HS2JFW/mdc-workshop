import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlayCircle,
  MapPin,
  FolderKanban,
  Sparkles,
  FileText,
  Upload,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  TrendingUp,
  Layers,
  Database,
  Loader2,
  X,
  Eye
} from 'lucide-react';
import { MoralViewHeader } from '../components/MoralViewHeader';
import {
  Thailand3dShadedMap,
  type ThailandMapPin,
  type RegionalScoreDialogItem,
  THAILAND_PROVINCE_EN_TO_TH
} from '../components/Thailand3dShadedMap';
import { extractTextFromFile } from '../../../lib/moralEvaluationService';
import {
  THAILAND_77_PROVINCES,
  PROJECT_STATE_META,
  type ProjectProgressState,
  type MoralTrackedProject,
  type MoralMeetingEvent,
  loadTrackedProjects,
  loadProjectMeetings,
  saveProjectMeetings,
  createNewTrackedProject,
  updateTrackedProjectProvince,
  updateTrackedProjectState,
  updateProjectStateFromMeetingSummary,
  summarizeAndClassifyProjectStateWithAI
} from '../data/moralProjectsRealtimeStore';
import {
  syncNewTrackedProjectToSqlite,
  getPmsMeetingReportsForProject,
  savePmsMeetingReport,
  type PmsMeetingReportRecord
} from '../data/taskProjectSqliteService';
import { PmsMeetingReportModal } from '../components/PmsMeetingReportModal';

export interface PublicRealtimeProjectsDashboardViewProps {
  onBack?: () => void;
}

export const PublicRealtimeProjectsDashboardView: React.FC<PublicRealtimeProjectsDashboardViewProps> = ({
  onBack
}) => {
  const [projects, setProjects] = useState<MoralTrackedProject[]>(() => loadTrackedProjects());
  const [meetings, setMeetings] = useState<MoralMeetingEvent[]>(() => loadProjectMeetings());

  // Filters
  const [selectedStateFilter, setSelectedStateFilter] = useState<'ALL' | ProjectProgressState>('ALL');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('ALL');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Section 4 Project Search, Date Range Filter & View Details Modal
  const [sectionProjectSearchQuery, setSectionProjectSearchQuery] = useState<string>('');
  const [sectionStartDateFilter, setSectionStartDateFilter] = useState<string>('');
  const [sectionEndDateFilter, setSectionEndDateFilter] = useState<string>('');
  const [viewingProject, setViewingProject] = useState<MoralTrackedProject | null>(null);
  const [selectedPmsReport, setSelectedPmsReport] = useState<PmsMeetingReportRecord | null>(null);
  const [isPmsReportOpen, setIsPmsReportOpen] = useState<boolean>(false);

  // Create New Project Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newProjName, setNewProjName] = useState<string>('');
  const [newProjProvince, setNewProjProvince] = useState<string>('กรุงเทพมหานคร');
  const [newProjCategory, setNewProjCategory] = useState<MoralTrackedProject['category']>('ชุมชนคุณธรรม');

  // Direct Meeting Minutes Upload for a Project (AI Summarizer + State Detector)
  const [uploadingForProject, setUploadingForProject] = useState<MoralTrackedProject | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time sync listener
  useEffect(() => {
    const refreshData = () => {
      setProjects(loadTrackedProjects());
      setMeetings(loadProjectMeetings());
    };
    window.addEventListener('moral-projects-db-updated', refreshData);
    window.addEventListener('storage', refreshData);
    return () => {
      window.removeEventListener('moral-projects-db-updated', refreshData);
      window.removeEventListener('storage', refreshData);
    };
  }, []);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedStateFilter !== 'ALL' && p.state !== selectedStateFilter) return false;
      if (selectedProvinceFilter !== 'ALL' && p.province !== selectedProvinceFilter) return false;
      if (selectedRegionFilter !== 'ALL' && p.region !== selectedRegionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchProv = p.province.toLowerCase().includes(q);
        const matchSum = p.latestSummary.toLowerCase().includes(q);
        if (!matchName && !matchProv && !matchSum) return false;
      }
      return true;
    });
  }, [projects, selectedStateFilter, selectedProvinceFilter, selectedRegionFilter, searchQuery]);

  // Filtered projects specifically for Section 4 based on search query and start/end dates
  const sectionFilteredProjects = useMemo(() => {
    return filteredProjects.filter((p) => {
      // 1. Search by Project Name (ชื่อโครงการ)
      if (sectionProjectSearchQuery.trim()) {
        const q = sectionProjectSearchQuery.trim().toLowerCase();
        if (!p.name.toLowerCase().includes(q)) return false;
      }

      // 2. Date Range Filter (วันที่เริ่มต้น และวันที่สิ้นสุด)
      if (sectionStartDateFilter || sectionEndDateFilter) {
        const projStart = p.startDate || p.latestMeetingDate || p.lastUpdatedAt?.slice(0, 10) || '2026-01-01';
        const projEnd = p.endDate || '2026-12-31';

        if (sectionStartDateFilter && sectionEndDateFilter) {
          if (projStart > sectionEndDateFilter || projEnd < sectionStartDateFilter) return false;
        } else if (sectionStartDateFilter) {
          if (projEnd < sectionStartDateFilter) return false;
        } else if (sectionEndDateFilter) {
          if (projStart > sectionEndDateFilter) return false;
        }
      }

      return true;
    });
  }, [filteredProjects, sectionProjectSearchQuery, sectionStartDateFilter, sectionEndDateFilter]);

  // Overall KPI Metrics
  const kpiStats = useMemo(() => {
    const total = projects.length;
    const state1Count = projects.filter((p) => p.state === 'เริ่มต้น').length;
    const state2Count = projects.filter((p) => p.state === 'กำลังดำเนินงาน').length;
    const state3Count = projects.filter((p) => p.state === 'เสร็จสิ้นการดำเนินงาน').length;
    const state4Count = projects.filter((p) => p.state === 'เกินระยะเวลาการดำเนินงาน').length;
    const avgProgress =
      total > 0
        ? Math.round(projects.reduce((acc, p) => acc + p.progressPercent, 0) / total)
        : 0;
    const uniqueProvinces = new Set(projects.map((p) => p.province)).size;
    const totalSummarizedMeetings = meetings.filter((m) => Boolean(m.aiSummary)).length;

    return {
      total,
      state1Count,
      state2Count,
      state3Count,
      state4Count,
      state1Pct: total > 0 ? Math.round((state1Count / total) * 100) : 0,
      state2Pct: total > 0 ? Math.round((state2Count / total) * 100) : 0,
      state3Pct: total > 0 ? Math.round((state3Count / total) * 100) : 0,
      state4Pct: total > 0 ? Math.round((state4Count / total) * 100) : 0,
      avgProgress,
      uniqueProvinces,
      totalSummarizedMeetings
    };
  }, [projects, meetings]);

  // Regional Breakdown for Stacked Bar Chart & Map Dialogs
  const regionalStats = useMemo(() => {
    const regions: Array<'ภาคเหนือ' | 'ภาคตะวันออกเฉียงเหนือ' | 'ภาคกลาง' | 'ภาคใต้'> = [
      'ภาคเหนือ',
      'ภาคตะวันออกเฉียงเหนือ',
      'ภาคกลาง',
      'ภาคใต้'
    ];
    return regions.map((reg) => {
      const regProjects = projects.filter((p) => p.region === reg);
      const s1 = regProjects.filter((p) => p.state === 'เริ่มต้น').length;
      const s2 = regProjects.filter((p) => p.state === 'กำลังดำเนินงาน').length;
      const s3 = regProjects.filter((p) => p.state === 'เสร็จสิ้นการดำเนินงาน').length;
      const s4 = regProjects.filter((p) => p.state === 'เกินระยะเวลาการดำเนินงาน').length;
      const avg =
        regProjects.length > 0
          ? Math.round(regProjects.reduce((sum, p) => sum + p.progressPercent, 0) / regProjects.length)
          : 0;
      return {
        region: reg,
        total: regProjects.length,
        s1,
        s2,
        s3,
        s4,
        avgProgress: avg
      };
    });
  }, [projects]);

  // Map Pins for Filtered Projects
  const mapPins: ThailandMapPin[] = useMemo(() => {
    return filteredProjects.map((proj) => {
      const meta = PROJECT_STATE_META[proj.state];
      return {
        id: proj.id,
        name: `${proj.name} (${meta.label})`,
        province: proj.province,
        lat: 13.75,
        lng: 100.5,
        category: meta.label,
        color: meta.color,
        state: proj.state,
        progressPercent: proj.progressPercent
      };
    });
  }, [filteredProjects]);

  // Regional 3D Score Dialogs on the Map
  const regionalDialogs: RegionalScoreDialogItem[] = useMemo(() => {
    const keyMap: Record<string, string> = {
      'ภาคเหนือ': 'North',
      'ภาคตะวันออกเฉียงเหนือ': 'Northeast',
      'ภาคกลาง': 'Central',
      'ภาคใต้': 'South'
    };
    return regionalStats.map((r) => ({
      regionKey: keyMap[r.region] || r.region,
      name: r.region,
      score: `${r.avgProgress}%`,
      tier: `${r.total} โครงการ`,
      color: r.avgProgress >= 80 ? '#34d399' : r.avgProgress >= 45 ? '#fbbf24' : '#60a5fa',
      isSelected: selectedRegionFilter === r.region
    }));
  }, [regionalStats, selectedRegionFilter]);

  // Dynamic Province Fill on 3D Map based on highest project state in that province
  const getProvinceMapFill = (_locId: string, locName: string): string => {
    const thName = THAILAND_PROVINCE_EN_TO_TH[locName] || locName;
    const provProjects = filteredProjects.filter(
      (p) => p.province === thName || thName.includes(p.province) || p.province.includes(thName)
    );

    if (provProjects.length === 0) {
      return '#cbd5e1'; // Inactive / no projects in current filter
    }

    // Prioritize color by highest state or active filter
    const hasOverdue = provProjects.some((p) => p.state === 'เกินระยะเวลาการดำเนินงาน');
    const hasCompleted = provProjects.some((p) => p.state === 'เสร็จสิ้นการดำเนินงาน');
    const hasInProgress = provProjects.some((p) => p.state === 'กำลังดำเนินงาน');

    if (hasOverdue) return '#8b5cf6'; // Purple for State 4 (เกินระยะเวลาการดำเนินงาน)
    if (hasCompleted) return '#10b981'; // Emerald for State 3
    if (hasInProgress) return '#f59e0b'; // Amber for State 2
    return '#3b82f6'; // Royal Blue for State 1
  };

  // Handle creating a new project from dashboard modal
  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    const created = createNewTrackedProject(newProjName.trim(), newProjProvince, newProjCategory);
    await syncNewTrackedProjectToSqlite(created.id, created.name, created.province);
    setProjects(loadTrackedProjects());
    setSelectedProjectId(created.id);
    setNewProjName('');
    setShowCreateModal(false);
    setToastMessage(`สร้างโครงการ "${created.name}" (จ.${created.province}) สถานะ [1. เริ่มต้น] ลงฐานข้อมูลแล้ว`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Handle uploading meeting minutes directly on a project card to trigger AI summary + 3-state update
  const handleDirectMinutesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !uploadingForProject) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['docx', 'docs', 'doc', 'txt', 'pdf'].includes(ext)) {
      alert('กรุณาอัปโหลดไฟล์บันทึกการประชุมในรูปแบบ .docx, .docs, .doc, .txt หรือ .pdf');
      return;
    }

    setIsAiProcessing(true);
    try {
      const rawText = await extractTextFromFile(file);
      const todayStr = new Date().toISOString().slice(0, 10);
      const tempMeeting: MoralMeetingEvent = {
        id: `meet-direct-${Date.now()}`,
        projectId: uploadingForProject.id,
        projectName: uploadingForProject.name,
        province: uploadingForProject.province,
        topic: `ประชุมติดตามความคืบหน้าโครงการ: ${uploadingForProject.name}`,
        type: 'close',
        date: todayStr,
        timeStart: '10:00',
        timeEnd: '11:00',
        meetingUrl: 'https://meet.google.com/moral-realtime-sync',
        documents: [{ id: `doc-${Date.now()}`, name: file.name, uploadedAt: todayStr }],
        category: uploadingForProject.category
      };

      const summary = await summarizeAndClassifyProjectStateWithAI(rawText, tempMeeting, file.name);
      tempMeeting.aiSummary = summary;

      const updatedMeetings = [tempMeeting, ...loadProjectMeetings()];
      saveProjectMeetings(updatedMeetings);
      setMeetings(updatedMeetings);

      const updatedProjects = updateProjectStateFromMeetingSummary(
        uploadingForProject.id,
        tempMeeting.id,
        tempMeeting.topic,
        todayStr,
        summary
      );
      setProjects(updatedProjects);
      setSelectedProjectId(uploadingForProject.id);

      const stLabel = PROJECT_STATE_META[summary.detectedState]?.label || summary.detectedState;
      setToastMessage(
        `✨ AI สรุปบันทึกการประชุมสำเร็จ! อัปเดตโครงการ "${uploadingForProject.name}" เป็นสถานะ [${stLabel}] (${summary.progressPercent}%) ลงฐานข้อมูลแล้ว`
      );
      setTimeout(() => setToastMessage(null), 6000);
    } catch (err) {
      console.error('Direct minutes upload error:', err);
      alert('ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบว่าเป็นไฟล์ข้อความหรือ PDF ชนิด Text');
    } finally {
      setIsAiProcessing(false);
      setUploadingForProject(null);
    }
  };

  // SVG Donut Chart Calculations
  const donutSegments = useMemo(() => {
    const total = Math.max(kpiStats.total, 1);
    const r = 54;
    const c = 2 * Math.PI * r;
    const items = [
      { label: '1. เริ่มต้น', count: kpiStats.state1Count, color: '#2563eb' },
      { label: '2. กำลังดำเนินงาน', count: kpiStats.state2Count, color: '#f59e0b' },
      { label: '3. เสร็จสิ้นการดำเนินงาน', count: kpiStats.state3Count, color: '#10b981' },
      { label: '4. เกินระยะเวลาการดำเนินงาน', count: kpiStats.state4Count, color: '#7c3aed' }
    ];
    let accumulated = 0;
    return items.map((item) => {
      const frac = item.count / total;
      const dash = frac * c;
      const offset = c - accumulated * c;
      accumulated += frac;
      return { ...item, dash, c, offset, pct: Math.round(frac * 100) };
    });
  }, [kpiStats]);

  return (
    <div className="moral-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '36px' }}>
      {/* Hidden File Input for Quick Minutes Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.docs,.doc,.txt,.pdf"
        style={{ display: 'none' }}
        onChange={handleDirectMinutesUpload}
      />

      {/* Back to Projects Button */}
      {onBack && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: '#1e293b',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease'
            }}
            title="กลับสู่หน้าโครงการภายใต้ศูนย์คุณธรรม"
          >
            <span>← ย้อนกลับหน้าโครงการคุณธรรม</span>
          </button>
        </div>
      )}

      {/* Top View Header */}
      <MoralViewHeader
        viewTitle="ระบบติดตามโครงการ"
      />

      {/* Live Sync / AI Update Toast Banner */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1.5px solid #10b981',
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontWeight: 700, fontSize: '13.5px' }}>
            <Database size={18} color="#059669" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =========================================================
          SECTION 1: 5 REAL-TIME KPI SUMMARY CARDS
         ========================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Total Projects */}
        <div
          onClick={() => setSelectedStateFilter('ALL')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '16px 18px',
            border: selectedStateFilter === 'ALL' ? '2px solid #0f172a' : '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>โครงการคุณธรรมทั้งหมด</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}>
              <FolderKanban size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
            {kpiStats.total} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>โครงการ</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 700, marginTop: '6px' }}>
            📍 ครอบคลุมพื้นที่ {kpiStats.uniqueProvinces} จังหวัด
          </div>
        </div>

        {/* State 1: เริ่มต้น */}
        <div
          onClick={() => setSelectedStateFilter(selectedStateFilter === 'เริ่มต้น' ? 'ALL' : 'เริ่มต้น')}
          style={{
            backgroundColor: selectedStateFilter === 'เริ่มต้น' ? '#eff6ff' : '#ffffff',
            borderRadius: '16px',
            padding: '16px 18px',
            border: selectedStateFilter === 'เริ่มต้น' ? '2px solid #2563eb' : '1.5px solid #bfdbfe',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e40af' }}>State 1: เริ่มต้น</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <PlayCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#2563eb', lineHeight: 1.1 }}>
            {kpiStats.state1Count} <span style={{ fontSize: '13px', fontWeight: 700, color: '#3b82f6' }}>โครงการ ({kpiStats.state1Pct}%)</span>
          </div>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginTop: '6px' }}>
            ริเริ่มโครงการ / แต่งตั้งคณะทำงาน / วางแผน
          </div>
        </div>

        {/* State 2: กำลังดำเนินงาน */}
        <div
          onClick={() => setSelectedStateFilter(selectedStateFilter === 'กำลังดำเนินงาน' ? 'ALL' : 'กำลังดำเนินงาน')}
          style={{
            backgroundColor: selectedStateFilter === 'กำลังดำเนินงาน' ? '#fffbeb' : '#ffffff',
            borderRadius: '16px',
            padding: '16px 18px',
            border: selectedStateFilter === 'กำลังดำเนินงาน' ? '2px solid #d97706' : '1.5px solid #fde68a',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#92400e' }}>State 2: กำลังดำเนินงาน</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#d97706', lineHeight: 1.1 }}>
            {kpiStats.state2Count} <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>โครงการ ({kpiStats.state2Pct}%)</span>
          </div>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginTop: '6px' }}>
            ลงพื้นที่ขับเคลื่อนกิจกรรม / ติดตามความคืบหน้า
          </div>
        </div>

        {/* State 3: เสร็จสิ้นการดำเนินงาน */}
        <div
          onClick={() => setSelectedStateFilter(selectedStateFilter === 'เสร็จสิ้นการดำเนินงาน' ? 'ALL' : 'เสร็จสิ้นการดำเนินงาน')}
          style={{
            backgroundColor: selectedStateFilter === 'เสร็จสิ้นการดำเนินงาน' ? '#ecfdf5' : '#ffffff',
            borderRadius: '16px',
            padding: '16px 18px',
            border: selectedStateFilter === 'เสร็จสิ้นการดำเนินงาน' ? '2px solid #059669' : '1.5px solid #a7f3d0',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#065f46' }}>State 3: เสร็จสิ้น</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#059669', lineHeight: 1.1 }}>
            {kpiStats.state3Count} <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>โครงการ ({kpiStats.state3Pct}%)</span>
          </div>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginTop: '6px' }}>
            บรรลุตัวชี้วัด / ถอดบทเรียนและสรุปผลสัมฤทธิ์แล้ว
          </div>
        </div>

        {/* State 4: เกินระยะเวลาการดำเนินงาน (สีม่วง) */}
        <div
          onClick={() => setSelectedStateFilter(selectedStateFilter === 'เกินระยะเวลาการดำเนินงาน' ? 'ALL' : 'เกินระยะเวลาการดำเนินงาน')}
          style={{
            backgroundColor: selectedStateFilter === 'เกินระยะเวลาการดำเนินงาน' ? '#faf5ff' : '#ffffff',
            borderRadius: '16px',
            padding: '16px 18px',
            border: selectedStateFilter === 'เกินระยะเวลาการดำเนินงาน' ? '2px solid #7c3aed' : '1.5px solid #d8b4fe',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.08)',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#6b21a8' }}>State 4: เกินระยะเวลา</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#7c3aed', lineHeight: 1.1 }}>
            {kpiStats.state4Count} <span style={{ fontSize: '13px', fontWeight: 700, color: '#9333ea' }}>โครงการ ({kpiStats.state4Pct}%)</span>
          </div>
          <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: 600, marginTop: '6px' }}>
            เกินกรอบระยะเวลาตามแผน / ต้องเร่งรัดติดตาม
          </div>
        </div>

        {/* Average Progress & AI Summaries */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
            borderRadius: '16px',
            padding: '16px 18px',
            color: '#ffffff',
            boxShadow: '0 6px 16px rgba(15, 23, 42, 0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#93c5fd' }}>ความก้าวหน้าเฉลี่ยรวม</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
            {kpiStats.avgProgress}% <span style={{ fontSize: '12px', fontWeight: 600, color: '#bae6fd' }}>Progress</span>
          </div>
          <div style={{ fontSize: '11px', color: '#fde68a', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} />
            <span>AI สรุปบันทึกการประชุมแล้ว {kpiStats.totalSummarizedMeetings} ครั้ง</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 2: FILTER BAR & QUICK CREATE PROJECT BUTTON
         ========================================================= */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '14px 18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Left: State Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px', marginRight: '4px' }}>
            <Filter size={14} color="#2563eb" />
            <span>กรองตาม State:</span>
          </span>

          {(
            [
              { id: 'ALL', label: `ทั้งหมด (${kpiStats.total})`, color: '#0f172a', bg: '#f1f5f9' },
              { id: 'เริ่มต้น', label: `1. เริ่มต้น (${kpiStats.state1Count})`, color: '#2563eb', bg: '#eff6ff' },
              { id: 'กำลังดำเนินงาน', label: `2. กำลังดำเนินงาน (${kpiStats.state2Count})`, color: '#d97706', bg: '#fffbeb' },
              { id: 'เสร็จสิ้นการดำเนินงาน', label: `3. เสร็จสิ้น (${kpiStats.state3Count})`, color: '#059669', bg: '#ecfdf5' },
              { id: 'เกินระยะเวลาการดำเนินงาน', label: `4. เกินระยะเวลา (${kpiStats.state4Count})`, color: '#7c3aed', bg: '#faf5ff' }
            ] as const
          ).map((tab) => {
            const active = selectedStateFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStateFilter(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: active ? `2px solid ${tab.color}` : '1px solid #cbd5e1',
                  backgroundColor: active ? tab.bg : '#ffffff',
                  color: active ? tab.color : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Province Dropdown, Search & Create Project Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Province Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} color="#2563eb" />
            <select
              value={selectedProvinceFilter}
              onChange={(e) => setSelectedProvinceFilter(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <option value="ALL">ทุกจังหวัด (77 จังหวัด)</option>
              {THAILAND_77_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  จังหวัด{prov}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '210px' }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="ค้นหาชื่อโครงการ / สรุปการประชุม..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                color: '#0f172a',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Reset Filters */}
          {(selectedStateFilter !== 'ALL' || selectedProvinceFilter !== 'ALL' || selectedRegionFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedStateFilter('ALL');
                setSelectedProvinceFilter('ALL');
                setSelectedRegionFilter('ALL');
                setSearchQuery('');
              }}
              style={{
                padding: '7px 10px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#475569',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={12} />
              <span>ล้างตัวกรอง</span>
            </button>
          )}

        </div>
      </div>

      {/* =========================================================
          SECTION 3: SUMMARY MAP & REAL-TIME ANALYTICS GRAPHS
         ========================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(440px, 1.2fr) minmax(460px, 1.3fr)',
          gap: '18px',
          alignItems: 'stretch'
        }}
      >
        {/* LEFT CARD: 3D THAILAND SUMMARY MAP (Frame extended downward +30% & Map scale +10% larger) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '1014px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Real-time Spatial Tracking Map
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                  แผนที่สรุปความก้าวหน้าโครงการคุณธรรมรายจังหวัด
                </h3>
              </div>
              {selectedProvinceFilter !== 'ALL' && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: '1px solid #bfdbfe'
                  }}
                >
                  📍 จ.{selectedProvinceFilter}
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>
              คลิกที่จังหวัดหรือหมุดโครงการบนแผนที่เพื่อกรองดูข้อมูลเฉพาะพื้นที่ (สีจังหวัดแสดงตามสถานะสูงสุดของโครงการในพื้นที่)
            </p>
          </div>

          {/* 3D Map Container (Frame +30% longer & Map +10% larger) */}
          <div style={{ flex: 1, minHeight: '950px', padding: '28px 14px 36px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Thailand3dShadedMap
              height={611}
              scale={1.48}
              getProvinceFill={getProvinceMapFill}
              selectedProvinceName={selectedProvinceFilter !== 'ALL' ? selectedProvinceFilter : null}
              pins={mapPins}
              regionalScoreDialogs={regionalDialogs}
              onProvinceClick={(prov) => {
                const thName = THAILAND_PROVINCE_EN_TO_TH[prov.name] || prov.name;
                setSelectedProvinceFilter((prev) => (prev === thName ? 'ALL' : thName));
              }}
              onPinClick={(pin) => {
                setSelectedProjectId(pin.id);
                const el = document.getElementById(`project-card-${pin.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              onRegionalDialogClick={(regionKey) => {
                const reverseMap: Record<string, string> = {
                  North: 'ภาคเหนือ',
                  Northeast: 'ภาคตะวันออกเฉียงเหนือ',
                  Central: 'ภาคกลาง',
                  South: 'ภาคใต้'
                };
                const thReg = reverseMap[regionKey] || regionKey;
                setSelectedRegionFilter((prev) => (prev === thReg ? 'ALL' : thReg));
              }}
            />
          </div>

          {/* Map Color Legend for 3 States */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '8px'
            }}
          >
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#334155' }}>สัญลักษณ์สีสถานะบนแผนที่:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '11.5px', fontWeight: 700 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#2563eb' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                1. เริ่มต้น
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#d97706' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                2. กำลังดำเนินงาน
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#059669' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                3. เสร็จสิ้นการดำเนินงาน
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#7c3aed' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
                4. เกินระยะเวลาการดำเนินงาน
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3 REAL-TIME PROGRESS GRAPHS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* GRAPH 1: 3-STATE DONUT CHART & PIPELINE FUNNEL */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px',
              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                  State Progression Funnel & Distribution
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                  กราฟสัดส่วนสถานะโครงการคุณธรรม 3 States (อัปเดตจากบันทึกการประชุม)
                </h3>
              </div>
              <Layers size={18} color="#2563eb" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '165px 1fr', gap: '18px', alignItems: 'center' }}>
              {/* SVG Donut */}
              <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto' }}>
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle cx="75" cy="75" r="54" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                  {donutSegments.map((seg, i) => (
                    <circle
                      key={i}
                      cx="75"
                      cy="75"
                      r="54"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="18"
                      strokeDasharray={`${seg.dash} ${seg.c}`}
                      strokeDashoffset={seg.offset}
                      transform="rotate(-90 75 75)"
                      style={{ transition: 'all 0.4s ease' }}
                    />
                  ))}
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {kpiStats.total}
                  </span>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', marginTop: '2px' }}>
                    โครงการทั้งหมด
                  </span>
                </div>
              </div>

              {/* 3-Stage Pipeline Funnel Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    state: 'เริ่มต้น' as ProjectProgressState,
                    label: '1. เริ่มต้น (Initiation)',
                    count: kpiStats.state1Count,
                    pct: kpiStats.state1Pct,
                    color: '#2563eb',
                    bg: '#eff6ff'
                  },
                  {
                    state: 'กำลังดำเนินงาน' as ProjectProgressState,
                    label: '2. กำลังดำเนินงาน (In Progress)',
                    count: kpiStats.state2Count,
                    pct: kpiStats.state2Pct,
                    color: '#d97706',
                    bg: '#fffbeb'
                  },
                  {
                    state: 'เสร็จสิ้นการดำเนินงาน' as ProjectProgressState,
                    label: '3. เสร็จสิ้นการดำเนินงาน (Completed)',
                    count: kpiStats.state3Count,
                    pct: kpiStats.state3Pct,
                    color: '#059669',
                    bg: '#ecfdf5'
                  },
                  {
                    state: 'เกินระยะเวลาการดำเนินงาน' as ProjectProgressState,
                    label: '4. เกินระยะเวลาการดำเนินงาน (Overdue)',
                    count: kpiStats.state4Count,
                    pct: kpiStats.state4Pct,
                    color: '#7c3aed',
                    bg: '#faf5ff'
                  }
                ].map((row) => (
                  <div
                    key={row.state}
                    onClick={() => setSelectedStateFilter(selectedStateFilter === row.state ? 'ALL' : row.state)}
                    style={{
                      backgroundColor: row.bg,
                      borderRadius: '10px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      border: selectedStateFilter === row.state ? `1.5px solid ${row.color}` : '1px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 800, color: row.color, marginBottom: '5px' }}>
                      <span>{row.label}</span>
                      <span>
                        {row.count} โครงการ ({row.pct}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.max(row.pct, 4)}%`,
                          height: '100%',
                          backgroundColor: row.color,
                          borderRadius: '999px',
                          transition: 'width 0.35s ease'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GRAPH 2: REGIONAL 3-STATE STACKED BAR CHART */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px',
              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                  Regional Project State Comparison
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                  กราฟจำแนกสถานะโครงการและความก้าวหน้าเฉลี่ยรายภูมิภาค
                </h3>
              </div>
              {selectedRegionFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedRegionFilter('ALL')}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer'
                  }}
                >
                  ดูทุกภูมิภาค
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {regionalStats.map((reg) => {
                const total = Math.max(reg.total, 1);
                const w1 = (reg.s1 / total) * 100;
                const w2 = (reg.s2 / total) * 100;
                const w3 = (reg.s3 / total) * 100;
                const w4 = (reg.s4 / total) * 100;
                const isSelectedReg = selectedRegionFilter === reg.region;

                return (
                  <div
                    key={reg.region}
                    onClick={() => setSelectedRegionFilter(isSelectedReg ? 'ALL' : reg.region)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      backgroundColor: isSelectedReg ? '#eff6ff' : '#f8fafc',
                      border: isSelectedReg ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>
                        {reg.region} ({reg.total} โครงการ)
                      </span>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: 700, flexWrap: 'wrap' }}>
                        <span style={{ color: '#2563eb' }}>เริ่มต้น: {reg.s1}</span>
                        <span style={{ color: '#d97706' }}>กำลังดำเนินงาน: {reg.s2}</span>
                        <span style={{ color: '#059669' }}>เสร็จสิ้น: {reg.s3}</span>
                        <span style={{ color: '#7c3aed' }}>เกินระยะเวลา: {reg.s4}</span>
                        <span style={{ color: '#0f172a', fontWeight: 800 }}>• เฉลี่ย {reg.avgProgress}%</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                      {reg.s1 > 0 && <div style={{ width: `${w1}%`, backgroundColor: '#3b82f6', height: '100%' }} />}
                      {reg.s2 > 0 && <div style={{ width: `${w2}%`, backgroundColor: '#f59e0b', height: '100%' }} />}
                      {reg.s3 > 0 && <div style={{ width: `${w3}%`, backgroundColor: '#10b981', height: '100%' }} />}
                      {reg.s4 > 0 && <div style={{ width: `${w4}%`, backgroundColor: '#8b5cf6', height: '100%' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GRAPH 3: REAL-TIME PROGRESS BAR CHART BY PROJECT */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px',
              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)',
              flex: 1
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                  Project-by-Project Progress Meter (0% – 100%)
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                  กราฟความก้าวหน้ารายโครงการแบบ Real-time ({filteredProjects.length} โครงการ)
                </h3>
              </div>
              <Activity size={18} color="#059669" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '195px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredProjects.map((proj) => {
                const meta = PROJECT_STATE_META[proj.state];
                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      const el = document.getElementById(`project-card-${proj.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(170px, 1.3fr) 1fr 90px',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      backgroundColor: selectedProjectId === proj.id ? '#eff6ff' : '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {proj.name} <span style={{ color: '#64748b', fontWeight: 600 }}>(จ.{proj.province})</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${proj.progressPercent}%`,
                          height: '100%',
                          backgroundColor: meta.color,
                          borderRadius: '999px',
                          transition: 'width 0.35s ease'
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: meta.color, textAlign: 'right' }}>
                      {proj.progressPercent}% • State {meta.step}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 4: REAL-TIME PROJECT CARDS & AI DATABASE RECORDS
         ========================================================= */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          padding: '20px 22px',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)'
        }}
      >
        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Real-time Project & AI Meeting Summary Database
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
              รายการโครงการคุณธรรม สถานะความก้าวหน้า  และผลสรุปบันทึกการประชุม
            </h3>
          </div>
          <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
            💡 กดปุ่ม <strong>“View”</strong> ที่การ์ดเพื่อดูข้อมูลทั้งหมดของโครงการ หรืออัปโหลดบันทึกการประชุม
          </div>
        </div>

        {/* Search & Date Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: '18px'
          }}
        >
          {/* Search by Project Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 280px', minWidth: '240px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={16}
                color="#64748b"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={sectionProjectSearchQuery}
                onChange={(e) => setSectionProjectSearchQuery(e.target.value)}
                placeholder="ค้นหาด้วยชื่อโครงการ..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Date Range: วันที่เริ่มต้น - วันที่สิ้นสุด */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '5px 10px'
              }}
            >
              <Calendar size={14} color="#2563eb" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                วันที่เริ่มต้น:
              </span>
              <input
                type="date"
                value={sectionStartDateFilter}
                onChange={(e) => setSectionStartDateFilter(e.target.value)}
                title="วันที่เริ่มต้น"
                style={{
                  padding: '3px 6px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
              <span style={{ color: '#94a3b8', fontWeight: 700 }}>–</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                วันที่สิ้นสุด:
              </span>
              <input
                type="date"
                value={sectionEndDateFilter}
                onChange={(e) => setSectionEndDateFilter(e.target.value)}
                title="วันที่สิ้นสุด"
                style={{
                  padding: '3px 6px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>

            {/* Clear filters button if active */}
            {(sectionProjectSearchQuery || sectionStartDateFilter || sectionEndDateFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSectionProjectSearchQuery('');
                  setSectionStartDateFilter('');
                  setSectionEndDateFilter('');
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="ล้างตัวกรองการค้นหา"
              >
                <X size={13} />
                <span>ล้างตัวกรอง</span>
              </button>
            )}

            {/* Count Badge */}
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '12px',
                fontWeight: 800
              }}
            >
              พบ {sectionFilteredProjects.length} โครงการ
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        {sectionFilteredProjects.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '14px',
              border: '1px dashed #cbd5e1',
              color: '#64748b'
            }}
          >
            <FolderKanban size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
              ไม่พบโครงการที่ตรงกับเงื่อนไขการค้นหา
            </div>
            <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px' }}>
              ลองปรับเปลี่ยนคำค้นหาชื่อโครงการ หรือช่วงวันที่เริ่มต้น - วันที่สิ้นสุด
            </div>
            {(sectionProjectSearchQuery || sectionStartDateFilter || sectionEndDateFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSectionProjectSearchQuery('');
                  setSectionStartDateFilter('');
                  setSectionEndDateFilter('');
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {sectionFilteredProjects.map((proj) => {
              const stateMeta = PROJECT_STATE_META[proj.state] || PROJECT_STATE_META['เริ่มต้น'];
              const isHighlighted = selectedProjectId === proj.id;

              return (
                <div
                  id={`project-card-${proj.id}`}
                  key={proj.id}
                  style={{
                    borderRadius: '14px',
                    border: isHighlighted ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    padding: '18px 20px',
                    boxShadow: isHighlighted
                      ? '0 10px 25px rgba(37, 99, 235, 0.16)'
                      : '0 2px 10px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* 1. ชื่อโครงการ */}
                  <div>
                    <h4
                      style={{
                        fontSize: '15.5px',
                        fontWeight: 800,
                        color: '#0f172a',
                        margin: 0,
                        lineHeight: 1.45
                      }}
                      title={proj.name}
                    >
                      {proj.name}
                    </h4>
                  </div>

                  {/* 2. Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b' }}>
                        ความก้าวหน้า
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 900, color: stateMeta.color }}>
                        {proj.progressPercent}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '9px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '999px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, proj.progressPercent))}%`,
                          height: '100%',
                          backgroundColor: stateMeta.color,
                          borderRadius: '999px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* 3. ปุ่ม View ที่สามารถดูข้อมูลทั้งหมดของโครงการ เท่านั้น */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setViewingProject(proj)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 18px',
                        borderRadius: '999px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                        transition: 'all 0.18s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                      title="ดูข้อมูลทั้งหมดของโครงการ"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          MODAL: VIEW FULL PROJECT DETAILS ("ดูข้อมูลทั้งหมดของโครงการ")
         ========================================================= */}
      {viewingProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 21, 40, 0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '20px'
          }}
          onClick={() => setViewingProject(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '26px 30px',
              width: '760px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '1.5px solid #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            {/* Header: Title, Category, State, Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      color: '#334155'
                    }}
                  >
                    {viewingProject.category}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8'
                    }}
                  >
                    📍 จ.{viewingProject.province} ({viewingProject.region})
                  </span>
                  {(() => {
                    const meta = PROJECT_STATE_META[viewingProject.state] || PROJECT_STATE_META['เริ่มต้น'];
                    return (
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          backgroundColor: meta.bgLight,
                          color: meta.color,
                          border: `1.5px solid ${meta.border}`
                        }}
                      >
                        {meta.label} ({viewingProject.progressPercent}%)
                      </span>
                    );
                  })()}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.4 }}>
                  {viewingProject.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const reports = getPmsMeetingReportsForProject(viewingProject.id);
                  if (reports.length > 0) {
                    setSelectedPmsReport(reports[0]);
                  } else {
                    setSelectedPmsReport({
                      id: `REP02-${viewingProject.id}`,
                      meetingId: `MEET-${viewingProject.id}`,
                      projectId: viewingProject.id,
                      projectName: viewingProject.name,
                      province: viewingProject.province,
                      meetingDate: viewingProject.latestMeetingDate || new Date().toISOString().slice(0, 10),
                      meetingTopic: viewingProject.latestMeetingTopic || 'รายงานติดตามความก้าวหน้าโครงการประจำรอบ',
                      reportingPeriod: 'ประจำเดือน / ไตรมาส',
                      executiveSummary: viewingProject.latestSummary || `โครงการ "${viewingProject.name}" (จ.${viewingProject.province}) มีความคืบหน้ารวม ${viewingProject.progressPercent}% อยู่ในสถานะ ${viewingProject.state}`,
                      sourceFileName: 'ระบบติดตามโครงการ Real-time PMS',
                      obstaclesAndRisks: [
                        'การประสานงานเครือข่ายพื้นที่และกลุ่มเป้าหมาย',
                        'การติดตามประเมินผลเชิงพฤติกรรมอย่างต่อเนื่อง'
                      ],
                      correctiveSolutions: [
                        'จัดประชุมกำกับติดตามเป็นระยะสม่ำเสมอ',
                        'เชื่อมโยงฐานข้อมูลคุณธรรมและประเมินผลลัพธ์เชิงประจักษ์'
                      ],
                      updatedTasks: [
                        {
                          id: `task-${viewingProject.id}-1`,
                          task_code: '1.0',
                          task_name: 'ดำเนินงานกิจกรรมตามแผนงานโครงการ',
                          new_status: viewingProject.progressPercent === 100 ? 'เสร็จสิ้น' : 'กำลังดำเนินงาน',
                          new_progress: viewingProject.progressPercent,
                          rationale: viewingProject.latestStateRationale || 'รายงานผลการดำเนินงานในที่ประชุม'
                        }
                      ],
                      addedTasks: [],
                      directives: [
                        {
                          directiveText: 'ติดตามความก้าวหน้าโครงการและรายงานผลตามกำหนด',
                          responsiblePerson: 'ผู้จัดการโครงการและคณะทำงานพื้นที่',
                          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                          priority: 'ด่วน'
                        }
                      ],
                      createdAt: new Date().toISOString()
                    });
                  }
                  setIsPmsReportOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid #bfdbfe',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <FileText size={14} color="#2563eb" />
                <span>ดูฟอร์ม FORM-REP-02</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingProject(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="ปิด"
              >
                <X size={18} />
              </button>
            </div>

            {/* Timeline & Project Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '12px 16px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>วันที่เริ่มต้น:</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 800 }}>
                  {viewingProject.startDate || '2026-01-15'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>วันที่สิ้นสุด:</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 800 }}>
                  {viewingProject.endDate || '2026-12-31'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>การประชุมที่บันทึก:</div>
                <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: 800 }}>
                  {viewingProject.meetingsCount || 1} ครั้ง
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>อัปเดตล่าสุด:</div>
                <div style={{ fontSize: '13px', color: '#059669', fontWeight: 800 }}>
                  {viewingProject.updatedAt || viewingProject.lastUpdatedAt || '-'}
                </div>
              </div>
            </div>

            {/* 4-State Visual Progress Stepper & Interactive State Changer */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '14px 16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                  สถานะความก้าวหน้า (4 States):
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: PROJECT_STATE_META[viewingProject.state]?.color || '#2563eb' }}>
                  {viewingProject.progressPercent}%
                </span>
              </div>

              {/* Stepper Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {(
                  [
                    { state: 'เริ่มต้น', step: 1, label: '1. เริ่มต้น' },
                    { state: 'กำลังดำเนินงาน', step: 2, label: '2. กำลังทำ' },
                    { state: 'เสร็จสิ้นการดำเนินงาน', step: 3, label: '3. เสร็จสิ้น' },
                    { state: 'เกินระยะเวลาการดำเนินงาน', step: 4, label: '4. เกินเวลา' }
                  ] as const
                ).map((st) => {
                  const stateMeta = PROJECT_STATE_META[viewingProject.state] || PROJECT_STATE_META['เริ่มต้น'];
                  const reached = stateMeta.step >= st.step;
                  const isCurrent = viewingProject.state === st.state;
                  const stColor = PROJECT_STATE_META[st.state].color;
                  return (
                    <div
                      key={st.state}
                      onClick={() => {
                        const updated = updateTrackedProjectState(viewingProject.id, st.state);
                        setProjects(updated);
                        const refreshed = updated.find((p) => p.id === viewingProject.id);
                        if (refreshed) setViewingProject(refreshed);
                      }}
                      title={`คลิกเพื่อเปลี่ยนสถานะโครงการเป็น ${st.label}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '7px 4px',
                        borderRadius: '8px',
                        backgroundColor: isCurrent ? PROJECT_STATE_META[st.state].bgLight : reached ? '#f1f5f9' : '#ffffff',
                        border: isCurrent ? `1.5px solid ${stColor}` : '1px solid #e2e8f0',
                        fontSize: '11px',
                        fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? stColor : reached ? '#334155' : '#94a3b8',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {st.state === 'เกินระยะเวลาการดำเนินงาน' ? (
                        <AlertTriangle size={13} color={isCurrent ? stColor : '#cbd5e1'} />
                      ) : (
                        <CheckCircle2 size={13} color={isCurrent ? stColor : reached ? '#10b981' : '#cbd5e1'} />
                      )}
                      <span style={{ whiteSpace: 'nowrap' }}>{st.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Big Progress Bar */}
              <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, viewingProject.progressPercent))}%`,
                    height: '100%',
                    backgroundColor: PROJECT_STATE_META[viewingProject.state]?.color || '#2563eb',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            {/* AI Summary Box */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '14px',
                padding: '16px 18px',
                fontSize: '12.5px',
                color: '#1e293b',
                lineHeight: 1.55
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, color: '#166534', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} color="#16a34a" />
                  <span>ผลสรุปบันทึกการประชุมโดย AI (AI Database Summary):</span>
                </span>
                {viewingProject.latestMeetingDate && (
                  <span style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 700 }}>
                    <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    วันที่ประชุม: {viewingProject.latestMeetingDate}
                  </span>
                )}
              </div>

              {viewingProject.latestMeetingTopic && (
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  วาระล่าสุด: “{viewingProject.latestMeetingTopic}”
                </div>
              )}

              <div style={{ fontSize: '12.5px', color: '#334155', marginBottom: '10px' }}>
                {viewingProject.latestSummary}
              </div>

              {viewingProject.latestStateRationale && (
                <div
                  style={{
                    fontSize: '12px',
                    backgroundColor: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #dcfce7',
                    color: '#065f46',
                    marginBottom: '8px'
                  }}
                >
                  <strong>เหตุผลประเมิน State:</strong> {viewingProject.latestStateRationale}
                </div>
              )}

              {viewingProject.latestActionItems && viewingProject.latestActionItems.length > 0 && (
                <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '6px' }}>
                  <strong>มติการขับเคลื่อนต่อ:</strong> {viewingProject.latestActionItems.join(' • ')}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => {
                  setUploadingForProject(viewingProject);
                  fileInputRef.current?.click();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid #93c5fd',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Upload size={14} />
                <span>อัปโหลดบันทึกการประชุม (AI อัปเดต State)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingProject(null)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: CREATE NEW PROJECT + PROVINCE DROPDOWN
         ========================================================= */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 21, 40, 0.55)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <form
            onSubmit={handleCreateProjectSubmit}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '24px 28px',
              width: '440px',
              maxWidth: '92vw',
              boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
              border: '1px solid #cbd5e1'
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              + สร้างชื่อโครงการคุณธรรมใหม่ลงฐานข้อมูล
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#64748b' }}>
              โครงการที่สร้างจะซิงค์ไปยังหน้าปฏิทินการประชุมอัตโนมัติ พร้อมเริ่มต้นที่สถานะ [1. เริ่มต้น]
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                ชื่อโครงการคุณธรรม:
              </label>
              <input
                type="text"
                required
                placeholder="ระบุชื่อโครงการ..."
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                เลือกจังหวัด (Dropdown 77 จังหวัด):
              </label>
              <select
                value={newProjProvince}
                onChange={(e) => setNewProjProvince(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {THAILAND_77_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    จังหวัด{prov}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                หมวดหมู่โครงการ:
              </label>
              <select
                value={newProjCategory}
                onChange={(e) => setNewProjCategory(e.target.value as MoralTrackedProject['category'])}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <option value="ชุมชนคุณธรรม">ชุมชนคุณธรรม</option>
                <option value="คุณธรรม 5 มิติ">คุณธรรม 5 มิติ</option>
                <option value="ทุนชีวิต 6 พลัง">ทุนชีวิต 6 พลัง</option>
                <option value="องค์กรต้นแบบ">องค์กรต้นแบบ</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                บันทึกโครงการ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Official PMS Meeting Report Form Modal (FORM-REP-02 & FORM-DIR-01) */}
      {isPmsReportOpen && selectedPmsReport && (
        <PmsMeetingReportModal
          isOpen={isPmsReportOpen}
          report={selectedPmsReport}
          onClose={() => {
            setIsPmsReportOpen(false);
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
