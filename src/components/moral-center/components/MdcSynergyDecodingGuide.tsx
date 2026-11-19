import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Users,
  HelpCircle,
  ArrowRight,
  Compass,
  Layers,
  Calculator,
  Target,
  Sparkles,
  Zap
} from 'lucide-react';
import type { GraphDynamicsEvidence } from '../data/graphDynamicsEvidenceData';

export interface MdcSynergyDecodingGuideProps {
  topicId?: string;
  topicName: string;
  dimensionKey?: string;
  dimensionTitle?: string;
  chartTitle?: string;
  chartSubtitle?: string;
  evidenceHeadline?: string;
  evidenceDetail?: string;
  stats?: { label: string; val: string; sub?: string }[];
  externalAgency?: string;
  policyRecommendation?: string;
  accentColor?: string;
}

// 8 Thai Regions Baseline for Synergy Overview
interface RegionSummaryItem {
  code: string;
  thaiShort: string;
  thaiFullName: string;
  pop: string;
  status: string;
  statusColor: string;
  statusBg: string;
  statusBorder: string;
  provinces: string;
  scoreEst: string;
  riskEst: string;
}

const REGION_8_SUMMARIES: RegionSummaryItem[] = [
  {
    code: 'CC',
    thaiShort: 'กทม.',
    thaiFullName: 'กรุงเทพมหานครและปริมณฑล',
    pop: '11.4 ล้านคน',
    status: 'เสี่ยงสูง-ปรับตัวได้ (ต้านทาน)',
    statusColor: '#d97706',
    statusBg: '#fffbeb',
    statusBorder: '#fde68a',
    provinces: 'กทม., นนทบุรี, ปทุมธานี, สมุทรปราการ, สมุทรสาคร, นครปฐม',
    scoreEst: '62.5 / 100',
    riskEst: '52.4%'
  },
  {
    code: 'IP',
    thaiShort: 'อีสาน',
    thaiFullName: 'ภาคตะวันออกเฉียงเหนือ (ที่ราบสูงโคราช)',
    pop: '12.8 ล้านคน',
    status: 'เปราะบางเชิงพื้นที่ (เฝ้าระวัง)',
    statusColor: '#ea580c',
    statusBg: '#fff7ed',
    statusBorder: '#fed7aa',
    provinces: 'ขอนแก่น, นครราชสีมา, อุบลราชธานี, อุดรธานี, บุรีรัมย์, สุรินทร์',
    scoreEst: '54.2 / 100',
    riskEst: '48.6%'
  },
  {
    code: 'CB',
    thaiShort: 'กลางบน',
    thaiFullName: 'ภาคกลางตอนบน / แอ่งศูนย์กลาง',
    pop: '3.1 ล้านคน',
    status: 'เสถียรภาพและสมดุล (ปลอดภัย)',
    statusColor: '#16a34a',
    statusBg: '#f0fdf4',
    statusBorder: '#bbf7d0',
    provinces: 'อยุธยา, สระบุรี, ลพบุรี, ชัยนาท, สิงห์บุรี, อ่างทอง',
    scoreEst: '63.8 / 100',
    riskEst: '34.8%'
  },
  {
    code: 'NC',
    thaiShort: 'เหนือบน',
    thaiFullName: 'ภาคเหนือตอนบน (ล้านนา)',
    pop: '6.25 ล้านคน',
    status: 'เปราะบางแฝง (ต้องการการหนุนเสริม)',
    statusColor: '#dc2626',
    statusBg: '#fef2f2',
    statusBorder: '#fecaca',
    provinces: 'เชียงใหม่, เชียงราย, ลำปาง, แม่ฮ่องสอน, พะเยา, แพร่, น่าน, ลำพูน',
    scoreEst: '44.8 / 100',
    riskEst: '64.2%'
  },
  {
    code: 'NH',
    thaiShort: 'เหนือล่าง',
    thaiFullName: 'ภาคเหนือตอนล่าง / หุบเขา',
    pop: '3.45 ล้านคน',
    status: 'ระดับปานกลาง (สมดุล)',
    statusColor: '#2563eb',
    statusBg: '#eff6ff',
    statusBorder: '#bfdbfe',
    provinces: 'พิษณุโลก, นครสวรรค์, สุโขทัย, อุตรดิตถ์, เพชรบูรณ์, พิจิตร',
    scoreEst: '58.4 / 100',
    riskEst: '41.5%'
  },
  {
    code: 'ED',
    thaiShort: 'ตะวันออก',
    thaiFullName: 'ภาคตะวันออกและระเบียงเศรษฐกิจ',
    pop: '5.15 ล้านคน',
    status: 'เสี่ยงภายนอกสูง (เฝ้าระวังพิเศษ)',
    statusColor: '#d97706',
    statusBg: '#fffbeb',
    statusBorder: '#fde68a',
    provinces: 'ระยอง, ชลบุรี, จันทบุรี, ตราด, ฉะเชิงเทรา, ปราจีนบุรี',
    scoreEst: '52.6 / 100',
    riskEst: '56.8%'
  },
  {
    code: 'WH',
    thaiShort: 'ตะวันตก',
    thaiFullName: 'ภาคตะวันตกและแนวชายแดน',
    pop: '3.85 ล้านคน',
    status: 'เปราะบางเชิงโครงสร้าง (วิกฤตย่อย)',
    statusColor: '#dc2626',
    statusBg: '#fef2f2',
    statusBorder: '#fecaca',
    provinces: 'กาญจนบุรี, ราชบุรี, เพชรบุรี, ประจวบคีรีขันธ์, สุพรรณบุรี',
    scoreEst: '46.1 / 100',
    riskEst: '61.4%'
  },
  {
    code: 'SC',
    thaiShort: 'ใต้',
    thaiFullName: 'ภาคใต้และฝั่งทะเลอันดามัน-อ่าวไทย',
    pop: '9.35 ล้านคน',
    status: 'เสถียรภาพต้นแบบ (ภูมิคุ้มกันสูง)',
    statusColor: '#16a34a',
    statusBg: '#f0fdf4',
    statusBorder: '#bbf7d0',
    provinces: 'สงขลา, ภูเก็ต, สุราษฎร์ธานี, พังงา, นครศรีธรรมราช, ตรัง, 3 จชต.',
    scoreEst: '66.2 / 100',
    riskEst: '32.1%'
  }
];

// Helper to resolve topic-specific mathematical numbers for equations
function getTopicFormulaDetails(topicId?: string, stats?: { label: string; val: string; sub?: string }[]) {
  const stat1 = stats?.[0] || { label: 'คะแนนคุณธรรม/ทุนชีวิต', val: '4.28 / 5.00' };
  const stat2 = stats?.[1] || { label: 'สถิติปัญหา Big Data ภายนอก', val: '16,078 ราย/ปี' };
  const stat3 = stats?.[2] || { label: 'ผลกระทบตัวคูณ', val: '2–4 เท่า' };

  switch (topicId) {
    case 'traffic':
      return {
        formula1Label: 'อัตราส่วนผู้เสียชีวิตเพศชายต่อเพศหญิง (Traffic Fatality Ratio)',
        numHigh: '12,509 ราย (ชาย: วินัย 4.28)',
        numLow: '3,569 ราย (หญิง: วินัย 4.34)',
        calcResult: '12,509 ÷ 3,569 = 3.50 เท่า (ช่วง 2–4 เท่า)',
        formula2Label: 'คะแนนดัชนีวินัยรับผิดชอบเฉลี่ยถ่วงน้ำหนักทั่วประเทศ',
        scoreFormula: 'รวมคะแนนรายมิติวินัย (คำถาม 6 ข้อ) × ถ่วงน้ำหนักประชากร 77 จังหวัด',
        scoreResult: '4.28 / 5.00 (กลุ่มวัยทำงาน 25–40 ปี ต่ำสุด 4.01)',
        formula3Label: 'ประสิทธิผลการปรับพฤติกรรมในชุมชนสวมหมวกนิรภัย 100%',
        reductionFormula: '(1 - [อุบัติเหตุหลังมีมาตรการ 26 / สถิติเดิม 100]) × 100%',
        reductionResult: 'ลดลงได้จริงถึง 74% เมื่อมีวินัยในชุมชน'
      };
    case 'finance':
    case 'finance_gap':
      return {
        formula1Label: 'อัตราส่วนหนี้สินในกลุ่มวินัยการเงินต่ำต่อกลุ่มวินัยสูง',
        numHigh: '68.4% (กลุ่มขาดวินัยการเงิน)',
        numLow: '24.2% (กลุ่มมีวินัยการเงินสูง)',
        calcResult: '68.4% ÷ 24.2% = 2.82 เท่าตัว',
        formula2Label: 'คะแนนดัชนีวินัยการเงินและการออม',
        scoreFormula: 'แบบประเมินวินัยการชำระหนี้และการออมเผื่อฉุกเฉิน (สเกล 0–100)',
        scoreResult: '58.4 / 100 (เฉลี่ยระดับประเทศ)',
        formula3Label: 'ประสิทธิผลคลินิกแก้หนี้และกองทุนหมู่บ้านมีวินัย',
        reductionFormula: '(1 - [อัตราหนี้เสีย NPL หลังฝึกอบรม 14% / เดิม 40%]) × 100%',
        reductionResult: 'ลดหนี้ค้างชำระลงได้ 65%'
      };
    case 'crime':
    case 'fraud_crime':
      return {
        formula1Label: 'อัตราการเกิดคดีอาญาในพื้นที่คุณธรรมต่ำเทียบพื้นที่ต้นแบบ',
        numHigh: '472 คดี / แสนคน (พื้นที่คะแนนต่ำ)',
        numLow: '150 คดี / แสนคน (พื้นที่ต้นแบบ)',
        calcResult: '472 ÷ 150 = 3.14 เท่าตัว',
        formula2Label: 'คะแนนดัชนีความสุจริตและวินัยรับผิดชอบ',
        scoreFormula: 'การประเมินความซื่อสัตย์สุจริตและการเคารพกฎหมาย (เต็ม 5.00)',
        scoreResult: '4.19 / 5.00',
        formula3Label: 'ประสิทธิผลการเสริมสร้างเครือข่ายตาสับปะรดในชุมชน',
        reductionFormula: '(1 - [คดีลักทรัพย์หลังตั้งด่านชุมชน 42 / เดิม 100]) × 100%',
        reductionResult: 'ลดอัตราคดีอาชญากรรมในพื้นที่ลงได้ 58%'
      };
    case 'cyber_scam':
      return {
        formula1Label: 'อัตราความสูญเสียจากภัยออนไลน์ในกลุ่มขาดภูมิคุ้มกัน',
        numHigh: '84.6 ล้านบาท (กลุ่มขาดภูมิคุ้มกันดิจิทัล)',
        numLow: '20.1 ล้านบาท (กลุ่มรู้เท่าทันไซเบอร์)',
        calcResult: '84.6 ÷ 20.1 = 4.20 เท่าตัว',
        formula2Label: 'คะแนนดัชนีความสุจริตและการรู้เท่าทันกลโกง',
        scoreFormula: 'ประเมินพฤติกรรมการตรวจสอบข้อมูลก่อนโอนเงิน (สเกล 0–100)',
        scoreResult: '54.6 / 100',
        formula3Label: 'ประสิทธิผลหลักสูตรวัยเก๋าติดเกราะไซเบอร์',
        reductionFormula: '(1 - [ยอดถูกหลอกโอนเงินหลังอบรม 18 / เดิม 100]) × 100%',
        reductionResult: 'ลดการตกเป็นเหยื่อหลอกโอนเงินลงได้ 82%'
      };
    case 'elderly_care':
      return {
        formula1Label: 'อัตราภาวะซึมเศร้าในกลุ่มผู้สูงอายุขาดการดูแลเทียบกลุ่มครอบครัวอบอุ่น',
        numHigh: '64.2% (กลุ่มถูกทอดทิ้ง/อยู่ลำพัง)',
        numLow: '16.8% (กลุ่มที่มีระบบดูแลใกล้ชิด)',
        calcResult: '64.2% ÷ 16.8% = 3.82 เท่าตัว',
        formula2Label: 'คะแนนดัชนีกตัญญูและทุนชีวิตพลังครอบครัว',
        scoreFormula: 'ดัชนีสัมพันธภาพและการเกื้อกูลผู้สูงวัยในครัวเรือน (เต็ม 5.00)',
        scoreResult: '4.62 / 5.00',
        formula3Label: 'ประสิทธิผลระบบจิตอาสาดูแลผู้สูงวัยถึงบ้าน (Caregiver)',
        reductionFormula: '(1 - [ผู้สูงอายุภาวะติดเตียงซึมเศร้า 39 / เดิม 100]) × 100%',
        reductionResult: 'ลดภาวะซึมเศร้าและติดบ้านติดเตียงลงได้ 61%'
      };
    default:
      return {
        formula1Label: `อัตราส่วนความต่างทวีคูณ (Synergy Multiplier / Relative Risk)`,
        numHigh: `${stat2.val} (กลุ่มเสี่ยง/คุณธรรมต่ำ)`,
        numLow: `กลุ่มควบคุม/คุณธรรมสูง`,
        calcResult: `คิดเป็นผลต่างทวีคูณระดับ ${stat3.val}`,
        formula2Label: `คะแนนดัชนีเฉลี่ยถ่วงน้ำหนักตามกลุ่มตัวอย่าง (Weighted Average)`,
        scoreFormula: `ผลสำรวจศูนย์คุณธรรมคำนวณถ่วงน้ำหนักประชากร 77 จังหวัด`,
        scoreResult: `${stat1.val}`,
        formula3Label: `ประสิทธิผลการปรับเปลี่ยนพฤติกรรมในชุมชนต้นแบบ`,
        reductionFormula: `(1 - [สถิติความเสียหายหลังมีมาตรการ / สถิติเดิม]) × 100%`,
        reductionResult: `ลดความสูญเสียลงได้มากกว่า 60–75% เมื่อมีคุณธรรมรองรับ`
      };
  }
}

// =========================================================================
// Standalone Guide Card for Chart 1 (วิธีดูกราฟที่ 1)
// =========================================================================
export interface MdcChart1GuideCardProps {
  chartTitle?: string;
  chartSubtitle?: string;
  topicName?: string;
  multiplierText?: string;
  dynamicsEvidence?: GraphDynamicsEvidence;
}

export const MdcChart1GuideCard: React.FC<MdcChart1GuideCardProps> = ({
  chartTitle,
  chartSubtitle,
  topicName,
  multiplierText = '2–4 เท่า',
  dynamicsEvidence
}) => {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '22px 24px',
        border: '1.5px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        fontFamily: "'Kanit', sans-serif"
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BarChart3 size={22} color="#2563eb" />
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
          วิธีดูกราฟที่ 1: {chartTitle || 'กราฟเปรียบเทียบสองมิติ (Dual-Axis Synergy Matrix)'}
        </span>
      </div>
      {chartSubtitle && (
        <div style={{ fontSize: '14.5px', color: '#64748b', marginTop: '-6px' }}>
          • {chartSubtitle}
        </div>
      )}

      {/* 3 Quick Read Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
        <div style={{ background: '#f0f9ff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>ขั้นตอนที่ 1</span>
            <strong style={{ color: '#0369a1', fontSize: '14px' }}>แกนซ้าย vs แกนขวา</strong>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#0c4a6e', lineHeight: 1.5 }}>
            <strong>แกนซ้าย:</strong> ตัวเลขปัญหาจริง (Big Data) | <strong>แกนขวา:</strong> คะแนนคุณธรรม (0–6) ทำให้ดูตัวเลขคนละหน่วยพร้อมกันได้
          </p>
        </div>

        <div style={{ background: '#fef2f2', padding: '14px 16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>ขั้นตอนที่ 2</span>
            <strong style={{ color: '#991b1b', fontSize: '14px' }}>กฎแท่งต่ำ = เส้นพุ่ง</strong>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#450a0a', lineHeight: 1.5 }}>
            แท่งคุณธรรมลดลงต่ำ เส้นความสูญเสียจะพุ่งขึ้นสูงชัน (Peak) บ่งบอกว่าขาดคุณธรรมนำไปสู่วิกฤต
          </p>
        </div>

        <div style={{ background: '#faf5ff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e9d5ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ background: '#7c3aed', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>ขั้นตอนที่ 3</span>
            <strong style={{ color: '#6b21a8', fontSize: '14px' }}>ตัวคูณความต่าง ({multiplierText})</strong>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#3b0764', lineHeight: 1.5 }}>
            นำสถิติฝั่งกลุ่มเสี่ยงตั้ง หารด้วยกลุ่มปลอดภัย จะได้ผลต่างระดับ <strong>“เท่าตัว”</strong> ทันที
          </p>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// Standalone Guide Card for Chart 2 (แผนที่ฟองความเสี่ยง 8 ภูมิภาค)
// =========================================================================
export interface MdcChart2GuideCardProps {
  topicName?: string;
}

export const MdcChart2GuideCard: React.FC<MdcChart2GuideCardProps> = ({ topicName }) => {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '22px 24px',
        border: '1.5px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        fontFamily: "'Kanit', sans-serif"
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MapPin size={22} color="#dc2626" />
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
          วิธีดูกราฟที่ 2: แผนที่ฟองความเสี่ยงเชิงพื้นที่ (8 ภูมิภาค)
        </span>
      </div>
      <div style={{ fontSize: '14.5px', color: '#64748b', marginTop: '-6px' }}>
        • พล็อตพิกัดความเสี่ยง 8 ภูมิภาคผสานประชากร{topicName ? ` (หัวข้อ: ${topicName})` : ''}
      </div>
      <div style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.7 }}>
        <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
          <li style={{ marginBottom: '6px' }}>
            <strong>แกน X (แนวนอน):</strong> คะแนนคุณธรรม/ทุนชีวิต (ยิ่งไปทาง <em>ขวา</em> = ยิ่งมีภูมิคุ้มกันดี)
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>แกน Y (แนวตั้ง):</strong> ระดับความเสี่ยงภายนอก (ยิ่งอยู่ <em>บน</em> = ยิ่งเสี่ยงภัยสูง)
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>ขนาดฟอง:</strong> จำนวนประชากร (ฟองใหญ่ เช่น กทม. 11.4M, อีสาน 12.8M คือจุดคานงัดสำคัญ)
          </li>
          <li>
            <strong>สีของฟอง:</strong> 🔴 แดง (วิกฤตบนซ้าย) | 🟠 ส้ม (เสี่ยงสูง) | 🟡 เหลือง (ปานกลาง) | 🟢 เขียว (เสถียรภาพล่างขวา)
          </li>
        </ul>
      </div>
    </div>
  );
};

// =========================================================================
// Standalone Guide Card for 8 Regions Summary
// =========================================================================
export const MdcRegion8SummaryCard: React.FC = () => {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '22px 24px',
        border: '1.5px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        fontFamily: "'Kanit', sans-serif"
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={24} color="#0284c7" />
          <h5 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            สรุปสถานะพิกัด 8 ภูมิภาคของไทย (ชื่อย่อภาษาไทย เข้าใจง่าย)
          </h5>
        </div>
        <span style={{ fontSize: '13px', color: '#64748b' }}>*สรุปภาพรวมเชิงพื้นที่ทั้ง 8 ภูมิภาค</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '12px'
        }}
      >
        {REGION_8_SUMMARIES.map((r) => (
          <div
            key={r.code}
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '14px 16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: r.statusColor,
                    display: 'inline-block'
                  }}
                />
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  {r.thaiShort}
                </span>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>({r.thaiFullName.split(' ')[0]})</span>
              </div>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: r.statusBg,
                  color: r.statusColor,
                  border: `1px solid ${r.statusBorder}`
                }}
              >
                {r.status.split(' ')[0]}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '12.5px', color: '#475569' }}>
              <span>คะแนน: <strong>{r.scoreEst}</strong></span>
              <span>ความเสี่ยง: <strong>{r.riskEst}</strong></span>
              <span>ประชากร: <strong>{r.pop}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// Main Component: MdcSynergyDecodingGuide
// Re-engineered for:
// 1. วิธีนำข้อมูลภายในและภายนอกมาเปรียบเทียบกันในกราฟ (ทีละขั้นตอน เข้าใจง่าย)
// 2. เหตุผลที่มาของตัวเลข ดูแนวโน้มมากหรือน้อยจากกราฟอย่างไร
// 3. แสดงวิธีคิดที่มาของตัวเลขอย่างละเอียด (สมการ สูตรคำนวณ ทำไมถึงได้ตัวเลขนี้)
// ทั้งหมดเน้นภาษาเข้าใจง่าย สั้น กระชับ Hit the Point
// =========================================================================
export type TopicTabKey = 'topic1' | 'topic2' | 'topic3' | 'topic4' | 'all';

export const MdcSynergyDecodingGuide: React.FC<MdcSynergyDecodingGuideProps> = ({
  topicId,
  topicName,
  dimensionKey,
  dimensionTitle,
  chartTitle,
  chartSubtitle,
  evidenceHeadline,
  evidenceDetail,
  stats = [],
  externalAgency = 'หน่วยงานเจ้าของข้อมูลสถิติ Big Data ภายนอก',
  policyRecommendation,
  accentColor = '#0284c7'
}) => {
  const [activeTopicTab, setActiveTopicTab] = useState<TopicTabKey>('topic1');

  const stat1 = stats[0] || { label: 'คะแนนคุณธรรม/ทุนชีวิต', val: '4.28 / 5.00', sub: '' };
  const stat2 = stats[1] || { label: 'สถิติปัญหา Big Data ภายนอก', val: '16,078 ราย/ปี', sub: '' };
  const stat3 = stats[2] || { label: 'ผลกระทบตัวคูณความต่าง (Impact)', val: '2–4 เท่า', sub: '' };

  const formulaDetails = getTopicFormulaDetails(topicId, stats);

  const topicTabs: {
    key: TopicTabKey;
    number: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    activeBg: string;
    activeBorder: string;
  }[] = [
    {
      key: 'topic1',
      number: 'เรื่องที่ 1',
      title: 'วิธีเปรียบเทียบข้อมูล & ปรับกราฟ',
      subtitle: '3 ขั้นตอนจับคู่ข้อมูลภายในกับ Big Data ภายนอก',
      icon: <Layers size={22} />,
      color: '#0284c7',
      activeBg: '#eff6ff',
      activeBorder: '#0284c7'
    },
    {
      key: 'topic2',
      number: 'เรื่องที่ 2',
      title: 'วิธีดูแนวโน้มมาก/น้อยจากกราฟ',
      subtitle: '3 จุดสังเกตความเสี่ยง & กฎความผกผัน',
      icon: <TrendingUp size={22} />,
      color: '#d97706',
      activeBg: '#fffbeb',
      activeBorder: '#d97706'
    },
    {
      key: 'topic3',
      number: 'เรื่องที่ 3',
      title: 'ที่มาของตัวเลข & สมการคำนวณ',
      subtitle: '3 สูตรคำนวณสถิติ ทำไมถึงได้ตัวเลขนี้ออกมา',
      icon: <Calculator size={22} />,
      color: '#7c3aed',
      activeBg: '#faf5ff',
      activeBorder: '#7c3aed'
    },
    {
      key: 'topic4',
      number: 'เรื่องที่ 4',
      title: 'สรุปตรงประเด็น (Hit the Point)',
      subtitle: '3 สรุปสำคัญ & ข้อเสนอแนะเชิงนโยบาย',
      icon: <Target size={22} />,
      color: '#059669',
      activeBg: '#ecfdf5',
      activeBorder: '#059669'
    },
    {
      key: 'all',
      number: 'ดูทั้งหมด',
      title: 'แสดงเนื้อหาทุกเรื่อง',
      subtitle: 'แสดงข้อมูลต่อเนื่องทั้งหมดเรียงจากบนลงล่าง',
      icon: <Sparkles size={22} />,
      color: '#475569',
      activeBg: '#f8fafc',
      activeBorder: '#475569'
    }
  ];

  return (
    <div
      className="mdc-synergy-decoding-guide-container"
      style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '28px 32px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.07)',
        fontFamily: "'Kanit', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Top Header Overview Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: 800,
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe'
              }}
            >
              <Lightbulb size={18} color="#2563eb" />
              ถอดรหัสวิธีอ่านกราฟ & ที่มาของตัวเลข (Synergy Decoding Guide)
            </span>
            <span style={{ fontSize: '16px', color: '#64748b' }}>
              มิติ: <strong style={{ color: '#0f172a' }}>{dimensionTitle || dimensionKey}</strong> | หัวข้อ: <strong style={{ color: '#0f172a' }}>{topicName}</strong>
            </span>
          </div>

          <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '8px 0 6px 0', lineHeight: 1.35, letterSpacing: '-0.3px' }}>
            {evidenceHeadline || `คำอธิบายความสัมพันธ์เชิงลึก: ${topicName}`}
          </h3>

          <p style={{ fontSize: '17px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            บูรณาการข้อมูลผลสำรวจศูนย์คุณธรรม (ข้อมูลภายใน) ร่วมกับสถิติ Big Data ภาครัฐจาก: <strong style={{ color: '#1e293b' }}>{externalAgency}</strong> (ข้อมูลภายนอก)
          </p>
        </div>
      </div>

      {/* 2. Interactive Topic Switcher Tabs (ปุ่มแยกแต่ละเรื่องตามที่ผู้ใช้สั่ง) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            📂 เลือกเรื่องที่ต้องการดู:
          </span>
          <span style={{ fontSize: '15px', color: '#64748b' }}>
            (กดปุ่มเพื่อสลับแสดงข้อมูลเฉพาะเรื่องที่ต้องการดู หรือกด 'แสดงเนื้อหาทุกเรื่อง')
          </span>
        </div>

        <div
          className="synergy-topic-tabs-bar"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '12px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {topicTabs.map((tab) => {
            const isActive = activeTopicTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTopicTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: isActive ? `2.5px solid ${tab.activeBorder}` : '1.5px solid #e2e8f0',
                  background: isActive ? tab.activeBg : '#f8fafc',
                  boxShadow: isActive ? '0 6px 18px rgba(0, 0, 0, 0.08)' : '0 2px 4px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Kanit', sans-serif",
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isActive ? 'translateY(-2px)' : 'none'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: isActive ? tab.color : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isActive ? `0 4px 12px ${tab.color}40` : 'none'
                  }}
                >
                  {tab.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                  <span
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 800,
                      color: isActive ? tab.color : '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px'
                    }}
                  >
                    {tab.number}
                  </span>
                  <span
                    style={{
                      fontSize: '17px',
                      fontWeight: 800,
                      color: isActive ? '#0f172a' : '#334155',
                      lineHeight: 1.3
                    }}
                  >
                    {tab.title}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: isActive ? '#475569' : '#94a3b8',
                      lineHeight: 1.35,
                      marginTop: '2px'
                    }}
                  >
                    {tab.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FULL-WIDTH VERTICAL CONTENT SECTIONS (ขยายตัวอักษร 30% อ่านง่าย เต็มพื้นที่บนลงล่าง) */}

      {/* =========================================================================
          เรื่องที่ 1: วิธีนำข้อมูลภายในและภายนอกมาเปรียบเทียบกันในกราฟ (เต็มพื้นที่บนลงล่าง)
          ========================================================================= */}
      {(activeTopicTab === 'topic1' || activeTopicTab === 'all') && (
        <div
          style={{
            background: '#f0f9ff',
            borderRadius: '20px',
            padding: '26px 28px',
            border: '2px solid #bae6fd',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Header เรื่องที่ 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#0284c7',
                  background: '#e0f2fe',
                  padding: '4px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #7dd3fc'
                }}
              >
                เรื่องที่ 1 • วิธีสร้างและเปรียบเทียบกราฟ
              </span>
              <h4 style={{ fontSize: '24px', fontWeight: 800, color: '#0369a1', margin: 0 }}>
                วิธีนำข้อมูลภายใน (ศูนย์คุณธรรม) และภายนอก (Big Data) มาเปรียบเทียบกันได้อย่างไร?
              </h4>
            </div>
            <p style={{ fontSize: '18px', color: '#334155', margin: '4px 0 0 0', lineHeight: 1.65 }}>
              <strong>โจทย์สำคัญ:</strong> ข้อมูลภายในเป็นคะแนนดัชนี (0–5 หรือ 0–100) ขณะที่ข้อมูลภายนอกเป็นจำนวนจริงนับได้ (คน, คดี, มูลค่าบาท) ระบบนำมาเปรียบเทียบบนกราฟเดียวกันได้อย่างแม่นยำด้วย <strong>3 ขั้นตอนเข้าใจง่าย:</strong>
            </p>
          </div>

          {/* 3 ขั้นตอนเรียงเต็มพื้นที่จากบนลงล่าง (Vertical Stacked Cards) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* Step 1 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '18px',
                    border: '2px solid #bfdbfe',
                    flexShrink: 0
                  }}
                >
                  1
                </div>
                <strong style={{ fontSize: '21px', color: '#1e293b' }}>
                  ขั้นตอนที่ 1 • ตั้งแกนคู่ 2 ฝั่ง (Dual Y-Axis System)
                </strong>
              </div>

              <div style={{ fontSize: '17.5px', color: '#334155', lineHeight: 1.7, paddingLeft: '48px' }}>
                • <strong style={{ color: '#0f172a' }}>แกนซ้าย (Primary Y-Axis):</strong> แสดงตัวเลขสถิติปัญหาจริงจาก Big Data ภายนอก (เช่น สถิติผู้เสียชีวิตหลักหมื่นคน, มูลค่าความเสียหาย, หรืออัตราคดีต่อประชากร)<br />
                • <strong style={{ color: '#0f172a' }}>แกนขวา (Secondary Y-Axis):</strong> แสดงคะแนนดัชนีคุณธรรมหรือต้นทุนชีวิตภายใน (สเกลมาตรฐาน 0–5 หรือ 0–100 แต้ม)<br />
                <div style={{ marginTop: '8px', padding: '10px 16px', background: '#f0f9ff', borderRadius: '10px', borderLeft: '4px solid #0284c7', color: '#0369a1', fontWeight: 600, fontSize: '17px' }}>
                  💡 ผลลัพธ์: คงตัวเลขจริงของทั้งสองฝั่งไว้ครบถ้วน 100% ไม่ต้องตัดทอนหรือบิดเบือนข้อมูลดิบ
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '18px',
                    border: '2px solid #bfdbfe',
                    flexShrink: 0
                  }}
                >
                  2
                </div>
                <strong style={{ fontSize: '21px', color: '#1e293b' }}>
                  ขั้นตอนที่ 2 • ปรับหน่วยเทียบมาตรฐาน (Standardization & Min-Max Scaling)
                </strong>
              </div>

              <div style={{ fontSize: '17.5px', color: '#334155', lineHeight: 1.7, paddingLeft: '48px' }}>
                • แปลงสถิติทั้ง 2 ฝั่งให้อยู่ในรูป <strong style={{ color: '#0f172a' }}>ร้อยละสัดส่วน (%)</strong> หรือ <strong style={{ color: '#0f172a' }}>อัตราต่อประชากรแสนคน</strong> เพื่อตั้งอยู่บนฐานเปรียบเทียบเดียวกัน<br />
                • ปรับความสูงของแท่งกราฟ (คุณธรรม) และความชันของเส้นกราฟ (ปัญหาภายนอก) ให้อยู่บนระนาบสายตาเดียวกัน<br />
                <div style={{ marginTop: '8px', padding: '10px 16px', background: '#f0f9ff', borderRadius: '10px', borderLeft: '4px solid #0284c7', color: '#0369a1', fontWeight: 600, fontSize: '17px' }}>
                  💡 ผลลัพธ์: มองเห็นอัตราเร่งและสัดส่วนความต่างได้ชัดเจนทันทีด้วยตาเปล่า ไม่ต้องคำนวณในใจ
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '18px',
                    border: '2px solid #bfdbfe',
                    flexShrink: 0
                  }}
                >
                  3
                </div>
                <strong style={{ fontSize: '21px', color: '#1e293b' }}>
                  ขั้นตอนที่ 3 • แม็ปประชากรและพื้นที่ชุดเดียวกัน (Direct Demographic Mapping)
                </strong>
              </div>

              <div style={{ fontSize: '17.5px', color: '#334155', lineHeight: 1.7, paddingLeft: '48px' }}>
                • ตัดขวางข้อมูลตาม <strong style={{ color: '#0f172a' }}>เพศเดียวกัน</strong>, <strong style={{ color: '#0f172a' }}>ช่วงวัยเดียวกัน</strong>, และ <strong style={{ color: '#0f172a' }}>8 ภูมิภาคเดียวกัน</strong> อย่างเคร่งครัด<br />
                • ตัวอย่างเช่น เพศชายวัยทำงาน 25–40 ปี ในข้อมูลคุณธรรม จับคู่ตรงกับสถิติอุบัติเหตุของเพศชายวัย 25–40 ปี ในพื้นที่เดียวกัน<br />
                <div style={{ marginTop: '8px', padding: '10px 16px', background: '#f0f9ff', borderRadius: '10px', borderLeft: '4px solid #0284c7', color: '#0369a1', fontWeight: 600, fontSize: '17px' }}>
                  💡 ผลลัพธ์: พิสูจน์ความสัมพันธ์เชิงเหตุและผล (Causal-Link) ได้อย่างแม่นยำตามหลักวิทยาศาสตร์ข้อมูล
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          เรื่องที่ 2: เหตุผลที่มาของตัวเลข ดูแนวโน้มมากหรือน้อยจากกราฟอย่างไร (เต็มพื้นที่บนลงล่าง)
          ========================================================================= */}
      {(activeTopicTab === 'topic2' || activeTopicTab === 'all') && (
        <div
          style={{
            background: '#fffbeb',
            borderRadius: '20px',
            padding: '26px 28px',
            border: '2px solid #fde68a',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Header เรื่องที่ 2 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#d97706',
                  background: '#fef3c7',
                  padding: '4px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #fde68a'
                }}
              >
                เรื่องที่ 2 • วิธีอ่านและจับสัญญาณกราฟ
              </span>
              <h4 style={{ fontSize: '24px', fontWeight: 800, color: '#92400e', margin: 0 }}>
                เหตุผลที่มาของตัวเลขต่างๆ โดยดูกราฟว่าแนวโน้มมากหรือน้อย ดูอย่างไร?
              </h4>
            </div>
            <p style={{ fontSize: '18px', color: '#78350f', margin: '4px 0 0 0', lineHeight: 1.65 }}>
              สังเกตเพียง <strong>3 จุดสำคัญบนกราฟ</strong> ก็ทราบทันทีว่ากลุ่มใดหรือพื้นที่ใดปลอดภัย และจุดใดอยู่ในภาวะวิกฤต:
            </p>
          </div>

          {/* 3 สัญญาณเรียงเต็มพื้นที่จากบนลงล่าง (Vertical Stacked Cards) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* Signal 1 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '1.5px solid #fed7aa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#fef2f2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '2px solid #fecaca'
                  }}
                >
                  <TrendingUp size={22} color="#dc2626" />
                </div>
                <strong style={{ fontSize: '21px', color: '#991b1b' }}>
                  1. กฎความผกผัน (แท่งต่ำ = เส้นพุ่งขึ้นสูงชัน)
                </strong>
              </div>

              <div style={{ fontSize: '17.5px', color: '#450a0a', lineHeight: 1.7, paddingLeft: '48px' }}>
                • <strong style={{ color: '#991b1b' }}>ฝั่งซ้าย (กลุ่มคุณธรรมต่ำ / แท่งหดสั้น):</strong> เส้นปัญหาภายนอกจะ <strong>พุ่งตัวขึ้นสู่จุดสูงสุด (Peak)</strong> อย่างมีนัยสำคัญ<br />
                • <strong style={{ color: '#166534' }}>ฝั่งขวา (กลุ่มคุณธรรมสูง / แท่งยาวขึ้น):</strong> เส้นปัญหาภายนอกจะ <strong>ดิ่งลงต่ำและราบเรียบ</strong> อย่างชัดเจน<br />
                <div style={{ marginTop: '8px', padding: '10px 16px', background: '#fef2f2', borderRadius: '10px', borderLeft: '4px solid #dc2626', color: '#991b1b', fontWeight: 600, fontSize: '17px' }}>
                  👉 แปลความหมาย: ยืนยันว่าคุณธรรมไม่ได้เป็นเพียงนามธรรม แต่ทำหน้าที่เป็น "เกราะป้องกันความสูญเสีย" ในโลกความเป็นจริง
                </div>
              </div>
            </div>

            {/* Signal 2 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '1.5px solid #fed7aa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#fff7ed',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '2px solid #fed7aa'
                  }}
                >
                  <AlertTriangle size={22} color="#ea580c" />
                </div>
                <strong style={{ fontSize: '21px', color: '#9a3412' }}>
                  2. ช่องว่างความเสี่ยง (The Risk Gap Analysis)
                </strong>
              </div>

              <div style={{ fontSize: '17.5px', color: '#431407', lineHeight: 1.7, paddingLeft: '48px' }}>
                • มองหาจุดที่ <strong style={{ color: '#ea580c' }}>เส้นสีแดง (ปัญหาภายนอก)</strong> อยู่ห่างจาก <strong style={{ color: '#0284c7' }}>แท่งคะแนนคุณธรรม</strong> มากที่สุดบนแกน X<br />
                • จุดที่เส้นกับแท่งถ่างกว้างที่สุด บ่งชี้ถึง <strong>"กลุ่มเป้าหมายวิกฤตอันดับ 1"</strong> (เช่น กลุ่มชายวัยทำงาน 25–40 ปี ในประเด็นวินัยจราจร)<br />
                <div style={{ marginTop: '8px', padding: '10px 16px', background: '#fff7ed', borderRadius: '10px', borderLeft: '4px solid #ea580c', color: '#9a3412', fontWeight: 600, fontSize: '17px' }}>
                  👉 แปลความหมาย: นโยบายและงบประมาณต้องมุ่งเป้าลงไปที่จุดถ่างกว้างนี้เป็นลำดับแรกเพื่อลดความสูญเสียให้เร็วที่สุด
                </div>
              </div>
            </div>

            {/* Signal 3 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '1.5px solid #fed7aa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '2px solid #bbf7d0'
                  }}
                >
                  <CheckCircle2 size={22} color="#16a34a" />
                </div>
                <strong style={{ fontSize: '21px', color: '#166534' }}>
                  3. จุดราบเรียบความปลอดภัย (Safe Baseline Threshold)
                </strong>
              </div>

              <div style={{ fontSize: '17.5px', color: '#14532d', lineHeight: 1.7, paddingLeft: '48px' }}>
                • สังเกตฝั่งขวาสุดของกราฟที่มีคะแนนคุณธรรมสูง: เส้นความเสียหายจะสงบตัวลงและอยู่ในระดับคงที่ต่ำสุด<br />
                • บ่งชี้ระดับเสถียรภาพพื้นฐาน (Safety Baseline) ของสังคมที่มีวินัย จิตสาธารณะ และความพอเพียง<br />
                <div style={{ marginTop: '8px', padding: '10px 16px', background: '#f0fdf4', borderRadius: '10px', borderLeft: '4px solid #16a34a', color: '#166534', fontWeight: 600, fontSize: '17px' }}>
                  👉 แปลความหมาย: ถอดบทเรียนจากพื้นที่ต้นแบบฝั่งขวาเพื่อนำกระบวนการไปขยายผลในพื้นที่เสี่ยงฝั่งซ้ายได้จริง
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          เรื่องที่ 3: ที่มาของตัวเลขและสมการคำนวณอย่างละเอียด (เต็มพื้นที่บนลงล่าง)
          ========================================================================= */}
      {(activeTopicTab === 'topic3' || activeTopicTab === 'all') && (
        <div
          style={{
            background: '#faf5ff',
            borderRadius: '20px',
            padding: '26px 28px',
            border: '2px solid #e9d5ff',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Header เรื่องที่ 3 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#7c3aed',
                  background: '#f3e8ff',
                  padding: '4px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #d8b4fe'
                }}
              >
                เรื่องที่ 3 • ที่มาของตัวเลขและสมการคำนวณ
              </span>
              <h4 style={{ fontSize: '24px', fontWeight: 800, color: '#6b21a8', margin: 0 }}>
                วิธีคิดที่มาของตัวเลขอย่างละเอียด (สมการที่ใช้ & ทำไมถึงได้ตัวเลขนี้ออกมา?)
              </h4>
            </div>
            <p style={{ fontSize: '18px', color: '#581c87', margin: '4px 0 0 0', lineHeight: 1.65 }}>
              แจกแจงที่มาทางสถิติและสมการ <strong>3 สูตรหลัก</strong> ในหัวข้อ <em>{topicName}</em> พร้อมตัวอย่างการแทนค่าตัวเลขจริง:
            </p>
          </div>

          {/* 3 สมการเรียงเต็มพื้นที่จากบนลงล่าง (Vertical Stacked Cards) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
            {/* Formula 1: Multiplier Ratio */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '22px 26px',
                border: '2px solid #d8b4fe',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', padding: '4px 12px', borderRadius: '6px' }}>
                  สมการที่ 1 • ตัวคูณความต่าง (Relative Risk Multiplier)
                </span>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#7c3aed' }}>
                  ผลลัพธ์: {stat3.val}
                </span>
              </div>

              <h5 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {formulaDetails.formula1Label}
              </h5>

              {/* Math Box */}
              <div
                style={{
                  padding: '14px 20px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1.5px dashed #cbd5e1',
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  color: '#0f172a',
                  textAlign: 'center',
                  fontWeight: 700
                }}
              >
                อัตราส่วนความต่าง (เท่าตัว) = ความเสียหายกลุ่มเสี่ยง ÷ ความเสียหายกลุ่มปลอดภัย
              </div>

              <div style={{ fontSize: '17.5px', color: '#334155', lineHeight: 1.7 }}>
                • <strong style={{ color: '#0f172a' }}>แทนค่าตัวเลขจริงในกราฟ:</strong> {formulaDetails.numHigh} ÷ {formulaDetails.numLow}<br />
                • <strong style={{ color: '#0f172a' }}>ผลการคำนวณ:</strong> <span style={{ color: '#7c3aed', fontWeight: 800, fontSize: '20px' }}>{formulaDetails.calcResult}</span><br />
                • <strong style={{ color: '#0f172a' }}>ทำไมถึงได้ตัวเลขนี้:</strong> คำนวณตามหลักระบาดวิทยาและสถิติ <em>Relative Risk (RR)</em> เพื่อตอบคำถามคนทั่วไปให้เห็นภาพชัดเจนว่า "หากไม่มีวินัยหรือคุณธรรม จะเสี่ยงสูญเสียมากกว่าคนมีคุณธรรมถึงกี่เท่าตัว"
              </div>
            </div>

            {/* Formula 2: Weighted Mean Score */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '22px 26px',
                border: '2px solid #bae6fd',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7', background: '#eff6ff', padding: '4px 12px', borderRadius: '6px' }}>
                  สมการที่ 2 • ดัชนีคุณธรรมเฉลี่ยถ่วงน้ำหนัก (Weighted Mean Score)
                </span>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#0284c7' }}>
                  ผลลัพธ์: {stat1.val}
                </span>
              </div>

              <h5 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {formulaDetails.formula2Label}
              </h5>

              {/* Math Box */}
              <div
                style={{
                  padding: '14px 20px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1.5px dashed #cbd5e1',
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  color: '#0f172a',
                  textAlign: 'center',
                  fontWeight: 700
                }}
              >
                คะแนนเฉลี่ยถ่วงน้ำหนัก (W_Score) = Σ(คะแนนรายพื้นที่ × สัดส่วนประชากร) ÷ ประชากรรวม
              </div>

              <div style={{ fontSize: '17.5px', color: '#334155', lineHeight: 1.7 }}>
                • <strong style={{ color: '#0f172a' }}>สูตรคำนวณจริง:</strong> {formulaDetails.scoreFormula}<br />
                • <strong style={{ color: '#0f172a' }}>ผลการคำนวณ:</strong> <span style={{ color: '#0284c7', fontWeight: 800, fontSize: '20px' }}>{formulaDetails.scoreResult}</span><br />
                • <strong style={{ color: '#0f172a' }}>ทำไมถึงได้ตัวเลขนี้:</strong> เก็บข้อมูลจากผู้ตอบแบบสำรวจทั่วประเทศกว่า 33,000 คน แล้วถ่วงน้ำหนักตามโครงสร้างประชากรจริง 77 จังหวัด เพื่อขจัดความลำเอียง (Selection Bias) ของกลุ่มตัวอย่าง
              </div>
            </div>

            {/* Formula 3: Impact Reduction */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '22px 26px',
                border: '2px solid #a7f3d0',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '4px 12px', borderRadius: '6px' }}>
                  สมการที่ 3 • อัตราการลดความสูญเสีย (% Impact Reduction)
                </span>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#059669' }}>
                  ยืนยันลดได้จริง
                </span>
              </div>

              <h5 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {formulaDetails.formula3Label}
              </h5>

              {/* Math Box */}
              <div
                style={{
                  padding: '14px 20px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1.5px dashed #cbd5e1',
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  color: '#0f172a',
                  textAlign: 'center',
                  fontWeight: 700
                }}
              >
                % การลดความสูญเสีย = (1 - [สถิติความเสียหายหลังมีคุณธรรม ÷ สถิติเดิม]) × 100%
              </div>

              <div style={{ fontSize: '17.5px', color: '#334155', lineHeight: 1.7 }}>
                • <strong style={{ color: '#0f172a' }}>สูตรคำนวณจริง:</strong> {formulaDetails.reductionFormula}<br />
                • <strong style={{ color: '#0f172a' }}>ผลการคำนวณ:</strong> <span style={{ color: '#059669', fontWeight: 800, fontSize: '20px' }}>{formulaDetails.reductionResult}</span><br />
                • <strong style={{ color: '#0f172a' }}>ทำไมถึงได้ตัวเลขนี้:</strong> วัดผลจากกลุ่มพื้นที่นำร่องที่มีการขับเคลื่อนคุณธรรมจริง เทียบกับกลุ่มควบคุมและสถิติก่อนเริ่มโครงการ ยืนยันว่าการเปลี่ยนพฤติกรรมคุณธรรมช่วยลดการสูญเสียในระดับโครงสร้างได้จริง
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          เรื่องที่ 4: สรุปภาพรวมแบบตรงประเด็น Hit the Point (เต็มพื้นที่บนลงล่าง)
          ========================================================================= */}
      {(activeTopicTab === 'topic4' || activeTopicTab === 'all') && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '20px',
            padding: '28px 32px',
            color: '#ffffff',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Header เรื่องที่ 4 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target size={26} color="#38bdf8" />
              <h4 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#38bdf8' }}>
                เรื่องที่ 4 • สรุปสั้นๆ ตรงประเด็น (Hit the Point):
              </h4>
            </div>
            <span style={{ fontSize: '15px', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '4px 14px', borderRadius: '8px' }}>
              3 บรรทัดจบ สำหรับคนทั่วไปเข้าใจได้ทันที
            </span>
          </div>

          {/* 3 Core Stats Cards inside Hit the Point */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
              marginTop: '4px'
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '16px 18px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6ee7b7', fontWeight: 700 }}>📊 หลักฐานดัชนีคุณธรรม</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>{stat1.val}</div>
              <div style={{ fontSize: '14.5px', color: '#cbd5e1' }}>{stat1.label}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '16px 18px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontSize: '14px', color: '#fca5a5', fontWeight: 700 }}>⚠️ หลักฐาน Big Data ภายนอก</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>{stat2.val}</div>
              <div style={{ fontSize: '14.5px', color: '#cbd5e1' }}>{stat2.label}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '16px 18px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontSize: '14px', color: '#93c5fd', fontWeight: 700 }}>🚀 ผลกระทบตัวคูณความต่าง (Impact)</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#38bdf8', margin: '4px 0' }}>{stat3.val}</div>
              <div style={{ fontSize: '14.5px', color: '#cbd5e1' }}>{stat3.label}</div>
            </div>
          </div>

          {/* 3 Hit the point rows (เต็มพื้นที่บนลงล่าง) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(255, 255, 255, 0.04)', padding: '14px 18px', borderRadius: '12px' }}>
              <span style={{ background: '#0284c7', color: '#fff', fontSize: '16px', fontWeight: 900, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                1
              </span>
              <div style={{ fontSize: '18px', lineHeight: 1.65, color: '#f8fafc' }}>
                <strong style={{ color: '#38bdf8' }}>วิธีเทียบข้อมูล:</strong> ใช้กราฟแกนคู่ (Dual-Axis) ฝั่งซ้ายเป็นสถิติปัญหาจริง ฝั่งขวาเป็นคะแนนคุณธรรม ทำให้เปรียบเทียบข้อมูลคนละหน่วยบนระนาบเดียวกันได้แม่นยำ โดยไม่ต้องตัดทอนตัวเลขจริงทิ้ง
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(255, 255, 255, 0.04)', padding: '14px 18px', borderRadius: '12px' }}>
              <span style={{ background: '#d97706', color: '#fff', fontSize: '16px', fontWeight: 900, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                2
              </span>
              <div style={{ fontSize: '18px', lineHeight: 1.65, color: '#f8fafc' }}>
                <strong style={{ color: '#facc15' }}>วิธีดูแนวโน้ม:</strong> "แท่งคุณธรรมหดสั้น = เส้นปัญหาพุ่งสูงชัน" เมื่อใดที่เห็นเส้นพุ่งสวนทางกับแท่ง แสดงว่าเป็นจุดวิกฤตที่เกิดความสูญเสียสูงสุดที่ต้องนำมาตรการลงไปสกัดทันที
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(255, 255, 255, 0.04)', padding: '14px 18px', borderRadius: '12px' }}>
              <span style={{ background: '#7c3aed', color: '#fff', fontSize: '16px', fontWeight: 900, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                3
              </span>
              <div style={{ fontSize: '18px', lineHeight: 1.65, color: '#f8fafc' }}>
                <strong style={{ color: '#c084fc' }}>วิธีคิดตัวเลขเท่าตัว:</strong> นำสถิติความสูญเสียในกลุ่มเสี่ยง ตั้งหารด้วยกลุ่มปลอดภัย ได้ผลลัพธ์เป็นตัวคูณระดับเท่าตัว ({stat3.val}) ทันที เป็นหลักฐานเชิงประจักษ์ว่าคุณธรรมเปลี่ยนพฤติกรรมได้จริง
              </div>
            </div>
          </div>

          {policyRecommendation && (
            <div style={{ marginTop: '4px', paddingTop: '14px', borderTop: '1px dashed rgba(255, 255, 255, 0.2)', fontSize: '17.5px', color: '#93c5fd', lineHeight: 1.65 }}>
              💡 <strong style={{ color: '#ffffff' }}>ข้อเสนอแนะเชิงนโยบาย:</strong> {policyRecommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
