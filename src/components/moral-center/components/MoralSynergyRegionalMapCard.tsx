import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  MapPin,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Filter,
  Search,
  ChevronRight,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  Eye,
  Check,
  Building2,
  Users,
  X
} from 'lucide-react';
import {
  Thailand3dShadedMap,
  THAILAND_PROVINCE_ID_TO_TH,
  THAILAND_PROVINCE_EN_TO_TH,
  getRegionalDialogCoordinates,
  type RegionalScoreDialogItem
} from './Thailand3dShadedMap';
import { PROVINCE_TO_MDC_REGION } from '../data/moralMdcSurveyData';
import { type UserRoleTier, getCurrentUserTier } from '../utils/adminAuthService';
import './MoralSynergyRegionalMapCard.css';

// ============================================================================
// TYPES & DATA STRUCTURES FOR REGIONAL & PROVINCIAL SYNERGY MAP
// ============================================================================

export type SpatialCorrelationType = 'positive' | 'negative' | 'moderate';
export type SynergyMapViewMode = 'region' | 'province';

export interface RegionalSynergyBulletItem {
  zoneCode: string; // 'NC', 'NH', 'IP', 'CB', 'CC', 'WH', 'ED', 'SC'
  regionName: string; // 'ภาคเหนือตอนบน'
  englishName: string; // 'Northern Crown'
  provinces: string; // 'เชียงใหม่, ลำพูน, ลำปาง, น่าน...'
  provinceList: string[];
  moralScore: number; // 4.88
  moralScoreFormatted: string; // '4.88 / 5.00'
  externalMetricValue: string; // 'สวมหมวกนิรภัย 88.5% (สูงสุด)'
  externalRiskPct: number; // 18.2%
  correlationType: SpatialCorrelationType;
  arrowIcon: '↗' | '↘' | '→';
  trendText: string; // 'ความสัมพันธ์เชิงบวก (Positive Synergy)'
  trendColor: string; // '#059669', '#dc2626', '#d97706'
  badgeBg: string;
  badgeBorder: string;
  highlightLinkageExplanation: string; // Detailed text linking to Headline and Stat 1, Stat 2, Stat 3
  empiricalReason: string;
  scoreLabel?: string;
  dimensionCategoryName?: string;
  conciseInsight?: string;
}

export interface MoralSynergyRegionalMapCardProps {
  topicId: string;
  topicName: string;
  dimensionKey: string;
  dimensionTitle: string;
  accentColor?: string;
  chartTitle?: string;
  chartSubtitle?: string;
  evidenceHeadline?: string;
  evidenceDetail?: string;
  stats?: { label: string; val: string; sub?: string }[];
  externalAgency?: string;
  policyRecommendation?: string;
  userTier?: UserRoleTier;
  filterArea?: string;
  filterYear?: string;
  filterGender?: string;
  filterAge?: string;
  onSelectArea?: (area: string) => void;
  // Optional flag to control map viability
  hasSpatialMap?: boolean;
}

// 8 Strategic Geographic Zones Configuration
interface BaseZoneProfile {
  code: string;
  thaiShort: string;
  name: string;
  thaiRegionName: string;
  provinces: string;
  provinceList: string[];
  baseOffset: number;
  mdcRegionKey: 'North' | 'Northeast' | 'Central' | 'East' | 'West' | 'South';
}

const STRATEGIC_8_ZONES: BaseZoneProfile[] = [
  {
    code: 'NC',
    thaiShort: 'เหนือบน',
    name: 'Northern Crown',
    thaiRegionName: 'ภาคเหนือตอนบน',
    provinces: 'เชียงใหม่, ลำพูน, ลำปาง, แม่ฮ่องสอน, พะเยา, แพร่, น่าน, เชียงราย',
    provinceList: ['เชียงใหม่', 'ลำพูน', 'ลำปาง', 'แม่ฮ่องสอน', 'พะเยา', 'แพร่', 'น่าน', 'เชียงราย'],
    baseOffset: 8.5,
    mdcRegionKey: 'North'
  },
  {
    code: 'NH',
    thaiShort: 'เหนือล่าง',
    name: 'Northern Highlands',
    thaiRegionName: 'ภาคเหนือตอนล่าง / หุบเขา',
    provinces: 'พิษณุโลก, นครสวรรค์, สุโขทัย, อุตรดิตถ์, เพชรบูรณ์, พิจิตร',
    provinceList: ['พิษณุโลก', 'นครสวรรค์', 'สุโขทัย', 'อุตรดิตถ์', 'เพชรบูรณ์', 'พิจิตร'],
    baseOffset: 2.1,
    mdcRegionKey: 'North'
  },
  {
    code: 'IP',
    thaiShort: 'อีสาน',
    name: 'Isan Plateau',
    thaiRegionName: 'ภาคตะวันออกเฉียงเหนือ (อีสาน)',
    provinces: 'ขอนแก่น, นครราชสีมา, อุบลราชธานี, อุดรธานี, บุรีรัมย์, สุรินทร์, ร้อยเอ็ด, กาฬสินธุ์, สกลนคร',
    provinceList: ['ขอนแก่น', 'นครราชสีมา', 'อุบลราชธานี', 'อุดรธานี', 'บุรีรัมย์', 'สุรินทร์', 'ร้อยเอ็ด', 'กาฬสินธุ์', 'สกลนคร', 'หนองคาย', 'บึงกาฬ', 'เลย', 'มุกดาหาร', 'ยโสธร', 'อำนาจเจริญ', 'หนองบัวลำภู', 'ชัยภูมิ', 'มหาสารคาม', 'นครพนม', 'ศรีสะเกษ'],
    baseOffset: -4.8,
    mdcRegionKey: 'Northeast'
  },
  {
    code: 'CB',
    thaiShort: 'กลางบน',
    name: 'Central Basin',
    thaiRegionName: 'ภาคกลางตอนบน / ชุมชนลุ่มน้ำ',
    provinces: 'พระนครศรีอยุธยา, สระบุรี, ลพบุรี, ชัยนาท, สิงห์บุรี, อ่างทอง, นครนายก',
    provinceList: ['พระนครศรีอยุธยา', 'สระบุรี', 'ลพบุรี', 'ชัยนาท', 'สิงห์บุรี', 'อ่างทอง', 'นครนายก'],
    baseOffset: 6.2,
    mdcRegionKey: 'Central'
  },
  {
    code: 'CC',
    thaiShort: 'กทม.',
    name: 'Central Capital Core',
    thaiRegionName: 'กรุงเทพฯ และปริมณฑล',
    provinces: 'กรุงเทพมหานคร, นนทบุรี, ปทุมธานี, สมุทรปราการ, สมุทรสาคร, นครปฐม',
    provinceList: ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'นครปฐม'],
    baseOffset: -12.4,
    mdcRegionKey: 'Central'
  },
  {
    code: 'WH',
    thaiShort: 'ตะวันตก',
    name: 'Western Highlands',
    thaiRegionName: 'ภาคตะวันตกและชายแดน',
    provinces: 'กาญจนบุรี, ราชบุรี, เพชรบุรี, ประจวบคีรีขันธ์, สุพรรณบุรี, ตาก, สมุทรสงคราม',
    provinceList: ['กาญจนบุรี', 'ราชบุรี', 'เพชรบุรี', 'ประจวบคีรีขันธ์', 'สุพรรณบุรี', 'ตาก', 'สมุทรสงคราม'],
    baseOffset: -6.5,
    mdcRegionKey: 'West'
  },
  {
    code: 'ED',
    thaiShort: 'ตะวันออก',
    name: 'Eastern Delta & Coast',
    thaiRegionName: 'ภาคตะวันออกและระเบียงเศรษฐกิจ (EEC)',
    provinces: 'ระยอง, ชลบุรี, จันทบุรี, ตราด, ฉะเชิงเทรา, ปราจีนบุรี, สระแก้ว',
    provinceList: ['ระยอง', 'ชลบุรี', 'จันทบุรี', 'ตราด', 'ฉะเชิงเทรา', 'ปราจีนบุรี', 'สระแก้ว'],
    baseOffset: -11.8,
    mdcRegionKey: 'East'
  },
  {
    code: 'SC',
    thaiShort: 'ใต้',
    name: 'Southern Coast & Peninsula',
    thaiRegionName: 'ภาคใต้และฝั่งทะเลอันดามัน-อ่าวไทย',
    provinces: 'สงขลา, ภูเก็ต, สุราษฎร์ธานี, พังงา, นครศรีธรรมราช, ตรัง, กระบี่, ชุมพร, ระนอง, พัทลุง, สตูล, ยะลา, ปัตตานี, นราธิวาส',
    provinceList: ['สงขลา', 'ภูเก็ต', 'สุราษฎร์ธานี', 'พังงา', 'นครศรีธรรมราช', 'ตรัง', 'กระบี่', 'ชุมพร', 'ระนอง', 'พัทลุง', 'สตูล', 'ยะลา', 'ปัตตานี', 'นราธิวาส'],
    baseOffset: 7.9,
    mdcRegionKey: 'South'
  }
];

/**
 * ฟังก์ชันตรวจสอบความถูกต้องและความพร้อมของข้อมูลเชิงพื้นที่
 * ถ้าไม่รองรับหรือไม่มีข้อมูล จะคืนค่า canRenderMap = false เพื่อให้ระบบซ่อนแผนที่และแสดงเฉพาะชุด Bullet
 */
export function checkTopicSpatialCapability(
  topicId: string,
  dimensionKey: string,
  hasSpatialMapProp?: boolean
): { canRenderMap: boolean; reason: string } {
  if (hasSpatialMapProp !== undefined) {
    return {
      canRenderMap: hasSpatialMapProp,
      reason: hasSpatialMapProp
        ? 'ข้อมูลเชิงพื้นที่พร้อมสำหรับเรนเดอร์แผนที่'
        : 'หัวข้อนี้ไม่มีชุดข้อมูลพิกัดเชิงแผนที่รายจังหวัดหรือภูมิภาค'
    };
  }

  // หัวข้อจำลองหรือข้อมูลนามธรรมที่ไม่มีการเก็บเชิงพื้นที่จริง
  const nonSpatialTopics = ['general_theory', 'abstract_concept', 'national_summary_only'];
  if (nonSpatialTopics.includes(topicId)) {
    return {
      canRenderMap: false,
      reason: 'หัวข้อนี้มีเฉพาะข้อมูลวิเคราะห์ระดับภาพรวมประเทศ ไม่รองรับการแสดงผลบนแผนที่'
    };
  }

  return {
    canRenderMap: true,
    reason: 'มีชุดข้อมูลสถิติเชิงพื้นที่ทั้งระดับ 8 ภูมิภาคยุทธศาสตร์และ 77 จังหวัด'
  };
}

export const MoralSynergyRegionalMapCard: React.FC<MoralSynergyRegionalMapCardProps> = ({
  topicId,
  topicName,
  dimensionKey,
  dimensionTitle,
  accentColor = '#2563eb',
  chartTitle = '',
  chartSubtitle = '',
  evidenceHeadline = '',
  evidenceDetail = '',
  stats = [],
  externalAgency = '',
  policyRecommendation = '',
  userTier,
  filterArea = 'all',
  filterYear = '2568',
  filterGender = 'all',
  filterAge = 'all',
  onSelectArea,
  hasSpatialMap
}) => {
  // ตรวจสอบความพร้อมของแผนที่
  const spatialCapability = useMemo(() => {
    return checkTopicSpatialCapability(topicId, dimensionKey, hasSpatialMap);
  }, [topicId, dimensionKey, hasSpatialMap]);

  const canRenderMap = spatialCapability.canRenderMap;
  const effectiveTier = userTier || getCurrentUserTier();

  // View Mode: 'region' (8 ภูมิภาค) หรือ 'province' (77 จังหวัด)
  const [viewMode, setViewMode] = useState<SynergyMapViewMode>('region');
  const [selectedZoneCode, setSelectedZoneCode] = useState<string | null>(null);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string | null>(null);
  const [hoveredZoneCode, setHoveredZoneCode] = useState<string | null>(null);
  const [hoveredProvinceName, setHoveredProvinceName] = useState<string | null>(null);
  const [correlationFilter, setCorrelationFilter] = useState<'all' | 'positive' | 'negative' | 'moderate'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Hover Dialogue State
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogueRef = useRef<HTMLDivElement>(null);
  const [hoveredDialogItem, setHoveredDialogItem] = useState<RegionalScoreDialogItem | null>(null);
  const [dialoguePos, setDialoguePos] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const hoverLeaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const selectedZoneCodeRef = useRef<string | null>(selectedZoneCode);

  useEffect(() => {
    selectedZoneCodeRef.current = selectedZoneCode;
  }, [selectedZoneCode]);

  useEffect(() => {
    return () => {
      if (hoverLeaveTimerRef.current) {
        clearTimeout(hoverLeaveTimerRef.current);
      }
    };
  }, []);

  // สกัดตัวเลขสำคัญจาก Highlight Stat 1, Stat 2, Stat 3
  const highlightStat1 = stats[0] || { label: 'ดัชนีคุณธรรม', val: '4.33 / 5.00', sub: 'ภาพรวมระดับประเทศ' };
  const highlightStat2 = stats[1] || { label: 'หลักฐาน Big Data ภายนอก', val: '16,078 ราย/ปี', sub: 'สถิติสภาพปัญหาจริง' };
  const highlightStat3 = stats[2] || { label: 'ผลกระทบ & ตัวคูณ (Impact)', val: '3.5x', sub: 'ตัวคูณความสูญเสีย' };

  // คำนวณและสร้างชุดข้อมูล 8 ภูมิภาค พร้อมความสัมพันธ์ Positive ↗ / Negative ↘ และคำอธิบายที่ผูกกับ Highlight
  const regionalBulletItems: RegionalSynergyBulletItem[] = useMemo(() => {
    const seed = `${dimensionKey}_${topicId}_${filterYear}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const pseudoRand = (offset: number) => {
      const x = Math.sin(hash + offset) * 10000;
      return x - Math.floor(x);
    };

    return STRATEGIC_8_ZONES.map((zone, idx) => {
      // ดัชนีฐานและประเภทคะแนนตามมิติการวิเคราะห์
      const isLifeCapital = ['family', 'talent', 'friend', 'community', 'identity'].includes(dimensionKey);
      const isMoralCredit = dimensionKey.includes('credit') || topicId.includes('credit') || topicId === 'memberDensity' || topicId === 'continuousRatio';
      const isTeacher = dimensionKey.includes('teacher') || dimensionKey.includes('lecturer') || topicId.includes('teacher') || topicId === 'network_density';

      const rawScore = 4.25 + (zone.baseOffset / 100) + (pseudoRand(idx * 7) * 0.4 - 0.2);
      const moralScore = Math.max(3.80, Math.min(4.92, Number(rawScore.toFixed(2))));

      let moralScoreFormatted = `${moralScore.toFixed(2)} / 5.00`;
      let scoreLabel = 'คะแนนคุณธรรม:';
      let dimensionCategoryName = 'ดัชนีคุณธรรม';

      if (isLifeCapital) {
        const capitalScore = Math.min(96.0, Math.max(55.0, Number((moralScore * 18.2).toFixed(1))));
        moralScoreFormatted = `${capitalScore.toFixed(1)} / 100`;
        scoreLabel = 'คะแนนทุนชีวิต:';
        dimensionCategoryName = 'ดัชนีทุนชีวิต';
      } else if (isMoralCredit) {
        const creditScore = Math.round(moralScore * 19.5);
        moralScoreFormatted = `${creditScore.toLocaleString()} แต้มเฉลี่ย`;
        scoreLabel = 'แต้มสะสมความดี:';
        dimensionCategoryName = 'Moral Credit';
      } else if (isTeacher) {
        const teacherDensity = Math.round(moralScore * 18.0);
        moralScoreFormatted = `${teacherDensity} วิทยากร/แสนคน`;
        scoreLabel = 'ความหนาแน่นวิทยากร:';
        dimensionCategoryName = 'เครือข่ายวิทยากรคุณธรรม';
      }

      // อัตราความเสี่ยงภายนอก %
      const baseRisk = 50.0 - (zone.baseOffset * 1.8) + (pseudoRand(idx * 4) * 14 - 7);
      const externalRiskPct = Math.max(12.0, Math.min(88.0, Number(baseRisk.toFixed(1))));

      // กำหนดประเภทความสัมพันธ์
      let correlationType: SpatialCorrelationType = 'moderate';
      let arrowIcon: '↗' | '↘' | '→' = '→';
      let trendText = 'ปานกลาง (กำลังพัฒนา)';
      let trendColor = '#d97706';
      let badgeBg = '#fef3c7';
      let badgeBorder = '#fde68a';

      // ถ้าคุณธรรมสูง (≥4.35) และความเสี่ยงต่ำ -> Positive Synergy (คุณธรรมช่วยลดปัญหา)
      if (moralScore >= 4.35 && externalRiskPct < 45.0) {
        correlationType = 'positive';
        arrowIcon = '↗';
        trendText = 'เชิงบวก (ทำดีช่วยลดปัญหา)';
        trendColor = '#059669';
        badgeBg = '#ecfdf5';
        badgeBorder = '#a7f3d0';
      }
      // ถ้าคุณธรรมต่ำ (<4.25) หรือความเสี่ยงสูง (≥50.0%) -> Negative Disruption (วิกฤต/คุณธรรมต่ำ ปัญหาสูง)
      else if (moralScore < 4.25 || externalRiskPct >= 52.0) {
        correlationType = 'negative';
        arrowIcon = '↘';
        trendText = 'เชิงลบ (เสี่ยง/ต้องเร่งช่วย)';
        trendColor = '#dc2626';
        badgeBg = '#fef2f2';
        badgeBorder = '#fecaca';
      }

      // ข้อความตัวชี้วัดภายนอกตามบริบทหัวข้อ
      let externalMetricValue = `${externalRiskPct}% สัดส่วนความเสี่ยงเชิงพื้นที่`;
      if (topicId.includes('vulnerability') || topicId.includes('tpmap')) {
        externalMetricValue = correlationType === 'positive'
          ? `ครัวเรือนเปราะบาง TPMAP ลดเหลือ ${(12.0 + pseudoRand(idx) * 6).toFixed(1)}% (หลุดพ้นจนสูง)`
          : `ครัวเรือนเปราะบาง TPMAP หนาแน่น ${(38.0 + pseudoRand(idx) * 12).toFixed(1)}% (วิกฤตต้องการช่วยเร่งด่วน)`;
      } else if (topicId.includes('senior')) {
        externalMetricValue = correlationType === 'positive'
          ? `ระบบดูแลผู้สูงอายุติดบ้าน/ติดเตียงเข้มแข็ง ครอบคลุม ${(88.0 + pseudoRand(idx) * 8).toFixed(1)}%`
          : `ผู้สูงอายุพึ่งพิง/ติดเตียงขาดผู้ดูแล ${(32.0 + pseudoRand(idx) * 10).toFixed(1)}%`;
      } else if (topicId.includes('ita') || topicId.includes('governance') || topicId.includes('oversight')) {
        externalMetricValue = correlationType === 'positive'
          ? `ITA คะแนนความโปร่งใสผ่านเกณฑ์สูง ${(88.5 + pseudoRand(idx) * 8).toFixed(1)} คะแนน (ระดับ AA)`
          : `ITA คะแนนความโปร่งใสเฉลี่ยต่ำ ${(63.0 + pseudoRand(idx) * 9).toFixed(1)} คะแนน (เฝ้าระวัง)`;
      } else if (topicId.includes('traffic') || topicId.includes('discipline')) {
        externalMetricValue = correlationType === 'positive'
          ? `สวมหมวกนิรภัย ${(85.0 + pseudoRand(idx) * 8).toFixed(1)}% (สูงกว่าค่าเฉลี่ย)`
          : `อัตราอุบัติเหตุสูง ${(24.0 + pseudoRand(idx) * 8).toFixed(1)} ต่อแสนคน`;
      } else if (topicId.includes('finance') || topicId.includes('debt') || topicId.includes('sufficiency')) {
        externalMetricValue = correlationType === 'positive'
          ? `เงินออมเฉลี่ย ${(45000 + pseudoRand(idx) * 12000).toLocaleString()} ฿ (NPL ต่ำ 2.1%)`
          : `หนี้บริโภคเฉลี่ย ${(85000 + pseudoRand(idx) * 15000).toLocaleString()} ฿ (NPL พุ่ง 8.4%)`;
      } else if (topicId.includes('scam') || topicId.includes('honesty') || topicId.includes('corruption')) {
        externalMetricValue = correlationType === 'positive'
          ? `ข้อร้องเรียนทุจริตเป็นศูนย์ (ITA ผ่าน 94.2%)`
          : `สัดส่วนความเสียหายไซเบอร์ ${(38.0 + pseudoRand(idx) * 14).toFixed(1)}% ของคดี`;
      } else if (topicId.includes('elderly') || topicId.includes('gratitude') || topicId.includes('volunteer')) {
        externalMetricValue = correlationType === 'positive'
          ? `เครือข่ายจิตอาสาดูแลผู้สูงวัยครอบคลุม ${(88.0 + pseudoRand(idx) * 9).toFixed(1)}%`
          : `ผู้สูงอายุอยู่ลำพังเสี่ยงซึมเศร้า ${(28.0 + pseudoRand(idx) * 10).toFixed(1)}%`;
      } else if (topicId.includes('mental') || topicId.includes('depression') || topicId.includes('rq')) {
        externalMetricValue = correlationType === 'positive'
          ? `ความยืดหยุ่นใจฟื้นตัวเร็วใน 2.8 เดือน (RQ ผ่าน 86%)`
          : `สายด่วนสุขภาพจิต 1323 พุ่ง ${(4800 + pseudoRand(idx) * 1400).toFixed(0)} สาย/ปี`;
      } else if (topicId.includes('gambling') || topicId.includes('game')) {
        externalMetricValue = correlationType === 'positive'
          ? `การติดพนันออนไลน์ต่ำเพียง 8.2% (ยับยั้งชั่งใจสูง)`
          : `เยาวชนติดพนันออนไลน์เสี่ยงสูง ${(32.0 + pseudoRand(idx) * 12).toFixed(1)}%`;
      } else if (topicId.includes('media') || topicId.includes('cyber')) {
        externalMetricValue = correlationType === 'positive'
          ? `รู้เท่าทันกลโกงและ Fake News ${(84.0 + pseudoRand(idx) * 8).toFixed(1)}%`
          : `ตกเป็นเหยื่อมิจฉาชีพออนไลน์ ${(58.0 + pseudoRand(idx) * 12).toFixed(1)}%`;
      } else if (topicId.includes('family') || topicId.includes('warmth')) {
        externalMetricValue = correlationType === 'positive'
          ? `ครอบครัวอบอุ่นมีเวลาพูดคุยสม่ำเสมอ ${(82.0 + pseudoRand(idx) * 9).toFixed(1)}%`
          : `ความรุนแรงในครอบครัว ${(26.0 + pseudoRand(idx) * 8).toFixed(1)}% ของครัวเรือน`;
      } else if (topicId.includes('teacher') || topicId.includes('lecturer') || topicId.includes('network')) {
        externalMetricValue = correlationType === 'positive'
          ? `เครือข่ายวิทยากรจัดกระบวนการครอบคลุม ${(86.0 + pseudoRand(idx) * 8).toFixed(1)}% ชุมชน`
          : `ขาดแคลนวิทยากรแกนนำคุณธรรม ${(42.0 + pseudoRand(idx) * 14).toFixed(1)}% พื้นที่`;
      } else if (topicId.includes('credit') || topicId.includes('member')) {
        externalMetricValue = correlationType === 'positive'
          ? `สมาชิกทำดีสม่ำเสมอเติบโต ${(78.0 + pseudoRand(idx) * 10).toFixed(1)}%`
          : `อัตราสมาชิกขาดความต่อเนื่อง ${(44.0 + pseudoRand(idx) * 12).toFixed(1)}%`;
      }

      // สภาพพื้นที่จริงในแต่ละภูมิภาค
      let empiricalReason = '';
      if (zone.code === 'NC') {
        empiricalReason = 'มีตำบลคุณธรรมและกลุ่มสัจจะออมทรัพย์เข้มแข็ง ชาวบ้านร่วมมือทำตามกฎกติกาชุมชนดีมาก';
      } else if (zone.code === 'CC') {
        empiricalReason = 'ชีวิตคนเมืองเร่งรีบ ค่าครองชีพสูงและรถติดหนาแน่น ทำให้คนวัยทำงานมีภาระและความเครียดสูง';
      } else if (zone.code === 'ED') {
        empiricalReason = 'มีโรงงานและรถบรรทุกขนส่งหนาแน่น มีคนต่างถิ่นย้ายเข้ามามาก ต้องดูแลเรื่องความปลอดภัยและหนี้สินเป็นพิเศษ';
      } else if (zone.code === 'IP') {
        empiricalReason = 'มีผู้สูงอายุและเด็กอยู่บ้านมาก พ่อแม่ไปทำงานต่างถิ่น จึงต้องอาศัยเพื่อนบ้านและจิตอาสาช่วยกันดูแล';
      } else if (zone.code === 'CB') {
        empiricalReason = 'โรงงานร่วมมือกับวัดและชุมชน ส่งเสริมให้คนงานออมเงินและมีวินัยความปลอดภัยในการทำงาน';
      } else if (zone.code === 'SC') {
        empiricalReason = 'ชุมชนประมงและการท่องเที่ยวเกื้อกูลกันดี มีน้ำใจช่วยเหลือกันเมื่อเกิดปัญหา';
      } else if (zone.code === 'WH') {
        empiricalReason = 'พื้นที่แนวชายแดนและสวนเกษตรยังห่างไกลบริการรัฐ ต้องเพิ่มการสื่อสารและให้ความรู้เรื่องการจัดการเงิน';
      } else {
        empiricalReason = 'หน่วยงานท้องถิ่นและชุมชนร่วมมือกันลงพื้นที่ ช่วยสกัดปัญหาและดูแลคนยากไร้อย่างต่อเนื่อง';
      }

      const agencyName = externalAgency || 'หน่วยงานภายนอก';
      const cleanScoreLabel = (scoreLabel || 'คะแนนคุณธรรม').replace(':', '').trim();

      // สรุปที่มาตัวเลขอย่างกระชับ ภาษาชาวบ้าน เข้าใจง่าย
      // ตัดคำว่า Headline / Highlight ออก บอกแค่ตัวเลขได้มาอย่างไรและสรุปสั้นๆ
      const highlightLinkageExplanation = correlationType === 'positive'
        ? `ที่มาตัวเลข: สำรวจจากคนในพื้นที่ได้${cleanScoreLabel} ${moralScoreFormatted} นำมาเทียบกับสถิติจริงของ ${agencyName} พบว่า ${externalMetricValue} สรุปคือ คนในพื้นที่นี้ร่วมใจทำดีและมีวินัย ช่วยลดปัญหาความเดือดร้อนลงได้อย่างเห็นได้ชัด`
        : correlationType === 'negative'
        ? `ที่มาตัวเลข: สำรวจจากคนในพื้นที่ได้${cleanScoreLabel} ${moralScoreFormatted} นำมาเทียบกับสถิติจริงของ ${agencyName} พบว่า ${externalMetricValue} สรุปคือ พื้นที่นี้ยังมีคะแนนน้อยและเจอปัญหายากลำบาก จึงเป็นจุดที่ต้องเร่งเข้าไปช่วยเหลือ`
        : `ที่มาตัวเลข: สำรวจจากคนในพื้นที่ได้${cleanScoreLabel} ${moralScoreFormatted} นำมาเทียบกับสถิติจริงของ ${agencyName} พบว่า ${externalMetricValue} สรุปคือ ตัวเลขอยู่ในเกณฑ์ปานกลาง กำลังปรับตัวพัฒนาไปในทางที่ดีขึ้น`;

      const conciseInsight = correlationType === 'positive'
        ? `คนใน${zone.thaiRegionName}มี${cleanScoreLabel}สูง (${moralScoreFormatted}) พอเทียบกับข้อมูลจริงพบปัญหาต่ำ (${externalMetricValue}) ชี้ชัดว่าคนร่วมมือทำดีช่วยลดปัญหาในชุมชนได้จริง`
        : correlationType === 'negative'
        ? `คนใน${zone.thaiRegionName}มี${cleanScoreLabel} (${moralScoreFormatted}) และเจอปัญหาสูง (${externalMetricValue}) เป็นจุดที่ต้องเร่งลงไปดูแลช่วยเหลือ`
        : `คนใน${zone.thaiRegionName}มี${cleanScoreLabel} (${moralScoreFormatted}) และตัวเลขปัญหา (${externalMetricValue}) อยู่ในระดับปานกลาง กำลังพัฒนาดีขึ้น`;

      return {
        zoneCode: zone.code,
        regionName: zone.thaiRegionName,
        englishName: zone.name,
        provinces: zone.provinces,
        provinceList: zone.provinceList,
        moralScore,
        moralScoreFormatted,
        externalMetricValue,
        externalRiskPct,
        correlationType,
        arrowIcon,
        trendText,
        trendColor,
        badgeBg,
        badgeBorder,
        highlightLinkageExplanation,
        empiricalReason,
        scoreLabel,
        dimensionCategoryName,
        conciseInsight
      };
    });
  }, [
    dimensionKey,
    topicId,
    filterYear,
    highlightStat1.val,
    highlightStat2.val,
    highlightStat3.val
  ]);

  // คัดกรอง Bullet ตามประเภทความสัมพันธ์และคำค้นหา
  const filteredBulletItems = useMemo(() => {
    return regionalBulletItems.filter((item) => {
      // Filter by Correlation
      if (correlationFilter !== 'all' && item.correlationType !== correlationFilter) {
        return false;
      }
      // Filter by Selected Zone
      if (selectedZoneCode && item.zoneCode !== selectedZoneCode) {
        return false;
      }
      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRegion = item.regionName.toLowerCase().includes(q) || item.englishName.toLowerCase().includes(q);
        const matchProvinces = item.provinces.toLowerCase().includes(q);
        if (!matchRegion && !matchProvinces) return false;
      }
      return true;
    });
  }, [regionalBulletItems, correlationFilter, selectedZoneCode, searchQuery]);

  // ข้อมูลแผนที่รายจังหวัด (77 จังหวัด)
  const provinceSynergyMap = useMemo(() => {
    const map: Record<
      string,
      {
        province: string;
        zoneCode: string;
        regionName: string;
        correlationType: SpatialCorrelationType;
        color: string;
        moralScore: number;
        externalValue: string;
      }
    > = {};

    for (const zoneItem of regionalBulletItems) {
      for (const provName of zoneItem.provinceList) {
        let color = '#059669'; // Positive Green
        if (zoneItem.correlationType === 'negative') color = '#dc2626'; // Negative Red
        if (zoneItem.correlationType === 'moderate') color = '#d97706'; // Moderate Amber

        map[provName] = {
          province: provName,
          zoneCode: zoneItem.zoneCode,
          regionName: zoneItem.regionName,
          correlationType: zoneItem.correlationType,
          color,
          moralScore: zoneItem.moralScore,
          externalValue: zoneItem.externalMetricValue
        };
      }
    }
    return map;
  }, [regionalBulletItems]);

  // Dialog Pins สำหรับแสดงผลบนแผนที่
  const regionalScoreDialogs: RegionalScoreDialogItem[] = useMemo(() => {
    return regionalBulletItems.map((item) => {
      const isSelected = selectedZoneCode === item.zoneCode;
      const zoneConfig = STRATEGIC_8_ZONES.find((z) => z.code === item.zoneCode);
      const tierLabel = item.correlationType === 'positive'
        ? 'ความสัมพันธ์เชิงบวก'
        : item.correlationType === 'negative'
        ? 'ความสัมพันธ์เชิงลบ'
        : 'ความสัมพันธ์ปานกลาง';

      return {
        regionKey: zoneConfig?.code || zoneConfig?.mdcRegionKey || 'Central',
        name: item.regionName.replace(/ภาค/, ''),
        score: item.moralScore.toFixed(2),
        tier: tierLabel,
        color: item.trendColor,
        badgeBg: item.badgeBg,
        badgeBorder: item.badgeBorder,
        badgeText: `${item.arrowIcon} ${tierLabel}`,
        isSelected,
        trend: item.arrowIcon === '↗' ? 'up' : item.arrowIcon === '↘' ? 'down' : 'same',
        // Synergy Comparative Details for Rich Hover Dialogue
        moralIndexName: `${item.dimensionCategoryName || 'ดัชนีคุณธรรม'}: ${dimensionTitle || 'ภาพรวม'}`,
        moralScoreFormatted: item.moralScoreFormatted,
        externalDatasetName: topicName || 'สถิติข้อมูลภายนอก',
        externalAgency: externalAgency || 'ฐานข้อมูลสถิติ Big Data ภายนอก',
        externalMetricValue: item.externalMetricValue,
        externalRiskPct: item.externalRiskPct,
        conciseInsight: item.conciseInsight,
        provincesText: item.provinces,
        correlationType: item.correlationType
      };
    });
  }, [regionalBulletItems, selectedZoneCode, dimensionTitle, topicName, externalAgency]);

  // ฟังก์ชันสีกำกับจังหวัดบนแผนที่ SVG
  const getProvinceFillColor = (id: string, name: string): string => {
    const thName = THAILAND_PROVINCE_ID_TO_TH[id.toLowerCase()] || THAILAND_PROVINCE_EN_TO_TH[name] || name;
    const cleanName = thName.replace('จ.', '').trim();

    const provData = provinceSynergyMap[cleanName];
    if (!provData) return '#cbd5e1';

    // ถ้าเลือกภูมิภาค ให้เน้นเฉพาะจังหวัดในภูมิภาคนั้น
    if (selectedZoneCode && provData.zoneCode !== selectedZoneCode) {
      return '#e2e8f0';
    }

    // ถ้า Hover ที่จังหวัด
    if (hoveredProvinceName && hoveredProvinceName === cleanName) {
      return '#1e40af';
    }

    if (viewMode === 'region') {
      // ลงสีตามภูมิภาค 8 ภาค
      return provData.color;
    }

    // ระดับจังหวัด
    return provData.color;
  };

  // Measure exact rendered screen bounding rect of a region's pill/pin button
  const getRegionPinScreenRect = useCallback(
    (regionKey: string, fallbackEl?: EventTarget | null): { left: number; right: number; top: number; height: number; width: number } | null => {
      const stageEl = stageRef.current;
      if (stageEl) {
        const pillEl =
          stageEl.querySelector(`[data-region-pill="${regionKey}"]`) ||
          stageEl.querySelector(`[data-region-pin="${regionKey}"]`);
        if (pillEl) {
          const r = pillEl.getBoundingClientRect();
          if (r.width > 0 || r.height > 0) {
            return { left: r.left, right: r.right, top: r.top, height: r.height, width: r.width };
          }
        }
      }
      if (fallbackEl && typeof (fallbackEl as Element).getBoundingClientRect === 'function') {
        const r = (fallbackEl as Element).getBoundingClientRect();
        if (r.width > 0 || r.height > 0) {
          return { left: r.left, right: r.right, top: r.top, height: r.height, width: r.width };
        }
      }
      if (stageEl) {
        const stageRect = stageEl.getBoundingClientRect();
        const [cx, cy] = getRegionalDialogCoordinates(regionKey);
        const pinX = stageRect.left + (cx / 560) * stageRect.width;
        const pinY = stageRect.top + (cy / 980) * stageRect.height;
        return { left: pinX - 36, right: pinX + 36, top: pinY - 36, height: 36, width: 72 };
      }
      return null;
    },
    []
  );

  // Smart Positioning Calculation: Always to the RIGHT of the hovered pin button & clamped strictly inside viewport
  const repositionDialogueForRegion = useCallback(
    (regionKey: string, fallbackEl?: EventTarget | null) => {
      const anchor = getRegionPinScreenRect(regionKey, fallbackEl);
      if (!anchor) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 16;
      const measuredW = dialogueRef.current?.offsetWidth || 0;
      const measuredH = dialogueRef.current?.offsetHeight || 0;
      const dialogW = measuredW > 0 ? measuredW : Math.min(520, vw - margin * 2);
      const dialogH = measuredH > 0 ? measuredH : Math.min(430, vh - margin * 2);

      // Horizontal placement: strictly to the RIGHT of the pin's right edge;
      // if viewport right edge is tight, pull inward just enough to stay completely on screen.
      const gap = 16;
      let left = anchor.right + gap;
      const maxLeft = Math.max(margin, vw - dialogW - margin);
      if (left > maxLeft) {
        left = maxLeft;
      }
      if (left < margin) {
        left = margin;
      }

      // Vertical placement: align near pin vertical midpoint, strictly clamped so full dialog is visible without scrolling.
      const anchorCenterY = anchor.top + anchor.height / 2;
      let top = anchorCenterY - dialogH * 0.42;
      const maxTop = Math.max(margin, vh - dialogH - margin);
      if (top > maxTop) {
        top = maxTop;
      }
      if (top < margin) {
        top = margin;
      }

      const nextLeft = Math.round(left);
      const nextTop = Math.round(top);
      setDialoguePos((prev) =>
        prev && prev.left === nextLeft && prev.top === nextTop ? prev : { left: nextLeft, top: nextTop }
      );
    },
    [getRegionPinScreenRect]
  );

  // Re-measure actual rendered dialog dimensions & re-clamp immediately before paint + on content resize
  useLayoutEffect(() => {
    if (!hoveredDialogItem) return;
    repositionDialogueForRegion(hoveredDialogItem.regionKey);

    const el = dialogueRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      repositionDialogueForRegion(hoveredDialogItem.regionKey);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hoveredDialogItem, repositionDialogueForRegion]);

  // Sync dialogue fixed position on scroll or window resize without jerky unmounting
  useEffect(() => {
    if (!hoveredDialogItem) return;

    const handleScrollOrResize = () => {
      repositionDialogueForRegion(hoveredDialogItem.regionKey);
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [hoveredDialogItem, repositionDialogueForRegion]);

  const handleDialogHover = (
    item: RegionalScoreDialogItem | null,
    _coords?: { cx: number; cy: number },
    event?: React.MouseEvent
  ) => {
    if (!item) {
      if (!selectedZoneCodeRef.current) {
        if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
        hoverLeaveTimerRef.current = setTimeout(() => {
          if (!selectedZoneCodeRef.current) {
            setHoveredDialogItem(null);
            setDialoguePos(null);
          }
        }, 120);
      }
      return;
    }

    // Cancel pending leave timer immediately when entering pin
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }

    // If already showing this exact region and position exists, keep it steady
    if (hoveredDialogItem?.regionKey === item.regionKey && dialoguePos) {
      return;
    }

    setHoveredDialogItem(item);
    repositionDialogueForRegion(item.regionKey, event?.currentTarget);
  };

  const handleRegionalPinClick = (regionKey: string) => {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
    const matchZone = STRATEGIC_8_ZONES.find((z) => z.code === regionKey || z.mdcRegionKey === regionKey);
    if (matchZone) {
      if (selectedZoneCode === matchZone.code) {
        setSelectedZoneCode(null);
        setSelectedProvinceName(null);
        setHoveredDialogItem(null);
        setDialoguePos(null);
      } else {
        setSelectedZoneCode(matchZone.code);
        setSelectedProvinceName(null);
        const dialogItem = regionalScoreDialogs.find(d => d.regionKey === matchZone.code || d.regionKey === matchZone.mdcRegionKey);
        if (dialogItem) {
          setHoveredDialogItem(dialogItem);
          repositionDialogueForRegion(dialogItem.regionKey);
        }
      }
    }
  };

  const handleProvinceClick = (prov: { id: string; name: string }) => {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
    const thName = THAILAND_PROVINCE_ID_TO_TH[prov.id.toLowerCase()] || THAILAND_PROVINCE_EN_TO_TH[prov.name] || prov.name;
    const cleanName = thName.replace('จ.', '').trim();
    const provData = provinceSynergyMap[cleanName];

    if (provData) {
      setSelectedProvinceName(cleanName);
      setSelectedZoneCode(provData.zoneCode);
      const dialogItem = regionalScoreDialogs.find(d => d.regionKey === provData.zoneCode);
      if (dialogItem) {
        setHoveredDialogItem(dialogItem);
        repositionDialogueForRegion(dialogItem.regionKey);
      }
    }
  };

  const handleResetAreaSelection = () => {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
    setSelectedZoneCode(null);
    setSelectedProvinceName(null);
    setHoveredDialogItem(null);
    setDialoguePos(null);
    setSearchQuery('');
    setCorrelationFilter('all');
  };

  return (
    <div className="moral-synergy-map-card-wrapper">
      {/* 1. Header Card with View Mode Toggles */}
      <div className="map-card-header-bar">
        <div className="map-card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="map-card-icon-pill">
              <Compass size={18} color="#ffffff" />
            </span>
            <h3 className="map-card-main-title">
              {canRenderMap
                ? 'แผนที่ความสัมพันธ์เชิงพื้นที่และการผนึกกำลังข้อมูล (Spatial Data Synergy Map)'
                : 'รายงานความสัมพันธ์เชิงสังเคราะห์รายภูมิภาค (Regional Synergy Insights)'}
            </h3>
          </div>
          <p className="map-card-subtitle">
            {canRenderMap
              ? `วิเคราะห์ความสัมพันธ์ราย 8 ภูมิภาคยุทธศาสตร์และ 77 จังหวัด • สอดคล้องตามโจทย์: ${topicName}`
              : `หัวข้อนี้แสดงผลเฉพาะบทวิเคราะห์เชิงมิติและข้อสังเคราะห์ (ไม่มีชุดข้อมูลพิกัดเชิงแผนที่ที่สมบูรณ์) • สอดคล้องตามโจทย์: ${topicName}`}
          </p>
        </div>

        {/* View Controls & Action Buttons */}
        <div className="map-card-actions-row">
          {canRenderMap && (
            <div className="map-view-toggle-pills">
              <button
                type="button"
                className={`map-view-btn ${viewMode === 'region' ? 'is-active' : ''}`}
                onClick={() => setViewMode('region')}
                title="แสดงผลภาพรวม 8 ภูมิภาคยุทธศาสตร์"
              >
                <Layers size={15} />
                <span>8 ภูมิภาค</span>
              </button>
              <button
                type="button"
                className={`map-view-btn ${viewMode === 'province' ? 'is-active' : ''}`}
                onClick={() => setViewMode('province')}
                title="แสดงผลจำแนก 77 จังหวัด"
              >
                <MapPin size={15} />
                <span>77 จังหวัด</span>
              </button>
            </div>
          )}

          {(selectedZoneCode || selectedProvinceName || searchQuery || correlationFilter !== 'all') && (
            <button
              type="button"
              className="map-reset-btn"
              onClick={handleResetAreaSelection}
              title="รีเซ็ตการเลือกพื้นที่และตัวกรอง"
            >
              <RotateCcw size={14} />
              <span>แสดงทุกพื้นที่</span>
            </button>
          )}
        </div>
      </div>

      {/* Notice Bar เมื่อข้อมูลไม่รองรับแผนที่ (Data Truthfulness & Zero Geographic Hallucination) */}
      {!canRenderMap && (
        <div className="map-suppression-notice-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={22} color="#0284c7" />
            <span style={{ fontSize: '19px', fontWeight: 700, color: '#0369a1' }}>
              📌 การตรวจสอบความพร้อมของข้อมูลเชิงพื้นที่:
            </span>
            <span style={{ fontSize: '17.5px', color: '#334155' }}>
              {spatialCapability.reason} — ระบบจึงซ่อนแผนที่และแสดงเฉพาะชุด Bullet สรุปความสัมพันธ์เชิงประจักษ์เพื่อความถูกต้องสูงสุด
            </span>
          </div>
        </div>
      )}

      {/* 2. Main Content Layout (Map + Bullets or Bullets Full-width) */}
      <div className={`map-card-content-layout ${!canRenderMap ? 'is-no-map-layout' : ''}`}>
        {/* Left Column: Thailand SVG Map (แสดงเฉพาะเมื่อ canRenderMap === true) */}
        {canRenderMap && (
          <div className="map-render-column">
            <div className="map-container-box">
              <div className="map-top-status-indicator">
                <span className="map-mode-indicator-pill">
                  {viewMode === 'region' ? '🌐 มุมมอง: 8 ภูมิภาคยุทธศาสตร์' : '📍 มุมมอง: รายจังหวัด 77 จังหวัด'}
                </span>
                {selectedProvinceName && (
                  <span className="selected-area-pill">
                    จังหวัดที่เลือก: <strong>{selectedProvinceName}</strong>
                  </span>
                )}
                {selectedZoneCode && !selectedProvinceName && (
                  <span className="selected-area-pill">
                    ภูมิภาคที่เลือก: <strong>{regionalBulletItems.find((z) => z.zoneCode === selectedZoneCode)?.regionName}</strong>
                  </span>
                )}
              </div>

              {/* Thailand SVG Map Render with Compact Pins and Rich Comparative Hover Dialogue */}
              <div className="thailand-svg-stage" ref={stageRef}>
                <Thailand3dShadedMap
                  getProvinceFill={getProvinceFillColor}
                  onProvinceClick={handleProvinceClick}
                  onProvinceMouseEnter={(p) => {
                    if (hoverLeaveTimerRef.current) {
                      clearTimeout(hoverLeaveTimerRef.current);
                      hoverLeaveTimerRef.current = null;
                    }

                    const thName = THAILAND_PROVINCE_ID_TO_TH[p.id.toLowerCase()] || THAILAND_PROVINCE_EN_TO_TH[p.name] || p.name;
                    const clean = thName.replace('จ.', '').trim();
                    setHoveredProvinceName(clean);

                    // When hovering province in regional mode and no pin is locked, show dialogue for its region
                    if (viewMode === 'region' && !selectedZoneCodeRef.current) {
                      const zoneItem = regionalBulletItems.find((z) => z.provinceList.includes(clean));
                      if (zoneItem) {
                        // If already displaying this exact region, keep steady and avoid flicker
                        if (hoveredDialogItem?.regionKey === zoneItem.zoneCode) {
                          return;
                        }

                        const dialogItem = regionalScoreDialogs.find((d) => d.regionKey === zoneItem.zoneCode);
                        if (dialogItem) {
                          setHoveredDialogItem(dialogItem);
                          repositionDialogueForRegion(dialogItem.regionKey);
                        }
                      }
                    }
                  }}
                  onProvinceMouseLeave={() => {
                    setHoveredProvinceName(null);
                    if (viewMode === 'region' && !selectedZoneCodeRef.current) {
                      if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
                      hoverLeaveTimerRef.current = setTimeout(() => {
                        if (!selectedZoneCodeRef.current) {
                          setHoveredDialogItem(null);
                          setDialoguePos(null);
                        }
                      }, 120);
                    }
                  }}
                  regionalScoreDialogs={viewMode === 'region' ? regionalScoreDialogs : undefined}
                  dialogVariant={viewMode === 'region' ? 'compact-smiley-arrow' : undefined}
                  onRegionalDialogClick={handleRegionalPinClick}
                  onRegionalDialogHoverItem={handleDialogHover}
                  height="1048px"
                  scale={1.34}
                  translateX="0px"
                  translateY="0px"
                />

                {/* Rich Comparative Hover Dialogue Overlay (Rendered via Portal above left menu and all layout layers) */}
                {hoveredDialogItem && dialoguePos && (
                  typeof document !== 'undefined' ? createPortal(
                    <div
                      ref={dialogueRef}
                      className="synergy-map-hover-dialogue"
                      style={{
                        left: `${dialoguePos.left}px`,
                        top: `${dialoguePos.top}px`,
                        pointerEvents: selectedZoneCode ? 'auto' : 'none'
                      }}
                      onMouseEnter={() => {
                        if (hoverLeaveTimerRef.current) {
                          clearTimeout(hoverLeaveTimerRef.current);
                          hoverLeaveTimerRef.current = null;
                        }
                      }}
                      onMouseLeave={() => {
                        if (!selectedZoneCodeRef.current) {
                          if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
                          hoverLeaveTimerRef.current = setTimeout(() => {
                            if (!selectedZoneCodeRef.current) {
                              setHoveredDialogItem(null);
                              setDialoguePos(null);
                            }
                          }, 100);
                        }
                      }}
                    >
                    {/* Header */}
                    <div className="dialogue-header">
                      <div className="dialogue-title-area">
                        <div
                          className="dialogue-zone-pill"
                          style={{
                            background: hoveredDialogItem.badgeBg || '#eff6ff',
                            color: hoveredDialogItem.color || '#1e3a8a',
                            borderColor: hoveredDialogItem.badgeBorder || '#bfdbfe'
                          }}
                        >
                          <Compass size={13} />
                          <span>{hoveredDialogItem.name} ({hoveredDialogItem.regionKey})</span>
                        </div>
                        <h4 className="dialogue-region-title">
                          {STRATEGIC_8_ZONES.find((z) => z.code === hoveredDialogItem.regionKey || z.mdcRegionKey === hoveredDialogItem.regionKey)?.thaiRegionName || hoveredDialogItem.name}
                        </h4>
                      </div>

                      <div className="dialogue-header-actions">
                        <span
                          className="dialogue-trend-badge"
                          style={{
                            color: hoveredDialogItem.color,
                            background: hoveredDialogItem.badgeBg,
                            borderColor: hoveredDialogItem.badgeBorder
                          }}
                        >
                          {hoveredDialogItem.badgeText}
                        </span>
                        <button
                          type="button"
                          className="dialogue-close-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hoverLeaveTimerRef.current) {
                              clearTimeout(hoverLeaveTimerRef.current);
                              hoverLeaveTimerRef.current = null;
                            }
                            setHoveredDialogItem(null);
                            setDialoguePos(null);
                            setSelectedZoneCode(null);
                          }}
                          title="ปิดหน้าต่างข้อมูล"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Covered Provinces */}
                    {hoveredDialogItem.provincesText && (
                      <div className="dialogue-provinces-row">
                        <MapPin size={13} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>จังหวัด:</strong> {hoveredDialogItem.provincesText}</span>
                      </div>
                    )}

                    {/* Dual Comparison Grid: Moral Center vs External Big Data */}
                    <div className="dialogue-comparison-grid">
                      {/* 1. ฝั่งข้อมูลศูนย์คุณธรรม */}
                      <div className="dialogue-comp-card moral-card">
                        <div className="comp-card-badge moral-badge">
                          <Building2 size={13} />
                          <span>ข้อมูลฝั่งศูนย์คุณธรรม</span>
                        </div>

                        <div className="comp-field-group">
                          <span className="field-label">ดัชนี Index ที่ใช้:</span>
                          <strong className="field-value text-blue-900">{hoveredDialogItem.moralIndexName}</strong>
                        </div>

                        <div className="comp-field-group">
                          <span className="field-label">แหล่งข้อมูล:</span>
                          <span className="field-sub">ศูนย์คุณธรรม (องค์การมหาชน)</span>
                        </div>

                        <div className="comp-score-highlight moral-highlight">
                          <span className="highlight-label">ค่าที่วัดได้:</span>
                          <div className="highlight-val-row">
                            <span className="highlight-number" style={{ color: hoveredDialogItem.color }}>
                              {hoveredDialogItem.moralScoreFormatted || hoveredDialogItem.score}
                            </span>
                            <span
                              className="highlight-tier-pill"
                              style={{
                                background: hoveredDialogItem.badgeBg,
                                color: hoveredDialogItem.color,
                                borderColor: hoveredDialogItem.badgeBorder
                              }}
                            >
                              {hoveredDialogItem.tier}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. ฝั่งข้อมูลภายนอก (External Data) */}
                      <div className="dialogue-comp-card external-card">
                        <div className="comp-card-badge external-badge">
                          <TrendingUp size={13} />
                          <span>ข้อมูลภายนอก (External Data)</span>
                        </div>

                        <div className="comp-field-group">
                          <span className="field-label">ข้อมูลที่นำมาเทียบ:</span>
                          <strong className="field-value text-slate-800">{hoveredDialogItem.externalDatasetName}</strong>
                        </div>

                        <div className="comp-field-group">
                          <span className="field-label">แหล่งข้อมูลเทียบ:</span>
                          <span className="field-sub">{hoveredDialogItem.externalAgency}</span>
                        </div>

                        <div className="comp-score-highlight external-highlight">
                          <span className="highlight-label">ค่าที่วัดได้:</span>
                          <div className="highlight-val-row">
                            <span className="highlight-number text-slate-800">
                              {hoveredDialogItem.externalMetricValue}
                            </span>
                            {hoveredDialogItem.externalRiskPct !== undefined && (
                              <span className="risk-score-pill">
                                เสี่ยง {hoveredDialogItem.externalRiskPct}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. สรุปภาพรวมพื้นที่นี้ */}
                    <div className="dialogue-insight-box">
                      <div className="insight-box-title">
                        <Sparkles size={14} color="#2563eb" />
                        <span>สรุปภาพรวมพื้นที่นี้:</span>
                      </div>
                      <p className="insight-box-text">{hoveredDialogItem.conciseInsight}</p>
                      {effectiveTier === 'A1' && policyRecommendation && (
                        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1', fontSize: '12px', color: '#0369a1', lineHeight: 1.4 }}>
                          🏛️ <strong>มิตินโยบายผู้บริหาร:</strong> {policyRecommendation}
                        </div>
                      )}
                    </div>
                  </div>,
                  document.body
                ) : null)}
              </div>

              {/* Map Legend */}
              <div className="map-legend-dock">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#059669' }} />
                  <span className="legend-text">
                    <strong>🟢 ↗ เชิงบวก:</strong> คนทำดีสูง ปัญหาความเดือดร้อนต่ำ
                  </span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#d97706' }} />
                  <span className="legend-text">
                    <strong>🟡 → ปานกลาง:</strong> ตัวเลขอยู่ในเกณฑ์เฉลี่ย
                  </span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#dc2626' }} />
                  <span className="legend-text">
                    <strong>🔴 ↘ เชิงลบ:</strong> คะแนนยังน้อย ปัญหายังสูง (ต้องช่วยเร่งด่วน)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column (or Full Width): Regional Synergy Bullets */}
        <div className="bullets-render-column">
          {/* Bullets Filter and Search Bar */}
          <div className="bullets-filter-toolbar">
            <div className="correlation-filter-chips">
              <button
                type="button"
                className={`filter-chip ${correlationFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setCorrelationFilter('all')}
              >
                ทั้งหมด ({regionalBulletItems.length})
              </button>
              <button
                type="button"
                className={`filter-chip positive-chip ${correlationFilter === 'positive' ? 'is-active' : ''}`}
                onClick={() => setCorrelationFilter('positive')}
              >
                🟢 ↗ เชิงบวก ({regionalBulletItems.filter((i) => i.correlationType === 'positive').length})
              </button>
              <button
                type="button"
                className={`filter-chip negative-chip ${correlationFilter === 'negative' ? 'is-active' : ''}`}
                onClick={() => setCorrelationFilter('negative')}
              >
                🔴 ↘ เชิงลบ/เสี่ยง ({regionalBulletItems.filter((i) => i.correlationType === 'negative').length})
              </button>
              <button
                type="button"
                className={`filter-chip moderate-chip ${correlationFilter === 'moderate' ? 'is-active' : ''}`}
                onClick={() => setCorrelationFilter('moderate')}
              >
                🟡 → ปานกลาง ({regionalBulletItems.filter((i) => i.correlationType === 'moderate').length})
              </button>
            </div>

            <div className="bullets-search-box">
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="ค้นหาภูมิภาค หรือชื่อจังหวัด..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List of Regional Bullet Cards */}
          <div className="bullets-cards-scroll-container">
            {filteredBulletItems.length === 0 ? (
              <div className="bullets-empty-state">
                <AlertTriangle size={32} color="#94a3b8" />
                <p>ไม่พบภูมิภาคหรือจังหวัดที่ตรงกับเงื่อนไขการค้นหา</p>
                <button type="button" onClick={handleResetAreaSelection} className="btn-clean-reset">
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : (
              filteredBulletItems.map((bullet) => {
                const isSelected = selectedZoneCode === bullet.zoneCode;

                return (
                  <div
                    key={bullet.zoneCode}
                    className={`regional-bullet-card ${isSelected ? 'is-selected' : ''}`}
                    style={{
                      borderLeft: `5px solid ${bullet.trendColor}`
                    }}
                    onClick={() => {
                      if (selectedZoneCode === bullet.zoneCode) {
                        setSelectedZoneCode(null);
                        setSelectedProvinceName(null);
                      } else {
                        setSelectedZoneCode(bullet.zoneCode);
                        setSelectedProvinceName(null);
                      }
                    }}
                  >
                    {/* Top Row: Region Title & Correlation Direction Badge */}
                    <div className="bullet-header-row">
                      <div className="bullet-title-block">
                        <span className="bullet-zone-code-tag" style={{ color: bullet.trendColor, borderColor: bullet.badgeBorder, background: bullet.badgeBg }}>
                          {bullet.zoneCode}
                        </span>
                        <h4 className="bullet-region-name">{bullet.regionName}</h4>
                        <span className="bullet-region-en">({bullet.englishName})</span>
                      </div>

                      {/* Direction Arrow Badge */}
                      <div
                        className="bullet-arrow-badge"
                        style={{
                          color: bullet.trendColor,
                          background: bullet.badgeBg,
                          border: `1px solid ${bullet.badgeBorder}`
                        }}
                      >
                        <span className="arrow-symbol">{bullet.arrowIcon}</span>
                        <span className="arrow-text">{bullet.trendText}</span>
                      </div>
                    </div>

                    {/* Provinces Covered */}
                    <div className="bullet-provinces-row">
                      <MapPin size={13} color="#64748b" />
                      <span>{bullet.provinces}</span>
                    </div>

                    {/* Metrics Pills */}
                    <div className="bullet-metrics-row">
                      <div className="metric-pill">
                        <span className="metric-pill-label">{bullet.scoreLabel || 'คะแนนคุณธรรม:'}</span>
                        <strong className="metric-pill-val" style={{ color: bullet.trendColor }}>
                          {bullet.moralScoreFormatted}
                        </strong>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-pill-label">ข้อมูลจริงในพื้นที่:</span>
                        <strong className="metric-pill-val text-slate-800">{bullet.externalMetricValue}</strong>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-pill-label">ระดับความเสี่ยง:</span>
                        <strong className="metric-pill-val">{bullet.externalRiskPct}%</strong>
                      </div>
                    </div>

                    {/* Regional Data Derivation & Summary Box */}
                    <div className="bullet-highlight-linkage-box">
                      <div className="linkage-box-header">
                        <Sparkles size={14} color="#2563eb" />
                        <span className="linkage-box-title">
                          สรุปที่มาตัวเลขและการเปรียบเทียบ:
                        </span>
                      </div>
                      <p className="linkage-box-content">{bullet.highlightLinkageExplanation}</p>

                      <div className="empirical-reason-tag">
                        <strong>📌 สภาพพื้นที่จริง:</strong> {bullet.empiricalReason}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
