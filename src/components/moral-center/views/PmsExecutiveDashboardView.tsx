import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  FolderKanban,
  Coins,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Download,
  Eye,
  Check,
  X,
  MessageSquare,
  FileText,
  ShieldCheck,
  Printer,
  ChevronDown,
  Loader2,
  FileDown,
  Shield,
  User,
  Calculator
} from 'lucide-react';
import {
  loadPmsExecutiveStats,
  loadPmsKpis,
  verifyPmsKpi,
  batchApproveHighConfidenceKpis,
  getActivePmsUser,
  PMS_ROLE_META,
  type PmsUserPermission,
  type PmsKpiItem,
  type PmsDecisionAction,
  type PmsExecutiveStats
} from '../data/pmsDataService';
import {
  exportDashboardToPdf,
  exportDashboardToDocx
} from '../utils/dashboardExportUtils';
import { UserPermissionsModal } from '../components/UserPermissionsModal';
import { KpiProcessCalculatorModal } from '../components/KpiProcessCalculatorModal';

export const PmsExecutiveDashboardView: React.FC = () => {
  const [activeUser, setActiveUser] = useState<PmsUserPermission>(() => getActivePmsUser());
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);
  const [isKpiCalcModalOpen, setIsKpiCalcModalOpen] = useState<boolean>(false);
  const [kpiCalcInitialId, setKpiCalcInitialId] = useState<string | undefined>(undefined);

  const [fiscalYear, setFiscalYear] = useState<number>(2570);
  const [quarter, setQuarter] = useState<string>('ไตรมาส 1');
  const [stats, setStats] = useState<PmsExecutiveStats>(() => loadPmsExecutiveStats(fiscalYear, quarter));
  const [kpis, setKpis] = useState<PmsKpiItem[]>(() => loadPmsKpis());
  
  // Dashboard container ref for isolating export (excluding all menus)
  const dashboardRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);

  // Modal state for viewing KPI details / Evidence / Review
  const [selectedKpi, setSelectedKpi] = useState<PmsKpiItem | null>(null);
  const [selectedAction, setSelectedAction] = useState<PmsDecisionAction | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen]);

  // Reload data when db updates
  useEffect(() => {
    const handleSync = () => {
      setStats(loadPmsExecutiveStats(fiscalYear, quarter));
      setKpis(loadPmsKpis());
    };
    const handleUserSync = () => {
      setActiveUser(getActivePmsUser());
    };
    window.addEventListener('moral-projects-db-updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('moral-pms-users-updated', handleUserSync);
    return () => {
      window.removeEventListener('moral-projects-db-updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('moral-pms-users-updated', handleUserSync);
    };
  }, [fiscalYear, quarter]);

  const handleYearChange = (year: number) => {
    setFiscalYear(year);
    setStats(loadPmsExecutiveStats(year, quarter));
  };

  const handleQuarterChange = (q: string) => {
    setQuarter(q);
    setStats(loadPmsExecutiveStats(fiscalYear, q));
  };

  // One-click Batch Approve for items with high AI confidence
  const handleBatchApprove = () => {
    if (!activeUser.canApprove) {
      alert(`คุณกำลังเข้าใช้งานในฐานะ "${activeUser.userName}" (${activeUser.position}) ซึ่งไม่มีสิทธิ์อนุมัติ (ต้องเป็นผู้มีสิทธิ์ Approve เช่น ผู้อำนวยการศูนย์คุณธรรม)`);
      return;
    }
    const result = batchApproveHighConfidenceKpis(`${activeUser.userName} (${activeUser.position})`);
    setStats(loadPmsExecutiveStats(fiscalYear, quarter));
    setKpis(loadPmsKpis());
    if (result.approvedCount > 0) {
      setToastMessage(`✓ รับรองผลอัตโนมัติสำเร็จ ${result.approvedCount} รายการ ที่ผ่านการตรวจสอบหลักฐานด้วย AI ความเชื่อมั่นสูง`);
    } else {
      setToastMessage('ไม่พบรายการที่รอตรวจสอบหรือทุกรายการได้รับการรับรองแล้ว');
    }
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Single KPI Approval
  const handleApproveSingle = (kpiId: string) => {
    if (!activeUser.canApprove) {
      alert(`คุณไม่มีสิทธิ์ในการอนุมัติรับรองผล (ต้องเป็นสิทธิ์ผู้มีอำนาจอนุมัติ / Approver)`);
      return;
    }
    verifyPmsKpi(kpiId, 'ผ่านการรับรอง', `${activeUser.userName} (${activeUser.position})`);
    setStats(loadPmsExecutiveStats(fiscalYear, quarter));
    setKpis(loadPmsKpis());
    setSelectedKpi(null);
    setToastMessage('✓ บันทึกการรับรองตัวชี้วัดเรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Single KPI Rejection / Send back
  const handleRejectSingle = (kpiId: string) => {
    if (!activeUser.canReview && !activeUser.canApprove) {
      alert(`คุณไม่มีสิทธิ์ในการส่งกลับแก้ไข (ต้องเป็นสิทธิ์ Reviewer หรือ Approver)`);
      return;
    }
    if (!rejectionReasonInput.trim()) {
      alert('กรุณาระบุเหตุผลในการส่งกลับแก้ไข เพื่อให้เจ้าของข้อมูลดำเนินการปรับปรุง');
      return;
    }
    verifyPmsKpi(kpiId, 'ส่งกลับแก้ไข', `${activeUser.userName} (${activeUser.position})`, rejectionReasonInput);
    setStats(loadPmsExecutiveStats(fiscalYear, quarter));
    setKpis(loadPmsKpis());
    setSelectedKpi(null);
    setRejectionReasonInput('');
    setToastMessage('ส่งกลับแก้ไขและบันทึกเหตุผลในระบบเรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Export report to PDF (Captures ONLY the dashboard container, excluding all menus)
  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExportMenuOpen(false);
    try {
      setIsExporting(true);
      await exportDashboardToPdf({
        viewTitle: `ภาพรวมผลการดำเนินงาน_PMS_ปี${fiscalYear}_${quarter.replace(/\s+/g, '')}`,
        sectorTitle: 'ศูนย์คุณธรรม (องค์การมหาชน)',
        viewSubtitle: `ข้อมูลตัดยอด ณ ${stats.cutOffDate} • แดชบอร์ดผู้บริหารและตัวชี้วัดความสำเร็จ`,
        targetElement: dashboardRef.current
      });
      setToastMessage('✓ ส่งออกไฟล์ PDF ความละเอียดสูงเรียบร้อยแล้ว');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('เกิดข้อผิดพลาดในการส่งออกไฟล์ PDF กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

  // Export report to DOCX (Word)
  const handleExportDocx = async () => {
    if (isExporting) return;
    setIsExportMenuOpen(false);
    try {
      setIsExporting(true);
      await exportDashboardToDocx({
        viewTitle: `ภาพรวมผลการดำเนินงาน_PMS_ปี${fiscalYear}_${quarter.replace(/\s+/g, '')}`,
        sectorTitle: 'ศูนย์คุณธรรม (องค์การมหาชน)',
        viewSubtitle: `ข้อมูลตัดยอด ณ ${stats.cutOffDate} • แดชบอร์ดผู้บริหารและตัวชี้วัดความสำเร็จ`,
        targetElement: dashboardRef.current
      });
      setToastMessage('✓ ส่งออกไฟล์ DOCX เรียบร้อยแล้ว');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Failed to export DOCX:', err);
      alert('เกิดข้อผิดพลาดในการส่งออกไฟล์ DOCX กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

  // Browser Print Preview (Menus hidden by @media print)
  const handlePrint = () => {
    setIsExportMenuOpen(false);
    window.print();
  };

  // Donut chart math
  const totalCert = Math.max(stats.certificationCounts.total, 1);
  const approvedPct = (stats.certificationCounts.approved / totalCert) * 100;
  const pendingPct = (stats.certificationCounts.pending / totalCert) * 100;
  const rejectedPct = (stats.certificationCounts.rejected / totalCert) * 100;

  // SVG Donut circumference = 2 * PI * 42 = 263.89
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dashApproved = (approvedPct / 100) * circ;
  const dashPending = (pendingPct / 100) * circ;
  const dashRejected = (rejectedPct / 100) * circ;

  return (
    <div
      ref={dashboardRef}
      className="pms-executive-container"
      style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%' }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="pms-toast no-print"
          data-export-ignore="true"
          style={{
            position: 'fixed',
            top: '24px',
            right: '28px',
            zIndex: 99999,
            backgroundColor: '#064e3b',
            color: '#ecfdf5',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            border: '1px solid #059669'
          }}
        >
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          TOP HEADER: EXACT REPLICA OF PAGE 10 PMS MOCKUP
      ===================================================================== */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 36, 124, 0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                padding: '3px 9px',
                borderRadius: '6px',
                letterSpacing: '0.4px'
              }}
            >
              PMS ศูนย์คุณธรรม
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              ระบบบริหารผลการดำเนินงานองค์กร (Performance Management System)
            </span>
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '6px 0 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            ภาพรวมผลการดำเนินงานองค์กร
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
            ข้อมูลตัดยอด ณ {stats.cutOffDate} • เชื่อมโยงยุทธศาสตร์ แผนงาน โครงการ งบประมาณ และตัวชี้วัด
          </p>

          {/* Print-only badge */}
          <div
            className="pms-print-only-badge"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1e3a8a',
              marginTop: '6px'
            }}
          >
            <span>ปีงบประมาณ {fiscalYear}</span>
            <span>•</span>
            <span>{quarter}</span>
            <span>•</span>
            <span>พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH')}</span>
          </div>
        </div>

        {/* Filters and Actions (No-print, excluded from export) */}
        <div
          className="no-print"
          data-export-ignore="true"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
        >
          {/* Active User Badge & Role Pill */}
          <div
            onClick={() => setIsPermissionModalOpen(true)}
            title="คลิกเพื่อจัดการตำแหน่งและสิทธิ์ผู้ใช้งาน (ใครเป็นตำแหน่งอะไร, ใครเป็นคน Approve, ใครมีสิทธิ์ดู)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: activeUser.canApprove ? '#fef3c7' : activeUser.canReview ? '#ede9fe' : '#e0f2fe',
                color: activeUser.canApprove ? '#b45309' : activeUser.canReview ? '#6d28d9' : '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {activeUser.canApprove ? <ShieldCheck size={16} /> : <User size={16} />}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                {activeUser.userName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {activeUser.position} • <span style={{ color: activeUser.canApprove ? '#b45309' : activeUser.canReview ? '#7c3aed' : '#2563eb', fontWeight: 700 }}>{PMS_ROLE_META[activeUser.role]?.label}</span>
              </div>
            </div>
          </div>

          {/* User Permission Management Button */}
          <button
            type="button"
            onClick={() => setIsPermissionModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              fontSize: '12.5px',
              fontWeight: 700,
              backgroundColor: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '9px',
              cursor: 'pointer'
            }}
            title="กำหนดสิทธิ์ผู้ใช้งาน ตำแหน่ง และผู้อนุมัติ"
          >
            <Shield size={15} color="#475569" />
            <span>สิทธิ์ & ผู้อนุมัติ</span>
          </button>

          {/* KPI Calculation Process Button */}
          <button
            type="button"
            onClick={() => {
              setKpiCalcInitialId(undefined);
              setIsKpiCalcModalOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              fontSize: '12.5px',
              fontWeight: 700,
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              borderRadius: '9px',
              cursor: 'pointer'
            }}
            title="แสดงขั้นตอนการคิดคำนวณ KPI ตามเอกสารข้อเสนอ ดร.ณพิชญา เทพรอด"
          >
            <Calculator size={15} color="#16a34a" />
            <span>ขั้นตอนคำนวณ KPI</span>
          </button>

          {/* Year Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>ปีงบประมาณ:</span>
            <select
              value={fiscalYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              style={{
                padding: '7px 12px',
                borderRadius: '9px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                color: '#1e293b',
                cursor: 'pointer'
              }}
            >
              <option value={2570}>2570</option>
              <option value={2571}>2571</option>
              <option value={2569}>2569</option>
            </select>
          </div>

          {/* Quarter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>งวด:</span>
            <select
              value={quarter}
              onChange={(e) => handleQuarterChange(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '9px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                color: '#1e293b',
                cursor: 'pointer'
              }}
            >
              <option value="ไตรมาส 1">ไตรมาส 1</option>
              <option value="ไตรมาส 2">ไตรมาส 2</option>
              <option value="ไตรมาส 3">ไตรมาส 3</option>
              <option value="ไตรมาส 4">ไตรมาส 4</option>
            </select>
          </div>

          {/* Export Dropdown */}
          <div ref={exportMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              disabled={isExporting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '9px',
                border: '1px solid #cbd5e1',
                backgroundColor: isExportMenuOpen ? '#eff6ff' : '#f8fafc',
                fontSize: '12.5px',
                fontWeight: 600,
                color: isExportMenuOpen ? '#2563eb' : '#334155',
                cursor: isExporting ? 'not-allowed' : 'pointer'
              }}
            >
              {isExporting ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>กำลังส่งออก...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>ส่งออกรายงาน</span>
                  <ChevronDown size={13} />
                </>
              )}
            </button>

            {isExportMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  minWidth: '270px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.14)',
                  padding: '6px',
                  zIndex: 999,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: '#64748b',
                    padding: '4px 8px 2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  เลือกรูปแบบการส่งออก (เฉพาะหน้าหลัก)
                </div>

                {/* Option 1: PDF */}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid transparent',
                    background: 'transparent',
                    color: '#0f172a',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FileDown size={16} color="#dc2626" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>
                      Export .PDF (ความละเอียดสูง)
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      บันทึกเฉพาะแดชบอร์ดหลัก ไม่มีเมนู
                    </div>
                  </div>
                </button>

                {/* Option 2: DOCX */}
                <button
                  type="button"
                  onClick={handleExportDocx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid transparent',
                    background: 'transparent',
                    color: '#0f172a',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FileText size={16} color="#2563eb" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>
                      Export .DOCX (Word)
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      เอกสาร Word พร้อมตารางข้อมูล
                    </div>
                  </div>
                </button>

                {/* Option 3: Browser Print */}
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid transparent',
                    background: 'transparent',
                    color: '#0f172a',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Printer size={16} color="#475569" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                      พิมพ์รายงาน (Print Preview)
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      สั่งพิมพ์หรือบันทึก PDF ผ่านเบราว์เซอร์
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* AI Batch Approve Button */}
          <button
            type="button"
            onClick={handleBatchApprove}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '9px',
              border: 'none',
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Sparkles size={15} />
            <span>รับรองผล AI อัตโนมัติ</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          4 KEY KPI SUMMARY BOXES (PAGE 10 PMS MOCKUP)
      ===================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '16px',
          width: '100%'
        }}
      >
        {/* Card 1: ตัวชี้วัดตามเป้าหมาย (9/12) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <TrendingUp size={26} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>ตัวชี้วัดตามเป้าหมาย</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', lineHeight: 1.2, marginTop: '2px' }}>
              {stats.kpiMetCount} / {stats.kpiTotalCount}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>เฉพาะรายการที่รับรองแล้ว</div>
          </div>
        </div>

        {/* Card 2: โครงการตามแผน (8/10) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <FolderKanban size={26} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>โครงการตามแผน</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#065f46', lineHeight: 1.2, marginTop: '2px' }}>
              {stats.projectsOnTrackCount} / {stats.projectsTotalCount}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>ความก้าวหน้าตามเกณฑ์ WBS</div>
          </div>
        </div>

        {/* Card 3: ใช้จ่ายงบประมาณ (25%) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Coins size={26} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>ใช้จ่ายงบประมาณ</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#92400e', lineHeight: 1.2, marginTop: '2px' }}>
              {stats.budgetSpentPercent}%
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>เทียบงบประมาณอนุมัติ</div>
          </div>
        </div>

        {/* Card 4: ประเด็นต้องตัดสินใจ (3 ประเด็น) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertCircle size={26} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>ประเด็นต้องตัดสินใจ</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#991b1b', lineHeight: 1.2, marginTop: '2px' }}>
              {stats.decisionIssuesCount} ประเด็น
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>รอข้อสั่งการผู้บริหาร</div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MIDDLE SECTION: COMPARISON BARS (LEFT) & CERTIFICATION DONUT (RIGHT)
      ===================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '7fr 5fr',
          gap: '20px',
          width: '100%'
        }}
      >
        {/* Left Card: ผลการดำเนินงานเทียบเป้าหมาย (Bar Chart) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                ผลการดำเนินงานเทียบเป้าหมาย
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1e40af' }} />
                  <span style={{ color: '#475569' }}>เป้าหมาย (100%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#60a5fa' }} />
                  <span style={{ color: '#475569' }}>ผลจริง</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '24px' }}>
              {stats.strategicDimensionScores.map((dim, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{dim.dimension}</span>
                    <span style={{ fontWeight: 800, color: dim.actual >= 80 ? '#059669' : '#d97706' }}>
                      {dim.actual}%
                    </span>
                  </div>

                  {/* Horizontal Bar with Target Marker at 100% */}
                  <div
                    style={{
                      height: '24px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(dim.actual, 100)}%`,
                        backgroundColor: dim.actual >= 80 ? '#3b82f6' : dim.actual >= 60 ? '#f59e0b' : '#ef4444',
                        borderRadius: '8px',
                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    />
                    {/* 100% Target vertical guideline */}
                    <div
                      style={{
                        position: 'absolute',
                        right: '0',
                        top: 0,
                        bottom: 0,
                        width: '3px',
                        backgroundColor: '#1e40af'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Scale Axis */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#94a3b8',
                marginTop: '16px',
                paddingTop: '8px',
                borderTop: '1px dashed #e2e8f0'
              }}
            >
              <span>0%</span>
              <span>20%</span>
              <span>40%</span>
              <span>60%</span>
              <span>80%</span>
              <span style={{ fontWeight: 700, color: '#1e40af' }}>100% (เป้าหมาย)</span>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '14px', fontStyle: 'italic' }}>
            * แต่ละตัวชี้วัดใช้เกณฑ์การคำนวณตามนิยามในทะเบียนตัวชี้วัด (KPI Registry)
          </div>
        </div>

        {/* Right Card: สถานะการรับรองข้อมูล (Donut Chart) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              สถานะการรับรองข้อมูล
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              การตรวจสอบและยืนยันผล 3 ระดับ
            </div>

            {/* Donut Graphic */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Track */}
                  <circle cx="50" cy="50" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />

                  {/* Segment 1: Approved (#1e40af) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="transparent"
                    stroke="#1e40af"
                    strokeWidth="12"
                    strokeDasharray={`${dashApproved} ${circ}`}
                    strokeDashoffset={0}
                  />

                  {/* Segment 2: Pending (#f59e0b) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    strokeDasharray={`${dashPending} ${circ}`}
                    strokeDashoffset={-dashApproved}
                  />

                  {/* Segment 3: Rejected (#ef4444) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray={`${dashRejected} ${circ}`}
                    strokeDashoffset={-(dashApproved + dashPending)}
                  />
                </svg>

                {/* Center Counter */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                    {stats.certificationCounts.total}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>รายการ</span>
                </div>
              </div>
            </div>

            {/* Legend with Counts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1e40af' }} />
                  <span style={{ color: '#334155' }}>รับรองแล้ว</span>
                </div>
                <span style={{ fontWeight: 700, color: '#1e40af' }}>{stats.certificationCounts.approved}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <span style={{ color: '#334155' }}>รอตรวจสอบ</span>
                </div>
                <span style={{ fontWeight: 700, color: '#d97706' }}>{stats.certificationCounts.pending}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <span style={{ color: '#334155' }}>ส่งกลับแก้ไข</span>
                </div>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>{stats.certificationCounts.rejected}</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '14px', textAlign: 'center' }}>
            * ข้อมูลรอตรวจสอบยังไม่นำมารวมคำนวณในผลรับรององค์กร
          </div>
        </div>
      </div>

      {/* =====================================================================
          BOTTOM SECTION: ประเด็นที่ต้องติดตามและพิจารณา (TABLE ACCORDING TO PAGE 10)
      ===================================================================== */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          padding: '22px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 18px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              ประเด็นที่ต้องติดตามและพิจารณา
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              เชื่อมโยงข้อสั่งการผู้บริหารกับการปรับแผนและแก้ไขปัญหาในพื้นที่
            </div>
          </div>

          <div
            style={{
              fontSize: '11.5px',
              color: '#059669',
              backgroundColor: '#ecfdf5',
              padding: '4px 10px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600
            }}
          >
            <Check size={14} />
            <span>ตรวจสอบผลหลักฐานและวันที่ปรับปรุงก่อนใช้ประกอบการตัดสินใจ</span>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>ประเด็น</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '130px' }}>สถานะ</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '220px' }}>ผู้รับผิดชอบ</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '130px' }}>กำหนดติดตาม</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center', width: '140px' }}>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {stats.decisionActions.map((act) => {
                const statusBg =
                  act.status === 'ต้องพิจารณา'
                    ? '#fffbeb'
                    : act.status === 'รอตรวจสอบ'
                    ? '#eff6ff'
                    : act.status === 'เสร็จสิ้น'
                    ? '#ecfdf5'
                    : '#f8fafc';
                const statusColor =
                  act.status === 'ต้องพิจารณา'
                    ? '#d97706'
                    : act.status === 'รอตรวจสอบ'
                    ? '#2563eb'
                    : act.status === 'เสร็จสิ้น'
                    ? '#059669'
                    : '#475569';

                return (
                  <tr
                    key={act.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px', fontWeight: 600, color: '#1e293b' }}>
                      <div>{act.issueTopic}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                        {act.projectName}
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          backgroundColor: statusBg,
                          color: statusColor,
                          padding: '4px 9px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {act.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px', color: '#334155', fontSize: '12.5px' }}>
                      {act.responsiblePerson}
                    </td>

                    <td style={{ padding: '14px', color: '#64748b', fontSize: '12.5px' }}>
                      {act.dueDate}
                    </td>

                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedAction(act)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '7px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#2563eb',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={13} />
                          <span>ดูข้อสั่งการ</span>
                        </button>
                        {act.kpiId && (
                          <button
                            type="button"
                            onClick={() => {
                              const found = kpis.find((k) => k.id === act.kpiId);
                              if (found) setSelectedKpi(found);
                            }}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '7px',
                              border: '1px solid #93c5fd',
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FileText size={13} />
                            <span>ดูหลักฐาน</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          AI EXECUTIVE BRIEFING (EXECUTIVE SUMMARY ASSISTANT)
      ===================================================================== */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          borderRadius: '18px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.15)'
            }}
          >
            <Sparkles size={18} color="#93c5fd" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>
            AI Executive Briefing • สรุปวิเคราะห์ผลองค์กรประจำปีสำหรับผู้บริหาร
          </span>
        </div>

        <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 10px 0', lineHeight: 1.4 }}>
          ภาพรวมปีงบประมาณ {fiscalYear} {quarter}: ตัวชี้วัดที่รับรองแล้วบรรลุเป้าหมาย 75% โดยมิติเครือข่ายมีผลสัมฤทธิ์เด่นชัดที่สุด (90%)
        </h3>

        <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
          การใช้จ่ายงบประมาณอยู่ที่ 25% สอดคล้องกับแผนงวดแรก อย่างไรก็ตาม มิติผลผลิตโครงการ (Deliverables) อยู่ที่ 60% 
          เนื่องจากโครงการคลินิกวินัยการเงิน กทม. (proj-3) และองค์กรคุณธรรมอุดรธานี (proj-7) ยังรอเอกสารรับรอง 
          แนะนำให้คณะกรรมการเร่งรัดติดตาม 3 ข้อสั่งการเพื่อปลดล็อกการเบิกจ่ายและรับรองผลในไตรมาสที่ 2
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
          <button
            type="button"
            onClick={handleBatchApprove}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#3b82f6',
              border: 'none',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            อนุมัติรับรองผลตามคำแนะนำ AI
          </button>
        </div>
      </div>

      {/* =====================================================================
          ACTION MODAL: ดูข้อสั่งการ / มติที่ประชุม
      ===================================================================== */}
      {selectedAction && (
        <div
          className="no-print"
          data-export-ignore="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
          onClick={() => setSelectedAction(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="#2563eb" />
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  รายละเอียดข้อสั่งการผู้บริหาร
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAction(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '11.5px' }}>ประเด็นปัญหา:</span>
                <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>{selectedAction.issueTopic}</div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11.5px' }}>โครงการที่เกี่ยวข้อง:</span>
                <div style={{ color: '#334155', marginTop: '2px' }}>{selectedAction.projectName}</div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '10px' }}>
                <span style={{ color: '#1e40af', fontWeight: 700, fontSize: '12px' }}>มติ / ข้อสั่งการ:</span>
                <div style={{ color: '#1e293b', marginTop: '4px', lineHeight: 1.5 }}>{selectedAction.directiveText}</div>
              </div>

              {selectedAction.reason && (
                <div>
                  <span style={{ color: '#64748b', fontSize: '11.5px' }}>เหตุผลเบื้องหลัง:</span>
                  <div style={{ color: '#475569', marginTop: '2px' }}>{selectedAction.reason}</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11.5px' }}>ผู้รับผิดชอบ:</span>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{selectedAction.responsiblePerson}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11.5px' }}>กำหนดเวลาแล้วเสร็จ:</span>
                  <div style={{ fontWeight: 600, color: '#dc2626', marginTop: '2px' }}>{selectedAction.dueDate}</div>
                </div>
              </div>

              {selectedAction.followUpResult && (
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#475569', fontWeight: 600, fontSize: '11.5px' }}>ผลการติดตามล่าสุด:</span>
                  <div style={{ color: '#1e293b', marginTop: '3px' }}>{selectedAction.followUpResult}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setSelectedAction(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          KPI EVIDENCE & VERIFICATION MODAL
      ===================================================================== */}
      {selectedKpi && (
        <div
          className="no-print"
          data-export-ignore="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
          onClick={() => setSelectedKpi(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '620px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#2563eb" />
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  ตรวจสอบหลักฐานและรับรองผลตัวชี้วัด
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKpi(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>{selectedKpi.kpiCode}</span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor:
                        selectedKpi.verificationStatus === 'ผ่านการรับรอง'
                          ? '#ecfdf5'
                          : selectedKpi.verificationStatus === 'รอตรวจสอบ'
                          ? '#fffbeb'
                          : '#fef2f2',
                      color:
                        selectedKpi.verificationStatus === 'ผ่านการรับรอง'
                          ? '#059669'
                          : selectedKpi.verificationStatus === 'รอตรวจสอบ'
                          ? '#d97706'
                          : '#dc2626'
                    }}
                  >
                    {selectedKpi.verificationStatus}
                  </span>
                </div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                  {selectedKpi.kpiName}
                </h3>
                <p style={{ margin: '3px 0 0 0', color: '#64748b', fontSize: '12px' }}>
                  {selectedKpi.definition}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>เป้าหมาย (Target):</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                    {selectedKpi.targetValue} {selectedKpi.unit}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>ผลจริงที่รายงาน (Actual):</span>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#2563eb' }}>
                    {selectedKpi.actualValue} {selectedKpi.unit}
                  </div>
                </div>
              </div>

              {/* Evidence File & AI Pre-screening info */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} color="#2563eb" />
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>หลักฐานประกอบการประเมิน:</span>
                  </div>
                  {selectedKpi.aiConfidenceScore && (
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: selectedKpi.aiConfidenceScore >= 80 ? '#059669' : '#d97706',
                        backgroundColor: selectedKpi.aiConfidenceScore >= 80 ? '#ecfdf5' : '#fffbeb',
                        padding: '2px 8px',
                        borderRadius: '999px'
                      }}
                    >
                      AI Match: {selectedKpi.aiConfidenceScore}%
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: 600 }}>
                  📄 {selectedKpi.evidenceFileName || 'ไม่มีไฟล์แนบ'}
                </div>

                {selectedKpi.aiNotes && (
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569', backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '6px' }}>
                    💡 <b>AI ข้อสังเกต:</b> {selectedKpi.aiNotes}
                  </div>
                )}
              </div>

              {/* Rejection / Send-back reason input */}
              {selectedKpi.verificationStatus !== 'ผ่านการรับรอง' && (
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    กรณีส่งกลับแก้ไข (ระบุเหตุผล):
                  </span>
                  <input
                    type="text"
                    placeholder="เช่น ข้อมูลไม่สอดคล้องกับใบเสร็จ, เสี่ยงนับซ้ำ..."
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      marginTop: '4px',
                      fontSize: '12.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setSelectedKpi(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    border: 'none',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKpiCalcInitialId(selectedKpi.id);
                    setIsKpiCalcModalOpen(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                  title="ดูขั้นตอนการคิดคำนวณและการแทนค่าในสูตรของตัวชี้วัดนี้"
                >
                  <Calculator size={14} color="#16a34a" />
                  <span>ขั้นตอนการคิดคำนวณ KPI</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedKpi.verificationStatus !== 'ผ่านการรับรอง' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRejectSingle(selectedKpi.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ส่งกลับแก้ไข
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveSingle(selectedKpi.id)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        backgroundColor: '#10b981',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✓ รับรองผล (Approve)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Permissions & Role Management Modal */}
      <UserPermissionsModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onUserChanged={(u) => setActiveUser(u)}
      />

      {/* KPI Step-by-Step Calculation Engine Modal */}
      <KpiProcessCalculatorModal
        isOpen={isKpiCalcModalOpen}
        onClose={() => setIsKpiCalcModalOpen(false)}
        initialKpiId={kpiCalcInitialId}
      />
    </div>
  );
};
