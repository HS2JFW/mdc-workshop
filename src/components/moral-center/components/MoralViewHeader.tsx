import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FileDown,
  Loader2,
  Globe,
  ChevronDown,
  Download,
  Check
} from 'lucide-react';
import { exportDashboardToPdf, exportDashboardToDocx } from '../utils/dashboardExportUtils';
import {
  MORAL_LANGUAGE_OPTIONS,
  useMoralLanguage,
  type MoralLanguageCode
} from '../utils/moralLanguageTranslator';

interface MoralViewHeaderProps {
  sectorTitle?: string;
  sectorBadgeColor?: string;
  viewTitle: string;
  viewSubtitle?: string;
  agencies?: { name: string; tag: string }[];
  aiModelTag?: string;
  hideRightActions?: boolean;
  onExportPdf?: () => void;
  onExportDocx?: () => void;
  children?: React.ReactNode;
  topBar?: React.ReactNode;
}

export const MoralViewHeader: React.FC<MoralViewHeaderProps> = ({
  sectorTitle = '',
  sectorBadgeColor = '#3b82f6',
  viewTitle,
  viewSubtitle = '',
  children,
  topBar
}) => {
  const { language, setLanguage, t } = useMoralLanguage();
  const [exportingType, setExportingType] = useState<'pdf' | 'docx' | null>(null);
  const [selectedExportFormat, setSelectedExportFormat] = useState<'pdf' | 'docx'>('pdf');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement | null>(null);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setIsLangMenuOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const findDashboardContainer = (): HTMLElement | null => {
    if (headerRef.current) {
      const parentContainer = headerRef.current.closest('.moral-view-container') as HTMLElement | null;
      if (parentContainer) return parentContainer;
    }
    return document.querySelector('.moral-view-container') as HTMLElement | null;
  };

  const handleExportPdfClick = async () => {
    if (exportingType) return;
    setSelectedExportFormat('pdf');
    setIsExportMenuOpen(false);
    try {
      setExportingType('pdf');
      await exportDashboardToPdf({
        sectorTitle: t(sectorTitle),
        viewTitle: t(viewTitle),
        viewSubtitle: t(viewSubtitle),
        targetElement: findDashboardContainer()
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert(
        t(
          'เกิดข้อผิดพลาดในการสร้างไฟล์ PDF กรุณาลองใหม่อีกครั้ง',
          'Failed to generate PDF file. Please try again.',
          '生成 PDF 文件失败，请重试。'
        )
      );
    } finally {
      setExportingType(null);
    }
  };

  const handleExportDocxClick = async () => {
    if (exportingType) return;
    setSelectedExportFormat('docx');
    setIsExportMenuOpen(false);
    try {
      setExportingType('docx');
      await exportDashboardToDocx({
        sectorTitle: t(sectorTitle),
        viewTitle: t(viewTitle),
        viewSubtitle: t(viewSubtitle),
        targetElement: findDashboardContainer()
      });
    } catch (err) {
      console.error('Failed to export DOCX:', err);
      alert(
        t(
          'เกิดข้อผิดพลาดในการสร้างไฟล์ DOCX กรุณาลองใหม่อีกครั้ง',
          'Failed to generate DOCX file. Please try again.',
          '生成 DOCX 文件失败，请重试。'
        )
      );
    } finally {
      setExportingType(null);
    }
  };

  const currentLangMeta =
    MORAL_LANGUAGE_OPTIONS.find((opt) => opt.code === language) || MORAL_LANGUAGE_OPTIONS[0];

  return (
    <header
      ref={headerRef}
      className="moral-view-header"
      style={{ flexDirection: 'column', alignItems: 'stretch', gap: '14px' }}
    >
      {topBar && (
        <div className="moral-view-header-top-bar" style={{ width: '100%', marginBottom: '-4px' }}>
          {topBar}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '20px',
          width: '100%',
          flexWrap: 'wrap'
        }}
      >
        {/* ด้านซ้าย: ป้ายระดับ, ชื่อหน้าหลัก และคำอธิบาย */}
        <div className="moral-view-header-left" style={{ flex: 1, minWidth: '280px' }}>
          {sectorTitle ? (
            <div
              className="moral-view-sector-badge"
              style={{
                backgroundColor: `${sectorBadgeColor}14`,
                color: sectorBadgeColor,
                borderColor: `${sectorBadgeColor}30`,
                borderRadius: '20px',
                padding: '4px 14px',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              <span>{t(sectorTitle)}</span>
            </div>
          ) : null}
          <h1 className="moral-view-main-title" style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '4px 0 2px 0' }}>{t(viewTitle)}</h1>
          {viewSubtitle ? (
            <p className="moral-view-sub-title" style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>{t(viewSubtitle)}</p>
          ) : null}
        </div>

        {/* ด้านบนขวา: [1. ปุ่ม Export Dropdown (ก่อนหน้า)] + [2. ปุ่มเปลี่ยนภาษา (ขวาสุด)] */}
        <div
          className="moral-view-header-right"
          data-export-ignore="true"
          data-no-translate="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            flexShrink: 0
          }}
        >
          {/* 1. ปุ่ม Export (ก่อนหน้าปุ่มภาษา): ลักษณะ Drop Down List เลือก Type ที่ต้องการ Export */}
          <div ref={exportDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                if (exportingType) return;
                setIsExportMenuOpen((prev) => !prev);
                setIsLangMenuOpen(false);
              }}
              disabled={exportingType !== null}
              title={
                language === 'th'
                  ? 'เลือกประเภทไฟล์ที่ต้องการ Export (.PDF หรือ .DOCX)'
                  : language === 'en'
                  ? 'Select file type to Export (.PDF or .DOCX)'
                  : '选择导出文件格式 (.PDF 或 .DOCX)'
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                background:
                  exportingType === 'pdf'
                    ? 'linear-gradient(180deg, #e11d48 0%, #be123c 100%)'
                    : exportingType === 'docx'
                    ? 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)'
                    : 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)',
                border: 'none',
                cursor: exportingType ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(30, 58, 138, 0.28)',
                transition: 'all 0.2s ease'
              }}
            >
              {exportingType ? (
                <>
                  <Loader2 size={15} color="#ffffff" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>
                    {language === 'th'
                      ? `กำลังสร้างไฟล์ .${exportingType.toUpperCase()}...`
                      : language === 'en'
                      ? `Exporting .${exportingType.toUpperCase()}...`
                      : `正在导出 .${exportingType.toUpperCase()}...`}
                  </span>
                </>
              ) : (
                <>
                  <Download size={15} color="#93c5fd" />
                  <span>
                    {language === 'th'
                      ? `Export ข้อมูล (.${selectedExportFormat.toUpperCase()})`
                      : language === 'en'
                      ? `Export Data (.${selectedExportFormat.toUpperCase()})`
                      : `导出报告 (.${selectedExportFormat.toUpperCase()})`}
                  </span>
                  <ChevronDown
                    size={14}
                    color="#bfdbfe"
                    style={{
                      transform: isExportMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.18s ease'
                    }}
                  />
                </>
              )}
            </button>

            {isExportMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  minWidth: '245px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.16)',
                  padding: '6px',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#64748b',
                    padding: '4px 8px 2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}
                >
                  {language === 'th'
                    ? 'เลือกประเภทไฟล์ที่ต้องการ Export'
                    : language === 'en'
                    ? 'Select Export Format'
                    : '选择导出文件类型'}
                </div>

                {/* Option 1: Export .PDF */}
                <button
                  type="button"
                  onClick={handleExportPdfClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    border: selectedExportFormat === 'pdf' ? '1px solid #fecdd3' : '1px solid transparent',
                    background: selectedExportFormat === 'pdf' ? '#fff1f2' : 'transparent',
                    color: '#0f172a',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        background: '#ffe4e6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <FileDown size={16} color="#e11d48" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#be123c' }}>
                        Export .PDF
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {language === 'th'
                          ? 'เอกสารรายงาน PDF ความละเอียดสูง'
                          : language === 'en'
                          ? 'High-resolution PDF report'
                          : '高分辨率 PDF 报告文档'}
                      </div>
                    </div>
                  </div>
                  {selectedExportFormat === 'pdf' && <Check size={14} color="#e11d48" />}
                </button>

                {/* Option 2: Export .DOCX */}
                <button
                  type="button"
                  onClick={handleExportDocxClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    border: selectedExportFormat === 'docx' ? '1px solid #bfdbfe' : '1px solid transparent',
                    background: selectedExportFormat === 'docx' ? '#eff6ff' : 'transparent',
                    color: '#0f172a',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        background: '#dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <FileText size={16} color="#2563eb" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8' }}>
                        Export .DOCX
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {language === 'th'
                          ? 'เอกสาร Word (.docx) สำหรับแก้ไขต่อ'
                          : language === 'en'
                          ? 'Editable Microsoft Word (.docx)'
                          : '可编辑 Word (.docx) 报告文档'}
                      </div>
                    </div>
                  </div>
                  {selectedExportFormat === 'docx' && <Check size={14} color="#2563eb" />}
                </button>
              </div>
            )}
          </div>

          {/* 2. ปุ่มเปลี่ยนภาษา (ขวาสุด): เลือก ไทย / Eng / ภาษาจีน */}
          <div ref={langDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setIsLangMenuOpen((prev) => !prev);
                setIsExportMenuOpen(false);
              }}
              title="เปลี่ยนภาษา (ไทย / Eng / ภาษาจีน)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              <Globe size={15} color="#2563eb" />
              <span style={{ color: '#64748b', fontWeight: 600 }}>
                {language === 'th' ? 'ภาษา:' : language === 'en' ? 'Lang:' : '语言:'}
              </span>
              <span>
                {currentLangMeta.flag} {currentLangMeta.shortLabel}
              </span>
              <ChevronDown
                size={14}
                color="#475569"
                style={{
                  transform: isLangMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.18s ease'
                }}
              />
            </button>

            {isLangMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  minWidth: '175px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.14)',
                  padding: '6px',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                {MORAL_LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLanguage(opt.code as MoralLanguageCode);
                        setIsLangMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isSelected ? '#eff6ff' : 'transparent',
                        color: isSelected ? '#1d4ed8' : '#1e293b',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
                      </span>
                      {isSelected && <Check size={14} color="#2563eb" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {children && (
        <div style={{ width: '100%', marginTop: '2px' }}>
          {children}
        </div>
      )}
    </header>
  );
};
