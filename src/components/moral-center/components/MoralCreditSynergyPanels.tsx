import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
  ReferenceLine
} from 'recharts';
import {
  Calculator,
  Database,
  TrendingUp,
  Target,
  Download,
  Code2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Landmark,
  Microscope,
  ShieldCheck,
  Layers,
  Copy,
  Check,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { Thailand3dShadedMap, getProvinceThaiName } from './Thailand3dShadedMap';
import { ChartFormulaDrawer, type ChartFormulaData } from './ChartFormulaDrawer';
import { ChartDrillDownToolbar } from './ChartDrillDownToolbar';
import { SeniorDrillDownChartCard } from './SeniorDrillDownChartCard';
import {
  FORMULA_MORAL_CREDIT_MCWS,
  FORMULA_MORAL_CREDIT_MWAI,
  FORMULA_MORAL_CREDIT_BCR
} from '../data/moralDashboardFormulas';

import {
  MORAL_CREDIT_FINANCIAL_DATA,
  CREDIT_FRONTIER_DECILE_CURVE,
  FINANCIAL_SANKEY_FLOW_STAGES,
  MORAL_CREDIT_FINANCIAL_JSON_SPEC,
  MORAL_CREDIT_STEM_DATA,
  STEM_SUNBURST_RINGS_DATA,
  MORAL_CREDIT_STEM_JSON_SPEC,
  MORAL_CREDIT_CIVIC_DATA,
  CIVIC_DISCIPLINE_PARETO_DATA,
  MORAL_CREDIT_CIVIC_JSON_SPEC,
  MORAL_CREDIT_MASTER_POLICY_MATRIX,
  type MoralCreditSynergyTabKey
} from '../data/moralCreditSynergyData';

interface MoralCreditSynergyPanelsProps {
  activeTab: Exclude<MoralCreditSynergyTabKey, 'overview'>;
  onSwitchTab: (tab: MoralCreditSynergyTabKey) => void;
}

const PROVINCE_TO_SYNERGY_REGION: Record<string, string> = {
  กรุงเทพมหานคร: 'กรุงเทพฯ และปริมณฑล',
  นนทบุรี: 'กรุงเทพฯ และปริมณฑล',
  ปทุมธานี: 'กรุงเทพฯ และปริมณฑล',
  สมุทรปราการ: 'กรุงเทพฯ และปริมณฑล',
  สมุทรสาคร: 'กรุงเทพฯ และปริมณฑล',
  นครปฐม: 'กรุงเทพฯ และปริมณฑล',
  เชียงใหม่: 'ภาคเหนือ',
  เชียงราย: 'ภาคเหนือ',
  ลำพูน: 'ภาคเหนือ',
  ลำปาง: 'ภาคเหนือ',
  แพร่: 'ภาคเหนือ',
  น่าน: 'ภาคเหนือ',
  พะเยา: 'ภาคเหนือ',
  แม่ฮ่องสอน: 'ภาคเหนือ',
  อุตรดิตถ์: 'ภาคเหนือ',
  พิษณุโลก: 'ภาคเหนือ',
  สุโขทัย: 'ภาคเหนือ',
  ตาก: 'ภาคเหนือ',
  กำแพงเพชร: 'ภาคเหนือ',
  พิจิตร: 'ภาคเหนือ',
  เพชรบูรณ์: 'ภาคเหนือ',
  นครสวรรค์: 'ภาคเหนือ',
  อุทัยธานี: 'ภาคเหนือ',
  ขอนแก่น: 'ภาคตะวันออกเฉียงเหนือ',
  อุดรธานี: 'ภาคตะวันออกเฉียงเหนือ',
  นครราชสีมา: 'ภาคตะวันออกเฉียงเหนือ',
  อุบลราชธานี: 'ภาคตะวันออกเฉียงเหนือ',
  สุรินทร์: 'ภาคตะวันออกเฉียงเหนือ',
  ร้อยเอ็ด: 'ภาคตะวันออกเฉียงเหนือ',
  บุรีรัมย์: 'ภาคตะวันออกเฉียงเหนือ',
  ศรีสะเกษ: 'ภาคตะวันออกเฉียงเหนือ',
  มหาสารคาม: 'ภาคตะวันออกเฉียงเหนือ',
  กาฬสินธุ์: 'ภาคตะวันออกเฉียงเหนือ',
  ชัยภูมิ: 'ภาคตะวันออกเฉียงเหนือ',
  เลย: 'ภาคตะวันออกเฉียงเหนือ',
  หนองคาย: 'ภาคตะวันออกเฉียงเหนือ',
  หนองบัวลำภู: 'ภาคตะวันออกเฉียงเหนือ',
  บึงกาฬ: 'ภาคตะวันออกเฉียงเหนือ',
  สกลนคร: 'ภาคตะวันออกเฉียงเหนือ',
  นครพนม: 'ภาคตะวันออกเฉียงเหนือ',
  มุกดาหาร: 'ภาคตะวันออกเฉียงเหนือ',
  ยโสธร: 'ภาคตะวันออกเฉียงเหนือ',
  อำนาจเจริญ: 'ภาคตะวันออกเฉียงเหนือ',
  นครศรีธรรมราช: 'ภาคใต้',
  สุราษฎร์ธานี: 'ภาคใต้',
  สงขลา: 'ภาคใต้',
  ภูเก็ต: 'ภาคใต้',
  พังงา: 'ภาคใต้',
  กระบี่: 'ภาคใต้',
  ตรัง: 'ภาคใต้',
  พัทลุง: 'ภาคใต้',
  สตูล: 'ภาคใต้',
  ชุมพร: 'ภาคใต้',
  ระนอง: 'ภาคใต้',
  ปัตตานี: 'ภาคใต้',
  ยะลา: 'ภาคใต้',
  นราธิวาส: 'ภาคใต้'
};

function getRegionByProvinceName(thaiProvName: string): string {
  return PROVINCE_TO_SYNERGY_REGION[thaiProvName] || 'ภาคกลาง';
}

export const MoralCreditSynergyPanels: React.FC<MoralCreditSynergyPanelsProps> = ({
  activeTab,
  onSwitchTab
}) => {
  // Interactive Cross-Filtering States
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('ALL');
  const [selectedStemStatus, setSelectedStemStatus] = useState<string>('ALL');
  const [selectedCivicCity, setSelectedCivicCity] = useState<string>('ALL');
  const [civicSlopeMetric, setCivicSlopeMetric] = useState<'accidents' | 'waste' | 'bcr'>('accidents');
  const [showJsonPayload, setShowJsonPayload] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [activeSunburstRingFilter, setActiveSunburstRingFilter] = useState<1 | 2 | 3 | 'ALL'>('ALL');
  const [activeFormulaData, setActiveFormulaData] = useState<ChartFormulaData | null>(null);
  const [isFormulaDrawerOpen, setIsFormulaDrawerOpen] = useState(false);
  const [financialDrillDown, setFinancialDrillDown] = useState<'curve' | 'regional'>('curve');
  const [stemDrillDown, setStemDrillDown] = useState<'vouchers' | 'gap'>('vouchers');
  const [civicDrillDown, setCivicDrillDown] = useState<'impact' | 'pareto'>('impact');

  const openFormula = (formula: ChartFormulaData) => {
    setActiveFormulaData(formula);
    setIsFormulaDrawerOpen(true);
  };


  const handleCopyJson = (payload: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const bom = '\uFEFF';
    const csvContent =
      bom +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Data for Topic 1.1 (Financial MCWS)
  const filteredFinancialRows = useMemo(() => {
    return MORAL_CREDIT_FINANCIAL_DATA.filter((row) => {
      if (selectedRegion !== 'ALL' && !row.isBenchmark && row.region !== selectedRegion) return false;
      if (selectedRiskTier !== 'ALL' && row.tierCode !== selectedRiskTier) return false;
      return true;
    });
  }, [selectedRegion, selectedRiskTier]);

  // Filtered Data for Topic 1.2 (STEM MWAI)
  const filteredStemRows = useMemo(() => {
    return MORAL_CREDIT_STEM_DATA.filter((row) => {
      if (selectedRegion !== 'ALL' && row.region !== selectedRegion) return false;
      if (selectedStemStatus !== 'ALL' && row.statusCode !== selectedStemStatus) return false;
      return true;
    });
  }, [selectedRegion, selectedStemStatus]);

  // Filtered Data for Topic 1.3 (Civic BCR)
  const filteredCivicRows = useMemo(() => {
    return MORAL_CREDIT_CIVIC_DATA.filter((row) => {
      if (selectedCivicCity !== 'ALL' && !row.isTotalRow && row.shortCity !== selectedCivicCity) return false;
      if (selectedRegion !== 'ALL' && !row.isTotalRow && row.region !== selectedRegion) return false;
      return true;
    });
  }, [selectedCivicCity, selectedRegion]);

  // Sunburst rings for Topic 1.2
  const innerRingData = useMemo(() => STEM_SUNBURST_RINGS_DATA.filter((d) => d.ringLevel === 1), []);
  const middleRingData = useMemo(() => STEM_SUNBURST_RINGS_DATA.filter((d) => d.ringLevel === 2), []);
  const outerRingData = useMemo(() => STEM_SUNBURST_RINGS_DATA.filter((d) => d.ringLevel === 3), []);

  // 3D Map Coloring for Topic 1.2 (STEM Access & Learning Desert)
  const getStemMapProvinceFill = (id: string, name: string): string => {
    const thName = getProvinceThaiName(id, name);
    const regionName = getRegionByProvinceName(thName);
    const regionRow = MORAL_CREDIT_STEM_DATA.find((r) => r.region === regionName);
    if (!regionRow) return '#cbd5e1';
    if (selectedRegion !== 'ALL' && selectedRegion !== regionName) {
      return '#e2e8f0';
    }
    return regionRow.statusColor;
  };

  const stemMapRegionalDialogs = useMemo(() => {
    return [
      {
        regionKey: 'Bangkok',
        name: 'กทม. และปริมณฑล',
        score: 'MWAI 0.576',
        tier: 'สูงสุด • 28 ศูนย์วิทย์ (แลกแต้ม 55.1%)',
        color: '#059669',
        badgeBg: '#d1fae5',
        isSelected: selectedRegion === 'กรุงเทพฯ และปริมณฑล'
      },
      {
        regionKey: 'Central',
        name: 'ภาคกลาง',
        score: 'MWAI 0.295',
        tier: 'ปานกลาง • 12 ศูนย์วิทย์ (แลกแต้ม 29.9%)',
        color: '#2563eb',
        badgeBg: '#dbeafe',
        isSelected: selectedRegion === 'ภาคกลาง'
      },
      {
        regionKey: 'North',
        name: 'ภาคเหนือ',
        score: 'MWAI 0.262',
        tier: 'เฝ้าระวัง • 9 ศูนย์วิทย์ (ยากจน 135k)',
        color: '#d97706',
        badgeBg: '#fef3c7',
        isSelected: selectedRegion === 'ภาคเหนือ'
      },
      {
        regionKey: 'South',
        name: 'ภาคใต้',
        score: 'MWAI 0.201',
        tier: 'ขาดแคลน • 6 ศูนย์วิทย์ (ยากจน 110k)',
        color: '#ea580c',
        badgeBg: '#ffedd5',
        isSelected: selectedRegion === 'ภาคใต้'
      },
      {
        regionKey: 'Northeast',
        name: 'ภาคตะวันออกเฉียงเหนือ',
        score: 'MWAI 0.198',
        tier: 'Learning Desert • 7 ศูนย์วิทย์ (ปัญญา 5.15)',
        color: '#dc2626',
        badgeBg: '#fee2e2',
        isSelected: selectedRegion === 'ภาคตะวันออกเฉียงเหนือ'
      }
    ];
  }, [selectedRegion]);

  // Reset Synergy Filters
  const hasSynergyFilter =
    selectedRegion !== 'ALL' ||
    selectedRiskTier !== 'ALL' ||
    selectedStemStatus !== 'ALL' ||
    selectedCivicCity !== 'ALL';

  const resetSynergyFilters = () => {
    setSelectedRegion('ALL');
    setSelectedRiskTier('ALL');
    setSelectedStemStatus('ALL');
    setSelectedCivicCity('ALL');
  };

  // ==========================================================================
  // RENDER TOPIC 1.1: แก้หนี้ครัวเรือน & สินเชื่อฐานราก (Alternative Credit Scoring)
  // ==========================================================================
  if (activeTab === 'financial_mcws') {
    const regionalChartData = MORAL_CREDIT_FINANCIAL_DATA.filter((r) => !r.isBenchmark);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Active Cross-filter Bar */}
        {hasSynergyFilter && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '10px 16px',
              borderRadius: '12px',
              background: '#ecfdf5',
              border: '1px solid #6ee7b7'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#065f46' }}>
              <span>ตัวกรองเชื่อมโยงข้อมูล (Cross-Filter Active):</span>
              {selectedRegion !== 'ALL' && (
                <span style={{ background: '#059669', color: '#fff', padding: '3px 10px', borderRadius: '14px' }}>
                  ภูมิภาค: {selectedRegion}
                </span>
              )}
              {selectedRiskTier !== 'ALL' && (
                <span style={{ background: '#1e3a8a', color: '#fff', padding: '3px 10px', borderRadius: '14px' }}>
                  ระดับความเสี่ยง: {selectedRiskTier}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={resetSynergyFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 700,
                background: '#ffffff',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              <span>ล้างตัวกรอง</span>
            </button>
          </div>
        )}

        {/* 1. Executive KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              border: '1.5px solid #6ee7b7',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>
                งบอุดหนุนชดเชยดอกเบี้ย & ค้ำประกัน (SFIs)
              </span>
              <Landmark size={18} color="#059669" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#064e3b', marginTop: '6px' }}>
              2,000 ล้านบาท
            </div>
            <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px', fontWeight: 600 }}>
              ลดดอกเบี้ยกู้ยืม 1.0%–1.5% ต่อปี (ออมสิน / ธ.ก.ส. / บสย.)
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a' }}>
                พื้นที่เครดิตคุณธรรมสูงสุด (Prime Plus)
              </span>
              <ShieldCheck size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e3a8a', marginTop: '6px' }}>
              อีสาน: MCWS 81.92
            </div>
            <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px', fontWeight: 600 }}>
              แต้มวินัยการเงิน 880/1,000 • ชำระหนี้ตรงเวลา <strong>97.2%</strong>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                เกณฑ์มาตรฐานระดับประเทศ (National Benchmark)
              </span>
              <TrendingUp size={18} color="#059669" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
              MCWS 68.40 / 100
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
              แต้มเฉลี่ย 686 • ออม 54.8% • ชำระคืนตรงเวลา <strong>90.4%</strong>
            </div>
          </div>

          <div
            style={{
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.06)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>
                พื้นที่เฝ้าระวังวินัยการเงิน (Subprime Trap)
              </span>
              <AlertTriangle size={18} color="#dc2626" />
            </div>
            <div style={{ fontSize: '23px', fontWeight: 900, color: '#b91c1c', marginTop: '6px' }}>
              กทม. & ปริมณฑล: 55.05
            </div>
            <div style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px', fontWeight: 600 }}>
              หนี้บริโภคสูงสุด 7,158 บาท/ครัวเรือน • ชำระคืน 81.6%
            </div>
          </div>
        </div>

        {/* 2. Data Synergy Sources & Statistical Model Equations */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Left: Dataset Synergy Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px',
              boxShadow: '0 2px 10px rgba(15,23,42,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Database size={18} color="#1e3a8a" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                1) ชุดข้อมูลบูรณาการ (Data Synergy Sources)
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#eff6ff', borderLeft: '4px solid #1e3a8a' }}>
                <strong style={{ color: '#1e3a8a' }}>ข้อมูลภายใน (Moral Credit Platform):</strong>
                <div style={{ marginTop: '4px', lineHeight: 1.55 }}>
                  สถิติการบันทึกความดีด้านวินัยการเงิน (การทำบัญชีครัวเรือน, ความสม่ำเสมอในการออมสัจจะ, การชำระหนี้กองทุนชุมชนตรงเวลา เต็ม 1,000 แต้ม) และประวัติการแลกแต้มเพื่อขอสินเชื่อ/ลดดอกเบี้ย
                </div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#ecfdf5', borderLeft: '4px solid #059669' }}>
                <strong style={{ color: '#065f46' }}>คลังข้อมูลสถิติระดับประเทศ (External National Datasets):</strong>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li><strong>สำนักงานสถิติแห่งชาติ & สศช.:</strong> ภาวะหนี้สินครัวเรือนเพื่อการอุปโภคบริโภคเฉลี่ยรายจังหวัด (4,431–7,158 บาท/ครัวเรือน)</li>
                  <li><strong>TPMAP (ระบบบริหารจัดการข้อมูลการพัฒนาคนแบบชี้เป้า):</strong> สัดส่วนครัวเรือนที่มีเงินออม (42.5%–68.4%) และประชากรเดไซล์รายได้ 1–3</li>
                  <li><strong>ศูนย์คุณธรรม (Moral Survey):</strong> ดัชนีคุณธรรมด้านพอเพียงรายภูมิภาค (Sufficiency Score สเกล 1.00–5.00)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Statistical Equations & Rationale Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
              borderRadius: '16px',
              padding: '18px 20px',
              color: '#ffffff',
              boxShadow: '0 6px 18px rgba(30, 58, 138, 0.18)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={18} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                  2) สมการทางสถิติและเหตุผลในการเลือกใช้ (Statistical Models)
                </h3>
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc', padding: '3px 9px', borderRadius: '12px', fontWeight: 700 }}>
                Logistic Credit Scoring
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.14)' }}>
                <div style={{ fontSize: '12px', color: '#93c5fd', fontWeight: 700 }}>
                  สมการที่ 1: คะแนนความน่าเชื่อถือทางพฤติกรรมคุณธรรม (Moral Credit Worthiness Score: MCWS)
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '13.5px', fontWeight: 800, color: '#fef08a', marginTop: '5px', letterSpacing: '0.2px' }}>
                  MCWS = w₁(Moral_Points/10) + w₂(Sufficiency/6 × 100) + w₃(Saving_Rate)
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.14)' }}>
                <div style={{ fontSize: '12px', color: '#6ee7b7', fontWeight: 700 }}>
                  สมการที่ 2: แบบจำลองโลจิสติกทำนายโอกาสการไม่ผิดนัดชำระหนี้ (Probability of Non-Default)
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 800, color: '#ffffff', marginTop: '5px' }}>
                  P(Non-Default) = 1 / [ 1 + e^(-(β₀ + β₁·MCWS + β₂·Saving_Rate + ε)) ]
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: '#e2e8f0', lineHeight: 1.55, marginTop: '2px' }}>
                <strong style={{ color: '#7dd3fc' }}>เหตุผลเชิงนโยบาย:</strong> ประชากรฐานรากติดกับดักขาดหลักทรัพย์ค้ำประกัน (Collateral Trap) การใช้ตัวแปรเชิงพฤติกรรม (<strong>MCWS</strong> และ <strong>Saving_Rate</strong>) แทนที่สินทรัพย์ถาวร ช่วยให้สถาบันการเงินเฉพาะกิจของรัฐ (SFIs) ประเมินความเสี่ยงจริงจากวินัยการเงินและดึงครัวเรือนออกจากหนี้นอกระบบโดยไม่เพิ่ม NPL
              </div>
            </div>
          </div>
        </div>

        {/* 3. Charts Row: Credit Frontier ROC/Decile Curve + Regional MCWS Comparison (Senior-Friendly Drill Down) */}
        <div style={{ marginBottom: '20px' }}>
          <SeniorDrillDownChartCard
            title="เส้นพรมแดนเครดิตคุณธรรมและการชำระหนี้ (Credit Frontier & Repayment by Deciles D1–D10)"
            titleIcon={<Landmark size={22} />}
            headlineMetric="MCWS 78.4"
            metricLabel="ลดดอกเบี้ย 1.25% • ชำระหนี้ตรงเวลา 94.8% (+8.8% vs เกณฑ์เดิม)"
            description="เปรียบเทียบอัตราการชำระหนี้ตรงเวลา (เส้นสีเขียว) กับเกณฑ์สินเชื่อดั้งเดิมและอัตราหนี้เสีย NPL หรือเปิดดูกราฟต้นทางรายภูมิภาค"
            themeColor="blue"
            formulaData={FORMULA_MORAL_CREDIT_MCWS}
            onOpenFormulaModal={openFormula}
            renderMainChart={() => (
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={CREDIT_FRONTIER_DECILE_CURVE} margin={{ top: 10, right: 18, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="decile" tick={{ fontSize: 13, fontWeight: 700, fill: '#334155' }} />
                    <YAxis
                      yAxisId="left"
                      domain={[50, 100]}
                      unit="%"
                      tick={{ fontSize: 12, fill: '#059669' }}
                      label={{ value: 'อัตราชำระหนี้ตรงเวลา (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#059669', fontWeight: 700 } }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 40]}
                      unit="%"
                      tick={{ fontSize: 12, fill: '#dc2626' }}
                      label={{ value: 'อัตราผิดนัดชำระหนี้ NPL (%)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#dc2626', fontWeight: 700 } }}
                    />
                    <RechartsTooltip
                      formatter={(val: unknown, name: unknown) => [`${Number(val)}%`, String(name)]}
                      labelFormatter={(label) => {
                        const found = CREDIT_FRONTIER_DECILE_CURVE.find((d) => d.decile === label);
                        return found
                          ? `กลุ่มคะแนน ${found.decile} (MCWS ${found.mcwsRange} คะแนน) • แนะนำลดดอกเบี้ย ${found.recommendedInterestReductionPct}%`
                          : String(label);
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '6px' }} />
                    <ReferenceLine yAxisId="left" y={90.4} stroke="#1e3a8a" strokeDasharray="4 4" label={{ value: 'Benchmark ชาติ 90.4%', position: 'insideTopLeft', fill: '#1e3a8a', fontSize: 11, fontWeight: 700 }} />
                    <Bar yAxisId="right" dataKey="defaultRatePct" name="อัตราผิดนัดชำระหนี้ NPL (%)" fill="#fca5a5" radius={[5, 5, 0, 0]} barSize={24} />
                    <Line yAxisId="left" type="monotone" dataKey="repaymentRateTraditional" name="เกณฑ์สินเชื่อดั้งเดิม (%)" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                    <Line yAxisId="left" type="monotone" dataKey="repaymentRateMoralCredit" name="ผู้ถือแต้ม Moral Credit (%)" stroke="#059669" strokeWidth={3.5} dot={{ r: 5, fill: '#059669' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
            subCharts={[
              {
                id: 'regional',
                buttonLabel: 'ดูกราฟต้นทาง: สถิติรายภูมิภาค (MCWS & หนี้บริโภค)',
                buttonIcon: <TrendingUp size={16} />,
                title: 'ข้อมูลต้นทาง: เปรียบเทียบคะแนน MCWS กับหนี้บริโภคและอัตราชำระหนี้รายภูมิภาค',
                description: 'คลิกที่แท่งภูมิภาคเพื่อกรองข้อมูลตาราง (ภาคอีสานและเหนือมี MCWS สูงสุด สวนทางหนี้บริโภคต่ำ)',
                renderChart: () => (
                  <div style={{ width: '100%', height: '310px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={regionalChartData}
                        margin={{ top: 10, right: 18, left: 0, bottom: 5 }}
                        onClick={(state) => {
                          if (state && state.activeLabel) {
                            const clickedReg = String(state.activeLabel);
                            setSelectedRegion((prev) => (prev === clickedReg ? 'ALL' : clickedReg));
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="region" tick={{ fontSize: 12, fontWeight: 700, fill: '#1e293b' }} />
                        <YAxis
                          yAxisId="left"
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: '#1e3a8a' }}
                          label={{ value: 'MCWS & อัตราชำระคืน (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#1e3a8a', fontWeight: 700 } }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 8500]}
                          tick={{ fontSize: 12, fill: '#dc2626' }}
                          label={{ value: 'หนี้บริโภค (บาท/ครัวเรือน)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#dc2626', fontWeight: 700 } }}
                        />
                        <RechartsTooltip />
                        <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '6px' }} />
                        <Bar yAxisId="left" dataKey="mcwsScore" name="คะแนนเครดิตคุณธรรม (MCWS 0-100)" radius={[6, 6, 0, 0]} barSize={32} style={{ cursor: 'pointer' }}>
                          {regionalChartData.map((entry) => (
                            <Cell
                              key={entry.region}
                              fill={entry.riskColor}
                              opacity={selectedRegion === 'ALL' || selectedRegion === entry.region ? 1 : 0.35}
                            />
                          ))}
                        </Bar>
                        <Line yAxisId="left" type="monotone" dataKey="repaymentRatePct" name="คาดการณ์ชำระหนี้ตรงเวลา (%)" stroke="#059669" strokeWidth={3} dot={{ r: 5, fill: '#059669' }} />
                        <Line yAxisId="right" type="monotone" dataKey="consumerDebtThb" name="หนี้อุปโภคบริโภค (บาท/ครัวเรือน)" stroke="#dc2626" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4, fill: '#dc2626' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )
              }
            ]}
          />
        </div>

        {/* 4. Sankey Flow Diagram: กิจกรรมบันทึกความดี -> แต้มสะสม Moral Credit -> สินเชื่อดอกเบี้ยต่ำ SFIs -> ลดหนี้นอกระบบ */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(15,23,42,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
                กราฟที่ 3: ผังกระแสการแปลงผลสัมฤทธิ์ทางเศรษฐกิจ (Sankey Behavioral-to-Credit Conversion Flow)
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#475569' }}>
                แสดงกลไกการเปลี่ยน “พฤติกรรมวินัยการเงินและความพอเพียง” → “คะแนนเครดิตคุณธรรม (MCWS)” → “สินเชื่อดอกเบี้ยต่ำ SFIs” → “มูลค่าหนี้นอกระบบที่ลดลงได้จริง”
              </p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, background: '#eff6ff', color: '#1e3a8a', padding: '5px 12px', borderRadius: '14px' }}>
              Sankey Policy Value Chain (4 Stages)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              alignItems: 'stretch'
            }}
          >
            {FINANCIAL_SANKEY_FLOW_STAGES.map((stage, idx) => (
              <div
                key={stage.stageOrder}
                style={{
                  background: '#f8fafc',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative'
                }}
              >
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>{stage.stageTitle}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>{stage.stageSubtitle}</div>
                </div>

                {stage.nodes.map((node) => (
                  <div
                    key={node.label}
                    style={{
                      background: '#ffffff',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      borderLeft: `5px solid ${node.color}`,
                      boxShadow: '0 2px 6px rgba(15,23,42,0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>{node.label}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#ffffff',
                          background: node.color,
                          padding: '2px 7px',
                          borderRadius: '10px'
                        }}
                      >
                        {node.sharePct}%
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: node.color, marginTop: '4px' }}>
                      {node.metricValue}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>
                      {node.detail}
                    </div>
                    {/* Proportional Flow Bar */}
                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '4px', marginTop: '7px', overflow: 'hidden' }}>
                      <div style={{ width: `${node.sharePct}%`, height: '100%', background: node.color }} />
                    </div>
                  </div>
                ))}

                {idx < FINANCIAL_SANKEY_FLOW_STAGES.length - 1 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: '4px',
                      color: '#1e3a8a',
                      fontSize: '11.5px',
                      fontWeight: 700
                    }}
                  >
                    <span>ส่งต่อผลสัมฤทธิ์</span>
                    <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 5. Processed Dataset Table & JSON/CSV Export */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(15,23,42,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
                ตารางชุดข้อมูลที่ผ่านการประมวลผลพร้อมใช้งาน: หัวข้อ 1.1 แก้หนี้ครัวเรือนและสินเชื่อฐานราก (MCWS)
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                คลิกที่แถวตารางหรือปุ่มระดับความเสี่ยงด้านล่างเพื่อ Cross-filter ข้อมูลระหว่างกราฟและตาราง
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowJsonPayload((prev) => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: showJsonPayload ? '#1e3a8a' : '#e0f2fe',
                  color: showJsonPayload ? '#ffffff' : '#034a75',
                  border: '1px solid #bae6fd'
                }}
              >
                <Code2 size={15} />
                <span>{showJsonPayload ? 'ซ่อน JSON Spec' : 'ดู JSON Spec (/api/v1/moral-credit/financial)'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownloadCsv(
                    'moral_credit_1_1_financial_mcws.csv',
                    [
                      'ภูมิภาค',
                      'แต้มวินัยการเงินเฉลี่ย (เต็ม 1000)',
                      'ดัชนีคุณธรรมพอเพียง (เต็ม 5)',
                      'สัดส่วนครัวเรือนมีเงินออม (%)',
                      'หนี้เพื่อการอุปโภคบริโภค (บาท/ครัวเรือน)',
                      'คะแนนเครดิตคุณธรรม (MCWS 0-100)',
                      'คาดการณ์อัตราชำระหนี้ตรงเวลา (%)',
                      'กลุ่มระดับความเสี่ยง (Credit Risk Tier)'
                    ],
                    MORAL_CREDIT_FINANCIAL_DATA.map((r) => [
                      r.region,
                      r.moralPoints,
                      r.sufficiencyScore,
                      r.savingRatePct,
                      r.consumerDebtThb,
                      r.mcwsScore,
                      r.repaymentRatePct,
                      r.tierLabel
                    ])
                  )
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  border: '1px solid #1e3a8a'
                }}
              >
                <Download size={15} />
                <span>ส่งออก CSV</span>
              </button>
            </div>
          </div>

          {/* Tier Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {[
              { code: 'ALL', label: 'ทุกกลุ่มความเสี่ยง (All Tiers)' },
              { code: 'Prime_Plus', label: 'Prime Plus (ความน่าเชื่อถือสูงมาก)' },
              { code: 'Prime', label: 'Prime (ความน่าเชื่อถือสูง)' },
              { code: 'Near_Prime', label: 'Near Prime (ปานกลาง)' },
              { code: 'Subprime', label: 'Subprime (เฝ้าระวังวินัยการเงิน)' }
            ].map((pill) => {
              const isAct = selectedRiskTier === pill.code;
              return (
                <button
                  key={pill.code}
                  type="button"
                  onClick={() => setSelectedRiskTier(isAct ? 'ALL' : pill.code)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: isAct ? 700 : 600,
                    cursor: 'pointer',
                    backgroundColor: isAct ? '#1e3a8a' : '#e0f2fe',
                    color: isAct ? '#ffffff' : '#034a75',
                    border: '1px solid #bae6fd'
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* JSON Payload Viewer */}
          {showJsonPayload && (
            <div
              style={{
                background: '#0f172a',
                color: '#e2e8f0',
                padding: '14px 16px',
                borderRadius: '12px',
                marginBottom: '14px',
                fontFamily: 'monospace',
                fontSize: '12px',
                overflowX: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                  GET /api/v1/moral-credit/financial — Ready-to-Use JSON Payload
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyJson(MORAL_CREDIT_FINANCIAL_JSON_SPEC)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: '#1e3a8a',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11.5px',
                    cursor: 'pointer'
                  }}
                >
                  {copiedJson ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedJson ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}</span>
                </button>
              </div>
              <pre style={{ margin: 0 }}>{JSON.stringify(MORAL_CREDIT_FINANCIAL_JSON_SPEC, null, 2)}</pre>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>ภูมิภาค</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>แต้มวินัยการเงินเฉลี่ย (เต็ม 1,000)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ดัชนีคุณธรรมพอเพียง (เต็ม 5)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>สัดส่วนครัวเรือนมีเงินออม (%)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>หนี้เพื่อการอุปโภคบริโภค (บาท/ครัวเรือน)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>คะแนนเครดิตคุณธรรม (MCWS 0-100)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>คาดการณ์อัตราชำระหนี้ตรงเวลา (%)</th>
                  <th style={{ padding: '10px 12px' }}>กลุ่มระดับความเสี่ยง (Credit Risk Tier)</th>
                </tr>
              </thead>
              <tbody>
                {filteredFinancialRows.map((row) => {
                  const isSelected = selectedRegion === row.region;
                  return (
                    <tr
                      key={row.region}
                      onClick={() => {
                        if (!row.isBenchmark) {
                          setSelectedRegion((prev) => (prev === row.region ? 'ALL' : row.region));
                        }
                      }}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: row.isBenchmark ? '#f8fafc' : isSelected ? '#eff6ff' : '#ffffff',
                        fontWeight: row.isBenchmark ? 800 : 500,
                        cursor: row.isBenchmark ? 'default' : 'pointer'
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{row.region}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#1e3a8a' }}>
                        {row.moralPoints.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>
                        {row.sufficiencyScore.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {row.savingRatePct.toFixed(1)}%
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                        {row.consumerDebtThb.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: row.riskColor }}>
                        {row.mcwsScore.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                        {row.repaymentRatePct.toFixed(1)}%
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 800,
                            backgroundColor: row.badgeBg,
                            color: row.riskColor
                          }}
                        >
                          {row.tierLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Empirical Policy Analysis & Targeted Budget Allocation */}
        <div
          style={{
            background: 'linear-gradient(90deg, #ecfdf5 0%, #eff6ff 100%)',
            borderRadius: '16px',
            border: '1.5px solid #6ee7b7',
            padding: '18px 22px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Target size={20} color="#059669" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#064e3b' }}>
              บทวิเคราะห์ข้อมูลเชิงประจักษ์ & การชี้เป้าจัดสรรงบประมาณแผ่นดิน (Targeted Budgeting: 2,000 ล้านบาท)
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px', fontSize: '13px', color: '#1e293b', lineHeight: 1.6 }}>
            <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <strong style={{ color: '#059669' }}>ข้อค้นพบเชิงประจักษ์ (Empirical Findings):</strong>
              <p style={{ margin: '6px 0 0 0' }}>
                ประชาชนใน <strong>ภาคตะวันออกเฉียงเหนือ</strong> และ <strong>ภาคเหนือ</strong> มีหนี้เพื่อการอุปโภคบริโภคต่ำที่สุด (4,431 และ 5,171 บาท/ครัวเรือน) และมีดัชนีความพอเพียงรวมถึงวินัยการออมสูงสุด ส่งผลให้คะแนนเครดิตคุณธรรม (<strong>MCWS</strong>) พุ่งสูงถึง <strong>81.92</strong> และ <strong>77.34 คะแนน</strong> คาดการณ์อัตราการชำระหนี้ตรงเวลาสูงถึง <strong>95.8%–97.2%</strong> ในขณะที่ <strong>กรุงเทพฯ และปริมณฑล</strong> มีหนี้บริโภคสูงสุด (7,158 บาท) และมีแต้มวินัยการเงินต่ำสุด (MCWS 55.05)
              </p>
            </div>
            <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #93c5fd' }}>
              <strong style={{ color: '#1e3a8a' }}>ข้อเสนอแนะการจัดสรรงบประมาณ (Policy & Budget Targeting):</strong>
              <p style={{ margin: '6px 0 0 0' }}>
                เสนอให้ <strong>กระทรวงการคลัง</strong> และ <strong>ธนาคารแห่งประเทศไทย (ธปท.)</strong> จัดสรรงบประมาณชดเชยดอกเบี้ยและค้ำประกันสินเชื่อ (Interest & Credit Guarantee Subsidy) วงเงิน <strong>2,000 ล้านบาท</strong> ผ่าน <strong>ธนาคารออมสิน, ธ.ก.ส. และ บสย.</strong> เพื่อลดอัตราดอกเบี้ยเงินกู้ <strong>1.0%–1.5% ต่อปี</strong> ให้แก่ผู้ถือบัตรสวัสดิการแห่งรัฐในภาคอีสานและภาคเหนือที่มีแต้มวินัยการเงินเกินเกณฑ์โดยไม่ต้องใช้หลักทรัพย์ค้ำประกัน ส่วนพื้นที่ กทม. ควรจัดสรรงบเข้าโปรแกรมฟื้นฟูวินัยการเงิน (Debt Clinic) ก่อนปล่อยสินเชื่อใหม่
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER TOPIC 1.2: การเรียนรู้ตลอดชีวิต & ลดความเหลื่อมล้ำวิทยาศาสตร์ (MWAI)
  // ==========================================================================
  if (activeTab === 'stem_mwai') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {hasSynergyFilter && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '10px 16px',
              borderRadius: '12px',
              background: '#eff6ff',
              border: '1px solid #93c5fd'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#1e3a8a' }}>
              <span>ตัวกรองเชื่อมโยงข้อมูล (Cross-Filter Active):</span>
              {selectedRegion !== 'ALL' && (
                <span style={{ background: '#1e3a8a', color: '#fff', padding: '3px 10px', borderRadius: '14px' }}>
                  ภูมิภาค: {selectedRegion}
                </span>
              )}
              {selectedStemStatus !== 'ALL' && (
                <span style={{ background: '#dc2626', color: '#fff', padding: '3px 10px', borderRadius: '14px' }}>
                  สถานะพื้นที่: {selectedStemStatus}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={resetSynergyFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 700,
                background: '#ffffff',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              <span>ล้างตัวกรอง</span>
            </button>
          </div>
        )}

        {/* 1. Executive KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1.5px solid #93c5fd',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a' }}>
                งบอุดหนุน Science Voucher & Mobile STEM
              </span>
              <Microscope size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#1e3a8a', marginTop: '6px' }}>
              450 ล้านบาท
            </div>
            <div style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '4px', fontWeight: 600 }}>
              กระทรวง อว. ร่วมกับ กสศ. อุดหนุน อพวช. และคาราวานวิทย์
            </div>
          </div>

          <div
            style={{
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: '16px',
              padding: '16px 18px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>
                วิกฤตทะเลทรายแห่งการเรียนรู้ (Learning Desert)
              </span>
              <AlertTriangle size={18} color="#dc2626" />
            </div>
            <div style={{ fontSize: '23px', fontWeight: 900, color: '#b91c1c', marginTop: '6px' }}>
              ภาคอีสาน: MWAI 0.198
            </div>
            <div style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px', fontWeight: 600 }}>
              เด็กยากจน 220,000 คน แต่มีศูนย์เรียนรู้เพียง <strong>7 แห่ง</strong>
            </div>
          </div>

          <div
            style={{
              background: '#ecfdf5',
              border: '1.5px solid #6ee7b7',
              borderRadius: '16px',
              padding: '16px 18px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>
                ทุนชีวิต “พลังสร้างปัญญา” สูงสุดระดับประเทศ
              </span>
              <Sparkles size={18} color="#059669" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#064e3b', marginTop: '6px' }}>
              ภาคอีสาน: 4.35 / 5.00
            </div>
            <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px', fontWeight: 600 }}>
              สูงกว่าเกณฑ์มาตรฐานชาติ (Benchmark 4.86) ถึง <strong>+0.29 คะแนน</strong>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '16px',
              padding: '16px 18px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                ความเหลื่อมล้ำการเข้าถึงแหล่งเรียนรู้ (กทม. vs อีสาน/ใต้)
              </span>
              <Layers size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: '23px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
              28 แห่ง vs 6–7 แห่ง
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
              กทม. แลกแต้มได้ 55.12% • อีสาน 18.73% • ใต้ 20.09%
            </div>
          </div>
        </div>

        {/* 2. Data Synergy & Statistical Models */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Database size={18} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                1) ชุดข้อมูลบูรณาการ (Data Synergy Sources)
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#eff6ff', borderLeft: '4px solid #2563eb' }}>
                <strong style={{ color: '#1e3a8a' }}>ข้อมูลภายใน (Moral Credit Youth & Family Redemptions):</strong>
                <div style={{ marginTop: '4px', lineHeight: 1.55 }}>
                  คะแนนความดีสะสมของเด็ก เยาวชน และครอบครัว (จิตอาสา อนุรักษ์สิ่งแวดล้อม กตัญญู) และสถิติการนำแต้มไปแลกคูปองเข้าชมสวนวิทยาศาสตร์ พิพิธภัณฑ์ อพวช. ท้องฟ้าจำลอง และคอร์สทักษะดิจิทัล TK Park (รวม 171,400 ครั้ง)
                </div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#f0fdf4', borderLeft: '4px solid #059669' }}>
                <strong style={{ color: '#065f46' }}>คลังข้อมูลสถิติระดับประเทศ (External National Datasets):</strong>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li><strong>กองทุนเพื่อความเสมอภาคทางการศึกษา (กสศ.):</strong> จำนวนนักเรียนยากจนและยากจนพิเศษรายภูมิภาค (รวม 642,000 คน)</li>
                  <li><strong>ศูนย์คุณธรรม (Life Capital 4 Powers):</strong> ดัชนีทุนชีวิต 4 พลัง มิติ <em>“พลังสร้างปัญญา (Wisdom Power)”</em> ค่าเกณฑ์มาตรฐานระดับชาติ <strong>Benchmark = 4.05 / 5.00</strong></li>
                  <li><strong>TPMAP & กระทรวง อว.:</strong> ดัชนีความยากจนด้านการศึกษา และพิกัดศูนย์การเรียนรู้วิทยาศาสตร์แห่งชาติ (อพวช. 62 แห่งทั่วประเทศ)</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
              borderRadius: '16px',
              padding: '18px 20px',
              color: '#ffffff',
              boxShadow: '0 6px 18px rgba(30, 58, 138, 0.18)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={18} color="#93c5fd" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                  2) สมการทางสถิติและเหตุผลในการเลือกใช้ (MWAI & Difference Model)
                </h3>
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.18)', color: '#e0f2fe', padding: '3px 9px', borderRadius: '12px', fontWeight: 700 }}>
                Benchmark = 4.86
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
                <div style={{ fontSize: '12px', color: '#bfdbfe', fontWeight: 700 }}>
                  สมการที่ 1: ดัชนีการเข้าถึงแหล่งเรียนรู้สร้างปัญญา (Moral Wisdom Access Index: MWAI)
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 800, color: '#fef08a', marginTop: '5px' }}>
                  MWAI = (จำนวนครั้งแลกแต้มเข้าแหล่งเรียนรู้ / เด็กยากจนพิเศษ กสศ.) × (คะแนนพลังปัญญา / 4.86)
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
                <div style={{ fontSize: '12px', color: '#a7f3d0', fontWeight: 700 }}>
                  สมการที่ 2: แบบจำลองผลต่างวัดการยกระดับทุนชีวิต (Difference Wisdom Model)
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '13.5px', fontWeight: 800, color: '#ffffff', marginTop: '5px' }}>
                  ΔWisdom = α + β₁·(Moral Credit Redemptions) + β₂·(Baseline Capital) + ε
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: '#e2e8f0', lineHeight: 1.55 }}>
                <strong style={{ color: '#fde047' }}>เหตุผลเชิงนโยบาย:</strong> สมการ <strong>MWAI</strong> ถ่วงน้ำหนักด้วยค่าเกณฑ์มาตรฐานพลังสร้างปัญญาของประเทศ (<strong>4.86 คะแนน</strong>) เพื่อค้นหาพื้นที่ที่เยาวชนมีศักยภาพทางปัญญาสูงแต่ขาดแคลนโครงสร้างพื้นฐาน (<strong>Learning Desert</strong>) ช่วยชี้เป้าการส่งคาราวานวิทยาศาสตร์เคลื่อนที่ได้ตรงจุด
              </div>
            </div>
          </div>
        </div>

        {/* 3. Visualizations: 3-Ring Concentric Sunburst Chart + 3D Learning Desert Map */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Left: Multi-level Concentric Sunburst Chart (3 Rings) */}
          {/* Left: Senior Drill-Down Multi-level Sunburst Chart Card */}
          <SeniorDrillDownChartCard
            title="แผนภูมิวงแหวนหลายชั้น (Multi-level Sunburst Chart 3 วงแหวน)"
            titleIcon={<Microscope size={22} />}
            headlineMetric="3 วงแหวนปัญญา"
            metricLabel="แต้มความดี → สิทธิ์แหล่งเรียนรู้ → พลังปัญญา (+0.42 pt)"
            description="วงใน: ประเภทความดีที่เยาวชนบันทึก → วงกลาง: แหล่งเรียนรู้ที่แลกสิทธิ์ → วงนอก: การเติบโตของพลังปัญญา หรือเปิดดูกราฟต้นทางช่องว่างเด็กยากจนพิเศษ"
            themeColor="purple"
            formulaData={FORMULA_MORAL_CREDIT_MWAI}
            onOpenFormulaModal={openFormula}
            renderMainChart={() => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { key: 'ALL' as const, label: 'ครบ 3 ชั้น' },
                      { key: 1 as const, label: 'วงใน' },
                      { key: 2 as const, label: 'วงกลาง' },
                      { key: 3 as const, label: 'วงนอก' }
                    ].map((b) => (
                      <button
                        key={String(b.key)}
                        type="button"
                        onClick={() => setActiveSunburstRingFilter(b.key)}
                        style={{
                          padding: '4px 9px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: activeSunburstRingFilter === b.key ? '#1e3a8a' : '#e0f2fe',
                          color: activeSunburstRingFilter === b.key ? '#ffffff' : '#034a75',
                          border: '1px solid #bae6fd'
                        }}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ width: '100%', height: '290px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <RechartsTooltip
                        formatter={(val: unknown, name: unknown, props: { payload?: { sharePct?: number; wisdomLiftScore?: string; ringTitle?: string } }) => [
                          `${Number(val).toLocaleString()} ครั้ง (${props?.payload?.sharePct ?? 0}%) • ${props?.payload?.wisdomLiftScore ?? ''}`,
                          `${props?.payload?.ringTitle ?? ''}: ${String(name)}`
                        ]}
                      />
                      {/* Ring 1: Inner Ring (Deed Category) */}
                      <Pie
                        data={innerRingData}
                        dataKey="redemptionsCount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={22}
                        outerRadius={58}
                        paddingAngle={2}
                      >
                        {innerRingData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            opacity={activeSunburstRingFilter === 'ALL' || activeSunburstRingFilter === 1 ? 1 : 0.25}
                          />
                        ))}
                      </Pie>
                      {/* Ring 2: Middle Ring (STEM Venue Redeemed) */}
                      <Pie
                        data={middleRingData}
                        dataKey="redemptionsCount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={66}
                        outerRadius={100}
                        paddingAngle={2}
                      >
                        {middleRingData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            opacity={activeSunburstRingFilter === 'ALL' || activeSunburstRingFilter === 2 ? 1 : 0.25}
                          />
                        ))}
                      </Pie>
                      {/* Ring 3: Outer Ring (Delta Wisdom Growth) */}
                      <Pie
                        data={outerRingData}
                        dataKey="redemptionsCount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={108}
                        outerRadius={136}
                        paddingAngle={2}
                      >
                        {outerRingData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            opacity={activeSunburstRingFilter === 'ALL' || activeSunburstRingFilter === 3 ? 1 : 0.25}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Sunburst 3-Layer Legend Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {STEM_SUNBURST_RINGS_DATA.filter(
                    (item) => activeSunburstRingFilter === 'ALL' || item.ringLevel === activeSunburstRingFilter
                  ).map((item) => (
                    <div
                      key={`${item.ringLevel}-${item.name}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        borderLeft: `4px solid ${item.color}`,
                        fontSize: '13px'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: '#475569', marginRight: '6px' }}>
                          [วงที่ {item.ringLevel}]
                        </span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: item.color }}>{item.sharePct}%</span>
                        <span style={{ fontSize: '11.5px', background: '#e0f2fe', color: '#1e3a8a', padding: '1px 7px', borderRadius: '8px', fontWeight: 700 }}>
                          {item.wisdomLiftScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            subCharts={[
              {
                id: 'gap',
                buttonLabel: 'ดูกราฟต้นทาง: ช่องว่างเด็กยากจนพิเศษ (กสศ.)',
                buttonIcon: <Layers size={16} />,
                title: 'ข้อมูลต้นทาง: ช่องว่างเด็กยากจนพิเศษและการเข้าถึงปัญญารายภูมิภาค (MWAI vs Wisdom)',
                description: 'เปรียบเทียบดัชนี MWAI กับคะแนนพลังสร้างปัญญาของเด็กและเยาวชนในแต่ละภูมิภาค',
                renderChart: () => (
                  <div style={{ width: '100%', height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={MORAL_CREDIT_STEM_DATA}
                        margin={{ top: 8, right: 14, left: 0, bottom: 0 }}
                        onClick={(state) => {
                          if (state && state.activeLabel) {
                            const reg = String(state.activeLabel);
                            setSelectedRegion((prev) => (prev === reg ? 'ALL' : reg));
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="region" tick={{ fontSize: 12, fontWeight: 700 }} />
                        <YAxis yAxisId="left" domain={[0, 0.7]} tick={{ fontSize: 11, fill: '#2563eb' }} />
                        <YAxis yAxisId="right" orientation="right" domain={[4.4, 5.4]} tick={{ fontSize: 11, fill: '#059669' }} />
                        <RechartsTooltip />
                        <ReferenceLine yAxisId="right" y={4.86} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Benchmark 4.86', fill: '#dc2626', fontSize: 10, fontWeight: 700 }} />
                        <Bar yAxisId="left" dataKey="mwaiIndex" name="ดัชนีเข้าถึงปัญญา (MWAI)" barSize={26} radius={[5, 5, 0, 0]}>
                          {MORAL_CREDIT_STEM_DATA.map((entry) => (
                            <Cell key={entry.region} fill={entry.statusColor} />
                          ))}
                        </Bar>
                        <Line yAxisId="right" type="monotone" dataKey="wisdomScore" name="พลังสร้างปัญญา (เต็ม 5)" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )
              }
            ]}
          />

          {/* Right: Choropleth Heatmap with STEM Facility Overlay */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px',
              boxShadow: '0 2px 10px rgba(15,23,42,0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  กราฟที่ 2: แผนที่ความร้อนชี้เป้า “ทะเลทรายแห่งการเรียนรู้” (Choropleth Heatmap & STEM Overlay)
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  ซ้อนทับดัชนี MWAI ร่วมกับพิกัดศูนย์วิทยาศาสตร์แห่งชาติ (อพวช.) • คลิกภูมิภาคบนแผนที่เพื่อกรองตาราง
                </p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                ชี้เป้า Mobile STEM Caravan
              </span>
            </div>

            <div style={{ width: '100%', height: '420px', position: 'relative' }}>
              <Thailand3dShadedMap
                getProvinceFill={getStemMapProvinceFill}
                onProvinceClick={({ id, name }) => {
                  const thName = getProvinceThaiName(id, name);
                  const reg = getRegionByProvinceName(thName);
                  setSelectedRegion((prev) => (prev === reg ? 'ALL' : reg));
                }}
                regionalScoreDialogs={stemMapRegionalDialogs}
              />
            </div>

            {/* Regional MWAI vs Wisdom Bar/Line Mini Comparison */}
            <div style={{ width: '100%', height: '175px', marginTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={MORAL_CREDIT_STEM_DATA}
                  margin={{ top: 8, right: 14, left: 0, bottom: 0 }}
                  onClick={(state) => {
                    if (state && state.activeLabel) {
                      const reg = String(state.activeLabel);
                      setSelectedRegion((prev) => (prev === reg ? 'ALL' : reg));
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="region" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis yAxisId="left" domain={[0, 0.7]} tick={{ fontSize: 10.5, fill: '#2563eb' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[4.4, 5.4]} tick={{ fontSize: 10.5, fill: '#059669' }} />
                  <RechartsTooltip />
                  <ReferenceLine yAxisId="right" y={4.86} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Benchmark 4.86', fill: '#dc2626', fontSize: 10, fontWeight: 700 }} />
                  <Bar yAxisId="left" dataKey="mwaiIndex" name="ดัชนีเข้าถึงปัญญา (MWAI)" barSize={26} radius={[5, 5, 0, 0]}>
                    {MORAL_CREDIT_STEM_DATA.map((entry) => (
                      <Cell key={entry.region} fill={entry.statusColor} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="wisdomScore" name="พลังสร้างปัญญา (เต็ม 5)" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 4. Processed Dataset Table & JSON/CSV Export */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(15,23,42,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
                ตารางชุดข้อมูลที่ผ่านการประมวลผลพร้อมใช้งาน: หัวข้อ 1.2 การเรียนรู้ตลอดชีวิต & ลดความเหลื่อมล้ำทางวิทยาศาสตร์ (MWAI)
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                เปรียบเทียบจำนวนเด็กยากจนพิเศษ (กสศ.) การแลกแต้มความดี คะแนนพลังสร้างปัญญา (Benchmark = 4.86) และจำนวนศูนย์วิทยาศาสตร์ประจำภาค
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowJsonPayload((prev) => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: showJsonPayload ? '#1e3a8a' : '#e0f2fe',
                  color: showJsonPayload ? '#ffffff' : '#034a75',
                  border: '1px solid #bae6fd'
                }}
              >
                <Code2 size={15} />
                <span>{showJsonPayload ? 'ซ่อน JSON Spec' : 'ดู JSON Spec (/api/v1/moral-credit/stem-learning)'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownloadCsv(
                    'moral_credit_1_2_stem_mwai.csv',
                    [
                      'ภูมิภาค',
                      'เด็กยากจนพิเศษ กสศ. (คน)',
                      'การแลกแต้มแหล่งเรียนรู้ (ครั้ง)',
                      'สัดส่วนการแลกแต้ม (%)',
                      'คะแนนพลังสร้างปัญญา (เต็ม 5 / Benchmark 4.05)',
                      'ดัชนีเข้าถึงปัญญา (MWAI)',
                      'ศูนย์เรียนรู้วิทย์ประจำภาค (แห่ง)',
                      'สถานะความเหลื่อมล้ำเชิงพื้นที่'
                    ],
                    MORAL_CREDIT_STEM_DATA.map((r) => [
                      r.region,
                      r.poorStudents,
                      r.redemptions,
                      r.redemptionRatePct,
                      r.wisdomScore,
                      r.mwaiIndex,
                      r.centersCount,
                      r.statusLabel
                    ])
                  )
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  border: '1px solid #1e3a8a'
                }}
              >
                <Download size={15} />
                <span>ส่งออก CSV</span>
              </button>
            </div>
          </div>

          {showJsonPayload && (
            <div
              style={{
                background: '#0f172a',
                color: '#e2e8f0',
                padding: '14px 16px',
                borderRadius: '12px',
                marginBottom: '14px',
                fontFamily: 'monospace',
                fontSize: '12px',
                overflowX: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                  GET /api/v1/moral-credit/stem-learning — Ready-to-Use JSON Payload
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyJson(MORAL_CREDIT_STEM_JSON_SPEC)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: '#1e3a8a',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11.5px',
                    cursor: 'pointer'
                  }}
                >
                  {copiedJson ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedJson ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}</span>
                </button>
              </div>
              <pre style={{ margin: 0 }}>{JSON.stringify(MORAL_CREDIT_STEM_JSON_SPEC, null, 2)}</pre>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>ภูมิภาค</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>เด็กยากจนพิเศษ กสศ. (คน)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>การแลกแต้มแหล่งเรียนรู้ (ครั้ง)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>สัดส่วนการแลกแต้ม (%)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>พลังสร้างปัญญา (Benchmark = 4.86)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ดัชนีเข้าถึงปัญญา (MWAI)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ศูนย์เรียนรู้วิทย์ประจำภาค (แห่ง)</th>
                  <th style={{ padding: '10px 12px' }}>สถานะความเหลื่อมล้ำเชิงพื้นที่</th>
                </tr>
              </thead>
              <tbody>
                {filteredStemRows.map((row) => (
                  <tr
                    key={row.region}
                    onClick={() => setSelectedRegion((prev) => (prev === row.region ? 'ALL' : row.region))}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: selectedRegion === row.region ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{row.region}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                      {row.poorStudents.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#1e3a8a' }}>
                      {row.redemptions.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>
                      {row.redemptionRatePct.toFixed(2)}%
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: row.wisdomScore >= 4.86 ? '#059669' : '#d97706' }}>
                      {row.wisdomScore.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: row.statusColor }}>
                      {row.mwaiIndex.toFixed(3)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>
                      {row.centersCount} แห่ง
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 800,
                          backgroundColor: row.badgeBg,
                          color: row.statusColor
                        }}
                      >
                        {row.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Empirical Policy Analysis & Targeted Budget Allocation */}
        <div
          style={{
            background: 'linear-gradient(90deg, #eff6ff 0%, #fef2f2 100%)',
            borderRadius: '16px',
            border: '1.5px solid #93c5fd',
            padding: '18px 22px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Target size={20} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#1e3a8a' }}>
              บทวิเคราะห์ข้อมูลเชิงประจักษ์ & การชี้เป้าจัดสรรงบประมาณแผ่นดิน (Targeted Budgeting: 450 ล้านบาท)
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px', fontSize: '13px', color: '#1e293b', lineHeight: 1.6 }}>
            <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <strong style={{ color: '#dc2626' }}>ข้อค้นพบเชิงประจักษ์ (วิกฤตทะเลทรายแห่งการเรียนรู้):</strong>
              <p style={{ margin: '6px 0 0 0' }}>
                เยาวชนใน <strong>ภาคตะวันออกเฉียงเหนือ</strong> มีคะแนนทุนชีวิตด้าน <strong>“พลังสร้างปัญญา” สูงที่สุดในประเทศ (4.35 / 5.00)</strong> สูงกว่าเกณฑ์มาตรฐานชาติ (4.05) แต่กลับมีดัชนีการเข้าถึงแหล่งเรียนรู้ต่ำที่สุด (<strong>MWAI = 0.198</strong>) เนื่องจากมีเด็กยากจนพิเศษสูงถึง <strong>220,000 คน</strong> แต่มีศูนย์วิทยาศาสตร์รองรับการแลกแต้มเพียง <strong>7 แห่ง</strong> เช่นเดียวกับ <strong>ภาคใต้</strong> ที่มีเพียง <strong>6 แห่ง</strong> (MWAI = 0.201) สวนทางกับ กทม. ที่มีศูนย์เรียนรู้หนาแน่นถึง 28 แห่ง (MWAI = 0.576)
              </p>
            </div>
            <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #93c5fd' }}>
              <strong style={{ color: '#1e3a8a' }}>ข้อเสนอแนะการจัดสรรงบประมาณ (450 ล้านบาท):</strong>
              <p style={{ margin: '6px 0 0 0' }}>
                เสนอให้ <strong>กระทรวง อว.</strong> ร่วมกับ <strong>กสศ.</strong> จัดสรรงบประมาณ <strong>450 ล้านบาท</strong> แบ่งเป็น: (1) งบอุดหนุนค่าเข้าชมตามรายหัว (Capitation Grant) ชดเชยรายได้ให้ <strong>อพวช. และสวนวิทยาศาสตร์</strong> ตามจำนวนแต้มความดีที่เด็กยากจนนำมาแลกจริง และ (2) งบจัดตั้งหน่วย <strong>“คาราวานวิทยาศาสตร์เคลื่อนที่ (Mobile STEM Caravans)”</strong> ลงพื้นที่ภาคตะวันออกเฉียงเหนือและภาคใต้โดยตรง เพื่อปลดล็อกข้อจำกัดค่าเดินทางของครัวเรือนยากจน
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER TOPIC 1.3: วินัยพลเมือง การลดอุบัติเหตุ และการลดภาระเมือง (Civic BCR)
  // ==========================================================================
  if (activeTab === 'civic_bcr') {
    const pilotCitiesOnly = MORAL_CREDIT_CIVIC_DATA.filter((r) => !r.isTotalRow);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {hasSynergyFilter && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '10px 16px',
              borderRadius: '12px',
              background: '#f5f3ff',
              border: '1px solid #c4b5fd'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#5b21b6' }}>
              <span>ตัวกรองเชื่อมโยงข้อมูล (Cross-Filter Active):</span>
              {selectedCivicCity !== 'ALL' && (
                <span style={{ background: '#7c3aed', color: '#fff', padding: '3px 10px', borderRadius: '14px' }}>
                  เมืองนำร่อง: {selectedCivicCity}
                </span>
              )}
              {selectedRegion !== 'ALL' && (
                <span style={{ background: '#1e3a8a', color: '#fff', padding: '3px 10px', borderRadius: '14px' }}>
                  ภูมิภาค: {selectedRegion}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={resetSynergyFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 700,
                background: '#ffffff',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              <span>ล้างตัวกรอง</span>
            </button>
          </div>
        )}

        {/* 1. Executive KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
              border: '1.5px solid #c4b5fd',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6' }}>
                อัตราส่วนผลประโยชน์ต่อต้นทุนรวม (Overall BCR)
              </span>
              <TrendingUp size={18} color="#7c3aed" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#4c1d95', marginTop: '6px' }}>
              BCR = 3.98 เท่า
            </div>
            <div style={{ fontSize: '12px', color: '#6d28d9', marginTop: '4px', fontWeight: 600 }}>
              ใช้งบอุดหนุน 60.50 ลบ. → ประหยัดงบเมืองรวม <strong>241.00 ล้านบาท</strong>
            </div>
          </div>

          <div
            style={{
              background: '#ecfdf5',
              border: '1.5px solid #6ee7b7',
              borderRadius: '16px',
              padding: '16px 18px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>
                ปริมาณขยะรีไซเคิลคัดแยกต้นทาง (5 เมืองนำร่อง)
              </span>
              <CheckCircle2 size={18} color="#059669" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#064e3b', marginTop: '6px' }}>
              49,500 ตัน
            </div>
            <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px', fontWeight: 600 }}>
              ประหยัดงบกำจัดขยะ อปท. (1,200 บาท/ตัน) = <strong>59.40 ล้านบาท</strong>
            </div>
          </div>

          <div
            style={{
              background: '#eff6ff',
              border: '1.5px solid #93c5fd',
              borderRadius: '16px',
              padding: '16px 18px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a' }}>
                คดีอุบัติเหตุจราจรที่ลดลงได้จริง (Zero-Violation)
              </span>
              <ShieldCheck size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e3a8a', marginTop: '6px' }}>
              ลดลง 227 คดี (-22.9%)
            </div>
            <div style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '4px', fontWeight: 600 }}>
              ลดมูลค่าความสูญเสียทางเศรษฐกิจและแพทย์ฉุกเฉิน <strong>181.60 ล้านบาท</strong>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '16px',
              padding: '16px 18px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                เทศบาลต้นแบบความคุ้มค่าสูงสุด (Top Pilot City)
              </span>
              <Landmark size={18} color="#7c3aed" />
            </div>
            <div style={{ fontSize: '23px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
              ขอนแก่น: BCR 4.90x
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
              เชียงใหม่ 4.68x • พิษณุโลก 4.44x • สุราษฎร์ฯ 4.24x • กทม. 3.05x
            </div>
          </div>
        </div>

        {/* 2. Data Synergy & Statistical Equations */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Database size={18} color="#7c3aed" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                1) ชุดข้อมูลบูรณาการ (Data Synergy Sources)
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#f5f3ff', borderLeft: '4px solid #7c3aed' }}>
                <strong style={{ color: '#5b21b6' }}>ข้อมูลภายใน (Moral Credit Civic Discipline):</strong>
                <div style={{ marginTop: '4px', lineHeight: 1.55 }}>
                  สถิติการให้แต้มความดีด้านการปฏิบัติตามกฎจราจร (Zero-Traffic-Violation Bonus) และปริมาณขยะรีไซเคิลที่ประชาชนคัดแยกนำมาแลกแต้มส่วนลดค่าธรรมเนียมท้องถิ่น/ตั๋วรถสาธารณะ (ผู้เข้าร่วม 191,000 คน)
                </div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#ecfdf5', borderLeft: '4px solid #059669' }}>
                <strong style={{ color: '#065f46' }}>คลังข้อมูลสถิติระดับประเทศ (External National Datasets):</strong>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li><strong>สำนักงานตำรวจแห่งชาติ & กระทรวงคมนาคม:</strong> สถิติคดีอุบัติเหตุทางถนนและมูลค่าความสูญเสียทางเศรษฐกิจ (เฉลี่ย 800,000 บาท/คดีหนัก)</li>
                  <li><strong>กรมส่งเสริมการปกครองท้องถิ่น (สถ.) & อปท.:</strong> ปริมาณขยะมูลฝอยและต้นทุนงบประมาณกำจัดขยะฝังกลบ (เฉลี่ย 1,200 บาท/ตัน)</li>
                  <li><strong>ศูนย์คุณธรรม & ป.ป.ช. (ITA):</strong> ดัชนีคุณธรรมด้านวินัยและรับผิดชอบ (สเกล 1–6) และตัวชี้วัดคุณภาพบริการสาธารณะ ITA</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #3b0764 0%, #5b21b6 100%)',
              borderRadius: '16px',
              padding: '18px 20px',
              color: '#ffffff',
              boxShadow: '0 6px 18px rgba(91, 33, 182, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={18} color="#ddd6fe" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                  2) สมการทางสถิติและเหตุผลในการเลือกใช้ (BCR & Panel Fixed Effects)
                </h3>
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.18)', color: '#ede9fe', padding: '3px 9px', borderRadius: '12px', fontWeight: 700 }}>
                BCR = 3.98x
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
                <div style={{ fontSize: '12px', color: '#ddd6fe', fontWeight: 700 }}>
                  สมการที่ 1: อัตราส่วนผลประโยชน์ต่อต้นทุนทางเศรษฐศาสตร์ (Benefit-Cost Ratio: BCR)
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 800, color: '#fef08a', marginTop: '5px' }}>
                  BCR = (งบกำจัดขยะที่ประหยัดได้ + มูลค่าความเสียหายอุบัติเหตุที่ลดลง) / งบอุดหนุนแต้มความดี
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
                <div style={{ fontSize: '12px', color: '#a7f3d0', fontWeight: 700 }}>
                  สมการที่ 2: แบบจำลองข้อมูลพาเนลประเมินผลกระทบเชิงพื้นที่ (Fixed Effects Panel Regression)
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '13.5px', fontWeight: 800, color: '#ffffff', marginTop: '5px' }}>
                  Y_it = α_i + β₁·(Moral Credit Participants_it) + γ·X_it + ε_it
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: '#ede9fe', lineHeight: 1.55 }}>
                <strong style={{ color: '#fde047' }}>เหตุผลเชิงนโยบาย:</strong> สมการ <strong>BCR</strong> แปลงพฤติกรรมพลเมืองให้เป็นมูลค่าทางการคลังที่สำนักงบประมาณและ อปท. ใช้ตัดสินใจได้ทันที (BCR &gt; 1 แปลว่าคุ้มค่าลงทุน) ส่วน <strong>Fixed Effects (α_i)</strong> ขจัดอิทธิพลความแตกต่างคงที่ของแต่ละเมืองเพื่อพิสูจน์ผลสัมฤทธิ์ที่แท้จริงของแต้มความดี
              </div>
            </div>
          </div>
        </div>

        {/* 3. Charts Row: Diverging Before/After Slopegraph + 80/20 Civic Discipline Pareto Chart */}
        {/* 3. Charts Row: Senior Drill-Down Diverging Slopegraph + Civic Discipline Pareto */}
        <div style={{ marginBottom: '20px' }}>
          <SeniorDrillDownChartCard
            title="Diverging Slopegraph เปรียบเทียบก่อน–หลังใช้ระบบ Moral Credit (5 เมืองนำร่อง)"
            titleIcon={<ShieldCheck size={22} />}
            headlineMetric="BCR 3.48x"
            metricLabel="5 เมืองนำร่อง • ประหยัดงบเมืองรวม 240.8 ล้านบาท"
            description="แสดงความชันของการลดลงของคดีอุบัติเหตุและขยะฝังกลบหลังเริ่มโครงการ หรือเปิดดูกราฟต้นทาง Pareto 80/20 วินัยจราจรและพลเมือง"
            themeColor="emerald"
            formulaData={FORMULA_MORAL_CREDIT_BCR}
            onOpenFormulaModal={openFormula}
            renderMainChart={() => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {[
                      { key: 'accidents' as const, label: 'คดีอุบัติเหตุ (ก่อน vs หลัง)' },
                      { key: 'waste' as const, label: 'ขยะฝังกลบ (ตัน)' },
                      { key: 'bcr' as const, label: 'งบอุดหนุน vs ผลตอบแทน (ลบ.)' }
                    ].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setCivicSlopeMetric(m.key)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: civicSlopeMetric === m.key ? '#047857' : '#ecfdf5',
                          color: civicSlopeMetric === m.key ? '#ffffff' : '#065f46',
                          border: '1.5px solid #a7f3d0'
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ width: '100%', height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {civicSlopeMetric === 'accidents' ? (
                      <ComposedChart
                        data={pilotCitiesOnly}
                        margin={{ top: 10, right: 18, left: 0, bottom: 5 }}
                        onClick={(s) => {
                          if (s && s.activeLabel) {
                            const c = String(s.activeLabel);
                            setSelectedCivicCity((prev) => (prev === c ? 'ALL' : c));
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="shortCity" tick={{ fontSize: 13, fontWeight: 700 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#dc2626' }} label={{ value: 'จำนวนคดีอุบัติเหตุ (คดี)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#dc2626', fontWeight: 700 } }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#059669' }} label={{ value: 'จำนวนคดีที่ลดลง (คดี)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#059669', fontWeight: 700 } }} />
                        <RechartsTooltip />
                        <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '6px' }} />
                        <Bar yAxisId="left" dataKey="accidentsBeforeCases" name="ก่อนเริ่ม Moral Credit (คดี)" fill="#94a3b8" radius={[5, 5, 0, 0]} barSize={24} />
                        <Bar yAxisId="left" dataKey="accidentsAfterCases" name="หลังเริ่ม Moral Credit (คดี)" fill="#2563eb" radius={[5, 5, 0, 0]} barSize={24} />
                        <Line yAxisId="right" type="monotone" dataKey="accidentsReducedCases" name="อุบัติเหตุที่ลดลงได้จริง (คดี)" stroke="#059669" strokeWidth={3.5} dot={{ r: 5, fill: '#059669' }} />
                      </ComposedChart>
                    ) : civicSlopeMetric === 'waste' ? (
                      <ComposedChart
                        data={pilotCitiesOnly}
                        margin={{ top: 10, right: 18, left: 0, bottom: 5 }}
                        onClick={(s) => {
                          if (s && s.activeLabel) {
                            const c = String(s.activeLabel);
                            setSelectedCivicCity((prev) => (prev === c ? 'ALL' : c));
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="shortCity" tick={{ fontSize: 13, fontWeight: 700 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#475569' }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#059669' }} />
                        <RechartsTooltip />
                        <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '6px' }} />
                        <Bar yAxisId="left" dataKey="landfillBeforeTons" name="ขยะฝังกลบก่อนโครงการ (ตัน)" fill="#94a3b8" radius={[5, 5, 0, 0]} barSize={24} />
                        <Bar yAxisId="left" dataKey="landfillAfterTons" name="ขยะฝังกลบหลังโครงการ (ตัน)" fill="#059669" radius={[5, 5, 0, 0]} barSize={24} />
                        <Line yAxisId="right" type="monotone" dataKey="recycledWasteTons" name="ขยะรีไซเคิลคัดแยกสะสมแต้ม (ตัน)" stroke="#7c3aed" strokeWidth={3.5} dot={{ r: 5, fill: '#7c3aed' }} />
                      </ComposedChart>
                    ) : (
                      <ComposedChart
                        data={pilotCitiesOnly}
                        margin={{ top: 10, right: 18, left: 0, bottom: 5 }}
                        onClick={(s) => {
                          if (s && s.activeLabel) {
                            const c = String(s.activeLabel);
                            setSelectedCivicCity((prev) => (prev === c ? 'ALL' : c));
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="shortCity" tick={{ fontSize: 13, fontWeight: 700 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#1e3a8a' }} label={{ value: 'มูลค่าทางการคลัง (ล้านบาท)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#1e3a8a', fontWeight: 700 } }} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 6]} tick={{ fontSize: 12, fill: '#7c3aed' }} label={{ value: 'ความคุ้มค่า BCR (เท่า)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#7c3aed', fontWeight: 700 } }} />
                        <RechartsTooltip />
                        <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '6px' }} />
                        <ReferenceLine yAxisId="right" y={1.0} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'จุดคุ้มทุน BCR = 1.0x', fill: '#dc2626', fontSize: 11, fontWeight: 700 }} />
                        <Bar yAxisId="left" dataKey="subsidyCostMthb" name="งบอุดหนุนแต้มความดี (ล้านบาท)" fill="#94a3b8" radius={[5, 5, 0, 0]} barSize={24} />
                        <Bar yAxisId="left" dataKey="totalBenefitMthb" name="งบเมืองที่ประหยัดได้รวม (ล้านบาท)" fill="#059669" radius={[5, 5, 0, 0]} barSize={24} />
                        <Line yAxisId="right" type="monotone" dataKey="bcrRatio" name="อัตราส่วนความคุ้มค่า (BCR เท่า)" stroke="#7c3aed" strokeWidth={3.5} dot={{ r: 5, fill: '#7c3aed' }} />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            subCharts={[
              {
                id: 'pareto',
                buttonLabel: 'ดูกราฟต้นทาง: Pareto 80/20 วินัยจราจรและพลเมือง',
                buttonIcon: <Layers size={16} />,
                title: 'ข้อมูลต้นทาง: กราฟพาเรโต้ 80/20 พฤติกรรมวินัยพลเมืองที่ลดภาระงบประมาณเมืองสูงสุด',
                description: '2 พฤติกรรมหลัก (ไร้ใบสั่งจราจร + คัดแยกขยะต้นทาง) สร้างผลประหยัดงบประมาณเมืองรวมถึง 80.2% (193.20 ล้านบาท)',
                renderChart: () => (
                  <div style={{ width: '100%', height: '310px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={CIVIC_DISCIPLINE_PARETO_DATA} margin={{ top: 10, right: 18, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="shortBehavior" tick={{ fontSize: 12, fontWeight: 700 }} />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 12, fill: '#1e3a8a' }}
                          label={{ value: 'งบเมืองที่ประหยัดได้ (ล้านบาท)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#1e3a8a', fontWeight: 700 } }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 105]}
                          unit="%"
                          tick={{ fontSize: 12, fill: '#dc2626' }}
                          label={{ value: 'ผลกระทบสะสม (%)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#dc2626', fontWeight: 700 } }}
                        />
                        <RechartsTooltip />
                        <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '6px' }} />
                        <ReferenceLine yAxisId="right" y={80} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'เกณฑ์ Pareto 80%', fill: '#dc2626', fontSize: 11, fontWeight: 700 }} />
                        <Bar yAxisId="left" dataKey="municipalCostSavedMthb" name="มูลค่างบเมืองที่ประหยัดได้ (ล้านบาท)" radius={[6, 6, 0, 0]} barSize={32}>
                          {CIVIC_DISCIPLINE_PARETO_DATA.map((item) => (
                            <Cell key={item.shortBehavior} fill={item.isTop20Core ? '#7c3aed' : '#94a3b8'} />
                          ))}
                        </Bar>
                        <Line yAxisId="right" type="monotone" dataKey="cumulativeImpactPct" name="สัดส่วนผลประหยัดสะสม (%)" stroke="#dc2626" strokeWidth={3} dot={{ r: 5, fill: '#dc2626' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )
              }
            ]}
          />
        </div>

        {/* 4. Processed Dataset Table & JSON/CSV Export */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(15,23,42,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
                ตารางชุดข้อมูลที่ผ่านการประมวลผลพร้อมใช้งาน: หัวข้อ 1.3 วินัยพลเมือง การลดอุบัติเหตุ และการลดภาระเมือง (BCR)
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                ข้อมูลเปรียบเทียบ 5 เทศบาลนำร่อง (ขอนแก่น, เชียงใหม่, พิษณุโลก, สุราษฎร์ธานี, กทม. 3 เขตนำร่อง) • คลิกที่แถวเพื่อกรองข้อมูล
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowJsonPayload((prev) => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: showJsonPayload ? '#1e3a8a' : '#e0f2fe',
                  color: showJsonPayload ? '#ffffff' : '#034a75',
                  border: '1px solid #bae6fd'
                }}
              >
                <Code2 size={15} />
                <span>{showJsonPayload ? 'ซ่อน JSON Spec' : 'ดู JSON Spec (/api/v1/moral-credit/civic-burden)'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownloadCsv(
                    'moral_credit_1_3_civic_bcr.csv',
                    [
                      'พื้นที่เทศบาลนำร่อง',
                      'ผู้เข้าร่วมสะสมแต้ม (คน)',
                      'ปริมาณขยะรีไซเคิลคัดแยก (ตัน)',
                      'งบกำจัดขยะที่ประหยัดได้ (ล้านบาท)',
                      'อุบัติเหตุที่ลดลง (คดี)',
                      'มูลค่าความสูญเสียอุบัติเหตุที่ลดได้ (ล้านบาท)',
                      'งบอุดหนุนแต้มความดี (ล้านบาท)',
                      'ความคุ้มค่าทางเศรษฐศาสตร์ (BCR เท่า)'
                    ],
                    MORAL_CREDIT_CIVIC_DATA.map((r) => [
                      r.municipality,
                      r.participants,
                      r.recycledWasteTons,
                      r.wasteBudgetSavedMthb,
                      r.accidentsReducedCases,
                      r.accidentCostSavedMthb,
                      r.subsidyCostMthb,
                      r.bcrRatio
                    ])
                  )
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  border: '1px solid #1e3a8a'
                }}
              >
                <Download size={15} />
                <span>ส่งออก CSV</span>
              </button>
            </div>
          </div>

          {showJsonPayload && (
            <div
              style={{
                background: '#0f172a',
                color: '#e2e8f0',
                padding: '14px 16px',
                borderRadius: '12px',
                marginBottom: '14px',
                fontFamily: 'monospace',
                fontSize: '12px',
                overflowX: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                  GET /api/v1/moral-credit/civic-burden — Ready-to-Use JSON Payload
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyJson(MORAL_CREDIT_CIVIC_JSON_SPEC)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: '#1e3a8a',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11.5px',
                    cursor: 'pointer'
                  }}
                >
                  {copiedJson ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedJson ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}</span>
                </button>
              </div>
              <pre style={{ margin: 0 }}>{JSON.stringify(MORAL_CREDIT_CIVIC_JSON_SPEC, null, 2)}</pre>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>พื้นที่เทศบาลนำร่อง</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ผู้เข้าร่วมสะสมแต้ม (คน)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ขยะรีไซเคิลคัดแยก (ตัน)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>งบกำจัดขยะที่ประหยัดได้ (ล้านบาท)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>อุบัติเหตุที่ลดลง (คดี)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ความสูญเสียอุบัติเหตุที่ลดได้ (ล้านบาท)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>งบอุดหนุนแต้มความดี (ล้านบาท)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ความคุ้มค่าทางเศรษฐศาสตร์ (BCR)</th>
                </tr>
              </thead>
              <tbody>
                {filteredCivicRows.map((row) => (
                  <tr
                    key={row.municipality}
                    onClick={() => {
                      if (!row.isTotalRow) {
                        setSelectedCivicCity((prev) => (prev === row.shortCity ? 'ALL' : row.shortCity));
                      }
                    }}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: row.isTotalRow ? '#f5f3ff' : selectedCivicCity === row.shortCity ? '#eff6ff' : '#ffffff',
                      fontWeight: row.isTotalRow ? 800 : 500,
                      cursor: row.isTotalRow ? 'default' : 'pointer'
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{row.municipality}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>
                      {row.participants.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                      {row.recycledWasteTons.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                      {row.wasteBudgetSavedMthb.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                      {row.accidentsReducedCases.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                      {row.accidentCostSavedMthb.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>
                      {row.subsidyCostMthb.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12.5px',
                          fontWeight: 900,
                          backgroundColor: '#ede9fe',
                          color: '#5b21b6'
                        }}
                      >
                        {row.bcrRatio.toFixed(2)} เท่า
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Empirical Policy Analysis & Targeted Budget Allocation */}
        <div
          style={{
            background: 'linear-gradient(90deg, #f5f3ff 0%, #ecfdf5 100%)',
            borderRadius: '16px',
            border: '1.5px solid #c4b5fd',
            padding: '18px 22px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Target size={20} color="#7c3aed" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#4c1d95' }}>
              บทวิเคราะห์ข้อมูลเชิงประจักษ์ & การชี้เป้าจัดสรรงบประมาณท้องถิ่น (Civic Moral Fund: BCR = 3.98 เท่า)
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px', fontSize: '13px', color: '#1e293b', lineHeight: 1.6 }}>
            <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #c4b5fd' }}>
              <strong style={{ color: '#5b21b6' }}>ข้อค้นพบเชิงประจักษ์ (Fiscal Return on Civic Discipline):</strong>
              <p style={{ margin: '6px 0 0 0' }}>
                การลงทุนงบประมาณอุดหนุนสิทธิประโยชน์แต้มความดีใน 5 เมืองนำร่องรวม <strong>60.50 ล้านบาท</strong> สามารถสร้างผลตอบแทนทางเศรษฐกิจและลดรายจ่ายของเมืองได้สูงถึง <strong>241.00 ล้านบาท</strong> (คิดเป็น <strong>BCR เฉลี่ย 3.98 เท่า</strong>) โดย <strong>เทศบาลนครขอนแก่น</strong> มีความคุ้มค่าสูงสุดถึง <strong>4.90 เท่า</strong> และ <strong>เทศบาลนครเชียงใหม่ 4.68 เท่า</strong> เนื่องจากความเข้มแข็งของเครือข่ายชุมชนในการคัดแยกขยะต้นทางและวินัยจราจร
              </p>
            </div>
            <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #6ee7b7' }}>
              <strong style={{ color: '#065f46' }}>ข้อเสนอแนะเชิงระเบียบงบประมาณ (กระทรวงมหาดไทย & สถ.):</strong>
              <p style={{ margin: '6px 0 0 0' }}>
                เสนอให้ <strong>กระทรวงมหาดไทย</strong> และ <strong>กรมส่งเสริมการปกครองท้องถิ่น (สถ.)</strong> ออกระเบียบอนุญาตให้องค์กรปกครองส่วนท้องถิ่น (อปท.) สามารถกันงบประมาณด้านการจัดการสิ่งแวดล้อมและงานป้องกันและบรรเทาสาธารณภัยในสัดส่วน <strong>ร้อยละ 10</strong> มาจัดตั้งเป็น <strong>“กองทุนแต้มความดีพัฒนาเมือง (Civic Moral Fund)”</strong> เพื่อเปลี่ยนงบกำจัดขยะปลายทางให้กลายเป็นสิทธิประโยชน์ส่วนลดภาษีท้องถิ่นหรือคูปองขนส่งสาธารณะแก่พลเมืองดี
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER MASTER MATRIX: ผังเชื่อมโยงเชิงยุทธศาสตร์เพื่อการตัดสินใจเชิงนโยบาย
  // ==========================================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Banner Summary */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          borderRadius: '16px',
          padding: '20px 24px',
          color: '#ffffff',
          boxShadow: '0 8px 22px rgba(30, 58, 138, 0.22)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, background: 'rgba(250, 204, 21, 0.2)', color: '#fde047', padding: '4px 12px', borderRadius: '14px' }}>
              Behavioral Data Infrastructure & Targeted Budgeting
            </span>
            <h2 style={{ margin: '10px 0 6px 0', fontSize: '20px', fontWeight: 900, color: '#ffffff' }}>
              ผังเชื่อมโยงเชิงยุทธศาสตร์เพื่อการตัดสินใจเชิงนโยบาย (Master Policy Synergy Matrix)
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', maxWidth: '920px', lineHeight: 1.6 }}>
              เปลี่ยนรายงานการบันทึกความดีของศูนย์คุณธรรมให้เป็น <strong>“โครงสร้างพื้นฐานข้อมูลพฤติกรรม (Behavioral Data Infrastructure)”</strong> ที่เชื่อมโยงกับคลังข้อมูลสถิติระดับประเทศ เพื่อชี้เป้าการจัดสรรงบประมาณแผ่นดินรวม <strong>2,510.50 ล้านบาท</strong> อย่างมีหลักฐานเชิงประจักษ์รองรับ
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'right' }}>
            <div style={{ fontSize: '11.5px', color: '#93c5fd', fontWeight: 700 }}>วงเงินงบประมาณชี้เป้ารวม 3 มิติ</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#fde047', marginTop: '2px' }}>2,510.50 ล้านบาท</div>
            <div style={{ fontSize: '11.5px', color: '#e2e8f0' }}>สินเชื่อ 2,000 ลบ. • วิทย์ 450 ลบ. • เมือง 60.50 ลบ.</div>
          </div>
        </div>
      </div>

      {/* Master Policy Synergy Matrix Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(15,23,42,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              ตารางสังเคราะห์ผังเชื่อมโยงยุทธศาสตร์ 3 มิติ (Master Policy Synergy Matrix)
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
              คลิกปุ่ม “เปิดดู Dashboard เจาะลึก” ในแต่ละแถวเพื่อสลับไปยังกราฟและชุดข้อมูลของหัวข้อนั้นทันที
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              handleDownloadCsv(
                'moral_credit_master_policy_synergy_matrix.csv',
                [
                  'กลไกขับเคลื่อน',
                  'มิติการบูรณาการเชิงยุทธศาสตร์',
                  'ข้อมูลศูนย์คุณธรรม (Internal)',
                  'ข้อมูลภายนอกที่นำมาเชื่อมโยง (External Synergy)',
                  'ตัวแปรและสมการสถิติหลัก',
                  'รูปแบบกราฟนำเสนอ',
                  'ข้อเสนอแนะเชิงนโยบายและการชี้เป้างบประมาณ',
                  'วงเงินงบประมาณ',
                  'หน่วยงานเป้าหมาย'
                ],
                MORAL_CREDIT_MASTER_POLICY_MATRIX.map((m) => [
                  m.mechanism,
                  m.strategicDimension,
                  m.internalDataset,
                  m.externalSynergyDatasets,
                  `${m.statisticalFormulaTitle}: ${m.statisticalEquationText}`,
                  m.chartPresentation,
                  m.policyAndBudgetTargeting,
                  m.budgetAmountText,
                  m.targetAgencies
                ])
              )
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              border: '1px solid #1e3a8a'
            }}
          >
            <Download size={15} />
            <span>ส่งออกผังยุทธศาสตร์ (CSV)</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', minWidth: '170px' }}>มิติการบูรณาการเชิงยุทธศาสตร์</th>
                <th style={{ padding: '10px 12px', minWidth: '210px' }}>ชุดข้อมูลภายใน & ข้อมูลภายนอก (Data Synergy)</th>
                <th style={{ padding: '10px 12px', minWidth: '220px' }}>ตัวแปรและสมการสถิติหลัก</th>
                <th style={{ padding: '10px 12px', minWidth: '170px' }}>รูปแบบกราฟนำเสนอ</th>
                <th style={{ padding: '10px 12px', minWidth: '250px' }}>การชี้เป้างบประมาณ & หน่วยงานรับผิดชอบ</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', minWidth: '130px' }}>เชื่อมโยงแดชบอร์ด</th>
              </tr>
            </thead>
            <tbody>
              {MORAL_CREDIT_MASTER_POLICY_MATRIX.map((row) => (
                <tr key={row.topicKey} style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 800, color: row.badgeColor, fontSize: '13px' }}>{row.strategicDimension}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                      กลไก: {row.mechanism}
                    </div>
                  </td>
                  <td style={{ padding: '12px', lineHeight: 1.5 }}>
                    <div><strong style={{ color: '#1e3a8a' }}>ภายใน:</strong> {row.internalDataset}</div>
                    <div style={{ marginTop: '4px' }}><strong style={{ color: '#059669' }}>ภายนอก:</strong> {row.externalSynergyDatasets}</div>
                  </td>
                  <td style={{ padding: '12px', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{row.statisticalFormulaTitle}</div>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '11.5px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        marginTop: '5px',
                        color: '#1e3a8a',
                        fontWeight: 700
                      }}
                    >
                      {row.statisticalEquationText}
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#334155', lineHeight: 1.5 }}>
                    {row.chartPresentation}
                    <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginTop: '4px' }}>
                      API: {row.apiEndpoint}
                    </div>
                  </td>
                  <td style={{ padding: '12px', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 800, color: row.badgeColor, marginBottom: '4px' }}>
                      วงเงิน: {row.budgetAmountText}
                    </div>
                    <div>{row.policyAndBudgetTargeting}</div>
                    <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px', fontWeight: 700 }}>
                      หน่วยงาน: {row.targetAgencies}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <button
                      type="button"
                      onClick={() => onSwitchTab(row.topicKey)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: '#1e3a8a',
                        color: '#ffffff',
                        border: 'none',
                        boxShadow: '0 3px 8px rgba(30, 58, 138, 0.2)'
                      }}
                    >
                      <span>เปิดดูเจาะลึก</span>
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Ingestion Schema & Cross-Filtering Architecture */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '16px'
        }}
      >
        <div
          style={{
            background: '#0f172a',
            borderRadius: '16px',
            padding: '18px 20px',
            color: '#e2e8f0'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                โครงสร้าง JSON API มาตรฐานสำหรับทีมวิศวกรข้อมูล (Data Ingestion Schema)
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopyJson({
                  endpoints: [
                    MORAL_CREDIT_FINANCIAL_JSON_SPEC,
                    MORAL_CREDIT_STEM_JSON_SPEC,
                    MORAL_CREDIT_CIVIC_JSON_SPEC
                  ]
                })
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '8px',
                background: '#1e3a8a',
                color: '#fff',
                border: 'none',
                fontSize: '11.5px',
                cursor: 'pointer'
              }}
            >
              {copiedJson ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedJson ? 'คัดลอกครบ 3 API แล้ว' : 'คัดลอก JSON ทั้ง 3 ระบบ'}</span>
            </button>
          </div>
          <pre
            style={{
              margin: 0,
              fontSize: '11.5px',
              lineHeight: 1.5,
              maxHeight: '300px',
              overflowY: 'auto',
              background: 'rgba(255,255,255,0.04)',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {JSON.stringify(
              {
                api_v1_endpoints: [
                  MORAL_CREDIT_FINANCIAL_JSON_SPEC,
                  MORAL_CREDIT_STEM_JSON_SPEC,
                  MORAL_CREDIT_CIVIC_JSON_SPEC
                ]
              },
              null,
              2
            )}
          </pre>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
            คำแนะนำในการตั้งค่า Interactive Cross-Filtering สำหรับระบบ BI ระดับบริหาร
          </h3>
          <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#eff6ff', borderLeft: '4px solid #1e3a8a', fontSize: '13px', lineHeight: 1.6 }}>
            <strong style={{ color: '#1e3a8a' }}>1. ตัวกรองเชื่อมโยงระดับภูมิภาค (Regional Cross-Filter):</strong>
            <div style={{ marginTop: '4px', color: '#334155' }}>
              เมื่อผู้บริหารคลิกเลือก <strong>“ภาคตะวันออกเฉียงเหนือ”</strong> บนแผนที่ กราฟในหัวข้อ 1.1 จะไฮไลต์กลุ่ม <strong>Prime Plus (MCWS 81.92 • ชำระหนี้ตรงเวลา 97.2%)</strong> พร้อมกันกับที่หัวข้อ 1.2 แจ้งเตือนสถานะสีแดง <strong>“วิกฤตทะเลทรายแห่งการเรียนรู้ (Learning Desert • MWAI 0.198)”</strong> และหัวข้อ 1.3 แสดงความคุ้มค่าสูงสุดของ <strong>เทศบาลนครขอนแก่น (BCR = 4.90 เท่า)</strong>
            </div>
          </div>
          <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#ecfdf5', borderLeft: '4px solid #059669', fontSize: '13px', lineHeight: 1.6 }}>
            <strong style={{ color: '#065f46' }}>2. ตัวกรองเชื่อมโยงตามกลุ่มเป้าหมายงบประมาณ (Target Group Trigger):</strong>
            <div style={{ marginTop: '4px', color: '#334155' }}>
              เชื่อมโยงรหัสพื้นที่จังหวัดและกลุ่มรายได้ (TPMAP Decile 1–3 & กสศ.) เข้ากับฐานข้อมูลสมาชิก Moral Credit เพื่อให้สำนักงบประมาณสามารถจำลองสถานการณ์ (What-if Budget Simulation) เมื่อปรับเพิ่ม/ลดวงเงินอุดหนุนดอกเบี้ยและคาราวานวิทยาศาสตร์ได้แบบเรียลไทม์
            </div>
          </div>
        </div>
      </div>
      {/* Reusable Senior-Friendly Formula Drawer */}
      <ChartFormulaDrawer
        isOpen={isFormulaDrawerOpen}
        onClose={() => setIsFormulaDrawerOpen(false)}
        data={activeFormulaData}
      />
    </div>
  );
};
