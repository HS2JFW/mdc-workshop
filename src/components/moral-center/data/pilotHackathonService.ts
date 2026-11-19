// ============================================================================
// PILOT HACKATHON SERVICE & STATE MANAGEMENT
// สำหรับการจัดกิจกรรม Hackathon 4 ภาค (3 กลุ่มกาแฟ x 5 โครงการ = 15 โครงการ)
// พร้อมระบบ AI Scoring, AI Improvement Feedback และ Community Voting
// ============================================================================

import { type PilotProvinceName } from './pilotActivitiesSqliteService';
import { detectProvinceFromText } from './pilotGeographyService';
import {
  UNIVERSAL_DEFAULT_RUBRIC,
  type UniversalRubricDimension
} from './pilotCriteriaService';

export type CoffeeGroupKey = 'mocha' | 'cappuccino' | 'americano' | 'espresso' | 'latte' | string;

export interface CoffeeGroupMeta {
  key: string;
  name: string; // ชื่อกลุ่ม
  bgImage: string;
  themeColor: string;
  accentBg: string;
  isCustom?: boolean;
}

// ----------------------------------------------------------------------------
// 10 COFFEE BACKGROUND PRESETS
// ครอบคลุม: ร้านกาแฟ, เมล็ดกาแฟ, อุปกรณ์ทำกาแฟ, คนกินกาแฟ, เครื่องชง, ลาเต้อาร์ต, ดริป, กาแฟเย็น, บาริสต้า, ไร่กาแฟ
// ----------------------------------------------------------------------------
export interface CoffeeBgPreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const COFFEE_BACKGROUND_PRESETS: CoffeeBgPreset[] = [
  {
    id: 'preset_cafe',
    name: 'ร้านกาแฟบรรยากาศอบอุ่น',
    category: 'ร้านกาแฟ',
    url: '/theme/coffee_preset_01_cafe.jpg'
  },
  {
    id: 'preset_beans',
    name: 'เมล็ดกาแฟคั่วเข้มพรีเมียม',
    category: 'เมล็ดกาแฟ',
    url: '/theme/coffee_preset_02_beans.jpg'
  },
  {
    id: 'preset_equipment',
    name: 'ชุดอุปกรณ์ดริปกาแฟ Chemex',
    category: 'อุปกรณ์ทำกาแฟ',
    url: '/theme/coffee_preset_03_equipment.jpg'
  },
  {
    id: 'preset_people',
    name: 'คนนั่งดื่มกาแฟในคาเฟ่',
    category: 'คนกินกาแฟ',
    url: '/theme/coffee_preset_04_people.jpg'
  },
  {
    id: 'preset_espresso',
    name: 'เครื่องชงกาแฟเอสเพรสโซ & สกัดช็อต',
    category: 'เครื่องชง & ช็อต',
    url: '/theme/coffee_preset_05_espresso.jpg'
  },
  {
    id: 'preset_latte',
    name: 'ถ้วยลาเต้อาร์ตละมุนหัวใจ',
    category: 'ลาเต้อาร์ต',
    url: '/theme/coffee_preset_06_latte.jpg'
  },
  {
    id: 'preset_pourover',
    name: 'กาต้มน้ำดริปคอยาว & สโลว์บาร์',
    category: 'อุปกรณ์ดริป',
    url: '/theme/coffee_preset_07_pourover.jpg'
  },
  {
    id: 'preset_coldbrew',
    name: 'กาแฟสกัดเย็น Cold Brew ใส่น้ำแข็ง',
    category: 'กาแฟเย็น',
    url: '/theme/coffee_preset_08_coldbrew.jpg'
  },
  {
    id: 'preset_barista',
    name: 'บาริสต้าเทฟองนมสร้างสรรค์กาแฟ',
    category: 'คนชงกาแฟ',
    url: '/theme/coffee_preset_09_barista.jpg'
  },
  {
    id: 'preset_farm',
    name: 'ผลเชอร์รี่กาแฟสดจากไร่เกษตรกร',
    category: 'ไร่กาแฟ',
    url: '/theme/coffee_preset_10_farm.jpg'
  }
];

export function getRandomCoffeeBgUrl(): string {
  const index = Math.floor(Math.random() * COFFEE_BACKGROUND_PRESETS.length);
  return COFFEE_BACKGROUND_PRESETS[index].url;
}

export const COFFEE_GROUPS: Record<string, CoffeeGroupMeta> = {
  mocha: {
    key: 'mocha',
    name: 'กลุ่มมอคค่า',
    bgImage: '/theme/coffee_mocha_bg.jpg',
    themeColor: '#78350f',
    accentBg: '#fef3c7'
  },
  cappuccino: {
    key: 'cappuccino',
    name: 'กลุ่มคาปูชิโน',
    bgImage: '/theme/coffee_cappuccino_bg.jpg',
    themeColor: '#92400e',
    accentBg: '#ffedd5'
  },
  americano: {
    key: 'americano',
    name: 'กลุ่มอเมริกาโน',
    bgImage: '/theme/coffee_americano_bg.jpg',
    themeColor: '#1c1917',
    accentBg: '#f5f5f4'
  },
  espresso: {
    key: 'espresso',
    name: 'กลุ่มเอสเพรสโซ',
    bgImage: '/theme/coffee_preset_05_espresso.jpg',
    themeColor: '#451a03',
    accentBg: '#fef2f2'
  },
  latte: {
    key: 'latte',
    name: 'กลุ่มลาเต้',
    bgImage: '/theme/coffee_preset_06_latte.jpg',
    themeColor: '#b45309',
    accentBg: '#fffbeb'
  }
};

const COFFEE_GROUPS_STORAGE_KEY = 'pilot_hackathon_coffee_groups_v4';

export function getStoredCoffeeGroups(): CoffeeGroupMeta[] {
  if (typeof window === 'undefined') {
    return Object.values(COFFEE_GROUPS);
  }
  try {
    const raw = localStorage.getItem(COFFEE_GROUPS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((g) => ({
          key: g.key,
          name: g.name || 'ชื่อกลุ่ม',
          bgImage: g.bgImage || getRandomCoffeeBgUrl(),
          themeColor: g.themeColor || '#78350f',
          accentBg: g.accentBg || '#fef3c7',
          isCustom: g.isCustom
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored coffee groups:', e);
  }
  const defaults = Object.values(COFFEE_GROUPS);
  saveStoredCoffeeGroups(defaults);
  return defaults;
}

export function saveStoredCoffeeGroups(groups: CoffeeGroupMeta[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = groups.map((g) => ({
      key: g.key,
      name: g.name,
      bgImage: g.bgImage,
      themeColor: g.themeColor,
      accentBg: g.accentBg,
      isCustom: g.isCustom
    }));
    localStorage.setItem(COFFEE_GROUPS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('Failed to save coffee groups:', e);
  }
}

export function addCoffeeGroup(newGroup: Omit<CoffeeGroupMeta, 'key'> & { key?: string }): CoffeeGroupMeta[] {
  const current = getStoredCoffeeGroups();
  const rawKey = (newGroup.key || `group_${Date.now()}`)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  const uniqueKey = current.some((g) => g.key === rawKey) ? `${rawKey}_${Date.now()}` : rawKey;

  const groupToAdd: CoffeeGroupMeta = {
    key: uniqueKey,
    name: newGroup.name || 'กลุ่มกาแฟสร้างสรรค์คุณธรรม',
    bgImage: newGroup.bgImage || getRandomCoffeeBgUrl(),
    themeColor: newGroup.themeColor || '#78350f',
    accentBg: newGroup.accentBg || '#fef3c7',
    isCustom: true
  };

  const updated = [...current, groupToAdd];
  saveStoredCoffeeGroups(updated);
  return updated;
}

export function updateCoffeeGroup(key: string, updates: Partial<CoffeeGroupMeta>): CoffeeGroupMeta[] {
  const current = getStoredCoffeeGroups();
  const updated = current.map((g) => (g.key === key ? { ...g, ...updates } : g));
  saveStoredCoffeeGroups(updated);
  return updated;
}

export function deleteCoffeeGroup(key: string): CoffeeGroupMeta[] {
  const current = getStoredCoffeeGroups();
  if (current.length <= 1) {
    throw new Error('ไม่สามารถลบกลุ่มทั้งหมดได้ ต้องมีอย่างน้อย 1 กลุ่ม');
  }
  const updated = current.filter((g) => g.key !== key);
  saveStoredCoffeeGroups(updated);
  return updated;
}

export function resetCoffeeGroupsToDefault(): CoffeeGroupMeta[] {
  const defaults = Object.values(COFFEE_GROUPS);
  saveStoredCoffeeGroups(defaults);
  return defaults;
}

export type ParticipantLevel = 'policy' | 'practitioner' | 'citizen';

export interface ParticipantRegistration {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  position: string;
  agencyOrOrg: string;
  level: ParticipantLevel;
  province: PilotProvinceName | string;
  district: string;
  subdistrict?: string;
  phone: string;
  email: string;
  selectedGroup: CoffeeGroupKey;
  registeredAt: string;
}

export interface HackathonProject {
  id: string;
  province: PilotProvinceName;
  groupKey: CoffeeGroupKey;
  groupName: string;
  projectName: string;
  targetMoralVirtue: string; // พอเพียง, วินัย, สุจริต, จิตอาสา, กตัญญู
  targetAudience: string;
  targetArea: string;
  proposalDetails: string;    // แนวคิดนวัตกรรมและกิจกรรมปรับเปลี่ยนพฤติกรรม
  activityPlan: string;       // กลไกการมีส่วนร่วมของ 3 ระดับ (นโยบาย / ปฏิบัติ / ประชาชน)
  behavioralKpi: string;      // ผลลัพธ์ที่คาดหวังและตัวชี้วัดเชิงพฤติกรรม
  budgetTimeline?: string;    // แผนระยะเวลาและประมาณการงบประมาณ (ทางเลือก)
  proposerName: string;
  proposerFirstName?: string; // ชื่อผู้ส่งโครงการ
  proposerLastName?: string;  // นามสกุลผู้ส่งโครงการ
  proposerAgency: string;
  proposerPosition?: string;
  proposerLevel: ParticipantLevel;
  aiScore: number;            // 0 - 100 (คะแนนสุทธิหลังหักคะแนนตรวจซ้ำ)
  rawAiScore?: number;        // คะแนนประเมินดิบตามเกณฑ์ Rubric ก่อนหัก
  preCheckCount?: number;     // จำนวนครั้งที่กดปุ่มตรวจสอบก่อนส่ง
  preCheckPenalty?: number;   // คะแนนที่ถูกหักจากการกดตรวจมากกว่า 1 ครั้ง
  aiScoreBreakdown: {
    alignment: number;        // ความตรงจุดแก้ปัญหาคุณธรรม (เต็ม 30)
    feasibility: number;      // ความเป็นไปได้ในการปฏิบัติ (เต็ม 30)
    innovation: number;       // นวัตกรรมและความคิดสร้างสรรค์ (เต็ม 20)
    participation: number;    // การมีส่วนร่วม 3 ระดับ (เต็ม 20)
  };
  aiRecommendations: string;  // ข้อเสนอแนะเชิงลึกจาก AI เพื่อปรับปรุงโครงการ
  communityVotes: number;     // จำนวนคะแนนโหวตจากประชาชน
  votedUserIds?: string[];
  createdAt: string;
  challengeTopic?: string;              // โจทย์ Hackathon ประจำโครงการ
  evaluatedCriteriaVirtues?: string[];  // ดัชนีคุณธรรมที่เลือกใช้เป็นเกณฑ์ตัดสิน
}

export function getProposerLevelLabel(level?: string): string {
  if (!level) return 'ผู้ปฏิบัติการ (Practitioner)';
  if (level === 'policy') return 'ระดับนโยบาย (Policy Maker)';
  if (level === 'practitioner') return 'ผู้ปฏิบัติการ (Practitioner)';
  if (level === 'citizen') return 'ภาคประชาชน / ชุมชน (Citizen)';
  return level;
}

// ----------------------------------------------------------------------------
// PRE-CHECK CLICK DEDUCTION & DUPLICATE SUBMISSION HELPERS
// ----------------------------------------------------------------------------

/**
 * คำนวณคะแนนจากการกดปุ่มตรวจสอบก่อนส่ง:
 * ยกเลิกการหักแต้ม: ไม่มีการหักคะแนนในทุกกรณี (penalty = 0)
 * สูตร: { คะแนน final = คะแนนที่ได้จากการตรวจ (ไม่มีการหักแต้ม) }
 */
export function calculatePreCheckPenalty(rawScore: number, checkCount: number): {
  rawScore: number;
  checkCount: number;
  penalty: number;
  finalScore: number;
  formula: string;
} {
  const safeRaw = Math.max(0, Math.min(100, Number(rawScore || 0)));
  const count = Math.max(1, Math.floor(checkCount || 1));
  const penalty = 0; // ยกเลิกการหักแต้ม ไม่มีการหักคะแนนในทุกกรณี
  const finalScore = safeRaw;
  const formula = `{ คะแนน final = ${safeRaw.toFixed(2)} (ตรวจประเมินฟรี ไม่หักคะแนน) }`;
  return {
    rawScore: safeRaw,
    checkCount: count,
    penalty: 0,
    finalScore,
    formula
  };
}

export function normalizePersonName(name?: string): string {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * ตรวจสอบผู้ส่งว่าเคยส่งโครงการแล้วหรือไม่จาก field ชื่อ และ field นามสกุล
 * กติกา: แต่ละคนส่งได้แค่หนึ่งโครงการถ้าส่งแล้วส่งอีกไม่ได้
 */
export function checkDuplicateSubmitter(
  firstName: string,
  lastName: string,
  projects?: HackathonProject[]
): { isDuplicate: boolean; existingProject?: HackathonProject } {
  const normFirst = normalizePersonName(firstName);
  const normLast = normalizePersonName(lastName);

  if (!normFirst || !normLast) {
    return { isDuplicate: false };
  }

  // Generic fallback names that should not trigger duplicate block
  const genericList = ['ผู้เข้าร่วมกิจกรรม', 'ผู้ส่งโครงการ', 'hackathon', 'admin', 'test'];
  if (genericList.includes(normFirst) || genericList.includes(normLast)) {
    return { isDuplicate: false };
  }

  const list = projects && projects.length > 0 ? projects : getHackathonProjects();
  for (const p of list) {
    // 1. Direct match on proposerFirstName and proposerLastName
    if (p.proposerFirstName && p.proposerLastName) {
      if (
        normalizePersonName(p.proposerFirstName) === normFirst &&
        normalizePersonName(p.proposerLastName) === normLast
      ) {
        return { isDuplicate: true, existingProject: p };
      }
    }

    // 2. Fallback match on proposerName (split into first and last name)
    if (p.proposerName) {
      const parts = p.proposerName.trim().split(/\s+/);
      if (parts.length >= 2) {
        const pFirst = normalizePersonName(parts[0]);
        const pLast = normalizePersonName(parts.slice(1).join(' '));
        if (pFirst === normFirst && pLast === normLast) {
          return { isDuplicate: true, existingProject: p };
        }
      } else if (parts.length === 1) {
        const combined = `${normFirst} ${normLast}`;
        if (normalizePersonName(parts[0]) === combined) {
          return { isDuplicate: true, existingProject: p };
        }
      }
    }
  }

  return { isDuplicate: false };
}

// ----------------------------------------------------------------------------
// BANGKOK TIMEZONE FORMATTING HELPER (Asia/Bangkok, UTC+7)
// ----------------------------------------------------------------------------
export interface BangkokFormattedTime {
  timeOnly: string;
  timeWithSeconds: string;
  dateOnly: string;
  fullBangkok: string;
  tzLabel: string;
}

/**
 * Format ISO datetime string to Thailand / Bangkok Timezone (Asia/Bangkok, GMT+7)
 * Returns object with time, date and full Thai formatted strings.
 */
export function formatBangkokSubmissionTime(isoString?: string): BangkokFormattedTime {
  if (!isoString) {
    return {
      timeOnly: '-',
      timeWithSeconds: '-',
      dateOnly: '-',
      fullBangkok: '-',
      tzLabel: 'Bangkok (GMT+7)'
    };
  }

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return {
        timeOnly: isoString,
        timeWithSeconds: isoString,
        dateOnly: '',
        fullBangkok: isoString,
        tzLabel: 'Bangkok (GMT+7)'
      };
    }

    const timeOnly = new Intl.DateTimeFormat('th-TH', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date) + ' น.';

    const timeWithSeconds = new Intl.DateTimeFormat('th-TH', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date) + ' น.';

    const dateOnly = new Intl.DateTimeFormat('th-TH', {
      timeZone: 'Asia/Bangkok',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);

    const fullBangkok = `${dateOnly} เวลา ${timeOnly} (Bangkok Time)`;

    return {
      timeOnly,
      timeWithSeconds,
      dateOnly,
      fullBangkok,
      tzLabel: 'Bangkok (GMT+7)'
    };
  } catch {
    return {
      timeOnly: isoString,
      timeWithSeconds: isoString,
      dateOnly: '',
      fullBangkok: isoString,
      tzLabel: 'Bangkok (GMT+7)'
    };
  }
}

// ----------------------------------------------------------------------------
// 5 MORAL VIRTUES LIST (เกณฑ์ดัชนีคุณธรรม 5 ด้าน)
// ----------------------------------------------------------------------------
export interface MoralVirtueItem {
  key: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  desc: string;
}

export const MORAL_5_VIRTUES_LIST: MoralVirtueItem[] = [
  { key: 'sufficiency', name: 'พอเพียง', shortName: 'พอเพียง', icon: '🌱', color: '#10b981', desc: 'การดำเนินชีวิตอย่างพอประมาณ มีเหตุผล มีภูมิคุ้มกันในการบริหารจัดการ' },
  { key: 'discipline', name: 'วินัย', shortName: 'วินัยรับผิดชอบ', icon: '🎯', color: '#3b82f6', desc: 'การเคารพกฎระเบียบ กติกา และมีความรับผิดชอบต่อตนเองและสังคม' },
  { key: 'honesty', name: 'สุจริต', shortName: 'สุจริต', icon: '⚖️', color: '#6366f1', desc: 'ความซื่อสัตย์ โปร่งใส ต่อต้านการทุจริต การมีธรรมาภิบาลในองค์กร' },
  { key: 'volunteer', name: 'จิตอาสา', shortName: 'จิตอาสา', icon: '🤝', color: '#ec4899', desc: 'การเสียสละเพื่อส่วนรวม มีน้ำใจ ช่วยเหลือเกื้อกูลและบำเพ็ญประโยชน์' },
  { key: 'gratitude', name: 'กตัญญู', shortName: 'กตัญญู', icon: '💖', color: '#f59e0b', desc: 'ความกตัญญูกตเวทีต่อบุพการี ผู้มีพระคุณ ภูมิปัญญาท้องถิ่น และแผ่นดินเกิด' }
];

// ----------------------------------------------------------------------------
// SEED DATA: 15 โครงการเริ่มต้น (กลุ่มละ 5 โครงการ) ครอบคลุม 4 จังหวัด
// ----------------------------------------------------------------------------
export const SEED_HACKATHON_PROJECTS: HackathonProject[] = [
  // =================== กลุ่มมอคค่า (5 โครงการ) ===================
  {
    id: 'proj-mocha-01',
    province: 'อยุธยา',
    groupKey: 'mocha',
    groupName: 'กลุ่มมอคค่า',
    projectName: 'อยุธยารักษ์วินัย ขับขี่ปลอดภัย Zero Accident นิคมโรจนะและบางปะอิน',
    targetMoralVirtue: 'วินัย',
    targetAudience: 'ผู้ใช้แรงงาน 25,000 คนในนิคมโรจนะ บางปะอิน และผู้ขับขี่รถจักรยานยนต์',
    targetArea: 'อ.พระนครศรีอยุธยา อ.บางปะอิน และ อ.อุทัย',
    proposalDetails: 'จัดตั้งกลไก "Safety Moral Credit" ร่วมกับสภาอุตสาหกรรมจังหวัด ตรวจจับวินัยจราจรผ่านกล้อง AI สี่แยกนิคมฯ ผู้สวมหมวกนิรภัย 100% รับแต้มสะสมแลกคูปองน้ำมันและเบี้ยประกันภัยราคาพิเศษ',
    activityPlan: '1) ระดับนโยบาย: ผู้ว่าฯ และ ผบก.ภ.จว.พระนครศรีอยุธยา ออกบันทึกข้อตกลง MOU กับ 50 โรงงาน 2) ผู้ปฏิบัติการ: อปท. และตำรวจจราจรจัดระบบ AI Verification 3) ประชาชน: สหภาพแรงงานและชมรม จป. เป็นกระบอกเสียงตรวจเช็กเพื่อนร่วมงาน',
    behavioralKpi: 'อัตราการสวมหมวกนิรภัยเพิ่มขึ้นจาก 42% เป็น 85% และอุบัติเหตุบริเวณหน้าทางเข้านิคมฯ ลดลง 62% ใน 6 เดือน',
    budgetTimeline: 'ระยะเวลา 6 เดือน | งบประมาณ 450,000 บาท (กองทุนความปลอดภัยทางถนน + CSR โรงงาน)',
    proposerName: 'นายธีรภัทร วัฒนสุข',
    proposerAgency: 'สภาอุตสาหกรรมจังหวัดพระนครศรีอยุธยา',
    proposerPosition: 'ประธานสภาอุตสาหกรรมจังหวัด',
    proposerLevel: 'practitioner',
    aiScore: 93.5,
    aiScoreBreakdown: { alignment: 29, feasibility: 28, innovation: 18.5, participation: 18 },
    aiRecommendations: 'โครงการมีความเป็นไปได้สูงมากเนื่องจากมี MOU ภาคอุตสาหกรรมรองรับ แนะนำให้เพิ่มการเชื่อมโยงระบบแต้มคุณธรรมเข้ากับแอปพลิเคชันมือถือของ อปท. เพื่อให้ประชาชนนอกนิคมฯ สามารถร่วมสะสมแต้มได้ด้วย',
    communityVotes: 0,
    createdAt: '2026-10-25T09:15:00Z'
  },
  {
    id: 'proj-mocha-02',
    province: 'อยุธยา',
    groupKey: 'mocha',
    groupName: 'กลุ่มมอคค่า',
    projectName: 'ธนาคารขยะมรดกโลก & สวัสดิการชุมชนรักษ์แม่น้ำเจ้าพระยา-ป่าสัก',
    targetMoralVirtue: 'พอเพียง',
    targetAudience: 'ประชาชนริมฝั่งน้ำเจ้าพระยาและชุมชนรอบเกาะเมือง 1,200 ครอบครัว',
    targetArea: 'อ.พระนครศรีอยุธยา และ อ.บางบาล จ.อยุธยา',
    proposalDetails: 'ประยุกต์หลักเศรษฐกิจพอเพียงในการจัดการขยะพลาสติกทางทะเล จัดตั้งธนาคารขยะรีไซเคิลชุมชน แปรรูปขยะอวนเก่าเป็นผลิตภัณฑ์แปรรูป สร้างกองทุนสวัสดิการฌาปนกิจและยาสามัญสำหรับผู้สูงอายุ',
    activityPlan: '1) ระดับนโยบาย: เทศบาลนครพระนครศรีอยุธยา สนับสนุนพื้นที่และงบอุปกรณ์ 2) ผู้ปฏิบัติการ: นักวิชาการสิ่งแวดล้อมและแกนนำกลุ่มสัจจะสะสมทรัพย์จัดอบรมคัดแยก 3) ประชาชน: ชมรมประมงพื้นบ้านจัดเวรเก็บขยะคืนสู่ฝั่ง',
    behavioralKpi: 'ลดปริมาณขยะพลาสติกตกค้างในทะเล 35 ตัน/ปี และมีเงินหมุนเวียนในกองทุนสวัสดิการชุมชนกว่า 280,000 บาท',
    budgetTimeline: 'ระยะเวลา 8 เดือน | งบประมาณ 320,000 บาท (กองทุนสิ่งแวดล้อมท้องถิ่น)',
    proposerName: 'นางกาญจนา สุวรรณโชติ',
    proposerAgency: 'กลุ่มอนุรักษ์มรดกทางวัฒนธรรมและสิ่งแวดล้อมอยุธยา',
    proposerPosition: 'ประธานกลุ่มอนุรักษ์มรดกทางวัฒนธรรม',
    proposerLevel: 'citizen',
    aiScore: 91.0,
    aiScoreBreakdown: { alignment: 28, feasibility: 27, innovation: 18, participation: 18 },
    aiRecommendations: 'นวัตกรรม Upcycling น่าสนใจมาก แนะนำให้ประสานงานกับกลุ่มผู้ประกอบการรีสอร์ตในพื้นที่เพื่อสร้างตลาดรับซื้อผลิตภัณฑ์จากขยะอวนรีไซเคิลอย่างต่อเนื่อง',
    communityVotes: 0,
    createdAt: '2026-10-25T10:30:00Z'
  },
  {
    id: 'proj-mocha-03',
    province: 'อุดรธานี',
    groupKey: 'mocha',
    groupName: 'กลุ่มมอคค่า',
    projectName: 'สัจจะออมทรัพย์แก้หนี้ครัวเรือน ภูมิปัญญาสิ่งทอและเศรษฐกิจพอเพียงกุมภวาปี',
    targetMoralVirtue: 'พอเพียง',
    targetAudience: 'เกษตรกรผู้ปลูกข้าวและช่างทอผ้าที่มีหนี้นอกระบบ 450 ราย',
    targetArea: 'อ.กุมภวาปี และ อ.หนองหาน จ.อุดรธานี',
    proposalDetails: 'ฟื้นฟูกลุ่มสัจจะออมทรัพย์วันละบาท ปรับเปลี่ยนพฤติกรรมลดรายจ่ายฟุ่มเฟือย จัดทำบัญชีครัวเรือนดิจิทัลผ่านสมาร์ตโฟน พร้อมแปลงที่ดินว่างเปล่าเป็นแปลงผักอินทรีย์ลดค่าครองชีพ',
    activityPlan: '1) ระดับนโยบาย: ธ.ก.ส. สาขาอุดรธานี ร่วมปรับโครงสร้างหนี้และลดดอกเบี้ย 2) ผู้ปฏิบัติการ: เกษตรอำเภอและพัฒนาชุมชนเป็นพี่เลี้ยงทำบัญชี 3) ประชาชน: ผู้นำชุมชนและพระสงฆ์เป็นผู้ดูแลกองทุนสัจจะ',
    behavioralKpi: 'เกษตรกร 88% สามารถลดหนี้นอกระบบได้เฉลี่ย 40,000 บาท/ครัวเรือน และมีเงินออมสะสมต่อเนื่องมากกว่า 6 เดือน',
    budgetTimeline: 'ระยะเวลา 12 เดือน | งบประมาณ 280,000 บาท (งบพัฒนาจังหวัด)',
    proposerName: 'นายประสิทธิ์ ศรีมงคล',
    proposerAgency: 'ศูนย์ส่งเสริมเศรษฐกิจพอเพียงและสัจจะออมทรัพย์อุดรธานี',
    proposerPosition: 'ผู้อำนวยการศูนย์ส่งเสริมเศรษฐกิจพอเพียง',
    proposerLevel: 'practitioner',
    aiScore: 94.0,
    aiScoreBreakdown: { alignment: 30, feasibility: 28.5, innovation: 17.5, participation: 18 },
    aiRecommendations: 'เป็นโครงการที่ตอบโจทย์จุดอ่อนเศรษฐกิจพอเพียงในพื้นที่เกษตรกรรมชัดเจน ควรกำหนดรางวัลเชิดชูเกียรติ "ครัวเรือนปลดหนี้มีสุข" เพื่อสร้างขวัญกำลังใจแก่กลุ่มนำร่อง',
    communityVotes: 0,
    createdAt: '2026-10-25T11:00:00Z'
  },
  {
    id: 'proj-mocha-04',
    province: 'ลำปาง',
    groupKey: 'mocha',
    groupName: 'กลุ่มมอคค่า',
    projectName: 'นครลำปางเมืองน่าอยู่ กตัญญูคู่คุณธรรม สานพลังดูแลผู้สูงวัยติดเตียงเมืองรถม้า',
    targetMoralVirtue: 'กตัญญู',
    targetAudience: 'ผู้สูงอายุภาวะพึ่งพิง 380 ราย และเยาวชนจิตอาสาดูแลผู้สูงวัย 200 คน',
    targetArea: 'อ.เมืองลำปาง และ อ.เกาะคา จ.ลำปาง',
    proposalDetails: 'สร้างกลไก "หลานรักดูแลปู่ย่า" โดยเชื่อมโยงเยาวชนในโรงเรียนเข้ากับ อสม. และ Caregiver ออกเยี่ยมบ้านผู้สูงอายุ สัปดาห์ละ 2 ครั้งเพื่อตรวจเช็กสุขภาพจิต พูดคุย และฝึกกายภาพบำบัด',
    activityPlan: '1) ระดับนโยบาย: อบจ.ลำปาง และ สสจ.ลำปาง จัดสรรงบสนับสนุน Care Toolkit 2) ผู้ปฏิบัติการ: รพ.สต. และครูแนะแนวฝึกทักษะการบริบาล 3) ประชาชน: จิตอาสาเยาวชนและครอบครัวผู้สูงอายุร่วมบันทึกไดอารี่กตัญญู',
    behavioralKpi: 'ภาวะซึมเศร้าของผู้สูงอายุกลุ่มเป้าหมายลดลง 48% และเยาวชนที่ร่วมโครงการได้รับคะแนนคุณธรรมสะสม 100% ครบตามเกณฑ์',
    budgetTimeline: 'ระยะเวลา 9 เดือน | งบประมาณ 360,000 บาท (กองทุนฟื้นฟูสมรรถภาพ อบจ.ลำปาง)',
    proposerName: 'ดร.อรพินท์ เมธาพิบูลย์',
    proposerAgency: 'วิทยาลัยพยาบาลบรมราชชนนี นครลำปาง',
    proposerPosition: 'รองผู้อำนวยการวิทยาลัยพยาบาลบรมราชชนนี นครลำปาง',
    proposerLevel: 'policy',
    aiScore: 95.0,
    aiScoreBreakdown: { alignment: 30, feasibility: 29, innovation: 18, participation: 18 },
    aiRecommendations: 'โครงการตอบโจทย์สังคมสูงวัยของลำปางอย่างลึกซึ้ง แนะนำให้บูรณาการฐานข้อมูลผู้สูงอายุเข้ากับ GIS แผนที่ความเปราะบางเพื่อจัดเส้นทางเยี่ยมบ้านให้มีประสิทธิภาพสูงสุด',
    communityVotes: 0,
    createdAt: '2026-10-25T13:45:00Z'
  },
  {
    id: 'proj-mocha-05',
    province: 'สุราษฎร์ธานี',
    groupKey: 'mocha',
    groupName: 'กลุ่มมอคค่า',
    projectName: 'สุราษฎร์ธานีเมืองคนดี ท่องเที่ยวสีขาว ไร้โกงราคา ปลอดนอมินี',
    targetMoralVirtue: 'สุจริต',
    targetAudience: 'ผู้ประกอบการเรือนำเที่ยว รถรับจ้าง และร้านอาหาร 350 กิจการ',
    targetArea: 'อ.บ้านตาขุน (เขื่อนเชี่ยวหลาน) และ อ.เกาะสมุย จ.สุราษฎร์ธานี',
    proposalDetails: 'พัฒนามาตรฐาน "White Fair Tourism Standard" แสดงราคาบริการมาตรฐานผ่าน QR Code หลายภาษา ตรวจสอบความถูกต้องและประเมินความพึงพอใจแบบเปิดเผย ไร้การเอารัดเอาเปรียบนักท่องเที่ยว',
    activityPlan: '1) ระดับนโยบาย: สมาคมธุรกิจท่องเที่ยวสุราษฎร์ธานี และ ททท. ร่วมกำหนดมาตรฐานและออกตรารับรอง 2) ผู้ปฏิบัติการ: ตำรวจท่องเที่ยวและพาณิชย์จังหวัดสุ่มตรวจ 3) ประชาชน: นักท่องเที่ยวและชาวบ้านร่วมให้ดาวผ่าน Web App',
    behavioralKpi: 'เรื่องร้องเรียนการเอารัดเอาเปรียบและโกงราคาลดลง 75% และความพึงพอใจของนักท่องเที่ยวเพิ่มขึ้นเป็น 94%',
    budgetTimeline: 'ระยะเวลา 6 เดือน | งบประมาณ 290,000 บาท (กองทุนส่งเสริมการท่องเที่ยว)',
    proposerName: 'นายสมชาย จงสถิตกุล',
    proposerAgency: 'สภาอุตสาหกรรมท่องเที่ยวจังหวัดสุราษฎร์ธานี',
    proposerPosition: 'ที่ปรึกษาสภาอุตสาหกรรมท่องเที่ยวจังหวัด',
    proposerLevel: 'policy',
    aiScore: 92.0,
    aiScoreBreakdown: { alignment: 28, feasibility: 28, innovation: 18, participation: 18 },
    aiRecommendations: 'สอดคล้องกับภาพลักษณ์เมืองท่องเที่ยวสีขาว ควรกำหนดบทลงโทษทางสังคมสำหรับผู้ประกอบการที่ละเมิดข้อตกลงอย่างเป็นธรรมและโปร่งใส',
    communityVotes: 0,
    createdAt: '2026-10-25T15:20:00Z'
  },

  // =================== กลุ่มคาปูชิโน (5 โครงการ) ===================
  {
    id: 'proj-cap-01',
    province: 'อยุธยา',
    groupKey: 'cappuccino',
    groupName: 'กลุ่มคาปูชิโน',
    projectName: 'สื่อสร้างสรรค์ "เด็กกรุงเก่ารุ่นใหม่ ออมวันละนิด พิชิตหนี้"',
    targetMoralVirtue: 'พอเพียง',
    targetAudience: 'นักเรียนมัธยมศึกษาและอาชีวศึกษา 3,500 คนใน 12 สถานศึกษา จ.อยุธยา',
    targetArea: 'อ.พระนครศรีอยุธยา และ อ.เสนา จ.อยุธยา',
    proposalDetails: 'สร้างแรงบันดาลใจด้านวินัยการเงินผ่านสื่อคลิปสั้น TikTok และ Challenge "ออมเงินเหลือวันละ 20 บาท" แลกรับแต้มคุณธรรมและเวิร์กช็อปความรู้การลงทุนอย่างพอประมาณ',
    activityPlan: '1) ระดับนโยบาย: สำนักงานเขตพื้นที่การศึกษาพระนครศรีอยุธยา บรรจุเข้าสู่ชั่วโมงกิจกรรมแนะแนว 2) ผู้ปฏิบัติการ: ครูที่ปรึกษาและครูแกนนำเยาวชนสร้างชาเลนจ์ 3) ประชาชน: สภานักเรียนและผู้ปกครองร่วมบันทึกผล',
    behavioralKpi: 'นักเรียน 78% มีบัญชีเงินออมสะสมเพิ่มขึ้น และลดพฤติกรรมการซื้อสินค้าแฟชั่นออนไลน์ฟุ่มเฟือยลง 42%',
    budgetTimeline: 'ระยะเวลา 5 เดือน | งบประมาณ 220,000 บาท (งบสนับสนุนสวัสดิการการศึกษา)',
    proposerName: 'นางสาวพิมพ์ชนก รัตนวารี',
    proposerAgency: 'โรงเรียนอยุธยาวิทยาลัย',
    proposerPosition: 'ครูชำนาญการพิเศษ หัวหน้างานกิจกรรม',
    proposerLevel: 'practitioner',
    aiScore: 89.5,
    aiScoreBreakdown: { alignment: 27, feasibility: 28, innovation: 18.5, participation: 16 },
    aiRecommendations: 'การใช้ TikTok เข้าถึงกลุ่ม Gen Z ได้ดีมาก แนะนำให้ประสานธนาคารออมสินเพื่อนำระบบโมบายแบงกิ้งสำหรับเยาวชนมาใช้เชื่อมโยงการแสดงผลการออมแบบเรียลไทม์',
    communityVotes: 0,
    createdAt: '2026-10-25T10:00:00Z'
  },
  {
    id: 'proj-cap-02',
    province: 'อุดรธานี',
    groupKey: 'cappuccino',
    groupName: 'กลุ่มคาปูชิโน',
    projectName: 'วัคซีนไซเบอร์เมืองอุดร รู้ทันกลโกง ไม่เปิดบัญชีม้า',
    targetMoralVirtue: 'สุจริต',
    targetAudience: 'กลุ่มวัยรุ่นและประชาชนวัย 18-35 ปี ในเขตพื้นที่ 2,000 คน',
    targetArea: 'อ.เมืองอุดรธานี และ อ.กุมภวาปี จ.อุดรธานี',
    proposalDetails: 'จัดทำคาราวานละครชุมชนและเสียงตามสาย "เสียงเตือนจากทะเลบัวแดง" ให้ความรู้กฎหมายบัญชีม้าและโทษจำคุก 3 ปี พร้อมจัดตั้งคลินิกให้คำปรึกษาแก่ผู้ที่เคยหลงผิดเปิดบัญชีให้มิจฉาชีพ',
    activityPlan: '1) ระดับนโยบาย: ตำรวจภูธรจังหวัดอุดรธานี และ ผู้ว่าฯ ออกประกาศเตือนภัยเชิงรุก 2) ผู้ปฏิบัติการ: พัฒนาการอำเภอ และ กศน. จัดกิจกรรมในหมู่บ้าน 3) ประชาชน: ผู้นำเยาวชนร่วมเป็นสายตรวจไซเบอร์แจ้งเบาะแสนายหน้า',
    behavioralKpi: 'คดีการรับจ้างเปิดบัญชีม้าในพื้นที่เป้าหมายลดลง 68% และมีการแจ้งเบาะแสนายหน้าซื้อขายบัญชีเพิ่มขึ้น 34 ครั้ง',
    budgetTimeline: 'ระยะเวลา 6 เดือน | งบประมาณ 260,000 บาท (กองทุนป้องกันอาชญากรรมทางเทคโนโลยี)',
    proposerName: 'ร.ต.อ. พงศ์ศิริ นาวินทร์',
    proposerAgency: 'กองบังคับการตำรวจภูธรจังหวัดอุดรธานี',
    proposerPosition: 'รองสารวัตรป้องกันปราบปราม',
    proposerLevel: 'policy',
    aiScore: 93.0,
    aiScoreBreakdown: { alignment: 29.5, feasibility: 28, innovation: 17.5, participation: 18 },
    aiRecommendations: 'แก้ปัญหาจุดอ่อนสุจริตในกลุ่มวัยรุ่นได้ตรงเป้าหมาย ควรเพิ่มช่องทางแจ้งเบาะแสแบบไม่เปิดเผยตัวตนผ่าน Line Official เพื่อความปลอดภัยของผู้ให้ข้อมูล',
    communityVotes: 0,
    createdAt: '2026-10-25T11:45:00Z'
  },
  {
    id: 'proj-cap-03',
    province: 'ลำปาง',
    groupKey: 'cappuccino',
    groupName: 'กลุ่มคาปูชิโน',
    projectName: 'ลำปางฟ้าใส ชุมชนเซรามิกสีเขียว ไร้เผาป่าด้วยสัญญาใจบวร',
    targetMoralVirtue: 'วินัย',
    targetAudience: 'ราษฎรในพื้นที่เสี่ยงไฟป่า 18 หมู่บ้านรอบแนวเทือกเขาดอยขุนตาลและป่าแม่เมาะ',
    targetArea: 'อ.แม่เมาะ และ อ.แจ้ห่ม จ.ลำปาง',
    proposalDetails: 'จัดทำ "ธรรมนูญหมู่บ้านปลอดควัน" เปลี่ยนการเผาเศษวัชพืชเป็นการทำปุ๋ยหมักชีวภาพอัดเม็ด สร้างแรงจูงใจด้วยเงินอุดหนุนกองทุนหมู่บ้านสำหรับหมู่บ้านที่มีจุด Hotspot เป็นศูนย์',
    activityPlan: '1) ระดับนโยบาย: สำนักจัดการทรัพยากรป่าไม้ที่ 3 (ลำปาง) ร่วมออกเกณฑ์กองทุน 2) ผู้ปฏิบัติการ: อุทยานแห่งชาติและกำนันผู้ใหญ่บ้านตั้งจุดสกัด 3) ประชาชน: พระสงฆ์ทำพิธีบวชป่าและชาวบ้านร่วมลาดตระเวน',
    behavioralKpi: 'จุดความร้อน (Hotspot) ในพื้นที่เป้าหมายลดลง 82% เมื่อเทียบกับค่าเฉลี่ย 3 ปีย้อนหลัง และไม่มีผู้ฝ่าฝืนเผาป่า',
    budgetTimeline: 'ระยะเวลา 7 เดือน (ครอบคลุมฤดูไฟป่า) | งบประมาณ 410,000 บาท (งบแก้ปัญหา PM2.5)',
    proposerName: 'พระมหาพิเชษฐ์ ปัญญาวชิโร',
    proposerAgency: 'เครือข่ายพระสงฆ์นักพัฒนาและจิตอาสาพิทักษ์ป่าลำปาง',
    proposerPosition: 'ประธานเครือข่ายพระสงฆ์นักพัฒนาลำปาง',
    proposerLevel: 'citizen',
    aiScore: 95.5,
    aiScoreBreakdown: { alignment: 30, feasibility: 29, innovation: 18, participation: 18.5 },
    aiRecommendations: 'การใช้พลังความศรัทธาของพระสงฆ์ร่วมกับมาตรการ อปท. มีพลังขับเคลื่อนทางสังคมสูงมาก แนะนำให้ส่งโครงการนี้เข้าชิงรางวัลศูนย์คุณธรรมด้านสิ่งแวดล้อม',
    communityVotes: 0,
    createdAt: '2026-10-25T14:10:00Z'
  },
  {
    id: 'proj-cap-04',
    province: 'สุราษฎร์ธานี',
    groupKey: 'cappuccino',
    groupName: 'กลุ่มคาปูชิโน',
    projectName: 'เชี่ยวหลานและอ่าวไทยจิตอาสา พิทักษ์ป่าต้นน้ำและระบบนิเวศทางทะเล',
    targetMoralVirtue: 'จิตอาสา',
    targetAudience: 'ชาวบ้านชุมชนริมอ่างเก็บน้ำ อาสาสมัครกู้ภัย และนักอนุรักษ์ 300 คน',
    targetArea: 'อ.บ้านตาขุน และ อ.เกาะพะงัน จ.สุราษฎร์ธานี',
    proposalDetails: 'รวมพลังสร้างเครือข่าย "Sea Guardians" อบรมเยาวชนและผู้ประกอบการดำน้ำเก็บขยะใต้ทะเล ปลูกฟื้นฟูแปลงหญ้าทะเลแหล่งอาหารพะยูน และจัดตั้งศูนย์การเรียนรู้ระบบนิเวศทางทะเล',
    activityPlan: '1) ระดับนโยบาย: กรมทรัพยากรทางทะเลและชายฝั่ง (สบทช.6) มอบพันธุ์หญ้าทะเล 2) ผู้ปฏิบัติการ: เจ้าหน้าที่อุทยานฯ และสโมสรโรตารีสนับสนุนอุปกรณ์ดำน้ำ 3) ประชาชน: ชาวประมงและเยาวชนร่วมเฝ้าระวังเรือลากอวน',
    behavioralKpi: 'ฟื้นฟูแปลงหญ้าทะเลได้ 15 ไร่ ขยะตกค้างใต้แนวปะการังลดลง 80% และเกิดจิตสำนึกหวงแหนท้องทะเล',
    budgetTimeline: 'ระยะเวลา 8 เดือน | งบประมาณ 340,000 บาท (กองทุนอนุรักษ์สิ่งแวดล้อม)',
    proposerName: 'นายมิตร สุขสมบัติ',
    proposerAgency: 'ชมรมอนุรักษ์ธรรมชาติและสิ่งแวดล้อมสุราษฎร์ธานี',
    proposerPosition: 'หัวหน้าทีมอาสาสมัครพิทักษ์ป่าต้นน้ำ',
    proposerLevel: 'citizen',
    aiScore: 92.5,
    aiScoreBreakdown: { alignment: 28.5, feasibility: 28, innovation: 18, participation: 18 },
    aiRecommendations: 'กิจกรรมมีพลังชุมชนเหนียวแน่น ควรเพิ่มระบบถ่ายทอดสด Live Underwater Eco-Tour เพื่อสร้างการมีส่วนร่วมและระดมทุนสนับสนุนจากผู้ติดตามทั่วประเทศ',
    communityVotes: 0,
    createdAt: '2026-10-25T16:00:00Z'
  },
  {
    id: 'proj-cap-05',
    province: 'อยุธยา',
    groupKey: 'cappuccino',
    groupName: 'กลุ่มคาปูชิโน',
    projectName: 'อาชีวะอยุธยาจิตอาสา ซ่อมแซมเครื่องมือทำกิน บูรณะโบราณสถานสร้างรอยยิ้มชุมชน',
    targetMoralVirtue: 'จิตอาสา',
    targetAudience: 'ผู้มีรายได้น้อยและกลุ่มเปราะบาง 600 ครัวเรือนในเขต จ.อยุธยา',
    targetArea: 'อ.ผักไห่ และ อ.มหาราช จ.อยุธยา',
    proposalDetails: 'นำนักศึกษาช่างยนต์ ช่างไฟฟ้า และช่างอิเล็กทรอนิกส์ ออกหน่วยเคลื่อนที่บริการซ่อมฟรี เครื่องสูบน้ำ มอเตอร์ไซค์ อุปกรณ์การเกษตร และเครื่องใช้ไฟฟ้า พร้อมสอนวิธีบำรุงรักษาด้วยตนเอง',
    activityPlan: '1) ระดับนโยบาย: วิทยาลัยเทคนิคพระนครศรีอยุธยา บันทึกเป็นชั่วโมงจิตอาสาบังคับจบ 2) ผู้ปฏิบัติการ: ครูแผนกช่างกำกับดูแลมาตรฐานความปลอดภัย 3) ประชาชน: กำนันผู้ใหญ่บ้านสำรวจความต้องการและจัดสถานที่',
    behavioralKpi: 'ช่วยประชาชนประหยัดค่าซ่อมเครื่องมือทำกินรวมกว่า 480,000 บาท และนักศึกษามีทัศนคติเห็นคุณค่าในการช่วยเหลือผู้อื่นเพิ่มขึ้นอย่างมีนัยสำคัญ',
    budgetTimeline: 'ระยะเวลา 4 เดือน | งบประมาณ 180,000 บาท (งบอาชีวะพัฒนาสังคม)',
    proposerName: 'อาจารย์พิเชฐ โชติรส',
    proposerAgency: 'วิทยาลัยเทคนิคพระนครศรีอยุธยา',
    proposerPosition: 'หัวหน้าแผนกวิชาช่างกลโรงงาน',
    proposerLevel: 'practitioner',
    aiScore: 90.5,
    aiScoreBreakdown: { alignment: 28, feasibility: 29, innovation: 16.5, participation: 17 },
    aiRecommendations: 'เป็นโครงการที่สร้างคุณค่าทันทีแก่เศรษฐกิจครัวเรือน ควรขยายผลจับคู่กับบริษัทผู้จำหน่ายอะไหล่เพื่อขอสนับสนุนชิ้นส่วนสำรองราคาต้นทุน',
    communityVotes: 0,
    createdAt: '2026-10-25T16:40:00Z'
  },

  // =================== กลุ่มอเมริกาโน (5 โครงการ) ===================
  {
    id: 'proj-ame-01',
    province: 'อยุธยา',
    groupKey: 'americano',
    groupName: 'กลุ่มอเมริกาโน',
    projectName: 'Smart Safety Crosswalk ทางม้าลายอัจฉริยะ ปลุกวินัยจราจรรอบเกาะเมืองอยุธยา',
    targetMoralVirtue: 'วินัย',
    targetAudience: 'ผู้ขับขี่รถยนต์และรถจักรยานยนต์บริเวณรอบเกาะเมืองและโรงพยาบาล 15,000 คัน/วัน',
    targetArea: 'เทศบาลนครพระนครศรีอยุธยา และ อ.บางปะอิน จ.อยุธยา',
    proposalDetails: 'ติดตั้งระบบไฟทางม้าลายเซนเซอร์ตรวจจับคนเดินข้ามอัตโนมัติ พร้อมกล้อง AI แจ้งเตือนรถไม่หยุดให้คนข้าม แสดงป้าย LED อัตราคนเคารพกฎจราจรแบบเรียลไทม์ ชื่นชมผู้ขับขี่ที่มีน้ำใจ',
    activityPlan: '1) ระดับนโยบาย: เทศบาลนครพระนครศรีอยุธยา ปรับปรุงกายภาพถนน 2) ผู้ปฏิบัติการ: ตำรวจจราจรเชื่อมระบบส่งคำเตือนผ่าน Line OA 3) ประชาชน: สารวัตรนักเรียนถือป้ายรณรงค์และประเมินผล',
    behavioralKpi: 'อัตราการหยุดรถให้คนข้ามทางม้าลายเพิ่มขึ้นจาก 18% เป็น 76% ภายใน 3 เดือนหลังติดตั้งระบบ',
    budgetTimeline: 'ระยะเวลา 6 เดือน | งบประมาณ 550,000 บาท (งบสมาร์ตซิตี้ เทศบาลนครพระนครศรีอยุธยา)',
    proposerName: 'วิศวกร ธนพล ศิริชัย',
    proposerAgency: 'กองช่าง เทศบาลนครพระนครศรีอยุธยา',
    proposerPosition: 'วิศวกรโยธาชำนาญการ',
    proposerLevel: 'practitioner',
    aiScore: 96.0,
    aiScoreBreakdown: { alignment: 29.5, feasibility: 29, innovation: 19, participation: 18.5 },
    aiRecommendations: 'คะแนนการประเมินสูงสุดด้านนวัตกรรมและการใช้เทคโนโลยีวัดผลลัพธ์พฤติกรรมจริง แนะนำให้ขยายผลไปยังหน้าโรงพยาบาลพระนครศรีอยุธยาและตลาดเจ้าพรหมเป็นจุดถัดไป',
    communityVotes: 0,
    createdAt: '2026-10-25T08:30:00Z'
  },
  {
    id: 'proj-ame-02',
    province: 'อุดรธานี',
    groupKey: 'americano',
    groupName: 'กลุ่มอเมริกาโน',
    projectName: 'ระบบเปิดเผยงบ อปท. โปร่งใส ประชาชนตรวจสอบได้ (Open Udon)',
    targetMoralVirtue: 'สุจริต',
    targetAudience: 'ประชาชนผู้เสียภาษี 45,000 คน และบุคลากร อปท. 15 แห่ง',
    targetArea: 'ครอบคลุมทุกอำเภอใน จ.อุดรธานี',
    proposalDetails: 'พัฒนาเว็บแอป Dashboard แผนที่ภาษีและการจัดซื้อจัดจ้างของ อปท. แสดงสถานะโครงการ งบประมาณ และพิกัดงานก่อสร้าง ประชาชนสามารถกดถ่ายรูปส่งตรวจงานและรีวิวคะแนนความโปร่งใสแบบเปิดเผย',
    activityPlan: '1) ระดับนโยบาย: ป.ป.ช. ประจำจังหวัด และ ท้องถิ่นจังหวัด บังคับใช้เป็นเกณฑ์ ITA 2) ผู้ปฏิบัติการ: นักวิชาการคอมพิวเตอร์ อปท. นำเข้าข้อมูล 3) ประชาชน: ชมรม Strong จิตพอเพียงต้านทุจริตเป็นผู้ใช้หลัก',
    behavioralKpi: 'คะแนน ITA ของ อปท. ในจังหวัดเฉลี่ยเพิ่มขึ้นเป็น 94.5 คะแนน และเรื่องร้องเรียนงานก่อสร้างล่าช้าได้รับการแก้ไขเร็วขึ้น 3 เท่า',
    budgetTimeline: 'ระยะเวลา 8 เดือน | งบประมาณ 380,000 บาท (กองทุนป้องกันการทุจริต ป.ป.ช.)',
    proposerName: 'นางสาวสุดารัตน์ พรหมดี',
    proposerAgency: 'เครือข่ายธรรมาภิบาลภาคประชาสังคมอุดรธานี',
    proposerPosition: 'ผู้ประสานงานเครือข่ายธรรมาภิบาล',
    proposerLevel: 'citizen',
    aiScore: 94.5,
    aiScoreBreakdown: { alignment: 30, feasibility: 28, innovation: 18.5, participation: 18 },
    aiRecommendations: 'แก้ปัญหา Institutional Gap ได้อย่างเป็นรูปธรรม ควรจัดทำคู่มือการใช้งานแบบอินโฟกราฟิกภาษาเข้าใจง่าย เพื่อให้ชาวบ้านทั่วไปสามารถตรวจสอบงบได้อย่างมั่นใจ',
    communityVotes: 0,
    createdAt: '2026-10-25T12:00:00Z'
  },
  {
    id: 'proj-ame-03',
    province: 'ลำปาง',
    groupKey: 'americano',
    groupName: 'กลุ่มอเมริกาโน',
    projectName: 'แอป "ลูกหลานใกล้ใจ" ระบบติดตามสุขภาพจิตและเยี่ยมบ้านผู้สูงวัยลำปาง',
    targetMoralVirtue: 'กตัญญู',
    targetAudience: 'ผู้สูงอายุที่อยู่ลำพัง 850 ราย และลูกหลานที่ไปทำงานต่างถิ่น',
    targetArea: 'อ.เมืองลำปาง อ.เกาะคา และ อ.ห้างฉัตร จ.ลำปาง',
    proposalDetails: 'แอปพลิเคชันเชื่อมโยงลูกหลานที่ทำงานใน กทม. ให้รับทราบรายงานสุขภาพ รายวันของผู้สูงอายุจาก อสม. พร้อมฟังก์ชัน "โทรวิดีโอคอลตามนัด" และระบบแจ้งเตือนเตือนกินยาและเหตุฉุกเฉิน',
    activityPlan: '1) ระดับนโยบาย: กระทรวง พม. และ สสจ.ลำปาง สนับสนุนระบบฐานข้อมูล 2) ผู้ปฏิบัติการ: อสม. ใช้แอปบันทึกข้อมูลสุขภาพสัปดาห์ละ 1 ครั้ง 3) ประชาชน: ลูกหลานกดสั่งซื้อของใช้จำเป็นส่งตรงถึงบ้านพ่อแม่',
    behavioralKpi: 'ลูกหลานมีการติดต่อสื่อสารกับผู้สูงอายุเพิ่มขึ้น 3 เท่า และลดความเสี่ยงการหกล้มโดยไม่มีคนเห็นลง 85%',
    budgetTimeline: 'ระยะเวลา 6 เดือน | งบประมาณ 350,000 บาท (กองทุนพัฒนาดิจิทัลเพื่อเศรษฐกิจและสังคม)',
    proposerName: 'นายณัฐพล ชัยวรวงศ์',
    proposerAgency: 'กลุ่มสตาร์ตอัป HealthTech เมืองลำปาง',
    proposerPosition: 'ประธานเจ้าหน้าที่บริหาร (CEO)',
    proposerLevel: 'citizen',
    aiScore: 93.5,
    aiScoreBreakdown: { alignment: 29, feasibility: 28, innovation: 19, participation: 17.5 },
    aiRecommendations: 'ตอบโจทย์ปัญหาสังคมสูงวัยและการพลัดถิ่นได้อย่างสร้างสรรค์ ควรมีฟังก์ชันโทรขอความช่วยเหลือฉุกเฉินแบบปุ่มเดียว (SOS Button) สำหรับผู้สูงอายุที่ไม่ถนัดสมาร์ตโฟน',
    communityVotes: 0,
    createdAt: '2026-10-25T14:50:00Z'
  },
  {
    id: 'proj-ame-04',
    province: 'สุราษฎร์ธานี',
    groupKey: 'americano',
    groupName: 'กลุ่มอเมริกาโน',
    projectName: 'สมุย-พะงันโมเดล Zero Food Waste เกษตรอินทรีย์พึ่งตนเองอย่างพอเพียง',
    targetMoralVirtue: 'พอเพียง',
    targetAudience: 'โรงแรม รีสอร์ต 40 แห่ง และกลุ่มเกษตรกร 250 ครอบครัว',
    targetArea: 'อ.เกาะสมุย และ อ.เกาะพะงัน จ.สุราษฎร์ธานี',
    proposalDetails: 'ระบบจับคู่เศษอาหารอินทรีย์จากโรงแรมหรูเข้าสู่โรงผลิตปุ๋ยหมักและอาหารสัตว์ของกลุ่มเกษตรกรบนเกาะ ลดการนำเข้าปุ๋ยเคมีจากแผ่นดินใหญ่ สร้างระบบอาหารปลอดภัยและเศรษฐกิจหมุนเวียน 100%',
    activityPlan: '1) ระดับนโยบาย: เทศบาลนครเกาะสมุย ออกเทศบัญญัติคัดแยกขยะต้นทาง 2) ผู้ปฏิบัติการ: ชมรมเชฟโรงแรมจัดการคัดแยก 3) ประชาชน: สหกรณ์เกษตรกรเกาะยาวรับเศษอาหารไปแปรรูปเป็นผลผลิตป้อนคืนโรงแรม',
    behavioralKpi: 'ลดขยะอินทรีย์ฝังกลบได้ 1.2 ตัน/วัน ลดต้นทุนปุ๋ยของเกษตรกรลง 60% และโรงแรมได้รับตรารับรอง Green Hotel',
    budgetTimeline: 'ระยะเวลา 9 เดือน | งบประมาณ 390,000 บาท (งบขับเคลื่อนโมเดล BCG สุราษฎร์ธานี)',
    proposerName: 'นายอนันต์ หวันหวัง',
    proposerAgency: 'วิสาหกิจชุมชนเกษตรอินทรีย์สุราษฎร์ธานี',
    proposerPosition: 'ประธานวิสาหกิจชุมชนเกษตรอินทรีย์',
    proposerLevel: 'practitioner',
    aiScore: 95.0,
    aiScoreBreakdown: { alignment: 29.5, feasibility: 29, innovation: 18.5, participation: 18 },
    aiRecommendations: 'เป็นระบบ Closed-loop Circular Economy ที่ยอดเยี่ยมมากบนเกาะ ควรบันทึกเป็นคู่มือต้นแบบส่งต่อให้เกาะอื่นๆ ในอันดามันนำไปปรับใช้',
    communityVotes: 0,
    createdAt: '2026-10-25T17:15:00Z'
  },
  {
    id: 'proj-ame-05',
    province: 'ลำปาง',
    groupKey: 'americano',
    groupName: 'กลุ่มอเมริกาโน',
    projectName: 'เครื่องเคลือบเซรามิกและไม้แกะสลักลำปาง ถ่ายทอดมรดกภูมิปัญญาด้วยกตัญญูศิลป์',
    targetMoralVirtue: 'กตัญญู',
    targetAudience: 'ช่างฝีมือเซรามิกและหัตถศิลป์ลำปางอาวุโส 50 ท่าน และเยาวชนนักออกแบบรุ่นใหม่ 150 คน',
    targetArea: 'อ.เมืองลำปาง และ อ.เกาะคา จ.ลำปาง',
    proposalDetails: 'สร้างพื้นที่ Co-learning Space "กตัญญูศิลป์เซรามิก" ให้เยาวชนกราบคารวะและเรียนรู้ศาสตร์การปั้นเคลือบจากครูช่างอาวุโส นำมาออกแบบผลิตภัณฑ์ร่วมสมัยจำหน่ายผ่านระบบ E-commerce นำรายได้ตั้งกองทุนดูแลครูช่างยามชรา',
    activityPlan: '1) ระดับนโยบาย: วัฒนธรรมจังหวัดลำปาง และ สมาคมหัตถศิลป์ ขึ้นทะเบียนช่างศิลป์ 2) ผู้ปฏิบัติการ: มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา ลำปาง จัดหลักสูตรอบรม 3) ประชาชน: ครูช่างและเยาวชนจับคู่ผลิตชิ้นงาน',
    behavioralKpi: 'ครูช่างได้รับการยกย่องเชิดชูเกียรติและมีสวัสดิการมั่นคง และเกิดแบรนด์เซรามิกคนรุ่นใหม่ 8 แบรนด์',
    budgetTimeline: 'ระยะเวลา 6 เดือน | งบประมาณ 270,000 บาท (งบพัฒนาเศรษฐกิจสร้างสรรค์)',
    proposerName: 'นายชลธี บุญทิพย์',
    proposerAgency: 'ชมรมผู้ประกอบการเซรามิกและหัตถศิลป์ลำปาง',
    proposerPosition: 'ประธานชมรมผู้ประกอบการเซรามิกและหัตถศิลป์ลำปาง',
    proposerLevel: 'citizen',
    aiScore: 92.0,
    aiScoreBreakdown: { alignment: 29, feasibility: 28, innovation: 17.5, participation: 17.5 },
    aiRecommendations: 'สะท้อนอัตลักษณ์ลำปางและพลังกตัญญูอย่างงดงาม ควรจัดนิทรรศการแสดงผลงานในงานเทศกาลเซรามิกแฟร์ลำปางประจำปีเพื่อเปิดตัวสู่ตลาดระดับสากล',
    communityVotes: 0,
    createdAt: '2026-10-25T18:00:00Z'
  },
  {
    id: 'proj-kal-04',
    province: 'อุดรธานี',
    groupKey: 'mocha',
    groupName: 'กลุ่มมอคค่า',
    projectName: 'เยาวชนจิตอาสารักษ์มรดกบ้านเชียงและทะเลบัวแดง ชุมชนคุณธรรม',
    targetMoralVirtue: 'จิตอาสา',
    targetAudience: 'เยาวชนและชาวบ้านกลุ่มท่องเที่ยววิถีวัฒนธรรม 300 คน',
    targetArea: 'อ.หนองหาน และ อ.กุมภวาปี จ.อุดรธานี',
    proposalDetails: 'จัดตั้งศูนย์เรียนรู้จิตอาสาสืบสานมรดกโลกบ้านเชียงและอนุรักษ์ธรรมชาติทะเลบัวแดง อาสาสมัครเยาวชนช่วยคุณตาคุณยายมัคคุเทศก์ท้องถิ่นสื่อสารข้อมูลท่องเที่ยวสีขาวทางออนไลน์',
    activityPlan: '1) นโยบาย: อบจ.อุดรธานี และ ททท.อุดรธานี สนับสนุนงบ 2) ปฏิบัติการ: โรงเรียนจัดชมรมจิตอาสา 3) ประชาชน: ปราชญ์ชาวบ้านถ่ายทอดประวัติศาสตร์',
    behavioralKpi: 'เยาวชนมีส่วนร่วมอนุรักษ์ภูมิปัญญา 85% และสร้างรายได้เสริมให้กลุ่มท่องเที่ยวชุมชน',
    budgetTimeline: 'ระยะเวลา 6 เดือน | งบประมาณ 180,000 บาท',
    proposerName: 'นางกาญจนา ภูทองเงิน',
    proposerAgency: 'ชมรมอนุรักษ์ผ้าไหมแพรวาบ้านโพน',
    proposerPosition: 'ประธานกลุ่มทอผ้าไหมแพรวาบ้านโพน',
    proposerLevel: 'citizen',
    aiScore: 88.5,
    aiScoreBreakdown: { alignment: 26, feasibility: 27, innovation: 17.5, participation: 18 },
    aiRecommendations: 'โครงการดีต่อการสืบสานวัฒนธรรม ควรเพิ่มช่องทางการตลาดดิจิทัล',
    communityVotes: 0,
    createdAt: '2026-10-25T11:30:00Z'
  },
  {
    id: 'proj-surat-04',
    province: 'สุราษฎร์ธานี',
    groupKey: 'mocha',
    groupName: 'กลุ่มมอคค่า',
    projectName: 'เยาวชนรักษ์ป่าต้นน้ำคลองศกและผืนป่าเชี่ยวหลานด้วยพลังกตัญญู',
    targetMoralVirtue: 'กตัญญู',
    targetAudience: 'นักเรียนและชาวบ้านรอบอุทยานแห่งชาติเขาสก 350 คน',
    targetArea: 'อ.พนม และ อ.บ้านตาขุน จ.สุราษฎร์ธานี',
    proposalDetails: 'ปลูกฝังจิตสำนึกกตัญญูต่อแผ่นดินเกิด ดูแลผืนป่าต้นน้ำคลองศก จัดทำแนวกันไฟป่าและฝายชะลอน้ำธรรมชาติ',
    activityPlan: '1) นโยบาย: อุทยานฯ เขาสก ร่วมสนับสนุน 2) ปฏิบัติการ: ครูและเจ้าหน้าที่จัดกิจกรรม 3) ประชาชน: ชุมชนร่วมสร้างฝาย',
    behavioralKpi: 'สร้างฝายชะลอน้ำ 25 จุด และลดการบุกรุกป่าต้นน้ำได้อย่างชัดเจน',
    budgetTimeline: 'ระยะเวลา 6 เดือน | งบประมาณ 190,000 บาท',
    proposerName: 'นายสุริยัน นิลวารี',
    proposerAgency: 'เครือข่ายเยาวชนพิทักษ์ป่าคลองศก',
    proposerPosition: 'ผู้ประสานงานเครือข่ายเยาวชนพิทักษ์ป่า',
    proposerLevel: 'citizen',
    aiScore: 89.0,
    aiScoreBreakdown: { alignment: 27, feasibility: 26.5, innovation: 17.5, participation: 18 },
    aiRecommendations: 'กิจกรรมสร้างสรรค์และเน้นการมีส่วนร่วมของชุมชนต้นน้ำ',
    communityVotes: 0,
    createdAt: '2026-10-25T15:00:00Z'
  },

  // =================== กลุ่มเอสเพรสโซ (Espresso Group) ===================
  {
    id: 'proj-esp-01',
    province: 'อยุธยา',
    groupKey: 'espresso',
    groupName: 'กลุ่มเอสเพรสโซ',
    projectName: 'Fast Action อยุธยา: สายตรวจคุณธรรมกำจัดจุดเสี่ยงอุบัติเหตุ 24 ชั่วโมง',
    targetMoralVirtue: 'วินัย',
    targetAudience: 'ผู้ขับขี่รถสัญจรบนถนนสายหลักและชุมชนรอบนิคมฯ 18,000 คน',
    targetArea: 'อ.พระนครศรีอยุธยา และ อ.อุทัย จ.อยุธยา',
    proposalDetails: 'จัดทีม Fast Action แก้ไขป้ายจราจรชำรุด สัญญาณไฟกระพริบ และตีเส้นชะลอความเร็วหน้าโรงเรียนภายใน 24 ชม. หลังรับแจ้งผ่านแอป พร้อมจัดอันดับหน่วยงานตอบสนองวินัยดีเด่น',
    activityPlan: '1) นโยบาย: ผู้ว่าฯ และ แขวงทางหลวงอยุธยา ออกเกณฑ์ Fast-Track 2) ปฏิบัติการ: เจ้าหน้าที่กู้ภัยและช่างเทศบาลลงพื้นที่ทันที 3) ประชาชน: ประชาชนส่งพิกัดผ่าน Line OA',
    behavioralKpi: 'จุดเสี่ยงได้รับการแก้ไขภายใน 24 ชั่วโมง 92% และลดสถิติการฝ่าฝืนสัญญาณไฟจราจรลง 45%',
    budgetTimeline: 'ระยะเวลา 6 เดือน | งบประมาณ 320,000 บาท',
    proposerName: 'นายศักดา มุ่งมั่นการ',
    proposerAgency: 'ชมรมอาสาสมัครกู้ภัยและบรรเทาสาธารณภัยอยุธยา',
    proposerPosition: 'หัวหน้าชุดปฏิบัติการกู้ภัยฉุกเฉิน',
    proposerLevel: 'practitioner',
    aiScore: 94.0,
    aiScoreBreakdown: { alignment: 29, feasibility: 28.5, innovation: 18.5, participation: 18 },
    aiRecommendations: 'สอดคล้องกับจุดเด่นของกลุ่มเอสเพรสโซที่รวดเร็วฉับไว แนะนำให้ต่อยอดระบบแจ้งเตือนแบบเรียลไทม์เพื่อสร้างความโปร่งใสและสร้างความมั่นใจแก่ผู้แจ้งเหตุ',
    communityVotes: 0,
    createdAt: '2026-10-25T13:00:00Z'
  },
  {
    id: 'proj-esp-02',
    province: 'อุดรธานี',
    groupKey: 'espresso',
    groupName: 'กลุ่มเอสเพรสโซ',
    projectName: 'ปราบโกงฉับไว สายสืบคุณธรรมดิจิทัล แจ้งไว จัดการเร็ว ไร้ส่วยทุจริต',
    targetMoralVirtue: 'สุจริต',
    targetAudience: 'ผู้ประกอบการร้านค้าและประชาชนผู้ติดต่อราชการ 12,000 คน',
    targetArea: 'เทศบาลนครอุดรธานี และ อ.กุมภวาปี จ.อุดรธานี',
    proposalDetails: 'แพลตฟอร์มแจ้งเบาะแสการเรียกรับผลประโยชน์แบบไม่เปิดเผยตัวตน (Whistleblower Fast-Response) ส่งตรงถึงคณะกรรมการธรรมาภิบาลจังหวัด ตรวจสอบข้อเท็จจริงภายใน 48 ชั่วโมง',
    activityPlan: '1) นโยบาย: ผู้ว่าราชการจังหวัด และ ป.ป.ช. ประจำจังหวัด เป็นคณะกรรมการอำนวยการ 2) ปฏิบัติการ: คณะทำงานตรวจสอบข้อเท็จจริงภาคประชาสังคม 3) ประชาชน: ประชาชนส่งหลักฐานและติดตามผล',
    behavioralKpi: 'ข้อร้องเรียนได้รับการตรวจสอบข้อเท็จจริงใน 48 ชม. 100% และลดพฤติกรรมการจ่ายเงินใต้โต๊ะในพื้นที่นำร่องลง 78%',
    budgetTimeline: 'ระยะเวลา 8 เดือน | งบประมาณ 290,000 บาท',
    proposerName: 'นางสาวนิตยา ไชยรัตน์',
    proposerAgency: 'เครือข่ายต่อต้านการทุจริตภาคประชาชนอุดรธานี',
    proposerPosition: 'ผู้ประสานงานเครือข่ายต่อต้านการทุจริต',
    proposerLevel: 'citizen',
    aiScore: 93.5,
    aiScoreBreakdown: { alignment: 29.5, feasibility: 28, innovation: 18, participation: 18 },
    aiRecommendations: 'มีความเฉียบคมในการแก้ปัญหาทุจริต ควรกำหนดมาตรการคุ้มครองพยานและผู้แจ้งเบาะแสอย่างรัดกุม',
    communityVotes: 0,
    createdAt: '2026-10-25T14:30:00Z'
  },

  // =================== กลุ่มลาเต้ (Latte Group) ===================
  {
    id: 'proj-lat-01',
    province: 'ลำปาง',
    groupKey: 'latte',
    groupName: 'กลุ่มลาเต้',
    projectName: 'ลำปางสานสุข คาเฟ่คุณธรรมเชื่อมโยงสามวัย ดูแลหัวใจผู้สูงอายุและเปราะบาง',
    targetMoralVirtue: 'กตัญญู',
    targetAudience: 'ผู้สูงอายุภาวะพึ่งพิง 300 ครัวเรือน และเยาวชนจิตอาสา 150 คน',
    targetArea: 'อ.เมืองลำปาง และ อ.เกาะคา จ.ลำปาง',
    proposalDetails: 'สร้างพื้นที่ "Co-Care Community Cafe" ในวัดและชุมชน ให้เยาวชนและผู้สูงอายุมาพบปะทำกิจกรรมร่วมกัน กิจกรรมเล่านิทานพื้นบ้าน ถ่ายทอดงานฝีมือ และตรวจสุขภาพเบื้องต้นอย่างอบอุ่น',
    activityPlan: '1) นโยบาย: อบจ.ลำปาง และ สำนักงาน พมจ.ลำปาง ให้การสนับสนุน 2) ปฏิบัติการ: เจ้าหน้าที่ รพ.สต. และแกนนำครูดูแลกิจกรรม 3) ประชาชน: ครอบครัวและจิตอาสาร่วมบริบาล',
    behavioralKpi: 'ดัชนีความเหงาและซึมเศร้าของผู้สูงอายุลดลง 52% และเกิดสายสัมพันธ์อันอบอุ่นระหว่างคนสามวัย',
    budgetTimeline: 'ระยะเวลา 8 เดือน | งบประมาณ 310,000 บาท',
    proposerName: 'นางรัตนาภรณ์ บัวเผื่อน',
    proposerAgency: 'ชมรมผู้สูงอายุและจิตอาสานครลำปาง',
    proposerPosition: 'ประธานชมรมผู้สูงอายุเมืองรถม้าลำปาง',
    proposerLevel: 'citizen',
    aiScore: 95.0,
    aiScoreBreakdown: { alignment: 30, feasibility: 28.5, innovation: 18, participation: 18.5 },
    aiRecommendations: 'ตรงกับเอกลักษณ์ของกลุ่มลาเต้ที่เน้นความนุ่มนวลและผสานความต่าง ควรถอดบทเรียนเป็นโมเดลต้นแบบระดับภาคเหนือ',
    communityVotes: 0,
    createdAt: '2026-10-25T15:10:00Z'
  },
  {
    id: 'proj-lat-02',
    province: 'สุราษฎร์ธานี',
    groupKey: 'latte',
    groupName: 'กลุ่มลาเต้',
    projectName: 'สุราษฎร์ธานีปันรัก ปันสุข ธนาคารอาหารแบ่งปัน & ครัวชุมชนพอเพียง',
    targetMoralVirtue: 'พอเพียง',
    targetAudience: 'กลุ่มเปราะบาง ผู้มีรายได้น้อย 500 ครัวเรือน และร้านอาหารพันธมิตร 30 แห่ง',
    targetArea: 'อ.เมืองสุราษฎร์ธานี และ อ.กาญจนดิษฐ์ จ.สุราษฎร์ธานี',
    proposalDetails: 'เครือข่ายแบ่งปันอาหารส่วนเกินคุณภาพดี (Food Rescue & Share) สู่ครัวกลางชุมชน เพื่อประกอบอาหารราคาประหยัดและแจกจ่ายฟรีแก่ผู้ยากไร้ สร้างวิถีพอเพียงและการแบ่งปันเกื้อกูลกัน',
    activityPlan: '1) นโยบาย: เทศบาลนครสุราษฎร์ธานี และ หอการค้า ออกเกณฑ์รับรองสุขอนามัย 2) ปฏิบัติการ: จิตอาสาและมูลนิธิท้องถิ่นช่วยขนส่งอาหาร 3) ประชาชน: ชาวบ้านร่วมบริหารจัดการครัวชุมชน',
    behavioralKpi: 'ลดขยะอาหารได้ 15 ตัน/ปี และช่วยเหลือผู้เปราะบางได้กว่า 3,500 มื้อต่อเดือนอย่างต่อเนื่อง',
    budgetTimeline: 'ระยะเวลา 9 เดือน | งบประมาณ 280,000 บาท',
    proposerName: 'นายวรพจน์ ทิพย์มณฑา',
    proposerAgency: 'มูลนิธิเพื่อการแบ่งปันและพัฒนาคุณภาพชีวิตสุราษฎร์ธานี',
    proposerPosition: 'ผู้จัดการมูลนิธิเพื่อการแบ่งปัน',
    proposerLevel: 'practitioner',
    aiScore: 92.5,
    aiScoreBreakdown: { alignment: 28.5, feasibility: 28, innovation: 18, participation: 18 },
    aiRecommendations: 'สร้างคุณค่าเชิงสังคมสูงมาก แนะนำให้ประสานกับห้างค้าปลีกขนาดใหญ่เพื่อขยายแหล่งรับบริจาคอาหารคุณภาพดีอย่างเป็นระบบ',
    communityVotes: 0,
    createdAt: '2026-10-25T16:20:00Z'
  }
];

const SEED_PROJECT_ID_SET = new Set(SEED_HACKATHON_PROJECTS.map(p => p.id));
export function isSeedHackathonProject(id?: string): boolean {
  if (!id) return false;
  return SEED_PROJECT_ID_SET.has(id);
}

const STORAGE_KEY_PROJECTS = 'mdc_hackathon_projects_v4';
const STORAGE_KEY_USER_SUBMITTED_PROJECTS = 'mdc_hackathon_user_submitted_projects_v2';
const STORAGE_KEY_VOTES = 'mdc_hackathon_user_voted_ids_v2';
const STORAGE_KEY_REGISTRATION = 'mdc_hackathon_participant_reg_v2';

// ----------------------------------------------------------------------------
// BENCHMARK & USER SUBMISSION SESSION TRACKER
// ----------------------------------------------------------------------------

export interface BenchmarkProjectAnchor {
  id: string;
  name: string;
  score: number;
  moralVirtue: string;
  summary: string;
  rank?: number; // 1, 2, 3
  isMax?: boolean;
  isMin?: boolean;
  // ข้อมูลฉบับเต็มเพื่อการเปรียบเทียบที่แม่นยำทุกมิติ
  targetArea?: string;
  targetAudience?: string;
  proposalDetails?: string;
  activityPlan?: string;
  behavioralKpi?: string;
  budgetTimeline?: string;
  comparisonVsCandidate?: 'candidate_better' | 'candidate_worse' | 'candidate_equal';
  comparisonDelta?: number;
  comparisonNote?: string;
}

export interface ComparativeEvaluationContext {
  sequenceNumber: number; // 1, 2, 3...
  mode: 'first_project_rubric_real' | 'first_project_start_80' | 'second_project_compare_first' | 'third_project_compare_prior_two' | 'multi_project_compare_top3' | 'multi_project_compare_max_min';
  modeLabel: string;
  anchorProject1?: BenchmarkProjectAnchor;
  highestProject?: BenchmarkProjectAnchor;
  lowestProject?: BenchmarkProjectAnchor;
  topAnchors?: BenchmarkProjectAnchor[]; // Top 1 ถึง 3 อันดับแรกที่มีคะแนนสูงสุดของระบบ
  comparativeRationale: string;
  relativeDiffText?: string;
  totalPriorProjects: number;
  // การวิเคราะห์ความใกล้เคียงและตำแหน่งสัมพัทธ์ (Proximity & Relative Positioning)
  proximityTarget?: 'identical_max' | 'identical_min' | 'identical_first' | 'closest_to_max' | 'closest_to_min' | 'midway' | 'exceeds_max' | 'below_min' | 'first_baseline' | 'top1_better' | 'top2_between' | 'top3_between' | 'below_top3';
  proximityRatio?: number; // 0.0 ถึง 1.0 (หรือ >1.0 / <0.0)
  proximityPercentage?: number; // 0 ถึง 100%
  proximityBadgeText?: string;
  proximityAnalysisDetails?: {
    closerTo: 'max' | 'min' | 'equal' | 'first' | 'top1' | 'top2' | 'top3';
    closerToName: string;
    closerToScore: number;
    distanceToMax?: number;
    distanceToMin?: number;
    sharedStrengths?: string[];
    gapFeatures?: string[];
  };
}

export function getUserSubmittedProjects(province?: PilotProvinceName): HackathonProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_SUBMITTED_PROJECTS);
    if (!raw) return [];
    const list: HackathonProject[] = JSON.parse(raw);
    const cleanList = list.filter(
      p => p && p.id && !p.id.startsWith('precheck-') && !isSeedHackathonProject(p.id)
    );
    if (province) {
      const provStr = String(province);
      return cleanList.filter((p) => {
        const pProv = String(p.province || '');
        if (pProv === provStr) return true;
        if ((provStr === 'อยุธยา' || provStr === 'พระนครศรีอยุธยา') && (pProv === 'อยุธยา' || pProv === 'พระนครศรีอยุธยา')) return true;
        if ((provStr === 'อุดรธานี' || provStr === 'กาฬสินธุ์') && (pProv === 'อุดรธานี' || pProv === 'กาฬสินธุ์')) return true;
        if ((provStr === 'ลำปาง' || provStr === 'น่าน') && (pProv === 'ลำปาง' || pProv === 'น่าน')) return true;
        if ((provStr === 'สุราษฎร์ธานี' || provStr === 'พังงา') && (pProv === 'สุราษฎร์ธานี' || pProv === 'พังงา')) return true;
        return false;
      });
    }
    return cleanList;
  } catch (e) {
    console.error('Failed to parse user submitted projects:', e);
    return [];
  }
}

export function resetSubmittedProjectsSession(province?: PilotProvinceName): void {
  if (typeof window === 'undefined') return;
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY_USER_SUBMITTED_PROJECTS);
    const userProjects: HackathonProject[] = rawUser ? JSON.parse(rawUser) : [];
    const idsToRemove = new Set(
      province
        ? userProjects.filter(p => p.province === province).map(p => p.id)
        : userProjects.map(p => p.id)
    );

    if (!province) {
      localStorage.removeItem(STORAGE_KEY_USER_SUBMITTED_PROJECTS);
    } else {
      const remaining = userProjects.filter(p => p.province !== province);
      localStorage.setItem(STORAGE_KEY_USER_SUBMITTED_PROJECTS, JSON.stringify(remaining));
    }

    // Also remove from main projects list
    const rawAll = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (rawAll) {
      const allProjects: HackathonProject[] = JSON.parse(rawAll);
      const filteredAll = allProjects.filter(p => !idsToRemove.has(p.id));
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(filteredAll));
    }
  } catch (e) {
    console.error('Failed to reset session:', e);
  }
}

export function getComparativeBenchmarkAnchors(province?: PilotProvinceName): ComparativeEvaluationContext {
  const userProjects = getUserSubmittedProjects(province);
  const total = userProjects.length;

  if (total === 0) {
    return {
      sequenceNumber: 1,
      mode: 'first_project_rubric_real',
      modeLabel: 'โครงการแรกที่ส่งเข้าแข่งขัน: ตรวจคะแนนตามเกณฑ์คุณธรรมที่เลือก (ตรวจตามจริง ไม่จำกัดเพดานคะแนน)',
      comparativeRationale: 'เป็นโครงการแรกที่ส่งเข้าสู่การแข่งขัน ยังไม่มีโครงการก่อนหน้าในระบบ จึงเริ่มต้นตรวจประเมินตามเกณฑ์คุณธรรมที่เลือกตามจริง (ไม่มีการจำกัดเพดาน 80 คะแนน) และใช้โครงการนี้เป็นตัวตั้งหลัก (Baseline Anchor) สำหรับเปรียบเทียบโครงการถัดไป',
      totalPriorProjects: 0
    };
  }

  if (total === 1) {
    const p1 = userProjects[0];
    const summary = p1.proposalDetails ? (p1.proposalDetails.slice(0, 140) + '...') : 'กิจกรรมปรับเปลี่ยนพฤติกรรมคุณธรรม';
    const anchor1: BenchmarkProjectAnchor = {
      id: p1.id,
      name: p1.projectName,
      score: p1.aiScore,
      moralVirtue: p1.targetMoralVirtue,
      summary,
      rank: 1,
      isMax: true,
      targetArea: p1.targetArea,
      targetAudience: p1.targetAudience,
      proposalDetails: p1.proposalDetails,
      activityPlan: p1.activityPlan,
      behavioralKpi: p1.behavioralKpi,
      budgetTimeline: p1.budgetTimeline
    };
    return {
      sequenceNumber: 2,
      mode: 'second_project_compare_first',
      modeLabel: 'โครงการที่สอง: เปรียบเทียบกับโครงการแรกว่าใครดีกว่าหรือแย่กว่าตามเกณฑ์',
      anchorProject1: anchor1,
      topAnchors: [anchor1],
      highestProject: anchor1,
      lowestProject: anchor1,
      comparativeRationale: `มีโครงการแรกส่งเข้าสู่ระบบแล้ว 1 โครงการ ("${p1.projectName}" • ${p1.aiScore.toFixed(2)} คะแนน) ระบบจะนำโครงการแรกมาเป็นตัวตั้งและเกณฑ์อ้างอิงหลักเพื่อวิเคราะห์เปรียบเทียบว่าโครงการที่สองนี้ดีกว่าหรือแย่กว่าตามเกณฑ์ แล้วจึงคำนวณคะแนนตามจริงออกมา`,
      totalPriorProjects: 1
    };
  }

  if (total === 2) {
    const p1 = userProjects[0];
    const p2 = userProjects[1];
    const p1Rank = p1.aiScore >= p2.aiScore ? 1 : 2;
    const p2Rank = p2.aiScore > p1.aiScore ? 1 : 2;

    const anchor1: BenchmarkProjectAnchor = {
      id: p1.id,
      name: p1.projectName,
      score: p1.aiScore,
      moralVirtue: p1.targetMoralVirtue,
      summary: p1.proposalDetails ? (p1.proposalDetails.slice(0, 140) + '...') : 'กิจกรรมปรับเปลี่ยนพฤติกรรมคุณธรรม',
      rank: p1Rank,
      isMax: p1Rank === 1,
      isMin: p1Rank === 2,
      targetArea: p1.targetArea,
      targetAudience: p1.targetAudience,
      proposalDetails: p1.proposalDetails,
      activityPlan: p1.activityPlan,
      behavioralKpi: p1.behavioralKpi,
      budgetTimeline: p1.budgetTimeline
    };

    const anchor2: BenchmarkProjectAnchor = {
      id: p2.id,
      name: p2.projectName,
      score: p2.aiScore,
      moralVirtue: p2.targetMoralVirtue,
      summary: p2.proposalDetails ? (p2.proposalDetails.slice(0, 140) + '...') : 'กิจกรรมปรับเปลี่ยนพฤติกรรมคุณธรรม',
      rank: p2Rank,
      isMax: p2Rank === 1,
      isMin: p2Rank === 2,
      targetArea: p2.targetArea,
      targetAudience: p2.targetAudience,
      proposalDetails: p2.proposalDetails,
      activityPlan: p2.activityPlan,
      behavioralKpi: p2.behavioralKpi,
      budgetTimeline: p2.budgetTimeline
    };

    const sortedTwo = [anchor1, anchor2].sort((a, b) => b.score - a.score);

    return {
      sequenceNumber: 3,
      mode: 'third_project_compare_prior_two',
      modeLabel: 'โครงการที่สาม: เปรียบเทียบกับโครงการที่หนึ่งและโครงการที่สองร่วมกันตามเกณฑ์',
      topAnchors: sortedTwo,
      highestProject: sortedTwo[0],
      lowestProject: sortedTwo[1],
      comparativeRationale: `มีโครงการส่งเข้าสู่ระบบแล้ว 2 โครงการ (โครงการที่หนึ่ง "${p1.projectName}" • ${p1.aiScore.toFixed(2)} คะแนน และโครงการที่สอง "${p2.projectName}" • ${p2.aiScore.toFixed(2)} คะแนน) ระบบจะแนบทั้งสองโครงการนี้ไปเปรียบเทียบตามเกณฑ์ด้านต่างๆ พร้อมกันเพื่อหาคะแนนที่เหมาะสมของโครงการที่สามตามจริง`,
      totalPriorProjects: 2
    };
  }

  // total >= 3: pick Top 3 projects sorted by score descending
  const sorted = [...userProjects].sort((a, b) => b.aiScore - a.aiScore);
  const topProjects = sorted.slice(0, 3);
  const topAnchors: BenchmarkProjectAnchor[] = topProjects.map((p, idx) => ({
    id: p.id,
    name: p.projectName,
    score: p.aiScore,
    moralVirtue: p.targetMoralVirtue,
    summary: p.proposalDetails ? (p.proposalDetails.slice(0, 140) + '...') : 'กิจกรรมปรับเปลี่ยนพฤติกรรมคุณธรรม',
    rank: idx + 1,
    isMax: idx === 0,
    isMin: idx === topProjects.length - 1,
    targetArea: p.targetArea,
    targetAudience: p.targetAudience,
    proposalDetails: p.proposalDetails,
    activityPlan: p.activityPlan,
    behavioralKpi: p.behavioralKpi,
    budgetTimeline: p.budgetTimeline
  }));

  const maxProj = topAnchors[0];
  const minProj = sorted[sorted.length - 1];
  const topCount = topAnchors.length;
  const topNamesSummary = topAnchors.map((a) => `อันดับ #${a.rank} "${a.name}" (${a.score.toFixed(2)} คะแนน)`).join(', ');

  return {
    sequenceNumber: total + 1,
    mode: 'multi_project_compare_top3',
    modeLabel: `โครงการที่ ${total + 1}: เปรียบเทียบกับ 3 โครงการที่มีคะแนนสูงสุดก่อนหน้า (${topNamesSummary})`,
    topAnchors,
    highestProject: maxProj,
    lowestProject: minProj ? {
      id: minProj.id,
      name: minProj.projectName,
      score: minProj.aiScore,
      moralVirtue: minProj.targetMoralVirtue,
      summary: minProj.proposalDetails ? (minProj.proposalDetails.slice(0, 140) + '...') : 'กิจกรรมปรับเปลี่ยนพฤติกรรมคุณธรรม',
      isMin: true,
      targetArea: minProj.targetArea,
      targetAudience: minProj.targetAudience,
      proposalDetails: minProj.proposalDetails,
      activityPlan: minProj.activityPlan,
      behavioralKpi: minProj.behavioralKpi,
      budgetTimeline: minProj.budgetTimeline
    } : topAnchors[topAnchors.length - 1],
    comparativeRationale: `ระบบมีโครงการที่ส่งเข้ามาก่อนหน้าแล้ว ${total} โครงการ จึงนำ 3 โครงการที่มีคะแนนสูงสุดก่อนหน้า (${topNamesSummary}) แนบเข้าไปเพื่อเปรียบเทียบว่าคะแนนของโครงการตนเองควรจะได้เท่าไหร่ตามเกณฑ์การให้คะแนนอย่างเที่ยงธรรม`,
    totalPriorProjects: total
  };
}

// ----------------------------------------------------------------------------
// SQLITE PERSISTENCE API FUNCTIONS (WITH LOCAL STORAGE MIRROR)
// ----------------------------------------------------------------------------

export async function fetchHackathonProjectsFromDb(province?: PilotProvinceName): Promise<HackathonProject[]> {
  try {
    const url = province
      ? `/api/pilot-sqlite/hackathon-projects?province=${encodeURIComponent(province)}`
      : '/api/pilot-sqlite/hackathon-projects';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        const rawDbProjects = data.data as HackathonProject[];
        const dbProjects = rawDbProjects.filter(
          p => p && p.id && !p.id.startsWith('precheck-') && !isSeedHackathonProject(p.id)
        );
        if (typeof window !== 'undefined' && dbProjects.length > 0) {
          const currentAll = getHackathonProjects();
          const dbMap = new Map(dbProjects.map(p => [p.id, p]));
          const merged = [...dbProjects, ...currentAll.filter(p => !dbMap.has(p.id))];
          localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(merged));

          const currentSubmitted = getUserSubmittedProjects(province);
          const submittedMap = new Map(currentSubmitted.map(p => [p.id, p]));
          for (const p of dbProjects) {
            submittedMap.set(p.id, p);
          }
          localStorage.setItem(STORAGE_KEY_USER_SUBMITTED_PROJECTS, JSON.stringify(Array.from(submittedMap.values())));
        }
        return dbProjects;
      }
    }
  } catch (err) {
    console.warn('SQLite fetchHackathonProjects fallback to local:', err);
  }
  return getUserSubmittedProjects(province);
}

export async function saveHackathonProjectToDb(
  project: HackathonProject,
  isPrecheck: boolean = false
): Promise<{ success: boolean; id: string; dbPath?: string }> {
  try {
    const res = await fetch('/api/pilot-sqlite/hackathon-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...project, isPrecheck })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, id: data.id || project.id, dbPath: data.dbPath };
    }
  } catch (err) {
    console.warn('SQLite saveHackathonProjectToDb fallback to local:', err);
  }
  return { success: true, id: project.id };
}

export async function resetHackathonDatabaseFromApi(
  province?: PilotProvinceName
): Promise<{ success: boolean; message: string; deletedCount: number }> {
  resetSubmittedProjectsSession(province);
  try {
    const res = await fetch('/api/pilot-sqlite/hackathon-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ province })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message || 'รีเซ็ตฐานข้อมูลโครงการ Hackathon เรียบร้อยแล้ว',
        deletedCount: data.deletedCount || 0
      };
    }
  } catch (err) {
    console.warn('SQLite resetHackathonDatabaseFromApi fallback:', err);
  }
  return { success: true, message: 'รีเซ็ตข้อมูลโครงการเรียบร้อยแล้ว (Local Mode)', deletedCount: 0 };
}

/**
 * ลบโครงการ Hackathon รายโครงการ (เฉพาะ Admin) ทั้งใน SQLite และ Local Storage
 */
export async function deleteHackathonProject(
  projectId: string
): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined') return { success: false, message: 'Window is undefined' };

  // 1. Remove from STORAGE_KEY_USER_SUBMITTED_PROJECTS
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY_USER_SUBMITTED_PROJECTS);
    if (rawUser) {
      const userProjects: HackathonProject[] = JSON.parse(rawUser);
      const filteredUser = userProjects.filter((p) => p.id !== projectId);
      localStorage.setItem(STORAGE_KEY_USER_SUBMITTED_PROJECTS, JSON.stringify(filteredUser));
    }
  } catch (e) {
    console.error('deleteHackathonProject: failed to update user submitted projects:', e);
  }

  // 2. Remove from STORAGE_KEY_PROJECTS
  try {
    const rawAll = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (rawAll) {
      const allProjects: HackathonProject[] = JSON.parse(rawAll);
      const filteredAll = allProjects.filter((p) => p.id !== projectId);
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(filteredAll));
    }
  } catch (e) {
    console.error('deleteHackathonProject: failed to update all projects:', e);
  }

  // 3. Remove votes for this project
  try {
    const rawVotes = localStorage.getItem(STORAGE_KEY_VOTES);
    if (rawVotes) {
      const votes = JSON.parse(rawVotes);
      if (votes[projectId]) {
        delete votes[projectId];
        localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(votes));
      }
    }
  } catch (e) {
    console.error('deleteHackathonProject: failed to update votes:', e);
  }

  // 4. Delete from SQLite database via API
  try {
    const res = await fetch('/api/pilot-sqlite/project-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message || `ลบโครงการรหัส ${projectId} เรียบร้อยแล้ว`
      };
    }
  } catch (err) {
    console.warn('SQLite deleteHackathonProject fallback:', err);
  }

  return { success: true, message: `ลบโครงการรหัส ${projectId} เรียบร้อยแล้ว (Local)` };
}

/**
 * ลบข้อมูลผู้ลงทะเบียนทั้งหมดจากตาราง pilot_agency_registrations
 */
export async function resetRegistrationsDatabaseFromApi(
  province?: PilotProvinceName | 'ALL'
): Promise<{ success: boolean; message: string; deletedCount: number }> {
  // 1. เคลียร์ LocalStorage แคชของการลงทะเบียน
  if (typeof window !== 'undefined') {
    try {
      const LOCAL_AGENCIES_FALLBACK_KEY = 'pilot_4regions_agencies_sqlite_mirror_v1';
      if (province && province !== 'ALL') {
        const raw = localStorage.getItem(LOCAL_AGENCIES_FALLBACK_KEY);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const filtered = list.filter((a: any) => a.province !== province);
            localStorage.setItem(LOCAL_AGENCIES_FALLBACK_KEY, JSON.stringify(filtered));
          }
        }
      } else {
        localStorage.removeItem(LOCAL_AGENCIES_FALLBACK_KEY);
        localStorage.removeItem('pilot_agency_registrations_v1');
      }
    } catch (err) {
      console.warn('Error clearing registration local storage:', err);
    }
  }

  // 2. ส่งคำขอลบไปยัง SQLite API
  try {
    const provQuery = province && province !== 'ALL' ? `?province=${encodeURIComponent(province)}` : '';
    const res = await fetch(`/api/pilot-sqlite/reset-registrations${provQuery}`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message || 'ลบข้อมูลลงทะเบียนจากตารางเรียบร้อยแล้ว',
        deletedCount: data.deletedCount || 0
      };
    }
  } catch (err) {
    console.warn('SQLite resetRegistrationsDatabaseFromApi fallback:', err);
  }

  return {
    success: true,
    message: 'ลบข้อมูลลงทะเบียนจากระบบเรียบร้อยแล้ว (Local Fallback)',
    deletedCount: 0
  };
}

/**
 * ลบข้อมูลในตารางทั้งหมดของระบบกิจกรรมและการโหวตโครงการ (4 ตาราง):
 * 1. pilot_hackathon_projects
 * 2. pilot_hackathon_criteria
 * 3. pilot_agency_registrations
 * 4. pilot_lessons_and_policies
 */
export async function clearActivityVoteDatabase(): Promise<{
  success: boolean;
  message: string;
  totalDeleted: number;
  deletedCounts: Record<string, number>;
}> {
  // 1. Clear local storage records related to activity and voting
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('pilot_hackathon_projects');
      localStorage.removeItem('pilot_hackathon_current_session_v1');
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('pilot_hackathon_') ||
            key.startsWith('hackathon_vote') ||
            key.startsWith('pilot_agency_') ||
            key.startsWith('pilot_lesson_'))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Error clearing localStorage for activity vote:', e);
    }
  }

  // 2. Call backend SQLite endpoint to wipe all 4 tables in data/pilot_activities_4regions.sqlite
  try {
    const res = await fetch('/api/pilot-sqlite/clear-activity-vote-system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message || 'ลบข้อมูลในตารางทั้งหมดของระบบกิจกรรมและการโหวตโครงการเรียบร้อยแล้ว',
        totalDeleted: data.totalDeleted || 0,
        deletedCounts: data.deletedCounts || {}
      };
    }
  } catch (err) {
    console.warn('clearActivityVoteDatabase SQLite endpoint error:', err);
  }

  return {
    success: true,
    message: 'ลบข้อมูลระบบกิจกรรมและการโหวตโครงการในเครื่องเรียบร้อยแล้ว (Local Mode)',
    totalDeleted: 0,
    deletedCounts: {}
  };
}

// ==========================================
// SQLITE & SYSTEM DATABASE TABLES EXPLORER SERVICES
// ==========================================
import {
  MORAL_CREDIT_MEMBERS,
  MORAL_CREDIT_RAW_ROWS,
  MORAL_CREDIT_TOP_DEEDS,
  MORAL_CREDIT_AGENCIES_SUMMARY,
  MORAL_CREDIT_PROVINCES_SUMMARY
} from './moralCreditData';
import {
  MDC_LECTURERS_DIRECTORY,
  MDC_PROVINCE_STATS_MAP,
  MDC_LECTURERS_SUMMARY
} from './moralLecturersData';

export type DbTableCategoryKey =
  | 'all'
  | 'pms'
  | 'activity_vote'
  | 'synergy'
  | 'moral_index'
  | 'lifecapital'
  | 'moral_credit'
  | 'moral_lecturers';

export interface DbCategoryMeta {
  key: DbTableCategoryKey;
  label: string;
  iconName: string;
  badgeColor: string;
  badgeBg: string;
  description: string;
}

export const DB_CATEGORIES: DbCategoryMeta[] = [
  {
    key: 'all',
    label: 'ทั้งหมด',
    iconName: 'Layers',
    badgeColor: '#1e293b',
    badgeBg: '#f1f5f9',
    description: 'แสดงตารางฐานข้อมูลทั้งหมดในระบบ'
  },
  {
    key: 'pms',
    label: 'โครงการ (PMS)',
    iconName: 'FolderKanban',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    description: 'ตารางระบบบริหารโครงการยุทธศาสตร์และแผนงานคุณธรรม (PMS & Strategic Tasks)'
  },
  {
    key: 'activity_vote',
    label: 'กิจกรรม & โหวตโครงการ',
    iconName: 'Activity',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    description: 'ตารางกิจกรรมนำร่อง 4 จังหวัด, แฮกกาธอน, และผลการโหวตข้อเสนอโครงการ'
  },
  {
    key: 'synergy',
    label: 'Synergy (บูรณาการ)',
    iconName: 'Network',
    badgeColor: '#0891b2',
    badgeBg: '#ecfeff',
    description: 'ตารางข้อมูลสถิติบูรณาการข้ามหน่วยงาน (TPMAP, อุบัติเหตุ, อาชญากรรม, ผู้สูงอายุ, ธปท.)'
  },
  {
    key: 'moral_index',
    label: 'ดัชนีคุณธรรม',
    iconName: 'LineChart',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    description: 'ตารางดัชนีคุณธรรม 5 มิติระดับประเทศ รายภาค รายเพศ และกลุ่มวัย'
  },
  {
    key: 'lifecapital',
    label: 'ทุนชีวิต',
    iconName: 'Sprout',
    badgeColor: '#d97706',
    badgeBg: '#fffbeb',
    description: 'ตารางข้อมูลทุนชีวิต 4 มิติระดับประเทศ รายภูมิภาค และกลุ่มประชากร'
  },
  {
    key: 'moral_credit',
    label: 'Moral Credit',
    iconName: 'Coins',
    badgeColor: '#ea580c',
    badgeBg: '#fff7ed',
    description: 'ตารางทะเบียนสมาชิกและประวัติการสะสมหน่วยกิตความดี'
  },
  {
    key: 'moral_lecturers',
    label: 'วิทยากรคุณธรรม',
    iconName: 'GraduationCap',
    badgeColor: '#e11d48',
    badgeBg: '#fff1f2',
    description: 'ตารางทำเนียบวิทยากรและโค้ชคุณธรรมทั่วประเทศ 5,346 คน'
  }
];

export interface SqliteTableMeta {
  name: string;
  displayName: string;
  category: DbTableCategoryKey;
  systemName: string;
  sourceType: 'sqlite' | 'duckdb' | 'dataset';
  rowCount: number;
  columnCount: number;
  columns: string[];
  description?: string;
  icon?: string;
}

export interface SqliteTableColumnMeta {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export interface SqliteTableDataResponse {
  ok: boolean;
  tableName: string;
  rowCount: number;
  columns: SqliteTableColumnMeta[];
  rows: any[];
  dbPath?: string;
  error?: string;
}

const TABLE_META_DICTIONARY: Record<string, { displayName: string; category: DbTableCategoryKey; systemName: string; description: string }> = {
  // PMS
  task_project: {
    displayName: 'ภารกิจและกิจกรรมดำเนินงาน (PMS Core Tasks)',
    category: 'pms',
    systemName: 'ระบบบริหารโครงการ (PMS)',
    description: 'ข้อมูลภารกิจโครงการรายกิจกรรม 54 รายการ สถานะ ผู้รับผิดชอบ และความคืบหน้า'
  },
  pms_projects: {
    displayName: 'ทะเบียนโครงการยุทธศาสตร์คุณธรรม (PMS Projects)',
    category: 'pms',
    systemName: 'ระบบบริหารโครงการ (PMS)',
    description: 'ทะเบียนโครงการหลัก งบประมาณจัดสรร และหน่วยงานเจ้าของข้อมูล'
  },
  pms_strategic_plans: {
    displayName: 'แผนยุทธศาสตร์และเป้าประสงค์ (PMS Plans)',
    category: 'pms',
    systemName: 'ระบบบริหารโครงการ (PMS)',
    description: 'แผนยุทธศาสตร์คุณธรรม 4 ด้านและตัวชี้วัดความสำเร็จระดับองค์กร'
  },
  pms_kpi_registry: {
    displayName: 'ทะเบียนตัวชี้วัดความสำเร็จ (PMS KPI Registry)',
    category: 'pms',
    systemName: 'ระบบบริหารโครงการ (PMS)',
    description: 'ตัวชี้วัดความสำเร็จ ค่าเป้าหมาย ผลการดำเนินงาน และระดับความเชื่อมั่น AI'
  },
  pms_decision_actions: {
    displayName: 'ข้อสั่งการและการติดตามมติ (PMS Actions)',
    category: 'pms',
    systemName: 'ระบบบริหารโครงการ (PMS)',
    description: 'บันทึกข้อสั่งการจากการประชุมผู้บริหาร และสถานะการติดตาม'
  },
  pms_meeting_reports: {
    displayName: 'รายงานสรุปการประชุมผู้บริหาร (PMS Reports)',
    category: 'pms',
    systemName: 'ระบบบริหารโครงการ (PMS)',
    description: 'รายงานการประชุม ปัญหาอุปสรรค แนวทางแก้ไข และข้อสั่งการ'
  },

  // กิจกรรม & โหวตโครงการ
  pilot_hackathon_projects: {
    displayName: 'โครงการที่ Submit & ตรวจสอบคะแนน Hackathon (pilot_hackathon_projects)',
    category: 'activity_vote',
    systemName: 'กิจกรรม & โหวตโครงการ Hackathon',
    description: 'จัดเก็บข้อมูลโครงการทั้งหมด ทั้งที่ส่งตรวจสอบคะแนน (Pre-submission) และโครงการที่กดยืนยันส่ง (Submit) พร้อมคะแนน AI และผลโหวตชุมชน'
  },
  pilot_hackathon_criteria: {
    displayName: 'เกณฑ์การตัดสินและรูบริกประเมิน Hackathon',
    category: 'activity_vote',
    systemName: 'กิจกรรม & โหวตโครงการ Hackathon',
    description: 'เกณฑ์การตัดสิน 4 มิติ รูบริกคะแนน 100 คะแนนเต็ม'
  },
  pilot_agency_registrations: {
    displayName: 'ข้อมูลการลงทะเบียนผู้ร่วมกิจกรรม 3 ระดับ (pilot_agency_registrations)',
    category: 'activity_vote',
    systemName: 'กิจกรรม & โหวตโครงการ Hackathon',
    description: 'ข้อมูลผู้ลงทะเบียนเข้าร่วมกิจกรรม 3 ระดับ (นโยบาย, ผู้ปฏิบัติการ, ประชาชน) พร้อมตำแหน่ง หน่วยงาน และกลุ่มกาแฟ (ขั้นตอนที่ 1/5)'
  },
  pilot_lessons_and_policies: {
    displayName: 'บทเรียนเชิงนโยบายและมาตรการขับเคลื่อน',
    category: 'activity_vote',
    systemName: 'กิจกรรม & โหวตโครงการ Hackathon',
    description: 'สรุปบทเรียน ถอดบทเรียนพื้นที่ และข้อเสนอแนะเชิงนโยบายสู่การขยายผล'
  },

  // ดัชนีคุณธรรม
  mdc_moral_national_overview: {
    displayName: 'ภาพรวมดัชนีคุณธรรมระดับประเทศ (2565–2568)',
    category: 'moral_index',
    systemName: 'ระบบดัชนีคุณธรรม 5 มิติ (Moral Index)',
    description: 'คะแนนเฉลี่ยคุณธรรม 5 ด้าน: พอเพียง วินัย สุจริต จิตอาสา กตัญญู และระดับคุณธรรมรวม'
  },
  mdc_moral_regional_breakdown: {
    displayName: 'คะแนนคุณธรรม 5 มิติรายภูมิภาคและจังหวัด (2568)',
    category: 'moral_index',
    systemName: 'ระบบดัชนีคุณธรรม 5 มิติ (Moral Index)',
    description: 'คะแนนจำแนกตามภาคเหนือ ตะวันออกเฉียงเหนือ กลาง ใต้ และ 77 จังหวัด'
  },
  mdc_moral_regional_trends: {
    displayName: 'แนวโน้มคะแนนคุณธรรมรายภาค (2565–2567)',
    category: 'moral_index',
    systemName: 'ระบบดัชนีคุณธรรม 5 มิติ (Moral Index)',
    description: 'สถิติการเปลี่ยนแปลงคะแนนคุณธรรมย้อนหลัง 3 ปี จำแนกตาม 6 ภูมิภาคยุทธศาสตร์'
  },
  mdc_moral_gender_breakdown: {
    displayName: 'คะแนนคุณธรรมจำแนกตามเพศสภาพ',
    category: 'moral_index',
    systemName: 'ระบบดัชนีคุณธรรม 5 มิติ (Moral Index)',
    description: 'เปรียบเทียบคะแนนคุณธรรม 5 มิติระหว่างเพศชาย หญิง และกลุ่มความหลากหลาย'
  },
  mdc_moral_age_breakdown: {
    displayName: 'คะแนนคุณธรรมจำแนกตามช่วงวัย (Generations)',
    category: 'moral_index',
    systemName: 'ระบบดัชนีคุณธรรม 5 มิติ (Moral Index)',
    description: 'คะแนนคุณธรรมของเยาวชน (Gen Z), วัยทำงาน (Gen Y/X), และผู้สูงอายุ (Baby Boomer)'
  },

  // ทุนชีวิต
  mdc_lifecapital_national_overview: {
    displayName: 'ภาพรวมคะแนนทุนชีวิตระดับประเทศ (2565–2568)',
    category: 'lifecapital',
    systemName: 'ระบบทุนชีวิต 4 มิติ (Life Capital)',
    description: 'คะแนนเฉลี่ยทุนชีวิต 4 มิติ: ทุนภายในตัวตน ทุนครอบครัว ทุนชุมชน และทุนเพื่อน/ครู'
  },
  mdc_lifecapital_regional_breakdown: {
    displayName: 'คะแนนทุนชีวิต 4 มิติรายภูมิภาคและจังหวัด',
    category: 'lifecapital',
    systemName: 'ระบบทุนชีวิต 4 มิติ (Life Capital)',
    description: 'สถิติทุนชีวิตเด็กและเยาวชนจำแนกตามพื้นที่ ภูมิภาค และจังหวัดนำร่อง'
  },
  mdc_lifecapital_regional_trends: {
    displayName: 'แนวโน้มทุนชีวิตรายปี (2565–2567)',
    category: 'lifecapital',
    systemName: 'ระบบทุนชีวิต 4 มิติ (Life Capital)',
    description: 'ทิศทางการเสริมสร้างภูมิคุ้มกันชีวิตเด็กและเยาวชนในแต่ละภูมิภาค'
  },
  mdc_lifecapital_gender_breakdown: {
    displayName: 'คะแนนทุนชีวิตจำแนกตามเพศ',
    category: 'lifecapital',
    systemName: 'ระบบทุนชีวิต 4 มิติ (Life Capital)',
    description: 'เปรียบเทียบมิติทุนชีวิตระหว่างเยาวชนชายและหญิง'
  },
  mdc_lifecapital_age_breakdown: {
    displayName: 'คะแนนทุนชีวิตจำแนกตามกลุ่มช่วงวัยการศึกษา',
    category: 'lifecapital',
    systemName: 'ระบบทุนชีวิต 4 มิติ (Life Capital)',
    description: 'คะแนนทุนชีวิตระดับประถมศึกษา มัธยมศึกษาตอนต้น มัธยมศึกษาตอนปลาย และอุดมศึกษา'
  },

  // Synergy
  ext_traffic_accidents_provincial: {
    displayName: 'สถิติอุบัติเหตุจราจรรายจังหวัด (คมนาคม)',
    category: 'synergy',
    systemName: 'ระบบบูรณาการข้อมูลร่วม (Synergy Integration)',
    description: 'สถิติการเกิดอุบัติเหตุ จำนวนผู้บาดเจ็บ ผู้เสียชีวิต และจุดเสี่ยงจราจร 77 จังหวัด'
  },
  ext_police_crimes: {
    displayName: 'สถิติคดีอาชญากรรม 5 กลุ่มคดี (ตร.)',
    category: 'synergy',
    systemName: 'ระบบบูรณาการข้อมูลร่วม (Synergy Integration)',
    description: 'สถิติคดีชีวิต ร่างกาย เพศ คดีทรัพย์ คดียาเสพติด และอัตราคดีต่อประชากรแสนคน'
  },
  ext_vulnerable_households: {
    displayName: 'ครัวเรือนเปราะบางยากจน TPMAP 5 มิติ (สศช.)',
    category: 'synergy',
    systemName: 'ระบบบูรณาการข้อมูลร่วม (Synergy Integration)',
    description: 'จำนวนคนจนเป้าหมาย มิติด้านสุขภาพ ความเป็นอยู่ การศึกษา รายได้ และการเข้าถึงบริการรัฐ'
  },
  ext_elderly_health_depression: {
    displayName: 'สุขภาพจิตและภาวะซึมเศร้าในผู้สูงอายุ (กรมอนามัย)',
    category: 'synergy',
    systemName: 'ระบบบูรณาการข้อมูลร่วม (Synergy Integration)',
    description: 'อัตราการคัดกรองภาวะซึมเศร้า (2Q/9Q) และความสุขของผู้สูงอายุรายจังหวัด'
  },
  ext_elderly_welfare_allowance: {
    displayName: 'สถิติการจ่ายเบี้ยยังชีพผู้สูงอายุ (สถ.)',
    category: 'synergy',
    systemName: 'ระบบบูรณาการข้อมูลร่วม (Synergy Integration)',
    description: 'จำนวนผู้สูงอายุที่ได้รับเบี้ยยังชีพตามช่วงอายุและยอดงบประมาณเบี้ยยังชีพ 78 รายการ'
  },
  ext_elderly_living_arrangements: {
    displayName: 'การอยู่อาศัยตามลำพังของผู้สูงอายุ (สถิติแห่งชาติ)',
    category: 'synergy',
    systemName: 'ระบบบูรณาการข้อมูลร่วม (Synergy Integration)',
    description: 'สัดส่วนผู้สูงอายุที่อยู่คนเดียว อยู่กับคู่สมรส หรืออยู่กับบุตรหลานรายจังหวัด'
  },
  ext_demographics_age_gender: {
    displayName: 'โครงสร้างประชากรศาสตร์ตามวัยและเพศ (ทะเบียนราษฎร)',
    category: 'synergy',
    systemName: 'ระบบบูรณาการข้อมูลร่วม (Synergy Integration)',
    description: 'สถิติจำนวนประชากรจำแนกตามกลุ่มวัย เพศชาย-หญิง และอัตราส่วนพึ่งพิงวัยเจริญพันธุ์'
  },
  ext_bot_financial_literacy: {
    displayName: 'ทักษะทางการเงินและพฤติกรรมหนี้สิน (ธปท.)',
    category: 'synergy',
    systemName: 'ระบบบูรณาการข้อมูลร่วม (Synergy Integration)',
    description: 'คะแนนความรู้ทางการเงิน พฤติกรรมการออม และภาระหนี้สินครัวเรือนรายภูมิภาค'
  }
};

function getTableDisplayName(name: string): string {
  if (TABLE_META_DICTIONARY[name]) {
    return TABLE_META_DICTIONARY[name].displayName;
  }
  return name.replace(/_/g, ' ');
}

function getTableDescription(name: string): string {
  if (TABLE_META_DICTIONARY[name]) {
    return TABLE_META_DICTIONARY[name].description;
  }
  return `ตารางฐานข้อมูล ${name}`;
}

export async function fetchSqliteDbTables(): Promise<{ success: boolean; tables: SqliteTableMeta[]; dbPath?: string }> {
  const allTables: SqliteTableMeta[] = [];

  // 1. Fetch SQLite tables (/api/pilot-sqlite/tables)
  try {
    const res = await fetch('/api/pilot-sqlite/tables');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.tables)) {
        for (const t of data.tables) {
          const dict = TABLE_META_DICTIONARY[t.name];
          const isPms = t.name.startsWith('pms_') || t.name === 'task_project';
          allTables.push({
            name: t.name,
            displayName: dict?.displayName || getTableDisplayName(t.name),
            category: dict?.category || (isPms ? 'pms' : 'activity_vote'),
            systemName: dict?.systemName || (isPms ? 'ระบบบริหารโครงการ (PMS)' : 'กิจกรรม & โหวตโครงการ Hackathon'),
            sourceType: 'sqlite',
            rowCount: t.rowCount || 0,
            columnCount: t.columnCount || (t.columns?.length ?? 0),
            columns: t.columns || [],
            description: dict?.description || getTableDescription(t.name)
          });
        }
      }
    }
  } catch (err) {
    console.warn('fetchSqliteDbTables SQLite fallback:', err);
  }

  // Fallback default SQLite tables if none returned
  if (!allTables.some((t) => t.category === 'pms' || t.category === 'activity_vote')) {
    const defaultSqliteNames = [
      'task_project',
      'pms_projects',
      'pms_strategic_plans',
      'pms_kpi_registry',
      'pms_decision_actions',
      'pms_meeting_reports',
      'pilot_hackathon_projects',
      'pilot_hackathon_criteria',
      'pilot_agency_registrations',
      'pilot_lessons_and_policies'
    ];
    for (const name of defaultSqliteNames) {
      const dict = TABLE_META_DICTIONARY[name];
      allTables.push({
        name,
        displayName: dict?.displayName || getTableDisplayName(name),
        category: dict?.category || 'pms',
        systemName: dict?.systemName || 'ระบบบริหารโครงการ (PMS)',
        sourceType: 'sqlite',
        rowCount: name === 'task_project' ? 54 : name === 'pilot_agency_registrations' ? 8 : 0,
        columnCount: 15,
        columns: ['id', 'name', 'created_at'],
        description: dict?.description || getTableDescription(name)
      });
    }
  }

  // 2. Fetch DuckDB tables (/api/duckdb/tables)
  try {
    const res = await fetch('/api/duckdb/tables');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.tables)) {
        for (const t of data.tables) {
          const dict = TABLE_META_DICTIONARY[t.tableName];
          const mod = t.module || '';
          let cat: DbTableCategoryKey = 'synergy';
          let sysName = 'ระบบบูรณาการข้อมูลร่วม (Synergy Integration)';
          if (mod === 'moral_index' || t.tableName.startsWith('mdc_moral_')) {
            cat = 'moral_index';
            sysName = 'ระบบดัชนีคุณธรรม 5 มิติ (Moral Index)';
          } else if (mod === 'life_capital' || t.tableName.startsWith('mdc_lifecapital_')) {
            cat = 'lifecapital';
            sysName = 'ระบบทุนชีวิต 4 มิติ (Life Capital)';
          }

          allTables.push({
            name: t.tableName,
            displayName: t.displayName || dict?.displayName || getTableDisplayName(t.tableName),
            category: dict?.category || cat,
            systemName: dict?.systemName || sysName,
            sourceType: 'duckdb',
            rowCount: t.rowCount || 0,
            columnCount: Array.isArray(t.columns) ? t.columns.length : 0,
            columns: Array.isArray(t.columns) ? t.columns.map((c: any) => typeof c === 'string' ? c : c.name) : [],
            description: t.description || dict?.description || getTableDescription(t.tableName)
          });
        }
      }
    }
  } catch (err) {
    console.warn('fetchSqliteDbTables DuckDB fallback:', err);
  }

  // 3. Add Moral Credit tables
  const moralCreditTables: SqliteTableMeta[] = [
    {
      name: 'moral_credit_members',
      displayName: 'ทะเบียนสมาชิกและคะแนนสะสมหน่วยกิตความดี',
      category: 'moral_credit',
      systemName: 'ระบบสะสมหน่วยกิตความดี (Moral Credit)',
      sourceType: 'dataset',
      rowCount: MORAL_CREDIT_MEMBERS.length,
      columnCount: 12,
      columns: ['memberId', 'fullName', 'agency', 'district', 'province', 'tier', 'totalScore', 'totalFrequency', 'archetype', 'scoreBracketLabel'],
      description: 'รายชื่อสมาชิก คะแนนรวม ความถี่การทำความดี กลุ่มคะแนน (Bracket) และกลุ่มพฤติกรรมคุณธรรม'
    },
    {
      name: 'moral_credit_raw_deeds',
      displayName: 'รายการบันทึกการทำความดีรายธุรกรรม (726 รายการ)',
      category: 'moral_credit',
      systemName: 'ระบบสะสมหน่วยกิตความดี (Moral Credit)',
      sourceType: 'dataset',
      rowCount: MORAL_CREDIT_RAW_ROWS.length,
      columnCount: 12,
      columns: ['rowId', 'memberId', 'fullName', 'agency', 'province', 'deedTitle', 'category', 'frequency', 'points', 'memberTotalScore'],
      description: 'บันทึกกิจกรรมความดีรายครั้ง หมวดหมู่ความดี คะแนนที่ได้รับ หน่วยงาน และจังหวัด'
    },
    {
      name: 'moral_credit_top_deeds',
      displayName: 'สถิติพฤติกรรมการทำความดียอดนิยม (Top Deeds)',
      category: 'moral_credit',
      systemName: 'ระบบสะสมหน่วยกิตความดี (Moral Credit)',
      sourceType: 'dataset',
      rowCount: MORAL_CREDIT_TOP_DEEDS.length,
      columnCount: 6,
      columns: ['deedTitle', 'category', 'totalFrequency', 'totalPoints', 'participantCount', 'avgPointsPerRecord'],
      description: 'ประเภทกิจกรรมจิตอาสา การเสียสละ และวินัยที่สมาชิกเข้าร่วมบ่อยที่สุด'
    },
    {
      name: 'moral_credit_agencies',
      displayName: 'สรุปสถิติหน่วยกิตความดีตามองค์กร/สังกัด',
      category: 'moral_credit',
      systemName: 'ระบบสะสมหน่วยกิตความดี (Moral Credit)',
      sourceType: 'dataset',
      rowCount: MORAL_CREDIT_AGENCIES_SUMMARY.length,
      columnCount: 6,
      columns: ['agency', 'agencyShort', 'totalMembers', 'activeMembers', 'totalScore', 'avgScorePerMember'],
      description: 'จำนวนสมาชิก คะแนนรวมเฉลี่ย และผลงานของโรงเรียน อบต. และหน่วยงานภาคี'
    },
    {
      name: 'moral_credit_provinces',
      displayName: 'สรุปการสะสมหน่วยกิตความดีรายจังหวัด',
      category: 'moral_credit',
      systemName: 'ระบบสะสมหน่วยกิตความดี (Moral Credit)',
      sourceType: 'dataset',
      rowCount: MORAL_CREDIT_PROVINCES_SUMMARY.length,
      columnCount: 4,
      columns: ['province', 'totalMembers', 'totalScore', 'avgScorePerMember'],
      description: 'การกระจายตัวของสมาชิกและการทำความดีในพื้นที่จังหวัดต่างๆ'
    }
  ];
  allTables.push(...moralCreditTables);

  // 4. Add Moral Lecturers tables
  const moralLecturersTables: SqliteTableMeta[] = [
    {
      name: 'moral_lecturers_directory',
      displayName: 'ทะเบียนวิทยากรและโค้ชคุณธรรมทั่วประเทศ (5,346 คน)',
      category: 'moral_lecturers',
      systemName: 'ระบบทำเนียบวิทยากรคุณธรรม',
      sourceType: 'dataset',
      rowCount: MDC_LECTURERS_DIRECTORY.length,
      columnCount: 14,
      columns: ['id', 'username', 'name', 'province', 'district', 'subDistrict', 'region', 'level', 'levelShort', 'year', 'competency', 'sector', 'status'],
      description: 'รายนามวิทยากร ระดับ (Coach / New Comer) พื้นที่ปฏิบัติงาน สมรรถนะ และสถานะความพร้อม'
    },
    {
      name: 'moral_lecturers_provinces',
      displayName: 'สถิติวิทยากรคุณธรรมรายจังหวัด 76 จังหวัด',
      category: 'moral_lecturers',
      systemName: 'ระบบทำเนียบวิทยากรคุณธรรม',
      sourceType: 'dataset',
      rowCount: Object.keys(MDC_PROVINCE_STATS_MAP).length,
      columnCount: 12,
      columns: ['province', 'region', 'total', 'coach', 'newComer', 'activeVerified', 'competencySufficiency', 'competencyDiscipline', 'competencyVolunteer', 'competencyHonesty', 'competencyGratitude'],
      description: 'จำนวนวิทยากร โค้ช สมรรถนะความเชี่ยวชาญ 5 ด้าน และภาคีสถาบันการศึกษา/ศาสนา/รัฐ'
    },
    {
      name: 'moral_lecturers_summary',
      displayName: 'สรุปภาพรวมและตัวชี้วัดวิทยากรระดับประเทศ',
      category: 'moral_lecturers',
      systemName: 'ระบบทำเนียบวิทยากรคุณธรรม',
      sourceType: 'dataset',
      rowCount: 9,
      columnCount: 3,
      columns: ['metric', 'value', 'note'],
      description: 'ยอดรวมวิทยากร สัดส่วนผ่านการอบรม ความยินยอม PDPA และความครอบคลุมพื้นที่'
    }
  ];
  allTables.push(...moralLecturersTables);

  return {
    success: true,
    tables: allTables,
    dbPath: 'data/pilot_activities_4regions.sqlite & duckdb_tables'
  };
}

export async function fetchSqliteTableData(tableName: string): Promise<SqliteTableDataResponse> {
  // A. Moral Credit In-Memory Datasets
  if (tableName.startsWith('moral_credit_')) {
    let rows: any[] = [];
    if (tableName === 'moral_credit_members') {
      rows = MORAL_CREDIT_MEMBERS.map((m) => ({
        memberId: m.memberId,
        fullName: m.fullName,
        agency: m.agency,
        agencyShort: m.agencyShort,
        district: m.district,
        province: m.province,
        tier: m.tier,
        totalScore: m.totalScore,
        totalFrequency: m.totalFrequency,
        deedTypesCount: m.deedTypesCount,
        archetype: m.archetype,
        scoreBracketLabel: m.scoreBracketLabel
      }));
    } else if (tableName === 'moral_credit_raw_deeds') {
      rows = MORAL_CREDIT_RAW_ROWS.map((r) => ({
        rowId: r.rowId,
        memberId: r.memberId,
        fullName: r.fullName,
        agency: r.agency,
        district: r.district,
        province: r.province,
        tier: r.tier,
        deedTitle: r.deedTitle,
        category: r.category,
        frequency: r.frequency,
        points: r.points,
        memberTotalScore: r.memberTotalScore
      }));
    } else if (tableName === 'moral_credit_top_deeds') {
      rows = MORAL_CREDIT_TOP_DEEDS.map((d) => ({
        deedTitle: d.deedTitle,
        category: d.category,
        totalFrequency: d.totalFrequency,
        totalPoints: d.totalPoints,
        participantsCount: d.participantsCount,
        avgPointsPerTime: d.avgPointsPerTime
      }));
    } else if (tableName === 'moral_credit_agencies') {
      rows = MORAL_CREDIT_AGENCIES_SUMMARY.map((a) => ({
        agency: a.agency,
        agencyShort: a.agencyShort,
        totalMembers: a.totalMembers,
        activeMembers: a.activeMembers,
        totalPoints: a.totalPoints,
        totalFrequency: a.totalFrequency
      }));
    } else if (tableName === 'moral_credit_provinces') {
      rows = MORAL_CREDIT_PROVINCES_SUMMARY.map((p) => ({
        province: p.province,
        totalMembers: p.totalMembers,
        activeMembers: p.activeMembers,
        totalPoints: p.totalPoints,
        totalFrequency: p.totalFrequency,
        topCategory: p.topCategory
      }));
    }

    const sample = rows[0] || {};
    const columns: SqliteTableColumnMeta[] = Object.keys(sample).map((key, idx) => ({
      cid: idx,
      name: key,
      type: typeof sample[key] === 'number' ? 'NUMERIC' : 'TEXT',
      notnull: 0,
      dflt_value: null,
      pk: idx === 0 ? 1 : 0
    }));

    return {
      ok: true,
      tableName,
      rowCount: rows.length,
      columns,
      rows,
      dbPath: 'src/components/moral-center/data/moralCreditData.ts'
    };
  }

  // B. Moral Lecturers In-Memory Datasets
  if (tableName.startsWith('moral_lecturers_')) {
    let rows: any[] = [];
    if (tableName === 'moral_lecturers_directory') {
      rows = MDC_LECTURERS_DIRECTORY.slice(0, 1000).map((l) => ({
        id: l.id,
        username: l.username,
        name: l.name,
        province: l.province,
        district: l.district,
        subDistrict: l.subDistrict,
        region: l.region,
        level: l.level,
        levelShort: l.levelShort,
        year: l.year,
        competency: l.competency,
        sector: l.sector,
        targetGroup: l.targetGroup,
        status: l.status
      }));
    } else if (tableName === 'moral_lecturers_provinces') {
      rows = Object.values(MDC_PROVINCE_STATS_MAP).map((p) => ({
        province: p.province,
        region: p.region,
        total: p.total,
        coach: p.coach,
        newComer: p.newComer,
        activeVerified: p.activeVerified,
        pdpaConsent: p.pdpaConsent,
        paccNetwork: p.paccNetwork,
        competencySufficiency: p.competencies?.['พอเพียง'] ?? 0,
        competencyDiscipline: p.competencies?.['วินัยและความรับผิดชอบ'] ?? 0,
        competencyVolunteer: p.competencies?.['จิตอาสา'] ?? 0,
        competencyHonesty: p.competencies?.['สุจริต'] ?? 0,
        competencyGratitude: p.competencies?.['กตัญญู'] ?? 0
      }));
    } else if (tableName === 'moral_lecturers_summary') {
      rows = [
        { metric: 'จำนวนวิทยากรทั้งหมดในทำเนียบ', value: MDC_LECTURERS_SUMMARY.totalLecturers, note: 'คน' },
        { metric: 'จำนวนจังหวัดที่มีวิทยากรปฏิบัติงาน', value: `${MDC_LECTURERS_SUMMARY.coveredProvinces} / ${MDC_LECTURERS_SUMMARY.totalProvinces}`, note: 'จังหวัด' },
        { metric: 'กลุ่มโค้ชและวิทยากรผู้เชี่ยวชาญ (Coach)', value: MDC_LECTURERS_SUMMARY.coachCount, note: 'คน' },
        { metric: 'กลุ่มวิทยากรใหม่เพื่อการพัฒนา (New Comer)', value: MDC_LECTURERS_SUMMARY.newComerCount, note: 'คน' },
        { metric: 'วิทยากรที่พร้อมปฏิบัติงานและผ่านการยืนยัน', value: MDC_LECTURERS_SUMMARY.activeVerifiedCount, note: 'คน' },
        { metric: 'วิทยากรที่ให้ความยินยอม PDPA', value: MDC_LECTURERS_SUMMARY.pdpaConsentCount, note: 'คน' },
        { metric: 'หลักสูตร ป.ป.ท. (PACC Track)', value: MDC_LECTURERS_SUMMARY.paccTrackCount, note: 'คน' },
        { metric: 'หลักสูตรโค้ชคุณธรรม (Coach Track)', value: MDC_LECTURERS_SUMMARY.coachTrackCount, note: 'คน' },
        { metric: 'หลักสูตรขยายผลพื้นที่ (Area Track)', value: MDC_LECTURERS_SUMMARY.areaExpansionTrackCount, note: 'คน' }
      ];
    }

    const sample = rows[0] || {};
    const columns: SqliteTableColumnMeta[] = Object.keys(sample).map((key, idx) => ({
      cid: idx,
      name: key,
      type: typeof sample[key] === 'number' ? 'NUMERIC' : 'TEXT',
      notnull: 0,
      dflt_value: null,
      pk: idx === 0 ? 1 : 0
    }));

    return {
      ok: true,
      tableName,
      rowCount: rows.length,
      columns,
      rows,
      dbPath: 'src/components/moral-center/data/moralLecturersData.ts'
    };
  }

  // C. DuckDB Tables (mdc_moral_*, mdc_lifecapital_*, ext_*)
  if (tableName.startsWith('mdc_') || tableName.startsWith('ext_')) {
    try {
      const res = await fetch(`/api/duckdb/table?name=${encodeURIComponent(tableName)}`);
      if (res.ok) {
        const data = await res.json();
        const rawRows = Array.isArray(data.rows) ? data.rows : [];
        const rawCols = Array.isArray(data.columns) ? data.columns : [];
        const columns: SqliteTableColumnMeta[] = rawCols.map((c: any, idx: number) => ({
          cid: idx,
          name: typeof c === 'string' ? c : c.name || `col_${idx}`,
          type: typeof c === 'object' && c.type ? c.type : 'TEXT',
          notnull: 0,
          dflt_value: null,
          pk: 0
        }));

        return {
          ok: true,
          tableName,
          rowCount: rawRows.length,
          columns,
          rows: rawRows,
          dbPath: `public/data/duckdb_tables/${tableName}.json`
        };
      }
    } catch (err) {
      console.warn(`DuckDB fetch for ${tableName} failed:`, err);
    }
  }

  // D. SQLite Database Tables (pilot_*, pms_*, task_project)
  try {
    const res = await fetch(`/api/pilot-sqlite/table-data?table=${encodeURIComponent(tableName)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok) {
        return data as SqliteTableDataResponse;
      }
    }
  } catch (err) {
    console.warn(`fetchSqliteTableData for ${tableName} fallback:`, err);
  }

  return {
    ok: false,
    tableName,
    rowCount: 0,
    columns: [],
    rows: [],
    error: 'ไม่สามารถดึงข้อมูลตารางได้ หรือยังไม่ได้เริ่มระบบ API'
  };
}

export async function getComparativeBenchmarkAnchorsFromDb(
  province?: PilotProvinceName
): Promise<ComparativeEvaluationContext> {
  let dbProjects = await fetchHackathonProjectsFromDb(province);
  if (!dbProjects || dbProjects.length === 0) {
    const local = getUserSubmittedProjects(province);
    if (local && local.length > 0) {
      dbProjects = local;
    }
  }
  const total = dbProjects.length;

  if (total === 0) {
    return {
      sequenceNumber: 1,
      mode: 'first_project_rubric_real',
      modeLabel: 'โครงการแรกที่ส่งเข้าแข่งขัน: ตรวจคะแนนตามเกณฑ์คุณธรรมที่เลือก (ตรวจตามจริง ไม่จำกัดเพดานคะแนน)',
      comparativeRationale: 'เป็นโครงการแรกในฐานข้อมูล SQLite ยังไม่มีโครงการก่อนหน้าในระบบ จึงเริ่มต้นตรวจประเมินตามเกณฑ์คุณธรรมที่เลือกตามจริง (ไม่มีการจำกัดเพดาน 80 คะแนน) และใช้โครงการนี้เป็นตัวตั้งหลัก (Baseline Anchor) สำหรับเปรียบเทียบโครงการถัดไป',
      totalPriorProjects: 0
    };
  }

  if (total === 1) {
    const p1 = dbProjects[0];
    const summary = p1.proposalDetails ? (p1.proposalDetails.slice(0, 140) + '...') : 'กิจกรรมปรับเปลี่ยนพฤติกรรมคุณธรรม';
    const anchor1: BenchmarkProjectAnchor = {
      id: p1.id,
      name: p1.projectName,
      score: p1.aiScore,
      moralVirtue: p1.targetMoralVirtue,
      summary,
      rank: 1,
      isMax: true,
      targetArea: p1.targetArea,
      targetAudience: p1.targetAudience,
      proposalDetails: p1.proposalDetails,
      activityPlan: p1.activityPlan,
      behavioralKpi: p1.behavioralKpi,
      budgetTimeline: p1.budgetTimeline
    };
    return {
      sequenceNumber: 2,
      mode: 'second_project_compare_first',
      modeLabel: 'โครงการที่สอง: เปรียบเทียบกับโครงการแรกว่าใครดีกว่าหรือแย่กว่าตามเกณฑ์',
      anchorProject1: anchor1,
      topAnchors: [anchor1],
      highestProject: anchor1,
      lowestProject: anchor1,
      comparativeRationale: `มีโครงการแรกในฐานข้อมูล SQLite แล้ว 1 โครงการ ("${p1.projectName}" • ${p1.aiScore.toFixed(2)} คะแนน) ระบบจะนำโครงการแรกมาเป็นตัวตั้งและเกณฑ์อ้างอิงหลักเพื่อวิเคราะห์เปรียบเทียบว่าโครงการที่สองนี้ดีกว่าหรือแย่กว่าตามเกณฑ์ แล้วจึงคำนวณคะแนนตามจริงออกมา`,
      totalPriorProjects: 1
    };
  }

  if (total === 2) {
    const p1 = dbProjects[0];
    const p2 = dbProjects[1];
    const p1Rank = p1.aiScore >= p2.aiScore ? 1 : 2;
    const p2Rank = p2.aiScore > p1.aiScore ? 1 : 2;

    const anchor1: BenchmarkProjectAnchor = {
      id: p1.id,
      name: p1.projectName,
      score: p1.aiScore,
      moralVirtue: p1.targetMoralVirtue,
      summary: p1.proposalDetails ? (p1.proposalDetails.slice(0, 140) + '...') : 'กิจกรรมปรับเปลี่ยนพฤติกรรมคุณธรรม',
      rank: p1Rank,
      isMax: p1Rank === 1,
      isMin: p1Rank === 2,
      targetArea: p1.targetArea,
      targetAudience: p1.targetAudience,
      proposalDetails: p1.proposalDetails,
      activityPlan: p1.activityPlan,
      behavioralKpi: p1.behavioralKpi,
      budgetTimeline: p1.budgetTimeline
    };

    const anchor2: BenchmarkProjectAnchor = {
      id: p2.id,
      name: p2.projectName,
      score: p2.aiScore,
      moralVirtue: p2.targetMoralVirtue,
      summary: p2.proposalDetails ? (p2.proposalDetails.slice(0, 140) + '...') : 'กิจกรรมปรับเปลี่ยนพฤติกรรมคุณธรรม',
      rank: p2Rank,
      isMax: p2Rank === 1,
      isMin: p2Rank === 2,
      targetArea: p2.targetArea,
      targetAudience: p2.targetAudience,
      proposalDetails: p2.proposalDetails,
      activityPlan: p2.activityPlan,
      behavioralKpi: p2.behavioralKpi,
      budgetTimeline: p2.budgetTimeline
    };

    const sortedTwo = [anchor1, anchor2].sort((a, b) => b.score - a.score);

    return {
      sequenceNumber: 3,
      mode: 'third_project_compare_prior_two',
      modeLabel: 'โครงการที่สาม: เปรียบเทียบกับโครงการที่หนึ่งและโครงการที่สองร่วมกันตามเกณฑ์',
      topAnchors: sortedTwo,
      highestProject: sortedTwo[0],
      lowestProject: sortedTwo[1],
      comparativeRationale: `มีโครงการในระบบ SQLite แล้ว 2 โครงการ (โครงการที่หนึ่ง "${p1.projectName}" • ${p1.aiScore.toFixed(2)} คะแนน และโครงการที่สอง "${p2.projectName}" • ${p2.aiScore.toFixed(2)} คะแนน) ระบบจะแนบทั้งสองโครงการนี้ไปเปรียบเทียบตามเกณฑ์ด้านต่างๆ พร้อมกันเพื่อหาคะแนนที่เหมาะสมของโครงการที่สามตามจริง`,
      totalPriorProjects: 2
    };
  }

  // total >= 3: pick Top 3 projects from database sorted by score descending
  const sorted = [...dbProjects].sort((a, b) => b.aiScore - a.aiScore);
  const topProjects = sorted.slice(0, 3);
  const topAnchors: BenchmarkProjectAnchor[] = topProjects.map((p, idx) => ({
    id: p.id,
    name: p.projectName,
    score: p.aiScore,
    moralVirtue: p.targetMoralVirtue,
    summary: p.proposalDetails ? (p.proposalDetails.slice(0, 140) + '...') : 'กิจกรรมปรับเปลี่ยนพฤติกรรมคุณธรรม',
    rank: idx + 1,
    isMax: idx === 0,
    isMin: idx === topProjects.length - 1,
    targetArea: p.targetArea,
    targetAudience: p.targetAudience,
    proposalDetails: p.proposalDetails,
    activityPlan: p.activityPlan,
    behavioralKpi: p.behavioralKpi,
    budgetTimeline: p.budgetTimeline
  }));

  const maxProj = topAnchors[0];
  const minProj = sorted[sorted.length - 1];
  const topCount = topAnchors.length;
  const topNamesSummary = topAnchors.map((a) => `อันดับ #${a.rank} "${a.name}" (${a.score.toFixed(2)} คะแนน)`).join(', ');

  return {
    sequenceNumber: total + 1,
    mode: 'multi_project_compare_top3',
    modeLabel: `โครงการที่ ${total + 1}: เปรียบเทียบกับ 3 โครงการที่มีคะแนนสูงสุดก่อนหน้าในระบบ SQLite (${topNamesSummary})`,
    topAnchors,
    highestProject: maxProj,
    lowestProject: minProj ? {
      id: minProj.id,
      name: minProj.projectName,
      score: minProj.aiScore,
      moralVirtue: minProj.targetMoralVirtue,
      summary: minProj.proposalDetails ? (minProj.proposalDetails.slice(0, 140) + '...') : 'กิจกรรมปรับเปลี่ยนพฤติกรรมคุณธรรม',
      isMin: true,
      targetArea: minProj.targetArea,
      targetAudience: minProj.targetAudience,
      proposalDetails: minProj.proposalDetails,
      activityPlan: minProj.activityPlan,
      behavioralKpi: minProj.behavioralKpi,
      budgetTimeline: minProj.budgetTimeline
    } : topAnchors[topAnchors.length - 1],
    comparativeRationale: `ระบบมีโครงการในฐานข้อมูล SQLite แล้ว ${total} โครงการ จึงนำ 3 โครงการที่มีคะแนนสูงสุดก่อนหน้า (${topNamesSummary}) แนบเข้าไปเพื่อเปรียบเทียบว่าคะแนนของโครงการตนเองควรจะได้เท่าไหร่ตามเกณฑ์การให้คะแนนอย่างเที่ยงธรรม`,
    totalPriorProjects: total
  };
}

// ----------------------------------------------------------------------------
// SERVICE FUNCTIONS
// ----------------------------------------------------------------------------

const STORAGE_KEY_ACTIVE_VOTER = 'mdc_hackathon_active_voter_fullname';
const STORAGE_KEY_REGISTERED_VOTERS = 'mdc_hackathon_registered_voters_list';

export interface ActiveVoterInfo {
  id: string;
  fullName: string;
  isRegistered: boolean;
  hasVoted: boolean;
  votedProjectId: string | null;
}

/**
 * Normalizes community votes in memory and localStorage so that:
 * - Projects start with 0 votes by default (ยังไม่มีการโหวต = 0)
 * - Votes accurately match the single votes recorded in STORAGE_KEY_VOTES
 */
function normalizeVotesFromStorage(projects: HackathonProject[]): HackathonProject[] {
  if (typeof window === 'undefined') return projects;
  try {
    const votesRaw = localStorage.getItem(STORAGE_KEY_VOTES);
    const votedMap: Record<string, any> = votesRaw ? JSON.parse(votesRaw) : {};
    const voteCounts: Record<string, number> = {};
    for (const [key, val] of Object.entries(votedMap)) {
      if (key.startsWith('single_vote_') && typeof val === 'string') {
        voteCounts[val] = (voteCounts[val] || 0) + 1;
      }
    }
    let changed = false;
    const normalized = projects.map(p => {
      const realVotes = voteCounts[p.id] || 0;
      if (p.communityVotes !== realVotes) {
        changed = true;
        return { ...p, communityVotes: realVotes };
      }
      return p;
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return projects;
  }
}

export function getHackathonProjects(province?: PilotProvinceName, groupKey?: CoffeeGroupKey): HackathonProject[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    let projects: HackathonProject[] = [];
    if (raw) {
      projects = JSON.parse(raw);
    }
    // กรอง Seed projects และ Pre-check ออกอย่างเด็ดขาด: ต้องเป็นโครงการที่ผู้คิดโครงการกด submit เองเท่านั้น
    projects = projects.filter(
      p => p && p.id && !p.id.startsWith('precheck-') && !isSeedHackathonProject(p.id)
    );
    // Normalize votes so unvoted projects strictly have 0 votes
    projects = normalizeVotesFromStorage(projects);
    return filterProjects(projects, province, groupKey);
  } catch (err) {
    console.error('Failed to load hackathon projects:', err);
    return [];
  }
}

function filterProjects(list: HackathonProject[], province?: PilotProvinceName, groupKey?: CoffeeGroupKey): HackathonProject[] {
  return list.filter(p => {
    if (province) {
      const matchProv =
        p.province === province ||
        ((province === 'อุดรธานี' || province === 'กาฬสินธุ์') && (p.province === 'อุดรธานี' || p.province === 'กาฬสินธุ์')) ||
        ((province === 'ลำปาง' || province === 'น่าน') && (p.province === 'ลำปาง' || p.province === 'น่าน'));
      if (!matchProv) return false;
    }
    if (groupKey && p.groupKey !== groupKey) return false;
    return true;
  });
}

export function saveHackathonProject(
  input: Omit<HackathonProject, 'id' | 'createdAt' | 'communityVotes' | 'aiScore' | 'aiScoreBreakdown' | 'aiRecommendations'>,
  customEvaluation?: {
    aiScore: number;
    aiScoreBreakdown: { alignment: number; feasibility: number; innovation: number; participation: number };
    aiRecommendations: string;
  }
): HackathonProject {
  const all = getHackathonProjects();

  let evaluation = customEvaluation;
  if (!evaluation) {
    const compCtx = getComparativeBenchmarkAnchors(input.province);
    const preResult = evaluatePreSubmissionWithRubric(
      {
        projectName: input.projectName,
        targetMoralVirtue: input.targetMoralVirtue,
        targetArea: input.targetArea,
        targetAudience: input.targetAudience,
        proposalDetails: input.proposalDetails,
        activityPlan: input.activityPlan
      },
      input.challengeTopic || '',
      input.evaluatedCriteriaVirtues || [],
      UNIVERSAL_DEFAULT_RUBRIC,
      compCtx
    );
    evaluation = {
      aiScore: preResult.finalScore,
      aiScoreBreakdown: {
        alignment: Number(((preResult.finalScore * 0.3)).toFixed(1)),
        feasibility: Number(((preResult.finalScore * 0.3)).toFixed(1)),
        innovation: Number(((preResult.finalScore * 0.2)).toFixed(1)),
        participation: Number(((preResult.finalScore * 0.2)).toFixed(1))
      },
      aiRecommendations: preResult.comparativeContext.comparativeRationale
    };
  }

  const newProject: HackathonProject = {
    ...input,
    id: `proj-${input.groupKey}-${Date.now()}`,
    aiScore: evaluation.aiScore,
    aiScoreBreakdown: evaluation.aiScoreBreakdown,
    aiRecommendations: evaluation.aiRecommendations,
    challengeTopic: input.challengeTopic,
    evaluatedCriteriaVirtues: input.evaluatedCriteriaVirtues,
    communityVotes: 0, // เริ่มต้นโครงการใหม่ยังไม่มีการโหวต = 0 เสมอ
    createdAt: new Date().toISOString()
  };

  const updated = [newProject, ...all];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updated));

    // Also track in user submitted projects session
    const currentSubmitted = getUserSubmittedProjects(input.province);
    const updatedSubmitted = [
      newProject,
      ...currentSubmitted.filter(p => p.id !== newProject.id && !p.id.startsWith('precheck-') && !isSeedHackathonProject(p.id))
    ];
    localStorage.setItem(STORAGE_KEY_USER_SUBMITTED_PROJECTS, JSON.stringify(updatedSubmitted));

    // Bind proposer's full name to active voter
    if (input.proposerName && input.proposerName.trim() && input.proposerName.trim() !== 'ผู้ร่วมกิจกรรม Hackathon') {
      setActiveVoterByName(input.proposerName.trim());
    }
  }

  // Also persist to SQLite Database
  saveHackathonProjectToDb(newProject, false).catch((err) => {
    console.warn('saveHackathonProjectToDb error:', err);
  });

  return newProject;
}

// ============================================================================
// TOP 3 AI SCREENING & FINAL SCORING CALCULATION (AI 100% PURE SCORING)
// ============================================================================

export interface Top3FinalScoreBreakdown {
  projectId: string;
  projectName: string;
  groupKey: CoffeeGroupKey;
  groupName: string;
  targetMoralVirtue: string;
  targetArea: string;
  targetAudience: string;
  proposerName: string;
  proposerAgency: string;
  createdAt: string;
  // AI Score (100% Pure Scoring)
  aiScoreRaw: number;
  aiScoreWeighted: number;     // rawAi 100% scale
  aiPercent: string;           // e.g. "94.00%"
  // Vote Metadata (Legacy preserved for display only if needed)
  voteCount: number;
  totalVotesInTop3: number;    // ยอดรวมคะแนนโหวตของ 3 โครงการ
  maxVotesInTop3: number;      // คะแนนโหวตสูงสุดใน 3 โครงการ
  voteSharePct: number;        // (voteCount / totalVotesInTop3) * 100
  voteScoreWeighted: number;   // 0 (unused in final score)
  votePercent: string;         // e.g. "0.00%"
  // Final Score (100% AI)
  finalScore: number;          // pure AI score
  finalPercent: string;        // e.g. "94.00%"
  rank: number;
  // Step-by-Step Calculation Breakdown
  calculationSteps: {
    aiCalculation: string;
    voteCalculation: string;
    totalCalculation: string;
  };
  rawProject: HackathonProject;
}

/**
 * ขั้นตอนที่ 1: คัดเลือกเฉพาะ 3 โครงการที่ได้คะแนน AI สูงสุดในจังหวัด
 */
export function getTop3AiProjectsForVoting(
  province?: PilotProvinceName,
  projects?: HackathonProject[]
): HackathonProject[] {
  const list = projects && projects.length > 0 ? projects : getHackathonProjects(province);
  const valid = list.filter(
    (p) => p && p.id && !p.id.startsWith('precheck-') && !isSeedHackathonProject(p.id)
  );
  return [...valid]
    .sort((a, b) => (Number(b.aiScore) || 0) - (Number(a.aiScore) || 0))
    .slice(0, 3);
}

/**
 * ขั้นตอนที่ 2: คำนวณคะแนนตัดสินรอบสุดท้ายโดย AI 100% เต็ม เฉพาะ 3 โครงการที่เข้าแข่งขัน
 * - ใช้คะแนนประเมินรูบริกของ AI 100% เต็ม (สเกล 0-100)
 */
export function calculateTop3FinalScores(
  top3Projects: HackathonProject[]
): Top3FinalScoreBreakdown[] {
  if (!top3Projects || top3Projects.length === 0) return [];

  // คำนวณคะแนนตัดสินโดยใช้ผลประเมินจากระบบ AI 100%
  const items = top3Projects.map((proj) => {
    const rawAi = Math.max(0, Math.min(100, Number(proj.aiScore) || 0));
    const finalTotal = Number(rawAi.toFixed(2));
    const votes = Math.max(0, Number(proj.communityVotes) || 0);

    // ข้อความแสดงวิธีคำนวณทีละขั้นตอน (AI 100%)
    const aiCalc = `ประเมินผ่านเกณฑ์รูบริก AI ผู้เชี่ยวชาญ 4 มิติหลัก (ความสอดคล้องคุณธรรม, ความเป็นไปได้, นวัตกรรม, การมีส่วนร่วม) รวม ${finalTotal.toFixed(2)} คะแนนเต็ม 100.00`;
    const voteCalc = `ใช้คะแนนตัดสินจากผลประเมินของระบบ AI 100% เต็ม`;
    const totalCalc = `คะแนนตัดสินโดยระบบ AI ผู้เชี่ยวชาญ 100%: ${finalTotal.toFixed(2)} / 100.00 คะแนน`;

    return {
      projectId: proj.id,
      projectName: proj.projectName,
      groupKey: proj.groupKey,
      groupName: proj.groupName,
      targetMoralVirtue: proj.targetMoralVirtue,
      targetArea: proj.targetArea,
      targetAudience: proj.targetAudience,
      proposerName: proj.proposerName,
      proposerAgency: proj.proposerAgency,
      createdAt: proj.createdAt,
      aiScoreRaw: rawAi,
      aiScoreWeighted: finalTotal,
      aiPercent: `${finalTotal.toFixed(2)}%`,
      voteCount: votes,
      totalVotesInTop3: 0,
      maxVotesInTop3: 0,
      voteSharePct: 0,
      voteScoreWeighted: 0,
      votePercent: `0.00%`,
      finalScore: finalTotal,
      finalPercent: `${finalTotal.toFixed(2)}%`,
      rank: 1,
      calculationSteps: {
        aiCalculation: aiCalc,
        voteCalculation: voteCalc,
        totalCalculation: totalCalc
      },
      rawProject: proj
    };
  });

  // จัดเรียงลำดับผลการตัดสินตาม finalScore (สูงสุดลงมา)
  items.sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    return (Number(b.aiScoreRaw) || 0) - (Number(a.aiScoreRaw) || 0);
  });

  // กำหนดลำดับ rank 1, 2, 3
  items.forEach((item, index) => {
    item.rank = index + 1;
  });

  return items;
}

export function getUserVotedProjectId(voterId: string = 'local-citizen'): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const votesRaw = localStorage.getItem(STORAGE_KEY_VOTES);
    if (!votesRaw) return null;
    const votedMap: Record<string, any> = JSON.parse(votesRaw);
    if (votedMap[`single_vote_${voterId}`]) {
      return votedMap[`single_vote_${voterId}`];
    }
    // Backward compatibility: find key matching ${voterId}_${projectId}
    const prefix = `${voterId}_`;
    for (const k of Object.keys(votedMap)) {
      if (k.startsWith(prefix) && votedMap[k]) {
        return k.substring(prefix.length);
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function hasUserVotedAny(voterId: string = 'local-citizen'): boolean {
  return getUserVotedProjectId(voterId) !== null;
}

export function hasUserVoted(projectId: string, voterId: string = 'local-citizen'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const votedPid = getUserVotedProjectId(voterId);
    return votedPid === projectId;
  } catch {
    return false;
  }
}

/**
 * ดึงข้อมูลตัวตนผู้ใช้สิทธิ์โหวตปัจจุบัน:
 * 1. ดึงจากชื่อที่ถูกเลือก/บันทึกเป็น Active Voter ล่าสุด
 * 2. หรือดึงจากข้อมูลลงทะเบียนขั้นตอนที่ 1/5 (fullName)
 * 3. หรือดึงจากบัญชีผู้ใช้ที่ล็อกอินเข้าระบบ
 */
export function getActiveVoterIdentity(): ActiveVoterInfo {
  if (typeof window === 'undefined') {
    return { id: 'guest_voter', fullName: 'ผู้ร่วมกิจกรรม (ยังไม่ได้ลงทะเบียน)', isRegistered: false, hasVoted: false, votedProjectId: null };
  }
  try {
    let name = localStorage.getItem(STORAGE_KEY_ACTIVE_VOTER)?.trim();
    if (!name) {
      const reg = getParticipantRegistration();
      if (reg && reg.fullName && reg.fullName.trim() && reg.fullName.trim() !== 'ผู้ร่วมกิจกรรม Hackathon') {
        name = reg.fullName.trim();
      }
    }
    if (!name) {
      try {
        const profileRaw = localStorage.getItem('mdc_user_profile_auth');
        if (profileRaw) {
          const prof = JSON.parse(profileRaw);
          if (prof && prof.name && prof.name.trim() && prof.name !== 'Guest User') {
            name = prof.name.trim();
          }
        }
      } catch {}
    }

    if (name && name !== 'ผู้ร่วมกิจกรรม (ยังไม่ได้ลงทะเบียน)' && name !== 'ผู้ร่วมกิจกรรม Hackathon') {
      const voterId = `voter_${encodeURIComponent(name.toLowerCase())}`;
      const votedPid = getUserVotedProjectId(voterId);
      return {
        id: voterId,
        fullName: name,
        isRegistered: true,
        hasVoted: !!votedPid,
        votedProjectId: votedPid
      };
    }

    const guestId = 'guest_voter';
    const votedPid = getUserVotedProjectId(guestId);
    return {
      id: guestId,
      fullName: 'ผู้ร่วมกิจกรรม (ยังไม่ได้ลงทะเบียน)',
      isRegistered: false,
      hasVoted: !!votedPid,
      votedProjectId: votedPid
    };
  } catch {
    return { id: 'guest_voter', fullName: 'ผู้ร่วมกิจกรรม (ยังไม่ได้ลงทะเบียน)', isRegistered: false, hasVoted: false, votedProjectId: null };
  }
}

/**
 * กำหนดชื่อ-นามสกุลของผู้ใช้สิทธิ์โหวตปัจจุบัน และบันทึกเข้าสู่รายชื่อผู้มีสิทธิ์
 */
export function setActiveVoterByName(fullName: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = fullName.trim();
  if (!trimmed || trimmed === 'ผู้ร่วมกิจกรรม Hackathon') return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_VOTER, trimmed);

  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_VOTERS);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(trimmed)) {
      list.push(trimmed);
      localStorage.setItem(STORAGE_KEY_REGISTERED_VOTERS, JSON.stringify(list));
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('mdc_active_voter_changed', { detail: { fullName: trimmed } }));
}

/**
 * รายชื่อผู้ร่วมกิจกรรมที่ลงทะเบียนไว้ทั้งหมดในระบบ
 */
export function getAllRegisteredVoterNames(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_VOTERS);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const currentReg = getParticipantRegistration();
    if (currentReg && currentReg.fullName && currentReg.fullName.trim() && !list.includes(currentReg.fullName.trim())) {
      list.push(currentReg.fullName.trim());
    }
    return list;
  } catch {
    return [];
  }
}

export function clearActiveVoter(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_ACTIVE_VOTER);
  window.dispatchEvent(new CustomEvent('mdc_active_voter_changed', { detail: { fullName: '' } }));
}

export function castCommunityVote(
  projectId: string,
  voterId?: string,
  voterDisplayName?: string
): { success: boolean; newVoteCount: number; message: string } {
  if (typeof window === 'undefined') {
    return { success: true, newVoteCount: 1, message: 'บันทึกคะแนนโหวตแล้ว' };
  }

  try {
    const activeVoter = getActiveVoterIdentity();
    const actualVoterId = voterId || activeVoter.id;
    const displayName = voterDisplayName || (activeVoter.isRegistered ? activeVoter.fullName : 'ท่าน');

    const existingVotedProjectId = getUserVotedProjectId(actualVoterId);

    // กฎ: หนึ่งคนสามารถโหวตได้เพียงหนึ่งโครงการเท่านั้น
    if (existingVotedProjectId) {
      if (existingVotedProjectId === projectId) {
        return {
          success: false,
          newVoteCount: 0,
          message: `คุณ ${displayName} ได้ลงคะแนนโหวตให้โครงการนี้เรียบร้อยแล้ว (1 คน 1 สิทธิ์)`
        };
      } else {
        return {
          success: false,
          newVoteCount: 0,
          message: `คุณ ${displayName} ได้ใช้สิทธิ์ลงคะแนนโหวตไปแล้ว (ระบบจำกัด 1 คนสามารถโหวตได้เพียง 1 โครงการเท่านั้น)`
        };
      }
    }

    const all = getHackathonProjects();
    const targetIdx = all.findIndex(p => p.id === projectId);
    if (targetIdx === -1) {
      return { success: false, newVoteCount: 0, message: 'ไม่พบโครงการที่ต้องการโหวต' };
    }

    all[targetIdx].communityVotes = (all[targetIdx].communityVotes || 0) + 1;
    if (!all[targetIdx].votedUserIds) all[targetIdx].votedUserIds = [];
    all[targetIdx].votedUserIds!.push(actualVoterId);

    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(all));

    const votesRaw = localStorage.getItem(STORAGE_KEY_VOTES);
    const votedMap: Record<string, any> = votesRaw ? JSON.parse(votesRaw) : {};
    const voteKey = `${actualVoterId}_${projectId}`;
    votedMap[voteKey] = true;
    votedMap[`single_vote_${actualVoterId}`] = projectId;
    localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(votedMap));

    // Sync to SQLite backend if available
    fetch('/api/pilot-sqlite/hackathon-vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, newVoteCount: all[targetIdx].communityVotes, voterId: actualVoterId })
    }).catch(() => {});

    window.dispatchEvent(new CustomEvent('mdc_vote_cast', { detail: { projectId, voterId: actualVoterId } }));

    return {
      success: true,
      newVoteCount: all[targetIdx].communityVotes,
      message: `บันทึกคะแนนโหวตสำเร็จ! คุณ ${displayName} ได้ใช้สิทธิ์โหวต 1 เสียงให้โครงการ "${all[targetIdx].projectName}" เรียบร้อยแล้ว (1 คน 1 สิทธิ์)`
    };
  } catch (err) {
    console.error('Error casting vote:', err);
    return { success: false, newVoteCount: 0, message: 'เกิดข้อผิดพลาดในการบันทึกโหวต' };
  }
}

export function saveParticipantRegistration(data: ParticipantRegistration): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_REGISTRATION, JSON.stringify(data));
    if (data.fullName && data.fullName.trim() && data.fullName.trim() !== 'ผู้ร่วมกิจกรรม Hackathon') {
      setActiveVoterByName(data.fullName.trim());
    }
  }
}

export function getParticipantRegistration(): ParticipantRegistration | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTRATION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function resetHackathonProjects(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
    localStorage.removeItem(STORAGE_KEY_USER_SUBMITTED_PROJECTS);
    localStorage.removeItem(STORAGE_KEY_VOTES);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_VOTER);
  }
}

// ----------------------------------------------------------------------------
// AI SCORING & RECOMMENDATION ENGINE
// ----------------------------------------------------------------------------

export function evaluateProjectWithAi(
  project: Partial<HackathonProject> & {
    aiDraftSnapshot?: {
      projectName?: string;
      proposalDetails?: string;
      activityPlan?: string;
      behavioralKpi?: string;
    } | null;
  },
  options?: {
    challengeTopic?: string;
    selectedCriteriaVirtues?: string[];
  }
): {
  aiScore: number;
  aiScoreBreakdown: { alignment: number; feasibility: number; innovation: number; participation: number };
  aiRecommendations: string;
} {
  const proposal = (project.proposalDetails || '') + ' ' + (project.projectName || '');
  const plan = project.activityPlan || '';
  const kpi = project.behavioralKpi || '';
  const budget = project.budgetTimeline || '';
  const challenge = (options?.challengeTopic || project.challengeTopic || '').trim();
  const selectedVirtues = options?.selectedCriteriaVirtues || project.evaluatedCriteriaVirtues || [];

  // ตรวจสอบความสอดคล้องกับโจทย์ความท้าทายเบื้องต้น (Relevance Gatekeeper)
  const relevance = checkChallengeDomainRelevance(project, challenge);
  if (relevance.isOffTopic) {
    return {
      aiScore: 15.5,
      aiScoreBreakdown: { alignment: 3.5, feasibility: 4.5, innovation: 4.0, participation: 3.5 },
      aiRecommendations: `❌ ข้อเสนอโครงการไม่ตรงกับโจทย์ความท้าทาย:\n${relevance.mismatchReason || 'โครงการมีสาระสำคัญเป็นคนละเรื่องกับโจทย์ปัญหา'}\n\nตามเกณฑ์การประเมิน ข้อเสนอโครงการต้องมุ่งเน้นการแก้ปัญหาตามโจทย์ความท้าทายโดยตรงเป็นอันดับแรก กรุณาปรับเปลี่ยนสาระสำคัญให้ตอบโจทย์ "${challenge}"`
    };
  }

  // 1. Alignment (max 30) - คำนวณความตรงจุดตามโจทย์และดัชนีเกณฑ์ที่เลือก
  let alignment = 24;

  // ตรวจสอบกับเกณฑ์ดัชนีคุณธรรมที่ผู้ใช้เลือก (Selected Criteria Virtues)
  let matchesSelectedCriteria = true;
  if (selectedVirtues.length > 0) {
    const target = project.targetMoralVirtue || '';
    const matchesTarget = selectedVirtues.some(v => target.includes(v) || v.includes(target));
    const mentionsInProposal = selectedVirtues.some(v => proposal.includes(v));

    if (matchesTarget || mentionsInProposal) {
      alignment += 3.5; // ได้คะแนนเพิ่มเมื่อตรงกับเกณฑ์ดัชนีที่เลือก
    } else {
      matchesSelectedCriteria = false;
      alignment -= 3.5; // หักคะแนนเมื่อโครงการไม่ตอบโจทย์เกณฑ์ดัชนีที่กำหนด
    }
  } else {
    if (project.targetMoralVirtue) alignment += 2;
  }

  // ตรวจสอบความสอดคล้องกับโจทย์ Hackathon (Challenge Topic)
  let matchesChallengeTopic = false;
  if (challenge) {
    const challengeWords = challenge
      .replace(/[()"'“”]/g, ' ')
      .split(/[\s,]+/)
      .filter(w => w.length >= 3 && !['เพื่อ', 'สำหรับ', 'และ', 'ใน', 'การ', 'ของ', 'ที่', 'ร่วม'].includes(w));

    const matchedWords = challengeWords.filter(w => proposal.includes(w) || (project.projectName || '').includes(w));
    if (matchedWords.length >= 2) {
      alignment += 2.5;
      matchesChallengeTopic = true;
    } else if (matchedWords.length === 1) {
      alignment += 1.5;
      matchesChallengeTopic = true;
    }
  }

  if (proposal.length > 50) alignment += 1.5;
  if (alignment > 30) alignment = 30;
  if (alignment < 12) alignment = 12;

  // 2. Feasibility (max 30)
  let feasibility = 25;
  if (plan.length > 50 || proposal.length > 80) feasibility += 3;
  if (kpi.length > 20) feasibility += 2;
  if (feasibility > 30) feasibility = 30;

  // 3. Innovation (max 20)
  let innovation = 15;
  if (proposal.includes('แอป') || proposal.includes('AI') || proposal.includes('ดิจิทัล') || proposal.includes('Smart') || proposal.includes('Credit')) {
    innovation += 3.5;
  }
  if (proposal.includes('ต้นแบบ') || proposal.includes('โมเดล') || proposal.includes('Zero')) {
    innovation += 1.5;
  }
  if (innovation > 20) innovation = 20;

  // 4. Participation across 3 levels (max 20)
  let participation = 15;
  if (plan.includes('นโยบาย') || plan.includes('อปท') || plan.includes('จังหวัด') || plan.includes('ผู้ว่า')) participation += 1.5;
  if (plan.includes('ปฏิบัติ') || plan.includes('เจ้าหน้าที่') || plan.includes('ครู') || plan.includes('อสม')) participation += 1.5;
  if (plan.includes('ประชาชน') || plan.includes('ชุมชน') || plan.includes('เยาวชน') || plan.includes('ชาวบ้าน')) participation += 1.5;
  if (participation > 20) participation = 20;

  let total = Number((alignment + feasibility + innovation + participation).toFixed(1));

  // ตรวจจับสถานะข้อเสนอฉบับร่างตั้งต้นจาก AI เพื่อจำกัดคะแนนให้อยู่ในช่วง 60 - 80 คะแนน
  const draftInfo = detectIsAiDraftBoilerplate(project);

  // Generate specific tailored recommendations based on Challenge & Selected Virtues
  const recs: string[] = [];

  if (draftInfo.isAiDraft && draftInfo.isUntouched) {
    total = Number(Math.min(78.5, Math.max(65.0, total * 0.77)).toFixed(1));
    alignment = Number((total * 0.30).toFixed(1));
    feasibility = Number((total * 0.30).toFixed(1));
    innovation = Number((total * 0.20).toFixed(1));
    participation = Number((total * 0.20).toFixed(1));
    recs.unshift('🌱 ข้อเสนอแนะสำหรับ Workshop: ร่วมกันระบุชื่อภาคีเครือข่ายและตัวชี้วัดเชิงพฤติกรรมในพื้นที่เพื่อสร้างความยั่งยืน');
  } else if (draftInfo.isAiDraft && !draftInfo.isUntouched) {
    const draftBase = 74.0;
    const scaledScore = draftBase + (total - draftBase) * draftInfo.humanEditRatio;
    total = Number(Math.min(100.0, Math.max(74.0, scaledScore)).toFixed(1));
    alignment = Number((total * 0.30).toFixed(1));
    feasibility = Number((total * 0.30).toFixed(1));
    innovation = Number((total * 0.20).toFixed(1));
    participation = Number((total * 0.20).toFixed(1));
    recs.unshift(`✨ ตรวจพบการมีส่วนร่วมปรับปรุงเนื้อหาโดยมนุษย์ (${Math.round(draftInfo.humanEditRatio * 100)}%): ช่วยยกระดับความสมบูรณ์ของโครงการขึ้นสู่ ${total} คะแนน`);
  }

  if (selectedVirtues.length > 0) {
    if (matchesSelectedCriteria) {
      recs.push(`🎯 โครงการตอบโจทย์ตรงกับเกณฑ์ดัชนีคุณธรรมที่กำหนดสำหรับการตัดสิน [${selectedVirtues.join(', ')}] ได้อย่างตรงประเด็น`);
    } else {
      recs.push(`⚠️ ข้อสังเกต: เกณฑ์การตัดสินครั้งนี้กำหนดเน้นดัชนี [${selectedVirtues.join(', ')}] แต่โครงการมุ่งเน้นด้าน "${project.targetMoralVirtue || 'ทั่วไป'}" จึงทำให้คะแนนความตรงประเด็น (Alignment) ลดลง แนะนำให้บูรณาการหรือปรับกิจกรรมให้เชื่อมโยงกับเกณฑ์ที่เลือก`);
    }
  }

  if (challenge) {
    if (matchesChallengeTopic) {
      recs.push(`และมีความสอดคล้องกับโจทย์การแข่งขัน "${challenge.slice(0, 40)}${challenge.length > 40 ? '...' : ''}"`);
    } else {
      recs.push(`แนะนำให้เพิ่มการกล่าวถึงการตอบโจทย์การแข่งขัน "${challenge.slice(0, 40)}${challenge.length > 40 ? '...' : ''}" ให้เป็นรูปธรรมยิ่งขึ้น`);
    }
  }

  if (total >= 92) {
    recs.push(`โครงการ "${project.projectName || 'กิจกรรมคุณธรรม'}" ได้รับคะแนนระดับดีเยี่ยม จุดเด่นคือการบูรณาการกลไก 3 ระดับอย่างสมดุล`);
  } else {
    recs.push(`โครงการมีความตั้งใจที่ดีในการยกระดับมิติ "${project.targetMoralVirtue || 'คุณธรรม'}"`);
  }

  if (!kpi.includes('%') && !kpi.includes('คน')) {
    recs.push('แนะนำให้ระบุตัวชี้วัดเชิงปริมาณ (เช่น ร้อยละพฤติกรรมที่เปลี่ยนไป หรือจำนวนครัวเรือนเป้าหมาย) ให้ชัดเจนยิ่งขึ้น');
  } else {
    recs.push('ตัวชี้วัดเชิงพฤติกรรมมีความชัดเจน แนะนำให้วางระบบบันทึกผลต่อเนื่องทุก 30 วัน');
  }

  if (project.groupKey === 'mocha') {
    recs.push('สำหรับกลุ่มมอคค่า แนะนำให้ดึงความร่วมมือจากภาคเอกชนและสถานประกอบการมาร่วมสมทบสวัสดิการ');
  } else if (project.groupKey === 'cappuccino') {
    recs.push('สำหรับกลุ่มคาปูชิโน แนะนำให้ขยายผลการสื่อสารผ่านสื่อโซเชียลและผู้นำความคิด (KOL ชุมชน) เพื่อสร้างพลังบวก');
  } else if (project.groupKey === 'americano') {
    recs.push('สำหรับกลุ่มอเมริกาโน แนะนำให้ต่อยอดสู่ระบบแดชบอร์ดแสดงผลความก้าวหน้าแบบเปิดเผย (Open Data)');
  } else if (project.groupKey === 'espresso') {
    recs.push('สำหรับกลุ่มเอสเพรสโซ แนะนำให้เน้นตัวชี้วัด Fast-Track ผลลัพธ์เชิงประจักษ์และการแก้ไขปัญหาเชิงโครงสร้างแบบเร่งด่วน');
  } else if (project.groupKey === 'latte') {
    recs.push('สำหรับกลุ่มลาเต้ แนะนำให้เน้นการสร้างพื้นที่สานเสวนาร่วมกันระหว่างกลุ่มคนข้ามรุ่นและความอบอุ่นของชุมชน');
  } else {
    recs.push('สำหรับกลุ่มสร้างสรรค์คุณธรรม แนะนำให้บูรณาการเครือข่ายทุกภาคส่วนเพื่อขับเคลื่อนอย่างยั่งยืน');
  }

  return {
    aiScore: total,
    aiScoreBreakdown: {
      alignment: Number(alignment.toFixed(1)),
      feasibility: Number(feasibility.toFixed(1)),
      innovation: Number(innovation.toFixed(1)),
      participation: Number(participation.toFixed(1))
    },
    aiRecommendations: recs.join('\n• ')
  };
}

// ----------------------------------------------------------------------------
// AI IDEATION HELPER: สร้างโครงสร้างโครงการอัตโนมัติตาม Prompt & เกณฑ์ที่เลือก
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// AI IDEATION ENGINE: สังเคราะห์และคิดค้นโครงการนวัตกรรมใหม่เอี่ยม
// รองรับทั้งการเรียก AI LLM (เมื่อมี API Key) และ Generative Behavioral Engine
// ----------------------------------------------------------------------------

interface GeneratedProjectSeed {
  virtue: 'พอเพียง' | 'วินัย' | 'สุจริต' | 'จิตอาสา' | 'กตัญญู';
  theme: string;
  titleGen: (province: string, seed: number) => string;
  audienceGen: (province: string) => string;
  areaGen: (province: string) => string;
  proposalGen: (province: string, challenge?: string) => string;
  planGen: (province: string) => string;
  kpiGen: () => string;
  budgetGen: () => string;
}

const GENERATIVE_PROJECT_MODELS: GeneratedProjectSeed[] = [
  // ===================== พอเพียง / จิตอาสา (Forest & Watershed Conservation) =====================
  {
    virtue: 'พอเพียง',
    theme: 'Tanaosri Green Guard & Watershed Protection',
    titleGen: (p, s) => {
      const titles = [
        `โครงการ "Tanaosri Green Guard" พิทักษ์ป่าต้นน้ำตะนาวศรีและวนเกษตรทุเรียนคุณธรรม`,
        `โครงการ "Save Tanaosri & Zero Encroachment" ปักหมุดหยุดแผ้วถางป่าต้นน้ำสู่ทุเรียนยั่งยืน`,
        `โครงการ "Roots of Tanaosri & Forest Shield" สัญญารักษ์ป่าต้นน้ำและแนวกันชนทุเรียนสีเขียว`
      ];
      return titles[s % titles.length];
    },
    audienceGen: (p) => `เกษตรกรชาวสวนทุเรียน 450 ครัวเรือน ชุมชนรอบแนวเขตป่าต้นน้ำเทือกเขาตะนาวศรี และเครือข่ายจิตอาสาพิทักษ์ป่า`,
    areaGen: (p) => `พื้นที่ป่าต้นน้ำและแนวเขตกันชนเทือกเขาตะนาวศรี`,
    proposalGen: (p, c) => `สร้างธรรมนูญแนวเขตป่าต้นน้ำและระบบปักหมุดดิจิทัล (Digital Boundary Nudge) พร้อมส่งเสริมโมเดลวนเกษตรทุเรียนรักษ์ป่า (Shade-Grown Agroforestry) เพื่อหยุดการแผ้วถางขยายพื้นที่ล้ำป่าต้นน้ำอย่างถาวร ตอบโจทย์: ${c || 'หยุดการบุกรุกแผ้วถางป่าต้นน้ำ'}`,
    planGen: (p) => `1) ระดับนโยบาย: กรมป่าไม้ อุทยานแห่งชาติ และ อปท. ร่วมทำ MOU รับรองแนวเขตกันชนทุเรียนสีเขียว\n2) ผู้ปฏิบัติการ: สมาคมชาวสวนทุเรียน เจ้าหน้าที่พิทักษ์ป่า และทีมลาดตระเวนจิตอาสา ตรวจสอบแนวเขตและรับรองแปลงทุเรียนวนเกษตร\n3) ประชาชน: เกษตรกรร่วมทำพันธสัญญาไม่แผ้วถางป่า ปลูกไม้ป่าร่วมในแปลง และร่วมสอดส่องแนวเขตป่าชุมชน`,
    kpiGen: () => `การบุกรุกแผ้วถางป่าต้นน้ำเทือกเขาตะนาวศรีลดลงมากกว่าร้อยละ 80 เกษตรกรชาวสวนทุเรียนร้อยละ 80 ปฏิบัติตามธรรมนูญแนวเขต และมีแปลงทุเรียนวนเกษตร 250 แปลงภายใน 6 เดือน`,
    budgetGen: () => `ระยะเวลาดำเนินงาน 6 เดือน | งบประมาณ 300,000 บาท (กองทุนสิ่งแวดล้อมและฟื้นฟูป่าต้นน้ำ)`
  },

  // ===================== วินัย (Discipline) =====================
  {
    virtue: 'วินัย',
    theme: 'Smart Crosswalk & Pedestrian Right',
    titleGen: (p, s) => {
      const titles = [
        `โครงการ "Smart Crosswalk & Pedestrian First" ทางม้าลายอัจฉริยะปลุกวินัยจราจรหน้าสถานศึกษา`,
        `โครงการ "AI Crosswalk Safe Zone" เซนเซอร์ตรวจจับคนข้ามถนนและกติกาความปลอดภัยสัญจร`,
        `โครงการ "Safe Walk, Safe Life" ทางม้าลายปลอดภัยและวินัยคนเดินเท้าหน้าโรงพยาบาลศูนย์`
      ];
      return titles[s % titles.length];
    },
    audienceGen: (p) => `นักเรียน ครู ผู้ปกครอง และผู้ขับขี่รถจักรยานยนต์/รถยนต์ในเขตเมือง รวม 12,000 คน/วัน`,
    areaGen: (p) => `ทางข้ามหน้าโรงเรียนขนาดใหญ่ โรงพยาบาลศูนย์ และสี่แยกเสี่ยงใน`,
    proposalGen: (p, c) => `ประยุกต์ใช้เทคโนโลยี AI Camera และไฟสัญญาณอัจฉริยะตรวจจับผู้ขับขี่ที่หยุดรถให้คนข้ามทางม้าลาย แสดงข้อความขอบคุณผ่านจอ LED เรียลไทม์ เชื่อมโยงระบบแต้มคุณธรรม "Civic Merit" เข้ากับแอปพลิเคชันท้องถิ่น สร้างแรงจูงใจเชิงบวก (Nudge) และกติกาประชาคมเพื่อเปลี่ยนวัฒนธรรมการเคารพสิทธิคนเดินเท้าอย่างถาวร ตอบโจทย์: ${c || 'ปลุกวินัยความปลอดภัยทางถนน'}`,
    planGen: (p) => `1) ระดับนโยบาย: ผู้ว่าราชการจังหวัด เทศบาล และตำรวจภูธร ออกประกาศเขตความปลอดภัยความเร็วต่ำ (Low-Speed Zone) รอบสถานศึกษา\n2) ผู้ปฏิบัติการ: สารวัตรนักเรียน ตำรวจจราจร และครูเวร ร่วมบันทึกข้อมูลและให้คำแนะนำผู้ขับขี่\n3) ประชาชน: ผู้ปกครอง ผู้ใช้รถใช้ถนน และคนเดินเท้า ปฏิบัติตามกติกาสากลและช่วยสอดส่องความปลอดภัย`,
    kpiGen: () => `อัตราการหยุดรถให้คนข้ามทางม้าลายเพิ่มขึ้นจาก 22% เป็น 85% ภายใน 5 เดือน และอุบัติเหตุบริเวณจุดติดตั้งลดลงมากกว่าร้อยละ 80`,
    budgetGen: () => `ระยะเวลาดำเนินงาน 6 เดือน | งบประมาณ 320,000 บาท (กองทุนเพื่อความปลอดภัยในการใช้รถใช้ถนน)`
  },
  {
    virtue: 'วินัย',
    theme: 'Helmet Safety & Industrial Shift Nudge',
    titleGen: (p, s) => {
      const titles = [
        `โครงการ "Helmet Safety & Shift Safety Nudge" กลไกเพื่อนเตือนเพื่อนสร้างวินัยสวมหมวกนิรภัยคนทำงาน`,
        `โครงการ "Safety Merit Token" นวัตกรรมแต้มความปลอดภัยขับขี่ปลอดภัยในสถานประกอบการ`,
        `โครงการ "Zero Accident Shift" ปลุกวินัยจราจรแรงงานอุตสาหกรรมสองล้อปลอดภัย`
      ];
      return titles[s % titles.length];
    },
    audienceGen: (p) => `ผู้ใช้แรงงาน พนักงานโรงงาน และผู้ขับขี่รถจักรยานยนต์รับจ้างใน กว่า 25,000 คน`,
    areaGen: (p) => `ทางเข้า-ออกนิคมอุตสาหกรรม ชุมชนหอพักแรงงาน และเส้นทางจราจรสายหลัก`,
    proposalGen: (p, c) => `บูรณาการระบบ Nudge สถาปัตยกรรมทางเลือก จัดช่องทางพิเศษ "Green Fast Lane" สำหรับผู้ขับขี่ที่สวมหมวกนิรภัยเป็นประจำ พร้อมกล้อง AI ตรวจเช็กอัตโนมัติ สะสมแต้มความดีแลกคูปองสวัสดิการอาหารกลางวันและส่วนลดเบี้ยประกันภัย ร่วมกับมาตรการเพื่อนเตือนเพื่อนในกะทำงานเพื่อสร้างบรรทัดฐานความปลอดภัยร่วมกัน`,
    planGen: (p) => `1) ระดับนโยบาย: สภาอุตสาหกรรมจังหวัด และสำนักงานแรงงานจังหวัด ทำ MOU สถานประกอบการปลอดภัยร่วมกับ 40 โรงงาน\n2) ผู้ปฏิบัติการ: จป.วิชาชีพ และกรรมการความปลอดภัย (คปอ.) ประเมินคะแนนและมอบสติกเกอร์เกียรติยศ\n3) ประชาชน: พนักงานและเพื่อนร่วมงานช่วยกันตรวจความพร้อมหมวกนิรภัยก่อนสตาร์ทรถทุกครั้ง`,
    kpiGen: () => `อัตราการสวมหมวกนิรภัยของพนักงานเพิ่มขึ้นจาก 35% เป็น 89% อุบัติเหตุระหว่างเดินทางไป-กลับทำงานลดลง 60%`,
    budgetGen: () => `ระยะเวลาดำเนินงาน 6 เดือน | งบประมาณ 290,000 บาท (กองทุนความปลอดภัยแรงงาน + CSR โรงงาน)`
  },

  // ===================== พอเพียง (Sufficiency) =====================
  {
    virtue: 'พอเพียง',
    theme: 'Financial Freedom Lab & Digital Sajja',
    titleGen: (p, s) => {
      const titles = [
        `โครงการ "Financial Freedom Lab" คลินิกวินัยการเงินและสัจจะดิจิทัลปลดหนี้นอกระบบคนทำงาน`,
        `โครงการ "Smart Sajja Savings" นวัตกรรมกลุ่มออมทรัพย์แก้หนี้ครัวเรือนและสร้างภูมิคุ้มกันพอเพียง`,
        `โครงการ "พอเพียงสร้างสุข ปลดหนี้มีเงินออม" แอปพลิเคชันวางแผนการเงินวิถีพอประมาณ`
      ];
      return titles[s % titles.length];
    },
    audienceGen: (p) => `แรงงาน ผู้ประกอบอาชีพอิสระ และครัวเรือนที่มีภาระหนี้นอกระบบใน รวม 1,500 ครอบครัว`,
    areaGen: (p) => `ชุมชนชานเมือง ย่านที่พักอาศัยผู้มีรายได้น้อย และพื้นที่เครือข่ายสหกรณ์`,
    proposalGen: (p, c) => `พัฒนาคลินิกนวัตกรรมวินัยการเงิน ถอดรหัสโครงสร้างหนี้รายครัวเรือน เชื่อมโยงแอปพลิเคชันบัญชีดิจิทัลช่วยตัดรายจ่ายฟุ่มเฟือย จัดตั้งกองทุนสัจจะออมทรัพย์วันละ 20 บาท ปลดล็อกดอกเบี้ยเงินกู้นอกระบบด้วยกองทุนช่วยเหลือตนเองตามหลักปรัชญาเศรษฐกิจพอเพียง`,
    planGen: (p) => `1) ระดับนโยบาย: จังหวัด และ ธ.ก.ส./ออมสิน ร่วมออกแบบมาตรการรีไฟแนนซ์หนี้ดอกเบี้ยต่ำ\n2) ผู้ปฏิบัติการ: ครูบัญชีอาสา และนักพัฒนาชุมชน เป็นโค้ชประกบการทำบัญชีรายสัปดาห์\n3) ประชาชน: สมาชิกกลุ่มออมทรัพย์ร่วมปฏิญาณสัจจะและให้กำลังใจกันในการลดหนี้`,
    kpiGen: () => `ครัวเรือนเป้าหมาย 85% สามารถลดภาระหนี้นอกระบบได้เฉลี่ย 32,000 บาท/คน และมีเงินออมสะสมต่อเนื่องมากกว่า 6 เดือน`,
    budgetGen: () => `ระยะเวลาดำเนินงาน 8 เดือน | งบประมาณ 280,000 บาท (กองทุนพัฒนาคุณภาพชีวิตและสวัสดิการชุมชน)`
  },
  {
    virtue: 'พอเพียง',
    theme: 'Circular Bio-Loop & Community Food Bank',
    titleGen: (p, s) => {
      const titles = [
        `โครงการ "Circular Bio-Loop" แปรรูปขยะเศษอาหารจากตลาดและร้านค้าสู่ปุ๋ยอินทรีย์สร้างรายได้`,
        `โครงการ "Community Food Resilience" ธนาคารอาหารพอเพียงและแปลงผักอินทรีย์พึ่งตนเองลดค่าครองชีพ`,
        `โครงการ "Green Circular Hub" นวัตกรรมจัดการของเสียต้นทางสู่เศรษฐกิจหมุนเวียนชุมชนพอเพียง`
      ];
      return titles[s % titles.length];
    },
    audienceGen: (p) => `ผู้ประกอบการร้านอาหาร ตลาดสด ชุมชนเมือง และครัวเรือนเปราะบางใน 2,000 ราย`,
    areaGen: (p) => `ตลาดสดเทศบาล ย่านท่องเที่ยว และพื้นที่แปลงผักชุมชน`,
    proposalGen: (p, c) => `สร้างโมเดลเศรษฐกิจหมุนเวียน (Circular Economy) รวบรวมเศษอาหารและขยะอินทรีย์จากร้านค้ามาแปรรูปเป็นปุ๋ยชีวภาพและอาหารสัตว์คุณภาพสูง นำไปแจกจ่ายและจำหน่ายในแปลงเกษตรพอเพียงชุมชน ลดรายจ่ายค่าครองชีพ และสร้างแหล่งอาหารปลอดภัยถาวร`,
    planGen: (p) => `1) ระดับนโยบาย: เทศบาล และ สำนักงานสิ่งแวดล้อมภาค สนับสนุนเครื่องย่อยชีวภาพและรับรองมาตรฐานปุ๋ย\n2) ผู้ปฏิบัติการ: อสม. และเจ้าหน้าที่สุขาภิบาล กำกับมาตรฐานการคัดแยกและการหมักปุ๋ย\n3) ประชาชน: ร้านค้าคัดแยกขยะต้นทางอย่างสม่ำเสมอร้อยละ 85 และชาวบ้านร่วมปลูกผักอินทรีย์หมุนเวียน`,
    kpiGen: () => `ปริมาณขยะอินทรีย์ถูกเปลี่ยนเป็นปุ๋ยกว่า 35 ตัน/เดือน ลดค่าใช้จ่ายอาหารในครัวเรือนได้เฉลี่ย 1,600 บาท/เดือน`,
    budgetGen: () => `ระยะเวลาดำเนินงาน 6 เดือน | งบประมาณ 310,000 บาท (กองทุนสิ่งแวดล้อมท้องถิ่น)`
  },

  // ===================== สุจริต (Integrity) =====================
  {
    virtue: 'สุจริต',
    theme: 'Citizen Social Audit & Open Data',
    titleGen: (p, s) => {
      const titles = [
        `โครงการ "Citizen Social Audit" แพลตฟอร์มประชาชนร่วมตรวจสอบความโปร่งใสโครงการงบประมาณท้องถิ่น`,
        `โครงการ "Open City Watch" นวัตกรรมดิจิทัลเปิดเผยข้อมูลจัดซื้อจัดจ้างและเสริมพลังธรรมาภิบาลชุมชน`,
        `โครงการ "แสงสว่างแห่งความสุจริต" ประชาสังคมร่วมตรวจสอบโครงการพัฒนาเมืองไร้ทุจริต`
      ];
      return titles[s % titles.length];
    },
    audienceGen: (p) => `ประชาชน ผู้เสียภาษี นักเรียน นักศึกษา และผู้นำประชาสังคมใน 5,000 คน`,
    areaGen: (p) => `ครอบคลุมทุกองค์กรปกครองส่วนท้องถิ่นและชุมชนเครือข่ายใน`,
    proposalGen: (p, c) => `จัดตั้งแดชบอร์ดข้อมูลเปิด (Open Data Platform) แสดงรายละเอียดโครงการก่อสร้าง จัดซื้อจัดจ้าง และการใช้งบประมาณของ อปท. แบบเข้าใจง่าย เปิดช่องทางให้ประชาชนร่วมตรวจสอบหน้างาน (Social Audit) และแจ้งเบาะแสความผิดปกติแบบนิรนามที่ปลอดภัย`,
    planGen: (p) => `1) ระดับนโยบาย: ผู้ว่าฯ และ สำนักงาน ป.ป.ช. ประจำจังหวัด สนับสนุนมาตรการเปิดเผยข้อมูลเชิงรุก\n2) ผู้ปฏิบัติการ: สภาองค์กรชุมชน และเครือข่ายสื่อมวลชนท้องถิ่น ร่วมจัดเวทีถอดบทเรียนความโปร่งใส\n3) ประชาชน: ประชาชนในพื้นที่ร่วมสแกน QR Code ตรวจสอบงานก่อสร้างจริงและให้คะแนนดาว`,
    kpiGen: () => `ดัชนีความโปร่งใสของ อปท. นำร่องเพิ่มขึ้นเป็น 94% และเรื่องร้องเรียนทุจริตในโครงการนำร่องลดลงมากกว่าร้อยละ 80`,
    budgetGen: () => `ระยะเวลาดำเนินงาน 6 เดือน | งบประมาณ 260,000 บาท (กองทุนส่งเสริมธรรมาภิบาลและการป้องกันการทุจริต)`
  },
  {
    virtue: 'สุจริต',
    theme: 'Cyber Shield & Anti-Mule Youth Network',
    titleGen: (p, s) => {
      const titles = [
        `โครงการ "Cyber Shield Youth" เครือข่ายเยาวชนรู้ทันกลโกงไซเบอร์และสกัดกั้นบัญชีม้า`,
        `โครงการ "วัคซีนสุจริตดิจิทัล" ภูมิคุ้มกันภัยหลอกลวงออนไลน์และสร้างวัฒนธรรมความซื่อสัตย์ในครอบครัว`,
        `โครงการ "ตาสับปะรดไซเบอร์" เยาวชนพิทักษ์ปู่ย่ารู้เท่าทันคอลเซ็นเตอร์และการทุจริตออนไลน์`
      ];
      return titles[s % titles.length];
    },
    audienceGen: (p) => `นักเรียนมัธยมศึกษา นักศึกษาอาชีวะ และผู้สูงอายุในครัวเรือน รวม 8,500 คน`,
    areaGen: (p) => `โรงเรียนมัธยม สถาบันอาชีวศึกษา และชุมชนผู้สูงอายุ`,
    proposalGen: (p, c) => `พัฒนาหลักสูตรเยาวชนวัคซีนไซเบอร์ อบรมแกนนำนักเรียนให้รู้ทันกลลวงการจ้างเปิดบัญชีม้าและกลโกงหลอกโอนเงิน จัดกิจกรรมนำความรู้กลับไปดูแลพ่อแม่ปู่ย่าที่บ้าน พร้อมสร้างกติกาประชาคมโรงเรียนสีขาว ปฏิเสธเงินบาปและยึดมั่นความซื่อสัตย์สุจริต`,
    planGen: (p) => `1) ระดับนโยบาย: ตำรวจภูธรจังหวัด และศึกษาธิการจังหวัด บันทึกข้อตกลงมาตรการสกัดกั้นบัญชีม้าในสถานศึกษา\n2) ผู้ปฏิบัติการ: ครูฝ่ายปกครอง และเจ้าหน้าที่ตำรวจไซเบอร์ ร่วมจัดเวิร์กช็อปวิเคราะห์เคสจริง\n3) ประชาชน: นักเรียนและครอบครัวร่วมตรวจสอบและแลกเปลี่ยนความรู้ความปลอดภัยดิจิทัล`,
    kpiGen: () => `ไม่มีนักเรียนในสถานศึกษานำร่องตกเป็นเหยื่อรับจ้างเปิดบัญชีม้า และอัตราผู้สูงอายุตกเป็นเหยื่อคอลเซ็นเตอร์ลดลง 85%`,
    budgetGen: () => `ระยะเวลาดำเนินงาน 5 เดือน | งบประมาณ 250,000 บาท (กองทุนป้องกันอาชญากรรมทางเทคโนโลยี)`
  },

  // ===================== จิตอาสา (Volunteerism) =====================
  {
    virtue: 'จิตอาสา',
    theme: 'TimeBank & Skill Sharing Network',
    titleGen: (p, s) => {
      const titles = [
        `โครงการ "TimeBank สานพลังจิตอาสา" ธนาคารเวลาความดีเกื้อกูลและแลกเปลี่ยนทักษะพัฒนาเมือง`,
        `โครงการ "Skill Share Commons" นวัตกรรมจิตอาสาเฉพาะกิจรวมพลังช่างชุมชนและคนรุ่นใหม่`,
        `โครงการ "พลังคนดีร่วมใจ" เครือข่ายจิตอาสาซ่อมบ้าน ฟื้นฟูสาธารณประโยชน์เพื่อผู้ยากไร้`
      ];
      return titles[s % titles.length];
    },
    audienceGen: (p) => `ประชาชนจิตอาสา ช่างชุมชน นักเรียนอาสา และครัวเรือนเปราะบาง 3,200 คน`,
    areaGen: (p) => `เขตเทศบาลและชุมชนชนบทใน`,
    proposalGen: (p, c) => `จัดตั้งระบบธนาคารเวลาดิจิทัล (Digital TimeBank) สมาชิกสะสมชั่วโมงจิตอาสาจากการช่วยเหลือสังคม เช่น ซ่อมแซมบ้านคนชรา ดูแลผู้ป่วย สอนหนังสือเด็ก ปลูกต้นไม้ และสามารถนำชั่วโมงสะสมไปขอรับบริการความช่วยเหลือกลับคืนในยามจำเป็น สร้างวิถีชีวิตเกื้อกูลอย่างยั่งยืน`,
    planGen: (p) => `1) ระดับนโยบาย: อปท. และศูนย์คุณธรรม ให้การรับรองเครดิตชั่วโมงความดี\n2) ผู้ปฏิบัติการ: ผู้ประสานงานธนาคารเวลาและผู้นำชุมชน จัดเวรจับคู่ความต้องการ\n3) ประชาชน: ประชาชนทุกวัยร่วมลงแรงแบ่งปันความถนัดของตนเองเพื่อส่วนรวม`,
    kpiGen: () => `เกิดการสะสมชั่วโมงจิตอาสาเพื่อสังคมกว่า 16,000 ชั่วโมง และครัวเรือนเปราะบางได้รับการดูแลซ่อมแซมบ้าน 250 หลัง`,
    budgetGen: () => `ระยะเวลาดำเนินงาน 7 เดือน | งบประมาณ 270,000 บาท (กองทุนส่งเสริมคุณธรรมและจิตอาสา)`
  },
  {
    virtue: 'จิตอาสา',
    theme: 'Food Rescue & Zero Hunger Alliance',
    titleGen: (p, s) => {
      const titles = [
        `โครงการ "Food Rescue จิตอาสา" ระดมอาหารปลอดภัยส่วนเกินส่งต่อครัวเรือนยากไร้และผู้ป่วยติดเตียง`,
        `โครงการ "ครัวกลางปันสุขจิตอาสา" เครือข่ายส่งต่อโภชนาการปลอดภัยสู่ชุมชนเปราะบาง`,
        `โครงการ "จิตอาสารักษ์อาหารรักษ์โลก" ลด Food Waste เปลี่ยนอาหารส่วนเกินเป็นมื้ออาหารแห่งรอยยิ้ม`
      ];
      return titles[s % titles.length];
    },
    audienceGen: (p) => `ผู้ประกอบการโรงแรม ร้านอาหาร ตลาดสด และกลุ่มเปราะบางขาดแคลนใน 2,800 ราย`,
    areaGen: (p) => `ศูนย์พักพิง ชุมชนแออัด และบ้านผู้ป่วยติดเตียง`,
    proposalGen: (p, c) => `สร้างเครือข่ายจิตอาสารับมอบอาหารปรุงสุกปลอดภัย วัตถุดิบ และผลไม้ส่วนเกินจากโรงแรมและร้านค้า ตรวจสอบสุขอนามัย บรรจุในภาชนะรักษ์โลก แล้วกระจายส่งต่อถึงบ้านผู้ยากไร้และผู้สูงอายุติดเตียง ช่วยลดขยะอาหารและสร้างความอิ่มท้องด้วยพลังจิตอาสา`,
    planGen: (p) => `1) ระดับนโยบาย: พมจ. และ สาธารณสุขจังหวัด ควบคุมมาตรฐานความปลอดภัยด้านอาหาร\n2) ผู้ปฏิบัติการ: อาสาสมัครกู้ภัย และ อสม. จัดคาราวานรถส่งอาหารตามพิกัดดาวเทียม\n3) ประชาชน: ร้านอาหารร่วมบริจาคอาหาร และชุมชนช่วยจัดเตรียมอาหารปันสุข`,
    kpiGen: () => `กระจายอาหารปลอดภัยสู่กลุ่มเปราะบางกว่า 48,000 มื้อ ลดการสูญเสียอาหาร (Food Waste) ได้ 15 ตัน`,
    budgetGen: () => `ระยะเวลาดำเนินงาน 6 เดือน | งบประมาณ 250,000 บาท (กองทุนพัฒนาสังคมและความมั่นคงของมนุษย์)`
  },

  // ===================== กตัญญู (Gratitude) =====================
  {
    virtue: 'กตัญญู',
    theme: 'Young Caregiver & Health Buddy',
    titleGen: (p, s) => {
      const titles = [
        `โครงการ "Young Caregiver สานรักสองวัย" เยาวชนจิตอาสาดูแลสุขภาพกายและใจผู้สูงวัยติดเตียง`,
        `โครงการ "หลานรักดูแลปู่ย่า" เครือข่ายเยาวชนกตัญญูเยี่ยมบ้านและฟื้นฟูสุขภาวะผู้มีพระคุณ`,
        `โครงการ "สายใยสองวัยกตัญญูคู่คุณธรรม" พลังลูกหลานเยาวชนดูแลผู้สูงอายุเปราะบางในชุมชน`
      ];
      return titles[s % titles.length];
    },
    audienceGen: (p) => `ผู้สูงอายุภาวะพึ่งพิง 450 ราย และเยาวชนนักเรียนนักศึกษาอาสา 300 คนใน`,
    areaGen: (p) => `หมู่บ้านชนบทและชุมชนเทศบาล`,
    proposalGen: (p, c) => `ฝึกอบรมเยาวชนให้มีทักษะการบริบาลผู้สูงอายุเบื้องต้น การวัดสัญญาณชีพ การทำกายภาพบำบัดง่ายๆ และการพูดคุยบำบัดจิตใจ จัดเวรลงพื้นที่เยี่ยมบ้านสัปดาห์ละ 2 ครั้ง พร้อมบันทึก "สมุดไดอารี่กตัญญู" เพื่อปลูกฝังความสำนึกในบุญคุณบุพการีและผู้มีพระคุณในชุมชน`,
    planGen: (p) => `1) ระดับนโยบาย: พมจ. และ สสจ. สนับสนุนชุดกล่องบริบาล (Care Kit) และชั่วโมงกิจกรรมจิตสาธารณะ\n2) ผู้ปฏิบัติการ: พยาบาล รพ.สต. และครูแนะแนว เป็นพี่เลี้ยงดูแลความปลอดภัยและการบริบาล\n3) ประชาชน: ครอบครัวผู้สูงอายุและเพื่อนบ้านร่วมให้ความร่วมมือและส่งเสริมความผูกพัน`,
    kpiGen: () => `ดัชนีความสุขของผู้สูงวัยเพิ่มขึ้น 45% ภาวะซึมเศร้าลดลงครึ่งหนึ่ง และเยาวชนทำกิจกรรมสม่ำเสมอเกิน 90%`,
    budgetGen: () => `ระยะเวลาดำเนินงาน 6 เดือน | งบประมาณ 270,000 บาท (กองทุนฟื้นฟูสมรรถภาพและสวัสดิการผู้สูงอายุ)`
  },
  {
    virtue: 'กตัญญู',
    theme: 'Living Heritage & Digital Wisdom Bank',
    titleGen: (p, s) => {
      const titles = [
        `โครงการ "Living Heritage" เยาวชนสืบสานภูมิปัญญาครูช่างและตอบแทนผู้มีพระคุณแผ่นดิน`,
        `โครงการ "คลังปัญญาแม่ครูพ่อครู" นวัตกรรมดิจิทัลบันทึกมรดกวัฒนธรรมและกองทุนกตัญญูเชิดชูเกียรติ`,
        `โครงการ "กตัญญูต่อแผ่นดินเกิด" ถ่ายทอดภูมิปัญญาท้องถิ่นจากรุ่นสู่รุ่นและดูแลปราชญ์ชุมชน`
      ];
      return titles[s % titles.length];
    },
    audienceGen: (p) => `ปราชญ์ชาวบ้าน ครูช่างผู้สูงอายุ และเยาวชนคนรุ่นใหม่ใน รวม 500 คน`,
    areaGen: (p) => `ชุมชนหัตถศิลป์ ชุมชนเมืองเก่า และโรงเรียนใน`,
    proposalGen: (p, c) => `เชื่อมโยงเยาวชนคนรุ่นใหม่เข้าหาปราชญ์ชาวบ้านและครูช่างผู้สูงอายุ บันทึกองค์ความรู้และทักษะหัตถศิลป์โบราณสู่สื่อดิจิทัลและหนังสือออนไลน์ จัดตั้งกองทุนสวัสดิการกตัญญูดูแลค่ารักษาพยาบาลครูช่าง เพื่อตอบแทนคุณูปการที่ได้อนุรักษ์มรดกทางวัฒนธรรมแก่แผ่นดิน`,
    planGen: (p) => `1) ระดับนโยบาย: สำนักงานวัฒนธรรมจังหวัด และ อบจ. จัดสรรงบประมาณเชิดชูเกียรติปราชญ์แผ่นดิน\n2) ผู้ปฏิบัติการ: ครูศิลปะและนักวิชาการท้องถิ่น บรรจุองค์ความรู้เข้าสู่หลักสูตรท้องถิ่น\n3) ประชาชน: ชุมชนและลูกหลานจัดงานมุทิตาจิตและดูแลความเป็นอยู่ของครูช่างอย่างต่อเนื่อง`,
    kpiGen: () => `สามารถบันทึกคลังภูมิปัญญาดิจิทัลได้กว่า 35 เรื่อง และครูช่างผู้สูงอายุทุกคนได้รับสวัสดิการดูแลสุขภาพอย่างทั่วถึง`,
    budgetGen: () => `ระยะเวลาดำเนินงาน 6 เดือน | งบประมาณ 260,000 บาท (กองทุนส่งเสริมวัฒนธรรมและภูมิปัญญาท้องถิ่น)`
  }
];

// ฟังก์ชันตรวจสอบว่าชื่อโครงการเกิดจากการ copy ข้อความคำสั่งหรือ Prompt จากส่วนที่ 1 มาใส่ตรงๆ หรือไม่
export function isPromptCopiedAsProjectName(projectName: string, promptText: string): boolean {
  if (!projectName || !promptText) return false;

  const cleanPrompt = promptText
    .replace(/^(อยากได้โครงการ|อยากทำโครงการ|ขอโครงการ|ช่วยคิดโครงการ|ช่วยคิด|โครงการ)/g, '')
    .replace(/[“”"']/g, '')
    .replace(/^[\s:,-]+/g, '')
    .trim()
    .toLowerCase();

  if (cleanPrompt.length < 4) return false;

  const cleanTitle = projectName
    .replace(/^โครงการ\s*/, '')
    .replace(/[“”"']/g, '')
    .replace(/^[\s:,-]+/g, '')
    .trim()
    .toLowerCase();

  // 1. ถ้าชื่อโครงการเหมือนกับ prompt หรือขึ้นต้นด้วย prompt
  if (cleanTitle === cleanPrompt || cleanTitle.startsWith(cleanPrompt)) return true;
  if (cleanPrompt.startsWith(cleanTitle) && cleanTitle.length >= 8) return true;

  // 2. ถ้าในเครื่องหมายคำพูดของชื่อโครงการ เป็นข้อความที่ตรงกับ prompt
  const quoteMatch = projectName.match(/["“]([^"”]+)["”]/);
  if (quoteMatch) {
    const quotedText = quoteMatch[1].trim().toLowerCase();
    if (quotedText.length >= 6) {
      if (cleanPrompt.includes(quotedText) || quotedText.includes(cleanPrompt)) {
        // ยกเว้นกรณีที่เป็นชื่อ Concept ภาษาอังกฤษสั้นๆ เช่น "Zero-Waste Hero" ไม่ถือว่า copy
        const isEnglishConcept = /^[a-z0-9\s&+-]+$/i.test(quotedText) && quotedText.split(/\s+/).length <= 4;
        if (!isEnglishConcept) {
          return true;
        }
      }
    }
  }

  // 3. ตรวจสอบการทับซ้อนของคำ (Word Overlap)
  const promptWords = cleanPrompt.split(/\s+/).filter(w => w.length >= 3);
  if (promptWords.length >= 2) {
    let matchCount = 0;
    for (const w of promptWords) {
      if (cleanTitle.includes(w)) matchCount++;
    }
    if (matchCount / promptWords.length >= 0.75) {
      const hasConceptName = /["“][a-zA-Z0-9\s&+-]{3,}["”]/.test(projectName);
      if (!hasConceptName) {
        return true;
      }
    }
  }

  return false;
}

// ฟังก์ชันจัดรูปแบบ Rubric 4 เสาหลัก 100 คะแนนเต็มสำหรับแนบเข้ากับ Prompt ให้ AI ช่วยคิดโครงการ
export function formatRubricForPrompt(rubric: UniversalRubricDimension[] = UNIVERSAL_DEFAULT_RUBRIC): string {
  const items = rubric && rubric.length > 0 ? rubric : UNIVERSAL_DEFAULT_RUBRIC;
  return items
    .map((dim, idx) => {
      const p1 = dim.level4 ? dim.level4.split('\n').map((l) => '    ' + l).join('\n') : '    ดีเลิศ (85-100%)';
      const p2 = dim.level3 ? dim.level3.split('\n').map((l) => '    ' + l).join('\n') : '    ดี (70-84%)';
      const p3 = dim.level2 ? dim.level2.split('\n').map((l) => '    ' + l).join('\n') : '    พอใช้ (50-69%)';
      const p4 = dim.level1 ? dim.level1.split('\n').map((l) => '    ' + l).join('\n') : '    กำลังพัฒนา (0-49%)';

      return `[เสาหลักที่ ${idx + 1}: ${dim.virtueTitle} (${dim.maxScore} คะแนนเต็ม)]
  นิยามและเป้าหมาย: ${dim.subPillarTitle}
  • ระดับดีเลิศ (85 - 100%):
${p1}
  • ระดับดี (70 - 84%):
${p2}
  • ระดับพอใช้ (50 - 69%):
${p3}
  • ระดับกำลังพัฒนา (0 - 49%):
${p4}`;
    })
    .join('\n\n');
}

// ============================================================================
// OPENROUTER CENTRAL CONFIGURATION & DIAGNOSTIC UTILITIES
// ============================================================================

export function sanitizeApiKey(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  let key = raw.trim();
  key = key.replace(/^["']|["']$/g, '').trim();
  if (key.toLowerCase().startsWith('bearer ')) {
    key = key.slice(7).trim();
  }
  return key;
}

export function sanitizeModel(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return 'openai/gpt-4o-mini';
  const m = raw.trim().replace(/^["']|["']$/g, '');
  if (!m || m === 'openai/gpt-3.5-turbo') return 'openai/gpt-4o-mini';
  return m;
}

let cachedAiConfig: {
  apiKey: string;
  model: string;
  systemPrompt?: string;
  generatorPrompt?: string;
  updatedAt?: string | null;
} | null = null;

let isFetchingAiConfig = false;

export async function fetchAiConfigFromDb(): Promise<{
  apiKey: string;
  model: string;
  systemPrompt?: string;
  generatorPrompt?: string;
  isConfigured: boolean;
}> {
  try {
    const res = await fetch('/api/pilot-sqlite/ai-config');
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok) {
        cachedAiConfig = {
          apiKey: data.apiKey || '',
          model: data.model || 'openai/gpt-4o-mini',
          systemPrompt: data.systemPrompt || '',
          generatorPrompt: data.generatorPrompt || '',
          updatedAt: data.updatedAt
        };
        if (typeof window !== 'undefined') {
          if (data.apiKey) {
            localStorage.setItem('ai_api_key', data.apiKey);
          }
          if (data.model) {
            localStorage.setItem('ai_model', data.model);
          }
          if (data.systemPrompt) {
            localStorage.setItem('ai_system_prompt', data.systemPrompt);
          }
          if (data.generatorPrompt) {
            localStorage.setItem('ai_generator_prompt', data.generatorPrompt);
          }
          try {
            window.dispatchEvent(new CustomEvent('openrouter_config_changed', {
              detail: { apiKey: data.apiKey, model: data.model }
            }));
          } catch {}
        }
        return {
          apiKey: data.apiKey || '',
          model: data.model || 'openai/gpt-4o-mini',
          systemPrompt: data.systemPrompt || '',
          generatorPrompt: data.generatorPrompt || '',
          isConfigured: Boolean(data.isConfigured && data.apiKey)
        };
      }
    }
  } catch (err) {
    console.warn('fetchAiConfigFromDb fallback to local:', err);
  }
  return {
    apiKey: getStoredOpenRouterApiKey(),
    model: getStoredOpenRouterModel(),
    systemPrompt: typeof window !== 'undefined' ? localStorage.getItem('ai_system_prompt') || '' : '',
    generatorPrompt: typeof window !== 'undefined' ? localStorage.getItem('ai_generator_prompt') || '' : '',
    isConfigured: Boolean(getStoredOpenRouterApiKey())
  };
}

export async function saveAiConfigToDb(config: {
  apiKey: string;
  model: string;
  systemPrompt?: string;
  generatorPrompt?: string;
}): Promise<{ ok: boolean; message: string }> {
  const cleanKey = sanitizeApiKey(config.apiKey);
  const cleanModel = sanitizeModel(config.model);
  cachedAiConfig = {
    apiKey: cleanKey,
    model: cleanModel,
    systemPrompt: config.systemPrompt || '',
    generatorPrompt: config.generatorPrompt || ''
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('ai_api_key', cleanKey);
    localStorage.setItem('ai_model', cleanModel);
    if (config.systemPrompt !== undefined) {
      localStorage.setItem('ai_system_prompt', config.systemPrompt);
    }
    if (config.generatorPrompt !== undefined) {
      localStorage.setItem('ai_generator_prompt', config.generatorPrompt);
    }
    try {
      window.dispatchEvent(new CustomEvent('openrouter_config_changed', {
        detail: { apiKey: cleanKey, model: cleanModel }
      }));
    } catch {}
  }

  try {
    const res = await fetch('/api/pilot-sqlite/ai-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: cleanKey,
        model: cleanModel,
        systemPrompt: config.systemPrompt || '',
        generatorPrompt: config.generatorPrompt || ''
      })
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: data.message || 'บันทึกการตั้งค่า AI สำเร็จ' };
    }
  } catch (err: any) {
    console.warn('saveAiConfigToDb fallback:', err);
  }
  return { ok: true, message: 'บันทึกการตั้งค่าลง LocalStorage เรียบร้อยแล้ว' };
}

// Automatically fetch AI config from SQLite server on startup
if (typeof window !== 'undefined' && !isFetchingAiConfig) {
  isFetchingAiConfig = true;
  fetchAiConfigFromDb().catch(() => {}).finally(() => { isFetchingAiConfig = false; });
}

export function getStoredOpenRouterApiKey(): string {
  if (cachedAiConfig?.apiKey) return cachedAiConfig.apiKey;
  if (typeof window === 'undefined') return '';
  const candidates = [
    localStorage.getItem('ai_api_key'),
    localStorage.getItem('openrouter_api_key'),
    localStorage.getItem('openRouterApiKey'),
    localStorage.getItem('OPENROUTER_API_KEY'),
    sessionStorage.getItem('ai_api_key'),
    (import.meta as any).env?.VITE_OPENROUTER_API_KEY
  ];
  for (const c of candidates) {
    const clean = sanitizeApiKey(c);
    if (clean.length > 0) return clean;
  }
  return '';
}

export function getStoredOpenRouterModel(): string {
  if (cachedAiConfig?.model) return cachedAiConfig.model;
  if (typeof window === 'undefined') return 'openai/gpt-4o-mini';
  const stored = localStorage.getItem('ai_model');
  return sanitizeModel(stored);
}

export function saveStoredOpenRouterConfig(apiKey: string, model: string): void {
  saveAiConfigToDb({ apiKey, model }).catch(() => {});
}

export async function testOpenRouterConnection(
  customKey?: string,
  customModel?: string
): Promise<{ success: boolean; message: string; latencyMs?: number; model?: string }> {
  const key = sanitizeApiKey(customKey !== undefined ? customKey : getStoredOpenRouterApiKey());
  const model = sanitizeModel(customModel !== undefined ? customModel : getStoredOpenRouterModel());

  if (!key) {
    return {
      success: false,
      message: 'ไม่พบ OpenRouter API Key ในระบบ กรุณาระบุ API Key ที่ขึ้นต้นด้วย sk-or-v1-...'
    };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    console.log('[OpenRouter Test] Ping testing OpenRouter connection...', { model, keyPrefix: key.slice(0, 8) + '...' });
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
        'X-Title': 'Moral Center Connection Test',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say pong' }],
        max_tokens: 5
      })
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errMsg = `HTTP ${res.status}`;
      try {
        const json = JSON.parse(errText);
        errMsg = json.error?.message || errText;
      } catch {
        errMsg = errText || `HTTP ${res.status} ${res.statusText}`;
      }
      console.warn('[OpenRouter Test Error]', res.status, errMsg);
      return {
        success: false,
        message: `OpenRouter ส่งข้อผิดพลาด (${errMsg})`,
        latencyMs,
        model
      };
    }

    const data = await res.json();
    console.log('[OpenRouter Test Success]', { latencyMs, model, choices: data.choices });
    return {
      success: true,
      message: `เชื่อมต่อ OpenRouter สำเร็จ! โมเดล "${model}" พร้อมใช้งานจริง (${latencyMs}ms)`,
      latencyMs,
      model
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('[OpenRouter Test Exception]', err);
    return {
      success: false,
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err?.message || 'Network Timeout / ขัดข้อง'}`,
      model
    };
  }
}

// ฟังก์ชันเรียก OpenRouter LLM API เมื่อมี API Key เพื่อคิดโครงการสดแบบฉลาดล้ำ
export async function tryCallLlmForNewProject(
  prompt: string,
  province: string,
  groupName: string,
  challenge: string,
  targetVirtues: string[],
  activeRubric: UniversalRubricDimension[] = UNIVERSAL_DEFAULT_RUBRIC
): Promise<{ project: Partial<HackathonProject> | null; rawOutput: string; model: string; errorReason?: string } | null> {
  const apiKey = getStoredOpenRouterApiKey();
  if (!apiKey) {
    console.warn('[OpenRouter Ideation] No API key found in localStorage ("ai_api_key")');
    return { project: null, rawOutput: '', model: '', errorReason: 'ไม่พบ OpenRouter API Key ในการตั้งค่า (Settings)' };
  }

  const model = getStoredOpenRouterModel();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const rubricText = formatRubricForPrompt(activeRubric);

  console.log('[OpenRouter Ideation] Requesting project idea from OpenRouter...', {
    model,
    keyPrefix: `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
  });

  const messages = [
    {
      role: 'system',
      content: `คุณคือนักคิดค้นและวางโครงสร้างโครงการนวัตกรรมคุณธรรมเพื่อการปรับเปลี่ยนพฤติกรรม (Behavioral Science & Moral Innovation Expert) สำหรับการแข่งขัน Hackathon ศูนย์คุณธรรม (องค์การมหาชน)

[โครงสร้าง Prompt ประกอบด้วย 2 ส่วนหลัก]:
ส่วนที่ 1: ข้อมูลบริบทและโจทย์ความท้าทายหลักที่ต้องแก้ปัญหา
ส่วนที่ 2: Rubric เกณฑ์การตัดสิน 4 เสาหลัก (100 คะแนนเต็ม)

[สถาปัตยกรรมชื่อโครงการเท่เฉพาะทาง (STRICT ANTI-COPY & CREATIVE PROJECT NAMING RULES)]
1. การคิดชื่อโครงการเท่ ๆ: คุณต้องคิดค้น "ชื่อโครงการเท่ ๆ เฉพาะทาง และสื่อถึงประเด็นของโครงการใน prompt ส่วนที่ 1 ให้ AI ช่วยคิดโครงการโดยตรง" (เช่น ถ้าโจทย์เกี่ยวกับ การบุกรุกแผ้วถางป่าต้นน้ำบนเทือกเขาตะนาวศรีเพื่อขยายพื้นที่ปลูกทุเรียน ชื่อโครงการต้องสื่อถึง ป่าต้นน้ำ, ตะนาวศรี, ปลูกทุเรียน, หยุดแผ้วถาง, วนเกษตรทุเรียนคุณธรรม ห้ามตั้งชื่อกว้างๆ ที่ไม่เกี่ยวกับโจทย์เด็ดขาด!)
2. สถาปัตยกรรมโครงสร้างชื่อโครงการ:
   รูปแบบ: โครงการ "[ชื่อ Concept ภาษาอังกฤษสั้นทรงพลัง หรือคำไทยเท่ๆ ติดหู]" [คำสรุปกลไกนวัตกรรมพฤติกรรมศาสตร์และการปฏิบัติการที่เฉพาะเจาะจง] จ.[จังหวัด]
3. ห้ามนำข้อความ คำสั่ง คีย์เวิร์ด หรือประโยคจากโจทย์/Prompt มาใส่เป็นชื่อโครงการทั้งดุ้นเด็ดขาด

[กฎเหล็กกำกับคะแนน: คิดโครงการที่ตอบโจทย์ Rubric ไม่เกิน 80 คะแนนเท่านั้น (SCORE CAP <= 80 POINTS)]
1. ให้คุณพิจารณาจาก "Rubric เกณฑ์การตัดสิน 4 เสาหลัก (100 คะแนนเต็ม)" ที่แนบมาในส่วนที่ 2
2. คุณต้องคิดค้น "ข้อเสนอโครงการฉบับร่างที่ยังไม่สมบูรณ์ (Incomplete Draft Proposal / Work in Progress)" โดยออกแบบให้เนื้อหาโครงการนี้เมื่อตรวจประเมินตามเกณฑ์ Rubric แล้ว จะได้คะแนนอยู่ในช่วง "ไม่เกิน 80.00 คะแนนเท่านั้น" (คะแนนเป้าหมายอยู่ที่ช่วง 72.00 - 78.50 คะแนน หรือระดับ 'ดี') ห้ามสร้างโครงการที่สมบูรณ์แบบเกิน 80 คะแนนเด็ดขาด!
3. อิงผ่าน Prompt ที่เขียนเป็นหลัก: ออกแบบสาระสำคัญ กิจกรรม และกลไก Nudge ให้มุ่งแก้ปัญหาตามโจทย์ในส่วนที่ 1 อย่างแท้จริง โดยเว้นช่องว่างและเปิดพื้นที่ให้ผู้เข้าร่วมกิจกรรม/มนุษย์ ได้มีส่วนร่วมในการเติมเต็มชื่อภาคีเครือข่ายจริง กติกาประชาคมเชิงลึก และตัวเลขเป้าหมาย KPI เชิงประจักษ์ เพื่อยกระดับโครงการสู่ 85-100 คะแนนในเวทีแข่งขันต่อไป

ต้องตอบกลับเป็น JSON ที่มีฟิลด์ดังนี้เท่านั้น (ห้ามใส่ Markdown หรือคำอธิบายอื่นนอก JSON):
{
  "projectName": "ชื่อโครงการใหม่ที่คิดขึ้นอย่างสร้างสรรค์เท่ๆ สื่อถึงประเด็นในส่วนที่ 1 ตามสถาปัตยกรรม โครงการ \\"[Catchy Concept]\\" [กลไกนวัตกรรม] (ห้าม copy ข้อความ Prompt มาเด็ดขาด)",
  "targetMoralVirtue": "พอเพียง" หรือ "วินัย" หรือ "สุจริต" หรือ "จิตอาสา" หรือ "กตัญญู" (เลือกมิติที่ตรงกับโจทย์),
  "targetArea": "พื้นที่เป้าหมายเฉพาะเจาะจงในจังหวัด",
  "targetAudience": "กลุ่มเป้าหมายในพื้นที่",
  "proposalDetails": "1) วิธีการที่จะดำเนินงานว่าทำอย่างไร: ...\\n\\n2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้: ...",
  "activityPlan": "1) ระดับนโยบาย: ...\\n2) ผู้ปฏิบัติการ: ...\\n3) ประชาชน: ...",
  "behavioralKpi": "ผลลัพธ์พฤติกรรมเชิงบวกที่คาดหวังที่วัดผลได้จริงใน 6 เดือน"
}`
    },
    {
      role: 'user',
      content: `================================================================================
🤖 ส่วนที่ 1: ให้ AI ช่วยคิดโครงการ (Context, Challenge & Project Role)
================================================================================
จังหวัด: ${province}
กลุ่มทำงาน: ${groupName}
โจทย์ Hackathon: ${challenge}
มิติคุณธรรมที่เลือกตัดสิน: ${targetVirtues.join(', ')}
${prompt ? `แนวคิดความต้องการเบื้องต้นจากผู้ใช้: "${prompt}"` : 'แนวคิดความต้องการ: ให้ AI ช่วยคิดค้นโครงการฉบับร่างที่ตอบโจทย์ความท้าทายนี้โดยตรง'}

**คำสั่งพิเศษเรื่องการตั้งชื่อโครงการ**: ห้ามนำข้อความ Prompt หรือชื่อโจทย์มาเป็นชื่อโครงการเด็ดขาด! ให้สังเคราะห์ชื่อโครงการเท่ ๆ เฉพาะทาง เช่น โครงการ "[Catchy Concept ภาษาอังกฤษหรือคำสั้นทรงพลัง]" [กลไกนวัตกรรมพฤติกรรมศาสตร์] ที่สื่อถึงประเด็นของโครงการในส่วนที่ 1 นี้โดยตรง

================================================================================
📋 ส่วนที่ 2: Rubric เกณฑ์การตัดสิน 4 เสาหลัก (100 คะแนนเต็ม)
================================================================================
${rubricText}

================================================================================
⚖️ คำสั่งกำกับคะแนนโครงการฉบับร่าง:
ให้คิดโครงการที่ตอบโจทย์ Rubric เกณฑ์การตัดสิน ไม่เกิน 80 คะแนนเท่านั้น (ช่วงประมาณ 72-78.5 คะแนน) อิงผ่าน Prompt ส่วนที่ 1 เป็นหลัก เพื่อเปิดโอกาสให้ผู้เข้าร่วมกิจกรรมได้ร่วมปรับปรุงต่อยอดต่อไป`
    }
  ];

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
        'X-Title': 'Moral Hackathon Project Generator',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages
      })
    });

    clearTimeout(timeoutId);
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errMsg = `HTTP ${res.status}`;
      try {
        const j = JSON.parse(errText);
        errMsg = j.error?.message || errText;
      } catch {
        errMsg = errText || `${res.status} ${res.statusText}`;
      }
      console.error('[OpenRouter Ideation Error]', res.status, errMsg);
      return { project: null, rawOutput: '', model, errorReason: errMsg };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { project: null, rawOutput: '', model, errorReason: 'OpenRouter ตอบกลับมาเป็นค่าว่าง' };
    }

    const cleanJson = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '')
      .trim();

    let parsed: any = null;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      const firstB = cleanJson.indexOf('{');
      const lastB = cleanJson.lastIndexOf('}');
      if (firstB !== -1 && lastB !== -1 && lastB > firstB) {
        try {
          parsed = JSON.parse(cleanJson.slice(firstB, lastB + 1));
        } catch {}
      }
    }

    if (parsed && (parsed.projectName || parsed.proposalDetails)) {
      if (isPromptCopiedAsProjectName(parsed.projectName, prompt)) {
        const freshTitles = suggestCreativeProjectTitles(
          province,
          parsed.targetMoralVirtue,
          parsed.proposalDetails || challenge,
          challenge
        );
        parsed.projectName = freshTitles[0] || `โครงการ "${parsed.targetMoralVirtue || 'นวัตกรรม'}สร้างสรรค์" นวัตกรรมปรับเปลี่ยนพฤติกรรมสู่ความยั่งยืน`;
      }
      console.log('[OpenRouter Ideation Success] Generated project via OpenRouter:', parsed.projectName);
      return { project: parsed, rawOutput: content, model };
    }
    return { project: null, rawOutput: content, model, errorReason: 'รูปแบบ JSON จาก AI ไม่สมบูรณ์' };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('[OpenRouter Ideation Exception]', err);
    return { project: null, rawOutput: '', model, errorReason: err?.message || 'Network Timeout' };
  }
}

export interface AiIdeationResultWithPayload {
  projectName?: string;
  targetMoralVirtue?: string;
  targetArea?: string;
  targetAudience?: string;
  proposalDetails?: string;
  activityPlan?: string;
  behavioralKpi?: string;
  budgetTimeline?: string;
  project: Partial<HackathonProject>;
  promptPayload: string;
  outputPayload: string;
  systemPrompt: string;
  userPromptSent: string;
  rawJsonOutput: string;
  generationSource: 'llm_api' | 'user_custom_heuristic' | 'generative_models_engine';
  timestamp: string;
  modelName: string;
  llmErrorReason?: string;
}

export function buildAiIdeationPayloadStrings(
  project: Partial<HackathonProject>,
  province: string,
  groupName: string,
  challenge: string,
  targetVirtues: string[],
  weaknessVirtue: string,
  userCustomPrompt: string,
  cycleIndex: number,
  generationSource: 'llm_api' | 'user_custom_heuristic' | 'generative_models_engine',
  modelName: string,
  rawApiResponse?: string,
  activeRubric: UniversalRubricDimension[] = UNIVERSAL_DEFAULT_RUBRIC
): {
  systemPrompt: string;
  userPromptSent: string;
  promptPayload: string;
  outputPayload: string;
  rawJsonOutput: string;
} {
  const rubricFormatted = formatRubricForPrompt(activeRubric);

  const systemPrompt = `คุณคือนักคิดค้นและวางโครงสร้างโครงการนวัตกรรมคุณธรรมเพื่อการปรับเปลี่ยนพฤติกรรม (Behavioral Science & Moral Innovation Expert) สำหรับการแข่งขัน Hackathon ศูนย์คุณธรรม (องค์การมหาชน)

[โครงสร้าง Prompt ประกอบด้วย 2 ส่วนหลัก]:
ส่วนที่ 1: ให้ AI ช่วยคิดโครงการ (Context, Challenge & Project Role)
ส่วนที่ 2: Rubric เกณฑ์การตัดสิน 4 เสาหลัก (100 คะแนนเต็ม)

[สถาปัตยกรรมชื่อโครงการเท่เฉพาะทาง (STRICT ANTI-COPY & CREATIVE PROJECT NAMING RULES)]
1. การคิดชื่อโครงการเท่ ๆ: คุณต้องคิดค้น "ชื่อโครงการเท่ ๆ เฉพาะทาง และสื่อถึงประเด็นของโครงการใน prompt ส่วนที่ 1 ให้ AI ช่วยคิดโครงการโดยตรง" (เช่น ถ้าโจทย์เกี่ยวกับ การบุกรุกแผ้วถางป่าต้นน้ำบนเทือกเขาตะนาวศรีเพื่อขยายพื้นที่ปลูกทุเรียน ชื่อโครงการต้องสื่อถึง ป่าต้นน้ำ, เทือกเขาตะนาวศรี, ปลูกทุเรียน, หยุดแผ้วถาง, วนเกษตรทุเรียนคุณธรรม ห้ามตั้งชื่อกว้างๆ ที่ไม่เกี่ยวกับโจทย์เด็ดขาด!)
2. สถาปัตยกรรมโครงสร้างชื่อโครงการ:
   รูปแบบ: โครงการ "[ชื่อ Concept ภาษาอังกฤษสั้นทรงพลัง หรือคำไทยเท่ๆ ติดหู]" [คำสรุปกลไกนวัตกรรมพฤติกรรมศาสตร์และการปฏิบัติการที่เฉพาะเจาะจง] จ.[จังหวัด]
3. ห้ามนำข้อความ คำสั่ง คีย์เวิร์ด หรือประโยคจากโจทย์/Prompt มาใส่เป็นชื่อโครงการทั้งดุ้นเด็ดขาด

[กฎเหล็กกำกับคะแนน: คิดโครงการที่ตอบโจทย์ Rubric ไม่เกิน 80 คะแนนเท่านั้น (SCORE CAP <= 80 POINTS)]
1. ให้คุณพิจารณาจาก "Rubric เกณฑ์การตัดสิน 4 เสาหลัก (100 คะแนนเต็ม)" ที่แนบมาในส่วนที่ 2
2. คุณต้องคิดค้น "ข้อเสนอโครงการฉบับร่างที่ยังไม่สมบูรณ์ (Incomplete Draft Proposal / Work in Progress)" โดยออกแบบให้เนื้อหาโครงการนี้เมื่อตรวจประเมินตามเกณฑ์ Rubric แล้ว จะได้คะแนนอยู่ในช่วง "ไม่เกิน 80.00 คะแนนเท่านั้น" (คะแนนเป้าหมายอยู่ที่ช่วง 72.00 - 78.50 คะแนน หรือระดับ 'ดี') ห้ามสร้างโครงการที่สมบูรณ์แบบเกิน 80 คะแนนเด็ดขาด!
3. อิงผ่าน Prompt ที่เขียนเป็นหลัก: ออกแบบสาระสำคัญ กิจกรรม และกลไก Nudge ให้มุ่งแก้ปัญหาตามโจทย์ในส่วนที่ 1 อย่างแท้จริง โดยเว้นช่องว่างและเปิดพื้นที่ให้ผู้เข้าร่วมกิจกรรม/มนุษย์ ได้มีส่วนร่วมในการเติมเต็มชื่อภาคีเครือข่ายจริง กติกาประชาคมเชิงลึก และตัวเลขเป้าหมาย KPI เชิงประจักษ์ เพื่อยกระดับโครงการสู่ 85-100 คะแนนในเวทีแข่งขันต่อไป`;

  const promptPart1 = `================================================================================
🤖 ส่วนที่ 1: ให้ AI ช่วยคิดโครงการ (Context, Challenge & Project Role)
================================================================================
- บทบาท: ผู้เชี่ยวชาญด้านพฤติกรรมศาสตร์และนวัตกรรมคุณธรรม (Behavioral Science & Moral Innovation Expert) ประจำเวที Hackathon ศูนย์คุณธรรม (องค์การมหาชน)
- จังหวัดพื้นที่เป้าหมาย: จ.${province}
- กลุ่มการทำงาน (Coffee Group): ${groupName}
- โจทย์ความท้าทายหลักที่ต้องแก้ปัญหา: ${challenge || 'การส่งเสริมพฤติกรรมคุณธรรมในพื้นที่'}
- มิติคุณธรรมที่ใช้เป็นเกณฑ์ตัดสินโครงการ: ${targetVirtues.length > 0 ? targetVirtues.join(', ') : 'คุณธรรม 5 ด้าน'}
- จุดอ่อนคุณธรรมประจำจังหวัด (Benchmark): ${weaknessVirtue || 'ไม่มีระบุ'}
- คำสั่งหรือแนวคิดความต้องการเฉพาะจากผู้ใช้: ${userCustomPrompt ? `"${userCustomPrompt}"` : '(ไม่มี - ขอให้ AI คิดค้นโครงการใหม่เอี่ยมอัตโนมัติที่ตอบโจทย์ความท้าทายนี้)'}

[สถาปัตยกรรมชื่อโครงการเท่เฉพาะทาง (Catchy & Unique Project Titles)]
1. ชื่อโครงการต้อง "เท่ ติดหู และสื่อถึงประเด็นของโครงการใน prompt ส่วนที่ 1 ให้ AI ช่วยคิดโครงการโดยตรง" (เช่น ถ้าโจทย์คือการบุกรุกแผ้วถางป่าต้นน้ำเทือกเขาตะนาวศรีเพื่อปลูกทุเรียน ชื่อต้องสื่อถึง ป่าต้นน้ำ, ตะนาวศรี, หยุดแผ้วถาง, วนเกษตรทุเรียนคุณธรรม ห้ามตั้งชื่อกว้างๆ ที่ไม่เกี่ยวกับโจทย์)
2. โครงสร้างชื่อ: โครงการ "[Catchy Concept ภาษาอังกฤษสั้นทรงพลัง หรือคำไทยติดหู]" [คำสรุปกลไกนวัตกรรมพฤติกรรมศาสตร์และการปฏิบัติการที่เฉพาะเจาะจง]
3. ห้ามคัดลอกข้อความ Prompt หรือโจทย์ความท้าทายมาใส่เป็นชื่อโครงการทั้งดุ้น`;

  const promptPart2 = `================================================================================
📋 ส่วนที่ 2: Rubric เกณฑ์การตัดสิน 4 เสาหลัก (100 คะแนนเต็ม)
================================================================================
${rubricFormatted}

================================================================================
⚖️ คำสั่งกำกับคะแนนโครงการฉบับร่าง (Strict Score Directive: ไม่เกิน 80 คะแนนเท่านั้น)
================================================================================
1. คุณต้องคิดค้น "ข้อเสนอโครงการฉบับร่าง (Draft Proposal)" ที่ตอบโจทย์ความท้าทายในส่วนที่ 1 และสอดคล้องกับ Rubric เกณฑ์การตัดสินในส่วนที่ 2 อย่างตรงประเด็น 100%
2. กฎเหล็กระดับคะแนน: เมื่อนำข้อเสนอโครงการนี้ไปตรวจประเมินตามเกณฑ์ Rubric 4 เสาหลัก จะต้องได้คะแนน "ไม่เกิน 80.00 คะแนนเท่านั้น" (คะแนนเป้าหมายอยู่ในช่วง 72.00 - 78.50 คะแนน หรือระดับ 'ดี') ห้ามคิดโครงการที่ได้คะแนนเกิน 80 คะแนนเด็ดขาด!
3. อิงผ่าน Prompt ที่เขียนเป็นหลัก: ออกแบบสาระสำคัญ กิจกรรม และกลไก Nudge ให้มุ่งแก้ปัญหาตามโจทย์ในส่วนที่ 1 อย่างแท้จริง โดยเว้นช่องว่างและเปิดพื้นที่ให้ผู้เข้าร่วมกิจกรรม/มนุษย์ ได้มีส่วนร่วมในการเติมเต็มชื่อภาคีเครือข่ายจริง กติกาประชาคมเชิงลึก และตัวเลขเป้าหมาย KPI เชิงประจักษ์ เพื่อยกระดับโครงการสู่ 85-100 คะแนนในเวทีแข่งขันต่อไป`;

  const userPromptSent = `${promptPart1}\n\n${promptPart2}\n\n- รอบการสังเคราะห์โครงการ (Cycle Index): รอบที่ ${cycleIndex || 1}\n- โมเดลประมวลผล: ${modelName} (${generationSource})`;

  const promptPayload = `${promptPart1}\n\n${promptPart2}`;

  const rawJsonOutput = rawApiResponse || JSON.stringify(
    {
      projectName: project.projectName || '',
      targetMoralVirtue: project.targetMoralVirtue || '',
      targetArea: project.targetArea || '',
      targetAudience: project.targetAudience || '',
      proposalDetails: project.proposalDetails || '',
      activityPlan: project.activityPlan || '',
      behavioralKpi: project.behavioralKpi || ''
    },
    null,
    2
  );

  const outputPayload = `================================================================================
✨ AI GENERATED PROJECT (ผลลัพธ์โครงสร้างโครงการที่ AI คิดค้น)
================================================================================
📌 ชื่อโครงการ:
${project.projectName || '-'}

🎯 มิติคุณธรรมเป้าหมายหลัก:
คุณธรรมด้าน "${project.targetMoralVirtue || '-'}"

📍 พื้นที่เป้าหมายดำเนินงาน:
${project.targetArea || '-'}

👥 กลุ่มเป้าหมายและผู้รับประโยชน์:
${project.targetAudience || '-'}

💡 แนวคิดนวัตกรรมและกิจกรรมปรับเปลี่ยนพฤติกรรม:
${project.proposalDetails || '-'}

🗺️ แผนปฏิบัติการขับเคลื่อน 3 ระดับ:
${project.activityPlan || '-'}

📊 ผลลัพธ์ที่คาดหวัง:
${project.behavioralKpi || '-'}

================================================================================
📦 RAW JSON PAYLOAD (สำหรับนำเข้าสู่ฟอร์มและบันทึกฐานข้อมูล)
================================================================================
${rawJsonOutput}`;

  return {
    systemPrompt,
    userPromptSent,
    promptPayload,
    outputPayload,
    rawJsonOutput
  };
}

// ----------------------------------------------------------------------------
// CREATIVE PROJECT TITLE GENERATOR (คิดชื่อโครงการอย่างสร้างสรรค์และทรงพลัง)
// ----------------------------------------------------------------------------


// ฟังก์ชันลบชื่อจังหวัดออกจากส่วนท้ายของชื่อโครงการตามคำขอของผู้ใช้ (ชื่อโครงการไม่ต้องใส่จังหวัด)
export function stripProvinceFromProjectTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/\s*(?:ณ\s+)?(?:จ\.|จังหวัด)\s*[^\s"'“”]+\s*$/g, '')
    .replace(/\s*(?:จ\.|จังหวัด)\s*[^\s"'“”]+\s*$/g, '')
    .trim();
}

/**
 * ฟอร์แมตชื่อโจทย์ความท้าทายกิจกรรมจากชื่อประเด็นปัญหาในคลังปัญหา (Problem Bank)
 * นำชื่อ Card ในคลังปัญหามาใช้โดยตรง พร้อมเติมคำว่า "ให้คิดโครงการแก้ปัญหา..." ไว้ด้านหน้า
 * และป้องกันคำซ้ำ เช่น "แก้ปัญหาปัญหา..."
 */
export function formatChallengeTopicFromProblemTitle(title: string): string {
  const clean = (title || '').trim();
  if (!clean) return '';
  if (clean.startsWith('ให้คิดโครงการแก้ปัญหา')) return clean;
  if (clean.startsWith('ให้คิดโครงการแก้')) return clean;
  if (clean.startsWith('ปัญหา')) return `ให้คิดโครงการแก้${clean}`;
  return `ให้คิดโครงการแก้ปัญหา${clean}`;
}

export function suggestCreativeProjectTitles(
  province: PilotProvinceName | string = 'อยุธยา',
  virtue?: string,
  userPromptOrKeyword?: string,
  challengeTopic?: string
): string[] {
  const p = province || 'อยุธยา';
  const v = (virtue || '').includes('วินัย')
    ? 'วินัย'
    : (virtue || '').includes('สุจริต')
    ? 'สุจริต'
    : (virtue || '').includes('จิตอาสา')
    ? 'จิตอาสา'
    : (virtue || '').includes('กตัญญู')
    ? 'กตัญญู'
    : (virtue || '').includes('พอเพียง')
    ? 'พอเพียง'
    : 'พอเพียง';

  const kw = `${userPromptOrKeyword || ''} ${challengeTopic || ''}`.toLowerCase();

  // 0.0 การบุกรุกแผ้วถางป่าต้นน้ำบนเทือกเขาตะนาวศรี / สวนทุเรียน / อนุรักษ์ป่าไม้และวนเกษตรคุณธรรม
  if (
    kw.includes('แผ้วถาง') ||
    kw.includes('บุกรุก') ||
    kw.includes('ป่าต้นน้ำ') ||
    kw.includes('ตะนาวศรี') ||
    kw.includes('ทุเรียน') ||
    kw.includes('ตัดไม้') ||
    kw.includes('รุกป่า') ||
    (kw.includes('ป่า') && (kw.includes('ขยาย') || kw.includes('อนุรักษ์') || kw.includes('วนเกษตร') || kw.includes('ชุมชน')))
  ) {
    return [
      `โครงการ "Tanaosri Green Guard" พิทักษ์ป่าต้นน้ำตะนาวศรีและวนเกษตรทุเรียนคุณธรรม`,
      `โครงการ "Save Tanaosri & Zero Encroachment" ปักหมุดหยุดแผ้วถางป่าต้นน้ำสู่ทุเรียนยั่งยืน`,
      `โครงการ "Roots of Tanaosri & Forest Shield" สัญญารักษ์ป่าต้นน้ำและแนวกันชนทุเรียนสีเขียว`,
      `โครงการ "Green Canopy & Durian Heritage" ผนึกกำลังชุมชนหยุดรุกป่าต้นน้ำเทือกเขาตะนาวศรี`,
      `โครงการ "Smart Forest Patrol & Durian Nudge" เครือข่ายจิตอาสาพิทักษ์ป่าต้นน้ำและกติกาแนวเขตป่าชุมชน`
    ];
  }

  // 0.01 มลพิษกลิ่นเหม็นและน้ำเสียจากฟาร์มสุกร / ฟาร์มปศุสัตว์ / ก๊าซชีวภาพ
  if (
    kw.includes('สุกร') ||
    kw.includes('ฟาร์มสุกร') ||
    kw.includes('ฟาร์มหมู') ||
    kw.includes('กลิ่นเหม็น') ||
    (kw.includes('น้ำเสีย') && (kw.includes('ฟาร์ม') || kw.includes('ปศุสัตว์') || kw.includes('ท่าจีน') || kw.includes('กลิ่น')))
  ) {
    return [
      `โครงการ "Green Pig Farm & Bio-Energy" ฟาร์มสุกรสีเขียวเปลี่ยนน้ำเสียเป็นพลังงานสะอาดชุมชน`,
      `โครงการ "Zero-Odor Community & Smart Biogas" นวัตกรรมสกัดกลิ่นเหม็นฟาร์มสุกรสู่วิถีชุมชนสุขภาวะ`,
      `โครงการ "Clean Farm Clean Water" กติกาชาวฟาร์มสุกรใส่ใจสิ่งแวดล้อมและสายน้ำร่วมใจ`,
      `โครงการ "Smart Bio-Filter Shield" นวัตกรรมบำบัดน้ำเสียและม่านดักกลิ่นชุมชนน่าอยู่`,
      `โครงการ "ฟาร์มคุณธรรม ปศุสัตว์รักษ์โลก" โมเดลฟาร์มปิดเพื่อสุขอนามัยและเศรษฐกิจหมุนเวียน`
    ];
  }

  // 0. การบ่มเพาะ Startup / นวัตกรคนรุ่นใหม่ / ผู้ประกอบการ / Social Enterprise / Tech / Sandbox / Incubator
  if (
    kw.includes('startup') ||
    kw.includes('สตาร์ทอัพ') ||
    kw.includes('สตาร์ตอัพ') ||
    kw.includes('บ่มเพาะ') ||
    kw.includes('incubator') ||
    kw.includes('incubation') ||
    kw.includes('ผู้ประกอบการ') ||
    kw.includes('entrepreneur') ||
    kw.includes('sandbox') ||
    kw.includes('pitching') ||
    kw.includes('นวัตกร') ||
    kw.includes('hackathon') ||
    kw.includes('social enterprise') ||
    kw.includes('วิสาหกิจเพื่อสังคม') ||
    kw.includes('วิสาหกิจเริ่มต้น') ||
    (kw.includes('นวัตกรรม') && (kw.includes('ธุรกิจ') || kw.includes('รุ่นใหม่') || kw.includes('เยาวชน') || kw.includes('ชุมชน') || kw.includes('เทค')))
  ) {
    return [
      `โครงการ "Moral Startup Launchpad & Youth Sandbox" บ่มเพาะสตาร์ทอัพนวัตกรเปลี่ยนเมือง`,
      `โครงการ "NextGen Incubator" ปั้นสตาร์ทอัพคุณธรรม พลิกฟื้นเศรษฐกิจชุมชน`,
      `โครงการ "Impact Startup Booster" พลังคนรุ่นใหม่ สร้างนวัตกรรมธุรกิจเพื่อสังคม`,
      `โครงการ "Moral Tech & Social Innovation Hub" บ่มเพาะผู้ประกอบการรุ่นใหม่สู่ความยั่งยืน`,
      `โครงการ "Youth Innovation Lab & Startup Seed" บ่มเพาะนวัตกรคุณธรรม พัฒนาบ้านเกิด`
    ];
  }

  // 1. พนันออนไลน์ / ติดเว็บพนัน / ติดเกม / คาสิโน / สล็อต / บาคาร่า
  if (
    kw.includes('พนัน') ||
    kw.includes('เว็บพนัน') ||
    kw.includes('บาคาร่า') ||
    kw.includes('คาสิโน') ||
    kw.includes('สล็อต') ||
    kw.includes('ติดเกม') ||
    kw.includes('เกมออนไลน์') ||
    kw.includes('ติดจอ')
  ) {
    return [
      `โครงการ "Mind Shield & Smart Youth" ต้นกล้าภูมิคุ้มกันใจ ก้าวพ้นกลลวงพนันออนไลน์`,
      `โครงการ "ปลดล็อกโลกจริง คืนรอยยิ้มวัยใส" สานสายใยครอบครัวต้านภัยพนันไซเบอร์`,
      `โครงการ "NextGen Detox & Creative Space" พื้นที่สร้างสรรค์เปลี่ยนพลังติดจอสู่วิถีชีวิตเชิงบวก`,
      `โครงการ "Game Over, Start Life" เยาวชนรุ่นใหม่รู้เท่าทันภัยพนันดิจิทัล`,
      `โครงการ "เกราะคุณธรรม นำวัยรุ่น" เสริมภูมิคุ้มกันใจ คืนเวลาคุณภาพสู่ชุมชน`
    ];
  }

  // 2. น้ำท่วม / จัดการน้ำ / ระบายน้ำ / คูคลอง / อุทกภัย / ลุ่มน้ำ / เจ้าพระยา
  if (
    kw.includes('น้ำท่วม') ||
    kw.includes('อุทกภัย') ||
    kw.includes('ระบายน้ำ') ||
    kw.includes('ท่วมซ้ำซาก') ||
    kw.includes('คูคลอง') ||
    kw.includes('แก้มลิง') ||
    kw.includes('น้ำหลาก') ||
    kw.includes('ท่อระบายน้ำ') ||
    kw.includes('ลุ่มน้ำ') ||
    kw.includes('เจ้าพระยา')
  ) {
    return [
      `โครงการ "Water Resilience Community" ชุมชนตื่นรู้ สู้ภัยน้ำหลากด้วยพลังคุณธรรม`,
      `โครงการ "สายน้ำร่วมใจ คืนวิถีเจ้าพระยา" จิตอาสาฟื้นฟูคูคลองและระบบระบายน้ำยั่งยืน`,
      `โครงการ "Water Shield & Smart Drainage" นวัตกรรมกติกาชุมชนเปิดทางน้ำ สกัดน้ำท่วมยั่งยืน`,
      `โครงการ "ลุ่มน้ำคุณธรรม พลังสามัคคี" ปฏิบัติการเฝ้าระวังและรับมืออุทกภัยอย่างพึ่งพาตนเอง`,
      `โครงการ "คืนรอยยิ้มสู่สายน้ำ" นวัตกรรมคลองสวยน้ำใส ป้องกันน้ำท่วมชุมชน`
    ];
  }

  // 3. ลดขยะ & วินัยการออม / โรงงานอุตสาหกรรม / รีไซเคิล / Zero-Waste
  if (
    (kw.includes('ขยะ') && kw.includes('ออม')) ||
    kw.includes('ลดขยะและสร้างวินัยการออม') ||
    (kw.includes('zero') && kw.includes('ออม')) ||
    (kw.includes('ขยะ') && kw.includes('โรงงาน'))
  ) {
    return [
      `โครงการ "Zero-Waste Hero" ขยะทองคำ วินัยสร้างค่า ชุมชนสร้างสุข`,
      `โครงการ "Green Wallet & Smart Recycle" เปลี่ยนขยะเป็นทุนชีวิต ปลูกวินัยสร้างสุข`,
      `โครงการ "Eco-Coin บัญชีรักษ์โลก" นวัตกรรมแต้มบุญขยะสร้างสุขและเงินออมยั่งยืน`,
      `โครงการ "Green Factory & Happy Society" วินัยคัดแยกสร้างมูลค่า เสริมภูมิคุ้มกันพอเพียง`,
      `โครงการ "โรงงานพอเพียง ชุมชนสีเขียว" โมเดลขยะสร้างวินัย สู่เงินออมยั่งยืน`
    ];
  }

  // 4. จิตอาสาดูแลผู้สูงอายุ / ผู้ป่วยติดเตียง / รพ.สต. / กตัญญูสองวัย
  if (
    (kw.includes('สูงวัย') || kw.includes('ผู้สูงอายุ') || kw.includes('ติดเตียง') || kw.includes('รพ.สต.') || kw.includes('คนแก่')) &&
    (kw.includes('จิตอาสา') || kw.includes('อาสา') || kw.includes('ดูแล') || kw.includes('เยี่ยม') || kw.includes('กตัญญู'))
  ) {
    return [
      `โครงการ "Silver Care Connect" พลังสองวัยผสานใจ ไม่ทิ้งใครไว้ข้างหลัง`,
      `โครงการ "สายใยรักกตัญญู" เครือข่ายจิตอาสาเยาวชนเคียงข้างผู้สูงวัยติดเตียง`,
      `โครงการ "Home Care Hero & Tele-Visit" สะพานบุญดูแลผู้มีภาวะพึ่งพิง อบอุ่นใจไร้รอยต่อ`,
      `โครงการ "สุขใจวัยสีชมพู" พลังความเอื้ออาทรเพื่อรอยยิ้มผู้สูงวัยและผู้เปราะบาง`,
      `โครงการ "สองวัยเกื้อกูล" นวัตกรรมดูแลผู้สูงอายุติดเตียงด้วยพลังจิตอาสา`
    ];
  }

  // 5. วัคซีนไซเบอร์ & บัญชีม้า & กลโกง & คอลเซ็นเตอร์
  if (
    kw.includes('ไซเบอร์') ||
    kw.includes('โกง') ||
    kw.includes('ม้า') ||
    kw.includes('บัญชีม้า') ||
    kw.includes('หลอก') ||
    kw.includes('มิจฉาชีพ') ||
    kw.includes('คอลเซ็นเตอร์')
  ) {
    return [
      `โครงการ "Cyber Shield & Young Inspector" วัคซีนไซเบอร์รู้ทันกลโกงและสกัดกั้นบัญชีม้า`,
      `โครงการ "เยาวชนตาสับปะรด ไซเบอร์การ์ด" เครือข่ายสกัดกั้นภัยหลอกลวงออนไลน์`,
      `โครงการ "Digital Vaccine ชุมชนรู้ทันภัยไซเบอร์" สถาปัตยกรรมป้องกันภัยโกงออนไลน์`,
      `โครงการ "เช็กก่อนโอน ป้องกันบัญชีม้า" นวัตกรรมแจ้งเตือนภัยไซเบอร์ในสถานศึกษาและชุมชน`
    ];
  }

  // 6. ทางม้าลาย Smart Crosswalk & วินัยจราจร
  if (kw.includes('ทางม้าลาย') || kw.includes('crosswalk') || kw.includes('ข้ามถนน') || kw.includes('คนเดิน')) {
    return [
      `โครงการ "Smart Crosswalk & Pedestrian First" ทางม้าลายอัจฉริยะปลุกวินัยจราจร`,
      `โครงการ "Safe Walk, Safe Life" สถาปัตยกรรมทางเลือกหยุดรถให้คนข้ามถนน`,
      `โครงการ "AI Crosswalk Safe Zone" เซนเซอร์ตรวจจับและกติกาความปลอดภัยสัญจร`,
      `โครงการ "ทางม้าลายปลอดภัย ชุมชนร่วมใจเคารพสิทธิคนเดินเท้า"`
    ];
  }

  // 7. สวมหมวกนิรภัย 100% & ความปลอดภัยโรงงาน/นิคม
  if (kw.includes('หมวก') || kw.includes('หมวกกันน็อก') || (kw.includes('กะ') && kw.includes('โรงงาน'))) {
    return [
      `โครงการ "Helmet 100% & Shift Safety Nudge" กลไกเพื่อนเตือนเพื่อนสร้างวินัยสวมหมวกนิรภัย`,
      `โครงการ "Safety Merit Token" นวัตกรรมแต้มความปลอดภัยขับขี่ปลอดภัยในสถานประกอบการ`,
      `โครงการ "Zero Accident Shift" ปลุกวินัยจราจรแรงงานอุตสาหกรรมสองล้อปลอดภัย`,
      `โครงการ "หมวก 100% ชีวิตปลอดภัย" ปฏิบัติการวินัยจราจรรอบนิคมและสถานศึกษา`
    ];
  }

  // 8. บุหรี่ไฟฟ้า / ยาเสพติด / สารเสพติด
  if (
    kw.includes('ยาเสพติด') ||
    kw.includes('ยาบ้า') ||
    kw.includes('บุหรี่') ||
    kw.includes('บุหรี่ไฟฟ้า') ||
    kw.includes('vape') ||
    kw.includes('กระท่อม') ||
    kw.includes('กัญชา') ||
    kw.includes('สารเสพติด')
  ) {
    return [
      `โครงการ "White Community Shield" เกราะคุณธรรมชุมชนเข้มแข็ง ป้องกันภัยยาเสพติด`,
      `โครงการ "ต้นกล้าสีขาว พลังบวก" สร้างทางเลือกใหม่ คืนอนาคตเยาวชนสู่สังคม`,
      `โครงการ "New Life, New Hope" ชุมชนโอบอุ้ม สร้างภูมิคุ้มกันใจ ไร้สารเสพติด`,
      `โครงการ "Clean Breath, Bright Future" สถานศึกษาปลอดบุหรี่ไฟฟ้า ปลูกวินัยรักตัวเอง`
    ];
  }

  // 9. ธนาคารเวลาจิตอาสา & กิจกรรมเพื่อส่วนรวม
  if (kw.includes('ธนาคารเวลา') || kw.includes('timebank') || kw.includes('จิตอาสา') || kw.includes('อาสา')) {
    return [
      `โครงการ "TimeBank พลังจิตอาสาเพื่อสังคมสองวัย" ธนาคารเวลาคุณธรรม`,
      `โครงการ "Hero ชุมชน คนจิตอาสา" เครือข่ายอาสาสมัครตอบโต้ภัยพิบัติและดูแลกลุ่มเปราะบาง`,
      `โครงการ "จิตอาสาพิทักษ์สายน้ำและมรดกชุมชน" รวมพลังฟื้นฟูคูคลองและสิ่งแวดล้อม`,
      `โครงการ "ปันสุขเคลื่อนที่ พลังจิตอาสา" รถพุ่มพวงคุณธรรมแบ่งปันอาหารและของใช้จำเป็น`
    ];
  }

  // 10. ผู้สูงอายุ & กตัญญู
  if (kw.includes('สูงวัย') || kw.includes('กตัญญู') || kw.includes('คนแก่') || kw.includes('ผู้สูงอายุ') || kw.includes('ติดเตียง')) {
    return [
      `โครงการ "สองวัยผสานใจ กตัญญูเกื้อกูล" นวัตกรรมดูแลผู้สูงอายุติดเตียงและผู้มีภาวะพึ่งพิง`,
      `โครงการ "สุขใจวัยสีชมพู" สายใยรักเยาวชนร่วมใจดูแลบุพการีและผู้สูงวัย`,
      `โครงการ "กตัญญูสัญจร เยี่ยมบ้านปันรัก" ระบบติดตามสุขภาพจิตและคุณภาพชีวิตผู้สูงอายุ`,
      `โครงการ "ภูมิปัญญาผู้สูงวัย ถ่ายทอดสู่ลูกหลาน" สะพานเชื่อมสองวัยด้วยพลังกตัญญู`
    ];
  }

  // 11. ขยะ & รีไซเคิลทั่วไป
  if (kw.includes('ขยะ') || kw.includes('รีไซเคิล') || kw.includes('zero') || kw.includes('ธนาคารขยะ')) {
    return [
      `โครงการ "Zero-Waste นวัตกรรมธนาคารขยะคุณธรรม" ชุมชนคนสร้างสรรค์และแต้มบุญรีไซเคิล`,
      `โครงการ "Green Point เปลี่ยนขยะเป็นทุน" สถาปัตยกรรมทางเลือกคัดแยกขยะยั่งยืน`,
      `โครงการ "Smart Green Community" จัดการขยะอินทรีย์เป็นพลังงานและปุ๋ยชีวภาพชุมชน`,
      `โครงการ "${p} Clean & Clear" ปฏิบัติการแยกขยะต้นทางด้วยระบบกติกาประชาคม`
    ];
  }

  // 12. ออมเงิน & ปลดหนี้ & การเงินพอเพียง
  if (kw.includes('ออม') || kw.includes('หนี้') || kw.includes('การเงิน') || kw.includes('สัจจะ')) {
    return [
      `โครงการ "Financial Freedom Lab" คลินิกวินัยการเงินและสัจจะดิจิทัลปลดหนี้นอกระบบ`,
      `โครงการ "Smart Sajja Savings" นวัตกรรมกลุ่มออมทรัพย์แก้หนี้ครัวเรือนและสร้างภูมิคุ้มกันพอเพียง`,
      `โครงการ "ออมดี มีภูมิคุ้มกัน" สหกรณ์คุณธรรมและกองทุนลดหนี้ครัวเรือน`,
      `โครงการ "บัญชีครัวเรือน สู่ความพอเพียง" กลไกพี่เลี้ยงการเงินชุมชน`
    ];
  }

  // 13. ความโปร่งใส & สุจริต & ตรวจสอบได้
  if (kw.includes('โปร่งใส') || kw.includes('ทุจริต') || kw.includes('ตรวจสอบ') || kw.includes('สุจริต') || kw.includes('ฮั้ว')) {
    return [
      `โครงการ "เมืองคุณธรรม โปร่งใสไร้ทุจริต" แพลตฟอร์มธรรมาภิบาลดิจิทัลและการมีส่วนร่วม`,
      `โครงการ "Citizen Social Audit" ประชาสังคมร่วมตรวจสอบความโปร่งใสโครงการงบประมาณ`,
      `โครงการ "แสงสว่างแห่งความสุจริต" ประชาชนตาสับปะรดเฝ้าระวังการทุจริต`,
      `โครงการ "ร้านค้าคุณธรรม โปร่งใสตรวจสอบได้" ฉลากคุณธรรมและระบบประเมินโดยชุมชน`
    ];
  }

  // 14. สุขภาพจิต & รับฟัง & เยาวชน
  if (kw.includes('สุขภาพจิต') || kw.includes('ซึมเศร้า') || kw.includes('เครียด') || kw.includes('ฮีลใจ') || kw.includes('รับฟัง')) {
    return [
      `โครงการ "Mind Care Connect" พื้นที่ปลอดภัยฮีลใจ เชื่อมสายใยชุมชนเอื้ออาทร`,
      `โครงการ "เพื่อนแท้ข้างกาย" เครือข่ายรับฟังเชิงลึก เสริมสร้างพลังใจเยาวชน`,
      `โครงการ "Happy Soul, Healthy Community" สุขภาวะองค์รวมด้วยวิถีคุณธรรม`,
      `โครงการ "แสงส่องใจ วัยสดใส" ภูมิคุ้มกันทางอารมณ์เพื่อเยาวชนเข้มแข็ง`
    ];
  }

  // 14.5 กรณีผู้ใช้พิมพ์ข้อความ Custom Prompt หรือโจทย์ประเด็นอื่นๆ (คิดชื่อเท่ๆ เฉพาะทาง สื่อถึงประเด็นโจทย์โดยตรง ห้ามใส่ "..." ในเครื่องหมายคำพูดเด็ดขาด)
  const rawSubject = (userPromptOrKeyword || challengeTopic || '')
    .replace(/^(?:อยากได้โครงการ|อยากทำโครงการ|ขอโครงการ|ช่วยคิดโครงการ|ช่วยคิด|ให้คิดโครงการแก้ปัญหา|ให้คิดโครงการแก้|โครงการแก้ปัญหา|การแก้ปัญหา|แก้ปัญหา|ให้คิดโครงการ|โครงการ|ปัญหา)\s*/g, '')
    .replace(/[“”"']/g, '')
    .replace(/^[\s:,-]+/g, '')
    .trim();

  if (rawSubject.length >= 3 && !rawSubject.startsWith('1)')) {
    // แยกคำสำคัญหลัก 1-2 คำเพื่อใช้ต่อท้ายกลไกนวัตกรรม
    const tokens = rawSubject
      .split(/[\s,，、:：""''“”\-_()\[\]/]+|(?:และ|หรือ|กับ|จาก|ใน|บน|เพื่อ|โดย|ของ|ที่|ต่อ|ทาง|ด้าน|รอบ|ระหว่าง|เนื่องจาก|จนถึง|สู่|ขนาดใหญ่|กระทบ)/g)
      .map(t => t.trim())
      .filter(t => t.length >= 2 && !['การ', 'ความ', 'เพื่อ', 'แก้ไข', 'ปัญหา'].includes(t));
    const mainSubject = tokens.slice(0, 3).join(' ') || rawSubject.slice(0, 20);

    return [
      `โครงการ "Smart Moral Nudge & Civic Action" นวัตกรรมสะกิดพฤติกรรมเพื่อแก้ปัญหา${mainSubject}`,
      `โครงการ "Creative Solution & Impact Sandbox" ขับเคลื่อนพลังชุมชนคุณธรรมแก้ปัญหา${mainSubject}`,
      `โครงการ "NextGen Booster & Moral Lab" พลังคนรุ่นใหม่รวมใจแก้ปัญหา${mainSubject}`,
      `โครงการ "Civic Shield & Community Action" กติกาชุมชนสมานฉันท์ร่วมฟื้นฟู${mainSubject}`,
      `โครงการ "Green & Sustainable Moral Network" เครือข่ายจิตอาสายกระดับพฤติกรรมสู่ความยั่งยืน`
    ];
  }

  // 15. กรณีผู้ใช้คลิกให้ AI ช่วยคิดโดยไม่ใส่ Prompt (Fallback ตามมิติคุณธรรม) (ห้ามก๊อปปี้ข้อความมาใส่ในเครื่องหมายคำพูดเด็ดขาด!)
  // ให้คิดชื่อโครงการใหม่ที่ Creative, น่าสนใจ, ติดหู และสื่อความหมายตามมิติคุณธรรม
  const virtueSpecificCreativeTitles: Record<string, string[]> = {
    'วินัย': [
      `โครงการ "Smart Moral Nudge" ปลุกวินัยสร้างสรรค์ สู่พลังการเปลี่ยนแปลงเชิงบวก`,
      `โครงการ "Safe & Sound Community" วินัยร่วมใจ ชุมชนปลอดภัยน่าอยู่`,
      `โครงการ "วินัยสร้างสุข ปลุกพลังพลเมือง" นวัตกรรมสะกิดพฤติกรรมเพื่อความปลอดภัยยั่งยืน`,
      `โครงการ "NextGen Discipline" พลังคนรุ่นใหม่ สร้างวินัยวิถีคุณธรรม`
    ],
    'สุจริต': [
      `โครงการ "Pure Heart, Clear Mind" ปลูกฝังความซื่อตรง สังคมโปร่งใสไร้ทุจริต`,
      `โครงการ "แสงสว่างแห่งความสุจริต" ประชาชนตาสับปะรด ร่วมสร้างเมืองคุณธรรม`,
      `โครงการ "Integrity First" นวัตกรรมธรรมาภิบาลและการมีส่วนร่วมของชุมชน`,
      `โครงการ "คนดีศรีแผ่นดิน" เชิดชูเกียรติและสร้างเครือข่ายความสุจริตยั่งยืน`
    ],
    'จิตอาสา': [
      `โครงการ "Heart to Hand" รวมพลังจิตอาสา เสียสละเพื่อส่วนรวมและชุมชน`,
      `โครงการ "ปันสุขสร้างรอยยิ้ม" สะพานบุญแห่งความเอื้ออาทรเพื่อสังคมน่าอยู่`,
      `โครงการ "Hero ชุมชน คนจิตอาสา" เครือข่ายอาสาสมัครพัฒนาท้องถิ่นยั่งยืน`,
      `โครงการ "พลังจิตอาสา พัฒนาบ้านเกิด" รวมใจฟื้นฟูและเกื้อกูลสังคม`
    ],
    'กตัญญู': [
      `โครงการ "สายใยรักกตัญญู" พลังสองวัยผสานใจ เชื่อมโยงครอบครัวอบอุ่น`,
      `โครงการ "กตัญญูกตเวทิตา สานคุณค่าสู่ลูกหลาน" ภูมิปัญญาผู้สูงวัยสู่สังคมเข้มแข็ง`,
      `โครงการ "อุ่นไอรัก ตอบแทนคุณแผ่นดิน" นวัตกรรมความกตัญญูเกื้อกูลชุมชน`,
      `โครงการ "สองวัยเกื้อกูล หนุนนำความสุข" สร้างสายใยรักและความเอื้ออาทร`
    ],
    'พอเพียง': [
      `โครงการ "Sufficiency Living" นวัตกรรมวิถีพอเพียง เสริมภูมิคุ้มกันชีวิตมั่นคง`,
      `โครงการ "Green & Sustainable Community" สร้างสุขแท้ด้วยวิถีพอประมาณ`,
      `โครงการ "ก้าวพอดี มีภูมิคุ้มกัน" ขับเคลื่อนเศรษฐกิจหมุนเวียนและวิถีพอเพียง`,
      `โครงการ "ต้นกล้าพอเพียง เคียงคู่ชุมชน" ปลูกวินัยสร้างความมั่นคงในชีวิต`
    ]
  };

    const rawResult = virtueSpecificCreativeTitles[v] || virtueSpecificCreativeTitles['พอเพียง'];
  return rawResult.map(stripProvinceFromProjectTitle);
}

export function generateSingleCreativeProjectTitle(
  province: PilotProvinceName | string = 'อยุธยา',
  virtue?: string,
  userPromptOrKeyword?: string,
  challengeTopic?: string,
  seedIndex: number = 0
): string {
  const effectiveProv = detectProvinceFromText([userPromptOrKeyword, challengeTopic], province || 'อยุธยา');
  const suggestions = suggestCreativeProjectTitles(effectiveProv, virtue, userPromptOrKeyword, challengeTopic);
  const idx = Math.abs(seedIndex) % suggestions.length;
  return stripProvinceFromProjectTitle(suggestions[idx] || '');
}

// =================================================================
// BEHAVIOR MODIFICATION STRATEGY GENERATORS (วิธีการดำเนินงาน & การปรับเปลี่ยนพฤติกรรม)
// ให้สอดคล้องกับ Prompt ส่วนที่ 1 และชื่อโครงการอย่างแนบแน่น
// =================================================================
export interface BehaviorStrategyInput {
  projectName?: string;
  virtue?: string;
  province?: PilotProvinceName | string;
  targetAudience?: string;
  targetArea?: string;
  challengeTopic?: string;
  userPromptOrKeyword?: string;
  seedIndex?: number;
}

export function generateBehaviorModificationStrategy(params: BehaviorStrategyInput): string {
  const {
    projectName = '',
    virtue = 'พอเพียง',
    province = 'อยุธยา',
    targetAudience = '',
    targetArea = '',
    challengeTopic = '',
    userPromptOrKeyword = '',
    seedIndex = 0
  } = params;

  let v = 'พอเพียง';
  if (virtue && virtue.includes('วินัย')) v = 'วินัย';
  else if (virtue && virtue.includes('สุจริต')) v = 'สุจริต';
  else if (virtue && virtue.includes('จิตอาสา')) v = 'จิตอาสา';
  else if (virtue && virtue.includes('กตัญญู')) v = 'กตัญญู';

  const cleanProj = projectName ? `ในกรอบ "${projectName}"` : `ในโครงการคุณธรรม`;
  const audience = targetAudience ? `กลุ่มเป้าหมาย (${targetAudience})` : 'กลุ่มเป้าหมายและประชาชนในพื้นที่';
  const area = targetArea ? (targetArea.startsWith('ณ ') ? targetArea.slice(2).trim() : targetArea) : `พื้นที่`;

  const userText = (userPromptOrKeyword || '').trim().toLowerCase();
  const projText = (projectName || '').trim().toLowerCase();
  const chalText = (challengeTopic || '').trim().toLowerCase();

  // กำหนดข้อความหลักเพื่อเลือกเทมเพลต: ให้ความสำคัญสูงสุดกับคำสั่ง/คีย์เวิร์ดของผู้ใช้ และโจทย์ความท้าทาย
  const topicText = `${userText} ${projText} ${chalText}`.trim();

  const rawText = topicText;
  const isSecondVariant = (Math.abs(seedIndex) % 2) === 1;

  // หัวข้อ: การบุกรุกแผ้วถางป่าต้นน้ำบนเทือกเขาตะนาวศรี / สวนทุเรียน / อนุรักษ์ป่าไม้และวนเกษตรคุณธรรม
  if (
    topicText.includes('แผ้วถาง') ||
    topicText.includes('บุกรุก') ||
    topicText.includes('ป่าต้นน้ำ') ||
    topicText.includes('ตะนาวศรี') ||
    topicText.includes('ทุเรียน') ||
    topicText.includes('ตัดไม้') ||
    (topicText.includes('ป่า') && (topicText.includes('รุก') || topicText.includes('ขยาย') || topicText.includes('อนุรักษ์') || topicText.includes('วนเกษตร')))
  ) {
    if (!isSecondVariant) {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "เครือข่ายพิทักษ์ป่าต้นน้ำเทือกเขาตะนาวศรีและวนเกษตรทุเรียนคุณธรรม" บูรณาการกรมป่าไม้ อุทยานแห่งชาติ อปท. สมาคมชาวสวนทุเรียน และปราชญ์ชาวบ้าน ณ ${area} ${cleanProj}
- ออกแบบ "ธรรมนูญแนวเขตป่าต้นน้ำและระบบปักหมุดดิจิทัล (Digital Boundary & Moral Landmark)" จัดทำแนวกันชนสีเขียว (Buffer Zone) ที่ชุมชนร่วมรับรอง พร้อมติดตั้งหมุดแนวเขตอัจฉริยะและเสาหลักคุณธรรมห้ามแผ้วถางขยายพื้นที่ล้ำแนวป่าต้นน้ำ 100%
- ส่งเสริมโมเดล "วนเกษตรทุเรียนรักษ์ป่า (Shade-Grown Durian Agroforestry)" สนับสนุนให้ปลูกไม้ป่ายืนต้นร่วมในแปลงทุเรียนเดิมเพื่อฟื้นฟูดินและต้นน้ำ และจัดตั้งระบบตรวจรับรอง "ทุเรียนคุณธรรมตะนาวศรี (Zero-Deforestation Durian Standard)" เชื่อมโยงตลาดพรีเมียมสร้างมูลค่าเพิ่มโดยไม่ต้องบุกรุกป่าเพิ่ม
- จัดตั้ง "หน่วยลาดตระเวนร่วมจิตอาสา (Smart Community Patrol)" โดยชาวสวนทุเรียนและคนรุ่นใหม่ ร่วมกับเจ้าหน้าที่พิทักษ์ป่า ใช้โดรนและแอปพลิเคชันเฝ้าระวังจุดเสี่ยงแผ้วถางแบบเรียลไทม์

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: แรงจูงใจทางเศรษฐกิจจากราคาทุเรียนที่สูง ทำให้เกษตรกรแอบแผ้วถางขยายพื้นที่ขึ้นเขาสูง มองผลประโยชน์เฉพาะหน้ามากกว่าวิกฤติน้ำแล้งและดินถล่ม
- กลไกสะกิดพฤติกรรม (Sunlight Effect & Social Proof Nudge): การปักหมุดแนวเขตดิจิทัลเปิดเผยต่อสาธารณะร่วมกับธรรมนูญชุมชน สร้างสายตาทางสังคม (Social Eyes) ทำให้การแอบบุกรุกกลายเป็นพฤติกรรมที่เปิดเผยและถูกตักเตือนทันที
- วงจรนิสัยใหม่ (Value-over-Volume Loop): การเปลี่ยนค่านิยมจากการ "เน้นขยายพื้นที่" มาเป็น "เน้นคุณภาพผลผลิตและราคาพรีเมียมจากทุเรียนวนเกษตรคุณธรรม" สร้างผลตอบแทนที่จับต้องได้โดยไม่ต้องทำลายป่า
- ความรับผิดชอบทางนิเวศน์ร่วมกัน (Eco-Social Accountability): ความตระหนักรู้ว่าป่าต้นน้ำตะนาวศรีคือน้ำหล่อเลี้ยงสวนทุเรียนทั้งหมด หากป่าพังทุเรียนจะยืนต้นตาย สร้างจิตสำนึกพอเพียงและกติกาชุมชนที่ทุกคนร่วมรักษาป่าอย่างยั่งยืน`;
    } else {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "สัญญารักษ์ป่าต้นน้ำตะนาวศรี (Tenasserim Watershed Covenant)" ร่วมมือระหว่าง ${audience} ภาคีผู้นำชุมชน และหน่วยพิทักษ์ป่า ${area} ${cleanProj}
- พัฒนากลไกสะกิดพฤติกรรม "ป้ายแปลงทุเรียนคุณธรรม (Ethical Orchard QR Badge)" รับรองแปลงทุเรียนที่ไม่รุกป่า มีแนวกันชนธรรมชาติ และใช้น้ำอย่างรู้คุณค่า พร้อมระบบตรวจสอบย้อนกลับ (Traceability) ถึงผู้บริโภค
- จัดเวที "ธนาคารกล้าไม้ป่าต้นน้ำ & กองทุนฟื้นฟูเทือกเขาตะนาวศรี" นำรายได้ส่วนหนึ่งจากการจำหน่ายทุเรียนมาสมทบทุนฟื้นฟูป่าต้นน้ำที่เคยถูกแผ้วถางให้กลับมาสมบูรณ์
- จัดตั้งทีมเยาวชนจิตอาสา "Tanaosri Green Ranger" ร่วมบันทึกภาพถ่ายดาวเทียมและสำรวจความอุดมสมบูรณ์ของระบบนิเวศและลำห้วยทุกฤดูกาล

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: เกษตรกรขาดการตระหนักรู้ถึงผลกระทบระยะยาวของความเสื่อมโทรมของป่าต้นน้ำ และต่างคนต่างทำเพื่อความอยู่รอด
- กลไกสะกิดพฤติกรรม (Reputational Incentive & Green Labeling): ตราสัญลักษณ์ทุเรียนคุณธรรมสร้างความภาคภูมิใจและแต้มต่อทางการค้า ดึงดูดให้เกษตรกรเลือกปฏิบัติตามกติกาป่าไม้ด้วยความเต็มใจ
- การเสริมแรงทางสังคม (Peer Monitoring): กลุ่มชาวสวนทุเรียนสร้างระบบเตือนภัยเพื่อนร่วมอาชีพ ไม่ให้ใครทำลายชื่อเสียงของแบรนด์ทุเรียนชุมชน
- การสืบทอดจิตสำนึกรักถิ่นเกิด (Heritage Stewardship): เยาวชนและครอบครัวเกิดความผูกพันและหวงแหนป่าต้นน้ำตะนาวศรีในฐานะมรดกธรรมชาติที่สร้างชีวิตและความมั่นคงของชุมชน`;
    }
  }

  // หัวข้อ: มลพิษกลิ่นเหม็นและน้ำเสียจากฟาร์มสุกร / ฟาร์มปศุสัตว์ / ก๊าซชีวภาพ
  if (
    topicText.includes('สุกร') ||
    topicText.includes('ฟาร์มสุกร') ||
    topicText.includes('ฟาร์มหมู') ||
    topicText.includes('กลิ่นเหม็น') ||
    (topicText.includes('น้ำเสีย') && (topicText.includes('ฟาร์ม') || topicText.includes('ปศุสัตว์') || topicText.includes('ท่าจีน') || topicText.includes('กลิ่น')))
  ) {
    if (!isSecondVariant) {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "สมาพันธ์ฟาร์มสุกรสีเขียวและเครือข่ายพิทักษ์สายน้ำ (Green Pig Farm Alliance)" บูรณาการสำนักงานปศุสัตว์ อปท. ผู้ประกอบการฟาร์มสุกร และผู้แทนชุมชน ณ ${area} ${cleanProj}
- จัดทำ "ธรรมนูญฟาร์มปิดและการจัดการน้ำเสียศูนย์เปอร์เซ็นต์ (Zero-Discharge Charter)" พร้อมส่งเสริมการติดตั้งระบบผลิตก๊าซชีวภาพ (Biogas) และม่านน้ำชีวภาพดูดซับกลิ่นเหม็น (Bio-Filter Curtain) 100%
- ติดตั้งระบบเซนเซอร์ตรวจวัดกลิ่นและคุณภาพน้ำอัจฉริยะ (IoT Odor & Water Quality Sensor) เชื่อมโยงแดชบอร์ดเปิดเผยข้อมูลชุมชน (Citizen Sunlight Dashboard) ให้ชาวบ้านร่วมตรวจสอบแบบเรียลไทม์
- ส่งเสริมการแปรรูปกากตะกอนและมูลสุกรเป็นปุ๋ยอินทรีย์อัดเม็ดคุณภาพสูง เพื่อแจกจ่ายและจำหน่ายแก่เกษตรกรในพื้นที่ สร้างรายได้เสริมจากของเสีย

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ผู้ประกอบการฟาร์มสุกรบางรายแอบปล่อยน้ำเสียลงแหล่งน้ำสาธารณะในช่วงฝนตกหรือกลางคืน และละเลยการปิดคลุมบ่อหมักก๊าซเพราะมองเป็นต้นทุน
- กลไกสะกิดพฤติกรรม (Sunlight Nudge & Transparent Monitoring): การมีเซนเซอร์และแดชบอร์ดสาธารณะทำให้ทุกฟาร์มตระหนักว่าชุมชนกำลังเฝ้ามอง (Social Eyes) ลดแรงจูงใจในการลักลอบปล่อยน้ำเสียอย่างเด็ดขาด
- วงจรนิสัยใหม่ (Waste-to-Wealth Loop): การเห็นมูลค่าทางเศรษฐกิจจากพลังงานก๊าซชีวภาพและปุ๋ยอินทรีย์ เปลี่ยนพฤติกรรมจากการ "บำบัดเพื่อเลี่ยงกฎหมาย" มาเป็น "บำบัดเพื่อสร้างกำไรและความยั่งยืน"
- บรรทัดฐานเพื่อนเตือนเพื่อน (Peer Social Standard): ชมรมผู้เลี้ยงสุกรสร้างกติกาไม่ยอมรับฟาร์มที่สร้างมลพิษ เกิดการควบคุมและช่วยเหลือกันเองในกลุ่มเพื่อรักษาภาพลักษณ์ของอาชีพ`;
    } else {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "เครือข่ายฟาร์มปศุสัตว์คุณธรรม ชุมชนไร้กลิ่นรบกวน" บูรณาการ ${audience} ผู้นำชุมชน และสำนักงานสิ่งแวดล้อมภาค ${area} ${cleanProj}
- ออกแบบกลไก Nudge "ป้ายรับรองฟาร์มสุกรหัวใจสีเขียว (Green Farm Badge)" มอบให้แก่ฟาร์มที่มีระบบบำบัดน้ำเสียมาตรฐานและไม่มีกลิ่นรบกวนชุมชนเกินรัศมี 100 เมตร
- จัดตั้ง "กองทุนพลังงานก๊าซชีวภาพปันสุข" ต่อท่อก๊าซชีวภาพจากฟาร์มสุกรขนาดใหญ่ไปให้ครัวเรือนรอบข้างใช้งานฟรี เพื่อเปลี่ยนข้อขัดแย้งเป็นความร่วมมือที่เกื้อกูลกัน
- จัดทีม "จิตอาสาสายตรวจสิ่งแวดล้อมชุมชน" ร่วมสุ่มตรวจค่าบีโอดี (BOD) ในลำน้ำและร่วมถอดบทเรียนความสุขภาวะร่วมกันทุกไตรมาส

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ความขัดแย้งสะสมระหว่างชาวบ้านกับเจ้าของฟาร์ม ทำให้เกิดการร้องเรียนซ้ำซากแต่ปัญหาไม่ได้รับการแก้ไขถาวร
- กลไกสะกิดพฤติกรรม (Shared Benefit Nudge): การแบ่งปันก๊าซชีวภาพและปุ๋ยฟรีเปลี่ยนความรู้สึกโกรธเคืองของชุมชนให้กลายเป็นความร่วมมือและถ้อยทีถ้อยอาศัย
- การเสริมแรงทางสังคมเชิงบวก (Positive Recognition): การได้รับป้ายเชิดชูเกียรติฟาร์มคุณธรรมสร้างความภาคภูมิใจให้เจ้าของฟาร์มตั้งใจดูแลรักษาระบบบำบัดอย่างสม่ำเสมอ
- วัฒนธรรมความรับผิดชอบร่วมกัน: ผู้ประกอบการตระหนักว่าคุณภาพชีวิตของเพื่อนบ้านคือความยั่งยืนของธุรกิจฟาร์มตนเอง`;
    }
  }

  // หัวข้อ: การบ่มเพาะ Startup / นวัตกรคนรุ่นใหม่ / Social Enterprise / Tech Innovation
  if (
    topicText.includes('startup') ||
    topicText.includes('สตาร์ทอัพ') ||
    topicText.includes('สตาร์ตอัพ') ||
    topicText.includes('บ่มเพาะ') ||
    topicText.includes('incubator') ||
    topicText.includes('incubation') ||
    topicText.includes('ผู้ประกอบการ') ||
    topicText.includes('entrepreneur') ||
    topicText.includes('sandbox') ||
    topicText.includes('pitching') ||
    topicText.includes('นวัตกร') ||
    topicText.includes('social enterprise') ||
    topicText.includes('วิสาหกิจเพื่อสังคม')
  ) {
    if (!isSecondVariant) {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "Moral Startup Sandbox & Incubation Hub" บูรณาการมหาวิทยาลัย หอการค้า สภาอุตสาหกรรม และอุทยานวิทยาศาสตร์ ใน ${area} ${cleanProj} เพื่อเปิดพื้นที่บ่มเพาะผู้ประกอบการและสตาร์ทอัพรุ่นใหม่แบบเข้มข้น 12 สัปดาห์
- นำกระบวนการ "Design Thinking & Moral Business Model Canvas" มาใช้เป็นกรอบการออกแบบผลิตภัณฑ์และบริการ โดยกำหนดให้ทุกทีมต้องมีตัวชี้วัดผลกระทบเชิงบวกต่อสังคม (Social Impact) และหลักความพอประมาณ-ความโปร่งใสเป็นแกนกลาง
- จัดกิจกรรม "Mentor Matching & Field Testing Sprint" นำทีมสตาร์ทอัพลงพื้นที่ทดสอบต้นแบบจริง (MVP) ร่วมกับ ${audience} และจัดเวที Demo Day เชื่อมโยงแหล่งทุนนวัตกรรมและ Angel Investors

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: เยาวชนและผู้ประกอบการรุ่นใหม่มักมุ่งเน้นการเก็งกำไรระยะสั้น ขาดภูมิคุ้มกันความเสี่ยง หรือขาดพี่เลี้ยงในการนำพาธุรกิจสู่ความยั่งยืน
- กลไกสะกิดพฤติกรรม (Structured Milestone & Peer Nudge): การแบ่งกระบวนการบ่มเพาะเป็นภารกิจสัปดาห์ (Weekly Sprints) และการประเมินแบบ Peer Review ช่วยกระตุ้นความรับผิดชอบและวินัยการทำงานอย่างเป็นระบบ
- วงจรนิสัยใหม่ (Habit of User Empathy & Ethical Decision): การฝึกรับฟังปัญหาจริงของชุมชนและทดสอบ MVP ซ้ำๆ ปลูกฝังดีเอ็นเอการเป็นนวัตกรที่มีจิตสาธารณะและซื่อตรงต่อผู้บริโภค
- ระบบนิเวศสตาร์ทอัพคุณธรรม (Sustainable Innovation Ecosystem): ความสำเร็จของสตาร์ทอัพรุ่นพี่สร้างแรงบันดาลใจและบรรทัดฐานใหม่ว่า ธุรกิจที่ประสบความสำเร็จสูงสุดคือธุรกิจที่สร้างคุณค่าคืนสู่สังคม`;
    } else {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- เปิดหลักสูตรบ่มเพาะ "Impact Maker Accelerator" ร่วมกับเครือข่าย Mentors และผู้เชี่ยวชาญด้าน Tech & Social Innovation ณ ${area} ${cleanProj}
- ออกแบบกลไก "Moral Seed Grant & Pitching Sandbox" สนับสนุนเงินทุนตั้งต้นแบบให้เปล่าสำหรับทีมสตาร์ทอัพที่ผ่านเกณฑ์การแก้ปัญหาชุมชนอย่างมีคุณธรรม
- พัฒนาแพลตฟอร์มจับคู่นวัตกรกับปัญหาในพื้นที่ (Problem-Solution Matching Platform) ให้ ${audience} ได้ร่วมคิดค้นนวัตกรรมร่วมกับผู้นำท้องถิ่น

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ขาดพื้นที่ทดลองลงมือทำจริง และคนรุ่นใหม่จำนวนมากย้ายถิ่นฐานออกจากจังหวัดเพื่อหางานทำในเมืองหลวง
- กลไกสะกิดพฤติกรรม (Gamification & Public Commitment): การแข่งขันแบบ Hackathon และการประกาศพันธสัญญาทางธุรกิจต่อหน้าสาธารณะ ช่วยขับเคลื่อนพลังสร้างสรรค์และความรับผิดชอบ
- การตระหนักรู้คุณค่าแห่งการพัฒนาบ้านเกิด: นวัตกรเกิดความผูกพันและเห็นโอกาสในการสร้างธุรกิจที่ตอบโจทย์ท้องถิ่นของตนเอง
- ความยั่งยืนของธุรกิจคุณธรรม: ธุรกิจเติบโตบนรากฐานของความพอเพียง มีภูมิคุ้มกัน และสร้างงานสร้างอาชีพให้คนในชุมชนอย่างแท้จริง`;
    }
  }

  // หัวข้อ: การดูแลผู้สูงอายุติดเตียงและกลุ่มเปราะบาง (Elderly & Bedridden Care)
  if (topicText.includes('ติดเตียง') || topicText.includes('ผู้สูงอายุ') || topicText.includes('สูงวัย') || topicText.includes('คนแก่') || topicText.includes('ผู้ป่วยติดเตียง') || topicText.includes('พึ่งพิง')) {
    if (!isSecondVariant) {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "เครือข่ายจิตอาสาเพื่อนแท้ เยี่ยมบ้านและบริบาลผู้สูงอายุติดเตียง (Caregiver & Volunteer Network)" ณ ${area} ${cleanProj} โดยบูรณาการ อสม. พยาบาล รพ.สต. และเยาวชนจิตอาสา จัดทีมลงพื้นที่เยี่ยมบ้านสัปดาห์ละ 2 ครั้งเพื่อตรวจเช็กสุขภาพกายและสุขภาพจิต
- นำระบบ "Care Nudge & Tele-Support" ผ่านแอปพลิเคชัน/LINE แจ้งเตือนรอบกินยา แบบประเมินแผลกดทับ และเปิดช่องทางให้ลูกหลานที่ไปทำงานต่างถิ่นติดตามรายงานสุขภาพและส่งข้อความกำลังใจให้ผู้สูงอายุได้แบบเรียลไทม์
- จัดตั้ง "คลังอุปกรณ์ปันสุขและกองทุนผ้าอ้อมผู้ใหญ่ชุมชน" สนับสนุนเตียงผู้ป่วย รถเข็น และเวชภัณฑ์จำเป็น เพื่อลดภาระค่าใช้จ่ายของครอบครัวผู้ดูแล

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ผู้สูงอายุติดเตียงเกิดภาวะซึมเศร้าและรู้สึกว่าตนเองเป็นภาระ ขณะที่ครอบครัวผู้ดูแลเกิดความเหนื่อยล้าเรื้อรัง (Caregiver Burnout) และชุมชนรอบข้างขาดการเหลียวแล
- กลไกสะกิดพฤติกรรม (Social Connection & Empathy Nudge): การเยี่ยมบ้านสม่ำเสมอและบันทึกความสุขประจำวันช่วยกระตุ้นความรู้สึกมีคุณค่าในตนเอง (Self-Worth) ของผู้สูงวัย
- วงจรนิสัยใหม่ (Intergenerational Habit Loop): เยาวชนจิตอาสาและคนในชุมชนเกิดความคุ้นเคยในการแวะเวียนมาพูดคุยและดูแลผู้สูงอายุใกล้บ้านจนกลายเป็นวิถีชีวิตแห่งความกตัญญูและเกื้อกูล
- สังคมแห่งความเอื้ออาทร (Compassionate Community): เกิดสายใยผูกพันข้ามวัยในชุมชน ลดความโดดเดี่ยว และยกระดับคุณภาพชีวิตของผู้ป่วยติดเตียงอย่างยั่งยืน`;
    } else {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "คลินิกกายภาพบำบัดและฟื้นฟูสุขภาวะผู้สูงวัยเคลื่อนที่" ณ ${area} ${cleanProj} นำโดย ${audience} และทีมแพทย์แผนไทย/กายภาพ รพ.สต.
- ออกแบบกิจกรรม "สามวัยผสานใจ หลานรักดูแลปู่ย่า" ให้เด็กและเยาวชนร่วมเรียนรู้ทักษะการดูแลและบันทึกไดอารี่ความกตัญญูประจำสัปดาห์
- ติดตั้งระบบปุ่มขอความช่วยเหลือฉุกเฉิน (SOS Smart Button) ภายในบ้านของผู้สูงอายุที่อยู่ลำพัง เชื่อมต่อตรงถึงศูนย์กู้ชีพ อปท. และ อสม. ประจำคุ้มบ้าน

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ขาดผู้ดูแลอย่างใกล้ชิด และคนในชุมชนไม่ทราบถึงความต้องการช่วยเหลือของผู้ป่วยติดเตียง
- กลไกสะกิดพฤติกรรม (Active Empathy & Family Bonding): กิจกรรมร่วมกันระหว่างวัยสร้างความผูกพันและลดช่องว่างระหว่างคนรุ่นเก่ากับคนรุ่นใหม่
- วงจรนิสัยใหม่ (Proactive Care Habit): ลูกหลานและเพื่อนบ้านฝึกฝนการสังเกตสัญญาณเตือนด้านสุขภาพและแวะเวียนมาช่วยเหลือเป็นประจำ
- วัฒนธรรมความกตัญญูที่หยั่งรากลึก (Moral Legacy): การเคารพและเกื้อกูลผู้สูงวัยกลายเป็นธรรมนูญทางใจที่ทุกคนในสังคมร่วมสืบสาน`;
    }
  }

  // หัวข้อ: แก้ปัญหาเด็กติดเว็บพนันออนไลน์ / การพนันไซเบอร์
  if (topicText.includes('พนัน') || topicText.includes('เว็บพนัน') || topicText.includes('บาคาร่า') || topicText.includes('คาสิโน') || topicText.includes('ติดเกม')) {
    return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "พื้นที่ปลอดภัยสร้างสรรค์ (NextGen Creative Zone & Moral Club)" ในสถานศึกษาและชุมชน ${area} ${cleanProj} เพื่อให้ ${audience} มีกิจกรรมทดแทนเชิงบวก เช่น e-Sports คุณธรรม ดนตรี ศิลปะ และกีฬา
- พัฒนานวัตกรรมแอปพลิเคชัน/กลไกเพื่อนเตือนเพื่อน "Mind Shield Nudge" แจ้งเตือนสติเมื่อเข้าใกล้เว็บไซต์หรือแอปเสี่ยง พร้อมระบบสะสมแต้มความดีเปลี่ยนเวลาหน้าจอเป็นคะแนนสวัสดิการ
- จัดตั้งเครือข่าย "สภาเยาวชนตาสับปะรด" ร่วมกับครูแนะแนวและผู้ปกครอง เฝ้าระวังและให้คำปรึกษาเชิงลึกแบบ Peer-to-Peer แก่กลุ่มเสี่ยง

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: เยาวชนเข้าสู่วงจรพนันเพราะความเหงา ความอยากรู้ และการถูกชักจูงจากกลุ่มเพื่อนในโลกออนไลน์
- กลไกสะกิดพฤติกรรม (Alternative Substitution & Friction): การมีพื้นที่กิจกรรมทดแทนที่น่าสนใจและขั้นตอนเตือนสติช่วยตัดตอนความอยากเล่นชั่ววูบ (Impulsive Gambling Urge)
- วงจรนิสัยใหม่ (Constructive Habit Loop): การได้รับเสียงชื่นชมและการยอมรับจากเพื่อนในกิจกรรมสร้างสรรค์ สร้างสารความสุขทดแทนการเสพติดการพนัน
- ภูมิคุ้มกันคุณธรรมเข้มแข็ง (Moral Resilience): เยาวชนตระหนักรู้ถึงคุณค่าในตนเอง สามารถปฏิเสธสิ่งยั่วยุ และหันมาใช้เวลาอย่างมีวินัยและพอประมาณ`;
  }

  // หัวข้อ: แก้ปัญหาน้ำท่วมซ้ำซาก / จัดการลุ่มน้ำและระบบระบายน้ำ
  if (topicText.includes('น้ำท่วม') || topicText.includes('อุทกภัย') || topicText.includes('ระบายน้ำ') || topicText.includes('ท่วมซ้ำซาก') || topicText.includes('คูคลอง') || topicText.includes('แก้มลิง')) {
    return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "เครือข่ายจิตอาสาพิทักษ์สายน้ำ (Water Resilience Team)" บูรณาการ ${audience} ในพื้นที่ ${area} ${cleanProj} ร่วมกันสำรวจ ลอกคูคลอง และกำจัดผักตบชวาเปิดทางน้ำไหล
- นำระบบ "ธงเตือนภัยลุ่มน้ำอัจฉริยะ (Smart Water Radar)" และกติกาประชาคมมาใช้ในการบริหารจัดการน้ำและเตือนภัยล่วงหน้า 72 ชั่วโมง
- จัดตั้ง "ธนาคารน้ำชุมชนและพื้นที่รับน้ำแก้มลิงตามวิถีพอเพียง" เปลี่ยนวิกฤตน้ำหลากเป็นโอกาสกักเก็บน้ำใช้ในฤดูแล้ง

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ชาวบ้านต่างคนต่างอยู่ รอน้ำมาท่วมแล้วค่อยแก้ปัญหาเฉพาะหน้า และมีการทิ้งขยะกีดขวางทางระบายน้ำ
- กลไกสะกิดพฤติกรรม (Social Norm & Preparedness Nudge): การมีระบบเตือนภัยและการจัดเวรเฝ้าระวังสร้างความตื่นรู้ล่วงหน้าโดยไม่ต้องรอให้เกิดวิกฤต
- วงจรนิสัยใหม่ (Proactive Community Action): การร่วมมือกันทำความสะอาดและดูแลทางน้ำเป็นประจำกลายเป็นวิถีปฏิบัติปกติของชุมชนริมน้ำ
- ความสามัคคีและจิตสาธารณะ (Collective Efficacy): ชุมชนเกิดความพร้อมรับมือภัยพิบัติอย่างพึ่งตนเอง ลดความสูญเสีย และอยู่ร่วมกับสายน้ำได้อย่างปลอดภัย`;
  }

  // 1. หัวข้อ: ลดขยะ & วินัยการออม (Waste & Smart Savings)
  if ((topicText.includes('ขยะ') && topicText.includes('ออม')) || topicText.includes('ลดขยะและสร้างวินัยการออม') || (topicText.includes('zero') && topicText.includes('ออม'))) {
    if (!isSecondVariant) {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "ธนาคารขยะคุณธรรมและกองทุนสัจจะออมทรัพย์ (Zero-Waste & Smart Saving Bank)" ณ ${area} ${cleanProj} โดยเชื่อมโยง ${audience} เข้ากับแอปพลิเคชันสะสมแต้มความดี Green Wallet
- นำหลักการเศรษฐกิจหมุนเวียน (Circular Economy) มาเปลี่ยนขยะรีไซเคิลและของเหลือใช้เป็นยอดเงินออมสะสมในบัญชีทันที (Instant Conversion) โดยร่วมกับสถานประกอบการและเทศบาลจัดรอบรับขยะประจำสัปดาห์
- จัดแคมเปญแข่งขัน "30 วัน ท้าลดขยะสะสมเงินออม" มอบรางวัลเชิดชูเกียรติและโบนัสสมทบเงินออมแก่ครัวเรือนและแผนกงานที่มีวินัยการคัดแยกขยะสูงสุด

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: พนักงานและชาวบ้านเคยชินกับการทิ้งขยะรวมโดยไม่คัดแยก และมีพฤติกรรมใช้จ่ายฟุ่มเฟือยขาดวินัยการออมเงินสำรอง
- กลไกสะกิดพฤติกรรม (Immediate Incentive & Visual Feedback): การเห็นตัวเลขเงินออมเพิ่มขึ้นทันทีที่นำขยะมาส่ง ช่วยเปลี่ยนขยะที่เคยมองว่าไร้ค่าให้กลายเป็นทรัพย์สินที่จับต้องได้ (Asset Framing)
- วงจรนิสัยใหม่ (Habit Loop: Cue -> Routine -> Reward): จุดรับขยะที่สะดวกและระบบบันทึกเงินออมอัตโนมัติ สร้างความคุ้นชินในการแยกขยะก่อนทิ้งทุกวันจนกลายเป็นกิจวัตรปกติ
- การยกระดับสู่บรรทัดฐานสังคม (Social Proof & Moral Identity): เมื่อคนส่วนใหญ่ร่วมคัดแยกจนมีเงินออมสำรองและปลดหนี้ได้จริง เกิดแรงผลักดันเชิงบวกทางสังคม ทำให้การลดขยะและการออมกลายเป็นอัตลักษณ์แห่งความภาคภูมิใจ`;
    } else {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- ติดตั้ง "ตู้ขยะรีไซเคิลอัจฉริยะ (Smart Reverse Vending)" ในโรงงานและจุดศูนย์กลางชุมชน ${area} ให้ ${audience} หยอดขวดพลาสติก/กระป๋องเพื่อรับแต้มเงินออมดิจิทัลเข้าบัญชีกองทุนสวัสดิการ
- จัดตั้ง "คลินิกคู่หูขยะสร้างทุน" มีพี่เลี้ยงการเงินและแกนนำสิ่งแวดล้อมให้คำปรึกษาการลดต้นทุนชีวิตและการแปรรูปขยะอินทรีย์เป็นปุ๋ยชีวภาพ
- กำหนดมาตรการกติกาประชาคม "โรงงานสะอาด ชุมชนไร้ขยะ" มีการประกาศยอดขยะที่ลดได้และยอดเงินออมรวมผ่านบอร์ดแสดงผลเรียลไทม์

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ขาดแรงจูงใจในการคัดแยกเพราะมองว่าเสียเวลา และไม่เห็นความเชื่อมโยงระหว่างการรักษาสิ่งแวดล้อมกับความมั่นคงทางการเงิน
- กลไกสะกิดพฤติกรรม (Gamification & Choice Architecture): การสะสมแต้มผ่านตู้หยอดขยะสร้างความสนุกและลดขั้นตอนยุ่งยากลงทั้งหมด (Frictionless Action)
- วงจรนิสัยใหม่ (Routine Reinforcement): การได้รับสิทธิประโยชน์และสวัสดิการจากกองทุนเงินออมขยะ กระตุ้นให้เกิดความต่อเนื่องในการคัดแยกขยะจากที่บ้านสู่ที่ทำงาน
- พฤติกรรมที่ยั่งยืน (Internalized Sufficiency): สมาชิกปรับเปลี่ยนวิธีคิดสู่ความพอประมาณ รู้จักคุณค่าของสิ่งของ และมีวินัยทางการเงินที่หยั่งรากลึก`;
    }
  }

  // 2. หัวข้อ: วัคซีนไซเบอร์ & ป้องกันกลโกง/สกัดกั้นบัญชีม้า (Cyber Shield & Anti-Mule)
  if (topicText.includes('ไซเบอร์') || topicText.includes('บัญชีม้า') || topicText.includes('กลโกง') || topicText.includes('มิจฉาชีพ') || topicText.includes('หลอกลวง') || topicText.includes('คอลเซ็นเตอร์')) {
    if (!isSecondVariant) {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- พัฒนาและติดตั้งแอปพลิเคชัน/Line Official "Cyber Shield & วัคซีนไซเบอร์" ให้ ${audience} สามารถตรวจสอบเลขบัญชีม้า ลิงก์หลอกลวง และเบอร์โทรแปลกปลอมได้แบบเรียลไทม์ก่อนทำธุรกรรม ${cleanProj} ${area}
- จัดตั้งเครือข่าย "เยาวชนตาสับปะรด ไซเบอร์การ์ด (Young Cyber Guardians)" ประจำสถานศึกษาและชุมชน อบรมจำลองสถานการณ์ภัยกลโกง (Phishing Simulation Lab) และจัดบูธให้คำปรึกษาดิจิทัลแก่คนในครอบครัว
- สร้างกลไกเตือนภัยด่วน "ไซเบอร์เรดาร์ชุมชน" ส่งแจ้งเตือนกลโกงใหม่ๆ ผ่านเสียงตามสาย หอกระจายข่าว และไลน์กลุ่มหมู่บ้านทุกสัปดาห์

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: เหยื่อมักตกหลุมพรางเพราะความตื่นตระหนก ความโลภ หรือความประมาท โดยเฉพาะกลุ่มวัยรุ่นที่ถูกล่อลวงให้เปิดบัญชีม้าแลกค่าจ้างเล็กน้อย
- กลไกสะกิดพฤติกรรม (Friction & Stop-Rule Nudge): การสร้างขั้นตอน "หยุด-คิด-เช็กก่อนโอน 30 วินาที" ช่วยตัดวงจรความตื่นตระหนกทางอารมณ์ชั่ววูบ (Affect Heuristic)
- วงจรนิสัยใหม่ (Habit of Verification): การกดเช็กบัญชีเสี่ยงผ่านแอปพลิเคชันก่อนโอนเงินทุกครั้ง กลายเป็นปฏิกิริยาอัตโนมัติเพื่อความปลอดภัยในชีวิตประจำวัน
- ภูมิคุ้มกันทางศีลธรรม (Moral Shield & Social Rejection): เยาวชนตระหนักถึงผลกระทบทางกฎหมายและตราบาปของการเปิดบัญชีม้า เกิดการปฏิเสธร่วมกันและร่วมเป็นแนวร่วมสกัดกั้นภัยไซเบอร์`;
    } else {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "ศูนย์ปฏิบัติการเยาวชนสกัดกั้นบัญชีม้าและกลโกงออนไลน์" ณ ${area} บูรณาการสถานีตำรวจภูธร สถาบันการศึกษา และผู้แทนนักเรียน
- ออกแบบกิจกรรม "Family Cyber Vaccine" ให้นักเรียนนำแบบทดสอบความปลอดภัยดิจิทัลกลับไปทำร่วมกับพ่อแม่และผู้สูงอายุในบ้าน เพื่อสแกนหาจุดเสี่ยงทางการเงิน
- ติดตั้งป้ายและสติกเกอร์สะกิดใจ "คิดให้ดี ก่อนตกเป็นม้า" ณ จุดตู้ ATM และร้านสะดวกซื้อที่มีการรับโอนเงิน

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: มองว่าการรับจ้างเปิดบัญชีไม่ผิดร้ายแรง และคิดว่าตนเองรู้ทันกลโกงจนเกิดความชะล่าใจ
- กลไกสะกิดพฤติกรรม (Salience & Risk Perception): ป้ายเตือน ณ จุดทำธุรกรรมและข้อมูลกรณีศึกษาที่เกิดขึ้นจริง กระตุ้นให้ตระหนักถึงบทลงโทษและภัยใกล้ตัวทันที
- วงจรนิสัยใหม่ (Peer Protection Habit): เยาวชนสร้างนิสัยคอยถามไถ่และตรวจสอบการโอนเงินของคนในบ้าน ทำให้เกิดการปกป้องซึ่งกันและกัน
- วัฒนธรรมความสุจริต (Integrity Standard): การมีบัญชีที่สะอาดและความซื่อตรงกลายเป็นค่านิยมหลักของสถานศึกษาที่ทุกคนร่วมยกย่อง`;
    }
  }

  // 3. หัวข้อ: ทางม้าลาย Smart Crosswalk & วินัยจราจรเคารพสิทธิคนเดินเท้า
  if (topicText.includes('ทางม้าลาย') || topicText.includes('crosswalk') || topicText.includes('ข้ามถนน') || topicText.includes('คนเดิน')) {
    if (!isSecondVariant) {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- ติดตั้งนวัตกรรม "Smart Crosswalk & Pedestrian Safe Zone" ณ จุดเสี่ยงข้ามถนนหน้าสถานศึกษา/ชุมชน ${area} ${cleanProj} โดยติดตั้งระบบเซนเซอร์ตรวจจับคนข้ามถนน ป้ายไฟสัญญาณ LED กะพริบเตือนล่วงหน้า 50 เมตร และเส้นชะลอความเร็ว Optical Illusion Nudge
- เชื่อมต่อระบบกล้อง AI ตรวจจับพฤติกรรมการชะลอและหยุดรถให้คนข้ามทางม้าลาย พร้อมส่งคะแนนความดีเข้าสู่ระบบ "Good Driver Token" บันทึกเป็นแต้มความดีและสิทธิประโยชน์ส่วนลดภาษี/ประกันภัย
- จัดตั้ง "ทีมอาสาจราจรรอยยิ้ม" ร่วมกับ ${audience} โบกธงสัญลักษณ์และส่งมอบคำขอบคุณผ่านป้ายไฟ LED สว่างชัดเจนให้แก่ผู้ขับขี่ที่หยุดรถ

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ผู้ขับขี่มีความเคยชินในการเร่งความเร็วผ่านทางม้าลาย และมองว่าคนเดินเท้าต้องเป็นฝ่ายรอหลบรถเอง
- กลไกสะกิดพฤติกรรม (Salience & Visual Cue): แสงไฟกระพริบเตือนล่วงหน้าและเส้นนำสายตาช่วยดึงสมาธิ (Attention Nudge) บังคับให้ผู้ขับขี่ชะลอความเร็วล่วงหน้าโดยสัญชาตญาณ
- วงจรนิสัยใหม่ (Yielding Habit Loop): การเห็นคนยืนรอบนทางม้าลายกลายเป็นสิ่งเร้า (Cue) ให้เท้าแตะเบรกชะลอรถโดยอัตโนมัติ และได้รับคำขอบคุณ/คะแนนความดีเป็นรางวัล (Reward)
- บรรทัดฐานวัฒนธรรมสัญจรใหม่ (Social Norm of Courtesy): เมื่อรถคันหน้าหยุดให้คนข้าม รถคันอื่นจะหยุดตาม เกิดการยอมรับร่วมกันว่าการหยุดรถให้คนข้ามคือมารยาทและวินัยขั้นพื้นฐาน`;
    } else {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- ออกแบบ "ทางม้าลาย 3 มิติ (3D Optical Crosswalk)" และปรับสถาปัตยกรรมทางเลือก (Choice Architecture) ให้คนเดินเท้ามีจุดพักคอยที่ปลอดภัยและมองเห็นชัดเจน ${area}
- จัดกิจกรรมรณรงค์เชิงสัญลักษณ์ "ข้ามปลอดภัย สบตา ยิ้มให้ และยกมือขอบคุณ" ปลูกฝังมารยาทการใช้ทางข้ามแก่ ${audience} และเยาวชน
- ประสานเจ้าหน้าที่ตำรวจจราจรและสารวัตรนักเรียนร่วมตั้งจุดสังเกตการณ์พฤติกรรมและมอบเข็มกลัด "ผู้ขับขี่มีวินัย หัวใจคุณธรรม" ประจำเดือน

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ขาดการตระหนักรู้สิทธิของคนเดินเท้า และความเร่งรีบทำให้ละเลยการหยุดรถหน้าทางข้าม
- กลไกสะกิดพฤติกรรม (Default Bias towards Safety): ภาพลวงตา 3 มิติกระตุ้นความระมัดระวังทางสายตา ทำให้คนขับรถผ่อนคันเร่งเป็นตัวเลือกเริ่มต้น
- การมีปฏิสัมพันธ์เชิงบวก (Human Connection): การสบตาและรอยยิ้มขอบคุณระหว่างคนเดินข้ามกับคนขับรถ เปลี่ยนความตึงเครียดบนท้องถนนให้กลายเป็นความเอื้ออาทร
- วินัยที่กลายเป็นนิสัยถาวร: การฝึกหยุดรถซ้ำๆ ในจุดเดิมสร้างความคุ้นเคยจนกลายเป็นนิสัยขับขี่ปลอดภัยถาวรในทุกเส้นทาง`;
    }
  }

  // 4. หัวข้อ: หมวกนิรภัย 100% & ความปลอดภัยคนทำงานในสถานประกอบการ/นิคม
  if (topicText.includes('หมวก') || topicText.includes('หมวกกันน็อก') || (topicText.includes('กะ') && topicText.includes('โรงงาน'))) {
    return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- ติดตั้ง "Safety Gate AI" สแกนตรวจจับการสวมหมวกนิรภัย 100% ณ ประตูทางเข้า-ออกสถานประกอบการและโรงเรียน ${area} ${cleanProj} โดยเปิดช่องทางด่วนพิเศษ "Green Fast Lane" สำหรับผู้ที่สวมหมวกถูกต้อง
- จัดตั้งกลไก "บัดดี้ความปลอดภัย (Safety Buddy System)" ให้ ${audience} จับคู่ตรวจสอบการสวมหมวกนิรภัยและล็อคสายรัดคางก่อนสตาร์ทรถเดินทางกลับบ้าน
- จัดตั้งจุด "ธนาคารหมวกนิรภัยปันสุข" บริการยืม-คืนหมวกมาตรฐาน มอก. ฟรี เพื่อขจัดข้ออ้างเรื่องไม่มีอุปกรณ์ความปลอดภัย

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: พนักงานมักละเลยไม่สวมหมวกนิรภัยเมื่อขับขี่ระยะทางใกล้ๆ หรือขับในชุมชนหอพักเพราะคิดว่าไม่อันตราย
- กลไกสะกิดพฤติกรรม (Mandatory Default & Fast-Track Nudge): การได้เข้าช่องทางด่วนเมื่อสวมหมวกนิรภัยสร้างความสะดวกสบายที่เหนือกว่าการไม่สวม
- วงจรนิสัยใหม่ (Automatic Pre-flight Habit): การมีเพื่อนร่วมงานคอยทักเตือนสร้างการตระหนักรู้ซ้ำๆ จนการหยิบหมวกนิรภัยมาสวมกลายเป็นความเคยชินเหมือนการสวมรองเท้า
- บรรทัดฐานความปลอดภัยรวมหมู่ (Collective Safety Culture): การสวมหมวกนิรภัยเปลี่ยนจากการทำเพื่อหลบเลี่ยงการถูกตรวจ มาเป็นความรับผิดชอบต่อตนเองและครอบครัว`;
  }

  // 5. หัวข้อ: จิตอาสาดูแลผู้สูงอายุติดเตียง & บูรณาการ รพ.สต. (Intergenerational Care)
  if ((topicText.includes('จิตอาสา') || topicText.includes('อาสา')) && (topicText.includes('สูงวัย') || topicText.includes('ผู้สูงอายุ') || topicText.includes('ติดเตียง') || topicText.includes('รพ.สต.'))) {
    if (!isSecondVariant) {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "เครือข่ายจิตอาสาสองวัย ดูแลผู้สูงวัยติดเตียง" บูรณาการความร่วมมือระหว่าง รพ.สต., อสม., ชมรมผู้สูงอายุ และกลุ่มเยาวชนจิตอาสา ${area} ${cleanProj}
- พัฒนาแอปพลิเคชัน "Care Volunteer Mobile" จัดตารางลงพื้นที่เยี่ยมบ้าน บันทึกสัญญาณชีพ ข้อมูลโภชนาการ และความต้องการเร่งด่วนของผู้ป่วยติดเตียงแบบเรียลไทม์
- จัดอบรมทักษะการบริบาลเบื้องต้นและศิลปะการเยียวยาจิตใจ (Compassionate Caregiving) พร้อมส่งมอบชุดอุปกรณ์เยี่ยมบ้าน "กล่องปันรักปันสุข" ให้แก่ครอบครัวผู้ดูแล

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ผู้สูงอายุติดเตียงเผชิญภาวะโดดเดี่ยวและซึมเศร้า ภาระการดูแลตกอยู่กับญาติเพียงลำพัง ขณะที่เยาวชนขาดโอกาสเรียนรู้เรื่องความเอื้ออาทร
- กลไกสะกิดพฤติกรรม (Micro-volunteering & Empathy Induction): ภารกิจเยี่ยมบ้านสัปดาห์ละ 1-2 ชั่วโมงที่แบ่งหน้าที่ชัดเจน ช่วยลดความรู้สึกว่าเป็นภาระหนักและดึงดูดใจให้อาสาสมัครเริ่มต้นทำได้ทันที
- วงจรนิสัยใหม่ (Habit of Compassion): รอยยิ้ม คำขอบคุณ และความสุขของผู้สูงอายุสร้างสารแห่งความสุข (Helper's High) ดึงดูดให้อาสาสมัครอยากกลับมาดูแลต่อเนื่องเป็นประจำ
- สังคมแห่งความเกื้อกูล (Intergenerational Bonding): การเชื่อมโยงคนสองวัยสร้างความผูกพันดุจญาติมิตร ปลูกฝังค่านิยมความกตัญญูและจิตสาธารณะให้หยั่งรากลึกในหัวใจเยาวชน`;
    } else {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- ก่อตั้ง "ทีมกตัญญูสัญจร อาสาเยี่ยมบ้านปันรัก" ระดมพลัง ${audience} ลงพื้นที่ฟื้นฟูกายภาพบำบัดง่ายๆ และจัดกิจกรรมดนตรีบำบัดเล่านิทาน ณ บ้านผู้สูงวัย ${area}
- จัดทำ "Living Memory Book (บันทึกภูมิปัญญาชีวิต)" ให้นักเรียนจิตอาสาสัมภาษณ์และบันทึกเรื่องราวความดีของผู้สูงอายุ เพื่อคืนคุณค่าและศักดิ์ศรีความเป็นมนุษย์
- จัดตั้งกองทุนสวัสดิการชุมชนสนับสนุนผ้าอ้อมผู้ใหญ่และอาหารเสริมทางการแพทย์แก่ผู้ป่วยติดเตียงยากไร้

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ทัศนคติของสังคมที่มองว่าผู้สูงอายุเป็นภาระ และช่องว่างระหว่างวัยทำให้เยาวชนห่างเหินจากผู้ใหญ่
- กลไกสะกิดพฤติกรรม (Storytelling & Emotional Resonance): การรับฟังเรื่องราวชีวิตทำให้คนรุ่นใหม่เกิดความเคารพและซาบซึ้งในคุณงามความดีของผู้สูงอายุ
- การเปลี่ยนผ่านทางจิตวิทยา (Shifting Values): เปลี่ยนจากความรู้สึกสงสาร มาเป็นความต้องการตอบแทนบุญคุณและช่วยเหลือเกื้อกูลด้วยหัวใจ
- ความยั่งยืนของพฤติกรรม: ชุมชนเกิดระบบตาข่ายความปลอดภัยทางสังคมที่สมาชิกดูแลกันเองอย่างอบอุ่นและต่อเนื่อง`;
    }
  }

  // 6. หัวข้อ: ธนาคารเวลาจิตอาสา (TimeBank)
  if (topicText.includes('ธนาคารเวลา') || topicText.includes('timebank')) {
    return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "ธนาคารเวลาคุณธรรม (Moral TimeBank)" ณ ${area} ให้ ${audience} สามารถบันทึกชั่วโมงที่ทำความดีเพื่อช่วยเหลือสังคมผ่านแอปพลิเคชันมือถือ ${cleanProj}
- ออกแบบกิจกรรม "ภารกิจฮีโร่ชุมชน (Community Micro-Quests)" ให้สมาชิกเลือกทำตามความถนัด เช่น ซ่อมแซมบ้าน ช่วยดูแลผู้สูงวัย สอนหนังสือ ปลูกต้นไม้
- กำหนดสิทธิประโยชน์ที่สามารถนำชั่วโมงสะสมมาเบิกถอนความช่วยเหลือกลับคืนในยามจำเป็น หรือแลกรับสิทธิประโยชน์จากองค์กรภาคีเครือข่าย

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ปรับจากทัศนคติ "ธุระไม่ใช่" หรือคิดว่าไม่มีเวลา มาสู่การลงมือทำความดีด้วยภารกิจย่อยที่ทำได้จริง
- กลไกสะกิดพฤติกรรม (Friction Reduction & Tokenomics): ภารกิจขนาดเล็กที่ทำได้ใน 15-30 นาที และระบบแต้มชั่วโมงช่วยลดความลังเลใจในการเริ่มต้น
- รางวัลทางใจและความรู้สึกมีคุณค่า (Helper's High): การได้ช่วยเหลือเพื่อนมนุษย์สร้างความสุขลึกซึ้งและกระตุ้นความภาคภูมิใจในตนเอง
- เครือข่ายจิตอาสายั่งยืน (Civic Cohesion): การช่วยเหลือซึ่งกันและกันสร้างทุนทางสังคมและความไว้วางใจ นำไปสู่วิถีชีวิตแห่งการแบ่งปันอย่างถาวร`;
  }

  // 7. หัวข้อ: ปลดหนี้ & วินัยการเงิน & สัจจะพอเพียง
  if (topicText.includes('หนี้') || (topicText.includes('ออม') && (topicText.includes('การเงิน') || topicText.includes('สัจจะ') || topicText.includes('ครัวเรือน')))) {
    return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "คลินิกวินัยการเงินและสัจจะดิจิทัล (Financial Freedom Lab)" ณ ${area} เพื่อให้คำปรึกษาการปรับโครงสร้างหนี้และวางแผนการเงินรายครัวเรือนแก่ ${audience} ${cleanProj}
- นำระบบ "สมุดบัญชีครัวเรือนพอเพียงดิจิทัล" ผ่านแอปพลิเคชันมือถือ บันทึกรายรับ-รายจ่ายและส่งแจ้งเตือนรายจ่ายฟุ่มเฟือยอัตโนมัติ
- ขับเคลื่อนกลุ่มออมทรัพย์สัจจะวันละ 10-20 บาท สร้างวินัยการออมก่อนใช้จ่าย และเป็นกองทุนสวัสดิการหมุนเวียนลดการพึ่งพาหนี้นอกระบบ

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ใช้จ่ายตามอารมณ์ ขาดการบันทึกบัญชี และติดกับดักวงจรหนี้นอกระบบที่ดอกเบี้ยสูง
- กลไกสะกิดพฤติกรรม (Loss Framing & Micro-commitments): การเห็นตัวเลขดอกเบี้ยที่ต้องสูญเสียไป กระตุ้นความตระหนักรู้และสร้างพันธสัญญาสัจจะกับตนเอง
- วงจรนิสัยใหม่ (Daily Self-Monitoring): การบันทึกบัญชีทุกวันช่วยสร้างภูมิคุ้มกันทางความคิด ยับยั้งความอยากซื้อของที่ไม่จำเป็น
- ความมั่นคงทางจิตใจ (Sufficiency Resilience): การมีเงินออมสำรองฉุกเฉินช่วยคลายความกังวลใจ นำไปสู่วิถีชีวิตที่พึ่งตนเองได้อย่างมั่นคง`;
  }

  // 8. หัวข้อ: ความโปร่งใส & ตรวจสอบได้ & Open Data & ป้องกันทุจริต
  if (topicText.includes('โปร่งใส') || topicText.includes('ทุจริต') || topicText.includes('ตรวจสอบ') || topicText.includes('ฮั้ว') || topicText.includes('สุจริต')) {
    return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้งแพลตฟอร์ม "กระดานเปิดตาโปร่งใส (Open Integrity Dashboard)" แสดงรายละเอียดโครงการงบประมาณ แผนการจัดซื้อจัดจ้าง และผลการตรวจรับงานแบบเรียลไทม์ ${area} ${cleanProj}
- ติดตั้งป้าย QR Code ณ จุดก่อสร้างโครงการสาธารณะทุกแห่ง เพื่อให้ ${audience} สแกนตรวจสอบรายละเอียดและให้คะแนนความพึงพอใจได้ทันที
- สร้างช่องทางแจ้งเบาะแสและร้องเรียนแบบไม่เปิดเผยตัวตน (Safe Anonymous Whistleblower Channel) คุ้มครองผู้ให้ข้อมูล 100%

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ปิดช่องว่างของการทุจริต การเอื้อประโยชน์พวกพ้อง และความหวาดกลัวของประชาชนที่ไม่กล้าทักท้วง
- กลไกสะกิดพฤติกรรม (Sunlight Effect & Social Deterrence): การเปิดเผยข้อมูลต่อสาธารณะทำงานเป็นเกราะป้องกันทางพฤติกรรม ทำให้ต้นทุนทางชื่อเสียงในการทำผิดสูงขึ้นมหาศาล
- การเสริมพลังประชาชน (Civic Empowerment): ประชาชนรู้สึกมีอำนาจตรวจสอบและเป็นเจ้าของภาษีอย่างแท้จริง
- วัฒนธรรมองค์กรสุจริต (Integrity Culture): ความโปร่งใสกลายเป็นมาตรฐานปกติใหม่ในการทำงาน บุคลากรยึดมั่นในความซื่อสัตย์สุจริตอย่างเต็มภาคภูมิ`;
  }

  // 9. กรณีผู้ใช้พิมพ์หัวข้อ/Prompt อื่นๆ มาเอง (Custom Prompt Dynamic Behavioral Synthesis)
  const cleanPrompt = (userPromptOrKeyword || '')
    .replace(/^(อยากได้โครงการ|อยากทำโครงการ|ขอโครงการ|ช่วยคิดโครงการ|ช่วยคิด|โครงการ)/g, '')
    .replace(/^[\s:,-]+/g, '')
    .trim();

  if (cleanPrompt && cleanPrompt.length > 2) {
    if (!isSecondVariant) {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- ออกแบบนวัตกรรมและกลไกเชิงปฏิบัติการเพื่อขับเคลื่อนเรื่อง "${cleanPrompt}" ณ ${area} ${cleanProj} โดยบูรณาการความร่วมมือของ ${audience}
- จัดตั้งระบบดิจิทัล/แอปพลิเคชันติดตามและประเมินผลการมีส่วนร่วมในเรื่อง "${cleanPrompt}" แบบเรียลไทม์ พร้อมการให้แต้มคะแนนความดีและรางวัลเชิงสัญลักษณ์ (Micro-Incentives) แก่ผู้ลงมือปฏิบัติจริง
- จัดเวทีแลกเปลี่ยนเรียนรู้และเชิดชูเกียรติบุคคล/องค์กรต้นแบบด้าน "${cleanPrompt}" ประจำเดือน เพื่อสร้างขวัญกำลังใจและขยายผลอย่างต่อเนื่อง

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: กลุ่มเป้าหมายเดิมขาดการตระหนักรู้ หรือมองว่าเรื่อง "${cleanPrompt}" เป็นเรื่องไกลตัวและทำได้ยาก
- กลไกสะกิดพฤติกรรม (Nudge & Choice Architecture): การออกแบบขั้นตอนที่สะดวกและมีสิ่งกระตุ้นเตือนใจ (Salience Prompts) ณ จุดเกิดพฤติกรรมจริง ช่วยลดความลังเลใจและกระตุ้นการเริ่มต้นลงมือทำทันที
- วงจรนิสัยใหม่ (Habit Loop: Cue -> Routine -> Reward): การได้รับการยอมรับและผลตอบแทนทางใจที่เป็นรูปธรรม สร้างแรงเสริมทางจิตวิทยาเชิงบวก กระตุ้นให้เกิดการทำซ้ำอย่างต่อเนื่อง
- บรรทัดฐานทางสังคมใหม่ (Social Proof & Moral Identity): เมื่อคนส่วนใหญ่เห็นแบบอย่างที่ดีร่วมกัน จะเกิดแรงกดดันเชิงบวกและค่านิยมใหม่ ทำให้พฤติกรรมพึงประสงค์ในเรื่อง "${cleanPrompt}" กลายเป็นวิถีปฏิบัติปกติของชุมชนอย่างยั่งยืน`;
    } else {
      return `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- พัฒนากลไกประชาคมและคู่มือแนวทางปฏิบัติเรื่อง "${cleanPrompt}" ที่เข้าใจง่ายและลงมือทำได้ทันที ณ ${area}
- จัดตั้ง "เครือข่ายแกนนำขับเคลื่อน ${cleanPrompt}" นำโดย ${audience} ร่วมเป็นพี่เลี้ยงให้คำปรึกษาและตรวจเช็กความก้าวหน้าในพื้นที่จริง
- นำระบบกติกาประชาคมเชิงบวก (Positive Social Contract) มาใช้ร่วมกัน พร้อมมอบสิทธิประโยชน์และสวัสดิการชุมชนแก่ผู้ที่มีพฤติกรรมสม่ำเสมอ

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ความเคยชินกับพฤติกรรมเดิมและความเฉื่อยชา (Inertia) ที่ทำให้ขาดแรงผลักดันในการเปลี่ยนแปลง
- กลไกสะกิดพฤติกรรม (Social Reinforcement & Commitments): การทำพันธสัญญาใจร่วมกับกลุ่มเพื่อนช่วยเสริมสร้างความรับผิดชอบต่อส่วนรวม
- การตระหนักรู้คุณค่าภายใน (Intrinsic Motivation): สมาชิกรู้สึกภาคภูมิใจที่ได้มีส่วนร่วมแก้ปัญหา เกิดความรู้สึกเป็นเจ้าของชุมชนร่วมกัน
- การคงอยู่ของพฤติกรรมระยะยาว: การปฏิบัติอย่างสม่ำเสมอเปลี่ยนการฝืนใจให้กลายเป็นพฤติกรรมตามธรรมชาติที่สืบทอดต่อไป`;
    }
  }

  // 10. ชุดกลยุทธ์มาตรฐานสำรองตาม 5 มิติคุณธรรม
  const fallbackByVirtue: Record<string, string[]> = {
    'วินัย': [
      `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้งกลไก Choice Architecture และ Visual Cue ณ จุดเกิดพฤติกรรมจริง ${area} ${cleanProj} เช่น ติดตั้งระบบเซนเซอร์แจ้งเตือนอัตโนมัติ ป้ายไฟ LED สถิติความปลอดภัย และเส้นนำสายตาสะกิดพฤติกรรม (Nudge Lines)
- เชื่อมต่อแพลตฟอร์มสะสมแต้มความดี "วินัยสร้างสุข" เพื่อให้ ${audience} ได้รับการบันทึกคะแนนความรับผิดชอบทันทีเมื่อปฏิบัติตาม
- จัดกิจกรรมเชิดชูเกียรติ "บุคคล/องค์กรต้นแบบวินัยเด่น" มอบสิทธิประโยชน์และของรางวัลเชิงสัญลักษณ์สร้างแรงบันดาลใจ

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: เดิมทีประชาชนละเลยวินัยเพราะมองว่าไม่มีใครสังเกต หรือทำตามความเคยชินที่ผิด
- กลไกสะกิดพฤติกรรม (Nudge & Salience): ป้ายเตือนและเส้นนำสายตาช่วยลด Cognitive Load และดึงสติให้ตระหนักรู้กฎกติกาทันที ณ จุดตัดสินใจ
- วงจรนิสัยใหม่ (Habit Loop: Cue -> Routine -> Reward): การได้รับ Instant Feedback และแต้มสะสมความดีสร้างความพึงพอใจเชิงบวก กระตุ้นให้เกิดการปฏิบัติตามซ้ำๆ
- การสร้างบรรทัดฐานใหม่ (Social Proof & Peer Norm): เมื่อคนส่วนใหญ่เห็นผู้อื่นปฏิบัติตามและได้รับการยกย่อง การมีวินัยจะกลายเป็นพฤติกรรมปกติถาวร`,

      `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- พัฒนานวัตกรรม "Check-in วินัยอัจฉริยะ" และระบบแจ้งเตือนเชิงรุก (Proactive Digital Prompt) กระตุ้นการปฏิบัติหน้าที่ตรงเวลา ${area}
- จัดตั้ง "ชมรมสารวัตรวินัยจิตอาสา" ให้ ${audience} มีส่วนร่วมในการตรวจตรา ให้คะแนนเชิงบวก และแนะนำเพื่อนร่วมกลุ่มอย่างสร้างสรรค์
- ออกแบบกระบวนการทำงานให้ความถูกต้องกลายเป็นตัวเลือกเริ่มต้น (Default Rule) ที่ทำได้ง่ายที่สุด

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ทลายความเฉื่อยชา (Inertia) และความเคยชินกับการผ่อนปรนกฎระเบียบ
- กลไกสะกิดพฤติกรรม (Default Bias): การตั้งค่า Default ให้การทำตามวินัยเป็นทางเลือกที่สะดวกที่สุด ทำให้เกิดพฤติกรรมพึงประสงค์โดยอัตโนมัติ
- การเสริมแรงทางสังคม: สารวัตรวินัยที่เป็นเพื่อนร่วมกลุ่มช่วยสร้างความรู้สึกเป็นพวกเดียวกัน (Sense of Belonging)
- การคงอยู่ของพฤติกรรม: การทำซ้ำต่อเนื่องเปลี่ยนการบังคับใจให้กลายเป็นความภาคภูมิใจในวินัยตนเอง`
    ],
    'พอเพียง': [
      `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- พัฒนาระบบ "สมุดบัญชีครัวเรือน/องค์กรพอเพียงดิจิทัล" และธนาคารแลกเปลี่ยนวัสดุรีไซเคิล/ขยะอินทรีย์ ${area} ${cleanProj}
- นำหลักเศรษฐกิจหมุนเวียน (Circular Economy) มาจับคู่ทรัพยากรเหลือใช้ เชื่อมโยง ${audience} เข้ากับศูนย์เรียนรู้เกษตรพอเพียงและกลุ่มออมทรัพย์สัจจะ
- จัดแคมเปญแข่งขัน "30 วัน ลดรายจ่าย ปลดหนี้ มีเงินออม" พร้อมให้คำปรึกษาทางการเงินแบบรายบุคคล (Financial Coaching)

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ปรับจากพฤติกรรมบริโภคนิยม ใช้จ่ายตามกระแสสังคม และสร้างขยะสิ้นเปลือง
- กลไกสะกิดพฤติกรรม (Loss Framing & Micro-Incentives): การแสดงผลลัพธ์ตัวเลขเงินที่ประหยัดได้ช่วยให้เห็นคุณค่าที่จับต้องได้ทันที
- การสร้างความตระหนักรู้และการทำซ้ำ: การบันทึกและเห็นกราฟค่าใช้จ่ายลดลงสร้างแรงจูงใจภายใน (Intrinsic Motivation) ยับยั้งความอยากใช้จ่ายเกินตัว
- ภูมิคุ้มกันทางพฤติกรรม: การมีเงินออมสำรองทำให้เกิดความมั่นคงทางจิตใจ พลิกพฤติกรรมสู่ความพอประมาณอย่างยั่งยืน`,

      `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- ขับเคลื่อน "ตลาดนัดพอเพียงปันสุข & ตู้แบ่งปันชุมชน" ณ ${area} เพื่อให้ ${audience} นำผลผลิตปลอดสารและสิ่งของเหลือใช้มาแบ่งปันและแลกเปลี่ยน
- จัดหลักสูตรเชิงปฏิบัติการ "DIY พึ่งตนเอง" แปรรูปผลผลิตและลดต้นทุนการใช้ชีวิตประจำวัน
- ก่อตั้งกองทุนสวัสดิการชุมชนบนฐานการออมรายวัน เพื่อเป็นตาข่ายความปลอดภัยทางสังคม (Social Safety Net)

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: เปลี่ยนจากวัฒนธรรมซื้อทุกอย่างและการกู้หนี้ยืมสิน มาสู่การพึ่งพาตนเองและช่วยเหลือเกื้อกูล
- กลไกสะกิดพฤติกรรม (Gamification & Peer Group): ความสนุกในการประดิษฐ์และแข่งขันลดต้นทุนร่วมกับกลุ่มเพื่อน กระตุ้นความอยากมีส่วนร่วม
- การเปลี่ยนผ่านทางจิตวิทยา: เกิดความรู้สึกภูมิใจในวิถีเรียบง่าย (Voluntary Simplicity) ลดการเปรียบเทียบสถานะทางสังคม
- ความยั่งยืนของพฤติกรรม: การมีกองทุนสวัสดิการชุมชนเป็นหลักประกันจริง ทำให้ทุกคนยึดมั่นในวิถีพอเพียงในระยะยาว`
    ],
    'สุจริต': [
      `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- พัฒนาแพลตฟอร์ม "กระดานเปิดตาโปร่งใส (Open Integrity Platform)" แสดงรายละเอียดงบประมาณและผลการตรวจรับงานแบบสาธารณะ ${area} ${cleanProj}
- สร้างช่องทางรับฟังความคิดเห็นและแจ้งเบาะแสที่ไม่เปิดเผยตัวตน คุ้มครองผู้ให้ข้อมูล 100%
- นำระบบสัญลักษณ์ "ตราสัญลักษณ์คุณธรรมสุจริต" มอบให้แก่หน่วยงานและบุคคลที่ผ่านเกณฑ์ความโปร่งใส

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ปิดช่องว่างของการทุจริต การเอื้อประโยชน์พวกพ้อง และความหวาดกลัวไม่กล้าทักท้วง
- กลไกสะกิดพฤติกรรม (Sunlight Effect & Accountability): ข้อมูลที่เปิดเผยต่อสาธารณะทำงานเป็นเกราะป้องกันทางพฤติกรรม
- การเสริมพลังประชาชน: ${audience} รู้สึกมีอำนาจตรวจสอบและเป็นเจ้าของภาษีอย่างแท้จริง
- วัฒนธรรมองค์กรสุจริต: การยกย่องคนสุจริตทำให้ความซื่อตรงกลายเป็นทุนทางสังคมที่น่าภาคภูมิใจ`,

      `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดเวที "สภาพลเมืองตรวจการแผ่นดินระดับท้องถิ่น" ให้ ${audience} ร่วมตรวจรับโครงการและรีวิวความคุ้มค่า ณ ${area}
- พัฒนาคู่มือและคลิปสั้นกรณีศึกษา "ทางแยกวัดใจ: เลือกความถูกต้องเหนือความถูกใจ" เสริมทักษะการตัดสินใจเชิงจริยธรรม
- นำเทคโนโลยีการลงนามและยืนยันข้อมูลแบบดิจิทัล (Digital Audit Trail) มาตัดขั้นตอนการใช้ดุลยพินิจส่วนบุคคล

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: แก้ไขทัศนคติยอมรับการทุจริตและความเฉยชาต่อความไม่ถูกต้อง
- กลไกสะกิดพฤติกรรม (Ethical Priming): การกระตุ้นมโนธรรมผ่านกรณีศึกษาช่วยปลุกจิตสำนึกก่อนลงมือทำ
- แรงผลักดันจากกลุ่ม: การมีภาคประชาชนร่วมเป็นสักขีพยานทำให้ผู้มีอำนาจตระหนักถึงความรับผิดชอบ
- ผลลัพธ์ระยะยาว: ความสุจริตหยั่งรากลึกกลายเป็นดีเอ็นเอของชุมชนและองค์กร`
    ],
    'จิตอาสา': [
      `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "ธนาคารเวลาจิตอาสา (Moral Time Bank)" ณ ${area} ให้ ${audience} สามารถบันทึกเวลาทำความดีผ่านแอปพลิเคชันมือถือ ${cleanProj}
- ออกแบบกิจกรรม "ภารกิจฮีโร่ชุมชน" ดูแลสิ่งแวดล้อม ซ่อมแซมจุดเสี่ยง ช่วยเหลือผู้เปราะบาง
- ก่อตั้งกองทุนสนับสนุนอุปกรณ์และประกันอุบัติเหตุแก่อาสาสมัครเพื่อลดอุปสรรคและความเสี่ยงในการลงพื้นที่

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ปรับจากทัศนคติ "ธุระไม่ใช่" มาสู่การลงมือทำความดีด้วยภารกิจย่อยที่ง่าย
- กลไกสะกิดพฤติกรรม (Friction Reduction): ภารกิจขนาดเล็กที่ทำได้ใน 15-30 นาที ช่วยลดความลังเลใจในการเริ่มต้น
- รางวัลทางใจและความรู้สึกมีคุณค่า (Helper's High): การได้ช่วยเหลือเพื่อนมนุษย์สร้างความสุขลึกซึ้งและกระตุ้นให้อยากทำดีซ้ำ
- เครือข่ายจิตอาสายั่งยืน: การทำกิจกรรมร่วมกันถักทอสายใยความไว้วางใจระหว่างสมาชิกในสังคม`,

      `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- ขับเคลื่อน "หน่วยเคลื่อนที่เร็ว จิตอาสาเพื่อนช่วยเพื่อน" ระดมพลัง ${audience} ดูแลชุมชนและสิ่งแวดล้อม ${area}
- จัดตั้งศูนย์ประสานงานกลางจับคู่ความต้องการของผู้ขอความช่วยเหลือกับทักษะของอาสาสมัคร (Skill-based Volunteering)
- มอบเข็มเชิดชูเกียรติและใบประกาศเกียรติคุณ "จิตอาสาพลังแผ่นดิน" ร่วมกับผู้ว่าราชการจังหวัด

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: เปลี่ยนความเห็นอกเห็นใจในใจให้กลายเป็นการกระทำรูปธรรมที่วัดผลได้
- กลไกสะกิดพฤติกรรม (Commitment Device): การลงทะเบียนทักษะอาสาทำให้เกิดพันธสัญญากับตนเองที่จะสละเวลาเพื่อส่วนรวม
- พลังแห่งการยอมรับ (Social Recognition): การได้รับเกียรติบัตรและคำขอบคุณจากชุมชนเสริมสร้างอัตลักษณ์ของคนดีมีน้ำใจ
- วัฒนธรรมเอื้ออาทร: พฤติกรรมการแบ่งปันและช่วยเหลือกลายเป็นค่านิยมหลักที่ส่งต่อจากรุ่นสู่รุ่น`
    ],
    'กตัญญู': [
      `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- สร้างแพลตฟอร์ม "สายใยรักกตัญญูออนไลน์" เชื่อมโยงลูกหลานที่ไปทำงานต่างถิ่นเข้ากับเครือข่ายดูแลผู้สูงอายุ ${area} ${cleanProj}
- นำระบบภารกิจ "กตัญญูรายสัปดาห์" ส่งข้อความแจ้งเตือนให้โทรศัพท์เยี่ยมเยียน ส่งของใช้จำเป็น หรือบันทึกสุขภาพพ่อแม่ผ่านแอป
- จัดกิจกรรม "ห้องเรียนภูมิปัญญาสองวัย" ให้ผู้สูงวัยเป็นครูภูมิปัญญาถ่ายทอดทักษะแก่ ${audience} และเยาวชน

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: แก้ไขปัญหาความห่างเหิน ความโดดเดี่ยวของผู้สูงวัย และการผัดวันประกันพรุ่งในการดูแลบุพการี
- กลไกสะกิดพฤติกรรม (Behavioral Triggers & Prompts): การแจ้งเตือนตามรอบเวลาที่เหมาะสมช่วยเอาชนะความยุ่งของงานในแต่ละวัน
- พลังแห่งความอบอุ่นและรางวัลทางอารมณ์: รอยยิ้มและคำอวยพรของพ่อแม่ผู้สูงอายุเป็นแรงผลักดันทางอารมณ์ที่ทรงพลังที่สุด
- บรรทัดฐานกตัญญูกตเวทิตา: สายสัมพันธ์ครอบครัวที่แนบแน่นส่งผลให้เยาวชนซึมซับคุณธรรมความกตัญญูอย่างลึกซึ้ง`,

      `1) วิธีการที่จะดำเนินงานว่าทำอย่างไร (Action & Intervention Strategy):
- จัดตั้ง "เครือข่ายยุวชนกตัญญู เยี่ยมบ้านดูแลผู้สูงวัยติดเตียง" ณ ${area} บูรณาการโรงเรียน ชุมชน และ รพ.สต.
- จัดทำ "บันทึกประวัติศาสตร์ชีวิต (Living Memory Book)" ให้นักเรียนสัมภาษณ์และบันทึกเรื่องราวความดีของปราชญ์ชุมชน
- ก่อตั้งกองทุนกตัญญูเพื่อผู้สูงอายุยากไร้ โดยระดมทุนจากเยาวชนและคนในชุมชน

2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้ (Expected Behavioral Transformation Mechanism):
- สภาวะเดิมก่อนปรับ: ลดช่องว่างระหว่างวัย (Generational Divide) และทัศนคติที่มองว่าผู้สูงอายุเป็นภาระ
- กลไกสะกิดพฤติกรรม (Empathy Induction): การสัมภาษณ์และรับฟังเรื่องราวชีวิตทำให้คนรุ่นใหม่เข้าใจและเคารพในคุณค่าของบรรพบุรุษ
- ความผูกพันข้ามรุ่น: เกิดความเอื้ออาทรเสมือนญาติผู้ใหญ่ของตนเอง
- ค่านิยมที่ยั่งยืน: ความกตัญญูถูกปลูกฝังเป็นรากฐานจิตใจ พัฒนาสู่การเป็นพลเมืองที่มีความรับผิดชอบต่อสังคมส่วนรวม`
    ]
  };

  const pool = fallbackByVirtue[v] || fallbackByVirtue['พอเพียง'];
  const idx = Math.abs(seedIndex) % pool.length;
  return pool[idx];
}

export function suggestAlternativeBehaviorStrategies(params: BehaviorStrategyInput): string[] {
  return [
    generateBehaviorModificationStrategy({ ...params, seedIndex: 0 }),
    generateBehaviorModificationStrategy({ ...params, seedIndex: 1 })
  ];
}

// Helper functions สำหรับสังเคราะห์โครงสร้างโครงการส่วนที่ 2 ให้สอดคล้องกับ Prompt ส่วนที่ 1
export function synthesizeTargetAudienceByTopic(kw: string, province: string): string {
  const k = (kw || '').toLowerCase();
  if (
    k.includes('แผ้วถาง') ||
    k.includes('บุกรุก') ||
    k.includes('ป่าต้นน้ำ') ||
    k.includes('ตะนาวศรี') ||
    k.includes('ทุเรียน') ||
    k.includes('ตัดไม้') ||
    (k.includes('ป่า') && (k.includes('รุก') || k.includes('ขยาย') || k.includes('อนุรักษ์') || k.includes('วนเกษตร')))
  ) {
    return `เกษตรกรชาวสวนทุเรียน 450 ครัวเรือน ชุมชนรอบแนวเขตป่าต้นน้ำเทือกเขาตะนาวศรี และเครือข่ายจิตอาสาพิทักษ์ป่าใน`;
  }
  if (
    k.includes('สุกร') ||
    k.includes('ฟาร์มสุกร') ||
    k.includes('ฟาร์มหมู') ||
    k.includes('กลิ่นเหม็น') ||
    (k.includes('น้ำเสีย') && (k.includes('ฟาร์ม') || k.includes('ปศุสัตว์') || k.includes('ท่าจีน') || k.includes('กลิ่น')))
  ) {
    return `ผู้ประกอบการฟาร์มสุกรและปศุสัตว์ 120 แห่ง และประชาชนในชุมชนรอบข้าง 2,800 ครัวเรือนใน`;
  }
  if (
    k.includes('startup') ||
    k.includes('สตาร์ทอัพ') ||
    k.includes('สตาร์ตอัพ') ||
    k.includes('บ่มเพาะ') ||
    k.includes('incubator') ||
    k.includes('ผู้ประกอบการ') ||
    k.includes('นวัตกร') ||
    k.includes('sandbox') ||
    k.includes('pitching') ||
    k.includes('social enterprise')
  ) {
    return `นิสิต นักศึกษา เยาวชนคนรุ่นใหม่ และผู้ประกอบการ Startup / วิสาหกิจเริ่มต้น 450 ราย (รวมกว่า 90 ทีม) พร้อมเครือข่ายพี่เลี้ยงนวัตกรรม (Mentors) ใน`;
  }
  if (k.includes('พนัน') || k.includes('เว็บพนัน') || k.includes('เกม')) {
    return `นักเรียน เยาวชนกลุ่มเสี่ยง 2,500 คน ผู้ปกครอง และครูในสถานศึกษาและชุมชน`;
  }
  if (k.includes('น้ำท่วม') || k.includes('อุทกภัย') || k.includes('ระบายน้ำ')) {
    return `ประชาชนในชุมชนริมน้ำและพื้นที่เสี่ยงอุทกภัย 1,800 ครัวเรือน และกลุ่มจิตอาสาภัยพิบัติใน`;
  }
  if ((k.includes('ขยะ') && k.includes('ออม')) || k.includes('โรงงาน') || k.includes('นิคม')) {
    return `พนักงานในสถานประกอบการ/โรงงานอุตสาหกรรม 2,500 คน และประชาชนในชุมชนรอบข้าง 1,200 ครัวเรือนใน`;
  }
  if (k.includes('ไซเบอร์') || k.includes('บัญชีม้า') || k.includes('กลโกง') || k.includes('มิจฉาชีพ') || k.includes('หลอก')) {
    return `นักเรียน เยาวชนในสถานศึกษา 3,500 คน และประชาชนกลุ่มเสี่ยงในชุมชน`;
  }
  if (k.includes('ทางม้าลาย') || k.includes('ข้ามถนน') || k.includes('คนเดิน') || k.includes('จราจร')) {
    return `ผู้ขับขี่รถยนต์/จักรยานยนต์ และประชาชนผู้เดินเท้าข้ามถนน 4,500 รายในเขตชุมชนและหน้าสถานศึกษา`;
  }
  if (k.includes('หมวก') || k.includes('หมวกกันน็อก')) {
    return `พนักงานโรงงานอุตสาหกรรมผู้ใช้รถจักรยานยนต์ 3,200 คน และเยาวชนในสถานศึกษา`;
  }
  if (k.includes('ติดเตียง') || k.includes('สูงวัย') || k.includes('ผู้สูงอายุ')) {
    return `ผู้สูงอายุติดเตียงและผู้มีภาวะพึ่งพิง 350 ราย ครอบครัวผู้ดูแล และเยาวชนจิตอาสา 500 คนใน`;
  }
  if (k.includes('ธนาคารเวลา') || k.includes('จิตอาสา')) {
    return `ประชาชนจิตอาสา เยาวชน และสมาชิกชุมชน 2,000 คนในพื้นที่`;
  }
  if (k.includes('ออม') || k.includes('หนี้') || k.includes('การเงิน')) {
    return `ประชาชนกลุ่มเปราะบางทางการเงิน เกษตรกร และผู้มีภาระหนี้สิน 1,500 ครัวเรือนใน`;
  }
  if (k.includes('โปร่งใส') || k.includes('ทุจริต') || k.includes('ตรวจสอบ') || k.includes('สุจริต')) {
    return `บุคลากรภาครัฐ องค์กรปกครองส่วนท้องถิ่น และเครือข่ายภาคประชาชนตาสับปะรด 1,800 รายใน`;
  }
  return `กลุ่มเป้าหมายในพื้นที่ และประชาชนที่ได้รับประโยชน์โดยตรงจากโครงการ 3,500 ราย`;
}

export function synthesizeActivityPlanByTopic(kw: string, province: string): string {
  const k = (kw || '').toLowerCase();
  if (
    k.includes('แผ้วถาง') ||
    k.includes('บุกรุก') ||
    k.includes('ป่าต้นน้ำ') ||
    k.includes('ตะนาวศรี') ||
    k.includes('ทุเรียน') ||
    k.includes('ตัดไม้') ||
    (k.includes('ป่า') && (k.includes('รุก') || k.includes('ขยาย') || k.includes('อนุรักษ์') || k.includes('วนเกษตร')))
  ) {
    return `1) ระดับนโยบาย: กรมป่าไม้ อุทยานแห่งชาติ ฝ่ายปกครองอำเภอ และ อปท. ร่วมลงนาม MOU ประกาศแนวเขตป่าต้นน้ำตะนาวศรีและรับรองธรรมนูญแนวกันชนทุเรียนสีเขียว\n2) ผู้ปฏิบัติการ: สมาคมชาวสวนทุเรียน เจ้าหน้าที่พิทักษ์ป่า และผู้ใหญ่บ้าน ร่วมตรวจสอบการปักหมุดแนวเขตดิจิทัล จัดทีมลาดตระเวนร่วม และรับรองแปลงทุเรียนวนเกษตร\n3) ประชาชน: เกษตรกรชาวสวนทุเรียนร่วมทำพันธสัญญาไม่แผ้วถางรุกป่าเพิ่ม ปลูกไม้ป่าเสริมในแปลง และเป็นหูเป็นตาสอดส่องแนวเขตป่าชุมชน`;
  }
  if (
    k.includes('สุกร') ||
    k.includes('ฟาร์มสุกร') ||
    k.includes('ฟาร์มหมู') ||
    k.includes('กลิ่นเหม็น') ||
    (k.includes('น้ำเสีย') && (k.includes('ฟาร์ม') || k.includes('ปศุสัตว์') || k.includes('ท่าจีน') || k.includes('กลิ่น')))
  ) {
    return `1) ระดับนโยบาย: สำนักงานปศุสัตว์จังหวัด สำนักงานสิ่งแวดล้อมภาค และ อปท. ร่วมลงนาม MOU ประกาศเขตควบคุมมลพิษฟาร์มสุกรและส่งเสริมมาตรฐานฟาร์มสีเขียว\n2) ผู้ปฏิบัติการ: ชมรมผู้เลี้ยงสุกร เจ้าหน้าที่สาธารณสุข และแกนนำชุมชน ร่วมติดตั้งเซนเซอร์ตรวจวัดกลิ่น ตรวจสอบบ่อบำบัดน้ำเสีย และรับรองมาตรฐานฟาร์มคุณธรรม\n3) ประชาชน: ผู้ประกอบการฟาร์มสุกรเดินระบบก๊าซชีวภาพและม่านน้ำบำบัดกลิ่นอย่างสม่ำเสมอเกินร้อยละ 85 ประชาชนรอบข้างร่วมติดตามข้อมูลผ่านแดชบอร์ดและนำก๊าซ/ปุ๋ยชีวภาพไปใช้ประโยชน์`;
  }
  if (
    k.includes('startup') ||
    k.includes('สตาร์ทอัพ') ||
    k.includes('สตาร์ตอัพ') ||
    k.includes('บ่มเพาะ') ||
    k.includes('incubator') ||
    k.includes('ผู้ประกอบการ') ||
    k.includes('นวัตกร') ||
    k.includes('sandbox') ||
    k.includes('pitching') ||
    k.includes('social enterprise')
  ) {
    return `1) ระดับนโยบาย: สำนักงานนวัตกรรมแห่งชาติ (NIA) ร่วมกับมหาวิทยาลัย หอการค้าจังหวัด และสภาอุตสาหกรรมจังหวัด ทำ MOU จัดตั้งศูนย์บ่มเพาะสตาร์ทอัพคุณธรรมและกองทุนทุนตั้งต้น (Seed Fund)\n2) ผู้ปฏิบัติการ: ผู้จัดการศูนย์บ่มเพาะ นวัตกรพี่เลี้ยง (Mentors) และผู้เชี่ยวชาญด้านธุรกิจ จัดโปรแกรม Incubation Bootcamp 12 สัปดาห์ คลินิกให้คำปรึกษาโมเดลธุรกิจ และพาลงพื้นที่ทดสอบตลาด (MVP)\n3) ประชาชน: เยาวชน นักศึกษา และผู้ประกอบการรุ่นใหม่ รวมทีมพัฒนาผลิตภัณฑ์/บริการทดสอบจริงกับชุมชน และร่วมเวที Pitching ระดมทุนต่อยอดธุรกิจเพื่อสังคม`;
  }
  if (k.includes('พนัน') || k.includes('เว็บพนัน') || k.includes('เกม')) {
    return `1) ระดับนโยบาย: สำนักงานเขตพื้นที่การศึกษา ร่วมกับตำรวจภูธรจังหวัด และพัฒนาสังคมฯ ทำ MOU สกัดกั้นภัยพนันออนไลน์ในสถานศึกษา\n2) ผู้ปฏิบัติการ: ครูแนะแนว แกนนำเยาวชน และสภาเด็กและเยาวชน จัดกิจกรรม Mind Shield ปลูกภูมิคุ้มกันใจและเวิร์กช็อปพื้นที่สร้างสรรค์\n3) ประชาชน: นักเรียน ครอบครัว และชุมชน ร่วมสร้างกติกาครอบครัวคุณธรรม ปรับพฤติกรรมลดเวลาหน้าจอและชวนกันทำกิจกรรมจิตอาสา`;
  }
  if (k.includes('น้ำท่วม') || k.includes('อุทกภัย') || k.includes('ระบายน้ำ')) {
    return `1) ระดับนโยบาย: โครงการชลประทานจังหวัด สำนักงานป้องกันและบรรเทาสาธารณภัย (ปภ.) และ อปท. ร่วมวางแผนผังเส้นทางระบายน้ำและกติกาการใช้น้ำ\n2) ผู้ปฏิบัติการ: แกนนำชุมชน กลุ่มจิตอาสาพิทักษ์สายน้ำ และ อสม. จัดเวรยามเฝ้าระวังระดับน้ำและร่วมกันกำจัดวัชพืชเปิดทางน้ำไหล\n3) ประชาชน: ครัวเรือนในพื้นที่ลุ่มน้ำร่วมปฏิบัติตามกติกาไม่ทิ้งขยะอุดตันท่อระบายน้ำ และร่วมมือจัดเตรียมพื้นที่ปลอดภัยรับมือน้ำหลาก`;
  }
  if ((k.includes('ขยะ') && k.includes('ออม')) || (k.includes('ขยะ') && k.includes('โรงงาน'))) {
    return `1) ระดับนโยบาย: อุตสาหกรรมจังหวัด เทศบาล และสภาอุตสาหกรรมจังหวัด ร่วมจัดทำ MOU สนับสนุนกลไกธนาคารขยะและกองทุนสัจจะออมทรัพย์\n2) ผู้ปฏิบัติการ: คณะกรรมการสิ่งแวดล้อมโรงงาน ผู้นำชุมชน และพี่เลี้ยงการเงิน ทำหน้าที่ตรวจรับขยะรีไซเคิลและบันทึกบัญชีเงินออมสัจจะ\n3) ประชาชน: พนักงานโรงงานและสมาชิกในชุมชนร่วมคัดแยกขยะต้นทางทุกวัน และสะสมแต้มเงินออมในบัญชีอย่างต่อเนื่อง`;
  }
  if (k.includes('ไซเบอร์') || k.includes('บัญชีม้า') || k.includes('กลโกง') || k.includes('มิจฉาชีพ') || k.includes('หลอก')) {
    return `1) ระดับนโยบาย: ตำรวจไซเบอร์ ศูนย์ดำรงธรรมจังหวัด และเขตพื้นที่การศึกษา ร่วมกำหนดมาตรการสกัดกั้นบัญชีม้าและกลโกงออนไลน์เชิงรุก\n2) ผู้ปฏิบัติการ: ครูแนะแนว แกนนำเยาวชนไซเบอร์การ์ด และผู้นำชุมชน จัดเวทีอบรมรู้ทันกลโกงและตรวจเช็กบัญชีเสี่ยงผ่านแอปพลิเคชัน\n3) ประชาชน: ประชาชนและเยาวชนร่วมเป็นตาสับปะรด ใช้แอปเช็กก่อนโอน 30 วินาที และแจ้งเบาะแสบัญชีม้าแก่ส่วนรวม`;
  }
  if (k.includes('ทางม้าลาย') || k.includes('ข้ามถนน') || k.includes('คนเดิน') || k.includes('จราจร')) {
    return `1) ระดับนโยบาย: ตำรวจภูธรจังหวัด สำนักงานขนส่งจังหวัด และ อปท. ร่วมกำหนดเขตทางม้าลายปลอดภัยและกวดขันวินัยจราจร\n2) ผู้ปฏิบัติการ: ครู อาจารย์ แกนนำเยาวชน และอาสาจราจร ทำหน้าที่พี่เลี้ยงโบกรถและรณรงค์หน้าสถานศึกษาและทางข้ามปลอดภัย\n3) ประชาชน: ผู้ขับขี่และคนเดินเท้าร่วมปฏิบัติตามกติกาสัญจรปลอดภัย ชะลอและหยุดรถให้คนข้ามทางม้าลายทุกครั้ง`;
  }
  if (k.includes('หมวก') || k.includes('หมวกกันน็อก')) {
    return `1) ระดับนโยบาย: สำนักงานแรงงานจังหวัด สภาอุตสาหกรรม และตำรวจภูธร ออกมาตรการ Safety Gate รณรงค์สวมหมวกนิรภัยปลอดภัยอย่างเข้มงวด\n2) ผู้ปฏิบัติการ: เจ้าหน้าที่ จป.วิชาชีพ คณะกรรมการ คปอ. และแกนนำพนักงาน ตรวจเช็กการล็อคสายรัดคางก่อนเข้า-ออกพื้นที่\n3) ประชาชน: พนักงานและผู้ขับขี่สองล้อร่วมจับคู่บัดดี้ความปลอดภัย เตือนกันสวมหมวกนิรภัยทุกครั้งที่ขับขี่`;
  }
  if (k.includes('ติดเตียง') || k.includes('สูงวัย') || k.includes('ผู้สูงอายุ')) {
    return `1) ระดับนโยบาย: สำนักงานสาธารณสุขจังหวัด (สสจ.) รพ.สต. และ อปท. ร่วมจัดสรรงบประมาณและชุดอุปกรณ์เยี่ยมบ้าน\n2) ผู้ปฏิบัติการ: พยาบาล รพ.สต. อสม. และแกนนำเยาวชนจิตอาสา จัดทีมเยี่ยมบ้านรายสัปดาห์และฟื้นฟูกายภาพ/จิตใจผู้สูงวัย\n3) ประชาชน: ครอบครัว ชุมชน และจิตอาสา ร่วมดูแล ให้กำลังใจ และส่งต่อข้อมูลสุขภาพผ่านระบบดิจิทัล`;
  }
  if (k.includes('ธนาคารเวลา') || k.includes('จิตอาสา')) {
    return `1) ระดับนโยบาย: องค์กรปกครองส่วนท้องถิ่น และสำนักงานพัฒนาสังคมฯ ร่วมรับรองระบบเครดิตความดีและธนาคารเวลา\n2) ผู้ปฏิบัติการ: ผู้จัดการธนาคารเวลาและแกนนำชุมชน จัดเวรจับคู่ความต้องการของผู้ขอความช่วยเหลือกับจิตอาสา\n3) ประชาชน: สมาชิกชุมชนทุกช่วงวัยร่วมลงแรงแบ่งปันความถนัด และแลกเปลี่ยนความช่วยเหลือเกื้อกูลกัน`;
  }
  if (k.includes('ออม') || k.includes('หนี้') || k.includes('การเงิน')) {
    return `1) ระดับนโยบาย: จังหวัด สถาบันการเงินชุมชน และสหกรณ์ ร่วมออกแบบโครงการปรับโครงสร้างหนี้และส่งเสริมการออม\n2) ผู้ปฏิบัติการ: ครูบัญชีอาสา และพี่เลี้ยงการเงินชุมชน จัดคลินิกวางแผนการเงินรายสัปดาห์และตรวจสมุดบัญชีครัวเรือน\n3) ประชาชน: ครัวเรือนร่วมปฏิญาณสัจจะลดรายจ่ายฟุ่มเฟือย บันทึกรายรับ-รายจ่าย และออมเงินสัจจะสม่ำเสมอ`;
  }
  if (k.includes('โปร่งใส') || k.includes('ทุจริต') || k.includes('ตรวจสอบ') || k.includes('สุจริต')) {
    return `1) ระดับนโยบาย: ผู้ว่าราชการจังหวัด และสำนักงาน ป.ป.ช. ประจำจังหวัด สนับสนุนมาตรการเปิดเผยข้อมูลงบประมาณแบบเปิด\n2) ผู้ปฏิบัติการ: สภาองค์กรชุมชน และเครือข่ายสื่อมวลชนท้องถิ่น จัดเวทีถอดบทเรียนความโปร่งใสและตรวจสอบหน้างาน\n3) ประชาชน: ประชาชนในพื้นที่ร่วมสแกน QR Code ตรวจสอบงานโครงการสาธารณะและร่วมประเมินความคุ้มค่า`;
  }
  return `1) ระดับนโยบาย: ผู้ว่าราชการจังหวัด องค์กรปกครองส่วนท้องถิ่น และภาคีเครือข่าย ร่วมจัดทำบันทึกข้อตกลง MOU และสนับสนุนทรัพยากรขับเคลื่อน\n2) ผู้ปฏิบัติการ: เจ้าหน้าที่ผู้รับผิดชอบ ผู้นำชุมชน และแกนนำเยาวชน ทำหน้าที่เป็นพี่เลี้ยงขับเคลื่อนกิจกรรมในพื้นที่อย่างใกล้ชิด\n3) ประชาชน: ประชาชนกลุ่มเป้าหมาย ครอบครัว และชุมชน ร่วมลงมือปฏิบัติและประเมินผลพฤติกรรมอย่างต่อเนื่อง`;
}

export function synthesizeBehavioralKpiByTopic(kw: string): string {
  const k = (kw || '').toLowerCase();
  if (
    k.includes('แผ้วถาง') ||
    k.includes('บุกรุก') ||
    k.includes('ป่าต้นน้ำ') ||
    k.includes('ตะนาวศรี') ||
    k.includes('ทุเรียน') ||
    k.includes('ตัดไม้') ||
    (k.includes('ป่า') && (k.includes('รุก') || k.includes('ขยาย') || k.includes('อนุรักษ์') || k.includes('วนเกษตร')))
  ) {
    return `การบุกรุกแผ้วถางป่าต้นน้ำเทือกเขาตะนาวศรีลดลงมากกว่าร้อยละ 75-80 เกษตรกรชาวสวนทุเรียนในพื้นที่เป้าหมายไม่น้อยกว่าร้อยละ 80 ร่วมลงนามและปฏิบัติตามธรรมนูญแนวเขตป่า และมีแปลงทุเรียนที่ปรับสู่วนเกษตรทุเรียนรักษ์ป่าไม่น้อยกว่า 250 แปลงภายใน 6 เดือน`;
  }
  if (
    k.includes('สุกร') ||
    k.includes('ฟาร์มสุกร') ||
    k.includes('ฟาร์มหมู') ||
    k.includes('กลิ่นเหม็น') ||
    (k.includes('น้ำเสีย') && (k.includes('ฟาร์ม') || k.includes('ปศุสัตว์') || k.includes('ท่าจีน') || k.includes('กลิ่น')))
  ) {
    return `เรื่องร้องเรียนปัญหามลพิษกลิ่นเหม็นและน้ำเสียจากฟาร์มสุกรลดลงมากกว่าร้อยละ 80 ฟาร์มสุกรในพื้นที่เป้าหมายไม่น้อยกว่าร้อยละ 80 มีระบบบำบัดน้ำเสียและก๊าซชีวภาพที่ผ่านเกณฑ์ และเกิดการนำพลังงานหมุนเวียนไปใช้ในชุมชนต่อเนื่องภายใน 6 เดือน`;
  }
  if (
    k.includes('startup') ||
    k.includes('สตาร์ทอัพ') ||
    k.includes('สตาร์ตอัพ') ||
    k.includes('บ่มเพาะ') ||
    k.includes('incubator') ||
    k.includes('ผู้ประกอบการ') ||
    k.includes('นวัตกร') ||
    k.includes('sandbox') ||
    k.includes('pitching') ||
    k.includes('social enterprise')
  ) {
    return `เกิดสตาร์ทอัพและวิสาหกิจเพื่อสังคมรุ่นใหม่ที่ผ่านการบ่มเพาะและพัฒนาผลิตภัณฑ์ต้นแบบ (MVP) ไม่น้อยกว่า 30 ทีม และมีทีมที่สามารถระดมทุนตั้งต้นหรือสร้างรายได้จริงเกินร้อยละ 80 ภายในระยะเวลา 6 เดือน`;
  }
  if (k.includes('พนัน') || k.includes('เว็บพนัน') || k.includes('เกม')) {
    return `เยาวชนกลุ่มเสี่ยงมีพฤติกรรมลดการเข้าถึงเว็บพนันออนไลน์เกินร้อยละ 85 และมีส่วนร่วมในกิจกรรมสร้างสรรค์เชิงบวกต่อเนื่อง 6 เดือน`;
  }
  if (k.includes('น้ำท่วม') || k.includes('อุทกภัย') || k.includes('ระบายน้ำ')) {
    return `ชุมชนในพื้นที่เสี่ยงมีส่วนร่วมดูแลเปิดทางระบายน้ำและกำจัดสิ่งกีดขวางทางน้ำเกินร้อยละ 85 และลดความเสียหายจากอุทกภัยได้อย่างเป็นรูปธรรม`;
  }
  if ((k.includes('ขยะ') && k.includes('ออม')) || (k.includes('ขยะ') && k.includes('โรงงาน'))) {
    return `ปริมาณขยะมูลฝอยลดลงมากกว่าร้อยละ 40 และกลุ่มเป้าหมายมีวินัยในการคัดแยกขยะเพื่อสะสมเงินออมสม่ำเสมอเกินร้อยละ 85 ภายใน 6 เดือน`;
  }
  if (k.includes('ไซเบอร์') || k.includes('บัญชีม้า') || k.includes('กลโกง') || k.includes('มิจฉาชีพ') || k.includes('หลอก')) {
    return `เยาวชนและประชาชนกลุ่มเป้าหมายมีพฤติกรรมตรวจสอบบัญชีก่อนโอนเงินมากกว่าร้อยละ 85 และสถิติการถูกหลอกลวงลดลงอย่างมีนัยสำคัญ`;
  }
  if (k.includes('ทางม้าลาย') || k.includes('ข้ามถนน') || k.includes('คนเดิน') || k.includes('จราจร')) {
    return `ผู้ขับขี่มากกว่าร้อยละ 80 ชะลอความเร็วและหยุดรถให้คนข้ามทางม้าลายอย่างสม่ำเสมอภายใน 6 เดือน`;
  }
  if (k.includes('หมวก') || k.includes('หมวกกันน็อก')) {
    return `อัตราการสวมหมวกนิรภัยทั้งผู้ขับขี่และผู้ซ้อนท้ายในสถานประกอบการและสถานศึกษาเพิ่มขึ้นเป็นร้อยละ 85-90 ภายใน 6 เดือน`;
  }
  if (k.includes('ติดเตียง') || k.includes('สูงวัย') || k.includes('ผู้สูงอายุ')) {
    return `ผู้สูงอายุติดเตียงได้รับการดูแลอย่างต่อเนื่องมากกว่าร้อยละ 80 และเยาวชนจิตอาสามีการลงพื้นที่สม่ำเสมอต่อเนื่องเกิน 6 เดือน`;
  }
  if (k.includes('ธนาคารเวลา') || k.includes('จิตอาสา')) {
    return `เกิดการสะสมชั่วโมงจิตอาสาเพื่อสังคมมากกว่า 15,000 ชั่วโมง และประชาชนมีส่วนร่วมในกิจกรรมสาธารณะเพิ่มขึ้นร้อยละ 80`;
  }
  if (k.includes('ออม') || k.includes('หนี้') || k.includes('การเงิน')) {
    return `ครัวเรือนเป้าหมายร้อยละ 80 มีวินัยทำบัญชีครัวเรือนต่อเนื่อง และลดภาระหนี้นอกระบบได้เฉลี่ยไม่ต่ำกว่าร้อยละ 30`;
  }
  if (k.includes('โปร่งใส') || k.includes('ทุจริต') || k.includes('ตรวจสอบ') || k.includes('สุจริต')) {
    return `ดัชนีความโปร่งใสขององค์กรนำร่องเพิ่มขึ้นเกินร้อยละ 85 และข้อร้องเรียนด้านความไม่โปร่งใสลดลงมากกว่าร้อยละ 80`;
  }
  return `กลุ่มเป้าหมายมากกว่าร้อยละ 80 มีพฤติกรรมเชิงบวกเพิ่มขึ้นอย่างเป็นรูปธรรมและสามารถวัดผลได้ชัดเจนภายในระยะเวลา 6 เดือน`;
}

/**
 * ปรับแต่งข้อเสนอโครงการให้เป็น "ฉบับร่างทั่วไป (Draft Proposal)"
 * โดยข้อความที่ AI คิดให้จะเป็นข้อความโครงการปกติในทุก field (ไม่มีการแทรกวงเล็บหรือ placeholder ประหลาด)
 * มีระดับคะแนนตั้งต้นไม่เกิน 60.00 - 80.00 คะแนน ตามเกณฑ์ตัดสิน
 * เพื่อให้ผู้เข้าร่วมกิจกรรมสามารถเข้าไป Edit และแก้ไขใน field ต่างๆ ตรงไหนก็ได้ตามที่เห็นสมควรเพื่อเพิ่มคะแนน
 */
export function formatAsIncompleteDraftProject(
  rawProject: Partial<HackathonProject>
): Partial<HackathonProject> {
  const p = { ...rawProject };

  // ล้างเป้าหมายปาฏิหาริย์และตัวเลข 100% ที่เป็นไปไม่ได้จริงในทางพฤติกรรมศาสตร์
  // เพื่อให้โครงร่างตั้งต้นของ AI ผ่านเกณฑ์ความเป็นไปได้จริง (Feasibility) เสมอ ไม่โดนหัก 20 แต้ม
  const cleanMiracle = (text?: string) => {
    if (!text) return '';
    return text
      .replace(/ลดลงเป็นศูนย์\s*\(Zero Encroachment\)/gi, 'ลดลงมากกว่าร้อยละ 80')
      .replace(/ลดลงเป็นศูนย์/gi, 'ลดลงมากกว่าร้อยละ 80')
      .replace(/เป็นศูนย์/gi, 'ลดลงมากกว่าร้อยละ 80')
      .replace(/ศูนย์รายถาวร/gi, 'ลดลงอย่างมีนัยสำคัญ')
      .replace(/ศูนย์ราย/gi, 'ลดลงอย่างมีนัยสำคัญ')
      .replace(/ร้อยละ\s*100/g, 'ร้อยละ 80')
      .replace(/100%/g, '80%')
      .replace(/100\s*เปอร์เซ็นต์/g, '80 เปอร์เซ็นต์');
  };

  // ล้างข้อความแทรกวงเล็บ (หากมีตกค้างจากระบบเดิม) ให้เป็นข้อความโครงการธรรมชาติปกติ
  if (p.proposalDetails) {
    p.proposalDetails = cleanMiracle(
      p.proposalDetails
        .replace(/\n*\[(?:จุดที่ผู้เข้าร่วมกิจกรรมสามารถช่วย AI ปรับปรุงเพิ่มเติม|รอผู้เข้าร่วมกิจกรรม).*?\]/g, '')
        .trim()
    );
  }
  if (p.activityPlan) {
    p.activityPlan = cleanMiracle(
      p.activityPlan
        .replace(/\[(?:จุดที่ผู้เข้าร่วมกิจกรรมสามารถช่วย AI ปรับปรุงเพิ่มเติม|รอผู้เข้าร่วมกิจกรรม).*?\]/g, 'ผู้นำชุมชนและภาคีเครือข่ายร่วมสนับสนุน')
        .trim()
    );
  }
  if (p.behavioralKpi) {
    p.behavioralKpi = cleanMiracle(
      p.behavioralKpi
        .replace(/\[(?:จุดที่ผู้เข้าร่วมกิจกรรมสามารถช่วย AI ปรับปรุงเพิ่มเติม|รอผู้เข้าร่วมกิจกรรม).*?\]/g, '')
        .trim()
    );
  }

  return p;
}

export async function aiSuggestHackathonIdea(
  userPrompt: string,
  province: PilotProvinceName | string,
  groupKey: CoffeeGroupKey,
  weaknessVirtue: string,
  challengeTopic?: string,
  selectedCriteriaVirtues?: string[],
  cycleIndex: number = 0,
  activeRubric: UniversalRubricDimension[] = UNIVERSAL_DEFAULT_RUBRIC
): Promise<AiIdeationResultWithPayload> {
  const trimmedUserPrompt = (userPrompt || '').trim();
  const hasCustomUserIdea = trimmedUserPrompt.length > 3;

  // ตรวจสอบและระบุจังหวัดต้นทางของโจทย์ปัญหาอย่างแม่นยำ (อิงจากโจทย์ที่เลือก หรือข้อความ Prompt)
  const effectiveProvince = detectProvinceFromText(
    [challengeTopic, userPrompt],
    province || 'อยุธยา'
  );

  // ปรับชื่อคุณธรรมให้ตรงมาตรฐาน 5 ด้าน
  const normalizeVirtue = (v: string): 'พอเพียง' | 'วินัย' | 'สุจริต' | 'จิตอาสา' | 'กตัญญู' => {
    if (!v) return 'พอเพียง';
    if (v.includes('วินัย')) return 'วินัย';
    if (v.includes('สุจริต')) return 'สุจริต';
    if (v.includes('จิตอาสา')) return 'จิตอาสา';
    if (v.includes('กตัญญู')) return 'กตัญญู';
    return 'พอเพียง';
  };

  const groupName = COFFEE_GROUPS[groupKey]?.name || 'กลุ่มกาแฟสร้างสรรค์คุณธรรม';
  const targetVirtues = (selectedCriteriaVirtues && selectedCriteriaVirtues.length > 0)
    ? selectedCriteriaVirtues
    : [weaknessVirtue || 'พอเพียง'];

  // 1. ลองเรียก LLM API ก่อน (ถ้ามีการตั้ง API Key ในระบบ)
  let lastLlmError: string | undefined = undefined;
  try {
    const llmRes = await tryCallLlmForNewProject(
      trimmedUserPrompt,
      province,
      groupName,
      challengeTopic || 'การยกระดับพฤติกรรมคุณธรรม',
      targetVirtues,
      activeRubric
    );

    if (llmRes && llmRes.project && llmRes.project.projectName) {
      let finalLlmTitle = llmRes.project.projectName;
      if (isPromptCopiedAsProjectName(finalLlmTitle, trimmedUserPrompt)) {
        const freshTitles = suggestCreativeProjectTitles(
          province,
          llmRes.project.targetMoralVirtue || weaknessVirtue,
          llmRes.project.proposalDetails || challengeTopic,
          challengeTopic
        );
        finalLlmTitle = freshTitles[0] || `โครงการ "${normalizeVirtue(llmRes.project.targetMoralVirtue || weaknessVirtue)}สร้างสรรค์" นวัตกรรมปรับเปลี่ยนพฤติกรรมสู่ความยั่งยืน`;
      }

      const rawLlmProject: Partial<HackathonProject> = {
        projectName: finalLlmTitle,
        targetMoralVirtue: normalizeVirtue(llmRes.project.targetMoralVirtue || weaknessVirtue),
        targetArea: llmRes.project.targetArea || `อ.เมือง${province} และพื้นที่นำร่อง`,
        targetAudience: llmRes.project.targetAudience || `ประชาชนในพื้นที่ 3,500 ราย`,
        proposalDetails: llmRes.project.proposalDetails || 'แนวคิดกิจกรรมปรับเปลี่ยนพฤติกรรม',
        activityPlan: llmRes.project.activityPlan || '1) ระดับนโยบาย: กิจกรรมนำร่อง\n2) ผู้ปฏิบัติการ: แกนนำชุมชน\n3) ประชาชน: ชุมชนร่วมปฏิบัติการ',
        behavioralKpi: llmRes.project.behavioralKpi || 'ผลลัพธ์พฤติกรรมเชิงบวก'
      };
      const normProject = formatAsIncompleteDraftProject(rawLlmProject);

      const payloadStrings = buildAiIdeationPayloadStrings(
        normProject,
        province,
        groupName,
        challengeTopic || 'การยกระดับพฤติกรรมคุณธรรม',
        targetVirtues,
        weaknessVirtue,
        trimmedUserPrompt,
        cycleIndex,
        'llm_api',
        llmRes.model,
        llmRes.rawOutput,
        activeRubric
      );

      return {
        ...normProject,
        project: normProject,
        ...payloadStrings,
        generationSource: 'llm_api',
        timestamp: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
        modelName: llmRes.model
      };
    } else if (llmRes?.errorReason) {
      lastLlmError = llmRes.errorReason;
    }
  } catch (err: any) {
    lastLlmError = err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ LLM';
  }

  // 2. กรณีผู้ใช้พิมพ์ Prompt หรือเลือกโจทย์ความท้าทายจากคลังปัญหา (Problem Bank Challenge)
  const effectiveSubject = hasCustomUserIdea ? trimmedUserPrompt : (challengeTopic || '').trim();
  const hasSubstantiveTopic = effectiveSubject.length > 3;

  if (hasSubstantiveTopic) {
    let cleanSubject = effectiveSubject
      .replace(/^(อยากได้โครงการ|อยากทำโครงการ|ขอโครงการ|ช่วยคิดโครงการ|ช่วยคิด|โครงการ|ให้คิดโครงการแก้ปัญหา|ให้คิดโครงการแก้)/g, '')
      .replace(/^[\s:,-]+/g, '')
      .trim();
    if (!cleanSubject) cleanSubject = effectiveSubject;

    const pLower = effectiveSubject.toLowerCase();
    let detectedVirtue: 'พอเพียง' | 'วินัย' | 'สุจริต' | 'จิตอาสา' | 'กตัญญู' = 'พอเพียง';

    if (
      pLower.includes('แผ้วถาง') ||
      pLower.includes('ป่าต้นน้ำ') ||
      pLower.includes('ตะนาวศรี') ||
      pLower.includes('ทุเรียน') ||
      pLower.includes('ตัดไม้') ||
      (pLower.includes('ป่า') && (pLower.includes('รุก') || pLower.includes('ขยาย') || pLower.includes('อนุรักษ์') || pLower.includes('วนเกษตร')))
    ) {
      if (selectedCriteriaVirtues && selectedCriteriaVirtues.length > 0) {
        detectedVirtue = normalizeVirtue(selectedCriteriaVirtues[0]);
      } else {
        detectedVirtue = 'พอเพียง';
      }
    } else if (
      pLower.includes('สุกร') ||
      pLower.includes('ฟาร์มสุกร') ||
      pLower.includes('ฟาร์มหมู') ||
      pLower.includes('กลิ่นเหม็น') ||
      (pLower.includes('น้ำเสีย') && (pLower.includes('ฟาร์ม') || pLower.includes('ปศุสัตว์') || pLower.includes('ท่าจีน') || pLower.includes('กลิ่น')))
    ) {
      if (selectedCriteriaVirtues && selectedCriteriaVirtues.length > 0) {
        detectedVirtue = normalizeVirtue(selectedCriteriaVirtues[0]);
      } else {
        detectedVirtue = 'พอเพียง';
      }
    } else if (pLower.includes('หมวก') || pLower.includes('จราจร') || pLower.includes('ม้าลาย') || pLower.includes('วินัย') || pLower.includes('ขับขี่') || pLower.includes('กฎ')) {
      detectedVirtue = 'วินัย';
    } else if (pLower.includes('ไซเบอร์') || pLower.includes('โกง') || pLower.includes('ม้า') || pLower.includes('สุจริต') || pLower.includes('ทุจริต') || pLower.includes('โปร่งใส') || pLower.includes('ฮั้ว')) {
      detectedVirtue = 'สุจริต';
    } else if (pLower.includes('สูงวัย') || pLower.includes('คนแก่') || pLower.includes('กตัญญู') || pLower.includes('ผู้สูงอายุ') || pLower.includes('ติดเตียง') || pLower.includes('พ่อแม่') || pLower.includes('บุพการี')) {
      detectedVirtue = 'กตัญญู';
    } else if (pLower.includes('จิตอาสา') || pLower.includes('อาสาสมัคร') || pLower.includes('สาธารณะ') || pLower.includes('กู้ภัย') || pLower.includes('บำเพ็ญ') || pLower.includes('ช่วย') || pLower.includes('เสียสละ')) {
      detectedVirtue = 'จิตอาสา';
    } else if (pLower.includes('startup') || pLower.includes('สตาร์ทอัพ') || pLower.includes('บ่มเพาะ') || pLower.includes('ผู้ประกอบการ') || pLower.includes('ขยะ') || pLower.includes('สิ่งแวดล้อม') || pLower.includes('ออม') || pLower.includes('หนี้') || pLower.includes('พอเพียง') || pLower.includes('รีไซเคิล') || pLower.includes('zero')) {
      detectedVirtue = 'พอเพียง';
    } else {
      if (selectedCriteriaVirtues && selectedCriteriaVirtues.length > 0) {
        detectedVirtue = normalizeVirtue(selectedCriteriaVirtues[0]);
      } else {
        detectedVirtue = normalizeVirtue(weaknessVirtue);
      }
    }

    let dynamicTitle = generateSingleCreativeProjectTitle(
      effectiveProvince,
      detectedVirtue,
      cleanSubject,
      cleanSubject || challengeTopic,
      cycleIndex
    );
    dynamicTitle = stripProvinceFromProjectTitle(dynamicTitle);

    if (isPromptCopiedAsProjectName(dynamicTitle, effectiveSubject)) {
      const sanitizedTitles = suggestCreativeProjectTitles(
        effectiveProvince,
        detectedVirtue,
        cleanSubject,
        cleanSubject
      ).map(stripProvinceFromProjectTitle);
      dynamicTitle = sanitizedTitles[cycleIndex % sanitizedTitles.length] || sanitizedTitles[0];
    }

    const targetAud = synthesizeTargetAudienceByTopic(effectiveSubject, effectiveProvince);
    const targetAr = `อ.เมือง${effectiveProvince} และพื้นที่เครือข่ายนำร่องในจังหวัด`;
    const plan = synthesizeActivityPlanByTopic(effectiveSubject, effectiveProvince);
    const kpi = synthesizeBehavioralKpiByTopic(effectiveSubject);

    const cleanTitleNoProvince = stripProvinceFromProjectTitle(dynamicTitle);
    const rawDynamic: Partial<HackathonProject> = {
      projectName: cleanTitleNoProvince.length > 85 ? cleanTitleNoProvince.slice(0, 82) + '...' : cleanTitleNoProvince,
      targetMoralVirtue: detectedVirtue,
      targetAudience: targetAud,
      targetArea: targetAr,
      proposalDetails: generateBehaviorModificationStrategy({
        projectName: cleanTitleNoProvince,
        virtue: detectedVirtue,
        province: effectiveProvince,
        targetAudience: targetAud,
        targetArea: targetAr,
        challengeTopic: cleanSubject || challengeTopic,
        userPromptOrKeyword: effectiveSubject,
        seedIndex: cycleIndex
      }),
      activityPlan: plan,
      behavioralKpi: kpi
    };
    const dynamicProject = formatAsIncompleteDraftProject(rawDynamic);

    const payloadStrings = buildAiIdeationPayloadStrings(
      dynamicProject,
      province,
      groupName,
      challengeTopic || 'การยกระดับพฤติกรรมคุณธรรม',
      targetVirtues,
      weaknessVirtue,
      trimmedUserPrompt,
      cycleIndex,
      'user_custom_heuristic',
      'Behavioral Custom Prompt Synthesizer',
      undefined,
      activeRubric
    );

    return {
      ...dynamicProject,
      project: dynamicProject,
      ...payloadStrings,
      generationSource: 'user_custom_heuristic',
      timestamp: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      modelName: 'Behavioral Custom Prompt Synthesizer',
      llmErrorReason: lastLlmError
    };
  }

  // 3. กรณีผู้ใช้คลิกให้ AI ช่วยคิดโดยไม่ใส่ Prompt และไม่มีโจทย์ความท้าทาย (Generative Engine คิดโครงการใหม่)
  let eligibleModels = GENERATIVE_PROJECT_MODELS;

  // กรองตามเกณฑ์คุณธรรมที่เลือก (ถ้ามี)
  if (selectedCriteriaVirtues && selectedCriteriaVirtues.length > 0) {
    const normSelected = selectedCriteriaVirtues.map(normalizeVirtue);
    const filtered = GENERATIVE_PROJECT_MODELS.filter((m) => normSelected.includes(m.virtue));
    if (filtered.length > 0) {
      eligibleModels = filtered;
    }
  }

  // คำนวณ index ตามรอบการกดเพื่อให้ได้โครงการใหม่ทุกครั้ง
  const seed = Math.abs(cycleIndex > 0 ? cycleIndex - 1 : 0);
  const pickedModel = eligibleModels[seed % eligibleModels.length];

  const genTitle = pickedModel.titleGen(province, seed);
  const genAudience = pickedModel.audienceGen(province);
  const genArea = pickedModel.areaGen(province);

  const rawGen: Partial<HackathonProject> = {
    projectName: genTitle,
    targetMoralVirtue: pickedModel.virtue,
    targetAudience: genAudience,
    targetArea: genArea,
    proposalDetails: generateBehaviorModificationStrategy({
      projectName: genTitle,
      virtue: pickedModel.virtue,
      province,
      targetAudience: genAudience,
      targetArea: genArea,
      challengeTopic: challengeTopic || pickedModel.theme,
      userPromptOrKeyword: pickedModel.theme,
      seedIndex: seed
    }),
    activityPlan: pickedModel.planGen(province),
    behavioralKpi: pickedModel.kpiGen()
  };
  const genProject = formatAsIncompleteDraftProject(rawGen);

  const payloadStrings = buildAiIdeationPayloadStrings(
    genProject,
    province,
    groupName,
    challengeTopic || 'การยกระดับพฤติกรรมคุณธรรม',
    targetVirtues,
    weaknessVirtue,
    trimmedUserPrompt,
    cycleIndex,
    'generative_models_engine',
    `Moral Behavioral Generative Engine v2.5 (${pickedModel.theme})`,
    undefined,
    activeRubric
  );

  return {
    ...genProject,
    project: genProject,
    ...payloadStrings,
    generationSource: 'generative_models_engine',
    timestamp: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
    modelName: `Moral Behavioral Generative Engine v2.5 (${pickedModel.theme})`,
    llmErrorReason: lastLlmError
  };
}

// ============================================================================
// 4. PRE-SUBMISSION EVALUATION ENGINE & PROMPT PAYLOAD BUILDER
// ============================================================================

export interface EvaluatedDimensionDetail {
  virtueKey: string;
  virtueName: string;
  virtueTitle: string;
  subPillarTitle: string;
  scoreOutOf20: number; // ทศนิยมสองตำแหน่ง (1.00 - 20.00) (legacy compatibility)
  score?: number; // คะแนนที่ได้ตามสเกลจริง (ทศนิยมสองตำแหน่ง)
  maxScore?: number; // คะแนนเต็มของเสาหลักนี้ (เช่น 30, 25, 20)
  normalizedScore: number; // เทียบสเกล 100% (ทศนิยมสองตำแหน่ง)
  levelName: string; // 'ระดับดีเลิศ (85-100%)' | 'ระดับดี (70-84%)' | 'ระดับพอใช้ (50-69%)' | 'ระดับกำลังพัฒนา (0-49%)'
  matchedRubricBullets: string[];
  rationale: string; // อธิบายเหตุผลที่ได้คะแนนและข้อเสนอแนะในการปรับปรุงให้ดียิ่งขึ้น
}

export interface DiffDetailItem {
  field: 'projectName' | 'proposalDetails' | 'activityPlan' | 'behavioralKpi';
  fieldNameThai: string;
  type: 'added' | 'removed' | 'modified';
  sentiment: 'positive' | 'negative' | 'neutral';
  impactDescription: string;
  targetPillar: 'challenge_fit' | 'creative_nudge' | 'actionability' | 'expected_impact';
  targetPillarTitle: string;
  scoreDelta: number;
  matchedKeywords?: string[];
}

export interface ProposalDiffAnalysis {
  previousIteration: number;
  currentIteration: number;
  totalDelta: number;
  pillarDeltas: Record<'challenge_fit' | 'creative_nudge' | 'actionability' | 'expected_impact', number>;
  summaryText: string;
  positiveDiffs: DiffDetailItem[];
  negativeDiffs: DiffDetailItem[];
  neutralDiffs: DiffDetailItem[];
  isIdentical: boolean;
}

export interface FeasibilityIssue {
  type: 'unrealistic_target' | 'unrealistic_timeline' | 'unrealistic_audience_scale' | 'insignificant_impact';
  severity: 'high' | 'medium';
  title: string;          // เช่น "เป้าหมายสูงเกินจริง (Overambitious Target)"
  description: string;    // คำอธิบายตามหลักพฤติกรรมศาสตร์
  detectedText: string;   // ข้อความที่ตรวจจับได้
  recommendation: string; // คำแนะนำในการปรับปรุงเพื่อขอคะแนนคืน
}

export interface ProjectFeasibilityAssessment {
  isFeasible: boolean;           // true = ผ่านเกณฑ์, false = มีข้อบกพร่อง
  penaltyScore: number;         // 0.00 หรือ >= 20.00 คะแนน (ตัดคะแนนอย่างน้อย 20 คะแนน)
  issues: FeasibilityIssue[];     // รายการข้อบกพร่องทั้งหมด
  feasibilityBadgeText: string;  // ป้ายกำกับ
  feasibilitySummary: string;    // บทสรุปสำหรับแสดงใน Rationale และผลการตรวจ
}

export interface TempEvaluationSnapshot {
  iteration: number;             // รอบการตรวจสอบ (1, 2, 3...)
  timestamp: string;             // เวลาที่ทำการตรวจและบันทึก
  province: string;              // จังหวัดที่ดำเนินกิจกรรม
  projectData: {
    projectName: string;
    targetMoralVirtue: string;
    targetArea: string;
    targetAudience: string;
    proposalDetails: string;     // แนวคิดนวัตกรรมและกิจกรรมสะกิดพฤติกรรม
    activityPlan: string;        // แผนงาน 3 ระดับ
    behavioralKpi: string;       // ตัวชี้วัดเชิงพฤติกรรม
    proposerName?: string;
    proposerAgency?: string;
    aiDraftSnapshot?: {
      projectName?: string;
      proposalDetails?: string;
      activityPlan?: string;
      behavioralKpi?: string;
    } | null;
  };
  challengeTopic: string;        // โจทย์ปัญหาพื้นที่จากคลังปัญหา
  finalScore: number;            // คะแนนรวม (0.00 - 100.00)
  pillarScores: Record<string, number>; // คะแนนรายเสาหลัก
  qualityTier: string;           // ดีเลิศ / ดี / พอใช้ / กำลังพัฒนา
  summaryHighlights?: string[];   // จุดเด่นหลักในรอบก่อน
  diffAnalysis?: ProposalDiffAnalysis; // การวิเคราะห์ความแตกต่างจากรอบก่อนหน้า
  feasibilityAssessment?: ProjectFeasibilityAssessment; // ผลการประเมินความเป็นไปได้และความสมจริงของโครงการ
  standoutVirtueAnalysis?: MoralVirtuesHighlightAnalysis; // ผลวิเคราะห์จุดเด่นในดัชนีคุณธรรม 5 ด้าน (โดดเด่นเป็นพิเศษ)
}

export interface TempEvaluationHistory {
  province: string;
  challengeTopic: string;
  snapshots: TempEvaluationSnapshot[]; // สูงสุด 5 รายการล่าสุด (FIFO Ring Buffer)
  lastUpdated: string;
}

export const TEMP_EVALUATION_STORAGE_PREFIX = 'pilot_hackathon_temp_eval_snapshot_';
export const TEMP_EVALUATION_HISTORY_PREFIX = 'pilot_hackathon_temp_eval_history_';

export function normalizeProvinceStorageKey(prov: string = 'ส่วนกลาง'): string {
  const clean = (prov || 'ส่วนกลาง').replace(/^จ\./, '').trim();
  if (clean === 'อยุธยา' || clean === 'พระนครศรีอยุธยา') return 'พระนครศรีอยุธยา';
  return clean || 'ส่วนกลาง';
}

/**
 * ตัดช่องว่างและปรับรูปแบบ Newline ให้เป็นมาตรฐานเดียวกัน (\n) เพื่อความเที่ยงตรง 100% ในการเปรียบเทียบข้อความ
 * ป้องกันปัญหาความต่างระหว่าง Windows (\r\n) และ Unix (\n)
 */
export function normalizeProposalText(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * ตรวจสอบว่าโครงการสองชุดเหมือนกันทุกประการ 100% หรือไม่
 */
export function isProjectExactMatch(
  p1?: { projectName?: string; proposalDetails?: string; activityPlan?: string; behavioralKpi?: string; targetAudience?: string } | null,
  p2?: { projectName?: string; proposalDetails?: string; activityPlan?: string; behavioralKpi?: string; targetAudience?: string } | null
): boolean {
  if (!p1 || !p2) return false;
  return (
    normalizeProposalText(p1.projectName) === normalizeProposalText(p2.projectName) &&
    normalizeProposalText(p1.proposalDetails) === normalizeProposalText(p2.proposalDetails) &&
    normalizeProposalText(p1.activityPlan) === normalizeProposalText(p2.activityPlan) &&
    normalizeProposalText(p1.behavioralKpi) === normalizeProposalText(p2.behavioralKpi) &&
    normalizeProposalText(p1.targetAudience) === normalizeProposalText(p2.targetAudience)
  );
}

export function recalibratePillarScoresMap(
  pillarScores: Record<string, number> = {},
  targetTotalScore: number
): Record<string, number> {
  const result: Record<string, number> = {
    challenge_fit: typeof pillarScores.challenge_fit === 'number' ? pillarScores.challenge_fit : 24.0,
    creative_nudge: typeof pillarScores.creative_nudge === 'number' ? pillarScores.creative_nudge : 20.0,
    actionability: typeof pillarScores.actionability === 'number' ? pillarScores.actionability : 18.0,
    expected_impact: typeof pillarScores.expected_impact === 'number' ? pillarScores.expected_impact : 16.0
  };

  const maxMap: Record<string, number> = {
    challenge_fit: 30,
    creative_nudge: 25,
    actionability: 25,
    expected_impact: 20
  };

  let currentSum = Number((result.challenge_fit + result.creative_nudge + result.actionability + result.expected_impact).toFixed(2));
  let diff = Number((targetTotalScore - currentSum).toFixed(2));

  const order = ['actionability', 'expected_impact', 'creative_nudge', 'challenge_fit'];
  if (Math.abs(diff) > 0.01) {
    for (const k of order) {
      if (Math.abs(diff) <= 0.01) break;
      const cur = result[k];
      const max = maxMap[k];
      if (diff > 0) {
        const room = max - cur;
        if (room > 0.01) {
          const add = Number(Math.min(room, diff).toFixed(2));
          result[k] = Number((cur + add).toFixed(2));
          diff = Number((diff - add).toFixed(2));
        }
      } else {
        const reducible = cur - 2.0;
        if (reducible > 0.01) {
          const sub = Number(Math.min(reducible, -diff).toFixed(2));
          result[k] = Number((cur - sub).toFixed(2));
          diff = Number((diff + sub).toFixed(2));
        }
      }
    }
  }

  currentSum = Number((result.challenge_fit + result.creative_nudge + result.actionability + result.expected_impact).toFixed(2));
  diff = Number((targetTotalScore - currentSum).toFixed(2));
  if (Math.abs(diff) > 0.001) {
    for (const k of order) {
      const cur = result[k];
      const max = maxMap[k];
      if (diff > 0 && cur + diff <= max) {
        result[k] = Number((cur + diff).toFixed(2));
        break;
      } else if (diff < 0 && cur + diff >= 2.0) {
        result[k] = Number((cur + diff).toFixed(2));
        break;
      }
    }
  }

  return result;
}

export function auditAndRepairHistorySnapshots(
  history: TempEvaluationHistory,
  challengeTopic: string = ''
): TempEvaluationHistory {
  if (!history || !Array.isArray(history.snapshots) || history.snapshots.length === 0) {
    return history;
  }

  let lastFeasibleScore: number | null = null;
  let didRepair = false;

  for (let i = 0; i < history.snapshots.length; i++) {
    const snap = history.snapshots[i];
    if (!snap.projectData) continue;

    const topic = challengeTopic || snap.challengeTopic || history.challengeTopic || '';
    const feas = assessProjectFeasibility(snap.projectData, topic);
    snap.feasibilityAssessment = feas;

    if (i === 0) {
      if (feas.isFeasible) {
        lastFeasibleScore = snap.finalScore;
      }
      if (snap.pillarScores) {
        snap.pillarScores = recalibratePillarScoresMap(snap.pillarScores, snap.finalScore);
      }
      continue;
    }

    const prevSnap = history.snapshots[i - 1];
    const prevFeas = prevSnap.feasibilityAssessment || assessProjectFeasibility(prevSnap.projectData, topic);

    // Case 0: ตรวจสอบความเหมือนกับ snapshot ในอดีตทุกฉบับ (j < i)
    let matchedEarlierSnap: TempEvaluationSnapshot | null = null;
    for (let j = 0; j < i; j++) {
      const earlier = history.snapshots[j];
      if (earlier?.projectData && isProjectExactMatch(snap.projectData, earlier.projectData)) {
        matchedEarlierSnap = earlier;
        break;
      }
    }

    if (matchedEarlierSnap) {
      // หากเนื้อหาเหมือนกับรอบใดรอบหนึ่งในอดีตเป๊ะ คะแนนจะต้องเท่ากัน 100%
      if (snap.finalScore !== matchedEarlierSnap.finalScore) {
        snap.finalScore = matchedEarlierSnap.finalScore;
        didRepair = true;
      }
      if (matchedEarlierSnap.pillarScores) {
        snap.pillarScores = { ...matchedEarlierSnap.pillarScores };
      }
      if (feas.isFeasible) {
        lastFeasibleScore = snap.finalScore;
      }
    } else if (!prevFeas.isFeasible && feas.isFeasible) {
      // Case 1: Rebound recovery after penalty (prev was infeasible, current is feasible)
      const penaltyScore = prevFeas.penaltyScore || 20.00;
      const anchorScore = lastFeasibleScore !== null ? lastFeasibleScore : 79.00;
      const expectedMinScore = Number(Math.max(anchorScore, prevSnap.finalScore + penaltyScore).toFixed(2));

      // If the recorded score was distorted (e.g. 63 instead of 79-80):
      if (snap.finalScore < expectedMinScore - 1.0) {
        snap.finalScore = expectedMinScore;
        didRepair = true;
      }
      lastFeasibleScore = snap.finalScore;
    } else if (feas.isFeasible) {
      // If current is feasible and was dragged down below lastFeasibleScore without substantive reason:
      if (lastFeasibleScore !== null && snap.finalScore < lastFeasibleScore - 5.0) {
        snap.finalScore = lastFeasibleScore;
        didRepair = true;
      } else {
        lastFeasibleScore = snap.finalScore;
      }
    } else if (!feas.isFeasible) {
      // Infeasible snapshot: must reflect penalty and adhere to Absolute Hard Ceiling (max 60.00)
      const penaltyScore = feas.penaltyScore || 20.00;
      const baseScore = lastFeasibleScore !== null ? lastFeasibleScore : 78.00;
      const maxAllowedScore = Number(Math.min(60.00, baseScore - penaltyScore).toFixed(2));
      if (snap.finalScore > maxAllowedScore) {
        snap.finalScore = maxAllowedScore;
        didRepair = true;
      }
    }

    // Ensure 4 pillars sum strictly to finalScore
    if (snap.pillarScores) {
      snap.pillarScores = recalibratePillarScoresMap(snap.pillarScores, snap.finalScore);
    }
  }

  // If repairs occurred, sync back to storage
  if (didRepair && typeof window !== 'undefined') {
    try {
      const province = history.province || 'ส่วนกลาง';
      const norm = normalizeProvinceStorageKey(province);
      const serialized = JSON.stringify(history);
      sessionStorage.setItem(`${TEMP_EVALUATION_HISTORY_PREFIX}${norm}`, serialized);
      localStorage.setItem(`${TEMP_EVALUATION_HISTORY_PREFIX}${norm}`, serialized);
      if (norm === 'พระนครศรีอยุธยา') {
        sessionStorage.setItem(`${TEMP_EVALUATION_HISTORY_PREFIX}อยุธยา`, serialized);
        localStorage.setItem(`${TEMP_EVALUATION_HISTORY_PREFIX}อยุธยา`, serialized);
      }
    } catch {
      // ignore
    }
  }

  return history;
}

export function getTempEvaluationHistory(province: string = 'ส่วนกลาง'): TempEvaluationHistory | null {
  if (typeof window === 'undefined') return null;
  try {
    const norm = normalizeProvinceStorageKey(province);
    const keyNorm = `${TEMP_EVALUATION_HISTORY_PREFIX}${norm}`;
    const keyRaw = `${TEMP_EVALUATION_HISTORY_PREFIX}${province}`;
    const raw = sessionStorage.getItem(keyNorm)
      || localStorage.getItem(keyNorm)
      || sessionStorage.getItem(keyRaw)
      || localStorage.getItem(keyRaw)
      || (norm === 'พระนครศรีอยุธยา' ? (sessionStorage.getItem(`${TEMP_EVALUATION_HISTORY_PREFIX}อยุธยา`) || localStorage.getItem(`${TEMP_EVALUATION_HISTORY_PREFIX}อยุธยา`)) : null);

    if (!raw) return null;
    const parsed: TempEvaluationHistory = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.snapshots)) {
      if (parsed.snapshots.length > 5) {
        parsed.snapshots = parsed.snapshots.slice(-5);
      }
      return auditAndRepairHistorySnapshots(parsed);
    }
    return null;
  } catch (e) {
    console.warn('Failed to parse temp evaluation history:', e);
    return null;
  }
}

export function pushTempEvaluationSnapshot(
  province: string = 'ส่วนกลาง',
  snapshot: TempEvaluationSnapshot,
  challengeTopic: string = ''
): TempEvaluationHistory {
  const norm = normalizeProvinceStorageKey(province);
  let history = getTempEvaluationHistory(norm);
  if (!history) {
    history = {
      province: norm,
      challengeTopic: challengeTopic || snapshot.challengeTopic || '',
      snapshots: [],
      lastUpdated: new Date().toISOString()
    };
  }

  history.province = norm;
  history.challengeTopic = challengeTopic || snapshot.challengeTopic || history.challengeTopic;
  history.lastUpdated = new Date().toISOString();

  // Remove existing snapshot with same iteration if already exists (update in-place) or append
  const existingIdx = history.snapshots.findIndex(s => s.iteration === snapshot.iteration);
  if (existingIdx >= 0) {
    history.snapshots[existingIdx] = snapshot;
  } else {
    history.snapshots.push(snapshot);
  }

  // Keep at most 5 latest snapshots (Ring buffer)
  if (history.snapshots.length > 5) {
    history.snapshots = history.snapshots.slice(history.snapshots.length - 5);
  }

  if (typeof window !== 'undefined') {
    try {
      const serialized = JSON.stringify(history);
      sessionStorage.setItem(`${TEMP_EVALUATION_HISTORY_PREFIX}${norm}`, serialized);
      localStorage.setItem(`${TEMP_EVALUATION_HISTORY_PREFIX}${norm}`, serialized);
      if (norm === 'พระนครศรีอยุธยา') {
        sessionStorage.setItem(`${TEMP_EVALUATION_HISTORY_PREFIX}อยุธยา`, serialized);
        localStorage.setItem(`${TEMP_EVALUATION_HISTORY_PREFIX}อยุธยา`, serialized);
      }
      // Backwards compatibility with single snapshot storage
      saveTempEvaluationSnapshot(norm, snapshot);
      if (norm === 'พระนครศรีอยุธยา') {
        saveTempEvaluationSnapshot('อยุธยา', snapshot);
      }
    } catch (e) {
      console.warn('Failed to save temp evaluation history:', e);
    }
  }

  return history;
}

export function clearTempEvaluationHistory(province: string = 'ส่วนกลาง'): void {
  if (typeof window === 'undefined') return;
  try {
    const norm = normalizeProvinceStorageKey(province);
    const keys = [
      `${TEMP_EVALUATION_HISTORY_PREFIX}${norm}`,
      `${TEMP_EVALUATION_HISTORY_PREFIX}${province}`,
      `${TEMP_EVALUATION_STORAGE_PREFIX}${norm}`,
      `${TEMP_EVALUATION_STORAGE_PREFIX}${province}`,
      `${TEMP_EVALUATION_HISTORY_PREFIX}อยุธยา`,
      `${TEMP_EVALUATION_HISTORY_PREFIX}พระนครศรีอยุธยา`,
      `${TEMP_EVALUATION_STORAGE_PREFIX}อยุธยา`,
      `${TEMP_EVALUATION_STORAGE_PREFIX}พระนครศรีอยุธยา`
    ];
    for (const k of keys) {
      sessionStorage.removeItem(k);
      localStorage.removeItem(k);
    }
  } catch (e) {
    console.warn('Failed to clear temp evaluation history:', e);
  }
}

export function getLatestTempSnapshot(province: string = 'ส่วนกลาง'): TempEvaluationSnapshot | null {
  const norm = normalizeProvinceStorageKey(province);
  const history = getTempEvaluationHistory(norm);
  if (history && history.snapshots && history.snapshots.length > 0) {
    return history.snapshots[history.snapshots.length - 1];
  }
  return getTempEvaluationSnapshot(norm);
}

export function getTempEvaluationSnapshot(province: string = 'ส่วนกลาง'): TempEvaluationSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const norm = normalizeProvinceStorageKey(province);
    const raw = sessionStorage.getItem(`${TEMP_EVALUATION_STORAGE_PREFIX}${norm}`)
      || localStorage.getItem(`${TEMP_EVALUATION_STORAGE_PREFIX}${norm}`)
      || sessionStorage.getItem(`${TEMP_EVALUATION_STORAGE_PREFIX}${province}`)
      || localStorage.getItem(`${TEMP_EVALUATION_STORAGE_PREFIX}${province}`)
      || (norm === 'พระนครศรีอยุธยา' ? (sessionStorage.getItem(`${TEMP_EVALUATION_STORAGE_PREFIX}อยุธยา`) || localStorage.getItem(`${TEMP_EVALUATION_STORAGE_PREFIX}อยุธยา`)) : null);

    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse temp evaluation snapshot:', e);
    return null;
  }
}

export function saveTempEvaluationSnapshot(province: string = 'ส่วนกลาง', snapshot: TempEvaluationSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    const norm = normalizeProvinceStorageKey(province);
    const serialized = JSON.stringify(snapshot);
    sessionStorage.setItem(`${TEMP_EVALUATION_STORAGE_PREFIX}${norm}`, serialized);
    localStorage.setItem(`${TEMP_EVALUATION_STORAGE_PREFIX}${norm}`, serialized);
    if (norm === 'พระนครศรีอยุธยา') {
      sessionStorage.setItem(`${TEMP_EVALUATION_STORAGE_PREFIX}อยุธยา`, serialized);
      localStorage.setItem(`${TEMP_EVALUATION_STORAGE_PREFIX}อยุธยา`, serialized);
    }
  } catch (e) {
    console.warn('Failed to save temp evaluation snapshot:', e);
  }
}

export function clearTempEvaluationSnapshot(province: string = 'ส่วนกลาง'): void {
  if (typeof window === 'undefined') return;
  try {
    const norm = normalizeProvinceStorageKey(province);
    const keys = [
      `${TEMP_EVALUATION_STORAGE_PREFIX}${norm}`,
      `${TEMP_EVALUATION_STORAGE_PREFIX}${province}`,
      `${TEMP_EVALUATION_STORAGE_PREFIX}อยุธยา`,
      `${TEMP_EVALUATION_STORAGE_PREFIX}พระนครศรีอยุธยา`
    ];
    for (const k of keys) {
      sessionStorage.removeItem(k);
      localStorage.removeItem(k);
    }
  } catch (e) {
    console.warn('Failed to clear temp evaluation snapshot:', e);
  }
}

export type MoralVirtueKey = 'sufficiency' | 'discipline' | 'honesty' | 'volunteer' | 'gratitude';

export interface StandoutVirtueDetail {
  key: MoralVirtueKey;
  name: string; // 'พอเพียง' | 'วินัยรับผิดชอบ' | 'สุจริต' | 'จิตอาสา' | 'กตัญญู'
  title: string; // เช่น 'ด้านพอเพียง (Sufficiency & Resilience)'
  subtitle: string; // คำอธิบายสรุปแก่น
  iconName: 'Sprout' | 'ShieldCheck' | 'Scale' | 'HeartHandshake' | 'Heart';
  score: number; // คะแนนความโดดเด่น (0.00 - 100.00)
  isStandout: boolean; // เป็นจุดเด่นเป็นพิเศษของโครงการหรือไม่
  level: 'โดดเด่นมากเป็นพิเศษ' | 'โดดเด่นเป็นพิเศษ' | 'มีส่วนร่วมเชิงพฤติกรรม' | 'ควรส่งเสริมเพิ่มเติม';
  color: string;
  bgLight: string;
  borderColor: string;
  badgeEmoji: string;
  highlightReason: string; // เหตุผลเชิงพฤติกรรมว่าทำไมโครงการนี้จึงโดดเด่นในด้านนี้
  evidenceSnippets: string[]; // ประโยคหรือคีย์เวิร์ดพฤติกรรมที่พบในข้อเสนอโครงการ
  coreDriver: string; // ตัวขับเคลื่อนหลักสั้นๆ
}

export interface MoralVirtuesHighlightAnalysis {
  topStandoutVirtues: StandoutVirtueDetail[]; // จุดเด่น 1-2 ด้านเป็นพิเศษ
  allVirtuesBreakdown: StandoutVirtueDetail[]; // ครบทั้ง 5 ด้านเรียงตามลำดับคะแนน
  overallVirtueStrengthSummary: string; // สรุปจุดเด่นคุณธรรมของโครงการในภาพรวม
  primaryVirtueName: string; // ด้านที่เด่นที่สุด
}

export interface PreSubmissionEvaluationResult {
  finalScore: number; // ทศนิยมสองตำแหน่ง (0.00 - 100.00)
  rawScore?: number;  // คะแนนประเมินดิบตามเกณฑ์ Rubric ก่อนหัก
  checkCount?: number; // จำนวนครั้งที่กดตรวจสอบก่อนส่ง
  penaltyPoints?: number; // คะแนนที่ถูกหักจากการกดตรวจมากกว่า 1 ครั้ง
  penaltyFormula?: string; // สูตรการคำนวณ { คะแนน final = ตรวจ - (จำนวนครั้ง - 1) }
  isDuplicateSubmitter?: boolean; // ผู้ส่งเคยส่งโครงการแล้วหรือไม่
  existingProjectName?: string; // ชื่อโครงการที่เคยส่งแล้ว
  qualityTier: 'ดีเลิศ' | 'ดี' | 'พอใช้' | 'ไม่ผ่าน';
  challengeTopic: string;
  selectedVirtueNames: string[];
  evaluatedDimensions: EvaluatedDimensionDetail[];
  markdownPromptSent: string;
  comparativeContext: ComparativeEvaluationContext;
  averageCalculationFormula?: string; // คำอธิบายสูตรคำนวณคะแนนเฉลี่ยเป็น 100 คะแนน
  isUnmodifiedAiDraft?: boolean; // ตรวจพบเป็นข้อเสนอฉบับร่างจาก AI โดยยังไม่มีการปรับปรุงเพิ่มโดยมนุษย์ (คะแนนอยู่ในช่วง 60 - 80)
  humanContributionScore?: number; // ระดับการมีส่วนร่วมและปรับปรุงโดยมนุษย์ (0 - 100)
  aiDraftNote?: string; // ข้อความแจ้งเตือนสถานะร่างตั้งต้นและการแนะนำปรับปรุงเพิ่ม
  iteration?: number; // รอบการตรวจสอบ (1, 2, 3...)
  previousScore?: number; // คะแนนรอบก่อนหน้าจาก Temp File
  scoreDelta?: number; // ส่วนต่างคะแนนเทียบกับรอบก่อนหน้า (+X.XX / -X.XX / 0.00)
  progressionSummary?: string; // สรุปพัฒนาการเปรียบเทียบกับรอบก่อนหน้า
  previousSnapshot?: TempEvaluationSnapshot; // ข้อมูล Temp File ฉบับก่อนหน้าที่นำมาเปรียบเทียบ
  historySnapshots?: TempEvaluationSnapshot[]; // ประวัติย้อนหลัง 5 ครั้งล่าสุด
  diffAnalysis?: ProposalDiffAnalysis; // ผลวิเคราะห์ความแตกต่างเชิงโครงสร้างและเนื้อหา
  feasibilityAssessment?: ProjectFeasibilityAssessment; // ผลการตรวจสอบความเป็นไปได้และความสมจริงของโครงการ (ตัดคะแนนอย่างน้อย 20 คะแนนหากพบข้อบกพร่อง)
  baseSnapshotIteration?: number; // ครั้งที่ของ snapshot ตัวตั้งต้นที่โครงสร้างเหมือนกับโครงการนี้มากที่สุดในประวัติ 5 ครั้งล่าสุด
  baseSnapshotScore?: number; // คะแนนของ snapshot ตัวตั้งต้น
  baseSnapshotSimilarity?: number; // ระดับความเหมือนกับโครงการตัวตั้งต้น (0.00 - 1.00)
  standoutVirtueAnalysis?: MoralVirtuesHighlightAnalysis; // ผลวิเคราะห์จุดเด่นในดัชนีคุณธรรม 5 ด้าน (โดดเด่นเป็นพิเศษ) แสดงด้านบนสุดควบคู่คะแนน
  evaluationSource?: 'openrouter_ai' | 'deterministic_engine'; // แหล่งที่มาของการตรวจประเมินผลคะแนน
  modelName?: string; // ชื่อโมเดล AI ที่ใช้ประเมินผล (เช่น openai/gpt-4o-mini)
  openRouterLatencyMs?: number; // ความเร็ว latency ที่ใช้ในการประเมินผลผ่าน OpenRouter (ms)
  openRouterErrorReason?: string; // เหตุผลหรือข้อผิดพลาดกรณีที่ OpenRouter ไม่ทำงานหรือสลับไปใช้ Local Engine
}

export const VIRTUE_KEY_NAME_MAP: Record<string, { key: string; name: string; title: string }> = {
  'วินัย': { key: 'discipline', name: 'วินัยรับผิดชอบ', title: 'ด้านที่ 1: ด้านวินัยรับผิดชอบ (Discipline & Responsibility)' },
  'วินัยรับผิดชอบ': { key: 'discipline', name: 'วินัยรับผิดชอบ', title: 'ด้านที่ 1: ด้านวินัยรับผิดชอบ (Discipline & Responsibility)' },
  'ด้านวินัย': { key: 'discipline', name: 'วินัยรับผิดชอบ', title: 'ด้านที่ 1: ด้านวินัยรับผิดชอบ (Discipline & Responsibility)' },
  'ด้านวินัยรับผิดชอบ': { key: 'discipline', name: 'วินัยรับผิดชอบ', title: 'ด้านที่ 1: ด้านวินัยรับผิดชอบ (Discipline & Responsibility)' },
  'สุจริต': { key: 'honesty', name: 'สุจริต', title: 'ด้านที่ 2: ด้านความสุจริต/ศีลธรรม (Integrity, Ethics & Transparency)' },
  'ความสุจริต': { key: 'honesty', name: 'สุจริต', title: 'ด้านที่ 2: ด้านความสุจริต/ศีลธรรม (Integrity, Ethics & Transparency)' },
  'ด้านสุจริต': { key: 'honesty', name: 'สุจริต', title: 'ด้านที่ 2: ด้านความสุจริต/ศีลธรรม (Integrity, Ethics & Transparency)' },
  'ด้านความสุจริต': { key: 'honesty', name: 'สุจริต', title: 'ด้านที่ 2: ด้านความสุจริต/ศีลธรรม (Integrity, Ethics & Transparency)' },
  'จิตอาสา': { key: 'volunteer', name: 'จิตอาสา', title: 'ด้านที่ 3: ด้านจิตอาสา (Public Mind & Prosocial Action)' },
  'ด้านจิตอาสา': { key: 'volunteer', name: 'จิตอาสา', title: 'ด้านที่ 3: ด้านจิตอาสา (Public Mind & Prosocial Action)' },
  'กตัญญู': { key: 'gratitude', name: 'กตัญญู', title: 'ด้านที่ 4: ด้านความกตัญญู/การเกื้อกูล (Gratitude & Stakeholder Care)' },
  'ความกตัญญู': { key: 'gratitude', name: 'กตัญญู', title: 'ด้านที่ 4: ด้านความกตัญญู/การเกื้อกูล (Gratitude & Stakeholder Care)' },
  'ด้านกตัญญู': { key: 'gratitude', name: 'กตัญญู', title: 'ด้านที่ 4: ด้านความกตัญญู/การเกื้อกูล (Gratitude & Stakeholder Care)' },
  'ด้านความกตัญญู': { key: 'gratitude', name: 'กตัญญู', title: 'ด้านที่ 4: ด้านความกตัญญู/การเกื้อกูล (Gratitude & Stakeholder Care)' },
  'พอเพียง': { key: 'sufficiency', name: 'พอเพียง', title: 'ด้านที่ 5: ด้านความพอเพียง/ภูมิคุ้มกัน (Sufficiency & Resilience)' },
  'ความพอเพียง': { key: 'sufficiency', name: 'พอเพียง', title: 'ด้านที่ 5: ด้านความพอเพียง/ภูมิคุ้มกัน (Sufficiency & Resilience)' },
  'ด้านพอเพียง': { key: 'sufficiency', name: 'พอเพียง', title: 'ด้านที่ 5: ด้านความพอเพียง/ภูมิคุ้มกัน (Sufficiency & Resilience)' },
  'ด้านความพอเพียง': { key: 'sufficiency', name: 'พอเพียง', title: 'ด้านที่ 5: ด้านความพอเพียง/ภูมิคุ้มกัน (Sufficiency & Resilience)' }
};

// ----------------------------------------------------------------------------
// ฐานข้อมูลสถิติประชากรและครัวเรือนจริงรายจังหวัด (Province Demographics Registry)
// ใช้สำหรับตรวจสอบความสมเหตุสมผลของสเกลกลุ่มเป้าหมายในโครงการนำร่องเชิงพฤติกรรม
// ครอบคลุมทั้ง 77 จังหวัดทั่วไทย และระดับประเทศไทย
// ----------------------------------------------------------------------------
import {
  type ProvinceDemographics,
  THAILAND_NATIONAL_DEMOGRAPHICS,
  THAILAND_77_PROVINCES_DEMOGRAPHICS,
  getProvinceDemographics
} from './thailandProvinceDemographics';

export type { ProvinceDemographics };
export {
  THAILAND_NATIONAL_DEMOGRAPHICS,
  THAILAND_77_PROVINCES_DEMOGRAPHICS,
  getProvinceDemographics
};

export const PROVINCE_DEMOGRAPHICS_REGISTRY = THAILAND_77_PROVINCES_DEMOGRAPHICS;
export const DEFAULT_PROVINCE_DEMOGRAPHICS = THAILAND_NATIONAL_DEMOGRAPHICS;

/**
 * ฟังก์ชันช่วยดึงตัวเลขและหน่วยนับจากข้อความภาษาไทย
 * รองรับทั้งตัวเลขธรรมดา (เช่น 400,000 หรือ 400000) และตัวเลขภาษาพูด (เช่น 4 แสน, 1 ล้าน, 1.5 ล้าน)
 */
function parseNumericCountFromText(text: string, unitRegex: RegExp): { raw: string; count: number } | null {
  if (!text) return null;
  const pattern = new RegExp(`(?:(\\d+(?:\\.\\d+)?)\\s*(แสน|ล้าน)|(\\d[\\d,]*))\\s*${unitRegex.source}`, 'i');
  const match = text.match(pattern);
  if (!match) return null;

  const raw = match[0];
  if (match[1] && match[2]) {
    const numBase = parseFloat(match[1]);
    const multiplier = match[2] === 'ล้าน' ? 1000000 : 100000;
    return { raw, count: Math.round(numBase * multiplier) };
  }
  if (match[3]) {
    const num = parseInt(match[3].replace(/,/g, ''), 10);
    return { raw, count: num };
  }
  return null;
}

/**
 * ฟังก์ชันตรวจสอบความเป็นไปได้และความสมจริงของโครงการ (Project Feasibility & Realism Assessment)
 * สื่อสารด้วย "ภาษาคนพูด" เข้าใจง่าย ชัดเจน ตรงประเด็น:
 * 1. ตรวจจับเป้าหมายสูงเกินจริง / ปาฏิหาริย์ (เช่น 100%, อุบัติเหตุเป็นศูนย์ถาวร)
 * 2. ตรวจจับกรอบเวลา (เช่น นานเกินไป >= 3 ปี เช่น 10 ปี หรือ สั้นเกินไป < 30 วัน เช่น 1-3 วัน)
 * 3. ตรวจจับกลุ่มเป้าหมายไม่สมเหตุสมผล ครอบคลุมทั้ง 77 จังหวัด และระดับประเทศไทย:
 *    - มากเกินจริง (เกินครัวเรือนหรือประชากรของจังหวัดนั้นๆ หรือของประเทศไทย)
 *    - น้อยเกินจริง (1-5 คน หรือ 1-2 ครัวเรือน ไม่มีประโยชน์หรือความคุ้มค่าที่จะจัดสรรงบประมาณทำโครงการ)
 * ตัดคะแนนอย่างน้อย 20 คะแนน (-20.00 แต้ม) ทันที พร้อมบอกวิธีแก้ตัวเลขให้ได้แต้มคืน
 */
export function assessProjectFeasibility(
  projectData: {
    projectName?: string;
    targetArea?: string;
    targetAudience?: string;
    proposalDetails?: string;
    activityPlan?: string;
    behavioralKpi?: string;
  },
  challengeStatement: string = ''
): ProjectFeasibilityAssessment {
  const issues: FeasibilityIssue[] = [];

  const name = (projectData.projectName || '').trim();
  const audience = (projectData.targetAudience || '').trim();
  const details = (projectData.proposalDetails || '').trim();
  const plan = (projectData.activityPlan || '').trim();
  const kpi = (projectData.behavioralKpi || '').trim();
  const targetArea = (projectData.targetArea || '').replace(/^จ\./, '').trim();

  const fullText = `${name} ${targetArea} ${audience} ${details} ${plan} ${kpi}`;

  // ค้นหาข้อมูลสถิติของจังหวัดหรือระดับประเทศไทยจากฐานข้อมูล 77 จังหวัด + ทั่วประเทศ
  const provinceDemo = getProvinceDemographics(targetArea, fullText);
  const isNational = Boolean(provinceDemo.isNational);
  const locationLabel = isNational ? 'ประเทศไทย' : `จังหวัด${provinceDemo.name}`;

  // --------------------------------------------------------------------------
  // มิติที่ 1: ตรวจจับเป้าหมายสูงเกินจริง / ปาฏิหาริย์ 100% (Overambitious / Miracle Targets)
  // --------------------------------------------------------------------------
  const target100Regex = /(?:ลดลง|เลิก|สำเร็จ|หายไป|หมดสิ้น|แก้ไข|ร่วมมือ|ปรับเปลี่ยน|มีวินัย|เคารพกฎ|ไม่มี|หยุด|ป้องกัน).*?(?:100%|ร้อยละ\s*100|100\s*เปอร์เซ็นต์)|(?:100%|ร้อยละ\s*100|100\s*เปอร์เซ็นต์).*?(?:เลิก|ลดลง|หมดสิ้น|สำเร็จ|ทุกคน|เด็ดขาด|ทั้งหมด|ถาวร|ให้ความร่วมมือ)|(?:ทุกคน\s*100%|ได้ผล\s*100%|สัมฤทธิ์ผล\s*100%|ไม่ทำผิดกฎ\s*100%|พฤติกรรมดี\s*100%)/i;
  const kpi100Regex = /(?:\b100%|ร้อยละ\s*100|100\s*เปอร์เซ็นต์)(?!\s*(?:คน|ครัวเรือน|หลัง|ราย|บาท|ชิ้น|แห่ง))/i;
  const miracleRegex = /(?:อุบัติเหตุเป็นศูนย์|อุบัติเหตุ\s*0\s*ราย|ตายเป็นศูนย์|เสียชีวิต\s*0\s*ราย|ศูนย์รายถาวร|ไม่มีอุบัติเหตุเลยแม้แต่รายเดียว|หมดสิ้นเชิง|ทุกคนเลิกพนัน|ไม่มีใครเล่นการพนันอีกต่อไป|ปราศจากการทุจริตอย่างสิ้นเชิง|หายจนทุกคน|แก้ปัญหาน้ำท่วมหมดทั้งจังหวัดอย่างสิ้นเชิงทันที|ไร้ขยะ\s*100%|ปราศจากขยะ\s*100%|ไม่มีการทำผิดกฎเลย|เลิกทำผิดกฎหมายทันที|ศูนย์เปอร์เซ็นต์ถาวร)/i;

  let matchedTargetText = '';
  const matchT3 = fullText.match(miracleRegex);
  const matchT1 = fullText.match(target100Regex);
  const matchT2 = kpi.match(kpi100Regex);

  if (matchT3) {
    matchedTargetText = matchT3[0];
  } else if (matchT1) {
    matchedTargetText = matchT1[0];
  } else if (matchT2) {
    matchedTargetText = matchT2[0];
  }

  if (matchedTargetText) {
    issues.push({
      type: 'unrealistic_target',
      severity: 'high',
      title: 'ตั้งเป้าหมายผลลัพธ์ 100% ซึ่งมนุษย์ทำไม่ได้จริง',
      description: `คุณตั้งเป้าหมายผลลัพธ์ว่าจะลดปัญหาหรือเปลี่ยนพฤติกรรมได้ "${matchedTargetText.trim()}" ในโลกความเป็นจริงพฤติกรรมมนุษย์มีความซับซ้อนและมีปัจจัยแวดล้อมมากมาย ไม่มีทางที่คนทุกคน 100% จะปรับเปลี่ยนได้ทั้งหมด การตั้งเป้าหมาย 100% ทำให้โครงการดูเพ้อฝันและกรรมการจะมองว่าขาดความเข้าใจเชิงพฤติกรรมศาสตร์ครับ`,
      detectedText: matchedTargetText.trim(),
      recommendation: 'ลองปรับเป้าหมายความสำเร็จลงมาให้อยู่ในระดับที่ท้าทายแต่ทำได้จริง เช่น ลดลง 40% - 70% หรือวัดจากการมีส่วนร่วมอย่างต่อเนื่องของกลุ่มแกนนำ แค่นี้ก็จะสมเหตุสมผลและได้รับคะแนน 20 แต้มกลับคืนมาครับ'
    });
  }

  // --------------------------------------------------------------------------
  // มิติที่ 2: ตรวจจับกรอบเวลา (Timeline Infeasibility: นานเกินไป >= 3 ปี / สั้นเกินไป < 30 วัน)
  // --------------------------------------------------------------------------
  // ตรวจจับกรอบเวลายาวเกินไป (>= 3 ปีขึ้นไป เช่น 3 ปี, 5 ปี, 10 ปี, 20 ปี)
  // ไม่รวมปี พ.ศ. (เช่น 2567, 2568, 2569) หรือ ค.ศ. (เช่น 2025, 2026)
  const longTimelineRegex = /(?:ระยะเวลา|กรอบเวลา|ใช้เวลา|ดำเนินงาน|ภายใน|เป้าหมาย|ผลลัพธ์|โครงการ|แผนงาน|มีกำหนด|ระยะยาว|คาดว่า|ระหว่าง)?\s*(?:ที่คาดว่าจะได้รับ)?\s*(?:โครงการ)?\s*(?:ระยะยาว)?\s*(?:ใน|ระหว่าง)?\s*(?<!\d)(?:[3-9]|\d{2,})\s*(?:ปี|ขวบ|years?|yrs?)(?!\s*(?:พ\.ศ\.|ค\.ศ\.|25\d{2}|20\d{2}))|(?:แผน\s*(?:[3-9]|\d{2,})\s*ปี)|(?:ระยะยาว\s*[3-9]-\d+\s*ปี)/i;

  // ตรวจจับกรอบเวลาสั้นเกินไป (< 30 วัน เช่น 1-14 วัน, 1-2 สัปดาห์) หรืออ้างผลลัพธ์ในเวลาไม่กี่วัน
  const shortTimelineRegex = /(?:ระยะเวลา|กรอบเวลา|ใช้เวลา|ดำเนินงาน|ภายใน|เสร็จใน|จบใน|มีกำหนด|ทำให้ดีขึ้น|เห็นผล|ได้ผล|สำเร็จ|ผลลัพธ์|แก้ปัญหา|ลดปัญหา|ปรับเปลี่ยน)?\s*(?:โครงการ)?\s*(?:ใน)?\s*(?:เพียงแค่|เพียง)?\s*([1-9]|[12]\d)\s*วัน|(?:ระยะเวลา|กรอบเวลา|ใช้เวลา|ดำเนินงาน|ภายใน)?\s*(?:โครงการ)?\s*(?:ใน)?\s*([1-3])\s*(?:สัปดาห์|อาทิตย์)|(?:ชั่วข้ามคืน|3\s*วันจบ|เสร็จใน\s*1\s*วัน|แก้ปัญหาได้ใน\s*1\s*สัปดาห์|เสร็จสิ้นใน\s*3\s*วัน|1-3\s*วัน|2-3\s*วัน|3-5\s*วัน|1-7\s*วัน|ไม่กี่วัน)/i;

  let matchedTimelineText = '';
  let isTooShort = false;
  let isTooLong = false;

  const matchShort = kpi.match(shortTimelineRegex) || plan.match(shortTimelineRegex) || details.match(shortTimelineRegex) || name.match(shortTimelineRegex) || fullText.match(shortTimelineRegex);
  const matchLong = plan.match(longTimelineRegex) || details.match(longTimelineRegex) || kpi.match(longTimelineRegex) || fullText.match(longTimelineRegex);

  if (matchShort) {
    matchedTimelineText = matchShort[0];
    isTooShort = true;
  } else if (matchLong) {
    const numInMatch = parseInt(matchLong[0].replace(/[^\d]/g, ''), 10);
    if (!isNaN(numInMatch) && numInMatch >= 2000 && numInMatch <= 2600) {
      // เป็นปี พ.ศ. หรือ ค.ศ. ไม่ใช่จำนวนปีของโครงการ
    } else {
      matchedTimelineText = matchLong[0];
      isTooLong = true;
    }
  }

  if (matchedTimelineText) {
    if (isTooShort) {
      issues.push({
        type: 'unrealistic_timeline',
        severity: 'high',
        title: 'ผลลัพธ์หรือระยะเวลาสั้นเกินจริง ไม่สามารถปรับเปลี่ยนพฤติกรรมมนุษย์ได้ในไม่กี่วัน',
        description: `คุณระบุว่าจะสร้างผลลัพธ์หรือปรับเปลี่ยนพฤติกรรมได้ "${matchedTimelineText.trim()}" ในทางพฤติกรรมศาสตร์ การสร้างนิสัยและการปรับเปลี่ยนพฤติกรรมของคนในชุมชน (เช่น การคัดแยกขยะ วินัยจราจร หรือการลดละเลิกอบายมุข) ไม่สามารถสำเร็จได้ในเวลาเพียงไม่กี่วัน การจัดกิจกรรมสั้นๆ แค่นี้จะเป็นแค่งานอีเวนต์ชั่วคราวจัดแล้วเลิกรากันไป ไม่เกิดการปรับเปลี่ยนพฤติกรรมที่ยั่งยืน`,
        detectedText: matchedTimelineText.trim(),
        recommendation: 'ควรขยายเวลาดำเนินงานและติดตามผลเป็น 3 - 6 เดือน หรือ 1 ปี เพื่อให้คนในชุมชนค่อยๆ ฝึกสร้างนิสัยใหม่ มีกิจกรรมกระตุ้นต่อเนื่อง และมีกลไกเพื่อนช่วยเตือนเพื่อน จะได้คะแนน 20 แต้มกลับคืนมาครับ'
      });
    } else if (isTooLong) {
      issues.push({
        type: 'unrealistic_timeline',
        severity: 'high',
        title: 'ระยะเวลายาวเกินไปสำหรับโครงการนำร่อง',
        description: `คุณตั้งกรอบเวลาไว้ถึง "${matchedTimelineText.trim()}" โครงการนี้เป็นการแข่งขันแฮกกาธอนที่ต้องการทดสอบนวัตกรรมนำร่องเพื่อดูว่าปรับพฤติกรรมคนในชุมชนได้จริงไหม ซึ่งควรเห็นผลเบื้องต้นใน 6 เดือน ถึง 1 ปี การตั้งเวลายาวหลายปีถือเป็นแผนยุทธศาสตร์ชาติระยะยาวเกินไป ทำให้วัดผลความสำเร็จขั้นแรกไม่ได้และติดตามผลไม่ทันครับ`,
        detectedText: matchedTimelineText.trim(),
        recommendation: 'ปรับระยะเวลาโครงการให้กระชับลงเหลือ 6 เดือน หรือ 1 ปี (หรือระบุเป็น "ระยะนำร่อง 6 เดือนแรก") ก็จะได้คะแนน 20 แต้มกลับคืนมาแล้วครับ'
      });
    }
  }

  // --------------------------------------------------------------------------
  // มิติที่ 3: ตรวจจับกลุ่มเป้าหมายไม่สมเหตุสมผล (ทั้ง 77 จังหวัด และ ประเทศไทย)
  // ทั้งกรณีมากเกินจริง (Over-scale) และน้อยเกินจริง (Insignificant / Tiny)
  // --------------------------------------------------------------------------
  const householdData = parseNumericCountFromText(audience, /(?:ครัวเรือน|หลังคาเรือน|ครอบครัว|หลัง)/)
    || parseNumericCountFromText(fullText, /(?:ครัวเรือน|หลังคาเรือน|ครอบครัว|หลัง)/);
  const peopleData = parseNumericCountFromText(audience, /(?:คน|ราย|ท่าน|ประชากร|ประชาชน)/)
    || parseNumericCountFromText(fullText, /(?:คน|ราย|ท่าน|ประชากร|ประชาชน)/);

  // ตรวจจับกลุ่มเป้าหมายน้อยเกินไป (1-5 คน หรือ 1-2 ครัวเรือน)
  const isTinyAudience = /^(?:ชาวบ้าน|ประชาชน|เยาวชน|คนในบ้าน|ผู้เข้าร่วม|กลุ่มเป้าหมาย|จำนวน)?\s*([1-5])\s*คน$/i.test(audience)
    || /^(?:ชาวบ้าน|ประชาชน|เยาวชน|คนในบ้าน|ผู้เข้าร่วม|กลุ่มเป้าหมาย|จำนวน)?\s*([1-2])\s*(?:ครัวเรือน|หลัง|ครอบครัว)$/i.test(audience);
  const tinyAudienceMatch = fullText.match(/(?:กลุ่มเป้าหมาย|จำนวนผู้เข้าร่วม|ประชากรเป้าหมาย|ผู้เข้าร่วม)\s*(?:เพียง\s*)?([1-5])\s*คน(?:\s|$|[^\d])|(?:ชาวบ้าน\s*[1-5]\s*คน|คนในบ้าน\s*[1-5]\s*คน|ไม่เกิน\s*5\s*คน|1-3\s*คน|2-3\s*คน|3-5\s*คน|1-5\s*คน|1-2\s*(?:ครัวเรือน|หลัง|ครอบครัว))/i);
  const isParsedTinyPeople = Boolean(peopleData && peopleData.count > 0 && peopleData.count <= 5 && (audience.includes(String(peopleData.count)) || fullText.includes(`เป้าหมาย ${peopleData.raw}`) || fullText.includes(`เป้าหมาย: ${peopleData.raw}`) || fullText.includes(`ผู้เข้าร่วม ${peopleData.raw}`)));
  const isParsedTinyHouseholds = Boolean(householdData && householdData.count > 0 && householdData.count <= 2 && (audience.includes(String(householdData.count)) || fullText.includes(`เป้าหมาย ${householdData.raw}`) || fullText.includes(`เป้าหมาย: ${householdData.raw}`)));

  // ตรวจจับคำทั่วไปที่ระบุเกินขนาดจังหวัด/ประเทศ
  const overInflatedGeneralRegex = /(?:1,000,000|1\s*ล้าน|ล้านคน|คนทั้งประเทศ|ประชาชนทั้งประเทศ|ทุกคนในประเทศ|คนทั้งจังหวัด\s*100%|ประชาชนทั้งจังหวัดทุกคน|ประชากรทั้งประเทศ)/i;
  const matchGeneralOver = audience.match(overInflatedGeneralRegex) || details.match(overInflatedGeneralRegex) || kpi.match(overInflatedGeneralRegex);

  if (householdData && householdData.count > provinceDemo.households) {
    // กรณีที่ 1: ตั้งจำนวนครัวเรือนมากกว่าครัวเรือนที่มีอยู่จริงในพื้นที่ (เช่น 400,000 ครัวเรือน ในอยุธยา หรือ 30 ล้านครัวเรือน ในไทย)
    const areaTitle = isNational ? 'ทั้งประเทศไทย' : `ทั้งจังหวัด${provinceDemo.name}`;
    const desc = isNational
      ? `คุณระบุกลุ่มเป้าหมาย ${householdData.count.toLocaleString()} ครัวเรือน แต่ในความเป็นจริงทั้งประเทศไทยมีอยู่ประมาณ ${provinceDemo.households.toLocaleString()} ครัวเรือนเท่านั้น (~28.45 ล้านครัวเรือน) การตั้งกลุ่มเป้าหมายมากกว่าครัวเรือนคนทั้งประเทศในโครงการนำร่องจึงไม่มีทางทำได้จริงครับ`
      : `คุณระบุกลุ่มเป้าหมาย ${householdData.count.toLocaleString()} ครัวเรือน แต่ในความเป็นจริงทั้งจังหวัด${provinceDemo.name}มีอยู่แค่ประมาณ ${provinceDemo.households.toLocaleString()} ครัวเรือนเท่านั้น (ประชากรทั้งจังหวัดมีราว ${(provinceDemo.population / 100000).toFixed(1)} แสนคน) การตั้งกลุ่มเป้าหมายมากกว่าคนทั้งจังหวัดในโครงการนำร่องจึงไม่มีทางทำได้จริงในพื้นที่ครับ`;
    const rec = isNational
      ? `ลองปรับลดกลุ่มเป้าหมายให้เป็นกลุ่มนำร่องระดับชาติระยะแรก เช่น 1,000 - ${provinceDemo.maxPilotHouseholds.toLocaleString()} ครัวเรือน หรือเลือกพื้นที่นำร่อง 2-3 จังหวัด แค่นี้ก็จะได้คะแนน 20 แต้มกลับคืนมาทันทีครับ`
      : `ลองปรับลดกลุ่มเป้าหมายให้เป็นกลุ่มนำร่องที่ดูแลได้ทั่วถึง เช่น 300 - ${provinceDemo.maxPilotHouseholds.toLocaleString()} ครัวเรือน หรือเลือกมา 1-2 ชุมชน/ตำบลนำร่อง แค่นี้ก็จะได้คะแนน 20 แต้มกลับคืนมาทันทีครับ`;

    issues.push({
      type: 'unrealistic_audience_scale',
      severity: 'high',
      title: `กลุ่มเป้าหมายเยอะเกินจริง (มากกว่าจำนวนครัวเรือน${areaTitle})`,
      description: desc,
      detectedText: householdData.raw.trim(),
      recommendation: rec
    });
  } else if (householdData && ((!isNational && householdData.count > 15000) || (isNational && householdData.count > 30000))) {
    // กรณีที่ 2: จำนวนครัวเรือนระดับหลายหมื่นครัวเรือน ใหญ่เกินศักยภาพโครงการนำร่อง
    const scopeLabel = isNational ? 'ระดับประเทศ' : 'ระดับจังหวัด';
    issues.push({
      type: 'unrealistic_audience_scale',
      severity: 'high',
      title: `สเกลกลุ่มเป้าหมายใหญ่เกินกว่าจะเป็นโครงการนำร่อง${scopeLabel}`,
      description: `คุณระบุกลุ่มเป้าหมาย ${householdData.count.toLocaleString()} ครัวเรือน ซึ่งมีขนาดใหญ่เกินกว่าศักยภาพของโครงการทดลองนำร่องเชิงพฤติกรรม โดยยังไม่มีกลไกงบประมาณและเจ้าหน้าที่โครงสร้างขนาดใหญ่รองรับ`,
      detectedText: householdData.raw.trim(),
      recommendation: `ควรปรับลดสเกลลงมาเป็นกลุ่มนำร่องระยะแรก เช่น 300 - ${provinceDemo.maxPilotHouseholds.toLocaleString()} ครัวเรือน เพื่อทดสอบกลไกให้เห็นผลก่อนขยายผล จะได้รับคะแนน 20 แต้มคืนครับ`
    });
  } else if (peopleData && peopleData.count > provinceDemo.population) {
    // กรณีที่ 3: จำนวนคนมากกว่าประชากรทั้งพื้นที่
    const areaTitle = isNational ? 'ทั้งประเทศไทย' : `ทั้งจังหวัด${provinceDemo.name}`;
    const desc = isNational
      ? `คุณระบุกลุ่มเป้าหมาย ${peopleData.count.toLocaleString()} คน แต่ทั้งประเทศไทยมีประชากรอยู่จริงเพียงประมาณ ${provinceDemo.population.toLocaleString()} คนเท่านั้น (~66 ล้านคน) การตั้งเป้าหมายครอบคลุมเกินประชากรทั้งประเทศจึงเป็นไปไม่ได้ในความเป็นจริงครับ`
      : `คุณระบุกลุ่มเป้าหมาย ${peopleData.count.toLocaleString()} คน แต่ทั้งจังหวัด${provinceDemo.name}มีประชากรอยู่จริงเพียงประมาณ ${provinceDemo.population.toLocaleString()} คนเท่านั้น การตั้งเป้าหมายครอบคลุมเกินประชากรทั้งจังหวัดจึงเป็นไปไม่ได้ในความเป็นจริงครับ`;
    const rec = isNational
      ? `ลองปรับลดกลุ่มเป้าหมายให้เป็นกลุ่มนำร่อง เช่น 2,000 - ${provinceDemo.maxPilotAudience.toLocaleString()} คน เพื่อให้สามารถกำกับติดตามและวัดผลได้อย่างมีประสิทธิภาพ จะได้คะแนน 20 แต้มคืนครับ`
      : `ลองปรับลดกลุ่มเป้าหมายให้เป็นกลุ่มนำร่อง เช่น 500 - ${provinceDemo.maxPilotAudience.toLocaleString()} คน หรือเลือกกลุ่มเป้าหมายเฉพาะ เช่น เยาวชนใน 2-3 โรงเรียน เพื่อให้ดูแลและวัดผลได้จริง จะได้คะแนน 20 แต้มคืนครับ`;

    issues.push({
      type: 'unrealistic_audience_scale',
      severity: 'high',
      title: `กลุ่มเป้าหมายเยอะเกินจริง (มากกว่าประชากร${areaTitle})`,
      description: desc,
      detectedText: peopleData.raw.trim(),
      recommendation: rec
    });
  } else if (peopleData && ((!isNational && peopleData.count > 40000) || (isNational && peopleData.count > 100000))) {
    // กรณีที่ 4: คนระดับหลายหมื่นคน ใหญ่เกินไปสำหรับนำร่อง
    const scopeLabel = isNational ? 'ระดับประเทศ' : 'ระดับจังหวัด';
    issues.push({
      type: 'unrealistic_audience_scale',
      severity: 'high',
      title: `สเกลกลุ่มเป้าหมายใหญ่เกินกว่าจะเป็นโครงการนำร่อง${scopeLabel}`,
      description: `คุณระบุกลุ่มเป้าหมาย ${peopleData.count.toLocaleString()} คน ซึ่งกว้างเกินขีดความสามารถของโครงการนำร่องเชิงพฤติกรรมในระยะแรก`,
      detectedText: peopleData.raw.trim(),
      recommendation: `ควรปรับลดสเกลลงมาเป็นกลุ่มนำร่องระยะแรก เช่น 500 - ${provinceDemo.maxPilotAudience.toLocaleString()} คน หรือเลือกพื้นที่นำร่อง 1-2 แห่ง เพื่อทดสอบความสำเร็จก่อน จะได้คะแนน 20 แต้มคืนครับ`
    });
  } else if (matchGeneralOver && !isNational) {
    // กรณีที่ 5: คนทั้งประเทศ / ล้านคน ในโครงการระดับจังหวัด
    issues.push({
      type: 'unrealistic_audience_scale',
      severity: 'high',
      title: 'สเกลกลุ่มเป้าหมายเกินจริง (ระดับล้านคน/ทั้งประเทศ ในโครงการระดับจังหวัด)',
      description: `คุณระบุกลุ่มเป้าหมาย "${matchGeneralOver[0].trim()}" ซึ่งเกินขอบเขตทรัพยากรและขีดความสามารถของโครงการนำร่องเชิงพฤติกรรมในระดับพื้นที่ โดยไม่มีโครงสร้างงบประมาณระดับชาติรองรับ`,
      detectedText: matchGeneralOver[0].trim(),
      recommendation: `ควรปรับสเกลกลุ่มเป้าหมายให้สอดคล้องกับบริบทนำร่อง เช่น ชุมชนนำร่อง 1 - 3 แห่ง หรือกลุ่มเป้าหมาย 200 - ${provinceDemo.maxPilotAudience.toLocaleString()} คน เพื่อให้สามารถดูแล ติดตาม และวัดผลพฤติกรรมได้อย่างทั่วถึง จะได้คะแนน 20 แต้มคืนครับ`
    });
  } else if (isTinyAudience || tinyAudienceMatch || isParsedTinyPeople || isParsedTinyHouseholds) {
    // กรณีที่ 6: น้อยเกินจริง ไม่มีประโยชน์ที่จะจัดสรรงบประมาณทำโครงการ (1-5 คน หรือ 1-2 ครัวเรือน)
    const detectedTiny = audience.match(/(?:[1-5]\s*คน|[1-2]\s*(?:ครัวเรือน|หลัง|ครอบครัว))/)?.[0]
      || (peopleData && peopleData.count <= 5 ? peopleData.raw : null)
      || (householdData && householdData.count <= 2 ? householdData.raw : null)
      || tinyAudienceMatch?.[0]
      || audience;

    issues.push({
      type: 'insignificant_impact',
      severity: 'high',
      title: 'กลุ่มเป้าหมายน้อยเกินจริง (ไม่มีประโยชน์ที่จะจัดสรรงบประมาณทำโครงการ)',
      description: `คุณระบุกลุ่มเป้าหมายเพียง "${detectedTiny.trim()}" ซึ่งน้อยเกินจริงมากสำหรับการทำโครงการระดับชุมชนหรือสังคม การเปลี่ยนนิสัยคนเพียงไม่กี่คนแทบไม่สร้างการเปลี่ยนแปลงในระดับโครงสร้างหรือชุมชน และไม่มีความคุ้มค่าหรือประโยชน์ที่จะจัดสรรงบประมาณทำโครงการครับ`,
      detectedText: detectedTiny.trim(),
      recommendation: 'ควรขยายกลุ่มเป้าหมายให้ครอบคลุมอย่างน้อย 30 - 100 คนขึ้นไป (หรือ 10 - 30 ครัวเรือน) เช่น แกนนำเยาวชนในโรงเรียน ชุมชน 1 คุ้มบ้าน หรือกลุ่มวิสาหกิจชุมชน เพื่อสร้างพลังการมีส่วนร่วมและให้เกิดผลลัพธ์ที่คุ้มค่าต่อสังคม จะได้รับคะแนน 20 แต้มคืนครับ'
    });
  }

  // --------------------------------------------------------------------------
  // การตัดคะแนนอย่างน้อย 20 คะแนน (-20.00 คะแนน) เมื่อพบข้อบกพร่อง
  // --------------------------------------------------------------------------
  const isFeasible = issues.length === 0;
  let penaltyScore = 0;
  if (!isFeasible) {
    if (issues.length === 1) {
      penaltyScore = 20.00;
    } else if (issues.length === 2) {
      penaltyScore = 22.50;
    } else {
      penaltyScore = 25.00;
    }
  }

  const feasibilityBadgeText = isFeasible
    ? '✓ โครงการสมเหตุสมผล ทำได้จริง'
    : `⚠️ ไม่ผ่านเกณฑ์ความเป็นไปได้จริง (หัก ${penaltyScore.toFixed(2)} แต้ม)`;

  const feasibilitySummary = isFeasible
    ? `โครงการผ่านเกณฑ์การพิจารณาความเป็นไปได้จริงในพื้นที่${locationLabel} กำหนดกลุ่มเป้าหมาย กรอบเวลา และตัวชี้วัดเหมาะสมกับโครงการนำร่อง (ไม่มีการตัดคะแนน)`
    : `โครงการนี้ถูกตัดคะแนนอย่างน้อย ${penaltyScore.toFixed(2)} คะแนน เนื่องจากตรวจพบเงื่อนไขที่ไม่สามารถทำได้จริงในพื้นที่${locationLabel}: ${issues.map(i => i.title).join(', ')}`;

  return {
    isFeasible,
    penaltyScore,
    issues,
    feasibilityBadgeText,
    feasibilitySummary
  };
}

export function computeProjectProposalDiff(
  current: {
    projectName: string;
    proposalDetails: string;
    activityPlan: string;
    behavioralKpi?: string;
    targetAudience?: string;
  },
  previous: {
    projectName: string;
    proposalDetails: string;
    activityPlan: string;
    behavioralKpi?: string;
    targetAudience?: string;
  },
  challengeStatement: string = '',
  currentIteration: number = 2,
  previousIteration: number = 1
): ProposalDiffAnalysis {
  const positiveDiffs: DiffDetailItem[] = [];
  const negativeDiffs: DiffDetailItem[] = [];
  const neutralDiffs: DiffDetailItem[] = [];

  const pillarDeltas: Record<'challenge_fit' | 'creative_nudge' | 'actionability' | 'expected_impact', number> = {
    challenge_fit: 0,
    creative_nudge: 0,
    actionability: 0,
    expected_impact: 0
  };

  const currName = (current.projectName || '').trim();
  const prevName = (previous.projectName || '').trim();
  const currDetails = (current.proposalDetails || '').trim();
  const prevDetails = (previous.proposalDetails || '').trim();
  const currPlan = (current.activityPlan || '').trim();
  const prevPlan = (previous.activityPlan || '').trim();
  const currKpi = (current.behavioralKpi || '').trim();
  const prevKpi = (previous.behavioralKpi || '').trim();
  const currAudience = (current.targetAudience || '').trim();
  const prevAudience = (previous.targetAudience || '').trim();

  // 0. ตรวจสอบความเหมือน 100% ทุกตัวอักษร
  const isIdentical = currName === prevName &&
    currDetails === prevDetails &&
    currPlan === prevPlan &&
    currKpi === prevKpi &&
    currAudience === prevAudience;

  if (isIdentical) {
    return {
      previousIteration,
      currentIteration,
      totalDelta: 0,
      pillarDeltas,
      summaryText: `⚖️ ข้อเสนอโครงการเหมือนกับรอบที่ ${previousIteration} ทุกประการ (ไม่มีการแก้ไขเนื้อหา)`,
      positiveDiffs,
      negativeDiffs,
      neutralDiffs,
      isIdentical: true
    };
  }

  // 0.1 วิเคราะห์การเปลี่ยนแปลงด้านความสมจริงและความเป็นไปได้ (Feasibility & Realism Transition Analysis)
  const prevFeas = assessProjectFeasibility(previous, challengeStatement);
  const currFeas = assessProjectFeasibility(current, challengeStatement);

  if (!prevFeas.isFeasible && currFeas.isFeasible) {
    // ผู้ใช้ปรับแก้โครงการจนผ่านเกณฑ์ความเป็นไปได้จริง (Rebound Recovery: ปลดล็อกโทษตัดคะแนน 20+ แต้ม)
    const reboundScore = prevFeas.penaltyScore || 20.00;
    positiveDiffs.push({
      field: 'activityPlan',
      fieldNameThai: 'ความเป็นไปได้และความสมจริง (Project Feasibility)',
      type: 'modified',
      sentiment: 'positive',
      impactDescription: `🎉 คืนคะแนน 20 แต้มให้แล้วครับ! ยอดเยี่ยมมากที่คุณได้ปรับปรุงกรอบเวลาและกลุ่มเป้าหมายให้อยู่ในเกณฑ์ที่ทำได้จริงในพื้นที่แล้ว ระบบจึงปลดล็อกการหักแต้มและคืนคะแนน (+${reboundScore.toFixed(2)} แต้ม) ให้ทันที`,
      targetPillar: 'actionability',
      targetPillarTitle: 'เสาหลักที่ 3: แผนงานและพลังเครือข่ายพื้นที่ (Actionability & Feasibility)',
      scoreDelta: reboundScore,
      matchedKeywords: ['สมเหตุสมผล', 'ทำได้จริง']
    });
    pillarDeltas.actionability += Number((reboundScore * 0.5).toFixed(2));
    pillarDeltas.expected_impact += Number((reboundScore * 0.5).toFixed(2));
  } else if (prevFeas.isFeasible && !currFeas.isFeasible) {
    // ผู้ใช้ปรับแก้จนตกเกณฑ์ความเป็นไปได้จริง (เช่น เปลี่ยนเป็น 10 ปี หรือเป้า 400,000 ครัวเรือน หรือ 1 วัน 3 วัน)
    const penaltyScore = currFeas.penaltyScore || 20.00;
    negativeDiffs.push({
      field: 'activityPlan',
      fieldNameThai: 'ความเป็นไปได้และความสมจริง (Project Feasibility)',
      type: 'modified',
      sentiment: 'negative',
      impactDescription: `⚠️ โดนหัก 20 แต้ม: ตรวจพบว่ามีการปรับเปลี่ยนเงื่อนไขจนขาดความเป็นไปได้จริง (${currFeas.issues.map(i => i.title).join(', ')}) เช่น กำหนดกรอบเวลาสั้น/ยาวเกินไป หรือตั้งกลุ่มเป้าหมายเกินจริง ส่งผลให้ถูกตัดคะแนนทันที -${penaltyScore.toFixed(2)} แต้ม`,
      targetPillar: 'actionability',
      targetPillarTitle: 'เสาหลักที่ 3: แผนงานและพลังเครือข่ายพื้นที่ (Actionability & Feasibility)',
      scoreDelta: -penaltyScore,
      matchedKeywords: ['ไม่สมจริง', 'ตัดคะแนน 20']
    });
    pillarDeltas.actionability -= Number((penaltyScore * 0.5).toFixed(2));
    pillarDeltas.expected_impact -= Number((penaltyScore * 0.5).toFixed(2));
  } else if (!prevFeas.isFeasible && !currFeas.isFeasible) {
    // ยังคงไม่ผ่านเกณฑ์ความเป็นไปได้จริงทั้งสองรอบ
    negativeDiffs.push({
      field: 'activityPlan',
      fieldNameThai: 'ความเป็นไปได้และความสมจริง (Project Feasibility)',
      type: 'modified',
      sentiment: 'negative',
      impactDescription: `⚠️ โครงการยังไม่ผ่านเกณฑ์ความเป็นไปได้จริง (${currFeas.issues.map(i => i.title).join(', ')}): ยังคงถูกตัดคะแนน -${currFeas.penaltyScore.toFixed(2)} แต้มต่อเนื่อง`,
      targetPillar: 'actionability',
      targetPillarTitle: 'เสาหลักที่ 3: แผนงานและพลังเครือข่ายพื้นที่ (Actionability & Feasibility)',
      scoreDelta: 0,
      matchedKeywords: ['ยังไม่ผ่านเกณฑ์ความเป็นไปได้']
    });
  }

  // 1. วิเคราะห์ตัวชี้วัดความสำเร็จและเป้าหมายเชิงปริมาณ (เสาหลักที่ 4: Expected Impact)
  const metricRegex = /(?:\b\d+(?:\.\d+)?%|\bร้อยละ\s*\d+|\bจำนวน\s*\d+|\d+\s*(?:คน|ครัวเรือน|หลังคาเรือน|หลัง|ครอบครัว|หมู่บ้าน|ชุมชน|แห่ง|ครั้ง|โรงเรียน|วัน|สัปดาห์|เดือน|ปี|กิโลกรัม|ตัน|บาท|กลุ่ม))/g;
  const currMetrics = currKpi.match(metricRegex) || [];
  const prevMetrics = prevKpi.match(metricRegex) || [];
  const addedMetrics = currMetrics.filter(m => !prevMetrics.some(pm => pm.trim() === m.trim()));
  const removedMetrics = prevMetrics.filter(pm => !currMetrics.some(cm => cm.trim() === pm.trim()));

  // กรองตัวชี้วัดที่เป็นไปไม่ได้ (เช่น 1 วัน, 3 วัน, 1-3 สัปดาห์, 10 ปี, 100%, 0 ราย)
  // ตัวชี้วัดเหล่านี้ไม่สมเหตุสมผลเชิงพฤติกรรมศาสตร์ จึงต้องไม่นำมาบวกคะแนน
  const impossibleMetricRegex = /(?:[3-9]|\d{2,})\s*ปี|(?:[1-9]|[12]\d)\s*วัน|[1-3]\s*สัปดาห์|100%|ร้อยละ\s*100|0\s*ราย|ไม่กี่วัน/i;
  const validAddedMetrics = addedMetrics.filter(m => !impossibleMetricRegex.test(m));

  if (validAddedMetrics.length > 0) {
    const delta = Math.min(2.20, Number((0.80 + validAddedMetrics.length * 0.40).toFixed(2)));
    pillarDeltas.expected_impact += delta;
    positiveDiffs.push({
      field: 'behavioralKpi',
      fieldNameThai: 'ตัวชี้วัดเชิงพฤติกรรม',
      type: 'added',
      sentiment: 'positive',
      impactDescription: `เพิ่มตัวชี้วัดความสำเร็จและเป้าหมายเชิงปริมาณที่วัดผลได้จริง (${validAddedMetrics.slice(0, 3).join(', ')})`,
      targetPillar: 'expected_impact',
      targetPillarTitle: 'เสาหลักที่ 4: ตัวชี้วัดการเปลี่ยนแปลงพฤติกรรม (Expected Impact)',
      scoreDelta: delta,
      matchedKeywords: validAddedMetrics
    });
  }

  // กรองตัวชี้วัดที่เป็นไปไม่ได้ในอดีต (เช่น 1 วัน, 3 วัน, 10 ปี หรือ 100% หรือเป้าเกินจริง)
  // เพราะการลบตัวเลขที่ไม่สมจริงออก ถือเป็นการแก้ไขข้อบกพร่อง ไม่ใช่การตัดทอนตัวชี้วัดที่ดี
  const filteredRemovedMetrics = removedMetrics.filter(m => {
    if (impossibleMetricRegex.test(m)) return false;
    // หากมีการแทนที่ด้วยหน่วยเดียวกัน (เช่น เปลี่ยน 10 ปี เป็น 1 ปี หรือเปลี่ยนจำนวนครัวเรือน) ให้ถือเป็นการปรับค่า ไม่ใช่การตัดทอน
    const unitMatch = m.match(/(?:ปี|เดือน|สัปดาห์|วัน|คน|ครัวเรือน|หลังคาเรือน)/);
    if (unitMatch && validAddedMetrics.some(am => am.includes(unitMatch[0]))) {
      return false;
    }
    return true;
  });

  if (filteredRemovedMetrics.length > 0 && currKpi.length < prevKpi.length) {
    const delta = Math.min(2.50, Number((1.00 + filteredRemovedMetrics.length * 0.50).toFixed(2)));
    pillarDeltas.expected_impact -= delta;
    negativeDiffs.push({
      field: 'behavioralKpi',
      fieldNameThai: 'ตัวชี้วัดเชิงพฤติกรรม',
      type: 'removed',
      sentiment: 'negative',
      impactDescription: `ตัดทอนเป้าหมายเชิงตัวเลขหรือตัวชี้วัดที่ชัดเจนออก (${filteredRemovedMetrics.slice(0, 3).join(', ')})`,
      targetPillar: 'expected_impact',
      targetPillarTitle: 'เสาหลักที่ 4: ตัวชี้วัดการเปลี่ยนแปลงพฤติกรรม (Expected Impact)',
      scoreDelta: -delta,
      matchedKeywords: filteredRemovedMetrics
    });
  }

  // กรณีลบตัวชี้วัดออกเกือบหมด
  if (prevKpi.length > 40 && currKpi.length < 15) {
    const delta = 2.50;
    pillarDeltas.expected_impact -= delta;
    negativeDiffs.push({
      field: 'behavioralKpi',
      fieldNameThai: 'ตัวชี้วัดเชิงพฤติกรรม',
      type: 'removed',
      sentiment: 'negative',
      impactDescription: 'ลบสาระสำคัญของตัวชี้วัดพฤติกรรมออกไป ส่งผลให้ไม่สามารถประเมินผลสัมฤทธิ์ของโครงการได้',
      targetPillar: 'expected_impact',
      targetPillarTitle: 'เสาหลักที่ 4: ตัวชี้วัดการเปลี่ยนแปลงพฤติกรรม (Expected Impact)',
      scoreDelta: -delta
    });
  }

  // 2. วิเคราะห์ภาคีเครือข่ายพื้นที่ 3 ระดับ (เสาหลักที่ 3: Actionability)
  const partnerKeywords = [
    'mou', 'เทศบาล', 'อบต.', 'รพ.สต.', 'โรงเรียน', 'วัด', 'ชุมชน', 'แกนนำ',
    'ผู้นำชุมชน', 'กำนัน', 'ผู้ใหญ่บ้าน', 'กลุ่มสตรี', 'อสม.', 'ชมรม', 'สหกรณ์',
    'ภาคี', 'มหาวิทยาลัย', 'ระดับนโยบาย', 'ระดับปฏิบัติการ', 'ระดับประชาชน', '3 ประสาน', '3 ระดับ', 'คณะทำงาน'
  ];
  const currPlanLower = currPlan.toLowerCase();
  const prevPlanLower = prevPlan.toLowerCase();
  const addedPartners = partnerKeywords.filter(k => currPlanLower.includes(k) && !prevPlanLower.includes(k));
  const removedPartners = partnerKeywords.filter(k => !currPlanLower.includes(k) && prevPlanLower.includes(k));

  if (addedPartners.length > 0) {
    const delta = Math.min(2.00, Number((0.80 + addedPartners.length * 0.40).toFixed(2)));
    pillarDeltas.actionability += delta;
    positiveDiffs.push({
      field: 'activityPlan',
      fieldNameThai: 'แผนงาน 3 ระดับ',
      type: 'added',
      sentiment: 'positive',
      impactDescription: `ระบุภาคีเครือข่ายพื้นที่และบทบาทความร่วมมือชัดเจนยิ่งขึ้น (${addedPartners.slice(0, 3).join(', ')})`,
      targetPillar: 'actionability',
      targetPillarTitle: 'เสาหลักที่ 3: แผนงานและพลังเครือข่ายพื้นที่ (Actionability)',
      scoreDelta: delta,
      matchedKeywords: addedPartners
    });
  }

  if (removedPartners.length > 0 && currPlan.length < prevPlan.length) {
    const delta = Math.min(2.00, Number((0.80 + removedPartners.length * 0.40).toFixed(2)));
    pillarDeltas.actionability -= delta;
    negativeDiffs.push({
      field: 'activityPlan',
      fieldNameThai: 'แผนงาน 3 ระดับ',
      type: 'removed',
      sentiment: 'negative',
      impactDescription: `ตัดทอนบทบาทภาคีเครือข่ายพื้นที่หรือกลไก 3 ระดับออก (${removedPartners.slice(0, 3).join(', ')})`,
      targetPillar: 'actionability',
      targetPillarTitle: 'เสาหลักที่ 3: แผนงานและพลังเครือข่ายพื้นที่ (Actionability)',
      scoreDelta: -delta,
      matchedKeywords: removedPartners
    });
  }

  // กรณีลบแผนงาน 3 ระดับออกเกือบหมด
  if (prevPlan.length > 50 && currPlan.length < 20) {
    const delta = 3.00;
    pillarDeltas.actionability -= delta;
    negativeDiffs.push({
      field: 'activityPlan',
      fieldNameThai: 'แผนงาน 3 ระดับ',
      type: 'removed',
      sentiment: 'negative',
      impactDescription: 'ลบรายละเอียดแผนงาน 3 ระดับออกไป ส่งผลให้ข้อเสนอขาดความพร้อมในการลงมือปฏิบัติจริงในพื้นที่',
      targetPillar: 'actionability',
      targetPillarTitle: 'เสาหลักที่ 3: แผนงานและพลังเครือข่ายพื้นที่ (Actionability)',
      scoreDelta: -delta
    });
  }

  // 3. วิเคราะห์กลไกสะกิดพฤติกรรมและนวัตกรรม (เสาหลักที่ 2: Creative Nudge)
  const nudgeKeywords = [
    'สะกิดพฤติกรรม', 'nudge', 'default', 'social proof', 'บรรทัดฐาน', 'แรงจูงใจ',
    'ป้ายสัญลักษณ์', 'feedback', 'สภาพแวดล้อม', 'กระตุ้น', 'ยกย่อง', 'เชิดชู',
    'บันทึกความดี', 'ธนาคารความดี', 'กลไก', 'สร้างนิสัย', 'กิจวัตร', 'ชวนกันทำ',
    'แรงเสริมเชิงบวก', 'การตั้งค่าเริ่มต้น', 'จุดบริการสะดวก'
  ];
  const combinedCurr = `${currDetails} ${currPlan}`.toLowerCase();
  const combinedPrev = `${prevDetails} ${prevPlan}`.toLowerCase();
  const addedNudge = nudgeKeywords.filter(k => combinedCurr.includes(k) && !combinedPrev.includes(k));
  const removedNudge = nudgeKeywords.filter(k => !combinedCurr.includes(k) && combinedPrev.includes(k));

  if (addedNudge.length > 0) {
    const delta = Math.min(2.00, Number((0.80 + addedNudge.length * 0.40).toFixed(2)));
    pillarDeltas.creative_nudge += delta;
    positiveDiffs.push({
      field: 'proposalDetails',
      fieldNameThai: 'แนวคิดและกิจกรรมสะกิดพฤติกรรม',
      type: 'added',
      sentiment: 'positive',
      impactDescription: `เสริมกลไกสะกิดพฤติกรรม (Behavioral Nudge) และการปรับสภาพแวดล้อมเพื่อสร้างนิสัยต่อเนื่อง (${addedNudge.slice(0, 3).join(', ')})`,
      targetPillar: 'creative_nudge',
      targetPillarTitle: 'เสาหลักที่ 2: นวัตกรรมและกลไกสะกิดพฤติกรรม (Creative Nudge)',
      scoreDelta: delta,
      matchedKeywords: addedNudge
    });
  }

  if (removedNudge.length > 0 && currDetails.length < prevDetails.length) {
    const delta = Math.min(2.00, Number((0.80 + removedNudge.length * 0.40).toFixed(2)));
    pillarDeltas.creative_nudge -= delta;
    negativeDiffs.push({
      field: 'proposalDetails',
      fieldNameThai: 'แนวคิดและกิจกรรมสะกิดพฤติกรรม',
      type: 'removed',
      sentiment: 'negative',
      impactDescription: `ตัดทอนกลไกสะกิดพฤติกรรม (Nudge) หรือเครื่องมือกระตุ้นพฤติกรรมออก (${removedNudge.slice(0, 3).join(', ')})`,
      targetPillar: 'creative_nudge',
      targetPillarTitle: 'เสาหลักที่ 2: นวัตกรรมและกลไกสะกิดพฤติกรรม (Creative Nudge)',
      scoreDelta: -delta,
      matchedKeywords: removedNudge
    });
  }

  // 4. วิเคราะห์ความตรงกับโจทย์ความท้าทายหลักของพื้นที่ (เสาหลักที่ 1: Problem Fit)
  const challengeTerms = ['ขยะ', 'น้ำท่วม', 'อุทกภัย', 'พนัน', 'ยาเสพติด', 'หนี้สิน', 'ผู้สูงอายุ', 'แรงงาน', 'สิ่งแวดล้อม', 'เยาวชน', 'ครอบครัว', 'ความเหลื่อมล้ำ'];
  const activeChallengeTerms = challengeTerms.filter(t => challengeStatement.includes(t));
  if (activeChallengeTerms.length > 0) {
    const addedChal = activeChallengeTerms.filter(t => combinedCurr.includes(t) && !combinedPrev.includes(t));
    const removedChal = activeChallengeTerms.filter(t => !combinedCurr.includes(t) && combinedPrev.includes(t));

    if (addedChal.length > 0) {
      const delta = Math.min(2.50, Number((1.00 + addedChal.length * 0.50).toFixed(2)));
      pillarDeltas.challenge_fit += delta;
      positiveDiffs.push({
        field: 'proposalDetails',
        fieldNameThai: 'แนวคิดกิจกรรม',
        type: 'added',
        sentiment: 'positive',
        impactDescription: `ผูกโยงการแก้ปัญหาเข้ากับโจทย์ความท้าทายหลัก (${addedChal.join(', ')}) ได้ตรงจุดยิ่งขึ้น`,
        targetPillar: 'challenge_fit',
        targetPillarTitle: 'เสาหลักที่ 1: การตอบโจทย์ปัญหาพื้นที่ (Problem Fit)',
        scoreDelta: delta,
        matchedKeywords: addedChal
      });
    }

    if (removedChal.length > 0) {
      const delta = 2.00;
      pillarDeltas.challenge_fit -= delta;
      negativeDiffs.push({
        field: 'proposalDetails',
        fieldNameThai: 'แนวคิดกิจกรรม',
        type: 'removed',
        sentiment: 'negative',
        impactDescription: `ลดทอนการเชื่อมโยงกับโจทย์ความท้าทายหลักของพื้นที่ (${removedChal.join(', ')})`,
        targetPillar: 'challenge_fit',
        targetPillarTitle: 'เสาหลักที่ 1: การตอบโจทย์ปัญหาพื้นที่ (Problem Fit)',
        scoreDelta: -delta,
        matchedKeywords: removedChal
      });
    }
  }

  // 5. ปรับคะแนนจุดเล็กจากการขยายความหรือการตัดทอนเนื้อหาทั่วไป (Micro-Adjustments)
  if (positiveDiffs.length === 0 && negativeDiffs.length === 0) {
    const totalCurrLen = currDetails.length + currPlan.length + currKpi.length;
    const totalPrevLen = prevDetails.length + prevPlan.length + prevKpi.length;
    const lengthDiff = totalCurrLen - totalPrevLen;

    if (lengthDiff > 25) {
      neutralDiffs.push({
        field: 'proposalDetails',
        fieldNameThai: 'รายละเอียดโครงการ',
        type: 'modified',
        sentiment: 'neutral',
        impactDescription: `ขยายความและเพิ่มคำอธิบายขั้นตอนการดำเนินงาน (+${lengthDiff} ตัวอักษร) แต่ยังไม่พบกลไกสะกิดพฤติกรรมหรือบทบาทภาคีใหม่ที่สร้างประโยชน์เพิ่มขึ้น`,
        targetPillar: 'actionability',
        targetPillarTitle: 'เสาหลักที่ 3: แผนงานและพลังเครือข่ายพื้นที่ (Actionability)',
        scoreDelta: 0
      });
    } else if (lengthDiff < -30) {
      const delta = Math.min(2.00, Number((0.60 + Math.floor(Math.abs(lengthDiff) / 50) * 0.40).toFixed(2)));
      pillarDeltas.actionability -= delta;
      negativeDiffs.push({
        field: 'proposalDetails',
        fieldNameThai: 'รายละเอียดโครงการ',
        type: 'removed',
        sentiment: 'negative',
        impactDescription: `ตัดทอนเนื้อหาและคำอธิบายการดำเนินงานให้สั้นลง (${lengthDiff} ตัวอักษร)`,
        targetPillar: 'actionability',
        targetPillarTitle: 'เสาหลักที่ 3: แผนงานและพลังเครือข่ายพื้นที่ (Actionability)',
        scoreDelta: -delta
      });
    } else {
      neutralDiffs.push({
        field: 'proposalDetails',
        fieldNameThai: 'รายละเอียดโครงการ',
        type: 'modified',
        sentiment: 'neutral',
        impactDescription: 'ปรับปรุงสำนวนหรือจัดวรรคตอนเล็กน้อยโดยไม่เปลี่ยนสาระสำคัญของโครงการ',
        targetPillar: 'actionability',
        targetPillarTitle: 'เสาหลักที่ 3: แผนงานและพลังเครือข่ายพื้นที่ (Actionability)',
        scoreDelta: 0
      });
    }
  }

  // หากโครงการปัจจุบันยังไม่ผ่านเกณฑ์ความเป็นไปได้จริง (เช่น กรอบเวลา 1 วัน หรือ ตัวชี้วัด 100%)
  // ระงับการบวกคะแนนเพิ่มทุกชนิด (Zero Gain during Infeasibility) เพื่อป้องกันคะแนนไต่ระดับ
  if (!currFeas.isFeasible) {
    pillarDeltas.challenge_fit = Math.min(0, pillarDeltas.challenge_fit);
    pillarDeltas.creative_nudge = Math.min(0, pillarDeltas.creative_nudge);
    pillarDeltas.actionability = Math.min(0, pillarDeltas.actionability);
    pillarDeltas.expected_impact = Math.min(0, pillarDeltas.expected_impact);
    // แปลง positiveDiffs ทั่วไปให้เป็น neutral เพื่อสะท้อนว่ายังไม่บวกแต้มขณะติดเงื่อนไข
    for (const pos of positiveDiffs) {
      if (!pos.fieldNameThai.includes('ความเป็นไปได้')) {
        pos.sentiment = 'neutral';
        pos.scoreDelta = 0;
        pos.impactDescription = `${pos.impactDescription} (ยังไม่นำมาคำนวณบวกคะแนน เนื่องจากโครงการยังไม่ผ่านเกณฑ์ความเป็นไปได้จริง)`;
      }
    }
  }

  // สรุปผลต่างคะแนนรวม
  const totalDelta = Number(
    (pillarDeltas.challenge_fit +
     pillarDeltas.creative_nudge +
     pillarDeltas.actionability +
     pillarDeltas.expected_impact).toFixed(2)
  );

  let summaryText = '';
  if (totalDelta > 0) {
    summaryText = `📈 โครงการได้รับการปรับปรุงดีขึ้นจากรอบที่ ${previousIteration} (+${totalDelta.toFixed(2)} คะแนน): ${positiveDiffs.map(d => d.impactDescription).slice(0, 2).join(' และ ')}`;
  } else if (totalDelta < 0) {
    summaryText = `📉 โครงการในรอบนี้มีรายละเอียดลดทอนลงจากรอบที่ ${previousIteration} (${totalDelta.toFixed(2)} คะแนน): ${negativeDiffs.map(d => d.impactDescription).slice(0, 2).join(' และ ')}`;
  } else {
    summaryText = `⚖️ คุณภาพโครงการโดยรวมอยู่ในระดับใกล้เคียงกับรอบที่ ${previousIteration} (ไม่มีการเปลี่ยนแปลงคะแนน)`;
  }

  return {
    previousIteration,
    currentIteration,
    totalDelta,
    pillarDeltas,
    summaryText,
    positiveDiffs,
    negativeDiffs,
    neutralDiffs,
    isIdentical: false
  };
}

export function buildPreSubmissionPromptPayload(
  projectData: {
    projectName: string;
    targetMoralVirtue: string;
    targetArea: string;
    targetAudience: string;
    proposalDetails: string;
    activityPlan: string;
    behavioralKpi?: string;
    proposerName?: string;
    proposerAgency?: string;
  },
  challengeStatement: string,
  selectedVirtues: string[],
  activeRubric: UniversalRubricDimension[] = UNIVERSAL_DEFAULT_RUBRIC,
  comparativeContext?: ComparativeEvaluationContext,
  previousSnapshot?: TempEvaluationSnapshot | null,
  historySnapshots?: TempEvaluationSnapshot[],
  diffAnalysis?: ProposalDiffAnalysis
): {
  systemPrompt: string;
  projectMarkdown: string;
  challengeMarkdown: string;
  benchmarkMarkdown: string;
  previousRevisionMarkdown?: string;
  rubricMarkdown: string;
  fullCompiledPrompt: string;
  filteredRubric: UniversalRubricDimension[];
} {
  const compCtx = comparativeContext || getComparativeBenchmarkAnchors();

  const is4PillarRubric = activeRubric.some((d) =>
    ['challenge_fit', 'creative_nudge', 'actionability', 'expected_impact'].includes(d.virtueKey)
  );

  const systemPrompt = is4PillarRubric
    ? [
        'คุณคือผู้เชี่ยวชาญระดับสูงด้านการประเมินโครงการนวัตกรรมคุณธรรมและการปรับเปลี่ยนพฤติกรรมเชิงพื้นที่',
        'หน้าที่หลักของคุณคือ: ประเมินข้อเสนอโครงการใน "ส่วนที่ 2: ข้อมูลโครงการ"',
        'ว่าสามารถแก้โจทย์ปัญหาความท้าทายที่ตั้งไว้ได้อย่างตรงจุดและมีประสิทธิภาพเพียงใด',
        'โดยโจทย์ความท้าทายที่ตั้งไว้คือ: "' + (challengeStatement || 'ปัญหาความท้าทายเชิงพื้นที่') + '"',
        '',
        'โดยใช้เกณฑ์การตัดสินและเกณฑ์ Rubric 4 เสาหลัก (คะแนนเต็มรวม 100.00 คะแนน):',
        '1. เสาหลักที่ 1 (30 คะแนน): ความตรงจุดและลึกซึ้งในการตีโจทย์ปัญหาคลังปัญหาของจังหวัด (Problem Fit & Diagnostic Precision)',
        '2. เสาหลักที่ 2 (25 คะแนน): ความคิดสร้างสรรค์และกลไกสะกิดพฤติกรรม (Creative Idea & Behavioral Nudge)',
        '3. เสาหลักที่ 3 (25 คะแนน): ความเป็นไปได้จริงและพลังเครือข่ายพื้นที่ (Actionability & Local Triad Synergy)',
        '4. เสาหลักที่ 4 (20 คะแนน): ประสิทธิผลการแก้ปัญหาและตัวชี้วัดพฤติกรรม (Expected Impact & Behavioral Outcomes)',
        '',
        '[หัวใจสำคัญในการตัดสินตามเกณฑ์รูบิค (Core Rubric-Based Evaluation Mandate)]:',
        '- คณะกรรมการ AI ต้องตัดสินโดยอิงการดูว่าข้อเสนอโครงการสามารถแก้โจทย์ที่เราตั้งไว้ได้อย่างมีประสิทธิภาพมากน้อยเพียงใด และได้คะแนนเท่าไหร่ในแต่ละเสาหลักตามตาราง Rubric',
        '- เสาหลักที่ 1: ตรวจสอบว่าโครงการเข้าใจและแก้โจทย์ความท้าทายที่ตั้งไว้ได้ตรงจุด ลึกซึ้งถึงรากเหง้าปัญหาเพียงใด',
        '- เสาหลักที่ 2: ตรวจสอบว่ามีไอเดียสร้างสรรค์และกลไก Nudge ที่สะกิดพฤติกรรมเพื่อตอบโจทย์ที่ตั้งไว้อย่างไร',
        '- เสาหลักที่ 3: ตรวจสอบว่ามีความเป็นไปได้จริงและเครือข่าย 3 ประสานร่วมมือกันแก้โจทย์ได้จริงในพื้นที่หรือไม่',
        '- เสาหลักที่ 4: ตรวจสอบว่าตัวชี้วัดและผลลัพธ์พฤติกรรมสะท้อนว่าปัญหาตามโจทย์ที่ตั้งไว้ได้รับการแก้ไขอย่างมีประสิทธิภาพและยั่งยืนหรือไม่',
        '- โครงการนี้เป็นบทสรุปแนวคิดโครงการ (Concept Proposal) เน้นว่า Idea นำไปแก้โจทย์ปัญหาได้จริง ไม่ต้องประเมินงบประมาณ',
        '- ให้คะแนนทศนิยมสองตำแหน่งในแต่ละเสาหลัก รวมคะแนนเต็ม 100.00 คะแนน พร้อมระบุคำแนะนำพัฒนา (Actionable Feedback)',
        '',
        '[หลักเกณฑ์ความเที่ยงตรงและความเป็นธรรม (Fairness & Benchmark Rule)]:',
        '1. ประเมินตามเนื้อหาจริงของข้อเสนอโครงการเทียบกับโจทย์ปัญหาและตารางเกณฑ์รูบิคอย่างเป็นกลางและเที่ยงตรง',
        '2. ให้ข้อเสนอแนะที่จับต้องได้จริง (Actionable Suggestions) ที่เชื่อมโยงกับการแก้โจทย์ปัญหาในบริบทพื้นที่'
      ].join('\n')
    : [
        'คุณคือผู้เชี่ยวชาญระดับสูงด้านการตัดสินโครงการคุณธรรมและพฤติกรรมศาสตร์ ให้ประเมินคะแนนของโครงการที่ส่งมาว่า ' +
        'โครงการดังกล่าวสามารถช่วยตอบโจทย์และแก้ปัญหาความท้าทาย "' + (challengeStatement || 'การส่งเสริมพฤติกรรมคุณธรรมในพื้นที่') + '" ' +
        'ได้ตรงจุดและมีประสิทธิภาพมากน้อยเพียงใด และสามารถช่วยปรับเปลี่ยนพฤติกรรมของคนในชุมชนได้มากน้อยเพียงใด ตามเกณฑ์ Rubric ที่ได้รับมา ' +
        'และหัวข้อโจทย์การแข่งขัน โดยคะแนนที่ได้เป็นทศนิยมสองตำแหน่ง คะแนนเต็มคือ 100.00 คะแนน ' +
        'ถ้าเกณฑ์ที่เลือกมาไม่ครบดัชนีคุณธรรมทั้ง 5 ด้าน ให้เฉลี่ยเฉพาะเกณฑ์ที่เลือกให้เป็นฐาน 100.00 คะแนน ' +
        'และให้ตรวจสอบความเที่ยงตรงและความถูกต้องอย่างเคร่งครัดก่อนส่งผลคะแนน',
        '',
        '[หลักเกณฑ์ความเที่ยงตรงและความเป็นธรรม (Fairness & Identical Matching Rule)]:',
        '1. กฎความเหมือนกันทุกประการ (Identical Match): หากโครงการที่ส่งเข้าประเมินมีชื่อโครงการ สาระสำคัญ และโครงสร้างกิจกรรมเหมือนกับโครงการอ้างอิงทุกประการ คะแนนจะต้องออกมา "เท่ากัน 100% เป๊ะทุกทศนิยม" โดยไม่มีการสุ่มบวกเพิ่มหรือลดลงเด็ดขาด',
        '2. กฎความเหนือกว่า (Better Relative Scoring): หากโครงการที่ส่ง "ดีกว่า" โครงการอ้างอิง (เช่น มีกลไก Nudge ชัดเจนกว่า, มีตัวชี้วัดเชิงประจักษ์ที่เป็นรูปธรรมกว่า, แผนงาน 3 ระดับครอบคลุมกว่า) คะแนนจะต้อง "มากกว่า" โครงการอ้างอิงตามสัดส่วนความเหนือกว่า',
        '3. กฎความด้อยกว่า (Worse Relative Scoring): หากโครงการที่ส่ง "แย่กว่า" โครงการอ้างอิง (เช่น ขาดตัวชี้วัด, แผนงานไม่ครบ 3 ระดับ, ขาดกลไกพฤติกรรม) คะแนนจะต้อง "น้อยกว่า" โครงการอ้างอิงตามสัดส่วน',
        '4. กฎการเปรียบเทียบความใกล้เคียงระหว่างต่ำสุดและสูงสุด (Min-Max Proximity Matching): สำหรับการเปรียบเทียบในรอบที่มีโครงการคะแนนต่ำสุด (Min Anchor) และโครงการคะแนนสูงสุด (Max Anchor) ให้วิเคราะห์ว่าโครงการที่ส่ง "ใกล้เคียงกับโครงการไหนมากกว่ากัน"',
        '5. แสดงเหตุผลการให้คะแนนในแต่ละเกณฑ์ตาม Rubric และระบุเหตุผลการเปรียบเทียบคะแนนกับโครงการอ้างอิงอย่างชัดเจนโปร่งใส'
      ].join('\n');

  // Filter rubric: If 4-pillar rubric, keep all 4 pillars intact so total is 100 points
  const filteredRubric = is4PillarRubric
    ? activeRubric
    : activeRubric.filter((dim) => {
        if (!selectedVirtues || selectedVirtues.length === 0) return true;
        return selectedVirtues.some((v) => {
          const match = VIRTUE_KEY_NAME_MAP[v];
          return match ? dim.virtueKey === match.key : dim.virtueTitle.includes(v);
        });
      });

  // Fallback to all if somehow empty
  const effectiveRubric = filteredRubric.length > 0 ? filteredRubric : activeRubric;

  // Construct Challenge Markdown
  const challengeMarkdown = [
    `# 1. โจทย์หลักในการแข่งขันและเกณฑ์ตัดสิน (Hackathon Challenge & Rubric Criteria)`,
    `- **โจทย์ปัญหาความท้าทายที่ตั้งไว้ (Stated Challenge Directive):** "${challengeStatement || 'ให้คิดโครงการที่สามารถช่วยแก้ปัญหาคุณธรรมเชิงพื้นที่'}"`,
    is4PillarRubric
      ? `- **เกณฑ์การตัดสิน:** เกณฑ์มาตรฐาน 4 เสาหลักแก้โจทย์พื้นที่ (คะแนนเต็มรวม 100.00 คะแนน)`
      : `- **เกณฑ์ดัชนีคุณธรรมที่กำหนดใช้ตัดสิน:** ${selectedVirtues.length > 0 ? selectedVirtues.join(', ') : 'ทั้ง 5 ด้านคุณธรรม'} (จำนวน ${effectiveRubric.length} เกณฑ์)`,
    `- **เกณฑ์การตัดสินจากตารางรูบิค (Rubric-Based Challenge Solving Criteria):**`,
    `  ให้คณะกรรมการ AI ตัดสินจากเกณฑ์รูบิค 4 เสาหลัก โดยอิงการดูว่าข้อเสนอโครงการในส่วนที่ 2 สามารถแก้โจทย์ที่เราตั้งไว้ได้อย่างมีประสิทธิภาพได้คะแนนเท่าไหร่ในแต่ละเสาหลัก:`,
    `  1. เสาหลักที่ 1 (30 คะแนน): โครงการตอบโจทย์ปัญหาความท้าทายที่ตั้งไว้ได้ตรงจุดและลึกซึ้งถึงรากเหง้าปัญหาเพียงใด`,
    `  2. เสาหลักที่ 2 (25 คะแนน): โครงการมีความคิดสร้างสรรค์และกลไกสะกิดพฤติกรรม (Nudge) ที่แก้ปัญหาตามโจทย์ได้จริงหรือไม่`,
    `  3. เสาหลักที่ 3 (25 คะแนน): โครงการมีความเป็นไปได้จริง มีกลไกขับเคลื่อน 3 ระดับ และพลังเครือข่ายพื้นที่ในการแก้โจทย์`,
    `  4. เสาหลักที่ 4 (20 คะแนน): โครงการมีตัวชี้วัดเชิงประจักษ์และผลลัพธ์พฤติกรรมที่สะท้อนว่าสามารถแก้ปัญหาตามโจทย์ได้อย่างยั่งยืน`
  ].join('\n');

  // Construct Project Markdown with ALL Section 2 fields
  const projectMarkdown = [
    `# 2. ข้อมูลโครงการที่ต้องการนำเสนอ (Project Proposal - ส่วนที่ 2: ข้อมูลโครงการ)`,
    `- **ชื่อโครงการ (Project Title):** ${projectData.projectName || 'ยังไม่ระบุชื่อโครงการ'}`,
    `- **ผู้เสนอโครงการ / สังกัด:** ${projectData.proposerName || 'ผู้ร่วมกิจกรรม'} (${projectData.proposerAgency || 'เครือข่ายพื้นที่'})`,
    `- **โจทย์ปัญหาพื้นที่ที่เลือกแก้ปัญหา (Challenge Topic):** ${challengeStatement || '-'}`,
    `- **มิติคุณธรรมเป้าหมายหลัก:** ${projectData.targetMoralVirtue || 'คุณธรรม'}`,
    `- **พื้นที่ดำเนินการ:** ${projectData.targetArea || 'พื้นที่เป้าหมายในจังหวัด'}`,
    `- **กลุ่มเป้าหมาย (Target Audience):** ${projectData.targetAudience || 'ประชาชนในชุมชน'}`,
    `- **แนวคิดนวัตกรรมและกิจกรรมปรับเปลี่ยนพฤติกรรม (Behavior Modification Strategy):**`,
    `${projectData.proposalDetails || 'ยังไม่ระบุรายละเอียดกิจกรรม'}`,
    `- **กลไกการมีส่วนร่วมของ 3 ระดับ (นโยบาย / ผู้ปฏิบัติการ / ประชาชน):**`,
    `${projectData.activityPlan || 'ยังไม่ระบุกลไก 3 ระดับ'}`,
    `- **ตัวชี้วัดความสำเร็จและการเปลี่ยนแปลงพฤติกรรม (Behavioral KPI):**`,
    `${projectData.behavioralKpi || 'ยังไม่ระบุตัวชี้วัดเชิงพฤติกรรม'}`
  ].join('\n');

  // Construct Benchmark Anchor Markdown with FULL details for precision comparison
  let benchmarkMarkdown = '';
  if (compCtx.mode === 'first_project_rubric_real' || compCtx.mode === 'first_project_start_80') {
    benchmarkMarkdown = [
      `# 3. ข้อมูลโครงการอ้างอิงเปรียบเทียบในระบบ (Benchmark Anchor Projects)`,
      `- **ลำดับโครงการที่ส่งเข้าแข่งขัน:** โครงการลำดับที่ 1 (First Project in Competition)`,
      `- **สถานะ:** ยังไม่มีโครงการก่อนหน้าในระบบ`,
      `- **เกณฑ์การตัดสิน (Baseline Anchor):** ตรวจประเมินตามเกณฑ์ Rubric คุณธรรมที่เลือกตามจริง (ไม่มีการจำกัดเพดาน 80 คะแนน) และนำคะแนนที่ได้จริงนี้เป็นตัวตั้งหลัก (Baseline Anchor) สำหรับการแข่งขัน เพื่อใช้อ้างอิงเปรียบเทียบกับโครงการที่สองและโครงการถัดไป`
    ].join('\n');
  } else if (compCtx.mode === 'second_project_compare_first' && (compCtx.anchorProject1 || (compCtx.topAnchors && compCtx.topAnchors.length > 0))) {
    const a1 = compCtx.anchorProject1 || compCtx.topAnchors![0];
    benchmarkMarkdown = [
      `# 3. ข้อมูลโครงการอ้างอิงเปรียบเทียบในระบบ (Benchmark Anchor Projects)`,
      `- **ลำดับโครงการที่ส่งเข้าแข่งขัน:** โครงการลำดับที่ 2 (Second Project in Competition)`,
      `- **สถานะ:** มีโครงการแรกส่งเข้าสู่ระบบแล้ว 1 โครงการ (ใช้อ้างอิงเปรียบเทียบ)`,
      `- **ข้อมูลโครงการแรก (Reference Anchor #1):**`,
      `  • **ชื่อโครงการ:** ${a1.name}`,
      `  • **คะแนนประเมินที่ได้:** ${a1.score.toFixed(2)} / 100.00 คะแนน`,
      `  • **มิติคุณธรรมเป้าหมาย:** ${a1.moralVirtue}`,
      `  • **พื้นที่ / กลุ่มเป้าหมาย:** ${a1.targetArea || '-'} / ${a1.targetAudience || '-'}`,
      `  • **สาระสำคัญกิจกรรม:** ${a1.proposalDetails || a1.summary || '-'}`,
      `  • **แผนงาน 3 ระดับ:** ${a1.activityPlan || '-'}`,
      `  • **ตัวชี้วัดเชิงประจักษ์:** ${a1.behavioralKpi || '-'}`,
      `- **คำสั่งเปรียบเทียบ:** แนบโครงการที่หนึ่งนำไปเปรียบเทียบร่วมกับเกณฑ์วัด ว่าโครงการที่สองนี้ควรได้คะแนนเท่าไหร่ (ดีกว่า ได้คะแนนสูงกว่า / ด้อยกว่า ได้คะแนนต่ำกว่า / เท่ากัน ได้คะแนนเท่ากันเป๊ะ)`
    ].join('\n');
  } else if (compCtx.mode === 'third_project_compare_prior_two' && compCtx.topAnchors && compCtx.topAnchors.length >= 2) {
    const a1 = compCtx.topAnchors[0];
    const a2 = compCtx.topAnchors[1];
    benchmarkMarkdown = [
      `# 3. ข้อมูลโครงการอ้างอิงเปรียบเทียบในระบบ (Benchmark Anchor Projects - โครงการที่หนึ่งและโครงการที่สอง)`,
      `- **ลำดับโครงการที่ส่งเข้าแข่งขัน:** โครงการลำดับที่ 3 (Third Project in Competition)`,
      `- **สถานะ:** มีโครงการส่งเข้าสู่ระบบแล้ว 2 โครงการ (ใช้อ้างอิงเปรียบเทียบร่วมกัน)`,
      `- **ข้อมูลโครงการที่หนึ่ง (Reference Anchor #1):**`,
      `  • **ชื่อโครงการ:** ${a1.name}`,
      `  • **คะแนนประเมิน:** ${a1.score.toFixed(2)} / 100.00 คะแนน`,
      `  • **มิติคุณธรรม:** ${a1.moralVirtue}`,
      `  • **สาระสำคัญกิจกรรม:** ${a1.proposalDetails || a1.summary || '-'}`,
      `- **ข้อมูลโครงการที่สอง (Reference Anchor #2):**`,
      `  • **ชื่อโครงการ:** ${a2.name}`,
      `  • **คะแนนประเมิน:** ${a2.score.toFixed(2)} / 100.00 คะแนน`,
      `  • **มิติคุณธรรม:** ${a2.moralVirtue}`,
      `  • **สาระสำคัญกิจกรรม:** ${a2.proposalDetails || a2.summary || '-'}`,
      `- **คำสั่งเปรียบเทียบ:** ให้แนบโครงการที่หนึ่งและโครงการที่สองไปเปรียบเทียบตามเกณฑ์ด้านต่างๆ พร้อมกันเพื่อหาคะแนนที่เหมาะสมของโครงการที่สามตามจริง`
    ].join('\n');
  } else if (compCtx.topAnchors && compCtx.topAnchors.length > 0) {
    const anchorsMd = compCtx.topAnchors
      .map((a) => [
        `  • **อันดับ #${a.rank}: "${a.name}"** (${a.score.toFixed(2)} / 100.00 คะแนน)`,
        `    - มิติคุณธรรม: ${a.moralVirtue}`,
        `    - พื้นที่ / กลุ่มเป้าหมาย: ${a.targetArea || '-'} / ${a.targetAudience || '-'}`,
        `    - สาระสำคัญกิจกรรม: ${a.proposalDetails || a.summary || '-'}`,
        `    - แผนงาน 3 ระดับ: ${a.activityPlan || '-'}`,
        `    - ตัวชี้วัด: ${a.behavioralKpi || '-'}`
      ].join('\n'))
      .join('\n');

    benchmarkMarkdown = [
      `# 3. ข้อมูลโครงการอ้างอิงเปรียบเทียบในระบบ (Benchmark Anchor Projects - 3 อันดับสูงสุด)`,
      `- **ลำดับโครงการที่ส่งเข้าแข่งขัน:** โครงการลำดับที่ ${compCtx.sequenceNumber} (มีโครงการส่งเข้ามาก่อนหน้ารวม ${compCtx.totalPriorProjects} โครงการ)`,
      `- **3 โครงการที่มีคะแนนสูงสุดก่อนหน้า (ใช้อ้างอิงเปรียบเทียบ):**`,
      anchorsMd,
      `- **คำสั่งเปรียบเทียบ:** นำ 3 โครงการที่มีคะแนนสูงสุดก่อนหน้า แนบเข้าไปเพื่อเปรียบเทียบว่าคะแนนของโครงการของตนที่ส่งมานั้นควรจะได้เท่าไหร่ตามเกณฑ์การให้คะแนนอย่างเที่ยงธรรม`
    ].join('\n');
  } else {
    const high = compCtx.highestProject;
    const low = compCtx.lowestProject;
    benchmarkMarkdown = [
      `# 3. ข้อมูลโครงการอ้างอิงเปรียบเทียบในระบบ (Benchmark Anchor Projects)`,
      `- **ลำดับโครงการที่ส่งเข้าแข่งขัน:** โครงการลำดับที่ ${compCtx.sequenceNumber} (มีโครงการในระบบแล้ว ${compCtx.totalPriorProjects} โครงการ)`,
      `- **โครงการที่ได้รับคะแนนสูงสุด (Highest Scoring Anchor - Max):**`,
      `  • **ชื่อโครงการ:** ${high?.name || 'โครงการคะแนนสูงสุด'}`,
      `  • **คะแนนประเมิน:** ${high ? high.score.toFixed(2) : '90.00'} / 100.00 คะแนน`,
      `  • **มิติคุณธรรม:** ${high?.moralVirtue || 'คุณธรรม'}`,
      `  • **สาระสำคัญกิจกรรม:** ${high?.proposalDetails || high?.summary || '-'}`,
      `  • **แผนงาน 3 ระดับ:** ${high?.activityPlan || '-'}`,
      `  • **ตัวชี้วัด:** ${high?.behavioralKpi || '-'}`,
      `- **โครงการที่ได้รับคะแนนต่ำสุด (Lowest Scoring Anchor - Min):**`,
      `  • **ชื่อโครงการ:** ${low?.name || 'โครงการคะแนนต่ำสุด'}`,
      `  • **คะแนนประเมิน:** ${low ? low.score.toFixed(2) : '75.00'} / 100.00 คะแนน`,
      `  • **มิติคุณธรรม:** ${low?.moralVirtue || 'คุณธรรม'}`,
      `  • **สาระสำคัญกิจกรรม:** ${low?.proposalDetails || low?.summary || '-'}`,
      `  • **แผนงาน 3 ระดับ:** ${low?.activityPlan || '-'}`,
      `  • **ตัวชี้วัด:** ${low?.behavioralKpi || '-'}`,
      `- **คำสั่งเปรียบเทียบความใกล้เคียง (Proximity Matching):**`,
      `  1. หากเหมือนโครงการสูงสุดเป๊ะ -> ได้คะแนนเท่ากับ ${high ? high.score.toFixed(2) : '90.00'}`,
      `  2. หากเหมือนโครงการต่ำสุดเป๊ะ -> ได้คะแนนเท่ากับ ${low ? low.score.toFixed(2) : '75.00'}`,
      `  3. วิเคราะห์ว่าโครงการปัจจุบัน "ใกล้เคียงกับโครงการไหนมากกว่ากัน" แล้วประเมินคะแนนให้อยู่ในตำแหน่งที่เหมาะสม`
    ].join('\n');
  }

  // Construct Previous Revision Benchmark Markdown from Temp File (if available)
  let previousRevisionMarkdown = '';
  if (previousSnapshot && typeof previousSnapshot.finalScore === 'number') {
    const historyRows = (historySnapshots && historySnapshots.length > 0)
      ? historySnapshots.map((s) => {
          const p1 = s.pillarScores?.challenge_fit ? s.pillarScores.challenge_fit.toFixed(2) : '-';
          const p2 = s.pillarScores?.creative_nudge ? s.pillarScores.creative_nudge.toFixed(2) : '-';
          const p3 = s.pillarScores?.actionability ? s.pillarScores.actionability.toFixed(2) : '-';
          const p4 = s.pillarScores?.expected_impact ? s.pillarScores.expected_impact.toFixed(2) : '-';
          return `| รอบที่ ${s.iteration} | **${s.finalScore.toFixed(2)}** | ${p1} | ${p2} | ${p3} | ${p4} | ระดับ${s.qualityTier} |`;
        }).join('\n')
      : '';

    const historySection = historyRows ? [
      `## 3.1 ประวัติการตรวจประเมินโครงการใน Temp File ย้อนหลัง (${historySnapshots?.length} ครั้งล่าสุด)`,
      `| รอบการตรวจ | คะแนนรวม (100) | Problem Fit (30) | Creative Nudge (25) | Actionability (25) | Expected Impact (20) | ระดับคุณภาพ |`,
      `| :---: | :---: | :---: | :---: | :---: | :---: | :---: |`,
      historyRows,
      ''
    ].join('\n') : '';

    const diffSection = diffAnalysis ? [
      `## 3.2 ผลการวิเคราะห์เปรียบเทียบความแตกต่าง (Structural & Semantic Diff Analysis)`,
      `- **ภาพรวมการเปลี่ยนแปลง:** ${diffAnalysis.summaryText}`,
      `- **ผลต่างคะแนนตามการเปลี่ยนแปลง (Score Delta):** ${diffAnalysis.totalDelta > 0 ? `+${diffAnalysis.totalDelta.toFixed(2)}` : diffAnalysis.totalDelta.toFixed(2)} คะแนน`,
      diffAnalysis.positiveDiffs.length > 0 ? `\n- **🟢 จุดที่ได้รับการปรับปรุงและพัฒนาขึ้น (Positive Enhancements):**\n` + diffAnalysis.positiveDiffs.map(p => `  • [${p.fieldNameThai}] ${p.impactDescription} (+${p.scoreDelta.toFixed(2)} ใน${p.targetPillarTitle})`).join('\n') : '',
      diffAnalysis.negativeDiffs.length > 0 ? `\n- **🔴 จุดที่ตัดทอนหรือควรระวัง (Negative Regressions):**\n` + diffAnalysis.negativeDiffs.map(n => `  • [${n.fieldNameThai}] ${n.impactDescription} (${n.scoreDelta.toFixed(2)} ใน${n.targetPillarTitle})`).join('\n') : '',
      diffAnalysis.isIdentical ? `\n- **⚖️ ความเหมือน 100%:** ข้อความโครงการเหมือนกับรอบก่อนหน้าทุกตัวอักษร คะแนนได้รับเท่าเดิมเป๊ะ` : '',
      ''
    ].join('\n') : '';

    previousRevisionMarkdown = [
      `# 3. ข้อมูลข้อเสนอโครงการและคะแนนจากรอบก่อนหน้า (Previous Draft & Score from Temp File - ตรวจรอบที่ ${previousSnapshot.iteration})`,
      `- **สถานะ:** โครงการนี้เคยผ่านการตรวจสอบมาแล้ว ${previousSnapshot.iteration} ครั้ง (บันทึกไว้ใน Temp File ล่าสุด)`,
      `- **คะแนนที่ได้ในรอบก่อนหน้า:** ${previousSnapshot.finalScore.toFixed(2)} / 100.00 คะแนน (ระดับ${previousSnapshot.qualityTier})`,
      `- **คะแนนรายเสาหลักในรอบก่อนหน้า:**`,
      `  • เสาหลักที่ 1 (Problem Fit): ${previousSnapshot.pillarScores?.challenge_fit ? previousSnapshot.pillarScores.challenge_fit.toFixed(2) : '-'} / 30.00 คะแนน`,
      `  • เสาหลักที่ 2 (Creative Nudge): ${previousSnapshot.pillarScores?.creative_nudge ? previousSnapshot.pillarScores.creative_nudge.toFixed(2) : '-'} / 25.00 คะแนน`,
      `  • เสาหลักที่ 3 (Actionability): ${previousSnapshot.pillarScores?.actionability ? previousSnapshot.pillarScores.actionability.toFixed(2) : '-'} / 25.00 คะแนน`,
      `  • เสาหลักที่ 4 (Expected Impact): ${previousSnapshot.pillarScores?.expected_impact ? previousSnapshot.pillarScores.expected_impact.toFixed(2) : '-'} / 20.00 คะแนน`,
      `- **สาระสำคัญโครงการฉบับก่อนหน้า (Draft #${previousSnapshot.iteration}):**`,
      `  • ชื่อโครงการ: "${previousSnapshot.projectData.projectName}"`,
      `  • แนวคิดกิจกรรม: ${previousSnapshot.projectData.proposalDetails.slice(0, 300)}...`,
      `  • แผนงาน 3 ระดับ: ${previousSnapshot.projectData.activityPlan.slice(0, 200)}...`,
      `  • ตัวชี้วัดพฤติกรรม: ${previousSnapshot.projectData.behavioralKpi || '-'}`,
      '',
      historySection,
      diffSection,
      `# 4. คำสั่งเปรียบเทียบพัฒนาการ (Revision Progression & Improvement Directive):`,
      `1. ให้ AI นำข้อเสนอโครงการปัจจุบันในส่วนที่ 2 มาเปรียบเทียบกับข้อเสนอฉบับก่อนหน้าใน Temp File นี้ตามเกณฑ์ Rubric 4 เสาหลักอย่างละเอียด`,
      `2. หากส่วนที่มีการปรับแก้ (เช่น การเพิ่มกลไก Nudge, การลงลึกรากเหง้าปัญหา, การระบุเครือข่าย 3 ประสาน, หรือตัวชี้วัดเชิงประจักษ์) ทำให้โครงการ "ดีขึ้น" -> คะแนนรอบนี้จะต้อง "สูงกว่ารอบก่อน" (${previousSnapshot.finalScore.toFixed(2)}) ตามสัดส่วนของคุณภาพที่เพิ่มขึ้น`,
      `3. หากส่วนที่มีการปรับแก้ทำให้เนื้อหา "ด้อยลง" หรือตัดสาระสำคัญออก -> คะแนนจะต้อง "ต่ำกว่ารอบก่อน"`,
      `4. หากไม่มีการปรับแก้เนื้อหาใด ๆ เลย (ข้อความเหมือนเดิมเป๊ะ) -> คะแนนจะต้อง "เท่าเดิมเป๊ะทุกทศนิยม" (${previousSnapshot.finalScore.toFixed(2)})`,
      `5. ระบุข้อเสนอแนะสะท้อนพัฒนาการ ว่าจุดใดปรับปรุงดีขึ้นและจุดใดยังสามารถยกระดับเพิ่มเติมได้อีก`
    ].filter(Boolean).join('\n');
  }

  // Construct Rubric Markdown Table (ONLY FOR FILTERED DIMENSIONS)
  let rubricMarkdown = is4PillarRubric
    ? `# 5. ตารางเกณฑ์การตัดสิน (Rubric) 4 เสาหลักแก้โจทย์พื้นที่ (คะแนนเต็มรวม 100 คะแนน)\n\n`
    : `# 4. ตารางเกณฑ์การตัดสิน (Rubric) เฉพาะเกณฑ์ดัชนีที่เลือกใช้ตัดสิน (${effectiveRubric.length} ด้าน)\n\n`;

  if (is4PillarRubric) {
    rubricMarkdown += `| เสาหลักการประเมิน (คะแนนเต็ม) | สาระสำคัญและนิยามการประเมิน | ดีเลิศ (85-100%) | ดี (70-84%) | พอใช้ (50-69%) | กำลังพัฒนา (0-49%) |\n`;
    rubricMarkdown += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    effectiveRubric.forEach((row) => {
      const fmt = (text: string) => (text || '').replace(/\n/g, '<br>');
      rubricMarkdown += `| **${row.virtueTitle}** (${row.maxScore} คะแนน) | *${row.subPillarTitle}* | ${fmt(row.level4)} | ${fmt(row.level3)} | ${fmt(row.level2)} | ${fmt(row.level1)} |\n`;
    });
  } else {
    rubricMarkdown += `| ด้านคุณธรรม (คะแนนเต็ม) | เสาหลักการประเมิน | ดีเลิศ (16-20) | ดี (13-15) | พอใช้ (10-12) | ไม่ผ่าน (1-9) |\n`;
    rubricMarkdown += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    effectiveRubric.forEach((row) => {
      const fmt = (text: string) => (text || '').replace(/\n/g, '<br>');
      rubricMarkdown += `| **${row.virtueTitle}** (${row.maxScore} คะแนน) | *${row.subPillarTitle}* | ${fmt(row.level4)} | ${fmt(row.level3)} | ${fmt(row.level2)} | ${fmt(row.level1)} |\n`;
    });
  }

  const promptSections = [
    `================================================================================`,
    `🤖 AI SYSTEM PROMPT (คำสั่งบทบาทและหลักเกณฑ์การประเมินโครงการสำหรับระบบ AI)`,
    `================================================================================`,
    systemPrompt,
    `\n---\n`,
    challengeMarkdown,
    `\n---\n`,
    projectMarkdown
  ];

  if (previousRevisionMarkdown) {
    promptSections.push(`\n---\n`, previousRevisionMarkdown);
  } else if (benchmarkMarkdown) {
    promptSections.push(`\n---\n`, benchmarkMarkdown);
  }

  promptSections.push(`\n---\n`, rubricMarkdown);

  const fullCompiledPrompt = promptSections.join('\n');

  return {
    systemPrompt,
    projectMarkdown,
    challengeMarkdown,
    benchmarkMarkdown,
    previousRevisionMarkdown,
    rubricMarkdown,
    fullCompiledPrompt,
    filteredRubric: effectiveRubric
  };
}

export interface SubstantiveQualityProfile {
  qualityScore: number;
  features: {
    governance: number;
    nudge: number;
    socialNorm: number;
    kpi: number;
    threeTier: number;
  };
  strengths: string[];
  gaps: string[];
  isUnmodifiedAiDraft?: boolean;
  humanContributionScore?: number;
  aiDraftNote?: string;
  isOffTopic?: boolean;
  offTopicReason?: string;
}

export interface ChallengeDomainRelevance {
  isOffTopic: boolean;
  mismatchReason?: string;
  challengeDomainName?: string;
  proposalDomainName?: string;
  coreKeywords: string[];
  matchedKeywords: string[];
}

export const KNOWN_PROBLEM_DOMAINS: {
  id: string;
  name: string;
  triggerKeywords: string[];
  subjectKeywords: string[];
}[] = [
  {
    id: 'forest_encroachment',
    name: 'การบุกรุกแผ้วถางป่าต้นน้ำและการตัดไม้ทำลายป่า',
    triggerKeywords: [
      'แผ้วถาง',
      'บุกรุกป่า',
      'ป่าต้นน้ำ',
      'ตัดไม้',
      'รุกป่า',
      'พื้นที่ป่า',
      'อนุรักษ์ป่า',
      'ตะนาวศรี',
      'ปลูกทุเรียน',
      'ทุเรียน',
      'บุกรุก',
      'ป่าไม้',
      'ป่าสงวน',
      'อุทยาน'
    ],
    subjectKeywords: [
      'แผ้วถาง',
      'บุกรุกป่า',
      'ป่าต้นน้ำ',
      'ตัดไม้',
      'รุกป่า',
      'พื้นที่ป่า',
      'อนุรักษ์ป่า',
      'ตะนาวศรี',
      'ทุเรียน',
      'ปลูกทุเรียน',
      'วนเกษตร',
      'ป่าไม้',
      'ป่าสงวน',
      'อุทยาน',
      'ลาดตระเวน',
      'ป่าชุมชน',
      'ฝาย',
      'แนวกันชน',
      'สวนทุเรียน',
      'ต้นน้ำ'
    ]
  },
  {
    id: 'livestock_odor_waste',
    name: 'มลพิษกลิ่นเหม็น น้ำเสีย และฟาร์มสุกร/ปศุสัตว์',
    triggerKeywords: [
      'ฟาร์มสุกร', 'สุกร', 'หมู', 'ฟาร์มหมู', 'กลิ่นเหม็น', 'น้ำเสีย', 'บำบัดน้ำเสีย',
      'ก๊าซชีวภาพ', 'ไบโอแก๊ส', 'บ่อบำบัด', 'ฟาร์มปิด', 'ฟาร์มปศุสัตว์', 'ปศุสัตว์', 'มูลสุกร', 'ขี้หมู', 'มลพิษน้ำเสีย'
    ],
    subjectKeywords: [
      'ฟาร์มสุกร', 'สุกร', 'หมู', 'ฟาร์มหมู', 'กลิ่นเหม็น', 'น้ำเสีย', 'บำบัดน้ำเสีย',
      'ก๊าซชีวภาพ', 'ไบโอแก๊ส', 'บ่อบำบัด', 'ฟาร์มปิด', 'ฟาร์มปศุสัตว์', 'ปศุสัตว์', 'มูลสุกร',
      'ขี้หมู', 'มลพิษ', 'กลิ่นรบกวน', 'ม่านน้ำดับกลิ่น', 'ฟาร์มสีเขียว', 'em', 'จุลินทรีย์', 'ท่าจีน', 'แม่กลอง', 'ลำน้ำ'
    ]
  },
  {
    id: 'gambling',
    name: 'การพนันและเว็บพนันออนไลน์',
    triggerKeywords: ['พนัน', 'เว็บพนัน', 'การพนัน', 'สล็อต', 'บาคาร่า', 'คาสิโน', 'แทงบอล', 'พนันออนไลน์'],
    subjectKeywords: ['พนัน', 'เว็บพนัน', 'การพนัน', 'สล็อต', 'บาคาร่า', 'คาสิโน', 'แทงบอล', 'เกมพนัน', 'เล่นพนัน', 'ติดพนัน', 'โต๊ะบอล', 'พนันออนไลน์']
  },
  {
    id: 'waste',
    name: 'การจัดการขยะและสิ่งแวดล้อมชุมชน',
    triggerKeywords: ['ขยะ', 'สิ่งแวดล้อม', 'ขยะมูลฝอย', 'ขยะเปียก', 'ขยะแห้ง', 'รีไซเคิล', 'คัดแยกขยะ'],
    subjectKeywords: ['ขยะ', 'สิ่งแวดล้อม', 'คัดแยกขยะ', 'ขยะเปียก', 'ขยะแห้ง', 'รีไซเคิล', 'ขยะมูลฝอย', 'ถังขยะ', 'มลพิษขยะ', 'ทิ้งขยะ']
  },
  {
    id: 'wildfire',
    name: 'หมอกควัน ไฟป่า และ PM2.5',
    triggerKeywords: ['ไฟป่า', 'หมอกควัน', 'pm2.5', 'pm 2.5', 'เผาป่า'],
    subjectKeywords: ['ไฟป่า', 'หมอกควัน', 'pm2.5', 'pm 2.5', 'ควัน', 'เผาป่า', 'จุดไฟ', 'มลพิษทางอากาศ', 'ฮอตสปอต', 'hotspot']
  },
  {
    id: 'drugs',
    name: 'ยาเสพติดและเยาวชนกลุ่มเสี่ยง',
    triggerKeywords: ['ยาเสพติด', 'สารเสพติด', 'ยาบ้า', 'ผู้เสพยา'],
    subjectKeywords: ['ยาเสพติด', 'สารเสพติด', 'ยาบ้า', 'ผู้เสพ', 'ผู้ติดยา', 'บำบัดยาเสพติด', 'ค้ายา', 'ยาไอซ์']
  },
  {
    id: 'flooding',
    name: 'ภัยพิบัติน้ำท่วมและอุทกภัย',
    triggerKeywords: ['น้ำท่วม', 'อุทกภัย', 'น้ำหลาก', 'ระบายน้ำไม่ทัน', 'น้ำล้นตลิ่ง', 'น้ำท่วมซ้ำซาก', 'พื้นที่ลุ่มต่ำ', 'ภัยพิบัติน้ำท่วม', 'น้ำท่วมขัง'],
    subjectKeywords: ['น้ำท่วม', 'อุทกภัย', 'ภัยพิบัติ', 'ระบายน้ำ', 'น้ำหลาก', 'แก้มลิง', 'น้ำเอ่อ', 'แนวกั้นน้ำ', 'กระสอบทราย', 'น้ำท่วมขัง', 'พื้นที่ลุ่มต่ำ', 'น้ำท่วมซ้ำซาก']
  },
  {
    id: 'elderly_bedridden',
    name: 'การดูแลผู้สูงอายุติดเตียงและกลุ่มเปราะบาง',
    triggerKeywords: ['ผู้สูงอายุ', 'ติดเตียง', 'สูงวัย', 'คนแก่', 'ผู้ป่วยติดเตียง', 'ติดบ้านติดเตียง', 'ผู้มีภาวะพึ่งพิง', 'วัยชรา'],
    subjectKeywords: ['ผู้สูงอายุ', 'ติดเตียง', 'สูงวัย', 'คนแก่', 'ผู้ป่วยติดเตียง', 'ติดบ้านติดเตียง', 'ผู้มีภาวะพึ่งพิง', 'วัยชรา', 'caregiver', 'รพ.สต.', 'แผลกดทับ', 'กายภาพบำบัด', 'ผู้บริบาล', 'ผ้าอ้อมผู้ใหญ่', 'อสม.เยี่ยมบ้าน']
  },
  {
    id: 'traffic_safety',
    name: 'วินัยจราจรและความปลอดภัยทางถนน',
    triggerKeywords: ['จราจร', 'ทางม้าลาย', 'หมวกนิรภัย', 'หมวกกันน็อก', 'ข้ามถนน', 'อุบัติเหตุบนถนน', 'ขับขี่'],
    subjectKeywords: ['จราจร', 'ทางม้าลาย', 'หมวกนิรภัย', 'หมวกกันน็อก', 'ข้ามถนน', 'ขับขี่', 'ไฟแดง', 'ความเร็ว', 'คนเดินเท้า', 'ทางข้าม']
  },
  {
    id: 'cyber_scam',
    name: 'ภัยไซเบอร์ บัญชีม้า และมิจฉาชีพออนไลน์',
    triggerKeywords: ['ไซเบอร์', 'บัญชีม้า', 'กลโกง', 'มิจฉาชีพ', 'หลอกลวง', 'คอลเซ็นเตอร์', 'phishing'],
    subjectKeywords: ['ไซเบอร์', 'บัญชีม้า', 'กลโกง', 'มิจฉาชีพ', 'หลอกลวง', 'คอลเซ็นเตอร์', 'แก๊งคอลเซ็นเตอร์', 'โอนเงิน', 'หลอกลงทุน']
  },
  {
    id: 'labor_slum',
    name: 'แรงงานและชุมชนแออัด',
    triggerKeywords: ['แรงงาน', 'ชุมชนแออัด', 'โรงงาน', 'ผู้ใช้แรงงาน'],
    subjectKeywords: ['แรงงาน', 'ชุมชนแออัด', 'โรงงาน', 'ผู้ใช้แรงงาน', 'คนงาน', 'ห้องเช่า', 'แคมป์คนงาน']
  },
  {
    id: 'debt',
    name: 'หนี้สินนอกระบบและความยากจน',
    triggerKeywords: ['หนี้สิน', 'หนี้นอกระบบ', 'กู้เงิน', 'ดอกเบี้ยโหด'],
    subjectKeywords: ['หนี้สิน', 'หนี้นอกระบบ', 'กู้เงิน', 'ดอกเบี้ย', 'เงินกู้', 'เจ้าหนี้', 'นายทุนเงินกู้']
  },
  {
    id: 'corruption',
    name: 'การทุจริตคอร์รัปชันและความไม่โปร่งใส',
    triggerKeywords: ['ทุจริต', 'คอร์รัปชัน', 'สินบน', 'โกง'],
    subjectKeywords: ['ทุจริต', 'คอร์รัปชัน', 'สินบน', 'โกง', 'ฮั้ว', 'เบียดบัง', 'โปร่งใส']
  },
  {
    id: 'marine_waste',
    name: 'ขยะทะเลและระบบนิเวศชายฝั่ง',
    triggerKeywords: ['ขยะทะเล', 'ชายฝั่ง', 'ปะการัง', 'สัตว์ทะเล'],
    subjectKeywords: ['ขยะทะเล', 'ชายฝั่ง', 'ปะการัง', 'สัตว์น้ำ', 'ทะเล', 'ชายหาด', 'ไมโครพลาสติก']
  }
];

export function checkChallengeDomainRelevance(
  proposalInput: string | {
    projectName?: string;
    targetAudience?: string;
    targetArea?: string;
    proposalDetails?: string;
    activityPlan?: string;
    behavioralKpi?: string;
  },
  challengeStatement?: string
): ChallengeDomainRelevance {
  if (!challengeStatement || challengeStatement.trim().length < 3) {
    return {
      isOffTopic: false,
      coreKeywords: [],
      matchedKeywords: []
    };
  }

  const cText = challengeStatement.toLowerCase();

  // Extract text fields
  let pName = '';
  let pAud = '';
  let pDetails = '';
  let pPlan = '';
  let pKpi = '';

  if (typeof proposalInput === 'string') {
    pDetails = proposalInput.toLowerCase();
  } else if (proposalInput && typeof proposalInput === 'object') {
    pName = (proposalInput.projectName || '').toLowerCase();
    pAud = (proposalInput.targetAudience || '').toLowerCase();
    pDetails = (proposalInput.proposalDetails || '').toLowerCase();
    pPlan = (proposalInput.activityPlan || '').toLowerCase();
    pKpi = (proposalInput.behavioralKpi || '').toLowerCase();
  }

  const fullProposalText = `${pName} ${pAud} ${pDetails} ${pPlan} ${pKpi}`.trim();

  // 1. Detect challenge domain with keyword scoring
  let detectedChallengeDomain: typeof KNOWN_PROBLEM_DOMAINS[0] | undefined;
  let maxChallengeScore = 0;
  for (const domain of KNOWN_PROBLEM_DOMAINS) {
    let score = 0;
    for (const kw of domain.triggerKeywords) {
      if (cText.includes(kw)) score += 3;
    }
    for (const kw of domain.subjectKeywords) {
      if (cText.includes(kw)) score += 1;
    }
    if (score > maxChallengeScore) {
      maxChallengeScore = score;
      detectedChallengeDomain = domain;
    }
  }

  // 2. Detect dominant proposal domain (Weighted Domain Detection)
  // ชื่อโครงการ (projectName) น้ำหนัก 5x, กลุ่มเป้าหมาย (targetAudience) น้ำหนัก 3x, เนื้อหา/แผนงาน น้ำหนัก 1x
  let dominantProposalDomain: typeof KNOWN_PROBLEM_DOMAINS[0] | undefined;
  let maxProposalScore = 0;
  const domainScores: Record<string, number> = {};

  for (const domain of KNOWN_PROBLEM_DOMAINS) {
    let score = 0;
    // ตรวจสอบในชื่อโครงการ (น้ำหนักสูงสุด 5x)
    for (const kw of domain.triggerKeywords) {
      if (pName.includes(kw)) score += 5.0;
    }
    for (const kw of domain.subjectKeywords) {
      if (pName.includes(kw)) score += 3.0;
    }

    // ตรวจสอบในกลุ่มเป้าหมาย (น้ำหนัก 3x)
    for (const kw of domain.triggerKeywords) {
      if (pAud.includes(kw)) score += 3.0;
    }
    for (const kw of domain.subjectKeywords) {
      if (pAud.includes(kw)) score += 2.0;
    }

    // ตรวจสอบในรายละเอียดและแผนกิจกรรม (น้ำหนัก 1x)
    const bodyText = `${pDetails} ${pPlan} ${pKpi}`;
    for (const kw of domain.triggerKeywords) {
      if (bodyText.includes(kw)) score += 1.5;
    }
    for (const kw of domain.subjectKeywords) {
      if (bodyText.includes(kw)) score += 1.0;
    }

    domainScores[domain.id] = score;
    if (score > maxProposalScore) {
      maxProposalScore = score;
      dominantProposalDomain = domain;
    }
  }

  // 3. เปรียบเทียบความสอดคล้องระหว่างโดเมนโจทย์และโดเมนโครงการ
  if (detectedChallengeDomain) {
    const matched = detectedChallengeDomain.subjectKeywords.filter((k) => fullProposalText.includes(k));
    const challengeScoreInProposal = domainScores[detectedChallengeDomain.id] || 0;

    // เกิดข้อขัดแย้งของโดเมน: โดเมนหลักของโครงการเป็นคนละเรื่องกับโจทย์อย่างสิ้นเชิง และข้อเสนอไม่มีความเชื่อมโยงกับโจทย์ความท้าทาย
    const isDomainConflict = Boolean(
      dominantProposalDomain &&
      detectedChallengeDomain.id !== dominantProposalDomain.id &&
      maxProposalScore >= 5.0 &&
      challengeScoreInProposal < 1.5 &&
      matched.length === 0
    );

    if ((matched.length === 0 && challengeScoreInProposal === 0) || isDomainConflict) {
      const propDesc = dominantProposalDomain
        ? `เรื่อง "${dominantProposalDomain.name}"`
        : 'ประเด็นอื่นที่ไม่ตรงกับโจทย์';
      return {
        isOffTopic: true,
        mismatchReason: `โจทย์ความท้าทายคือ "${detectedChallengeDomain.name}" แต่ข้อเสนอโครงการมุ่งเน้น ${propDesc} ซึ่งไม่ได้เป็นทิศทางเดียวในการแก้ปัญหาตามโจทย์ความท้าทาย`,
        challengeDomainName: detectedChallengeDomain.name,
        proposalDomainName: dominantProposalDomain?.name,
        coreKeywords: detectedChallengeDomain.subjectKeywords,
        matchedKeywords: matched
      };
    }

    return {
      isOffTopic: false,
      challengeDomainName: detectedChallengeDomain.name,
      proposalDomainName: dominantProposalDomain?.name,
      coreKeywords: detectedChallengeDomain.subjectKeywords,
      matchedKeywords: matched
    };
  }

  // For arbitrary / custom challenge prompts:
  // Extract substantive tokens excluding Thai structural words, province names, and virtues
  const stopWords = new Set([
    'ให้', 'คิด', 'ด้าน', 'และ', 'เพื่อ', 'การ', 'ของ', 'ใน', 'ช่วย', 'แก้',
    'ปัญหา', 'แก้ปัญหา', 'โครงการ', 'ที่', 'สามารถ', 'โดย', 'เป็น', 'มี',
    'จ', 'จังหวัด', 'อยุธยา', 'ลำปาง', 'อุดรธานี', 'สุราษฎร์ธานี', 'กรุงเทพ', 'ราชบุรี', 'นครปฐม',
    'พอเพียง', 'วินัย', 'สุจริต', 'จิตอาสา', 'กตัญญู', 'คุณธรรม',
    'ส่งเสริม', 'สร้าง', 'พัฒนา', 'ยกระดับ', 'ขับเคลื่อน', 'แก้ไข', 'ชุมชน'
  ]);

  // ล้างข้อความนำหน้าโจทย์มาตรฐาน เช่น "ให้คิดโครงการแก้ปัญหา...", "โครงการแก้ปัญหา..."
  const cleanCText = cText
    .replace(/^(?:ให้คิดโครงการแก้ปัญหา|ให้คิดโครงการแก้|โครงการแก้ปัญหา|การแก้ปัญหา|แก้ปัญหา|ให้คิดโครงการ|โครงการ|ปัญหา)\s*/g, '')
    .trim();

  // แยกคำด้วยเครื่องหมายวรรคตอน ช่องว่าง และคำเชื่อมภาษาไทย
  const thaiSplitter = /[\s,，、:：""''“”\-_()\[\]/]+|(?:และ|หรือ|กับ|จาก|ใน|บน|เพื่อ|โดย|ของ|ที่|ต่อ|ทาง|ด้าน|รอบ|ระหว่าง|เนื่องจาก|จนถึง|สู่|ขนาดใหญ่|กระทบ)/g;
  const rawTokens = cleanCText
    .split(thaiSplitter)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !stopWords.has(t));

  // แตกคีย์เวิร์ดประเด็นสำคัญ (Domain keywords & Subwords) จากโจทย์
  const commonDomainSubwords = [
    'แผ้วถาง', 'บุกรุก', 'ป่าต้นน้ำ', 'ตะนาวศรี', 'ทุเรียน', 'ปลูกทุเรียน', 'ตัดไม้', 'ป่าไม้', 'ป่าสงวน', 'วนเกษตร', 'อนุรักษ์ป่า', 'ป่าชุมชน', 'ลาดตระเวน', 'แนวกันชน', 'สวนทุเรียน',
    'ฟาร์มสุกร', 'สุกร', 'ฟาร์มหมู', 'กลิ่นเหม็น', 'น้ำเสีย', 'บำบัดน้ำเสีย', 'ก๊าซชีวภาพ', 'ไบโอแก๊ส', 'ปศุสัตว์', 'มูลสัตว์', 'มูลสุกร', 'ขี้หมู', 'ดับกลิ่น', 'ฟาร์มปิด', 'บ่อบำบัด',
    'พนัน', 'เว็บพนัน', 'สล็อต', 'บาคาร่า', 'คาสิโน', 'เกมออนไลน์',
    'ขยะ', 'รีไซเคิล', 'คัดแยกขยะ', 'มลพิษขยะ',
    'ไฟป่า', 'หมอกควัน', 'pm2.5', 'เผาป่า', 'ฮอตสปอต',
    'ยาเสพติด', 'ยาบ้า', 'สารเสพติด',
    'น้ำท่วม', 'อุทกภัย', 'ระบายน้ำ', 'แก้มลิง',
    'ติดเตียง', 'ผู้สูงอายุ', 'สูงวัย',
    'ทางม้าลาย', 'จราจร', 'หมวกนิรภัย', 'หมวกกันน็อก',
    'ไซเบอร์', 'บัญชีม้า', 'คอลเซ็นเตอร์', 'หลอกลวง',
    'หนี้สิน', 'หนี้นอกระบบ', 'เงินกู้',
    'ทุจริต', 'คอร์รัปชัน', 'สินบน'
  ];
  for (const kw of commonDomainSubwords) {
    if (cText.includes(kw) && !rawTokens.includes(kw)) {
      rawTokens.push(kw);
    }
  }

  // คำพ้องความหมายเชิงสาเหตุและมาตรการแก้ปัญหาในทิศทางเดียวกัน (Directional & Semantic Synonyms)
  const directionalSynonyms: Record<string, string[]> = {
    'แผ้วถาง': ['วนเกษตร', 'ฟื้นฟูป่า', 'รักษาป่า', 'ลาดตระเวน', 'ต้นน้ำ', 'ปลูกต้นไม้', 'ป่าชุมชน', 'ตัดไม้'],
    'บุกรุก': ['แนวเขตป่า', 'ลาดตระเวน', 'กติกาป่า', 'รักษาป่า', 'ป่าสงวน', 'ป่าต้นน้ำ', 'แนวกันชน'],
    'ป่าต้นน้ำ': ['วนเกษตร', 'ฟื้นฟูป่า', 'ฝาย', 'ต้นน้ำ', 'รักษาป่า', 'อนุรักษ์ป่า', 'ลาดตระเวน'],
    'ตะนาวศรี': ['ป่าต้นน้ำ', 'ทุเรียน', 'วนเกษตร', 'ผืนป่า', 'อนุรักษ์ป่า'],
    'ทุเรียน': ['สวนทุเรียน', 'วนเกษตร', 'ใต้ร่มเงา', 'เกษตรผสมผสาน', 'ป่าต้นน้ำ'],
    'ฟาร์มสุกร': ['ฟาร์มหมู', 'มูลสุกร', 'ขี้หมู', 'บำบัดน้ำเสีย', 'ก๊าซชีวภาพ', 'ไบโอแก๊ส', 'ดับกลิ่น', 'ฟาร์มปิด'],
    'น้ำเสีย': ['บำบัดน้ำ', 'คุณภาพน้ำ', 'ดักกลิ่น', 'บ่อบำบัด', 'ฟาร์มปิด', 'ไบโอแก๊ส', 'น้ำใส'],
    'กลิ่นเหม็น': ['ดับกลิ่น', 'ม่านน้ำ', 'ก๊าซชีวภาพ', 'ฟาร์มปิด', 'จุลินทรีย์', 'em', 'กลิ่นรบกวน']
  };
  for (const [key, syns] of Object.entries(directionalSynonyms)) {
    if (cText.includes(key)) {
      for (const syn of syns) {
        if (!rawTokens.includes(syn)) rawTokens.push(syn);
      }
    }
  }

  if (rawTokens.length > 0) {
    const matched = rawTokens.filter((t) => fullProposalText.includes(t));
    if (matched.length === 0) {
      return {
        isOffTopic: true,
        mismatchReason: `ข้อเสนอโครงการไม่ตรงกับโจทย์ความท้าทายที่ตั้งไว้: ไม่พบคำสำคัญหรือแนวคิดที่ตอบโจทย์ "${challengeStatement.slice(0, 50)}..."`,
        coreKeywords: rawTokens,
        matchedKeywords: matched
      };
    }
    return {
      isOffTopic: false,
      coreKeywords: rawTokens,
      matchedKeywords: matched
    };
  }

  return {
    isOffTopic: false,
    coreKeywords: [],
    matchedKeywords: []
  };
}

export interface AiDraftDetectionResult {
  isAiDraft: boolean;
  isUntouched: boolean;
  humanEditRatio: number; // 0.0 ถึง 1.0
  reason?: string;
}

export const AI_BOILERPLATE_PATTERNS = [
  'Action & Intervention Strategy',
  'Expected Behavioral Transformation Mechanism',
  'Immediate Incentive & Visual Feedback',
  'Habit Loop: Cue -> Routine -> Reward',
  'Social Proof & Moral Identity',
  'Storytelling & Emotional Resonance',
  'Sunlight Effect & Social Deterrence',
  'Choice Architecture & Frictionless Setup',
  'Nudge & Choice Architecture',
  'Default Bias & Salience Nudge',
  'Social Accountability & Collective Pride',
  'Intergenerational Mentorship & Gratitude Nudge',
  'Loss Aversion & Transparent Feedback',
  'Clean & Clear Procurement Protocol',
  'Zero-Waste & Smart Saving Bank',
  'Digital Whistleblower Guard',
  'Smart Helmet & RFID Tag',
  'วิธีการที่จะดำเนินงานว่าทำอย่างไร',
  'แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้',
  'สภาวะเดิมก่อนปรับ:',
  'กลไกสะกิดพฤติกรรม',
  'วงจรนิสัยใหม่',
  'กลุ่มเป้าหมายมากกว่าร้อยละ 85 มีพฤติกรรมเชิงบวกเพิ่มขึ้นอย่างเป็นรูปธรรม'
];

export const AI_CORE_TEMPLATE_KEYPHRASES = [
  'คลินิกวินัยการเงินและสัจจะดิจิทัล',
  'ธนาคารขยะคุณธรรมและกองทุนสัจจะออมทรัพย์',
  'ตู้ขยะรีไซเคิลอัจฉริยะ',
  'Cyber Shield & วัคซีนไซเบอร์',
  'ศูนย์ปฏิบัติการเยาวชนสกัดกั้นบัญชีม้า',
  'ทางม้าลายอัจฉริยะ',
  'ศูนย์ปฏิบัติการจราจรปลอดภัย 360 องศา',
  'สภาพลเมืองตรวจสอบความโปร่งใส',
  'กล่องข้อความจริยธรรม',
  'ธนาคารเวลาจิตอาสา',
  'หน่วยเคลื่อนที่เร็ว จิตอาสาเพื่อนช่วยเพื่อน',
  'สายใยรักกตัญญูออนไลน์',
  'เครือข่ายยุวชนกตัญญู',
  'กระดานเปิดตาโปร่งใส',
  'Financial Freedom Lab',
  'Smart Saving Bank',
  'Reverse Vending',
  'Smart Crosswalk',
  'Moral Time Bank'
];

export function detectIsAiDraftBoilerplate(project: {
  projectName?: string;
  proposalDetails?: string;
  activityPlan?: string;
  behavioralKpi?: string;
  targetMoralVirtue?: string;
  aiDraftSnapshot?: {
    projectName?: string;
    proposalDetails?: string;
    activityPlan?: string;
    behavioralKpi?: string;
  } | null;
}): AiDraftDetectionResult {
  const name = (project.projectName || '').trim();
  const details = (project.proposalDetails || '').trim();
  const plan = (project.activityPlan || '').trim();
  const kpi = (project.behavioralKpi || '').trim();
  const currFull = `${name} ${details} ${plan} ${kpi}`.trim();

  // 1. Direct Snapshot Comparison (ความแม่นยำสูงสุดเมื่อส่งมาจาก UI หรือ Session)
  if (project.aiDraftSnapshot) {
    const snap = project.aiDraftSnapshot;
    const snapName = (snap.projectName || '').trim();
    const snapDetails = (snap.proposalDetails || '').trim();
    const snapPlan = (snap.activityPlan || '').trim();
    const snapKpi = (snap.behavioralKpi || '').trim();
    const snapFull = `${snapName} ${snapDetails} ${snapPlan} ${snapKpi}`.trim();

    if (snapFull.length > 30) {
      // ตรงกับ Snapshot ทุกประการ
      if (currFull === snapFull || (details === snapDetails && plan === snapPlan)) {
        return {
          isAiDraft: true,
          isUntouched: true,
          humanEditRatio: 0.0,
          reason: 'เนื้อหาโครงการตรงกับฉบับร่างตั้งต้นที่สร้างโดย AI 100% โดยยังไม่มีการปรับปรุงเพิ่มโดยมนุษย์'
        };
      }

      const charDiff = Math.abs(currFull.length - snapFull.length);
      const isDetailsEqual = details === snapDetails;
      const isPlanEqual = plan === snapPlan;

      if ((isDetailsEqual && charDiff < 20) || (isPlanEqual && charDiff < 20)) {
        return {
          isAiDraft: true,
          isUntouched: true,
          humanEditRatio: 0.05,
          reason: 'มีการแก้ไขเพียงเล็กน้อย ยังไม่มีการเพิ่มรายละเอียดเชิงปฏิบัติการหรือภาคีในพื้นที่'
        };
      }

      const editRatio = Math.min(1.0, Math.max(0.20, charDiff / Math.max(120, snapFull.length * 0.35)));
      return {
        isAiDraft: true,
        isUntouched: false,
        humanEditRatio: Number(editRatio.toFixed(2)),
        reason: 'ได้รับการปรับปรุงเพิ่มเติมรายละเอียดโดยมนุษย์'
      };
    }
  }

  // 2. ตรวจสอบ placeholder จาก AI เช่น [จุดที่ผู้เข้าร่วมกิจกรรม...] หรือ [รอผู้เข้าร่วมกิจกรรม...]
  const hasPlaceholders =
    currFull.includes('จุดที่ผู้เข้าร่วมกิจกรรมสามารถช่วย AI ปรับปรุงเพิ่มเติม') ||
    currFull.includes('รอผู้เข้าร่วมกิจกรรมช่วยเติม') ||
    currFull.includes('รอผู้เข้าร่วมกิจกรรมช่วยระบุ');

  if (hasPlaceholders) {
    return {
      isAiDraft: true,
      isUntouched: true,
      humanEditRatio: 0.0,
      reason: 'ตรวจพบข้อความ placeholder จากระบบ AI Ideation ที่รอผู้เข้าร่วมกิจกรรมช่วยเติม'
    };
  }

  return {
    isAiDraft: false,
    isUntouched: false,
    humanEditRatio: 1.0,
    reason: 'ข้อเสนอโครงการเขียนหรือปรับปรุงโดยมนุษย์'
  };
}

export function checkIsProjectIdentical(
  candidate: {
    projectName?: string;
    proposalDetails?: string;
    activityPlan?: string;
    targetMoralVirtue?: string;
    targetArea?: string;
    targetAudience?: string;
    behavioralKpi?: string;
  },
  anchor?: BenchmarkProjectAnchor | null
): boolean {
  if (!anchor || !anchor.name) return false;

  const clean = (s?: string) =>
    (s || '')
      .toLowerCase()
      .replace(/[\s\-_,.:;()\/\[\]"'\r\n]+/g, '')
      .trim();

  const candName = clean(candidate.projectName);
  const anchorName = clean(anchor.name);
  if (!candName || !anchorName || candName !== anchorName) return false;

  const candDetails = clean(candidate.proposalDetails);
  const anchorDetails = clean(anchor.proposalDetails);
  if (candDetails !== anchorDetails) return false;

  const candPlan = clean(candidate.activityPlan);
  const anchorPlan = clean(anchor.activityPlan);
  if (candPlan !== anchorPlan) return false;

  const candKpi = clean(candidate.behavioralKpi);
  const anchorKpi = clean(anchor.behavioralKpi);
  if (candKpi !== anchorKpi) return false;

  return true;
}

export function calculateSubstantiveQualityProfile(
  project: {
    projectName?: string;
    proposalDetails?: string;
    activityPlan?: string;
    behavioralKpi?: string;
    targetMoralVirtue?: string;
    aiDraftSnapshot?: {
      projectName?: string;
      proposalDetails?: string;
      activityPlan?: string;
      behavioralKpi?: string;
    } | null;
  },
  challengeStatement?: string
): SubstantiveQualityProfile {
  const name = project.projectName || '';
  const details = project.proposalDetails || '';
  const plan = project.activityPlan || '';
  const kpi = project.behavioralKpi || '';

  // ตัดข้อความแนะนำในวงเล็บ [จุดที่ผู้เข้าร่วม...] และ [รอผู้เข้าร่วม...] ออกก่อนวิเคราะห์
  // เพื่อให้ข้อเสนอฉบับร่างที่ยังไม่ได้รับการปรับปรุงจากมนุษย์มีคะแนนอยู่ในช่วง 60 - 80 คะแนนตามจริง
  const sanitizeText = (txt: string) => txt.replace(/\[(?:จุดที่ผู้เข้าร่วมกิจกรรม|รอผู้เข้าร่วมกิจกรรม).*?\]/g, ' ');
  const cleanDetails = sanitizeText(details);
  const cleanPlan = sanitizeText(plan);
  const cleanKpi = sanitizeText(kpi);

  const fullText = `${name} ${cleanDetails} ${cleanPlan} ${cleanKpi}`.toLowerCase();

  const strengths: string[] = [];
  const gaps: string[] = [];

  // 1. Governance & Community Charters (max 20)
  let governance = 8.5;
  if (
    fullText.includes('mou') ||
    fullText.includes('ธรรมนูญ') ||
    fullText.includes('ข้อตกลงร่วม') ||
    fullText.includes('กติกา') ||
    fullText.includes('ระเบียบ') ||
    fullText.includes('นโยบาย') ||
    fullText.includes('มติประชาคม') ||
    fullText.includes('ธรรมนูญชุมชน')
  ) {
    governance += 9.5;
    strengths.push('มีกติกาประชาคม/ข้อตกลงร่วมและกลไกเชิงนโยบายชัดเจน');
  } else {
    gaps.push('ยังขาดข้อตกลงร่วม/ธรรมนูญชุมชนระดับนโยบาย');
  }
  governance = Math.min(20.0, governance);

  // 2. Choice Architecture & Nudges (max 25)
  let nudge = 9.5;
  if (
    fullText.includes('แอป') ||
    fullText.includes('แต้ม') ||
    fullText.includes('ระบบ') ||
    fullText.includes('ai') ||
    fullText.includes('จุด') ||
    fullText.includes('สถานี') ||
    fullText.includes('เซนเซอร์') ||
    fullText.includes('กล่อง') ||
    fullText.includes('บอร์ด') ||
    fullText.includes('ป้ายเตือน') ||
    fullText.includes('ดิจิทัล') ||
    fullText.includes('qr') ||
    fullText.includes('แรงจูงใจ') ||
    fullText.includes('ธนาคาร') ||
    fullText.includes('nudge')
  ) {
    nudge += 13.5;
    strengths.push('มีการออกแบบสถาปัตยกรรมทางเลือก (Nudge) และเครื่องมือลดแรงเสียดทาน');
  } else {
    gaps.push('ยังขาดเครื่องมือสถาปัตยกรรมทางเลือก (Nudge) ช่วยสะกิดพฤติกรรมในชีวิตประจำวัน');
  }
  nudge = Math.min(25.0, nudge);

  // 3. Social Norm & Peer Monitoring (max 20)
  let socialNorm = 8.5;
  if (
    fullText.includes('เพื่อน') ||
    fullText.includes('อาสา') ||
    fullText.includes('เครือข่าย') ||
    fullText.includes('ครอบครัว') ||
    fullText.includes('ชุมชน') ||
    fullText.includes('ยกย่อง') ||
    fullText.includes('เชิดชู') ||
    fullText.includes('บวร') ||
    fullText.includes('แกนนำ') ||
    fullText.includes('กลุ่มเพื่อน')
  ) {
    socialNorm += 9.5;
    strengths.push('มีกลไกกำกับดูแลทางสังคมและพลังเพื่อนเตือนเพื่อน');
  } else {
    gaps.push('ยังขาดกลไกการมีส่วนร่วมในระดับกลุ่มเพื่อนและครอบครัว');
  }
  socialNorm = Math.min(20.0, socialNorm);

  // 4. Empirical KPI & Measurement (max 20)
  let kpiScore = 7.5;
  if (
    fullText.includes('%') ||
    fullText.includes('ร้อยละ') ||
    fullText.includes('คน') ||
    fullText.includes('ลดลง') ||
    fullText.includes('เพิ่มขึ้น') ||
    fullText.includes('เดือน') ||
    fullText.includes('ครัวเรือน') ||
    fullText.includes('บาท')
  ) {
    kpiScore += 11.0;
    strengths.push('มีตัวชี้วัดเชิงประจักษ์ (Empirical KPI) และเป้าหมายตัวเลขชัดเจน');
  } else {
    gaps.push('ยังขาดตัวชี้วัดเชิงประจักษ์และเป้าหมายตัวเลขเชิงปริมาณ');
  }
  kpiScore = Math.min(20.0, kpiScore);

  // 5. Three-Tier Coverage (max 15)
  let threeTier = 5.0;
  const hasPolicy =
    fullText.includes('นโยบาย') ||
    fullText.includes('ผู้นำ') ||
    fullText.includes('อบต') ||
    fullText.includes('เทศบาล') ||
    fullText.includes('อำเภอ') ||
    fullText.includes('ระดับ 1');
  const hasPractitioner =
    fullText.includes('ผู้ปฏิบัติการ') ||
    fullText.includes('แกนนำ') ||
    fullText.includes('ครู') ||
    fullText.includes('อสม') ||
    fullText.includes('เจ้าหน้าที่') ||
    fullText.includes('ระดับ 2');
  const hasCitizen =
    fullText.includes('ประชาชน') ||
    fullText.includes('ชาวบ้าน') ||
    fullText.includes('นักเรียน') ||
    fullText.includes('เยาวชน') ||
    fullText.includes('ชุมชน') ||
    fullText.includes('ระดับ 3');

  const tierCount = (hasPolicy ? 1 : 0) + (hasPractitioner ? 1 : 0) + (hasCitizen ? 1 : 0);
  if (tierCount >= 3) {
    threeTier += 9.5;
    strengths.push('ครอบคลุมกลไกขับเคลื่อนครบ 3 ระดับ (นโยบาย, ผู้ปฏิบัติการ, ประชาชน)');
  } else if (tierCount >= 2) {
    threeTier += 5.5;
  } else {
    gaps.push('การมีส่วนร่วมยังไม่ครอบคลุมครบ 3 ระดับ');
  }
  threeTier = Math.min(15.0, threeTier);

  // Challenge Alignment Bonus (max 5)
  let alignmentBonus = 0;
  if (challengeStatement && challengeStatement.trim().length > 0) {
    const rawTokens = challengeStatement
      .split(/[\s,，、:：""''“”]+/)
      .filter((t) => t.length >= 2 && !['ให้', 'คิด', 'ด้าน', 'และ', 'เพื่อ', 'การ', 'ของ', 'ใน', 'ช่วย', 'แก้', 'ปัญหา', 'แก้ปัญหา', 'โครงการ', 'ที่', 'สามารถ', 'โดย', 'เป็น'].includes(t));
    let matchedCount = 0;
    for (const token of rawTokens) {
      if (fullText.includes(token.toLowerCase())) {
        matchedCount++;
      }
    }
    if (matchedCount > 0) {
      alignmentBonus += Math.min(3.5, 1.2 + matchedCount * 0.8);
      strengths.push(`สอดคล้องกับโจทย์ความท้าทาย: โครงการมุ่งเน้นการแก้โจทย์ "${challengeStatement.slice(0, 45)}..." ได้อย่างชัดเจน`);
    } else {
      gaps.push(`ยังไม่เชื่อมโยงกับโจทย์ความท้าทาย "${challengeStatement.slice(0, 35)}..." อย่างชัดเจน`);
    }
  }
  if (details.length > 100) alignmentBonus += 1.5;

  const total = Math.min(100.0, Math.max(30.0, governance + nudge + socialNorm + kpiScore + threeTier + alignmentBonus));

  // 0. ตรวจสอบความสอดคล้องกับโจทย์ความท้าทาย (Challenge Relevance & Domain Gate)
  const relevance = checkChallengeDomainRelevance(project, challengeStatement);
  if (relevance.isOffTopic) {
    const penalizedScore = 13.50; // บังคับให้ได้คะแนนต่ำมาก (ระดับกำลังพัฒนา 0-49%)
    return {
      qualityScore: penalizedScore,
      features: {
        governance: 3.0,
        nudge: 4.0,
        socialNorm: 4.0,
        kpi: 3.0,
        threeTier: 2.0
      },
      strengths: ['มีรูปแบบและโครงสร้างการเขียนข้อเสนอ แต่เนื้อหาไม่ได้เป็นทิศทางเดียวในการแก้ปัญหาตามโจทย์ความท้าทาย'],
      gaps: [
        relevance.mismatchReason || `❌ ข้อเสนอโครงการไม่ตรงกับโจทย์ความท้าทาย "${challengeStatement}": เนื้อหาโครงการเป็นเรื่องอื่นอย่างสิ้นเชิง กรุณาปรับเปลี่ยนสาระสำคัญให้มุ่งเน้นการแก้ปัญหาตามโจทย์โดยตรง`,
        'แนวคิดกิจกรรมและกลไก Nudge ต้องถูกออกแบบมาเพื่อปรับเปลี่ยนพฤติกรรมในโจทย์ปัญหาที่เลือก'
      ],
      isUnmodifiedAiDraft: false,
      humanContributionScore: 0,
      aiDraftNote: '⚠️ ข้อเสนอโครงการไม่ผ่านเกณฑ์เบื้องต้นเนื่องจากเนื้อหาไม่ได้เป็นทิศทางเดียวในการแก้ปัญหาโจทย์ความท้าทาย',
      isOffTopic: true,
      offTopicReason: relevance.mismatchReason
    };
  }

  // ตรวจจับสถานะข้อเสนอฉบับร่างจาก AI เพื่อกำหนดบันทึกสะท้อนผล
  const draftInfo = detectIsAiDraftBoilerplate(project);

  let finalQualityScore = Number(total.toFixed(2));
  let isUnmodifiedAiDraft = draftInfo.isAiDraft && draftInfo.isUntouched;
  let humanContributionScore = isUnmodifiedAiDraft ? 0 : 100;
  let aiDraftNote: string | undefined = undefined;

  if (isUnmodifiedAiDraft) {
    finalQualityScore = Number(Math.min(78.50, Math.max(74.00, finalQualityScore > 80 ? 76.50 + ((finalQualityScore * 7) % 2.0) : finalQualityScore)).toFixed(2));
    aiDraftNote = `✨ โครงการฉบับร่างตั้งต้นจาก AI (คะแนนประเมิน ${finalQualityScore.toFixed(2)} คะแนน ระดับ 'ดี' ไม่เกิน 80.00 คะแนนตามเกณฑ์) แนะนำให้ท่านและทีมงานร่วมกันปรับปรุง เพิ่มเติมชื่อหน่วยงานจริง แผนกิจกรรมเชิงรุก และตัวชี้วัดเฉพาะพื้นที่เพื่อยกระดับผลลัพธ์สู่ 85 - 100 คะแนน`;
    gaps.unshift('สามารถเพิ่มการระบุบทบาทภาคีเครือข่ายเฉพาะพื้นที่และแผนปฏิบัติการเชิงลึกร่วมกับคนในชุมชน');
  } else if (draftInfo.isAiDraft && !draftInfo.isUntouched) {
    humanContributionScore = Math.round((draftInfo.humanEditRatio || 0.5) * 100);
    aiDraftNote = `✨ ได้รับการปรับปรุงต่อยอดรายละเอียดโดยผู้ส่งโครงการ`;
    strengths.unshift(`ได้รับการปรับปรุงและต่อยอดรายละเอียดเฉพาะพื้นที่โดยผู้ส่งโครงการ`);
  }

  return {
    qualityScore: finalQualityScore,
    features: {
      governance,
      nudge,
      socialNorm,
      kpi: kpiScore,
      threeTier
    },
    strengths,
    gaps,
    isUnmodifiedAiDraft,
    humanContributionScore,
    aiDraftNote
  };
}

/**
 * สร้างข้อความสะท้อนมุมมองและไกด์แนวทางการพัฒนาสำหรับ Workshop (Reflective Coaching Guidance)
 * เน้นความกระชับ ตรงจุด ได้ความหมายเชิงพฤติกรรม และไม่เป็นการตัดสินถูกผิด
 */
export function formatWorkshopReflectiveCoaching(
  candProfile: SubstantiveQualityProfile,
  virtueName: string,
  challengeTopic?: string
): string {
  // 1. จุดเด่นเชิงกลไกพฤติกรรม (Key Strength)
  const strengthText = candProfile.strengths && candProfile.strengths.length > 0
    ? candProfile.strengths
        .filter(s => !s.includes('ร่าง') && !s.includes('คะแนน') && !s.includes('AI'))
        .slice(0, 2)
        .join(' และ ') || 'มีโครงสร้างกิจกรรมที่สอดรับกับโจทย์พื้นที่และสะท้อนความตั้งใจในการขับเคลื่อนคุณธรรม'
    : 'มีโครงสร้างกิจกรรมที่สอดรับกับโจทย์พื้นที่และสะท้อนความตั้งใจในการขับเคลื่อนคุณธรรม';

  // 2. โอกาสต่อยอดในเวิร์กช็อป (Growth Opportunities)
  const cleanGaps = (candProfile.gaps || [])
    .filter(g => !g.includes('ฉบับร่าง') && !g.includes('AI') && !g.includes('คะแนน'));

  const growthText = cleanGaps.length > 0
    ? cleanGaps.slice(0, 2).join(' รวมถึง')
    : 'ระบุบทบาทของภาคีเครือข่ายบวรและกลไกกำกับดูแลทางสังคมให้ครอบคลุม';

  // 3. ก้าวถัดไปเชิงปฏิบัติการ (Actionable Next Steps)
  const tipText = 'ร่วมกับทีมงานระบุชื่อหน่วยงาน/ชุมชนจริง แผนกิจกรรมเชิงรุก ออกแบบจุดสะกิดพฤติกรรม (Nudge) และตัวชี้วัดเชิงประจักษ์ในชีวิตประจำวันเพื่อความยั่งยืน';

  return `🌟 จุดเด่นที่พบ: ${strengthText}\n🌱 โอกาสต่อยอดใน Workshop: ${growthText}\n🎯 ก้าวถัดไปเชิงปฏิบัติการ: ${tipText}`;
}

/**
 * สร้างคำแนะนำสะท้อนผลและไกด์แนวทางการพัฒนาสำหรับแต่ละด้านคุณธรรม
 * เน้นการทำให้โครงการเป็นรูปธรรม และได้ประสิทธิภาพสูงสุด ไม่ใช่การตรวจเช็คหัวข้อเกณฑ์รูบิก
 */
export function generateDimensionReflectiveCoaching(
  dim: UniversalRubricDimension,
  projectData: {
    projectName: string;
    targetMoralVirtue: string;
    targetArea: string;
    targetAudience: string;
    proposalDetails: string;
    activityPlan: string;
    behavioralKpi?: string;
  },
  challengeStatement?: string
): { rationale: string; developmentPillars: string[] } {
  const pName = projectData.projectName ? `"${projectData.projectName}"` : 'ข้อเสนอโครงการ';
  const area = projectData.targetArea ? `ในพื้นที่ ${projectData.targetArea}` : 'ในพื้นที่เป้าหมาย';
  const audience = projectData.targetAudience ? `กลุ่ม ${projectData.targetAudience}` : 'กลุ่มเป้าหมาย';

  // ตรวจสอบความสอดคล้องกับโจทย์ความท้าทาย
  const relevance = checkChallengeDomainRelevance(projectData, challengeStatement);

  if (relevance.isOffTopic) {
    const mismatch = relevance.mismatchReason || `เนื้อหาโครงการไม่ตรงกับโจทย์ความท้าทาย "${challengeStatement}"`;
    switch (dim.virtueKey) {
      case 'challenge_fit':
        return {
          rationale: [
            `❌ ไม่ตรงกับโจทย์ความท้าทาย: ${pName} เสนอโครงการที่ไม่สอดคล้องกับประเด็นปัญหาตามโจทย์ (${mismatch})`,
            `🛠️ ข้อเสนอแนะเร่งด่วน: ปรับแก้สาระสำคัญของโครงการให้มุ่งเน้นการแก้ปัญหา "${challengeStatement || 'ปัญหาตามโจทย์'}" โดยตรง เจาะลึกต้นตอปัญหาและพฤติกรรมของกลุ่มเป้าหมายในโจทย์`,
            `🚀 คำแนะนำ: การประเมินในเสาหลักนี้ให้ความสำคัญสูงสุดกับความตรงจุดในการแก้ปัญหาตามโจทย์ที่กำหนด`
          ].join('\n'),
          developmentPillars: ['ปรับเปลี่ยนโครงการให้ตรงโจทย์', 'วิเคราะห์ต้นตอปัญหาตามโจทย์', 'กำหนดกลุ่มเป้าหมายให้ตรงจุด']
        };
      case 'creative_nudge':
        return {
          rationale: [
            `⚠️ กลไก Nudge ไม่ตรงกับโจทย์: เครื่องมือสะกิดพฤติกรรมที่ระบุ ไม่ได้ถูกออกแบบมาเพื่อปรับเปลี่ยนพฤติกรรมในโจทย์ "${challengeStatement || 'ปัญหาตามโจทย์'}"`,
            `🛠️ ข้อเสนอแนะ: ออกแบบจุดสะกิดพฤติกรรม (Nudge) หรือสถาปัตยกรรมทางเลือกที่ช่วยลดพฤติกรรมเสี่ยงตามโจทย์โดยตรง`,
            `🚀 คำแนะนำ: หลีกเลี่ยงการนำโมเดลแก้ปัญหาอื่นมาใช้โดยไม่ปรับให้เข้ากับบริบทของปัญหาในโจทย์`
          ].join('\n'),
          developmentPillars: ['ออกแบบ Nudge ให้ตรงกับโจทย์', 'สถาปัตยกรรมทางเลือกเฉพาะประเด็น', 'ลดแรงต้านพฤติกรรมเป้าหมาย']
        };
      case 'actionability':
        return {
          rationale: [
            `⚠️ เครือข่ายไม่ได้ขับเคลื่อนแก้โจทย์: แผนงานและภาคีเครือข่ายที่ระบุ ไม่ได้มุ่งเน้นการแก้ปัญหาตามโจทย์ "${challengeStatement || 'ปัญหาตามโจทย์'}"`,
            `🛠️ ข้อเสนอแนะ: ระบุบทบาทของภาคี 3 ระดับ (นโยบาย, ผู้ปฏิบัติการ, ประชาชน) ที่มีอำนาจหน้าที่และความเกี่ยวข้องกับการแก้ปัญหาในโจทย์นี้จริง`,
            `🚀 คำแนะนำ: สร้างข้อตกลงร่วมเฉพาะประเด็นเพื่อการทำงานจริงในพื้นที่`
          ].join('\n'),
          developmentPillars: ['ดึงภาคีที่เกี่ยวข้องกับโจทย์ปัญหา', 'แผนงาน 3 ระดับแก้โจทย์โดยตรง', 'การขับเคลื่อนเฉพาะประเด็น']
        };
      case 'expected_impact':
        return {
          rationale: [
            `⚠️ ตัวชี้วัดไม่ตรงกับโจทย์: ตัวชี้วัดความสำเร็จที่ระบุ ไม่ได้วัดผลสัมฤทธิ์ในการแก้ปัญหาตามโจทย์ "${challengeStatement || 'ปัญหาตามโจทย์'}"`,
            `🛠️ ข้อเสนอแนะ: กำหนดตัวชี้วัดเชิงประจักษ์ (Observable Behavioral KPIs) ที่สะท้อนการลดลงของปัญหาตามโจทย์ เช่น ร้อยละกลุ่มเสี่ยงที่ลดลง`,
            `🚀 คำแนะนำ: ต้องมีตัวเลขเป้าหมายและกรอบเวลาที่ประเมินความสำเร็จของโจทย์ความท้าทายนี้ได้จริง`
          ].join('\n'),
          developmentPillars: ['ตัวชี้วัดพฤติกรรมตรงโจทย์', 'เป้าหมายตัวเลขวัดผลได้จริง', 'การติดตามผลความยั่งยืน']
        };
      default:
        return {
          rationale: `⚠️ โครงการไม่ตรงกับโจทย์ความท้าทาย: กรุณาปรับเปลี่ยนเนื้อหาให้สอดคล้องกับโจทย์ "${challengeStatement}"`,
          developmentPillars: ['ปรับเนื้อหาให้ตรงโจทย์', 'มุ่งเน้นกลุ่มเป้าหมายตามโจทย์', 'สร้างผลลัพธ์พฤติกรรมตรงจุด']
        };
    }
  }

  switch (dim.virtueKey) {
    case 'challenge_fit': {
      const pillars = ['วิเคราะห์เจาะลึกต้นตอปัญหา', 'สอดรับบริบทวิถีชีวิตพื้นที่', 'แก้ปัญหาคลังปัญหาตรงจุด'];
      const rationale = [
        `🔍 มุมมองสะท้อน: ${pName} สะท้อนความเข้าใจในประเด็นปัญหา "${challengeStatement || 'ปัญหาในพื้นที่'}" และความมุ่งมั่นในการแก้ไขปัญหาของ${audience}${area}`,
        `🛠️ ข้อเสนอแนะเพื่อปรับปรุงให้ดียิ่งขึ้น: เจาะลึกถึง "ต้นตอแท้จริง (Root Cause)" ของพฤติกรรมกลุ่มเป้าหมาย มากกว่าแค่การแก้ไขอาการปลายเหตุ โดยระบุให้ชัดเจนว่าทำไมปัญหาในคลังปัญหาจึงยังคงอยู่ และแนวคิดของโครงการจะเข้าไปปลดล็อกกลไกเชิงพฤติกรรมนี้ได้อย่างไร`,
        `🚀 สู่ประสิทธิผลสูงสุด: ดึงบริบททางสังคม วิถีชีวิต หรือภูมิปัญญาท้องถิ่นเฉพาะของ${area || 'พื้นที่'} มาเป็นแรงขับเคลื่อนให้การแก้ปัญหาตรงจุดและแนบเนียนกับชีวิตประจำวัน`
      ].join('\n');
      return { rationale, developmentPillars: pillars };
    }

    case 'creative_nudge': {
      const pillars = ['สถาปัตยกรรมทางเลือก Nudge', 'หลีกเลี่ยงการอบรมแบบเดิม', 'บรรทัดฐานทางสังคม Social Norms'];
      const rationale = [
        `🔍 มุมมองสะท้อน: ${pName} มีความคิดริเริ่มและไอเดียเชิงบวกในการสร้างแรงบันดาลใจให้แก่${audience}`,
        `🛠️ ข้อเสนอแนะเพื่อปรับปรุงให้ดียิ่งขึ้น: หลีกเลี่ยงรูปแบบการจัดอบรม บรรยาย หรือสัมมนาแบบดั้งเดิม ให้เปลี่ยนมาใช้ "กลไกสะกิดพฤติกรรม (Behavioral Nudge)" เช่น การปรับสภาพแวดล้อมให้การทำความดีหรือพฤติกรรมที่ถูกต้องทำได้ง่าย สะดวก ไร้แรงต้าน และมองเห็นชัดเจนในชีวิตประจำวัน`,
        `🚀 สู่ประสิทธิผลสูงสุด: นำพลังบรรทัดฐานทางสังคม (Social Norms) หรือระบบยกย่องชื่นชมแบบ Peer-to-Peer มาเสริมสร้างแรงกระตุ้นเชิงบวกโดยไม่ต้องพึ่งพาการบังคับ`
      ].join('\n');
      return { rationale, developmentPillars: pillars };
    }

    case 'actionability': {
      const pillars = ['กลไก 3 ประสาน (บวร/อปท.)', 'แผนขับเคลื่อน 3 ระดับ', 'พึ่งพาตนเองด้วยทุนพื้นที่'];
      const rationale = [
        `🔍 มุมมองสะท้อน: ${pName} แสดงความตั้งใจในการประสานความร่วมมือและการมีส่วนร่วมใน${area}`,
        `🛠️ ข้อเสนอแนะเพื่อปรับปรุงให้ดียิ่งขึ้น: ระบุบทบาทการขับเคลื่อนให้ครอบคลุม "3 ระดับ" อย่างชัดเจน (ระดับ 1 นโยบาย/ผู้นำ, ระดับ 2 ผู้ปฏิบัติการ/แกนนำ, และระดับ 3 ประชาชน/ชุมชน) และดึงพลังเครือข่าย 3 ประสาน (บ้าน-วัด/ศาสนสถาน-โรงเรียน/อปท.) ร่วมเป็นเจ้าภาพปฏิบัติการจริง`,
        `🚀 สู่ประสิทธิผลสูงสุด: ใช้ประโยชน์จากทุนทางสังคม ทุนมนุษย์ และทรัพยากรที่มีอยู่แล้วในพื้นที่ เพื่อให้โครงการสามารถดำเนินการต่อเนื่องได้จริงและพึ่งพาตนเองได้อย่างยั่งยืน`
      ].join('\n');
      return { rationale, developmentPillars: pillars };
    }

    case 'expected_impact': {
      const pillars = ['ตัวชี้วัดพฤติกรรมเชิงประจักษ์', 'การประเมินผลก่อน-หลัง', 'ความยั่งยืนของพฤติกรรมใหม่'];
      const rationale = [
        `🔍 มุมมองสะท้อน: ${pName} มีเป้าหมายที่มุ่งหวังให้เกิดการเปลี่ยนแปลงเชิงบวกและการลดปัญหาในคลังปัญหาของจังหวัด`,
        `🛠️ ข้อเสนอแนะเพื่อปรับปรุงให้ดียิ่งขึ้น: กำหนดตัวชี้วัดความสำเร็จให้เป็น "ตัวชี้วัดเชิงพฤติกรรมที่สังเกตและวัดผลได้จริง (Observable Behavioral KPIs)" โดยมีตัวเลขหรือสัดส่วนร้อยละเป้าหมายที่ชัดเจน (เช่น ร้อยละของผู้สวมหมวกนิรภัยเพิ่มขึ้น หรือปริมาณขยะลดลง...) แทนการวัดเพียงจำนวนผู้เข้าร่วมกิจกรรม`,
        `🚀 สู่ประสิทธิผลสูงสุด: วางกลไกติดตามผลต่อเนื่องหลังเสร็จสิ้นกิจกรรม และจัดตั้งกติกาประชาคมเพื่อรักษาระดับพฤติกรรมใหม่ให้กลายเป็นวิถีปฏิบัติถาวรของชุมชน`
      ].join('\n');
      return { rationale, developmentPillars: pillars };
    }

    case 'discipline': {
      const pillars = ['กติกาประชาคมร่วม', 'จุดสะกิดพฤติกรรม (Nudge)', 'ตัวชี้วัดพฤติกรรมเชิงประจักษ์'];
      const rationale = [
        `🔍 มุมมองสะท้อน: ${pName} มีฐานคิดที่ดีในการสร้างจิตสำนึกวินัยและความรับผิดชอบต่อส่วนรวมแก่${audience}`,
        `🛠️ ไกด์พัฒนาสู่รูปธรรม: ยกระดับสู่การร่าง "ข้อตกลงร่วม/ธรรมนูญพื้นที่" ที่ทุกคนมีส่วนร่วมกำหนด พร้อมปรับสภาพแวดล้อมจัดจุดแจ้งเตือนเชิงบวก (Nudge) หรือสิ่งอำนวยความสะดวกที่ลดแรงต้าน เพื่อให้การเคารพวินัยทำได้ง่ายในชีวิตประจำวัน`,
        `🚀 สู่ประสิทธิภาพสูงสุด: กำหนดสถิติตัวชี้วัดการเคารพกติการายสัปดาห์ที่วัดผลได้จริง และสร้างกลไกเพื่อนช่วยเตือนเพื่อนเพื่อรักษาพฤติกรรมต่อเนื่องถาวร`
      ].join('\n');
      return { rationale, developmentPillars: pillars };
    }

    case 'honesty': {
      const pillars = ['ความโปร่งใสตรวจสอบได้', 'เครือข่ายเฝ้าระวังทางสังคม', 'วัฒนธรรมความซื่อตรง'];
      const rationale = [
        `🔍 มุมมองสะท้อน: ${pName} สะท้อนความตั้งใจที่ดีในการปลูกฝังความซื่อสัตย์สุจริตและการเคารพสิทธิผู้อื่น${area}`,
        `🛠️ ไกด์พัฒนาสู่รูปธรรม: วางระบบเปิดเผยข้อมูลการดำเนินงานและงบประมาณอย่างโปร่งใสที่ประชาชนเข้าถึงได้ง่าย พร้อมเปิดช่องทางรับฟังความคิดเห็นและแจ้งข้อสังเกตที่ปลอดภัย เพื่อป้องกันผลประโยชน์ทับซ้อน`,
        `🚀 สู่ประสิทธิภาพสูงสุด: ผสานบทบาทผู้นำและแกนนำกลุ่มให้เป็นแบบอย่างความซื่อสัตย์ พร้อมสร้างบรรทัดฐานทางสังคมที่ยกย่องคนทำดีเพื่อสร้างความเชื่อมั่นระยะยาว`
      ].join('\n');
      return { rationale, developmentPillars: pillars };
    }

    case 'volunteer': {
      const pillars = ['ระบบเกื้อกูลต่อเนื่อง', 'พลังเครือข่ายบวร', 'การมีส่วนร่วมของเยาวชน'];
      const rationale = [
        `🔍 มุมมองสะท้อน: ${pName} เปี่ยมด้วยพลังความร่วมมือและความเสียสละเพื่อประโยชน์ส่วนรวมของ${audience}`,
        `🛠️ ไกด์พัฒนาสู่รูปธรรม: พัฒนากิจกรรมจิตอาสาให้เป็น "ระบบบันทึกความดีหรือธนาคารเวลา (Time Bank)" ที่เอื้อให้เกิดการแลกเปลี่ยนความช่วยเหลือต่อเนื่อง และดึงพลัง 3 ประสาน (บวร: บ้าน วัด/ศาสนสถาน โรงเรียน/อปท.) ร่วมเป็นเจ้าภาพ`,
        `🚀 สู่ประสิทธิภาพสูงสุด: กระจายบทบาทให้กลุ่มคนรุ่นใหม่และเยาวชนเป็นผู้ออกแบบกิจกรรมหลัก เพื่อสร้างแกนนำจิตอาสารุ่นใหม่ที่ขับเคลื่อนชุมชนได้อย่างยั่งยืน`
      ].join('\n');
      return { rationale, developmentPillars: pillars };
    }

    case 'gratitude': {
      const pillars = ['พื้นที่เชื่อมร้อยสองวัย', 'ระบบดูแลกลุ่มเปราะบาง', 'การอนุรักษ์รากเหง้าท้องถิ่น'];
      const rationale = [
        `🔍 มุมมองสะท้อน: ${pName} สะท้อนเจตนารมณ์อันดีในการตอบแทนคุณค่าผู้มีพระคุณและสร้างความเกื้อกูลในชุมชน`,
        `🛠️ ไกด์พัฒนาสู่รูปธรรม: สร้างพื้นที่กิจกรรมร่วมกันระหว่างผู้สูงวัยและเด็ก/เยาวชน (Intergenerational Bonding) เพื่อถ่ายทอดภูมิปัญญา และจัดระบบเพื่อนบ้านเยี่ยมเยียนดูแลสุขภาพผู้สูงวัยอย่างสม่ำเสมอในวิถีชีวิตจริง`,
        `🚀 สู่ประสิทธิภาพสูงสุด: บรรจุการดูแลเกื้อกูลผู้มีคุณูปการและการฟื้นฟูสิ่งแวดล้อมท้องถิ่นไว้ในแผนชุมชน เพื่อสร้างสายสัมพันธ์ที่มั่นคงและสืบสานอย่างยั่งยืน`
      ].join('\n');
      return { rationale, developmentPillars: pillars };
    }

    case 'sufficiency': {
      const pillars = ['ลดรายจ่ายสร้างความคุ้มค่า', 'กองทุนสวัสดิการหมุนเวียน', 'ความยั่งยืนพึ่งตนเองได้'];
      const rationale = [
        `🔍 มุมมองสะท้อน: ${pName} มีแนวคิดการใช้ทรัพยากรอย่างคุ้มค่าและการเสริมสร้างความเข้มแข็งในการพึ่งพาตนเอง`,
        `🛠️ ไกด์พัฒนาสู่รูปธรรม: ขยายผลสู่กิจกรรมลดรายจ่ายครัวเรือนที่จับต้องได้จริง (เช่น การคัดแยกขยะเพื่อกองทุนสวัสดิการ หรือการทำบัญชีครัวเรือน) พร้อมจัดตั้งกลุ่มสัจจะออมทรัพย์ที่บริหารจัดการโปร่งใส`,
        `🚀 สู่ประสิทธิภาพสูงสุด: ออกแบบโมเดลหมุนเวียนผลประโยชน์ในพื้นที่ เพื่อให้โครงการสามารถดำเนินงานต่อได้มั่นคงด้วยตนเองแม้สิ้นสุดระยะเวลางบประมาณ`
      ].join('\n');
      return { rationale, developmentPillars: pillars };
    }

    default: {
      const rawVirtue = dim.virtueTitle.split(':')[1]?.trim() || dim.virtueTitle;
      const cleanVirtue = rawVirtue.split('(')[0]?.trim().replace(/^ด้าน/, '').trim() || 'คุณธรรม';
      const pillars = ['กลไกปฏิบัติการรูปธรรม', 'ปรับสภาพแวดล้อมพฤติกรรม', 'การสร้างความยั่งยืน'];
      const rationale = [
        `🔍 มุมมองสะท้อน: ${pName} มีจุดเริ่มต้นที่ดีในการริเริ่มขับเคลื่อนด้าน${cleanVirtue}ในพื้นที่`,
        `🛠️ ไกด์พัฒนาสู่รูปธรรม: ออกแบบกติกาข้อตกลงร่วมในพื้นที่ และจัดสภาพแวดล้อมที่ช่วยสะกิดใจให้เกิดพฤติกรรมเชิงบวกได้ง่ายในชีวิตประจำวัน`,
        `🚀 สู่ประสิทธิภาพสูงสุด: กำหนดตัวชี้วัดความเปลี่ยนแปลงเชิงพฤติกรรมที่ชัดเจน และสร้างเครือข่ายความร่วมมือเพื่อความต่อเนื่องถาวร`
      ].join('\n');
      return { rationale, developmentPillars: pillars };
    }
  }
}

/**
 * คำนวณคะแนนตามจริงเฉพาะด้านของคุณธรรมแต่ละมิติ (0.00 - 20.00 คะแนน)
 * ประเมินจากความสอดคล้องของเนื้อหาโครงการ กติกาประชาคม สถาปัตยกรรมทางเลือก Nudge
 * กลไกเครือข่ายสังคม ตัวชี้วัดเชิงประจักษ์ และบริบทเฉพาะของมิตินั้นๆ
 */
export function calculateSpecificDimensionScore(
  dim: UniversalRubricDimension,
  projectData: {
    projectName: string;
    targetMoralVirtue: string;
    targetArea: string;
    targetAudience: string;
    proposalDetails: string;
    activityPlan: string;
    behavioralKpi?: string;
  },
  challengeStatement?: string,
  candProfile?: SubstantiveQualityProfile
): number {
  const pName = (projectData.projectName || '').toLowerCase();
  const pDetails = (projectData.proposalDetails || '').toLowerCase();
  const pPlan = (projectData.activityPlan || '').toLowerCase();
  const pKpi = (projectData.behavioralKpi || '').toLowerCase();
  const proposalText = `${pName} ${pDetails} ${pPlan} ${pKpi}`;
  const challengeText = (challengeStatement || '').toLowerCase();
  const targetVirtue = (projectData.targetMoralVirtue || '').toLowerCase();

  // =========================================================================
  // 0. ตรวจสอบความสอดคล้องกับโจทย์ความท้าทาย (Challenge Relevance Gatekeeper)
  // =========================================================================
  const relevance = candProfile?.isOffTopic !== undefined
    ? { isOffTopic: candProfile.isOffTopic, mismatchReason: candProfile.offTopicReason }
    : checkChallengeDomainRelevance(projectData, challengeStatement);

  if (relevance.isOffTopic) {
    // โครงการไม่ได้เป็นทิศทางเดียวกับโจทย์ความท้าทาย: บังคับคะแนนตกเกณฑ์อย่างเด็ดขาด (ระดับกำลังพัฒนา 0-49%)
    if (dim.virtueKey === 'challenge_fit') {
      let score = 2.0;
      if (projectData.targetArea && projectData.targetArea.length > 2) score += 0.5;
      if (projectData.targetAudience && projectData.targetAudience.length > 2) score += 0.5;
      return Number(Math.min(3.00, score).toFixed(2));
    }
    if (dim.virtueKey === 'creative_nudge') {
      return 4.00;
    }
    if (dim.virtueKey === 'actionability') {
      return 4.00;
    }
    if (dim.virtueKey === 'expected_impact') {
      return 2.50;
    }
    return 3.00;
  }

  // =========================================================================
  // 1. ตรวจประเมินตามเกณฑ์มาตรฐาน 4 เสาหลัก (100 คะแนนเต็ม)
  // =========================================================================

  // เสาหลักที่ 1 (30 คะแนน): ความตรงจุดและลึกซึ้งในการตีโจทย์ปัญหาคลังปัญหาของจังหวัด
  if (dim.virtueKey === 'challenge_fit') {
    let score = 12.0; // ค่าเริ่มต้นระดับพื้นฐาน

    // ตรวจสอบความสอดคล้องกับโจทย์ความท้าทายจากคลังปัญหา (0 - 8 คะแนน)
    if (challengeText && challengeText.length > 2) {
      const challengeKeywords = challengeText
        .split(/[\s,，、:：""''“”\-_()]+/)
        .filter((w) => w.length >= 2 && !['ให้', 'คิด', 'ด้าน', 'และ', 'เพื่อ', 'การ', 'ของ', 'ใน', 'ช่วย', 'แก้', 'ปัญหา', 'แก้ปัญหา', 'โครงการ', 'ที่', 'สามารถ', 'โดย', 'เป็น'].includes(w));
      let matches = 0;
      for (const kw of challengeKeywords) {
        if (proposalText.includes(kw)) matches++;
      }
      score += Math.min(8.0, matches * 1.6);
    } else {
      score += 4.0;
    }

    // ตรวจสอบการวิเคราะห์เจาะลึกต้นตอปัญหา (Root Cause) และบริบทพื้นที่ (0 - 5 คะแนน)
    const rootCauseTerms = ['สาเหตุ', 'ต้นตอ', 'ปัญหา', 'ชุมชน', 'บริบท', 'พฤติกรรม', 'สภาพแวดล้อม', 'วิถีชีวิต', 'ความเสี่ยง', 'ผลกระทบ', 'ความเปราะบาง', 'ภาระ', 'หนี้สิน'];
    let rootMatches = 0;
    for (const term of rootCauseTerms) {
      if (proposalText.includes(term)) rootMatches++;
    }
    score += Math.min(5.0, rootMatches * 1.0);

    // ความชัดเจนของกลุ่มเป้าหมายและพื้นที่ (0 - 5 คะแนน)
    if (projectData.targetArea && projectData.targetArea.trim().length > 3) score += 2.0;
    const aud = projectData.targetAudience || '';
    const parsedHouse = parseNumericCountFromText(aud, /(?:ครัวเรือน|หลังคาเรือน|ครอบครัว)/i);
    const parsedPeople = parseNumericCountFromText(aud, /(?:คน|ราย|ท่าน)/i);
    const targetAreaClean = (projectData.targetArea || '').replace(/^จ\./, '').trim();
    const provKeyAud = Object.keys(PROVINCE_DEMOGRAPHICS_REGISTRY).find(k => 
      targetAreaClean.includes(k) || (projectData.projectName || '').includes(k) || aud.includes(k)
    );
    const provinceDemoAud = provKeyAud ? PROVINCE_DEMOGRAPHICS_REGISTRY[provKeyAud] : DEFAULT_PROVINCE_DEMOGRAPHICS;
    const isOverAudience = (parsedHouse && (parsedHouse.count > provinceDemoAud.households || parsedHouse.count > 15000)) ||
                           (parsedPeople && (parsedPeople.count > provinceDemoAud.population || parsedPeople.count > 40000));

    if (isOverAudience) {
      // สเกลกลุ่มเป้าหมายเกินจริง (เช่น มากกว่าครัวเรือนทั้งจังหวัด) จะไม่ได้รับคะแนนโบนัสความชัดเจน
      score += 0.5;
    } else if (/\d+/.test(aud) || aud.includes('ครัวเรือน') || aud.includes('คน') || aud.includes('ราย')) {
      score += 3.0;
    } else if (aud.trim().length > 5) {
      score += 1.5;
    }

    return Number(Math.min(30.00, Math.max(8.00, score)).toFixed(2));
  }

  // เสาหลักที่ 2 (25 คะแนน): ความคิดสร้างสรรค์และกลไกสะกิดพฤติกรรม
  if (dim.virtueKey === 'creative_nudge') {
    let score = 9.0; // ค่าเริ่มต้นระดับพื้นฐาน

    // ตรวจสอบกลไกสะกิดพฤติกรรม (Behavioral Nudge) และสถาปัตยกรรมทางเลือก (0 - 8 คะแนน)
    const nudgeTerms = ['แอป', 'แต้ม', 'ระบบ', 'ai', 'จุด', 'สถานี', 'เซนเซอร์', 'กล่อง', 'ป้ายเตือน', 'qr', 'nudge', 'สะกิด', 'ทางเลือก', 'เกม', 'แรงจูงใจ', 'สัญลักษณ์', 'เสียงเตือน', 'ธนาคารเวลา', 'คลัง', 'เตือนภัย'];
    let nudgeHits = 0;
    for (const term of nudgeTerms) {
      if (proposalText.includes(term)) nudgeHits++;
    }
    score += Math.min(8.0, nudgeHits * 1.6);

    // ก้าวข้ามการอบรม/สัมมนาแบบเดิม สู่กิจกรรมเชิงรุก (0 - 4 คะแนน)
    const isPassiveLectureOnly = (proposalText.includes('อบรม') || proposalText.includes('สัมมนา') || proposalText.includes('บรรยาย')) && nudgeHits === 0;
    if (isPassiveLectureOnly) {
      score -= 2.0;
    } else if (nudgeHits >= 2 || !proposalText.includes('สัมมนา')) {
      score += 4.0;
    }

    // การใช้พลังบรรทัดฐานทางสังคม (Social Norms) และกลุ่มเพื่อน (0 - 4 คะแนน)
    const socialTerms = ['เพื่อน', 'ยกย่อง', 'เชิดชู', 'สังคม', 'ต้นแบบ', 'ครอบครัว', 'อาสา', 'เครือข่าย', 'บวร'];
    let socialHits = 0;
    for (const term of socialTerms) {
      if (proposalText.includes(term)) socialHits++;
    }
    score += Math.min(4.0, socialHits * 0.9);

    return Number(Math.min(25.00, Math.max(6.00, score)).toFixed(2));
  }

  // เสาหลักที่ 3 (25 คะแนน): ความเป็นไปได้จริงและพลังเครือข่ายพื้นที่
  if (dim.virtueKey === 'actionability') {
    let score = 8.0; // ค่าเริ่มต้นระดับพื้นฐาน

    // ตรวจสอบการขับเคลื่อนครอบคลุม 3 ระดับ (นโยบาย / ผู้ปฏิบัติการ / ประชาชน) (0 - 8 คะแนน)
    const hasPolicy = pPlan.includes('นโยบาย') || pPlan.includes('ผู้นำ') || pPlan.includes('อปท') || pPlan.includes('อบต') || pPlan.includes('เทศบาล') || pPlan.includes('mou') || pPlan.includes('กติกา') || pPlan.includes('อำเภอ');
    const hasPractitioner = pPlan.includes('ผู้ปฏิบัติการ') || pPlan.includes('แกนนำ') || pPlan.includes('ครู') || pPlan.includes('อสม') || pPlan.includes('เจ้าหน้าที่') || pPlan.includes('อาสา') || pPlan.includes('กำนัน') || pPlan.includes('ผู้ใหญ่บ้าน');
    const hasCitizen = pPlan.includes('ประชาชน') || pPlan.includes('ชาวบ้าน') || pPlan.includes('เยาวชน') || pPlan.includes('ชุมชน') || pPlan.includes('ครอบครัว');

    const tierCount = (hasPolicy ? 1 : 0) + (hasPractitioner ? 1 : 0) + (hasCitizen ? 1 : 0);
    if (tierCount === 3) score += 8.0;
    else if (tierCount === 2) score += 5.0;
    else if (tierCount === 1) score += 2.0;

    // การดึงพลังเครือข่าย 3 ประสาน (บวร: บ้าน วัด/ศาสนสถาน โรงเรียน/ราชการ) และทุนชุมชน (0 - 5 คะแนน)
    const hasTriad = proposalText.includes('บวร') || (proposalText.includes('บ้าน') && (proposalText.includes('วัด') || proposalText.includes('โรงเรียน')));
    const hasCommunityAsset = proposalText.includes('ทุน') || proposalText.includes('ภูมิปัญญา') || proposalText.includes('ทรัพยากร') || proposalText.includes('เครือข่าย');
    if (hasTriad && hasCommunityAsset) score += 5.0;
    else if (hasTriad || hasCommunityAsset) score += 3.0;

    // ความสมบูรณ์ของแผนงานเชิงปฏิบัติการ (0 - 4 คะแนน)
    if (pPlan.trim().length > 250) score += 4.0;
    else if (pPlan.trim().length > 120) score += 2.5;
    else if (pPlan.trim().length > 40) score += 1.0;

    return Number(Math.min(25.00, Math.max(6.00, score)).toFixed(2));
  }

  // เสาหลักที่ 4 (20 คะแนน): ประสิทธิผลการแก้ปัญหาและตัวชี้วัดพฤติกรรม
  if (dim.virtueKey === 'expected_impact') {
    let score = 6.0; // ค่าเริ่มต้นระดับพื้นฐาน

    // ตรวจสอบตัวชี้วัดเชิงประจักษ์ (Observable Behavioral KPIs) (0 - 7 คะแนน)
    const hasPercentage = pKpi.includes('%') || pKpi.includes('ร้อยละ');
    const hasNumbers = /\d+/.test(pKpi);
    const hasDirection = pKpi.includes('ลดลง') || pKpi.includes('เพิ่มขึ้น') || pKpi.includes('ขยายผล');

    if (hasPercentage && hasDirection) score += 7.0;
    else if (hasPercentage || (hasNumbers && hasDirection)) score += 5.0;
    else if (hasNumbers) score += 3.0;

    // กรอบเวลาและการติดตามผล (0 - 4 คะแนน)
    const combinedPlanKpi = `${pPlan} ${pKpi} ${pDetails}`;
    const hasLongTimeline = /(?:ระยะเวลา|กรอบเวลา|ใช้เวลา|ดำเนินงาน|ภายใน|เป้าหมาย|ผลลัพธ์|โครงการ|แผนงาน)?\s*(?:ที่คาดว่าจะได้รับ)?\s*(?:โครงการ)?\s*(?:ใน|ระหว่าง)?\s*([3-9]|\d{2,})\s*ปี|(?:^|[^\d])([3-9]|\d{2,})\s*ปี(?:\s|$|[^\d])/i.test(combinedPlanKpi);
    const hasTooShort = /(?:[1-9]|[12]\d)\s*วัน|[1-3]\s*สัปดาห์|ชั่วข้ามคืน|ไม่กี่วัน/i.test(combinedPlanKpi);

    const hasTimeframe = pKpi.includes('เดือน') || pKpi.includes('สัปดาห์') || pKpi.includes('วัน') || pKpi.includes('ปี') || pKpi.includes('ระยะ');
    if (hasTimeframe && !hasLongTimeline && !hasTooShort) {
      score += 4.0;
    } else if (hasLongTimeline || hasTooShort) {
      // กรอบเวลาไม่สมเหตุสมผล (เช่น 10 ปี นานเกินไปสำหรับนำร่อง หรือ 1-3 วัน สั้นไป) จะไม่ได้รับคะแนนเต็มในส่วนนี้
      score += 0.5;
    }

    if (hasTooShort) {
      // หากตั้งกรอบเวลาสั้นเกินจริง เช่น 1 วัน, 3 วัน ไม่สามารถปรับพฤติกรรมคนในชุมชนได้จริง
      score = Math.min(score, 3.5);
    }

    // ความยั่งยืนและการต่อยอดระยะยาว (0 - 3 คะแนน)
    const hasSustainability = proposalText.includes('ยั่งยืน') || proposalText.includes('ต่อเนื่อง') || proposalText.includes('ถาวร') || proposalText.includes('วิถีชีวิต') || proposalText.includes('ต้นแบบ') || proposalText.includes('กองทุน');
    if (hasSustainability && !hasTooShort) score += 3.0;

    return Number(Math.min(20.00, Math.max(3.00, score)).toFixed(2));
  }

  // =========================================================================
  // 2. Fallback สำหรับเกณฑ์คุณธรรมเดิม (Discipline, Honesty, Volunteer, Gratitude, Sufficiency)
  // =========================================================================
  const isTargetMatch =
    (dim.virtueKey === 'discipline' && (targetVirtue.includes('วินัย') || targetVirtue.includes('discipline'))) ||
    (dim.virtueKey === 'honesty' && (targetVirtue.includes('สุจริต') || targetVirtue.includes('integrity') || targetVirtue.includes('honesty'))) ||
    (dim.virtueKey === 'volunteer' && (targetVirtue.includes('จิตอาสา') || targetVirtue.includes('volunteer'))) ||
    (dim.virtueKey === 'gratitude' && (targetVirtue.includes('กตัญญู') || targetVirtue.includes('gratitude'))) ||
    (dim.virtueKey === 'sufficiency' && (targetVirtue.includes('พอเพียง') || targetVirtue.includes('sufficiency')));

  const virtueKeywordMap: Record<string, string[]> = {
    discipline: ['วินัย', 'จราจร', 'กฎ', 'กติกา', 'หมวก', 'ขับขี่', 'ระเบียบ', 'ความปลอดภัย', 'ละเมิด', 'ตรวจเตือน', 'ความรับผิดชอบ', 'ตรงต่อเวลา'],
    honesty: ['สุจริต', 'โปร่งใส', 'ซื่อสัตย์', 'โกง', 'ทุจริต', 'ไซเบอร์', 'สิทธิ', 'ตรวจสอบ', 'เปิดเผย', 'ศีลธรรม', 'สัจจะ', 'จริยธรรม', 'ธรรมาภิบาล'],
    volunteer: ['จิตอาสา', 'สาธารณะ', 'ช่วยเหลือ', 'บำเพ็ญประโยชน์', 'ธนาคารเวลา', 'แบ่งปัน', 'เสียสละ', 'อาสาสมัคร', 'จิตสาธารณะ', 'เพื่อนช่วยเพื่อน', 'บวร'],
    gratitude: ['กตัญญู', 'ผู้สูงอายุ', 'สูงวัย', 'สองวัย', 'ผู้มีพระคุณ', 'ตอบแทน', 'ประวัติศาสตร์', 'วัฒนธรรม', 'มรดก', 'รากเหง้า', 'ภูมิปัญญา', 'อนุรักษ์', 'แผ่นดินเกิด'],
    sufficiency: ['พอเพียง', 'ขยะ', 'รีไซเคิล', 'ลดรายจ่าย', 'ออม', 'สัจจะออมทรัพย์', 'บัญชีครัวเรือน', 'เศรษฐกิจพอเพียง', 'คุ้มค่า', 'พึ่งพาตนเอง', 'สิ่งแวดล้อม', 'ทรัพยากร']
  };

  const keywords = virtueKeywordMap[dim.virtueKey] || [];
  let keywordHits = 0;
  for (const kw of keywords) {
    if (proposalText.includes(kw)) {
      keywordHits++;
    }
  }

  let score = 9.0;

  // 1. ความสอดคล้องกับคุณธรรมเป้าหมายและคำสำคัญเฉพาะด้าน
  if (isTargetMatch) {
    score += 2.5;
  }
  if (keywordHits >= 4) {
    score += 2.5;
  } else if (keywordHits >= 2) {
    score += 1.8;
  } else if (keywordHits === 1) {
    score += 1.0;
  } else {
    score += 0.2;
  }

  // 2. กติกาประชาคมและข้อตกลงร่วม
  const hasGovernance = pPlan.includes('นโยบาย') || pPlan.includes('mou') || pPlan.includes('ธรรมนูญ') || pPlan.includes('ข้อตกลง') || pPlan.includes('กติกา') || pPlan.includes('ระเบียบ');
  if (hasGovernance) {
    score += (isTargetMatch || keywordHits >= 2) ? 2.8 : 1.5;
  } else {
    score += 0.5;
  }

  // 3. สถาปัตยกรรมทางเลือก (Nudge) และกลไกเครือข่ายสังคม
  const hasNudge = proposalText.includes('แอป') || proposalText.includes('แต้ม') || proposalText.includes('ระบบ') || proposalText.includes('ai') || proposalText.includes('จุด') || proposalText.includes('สถานี') || proposalText.includes('เซนเซอร์') || proposalText.includes('ป้ายเตือน') || proposalText.includes('qr') || proposalText.includes('nudge');
  const hasSocial = pPlan.includes('เพื่อน') || pPlan.includes('อาสา') || pPlan.includes('เครือข่าย') || pPlan.includes('ครอบครัว') || pPlan.includes('ชุมชน') || pPlan.includes('บวร') || proposalText.includes('เยาวชน');
  if (hasNudge && hasSocial) {
    score += (isTargetMatch || keywordHits >= 2) ? 3.4 : 2.0;
  } else if (hasNudge || hasSocial) {
    score += (isTargetMatch || keywordHits >= 2) ? 2.0 : 1.2;
  }

  // 4. ตัวชี้วัดเชิงประจักษ์และการตอบโจทย์ความท้าทาย
  const hasKpi = proposalText.includes('%') || proposalText.includes('ร้อยละ') || proposalText.includes('คน') || proposalText.includes('ลดลง') || proposalText.includes('เพิ่มขึ้น') || proposalText.includes('เดือน') || proposalText.includes('บาท');
  const hasChallengeMatch = challengeText && (proposalText.includes(challengeText.slice(0, 10)) || (challengeText.includes('จราจร') && dim.virtueKey === 'discipline') || (challengeText.includes('สุจริต') && dim.virtueKey === 'honesty') || (challengeText.includes('พอเพียง') && dim.virtueKey === 'sufficiency'));

  if (hasKpi) {
    score += (isTargetMatch || keywordHits >= 2) ? 1.5 : 0.8;
  }
  if (hasChallengeMatch) {
    score += (isTargetMatch || keywordHits >= 2) ? 1.0 : 0.5;
  }

  // 5. การวิเคราะห์บริบทเฉพาะด้าน (Domain-Specific Nuances)
  if (dim.virtueKey === 'honesty') {
    const hasHonestyMechanism = proposalText.includes('โปร่งใส') || proposalText.includes('ตรวจสอบ') || proposalText.includes('เปิดเผย');
    score += hasHonestyMechanism ? 1.0 : -0.7;
  } else if (dim.virtueKey === 'gratitude') {
    const hasGratitudeContext = proposalText.includes('โรงเรียน') || proposalText.includes('ครอบครัว') || proposalText.includes('มรดก') || proposalText.includes('ประวัติศาสตร์');
    score += hasGratitudeContext ? 0.6 : -0.5;
  } else if (dim.virtueKey === 'sufficiency') {
    const hasSufficiencyContext = proposalText.includes('ประหยัด') || proposalText.includes('ลดรายจ่าย') || proposalText.includes('ขยะ') || proposalText.includes('ออม');
    score += hasSufficiencyContext ? 0.8 : -0.6;
  }

  // ปรับผลคะแนนตามระดับการพัฒนา
  if (candProfile && candProfile.isUnmodifiedAiDraft) {
    if (score > 16.50) score = 16.50;
    if (score < 10.00) score = 10.00;
  } else {
    if (candProfile && typeof candProfile.humanContributionScore === 'number' && candProfile.humanContributionScore > 0) {
      const bonus = (candProfile.humanContributionScore / 100) * 1.5;
      score += bonus;
    }
    if (score > 19.80) score = 19.80;
    if (score < 8.00) score = 8.00;
  }

  return Number(score.toFixed(2));
}

/**
 * ปรับสมดุลคะแนน 4 เสาหลักให้ผลรวมเท่ากับคะแนนรวมเป้าหมาย (targetTotalScore) พอดี 100%
 * โดยกระจายคะแนนไปยังเสาหลักที่มีพื้นที่ว่าง (Headroom) และควบคุมคะแนนแต่ละเสาหลักให้อยู่ในช่วง [2.0, maxScore] เสมอ
 * ป้องกันคะแนนตกหล่นจากการ Clamp และป้องกันไม่ให้เกิดคะแนนติดลบ
 */
export function calibratePillarsToTotalScore(
  evaluatedDimensions: EvaluatedDimensionDetail[],
  targetTotalScore: number,
  is4Pillars: boolean
): void {
  if (!is4Pillars || evaluatedDimensions.length === 0) return;

  const pillarOrder = ['actionability', 'expected_impact', 'creative_nudge', 'challenge_fit'];
  let currentSum = Number(evaluatedDimensions.reduce((acc, d) => acc + (d.score ?? d.scoreOutOf20 ?? 0), 0).toFixed(2));
  let diff = Number((targetTotalScore - currentSum).toFixed(2));

  if (Math.abs(diff) > 0.01) {
    for (const k of pillarOrder) {
      if (Math.abs(diff) <= 0.01) break;
      const dim = evaluatedDimensions.find(d => d.virtueKey === k);
      if (!dim) continue;
      const maxScore = dim.maxScore || (k === 'challenge_fit' ? 30 : k === 'expected_impact' ? 20 : 25);
      const currentScore = dim.score ?? 0;

      if (diff > 0) {
        const headroom = maxScore - currentScore;
        if (headroom > 0.01) {
          const add = Number(Math.min(headroom, diff).toFixed(2));
          dim.score = Number((currentScore + add).toFixed(2));
          diff = Number((diff - add).toFixed(2));
        }
      } else {
        const reducible = currentScore - 2.0;
        if (reducible > 0.01) {
          const sub = Number(Math.min(reducible, -diff).toFixed(2));
          dim.score = Number((currentScore - sub).toFixed(2));
          diff = Number((diff + sub).toFixed(2));
        }
      }
    }
  }

  // ปรับแก้เศษทศนิยมขนาดเล็ก (Rounding diff < 0.05)
  currentSum = Number(evaluatedDimensions.reduce((acc, d) => acc + (d.score ?? 0), 0).toFixed(2));
  diff = Number((targetTotalScore - currentSum).toFixed(2));
  if (Math.abs(diff) > 0.001) {
    for (const k of pillarOrder) {
      const dim = evaluatedDimensions.find(d => d.virtueKey === k);
      if (!dim) continue;
      const maxScore = dim.maxScore || (k === 'challenge_fit' ? 30 : k === 'expected_impact' ? 20 : 25);
      const currentScore = dim.score ?? 0;
      if (diff > 0 && currentScore + diff <= maxScore) {
        dim.score = Number((currentScore + diff).toFixed(2));
        break;
      } else if (diff < 0 && currentScore + diff >= 2.0) {
        dim.score = Number((currentScore + diff).toFixed(2));
        break;
      }
    }
  }

  // อัปเดตสัดส่วนคะแนนเต็ม 20, ร้อยละ และระดับคุณภาพ
  evaluatedDimensions.forEach(dim => {
    const dimMax = dim.maxScore || (dim.virtueKey === 'challenge_fit' ? 30 : dim.virtueKey === 'expected_impact' ? 20 : 25);
    dim.score = Number(Math.max(2.0, Math.min(dimMax, dim.score ?? 0)).toFixed(2));
    dim.scoreOutOf20 = Number(((dim.score / dimMax) * 20).toFixed(2));
    dim.normalizedScore = Number(((dim.score / dimMax) * 100).toFixed(2));
    if (dim.normalizedScore < 50) dim.levelName = 'ระดับกำลังพัฒนา (0-49%)';
    else if (dim.normalizedScore < 70) dim.levelName = 'ระดับพอใช้ (50-69%)';
    else if (dim.normalizedScore < 85) dim.levelName = 'ระดับดี (70-84%)';
    else dim.levelName = 'ระดับดีเลิศ (85-100%)';
  });
}

export function computeStringSimilarity(s1: string = '', s2: string = ''): number {
  const str1 = (s1 || '').trim().toLowerCase();
  const str2 = (s2 || '').trim().toLowerCase();
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const n = 3;
  if (str1.length < n || str2.length < n) {
    return str1 === str2 ? 1.0 : 0.0;
  }
  const ngrams1 = new Set<string>();
  for (let i = 0; i <= str1.length - n; i++) ngrams1.add(str1.substring(i, i + n));
  const ngrams2 = new Set<string>();
  for (let i = 0; i <= str2.length - n; i++) ngrams2.add(str2.substring(i, i + n));

  if (ngrams1.size === 0 || ngrams2.size === 0) return 0.0;
  let intersection = 0;
  for (const g of ngrams1) {
    if (ngrams2.has(g)) intersection++;
  }
  const union = ngrams1.size + ngrams2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export function computeProjectSimilarity(
  p1: { projectName?: string; proposalDetails?: string; activityPlan?: string; behavioralKpi?: string; targetAudience?: string },
  p2: { projectName?: string; proposalDetails?: string; activityPlan?: string; behavioralKpi?: string; targetAudience?: string }
): number {
  if (isProjectExactMatch(p1, p2)) {
    return 1.0;
  }

  const nameSim = computeStringSimilarity(normalizeProposalText(p1.projectName), normalizeProposalText(p2.projectName));
  const detailsSim = computeStringSimilarity(normalizeProposalText(p1.proposalDetails), normalizeProposalText(p2.proposalDetails));
  const planSim = computeStringSimilarity(normalizeProposalText(p1.activityPlan), normalizeProposalText(p2.activityPlan));
  const kpiSim = computeStringSimilarity(normalizeProposalText(p1.behavioralKpi), normalizeProposalText(p2.behavioralKpi));
  const audSim = computeStringSimilarity(normalizeProposalText(p1.targetAudience), normalizeProposalText(p2.targetAudience));

  // Weighted average: details (30%), plan (30%), kpi (25%), audience (10%), name (5%)
  return Number((nameSim * 0.05 + detailsSim * 0.30 + planSim * 0.30 + kpiSim * 0.25 + audSim * 0.10).toFixed(4));
}

export interface BestMatchingSnapshotResult {
  bestSnapshot: TempEvaluationSnapshot;
  similarity: number;
  isExactMatch: boolean;
  matchIndex: number;
}

export function findBestMatchingPriorSnapshot(
  current: { projectName?: string; proposalDetails?: string; activityPlan?: string; behavioralKpi?: string; targetAudience?: string },
  snapshots: TempEvaluationSnapshot[] = []
): BestMatchingSnapshotResult | null {
  if (!snapshots || snapshots.length === 0) return null;

  // 1. ตรวจสอบว่าตรงกับโครงการรอบใดรอบหนึ่งแบบเป๊ะ 100% หรือไม่ (ตรวจสอบจากรอบล่าสุดย้อนไปรอบแรก)
  for (let i = snapshots.length - 1; i >= 0; i--) {
    const snap = snapshots[i];
    if (!snap || !snap.projectData) continue;
    if (isProjectExactMatch(current, snap.projectData)) {
      return { bestSnapshot: snap, similarity: 1.0, isExactMatch: true, matchIndex: i };
    }
  }

  // 2. หากไม่ตรงเป๊ะ ให้ค้นหา snapshot ที่มีความคล้ายคลึงของโครงสร้างเนื้อหามากที่สุด
  let bestSnap: TempEvaluationSnapshot | null = null;
  let maxSim = -1;
  let bestIdx = -1;

  for (let i = snapshots.length - 1; i >= 0; i--) {
    const snap = snapshots[i];
    if (!snap || !snap.projectData) continue;
    const sim = computeProjectSimilarity(current, snap.projectData);
    if (sim > maxSim) {
      maxSim = sim;
      bestSnap = snap;
      bestIdx = i;
    }
  }

  return bestSnap ? {
    bestSnapshot: bestSnap,
    similarity: maxSim,
    isExactMatch: false,
    matchIndex: bestIdx
  } : null;
}

/**
 * วิเคราะห์ความโดดเด่นของโครงการในดัชนีคุณธรรม 5 ด้าน (Moral Index Standout Engine)
 * ประเมินเนื้อหาข้อเสนอโครงการ (ชื่อโครงการ, รายละเอียด, แผนกิจกรรม, ตัวชี้วัดพฤติกรรม, กลุ่มเป้าหมาย)
 * เพื่อค้นหาว่าโครงการนี้มีจุดเด่นในดัชนีคุณธรรมด้านใดบ้างเป็นพิเศษ (Top 1-2 มิติ)
 * พร้อมคำอธิบายเหตุผลเชิงพฤติกรรมศาสตร์และข้อความหลักฐานที่พบจริงในข้อเสนอโครงการ
 */
export function analyzeProjectStandoutVirtues(
  projectData: {
    projectName?: string;
    proposalDetails?: string;
    activityPlan?: string;
    behavioralKpi?: string;
    targetAudience?: string;
    targetArea?: string;
    targetMoralVirtue?: string;
  }
): MoralVirtuesHighlightAnalysis {
  const pName = (projectData.projectName || '').toLowerCase();
  const pDetails = (projectData.proposalDetails || '').toLowerCase();
  const pPlan = (projectData.activityPlan || '').toLowerCase();
  const pKpi = (projectData.behavioralKpi || '').toLowerCase();
  const pAudience = (projectData.targetAudience || '').toLowerCase();
  const pTargetVirtue = (projectData.targetMoralVirtue || '').toLowerCase();

  const fullText = `${projectData.projectName || ''}\n${projectData.proposalDetails || ''}\n${projectData.activityPlan || ''}\n${projectData.behavioralKpi || ''}\n${projectData.targetAudience || ''}`;

  // ดึงข้อความหลักฐานเชิงพฤติกรรม (Evidence Snippets) จากข้อเสนอโครงการ
  const extractEvidence = (keywords: string[]): string[] => {
    const rawChunks = fullText
      .split(/[\n\r•\-\–\—\t;]|(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length >= 8);

    const matched: string[] = [];
    for (const chunk of rawChunks) {
      if (keywords.some(kw => chunk.toLowerCase().includes(kw.toLowerCase()))) {
        const clean = chunk.replace(/^[0-9]+[.)]\s*/, '').trim();
        if (clean.length >= 8 && !matched.includes(clean)) {
          matched.push(clean.length > 95 ? `${clean.slice(0, 92)}...` : clean);
        }
      }
      if (matched.length >= 2) break;
    }
    return matched;
  };

  // คำนวณคะแนนความเข้มข้นเชิงพฤติกรรม (Behavioral Intensity Score) แต่ละมิติ
  const calculateDimensionScore = (
    primKw: string[],
    secKw: string[],
    actionVerbs: string[],
    virtueName: string
  ) => {
    let score = 42.0; // คะแนนฐานสำหรับโครงการพัฒนาชุมชน
    let matches = 0;

    // ชื่อโครงการ (น้ำหนักสูงสุด สะท้อนเจตนารมณ์หลัก)
    primKw.forEach(kw => {
      if (pName.includes(kw)) { score += 8.0; matches += 2; }
    });

    // ตัวชี้วัดเชิงพฤติกรรม (น้ำหนักสูง สะท้อนการวัดผลจริง)
    primKw.forEach(kw => {
      if (pKpi.includes(kw)) { score += 6.0; matches += 2; }
    });

    // แผนกิจกรรม (น้ำหนักสูง สะท้อนกระบวนการลงมือทำ)
    primKw.forEach(kw => {
      if (pPlan.includes(kw)) { score += 5.0; matches += 1; }
    });

    // รายละเอียดข้อเสนอโครงการ
    primKw.forEach(kw => {
      if (pDetails.includes(kw)) { score += 4.0; matches += 1; }
    });

    // กลุ่มเป้าหมาย
    primKw.forEach(kw => {
      if (pAudience.includes(kw)) { score += 3.0; matches += 1; }
    });

    // คีย์เวิร์ดระดับรอง
    secKw.forEach(kw => {
      if (fullText.toLowerCase().includes(kw)) { score += 2.2; matches += 1; }
    });

    // กริยาการลงมือทำเชิงพฤติกรรม (Action Verbs)
    let actionHits = 0;
    actionVerbs.forEach(verb => {
      if (pPlan.includes(verb) || pDetails.includes(verb)) {
        actionHits++;
      }
    });
    score += Math.min(12, actionHits * 2.5);

    // หากระบุเป้าหมายไว้ใน targetMoralVirtue
    if (pTargetVirtue.includes(virtueName)) {
      score += 7.0;
      matches += 1;
    }

    if (matches >= 6) score += 9.0;
    else if (matches >= 4) score += 5.0;

    return {
      score: Number(Math.min(98.5, Math.max(38.0, score)).toFixed(1)),
      matches
    };
  };

  // 1. พอเพียง (Sufficiency & Resilience)
  const suffPrim = ['พอเพียง', 'เศรษฐกิจพอเพียง', 'พึ่งพาตนเอง', 'ลดรายจ่าย', 'เพิ่มรายได้', 'คุ้มค่า', 'ประหยัด', 'ขยะรีไซเคิล', 'ธนาคารขยะ', 'เกษตรอินทรีย์', 'ปลูกผัก', 'ผักสวนครัว', 'โคกหนองนา', 'วนเกษตร', 'ออมทรัพย์', 'บัญชีครัวเรือน', 'สัจจะออมทรัพย์', 'แปรรูป', 'ลดต้นทุน', 'ไม่ก่อหนี้', 'กองทุนชุมชน'];
  const suffSec = ['bcg', 'หมุนเวียน', 'พลังงานสะอาด', 'โซลาร์เซลล์', 'ปุ๋ยหมัก', 'น้ำหมัก', 'ธนาคารน้ำ', 'ฝายมีชีวิต', 'ความมั่นคงทางอาหาร', 'ภูมิปัญญาการเกษตร', 'จัดการขยะ', 'แยกขยะ'];
  const suffActions = ['แปรรูป', 'คัดแยก', 'ปลูก', 'ทำปุ๋ย', 'ออม', 'ผลิต', 'ลดรายจ่าย', 'บริหารจัดการ'];
  const suffCalc = calculateDimensionScore(suffPrim, suffSec, suffActions, 'พอเพียง');
  const suffEv = extractEvidence([...suffPrim, ...suffSec]);

  // 2. วินัยรับผิดชอบ (Discipline & Responsibility)
  const discPrim = ['วินัย', 'ความรับผิดชอบ', 'มีวินัย', 'กฎกติกา', 'กติกาชุมชน', 'ข้อตกลงร่วม', 'ธรรมนูญชุมชน', 'ระเบียบ', 'ข้อบังคับ', 'ตรงต่อเวลา', 'ความปลอดภัย', 'หมวกนิรภัย', 'หมวกกันน็อก', 'กฎจราจร', 'ลดอุบัติเหตุ', 'เฝ้าระวัง', 'กำกับติดตาม', 'ตรวจตรา', 'เครือข่ายตรวจการ'];
  const discSec = ['ด่านชุมชน', 'เวรยาม', 'จุดเสี่ยง', 'มาตรการ', 'คัดแยกขยะต้นทาง', 'ไม่ทิ้งขยะเรี่ยราด', 'ป้องกันภัย', 'เฝ้าระวังไฟป่า', 'ระบบเตือนภัย', 'วินัยทางการเงิน'];
  const discActions = ['ตั้งกติกา', 'ลงนาม', 'บังคับใช้', 'เฝ้าระวัง', 'ตรวจตรา', 'บันทึก', 'สวมใส่', 'ปฏิบัติตาม'];
  const discCalc = calculateDimensionScore(discPrim, discSec, discActions, 'วินัย');
  const discEv = extractEvidence([...discPrim, ...discSec]);

  // 3. สุจริต (Integrity & Transparency)
  const honPrim = ['สุจริต', 'ความสุจริต', 'ซื่อสัตย์', 'ความซื่อสัตย์', 'โปร่งใส', 'ตรวจสอบได้', 'เปิดเผยข้อมูล', 'ธรรมาภิบาล', 'ต้านทุจริต', 'ต่อต้านทุจริต', 'ไม่คอร์รัปชัน', 'ไม่ทุจริต', 'ความถูกต้อง', 'เป็นธรรม', 'ยุติธรรม', 'ไม่เอาเปรียบ', 'บัญชีเปิดเผย', 'บัญชีโปร่งใส'];
  const honSec = ['ประชาพิจารณ์', 'กล่องรับฟังความคิดเห็น', 'รับฟังเสียงประชาชน', 'เปิดเผยงบประมาณ', 'ไร้ผลประโยชน์ทับซ้อน', 'จริยธรรม', 'ศีลธรรม', 'ความโปร่งใส', 'เปิดกว้าง', 'มีส่วนร่วมตรวจสอบ'];
  const honActions = ['เปิดเผย', 'ชี้แจง', 'ตรวจสอบ', 'รับฟัง', 'ติดประกาศ', 'รายงานบัญชี', 'ประเมินความโปร่งใส'];
  const honCalc = calculateDimensionScore(honPrim, honSec, honActions, 'สุจริต');
  const honEv = extractEvidence([...honPrim, ...honSec]);

  // 4. จิตอาสา (Public Mind & Prosocial Action)
  const volPrim = ['จิตอาสา', 'จิตสาธารณะ', 'เสียสละ', 'เพื่อส่วนรวม', 'ประโยชน์ส่วนรวม', 'บำเพ็ญประโยชน์', 'รวมพลัง', 'ช่วยเหลือผู้อื่น', 'เกื้อกูล', 'ร่วมแรงร่วมใจ', 'ลงแขก', 'พัฒนาหมู่บ้าน', 'พัฒนาชุมชน', 'เก็บขยะสาธารณะ', 'ปลูกป่าชุมชน', 'อาสาสมัคร'];
  const volSec = ['อสม.', 'อปพร.', 'จิตอาสาพระราชทาน', 'บรรเทาสาธารณภัย', 'ช่วยเหลือน้ำท่วม', 'ภัยพิบัติ', 'แบ่งปัน', 'เอื้อเฟื้อ', 'ระดมพลัง', 'กองทุนช่วยเหลือ', 'ทำความสะอาดพื้นที่ส่วนรวม'];
  const volActions = ['ลงแขก', 'รวมพลัง', 'จิตอาสา', 'ช่วยเหลือ', 'ร่วมมือ', 'บริจาค', 'ทำความสะอาด', 'ฟื้นฟู'];
  const volCalc = calculateDimensionScore(volPrim, volSec, volActions, 'จิตอาสา');
  const volEv = extractEvidence([...volPrim, ...volSec]);

  // 5. กตัญญู (Gratitude & Stakeholder Care)
  const gratPrim = ['กตัญญู', 'ความกตัญญู', 'ตอบแทนบุญคุณ', 'กตเวที', 'ผู้สูงอายุ', 'ผู้สูงวัย', 'คนชรา', 'พ่อแม่', 'ปู่ย่าตายาย', 'ผู้มีพระคุณ', 'ผู้ป่วยติดเตียง', 'กลุ่มเปราะบาง', 'คนพิการ', 'สานสัมพันธ์ข้ามรุ่น', 'สายใยครอบครัว', 'เด็กและเยาวชน', 'บรรพบุรุษ', 'รักบ้านเกิด', 'พัฒนาบ้านเกิด', 'คืนถิ่น', 'เยาวชนคืนถิ่น'];
  const gratSec = ['สืบสานภูมิปัญญา', 'ภูมิปัญญาท้องถิ่น', 'ปราชญ์ชาวบ้าน', 'วัฒนธรรมประเพณี', 'สานต่อองค์ความรู้', 'กตัญญูต่อแผ่นดิน', 'สิ่งแวดล้อมเพื่อลูกหลาน', 'ดูแลผู้มีพระคุณ'];
  const gratActions = ['ดูแล', 'เยี่ยมบ้าน', 'สืบสาน', 'ถ่ายทอด', 'กราบไหว้', 'ตอบแทน', 'ฟื้นฟูวัฒนธรรม', 'ดูแลผู้สูงวัย'];
  const gratCalc = calculateDimensionScore(gratPrim, gratSec, gratActions, 'กตัญญู');
  const gratEv = extractEvidence([...gratPrim, ...gratSec]);

  // รวบรวมข้อมูลดิบทั้ง 5 ด้าน
  const rawList: StandoutVirtueDetail[] = [
    {
      key: 'sufficiency',
      name: 'พอเพียง',
      title: 'ด้านความพอเพียงและภูมิคุ้มกัน (Sufficiency & Resilience)',
      subtitle: 'ความพอประมาณ มีเหตุผล มีภูมิคุ้มกัน และพึ่งพาตนเองอย่างยั่งยืน',
      iconName: 'Sprout',
      score: suffCalc.score,
      isStandout: false,
      level: 'มีส่วนร่วมเชิงพฤติกรรม',
      color: '#10b981',
      bgLight: '#ecfdf5',
      borderColor: '#a7f3d0',
      badgeEmoji: '🌱',
      coreDriver: 'การพึ่งพาตนเอง ลดรายจ่ายในครัวเรือน และบริหารจัดการทรัพยากรอย่างคุ้มค่า',
      highlightReason: `โครงการขับเคลื่อนมิติความพอเพียงและการสร้างภูมิคุ้มกันอย่างเด่นชัด โดยออกแบบกิจกรรมที่ส่งเสริมการพึ่งพาตนเองและลดรายจ่ายในชุมชน${suffEv.length > 0 ? ` (เช่น "${suffEv[0]}")` : ''} สร้างความมั่นคงและคุ้มค่าอย่างยั่งยืน`,
      evidenceSnippets: suffEv
    },
    {
      key: 'discipline',
      name: 'วินัยรับผิดชอบ',
      title: 'ด้านวินัยและความรับผิดชอบ (Discipline & Responsibility)',
      subtitle: 'การเคารพกฎกติกา ข้อตกลงร่วม และความรับผิดชอบต่อส่วนรวม',
      iconName: 'ShieldCheck',
      score: discCalc.score,
      isStandout: false,
      level: 'มีส่วนร่วมเชิงพฤติกรรม',
      color: '#3b82f6',
      bgLight: '#eff6ff',
      borderColor: '#bfdbfe',
      badgeEmoji: '🛡️',
      coreDriver: 'ข้อตกลงร่วม ธรรมนูญชุมชน และกลไกเฝ้าระวังกำกับติดตามความปลอดภัย',
      highlightReason: `โครงการสร้างความโดดเด่นในด้านวินัยและความรับผิดชอบอย่างเป็นรูปธรรม โดยวางระบบข้อตกลงร่วมหรือกติกาชุมชน${discEv.length > 0 ? ` (เช่น "${discEv[0]}")` : ''} พร้อมกลไกเฝ้าระวังกำกับติดตามที่ทำให้เกิดการรักษาวินัยอย่างสม่ำเสมอ`,
      evidenceSnippets: discEv
    },
    {
      key: 'honesty',
      name: 'สุจริต',
      title: 'ด้านความสุจริตและธรรมาภิบาล (Integrity & Transparency)',
      subtitle: 'ความซื่อสัตย์ โปร่งใส ตรวจสอบได้ และยึดมั่นในความถูกต้องเป็นธรรม',
      iconName: 'Scale',
      score: honCalc.score,
      isStandout: false,
      level: 'มีส่วนร่วมเชิงพฤติกรรม',
      color: '#8b5cf6',
      bgLight: '#f5f3ff',
      borderColor: '#ddd6fe',
      badgeEmoji: '⚖️',
      coreDriver: 'ความโปร่งใส การเปิดเผยข้อมูล และการมีส่วนร่วมตรวจสอบอย่างเป็นธรรม',
      highlightReason: `โครงการสะท้อนความโดดเด่นในด้านความสุจริตและธรรมาภิบาลอย่างชัดเจน โดยวางกลไกการเปิดเผยข้อมูล${honEv.length > 0 ? ` (เช่น "${honEv[0]}")` : ''} การบริหารจัดการที่โปร่งใส ตรวจสอบได้ และรับฟังเสียงประชาชนอย่างเที่ยงธรรม`,
      evidenceSnippets: honEv
    },
    {
      key: 'volunteer',
      name: 'จิตอาสา',
      title: 'ด้านจิตอาสาและจิตสาธารณะ (Public Mind & Prosocial Action)',
      subtitle: 'การเสียสละเพื่อส่วนรวม เอื้อเฟื้อเผื่อแผ่ และรวมพลังช่วยเหลือสังคม',
      iconName: 'HeartHandshake',
      score: volCalc.score,
      isStandout: false,
      level: 'มีส่วนร่วมเชิงพฤติกรรม',
      color: '#f59e0b',
      bgLight: '#fffbeb',
      borderColor: '#fde68a',
      badgeEmoji: '🤝',
      coreDriver: 'การเสียสละเพื่อส่วนรวม พลังอาสาสมัคร และการลงแขกเกื้อกูลช่วยเหลือสังคม',
      highlightReason: `โครงการมีความโดดเด่นเป็นพิเศษในด้านจิตอาสาและการมีจิตสาธารณะ โดยระดมพลังความร่วมมือและการเสียสละเพื่อประโยชน์ส่วนรวม${volEv.length > 0 ? ` (เช่น "${volEv[0]}")` : ''} ก่อให้เกิดจิตสำนึกเอื้อเฟื้อเกื้อกูลและพลังชุมชนที่เข้มแข็ง`,
      evidenceSnippets: volEv
    },
    {
      key: 'gratitude',
      name: 'กตัญญู',
      title: 'ด้านความกตัญญูและการเกื้อกูล (Gratitude & Stakeholder Care)',
      subtitle: 'การรู้คุณ ตอบแทนผู้มีพระคุณ ดูแลผู้สูงวัย และสืบสานภูมิปัญญาบ้านเกิด',
      iconName: 'Heart',
      score: gratCalc.score,
      isStandout: false,
      level: 'มีส่วนร่วมเชิงพฤติกรรม',
      color: '#ec4899',
      bgLight: '#fdf2f8',
      borderColor: '#fbcfe8',
      badgeEmoji: '💖',
      coreDriver: 'การดูแลผู้สูงวัยและกลุ่มเปราะบาง ควบคู่การสืบสานภูมิปัญญาและตอบแทนแผ่นดินเกิด',
      highlightReason: `โครงการโดดเด่นในด้านความกตัญญูและการเกื้อกูลผู้มีพระคุณ โดยมีกิจกรรมดูแลผู้สูงวัยและกลุ่มเปราะบาง${gratEv.length > 0 ? ` (เช่น "${gratEv[0]}")` : ''} ควบคู่กับการสืบสานภูมิปัญญาและตอบแทนแผ่นดินเกิด`,
      evidenceSnippets: gratEv
    }
  ];

  // เรียงลำดับตามคะแนนความเข้มข้นจากมากไปน้อย
  rawList.sort((a, b) => b.score - a.score);

  // คัดเลือกจุดเด่นเป็นพิเศษ (Top 1 เป็นจุดเด่นเสมอ, Top 2 และ Top 3 พิจารณาตามเกณฑ์ความเข้มข้น)
  const top1 = rawList[0];
  const top2 = rawList[1];
  const top3 = rawList[2];

  top1.isStandout = true;

  if (top2 && (top2.score >= 65 || (top1.score - top2.score) <= 12)) {
    top2.isStandout = true;
  }

  if (top3 && top3.score >= 75 && top2 && (top2.score - top3.score) <= 8) {
    top3.isStandout = true;
  }

  // กำหนดระดับความโดดเด่น (Level Tag)
  rawList.forEach(v => {
    if (v.isStandout) {
      v.level = v.score >= 82 ? 'โดดเด่นมากเป็นพิเศษ' : 'โดดเด่นเป็นพิเศษ';
    } else {
      v.level = v.score >= 55 ? 'มีส่วนร่วมเชิงพฤติกรรม' : 'ควรส่งเสริมเพิ่มเติม';
    }
  });

  const standouts = rawList.filter(v => v.isStandout);

  // สรุปภาพรวมจุดเด่นคุณธรรมของโครงการ (Overall Virtue Strength Summary - แสดงเฉพาะหัวข้อมิติที่เป็นจุดเด่น ไม่แสดงคะแนน)
  let overallSummary = '';
  if (standouts.length === 1) {
    overallSummary = `โครงการนี้มีจุดเด่นในดัชนีคุณธรรมด้าน【${standouts[0].name}】เป็นพิเศษ โดดเด่นด้วย${standouts[0].coreDriver} ซึ่งทำหน้าที่เป็นกลไกขับเคลื่อนหลักในการปรับเปลี่ยนพฤติกรรมของชุมชนอย่างเป็นรูปธรรม`;
  } else if (standouts.length === 2) {
    overallSummary = `โครงการนี้มีจุดเด่นในดัชนีคุณธรรม 5 ด้าน โดยเฉพาะด้าน【${standouts[0].name}】และด้าน【${standouts[1].name}】เป็นพิเศษ ผสานพลังระหว่าง${standouts[0].coreDriver} และ${standouts[1].coreDriver} ขับเคลื่อนการเปลี่ยนแปลงเชิงพฤติกรรมในพื้นที่ได้อย่างทรงพลัง`;
  } else if (standouts.length >= 3) {
    overallSummary = `โครงการนี้มีจุดเด่นในดัชนีคุณธรรม 5 ด้าน โดยผสานพลัง 3 มิติหลักเป็นพิเศษ ได้แก่ ด้าน【${standouts[0].name}】, ด้าน【${standouts[1].name}】และด้าน【${standouts[2].name}】ร่วมสร้างการปรับเปลี่ยนพฤติกรรมอย่างรอบด้านและยั่งยืน`;
  }

  return {
    topStandoutVirtues: standouts,
    allVirtuesBreakdown: rawList,
    overallVirtueStrengthSummary: overallSummary,
    primaryVirtueName: top1.name
  };
}

export function evaluatePreSubmissionWithRubric(
  projectData: {
    projectName: string;
    targetMoralVirtue: string;
    targetArea: string;
    targetAudience: string;
    proposalDetails: string;
    activityPlan: string;
    behavioralKpi?: string;
    proposerName?: string;
    proposerFirstName?: string;
    proposerLastName?: string;
    proposerAgency?: string;
    proposerPosition?: string;
    proposerLevel?: ParticipantLevel;
    aiDraftSnapshot?: {
      projectName?: string;
      proposalDetails?: string;
      activityPlan?: string;
      behavioralKpi?: string;
    } | null;
  },
  challengeStatement: string,
  selectedVirtues: string[],
  activeRubric: UniversalRubricDimension[] = UNIVERSAL_DEFAULT_RUBRIC,
  comparativeContext?: ComparativeEvaluationContext,
  checkCount: number = 1,
  previousSnapshot?: TempEvaluationSnapshot | null,
  history?: TempEvaluationHistory | null
): PreSubmissionEvaluationResult {
  const compCtx = comparativeContext || getComparativeBenchmarkAnchors();

  // ตรวจสอบความเป็นไปได้และความสมจริงของโครงการ (Stage 4: Feasibility & Realism Assessment)
  const feasibility = assessProjectFeasibility(projectData, challengeStatement);

  // ดึงประวัติ 5 ครั้งล่าสุดจาก parameter หรือ storage หากมี
  const provinceName = projectData.targetArea?.replace(/^จ\./, '').trim() || 'ส่วนกลาง';
  const effectiveHistory = history || getTempEvaluationHistory(provinceName);
  const historySnapshots = effectiveHistory?.snapshots;
  const latestPrevSnapshot = historySnapshots && historySnapshots.length > 0 ? historySnapshots[historySnapshots.length - 1] : previousSnapshot;
  const effectivePrevSnapshot = latestPrevSnapshot;

  // ค้นหา Snapshot ในประวัติ 5 ครั้งล่าสุดที่เหมือนกับโครงการปัจจุบันมากที่สุด (Best Matching Prior Snapshot)
  const priorMatch = historySnapshots && historySnapshots.length > 0
    ? findBestMatchingPriorSnapshot(projectData, historySnapshots)
    : null;

  const bestBaseSnapshot = priorMatch ? priorMatch.bestSnapshot : (latestPrevSnapshot || null);
  const nextIteration = (latestPrevSnapshot?.iteration || 0) + 1;

  // คำนวณความแตกต่างเชิงโครงสร้างและเนื้อหากับ "โครงการตัวตั้งต้นที่เหมือนที่สุด" (Proposal Diff Engine)
  let diffAnalysis: ProposalDiffAnalysis | undefined = undefined;
  if (bestBaseSnapshot && bestBaseSnapshot.projectData) {
    diffAnalysis = computeProjectProposalDiff(
      projectData,
      bestBaseSnapshot.projectData,
      challengeStatement,
      nextIteration,
      bestBaseSnapshot.iteration || 1
    );
  }

  const { fullCompiledPrompt, filteredRubric } = buildPreSubmissionPromptPayload(
    projectData,
    challengeStatement,
    selectedVirtues,
    activeRubric,
    compCtx,
    bestBaseSnapshot || effectivePrevSnapshot,
    historySnapshots,
    diffAnalysis
  );

  const proposalText = `${projectData.projectName} ${projectData.proposalDetails} ${projectData.activityPlan}`;
  const planText = projectData.activityPlan || '';
  const challengeText = challengeStatement || '';

  // 1. Calculate substantive quality profile for candidate project
  const candProfile = calculateSubstantiveQualityProfile(projectData, challengeStatement);

  // 1. คำนวณคะแนนตามจริงเฉพาะด้านของแต่ละมิติ และสร้างคำแนะนำสะท้อนผล (Authentic Dimension Scoring)
  const evaluatedDimensions: EvaluatedDimensionDetail[] = [];
  let sumNormalized = 0;
  let sumRawScore = 0;
  const is4Pillars = filteredRubric.some((d) =>
    ['challenge_fit', 'creative_nudge', 'actionability', 'expected_impact'].includes(d.virtueKey)
  );

  for (const dim of filteredRubric) {
    const dimMaxScore = dim.maxScore || (is4Pillars ? 25 : 20);
    // คำนวณคะแนนตามจริงเฉพาะด้านของมัน
    const dimScore = calculateSpecificDimensionScore(dim, projectData, challengeStatement, candProfile);
    const normalized = Number(((dimScore / dimMaxScore) * 100).toFixed(2));
    sumNormalized += normalized;
    sumRawScore += dimScore;

    let levelName = 'ระดับดีเลิศ (85-100%)';
    if (normalized < 50) levelName = 'ระดับกำลังพัฒนา (0-49%)';
    else if (normalized < 70) levelName = 'ระดับพอใช้ (50-69%)';
    else if (normalized < 85) levelName = 'ระดับดี (70-84%)';

    // คำแนะนำสะท้อนและไกด์แนวทางการพัฒนาสำหรับแต่ละด้าน
    const coaching = generateDimensionReflectiveCoaching(dim, projectData, challengeStatement);

    const rawVirtueName = dim.virtueTitle.includes(':') ? dim.virtueTitle.split(':')[1]?.trim() : dim.virtueTitle;
    const cleanVirtueName = rawVirtueName.split('(')[0]?.trim().replace(/^ด้าน/, '').trim() || dim.virtueTitle;

    evaluatedDimensions.push({
      virtueKey: dim.virtueKey,
      virtueName: cleanVirtueName,
      virtueTitle: dim.virtueTitle,
      subPillarTitle: dim.subPillarTitle,
      scoreOutOf20: Number(((dimScore / dimMaxScore) * 20).toFixed(2)),
      score: dimScore,
      maxScore: dimMaxScore,
      normalizedScore: normalized,
      levelName,
      matchedRubricBullets: coaching.developmentPillars,
      rationale: coaching.rationale
    });
  }

  // 2. คำนวณคะแนนรวมตามหลักการจริง (Baseline Raw Score):
  // สำหรับเกณฑ์ 4 เสาหลัก นำผลรวมของ 4 เสาหลัก (30+25+25+20 = 100) มาใช้โดยตรง
  // สำหรับเกณฑ์เดิม นำคะแนนแต่ละด้านมาเฉลี่ยหาคะแนนรวม
  const rawScore = is4Pillars
    ? Number(Math.min(100.00, sumRawScore).toFixed(2))
    : (evaluatedDimensions.length > 0 ? Number((sumNormalized / evaluatedDimensions.length).toFixed(2)) : 80.00);

  // 3. Relative Comparative Scoring & Proximity Engine
  let finalScore = rawScore;
  let compRationale = '';
  let proximityTarget: ComparativeEvaluationContext['proximityTarget'] = 'first_baseline';
  let proximityRatio = 0.5;
  let proximityPercentage = 50;
  let proximityBadgeText = '';

  let scoreDelta: number | undefined = undefined;
  let progressionSummary: string | undefined = undefined;
  const iteration = nextIteration;
  const previousScore = bestBaseSnapshot ? bestBaseSnapshot.finalScore : undefined;

  if (candProfile.isOffTopic) {
    finalScore = rawScore;
    proximityTarget = 'below_top3';
    proximityRatio = 0.0;
    proximityPercentage = 0;
    proximityBadgeText = `❌ ข้อเสนอไม่ตรงกับโจทย์ (${finalScore.toFixed(2)} คะแนน / ตกเกณฑ์)`;
    compRationale = `❌ ตรวจสอบพบข้อเสนอโครงการไม่ได้เป็นทิศทางเดียวในการแก้ปัญหาโจทย์ความท้าทายที่เลือก:\n• โจทย์ความท้าทายที่ตั้งไว้: "${challengeStatement || 'ปัญหาในพื้นที่'}"\n• สาระสำคัญของโครงการ: ${candProfile.offTopicReason || 'มุ่งเน้นการจัดการในประเด็นอื่นที่ไม่ตรงกับโจทย์ปัญหา'}\nตามหลักเกณฑ์การประเมิน ข้อเสนอโครงการต้องมุ่งเน้นการแก้โจทย์ความท้าทายโดยตรงเป็นอันดับแรก เมื่อเนื้อหาไม่ได้เป็นทิศทางเดียวกับโจทย์ โครงการจึงตกเกณฑ์การประเมินในเสาหลักที่ 1 (Problem Fit) และส่งผลให้คะแนนรวมอยู่ในระดับกำลังพัฒนา (${finalScore.toFixed(2)} / 100.00 คะแนน) ได้คะแนนต่ำมากอย่างเคร่งครัด`;
  } else if (bestBaseSnapshot && typeof bestBaseSnapshot.finalScore === 'number') {
    // ------------------------------------------------------------------------
    // REVISION PROGRESSION COMPARISON (วงรอบการปรับปรุงข้ามเวอร์ชันด้วย 5-Revision History & Diff Engine)
    // ใช้วัดคะแนนโดยอิงจาก "โครงการ temp ตัวตั้งต้นที่เหมือนที่สุดใน 5 ครั้งก่อนหน้า"
    // ------------------------------------------------------------------------
    const isExact = Boolean(priorMatch?.isExactMatch);
    const baseIteration = bestBaseSnapshot.iteration || 1;
    const baseScore = bestBaseSnapshot.finalScore;

    if (isExact) {
      // 100% IDENTICAL MATCH: ข้อเขียนเหมือนกับโครงการตัวตั้งต้นทุกประการ
      // คะแนนจะต้องเท่ากันกับโครงการตัวตั้งต้น 100% เป๊ะ และเคลียร์บทลงโทษจากรอบก่อนหน้าออกทั้งหมด
      finalScore = baseScore;
      scoreDelta = latestPrevSnapshot ? Number((finalScore - latestPrevSnapshot.finalScore).toFixed(2)) : 0;

      // คืนค่าคะแนน 4 เสาหลักจากโครงการตัวตั้งต้นแบบเป๊ะ 100%
      const baseP = bestBaseSnapshot.pillarScores || {};
      for (const dim of evaluatedDimensions) {
        const pKey = dim.virtueKey;
        const prevDimScore: number = typeof baseP[pKey] === 'number' ? baseP[pKey]! : (dim.score ?? dim.scoreOutOf20 ?? 15);
        dim.score = prevDimScore;
        const maxScore = dim.maxScore || (is4Pillars ? 25 : 20);
        dim.scoreOutOf20 = Number(((prevDimScore / maxScore) * 20).toFixed(2));
        dim.normalizedScore = Number(((prevDimScore / maxScore) * 100).toFixed(2));
      }
      calibratePillarsToTotalScore(evaluatedDimensions, finalScore, is4Pillars);

      if (baseIteration === latestPrevSnapshot?.iteration) {
        progressionSummary = `⚖️ ข้อเสนอโครงการเหมือนกับรอบที่ ${baseIteration} ทุกประการ (ไม่มีการแก้ไขเนื้อหา): ได้รับคะแนนเท่าเดิมที่ ${finalScore.toFixed(2)} คะแนนเป๊ะ`;
        compRationale = `⚖️ ตรวจสอบพบข้อความโครงการเหมือนกับรอบที่ ${baseIteration} ทุกประการ: ตามเกณฑ์ความเที่ยงตรง คะแนนจึงได้รับเท่าเดิมที่ ${finalScore.toFixed(2)} คะแนนเป๊ะ (ไม่มีการเปลี่ยนแปลง)`;
        proximityTarget = 'identical_first';
        proximityRatio = 1.0;
        proximityPercentage = 100;
        proximityBadgeText = `⚖️ เท่ากับรอบก่อนหน้า (${finalScore.toFixed(2)} คะแนน)`;
      } else {
        progressionSummary = `🔄 ข้อเสนอโครงการในรอบที่ ${iteration} เหมือนกับโครงการในการตรวจครั้งที่ ${baseIteration} ทุกประการ (100%): ระบบจึงใช้โครงการครั้งที่ ${baseIteration} เป็นตัวตั้งต้น เคลียร์คะแนนที่เคยถูกหักออกทั้งหมด และคืนค่าคะแนนกลับสู่ ${finalScore.toFixed(2)} คะแนนเป๊ะตามโครงการต้นแบบ (${scoreDelta >= 0 ? `+${scoreDelta.toFixed(2)}` : scoreDelta.toFixed(2)} คะแนนจากรอบก่อนหน้า)`;
        compRationale = `🔄 ตรวจสอบพบข้อเสนอโครงการในรอบที่ ${iteration} เขียนเหมือนกับข้อเสนอโครงการในการตรวจครั้งที่ ${baseIteration} ทุกประการ:\n• โครงการตัวตั้งต้น: ครั้งที่ ${baseIteration} (${baseScore.toFixed(2)} คะแนน)\n• สถานะการปรับแก้: คืนค่าเนื้อหากลับสู่ต้นแบบเดิม 100%\n• การเคลียร์บทลงโทษ: เคลียร์การตัดคะแนนจากรอบก่อนหน้าออกทั้งหมด\n• คะแนนผลลัพธ์: ${finalScore.toFixed(2)} คะแนนเป๊ะ (ตรงกับครั้งที่ ${baseIteration} ทุกประการ)`;
        proximityTarget = scoreDelta >= 0 ? 'top1_better' : 'below_top3';
        proximityRatio = scoreDelta >= 0 ? 1.15 : -0.15;
        proximityPercentage = scoreDelta >= 0 ? 100 : 0;
        proximityBadgeText = scoreDelta >= 0 ? `📈 คืนคะแนนเท่ารอบที่ ${baseIteration} (+${scoreDelta.toFixed(2)} คะแนน)` : `📉 เทียบเท่ารอบที่ ${baseIteration} (${scoreDelta.toFixed(2)} คะแนน)`;
      }
    } else if (diffAnalysis) {
      // โครงการได้รับการปรับปรุง/แก้ไข: ใช้วัดคะแนนโดยอิงจากโครงการตัวตั้งต้น (bestBaseSnapshot)
      // หากตัวตั้งต้นเคยโดนหักโทษแต่รอบนี้ผ่านเกณฑ์ ให้คืนค่าโทษ (Rebound)
      const bestBaseFeas = bestBaseSnapshot.feasibilityAssessment || assessProjectFeasibility(bestBaseSnapshot.projectData, challengeStatement);
      let effectiveBaseScore = baseScore;
      // ตรวจสอบว่าใน diffAnalysis ได้รวมคะแนน Rebound (+20) ไว้ใน totalDelta แล้วหรือไม่ เพื่อไม่ให้บวกซ้ำซ้อน
      const isReboundInDiff = diffAnalysis.positiveDiffs.some(
        d => d.fieldNameThai.includes('ความเป็นไปได้') && (d.scoreDelta || 0) > 0
      );
      if (!bestBaseFeas.isFeasible && feasibility.isFeasible && !isReboundInDiff) {
        effectiveBaseScore += (bestBaseFeas.penaltyScore || 20.00);
      }

      finalScore = Number(Math.min(99.50, Math.max(20.00, effectiveBaseScore + diffAnalysis.totalDelta)).toFixed(2));
      scoreDelta = latestPrevSnapshot ? Number((finalScore - latestPrevSnapshot.finalScore).toFixed(2)) : 0;

      // ปรับคะแนนแต่ละเสาหลักจาก bestBaseSnapshot.pillarScores + diffAnalysis.pillarDeltas
      const basePillars = bestBaseSnapshot.pillarScores || {};
      for (const dim of evaluatedDimensions) {
        const pKey = dim.virtueKey as keyof typeof diffAnalysis.pillarDeltas;
        const prevDimScore: number = typeof basePillars[pKey] === 'number'
          ? basePillars[pKey]!
          : (typeof basePillars[dim.virtueName] === 'number' ? basePillars[dim.virtueName]! : (dim.score ?? dim.scoreOutOf20 ?? 15));
        const deltaP = diffAnalysis.pillarDeltas[pKey] || 0;
        const maxScore = dim.maxScore || (is4Pillars ? (pKey === 'challenge_fit' ? 30 : pKey === 'expected_impact' ? 20 : 25) : 20);
        const minScore = 2.0;

        const newDimScore = Number(Math.max(minScore, Math.min(maxScore, prevDimScore + deltaP)).toFixed(2));
        dim.score = newDimScore;
        dim.scoreOutOf20 = Number(((newDimScore / maxScore) * 20).toFixed(2));
        dim.normalizedScore = Number(((newDimScore / maxScore) * 100).toFixed(2));
      }

      // ปรับสมดุลเสาหลัก (Headroom Balancing) เพื่อให้ผลรวม 4 เสาหลักเท่ากับ finalScore เป๊ะ 100%
      calibratePillarsToTotalScore(evaluatedDimensions, finalScore, is4Pillars);

      const simPct = Math.round((priorMatch?.similarity ?? 0.8) * 100);
      progressionSummary = `📈 ตรวจสอบพบโครงการนี้เหมือนกับโครงการครั้งที่ ${baseIteration} มากที่สุด (${simPct}%): จึงใช้โครงการครั้งที่ ${baseIteration} เป็นตัวตั้งต้นในการวัดคะแนนใหม่ (${effectiveBaseScore.toFixed(2)} คะแนน) เคลียร์คะแนนที่เคยถูกหักในรอบที่ผ่านมาออก และคำนวณคะแนนตามเนื้องานที่ปรับแก้ (${diffAnalysis.totalDelta >= 0 ? `+${diffAnalysis.totalDelta.toFixed(2)}` : diffAnalysis.totalDelta.toFixed(2)} คะแนน) รวมเป็น ${finalScore.toFixed(2)} คะแนน (${scoreDelta >= 0 ? `+${scoreDelta.toFixed(2)}` : scoreDelta.toFixed(2)} คะแนนจากรอบก่อนหน้า)`;
      compRationale = `• ตรวจสอบเปรียบเทียบกับโครงการในการตรวจครั้งที่ ${baseIteration} ซึ่งเป็นโครงการ Temp ในประวัติ 5 ครั้งล่าสุดที่มีโครงสร้างเหมือนกับโครงการนี้มากที่สุด (${simPct}%):\n${diffAnalysis.summaryText}\n• การคำนวณคะแนน: ใช้วัดคะแนนจากครั้งที่ ${baseIteration} เป็นตัวตั้งต้น เคลียร์คะแนนที่ถูกหักจากรอบก่อนหน้าออก และให้คะแนนตามผลการปรับปรุงจริง (${diffAnalysis.totalDelta >= 0 ? `+${diffAnalysis.totalDelta.toFixed(2)}` : diffAnalysis.totalDelta.toFixed(2)} คะแนน) รวมเป็น ${finalScore.toFixed(2)} คะแนน (${scoreDelta >= 0 ? `+${scoreDelta.toFixed(2)}` : scoreDelta.toFixed(2)} จากรอบก่อนหน้า)`;

      if (scoreDelta >= 0.05) {
        proximityTarget = 'top1_better';
        proximityRatio = 1.15;
        proximityPercentage = 100;
        proximityBadgeText = `📈 พัฒนาการดีขึ้น (+${scoreDelta.toFixed(2)} คะแนน)`;
      } else if (scoreDelta <= -0.05) {
        proximityTarget = 'below_top3';
        proximityRatio = -0.15;
        proximityPercentage = 0;
        proximityBadgeText = `📉 รายละเอียดลดทอนลง (${scoreDelta.toFixed(2)} คะแนน)`;
      } else {
        proximityTarget = 'midway';
        proximityRatio = 0.5;
        proximityPercentage = 50;
        proximityBadgeText = `⚖️ คุณภาพเทียบเท่าโครงการตั้งต้น (${finalScore.toFixed(2)} คะแนน)`;
      }
    }
  } else if (compCtx.mode === 'first_project_rubric_real' || compCtx.mode === 'first_project_start_80') {
    if (candProfile.isUnmodifiedAiDraft) {
      finalScore = Number(Math.min(78.50, Math.max(74.00, candProfile.qualityScore || rawScore)).toFixed(2));
      proximityTarget = 'first_baseline';
      proximityRatio = 0.5;
      proximityPercentage = 50;
      proximityBadgeText = `🌱 ร่างตั้งต้น AI (${finalScore.toFixed(2)} คะแนน / รอการพัฒนาต่อยอด)`;
      compRationale = `🌱 โครงการฉบับร่างตั้งต้นจาก AI ได้รับการประเมินตามเกณฑ์ Rubric 4 เสาหลัก อยู่ที่ ${finalScore.toFixed(2)} / 100.00 คะแนน (ระดับ 'ดี' ไม่เกิน 80.00 คะแนนตามเกณฑ์):\n• ระบบกำหนดคะแนนตั้งต้นไม่เกิน 80 คะแนน เพื่อเปิดโอกาสให้ผู้เข้าร่วมกิจกรรมได้ลงมือปรับปรุง เพิ่มเติมชื่อหน่วยงานจริง แผนกิจกรรมเชิงรุก และตัวชี้วัดเฉพาะพื้นที่ เพื่อยกระดับคะแนนสู่ 85 - 100 คะแนน (ระดับดีเลิศ)\n\n${formatWorkshopReflectiveCoaching(candProfile, (selectedVirtues && selectedVirtues.length > 0 ? selectedVirtues[0] : 'คุณธรรม'), challengeStatement)}`;
    } else {
      finalScore = rawScore;
      proximityTarget = 'first_baseline';
      proximityRatio = 0.5;
      proximityPercentage = 50;
      proximityBadgeText = `🎯 ประเมินตามเกณฑ์จริง (${finalScore.toFixed(2)} คะแนน)`;
      compRationale = `• ได้รับการประเมินตามเกณฑ์ Rubric 4 เสาหลักอย่างเที่ยงตรงตามคุณภาพเนื้อหาจริง ได้คะแนน ${finalScore.toFixed(2)} / 100.00 คะแนน`;
    }
  } else if (compCtx.mode === 'second_project_compare_first' && (compCtx.anchorProject1 || (compCtx.topAnchors && compCtx.topAnchors.length > 0))) {
    // Project #2: Compare with Project #1
    const anchor1 = compCtx.anchorProject1 || compCtx.topAnchors![0];
    const p1Score = anchor1.score ?? 80.00;
    const p1Name = anchor1.name || 'โครงการแรก';

    // CHECK RULE 1: IDENTICAL CHECK
    const isIdentical = checkIsProjectIdentical(projectData, anchor1);
    if (isIdentical) {
      finalScore = p1Score;
      proximityTarget = 'identical_first';
      proximityRatio = 1.0;
      proximityPercentage = 100;
      proximityBadgeText = `⚡ เหมือนโครงการแรกทุกประการ (คะแนนเท่ากัน 100% เป๊ะ)`;
      compRationale = `⚡ ตรวจสอบพบโครงการนี้มีเนื้อหาและโครงสร้างกิจกรรมเหมือนกับโครงการแรก ("${p1Name}") ทุกประการ:\nตามเกณฑ์มาตรฐานความเที่ยงตรงและความเป็นธรรม เมื่อข้อเสนอโครงการเหมือนกันทุกประการ คะแนนประเมินจึงได้รับเท่ากันที่ ${finalScore.toFixed(2)} คะแนนเป๊ะ (ไม่มีการสุ่มบวกเพิ่มหรือลดลง)`;
    } else if (candProfile.isUnmodifiedAiDraft) {
      finalScore = Number(Math.min(78.50, Math.max(62.00, candProfile.qualityScore)).toFixed(2));
      proximityTarget = 'closest_to_min';
      proximityRatio = 0.35;
      proximityPercentage = 35;
      proximityBadgeText = `🌱 ข้อเสนอเพื่อการพัฒนาใน Workshop (${finalScore.toFixed(2)} คะแนน)`;
      compRationale = formatWorkshopReflectiveCoaching(candProfile, (selectedVirtues && selectedVirtues.length > 0 ? selectedVirtues[0] : 'คุณธรรม'), challengeStatement);
    } else {
      // Calculate quality delta
      const anchor1Profile = anchor1.proposalDetails
        ? calculateSubstantiveQualityProfile(anchor1, challengeStatement)
        : null;
      const anchor1Quality = anchor1Profile ? anchor1Profile.qualityScore : p1Score;
      const deltaQ = candProfile.qualityScore - anchor1Quality;

      if (deltaQ > 1.0) {
        // Better than Project 1
        const diff = Number(Math.min(15.00, Math.max(1.20, deltaQ * 0.40)).toFixed(2));
        finalScore = Number(Math.min(99.50, p1Score + diff).toFixed(2));
        const addedStr = (finalScore - p1Score).toFixed(2);
        proximityTarget = 'closest_to_max';
        proximityRatio = 0.85;
        proximityPercentage = 85;
        proximityBadgeText = `📈 ดีกว่าโครงการแรก (+${addedStr} คะแนน)`;
        compRationale = `• เปรียบเทียบกับโครงการแรก ("${p1Name}" • ${p1Score.toFixed(2)} คะแนน):\nโครงการที่ 2 นี้มีความสมบูรณ์เชิงพฤติกรรมดีกว่าโครงการแรก โดยมีจุดเด่นที่เหนือกว่า: ${candProfile.strengths.slice(0, 2).join(' และ ') || 'กลไก Nudge และการมีส่วนร่วม 3 ระดับ'}\nจึงได้รับคะแนนประเมินสูงกว่าโครงการแรกอยู่ที่ ${finalScore.toFixed(2)} คะแนน (+${addedStr} คะแนน)`;
      } else if (deltaQ < -1.0) {
        // Worse than Project 1
        const diff = Number(Math.min(15.00, Math.max(1.20, (-deltaQ) * 0.40)).toFixed(2));
        finalScore = Number(Math.max(50.00, p1Score - diff).toFixed(2));
        const subStr = (p1Score - finalScore).toFixed(2);
        proximityTarget = 'closest_to_min';
        proximityRatio = 0.25;
        proximityPercentage = 25;
        proximityBadgeText = `📉 ด้อยกว่าโครงการแรก (-${subStr} คะแนน)`;
        compRationale = `• เปรียบเทียบกับโครงการแรก ("${p1Name}" • ${p1Score.toFixed(2)} คะแนน):\nโครงการที่ 2 มีความสมบูรณ์และกลไกพฤติกรรมด้อยกว่าโครงการแรก เนื่องจาก${candProfile.gaps.slice(0, 2).join(' และ ') || 'ยังขาดการติดตามตัวชี้วัดเชิงประจักษ์'}\nจึงได้รับคะแนนประเมินน้อยกว่าโครงการแรกอยู่ที่ ${finalScore.toFixed(2)} คะแนน (-${subStr} คะแนน)`;
      } else {
        // Equal/Comparable
        finalScore = p1Score;
        proximityTarget = 'midway';
        proximityRatio = 0.50;
        proximityPercentage = 50;
        proximityBadgeText = `⚖️ คุณภาพเทียบเท่าโครงการแรก (${finalScore.toFixed(2)} คะแนน)`;
        compRationale = `• เปรียบเทียบกับโครงการแรก ("${p1Name}" • ${p1Score.toFixed(2)} คะแนน):\nโครงการที่ 2 มีระดับคุณภาพและกลไกพฤติกรรมเทียบเคียงกับโครงการแรก คะแนนประเมินจึงได้รับในระดับเดียวกันที่ ${finalScore.toFixed(2)} คะแนน`;
      }
    }
  } else if (compCtx.mode === 'third_project_compare_prior_two' && compCtx.topAnchors && compCtx.topAnchors.length >= 2) {
    // Project #3: Compare with both Project 1 and Project 2 simultaneously
    const p1 = compCtx.topAnchors[0];
    const p2 = compCtx.topAnchors[1];

    const isIdentical1 = checkIsProjectIdentical(projectData, p1);
    const isIdentical2 = checkIsProjectIdentical(projectData, p2);

    if (isIdentical1) {
      finalScore = p1.score;
      proximityTarget = 'identical_first';
      proximityRatio = 1.0;
      proximityPercentage = 100;
      proximityBadgeText = `⚡ เหมือนโครงการ "${p1.name}" ทุกประการ (${finalScore.toFixed(2)} คะแนนเท่ากัน)`;
      compRationale = `⚡ ตรวจสอบพบโครงการนี้มีเนื้อหาและโครงสร้างกิจกรรมเหมือนกับโครงการ "${p1.name}" ทุกประการ:\nตามเกณฑ์มาตรฐานความเที่ยงตรงและความเป็นธรรม เมื่อข้อเสนอโครงการเหมือนกันทุกประการ คะแนนประเมินจึงได้รับเท่ากันที่ ${finalScore.toFixed(2)} คะแนนเป๊ะ`;
    } else if (isIdentical2) {
      finalScore = p2.score;
      proximityTarget = 'identical_min';
      proximityRatio = 1.0;
      proximityPercentage = 100;
      proximityBadgeText = `⚡ เหมือนโครงการ "${p2.name}" ทุกประการ (${finalScore.toFixed(2)} คะแนนเท่ากัน)`;
      compRationale = `⚡ ตรวจสอบพบโครงการนี้มีเนื้อหาและโครงสร้างกิจกรรมเหมือนกับโครงการ "${p2.name}" ทุกประการ:\nตามเกณฑ์มาตรฐานความเที่ยงตรงและความเป็นธรรม เมื่อข้อเสนอโครงการเหมือนกันทุกประการ คะแนนประเมินจึงได้รับเท่ากันที่ ${finalScore.toFixed(2)} คะแนนเป๊ะ`;
    } else if (candProfile.isUnmodifiedAiDraft) {
      finalScore = Number(Math.min(78.50, Math.max(62.00, candProfile.qualityScore)).toFixed(2));
      proximityTarget = 'below_top3';
      proximityRatio = 0.35;
      proximityPercentage = 35;
      proximityBadgeText = `🌱 ข้อเสนอเพื่อการพัฒนาใน Workshop (${finalScore.toFixed(2)} คะแนน)`;
      compRationale = formatWorkshopReflectiveCoaching(candProfile, (selectedVirtues && selectedVirtues.length > 0 ? selectedVirtues[0] : 'คุณธรรม'), challengeStatement);
    } else {
      const qCand = candProfile.qualityScore;
      const q1 = p1.proposalDetails ? calculateSubstantiveQualityProfile(p1, challengeStatement).qualityScore : p1.score;
      const q2 = p2.proposalDetails ? calculateSubstantiveQualityProfile(p2, challengeStatement).qualityScore : p2.score;

      const higherP = p1.score >= p2.score ? p1 : p2;
      const lowerP = p1.score < p2.score ? p1 : p2;
      const higherQ = p1.score >= p2.score ? q1 : q2;
      const lowerQ = p1.score < p2.score ? q1 : q2;

      if (qCand > higherQ + 1.0) {
        // Better than both
        const diff = Number(Math.min(7.00, Math.max(0.60, (qCand - higherQ) * 0.35)).toFixed(2));
        finalScore = Number(Math.min(99.50, higherP.score + diff).toFixed(2));
        proximityTarget = 'top1_better';
        proximityRatio = 1.15;
        proximityPercentage = 100;
        proximityBadgeText = `📈 ดีกว่าทั้งสองโครงการ (+${(finalScore - higherP.score).toFixed(2)} คะแนน)`;
      } else if (qCand < lowerQ - 1.0) {
        // Worse than both
        const diff = Number(Math.min(10.00, Math.max(0.60, (lowerQ - qCand) * 0.35)).toFixed(2));
        finalScore = Number(Math.max(50.00, lowerP.score - diff).toFixed(2));
        proximityTarget = 'below_top3';
        proximityRatio = -0.15;
        proximityPercentage = 0;
        proximityBadgeText = `📉 ด้อยกว่าทั้งสองโครงการ (-${(lowerP.score - finalScore).toFixed(2)} คะแนน)`;
      } else {
        // Positioned between higher and lower
        const qSpan = Math.max(1.0, higherQ - lowerQ);
        const ratio = Math.max(0.0, Math.min(1.0, (qCand - lowerQ) / qSpan));
        const sSpan = Math.max(0.5, higherP.score - lowerP.score);
        let interpolated = Number((lowerP.score + sSpan * ratio).toFixed(2));
        if (interpolated >= higherP.score) interpolated = Number((higherP.score - 0.20).toFixed(2));
        if (interpolated <= lowerP.score) interpolated = Number((lowerP.score + 0.20).toFixed(2));
        finalScore = interpolated;
        proximityTarget = 'top2_between';
        proximityRatio = ratio;
        proximityPercentage = Math.round(ratio * 100);
        proximityBadgeText = `🎯 คุณภาพแทรกระหว่างโครงการที่ 1 และ 2 (${finalScore.toFixed(2)} คะแนน)`;
      }

      // Comparison notes for p1 and p2
      const diff1 = Number((finalScore - p1.score).toFixed(2));
      const diff2 = Number((finalScore - p2.score).toFixed(2));

      const note1 = diff1 > 0 ? `📈 ดีกว่า (+${diff1.toFixed(2)} คะแนน)` : diff1 < 0 ? `📉 ด้อยกว่า (${diff1.toFixed(2)} คะแนน)` : `⚖️ เทียบเท่า (${p1.score.toFixed(2)} คะแนน)`;
      const note2 = diff2 > 0 ? `📈 ดีกว่า (+${diff2.toFixed(2)} คะแนน)` : diff2 < 0 ? `📉 ด้อยกว่า (${diff2.toFixed(2)} คะแนน)` : `⚖️ เทียบเท่า (${p2.score.toFixed(2)} คะแนน)`;

      compRationale = formatWorkshopReflectiveCoaching(candProfile, (selectedVirtues && selectedVirtues.length > 0 ? selectedVirtues[0] : 'คุณธรรม'), challengeStatement);
    }
  } else {
    // Project #4+: Multi-project Top 3 comparative engine
    const topAnchors = compCtx.topAnchors && compCtx.topAnchors.length > 0
      ? compCtx.topAnchors
      : ([compCtx.highestProject, compCtx.lowestProject].filter(Boolean) as BenchmarkProjectAnchor[]);

    const identicalAnchor = topAnchors.find((a) => checkIsProjectIdentical(projectData, a));
    if (identicalAnchor) {
      finalScore = identicalAnchor.score;
      proximityTarget = identicalAnchor.rank === 1 ? 'identical_max' : 'identical_min';
      proximityRatio = 1.0;
      proximityPercentage = 100;
      proximityBadgeText = `⚡ เหมือนอันดับ #${identicalAnchor.rank || 1} ทุกประการ (${finalScore.toFixed(2)} คะแนนเท่ากัน)`;
      compRationale = `⚡ ตรวจสอบพบโครงการนี้มีลักษณะเหมือนกับโครงการอันดับ #${identicalAnchor.rank || 1} ("${identicalAnchor.name}") ทุกประการ:\nตามเกณฑ์มาตรฐานความเที่ยงตรงและความเป็นธรรม เมื่อข้อเสนอโครงการเหมือนกันทุกประการ คะแนนประเมินจึงได้รับเท่ากันที่ ${finalScore.toFixed(2)} คะแนนเป๊ะ (ไม่มีการสุ่มบวกเพิ่มหรือลดลง)`;
    } else if (candProfile.isUnmodifiedAiDraft) {
      finalScore = Number(Math.min(78.50, Math.max(62.00, candProfile.qualityScore)).toFixed(2));
      proximityTarget = 'below_top3';
      proximityRatio = 0.35;
      proximityPercentage = 35;
      proximityBadgeText = `🌱 ข้อเสนอเพื่อการพัฒนาใน Workshop (${finalScore.toFixed(2)} คะแนน)`;
      compRationale = formatWorkshopReflectiveCoaching(candProfile, (selectedVirtues && selectedVirtues.length > 0 ? selectedVirtues[0] : 'คุณธรรม'), challengeStatement);
    } else {
      const qCand = candProfile.qualityScore;
      const topAnchorQualityScores = topAnchors.map((a) => {
        if (a.proposalDetails) {
          return calculateSubstantiveQualityProfile(a, challengeStatement).qualityScore;
        }
        return a.score;
      });

      const rank1Quality = topAnchorQualityScores[0] ?? topAnchors[0].score;
      const rank1Score = topAnchors[0].score;
      const lastIdx = topAnchors.length - 1;
      const lastQuality = topAnchorQualityScores[lastIdx] ?? topAnchors[lastIdx].score;
      const lastScore = topAnchors[lastIdx].score;

      // Case A: Clearly Outperforms Top 1
      if (qCand > rank1Quality + 1.2) {
        const diff = Number(Math.min(5.50, Math.max(0.60, (qCand - rank1Quality) * 0.28)).toFixed(2));
        finalScore = Number(Math.min(99.50, rank1Score + diff).toFixed(2));
        proximityTarget = 'top1_better';
        proximityRatio = 1.15;
        proximityPercentage = 100;
        proximityBadgeText = `🚀 โดดเด่นกว่าอันดับ 1 (+${(finalScore - rank1Score).toFixed(2)} คะแนน)`;
      }
      // Case B: Clearly Below the lowest of Top anchors
      else if (qCand < lastQuality - 1.2) {
        const diff = Number(Math.min(9.00, Math.max(0.60, (lastQuality - qCand) * 0.28)).toFixed(2));
        finalScore = Number(Math.max(50.00, lastScore - diff).toFixed(2));
        proximityTarget = 'below_top3';
        proximityRatio = -0.15;
        proximityPercentage = 0;
        proximityBadgeText = `⚠️ ต่ำกว่าอันดับ ${topAnchors.length} (-${(lastScore - finalScore).toFixed(2)} คะแนน)`;
      }
      // Case C: Situating within Top anchors range
      else {
        const qualitySpan = Math.max(1.0, rank1Quality - lastQuality);
        const ratio = Math.max(0.0, Math.min(1.0, (qCand - lastQuality) / qualitySpan));
        const scoreSpan = Math.max(1.0, rank1Score - lastScore);
        let interpolated = Number((lastScore + scoreSpan * ratio).toFixed(2));
        if (interpolated >= rank1Score) interpolated = Number((rank1Score - 0.20).toFixed(2));
        if (interpolated <= lastScore) interpolated = Number((lastScore + 0.20).toFixed(2));
        finalScore = interpolated;
        proximityRatio = Number(ratio.toFixed(2));
        proximityPercentage = Math.round(ratio * 100);

        if (ratio >= 0.50) {
          proximityTarget = 'top2_between';
          proximityBadgeText = `🎯 คุณภาพแทรกระหว่างอันดับ 1 และอันดับ 2 (${finalScore.toFixed(2)} คะแนน)`;
        } else {
          proximityTarget = 'top3_between';
          proximityBadgeText = `🎯 คุณภาพแทรกระหว่างอันดับ 2 และอันดับ 3 (${finalScore.toFixed(2)} คะแนน)`;
        }
      }

      // Set comparison details for each top anchor
      topAnchors.forEach((a) => {
        const diff = Number((finalScore - a.score).toFixed(2));
        if (diff > 0.1) {
          a.comparisonVsCandidate = 'candidate_better';
          a.comparisonDelta = diff;
          a.comparisonNote = `โครงการปัจจุบันได้คะแนนสูงกว่าอันดับ #${a.rank} (${a.name}) +${diff.toFixed(2)} คะแนน จากจุดเด่น: ${candProfile.strengths.slice(0, 2).join(' และ ') || 'กลไก Nudge และตัวชี้วัดเชิงประจักษ์'}`;
        } else if (diff < -0.1) {
          a.comparisonVsCandidate = 'candidate_worse';
          a.comparisonDelta = diff;
          a.comparisonNote = `โครงการปัจจุบันได้คะแนนน้อยกว่าอันดับ #${a.rank} (${a.name}) ${diff.toFixed(2)} คะแนน เนื่องจาก${candProfile.gaps.slice(0, 2).join(' และ ') || 'ยังขาดการติดตามผลเชิงประจักษ์'}`;
        } else {
          a.comparisonVsCandidate = 'candidate_equal';
          a.comparisonDelta = 0;
          a.comparisonNote = `โครงการปัจจุบันมีระดับคุณภาพเทียบเคียงกับอันดับ #${a.rank} (${a.name}) ที่ ${a.score.toFixed(2)} คะแนน`;
        }
      });

      const notes = topAnchors.map((a) => {
        const relStr = a.comparisonVsCandidate === 'candidate_better'
          ? `📈 ดีกว่า (+${a.comparisonDelta?.toFixed(2)} คะแนน)`
          : a.comparisonVsCandidate === 'candidate_worse'
          ? `📉 ด้อยกว่า (${a.comparisonDelta?.toFixed(2)} คะแนน)`
          : `⚖️ เทียบเท่า (${a.score.toFixed(2)} คะแนน)`;
        return `• อันดับ #${a.rank} "${a.name}" (${a.score.toFixed(2)} คะแนน): ${relStr}\n  - ${a.comparisonNote}`;
      }).join('\n\n');

      compRationale = formatWorkshopReflectiveCoaching(candProfile, (selectedVirtues && selectedVirtues.length > 0 ? selectedVirtues[0] : 'คุณธรรม'), challengeStatement);
    }
  }


  // --------------------------------------------------------------------------
  // STAGE 4: ตรวจสอบความเป็นไปได้และความสมจริงของโครงการ (Project Feasibility & Realism Assessment)
  // ตัดคะแนนอย่างน้อย 20 คะแนน (-20.00 pts) หากพบข้อบกพร่องด้านความเป็นไปได้
  // --------------------------------------------------------------------------
  if (!feasibility.isFeasible && feasibility.penaltyScore > 0) {
    if (!effectivePrevSnapshot) {
      finalScore = Number(Math.max(10.00, finalScore - feasibility.penaltyScore).toFixed(2));
    } else {
      // โครงการที่มีประวัติก่อนหน้า: ตรวจสอบว่าใน baseScore หรือ diffAnalysis ได้สะท้อนการหักคะแนนไปแล้วหรือไม่
      const isAlreadyPenalizedInDiff = diffAnalysis?.negativeDiffs.some(
        d => d.fieldNameThai.includes('ความเป็นไปได้') && (d.scoreDelta || 0) < 0
      );
      const targetBaseSnap = bestBaseSnapshot || effectivePrevSnapshot;
      const baseFeas = targetBaseSnap.feasibilityAssessment || assessProjectFeasibility(targetBaseSnap.projectData, challengeStatement);
      const baseWasPenalized = !baseFeas.isFeasible;

      if (!isAlreadyPenalizedInDiff && !baseWasPenalized) {
        finalScore = Number(Math.max(10.00, finalScore - feasibility.penaltyScore).toFixed(2));
      }
    }

    // Absolute Hard Ceiling: หากโครงการไม่ผ่านเกณฑ์ความเป็นไปได้ คะแนนต้องไม่เกิน 60.00 แต้มเด็ดขาด
    const maxInfeasibleCeiling = 60.00;
    if (finalScore > maxInfeasibleCeiling) {
      finalScore = maxInfeasibleCeiling;
    }
    proximityBadgeText = `⚠️ ไม่ผ่านเกณฑ์ความเป็นไปได้ (${finalScore.toFixed(2)} คะแนน / หัก -${feasibility.penaltyScore.toFixed(2)} แต้ม)`;
  }

  // ปรับผลลัพธ์และคำแนะนำของ AI: หากไม่ตรงกับโจทย์ ให้คงข้อความเตือนเรื่องผิดโจทย์ไว้เสมอ
  if (!candProfile.isOffTopic) {
    const baseCoaching = formatWorkshopReflectiveCoaching(
      candProfile,
      (selectedVirtues && selectedVirtues.length > 0 ? selectedVirtues[0] : 'คุณธรรม'),
      challengeStatement
    );
    compRationale = progressionSummary ? `${progressionSummary}\n\n${baseCoaching}` : baseCoaching;
  }

  // แทรกข้อความแจ้งเตือนความเป็นไปได้ไว้ด้านบนของคำแนะนำพี่เลี้ยง
  if (!feasibility.isFeasible && feasibility.issues.length > 0) {
    const feasWarning = `⚠️ ตรวจพบข้อบกพร่องด้านความเป็นไปได้ของโครงการ (ถูกตัดคะแนนอย่างน้อย -${feasibility.penaltyScore.toFixed(2)} คะแนน):\n${feasibility.issues.map(i => `• [${i.title}] ตรวจพบ "${i.detectedText}" ➔ ${i.recommendation}`).join('\n')}\n\n`;
    compRationale = `${feasWarning}${compRationale}`;
  }

  // คำนวณคะแนนจากการกดปุ่มตรวจสอบก่อนส่ง:
  // ยกเลิกการหักแต้ม: ไม่มีการหักคะแนนในทุกกรณี (penalty = 0)
  const penaltyData = calculatePreCheckPenalty(finalScore, checkCount);
  const netFinalScore = penaltyData.finalScore;
  const penaltyPoints = 0;
  const penaltyFormula = penaltyData.formula;

  // ปรับคะแนนรายเสาหลักให้สอดคล้องกับคะแนนรวมสุทธิ (Calibrate individual dimensions to match netFinalScore)
  // ให้ปรับสมดุล 4 เสาหลักให้ผลรวมตรงกับ netFinalScore 100% เสมอในทุกกรณี (รวมทั้งกรณีที่ถูกหักคะแนนหรือล็อกเพดาน Hard Ceiling ใน Stage 4)
  if (is4Pillars) {
    calibratePillarsToTotalScore(evaluatedDimensions, netFinalScore, is4Pillars);
  }

  // ตรวจสอบผู้ส่งซ้ำจาก field ชื่อ และ field นามสกุล
  let isDuplicateSubmitter = false;
  let existingProjectName: string | undefined = undefined;
  if (projectData.proposerFirstName && projectData.proposerLastName) {
    const dup = checkDuplicateSubmitter(projectData.proposerFirstName, projectData.proposerLastName);
    if (dup.isDuplicate && dup.existingProject) {
      isDuplicateSubmitter = true;
      existingProjectName = dup.existingProject.projectName;
    }
  }

  let averageCalculationFormula = '';
  if (is4Pillars) {
    const parts = evaluatedDimensions.map((d) => `${d.virtueName} (${(d.score ?? d.scoreOutOf20).toFixed(2)}/${d.maxScore ?? 20})`).join(' + ');
    averageCalculationFormula = `สูตรคิดคะแนน 4 เสาหลัก: ${parts} = ${netFinalScore.toFixed(2)} / 100.00 คะแนน`;
  } else if (evaluatedDimensions.length === 1) {
    const d = evaluatedDimensions[0];
    averageCalculationFormula = `สูตรคิดคะแนน: ประเมินเฉพาะด้าน${d.virtueName} (${d.scoreOutOf20.toFixed(2)} / 20.00 คะแนน คิดเป็น ${d.normalizedScore.toFixed(2)}%) = ${netFinalScore.toFixed(2)} คะแนนเต็ม 100.00`;
  } else if (evaluatedDimensions.length > 1) {
    const parts = evaluatedDimensions.map((d) => `ด้าน${d.virtueName} ${d.normalizedScore.toFixed(2)}%`).join(' + ');
    averageCalculationFormula = `สูตรคิดคะแนนเฉลี่ย: (${parts}) ÷ ${evaluatedDimensions.length} ด้าน = ${netFinalScore.toFixed(2)} คะแนนเต็ม 100.00`;
  }

  let qualityTier: 'ดีเลิศ' | 'ดี' | 'พอใช้' | 'ไม่ผ่าน' = 'ดี';
  if (netFinalScore >= 85.0) qualityTier = 'ดีเลิศ';
  else if (netFinalScore >= 70.0) qualityTier = 'ดี';
  else if (netFinalScore >= 50.0) qualityTier = 'พอใช้';
  else qualityTier = 'ไม่ผ่าน';

  const updatedContext: ComparativeEvaluationContext = {
    ...compCtx,
    comparativeRationale: compRationale,
    proximityTarget,
    proximityRatio,
    proximityPercentage,
    proximityBadgeText
  };

  // วิเคราะห์จุดเด่นของโครงการในดัชนีคุณธรรม 5 ด้าน (Moral Index Standout Analysis)
  const standoutVirtueAnalysis = analyzeProjectStandoutVirtues(projectData);

  return {
    finalScore: netFinalScore,
    rawScore,
    checkCount: penaltyData.checkCount,
    penaltyPoints,
    penaltyFormula,
    isDuplicateSubmitter,
    existingProjectName,
    qualityTier,
    challengeTopic: challengeStatement,
    selectedVirtueNames: is4Pillars
      ? filteredRubric.map((r) => r.virtueTitle.includes(':') ? r.virtueTitle.split(':')[1].split('(')[0].trim() : r.virtueTitle)
      : (selectedVirtues.length > 0 ? selectedVirtues : filteredRubric.map((r) => r.virtueTitle)),
    evaluatedDimensions,
    markdownPromptSent: fullCompiledPrompt,
    comparativeContext: updatedContext,
    averageCalculationFormula,
    isUnmodifiedAiDraft: candProfile.isUnmodifiedAiDraft,
    humanContributionScore: candProfile.humanContributionScore,
    aiDraftNote: candProfile.aiDraftNote,
    iteration,
    previousScore,
    scoreDelta,
    progressionSummary,
    previousSnapshot: bestBaseSnapshot || latestPrevSnapshot || undefined,
    historySnapshots: historySnapshots || undefined,
    diffAnalysis: diffAnalysis || undefined,
    feasibilityAssessment: feasibility,
    baseSnapshotIteration: bestBaseSnapshot?.iteration,
    baseSnapshotScore: bestBaseSnapshot?.finalScore,
    baseSnapshotSimilarity: priorMatch?.similarity ?? (bestBaseSnapshot ? 1.0 : undefined),
    standoutVirtueAnalysis
  };
}

/**
 * ฟังก์ชันประเมินข้อเสนอโครงการและตัดเกรดผ่าน OpenRouter LLM API จริง
 * โดยส่งข้อเสนอโครงการ กรอบ Rubric 4 เสาหลัก และประวัติการแก้ไขไปยัง OpenRouter
 * พร้อมทั้งมี Client-side Safety Guardrails (Hard Ceiling <= 60 เมื่อ Infeasible, Calibrate Pillars)
 * และมีระบบ Fallback ไปยัง Local Deterministic Scoring Engine อัตโนมัติเมื่อไม่มี API Key
 */
export async function evaluatePreSubmissionWithOpenRouterLlm(
  projectData: {
    projectName: string;
    targetMoralVirtue: string;
    targetArea: string;
    targetAudience: string;
    proposalDetails: string;
    activityPlan: string;
    behavioralKpi?: string;
    proposerName?: string;
    proposerFirstName?: string;
    proposerLastName?: string;
    proposerAgency?: string;
    proposerPosition?: string;
    proposerLevel?: ParticipantLevel;
    aiDraftSnapshot?: {
      projectName?: string;
      proposalDetails?: string;
      activityPlan?: string;
      behavioralKpi?: string;
    } | null;
  },
  challengeStatement: string = '',
  selectedVirtues: string[] = [],
  activeRubric: UniversalRubricDimension[] = UNIVERSAL_DEFAULT_RUBRIC,
  comparativeContext?: ComparativeEvaluationContext,
  checkCount: number = 1,
  previousSnapshot?: TempEvaluationSnapshot | null,
  history?: TempEvaluationHistory | null,
  abortSignal?: AbortSignal
): Promise<PreSubmissionEvaluationResult> {
  // 1. รันการประเมินฐานด้วย Local Deterministic Scoring Engine ก่อนเสมอ
  // เพื่อให้ได้โครงสร้าง Prompt, Diff Analysis, Feasibility Check และประวัติ 5 รอบที่สมบูรณ์
  const localResult = evaluatePreSubmissionWithRubric(
    projectData,
    challengeStatement,
    selectedVirtues,
    activeRubric,
    comparativeContext,
    checkCount,
    previousSnapshot,
    history
  );

  // 2. ตรวจสอบว่าผู้ใช้มีการตั้งค่า OpenRouter API Key ใน localStorage หรือ Environment หรือไม่
  const apiKey = getStoredOpenRouterApiKey();
  if (!apiKey) {
    console.warn('[OpenRouter AI Evaluation] No OpenRouter API Key configured in Settings or localStorage.');
    localResult.evaluationSource = 'deterministic_engine';
    localResult.openRouterErrorReason = 'ไม่พบ OpenRouter API Key ในการตั้งค่า (Settings)';
    return localResult;
  }

  const model = getStoredOpenRouterModel();
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 วินาที
  if (abortSignal) {
    abortSignal.addEventListener('abort', () => controller.abort());
  }

  console.log('[OpenRouter AI Evaluation] Requesting evaluation from OpenRouter...', {
    model,
    keyPrefix: `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
  });

  const systemPrompt = `คุณคือคณะกรรมการผู้เชี่ยวชาญการตัดสินการแข่งขัน Hackathon ศูนย์คุณธรรม (องค์การมหาชน) (Moral Innovation Hackathon Expert Judge)
หน้าที่ของคุณคืออ่านข้อเสนอโครงการของผู้เข้าแข่งขันอย่างละเอียด และประเมินให้คะแนนตามเกณฑ์ Rubric 4 เสาหลักอย่างเที่ยงตรง เป็นธรรม พร้อมระบุเหตุผลและคำวิจารณ์เชิงสร้างสรรค์

[เกณฑ์ Rubric 4 เสาหลัก (100 คะแนนเต็ม)]:
1. เสาหลักที่ 1 (challenge_fit): การตอบโจทย์ปัญหาพื้นที่ (เต็ม 30 คะแนน)
2. เสาหลักที่ 2 (creative_nudge): นวัตกรรมและกลไกสะกิดพฤติกรรม (เต็ม 25 คะแนน)
3. เสาหลักที่ 3 (actionability): แผนงานและความเป็นไปได้ 3 ระดับ (เต็ม 25 คะแนน)
4. เสาหลักที่ 4 (expected_impact): ตัวชี้วัดการเปลี่ยนแปลงพฤติกรรม (เต็ม 20 คะแนน)

[กฎเหล็กด้านความเป็นไปได้และความสมจริง (Project Feasibility Rules)]:
- หากโครงการระบุกรอบเวลาสั้นเกินจริง (< 30 วัน เช่น 1 วัน, 3 วัน) หรือยาวเกินไป (>= 3 ปี) ให้หักคะแนน 20 คะแนนทันที
- หากตั้งเป้าหมายปาฏิหาริย์ 100%, ลดปัญหาเป็นศูนย์ถาวร, อุบัติเหตุเป็นศูนย์ ให้หักคะแนน 20 คะแนนทันที
- หากกลุ่มเป้าหมายไม่สมจริง (มากกว่าประชากรจังหวัด หรือน้อยกว่า 5 คน) ให้หักคะแนน 20 คะแนนทันที

[การตอบกลับเป็น JSON STRICT]:
ตอบกลับเป็น JSON ที่ถูกต้องตามโครงสร้างนี้เท่านั้น (ห้ามใส่ Markdown code block หรือข้อความอื่นนอก JSON):
{
  "pillarScores": {
    "challenge_fit": 24.5,
    "creative_nudge": 19.0,
    "actionability": 18.5,
    "expected_impact": 15.0
  },
  "finalScore": 77.0,
  "qualityTier": "ดีเลิศ" หรือ "ดี" หรือ "พอใช้" หรือ "ไม่ผ่าน",
  "isOffTopic": false,
  "offTopicReason": "",
  "feasibility": {
    "isFeasible": true,
    "penaltyScore": 0,
    "issues": []
  },
  "reflectiveCoaching": {
    "strengths": ["จุดเด่นที่ 1", "จุดเด่นที่ 2"],
    "growthOpportunities": ["โอกาสพัฒนาที่ 1", "โอกาสพัฒนาที่ 2"],
    "actionableNextSteps": "คำแนะนำก้าวถัดไป"
  },
  "dimensionRationales": {
    "challenge_fit": "เหตุผลประกอบเสาหลักที่ 1",
    "creative_nudge": "เหตุผลประกอบเสาหลักที่ 2",
    "actionability": "เหตุผลประกอบเสาหลักที่ 3",
    "expected_impact": "เหตุผลประกอบเสาหลักที่ 4"
  }
}`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
        'X-Title': 'Moral Hackathon AI Judge',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: localResult.markdownPromptSent }
        ]
      })
    });

    clearTimeout(timeoutId);
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errMsg = `HTTP ${res.status}`;
      try {
        const j = JSON.parse(errText);
        errMsg = j.error?.message || errText;
      } catch {
        errMsg = errText || `${res.status} ${res.statusText}`;
      }
      console.error('[OpenRouter AI Evaluation Error]', res.status, errMsg);
      localResult.evaluationSource = 'deterministic_engine';
      localResult.openRouterErrorReason = errMsg;
      return localResult;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      localResult.evaluationSource = 'deterministic_engine';
      localResult.openRouterErrorReason = 'OpenRouter ตอบกลับมาเป็นค่าว่าง';
      return localResult;
    }

    const cleanJson = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '')
      .trim();

    let parsed: any = null;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      const firstB = cleanJson.indexOf('{');
      const lastB = cleanJson.lastIndexOf('}');
      if (firstB !== -1 && lastB !== -1 && lastB > firstB) {
        try {
          parsed = JSON.parse(cleanJson.slice(firstB, lastB + 1));
        } catch {}
      }
    }

    if (!parsed) {
      localResult.evaluationSource = 'deterministic_engine';
      localResult.openRouterErrorReason = 'ไม่สามารถแปลงข้อความจาก AI เป็นโครงสร้าง JSON ที่ถูกต้องได้';
      return localResult;
    }
    const latency = Date.now() - startTime;

    // ------------------------------------------------------------------------
    // CLIENT-SIDE SAFETY GUARDRAILS (บังคับใช้ Invariants เพื่อความปลอดภัย 100%)
    // ------------------------------------------------------------------------
    const isLocalInfeasible = localResult.feasibilityAssessment && !localResult.feasibilityAssessment.isFeasible;
    const isLlmInfeasible = parsed.feasibility && parsed.feasibility.isFeasible === false;
    const isInfeasible = isLocalInfeasible || isLlmInfeasible;

    let aiFinalScore = typeof parsed.finalScore === 'number'
      ? parsed.finalScore
      : (parsed.pillarScores
          ? (parsed.pillarScores.challenge_fit || 0) + (parsed.pillarScores.creative_nudge || 0) + (parsed.pillarScores.actionability || 0) + (parsed.pillarScores.expected_impact || 0)
          : localResult.finalScore);

    // Hard Ceiling: หากไม่ผ่านเกณฑ์ความเป็นไปได้ คะแนนต้องไม่เกิน 60.00 แต้มเด็ดขาด
    if (isInfeasible) {
      aiFinalScore = Number(Math.min(60.00, Math.max(10.00, aiFinalScore)).toFixed(2));
    } else {
      aiFinalScore = Number(Math.min(99.50, Math.max(15.00, aiFinalScore)).toFixed(2));
    }

    // Calibrate 4 pillars from LLM response
    const pScores = parsed.pillarScores || {};
    for (const dim of localResult.evaluatedDimensions) {
      const pKey = dim.virtueKey;
      if (typeof pScores[pKey] === 'number') {
        dim.score = Number(pScores[pKey].toFixed(2));
      }
      if (parsed.dimensionRationales && parsed.dimensionRationales[pKey]) {
        dim.rationale = parsed.dimensionRationales[pKey];
      }
      const maxScore = dim.maxScore || 25;
      const dimScore = dim.score ?? 0;
      dim.scoreOutOf20 = Number(((dimScore / maxScore) * 20).toFixed(2));
      dim.normalizedScore = Number(((dimScore / maxScore) * 100).toFixed(2));
      if (dim.normalizedScore < 50) dim.levelName = 'ระดับกำลังพัฒนา (0-49%)';
      else if (dim.normalizedScore < 70) dim.levelName = 'ระดับพอใช้ (50-69%)';
      else if (dim.normalizedScore < 85) dim.levelName = 'ระดับดี (70-84%)';
      else dim.levelName = 'ระดับดีเลิศ (85-100%)';
    }

    // Calibrate 4 pillars strictly to aiFinalScore
    calibratePillarsToTotalScore(localResult.evaluatedDimensions, aiFinalScore, true);

    // Update coaching and rationale
    if (parsed.reflectiveCoaching) {
      const strList = Array.isArray(parsed.reflectiveCoaching.strengths) ? parsed.reflectiveCoaching.strengths.join(' และ ') : '';
      const gapList = Array.isArray(parsed.reflectiveCoaching.growthOpportunities) ? parsed.reflectiveCoaching.growthOpportunities.join(' รวมถึง') : '';
      const nextStep = parsed.reflectiveCoaching.actionableNextSteps || '';
      if (strList || gapList || nextStep) {
        localResult.comparativeContext.comparativeRationale = `🌟 จุดเด่นที่พบ: ${strList || 'มีโครงสร้างกิจกรรมที่ชัดเจน'}\n🌱 โอกาสต่อยอด: ${gapList || 'ขยายการมีส่วนร่วมในพื้นที่'}\n🎯 ก้าวถัดไปเชิงปฏิบัติการ: ${nextStep || 'ลงมือปฏิบัติการในพื้นที่จริง'}`;
      }
    }

    // Quality tier
    if (aiFinalScore >= 85.0) localResult.qualityTier = 'ดีเลิศ';
    else if (aiFinalScore >= 70.0) localResult.qualityTier = 'ดี';
    else if (aiFinalScore >= 50.0) localResult.qualityTier = 'พอใช้';
    else localResult.qualityTier = 'ไม่ผ่าน';

    localResult.finalScore = aiFinalScore;
    localResult.evaluationSource = 'openrouter_ai';
    localResult.modelName = model;
    localResult.openRouterLatencyMs = latency;
    localResult.comparativeContext.proximityBadgeText = `${localResult.comparativeContext.proximityBadgeText} ⚡ [AI: ${model}]`;

    return localResult;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('OpenRouter evaluation exception, fallback to local scoring:', err);
    localResult.evaluationSource = 'deterministic_engine';
    return localResult;
  }
}

