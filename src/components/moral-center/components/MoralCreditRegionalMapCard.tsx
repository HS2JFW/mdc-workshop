import React, { useState, useMemo } from 'react';
import {
  Users,
  Award,
  Sparkles,
  MapPin,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Layers,
  Heart,
  ShieldCheck,
  Target,
  Compass,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  Thailand3dShadedMap,
  THAILAND_PROVINCE_ID_TO_TH,
  type RegionalScoreDialogItem
} from './Thailand3dShadedMap';
import { PROVINCE_TO_MDC_REGION, getMdcRegionKey } from '../data/moralMdcSurveyData';
import {
  MORAL_CREDIT_PROVINCES_SUMMARY,
  MORAL_CREDIT_MEMBERS,
  MORAL_CREDIT_KPI_OVERVIEW,
  type MoralCreditProvinceStat
} from '../data/moralCreditData';

export type CreditMapTopicKey =
  | 'overview'            // 🌟 ภาพรวมทุกมิติ (รวมทุกคะแนน 9,229 แต้ม)
  | 'publicConsciousness' // 🤝 มิติจิตอาสา (3,902 แต้ม)
  | 'responsibility'      // 🎯 มิติวินัยรับผิดชอบ (2,591 แต้ม)
  | 'sufficiency'         // 🌱 มิติพอเพียง (993 แต้ม)
  | 'honesty'             // ⚖️ มิติสุจริต (287 แต้ม)
  | 'gratitude'           // 🙏 มิติกตัญญู (1,015 แต้ม)
  | 'topCategory'         // 🧩 คุณธรรมอันดับ 1 รายจังหวัด (Mosaic)
  | 'memberDensity';      // 👥 ความหนาแน่นของสมาชิก (275 สมาชิก)

export type CreditMapViewMode = 'province' | 'region';

interface CreditMapTopicConfig {
  key: CreditMapTopicKey;
  title: string;
  enTitle: string;
  icon: string;
  accentColor: string;
  nationalValue: string;
  unit: string;
  description: string;
  legendItems: { color: string; label: string }[];
}

const CATEGORY_META: Record<string, { color: string; label: string; icon: string; bg: string }> = {
  จิตอาสา: { color: '#2563eb', label: 'จิตอาสา', icon: '🤝', bg: '#eff6ff' },
  วินัย: { color: '#059669', label: 'วินัยรับผิดชอบ', icon: '🎯', bg: '#ecfdf5' },
  พอเพียง: { color: '#0891b2', label: 'พอเพียง', icon: '🌱', bg: '#ecfeff' },
  กตัญญู: { color: '#7c3aed', label: 'กตัญญู', icon: '🙏', bg: '#f5f3ff' },
  สุจริต: { color: '#d97706', label: 'สุจริต', icon: '⚖️', bg: '#fffbeb' },
  อื่นๆ: { color: '#dc2626', label: 'อื่นๆ/สถาบัน', icon: '🏛️', bg: '#fef2f2' }
};

const CREDIT_MAP_TOPICS: CreditMapTopicConfig[] = [
  {
    key: 'overview',
    title: 'ภาพรวมทุกมิติคุณธรรม',
    enTitle: 'Total Credit Score (All Dimensions)',
    icon: '🌟',
    accentColor: '#1e3a8a',
    nationalValue: `${MORAL_CREDIT_KPI_OVERVIEW.totalPoints.toLocaleString()} แต้ม (46 จว.)`,
    unit: 'แต้ม',
    description: 'คะแนนความดีสะสมรวมทุกมิติคุณธรรมทั่วประเทศ จัดระดับคะแนน 5 ขั้น',
    legendItems: [
      { color: '#1e3a8a', label: '>1,000 แต้ม' },
      { color: '#2563eb', label: '100–999 แต้ม' },
      { color: '#38bdf8', label: '30–99 แต้ม' },
      { color: '#93c5fd', label: '1–29 แต้ม' },
      { color: '#f1f5f9', label: '0 แต้ม' }
    ]
  },
  {
    key: 'publicConsciousness',
    title: 'มิติจิตอาสา',
    enTitle: 'Public Consciousness (Volunteer)',
    icon: '🤝',
    accentColor: '#2563eb',
    nationalValue: '3,902 แต้ม (102 คน • 26 จว.)',
    unit: 'แต้ม',
    description: 'การทำประโยชน์เพื่อสังคม การบริจาคโลหิต และการดูแลผู้สูงอายุเปราะบาง',
    legendItems: [
      { color: '#1e3a8a', label: '>500 แต้ม' },
      { color: '#2563eb', label: '100–499 แต้ม' },
      { color: '#38bdf8', label: '20–99 แต้ม' },
      { color: '#93c5fd', label: '1–19 แต้ม' },
      { color: '#f1f5f9', label: '0 แต้ม' }
    ]
  },
  {
    key: 'responsibility',
    title: 'มิติวินัยรับผิดชอบ',
    enTitle: 'Discipline & Responsibility',
    icon: '🎯',
    accentColor: '#059669',
    nationalValue: '2,591 แต้ม (91 คน • 26 จว.)',
    unit: 'แต้ม',
    description: 'การเคารพกฎจราจร ความปลอดภัย และความรับผิดชอบต่อหน้าที่ส่วนรวม',
    legendItems: [
      { color: '#064e3b', label: '>500 แต้ม' },
      { color: '#059669', label: '100–499 แต้ม' },
      { color: '#10b981', label: '20–99 แต้ม' },
      { color: '#6ee7b7', label: '1–19 แต้ม' },
      { color: '#f1f5f9', label: '0 แต้ม' }
    ]
  },
  {
    key: 'sufficiency',
    title: 'มิติพอเพียง',
    enTitle: 'Sufficiency Economy Mindset',
    icon: '🌱',
    accentColor: '#0891b2',
    nationalValue: '993 แต้ม (70 คน • 17 จว.)',
    unit: 'แต้ม',
    description: 'การลดภาระหนี้สิน การออม และการดำรงชีวิตตามหลักปรัชญาเศรษฐกิจพอเพียง',
    legendItems: [
      { color: '#164e63', label: '>200 แต้ม' },
      { color: '#0891b2', label: '50–199 แต้ม' },
      { color: '#06b6d4', label: '10–49 แต้ม' },
      { color: '#67e8f9', label: '1–9 แต้ม' },
      { color: '#f1f5f9', label: '0 แต้ม' }
    ]
  },
  {
    key: 'honesty',
    title: 'มิติสุจริต',
    enTitle: 'Honesty & Integrity',
    icon: '⚖️',
    accentColor: '#d97706',
    nationalValue: '287 แต้ม (39 คน • 12 จว.)',
    unit: 'แต้ม',
    description: 'ความซื่อสัตย์สุจริต ความโปร่งใส และการต่อต้านการทุจริตประพฤติมิชอบ',
    legendItems: [
      { color: '#78350f', label: '>50 แต้ม' },
      { color: '#d97706', label: '15–49 แต้ม' },
      { color: '#f59e0b', label: '5–14 แต้ม' },
      { color: '#fcd34d', label: '1–4 แต้ม' },
      { color: '#f1f5f9', label: '0 แต้ม' }
    ]
  },
  {
    key: 'gratitude',
    title: 'มิติกตัญญู',
    enTitle: 'Gratitude & Care',
    icon: '🙏',
    accentColor: '#7c3aed',
    nationalValue: '1,015 แต้ม (82 คน • 24 จว.)',
    unit: 'แต้ม',
    description: 'ความกตัญญูกตเวทิตา ความอบอุ่นในครอบครัว และการดูแลผู้มีพระคุณ',
    legendItems: [
      { color: '#4c1d95', label: '>200 แต้ม' },
      { color: '#7c3aed', label: '50–199 แต้ม' },
      { color: '#a855f7', label: '10–49 แต้ม' },
      { color: '#d8b4fe', label: '1–9 แต้ม' },
      { color: '#f1f5f9', label: '0 แต้ม' }
    ]
  },
  {
    key: 'topCategory',
    title: 'มิติคุณธรรมอันดับ 1 รายจังหวัด',
    enTitle: 'Top Virtue Category (Mosaic Map)',
    icon: '🧩',
    accentColor: '#2563eb',
    nationalValue: 'จิตอาสา 16 • วินัย 11 • พอเพียง 6 • กตัญญู 4',
    unit: 'อันดับ 1',
    description: 'แผนที่หลากสีแสดงมิติคุณธรรมที่มีคะแนนสะสมสูงสุดเป็นอันดับ 1 ของแต่ละจังหวัด',
    legendItems: [
      { color: '#2563eb', label: '🤝 จิตอาสา' },
      { color: '#059669', label: '🎯 วินัย' },
      { color: '#0891b2', label: '🌱 พอเพียง' },
      { color: '#7c3aed', label: '🙏 กตัญญู' },
      { color: '#f1f5f9', label: '⚪ พื้นที่โอกาส' }
    ]
  },
  {
    key: 'memberDensity',
    title: 'ความหนาแน่นของสมาชิก',
    enTitle: 'Member Density',
    icon: '👥',
    accentColor: '#4f46e5',
    nationalValue: `${MORAL_CREDIT_KPI_OVERVIEW.totalMembers} สมาชิก (46 จว.)`,
    unit: 'คน',
    description: 'การกระจายตัวของสมาชิกผู้ร่วมสะสมหน่วยกิตความดีทั่วประเทศ',
    legendItems: [
      { color: '#1e1b4b', label: '>20 คน' },
      { color: '#4338ca', label: '10–20 คน' },
      { color: '#6366f1', label: '2–9 คน' },
      { color: '#a5b4fc', label: '1 คน' },
      { color: '#f1f5f9', label: '0 คน' }
    ]
  }
];

const REGION_NAMES: Record<string, string> = {
  Central: 'ภาคกลาง',
  North: 'ภาคเหนือ',
  Northeast: 'ภาคตะวันออกเฉียงเหนือ',
  South: 'ภาคใต้',
  East: 'ภาคตะวันออก',
  West: 'ภาคตะวันตก'
};

const REGION_COLORS: Record<string, string> = {
  Central: '#2563eb',
  North: '#059669',
  Northeast: '#7c3aed',
  South: '#d97706',
  East: '#0891b2',
  West: '#dc2626'
};

export const MoralCreditRegionalMapCard: React.FC = () => {
  const [viewMode, setViewMode] = useState<CreditMapViewMode>('province');
  const [activeTopicKey, setActiveTopicKey] = useState<CreditMapTopicKey>('overview');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const activeTopic = useMemo(() => {
    return CREDIT_MAP_TOPICS.find((t) => t.key === activeTopicKey) || CREDIT_MAP_TOPICS[0];
  }, [activeTopicKey]);

  // Detailed Province Analytics Map
  const provinceFullData = useMemo(() => {
    const map: Record<
      string,
      {
        province: string;
        regionKey: string;
        regionName: string;
        totalMembers: number;
        activeMembers: number;
        totalPoints: number;
        totalFrequency: number;
        continuousMembers: number;
        topCategory: string;
        topCategoryScore: number;
        categoryScores: Record<string, number>;
        rank: number;
        hasData: boolean;
      }
    > = {};

    // 1. Base from MORAL_CREDIT_PROVINCES_SUMMARY
    const provSummaryMap: Record<string, MoralCreditProvinceStat> = {};
    for (const p of MORAL_CREDIT_PROVINCES_SUMMARY) {
      let clean = p.province.replace('จ.', '').trim();
      if (clean === 'กรุงเทพฯ') clean = 'กรุงเทพมหานคร';
      provSummaryMap[clean] = p;
    }

    // 2. Aggregate from MORAL_CREDIT_MEMBERS for category breakdown & continuous count
    const provCats: Record<string, Record<string, number>> = {};
    const provContinuous: Record<string, number> = {};

    for (const m of MORAL_CREDIT_MEMBERS) {
      let clean = m.province.replace('จ.', '').trim();
      if (clean === 'กรุงเทพฯ') clean = 'กรุงเทพมหานคร';

      if (!provCats[clean]) provCats[clean] = {};
      for (const [c, s] of Object.entries(m.categoryScores)) {
        provCats[clean][c] = (provCats[clean][c] || 0) + s;
      }

      if (m.totalFrequency >= 5) {
        provContinuous[clean] = (provContinuous[clean] || 0) + 1;
      }
    }

    // 3. Assemble for all 77 provinces
    const list: any[] = [];
    for (const [id, thName] of Object.entries(THAILAND_PROVINCE_ID_TO_TH)) {
      const stat = provSummaryMap[thName];
      const cats = provCats[thName] || {};
      const regKey = PROVINCE_TO_MDC_REGION[id] || 'Central';

      let topCat = 'ไม่มี';
      let topCatScore = 0;
      for (const [c, s] of Object.entries(cats)) {
        if (s > topCatScore) {
          topCatScore = s;
          topCat = c;
        }
      }

      const item = {
        province: thName,
        regionKey: regKey,
        regionName: REGION_NAMES[regKey] || regKey,
        totalMembers: stat ? stat.totalMembers : 0,
        activeMembers: stat ? stat.activeMembers : 0,
        totalPoints: stat ? stat.totalPoints : 0,
        totalFrequency: stat ? stat.totalFrequency : 0,
        continuousMembers: provContinuous[thName] || 0,
        topCategory: topCat,
        topCategoryScore: topCatScore,
        categoryScores: cats,
        rank: 0,
        hasData: Boolean(stat && (stat.totalPoints > 0 || stat.totalMembers > 0))
      };
      list.push(item);
    }

    // Sort to assign ranks (points first, then members)
    list.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.totalMembers - a.totalMembers;
    });
    list.forEach((item, idx) => {
      item.rank = idx + 1;
      map[item.province] = item;
    });

    return map;
  }, []);

  // Regional aggregated stats (including all 5 dimensions breakdown)
  const regionalData = useMemo(() => {
    const totals: Record<
      string,
      {
        totalPoints: number;
        totalMembers: number;
        continuousMembers: number;
        provincesCount: number;
        categoryScores: Record<string, number>;
        provinces: typeof provinceFullData[string][];
      }
    > = {
      Central: { totalPoints: 0, totalMembers: 0, continuousMembers: 0, provincesCount: 0, categoryScores: {}, provinces: [] },
      North: { totalPoints: 0, totalMembers: 0, continuousMembers: 0, provincesCount: 0, categoryScores: {}, provinces: [] },
      Northeast: { totalPoints: 0, totalMembers: 0, continuousMembers: 0, provincesCount: 0, categoryScores: {}, provinces: [] },
      South: { totalPoints: 0, totalMembers: 0, continuousMembers: 0, provincesCount: 0, categoryScores: {}, provinces: [] },
      East: { totalPoints: 0, totalMembers: 0, continuousMembers: 0, provincesCount: 0, categoryScores: {}, provinces: [] },
      West: { totalPoints: 0, totalMembers: 0, continuousMembers: 0, provincesCount: 0, categoryScores: {}, provinces: [] }
    };

    let nationalPointsSum = 0;
    let nationalMembersSum = 0;

    for (const item of Object.values(provinceFullData)) {
      const regKey = item.regionKey;
      if (totals[regKey]) {
        totals[regKey].totalPoints += item.totalPoints;
        totals[regKey].totalMembers += item.totalMembers;
        totals[regKey].continuousMembers += item.continuousMembers;
        totals[regKey].provinces.push(item);
        if (item.totalPoints > 0 || item.totalMembers > 0) {
          totals[regKey].provincesCount += 1;
        }

        for (const [cat, sc] of Object.entries(item.categoryScores)) {
          totals[regKey].categoryScores[cat] = (totals[regKey].categoryScores[cat] || 0) + sc;
        }

        nationalPointsSum += item.totalPoints;
        nationalMembersSum += item.totalMembers;
      }
    }

    for (const rKey of Object.keys(totals)) {
      totals[rKey].provinces.sort((a, b) => b.totalPoints - a.totalPoints);
    }

    return { totals, nationalPointsSum, nationalMembersSum };
  }, [provinceFullData]);

  // Floating Regional Dialogs for Thailand3dShadedMap (Dynamic for current topic)
  const regionalScoreDialogs: RegionalScoreDialogItem[] = useMemo(() => {
    return (['North', 'Northeast', 'Central', 'East', 'West', 'South'] as const).map((rKey) => {
      const reg = regionalData.totals[rKey];
      const rName = REGION_NAMES[rKey] || rKey;
      const isSel = selectedRegion === rKey;
      const pct = regionalData.nationalPointsSum > 0 ? ((reg.totalPoints / regionalData.nationalPointsSum) * 100).toFixed(1) : '0';

      let displayScore = `${reg.totalPoints.toLocaleString()} แต้ม`;
      let displayTier = `${pct}% (${reg.totalMembers} คน)`;

      if (activeTopicKey === 'publicConsciousness') {
        const catSc = reg.categoryScores['จิตอาสา'] || 0;
        displayScore = `${catSc.toLocaleString()} แต้ม`;
        displayTier = 'มิติจิตอาสา';
      } else if (activeTopicKey === 'responsibility') {
        const catSc = reg.categoryScores['วินัย'] || 0;
        displayScore = `${catSc.toLocaleString()} แต้ม`;
        displayTier = 'มิติวินัยรับผิดชอบ';
      } else if (activeTopicKey === 'sufficiency') {
        const catSc = reg.categoryScores['พอเพียง'] || 0;
        displayScore = `${catSc.toLocaleString()} แต้ม`;
        displayTier = 'มิติพอเพียง';
      } else if (activeTopicKey === 'honesty') {
        const catSc = reg.categoryScores['สุจริต'] || 0;
        displayScore = `${catSc.toLocaleString()} แต้ม`;
        displayTier = 'มิติสุจริต';
      } else if (activeTopicKey === 'gratitude') {
        const catSc = reg.categoryScores['กตัญญู'] || 0;
        displayScore = `${catSc.toLocaleString()} แต้ม`;
        displayTier = 'มิติกตัญญู';
      } else if (activeTopicKey === 'memberDensity') {
        displayScore = `${reg.totalMembers} คน`;
        displayTier = `${reg.provincesCount} จว. มีสมาชิก`;
      } else if (activeTopicKey === 'topCategory') {
        // Find top category in this region
        let topCat = 'จิตอาสา';
        let topSc = 0;
        for (const [c, s] of Object.entries(reg.categoryScores)) {
          if (s > topSc) {
            topSc = s;
            topCat = c;
          }
        }
        displayScore = `${CATEGORY_META[topCat]?.icon || ''} ${topCat}`;
        displayTier = `${topSc.toLocaleString()} แต้มเด่น`;
      }

      return {
        regionKey: rKey,
        name: rName,
        score: displayScore,
        tier: displayTier,
        color: activeTopic.accentColor,
        badgeBg: isSel ? '#fef3c7' : '#ffffff',
        badgeText: isSel ? '#b45309' : activeTopic.accentColor,
        badgeBorder: isSel ? '#f59e0b' : '#cbd5e1',
        isSelected: isSel,
        emotion: 'happy'
      };
    });
  }, [regionalData, activeTopicKey, selectedRegion, activeTopic.accentColor]);

  // HIGH-CONTRAST CHOROPLETH COLOR CALCULATION FOR EACH DIMENSION
  const getProvinceMapFill = (id: string, name: string): string => {
    const data = provinceFullData[name];
    if (!data) return '#f1f5f9';

    const provReg = getMdcRegionKey(id);
    const isTargetRegion = selectedRegion ? provReg === selectedRegion : hoveredRegion ? provReg === hoveredRegion : true;
    const isThisProvinceSelected = selectedProvince === name;

    // Golden Highlight if specifically clicked
    if (isThisProvinceSelected) {
      return '#f59e0b';
    }

    // Dim if another region is explicitly selected
    const shouldDim = selectedRegion && !isTargetRegion;

    // 1. TOPIC: ภาพรวมทุกมิติ (Overview: All Dimensions / Total Points)
    if (activeTopicKey === 'overview') {
      if (shouldDim) return '#e2e8f0';
      if (data.totalPoints >= 1000) return '#1e3a8a'; // Deep Navy
      if (data.totalPoints >= 100) return '#2563eb';  // Royal Blue
      if (data.totalPoints >= 30) return '#38bdf8';   // Sky Blue
      if (data.totalPoints >= 1) return '#93c5fd';    // Pastel Blue
      return '#f1f5f9';                               // 0 points
    }

    // 2. TOPIC: มิติจิตอาสา (Public Consciousness)
    if (activeTopicKey === 'publicConsciousness') {
      const sc = data.categoryScores['จิตอาสา'] || 0;
      if (shouldDim) return '#e2e8f0';
      if (sc >= 500) return '#1e3a8a';
      if (sc >= 100) return '#2563eb';
      if (sc >= 20) return '#38bdf8';
      if (sc >= 1) return '#93c5fd';
      return '#f1f5f9';
    }

    // 3. TOPIC: มิติวินัยรับผิดชอบ (Discipline & Responsibility)
    if (activeTopicKey === 'responsibility') {
      const sc = data.categoryScores['วินัย'] || 0;
      if (shouldDim) return '#e2e8f0';
      if (sc >= 500) return '#064e3b';
      if (sc >= 100) return '#059669';
      if (sc >= 20) return '#10b981';
      if (sc >= 1) return '#6ee7b7';
      return '#f1f5f9';
    }

    // 4. TOPIC: มิติพอเพียง (Sufficiency)
    if (activeTopicKey === 'sufficiency') {
      const sc = data.categoryScores['พอเพียง'] || 0;
      if (shouldDim) return '#e2e8f0';
      if (sc >= 200) return '#164e63';
      if (sc >= 50) return '#0891b2';
      if (sc >= 10) return '#06b6d4';
      if (sc >= 1) return '#67e8f9';
      return '#f1f5f9';
    }

    // 5. TOPIC: มิติสุจริต (Honesty & Integrity)
    if (activeTopicKey === 'honesty') {
      const sc = data.categoryScores['สุจริต'] || 0;
      if (shouldDim) return '#e2e8f0';
      if (sc >= 50) return '#78350f';
      if (sc >= 15) return '#d97706';
      if (sc >= 5) return '#f59e0b';
      if (sc >= 1) return '#fcd34d';
      return '#f1f5f9';
    }

    // 6. TOPIC: มิติกตัญญู (Gratitude)
    if (activeTopicKey === 'gratitude') {
      const sc = data.categoryScores['กตัญญู'] || 0;
      if (shouldDim) return '#e2e8f0';
      if (sc >= 200) return '#4c1d95';
      if (sc >= 50) return '#7c3aed';
      if (sc >= 10) return '#a855f7';
      if (sc >= 1) return '#d8b4fe';
      return '#f1f5f9';
    }

    // 7. TOPIC: คุณธรรมอันดับ 1 รายจังหวัด (Mosaic by Dominant Category)
    if (activeTopicKey === 'topCategory') {
      if (shouldDim) return '#e2e8f0';
      if (!data.hasData || data.totalPoints === 0) {
        return '#f1f5f9'; // White space
      }
      return CATEGORY_META[data.topCategory]?.color || '#2563eb';
    }

    // 8. TOPIC: ความหนาแน่นของสมาชิก (Member Density)
    if (activeTopicKey === 'memberDensity') {
      if (shouldDim) return '#e2e8f0';
      if (data.totalMembers >= 20) return '#1e1b4b';
      if (data.totalMembers >= 10) return '#4338ca';
      if (data.totalMembers >= 2) return '#6366f1';
      if (data.totalMembers >= 1) return '#a5b4fc';
      return '#f1f5f9';
    }

    return '#2563eb';
  };

  // Selected Item Details (Province or Region)
  const selectedProvinceData = selectedProvince ? provinceFullData[selectedProvince] : null;
  const hoveredProvinceData = hoveredProvince ? provinceFullData[hoveredProvince] : null;

  // Compute metric value for hovered province under active topic
  const getProvinceTopicMetricText = (provData: typeof provinceFullData[string] | null) => {
    if (!provData || !provData.hasData) return 'ไม่มีข้อมูล';
    if (activeTopicKey === 'overview') return `${provData.totalPoints.toLocaleString()} แต้มสะสม`;
    if (activeTopicKey === 'publicConsciousness') return `${(provData.categoryScores['จิตอาสา'] || 0).toLocaleString()} แต้มจิตอาสา`;
    if (activeTopicKey === 'responsibility') return `${(provData.categoryScores['วินัย'] || 0).toLocaleString()} แต้มวินัย`;
    if (activeTopicKey === 'sufficiency') return `${(provData.categoryScores['พอเพียง'] || 0).toLocaleString()} แต้มพอเพียง`;
    if (activeTopicKey === 'honesty') return `${(provData.categoryScores['สุจริต'] || 0).toLocaleString()} แต้มสุจริต`;
    if (activeTopicKey === 'gratitude') return `${(provData.categoryScores['กตัญญู'] || 0).toLocaleString()} แต้มกตัญญู`;
    if (activeTopicKey === 'topCategory') return `อันดับ 1: ${CATEGORY_META[provData.topCategory]?.icon || ''} ${provData.topCategory} (${provData.topCategoryScore.toLocaleString()} แต้ม)`;
    if (activeTopicKey === 'memberDensity') return `${provData.totalMembers} สมาชิก`;
    return `${provData.totalPoints.toLocaleString()} แต้ม`;
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header Bar with Mode Switcher & Reset Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          borderBottom: '1.5px solid #f1f5f9',
          paddingBottom: '18px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '4px',
                height: '18px',
                borderRadius: '2px',
                background: activeTopic.accentColor
              }}
            />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              แผนที่แสดงการกระจายตัวของ Moral Credit ทั่วประเทศ (Spatial Analytics)
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            โหมดรายจังหวัด (77 จังหวัด): คลิกที่จังหวัดบนแผนที่เพื่อดูข้อมูลแต้มสะสมและมิติคุณธรรมของจังหวัดนั้น
          </p>
        </div>

        {/* Top Controls: Mode Badge & Reset Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* ปุ่ม รายจังหวัด (77 จว.) */}
          <button
            type="button"
            onClick={() => {
              setViewMode('province');
              setSelectedProvince(null);
              setSelectedRegion(null);
            }}
            style={{
              padding: '7px 16px',
              borderRadius: '10px',
              border: '1.5px solid #bfdbfe',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.15s ease'
            }}
            title="โหมดรายจังหวัด (77 จังหวัด): แสดงข้อมูลทุกจังหวัดทั่วประเทศ"
          >
            <Compass size={15} color="#2563eb" />
            <span>รายจังหวัด (77 จว.)</span>
          </button>

          {/* Reset View Button */}
          {(selectedRegion || selectedProvince) && (
            <button
              type="button"
              onClick={() => {
                setSelectedRegion(null);
                setSelectedProvince(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={14} />
              <span>ดูภาพรวมทั้งหมด</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main 2-Column Section: Map (Left ~60%) + Side Perspective Controls (Right ~40%) */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}
      >
        {/* Left Column: Thailand Map Card */}
        <div
          style={{
            flex: '1 1 560px',
            minWidth: '340px',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '16px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Floating Current Mode & Topic Badge */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: '18px',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              border: `1.5px solid ${activeTopic.accentColor}30`,
              padding: '10px 14px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>มิติที่กำลังแสดงผล</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{activeTopic.icon}</span>
              <span>{activeTopic.title}</span>
            </div>
            <div style={{ fontSize: '12px', color: activeTopic.accentColor, fontWeight: 800, marginTop: '2px' }}>
              {activeTopic.nationalValue}
            </div>
          </div>

          {/* Hovered Province Tooltip Badge */}
          {hoveredProvinceData && (
            <div
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                zIndex: 10,
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '10px 14px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
                fontSize: '12.5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                pointerEvents: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '14px' }}>{hoveredProvinceData.province}</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>({hoveredProvinceData.regionName})</span>
              </div>
              {hoveredProvinceData.hasData ? (
                <>
                  <div style={{ color: '#38bdf8', fontWeight: 800 }}>
                    {getProvinceTopicMetricText(hoveredProvinceData)}
                  </div>
                  <div style={{ color: '#a7f3d0', fontSize: '11.5px', fontWeight: 600 }}>
                    รวม: {hoveredProvinceData.totalPoints.toLocaleString()} แต้ม • {hoveredProvinceData.totalMembers} สมาชิก
                  </div>
                </>
              ) : (
                <div style={{ color: '#fca5a5', fontSize: '11.5px', fontWeight: 600 }}>
                  พื้นที่เป้าหมายใหม่ (ยังไม่มีการบันทึก)
                </div>
              )}
            </div>
          )}

          {/* 3D Map Component Container (+20% Height: 912px, Centered) */}
          <div
            style={{
              width: '100%',
              height: '912px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Thailand3dShadedMap
              height="912px"
              scale={1.18}
              translateX="0px"
              translateY="12px"
              getProvinceFill={getProvinceMapFill}
              regionalScoreDialogs={regionalScoreDialogs}
              hoveredProvinceName={hoveredProvince}
              selectedProvinceName={selectedProvince}
              onRegionalDialogClick={(rKey) => {
                setSelectedRegion((prev) => (prev === rKey ? null : rKey));
                setSelectedProvince(null);
              }}
              onRegionalDialogMouseEnter={(rKey) => setHoveredRegion(rKey)}
              onRegionalDialogMouseLeave={() => setHoveredRegion(null)}
              onProvinceMouseEnter={(loc) => {
                setHoveredProvince(loc.name);
                const rKey = getMdcRegionKey(loc.id);
                setHoveredRegion(rKey);
              }}
              onProvinceMouseLeave={() => {
                setHoveredProvince(null);
                setHoveredRegion(null);
              }}
              onProvinceClick={(loc) => {
                // Toggle clicked province cleanly without graying out the whole country
                setSelectedProvince((prev) => (prev === loc.name ? null : loc.name));
              }}
            />

            {/* Interactive Hint Chip (Bottom-Left) */}
            <div
              style={{
                position: 'absolute',
                bottom: '18px',
                left: '18px',
                zIndex: 9,
                background: 'rgba(255, 255, 255, 0.90)',
                backdropFilter: 'blur(6px)',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                padding: '7px 12px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                pointerEvents: 'none'
              }}
            >
              <span>💡 คลิกจังหวัดหรือป้ายภูมิภาคบนแผนที่เพื่อดูข้อมูลเจาะลึก</span>
            </div>

            {/* Dynamic Legend Items (1 Single Vertical Column at Bottom-Right) */}
            <div
              style={{
                position: 'absolute',
                bottom: '18px',
                right: '18px',
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                padding: '12px 14px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                minWidth: '155px'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748b',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '5px',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <span>เกณฑ์สี & ช่วงคะแนน</span>
                <span style={{ fontSize: '10px', color: activeTopic.accentColor, fontWeight: 700 }}>
                  ● {activeTopic.title.length > 12 ? `${activeTopic.title.slice(0, 12)}...` : activeTopic.title}
                </span>
              </div>

              {activeTopic.legendItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '13px',
                      height: '13px',
                      borderRadius: '3px',
                      background: item.color,
                      border: '1px solid rgba(0,0,0,0.15)',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1e293b' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Spatial Drill-down Card */}
        <div
          style={{
            flex: '1 1 480px',
            minWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Dynamic Spatial Drill-down Card (Specific Province OR Region OR National Snapshot) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: selectedProvince
                ? '2px solid #f59e0b'
                : selectedRegion
                ? `2px solid ${REGION_COLORS[selectedRegion] || '#2563eb'}`
                : '1.5px solid #e2e8f0',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            {/* Case 1: Specific Province Selected */}
            {selectedProvinceData ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color="#f59e0b" />
                    <div>
                      <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                        จังหวัด{selectedProvinceData.province}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>
                        ({selectedProvinceData.regionName})
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: selectedProvinceData.hasData ? '#059669' : '#dc2626',
                        background: selectedProvinceData.hasData ? '#ecfdf5' : '#fef2f2',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {selectedProvinceData.hasData ? `อันดับที่ ${selectedProvinceData.rank} ของประเทศ` : 'ยังไม่มีฐานข้อมูล'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProvince(null)}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                      title="ปิดเพื่อดูภาพรวม"
                    >
                      ✕ ปิด
                    </button>
                  </div>
                </div>

                {selectedProvinceData.hasData ? (
                  <>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: '10px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>คะแนนความดีสะสม</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a8a' }}>
                          {selectedProvinceData.totalPoints.toLocaleString()} แต้ม
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>จำนวนสมาชิก</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#059669' }}>
                          {selectedProvinceData.totalMembers} คน
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>ทำดีต่อเนื่อง (≥5 ครั้ง)</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#7c3aed' }}>
                          {selectedProvinceData.continuousMembers} คน
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>ความถี่รวม</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                          {selectedProvinceData.totalFrequency} ครั้ง
                        </div>
                      </div>
                    </div>

                    {/* All 5 Dimensions Breakdown for Selected Province */}
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                        คะแนนแยกตาม 5 มิติคุณธรรม:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {[
                          { label: 'จิตอาสา', cat: 'จิตอาสา', icon: '🤝', color: '#2563eb' },
                          { label: 'วินัยรับผิดชอบ', cat: 'วินัย', icon: '🎯', color: '#059669' },
                          { label: 'พอเพียง', cat: 'พอเพียง', icon: '🌱', color: '#0891b2' },
                          { label: 'สุจริต', cat: 'สุจริต', icon: '⚖️', color: '#d97706' },
                          { label: 'กตัญญู', cat: 'กตัญญู', icon: '🙏', color: '#7c3aed' }
                        ].map((dim) => {
                          const sc = selectedProvinceData.categoryScores[dim.cat] || 0;
                          return (
                            <div
                              key={dim.cat}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                background: sc > 0 ? `${dim.color}10` : '#f8fafc',
                                border: `1px solid ${sc > 0 ? `${dim.color}30` : '#e2e8f0'}`,
                                fontSize: '12px'
                              }}
                            >
                              <span style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>{dim.icon}</span>
                                <span>{dim.label}</span>
                              </span>
                              <span style={{ fontWeight: 800, color: sc > 0 ? dim.color : '#94a3b8' }}>
                                {sc.toLocaleString()} แต้ม
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        {selectedProvinceData.topCategoryScore > 0 ? 'มิติคุณธรรมอันดับ 1 ของจังหวัด:' : 'สถานะการดำเนินกิจกรรม:'}
                      </div>
                      {selectedProvinceData.topCategoryScore > 0 ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: CATEGORY_META[selectedProvinceData.topCategory]?.bg || '#eff6ff',
                            border: `1.5px solid ${CATEGORY_META[selectedProvinceData.topCategory]?.color || '#bfdbfe'}`
                          }}
                        >
                          <span style={{ fontSize: '22px' }}>{CATEGORY_META[selectedProvinceData.topCategory]?.icon}</span>
                          <div>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: '13.5px',
                                color: CATEGORY_META[selectedProvinceData.topCategory]?.color || '#1e40af'
                              }}
                            >
                              {selectedProvinceData.topCategory}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                              {selectedProvinceData.topCategoryScore.toLocaleString()} แต้มสะสมในมิตินี้
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: '#f0fdf4',
                            border: '1.5px solid #bbf7d0',
                            color: '#166534',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          <CheckCircle2 size={16} color="#16a34a" />
                          <span>มีสมาชิกลงทะเบียนแล้ว {selectedProvinceData.totalMembers} คน (เตรียมเริ่มสะสมแต้มความดี)</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      padding: '16px',
                      background: '#fffbeb',
                      border: '1px solid #fef3c7',
                      borderRadius: '10px',
                      color: '#b45309',
                      fontSize: '12.5px',
                      lineHeight: '1.5'
                    }}
                  >
                    📌 <strong>พื้นที่โอกาสขยายผล (White Space):</strong> จังหวัดนี้ยังไม่มีสมาชิกลงทะเบียนในระบบสะสมหน่วยกิตความดี เป็นเป้าหมายสำคัญในการเปิดเครือข่ายและรณรงค์กิจกรรมความดีรอบถัดไป
                  </div>
                )}
              </>
            ) : selectedRegion ? (
              /* Case 2: Specific Region Selected */
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color={REGION_COLORS[selectedRegion]} />
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      {REGION_NAMES[selectedRegion]}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: REGION_COLORS[selectedRegion],
                        background: `${REGION_COLORS[selectedRegion]}15`,
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      สัดส่วน {(
                        (regionalData.totals[selectedRegion].totalPoints / regionalData.nationalPointsSum) *
                        100
                      ).toFixed(1)}% ของประเทศ
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedRegion(null)}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                      title="ปิดเพื่อดูภาพรวม"
                    >
                      ✕ ปิด
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    padding: '10px',
                    background: '#f8fafc',
                    borderRadius: '10px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>แต้มความดีรวม</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                      {regionalData.totals[selectedRegion].totalPoints.toLocaleString()} แต้ม
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>จำนวนสมาชิก</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb' }}>
                      {regionalData.totals[selectedRegion].totalMembers} คน
                    </div>
                  </div>
                </div>

                {/* Regional 5 Dimensions Breakdown */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    สถิติราย 5 มิติคุณธรรมใน{REGION_NAMES[selectedRegion]}:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {[
                      { label: 'จิตอาสา', cat: 'จิตอาสา', icon: '🤝', color: '#2563eb' },
                      { label: 'วินัยรับผิดชอบ', cat: 'วินัย', icon: '🎯', color: '#059669' },
                      { label: 'พอเพียง', cat: 'พอเพียง', icon: '🌱', color: '#0891b2' },
                      { label: 'สุจริต', cat: 'สุจริต', icon: '⚖️', color: '#d97706' },
                      { label: 'กตัญญู', cat: 'กตัญญู', icon: '🙏', color: '#7c3aed' }
                    ].map((dim) => {
                      const sc = regionalData.totals[selectedRegion].categoryScores[dim.cat] || 0;
                      return (
                        <div
                          key={dim.cat}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            fontSize: '11.5px'
                          }}
                        >
                          <span style={{ fontWeight: 600, color: '#334155' }}>
                            {dim.icon} {dim.label}
                          </span>
                          <span style={{ fontWeight: 800, color: dim.color }}>
                            {sc.toLocaleString()} แต้ม
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                    🏆 5 อันดับจังหวัดสูงสุดใน{REGION_NAMES[selectedRegion]}:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {regionalData.totals[selectedRegion].provinces
                      .filter((p) => p.totalPoints > 0)
                      .slice(0, 5)
                      .map((p, idx) => (
                        <div
                          key={p.province}
                          onClick={() => setSelectedProvince(p.province)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: idx === 0 ? '#eff6ff' : '#f8fafc',
                            border: idx === 0 ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <span style={{ fontWeight: idx === 0 ? 800 : 600, color: idx === 0 ? '#1e40af' : '#334155' }}>
                            {idx + 1}. {p.province}
                          </span>
                          <span style={{ fontWeight: 800, color: idx === 0 ? '#1e40af' : '#475569' }}>
                            {p.totalPoints.toLocaleString()} แต้ม ({p.totalMembers} คน)
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              /* Case 3: Default Overview - Moral Dimensions Selector List */
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="#2563eb" />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        เลือกมิติข้อมูลคุณธรรม (Moral Dimensions)
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                        (คลิกเลือกมิติเพื่อสลับมุมมองและเกณฑ์สีบนแผนที่ประเทศไทย)
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#1e40af',
                      fontWeight: 700,
                      background: '#eff6ff',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid #bfdbfe',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {CREDIT_MAP_TOPICS.length} มิติข้อมูล
                  </span>
                </div>

                {/* Vertical List of 8 Dimensions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {CREDIT_MAP_TOPICS.map((topic) => {
                    const isActive = activeTopicKey === topic.key;
                    return (
                      <button
                        key={topic.key}
                        type="button"
                        onClick={() => {
                          setActiveTopicKey(topic.key);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: isActive ? `2px solid ${topic.accentColor}` : '1.5px solid #e2e8f0',
                          background: isActive ? '#f8fafc' : '#ffffff',
                          boxShadow: isActive ? `0 2px 8px ${topic.accentColor}25` : '0 1px 2px rgba(0,0,0,0.02)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '19px', flexShrink: 0 }}>{topic.icon}</span>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: isActive ? 800 : 700,
                                color: isActive ? topic.accentColor : '#0f172a'
                              }}
                            >
                              {topic.title}
                            </div>
                            <div
                              style={{
                                fontSize: '11px',
                                color: '#64748b',
                                marginTop: '1px',
                                lineHeight: 1.3,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              title={topic.description}
                            >
                              {topic.description}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: isActive ? `${topic.accentColor}18` : '#f1f5f9',
                              color: isActive ? topic.accentColor : '#475569',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {topic.nationalValue}
                          </span>
                          {isActive ? (
                            <CheckCircle2 size={16} color={topic.accentColor} style={{ flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #cbd5e1', flexShrink: 0 }} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '11.5px',
                    color: '#64748b'
                  }}
                >
                  <MapPin size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                  <span>💡 คลิกที่จังหวัดบนแผนที่ด้านซ้าย เพื่อดูสถิติเจาะลึกเฉพาะพื้นที่</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
