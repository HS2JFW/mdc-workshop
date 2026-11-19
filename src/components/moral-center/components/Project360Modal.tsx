import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Layers,
  Calendar,
  Building,
  FileText,
  Video,
  Sparkles,
  TrendingUp,
  ExternalLink,
  MessageSquare,
  Calculator
} from 'lucide-react';
import type { ProjectSummary } from '../data/taskProjectSqliteService';
import {
  loadPmsKpis,
  loadPmsDecisionActions
} from '../data/pmsDataService';
import { loadProjectMeetings, loadTrackedProjects } from '../data/moralProjectsRealtimeStore';
import { KpiProcessCalculatorModal } from './KpiProcessCalculatorModal';

interface Project360ModalProps {
  project: ProjectSummary | null;
  onClose: () => void;
  onNavigateToMeetings?: (projectId: string) => void;
}

export const Project360Modal: React.FC<Project360ModalProps> = ({
  project,
  onClose,
  onNavigateToMeetings
}) => {
  const [activeTab, setActiveTab] = useState<'wbs' | 'kpis' | 'meetings' | 'actions'>('wbs');
  const [activeKpiCalcId, setActiveKpiCalcId] = useState<string | null>(null);

  if (!project) return null;

  // Load project-specific data
  const projectKpis = loadPmsKpis().filter(
    (k) => k.projectId === project.projectId || k.projectName.includes(project.province)
  );
  const projectActions = loadPmsDecisionActions().filter(
    (a) => a.projectId === project.projectId || a.projectName.includes(project.province)
  );
  const projectMeetings = loadProjectMeetings().filter(
    (m) => m.projectId === project.projectId || m.projectName.includes(project.province)
  );

  // Budget calculations (mocked with realistic data based on 54 canonical tasks)
  const budgetAllocated = 450000;
  const budgetSpent = Math.round(budgetAllocated * (project.overallProgress / 100));

  const trackedProj = loadTrackedProjects().find(
    (p) => p.id === project.projectId || p.name === project.projectName
  );

  const stateLabel =
    trackedProj?.state === 'เกินระยะเวลาการดำเนินงาน'
      ? '4. เกินระยะเวลาการดำเนินงาน'
      : project.overallProgress >= 100
      ? '3. เสร็จสิ้นการดำเนินงาน'
      : project.overallProgress >= 30
      ? '2. กำลังดำเนินงาน'
      : '1. เริ่มต้น';

  const stateColor =
    trackedProj?.state === 'เกินระยะเวลาการดำเนินงาน'
      ? '#7c3aed'
      : project.overallProgress >= 100
      ? '#10b981'
      : project.overallProgress >= 30
      ? '#f59e0b'
      : '#2563eb';

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
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        className="moral-modal-card moral-project360-modal-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* =====================================================================
            MODAL HEADER & PROJECT SUMMARY BANNER
        ===================================================================== */}
        <div
          className="moral-modal-header moral-project360-modal-header"
          style={{
            padding: '20px 26px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {project.projectId}
                </span>
                <span
                  style={{
                    backgroundColor: `${stateColor}15`,
                    color: stateColor,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {stateLabel}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>•</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                  จ.{project.province}
                </span>
                {project.organization && (
                  <>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>•</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      <Building size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {project.organization}
                    </span>
                  </>
                )}
              </div>

              <h2
                style={{
                  fontSize: '19px',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: '6px 0 0 0',
                  lineHeight: 1.3
                }}
              >
                {project.projectName}
              </h2>
            </div>

            <button
              type="button"
              className="moral-modal-close-btn"
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div
            className="moral-modal-quick-stats"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '12px',
              padding: '12px 14px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>ความก้าวหน้าโครงการ</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: stateColor }}>
                  {project.overallProgress}%
                </span>
                <div style={{ flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${project.overallProgress}%`, height: '100%', backgroundColor: stateColor }} />
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>งบประมาณอนุมัติ</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '3px' }}>
                ฿{budgetAllocated.toLocaleString()}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>ยอดใช้จ่ายจริง (65%)</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669', marginTop: '3px' }}>
                ฿{budgetSpent.toLocaleString()}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>วันที่ตัดยอดการเงิน</span>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginTop: '3px' }}>
                31 ธ.ค. 2569
              </div>
            </div>
          </div>

          {/* 4 Tabs Navigation */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {[
              { id: 'wbs', label: '1. แผนงาน WBS 3 ระยะ', count: project.tasks.length, icon: <Layers size={14} /> },
              { id: 'kpis', label: '2. ตัวชี้วัด & ผลรับรอง', count: projectKpis.length, icon: <TrendingUp size={14} /> },
              { id: 'meetings', label: '3. บันทึกการประชุม AI', count: projectMeetings.length, icon: <Video size={14} /> },
              { id: 'actions', label: '4. ข้อสั่งการผู้บริหาร', count: projectActions.length, icon: <MessageSquare size={14} /> }
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`moral-modal-tab-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    color: isSelected ? '#1d4ed8' : '#475569',
                    fontSize: '12.5px',
                    fontWeight: isSelected ? 700 : 600,
                    cursor: 'pointer'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span
                    style={{
                      backgroundColor: isSelected ? '#bfdbfe' : '#f1f5f9',
                      color: isSelected ? '#1e3a8a' : '#64748b',
                      padding: '1px 6px',
                      borderRadius: '999px',
                      fontSize: '11px'
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            MODAL BODY: CONTENT PER ACTIVE TAB
        ===================================================================== */}
        <div style={{ padding: '20px 26px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: WBS TASKS */}
          {activeTab === 'wbs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  รายการกิจกรรมย่อยทั้งหมด (Work Breakdown Structure - 3 ระยะ)
                </span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  ตารางฐานข้อมูลแผนงานโครงการ
                </span>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '10px 12px', width: '70px' }}>รหัส</th>
                      <th style={{ padding: '10px 12px' }}>กิจกรรม / ระยะ</th>
                      <th style={{ padding: '10px 12px' }}>หมุดส่งมอบ (Deliverable)</th>
                      <th style={{ padding: '10px 12px', width: '130px' }}>ช่วงเวลา</th>
                      <th style={{ padding: '10px 12px', width: '100px' }}>สถานะ</th>
                      <th style={{ padding: '10px 12px', width: '80px', textAlign: 'right' }}>ก้าวหน้า</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.tasks.map((t, idx) => (
                      <tr key={t.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>
                          {t.task_code}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{t.task_name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{t.phase_name}</div>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#475569', fontSize: '12px' }}>
                          {t.deliverable || '-'}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '11.5px' }}>
                          {t.start_date} ถึง {t.end_date}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor:
                                t.status === 'เสร็จสิ้น'
                                  ? '#ecfdf5'
                                  : t.status === 'กำลังดำเนินงาน'
                                  ? '#fffbeb'
                                  : '#f1f5f9',
                              color:
                                t.status === 'เสร็จสิ้น'
                                  ? '#059669'
                                  : t.status === 'กำลังดำเนินงาน'
                                  ? '#d97706'
                                  : '#64748b'
                            }}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                          {t.progress_percent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: KPIS & EVIDENCE APPROVAL */}
          {activeTab === 'kpis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    ตัวชี้วัดผลผลิตและผลลัพธ์ของโครงการ (KPIs)
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                    แยกผลที่ผ่านการรับรองแล้วออกจากข้อมูลรอตรวจสอบ พร้อมหลักฐานอ้างอิง
                  </p>
                </div>
              </div>

              {projectKpis.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <TrendingUp size={32} color="#94a3b8" />
                  <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                    ยังไม่มีตัวชี้วัดเฉพาะสำหรับโครงการนี้ในระบบ
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {projectKpis.map((kpi) => {
                    const isApproved = kpi.verificationStatus === 'ผ่านการรับรอง';
                    const isPending = kpi.verificationStatus === 'รอตรวจสอบ';

                    return (
                      <div
                        key={kpi.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                                {kpi.kpiCode}
                              </span>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '5px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: isApproved ? '#ecfdf5' : isPending ? '#fffbeb' : '#fef2f2',
                                  color: isApproved ? '#059669' : isPending ? '#d97706' : '#dc2626'
                                }}
                              >
                                {kpi.verificationStatus}
                              </span>
                            </div>
                            <h4 style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                              {kpi.kpiName}
                            </h4>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                              {kpi.definition}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>ผลจริง / เป้าหมาย</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: isApproved ? '#059669' : '#d97706' }}>
                              {kpi.actualValue} / {kpi.targetValue} {kpi.unit}
                            </div>
                          </div>
                        </div>

                        {/* Evidence & AI Confidence Row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#f8fafc',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={14} color="#64748b" />
                            <span style={{ color: '#475569' }}>ไฟล์หลักฐาน:</span>
                            <span style={{ fontWeight: 600, color: '#2563eb' }}>
                              {kpi.evidenceFileName || 'ยังไม่มีไฟล์แนบ'}
                            </span>
                          </div>

                          {kpi.aiConfidenceScore && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Sparkles size={13} color="#2563eb" />
                              <span style={{ color: '#64748b' }}>AI Evidence Match:</span>
                              <span style={{ fontWeight: 700, color: '#2563eb' }}>
                                {kpi.aiConfidenceScore}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Approver / Rejection note */}
                        {kpi.approvedAt && (
                          <div style={{ fontSize: '11.5px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} />
                            <span>รับรองโดย {kpi.approverName} เมื่อ {kpi.approvedAt}</span>
                          </div>
                        )}
                        {kpi.rejectionReason && (
                          <div style={{ fontSize: '11.5px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '6px 10px', borderRadius: '6px' }}>
                            <b>เหตุผลส่งกลับแก้ไข:</b> {kpi.rejectionReason}
                          </div>
                        )}

                        {/* Action row: Step-by-step calculation breakdown */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setActiveKpiCalcId(kpi.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: '1px solid #bbf7d0',
                              backgroundColor: '#f0fdf4',
                              color: '#15803d',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Calculator size={13} color="#16a34a" />
                            <span>ดูขั้นตอนการคิดคำนวณ KPI</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEETINGS & MINUTES */}
          {activeTab === 'meetings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  ประวัติการประชุมแลกเปลี่ยนเรียนรู้และถอดบทเรียน ({projectMeetings.length} ครั้ง)
                </span>
                {onNavigateToMeetings && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToMeetings(project.projectId);
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#2563eb',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>เปิดปฏิทินประชุม</span>
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>

              {projectMeetings.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <Video size={32} color="#94a3b8" />
                  <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                    ยังไม่มีบันทึกการประชุมสำหรับโครงการนี้
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {projectMeetings.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
                            {m.date} ({m.timeStart} - {m.timeEnd} น.)
                          </span>
                          <h4 style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                            {m.topic}
                          </h4>
                        </div>
                      </div>

                      {m.aiSummary && (
                        <div
                          style={{
                            marginTop: '10px',
                            backgroundColor: '#eff6ff',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#1e40af',
                            lineHeight: 1.5
                          }}
                        >
                          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                            <Sparkles size={13} />
                            <span>AI สรุปสาระสำคัญจากการประชุม:</span>
                          </div>
                          <div>{m.aiSummary.overview}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DECISIONS & ACTIONS */}
          {activeTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  มติและข้อสั่งการผู้บริหาร ({projectActions.length} รายการ)
                </span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  เชื่อมโยงการกำกับติดตามผลการตัดสินใจ
                </span>
              </div>

              {projectActions.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <MessageSquare size={32} color="#94a3b8" />
                  <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                    ไม่มีประเด็นข้อสั่งการคั่งค้างสำหรับโครงการนี้
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {projectActions.map((act) => (
                    <div
                      key={act.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            กำหนดแล้วเสร็จ: <b>{act.dueDate}</b> • ผู้รับผิดชอบ: <b>{act.responsiblePerson}</b>
                          </div>
                          <h4 style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                            {act.issueTopic}
                          </h4>
                        </div>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: act.status === 'เสร็จสิ้น' ? '#ecfdf5' : '#fffbeb',
                            color: act.status === 'เสร็จสิ้น' ? '#059669' : '#d97706'
                          }}
                        >
                          {act.status}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: '8px',
                          backgroundColor: '#f8fafc',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          color: '#334155'
                        }}
                      >
                        <b>มติข้อสั่งการ:</b> {act.directiveText}
                      </div>

                      {act.followUpResult && (
                        <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#059669' }}>
                          ✓ <b>ผลการติดตาม:</b> {act.followUpResult}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =====================================================================
            MODAL FOOTER
        ===================================================================== */}
        <div
          style={{
            padding: '14px 26px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* KPI Step-by-Step Calculation Engine Modal */}
      {activeKpiCalcId && (
        <KpiProcessCalculatorModal
          isOpen={Boolean(activeKpiCalcId)}
          onClose={() => setActiveKpiCalcId(null)}
          initialKpiId={activeKpiCalcId}
        />
      )}
    </div>
  );
};
