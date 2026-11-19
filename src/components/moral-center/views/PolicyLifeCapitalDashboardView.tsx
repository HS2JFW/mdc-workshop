import { PublishedPageSynergySection } from '../components/PublishedPageSynergySection';
import React, { useState, useMemo } from 'react';
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
import { LifeCapitalSynergyPillarView } from '../components/LifeCapitalSynergyPillarView';
import { MoralSmileyIcon } from '../components/MoralSmileyIcon';
import { LifeCapitalPillarsRadarChart } from '../components/LifeCapitalPillarsRadarChart';
import type { MdcSurveyYear } from '../data/moralMdcSurveyData';
import {
  MDC_MORAL_LIFE_DATA,
  MDC_MULTI_YEAR_OVERVIEW,
  getMdcRegionKey,
  getLifeTierInfo
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
import { getLifeCapitalPillarMeta, getAllLifeCapitalSynergyTopics } from '../components/LifeCapitalSynergyPillarView';

const PILLAR_TITLE_MAP: Record<string, { title: string; enTitle: string; subtitle: string }> = {
  family: {
    title: 'ดัชนีทุนชีวิต: พลังครอบครัว',
    enTitle: '(Family Capital & Care)',
    subtitle: 'การวิเคราะห์ความสัมพันธ์และการผนึกกำลังข้อมูล (Data Synergy)'
  },
  talent: {
    title: 'ดัชนีทุนชีวิต: พลังสร้างปัญญา & ที่ทำงาน',
    enTitle: '(Wisdom & Workplace Capital)',
    subtitle: 'การวิเคราะห์ความสัมพันธ์และการผนึกกำลังข้อมูล (Data Synergy)'
  },
  friend: {
    title: 'ดัชนีทุนชีวิต: พลังเพื่อนและกิจกรรม',
    enTitle: '(Peer & Creative Activity Capital)',
    subtitle: 'การวิเคราะห์ความสัมพันธ์และการผนึกกำลังข้อมูล (Data Synergy)'
  },
  community: {
    title: 'ดัชนีทุนชีวิต: พลังชุมชน',
    enTitle: '(Community Capital & Solidarity)',
    subtitle: 'การวิเคราะห์ความสัมพันธ์และการผนึกกำลังข้อมูล (Data Synergy)'
  },
  identity: {
    title: 'ดัชนีทุนชีวิต: พลังตัวตน',
    enTitle: '(Identity & Self-Worth Capital)',
    subtitle: 'การวิเคราะห์ความสัมพันธ์และการผนึกกำลังข้อมูล (Data Synergy)'
  }
};

const LIFE_PILLARS_SERIES_CONFIG: IsometricSeriesConfig[] = [
  { key: 'identity', name: 'พลังตัวตน', icon: '🧘', color: '#2563eb' },
  { key: 'family', name: 'พลังครอบครัว', icon: '🏡', color: '#ec4899' },
  { key: 'organization', name: 'พลังที่ทำงาน/สถานศึกษา', icon: '🏢', color: '#059669' },
  { key: 'talent', name: 'พลังสร้างปัญญา', icon: '💡', color: '#7c3aed' },
  { key: 'friend', name: 'พลังเพื่อนและกิจกรรม', icon: '👥', color: '#d97706' },
  { key: 'community', name: 'พลังชุมชน', icon: '🏘️', color: '#0284c7' }
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

const LIFE_ARCH_CARDS_DATA: ArchCardConfig[] = [
  {
    key: null,
    name: 'ภาพรวม',
    title: 'คลิกเพื่อดูภาพรวม 6 พลังทุนชีวิต',
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
    key: 'family',
    name: 'พลังครอบครัว',
    title: 'พลังครอบครัว (คลิกเพื่อเจาะลึก)',
    bgImg: '/theme/card_bg_family.svg',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
    badgeBg: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    badgeIcon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  {
    key: 'talent',
    name: 'พลังสร้างปัญญา & ที่ทำงาน',
    title: 'พลังสร้างปัญญา & ที่ทำงาน (คลิกเพื่อเจาะลึก)',
    bgImg: '/theme/card_bg_talent.svg',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
    badgeBg: 'linear-gradient(135deg, #059669, #10b981)',
    badgeIcon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"/>
        <path d="M10 22h4"/>
        <path d="M12 2v1"/>
        <circle cx="12" cy="11" r="5"/>
      </svg>
    )
  },
  {
    key: 'friend',
    name: 'พลังเพื่อนและกิจกรรม',
    title: 'พลังเพื่อนและกิจกรรม (คลิกเพื่อเจาะลึก)',
    bgImg: '/theme/card_bg_friend.svg',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
    badgeBg: 'linear-gradient(135deg, #0284c7, #1d4ed8)',
    badgeIcon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  {
    key: 'community',
    name: 'พลังชุมชน',
    title: 'พลังชุมชน (คลิกเพื่อเจาะลึก)',
    bgImg: '/theme/card_bg_community.svg',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
    badgeBg: 'linear-gradient(135deg, #059669, #10b981)',
    badgeIcon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18"/>
        <path d="M5 21V7l8-4v18"/>
        <path d="M19 21V11l-6-4"/>
      </svg>
    )
  },
  {
    key: 'identity',
    name: 'พลังตัวตน',
    title: 'พลังตัวตน (คลิกเพื่อเจาะลึก)',
    bgImg: '/theme/card_bg_identity.svg',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.55)',
    badgeBg: 'linear-gradient(135deg, #1d4ed8, #0284c7)',
    badgeIcon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  }
];

export interface PolicyLifeCapitalDashboardViewProps {
  onNavigatePage?: (pageId: string) => void;
}

export const PolicyLifeCapitalDashboardView: React.FC<PolicyLifeCapitalDashboardViewProps> = ({
  onNavigatePage
}) => {
  const { language, setLanguage } = useMoralLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<MdcSurveyYear>('2568');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string>('family_juvenile');
  const [showLifeTrend, setShowLifeTrend] = useState(false);
  const [showEvaluatorDemographics, setShowEvaluatorDemographics] = useState(false);
  const [overviewSynergyFilter, setOverviewSynergyFilter] = useState<string>('all');

  const handleSelectPillar = (pillarKey: string | null) => {
    setSelectedPillar(pillarKey);
    if (pillarKey && pillarKey !== 'all') {
      const meta = getLifeCapitalPillarMeta(pillarKey);
      if (meta && meta.topics.length > 0) {
        setActiveTopicId(meta.topics[0].id);
      }
    }
  };

  const currentPillarMeta = React.useMemo(() => {
    if (!selectedPillar || selectedPillar === 'all') return null;
    return getLifeCapitalPillarMeta(selectedPillar);
  }, [selectedPillar]);

  // All 25 Life Capital Synergy Topics for Overview bar
  const allLifeCapitalSynergyTopics = React.useMemo(() => {
    return getAllLifeCapitalSynergyTopics();
  }, []);

  const overviewFilterTabs = React.useMemo(() => [
    { key: 'all', label: 'ทั้งหมด', count: allLifeCapitalSynergyTopics.length },
    { key: 'family', label: 'ครอบครัว', count: 6, color: '#059669' },
    { key: 'talent', label: 'ปัญญา/ที่ทำงาน', count: 5, color: '#7c3aed' },
    { key: 'friend', label: 'เพื่อน/กิจกรรม', count: 4, color: '#d97706' },
    { key: 'community', label: 'ชุมชน', count: 5, color: '#0284c7' },
    { key: 'identity', label: 'ตัวตน', count: 5, color: '#1d4ed8' }
  ], [allLifeCapitalSynergyTopics]);

  const displayedOverviewTopics = allLifeCapitalSynergyTopics;

  const handleSynergyTopicClick = (topicId: string, topic?: any) => {
    if (topic && topic.dimensionKey) {
      setSelectedPillar(topic.dimensionKey);
      setActiveTopicId(topicId);
    } else {
      setActiveTopicId(topicId);
    }
  };

  const currentData = MDC_MORAL_LIFE_DATA[selectedYear];

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

  // Multi-Year Trend Data for 6 Pillars across 2565-2568
  const multiYearPillarsTrend = (['2565', '2566', '2567', '2568'] as MdcSurveyYear[]).map((y) => {
    const d = MDC_MORAL_LIFE_DATA[y];
    return {
      year: y,
      overall: d.overallScore,
      identity: d.pillars.identity,
      family: d.pillars.family,
      talent: d.pillars.talent,
      organization: d.pillars.organization,
      friend: d.pillars.friend,
      community: d.pillars.community
    };
  });

  // Dynamic Map Fill Function for Life Capital Standard Tier
  // >= 80.00: น้ำเงิน (#5082ef) | 70.00 - 79.99: สีเขียว (#44b56e) | 60.00 - 69.99: สีส้ม (#ee793d) | < 60.00: สีแดง (#e35151)
  const getProvinceMapFill = (id: string, _name: string): string => {
    const regKey = getMdcRegionKey(id);
    const regInfo = currentData.regions[regKey];
    const tierInfo = regInfo ? getLifeTierInfo(regInfo.score) : null;
    const baseColor = tierInfo ? tierInfo.color : '#44b56e';

    // เมื่อกดเลือกภูมิภาค ให้ปรับเป็นสีเหลืองทอง (#f59e0b)
    if (selectedRegion && selectedRegion === regKey) {
      if (hoveredRegion && hoveredRegion === regKey) {
        return '#fbbf24';
      }
      return '#f59e0b';
    }

    if (hoveredRegion && hoveredRegion === regKey) {
      return tierInfo ? tierInfo.hoverColor : '#5fc284';
    }

    return baseColor;
  };

  // Regional Score Dialogs for 3D Map (รูปแบบ 3D Dialog พร้อมไอคอนหน้าแสดงอารมณ์ตามระดับคะแนน และลูกศรแนวโน้มเทียบปีก่อนหน้า)
  const regionalScoreDialogs = useMemo(() => {
    const prevYearMap: Record<MdcSurveyYear, MdcSurveyYear | null> = {
      '2568': '2567',
      '2567': '2566',
      '2566': '2565',
      '2565': null, // ปี 2565 เป็นปีสำรวจแรก จึงไม่ต้องแสดงลูกศรเปรียบเทียบ
    };
    const prevYear = prevYearMap[selectedYear];
    const prevYearData = prevYear ? MDC_MORAL_LIFE_DATA[prevYear] : null;

    return (['North', 'Northeast', 'Central', 'West', 'East', 'South'] as const).map((rKey) => {
      const reg = currentData.regions[rKey];
      const tierInfo = getLifeTierInfo(reg.score);

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
        color: tierInfo.textColor || tierInfo.color,
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

  // Top Pillar for Card 2 (จุดเด่นทุนชีวิตคนไทย)
  const topPillar = useMemo(() => {
    const pillarList = [
      { key: 'family', label: 'พลังครอบครัว', score: currentData.pillars.family },
      { key: 'talent', label: 'พลังสร้างปัญญา', score: currentData.pillars.talent },
      { key: 'organization', label: 'พลังที่ทำงาน', score: currentData.pillars.organization },
      { key: 'friend', label: 'พลังเพื่อนและกิจกรรม', score: currentData.pillars.friend },
      { key: 'community', label: 'พลังชุมชน', score: currentData.pillars.community },
      { key: 'identity', label: 'พลังตัวตน', score: currentData.pillars.identity },
    ];
    return pillarList.sort((a, b) => b.score - a.score)[0];
  }, [currentData]);

  // Target Pillar for Card 3 (เป้าหมายยกระดับทุนชีวิต)
  const targetPillar = useMemo(() => {
    const pillarList = [
      { key: 'family', label: 'พลังครอบครัว', score: currentData.pillars.family },
      { key: 'talent', label: 'พลังสร้างปัญญา', score: currentData.pillars.talent },
      { key: 'organization', label: 'พลังที่ทำงาน', score: currentData.pillars.organization },
      { key: 'friend', label: 'พลังเพื่อนและกิจกรรม', score: currentData.pillars.friend },
      { key: 'community', label: 'พลังชุมชน', score: currentData.pillars.community },
      { key: 'identity', label: 'พลังตัวตน', score: currentData.pillars.identity },
    ];
    return pillarList.sort((a, b) => a.score - b.score)[0];
  }, [currentData]);

  const isPillarView = Boolean(selectedPillar && selectedPillar !== 'all');
  const currentPillarTitle = selectedPillar && PILLAR_TITLE_MAP[selectedPillar]
    ? PILLAR_TITLE_MAP[selectedPillar]
    : null;

  const { theme } = useMoralTheme();

  const mdcLifeCardItems: MdcSubmenuCardItem[] = [
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
      isActive: selectedPillar === null || selectedPillar === 'all',
      onClick: () => handleSelectPillar(null)
    },
    {
      key: 'family',
      name: 'พลังครอบครัว',
      colorType: 'teal',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      isActive: selectedPillar === 'family',
      onClick: () => handleSelectPillar('family')
    },
    {
      key: 'talent',
      name: 'พลังสร้างปัญญา',
      colorType: 'purple',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
      isActive: selectedPillar === 'talent',
      onClick: () => handleSelectPillar('talent')
    },
    {
      key: 'friend',
      name: 'พลังเพื่อนและกิจกรรม',
      colorType: 'amber',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      isActive: selectedPillar === 'friend',
      onClick: () => handleSelectPillar('friend')
    },
    {
      key: 'community',
      name: 'พลังชุมชน',
      colorType: 'blue',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
          <path d="M9 9h1"/>
          <path d="M9 13h1"/>
          <path d="M9 17h1"/>
        </svg>
      ),
      isActive: selectedPillar === 'community',
      onClick: () => handleSelectPillar('community')
    },
    {
      key: 'identity',
      name: 'พลังตัวตน',
      colorType: 'pattern',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4"/>
          <path d="M6 21v-2a6 6 0 0 1 12 0v2"/>
        </svg>
      ),
      isActive: selectedPillar === 'identity',
      onClick: () => handleSelectPillar('identity')
    }
  ];

  if (theme === 'thai-modern') {
    return (
      <div className="mdc-layout-root">
        {/* Main Dashboard Content */}
        <div className="mdc-main-dashboard-pane">
          {/* Top Search Bar Row */}
          <MdcTopSearchBar
            activePillar="policy-1-2"
            onNavigatePillar={onNavigatePage}
            onExportPdf={() =>
              exportDashboardToPdf({
                sectorTitle: 'ระดับนโยบาย',
                viewTitle: isPillarView && currentPillarTitle ? currentPillarTitle.title : 'ทุนชีวิต 6 พลัง',
                viewSubtitle: isPillarView && currentPillarTitle ? currentPillarTitle.subtitle : 'รายงานสถานการณ์ระบบนิเวศต้นทุนชีวิต 6 พลังของคนไทย (พ.ศ. 2565–2568)'
              })
            }
          />

          {/* Top Submenu Bar (directly below search bar - preserving exact 130px x 106px card size and formatting) */}
          <MdcTopSubmenuBar
            title="มิติการวิเคราะห์ข้อมูลทุนชีวิต"
            items={mdcLifeCardItems}
          />

          {/* Top Synergy Submenu Bar (แสดงเฉพาะเมื่อเลือกพลังทุนชีวิต ไม่แสดงในส่วนของปุ่มภาพรวม) */}
          {isPillarView && currentPillarMeta && (
            <MdcTopSynergyMenuBar
              dimensionTitle={currentPillarMeta.name}
              accentColor={currentPillarMeta.accentColor}
              topics={currentPillarMeta.topics}
              activeTopicId={activeTopicId}
              onSelectTopic={(topicId) => setActiveTopicId(topicId)}
              onBackToOverview={() => handleSelectPillar(null)}
            />
          )}

          {isPillarView ? (
            <div style={{ padding: '20px 20px 32px 20px' }}>
              <LifeCapitalSynergyPillarView
                pillar={selectedPillar as any}
                activeTopicId={activeTopicId}
                onSelectTopicId={setActiveTopicId}
                onBackToOverview={() => handleSelectPillar(null)}
              />
            </div>
          ) : (
            <div className="mdc-dashboard-body" style={{ paddingBottom: '32px' }}>
              {/* Main Content Row: Left (Map ~46%) | Right (Stats & Bar Chart ~54%) */}
              <div className="mdc-main-split-grid">
                {/* Left: Map Card */}
                <div className="mdc-map-card">
                  <div className="mdc-map-card-header">
                    <h3 className="mdc-map-card-title">แผนที่แสดงทุนชีวิต</h3>
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

                    {/* ตารางเล็กๆ ด้านล่างขวาของแผนที่ สำหรับบอกค่าสีของคะแนน (Color Legend Dialog icon ยิ้ม) */}
                    <div className="moral-theme-map-legend-dialog">
                      <div className="moral-theme-legend-header">
                        <div className="moral-theme-legend-title-row">
                          <span className="moral-theme-legend-dot" style={{ backgroundColor: '#92c784' }} />
                          <span className="moral-theme-legend-title">เกณฑ์ระดับคะแนนทุนชีวิต</span>
                        </div>
                        <span className="moral-theme-legend-sub">(เต็ม 100 คะแนน)</span>
                      </div>
                      <div className="moral-theme-legend-list">
                        <div className="moral-theme-legend-row">
                          <div className="moral-theme-legend-left">
                            <MoralSmileyIcon tier={1} size={20} />
                            <span className="moral-theme-legend-score">80.00 คะแนนขึ้นไป</span>
                          </div>
                          <span className="moral-theme-legend-pill" style={{ backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>ดีมาก</span>
                        </div>
                        <div className="moral-theme-legend-row">
                          <div className="moral-theme-legend-left">
                            <MoralSmileyIcon tier={2} size={20} />
                            <span className="moral-theme-legend-score">70.00 – 79.99</span>
                          </div>
                          <span className="moral-theme-legend-pill" style={{ backgroundColor: '#fefce8', color: '#a16207', borderColor: '#fef08a' }}>ดี</span>
                        </div>
                        <div className="moral-theme-legend-row">
                          <div className="moral-theme-legend-left">
                            <MoralSmileyIcon tier={3} size={20} />
                            <span className="moral-theme-legend-score">60.00 – 69.99</span>
                          </div>
                          <span className="moral-theme-legend-pill" style={{ backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>พอใช้</span>
                        </div>
                        <div className="moral-theme-legend-row">
                          <div className="moral-theme-legend-left">
                            <MoralSmileyIcon tier={5} size={20} />
                            <span className="moral-theme-legend-score">ต่ำกว่า 60.00</span>
                          </div>
                          <span className="moral-theme-legend-pill" style={{ backgroundColor: '#faf5ff', color: '#7e22ce', borderColor: '#e9d5ff' }}>ควรปรับปรุง</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Evaluator Stats Chart on Top + 4 Stat KPI Cards Below */}
                <div className="mdc-dashboard-right-col">
                  {/* 1. สถิติผู้เข้าร่วมประเมินต้นทุนชีวิต (ย้ายขึ้นมาแทนที่รูปคนที่ลบออก พร้อม 3 ตารางย่อย) */}
                  <MdcProvinceBarChart
                    title="สถิติผู้เข้าร่วมประเมินต้นทุนชีวิต"
                    module="life_capital"
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
                      <span className="mdc-stat-kpi-num">{topPillar.score.toFixed(2)}</span>
                      <span className="mdc-stat-kpi-label">{topPillar.label} (จุดเด่น)</span>
                    </div>
                    <div className="mdc-stat-kpi-card">
                      <span className="mdc-stat-kpi-num">{targetPillar.score.toFixed(2)}</span>
                      <span className="mdc-stat-kpi-label">{targetPillar.label} (เป้าหมาย)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5 Datasets & Interactive Table Viewer */}
              <MdcDatasetTableViewer module="life_capital" />
              {/* Published Synergy Section (ถ้ามีการ Public Synergy มาหน้านี้) */}
              <PublishedPageSynergySection pageId="policy-1-2" pageTitle="ทุนชีวิต (Life Capital)" />
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
        isCompactMode={isPillarView}
        backButton={
          isPillarView
            ? {
                label: 'กลับหน้าภาพรวม',
                onClick: () => handleSelectPillar(null)
              }
            : undefined
        }
        title={
          isPillarView && currentPillarTitle ? (
            <>
              {currentPillarTitle.title}{' '}
              <span className="moral-title-accent" style={{ fontSize: '0.82em', display: 'inline-block' }}>
                {currentPillarTitle.enTitle}
              </span>
            </>
          ) : (
            <>
              ทุน<span className="moral-title-accent">ชีวิต</span>
            </>
          )
        }
        subtitle={
          isPillarView && currentPillarTitle
            ? currentPillarTitle.subtitle
            : 'รายงานสถานการณ์ระบบนิเวศต้นทุนชีวิต 6 พลังของคนไทย (พ.ศ. 2565–2568)'
        }
        onExportPdf={() =>
          exportDashboardToPdf({
            sectorTitle: 'ระดับนโยบาย',
            viewTitle: isPillarView && currentPillarTitle ? currentPillarTitle.title : 'ทุนชีวิต 6 พลัง',
            viewSubtitle: isPillarView && currentPillarTitle ? currentPillarTitle.subtitle : 'รายงานสถานการณ์ระบบนิเวศต้นทุนชีวิต 6 พลังของคนไทย (พ.ศ. 2565–2568)'
          })
        }
      />

      {/* 2. 6 Pillar Dome/Arch Cards - Hidden when in pillar view */}
      {!isPillarView && (
        <div className="moral-theme-arch-cards-section">
          <div className="moral-theme-arch-cards-row">
            {LIFE_ARCH_CARDS_DATA.map((card) => {
              const isActive = card.key === null
                ? (selectedPillar === null || selectedPillar === 'all')
                : (selectedPillar === card.key);

              return (
                <div
                  key={card.name}
                  className={`moral-theme-arch-card card-pillar-${card.key || 'overview'} ${isActive ? 'active' : ''}`}
                  data-card-key={card.key || 'overview'}
                  onClick={() => handleSelectPillar(card.key)}
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

      {/* Top Synergy Submenu Bar (แสดงเฉพาะเมื่อเลือกพลังทุนชีวิต ไม่แสดงในส่วนของปุ่มภาพรวม) */}
      {isPillarView && currentPillarMeta && (
        <MdcTopSynergyMenuBar
          dimensionTitle={currentPillarMeta.name}
          accentColor={currentPillarMeta.accentColor}
          topics={currentPillarMeta.topics}
          activeTopicId={activeTopicId}
          onSelectTopic={(topicId) => setActiveTopicId(topicId)}
          onBackToOverview={() => handleSelectPillar(null)}
        />
      )}

      {isPillarView ? (
        <LifeCapitalSynergyPillarView
          pillar={selectedPillar as any}
          activeTopicId={activeTopicId}
          onSelectTopicId={setActiveTopicId}
          onBackToOverview={() => handleSelectPillar(null)}
        />
      ) : (
        <>
          {/* 3. Lower Section: Map & Total Evaluators (Left) + 3 Summary KPI Cards (Right) */}
          <div className="moral-theme-lower-grid">
            {/* Left: Map Panel */}
            <div className="moral-theme-map-panel">
              <div className="moral-theme-map-panel-header">
                <div className="moral-theme-map-header-left">
                  <div className="moral-theme-map-title">
                    <span className="moral-theme-title-dot" />
                    <span>แผนที่คะแนนทุนชีวิตรายภูมิภาคและรายจังหวัด (พ.ศ. {selectedYear})</span>
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

              {/* แถบอธิบายค่าสีของทุนชีวิต (Color Legend Dialog) ด้านขวาของ Frame (icon ยิ้ม) */}
              <div className="moral-theme-map-legend-dialog">
                <div className="moral-theme-legend-header">
                  <div className="moral-theme-legend-title-row">
                    <span className="moral-theme-legend-dot" style={{ backgroundColor: '#92c784' }} />
                    <span className="moral-theme-legend-title">เกณฑ์ระดับคะแนนทุนชีวิต</span>
                  </div>
                  <span className="moral-theme-legend-sub">(เต็ม 100 คะแนน)</span>
                </div>
                <div className="moral-theme-legend-list">
                  <div className="moral-theme-legend-row">
                    <div className="moral-theme-legend-left">
                      <MoralSmileyIcon tier={1} size={20} />
                      <span className="moral-theme-legend-score">80.00 คะแนนขึ้นไป</span>
                    </div>
                    <span className="moral-theme-legend-pill" style={{ backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>ดีมาก</span>
                  </div>
                  <div className="moral-theme-legend-row">
                    <div className="moral-theme-legend-left">
                      <MoralSmileyIcon tier={2} size={20} />
                      <span className="moral-theme-legend-score">70.00 – 79.99</span>
                    </div>
                    <span className="moral-theme-legend-pill" style={{ backgroundColor: '#fefce8', color: '#a16207', borderColor: '#fef08a' }}>ดี</span>
                  </div>
                  <div className="moral-theme-legend-row">
                    <div className="moral-theme-legend-left">
                      <MoralSmileyIcon tier={3} size={20} />
                      <span className="moral-theme-legend-score">60.00 – 69.99</span>
                    </div>
                    <span className="moral-theme-legend-pill" style={{ backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>พอใช้</span>
                  </div>
                  <div className="moral-theme-legend-row">
                    <div className="moral-theme-legend-left">
                      <MoralSmileyIcon tier={5} size={20} />
                      <span className="moral-theme-legend-score">ต่ำกว่า 60.00</span>
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
                    {getLifeTierInfo(currentData.overallScore).tier}
                  </span>
                </div>

                <div className="moral-theme-score-card-bottom">
                  <div className="moral-theme-score-card-values">
                    <span className="moral-theme-score-card-num">
                      {currentData.overallScore.toFixed(2)}
                    </span>
                    <span className="moral-theme-score-card-sub">
                      / 100 ({currentData.overallScore.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: จุดเด่นทุนชีวิตคนไทย (อันดับ 1) */}
              <div className="moral-theme-score-card-css theme-green">
                <div className="moral-theme-score-card-top">
                  <div className="moral-theme-score-card-title-wrap">
                    <div className="moral-theme-score-card-icon-wrap">
                      <Award size={18} strokeWidth={2.2} />
                    </div>
                    <span className="moral-theme-score-card-title">จุดเด่นทุนชีวิตคนไทย (อันดับ 1)</span>
                  </div>
                  <span className="moral-theme-score-card-tier-pill">อันดับ 1 สูงสุด</span>
                </div>

                <div className="moral-theme-score-card-bottom">
                  <div className="moral-theme-score-card-values">
                    <span className="moral-theme-score-card-label">{topPillar.label}</span>
                    <span className="moral-theme-score-card-num">
                      {topPillar.score.toFixed(2)}
                    </span>
                    <span className="moral-theme-score-card-sub">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Card 3: เป้าหมายยกระดับทุนชีวิต */}
              <div className="moral-theme-score-card-css theme-coral">
                <div className="moral-theme-score-card-top">
                  <div className="moral-theme-score-card-title-wrap">
                    <div className="moral-theme-score-card-icon-wrap">
                      <TrendingUp size={18} strokeWidth={2.2} />
                    </div>
                    <span className="moral-theme-score-card-title">เป้าหมายยกระดับทุนชีวิต</span>
                  </div>
                  <span className="moral-theme-score-card-tier-pill">เป้าหมายส่งเสริม</span>
                </div>

                <div className="moral-theme-score-card-bottom">
                  <div className="moral-theme-score-card-values">
                    <span className="moral-theme-score-card-label">{targetPillar.label}</span>
                    <span className="moral-theme-score-card-num">
                      {targetPillar.score.toFixed(2)}
                    </span>
                    <span className="moral-theme-score-card-sub">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Card 4: เครื่องมือวัดทุนชีวิตของคนไทย 6 พลัง (Life Capital Radar Profile) */}
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
                      เครื่องมือวัดทุนชีวิตของคนไทย 6 พลัง
                    </h3>
                    <p style={{ fontSize: '17px', fontWeight: 600, color: '#475569', margin: '4px 0 0 0' }}>
                      (Life Capital Radar Profile — ปี {selectedYear})
                    </p>
                  </div>
                </div>

                {/* Radar Chart 6 Pillars (Hexagon Blend) */}
                <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LifeCapitalPillarsRadarChart
                    pillars={currentData.pillars}
                    selectedPillar={selectedPillar}
                    onPillarClick={(pKey) => handleSelectPillar(selectedPillar === pKey ? null : pKey)}
                  />
                </div>

                {/* ปุ่มแนวโน้มทุนชีวิต (มุมล่างขวาของ Frame) */}
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
                    className={`moral-theme-trend-toggle-btn ${showLifeTrend ? 'active' : ''}`}
                    onClick={() => {
                      setShowLifeTrend((prev) => {
                        const nextState = !prev;
                        if (nextState) {
                          setTimeout(() => {
                            document.getElementById('life-capital-trend-section')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                        return nextState;
                      });
                    }}
                    title="คลิกเพื่อดูแนวโน้มคะแนน 6 พลังทุนชีวิตย้อนหลัง 4 ปี (พ.ศ. 2565–2568)"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: showLifeTrend ? '1.5px solid #1d4ed8' : '1.5px solid #93c5fd',
                      backgroundColor: showLifeTrend ? '#1d4ed8' : '#eff6ff',
                      color: showLifeTrend ? '#ffffff' : '#1e40af',
                      boxShadow: showLifeTrend ? '0 4px 14px rgba(29, 78, 216, 0.28)' : '0 2px 6px rgba(37, 99, 235, 0.1)',
                      transition: 'all 0.22s ease',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    <TrendingUp size={16} strokeWidth={2.4} />
                    <span>{showLifeTrend ? 'ย่อแนวโน้ม' : 'แนวโน้มทุนชีวิต (2565–2568)'}</span>
                    <ChevronDown
                      size={15}
                      style={{
                        transform: showLifeTrend ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.25s ease'
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* Card 5: จำนวนผู้ร่วมประเมินทั้งหมด */}
              <div className="moral-theme-evaluators-card-css">
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
                              document.getElementById('life-evaluators-demographics-section')?.scrollIntoView({ behavior: 'smooth' });
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

          {/* 4. Multi-Year Comparative Trend for 6 Life Capital Pillars (พ.ศ. 2565–2568) */}
          {showLifeTrend && (
            <div id="life-capital-trend-section" className="moral-theme-deep-analytics-content" style={{ marginTop: '24px' }}>
              <div style={{ marginBottom: '22px' }}>
                <Isometric3dMultiLayerChart
                  title="แนวโน้มคะแนน 6 พลังทุนชีวิตย้อนหลัง 4 ปี (พ.ศ. 2565–2568)"
                  subtitle="เปรียบเทียบพัฒนาการของระบบนิเวศต้นทุนชีวิตแต่ละด้านตามข้อมูลศูนย์กลางข้อมูลสารสนเทศด้านคุณธรรม"
                  data={multiYearPillarsTrend}
                  series={LIFE_PILLARS_SERIES_CONFIG}
                  minScore={68}
                  maxScore={90}
                  scoreStep={5}
                  fullScore={100}
                  scoreSuffix="100"
                />
              </div>
            </div>
          )}

          {/* 5. Demographics Section: Gender, Age & 4-Year Participation Trend */}
          {showEvaluatorDemographics && (
            <div id="life-evaluators-demographics-section" className="moral-theme-deep-analytics-content" style={{ marginTop: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '20px', marginBottom: '22px' }}>
                {/* Gender Breakdown Card */}
                <div className="moral-card-panel moral-bottom-dialog-3d">
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>เพศผู้ร่วมประเมิน</h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0' }}>สัดส่วนผู้ตอบแบบสำรวจทุนชีวิต (ปี {selectedYear})</p>
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
                    <div style={{ padding: '3px 8px', borderRadius: '8px', backgroundColor: '#faf5ff', color: '#7c3aed', fontSize: '11px', fontWeight: 700 }}>
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
                        <Bar dataKey="respondents" fill="#7c3aed" radius={[4, 4, 0, 0]} />
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
      <PublishedPageSynergySection pageId="policy-1-2" pageTitle="ทุนชีวิต (Life Capital)" />
    </div>
  );
};
