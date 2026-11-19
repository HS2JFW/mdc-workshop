import { PublishedPageSynergySection } from '../components/PublishedPageSynergySection';
import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Users,
  Building2,
  Award,
  TrendingUp,
  FileText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Layers,
  Compass,
  ArrowRight
} from 'lucide-react';
import { MdcTopSearchBar } from '../components/MdcTopSearchBar';
import { exportDashboardToPdf } from '../utils/dashboardExportUtils';
import { MdcTopSubmenuBar, type MdcSubmenuCardItem } from '../components/MdcTopSubmenuBar';
import { MdcTopSynergyMenuBar, type SynergyTopicItem } from '../components/MdcTopSynergyMenuBar';
import { MoralCreditSynergyTopicView } from '../components/MoralCreditSynergyTopicView';
import { MoralCreditRegionalMapCard } from '../components/MoralCreditRegionalMapCard';
import {
  MORAL_CREDIT_RAW_ROWS,
  MORAL_CREDIT_MEMBERS,
  MORAL_CREDIT_CATEGORIES_SUMMARY,
  MORAL_CREDIT_PROVINCES_SUMMARY,
  MORAL_CREDIT_KPI_OVERVIEW,
  MORAL_CREDIT_SCORE_BRACKETS,
  type MoralCreditRawRow
} from '../data/moralCreditData';
import {
  MORAL_CREDIT_SYNERGY_TOPICS,
  MORAL_CREDIT_DIMENSION_CONFIGS,
  getMoralCreditDimensionMeta
} from '../data/moralCreditSynergyTopicsData';

// Color Palette for 5 Moral Dimensions + Others
const CATEGORY_COLORS: Record<string, string> = {
  จิตอาสา: '#2563eb',
  วินัย: '#059669',
  กตัญญู: '#7c3aed',
  พอเพียง: '#0891b2',
  สุจริต: '#d97706',
  อื่นๆ: '#dc2626'
};

export interface PolicyMoralCreditDashboardViewProps {
  onNavigatePage?: (pageId: string) => void;
}

export const PolicyMoralCreditDashboardView: React.FC<PolicyMoralCreditDashboardViewProps> = ({
  onNavigatePage
}) => {
  // Navigation: null = ภาพรวม (Overview), or string key for 5 moral dimensions
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  // Active Synergy Subtopic ID within the selected moral dimension
  const [activeTopicId, setActiveTopicId] = useState<string>('responsibility_traffic');

  const handleSelectDimension = (dimKey: string | null) => {
    setSelectedDimension(dimKey);
    if (dimKey && dimKey !== 'overview') {
      const meta = getMoralCreditDimensionMeta(dimKey);
      if (meta && meta.topics.length > 0) {
        setActiveTopicId(meta.topics[0].id);
      }
    }
  };

  const currentDimensionMeta = useMemo(() => {
    if (!selectedDimension || selectedDimension === 'overview') return null;
    return getMoralCreditDimensionMeta(selectedDimension);
  }, [selectedDimension]);

  // PDPA privacy toggle for Member Table
  const [showRealNames, setShowRealNames] = useState<boolean>(true);

  // Table filters & search state
  const [tableSearch, setTableSearch] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [selectedBehaviorFilter, setSelectedBehaviorFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Level 1: Top Submenu Bar Items (5 Moral Dimensions + ภาพรวม)
  const submenuItems: MdcSubmenuCardItem[] = useMemo(() => {
    return [
      {
        key: 'overview',
        name: 'ภาพรวม',
        subName: 'MORAL CREDIT',
        colorType: 'blue',
        isActive: selectedDimension === null,
        onClick: () => handleSelectDimension(null),
        title: 'ภาพรวมระบบ Moral Credit (สมาชิก 275 • ข้อมูล 726)',
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
        key: 'gratitude',
        name: 'กตัญญู',
        subName: 'GRATITUDE',
        colorType: 'purple',
        isActive: selectedDimension === 'gratitude',
        onClick: () => handleSelectDimension('gratitude'),
        title: 'มิติกตัญญู (คลิกเพื่อเลือกหัวข้อ Synergy ข้อมูลภายนอก)',
        icon: <span style={{ fontSize: '20px' }}>🙏</span>
      },
      {
        key: 'publicConsciousness',
        name: 'จิตอาสา',
        subName: 'VOLUNTEER',
        colorType: 'blue',
        isActive: selectedDimension === 'publicConsciousness',
        onClick: () => handleSelectDimension('publicConsciousness'),
        title: 'มิติจิตอาสา (คลิกเพื่อเลือกหัวข้อ Synergy ข้อมูลภายนอก)',
        icon: <span style={{ fontSize: '20px' }}>🤝</span>
      },
      {
        key: 'responsibility',
        name: 'วินัยรับผิดชอบ',
        subName: 'DISCIPLINE',
        colorType: 'teal',
        isActive: selectedDimension === 'responsibility',
        onClick: () => handleSelectDimension('responsibility'),
        title: 'มิติวินัยรับผิดชอบ (คลิกเพื่อเลือกหัวข้อ Synergy ข้อมูลภายนอก)',
        icon: <span style={{ fontSize: '20px' }}>🎯</span>
      },
      {
        key: 'honesty',
        name: 'สุจริต',
        subName: 'HONESTY',
        colorType: 'amber',
        isActive: selectedDimension === 'honesty',
        onClick: () => handleSelectDimension('honesty'),
        title: 'มิติสุจริต (คลิกเพื่อเลือกหัวข้อ Synergy ข้อมูลภายนอก)',
        icon: <span style={{ fontSize: '20px' }}>⚖️</span>
      },
      {
        key: 'sufficiency',
        name: 'พอเพียง',
        subName: 'SUFFICIENCY',
        colorType: 'teal',
        isActive: selectedDimension === 'sufficiency',
        onClick: () => handleSelectDimension('sufficiency'),
        title: 'มิติพอเพียง (คลิกเพื่อเลือกหัวข้อ Synergy ข้อมูลภายนอก)',
        icon: <span style={{ fontSize: '20px' }}>🌱</span>
      }
    ];
  }, [selectedDimension]);

  // Map of Member Continuous Status (≥5 times or ≥30 total points)
  const memberContinuousMap = useMemo(() => {
    const map = new Map<number, boolean>();
    for (const m of MORAL_CREDIT_MEMBERS) {
      const isContinuous = m.totalFrequency >= 5 || m.totalScore >= 30;
      map.set(m.memberId, isContinuous);
    }
    return map;
  }, []);

  // Filtered Raw Rows for Table
  const filteredRows = useMemo(() => {
    return MORAL_CREDIT_RAW_ROWS.filter((r) => {
      // Search
      const q = tableSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.agency.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.province.toLowerCase().includes(q) ||
        r.deedTitle.toLowerCase().includes(q) ||
        String(r.memberId).includes(q);

      // Category filter
      const matchCategory =
        selectedCategoryFilter === 'all' || r.category === selectedCategoryFilter;

      // Tier filter
      const matchTier =
        selectedTierFilter === 'all' || r.tier === selectedTierFilter;

      // Behavior filter
      const isCont = memberContinuousMap.get(r.memberId) ?? false;
      const matchBehavior =
        selectedBehaviorFilter === 'all' ||
        (selectedBehaviorFilter === 'continuous' && isCont) ||
        (selectedBehaviorFilter === 'intermittent' && !isCont);

      return matchSearch && matchCategory && matchTier && matchBehavior;
    });
  }, [tableSearch, selectedCategoryFilter, selectedTierFilter, selectedBehaviorFilter, memberContinuousMap]);

  // Paginated Table Data
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = [
      'ลำดับ',
      'รหัสสมาชิก',
      'ชื่อ-นามสกุล',
      'หน่วยงาน/สังกัด',
      'อำเภอ',
      'จังหวัด',
      'ระดับขั้น',
      'ชื่อความดี',
      'มิติคุณธรรม',
      'จำนวนครั้ง',
      'คะแนนครั้งนี้',
      'คะแนนสะสมรวม'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredRows.map((r) =>
        [
          r.rowId,
          `MDC-${String(r.memberId).padStart(3, '0')}`,
          `"${showRealNames ? r.fullName : `สมาชิก MDC-${String(r.memberId).padStart(3, '0')}`}"`,
          `"${r.agency || '-'}"`,
          `"${r.district || '-'}"`,
          `"${r.province || '-'}"`,
          `"${r.tier || '-'}"`,
          `"${r.deedTitle.replace(/"/g, '""')}"`,
          `"${r.category || '-'}"`,
          r.frequency,
          r.points,
          r.memberTotalScore
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Moral_Credit_Dataset_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Data for Chart 1: Donut of 5 Moral Dimensions
  const dimensionChartData = useMemo(() => {
    return MORAL_CREDIT_CATEGORIES_SUMMARY.map((c) => ({
      name: c.label,
      value: c.totalPoints,
      records: c.recordsCount,
      frequency: c.totalFrequency,
      sharePct: c.shareOfTotalPointsPct,
      color: CATEGORY_COLORS[c.key] || '#94a3b8'
    }));
  }, []);

  // Data for Chart 2: Top 10 Provinces by Total Points
  const top10ProvincesData = useMemo(() => {
    return MORAL_CREDIT_PROVINCES_SUMMARY.filter((p) => p.province !== 'ไม่ระบุจังหวัด')
      .slice(0, 10)
      .map((p) => ({
        province: p.province,
        points: p.totalPoints,
        members: p.totalMembers,
        topCat: p.topCategory
      }));
  }, []);

  // Data for Chart 3: Member Tier & Score Pyramid Distribution
  const tierDistributionData = useMemo(() => {
    return MORAL_CREDIT_SCORE_BRACKETS.map((b) => ({
      name: b.shortLabel,
      members: b.membersCount,
      points: b.totalPoints,
      color: b.color
    }));
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        paddingBottom: '32px'
      }}
    >
      {/* Top Search Bar Row (เข้าสู่ระบบ, ภาษา, PDF) */}
      <MdcTopSearchBar
        activePillar="policy-moral-credit"
        onNavigatePillar={onNavigatePage}
        onExportPdf={() =>
          exportDashboardToPdf({
            sectorTitle: 'ระดับนโยบาย',
            viewTitle: selectedDimension
              ? `Moral Credit Synergy: ${MORAL_CREDIT_SYNERGY_TOPICS[activeTopicId]?.fullName || currentDimensionMeta?.name || 'Data Synergy'}`
              : 'Moral Credit Dashboard (ระบบสะสมหน่วยกิตความดีเชิงประจักษ์)',
            viewSubtitle: 'แดชบอร์ดสรุปภาพรวมและวิเคราะห์ความสัมพันธ์เชิงประจักษ์จาก Moral Credit ร่วมกับ Big Data ภาครัฐ'
          })
        }
      />

      {/* 2. Top Submenu Arch Cards (Level 1: 5 Moral Dimensions + ภาพรวม) */}
      <MdcTopSubmenuBar
        title="มิติการวิเคราะห์ข้อมูล Moral Credit"
        items={submenuItems}
      />

      {/* 3. Top Synergy Submenu Bar (Level 2: แสดงเฉพาะเมื่อเลือกมิติคุณธรรม ไม่แสดงในหน้าภาพรวม) */}
      {selectedDimension && currentDimensionMeta && (
        <MdcTopSynergyMenuBar
          dimensionTitle={`Moral Credit: ${currentDimensionMeta.name}`}
          accentColor={currentDimensionMeta.accentColor}
          topics={currentDimensionMeta.topics}
          activeTopicId={activeTopicId}
          onSelectTopic={(topicId) => setActiveTopicId(topicId)}
          onBackToOverview={() => handleSelectDimension(null)}
        />
      )}

      {/* 4. Main Dashboard Body: Overview vs Synergy Subtopic */}
      <div style={{ padding: '20px 24px 0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {selectedDimension ? (
        /* SYNERGY SUBTOPIC VIEW */
        <MoralCreditSynergyTopicView
          topicKey={activeTopicId}
          onSelectTopic={(key) => setActiveTopicId(key)}
          onBackToOverview={() => handleSelectDimension(null)}
        />
      ) : (
        /* OVERVIEW TAB VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', width: '100%' }}>
          {/* A. Executive KPI Cards (Grid of 5 Cards) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px'
            }}
          >
            {/* Card 1: Members */}
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
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>สมาชิกทั้งหมด</span>
                <Users size={22} color="#1e3a8a" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: '8px 0 4px 0' }}>
                {MORAL_CREDIT_KPI_OVERVIEW.totalMembers} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>คน</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#059669', fontWeight: 700 }}>
                Platinum 2 • Gold 6 • Member 267
              </div>
            </div>

            {/* Card 2: Total Records */}
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
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>บันทึกความดีสะสม</span>
                <FileText size={22} color="#2563eb" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: '8px 0 4px 0' }}>
                {MORAL_CREDIT_KPI_OVERVIEW.totalTransactions} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>รายการ</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: 700 }}>
                ความถี่รวม {MORAL_CREDIT_KPI_OVERVIEW.totalFrequency.toLocaleString()} ครั้ง
              </div>
            </div>

            {/* Card 3: Total Points */}
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
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>เครดิตความดีสะสม</span>
                <Award size={22} color="#059669" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#059669', margin: '8px 0 4px 0' }}>
                {MORAL_CREDIT_KPI_OVERVIEW.totalPoints.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>แต้ม</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                เฉลี่ย {MORAL_CREDIT_KPI_OVERVIEW.avgPointsPerActiveMember} แต้ม/คน
              </div>
            </div>

            {/* Card 4: Continuous Doers */}
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
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>กลุ่มทำดีต่อเนื่อง</span>
                <TrendingUp size={22} color="#7c3aed" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#7c3aed', margin: '8px 0 4px 0' }}>
                32.4% <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>(89 คน)</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#7c3aed', fontWeight: 700 }}>
                สร้างแต้ม 71.8% ของทั้งระบบ
              </div>
            </div>

            {/* Card 5: Geographic Coverage */}
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
                borderTop: '4px solid #0891b2'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>พื้นที่ครอบคลุม</span>
                <Compass size={22} color="#0891b2" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: '8px 0 4px 0' }}>
                46 <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>จังหวัด</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#0891b2', fontWeight: 700 }}>
                ครอบคลุมทั้ง 6 ภูมิภาค
              </div>
            </div>
          </div>

          {/* B. THAILAND REGIONAL MAP & SPATIAL PRESENTATION CARD */}
          <MoralCreditRegionalMapCard />

          {/* C. Overview Multi-format Visualizations Grid (3 กราฟในแบบต่างๆ) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
              gap: '20px'
            }}
          >
            {/* กราฟที่ 1: Donut Chart สัดส่วนคุณธรรม 5 ด้าน */}
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
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', marginBottom: '2px' }}>
                  CHART 1: สัดส่วนคะแนนตามมิติคุณธรรม
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
                  สัดส่วนคะแนนและความถี่การทำความดี 5 ด้าน
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  จิตอาสาและวินัยรับผิดชอบครองสัดส่วนสูงสุดร่วมกันกว่า 56.9% ของแต้มทั้งระบบ
                </p>
              </div>

              <div style={{ width: '100%', height: 280, marginTop: '12px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dimensionChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {dimensionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name?: any) => [
                        <span style={{ color: '#facc15', fontWeight: 800, fontSize: '13.5px' }}>
                          {Number(val).toLocaleString()} แต้ม
                        </span>,
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                          {String(name || '')}
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* กราฟที่ 2: Horizontal Bar Chart Top 10 Provinces */}
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
                  CHART 2: LEADERBOARD รายจังหวัด
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
                  10 อันดับจังหวัดที่มีเครดิตความดีสูงสุด
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  กรุงเทพฯ, นครปฐม, นนทบุรี และกาญจนบุรี เป็นพื้นที่นำร่องที่มีแต้มสะสมหนาแน่นที่สุด
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
                      formatter={(val: any) => [
                        <span style={{ color: '#facc15', fontWeight: 800, fontSize: '13.5px' }}>
                          {Number(val).toLocaleString()} แต้ม
                        </span>,
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>คะแนนรวม</span>
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
                    <Bar dataKey="points" fill="#059669" radius={[0, 6, 6, 0]} barSize={16}>
                      {top10ProvincesData.map((entry, idx) => (
                        <Cell
                          key={`prov-cell-${idx}`}
                          fill={idx === 0 ? '#1e3a8a' : idx === 1 ? '#059669' : idx === 2 ? '#0284c7' : '#10b981'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* กราฟที่ 3: Member Tier & Score Pyramid Distribution */}
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
                  CHART 3: ปิรามิดช่วงคะแนนสะสม (Member Score Pyramid)
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
                  การกระจายตัวของสมาชิกตามช่วงคะแนนสะสม
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  สมาชิกระดับ Champion (&gt;100 แต้ม) 14 คน ขับเคลื่อนคะแนนรวมกว่า 4,500 แต้ม
                </p>
              </div>

              <div style={{ width: '100%', height: 280, marginTop: '12px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tierDistributionData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [
                        <span style={{ color: '#facc15', fontWeight: 800, fontSize: '13.5px' }}>
                          {Number(val).toLocaleString()} คน
                        </span>,
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>จำนวนสมาชิก</span>
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
                    <Bar dataKey="members" radius={[6, 6, 0, 0]} barSize={34}>
                      {tierDistributionData.map((entry, index) => (
                        <Cell key={`tier-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* C. MORAL CREDIT DATASET TABLE (วางไว้ด้านล่างสุดตามที่ผู้ใช้ร้องขอ) */}
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
                  <span>ฐานข้อมูลดิบระดับรายการ (Moral Credit Raw Transactions Table)</span>
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  ตารางฐานข้อมูลบันทึกความดีรายบุคคล (Moral Credit Dataset Table)
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                  ข้อมูลบันทึกความดีจริง 726 รายการ จากไฟล์ Excel ศูนย์คุณธรรม • รองรับการค้นหา กรอง และส่งออกข้อมูล
                </p>
              </div>

              {/* Action Buttons: PDPA Toggle & Export CSV */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* PDPA Privacy Toggle */}
                <button
                  type="button"
                  onClick={() => setShowRealNames((prev) => !prev)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: showRealNames ? '#f8fafc' : '#eff6ff',
                    color: showRealNames ? '#475569' : '#1d4ed8',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title={showRealNames ? 'คลิกเพื่อซ่อนชื่อจริง (PDPA Mode)' : 'คลิกเพื่อแสดงชื่อจริง'}
                >
                  {showRealNames ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{showRealNames ? 'โหมดซ่อนชื่อ (PDPA)' : 'กำลังซ่อนชื่อ (รหัสสมาชิก)'}</span>
                </button>

                {/* Export CSV Button */}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                  }}
                >
                  <Download size={15} />
                  <span>ส่งออก CSV ({filteredRows.length})</span>
                </button>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
                background: '#f8fafc',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Search Box */}
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, สังกัด, จังหวัด, ชื่อความดี..."
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
                    fontSize: '13px',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
              </div>

              {/* Category Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>มิติ:</span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => {
                    setSelectedCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: '#ffffff',
                    color: '#334155'
                  }}
                >
                  <option value="all">ทุกมิติคุณธรรม</option>
                  <option value="จิตอาสา">จิตอาสา</option>
                  <option value="วินัย">วินัย</option>
                  <option value="พอเพียง">พอเพียง</option>
                  <option value="กตัญญู">กตัญญู</option>
                  <option value="สุจริต">สุจริต</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* Tier Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>ระดับ:</span>
                <select
                  value={selectedTierFilter}
                  onChange={(e) => {
                    setSelectedTierFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: '#ffffff',
                    color: '#334155'
                  }}
                >
                  <option value="all">ทุกระดับขั้น</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Gold">Gold</option>
                  <option value="MDC Member">MDC Member</option>
                </select>
              </div>

              {/* Behavior Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>กลุ่มพฤติกรรม:</span>
                <select
                  value={selectedBehaviorFilter}
                  onChange={(e) => {
                    setSelectedBehaviorFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: '#ffffff',
                    color: '#334155'
                  }}
                >
                  <option value="all">ทุกกลุ่มพฤติกรรม</option>
                  <option value="continuous">กลุ่มทำดีต่อเนื่อง (≥5 ครั้ง)</option>
                  <option value="intermittent">กลุ่มทำดีครั้งคราว (&lt;5 ครั้ง)</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(tableSearch || selectedCategoryFilter !== 'all' || selectedTierFilter !== 'all' || selectedBehaviorFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setTableSearch('');
                    setSelectedCategoryFilter('all');
                    setSelectedTierFilter('all');
                    setSelectedBehaviorFilter('all');
                    setCurrentPage(1);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#dc2626',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={14} />
                  <span>ล้างตัวกรอง</span>
                </button>
              )}
            </div>

            {/* Table Rows */}
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '11px 12px', fontWeight: 800, color: '#334155', width: '50px' }}>#</th>
                    <th style={{ padding: '11px 12px', fontWeight: 800, color: '#334155' }}>ชื่อ-นามสกุล / สมาชิก</th>
                    <th style={{ padding: '11px 12px', fontWeight: 800, color: '#334155' }}>หน่วยงาน / สังกัด</th>
                    <th style={{ padding: '11px 12px', fontWeight: 800, color: '#334155' }}>จังหวัด</th>
                    <th style={{ padding: '11px 12px', fontWeight: 800, color: '#334155' }}>ระดับขั้น</th>
                    <th style={{ padding: '11px 12px', fontWeight: 800, color: '#334155' }}>ชื่อความดีที่บันทึก</th>
                    <th style={{ padding: '11px 12px', fontWeight: 800, color: '#334155', textAlign: 'center' }}>มิติคุณธรรม</th>
                    <th style={{ padding: '11px 12px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>ครั้ง</th>
                    <th style={{ padding: '11px 12px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>คะแนน</th>
                    <th style={{ padding: '11px 12px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>สะสมรวม</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                        ไม่พบบันทึกข้อมูลความดีที่ตรงกับคำค้นหาหรือตัวกรองที่เลือก
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((r, idx) => {
                      const catColor = CATEGORY_COLORS[r.category] || '#94a3b8';
                      const isContinuous = memberContinuousMap.get(r.memberId) ?? false;

                      return (
                        <tr
                          key={r.rowId}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafafa')}
                        >
                          <td style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 600 }}>
                            {r.rowId}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                            <div>
                              {showRealNames ? r.fullName : `สมาชิก MDC-${String(r.memberId).padStart(3, '0')}`}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                              ID: {r.memberId} {isContinuous && <span style={{ color: '#7c3aed', fontWeight: 700 }}>• ต่อเนื่อง</span>}
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>
                            {r.agency || '-'}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#334155', fontWeight: 600 }}>
                            {r.province || '-'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background:
                                  r.tier === 'Platinum'
                                    ? '#e0e7ff'
                                    : r.tier === 'Gold'
                                    ? '#fef3c7'
                                    : '#f1f5f9',
                                color:
                                  r.tier === 'Platinum'
                                    ? '#3730a3'
                                    : r.tier === 'Gold'
                                    ? '#92400e'
                                    : '#475569'
                              }}
                            >
                              {r.tier || 'Member'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#1e293b', maxWidth: '280px', lineHeight: 1.4 }}>
                            {r.deedTitle}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                background: `${catColor}15`,
                                color: catColor,
                                border: `1px solid ${catColor}30`
                              }}
                            >
                              {r.category || '-'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                            {r.frequency}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: catColor }}>
                            {r.points}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                            {r.memberTotalScore}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Summary Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '6px',
                fontSize: '13px',
                color: '#64748b'
              }}
            >
              <div>
                แสดง {Math.min((currentPage - 1) * pageSize + 1, filteredRows.length)} -{' '}
                {Math.min(currentPage * pageSize, filteredRows.length)} จากทั้งหมด{' '}
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{filteredRows.length}</span> รายการ
              </div>

              {/* Page Number Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12.5px' }}>แสดงต่อหน้า:</span>
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
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>

                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: currentPage <= 1 ? '#f1f5f9' : '#ffffff',
                    color: currentPage <= 1 ? '#94a3b8' : '#334155',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <span style={{ fontWeight: 700, color: '#0f172a', padding: '0 4px' }}>
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: currentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                    color: currentPage >= totalPages ? '#94a3b8' : '#334155',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      {/* Published Synergy Section (ถ้ามีการ Public Synergy มาหน้านี้) */}
      <PublishedPageSynergySection pageId="policy-moral-credit" pageTitle="Moral Credit (แต้มความดี)" />
    </div>
  );
};
