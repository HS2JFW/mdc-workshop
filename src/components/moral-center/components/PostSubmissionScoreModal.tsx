import React from 'react';
import {
  X,
  Trophy,
  Award,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Building,
  Target,
  User,
  Briefcase,
  Building2
} from 'lucide-react';
import { type HackathonProject, getProposerLevelLabel } from '../data/pilotHackathonService';

interface PostSubmissionScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: HackathonProject | null;
  onGoToSummary: () => void;
}

export const PostSubmissionScoreModal: React.FC<PostSubmissionScoreModalProps> = ({
  isOpen,
  onClose,
  project,
  onGoToSummary
}) => {
  if (!isOpen || !project) return null;

  const score = Number(project.aiScore || 0);
  let qualityTier = 'ดี';
  let tierColorClass = 'tier-good';

  if (score >= 85.0) {
    qualityTier = 'ดีเลิศ';
    tierColorClass = 'tier-excellent';
  } else if (score >= 70.0) {
    qualityTier = 'ดี';
    tierColorClass = 'tier-good';
  } else if (score >= 50.0) {
    qualityTier = 'พอใช้';
    tierColorClass = 'tier-fair';
  } else {
    qualityTier = 'กำลังพัฒนา (มีโอกาสต่อยอด)';
    tierColorClass = 'tier-poor';
  }

  return (
    <div className="criteria-modal-backdrop" onClick={onClose}>
      <div
        className="criteria-modal-container post-submit-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="criteria-modal-header post-submit-modal-header">
          <div className="modal-header-left">
            <div className="post-submit-header-icon">
              <CheckCircle2 size={24} color="#10b981" />
            </div>
            <div>
              <h2 className="criteria-modal-title">
                ส่งข้อเสนอโครงการเข้าสู่ Hackathon สำเร็จ!
              </h2>
              <p className="criteria-modal-subtitle">
                โครงการได้รับการบันทึกเรียบร้อยแล้ว พร้อมข้อเสนอแนะเชิงพฤติกรรมเพื่อเป็นแนวทางต่อยอดสู่การปฏิบัติจริงในพื้นที่
              </p>
            </div>
          </div>
          <button
            type="button"
            className="criteria-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="criteria-modal-body post-submit-modal-body">
          {/* Score Hero Box */}
          <div className={`post-submit-score-hero ${tierColorClass}`}>
            <div className="post-score-left">
              <span className="post-score-label">คะแนนสะท้อนเพื่อการพัฒนา (Reflective Score)</span>
              <div className="post-score-number-wrap">
                <span className="post-score-val">{score.toFixed(2)}</span>
                <span className="post-score-max">/ 100.00</span>
              </div>
              <div className="post-tier-tag">
                <Award size={16} />
                <span>ระดับ{qualityTier}</span>
              </div>
            </div>

            <div className="post-score-right">
              <div className="post-meta-row">
                <span className="post-meta-lbl">ชื่อโครงการ:</span>
                <strong className="post-meta-val title-val">{project.projectName}</strong>
              </div>
              <div className="post-meta-row">
                <span className="post-meta-lbl">กลุ่มกาแฟ:</span>
                <span className="post-meta-val group-val">{project.groupName}</span>
              </div>
              <div className="post-meta-row">
                <span className="post-meta-lbl">ผู้ส่งข้อเสนอ:</span>
                <span className="post-meta-val" style={{ color: '#0f172a', fontWeight: 600 }}>{project.proposerName || 'ผู้ร่วมกิจกรรม Hackathon'}</span>
              </div>
              <div className="post-meta-row">
                <span className="post-meta-lbl">ตำแหน่ง:</span>
                <span className="post-meta-val">{project.proposerPosition || getProposerLevelLabel(project.proposerLevel)}</span>
              </div>
              <div className="post-meta-row">
                <span className="post-meta-lbl">หน่วยงาน / สังกัด:</span>
                <span className="post-meta-val">{project.proposerAgency}</span>
              </div>
              <div className="post-meta-row">
                <span className="post-meta-lbl">มิติคุณธรรมเป้าหมาย:</span>
                <span className="post-meta-pill">{project.targetMoralVirtue}</span>
              </div>
              {project.challengeTopic && (
                <div className="post-meta-row">
                  <span className="post-meta-lbl">โจทย์การแข่งขัน:</span>
                  <span className="post-meta-val challenge-val">{project.challengeTopic}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Reflective Guidance Box */}
          <div className="post-submit-rationale-box">
            <div className="post-rationale-header">
              <Sparkles size={16} color="#7c3aed" />
              <strong>✨ มุมมองสะท้อนและแนวทางการต่อยอดสู่การปฏิบัติจริง:</strong>
            </div>
            <p className="post-rationale-text" style={{ whiteSpace: 'pre-line' }}>
              {project.aiRecommendations ||
                `โครงการ "${project.projectName}" ได้รับการประเมินความสอดคล้องตามเกณฑ์ Rubric สากลและโจทย์การแข่งขันในระดับ ${qualityTier} (${score.toFixed(2)} คะแนน)`}
            </p>
          </div>

          {/* Score Breakdown Chips */}
          {project.aiScoreBreakdown && (
            <div className="post-submit-breakdown-row">
              <div className="breakdown-chip">
                <span className="chip-lbl">ความสอดคล้อง (Alignment)</span>
                <strong className="chip-val">{project.aiScoreBreakdown.alignment}</strong>
              </div>
              <div className="breakdown-chip">
                <span className="chip-lbl">ความเป็นไปได้ (Feasibility)</span>
                <strong className="chip-val">{project.aiScoreBreakdown.feasibility}</strong>
              </div>
              <div className="breakdown-chip">
                <span className="chip-lbl">นวัตกรรม (Innovation)</span>
                <strong className="chip-val">{project.aiScoreBreakdown.innovation}</strong>
              </div>
              <div className="breakdown-chip">
                <span className="chip-lbl">การมีส่วนร่วม 3 ระดับ</span>
                <strong className="chip-val">{project.aiScoreBreakdown.participation}</strong>
              </div>
              {project.preCheckCount !== undefined && (
                <div
                  className="breakdown-chip"
                  style={{
                    backgroundColor: '#f0fdf4',
                    borderColor: '#86efac'
                  }}
                >
                  <span className="chip-lbl">ตรวจก่อนส่ง</span>
                  <strong
                    className="chip-val"
                    style={{
                      color: '#166534'
                    }}
                  >
                    {project.preCheckCount} ครั้ง (ไม่หักคะแนน)
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="criteria-modal-footer post-submit-modal-footer">
          <button
            type="button"
            className="btn-precheck-secondary"
            onClick={onClose}
          >
            <span>ปิดหน้าต่าง / ทำโครงการอื่นต่อ</span>
          </button>

          <button
            type="button"
            className="btn-post-submit-primary"
            onClick={onGoToSummary}
          >
            <BarChart3 size={18} />
            <span>ไปหน้าสรุปคะแนนเฉพาะโครงการที่ Submit เท่านั้น</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
