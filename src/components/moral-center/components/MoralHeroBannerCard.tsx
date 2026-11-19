import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { MoralBannerActions } from './MoralBannerActions';

export interface MoralHeroBannerCardProps {
  title: React.ReactNode;
  titleAccent?: string;
  subtitle: string;
  badgeText?: string;
  illustrationImg?: string;
  isCompactMode?: boolean;
  onExportPdf?: () => void | Promise<void>;
  exportButtonLabel?: string;
  hideActions?: boolean;
  backButton?: {
    label: string;
    onClick: () => void;
  };
  extraActions?: React.ReactNode;
  children?: React.ReactNode;
}

export const MoralHeroBannerCard: React.FC<MoralHeroBannerCardProps> = ({
  title,
  titleAccent,
  subtitle,
  badgeText,
  illustrationImg = '/theme/hero_wave_illustration_flag_front.png?v=20261019_front_pole',
  isCompactMode = false,
  onExportPdf,
  exportButtonLabel,
  hideActions = false,
  backButton,
  extraActions,
  children
}) => {

  return (
    <div className={`moral-theme-hero-card ${isCompactMode ? 'dimension-active' : ''}`}>
      {/* Top-Right Absolute Actions: Language Toggle & Export PDF pinned directly to top-right of the banner */}
      {!hideActions && (
        <MoralBannerActions
          onExportPdf={onExportPdf}
          exportButtonLabel={exportButtonLabel}
          defaultTitle={typeof title === 'string' ? title : 'ศูนย์คุณธรรม Dashboard'}
          defaultSubtitle={subtitle}
          extraActions={extraActions}
        />
      )}

      {backButton && (
        <div
          className="moral-theme-hero-top-nav"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            marginBottom: 10,
            position: 'relative',
            zIndex: 10
          }}
        >
          <button
            type="button"
            className="moral-theme-back-btn"
            onClick={backButton.onClick}
            title={backButton.label}
          >
            <ArrowLeft size={14} />
            <span>{backButton.label}</span>
          </button>
        </div>
      )}

      <div
        className="moral-theme-hero-main-row"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div className="moral-theme-hero-left" style={isCompactMode ? { padding: 0 } : {}}>
          {badgeText && (
            <div className="moral-theme-hero-badge">
              <span>{badgeText}</span>
            </div>
          )}

          <h1 className={`moral-theme-hero-title ${isCompactMode ? 'dimension-view-title' : ''}`}>
            {titleAccent && typeof title === 'string' && title.includes(titleAccent) ? (
              <>
                {title.split(titleAccent)[0]}
                <span className="moral-title-accent">{titleAccent}</span>
                {title.split(titleAccent).slice(1).join(titleAccent)}
              </>
            ) : (
              title
            )}
          </h1>

          <p className={`moral-theme-hero-subtitle ${isCompactMode ? 'dimension-view-subtitle' : ''}`}>
            {subtitle}
          </p>

          {children}
        </div>

        <div className="moral-theme-hero-right">
          <img
            src={illustrationImg}
            alt="Moral Center Illustration"
            className="moral-theme-hero-illustration"
            style={isCompactMode ? { opacity: 0.22 } : {}}
          />
        </div>
      </div>
    </div>
  );
};
