import React, { useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import {
  ShieldCheck, TrendingUp, AlertTriangle, HeartHandshake, Award,
  Sparkles, Users, Radio, MapPin, Search, Layers, Filter, CheckCircle2, Sprout
} from 'lucide-react';
import { Thailand3dShadedMap } from '../components/Thailand3dShadedMap';
import { MoralViewHeader } from '../components/MoralViewHeader';
import { MoralHeroBannerCard } from '../components/MoralHeroBannerCard';
import { MoralSubmenuArchCards, type MoralSubmenuArchItem } from '../components/MoralSubmenuArchCards';
import { AiInsightBanner } from '../components/AiInsightBanner';
import { MoralSourceFooter } from '../components/MoralSourceFooter';
import {
  NATIONAL_5_DIMENSIONS,
  LIFE_CAPITAL_SCORE,
  RADAR_COMPARISON_DATA,
  MULTI_LINE_TREND_DATA,
  REGIONAL_HEATMAP_DATA,
  AI_SOCIAL_SIGNALS,
  LIFE_CAPITAL_4_PILLARS,
  LIFE_CAPITAL_RADAR_DATA,
  LIFE_CAPITAL_TREND_DATA,
  LIFE_CAPITAL_REGIONAL_DATA,
  LIFE_CAPITAL_SIGNALS,
  PROVINCES_77_DATA
} from '../data/moralAgencyDataCatalog';

const INTEGRATED_AGENCIES = [
  { name: 'ศูนย์คุณธรรม (องค์การมหาชน)', tag: 'ศคธ.' },
  { name: 'สำนักงานสถิติแห่งชาติ', tag: 'สถิติแห่งชาติ' },
  { name: 'กรมสุขภาพจิต กระทรวงสาธารณสุข', tag: 'กรมสุขภาพจิต' },
  { name: 'การประมวลผลกระแสสังคมออนไลน์', tag: 'NLP Social Buzz' }
];

// 6 Geographic Regions Mapping for all 77 provinces
const REGION_PROVINCE_IDS: Record<string, string[]> = {
  north: ['cmi', 'cri', 'msn', 'lpn', 'lpg', 'pyo', 'pre', 'nan', 'utd'],
  northeast: ['nma', 'brm', 'srn', 'ssk', 'ubn', 'yst', 'cpm', 'acr', 'bkn', 'nbp', 'kkn', 'udn', 'lei', 'nki', 'mkm', 'ret', 'ksn', 'snk', 'npm', 'mdh'],
  central: ['bkk', 'spk', 'nbi', 'pte', 'aya', 'atg', 'lri', 'sbr', 'cnt', 'sri', 'nyk', 'nsn', 'uti', 'kpt', 'sti', 'plk', 'pct', 'pnb', 'spb', 'npt', 'skn', 'skm'],
  east: ['cbi', 'ryg', 'cti', 'trt', 'cco', 'pri', 'skw'],
  west: ['tak', 'kri', 'rbr', 'pbi', 'pkn'],
  south: ['cpn', 'rng', 'sni', 'pna', 'pkt', 'kbi', 'nrt', 'trg', 'plg', 'stn', 'ska', 'ptn', 'yla', 'nwt']
};

const getRegionKeyByProvince = (id: string, name: string): string => {
  const cleanId = id.toLowerCase();
  for (const [rKey, ids] of Object.entries(REGION_PROVINCE_IDS)) {
    if (ids.includes(cleanId)) return rKey;
  }
  const p = PROVINCES_77_DATA.find(prov =>
    prov.id.toLowerCase() === cleanId ||
    prov.name === name ||
    name.includes(prov.name) ||
    prov.name.includes(name)
  );
  if (p) {
    for (const [rKey, ids] of Object.entries(REGION_PROVINCE_IDS)) {
      if (ids.includes(p.id.toLowerCase())) return rKey;
    }
  }
  return 'central';
};

const MORAL_6_REGIONS = [
  {
    key: 'northeast',
    name: 'ภาคตะวันออกเฉียงเหนือ',
    nameEn: 'Northeastern (Isan)',
    score: 80.1,
    grade: 'A',
    status: 'ดีเยี่ยม',
    color: '#1d4ed8',
    topDimension: 'กตัญญู 92.4',
    dims: { suff: 81.0, disc: 71.5, inte: 67.2, volu: 88.2, grat: 92.4 },
    provinceCount: 20,
    policyTip: 'ส่งเสริมการยกระดับมิติสุจริตเชิงระบบควบคู่กับการรักษาจุดแข็งด้านความกตัญญูและจิตอาสาในวิถีชุมชน'
  },
  {
    key: 'north',
    name: 'ภาคเหนือ',
    nameEn: 'Northern',
    score: 80.0,
    grade: 'A',
    status: 'ดีเยี่ยม',
    color: '#1d4ed8',
    topDimension: 'กตัญญู 91.0',
    dims: { suff: 78.2, disc: 74.1, inte: 70.4, volu: 86.5, grat: 91.0 },
    provinceCount: 9,
    policyTip: 'ต่อยอดเครือข่ายจิตอาสาภัยพิบัติและอัตลักษณ์ความเอื้ออาทร ขยายผลสู่การขับเคลื่อนเมืองคุณธรรมต้นแบบ'
  },
  {
    key: 'south',
    name: 'ภาคใต้',
    nameEn: 'Southern',
    score: 78.2,
    grade: 'B+',
    status: 'ดีมาก',
    color: '#3b82f6',
    topDimension: 'กตัญญู 89.8',
    dims: { suff: 76.1, disc: 71.8, inte: 68.4, volu: 85.0, grat: 89.8 },
    provinceCount: 14,
    policyTip: 'เน้นพลังความสมานฉันท์พหุวัฒนธรรมและสร้างการมีส่วนร่วมของเยาวชนในพื้นที่ชายแดนใต้'
  },
  {
    key: 'west',
    name: 'ภาคตะวันตก',
    nameEn: 'Western',
    score: 77.7,
    grade: 'B+',
    status: 'มาตรฐาน',
    color: '#60a5fa',
    topDimension: 'กตัญญู 88.9',
    dims: { suff: 75.9, disc: 72.4, inte: 68.0, volu: 83.1, grat: 88.9 },
    provinceCount: 5,
    policyTip: 'เพิ่มความเข้มข้นของมิติวินัยและการอนุรักษ์สิ่งแวดล้อมธรรมชาติในแนวชายแดนตะวันตก'
  },
  {
    key: 'east',
    name: 'ภาคตะวันออก',
    nameEn: 'Eastern',
    score: 76.9,
    grade: 'B+',
    status: 'มาตรฐาน',
    color: '#60a5fa',
    topDimension: 'กตัญญู 86.2',
    dims: { suff: 73.8, disc: 73.9, inte: 69.1, volu: 81.4, grat: 86.2 },
    provinceCount: 7,
    policyTip: 'หนุนเสริมธรรมภิบาลและวินัยความปลอดภัยในเขตอุตสาหกรรม EEC เชื่อมโยง CSR ภาคธุรกิจ'
  },
  {
    key: 'central',
    name: 'ภาคกลาง (รวม กทม.)',
    nameEn: 'Central (incl. BKK)',
    score: 76.8,
    grade: 'B+',
    status: 'มาตรฐาน',
    color: '#60a5fa',
    topDimension: 'กตัญญู 87.5',
    dims: { suff: 74.5, disc: 72.0, inte: 67.9, volu: 82.0, grat: 87.5 },
    provinceCount: 22,
    policyTip: 'เร่งฟื้นฟูมิติพอเพียงและสุจริตในกลุ่มประชากรเมืองหลวงและปริมณฑลผ่านสถานศึกษาและองค์กรดิจิทัล'
  }
];

const LIFE_6_REGIONS = [
  {
    key: 'northeast',
    name: 'ภาคตะวันออกเฉียงเหนือ',
    nameEn: 'Northeastern (Isan)',
    score: 72.1,
    grade: 'A',
    status: 'เข้มแข็ง',
    color: '#047857',
    topPillar: 'พลังชุมชนและสังคม 76.2',
    pillars: { wisdom: 71.8, family: 71.5, community: 76.2, media: 66.8 },
    provinceCount: 20,
    policyTip: 'จุดเด่นพลังชุมชนเข้มแข็ง เป็นเกราะคุ้มกันทางสังคมที่ดีเยี่ยม ควรเสริมทักษะรู้เท่าทันสื่อสร้างสรรค์'
  },
  {
    key: 'north',
    name: 'ภาคเหนือ',
    nameEn: 'Northern',
    score: 71.5,
    grade: 'A',
    status: 'เข้มแข็ง',
    color: '#047857',
    topPillar: 'พลังชุมชนและสังคม 74.8',
    pillars: { wisdom: 72.5, family: 70.2, community: 74.8, media: 67.5 },
    provinceCount: 9,
    policyTip: 'ความผูกพันในครอบครัวและชุมชนสูง นำภูมิปัญญาท้องถิ่นมาสร้างสื่อดิจิทัลเชิงบวกสำหรับคนรุ่นใหม่'
  },
  {
    key: 'south',
    name: 'ภาคใต้',
    nameEn: 'Southern',
    score: 70.8,
    grade: 'B+',
    status: 'ปานกลาง',
    color: '#10b981',
    topPillar: 'พลังชุมชนและสังคม 74.2',
    pillars: { wisdom: 71.5, family: 70.0, community: 74.2, media: 66.7 },
    provinceCount: 14,
    policyTip: 'พลังกลุ่มและเครือข่ายผู้นำศาสนา/ชุมชนเข้มแข็ง ขยายบทบาทพื้นที่สร้างสรรค์สำหรับเด็กและเยาวชน'
  },
  {
    key: 'west',
    name: 'ภาคตะวันตก',
    nameEn: 'Western',
    score: 70.2,
    grade: 'B+',
    status: 'ปานกลาง',
    color: '#10b981',
    topPillar: 'พลังชุมชนและสังคม 73.5',
    pillars: { wisdom: 70.8, family: 69.5, community: 73.5, media: 66.0 },
    provinceCount: 5,
    policyTip: 'โครงสร้างครอบครัวมีความมั่นคงปานกลาง เสริมพลังปัญญาและพื้นที่เรียนรู้นอกห้องเรียน'
  },
  {
    key: 'east',
    name: 'ภาคตะวันออก',
    nameEn: 'Eastern',
    score: 69.0,
    grade: 'B+',
    status: 'ปานกลาง',
    color: '#34d399',
    topPillar: 'พลังชุมชนและสังคม 72.0',
    pillars: { wisdom: 71.0, family: 66.8, community: 72.0, media: 66.2 },
    provinceCount: 7,
    policyTip: 'ครอบครัวในเขตนิคมฯ เผชิญภาวะเร่งรีบ ต้องจัดสรรสวัสดิการชุมชนและเวลาคุณภาพในครอบครัว'
  },
  {
    key: 'central',
    name: 'ภาคกลาง (รวม กทม.)',
    nameEn: 'Central (incl. BKK)',
    score: 68.4,
    grade: 'B+',
    status: 'ปานกลาง',
    color: '#34d399',
    topPillar: 'พลังปัญญา 71.5',
    pillars: { wisdom: 71.5, family: 65.5, community: 70.0, media: 65.2 },
    provinceCount: 22,
    policyTip: 'มีพลังปัญญาสูงแต่พลังครอบครัวเปราะบางที่สุด ต้องฟื้นฟูศูนย์พัฒนาครอบครัวและพื้นที่สาธารณะปลอดภัย'
  }
];

// Moral Dimensions Definitions
export type MoralDimensionKey = 'overall' | 'suff' | 'disc' | 'inte' | 'volu' | 'grat';

export const MORAL_DIMENSION_TABS: { key: MoralDimensionKey; name: string; shortName: string; description: string }[] = [
  { key: 'overall', name: 'ภาพรวม 5 มิติ', shortName: 'ภาพรวม', description: 'คะแนนเฉลี่ยบูรณาการคุณธรรม 5 มิติ' },
  { key: 'suff', name: 'พอเพียง', shortName: 'พอเพียง', description: 'ความพอประมาณ มีเหตุผล มีภูมิคุ้มกัน' },
  { key: 'disc', name: 'วินัย', shortName: 'วินัย', description: 'ความเคารพกฎหมาย กติกา และความรับผิดชอบ' },
  { key: 'inte', name: 'สุจริต', shortName: 'สุจริต', description: 'ความซื่อสัตย์ โปร่งใส ปราศจากการทุจริต' },
  { key: 'volu', name: 'จิตอาสา', shortName: 'จิตอาสา', description: 'การบำเพ็ญประโยชน์และความเสียสละเพื่อส่วนรวม' },
  { key: 'grat', name: 'กตัญญู', shortName: 'กตัญญู', description: 'ความกตัญญูรู้คุณต่อบุพการี องค์กร และแผ่นดิน' }
];

// Life Capital 4 Pillars Definitions
export type LifePillarKey = 'overall' | 'wisdom' | 'family' | 'community' | 'media';

export const LIFE_PILLAR_TABS: { key: LifePillarKey; name: string; shortName: string; description: string }[] = [
  { key: 'overall', name: 'ภาพรวมทุนชีวิต', shortName: 'ภาพรวม', description: 'คะแนนเฉลี่ย 4 พลังทุนชีวิตระดับพื้นที่' },
  { key: 'wisdom', name: 'พลังปัญญา', shortName: 'ปัญญา', description: 'ทักษะคิดวิเคราะห์ คุณธรรม และการตัดสินใจ' },
  { key: 'family', name: 'พลังครอบครัว', shortName: 'ครอบครัว', description: 'ความอบอุ่น ความเข้าใจ และเกราะคุ้มกันในบ้าน' },
  { key: 'community', name: 'พลังชุมชนและสังคม', shortName: 'ชุมชน/สังคม', description: 'ความเอื้ออาทรและความเข้มแข็งของเครือข่าย' },
  { key: 'media', name: 'พลังสร้างสรรค์และสื่อ', shortName: 'สื่อสร้างสรรค์', description: 'ภูมิคุ้มกันดิจิทัลและการเปิดรับสื่อเชิงบวก' }
];

export interface ProvinceLifeData {
  id: string;
  name: string;
  enName?: string;
  region: string;
  overallScore: number;
  wisdomScore: number;
  familyScore: number;
  communityScore: number;
  mediaScore: number;
}

// Generate deterministic Life Capital scores for all 77 provinces based on region & moral data
export const PROVINCES_77_LIFE_DATA: ProvinceLifeData[] = PROVINCES_77_DATA.map(p => {
  const rKey = getRegionKeyByProvince(p.id, p.name);
  const regLife = LIFE_6_REGIONS.find(r => r.key === rKey) || LIFE_6_REGIONS[0];
  
  let hash = 0;
  for (let i = 0; i < p.id.length; i++) hash = (hash * 31 + p.id.charCodeAt(i)) % 100;
  const delta = ((hash % 17) - 8) * 0.18;

  const wisdom = +Math.min(95, Math.max(60, regLife.pillars.wisdom + delta + (p.suffScore - 80) * 0.1)).toFixed(1);
  const family = +Math.min(95, Math.max(60, regLife.pillars.family + delta * 0.8 + (p.gratScore - 85) * 0.1)).toFixed(1);
  const community = +Math.min(95, Math.max(60, regLife.pillars.community + delta * 0.9 + (p.voluScore - 83) * 0.1)).toFixed(1);
  const media = +Math.min(95, Math.max(60, regLife.pillars.media + delta * 0.7 + (p.inteScore - 72) * 0.1)).toFixed(1);
  const overall = +((wisdom * 0.25 + family * 0.25 + community * 0.25 + media * 0.25)).toFixed(1);

  return {
    id: p.id,
    name: p.name,
    enName: p.enName,
    region: p.region,
    overallScore: overall,
    wisdomScore: wisdom,
    familyScore: family,
    communityScore: community,
    mediaScore: media
  };
});

const getMoralRegionScore = (reg: typeof MORAL_6_REGIONS[0], dim: MoralDimensionKey): number => {
  if (dim === 'overall') return reg.score;
  return reg.dims[dim];
};

const getMoralProvScore = (p: typeof PROVINCES_77_DATA[0], dim: MoralDimensionKey): number => {
  switch (dim) {
    case 'suff': return p.suffScore;
    case 'disc': return p.discScore;
    case 'inte': return p.inteScore;
    case 'volu': return p.voluScore;
    case 'grat': return p.gratScore;
    case 'overall':
    default:
      return p.overallScore;
  }
};

const getLifeRegionScore = (reg: typeof LIFE_6_REGIONS[0], dim: LifePillarKey): number => {
  if (dim === 'overall') return reg.score;
  return reg.pillars[dim];
};

const getLifeProvScore = (p: ProvinceLifeData, dim: LifePillarKey): number => {
  switch (dim) {
    case 'wisdom': return p.wisdomScore;
    case 'family': return p.familyScore;
    case 'community': return p.communityScore;
    case 'media': return p.mediaScore;
    case 'overall':
    default:
      return p.overallScore;
  }
};

export const PolicyNationalIndexView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'moral' | 'life'>('moral');

  // Moral View States
  const [moralViewLevel, setMoralViewLevel] = useState<'region' | 'province'>('region');
  const [selectedMoralDim, setSelectedMoralDim] = useState<MoralDimensionKey>('overall');
  const [selectedMoralRegionKey, setSelectedMoralRegionKey] = useState<string>('north');
  const [hoveredMoralRegionKey, setHoveredMoralRegionKey] = useState<string | null>(null);
  const [selectedMoralProvId, setSelectedMoralProvId] = useState<string>('bkk');
  const [hoveredMoralProvId, setHoveredMoralProvId] = useState<string | null>(null);
  const [hoveredMoralProvName, setHoveredMoralProvName] = useState<string | null>(null);
  const [moralProvSearch, setMoralProvSearch] = useState<string>('');
  const [moralProvRegionFilter, setMoralProvRegionFilter] = useState<string>('all');

  // Life Capital View States
  const [lifeViewLevel, setLifeViewLevel] = useState<'region' | 'province'>('region');
  const [selectedLifeDim, setSelectedLifeDim] = useState<LifePillarKey>('overall');
  const [selectedLifeRegionKey, setSelectedLifeRegionKey] = useState<string>('north');
  const [hoveredLifeRegionKey, setHoveredLifeRegionKey] = useState<string | null>(null);
  const [selectedLifeProvId, setSelectedLifeProvId] = useState<string>('bkk');
  const [hoveredLifeProvId, setHoveredLifeProvId] = useState<string | null>(null);
  const [hoveredLifeProvName, setHoveredLifeProvName] = useState<string | null>(null);
  const [lifeProvSearch, setLifeProvSearch] = useState<string>('');
  const [lifeProvRegionFilter, setLifeProvRegionFilter] = useState<string>('all');

  // Active region models
  const activeMoralRegion =
    MORAL_6_REGIONS.find(r => r.key === (hoveredMoralRegionKey || selectedMoralRegionKey)) ||
    MORAL_6_REGIONS[0];
  const selectedMoralRegion =
    MORAL_6_REGIONS.find(r => r.key === selectedMoralRegionKey) || MORAL_6_REGIONS[0];

  const activeLifeRegion =
    LIFE_6_REGIONS.find(r => r.key === (hoveredLifeRegionKey || selectedLifeRegionKey)) ||
    LIFE_6_REGIONS[0];
  const selectedLifeRegion =
    LIFE_6_REGIONS.find(r => r.key === selectedLifeRegionKey) || LIFE_6_REGIONS[0];

  const selectedMoralProv =
    PROVINCES_77_DATA.find(p => p.id.toLowerCase() === selectedMoralProvId.toLowerCase()) ||
    PROVINCES_77_DATA[0];

  const hoveredMoralProv = hoveredMoralProvId
    ? PROVINCES_77_DATA.find(p => p.id.toLowerCase() === hoveredMoralProvId.toLowerCase() || p.name === hoveredMoralProvName)
    : null;

  const selectedLifeProv =
    PROVINCES_77_LIFE_DATA.find(p => p.id.toLowerCase() === selectedLifeProvId.toLowerCase()) ||
    PROVINCES_77_LIFE_DATA[0];

  const hoveredLifeProv = hoveredLifeProvId
    ? PROVINCES_77_LIFE_DATA.find(p => p.id.toLowerCase() === hoveredLifeProvId.toLowerCase() || p.name === hoveredLifeProvName)
    : null;

  const currentMoralDimMeta =
    MORAL_DIMENSION_TABS.find(t => t.key === selectedMoralDim) || MORAL_DIMENSION_TABS[0];
  const currentLifeDimMeta =
    LIFE_PILLAR_TABS.find(t => t.key === selectedLifeDim) || LIFE_PILLAR_TABS[0];

  // Filtered & Sorted Provinces for Moral
  const filteredMoralProvinces = [...PROVINCES_77_DATA]
    .filter(p => {
      const matchSearch = p.name.includes(moralProvSearch) || (p.enName && p.enName.toLowerCase().includes(moralProvSearch.toLowerCase()));
      const matchRegion = moralProvRegionFilter === 'all' || p.region === moralProvRegionFilter;
      return matchSearch && matchRegion;
    })
    .sort((a, b) => getMoralProvScore(b, selectedMoralDim) - getMoralProvScore(a, selectedMoralDim));

  // Filtered & Sorted Provinces for Life Capital
  const filteredLifeProvinces = [...PROVINCES_77_LIFE_DATA]
    .filter(p => {
      const matchSearch = p.name.includes(lifeProvSearch) || (p.enName && p.enName.toLowerCase().includes(lifeProvSearch.toLowerCase()));
      const matchRegion = lifeProvRegionFilter === 'all' || p.region === lifeProvRegionFilter;
      return matchSearch && matchRegion;
    })
    .sort((a, b) => getLifeProvScore(b, selectedLifeDim) - getLifeProvScore(a, selectedLifeDim));

  // Helper for map province coloring in Moral Index
  const getProvinceMoralFill = (id: string, name: string): string => {
    if (id === 'lksg') return '#93c5fd';

    if (moralViewLevel === 'region') {
      const rKey = getRegionKeyByProvince(id, name);
      const isHovered = hoveredMoralRegionKey === rKey;
      const isSelected = selectedMoralRegionKey === rKey;
      if (isHovered || isSelected) return '#f59e0b'; // Amber highlight

      const reg = MORAL_6_REGIONS.find(r => r.key === rKey);
      if (!reg) return '#60a5fa';
      const score = getMoralRegionScore(reg, selectedMoralDim);
      if (score >= 80.0) return '#1d4ed8'; // ดีเยี่ยม
      if (score >= 78.0) return '#2563eb'; // ดีมาก
      if (score >= 76.5) return '#60a5fa'; // มาตรฐาน
      return '#93c5fd';
    } else {
      // Province level
      const isHovered = hoveredMoralProvId?.toLowerCase() === id.toLowerCase() || (hoveredMoralProvName && (name.includes(hoveredMoralProvName) || hoveredMoralProvName.includes(name)));
      const isSelected = selectedMoralProvId?.toLowerCase() === id.toLowerCase();
      if (isHovered || isSelected) return '#f59e0b'; // Amber highlight

      const prov = PROVINCES_77_DATA.find(p => p.id.toLowerCase() === id.toLowerCase() || p.name === name || name.includes(p.name));
      if (!prov) return '#93c5fd';
      const score = getMoralProvScore(prov, selectedMoralDim);
      if (score >= 82.0) return '#1e40af';
      if (score >= 80.0) return '#1d4ed8';
      if (score >= 78.0) return '#2563eb';
      if (score >= 76.0) return '#60a5fa';
      return '#93c5fd';
    }
  };

  // Helper for map province coloring in Life Capital
  const getProvinceLifeFill = (id: string, name: string): string => {
    if (id === 'lksg') return '#93c5fd';

    if (lifeViewLevel === 'region') {
      const rKey = getRegionKeyByProvince(id, name);
      const isHovered = hoveredLifeRegionKey === rKey;
      const isSelected = selectedLifeRegionKey === rKey;
      if (isHovered || isSelected) return '#f59e0b'; // Amber highlight

      const reg = LIFE_6_REGIONS.find(r => r.key === rKey);
      if (!reg) return '#10b981';
      const score = getLifeRegionScore(reg, selectedLifeDim);
      if (score >= 72.0) return '#047857'; // เข้มแข็งมาก
      if (score >= 70.0) return '#059669'; // เข้มแข็ง
      if (score >= 68.0) return '#10b981'; // ปานกลาง
      return '#34d399';
    } else {
      // Province level
      const isHovered = hoveredLifeProvId?.toLowerCase() === id.toLowerCase() || (hoveredLifeProvName && (name.includes(hoveredLifeProvName) || hoveredLifeProvName.includes(name)));
      const isSelected = selectedLifeProvId?.toLowerCase() === id.toLowerCase();
      if (isHovered || isSelected) return '#f59e0b'; // Amber highlight

      const prov = PROVINCES_77_LIFE_DATA.find(p => p.id.toLowerCase() === id.toLowerCase() || p.name === name || name.includes(p.name));
      if (!prov) return '#34d399';
      const score = getLifeProvScore(prov, selectedLifeDim);
      if (score >= 73.0) return '#065f46';
      if (score >= 71.0) return '#047857';
      if (score >= 69.0) return '#059669';
      if (score >= 67.0) return '#10b981';
      return '#34d399';
    }
  };


  const NATIONAL_VIEW_CARDS: MoralSubmenuArchItem[] = [
    {
      id: 'moral',
      label: 'ดัชนีคุณธรรม 5 มิติ',
      subLabel: 'วิเคราะห์ระดับบูรณาการ 77 จังหวัด',
      bgImg: '/theme/card_bg_overview.svg',
      badgeIcon: <ShieldCheck size={18} color="#ffffff" />,
      badgeBg: 'linear-gradient(135deg, #0284c7, #2563eb)'
    },
    {
      id: 'life',
      label: 'ทุนชีวิต 4 พลัง',
      subLabel: 'ระบบนิเวศสุขภาวะและเกราะคุ้มกัน',
      bgImg: '/theme/card_bg_family.svg',
      badgeIcon: <Sparkles size={18} color="#ffffff" />,
      badgeBg: 'linear-gradient(135deg, #7c3aed, #4f46e5)'
    }
  ];

  const NATIONAL_MORAL_DIM_ARCH_CARDS: MoralSubmenuArchItem[] = [
    {
      id: 'overall',
      label: 'ภาพรวม 5 มิติ',
      subLabel: 'ดัชนีคุณธรรมรวม',
      bgImg: '/theme/card_bg_overview.svg',
      badgeIcon: <Award size={16} color="#fff" />,
      badgeBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    },
    {
      id: 'grat',
      label: 'กตัญญู',
      subLabel: 'สายใยครอบครัว',
      bgImg: '/theme/card_bg_gratitude.svg',
      badgeIcon: <Award size={16} color="#fff" />,
      badgeBg: 'linear-gradient(135deg, #f43f5e, #e11d48)'
    },
    {
      id: 'volu',
      label: 'จิตอาสา',
      subLabel: 'การเกื้อกูลสังคม',
      bgImg: '/theme/card_bg_public.svg',
      badgeIcon: <HeartHandshake size={16} color="#fff" />,
      badgeBg: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    },
    {
      id: 'disc',
      label: 'วินัย',
      subLabel: 'ความรับผิดชอบ',
      bgImg: '/theme/card_bg_responsibility.svg',
      badgeIcon: <ShieldCheck size={16} color="#fff" />,
      badgeBg: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      id: 'inte',
      label: 'สุจริต',
      subLabel: 'ความซื่อตรง โปร่งใส',
      bgImg: '/theme/card_bg_honesty.svg',
      badgeIcon: <Sparkles size={16} color="#fff" />,
      badgeBg: 'linear-gradient(135deg, #38bdf8, #0284c7)'
    },
    {
      id: 'suff',
      label: 'พอเพียง',
      subLabel: 'ภูมิคุ้มกันชีวิต',
      bgImg: '/theme/card_bg_sufficiency.svg',
      badgeIcon: <Sprout size={16} color="#fff" />,
      badgeBg: 'linear-gradient(135deg, #10b981, #059669)'
    }
  ];

  const NATIONAL_LIFE_DIM_ARCH_CARDS: MoralSubmenuArchItem[] = [
    {
      id: 'overall',
      label: 'ภาพรวม 4 พลัง',
      subLabel: 'ทุนชีวิตระดับชาติ',
      bgImg: '/theme/card_bg_overview.svg',
      badgeIcon: <Award size={16} color="#fff" />,
      badgeBg: 'linear-gradient(135deg, #7c3aed, #4f46e5)'
    },
    {
      id: 'family',
      label: 'พลังครอบครัว',
      subLabel: 'ความอบอุ่นสายใย',
      bgImg: '/theme/card_bg_family.svg',
      badgeIcon: <Award size={16} color="#fff" />,
      badgeBg: 'linear-gradient(135deg, #f43f5e, #e11d48)'
    },
    {
      id: 'wisdom',
      label: 'พลังปัญญา',
      subLabel: 'การคิดวิเคราะห์',
      bgImg: '/theme/card_bg_talent.svg',
      badgeIcon: <Sparkles size={16} color="#fff" />,
      badgeBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
    },
    {
      id: 'community',
      label: 'พลังชุมชน',
      subLabel: 'การมีส่วนร่วม',
      bgImg: '/theme/card_bg_community.svg',
      badgeIcon: <Users size={16} color="#fff" />,
      badgeBg: 'linear-gradient(135deg, #0284c7, #0369a1)'
    },
    {
      id: 'media',
      label: 'สื่อสร้างสรรค์',
      subLabel: 'ภูมิคุ้มกันดิจิทัล',
      bgImg: '/theme/card_bg_realtime.svg',
      badgeIcon: <Radio size={16} color="#fff" />,
      badgeBg: 'linear-gradient(135deg, #059669, #047857)'
    }
  ];

  return (
    <div className="moral-view-container">
      {/* 1. Master Style Large Hero Header Card */}
      <MoralHeroBannerCard
        title={
          <>
            จังหวัดคุณ<span className="moral-title-accent">ธรรม</span> (77 จังหวัด)
          </>
        }
        subtitle={
          activeTab === 'moral'
            ? 'วิเคราะห์ระดับบูรณาการคุณธรรม 5 มิติ รายภูมิภาคและรายจังหวัด พร้อมแบบจำลองพยากรณ์ทางสังคม 77 จังหวัดทั่วประเทศ'
            : 'วิเคราะห์ระบบนิเวศและ 4 พลังทุนชีวิต (ปัญญา, ครอบครัว, ชุมชน, สื่อสร้างสรรค์) เชื่อมโยงมิติสุขภาวะและเกราะคุ้มกันทางสังคม'
        }
      />

      {/* 2. Master Style Arch Cards Submenu */}
      <MoralSubmenuArchCards
        items={NATIONAL_VIEW_CARDS}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id as 'moral' | 'life')}
        columns={2}
      />

      {/* =========================================================
          TAB 1: ดัชนีคุณธรรม (Moral Index View)
          ========================================================= */}
      {activeTab === 'moral' && (
        <>
          {/* 1. Summary Metric Cards: 5 Dimensions + Overall */}
          <section className="moral-section">
            <h3 className="moral-section-title">
              <ShieldCheck size={18} color="#2563eb" />
              <span>ดัชนีคุณธรรม 5 มิติ และภาพรวมประเทศ (ปี 2568)</span>
            </h3>

            <div className="moral-kpi-row-5">
              {/* Overall Moral Index Card */}
              <div className="moral-kpi-card-rich moral-kpi-highlight-blue">
                <div className="moral-kpi-card-top-row">
                  <span className="moral-kpi-badge-dim" style={{ backgroundColor: '#2563eb18', color: '#2563eb' }}>
                    Overall Index
                  </span>
                  <span className="moral-yoy-tag up">▲ +1.8%</span>
                </div>
                <div className="moral-kpi-title-text">ภาพรวมดัชนีคุณธรรม</div>
                <div className="moral-kpi-value-row">
                  <span className="moral-kpi-big-value" style={{ color: '#2563eb' }}>76.4</span>
                  <span className="moral-kpi-max-value">/ 100</span>
                </div>
                <div className="moral-progress-track">
                  <div className="moral-progress-fill" style={{ width: '76.4%', backgroundColor: '#2563eb' }} />
                </div>
                <p className="moral-kpi-desc-text">คะแนนเฉลี่ยถ่วงน้ำหนัก 5 มิติคุณธรรมระดับประเทศ</p>
              </div>

              {/* 5 Individual Dimensions Cards */}
              {NATIONAL_5_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="moral-kpi-card-rich">
                  <div className="moral-kpi-card-top-row">
                    <span className="moral-kpi-badge-dim" style={{ backgroundColor: `${dim.color}15`, color: dim.color }}>
                      {dim.nameEn}
                    </span>
                    <span className={`moral-yoy-tag ${dim.yoy >= 0 ? 'up' : 'down'}`}>
                      {dim.yoy >= 0 ? `▲ +${dim.yoy}%` : `▼ ${dim.yoy}%`}
                    </span>
                  </div>
                  <div className="moral-kpi-title-text">{dim.name}</div>
                  <div className="moral-kpi-value-row">
                    <span className="moral-kpi-big-value" style={{ color: dim.color }}>{dim.score}</span>
                    <span className="moral-kpi-max-value">/ 100</span>
                  </div>
                  <div className="moral-progress-track">
                    <div className="moral-progress-fill" style={{ width: `${dim.score}%`, backgroundColor: dim.color }} />
                  </div>
                  <p className="moral-kpi-desc-text">{dim.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Radar Chart + Multi-line Trend Chart Side-by-Side */}
          <div className="moral-grid-2cols">
            {/* Radar Chart (ใยแมงมุม 5 แกน) */}
            <div className="moral-card-panel">
              <div className="moral-card-panel-header">
                <div className="moral-card-panel-title-wrap">
                  <Award size={18} color="#2563eb" />
                  <div>
                    <h4 className="moral-card-panel-title">Radar Chart: เปรียบเทียบคุณธรรม 5 ด้าน</h4>
                    <p className="moral-card-panel-sub">เปรียบเทียบการเปลี่ยนแปลงรายปี (ปี 2567 vs 2568)</p>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={RADAR_COMPARISON_DATA}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-thai)' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar name="ปี 2567" dataKey="year2567" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.25} />
                    <Radar name="ปี 2568" dataKey="year2568" stroke="#2563eb" fill="#2563eb" fillOpacity={0.5} />
                    <Legend wrapperStyle={{ fontFamily: 'var(--font-thai)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Multi-line Trend Chart: 2565 to 2569 Forecast */}
            <div className="moral-card-panel">
              <div className="moral-card-panel-header">
                <div className="moral-card-panel-title-wrap">
                  <TrendingUp size={18} color="#10b981" />
                  <div>
                    <h4 className="moral-card-panel-title">Multi-line Trend: แนวโน้ม 5 มิติคุณธรรม</h4>
                    <p className="moral-card-panel-sub">ข้อมูลจริงปี 2565–2568 และเส้นประพยากรณ์ AI ปี 2569 (F)</p>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MULTI_LINE_TREND_DATA} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={11} tick={{ fontFamily: 'var(--font-thai)' }} />
                    <YAxis domain={[55, 100]} stroke="#64748b" fontSize={11} ticks={[60, 70, 80, 90, 100]} tick={{ fontFamily: 'var(--font-thai)' }} />
                    <RechartsTooltip contentStyle={{ fontFamily: 'var(--font-thai)' }} />
                    <Legend wrapperStyle={{ fontFamily: 'var(--font-thai)' }} />
                    <Line type="monotone" dataKey="กตัญญู" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="จิตอาสา" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="พอเพียง" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="วินัย" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="สุจริต" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* แผนที่คะแนนดัชนีคุณธรรม 6 ภูมิภาค / 77 จังหวัด (Moral Index Map) */}
          <section className="moral-section">
            <h3 className="moral-section-title">
              <MapPin size={18} color="#2563eb" />
              <span>
                {moralViewLevel === 'region'
                  ? 'แผนที่คะแนนดัชนีคุณธรรม 6 ภูมิภาค (Regional Moral Index Map)'
                  : 'แผนที่คะแนนดัชนีคุณธรรม 77 จังหวัด (Provincial Moral Index Map)'}
              </span>
            </h3>

            {/* Top Control Header: Level Switch + Dimension Tabs */}
            <div className="moral-map-control-header">
              <div className="moral-map-control-row">
                <div className="moral-map-control-group">
                  <span className="moral-map-control-label">
                    <Layers size={15} color="#2563eb" /> ระดับพื้นที่:
                  </span>
                  <div className="moral-map-level-switch">
                    <button
                      type="button"
                      className={`moral-map-level-btn ${moralViewLevel === 'region' ? 'active moral' : ''}`}
                      onClick={() => setMoralViewLevel('region')}
                    >
                      <MapPin size={13} /> แบบภูมิภาค (6 ภูมิภาค)
                    </button>
                    <button
                      type="button"
                      className={`moral-map-level-btn ${moralViewLevel === 'province' ? 'active moral' : ''}`}
                      onClick={() => setMoralViewLevel('province')}
                    >
                      <Sparkles size={13} /> แบบจังหวัด (77 จังหวัด)
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                  มิติที่เลือก: <strong style={{ color: '#1d4ed8' }}>{currentMoralDimMeta.name}</strong> ({currentMoralDimMeta.description})
                </div>
              </div>

              {/* Dimension Filter Tabs */}
              <div className="moral-map-control-row" style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    <Filter size={14} color="#64748b" /> เลือกมิติดัชนีคุณธรรมเพื่อวิเคราะห์เชิงพื้นที่:
                  </div>
                  <MoralSubmenuArchCards
                    items={NATIONAL_MORAL_DIM_ARCH_CARDS}
                    activeId={selectedMoralDim}
                    onSelect={(id) => setSelectedMoralDim(id as any)}
                    columns={6}
                  />
                </div>
              </div>
            </div>

            <div className="moral-card-panel" style={{ minHeight: '940px' }}>
              <div className="moral-regional-map-grid" style={{ alignItems: 'stretch' }}>
                {/* Left: 3D Thailand Shaded Map */}
                <div style={{ height: '912px', minHeight: '912px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    {moralViewLevel === 'region'
                      ? `คลิกหรือชี้เมาส์ที่ภูมิภาคเพื่อดูคะแนน${currentMoralDimMeta.shortName} (สีเข้ม = คะแนนสูง)`
                      : `คลิกหรือชี้เมาส์ที่จังหวัดเพื่อดูคะแนน${currentMoralDimMeta.shortName}รายพื้นที่ (สีเข้ม = คะแนนสูง)`}
                  </div>
                  <div className="moral-map-container" style={{ flex: 1, position: 'relative', minHeight: '840px', height: '840px' }}>
                    <Thailand3dShadedMap
                      height="810px"
                      scale={1.12}
                      translateY="15%"
                      getProvinceFill={(id, name) => getProvinceMoralFill(id, name)}
                      onProvinceMouseEnter={(loc) => {
                        if (moralViewLevel === 'region') {
                          const rKey = getRegionKeyByProvince(loc.id, loc.name);
                          setHoveredMoralRegionKey(rKey);
                        } else {
                          setHoveredMoralProvId(loc.id);
                          setHoveredMoralProvName(loc.name);
                        }
                      }}
                      onProvinceMouseLeave={() => {
                        if (moralViewLevel === 'region') {
                          setHoveredMoralRegionKey(null);
                        } else {
                          setHoveredMoralProvId(null);
                          setHoveredMoralProvName(null);
                        }
                      }}
                      onProvinceClick={(loc) => {
                        if (moralViewLevel === 'region') {
                          const rKey = getRegionKeyByProvince(loc.id, loc.name);
                          setSelectedMoralRegionKey(rKey);
                        } else {
                          const prov = PROVINCES_77_DATA.find(
                            p => p.id.toLowerCase() === loc.id.toLowerCase() || p.name === loc.name || loc.name.includes(p.name)
                          );
                          if (prov) setSelectedMoralProvId(prov.id);
                        }
                      }}
                    >
                      {/* Map Legend */}
                      <div className="moral-map-overlay-legend">
                        {moralViewLevel === 'region' ? (
                          <>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#1d4ed8' }} /> &ge; 80.0 (ดีเยี่ยม)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#2563eb' }} /> 78.0 – 79.9 (ดีมาก)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#60a5fa' }} /> 76.5 – 77.9 (มาตรฐาน)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#f59e0b' }} /> ภูมิภาคที่เลือก
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#1e40af' }} /> &ge; 82.0 (คะแนนสูงมาก)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#1d4ed8' }} /> 80.0 – 81.9 (ดีเยี่ยม)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#2563eb' }} /> 78.0 – 79.9 (ดีมาก)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#60a5fa' }} /> 76.0 – 77.9 (มาตรฐาน)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#f59e0b' }} /> จังหวัดที่เลือก
                            </div>
                          </>
                        )}
                      </div>

                      {/* Hover/Active Floating Badge */}
                      {moralViewLevel === 'region' && activeMoralRegion && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(6px)',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          pointerEvents: 'none',
                          zIndex: 20
                        }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                            {activeMoralRegion.name} ({activeMoralRegion.provinceCount} จังหวัด)
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            คะแนน{currentMoralDimMeta.shortName}: <strong style={{ color: '#1d4ed8' }}>{getMoralRegionScore(activeMoralRegion, selectedMoralDim)}</strong> / 100 ({activeMoralRegion.grade})
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#15803d', marginTop: '2px' }}>
                            จุดเด่น: {activeMoralRegion.topDimension}
                          </div>
                        </div>
                      )}

                      {moralViewLevel === 'province' && (hoveredMoralProv || selectedMoralProv) && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255, 255, 255, 0.96)',
                          backdropFilter: 'blur(6px)',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '8px 14px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          pointerEvents: 'none',
                          zIndex: 20
                        }}>
                          {(() => {
                            const target = hoveredMoralProv || selectedMoralProv;
                            const score = getMoralProvScore(target, selectedMoralDim);
                            return (
                              <>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                                  {target.name} {target.enName ? `(${target.enName})` : ''}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  ภาค: <span style={{ fontWeight: 600, color: '#1e293b' }}>{target.region}</span> | สถานะ:{' '}
                                  <span style={{ fontWeight: 700, color: '#1d4ed8' }}>
                                    {target.status === 'pilot' ? 'นำร่อง' : target.status === 'moral-city' ? 'เมืองคุณธรรม' : 'ทั่วไป'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#0f172a', marginTop: '2px' }}>
                                  คะแนน{currentMoralDimMeta.shortName}: <strong style={{ color: '#1d4ed8' }}>{score}</strong> / 100
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </Thailand3dShadedMap>
                  </div>
                </div>

                {/* Right: Regional Cards OR Provincial Explorer */}
                {moralViewLevel === 'region' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
                    <div className="moral-regional-cards-grid">
                      {MORAL_6_REGIONS.map((reg) => {
                        const isSelected = selectedMoralRegionKey === reg.key;
                        const score = getMoralRegionScore(reg, selectedMoralDim);
                        return (
                          <div
                            key={reg.key}
                            className={`moral-regional-mini-card ${isSelected ? 'active-moral' : ''}`}
                            onClick={() => setSelectedMoralRegionKey(reg.key)}
                            onMouseEnter={() => setHoveredMoralRegionKey(reg.key)}
                            onMouseLeave={() => setHoveredMoralRegionKey(null)}
                          >
                            <div className="moral-regional-mini-card-header">
                              <span className="moral-regional-mini-card-name">{reg.name}</span>
                              <span className="moral-regional-prov-count">{reg.provinceCount} จว.</span>
                            </div>
                            <div className="moral-regional-mini-card-score-row">
                              <div>
                                <span className="moral-regional-mini-card-score">{score}</span>
                                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '3px' }}>/ 100</span>
                              </div>
                              <span className={`moral-grade-pill ${reg.grade === 'A' ? 'grade-a' : 'grade-b'}`}>
                                เกรด {reg.grade}
                              </span>
                            </div>
                            <p className="moral-regional-mini-card-sub">
                              {selectedMoralDim === 'overall' ? (
                                <>⭐ เด่น: <strong style={{ color: '#0f172a' }}>{reg.topDimension}</strong></>
                              ) : (
                                <>มิติ{currentMoralDimMeta.shortName}: <strong style={{ color: '#1d4ed8' }}>{score}</strong> จุด</>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Region Diagnostic Deep Dive */}
                    {selectedMoralRegion && (
                      <div className="moral-regional-diag-box">
                        <div className="moral-regional-diag-header">
                          <h5 className="moral-regional-diag-title">
                            เจาะลึก 5 มิติคุณธรรม: <span style={{ color: '#1d4ed8' }}>{selectedMoralRegion.name}</span>
                          </h5>
                          <span className="moral-status-pill status-strong">สถานะ{selectedMoralRegion.status}</span>
                        </div>
                        <div className="moral-regional-dim-mini-bars">
                          <div className={`moral-regional-dim-bar-item ${selectedMoralDim === 'suff' ? 'active-bar' : ''}`} style={selectedMoralDim === 'suff' ? { borderColor: '#2563eb', background: '#eff6ff' } : {}}>
                            <span className="moral-regional-dim-bar-label">พอเพียง</span>
                            <span className="moral-regional-dim-bar-val" style={selectedMoralDim === 'suff' ? { color: '#1d4ed8' } : {}}>{selectedMoralRegion.dims.suff}</span>
                          </div>
                          <div className={`moral-regional-dim-bar-item ${selectedMoralDim === 'disc' ? 'active-bar' : ''}`} style={selectedMoralDim === 'disc' ? { borderColor: '#2563eb', background: '#eff6ff' } : {}}>
                            <span className="moral-regional-dim-bar-label">วินัย</span>
                            <span className="moral-regional-dim-bar-val" style={selectedMoralDim === 'disc' ? { color: '#1d4ed8' } : {}}>{selectedMoralRegion.dims.disc}</span>
                          </div>
                          <div className={`moral-regional-dim-bar-item ${selectedMoralDim === 'inte' ? 'active-bar' : ''}`} style={selectedMoralDim === 'inte' ? { borderColor: '#2563eb', background: '#eff6ff' } : {}}>
                            <span className="moral-regional-dim-bar-label">สุจริต</span>
                            <span className="moral-regional-dim-bar-val" style={selectedMoralDim === 'inte' ? { color: '#1d4ed8' } : {}}>{selectedMoralRegion.dims.inte}</span>
                          </div>
                          <div className={`moral-regional-dim-bar-item ${selectedMoralDim === 'volu' ? 'active-bar' : ''}`} style={selectedMoralDim === 'volu' ? { borderColor: '#2563eb', background: '#eff6ff' } : {}}>
                            <span className="moral-regional-dim-bar-label">จิตอาสา</span>
                            <span className="moral-regional-dim-bar-val" style={selectedMoralDim === 'volu' ? { color: '#1d4ed8' } : {}}>{selectedMoralRegion.dims.volu}</span>
                          </div>
                          <div className={`moral-regional-dim-bar-item ${selectedMoralDim === 'grat' ? 'active-bar' : ''}`} style={selectedMoralDim === 'grat' ? { borderColor: '#2563eb', background: '#eff6ff' } : {}}>
                            <span className="moral-regional-dim-bar-label">กตัญญู</span>
                            <span className="moral-regional-dim-bar-val" style={selectedMoralDim === 'grat' ? { color: '#1d4ed8' } : {}}>{selectedMoralRegion.dims.grat}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                          💡 <strong>ข้อเสนอแนะเชิงนโยบาย: </strong>{selectedMoralRegion.policyTip}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Provincial Explorer Panel */
                  <div className="moral-prov-explorer-panel">
                    {/* Search & Filter */}
                    <div className="moral-prov-search-bar">
                      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                        <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
                        <input
                          type="text"
                          placeholder="ค้นหาชื่อจังหวัด (เช่น น่าน, ขอนแก่น)..."
                          value={moralProvSearch}
                          onChange={(e) => setMoralProvSearch(e.target.value)}
                          className="moral-prov-search-input"
                          style={{ paddingLeft: '30px' }}
                        />
                      </div>
                      <select
                        value={moralProvRegionFilter}
                        onChange={(e) => setMoralProvRegionFilter(e.target.value)}
                        className="moral-prov-region-select"
                      >
                        <option value="all">ทุกภาค (77 จว.)</option>
                        <option value="กลาง">ภาคกลาง</option>
                        <option value="เหนือ">ภาคเหนือ</option>
                        <option value="อีสาน">ภาคอีสาน</option>
                        <option value="ตะวันออก">ภาคตะวันออก</option>
                        <option value="ตะวันตก">ภาคตะวันตก</option>
                        <option value="ใต้">ภาคใต้</option>
                      </select>
                    </div>

                    {/* Selected Province Highlights Card */}
                    {selectedMoralProv && (
                      <div className="moral-prov-selected-detail">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                              {selectedMoralProv.name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>
                              ({selectedMoralProv.region} / {selectedMoralProv.enName})
                            </span>
                          </div>
                          <span className="moral-prov-score-badge moral">
                            {currentMoralDimMeta.shortName}: {getMoralProvScore(selectedMoralProv, selectedMoralDim)}
                          </span>
                        </div>

                        {/* 5-Dimension Mini Bar Breakdown */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                          {[
                            { label: 'พอเพียง', score: selectedMoralProv.suffScore, key: 'suff' },
                            { label: 'วินัย', score: selectedMoralProv.discScore, key: 'disc' },
                            { label: 'สุจริต', score: selectedMoralProv.inteScore, key: 'inte' },
                            { label: 'จิตอาสา', score: selectedMoralProv.voluScore, key: 'volu' },
                            { label: 'กตัญญู', score: selectedMoralProv.gratScore, key: 'grat' },
                          ].map((d) => {
                            const isTarget = selectedMoralDim === d.key;
                            return (
                              <div
                                key={d.key}
                                style={{
                                  background: isTarget ? '#eff6ff' : '#f8fafc',
                                  border: isTarget ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  padding: '4px 6px',
                                  textAlign: 'center'
                                }}
                              >
                                <div style={{ fontSize: '10px', color: isTarget ? '#1d4ed8' : '#64748b', fontWeight: isTarget ? 700 : 500 }}>
                                  {d.label}
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: isTarget ? '#1d4ed8' : '#1e293b' }}>
                                  {d.score}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                          <span>องค์กรคุณธรรม: <strong>{selectedMoralProv.moralOrgCount}</strong> แห่ง</span>
                          <span>ชุมชนคุณธรรม: <strong>{selectedMoralProv.moralCommunityCount}</strong> แห่ง</span>
                          <span>วิทยากร: <strong>{selectedMoralProv.changeAgentCount}</strong> คน</span>
                        </div>
                      </div>
                    )}

                    {/* Leaderboard List Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748b', padding: '0 4px' }}>
                      <span>ลำดับจังหวัด ({filteredMoralProvinces.length} จังหวัด)</span>
                      <span>คะแนน{currentMoralDimMeta.shortName}</span>
                    </div>

                    {/* Scrollable Province List */}
                    <div className="moral-prov-list-container">
                      {filteredMoralProvinces.map((prov, idx) => {
                        const isSelected = selectedMoralProvId === prov.id;
                        const score = getMoralProvScore(prov, selectedMoralDim);
                        const rankClass = idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : '';
                        return (
                          <div
                            key={prov.id}
                            className={`moral-prov-list-item ${isSelected ? 'selected-moral' : ''}`}
                            onClick={() => setSelectedMoralProvId(prov.id)}
                            onMouseEnter={() => {
                              setHoveredMoralProvId(prov.id);
                              setHoveredMoralProvName(prov.name);
                            }}
                            onMouseLeave={() => {
                              setHoveredMoralProvId(null);
                              setHoveredMoralProvName(null);
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span className={`moral-prov-rank-badge ${rankClass}`}>
                                {idx + 1}
                              </span>
                              <div>
                                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                                  {prov.name}
                                </span>
                                <span style={{ fontSize: '10.5px', color: '#64748b', marginLeft: '6px' }}>
                                  ({prov.region})
                                </span>
                              </div>
                            </div>
                            <span className="moral-prov-score-badge moral">
                              {score}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 3. Regional Score Heatmap (6 Regions) */}
          <section className="moral-section">
            <h3 className="moral-section-title">
              <HeartHandshake size={18} color="#8b5cf6" />
              <span>คะแนนดัชนีคุณธรรม 5 มิติ จำแนกตาม 6 ภูมิภาค (Regional Heatmap Matrix)</span>
            </h3>

            <div className="moral-table-wrapper">
              <table className="moral-data-table">
                <thead>
                  <tr>
                    <th>ภูมิภาค (Region)</th>
                    <th style={{ textAlign: 'center' }}>พอเพียง</th>
                    <th style={{ textAlign: 'center' }}>วินัย</th>
                    <th style={{ textAlign: 'center' }}>สุจริต</th>
                    <th style={{ textAlign: 'center' }}>จิตอาสา</th>
                    <th style={{ textAlign: 'center' }}>กตัญญู</th>
                    <th style={{ textAlign: 'center' }}>ค่าเฉลี่ยคุณธรรม</th>
                    <th style={{ textAlign: 'center' }}>เกรดประเมิน</th>
                  </tr>
                </thead>
                <tbody>
                  {REGIONAL_HEATMAP_DATA.map((row) => {
                    const avgScore = (
                      (row.พอเพียง + row.วินัย + row.สุจริต + row.จิตอาสา + row.กตัญญู) /
                      5
                    ).toFixed(1);

                    return (
                      <tr key={row.region}>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{row.region}</td>
                        <td style={{ textAlign: 'center' }} className={`score-cell ${row.พอเพียง >= 80 ? 'high' : 'mid'}`}>
                          {row.พอเพียง}
                        </td>
                        <td style={{ textAlign: 'center' }} className={`score-cell ${row.วินัย >= 74 ? 'high' : 'mid'}`}>
                          {row.วินัย}
                        </td>
                        <td style={{ textAlign: 'center' }} className={`score-cell ${row.สุจริต >= 70 ? 'high' : 'mid'}`}>
                          {row.สุจริต}
                        </td>
                        <td style={{ textAlign: 'center' }} className={`score-cell ${row.จิตอาสา >= 85 ? 'high' : 'mid'}`}>
                          {row.จิตอาสา}
                        </td>
                        <td style={{ textAlign: 'center' }} className="score-cell high">
                          {row.กตัญญู}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#1d4ed8' }}>
                          {avgScore}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`moral-grade-pill ${row.grade === 'A' ? 'grade-a' : 'grade-b'}`}>
                            {row.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. AI Social Signal Alert Feed */}
          <section className="moral-section">
            <h3 className="moral-section-title">
              <AlertTriangle size={18} color="#f59e0b" />
              <span>AI Social Signal Feed: ระบบตรวจจับสัญญาณเตือนทางคุณธรรม (Early Warning)</span>
            </h3>

            <div className="moral-signals-grid">
              {AI_SOCIAL_SIGNALS.map((sig) => (
                <div key={sig.id} className={`moral-signal-card ${sig.level}`}>
                  <div className="moral-signal-header">
                    <span className={`moral-signal-badge ${sig.level}`}>
                      {sig.level.toUpperCase()}
                    </span>
                    <span className="moral-signal-source">{sig.source}</span>
                  </div>
                  <h5 className="moral-signal-title">{sig.title}</h5>
                  <p className="moral-signal-desc">{sig.description}</p>
                  <div className="moral-signal-rec-box">
                    <strong>มาตรการแทรกแซง:</strong> {sig.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Analytical Insights Banner */}
          <AiInsightBanner
            title="การสังเคราะห์ดัชนีคุณธรรม 5 มิติ และ Social Signals เชิงลึกโดย AI"
            badge="Moral Index & NLP Sentiment"
            severity="normal"
            insights={[
              'คะแนนดัชนีคุณธรรมเฉลี่ย 5 มิติระดับชาติอยู่ที่ 76.4 คะแนน ขยับขึ้น +1.8% YoY โดยมิติ "กตัญญู" (89.2) และ "จิตอาสา" (84.9) ยังคงเป็นจุดแข็งอันดับหนึ่งของสังคมไทย',
              'มิติ "วินัย" (72.8) มีแนวโน้มชะลอตัว -0.5% โดยเฉพาะในเขตเมืองหลวงและพื้นที่เศรษฐกิจ EEC สอดคล้องกับรายงานสภาวะความเครียดของกรมสุขภาพจิต',
              'ผลการวิเคราะห์ NLP Sentiment จากสื่อสังคมออนไลน์ 1.2 ล้านข้อความ พบความรู้สึกเชิงบวกต่อกิจกรรมจิตอาสาและสังคมเกื้อกูลสูงถึง 62% (กลาง 24%, ลบ 14%)'
            ]}
            recommendation="เสนอแนะให้เร่งเสริมสร้างมาตรการสร้างวินัยทางสังคมและวินัยจราจรในหัวเมืองใหญ่ ควบคู่ไปกับการยกระดับความโปร่งใสสุจริตในระบบราชการ"
          />
        </>
      )}

      {/* =========================================================
          TAB 2: ทุนชีวิต (Life Capital View)
          ========================================================= */}
      {activeTab === 'life' && (
        <>
          {/* 1. Summary Metric Cards: 4 Pillars + Overall */}
          <section className="moral-section">
            <h3 className="moral-section-title">
              <Sparkles size={18} color="#059669" />
              <span>4 พลังทุนชีวิต และทุนชีวิตภาพรวมประเทศ (ปี 2568)</span>
            </h3>

            <div className="moral-kpi-row-5cols">
              {/* Overall Life Capital Highlight Card */}
              <div className="moral-kpi-card-rich moral-kpi-highlight-card">
                <div className="moral-kpi-card-top-row">
                  <span className="moral-kpi-badge-dim" style={{ backgroundColor: '#10b98120', color: '#059669' }}>
                    National Total
                  </span>
                  <span className="moral-yoy-tag up">▲ +{LIFE_CAPITAL_SCORE.yoy}%</span>
                </div>
                <div className="moral-kpi-title-text">ทุนชีวิตภาพรวม</div>
                <div className="moral-kpi-value-row">
                  <span className="moral-kpi-big-value" style={{ color: '#059669' }}>
                    {LIFE_CAPITAL_SCORE.overall}
                  </span>
                  <span className="moral-kpi-max-value">/ 100</span>
                </div>
                <div className="moral-progress-track">
                  <div
                    className="moral-progress-fill"
                    style={{ width: `${LIFE_CAPITAL_SCORE.overall}%`, backgroundColor: '#059669' }}
                  />
                </div>
                <p className="moral-kpi-desc-text">เกราะคุ้มกันทางสังคมและสุขภาวะจิตของเยาวชนและครอบครัว</p>
              </div>

              {/* 4 Pillars Individual Cards */}
              {LIFE_CAPITAL_4_PILLARS.map((pillar) => (
                <div key={pillar.key} className="moral-kpi-card-rich">
                  <div className="moral-kpi-card-top-row">
                    <span
                      className="moral-kpi-badge-dim"
                      style={{ backgroundColor: `${pillar.color}15`, color: pillar.color }}
                    >
                      {pillar.nameEn}
                    </span>
                    <span className={`moral-yoy-tag ${pillar.yoy >= 0 ? 'up' : 'down'}`}>
                      {pillar.yoy >= 0 ? `▲ +${pillar.yoy}%` : `▼ ${pillar.yoy}%`}
                    </span>
                  </div>
                  <div className="moral-kpi-title-text">{pillar.name}</div>
                  <div className="moral-kpi-value-row">
                    <span className="moral-kpi-big-value" style={{ color: pillar.color }}>
                      {pillar.score}
                    </span>
                    <span className="moral-kpi-max-value">/ 100</span>
                  </div>
                  <div className="moral-progress-track">
                    <div
                      className="moral-progress-fill"
                      style={{ width: `${pillar.score}%`, backgroundColor: pillar.color }}
                    />
                  </div>
                  <p className="moral-kpi-desc-text">{pillar.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Radar Chart + Multi-line Trend Chart Side-by-Side */}
          <div className="moral-grid-2cols">
            {/* Radar Chart (ใยแมงมุม 4 แกน) */}
            <div className="moral-card-panel">
              <div className="moral-card-panel-header">
                <div className="moral-card-panel-title-wrap">
                  <Award size={18} color="#059669" />
                  <div>
                    <h4 className="moral-card-panel-title">Radar Chart: เปรียบเทียบ 4 พลังทุนชีวิต</h4>
                    <p className="moral-card-panel-sub">เปรียบเทียบการเปลี่ยนแปลงรายปี (ปี 2567 vs 2568)</p>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={LIFE_CAPITAL_RADAR_DATA}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-thai)' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar name="ปี 2567" dataKey="year2567" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.25} />
                    <Radar name="ปี 2568" dataKey="year2568" stroke="#059669" fill="#059669" fillOpacity={0.5} />
                    <Legend wrapperStyle={{ fontFamily: 'var(--font-thai)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Multi-line Trend Chart: 2565 to 2569 Forecast */}
            <div className="moral-card-panel">
              <div className="moral-card-panel-header">
                <div className="moral-card-panel-title-wrap">
                  <TrendingUp size={18} color="#0284c7" />
                  <div>
                    <h4 className="moral-card-panel-title">Multi-line Trend: แนวโน้ม 4 พลังทุนชีวิต</h4>
                    <p className="moral-card-panel-sub">ข้อมูลจริงปี 2565–2568 และเส้นประพยากรณ์ AI ปี 2569 (F)</p>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={LIFE_CAPITAL_TREND_DATA} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={11} tick={{ fontFamily: 'var(--font-thai)' }} />
                    <YAxis domain={[55, 100]} stroke="#64748b" fontSize={11} ticks={[60, 70, 80, 90, 100]} tick={{ fontFamily: 'var(--font-thai)' }} />
                    <RechartsTooltip contentStyle={{ fontFamily: 'var(--font-thai)' }} />
                    <Legend wrapperStyle={{ fontFamily: 'var(--font-thai)' }} />
                    <Line type="monotone" dataKey="พลังปัญญา" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="พลังชุมชนและสังคม" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="พลังครอบครัว" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="พลังสร้างสรรค์และสื่อ" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="ทุนชีวิตรวม" stroke="#047857" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* แผนที่คะแนน 4 พลังทุนชีวิต 6 ภูมิภาค / 77 จังหวัด (Life Capital Map) */}
          <section className="moral-section">
            <h3 className="moral-section-title">
              <MapPin size={18} color="#059669" />
              <span>
                {lifeViewLevel === 'region'
                  ? 'แผนที่คะแนน 4 พลังทุนชีวิต 6 ภูมิภาค (Regional Life Capital Map)'
                  : 'แผนที่คะแนน 4 พลังทุนชีวิต 77 จังหวัด (Provincial Life Capital Map)'}
              </span>
            </h3>

            {/* Top Control Header: Level Switch + Dimension Tabs */}
            <div className="moral-map-control-header">
              <div className="moral-map-control-row">
                <div className="moral-map-control-group">
                  <span className="moral-map-control-label">
                    <Layers size={15} color="#059669" /> ระดับพื้นที่:
                  </span>
                  <div className="moral-map-level-switch">
                    <button
                      type="button"
                      className={`moral-map-level-btn ${lifeViewLevel === 'region' ? 'active life' : ''}`}
                      onClick={() => setLifeViewLevel('region')}
                    >
                      <MapPin size={13} /> แบบภูมิภาค (6 ภูมิภาค)
                    </button>
                    <button
                      type="button"
                      className={`moral-map-level-btn ${lifeViewLevel === 'province' ? 'active life' : ''}`}
                      onClick={() => setLifeViewLevel('province')}
                    >
                      <Sparkles size={13} /> แบบจังหวัด (77 จังหวัด)
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                  มิติที่เลือก: <strong style={{ color: '#047857' }}>{currentLifeDimMeta.name}</strong> ({currentLifeDimMeta.description})
                </div>
              </div>

              {/* Dimension Filter Tabs */}
              <div className="moral-map-control-row" style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    <Filter size={14} color="#64748b" /> เลือกมิติทุนชีวิตเพื่อวิเคราะห์เชิงพื้นที่:
                  </div>
                  <MoralSubmenuArchCards
                    items={NATIONAL_LIFE_DIM_ARCH_CARDS}
                    activeId={selectedLifeDim}
                    onSelect={(id) => setSelectedLifeDim(id as any)}
                    columns={5}
                  />
                </div>
              </div>
            </div>

            <div className="moral-card-panel" style={{ minHeight: '940px' }}>
              <div className="moral-regional-map-grid" style={{ alignItems: 'stretch' }}>
                {/* Left: 3D Thailand Shaded Map */}
                <div style={{ height: '912px', minHeight: '912px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    {lifeViewLevel === 'region'
                      ? `คลิกหรือชี้เมาส์ที่ภูมิภาคเพื่อดูคะแนน${currentLifeDimMeta.shortName} (สีเขียวเข้ม = ทุนชีวิตสูง)`
                      : `คลิกหรือชี้เมาส์ที่จังหวัดเพื่อดูคะแนน${currentLifeDimMeta.shortName}รายพื้นที่ (สีเขียวเข้ม = ทุนชีวิตสูง)`}
                  </div>
                  <div className="moral-map-container" style={{ flex: 1, position: 'relative', minHeight: '840px', height: '840px' }}>
                    <Thailand3dShadedMap
                      height="810px"
                      scale={1.12}
                      translateY="15%"
                      getProvinceFill={(id, name) => getProvinceLifeFill(id, name)}
                      onProvinceMouseEnter={(loc) => {
                        if (lifeViewLevel === 'region') {
                          const rKey = getRegionKeyByProvince(loc.id, loc.name);
                          setHoveredLifeRegionKey(rKey);
                        } else {
                          setHoveredLifeProvId(loc.id);
                          setHoveredLifeProvName(loc.name);
                        }
                      }}
                      onProvinceMouseLeave={() => {
                        if (lifeViewLevel === 'region') {
                          setHoveredLifeRegionKey(null);
                        } else {
                          setHoveredLifeProvId(null);
                          setHoveredLifeProvName(null);
                        }
                      }}
                      onProvinceClick={(loc) => {
                        if (lifeViewLevel === 'region') {
                          const rKey = getRegionKeyByProvince(loc.id, loc.name);
                          setSelectedLifeRegionKey(rKey);
                        } else {
                          const prov = PROVINCES_77_LIFE_DATA.find(
                            p => p.id.toLowerCase() === loc.id.toLowerCase() || p.name === loc.name || loc.name.includes(p.name)
                          );
                          if (prov) setSelectedLifeProvId(prov.id);
                        }
                      }}
                    >
                      {/* Map Legend for Life Capital */}
                      <div className="moral-map-overlay-legend">
                        {lifeViewLevel === 'region' ? (
                          <>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#047857' }} /> &ge; 71.5 (เข้มแข็ง)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#059669' }} /> 70.0 – 71.4 (ปานกลางค่อนข้างดี)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#10b981' }} /> 68.0 – 69.9 (ปานกลาง)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#f59e0b' }} /> ภูมิภาคที่เลือก
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#065f46' }} /> &ge; 73.0 (เข้มแข็งมาก)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#047857' }} /> 71.0 – 72.9 (เข้มแข็ง)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#059669' }} /> 69.0 – 70.9 (ปานกลาง)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#10b981' }} /> &lt; 69.0 (เฝ้าระวัง)
                            </div>
                            <div className="moral-map-legend-item">
                              <span className="legend-box" style={{ background: '#f59e0b' }} /> จังหวัดที่เลือก
                            </div>
                          </>
                        )}
                      </div>

                      {/* Hover/Active Floating Badge */}
                      {lifeViewLevel === 'region' && activeLifeRegion && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(6px)',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          pointerEvents: 'none',
                          zIndex: 20
                        }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                            {activeLifeRegion.name} ({activeLifeRegion.provinceCount} จังหวัด)
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            คะแนน{currentLifeDimMeta.shortName}: <strong style={{ color: '#047857' }}>{getLifeRegionScore(activeLifeRegion, selectedLifeDim)}</strong> / 100 ({activeLifeRegion.grade})
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#059669', marginTop: '2px' }}>
                            พลังเด่น: {activeLifeRegion.topPillar}
                          </div>
                        </div>
                      )}

                      {lifeViewLevel === 'province' && (hoveredLifeProv || selectedLifeProv) && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255, 255, 255, 0.96)',
                          backdropFilter: 'blur(6px)',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '8px 14px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          pointerEvents: 'none',
                          zIndex: 20
                        }}>
                          {(() => {
                            const target = hoveredLifeProv || selectedLifeProv;
                            const score = getLifeProvScore(target, selectedLifeDim);
                            return (
                              <>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                                  {target.name} {target.enName ? `(${target.enName})` : ''}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  ภาค: <span style={{ fontWeight: 600, color: '#1e293b' }}>{target.region}</span> | ระดับ:{' '}
                                  <span style={{ fontWeight: 700, color: '#047857' }}>
                                    {target.overallScore >= 71.0 ? 'เข้มแข็ง' : 'ปานกลาง'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#0f172a', marginTop: '2px' }}>
                                  คะแนน{currentLifeDimMeta.shortName}: <strong style={{ color: '#047857' }}>{score}</strong> / 100
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </Thailand3dShadedMap>
                  </div>
                </div>

                {/* Right: 6 Regional Cards OR Provincial Explorer */}
                {lifeViewLevel === 'region' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
                    <div className="moral-regional-cards-grid">
                      {LIFE_6_REGIONS.map((reg) => {
                        const isSelected = selectedLifeRegionKey === reg.key;
                        const score = getLifeRegionScore(reg, selectedLifeDim);
                        return (
                          <div
                            key={reg.key}
                            className={`moral-regional-mini-card ${isSelected ? 'active-life' : ''}`}
                            onClick={() => setSelectedLifeRegionKey(reg.key)}
                            onMouseEnter={() => setHoveredLifeRegionKey(reg.key)}
                            onMouseLeave={() => setHoveredLifeRegionKey(null)}
                          >
                            <div className="moral-regional-mini-card-header">
                              <span className="moral-regional-mini-card-name">{reg.name}</span>
                              <span className="moral-regional-prov-count">{reg.provinceCount} จว.</span>
                            </div>
                            <div className="moral-regional-mini-card-score-row">
                              <div>
                                <span className="moral-regional-mini-card-score">{score}</span>
                                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '3px' }}>/ 100</span>
                              </div>
                              <span className={`moral-grade-pill ${reg.grade === 'A' ? 'grade-a' : 'grade-b'}`}>
                                เกรด {reg.grade}
                              </span>
                            </div>
                            <p className="moral-regional-mini-card-sub">
                              {selectedLifeDim === 'overall' ? (
                                <>🌿 เด่น: <strong style={{ color: '#0f172a' }}>{reg.topPillar}</strong></>
                              ) : (
                                <>มิติ{currentLifeDimMeta.shortName}: <strong style={{ color: '#047857' }}>{score}</strong> จุด</>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Region Diagnostic Deep Dive for Life Capital */}
                    {selectedLifeRegion && (
                      <div className="moral-regional-diag-box">
                        <div className="moral-regional-diag-header">
                          <h5 className="moral-regional-diag-title">
                            เจาะลึก 4 พลังทุนชีวิต: <span style={{ color: '#047857' }}>{selectedLifeRegion.name}</span>
                          </h5>
                          <span className="moral-status-pill status-strong">สถานะ{selectedLifeRegion.status}</span>
                        </div>
                        <div className="moral-regional-pillar-mini-bars">
                          <div className={`moral-regional-dim-bar-item ${selectedLifeDim === 'wisdom' ? 'active-bar' : ''}`} style={selectedLifeDim === 'wisdom' ? { borderColor: '#10b981', background: '#f0fdf4' } : {}}>
                            <span className="moral-regional-dim-bar-label">พลังปัญญา</span>
                            <span className="moral-regional-dim-bar-val" style={selectedLifeDim === 'wisdom' ? { color: '#047857' } : {}}>{selectedLifeRegion.pillars.wisdom}</span>
                          </div>
                          <div className={`moral-regional-dim-bar-item ${selectedLifeDim === 'family' ? 'active-bar' : ''}`} style={selectedLifeDim === 'family' ? { borderColor: '#10b981', background: '#f0fdf4' } : {}}>
                            <span className="moral-regional-dim-bar-label">พลังครอบครัว</span>
                            <span className="moral-regional-dim-bar-val" style={selectedLifeDim === 'family' ? { color: '#047857' } : {}}>{selectedLifeRegion.pillars.family}</span>
                          </div>
                          <div className={`moral-regional-dim-bar-item ${selectedLifeDim === 'community' ? 'active-bar' : ''}`} style={selectedLifeDim === 'community' ? { borderColor: '#10b981', background: '#f0fdf4' } : {}}>
                            <span className="moral-regional-dim-bar-label">พลังชุมชน</span>
                            <span className="moral-regional-dim-bar-val" style={selectedLifeDim === 'community' ? { color: '#047857' } : {}}>{selectedLifeRegion.pillars.community}</span>
                          </div>
                          <div className={`moral-regional-dim-bar-item ${selectedLifeDim === 'media' ? 'active-bar' : ''}`} style={selectedLifeDim === 'media' ? { borderColor: '#10b981', background: '#f0fdf4' } : {}}>
                            <span className="moral-regional-dim-bar-label">พลังสื่อ</span>
                            <span className="moral-regional-dim-bar-val" style={selectedLifeDim === 'media' ? { color: '#047857' } : {}}>{selectedLifeRegion.pillars.media}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                          💡 <strong>การหนุนเสริมระบบนิเวศ: </strong>{selectedLifeRegion.policyTip}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Provincial Explorer Panel for Life Capital */
                  <div className="moral-prov-explorer-panel">
                    {/* Search & Filter */}
                    <div className="moral-prov-search-bar">
                      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                        <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
                        <input
                          type="text"
                          placeholder="ค้นหาชื่อจังหวัด (เช่น ลำปาง, ภูเก็ต)..."
                          value={lifeProvSearch}
                          onChange={(e) => setLifeProvSearch(e.target.value)}
                          className="moral-prov-search-input"
                          style={{ paddingLeft: '30px' }}
                        />
                      </div>
                      <select
                        value={lifeProvRegionFilter}
                        onChange={(e) => setLifeProvRegionFilter(e.target.value)}
                        className="moral-prov-region-select"
                      >
                        <option value="all">ทุกภาค (77 จว.)</option>
                        <option value="กลาง">ภาคกลาง</option>
                        <option value="เหนือ">ภาคเหนือ</option>
                        <option value="อีสาน">ภาคอีสาน</option>
                        <option value="ตะวันออก">ภาคตะวันออก</option>
                        <option value="ตะวันตก">ภาคตะวันตก</option>
                        <option value="ใต้">ภาคใต้</option>
                      </select>
                    </div>

                    {/* Selected Province Highlights Card */}
                    {selectedLifeProv && (
                      <div className="moral-prov-selected-detail">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                              {selectedLifeProv.name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>
                              ({selectedLifeProv.region} / {selectedLifeProv.enName})
                            </span>
                          </div>
                          <span className="moral-prov-score-badge life">
                            {currentLifeDimMeta.shortName}: {getLifeProvScore(selectedLifeProv, selectedLifeDim)}
                          </span>
                        </div>

                        {/* 4 Pillars Mini Bar Breakdown */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                          {[
                            { label: 'ปัญญา', score: selectedLifeProv.wisdomScore, key: 'wisdom' },
                            { label: 'ครอบครัว', score: selectedLifeProv.familyScore, key: 'family' },
                            { label: 'ชุมชน/สังคม', score: selectedLifeProv.communityScore, key: 'community' },
                            { label: 'สื่อสร้างสรรค์', score: selectedLifeProv.mediaScore, key: 'media' },
                          ].map((d) => {
                            const isTarget = selectedLifeDim === d.key;
                            return (
                              <div
                                key={d.key}
                                style={{
                                  background: isTarget ? '#f0fdf4' : '#f8fafc',
                                  border: isTarget ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  padding: '4px 6px',
                                  textAlign: 'center'
                                }}
                              >
                                <div style={{ fontSize: '10px', color: isTarget ? '#047857' : '#64748b', fontWeight: isTarget ? 700 : 500 }}>
                                  {d.label}
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: isTarget ? '#047857' : '#1e293b' }}>
                                  {d.score}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                          <span>ทุนชีวิตรวม: <strong style={{ color: '#047857' }}>{selectedLifeProv.overallScore}</strong> / 100</span>
                          <span>ระดับ: <strong>{selectedLifeProv.overallScore >= 71.0 ? 'เข้มแข็ง' : 'ปานกลาง'}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Leaderboard List Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748b', padding: '0 4px' }}>
                      <span>ลำดับจังหวัด ({filteredLifeProvinces.length} จังหวัด)</span>
                      <span>คะแนน{currentLifeDimMeta.shortName}</span>
                    </div>

                    {/* Scrollable Province List */}
                    <div className="moral-prov-list-container">
                      {filteredLifeProvinces.map((prov, idx) => {
                        const isSelected = selectedLifeProvId === prov.id;
                        const score = getLifeProvScore(prov, selectedLifeDim);
                        const rankClass = idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : '';
                        return (
                          <div
                            key={prov.id}
                            className={`moral-prov-list-item ${isSelected ? 'selected-life' : ''}`}
                            onClick={() => setSelectedLifeProvId(prov.id)}
                            onMouseEnter={() => {
                              setHoveredLifeProvId(prov.id);
                              setHoveredLifeProvName(prov.name);
                            }}
                            onMouseLeave={() => {
                              setHoveredLifeProvId(null);
                              setHoveredLifeProvName(null);
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span className={`moral-prov-rank-badge ${rankClass}`}>
                                {idx + 1}
                              </span>
                              <div>
                                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                                  {prov.name}
                                </span>
                                <span style={{ fontSize: '10.5px', color: '#64748b', marginLeft: '6px' }}>
                                  ({prov.region})
                                </span>
                              </div>
                            </div>
                            <span className="moral-prov-score-badge life">
                              {score}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 3. Regional Life Capital Matrix (6 Regions) */}
          <section className="moral-section">
            <h3 className="moral-section-title">
              <Users size={18} color="#059669" />
              <span>คะแนน 4 พลังทุนชีวิต จำแนกตาม 6 ภูมิภาค (Regional Life Capital Matrix)</span>
            </h3>

            <div className="moral-table-wrapper">
              <table className="moral-data-table">
                <thead>
                  <tr>
                    <th>ภูมิภาค (Region)</th>
                    <th style={{ textAlign: 'center' }}>พลังปัญญา</th>
                    <th style={{ textAlign: 'center' }}>พลังครอบครัว</th>
                    <th style={{ textAlign: 'center' }}>พลังชุมชนและสังคม</th>
                    <th style={{ textAlign: 'center' }}>พลังสร้างสรรค์และสื่อ</th>
                    <th style={{ textAlign: 'center' }}>ทุนชีวิตรวม</th>
                    <th style={{ textAlign: 'center' }}>สถานะการหนุนเสริม</th>
                    <th style={{ textAlign: 'center' }}>เกรดประเมิน</th>
                  </tr>
                </thead>
                <tbody>
                  {LIFE_CAPITAL_REGIONAL_DATA.map((row) => (
                    <tr key={row.region}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{row.region}</td>
                      <td style={{ textAlign: 'center' }} className={`score-cell ${row.พลังปัญญา >= 72 ? 'high' : 'mid'}`}>
                        {row.พลังปัญญา}
                      </td>
                      <td style={{ textAlign: 'center' }} className={`score-cell ${row.พลังครอบครัว >= 70 ? 'high' : 'mid'}`}>
                        {row.พลังครอบครัว}
                      </td>
                      <td style={{ textAlign: 'center' }} className="score-cell high">
                        {row.พลังชุมชนและสังคม}
                      </td>
                      <td style={{ textAlign: 'center' }} className={`score-cell ${row.พลังสร้างสรรค์และสื่อ >= 67 ? 'high' : 'mid'}`}>
                        {row.พลังสร้างสรรค์และสื่อ}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#047857' }}>
                        {row.ทุนชีวิตรวม}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`moral-status-pill ${
                            row.status === 'เข้มแข็ง'
                              ? 'status-strong'
                              : row.status === 'ปานกลาง'
                              ? 'status-moderate'
                              : 'status-warning'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`moral-grade-pill ${row.grade === 'A' ? 'grade-a' : 'grade-b'}`}>
                          {row.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Life Capital Vulnerability Alerts */}
          <section className="moral-section">
            <h3 className="moral-section-title">
              <Radio size={18} color="#f59e0b" />
              <span>ระบบเตือนภัยความเปราะบางของทุนชีวิตและเยาวชน (Vulnerability Alerts)</span>
            </h3>

            <div className="moral-signals-grid">
              {LIFE_CAPITAL_SIGNALS.map((sig) => (
                <div key={sig.id} className={`moral-signal-card ${sig.level}`}>
                  <div className="moral-signal-header">
                    <span className={`moral-signal-badge ${sig.level}`}>
                      {sig.level.toUpperCase()}
                    </span>
                    <span className="moral-signal-source">{sig.source}</span>
                  </div>
                  <h5 className="moral-signal-title">{sig.title}</h5>
                  <p className="moral-signal-desc">{sig.description}</p>
                  <div className="moral-signal-rec-box">
                    <strong>มาตรการหนุนเสริม:</strong> {sig.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Analytical Insights Banner for Life Capital */}
          <AiInsightBanner
            title="การสังเคราะห์บูรณาการ 4 พลังทุนชีวิต และระบบนิเวศทางสังคมโดย AI"
            badge="Life Capital Mesosystem Analysis"
            severity="normal"
            insights={[
              'คะแนนทุนชีวิตภาพรวมประเทศอยู่ที่ 69.8 คะแนน (+2.4% YoY) โดย "พลังชุมชนและสังคม" (73.1) และ "พลังปัญญา" (71.2) เป็นแกนหลักที่ค้ำจุนสุขภาวะเยาวชนไทย',
              'จุดเปราะบางสำคัญพบใน "พลังครอบครัว" (68.4) โดยเฉพาะกลุ่มครอบครัวข้ามรุ่นในชนบทและครอบครัวเดี่ยวในเขตเมืองใหญ่ ที่มีเวลาคุณภาพร่วมกันลดน้อยลง',
              '"พลังสร้างสรรค์และสื่อ" (66.5) แม้มีพัฒนาการขึ้น แต่เยาวชนยังเผชิญความเสี่ยงต่อการหลอกลวงออนไลน์ การกลั่นแกล้งทางไซเบอร์ และข่าวสารบิดเบือนสูง'
            ]}
            recommendation="เร่งขับเคลื่อนโครงการ 'ศูนย์พัฒนาทุนชีวิตและครอบครัวคุณธรรม' ในระดับตำบล และจัดสรรทุนสนับสนุนสภาเด็กและเยาวชนในการผลิตสื่อนวัตกรรมเชิงบวก"
          />
        </>
      )}

      {/* 5. Integrated Data Sources Footer (ล่างสุดของหน้า) */}
      <MoralSourceFooter
        agencies={INTEGRATED_AGENCIES}
        viewTitle="1.1 ภาพรวมดัชนีคุณธรรมและทุนชีวิตระดับชาติ"
      />
    </div>
  );
};
