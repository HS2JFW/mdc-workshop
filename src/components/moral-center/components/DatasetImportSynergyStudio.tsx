import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Database,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Table as TableIcon,
  RefreshCw,
  X
} from 'lucide-react';
import {
  evaluateDataCompatibility,
  type CompatibilityAssessmentResult,
  type InternalDatasetInput,
  type ExternalDatasetInput
} from '../data/dataCompatibilityEvaluator';
import { ALL_DUCKDB_TABLES_META } from '../data/moralDuckDbDatasetService';
import { SynergyIdeaStudioView } from './SynergyIdeaStudioView';
import type { PublishedSynergyItem } from '../data/publishedSynergyService';

export interface DatasetImportSynergyStudioProps {
  onClose: () => void;
  onPublished?: (item: PublishedSynergyItem) => void;
}

// Preset System Pages & Tables for Option 2
export const SYSTEM_PAGE_TABLE_PRESETS = [
  {
    pageId: 'policy-1-1',
    pageName: 'หน้าดัชนีคุณธรรม (Moral Index)',
    icon: '📊',
    tables: [
      {
        id: 'mdc_moral_national_overview',
        name: 'ภาพรวมคะแนนคุณธรรม 5 มิติระดับประเทศ (2565–2568)',
        category: 'คุณธรรมหลัก',
        rowCount: 4,
        columns: ['ปี พ.ศ.', 'ด้านพอเพียง', 'ด้านวินัยรับผิดชอบ', 'ด้านสุจริต', 'ด้านจิตสาธารณะ', 'ด้านกตัญญู', 'คะแนนรวมเฉลี่ย']
      },
      {
        id: 'mdc_moral_regional_breakdown',
        name: 'คะแนนคุณธรรม 5 มิติจำแนกรายภูมิภาค (5 ภาค)',
        category: 'คุณธรรมรายภาค',
        rowCount: 24,
        columns: ['ปี พ.ศ.', 'ภูมิภาค', 'ด้านพอเพียง', 'ด้านวินัยรับผิดชอบ', 'ด้านสุจริต', 'ด้านจิตสาธารณะ', 'ด้านกตัญญู']
      },
      {
        id: 'mdc_moral_regional_trends',
        name: 'แนวโน้มการเปลี่ยนแปลงดัชนีคุณธรรม 77 จังหวัด',
        category: 'แนวโน้มรายพื้นที่',
        rowCount: 77,
        columns: ['รหัสจังหวัด', 'จังหวัด', 'ภูมิภาค', 'คะแนนคุณธรรมรวม', 'ด้านพอเพียง', 'ด้านวินัย', 'ด้านสุจริต']
      }
    ]
  },
  {
    pageId: 'policy-1-2',
    pageName: 'หน้าทุนชีวิต (Life Capital)',
    icon: '🌱',
    tables: [
      {
        id: 'mdc_lifecapital_national_overview',
        name: 'ภาพรวม 4+1 พลังทุนชีวิตระดับชาติ',
        category: 'ทุนชีวิตภาพรวม',
        rowCount: 4,
        columns: ['ปี พ.ศ.', 'พลังตัวตน', 'พลังครอบครัว', 'พลังสร้างปัญญา', 'พลังเพื่อนและกิจกรรม', 'พลังชุมชน']
      },
      {
        id: 'mdc_lifecapital_regional_breakdown',
        name: 'พลังทุนชีวิตจำแนกรายภูมิภาคและระดับคุณภาพ',
        category: 'ทุนชีวิตรายภาค',
        rowCount: 24,
        columns: ['ปี พ.ศ.', 'ภูมิภาค', 'พลังตัวตน', 'พลังครอบครัว', 'พลังสร้างปัญญา', 'พลังเพื่อนและกิจกรรม', 'พลังชุมชน']
      }
    ]
  },
  {
    pageId: 'policy-moral-credit',
    pageName: 'หน้า Moral Credit (แต้มความดี)',
    icon: '💳',
    tables: [
      {
        id: 'mdc_moral_credit_scores',
        name: 'ฐานข้อมูลคะแนน Moral Credit และแต้มความดีสะสมรายจังหวัด',
        category: 'Moral Credit',
        rowCount: 77,
        columns: ['จังหวัด', 'จำนวนผู้เปิดบัญชีสัจจะ', 'แต้มสะสมเฉลี่ย', 'อัตราการชำระหนี้ตรงเวลา', 'ระดับ Tier คุณธรรม']
      }
    ]
  },
  {
    pageId: 'policy-moral-lecturers',
    pageName: 'หน้าวิทยากรคุณธรรม (Moral Trainers / Coaches)',
    icon: '👨‍🏫',
    tables: [
      {
        id: 'mdc_moral_lecturers_roster',
        name: 'ฐานข้อมูลวิทยากรคุณธรรมจิตอาสาและโค้ช 5,346 คน (77 จังหวัด)',
        category: 'กำลังคนคุณธรรม',
        rowCount: 77,
        columns: ['จังหวัด', 'ภูมิภาค', 'จำนวนวิทยากรจิตอาสา', 'จำนวนโค้ชแกนนำ', 'สัดส่วนต่อประชากรแสนคน', 'กลุ่มเป้าหมายหลัก']
      }
    ]
  },
  {
    pageId: 'moral-analysis',
    pageName: 'หน้าภาพรวมยุทธศาสตร์ 20 ปี และ บวร',
    icon: '🏢',
    tables: [
      {
        id: 'mdc_moral_20yr_plan',
        name: 'เป้าหมายและตัวชี้วัดแผนแม่บทคุณธรรมแห่งชาติ 20 ปี',
        category: 'ยุทธศาสตร์ชาติ',
        rowCount: 20,
        columns: ['ระยะแผน', 'ปีเป้าหมาย', 'ดัชนีคุณธรรมรวม', 'สัดส่วนชุมชนคุณธรรม', 'อัตราการมีส่วนร่วม บวร']
      }
    ]
  }
];

// Preset External Agency Datasets for Fast Selection
export const PRESET_EXTERNAL_DATASETS: ExternalDatasetInput[] = [
  {
    id: 'ext_eef_dropout_stats',
    name: 'สถิติเด็กและเยาวชนเปราะบางหลุดออกจากระบบการศึกษา (กสศ.)',
    sourceAgency: 'กองทุนเพื่อความเสมอภาคทางการศึกษา (กสศ.) ร่วมกับ สพฐ.',
    category: 'การศึกษาและความเหลื่อมล้ำ',
    rowCount: 77,
    columns: ['รหัสจังหวัด', 'จังหวัด', 'จำนวนเด็กหลุดระบบ (คน)', 'อัตราเด็กหลุดระบบ (%)', 'กลุ่มยากจนพิเศษ', 'ปี พ.ศ. 2567']
  },
  {
    id: 'ext_oncb_drug_offenses',
    name: 'สถิติคดียาเสพติดและผู้เข้ารับการบำบัดรายจังหวัด (ป.ป.ส.)',
    sourceAgency: 'สำนักงานคณะกรรมการป้องกันและปราบปรามยาเสพติด (ป.ป.ส.)',
    category: 'ความมั่นคงและยาเสพติด',
    rowCount: 77,
    columns: ['รหัสจังหวัด', 'จังหวัด', 'จำนวนคดียาเสพติด', 'ผู้บำบัดฟื้นฟู (คน)', 'อัตราต่อประชากรแสนคน', 'ปี พ.ศ. 2567']
  },
  {
    id: 'ext_thairsc_traffic_accidents',
    name: 'สถิติอุบัติเหตุทางถนนและการสวมหมวกนิรภัย 77 จังหวัด (ThaiRSC)',
    sourceAgency: 'ศูนย์ข้อมูลอุบัติเหตุทางถนน (ThaiRSC) ร่วมกับ คค.–สธ.–สตช.',
    category: 'วินัยจราจรและความปลอดภัย',
    rowCount: 77,
    columns: ['รหัสจังหวัด', 'จังหวัด', 'ผู้เสียชีวิต (คน)', 'อัตราการสวมหมวกนิรภัย (%)', 'ประเภทยานพาหนะ', 'ปี พ.ศ. 2568']
  },
  {
    id: 'ext_tpmap_poverty_index',
    name: 'ดัชนีความยากจนและครัวเรือนเปราะบางรายจังหวัด (TPMAP)',
    sourceAgency: 'กระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์ (พม.) ร่วมกับ NECTEC/สวทช.',
    category: 'สวัสดิการสังคมและคนเปราะบาง',
    rowCount: 76,
    columns: ['รหัสจังหวัด', 'จังหวัด', 'ครัวเรือนเปราะบาง (ครัวเรือน)', 'คนเปราะบาง (คน)', 'ระดับความยากจน 0-3']
  }
];

export const DatasetImportSynergyStudio: React.FC<DatasetImportSynergyStudioProps> = ({
  onClose,
  onPublished
}) => {
  // Mode: 'import' | 'synergy_studio'
  const [studioMode, setStudioMode] = useState<'import' | 'synergy_studio'>('import');

  // Left Side: Internal Moral Center Datasets
  const [internalMode, setInternalMode] = useState<'upload' | 'system_select'>('system_select');
  const [uploadedInternalFiles, setUploadedInternalFiles] = useState<InternalDatasetInput[]>([]);
  const [selectedSystemPageId, setSelectedSystemPageId] = useState<string>('policy-moral-lecturers');
  const [selectedSystemTableId, setSelectedSystemTableId] = useState<string>('mdc_moral_lecturers_roster');

  // Right Side: External Agency Datasets
  const [uploadedExternalFiles, setUploadedExternalFiles] = useState<ExternalDatasetInput[]>([
    PRESET_EXTERNAL_DATASETS[0] // Default to กสศ.
  ]);

  // Assessment State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<CompatibilityAssessmentResult | null>(null);

  const fileInputInternalRef = useRef<HTMLInputElement | null>(null);
  const fileInputExternalRef = useRef<HTMLInputElement | null>(null);

  // Active Internal Selection Resolver
  const getActiveInternalDataset = (): InternalDatasetInput => {
    if (internalMode === 'upload' && uploadedInternalFiles.length > 0) {
      return uploadedInternalFiles[0];
    }
    const pagePreset = SYSTEM_PAGE_TABLE_PRESETS.find((p) => p.pageId === selectedSystemPageId) || SYSTEM_PAGE_TABLE_PRESETS[0];
    const tablePreset = pagePreset.tables.find((t) => t.id === selectedSystemTableId) || pagePreset.tables[0];
    return {
      id: tablePreset.id,
      name: tablePreset.name,
      sourceType: 'DuckDB System Table',
      category: tablePreset.category,
      tableName: tablePreset.id,
      pageId: pagePreset.pageId,
      columns: tablePreset.columns,
      rowCount: tablePreset.rowCount
    };
  };

  const getActiveExternalDataset = (): ExternalDatasetInput => {
    if (uploadedExternalFiles.length > 0) {
      return uploadedExternalFiles[0];
    }
    return PRESET_EXTERNAL_DATASETS[0];
  };

  // Handle Internal File Upload (Option 1)
  const handleInternalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheet];
          const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

          const cols = json.length > 0 ? Object.keys(json[0]) : ['คอลัมน์ 1', 'คอลัมน์ 2'];
          const newItem: InternalDatasetInput = {
            id: `custom_int_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            sourceType: `ไฟล์ ${file.name.endsWith('.csv') ? 'CSV' : 'Excel'} ภายใน`,
            category: 'ข้อมูลศูนย์คุณธรรมนำเข้าใหม่',
            columns: cols,
            rowCount: json.length,
            dataSnippet: json.slice(0, 5)
          };
          setUploadedInternalFiles((prev) => [newItem, ...prev]);
        } catch (err) {
          alert(`เกิดข้อผิดพลาดในการอ่านไฟล์ ${file.name}`);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle External File Upload
  const handleExternalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheet];
          const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

          const cols = json.length > 0 ? Object.keys(json[0]) : ['คอลัมน์ 1', 'คอลัมน์ 2'];
          const newItem: ExternalDatasetInput = {
            id: `custom_ext_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            sourceAgency: 'หน่วยงานภายนอก (นำเข้าผ่านไฟล์)',
            category: 'ข้อมูลภายนอก',
            columns: cols,
            rowCount: json.length,
            dataSnippet: json.slice(0, 5)
          };
          setUploadedExternalFiles((prev) => [newItem, ...prev]);
        } catch (err) {
          alert(`เกิดข้อผิดพลาดในการอ่านไฟล์ภายนอก ${file.name}`);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Run 5-Stage Compatibility Assessment
  const handleRunCompatibilityAssessment = () => {
    setIsEvaluating(true);
    setAssessmentResult(null);

    setTimeout(() => {
      const intData = getActiveInternalDataset();
      const extData = getActiveExternalDataset();
      const res = evaluateDataCompatibility(intData, extData);
      setAssessmentResult(res);
      setIsEvaluating(false);
    }, 600);
  };

  const activeInternal = getActiveInternalDataset();
  const activeExternal = getActiveExternalDataset();

  // If in synergy studio view mode:
  if (studioMode === 'synergy_studio' && assessmentResult) {
    return (
      <div
        className="admin-dataset-modal-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <div
          className="admin-dataset-modal-container"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '96%',
            maxWidth: '1360px',
            maxHeight: '94vh',
            backgroundColor: '#0f172a',
            borderRadius: '24px',
            border: '1.5px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
            overflowY: 'auto',
            padding: '24px'
          }}
        >
          <SynergyIdeaStudioView
            internalData={activeInternal}
            externalData={activeExternal}
            assessment={assessmentResult}
            onClose={() => setStudioMode('import')}
            onPublished={onPublished}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-dataset-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="admin-dataset-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '96%',
          maxWidth: '1380px',
          height: '92vh',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          borderRadius: '24px',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 50px rgba(56, 189, 248, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Kanit', sans-serif"
        }}
      >
        {/* ===================================================================
            HEADER: Studio Title & Close
        =================================================================== */}
        <div
          style={{
            padding: '18px 26px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(56, 189, 248, 0.3)'
              }}
            >
              <Database size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                  นำเข้าและสนธิข้อมูล Dataset (DuckDB Synergy Studio)
                </h2>
                <span
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '20px',
                    padding: '2px 10px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  DuckDB Ingestion Engine
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                เลือกหรืออัปโหลดข้อมูลภายในศูนย์คุณธรรม และข้อมูลภายนอกของหน่วยงานอื่น พร้อมตรวจสอบความเข้ากันได้ 5 มิติ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ===================================================================
            BODY: Two-Column Studio Layout
        =================================================================== */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* Studio Grid: 2 Panels */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
              gap: '24px'
            }}
          >
            {/* ===============================================================
                LEFT PANEL: ข้อมูลภายในของศูนย์คุณธรรม (Moral Center Internal)
            =============================================================== */}
            <div
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '20px',
                padding: '22px',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#f8fafc' }}>
                      ฝั่งที่ 1: ข้อมูลภายในของศูนย์คุณธรรม
                    </h3>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      สามารถเพิ่มได้มากกว่า 1 ชุดข้อมูล (เลือกหน้า หรือ ลากวางไฟล์ใหม่)
                    </div>
                  </div>
                </div>

                {/* Option Tabs: 1 (Upload) vs 2 (System Select) */}
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '2px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setInternalMode('system_select')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: internalMode === 'system_select' ? '#0284c7' : 'transparent',
                      color: internalMode === 'system_select' ? '#ffffff' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Option 2: Dataset ในระบบ
                  </button>
                  <button
                    type="button"
                    onClick={() => setInternalMode('upload')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: internalMode === 'upload' ? '#0284c7' : 'transparent',
                      color: internalMode === 'upload' ? '#ffffff' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Option 1: Drop ไฟล์ใหม่
                  </button>
                </div>
              </div>

              {/* Sub-Panel: Option 2 (Select Existing System Datasets) */}
              {internalMode === 'system_select' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      1) เลือกหน้าที่ต้องการนำ Dataset มาเป็นตัวตั้ง:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      {SYSTEM_PAGE_TABLE_PRESETS.map((p) => {
                        const isSelected = selectedSystemPageId === p.pageId;
                        return (
                          <button
                            key={p.pageId}
                            type="button"
                            onClick={() => {
                              setSelectedSystemPageId(p.pageId);
                              setSelectedSystemTableId(p.tables[0].id);
                            }}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '10px',
                              backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                              border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                              color: isSelected ? '#38bdf8' : '#cbd5e1',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>{p.icon}</span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.pageName.replace('หน้า', '')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Table Selector */}
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      2) เลือก Table ของหน้านี้ที่ใช้เป็นตัวตั้ง (Base Anchor Table):
                    </label>
                    {(() => {
                      const curPreset = SYSTEM_PAGE_TABLE_PRESETS.find((p) => p.pageId === selectedSystemPageId) || SYSTEM_PAGE_TABLE_PRESETS[0];
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {curPreset.tables.map((t) => {
                            const isTableSelected = selectedSystemTableId === t.id;
                            return (
                              <div
                                key={t.id}
                                onClick={() => setSelectedSystemTableId(t.id)}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  backgroundColor: isTableSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                  border: isTableSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: isTableSelected ? '#38bdf8' : '#f8fafc' }}>
                                    {t.name}
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                                    ตาราง: {t.id} • {t.rowCount} แถว • คอลัมน์หลัก: {t.columns.slice(0, 3).join(', ')}...
                                  </div>
                                </div>
                                {isTableSelected && <CheckCircle2 size={18} color="#38bdf8" />}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                /* Sub-Panel: Option 1 (Upload New File) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    onClick={() => fileInputInternalRef.current?.click()}
                    style={{
                      border: '2px dashed rgba(56, 189, 248, 0.4)',
                      borderRadius: '14px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      backgroundColor: 'rgba(56, 189, 248, 0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <UploadCloud size={36} color="#38bdf8" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                      ลากวางไฟล์ Excel (.xlsx, .xls) หรือ CSV ศูนย์คุณธรรมที่นี่
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      หรือคลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์ของคุณ (รองรับการแปลงเข้า DuckDB อัตโนมัติ)
                    </div>
                    <input
                      ref={fileInputInternalRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      multiple
                      onChange={handleInternalFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* List of uploaded internal files */}
                  {uploadedInternalFiles.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                        ไฟล์ภายในที่นำเข้าแล้ว ({uploadedInternalFiles.length} ไฟล์):
                      </div>
                      {uploadedInternalFiles.map((f, i) => (
                        <div
                          key={f.id || i}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '12.5px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileSpreadsheet size={16} color="#38bdf8" />
                            <span style={{ fontWeight: 700, color: '#f8fafc' }}>{f.name}</span>
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>({f.rowCount} แถว)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadedInternalFiles((prev) => prev.filter((_, idx) => idx !== i))}
                            style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Active Selection Summary Card */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <TableIcon size={18} color="#38bdf8" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ชุดข้อมูลภายในที่ถูกเลือกใช้งาน:</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeInternal.name}
                  </div>
                </div>
              </div>
            </div>

            {/* ===============================================================
                RIGHT PANEL: ข้อมูลภายนอกจากหน่วยงานอื่น (External Agency)
            =============================================================== */}
            <div
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '20px',
                padding: '22px',
                border: '1.5px solid rgba(244, 63, 94, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(244, 63, 94, 0.2)',
                      color: '#f43f5e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Database size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#f8fafc' }}>
                      ฝั่งที่ 2: ข้อมูลภายนอกจากหน่วยงานอื่น
                    </h3>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      ใส่ได้มากกว่า 1 ไฟล์ (สศช., ป.ป.ส., กสศ., สพฐ., DOPA ฯลฯ)
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputExternalRef.current?.click()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(244, 63, 94, 0.15)',
                    color: '#fda4af',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} />
                  <span>เพิ่มไฟล์ใหม่</span>
                </button>
                <input
                  ref={fileInputExternalRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  multiple
                  onChange={handleExternalFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Preset Agency Dataset Templates */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                  เลือกชุดข้อมูลภายนอกที่เป็น Preset มาตรฐาน (หรือคลิกเพิ่มไฟล์ด้านบน):
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {PRESET_EXTERNAL_DATASETS.map((ext) => {
                    const isSelected = activeExternal.id === ext.id;
                    return (
                      <div
                        key={ext.id}
                        onClick={() => {
                          setUploadedExternalFiles([ext]);
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          backgroundColor: isSelected ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1.5px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.06)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: isSelected ? '#fda4af' : '#f8fafc' }}>
                            {ext.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                            หน่วยงาน: {ext.sourceAgency} • {ext.rowCount} แถว
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={18} color="#f43f5e" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Uploaded External Files List */}
              {uploadedExternalFiles.filter((f) => f.id?.startsWith('custom_ext')).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                    ไฟล์ภายนอกที่อัปโหลดเอง:
                  </div>
                  {uploadedExternalFiles
                    .filter((f) => f.id?.startsWith('custom_ext'))
                    .map((f, i) => (
                      <div
                        key={f.id || i}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(244, 63, 94, 0.12)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12.5px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileSpreadsheet size={16} color="#f43f5e" />
                          <span style={{ fontWeight: 700, color: '#f8fafc' }}>{f.name}</span>
                          <span style={{ color: '#94a3b8', fontSize: '11px' }}>({f.rowCount} แถว)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedExternalFiles((prev) => prev.filter((item) => item.id !== f.id))}
                          style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Active External Selection Summary */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <TableIcon size={18} color="#f43f5e" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ชุดข้อมูลภายนอกที่ถูกเลือกใช้งาน:</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fda4af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeExternal.name}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================
              CENTER ACTION: ปุ่มตรวจสอบความเข้ากันของข้อมูล (5-Stage Evaluation)
          =================================================================== */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              padding: '18px',
              borderRadius: '18px',
              background: 'linear-gradient(90deg, rgba(2, 132, 199, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
          >
            <button
              type="button"
              disabled={isEvaluating}
              onClick={handleRunCompatibilityAssessment}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              {isEvaluating ? (
                <RefreshCw size={20} className="spin-animate" />
              ) : (
                <ShieldCheck size={20} />
              )}
              <span>ตรวจสอบความเข้ากันของข้อมูล (Compatibility & Harmonization Assessment)</span>
            </button>
            <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
              ประเมินตามกรอบมาตรฐาน 5 ขั้นตอน: นิยามตัวแปร • มิติพื้นที่และเวลา • การจับคู่คีย์ • ความสมเหตุสมผลเชิงสถิติ • ธรรมาภิบาลข้อมูล
            </div>
          </div>

          {/* ===================================================================
              ASSESSMENT RESULTS CARD (เมื่อกดตรวจสอบความเข้ากันของข้อมูล)
          =================================================================== */}
          {assessmentResult && (
            <div
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '20px',
                padding: '24px',
                border: '1.5px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                animation: 'fadeIn 0.25s ease-out'
              }}
            >
              {/* Header with Overall Score */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                  paddingBottom: '16px'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ผลการตรวจสอบความเข้ากันของชุดข้อมูล (Harmonization Readiness)
                  </div>
                  <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                    {assessmentResult.suggestedSynergyTheme}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>คะแนนความพร้อมรวม (Overall Score)</div>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: assessmentResult.statusColor }}>
                      {assessmentResult.overallScore}%
                    </div>
                  </div>

                  <span
                    style={{
                      backgroundColor: `${assessmentResult.statusColor}22`,
                      color: assessmentResult.statusColor,
                      border: `1.5px solid ${assessmentResult.statusColor}55`,
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 800
                    }}
                  >
                    {assessmentResult.statusBadge}
                  </span>
                </div>
              </div>

              {/* 5 Dimensions Breakdown Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '14px'
                }}
              >
                {Object.entries(assessmentResult.dimensions).map(([key, dim], idx) => {
                  const badgeColor = dim.status === 'excellent' ? '#10b981' : dim.status === 'good' ? '#38bdf8' : '#f59e0b';
                  return (
                    <div
                      key={key}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '14px',
                        padding: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                          ขั้นตอนที่ {idx + 1}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: badgeColor }}>
                          {dim.score}%
                        </span>
                      </div>

                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#f8fafc' }}>
                        {dim.thaiLabel}
                      </div>

                      <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: 1.45 }}>
                        {dim.summary}
                      </p>

                      <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                        <div
                          style={{
                            height: '5px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${dim.score}%`,
                              height: '100%',
                              backgroundColor: badgeColor,
                              borderRadius: '3px'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTION: ปุ่ม "ไอเดียในการ Synergy ข้อมูล" (ปรากฏเมื่อมีประสิทธิภาพเหมาะสมแล้ว) */}
              {assessmentResult.isReadyForSynergy && (
                <div
                  style={{
                    backgroundColor: 'rgba(2, 132, 199, 0.15)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    border: '1.5px solid rgba(56, 189, 248, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="#38bdf8" />
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8' }}>
                        ข้อมูลมีความเข้ากันได้เหมาะสมในการสนธิ (Synergy Ready)
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#cbd5e1' }}>
                      ระบบพร้อมสร้างกราฟสองแกน, วิเคราะห์ White Space vs Champion Hubs และเปิดกล่อง Prompt สั่งปรับผลลัพธ์
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStudioMode('synergy_studio')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 28px',
                      fontSize: '15.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>ไอเดียในการ Synergy ข้อมูล</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
