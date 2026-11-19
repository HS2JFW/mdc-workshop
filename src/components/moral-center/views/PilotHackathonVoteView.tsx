import React, { useState, useMemo, useEffect } from 'react';
import {
  Vote,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ThumbsUp,
  ShieldCheck,
  Award,
  Trophy,
  RotateCcw,
  Sparkle,
  Crown,
  Home,
  Eye,
  User,
  Briefcase,
  Building2,
  Trash2,
  Clock,
  Coffee,
  LogIn,
  ChevronDown
} from 'lucide-react';
import {
  isAdminAuthenticated,
  onAdminAuthChange,
  isVoteResultsAnnounced,
  setVoteResultsAnnounced,
  onVoteAnnounceChange,
  isAccountLoggedIn,
  getCurrentUserProfile,
  onUserProfileChange,
  logoutAdmin,
  logoutSystem,
  type UserProfile
} from '../utils/adminAuthService';
import { AdminProfileDropdownMenu } from '../components/AdminProfileDropdownMenu';
import {
  type PilotProvinceName
} from '../data/pilotActivitiesSqliteService';
import {
  type HackathonProject,
  getHackathonProjects,
  fetchHackathonProjectsFromDb,
  castCommunityVote,
  hasUserVoted,
  hasUserVotedAny,
  getProposerLevelLabel,
  deleteHackathonProject,
  getUserSubmittedProjects,
  isSeedHackathonProject,
  formatBangkokSubmissionTime,
  getStoredCoffeeGroups,
  getActiveVoterIdentity,
  setActiveVoterByName,
  getAllRegisteredVoterNames,
  getParticipantRegistration,
  type ActiveVoterInfo,
  calculateTop3FinalScores,
  getTop3AiProjectsForVoting,
  type Top3FinalScoreBreakdown
} from '../data/pilotHackathonService';
import '../styles/PilotHackathon.css';

export interface PilotRegionCard {
  province: PilotProvinceName;
  provinceLabel: string;
  regionLabel: string;
  bgImage: string;
  bgImageMobile: string;
}

export const PILOT_REGION_CARDS: PilotRegionCard[] = [
  {
    province: 'อยุธยา',
    provinceLabel: 'โครงการจังหวัดอยุธยา',
    regionLabel: '(ภาคกลาง)',
    bgImage: '/theme/pilot_card_bg_ayutthaya.jpg',
    bgImageMobile: '/theme/pilot_card_bg_ayutthaya_mobile.jpg'
  },
  {
    province: 'อุดรธานี',
    provinceLabel: 'โครงการจังหวัดอุดรธานี',
    regionLabel: '(ภาคตะวันออกเฉียงเหนือ)',
    bgImage: '/theme/pilot_card_bg_udonthani.jpg',
    bgImageMobile: '/theme/pilot_card_bg_udonthani_mobile.jpg'
  },
  {
    province: 'ลำปาง',
    provinceLabel: 'โครงการจังหวัดลำปาง',
    regionLabel: '(ภาคเหนือ)',
    bgImage: '/theme/pilot_card_bg_lampang.jpg',
    bgImageMobile: '/theme/pilot_card_bg_lampang_mobile.jpg'
  },
  {
    province: 'สุราษฎร์ธานี',
    provinceLabel: 'โครงการจังหวัดสุราษฎร์ธานี',
    regionLabel: '(ภาคใต้)',
    bgImage: '/theme/pilot_card_bg_surat.jpg',
    bgImageMobile: '/theme/pilot_card_bg_surat_mobile.jpg'
  }
];

interface PilotHackathonVoteViewProps {
  initialProvince?: PilotProvinceName | null;
  onNavigateToProvince?: (province: PilotProvinceName | null) => void;
  onNavigateHome?: () => void;
  isAdmin?: boolean;
}

export const PilotHackathonVoteView: React.FC<PilotHackathonVoteViewProps> = ({
  initialProvince = 'อยุธยา',
  onNavigateToProvince,
  onNavigateHome,
  isAdmin: propIsAdmin
}) => {
  // Step 1: Province Selection (เริ่มต้นเป็น จ.อยุธยา ตามข้อกำหนด)
  const [selectedProvince, setSelectedProvince] = useState<PilotProvinceName | null>(initialProvince || 'อยุธยา');
  const [selectedVirtue, setSelectedVirtue] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [projectsList, setProjectsList] = useState<HackathonProject[]>(() => getHackathonProjects());
  const [voteFeedback, setVoteFeedback] = useState<string | null>(null);
  const [activeModalProject, setActiveModalProject] = useState<HackathonProject | null>(null);

  // Admin Scope Filter (Admin สามารถเลือกดู Top 3 หรือ ดูทุกโครงการที่ส่งมาเพื่อลบ/จัดการได้)
  const [adminScopeFilter, setAdminScopeFilter] = useState<'top3' | 'all'>('top3');

  // Admin Authentication & User Profile State
  const [isAdminState, setIsAdminState] = useState<boolean>(() => propIsAdmin ?? isAdminAuthenticated());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getCurrentUserProfile());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isAccountLoggedIn());
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  // Active Voter Identity State (ผูกกับชื่อ-นามสกุล 1 คน 1 สิทธิ์)
  const [activeVoter, setActiveVoter] = useState<ActiveVoterInfo>(() => getActiveVoterIdentity());
  const [registeredVoterNames, setRegisteredVoterNames] = useState<string[]>(() => getAllRegisteredVoterNames());
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState<boolean>(false);
  const [quickRegisterName, setQuickRegisterName] = useState<string>('');

  useEffect(() => {
    const updateVoter = () => {
      setActiveVoter(getActiveVoterIdentity());
      setRegisteredVoterNames(getAllRegisteredVoterNames());
      setProjectsList(getHackathonProjects());
    };
    window.addEventListener('mdc_active_voter_changed', updateVoter);
    window.addEventListener('mdc_vote_cast', updateVoter);
    return () => {
      window.removeEventListener('mdc_active_voter_changed', updateVoter);
      window.removeEventListener('mdc_vote_cast', updateVoter);
    };
  }, []);

  useEffect(() => {
    if (propIsAdmin !== undefined) setIsAdminState(propIsAdmin);
    const unsubAuth = onAdminAuthChange((adminStatus) => {
      setIsAdminState(adminStatus);
      setUserProfile(getCurrentUserProfile());
      setIsLoggedIn(isAccountLoggedIn());
    });
    const unsubProfile = onUserProfileChange((profile) => {
      setUserProfile(profile);
      setIsLoggedIn(isAccountLoggedIn());
    });
    const handleLogoutEvent = () => {
      setIsAdminState(false);
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
  }, [propIsAdmin]);

  // Vote Announcement State (Per Province)
  const [isAnnounced, setIsAnnounced] = useState<boolean>(() => isVoteResultsAnnounced(selectedProvince || 'อยุธยา'));
  useEffect(() => {
    setIsAnnounced(isVoteResultsAnnounced(selectedProvince || 'อยุธยา'));
    return onVoteAnnounceChange(() => {
      setIsAnnounced(isVoteResultsAnnounced(selectedProvince || 'อยุธยา'));
    });
  }, [selectedProvince]);

  // Fetch latest projects from SQLite when selected province changes or component mounts
  useEffect(() => {
    let isMounted = true;
    fetchHackathonProjectsFromDb(selectedProvince || undefined).then(() => {
      if (isMounted) {
        setProjectsList(getHackathonProjects());
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedProvince]);

  // Handle Announce & Reopen actions by Admin
  const handleAnnounceResults = () => {
    setVoteResultsAnnounced(true, selectedProvince || 'อยุธยา');
    setIsAnnounced(true);
    setVoteFeedback('🎉 ประกาศผลการตัดสิน Hackathon อย่างเป็นทางการเรียบร้อยแล้ว');
    setTimeout(() => setVoteFeedback(null), 3500);
  };

  const handleReopenVoting = () => {
    setVoteResultsAnnounced(false, selectedProvince || 'อยุธยา');
    setIsAnnounced(false);
    setVoteFeedback('🔄 ปิดการประกาศผล กลับสู่โหมดเปิดรับโหวต 3 โครงการแล้ว');
    setTimeout(() => setVoteFeedback(null), 3500);
  };

  // Handle Delete Project by Admin (สามารถลบโครงการต่างๆ ที่ส่งมาให้ Vote ได้ทุกโครงการ)
  const handleDeleteProject = async (e: React.MouseEvent | null, proj: HackathonProject) => {
    if (e) e.stopPropagation();
    if (!isAdminState) {
      alert('เฉพาะบัญชีผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบโครงการได้');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ คำเตือนสำหรับผู้ดูแลระบบ (Admin):\n\nคุณต้องการลบโครงการ "${proj.projectName}" ออกจากระบบและหน้าโหวตใช่หรือไม่?\n\n(โครงการจะถูกลบออกจากฐานข้อมูล SQLite และรายการโหวตอย่างถาวร)`
    );
    if (!confirmed) return;

    const res = await deleteHackathonProject(proj.id);
    if (res.success) {
      setProjectsList((prev) => prev.filter((p) => p.id !== proj.id));
      if (activeModalProject?.id === proj.id) {
        setActiveModalProject(null);
      }
      setVoteFeedback(`🗑️ ลบโครงการ "${proj.projectName}" ออกจากหน้าโหวตเรียบร้อยแล้ว`);
      setTimeout(() => setVoteFeedback(null), 4000);
    }
  };

  // All projects for the chosen province
  const allProvinceProjects = useMemo(() => {
    if (!selectedProvince) return [];
    return projectsList.filter((p) => p.province === selectedProvince && !p.id.startsWith('precheck-'));
  }, [projectsList, selectedProvince]);

  // 1. คัดเลือกเฉพาะ 3 โครงการที่ได้คะแนน AI สูงสุดจากหน้ากิจกรรมเพื่อเข้าสู่รอบโหวตมวลชน
  const top3ProvinceProjects = useMemo(() => {
    return [...allProvinceProjects]
      .sort((a, b) => (Number(b.aiScore) || 0) - (Number(a.aiScore) || 0))
      .slice(0, 3);
  }, [allProvinceProjects]);

  // โครงการที่เหลือที่ไม่ติด 3 อันดับแรกในรอบ AI Screening
  const remainingAiProjects = useMemo(() => {
    return [...allProvinceProjects]
      .sort((a, b) => (Number(b.aiScore) || 0) - (Number(a.aiScore) || 0))
      .slice(3);
  }, [allProvinceProjects]);

  // 3. ผลการคำนวณคะแนนตัดสินรอบสุดท้าย (AI 100%) เฉพาะ 3 โครงการสุดท้าย
  const top3FinalScores = useMemo(() => {
    return calculateTop3FinalScores(top3ProvinceProjects);
  }, [top3ProvinceProjects]);

  // 2. ประกาศคะแนนแบบกลุ่ม: เรียงลงมาทั้ง 5 กลุ่ม (มงกุฎที่ชนะสำหรับอันดับหนึ่งเท่านั้น)
  const rankedGroups = useMemo(() => {
    const groups = getStoredCoffeeGroups();
    const stats = groups.map((grp) => {
      const projs = allProvinceProjects.filter((p) => {
        if (p.groupKey && p.groupKey === grp.key) return true;
        if (p.groupName && p.groupName.includes(grp.name)) return true;
        return false;
      });

      const projectCount = projs.length;
      const totalVotes = projs.reduce((sum, p) => sum + (p.communityVotes || 0), 0);
      const avgScore = projectCount > 0
        ? Number((projs.reduce((sum, p) => sum + (Number(p.aiScore) || 0), 0) / projectCount).toFixed(2))
        : 0;

      // คะแนนรวมแบบกลุ่ม: คิดจากคะแนนเฉลี่ย AI 100% ของโครงการในกลุ่ม
      const groupScore = avgScore;

      return {
        ...grp,
        projectCount,
        totalVotes,
        avgScore,
        groupScore,
        projects: projs
      };
    });

    // เรียงลงมาทั้ง 5 กลุ่มตามคะแนนเฉลี่ย AI จากสูงสุดไปต่ำสุด
    return stats.sort((a, b) => {
      if (b.groupScore !== a.groupScore) return b.groupScore - a.groupScore;
      if (b.projectCount !== a.projectCount) return b.projectCount - a.projectCount;
      return b.name.localeCompare(a.name);
    });
  }, [allProvinceProjects]);

  // 3. แสดงผลผู้ชนะรายโครงการ: เรียงยาวลงมาตามคะแนนประเมิน AI 100% จนครบทุกโครงการ (มงกุฎสีทองสำหรับอันดับ 1 เท่านั้น)
  const rankedAllProjects = useMemo(() => {
    return [...allProvinceProjects].sort((a, b) => {
      return (Number(b.aiScore) || 0) - (Number(a.aiScore) || 0);
    });
  }, [allProvinceProjects]);

  // Set of IDs of projects submitted by the user
  const userSubmittedProjectIds = useMemo(() => {
    const list = getUserSubmittedProjects(selectedProvince || undefined);
    return new Set(
      list
        .filter((p) => !isSeedHackathonProject(p.id) && !p.id.startsWith('precheck-'))
        .map((p) => p.id)
    );
  }, [selectedProvince]);

  // Handle Voting (ผูกกับตัวตนชื่อ-นามสกุล 1 คน 1 สิทธิ์)
  const handleVote = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const currentVoter = getActiveVoterIdentity();
    const res = castCommunityVote(projectId, currentVoter.id, currentVoter.fullName);
    if (res.success) {
      setProjectsList(getHackathonProjects());
      setActiveVoter(getActiveVoterIdentity());
      setVoteFeedback(res.message);
      setTimeout(() => setVoteFeedback(null), 3500);
    } else {
      setVoteFeedback(res.message);
      setTimeout(() => setVoteFeedback(null), 3500);
    }
  };

  // สลับผู้ใช้สิทธิ์โหวตตามรายชื่อผู้ที่เคยลงทะเบียน
  const handleSwitchVoter = (name: string) => {
    setActiveVoterByName(name);
    const updated = getActiveVoterIdentity();
    setActiveVoter(updated);
    setVoteFeedback(`🔄 สลับผู้ใช้สิทธิ์โหวตเป็น: คุณ ${name}`);
    setTimeout(() => setVoteFeedback(null), 3000);
  };

  // ลงทะเบียนชื่อผู้ร่วมกิจกรรมท่านใหม่เพื่อรับสิทธิ์โหวตใหม่ทันที
  const handleQuickRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickRegisterName.trim();
    if (!trimmed) {
      alert('กรุณากรอกชื่อ - นามสกุล ผู้ร่วมกิจกรรม');
      return;
    }
    setActiveVoterByName(trimmed);
    const updated = getActiveVoterIdentity();
    setActiveVoter(updated);
    setRegisteredVoterNames(getAllRegisteredVoterNames());
    setIsQuickRegisterOpen(false);
    setQuickRegisterName('');
    setVoteFeedback(`✨ เพิ่มชื่อผู้ร่วมกิจกรรมใหม่: คุณ ${trimmed} (ได้รับสิทธิ์โหวต 1 ครั้ง)`);
    setTimeout(() => setVoteFeedback(null), 4000);
  };

  const activeProvinceMeta = selectedProvince
    ? PILOT_REGION_CARDS.find((p) => p.province === selectedProvince)
    : null;

  return (
    <div className="vote-page-root">
      {/* Toast Feedback */}
      {voteFeedback && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#0f172a',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'Kanit, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          <Sparkles size={18} color="#f59e0b" />
          <span>{voteFeedback}</span>
        </div>
      )}

      {/* =================================================================
          CASE 1: PROVINCE SELECTION FIRST (เริ่มต้นโดยให้เลือกจังหวัดก่อน)
          ================================================================= */}
      {!selectedProvince ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Header Bar */}
          <div className="vote-hero-leaderboard">
            <div className="vote-leaderboard-top" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <div className="vote-leaderboard-title">
                <Trophy size={32} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '26px', lineHeight: 1.2 }}>
                    ประกาศคะแนนคุณธรรม 4 ภาค
                  </div>
                </div>
              </div>

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
                      title={isAdminState ? 'ผู้ดูแลระบบ (admin) คลิกเพื่อเปิดเมนู' : `ผู้ใช้งาน: ${userProfile.name} คลิกเพื่อจัดการบัญชีหรือออกจากระบบ`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: isAdminState ? 'linear-gradient(135deg, #059669, #10b981)' : '#ffffff',
                        color: isAdminState ? '#ffffff' : '#2544a8',
                        border: isAdminState ? '1.5px solid #10b981' : '1.5px solid #2544a8',
                        borderRadius: '20px',
                        padding: '5px 14px',
                        fontFamily: "'Kanit', sans-serif",
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: isAdminState ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none'
                      }}
                    >
                      <img
                        src={userProfile.avatarUrl}
                        alt={isAdminState ? 'admin' : userProfile.name}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isAdminState ? '1px solid #ffffff' : '1px solid #2544a8'
                        }}
                      />
                      <span>{isAdminState ? 'admin' : userProfile.name.split(' ')[0]}</span>
                      {isAdminState ? <ShieldCheck size={14} color="#ffffff" /> : <ChevronDown size={13} />}
                    </button>

                    <AdminProfileDropdownMenu
                      isOpen={isProfileMenuOpen}
                      onClose={() => setIsProfileMenuOpen(false)}
                      isAdmin={isAdminState}
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

                {onNavigateToProvince && (
                  <button
                    type="button"
                    className="pilot-banner-enter-btn pilot-goto-activity-btn"
                    style={{
                      background: 'rgba(255, 255, 255, 0.18)',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: '13.5px',
                      fontWeight: 600
                    }}
                    onClick={() => onNavigateToProvince('อยุธยา')}
                    title="ไปที่หน้ากิจกรรมคุณธรรม 4 ภาค (เสนอโครงการ)"
                  >
                    <span>หน้ากิจกรรม 4 ภาค</span>
                    <ArrowRight size={15} />
                  </button>
                )}

                {onNavigateHome && (
                  <button
                    type="button"
                    className="pilot-banner-enter-btn"
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: '13.5px',
                      fontWeight: 600
                    }}
                    onClick={onNavigateHome}
                    title="หน้าแรก"
                  >
                    <Home size={15} />
                    <span>หน้าแรก</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 4 Regional Banner Cards */}
          <div className="pilot-regional-banners-list">
            {PILOT_REGION_CARDS.map((item) => {
              const provProjects = projectsList.filter((p) => p.province === item.province);
              const totalVotes = provProjects.reduce((sum, p) => sum + (p.communityVotes || 0), 0);

              return (
                <div
                  key={item.province}
                  className="pilot-region-banner-card"
                  style={{
                    '--banner-bg-pc': `url(${item.bgImage})`,
                    '--banner-bg-mobile': `url(${item.bgImageMobile})`
                  } as React.CSSProperties}
                  onClick={() => {
                    setSelectedProvince(item.province);
                    setSelectedVirtue('all');
                    setSearchQuery('');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedProvince(item.province);
                      setSelectedVirtue('all');
                      setSearchQuery('');
                    }
                  }}
                >
                  <div className="pilot-banner-text-wrap">
                    <h2 className="pilot-banner-province-title">{item.provinceLabel}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span className="pilot-banner-region-subtitle">{item.regionLabel}</span>
                      <span
                        style={{
                          color: '#fde68a',
                          fontFamily: 'Kanit, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)'
                        }}
                      >
                        • {provProjects.length} โครงการร่วมแข่งขัน ({totalVotes.toLocaleString()} เสียงโหวตสะสม)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="pilot-banner-enter-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProvince(item.province);
                      setSelectedVirtue('all');
                      setSearchQuery('');
                    }}
                  >
                    <span>เข้าสู่โครงการจังหวัด{item.province}</span>
                    <ArrowRight size={15} className="pilot-banner-btn-arrow" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* =================================================================
           CASE 2: PROVINCE PROJECTS VIEW (แสดงโครงการของจังหวัดที่เลือก)
           ================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Dynamic Province Hero Top Banner (ใส่ Banner รูปภาพของจังหวัดตามคำสั่ง) */}
          <div
            className="pilot-top-hero-banner vote-province-hero-banner"
            style={{
              '--hero-bg-pc': `url(${activeProvinceMeta?.bgImage || (selectedProvince === 'อยุธยา' || selectedProvince === 'ระยอง' ? '/theme/pilot_card_bg_ayutthaya.jpg' : selectedProvince === 'สุราษฎร์ธานี' || selectedProvince === 'พังงา' ? '/theme/pilot_card_bg_surat.jpg' : selectedProvince === 'อุดรธานี' || selectedProvince === 'กาฬสินธุ์' || selectedProvince === 'หนองคาย' ? '/theme/pilot_card_bg_udonthani.jpg' : '/theme/pilot_card_bg_lampang.jpg')})`,
              '--hero-bg-mobile': `url(${activeProvinceMeta?.bgImageMobile || (selectedProvince === 'อยุธยา' || selectedProvince === 'ระยอง' ? '/theme/pilot_card_bg_ayutthaya_mobile.jpg' : selectedProvince === 'สุราษฎร์ธานี' || selectedProvince === 'พังงา' ? '/theme/pilot_card_bg_surat_mobile.jpg' : selectedProvince === 'อุดรธานี' || selectedProvince === 'กาฬสินธุ์' || selectedProvince === 'หนองคาย' ? '/theme/pilot_card_bg_udonthani_mobile.jpg' : '/theme/pilot_card_bg_lampang_mobile.jpg')})`,
              position: 'relative'
            } as React.CSSProperties}
          >
            <div className="pilot-hero-top-row">
              <div className="pilot-hero-badges-row">
                <span className="pilot-hero-badge region">{activeProvinceMeta?.regionLabel}</span>
              </div>

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
                      title={isAdminState ? 'ผู้ดูแลระบบ (admin) คลิกเพื่อเปิดเมนู' : `ผู้ใช้งาน: ${userProfile.name} คลิกเพื่อจัดการบัญชีหรือออกจากระบบ`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: isAdminState ? 'linear-gradient(135deg, #059669, #10b981)' : '#ffffff',
                        color: isAdminState ? '#ffffff' : '#2544a8',
                        border: isAdminState ? '1.5px solid #10b981' : '1.5px solid #2544a8',
                        borderRadius: '20px',
                        padding: '5px 14px',
                        fontFamily: "'Kanit', sans-serif",
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: isAdminState ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none'
                      }}
                    >
                      <img
                        src={userProfile.avatarUrl}
                        alt={isAdminState ? 'admin' : userProfile.name}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isAdminState ? '1px solid #ffffff' : '1px solid #2544a8'
                        }}
                      />
                      <span>{isAdminState ? 'admin' : userProfile.name.split(' ')[0]}</span>
                      {isAdminState ? <ShieldCheck size={14} color="#ffffff" /> : <ChevronDown size={13} />}
                    </button>

                    <AdminProfileDropdownMenu
                      isOpen={isProfileMenuOpen}
                      onClose={() => setIsProfileMenuOpen(false)}
                      isAdmin={isAdminState}
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

                {onNavigateToProvince && (
                  <button
                    type="button"
                    className="pilot-hero-back-btn pilot-goto-activity-btn"
                    onClick={() => onNavigateToProvince(selectedProvince || 'อยุธยา')}
                    title="ไปที่หน้ากิจกรรมคุณธรรม (เสนอโครงการ / ขั้นตอนที่ 1-5)"
                    style={{
                      background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)'
                    }}
                  >
                    <span>หน้ากิจกรรม (เสนอโครงการ)</span>
                    <ArrowRight size={16} />
                  </button>
                )}

                <button
                  type="button"
                  className="pilot-hero-back-btn"
                  onClick={() => setSelectedProvince(null)}
                  title="กลับไปเลือกจังหวัดอื่น"
                >
                  <ArrowLeft size={16} />
                  <span>เลือกจังหวัดอื่น</span>
                </button>
              </div>
            </div>

            <div className="pilot-hero-content">
              <h1 className="pilot-hero-title">
                ประกาศคะแนน: {activeProvinceMeta?.provinceLabel || `จังหวัด${selectedProvince}`}
              </h1>

              {/* Summary Stats Badges in Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.25)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(16, 185, 129, 0.5)',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    color: '#6ee7b7',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    fontFamily: 'Kanit, sans-serif',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🏆 ประกาศคะแนนอย่างเป็นทางการ
                </span>
                <span
                  style={{
                    background: 'rgba(15, 23, 42, 0.72)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    fontFamily: 'Kanit, sans-serif',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🤖 ผลคะแนนประเมินจากระบบ AI 100% เต็ม
                </span>
                <span
                  style={{
                    background: 'rgba(15, 23, 42, 0.72)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    color: '#fde68a',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    fontFamily: 'Kanit, sans-serif',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  📊 โครงการทั้งหมด {allProvinceProjects.length} โครงการ
                </span>
              </div>
            </div>
          </div>

          {/* =================================================================
              ANNOUNCEMENT VIEW (แสดงผลคะแนนโดยตรง)
              - บนสุด: ประกาศคะแนนแบบกลุ่ม เรียงลงมาทั้ง 5 กลุ่ม (มงกุฎสำหรับอันดับ 1 เท่านั้น)
              - ถัดไป: แสดงผลผู้ชนะรายโครงการ Ranking (อันดับ 1 มงกุฎสีทอง และทุกโครงการเรียงลงมา)
              ================================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            {/* ADMIN CONTROL BAR (เฉพาะ Admin) */}
            {isAdminState && (
              <div
                className="admin-vote-control-bar"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '16px',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <CheckCircle2 size={22} color="#10b981" />
                  </div>
                  <div>
                    <span style={{ fontFamily: 'Kanit, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                      สถานะ: ประกาศคะแนนอย่างเป็นทางการ (Admin View)
                    </span>
                    <span style={{ display: 'block', fontSize: '12.5px', color: '#94a3b8' }}>
                      ระบบแสดงผลคะแนนประเภทกลุ่ม 5 ทีม และผลการจัดอันดับผู้ชนะรายโครงการ (Ranking) ครบทุกโครงการ
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------
                  SECTION 1: บนสุด ประกาศคะแนนแบบกลุ่ม เรียงลงมาทั้งห้ากลุ่ม มงกุฏที่ชนะสำหรับอันดับหนึ่งเท่านั้น
                  ----------------------------------------------------------------- */}
              <div
                className="group-ranking-section"
                style={{
                  background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                  border: '1.5px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '24px',
                  padding: '28px clamp(20px, 3vw, 32px)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                {/* Section Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                      }}
                    >
                      <Trophy size={26} color="#ffffff" />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f8fafc', fontFamily: 'Kanit, sans-serif' }}>
                        🏆 ประกาศคะแนนแบบกลุ่ม (5 ทีมกาแฟสร้างสรรค์คุณธรรม)
                      </h2>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#94a3b8', fontFamily: 'Kanit, sans-serif' }}>
                        สรุปผลคะแนนรวมของแต่ละกลุ่มกิจกรรม เรียงลำดับจากคะแนนสูงสุดลงมาทั้ง 5 กลุ่ม
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      padding: '5px 14px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: 700,
                      fontFamily: 'Kanit, sans-serif'
                    }}
                  >
                    มงกุฎชนะเลิศสำหรับอันดับ 1
                  </span>
                </div>

                {/* 5 Group Cards List (เรียงลงมาทั้ง 5 กลุ่ม) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {rankedGroups.map((grp, idx) => {
                    const isGroupWinner = idx === 0;
                    const rankNum = idx + 1;

                    return (
                      <div
                        key={grp.key}
                        style={{
                          background: isGroupWinner
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(30, 41, 59, 0.95) 45%, rgba(15, 23, 42, 0.98) 100%)'
                            : 'rgba(30, 41, 59, 0.75)',
                          border: isGroupWinner
                            ? '2px solid rgba(245, 158, 11, 0.85)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '18px',
                          padding: isGroupWinner ? '20px 24px' : '16px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '20px',
                          flexWrap: 'wrap',
                          boxShadow: isGroupWinner
                            ? '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 25px rgba(245, 158, 11, 0.15)'
                            : '0 4px 14px rgba(0, 0, 0, 0.2)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Left: Rank & Crown (มงกุฎที่ชนะสำหรับอันดับหนึ่งเท่านั้น) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '130px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '50px' }}>
                            {isGroupWinner && (
                              <Crown
                                size={30}
                                color="#fbbf24"
                                fill="#f59e0b"
                                style={{ filter: 'drop-shadow(0 3px 10px rgba(245, 158, 11, 0.7))', marginBottom: '2px' }}
                              />
                            )}
                            <span
                              style={{
                                fontFamily: 'Kanit, sans-serif',
                                fontSize: isGroupWinner ? '34px' : '26px',
                                fontWeight: 900,
                                color: isGroupWinner ? '#fbbf24' : '#cbd5e1',
                                lineHeight: 1
                              }}
                            >
                              #{rankNum}
                            </span>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <h4
                                style={{
                                  margin: 0,
                                  fontSize: isGroupWinner ? '20px' : '17.5px',
                                  fontWeight: 800,
                                  color: '#ffffff',
                                  fontFamily: 'Kanit, sans-serif'
                                }}
                              >
                                {grp.name}
                              </h4>
                              {isGroupWinner && (
                                <span
                                  style={{
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    color: '#ffffff',
                                    padding: '2px 10px',
                                    borderRadius: '999px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    fontFamily: 'Kanit, sans-serif'
                                  }}
                                >
                                  🥇 กลุ่มชนะเลิศอันดับ 1
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '12.5px', color: '#94a3b8', fontFamily: 'Kanit, sans-serif' }}>
                              ส่งประกวด {grp.projectCount} โครงการ
                            </span>
                          </div>
                        </div>

                        {/* Right: Scores */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'center', padding: '6px 14px', background: 'rgba(0,0,0,0.35)', borderRadius: '10px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>คะแนนโหวตมวลชน</span>
                            <span style={{ fontSize: '17px', fontWeight: 800, color: '#f43f5e', fontFamily: 'Kanit, sans-serif' }}>
                              {grp.totalVotes.toLocaleString()} <span style={{ fontSize: '11px', color: '#94a3b8' }}>โหวต</span>
                            </span>
                          </div>

                          <div style={{ textAlign: 'center', padding: '6px 14px', background: 'rgba(0,0,0,0.35)', borderRadius: '10px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>คะแนนเฉลี่ย AI</span>
                            <span style={{ fontSize: '17px', fontWeight: 800, color: '#38bdf8', fontFamily: 'Kanit, sans-serif' }}>
                              {grp.avgScore} <span style={{ fontSize: '11px', color: '#94a3b8' }}>/ 100</span>
                            </span>
                          </div>

                          <div
                            style={{
                              textAlign: 'center',
                              padding: '8px 18px',
                              background: isGroupWinner ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                              border: isGroupWinner ? '1.5px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              minWidth: '100px'
                            }}
                          >
                            <span style={{ display: 'block', fontSize: '11px', color: isGroupWinner ? '#fde68a' : '#94a3b8', fontWeight: 700 }}>
                              คะแนนรวมกลุ่ม
                            </span>
                            <span
                              style={{
                                fontSize: '22px',
                                fontWeight: 900,
                                color: isGroupWinner ? '#fbbf24' : '#ffffff',
                                fontFamily: 'Kanit, sans-serif'
                              }}
                            >
                              {grp.groupScore.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* -----------------------------------------------------------------
                   SECTION 2: ผลการตัดสิน 3 โครงการสุดท้าย (AI 100%)
                   เกณฑ์ประเมินโดยระบบ AI ผู้เชี่ยวชาญ 100% เต็ม พร้อมแจกแจงเกณฑ์มาตรฐาน
                   ----------------------------------------------------------------- */}
              <div
                className="project-ranking-section"
                style={{
                  background: 'linear-gradient(145deg, #090e1a 0%, #111827 100%)',
                  border: '1.5px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '24px',
                  padding: '28px clamp(20px, 3vw, 32px)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}
              >
                {/* Section Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.45)'
                      }}
                    >
                      <Trophy size={28} color="#ffffff" />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '23px', fontWeight: 800, color: '#f8fafc', fontFamily: 'Kanit, sans-serif' }}>
                        🏆 ผลการตัดสิน 3 โครงการสุดท้าย (Top 3 Finalists)
                      </h2>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8', fontFamily: 'Kanit, sans-serif' }}>
                        ตัดสินผู้ชนะตามผลคะแนนการประเมินของระบบ AI ผู้เชี่ยวชาญ 100 คะแนนเต็ม (สเกล 0-100)
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      padding: '6px 16px',
                      borderRadius: '999px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      fontFamily: 'Kanit, sans-serif'
                    }}
                  >
                    👑 มงกุฎทองสำหรับอันดับ 1 ชนะเลิศ
                  </span>
                </div>

                {/* OFFICIAL SCORING FORMULA BANNER */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.35) 0%, rgba(15, 23, 42, 0.75) 100%)',
                    border: '1.5px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '18px',
                    padding: '18px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '15px', fontWeight: 800, fontFamily: 'Kanit, sans-serif' }}>
                    <Sparkles size={18} />
                    <span>เกณฑ์การคิดคะแนนตัดสินโดยระบบ AI ผู้เชี่ยวชาญ 100% เต็ม (Official AI 100% Scoring Criteria)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    {/* Dimension 1 */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
                        🎯 1. ความสอดคล้องคุณธรรม & นโยบาย (25%)
                      </div>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                        ความชัดเจนของคุณธรรมเป้าหมายและความสอดคล้องกับบริบทชุมชนและนโยบาย
                      </div>
                    </div>

                    {/* Dimension 2 */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', marginBottom: '4px' }}>
                        ⚙️ 2. ความเป็นไปได้ & ลงมือทำจริง (25%)
                      </div>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                        แผนงาน ขั้นตอนดำเนินงาน ทรัพยากร และกรอบเวลาที่ทำได้จริงในพื้นที่
                      </div>
                    </div>

                    {/* Dimension 3 */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#c084fc', marginBottom: '4px' }}>
                        💡 3. ความคิดสร้างสรรค์ & นวัตกรรม (25%)
                      </div>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                        การใช้เครื่องมือ นวัตกรรมกระบวนการ หรือแนวคิดใหม่เพื่อแก้ปัญหา
                      </div>
                    </div>

                    {/* Dimension 4 */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24', marginBottom: '4px' }}>
                        🤝 4. การมีส่วนร่วม & ความยั่งยืน (25%)
                      </div>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                        การร่วมมือของเครือข่ายชุมชน และผลกระทบเชิงบวกที่ต่อเนื่องในระยะยาว
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOP 3 FINALISTS LIST (3 โครงการสุดท้าย) */}
                {top3FinalScores.length === 0 ? (
                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      borderRadius: '16px',
                      border: '1px dashed rgba(255, 255, 255, 0.2)',
                      padding: '48px 24px',
                      textAlign: 'center',
                      color: '#cbd5e1'
                    }}
                  >
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>📋</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', fontFamily: 'Kanit, sans-serif' }}>
                      ยังไม่มีโครงการที่ผ่านเข้าสู่รอบ 3 โครงการสุดท้ายสำหรับประกาศผล
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontFamily: 'Kanit, sans-serif' }}>
                      ต้องเป็นโครงการที่ผู้คิดโครงการกดปุ่มส่งโครงการ (Submit) เองเท่านั้น จึงจะมีผลคะแนนและรายชื่อปรากฏที่นี่
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {top3FinalScores.map((item, idx) => {
                      const isGold = item.rank === 1;
                      const isSilver = item.rank === 2;
                      const isBronze = item.rank === 3;
                      const bangkokTime = formatBangkokSubmissionTime(item.createdAt);

                      return (
                        <div
                          key={item.projectId}
                          className={`top3-finalist-card rank-${item.rank}`}
                          onClick={() => setActiveModalProject(item.rawProject)}
                          style={{
                            background: isGold
                              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(30, 41, 59, 0.95) 45%, rgba(15, 23, 42, 0.98) 100%)'
                              : isSilver
                              ? 'linear-gradient(135deg, rgba(203, 213, 225, 0.16) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)'
                              : 'linear-gradient(135deg, rgba(217, 119, 6, 0.16) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)',
                            border: isGold
                              ? '2.5px solid rgba(245, 158, 11, 0.9)'
                              : isSilver
                              ? '2px solid rgba(203, 213, 225, 0.75)'
                              : '2px solid rgba(217, 119, 6, 0.75)',
                            borderRadius: isGold ? '24px' : '20px',
                            padding: isGold ? '26px 30px' : '22px 26px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '24px',
                            flexWrap: 'wrap',
                            cursor: 'pointer',
                            boxShadow: isGold
                              ? '0 20px 48px rgba(0, 0, 0, 0.5), 0 0 35px rgba(245, 158, 11, 0.28)'
                              : isSilver
                              ? '0 12px 32px rgba(0, 0, 0, 0.35), 0 0 20px rgba(203, 213, 225, 0.15)'
                              : '0 12px 32px rgba(0, 0, 0, 0.35), 0 0 20px rgba(217, 119, 6, 0.15)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* Column 1: Rank, Medals & Crown */}
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: isGold ? '120px' : '95px',
                              textAlign: 'center',
                              flexShrink: 0
                            }}
                          >
                            {isGold ? (
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                                <Crown
                                  size={46}
                                  color="#fbbf24"
                                  fill="#f59e0b"
                                  style={{ filter: 'drop-shadow(0 4px 14px rgba(245, 158, 11, 0.7))' }}
                                />
                                <Sparkles size={18} color="#fef08a" style={{ position: 'absolute', top: -6, right: -8 }} />
                              </div>
                            ) : isSilver ? (
                              <div style={{ fontSize: '36px', marginBottom: '2px' }}>🥈</div>
                            ) : (
                              <div style={{ fontSize: '36px', marginBottom: '2px' }}>🥉</div>
                            )}

                            <div
                              style={{
                                fontSize: isGold ? '64px' : '44px',
                                fontWeight: 900,
                                lineHeight: 1,
                                fontFamily: 'Kanit, sans-serif',
                                color: isGold ? '#fbbf24' : isSilver ? '#e2e8f0' : '#f59e0b'
                              }}
                            >
                              {item.rank}
                            </div>
                            <span
                              style={{
                                fontSize: isGold ? '13.5px' : '12px',
                                fontWeight: 800,
                                color: isGold ? '#fbbf24' : isSilver ? '#cbd5e1' : '#f59e0b',
                                fontFamily: 'Kanit, sans-serif',
                                marginTop: '4px'
                              }}
                            >
                              {isGold
                                ? 'อันดับ 1 (ชนะเลิศ)'
                                : isSilver
                                ? 'อันดับ 2 (รองชนะเลิศ)'
                                : 'อันดับ 3 (รองชนะเลิศ)'}
                            </span>
                          </div>

                          {/* Column 2: Project Details, Percentages & Calculation Breakdown */}
                          <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  background: isGold
                                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                    : isSilver
                                    ? 'linear-gradient(135deg, #64748b, #475569)'
                                    : 'linear-gradient(135deg, #b45309, #78350f)',
                                  color: '#ffffff',
                                  padding: '4px 14px',
                                  borderRadius: '999px',
                                  fontFamily: 'Kanit, sans-serif',
                                  fontSize: '12.5px',
                                  fontWeight: 800
                                }}
                              >
                                {isGold
                                  ? '🥇 รางวัลชนะเลิศอันดับ 1 (Supreme Gold Champion)'
                                  : isSilver
                                  ? '🥈 รางวัลรองชนะเลิศอันดับ 1 (1st Runner-Up)'
                                  : '🥉 รางวัลรองชนะเลิศอันดับ 2 (2nd Runner-Up)'}
                              </span>
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: '#38bdf8',
                                  background: 'rgba(56, 189, 248, 0.15)',
                                  border: '1px solid rgba(56, 189, 248, 0.3)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontFamily: 'Kanit, sans-serif'
                                }}
                              >
                                ☕ {item.groupName || 'กลุ่มกิจกรรม'}
                              </span>
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#94a3b8',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontFamily: 'Kanit, sans-serif'
                                }}
                              >
                                มิติ: {item.targetMoralVirtue}
                              </span>
                            </div>

                            <h3
                              style={{
                                margin: '2px 0',
                                fontSize: isGold ? '21px' : '18.5px',
                                fontWeight: 800,
                                color: '#ffffff',
                                fontFamily: 'Kanit, sans-serif',
                                lineHeight: 1.35
                              }}
                            >
                              {item.projectName}
                            </h3>

                            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, fontFamily: 'Kanit, sans-serif' }}>
                              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>👤 ผู้เสนอ:</span> {item.proposerName || 'ผู้ร่วมกิจกรรม Hackathon'} &nbsp;|&nbsp;
                              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>🏛️ สังกัด:</span> {item.proposerAgency} &nbsp;|&nbsp;
                              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>📍 พื้นที่:</span> {item.targetArea}
                            </div>

                            {/* Pure AI 100% Score Progress Bar */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', fontFamily: 'Kanit, sans-serif' }}>
                                <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                                  🤖 คะแนนประเมิน AI (100% เต็ม): <strong>{item.finalScore.toFixed(2)} / 100.00 คะแนน ({item.finalPercent})</strong>
                                </span>
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                                  เกณฑ์รูบริกมาตรฐาน 4 มิติ
                                </span>
                              </div>
                              <div
                                style={{
                                  width: '100%',
                                  height: '10px',
                                  background: 'rgba(0,0,0,0.4)',
                                  borderRadius: '999px',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  border: '1px solid rgba(255,255,255,0.1)'
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.min(100, Math.max(0, item.finalScore))}%`,
                                    background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                                    transition: 'width 0.5s ease',
                                    borderRadius: '999px'
                                  }}
                                  title={`AI Score: ${item.finalPercent}`}
                                />
                              </div>
                            </div>

                            {/* STEP-BY-STEP CALCULATION BREAKDOWN BOX */}
                            <div
                              style={{
                                background: 'rgba(15, 23, 42, 0.75)',
                                border: '1px solid rgba(56, 189, 248, 0.28)',
                                borderRadius: '14px',
                                padding: '14px 18px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                fontSize: '13px',
                                fontFamily: 'Kanit, sans-serif',
                                color: '#cbd5e1'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#38bdf8' }}>
                                <span>🤖</span>
                                <span>รายละเอียดการประเมินคะแนนโดยระบบ AI ผู้เชี่ยวชาญ 100% เต็ม:</span>
                              </div>
                              <div style={{ lineHeight: 1.5 }}>
                                <strong style={{ color: '#93c5fd' }}>• เกณฑ์การประเมิน:</strong>{' '}
                                <span>{item.calculationSteps.aiCalculation}</span>
                              </div>
                              <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.16)', paddingTop: '6px', fontWeight: 800, color: '#fef08a' }}>
                                <strong>🏆 สรุปคะแนนตัดสิน:</strong>{' '}
                                <span>{item.calculationSteps.totalCalculation}</span>
                              </div>
                            </div>
                          </div>

                          {/* Column 3: Scores Summary & Action Button */}
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              minWidth: '220px',
                              flexShrink: 0
                            }}
                          >
                            {/* Final Composite Score Box */}
                            <div
                              style={{
                                background: isGold
                                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(0, 0, 0, 0.6) 100%)'
                                  : 'rgba(0, 0, 0, 0.55)',
                                border: isGold ? '1.5px solid rgba(245, 158, 11, 0.65)' : '1px solid rgba(255, 255, 255, 0.18)',
                                borderRadius: '16px',
                                padding: '14px 18px',
                                textAlign: 'center',
                                boxShadow: isGold ? '0 6px 18px rgba(245, 158, 11, 0.25)' : 'none'
                              }}
                            >
                              <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: isGold ? '#fbbf24' : '#94a3b8', textTransform: 'uppercase' }}>
                                คะแนนตัดสินสุดท้าย (Final Score)
                              </span>
                              <div style={{ fontSize: '38px', fontWeight: 900, color: isGold ? '#fef08a' : '#ffffff', fontFamily: 'Kanit, sans-serif', lineHeight: 1.1, margin: '4px 0' }}>
                                {item.finalPercent}
                              </div>
                              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                                ({item.finalScore.toFixed(2)} / 100.00 คะแนน)
                              </span>
                            </div>

                            {/* Scores Breakdown Summary */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(0, 0, 0, 0.45)',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              <div>
                                <span style={{ display: 'block', fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>คะแนนจากระบบ AI</span>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>ประเมิน 100% เต็ม</span>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8', fontFamily: 'Kanit, sans-serif' }}>
                                  {item.finalScore.toFixed(2)}
                                </span>
                                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>/ 100</span>
                              </div>
                            </div>

                            {/* Bangkok Submission Time */}
                            <div
                              style={{
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                padding: '6px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                                fontSize: '11.5px',
                                color: '#94a3b8'
                              }}
                            >
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} color="#38bdf8" />
                                <span>เวลาส่ง:</span>
                              </div>
                              <span style={{ fontWeight: 800, color: '#f8fafc', fontFamily: 'Kanit, monospace' }}>
                                {bangkokTime.timeOnly}
                              </span>
                            </div>

                            {/* View Full Proposal Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveModalProject(item.rawProject);
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: isGold
                                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(217, 119, 6, 0.35))'
                                  : 'rgba(255, 255, 255, 0.08)',
                                border: isGold ? '1.5px solid rgba(245, 158, 11, 0.6)' : '1px solid rgba(255, 255, 255, 0.18)',
                                borderRadius: '12px',
                                color: '#ffffff',
                                fontFamily: 'Kanit, sans-serif',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <span>ดูข้อเสนอโครงการ</span>
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* REMAINING PROJECTS SECTION (ถ้ามีโครงการอื่น ๆ ในจังหวัด) */}
                {remainingAiProjects.length > 0 && (
                  <div
                    style={{
                      marginTop: '8px',
                      background: 'rgba(15, 23, 42, 0.55)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '18px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', fontFamily: 'Kanit, sans-serif' }}>
                        📋 โครงการอื่น ๆ ที่ผ่านการตรวจประเมินรอบแรก (AI Screening) ในจังหวัดนี้ ({remainingAiProjects.length} โครงการ)
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        (เฉพาะ 3 โครงการที่ได้คะแนน AI สูงสุดเท่านั้นที่ได้เข้าสู่รอบตัดสินการโหวต)
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {remainingAiProjects.map((p, rIdx) => (
                        <div
                          key={p.id}
                          onClick={() => setActiveModalProject(p)}
                          style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', minWidth: '32px' }}>
                              #{rIdx + 4}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'Kanit, sans-serif' }}>
                              {p.projectName}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                              ☕ {p.groupName}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                              คะแนน AI: <strong style={{ color: '#38bdf8' }}>{p.aiScore}</strong>
                            </span>
                            <Eye size={14} color="#94a3b8" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      )}


{/* =================================================================
          PROJECT DETAILS MODAL (Larger Dialog + 20% Bigger Fonts)
          ================================================================= */}
      {activeModalProject && (
        <div
          className="vote-project-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setActiveModalProject(null)}
        >
          <div
            className="vote-project-modal-card"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px 42px',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              position: 'relative',
              border: '1.5px solid #e2e8f0',
              fontFamily: 'Kanit, sans-serif'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="vote-modal-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '18px' }}>
              <div>
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1.5px solid #bfdbfe',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: '15.5px',
                    fontWeight: 700
                  }}
                >
                  โครงการจังหวัด{activeModalProject.province} • คุณธรรมด้าน: {activeModalProject.targetMoralVirtue}
                </span>
                <h3
                  className="vote-modal-title"
                  style={{
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: '25px',
                    fontWeight: 900,
                    color: '#0f172a',
                    margin: '12px 0 0 0',
                    lineHeight: 1.3
                  }}
                >
                  {activeModalProject.projectName}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: '#475569', marginTop: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <User size={15} color="#2563eb" />
                    ผู้ส่ง: <strong style={{ color: '#0f172a' }}>{activeModalProject.proposerName || 'ผู้ร่วมกิจกรรม Hackathon'}</strong>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={14} color="#64748b" />
                    ตำแหน่ง: <strong style={{ color: '#1e293b' }}>{activeModalProject.proposerPosition || getProposerLevelLabel(activeModalProject.proposerLevel)}</strong>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Building2 size={14} color="#64748b" />
                    หน่วยงาน: <strong style={{ color: '#1e293b' }}>{activeModalProject.proposerAgency}</strong>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0369a1', fontWeight: 600 }}>
                    <Clock size={14} color="#0284c7" />
                    เวลาที่ส่ง: <strong style={{ color: '#0c4a6e' }}>{formatBangkokSubmissionTime(activeModalProject.createdAt).fullBangkok}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalProject(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease'
                }}
                title="ปิดหน้าต่าง"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Fonts increased by 20% */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                fontSize: '16.5px',
                color: '#334155',
                lineHeight: 1.7,
                fontFamily: 'Kanit, sans-serif'
              }}
            >
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a', fontSize: '17px' }}>มิติคุณธรรมเป้าหมาย:</strong>{' '}
                <span style={{ color: '#1d4ed8', fontWeight: 700 }}>{activeModalProject.targetMoralVirtue}</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a', fontSize: '17px' }}>กลุ่มเป้าหมายและพื้นที่ดำเนินการ:</strong>{' '}
                <span>{activeModalProject.targetAudience} ({activeModalProject.targetArea})</span>
              </div>

              <div>
                <strong style={{ color: '#0f172a', fontSize: '17.5px' }}>แนวคิดและกิจกรรมปรับเปลี่ยนพฤติกรรม:</strong>
                <p style={{ margin: '6px 0 0 0', color: '#475569', fontSize: '16.5px', lineHeight: 1.7 }}>
                  {activeModalProject.proposalDetails}
                </p>
              </div>

              <div>
                <strong style={{ color: '#0f172a', fontSize: '17.5px' }}>กลไกการมีส่วนร่วม 3 ระดับ (บวร / บรม):</strong>
                <p style={{ margin: '6px 0 0 0', color: '#475569', fontSize: '16.5px', lineHeight: 1.7 }}>
                  {activeModalProject.activityPlan}
                </p>
              </div>

              {activeModalProject.behavioralKpi && (
                <div style={{ background: '#ecfdf5', padding: '16px 20px', borderRadius: '14px', border: '1.5px solid #a7f3d0' }}>
                  <strong style={{ color: '#065f46', fontSize: '17.5px' }}>ผลลัพธ์ที่คาดหวัง:</strong>
                  <p style={{ margin: '6px 0 0 0', color: '#047857', fontWeight: 600, fontSize: '16.5px', lineHeight: 1.7 }}>
                    {activeModalProject.behavioralKpi}
                  </p>
                </div>
              )}
            </div>

            {/* AI Feedback Box - 20% Bigger Fonts */}
            <div
              className="project-feedback-box"
              style={{
                fontSize: '16px',
                padding: '16px 20px',
                borderRadius: '14px',
                lineHeight: 1.65
              }}
            >
              <strong style={{ fontSize: '17px', color: '#92400e', display: 'block', marginBottom: '6px' }}>
                🤖 ข้อเสนอแนะในการปรับปรุงจากระบบ AI:
              </strong>
              <p style={{ margin: 0, fontSize: '16px' }}>{activeModalProject.aiRecommendations}</p>
            </div>

            {/* Modal Footer with Vote Button */}
            <div
              className="vote-modal-footer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                borderTop: '1.5px solid #e2e8f0',
                paddingTop: '20px',
                marginTop: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Kanit, sans-serif', fontSize: '17px', color: '#475569' }}>
                  คะแนน AI: <strong style={{ color: '#2563eb' }}>{activeModalProject.aiScore} / 100</strong> | คะแนนโหวตชุมชน: <strong style={{ color: '#e11d48' }}>{activeModalProject.communityVotes.toLocaleString()} โหวต</strong>
                </span>

                {isAdminState && (
                  <button
                    type="button"
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#dc2626',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontFamily: 'Kanit, sans-serif',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => handleDeleteProject(null, activeModalProject)}
                    title="ลบโครงการนี้ออกจากระบบและหน้าโหวต (เฉพาะ Admin)"
                  >
                    <Trash2 size={14} />
                    <span>ลบโครงการนี้ (Admin)</span>
                  </button>
                )}
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: '1px solid #86efac',
                  color: '#15803d',
                  padding: '10px 22px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 size={18} color="#16a34a" />
                <span>ประกาศคะแนนอย่างเป็นทางการ</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
