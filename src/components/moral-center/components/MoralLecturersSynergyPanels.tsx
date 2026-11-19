import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Line
} from 'recharts';
import {
  Download,
  Copy,
  Check,
  Layers,
  Sparkles
} from 'lucide-react';
import { Thailand3dShadedMap, getProvinceThaiName } from './Thailand3dShadedMap';
import { ChartFormulaDrawer, type ChartFormulaData } from './ChartFormulaDrawer';
import { ChartDrillDownToolbar } from './ChartDrillDownToolbar';
import { SeniorDrillDownChartCard } from './SeniorDrillDownChartCard';
import {
  FORMULA_MORAL_LECTURERS_DENSITY,
  FORMULA_MORAL_LECTURERS_CBI,
  FORMULA_MORAL_LECTURERS_SUPPLY_DEMAND,
  FORMULA_MORAL_LECTURERS_IIDI,
  FORMULA_MORAL_LECTURERS_SUFFICIENCY_QUADRANT,
  FORMULA_MORAL_LECTURERS_DISCIPLINE_GAP,
  FORMULA_MORAL_CITY_AGING_SSI,
  FORMULA_MORAL_CITY_YOUTH_YTRI
} from '../data/moralDashboardFormulas';
import { MDC_PROVINCE_STATS_MAP } from '../data/moralLecturersData';
import {
  type SynergyAspectKey,
  SYNERGY_INTEGRITY_TABLE,
  INTEGRITY_SKILL_MISMATCH_DATA,
  SYNERGY_SUFFICIENCY_TABLE,
  SUFFICIENCY_CONTENT_PROFILE_DONUT,
  SYNERGY_DISCIPLINE_TABLE,
  DISCIPLINE_5_SUBDIMENSIONS_RADAR,
  NHRC_COMPLAINTS_BREAKDOWN,
  SYNERGY_GRATITUDE_TABLE,
  GRATITUDE_INTERGENERATIONAL_GAP_BY_REGION,
  SYNERGY_LIFECAPITAL_TABLE,
  LIFECAPITAL_4PILLARS_RADAR,
  YOUTH_TARGET_GROUP_COVERAGE,
  MASTER_POLICY_SYNERGY_MATRIX,
  MASTER_BUDGET_REALLOCATION_MATRIX,
  BI_READY_MASTER_DATASET,
  PYTHON_DATA_CONNECTOR_CODE
} from '../data/moralLecturersSynergyData';

interface MoralLecturersSynergyPanelsProps {
  activeAspect: Exclude<SynergyAspectKey, 'overview'>;
  onSelectAspect: (aspect: SynergyAspectKey) => void;
}

export const MoralLecturersSynergyPanels: React.FC<MoralLecturersSynergyPanelsProps> = ({
  activeAspect,
  onSelectAspect
}) => {
  const [selectedMapProv, setSelectedMapProv] = useState<string>('กรุงเทพมหานคร');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [selectedFormula, setSelectedFormula] = useState<ChartFormulaData | null>(null);
  const [integrityDrillDown, setIntegrityDrillDown] = useState<'map' | 'cri' | 'mismatch'>('map');
  const [sufficiencyDrillDown, setSufficiencyDrillDown] = useState<'scatter' | 'donut' | 'urban'>('scatter');
  const [disciplineDrillDown, setDisciplineDrillDown] = useState<'dumbbell' | 'radar' | 'nhrc'>('dumbbell');
  const [gratitudeDrillDown, setGratitudeDrillDown] = useState<'bubble' | 'gap'>('bubble');
  const [lifeCapitalDrillDown, setLifeCapitalDrillDown] = useState<'scatter' | 'radar' | 'targets'>('scatter');

  // Download BI-ready CSV helper
  const handleDownloadBiCsv = () => {
    const headers = [
      'region',
      'sufficiency_score',
      'discipline_score',
      'integrity_score',
      'public_mind_score',
      'consumer_debt_baht',
      'nacc_cases',
      'procurement_fraud_pct',
      'ita_ind9_scaled',
      'discipline_ita_gap',
      'youth_unemployment_pct',
      'elderly_pop_60up',
      'procurement_risk_tier'
    ];
    const rows = BI_READY_MASTER_DATASET.map((r) =>
      [
        `"${r.region}"`,
        r.sufficiency_score,
        r.discipline_score,
        r.integrity_score,
        r.public_mind_score,
        r.consumer_debt_baht,
        r.nacc_cases,
        r.procurement_fraud_pct,
        r.ita_ind9_scaled,
        r.discipline_ita_gap,
        r.youth_unemployment_pct,
        r.elderly_pop_60up,
        `"${r.procurement_risk_tier}"`
      ].join(',')
    );
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bi_ready_moral_synergy_dashboard.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyPython = () => {
    navigator.clipboard.writeText(PYTHON_DATA_CONNECTOR_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  // Bivariate Choropleth Fill for Aspect 1 (Integrity vs NACC Procurement Fraud Risk)
  const getIntegrityBivariateMapFill = (id: string, thName: string): string => {
    const provName = thName || getProvinceThaiName(id);
    const stat = MDC_PROVINCE_STATS_MAP[provName];
    if (provName === selectedMapProv) return '#f59e0b';

    if (provName === 'กรุงเทพมหานคร') return '#991b1b'; // Critical Red Zone (High CRI 74.5%, Low Lecturers 1.8)
    if (!stat) return '#cbd5e1';

    if (stat.region === 'ภาคกลาง') {
      // High procurement risk (CRI 66.8%) vs varying lecturer supply
      if (stat.total < 20) return '#dc2626'; // High Risk + Very Low Supply (Integrity Desert)
      if (stat.total < 80) return '#ea580c'; // High Risk + Moderate Supply
      return '#7c3aed'; // High Risk + High Supply (e.g., อยุธยา)
    }
    if (stat.region === 'ภาคใต้') {
      if (stat.total < 25) return '#f97316';
      return '#0284c7';
    }
    if (stat.region === 'ภาคตะวันออกเฉียงเหนือ') {
      if (stat.total >= 80) return '#1d4ed8'; // Strong Integrity + High Supply
      return '#3b82f6';
    }
    // ภาคเหนือ
    if (stat.total >= 80) return '#047857'; // Safe + High Supply
    return '#10b981';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* =====================================================================
          EXECUTIVE SUPPLY-DEMAND SYNERGY OVERVIEW BANNER
      ===================================================================== */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)',
          borderRadius: '20px',
          padding: '22px 24px',
          color: '#ffffff',
          boxShadow: '0 10px 26px rgba(15, 23, 42, 0.18)',
          border: '1px solid rgba(147, 197, 253, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '820px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.14)', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              <Sparkles size={14} color="#fde047" />
              <span>EVIDENCE-BASED POLICY TARGETING • SUPPLY (mdc_people 5,346 คน) × DEMAND (Data Synergy 133 รายการ)</span>
            </div>
            <h2 style={{ fontSize: '21px', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
              ระบบสารสนเทศเชิงนโยบายเพื่อการชี้เป้าจัดสรรงบประมาณภาครัฐแบบมุ่งเป้า (Targeted & Problem-oriented Budgeting)
            </h2>
            <p style={{ fontSize: '13.5px', color: '#dbeafe', margin: 0, lineHeight: 1.55 }}>
              ผสานข้อมูล <strong>“ศักยภาพกำลังคนด้านคุณธรรม (Supply Side: mdc_people)”</strong> เข้ากับ <strong>“ข้อมูลความรุนแรงของปัญหาเชิงโครงสร้างประเทศ (Demand Side: Data Synergy 133 รายการ)”</strong> เพื่อวิเคราะห์ช่องว่างกำลังคน (Capacity & Allocation Gap) และความไม่สอดคล้องของทักษะ (Skill Mismatch) รายภูมิภาค
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectAspect(activeAspect === 'master_matrix' ? 'integrity' : 'master_matrix')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              background: '#f59e0b',
              color: '#0f172a',
              border: 'none',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
            }}
          >
            <Layers size={16} />
            <span>{activeAspect === 'master_matrix' ? 'ดูรายด้านที่ 1: สุจริต vs ป.ป.ช.' : 'ดูตารางพิมพ์เขียวชี้เป้างบประมาณรวม 5 ด้าน'}</span>
          </button>
        </div>

        {/* 6 Executive Synergy KPI Pills */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginTop: '18px'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div style={{ fontSize: '11.5px', color: '#93c5fd', fontWeight: 700 }}>KPI 1: ความครอบคลุมกำลังคน</div>
            <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '3px' }}>1 คน : ปชช. 1.8 หมื่น</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>วิทยากรรวม 5,346 คน (76 จังหวัด)</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div style={{ fontSize: '11.5px', color: '#fca5a5', fontWeight: 700 }}>KPI 2: ดัชนีความไม่สอดคล้อง</div>
            <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '3px', color: '#fde047' }}>Mismatch = 64.2%</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>ทักษะวิทยากรไม่ตรงฐานรากปัญหาพื้นที่</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div style={{ fontSize: '11.5px', color: '#fca5a5', fontWeight: 700 }}>KPI 3: พื้นที่วิกฤตเร่งด่วน (Red Zones)</div>
            <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '3px', color: '#fca5a5' }}>18 จังหวัดวิกฤต</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>คดีทุจริต/หนี้บริโภคสูง แต่วิทยากรต่ำ</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div style={{ fontSize: '11.5px', color: '#86efac', fontWeight: 700 }}>KPI 4: คุณธรรมภาพรวมประเทศ</div>
            <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '3px' }}>4.09 / 5.00 คะแนน</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>ระดับมาก (กทม.ต่ำสุด 4.65–4.71)</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div style={{ fontSize: '11.5px', color: '#fde047', fontWeight: 700 }}>KPI 5: หนี้บริโภคเฉลี่ยครัวเรือน</div>
            <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '3px' }}>5,624 บาท/ครัวเรือน</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>กทม.และปริมณฑลพุ่งสูง 7,158 บาท</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div style={{ fontSize: '11.5px', color: '#fca5a5', fontWeight: 700 }}>KPI 6: คดีทุจริตจัดซื้อจัดจ้าง</div>
            <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '3px' }}>45.6% – 52.3%</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>ของคดีชี้มูล ป.ป.ช. ทั้งหมด 733 คดี</div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          ASPECT 1: ด้านสุจริต (INTEGRITY vs NACC PROCUREMENT FRAUD & ITA)
      ===================================================================== */}
      {activeAspect === 'integrity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section Title Banner */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px 24px', border: '1.5px solid #fecaca', boxShadow: '0 4px 14px rgba(220, 38, 38, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>
                  มิติยุทธศาสตร์ด้านที่ 1 • INTEGRITY INTERVENTION DEFICIT INDEX (IIDI)
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  ⚖️ ด้านสุจริต: การปิดช่องว่างธรรมาภิบาลและความเสี่ยงการทุจริตจัดซื้อจัดจ้างภาครัฐ (ป.ป.ช. & ITA)
                </h3>
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0 }}>
                  <strong>ประเด็นเชิงนโยบาย:</strong> ประเมินความสอดคล้องระหว่างการกระจายตัวของวิทยากรคุณธรรมด้านสุจริต (mdc_people) กับพื้นที่เสี่ยงต่อการเกิดคดีทุจริตประพฤติมิชอบ (ระบบ PESCA/CCMS ของ ป.ป.ช. และผลประเมิน ITA ต่ำกว่าเกณฑ์ 85 คะแนน) เพื่อป้องกันความเสียหายต่องบประมาณแผ่นดิน
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#fef2f2', color: '#991b1b', fontSize: '12.5px', fontWeight: 700, border: '1px solid #fecaca' }}>
                  คดีชี้มูล ป.ป.ช. รวม: 733 คดี (จัดซื้อจัดจ้าง 45.6%)
                </span>
                <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#eff6ff', color: '#1e40af', fontSize: '12.5px', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                  Benchmark สุจริตระดับมาก: 4.05 / 5.00
                </span>
              </div>
            </div>
          </div>

          {/* Main Strategic Card: Bivariate Choropleth Map with Collapsible Sub-Charts & Formula */}
          <SeniorDrillDownChartCard
            title="แผนที่ความสัมพันธ์สองมิติ: ความเสี่ยงทุจริต (CRI) vs ความหนาแน่นวิทยากรสุจริต"
            badgeText="มิติยุทธศาสตร์ด้านที่ 1 • IIDI Index"
            badgeColor="#dc2626"
            headlineMetric="733 คดี"
            headlineSubtext="คดีชี้มูล ป.ป.ช. รวม (จัดซื้อจัดจ้าง 45.6%) • Benchmark สุจริต 4.05/5.00"
            subtitle="แกนสี 1: CRI (38.6%–74.5%) • แกนสี 2: วิทยากรต่อแสน ปชช. (1.8–4.8 คน) • วิเคราะห์พื้นที่สุญญากาศทางจริยธรรม"
            formulaTitle={FORMULA_MORAL_LECTURERS_IIDI.title}
            formulaExpression={FORMULA_MORAL_LECTURERS_IIDI.formula}
            formulaVariables={FORMULA_MORAL_LECTURERS_IIDI.variables}
            formulaNotes={FORMULA_MORAL_LECTURERS_IIDI.notes}
            drillDownButtonLabel="🔍 เจาะลึกดูกราฟต้นทาง/ข้อมูลวิเคราะห์ (คดี ป.ป.ช. แยกฐานความผิด & ภาวะ Mismatch)"
            renderMainChart={() => (
              <div>
                {/* Bivariate Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#991b1b' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: '#991b1b' }} />
                    วิกฤตสีแดงเข้ม (กทม.: CRI 74.5% / วิทยากร 1.8)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#dc2626' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: '#dc2626' }} />
                    Integrity Desert (ภาคกลาง อปท. เสี่ยงสูง / วิทยากรต่ำ)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#ea580c' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: '#ea580c' }} />
                    เสี่ยงสูง-ปานกลาง (CRI 58%–66%)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#1d4ed8' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: '#1d4ed8' }} />
                    ต้นแบบสำนึกสุจริต (อีสาน: สุจริต 5.30 / วิทยากร 4.8)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#047857' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: '#047857' }} />
                    ปลอดภัยธรรมาภิบาลดี (เหนือ: CRI 38.6% / วิทยากร 4.2)
                  </span>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '520px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'radial-gradient(ellipse at 50% 50%, #1e293b 0%, #0f172a 100%)',
                    position: 'relative'
                  }}
                >
                  <Thailand3dShadedMap
                    selectedProvince={selectedMapProv}
                    onSelectProvince={(p: any) => setSelectedMapProv(typeof p === 'string' ? p : p?.name || '')}
                    getProvinceFill={getIntegrityBivariateMapFill}
                  />
                </div>

                {/* Province Mini Inspector */}
                <div
                  style={{
                    marginTop: '16px',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: getIntegrityBivariateMapFill(selectedMapProv, selectedMapProv) }} />
                    <div>
                      <strong style={{ fontSize: '16.5px', color: '#0f172a' }}>จังหวัดที่เลือก: {selectedMapProv}</strong>
                      <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '8px' }}>
                        ภูมิภาค: {MDC_PROVINCE_STATS_MAP[selectedMapProv]?.region || 'ภาคกลาง'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '13.5px' }}>
                    <span>วิทยากรรวม: <strong style={{ color: '#2563eb' }}>{MDC_PROVINCE_STATS_MAP[selectedMapProv]?.total || 0} คน</strong></span>
                    <span>อัตราต่อแสน ปชช.: <strong style={{ color: '#059669' }}>{(MDC_PROVINCE_STATS_MAP[selectedMapProv] as any)?.per100k || 0} คน</strong></span>
                    <span>ความเสี่ยง CRI: <strong style={{ color: '#dc2626' }}>{selectedMapProv === 'กรุงเทพมหานคร' ? '74.5% (สูงวิกฤต)' : '52.3%'}</strong></span>
                  </div>
                </div>
              </div>
            )}
            renderDrillDownContent={() => (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
                {/* Secondary Chart 1: Grouped Stacked Bar & Benchmark */}
                <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                    กราฟต้นทาง 1: GROUPED STACKED BAR & BENCHMARK
                  </span>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '6px 0 4px 0' }}>
                    จำนวนคดีชี้มูล ป.ป.ช. แยกตามฐานความผิด เทียบดัชนีความเสี่ยง (CRI %) รายภูมิภาค
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0' }}>
                    เส้นอ้างอิง (Benchmark): สัดส่วนคดีจัดซื้อจัดจ้างเฉลี่ย 45.6% • คะแนนสุจริตเกณฑ์ระดับมาก 4.86 คะแนน
                  </p>
                  <div style={{ width: '100%', height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={SYNERGY_INTEGRITY_TABLE.filter((r) => !r.isNationalAvg)}
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="region" tick={{ fontSize: 12.5, fontWeight: 700, fill: '#334155' }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: 'จำนวนคดี ป.ป.ช. (คดี)', angle: -90, position: 'insideLeft', style: { fontSize: 11.5, fill: '#475569' } }} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} label={{ value: 'CRI Risk / จัดซื้อจัดจ้าง (%)', angle: 90, position: 'insideRight', style: { fontSize: 11.5, fill: '#dc2626' } }} />
                        <RechartsTooltip />
                        <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                        <ReferenceLine yAxisId="right" y={45.6} stroke="#dc2626" strokeDasharray="5 5" label={{ value: 'Benchmark คดีจัดซื้อฯ 45.6%', fill: '#dc2626', fontSize: 11.5, fontWeight: 700 }} />
                        <Bar yAxisId="left" dataKey="procurementCasesCount" name="คดีจัดซื้อจัดจ้าง (คดี)" stackId="a" fill="#dc2626" radius={[0, 0, 0, 0]} />
                        <Bar yAxisId="left" dataKey="conflictCasesCount" name="คดีผลประโยชน์ทับซ้อน (คดี)" stackId="a" fill="#f97316" />
                        <Bar yAxisId="left" dataKey="otherCasesCount" name="คดีโครงสร้างพื้นฐาน/อื่นๆ (คดี)" stackId="a" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="criIndexPct" name="ดัชนีความเสี่ยงทุจริต CRI (%)" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Secondary Chart 2: Skill Mismatch Analysis */}
                <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
                    กราฟต้นทาง 2: SUPPLY vs DEMAND SKILL MISMATCH
                  </span>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '6px 0 4px 0' }}>
                    เปรียบเทียบสัดส่วนความเชี่ยวชาญวิทยากรสุจริต vs สัดส่วนประเภทคดีจริงของ ป.ป.ช. (%)
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0' }}>
                    สะท้อนภาวะ Mismatch: วิทยากร 65% เน้นอบรมต้านโกงทั่วไปในโรงเรียน แต่คดีจริง 45.6% เกิดในระบบจัดซื้อจัดจ้าง อปท.
                  </p>
                  <div style={{ width: '100%', height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={INTEGRITY_SKILL_MISMATCH_DATA}
                        layout="vertical"
                        margin={{ top: 5, right: 24, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" domain={[0, 75]} unit="%" tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="category" width={210} tick={{ fontSize: 12.5, fontWeight: 700, fill: '#1e293b' }} />
                        <RechartsTooltip formatter={(v: any) => v + '%'} />
                        <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                        <Bar dataKey="naccCaseSharePct" name="สัดส่วนคดีทุจริตจริง ป.ป.ช. (%)" fill="#dc2626" radius={[0, 6, 6, 0]} />
                        <Bar dataKey="lecturerSkillSharePct" name="สัดส่วนความถนัดวิทยากรสุจริต (%)" fill="#2563eb" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          />

          {/* Processed Data Table */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              📋 ตารางชุดข้อมูลบูรณาการด้านที่ 1: คุณธรรมด้านสุจริต vs ความเสี่ยงการทุจริตจัดซื้อจัดจ้างภาครัฐ (Processed Data Table)
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>ภูมิภาค</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>คะแนนสุจริต (เต็ม 5)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>ระดับคุณธรรม</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>คดีชี้มูล ป.ป.ช. (คดี)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>สัดส่วนคดีจัดซื้อจัดจ้าง (%)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>สัดส่วนคดีผลประโยชน์ทับซ้อน (%)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ดัชนีความเสี่ยง CRI (%)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>วิทยากรสุจริตต่อแสน ปชช. (คน)</th>
                    <th style={{ padding: '10px 12px' }}>สถานะความเสี่ยงเชิงพื้นที่</th>
                  </tr>
                </thead>
                <tbody>
                  {SYNERGY_INTEGRITY_TABLE.map((row) => (
                    <tr
                      key={row.region}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: row.isNationalAvg ? '#f1f5f9' : '#ffffff',
                        fontWeight: row.isNationalAvg ? 800 : 500
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{row.region}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: row.integrityScore < 4.86 ? '#dc2626' : '#059669' }}>
                        {row.integrityScore.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.moralLevel}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{row.naccCases.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: row.procurementFraudPct >= 48 ? '#dc2626' : '#334155' }}>
                        {row.procurementFraudPct.toFixed(1)}%
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>{row.conflictOfInterestPct.toFixed(1)}%</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: row.statusColor }}>
                        {row.criIndexPct.toFixed(1)}%
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#1e40af' }}>
                        {row.lecturersPer100k.toFixed(1)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            background: row.statusBg,
                            color: row.statusColor
                          }}
                        >
                          {row.riskStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Analysis & Budget Targeting Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#fff1f2', borderRadius: '18px', padding: '20px', border: '1.5px solid #fecdd3' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#9f1239', margin: '0 0 10px 0' }}>
                🔍 บทวิเคราะห์ความสัมพันธ์เชิงประจักษ์ (Diagnostic Analysis & Root Causes)
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#881337', lineHeight: 1.65 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>ความสัมพันธ์ผกผันชัดเจน:</strong> เขตกรุงเทพฯ (คะแนนสุจริต 4.68) และภาคกลาง (4.75) มีคะแนนสุจริตต่ำกว่าเกณฑ์มาตรฐาน 4.86 แต่มีสัดส่วนคดีทุจริตจัดซื้อจัดจ้างพุ่งสูงถึง <strong>52.3%</strong> และ <strong>49.8%</strong> ของคดีทั้งหมด
                </li>
                <li>
                  <strong>Supply-Demand Mismatch:</strong> วิทยากรคุณธรรมด้านสุจริตกว่า 65% สังกัดสถาบันการศึกษา (เน้นบรรยายจริยธรรมเด็ก) แต่วิกฤตการทุจริตจริงเกิดขึ้นในกระบวนการจัดซื้อจัดจ้างของ <strong>องค์กรปกครองส่วนท้องถิ่น (อปท.)</strong> โดยเฉพาะการใช้ดุลยพินิจวิธีเฉพาะเจาะจง (วงเงินต่ำกว่า 200,000 บาท) และการขัดกันแห่งผลประโยชน์ส่วนตนและส่วนรวม
                </li>
              </ul>
            </div>

            <div style={{ background: '#eff6ff', borderRadius: '18px', padding: '20px', border: '1.5px solid #bfdbfe' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 10px 0' }}>
                🎯 การชี้เป้าเพื่อทุ่มงบประมาณเชิงนโยบาย (Evidence-Based Budget Targeting)
              </h4>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8', marginBottom: '8px' }}>
                หน่วยงานรับผิดชอบหลัก: สำนักงาน ป.ป.ช. • กรมบัญชีกลาง • กรมส่งเสริมการปกครองท้องถิ่น (สถ.) • สำนักงบประมาณ
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#1e293b', lineHeight: 1.65 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>ยุติงบอบรมแบบหว่านแห:</strong> ยุติการจัดสรรงบฝึกอบรมต้านทุจริตแบบบรรยายทั่วไปในห้องเรียน แล้วโอนย้ายงบไปจัดตั้ง <strong>“คลินิกพี่เลี้ยงวิทยากรจัดซื้อจัดจ้างคุณธรรม (Integrity Procurement Taskforce)”</strong>
                </li>
                <li>
                  <strong>ชี้เป้างบประมาณปี 2568–2570:</strong> สร้างเครือข่ายวิทยากรตัวคูณเฉพาะทาง (Specialized Multiplier Trainers) ที่เชี่ยวชาญ พ.ร.บ.จัดซื้อจัดจ้างฯ และเกณฑ์บรรษัทภิบาลคู่ค้าภาครัฐ (ITAGC) เข้าฝังตัวฝึกอบรมเจ้าหน้าที่พัสดุและผู้บริหารท้องถิ่นใน <strong>15 จังหวัดภาคกลางและปริมณฑล</strong> เป็นลำดับแรก
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ASPECT 2: ด้านพอเพียง (SUFFICIENCY vs HOUSEHOLD DEBT & SAVINGS)
      ===================================================================== */}
      {activeAspect === 'sufficiency' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section Title Banner */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px 24px', border: '1.5px solid #a7f3d0', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                  มิติยุทธศาสตร์ด้านที่ 2 • BEHAVIORAL-ECONOMIC DIVERGENCE & COMPETENCY PROFILING
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  🌱 ด้านพอเพียง: การแก้ปัญหาหนี้สินครัวเรือนและยกระดับวินัยการเงินกลุ่มแรงงานเมือง (สศช. & ธปท.)
                </h3>
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0 }}>
                  <strong>ประเด็นเชิงนโยบาย:</strong> ตรวจสอบความพร้อมและบริบทความถนัดของวิทยากรด้านความพอเพียง (mdc_people) ในการรับมือกับวิกฤตหนี้สินเพื่อการอุปโภคบริโภคของครัวเรือน เพื่อลดความเปราะบางทางการเงินของประชากรวัยแรงงานในเขตเมืองและนิคมอุตสาหกรรม
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#fef2f2', color: '#991b1b', fontSize: '12.5px', fontWeight: 700, border: '1px solid #fecaca' }}>
                  หนี้บริโภค กทม./ปริมณฑล: 7,158 บาท (เงินออม 18.4%)
                </span>
                <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#ecfdf5', color: '#065f46', fontSize: '12.5px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                  ค่าเฉลี่ยหนี้บริโภคประเทศ: 5,624 บาท • พอเพียง 4.09/5.00
                </span>
              </div>
            </div>
          </div>

          {/* Main Strategic Card: Quadrant Scatter Plot with Collapsible Donut & Stacked Bar */}
          <SeniorDrillDownChartCard
            title="จตุภาคความพอเพียงและอัตราส่วนวิทยากร vs ภาระหนี้บริโภคต่อครัวเรือน"
            badgeText="มิติยุทธศาสตร์ด้านที่ 2 • BEDI Index"
            badgeColor="#059669"
            headlineMetric="5,624 บาท"
            headlineSubtext="ภาระหนี้บริโภคเฉลี่ยต่อครัวเรือน • เกณฑ์พอเพียงระดับมาก 4.05/5.00"
            subtitle="แกน X: หนี้บริโภค (ตัดที่ 5,624 บ.) • แกน Y: คะแนนพอเพียง (ตัดที่ 4.86) • ขนาดจุด: % ครัวเรือนที่มีเงินออม"
            formulaTitle={FORMULA_MORAL_LECTURERS_SUFFICIENCY_QUADRANT.title}
            formulaExpression={FORMULA_MORAL_LECTURERS_SUFFICIENCY_QUADRANT.formula}
            formulaVariables={FORMULA_MORAL_LECTURERS_SUFFICIENCY_QUADRANT.variables}
            formulaNotes={FORMULA_MORAL_LECTURERS_SUFFICIENCY_QUADRANT.notes}
            drillDownButtonLabel="🔍 เจาะลึกดูกราฟต้นทาง/ข้อมูลวิเคราะห์ (สัดส่วนความเชี่ยวชาญ & วินัยการเงินคนเมือง)"
            renderMainChart={() => (
              <div>
                <div style={{ width: '100%', height: '380px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 25, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        dataKey="consumerDebtBaht"
                        name="หนี้บริโภคเฉลี่ย"
                        domain={[4000, 7600]}
                        unit=" บาท"
                        tick={{ fontSize: 13 }}
                        label={{ value: 'ภาระหนี้บริโภคเฉลี่ยต่อครัวเรือน (บาท)', position: 'bottom', offset: 2, style: { fontSize: 13.5, fontWeight: 700, fill: '#334155' } }}
                      />
                      <YAxis
                        type="number"
                        dataKey="sufficiencyScore"
                        name="คะแนนพอเพียง"
                        domain={[4.45, 5.40]}
                        tick={{ fontSize: 13 }}
                        label={{ value: 'คะแนนคุณธรรมพอเพียง (เต็ม 5)', angle: -90, position: 'insideLeft', style: { fontSize: 13.5, fontWeight: 700, fill: '#059669' } }}
                      />
                      <ZAxis type="number" dataKey="savingsHouseholdPct" range={[240, 780]} name="สัดส่วนครัวเรือนมีเงินออม (%)" />
                      <RechartsTooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(val: any, name: any) => [val, name]}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.region || ''}
                      />
                      <ReferenceLine x={5624} stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'ค่าเฉลี่ยหนี้บริโภค 5,624 บ.', fill: '#dc2626', fontSize: 12, fontWeight: 700, position: 'top' }} />
                      <ReferenceLine y={4.86} stroke="#059669" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'เกณฑ์พอเพียงระดับมาก (4.86)', fill: '#059669', fontSize: 12, fontWeight: 700, position: 'right' }} />
                      <Scatter name="ภูมิภาค" data={SYNERGY_SUFFICIENCY_TABLE.filter((r) => !r.isNationalAvg)}>
                        {SYNERGY_SUFFICIENCY_TABLE.filter((r) => !r.isNationalAvg).map((entry, idx) => (
                          <Cell key={idx} fill={entry.statusColor} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                {/* 4 Quadrants Callout Bar */}
                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '12px 14px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#065f46' }}>จตุภาคที่ 1: พอเพียงสูง • หนี้ต่ำ ⭐</div>
                    <div style={{ fontSize: '12px', color: '#047857', marginTop: '3px' }}>ภาคอีสาน (5.24), ภาคเหนือ (5.08) - ออมเฉลี่ย 27%</div>
                  </div>
                  <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '12px 14px', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#991b1b' }}>จตุภาคที่ 4: พอเพียงต่ำ • หนี้พุ่ง ⚠️</div>
                    <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '3px' }}>กทม./ปริมณฑล (4.65) - หนี้ 7,158 บ. ขาดเงินออม</div>
                  </div>
                  <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '12px 14px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af' }}>ความหนาแน่นวิทยากร</div>
                    <div style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '3px' }}>อีสาน 4.8 คน/แสน ปชช. vs กทม. 1.8 คน/แสน ปชช.</div>
                  </div>
                </div>
              </div>
            )}
            renderDrillDownContent={() => (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
                {/* Secondary Chart 1: Donut Chart */}
                <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                    กราฟต้นทาง 1: CONTENT PROFILING (DONUT CHART)
                  </span>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '6px 0 4px 0' }}>
                    สัดส่วนบริบทความเชี่ยวชาญของวิทยากรคุณธรรมด้านพอเพียง (Supply Content Profile)
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0' }}>
                    วิทยากร 88% เชี่ยวชาญเกษตรพอเพียง/ชนบท มีเพียง 12% ที่เชี่ยวชาญวินัยการเงินคนเมือง
                  </p>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={SUFFICIENCY_CONTENT_PROFILE_DONUT}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={110}
                          paddingAngle={4}
                          label={({ name, value }) => name + ' (' + value + '%)'}
                        >
                          {SUFFICIENCY_CONTENT_PROFILE_DONUT.map((item, idx) => (
                            <Cell key={idx} fill={item.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(v: any) => v + '%'} />
                        <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Secondary Chart 2: Urban vs Rural Profiling */}
                <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
                    กราฟต้นทาง 2: URBAN vs RURAL FINANCIAL SKILL GAP
                  </span>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '6px 0 4px 0' }}>
                    สัดส่วนวิทยากรสายเกษตรพอเพียง vs วินัยการเงินคนเมือง แยกตามภูมิภาค
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0' }}>
                    สะท้อนความต้องการเร่งด่วน: ปริมณฑลและ กทม. ขาดแคลนโค้ชปลดหนี้/วินัยบัตรเครดิต
                  </p>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={SYNERGY_SUFFICIENCY_TABLE.filter((r) => !r.isNationalAvg)}
                        margin={{ top: 15, right: 25, left: 10, bottom: 15 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="region" tick={{ fontSize: 12.5, fontWeight: 700 }} />
                        <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                        <RechartsTooltip formatter={(v: any) => v + '%'} />
                        <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                        <Bar dataKey="agriTraditionalSkillPct" name="วิทยากรสายเกษตรพอเพียง/ชนบท (%)" stackId="s" fill="#10b981" />
                        <Bar dataKey="urbanFinanceSkillPct" name="วิทยากรสายวินัยการเงินคนเมือง (%)" stackId="s" fill="#dc2626" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          />

          {/* Processed Data Table */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              📋 ตารางชุดข้อมูลบูรณาการด้านที่ 2: คุณธรรมด้านพอเพียง vs วิกฤตหนี้สินครัวเรือนและเงินออม (Processed Data Table)
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>ภูมิภาค</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>คะแนนพอเพียง (เต็ม 5)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>ระดับคุณธรรม</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>หนี้บริโภคเฉลี่ย (บาท/ครัวเรือน)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ครัวเรือนที่มีเงินออม (%)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ความหนาแน่นวิทยากรพอเพียง (คน/แสน ปชช.)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>สัดส่วนวิทยากรสายการเงินเมือง (%)</th>
                    <th style={{ padding: '10px 12px' }}>ตำแหน่งพิกัดจตุภาค (Quadrant Status)</th>
                  </tr>
                </thead>
                <tbody>
                  {SYNERGY_SUFFICIENCY_TABLE.map((row) => (
                    <tr
                      key={row.region}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: row.isNationalAvg ? '#f1f5f9' : '#ffffff',
                        fontWeight: row.isNationalAvg ? 800 : 500
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{row.region}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: row.sufficiencyScore < 4.86 ? '#dc2626' : '#059669' }}>
                        {row.sufficiencyScore.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.moralLevel}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: row.consumerDebtBaht > 5624 ? '#dc2626' : '#059669' }}>
                        {row.consumerDebtBaht.toLocaleString()} บาท
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{row.savingsHouseholdPct.toFixed(1)}%</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#1e40af' }}>{row.lecturersPer100k.toFixed(1)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{row.urbanFinanceSkillPct.toFixed(1)}%</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, background: row.statusBg, color: row.statusColor }}>
                          {row.quadrantStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Analysis & Budget Targeting Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#ecfdf5', borderRadius: '18px', padding: '20px', border: '1.5px solid #a7f3d0' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#065f46', margin: '0 0 10px 0' }}>
                🔍 บทวิเคราะห์ความสัมพันธ์เชิงประจักษ์ (Behavioral-Economic Divergence)
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#064e3b', lineHeight: 1.65 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>ภาวะแบ่งแยกทางเศรษฐกิจ-พฤติกรรม:</strong> ภาคอีสาน (5.24) และภาคเหนือ (5.08) มีคะแนนความพอเพียงสูง ส่งผลให้หนี้บริโภคต่ำ (4,431–5,171 บาท) และมีเงินออมเหลือเก็บสูงถึง 24.5%–27.2% ขณะที่ กทม.และปริมณฑล ติดกับดัก <strong>“หนี้บริโภคสูง 7,158 บาท แต่ออมได้เพียง 18.4%”</strong>
                </li>
                <li>
                  <strong>Competency Mismatch:</strong> วิทยากรด้านความพอเพียงกว่า 85% เชี่ยวชาญเกษตรทฤษฎีใหม่และปราชญ์ชาวบ้านชนบท แต่พื้นที่วิกฤตหนี้สินคือกลุ่มแรงงานอุตสาหกรรมและคนเมืองที่ต้องการทักษะบริหารสภาพคล่อง วินัยบัตรเครดิต และการแก้หนี้นอกระบบ
                </li>
              </ul>
            </div>

            <div style={{ background: '#eff6ff', borderRadius: '18px', padding: '20px', border: '1.5px solid #bfdbfe' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 10px 0' }}>
                🎯 การชี้เป้าเพื่อทุ่มงบประมาณเชิงนโยบาย (Evidence-Based Budget Targeting)
              </h4>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8', marginBottom: '8px' }}>
                หน่วยงานรับผิดชอบหลัก: ธนาคารแห่งประเทศไทย (ธปท.) • สศช. • กระทรวงการคลัง • กระทรวงแรงงาน
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#1e293b', lineHeight: 1.65 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Re-skilling วิทยากรพอเพียง:</strong> จัดสรรงบประมาณพัฒนาหลักสูตร Re-skill วิทยากรคุณธรรมเดิม และคัดเลือกวิทยากรใหม่ภายใต้โครงการ <strong>“วิทยากรคุณธรรมวินัยทางการเงินเพื่อคนเมือง (Urban Financial Literacy Coaches)”</strong>
                </li>
                <li>
                  <strong>เจาะตรงนิคมอุตสาหกรรมและโรงงาน:</strong> กำหนดเงื่อนไขงบอุดหนุนสถานประกอบการใน กทม. ปริมณฑล และภาคกลาง ให้จัดคลินิกปรับพฤติกรรมทางการเงินควบคู่กับมาตรการพักหนี้และคลินิกแก้หนี้
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ASPECT 3: ด้านวินัยรับผิดชอบ (DISCIPLINE vs ITA IND 9, NHRC & TRAFFIC)
      ===================================================================== */}
      {activeAspect === 'discipline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section Title Banner */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px 24px', border: '1.5px solid #bfdbfe', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                  มิติยุทธศาสตร์ด้านที่ 3 • INSTITUTIONAL ASYMMETRY & RULE OF LAW ALIGNMENT
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  🎯 ด้านวินัยรับผิดชอบ: การสร้างความปลอดภัยสาธารณะ ธรรมาภิบาลรัฐ (ITA) และลดการละเมิดสิทธิมนุษยชน (กสม.)
                </h3>
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0 }}>
                  <strong>ประเด็นเชิงนโยบาย:</strong> ยกระดับวินัยพลเมือง การเคารพกฎหมาย และลดความสูญเสียจากอุบัติเหตุจราจร (538 คดีสายหลัก) และการละเมิดสิทธิมนุษยชน (เรื่องร้องเรียน กสม. 1,027 เรื่อง) เทียบกับผลประเมิน ITA ตัวชี้วัดที่ 9
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#fef2f2', color: '#991b1b', fontSize: '12.5px', fontWeight: 700, border: '1px solid #fecaca' }}>
                  เรื่องร้องเรียน กสม.: 1,027 เรื่อง (รัฐถูกร้องเรียน 53.46%)
                </span>
                <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#eff6ff', color: '#1e40af', fontSize: '12.5px', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                  ITA ตัวชี้วัด 9 เฉลี่ย: 84.19 (ฐาน 6 = 5.05)
                </span>
              </div>
            </div>
          </div>

          {/* Main Strategic Card: Dumbbell Gap Plot with Collapsible Radar & NHRC Complaints */}
          <SeniorDrillDownChartCard
            title="ช่องว่างผลสัมฤทธิ์ธรรมาภิบาลภาครัฐ (ITA ตัวชี้วัด 9) vs คะแนนวินัยรับผิดชอบ"
            badgeText="มิติยุทธศาสตร์ด้านที่ 3 • Discipline-ITA Gap"
            badgeColor="#dc2626"
            headlineMetric="-0.65 ถึง -1.13"
            headlineSubtext="Gap ช่องว่างผลประเมินตนเองของรัฐ vs พฤติกรรมวินัยจริงของประชาชน"
            subtitle="Dumbbell Chart สะท้อน Gap ระหว่างคะแนนความโปร่งใส ITA หน่วยงานรัฐ vs วินัยรับผิดชอบของประชาชน"
            formulaTitle={FORMULA_MORAL_LECTURERS_DISCIPLINE_GAP.title}
            formulaExpression={FORMULA_MORAL_LECTURERS_DISCIPLINE_GAP.formula}
            formulaVariables={FORMULA_MORAL_LECTURERS_DISCIPLINE_GAP.variables}
            formulaNotes={FORMULA_MORAL_LECTURERS_DISCIPLINE_GAP.notes}
            drillDownButtonLabel="🔍 เจาะลึกดูกราฟต้นทาง/ข้อมูลวิเคราะห์ (เรดาร์ 5 มิติย่อย & เรื่องร้องเรียน กสม.)"
            renderMainChart={() => (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
                  {SYNERGY_DISCIPLINE_TABLE.filter((r) => !r.isNationalAvg).map((row) => {
                    const minVal = 4.2;
                    const maxVal = 5.8;
                    const range = maxVal - minVal;
                    const itaScoreVal = row.itaInd9Scaled ?? (row as any).itaScaled ?? 0;
                    const gapVal = row.alignmentGap ?? (row as any).gap ?? 0;
                    const itaPct = Math.max(0, Math.min(100, ((itaScoreVal - minVal) / range) * 100));
                    const discPct = Math.max(0, Math.min(100, ((row.disciplineScore - minVal) / range) * 100));
                    const leftPct = Math.min(itaPct, discPct);
                    const widthPct = Math.abs(discPct - itaPct);

                    return (
                      <div key={row.region} style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px 18px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{row.region}</span>
                          <div style={{ display: 'flex', gap: '14px', fontSize: '13px' }}>
                            <span style={{ color: '#1e40af', fontWeight: 700 }}>ITA ภาครัฐ: {itaScoreVal.toFixed(2)}</span>
                            <span style={{ color: '#dc2626', fontWeight: 700 }}>วินัย ปชช.: {row.disciplineScore.toFixed(2)}</span>
                            <span style={{ color: '#7c3aed', fontWeight: 800 }}>Gap: {gapVal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Dumbbell Track */}
                        <div style={{ position: 'relative', width: '100%', height: '26px', display: 'flex', alignItems: 'center' }}>
                          <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', background: '#e2e8f0', borderRadius: '2px' }} />
                          <div style={{ position: 'absolute', left: leftPct + '%', width: widthPct + '%', height: '8px', background: 'linear-gradient(90deg, #3b82f6, #ef4444)', borderRadius: '4px' }} />
                          <div style={{ position: 'absolute', left: 'calc(' + itaPct + '% - 9px)', width: '18px', height: '18px', borderRadius: '50%', background: '#2563eb', border: '3px solid #ffffff', boxShadow: '0 2px 6px rgba(37,99,235,0.4)', zIndex: 2 }} />
                          <div style={{ position: 'absolute', left: 'calc(' + discPct + '% - 9px)', width: '18px', height: '18px', borderRadius: '50%', background: '#dc2626', border: '3px solid #ffffff', boxShadow: '0 2px 6px rgba(220,38,38,0.4)', zIndex: 2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '13px', color: '#991b1b' }}>
                  <strong>ข้อค้นพบเชิงประจักษ์:</strong> แม้หน่วยงานรัฐจะประเมินคะแนนความโปร่งใส ITA สูง (5.42–5.68) แต่ดัชนีวินัยรับผิดชอบของประชาชนในพื้นที่กลับตามหลังถึง <strong>0.65 ถึง 1.13 คะแนน</strong> สะท้อนปัญหาการบังคับใช้กฎหมายและความเชื่อมั่นทางสังคม
                </div>
              </div>
            )}
            renderDrillDownContent={() => (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
                {/* Secondary Chart 1: Radar 5 Subdimensions */}
                <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                    กราฟต้นทาง 1: RADAR 5 มิติย่อย (วินัย vs ความรุนแรงของปัญหา)
                  </span>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '6px 0 4px 0' }}>
                    ความครอบคลุมของวิทยากรด้านวินัย 5 มิติย่อย เทียบระดับวิกฤตปัญหาจริง
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0' }}>
                    เปรียบเทียบสัดส่วนปัญหาจริง vs การกระจายตัวของวิทยากรวินัย
                  </p>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={DISCIPLINE_5_SUBDIMENSIONS_RADAR} outerRadius={95}>
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fontWeight: 700, fill: '#1e293b' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Radar name="ความรุนแรงของปัญหาจริง (%)" dataKey="problemSeverityPct" stroke="#dc2626" fill="#dc2626" fillOpacity={0.25} />
                        <Radar name="ความครอบคลุมของวิทยากรวินัย (%)" dataKey="lecturerCoveragePct" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                        <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                        <RechartsTooltip formatter={(v: any) => v + '%'} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Secondary Chart 2: NHRC Complaints Breakdown */}
                <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                    กราฟต้นทาง 2: NHRC COMPLAINTS BREAKDOWN
                  </span>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '6px 0 4px 0' }}>
                    โครงสร้างเรื่องร้องเรียน กสม. (1,027 เรื่อง) เทียบสัดส่วนวิทยากรเชี่ยวชาญเฉพาะด้าน
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0' }}>
                    ร้องเรียนเรื่องสิทธิมนุษยชนและวินัยเจ้าหน้าที่รัฐสูง แต่วิทยากรเฉพาะทางมีน้อย
                  </p>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={NHRC_COMPLAINTS_BREAKDOWN}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" domain={[0, 45]} unit="%" tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 12, fontWeight: 700 }} />
                        <RechartsTooltip formatter={(v: any) => v + '%'} />
                        <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                        <Bar dataKey="pct" name="สัดส่วนเรื่องร้องเรียน กสม. (%)" fill="#dc2626" radius={[0, 6, 6, 0]} />
                        <Bar dataKey="lecturerMatchPct" name="สัดส่วนวิทยากรเชี่ยวชาญด้านนี้ (%)" fill="#2563eb" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          />

          {/* Processed Data Table */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              📋 ตารางชุดข้อมูลบูรณาการด้านที่ 3: คุณธรรมด้านวินัยรับผิดชอบ vs ธรรมาภิบาลภาครัฐ สิทธิมนุษยชน และความปลอดภัย (Processed Data Table)
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>ภูมิภาค</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>คะแนนวินัย (เต็ม 5)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>ระดับคุณธรรม</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ITA ตัวชี้วัด 9 (เต็ม 100)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ITA แปลงฐาน 6</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ช่องว่างสอดคล้อง (Gap)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>เรื่องร้องเรียน กสม. (เรื่อง)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>คดีอุบัติเหตุจราจร (คดี)</th>
                    <th style={{ padding: '10px 12px' }}>สรุปประเด็นเชิงธรรมาภิบาล</th>
                  </tr>
                </thead>
                <tbody>
                  {SYNERGY_DISCIPLINE_TABLE.map((row) => (
                    <tr
                      key={row.region}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: row.isNationalAvg ? '#f1f5f9' : '#ffffff',
                        fontWeight: row.isNationalAvg ? 800 : 500
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{row.region}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: row.disciplineScore < 4.86 ? '#dc2626' : '#059669' }}>
                        {row.disciplineScore.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.moralLevel}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{row.itaInd9Raw.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>{row.itaInd9Scaled.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: row.alignmentGap < -0.2 ? '#dc2626' : '#334155' }}>
                        {row.alignmentGap > 0 ? `+${row.alignmentGap.toFixed(2)}` : row.alignmentGap.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>{row.nhrcComplaints.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#ea580c' }}>{row.trafficAccidents.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, background: row.statusBg, color: row.statusColor }}>
                          {row.governanceSummary}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Analysis & Budget Targeting Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#fff7ed', borderRadius: '18px', padding: '20px', border: '1.5px solid #fed7aa' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#9a3412', margin: '0 0 10px 0' }}>
                🔍 บทวิเคราะห์ความสัมพันธ์เชิงประจักษ์ (Institutional Asymmetry)
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#7c2d12', lineHeight: 1.65 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>ความไม่สมดุลเชิงสถาบัน:</strong> ในเขตกรุงเทพฯ และปริมณฑล หน่วยงานรัฐมีคะแนนเปิดเผยข้อมูลตามเกณฑ์ ITA สูง (84.60 หรือ 4.23/5.00) แต่วินัยพลเมืองกลับต่ำสุด (4.71 คะแนน, Gap = -0.37) สะท้อนผ่านคดีอุบัติเหตุจราจรสูงสุด (168 คดี) และเรื่องร้องเรียน กสม. สูงสุด (345 เรื่อง)
                </li>
                <li>
                  <strong>การกระจุกตัวในโรงเรียน vs ปัญหาในกลุ่มผู้ใหญ่:</strong> การอบรมวินัยกระจุกตัวเฉพาะในระบบโรงเรียนขั้นพื้นฐาน แต่วิกฤตการละเมิดสิทธิมนุษยชนกว่า 53.46% มีคู่กรณีเป็นหน่วยงานรัฐ (สิทธิชุมชน 40.85%, กระบวนการยุติธรรม 16.90%) และอุบัติเหตุเกิดจากประชากรวัยผู้ใหญ่
                </li>
              </ul>
            </div>

            <div style={{ background: '#eff6ff', borderRadius: '18px', padding: '20px', border: '1.5px solid #bfdbfe' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 10px 0' }}>
                🎯 การชี้เป้าเพื่อทุ่มงบประมาณเชิงนโยบาย (Evidence-Based Budget Targeting)
              </h4>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8', marginBottom: '8px' }}>
                หน่วยงานรับผิดชอบหลัก: สำนักงาน กสม. • กระทรวงยุติธรรม • สำนักงานตำรวจแห่งชาติ • กระทรวงคมนาคม (กปถ.)
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#1e293b', lineHeight: 1.65 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>กองทุนไกล่เกลี่ยสิทธิชุมชนระดับ อปท.:</strong> โยกย้ายงบผลิตป้ายประชาสัมพันธ์แบบตั้งรับ ไปจัดสรรเป็น <strong>“กองทุนขับเคลื่อนวินัยสิทธิมนุษยชนและกฎหมายระดับ อปท.”</strong> โดยดึงวิทยากรคุณธรรมด้านวินัยลงไปเป็นผู้ไกล่เกลี่ยข้อพิพาทสิทธิชุมชน
                </li>
                <li>
                  <strong>เชื่อมระบบตัดแต้มใบขับขี่และคุมประพฤติ:</strong> จัดสรรงบกองทุน กปถ. ร่วมกับ บช.น. และกรมคุมประพฤติ เชื่อมโยงระบบตัดคะแนนใบขับขี่เข้ากับหลักสูตรอบรมวินัยการขับขี่เชิงพฤติกรรมโดยเครือข่ายวิทยากรคุณธรรม
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ASPECT 4: ด้านกตัญญู (GRATITUDE vs AGED SOCIETY & LONG-TERM CARE)
      ===================================================================== */}
      {activeAspect === 'gratitude' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section Title Banner */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px 24px', border: '1.5px solid #ddd6fe', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
                  มิติยุทธศาสตร์ด้านที่ 4 • ELDERLY VULNERABILITY & CAREGIVER CAPACITY RATIO
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  🙏 ด้านกตัญญูและทุนชีวิตครอบครัว: การรองรับสังคมสูงวัยขั้นสุดยอดและการบริบาลระยะยาว (LTC)
                </h3>
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0 }}>
                  <strong>ประเด็นเชิงนโยบาย:</strong> นำพลังความกตัญญูและสถาบันครอบครัวมาเป็นเกราะคุ้มกันทางจิตใจและกลไกชะลอภาระงบประมาณสาธารณสุข สำหรับประชากรผู้สูงอายุ 60 ปีขึ้นไป จำนวน <strong>14,027,411 คน</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#f5f3ff', color: '#6d28d9', fontSize: '12.5px', fontWeight: 700, border: '1px solid #ddd6fe' }}>
                  ผู้สูงอายุมีความสุขสูง: 7.84 ล้านคน (55.9%) แม้สุขภาพถดถอย 73.6%
                </span>
                <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#fef2f2', color: '#991b1b', fontSize: '12.5px', fontWeight: 700, border: '1px solid #fecaca' }}>
                  Gap กตัญญูระหว่างวัย (เยาวชน vs สูงวัย): -0.58 คะแนน
                </span>
              </div>
            </div>
          </div>

          {/* Main Strategic Card: Bubble Chart with Collapsible Intergenerational Gap ComposedChart */}
          <SeniorDrillDownChartCard
            title="ความสัมพันธ์ระหว่างสุขภาพกายที่ถดถอย vs สุขภาวะทางใจในสังคมสูงวัย"
            badgeText="มิติยุทธศาสตร์ด้านที่ 4 • Aging SSI"
            badgeColor="#7c3aed"
            headlineMetric="55.9%"
            headlineSubtext="สัดส่วนผู้สูงอายุที่มีความสุขระดับมาก แม้ 73.6% สุขภาพกายถดถอย"
            subtitle="Bubble Chart: สัดส่วนสุขภาพถดถอย (68%–85%) vs ความสุขระดับมาก (35%–66%) แยกตามกลุ่มวัย 60-80+ ปี"
            formulaTitle={FORMULA_MORAL_CITY_AGING_SSI.title}
            formulaExpression={FORMULA_MORAL_CITY_AGING_SSI.formula}
            formulaVariables={FORMULA_MORAL_CITY_AGING_SSI.variables}
            formulaNotes={FORMULA_MORAL_CITY_AGING_SSI.notes}
            drillDownButtonLabel="🔍 เจาะลึกดูกราฟต้นทาง/ข้อมูลวิเคราะห์ (ช่องว่างความกตัญญูระหว่างวัยรายภูมิภาค)"
            renderMainChart={() => (
              <div>
                <div style={{ width: '100%', height: '360px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 15, right: 25, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        dataKey="undesirableHealthPct"
                        name="สุขภาพกายถดถอย"
                        domain={[68, 85]}
                        unit="%"
                        tick={{ fontSize: 13 }}
                        label={{ value: 'สัดส่วนผู้สูงอายุที่มีสุขภาพกายถดถอย/ไม่พึงประสงค์ (%)', position: 'bottom', offset: 2, style: { fontSize: 13, fontWeight: 700, fill: '#334155' } }}
                      />
                      <YAxis
                        type="number"
                        dataKey="highHappinessPct"
                        name="ความสุขระดับมาก-มากที่สุด"
                        domain={[35, 66]}
                        unit="%"
                        tick={{ fontSize: 13 }}
                        label={{ value: 'สัดส่วนความสุขมาก-มากที่สุด (%)', angle: -90, position: 'insideLeft', style: { fontSize: 13, fontWeight: 700, fill: '#7c3aed' } }}
                      />
                      <ZAxis type="number" dataKey="elderlyPop2567" range={[300, 1200]} name="จำนวนประชากรผู้สูงอายุ (คน)" />
                      <RechartsTooltip
                        formatter={(val: any, name: any) => [typeof val === 'number' && val > 1000 ? val.toLocaleString() + ' คน' : val + '%', name]}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.ageGroup || ''}
                      />
                      <ReferenceLine y={55.9} stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'ค่าเฉลี่ยความสุขผู้สูงอายุ 55.9%', fill: '#7c3aed', fontSize: 12, fontWeight: 700 }} />
                      <Scatter
                        name="กลุ่มวัยผู้สูงอายุ"
                        data={SYNERGY_GRATITUDE_TABLE.filter((r) => !r.isSummaryRow && !r.isComparisonRow)}
                      >
                        {SYNERGY_GRATITUDE_TABLE.filter((r) => !r.isSummaryRow && !r.isComparisonRow).map((entry, idx) => (
                          <Cell key={idx} fill={entry.statusColor} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ marginTop: '16px', padding: '14px 18px', borderRadius: '14px', background: '#f5f3ff', border: '1px solid #ddd6fe', fontSize: '14px', color: '#4c1d95', lineHeight: 1.6 }}>
                  <strong>ปรากฏการณ์เกราะคุ้มกันทางใจ (Emotional Resilience Shield):</strong> แม้ผู้สูงอายุจะเจ็บป่วย/สุขภาพกายถดถอยถึง <strong>73.6% (10.32 ล้านคน)</strong> แต่ยังมีระดับความสุขสูงถึง <strong>55.9% (7.84 ล้านคน)</strong> เพราะได้รับการเกื้อกูลและความกตัญญูจากครอบครัวและชุมชน
                </div>
              </div>
            )}
            renderDrillDownContent={() => (
              <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                  กราฟต้นทาง: DUMBBELL PLOT (INTERGENERATIONAL GRATITUDE GAP)
                </span>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '6px 0 4px 0' }}>
                  ช่องว่างคะแนนความกตัญญูระหว่างกลุ่มเยาวชน (15–24 ปี) กับผู้สูงอายุ (60+ ปี) รายภูมิภาค
                </h4>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 16px 0' }}>
                  สัญญาณเตือนภัยเชิงโครงสร้าง: เยาวชนมีคะแนนความกตัญญูต่ำกว่าผู้สูงอายุเฉลี่ย <strong>-0.58 คะแนน</strong> (กทม. ห่างสูงสุด -0.76) ขณะที่วิทยากรด้านกตัญญูมีเพียง 10% ของระบบ
                </p>
                <div style={{ width: '100%', height: '340px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={GRATITUDE_INTERGENERATIONAL_GAP_BY_REGION}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="region" tick={{ fontSize: 12, fontWeight: 700 }} />
                      <YAxis yAxisId="left" domain={[3.0, 5.0]} tick={{ fontSize: 12 }} label={{ value: 'คะแนนกตัญญู (เต็ม 5)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 180]} tick={{ fontSize: 12 }} label={{ value: 'วิทยากรกตัญญู (คน)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#059669' } }} />
                      <RechartsTooltip />
                      <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                      <Bar yAxisId="right" dataKey="gratitudeLecturers" name="จำนวนวิทยากรด้านกตัญญู/ครอบครัว (คน)" fill="#d8b4fe" radius={[6, 6, 0, 0]} barSize={32} />
                      <Line yAxisId="left" type="monotone" dataKey="elderlyScore" name="คะแนนกตัญญูกลุ่มผู้สูงอายุ 60+ (เต็ม 5)" stroke="#059669" strokeWidth={3} dot={{ r: 6 }} />
                      <Line yAxisId="left" type="monotone" dataKey="youthScore" name="คะแนนกตัญญูกลุ่มเยาวชน 15-24 ปี (เต็ม 5)" stroke="#dc2626" strokeWidth={3} dot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          />

          {/* Processed Data Table */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              📋 ตารางชุดข้อมูลบูรณาการด้านที่ 4: คุณธรรมด้านกตัญญู vs สุขภาวะและความสุขในสังคมสูงวัย (Processed Data Table)
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>กลุ่มช่วงอายุ</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>คะแนนกตัญญู (เต็ม 5)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>จำนวนประชากรสูงวัย ปี 2567 (คน)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>สุขภาพกายพึงประสงค์ (คน)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>สุขภาพกายไม่พึงประสงค์ (คน)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ความสุขระดับมาก-มากที่สุด (คน)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>สัดส่วนผู้มีความสุขสูง (%)</th>
                    <th style={{ padding: '10px 12px' }}>บทบาทของพลังกตัญญูและครอบครัว</th>
                  </tr>
                </thead>
                <tbody>
                  {SYNERGY_GRATITUDE_TABLE.map((row) => (
                    <tr
                      key={row.ageGroup}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: row.isSummaryRow ? '#eff6ff' : row.isComparisonRow ? '#f5f3ff' : '#ffffff',
                        fontWeight: row.isSummaryRow || row.isComparisonRow ? 800 : 500
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{row.ageGroup}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: row.statusColor }}>
                        {row.gratitudeScore.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>
                        {row.elderlyPop2567 > 0 ? row.elderlyPop2567.toLocaleString() : '-'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>
                        {row.desirableHealthPop > 0 ? row.desirableHealthPop.toLocaleString() : '-'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>
                        {row.undesirableHealthPop > 0 ? `${row.undesirableHealthPop.toLocaleString()} (${row.undesirableHealthPct}%)` : '-'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#1e40af' }}>
                        {row.highHappinessPop > 0 ? row.highHappinessPop.toLocaleString() : '-'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: row.statusColor }}>
                        {row.highHappinessPct > 0 ? `${row.highHappinessPct.toFixed(1)}%` : '-'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, background: row.statusBg, color: row.statusColor }}>
                          {row.familyRoleSummary}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Analysis & Budget Targeting Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#f5f3ff', borderRadius: '18px', padding: '20px', border: '1.5px solid #ddd6fe' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#5b21b6', margin: '0 0 10px 0' }}>
                🔍 บทวิเคราะห์ความสัมพันธ์เชิงประจักษ์ (Super-Aged Society & Gratitude Buffer)
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#4c1d95', lineHeight: 1.65 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>ความกตัญญูคือเกราะคุ้มกันทางจิตใจ:</strong> แม้ผู้สูงอายุกว่า 73.6% (10.31 ล้านคน) จะมีภาวะสุขภาพกายไม่พึงประสงค์หรือเจ็บป่วยเรื้อรัง แต่ส่วนใหญ่ถึง 7.84 ล้านคน (55.9%) ยังมีความสุขในเกณฑ์สูงจากการดูแลเกื้อกูลของครอบครัว
                </li>
                <li>
                  <strong>วิกฤตขาดแคลนวิทยากรด้านกตัญญูและช่องว่างระหว่างวัย:</strong> วิทยากรด้านกตัญญูและสัมพันธภาพครอบครัวมีสัดส่วนน้อยที่สุดในระบบ (เพียง 10% หรือ ~535 คน) ขณะที่คะแนนความกตัญญูของเยาวชน (4.74) ต่ำกว่าผู้สูงอายุ (5.32) ถึง 0.58 คะแนน
                </li>
              </ul>
            </div>

            <div style={{ background: '#eff6ff', borderRadius: '18px', padding: '20px', border: '1.5px solid #bfdbfe' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 10px 0' }}>
                🎯 การชี้เป้าเพื่อทุ่มงบประมาณเชิงนโยบาย (Evidence-Based Budget Targeting)
              </h4>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8', marginBottom: '8px' }}>
                หน่วยงานรับผิดชอบหลัก: กระทรวง พม. • สำนักงานหลักประกันสุขภาพแห่งชาติ (สปสช.) • กรมอนามัย • กระทรวงการคลัง
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#1e293b', lineHeight: 1.65 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>บูรณาการงบ Long-Term Care (LTC):</strong> ผสานงบระบบดูแลระยะยาวของ สปสช. ร่วมกับศูนย์คุณธรรม ในการฝึกอบรม <strong>“ผู้บริบาลคุณธรรม (Moral Caregivers)”</strong> และอาสาสมัครพัฒนาสังคม (อพม.) เพื่อดูแลทั้งสุขภาวะกายและจิตใจผู้สูงอายุติดบ้าน/ติดเตียง
                </li>
                <li>
                  <strong>มาตรการภาษีดูแลบุพการีขั้นบันได:</strong> กระทรวงการคลังควรจัดสรรมาตรการลดหย่อนภาษีดูแลบุพการีแบบขั้นบันไดตามระดับภาวะพึ่งพิง เพื่อจูงใจให้วัยแรงงานดูแลผู้สูงอายุในครัวเรือน
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ASPECT 5: ด้านทุนชีวิต 4 พลังและจิตอาสา (LIFE CAPITAL & YOUTH UNEMPLOYMENT)
      ===================================================================== */}
      {activeAspect === 'lifecapital' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section Title Banner */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px 24px', border: '1.5px solid #fde68a', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                  มิติยุทธศาสตร์ด้านที่ 5 • SCHOOL-TO-WORK TRANSITION RISK & SOCIAL CAPITAL MULTIPLIER
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  🤝 ด้านทุนชีวิต 4 พลังและจิตอาสา: การพัฒนาภูมิคุ้มกันเยาวชนและแก้ปัญหาการว่างงาน (กสศ., อว., แรงงาน)
                </h3>
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0 }}>
                  <strong>ประเด็นเชิงนโยบาย:</strong> เสริมสร้างทุนชีวิต 4 พลัง (พลังตัวตน, พลังครอบครัว, พลังสร้างปัญญา, พลังชุมชน) และจิตอาสา เพื่อลดพฤติกรรมเสี่ยง แก้ปัญหาเยาวชนว่างงาน (กทม. พุ่งสูง 7.8%) และกลุ่มเปราะบาง (NEETs / ครัวเรือนยากจน TPMAP)
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#fef2f2', color: '#991b1b', fontSize: '12.5px', fontWeight: 700, border: '1px solid #fecaca' }}>
                  ว่างงานเยาวชน กทม.: 7.8% (พลังตัวตนต่ำสุด 4.65)
                </span>
                <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#fffbeb', color: '#92400e', fontSize: '12.5px', fontWeight: 700, border: '1px solid #fde68a' }}>
                  หนี้การศึกษาเฉลี่ย: 2,058 บาท (อีสานสูงสุด 3,415 บาท)
                </span>
              </div>
            </div>
          </div>

          {/* Main Strategic Card: Scatter Plot with Collapsible Radar 4 Pillars & NEETs Stacked Bar */}
          <SeniorDrillDownChartCard
            title="ความสัมพันธ์ระหว่างพลังตัวตนของเยาวชน (Self Power) vs อัตราว่างงานเยาวชน 15–24 ปี"
            badgeText="มิติยุทธศาสตร์ด้านที่ 5 • Youth YTRI Index"
            badgeColor="#f59e0b"
            headlineMetric="7.8%"
            headlineSubtext="อัตราว่างงานเยาวชนใน กทม. สูงสุด แม้พลังสร้างปัญญาสูง 5.08"
            subtitle="Scatter Plot: สหสัมพันธ์เชิงลบระหว่างทุนชีวิตพลังตัวตน (4.65–5.14) กับอัตราการว่างงานของเยาวชน (4.8%–7.8%)"
            formulaTitle={FORMULA_MORAL_CITY_YOUTH_YTRI.title}
            formulaExpression={FORMULA_MORAL_CITY_YOUTH_YTRI.formula}
            formulaVariables={FORMULA_MORAL_CITY_YOUTH_YTRI.variables}
            formulaNotes={FORMULA_MORAL_CITY_YOUTH_YTRI.notes}
            drillDownButtonLabel="🔍 เจาะลึกดูกราฟต้นทาง/ข้อมูลวิเคราะห์ (เรดาร์ทุนชีวิต 4 พลัง & สัดส่วนกลุ่มเป้าหมาย NEETs)"
            renderMainChart={() => (
              <div>
                <div style={{ width: '100%', height: '360px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 15, right: 25, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        dataKey="selfPowerScore"
                        name="คะแนนพลังตัวตน"
                        domain={[4.55, 5.20]}
                        tick={{ fontSize: 13 }}
                        label={{ value: 'คะแนนทุนชีวิต: พลังตัวตน (เต็ม 5)', position: 'bottom', offset: 2, style: { fontSize: 13, fontWeight: 700, fill: '#334155' } }}
                      />
                      <YAxis
                        type="number"
                        dataKey="youthUnemploymentPct"
                        name="อัตราว่างงานเยาวชน 15-24 ปี"
                        domain={[4.5, 8.5]}
                        unit="%"
                        tick={{ fontSize: 13 }}
                        label={{ value: 'อัตราว่างงานเยาวชน 15-24 ปี (%)', angle: -90, position: 'insideLeft', style: { fontSize: 13, fontWeight: 700, fill: '#dc2626' } }}
                      />
                      <ZAxis type="number" dataKey="eduDebtBaht" range={[260, 820]} name="หนี้เฉลี่ยเพื่อการศึกษา (บาท)" />
                      <RechartsTooltip
                        formatter={(val: any, name: any) => [val, name]}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.region || ''}
                      />
                      <ReferenceLine y={6.0} stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'Benchmark ว่างงานเยาวชน 6.0%', fill: '#dc2626', fontSize: 12, fontWeight: 700 }} />
                      <Scatter
                        name="ภูมิภาค"
                        data={SYNERGY_LIFECAPITAL_TABLE.filter((r) => !r.isNationalAvg)}
                      >
                        {SYNERGY_LIFECAPITAL_TABLE.filter((r) => !r.isNationalAvg).map((entry, idx) => (
                          <Cell key={idx} fill={entry.statusColor} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ marginTop: '16px', padding: '14px 18px', borderRadius: '14px', background: '#fffbeb', border: '1px solid #fde68a', fontSize: '14px', color: '#92400e', lineHeight: 1.6 }}>
                  <strong>Structural Youth Mismatch:</strong> กรุงเทพฯ มีคะแนนพลังสร้างปัญญาสูง (5.08) แต่อัตราว่างงานเยาวชนพุ่งสูงสุดถึง <strong>7.8%</strong> เพราะขาด <strong>“พลังตัวตน (4.65)”</strong> และทักษะความยืดหยุ่นทางอารมณ์ (Resilience) ในการปรับตัวเข้าสู่โลกการทำงานจริง
                </div>
              </div>
            )}
            renderDrillDownContent={() => (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
                {/* Secondary Chart 1: Radar 4 Pillars */}
                <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                    กราฟต้นทาง 1: RADAR CHART 4 มิติ (ทุนชีวิต 4 พลัง: กทม. vs ต่างจังหวัด)
                  </span>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '6px 0 4px 0' }}>
                    เปรียบเทียบทุนชีวิต 4 พลังระหว่างกรุงเทพฯ กับภูมิภาคอื่น
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0' }}>
                    พลังชุมชนและพลังตัวตนใน กทม. ต่ำกว่าภูมิภาคอย่างมีนัยสำคัญ
                  </p>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={LIFECAPITAL_4PILLARS_RADAR} outerRadius={95}>
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 12, fontWeight: 700, fill: '#1e293b' }} />
                        <PolarRadiusAxis angle={30} domain={[4.2, 5.4]} tick={{ fontSize: 11 }} />
                        <Radar name="กรุงเทพฯ และปริมณฑล" dataKey="bkkScore" stroke="#dc2626" fill="#dc2626" fillOpacity={0.28} />
                        <Radar name="ค่าเฉลี่ยภูมิภาคต่างจังหวัด" dataKey="regionalAvgScore" stroke="#059669" fill="#059669" fillOpacity={0.35} />
                        <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                        <RechartsTooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Secondary Chart 2: NEETs Target Group Coverage */}
                <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
                    กราฟต้นทาง 2: สัดส่วนกลุ่มเป้าหมายเยาวชนที่วิทยากรเข้าถึง
                  </span>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '6px 0 4px 0' }}>
                    โรงเรียนสายสามัญ vs อาชีวศึกษา vs เด็กนอกระบบ NEETs (%)
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0' }}>
                    วิทยากร 72% กระจุกในโรงเรียนสามัญ แต่เด็กกลุ่มเสี่ยง NEETs เข้าถึงได้เพียง 6.5%
                  </p>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={YOUTH_TARGET_GROUP_COVERAGE} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="region" tick={{ fontSize: 12, fontWeight: 700 }} />
                        <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                        <RechartsTooltip formatter={(v: any) => v + '%'} />
                        <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                        <Bar dataKey="formalSchoolPct" name="โรงเรียนสามัญในระบบ (%)" stackId="y" fill="#3b82f6" />
                        <Bar dataKey="vocationalPct" name="สถานศึกษาอาชีวศึกษา (%)" stackId="y" fill="#f59e0b" />
                        <Bar dataKey="neetVulnerablePct" name="เยาวชนนอกระบบ (NEETs) / เปราะบาง (%)" stackId="y" fill="#dc2626" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          />

          {/* Processed Data Table */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              📋 ตารางชุดข้อมูลบูรณาการด้านที่ 5: ทุนชีวิต 4 พลังและจิตอาสา vs ความมั่นคงของเยาวชนและแรงงาน (Processed Data Table)
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>ภูมิภาค</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>พลังตัวตน (เต็ม 5)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>พลังสร้างปัญญา (เต็ม 5)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>ทุนจิตอาสา (เต็ม 5)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>หนี้เฉลี่ยเพื่อการศึกษา (บาท/ครัวเรือน)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>อัตราว่างงานเยาวชน 15–24 ปี (%)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ครัวเรือนยากจน TPMAP (%)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>บัตรทอง UC (%)</th>
                    <th style={{ padding: '10px 12px' }}>ดัชนีความเปราะบางของเยาวชน</th>
                  </tr>
                </thead>
                <tbody>
                  {SYNERGY_LIFECAPITAL_TABLE.map((row) => (
                    <tr
                      key={row.region}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: row.isNationalAvg ? '#f1f5f9' : '#ffffff',
                        fontWeight: row.isNationalAvg ? 800 : 500
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{row.region}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: row.selfPowerScore < 4.75 ? '#dc2626' : '#059669' }}>
                        {row.selfPowerScore.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{row.wisdomPowerScore.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>{row.volunteerCapitalScore.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>{row.eduDebtBaht.toLocaleString()} บาท</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: row.youthUnemploymentPct >= 6.0 ? '#dc2626' : '#059669' }}>
                        {row.youthUnemploymentPct.toFixed(1)}%
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{row.tpmapPoorPct.toFixed(1)}%</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>{row.ucGoldCardPct.toFixed(1)}%</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, background: row.statusBg, color: row.statusColor }}>
                          {row.vulnerabilityStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Analysis & Budget Targeting Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#fffbeb', borderRadius: '18px', padding: '20px', border: '1.5px solid #fde68a' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#92400e', margin: '0 0 10px 0' }}>
                🔍 บทวิเคราะห์ความสัมพันธ์เชิงประจักษ์ (Structural Youth Mismatch)
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#78350f', lineHeight: 1.65 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>ปัญญาสูงแต่ขาดพลังตัวตนในเขตเมือง:</strong> กรุงเทพฯ มีคะแนนพลังสร้างปัญญาสูง (5.08) แต่อัตราการว่างงานเยาวชนกลับสูงที่สุดในประเทศ (7.8%) เนื่องจากขาด <strong>“พลังตัวตน (4.65)”</strong> และความยืดหยุ่นทางอารมณ์ ขณะที่วิทยากรเข้าถึงแต่โรงเรียนสามัญขนาดใหญ่ (78%) ไม่ถึงกลุ่มอาชีวะและเด็กนอกระบบ (NEETs)
                </li>
                <li>
                  <strong>ภูมิคุ้มกันชุมชนในภาคอีสาน:</strong> แม้ครัวเรือนภาคอีสานจะแบกรับหนี้เพื่อการศึกษาสูงสุด (3,415 บาท/ครัวเรือน) และมีครัวเรือนยากจน TPMAP 32.5% แต่มี <strong>ทุนจิตอาสาและพลังชุมชนสูงสุด (5.38 คะแนน)</strong> ช่วยประคับประคองเยาวชนไม่ให้ตกอยู่ในภาวะเปราะบางทางจิตใจ
                </li>
              </ul>
            </div>

            <div style={{ background: '#eff6ff', borderRadius: '18px', padding: '20px', border: '1.5px solid #bfdbfe' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 10px 0' }}>
                🎯 การชี้เป้าเพื่อทุ่มงบประมาณเชิงนโยบาย (Evidence-Based Budget Targeting)
              </h4>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8', marginBottom: '8px' }}>
                หน่วยงานรับผิดชอบหลัก: กองทุนเพื่อความเสมอภาคทางการศึกษา (กสศ.) • กระทรวง อว. • กระทรวงแรงงาน • กยศ.
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#1e293b', lineHeight: 1.65 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>โครงการ Life Capital Mentorship:</strong> กสศ. และกระทรวงแรงงานควรปฏิรูปงบพัฒนาทักษะ โดยจัดสรรงบส่งวิทยากรคุณธรรมและโค้ชทุนชีวิตเข้าประกบเยาวชนใน <strong>สถานศึกษาอาชีวศึกษา ศูนย์ฝึกอาชีพชุมชน และกลุ่ม NEETs</strong> เพื่อเสริม Soft Skills และพลังตัวตนก่อนเข้าสู่ตลาดงาน
                </li>
                <li>
                  <strong>ผูกชั่วโมงจิตอาสาลดหย่อนดอกเบี้ย กยศ.:</strong> ปรับเกณฑ์การชำระหนี้ กยศ. โดยผูกสิทธิประโยชน์การลดหย่อนดอกเบี้ยเข้ากับกิจกรรมจิตอาสาพัฒนาชุมชน เพื่อสร้างทุนทางสังคมควบคู่การปลดหนี้
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ASPECT 6: พิมพ์เขียวชี้เป้างบประมาณบูรณาการ (MASTER POLICY SYNERGY MATRIX)
      ===================================================================== */}
      {activeAspect === 'master_matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* 1. Supply-Demand Policy Framework Diagram */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
              1. กรอบแนวคิดการผสานข้อมูล (SUPPLY-DEMAND POLICY FRAMEWORK)
            </span>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '4px 0 14px 0' }}>
              การผสาน “ศักยภาพกำลังคนด้านคุณธรรม (Supply Side)” เข้ากับ “ข้อมูลความรุนแรงของปัญหาประเทศ (Demand Side)”
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', alignItems: 'stretch' }}>
              {/* Supply Box */}
              <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '18px', border: '2px solid #93c5fd' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a', marginBottom: '8px' }}>
                  🟦 SUPPLY SIDE: ศักยภาพกำลังคนคุณธรรม (ฐานข้อมูลวิทยากร: mdc_people 5,346 คน)
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#1e293b', lineHeight: 1.6 }}>
                  <li>มิติความเชี่ยวชาญคุณธรรม 5 ด้าน (สุจริต, พอเพียง, วินัยรับผิดชอบ, จิตอาสา, กตัญญู)</li>
                  <li>ภาคส่วนสังกัด (สถาบันการศึกษา, ปกครอง/ภาครัฐ, ประชาสังคม/ปราชญ์, ศาสนา, เอกชน)</li>
                  <li>พื้นที่ปฏิบัติงานจริง (76 จังหวัด, อำเภอ, ภูมิภาค) และสถานะ Active (2,462 คน)</li>
                  <li>ระดับสมรรถนะและศักยภาพการขยายผล (พี่เลี้ยงคุณธรรม Coach 596 คน / New Comer 4,750 คน)</li>
                </ul>
              </div>

              {/* Demand Box */}
              <div style={{ background: '#fef2f2', borderRadius: '16px', padding: '18px', border: '2px solid #fca5a5' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>
                  🟥 DEMAND SIDE: ข้อมูลปัญหาเชิงโครงสร้างประเทศ (Data Synergy 133 รายการ / สถิติแห่งชาติ)
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#1e293b', lineHeight: 1.6 }}>
                  <li>สถิติคดีทุจริตชี้มูล ป.ป.ช. (733 คดี / จัดซื้อจัดจ้าง 45.6%) และผลประเมิน ITA รายพื้นที่</li>
                  <li>ภาระหนี้สินครัวเรือนเพื่อการอุปโภคบริโภค (เฉลี่ย 5,624 บาท / กทม. 7,158 บาท) และเงินออม</li>
                  <li>สถิติเรื่องร้องเรียนการละเมิดสิทธิมนุษยชน กสม. (1,027 เรื่อง) และคดีอุบัติเหตุจราจร (538 คดี)</li>
                  <li>สัดส่วนประชากรสูงวัย 60+ (14.03 ล้านคน) และอัตราว่างงานเยาวชน 15–24 ปี / ครัวเรือน TPMAP</li>
                </ul>
              </div>

              {/* Outcome Box */}
              <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', borderRadius: '16px', padding: '18px', border: '2px solid #6ee7b7' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#065f46', marginBottom: '8px' }}>
                  🟩 EVIDENCE-BASED POLICY TARGETING (ชี้เป้าจัดสรรงบประมาณรัฐให้ตรงจุด)
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#064e3b', lineHeight: 1.6 }}>
                  <li><strong>Capacity & Allocation Gap:</strong> ชี้เป้าพื้นที่วิกฤตสีแดง (Red Zones 18 จังหวัด) ที่มีปัญหาสูงแต่ขาดแคลนวิทยากร</li>
                  <li><strong>Skill Mismatch Resolution:</strong> ปรับหลักสูตร Re-skill วิทยากรให้ตรงกับรากเหง้าปัญหาจริงในแต่ละพื้นที่</li>
                  <li><strong>Budget Reallocation:</strong> ตัดลดงบอบรมทั่วไปที่ซ้ำซ้อน โอนย้ายสู่งบปฏิบัติการเชิงรุกแบบมุ่งเป้า</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. Master Policy Synergy Matrix Table */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
              2. สรุปความเชื่อมโยงเชิงยุทธศาสตร์ (MASTER POLICY SYNERGY MATRIX)
            </span>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '4px 0 14px 0' }}>
              ตารางบูรณาการฐานข้อมูลวิทยากรคุณธรรม (mdc_people) กับตัวชี้วัดปัญหาของประเทศทั้ง 5 ด้าน
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>ประเด็นเชิงนโยบาย</th>
                    <th style={{ padding: '12px' }}>Dataset วิทยากรคุณธรรม (mdc_people)</th>
                    <th style={{ padding: '12px' }}>Dataset ชี้วัดปัญหาประเทศ (Data Synergy)</th>
                    <th style={{ padding: '12px' }}>วิธีวิเคราะห์ทางสถิติ</th>
                    <th style={{ padding: '12px' }}>รูปแบบกราฟ Dashboard</th>
                    <th style={{ padding: '12px' }}>เหตุผลเชิงประจักษ์ (Root Causes)</th>
                    <th style={{ padding: '12px' }}>หน่วยงานเป้าหมาย & ทิศทางการทุ่มงบประมาณ</th>
                  </tr>
                </thead>
                <tbody>
                  {MASTER_POLICY_SYNERGY_MATRIX.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                      <td style={{ padding: '12px', fontWeight: 800, color: row.accentColor, minWidth: '170px' }}>
                        {row.policyIssue}
                      </td>
                      <td style={{ padding: '12px', minWidth: '165px' }}>
                        {row.supplyDataset.map((d, i) => (
                          <div key={i}>• {d}</div>
                        ))}
                      </td>
                      <td style={{ padding: '12px', minWidth: '175px' }}>
                        {row.demandDataset.map((d, i) => (
                          <div key={i}>• {d}</div>
                        ))}
                      </td>
                      <td style={{ padding: '12px', minWidth: '160px', fontWeight: 600, color: '#334155' }}>
                        {row.analyticalMethods.map((m, i) => (
                          <div key={i}>• {m}</div>
                        ))}
                      </td>
                      <td style={{ padding: '12px', minWidth: '160px', color: '#1e40af', fontWeight: 700 }}>
                        {row.dashboardCharts.map((c, i) => (
                          <div key={i}>• {c}</div>
                        ))}
                      </td>
                      <td style={{ padding: '12px', minWidth: '210px', color: '#334155', lineHeight: 1.5 }}>
                        {row.rootCauses}
                      </td>
                      <td style={{ padding: '12px', minWidth: '230px', fontWeight: 700, color: '#0f172a', background: '#f8fafc', lineHeight: 1.5 }}>
                        {row.targetAgenciesAndBudget}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Master Evidence-Based Budget Reallocation Matrix */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1.5px solid #cbd5e1', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>
              3. สรุปพิมพ์เขียวการปรับทิศทางงบประมาณภาครัฐ (MASTER EVIDENCE-BASED BUDGET REALLOCATION MATRIX)
            </span>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '4px 0 14px 0' }}>
              ข้อเสนอการตัดลดงบอบรมเดิมที่ซ้ำซ้อน และโอนย้ายสู่การทุ่มงบประมาณมุ่งเป้าในพื้นที่วิกฤต (Red Zones)
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>มิติยุทธศาสตร์</th>
                    <th style={{ padding: '12px' }}>พื้นที่เป้าหมายวิกฤต (Red Zones)</th>
                    <th style={{ padding: '12px', color: '#991b1b' }}>รายการงบประมาณเดิมที่ควรปรับลด/ยกเลิก</th>
                    <th style={{ padding: '12px', color: '#065f46' }}>ทิศทางการทุ่มงบประมาณใหม่ที่ถูกต้องเชิงนโยบาย</th>
                    <th style={{ padding: '12px' }}>หน่วยงานหลักที่ต้องบูรณาการ</th>
                  </tr>
                </thead>
                <tbody>
                  {MASTER_BUDGET_REALLOCATION_MATRIX.map((row) => (
                    <tr key={row.dimension} style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                      <td style={{ padding: '12px', fontWeight: 800, color: row.badgeColor, whiteSpace: 'nowrap' }}>
                        {row.dimension}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#991b1b', background: '#fff1f2' }}>
                        {row.redZones}
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', textDecoration: 'line-through' }}>
                        {row.obsoleteBudgetToCut}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#065f46', background: '#ecfdf5' }}>
                        {row.targetedNewBudget}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#1e3a8a' }}>
                        {row.leadAgencies}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. BI-Ready Master Dataset & Python Data Connector Script */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                  4. โค้ดต้นแบบและชุดข้อมูลเชื่อมต่อระบบ BI (DATA CONNECTOR SCRIPT & BI-READY CSV)
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '3px 0 0 0' }}>
                  ชุดข้อมูลบูรณาการระดับภูมิภาค (bi_ready_moral_synergy_dashboard.csv) สำหรับ Looker Studio / Power BI / Tableau
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleDownloadBiCsv}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={15} />
                  <span>ดาวน์โหลด bi_ready_moral_synergy_dashboard.csv</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyPython}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    color: '#1e40af',
                    border: '1px solid #93c5fd',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copiedCode ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copiedCode ? 'คัดลอกโค้ด Python แล้ว' : 'คัดลอกโค้ด Python Connector'}</span>
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>region</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>sufficiency_score</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>discipline_score</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>integrity_score</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>public_mind_score</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>consumer_debt_baht</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>nacc_cases</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>procurement_fraud_pct</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>ita_ind9_scaled</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>discipline_ita_gap</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>youth_unemployment_pct</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>elderly_pop_60up</th>
                    <th style={{ padding: '8px 10px' }}>procurement_risk_tier</th>
                  </tr>
                </thead>
                <tbody>
                  {BI_READY_MASTER_DATASET.map((r) => (
                    <tr key={r.region} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700 }}>{r.region}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.sufficiency_score}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.discipline_score}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.integrity_score}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.public_mind_score}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.consumer_debt_baht.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.nacc_cases}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.procurement_fraud_pct}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.ita_ind9_scaled}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: r.discipline_ita_gap < -0.2 ? '#dc2626' : '#334155' }}>
                        {r.discipline_ita_gap}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.youth_unemployment_pct}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.elderly_pop_60up.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: r.procurement_risk_tier.includes('High') ? '#dc2626' : '#059669' }}>
                        {r.procurement_risk_tier}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <pre
              style={{
                background: '#0f172a',
                color: '#e2e8f0',
                padding: '16px',
                borderRadius: '14px',
                fontSize: '12px',
                overflowX: 'auto',
                lineHeight: 1.5,
                margin: 0
              }}
            >
              <code>{PYTHON_DATA_CONNECTOR_CODE}</code>
            </pre>
          </div>
        </div>
      )}
      {/* Senior-Friendly KaTeX Formula Drawer Modal */}
      <ChartFormulaDrawer
        isOpen={Boolean(selectedFormula)}
        data={selectedFormula}
        onClose={() => setSelectedFormula(null)}
      />
    </div>
  );
};
