import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Copy,
  Database,
  Edit3,
  TableProperties,
  AlertCircle,
  FileCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  type UploadedSourceFile,
  type UniversalRubricDimension,
  type PilotHackathonCriteriaRecord,
  DEFAULT_PROMPT_SKILL,
  DEFAULT_PROMPT_RUBRIC,
  synthesizeAiAgentSkillText,
  synthesizeUniversalRubricFromSkill,
  saveHackathonCriteriaToSqlite,
  resetToUniversalDefaultRubric
} from '../data/pilotCriteriaService';

interface CriteriaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  province?: string;
  onSavedSuccess?: (record: PilotHackathonCriteriaRecord) => void;
}

export const CriteriaGeneratorModal: React.FC<CriteriaGeneratorModalProps> = ({
  isOpen,
  onClose,
  province = 'ส่วนกลาง',
  onSavedSuccess
}) => {
  // --- States ---
  const [sourceFiles, setSourceFiles] = useState<UploadedSourceFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Skill Generation
  const [isGeneratingSkill, setIsGeneratingSkill] = useState(false);
  const [skillText, setSkillText] = useState<string>('');
  const [hasSkillGenerated, setHasSkillGenerated] = useState(false);

  // Prompt 1 (Skill Prompt) State
  const [promptSkillText, setPromptSkillText] = useState<string>(DEFAULT_PROMPT_SKILL);
  const [isEditingPromptSkill, setIsEditingPromptSkill] = useState<boolean>(false);

  // Rubric Generation
  const [isGeneratingRubric, setIsGeneratingRubric] = useState(false);
  const [rubricTable, setRubricTable] = useState<UniversalRubricDimension[]>([]);
  const [hasRubricGenerated, setHasRubricGenerated] = useState(false);

  // Prompt 2 (Rubric Prompt) State
  const [promptRubricText, setPromptRubricText] = useState<string>(DEFAULT_PROMPT_RUBRIC);
  const [isEditingPromptRubric, setIsEditingPromptRubric] = useState<boolean>(false);

  // Persistence State
  const [isSavingSqlite, setIsSavingSqlite] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  if (!isOpen) return null;

  // --- Handlers: File Upload ---
  const handleFilesAdded = (files: FileList | File[]) => {
    const newFiles: UploadedSourceFile[] = [];
    Array.from(files).forEach((file) => {
      // Basic text preview reader for txt/md/csv/json
      if (
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.json')
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setSourceFiles((prev) =>
            prev.map((f) => (f.name === file.name ? { ...f, contentPreview: content.slice(0, 500) } : f))
          );
        };
        reader.readAsText(file);
      }

      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'document',
        uploadedAt: new Date().toLocaleTimeString('th-TH')
      });
    });

    setSourceFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSourceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLoadSampleFiles = () => {
    setSourceFiles([
      {
        name: 'คู่มือการพัฒนาแหล่งเรียนรู้เชิงคุณธรรม_MDC.pdf',
        size: 524288,
        type: 'pdf',
        uploadedAt: new Date().toLocaleTimeString('th-TH')
      },
      {
        name: 'รายงานการประเมินสมัชชาคุณธรรมแห่งชาติ_ผลลัพธ์พฤติกรรม.md',
        size: 742100,
        type: 'md',
        contentPreview: 'บทวิเคราะห์การปรับเปลี่ยนพฤติกรรมตามกรอบ CIPP และ Kirkpatrick ระดับ 3',
        uploadedAt: new Date().toLocaleTimeString('th-TH')
      },
      {
        name: 'ถอดบทเรียน_22_องค์กรสุขภาวะคุณธรรม_และธรรมนูญชุมชน.docx',
        size: 389120,
        type: 'docx',
        uploadedAt: new Date().toLocaleTimeString('th-TH')
      }
    ]);
  };

  // --- Handlers: Prompt 1 -> Generate Skill ---
  const handleTriggerGenerateSkill = () => {
    setIsGeneratingSkill(true);
    setSaveSuccessMsg(null);
    setTimeout(() => {
      const generated = synthesizeAiAgentSkillText(sourceFiles, promptSkillText);
      setSkillText(generated);
      setHasSkillGenerated(true);
      setIsGeneratingSkill(false);
    }, 1200);
  };

  // --- Handlers: Prompt 2 -> Generate Rubric ---
  const handleTriggerGenerateRubric = () => {
    setIsGeneratingRubric(true);
    setSaveSuccessMsg(null);
    setTimeout(() => {
      const generatedRubric = synthesizeUniversalRubricFromSkill(skillText, promptRubricText);
      setRubricTable(generatedRubric);
      setHasRubricGenerated(true);
      setIsGeneratingRubric(false);

      // Auto-save initial generated rubric to SQLite
      handleSaveToSqlite(generatedRubric, skillText);
    }, 1400);
  };

  // --- Handlers: Edit Rubric Cells ---
  const handleUpdateRubricCell = (
    index: number,
    field: keyof UniversalRubricDimension,
    value: string | number
  ) => {
    setRubricTable((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setSaveSuccessMsg(null); // Clear success msg to indicate unsaved changes
  };

  // --- Handlers: SQLite Save ---
  const handleSaveToSqlite = async (
    tableToSave: UniversalRubricDimension[] = rubricTable,
    skillToSave: string = skillText
  ) => {
    setIsSavingSqlite(true);
    try {
      const result = await saveHackathonCriteriaToSqlite({
        province,
        sourceFiles,
        aiAgentSkillText: skillToSave,
        rubric: tableToSave,
        promptSkill: promptSkillText,
        promptRubric: promptRubricText
      });

      setSaveSuccessMsg(`💾 บันทึกเกณฑ์การตัดสินและ Rubric ลงฐานข้อมูล SQLite (${result.dbPath}) สำเร็จ`);
      if (onSavedSuccess) {
        onSavedSuccess({
          id: result.id,
          province,
          createdAt: new Date().toISOString(),
          updatedAt: result.updatedAt,
          sourceFiles,
          aiAgentSkillText: skillToSave,
          rubric: tableToSave,
          promptSkill: promptSkillText,
          promptRubric: promptRubricText
        });
      }
    } catch (err) {
      console.error('Error saving criteria to SQLite:', err);
      setSaveSuccessMsg('⚠️ บันทึกในเครื่องเสร็จสิ้น (Local Storage Mirror)');
    } finally {
      setIsSavingSqlite(false);
    }
  };

  const handleResetToDefaultRubric = () => {
    const defaults = resetToUniversalDefaultRubric();
    setRubricTable(defaults);
    setSaveSuccessMsg('🔄 รีเซ็ตตารางเป็นเกณฑ์มาตรฐานสากลเรียบร้อย (อย่าลืมกดบันทึกการแก้ไข)');
  };

  const handleCopyMarkdown = () => {
    let md = `# ตารางเกณฑ์การตัดสินโครงการ Hackathon (สเกล 1-100 คะแนน)\n\n`;
    md += `| ด้านคุณธรรม (คะแนนเต็ม) | ดีเลิศ (16-20) | ดี (13-15) | พอใช้ (10-12) | ไม่ผ่าน (1-9) |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    const formatMd = (text: string) => (text || '').replace(/\n/g, '<br>');
    rubricTable.forEach((row) => {
      md += `| **${row.virtueTitle}** (${row.maxScore} คะแนน)<br>*${row.subPillarTitle}* | ${formatMd(row.level4)} | ${formatMd(row.level3)} | ${formatMd(row.level2)} | ${formatMd(row.level1)} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleResetAllAndStartOver = () => {
    if (window.confirm('คุณต้องการรีเซ็ตและเริ่มขั้นตอนการสร้างเกณฑ์การตัดสินใหม่หรือไม่?')) {
      setSourceFiles([]);
      setSkillText('');
      setHasSkillGenerated(false);
      setRubricTable([]);
      setHasRubricGenerated(false);
      setSaveSuccessMsg(null);
      setPromptSkillText(DEFAULT_PROMPT_SKILL);
      setIsEditingPromptSkill(false);
      setPromptRubricText(DEFAULT_PROMPT_RUBRIC);
      setIsEditingPromptRubric(false);
    }
  };

  const totalCalculatedScore = rubricTable.reduce((sum, d) => sum + (Number(d.maxScore) || 0), 0);

  return (
    <div className="criteria-modal-backdrop" onClick={onClose}>
      <div className="criteria-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="criteria-modal-header">
          <div className="criteria-header-left">
            <div className="criteria-icon-bubble">
              <Sparkles size={22} color="#059669" />
            </div>
            <div>
              <h2 className="criteria-modal-title">สร้างเกณฑ์การตัดสินโครงการ Hackathon ด้วย AI Agent Skill</h2>
              <p className="criteria-modal-subtitle">
                ผสานเอกสารต้นทาง $\rightarrow$ สร้าง AI Agent Skill $\rightarrow$ สังเคราะห์ Universal Rubric (1-100 คะแนน) $\rightarrow$ บันทึกลง SQLite
              </p>
            </div>
          </div>
          <div className="criteria-header-actions">
            {(hasSkillGenerated || sourceFiles.length > 0) && (
              <button
                type="button"
                className="btn-criteria-reset"
                onClick={handleResetAllAndStartOver}
                title="เริ่มขั้นตอนใหม่ตั้งแต่ต้น"
              >
                <RefreshCw size={15} />
                <span>เริ่มสร้างใหม่</span>
              </button>
            )}
            <button type="button" className="criteria-btn-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="criteria-modal-body">
          {/* ============================================================== */}
          {/* STEP 1: DRAG & DROP SOURCE DOCUMENTS                          */}
          {/* ============================================================== */}
          <div className="criteria-section-card">
            <div className="criteria-step-badge">
              <span className="step-num">ขั้นตอนที่ 1</span>
              <span>แนบเอกสารต้นทาง (หลายไฟล์พร้อมกัน)</span>
            </div>

            <div
              className={`criteria-dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt,.md,.csv,.xlsx,.json"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
              />
              <UploadCloud size={40} className="dropzone-icon" />
              <p className="dropzone-text-primary">
                <strong>ลากไฟล์มาวางที่นี่</strong> หรือคลิกเพื่อเลือกไฟล์จากอุปกรณ์
              </p>
              <p className="dropzone-text-secondary">
                รองรับไฟล์เอกสาร: .PDF, .DOCX, .TXT, .MD, .CSV, .XLSX (แนบได้หลายไฟล์)
              </p>
            </div>

            {/* Quick Actions */}
            <div className="dropzone-quick-row">
              <span style={{ fontSize: '14px', color: '#64748b' }}>ตัวเลือกด่วน:</span>
              <button
                type="button"
                className="btn-sample-docs"
                onClick={handleLoadSampleFiles}
              >
                <FileCheck size={14} />
                <span>โหลดเอกสารต้นแบบศูนย์คุณธรรม (3 ไฟล์)</span>
              </button>
            </div>

            {/* Uploaded Files List */}
            {sourceFiles.length > 0 && (
              <div className="criteria-files-list">
                <div className="criteria-files-header">
                  <span>เอกสารต้นทางที่ใส่ลงในระบบ ({sourceFiles.length} ไฟล์):</span>
                  <button
                    type="button"
                    className="btn-clear-files"
                    onClick={() => setSourceFiles([])}
                  >
                    ลบทั้งหมด
                  </button>
                </div>
                <div className="criteria-files-grid">
                  {sourceFiles.map((file, idx) => (
                    <div key={idx} className="criteria-file-chip">
                      <FileText size={18} className="file-chip-icon" />
                      <div className="file-chip-info">
                        <span className="file-chip-name" title={file.name}>
                          {file.name}
                        </span>
                        <span className="file-chip-size">
                          {(file.size / 1024).toFixed(1)} KB • {file.uploadedAt}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="file-chip-remove"
                        onClick={() => handleRemoveFile(idx)}
                        title="ลบไฟล์นี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt 1 Information Box & Button */}
            <div className="criteria-prompt-preview-box">
              <div className="prompt-preview-header">
                <div className="prompt-preview-title">
                  <Sparkles size={16} color="#059669" />
                  <span>Prompt คำสั่งสร้าง AI Agent Skill:</span>
                </div>
                <div className="prompt-header-actions">
                  <button
                    type="button"
                    className={`btn-prompt-edit ${isEditingPromptSkill ? 'active' : ''}`}
                    onClick={() => setIsEditingPromptSkill(!isEditingPromptSkill)}
                    title={isEditingPromptSkill ? 'เสร็จสิ้นการแก้ไข Prompt' : 'คลิกเพื่อแก้ไขข้อความ Prompt'}
                  >
                    {isEditingPromptSkill ? (
                      <>
                        <Check size={14} />
                        <span>เสร็จสิ้นการแก้ไข</span>
                      </>
                    ) : (
                      <>
                        <Edit3 size={14} />
                        <span>แก้ไข Prompt</span>
                      </>
                    )}
                  </button>
                  {promptSkillText !== DEFAULT_PROMPT_SKILL && (
                    <button
                      type="button"
                      className="btn-prompt-reset"
                      onClick={() => setPromptSkillText(DEFAULT_PROMPT_SKILL)}
                      title="คืนค่าเป็น Prompt เริ่มต้น"
                    >
                      <RotateCcw size={13} />
                      <span>รีเซ็ต</span>
                    </button>
                  )}
                </div>
              </div>

              {isEditingPromptSkill ? (
                <div className="prompt-edit-area">
                  <textarea
                    className="prompt-textarea-input"
                    rows={4}
                    value={promptSkillText}
                    onChange={(e) => setPromptSkillText(e.target.value)}
                    placeholder="พิมพ์ปรับแต่งคำสั่ง Prompt สำหรับสร้าง AI Agent Skill..."
                  />
                  <span className="prompt-edit-hint">
                    💡 ท่านสามารถพิมพ์ปรับแต่งข้อความคำสั่ง Prompt เพื่อกำหนดทิศทางการสร้าง AI Agent Skill ได้ตามต้องการ
                  </span>
                </div>
              ) : (
                <p className="prompt-preview-text">"{promptSkillText}"</p>
              )}

              <button
                type="button"
                className="btn-execute-prompt-1"
                disabled={isGeneratingSkill}
                onClick={handleTriggerGenerateSkill}
              >
                {isGeneratingSkill ? (
                  <>
                    <RefreshCw size={18} className="spin-icon" />
                    <span>กำลังศึกษาข้อมูลและสังเคราะห์ AI Agent Skill...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>สร้าง AI Agent Skill</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STEP 2: EDITABLE AI AGENT SKILL TEXTBOX                        */}
          {/* ============================================================== */}
          {hasSkillGenerated && (
            <div className="criteria-section-card slide-down">
              <div className="criteria-step-badge">
                <span className="step-num">ขั้นตอนที่ 2</span>
                <span>AI Agent Skill ที่สร้างขึ้น (ตรวจสอบและแก้ไขได้อิสระ)</span>
                <span className="editable-tag">
                  <Edit3 size={13} /> แก้ไขได้ทุกข้อความ
                </span>
              </div>

              <div className="criteria-skill-editor-wrap">
                <textarea
                  className="criteria-skill-textarea"
                  rows={14}
                  value={skillText}
                  onChange={(e) => setSkillText(e.target.value)}
                  placeholder="เนื้อหา AI Agent Skill..."
                />
              </div>

              {/* Prompt 2 Information Box & Button Under Textbox */}
              <div className="criteria-prompt-preview-box rubric-prompt-theme">
                <div className="prompt-preview-header">
                  <div className="prompt-preview-title">
                    <TableProperties size={16} color="#7c3aed" />
                    <span>Prompt คำสั่งสร้างเกณฑ์การตัดสิน (Rubric Table 1-100 คะแนน):</span>
                  </div>
                  <div className="prompt-header-actions">
                    <button
                      type="button"
                      className={`btn-prompt-edit purple-theme ${isEditingPromptRubric ? 'active' : ''}`}
                      onClick={() => setIsEditingPromptRubric(!isEditingPromptRubric)}
                      title={isEditingPromptRubric ? 'เสร็จสิ้นการแก้ไข Prompt' : 'คลิกเพื่อแก้ไขข้อความ Prompt'}
                    >
                      {isEditingPromptRubric ? (
                        <>
                          <Check size={14} />
                          <span>เสร็จสิ้นการแก้ไข</span>
                        </>
                      ) : (
                        <>
                          <Edit3 size={14} />
                          <span>แก้ไข Prompt</span>
                        </>
                      )}
                    </button>
                    {promptRubricText !== DEFAULT_PROMPT_RUBRIC && (
                      <button
                        type="button"
                        className="btn-prompt-reset"
                        onClick={() => setPromptRubricText(DEFAULT_PROMPT_RUBRIC)}
                        title="คืนค่าเป็น Prompt เริ่มต้น"
                      >
                        <RotateCcw size={13} />
                        <span>รีเซ็ต</span>
                      </button>
                    )}
                  </div>
                </div>

                {isEditingPromptRubric ? (
                  <div className="prompt-edit-area">
                    <textarea
                      className="prompt-textarea-input purple-focus"
                      rows={4}
                      value={promptRubricText}
                      onChange={(e) => setPromptRubricText(e.target.value)}
                      placeholder="พิมพ์ปรับแต่งคำสั่ง Prompt สำหรับสร้างตาราง Rubric..."
                    />
                    <span className="prompt-edit-hint" style={{ color: '#7c3aed' }}>
                      💡 ท่านสามารถพิมพ์ปรับแต่งข้อความคำสั่ง Prompt เพื่อกำหนดเงื่อนไขการสร้างตาราง Rubric ได้
                    </span>
                  </div>
                ) : (
                  <p className="prompt-preview-text">"{promptRubricText}"</p>
                )}

                <button
                  type="button"
                  className="btn-execute-prompt-2"
                  disabled={isGeneratingRubric}
                  onClick={handleTriggerGenerateRubric}
                >
                  {isGeneratingRubric ? (
                    <>
                      <RefreshCw size={18} className="spin-icon" />
                      <span>กำลังวิเคราะห์ Skill และสร้างตาราง Rubric สากล...</span>
                    </>
                  ) : (
                    <>
                      <TableProperties size={18} />
                      <span>สร้างเกณฑ์การตัดสิน (สร้างตาราง Rubric 5 ด้าน)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: FULLY EDITABLE UNIVERSAL RUBRIC TABLE                  */}
          {/* ============================================================== */}
          {hasRubricGenerated && rubricTable.length > 0 && (
            <div className="criteria-section-card slide-down">
              <div className="criteria-step-badge">
                <span className="step-num">ขั้นตอนที่ 3</span>
                <span>ตารางเกณฑ์การตัดสิน (Universal Rubric 1 - 100 คะแนน)</span>
                <span className="universal-tag">✨ สากล • ไม่ชี้นำ • วัดพฤติกรรมจริง</span>
                <span className="editable-tag">
                  <Edit3 size={13} /> แก้ไขได้ทุกฟิลด์
                </span>
              </div>

              <div className="rubric-table-toolbar">
                <div className="score-summary-pill">
                  <span>คะแนนรวมทั้งสิ้น:</span>
                  <strong>{totalCalculatedScore} / 100 คะแนน</strong>
                  {totalCalculatedScore === 100 ? (
                    <span className="badge-ok">ครบถ้วน</span>
                  ) : (
                    <span className="badge-warn">คะแนนไม่เท่ากับ 100</span>
                  )}
                </div>

                <div className="rubric-toolbar-buttons">
                  <button
                    type="button"
                    className="btn-tool-secondary"
                    onClick={handleResetToDefaultRubric}
                    title="คืนค่าเป็นเกณฑ์มาตรฐานศูนย์คุณธรรม"
                  >
                    <RefreshCw size={14} />
                    <span>รีเซ็ตเป็นเกณฑ์มาตรฐาน</span>
                  </button>
                  <button
                    type="button"
                    className="btn-tool-secondary"
                    onClick={handleCopyMarkdown}
                  >
                    <Copy size={14} />
                    <span>{copyFeedback ? 'คัดลอกแล้ว!' : 'คัดลอก Markdown'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-tool-primary"
                    disabled={isSavingSqlite}
                    onClick={() => handleSaveToSqlite()}
                  >
                    <Database size={15} />
                    <span>{isSavingSqlite ? 'กำลังบันทึกลง SQLite...' : 'บันทึกการแก้ไขลง SQLite'}</span>
                  </button>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="criteria-save-toast">
                  <CheckCircle2 size={16} />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Responsive Editable Table */}
              <div className="rubric-table-responsive-wrap">
                <table className="universal-rubric-table">
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>เสาหลักการประเมิน</th>
                      <th style={{ width: '8%', textAlign: 'center' }}>คะแนนเต็ม</th>
                      <th style={{ width: '18%', backgroundColor: '#ecfdf5', color: '#065f46' }}>
                        ดีเลิศ (85-100%)
                      </th>
                      <th style={{ width: '18%', backgroundColor: '#eff6ff', color: '#1e40af' }}>
                        ดี (70-84%)
                      </th>
                      <th style={{ width: '17%', backgroundColor: '#fefce8', color: '#854d0e' }}>
                        พอใช้ (50-69%)
                      </th>
                      <th style={{ width: '17%', backgroundColor: '#fef2f2', color: '#991b1b' }}>
                        กำลังพัฒนา (0-49%)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rubricTable.map((row, index) => (
                      <tr key={row.id}>
                        {/* ด้านคุณธรรม และ เสาหลัก */}
                        <td className="cell-dimension-title">
                          <input
                            type="text"
                            className="input-editable-title"
                            value={row.virtueTitle}
                            onChange={(e) => handleUpdateRubricCell(index, 'virtueTitle', e.target.value)}
                            placeholder="ชื่อด้านคุณธรรม..."
                          />
                          <textarea
                            className="input-editable-subpillar"
                            rows={2}
                            value={row.subPillarTitle}
                            onChange={(e) => handleUpdateRubricCell(index, 'subPillarTitle', e.target.value)}
                            placeholder="เสาหลักการประเมิน..."
                          />
                        </td>

                        {/* คะแนนเต็ม */}
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            className="input-editable-score"
                            value={row.maxScore}
                            onChange={(e) =>
                              handleUpdateRubricCell(index, 'maxScore', Number(e.target.value) || 0)
                            }
                          />
                        </td>

                        {/* ระดับดีเลิศ */}
                        <td>
                          <textarea
                            className="textarea-editable-level level-excellent"
                            rows={7}
                            value={row.level4}
                            onChange={(e) => handleUpdateRubricCell(index, 'level4', e.target.value)}
                          />
                        </td>

                        {/* ระดับดี */}
                        <td>
                          <textarea
                            className="textarea-editable-level level-good"
                            rows={7}
                            value={row.level3}
                            onChange={(e) => handleUpdateRubricCell(index, 'level3', e.target.value)}
                          />
                        </td>

                        {/* ระดับพอใช้ */}
                        <td>
                          <textarea
                            className="textarea-editable-level level-fair"
                            rows={7}
                            value={row.level2}
                            onChange={(e) => handleUpdateRubricCell(index, 'level2', e.target.value)}
                          />
                        </td>

                        {/* ระดับไม่ผ่าน */}
                        <td>
                          <textarea
                            className="textarea-editable-level level-poor"
                            rows={7}
                            value={row.level1}
                            onChange={(e) => handleUpdateRubricCell(index, 'level1', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rubric-table-bottom-notice">
                <AlertCircle size={15} color="#059669" />
                <span>
                  เกณฑ์นี้เป็นเกณฑ์สากล (Universal) สามารถใช้ตัดสินโครงการได้ทุกรูปแบบ โดยตัดสินจากศักยภาพในการก่อให้เกิดการปรับเปลี่ยนพฤติกรรมจริงในชุมชน
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="criteria-modal-footer">
          <div className="footer-left-status">
            <Database size={15} color="#0284c7" />
            <span>เชื่อมต่อฐานข้อมูล SQLite: data/pilot_activities_4regions.sqlite</span>
          </div>
          <div className="footer-right-buttons">
            {hasRubricGenerated && (
              <button
                type="button"
                className="btn-modal-save"
                disabled={isSavingSqlite}
                onClick={() => handleSaveToSqlite()}
              >
                <CheckCircle2 size={16} />
                <span>{isSavingSqlite ? 'กำลังบันทึก...' : 'บันทึกและปิดหน้าต่าง'}</span>
              </button>
            )}
            <button type="button" className="btn-modal-dismiss" onClick={onClose}>
              {hasRubricGenerated ? 'เสร็จสิ้น' : 'ปิด'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
