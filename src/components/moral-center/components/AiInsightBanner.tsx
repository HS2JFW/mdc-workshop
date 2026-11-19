import React from 'react';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';

interface AiInsightBannerProps {
  title: string;
  badge?: string;
  insights: string[];
  recommendation?: string;
  severity?: 'normal' | 'warning' | 'critical';
}

export const AiInsightBanner: React.FC<AiInsightBannerProps> = ({
  title,
  badge = 'AI Analytical Synthesis',
  insights,
  recommendation,
  severity = 'normal'
}) => {
  const getSeverityStyle = () => {
    switch (severity) {
      case 'critical':
        return { border: '1px solid rgba(239, 68, 68, 0.28)', bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(254, 242, 242, 0.7) 100%)', badgeBg: '#fee2e2', badgeColor: '#dc2626' };
      case 'warning':
        return { border: '1px solid rgba(245, 158, 11, 0.28)', bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(254, 243, 199, 0.7) 100%)', badgeBg: '#fef3c7', badgeColor: '#d97706' };
      default:
        return { border: '1px solid rgba(59, 130, 246, 0.22)', bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(239, 246, 255, 0.8) 100%)', badgeBg: '#dbeafe', badgeColor: '#2563eb' };
    }
  };

  const style = getSeverityStyle();

  return (
    <div className="moral-ai-banner" style={{ border: style.border, background: style.bg }}>
      <div className="moral-ai-banner-header">
        <div className="moral-ai-banner-title-wrap">
          <div className="moral-ai-icon-circle">
            <Bot size={18} />
          </div>
          <div>
            <div className="moral-ai-banner-title">{title}</div>
            <span className="moral-ai-banner-badge" style={{ background: style.badgeBg, color: style.badgeColor }}>
              <Sparkles size={11} style={{ marginRight: 4 }} />
              {badge}
            </span>
          </div>
        </div>
      </div>

      <div className="moral-ai-insights-list">
        {insights.map((text, idx) => (
          <div key={idx} className="moral-ai-insight-item">
            <span className="moral-ai-bullet">•</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      {recommendation && (
        <div className="moral-ai-recommendation-box">
          <div className="moral-ai-rec-header">
            <AlertCircle size={14} />
            <span>ข้อเสนอแนะเชิงมาตรการโดย AI (Actionable Recommendation):</span>
          </div>
          <p className="moral-ai-rec-text">{recommendation}</p>
        </div>
      )}
    </div>
  );
};
