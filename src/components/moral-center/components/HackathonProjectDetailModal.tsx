import React from 'react';
import {
  X,
  Award,
  Sparkles,
  Target,
  Users,
  MapPin,
  Building,
  Layers,
  CheckCircle2,
  Lightbulb,
  Tag,
  Eye,
  User,
  Briefcase,
  Building2,
  Trash2,
  Clock
} from 'lucide-react';
import {
  type HackathonProject,
  getProposerLevelLabel,
  formatBangkokSubmissionTime
} from '../data/pilotHackathonService';

interface HackathonProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: HackathonProject | null;
  isAdmin?: boolean;
  onDelete?: (project: HackathonProject) => void;
}

export const HackathonProjectDetailModal: React.FC<HackathonProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  isAdmin = false,
  onDelete
}) => {
  if (!isOpen || !project) return null;

  const scoreVal = Number(project.aiScore || 0);
  let tierLabel = 'ดี';
  let tierClass = 'tier-good';
  if (scoreVal >= 85.0) {
    tierLabel = 'ดีเลิศ';
    tierClass = 'tier-excellent';
  } else if (scoreVal >= 70.0) {
    tierLabel = 'ดี';
    tierClass = 'tier-good';
  } else if (scoreVal >= 50.0) {
    tierLabel = 'พอใช้';
    tierClass = 'tier-fair';
  } else {
    tierLabel = 'ไม่ผ่าน';
    tierClass = 'tier-poor';
  }

  const proposerLevelLabel =
    project.proposerLevel === 'policy'
      ? '🏛️ นโยบาย'
      : project.proposerLevel === 'practitioner'
      ? '⚙️ ปฏิบัติการ'
      : '👥 ประชาชน';

  return (
    <div className="criteria-modal-backdrop" onClick={onClose}>
      <div
        className="criteria-modal-container project-detail-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="criteria-modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <div className="criteria-header-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}
            >
              <Award size={24} />
            </div>
            <div>
              <h2 className="criteria-modal-title" style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                รายละเอียดโครงการ
              </h2>
              <p className="criteria-modal-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                ข้อมูลข้อเสนอโครงการ ผลการประเมิน และข้อเสนอแนะจากระบบ AI ผู้เชี่ยวชาญ
              </p>
            </div>
          </div>
          <button
            type="button"
            className="criteria-btn-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="criteria-modal-body" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Top Hero: Project Name & Score */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              padding: '18px 20px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid #bfdbfe'
                  }}
                >
                  คุณธรรม: {project.targetMoralVirtue}
                </span>
                <span
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid #fde68a'
                  }}
                >
                  {project.groupName || project.groupKey}
                </span>
                {project.evaluatedCriteriaVirtues && project.evaluatedCriteriaVirtues.length > 0 && (
                  <span
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: '1px solid #a7f3d0'
                    }}
                  >
                    เกณฑ์ประเมินเพื่อการพัฒนา: {project.evaluatedCriteriaVirtues.join(', ')}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0', fontFamily: 'Kanit, sans-serif' }}>
                {project.projectName}
              </h3>
              <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '6px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <User size={14} color="#2563eb" />
                  <span>ผู้เสนอ: <strong style={{ color: '#0f172a' }}>{project.proposerName || 'ผู้ร่วมกิจกรรม Hackathon'}</strong></span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Briefcase size={14} color="#64748b" />
                  <span>ตำแหน่ง: <strong style={{ color: '#1e293b' }}>{project.proposerPosition || getProposerLevelLabel(project.proposerLevel)}</strong></span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Building2 size={14} color="#64748b" />
                  <span>หน่วยงาน / สังกัด: <strong style={{ color: '#1e293b' }}>{project.proposerAgency}</strong></span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0369a1', fontWeight: 600 }}>
                  <Clock size={14} color="#0284c7" />
                  <span>เวลาที่ส่ง: <strong style={{ color: '#0c4a6e' }}>{formatBangkokSubmissionTime(project.createdAt).fullBangkok}</strong></span>
                </span>
              </div>
            </div>

            {/* Score Pill */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 22px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1.5px solid #3b82f6',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                minWidth: '130px'
              }}
            >
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>คะแนนประเมิน AI</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', margin: '4px 0' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, color: '#1d4ed8', fontFamily: 'Kanit, sans-serif' }}>
                  {scoreVal.toFixed(2)}
                </span>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>/ 100</span>
              </div>
              <span className={`quality-tier-pill ${tierClass}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                ระดับ{tierLabel}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Challenge & Target */}
            {project.challengeTopic && (
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12.5px', color: '#047857', fontWeight: 700, marginBottom: '4px' }}>
                  🎯 โจทย์การแข่งขัน Hackathon
                </div>
                <div style={{ fontSize: '14px', color: '#1e293b' }}>
                  {project.challengeTopic}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>📍 พื้นที่เป้าหมาย:</span>
                <div style={{ fontSize: '14px', color: '#1e293b', marginTop: '2px' }}>{project.targetArea}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>👥 กลุ่มเป้าหมาย:</span>
                <div style={{ fontSize: '14px', color: '#1e293b', marginTop: '2px' }}>{project.targetAudience}</div>
              </div>
            </div>

            {/* Proposal Details */}
            <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 750, color: '#0f172a', margin: '0 0 6px 0', fontFamily: 'Kanit, sans-serif' }}>
                💡 แนวคิดโครงการ
              </h4>
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                {project.proposalDetails}
              </p>
            </div>

            {/* 3-Level Participation */}
            <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 750, color: '#0f172a', margin: '0 0 6px 0', fontFamily: 'Kanit, sans-serif' }}>
                ⚙️ กลไกการมีส่วนร่วม 3 ระดับ
              </h4>
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                {project.activityPlan}
              </p>
            </div>

            {/* Behavioral KPIs */}
            <div style={{ background: '#ecfdf5', padding: '14px 18px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 750, color: '#065f46', margin: '0 0 6px 0', fontFamily: 'Kanit, sans-serif' }}>
                🎯 ผลลัพธ์ที่คาดหวัง
              </h4>
              <p style={{ fontSize: '13.5px', color: '#064e3b', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                {project.behavioralKpi}
              </p>
            </div>

            {/* AI Recommendations */}
            {project.aiRecommendations && (
              <div style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: '10px', border: '1px solid #86efac' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 750, color: '#166534', margin: '0 0 6px 0', fontFamily: 'Kanit, sans-serif' }}>
                  ✨ มุมมองสะท้อนและแนวทางการต่อยอดโครงการจากระบบ AI
                </h4>
                <p style={{ fontSize: '13.5px', color: '#14532d', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {project.aiRecommendations}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="criteria-modal-footer" style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          {isAdmin && onDelete ? (
            <button
              type="button"
              className="btn-modal-delete-project"
              style={{
                background: '#fee2e2',
                border: '1.5px solid #fca5a5',
                color: '#dc2626',
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'Kanit, sans-serif',
                transition: 'all 0.15s ease'
              }}
              onClick={() => onDelete(project)}
              title="ลบโครงการนี้ออกจากฐานข้อมูลและหน้าโหวต (เฉพาะ Admin)"
            >
              <Trash2 size={16} />
              <span>ลบโครงการนี้ (Admin)</span>
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            className="btn-modal-dismiss"
            onClick={onClose}
            style={{ padding: '8px 22px', fontSize: '14px' }}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
