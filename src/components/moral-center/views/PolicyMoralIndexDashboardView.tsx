import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import {
  ExternalLink,
  Download, Globe, ChevronDown,
  ShieldCheck, Check,
  Award, TrendingUp, Users,
  ArrowLeft, RotateCcw
} from 'lucide-react';
import { Thailand3dShadedMap } from '../components/Thailand3dShadedMap';
import { Isometric3dMultiLayerChart, type IsometricSeriesConfig } from '../components/Isometric3dMultiLayerChart';
import { MoralSynergyDimensionView } from '../components/MoralSynergyDimensionView';
import { MoralSmileyIcon } from '../components/MoralSmileyIcon';
import { MoralDimensionsRadarChart } from '../components/MoralDimensionsRadarChart';
import type { MdcSurveyYear } from '../data/moralMdcSurveyData';
import {
  MDC_MORAL_BEHAVIOR_DATA,
  MDC_MULTI_YEAR_OVERVIEW,
  getMdcRegionKey,
  getMoralTierInfo
} from '../data/moralMdcSurveyData';
import { exportDashboardToPdf } from '../utils/dashboardExportUtils';
import { useMoralLanguage } from '../utils/moralLanguageTranslator';
import { useMoralTheme } from '../utils/moralThemeManager';
import { MoralHeroBannerCard } from '../components/MoralHeroBannerCard';
import { MdcTopSubmenuBar, type MdcSubmenuCardItem } from '../components/MdcTopSubmenuBar';
import { MdcTopSearchBar } from '../components/MdcTopSearchBar';
import { MdcTopSynergyMenuBar } from '../components/MdcTopSynergyMenuBar';
import { MdcProvinceBarChart } from '../components/MdcProvinceBarChart';
import { MdcDatasetTableViewer } from '../components/MdcDatasetTableViewer';
import { getMoralDimensionMeta, getAllMoralSynergyTopics } from '../components/MoralSynergyDimensionView';
import { PublishedPageSynergySection } from '../components/PublishedPageSynergySection';

const MORAL_DIMENSIONS_SERIES_CONFIG: IsometricSeriesConfig[] = [
  { key: 'gratitude', name: 'กตัญญู', icon: '🙏', color: '#7c3aed' },
  { key: 'publicConsciousness', name: 'จิตอาสา', icon: '🤝', color: '#2563eb' },
  { key: 'responsibility', name: 'วินัย', icon: '🎯', color: '#059669' },
  { key: 'honesty', name: 'สุจริต', icon: '⚖️', color: '#d97706' },
  { key: 'sufficiency', name: 'พอเพียง', icon: '🌱', color: '#06b6d4' }
];

interface ArchCardConfig {
  key: string | null;
  name: string;
  title: string;
  bgImg: string;
  textColor: string;
  textShadow: string;
  badgeBg: string;
  badgeIcon: React.ReactNode;
}

const DIMENSION_TITLE_MAP: Record<string, { title: string; enTitle: string; subtitle: string }> = {
  responsibility: {
    title: 'ดัชนีวินัยรับผิดชอบ',
    enTitle: '(Discipline & Social Responsibility)',
    subtitle: 'การวิเคราะห์ความสัมพันธ์และการผนึกกำลังข้อมูล (Data Synergy)'
  },
  gratitude: {
    title: 'ดัชนีกตัญญู',
    enTitle: '(Gratitude & Family Synergy)',
    subtitle: 'การวิเคราะห์ความสัมพันธ์และการผนึกกำลังข้อมูล (Data Synergy)'
  },
  honesty: {
    title: 'ดัชนีสุจริต',
    enTitle: '(Honesty & Anti-Corruption Synergy)',
    subtitle: 'การวิเคราะห์ความสัมพันธ์และการผนึกกำลังข้อมูล (Data Synergy)'
  },
  publicConsciousness: {
    title: 'ดัชนีจิตอาสา',
    enTitle: '(Public Consciousness & Volunteer Synergy)',
    subtitle: 'การวิเคราะห์ความสัมพันธ์และการผนึกกำลังข้อมูล (Data Synergy)'
  },
  sufficiency: {
    title: 'ดัชนีพอเพียง',
    enTitle: '(Sufficiency Economy & Sustainability Synergy)',
    subtitle: 'การวิเคราะห์ความสัมพันธ์และการผนึกกำลังข้อมูล (Data Synergy)'
  }
};

const ARCH_CARDS_DATA: ArchCardConfig[] = [
  {
    key: null,
    name: 'ภาพรวม',
    title: 'คลิกเพื่อดูภาพรวม 5 มิติ',
    bgImg: '/theme/card_bg_overview.svg',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
    badgeBg: 'linear-gradient(135deg, #1d4ed8, #0284c7)',
    badgeIcon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    title: 'มิติกตัญญู (คลิกเพื่อเจาะลึก)',
    bgImg: '/theme/card_bg_gratitude.svg',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
    badgeBg: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    badgeIcon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    )
  },
  {
    key: 'publicConsciousness',
    name: 'จิตอาสา',
    title: 'มิติจิตอาสา (คลิกเพื่อเจาะลึก)',
    bgImg: '/theme/card_bg_public.svg',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
    badgeBg: 'linear-gradient(135deg, #059669, #10b981)',
    badgeIcon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    key: 'responsibility',
    name: 'วินัย',
    title: 'มิติวินัย (คลิกเพื่อเจาะลึก)',
    bgImg: '/theme/card_bg_responsibility.svg',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
    badgeBg: 'linear-gradient(135deg, #0284c7, #1d4ed8)',
    badgeIcon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    )
  },
  {
    key: 'honesty',
    name: 'สุจริต',
    title: 'มิติสุจริต (คลิกเพื่อเจาะลึก)',
    bgImg: '/theme/card_bg_honesty.svg',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
    badgeBg: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
    badgeIcon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M3 9l9-6 9 6M6 14l-3-5h6l-3 5zm12 0l-3-5h6l-3 5z"/>
      </svg>
    )
  },
  {
    key: 'sufficiency',
    name: 'พอเพียง',
    title: 'มิติพอเพียง (คลิกเพื่อเจาะลึก)',
    bgImg: '/theme/card_bg_sufficiency.svg',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
    badgeBg: 'linear-gradient(135deg, #059669, #10b981)',
    badgeIcon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 4 13C4 8.5 7.5 5 12 4c4.5 1 8 4.5 8 9a7 7 0 0 1-7 7z"/>
        <path d="M12 4v16"/>
      </svg>
    )
  }
];

export interface PolicyMoralIndexDashboardViewProps {
  onNavigatePage?: (pageId: string) => void;
}

export const PolicyMoralIndexDashboardView: React.FC<PolicyMoralIndexDashboardViewProps> = ({
  onNavigatePage
}) => {
  const { language, setLanguage } = useMoralLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<MdcSurveyYear>('2568');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string>('elderly_mental_care');
  const [showMoralTrend, setShowMoralTrend] = useState(false);
  const [showEvaluatorDemographics, setShowEvaluatorDemographics] = useState(false);
  const [overviewSynergyFilter, setOverviewSynergyFilter] = useState<string>('all');

  const handleSelectDimension = (dimKey: string | null) => {
    setSelectedDimension(dimKey);
    if (dimKey && dimKey !== 'all') {
      const meta = getMoralDimensionMeta(dimKey);
      if (meta && meta.topics.length > 0) {
        setActiveTopicId(meta.topics[0].id);
      }
    }
  };

  const currentDimensionMeta = React.useMemo(() => {
    if (!selectedDimension || selectedDimension === 'all') return null;
    return getMoralDimensionMeta(selectedDimension);
  }, [selectedDimension]);

  // All 20 Moral Synergy Topics for Overview bar
  const allMoralSynergyTopics = React.useMemo(() => {
    return getAllMoralSynergyTopics();
  }, []);

  const overviewFilterTabs = React.useMemo(() => [
    { key: 'all', label: 'ทั้งหมด', count: allMoralSynergyTopics.length },
    { key: 'gratitude', label: 'กตัญญู', count: 4, color: '#ea580c' },
    { key: 'responsibility', label: 'วินัย', count: 4, color: '#0284c7' },
    { key: 'honesty', label: 'สุจริต', count: 4, color: '#1d4ed8' },
    { key: 'publicConsciousness', label: 'จิตอาสา', count: 4, color: '#059669' },
    { key: 'sufficiency', label: 'พอเพียง', count: 4, color: '#16a34a' }
  ], [allMoralSynergyTopics]);

  const displayedOverviewTopics = allMoralSynergyTopics;

  const handleSynergyTopicClick = (topicId: string, topic?: any) => {
    if (topic && topic.dimensionKey) {
      setSelectedDimension(topic.dimensionKey);
      setActiveTopicId(topicId);
    } else {
      setActiveTopicId(topicId);
    }
  };

  const currentData = MDC_MORAL_BEHAVIOR_DATA[selectedYear];

  // Gender Breakdown Data for Pie Chart
  const genderData = [
    { name: 'ผู้หญิง', value: currentData.gender.female, color: '#ec4899', stroke: '#be185d' },
    { name: 'ผู้ชาย', value: currentData.gender.male, color: '#3b82f6', stroke: '#1d4ed8' },
    { name: 'LGBTQ+', value: currentData.gender.lgbtq, color: '#8b5cf6', stroke: '#6d28d9' }
  ];

  // Age Breakdown Data for Bar Chart
  const ageData = [
    { group: '13-24 ปี (เยาวชน)', percentage: currentData.age.age13_24, color: '#3b82f6' },
    { group: '25-40 ปี (วัยทำงาน)', percentage: currentData.age.age25_40, color: '#f59e0b' },
    { group: '41 ปีขึ้นไป (ผู้ใหญ่)', percentage: currentData.age.age41plus, color: '#8b5cf6' }
  ];

  // Multi-Year Trend Data for 5 Dimensions across 2565-2568
  const multiYearDimensionsTrend = (['2565', '2566', '2567', '2568'] as MdcSurveyYear[]).map((y) => {
    const d = MDC_MORAL_BEHAVIOR_DATA[y];
    return {
      year: y,
      overall: d.overallScore,
      gratitude: d.dimensions.gratitude,
      publicConsciousness: d.dimensions.publicConsciousness,
      responsibility: d.dimensions.responsibility,
      honesty: d.dimensions.honesty,
      sufficiency: d.dimensions.sufficiency
    };
  });

  // Dynamic Map Fill Function based on 4 Tiers:
  // >= 4.60: น้ำเงิน (#5082ef) | 4.40 - 4.59: สีเขียว (#44b56e) | 4.20 - 4.39: สีส้ม (#ee793d) | < 4.20: สีแดง (#e35151)
  // Dynamic Map Fill Function based on Moral Center 5 Tiers:
  // เมื่อเอา mouse over ที่แผนที่ประเทศไทยให้แสดงสีบนภูมิภาคนั้นให้ตรงกับคะแนนที่ได้
  const getProvinceMapFill = (id: string, _name: string): string => {
    const regKey = getMdcRegionKey(id);
    const regInfo = currentData.regions[regKey];
    const tierInfo = regInfo ? getMoralTierInfo(regInfo.score) : null;
    const scoreColor = tierInfo ? tierInfo.color : '#f59e0b';
    const defaultPastelBlue = '#c8d7f2'; // สีพื้นฐานนุ่มนวลของแผนที่ตามภาพตัวอย่าง

    // เมื่อกดเลือกภูมิภาค
    if (selectedRegion && selectedRegion === regKey) {
      if (hoveredRegion && hoveredRegion === regKey) {
        return tierInfo ? tierInfo.hoverColor : '#fbbf24';
      }
      return scoreColor;
    }

    // เมื่อเอา mouse over ที่ภูมิภาค ให้แสดงสีตรงกับคะแนนที่ได้
    if (hoveredRegion && hoveredRegion === regKey) {
      return scoreColor;
    }

    return defaultPastelBlue;
  };

  // Regional Score Dialogs for 3D Map (รูปแบบ 3D Dialog พร้อมไอคอนหน้าแสดงอารมณ์ตามระดับคะแนน และลูกศรแนวโน้มเทียบปีก่อนหน้า)
  const regionalScoreDialogs = React.useMemo(() => {
    const prevYearMap: Record<MdcSurveyYear, MdcSurveyYear | null> = {
      '2568': '2567',
      '2567': '2566',
      '2566': '2565',
      '2565': null, // ปี 2565 เป็นปีสำรวจแรก จึงไม่ต้องแสดงลูกศรเปรียบเทียบ
    };
    const prevYear = prevYearMap[selectedYear];
    const prevYearData = prevYear ? MDC_MORAL_BEHAVIOR_DATA[prevYear] : null;

    return (['North', 'Northeast', 'Central', 'West', 'East', 'South'] as const).map((rKey) => {
      const reg = currentData.regions[rKey];
      const tierInfo = getMoralTierInfo(reg.score);

      let trend: 'up' | 'down' | 'same' | null = null;
      let trendDiff: number | undefined = undefined;

      if (prevYearData && prevYearData.regions[rKey]) {
        const prevScore = prevYearData.regions[rKey].score;
        trendDiff = Number((reg.score - prevScore).toFixed(2));
        if (trendDiff > 0.001) {
          trend = 'up';
        } else if (trendDiff < -0.001) {
          trend = 'down';
        } else {
          trend = 'same';
        }
      }

      return {
        regionKey: rKey,
        name: reg.name,
        score: reg.score,
        tier: tierInfo.tier,
        color: tierInfo.color,
        emotion: tierInfo.emotion,
        badgeBg: tierInfo.badgeBg,
        badgeText: tierInfo.badgeText,
        badgeBorder: tierInfo.badgeBorder,
        isSelected: selectedRegion === rKey,
        trend,
        trendDiff,
        compareYearLabel: prevYear ? `พ.ศ. ${prevYear}` : undefined
      };
    });
  }, [currentData, selectedRegion, selectedYear]);

  // Top 1 dimension for Card 2 (จุดเด่นสังคมไทย)
  const topDimension = React.useMemo(() => {
    const dimList = [
      { key: 'gratitude', label: 'มิติกตัญญู', score: currentData.dimensions.gratitude },
      { key: 'publicConsciousness', label: 'มิติจิตอาสา', score: currentData.dimensions.publicConsciousness },
      { key: 'responsibility', label: 'มิติวินัย', score: currentData.dimensions.responsibility },
      { key: 'honesty', label: 'มิติสุจริต', score: currentData.dimensions.honesty },
      { key: 'sufficiency', label: 'มิติพอเพียง', score: currentData.dimensions.sufficiency },
    ];
    return dimList.sort((a, b) => b.score - a.score)[0];
  }, [currentData]);

  // Target score for Card 3 (เป้าหมายยกระดับคุณธรรม - สุจริตและพอเพียง)
  const targetScore = React.useMemo(() => {
    return (currentData.dimensions.honesty + currentData.dimensions.sufficiency) / 2;
  }, [currentData]);

  const isDimensionView = Boolean(selectedDimension && selectedDimension !== 'all');
  const currentDimensionTitle = selectedDimension && DIMENSION_TITLE_MAP[selectedDimension]
    ? DIMENSION_TITLE_MAP[selectedDimension]
    : null;

  const { theme } = useMoralTheme();

  const lowestDimension = React.useMemo(() => {
    const dimList = [
      { key: 'gratitude', label: 'มิติกตัญญู', score: currentData.dimensions.gratitude },
      { key: 'publicConsciousness', label: 'มิติจิตอาสา', score: currentData.dimensions.publicConsciousness },
      { key: 'responsibility', label: 'มิติวินัย', score: currentData.dimensions.responsibility },
      { key: 'honesty', label: 'มิติสุจริต', score: currentData.dimensions.honesty },
      { key: 'sufficiency', label: 'มิติพอเพียง', score: currentData.dimensions.sufficiency },
    ];
    return dimList.sort((a, b) => a.score - b.score)[0];
  }, [currentData]);

  const mdcCardItems: MdcSubmenuCardItem[] = [
    {
      key: 'all',
      name: 'ภาพรวม',
      colorType: 'sky',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="M7 21h10" />
          <path d="M12 3v18" />
          <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </svg>
      ),
      isActive: selectedDimension === null || selectedDimension === 'all',
      onClick: () => handleSelectDimension(null)
    },
    {
      key: 'gratitude',
      name: 'กตัญญู',
      colorType: 'sky',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#6d28d9">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      isActive: selectedDimension === 'gratitude',
      onClick: () => handleSelectDimension('gratitude')
    },
    {
      key: 'publicConsciousness',
      name: 'จิตอาสา',
      colorType: 'teal',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      isActive: selectedDimension === 'publicConsciousness',
      onClick: () => handleSelectDimension('publicConsciousness')
    },
    {
      key: 'responsibility',
      name: 'วินัย',
      colorType: 'amber',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      ),
      isActive: selectedDimension === 'responsibility',
      onClick: () => handleSelectDimension('responsibility')
    },
    {
      key: 'honesty',
      name: 'สุจริต',
      colorType: 'blue',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18M3 9l9-6 9 6M6 14l-3-5h6l-3 5zm12 0l-3-5h6l-3 5z"/>
        </svg>
      ),
      isActive: selectedDimension === 'honesty',
      onClick: () => handleSelectDimension('honesty')
    },
    {
      key: 'sufficiency',
      name: 'พอเพียง',
      colorType: 'pattern',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
      ),
      isActive: selectedDimension === 'sufficiency',
      onClick: () => handleSelectDimension('sufficiency')
    }
  ];

  if (theme === 'thai-modern') {
    return (
      <div className="mdc-layout-root">
        {/* Main Dashboard Content */}
        <div className="mdc-main-dashboard-pane">
          {/* Top Search Bar Row */}
          <MdcTopSearchBar
            activePillar="policy-1-1"
            onNavigatePillar={onNavigatePage}
            onExportPdf={() =>
              exportDashboardToPdf({
                sectorTitle: 'ระดับนโยบาย',
                viewTitle: isDimensionView && currentDimensionTitle ? currentDimensionTitle.title : 'ดัชนีคุณธรรม 5 มิติ',
                viewSubtitle: isDimensionView && currentDimensionTitle ? currentDimensionTitle.subtitle : 'รายงานสถานการณ์และดัชนีชี้คุณธรรม 5 มิติของคนไทย (พ.ศ. 2565–2568)'
              })
            }
          />

          {/* Top Submenu Bar (directly below search bar - preserving exact 130px x 106px card size and formatting) */}
          <MdcTopSubmenuBar
            title="มิติการวิเคราะห์ข้อมูลดัชนีคุณธรรม"
            items={mdcCardItems}
          />

          {/* Top Synergy Submenu Bar (แสดงเฉพาะเมื่อเลือกมิติคุณธรรม ไม่แสดงในส่วนของปุ่มภาพรวม) */}
          {isDimensionView && currentDimensionMeta && (
            <MdcTopSynergyMenuBar
              dimensionTitle={`ดัชนี${currentDimensionMeta.name}`}
              accentColor={currentDimensionMeta.accentColor}
              topics={currentDimensionMeta.topics}
              activeTopicId={activeTopicId}
              onSelectTopic={(topicId) => setActiveTopicId(topicId)}
              onBackToOverview={() => handleSelectDimension(null)}
            />
          )}

          {isDimensionView ? (
            <div style={{ padding: '20px 20px 32px 20px' }}>
              <MoralSynergyDimensionView
                dimension={selectedDimension as any}
                activeTopicId={activeTopicId}
                onSelectTopicId={setActiveTopicId}
                onBackToOverview={() => handleSelectDimension(null)}
              />
            </div>
          ) : (
            <div className="mdc-dashboard-body" style={{ paddingBottom: '32px' }}>
              {/* Main Content Row: Left (Map ~46%) | Right (Stats & Bar Chart ~54%) */}
              <div className="mdc-main-split-grid">
                {/* Left: Map Card */}
                <div className="mdc-map-card">
                  <div className="mdc-map-card-header">
                    <h3 className="mdc-map-card-title">แผนที่แสดงดัชนีคุณธรรม</h3>
                    <div className="mdc-map-header-controls">
                      {selectedRegion && (
                        <button
                          type="button"
                          className="mdc-map-view-all-btn"
                          onClick={() => setSelectedRegion(null)}
                          title="ดูทั้งหมดทุกภูมิภาค"
                        >
                          ดูทั้งหมด
                        </button>
                      )}
                      <div className="mdc-map-year-dropdown-wrap">
                        <span className="mdc-map-year-label">ปีที่สำรวจ:</span>
                        <div className="mdc-map-year-select-container">
                          <select
                            className="mdc-map-year-select"
                            value={selectedYear}
                            onChange={(e) => {
                              setSelectedYear(e.target.value as MdcSurveyYear);
                              setSelectedRegion(null);
                            }}
                            aria-label="เลือกปีที่สำรวจ"
                          >
                            {(['2568', '2567', '2566', '2565'] as MdcSurveyYear[]).map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="mdc-map-year-chevron" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="moral-theme-map-container" style={{ minHeight: '912px', height: '100%' }}>
                    {/* ป้ายคะแนนเฉลี่ยด้านบนแผนที่ ตามตัวอย่างอ้างอิง */}
                    <div className="moral-map-top-summary-badge-wrap">
                      <div
                        className="moral-map-top-summary-badge"
                        style={{
                          backgroundColor: getMoralTierInfo(currentData.overallScore).color
                        }}
                      >
                        <div className="moral-map-top-summary-title">คะแนนเฉลี่ยดัชนีชี้วัดคุณธรรม</div>
                        <div className="moral-map-top-summary-score">
                          {currentData.overallScore.toFixed(2)} • {getMoralTierInfo(currentData.overallScore).tier}
                        </div>
                        <div className="moral-map-top-summary-info-icon" title="เกณฑ์มาตรฐานศูนย์คุณธรรม เต็ม 6.00 คะแนน">
                          i
                        </div>
                      </div>
                      <div className="moral-map-top-summary-sublabel">ภาพรวม</div>
                    </div>

                    <Thailand3dShadedMap
                      height="912px"
                      scale={1.16}
                      translateX="0px"
                      translateY="0px"
                      getProvinceFill={getProvinceMapFill}
                      isProvinceInSelectedRegion={(id) => Boolean(selectedRegion && getMdcRegionKey(id) === selectedRegion)}
                      isProvinceInHoveredRegion={(id) => Boolean(hoveredRegion && getMdcRegionKey(id) === hoveredRegion)}
                      hoveredRegionKey={hoveredRegion}
                      regionalScoreDialogs={regionalScoreDialogs}
                      hoveredProvinceName={hoveredProvince}
                      onRegionalDialogClick={(rKey) => setSelectedRegion((prev) => (prev === rKey ? null : rKey))}
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
                        const rKey = getMdcRegionKey(loc.id);
                        setSelectedRegion((prev) => (prev === rKey ? null : rKey));
                      }}
                    />

                    {/* ตารางเล็กๆ ด้านล่างขวาของแผนที่ สำหรับบอกค่าสีของคะแนน (เกณฑ์มาตรฐานศูนย์คุณธรรม 5 ระดับ icon ยิ้ม) */}
                    <div className="moral-theme-map-legend-dialog">
                      <div className="moral-theme-legend-header">
                        <div className="moral-theme-legend-title-row">
                          <span className="moral-theme-legend-dot" style={{ backgroundColor: '#92c784' }} />
                          <span className="moral-theme-legend-title">เกณฑ์ระดับคะแนนดัชนีคุณธรรม</span>
                        </div>
                        <span className="moral-theme-legend-sub">(เต็ม 6.00 คะแนน)</span>
                      </div>
                      <div className="moral-theme-legend-list">
                        <div className="moral-theme-legend-row">
                          <div className="moral-theme-legend-left">
                            <MoralSmileyIcon tier={1} size={20} />
                            <span className="moral-theme-legend-score">มากกว่า 5.41</span>
                          </div>
                          <span className="moral-theme-legend-pill" style={{ backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>มากที่สุด</span>
                        </div>
                        <div className="moral-theme-legend-row">
                          <div className="moral-theme-legend-left">
                            <MoralSmileyIcon tier={2} size={20} />
                            <span className="moral-theme-legend-score">4.86 – 5.41</span>
                          </div>
                          <span className="moral-theme-legend-pill" style={{ backgroundColor: '#fefce8', color: '#a16207', borderColor: '#fef08a' }}>มาก</span>
                        </div>
                        <div className="moral-theme-legend-row">
                          <div className="moral-theme-legend-left">
                            <MoralSmileyIcon tier={3} size={20} />
                            <span className="moral-theme-legend-score">4.30 – 4.85</span>
                          </div>
                          <span className="moral-theme-legend-pill" style={{ backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>พอใช้</span>
                        </div>
                        <div className="moral-theme-legend-row">
                          <div className="moral-theme-legend-left">
                            <MoralSmileyIcon tier={4} size={20} />
                            <span className="moral-theme-legend-score">3.75 – 4.29</span>
                          </div>
                          <span className="moral-theme-legend-pill" style={{ backgroundColor: '#fff1f2', color: '#be123c', borderColor: '#fecdd3' }}>น้อย</span>
                        </div>
                        <div className="moral-theme-legend-row">
                          <div className="moral-theme-legend-left">
                            <MoralSmileyIcon tier={5} size={20} />
                            <span className="moral-theme-legend-score">≤ 3.74</span>
                          </div>
                          <span className="moral-theme-legend-pill" style={{ backgroundColor: '#faf5ff', color: '#7e22ce', borderColor: '#e9d5ff' }}>ควรปรับปรุง</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Feature Banner (Doctor on top) + 4 Stat KPI Cards + Province Bar Chart */}
                <div className="mdc-dashboard-right-col">
                  {/* 1. สถิติผู้เข้าร่วมประเมินดัชนีคุณธรรม (ย้ายขึ้นมาแทนที่รูปคนที่ลบออก พร้อม 3 ตารางย่อย) */}
                  <MdcProvinceBarChart
                    title="สถิติผู้เข้าร่วมประเมินดัชนีคุณธรรม"
                    module="moral_index"
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                    defaultTab="all"
                  />

                  {/* 2. 4 Stat KPI Cards in a Horizontal Row (อยู่ใต้ตารางสถิติ) */}
                  <div className="mdc-stat-kpi-row">
                    <div className="mdc-stat-kpi-card">
                      <span className="mdc-stat-kpi-num">77</span>
                      <span className="mdc-stat-kpi-label">จังหวัด</span>
                    </div>
                    <div className="mdc-stat-kpi-card">
                      <span className="mdc-stat-kpi-num">{currentData.overallScore.toFixed(2)}</span>
                      <span className="mdc-stat-kpi-label">คะแนนเฉลี่ยรวม</span>
                    </div>
                    <div className="mdc-stat-kpi-card">
                      <span className="mdc-stat-kpi-num">{topDimension.score.toFixed(2)}</span>
                      <span className="mdc-stat-kpi-label">{topDimension.label} (จุดเด่น)</span>
                    </div>
                    <div className="mdc-stat-kpi-card">
                      <span className="mdc-stat-kpi-num">{lowestDimension.score.toFixed(2)}</span>
                      <span className="mdc-stat-kpi-label">{lowestDimension.label} (เป้าหมาย)</span>
                    </div>
                  </div></div>
              </div>

              {/* 5 Datasets & Interactive Table Viewer */}
              <MdcDatasetTableViewer module="moral_index" />
              {/* Published Synergy Section (ถ้ามีการ Public Synergy มาหน้านี้) */}
              <PublishedPageSynergySection pageId="policy-1-1" pageTitle="ดัชนีคุณธรรม 5 มิติ" />
            </div>
          )}


        </div>
      </div>
    );
  }

  return (
    <div className="moral-view-container" style={{ paddingBottom: '32px' }}>
      {/* 1. Mockup Theme Hero Header Card */}
      <MoralHeroBannerCard
        isCompactMode={isDimensionView}
        backButton={
          isDimensionView
            ? {
                label: 'กลับหน้าภาพรวม',
                onClick: () => handleSelectDimension(null)
              }
            : undefined
        }
        title={
          isDimensionView && currentDimensionTitle ? (
            <>
              {currentDimensionTitle.title}{' '}
              <span className="moral-title-accent" style={{ fontSize: '0.82em', display: 'inline-block' }}>
                {currentDimensionTitle.enTitle}
              </span>
            </>
          ) : (
            <>
              ดัชนีคุณ<span className="moral-title-accent">ธรรม</span>
            </>
          )
        }
        subtitle={
          isDimensionView && currentDimensionTitle
            ? currentDimensionTitle.subtitle
            : 'รายงานสถานการณ์และดัชนีชี้คุณธรรม 5 มิติของคนไทย (พ.ศ. 2565–2568)'
        }
        onExportPdf={() =>
          exportDashboardToPdf({
            sectorTitle: 'ระดับนโยบาย',
            viewTitle: isDimensionView && currentDimensionTitle ? currentDimensionTitle.title : 'ดัชนีคุณธรรม 5 มิติ',
            viewSubtitle: isDimensionView && currentDimensionTitle ? currentDimensionTitle.subtitle : 'รายงานสถานการณ์และดัชนีชี้คุณธรรม 5 มิติของคนไทย (พ.ศ. 2565–2568)'
          })
        }
      />

      {/* 2. 6 Dimension Dome/Arch Cards - Hidden when in dimension view */}
      {!isDimensionView && (
        <div className="moral-theme-arch-cards-section">
          <div className="moral-theme-arch-cards-row">
            {ARCH_CARDS_DATA.map((card) => {
              const isActive = card.key === null
                ? (selectedDimension === null || selectedDimension === 'all')
                : (selectedDimension === card.key);

              return (
                <div
                  key={card.name}
                  className={`moral-theme-arch-card card-dim-${card.key || 'overview'} ${isActive ? 'active' : ''}`}
                  data-card-key={card.key || 'overview'}
                  onClick={() => handleSelectDimension(card.key)}
                  title={card.title}
                >
                  <div className="moral-theme-arch-card-media">
                    <img
                      src={card.bgImg}
                      alt={card.name}
                      className="moral-theme-arch-bg-img"
                    />
                  </div>
                  <span
                    className="moral-theme-arch-label"
                    style={{
                      color: '#ffffff',
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.75), 0 0 2px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {card.name}
                  </span>
                  <div
                    className="moral-theme-arch-badge"
                    style={{ background: card.badgeBg }}
                  >
                    {card.badgeIcon}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Synergy Submenu Bar (แสดงเฉพาะเมื่อเลือกมิติคุณธรรม ไม่แสดงในส่วนของปุ่มภาพรวม) */}
      {isDimensionView && currentDimensionMeta && (
        <MdcTopSynergyMenuBar
          dimensionTitle={`ดัชนี${currentDimensionMeta.name}`}
          accentColor={currentDimensionMeta.accentColor}
          topics={currentDimensionMeta.topics}
          activeTopicId={activeTopicId}
          onSelectTopic={(topicId) => setActiveTopicId(topicId)}
          onBackToOverview={() => handleSelectDimension(null)}
        />
      )}

      {isDimensionView ? (
        <MoralSynergyDimensionView
          dimension={selectedDimension as any}
          activeTopicId={activeTopicId}
          onSelectTopicId={setActiveTopicId}
          onBackToOverview={() => handleSelectDimension(null)}
        />
      ) : (
        <>
          {/* 3. Lower Section: Map & Total Evaluators (Left) + 3 Summary KPI Cards (Right) */}
          <div className="moral-theme-lower-grid">
            {/* Left: Map & Total Evaluators Panel */}
            <div className="moral-theme-map-panel">
              <div className="moral-theme-map-panel-header">
                <div className="moral-theme-map-header-left">
                  <div className="moral-theme-map-title">
                    <span className="moral-theme-title-dot" />
                    <span>แผนที่ดัชนีคุณธรรมรายภูมิภาคและรายจังหวัด (พ.ศ. {selectedYear})</span>
                  </div>
                  <p className="moral-theme-map-subtitle">
                    ระดับคะแนนเฉลี่ย 8 ภูมิภาคตามฐานข้อมูลศูนย์ข้อมูลสารสนเทศด้านคุณธรรม
                  </p>
                </div>

                <div className="moral-theme-year-pills">
                  <span className="moral-theme-year-label">ปีที่สำรวจ:</span>
                  {(['2568', '2567', '2566', '2565'] as MdcSurveyYear[]).map((y) => (
                    <button
                      key={y}
                      type="button"
                      className={`moral-theme-year-pill ${selectedYear === y ? 'active' : ''}`}
                      onClick={() => setSelectedYear(y)}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <div className="moral-theme-map-content-row">
                {/* Thailand Map */}
                <div className="moral-theme-map-container">
                  <Thailand3dShadedMap
                    height="888px"
                    scale={1.36}
                    translateX="0px"
                    translateY="-50px"
                    getProvinceFill={getProvinceMapFill}
                    isProvinceInSelectedRegion={(id) => Boolean(selectedRegion && getMdcRegionKey(id) === selectedRegion)}
                    isProvinceInHoveredRegion={(id) => Boolean(hoveredRegion && getMdcRegionKey(id) === hoveredRegion)}
                    hoveredRegionKey={hoveredRegion}
                    regionalScoreDialogs={regionalScoreDialogs}
                    hoveredProvinceName={hoveredProvince}
                    onRegionalDialogClick={(rKey) => setSelectedRegion((prev) => (prev === rKey ? null : rKey))}
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
                      const rKey = getMdcRegionKey(loc.id);
                      setSelectedRegion((prev) => (prev === rKey ? null : rKey));
                    }}
                  />
                </div>
              </div>

              {/* แถบอธิบายค่าสีของดัชนีคุณธรรม (Color Legend Dialog) ด้านขวาของ Frame (icon ยิ้ม) */}
              <div className="moral-theme-map-legend-dialog">
                <div className="moral-theme-legend-header">
                  <div className="moral-theme-legend-title-row">
                    <span className="moral-theme-legend-dot" style={{ backgroundColor: '#92c784' }} />
                    <span className="moral-theme-legend-title">เกณฑ์ระดับคะแนนดัชนีคุณธรรม</span>
                  </div>
                  <span className="moral-theme-legend-sub">(เต็ม 6.00 คะแนน)</span>
                </div>
                <div className="moral-theme-legend-list">
                  <div className="moral-theme-legend-row">
                    <div className="moral-theme-legend-left">
                      <MoralSmileyIcon tier={1} size={20} />
                      <span className="moral-theme-legend-score">มากกว่า 5.41</span>
                    </div>
                    <span className="moral-theme-legend-pill" style={{ backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>มากที่สุด</span>
                  </div>
                  <div className="moral-theme-legend-row">
                    <div className="moral-theme-legend-left">
                      <MoralSmileyIcon tier={2} size={20} />
                      <span className="moral-theme-legend-score">4.86 – 5.41</span>
                    </div>
                    <span className="moral-theme-legend-pill" style={{ backgroundColor: '#fefce8', color: '#a16207', borderColor: '#fef08a' }}>มาก</span>
                  </div>
                  <div className="moral-theme-legend-row">
                    <div className="moral-theme-legend-left">
                      <MoralSmileyIcon tier={3} size={20} />
                      <span className="moral-theme-legend-score">4.30 – 4.85</span>
                    </div>
                    <span className="moral-theme-legend-pill" style={{ backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>พอใช้</span>
                  </div>
                  <div className="moral-theme-legend-row">
                    <div className="moral-theme-legend-left">
                      <MoralSmileyIcon tier={4} size={20} />
                      <span className="moral-theme-legend-score">3.75 – 4.29</span>
                    </div>
                    <span className="moral-theme-legend-pill" style={{ backgroundColor: '#fff1f2', color: '#be123c', borderColor: '#fecdd3' }}>น้อย</span>
                  </div>
                  <div className="moral-theme-legend-row">
                    <div className="moral-theme-legend-left">
                      <MoralSmileyIcon tier={5} size={20} />
                      <span className="moral-theme-legend-score">≤ 3.74</span>
                    </div>
                    <span className="moral-theme-legend-pill" style={{ backgroundColor: '#faf5ff', color: '#7e22ce', borderColor: '#e9d5ff' }}>ควรปรับปรุง</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary KPIs Stack */}
            <div className="moral-theme-kpi-stack">
              {/* Card 1: คะแนนเฉลี่ยรวม */}
              <div className="moral-theme-score-card-css theme-orange">
                <div className="moral-theme-score-card-top">
                  <div className="moral-theme-score-card-title-wrap">
                    <div className="moral-theme-score-card-icon-wrap">
                      <ShieldCheck size={18} strokeWidth={2.2} />
                    </div>
                    <span className="moral-theme-score-card-title">คะแนนเฉลี่ยรวม</span>
                  </div>
                  <span className="moral-theme-score-card-tier-pill">
                    {getMoralTierInfo(currentData.overallScore).tier}
                  </span>
                </div>

                <div className="moral-theme-score-card-bottom">
                  <div className="moral-theme-score-card-values">
                    <span className="moral-theme-score-card-num">
                      {currentData.overallScore.toFixed(2)}
                    </span>
                    <span className="moral-theme-score-card-sub">
                      / 6.0 ({(currentData.overallScore / 6 * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: จุดเด่นสังคมไทย (อันดับ 1) */}
              <div className="moral-theme-score-card-css theme-green">
                <div className="moral-theme-score-card-top">
                  <div className="moral-theme-score-card-title-wrap">
                    <div className="moral-theme-score-card-icon-wrap">
                      <Award size={18} strokeWidth={2.2} />
                    </div>
                    <span className="moral-theme-score-card-title">จุดเด่นสังคมไทย (อันดับ 1)</span>
                  </div>
                  <span className="moral-theme-score-card-tier-pill">อันดับ 1 สูงสุด</span>
                </div>

                <div className="moral-theme-score-card-bottom">
                  <div className="moral-theme-score-card-values">
                    <span className="moral-theme-score-card-label">{topDimension.label}</span>
                    <span className="moral-theme-score-card-num">
                      {topDimension.score.toFixed(2)}
                    </span>
                    <span className="moral-theme-score-card-sub">/ 6.0</span>
                  </div>
                </div>
              </div>

              {/* Card 3: เป้าหมายยกระดับคุณธรรม */}
              <div className="moral-theme-score-card-css theme-coral">
                <div className="moral-theme-score-card-top">
                  <div className="moral-theme-score-card-title-wrap">
                    <div className="moral-theme-score-card-icon-wrap">
                      <TrendingUp size={18} strokeWidth={2.2} />
                    </div>
                    <span className="moral-theme-score-card-title">เป้าหมายยกระดับคุณธรรม</span>
                  </div>
                  <span className="moral-theme-score-card-tier-pill">เป้าหมายส่งเสริม</span>
                </div>

                <div className="moral-theme-score-card-bottom">
                  <div className="moral-theme-score-card-values">
                    <span className="moral-theme-score-card-label">สุจริตและพอเพียง</span>
                    <span className="moral-theme-score-card-num">
                      {targetScore.toFixed(2)}
                    </span>
                    <span className="moral-theme-score-card-sub">/ 6.0</span>
                  </div>
                </div>
              </div>

              {/* เครื่องมือวัดคุณธรรมของคนไทย 5 มิติ (Morality Index Radar Profile) */}
              <div
                className="moral-card-panel moral-bottom-dialog-3d"
                style={{
                  borderRadius: '16px',
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  border: '1.5px solid rgba(191, 219, 254, 0.5)',
                  boxShadow: '0 4px 20px rgba(30, 64, 175, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)'
                }}
              >
                <div
                  style={{
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '22.5px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                      เครื่องมือวัดคุณธรรมของคนไทย 5 มิติ
                    </h3>
                    <p style={{ fontSize: '17px', fontWeight: 600, color: '#475569', margin: '4px 0 0 0' }}>
                      (Morality Index Radar Profile — ปี {selectedYear})
                    </p>
                  </div>
                </div>

                {/* Radar Chart 5 Dimensions (ใส่คะแนน/สี/ไล่เฉดเข้มขอบสู่ขาวตรงกลาง/ตัวอักษรใหญ่ขึ้น 50%) */}
                <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MoralDimensionsRadarChart
                    dimensions={currentData.dimensions}
                    selectedDimension={selectedDimension}
                    onDimensionClick={(dimKey) => handleSelectDimension(selectedDimension === dimKey ? null : dimKey)}
                  />
                </div>

                {/* ปุ่มแนวโน้มดัชนีคุณธรรม (ย้ายมาไว้ด้านล่างขวาของ Frame) */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginTop: '10px',
                    width: '100%'
                  }}
                >
                  <button
                    type="button"
                    className={`moral-theme-trend-toggle-btn ${showMoralTrend ? 'active' : ''}`}
                    onClick={() => {
                      setShowMoralTrend((prev) => {
                        const nextState = !prev;
                        if (nextState) {
                          setTimeout(() => {
                            document.getElementById('moral-dimensions-trend-section')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                        return nextState;
                      });
                    }}
                    title="คลิกเพื่อดูแนวโน้มคะแนน 5 มิติคุณธรรมย้อนหลัง 4 ปี (พ.ศ. 2565–2568)"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: showMoralTrend ? '1.5px solid #1d4ed8' : '1.5px solid #93c5fd',
                      backgroundColor: showMoralTrend ? '#1d4ed8' : '#eff6ff',
                      color: showMoralTrend ? '#ffffff' : '#1e40af',
                      boxShadow: showMoralTrend ? '0 4px 14px rgba(29, 78, 216, 0.28)' : '0 2px 6px rgba(37, 99, 235, 0.1)',
                      transition: 'all 0.22s ease',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    <TrendingUp size={16} strokeWidth={2.4} />
                    <span>{showMoralTrend ? 'ย่อแนวโน้ม' : 'แนวโน้มดัชนีคุณธรรม'}</span>
                    <ChevronDown
                      size={15}
                      style={{
                        transform: showMoralTrend ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.25s ease'
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* การ์ดจำนวนผู้ร่วมประเมินทั้งหมด (Pure CSS & Real Text & Shade) */}
              <div className="moral-theme-evaluators-card-css">
                {/* 1. Header: Gradient Blue, Live Text, Metric & Users Badge */}
                <div className="moral-theme-eval-header-css">
                  <svg className="moral-theme-eval-header-wave" viewBox="0 0 320 28" preserveAspectRatio="none" aria-hidden="true">
                    <path
                      d="M0,28 C80,10 160,26 230,12 C270,4 295,14 320,8 L320,28 Z"
                      fill="rgba(255, 255, 255, 0.16)"
                    />
                    <path
                      d="M0,28 C70,16 150,22 220,16 C265,12 290,20 320,14 L320,28 Z"
                      fill="rgba(255, 255, 255, 0.1)"
                    />
                  </svg>

                  <div className="moral-theme-eval-header-top">
                    <div className="moral-theme-eval-title-wrap">
                      <div className="moral-theme-eval-icon-circle">
                        <Users size={16} strokeWidth={2.4} />
                      </div>
                      <span className="moral-theme-eval-title">จำนวนผู้ร่วมประเมินทั้งหมด</span>
                    </div>
                  </div>

                  <div className="moral-theme-eval-header-bottom">
                    <div className="moral-theme-eval-number-wrap">
                      <span className="moral-theme-eval-number">
                        {currentData.totalSurvey.toLocaleString()}
                      </span>
                      <span className="moral-theme-eval-unit">คน</span>
                    </div>

                    <button
                      type="button"
                      className={`moral-theme-eval-header-btn ${showEvaluatorDemographics ? 'expanded' : ''}`}
                      onClick={() => {
                        setShowEvaluatorDemographics((prev) => {
                          const nextState = !prev;
                          if (nextState) {
                            setTimeout(() => {
                              document.getElementById('moral-evaluators-demographics-section')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }
                          return nextState;
                        });
                      }}
                      title="ดูข้อมูลเจาะลึกผู้ร่วมประเมิน (เพศ, อายุ, แนวโน้ม 4 ปี)"
                    >
                      <span>{showEvaluatorDemographics ? 'ย่อข้อมูล' : 'เพิ่มเติม'}</span>
                      <ChevronDown
                        size={15}
                        style={{
                          transform: showEvaluatorDemographics ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.25s ease'
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Multi-Year Comparative Trend for 5 Moral Dimensions (พ.ศ. 2565–2568) - เมื่อกดปุ่ม "แนวโน้มดัชนีคุณธรรม" นี้เท่านั้น */}
          {showMoralTrend && (
            <div id="moral-dimensions-trend-section" className="moral-theme-deep-analytics-content" style={{ marginTop: '24px' }}>
              <div style={{ marginBottom: '22px' }}>
                <Isometric3dMultiLayerChart
                  title="แนวโน้มคะแนน 5 มิติคุณธรรมย้อนหลัง 4 ปี (พ.ศ. 2565–2568)"
                  subtitle="เปรียบเทียบพัฒนาการในแต่ละมิติตามผลสำรวจของศูนย์กลางข้อมูลสารสนเทศด้านคุณธรรม"
                  data={multiYearDimensionsTrend}
                  series={MORAL_DIMENSIONS_SERIES_CONFIG}
                  minScore={3.8}
                  maxScore={6.0}
                  scoreStep={0.4}
                  fullScore={6.0}
                  scoreSuffix="6.0"
                />
              </div>
            </div>
          )}

          {/* 5. Demographics Section: Gender, Age & 4-Year Participation Trend - เมื่อกดปุ่ม "เพิ่มเติม" เท่านั้น */}
          {showEvaluatorDemographics && (
            <div id="moral-evaluators-demographics-section" className="moral-theme-deep-analytics-content" style={{ marginTop: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '20px', marginBottom: '22px' }}>
                {/* Gender Breakdown Card */}
                <div className="moral-card-panel moral-bottom-dialog-3d">
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>เพศผู้ร่วมประเมิน</h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0' }}>สัดส่วนผู้ตอบแบบสอบถาม (ปี {selectedYear})</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', height: '160px' }}>
                    <div style={{ width: '130px', height: '130px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genderData}
                            innerRadius={36}
                            outerRadius={58}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {genderData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(val: any) => [`${val}%`, 'สัดส่วน']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ flex: 1, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {genderData.map((g) => (
                        <div key={g.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: g.color }} />
                            <span style={{ color: '#334155', fontWeight: 500 }}>{g.name}</span>
                          </div>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{g.value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Age Breakdown Card */}
                <div className="moral-card-panel moral-bottom-dialog-3d">
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>อายุผู้ร่วมประเมิน</h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0' }}>การกระจายตัวตามกลุ่มวัย (ปี {selectedYear})</p>
                  </div>

                  <div style={{ width: '100%', height: '160px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 10 }} unit="%" />
                        <YAxis dataKey="group" type="category" tick={{ fontSize: 10, fill: '#475569' }} width={100} />
                        <RechartsTooltip formatter={(val: any) => [`${val}%`, 'สัดส่วน']} />
                        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                          {ageData.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4-Year Survey Participation Trend (2565-2568) */}
                <div className="moral-card-panel moral-bottom-dialog-3d">
                  <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        แนวโน้มผู้ร่วมประเมิน 4 ปี (พ.ศ. 2565–2568)
                      </h4>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0' }}>
                        รวมกลุ่มตัวอย่างสะสม 108,453 คน
                      </p>
                    </div>
                    <div style={{ padding: '3px 8px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: 700 }}>
                      +110.1% เติบโต
                    </div>
                  </div>

                  <div style={{ width: '100%', height: '160px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MDC_MULTI_YEAR_OVERVIEW} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                        <RechartsTooltip formatter={(val: any) => [`${Number(val).toLocaleString()} คน`, 'ผู้ร่วมประเมิน']} />
                        <Bar dataKey="respondents" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Published Synergy Section (ถ้ามีการ Public Synergy มาหน้านี้) */}
      <PublishedPageSynergySection pageId="policy-1-1" pageTitle="ดัชนีคุณธรรม 5 มิติ" />
    </div>
  );
};
