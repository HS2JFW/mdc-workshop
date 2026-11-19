// ----------------------------------------------------------------------------
// Admin Authentication, User Profiles & Voting Announcement Service
// ----------------------------------------------------------------------------

const ADMIN_STORAGE_KEY = 'mdc_admin_authenticated';
const USER_PROFILE_STORAGE_KEY = 'mdc_current_user_profile';
const ANNOUNCE_STORAGE_KEY_PREFIX = 'mdc_vote_results_announced_';
const AUTH_EVENT_NAME = 'mdc_admin_auth_changed';
const PROFILE_EVENT_NAME = 'mdc_user_profile_changed';
const ANNOUNCE_EVENT_NAME = 'mdc_vote_announced_changed';

export type UserRoleTier = 'A1' | 'A2' | 'A3';

export interface UserProfile {
  name: string;
  role: 'admin' | 'user';
  title?: string;
  avatarUrl: string;
  isAdmin: boolean;
  tier?: UserRoleTier;
  roleName?: string;
}

export const DEFAULT_REGULAR_USER: UserProfile = {
  name: 'ดร.สมชาย สุขเกษม',
  role: 'user',
  title: 'ผู้แทนภาคประชาชน / เครือข่ายสมัชชาคุณธรรม (ระดับประชาชนทั่วไป)',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
  isAdmin: false,
  tier: 'A3',
  roleName: 'ระดับประชาชนทั่วไป'
};

export const ADMIN_USER_PROFILE: UserProfile = {
  name: 'admin',
  role: 'admin',
  title: 'ผู้ดูแลระบบศูนย์คุณธรรม / ผู้บริหารระดับสูง (ระดับนโยบาย)',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
  isAdmin: true,
  tier: 'A1',
  roleName: 'ระดับนโยบาย'
};

export interface DummyAccount {
  username: string;
  password: string;
  profile: UserProfile;
}

export const DUMMY_ACCOUNTS: Record<string, DummyAccount> = {
  a1: {
    username: 'a1',
    password: 'test',
    profile: {
      name: 'ดร.อนันต์ วัฒนศิลป์ (a1)',
      role: 'user',
      title: 'ผู้แทนเครือข่ายองค์กรคุณธรรม (ระดับนโยบาย - Tier A1)',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      isAdmin: false,
      tier: 'A1',
      roleName: 'ระดับนโยบาย'
    }
  },
  a2: {
    username: 'a2',
    password: 'test',
    profile: {
      name: 'พญ.กานดา สุวรรณเวช (a2)',
      role: 'user',
      title: 'ผู้เชี่ยวชาญด้านคุณธรรมสาธารณสุข (ระดับผู้ปฏิบัติงาน - Tier A2)',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
      isAdmin: false,
      tier: 'A2',
      roleName: 'ระดับผู้ปฏิบัติงาน'
    }
  },
  a3: {
    username: 'a3',
    password: 'test',
    profile: {
      name: 'อ.วิชัย เกียรติภูมิ (a3)',
      role: 'user',
      title: 'นักวิชาการส่งเสริมคุณธรรมเยาวชน (ระดับประชาชนทั่วไป - Tier A3)',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
      isAdmin: false,
      tier: 'A3',
      roleName: 'ระดับประชาชนทั่วไป'
    }
  }
};

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function getCurrentUserProfile(): UserProfile {
  if (isAdminAuthenticated()) {
    return { ...ADMIN_USER_PROFILE, name: 'admin', isAdmin: true, tier: 'A1', roleName: 'ระดับนโยบาย' };
  }

  if (typeof window === 'undefined') return DEFAULT_REGULAR_USER;

  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cu = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('current_user') : '') || '';
      let tier: UserRoleTier = parsed.tier || (cu === 'a1' ? 'A1' : cu === 'a2' ? 'A2' : cu === 'a3' ? 'A3' : 'A3');
      let roleName = parsed.roleName || (tier === 'A1' ? 'ระดับนโยบาย' : tier === 'A2' ? 'ระดับผู้ปฏิบัติงาน' : 'ระดับประชาชนทั่วไป');

      return {
        name: parsed.name || DEFAULT_REGULAR_USER.name,
        role: 'user',
        title: parsed.title || DEFAULT_REGULAR_USER.title,
        avatarUrl: parsed.avatarUrl || DEFAULT_REGULAR_USER.avatarUrl,
        isAdmin: false,
        tier,
        roleName
      };
    }
  } catch {}

  return DEFAULT_REGULAR_USER;
}

export function getCurrentUserTier(): UserRoleTier {
  const profile = getCurrentUserProfile();
  if (profile.tier) return profile.tier;
  if (profile.isAdmin) return 'A1';
  if (typeof sessionStorage !== 'undefined') {
    const cu = sessionStorage.getItem('current_user');
    if (cu === 'a1' || cu === 'admin') return 'A1';
    if (cu === 'a2') return 'A2';
    if (cu === 'a3') return 'A3';
  }
  return 'A3';
}

export function saveRegularUserProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getCurrentUserProfile();
  const updated: UserProfile = {
    ...current,
    ...profile,
    role: 'user',
    isAdmin: false
  };

  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: updated }));
  } catch {}

  return updated;
}

export function onUserProfileChange(callback: (profile: UserProfile) => void): () => void {
  const handler = () => {
    callback(getCurrentUserProfile());
  };
  window.addEventListener(PROFILE_EVENT_NAME, handler);
  window.addEventListener(AUTH_EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(PROFILE_EVENT_NAME, handler);
    window.removeEventListener(AUTH_EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

export interface AuthResult {
  success: boolean;
  isAdmin: boolean;
  profile: UserProfile;
  message: string;
}

export function authenticateAccount(user: string, pass: string): AuthResult {
  const cleanUser = (user || '').trim().toLowerCase();
  const cleanPass = (pass || '').trim();

  // 1. Admin login
  if (cleanUser === 'admin' && (cleanPass === 'moral' || cleanPass === 'admin1234' || cleanPass === 'admin')) {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      sessionStorage.setItem('current_user', 'admin');
      sessionStorage.setItem('is_authenticated', 'true');
      window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { isAdmin: true } }));
      window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: ADMIN_USER_PROFILE }));
    } catch {}
    return {
      success: true,
      isAdmin: true,
      profile: ADMIN_USER_PROFILE,
      message: 'เข้าสู่ระบบผู้ดูแลระบบ (Admin) สำเร็จเรียบร้อย'
    };
  }

  // 2. Dummy user login (a1, a2, a3 with password 'test')
  if (DUMMY_ACCOUNTS[cleanUser] && (cleanPass === DUMMY_ACCOUNTS[cleanUser].password || cleanPass === 'test')) {
    const dummy = DUMMY_ACCOUNTS[cleanUser];
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(dummy.profile));
      sessionStorage.setItem('current_user', cleanUser);
      sessionStorage.setItem('is_authenticated', 'true');
      window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { isAdmin: false } }));
      window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: dummy.profile }));
    } catch {}
    return {
      success: true,
      isAdmin: false,
      profile: dummy.profile,
      message: `เข้าสู่ระบบสำเร็จ: ${dummy.profile.name}`
    };
  }

  // 3. Legacy user01
  if (cleanUser === 'user01' && (cleanPass === 'admin' || cleanPass === 'user01')) {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_REGULAR_USER));
      sessionStorage.setItem('current_user', cleanUser);
      sessionStorage.setItem('is_authenticated', 'true');
      window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { isAdmin: false } }));
      window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: DEFAULT_REGULAR_USER }));
    } catch {}
    return {
      success: true,
      isAdmin: false,
      profile: DEFAULT_REGULAR_USER,
      message: `เข้าสู่ระบบสำเร็จ: ${DEFAULT_REGULAR_USER.name}`
    };
  }

  return {
    success: false,
    isAdmin: false,
    profile: DEFAULT_REGULAR_USER,
    message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Username หรือ Password ผิด)'
  };
}

export function loginAdmin(user: string, pass: string): { success: boolean; message: string } {
  const result = authenticateAccount(user, pass);
  return {
    success: result.success,
    message: result.message
  };
}

export function logoutAdmin(): void {
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { isAdmin: false } }));
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: getCurrentUserProfile() }));
  } catch {}
}

export function isAccountLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const isAuth = sessionStorage.getItem('is_authenticated');
    if (isAuth === 'false') return false;
    const isAdmin = localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
    if (isAdmin) return true;
    const currentUser = sessionStorage.getItem('current_user');
    if (currentUser && isAuth === 'true') return true;
    if (isAuth === 'true') return true;
    return false;
  } catch {
    return false;
  }
}

export function logoutSystem(): void {
  try {
    sessionStorage.setItem('is_authenticated', 'false');
    sessionStorage.removeItem('current_user');
    sessionStorage.removeItem('user_profile');
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { isAdmin: false } }));
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: DEFAULT_REGULAR_USER }));
    window.dispatchEvent(new CustomEvent('mdc_system_logout'));
  } catch (err) {
    console.error('Logout error:', err);
  }
}

export function onAdminAuthChange(callback: (isAdmin: boolean) => void): () => void {
  const handler = () => {
    callback(isAdminAuthenticated());
  };
  window.addEventListener(AUTH_EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

// ----------------------------------------------------------------------------
// Vote Announcement State (Per province or global)
// ----------------------------------------------------------------------------

export function isVoteResultsAnnounced(province?: string | null): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = province ? `${ANNOUNCE_STORAGE_KEY_PREFIX}${province}` : `${ANNOUNCE_STORAGE_KEY_PREFIX}global`;
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

export function setVoteResultsAnnounced(announced: boolean, province?: string | null): void {
  try {
    const key = province ? `${ANNOUNCE_STORAGE_KEY_PREFIX}${province}` : `${ANNOUNCE_STORAGE_KEY_PREFIX}global`;
    if (announced) {
      localStorage.setItem(key, 'true');
    } else {
      localStorage.removeItem(key);
    }
    window.dispatchEvent(new CustomEvent(ANNOUNCE_EVENT_NAME, { detail: { province, announced } }));
  } catch {}
}

export function onVoteAnnounceChange(callback: (detail?: { province?: string; announced?: boolean }) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent;
    callback(customEvent.detail);
  };
  window.addEventListener(ANNOUNCE_EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(ANNOUNCE_EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}
