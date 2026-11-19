import React, { useState } from 'react';
import {
  X,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
  Layers,
  ShieldCheck,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import {
  loadPmsKpis,
  getAllKpiProcesses,
  calculateKpiStepByStep,
  type PmsKpiItem,
  type KpiProcessType
} from '../data/pmsDataService';

interface KpiProcessCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKpiId?: string;
}

export const KpiProcessCalculatorModal: React.FC<KpiProcessCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialKpiId
}) => {
  const kpis = loadPmsKpis();
  const processes = getAllKpiProcesses();

  const [selectedProcessType, setSelectedProcessType] = useState<KpiProcessType>('dimension_3');
  const [selectedKpiId, setSelectedKpiId] = useState<string>(
    initialKpiId || (kpis.length > 0 ? kpis[0].id : '')
  );

  if (!isOpen) return null;

  const currentKpi = kpis.find((k) => k.id === selectedKpiId) || kpis[0];
  const calculationResult = currentKpi
    ? calculateKpiStepByStep(currentKpi, selectedProcessType)
    : null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="moral-modal-card moral-kpi-modal-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="moral-modal-header moral-kpi-modal-header"
          style={{
            padding: '18px 24px',
            backgroundColor: '#00247c',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Calculator size={22} color="#93c5fd" />
            </div>
            <div>
              <h3 className="moral-modal-title" style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                ขั้นตอนการคิดคำนวณตัวชี้วัด (KPI Calculation & Process Workflow)
              </h3>
              <p className="moral-modal-sub" style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#cbd5e1' }}>
                ตามเอกสารข้อเสนอโครงการ PMS ศูนย์คุณธรรม • เลือกกระบวนการและแจกแจงสูตรคำนวณทีละขั้นตอน
              </p>
            </div>
          </div>

          <button
            type="button"
            className="moral-modal-close-btn"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#93c5fd',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 1. KPI Selection Bar */}
          <div
            className="moral-modal-select-bar"
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Award size={15} color="#2563eb" />
              <span>เลือกตัวชี้วัดที่ต้องการตรวจสอบสูตรคำนวณ:</span>
            </span>

            <select
              value={selectedKpiId}
              onChange={(e) => setSelectedKpiId(e.target.value)}
              style={{
                flex: 1,
                minWidth: '280px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                color: '#1e293b',
                cursor: 'pointer'
              }}
            >
              {kpis.map((k) => (
                <option key={k.id} value={k.id}>
                  [{k.kpiCode}] {k.kpiName} ({k.projectName.split('(')[0].trim()} • ผลจริง {k.actualValue} {k.unit} / เป้า {k.targetValue} {k.unit})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Process Tabs (เลือกกระบวนการ KPI ตามเอกสาร) */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              เลือกกระบวนการคำนวณและประเมินผล KPI (Select KPI Process):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {processes.map((p) => {
                const isSelected = selectedProcessType === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`moral-modal-process-tab ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedProcessType(p.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: isSelected ? `2.5px solid ${p.accentColor}` : '1.5px solid #e2e8f0',
                      backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? p.accentColor : '#1e293b', lineHeight: 1.3 }}>
                      {p.title.split('(')[0].trim()}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', lineHeight: 1.3 }}>
                      {p.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Selected Process Summary Banner */}
          {calculationResult && (
            <div
              className="moral-modal-summary-banner"
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af' }}>
                  {calculationResult.processMeta.title}
                </div>
                <div style={{ fontSize: '11.5px', color: '#3b82f6', marginTop: '2px' }}>
                  {calculationResult.processMeta.description}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen size={12} />
                  <span>{calculationResult.processMeta.documentRef}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>อัตราความสำเร็จ</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e40af' }}>
                  {calculationResult.achievementPercent}%
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>
                  {calculationResult.finalScore.toFixed(2)} / 5.00 คะแนน
                </div>
              </div>
            </div>
          )}

          {/* 4. Step-by-Step Breakdown Cards */}
          {calculationResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="#2563eb" />
                <span>ขั้นตอนการคิดคำนวณทีละขั้น (Step-by-Step Derivation):</span>
              </div>

              {calculationResult.steps.map((step) => {
                const statusBorder =
                  step.status === 'passed'
                    ? '#86efac'
                    : step.status === 'warning'
                    ? '#fcd34d'
                    : '#bfdbfe';

                const statusBg =
                  step.status === 'passed'
                    ? '#f0fdf4'
                    : step.status === 'warning'
                    ? '#fffbeb'
                    : '#f8fafc';

                return (
                  <div
                    key={step.stepNo}
                    className={`moral-modal-step-card step-${step.status}`}
                    style={{
                      border: `1.5px solid ${statusBorder}`,
                      backgroundColor: statusBg,
                      borderRadius: '14px',
                      padding: '14px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#1e40af',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {step.stepNo}
                        </div>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                          {step.title}
                        </span>
                      </div>

                      <div style={{ fontSize: '11px', fontWeight: 700 }}>
                        {step.status === 'passed' && (
                          <span style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={13} /> ผ่านเกณฑ์
                          </span>
                        )}
                        {step.status === 'warning' && (
                          <span style={{ color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <AlertTriangle size={13} /> มีข้อควรระวัง
                          </span>
                        )}
                        {step.status === 'info' && (
                          <span style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Info size={13} /> ข้อมูลตั้งต้น
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                      {step.description}
                    </div>

                    {/* Formula & Substitution Card */}
                    <div
                      className="moral-modal-formula-card"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ fontFamily: 'monospace', fontSize: '12.5px', color: '#1e293b', fontWeight: 600 }}>
                        {step.formulaDisplay}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af' }}>
                        👉 {step.valueDisplay}
                      </div>
                    </div>

                    {step.note && (
                      <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                        * หมายเหตุ: {step.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. Executive Verification & De-duplication Rule Summary */}
          {calculationResult && (
            <div
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                backgroundColor: calculationResult.isEligibleForExecutiveReport ? '#f0fdf4' : '#fffbeb',
                border: calculationResult.isEligibleForExecutiveReport ? '1px solid #86efac' : '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <ShieldCheck size={20} color={calculationResult.isEligibleForExecutiveReport ? '#16a34a' : '#d97706'} />
              <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                <strong>สรุปสถานะการนำส่งรายงานระดับองค์กร:</strong> {calculationResult.ruleSummary}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
