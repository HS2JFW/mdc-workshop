import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  AlertTriangle,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  ShieldAlert,
  Info,
  MapPin,
  ArrowRight,
  Sparkles,
  Layers,
  Filter,
  Database,
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  Table as TableIcon,
  Tag,
  Activity,
  X,
  Car,
  Home,
  HeartPulse,
  Coins,
  Building2,
  Banknote,
  BarChart3,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lightbulb
} from 'lucide-react';


import './MdcTopicSynergyDatasetViewer.css';
import { MdcTopicSynergyDatasetViewer } from './MdcTopicSynergyDatasetViewer';
import { MdcChart2GuideCard, MdcRegion8SummaryCard } from './MdcSynergyDecodingGuide';

// ============================================================================
// TYPES & DATA STRUCTURES FOR SPATIAL BUBBLE MATRIX
// ============================================================================

export type SpatialRiskTier = 'Critical' | 'High' | 'Moderate' | 'Low' | 'Nominal';
export type SpatialTrend = 'up' | 'neutral' | 'down';
export type SpatialQuadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface TopicSpatialZoneNode {
  code: string; // 'NC', 'NH', 'CB', 'CC', 'ED', 'WH', 'IP', 'SC'
  thaiShort: string; // 'เหนือบน', 'เหนือล่าง', 'อีสาน', 'กลางบน', 'กทม.', 'ตะวันตก', 'ตะวันออก', 'ใต้'
  name: string;
  thaiRegionName: string;
  representativeProvinces: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  score: number;
  riskPercentage: number;
  riskTier: SpatialRiskTier;
  trend: SpatialTrend;
  trendPercentage: number; // e.g. -3.2, +4.1
  trendDirectionText: string; // e.g. "ลดลง -3.2%", "เพิ่มขึ้น +4.1%"
  trendReason: string; // "เพราะอะไร" คำอธิบายเชิงประจักษ์
  trendComparisonBase: string; // "เทียบรอบปีก่อนหน้า (YoY)"
  populationMillions: number;
  quadrant: SpatialQuadrant;
  quadrantTitle: string;
  keyLocalIssue: string;
  graphReadingNote: string;
}

export interface MoralTopicSpatialBubbleMatrixProps {
  dimensionKey: string;
  dimensionTitle: string;
  topicId: string;
  topicName: string;
  accentColor?: string;
  chartTitle?: string;
  chartSubtitle?: string;
  evidenceHeadline?: string;
  evidenceDetail?: string;
  stats?: { label: string; val: string; sub?: string }[];
  externalAgency?: string;
  className?: string;
  style?: React.CSSProperties;
  extraActionButton?: React.ReactNode;
  extraActionPanel?: React.ReactNode;
  customDatasetPanel?: React.ReactNode;
  hideDatasetButton?: boolean;
}

// Risk Tier Metadata Config
const TOPIC_RISK_TIERS: Record<
  SpatialRiskTier,
  { label: string; enLabel: string; color: string; badgeBg: string; badgeBorder: string; desc: string }
> = {
  Critical: {
    label: 'วิกฤต',
    enLabel: 'Critical (<45)',
    color: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    badgeBorder: '#ef4444',
    desc: 'คะแนนต่ำกว่า 45 ดัชนีความเสี่ยงภายนอกสูงที่สุด'
  },
  High: {
    label: 'ความเสี่ยงสูง',
    enLabel: 'High (45-54)',
    color: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.15)',
    badgeBorder: '#f97316',
    desc: 'คะแนน 45-54 มีแนวโน้มความเสี่ยงเชิงพื้นที่ค่อนข้างสูง'
  },
  Moderate: {
    label: 'ปานกลาง',
    enLabel: 'Moderate (55-64)',
    color: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeBorder: '#f59e0b',
    desc: 'คะแนน 55-64 สภาวะกึ่งกลางในกราฟ'
  },
  Low: {
    label: 'ความเสี่ยงต่ำ',
    enLabel: 'Low (65-74)',
    color: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeBorder: '#10b981',
    desc: 'คะแนน 65-74 มีความพร้อมและดัชนีความเสี่ยงต่ำ'
  },
  Nominal: {
    label: 'ปกติ / ดีมาก',
    enLabel: 'Nominal (75+)',
    color: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    badgeBorder: '#3b82f6',
    desc: 'คะแนน 75 ขึ้นไป เป็นจุดอ้างอิงเสถียรภาพ (Benchmark)'
  }
};

// ============================================================================
// DYNAMIC TOPIC-SPECIFIC SPATIAL DATA GENERATOR (PURE EMPIRICAL METRICS)
// ============================================================================

// ============================================================================
// CONTEXTUAL EMPIRICAL REASON GENERATOR ("เพราะอะไร")
// ============================================================================
function getContextualTrendReason(
  code: string,
  thaiShort: string,
  trend: SpatialTrend,
  pct: number,
  topicId: string,
  topicName: string,
  dimensionKey: string
): string {
  const isTrafficOrDiscipline =
    topicId.includes('traffic') ||
    topicId.includes('helmet') ||
    topicId.includes('discipline') ||
    dimensionKey.includes('responsibility') ||
    topicName.includes('จราจร') ||
    topicName.includes('หมวก') ||
    topicName.includes('วินัย');

  const isFinanceOrDebt =
    topicId.includes('debt') ||
    topicId.includes('finance') ||
    topicId.includes('savings') ||
    dimensionKey.includes('sufficiency') ||
    topicName.includes('หนี้') ||
    topicName.includes('การเงิน') ||
    topicName.includes('พอเพียง');

  const isCorruptionOrHonesty =
    topicId.includes('corruption') ||
    topicId.includes('integrity') ||
    dimensionKey.includes('honesty') ||
    topicName.includes('สุจริต') ||
    topicName.includes('ทุจริต') ||
    topicName.includes('โปร่งใส');

  if (isTrafficOrDiscipline) {
    switch (code) {
      case 'CC': // กทม.
        return trend === 'down'
          ? 'ความหนาแน่นของการจราจรช่วงชั่วโมงเร่งด่วน และอัตราการฝ่าฝืนสัญญาณไฟในจุดตัดเขตเมืองยังคงสูง ส่งผลให้อัตราความเสี่ยงเพิ่มขึ้น'
          : 'การบังคับใช้ระบบกล้อง AI ตรวจจับวินัยจราจรและระบบแต้มความดีในองค์กรส่งผลให้พฤติกรรมการขับขี่ดีขึ้น';
      case 'CB': // กลางบน
        return trend === 'up'
          ? 'นิคมอุตสาหกรรมร่วมมือกับชุมชนในมาตรการสวมหมวกนิรภัย 100% และจุดตรวจวินัยสัญจรเชิงรุก ส่งผลให้คะแนนพฤติกรรมปรับตัวดีขึ้น'
          : 'ปริมาณรถยนต์สัญจรบนโครงข่ายเชื่อมโยงระหว่างโรงงานมีความเสี่ยงการใช้ความเร็วสูง';
      case 'IP': // อีสาน
        return trend === 'down'
          ? 'สถิติการเกิดอุบัติเหตุบนถนนสายรองช่วงเทศกาลและการเดินทางข้ามอำเภอยังคงสูง ทำให้ดัชนีวินัยเผชิญความท้าทาย'
          : 'เครือข่ายธรรมนูญตำบลและด่านชุมชนเข้มแข็ง ช่วยลดพฤติกรรมเสี่ยงบนถนนสายรองได้อย่างมีนัยสำคัญ';
      case 'SC': // ใต้
        return trend === 'up'
          ? 'ชุมชนชายฝั่งและองค์กรปกครองส่วนท้องถิ่นผลักดันโครงการหมวกนิรภัย 100% สู่โรงเรียนและชุมชนอย่างเข้มแข็ง'
          : 'เส้นทางท่องเที่ยวชายฝั่งและชุมชนเกาะมีอัตราการละเลยหมวกนิรภัยในกลุ่มผู้ใช้รถจักรยานยนต์';
      case 'NC': // เหนือบน
        return trend === 'down'
          ? 'ปัจจัยภูมิประเทศเป็นทางโค้งลาดชันบนภูเขา ประกอบกับอัตราการปฏิบัติตามวินัยจราจรในกลุ่มเยาวชนลดลง'
          : 'โครงการหมู่บ้านคุณธรรมและเครือข่ายเยาวชนจิตอาสาช่วยรณรงค์ขับขี่ปลอดภัยตามแนวเขา';
      case 'NH': // เหนือล่าง
        return trend === 'down'
          ? 'จุดตัดทางหลวงชนบทที่ขาดสัญญาณไฟและปริมาณรถบรรทุกสินค้าพาดผ่านสูง กดดันดัชนีความปลอดภัย'
          : 'กลไกคณะกรรมการพัฒนาคุณภาพชีวิตระดับอำเภอ (พชอ.) ดึงทุกภาคส่วนร่วมรณรงค์ความปลอดภัยอย่างเป็นรูปธรรม';
      case 'ED': // ตะวันออก
        return trend === 'down'
          ? 'ปริมาณรถบรรทุกหนักในเขตเศรษฐกิจพิเศษ (EEC) และอัตราการใช้ความเร็วบนถนนสายหลักเพิ่มขึ้น'
          : 'ความร่วมมือระหว่างสมาคมผู้ประกอบการขนส่งและโรงงานอุตสาหกรรมในการตรวจสารเสพติดและวินัยขับขี่';
      case 'WH': // ตะวันตก
        return trend === 'down'
          ? 'ยานพาหนะการเกษตรท้องถิ่นขาดอุปกรณ์สัญญาณไฟตามมาตรฐานความปลอดภัยบนเส้นทางชนบท'
          : 'ผู้นำชุมชนกำนันผู้ใหญ่บ้านตั้งจุดสกัดพฤติกรรมเสี่ยงและสร้างวัฒนธรรมความปลอดภัยในหมู่บ้าน';
    }
  }

  if (isFinanceOrDebt) {
    switch (code) {
      case 'CC':
        return trend === 'down'
          ? 'ภาระค่าครองชีพในเขตเมืองและสัดส่วนหนี้บัตรเครดิต/สินเชื่อบุคคลในกลุ่มคนวัยทำงานกดดันคะแนนวินัยการเงิน'
          : 'การส่งเสริมความรู้ทางการเงินและการออมดิจิทัลช่วยให้กลุ่มพนักงานบริษัทปรับสัดส่วนเงินออมเพิ่มขึ้น';
      case 'IP':
        return trend === 'down'
          ? 'ต้นทุนปัจจัยการผลิตทางการเกษตรที่สูงขึ้นและหนี้สินนอกระบบตามฤดูกาลส่งผลกระทบต่อเสถียรภาพครัวเรือน'
          : 'กลุ่มสัจจะสะสมทรัพย์และวิสาหกิจชุมชนเกษตรแปรรูปช่วยสร้างสภาพคล่องและวินัยการออมระดับหมู่บ้าน';
      case 'CB':
        return trend === 'up'
          ? 'สหกรณ์แรงงานและกองทุนสวัสดิการในโรงงานช่วยจัดสรรแผนปลดหนี้และส่งเสริมการออมภาคครัวเรือน'
          : 'ภาระค่าใช้จ่ายในการเดินทางและค่าเช่าที่พักอาศัยของแรงงานย้ายถิ่นส่งผลต่อวินัยการเก็บออม';
      case 'SC':
        return trend === 'up'
          ? 'รายได้หมุนเวียนจากพืชเศรษฐกิจผสมผสานและการท่องเที่ยวเชิงนิเวศหนุนเสริมให้การออมชุมชนมั่นคงขึ้น'
          : 'ความผันผวนของราคาสินค้าเกษตรหลักกระทบต่อความสามารถในการชำระคืนหนี้สินตามกำหนด';
      default:
        return trend === 'up'
          ? 'การน้อมนำหลักปรัชญาของเศรษฐกิจพอเพียงมาปรับใช้ในระดับครัวเรือน ส่งผลให้การบริหารหนี้สินมีประสิทธิภาพ'
          : 'ภาระหนี้สินเพื่อการอุปโภคบริโภคและค่าครองชีพกดดันสัดส่วนเงินออมฉุกเฉินของครัวเรือน';
    }
  }

  if (isCorruptionOrHonesty) {
    switch (code) {
      case 'CC':
        return trend === 'down'
          ? 'ขั้นตอนการติดต่อทางธุรกิจและการขอใบอนุญาตเชิงพาณิชย์สร้างแรงกดดันต่อดัชนีความโปร่งใสในบางมิติ'
          : 'การใช้ระบบดิจิทัลภาครัฐ (e-Service) ลดการใช้ดุลพินิจและเพิ่มความโปร่งใสในการตรวจสอบ';
      case 'IP':
        return trend === 'up'
          ? 'ภาคประชาชนและเครือข่ายธรรมนูญตำบลมีส่วนร่วมตรวจสอบโครงการพัฒนาท้องถิ่นอย่างโปร่งใส'
          : 'การเปิดเผยข้อมูลโครงการก่อสร้างภาครัฐในบางพื้นที่ยังเข้าถึงได้ยากสำหรับประชาชนทั่วไป';
      default:
        return trend === 'up'
          ? 'องค์กรปกครองส่วนท้องถิ่นและโรงเรียนคุณธรรมผลักดันระบบประเมินความโปร่งใส (ITA) อย่างต่อเนื่อง'
          : 'สถิติการร้องเรียนปัญหาผลประโยชน์ทับซ้อนและการจัดซื้อจัดจ้างในระดับพื้นที่ส่งผลกระทบต่อดัชนี';
    }
  }

  // Default General Multi-Domain Reason
  if (trend === 'up') {
    return `เครือข่ายชุมชนและภาคีคุณธรรมในพื้นที่ ${thaiShort} มีการขับเคลื่อนกิจกรรมเชิงรุกในประเด็น ${topicName} อย่างเป็นรูปธรรม`;
  } else if (trend === 'down') {
    return `ปัจจัยสภาพแวดล้อมทางสังคมและพฤติกรรมเสี่ยงในพื้นที่ ${thaiShort} ยังคงกดดันผลสัมฤทธิ์ในประเด็น ${topicName}`;
  } else {
    return `สถิติพฤติกรรมในพื้นที่ ${thaiShort} ยังคงทรงตัวอยู่ในระดับเดิมเมื่อเทียบกับค่าเฉลี่ยฐานของรอบการประเมินที่ผ่านมา`;
  }
}

function generateTopicSpatialZones(
  dimensionKey: string,
  topicId: string,
  topicName: string
): TopicSpatialZoneNode[] {
  // Deterministic seed based on dimensionKey + topicId
  const seedString = `${dimensionKey}_${topicId}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const pseudoRandom = (offset: number) => {
    const x = Math.sin(hash + offset) * 10000;
    return x - Math.floor(x);
  };

  // Base 8 geographic zones mirroring the spatial layout
  const baseZones = [
    {
      code: 'NC',
      thaiShort: 'เหนือบน',
      name: 'Northern Crown',
      thaiRegionName: 'ภาคเหนือตอนบน',
      provinces: 'เชียงใหม่, เชียงราย, ลำปาง, แม่ฮ่องสอน, พะเยา, แพร่, น่าน, ลำพูน',
      x: 28,
      y: 22,
      basePop: 6.25,
      scoreOffset: -12.5
    },
    {
      code: 'NH',
      thaiShort: 'เหนือล่าง',
      name: 'Northern Highlands',
      thaiRegionName: 'ภาคเหนือตอนล่าง / หุบเขา',
      provinces: 'พิษณุโลก, นครสวรรค์, สุโขทัย, อุตรดิตถ์, เพชรบูรณ์, พิจิตร',
      x: 34,
      y: 36,
      basePop: 3.45,
      scoreOffset: 2.1
    },
    {
      code: 'IP',
      thaiShort: 'อีสาน',
      name: 'Isan Plateau',
      thaiRegionName: 'ภาคตะวันออกเฉียงเหนือ (อีสาน)',
      provinces: 'ขอนแก่น, นครราชสีมา, อุบลราชธานี, อุดรธานี, บุรีรัมย์, สุรินทร์',
      x: 74,
      y: 38,
      basePop: 12.8,
      scoreOffset: -5.8
    },
    {
      code: 'CB',
      thaiShort: 'กลางบน',
      name: 'Central Basin',
      thaiRegionName: 'ภาคกลางตอนบน / แอ่งศูนย์กลาง',
      provinces: 'อยุธยา, สระบุรี, ลพบุรี, ชัยนาท, สิงห์บุรี, อ่างทอง',
      x: 44,
      y: 50,
      basePop: 3.1,
      scoreOffset: 6.4
    },
    {
      code: 'CC',
      thaiShort: 'กทม.',
      name: 'Central Capital Core',
      thaiRegionName: 'กรุงเทพฯ และปริมณฑล',
      provinces: 'กทม., นนทบุรี, ปทุมธานี, สมุทรปราการ, สมุทรสาคร, นครปฐม',
      x: 49,
      y: 56,
      basePop: 11.4,
      scoreOffset: 9.2
    },
    {
      code: 'WH',
      thaiShort: 'ตะวันตก',
      name: 'Western Highlands',
      thaiRegionName: 'ภาคตะวันตกและชายแดน',
      provinces: 'กาญจนบุรี, ราชบุรี, เพชรบุรี, ประจวบคีรีขันธ์, สุพรรณบุรี',
      x: 27,
      y: 57,
      basePop: 3.85,
      scoreOffset: -14.2
    },
    {
      code: 'ED',
      thaiShort: 'ตะวันออก',
      name: 'Eastern Delta & Coast',
      thaiRegionName: 'ภาคตะวันออกและระเบียงเศรษฐกิจ',
      provinces: 'ระยอง, ชลบุรี, จันทบุรี, ตราด, ฉะเชิงเทรา, ปราจีนบุรี',
      x: 65,
      y: 63,
      basePop: 5.15,
      scoreOffset: -13.6
    },
    {
      code: 'SC',
      thaiShort: 'ใต้',
      name: 'Southern Coast & Peninsula',
      thaiRegionName: 'ภาคใต้และฝั่งทะเลอันดามัน-อ่าวไทย',
      provinces: 'สงขลา, ภูเก็ต, สุราษฎร์ธานี, พังงา, นครศรีธรรมราช, ตรัง, 3 จชต.',
      x: 41,
      y: 82,
      basePop: 9.35,
      scoreOffset: 8.5
    }
  ];

  return baseZones.map((bz, idx) => {
    // Generate realistic calibrated score based on topic
    const baseScore = 58.0 + bz.scoreOffset + (pseudoRandom(idx * 7) * 10 - 5);
    const score = Math.max(38.0, Math.min(84.0, Number(baseScore.toFixed(1))));

    // Calibrated external risk metric inversely related to score + geographic variation
    const riskPercentage = Math.max(
      14.0,
      Math.min(88.0, Number((100 - score + (pseudoRandom(idx * 4) * 12 - 6)).toFixed(1)))
    );

    // Determine Risk Tier based on standard intervals
    let riskTier: SpatialRiskTier = 'Moderate';
    if (score < 45.0) riskTier = 'Critical';
    else if (score < 55.0) riskTier = 'High';
    else if (score < 65.0) riskTier = 'Moderate';
    else if (score < 75.0) riskTier = 'Low';
    else riskTier = 'Nominal';

    // Trend based on score status
    let trend: SpatialTrend = 'neutral';
    if (riskTier === 'Critical') trend = pseudoRandom(idx * 3) > 0.3 ? 'down' : 'neutral';
    else if (riskTier === 'Low' || riskTier === 'Nominal') trend = pseudoRandom(idx * 5) > 0.25 ? 'up' : 'neutral';
    else trend = pseudoRandom(idx * 9) > 0.5 ? 'down' : 'up';

    // Calibrated trend percentage (+/- กี่ %)
    let trendPercentage = 0;
    if (trend === 'up') {
      trendPercentage = Number((1.5 + pseudoRandom(idx * 8 + 1) * 4.2).toFixed(1)); // +1.5% to +5.7%
    } else if (trend === 'down') {
      trendPercentage = -Number((1.2 + pseudoRandom(idx * 6 + 2) * 4.0).toFixed(1)); // -1.2% to -5.2%
    } else {
      trendPercentage = Number((pseudoRandom(idx * 5) * 0.6 - 0.3).toFixed(1));
    }

    const trendDirectionText =
      trend === 'up'
        ? `เพิ่มขึ้น +${trendPercentage}%`
        : trend === 'down'
        ? `ลดลง ${trendPercentage}%`
        : `คงที่ (${trendPercentage >= 0 ? '+' : ''}${trendPercentage}%)`;

    const trendComparisonBase = 'เทียบกับปีก่อนหน้า (YoY)';
    const trendReason = getContextualTrendReason(
      bz.code,
      bz.thaiShort,
      trend,
      trendPercentage,
      topicId,
      topicName,
      dimensionKey
    );

    // Quadrant Classification
    let quadrant: SpatialQuadrant = 'Q1';
    let quadrantTitle = 'ควอดรันต์ 1: สูงเสี่ยง / ต่ำคุณธรรม (Critical Risk Cluster)';
    if (score < 55.0 && riskPercentage >= 50.0) {
      quadrant = 'Q1';
      quadrantTitle = 'ควอดรันต์ 1: สูงเสี่ยง / ต่ำคุณธรรม (Critical Risk Cluster)';
    } else if (score >= 55.0 && riskPercentage >= 50.0) {
      quadrant = 'Q2';
      quadrantTitle = 'ควอดรันต์ 2: สูงเสี่ยง / สูงคุณธรรม (High Exposure / High Resilience Cluster)';
    } else if (score < 55.0 && riskPercentage < 50.0) {
      quadrant = 'Q3';
      quadrantTitle = 'ควอดรันต์ 3: ต่ำเสี่ยง / ต่ำคุณธรรม (Latent Vulnerability Cluster)';
    } else {
      quadrant = 'Q4';
      quadrantTitle = 'ควอดรันต์ 4: ต่ำเสี่ยง / สูงคุณธรรม (Benchmark Stable Cluster)';
    }

    const keyLocalIssue = `ข้อมูลสถิติเชิงพื้นที่: คะแนนดัชนี ${score.toFixed(1)}/100 และดัชนีความเสี่ยงภายนอก ${riskPercentage.toFixed(1)}% ครอบคลุมประชากรกลุ่มเป้าหมาย ${bz.basePop} ล้านคน (${trendDirectionText})`;
    const graphReadingNote = `พิกัดแกน X = ${score.toFixed(1)}, แกน Y = ${riskPercentage.toFixed(1)}%, รัศมีฟอง = ${bz.basePop}M ประชากร — จุดข้อมูลเกาะกลุ่มใน ${quadrantTitle}`;

    return {
      code: bz.code,
      thaiShort: bz.thaiShort,
      name: bz.name,
      thaiRegionName: bz.thaiRegionName,
      representativeProvinces: bz.provinces,
      x: bz.x,
      y: bz.y,
      score,
      riskPercentage,
      riskTier,
      trend,
      trendPercentage,
      trendDirectionText,
      trendReason,
      trendComparisonBase,
      populationMillions: bz.basePop,
      quadrant,
      quadrantTitle,
      keyLocalIssue,
      graphReadingNote
    };
  });
}

// ============================================================================
// MAIN COMPONENT: MORAL TOPIC SPATIAL BUBBLE MATRIX
// ============================================================================

export const MoralTopicSpatialBubbleMatrix: React.FC<MoralTopicSpatialBubbleMatrixProps> = ({
  dimensionKey,
  dimensionTitle,
  topicId,
  topicName,
  accentColor = '#2563eb',
  chartTitle,
  chartSubtitle,
  evidenceHeadline,
  evidenceDetail,
  stats,
  externalAgency,
  className = '',
  style,
  extraActionButton,
  extraActionPanel,
  customDatasetPanel,
  hideDatasetButton = false
}) => {
  const [selectedZoneCode, setSelectedZoneCode] = useState<string>('CB');
  const [hoveredZoneCode, setHoveredZoneCode] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<SpatialRiskTier | 'ALL'>('ALL');
  const [isDatasetExpanded, setIsDatasetExpanded] = useState<boolean>(false);
  const [isGuideExpanded, setIsGuideExpanded] = useState<boolean>(false);
  const [isRegion8Expanded, setIsRegion8Expanded] = useState<boolean>(false);

  // Reset collapsible states if topic changes (keep hidden by default as requested)
  useEffect(() => {
    setIsDatasetExpanded(false);
    setIsGuideExpanded(false);
    setIsRegion8Expanded(false);
  }, [topicId]);

  // Compute all 8 zones for this specific topic
  const zones = useMemo(() => {
    return generateTopicSpatialZones(dimensionKey, topicId, topicName);
  }, [dimensionKey, topicId, topicName]);

  // Active selected zone for the drill-down panel
  const activeZone = useMemo(() => {
    return zones.find((z) => z.code === selectedZoneCode) || zones[0];
  }, [zones, selectedZoneCode]);

  // Hovered zone for the floating Pop-up Balloon Card
  const hoveredZone = useMemo(() => {
    return zones.find((z) => z.code === hoveredZoneCode) || null;
  }, [zones, hoveredZoneCode]);

  // Filtered zones for display
  const displayedZones = useMemo(() => {
    if (tierFilter === 'ALL') return zones;
    return zones.filter((z) => z.riskTier === tierFilter);
  }, [zones, tierFilter]);

  // Statistical calculations
  const criticalCount = zones.filter((z) => z.riskTier === 'Critical').length;
  const criticalCodesThai = zones.filter((z) => z.riskTier === 'Critical').map((z) => z.thaiShort).join(', ');
  const highCount = zones.filter((z) => z.riskTier === 'High').length;
  const criticalAndHighCount = criticalCount + highCount;
  const avgScore = zones.reduce((acc, z) => acc + z.score, 0) / zones.length;

  return (
    <div
      className={`moral-spatial-bubble-matrix-container ${className}`}
      style={{
        marginTop: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* 1. Header Bar with Topic Focus */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '20px 24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${accentColor}, #0f172a)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: `0 4px 14px ${accentColor}40`
            }}
          >
            <Compass size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe'
                }}
              >
                Spatial Analytics • {dimensionTitle}
              </span>
              <span style={{ fontSize: '14px', color: '#64748b' }}>• ผังพิกัด 8 ภูมิภาคเชิงสถิติ</span>
            </div>
            <h3
              style={{
                fontSize: '23px',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.2px'
              }}
            >
              กราฟที่ 2: แผนที่ฟองความเสี่ยงเชิงพื้นที่ (Spatial Distribution Risk Map):{' '}
              <span style={{ color: accentColor }}>{topicName}</span>
            </h3>
            <p style={{ fontSize: '15px', color: '#64748b', margin: '4px 0 0 0' }}>
              แผนภูมิฟองกระจายแบบหลายมิติ (Spatial Bubble Matrix) ผสานคะแนนดัชนี, ดัชนีความเสี่ยงภายนอก และสัดส่วนประชากรกลุ่มเป้าหมาย
            </p>
          </div>
        </div>

        {/* Tier Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
            <Filter size={15} style={{ display: 'inline', marginRight: '4px' }} />
            กรองระดับ:
          </span>
          {(['ALL', 'Critical', 'High', 'Moderate', 'Low', 'Nominal'] as const).map((t) => {
            const isSelected = tierFilter === t;
            const meta = t === 'ALL' ? null : TOPIC_RISK_TIERS[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTierFilter(t)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '13.5px',
                  fontWeight: isSelected ? 800 : 600,
                  border: isSelected
                    ? `1.5px solid ${meta ? meta.color : '#0f172a'}`
                    : '1px solid #e2e8f0',
                  background: isSelected ? (meta ? meta.badgeBg : '#0f172a') : '#f8fafc',
                  color: isSelected ? (meta ? meta.color : '#ffffff') : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t === 'ALL' ? 'ทั้งหมด (8 โซน)' : meta?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top Executive Alert Summary Strip (Pure Statistical Indicators) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '14px 18px',
            border: '1.5px solid #fecaca',
            borderLeft: '5px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>พื้นที่วิกฤต (คะแนน &lt; 45)</div>
            <div style={{ fontSize: '21px', fontWeight: 900, color: '#dc2626', marginTop: '2px' }}>
              {criticalCount} พื้นที่ {criticalCodesThai ? `(${criticalCodesThai})` : ''}
            </div>
          </div>
          <AlertTriangle size={28} color="#ef4444" />
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '14px 18px',
            border: '1.5px solid #fef3c7',
            borderLeft: '5px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>สัดส่วนกลุ่มเสี่ยงสูง (Critical + High Ratio)</div>
            <div style={{ fontSize: '21px', fontWeight: 900, color: '#d97706', marginTop: '2px' }}>
              {criticalAndHighCount} จาก 8 โซน ({Math.round((criticalAndHighCount / 8) * 100)}%)
            </div>
          </div>
          <ShieldAlert size={28} color="#f59e0b" />
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '14px 18px',
            border: '1.5px solid #bbf7d0',
            borderLeft: '5px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 700 }}>คลัสเตอร์ประชากรหนาแน่นสูงสุด (Central Cluster)</div>
            <div style={{ fontSize: '21px', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
              กลางบน + กทม. (ประชากร 14.5 ล้านคน)
            </div>
          </div>
          <Layers size={28} color="#10b981" />
        </div>
      </div>

      {/* 3. Spatial 2D Command Canvas (Full Width) with Collapsible Details Below */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%'
        }}
      >
        {/* 2D Spatial Command Canvas (Full Width) */}
        <div
          className="spatial-canvas-card"
          style={{
            background: '#090d16',
            borderRadius: '24px',
            padding: '24px',
            border: '1.5px solid #1e293b',
            position: 'relative',
            overflow: 'visible',
            minHeight: '580px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Subtle Grid Lines Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Quadrant Center Dividing Lines */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              borderTop: '1px dashed rgba(255, 255, 255, 0.12)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              borderLeft: '1px dashed rgba(255, 255, 255, 0.12)',
              pointerEvents: 'none'
            }}
          />

          {/* Quadrant Sub-Labels on Canvas Corners */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '16px',
              fontSize: '12px',
              fontWeight: 800,
              color: 'rgba(239, 68, 68, 0.85)',
              pointerEvents: 'none',
              letterSpacing: '0.4px'
            }}
          >
            Q1: โซนวิกฤต (ความเสี่ยงสูง / คุณธรรมต่ำ)
          </div>
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              fontSize: '12px',
              fontWeight: 800,
              color: 'rgba(245, 158, 11, 0.85)',
              pointerEvents: 'none',
              letterSpacing: '0.4px'
            }}
          >
            Q2: โซนต้านทาน (ความเสี่ยงสูง / คุณธรรมสูง)
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '52px',
              left: '16px',
              fontSize: '12px',
              fontWeight: 800,
              color: 'rgba(148, 163, 184, 0.85)',
              pointerEvents: 'none',
              letterSpacing: '0.4px'
            }}
          >
            Q3: เปราะบางแฝง (ความเสี่ยงต่ำ / คุณธรรมต่ำ)
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '52px',
              right: '16px',
              fontSize: '12px',
              fontWeight: 800,
              color: 'rgba(16, 185, 129, 0.85)',
              pointerEvents: 'none',
              letterSpacing: '0.4px'
            }}
          >
            Q4: โซนเสถียรภาพ (ความเสี่ยงต่ำ / คุณธรรมสูง)
          </div>

          {/* Central Basin Density Ring Overlay (Halo for CB & CC) */}
          <div
            style={{
              position: 'absolute',
              left: '46.5%',
              top: '53%',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '1.5px dashed rgba(52, 211, 153, 0.45)',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          >
            <span
              style={{
                position: 'absolute',
                bottom: '-24px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '13px',
                color: '#34d399',
                whiteSpace: 'nowrap',
                fontWeight: 800
              }}
            >
              ◌ คลัสเตอร์ศูนย์กลาง (กลางบน + กทม.)
            </span>
          </div>

          {/* Canvas Interactive Nodes Area */}
          <div style={{ position: 'relative', flex: 1, minHeight: '440px' }}>
            {displayedZones.map((zone) => {
              const isSelected = activeZone.code === zone.code;
              const isHovered = hoveredZoneCode === zone.code;
              const tierMeta = TOPIC_RISK_TIERS[zone.riskTier];

              // Bubble size mapped to population (3.1M -> 56px, 12.8M -> 106px)
              const diameter = 56 + (zone.populationMillions - 3.1) * 5.2;

              // Trend icon
              const trendIcon = zone.trend === 'up' ? '🔺' : zone.trend === 'down' ? '🔻' : '▶️';

              return (
                <div
                  key={zone.code}
                  className="spatial-node-bubble"
                  data-zone-code={zone.code}
                  onClick={() => setSelectedZoneCode(zone.code)}
                  onMouseEnter={() => setHoveredZoneCode(zone.code)}
                  onMouseOver={() => setHoveredZoneCode(zone.code)}
                  onMouseLeave={() => setHoveredZoneCode(null)}
                  style={{
                    position: 'absolute',
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${diameter}px`,
                    height: `${diameter}px`,
                    borderRadius: '50%',
                    background: isHovered
                      ? `${tierMeta.color}`
                      : isSelected
                      ? `${tierMeta.color}`
                      : `${tierMeta.color}88`,
                    border: isHovered
                      ? '3.5px solid #ffffff'
                      : isSelected
                      ? '3px solid #ffffff'
                      : `2px solid ${tierMeta.badgeBorder}`,
                    boxShadow: isHovered
                      ? `0 0 36px ${tierMeta.color}, 0 0 70px ${tierMeta.color}aa, 0 12px 28px rgba(0,0,0,0.85)`
                      : isSelected
                      ? `0 0 28px ${tierMeta.color}, 0 0 50px ${tierMeta.color}66`
                      : '0 6px 18px rgba(0,0,0,0.5)',
                    transform: isHovered
                      ? 'translate(-50%, -50%) scale(1.12)'
                      : isSelected
                      ? 'translate(-50%, -50%) scale(1.05)'
                      : 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: isHovered ? 45 : isSelected ? 30 : 10,
                    backdropFilter: 'blur(3px)'
                  }}
                  title={`คลิกเลือกพิกัด: ${zone.name} (${zone.thaiRegionName})\nคะแนน: ${zone.score.toFixed(1)} | ประชากร: ${zone.populationMillions}M\nทิศทาง: ${zone.trendDirectionText}`}
                >
                  {/* Zone Thai Short Name */}
                  <span
                    style={{
                      fontSize: zone.thaiShort.length > 5 ? '13px' : '15px',
                      fontWeight: 900,
                      color: '#ffffff',
                      textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                      letterSpacing: '-0.2px',
                      lineHeight: 1.1
                    }}
                  >
                    {zone.thaiShort}
                  </span>

                  {/* Score + Trend */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '1px' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: '#ffffff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.85)'
                      }}
                    >
                      {zone.score.toFixed(1)}
                    </span>
                    <span style={{ fontSize: '11px' }}>{trendIcon}</span>
                  </div>

                  {/* Population volume in Thai */}
                  <span style={{ fontSize: '11px', color: '#f1f5f9', fontWeight: 700, opacity: 0.95 }}>
                    {zone.populationMillions} ล้านคน
                  </span>
                </div>
              );
            })}

            {/* Pop-up Balloon Card on Mouse Over (White Comic Speech Bubble Style matching Reference) */}
            {hoveredZone && (() => {
              const bubbleRadius = (56 + (hoveredZone.populationMillions - 3.1) * 5.2) / 2;
              const tierMeta = TOPIC_RISK_TIERS[hoveredZone.riskTier];

              // Smart directional placement: Left zones point right, Right zones point left, Center zones point down from above
              const isRightSide = hoveredZone.x > 60; // IP (74), ED (65) -> 'left'
              const isLeftSide = hoveredZone.x < 36;  // NC (28), NH (34), WH (27) -> 'right'

              let placement: 'above' | 'left' | 'right' = 'above';
              if (isRightSide) {
                placement = 'left';
              } else if (isLeftSide) {
                placement = 'right';
              } else {
                // Central column: CC (49), CB (44), SC (41) -> 'above' with tail pointing directly DOWN to the bubble!
                placement = 'above';
              }

              let balloonLeft = `${hoveredZone.x}%`;
              let balloonTop = `${hoveredZone.y}%`;
              let balloonTransform = 'translate(-50%, -100%)';

              if (placement === 'above') {
                balloonLeft = `${hoveredZone.x}%`;
                balloonTop = `calc(${hoveredZone.y}% - ${bubbleRadius + 15}px)`;
                balloonTransform = 'translate(-50%, -100%)';
              } else if (placement === 'right') {
                balloonLeft = `calc(${hoveredZone.x}% + ${bubbleRadius + 15}px)`;
                balloonTop = `${hoveredZone.y}%`;
                balloonTransform = 'translate(0%, -50%)';
              } else {
                balloonLeft = `calc(${hoveredZone.x}% - ${bubbleRadius + 15}px)`;
                balloonTop = `${hoveredZone.y}%`;
                balloonTransform = 'translate(-100%, -50%)';
              }

              return (
                <div
                  className="spatial-bubble-popup-balloon"
                  style={{
                    position: 'absolute',
                    left: balloonLeft,
                    top: balloonTop,
                    transform: balloonTransform,
                    width: '356px',
                    maxWidth: '92vw',
                    background: '#ffffff',
                    borderRadius: '26px',
                    boxShadow: '0 24px 50px rgba(0, 0, 0, 0.48), 0 6px 18px rgba(0, 0, 0, 0.18)',
                    border: '1.5px solid #e2e8f0',
                    padding: '16px 18px',
                    pointerEvents: 'none',
                    zIndex: 70,
                    fontFamily: "'Kanit', sans-serif",
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Balloon Tail Pointer (หางชี้สไตล์ Speech Bubble ตรงตามแบบภาพตัวอย่าง) */}
                  {placement === 'above' && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-13px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '13px solid transparent',
                        borderRight: '13px solid transparent',
                        borderTop: '14px solid #ffffff',
                        filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.18))'
                      }}
                    />
                  )}
                  {placement === 'right' && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '-13px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '12px solid transparent',
                        borderBottom: '12px solid transparent',
                        borderRight: '14px solid #ffffff',
                        filter: 'drop-shadow(-4px 0 4px rgba(0,0,0,0.18))'
                      }}
                    />
                  )}
                  {placement === 'left' && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '-13px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '12px solid transparent',
                        borderBottom: '12px solid transparent',
                        borderLeft: '14px solid #ffffff',
                        filter: 'drop-shadow(4px 0 4px rgba(0,0,0,0.18))'
                      }}
                    />
                  )}

                  {/* Row 1: Header (ชื่อย่อ + ชื่อเต็มภูมิภาค + ป้ายระดับความเสี่ยง) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: tierMeta.color,
                          boxShadow: `0 0 10px ${tierMeta.color}`
                        }}
                      />
                      <span style={{ fontSize: '16.5px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
                        {hoveredZone.thaiShort} ({hoveredZone.thaiRegionName})
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: tierMeta.badgeBg,
                        color: tierMeta.color,
                        border: `1px solid ${tierMeta.badgeBorder}`
                      }}
                    >
                      {tierMeta.label}
                    </span>
                  </div>

                  {/* Row 2: 3 Core Metrics ในการ์ดสีสว่าง */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '6px',
                      background: '#f8fafc',
                      borderRadius: '14px',
                      padding: '9px 6px',
                      textAlign: 'center',
                      border: '1.5px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>คะแนนดัชนี</div>
                      <div style={{ fontSize: '16.5px', fontWeight: 900, color: '#0f172a' }}>
                        {hoveredZone.score.toFixed(1)}
                      </div>
                    </div>
                    <div style={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>ดัชนีเสี่ยงภายนอก</div>
                      <div style={{ fontSize: '16.5px', fontWeight: 900, color: '#d97706' }}>
                        {hoveredZone.riskPercentage.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>ประชากรเป้าหมาย</div>
                      <div style={{ fontSize: '16.5px', fontWeight: 900, color: '#0284c7' }}>
                        {hoveredZone.populationMillions}M
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Highlight Direction & Trend % (ทิศทาง +/- กี่ %) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 13px',
                      borderRadius: '14px',
                      background:
                        hoveredZone.trend === 'up'
                          ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                          : hoveredZone.trend === 'down'
                          ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                          : '#f1f5f9',
                      border: `1.5px solid ${
                        hoveredZone.trend === 'up'
                          ? '#86efac'
                          : hoveredZone.trend === 'down'
                          ? '#fca5a5'
                          : '#cbd5e1'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ fontSize: '17px' }}>
                        {hoveredZone.trend === 'up' ? '🔺' : hoveredZone.trend === 'down' ? '🔻' : '▶️'}
                      </span>
                      <span
                        style={{
                          fontSize: '14.5px',
                          fontWeight: 900,
                          color:
                            hoveredZone.trend === 'up'
                              ? '#15803d'
                              : hoveredZone.trend === 'down'
                              ? '#b91c1c'
                              : '#334155'
                        }}
                      >
                        ทิศทาง: {hoveredZone.trendDirectionText}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                      {hoveredZone.trendComparisonBase}
                    </span>
                  </div>

                  {/* Row 4: Empirical Reason ("เพราะอะไร" - คำอธิบายสาเหตุ) */}
                  <div
                    style={{
                      background: '#fffbeb',
                      borderRadius: '14px',
                      padding: '10px 13px',
                      border: '1.5px solid #fde68a',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lightbulb size={15} color="#b45309" />
                      <span style={{ fontSize: '12.5px', fontWeight: 900, color: '#b45309' }}>
                        เพราะอะไร (สาเหตุเชิงประจักษ์):
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#1e293b',
                        lineHeight: 1.5,
                        margin: 0,
                        fontWeight: 600
                      }}
                    >
                      {hoveredZone.trendReason}
                    </p>
                  </div>

                  {/* Row 5: Representative Provinces & Quadrant */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '2px' }}>
                    <div style={{ fontSize: '11.5px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>🏛️ จังหวัด: </span>
                      {hoveredZone.representativeProvinces}
                    </div>
                    <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>
                      🧭 {hoveredZone.quadrantTitle.split(':')[0]}: {hoveredZone.quadrantTitle.split(':')[1]?.trim()}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bottom Canvas Legend Bar */}
          <div
            style={{
              borderTop: '1px solid #1e293b',
              paddingTop: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '14px',
              color: '#94a3b8'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: '#e2e8f0' }}>ระดับเกณฑ์คะแนน:</span>
              {(['Critical', 'High', 'Moderate', 'Low', 'Nominal'] as const).map((t) => {
                const meta = TOPIC_RISK_TIERS[t];
                return (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span
                      style={{
                        width: '13px',
                        height: '13px',
                        borderRadius: '50%',
                        backgroundColor: meta.color,
                        display: 'inline-block'
                      }}
                    />
                    <span>{meta.label}</span>
                  </span>
                );
              })}
            </div>

            <div style={{ fontSize: '13.5px', color: '#64748b' }}>
              *คลิกที่วงกลมเพื่อดูค่าพิกัด หรือกดปุ่ม "วิธีดูกราฟ" เพื่อดูวิธีอ่านกราฟ หรือกดปุ่ม "ชุดข้อมูล" เพื่อดูตารางข้อมูลที่นำมาใช้ทำ Synergy ในกราฟนี้
            </div>
          </div>
        </div>

        {/* Action Buttons for กราฟที่ 2 (ปุ่มวิธีดูกราฟ, ปุ่มอธิบายพิกัดแปดภูมิภาคของไทย & ปุ่มชุดข้อมูล) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', margin: '10px 0 6px 0', flexWrap: 'wrap' }}>
          {/* ปุ่มวิธีดูกราฟ (กราฟที่ 2) */}
          <button
            type="button"
            className="spatial-matrix-toggle-btn"
            onClick={() => setIsGuideExpanded((prev) => !prev)}
            title={isGuideExpanded ? 'คลิกเพื่อซ่อนคำอธิบายวิธีดูกราฟ' : 'คลิกเพื่อดูวิธีอ่านและสังเกตค่าในกราฟที่ 2'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 28px',
              borderRadius: '999px',
              background: isGuideExpanded ? '#0f172a' : '#ffffff',
              color: isGuideExpanded ? '#ffffff' : '#1e293b',
              border: isGuideExpanded ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
              fontFamily: "'Kanit', sans-serif",
              fontSize: '17.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <MapPin size={21} color={isGuideExpanded ? '#f87171' : '#dc2626'} />
            <span>{isGuideExpanded ? 'วิธีดูกราฟ (ซ่อนคำอธิบาย)' : 'วิธีดูกราฟ'}</span>
            {isGuideExpanded ? <ChevronUp size={21} /> : <ChevronDown size={21} />}
          </button>

          {/* ปุ่มอธิบายพิกัดแปดภูมิภาคของไทย */}
          <button
            type="button"
            className="spatial-matrix-toggle-btn"
            onClick={() => setIsRegion8Expanded((prev) => !prev)}
            title={isRegion8Expanded ? 'คลิกเพื่อซ่อนสรุปสถานะพิกัด 8 ภูมิภาค' : 'คลิกเพื่อดูสรุปสถานะพิกัด 8 ภูมิภาคของไทย'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 28px',
              borderRadius: '999px',
              background: isRegion8Expanded ? '#0f172a' : '#ffffff',
              color: isRegion8Expanded ? '#ffffff' : '#1e293b',
              border: isRegion8Expanded ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
              fontFamily: "'Kanit', sans-serif",
              fontSize: '17.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <Compass size={21} color={isRegion8Expanded ? '#38bdf8' : '#0284c7'} />
            <span>{isRegion8Expanded ? 'อธิบายพิกัดแปดภูมิภาคของไทย (ซ่อน)' : 'อธิบายพิกัดแปดภูมิภาคของไทย'}</span>
            {isRegion8Expanded ? <ChevronUp size={21} /> : <ChevronDown size={21} />}
          </button>

          {/* ปุ่มหลักฐานเชิงประจักษ์ (Extra Action Button) */}
          {extraActionButton}

          {/* ปุ่มชุดข้อมูล (ซ่อนเมื่อแยกปุ่มชุดข้อมูลออกไปอยู่ล่างสุด) */}
          {!hideDatasetButton && (
            <button
              type="button"
              className="spatial-matrix-toggle-btn"
              onClick={() => setIsDatasetExpanded((prev) => !prev)}
              title={isDatasetExpanded ? 'คลิกเพื่อซ่อนตารางข้อมูลชุดนี้' : 'คลิกเพื่อดูตารางข้อมูลที่นำมาใช้ทำ Synergy ในกราฟนี้'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 28px',
                borderRadius: '999px',
                background: isDatasetExpanded ? '#0f172a' : '#ffffff',
                color: isDatasetExpanded ? '#ffffff' : '#1e293b',
                border: isDatasetExpanded ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
                fontFamily: "'Kanit', sans-serif",
                fontSize: '17.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Database size={21} color={isDatasetExpanded ? '#38bdf8' : '#0284c7'} />
              <span>{isDatasetExpanded ? 'ชุดข้อมูล (ซ่อนตารางข้อมูล)' : 'ชุดข้อมูล'}</span>
              {isDatasetExpanded ? <ChevronUp size={21} /> : <ChevronDown size={21} />}
            </button>
          )}
        </div>

        {/* Collapsible Panel 1: วิธีดูกราฟที่ 2 (แสดงเมื่อกดปุ่มวิธีดูกราฟ) */}
        {isGuideExpanded && (
          <div style={{ marginTop: '16px', width: '100%', animation: 'fadeIn 0.25s ease' }}>
            <MdcChart2GuideCard topicName={topicName} />
          </div>
        )}

        {/* Collapsible Panel 2: สรุปสถานะพิกัด 8 ภูมิภาคของไทย (แสดงเมื่อกดปุ่มอธิบายพิกัดแปดภูมิภาคของไทย) */}
        {isRegion8Expanded && (
          <div style={{ marginTop: '16px', width: '100%', animation: 'fadeIn 0.25s ease' }}>
            <MdcRegion8SummaryCard />
          </div>
        )}

        {/* Collapsible Panel 2.5: Extra Action Panel (เช่น พิมพ์เขียวการปรับทิศทางงบประมาณภาครัฐ) */}
        {extraActionPanel && (
          <div style={{ marginTop: '16px', width: '100%', animation: 'fadeIn 0.25s ease' }}>
            {extraActionPanel}
          </div>
        )}

        {/* Collapsible Panel 3: Synergy Dataset Table (แสดงเมื่อกดปุ่มชุดข้อมูลเท่านั้น) */}
        {!hideDatasetButton && isDatasetExpanded && (
          <div style={{ marginTop: '16px', width: '100%', animation: 'fadeIn 0.25s ease' }}>
            {customDatasetPanel ? (
              customDatasetPanel
            ) : (
              <MdcTopicSynergyDatasetViewer
                topicId={topicId}
                topicTitle={topicName}
                accentColor={accentColor}
                hideCorrelationSection={true}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};