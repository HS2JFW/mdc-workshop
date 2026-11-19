import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Download, LogIn, Loader2, ShieldCheck } from 'lucide-react';
import { useMoralLanguage } from '../utils/moralLanguageTranslator';
import { exportDashboardToPdf } from '../utils/dashboardExportUtils';
import {
  isAdminAuthenticated,
  logoutAdmin,
  logoutSystem,
  isAccountLoggedIn,
  onAdminAuthChange,
  getCurrentUserProfile,
  onUserProfileChange,
  type UserProfile
} from '../utils/adminAuthService';
import { AdminProfileDropdownMenu } from './AdminProfileDropdownMenu';

export interface MdcTopSearchBarProps {
  onExportPdf?: () => void | Promise<void>;
  onOpenAdminModal?: () => void;
  className?: string;
  style?: React.CSSProperties;
  defaultTitle?: string;
  defaultSubtitle?: string;
  activePillar?: 'policy-1-1' | 'policy-1-2' | 'policy-moral-credit' | 'policy-moral-lecturers' | string;
  onNavigatePillar?: (pageId: string) => void;
}

const PILLAR_NAV_ITEMS = [
  { id: 'policy-1-1', label: 'ดัชนีคุณธรรม' },
  { id: 'policy-1-2', label: 'ทุนชีวิต' },
  { id: 'policy-moral-credit', label: 'Moral Credit' },
  { id: 'policy-moral-lecturers', label: 'วิทยากรคุณธรรม' }
];

export const MdcTopSearchBar: React.FC<MdcTopSearchBarProps> = ({
  onExportPdf,
  onOpenAdminModal,
  className = '',
  style,
  defaultTitle = 'ศูนย์ข้อมูลคุณธรรม (MDC Dashboard)',
  defaultSubtitle = 'แดชบอร์ดสรุปภาพรวมและตัวชี้วัดเชิงประจักษ์',
  activePillar,
  onNavigatePillar
}) => {
  const { language, setLanguage } = useMoralLanguage();
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const p = getCurrentUserProfile();
    return Boolean(p.isAdmin && p.role === 'admin' && isAdminAuthenticated());
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getCurrentUserProfile());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isAccountLoggedIn());
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDropdownMouseEnter = () => {
    if (dropdownCloseTimerRef.current) {
      clearTimeout(dropdownCloseTimerRef.current);
      dropdownCloseTimerRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    if (dropdownCloseTimerRef.current) {
      clearTimeout(dropdownCloseTimerRef.current);
    }
    dropdownCloseTimerRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 280);
  };

  useEffect(() => {
    const unsubAuth = onAdminAuthChange((adminState) => {
      const p = getCurrentUserProfile();
      setIsAdmin(Boolean(adminState && p.isAdmin && p.role === 'admin'));
      setUserProfile(p);
      setIsLoggedIn(isAccountLoggedIn());
      if (!adminState) setIsDropdownOpen(false);
    });
    const unsubProfile = onUserProfileChange((p) => {
      setUserProfile(p);
      setIsAdmin(Boolean(p.isAdmin && p.role === 'admin' && isAdminAuthenticated()));
      setIsLoggedIn(isAccountLoggedIn());
    });
    const handleLogoutEvent = () => {
      setIsAdmin(false);
      setIsLoggedIn(false);
      setUserProfile(getCurrentUserProfile());
      setIsDropdownOpen(false);
    };
    window.addEventListener('mdc_system_logout', handleLogoutEvent);
    return () => {
      unsubAuth();
      unsubProfile();
      window.removeEventListener('mdc_system_logout', handleLogoutEvent);
    };
  }, []);

  // Click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      if (onExportPdf) {
        await onExportPdf();
      } else {
        await exportDashboardToPdf({
          sectorTitle: 'ศูนย์คุณธรรม (องค์การมหาชน)',
          viewTitle: defaultTitle,
          viewSubtitle: defaultSubtitle
        });
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLoginClick = () => {
    if (onOpenAdminModal) {
      onOpenAdminModal();
    } else {
      window.dispatchEvent(new CustomEvent('mdc_open_admin_modal'));
    }
  };

  return (
    <header
      className={`mdc-top-search-row ${className} no-print`}
      data-export-ignore="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
        background: '#ffffff',
        borderBottom: '1.5px solid #e2e8f0',
        width: '100%',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Left Side: Submenu as text lined up horizontally (แสดงเฉพาะ 4 หน้าที่ระบุ) */}
      {activePillar && (
        <nav
          className="mdc-top-pillar-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginRight: 'auto',
            flexWrap: 'wrap'
          }}
          aria-label="เมนูย่อย 4 มิติคุณธรรม"
        >
          {PILLAR_NAV_ITEMS.map((item) => {
            const isActive = activePillar === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (onNavigatePillar) {
                    onNavigatePillar(item.id);
                  }
                  window.dispatchEvent(
                    new CustomEvent('mdc_navigate_page', { detail: item.id })
                  );
                }}
                className={`mdc-top-pillar-link ${isActive ? 'active' : ''}`}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 4px',
                  fontFamily: "'Kanit', sans-serif",
                  fontSize: '15px',
                  fontWeight: isActive ? 800 : 500,
                  color: isActive ? '#1e40af' : '#64748b',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'color 0.18s ease',
                  borderBottom: isActive ? '2.5px solid #2563eb' : '2.5px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#64748b';
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* Right Side Actions Cluster: Language Dropdown -> Export -> Login (Far Right) */}
      <div
        className="mdc-top-actions"
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >
        {/* 1. Dropdown list เปลี่ยนภาษา */}
        <div ref={langDropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="mdc-lang-pill"
            onClick={() => setIsLangOpen((prev) => !prev)}
            title="เปลี่ยนภาษา (Change Language)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1.2px solid #cbd5e1',
              borderRadius: '20px',
              padding: '6px 14px',
              fontFamily: "'Kanit', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              color: '#1e293b',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ fontSize: '15px' }}>
              {language === 'th' ? '🇹🇭' : language === 'en' ? '🇬🇧' : '🇨🇳'}
            </span>
            <span>
              {language === 'th' ? 'TH' : language === 'en' ? 'EN' : 'ZH'}
            </span>
            <ChevronDown
              size={14}
              style={{
                color: '#64748b',
                transition: 'transform 0.2s ease',
                transform: isLangOpen ? 'rotate(180deg)' : 'none'
              }}
            />
          </button>

          {isLangOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                padding: '6px',
                zIndex: 100,
                minWidth: '150px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px'
              }}
            >
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: language === 'th' ? '#eff6ff' : 'transparent',
                  color: language === 'th' ? '#1d4ed8' : '#334155',
                  fontWeight: language === 'th' ? 800 : 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: "'Kanit', sans-serif"
                }}
                onClick={() => {
                  setLanguage('th');
                  setIsLangOpen(false);
                }}
              >
                <span>🇹🇭</span>
                <span>TH ไทย</span>
              </button>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: language === 'en' ? '#eff6ff' : 'transparent',
                  color: language === 'en' ? '#1d4ed8' : '#334155',
                  fontWeight: language === 'en' ? 800 : 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: "'Kanit', sans-serif"
                }}
                onClick={() => {
                  setLanguage('en');
                  setIsLangOpen(false);
                }}
              >
                <span>🇬🇧</span>
                <span>EN English</span>
              </button>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: language === 'zh' ? '#eff6ff' : 'transparent',
                  color: language === 'zh' ? '#1d4ed8' : '#334155',
                  fontWeight: language === 'zh' ? 800 : 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: "'Kanit', sans-serif"
                }}
                onClick={() => {
                  setLanguage('zh');
                  setIsLangOpen(false);
                }}
              >
                <span>🇨🇳</span>
                <span>ZH 中文</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Export รายงาน PDF */}
        <button
          type="button"
          className="mdc-export-btn"
          onClick={handleExport}
          disabled={isExporting}
          title="Export เอกสารรายงานสรุปเป็น PDF"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            color: '#334155',
            border: '1.5px solid #cbd5e1',
            borderRadius: '20px',
            padding: '6px 14px',
            fontFamily: "'Kanit', sans-serif",
            fontSize: '13px',
            fontWeight: 700,
            cursor: isExporting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          <span>{isExporting ? 'กำลังส่งออก...' : 'Export (PDF)'}</span>
        </button>

        {/* 3. การเข้าระบบ / ข้อมูลบัญชีผู้ใช้งาน */}
        {!isLoggedIn ? (
          <button
            type="button"
            className="mdc-login-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleLoginClick();
            }}
            title="เข้าสู่ระบบ (Login)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              fontFamily: "'Kanit', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={15} />
            <span>Login</span>
          </button>
        ) : (
          <div
            style={{ position: 'relative', zIndex: isDropdownOpen ? 99999 : 10 }}
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            <button
              type="button"
              className="mdc-login-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (dropdownCloseTimerRef.current) {
                  clearTimeout(dropdownCloseTimerRef.current);
                  dropdownCloseTimerRef.current = null;
                }
                setIsDropdownOpen((prev) => !prev);
              }}
              title={isAdmin ? 'ผู้ดูแลระบบ (admin) คลิกหรือเลื่อนเมาส์เพื่อเปิดเมนู Database / Dataset' : `ผู้ใช้งาน: ${userProfile.name} คลิกเพื่อจัดการบัญชีหรือออกจากระบบ`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: isAdmin ? 'linear-gradient(135deg, #059669, #10b981)' : '#ffffff',
                color: isAdmin ? '#ffffff' : '#2544a8',
                border: isAdmin ? '1.5px solid #10b981' : '1.5px solid #2544a8',
                borderRadius: '20px',
                padding: '5px 14px',
                fontFamily: "'Kanit', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isAdmin ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <img
                src={userProfile.avatarUrl}
                alt={isAdmin ? 'admin' : userProfile.name}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: isAdmin ? '1px solid #ffffff' : '1px solid #2544a8'
                }}
              />
              <span style={{ fontWeight: 800 }}>{isAdmin ? 'admin' : userProfile.name.split(' ')[0]}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: '12px',
                  background: (userProfile.tier === 'A1' || isAdmin) ? '#e0f2fe' : userProfile.tier === 'A2' ? '#dcfce7' : '#fef3c7',
                  color: (userProfile.tier === 'A1' || isAdmin) ? '#0284c7' : userProfile.tier === 'A2' ? '#15803d' : '#b45309',
                  border: `1px solid ${(userProfile.tier === 'A1' || isAdmin) ? '#bae6fd' : userProfile.tier === 'A2' ? '#bbf7d0' : '#fde68a'}`
                }}
              >
                {(userProfile.tier === 'A1' || isAdmin) ? 'A1 นโยบาย' : userProfile.tier === 'A2' ? 'A2 ปฏิบัติงาน' : 'A3 ประชาชน'}
              </span>
              {isAdmin ? <ShieldCheck size={14} color="#ffffff" /> : <ChevronDown size={13} />}
            </button>

            <AdminProfileDropdownMenu
              isOpen={isDropdownOpen}
              onClose={() => {
                if (dropdownCloseTimerRef.current) {
                  clearTimeout(dropdownCloseTimerRef.current);
                  dropdownCloseTimerRef.current = null;
                }
                setIsDropdownOpen(false);
              }}
              isAdmin={isAdmin}
              profile={userProfile}
              isLoggedIn={isLoggedIn}
              onOpenDatabase={() => window.dispatchEvent(new CustomEvent('mdc_open_database_modal'))}
              onOpenDataset={() => window.dispatchEvent(new CustomEvent('mdc_open_dataset_pool_modal'))}
              onLogoutAdmin={() => logoutAdmin()}
              onLogoutSystem={() => logoutSystem()}
              onOpenAdminLogin={handleLoginClick}
              position="below"
              align="right"
            />
          </div>
        )}
      </div>
    </header>
  );
};
