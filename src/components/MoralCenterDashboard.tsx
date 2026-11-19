import React, { useState, useEffect } from 'react';
import {
  Network,
  BarChart2,
  Settings,
  HeartHandshake,
  GraduationCap,
  LogOut,
  FolderKanban,
  Coins,
  Home,
  UploadCloud,
  Layers,
  PieChart,
  BookOpen,
  FileText,
  HelpCircle,
  Vote,
  Trophy,
  Shield,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import {
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
  onAdminAuthChange,
  getCurrentUserProfile,
  onUserProfileChange,
  type UserProfile,
  authenticateAccount,
  DUMMY_ACCOUNTS
} from './moral-center/utils/adminAuthService';
import { AdminDatabaseModal } from './moral-center/components/AdminDatabaseModal';
import { AdminDatasetPoolModal } from './moral-center/components/AdminDatasetPoolModal';
import './MoralCenterDashboard.css';
import './moral-center/MoralCenterViews.css';
import { PolicyMoralAnalysisDashboardView } from './moral-center/views/PolicyMoralAnalysisDashboardView';
import { PolicyMoralIndexDashboardView } from './moral-center/views/PolicyMoralIndexDashboardView';
import { PolicyLifeCapitalDashboardView } from './moral-center/views/PolicyLifeCapitalDashboardView';
import { PolicyMoralLecturersDashboardView } from './moral-center/views/PolicyMoralLecturersDashboardView';
import { PolicyMoralCreditDashboardView } from './moral-center/views/PolicyMoralCreditDashboardView';
import { PolicyNationalIndexView } from './moral-center/views/PolicyNationalIndexView';
import { PilotRegionalMainView } from './moral-center/views/PilotRegionalMainView';
import { PilotHackathonVoteView } from './moral-center/views/PilotHackathonVoteView';
import { ProjectTrackingMainView } from './moral-center/views/ProjectTrackingMainView';
import {
  useMoralLanguage,
  applyDomLanguageTranslation
} from './moral-center/utils/moralLanguageTranslator';
import { useMoralTheme } from './moral-center/utils/moralThemeManager';
import './moral-center/styles/ThaiModernTheme.css';
import { SettingsPage } from './SettingsPage';
import { MoralCenterFooter } from './moral-center/components/MoralCenterFooter';
import { DatasetManagementHubView } from './moral-center/views/DatasetManagementHubView';

interface MoralCenterDashboardProps {
  onLogout?: () => void;
}

const PilotActivityIcon: React.FC<{ size?: number; color?: string; className?: string }> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Calendar / Activity Board Frame */}
    <rect x="3" y="4.5" width="18" height="16.5" rx="3" stroke={color} strokeWidth="1.9" />
    {/* Top Rings */}
    <path d="M8 2.5V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 2.5V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Header Divider */}
    <path d="M3.5 9H20.5" stroke={color} strokeWidth="1.6" />
    {/* 4 Regional Pilot Nodes / Spark Star inside */}
    <circle cx="8.5" cy="13" r="1.4" fill="#fbbf24" />
    <circle cx="15.5" cy="13" r="1.4" fill="#34d399" />
    <circle cx="8.5" cy="17.2" r="1.4" fill="#60a5fa" />
    <circle cx="15.5" cy="17.2" r="1.4" fill="#f472b6" />
    {/* Synergy Connecting Lines */}
    <path d="M9.9 13H14.1M8.5 14.4V15.8M15.5 14.4V15.8M9.9 17.2H14.1" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const MdcIconWithFallback: React.FC<{
  src: string;
  alt: string;
  fallback: React.ReactNode;
}> = ({ src, alt, fallback }) => {
  const [error, setError] = useState(false);
  if (error) {
    return <span className="mdc-fallback-icon-wrap">{fallback}</span>;
  }
  return (
    <img
      className="mdc-nav-icon"
      src={src}
      alt={alt}
      onError={() => setError(true)}
      loading="eager"
    />
  );
};

export const MoralCenterDashboard: React.FC<MoralCenterDashboardProps> = ({ onLogout }) => {
  const { language } = useMoralLanguage();
  const { theme } = useMoralTheme();
  const [selectedSubItem, setSelectedSubItem] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      if (page && page !== 'pilot-dashboard' && page !== 'policy-1-1' && page !== 'overview') {
        return page;
      }
      if (params.has('page') && (page === 'pilot-dashboard' || page === 'policy-1-1')) {
        const url = new URL(window.location.href);
        url.searchParams.delete('page');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    }
    return 'moral-analysis';
  });
  const [activeProjectTab, setActiveProjectTab] = useState<'overview' | 'tracking' | 'meeting' | 'realtime'>('tracking');
  
  // Admin Login Dialog, Profile & Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const p = getCurrentUserProfile();
    return Boolean(p.isAdmin && p.role === 'admin' && isAdminAuthenticated());
  });
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(() => getCurrentUserProfile());
  const [isAdminDatabaseModalOpen, setIsAdminDatabaseModalOpen] = useState<boolean>(false);
  const [isAdminDatasetPoolModalOpen, setIsAdminDatasetPoolModalOpen] = useState<boolean>(false);
  const [dbModalInitialTable, setDbModalInitialTable] = useState<string | undefined>(undefined);
  const [dbModalInitialPageId, setDbModalInitialPageId] = useState<string | undefined>(undefined);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminInputUser, setAdminInputUser] = useState<string>('');
  const [adminInputPass, setAdminInputPass] = useState<string>('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    const unsubAuth = onAdminAuthChange((adminState) => {
      const p = getCurrentUserProfile();
      setIsAdmin(Boolean(adminState && p.isAdmin && p.role === 'admin'));
      setCurrentUserProfile(p);
    });
    const unsubProfile = onUserProfileChange((profile) => {
      setCurrentUserProfile(profile);
      setIsAdmin(Boolean(profile.isAdmin && profile.role === 'admin' && isAdminAuthenticated()));
    });
    const handleLogout = () => {
      setIsAdmin(false);
      setCurrentUserProfile(getCurrentUserProfile());
      setIsAdminModalOpen(false);
    };
    window.addEventListener('mdc_system_logout', handleLogout);
    return () => {
      unsubAuth();
      unsubProfile();
      window.removeEventListener('mdc_system_logout', handleLogout);
    };
  }, []);

  // Listen for custom events to open Database or Dataset modals from other components
  useEffect(() => {
    const handleOpenDb = (e: any) => {
      if (e.detail?.table) setDbModalInitialTable(e.detail.table);
      if (e.detail?.pageId) setDbModalInitialPageId(e.detail.pageId);
      setIsAdminDatabaseModalOpen(true);
    };
    const handleOpenDataset = () => {
      setSelectedSubItem('datasets');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('page', 'datasets');
        window.history.pushState({}, '', url.toString());
      }
    };

    window.addEventListener('mdc_open_database_modal', handleOpenDb);
    window.addEventListener('mdc_open_dataset_pool_modal', handleOpenDataset);

    return () => {
      window.removeEventListener('mdc_open_database_modal', handleOpenDb);
      window.removeEventListener('mdc_open_dataset_pool_modal', handleOpenDataset);
    };
  }, [isAdmin]);

  // Listen for open admin modal events triggered from top action bars
  useEffect(() => {
    const handleOpenAdminModalEvent = () => {
      handleOpenAdminModal();
    };
    window.addEventListener('mdc_open_admin_modal', handleOpenAdminModalEvent);
    return () => window.removeEventListener('mdc_open_admin_modal', handleOpenAdminModalEvent);
  }, [isAdmin]);
  // Listen for pillar page navigation events triggered from top search/sub-menus
  useEffect(() => {
    const handleNavigatePageEvent = (e: any) => {
      if (e.detail) {
        setSelectedSubItem(e.detail);
      }
    };
    window.addEventListener('mdc_navigate_page', handleNavigatePageEvent);
    return () => window.removeEventListener('mdc_navigate_page', handleNavigatePageEvent);
  }, []);


  const handleOpenAdminModal = () => {
    setAdminInputUser('');
    setAdminInputPass('');
    setAdminLoginError(null);
    setShowPassword(false);
    setIsAdminModalOpen(true);
  };

  const handleCloseAdminModal = () => {
    setAdminInputUser('');
    setAdminInputPass('');
    setAdminLoginError(null);
    setShowPassword(false);
    setIsAdminModalOpen(false);
  };

  const handleAdminLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = authenticateAccount(adminInputUser, adminInputPass);
    if (res.success) {
      setIsAdmin(res.isAdmin);
      setCurrentUserProfile(res.profile);
      setAdminLoginError(null);
      setAdminInputUser('');
      setAdminInputPass('');
      setIsAdminModalOpen(false);
    } else {
      setAdminLoginError(res.message);
    }
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdmin(false);
    setAdminInputUser('');
    setAdminInputPass('');
    setIsAdminModalOpen(false);
  };

  const isCalendarActive =
    selectedSubItem === 'public-meeting' ||
    (['project-tracking', 'public-realtime-projects'].includes(selectedSubItem) && activeProjectTab === 'meeting');

  // ตรวจสอบว่ากำลังเปิดหน้ากิจกรรมหรือโหวตโครงการหรือไม่ (ถ้าใช่ จะซ่อนแถบเมนูซ้ายและแสดงแบบ Full page)
  const isPilotActivity = selectedSubItem.startsWith('pilot-');

  useEffect(() => {
    const timer = setTimeout(() => {
      applyDomLanguageTranslation(language);
    }, 80);
    return () => clearTimeout(timer);
  }, [language, selectedSubItem]);

  return (
    <div className="moral-fullscreen-root" data-moral-theme={theme}>
      <div className="moral-fullscreen-frame">
        {/* =========================================
            1. FAR-LEFT SLIM SIDEBAR (ซ่อนอัตโนมัติเมื่อเปิดหน้ากิจกรรม Full page)
        ========================================= */}
        {!isPilotActivity && (
          <div className="moral-sidebar-wrapper no-print" data-export-ignore="true">
            <aside className="moral-slim-sidebar">
            {theme === 'thai-modern' ? (
              <>
                <div className="mdc-sidemenu-top">
                  {/* Brand Logo Header (Large Logo Only, Clickable to MDC Portal) */}
                  <div
                    className="mdc-logo-wrap"
                    onClick={() => {
                      window.location.href = 'https://mdc.moralcenter.or.th/';
                    }}
                    style={{ cursor: 'pointer' }}
                    title="ไปยังเว็บไซต์ศูนย์คุณธรรม (https://mdc.moralcenter.or.th/)"
                  >
                    <img
                      src="/moral-center-logo.png"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://mdc.moralcenter.or.th/themes/mdc1_v2/assets/images/logo.png';
                      }}
                      alt="ศูนย์คุณธรรม"
                      className="mdc-sidemenu-logo"
                    />
                  </div>

                  {/* Navigation List: Original Content with MDC UX/UI */}
                  <div className="mdc-sidemenu-list">
                    {/* 0. วิเคราะห์ (อยู่ด้านบนของเมนูดัชนีคุณธรรม) */}
                    <button
                      type="button"
                      className={`mdc-nav-item ${selectedSubItem === 'moral-analysis' ? 'active' : ''}`}
                      onClick={() => setSelectedSubItem('moral-analysis')}
                      title="วิเคราะห์ (ภาพรวมแผนยุทธศาสตร์ 20 ปี, บวร และความสัมพันธ์ 4 ดัชนีหลัก)"
                    >
                      <div className="mdc-nav-icon-box">
                        <Network size={21} />
                      </div>
                      <span className="mdc-nav-text">วิเคราะห์</span>
                    </button>

                    {/* 6. กิจกรรม */}
                    <button
                      type="button"
                      className={`mdc-nav-item ${selectedSubItem.startsWith('pilot-') ? 'active' : ''}`}
                      onClick={() => setSelectedSubItem('pilot-dashboard')}
                      title="กิจกรรม (นำร่อง 4 ภูมิภาค อยุธยา อุดรธานี ลำปาง สุราษฎร์ธานี)"
                    >
                      <div className="mdc-nav-icon-box">
                        <PilotActivityIcon size={21} color="currentColor" />
                      </div>
                      <span className="mdc-nav-text">กิจกรรม</span>
                    </button>
                  </div>
                </div>

                <div className="mdc-sidemenu-bottom">
                  {/* ตั้งค่า (Settings: สงวนสิทธิ์มองเห็นเฉพาะ Account Admin เท่านั้น) */}
                  {isAdmin && (
                    <button
                      type="button"
                      className={`mdc-nav-item mdc-bottom-item ${selectedSubItem === 'settings' ? 'active' : ''}`}
                      onClick={() => setSelectedSubItem('settings')}
                      title="ตั้งค่า (OpenRouter AI, ธีม, ตารางฐานข้อมูล และสิทธิ์ Admin)"
                    >
                      <div className="mdc-nav-icon-box">
                        <Settings size={19} />
                      </div>
                      <span className="mdc-nav-text">ตั้งค่า</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="moral-slim-top">
                  {/* Brand Logo Header (Centered Logo Only - +50% Larger - Clickable to MDC Portal) */}
                  <div
                    className="moral-slim-brand-header"
                    onClick={() => {
                      window.location.href = 'https://mdc.moralcenter.or.th/';
                    }}
                    style={{ cursor: 'pointer' }}
                    title="ไปยังเว็บไซต์ศูนย์คุณธรรม (https://mdc.moralcenter.or.th/)"
                  >
                    <button
                      type="button"
                      className="moral-slim-brand-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = 'https://mdc.moralcenter.or.th/';
                      }}
                      title="ไปยังเว็บไซต์ศูนย์คุณธรรม (https://mdc.moralcenter.or.th/)"
                    >
                      <img
                        src="/moral-center-logo.png"
                        alt="Moral Center Logo"
                        className="moral-slim-logo-img"
                        draggable={false}
                      />
                    </button>
                  </div>

                  {/* Navigation Items Group */}
                  <div className="moral-slim-nav-list">
                    <div className="moral-sidebar-section-title">Moral Synergy</div>

                    {/* 0. วิเคราะห์ (อยู่ด้านบนของเมนูดัชนีคุณธรรม) */}
                    <button
                      type="button"
                      className={`moral-slim-icon-btn ${selectedSubItem === 'moral-analysis' ? 'active' : ''}`}
                      onClick={() => setSelectedSubItem('moral-analysis')}
                      title="วิเคราะห์ (ภาพรวมแผนยุทธศาสตร์ 20 ปี, บวร และความสัมพันธ์ 4 ดัชนีหลัก)"
                    >
                      <div className="moral-nav-item-icon">
                        <Network size={19} />
                      </div>
                      <span className="moral-slim-btn-label">วิเคราะห์</span>
                    </button>

                    {/* 6. กิจกรรม */}
                    <button
                      className={`moral-slim-icon-btn ${selectedSubItem.startsWith('pilot-') ? 'active' : ''}`}
                      onClick={() => setSelectedSubItem('pilot-dashboard')}
                      title="กิจกรรม (นำร่อง 4 ภูมิภาค อยุธยา อุดรธานี ลำปาง สุราษฎร์ธานี)"
                    >
                      <div className="moral-nav-item-icon">
                        <PilotActivityIcon size={19} color="currentColor" />
                      </div>
                      <span className="moral-slim-btn-label">กิจกรรม</span>
                    </button>
                  </div>
                </div>

                <div className="moral-slim-bottom">
                  {/* Actions Section: ปุ่มตั้งค่าระบบ (Settings) เฉพาะ Account Admin เท่านั้น */}
                  {isAdmin && (
                    <div className="moral-sidebar-action-col">
                      <button
                        className={`moral-sidebar-full-btn ${selectedSubItem === 'settings' ? 'active' : ''}`}
                        onClick={() => setSelectedSubItem('settings')}
                        title="ตั้งค่า (OpenRouter AI, ธีม, ตารางฐานข้อมูล และสิทธิ์ Admin)"
                      >
                        <div className="moral-nav-item-icon">
                          <Settings size={18} />
                        </div>
                        <span className="moral-slim-btn-label">ตั้งค่า</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Sidebar Bottom Wave Decoration from Mockup Theme */}
            <div className="moral-slim-sidebar-wave" />
          </aside>
        </div>
        )}

        {/* =========================================
            2. MAIN CONTENT PANE (SCROLLABLE DASHBOARD WITH TOP BANNERS)
        ========================================= */}
        <div
          className="moral-app-main-pane"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minWidth: 0,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* DYNAMIC SCROLLABLE DASHBOARD VIEW */}
          <main
            className={`moral-main-scroll-container ${isCalendarActive ? 'calendar-mode' : selectedSubItem.startsWith('pilot-') ? 'pilot-mode' : ''}`}
            style={{ flex: 1, minHeight: 0 }}
          >
            {/* 0. วิเคราะห์ (ภาพรวมแผน 20 ปี และ บวร สู่ 4 เสาหลัก) */}
            {selectedSubItem === 'moral-analysis' && (
              <PolicyMoralAnalysisDashboardView
                onNavigatePage={(pageId) => setSelectedSubItem(pageId)}
              />
            )}

            {/* 1. ดัชนีคุณธรรม */}
            {selectedSubItem === 'policy-1-1' && <PolicyMoralIndexDashboardView onNavigatePage={(pageId) => setSelectedSubItem(pageId)} />}

            {/* 2. ทุนชีวิต */}
            {selectedSubItem === 'policy-1-2' && <PolicyLifeCapitalDashboardView onNavigatePage={(pageId) => setSelectedSubItem(pageId)} />}

            {/* 3. จังหวัดคุณธรรม (ภาพรวมระดับชาติ 77 จังหวัด) */}
            {selectedSubItem === 'policy-national' && <PolicyNationalIndexView />}

            {/* 4. วิทยากรคุณธรรม */}
            {selectedSubItem === 'policy-moral-lecturers' && <PolicyMoralLecturersDashboardView onNavigatePage={(pageId) => setSelectedSubItem(pageId)} />}

            {/* 5. กิจกรรม (กิจกรรมนำร่อง 4 ภูมิภาค) */}
            {selectedSubItem.startsWith('pilot-') && selectedSubItem !== 'pilot-vote' && (
              <PilotRegionalMainView
                initialProvince={
                  selectedSubItem === 'pilot-ayutthaya' || selectedSubItem === 'pilot-rayong' || selectedSubItem === 'pilot-อยุธยา'
                    ? 'อยุธยา'
                    : selectedSubItem === 'pilot-surat' || selectedSubItem === 'pilot-phangnga' || selectedSubItem === 'pilot-สุราษฎร์ธานี'
                    ? 'สุราษฎร์ธานี'
                    : selectedSubItem === 'pilot-udonthani' || selectedSubItem === 'pilot-udon' || selectedSubItem === 'pilot-kalasin' || selectedSubItem === 'pilot-nongkhai' || selectedSubItem === 'pilot-อุดรธานี' || selectedSubItem === 'pilot-กาฬสินธุ์'
                    ? 'อุดรธานี'
                    : selectedSubItem === 'pilot-lampang' || selectedSubItem === 'pilot-nan' || selectedSubItem === 'pilot-ลำปาง' || selectedSubItem === 'pilot-น่าน'
                    ? 'ลำปาง'
                    : 'overview'
                }
                onNavigateToVote={() => setSelectedSubItem('pilot-vote')}
                onNavigateHome={() => setSelectedSubItem('moral-analysis')}
                onNavigateToSettings={() => setSelectedSubItem('settings')}
              />
            )}

            {/* 6. ประกาศคะแนน (Hackathon คุณธรรม 4 ภาค) */}
            {selectedSubItem === 'pilot-vote' && (
              <PilotHackathonVoteView
                isAdmin={isAdmin}
                onNavigateToProvince={(prov) => {
                  if (!prov) {
                    setSelectedSubItem('pilot-dashboard');
                  } else if (prov === 'อยุธยา') {
                    setSelectedSubItem('pilot-ayutthaya');
                  } else if (prov === 'สุราษฎร์ธานี') {
                    setSelectedSubItem('pilot-surat');
                  } else if (prov === 'อุดรธานี' || prov === 'กาฬสินธุ์') {
                    setSelectedSubItem('pilot-udonthani');
                  } else if (prov === 'ลำปาง' || prov === 'น่าน') {
                    setSelectedSubItem('pilot-lampang');
                  } else {
                    setSelectedSubItem(`pilot-${prov}`);
                  }
                }}
                onNavigateHome={() => setSelectedSubItem('moral-analysis')}
              />
            )}

            {/* 7. โครงการ (โครงการภายใต้ศูนย์คุณธรรม / การประชุม / Realtime) */}
            {['project-tracking', 'public-meeting', 'public-realtime-projects'].includes(selectedSubItem) && (
              <ProjectTrackingMainView
                initialTab={
                  selectedSubItem === 'public-meeting'
                    ? 'meeting'
                    : selectedSubItem === 'public-realtime-projects'
                    ? 'realtime'
                    : 'tracking'
                }
                onTabChange={(tab) => setActiveProjectTab(tab)}
              />
            )}

            {/* Supporting: Moral Credit */}
            {selectedSubItem === 'policy-moral-credit' && <PolicyMoralCreditDashboardView onNavigatePage={(pageId) => setSelectedSubItem(pageId)} />}

            {/* Supporting: การตั้งค่า (สงวนสิทธิ์เฉพาะ Account Admin เท่านั้น) */}
            {selectedSubItem === 'settings' && (
              isAdmin ? (
                <SettingsPage onNavigateHome={() => setSelectedSubItem('moral-analysis')} />
              ) : (
                <div style={{ padding: '48px 24px', maxWidth: '580px', margin: '48px auto', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', fontFamily: "'Kanit', sans-serif" }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Lock size={30} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    สงวนสิทธิ์เฉพาะบัญชีผู้ดูแลระบบ (Account Admin Only)
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>
                    ปุ่มและการเข้าถึงหน้าตั้งค่าระบบ (Settings) เปิดให้ใช้งานเฉพาะเมื่อเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin) เท่านั้น
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={handleOpenAdminModal}
                      style={{ padding: '10px 22px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Lock size={16} />
                      <span>เข้าสู่ระบบ Admin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSubItem('moral-analysis')}
                      style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                    >
                      กลับหน้าหลัก
                    </button>
                  </div>
                </div>
              )
            )}

            {/* 8. Data Set Hub: จัดการและเชื่อมโยงชุดข้อมูล DuckDB & Synergy */}
            {selectedSubItem === 'datasets' && (
              <DatasetManagementHubView
                onNavigatePage={(pageId) => {
                  setSelectedSubItem(pageId);
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.set('page', pageId);
                    window.history.pushState({}, '', url.toString());
                  }
                }}
                onOpenDatabaseTable={(table, pageId) => {
                  setDbModalInitialTable(table);
                  setDbModalInitialPageId(pageId);
                  setIsAdminDatabaseModalOpen(true);
                }}
              />
            )}

            {!['moral-analysis', 'policy-1-1', 'policy-1-2', 'policy-national', 'policy-moral-lecturers', 'policy-moral-credit',
               'project-tracking', 'public-meeting', 'public-realtime-projects',
               'settings', 'pilot-vote', 'datasets'
               ].includes(selectedSubItem) && !selectedSubItem.startsWith('pilot-') && (
              <PolicyMoralAnalysisDashboardView onNavigatePage={(pageId) => setSelectedSubItem(pageId)} />
            )}

            {/* Global Moral Center Footer for all views (Single Source of Truth at bottom) */}
            {!isCalendarActive && (
              <MoralCenterFooter onNavigatePage={(pageId) => setSelectedSubItem(pageId)} />
            )}
          </main>
        </div>

        {/* Global Bottom Wave from Mockup Theme (ซ่อนเมื่อเปิดปฏิทินเต็มจอ) */}
        <div className={`moral-global-bottom-wave no-print ${isCalendarActive ? 'calendar-hidden' : ''}`} data-export-ignore="true" />
      </div>

      {/* =================================================================
          ADMIN LOGIN DIALOG MODAL
          ================================================================= */}
      {isAdminModalOpen && (
        <div
          className="admin-login-modal-overlay"
          onClick={handleCloseAdminModal}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 15, 29, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            className="admin-login-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '460px',
              padding: '32px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.15)',
              color: '#ffffff',
              fontFamily: 'Kanit, sans-serif',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: isAdmin ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #0284c7, #38bdf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isAdmin ? '0 8px 20px rgba(16, 185, 129, 0.35)' : '0 8px 20px rgba(56, 189, 248, 0.35)'
                  }}
                >
                  {isAdmin ? <ShieldCheck size={26} color="#ffffff" /> : <Lock size={24} color="#ffffff" />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>
                    {isAdmin ? 'ผู้ดูแลระบบ (Admin Authenticated)' : 'เข้าสู่ระบบ (Login)'}
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                    {isAdmin ? 'ท่านได้รับสิทธิ์ผู้ดูแลระบบเต็มรูปแบบแล้ว' : 'กรุณาระบุ Username และ Password เพื่อเข้าสู่ระบบ'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseAdminModal}
                aria-label="ปิดหน้าต่างเข้าสู่ระบบ"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '10px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <X size={18} />
              </button>
            </div>

            {isAdmin ? (
              /* ALREADY LOGGED IN AS ADMIN */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#10b981' }}>
                      สถานะ: เข้าสู่ระบบ Admin เรียบร้อยแล้ว
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    • สามารถมองเห็นและกด <strong>"ปุ่มประกาศผลการโหวต"</strong> ในหน้าโหวตโครงการได้<br />
                    • เข้าถึงฟังก์ชันการจัดการและผลการตัดสินอย่างเป็นทางการ
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCloseAdminModal}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ปิดหน้าต่าง
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'rgba(225, 29, 72, 0.15)',
                      border: '1px solid rgba(225, 29, 72, 0.4)',
                      borderRadius: '14px',
                      color: '#f43f5e',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ออกจากระบบ Admin
                  </button>
                </div>
              </div>
            ) : (
              /* LOGIN FORM */
              <form onSubmit={handleAdminLoginSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {adminLoginError && (
                  <div
                    style={{
                      background: 'rgba(225, 29, 72, 0.15)',
                      border: '1px solid rgba(225, 29, 72, 0.4)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#fda4af',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    <AlertCircle size={18} color="#f43f5e" style={{ flexShrink: 0 }} />
                    <span>{adminLoginError}</span>
                  </div>
                )}

                {/* Username Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    ชื่อผู้ใช้ (Username)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                      <User size={17} />
                    </div>
                    <input
                      type="text"
                      name="admin_login_username"
                      autoComplete="off"
                      value={adminInputUser}
                      onChange={(e) => setAdminInputUser(e.target.value)}
                      placeholder="กรอกชื่อผู้ใช้ (Username)"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '14px',
                        color: '#ffffff',
                        fontSize: '15px',
                        fontFamily: 'Kanit, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    รหัสผ่าน (Password)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                      <Lock size={17} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="admin_login_password"
                      autoComplete="new-password"
                      value={adminInputPass}
                      onChange={(e) => setAdminInputPass(e.target.value)}
                      placeholder="กรอกรหัสผ่าน (Password)"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 44px 12px 42px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '14px',
                        color: '#ffffff',
                        fontSize: '15px',
                        fontFamily: 'Kanit, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Quick Account Chips for Testing / Quick Access (Regular Users Only) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>
                    เลือกบัญชีทดสอบด่วน (ผู้ใช้งานทั่วไปตามสิทธิ์ 3 ระดับ):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminInputUser('a1');
                        setAdminInputPass('test');
                      }}
                      style={{
                        padding: '7px 12px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        borderRadius: '10px',
                        color: '#38bdf8',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'Kanit, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <span>👤 a1 : ดร.อนันต์ วัฒนศิลป์</span>
                      <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.25)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        A1 ระดับนโยบาย
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminInputUser('a2');
                        setAdminInputPass('test');
                      }}
                      style={{
                        padding: '7px 12px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: '10px',
                        color: '#34d399',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'Kanit, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <span>👤 a2 : พญ.กานดา สุวรรณเวช</span>
                      <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.25)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        A2 ระดับผู้ปฏิบัติงาน
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminInputUser('a3');
                        setAdminInputPass('test');
                      }}
                      style={{
                        padding: '7px 12px',
                        background: 'rgba(251, 191, 36, 0.12)',
                        border: '1px solid rgba(251, 191, 36, 0.35)',
                        borderRadius: '10px',
                        color: '#fbbf24',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'Kanit, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <span>👤 a3 : อ.วิชัย เกียรติภูมิ</span>
                      <span style={{ fontSize: '11px', background: 'rgba(251, 191, 36, 0.25)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        A3 ประชาชนทั่วไป
                      </span>
                    </button>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                    * สิทธิ์ผู้ดูแลระบบ (Admin) สงวนความปลอดภัย ต้องกรอก Username และ Password ด้วยตนเองเท่านั้น
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleCloseAdminModal}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px',
                      color: '#94a3b8',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1.5,
                      padding: '12px',
                      background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                      border: 'none',
                      borderRadius: '14px',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)'
                    }}
                  >
                    เข้าสู่ระบบ (Login)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* =========================================
          ADMIN MODALS: Database & Dataset Pool
      ========================================= */}
      <AdminDatabaseModal
        isOpen={isAdminDatabaseModalOpen}
        onClose={() => setIsAdminDatabaseModalOpen(false)}
        onNavigatePage={(pid) => setSelectedSubItem(pid)}
        initialTable={dbModalInitialTable}
        initialPageId={dbModalInitialPageId}
      />

      <AdminDatasetPoolModal
        isOpen={isAdminDatasetPoolModalOpen}
        onClose={() => setIsAdminDatasetPoolModalOpen(false)}
        onNavigatePage={(pid) => setSelectedSubItem(pid)}
        onOpenDatabaseTable={(tbl, pid) => {
          setIsAdminDatasetPoolModalOpen(false);
          setDbModalInitialTable(tbl);
          setDbModalInitialPageId(pid);
          setIsAdminDatabaseModalOpen(true);
        }}
      />
    </div>
  );
};

