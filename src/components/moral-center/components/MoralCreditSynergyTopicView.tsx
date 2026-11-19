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
  Legend,
  Cell
} from 'recharts';
import {
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  Users,
  AlertTriangle,
  Building2,
  FileText,
  Search,
  Filter,
  Download,
  Info,
  CheckCircle2,
  Lightbulb,
  Compass,
  BarChart3
} from 'lucide-react';
import { MoralSynergyRegionalMapCard } from './MoralSynergyRegionalMapCard';
import {
  MORAL_CREDIT_SYNERGY_TOPICS,
  type MoralCreditSynergyTopicMeta
} from '../data/moralCreditSynergyTopicsData';
import { MoralTopicSpatialBubbleMatrix } from './MoralTopicSpatialBubbleMatrix';
import { MdcChart1GuideCard } from './MdcSynergyDecodingGuide';
import { MdcGraphDynamicsEvidenceCard } from './MdcGraphDynamicsEvidenceCard';
import { MORAL_CREDIT_GRAPH_DYNAMICS } from '../data/graphDynamicsEvidenceData';
import { ExternalSynergySourceBanner } from './ExternalSynergySourceBanner';
import { MdcSynergyBottomDatasetSection } from './MdcSynergyBottomDatasetSection';
import { MORAL_CREDIT_RAW_ROWS } from '../data/moralCreditData';
import './MdcTopicSynergyDatasetViewer.css';
import './MoralSynergyDimensionView.css';
import { getSynergyThematicImage, renderThematicHighlightedHeadline } from '../utils/synergyPanoramicImages';
import { Eye, EyeOff, Sparkles, Database } from 'lucide-react';

export interface MoralCreditSynergyTopicViewProps {
  topicKey: string;
  onSelectTopic: (key: string) => void;
  onBackToOverview: () => void;
}

export const MoralCreditSynergyTopicView: React.FC<MoralCreditSynergyTopicViewProps> = ({
  topicKey,
  onSelectTopic,
  onBackToOverview
}) => {
  const currentTopic: MoralCreditSynergyTopicMeta =
    MORAL_CREDIT_SYNERGY_TOPICS[topicKey] ||
    (topicKey?.startsWith('gratitude') ? MORAL_CREDIT_SYNERGY_TOPICS['gratitude'] :
     topicKey?.startsWith('public') ? MORAL_CREDIT_SYNERGY_TOPICS['publicConsciousness'] :
     topicKey?.startsWith('honesty') ? MORAL_CREDIT_SYNERGY_TOPICS['honesty'] :
     topicKey?.startsWith('sufficiency') ? MORAL_CREDIT_SYNERGY_TOPICS['sufficiency'] :
     MORAL_CREDIT_SYNERGY_TOPICS['responsibility']);

  // Toggle for Chart 1 and Chart 2 On-Demand Display (Collapsed by default)
  const [showChart1, setShowChart1] = useState<boolean>(false);
  const [showChart2, setShowChart2] = useState<boolean>(false);

  // Toggle for Empirical Evidence Headline & Details Card
  const [showEmpiricalEvidence, setShowEmpiricalEvidence] = useState<boolean>(false);

  // Toggle for Chart 1 Guide Card
  const [isChart1GuideExpanded, setIsChart1GuideExpanded] = useState<boolean>(false);
  const [isChart1DatasetExpanded, setIsChart1DatasetExpanded] = useState<boolean>(false);
  const [isEmpiricalEvidenceExpanded, setIsEmpiricalEvidenceExpanded] = useState<boolean>(false);
  type Chart1DatasetTab = 'merged' | 'internal' | 'external';
  const [chart1ActiveTab, setChart1ActiveTab] = useState<Chart1DatasetTab>('merged');

  // Table filters & search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');

  // Active dataset tab
  type CreditDatasetTab = 'internal_provincial' | 'internal_raw' | 'external_agency' | 'merged_synergy';
  const [activeDatasetTab, setActiveDatasetTab] = useState<CreditDatasetTab>('merged_synergy');

  // PDPA privacy toggle for Raw Transactions Table
  const [showRealNames, setShowRealNames] = useState<boolean>(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  // Reset state when switching dimensions (รีเซ็ตหน้าตารางและตัวกรอง)
  useEffect(() => {
    setShowChart1(false);
    setShowChart2(false);
    setIsChart1DatasetExpanded(false);
    setIsChart1GuideExpanded(false);
    setChart1ActiveTab('merged');
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedRegionFilter('all');
    setSelectedRiskFilter('all');
  }, [currentTopic.key]);

  const maskName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1][0]}...`;
    }
    return name.slice(0, 3) + '***';
  };

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

  // Filtered Raw Transactions (726 records)
  const filteredRawRows = useMemo(() => {
    return MORAL_CREDIT_RAW_ROWS.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.fullName.toLowerCase().includes(q) ||
        item.agency.toLowerCase().includes(q) ||
        item.province.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.deedTitle.toLowerCase().includes(q);
      const matchRegion =
        selectedRegionFilter === 'all' || item.province.includes(selectedRegionFilter);
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
        
        item.externalMetricFormatted.toLowerCase().includes(searchTerm.toLowerCase().trim());
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
      case 'internal_raw': return filteredRawRows;
      case 'external_agency': return filteredExternal;
      case 'merged_synergy':
      default: return filteredProvinces;
    }
  }, [activeDatasetTab, filteredProvincial, filteredRawRows, filteredExternal, filteredProvinces]);

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

  // Export Chart 1 (8 Regions) CSV (ตามแท็บที่เลือก: บูรณาการ / ภายใน / ภายนอก)
  const handleExportChart1CSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let fileSuffix = 'merged';

    if (chart1ActiveTab === 'internal') {
      fileSuffix = 'internal_8regions';
      headers = [
        'ภูมิภาค',
        'คะแนนเฉลี่ย Moral Credit(แต้ม)',
        'สัดส่วนบันทึกทำความดีต่อเนื่อง(%)',
        'ระดับการมีส่วนร่วมเชิงพฤติกรรม',
        'ฐานข้อมูลอ้างอิง'
      ];
      rows = currentTopic.chartData.map((d) => {
        const engStatus =
          d.continuousRatioPct >= 60
            ? 'มีวินัยทำดีต่อเนื่องสูงมาก'
            : d.continuousRatioPct >= 40
            ? 'ระดับปานกลาง'
            : 'ต้องการการส่งเสริมเพิ่ม';
        return [
          `"${d.region}"`,
          String(d.moralCreditScore),
          `${d.continuousRatioPct}%`,
          `"${engStatus}"`,
          '"ฐานข้อมูลสะสมแต้มความดี Moral Credit ศูนย์คุณธรรม"'
        ];
      });
    } else if (chart1ActiveTab === 'external') {
      fileSuffix = 'external_8regions';
      headers = [
        'ภูมิภาค',
        `ตัวชี้วัดภายนอก (${currentTopic.externalMetricName})`,
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
            : 'เฝ้าระวัง / มั่นคง';
        return [
          `"${d.region}"`,
          `"${currentTopic.externalMetricName}"`,
          `${d.externalImpactVal}%`,
          `"${riskLevel}"`,
          `"${currentTopic.externalAgency}"`
        ];
      });
    } else {
      fileSuffix = 'merged_8regions';
      headers = [
        'ภูมิภาค',
        '[ข้อมูลภายใน] คะแนนเฉลี่ย Moral Credit(แต้ม)',
        '[ข้อมูลภายใน] สัดส่วนทำดีต่อเนื่อง(%)',
        `[ข้อมูลภายนอก] ${currentTopic.externalMetricName}(%)`,
        'หน่วยงานภายนอก'
      ];
      rows = currentTopic.chartData.map((d) => [
        `"${d.region}"`,
        String(d.moralCreditScore),
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
      `MoralCredit_Chart1_${fileSuffix}_${currentTopic.key}_${new Date().toISOString().split('T')[0]}.csv`
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
      headers = ['จังหวัด', 'ภาค', 'สมาชิกผู้ทำความดี(คน)', 'แต้มสะสมรวม(แต้ม)', 'สัดส่วนทำดีต่อเนื่อง(%)', 'แหล่งข้อมูล'];
      rows = filteredProvincial.map((p) => [
        `"${p.province}"`,
        `"${p.region}"`,
        String(p.moralUsers),
        String(p.moralTotalPts),
        `${p.continuousRatioPct}%`,
        'ระบบ Moral Credit (ศูนย์คุณธรรม)'
      ]);
    } else if (activeDatasetTab === 'internal_raw') {
      fileSuffix = 'internal_raw_transactions';
      headers = ['ลำดับ', 'รหัสสมาชิก', 'ชื่อ-นามสกุล', 'สังกัด/หน่วยงาน', 'จังหวัด', 'หมวดความดี', 'พฤติกรรมความดี', 'ความถี่(ครั้ง)', 'แต้มที่ได้รับ', 'ระดับTier'];
      rows = filteredRawRows.map((r) => [
        String(r.rowId),
        String(r.memberId),
        `"${showRealNames ? r.fullName : maskName(r.fullName)}"`,
        `"${r.agency}"`,
        `"${r.province}"`,
        `"${r.category}"`,
        `"${r.deedTitle.replace(/"/g, '""')}"`,
        String(r.frequency),
        String(r.points),
        `"${r.tier}"`
      ]);
    } else if (activeDatasetTab === 'external_agency') {
      fileSuffix = 'external_agency';
      headers = ['จังหวัด', 'ภาค', 'ชื่อตัวชี้วัดภายนอก', 'ค่าสถิติภายนอก', 'สถานะเชิงพื้นที่', 'หน่วยงาน'];
      rows = filteredExternal.map((p) => [
        `"${p.province}"`,
        `"${p.region}"`,
        `"${currentTopic.externalMetricName}"`,
        `"${p.externalMetricFormatted}"`,
        `"${p.riskLevel}"`,
        `"${currentTopic.externalAgencyShort}"`
      ]);
    } else {
      fileSuffix = 'merged_matrix';
      headers = [
        'จังหวัด', 'ภาค', 'สมาชิก(คน)', 'แต้มรวม(แต้ม)', 'ทำดีต่อเนื่อง(%)',
        'ตัวชี้วัดภายนอก', 'สถานะเชิงพื้นที่', 'คะแนนSynergy'
      ];
      rows = filteredProvinces.map((p) => [
        `"${p.province}"`,
        `"${p.region}"`,
        String(p.moralUsers),
        String(p.moralTotalPts),
        `${p.continuousRatioPct}%`,
        `"${p.externalMetricFormatted}"`,
        `"${p.riskLevel}"`,
        p.synergyScore.toFixed(1)
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
      `MoralCredit_${fileSuffix}_${currentTopic.key}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique regions for filter dropdown
  const uniqueRegions = useMemo(() => {
    const set = new Set(currentTopic.provincialData.map((p) => p.region));
    return Array.from(set);
  }, [currentTopic]);


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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: currentTopic.accentColor, fontSize: '13px', fontWeight: 800, marginBottom: '2px' }}>
              <FileText size={16} />
              <span>ชุดข้อมูลเชิงประจักษ์ & แผนบูรณาการความสัมพันธ์เชิงพื้นที่ (Provincial Synergy Data Explorer)</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              ตารางข้อมูลที่นำมาใช้ทำ Synergy ในกราฟนี้
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '2px 0 0 0' }}>
              แสดงความสัมพันธ์ระหว่างพฤติกรรมสะสมแต้มความดีกับตัวชี้วัด {currentTopic.externalMetricName}
            </p>
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
            <span>ส่งออก CSV ({activeDatasetTab === 'internal_provincial' ? 'สถิติจังหวัด' : activeDatasetTab === 'internal_raw' ? 'บันทึกธุรกรรม' : activeDatasetTab === 'external_agency' ? 'ข้อมูลภายนอก' : 'ตารางบูรณาการ'})</span>
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
            {/* Left Box: Internal Moral Credit Datasets */}
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
                  Moral Credit: ฐานข้อมูลพฤติกรรมความดีรายบุคคล & รายจังหวัด
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  สถิติจำนวนผู้ทำความดีและคะแนนสะสม Moral Credit ครอบคลุม 77 จังหวัด และ 726 รายการธุรกรรมความดี
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
                  title="คลิกเพื่อดู: ตารางสถิติผู้บันทึกความดี Moral Credit รายจังหวัด 77 จังหวัด"
                >
                  <span className="btn-icon"><Users size={19} /></span>
                  <span className="btn-name">สถิติคะแนนความดีรายจังหวัด</span>
                  <span className="btn-count">77 จังหวัด</span>
                  {activeDatasetTab === 'internal_provincial' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                <button
                  type="button"
                  className={`formula-table-btn internal ${activeDatasetTab === 'internal_raw' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveDatasetTab('internal_raw');
                    setCurrentPage(1);
                  }}
                  title="คลิกเพื่อดู: ตารางบันทึกประวัติการทำความดีรายบุคคล 726 รายการ"
                >
                  <span className="btn-icon"><Award size={19} /></span>
                  <span className="btn-name">บันทึกธุรกรรมความดีรายบุคคล</span>
                  <span className="btn-count">726 รายการ</span>
                  {activeDatasetTab === 'internal_raw' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
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
                  {currentTopic.externalAgency}: {currentTopic.externalMetricName}
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
              title="คลิกเพื่อดู: ตารางบูรณาการความสัมพันธ์เชิงพื้นที่ (Moral Credit vs สถิติภายนอก)"
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

        {/* Search & Filter Bar */}
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
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={
                activeDatasetTab === 'internal_raw'
                  ? 'ค้นหาชื่อสมาชิก, สังกัด, ความดี...'
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
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Risk Filter (Shown for external and merged) */}
          {(activeDatasetTab === 'external_agency' || activeDatasetTab === 'merged_synergy') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569' }}>ระดับสถานะ:</span>
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
                <option value="all">ทุกระดับสถานะ</option>
                <option value="มั่นคง">มั่นคง</option>
                <option value="เสี่ยงต่ำ">เสี่ยงต่ำ</option>
                <option value="ปานกลาง">ปานกลาง</option>
                <option value="เสี่ยงสูง">เสี่ยงสูง</option>
                <option value="วิกฤต">วิกฤต</option>
              </select>
            </div>
          )}

          {/* PDPA Privacy Toggle for Raw Transactions Table */}
          {activeDatasetTab === 'internal_raw' && (
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
              title="สลับโหมดการแสดงผลชื่อสมาชิกตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)"
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
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          {/* TAB 1: Internal Provincial Table */}
          {activeDatasetTab === 'internal_provincial' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>จังหวัด</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>ภาค</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>สมาชิกผู้ทำความดี (คน)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>แต้มสะสมรวม (แต้ม)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>สัดส่วนทำดีต่อเนื่อง (%)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'center' }}>แหล่งที่มา</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                      ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  (paginatedRows as typeof currentTopic.provincialData).map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                        {row.province}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>
                        {row.region}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>
                        {row.moralUsers.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: currentTopic.accentColor }}>
                        {row.moralTotalPts.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                        {row.continuousRatioPct}%
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                        ระบบ Moral Credit (ศูนย์คุณธรรม)
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: Internal Raw Transactions Table (726 records) */}
          {activeDatasetTab === 'internal_raw' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>ลำดับ</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>รหัสสมาชิก</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>ชื่อ-นามสกุล</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>สังกัด / หน่วยงาน</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>จังหวัด</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>หมวดความดี</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>พฤติกรรมความดีที่บันทึก</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'center' }}>ความถี่</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>แต้มที่ได้รับ</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'center' }}>ระดับ Tier</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                      ไม่พบข้อมูลบันทึกความดีที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  (paginatedRows as typeof MORAL_CREDIT_RAW_ROWS).map((row) => (
                    <tr
                      key={row.rowId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: row.rowId % 2 === 0 ? '#ffffff' : '#fafafa'
                      }}
                    >
                      <td style={{ padding: '11px 14px', fontFamily: 'monospace', color: '#64748b', fontSize: '13px' }}>
                        {row.rowId}
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: 'monospace', color: '#1e3a8a', fontWeight: 600 }}>
                        MEM-{row.memberId}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: '#0f172a' }}>
                        {showRealNames ? row.fullName : maskName(row.fullName)}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#475569' }}>
                        {row.agency}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 600 }}>
                        {row.province}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: row.category ? '#eff6ff' : '#f1f5f9',
                            color: row.category ? '#1d4ed8' : '#64748b'
                          }}
                        >
                          {row.category || 'สมาชิกใหม่'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', color: row.deedTitle ? '#334155' : '#94a3b8', maxWidth: '280px', fontStyle: row.deedTitle ? 'normal' : 'italic' }}>
                        {row.deedTitle || 'ยังไม่มีรายการบันทึกความดี (0 แต้ม)'}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center', fontWeight: 600 }}>
                        {row.frequency} ครั้ง
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: currentTopic.accentColor }}>
                        +{row.points.toLocaleString()}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            background: '#f1f5f9',
                            color: '#475569'
                          }}
                        >
                          {row.tier}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: External Agency Table */}
          {activeDatasetTab === 'external_agency' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>จังหวัด</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>ภาค</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>ชื่อตัวชี้วัดภายนอก</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>ค่าสถิติตัวชี้วัด ({currentTopic.externalAgencyShort})</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'center' }}>สถานะเชิงพื้นที่</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'center' }}>หน่วยงานเจ้าของข้อมูล</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                      ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  (paginatedRows as typeof currentTopic.provincialData).map((row, idx) => {
                    let badgeBg = '#f1f5f9';
                    let badgeColor = '#475569';
                    if (row.riskLevel === 'มั่นคง') {
                      badgeBg = '#dcfce7';
                      badgeColor = '#15803d';
                    } else if (row.riskLevel === 'เสี่ยงต่ำ') {
                      badgeBg = '#e0f2fe';
                      badgeColor = '#0369a1';
                    } else if (row.riskLevel === 'ปานกลาง') {
                      badgeBg = '#fef3c7';
                      badgeColor = '#b45309';
                    } else if (row.riskLevel === 'เสี่ยงสูง') {
                      badgeBg = '#ffedd5';
                      badgeColor = '#c2410c';
                    } else if (row.riskLevel === 'วิกฤต') {
                      badgeBg = '#fee2e2';
                      badgeColor = '#b91c1c';
                    }

                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                        }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                          {row.province}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748b' }}>
                          {row.region}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#334155' }}>
                          {currentTopic.externalMetricName}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                          {row.externalMetricFormatted}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              background: badgeBg,
                              color: badgeColor
                            }}
                          >
                            {row.riskLevel}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#0284c7' }}>
                          {currentTopic.externalAgencyShort}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* TAB 4: Merged Provincial Synergy Matrix Table */}
          {activeDatasetTab === 'merged_synergy' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>จังหวัด</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>ภาค</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>สมาชิก (คน)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>แต้มรวม (แต้ม)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>ทำดีต่อเนื่อง (%)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>ตัวชี้วัดภายนอก</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'center' }}>สถานะเชิงพื้นที่</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>คะแนน Synergy</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                      ไม่พบข้อมูลจังหวัดที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  (paginatedRows as typeof currentTopic.provincialData).map((row, idx) => {
                    let badgeBg = '#f1f5f9';
                    let badgeColor = '#475569';
                    if (row.riskLevel === 'มั่นคง') {
                      badgeBg = '#dcfce7';
                      badgeColor = '#15803d';
                    } else if (row.riskLevel === 'เสี่ยงต่ำ') {
                      badgeBg = '#e0f2fe';
                      badgeColor = '#0369a1';
                    } else if (row.riskLevel === 'ปานกลาง') {
                      badgeBg = '#fef3c7';
                      badgeColor = '#b45309';
                    } else if (row.riskLevel === 'เสี่ยงสูง') {
                      badgeBg = '#ffedd5';
                      badgeColor = '#c2410c';
                    } else if (row.riskLevel === 'วิกฤต') {
                      badgeBg = '#fee2e2';
                      badgeColor = '#b91c1c';
                    }

                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '11px 14px', fontWeight: 700, color: '#0f172a' }}>
                          {row.province}
                        </td>
                        <td style={{ padding: '11px 14px', color: '#64748b' }}>
                          {row.region}
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 600 }}>
                          {row.moralUsers}
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: currentTopic.accentColor }}>
                          {row.moralTotalPts.toLocaleString()}
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                          {row.continuousRatioPct}%
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                          {row.externalMetricFormatted}
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              background: badgeBg,
                              color: badgeColor
                            }}
                          >
                            {row.riskLevel}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          {row.synergyScore.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })
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
              {activeDatasetTab === 'internal_raw' && ' (ประวัติบันทึกธุรกรรมความดี 726 รายการ)'}
              {activeDatasetTab === 'internal_provincial' && ' (สถิติจำนวนสมาชิกและแต้มสะสม 77 จังหวัด)'}
              {activeDatasetTab === 'external_agency' && ` (ชุดข้อมูลสถิติ ${currentTopic.externalAgency})`}
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
      {/* 1. COMPACT SYNERGY HEADLINE BAR: Panoramic Province Long Banner */}
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
                <span>🛡️ 726 รายการ</span>
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
                Moral Credit: {currentTopic.name}
              </span>
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
              {renderThematicHighlightedHeadline(currentTopic.evidenceHeadline)}
            </h2>
            <div className="discipline-banner-subtitle">
              📌 {currentTopic.fullName} • {currentTopic.chartSubtitle}
            </div>
          </div>
        </div>

        {/* Collapsible Details Panel: Description + 4 Stat Cards + Recommendations */}
        {showEmpiricalEvidence && (
          <div className="discipline-collapsible-panel">
            {/* Detailed Synthesis Paragraph */}
            <div
              style={{
                fontSize: '15px',
                color: '#334155',
                lineHeight: 1.6,
                background: '#f8fafc',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}
            >
              <strong style={{ color: '#0f172a' }}>ข้อค้นพบเชิงลึก:</strong> {currentTopic.evidenceDetail}
            </div>

            {/* 4 Empirical Stat Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px'
              }}
            >
              {currentTopic.stats.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    border: '1.5px solid #e2e8f0',
                    borderLeft: `5px solid ${currentTopic.accentColor}`,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: currentTopic.accentColor }}>
                    {s.val}
                  </div>
                  {s.sub && (
                    <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
                      {s.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Graph Dynamics & Visual Evidence (อธิบายในเชิงการเคลื่อนไหวของกราฟ) */}
            {MORAL_CREDIT_GRAPH_DYNAMICS[currentTopic.key] && (
              <MdcGraphDynamicsEvidenceCard
                evidence={MORAL_CREDIT_GRAPH_DYNAMICS[currentTopic.key]}
                accentColor={currentTopic.accentColor}
                topicName={currentTopic.fullName}
              />
            )}
          </div>
        )}
      </div>

      {/* 2. การ์ดแผนที่เชิงพื้นที่ระดับจังหวัดและภูมิภาค (Spatial Synergy Regional & Provincial Map Card) พร้อมชุด Bullet */}
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
        policyRecommendation={currentTopic.policyRecommendation}
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
                <span className="btn-sub-label">วิเคราะห์ความสัมพันธ์ราย 8 ภูมิภาค (Moral Credit vs {currentTopic.externalAgencyShort})</span>
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

      {/* 4. SYNERGY CHART 1: Dual-Axis ComposedChart (Collapsible On-Demand) */}
      {showChart1 && (
        <div className="collapsible-chart-section">
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: currentTopic.accentColor, fontSize: '13px', fontWeight: 800, marginBottom: '4px' }}>
              <TrendingUp size={16} />
              <span>กราฟที่ 1: DUAL-AXIS SYNERGY MATRIX (8 ภูมิภาค)</span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
              {currentTopic.chartTitle}
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
              {currentTopic.chartSubtitle}
            </p>
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748b', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            แหล่งข้อมูล: ฐานข้อมูลศูนย์คุณธรรม (Moral Credit) + {currentTopic.externalAgencyShort}
          </div>
        </div>

        {/* Recharts Dual-Axis Chart */}
        <div style={{ width: '100%', height: 380, marginTop: '8px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={currentTopic.chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="region"
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                stroke="#cbd5e1"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={55}
              />
              {/* Left Y Axis: Moral Credit Score (0 - 100) */}
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                stroke={currentTopic.accentColor}
                tick={{ fill: currentTopic.accentColor, fontSize: 12, fontWeight: 700 }}
                label={{
                  value: 'เครดิตคุณธรรม (แต้ม 0-100)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: currentTopic.accentColor,
                  fontSize: 12.5,
                  fontWeight: 700
                }}
              />
              {/* Right Y Axis: External Metric / Risk */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#dc2626"
                tick={{ fill: '#dc2626', fontSize: 12, fontWeight: 700 }}
                label={{
                  value: 'ดัชนีผลกระทบภายนอก',
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
                  fontSize: '13px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
                  padding: '10px 14px'
                }}
                itemStyle={{ color: '#facc15', fontWeight: 700 }}
                labelStyle={{ color: '#fef08a', fontWeight: 800, marginBottom: '4px' }}
                formatter={(val: any, name?: any) => {
                  const n = String(name || '');
                  let labelName = 'ดัชนีผลกระทบภายนอก';
                  let unit = '';
                  if (n.includes('Moral') || n.includes('คะแนน')) { labelName = 'Moral Credit Index'; unit = ' แต้ม'; }
                  else if (n.includes('ต่อเนื่อง')) { labelName = 'สัดส่วนกลุ่มทำดีต่อเนื่อง'; unit = '%'; }
                  return [
                    <span style={{ color: '#facc15', fontWeight: 800 }}>{val}{unit}</span>,
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{labelName}</span>
                  ];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '13px' }} />
              {/* Bar 1: Moral Credit Score */}
              <Bar
                yAxisId="left"
                dataKey="moralCreditScore"
                name="คะแนน Moral Credit (แต้ม)"
                fill={currentTopic.accentColor}
                radius={[6, 6, 0, 0]}
                barSize={28}
              />
              {/* Line 1: Continuous Doers Ratio */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="continuousRatioPct"
                name="สัดส่วนทำดีต่อเนื่อง (%)"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563eb' }}
              />
              {/* Line 2: External Risk / Impact */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="externalImpactVal"
                name="ผลกระทบภายนอก (External Metric)"
                stroke="#dc2626"
                strokeWidth={3}
                strokeDasharray="4 4"
                dot={{ r: 5, fill: '#dc2626', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Buttons Under Chart 1: วิธีดูกราฟ & ชุดข้อมูล (8 ภูมิภาค) */}
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
              fontSize: '15.5px', // 15% larger than 13.5px standard
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isChart1GuideExpanded ? '0 4px 12px rgba(37, 99, 235, 0.15)' : '0 2px 6px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Info size={20} color={isChart1GuideExpanded ? '#2563eb' : '#64748b'} />
            <span>{isChart1GuideExpanded ? 'ซ่อนวิธีดูกราฟที่ 1' : 'วิธีดูกราฟ (Dual-Axis Synergy)'}</span>
            {isChart1GuideExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>



          {/* ปุ่มหลักฐานเชิงประจักษ์ (ใต้กราฟที่ 1) */}
          <button
            type="button"
            onClick={() => setIsEmpiricalEvidenceExpanded((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 28px',
              borderRadius: '30px',
              border: isEmpiricalEvidenceExpanded ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
              background: isEmpiricalEvidenceExpanded ? '#0f172a' : '#ffffff',
              color: isEmpiricalEvidenceExpanded ? '#ffffff' : '#334155',
              fontSize: '15.5px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isEmpiricalEvidenceExpanded
                ? '0 4px 12px rgba(15, 23, 42, 0.2)'
                : '0 2px 6px rgba(0, 0, 0, 0.05)'
            }}
            title={isEmpiricalEvidenceExpanded ? 'คลิกเพื่อซ่อนหลักฐานเชิงประจักษ์' : 'คลิกเพื่อดูหลักฐานเชิงประจักษ์ (การเคลื่อนไหวของกราฟ)'}
          >
            <Lightbulb size={20} color={isEmpiricalEvidenceExpanded ? '#fbbf24' : '#d97706'} />
            <span>{isEmpiricalEvidenceExpanded ? 'หลักฐานเชิงประจักษ์ (ซ่อน)' : 'หลักฐานเชิงประจักษ์'}</span>
            {isEmpiricalEvidenceExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Collapsible Panel 1.05: Empirical Evidence (Graph Dynamics) under Chart 1 */}
        {isEmpiricalEvidenceExpanded && MORAL_CREDIT_GRAPH_DYNAMICS[currentTopic.key] && (
          <div style={{ marginTop: '14px', animation: 'fadeIn 0.2s ease' }}>
            <MdcGraphDynamicsEvidenceCard
              evidence={MORAL_CREDIT_GRAPH_DYNAMICS[currentTopic.key]}
              accentColor={currentTopic.accentColor}
              topicName={currentTopic.fullName}
            />
          </div>
        )}

        {/* Collapsible Panel 1: Guide Card for Chart 1 */}
        {isChart1GuideExpanded && (
          <div style={{ marginTop: '14px', animation: 'fadeIn 0.2s ease' }}>
            <MdcChart1GuideCard
              topicName={currentTopic.fullName}
              chartTitle={currentTopic.chartTitle}
              chartSubtitle={currentTopic.chartSubtitle}
              dynamicsEvidence={MORAL_CREDIT_GRAPH_DYNAMICS[currentTopic.key]}
            />
          </div>
        )}
      </div>
      </div>
      )}

        {/* 5. SYNERGY CHART 2: 8-Region Spatial Bubble Matrix (Collapsible On-Demand) */}
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
          chartSubtitle="วิเคราะห์ตำแหน่งเชิงพื้นที่ระหว่าง Moral Credit (แกน X) กับความเสี่ยงเชิงพฤติกรรมภายนอก (แกน Y)"
          evidenceHeadline={currentTopic.evidenceHeadline}
          evidenceDetail={currentTopic.evidenceDetail}
          stats={currentTopic.stats}
          externalAgency={currentTopic.externalAgency}
          customDatasetPanel={renderProvincialDatasetPanel()}
          extraActionButton={
            <button
              type="button"
              className="spatial-matrix-toggle-btn"
              onClick={() => setIsEmpiricalEvidenceExpanded((prev) => !prev)}
              title={
                isEmpiricalEvidenceExpanded
                  ? 'คลิกเพื่อซ่อนหลักฐานเชิงประจักษ์'
                  : 'คลิกเพื่อดูหลักฐานเชิงประจักษ์: ถอดรหัสการเคลื่อนไหวของกราฟสู่ผลลัพธ์เชิงประจักษ์'
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 28px',
                borderRadius: '999px',
                background: isEmpiricalEvidenceExpanded ? '#0f172a' : '#ffffff',
                color: isEmpiricalEvidenceExpanded ? '#ffffff' : '#1e293b',
                border: isEmpiricalEvidenceExpanded ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
                fontFamily: "'Kanit', sans-serif",
                fontSize: '17.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isEmpiricalEvidenceExpanded
                  ? '0 4px 14px rgba(15, 23, 42, 0.25)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Lightbulb size={21} color={isEmpiricalEvidenceExpanded ? '#fbbf24' : '#d97706'} />
              <span>{isEmpiricalEvidenceExpanded ? 'หลักฐานเชิงประจักษ์ (ซ่อน)' : 'หลักฐานเชิงประจักษ์'}</span>
              {isEmpiricalEvidenceExpanded ? <ChevronUp size={21} /> : <ChevronDown size={21} />}
            </button>
          }
          extraActionPanel={
            isEmpiricalEvidenceExpanded && MORAL_CREDIT_GRAPH_DYNAMICS[currentTopic.key] ? (
              <div style={{ width: '100%', marginTop: '16px', animation: 'fadeIn 0.25s ease' }}>
                <MdcGraphDynamicsEvidenceCard
                  evidence={MORAL_CREDIT_GRAPH_DYNAMICS[currentTopic.key]}
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
      {/* 6. ปุ่มชุดข้อมูลล่างสุด (แยกออกจากกราฟ) พร้อมตารางเวลาที่เรากดดูชุดข้อมูลต่าง ๆ */}
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
