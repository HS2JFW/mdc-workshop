import React from 'react';
import { Calculator } from 'lucide-react';
import type { ChartFormulaData } from './ChartFormulaDrawer';

export interface ChartDrillDownOption {
  key: string;
  label: string;
  icon?: string;
  isSourceChart?: boolean;
  badge?: string;
}

export interface ChartDrillDownToolbarProps {
  title: string;
  subtitle?: string;
  activeKey: string;
  options: ChartDrillDownOption[];
  onSelectOption: (key: string) => void;
  formulaData?: ChartFormulaData;
  onOpenFormula?: () => void;
  extraControls?: React.ReactNode;
  style?: React.CSSProperties;
}

export const ChartDrillDownToolbar: React.FC<ChartDrillDownToolbarProps> = ({
  title,
  subtitle,
  activeKey,
  options,
  onSelectOption,
  formulaData,
  onOpenFormula,
  extraControls,
  style = {}
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '16px',
        fontFamily: 'var(--font-thai)',
        ...style
      }}
    >
      {/* Top Row: Title + Formula Button + Extra Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ flex: 1, minWidth: '260px' }}>
          <h3
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.3px',
              lineHeight: 1.3
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontSize: '14.5px',
                color: '#64748b',
                margin: '4px 0 0 0',
                lineHeight: 1.4
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {extraControls}

          {/* ปุ่มแสดงสูตรการคำนวณ */}
          {(formulaData || onOpenFormula) && (
            <button
              type="button"
              onClick={onOpenFormula}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 14px',
                minHeight: '40px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1.5px solid #93c5fd',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap'
              }}
              title="คลิกเพื่อดูสูตรคณิตศาสตร์และเกณฑ์การวิเคราะห์ของกราฟนี้"
            >
              <Calculator size={16} strokeWidth={2.4} />
              <span>📐 สูตรคำนวณ</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Drill Down Options Pills (สลับระหว่าง กราฟบทสรุป vs กราฟต้นทาง) */}
      {options.length > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            backgroundColor: '#f8fafc',
            padding: '6px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0'
          }}
        >
          {options.map((opt) => {
            const isActive = activeKey === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onSelectOption(opt.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 16px',
                  minHeight: '40px',
                  borderRadius: '10px',
                  fontSize: '14.5px',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  border: isActive ? '1.5px solid #1e40af' : '1px solid transparent',
                  backgroundColor: isActive ? '#1e40af' : 'transparent',
                  color: isActive ? '#ffffff' : '#334155',
                  boxShadow: isActive ? '0 2px 8px rgba(30, 64, 175, 0.25)' : 'none',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {opt.icon && <span>{opt.icon}</span>}
                <span>{opt.label}</span>
                {opt.isSourceChart && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: isActive ? '#dbeafe' : '#e0f2fe',
                      color: isActive ? '#1e40af' : '#0369a1',
                      marginLeft: '2px'
                    }}
                  >
                    กราฟต้นทาง
                  </span>
                )}
                {opt.badge && !opt.isSourceChart && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: isActive ? '#ffffff30' : '#e2e8f0',
                      color: isActive ? '#ffffff' : '#475569',
                      marginLeft: '2px'
                    }}
                  >
                    {opt.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
