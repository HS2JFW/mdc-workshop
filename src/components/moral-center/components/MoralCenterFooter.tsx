import React, { useState, useEffect } from 'react';
import { Phone, Mail, ChevronDown, ExternalLink } from 'lucide-react';
import './MoralCenterFooter.css';

export interface MoralCenterFooterProps {
  className?: string;
  onNavigatePage?: (pageId: string) => void;
}

export const MoralCenterFooter: React.FC<MoralCenterFooterProps> = ({
  className = '',
  onNavigatePage
}) => {
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState<string>('465833');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mdc_visitor_counter');
      if (saved) {
        const nextNum = parseInt(saved, 10) + 1;
        localStorage.setItem('mdc_visitor_counter', nextNum.toString());
        setVisitorCount(nextNum.toString());
      } else {
        localStorage.setItem('mdc_visitor_counter', '465834');
        setVisitorCount('465834');
      }
    } catch {
      setVisitorCount('465833');
    }
  }, []);

  const sitemapItems: { label: string; id: string; url?: string }[] = [
    { label: 'พอร์ทัลศูนย์คุณธรรม (mdc.moralcenter.or.th)', id: 'mdc-external', url: 'https://mdc.moralcenter.or.th/' },
    { label: 'วิเคราะห์ความสัมพันธ์ยุทธศาสตร์ 20 ปี & บวร', id: 'moral-analysis' },
    { label: 'ดัชนีคุณธรรม 5 มิติ (พ.ศ. 2565–2568)', id: 'policy-1-1' },
    { label: 'ทุนชีวิต 6 พลัง (พ.ศ. 2565–2568)', id: 'policy-1-2' },
    { label: 'จังหวัดคุณธรรม 77 จังหวัด', id: 'policy-national' },
    { label: 'วิทยากรคุณธรรม (เครือข่าย 5,346 คน)', id: 'policy-moral-lecturers' },
    { label: 'กิจกรรมนำร่อง 4 ภูมิภาค', id: 'pilot-overview' },
    { label: 'โครงการและการติดตาม (Project Hub)', id: 'project-tracking' },
    { label: 'Moral Credit (หน่วยกิตความดี)', id: 'policy-moral-credit' }
  ];

  const policyLinks = [
    { label: 'คำถามที่พบบ่อย', href: '#faq' },
    { label: 'นโยบายคุ้มครองข้อมูลส่วนบุคคล', href: '#privacy' },
    { label: 'นโยบายคุกกี้', href: '#cookies' },
    { label: 'นโยบายความปลอดภัยมั่นคงด้านสารสนเทศ', href: '#security' },
    { label: 'ธรรมาภิบาลข้อมูล', href: '#governance' },
    { label: 'เกี่ยวกับระบบ', href: '#about' },
    { label: 'คู่มือการใช้งาน MDC ทั้งระบบ', href: '#manual' }
  ];

  // Format visitor count into padded 6-digit array
  const countDigits = visitorCount.padStart(6, '0').slice(-6).split('');

  return (
    <footer className={`moral-center-global-footer ${className}`} data-export-ignore="true">
      <div className="moral-footer-inner">
        {/* Main 2-Column Content */}
        <div className="moral-footer-main-row">
          {/* Left Column: Organization Branding, Address, Contacts & Links */}
          <div className="moral-footer-left-col">
            {/* Logo & Org Title */}
            <div className="moral-footer-brand-wrap">
              <img
                src="/moral-center-logo.png"
                alt="ศูนย์คุณธรรม (องค์การมหาชน)"
                className="moral-footer-logo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="moral-footer-brand-text">
                <h4 className="moral-footer-org-th">
                  ศูนย์คุณธรรม <span>(องค์การมหาชน)</span>
                </h4>
                <p className="moral-footer-org-en">
                  CENTER FOR MORALITY PROMOTION (CMP) (Public Organization)
                </p>
              </div>
            </div>

            {/* Address */}
            <p className="moral-footer-address">
              ศูนย์คุณธรรม (องค์การมหาชน) เลขที่ 69 อาคารวิทยาลัยการจัดการ มหาวิทยาลัยมหิดล (CMMU) ชั้น 16-17 ถ.วิภาวดีรังสิต แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400
            </p>

            {/* Contacts Row */}
            <div className="moral-footer-contacts">
              <a href="tel:026449900" className="moral-footer-contact-item" title="โทรศัพท์ติดต่อ">
                <Phone size={14} className="moral-footer-contact-icon" />
                <span>0-2644-9900</span>
              </a>
              <a href="mailto:info@moralcenter.or.th" className="moral-footer-contact-item" title="อีเมลติดต่อ">
                <Mail size={14} className="moral-footer-contact-icon" />
                <span>info@moralcenter.or.th</span>
              </a>
            </div>

            {/* Policy & System Links */}
            <div className="moral-footer-links-row">
              {policyLinks.map((link, idx) => (
                <React.Fragment key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`เปิดเอกสาร: ${link.label} (ศูนย์คุณธรรม)`);
                    }}
                    className="moral-footer-link"
                  >
                    {link.label}
                  </a>
                  {idx < policyLinks.length - 1 && <span className="moral-footer-link-sep">|</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Browser Compatibility Note */}
            <p className="moral-footer-browser-note">
              รองรับการทำงานบน Internet Explorer v9+, Firefox v20+, Safari v.5+, Chrome v.25+, Opera v.10+
            </p>
          </div>

          {/* Right Column: Sitemap, Social Media, Visitor Counter & Mascot */}
          <div className="moral-footer-right-col">
            {/* Sitemap Dropdown */}
            <div className="moral-footer-sitemap-wrap">
              <button
                type="button"
                className="moral-footer-sitemap-btn"
                onClick={() => setIsSitemapOpen((prev) => !prev)}
                aria-expanded={isSitemapOpen}
                title="คลิกเพื่อเปิดแผนผังเว็บไซต์ (Sitemap)"
              >
                <span>Sitemap</span>
                <ChevronDown size={14} className={`moral-sitemap-arrow ${isSitemapOpen ? 'open' : ''}`} />
              </button>

              {isSitemapOpen && (
                <div className="moral-footer-sitemap-menu">
                  <div className="moral-footer-sitemap-header">แผนผังเว็บไซต์ MDC</div>
                  {sitemapItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="moral-footer-sitemap-item"
                      onClick={() => {
                        setIsSitemapOpen(false);
                        if (item.url) {
                          window.location.href = item.url;
                        } else if (onNavigatePage) {
                          onNavigatePage(item.id);
                        } else {
                          window.location.search = `?page=${item.id}`;
                        }
                      }}
                    >
                      <span>{item.label}</span>
                      <ExternalLink size={12} opacity={0.6} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <div className="moral-footer-social-wrap">
              <span className="moral-footer-social-label">Follow us :</span>
              <div className="moral-footer-social-icons">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/MoralCenter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="moral-social-circle fb"
                  title="ติดตาม Facebook ศูนย์คุณธรรม"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/moralcenter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="moral-social-circle ig"
                  title="ติดตาม Instagram ศูนย์คุณธรรม"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@moralcenter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="moral-social-circle yt"
                  title="ติดตาม YouTube ศูนย์คุณธรรม"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Visitor Counter & Mascot Row */}
            <div className="moral-footer-counter-mascot-row">
              <div className="moral-footer-visitor-counter">
                <span className="moral-footer-counter-label">ผู้ชมเว็บไซต์ :</span>
                <div className="moral-footer-counter-digits">
                  {countDigits.map((digit, i) => (
                    <span key={i} className="moral-digit-box">
                      {digit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mascot */}
              <div className="moral-footer-mascot-wrap" title="น้องคุณธรรม (Moral Mascot)">
                <img
                  src="/theme/moral_mascot.png"
                  alt="Moral Mascot"
                  className="moral-footer-mascot"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="moral-footer-copyright-bar">
          <p>Copyright © 2024 Center for Morality Promotion (Public Organization) All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
