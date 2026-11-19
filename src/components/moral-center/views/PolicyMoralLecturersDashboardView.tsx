import { PublishedPageSynergySection } from '../components/PublishedPageSynergySection';
import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Building2,
  GraduationCap,
  Users,
  Award,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  MapPin,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react';
import { MdcTopSearchBar } from '../components/MdcTopSearchBar';
import { exportDashboardToPdf } from '../utils/dashboardExportUtils';
import { MdcTopSubmenuBar, type MdcSubmenuCardItem } from '../components/MdcTopSubmenuBar';
import { MoralTeacherSynergyTopicView } from '../components/MoralTeacherSynergyTopicView';
import { MoralTeacherRegionalMapCard } from '../components/MoralTeacherRegionalMapCard';
import {
  MDC_LECTURERS_SUMMARY,
  MDC_TOP_15_PROVINCES,
  MDC_MORAL_COMPETENCIES,
  MDC_LECTURERS_YEAR_TREND,
  MDC_LECTURERS_DIRECTORY,
  MDC_PROVINCE_STATS_MAP,
  MDC_STRATEGIC_6_REGIONS_TABLE,
  MDC_INSTITUTIONAL_SECTORS,
  MDC_WHITE_SPACE_PROVINCES,
  type MoralLecturerRecord
} from '../data/moralLecturersData';
import { MORAL_TEACHER_SYNERGY_TOPICS } from '../data/moralTeacherSynergyTopicsData';

// Color Palette for Visualizations
const PIE_COLORS = ['#1e3a8a', '#0284c7', '#059669', '#d97706', '#7c3aed', '#dc2626'];

export interface PolicyMoralLecturersDashboardViewProps {
  onNavigatePage?: (pageId: string) => void;
}

export const PolicyMoralLecturersDashboardView: React.FC<PolicyMoralLecturersDashboardViewProps> = ({
  onNavigatePage
}) => {
  // Navigation: null = ภาพรวม (Overview), or string key for synergy dimension
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  // Active Dataset Tab Switcher (Directory, Provincial 77, Regional 6, Competencies, Annual Trend, White Space)
  type LecturerDatasetTab =
    | 'directory'      // ทำเนียบวิทยากรรายบุคคล (5,346 คน)
    | 'provincial'     // สถิติวิทยากรรายจังหวัด (77 จังหวัด)
    | 'regional'       // สถิติ 6 ภูมิภาคยุทธศาสตร์ (6 ภาค)
    | 'competencies'   // สถิติ 5 มิติคุณธรรม & 5 ภาคส่วนสถาบัน
    | 'annual_trend'   // สถิติพัฒนาการสะสมรายปี (2562–2568)
    | 'whitespace';    // ตารางพื้นที่ขาดแคลน White Space (15 จังหวัด)

  const [activeDatasetTab, setActiveDatasetTab] = useState<LecturerDatasetTab>('provincial');

  // PDPA privacy toggle for Directory Table
  const [showRealNames, setShowRealNames] = useState<boolean>(true);

  // Table filters & search state
  const [tableSearch, setTableSearch] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Top Submenu Bar Items (matches standard 130px x 106px arch cards)
  const submenuItems: MdcSubmenuCardItem[] = useMemo(() => {
    return [
      {
        key: 'overview',
        name: 'ภาพรวม',
        subName: 'MORAL TEACHER',
        colorType: 'blue',
        isActive: selectedDimension === null,
        onClick: () => setSelectedDimension(null),
        title: 'ภาพรวมฐานข้อมูลวิทยากรคุณธรรม (5,346 คน • 77 จังหวัด)',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" fill="#ffffff" fillOpacity="0.3" />
            <rect x="14" y="3" width="7" height="7" rx="1" fill="#ffffff" fillOpacity="0.3" />
            <rect x="14" y="14" width="7" height="7" rx="1" fill="#ffffff" fillOpacity="0.3" />
            <rect x="3" y="14" width="7" height="7" rx="1" fill="#ffffff" fillOpacity="0.3" />
          </svg>
        )
      },
      {
        key: 'integrity',
        name: 'วิทยากรสุจริต',
        subName: 'ขาดแคลนใน อปท. & คดีจัดซื้อ',
        colorType: 'amber',
        isActive: selectedDimension === 'integrity',
        onClick: () => setSelectedDimension('integrity'),
        title: 'พลวัตวิทยากรสุจริต: วิกฤตขาดแคลนใน อปท./เขตเมือง กับผลกระทบต่อคดีทุจริตจัดซื้อจัดจ้างภาครัฐ',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        )
      },
      {
        key: 'sufficiency',
        name: 'วิทยากรพอเพียง',
        subName: 'เติบโตสูง & เร่งแก้หนี้เมือง',
        colorType: 'teal',
        isActive: selectedDimension === 'sufficiency',
        onClick: () => setSelectedDimension('sufficiency'),
        title: 'การขยายตัวของวิทยากรพอเพียง: จากฐานรากเกษตรสู่โจทย์เร่งด่วนแก้วิกฤตหนี้สินคนเมือง',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
            <path d="M12 6v12" />
          </svg>
        )
      },
      {
        key: 'discipline',
        name: 'วิทยากรวินัย',
        subName: 'ชะลอตัวเยาวชน & ลดอุบัติเหตุ',
        colorType: 'sky',
        isActive: selectedDimension === 'discipline',
        onClick: () => setSelectedDimension('discipline'),
        title: 'วิทยากรวินัยและความรับผิดชอบ: ภาวะชะลอตัวในกลุ่มเยาวชน กับสถิติอุบัติเหตุและพฤติกรรมเสี่ยง',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )
      },
      {
        key: 'gratitude',
        name: 'วิทยากรกตัญญู',
        subName: 'สัดส่วนต่ำสุด 10% & สังคมสูงวัย',
        colorType: 'purple',
        isActive: selectedDimension === 'gratitude',
        onClick: () => setSelectedDimension('gratitude'),
        title: 'วิทยากรกตัญญูและการเกื้อกูล: สัดส่วนที่น้อยที่สุด (10%) สวนทางคลื่นสึนามิสังคมสูงวัยสมบูรณ์',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        )
      },
      {
        key: 'lifecapital',
        name: 'วิทยากรจิตอาสา',
        subName: 'กระจุกตัวสูง & ป้องกันเด็กหลุดระบบ',
        colorType: 'lilac',
        isActive: selectedDimension === 'lifecapital',
        onClick: () => setSelectedDimension('lifecapital'),
        title: 'พลังวิทยากรจิตอาสาและการสร้างทุนชีวิต: การกระจุกตัวเชิงพื้นที่ กับการป้องกันเด็กหลุดจากระบบ',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      }
    ];
  }, [selectedDimension]);

  // Donut Chart Data: Coach vs New Comer
  const levelRatioData = useMemo(() => {
    return [
      { name: 'นักส่งเสริมคุณธรรมขั้นต้น (New Comer)', value: 4750, color: '#0284c7' },
      { name: 'พี่เลี้ยงคุณธรรม (Coach)', value: 596, color: '#1e3a8a' }
    ];
  }, []);

  // Top 10 Provinces Bar Chart Data
  const top10ProvincesData = useMemo(() => {
    return MDC_TOP_15_PROVINCES.slice(0, 10).map((p) => ({
      province: p.province,
      count: p.count,
      coach: p.coach,
      newComer: p.newComer,
      region: p.region
    }));
  }, []);

  // 77 Provinces dataset from MDC_PROVINCE_STATS_MAP
  const provincialDataset = useMemo(() => {
    return Object.values(MDC_PROVINCE_STATS_MAP).map((p) => ({
      province: p.province,
      region: p.region,
      total: p.total,
      coach: p.coach,
      newComer: p.newComer,
      activeVerified: p.activeVerified,
      paccNetwork: p.paccNetwork,
      sufficiency: p.competencies?.['พอเพียง'] || 0,
      discipline: p.competencies?.['วินัยและความรับผิดชอบ'] || 0,
      volunteering: p.competencies?.['จิตอาสา'] || 0,
      integrity: p.competencies?.['สุจริต'] || 0,
      gratitude: p.competencies?.['กตัญญู'] || 0
    })).sort((a, b) => b.total - a.total);
  }, []);

  const filteredProvincial = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    return provincialDataset.filter((p) => {
      const matchSearch = !q || p.province.toLowerCase().includes(q) || p.region.toLowerCase().includes(q);
      const matchRegion = selectedRegionFilter === 'all' || p.region === selectedRegionFilter;
      return matchSearch && matchRegion;
    });
  }, [provincialDataset, tableSearch, selectedRegionFilter]);

  // Filtered Lecturers Table Data
  const filteredLecturers = useMemo(() => {
    return MDC_LECTURERS_DIRECTORY.filter((item) => {
      // Search
      const term = tableSearch.toLowerCase().trim();
      const matchSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.province.toLowerCase().includes(term) ||
        item.district.toLowerCase().includes(term) ||
        item.subDistrict.toLowerCase().includes(term) ||
        item.username.toLowerCase().includes(term);

      // Level
      const matchLevel =
        selectedLevelFilter === 'all' ||
        (selectedLevelFilter === 'coach' && item.levelShort === 'Coach') ||
        (selectedLevelFilter === 'newcomer' && item.levelShort === 'New Comer');

      // Region
      const matchRegion =
        selectedRegionFilter === 'all' || item.region === selectedRegionFilter;

      // Track / Course
      const matchTrack =
        selectedTrackFilter === 'all' ||
        (selectedTrackFilter === 'pacc' && (item.trackType === 'PACC' || item.course.includes('ปปช'))) ||
        (selectedTrackFilter === 'general' && item.trackType !== 'PACC');

      // Year
      const matchYear =
        selectedYearFilter === 'all' || String(item.year) === selectedYearFilter;

      return matchSearch && matchLevel && matchRegion && matchTrack && matchYear;
    });
  }, [
    tableSearch,
    selectedLevelFilter,
    selectedRegionFilter,
    selectedTrackFilter,
    selectedYearFilter
  ]);

  // Paginated Rows
  const totalPages = useMemo(() => {
    if (activeDatasetTab === 'directory') return Math.ceil(filteredLecturers.length / pageSize) || 1;
    if (activeDatasetTab === 'provincial') return Math.ceil(filteredProvincial.length / pageSize) || 1;
    return 1;
  }, [activeDatasetTab, filteredLecturers.length, filteredProvincial.length, pageSize]);

  const paginatedLecturers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLecturers.slice(start, start + pageSize);
  }, [filteredLecturers, currentPage, pageSize]);

  const paginatedProvincial = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProvincial.slice(start, start + pageSize);
  }, [filteredProvincial, currentPage, pageSize]);

  // Mask Name Helper (PDPA)
  const formatName = (fullName: string) => {
    if (showRealNames) return fullName;
    const parts = fullName.trim().split(' ');
    if (parts.length < 2) return fullName;
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    const maskedLast = lastName.length > 2 ? `${lastName.slice(0, 2)}***` : `${lastName}***`;
    return `${firstName} ${maskedLast}`;
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filePrefix = 'MoralTeacher';

    if (activeDatasetTab === 'directory') {
      filePrefix = 'MoralTeacher_Directory_5346';
      headers = [
        'รหัสวิทยากร',
        'ชื่อ-นามสกุล',
        'จังหวัด',
        'อำเภอ',
        'ตำบล',
        'ภูมิภาค',
        'ระดับสมรรถนะ',
        'หลักสูตรที่ผ่านการอบรม',
        'ปีที่อบรม(พ.ศ.)',
        'มิติความเชี่ยวชาญ',
        'สถานะการปฏิบัติงาน'
      ];
      rows = filteredLecturers.map((r) => [
        `"${r.username}"`,
        `"${r.name}"`,
        `"${r.province}"`,
        `"${r.district}"`,
        `"${r.subDistrict}"`,
        `"${r.region}"`,
        `"${r.level}"`,
        `"${r.course.replace(/"/g, '""')}"`,
        r.year,
        `"${r.competency || '-'}"`,
        `"${r.status || 'พร้อมปฏิบัติงาน'}"`
      ]);
    } else if (activeDatasetTab === 'provincial') {
      filePrefix = 'MoralTeacher_Provincial_77';
      headers = [
        'จังหวัด',
        'ภูมิภาค',
        'จำนวนรวม(คน)',
        'ระดับCoach(คน)',
        'ระดับNewComer(คน)',
        'พอเพียง(คน)',
        'วินัยรับผิดชอบ(คน)',
        'จิตอาสา(คน)',
        'สุจริต(คน)',
        'กตัญญู(คน)',
        'เครือข่ายปปช(คน)'
      ];
      rows = filteredProvincial.map((p) => [
        `"${p.province}"`,
        `"${p.region}"`,
        p.total,
        p.coach,
        p.newComer,
        p.sufficiency,
        p.discipline,
        p.volunteering,
        p.integrity,
        p.gratitude,
        p.paccNetwork
      ]);
    } else if (activeDatasetTab === 'regional') {
      filePrefix = 'MoralTeacher_Strategic_6_Regions';
      headers = ['ภูมิภาคยุทธศาสตร์', 'สัดส่วน(%)', 'จำนวนวิทยากร(คน)', 'ความครอบคลุมจังหวัด', 'ระดับความพร้อม'];
      rows = MDC_STRATEGIC_6_REGIONS_TABLE.map((r) => [
        `"${r.region}"`,
        r.sharePct,
        r.dbCount,
        `"${r.coverage}"`,
        `"${r.readiness}"`
      ]);
    } else if (activeDatasetTab === 'competencies') {
      filePrefix = 'MoralTeacher_Competencies_and_Sectors';
      headers = ['ประเภท', 'ชื่อมิติ/ภาคส่วน', 'สัดส่วน(%)', 'จำนวน(คน)', 'บทบาท/รายละเอียด'];
      rows = [
        ...MDC_MORAL_COMPETENCIES.map((c) => ['"5 มิติคุณธรรม"', `"${c.name}"`, c.pct, c.count, `"${c.note}"`]),
        ...MDC_INSTITUTIONAL_SECTORS.map((s) => ['"5 ภาคส่วนสถาบัน"', `"${s.name}"`, s.pct, s.count, `"${s.role}"`])
      ];
    } else if (activeDatasetTab === 'annual_trend') {
      filePrefix = 'MoralTeacher_Annual_Trend_2562_2568';
      headers = ['ปี พ.ศ.', 'จำนวนรวมสะสม(คน)', 'New Comer(คน)', 'Coach(คน)', 'ภาคกลาง', 'ภาคอีสาน', 'ภาคเหนือ', 'ภาคใต้'];
      rows = MDC_LECTURERS_YEAR_TREND.map((y) => [
        y.year,
        y.total,
        y.newComer,
        y.coach,
        y.central,
        y.northeast,
        y.north,
        y.south
      ]);
    } else if (activeDatasetTab === 'whitespace') {
      filePrefix = 'MoralTeacher_WhiteSpace_Deficit_15';
      headers = ['ลำดับ', 'จังหวัด', 'ภูมิภาค', 'จำนวนวิทยากร(คน)', 'สถานะความขาดแคลน'];
      rows = MDC_WHITE_SPACE_PROVINCES.map((w, idx) => [
        idx + 1,
        `"${w.province}"`,
        `"${w.region}"`,
        w.count,
        `"${w.status}"`
      ]);
    }

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${filePrefix}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        paddingBottom: '32px'
      }}
    >
      {/* Top Search Bar Row (เข้าสู่ระบบ, ภาษา, PDF, และเมนูย่อย 4 เสาหลัก) */}
      <MdcTopSearchBar
        activePillar="policy-moral-lecturers"
        onNavigatePillar={onNavigatePage}
        onExportPdf={() =>
          exportDashboardToPdf({
            sectorTitle: 'ระดับนโยบาย',
            viewTitle: selectedDimension
              ? `วิทยากรคุณธรรม - ${MORAL_TEACHER_SYNERGY_TOPICS[selectedDimension]?.fullName || selectedDimension}`
              : 'ฐานข้อมูลวิทยากรคุณธรรม 77 จังหวัด',
            viewSubtitle: 'ข้อมูลกำลังคนด้านคุณธรรม 5,346 คน ร่วมกับ Data Synergy 77 จังหวัด'
          })
        }
      />

      {/* 2. TOP SUBMENU BAR (6 ARCH CARDS) พร้อม Label ด้านบน */}
      <MdcTopSubmenuBar
        title="มิติการวิเคราะห์ข้อมูลวิทยากรคุณธรรม"
        items={submenuItems}
      />

      {/* 3. CONDITIONAL RENDERING: OVERVIEW VS SYNERGY DIMENSION TOPIC */}
      <div style={{ padding: '20px 24px 0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {selectedDimension !== null ? (
        <MoralTeacherSynergyTopicView
          topicKey={selectedDimension}
          onSelectTopic={(key) => setSelectedDimension(key)}
          onBackToOverview={() => setSelectedDimension(null)}
        />
      ) : (
        /* ==================================================================== */
        /* MODE: ภาพรวม (OVERVIEW)                                              */
        /* ==================================================================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {/* A. KPI Overview Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}
          >
            {/* Card 1: Total Lecturers */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '4px solid #1e3a8a'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>วิทยากรคุณธรรมทั้งหมด</span>
                <Users size={22} color="#1e3a8a" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: '8px 0 4px 0' }}>
                {MDC_LECTURERS_SUMMARY.totalLecturers.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>คน</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#059669', fontWeight: 700 }}>
                ครอบคลุม 77 จังหวัด • 4 ภูมิภาค (รวม White Space)
              </div>
            </div>

            {/* Card 2: Coach Count */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '4px solid #2563eb'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>พี่เลี้ยงคุณธรรม (Coach)</span>
                <Award size={22} color="#2563eb" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#2563eb', margin: '8px 0 4px 0' }}>
                {MDC_LECTURERS_SUMMARY.coachCount.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>คน (11.1%)</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: 700 }}>
                แกนนำสร้างตัวคูณทางสังคม
              </div>
            </div>

            {/* Card 3: New Comer Count */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '4px solid #0284c7'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>ขั้นต้น (New Comer)</span>
                <GraduationCap size={22} color="#0284c7" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#0284c7', margin: '8px 0 4px 0' }}>
                {MDC_LECTURERS_SUMMARY.newComerCount.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>คน (88.9%)</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                กำลังคนฐานรากในสถานศึกษา/อปท.
              </div>
            </div>

            {/* Card 4: PACC Anti-corruption Network */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '4px solid #dc2626'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>เครือข่าย ป.ป.ช. / ต้านโกง</span>
                <ShieldCheck size={22} color="#dc2626" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#dc2626', margin: '8px 0 4px 0' }}>
                {MDC_LECTURERS_SUMMARY.paccTrackCount.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>คน (39.2%)</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#dc2626', fontWeight: 700 }}>
                เครือข่ายเฝ้าระวังธรรมาภิบาล
              </div>
            </div>

            {/* Card 5: Projected Reach */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '4px solid #059669'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>ประชากรเป้าหมายเข้าถึง</span>
                <Target size={22} color="#059669" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#059669', margin: '8px 0 4px 0' }}>
                ~1.60 <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>ล้านคน</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#059669', fontWeight: 700 }}>
                ตัวคูณเฉลี่ย 300 คน/วิทยากร
              </div>
            </div>

            {/* Card 6: 5 Dimensions */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '4px solid #7c3aed'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>มิติคุณธรรมครอบคลุม</span>
                <Sparkles size={22} color="#7c3aed" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#7c3aed', margin: '8px 0 4px 0' }}>
                5 <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>มิติหลัก</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                พอเพียง • วินัย • สุจริต • จิตอาสา • กตัญญู
              </div>
            </div>
          </div>

          {/* B. THAILAND REGIONAL MAP & SPATIAL PRESENTATION CARD */}
          <MoralTeacherRegionalMapCard />

          {/* C. Overview Multi-format Visualizations Grid (3 กราฟในแบบต่างๆ) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
              gap: '20px'
            }}
          >
            {/* กราฟที่ 1: Donut Chart สัดส่วนระดับวิทยากร */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '22px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a', marginBottom: '2px' }}>
                  CHART 1: สัดส่วนระดับสมรรถนะวิทยากร (COMPETENCY TIERS)
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
                  สัดส่วนระดับวิทยากร Coach (พี่เลี้ยง) vs New Comer (ขั้นต้น)
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  วิทยากรระดับ Coach มี 596 คน (11.1%) ทำหน้าที่บ่มเพาะวิทยากรขั้นต้น 4,750 คน (88.9%)
                </p>
              </div>

              <div style={{ width: '100%', height: 280, marginTop: '12px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={levelRatioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${(name || '').includes('Coach') ? 'Coach' : 'New Comer'} ${((percent || 0) * 100).toFixed(1)}%`
                      }
                    >
                      {levelRatioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        <span style={{ color: '#facc15', fontWeight: 800, fontSize: '13.5px' }}>
                          {Number(val).toLocaleString()} คน
                        </span>,
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>จำนวนวิทยากร</span>
                      ]}
                      itemStyle={{ color: '#facc15', fontWeight: 700 }}
                      labelStyle={{ color: '#fef08a', fontWeight: 800, marginBottom: '4px' }}
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.96)',
                        border: '1.5px solid rgba(250, 204, 21, 0.45)',
                        borderRadius: '10px',
                        color: '#facc15',
                        fontSize: '12.5px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                        padding: '10px 14px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12.5px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* กราฟที่ 2: Bar Chart Leaderboard 10 อันดับจังหวัดสูงสุด */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '22px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#059669', marginBottom: '2px' }}>
                  CHART 2: 10 อันดับจังหวัดที่มีวิทยากรหนาแน่นสูงสุด (CHAMPION HUBS)
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
                  การกระจายตัวของวิทยากรรายจังหวัด (จำแนกตามระดับ Coach & New Comer)
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  อยุธยา, อุดรธานี, สุราษฎร์ธานี, เชียงราย และแพร่ เป็น 5 จังหวัดศูนย์กลางที่มีวิทยากรหนาแน่นสูงสุด
                </p>
              </div>

              <div style={{ width: '100%', height: 280, marginTop: '12px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={top10ProvincesData}
                    margin={{ top: 5, right: 30, left: 25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} />
                    <YAxis dataKey="province" type="category" tick={{ fill: '#0f172a', fontSize: 11.5, fontWeight: 700 }} />
                    <Tooltip
                      formatter={(val: any, name?: any) => [
                        <span style={{ color: '#facc15', fontWeight: 800, fontSize: '13.5px' }}>
                          {Number(val).toLocaleString()} คน
                        </span>,
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                          {name === 'coach' ? 'ระดับ Coach' : name === 'newComer' ? 'ระดับ New Comer' : 'จำนวนรวม'}
                        </span>
                      ]}
                      itemStyle={{ color: '#facc15', fontWeight: 700 }}
                      labelStyle={{ color: '#fef08a', fontWeight: 800, marginBottom: '4px' }}
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.96)',
                        border: '1.5px solid rgba(250, 204, 21, 0.45)',
                        borderRadius: '10px',
                        color: '#facc15',
                        fontSize: '12.5px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                        padding: '10px 14px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="coach" name="Coach (พี่เลี้ยง)" stackId="a" fill="#1e3a8a" />
                    <Bar dataKey="newComer" name="New Comer (ขั้นต้น)" stackId="a" fill="#0284c7" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* กราฟที่ 3: Composed Area & Line Chart วิวัฒนาการสะสมรายปี */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '22px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#d97706', marginBottom: '2px' }}>
                  CHART 3: วิวัฒนาการการอบรมสะสมตามปี พ.ศ. (ANNUAL PROGRESSION)
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
                  แนวโน้มจำนวนผู้ผ่านการอบรมวิทยากรรายปี พ.ศ. 2562 - 2568
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  ปี 2568 มีการอบรมแบบก้าวกระโดด 1,835 คน รองลงมาคือปี 2567 (1,056 คน)
                </p>
              </div>

              <div style={{ width: '100%', height: 280, marginTop: '12px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={MDC_LECTURERS_YEAR_TREND}
                    margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 11.5, fontWeight: 600 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any, name?: any) => [
                        <span style={{ color: '#facc15', fontWeight: 800, fontSize: '13.5px' }}>
                          {Number(val).toLocaleString()} คน
                        </span>,
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                          {name === 'total' ? 'จำนวนรวม' : name === 'coach' ? 'ระดับ Coach' : 'ระดับ New Comer'}
                        </span>
                      ]}
                      itemStyle={{ color: '#facc15', fontWeight: 700 }}
                      labelStyle={{ color: '#fef08a', fontWeight: 800, marginBottom: '4px' }}
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.96)',
                        border: '1.5px solid rgba(250, 204, 21, 0.45)',
                        borderRadius: '10px',
                        color: '#facc15',
                        fontSize: '12.5px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                        padding: '10px 14px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="total" name="จำนวนรวม (คน)" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
                    <Line type="monotone" dataKey="coach" name="Coach (คน)" stroke="#1e3a8a" strokeWidth={2.5} dot={{ r: 4, fill: '#1e3a8a' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

                    {/* C. MORAL TEACHER DATASET TABLE (วางไว้ด้านล่างสุดตามที่ผู้ใช้ร้องขอ) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >

            {/* Table Header & Controls Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', fontSize: '13px', fontWeight: 800, marginBottom: '2px' }}>
                  <FileText size={16} />
                  <span>
                    {activeDatasetTab === 'directory' && 'ฐานข้อมูลทำเนียบวิทยากรคุณธรรม (Moral Teacher Directory - mdc_people)'}
                    {activeDatasetTab === 'provincial' && 'ฐานข้อมูลสถิติวิทยากรรายจังหวัด (Provincial Statistics Map - 77 Provinces)'}
                    {activeDatasetTab === 'regional' && 'ฐานข้อมูล 6 ภูมิภาคยุทธศาสตร์และระดับความพร้อม (Strategic 6 Regions Readiness)'}
                    {activeDatasetTab === 'competencies' && 'ฐานข้อมูล 5 มิติคุณธรรมและ 5 ภาคส่วนสถาบัน (Moral Competencies & Institutional Sectors)'}
                    {activeDatasetTab === 'annual_trend' && 'ฐานข้อมูลแนวโน้มการพัฒนาสะสมรายปี พ.ศ. 2562–2568 (Annual Progression Trend)'}
                    {activeDatasetTab === 'whitespace' && 'ตารางเฝ้าระวังพื้นที่ช่องว่างและพื้นที่ขาดแคลนวิทยากร (White Space & Deficit Watchlist)'}
                  </span>
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {activeDatasetTab === 'directory' && 'ตารางฐานข้อมูลทำเนียบวิทยากรคุณธรรมศูนย์คุณธรรม (mdc_people)'}
                  {activeDatasetTab === 'provincial' && 'ตารางสถิติจำนวนวิทยากรและสัดส่วนความเชี่ยวชาญรายจังหวัด (77 จังหวัด)'}
                  {activeDatasetTab === 'regional' && 'ตารางสัดส่วนวิทยากรและศักยภาพเครือข่ายจำแนกตาม 6 ภูมิภาคยุทธศาสตร์'}
                  {activeDatasetTab === 'competencies' && 'ตารางสัดส่วนความเชี่ยวชาญ 5 มิติคุณธรรม และการกระจายตัว 5 ภาคส่วนสถาบัน'}
                  {activeDatasetTab === 'annual_trend' && 'ตารางสถิติแนวโน้มการผลิตและพัฒนาวิทยากรสะสมรายปี พ.ศ. 2562–2568 (7 ปี)'}
                  {activeDatasetTab === 'whitespace' && 'ตาราง 15 จังหวัดที่มีวิทยากรน้อย/ยังไม่มีวิทยากร (เป้าหมายขยายผลเร่งด่วน)'}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                  {activeDatasetTab === 'directory' && 'ข้อมูลจริง 5,346 รายการ ครอบคลุม 76 จังหวัด • รองรับการค้นหา กรองข้อมูล แบ่งหน้า และดาวน์โหลด CSV'}
                  {activeDatasetTab === 'provincial' && 'ข้อมูลสถิติจำนวนวิทยากร ระดับ Coach และสัดส่วน 5 มิติคุณธรรม ครอบคลุม 77 จังหวัดทั่วประเทศ'}
                  {activeDatasetTab === 'regional' && 'การวิเคราะห์การกระจายตัว สัดส่วนร้อยละ และระดับความพร้อม (Readiness) ของ 6 ภูมิภาคยุทธศาสตร์'}
                  {activeDatasetTab === 'competencies' && 'การจัดสรรตาม 5 มิติคุณธรรมหลัก (พอเพียง, วินัย, จิตอาสา, สุจริต, กตัญญู) และ 5 ภาคส่วนสถาบัน'}
                  {activeDatasetTab === 'annual_trend' && 'แนวโน้มการเติบโตของกำลังคนคุณธรรมตั้งแต่เริ่มโครงการปี 2562 ถึงปัจจุบัน (2568) แยกตามภูมิภาค'}
                  {activeDatasetTab === 'whitespace' && 'พื้นที่สีขาวและพื้นที่เปราะบางที่ต้องการการสนับสนุนวิทยากรพี่เลี้ยงคู่แฝด (Twinning Model) เร่งด่วน'}
                </p>
              </div>

              {/* Action Buttons: PDPA Toggle & Export CSV */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* PDPA Privacy Toggle (เฉพาะตารางทำเนียบรายบุคคล) */}
                {activeDatasetTab === 'directory' && (
                  <button
                    type="button"
                    onClick={() => setShowRealNames((prev) => !prev)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: showRealNames ? '#f8fafc' : '#eff6ff',
                      color: showRealNames ? '#475569' : '#1d4ed8',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title="สลับโหมดพรางนามสกุลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)"
                  >
                    {showRealNames ? <Eye size={16} /> : <EyeOff size={16} />}
                    <span>{showRealNames ? 'โหมด PDPA (เปิด)' : 'โหมด PDPA (พรางนามสกุล)'}</span>
                  </button>
                )}

                {/* Export CSV */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={16} />
                  <span>ส่งออก CSV</span>
                </button>
              </div>
            </div>

            {/* DATASET SELECTION PILL BUTTONS (ปุ่มสลับเลือกดูชุดข้อมูลแต่ละตาราง) */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                alignItems: 'center',
                padding: '6px 0 10px 0',
                borderBottom: '1.5px solid #f1f5f9'
              }}
            >
              {[
                { id: 'provincial', name: '1. สถิติรายจังหวัด', count: '77 จังหวัด', icon: <MapPin size={16} /> },
                { id: 'directory', name: '2. ทำเนียบรายบุคคล', count: '338 ตัวอย่าง (จาก 5,346 คน)', icon: <Users size={16} /> },
                { id: 'regional', name: '3. 6 ภูมิภาคยุทธศาสตร์', count: '6 ภาค', icon: <Compass size={16} /> },
                { id: 'competencies', name: '4. 5 มิติคุณธรรม & 5 ภาคส่วน', count: '10 มิติ', icon: <Sparkles size={16} /> },
                { id: 'annual_trend', name: '5. พัฒนาการสะสมรายปี', count: '2562–2568', icon: <Calendar size={16} /> },
                { id: 'whitespace', name: '6. พื้นที่ขาดแคลน (White Space)', count: '15 จังหวัด', icon: <AlertTriangle size={16} /> }
              ].map((btn) => {
                const isActive = activeDatasetTab === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => {
                      setActiveDatasetTab(btn.id as LecturerDatasetTab);
                      setCurrentPage(1);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '24px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      border: isActive ? '1.5px solid #1e3a8a' : '1.5px solid #cbd5e1',
                      background: isActive ? '#1e3a8a' : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      boxShadow: isActive ? '0 3px 10px rgba(30, 58, 138, 0.25)' : 'none'
                    }}
                  >
                    <span>{btn.icon}</span>
                    <span>{btn.name}</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#64748b'
                      }}
                    >
                      {btn.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter & Search Bar (ปรับตามแต่ละตาราง) */}
            {(activeDatasetTab === 'directory' || activeDatasetTab === 'provincial') && (
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  background: '#f8fafc',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                {/* Search Box */}
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }}
                  />
                  <input
                    type="text"
                    placeholder={
                      activeDatasetTab === 'directory'
                        ? 'ค้นหาชื่อวิทยากร, จังหวัด, อำเภอ, รหัส...'
                        : 'ค้นหาชื่อจังหวัด, ภูมิภาค...'
                    }
                    value={tableSearch}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      background: '#ffffff',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Filter: Level (เฉพาะทำเนียบรายบุคคล) */}
                {activeDatasetTab === 'directory' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>ระดับ:</span>
                    <select
                      value={selectedLevelFilter}
                      onChange={(e) => {
                        setSelectedLevelFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: '#ffffff'
                      }}
                    >
                      <option value="all">ทุกระดับ</option>
                      <option value="coach">พี่เลี้ยงคุณธรรม (Coach)</option>
                      <option value="newcomer">นักส่งเสริมคุณธรรมขั้นต้น</option>
                    </select>
                  </div>
                )}

                {/* Filter: Region (ทั้งรายบุคคลและรายจังหวัด) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>ภูมิภาค:</span>
                  <select
                    value={selectedRegionFilter}
                    onChange={(e) => {
                      setSelectedRegionFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff'
                    }}
                  >
                    <option value="all">ทุกภูมิภาค</option>
                    <option value="ภาคกลาง">ภาคกลาง</option>
                    <option value="ภาคเหนือ">ภาคเหนือ</option>
                    <option value="ภาคตะวันออกเฉียงเหนือ">ภาคตะวันออกเฉียงเหนือ</option>
                    <option value="ภาคใต้">ภาคใต้</option>
                  </select>
                </div>

                {/* Filter: Track & Year (เฉพาะทำเนียบรายบุคคล) */}
                {activeDatasetTab === 'directory' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>หลักสูตร:</span>
                      <select
                        value={selectedTrackFilter}
                        onChange={(e) => {
                          setSelectedTrackFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          background: '#ffffff'
                        }}
                      >
                        <option value="all">ทุกหลักสูตร</option>
                        <option value="pacc">เครือข่าย ป.ป.ช. (ต้านทุจริต)</option>
                        <option value="general">หลักสูตรวิทยากรทั่วไป</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>ปี พ.ศ.:</span>
                      <select
                        value={selectedYearFilter}
                        onChange={(e) => {
                          setSelectedYearFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          background: '#ffffff'
                        }}
                      >
                        <option value="all">ทุกปี</option>
                        <option value="2568">2568</option>
                        <option value="2567">2567</option>
                        <option value="2566">2566</option>
                        <option value="2565">2565</option>
                        <option value="2564">2564</option>
                        <option value="2563">2563</option>
                        <option value="2562">2562</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Results Count & Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
              <div>
                {activeDatasetTab === 'directory' && (
                  <>พบข้อมูลตรงเงื่อนไข <strong>{filteredLecturers.length.toLocaleString()}</strong> รายการ (จากทั้งหมด {MDC_LECTURERS_DIRECTORY.length} รายการในฐานข้อมูลทำเนียบ)</>
                )}
                {activeDatasetTab === 'provincial' && (
                  <>พบข้อมูลตรงเงื่อนไข <strong>{filteredProvincial.length.toLocaleString()}</strong> จังหวัด (จากทั้งหมด 77 จังหวัดทั่วประเทศ)</>
                )}
                {activeDatasetTab === 'regional' && (
                  <>ชุดข้อมูลการแบ่งส่วน 6 ภูมิภาคยุทธศาสตร์ศูนย์คุณธรรม (ครอบคลุมทั้ง 77 จังหวัด)</>
                )}
                {activeDatasetTab === 'competencies' && (
                  <>ชุดข้อมูลสัดส่วน 5 มิติคุณธรรมหลัก และการกระจายตัวตาม 5 ภาคส่วนสถาบันของวิทยากร</>
                )}
                {activeDatasetTab === 'annual_trend' && (
                  <>สถิติแนวโน้มการผลิตและพัฒนาวิทยากรสะสมรายปี พ.ศ. 2562 ถึง 2568 (รวม 7 ปีงบประมาณ)</>
                )}
                {activeDatasetTab === 'whitespace' && (
                  <>15 จังหวัดพื้นที่เป้าหมายเฝ้าระวังที่ยังขาดแคลนวิทยากร (ต้องการวิทยากรพี่เลี้ยงคู่แฝด)</>
                )}
              </div>

              {(activeDatasetTab === 'directory' || activeDatasetTab === 'provincial') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>แสดงหน้าละ:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                      background: '#ffffff'
                    }}
                  >
                    <option value={15}>15 รายการ</option>
                    <option value={25}>25 รายการ</option>
                    <option value={50}>50 รายการ</option>
                    <option value={-1}>ทั้งหมด</option>
                  </select>
                </div>
              )}
            </div>

            {/* Table Container (Dynamic Render per Tab) */}
            <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>

              {/* TAB 1: ทําเนียบวิทยากรรายบุคคล (5,346 คน) */}
              {activeDatasetTab === 'directory' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 14px' }}>รหัสวิทยากร</th>
                      <th style={{ padding: '12px 14px' }}>ชื่อ-นามสกุล</th>
                      <th style={{ padding: '12px 14px' }}>จังหวัด</th>
                      <th style={{ padding: '12px 14px' }}>อำเภอ</th>
                      <th style={{ padding: '12px 14px' }}>ภูมิภาค</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>ระดับสมรรถนะ</th>
                      <th style={{ padding: '12px 14px' }}>หลักสูตร / โครงการ</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>ปีอบรม</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>มิติหลัก</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLecturers.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                          ไม่พบข้อมูลวิทยากรตามเงื่อนไขที่ค้นหา
                        </td>
                      </tr>
                    ) : (
                      paginatedLecturers.map((row, idx) => (
                        <tr
                          key={row.id || idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                          }}
                        >
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12.5px', color: '#64748b' }}>
                            {row.username}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                            {formatName(row.name)}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e3a8a' }}>
                            {row.province}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {row.district}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {row.region}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 700,
                                background: row.levelShort === 'Coach' ? '#eff6ff' : '#f0fdf4',
                                color: row.levelShort === 'Coach' ? '#1d4ed8' : '#166534',
                                border: `1px solid ${row.levelShort === 'Coach' ? '#bfdbfe' : '#bbf7d0'}`
                              }}
                            >
                              {row.levelShort === 'Coach' ? 'Coach' : 'New Comer'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#334155', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.course}>
                            {row.course}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>
                            {row.year}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12.5px', color: '#64748b' }}>
                            {row.competency || 'พอเพียง'}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                background: '#f8fafc',
                                color: '#10b981',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              พร้อมปฏิบัติงาน
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 2: สถิติรายจังหวัด (77 จังหวัด) */}
              {activeDatasetTab === 'provincial' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 14px' }}>จังหวัด</th>
                      <th style={{ padding: '12px 14px' }}>ภูมิภาค</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>รวมทั้งหมด (คน)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Coach (คน)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>New Comer (คน)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', color: '#059669' }}>พอเพียง</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', color: '#2563eb' }}>วินัย</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', color: '#0284c7' }}>จิตอาสา</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', color: '#d97706' }}>สุจริต</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', color: '#7c3aed' }}>กตัญญู</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>เครือข่าย ป.ป.ช.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProvincial.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                          ไม่พบข้อมูลจังหวัดตามเงื่อนไขที่ค้นหา
                        </td>
                      </tr>
                    ) : (
                      paginatedProvincial.map((p, idx) => (
                        <tr
                          key={p.province}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                          }}
                        >
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                            {p.province}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {p.region}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: '#1e3a8a' }}>
                            {p.total.toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                            {p.coach}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', color: '#475569' }}>
                            {p.newComer}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#059669' }}>
                            {p.sufficiency}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#2563eb' }}>
                            {p.discipline}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#0284c7' }}>
                            {p.volunteering}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#d97706' }}>
                            {p.integrity}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#7c3aed' }}>
                            {p.gratitude}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>
                            {p.paccNetwork} คน
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 3: 6 ภูมิภาคยุทธศาสตร์ (6 ภาค) */}
              {activeDatasetTab === 'regional' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '14px 16px' }}>ภูมิภาคยุทธศาสตร์</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center' }}>สัดส่วน (%)</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center' }}>จำนวนวิทยากร (คน)</th>
                      <th style={{ padding: '14px 16px' }}>ความครอบคลุมจังหวัด</th>
                      <th style={{ padding: '14px 16px' }}>ระดับความพร้อมและจุดเด่นเชิงพื้นที่</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MDC_STRATEGIC_6_REGIONS_TABLE.map((row, idx) => (
                      <tr
                        key={row.region}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                        }}
                      >
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                          {row.region}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>
                          {row.sharePct}%
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: '#1e3a8a' }}>
                          {row.dbCount.toLocaleString()} คน
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          {row.coverage}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              background: row.statusBg,
                              color: row.statusColor
                            }}
                          >
                            {row.readiness}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TAB 4: 5 มิติคุณธรรม & 5 ภาคส่วนสถาบัน */}
              {activeDatasetTab === 'competencies' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', padding: '16px' }}>
                  {/* Table A: 5 Moral Competencies */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 14px', fontWeight: 800, color: '#1e3a8a', borderBottom: '1px solid #e2e8f0' }}>
                      🌱 สัดส่วนความเชี่ยวชาญ 5 มิติคุณธรรม (5 Moral Dimensions)
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                      <thead>
                        <tr style={{ background: '#ffffff', borderBottom: '1px solid #cbd5e1', color: '#64748b', fontSize: '12.5px' }}>
                          <th style={{ padding: '10px 12px' }}>มิติคุณธรรม</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>สัดส่วน</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>จำนวน (คน)</th>
                          <th style={{ padding: '10px 12px' }}>บทบาทการขับเคลื่อน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MDC_MORAL_COMPETENCIES.map((c, i) => (
                          <tr key={c.key} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#ffffff' : '#fcfcfd' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: c.color }}>
                              {c.icon} {c.name}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: c.color }}>
                              {c.pct}%
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800 }}>
                              {c.count.toLocaleString()}
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '12.5px', color: '#475569' }}>
                              {c.note}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table B: 5 Institutional Sectors */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 14px', fontWeight: 800, color: '#059669', borderBottom: '1px solid #e2e8f0' }}>
                      🏛️ การกระจายตัวตาม 5 ภาคส่วนสถาบัน (Institutional Sectors)
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                      <thead>
                        <tr style={{ background: '#ffffff', borderBottom: '1px solid #cbd5e1', color: '#64748b', fontSize: '12.5px' }}>
                          <th style={{ padding: '10px 12px' }}>ภาคส่วนสถาบัน</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>สัดส่วน</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>จำนวน (คน)</th>
                          <th style={{ padding: '10px 12px' }}>บทบาทภารกิจหลัก</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MDC_INSTITUTIONAL_SECTORS.map((s, i) => (
                          <tr key={s.shortName} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#ffffff' : '#fcfcfd' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: s.color }}>
                              {s.name}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: s.color }}>
                              {s.pct}%
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800 }}>
                              {s.count.toLocaleString()}
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '12.5px', color: '#475569' }}>
                              {s.role}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: พัฒนาการสะสมรายปี (2562–2568) */}
              {activeDatasetTab === 'annual_trend' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 14px' }}>ปี พ.ศ.</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>จำนวนรวมสะสม (คน)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', color: '#0284c7' }}>New Comer (คน)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', color: '#1e3a8a' }}>Coach (คน)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>ภาคกลาง</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>ภาคอีสาน</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>ภาคเหนือ</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>ภาคใต้</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MDC_LECTURERS_YEAR_TREND.map((row, idx) => (
                      <tr
                        key={row.year}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                        }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                          พ.ศ. {row.year}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: '#1e3a8a' }}>
                          {row.total.toLocaleString()} คน
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#0284c7' }}>
                          {row.newComer.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#1e3a8a' }}>
                          {row.coach.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#475569' }}>
                          {row.central} คน
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#475569' }}>
                          {row.northeast} คน
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#475569' }}>
                          {row.north} คน
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#475569' }}>
                          {row.south} คน
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TAB 6: พื้นที่ขาดแคลน White Space (15 จังหวัด) */}
              {activeDatasetTab === 'whitespace' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>ลำดับ</th>
                      <th style={{ padding: '12px 14px' }}>จังหวัด</th>
                      <th style={{ padding: '12px 14px' }}>ภูมิภาค</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>วิทยากรในระบบ (คน)</th>
                      <th style={{ padding: '12px 14px' }}>สถานะความขาดแคลนและข้อเสนอแนะเชิงนโยบาย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MDC_WHITE_SPACE_PROVINCES.map((w, idx) => (
                      <tr
                        key={w.province}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                        }}
                      >
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                          {w.province}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>
                          {w.region}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '13px',
                              background: w.count === 0 ? '#fef2f2' : '#fff7ed',
                              color: w.count === 0 ? '#dc2626' : '#ea580c',
                              border: `1px solid ${w.count === 0 ? '#fecaca' : '#fed7aa'}`
                            }}
                          >
                            {w.count} คน
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: w.count === 0 ? '#dc2626' : '#d97706' }}>
                          {w.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>

            {/* Pagination Controls (เฉพาะตารางทำเนียบรายบุคคลและสถิติรายจังหวัด) */}
            {(activeDatasetTab === 'directory' || activeDatasetTab === 'provincial') && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  paddingTop: '6px'
                }}
              >
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {activeDatasetTab === 'directory' && (
                    <>หน้าที่ {pageSize === -1 ? filteredLecturers.length : Math.min(filteredLecturers.length, (currentPage - 1) * pageSize + 1)} - {pageSize === -1 ? filteredLecturers.length : Math.min(filteredLecturers.length, currentPage * pageSize)} จากทั้งหมด <strong>{filteredLecturers.length.toLocaleString()}</strong> รายการ</>
                  )}
                  {activeDatasetTab === 'provincial' && (
                    <>หน้าที่ {pageSize === -1 ? filteredProvincial.length : Math.min(filteredProvincial.length, (currentPage - 1) * pageSize + 1)} - {pageSize === -1 ? filteredProvincial.length : Math.min(filteredProvincial.length, currentPage * pageSize)} จากทั้งหมด <strong>{filteredProvincial.length.toLocaleString()}</strong> จังหวัด</>
                  )}
                </div>

                {pageSize !== -1 && totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                        color: currentPage === 1 ? '#94a3b8' : '#334155',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ก่อนหน้า
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 700, padding: '0 8px', color: '#1e3a8a' }}>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                        color: currentPage === totalPages ? '#94a3b8' : '#334155',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ถัดไป
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      {/* Published Synergy Section (ถ้ามีการ Public Synergy มาหน้านี้) */}
      <PublishedPageSynergySection pageId="policy-moral-lecturers" pageTitle="วิทยากรคุณธรรม (Moral Trainers)" />
    </div>
  );
};
