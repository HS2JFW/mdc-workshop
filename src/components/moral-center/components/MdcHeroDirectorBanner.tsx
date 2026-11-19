import React from 'react';

export interface MdcHeroDirectorBannerProps {
  title?: string;
  description?: string;
  author?: string;
  bgImage?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const MdcHeroDirectorBanner: React.FC<MdcHeroDirectorBannerProps> = ({
  title = 'ดัชนีคุณธรรม',
  description = 'ผลสำรวจสถานการณ์ระบบนิเวศด้านคุณธรรมและทุนชีวิต',
  author = '(โดย: รศ.นพ.สุริยเดว ทรีปาตี ผู้อำนวยการศูนย์คุณธรรม)',
  bgImage = '/theme/suriyadeo_banner_bg.jpg',
  className = '',
  style
}) => {
  return (
    <div className={`mdc-hero-director-banner ${className}`} style={style}>
      {/* Background Doctor Photo Layer */}
      <img
        src={bgImage}
        alt="รศ.นพ.สุริยเดว ทรีปาตี"
        className="mdc-director-banner-bg-img"
      />

      {/* Main Title on Center-Left */}
      <div className="mdc-director-banner-title-wrap">
        <h1 className="mdc-director-banner-title">{title}</h1>
      </div>

      {/* Text / Attribution at Bottom-Right just before the Doctor */}
      <div className="mdc-director-banner-caption-wrap">
        <p className="mdc-director-banner-desc">{description}</p>
        <p className="mdc-director-banner-author">{author}</p>
      </div>
    </div>
  );
};
