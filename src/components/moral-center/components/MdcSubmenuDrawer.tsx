import React from 'react';

export type MdcCardColorType = 'sky' | 'lilac' | 'teal' | 'amber' | 'blue' | 'pattern' | 'purple';

export interface MdcSubmenuCardItem {
  key: string;
  name: string;
  subName?: string;
  colorType: MdcCardColorType;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  title?: string;
}

export interface MdcSubmenuDrawerProps {
  title?: string;
  subtitle?: string;
  filterLabel?: string;
  items: MdcSubmenuCardItem[];
  className?: string;
  style?: React.CSSProperties;
  onFilterClick?: () => void;
}

export const MdcSubmenuDrawer: React.FC<MdcSubmenuDrawerProps> = ({
  title = 'เครือข่ายส่งเสริมคุณธรรม',
  filterLabel = 'ทั้งหมด',
  items,
  className = '',
  style,
  onFilterClick
}) => {
  return (
    <aside className={`mdc-submenu-drawer ${className}`} style={style}>
      {/* 1. Header with Title */}
      <div className="mdc-drawer-header">
        <h2 className="mdc-drawer-title">{title}</h2>
      </div>

      {/* 2. 2-Column Grid of Vibrant Pastel Cards */}
      <div className="mdc-drawer-grid">
        {items.map((card) => {
          return (
            <div
              key={card.key}
              className={`mdc-category-card mdc-card-${card.colorType} ${card.isActive ? 'active' : ''}`}
              onClick={card.onClick}
              title={card.title || card.name}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  card.onClick();
                }
              }}
            >
              {/* White Squircle Icon Badge at Top Center */}
              <div className="mdc-badge-squircle">
                {card.icon}
              </div>

              {/* Text underneath the badge */}
              <div className="mdc-card-label-wrap">
                <span className="mdc-card-name">{card.name}</span>
                {card.subName && (
                  <span className="mdc-card-subname">{card.subName}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
