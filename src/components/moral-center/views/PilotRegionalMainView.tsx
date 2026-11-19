import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Home, LogIn, ShieldCheck, ChevronDown } from 'lucide-react';
import {
  type PilotProvinceName
} from '../data/pilotActivitiesSqliteService';
import {
  isAdminAuthenticated,
  onAdminAuthChange,
  isAccountLoggedIn,
  getCurrentUserProfile,
  onUserProfileChange,
  logoutAdmin,
  logoutSystem,
  type UserProfile
} from '../utils/adminAuthService';
import { AdminProfileDropdownMenu } from '../components/AdminProfileDropdownMenu';
import { PilotRegionalActivityView } from './PilotRegionalActivityView';

interface PilotRegionalMainViewProps {
  initialProvince?: PilotProvinceName | 'overview';
  onNavigateToVote?: () => void;
  onNavigateHome?: () => void;
  onNavigateToSettings?: () => void;
}

interface PilotRegionCard {
  province: PilotProvinceName;
  provinceLabel: string;
  regionLabel: string;
  bgImage: string;
  bgImageMobile: string;
}

const PILOT_REGION_CARDS: PilotRegionCard[] = [
  {
    province: 'อยุธยา',
    provinceLabel: 'จังหวัดอยุธยา',
    regionLabel: '(ภาคกลาง)',
    bgImage: '/theme/pilot_card_bg_ayutthaya_21_6.jpg',
    bgImageMobile: '/theme/pilot_card_bg_ayutthaya_mobile.jpg'
  },
  {
    province: 'อุดรธานี',
    provinceLabel: 'จังหวัดอุดรธานี',
    regionLabel: '(ภาคตะวันออกเฉียงเหนือ)',
    bgImage: '/theme/pilot_card_bg_udonthani_21_6.jpg',
    bgImageMobile: '/theme/pilot_card_bg_udonthani_mobile.jpg'
  },
  {
    province: 'ลำปาง',
    provinceLabel: 'จังหวัดลำปาง',
    regionLabel: '(ภาคเหนือ)',
    bgImage: '/theme/pilot_card_bg_lampang_21_6.jpg',
    bgImageMobile: '/theme/pilot_card_bg_lampang_mobile.jpg'
  },
  {
    province: 'สุราษฎร์ธานี',
    provinceLabel: 'จังหวัดสุราษฎร์ธานี',
    regionLabel: '(ภาคใต้)',
    bgImage: '/theme/pilot_card_bg_surat_21_6.jpg',
    bgImageMobile: '/theme/pilot_card_bg_surat_mobile.jpg'
  }
];

export const PilotRegionalMainView: React.FC<PilotRegionalMainViewProps> = ({
  initialProvince = 'overview',
  onNavigateToVote,
  onNavigateHome,
  onNavigateToSettings
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | PilotProvinceName>(initialProvince);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const p = getCurrentUserProfile();
    return Boolean(p.isAdmin && p.role === 'admin' && isAdminAuthenticated());
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getCurrentUserProfile());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isAccountLoggedIn());
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubAuth = onAdminAuthChange((status) => {
      const p = getCurrentUserProfile();
      setIsAdmin(Boolean(status && p.isAdmin && p.role === 'admin'));
      setUserProfile(p);
      setIsLoggedIn(isAccountLoggedIn());
    });
    const unsubProfile = onUserProfileChange((profile) => {
      setUserProfile(profile);
      setIsAdmin(Boolean(profile.isAdmin && profile.role === 'admin' && isAdminAuthenticated()));
      setIsLoggedIn(isAccountLoggedIn());
    });
    const handleLogoutEvent = () => {
      setIsAdmin(false);
      setIsLoggedIn(false);
      setUserProfile(getCurrentUserProfile());
      setIsProfileMenuOpen(false);
    };
    window.addEventListener('mdc_system_logout', handleLogoutEvent);
    return () => {
      unsubAuth();
      unsubProfile();
      window.removeEventListener('mdc_system_logout', handleLogoutEvent);
    };
  }, []);

  return (
    <div
      className="moral-view-container pilot-view-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        flex: '1 0 auto',
        boxSizing: 'border-box'
      }}
    >
      {activeTab === 'overview' ? (
        <div className="pilot-regional-landing-container">
          {/* Header Row with Main Heading and Home Button */}
          <div className="pilot-landing-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="pilot-regional-main-title">กิจกรรมคุณธรรม 4 ภาค</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!isLoggedIn ? (
                <button
                  type="button"
                  className="mdc-login-btn"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('mdc_open_admin_modal'));
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
                <div style={{ position: 'relative', zIndex: 100 }}>
                  <button
                    type="button"
                    className="mdc-login-btn"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    title={isAdmin ? 'ผู้ดูแลระบบ (admin) คลิกเพื่อเปิดเมนู' : `ผู้ใช้งาน: ${userProfile.name} คลิกเพื่อจัดการบัญชีหรือออกจากระบบ`}
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
                      boxShadow: isAdmin ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none'
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
                    isOpen={isProfileMenuOpen}
                    onClose={() => setIsProfileMenuOpen(false)}
                    isAdmin={isAdmin}
                    profile={userProfile}
                    isLoggedIn={isLoggedIn}
                    onOpenDatabase={() => window.dispatchEvent(new CustomEvent('mdc_open_database_modal'))}
                    onOpenDataset={() => window.dispatchEvent(new CustomEvent('mdc_open_dataset_pool_modal'))}
                    onLogoutAdmin={() => logoutAdmin()}
                    onLogoutSystem={() => logoutSystem()}
                    onOpenAdminLogin={() => window.dispatchEvent(new CustomEvent('mdc_open_admin_modal'))}
                    position="below"
                    align="right"
                  />
                </div>
              )}

              {onNavigateHome && (
                <button
                  type="button"
                  className="pilot-landing-home-btn"
                  onClick={onNavigateHome}
                  title="กลับสู่หน้าแรก (Overview Dashboard)"
                >
                  <Home size={18} />
                  <span>หน้าแรก</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Regional Banner Cards */}
          <div className="pilot-regional-banners-list">
            {PILOT_REGION_CARDS.map((item) => (
              <div
                key={item.province}
                className="pilot-region-banner-card"
                style={{
                  '--banner-bg-pc': `url(${item.bgImage})`,
                  '--banner-bg-mobile': `url(${item.bgImageMobile})`
                } as React.CSSProperties}
                onClick={() => setActiveTab(item.province)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTab(item.province);
                  }
                }}
              >
                {/* Left Text: Province Title & Region Subtitle */}
                <div className="pilot-banner-text-wrap">
                  <h2 className="pilot-banner-province-title">{item.provinceLabel}</h2>
                  <span className="pilot-banner-region-subtitle">{item.regionLabel}</span>
                </div>

                {/* Bottom Right Pill Button */}
                <button
                  type="button"
                  className="pilot-banner-enter-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(item.province);
                  }}
                >
                  <span>เข้าสู่หน้ากิจกรรม</span>
                  <ArrowRight size={15} className="pilot-banner-btn-arrow" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* PROVINCE ACTIVITY VIEW */
        <div className="pilot-province-activity-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px clamp(12px, 2vw, 36px)', width: '100%', boxSizing: 'border-box' }}>
          <PilotRegionalActivityView
            province={activeTab}
            onProvinceChange={(newProv) => setActiveTab(newProv)}
            onBackToOverview={() => setActiveTab('overview')}
            onNavigateToVote={onNavigateToVote}
            onNavigateHome={onNavigateHome}
            onNavigateToSettings={onNavigateToSettings}
          />
        </div>
      )}
    </div>
  );
};
