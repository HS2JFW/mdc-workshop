import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Send,
  Edit3,
  Target,
  RefreshCw,
  FileText,
  Info,
  GitCompare,
  TrendingUp,
  TrendingDown,
  Compass,
  Calculator,
  Trophy,
  History,
  Clock,
  Lock,
  AlertTriangle,
  Star,
  Sprout,
  Scale,
  Heart,
  HeartHandshake
} from 'lucide-react';
import {
  type PreSubmissionEvaluationResult,
  type StandoutVirtueDetail,
  type MoralVirtuesHighlightAnalysis
} from '../data/pilotHackathonService';
import {
  isAdminAuthenticated,
  getCurrentUserProfile,
  onAdminAuthChange,
  onUserProfileChange
} from '../utils/adminAuthService';

interface PreSubmissionEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationResult: PreSubmissionEvaluationResult | null;
  isLoading: boolean;
  onConfirmSubmit: () => void;
  isAdmin?: boolean;
  onResetHistory?: () => void;
  onOpenApiKeySettings?: () => void;
}

export const PreSubmissionEvaluationModal: React.FC<PreSubmissionEvaluationModalProps> = ({
  isOpen,
  onClose,
  evaluationResult,
  isLoading,
  onConfirmSubmit,
  isAdmin: propIsAdmin,
  onResetHistory,
  onOpenApiKeySettings
}) => {
  const [showPromptDetails, setShowPromptDetails] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // ตรวจสอบสิทธิ์ Admin อย่างเคร่งครัด: มีเพียง Account แอดมิน (Admin) เท่านั้นที่มองเห็น
  // ถ้าเป็น Account ทั่วไป (เช่น ผู้ใช้ทั่วไป, A1 นโยบาย, A2 ปฏิบัติงาน, A3 ประชาชน) จะไม่แสดงเด็ดขาด
  const [isActuallyAdmin, setIsActuallyAdmin] = useState<boolean>(() => {
    const profile = getCurrentUserProfile();
    const isAuth = isAdminAuthenticated();
    return Boolean(
      (propIsAdmin !== undefined ? propIsAdmin : (profile.isAdmin && isAuth)) &&
      profile.isAdmin &&
      profile.role === 'admin' &&
      isAuth
    );
  });

  useEffect(() => {
    const checkAdmin = () => {
      const profile = getCurrentUserProfile();
      const isAuth = isAdminAuthenticated();
      const effective = Boolean(
        (propIsAdmin !== undefined ? propIsAdmin : (profile.isAdmin && isAuth)) &&
        profile.isAdmin &&
        profile.role === 'admin' &&
        isAuth
      );
      setIsActuallyAdmin(effective);
    };

    checkAdmin();
    const unsubAuth = onAdminAuthChange(checkAdmin);
    const unsubProfile = onUserProfileChange(checkAdmin);
    return () => {
      unsubAuth();
      unsubProfile();
    };
  }, [propIsAdmin]);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    if (!evaluationResult?.markdownPromptSent) return;
    navigator.clipboard.writeText(evaluationResult.markdownPromptSent);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const getTierColorClass = (tier: string) => {
    switch (tier) {
      case 'ดีเลิศ':
        return 'tier-excellent';
      case 'ดี':
        return 'tier-good';
      case 'พอใช้':
        return 'tier-fair';
      default:
        return 'tier-poor';
    }
  };

  return (
    <div className="criteria-modal-backdrop" onClick={onClose}>
      <div
        className="criteria-modal-container precheck-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="criteria-modal-header precheck-header">
          <div className="criteria-header-left">
            <div className="criteria-icon-bubble precheck-theme">
              <Sparkles size={26} color="#7c3aed" />
            </div>
            <div>
              <h2 className="criteria-modal-title">
                ผลการประเมินและแนวทางพัฒนาข้อเสนอโครงการ
              </h2>
            </div>
          </div>
          <button type="button" className="criteria-btn-close" onClick={onClose} title="ปิดหน้าต่าง">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="criteria-modal-body precheck-body">
          {isLoading ? (
            <div className="criteria-loading-box" style={{ minHeight: '340px' }}>
              <RefreshCw size={36} className="spin-icon" color="#7c3aed" />
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                คณะกรรมการ AI กำลังอ่านข้อเสนอโครงการและให้คะแนนตามเกณฑ์ 4 เสาหลัก...
              </p>
              <p style={{ fontSize: '14.5px', color: '#64748b' }}>
                เชื่อมต่อ OpenRouter LLM เพื่อวิเคราะห์ความสอดคล้องกับโจทย์, นวัตกรรมกลไกสะกิดพฤติกรรม และประเมินความสมจริงเป็นไปได้จริง
              </p>
              <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#6d28d9', fontSize: '13px' }}>
                <Sparkles size={14} />
                <span>เกณฑ์ตัดสิน: ความสอดคล้อง (30) • กลไกสะกิดพฤติกรรม (25) • ความเป็นไปได้จริง (25) • ผลลัพธ์และตัวชี้วัด (20)</span>
              </div>
            </div>
          ) : !evaluationResult ? (
            <div className="criteria-loading-box" style={{ minHeight: '260px' }}>
              <p>ไม่พบข้อมูลผลการประเมิน กรุณาลองใหม่อีกครั้ง</p>
            </div>
          ) : (
            <div className="precheck-content-flow">
              {/* Engine Status Banner: แสดงให้เห็นชัดเจนว่าประเมินสดผ่าน OpenRouter AI หรือ Local Engine */}
              {evaluationResult.evaluationSource === 'openrouter_ai' ? (
                <div style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1.5px solid #93c5fd',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={22} color="#2563eb" />
                    <div>
                      <strong style={{ fontSize: '15px', color: '#1e3a8a' }}>
                        ⚡ ส่งให้ OpenRouter AI ตรวจสอบโดยตรงสำเร็จ (Live AI Inference)
                      </strong>
                      <div style={{ fontSize: '13px', color: '#2563eb', marginTop: '2px' }}>
                        โมเดล: <strong>{evaluationResult.modelName || 'LLM'}</strong> | เวลาตอบกลับจาก OpenRouter: <strong>{((evaluationResult.openRouterLatencyMs || 0) / 1000).toFixed(2)} วินาที</strong>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', background: '#ffffff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '20px', border: '1px solid #bfdbfe', fontWeight: 700 }}>
                    คะแนนสดจาก AI
                  </span>
                </div>
              ) : (
                <div style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px' }}>⚙️</span>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#78350f' }}>
                        ประเมินผลด้วย Local Scoring Engine (ไม่ได้ส่งไป OpenRouter)
                      </strong>
                      <div style={{ fontSize: '13px', color: '#b45309', marginTop: '2px' }}>
                        สาเหตุ: <strong>{evaluationResult.openRouterErrorReason || 'ไม่พบ OpenRouter API Key ในหน้า Settings'}</strong> • คำนวณตามรูบิค 4 เสาหลักในเครื่องจึงตอบกลับทันที
                      </div>
                    </div>
                  </div>
                  {onOpenApiKeySettings && (
                    <button
                      type="button"
                      onClick={onOpenApiKeySettings}
                      style={{
                        padding: '6px 14px',
                        background: '#ffffff',
                        border: '1.5px solid #f59e0b',
                        color: '#b45309',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="คลิกเพื่อไปที่เมนูตั้งค่าและระบุ OpenRouter API Key"
                    >
                      ⚙️ ไปตั้งค่า OpenRouter Key (เพื่อส่งตรวจกับ AI สด)
                    </button>
                  )}
                </div>
              )}

              {/* Score Hero Card */}
              <div className={`precheck-score-hero ${getTierColorClass(evaluationResult.qualityTier)}`}>
                <div className="hero-score-left">
                  <div className="hero-score-badge-wrap">
                    <span className="hero-score-number">
                      {evaluationResult.finalScore.toFixed(2)}
                    </span>
                    <span className="hero-score-max">/ 100.00</span>
                  </div>
                  <div className="hero-tier-tag">
                    <Award size={18} />
                    <span>ระดับ{evaluationResult.qualityTier === 'ไม่ผ่าน' ? 'กำลังพัฒนา (มีโอกาสต่อยอด)' : evaluationResult.qualityTier}</span>
                  </div>
                  {evaluationResult.feasibilityAssessment && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: evaluationResult.feasibilityAssessment.isFeasible ? '#059669' : '#dc2626',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        marginTop: '4px'
                      }}
                    >
                      {evaluationResult.feasibilityAssessment.isFeasible ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>✓ โครงการสมเหตุสมผล ทำได้จริง</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={13} />
                          <span>ถูกตัดคะแนนความไม่สมจริง -{evaluationResult.feasibilityAssessment.penaltyScore.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="hero-score-right">
                  <div className="hero-meta-row">
                    <span className="hero-meta-label">โจทย์หลักการแข่งขัน:</span>
                    <strong className="hero-meta-value">
                      {evaluationResult.challengeTopic || 'ร่วมคิดค้นนวัตกรรมโครงการเพื่อปรับเปลี่ยนพฤติกรรมในชุมชน'}
                    </strong>
                  </div>
                  <div className="hero-meta-row">
                    <span className="hero-meta-label">เกณฑ์การประเมินที่ใช้วัดผล:</span>
                    <span className="hero-criteria-pill">
                      {evaluationResult.selectedVirtueNames.join(', ')} ({evaluationResult.evaluatedDimensions.length} ด้าน)
                    </span>
                  </div>
                  {/* Standout Moral Index Virtues Badges in Hero Card */}
                  {evaluationResult.standoutVirtueAnalysis && evaluationResult.standoutVirtueAnalysis.topStandoutVirtues.length > 0 && (
                    <div className="hero-meta-row hero-standout-virtues-summary-row" style={{ marginTop: '4px' }}>
                      <span className="hero-meta-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#854d0e', fontWeight: 700 }}>
                        <Sparkles size={14} color="#d97706" />
                        จุดเด่นในดัชนีคุณธรรม 5 ด้าน (โดดเด่นเป็นพิเศษ):
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '2px' }}>
                        {evaluationResult.standoutVirtueAnalysis.topStandoutVirtues.map(v => (
                          <span
                            key={v.key}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 12px',
                              borderRadius: '20px',
                              fontSize: '12.5px',
                              fontWeight: 800,
                              color: '#ffffff',
                              backgroundColor: v.color,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                            }}
                          >
                            <span>{v.badgeEmoji}</span>
                            <span>ด้าน{v.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ✨ Standout Moral Virtues Showcase Panel (แสดงด้านบนสุดของผลการวิเคราะห์ ควบคู่ไปกับคะแนน - แสดงเฉพาะหัวข้อมิติที่เป็นจุดเด่น ไม่แสดงคะแนน) */}
              {evaluationResult.standoutVirtueAnalysis && (
                <div
                  className="precheck-standout-virtues-panel"
                  style={{
                    padding: '18px 20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 60%, #fdf4ff 100%)',
                    border: '2px solid #ddd6fe',
                    boxShadow: '0 4px 18px rgba(124, 58, 237, 0.08)',
                    marginBottom: '16px'
                  }}
                >
                  {/* Panel Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          boxShadow: '0 3px 10px rgba(124, 58, 237, 0.3)'
                        }}
                      >
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '16.5px', color: '#1e1b4b', fontFamily: "'Kanit', sans-serif" }}>
                            จุดเด่นของโครงการในดัชนีคุณธรรม 5 ด้าน (โดดเด่นเป็นพิเศษ)
                          </strong>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 9px',
                              borderRadius: '12px',
                              background: '#f3e8ff',
                              border: '1px solid #d8b4fe',
                              color: '#7e22ce',
                              fontSize: '11.5px',
                              fontWeight: 700
                            }}
                          >
                            <Star size={11} fill="#7e22ce" color="#7e22ce" />
                            AI Behavioral Analysis
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                          วิเคราะห์ความโดดเด่นเชิงพฤติกรรมตามเกณฑ์มาตรฐานคุณธรรม 5 ประการ ของศูนย์คุณธรรม (องค์การมหาชน)
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#5b21b6',
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid #ddd6fe'
                      }}
                    >
                      <span>✨ มิติคุณธรรมที่เป็นจุดเด่นของโครงการ</span>
                    </div>
                  </div>

                  {/* Overall Summary Quote */}
                  {evaluationResult.standoutVirtueAnalysis.overallVirtueStrengthSummary && (
                    <div
                      style={{
                        padding: '11px 15px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderLeft: '4px solid #7c3aed',
                        borderTop: '1px solid #ede9fe',
                        borderRight: '1px solid #ede9fe',
                        borderBottom: '1px solid #ede9fe',
                        marginBottom: '14px',
                        fontSize: '13.5px',
                        color: '#1e293b',
                        lineHeight: 1.55,
                        fontFamily: "'Kanit', sans-serif"
                      }}
                    >
                      💡 <strong>บทวิเคราะห์จุดเด่นภาพรวม:</strong> {evaluationResult.standoutVirtueAnalysis.overallVirtueStrengthSummary.replace(/\s*\(\d+%\)/g, '')}
                    </div>
                  )}

                  {/* Standout Virtue Cards Grid (แสดงเฉพาะหัวข้อที่เป็นจุดเด่นของโครงการ ไม่แสดงคะแนน) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: evaluationResult.standoutVirtueAnalysis.topStandoutVirtues.length > 1 ? 'repeat(auto-fit, minmax(290px, 1fr))' : '1fr',
                      gap: '12px'
                    }}
                  >
                    {evaluationResult.standoutVirtueAnalysis.topStandoutVirtues.map((virtue) => (
                      <div
                        key={virtue.key}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '12px',
                          backgroundColor: virtue.bgLight,
                          border: `1.5px solid ${virtue.borderColor}`,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '22px' }}>{virtue.badgeEmoji}</span>
                            <div>
                              <strong style={{ fontSize: '15px', color: virtue.color, fontFamily: "'Kanit', sans-serif" }}>
                                {virtue.title}
                              </strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {virtue.subtitle}
                              </div>
                            </div>
                          </div>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              color: '#ffffff',
                              backgroundColor: virtue.color
                            }}
                          >
                            <Star size={11} fill="#ffffff" color="#ffffff" />
                            <span>{virtue.level}</span>
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: '#1f2937', lineHeight: 1.5, marginTop: '2px' }}>
                          <strong>เหตุผลความโดดเด่น:</strong> {virtue.highlightReason}
                        </div>

                        {virtue.evidenceSnippets && virtue.evidenceSnippets.length > 0 && (
                          <div style={{ marginTop: '2px' }}>
                            <div style={{ fontSize: '11.5px', color: '#475569', fontWeight: 600, marginBottom: '4px' }}>
                              🔎 หลักฐานเชิงพฤติกรรมที่พบในข้อเสนอโครงการ:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {virtue.evidenceSnippets.map((ev, eIdx) => (
                                <div
                                  key={eIdx}
                                  style={{
                                    fontSize: '12px',
                                    color: '#334155',
                                    background: 'rgba(255, 255, 255, 0.85)',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    borderLeft: `3px solid ${virtue.color}`,
                                    fontStyle: 'italic'
                                  }}
                                >
                                  "{ev}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5-Revision History Progression Timeline (เก็บบันทึกและเปรียบเทียบย้อนหลัง 5 ครั้งล่าสุด) */}
              {evaluationResult.historySnapshots && evaluationResult.historySnapshots.length > 1 && (
                <div
                  className="precheck-history-timeline-box"
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    marginBottom: '16px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <History size={17} color="#7c3aed" />
                      <strong style={{ fontSize: '14.5px', color: '#1e293b', fontFamily: "'Kanit', sans-serif" }}>
                        ประวัติการตรวจประเมินโครงการ ({evaluationResult.historySnapshots.length} ครั้งล่าสุด)
                      </strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        เปรียบเทียบพัฒนาการแบบต่อเนื่อง (5 ครั้งล่าสุด)
                      </span>
                      {onResetHistory && (
                        <button
                          type="button"
                          onClick={onResetHistory}
                          title="ล้างประวัติการตรวจทั้งหมดเพื่อเริ่มนับรอบที่ 1 ใหม่"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: '#b91c1c',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fee2e2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fef2f2';
                          }}
                        >
                          <RefreshCw size={12} />
                          <span>รีเซ็ตเริ่มรอบใหม่</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {evaluationResult.historySnapshots.map((snap, sIdx) => {
                      const isCurrent = snap.iteration === evaluationResult.iteration;
                      const prevSnapScore = sIdx > 0 ? evaluationResult.historySnapshots![sIdx - 1].finalScore : undefined;
                      const snapDelta = prevSnapScore !== undefined ? Number((snap.finalScore - prevSnapScore).toFixed(2)) : (snap.diffAnalysis?.totalDelta ?? 0);
                      return (
                        <div
                          key={snap.iteration || sIdx}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: isCurrent ? 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' : '#f8fafc',
                            border: isCurrent ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                            boxShadow: isCurrent ? '0 3px 10px rgba(124, 58, 237, 0.15)' : 'none',
                            minWidth: '115px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: isCurrent ? '#6d28d9' : '#64748b' }}>
                            <span style={{ fontWeight: 700 }}>ครั้งที่ {snap.iteration}</span>
                            {snap.iteration > 1 && (
                              <span
                                style={{
                                  fontWeight: 800,
                                  fontSize: '11px',
                                  color: snapDelta > 0 ? '#16a34a' : snapDelta < 0 ? '#dc2626' : '#64748b'
                                }}
                              >
                                {snapDelta > 0 ? `+${snapDelta.toFixed(2)}` : snapDelta < 0 ? `${snapDelta.toFixed(2)}` : '0.00'}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '19px', fontWeight: 900, color: isCurrent ? '#5b21b6' : '#1e293b', fontFamily: "'Kanit', sans-serif", lineHeight: 1.1 }}>
                            {snap.finalScore.toFixed(2)}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                            {snap.timestamp ? new Date(snap.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Revision Progression Banner (เปรียบเทียบกับรอบก่อนหน้าจาก Temp File) */}
              {evaluationResult.iteration && evaluationResult.iteration > 1 && evaluationResult.previousScore !== undefined ? (() => {
                const deltaForDisplay = evaluationResult.scoreDelta !== undefined
                  ? evaluationResult.scoreDelta
                  : (evaluationResult.baseSnapshotScore !== undefined
                      ? Number((evaluationResult.finalScore - evaluationResult.baseSnapshotScore).toFixed(2))
                      : Number((evaluationResult.finalScore - evaluationResult.previousScore).toFixed(2)));
                return (
                <div
                  className="precheck-progression-banner"
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: deltaForDisplay > 0
                      ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                      : deltaForDisplay < 0
                      ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: `1.5px solid ${deltaForDisplay > 0 ? '#10b981' : deltaForDisplay < 0 ? '#f87171' : '#cbd5e1'}`,
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GitCompare size={18} color={deltaForDisplay > 0 ? '#059669' : deltaForDisplay < 0 ? '#dc2626' : '#475569'} />
                      <strong style={{ fontSize: '15px', color: '#0f172a', fontFamily: "'Kanit', sans-serif" }}>
                        🔄 ตรวจสอบรอบที่ {evaluationResult.iteration}
                        {evaluationResult.baseSnapshotIteration !== undefined && (
                          <span style={{ color: '#6d28d9', fontWeight: 600, fontSize: '13px', marginLeft: '6px' }}>
                            (ใช้วัดคะแนนเทียบกับโครงการครั้งที่ {evaluationResult.baseSnapshotIteration} ที่โครงสร้างเหมือนที่สุด {evaluationResult.baseSnapshotSimilarity ? `${Math.round(evaluationResult.baseSnapshotSimilarity * 100)}%` : ''} เป็นตัวตั้งต้น)
                          </span>
                        )}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {evaluationResult.baseSnapshotScore !== undefined ? (
                        <>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>
                            โครงการตัวตั้งต้น (ครั้งที่ {evaluationResult.baseSnapshotIteration}): <strong>{evaluationResult.baseSnapshotScore.toFixed(2)}</strong> คะแนน
                          </span>
                          <span style={{ fontSize: '14px', color: '#94a3b8' }}>➔</span>
                        </>
                      ) : evaluationResult.previousScore !== undefined ? (
                        <>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>
                            รอบก่อนหน้า: <strong>{evaluationResult.previousScore.toFixed(2)}</strong> คะแนน
                          </span>
                          <span style={{ fontSize: '14px', color: '#94a3b8' }}>➔</span>
                        </>
                      ) : null}
                      <span style={{ fontSize: '13px', color: '#0f172a' }}>
                        รอบนี้: <strong>{evaluationResult.finalScore.toFixed(2)}</strong> คะแนน
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 700,
                          backgroundColor: deltaForDisplay > 0 ? '#059669' : deltaForDisplay < 0 ? '#dc2626' : '#64748b',
                          color: '#ffffff'
                        }}
                      >
                        {deltaForDisplay > 0 ? (
                          <>
                            <TrendingUp size={14} />
                            +{deltaForDisplay.toFixed(2)} คะแนน (ดีขึ้น 🎉)
                          </>
                        ) : deltaForDisplay < 0 ? (
                          <>
                            <TrendingDown size={14} />
                            {deltaForDisplay.toFixed(2)} คะแนน (ปรับลด ⚠️)
                          </>
                        ) : (
                          'เท่าเดิม 0.00 คะแนน ⚖️'
                        )}
                      </span>
                    </div>
                  </div>
                  {evaluationResult.progressionSummary && (
                    <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, fontFamily: "'Kanit', sans-serif" }}>
                      {evaluationResult.progressionSummary}
                    </div>
                  )}
                </div>
                );
              })() : (
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#475569'
                  }}
                >
                  <Sparkles size={16} color="#7c3aed" />
                  <span>🌱 <strong>ผลการตรวจรอบเริ่มต้น (Baseline Evaluation - รอบที่ 1):</strong> บันทึกข้อมูลและคะแนนลง Temp File เรียบร้อยแล้ว หากท่านปรับแก้โครงการและกดตรวจอีกครั้ง ระบบจะนำมาเปรียบเทียบพัฒนาการให้เห็นทันที</span>
                </div>
              )}

              {/* Comparative Diff Breakdown Visualizer (การ์ดแจกแจงความแตกต่างเชิงลึก: จุดที่เพิ่มขึ้น vs จุดที่ลดทอน) */}
              {evaluationResult.diffAnalysis && !evaluationResult.diffAnalysis.isIdentical && (
                <div className="precheck-diff-breakdown-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {/* Positive Enhancements */}
                  {evaluationResult.diffAnalysis.positiveDiffs.length > 0 && (
                    <div
                      style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        background: '#f0fdf4',
                        border: '1.5px solid #86efac',
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '14px', marginBottom: '10px' }}>
                        <TrendingUp size={16} />
                        <span>🟢 จุดที่ได้รับการปรับปรุงและพัฒนาขึ้นในรอบนี้ ({evaluationResult.diffAnalysis.positiveDiffs.length} จุด):</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {evaluationResult.diffAnalysis.positiveDiffs.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              background: '#ffffff',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #bbf7d0',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#dcfce7', color: '#15803d' }}>
                                  {item.fieldNameThai}
                                </span>
                                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                                  ➔ เข้าเกณฑ์: <strong style={{ color: '#0f172a' }}>{item.targetPillarTitle}</strong>
                                </span>
                              </div>
                              <div style={{ fontSize: '13px', color: '#1e293b', marginTop: '2px' }}>
                                {item.impactDescription}
                              </div>
                            </div>
                            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#16a34a', whiteSpace: 'nowrap' }}>
                              +{item.scoreDelta.toFixed(2)} คะแนน
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Negative Regressions */}
                  {evaluationResult.diffAnalysis.negativeDiffs.length > 0 && (
                    <div
                      style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        background: '#fef2f2',
                        border: '1.5px solid #fca5a5',
                        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 800, fontSize: '14px', marginBottom: '10px' }}>
                        <TrendingDown size={16} />
                        <span>🔴 จุดที่ตัดทอนหรือมีรายละเอียดลดลงในรอบนี้ ({evaluationResult.diffAnalysis.negativeDiffs.length} จุด):</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {evaluationResult.diffAnalysis.negativeDiffs.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              background: '#ffffff',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #fecaca',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#fee2e2', color: '#b91c1c' }}>
                                  {item.fieldNameThai}
                                </span>
                                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                                  ➔ กระทบเกณฑ์: <strong style={{ color: '#0f172a' }}>{item.targetPillarTitle}</strong>
                                </span>
                              </div>
                              <div style={{ fontSize: '13px', color: '#1e293b', marginTop: '2px' }}>
                                {item.impactDescription}
                              </div>
                            </div>
                            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#dc2626', whiteSpace: 'nowrap' }}>
                              {item.scoreDelta.toFixed(2)} คะแนน
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 4: Feasibility & Realism Assessment Card (การตรวจสอบความเป็นไปได้และความสมจริงของโครงการ) */}
              {evaluationResult.feasibilityAssessment && (
                <div
                  className={`precheck-feasibility-card ${evaluationResult.feasibilityAssessment.isFeasible ? 'feasible' : 'infeasible'}`}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: evaluationResult.feasibilityAssessment.isFeasible
                      ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                      : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                    border: `1.5px solid ${evaluationResult.feasibilityAssessment.isFeasible ? '#86efac' : '#fca5a5'}`,
                    marginBottom: '18px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {evaluationResult.feasibilityAssessment.isFeasible ? (
                        <CheckCircle2 size={20} color="#15803d" />
                      ) : (
                        <AlertTriangle size={20} color="#dc2626" />
                      )}
                      <strong style={{
                        fontSize: '15px',
                        color: evaluationResult.feasibilityAssessment.isFeasible ? '#166534' : '#991b1b',
                        fontFamily: "'Kanit', sans-serif"
                      }}>
                        {evaluationResult.feasibilityAssessment.isFeasible
                          ? '✓ ผ่านเกณฑ์การพิจารณาความเป็นไปได้จริง (Project Feasibility & Realism Verified)'
                          : '⚠️ ผลการตรวจสอบความเป็นไปได้และความสมจริงของโครงการ (Project Feasibility Check)'}
                      </strong>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        backgroundColor: evaluationResult.feasibilityAssessment.isFeasible ? '#16a34a' : '#dc2626',
                        color: '#ffffff'
                      }}
                    >
                      {evaluationResult.feasibilityAssessment.isFeasible
                        ? 'ไม่มีการตัดคะแนน'
                        : `ตัดคะแนนอย่างน้อย -${evaluationResult.feasibilityAssessment.penaltyScore.toFixed(2)} คะแนน`}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: evaluationResult.feasibilityAssessment.isFeasible ? '#14532d' : '#7f1d1d',
                    margin: '0 0 12px 0',
                    lineHeight: 1.5,
                    fontFamily: "'Kanit', sans-serif"
                  }}>
                    {evaluationResult.feasibilityAssessment.feasibilitySummary}
                  </p>

                  {/* Issues list if any */}
                  {!evaluationResult.feasibilityAssessment.isFeasible && evaluationResult.feasibilityAssessment.issues.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {evaluationResult.feasibilityAssessment.issues.map((issue, iIdx) => (
                        <div
                          key={iIdx}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #fecaca',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c'
                              }}
                            >
                              {issue.type === 'unrealistic_target' && '🎯 เป้าหมายสูงเกินจริง'}
                              {issue.type === 'unrealistic_timeline' && '⏳ กรอบเวลาไม่เหมาะสม'}
                              {issue.type === 'unrealistic_audience_scale' && '👥 สเกลกลุ่มเป้าหมายเกินจริง'}
                              {issue.type === 'insignificant_impact' && '🔍 กลุ่มเป้าหมายน้อยเกินไป'}
                            </span>
                            <strong style={{ fontSize: '13.5px', color: '#991b1b', fontFamily: "'Kanit', sans-serif" }}>
                              {issue.title}
                            </strong>
                          </div>

                          {issue.detectedText && (
                            <div style={{ fontSize: '12px', color: '#b91c1c', marginBottom: '6px', backgroundColor: '#fff5f5', padding: '4px 8px', borderRadius: '6px' }}>
                              ข้อความที่ตรวจพบ: <code style={{ fontWeight: 700, color: '#991b1b', background: '#fee2e2', padding: '1px 5px', borderRadius: '4px' }}>"{issue.detectedText}"</code>
                            </div>
                          )}

                          <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, marginBottom: '8px' }}>
                            {issue.description}
                          </div>

                          <div
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              fontSize: '12px',
                              color: '#065f46',
                              lineHeight: 1.5
                            }}
                          >
                            💡 <strong>คำแนะนำในการแก้ไขเพื่อขอรับคะแนน 20 แต้มคืน:</strong> {issue.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Inspection & Deduction Penalty Breakdown Card (ซ่อนไว้ตามความต้องการของผู้ใช้) */}

              {/* Duplicate Submitter Warning (if already submitted) */}
              {evaluationResult.isDuplicateSubmitter && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '2px solid #ef4444',
                    backgroundColor: '#fef2f2',
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    marginBottom: '16px'
                  }}
                >
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>⛔</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>
                      ท่านเคยส่งโครงการแล้วในระบบ (จำกัดสิทธิ์ 1 ท่าน ส่งได้เพียง 1 โครงการเท่านั้น)
                    </div>
                    <div style={{ fontSize: '12.5px', marginTop: '4px', lineHeight: 1.5 }}>
                      ระบบตรวจพบว่าชื่อและนามสกุลนี้ ได้ส่งโครงการ "{evaluationResult.existingProjectName || 'โครงการของคุณ'}" เรียบร้อยแล้ว ตามกติกาการแข่งขัน แต่ละคนส่งได้แค่หนึ่งโครงการถ้าส่งแล้วส่งอีกไม่ได้
                    </div>
                  </div>
                </div>
              )}

              {/* AI Reflective Coaching Guidance Card (เครื่องมือช่วยสะท้อนและไกด์แนวทางการพัฒนาสำหรับ Workshop) */}
              {evaluationResult.comparativeContext?.comparativeRationale && (
                <div
                  className="precheck-reflective-coach-card"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                    border: '1.5px solid #c4b5fd',
                    marginBottom: '18px',
                    boxShadow: '0 2px 10px rgba(124, 58, 237, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Sparkles size={18} color="#7c3aed" />
                    <strong style={{ fontSize: '15px', color: '#5b21b6', fontFamily: "'Kanit', sans-serif" }}>
                      มุมมองสะท้อนและคำแนะนำเพื่อการพัฒนา (Reflective Coaching Guide):
                    </strong>
                  </div>
                  <p style={{
                    fontSize: '13.5px',
                    color: '#334155',
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: 'pre-line',
                    fontFamily: "'Kanit', sans-serif"
                  }}>
                    {evaluationResult.comparativeContext.comparativeRationale}
                  </p>
                </div>
              )}

              {/* Dimension Breakdown Cards */}
              <div className="precheck-dimensions-container">
                <h3 className="precheck-section-title">
                  <Target size={18} color="#059669" />
                  <span>
                    ผลการประเมิน 4 เสาหลักและข้อเสนอแนะในการปรับปรุง ({evaluationResult.evaluatedDimensions.length} ด้าน):
                  </span>
                </h3>

                <div className="precheck-dimension-grid">
                  {evaluationResult.evaluatedDimensions.map((dim, idx) => (
                    <div key={idx} className="precheck-dimension-card">
                      <div className="dim-card-header">
                        <div className="dim-title-group">
                          <strong className="dim-virtue-title">{dim.virtueTitle}</strong>
                          <span className="dim-subpillar-title">{dim.subPillarTitle}</span>
                        </div>
                        <div className="dim-card-score-box">
                          <span className="dim-score-num">{(dim.score ?? dim.scoreOutOf20).toFixed(2)}</span>
                          <span className="dim-score-sub">/ {(dim.maxScore ?? 20).toFixed(2)}</span>
                          <span className="dim-score-percent">({dim.normalizedScore.toFixed(2)}%)</span>
                        </div>
                      </div>

                      <div className="dim-card-meta-bar">
                        <span className="dim-level-pill">{dim.levelName}</span>
                        {dim.matchedRubricBullets.map((bullet, bIdx) => (
                          <span key={bIdx} className="dim-bullet-pill">
                            📌 {bullet}
                          </span>
                        ))}
                      </div>

                      {/* Rationale Text (ข้อเสนอแนะเพื่อปรับปรุงให้โครงการมีประสิทธิภาพสูงสุด) */}
                      <div className="dim-rationale-box">
                        <div className="dim-rationale-header">
                          <span>💡 ข้อเสนอแนะเพื่อปรับปรุงให้โครงการมีประสิทธิภาพสูงสุด:</span>
                        </div>
                        <div className="dim-rationale-text">{dim.rationale}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collapsible Inspection: Prompt & Markdown Sent to AI (แสดงเฉพาะ Admin เท่านั้น, ซ่อนสำหรับ Account ทั่วไป) */}
              {isActuallyAdmin && (
                <div className="precheck-inspection-card">
                  <button
                    type="button"
                    className="btn-toggle-inspection"
                    onClick={() => setShowPromptDetails(!showPromptDetails)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <FileText size={16} color="#7c3aed" />
                      <strong>ดูข้อความ Prompt & ข้อมูล Markdown ที่ส่งให้ AI วิเคราะห์สะท้อนผล</strong>
                      <span
                        className="admin-only-badge"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        <Lock size={11} /> เฉพาะแอดมิน (Admin Only)
                      </span>
                    </div>
                    {showPromptDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {/* Text Label แสดงด้านล่างปุ่ม */}
                  <div className="inspection-text-label-row">
                    <span className="inspection-text-label-tag">Text Label:</span>
                    <span className="inspection-text-label-text">
                      {evaluationResult.evaluationSource === 'openrouter_ai'
                        ? `ประเมินผลผ่าน OpenRouter API (Endpoint: https://openrouter.ai/api/v1/chat/completions, โมเดล: ${evaluationResult.modelName || 'LLM'}, ความเร็วตอบกลับ: ${evaluationResult.openRouterLatencyMs || 0}ms) โดยมี System Prompt, ข้อเสนอโครงการ, เกณฑ์ 4 เสาหลัก (100 คะแนน) และเกณฑ์ความสมจริงตามหลักพฤติกรรมศาสตร์ (สงวนสิทธิ์เฉพาะ Admin)`
                        : `ข้อความคำสั่ง Prompt คำสั่งหลัก (System Prompt), ข้อมูลโครงการ, ข้อมูลโครงการเปรียบเทียบสัมพัทธ์ (โครงการคะแนนสูงสุด/ต่ำสุด) และตารางเกณฑ์ Rubric สากลเฉพาะเกณฑ์ดัชนีที่เลือก (${evaluationResult.selectedVirtueNames.join(', ')}) ที่ส่งไปยังระบบ AI (สงวนสิทธิ์เฉพาะผู้ดูแลระบบ Admin เท่านั้น - บัญชีทั่วไปจะไม่แสดง)`}
                    </span>
                  </div>

                  {showPromptDetails && (
                    <div className="inspection-content-body">
                      <div className="inspection-actions-bar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Info size={14} color="#6d28d9" />
                          <span style={{ fontSize: '13.5px', color: '#475569', fontWeight: 600 }}>
                            รายละเอียดข้อความทั้งหมดที่ระบบ AI ใช้ในการประเมินและสะท้อนมุมมอง (System Prompt & Markdown Context):
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-copy-prompt"
                          onClick={handleCopyMarkdown}
                        >
                          <Copy size={13} />
                          <span>{copyFeedback ? 'คัดลอกแล้ว!' : 'คัดลอก Markdown'}</span>
                        </button>
                      </div>
                      <pre className="inspection-pre-box">
                        {evaluationResult.markdownPromptSent}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="criteria-modal-footer precheck-footer">
          <button
            type="button"
            className="btn-precheck-secondary"
            onClick={onClose}
          >
            <Edit3 size={16} />
            <span>กลับไปแก้ไขข้อมูลโครงการ</span>
          </button>

          <button
            type="button"
            className="btn-precheck-primary btn-precheck-submit-action"
            onClick={onConfirmSubmit}
            disabled={Boolean(evaluationResult?.isDuplicateSubmitter)}
            style={
              evaluationResult?.isDuplicateSubmitter
                ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#94a3b8', borderColor: '#94a3b8' }
                : {}
            }
            title={
              evaluationResult?.isDuplicateSubmitter
                ? 'ท่านเคยส่งโครงการแล้ว ไม่สามารถส่งซ้ำได้ (1 คนต่อ 1 โครงการ)'
                : 'ยืนยันการส่งโครงการ'
            }
          >
            <Send size={18} />
            <span>
              {evaluationResult?.isDuplicateSubmitter
                ? 'ส่งโครงการแล้ว (ไม่สามารถส่งซ้ำได้)'
                : 'ส่งโครงการ'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
