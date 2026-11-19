import React, { useState, useEffect } from 'react';
import {
  X,
  TableProperties,
  Edit3,
  Database,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import {
  type UniversalRubricDimension,
  type PilotHackathonCriteriaRecord,
  fetchHackathonCriteriaFromSqlite,
  saveHackathonCriteriaToSqlite,
  UNIVERSAL_DEFAULT_RUBRIC
} from '../data/pilotCriteriaService';
import { isAdminAuthenticated } from '../utils/adminAuthService';

interface CriteriaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  province?: string;
  isAdmin?: boolean;
  onOpenGenerator?: () => void;
}

export const CriteriaViewerModal: React.FC<CriteriaViewerModalProps> = ({
  isOpen,
  onClose,
  province = 'ส่วนกลาง',
  isAdmin,
  onOpenGenerator
}) => {
  const effectiveIsAdmin = isAdmin ?? isAdminAuthenticated();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<PilotHackathonCriteriaRecord | null>(null);
  const [rubricTable, setRubricTable] = useState<UniversalRubricDimension[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCriteriaData();
    }
  }, [isOpen, province]);

  const loadCriteriaData = async () => {
    setLoading(true);
    setSaveToast(null);
    try {
      const data = await fetchHackathonCriteriaFromSqlite(province);
      if (data && data.rubric && data.rubric.length > 0) {
        setRecord(data);
        setRubricTable(data.rubric);
      } else {
        // If empty, fallback to universal defaults
        setRubricTable(UNIVERSAL_DEFAULT_RUBRIC);
      }
    } catch (err) {
      console.warn('Error loading criteria in viewer:', err);
      setRubricTable(UNIVERSAL_DEFAULT_RUBRIC);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleUpdateCell = (
    index: number,
    field: keyof UniversalRubricDimension,
    value: string | number
  ) => {
    setRubricTable((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setSaveToast(null);
  };

  const handleSaveEdits = async () => {
    setIsSaving(true);
    try {
      const targetProvince = province || record?.province || 'ส่วนกลาง';
      const result = await saveHackathonCriteriaToSqlite({
        id: record?.id || `crit-${Date.now()}`,
        province: targetProvince,
        sourceFiles: record?.sourceFiles || [],
        aiAgentSkillText: record?.aiAgentSkillText || '',
        rubric: rubricTable
      });
      await loadCriteriaData();
      setSaveToast(`💾 บันทึกเกณฑ์การตัดสินลงฐานข้อมูล SQLite เรียบร้อย (${result.updatedAt.slice(11, 19)})`);
    } catch (err) {
      console.error('Error saving edits:', err);
      setSaveToast('⚠️ บันทึกใน Local Mirror เรียบร้อย');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToStandard = () => {
    if (window.confirm('คุณต้องการรีเซ็ตตารางกลับเป็นเกณฑ์มาตรฐานสากลล่าสุด (สรุปหัวข้อย่อย) ใช่หรือไม่?')) {
      setRubricTable(JSON.parse(JSON.stringify(UNIVERSAL_DEFAULT_RUBRIC)));
      setSaveToast('🔄 รีเซ็ตเป็นเกณฑ์มาตรฐานสากลฉบับล่าสุดแล้ว (กดปุ่ม "บันทึกลง SQLite" เพื่อบันทึกผล)');
    }
  };

  const renderFormattedLevel = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1 && !lines[0]?.startsWith('•')) {
      return <span>{text}</span>;
    }
    return (
      <div className="rubric-bullet-list">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          const bulletMatch = trimmed.match(/^[•\-*]\s*(.*?):(.*)$/);
          if (bulletMatch) {
            const topic = bulletMatch[1].trim();
            const desc = bulletMatch[2].trim();
            return (
              <div key={idx} className="rubric-bullet-item">
                <span className="rubric-bullet-dot">•</span>
                <span className="rubric-bullet-content">
                  <strong className="rubric-bullet-topic">{topic}:</strong> {desc}
                </span>
              </div>
            );
          }
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            return (
              <div key={idx} className="rubric-bullet-item">
                <span className="rubric-bullet-dot">•</span>
                <span className="rubric-bullet-content">{trimmed.replace(/^[•\-*]\s*/, '')}</span>
              </div>
            );
          }
          return (
            <div key={idx} className="rubric-bullet-item simple-line">
              <span>{trimmed}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const totalCalculatedScore = rubricTable.reduce((sum, d) => sum + (Number(d.maxScore) || 0), 0);

  return (
    <div className="criteria-modal-backdrop" onClick={onClose}>
      <div className="criteria-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="criteria-modal-header">
          <div className="criteria-header-left">
            <div className="criteria-icon-bubble viewer-theme">
              <TableProperties size={22} color="#7c3aed" />
            </div>
            <div>
              <h2 className="criteria-modal-title">เกณฑ์การตัดสินโครงการ</h2>
            </div>
          </div>
          <div className="criteria-header-actions">
            <button type="button" className="criteria-btn-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="criteria-modal-body">
          {loading ? (
            <div className="criteria-loading-box">
              <RefreshCw size={28} className="spin-icon" color="#059669" />
              <p>กำลังดึงเกณฑ์การตัดสินล่าสุดจาก SQLite Database...</p>
            </div>
          ) : (
            <div className="criteria-section-card">
              {/* Meta Info Bar */}
              <div className="criteria-viewer-metabar">
                <div className="metabar-left">
                  <span className="universal-tag">✨ เกณฑ์มาตรฐาน Universal (ไม่ชี้นำ)</span>
                  <div className="score-summary-pill">
                    <span>คะแนนรวม:</span>
                    <strong>{totalCalculatedScore} / 100 คะแนน</strong>
                  </div>
                  {record?.updatedAt && (
                    <span className="metabar-timestamp">
                      อัปเดตล่าสุด: {new Date(record.updatedAt).toLocaleString('th-TH')}
                    </span>
                  )}
                </div>

                <div className="metabar-right">
                  {effectiveIsAdmin && (
                    <button
                      type="button"
                      className={`btn-toggle-edit ${isEditMode ? 'active' : ''}`}
                      onClick={() => setIsEditMode(!isEditMode)}
                    >
                      <Edit3 size={14} />
                      <span>{isEditMode ? 'ปิดโหมดแก้ไข' : 'เปิดโหมดแก้ไขทุกช่อง'}</span>
                    </button>
                  )}
                  {effectiveIsAdmin && isEditMode && (
                    <>
                      <button
                        type="button"
                        className="btn-tool-secondary"
                        onClick={handleResetToStandard}
                        title="คืนค่าตารางเป็นเกณฑ์มาตรฐานสากลล่าสุด"
                      >
                        <RefreshCw size={14} />
                        <span>รีเซ็ตเป็นเกณฑ์มาตรฐาน</span>
                      </button>
                      <button
                        type="button"
                        className="btn-tool-primary"
                        disabled={isSaving}
                        onClick={handleSaveEdits}
                      >
                        <Database size={14} />
                        <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกลง SQLite'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {saveToast && (
                <div className="criteria-save-toast">
                  <CheckCircle2 size={16} />
                  <span>{saveToast}</span>
                </div>
              )}

              {/* Mobile Scroll Hint */}
              <div className="rubric-mobile-scroll-hint">
                <span>👈 เลื่อนตารางแนวนอนเพื่อดูเกณฑ์คะแนนทุกระดับ 👉</span>
              </div>

              {/* Rubric Table */}
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
                        {/* ด้านคุณธรรม & เสาหลัก */}
                        <td className="cell-dimension-title">
                          {effectiveIsAdmin && isEditMode ? (
                            <>
                              <input
                                type="text"
                                className="input-editable-title"
                                value={row.virtueTitle}
                                onChange={(e) => handleUpdateCell(index, 'virtueTitle', e.target.value)}
                              />
                              <textarea
                                className="input-editable-subpillar"
                                rows={2}
                                value={row.subPillarTitle}
                                onChange={(e) => handleUpdateCell(index, 'subPillarTitle', e.target.value)}
                              />
                            </>
                          ) : (
                            <>
                              <strong className="viewer-title-text">{row.virtueTitle}</strong>
                              <p className="viewer-subpillar-text">{row.subPillarTitle}</p>
                            </>
                          )}
                        </td>

                        {/* คะแนนเต็ม */}
                        <td style={{ textAlign: 'center' }}>
                          {effectiveIsAdmin && isEditMode ? (
                            <input
                              type="number"
                              className="input-editable-score"
                              value={row.maxScore}
                              onChange={(e) =>
                                handleUpdateCell(index, 'maxScore', Number(e.target.value) || 0)
                              }
                            />
                          ) : (
                            <span className="viewer-score-badge">{row.maxScore}</span>
                          )}
                        </td>

                        {/* ดีเลิศ */}
                        <td>
                          {effectiveIsAdmin && isEditMode ? (
                            <textarea
                              className="textarea-editable-level level-excellent"
                              rows={7}
                              value={row.level4}
                              onChange={(e) => handleUpdateCell(index, 'level4', e.target.value)}
                            />
                          ) : (
                            <div className="viewer-cell-text level-excellent-bg">
                              {renderFormattedLevel(row.level4)}
                            </div>
                          )}
                        </td>

                        {/* ดี */}
                        <td>
                          {effectiveIsAdmin && isEditMode ? (
                            <textarea
                              className="textarea-editable-level level-good"
                              rows={7}
                              value={row.level3}
                              onChange={(e) => handleUpdateCell(index, 'level3', e.target.value)}
                            />
                          ) : (
                            <div className="viewer-cell-text level-good-bg">
                              {renderFormattedLevel(row.level3)}
                            </div>
                          )}
                        </td>

                        {/* พอใช้ */}
                        <td>
                          {effectiveIsAdmin && isEditMode ? (
                            <textarea
                              className="textarea-editable-level level-fair"
                              rows={7}
                              value={row.level2}
                              onChange={(e) => handleUpdateCell(index, 'level2', e.target.value)}
                            />
                          ) : (
                            <div className="viewer-cell-text level-fair-bg">
                              {renderFormattedLevel(row.level2)}
                            </div>
                          )}
                        </td>

                        {/* ไม่ผ่าน */}
                        <td>
                          {effectiveIsAdmin && isEditMode ? (
                            <textarea
                              className="textarea-editable-level level-poor"
                              rows={7}
                              value={row.level1}
                              onChange={(e) => handleUpdateCell(index, 'level1', e.target.value)}
                            />
                          ) : (
                            <div className="viewer-cell-text level-poor-bg">
                              {renderFormattedLevel(row.level1)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="criteria-modal-footer" style={{ justifyContent: 'flex-end' }}>
          <div className="footer-right-buttons">
            <button type="button" className="btn-modal-dismiss" onClick={onClose}>
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
