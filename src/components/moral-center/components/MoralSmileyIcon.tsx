import React from 'react';

export interface MoralSmileyIconProps {
  tier: 1 | 2 | 3 | 4 | 5;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Standard Moral Center 5-Tier Smiley Icon Component
 * Colors and expressions match the official MDC Moral Criteria standard:
 * Tier 1 (มากที่สุด): เขียว #92c784 (Happy curved eyes ^ ^ and smile)
 * Tier 2 (มาก): เหลือง #facc15 (Round dots and cheerful smile)
 * Tier 3 (พอใช้): ส้ม #edb75f (Neutral straight mouth -)
 * Tier 4 (น้อย): ส้มแดง #e57f6a (Frown mouth ()
 * Tier 5 (ควรปรับปรุง): ม่วง #ae7bb7 (Sad open mouth o)
 */
export const MoralSmileyIcon: React.FC<MoralSmileyIconProps> = ({
  tier,
  size = 20,
  className = '',
  style
}) => {
  switch (tier) {
    case 1:
      // Tier 1: มากที่สุด (เขียว #92c784)
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={className}
          style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
        >
          <circle cx="12" cy="12" r="11" fill="#92c784" />
          <path d="M 6.5 10 Q 8.5 7.5 10.5 10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M 13.5 10 Q 15.5 7.5 17.5 10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M 7 14 Q 12 18.5 17 14" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 2:
      // Tier 2: มาก (เหลือง #facc15)
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={className}
          style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
        >
          <circle cx="12" cy="12" r="11" fill="#facc15" />
          <circle cx="8.5" cy="9.5" r="1.5" fill="#713f12" />
          <circle cx="15.5" cy="9.5" r="1.5" fill="#713f12" />
          <path d="M 7.5 13.5 Q 12 17.5 16.5 13.5" stroke="#713f12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 3:
      // Tier 3: พอใช้ (ส้ม #edb75f)
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={className}
          style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
        >
          <circle cx="12" cy="12" r="11" fill="#edb75f" />
          <circle cx="8.5" cy="9.5" r="1.5" fill="#ffffff" />
          <circle cx="15.5" cy="9.5" r="1.5" fill="#ffffff" />
          <line x1="8" y1="14.5" x2="16" y2="14.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 4:
      // Tier 4: น้อย (ส้มแดง #e57f6a)
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={className}
          style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
        >
          <circle cx="12" cy="12" r="11" fill="#e57f6a" />
          <circle cx="8.5" cy="9.5" r="1.5" fill="#ffffff" />
          <circle cx="15.5" cy="9.5" r="1.5" fill="#ffffff" />
          <path d="M 8 16 Q 12 12.5 16 16" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 5:
    default:
      // Tier 5: ควรปรับปรุง (ม่วง #ae7bb7)
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={className}
          style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
        >
          <circle cx="12" cy="12" r="11" fill="#ae7bb7" />
          <circle cx="8.5" cy="9.5" r="1.5" fill="#ffffff" />
          <circle cx="15.5" cy="9.5" r="1.5" fill="#ffffff" />
          <ellipse cx="12" cy="15" rx="3.5" ry="2.2" fill="#ffffff" />
        </svg>
      );
  }
};
