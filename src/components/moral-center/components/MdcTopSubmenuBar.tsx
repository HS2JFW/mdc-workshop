import React, { useRef, useState, useEffect } from 'react';
import type { MdcSubmenuCardItem } from './MdcSubmenuDrawer';

export type { MdcSubmenuCardItem } from './MdcSubmenuDrawer';

export interface MdcTopSubmenuBarProps {
  title?: string;
  items: MdcSubmenuCardItem[];
  className?: string;
  style?: React.CSSProperties;
}

export const MdcTopSubmenuBar: React.FC<MdcTopSubmenuBarProps> = ({
  title,
  items,
  className = '',
  style
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);

  // Mouse drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.35;
    if (Math.abs(x - startX) > 6) {
      setDragMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={`mdc-top-submenu-bar ${className}`} style={style}>
      {title && (
        <div className="mdc-top-submenu-header-wrap">
          <h2 className="mdc-top-submenu-main-title">{title}</h2>
        </div>
      )}

      {/* Horizontal row of identical 130px x 106px cards centered with drag-to-scroll */}
      <div
        ref={scrollRef}
        className={`mdc-top-submenu-scroll-container ${isDragging ? 'is-dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {items.map((card, index) => {
          return (
            <div
              key={card.key}
              className={`mdc-category-card mdc-card-${card.colorType} mdc-card-idx-${index} ${card.isActive ? 'active' : ''}`}
              onClick={() => {
                if (!dragMoved) {
                  card.onClick();
                }
              }}
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
              {/* Colored Circle Icon Badge at Top Center (40px x 40px circle matching screenshot) */}
              <div className={`mdc-badge-circle mdc-badge-squircle mdc-circle-idx-${index} mdc-circle-${card.key}`}>
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
    </div>
  );
};
