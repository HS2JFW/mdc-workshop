import React, { useState } from 'react';
import thailandMapData from '@svg-maps/thailand';
import { getMdcRegionKey } from '../data/moralMdcSurveyData';

// Complete 78 Locations Mapping for @svg-maps/thailand
export const THAILAND_PROVINCE_EN_TO_TH: Record<string, string> = {
  'Bangkok': 'กรุงเทพมหานคร',
  'Samut Prakan': 'สมุทรปราการ',
  'Nonthaburi': 'นนทบุรี',
  'Pathum Thani': 'ปทุมธานี',
  'Phra Nakhon Si Ayutthaya': 'พระนครศรีอยุธยา',
  'Ang Thong': 'อ่างทอง',
  'Lop Buri': 'ลพบุรี',
  'Sing Buri': 'สิงห์บุรี',
  'Chai Nat': 'ชัยนาท',
  'Saraburi': 'สระบุรี',
  'Chon Buri': 'ชลบุรี',
  'Rayong': 'ระยอง',
  'Chanthaburi': 'จันทบุรี',
  'Trat': 'ตราด',
  'Chachoengsao': 'ฉะเชิงเทรา',
  'Prachin Buri': 'ปราจีนบุรี',
  'Nakhon Nayok': 'นครนายก',
  'Sa Kaeo': 'สระแก้ว',
  'Nakhon Ratchasima': 'นครราชสีมา',
  'Buriram': 'บุรีรัมย์',
  'Surin': 'สุรินทร์',
  'Si Sa Ket': 'ศรีสะเกษ',
  'Ubon Ratchathani': 'อุบลราชธานี',
  'Yasothon': 'ยโสธร',
  'Chaiyaphum': 'ชัยภูมิ',
  'Amnat Charoen': 'อำนาจเจริญ',
  'Bueng Kan': 'บึงกาฬ',
  'Nong Bua Lam Phu': 'หนองบัวลำภู',
  'Khon Kaen': 'ขอนแก่น',
  'Udon Thani': 'อุดรธานี',
  'Loei': 'เลย',
  'Nong Khai': 'หนองคาย',
  'Maha Sarakham': 'มหาสารคาม',
  'Roi Et': 'ร้อยเอ็ด',
  'Kalasin': 'กาฬสินธุ์',
  'Sakon Nakhon': 'สกลนคร',
  'Nakhon Phanom': 'นครพนม',
  'Mukdahan': 'มุกดาหาร',
  'Chiang Mai': 'เชียงใหม่',
  'Lamphun': 'ลำพูน',
  'Lampang': 'ลำปาง',
  'Uttaradit': 'อุตรดิตถ์',
  'Phrae': 'แพร่',
  'Nan': 'น่าน',
  'Phayao': 'พะเยา',
  'Chiang Rai': 'เชียงราย',
  'Mae Hong Son': 'แม่ฮ่องสอน',
  'Nakhon Sawan': 'นครสวรรค์',
  'Uthai Thani': 'อุทัยธานี',
  'Kamphaeng Phet': 'กำแพงเพชร',
  'Tak': 'ตาก',
  'Sukhothai': 'สุโขทัย',
  'Phitsanulok': 'พิษณุโลก',
  'Phichit': 'พิจิตร',
  'Phetchabun': 'เพชรบูรณ์',
  'Ratchaburi': 'ราชบุรี',
  'Kanchanaburi': 'กาญจนบุรี',
  'Suphan Buri': 'สุพรรณบุรี',
  'Nakhon Pathom': 'นครปฐม',
  'Samut Sakhon': 'สมุทรสาคร',
  'Samut Songkhram': 'สมุทรสงคราม',
  'Phetchaburi': 'เพชรบุรี',
  'Prachuap Khiri Khan': 'ประจวบคีรีขันธ์',
  'Nakhon Si Thammarat': 'นครศรีธรรมราช',
  'Krabi': 'กระบี่',
  'Phangnga': 'พังงา',
  'Phuket': 'ภูเก็ต',
  'Surat Thani': 'สุราษฎร์ธานี',
  'Ranong': 'ระนอง',
  'Chumphon': 'ชุมพร',
  'Songkhla': 'สงขลา',
  'Satun': 'สตูล',
  'Trang': 'ตรัง',
  'Phatthalung': 'พัทลุง',
  'Pattani': 'ปัตตานี',
  'Yala': 'ยะลา',
  'Narathiwat': 'นราธิวาส',
  'Lake Songkha': 'ทะเลสาบสงขลา',
};

export const THAILAND_PROVINCE_ID_TO_TH: Record<string, string> = {
  'bkk': 'กรุงเทพมหานคร',
  'spk': 'สมุทรปราการ',
  'nbi': 'นนทบุรี',
  'pte': 'ปทุมธานี',
  'aya': 'พระนครศรีอยุธยา',
  'atg': 'อ่างทอง',
  'lri': 'ลพบุรี',
  'sbr': 'สิงห์บุรี',
  'cnt': 'ชัยนาท',
  'sri': 'สระบุรี',
  'cbi': 'ชลบุรี',
  'ryg': 'ระยอง',
  'cti': 'จันทบุรี',
  'trt': 'ตราด',
  'cco': 'ฉะเชิงเทรา',
  'pri': 'ปราจีนบุรี',
  'nyk': 'นครนายก',
  'skw': 'สระแก้ว',
  'nma': 'นครราชสีมา',
  'brm': 'บุรีรัมย์',
  'srn': 'สุรินทร์',
  'ssk': 'ศรีสะเกษ',
  'ubn': 'อุบลราชธานี',
  'yst': 'ยโสธร',
  'cpm': 'ชัยภูมิ',
  'acr': 'อำนาจเจริญ',
  'bkn': 'บึงกาฬ',
  'nbp': 'หนองบัวลำภู',
  'kkn': 'ขอนแก่น',
  'udn': 'อุดรธานี',
  'lei': 'เลย',
  'nki': 'หนองคาย',
  'mkm': 'มหาสารคาม',
  'ret': 'ร้อยเอ็ด',
  'ksn': 'กาฬสินธุ์',
  'snk': 'สกลนคร',
  'npm': 'นครพนม',
  'mdh': 'มุกดาหาร',
  'cmi': 'เชียงใหม่',
  'lpn': 'ลำพูน',
  'lpg': 'ลำปาง',
  'utd': 'อุตรดิตถ์',
  'pre': 'แพร่',
  'nan': 'น่าน',
  'pyo': 'พะเยา',
  'cri': 'เชียงราย',
  'msn': 'แม่ฮ่องสอน',
  'nsn': 'นครสวรรค์',
  'uti': 'อุทัยธานี',
  'kpt': 'กำแพงเพชร',
  'tak': 'ตาก',
  'sti': 'สุโขทัย',
  'plk': 'พิษณุโลก',
  'pct': 'พิจิตร',
  'pnb': 'เพชรบูรณ์',
  'rbr': 'ราชบุรี',
  'kri': 'กาญจนบุรี',
  'spb': 'สุพรรณบุรี',
  'npt': 'นครปฐม',
  'skn': 'สมุทรสาคร',
  'skm': 'สมุทรสงคราม',
  'pbi': 'เพชรบุรี',
  'pkn': 'ประจวบคีรีขันธ์',
  'nrt': 'นครศรีธรรมราช',
  'kbi': 'กระบี่',
  'pna': 'พังงา',
  'pkt': 'ภูเก็ต',
  'sni': 'สุราษฎร์ธานี',
  'rng': 'ระนอง',
  'cpn': 'ชุมพร',
  'ska': 'สงขลา',
  'stn': 'สตูล',
  'trg': 'ตรัง',
  'plg': 'พัทลุง',
  'ptn': 'ปัตตานี',
  'yla': 'ยะลา',
  'nwt': 'นราธิวาส',
  'lksg': 'ทะเลสาบสงขลา',
};

export const getProvinceThaiName = (id?: string | null, name?: string | null): string => {
  if (id && THAILAND_PROVINCE_ID_TO_TH[id.toLowerCase()]) {
    return THAILAND_PROVINCE_ID_TO_TH[id.toLowerCase()];
  }
  if (name && THAILAND_PROVINCE_EN_TO_TH[name]) {
    return THAILAND_PROVINCE_EN_TO_TH[name];
  }
  if (name) {
    const clean = name.trim().toLowerCase();
    for (const [k, v] of Object.entries(THAILAND_PROVINCE_EN_TO_TH)) {
      if (k.toLowerCase() === clean) return v;
    }
  }
  return name || id || '';
};


export const PROVINCE_BLUE_PALETTE = [
  '#c5ddf8', // Very light pastel sky blue
  '#b2d3f7', // Light sky blue
  '#9dc7f5', // Soft baby blue
  '#87baf2', // Clean medium sky blue
  '#74acee', // Medium blue
  '#5f9ee8', // Rich cornflower blue
  '#4c90e0', // Deep azure blue
  '#3d82d4', // Vibrant cobalt blue
  '#93c0f3', // Highlight blue
  '#6ba4ea'  // Muted steel blue
];

export const getDefaultProvinceBlue = (id: string, name: string): string => {
  let hash = 0;
  const str = id + name + 'moral';
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % PROVINCE_BLUE_PALETTE.length;
  return PROVINCE_BLUE_PALETTE[idx];
};

export interface ThailandMapPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
  [key: string]: any;
}

export interface RegionalScoreDialogItem {
  regionKey: 'Central' | 'East' | 'Northeast' | 'West' | 'South' | 'North' | string;
  name: string;
  score: number | string;
  tier: string;
  color?: string;
  badgeBg?: string;
  badgeText?: string;
  badgeBorder?: string;
  isSelected?: boolean;
  emotion?: 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';
  trend?: 'up' | 'down' | 'same' | null;
  trendDiff?: number;
  compareYearLabel?: string;
  // Synergy Comparative Data Fields for Rich Hover Dialogue
  moralIndexName?: string;
  moralScoreFormatted?: string;
  externalDatasetName?: string;
  externalAgency?: string;
  externalMetricValue?: string;
  externalRiskPct?: number;
  conciseInsight?: string;
  provincesText?: string;
  correlationType?: 'positive' | 'negative' | 'moderate';
}

export interface Thailand3dShadedMapProps {
  getProvinceFill?: (id: string, name: string) => string;
  onProvinceClick?: (province: { id: string; name: string }) => void;
  onSelectProvince?: (province: any) => void;
  onProvinceMouseEnter?: (province: { id: string; name: string }) => void;
  onProvinceMouseLeave?: () => void;
  hoveredProvinceName?: string | null;
  hoveredProvinceId?: string | null;
  selectedProvinceName?: string | null;
  selectedProvinceId?: string | null;
  selectedProvince?: string | null;
  selectedRegionProvinceIds?: string[] | null;
  isProvinceInSelectedRegion?: (id: string, name: string) => boolean;
  isProvinceInHoveredRegion?: (id: string, name: string) => boolean;
  hoveredRegionKey?: string | null;
  pins?: ThailandMapPin[];
  onPinClick?: (pin: ThailandMapPin) => void;
  regionalScoreDialogs?: RegionalScoreDialogItem[];
  dialogVariant?: 'full' | 'compact-smiley-arrow';
  onRegionalDialogClick?: (regionKey: string) => void;
  onRegionalDialogMouseEnter?: (regionKey: string, item?: RegionalScoreDialogItem, coords?: { cx: number; cy: number }, event?: React.MouseEvent) => void;
  onRegionalDialogMouseLeave?: () => void;
  onRegionalDialogHoverItem?: (item: RegionalScoreDialogItem | null, coords?: { cx: number; cy: number }, event?: React.MouseEvent) => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  height?: string | number;
  scale?: number;
  translateX?: string | number;
  translateY?: string | number;
}

export const THAILAND_PROVINCE_SVG_CENTROIDS: Record<string, [number, number]> = {
  // กรุงเทพและปริมณฑล / ภาคกลาง
  'กรุงเทพมหานคร': [222, 473],
  'กรุงเทพ': [222, 473],
  'Bangkok': [222, 473],
  'สมุทรปราการ': [227, 482],
  'นนทบุรี': [207, 456],
  'ปทุมธานี': [223, 447],
  'พระนครศรีอยุธยา': [215, 427],
  'อยุธยา': [215, 427],
  'อ่างทอง': [203, 411],
  'ลพบุรี': [241, 377],
  'สิงห์บุรี': [202, 391],
  'ชัยนาท': [182, 374],
  'สระบุรี': [248, 409],
  'ชลบุรี': [265, 516],
  'ระยอง': [274, 532],
  'จันทบุรี': [322, 535],
  'ตราด': [353, 580],
  'ฉะเชิงเทรา': [275, 483],
  'ปราจีนบุรี': [289, 452],
  'นครนายก': [261, 438],
  'สระแก้ว': [341, 474],

  // ภาคตะวันออกเฉียงเหนือ (อีสาน)
  'นครราชสีมา': [321, 387],
  'โคราช': [321, 387],
  'บุรีรัมย์': [379, 387],
  'สุรินทร์': [421, 391],
  'ศรีสะเกษ': [476, 388],
  'อุบลราชธานี': [517, 374],
  'ยโสธร': [477, 328],
  'ชัยภูมิ': [307, 314],
  'อำนาจเจริญ': [499, 322],
  'บึงกาฬ': [430, 168],
  'หนองบัวลำภู': [336, 230],
  'ขอนแก่น': [346, 290],
  'อุดรธานี': [371, 214],
  'เลย': [280, 211],
  'หนองคาย': [364, 179],
  'มหาสารคาม': [393, 314],
  'ร้อยเอ็ด': [436, 319],
  'กาฬสินธุ์': [427, 270],
  'สกลนคร': [438, 215],
  'นครพนม': [475, 217],
  'มุกดาหาร': [484, 277],

  // ภาคเหนือ
  'เชียงใหม่': [98, 125],
  'ลำพูน': [111, 170],
  'ลำปาง': [146, 153],
  'อุตรดิตถ์': [216, 191],
  'แพร่': [177, 156],
  'น่าน': [236, 110],
  'พะเยา': [190, 85],
  'เชียงราย': [174, 52],
  'แม่ฮ่องสอน': [44, 124],

  // ภาคกลาง / เหนือตอนล่าง
  'นครสวรรค์': [177, 341],
  'อุทัยธานี': [149, 359],
  'กำแพงเพชร': [147, 289],
  'ตาก': [85, 278],
  'สุโขทัย': [160, 228],
  'พิษณุโลก': [212, 243],
  'พิจิตร': [205, 296],
  'เพชรบูรณ์': [261, 299],
  'สุพรรณบุรี': [165, 414],
  'นครปฐม': [185, 459],
  'สมุทรสาคร': [194, 483],
  'สมุทรสงคราม': [177, 497],

  // ภาคตะวันตก
  'ราชบุรี': [153, 485],
  'กาญจนบุรี': [114, 406],
  'เพชรบุรี': [152, 527],
  'ประจวบคีรีขันธ์': [151, 605],

  // ภาคใต้
  'นครศรีธรรมราช': [165, 824],
  'กระบี่': [113, 859],
  'พังงา': [75, 822],
  'ภูเก็ต': [68, 865],
  'สุราษฎร์ธานี': [130, 781],
  'ระนอง': [90, 725],
  'ชุมพร': [117, 706],
  'สงขลา': [219, 923],
  'สตูล': [158, 947],
  'ตรัง': [154, 894],
  'พัทลุง': [185, 898],
  'ปัตตานี': [272, 948],
  'ยะลา': [262, 988],
  'นราธิวาส': [296, 986]
};

export const getPinCoordinates = (pin: ThailandMapPin, index: number): [number, number] => {
  let baseCoords: [number, number] | undefined;
  if (pin.province && THAILAND_PROVINCE_SVG_CENTROIDS[pin.province]) {
    baseCoords = THAILAND_PROVINCE_SVG_CENTROIDS[pin.province];
  } else if (pin.province) {
    const cleanProv = pin.province.replace(/^(จ\.|จังหวัด)/, '').trim();
    for (const [key, coords] of Object.entries(THAILAND_PROVINCE_SVG_CENTROIDS)) {
      if (cleanProv.includes(key) || key.includes(cleanProv)) {
        baseCoords = coords;
        break;
      }
    }
  }

  if (baseCoords) {
    if ((pin as any).exactCentroid) {
      return [baseCoords[0], baseCoords[1]];
    }
    // Apply slight deterministic spread if multiple pins share the same province
    const offsetX = ((index * 13) % 25) - 12;
    const offsetY = ((index * 17) % 25) - 12;
    return [baseCoords[0] + offsetX, baseCoords[1] + offsetY];
  }

  // Fallback: geographic projection into SVG 560x1025 viewBox
  const cx = 50 + ((pin.lng - 97.3) / 8.4) * 460;
  const cy = 30 + ((20.5 - pin.lat) / 14.9) * 940;
  return [Math.round(cx), Math.round(cy)];
};

export const getRegionalDialogCoordinates = (key: string): [number, number] => {
  const lower = (key || '').toLowerCase();

  // 1. 8 Strategic Zones explicit coordinates (ครอบคลุมทั้ง code, ชื่อภาษาไทย, และภาษาอังกฤษ)
  if (lower === 'nc' || lower.includes('เหนือบน') || lower.includes('crown')) return [145, 130];
  if (lower === 'nh' || lower.includes('เหนือล่าง') || lower.includes('highlands')) return [145, 230];
  if (lower === 'cb' || lower.includes('กลางบน') || lower.includes('basin')) return [195, 345];
  if (lower === 'cc' || lower.includes('กทม') || lower.includes('กรุงเทพ') || lower.includes('capital')) return [230, 420];
  if (lower === 'ip' || lower.includes('อีสาน') || lower.includes('ตะวันออกเฉียงเหนือ') || lower.includes('northeast') || lower.includes('isan')) return [375, 270];
  if (lower === 'wh' || lower.includes('ตะวันตก') || lower.includes('west')) return [115, 485];
  if (lower === 'ed' || lower.includes('ตะวันออก') || lower.includes('east')) return [330, 520];
  if (lower === 'sc' || lower.includes('ใต้') || lower.includes('south')) return [155, 780];

  // 2. Standard 6 Regions fallback
  if ((lower.includes('north') && !lower.includes('east')) || lower.includes('เหนือ')) return [142, 145];
  if (lower.includes('northeast') || lower.includes('isan') || lower.includes('อีสาน') || lower.includes('ตะวันออกเฉียงเหนือ')) return [385, 290];
  if (lower.includes('central') || lower.includes('กลาง')) return [225, 380];
  if (lower.includes('west') || lower.includes('ตะวันตก')) return [110, 445];
  if (lower.includes('east') || lower.includes('ตะวันออก')) return [315, 515];
  if (lower.includes('south') || lower.includes('ใต้')) return [150, 790];
  return [250, 380];
};

/**
 * รายชื่อจังหวัดที่ตั้งอยู่ใต้หรือติดกับ 3D Regional Dialog ของแต่ละภูมิภาค
 * เมื่อเมาส์ Hover บนจังหวัดเหล่านี้ ตัว Dialog Score ของภาคนั้นจะซ่อน (Fade Out) อัตโนมัติ
 */
export const REGION_DIALOG_OVERLAPPING_PROVINCES: Record<string, string[]> = {
  Central: ['lri', 'sbr', 'atg', 'cnt', 'sri', 'aya', 'nsn', 'uti', 'pte', 'nbi', 'bkk'],
  West: ['kri', 'rbr', 'spb', 'tak'],
  North: ['lpg', 'cmi', 'lpn', 'pre', 'pyo', 'cri'],
  Northeast: ['mkm', 'kkn', 'ksn', 'ret', 'udn', 'snk'],
  East: ['cti', 'ryg', 'skw', 'cbi', 'cco', 'pri'],
  South: ['sni', 'nrt', 'kbi', 'pna', 'cpn']
};

/**
 * Helper to estimate rendered text width for SVG Kanit font accurately,
 * taking into account Thai zero-width combining vowels and tone marks.
 */
export const estimateSvgTextWidth = (str: string, fontSize: number, isBold: boolean = false): number => {
  if (!str) return 0;
  // Combining marks (สระบน สระล่าง วรรณยุกต์ การันต์) take zero horizontal width
  const combiningCount = (str.match(/[ัิ-ฺ็-๎]/g) || []).length;
  const effectiveLen = Math.max(1, str.length - combiningCount);
  const factor = isBold ? 0.65 : 0.58;
  return Math.round(effectiveLen * fontSize * factor);
};

export const isProvinceOverlappingRegionalDialog = (
  regionKey: string,
  provId?: string | null,
  provName?: string | null
): boolean => {
  if (!provId && !provName) return false;
  const cleanId = (provId || '').toLowerCase().trim();
  const cleanName = (provName || '').trim();

  // 1. ตรวจจับโดยตรงตามรหัสจังหวัดที่แมปไว้
  for (const [key, provIds] of Object.entries(REGION_DIALOG_OVERLAPPING_PROVINCES)) {
    const lowerKey = key.toLowerCase();
    const targetKey = regionKey.toLowerCase();
    if (targetKey.includes(lowerKey) || lowerKey.includes(targetKey)) {
      if (cleanId && provIds.includes(cleanId)) return true;
    }
  }

  // 2. ตรวจสอบตามระยะห่างทางกายภาพ (Proximity Threshold: Northeast 92px เนื่องจากขยายการ์ดซ้าย-ขวา, ภาคอื่น 75px)
  if (cleanName && THAILAND_PROVINCE_SVG_CENTROIDS[cleanName]) {
    const [px, py] = THAILAND_PROVINCE_SVG_CENTROIDS[cleanName];
    const [cx, cy] = getRegionalDialogCoordinates(regionKey);
    const dist = Math.hypot(px - cx, py - cy);
    const isNe = regionKey.toLowerCase().includes('northeast') || regionKey.includes('อีสาน') || regionKey.includes('ตะวันออกเฉียงเหนือ');
    const threshold = isNe ? 92 : 75;
    if (dist <= threshold) return true;
  }

  return false;
};

export const Thailand3dShadedMap: React.FC<Thailand3dShadedMapProps> = ({
  getProvinceFill,
  onProvinceClick,
  onProvinceMouseEnter,
  onProvinceMouseLeave,
  hoveredProvinceName,
  hoveredProvinceId,
  selectedProvinceName,
  selectedProvinceId,
  selectedRegionProvinceIds,
  isProvinceInSelectedRegion,
  isProvinceInHoveredRegion,
  hoveredRegionKey,
  pins,
  onPinClick,
  regionalScoreDialogs,
  dialogVariant = 'full',
  onRegionalDialogClick,
  onRegionalDialogMouseEnter,
  onRegionalDialogMouseLeave,
  onRegionalDialogHoverItem,
  children,
  className = '',
  style,
  height,
  scale = 1.05,
  translateX,
  translateY
}) => {
  const [hoverTooltip, setHoverTooltip] = useState<{
    id?: string;
    name: string;
    x: number;
    y: number;
  } | null>(null);

  const activeHoveredId = (hoveredProvinceId || hoverTooltip?.id || '').toLowerCase();
  const activeHoveredName = hoveredProvinceName || hoverTooltip?.name || '';

  const selectedRegionLocations = React.useMemo(() => {
    if (selectedRegionProvinceIds && selectedRegionProvinceIds.length > 0) {
      const idSet = new Set(selectedRegionProvinceIds.map(x => x.toLowerCase()));
      return thailandMapData.locations.filter((loc: { id: string }) => idSet.has(loc.id.toLowerCase()));
    }
    if (isProvinceInSelectedRegion) {
      return thailandMapData.locations.filter((loc: { id: string; name: string }) => {
        const thName = getProvinceThaiName(loc.id, loc.name);
        return isProvinceInSelectedRegion(loc.id, thName);
      });
    }
    return [];
  }, [selectedRegionProvinceIds, isProvinceInSelectedRegion]);

  const activeHoveredRegionKey = React.useMemo(() => {
    if (hoveredRegionKey) return hoveredRegionKey;
    if (activeHoveredId) return getMdcRegionKey(activeHoveredId);
    return null;
  }, [hoveredRegionKey, activeHoveredId]);

  const hoveredRegionLocations = React.useMemo(() => {
    if (isProvinceInHoveredRegion) {
      return (thailandMapData.locations || []).filter((loc: { id: string; name: string }) => {
        const thName = getProvinceThaiName(loc.id, loc.name);
        return isProvinceInHoveredRegion(loc.id, thName);
      });
    }
    if (activeHoveredRegionKey) {
      return (thailandMapData.locations || []).filter((loc: { id: string }) => {
        return getMdcRegionKey(loc.id) === activeHoveredRegionKey;
      });
    }
    return [];
  }, [isProvinceInHoveredRegion, activeHoveredRegionKey]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: height || '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    ...style
  };

  const formattedTranslateX = typeof translateX === 'number' ? `${translateX}px` : translateX;
  const formattedTranslateY = typeof translateY === 'number' ? `${translateY}px` : translateY;

  const transformParts = [];
  if (formattedTranslateX || formattedTranslateY) {
    transformParts.push(`translate(${formattedTranslateX || '0px'}, ${formattedTranslateY || '0px'})`);
  }
  if (scale !== undefined) {
    transformParts.push(`scale(${scale})`);
  }

  const svgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    maxHeight: typeof height === 'number' ? `${height}px` : (height || '720px'),
    overflow: 'visible',
    pointerEvents: 'none',
    transform: transformParts.length > 0 ? transformParts.join(' ') : undefined,
    transformOrigin: '48% 48%',
    transition: 'transform 0.25s ease'
  };

  return (
    <div id="mapThailand" className={`moral-thailand-svg-wrap map-area map-chart ${className}`} style={containerStyle}>
      <svg
        id="mapSvgElement"
        viewBox={thailandMapData.viewBox || '0 0 500 800'}
        xmlns="http://www.w3.org/2000/svg"
        style={svgStyle}
      >
        <defs>
          {/* Deep 3D Floor Shadow */}
          <filter id="thailand3dFloorShadow" x="-30%" y="-15%" width="160%" height="160%">
            <feDropShadow dx="8" dy="28" stdDeviation="16" floodColor="#1e3a8a" floodOpacity="0.4" />
          </filter>

          {/* Subtle Coordinate Grid Texture (matches reference image) */}
          <pattern id="mapSubtleGrid" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M 14 0 L 0 0 0 14" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.38" />
          </pattern>

          {/* Top-to-Bottom Ambient Lighting Gradient */}
          <linearGradient id="mapAmbientLight" x1="0%" y1="0%" x2="40%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.12" />
          </linearGradient>

          {/* White Outer Boundary Frame with 3D Bevel Shadow for Selected Region (มิติ 3D เพิ่มขึ้น 20%) */}
          <filter id="regionalWhiteOuterBorder" x="-30%" y="-30%" width="160%" height="160%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="1.8" result="dilated" />
            <feComposite in="dilated" in2="SourceAlpha" operator="out" result="outerRim" />
            <feFlood floodColor="#ffffff" floodOpacity="1" result="whiteColor" />
            <feComposite in="whiteColor" in2="outerRim" operator="in" result="whiteOuterRim" />
            <feDropShadow dx="1.5" dy="3.0" stdDeviation="2.0" floodColor="#0f172a" floodOpacity="0.85" />
          </filter>

          {/* Luminous Outer Perimeter Frame for Hovered Region (โครงสร้างกรอบภูมิภาคเมื่อ Hover) */}
          <filter id="regionalHoverOuterBorder" x="-30%" y="-30%" width="160%" height="160%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="2.4" result="dilated" />
            <feComposite in="dilated" in2="SourceAlpha" operator="out" result="outerRim" />
            <feFlood floodColor="#ffffff" floodOpacity="1" result="whiteColor" />
            <feComposite in="whiteColor" in2="outerRim" operator="in" result="whiteOuterRim" />
            <feDropShadow dx="0" dy="2.0" stdDeviation="2.8" floodColor="#2563eb" floodOpacity="0.85" />
          </filter>

          {/* 3D Regional Dialog Gradients & Filters */}
          <linearGradient id="dialog3dWhiteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          <linearGradient id="dialog3dBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="dialog3dOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c2410c" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.98" />
          </linearGradient>

          <radialGradient id="dialogHotspotGlowBlue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#0284c7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="dialogHotspotGlowOrange" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.98" />
            <stop offset="45%" stopColor="#f97316" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </radialGradient>

          <filter id="dialog3dCardShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4.5" floodColor="#0f172a" floodOpacity="0.22" />
          </filter>

          <filter id="dialogChevronShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
        </defs>

        <g filter="url(#thailand3dFloorShadow)">
          {/* Layer 1: 3D Extrusion Side Wall (shifted down 7px to create 3D block thickness) */}
          <g transform="translate(1.5, 7)">
            {thailandMapData.locations.map((loc: { id: string; path: string }) => (
              <path
                key={`ext-${loc.id}`}
                d={loc.path}
                className="moral-map-extrusion-path"
              />
            ))}
          </g>

          {/* Layer 2: White Bevel Perimeter Rim (crisp raised white contour) */}
          <g>
            {thailandMapData.locations.map((loc: { id: string; path: string }) => (
              <path
                key={`rim-${loc.id}`}
                d={loc.path}
                className="moral-map-bevel-rim"
              />
            ))}
          </g>

          {/* Layer 3: Main Province Paths with Dynamic Fills */}
          <g>
            {thailandMapData.locations.map((loc: { id: string; name: string; path: string }) => {
              const thName = getProvinceThaiName(loc.id, loc.name);

              const isHovered = (hoveredProvinceId && loc.id.toLowerCase() === hoveredProvinceId.toLowerCase()) ||
                (hoveredProvinceName && (
                  loc.name.toLowerCase() === hoveredProvinceName.toLowerCase() ||
                  loc.id.toLowerCase() === hoveredProvinceName.toLowerCase() ||
                  thName.toLowerCase() === hoveredProvinceName.toLowerCase() ||
                  loc.name.includes(hoveredProvinceName) ||
                  hoveredProvinceName.includes(loc.name) ||
                  thName.includes(hoveredProvinceName) ||
                  hoveredProvinceName.includes(thName)
                ));
              const isRegionSelected = Boolean(isProvinceInSelectedRegion && isProvinceInSelectedRegion(loc.id, thName));
              const isSelected = (selectedProvinceId && loc.id.toLowerCase() === selectedProvinceId.toLowerCase()) ||
                (selectedProvinceName && (
                  loc.name.toLowerCase() === selectedProvinceName.toLowerCase() ||
                  loc.id.toLowerCase() === selectedProvinceName.toLowerCase() ||
                  thName.toLowerCase() === selectedProvinceName.toLowerCase() ||
                  loc.name.includes(selectedProvinceName) ||
                  selectedProvinceName.includes(loc.name) ||
                  thName.includes(selectedProvinceName) ||
                  selectedProvinceName.includes(thName)
                )) ||
                isRegionSelected;

              let fillColor: string;
              if (isSelected) {
                fillColor = '#f59e0b'; // Gold highlight when selected
              } else if (getProvinceFill) {
                fillColor = getProvinceFill(loc.id, thName);
              } else if (isHovered) {
                fillColor = '#1d4ed8'; // Deep cobalt hover
              } else {
                fillColor = getDefaultProvinceBlue(loc.id, thName);
              }

              return (
                <path
                  key={loc.id}
                  d={loc.path}
                  className={`moral-map-province-path highcharts-point ${isSelected ? 'regionActive active' : 'noActive'} ${isHovered ? 'onOverProvince onOver' : ''}`}
                  fill={fillColor}
                  stroke={isSelected ? '#ffffff' : '#487cb7'}
                  strokeWidth={isSelected ? 1.8 : 0.8}
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.9))' : undefined,
                    transition: 'all 0.18s ease',
                    cursor: 'pointer',
                    pointerEvents: 'auto'
                  }}
                  onMouseEnter={(e) => {
                    setHoverTooltip({
                      id: loc.id,
                      name: thName,
                      x: e.clientX,
                      y: e.clientY
                    });
                    if (onProvinceMouseEnter) {
                      onProvinceMouseEnter({ id: loc.id, name: thName });
                    }
                  }}
                  onMouseMove={(e) => {
                    setHoverTooltip((prev) =>
                      prev ? { ...prev, id: loc.id, x: e.clientX, y: e.clientY } : { id: loc.id, name: thName, x: e.clientX, y: e.clientY }
                    );
                  }}
                  onMouseLeave={() => {
                    setHoverTooltip(null);
                    if (onProvinceMouseLeave) {
                      onProvinceMouseLeave();
                    }
                  }}
                  onClick={() => {
                    if (onProvinceClick) {
                      onProvinceClick({ id: loc.id, name: thName });
                    }
                  }}
                >
                  <title>{thName}</title>
                </path>
              );
            })}
          </g>

          {/* Layer 4: Coordinate Grid Pattern Overlay */}
          <g style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }}>
            {thailandMapData.locations.map((loc: { id: string; path: string }) => (
              <path
                key={`grid-${loc.id}`}
                d={loc.path}
                fill="url(#mapSubtleGrid)"
              />
            ))}
          </g>

          {/* Layer 5: Ambient Lighting Layer */}
          <g style={{ pointerEvents: 'none', mixBlendMode: 'soft-light' }}>
            {thailandMapData.locations.map((loc: { id: string; path: string }) => (
              <path
                key={`light-${loc.id}`}
                d={loc.path}
                fill="url(#mapAmbientLight)"
              />
            ))}
          </g>

          {/* Layer 5.5: 3D Elevated Region Structure & Regional Perimeter Frame (แสดงกรอบเป็นโครงสร้างตามภูมิภาคเมื่อ hover หรือ select) */}
          {(() => {
            const itemsToRender: { locations: any[]; isHover: boolean; key: string }[] = [];

            if (selectedRegionLocations.length > 0) {
              const isSameAsHover = hoveredRegionLocations.length > 0 && 
                selectedRegionLocations.length === hoveredRegionLocations.length &&
                selectedRegionLocations[0]?.id === hoveredRegionLocations[0]?.id;
              if (!isSameAsHover) {
                itemsToRender.push({
                  locations: selectedRegionLocations,
                  isHover: false,
                  key: 'selected-region-frame'
                });
              }
            }

            if (hoveredRegionLocations.length > 0) {
              itemsToRender.push({
                locations: hoveredRegionLocations,
                isHover: true,
                key: 'hovered-region-frame'
              });
            }

            if (itemsToRender.length === 0) return null;

            return (
              <g style={{ pointerEvents: 'none' }}>
                {itemsToRender.map(({ locations, isHover, key }) => (
                  <g key={key} style={{ transition: 'all 0.22s ease' }}>
                    {/* 1. Cast Shadow under the Elevated Region */}
                    <g
                      transform="translate(1.4, 4.4)"
                      style={{ opacity: isHover ? 0.65 : 0.55, filter: 'blur(2.2px)' }}
                    >
                      {locations.map((loc: { id: string; path: string }) => (
                        <path
                          key={`elev-shadow-${key}-${loc.id}`}
                          d={loc.path}
                          fill="#0f172a"
                          stroke="#0f172a"
                          strokeWidth="2.0"
                          strokeLinejoin="round"
                        />
                      ))}
                    </g>

                    {/* 2. 3D Extrusion Side Wall of the Elevated Region */}
                    <g transform="translate(0.8, 2.4)">
                      {locations.map((loc: { id: string; path: string }) => (
                        <path
                          key={`elev-wall-${key}-${loc.id}`}
                          d={loc.path}
                          fill={isHover ? '#1d4ed8' : (key === 'selected-region-frame' ? '#b45309' : '#1e3a8a')}
                          stroke={isHover ? '#1d4ed8' : (key === 'selected-region-frame' ? '#b45309' : '#1e3a8a')}
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                          opacity={0.82}
                        />
                      ))}
                    </g>

                    {/* 3. Elevated Top Surface with Structural Perimeter Frame */}
                    <g transform="translate(-0.5, -2.2)">
                      {locations.map((loc: { id: string; name: string; path: string }) => {
                        const thName = getProvinceThaiName(loc.id, loc.name);
                        const isThisProvinceHovered = loc.id.toLowerCase() === activeHoveredId;
                        const isSelectedRegionItem = key === 'selected-region-frame';
                        const fillColor = isSelectedRegionItem
                          ? (isThisProvinceHovered ? '#fbbf24' : '#f59e0b')
                          : (getProvinceFill
                              ? getProvinceFill(loc.id, thName)
                              : getDefaultProvinceBlue(loc.id, thName));
                        return (
                          <path
                            key={`elev-surface-${key}-${loc.id}`}
                            d={loc.path}
                            fill={fillColor}
                            stroke={isThisProvinceHovered ? '#ffffff' : (isHover ? '#ffffff' : (isSelectedRegionItem ? '#ffffff' : fillColor))}
                            strokeWidth={isThisProvinceHovered ? 1.8 : (isHover ? 1.0 : (isSelectedRegionItem ? 1.2 : 0.8))}
                            strokeLinejoin="round"
                          />
                        );
                      })}

                      {/* Subtle Grid Texture */}
                      {locations.map((loc: { id: string; path: string }) => (
                        <path
                          key={`elev-grid-${key}-${loc.id}`}
                          d={loc.path}
                          fill="url(#mapSubtleGrid)"
                          style={{ mixBlendMode: 'overlay' }}
                        />
                      ))}

                      {/* Top Ambient Light */}
                      {locations.map((loc: { id: string; path: string }) => (
                        <path
                          key={`elev-light-${key}-${loc.id}`}
                          d={loc.path}
                          fill="url(#mapAmbientLight)"
                          style={{ mixBlendMode: 'soft-light', opacity: isHover ? 0.9 : 0.8 }}
                        />
                      ))}

                      {/* 4. Structural Regional Perimeter Frame with 3D Bevel Shadow */}
                      <g filter={isHover ? 'url(#regionalHoverOuterBorder)' : 'url(#regionalWhiteOuterBorder)'}>
                        {locations.map((loc: { id: string; path: string }) => (
                          <path
                            key={`white-outer-${key}-${loc.id}`}
                            d={loc.path}
                            fill="#ffffff"
                            stroke="#ffffff"
                            strokeWidth={isHover ? 2.4 : 1.8}
                            strokeLinejoin="round"
                          />
                        ))}
                      </g>
                    </g>
                  </g>
                ))}
              </g>
            );
          })()}

          {/* Layer 6: Optional Pins Layer (e.g. for View 3.2) */}
          {pins && pins.length > 0 && (
            <g>
              {pins.map((pin, i) => {
                const [cx, cy] = getPinCoordinates(pin, i);

                const catColor =
                  (pin as any).pinColor ||
                  (pin.category === 'model-community' || pin.category === 'gold' ? '#f59e0b' :
                   pin.category === 'learning-yolwithi' || pin.category === 'cyan' || pin.category === 'blue' ? '#0284c7' :
                   pin.category === 'city' ? '#2563eb' :
                   pin.category === 'award' ? '#7c3aed' :
                   pin.category === 'org' ? '#3b82f6' :
                   pin.category === 'learning' ? '#10b981' :
                   '#8b5cf6');

                return (
                  <g
                    key={pin.id}
                    transform={`translate(${cx}, ${cy})`}
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                    onMouseEnter={() => {
                      if (onProvinceMouseEnter && pin.province) {
                        onProvinceMouseEnter({ id: pin.id, name: pin.province });
                      }
                    }}
                    onMouseLeave={() => {
                      if (onProvinceMouseLeave) {
                        onProvinceMouseLeave();
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPinClick) onPinClick(pin);
                    }}
                  >
                    <title>{`${pin.name} (จ.${pin.province || ''}) - ${pin.bestPracticeTitle || pin.highlight || ''}`}</title>
                    <circle cx="0" cy="0" r="14" fill={catColor} fillOpacity="0.28" className="pin-pulse" />
                    <circle cx="0" cy="0" r="8.5" fill={catColor} stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.4))" />
                    <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                      {(pin as any).shortCode || i + 1}
                    </text>
                    {(pin as any).badgeLabel && (() => {
                      const labelStr = String((pin as any).badgeLabel);
                      const pillWidth = Math.max(76, Math.min(132, labelStr.length * 5.2 + 16));
                      return (
                        <g transform={`translate(0, ${(pin as any).labelOffsetY ?? -18})`}>
                          <rect
                            x={-pillWidth / 2}
                            y={-9}
                            width={pillWidth}
                            height={16}
                            rx={5}
                            fill="rgba(15, 23, 42, 0.92)"
                            stroke={catColor}
                            strokeWidth="1.1"
                          />
                          <text
                            x="0"
                            y="2"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="8.5"
                            fontWeight="700"
                          >
                            {labelStr}
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                );
              })}
            </g>
          )}

          {/* Layer 7: 3D Regional Score Dialogs (รูปแบบ dialog 3D ตามตัวอย่างอ้างอิง) */}
          {regionalScoreDialogs && regionalScoreDialogs.length > 0 && (
            <g className="moral-regional-3d-dialogs">
              {regionalScoreDialogs.map((item, idx) => {
                const [cx, cy] = getRegionalDialogCoordinates(item.regionKey || item.name || '');
                const isSelected = Boolean(item.isSelected);
                const isUnderlyingHovered = isProvinceOverlappingRegionalDialog(
                  item.regionKey || item.name,
                  activeHoveredId,
                  activeHoveredName
                );
                const scoreText = typeof item.score === 'number' ? item.score.toFixed(2) : item.score;
                const numScore = typeof item.score === 'number' ? item.score : parseFloat(String(item.score));
                
                // Color based on Moral Center 5 Tiers (Highest Green #92c784, Lowest Purple #ae7bb7)
                const scoreColor = item.color || (
                  !isNaN(numScore)
                    ? (numScore > 5.41 ? '#92c784' : numScore >= 4.86 ? '#facc15' : numScore >= 4.30 ? '#edb75f' : numScore >= 3.75 ? '#e57f6a' : '#ae7bb7')
                    : '#edb75f'
                );

                const nameStr = String(item.name || '');
                const scoreStr = String(scoreText || '');
                const tierStr = String(item.tier || '');

                const hasTrend = item.trend === 'up' || item.trend === 'down' || item.trend === 'same';

                // 1. คำนวณความกว้าง Score Pill ให้พอดีกับตัวเลข/ข้อความคะแนน (Font 15px)
                const scoreTextWidth = estimateSvgTextWidth(scoreStr, 15, true);
                const scorePillWidth = Math.max(48, scoreTextWidth + 18);

                // 2. คำนวณตำแหน่งและขอบเขตข้อความ Tier ในบรรทัดที่ 2 (Font 15px)
                const tierTextWidth = tierStr ? estimateSvgTextWidth(tierStr, 15, false) : 0;
                const line2Width = scorePillWidth + (tierStr ? 10 + tierTextWidth : 0);

                // 3. คำนวณความยาวชื่อภูมิภาค บรรทัดที่ 1 (Font 17px)
                const nameTextWidth = estimateSvgTextWidth(nameStr, 17, true);

                // 4. ขยาย Card Frame อัตโนมัติให้ครอบคลุม Text ทั้งหมด ไม่ให้ข้อความทะลุ Frame หรือทับไอคอนลูกศร
                const maxContentWidth = Math.max(nameTextWidth, line2Width);
                const leftPadding = 48; // icon radius 16 + spacing
                const rightPadding = (hasTrend ? 42 : 18) + 16; // trend arrow circle (r=13) + buffer
                const minCardWidth = hasTrend ? 240 : 190;
                const cardWidth = Math.max(minCardWidth, leftPadding + maxContentWidth + rightPadding);

                // 5. จัดวางตำแหน่ง Card ให้อยู่ในขอบเขตแผนที่ SVG เสมอ ไม่หลุดขอบขวาหรือขอบซ้าย
                let cardStartX = cx - 80;
                if (cardStartX + cardWidth > 560) {
                  cardStartX = Math.max(10, 560 - cardWidth);
                }
                if (cardStartX < 10) {
                  cardStartX = 10;
                }

                const iconX = cardStartX + 24;
                const iconY = cy - 52;
                const textStartX = cardStartX + leftPadding;
                const tierStartX = textStartX + scorePillWidth + 10;
                const arrowX = cardStartX + cardWidth - 20;
                const arrowY = cy - 52;

                const emotion = item.emotion || (
                  numScore > 5.41 ? 'very-happy' :
                  numScore >= 4.86 ? 'happy' :
                  numScore >= 4.30 ? 'neutral' : 'sad'
                );

                // ============================================================
                // Compact Synergy Mode: Only Smiley Face Icon + Direction Arrow (No Region Name)
                // ============================================================
                if (dialogVariant === 'compact-smiley-arrow') {
                  const isPositive = item.trend === 'up' || item.correlationType === 'positive';
                  const isNegative = item.trend === 'down' || item.correlationType === 'negative';
                  
                  // Capsule dimensions
                  const capWidth = 72;
                  const capHeight = 36;
                  const capX = cx - capWidth / 2;
                  const capY = cy - 48;
                  const smileyX = cx - 18;
                  const smileyY = capY + capHeight / 2;
                  const arrowCircleX = cx + 18;
                  const arrowCircleY = capY + capHeight / 2;

                  const arrowBg = isPositive ? '#ecfdf5' : isNegative ? '#fef2f2' : '#fef3c7';
                  const arrowBorder = isPositive ? '#a7f3d0' : isNegative ? '#fecaca' : '#fde68a';
                  const arrowColor = isPositive ? '#059669' : isNegative ? '#dc2626' : '#d97706';

                  return (
                    <g
                      key={`dialog-${item.regionKey || 'reg'}-${idx}`}
                      data-region-pin={item.regionKey}
                      className={`moral-dialog-3d-pin moral-compact-pin ${isSelected ? 'is-selected' : ''}`}
                      style={{
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        opacity: 1,
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (onRegionalDialogMouseEnter) onRegionalDialogMouseEnter(item.regionKey, item, { cx, cy }, e);
                        if (onRegionalDialogHoverItem) onRegionalDialogHoverItem(item, { cx, cy }, e);
                      }}
                      onMouseLeave={() => {
                        if (onRegionalDialogMouseLeave) onRegionalDialogMouseLeave();
                        if (onRegionalDialogHoverItem) onRegionalDialogHoverItem(null);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRegionalDialogClick) onRegionalDialogClick(item.regionKey);
                      }}
                    >
                      <title>{`${item.name} (${item.tier}) | ศูนย์คุณธรรม: ${item.moralScoreFormatted || scoreText} | ภายนอก: ${item.externalMetricValue || ''}`}</title>

                      {/* 1. Ground Hotspot Glow */}
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx={isSelected ? 22 : 16}
                        ry={isSelected ? 8 : 5.5}
                        fill={isSelected ? 'url(#dialogHotspotGlowOrange)' : (isNegative ? 'rgba(239, 68, 68, 0.35)' : 'url(#dialogHotspotGlowBlue)')}
                        opacity={isSelected ? 0.95 : 0.65}
                      />

                      {/* 2. Pointer Pin */}
                      <path
                        d={`M ${cx - 6} ${cy - 14} L ${cx} ${cy - 2} L ${cx + 6} ${cy - 14} Z`}
                        fill="#ffffff"
                        stroke={isSelected ? '#f59e0b' : (isNegative ? '#fca5a5' : '#cbd5e1')}
                        strokeWidth={1.2}
                        filter="url(#dialogChevronShadow)"
                      />

                      {/* 3. Compact Capsule Pill: [ 😊 Smiley + ↗ Arrow ] (NO REGION NAME) */}
                      <g
                        transform={isSelected ? `translate(${cx}, ${cy - 30}) scale(1.08) translate(${-cx}, ${-(cy - 30)})` : undefined}
                        style={{ transition: 'transform 0.2s ease' }}
                      >
                        <rect
                          data-region-pill={item.regionKey}
                          x={capX}
                          y={capY}
                          width={capWidth}
                          height={capHeight}
                          rx={18}
                          ry={18}
                          fill="#ffffff"
                          stroke={isSelected ? '#f59e0b' : (item.badgeBorder || '#e2e8f0')}
                          strokeWidth={isSelected ? 2.2 : 1.4}
                          filter="url(#dialog3dCardShadow)"
                        />

                        {/* Left: Smiley Face Icon (r=12.5) */}
                        <circle
                          cx={smileyX}
                          cy={smileyY}
                          r={12.5}
                          fill={scoreColor}
                        />
                        {emotion === 'very-happy' ? (
                          <>
                            <path d={`M ${smileyX - 5} ${smileyY - 1.8} Q ${smileyX - 3.5} ${smileyY - 4.5} ${smileyX - 2} ${smileyY - 1.8}`} stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" fill="none" />
                            <path d={`M ${smileyX + 2} ${smileyY - 1.8} Q ${smileyX + 3.5} ${smileyY - 4.5} ${smileyX + 5} ${smileyY - 1.8}`} stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" fill="none" />
                            <path d={`M ${smileyX - 4} ${smileyY + 2.2} Q ${smileyX} ${smileyY + 6.2} ${smileyX + 4} ${smileyY + 2.2}`} stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" fill="none" />
                          </>
                        ) : emotion === 'happy' ? (
                          <>
                            <circle cx={smileyX - 3.5} cy={smileyY - 2.5} r={1.4} fill="#713f12" />
                            <circle cx={smileyX + 3.5} cy={smileyY - 2.5} r={1.4} fill="#713f12" />
                            <path d={`M ${smileyX - 4} ${smileyY + 1.8} Q ${smileyX} ${smileyY + 5.5} ${smileyX + 4} ${smileyY + 1.8}`} stroke="#713f12" strokeWidth={1.6} strokeLinecap="round" fill="none" />
                          </>
                        ) : emotion === 'neutral' ? (
                          <>
                            <circle cx={smileyX - 3.5} cy={smileyY - 2.5} r={1.4} fill="#ffffff" />
                            <circle cx={smileyX + 3.5} cy={smileyY - 2.5} r={1.4} fill="#ffffff" />
                            <line x1={smileyX - 3.5} y1={smileyY + 2.8} x2={smileyX + 3.5} y2={smileyY + 2.8} stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" />
                          </>
                        ) : emotion === 'sad' ? (
                          <>
                            <circle cx={smileyX - 3.5} cy={smileyY - 2.5} r={1.4} fill="#ffffff" />
                            <circle cx={smileyX + 3.5} cy={smileyY - 2.5} r={1.4} fill="#ffffff" />
                            <path d={`M ${smileyX - 4} ${smileyY + 4.5} Q ${smileyX} ${smileyY + 0.8} ${smileyX + 4} ${smileyY + 4.5}`} stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" fill="none" />
                          </>
                        ) : (
                          <>
                            <circle cx={smileyX - 3.5} cy={smileyY - 2.5} r={1.4} fill="#ffffff" />
                            <circle cx={smileyX + 3.5} cy={smileyY - 2.5} r={1.4} fill="#ffffff" />
                            <ellipse cx={smileyX} cy={smileyY + 3} rx={3} ry={1.8} fill="#ffffff" />
                          </>
                        )}

                        {/* Right: Trend Directional Arrow Icon (r=11) */}
                        <circle
                          cx={arrowCircleX}
                          cy={arrowCircleY}
                          r={11}
                          fill={arrowBg}
                          stroke={arrowBorder}
                          strokeWidth={1.2}
                        />
                        {isPositive ? (
                          <path
                            d={`M ${arrowCircleX - 3.5} ${arrowCircleY + 3.5} L ${arrowCircleX + 3.5} ${arrowCircleY - 3.5} M ${arrowCircleX} ${arrowCircleY - 3.5} L ${arrowCircleX + 3.5} ${arrowCircleY - 3.5} L ${arrowCircleX + 3.5} ${arrowCircleY}`}
                            stroke={arrowColor}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        ) : isNegative ? (
                          <path
                            d={`M ${arrowCircleX - 3.5} ${arrowCircleY - 3.5} L ${arrowCircleX + 3.5} ${arrowCircleY + 3.5} M ${arrowCircleX} ${arrowCircleY + 3.5} L ${arrowCircleX + 3.5} ${arrowCircleY + 3.5} L ${arrowCircleX + 3.5} ${arrowCircleY}`}
                            stroke={arrowColor}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        ) : (
                          <path
                            d={`M ${arrowCircleX - 4} ${arrowCircleY} L ${arrowCircleX + 4} ${arrowCircleY} M ${arrowCircleX + 1} ${arrowCircleY - 2.8} L ${arrowCircleX + 4} ${arrowCircleY} L ${arrowCircleX + 1} ${arrowCircleY + 2.8}`}
                            stroke={arrowColor}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        )}
                      </g>
                    </g>
                  );
                }

                // ============================================================
                // Standard Full Mode (Backward compatible for Policy Dashboards)
                // ============================================================

                return (
                  <g
                    key={`dialog-${item.regionKey || 'reg'}-${idx}`}
                    data-region-pin={item.regionKey}
                    className={`moral-dialog-3d-pin ${isSelected ? 'is-selected' : ''}`}
                    style={{
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      opacity: isUnderlyingHovered ? 0.35 : 1,
                      transform: isUnderlyingHovered
                        ? `translate(${cx}px, ${cy}px) scale(0.95) translate(${-cx}px, ${-cy}px)`
                        : undefined,
                      transition: 'opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1), transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      if (onRegionalDialogMouseEnter) onRegionalDialogMouseEnter(item.regionKey, item, { cx, cy }, e);
                      if (onRegionalDialogHoverItem) onRegionalDialogHoverItem(item, { cx, cy }, e);
                    }}
                    onMouseLeave={() => {
                      if (onRegionalDialogMouseLeave) onRegionalDialogMouseLeave();
                      if (onRegionalDialogHoverItem) onRegionalDialogHoverItem(null);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRegionalDialogClick) onRegionalDialogClick(item.regionKey);
                    }}
                  >
                    <title>{`${item.name}: ${scoreText} (${item.tier})${hasTrend ? ` | แนวโน้ม${item.trend === 'up' ? 'เพิ่มขึ้น ↑' : item.trend === 'down' ? 'ลดลง ↓' : 'คงที่ →'} เทียบปีก่อนหน้า` : ''}`}</title>

                    {/* 1. Ground Hotspot Glow (วงแสงเรืองสะท้อนบนพื้นแผนที่) */}
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={isSelected ? 26 : 18}
                      ry={isSelected ? 9 : 6.5}
                      fill={isSelected ? 'url(#dialogHotspotGlowOrange)' : (numScore < 4.30 ? 'rgba(239, 68, 68, 0.35)' : 'url(#dialogHotspotGlowBlue)')}
                      opacity={isSelected ? 0.9 : 0.65}
                    />

                    {/* 2. Pointer Pin (ชี้ลงที่จุดพิกัด) */}
                    <path
                      d={`M ${cx - 7} ${cy - 18} L ${cx} ${cy - 4} L ${cx + 7} ${cy - 18} Z`}
                      fill="#ffffff"
                      stroke={isSelected ? '#f59e0b' : (numScore < 4.30 ? '#ef4444' : '#cbd5e1')}
                      strokeWidth={1.2}
                      filter="url(#dialogChevronShadow)"
                    />

                    {/* 3. 3D Floating Dialog Badge Card (สีขาว สไตล์ตรงตามภาพอ้างอิง) */}
                    <g
                      transform={isSelected ? `translate(${cx}, ${cy - 52}) scale(1.05) translate(${-cx}, ${-(cy - 52)})` : undefined}
                      style={{ transition: 'transform 0.22s ease' }}
                    >
                      {/* Card Base (สีขาว ขอบมน เงาตกกระทบนุ่มนวล ขยายยาวและสูงขึ้นเพื่อรองรับฟอนต์ใหญ่ 30%) */}
                      <rect
                        x={cardStartX}
                        y={cy - 86}
                        width={cardWidth}
                        height={68}
                        rx={12}
                        ry={12}
                        fill="#ffffff"
                        stroke={isSelected ? '#f59e0b' : '#e2e8f0'}
                        strokeWidth={isSelected ? 2.2 : 1.2}
                        filter="url(#dialog3dCardShadow)"
                      />

                      {/* Left: วงกลมไอคอนแสดงอารมณ์ตามระดับคะแนน (Smiley Face Icon Circle) */}
                      <circle
                        cx={iconX}
                        cy={iconY}
                        r={16}
                        fill={scoreColor}
                      />
                      {/* ตาและปากตามอารมณ์มาตรฐานศูนย์คุณธรรม */}
                      {emotion === 'very-happy' ? (
                        <>
                          <path d={`M ${iconX - 7} ${iconY - 2.5} Q ${iconX - 5} ${iconY - 6} ${iconX - 3} ${iconY - 2.5}`} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" fill="none" />
                          <path d={`M ${iconX + 3} ${iconY - 2.5} Q ${iconX + 5} ${iconY - 6} ${iconX + 7} ${iconY - 2.5}`} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" fill="none" />
                          <path d={`M ${iconX - 5.5} ${iconY + 3} Q ${iconX} ${iconY + 8.5} ${iconX + 5.5} ${iconY + 3}`} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" fill="none" />
                        </>
                      ) : emotion === 'happy' ? (
                        <>
                          <circle cx={iconX - 4.8} cy={iconY - 3.5} r={1.8} fill="#713f12" />
                          <circle cx={iconX + 4.8} cy={iconY - 3.5} r={1.8} fill="#713f12" />
                          <path d={`M ${iconX - 5.5} ${iconY + 2.5} Q ${iconX} ${iconY + 7.5} ${iconX + 5.5} ${iconY + 2.5}`} stroke="#713f12" strokeWidth={2} strokeLinecap="round" fill="none" />
                        </>
                      ) : emotion === 'neutral' ? (
                        <>
                          <circle cx={iconX - 4.8} cy={iconY - 3.5} r={1.8} fill="#ffffff" />
                          <circle cx={iconX + 4.8} cy={iconY - 3.5} r={1.8} fill="#ffffff" />
                          <line x1={iconX - 5} y1={iconY + 4} x2={iconX + 5} y2={iconY + 4} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
                        </>
                      ) : emotion === 'sad' ? (
                        <>
                          <circle cx={iconX - 4.8} cy={iconY - 3.5} r={1.8} fill="#ffffff" />
                          <circle cx={iconX + 4.8} cy={iconY - 3.5} r={1.8} fill="#ffffff" />
                          <path d={`M ${iconX - 5.5} ${iconY + 6} Q ${iconX} ${iconY + 1} ${iconX + 5.5} ${iconY + 6}`} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" fill="none" />
                        </>
                      ) : (
                        <>
                          <circle cx={iconX - 4.8} cy={iconY - 3.5} r={1.8} fill="#ffffff" />
                          <circle cx={iconX + 4.8} cy={iconY - 3.5} r={1.8} fill="#ffffff" />
                          <ellipse cx={iconX} cy={iconY + 4} rx={4} ry={2.5} fill="#ffffff" />
                        </>
                      )}

                      {/* Right Line 1: Region Name (Font 17px) */}
                      <text
                        x={textStartX}
                        y={cy - 60}
                        textAnchor="start"
                        fill="#1e293b"
                        fontSize={17}
                        fontWeight="700"
                        fontFamily="'Kanit', sans-serif"
                      >
                        {item.name}
                      </text>

                      {/* Right Line 2: Score Pill (พื้นสีตามระดับ ตัวเลขสีขาว ยืดหยุ่นตามความยาวข้อความ, Font 15px) */}
                      <rect
                        x={textStartX}
                        y={cy - 48}
                        width={scorePillWidth}
                        height={24}
                        rx={5}
                        ry={5}
                        fill={scoreColor}
                      />
                      <text
                        x={textStartX + scorePillWidth / 2}
                        y={cy - 31}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={15}
                        fontWeight="800"
                        fontFamily="'Kanit', sans-serif"
                      >
                        {scoreText}
                      </text>

                      {/* Right Line 2: Tier Text (ต่อท้าย Score Pill พร้อมระยะห่างพอดี ไม่ทับซ้อน, Font 15px) */}
                      {tierStr && (
                        <text
                          x={tierStartX}
                          y={cy - 31}
                          textAnchor="start"
                          fill={numScore < 4.30 ? '#ef4444' : '#64748b'}
                          fontSize={15}
                          fontWeight="600"
                          fontFamily="'Kanit', sans-serif"
                        >
                          {item.tier}
                        </text>
                      )}

                      {/* Right End: Trend Indicator Arrow (แนวโน้มขึ้น/ลง เมื่อเทียบกับปีก่อนหน้า — ไม่แสดงสำหรับปี 2565) */}
                      {hasTrend && (
                        <g className="dialog-trend-arrow" style={{ pointerEvents: 'none' }}>
                          <title>
                            {item.trend === 'up'
                              ? `แนวโน้มคะแนนเพิ่มขึ้นเมื่อเทียบกับปีก่อนหน้า ${item.trendDiff !== undefined ? `(${item.trendDiff > 0 ? '+' : ''}${item.trendDiff.toFixed(2)})` : ''}`
                              : item.trend === 'down'
                              ? `แนวโน้มคะแนนลดลงเมื่อเทียบกับปีก่อนหน้า ${item.trendDiff !== undefined ? `(${item.trendDiff.toFixed(2)})` : ''}`
                              : 'คะแนนเท่าเดิมเมื่อเทียบกับปีก่อนหน้า'}
                          </title>
                          {/* Circular background pill for arrow */}
                          <circle
                            cx={arrowX}
                            cy={arrowY}
                            r={13}
                            fill={item.trend === 'up' ? '#dcfce7' : item.trend === 'down' ? '#fee2e2' : '#f1f5f9'}
                            stroke={item.trend === 'up' ? '#86efac' : item.trend === 'down' ? '#fca5a5' : '#cbd5e1'}
                            strokeWidth={1.2}
                          />
                          {/* Directional Arrow Path */}
                          {item.trend === 'up' ? (
                            <path
                              d={`M ${arrowX} ${arrowY + 6} L ${arrowX} ${arrowY - 5} M ${arrowX - 4.2} ${arrowY - 1} L ${arrowX} ${arrowY - 5.5} L ${arrowX + 4.2} ${arrowY - 1}`}
                              stroke="#16a34a"
                              strokeWidth={2.2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          ) : item.trend === 'down' ? (
                            <path
                              d={`M ${arrowX} ${arrowY - 6} L ${arrowX} ${arrowY + 5} M ${arrowX - 4.2} ${arrowY + 1} L ${arrowX} ${arrowY + 5.5} L ${arrowX + 4.2} ${arrowY + 1}`}
                              stroke="#dc2626"
                              strokeWidth={2.2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          ) : (
                            <path
                              d={`M ${arrowX - 5} ${arrowY} L ${arrowX + 5} ${arrowY}`}
                              stroke="#64748b"
                              strokeWidth={2.2}
                              strokeLinecap="round"
                              fill="none"
                            />
                          )}
                        </g>
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
          )}
        </g>
      </svg>

      {/* Floating Hover Tooltip with Thai Province Name */}
      {hoverTooltip && (
        <div
          className="moral-province-hover-badge"
          style={{
            position: 'fixed',
            left: `${hoverTooltip.x + 14}px`,
            top: `${hoverTooltip.y - 36}px`,
            pointerEvents: 'none',
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            lineHeight: 1.4,
            transform: hoverTooltip.x > (typeof window !== 'undefined' ? window.innerWidth - 140 : 800)
              ? 'translateX(-100%)'
              : 'none'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 6px #38bdf8'
            }}
          />
          <span>{hoverTooltip.name}</span>
        </div>
      )}

      {/* Floating Children (Donut Chart, Tooltips, Legends) */}
      {children}
    </div>
  );
};
