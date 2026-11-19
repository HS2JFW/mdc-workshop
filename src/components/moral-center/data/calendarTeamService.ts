import { loadPmsUsers, type PmsUserPermission, PMS_ROLE_META } from './pmsDataService';

export interface CalendarTeamMember {
  userId: string;
  userName: string;
  position: string;
  department: string;
  role: string;
  roleLabel?: string;
  roleBg?: string;
  roleColor?: string;
  avatarBg?: string;
}

export interface CalendarTeam {
  id: string;
  name: string;
  description?: string;
  members: CalendarTeamMember[];
  createdAt: string;
}

const LOCAL_STORAGE_CALENDAR_TEAMS_KEY = 'moral_calendar_teams_v1';
const LOCAL_STORAGE_ACTIVE_TEAM_ID_KEY = 'moral_active_calendar_team_id_v1';

const AVATAR_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#0891b2', // Cyan
  '#db2777'  // Pink
];

export function getAvatarColorForUser(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function pmsUserToTeamMember(user: PmsUserPermission): CalendarTeamMember {
  const roleMeta = PMS_ROLE_META[user.role as keyof typeof PMS_ROLE_META];
  return {
    userId: user.userId,
    userName: user.userName,
    position: user.position || 'เจ้าหน้าที่',
    department: user.department || 'ศูนย์คุณธรรม',
    role: user.role,
    roleLabel: roleMeta ? roleMeta.label.split(' (')[0] : user.role,
    roleBg: roleMeta ? roleMeta.badgeBg : '#eff6ff',
    roleColor: roleMeta ? roleMeta.color : '#1e40af',
    avatarBg: getAvatarColorForUser(user.userName)
  };
}

export const INITIAL_CALENDAR_TEAMS: CalendarTeam[] = [
  {
    id: 'team-core-1',
    name: 'ทีมขับเคลื่อนยุทธศาสตร์และติดตามโครงการ',
    description: 'คณะทำงานติดตามความก้าวหน้าโครงการคุณธรรมและประเมินผลตัวชี้วัด',
    createdAt: '2026-07-01',
    members: [
      {
        userId: 'usr-001',
        userName: 'ดร.ณพิชญา เทพรอด',
        position: 'หัวหน้ากลุ่มงานอาวุโสฯ / ผู้ทรงคุณวุฒิ',
        department: 'กลุ่มงานนโยบายและยุทธศาสตร์',
        role: 'reviewer',
        roleLabel: 'ผู้ตรวจสอบ',
        roleBg: '#eff6ff',
        roleColor: '#1d4ed8',
        avatarBg: '#2563eb'
      },
      {
        userId: 'usr-002',
        userName: 'รศ.นพ.สุริยเดว ทรีปาตี',
        position: 'ผู้อำนวยการศูนย์คุณธรรม (ผู้บริหารเจ้าภาพ)',
        department: 'สำนักผู้อำนวยการ',
        role: 'executive',
        roleLabel: 'ผู้บริหารเจ้าภาพ',
        roleBg: '#fef3c7',
        roleColor: '#b45309',
        avatarBg: '#d97706'
      },
      {
        userId: 'usr-003',
        userName: 'นายสมชาย ประเมินผลดี',
        position: 'ประธานกรรมการตรวจรับและรับรองผล (Approver)',
        department: 'คณะกรรมการตรวจรับและประเมินผล',
        role: 'approver',
        roleLabel: 'ผู้มีอำนาจรับรองผล',
        roleBg: '#ecfdf5',
        roleColor: '#047857',
        avatarBg: '#059669'
      },
      {
        userId: 'usr-004',
        userName: 'นางสาวกนกพร พัฒนาคุณธรรม',
        position: 'เจ้าหน้าที่บริหารโครงการอาวุโส (Data Owner)',
        department: 'กลุ่มงานส่งเสริมคุณธรรมเชิงพื้นที่',
        role: 'data_owner',
        roleLabel: 'เจ้าของข้อมูล',
        roleBg: '#f5f3ff',
        roleColor: '#6d28d9',
        avatarBg: '#7c3aed'
      },
      {
        userId: 'usr-005',
        userName: 'นายประสิทธิ์ สังเกตการณ์',
        position: 'ผู้สังเกตการณ์ภาคประชาชน (Viewer)',
        department: 'เครือข่ายสมัชชาคุณธรรมแห่งชาติ',
        role: 'viewer',
        roleLabel: 'ผู้มีสิทธิ์ดู',
        roleBg: '#f1f5f9',
        roleColor: '#475569',
        avatarBg: '#0891b2'
      }
    ]
  }
];

export function emitCalendarTeamsUpdated(): void {
  window.dispatchEvent(new CustomEvent('moral-calendar-teams-updated'));
}

export function loadCalendarTeams(): CalendarTeam[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CALENDAR_TEAMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load calendar teams:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_CALENDAR_TEAMS_KEY, JSON.stringify(INITIAL_CALENDAR_TEAMS));
  return INITIAL_CALENDAR_TEAMS;
}

export function saveCalendarTeams(teams: CalendarTeam[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CALENDAR_TEAMS_KEY, JSON.stringify(teams));
    emitCalendarTeamsUpdated();
  } catch (e) {
    console.warn('Failed to save calendar teams:', e);
  }
}

export function getActiveCalendarTeam(): CalendarTeam {
  const teams = loadCalendarTeams();
  const activeId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_TEAM_ID_KEY);
  if (activeId) {
    const found = teams.find((t) => t.id === activeId);
    if (found) return found;
  }
  return teams[0] || INITIAL_CALENDAR_TEAMS[0];
}

export function setActiveCalendarTeam(teamId: string): CalendarTeam {
  localStorage.setItem(LOCAL_STORAGE_ACTIVE_TEAM_ID_KEY, teamId);
  const active = getActiveCalendarTeam();
  emitCalendarTeamsUpdated();
  return active;
}

export function createCalendarTeam(name: string, description?: string, initialMembers?: CalendarTeamMember[]): CalendarTeam {
  const teams = loadCalendarTeams();
  const newTeam: CalendarTeam = {
    id: `team-${Date.now()}`,
    name: name.trim() || 'ทีมขับเคลื่อนคุณธรรมใหม่',
    description: description?.trim() || '',
    members: initialMembers || [],
    createdAt: new Date().toISOString().slice(0, 10)
  };
  const updated = [newTeam, ...teams];
  saveCalendarTeams(updated);
  setActiveCalendarTeam(newTeam.id);
  return newTeam;
}

export function addMemberToActiveTeam(member: CalendarTeamMember): CalendarTeam {
  const teams = loadCalendarTeams();
  const active = getActiveCalendarTeam();
  const exists = active.members.some((m) => m.userId === member.userId);
  if (exists) return active;

  const updatedMembers = [...active.members, member];
  const updatedTeams = teams.map((t) => (t.id === active.id ? { ...t, members: updatedMembers } : t));
  saveCalendarTeams(updatedTeams);
  return { ...active, members: updatedMembers };
}

export function removeMemberFromActiveTeam(userId: string): CalendarTeam {
  const teams = loadCalendarTeams();
  const active = getActiveCalendarTeam();
  const updatedMembers = active.members.filter((m) => m.userId !== userId);
  const updatedTeams = teams.map((t) => (t.id === active.id ? { ...t, members: updatedMembers } : t));
  saveCalendarTeams(updatedTeams);
  return { ...active, members: updatedMembers };
}

/**
 * Search available users from PMS Users Directory who are not yet in the specified team
 */
export function searchAvailableUsers(query: string, currentMemberIds: string[] = []): CalendarTeamMember[] {
  const pmsUsers = loadPmsUsers();
  const lowerQ = query.trim().toLowerCase();

  return pmsUsers
    .filter((u) => {
      if (currentMemberIds.includes(u.userId)) return false;
      if (!lowerQ) return true;
      return (
        u.userName.toLowerCase().includes(lowerQ) ||
        (u.position && u.position.toLowerCase().includes(lowerQ)) ||
        (u.department && u.department.toLowerCase().includes(lowerQ)) ||
        u.role.toLowerCase().includes(lowerQ)
      );
    })
    .map(pmsUserToTeamMember);
}
