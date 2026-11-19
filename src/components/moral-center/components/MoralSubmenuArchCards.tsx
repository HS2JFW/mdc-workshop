import React from 'react';

export interface MoralSubmenuArchItem {
  id: string;
  label?: string;
  title?: string;
  subLabel?: string;
  subtitle?: string;
  bgImg: string;
  badgeIcon: React.ReactNode | React.ElementType;
  badgeBg?: string;
  accentColor?: string;
  textColor?: string;
  textShadow?: string;
}

export interface MoralSubmenuArchCardsProps {
  items: MoralSubmenuArchItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  columns?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const MoralSubmenuArchCards: React.FC<MoralSubmenuArchCardsProps> = ({
  items,
  activeId,
  onSelect,
  columns,
  className = '',
  style
}) => {
  const colCount = columns || items.length;

  return (
    <div className={`moral-theme-arch-cards-section ${className}`} style={style}>
      <div
        className="moral-theme-arch-cards-row"
        style={{
          gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`
        }}
      >
        {items.map((card) => {
          const isActive = card.id === activeId || (card.id === 'all' && activeId === null);
          const displayLabel = card.label || card.title || '';
          const displaySubLabel = card.subLabel || card.subtitle || '';

          // Render icon whether passed as a React Element <Icon /> or Component function Icon
          const renderIcon = () => {
            if (!card.badgeIcon) return null;
            if (React.isValidElement(card.badgeIcon)) return card.badgeIcon;
            if (typeof card.badgeIcon === 'function') {
              const IconComp = card.badgeIcon as React.ElementType;
              return <IconComp size={18} color="#ffffff" />;
            }
            return null;
          };

          const dynamicBadgeBg =
            card.badgeBg ||
            (card.accentColor
              ? `linear-gradient(135deg, ${card.accentColor}, #0f172a)`
              : 'linear-gradient(135deg, #0284c7, #2563eb)');

          return (
            <div
              key={card.id}
              className={`moral-theme-arch-card card-sub-${card.id} ${isActive ? 'active' : ''}`}
              data-card-key={card.id}
              onClick={() => onSelect(card.id)}
              title={card.title || card.subLabel || card.label}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(card.id);
                }
              }}
            >
              <div className="moral-theme-arch-card-media">
                <img
                  src={card.bgImg}
                  alt={displayLabel}
                  className="moral-theme-arch-bg-img"
                  loading="lazy"
                />
              </div>

              <div
                className="moral-theme-arch-text-wrap"
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '0 8px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <span
                  className="moral-theme-arch-label"
                  style={{
                    color: '#ffffff',
                    textShadow: card.textShadow || '0 1px 3px rgba(0, 0, 0, 0.75), 0 0 2px rgba(0, 0, 0, 0.5)',
                    fontSize: '15px',
                    fontWeight: 800,
                    textAlign: 'center',
                    lineHeight: 1.25
                  }}
                >
                  {displayLabel}
                </span>

                {displaySubLabel && (
                  <span
                    className="moral-theme-arch-sublabel"
                    style={{
                      fontSize: '11.5px',
                      color: '#ffffff',
                      opacity: 0.95,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.75)',
                      textAlign: 'center'
                    }}
                  >
                    {displaySubLabel}
                  </span>
                )}
              </div>

              <div
                className="moral-theme-arch-badge"
                style={{
                  background: dynamicBadgeBg
                }}
              >
                {renderIcon()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
