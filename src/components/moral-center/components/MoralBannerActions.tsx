import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Download, Loader2, LogIn, ShieldCheck } from 'lucide-react';
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

export interface MoralBannerActionsProps {
  onExportPdf?: () => void | Promise<void>;
  exportButtonLabel?: string;
  defaultTitle?: string;
  defaultSubtitle?: string;
  extraActions?: React.ReactNode;
}

export const MoralBannerActions: React.FC<MoralBannerActionsProps> = ({
  onExportPdf,
  exportButtonLabel = 'Export (PDF)',
  defaultTitle = 'ศูนย์คุณธรรม Dashboard',
  defaultSubtitle = 'แดชบอร์ดสรุปภาพรวมและตัวชี้วัดหลัก',
  extraActions
}) => {
  const { language, setLanguage } = useMoralLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminAuthenticated());
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
      setIsAdmin(adminState);
      setUserProfile(getCurrentUserProfile());
      setIsLoggedIn(isAccountLoggedIn());
      if (!adminState) setIsDropdownOpen(false);
    });
    const unsubProfile = onUserProfileChange((p) => {
      setUserProfile(p);
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



  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
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
          viewTitle: defaultTitle,
          sectorTitle: 'ศูนย์คุณธรรม',
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
    window.dispatchEvent(new CustomEvent('mdc_open_admin_modal'));
  };

  return (
    <div
      className="moral-theme-hero-actions no-print"
      data-export-ignore="true"
      data-no-translate="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}
    >
      {/* 1. Language Toggle Dropdown */}
      <div ref={langDropdownRef} style={{ position: 'relative' }}>
        <button
          type="button"
          className="moral-theme-lang-btn"
          onClick={() => setIsLangMenuOpen((prev) => !prev)}
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
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '15px' }}>
            {language === 'th' ? '🇹🇭' : language === 'en' ? '🇬🇧' : '🇨🇳'}
          </span>
          <span>
            {language === 'th' ? 'TH' : language === 'en' ? 'EN' : 'ZH'}
          </span>
          <ChevronDown size={13} />
        </button>

        {isLangMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '6px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              padding: '6px',
              zIndex: 60,
              minWidth: '140px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}
          >
            <button
              type="button"
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                background: language === 'th' ? '#eff6ff' : 'transparent',
                color: language === 'th' ? '#1d4ed8' : '#334155',
                fontWeight: language === 'th' ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onClick={() => {
                setLanguage('th');
                setIsLangMenuOpen(false);
              }}
            >
              🇹🇭 TH ไทย
            </button>
            <button
              type="button"
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                background: language === 'en' ? '#eff6ff' : 'transparent',
                color: language === 'en' ? '#1d4ed8' : '#334155',
                fontWeight: language === 'en' ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onClick={() => {
                setLanguage('en');
                setIsLangMenuOpen(false);
              }}
            >
              🇬🇧 EN English
            </button>
            <button
              type="button"
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                background: language === 'zh' ? '#eff6ff' : 'transparent',
                color: language === 'zh' ? '#1d4ed8' : '#334155',
                fontWeight: language === 'zh' ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onClick={() => {
                setLanguage('zh');
                setIsLangMenuOpen(false);
              }}
            >
              🇨🇳 ZH 中文
            </button>
          </div>
        )}
      </div>

      {/* 2. Export Button */}
      <button
        type="button"
        className="moral-theme-export-btn"
        onClick={handleExport}
        title="ส่งออกเอกสารสรุปเป็น PDF"
        disabled={isExporting}
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
          cursor: isExporting ? 'not-allowed' : 'pointer'
        }}
      >
        {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        <span>{isExporting ? 'กำลังส่งออก...' : exportButtonLabel}</span>
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
            <span>{isAdmin ? 'admin' : userProfile.name.split(' ')[0]}</span>
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

      {extraActions}
    </div>
  );
};
