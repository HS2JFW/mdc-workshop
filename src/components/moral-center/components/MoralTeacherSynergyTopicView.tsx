import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  Users,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Building2,
  FileText,
  Search,
  Filter,
  Download,
  Info,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import {
  MORAL_TEACHER_SYNERGY_TOPICS,
  type MoralTeacherSynergyTopicMeta
} from '../data/moralTeacherSynergyTopicsData';
import { MoralTopicSpatialBubbleMatrix } from './MoralTopicSpatialBubbleMatrix';
import { MdcChart1GuideCard, MdcSynergyDecodingGuide } from './MdcSynergyDecodingGuide';
import { MdcGraphDynamicsEvidenceCard } from './MdcGraphDynamicsEvidenceCard';
import { MORAL_TEACHER_GRAPH_DYNAMICS } from '../data/graphDynamicsEvidenceData';
import { MdcTopSynergyMenuBar, type SynergyTopicItem } from './MdcTopSynergyMenuBar';
import { ExternalSynergySourceBanner } from './ExternalSynergySourceBanner';
import { MDC_LECTURERS_DIRECTORY } from '../data/moralLecturersData';
import './MdcTopicSynergyDatasetViewer.css';
import './MoralSynergyDimensionView.css';
import { getSynergyThematicImage, renderThematicHighlightedHeadline } from '../utils/synergyPanoramicImages';
import { Eye, EyeOff, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Sparkles, Database, Compass, BarChart3 } from 'lucide-react';
import { MoralSynergyRegionalMapCard } from './MoralSynergyRegionalMapCard';
import { MdcSynergyBottomDatasetSection } from './MdcSynergyBottomDatasetSection';

export interface MoralTeacherSynergyTopicViewProps {
  topicKey: string;
  onSelectTopic: (key: string) => void;
  onBackToOverview: () => void;
}

export const MoralTeacherSynergyTopicView: React.FC<MoralTeacherSynergyTopicViewProps> = ({
  topicKey,
  onSelectTopic,
  onBackToOverview
}) => {
  const currentTopic: MoralTeacherSynergyTopicMeta =
    MORAL_TEACHER_SYNERGY_TOPICS[topicKey] || MORAL_TEACHER_SYNERGY_TOPICS['integrity'];
  const externalMetricLabel = currentTopic.provincialData[0]?.externalMetricLabel || 'สถิติตัวชี้วัดภายนอก';

  // Toggle for Top Collapsible "เพิ่มเติม" (3 Stat Cards + Decoding Guide)
  const [showEmpiricalEvidence, setShowEmpiricalEvidence] = useState<boolean>(false);

  // Toggle for Chart 1 Guide Card
  const [isChart1GuideExpanded, setIsChart1GuideExpanded] = useState<boolean>(false);
  const [isChart1DatasetExpanded, setIsChart1DatasetExpanded] = useState<boolean>(false);
  type Chart1DatasetTab = 'merged' | 'internal' | 'external';
  const [chart1ActiveTab, setChart1ActiveTab] = useState<Chart1DatasetTab>('merged');

  // Toggle for Master Evidence-Based Budget Reallocation Blueprint ("หลักฐานเชิงประจักษ์")
  const [isBudgetReallocationExpanded, setIsBudgetReallocationExpanded] = useState<boolean>(false);

  // Toggle for Twin Empirical Impact Cards at bottom (Negative vs Positive Impact)
  const [showTwinImpactCards, setShowTwinImpactCards] = useState<boolean>(false);
  // On-demand toggle for Chart 1 & Chart 2 (ยุบเป็นปุ่มกดตามความต้องการ)
  const [showChart1, setShowChart1] = useState<boolean>(false);
  const [showChart2, setShowChart2] = useState<boolean>(false);

  // Reset state when switching dimensions ("ถ้าไม่กดดูให้ซ่อนไว้" + รีเซ็ตหน้าตารางและตัวกรอง)
  useEffect(() => {
    setShowChart1(false);
    setShowChart2(false);
    setShowTwinImpactCards(false);
    setIsBudgetReallocationExpanded(false);
    setIsChart1DatasetExpanded(false);
    setChart1ActiveTab('merged');
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedRegionFilter('all');
    setSelectedRiskFilter('all');
  }, [currentTopic.key]);

  // Table filters & search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');

  // Active dataset tab
  type TeacherDatasetTab = 'internal_provincial' | 'internal_directory' | 'external_agency' | 'merged_synergy';
  const [activeDatasetTab, setActiveDatasetTab] = useState<TeacherDatasetTab>('merged_synergy');

  // PDPA privacy toggle for Directory Table
  const [showRealNames, setShowRealNames] = useState<boolean>(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selected Perspective (มิติคุณธรรม, เชิงพื้นที่ 77 จังหวัด, 5 ภาคส่วนสถาบัน)
  const [selectedPerspective, setSelectedPerspective] = useState<'dimensions' | 'provinces' | 'sectors'>('dimensions');

  const maskName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1][0]}...`;
    }
    return name.slice(0, 3) + '***';
  };

  // Topics for MdcTopSynergyMenuBar
  const topicItems: SynergyTopicItem[] = useMemo(() => {
    return [
      {
        id: 'integrity',
        name: 'วิทยากรสุจริต: วิกฤตขาดแคลนใน อปท. & คดีจัดซื้อ ป.ป.ช.',
        shortLabel: 'วิทยากรสุจริต & อปท.',
        externalAgency: 'ป.ป.ช. & ITA',
        dimensionKey: 'integrity',
        dimensionColor: '#dc2626'
      },
      {
        id: 'sufficiency',
        name: 'วิทยากรพอเพียง: จากชนบทสู่โจทย์เร่งด่วนแก้หนี้เมือง',
        shortLabel: 'วิทยากรพอเพียง & หนี้เมือง',
        externalAgency: 'ธปท. & สศช.',
        dimensionKey: 'sufficiency',
        dimensionColor: '#0891b2'
      },
      {
        id: 'discipline',
        name: 'วิทยากรวินัย: ชะลอตัวในเยาวชน & ลดอุบัติเหตุ',
        shortLabel: 'วิทยากรวินัย & เยาวชน',
        externalAgency: 'สตช. & กสม.',
        dimensionKey: 'discipline',
        dimensionColor: '#059669'
      },
      {
        id: 'gratitude',
        name: 'วิทยากรกตัญญู: สัดส่วนต่ำสุด 10% สวนทางสังคมสูงวัย',
        shortLabel: 'วิทยากรกตัญญู & สังคมสูงวัย',
        externalAgency: 'สธ. & พม.',
        dimensionKey: 'gratitude',
        dimensionColor: '#7c3aed'
      },
      {
        id: 'lifecapital',
        name: 'วิทยากรจิตอาสา: กระจุกตัวสูง & ป้องกันเด็กหลุดระบบ',
        shortLabel: 'วิทยากรจิตอาสา & ทุนชีวิต',
        externalAgency: 'กสศ. & สศช.',
        dimensionKey: 'lifecapital',
        dimensionColor: '#ea580c'
      }
    ];
  }, []);

  // Filtered Provincial Synergy Data
  const filteredProvinces = useMemo(() => {
    return currentTopic.provincialData.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.province.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item.region.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchRegion =
        selectedRegionFilter === 'all' || item.region === selectedRegionFilter;
      const matchRisk =
        selectedRiskFilter === 'all' || item.riskLevel === selectedRiskFilter;
      return matchSearch && matchRegion && matchRisk;
    });
  }, [currentTopic, searchTerm, selectedRegionFilter, selectedRiskFilter]);

  // Filtered Provincial Internal
  const filteredProvincial = useMemo(() => {
    return currentTopic.provincialData.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.province.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item.region.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchRegion =
        selectedRegionFilter === 'all' || item.region === selectedRegionFilter;
      return matchSearch && matchRegion;
    });
  }, [currentTopic, searchTerm, selectedRegionFilter]);

  // Filtered Lecturers Directory (5,346 records)
  const filteredDirectory = useMemo(() => {
    return MDC_LECTURERS_DIRECTORY.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.province.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.course.toLowerCase().includes(q) ||
        item.level.toLowerCase().includes(q);
      const matchRegion =
        selectedRegionFilter === 'all' || item.region === selectedRegionFilter;
      return matchSearch && matchRegion;
    });
  }, [searchTerm, selectedRegionFilter]);

  // Filtered External
  const filteredExternal = useMemo(() => {
    return currentTopic.provincialData.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.province.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item.region.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item.externalMetricLabel.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        String(item.externalMetricValue).toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchRegion =
        selectedRegionFilter === 'all' || item.region === selectedRegionFilter;
      const matchRisk =
        selectedRiskFilter === 'all' || item.riskLevel === selectedRiskFilter;
      return matchSearch && matchRegion && matchRisk;
    });
  }, [currentTopic, searchTerm, selectedRegionFilter, selectedRiskFilter]);

  // Active rows depending on tab
  const activeRows = useMemo(() => {
    switch (activeDatasetTab) {
      case 'internal_provincial': return filteredProvincial;
      case 'internal_directory': return filteredDirectory;
      case 'external_agency': return filteredExternal;
      case 'merged_synergy':
      default: return filteredProvinces;
    }
  }, [activeDatasetTab, filteredProvincial, filteredDirectory, filteredExternal, filteredProvinces]);

  // Smart pagination window for Table Navigator
  const getPageNumbers = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };
  const totalPages = pageSize === -1 ? 1 : Math.ceil(activeRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return activeRows;
    const start = (currentPage - 1) * pageSize;
    return activeRows.slice(start, start + pageSize);
  }, [activeRows, currentPage, pageSize]);

  // Unique regions for filter dropdown
  const uniqueRegions = useMemo(() => {
    const set = new Set<string>();
    currentTopic.provincialData.forEach((p) => set.add(p.region));
    return Array.from(set);
  }, [currentTopic]);

  // Export Chart 1 (8 Regions) CSV (ตามแท็บที่เลือก: บูรณาการ / ภายใน / ภายนอก)
  const handleExportChart1CSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let fileSuffix = 'merged';

    if (chart1ActiveTab === 'internal') {
      fileSuffix = 'internal_8regions';
      headers = [
        'ภูมิภาค',
        'ความหนาแน่นวิทยากร(คนต่อแสนปชช)',
        'คะแนนคุณธรรมเฉลี่ย(เต็ม 6)',
        'สัดส่วนทำดีต่อเนื่อง(%)',
        'สถานะการกระจายตัว',
        'ฐานข้อมูลอ้างอิง'
      ];
      rows = currentTopic.chartData.map((d) => {
        const distStatus =
          d.lecturerDensity >= 5
            ? 'หนาแน่นสูง (Champion Hot Spot)'
            : d.lecturerDensity >= 3
            ? 'สมดุล / ปานกลาง'
            : 'ขาดแคลน (Critical White Space)';
        return [
          `"${d.region}"`,
          String(d.lecturerDensity),
          d.moralScore.toFixed(2),
          `${d.continuousRatioPct}%`,
          `"${distStatus}"`,
          '"ฐานข้อมูลวิทยากรคุณธรรม ศูนย์คุณธรรม (5,346 คน)"'
        ];
      });
    } else if (chart1ActiveTab === 'external') {
      fileSuffix = 'external_8regions';
      headers = [
        'ภูมิภาค',
        `ตัวชี้วัดภายนอก (${externalMetricLabel})`,
        'ค่าดัชนีผลกระทบ/ความเสี่ยง(%)',
        'ระดับความรุนแรงเชิงพื้นที่',
        'หน่วยงานเจ้าของสถิติ'
      ];
      rows = currentTopic.chartData.map((d) => {
        const riskLevel =
          d.externalImpactVal >= 60
            ? 'วิกฤต'
            : d.externalImpactVal >= 40
            ? 'เสี่ยงสูง'
            : d.externalImpactVal >= 25
            ? 'ปานกลาง'
            : 'เฝ้าระวัง / เสี่ยงต่ำ';
        return [
          `"${d.region}"`,
          `"${externalMetricLabel}"`,
          `${d.externalImpactVal}%`,
          `"${riskLevel}"`,
          `"${currentTopic.externalAgency}"`
        ];
      });
    } else {
      fileSuffix = 'merged_8regions';
      headers = [
        'ภูมิภาค',
        '[ข้อมูลภายใน] ความหนาแน่นวิทยากร(คน/แสน)',
        '[ข้อมูลภายใน] คะแนนคุณธรรมเฉลี่ย(เต็ม 6)',
        '[ข้อมูลภายใน] สัดส่วนทำดีต่อเนื่อง(%)',
        `[ข้อมูลภายนอก] ${externalMetricLabel}(%)`,
        'หน่วยงานภายนอก'
      ];
      rows = currentTopic.chartData.map((d) => [
        `"${d.region}"`,
        String(d.lecturerDensity),
        d.moralScore.toFixed(2),
        `${d.continuousRatioPct}%`,
        `${d.externalImpactVal}%`,
        `"${currentTopic.externalAgencyShort}"`
      ]);
    }

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `MoralTeacher_Chart1_${fileSuffix}_${currentTopic.key}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let fileSuffix = 'merged';

    if (activeDatasetTab === 'internal_provincial') {
      fileSuffix = 'internal_provincial';
      headers = ['จังหวัด', 'ภูมิภาค', 'คะแนนคุณธรรม', 'วิทยากรทั้งหมด(คน)', 'ระดับCoach(คน)', 'ความหนาแน่นต่อแสนปชช'];
      rows = filteredProvincial.map((p) => [
        `"${p.province}"`,
        `"${p.region}"`,
        p.moralScore.toFixed(2),
        String(p.totalLecturers),
        String(p.coachCount),
        String(p.densityPer100k)
      ]);
    } else if (activeDatasetTab === 'internal_directory') {
      fileSuffix = 'internal_directory';
      headers = ['รหัส', 'ชื่อ-นามสกุล', 'จังหวัด', 'อำเภอ', 'ภูมิภาค', 'ระดับ', 'หลักสูตรที่อบรม', 'รุ่น', 'ปีที่ขึ้นทะเบียน'];
      rows = filteredDirectory.map((d) => [
        `"${d.id}"`,
        `"${showRealNames ? d.name : maskName(d.name)}"`,
        `"${d.province}"`,
        `"${d.district}"`,
        `"${d.region}"`,
        `"${d.level}"`,
        `"${d.course.replace(/"/g, '""')}"`,
        `"${d.gen}"`,
        String(d.year)
      ]);
    } else if (activeDatasetTab === 'external_agency') {
      fileSuffix = 'external_agency';
      headers = ['จังหวัด', 'ภูมิภาค', 'ตัวชี้วัดภายนอก', 'ค่าสถิติภายนอก', 'ดัชนีความเสี่ยง(%)', 'ระดับความเสี่ยง', 'หน่วยงาน'];
      rows = filteredExternal.map((p) => [
        `"${p.province}"`,
        `"${p.region}"`,
        `"${p.externalMetricLabel}"`,
        `"${p.externalMetricValue}"`,
        `${p.riskIndexPct}%`,
        `"${p.riskLevel}"`,
        `"${currentTopic.externalAgencyShort}"`
      ]);
    } else {
      fileSuffix = 'merged_matrix';
      headers = [
        'จังหวัด', 'ภูมิภาค', 'คะแนนคุณธรรม', 'วิทยากรทั้งหมด(คน)', 'ระดับCoach(คน)',
        'ความหนาแน่นต่อแสนปชช', 'ตัวชี้วัดภายนอก', 'ค่าสถิติภายนอก', 'ดัชนีความเสี่ยง(%)',
        'ระดับความเสี่ยง', 'พิกัดจตุภาค', 'การวิเคราะห์เชิงประจักษ์ / สถานะพื้นที่'
      ];
      rows = filteredProvinces.map((p) => [
        `"${p.province}"`,
        `"${p.region}"`,
        p.moralScore.toFixed(2),
        String(p.totalLecturers),
        String(p.coachCount),
        String(p.densityPer100k),
        `"${p.externalMetricLabel}"`,
        `"${p.externalMetricValue}"`,
        `${p.riskIndexPct}%`,
        `"${p.riskLevel}"`,
        `"${p.quadrant} (${p.quadrantDesc})"`,
        `"${p.recommendedIntervention.replace(/"/g, '""')}"`
      ]);
    }

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `MoralTeacher_${fileSuffix}_${currentTopic.key}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Render Provincial Synergy Dataset Panel (Moved into Chart 2 [ชุดข้อมูล] button)
  const renderProvincialDatasetPanel = () => (
    <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Top Header Row with Export CSV */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: currentTopic.accentColor,
                fontSize: '13px',
                fontWeight: 800,
                marginBottom: '4px'
              }}
            >
              <FileText size={16} />
              <span>ชุดข้อมูลเชิงประจักษ์ & แผนบูรณาการความสัมพันธ์เชิงพื้นที่</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              ตารางข้อมูลที่นำมาใช้ทำ Synergy ในกราฟนี้
            </h3>
          </div>

          {/* Action: Export CSV */}
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
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            <span>ส่งออก CSV ({activeDatasetTab === 'internal_provincial' ? 'สถิติจังหวัด' : activeDatasetTab === 'internal_directory' ? 'ทำเนียบวิทยากร' : activeDatasetTab === 'external_agency' ? 'ข้อมูลภายนอก' : 'ตารางบูรณาการ'})</span>
          </button>
        </div>

        {/* Visual Synergy Formula Equation Box with Clickable Buttons */}
        <div className="topic-synergy-banner" style={{ padding: '0', background: 'transparent' }}>
          <div className="topic-synergy-banner-top" style={{ marginBottom: '10px' }}>
            <div className="topic-synergy-badge" style={{ borderColor: currentTopic.accentColor }}>
              <Sparkles size={20} style={{ color: currentTopic.accentColor }} />
              <span>แยกชุดข้อมูลภายในศูนย์คุณธรรม และ ข้อมูลภายนอก</span>
            </div>

            <div className="topic-synergy-guide-tag">
              <Database size={18} style={{ marginRight: 5 }} />
              <span>คลิกปุ่มตารางเพื่อสลับดูข้อมูลดิบในตาราง</span>
            </div>
          </div>

          <div className="topic-synergy-formula-box">
            {/* Left Box: Internal Moral Center Datasets */}
            <div className="formula-part internal-side">
              <div className="formula-part-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <span className="formula-tag internal">
                    <Users size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                    ชุดข้อมูลศูนย์คุณธรรม (ทางซ้ายมือ)
                  </span>
                  <span className="dual-side-role-tag">Ground Truth</span>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#1e1b4b' }}>
                  ฐานข้อมูลวิทยากรคุณธรรม & การขับเคลื่อนเชิงพื้นที่
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  สถิติจำนวนวิทยากรคุณธรรมรายจังหวัด 77 จังหวัด และฐานข้อมูลทำเนียบวิทยากรคุณธรรม 5,346 คน
                </p>
              </div>
              <div className="formula-pills-row">
                <button
                  type="button"
                  className={`formula-table-btn internal ${activeDatasetTab === 'internal_provincial' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveDatasetTab('internal_provincial');
                    setCurrentPage(1);
                  }}
                  title="คลิกเพื่อดู: ตารางสถิติวิทยากรคุณธรรมรายจังหวัด 77 จังหวัด"
                >
                  <span className="btn-icon"><Users size={19} /></span>
                  <span className="btn-name">สถิติวิทยากรรายจังหวัด</span>
                  <span className="btn-count">77 จังหวัด</span>
                  {activeDatasetTab === 'internal_provincial' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                <button
                  type="button"
                  className={`formula-table-btn internal ${activeDatasetTab === 'internal_directory' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveDatasetTab('internal_directory');
                    setCurrentPage(1);
                  }}
                  title="คลิกเพื่อดู: ตารางทำเนียบวิทยากรคุณธรรม 5,346 คน"
                >
                  <span className="btn-icon"><Award size={19} /></span>
                  <span className="btn-name">ทำเนียบวิทยากรคุณธรรม</span>
                  <span className="btn-count">338 ตัวอย่าง (จาก 5,346 คน)</span>
                  {activeDatasetTab === 'internal_directory' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>

            {/* Operator: Cross */}
            <div className="formula-operator">
              <span className="operator-cross">✕</span>
              <span className="operator-txt">Synergy With</span>
            </div>

            {/* Right Box: External Agency Datasets */}
            <div className="formula-part external-side">
              <div className="formula-part-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <span className="formula-tag external">
                    <Building2 size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                    ชุดข้อมูลหน่วยงานภายนอก (ทางขวามือ)
                  </span>
                  <span className="dual-side-role-tag ext">External Big Data</span>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#042f2e' }}>
                  {currentTopic.externalAgency}: {currentTopic.name}
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  {currentTopic.evidenceHeadline}
                </p>
              </div>
              <div className="formula-pills-row">
                <button
                  type="button"
                  className={`formula-table-btn external ${activeDatasetTab === 'external_agency' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveDatasetTab('external_agency');
                    setCurrentPage(1);
                  }}
                  title={`คลิกเพื่อดู: ตารางข้อมูลสถิติภายนอก ${currentTopic.externalAgency}`}
                >
                  <span className="btn-icon"><Building2 size={19} /></span>
                  <span className="btn-name">สถิติตัวชี้วัดภายนอก</span>
                  <span className="btn-agency-tag">{currentTopic.externalAgencyShort}</span>
                  <span className="btn-count">77 จังหวัด</span>
                  {activeDatasetTab === 'external_agency' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* 3rd Pill / Tab for Merged Synergy Matrix */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
            <button
              type="button"
              className={`formula-table-btn merged ${activeDatasetTab === 'merged_synergy' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveDatasetTab('merged_synergy');
                setCurrentPage(1);
              }}
              title="คลิกเพื่อดู: ตารางบูรณาการความสัมพันธ์เชิงพื้นที่ (วิทยากรคุณธรรม vs สถิติภายนอก + ค่า CRI)"
              style={{ padding: '10px 24px', borderRadius: '30px' }}
            >
              <span className="btn-icon"><Sparkles size={19} /></span>
              <span className="btn-name">ตารางบูรณาการความสัมพันธ์เชิงพื้นที่ (Merged Provincial Synergy Matrix)</span>
              <span className="btn-count">77 จังหวัด</span>
              {activeDatasetTab === 'merged_synergy' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* External Dataset Direct Source & Download Link Banner (Shown when external tab is active) */}
        {activeDatasetTab === 'external_agency' && currentTopic.sourceDownloadInfo && (
          <ExternalSynergySourceBanner
            agencyName={currentTopic.sourceDownloadInfo.agencyName}
            datasetTitle={currentTopic.sourceDownloadInfo.datasetTitle}
            directDownloadUrl={currentTopic.sourceDownloadInfo.directDownloadUrl}
            directDownloadLabel={currentTopic.sourceDownloadInfo.directDownloadLabel}
            officialPortalUrl={currentTopic.sourceDownloadInfo.officialPortalUrl}
            officialPortalLabel={currentTopic.sourceDownloadInfo.officialPortalLabel}
            fileFormats={currentTopic.sourceDownloadInfo.fileFormats}
            datasetCode={currentTopic.sourceDownloadInfo.datasetCode}
            description={currentTopic.sourceDownloadInfo.description}
            accentColor={currentTopic.accentColor}
          />
        )}

        {/* Search & Filter Controls */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
            background: '#f8fafc',
            padding: '12px 16px',
            borderRadius: '10px',
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
                activeDatasetTab === 'internal_directory'
                  ? 'ค้นหาชื่อวิทยากร, สังกัด, จังหวัด...'
                  : 'ค้นหาชื่อจังหวัด หรือภูมิภาค...'
              }
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14.5px',
                background: '#ffffff',
                outline: 'none'
              }}
            />
          </div>

          {/* Region Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569' }}>ภูมิภาค:</span>
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
                fontSize: '14px',
                background: '#ffffff'
              }}
            >
              <option value="all">ทุกภูมิภาค</option>
              {uniqueRegions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Filter (Shown for external and merged) */}
          {(activeDatasetTab === 'external_agency' || activeDatasetTab === 'merged_synergy') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569' }}>ระดับความเสี่ยง:</span>
              <select
                value={selectedRiskFilter}
                onChange={(e) => {
                  setSelectedRiskFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  background: '#ffffff'
                }}
              >
                <option value="all">ทั้งหมด</option>
                <option value="วิกฤต">วิกฤต (CRI &gt; 65%)</option>
                <option value="ความเสี่ยงสูง">ความเสี่ยงสูง</option>
                <option value="ปานกลาง">ปานกลาง</option>
                <option value="เสถียรภาพ">เสถียรภาพ</option>
              </select>
            </div>
          )}

          {/* PDPA Privacy Toggle for Directory Table */}
          {activeDatasetTab === 'internal_directory' && (
            <button
              type="button"
              onClick={() => setShowRealNames((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: showRealNames ? '#f0fdf4' : '#ffffff',
                color: showRealNames ? '#166534' : '#64748b',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="สลับโหมดการแสดงผลชื่อวิทยากรตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)"
            >
              {showRealNames ? <Eye size={15} /> : <EyeOff size={15} />}
              <span>{showRealNames ? 'แสดงชื่อจริง (Admin)' : 'ซ่อนชื่อ (PDPA Mask)'}</span>
            </button>
          )}

          {/* Rows per page selector เหมือนชุดข้อมูลอื่นๆ */}
          <div className="mdc-duckdb-page-size-select" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>แสดง:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="mdc-duckdb-select"
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value={10}>10 แถว</option>
              <option value={25}>25 แถว</option>
              <option value={50}>50 แถว</option>
              <option value={-1}>ทั้งหมด</option>
            </select>
          </div>
        </div>

        {/* Dynamic Data Table Switcher */}
        <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          {/* TAB 1: Internal Provincial Table */}
          {activeDatasetTab === 'internal_provincial' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 14px' }}>จังหวัด</th>
                  <th style={{ padding: '12px 14px' }}>ภูมิภาค</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>คะแนนคุณธรรมเฉลี่ย</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>วิทยากรทั้งหมด (คน)</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>ระดับ Coach (คน)</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>ความหนาแน่นต่อแสนประชากร</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>แหล่งที่มา</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                      ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  (paginatedRows as typeof currentTopic.provincialData).map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                        {row.province}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>
                        {row.region}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: currentTopic.accentColor }}>
                        {row.moralScore.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#1e3a8a' }}>
                        {row.totalLecturers.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#059669' }}>
                        {row.coachCount.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>
                        {row.densityPer100k}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                        ศูนย์คุณธรรม (MDC)
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: Internal Directory Table (5,346 records) */}
          {activeDatasetTab === 'internal_directory' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 14px' }}>รหัสประจำตัว</th>
                  <th style={{ padding: '12px 14px' }}>ชื่อ-นามสกุล</th>
                  <th style={{ padding: '12px 14px' }}>จังหวัด</th>
                  <th style={{ padding: '12px 14px' }}>อำเภอ</th>
                  <th style={{ padding: '12px 14px' }}>ภูมิภาค</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>ระดับวิทยากร</th>
                  <th style={{ padding: '12px 14px' }}>หลักสูตรที่อบรม</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>รุ่น</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>ปี พ.ศ.</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                      ไม่พบข้อมูลวิทยากรที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  (paginatedRows as typeof MDC_LECTURERS_DIRECTORY).map((row, idx) => (
                    <tr
                      key={row.id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                      }}
                    >
                      <td style={{ padding: '11px 14px', fontFamily: 'monospace', color: '#64748b', fontSize: '13px' }}>
                        {row.id}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: '#0f172a' }}>
                        {showRealNames ? row.name : maskName(row.name)}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 600 }}>
                        {row.province}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#475569' }}>
                        {row.district}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#64748b' }}>
                        {row.region}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: row.levelShort === 'Coach' ? '#eff6ff' : '#f8fafc',
                            color: row.levelShort === 'Coach' ? '#1d4ed8' : '#475569',
                            border: `1px solid ${row.levelShort === 'Coach' ? '#bfdbfe' : '#e2e8f0'}`
                          }}
                        >
                          {row.levelShort === 'Coach' ? 'วิทยากรหลัก (Coach)' : 'วิทยากรใหม่ (New Comer)'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#334155', maxWidth: '320px' }}>
                        {row.course}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center', color: '#64748b' }}>
                        {row.gen || '-'}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center', color: '#0f172a', fontWeight: 600 }}>
                        {row.year}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: External Agency Table */}
          {activeDatasetTab === 'external_agency' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 14px' }}>จังหวัด</th>
                  <th style={{ padding: '12px 14px' }}>ภูมิภาค</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>ชื่อตัวชี้วัดภายนอก</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>ค่าสถิติตัวชี้วัด ({currentTopic.externalAgencyShort})</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>ดัชนีความเสี่ยงเชิงพื้นที่ (CRI %)</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>ระดับความเสี่ยง</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>หน่วยงานเจ้าของข้อมูล</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                      ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  (paginatedRows as typeof currentTopic.provincialData).map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                        {row.province}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>
                        {row.region}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#334155' }}>
                        {row.externalMetricLabel}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>
                        {row.externalMetricValue}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#b91c1c' }}>
                        {row.riskIndexPct}%
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            background:
                              row.riskLevel === 'วิกฤต'
                                ? '#fef2f2'
                                : row.riskLevel === 'ความเสี่ยงสูง'
                                ? '#fff7ed'
                                : row.riskLevel === 'ปานกลาง'
                                ? '#fefce8'
                                : '#f0fdf4',
                            color:
                              row.riskLevel === 'วิกฤต'
                                ? '#dc2626'
                                : row.riskLevel === 'ความเสี่ยงสูง'
                                ? '#ea580c'
                                : row.riskLevel === 'ปานกลาง'
                                ? '#ca8a04'
                                : '#16a34a',
                            border: `1px solid ${
                              row.riskLevel === 'วิกฤต'
                                ? '#fca5a5'
                                : row.riskLevel === 'ความเสี่ยงสูง'
                                ? '#fdba74'
                                : row.riskLevel === 'ปานกลาง'
                                ? '#fde047'
                                : '#86efac'
                            }`
                          }}
                        >
                          {row.riskLevel}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#0284c7' }}>
                        {currentTopic.externalAgencyShort}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 4: Merged Provincial Synergy Matrix Table */}
          {activeDatasetTab === 'merged_synergy' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 14px' }}>จังหวัด</th>
                  <th style={{ padding: '12px 14px' }}>ภูมิภาค</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>พลวัตวิทยากร</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>วิทยากร (คน)</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>หนาแน่น (คน/แสน)</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>{currentTopic.provincialData[0]?.externalMetricLabel || 'สถิติภายนอก'}</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>ผลกระทบเชิงประจักษ์</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>พิกัด Quadrant</th>
                  <th style={{ padding: '12px 14px' }}>การวิเคราะห์เชิงประจักษ์ / สถานะพื้นที่</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                      ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  (paginatedRows as typeof currentTopic.provincialData).map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                        {row.province}
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
                            background:
                              row.lecturerTrend === 'เพิ่มขึ้น'
                                ? '#f0fdf4'
                                : row.lecturerTrend === 'ขาดแคลน'
                                ? '#fef2f2'
                                : '#f8fafc',
                            color:
                              row.lecturerTrend === 'เพิ่มขึ้น'
                                ? '#16a34a'
                                : row.lecturerTrend === 'ขาดแคลน'
                                ? '#dc2626'
                                : '#475569',
                            border: `1px solid ${
                              row.lecturerTrend === 'เพิ่มขึ้น'
                                ? '#86efac'
                                : row.lecturerTrend === 'ขาดแคลน'
                                ? '#fca5a5'
                                : '#cbd5e1'
                            }`
                          }}
                        >
                          {row.lecturerTrend || (row.totalLecturers >= 100 ? 'เพิ่มขึ้น' : row.totalLecturers <= 10 ? 'ขาดแคลน' : 'คงที่')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>
                        {row.totalLecturers} <span style={{ fontSize: '12px', color: '#64748b' }}>(Coach {row.coachCount})</span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>
                        {row.densityPer100k}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#dc2626' }}>
                        {row.externalMetricValue}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            background:
                              row.riskLevel === 'วิกฤต'
                                ? '#fef2f2'
                                : row.riskLevel === 'ความเสี่ยงสูง'
                                ? '#fff7ed'
                                : row.riskLevel === 'ปานกลาง'
                                ? '#fefce8'
                                : '#f0fdf4',
                            color:
                              row.riskLevel === 'วิกฤต'
                                ? '#dc2626'
                                : row.riskLevel === 'ความเสี่ยงสูง'
                                ? '#ea580c'
                                : row.riskLevel === 'ปานกลาง'
                                ? '#ca8a04'
                                : '#16a34a',
                            border: `1px solid ${
                              row.riskLevel === 'วิกฤต'
                                ? '#fca5a5'
                                : row.riskLevel === 'ความเสี่ยงสูง'
                                ? '#fdba74'
                                : row.riskLevel === 'ปานกลาง'
                                ? '#fde047'
                                : '#86efac'
                            }`
                          }}
                        >
                          {row.riskIndexPct}% ({row.riskLevel})
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '13px' }}>
                        <span style={{ fontWeight: 700 }}>{row.quadrant}</span>: {row.quadrantDesc}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#334155', maxWidth: '320px' }}>
                        {row.recommendedIntervention}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Navigator เหมือนชุดข้อมูลอื่นๆ */}
        {pageSize !== -1 && activeRows.length > pageSize && (
          <div className="mdc-duckdb-pagination">
            <div className="mdc-duckdb-pagination-info">
              แสดงแถวที่ {(currentPage - 1) * pageSize + 1} ถึง{' '}
              {Math.min(currentPage * pageSize, activeRows.length)} จากทั้งหมด{' '}
              <strong>{activeRows.length.toLocaleString()}</strong> แถว
              {activeDatasetTab === 'internal_directory' && ' (ฐานข้อมูลวิทยากร 5,346 คน)'}
              {activeDatasetTab === 'internal_provincial' && ' (สถิติวิทยากร 77 จังหวัด)'}
              {activeDatasetTab === 'external_agency' && ` (ชุดข้อมูลสถิติ ${currentTopic.externalAgencyShort})`}
              {activeDatasetTab === 'merged_synergy' && ' (ตารางบูรณาการความสัมพันธ์เชิงพื้นที่ 77 จังหวัด)'}
            </div>

            <div className="mdc-duckdb-pagination-controls">
              <button
                type="button"
                className="mdc-duckdb-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="หน้าแรก (First)"
              >
                «
              </button>
              <button
                type="button"
                className="mdc-duckdb-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                title="ก่อนหน้า (Previous)"
              >
                ‹
              </button>

              <span className="mdc-duckdb-page-current">
                หน้า <strong>{currentPage}</strong> / {totalPages}
              </span>

              <button
                type="button"
                className="mdc-duckdb-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                title="ถัดไป (Next)"
              >
                ›
              </button>
              <button
                type="button"
                className="mdc-duckdb-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="หน้าสุดท้าย (Last)"
              >
                »
              </button>
            </div>
          </div>
        )}

        {pageSize === -1 && activeRows.length > 0 && (
          <div className="mdc-duckdb-pagination">
            <div className="mdc-duckdb-pagination-info">
              แสดงข้อมูลทั้งหมด <strong>{activeRows.length.toLocaleString()}</strong> แถวในหน้าเดียว
            </div>
          </div>
        )}
      </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. SECONDARY SYNERGY NAVIGATION BAR (with "กลับหน้าภาพรวม") */}
      <MdcTopSynergyMenuBar
        dimensionTitle="วิทยากรคุณธรรม x Data Synergy 133 รายการ"
        accentColor={currentTopic.accentColor}
        topics={topicItems}
        activeTopicId={currentTopic.key}
        onSelectTopic={(id: string) => onSelectTopic(id)}
        onBackToOverview={onBackToOverview}
      />

      {/* 2. COMPACT HEADLINE BAR: Panoramic Province Long Banner */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', marginBottom: '8px' }}>
        <div
          className="discipline-province-hero-banner"
          style={{
            backgroundImage: `url(${getSynergyThematicImage(currentTopic.key)})`
          }}
          onClick={() => setShowEmpiricalEvidence((prev) => !prev)}
          title={showEmpiricalEvidence ? 'คลิกเพื่อย่อข้อมูล' : 'คลิกเพื่อดูรายละเอียดเพิ่มเติม'}
        >
          {/* Top Row: Translucent Badge on Left, Action Button on Right */}
          <div className="discipline-banner-top-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="discipline-banner-badge">
                <span>🛡️ 133 รายการ</span>
                <span>•</span>
                <span>{currentTopic.externalAgencyShort}</span>
              </span>
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)'
                }}
              >
                วิทยากร: {currentTopic.name}
              </span>
              {currentTopic.impactDetail?.lecturerDynamics?.trendBadge && (
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}
                >
                  {currentTopic.impactDetail.lecturerDynamics.trendBadge}
                </span>
              )}
            </div>

            {/* ปุ่ม "เพิ่มเติม / ย่อข้อมูล" สไตล์ Activity Pill Button */}
            <button
              type="button"
              className="discipline-banner-enter-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmpiricalEvidence((prev) => !prev);
              }}
              title={showEmpiricalEvidence ? 'ย่อข้อมูล' : 'เพิ่มเติม'}
            >
              <span>{showEmpiricalEvidence ? 'ย่อข้อมูล' : 'เพิ่มเติม'}</span>
              {showEmpiricalEvidence ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
            </button>
          </div>

          {/* Headline and Topic on Banner */}
          <div className="discipline-banner-content">
            <h2 className="discipline-banner-title">
              {renderThematicHighlightedHeadline(currentTopic.evidenceHeadline || currentTopic.fullName)}
            </h2>
            <div className="discipline-banner-subtitle">
              📌 {currentTopic.fullName} • {currentTopic.chartSubtitle}
            </div>
          </div>
        </div>

        {/* Collapsible Panel: 3 Stat Cards + Graph Dynamics + Decoding Guide */}
        {showEmpiricalEvidence && (
          <div className="discipline-collapsible-panel">
            {/* 3 EMPIRICAL STAT CARDS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}
            >
              {currentTopic.stats.map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderLeft:
                      idx === 0
                        ? '5px solid #059669'
                        : idx === 1
                        ? '5px solid #dc2626'
                        : '5px solid #2563eb',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: idx === 0 ? '#059669' : idx === 1 ? '#dc2626' : '#2563eb'
                      }}
                    >
                      {idx === 0
                        ? '📊 ข้อมูลวิจัยศูนย์คุณธรรม'
                        : idx === 1
                        ? '⚠️ หลักฐาน Big Data ภายนอก'
                        : '🚀 ผลกระทบ & Synergy Multiplier'}
                    </span>
                    <span
                      style={{
                        fontSize: '12.5px',
                        color: '#64748b',
                        background: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {idx === 0
                        ? 'ศูนย์คุณธรรม'
                        : idx === 1
                        ? currentTopic.externalAgencyShort
                        : 'Policy Action'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '30px',
                      fontWeight: 800,
                      color: idx === 0 ? '#059669' : idx === 1 ? '#dc2626' : '#2563eb',
                      lineHeight: '1.2'
                    }}
                  >
                    {stat.val}
                  </div>
                  <div
                    style={{
                      fontSize: '15.5px',
                      color: '#1e293b',
                      fontWeight: 700,
                      marginTop: '4px'
                    }}
                  >
                    {stat.label}
                  </div>
                  {stat.sub && (
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#64748b',
                        marginTop: '3px'
                      }}
                    >
                      {stat.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* GRAPH DYNAMICS EVIDENCE CARD */}
            {MORAL_TEACHER_GRAPH_DYNAMICS[currentTopic.key] && (
              <MdcGraphDynamicsEvidenceCard
                evidence={MORAL_TEACHER_GRAPH_DYNAMICS[currentTopic.key]}
                accentColor={currentTopic.accentColor}
                topicName={currentTopic.fullName}
              />
            )}

            {/* DECODING GUIDE */}
            <MdcSynergyDecodingGuide
              topicId={currentTopic.key}
              topicName={currentTopic.name}
              dimensionKey={currentTopic.dimensionKey}
              dimensionTitle={currentTopic.dimensionTitle}
              chartTitle={currentTopic.chartTitle}
              chartSubtitle={currentTopic.chartSubtitle}
              evidenceHeadline={currentTopic.evidenceHeadline}
              evidenceDetail={currentTopic.evidenceDetail}
              stats={currentTopic.stats}
              externalAgency={currentTopic.externalAgency}
            />
          </div>
        )}
      </div>

      {/* 2. SPATIAL SYNERGY MAP CARD (แผนที่ความสัมพันธ์เชิงพื้นที่และการผนึกกำลังข้อมูล) */}
      <MoralSynergyRegionalMapCard
        topicId={currentTopic.key}
        topicName={currentTopic.name}
        dimensionKey={currentTopic.dimensionKey}
        dimensionTitle={currentTopic.dimensionTitle}
        accentColor={currentTopic.accentColor}
        chartTitle={currentTopic.chartTitle}
        chartSubtitle={currentTopic.chartSubtitle}
        evidenceHeadline={currentTopic.evidenceHeadline}
        evidenceDetail={currentTopic.evidenceDetail}
        stats={currentTopic.stats}
        externalAgency={currentTopic.externalAgency}
        policyRecommendation={currentTopic.policyRecommendations?.[0]?.reallocationAction || currentTopic.policyRecommendations?.[0]?.title || ''}
        hasSpatialMap={true}
      />

      {/* 3. แถบปุ่มกดเรียกดูข้อมูลวิเคราะห์เพิ่มเติม (On-Demand Action Buttons: กราฟที่ 1 และ 2 ยุบเป็นปุ่มกด) */}
      <div className="synergy-on-demand-actions-card">
        <div className="on-demand-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="on-demand-icon-badge">
              <BarChart3 size={17} color={currentTopic.accentColor} />
            </span>
            <span style={{ fontFamily: 'Kanit, sans-serif', fontSize: '16.5px', fontWeight: 800, color: '#0f172a' }}>
              การแสดงผลวิเคราะห์เชิงลึกเพิ่มเติม (กราฟที่ 1 และ 2)
            </span>
          </div>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            คลิกเพื่อเปิด/ปิดกราฟวิเคราะห์ทวิแกนและเมทริกซ์การกระจายตัวตามความต้องการ
          </span>
        </div>

        <div className="on-demand-buttons-grid">
          <button
            type="button"
            className={`on-demand-action-btn ${showChart1 ? 'is-active' : ''}`}
            onClick={() => setShowChart1((prev) => !prev)}
            title={showChart1 ? 'คลิกเพื่อซ่อนกราฟที่ 1' : 'คลิกเพื่อแสดงกราฟที่ 1'}
          >
            <div className="btn-inner-left">
              <BarChart3 size={19} color={showChart1 ? '#2563eb' : '#64748b'} />
              <div className="btn-text-col">
                <strong className="btn-main-label">กราฟที่ 1: Dual-Axis Synergy Matrix</strong>
                <span className="btn-sub-label">วิเคราะห์ความสัมพันธ์ราย 8 ภูมิภาค (วิทยากรคุณธรรม vs {currentTopic.externalAgencyShort})</span>
              </div>
            </div>
            <div className="btn-inner-right">
              <span className="btn-toggle-badge">{showChart1 ? 'ซ่อนกราฟ' : 'แสดงกราฟ'}</span>
              {showChart1 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          <button
            type="button"
            className={`on-demand-action-btn ${showChart2 ? 'is-active' : ''}`}
            onClick={() => setShowChart2((prev) => !prev)}
            title={showChart2 ? 'คลิกเพื่อซ่อนกราฟที่ 2' : 'คลิกเพื่อแสดงกราฟที่ 2'}
          >
            <div className="btn-inner-left">
              <Compass size={19} color={showChart2 ? '#2563eb' : '#64748b'} />
              <div className="btn-text-col">
                <strong className="btn-main-label">กราฟที่ 2: เมทริกซ์ 4 จตุภาคเชิงพื้นที่</strong>
                <span className="btn-sub-label">Spatial Bubble Matrix จำแนกศักยภาพและความเร่งด่วน 8 ภูมิภาค</span>
              </div>
            </div>
            <div className="btn-inner-right">
              <span className="btn-toggle-badge">{showChart2 ? 'ซ่อนกราฟ' : 'แสดงกราฟ'}</span>
              {showChart2 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>
        </div>
      </div>

      {/* 4. SYNERGY CHART 1: Dual-Axis Matrix & Perspectives (Collapsible On-Demand) */}
      {showChart1 && (
        <div className="collapsible-chart-section">
      {/* 2.1 INTERACTIVE PERSPECTIVE SELECTOR */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '14px',
          padding: '12px 18px',
          border: '1.5px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#334155' }}>
            เลือกมุมมองการวิเคราะห์วิทยากรคุณธรรม:
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'dimensions', label: '🌟 มิติคุณธรรม 5 ด้าน', desc: 'วิทยากรด้านไหนเพิ่ม/ลด & ผลกระทบ' },
            { id: 'provinces', label: '🗺️ เชิงพื้นที่ 77 จังหวัด', desc: 'Hot Spot vs White Space' },
            { id: 'sectors', label: '🏛️ 5 ภาคส่วนสถาบัน', desc: 'การศึกษา vs อปท. vs เอกชน' }
          ].map((tab) => {
            const isSel = selectedPerspective === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedPerspective(tab.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: isSel ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  background: isSel ? '#eff6ff' : '#ffffff',
                  color: isSel ? '#1d4ed8' : '#475569',
                  fontSize: '13.5px',
                  fontWeight: isSel ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSel ? '0 2px 8px rgba(37, 99, 235, 0.15)' : 'none'
                }}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Perspectives Conditional Cards */}
      {selectedPerspective === 'provinces' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1.5px solid #e2e8f0',
            borderLeft: '5px solid #0284c7',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              🗺️ สรุปมุมมองเชิงพื้นที่: 77 จังหวัด (ความเหลื่อมล้ำ Hot Spot vs White Space)
            </span>
          </div>
          <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
            • <strong>Champion Hot Spots (&gt;300 คน):</strong> พระนครศรีอยุธยา (479), อุดรธานี (448), สุราษฎร์ธานี (407), เชียงราย (404), แพร่ (323), ระยอง (300) เป็นศูนย์กลางผลิตผลลัพธ์เชิงบวกและเป็นพี่เลี้ยงเครือข่าย<br />
            • <strong>Critical White Spaces (&lt;10 คน):</strong> นครนายก (0 คน ขาดแคลน 100%), ปัตตานี (2 คน), สระแก้ว (2 คน), จันทบุรี (2 คน), ประจวบคีรีขันธ์ (2 คน), นราธิวาส (3 คน), ตราด (4 คน) เกิดความเสี่ยงสูงเนื่องจากขาดแคลนวิทยากรแกนนำ
          </div>
        </div>
      )}

      {selectedPerspective === 'sectors' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1.5px solid #e2e8f0',
            borderLeft: '5px solid #7c3aed',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              🏛️ สรุปมุมมอง 5 ภาคส่วนสถาบัน: การกระจายตัวและความต้องการเสริมกำลัง
            </span>
          </div>
          <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
            • <strong>1. สถาบันการศึกษา (58%):</strong> มีสัดส่วนสูงสุด เป็นฐานหลักของ New Comer แต่ต้องการการยกระดับสู่ Coach<br />
            • <strong>2. ภาคประชาสังคม/ปราชญ์ชาวบ้าน (24%):</strong> เชี่ยวชาญด้านเกษตรพอเพียงในชนบท แต่มีทักษะการเงินเมืองน้อย<br />
            • <strong>3. หน่วยงานภาครัฐ/อปท. (&lt;8%):</strong> <em>ขาดแคลนวิกฤต</em> สวนทางกับสถิติคดีทุจริตจัดซื้อจัดจ้าง 45.6% ที่เกิดใน อปท.<br />
            • <strong>4. สถาบันศาสนา (6%) & 5. ภาคเอกชน (4%):</strong> ต้องการการเชื่อมโยงขยายผลผ่านโมเดลโรงงานคุณธรรมและ CSR
          </div>
        </div>
      )}

      {/* 3. SYNERGY CHART 1: DUAL-AXIS MATRIX */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: currentTopic.accentColor,
                fontSize: '13.5px',
                fontWeight: 800,
                marginBottom: '4px'
              }}
            >
              <TrendingUp size={16} />
              <span>กราฟที่ 1: DUAL-AXIS SYNERGY MATRIX (8 ภูมิภาค)</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
              {currentTopic.chartTitle}
            </h3>
            <p style={{ fontSize: '14.5px', color: '#64748b', margin: 0 }}>
              {currentTopic.chartSubtitle}
            </p>
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#64748b',
              background: '#f8fafc',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}
          >
            แหล่งข้อมูล: ฐานข้อมูลวิทยากรคุณธรรม (5,346 คน) + {currentTopic.externalAgencyShort}
          </div>
        </div>

        {/* Recharts Dual-Axis Chart */}
        <div style={{ width: '100%', height: 390, marginTop: '8px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={currentTopic.chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="region"
                tick={{ fill: '#475569', fontSize: 12.5, fontWeight: 600 }}
                stroke="#cbd5e1"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={55}
              />
              {/* Left Y Axis: Lecturer Density / Moral Score */}
              <YAxis
                yAxisId="left"
                domain={[0, 8]}
                stroke={currentTopic.accentColor}
                tick={{ fill: currentTopic.accentColor, fontSize: 12, fontWeight: 700 }}
                label={{
                  value: 'ความหนาแน่นวิทยากร (คน/แสน ปชช.)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: currentTopic.accentColor,
                  fontSize: 12.5,
                  fontWeight: 700
                }}
              />
              {/* Right Y Axis: External Risk / Impact Index */}
              <YAxis
                yAxisId="right"
                domain={[0, 100]}
                orientation="right"
                stroke="#dc2626"
                tick={{ fill: '#dc2626', fontSize: 12, fontWeight: 700 }}
                label={{
                  value: 'ดัชนีความเสี่ยงภายนอก (%)',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#dc2626',
                  fontSize: 12.5,
                  fontWeight: 700
                }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.96)',
                  border: '1.5px solid rgba(250, 204, 21, 0.45)',
                  borderRadius: '10px',
                  color: '#facc15',
                  fontSize: '13.5px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
                  padding: '10px 14px'
                }}
                itemStyle={{ color: '#facc15', fontWeight: 700 }}
                labelStyle={{ color: '#fef08a', fontWeight: 800, marginBottom: '4px' }}
                formatter={(val: any, name?: any) => {
                  const n = String(name || '');
                  let labelName = 'ดัชนีความเสี่ยงภายนอก';
                  let unit = '%';
                  if (n.includes('วิทยากร')) { labelName = 'ความหนาแน่นวิทยากรคุณธรรม'; unit = ' คน/แสน'; }
                  else if (n.includes('คะแนนคุณธรรม')) { labelName = 'คะแนนคุณธรรมเฉลี่ย'; unit = ' / 6.00'; }
                  else if (n.includes('ต่อเนื่อง')) { labelName = 'สัดส่วนทำความดีต่อเนื่อง'; unit = '%'; }
                  return [
                    <span style={{ color: '#facc15', fontWeight: 800 }}>{val}{unit}</span>,
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{labelName}</span>
                  ];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '13.5px' }} />
              {/* Bar: Lecturer Density */}
              <Bar
                yAxisId="left"
                dataKey="lecturerDensity"
                name="ความหนาแน่นวิทยากรคุณธรรม (คน/แสน)"
                fill={currentTopic.accentColor}
                radius={[6, 6, 0, 0]}
                barSize={28}
              />
              {/* Line 1: Moral Score */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="moralScore"
                name="คะแนนคุณธรรมเฉลี่ย (เต็ม 6)"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563eb' }}
              />
              {/* Line 2: External Risk / Impact */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="externalImpactVal"
                name="ดัชนีความเสี่ยงภายนอก (%)"
                stroke="#dc2626"
                strokeWidth={3}
                strokeDasharray="4 4"
                dot={{ r: 5, fill: '#dc2626', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Buttons Under Chart 1: วิธีดูกราฟ & หลักฐานเชิงประจักษ์ */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => setIsChart1GuideExpanded((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 28px',
              borderRadius: '30px',
              border: isChart1GuideExpanded ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
              background: isChart1GuideExpanded ? '#eff6ff' : '#ffffff',
              color: isChart1GuideExpanded ? '#1d4ed8' : '#334155',
              fontSize: '15.5px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isChart1GuideExpanded
                ? '0 4px 12px rgba(37, 99, 235, 0.15)'
                : '0 2px 6px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Info size={20} color={isChart1GuideExpanded ? '#2563eb' : '#64748b'} />
            <span>{isChart1GuideExpanded ? 'ซ่อนวิธีดูกราฟที่ 1' : 'วิธีดูกราฟ (Dual-Axis Synergy)'}</span>
            {isChart1GuideExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>



          <button
            type="button"
            onClick={() => {
              setIsBudgetReallocationExpanded((prev) => !prev);
              if (!isBudgetReallocationExpanded) {
                setTimeout(() => {
                  const el = document.getElementById('budget-reallocation-panel');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 28px',
              borderRadius: '30px',
              border: isBudgetReallocationExpanded ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
              background: isBudgetReallocationExpanded ? '#0f172a' : '#ffffff',
              color: isBudgetReallocationExpanded ? '#ffffff' : '#334155',
              fontSize: '15.5px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isBudgetReallocationExpanded
                ? '0 4px 12px rgba(15, 23, 42, 0.2)'
                : '0 2px 6px rgba(0, 0, 0, 0.05)'
            }}
            title="คลิกเพื่อดูหลักฐานเชิงประจักษ์ (การเคลื่อนไหวของกราฟ)"
          >
            <Lightbulb size={20} color={isBudgetReallocationExpanded ? '#fbbf24' : '#d97706'} />
            <span>{isBudgetReallocationExpanded ? 'หลักฐานเชิงประจักษ์ (ซ่อน)' : 'หลักฐานเชิงประจักษ์'}</span>
            {isBudgetReallocationExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Collapsible Panel 1: Guide Card for Chart 1 */}
        {isChart1GuideExpanded && (
          <div style={{ marginTop: '14px', animation: 'fadeIn 0.2s ease' }}>
            <MdcChart1GuideCard
              topicName={currentTopic.fullName}
              chartTitle={currentTopic.chartTitle}
              chartSubtitle={currentTopic.chartSubtitle}
              dynamicsEvidence={MORAL_TEACHER_GRAPH_DYNAMICS[currentTopic.key]}
            />
          </div>
        )}

        {/* Collapsible Panel 1.05: Empirical Evidence (Graph Dynamics) under Chart 1 */}
        {isBudgetReallocationExpanded && MORAL_TEACHER_GRAPH_DYNAMICS[currentTopic.key] && (
          <div style={{ marginTop: '14px', animation: 'fadeIn 0.2s ease' }}>
            <MdcGraphDynamicsEvidenceCard
              evidence={MORAL_TEACHER_GRAPH_DYNAMICS[currentTopic.key]}
              accentColor={currentTopic.accentColor}
              topicName={currentTopic.fullName}
            />
          </div>
        )}
      </div>
      </div>
      )}

        {/* 4. SYNERGY CHART 2: 8-Region Spatial Bubble Matrix (พร้อมปุ่มหลักฐานเชิงประจักษ์) */}
      {showChart2 && (
        <div className="collapsible-chart-section">
      <div style={{ width: '100%' }}>
        <MoralTopicSpatialBubbleMatrix
          hideDatasetButton={true}
          dimensionKey={currentTopic.dimensionKey}
          dimensionTitle={currentTopic.dimensionTitle}
          topicId={currentTopic.key}
          topicName={currentTopic.name}
          accentColor={currentTopic.accentColor}
          chartTitle={`พิกัดวิเคราะห์ความสัมพันธ์ 8 ภูมิภาค: ${currentTopic.name}`}
          chartSubtitle="วิเคราะห์ตำแหน่งเชิงพื้นที่ระหว่างความหนาแน่นวิทยากรคุณธรรม (แกน X) กับความเสี่ยงเชิงพฤติกรรมภายนอก (แกน Y)"
          evidenceHeadline={currentTopic.evidenceHeadline}
          evidenceDetail={currentTopic.evidenceDetail}
          stats={currentTopic.stats}
          externalAgency={currentTopic.externalAgency}
          extraActionButton={
            <button
              type="button"
              className="spatial-matrix-toggle-btn"
              onClick={() => setIsBudgetReallocationExpanded((prev) => !prev)}
              title={
                isBudgetReallocationExpanded
                  ? 'คลิกเพื่อซ่อนหลักฐานเชิงประจักษ์'
                  : 'คลิกเพื่อดูหลักฐานเชิงประจักษ์ (การเคลื่อนไหวของกราฟ)'
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 28px',
                borderRadius: '999px',
                background: isBudgetReallocationExpanded ? '#0f172a' : '#ffffff',
                color: isBudgetReallocationExpanded ? '#ffffff' : '#1e293b',
                border: isBudgetReallocationExpanded ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
                fontFamily: "'Kanit', sans-serif",
                fontSize: '17.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isBudgetReallocationExpanded
                  ? '0 4px 14px rgba(15, 23, 42, 0.25)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Lightbulb size={21} color={isBudgetReallocationExpanded ? '#fbbf24' : '#d97706'} />
              <span>{isBudgetReallocationExpanded ? 'หลักฐานเชิงประจักษ์ (ซ่อน)' : 'หลักฐานเชิงประจักษ์'}</span>
              {isBudgetReallocationExpanded ? <ChevronUp size={21} /> : <ChevronDown size={21} />}
            </button>
          }
          customDatasetPanel={renderProvincialDatasetPanel()}
          extraActionPanel={
            isBudgetReallocationExpanded && MORAL_TEACHER_GRAPH_DYNAMICS[currentTopic.key] ? (
              <div style={{ width: '100%', marginTop: '16px', animation: 'fadeIn 0.25s ease' }}>
                <MdcGraphDynamicsEvidenceCard
                  evidence={MORAL_TEACHER_GRAPH_DYNAMICS[currentTopic.key]}
                  accentColor={currentTopic.accentColor}
                  topicName={currentTopic.fullName}
                />
              </div>
            ) : null
          }
        />
      </div>

      
        </div>
      )}

      {/* 5. BOTTOM ON-DEMAND TOGGLE: TWIN EMPIRICAL IMPACT CARDS (NEGATIVE VS POSITIVE IMPACT) */}
      {currentTopic.impactDetail && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <button
              type="button"
              className="synergy-twin-impact-toggle-btn"
              onClick={() => setShowTwinImpactCards((prev) => !prev)}
              title={
                showTwinImpactCards
                  ? 'คลิกเพื่อซ่อนผลกระทบเชิงประจักษ์'
                  : 'คลิกเพื่อดูผลกระทบเชิงประจักษ์ (NEGATIVE & POSITIVE IMPACT)'
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 34px',
                borderRadius: '999px',
                background: showTwinImpactCards ? '#0f172a' : '#ffffff',
                color: showTwinImpactCards ? '#ffffff' : '#1e293b',
                border: showTwinImpactCards ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
                fontFamily: "'Kanit', sans-serif",
                fontSize: '17px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: showTwinImpactCards
                  ? '0 4px 16px rgba(15, 23, 42, 0.25)'
                  : '0 2px 10px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Sparkles size={20} color={showTwinImpactCards ? '#38bdf8' : currentTopic.accentColor} />
              <span>
                {showTwinImpactCards
                  ? 'ผลกระทบเชิงประจักษ์: เมื่อวิทยากรลดลง vs เมื่อวิทยากรเพิ่มขึ้น (ซ่อน)'
                  : 'ผลกระทบเชิงประจักษ์: เมื่อวิทยากรลดลง vs เมื่อวิทยากรเพิ่มขึ้น (Negative & Positive Impact)'}
              </span>
              {showTwinImpactCards ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {showTwinImpactCards && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '16px',
                animation: 'fadeIn 0.25s ease'
              }}
            >
              {/* Card 1: 🔴 NEGATIVE IMPACT (เมื่อวิทยากรลดลง/ขาดแคลน) */}
              <div
                style={{
                  background: '#fff8f8',
                  borderRadius: '16px',
                  padding: '22px 24px',
                  border: '1.5px solid #fecaca',
                  borderLeft: '6px solid #dc2626',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AlertTriangle size={18} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#dc2626', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      🔴 NEGATIVE IMPACT • เมื่อวิทยากรลดลง/ขาดแคลน
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px' }}>
                    วิกฤตความเสี่ยง
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '34px', fontWeight: 900, color: '#b91c1c', lineHeight: 1 }}>
                    {currentTopic.impactDetail.negativeImpact.metric}
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#7f1d1d' }}>
                    {currentTopic.impactDetail.negativeImpact.metricLabel}
                  </div>
                </div>

                <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  {currentTopic.impactDetail.negativeImpact.description}
                </p>

                <div style={{ paddingTop: '10px', borderTop: '1px dashed #fca5a5' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#991b1b', marginBottom: '6px' }}>
                    พื้นที่เสี่ยงวิกฤต / White Space:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {currentTopic.impactDetail.negativeImpact.riskZones.map((zone, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: '#b91c1c',
                          background: '#ffffff',
                          border: '1px solid #fca5a5',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: 🟢 POSITIVE IMPACT (เมื่อวิทยากรเพิ่มขึ้น/ขยายผลเข้มแข็ง) */}
              <div
                style={{
                  background: '#f6fbf7',
                  borderRadius: '16px',
                  padding: '22px 24px',
                  border: '1.5px solid #bbf7d0',
                  borderLeft: '6px solid #16a34a',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#dcfce7',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ShieldCheck size={18} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      🟢 POSITIVE IMPACT • เมื่อวิทยากรเพิ่มขึ้น/ขยายผลเข้มแข็ง
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                    ความสำเร็จเชิงประจักษ์
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '34px', fontWeight: 900, color: '#15803d', lineHeight: 1 }}>
                    {currentTopic.impactDetail.positiveImpact.metric}
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#14532d' }}>
                    {currentTopic.impactDetail.positiveImpact.metricLabel}
                  </div>
                </div>

                <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  {currentTopic.impactDetail.positiveImpact.description}
                </p>

                <div style={{ paddingTop: '10px', borderTop: '1px dashed #86efac' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                    พื้นที่ต้นแบบ (Champion Hubs):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {currentTopic.impactDetail.positiveImpact.championZones.map((zone, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: '#15803d',
                          background: '#ffffff',
                          border: '1px solid #86efac',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. ปุ่มชุดข้อมูลล่างสุด (แยกออกจากกราฟ) พร้อมตารางเวลาที่เรากดดูชุดข้อมูลต่าง ๆ */}
      <MdcSynergyBottomDatasetSection
        topicId={currentTopic.key}
        topicName={currentTopic.fullName || currentTopic.name}
        dimensionKey={currentTopic.dimensionKey}
        dimensionTitle={currentTopic.dimensionTitle}
        accentColor={currentTopic.accentColor}
        customDatasetTable={renderProvincialDatasetPanel()}
      />
    </div>
  );
};