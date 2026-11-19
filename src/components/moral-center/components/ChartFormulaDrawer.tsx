import React, { useEffect } from 'react';
import { X, BookOpen, Calculator, Info, CheckCircle2 } from 'lucide-react';

export interface FormulaVariable {
  symbol: string;
  name: string;
  definition: string;
  sourceDataset?: string;
}

export interface ChartFormulaData {
  title: string;
  badge?: string;
  formulaLatex?: string;
  formulaDisplay?: string;
  formula?: string;
  objective: string;
  notes?: string;
  variables: FormulaVariable[];
  workedExample?: {
    inputs: string;
    calculation: string;
    result: string;
    interpretation: string;
  };
  academicReference?: string;
}

export interface ChartFormulaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: ChartFormulaData | null;
}

export const ChartFormulaDrawer: React.FC<ChartFormulaDrawerProps> = ({
  isOpen,
  onClose,
  data
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="moral-modal-card moral-formula-modal-card"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'var(--font-thai)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="moral-modal-header moral-formula-modal-header"
          style={{
            padding: '20px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Calculator size={24} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: 0,
                    letterSpacing: '-0.3px'
                  }}
                >
                  {data.title}
                </h3>
                {data.badge && (
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af'
                    }}
                  >
                    {data.badge}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '14.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                สูตรคำนวณและระเบียบวิธีวิเคราะห์เชิงสถิติ (สำหรับผู้บริหารและผู้ศึกษาข้อมูล)
              </p>
            </div>
          </div>

          <button
            type="button"
            className="moral-modal-close-btn"
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.18s ease',
              flexShrink: 0
            }}
            title="ปิดหน้าต่างสูตร"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            fontSize: '15.5px',
            lineHeight: 1.6
          }}
        >
          {/* 1. วัตถุประสงค์ของการวิเคราะห์ */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#f1f5f9',
              borderRadius: '14px',
              borderLeft: '5px solid #3b82f6'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Info size={18} color="#1d4ed8" />
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                วัตถุประสงค์และประโยชน์ของการวิเคราะห์
              </span>
            </div>
            <div style={{ color: '#334155', fontSize: '15px' }}>{data.objective}</div>
          </div>

          {/* 2. กล่องแสดงสูตรคำนวณหลัก */}
          <div
            style={{
              backgroundColor: '#eff6ff',
              borderRadius: '16px',
              border: '1.5px solid #93c5fd',
              padding: '18px 22px'
            }}
          >
            <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>
              📐 สมการคณิตศาสตร์ / สูตรการวิเคราะห์:
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#1e3a8a',
                fontFamily: 'Consolas, "Segoe UI Mono", monospace',
                backgroundColor: '#ffffff',
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1px solid #bfdbfe',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                wordBreak: 'break-word',
                textAlign: 'center',
                lineHeight: 1.5
              }}
            >
              {data.formulaDisplay || data.formulaLatex}
            </div>
          </div>

          {/* 3. นิยามตัวแปรและแหล่งข้อมูล */}
          <div>
            <h4
              style={{
                fontSize: '16.5px',
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 10px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <BookOpen size={18} color="#059669" />
              <span>ความหมายของตัวแปรและแหล่งข้อมูล:</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.variables.map((v, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '12px',
                    padding: '10px 14px',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Consolas, monospace',
                      fontWeight: 800,
                      color: '#2563eb',
                      backgroundColor: '#eff6ff',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '14.5px',
                      flexShrink: 0
                    }}
                  >
                    {v.symbol}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{v.name}: </span>
                    <span style={{ color: '#475569' }}>{v.definition}</span>
                    {v.sourceDataset && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginLeft: '8px',
                          fontSize: '12px',
                          color: '#059669',
                          fontWeight: 600,
                          backgroundColor: '#ecfdf5',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        [ที่มา: {v.sourceDataset}]
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. ตัวอย่างการคำนวณจากตัวเลขจริง */}
          {data.workedExample && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '16px',
                border: '1.5px solid #86efac',
                padding: '18px 22px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#166534',
                  marginBottom: '10px'
                }}
              >
                <CheckCircle2 size={18} color="#16a34a" />
                <span>ตัวอย่างการคำนวณจากข้อมูลจริง (Worked Example):</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '15px' }}>
                <div>
                  <strong style={{ color: '#14532d' }}>ค่าตัวเลขตั้งต้น:</strong>{' '}
                  <span style={{ color: '#334155' }}>{data.workedExample.inputs}</span>
                </div>
                <div>
                  <strong style={{ color: '#14532d' }}>วิธีคำนวณ:</strong>{' '}
                  <span style={{ color: '#1e3a8a', fontFamily: 'monospace', fontWeight: 600 }}>
                    {data.workedExample.calculation}
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#14532d' }}>ผลลัพธ์:</strong>{' '}
                  <span style={{ fontWeight: 800, color: '#15803d', fontSize: '16px' }}>
                    {data.workedExample.result}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: '6px',
                    paddingTop: '8px',
                    borderTop: '1px dashed #bbf7d0',
                    color: '#166534',
                    fontStyle: 'normal'
                  }}
                >
                  <strong>💡 การแปลความหมายสำหรับผู้บริหาร:</strong> {data.workedExample.interpretation}
                </div>
              </div>
            </div>
          )}

          {/* 5. เอกสารอ้างอิงทางวิชาการ (ถ้ามี) */}
          {data.academicReference && (
            <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              📚 แหล่งอ้างอิงหลักเกณฑ์: {data.academicReference}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#1e40af',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
