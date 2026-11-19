import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import './MdcTopSynergyMenuBar.css';

export interface SynergyTopicItem {
  id: string;
  name: string;
  shortLabel?: string;
  icon?: React.ReactNode | string;
  externalAgency?: string;
  dimensionKey?: string;
  dimensionName?: string;
  dimensionColor?: string;
}

export interface DimensionFilterTab {
  key: string;
  label: string;
  count: number;
  color?: string;
}

export interface MdcTopSynergyMenuBarProps {
  dimensionTitle: string; // e.g. "ดัชนีกตัญญู" or "ดัชนีคุณธรรม 5 มิติ (ภาพรวม)"
  accentColor?: string;
  topics: SynergyTopicItem[];
  activeTopicId?: string;
  onSelectTopic: (topicId: string, topic?: SynergyTopicItem) => void;
  onBackToOverview?: () => void;
  isOverviewMode?: boolean;
  filterTabs?: DimensionFilterTab[];
  activeFilterTab?: string;
  onSelectFilterTab?: (tabKey: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * แยกชื่อ Topic ออกเป็น 3 ส่วน:
 * 1. ชื่อ Index ของศูนย์คุณธรรม (ตัดคำว่า 'มิติ' / 'ดัชนี' ออก)
 * 2. เครื่องหมาย '×'
 * 3. ชื่อหัวข้อ Synergy ข้อมูลภายนอก
 */
function parseSynergyTopic(t: SynergyTopicItem, fallbackDimension?: string) {
  const rawName = t.name || '';
  const match = rawName.split(/\s*[×xX]\s*/);
  let dimName = '';
  let themeName = '';

  if (match.length >= 2) {
    dimName = match[0].trim();
    themeName = match.slice(1).join(' × ').trim();
  } else {
    dimName = (t.dimensionName || fallbackDimension || '').trim();
    themeName = rawName.trim();
  }

  // เอาคำว่า "มิติ" และ "ดัชนี" ออกตามข้อกำหนดของผู้ใช้งาน
  dimName = dimName.replace(/^(?:มิติ|ดัชนี)/, '').trim();

  return {
    dimName: dimName || 'คุณธรรม',
    themeName: themeName || rawName
  };
}

export const MdcTopSynergyMenuBar: React.FC<MdcTopSynergyMenuBarProps> = ({
  dimensionTitle,
  accentColor = '#2563eb',
  topics,
  activeTopicId,
  onSelectTopic,
  isOverviewMode = false,
  className = '',
  style
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll bounds for chevron visibility
  const checkScrollBounds = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    checkScrollBounds();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScrollBounds);
    window.addEventListener('resize', checkScrollBounds);
    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [topics]);

  // Mouse Drag to Scroll handlers
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
    const walk = (x - startX) * 1.35; // scroll speed multiplier
    if (Math.abs(x - startX) > 6) {
      setDragMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeftState - walk;
    checkScrollBounds();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleScrollBy = (amount: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleButtonClick = (t: SynergyTopicItem) => {
    // If dragging, don't trigger click navigation
    if (dragMoved) {
      return;
    }
    onSelectTopic(t.id, t);
  };

  return (
    <div
      className={`mdc-top-synergy-menu-bar ${isOverviewMode ? 'is-overview-mode' : ''} ${className}`}
      style={{
        ...style
      }}
    >
      {/* Horizontal Scrollable & Draggable Buttons Row (ลบ Header ด้านบนออกตามข้อกำหนด) */}
      <div className="mdc-top-synergy-scroll-wrapper">
        {/* Left Scroll Chevron Button */}
        <button
          type="button"
          className={`mdc-synergy-scroll-arrow left ${canScrollLeft ? 'visible' : ''}`}
          onClick={() => handleScrollBy(-340)}
          title="เลื่อนไปทางซ้าย"
          aria-label="เลื่อนซ้าย"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Scroll Track with Drag-to-Scroll */}
        <div
          ref={scrollRef}
          className={`mdc-top-synergy-scroll-track ${isDragging ? 'is-dragging' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {topics.map((t) => {
            const isActive = t.id === activeTopicId;
            const btnAccent = t.dimensionColor || accentColor;
            const parsed = parseSynergyTopic(t, dimensionTitle);

            return (
              <button
                key={`${t.dimensionKey || ''}-${t.id}`}
                type="button"
                className={`mdc-top-synergy-btn ${isActive ? 'is-active' : ''} ${isOverviewMode ? 'in-overview' : ''}`}
                onClick={() => handleButtonClick(t)}
                title={`คลิกเพื่อดูการ Synergy: ${parsed.dimName} × ${parsed.themeName}`}
              >
                {/* 3-Row Centered Layout (ไม่มีไอคอน, กึ่งกลาง, ฟอนต์แถวที่ 1 ใหญ่ขึ้น 30%) */}
                <div className="mdc-top-synergy-btn-3rows">
                  {/* แถวที่ 1: Index ของศูนย์คุณธรรม */}
                  <span
                    className="mdc-synergy-row-dim"
                    style={!isActive ? { color: btnAccent } : undefined}
                  >
                    {parsed.dimName}
                  </span>

                  {/* แถวที่ 2: ตัว X */}
                  <span className="mdc-synergy-row-operator">X</span>

                  {/* แถวที่ 3: ชื่อหัวข้อ Synergy ข้อมูลภายนอก */}
                  <span className="mdc-synergy-row-theme">
                    {parsed.themeName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Chevron Button */}
        <button
          type="button"
          className={`mdc-synergy-scroll-arrow right ${canScrollRight ? 'visible' : ''}`}
          onClick={() => handleScrollBy(340)}
          title="เลื่อนไปทางขวา"
          aria-label="เลื่อนขวา"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
