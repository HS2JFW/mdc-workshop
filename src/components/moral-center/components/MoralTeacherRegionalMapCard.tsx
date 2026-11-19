import React, { useState, useMemo } from 'react';
import {
  Users,
  Award,
  ShieldCheck,
  Zap,
  GraduationCap,
  Sparkles,
  MapPin,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  Layers,
  Compass,
  Check
} from 'lucide-react';
import {
  Thailand3dShadedMap,
  THAILAND_PROVINCE_ID_TO_TH,
  type RegionalScoreDialogItem
} from './Thailand3dShadedMap';
import { PROVINCE_TO_MDC_REGION, getMdcRegionKey } from '../data/moralMdcSurveyData';
import {
  MDC_PROVINCE_STATS_MAP,
  MDC_STRATEGIC_6_REGIONS_TABLE,
  type LecturerProvinceStat
} from '../data/moralLecturersData';

export type LecturerMapTopicKey =
  | 'all'
  | 'coach'
  | 'activeVerified'
  | 'pacc'
  | 'educationSector'
  | 'multiplier';

export type LecturerMapViewMode = 'province' | 'region';

interface LecturerMapTopicConfig {
  key: LecturerMapTopicKey;
  title: string;
  enTitle: string;
  icon: string;
  accentColor: string;
  nationalValue: string;
  unit: string;
  description: string;
  legendItems: { color: string; label: string }[];
  getProvinceValue: (stat: LecturerProvinceStat) => number;
}

const LECTURER_MAP_TOPICS: LecturerMapTopicConfig[] = [
  {
    key: 'all',
    title: 'กำลังคนวิทยากรทั้งหมด',
    enTitle: 'Total Lecturers',
    icon: '👥',
    accentColor: '#1e3a8a',
    nationalValue: '5,346 คน (76 จว.)',
    unit: 'คน',
    description: 'การกระจายตัวของวิทยากรคุณธรรมทั้ง 5,346 คน ครอบคลุม 76 จังหวัด',
    legendItems: [
      { color: '#1e3a8a', label: '≥200 คน' },
      { color: '#2563eb', label: '100–199 คน' },
      { color: '#38bdf8', label: '30–99 คน' },
      { color: '#93c5fd', label: '1–29 คน' },
      { color: '#f1f5f9', label: '0 คน' }
    ],
    getProvinceValue: (s) => s.total
  },
  {
    key: 'coach',
    title: 'วิทยากรระดับพี่เลี้ยง (Coach)',
    enTitle: 'Mentor Coaches',
    icon: '🏆',
    accentColor: '#2563eb',
    nationalValue: '596 คน (11.1%)',
    unit: 'คน',
    description: 'แกนนำวิทยากรระดับสูง ทำหน้าที่สร้างและบ่มเพาะวิทยากรฐานราก',
    legendItems: [
      { color: '#1e3a8a', label: '≥30 คน' },
      { color: '#2563eb', label: '15–29 คน' },
      { color: '#38bdf8', label: '5–14 คน' },
      { color: '#93c5fd', label: '1–4 คน' },
      { color: '#f1f5f9', label: '0 คน' }
    ],
    getProvinceValue: (s) => s.coach
  },
  {
    key: 'activeVerified',
    title: 'วิทยากรพร้อมปฏิบัติงานจริง',
    enTitle: 'Active Verified',
    icon: '⚡',
    accentColor: '#059669',
    nationalValue: '2,462 คน (46.1%)',
    unit: 'คน',
    description: 'วิทยากรที่ยืนยันสถานะพร้อมลงพื้นที่ขับเคลื่อนกิจกรรมทันที',
    legendItems: [
      { color: '#064e3b', label: '≥100 คน' },
      { color: '#059669', label: '50–99 คน' },
      { color: '#10b981', label: '15–49 คน' },
      { color: '#6ee7b7', label: '1–14 คน' },
      { color: '#f1f5f9', label: '0 คน' }
    ],
    getProvinceValue: (s) => s.activeVerified
  },
  {
    key: 'pacc',
    title: 'เครือข่าย ป.ป.ช. / ต้านโกง',
    enTitle: 'Anti-Corruption Network',
    icon: '🛡️',
    accentColor: '#dc2626',
    nationalValue: '2,096 คน (39.2%)',
    unit: 'คน',
    description: 'กำลังคนวิทยากรที่ผ่านการอบรมหลักสูตรต้านทุจริตและธรรมาภิบาล',
    legendItems: [
      { color: '#7f1d1d', label: '≥100 คน' },
      { color: '#dc2626', label: '30–99 คน' },
      { color: '#f87171', label: '10–29 คน' },
      { color: '#fca5a5', label: '1–9 คน' },
      { color: '#f1f5f9', label: '0 คน' }
    ],
    getProvinceValue: (s) => s.paccNetwork
  },
  {
    key: 'educationSector',
    title: 'สัดส่วนภาคการศึกษา / บวร',
    enTitle: 'Education Sector',
    icon: '🎓',
    accentColor: '#7c3aed',
    nationalValue: '3,118 คน (58.3%)',
    unit: 'คน',
    description: 'วิทยากรสังกัดโรงเรียน มหาวิทยาลัย และสถาบันการศึกษา',
    legendItems: [
      { color: '#4c1d95', label: '≥150 คน' },
      { color: '#7c3aed', label: '60–149 คน' },
      { color: '#a855f7', label: '20–59 คน' },
      { color: '#d8b4fe', label: '1–19 คน' },
      { color: '#f1f5f9', label: '0 คน' }
    ],
    getProvinceValue: (s) => s.sectors?.['สถาบันการศึกษา'] || 0
  },
  {
    key: 'multiplier',
    title: 'พลังการขยายผลตัวคูณทางสังคม',
    enTitle: 'Social Multiplier Reach',
    icon: '🚀',
    accentColor: '#d97706',
    nationalValue: '~1.60 ล้านคน',
    unit: 'คน',
    description: 'ประชากรเป้าหมายที่เข้าถึงผ่านวิทยากร (เฉลี่ย 300 คน/วิทยากร)',
    legendItems: [
      { color: '#78350f', label: '≥60k คน' },
      { color: '#d97706', label: '30k–59k' },
      { color: '#f59e0b', label: '10k–29k' },
      { color: '#fcd34d', label: '1k–9k' },
      { color: '#f1f5f9', label: '0 คน' }
    ],
    getProvinceValue: (s) => s.total * 300
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

export const MoralTeacherRegionalMapCard: React.FC = () => {
  const [viewMode, setViewMode] = useState<LecturerMapViewMode>('province');
  const [activeTopicKey, setActiveTopicKey] = useState<LecturerMapTopicKey>('all');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const activeTopic = useMemo(() => {
    return LECTURER_MAP_TOPICS.find((t) => t.key === activeTopicKey) || LECTURER_MAP_TOPICS[0];
  }, [activeTopicKey]);

  // Province Name to Region Key mapping
  const provNameToRegionKey = useMemo(() => {
    const map: Record<string, string> = {
      'กรุงเทพฯ': 'Central',
      'กรุงเทพมหานคร': 'Central'
    };
    for (const [id, thName] of Object.entries(THAILAND_PROVINCE_ID_TO_TH)) {
      const reg = PROVINCE_TO_MDC_REGION[id];
      if (reg) {
        map[thName] = reg;
      }
    }
    return map;
  }, []);

  // Compute detailed province metrics for active topic and ranks
  const provinceFullData = useMemo(() => {
    const map: Record<
      string,
      {
        province: string;
        regionKey: string;
        regionName: string;
        total: number;
        coach: number;
        newComer: number;
        activeVerified: number;
        paccNetwork: number;
        educationSector: number;
        multiplier: number;
        currentValue: number;
        competencies: Record<string, number>;
        sectors: Record<string, number>;
        rank: number;
        hasData: boolean;
      }
    > = {};

    const list: any[] = [];
    for (const [id, thName] of Object.entries(THAILAND_PROVINCE_ID_TO_TH)) {
      const stat = MDC_PROVINCE_STATS_MAP[thName] || MDC_PROVINCE_STATS_MAP[thName.replace('จังหวัด', '')];
      const regKey = PROVINCE_TO_MDC_REGION[id] || 'Central';

      const curVal = stat ? activeTopic.getProvinceValue(stat) : 0;
      const item = {
        province: thName,
        regionKey: regKey,
        regionName: REGION_NAMES[regKey] || regKey,
        total: stat ? stat.total : 0,
        coach: stat ? stat.coach : 0,
        newComer: stat ? stat.newComer : 0,
        activeVerified: stat ? stat.activeVerified : 0,
        paccNetwork: stat ? stat.paccNetwork : 0,
        educationSector: stat?.sectors?.['สถาบันการศึกษา'] || 0,
        multiplier: stat ? stat.total * 300 : 0,
        currentValue: curVal,
        competencies: stat ? stat.competencies : {},
        sectors: stat ? stat.sectors : {},
        rank: 0,
        hasData: Boolean(stat && stat.total > 0)
      };
      list.push(item);
    }

    list.sort((a, b) => b.currentValue - a.currentValue);
    list.forEach((item, idx) => {
      item.rank = idx + 1;
      map[item.province] = item;
    });

    return map;
  }, [activeTopic]);

  // Regional aggregated stats for the active topic
  const regionalData = useMemo(() => {
    const totals: Record<
      string,
      {
        total: number;
        provincesCount: number;
        coach: number;
        activeVerified: number;
        paccNetwork: number;
        provinces: typeof provinceFullData[string][];
      }
    > = {
      Central: { total: 0, provincesCount: 0, coach: 0, activeVerified: 0, paccNetwork: 0, provinces: [] },
      North: { total: 0, provincesCount: 0, coach: 0, activeVerified: 0, paccNetwork: 0, provinces: [] },
      Northeast: { total: 0, provincesCount: 0, coach: 0, activeVerified: 0, paccNetwork: 0, provinces: [] },
      South: { total: 0, provincesCount: 0, coach: 0, activeVerified: 0, paccNetwork: 0, provinces: [] },
      East: { total: 0, provincesCount: 0, coach: 0, activeVerified: 0, paccNetwork: 0, provinces: [] },
      West: { total: 0, provincesCount: 0, coach: 0, activeVerified: 0, paccNetwork: 0, provinces: [] }
    };

    let nationalSum = 0;

    for (const item of Object.values(provinceFullData)) {
      const regKey = item.regionKey;
      if (totals[regKey]) {
        totals[regKey].total += item.currentValue;
        totals[regKey].coach += item.coach;
        totals[regKey].activeVerified += item.activeVerified;
        totals[regKey].paccNetwork += item.paccNetwork;
        totals[regKey].provinces.push(item);
        if (item.total > 0) {
          totals[regKey].provincesCount += 1;
        }
        nationalSum += item.currentValue;
      }
    }

    // Sort provinces in each region by value descending
    for (const rKey of Object.keys(totals)) {
      totals[rKey].provinces.sort((a, b) => b.currentValue - a.currentValue);
    }

    return { totals, nationalSum };
  }, [provinceFullData]);

  // Floating Regional Dialogs for Thailand3dShadedMap (Dynamic for current topic)
  const regionalScoreDialogs: RegionalScoreDialogItem[] = useMemo(() => {
    return (['North', 'Northeast', 'Central', 'East', 'West', 'South'] as const).map((rKey) => {
      const reg = regionalData.totals[rKey];
      const rName = REGION_NAMES[rKey] || rKey;
      const isSel = selectedRegion === rKey;
      const pct = regionalData.nationalSum > 0 ? ((reg.total / regionalData.nationalSum) * 100).toFixed(1) : '0';

      let displayScore = '';
      let displayTier = '';

      if (activeTopic.key === 'multiplier') {
        displayScore = `${(reg.total / 1000000).toFixed(2)}M`;
        displayTier = `${reg.total.toLocaleString()} คน (${pct}%)`;
      } else {
        displayScore = `${reg.total.toLocaleString()} ${activeTopic.unit}`;
        displayTier = `${pct}% (${reg.provincesCount} จว.)`;
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
  }, [regionalData, activeTopic, selectedRegion]);

  // High-contrast discrete bracket tiers for Choropleth Map Fill
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

    const val = data.currentValue;

    // 1. TOPIC: กำลังคนวิทยากรทั้งหมด (5,346 คน)
    if (activeTopicKey === 'all') {
      if (shouldDim) return '#e2e8f0';
      if (val >= 200) return '#1e3a8a';
      if (val >= 100) return '#2563eb';
      if (val >= 30) return '#38bdf8';
      if (val >= 1) return '#93c5fd';
      return '#f1f5f9';
    }

    // 2. TOPIC: วิทยากรระดับพี่เลี้ยง (Coach 596 คน)
    if (activeTopicKey === 'coach') {
      if (shouldDim) return '#e2e8f0';
      if (val >= 30) return '#1e3a8a';
      if (val >= 15) return '#2563eb';
      if (val >= 5) return '#38bdf8';
      if (val >= 1) return '#93c5fd';
      return '#f1f5f9';
    }

    // 3. TOPIC: วิทยากรพร้อมปฏิบัติงานจริง (2,462 คน)
    if (activeTopicKey === 'activeVerified') {
      if (shouldDim) return '#e2e8f0';
      if (val >= 100) return '#064e3b';
      if (val >= 50) return '#059669';
      if (val >= 15) return '#10b981';
      if (val >= 1) return '#6ee7b7';
      return '#f1f5f9';
    }

    // 4. TOPIC: เครือข่าย ป.ป.ช. / ต้านโกง (2,096 คน)
    if (activeTopicKey === 'pacc') {
      if (shouldDim) return '#e2e8f0';
      if (val >= 100) return '#7f1d1d';
      if (val >= 30) return '#dc2626';
      if (val >= 10) return '#f87171';
      if (val >= 1) return '#fca5a5';
      return '#f1f5f9';
    }

    // 5. TOPIC: สัดส่วนภาคการศึกษา / บวร (3,118 คน)
    if (activeTopicKey === 'educationSector') {
      if (shouldDim) return '#e2e8f0';
      if (val >= 150) return '#4c1d95';
      if (val >= 60) return '#7c3aed';
      if (val >= 20) return '#a855f7';
      if (val >= 1) return '#d8b4fe';
      return '#f1f5f9';
    }

    // 6. TOPIC: พลังการขยายผลตัวคูณทางสังคม (~1.60 ล้านคน)
    if (activeTopicKey === 'multiplier') {
      if (shouldDim) return '#e2e8f0';
      if (val >= 60000) return '#78350f';
      if (val >= 30000) return '#d97706';
      if (val >= 10000) return '#f59e0b';
      if (val >= 1) return '#fcd34d';
      return '#f1f5f9';
    }

    return '#2563eb';
  };

  // Selected item details
  const selectedProvinceData = selectedProvince ? provinceFullData[selectedProvince] : null;
  const hoveredProvinceData = hoveredProvince ? provinceFullData[hoveredProvince] : null;

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
              แผนที่แสดงการกระจายตัวของวิทยากรคุณธรรม 76 จังหวัด (Spatial Analytics)
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {viewMode === 'province'
              ? 'โหมดรายจังหวัด (77 จังหวัด): คลิกที่จังหวัดบนแผนที่เพื่อดูข้อมูลวิทยากรและมิติคุณธรรมของจังหวัดนั้น'
              : 'โหมดรายภูมิภาค (6 ภูมิภาค): แสดงภาพรวมเชิงยุทธศาสตร์และป้ายคะแนนประจำภาคทั้ง 6 ภาค'}
          </p>
        </div>

        {/* Top Controls: View Mode Switcher & Reset Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Dual View Mode Segmented Control */}
          <div
            style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setViewMode('province');
                setSelectedRegion(null);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'province' ? '#ffffff' : 'transparent',
                color: viewMode === 'province' ? '#1e40af' : '#64748b',
                fontWeight: viewMode === 'province' ? 800 : 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: viewMode === 'province' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Compass size={14} />
              <span>รายจังหวัด (77 จว.)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('region');
                setSelectedProvince(null);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'region' ? '#ffffff' : 'transparent',
                color: viewMode === 'region' ? '#1e40af' : '#64748b',
                fontWeight: viewMode === 'region' ? 800 : 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: viewMode === 'region' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={14} />
              <span>รายภูมิภาค (6 ภาค)</span>
            </button>
          </div>

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
                padding: '6px 14px',
                borderRadius: '8px',
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
          {/* Top floating indicator on map */}
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
              ยอดรวม: {activeTopic.nationalValue}
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
                    {activeTopic.title}: {hoveredProvinceData.currentValue.toLocaleString()} {activeTopic.unit}
                  </div>
                  <div style={{ color: '#a7f3d0', fontSize: '11.5px', fontWeight: 600 }}>
                    วิทยากรทั้งหมด: {hoveredProvinceData.total.toLocaleString()} คน • พี่เลี้ยง (Coach) {hoveredProvinceData.coach} คน
                  </div>
                </>
              ) : (
                <div style={{ color: '#fca5a5', fontSize: '11.5px', fontWeight: 600 }}>
                  พื้นที่เป้าหมายใหม่ (ยังไม่มีวิทยากรขึ้นทะเบียน)
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

        {/* Right Column: Perspective Topics Side Controls & Drill-down Card */}
        <div
          style={{
            flex: '1 1 380px',
            minWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* A. Perspective Buttons Panel (6 Topics) */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="#2563eb" />
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  เลือกมิติข้อมูลวิทยากร (Lecturer Perspectives)
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                {LECTURER_MAP_TOPICS.length} มิติข้อมูล
              </span>
            </div>

            {/* List of Topic Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {LECTURER_MAP_TOPICS.map((topic) => {
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
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: isActive ? `2px solid ${topic.accentColor}` : '1.5px solid #e2e8f0',
                      background: isActive ? '#ffffff' : '#ffffff',
                      boxShadow: isActive ? `0 4px 14px ${topic.accentColor}25` : '0 1px 3px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '19px' }}>{topic.icon}</span>
                      <div>
                        <div
                          style={{
                            fontSize: '13.5px',
                            fontWeight: isActive ? 800 : 700,
                            color: isActive ? topic.accentColor : '#0f172a'
                          }}
                        >
                          {topic.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                          {topic.description}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isActive ? `${topic.accentColor}15` : '#f1f5f9',
                          color: isActive ? topic.accentColor : '#475569'
                        }}
                      >
                        {topic.nationalValue}
                      </span>
                      {isActive && <CheckCircle2 size={16} color={topic.accentColor} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* B. Drill-down Card (Specific Province OR Region OR National Top Leaders) */}
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
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>วิทยากรทั้งหมด</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a8a' }}>
                          {selectedProvinceData.total.toLocaleString()} คน
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>ระดับพี่เลี้ยง (Coach)</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#2563eb' }}>
                          {selectedProvinceData.coach} คน
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>พร้อมปฏิบัติงานจริง</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                          {selectedProvinceData.activeVerified} คน
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>เครือข่าย ป.ป.ช.</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626' }}>
                          {selectedProvinceData.paccNetwork} คน
                        </div>
                      </div>
                    </div>

                    {/* 5 Moral Competencies Breakdown */}
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                        ความเชี่ยวชาญ 5 มิติคุณธรรม:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {[
                          { label: 'จิตอาสา', key: 'จิตอาสา', icon: '🤝', color: '#2563eb' },
                          { label: 'วินัยรับผิดชอบ', key: 'วินัยและความรับผิดชอบ', icon: '🎯', color: '#059669' },
                          { label: 'พอเพียง', key: 'พอเพียง', icon: '🌱', color: '#0891b2' },
                          { label: 'สุจริต', key: 'สุจริต', icon: '⚖️', color: '#d97706' },
                          { label: 'กตัญญู', key: 'กตัญญู', icon: '🙏', color: '#7c3aed' }
                        ].map((dim) => {
                          const val = (selectedProvinceData.competencies as any)?.[dim.key] || 0;
                          return (
                            <div
                              key={dim.key}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                background: val > 0 ? `${dim.color}10` : '#f8fafc',
                                border: `1px solid ${val > 0 ? `${dim.color}30` : '#e2e8f0'}`,
                                fontSize: '12px'
                              }}
                            >
                              <span style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>{dim.icon}</span>
                                <span>{dim.label}</span>
                              </span>
                              <span style={{ fontWeight: 800, color: val > 0 ? dim.color : '#94a3b8' }}>
                                {val.toLocaleString()} คน
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Social Multiplier Reach */}
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: '#fffbeb',
                        border: '1.5px solid #fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>🚀</span>
                        <div>
                          <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 700 }}>พลังตัวคูณทางสังคม (Social Reach)</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#b45309' }}>
                            เข้าถึงประชาชน ~{selectedProvinceData.multiplier.toLocaleString()} คน
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#92400e', background: '#fde68a', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        300 คน/วิทยากร
                      </span>
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
                    📌 <strong>พื้นที่เป้าหมายใหม่ (White Space):</strong> จังหวัดนี้ยังไม่มีวิทยากรขึ้นทะเบียนในระบบศูนย์คุณธรรม เป็นเป้าหมายหลักในการเปิดอบรมสร้างวิทยากรแกนนำในรอบถัดไป
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
                      (regionalData.totals[selectedRegion].total / regionalData.nationalSum) *
                      100
                    ).toFixed(1)}% ของประเทศ
                  </span>
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
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>วิทยากรในมิตินี้</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                      {regionalData.totals[selectedRegion].total.toLocaleString()} {activeTopic.unit}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>พี่เลี้ยง (Coach)</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb' }}>
                      {regionalData.totals[selectedRegion].coach} คน
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                    🏆 5 อันดับจังหวัดสูงสุดใน{REGION_NAMES[selectedRegion]}:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {regionalData.totals[selectedRegion].provinces
                      .filter((p) => p.currentValue > 0)
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
                            {p.currentValue.toLocaleString()} {activeTopic.unit}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              /* Case 3: Default Overview (Top 5 Leaderboard across Thailand) */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color={activeTopic.accentColor} />
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    5 อันดับจังหวัดสูงสุดในมิตินี้ (National Leaders)
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  คลิกที่จังหวัดหรือป้ายภูมิภาคบนแผนที่เพื่อดูข้อมูลเจาะลึก
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {Object.values(provinceFullData)
                    .filter((p) => p.currentValue > 0)
                    .slice(0, 5)
                    .map((p, idx) => (
                      <div
                        key={p.province}
                        onClick={() => setSelectedProvince(p.province)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          background: idx === 0 ? '#eff6ff' : '#f8fafc',
                          border: idx === 0 ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#e2e8f0',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{p.province}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>({p.regionName})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>
                            {p.currentValue.toLocaleString()} {activeTopic.unit}
                          </span>
                          <ChevronRight size={14} color="#94a3b8" />
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
