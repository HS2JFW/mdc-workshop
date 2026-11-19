import React, { useState } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Sparkles,
  X,
  ArrowDownRight,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import type { ChartFormulaData } from './ChartFormulaDrawer';

export interface SubChartItem {
  id: string;
  buttonLabel: string;
  buttonIcon?: React.ReactNode;
  title: string;
  description?: string;
  renderChart: () => React.ReactNode;
}

export interface SeniorDrillDownChartCardProps {
  title: string;
  titleIcon?: React.ReactNode;
  badgeText?: string;
  badgeColor?: string;
  badge?: string;
  headlineMetric?: string | number;
  headlineSubtext?: string;
  subtitle?: string;
  metricLabel?: string;
  metricColor?: string;
  description?: string;
  renderMainChart: () => React.ReactNode;
  formulaData?: ChartFormulaData;
  formulaTitle?: string;
  formulaExpression?: string;
  formulaVariables?: any[];
  formulaNotes?: string;
  drillDownButtonLabel?: string;
  renderDrillDownContent?: () => React.ReactNode;
  subCharts?: SubChartItem[];
  themeColor?: 'blue' | 'emerald' | 'orange' | 'purple' | 'slate';
  onOpenFormulaModal?: (formula: ChartFormulaData) => void;
  className?: string;
  style?: React.CSSProperties;
}

const THEME_STYLES = {
  blue: {
    border: '#bfdbfe',
    bg: '#ffffff',
    headerBg: '#eff6ff',
    primary: '#1d4ed8',
    pillBg: '#dbeafe',
    pillText: '#1e40af'
  },
  emerald: {
    border: '#a7f3d0',
    bg: '#ffffff',
    headerBg: '#ecfdf5',
    primary: '#047857',
    pillBg: '#d1fae5',
    pillText: '#065f46'
  },
  orange: {
    border: '#fed7aa',
    bg: '#ffffff',
    headerBg: '#fff7ed',
    primary: '#c2410c',
    pillBg: '#ffedd5',
    pillText: '#9a3412'
  },
  purple: {
    border: '#ddd6fe',
    bg: '#ffffff',
    headerBg: '#f5f3ff',
    primary: '#6d28d9',
    pillBg: '#ede9fe',
    pillText: '#5b21b6'
  },
  slate: {
    border: '#cbd5e1',
    bg: '#ffffff',
    headerBg: '#f8fafc',
    primary: '#334155',
    pillBg: '#e2e8f0',
    pillText: '#1e293b'
  }
};

export const SeniorDrillDownChartCard: React.FC<SeniorDrillDownChartCardProps> = ({
  title,
  titleIcon,
  badgeText,
  badgeColor,
  badge,
  headlineMetric,
  headlineSubtext,
  subtitle,
  metricLabel,
  metricColor,
  description,
  renderMainChart,
  formulaData,
  formulaTitle,
  formulaExpression,
  formulaVariables = [],
  formulaNotes,
  drillDownButtonLabel,
  renderDrillDownContent,
  subCharts = [],
  themeColor = 'blue',
  onOpenFormulaModal,
  className = '',
  style
}) => {
  const [activeSubChartId, setActiveSubChartId] = useState<string | null>(null);
  const [isFormulaExpanded, setIsFormulaExpanded] = useState<boolean>(false);

  const theme = THEME_STYLES[themeColor] || THEME_STYLES.blue;

  const resolvedFormulaData: ChartFormulaData | undefined = formulaData || (formulaExpression ? {
    title: formulaTitle || `${title} (สูตรคำนวณ)`,
    formulaDisplay: formulaExpression,
    formula: formulaExpression,
    objective: formulaTitle || title,
    variables: formulaVariables,
    notes: formulaNotes
  } : undefined);

  const effectiveSubCharts: SubChartItem[] = [
    ...subCharts,
    ...(renderDrillDownContent ? [{
      id: 'custom-drill-down',
      buttonLabel: drillDownButtonLabel || 'เจาะลึกข้อมูลย่อย (Drill-Down)',
      buttonIcon: <Layers size={17} />,
      title: `${title} - ข้อมูลเชิงลึก`,
      renderChart: renderDrillDownContent
    }] : [])
  ];

  const activeSubChart = effectiveSubCharts.find((s) => s.id === activeSubChartId) || null;

  const toggleSubChart = (id: string) => {
    setActiveSubChartId((prev) => (prev === id ? null : id));
  };

  const handleFormulaClick = () => {
    if (onOpenFormulaModal && resolvedFormulaData) {
      onOpenFormulaModal(resolvedFormulaData);
    } else {
      setIsFormulaExpanded((prev) => !prev);
    }
  };

  return (
    <div
      className={`senior-chart-card ${className}`}
      style={{
        backgroundColor: theme.bg,
        border: `1.5px solid ${theme.border}`,
        borderRadius: 18,
        padding: '22px 24px',
        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      {/* ========================================================
          1. CARD HEADER & TOOLBAR
         ======================================================== */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 14,
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: 14
        }}
      >
        {/* Title & Metric Zone */}
        <div style={{ flex: '1 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            {titleIcon && (
              <span
                style={{
                  color: theme.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.pillBg,
                  padding: 7,
                  borderRadius: 10
                }}
              >
                {titleIcon}
              </span>
            )}
            <h3
              style={{
                margin: 0,
                fontSize: '1.25rem', // 20px
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.35
              }}
            >
              {title}
            </h3>
            {(badgeText || badge) && (
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 12,
                  backgroundColor: badgeColor || theme.pillBg,
                  color: badgeColor ? '#ffffff' : theme.pillText
                }}
              >
                {badgeText || badge}
              </span>
            )}
          </div>

          {(description || subtitle) && (
            <p
              style={{
                margin: '2px 0 0 0',
                fontSize: '0.94rem', // ~15px
                color: '#475569',
                lineHeight: 1.55
              }}
            >
              {description || subtitle}
            </p>
          )}

          {headlineMetric !== undefined && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
              <span
                style={{
                  fontSize: '2.2rem', // ~35px
                  fontWeight: 900,
                  color: metricColor || theme.primary,
                  letterSpacing: '-0.02em',
                  lineHeight: 1
                }}
              >
                {headlineMetric}
              </span>
              {(metricLabel || headlineSubtext) && (
                <span
                  style={{
                    fontSize: '0.98rem', // ~16px
                    fontWeight: 700,
                    color: '#64748b'
                  }}
                >
                  {metricLabel || headlineSubtext}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Buttons Toolbar Zone (Formula + SubChart Toggles) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'flex-end'
          }}
        >
          {/* Formula Button */}
          {resolvedFormulaData && (
            <button
              type="button"
              onClick={handleFormulaClick}
              title="ดูสูตรคำนวณ นิยามตัวแปร และวิธีแปลผลตัวชี้วัดนี้"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 15px',
                borderRadius: 12,
                fontSize: '0.9rem', // ~14.5px
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                backgroundColor: isFormulaExpanded ? '#1e3a8a' : '#eff6ff',
                color: isFormulaExpanded ? '#ffffff' : '#1d4ed8',
                border: isFormulaExpanded ? '1.5px solid #1e3a8a' : '1.5px solid #bfdbfe',
                boxShadow: isFormulaExpanded ? '0 3px 8px rgba(30, 58, 138, 0.25)' : 'none',
                minHeight: 44
              }}
            >
              <Calculator size={17} />
              <span>{isFormulaExpanded ? 'ซ่อนสูตรวิเคราะห์' : '📐 สูตรวิเคราะห์'}</span>
              {isFormulaExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}

          {/* Sub-Charts Buttons */}
          {effectiveSubCharts.map((sub) => {
            const isActive = activeSubChartId === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => toggleSubChart(sub.id)}
                title={`คลิกเพื่อดู${sub.title}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 16px',
                  borderRadius: 12,
                  fontSize: '0.9rem', // ~14.5px
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  backgroundColor: isActive ? theme.primary : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  border: isActive ? `1.5px solid ${theme.primary}` : '1.5px solid #cbd5e1',
                  boxShadow: isActive ? '0 4px 12px rgba(15, 23, 42, 0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
                  minHeight: 44
                }}
              >
                {sub.buttonIcon || <Layers size={16} />}
                <span>{sub.buttonLabel}</span>
                {isActive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          2. INLINE FORMULA DRAWER (Shown when formula is expanded)
         ======================================================== */}
      {isFormulaExpanded && resolvedFormulaData && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1.5px solid #93c5fd',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e40af', fontWeight: 800, fontSize: '1rem' }}>
              <BookOpen size={18} />
              <span>{resolvedFormulaData.title}</span>
              {resolvedFormulaData.badge && (
                <span style={{ fontSize: '0.74rem', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                  {resolvedFormulaData.badge}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsFormulaExpanded(false)}
              style={{ background: 'none', border: 'none', color: '#1e40af', cursor: 'pointer', padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Mathematical Formula Box */}
          {(resolvedFormulaData.formulaDisplay || resolvedFormulaData.formulaLatex || resolvedFormulaData.formula) && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: 10,
                padding: '12px 16px',
                fontFamily: 'Consolas, monospace',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#1e3a8a',
                textAlign: 'center'
              }}
            >
              {resolvedFormulaData.formulaDisplay || resolvedFormulaData.formulaLatex || resolvedFormulaData.formula}
            </div>
          )}

          {/* Objective & Plain Thai Interpretation */}
          {resolvedFormulaData.objective && (
            <div style={{ fontSize: '0.88rem', color: '#1e3a8a', lineHeight: 1.55 }}>
              <strong>วัตถุประสงค์และการนำไปใช้:</strong> {resolvedFormulaData.objective}
            </div>
          )}

          {/* Notes if available */}
          {resolvedFormulaData.notes && (
            <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
              <strong>คำอธิบายเพิ่มเติม:</strong> {resolvedFormulaData.notes}
            </div>
          )}

          {/* Variables Definition */}
          {resolvedFormulaData.variables && resolvedFormulaData.variables.length > 0 && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '10px 14px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e40af', marginBottom: 6 }}>
                นิยามตัวแปรและแหล่งที่มาข้อมูล:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.82rem', color: '#334155' }}>
                {resolvedFormulaData.variables.map((v, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    <strong>{v.symbol}</strong> ({v.name}): {v.definition}
                    {v.sourceDataset && <span style={{ color: '#059669', marginLeft: 6 }}>[{v.sourceDataset}]</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. MAIN / OUTCOME CHART (Always visible as primary anchor)
         ======================================================== */}
      <div className="senior-main-chart-wrapper" style={{ minHeight: 300 }}>
        {renderMainChart()}
      </div>

      {/* ========================================================
          4. SUB-CHART / DRILL-DOWN DRAWER (Smooth Accordion)
         ======================================================== */}
      {activeSubChart && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1.5px dashed #94a3b8',
            borderRadius: 16,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 6,
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* SubChart Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowDownRight size={20} color={theme.primary} />
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {activeSubChart.title}
                </h4>
                {activeSubChart.description && (
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    {activeSubChart.description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubChartId(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#64748b',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                cursor: 'pointer'
              }}
              title="พับเก็บกราฟต้นทาง"
            >
              <X size={14} />
              <span>พับเก็บกราฟนี้</span>
            </button>
          </div>

          {/* SubChart Body */}
          <div style={{ minHeight: 280 }}>{activeSubChart.renderChart()}</div>
        </div>
      )}
    </div>
  );
};
