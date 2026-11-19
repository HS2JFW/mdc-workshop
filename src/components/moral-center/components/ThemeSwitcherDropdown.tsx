import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useMoralTheme, type MoralThemeMode } from '../utils/moralThemeManager';
import '../styles/ThaiModernTheme.css';

interface ThemeSwitcherDropdownProps {
  className?: string;
  style?: React.CSSProperties;
  showTagline?: boolean;
}

export const ThemeSwitcherDropdown: React.FC<ThemeSwitcherDropdownProps> = ({
  className = '',
  style,
  showTagline = true
}) => {
  const { theme, isThaiModern, setTheme, options } = useMoralTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeOption = options.find((opt) => opt.id === theme) || options[0];

  const handleSelect = (mode: MoralThemeMode) => {
    setTheme(mode);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`moral-theme-switcher-container ${className}`}
      style={style}
    >
      <button
        type="button"
        className={`moral-theme-switcher-btn ${isThaiModern ? 'active-thai' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="เลือกรูปแบบธีม Dashboard (Family / Thai Modern)"
      >
        {isThaiModern ? (
          <Sparkles size={15} color="#faeaba" />
        ) : (
          <Palette size={15} color="#0284c7" />
        )}
        <span className="moral-theme-btn-badge">
          <span className="moral-theme-icon-symbol">{activeOption.icon}</span>
          <span>ธีม: {activeOption.name}</span>
        </span>
        <ChevronDown
          size={13}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      {isOpen && (
        <div className="moral-theme-dropdown-menu" role="listbox">
          <div className="moral-theme-dropdown-header">
            <span>เลือกธีมแสดงผล (Theme)</span>
          </div>

          {options.map((opt) => {
            const isSelected = opt.id === theme;
            const isThai = opt.id === 'thai-modern';

            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`moral-theme-option-item ${isSelected ? 'selected' : ''} ${isThai ? 'thai-option' : ''}`}
                onClick={() => handleSelect(opt.id)}
              >
                <div className="moral-theme-option-icon-box">
                  {opt.icon}
                </div>

                <div className="moral-theme-option-content">
                  <div className="moral-theme-option-title-row">
                    <span className="moral-theme-option-name">{opt.name}</span>
                    {isSelected && (
                      <Check size={16} className="moral-theme-check-icon" />
                    )}
                  </div>
                  {showTagline && (
                    <span className="moral-theme-option-tagline">
                      {opt.tagline}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
