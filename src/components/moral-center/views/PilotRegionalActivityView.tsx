import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  UserCheck,
  Coffee,
  BarChart3,
  BrainCircuit,
  Sparkles,
  Trophy,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Flame,
  Award,
  Vote,
  ExternalLink,
  ChevronRight,
  Tag,
  ShieldCheck,
  Heart,
  Scale,
  Users,
  TableProperties,
  Pencil,
  Trash2,
  RotateCcw,
  Shuffle,
  Database,
  Lock,
  Key,
  X,
  Terminal,
  Copy,
  Check,
  Code2,
  LogOut,
  Search,
  RefreshCw,
  Home,
  Settings,
  Layers,
  FolderKanban,
  Activity,
  Network,
  LineChart,
  Sprout,
  Coins,
  GraduationCap,
  Eye,
  User,
  Briefcase,
  Building2,
  Clock,
  Loader2,
  ChevronDown,
  Target,
  LogIn
} from 'lucide-react';
import {
  PILOT_4_PROVINCES_META,
  type PilotProvinceName,
  type PilotAgencyRegistration,
  fetchPilotSqliteState,
  registerPilotAgencyInSqlite
} from '../data/pilotActivitiesSqliteService';
import { DatabaseTablesExplorer } from '../components/DatabaseTablesExplorer';
import {
  type CoffeeGroupKey,
  type CoffeeGroupMeta,
  type ParticipantLevel,
  type ParticipantRegistration,
  type HackathonProject,
  COFFEE_GROUPS,
  getHackathonProjects,
  saveHackathonProject,
  saveParticipantRegistration,
  setActiveVoterByName,
  clearActiveVoter,
  aiSuggestHackathonIdea,
  type AiIdeationResultWithPayload,
  buildAiIdeationPayloadStrings,
  suggestCreativeProjectTitles,
  stripProvinceFromProjectTitle,
  formatChallengeTopicFromProblemTitle,
  generateSingleCreativeProjectTitle,
  getStoredCoffeeGroups,
  fetchCoffeeGroupsFromDb,
  addCoffeeGroupToDb,
  updateCoffeeGroupInDb,
  deleteCoffeeGroupFromDb,
  resetCoffeeGroupsInDb,
  addCoffeeGroup,
  updateCoffeeGroup,
  deleteCoffeeGroup,
  resetCoffeeGroupsToDefault,
  MORAL_5_VIRTUES_LIST,
  evaluatePreSubmissionWithRubric,
  evaluatePreSubmissionWithOpenRouterLlm,
  getStoredOpenRouterApiKey,
  getStoredOpenRouterModel,
  type PreSubmissionEvaluationResult,
  getTempEvaluationSnapshot,
  saveTempEvaluationSnapshot,
  clearTempEvaluationSnapshot,
  type TempEvaluationSnapshot,
  getTempEvaluationHistory,
  pushTempEvaluationSnapshot,
  clearTempEvaluationHistory,
  getLatestTempSnapshot,
  type TempEvaluationHistory,
  type ProposalDiffAnalysis,
  calculatePreCheckPenalty,
  checkDuplicateSubmitter,
  getComparativeBenchmarkAnchors,
  resetSubmittedProjectsSession,
  type ComparativeEvaluationContext,
  fetchHackathonProjectsFromDb,
  saveHackathonProjectToDb,
  resetHackathonDatabaseFromApi,
  getComparativeBenchmarkAnchorsFromDb,
  getUserSubmittedProjects,
  isSeedHackathonProject,
  getProposerLevelLabel,
  formatBangkokSubmissionTime,
  deleteHackathonProject,
  fetchSqliteDbTables,
  fetchSqliteTableData,
  generateBehaviorModificationStrategy,
  suggestAlternativeBehaviorStrategies,
  DB_CATEGORIES,
  type DbTableCategoryKey,
  type SqliteTableMeta,
  type SqliteTableDataResponse,
  pollActivityState
} from '../data/pilotHackathonService';
import {
  isAdminAuthenticated,
  onAdminAuthChange,
  loginAdmin,
  logoutAdmin,
  isAccountLoggedIn,
  getCurrentUserProfile,
  onUserProfileChange,
  logoutSystem,
  type UserProfile
} from '../utils/adminAuthService';
import { AdminProfileDropdownMenu } from '../components/AdminProfileDropdownMenu';
import {
  PROVINCIAL_CHALLENGES_PROFILES,
  getProvincialChallengeProfile,
  ALL_77_PROVINCE_KEYS,
  PILOT_CHALLENGE_PROVINCE_KEYS,
  REGION_TABS,
  type ProvincialChallengeItem,
  type ProvinceChallengeProfile
} from '../data/pilotProvincialChallengesData';
import {
  fetchHackathonCriteriaFromSqlite,
  type PilotHackathonCriteriaRecord,
  UNIVERSAL_DEFAULT_RUBRIC,
  fetchSelectedCriteriaVirtues,
  saveSelectedCriteriaVirtues
} from '../data/pilotCriteriaService';
import { CriteriaGeneratorModal } from '../components/CriteriaGeneratorModal';
import { CriteriaViewerModal } from '../components/CriteriaViewerModal';
import { CoffeeGroupModal } from '../components/CoffeeGroupModal';
import { PreSubmissionEvaluationModal } from '../components/PreSubmissionEvaluationModal';
import { PostSubmissionScoreModal } from '../components/PostSubmissionScoreModal';
import { HackathonProjectDetailModal } from '../components/HackathonProjectDetailModal';
import {
  ALL_77_PROVINCES,
  PROVINCE_DISTRICTS,
  getDefaultDistrictForProvince,
  PROVINCE_HERO_BG,
  PROVINCE_HERO_BG_MOBILE,
  detectProvinceFromText
} from '../data/pilotGeographyService';
import '../styles/PilotHackathon.css';
import '../styles/PilotCriteriaModals.css';

// Research findings by province
interface MoralPowerItem {
  key: string;
  name: string;
  icon: string;
  score: number;
  nationalAvg: number;
  finding: string;
}

interface ProvinceResearchProfile {
  scopeLabel: string;
  scopeType: 'provincial' | 'regional';
  weaknessVirtue: string;
  weaknessVirtues?: string[];
  weaknessReason: string;
  hackathonMission: string;
  powers: MoralPowerItem[];
}

const PROVINCE_RESEARCH_DATA: Record<PilotProvinceName, ProvinceResearchProfile> = {
  'อยุธยา': {
    scopeLabel: 'ผลการวิจัยสถานการณ์คุณธรรมระดับภูมิภาค: ภาคกลาง (dataset ดัชนีคุณธรรมกับภูมิภาค พ.ศ. 2568)',
    scopeType: 'regional',
    weaknessVirtue: 'พอเพียง',
    weaknessVirtues: ['พอเพียง', 'สุจริต'],
    weaknessReason: '',
    hackathonMission: '',
    powers: [
      { key: 'suff', name: 'พอเพียง', icon: '🌱', score: 4.32, nationalAvg: 4.22, finding: '' },
      { key: 'disc', name: 'วินัยรับผิดชอบ', icon: '🎯', score: 4.43, nationalAvg: 4.33, finding: '' },
      { key: 'integ', name: 'สุจริต', icon: '⚖️', score: 4.34, nationalAvg: 4.22, finding: '' },
      { key: 'pub', name: 'จิตอาสา', icon: '🤝', score: 4.52, nationalAvg: 4.40, finding: '' },
      { key: 'grat', name: 'กตัญญู', icon: '💖', score: 4.75, nationalAvg: 4.62, finding: '' }
    ]
  },
  'อุดรธานี': {
    scopeLabel: 'ผลการวิจัยสถานการณ์คุณธรรมระดับภูมิภาค: ภาคตะวันออกเฉียงเหนือ (จ.อุดรธานี)',
    scopeType: 'regional',
    weaknessVirtue: 'สุจริต',
    weaknessReason: 'ดัชนีสุจริตและการรู้เท่าทันการเงินไซเบอร์ในกลุ่มแรงงานและคนรุ่นใหม่ยังต้องเฝ้าระวัง',
    hackathonMission: 'แข่งขันคิดค้นโครงการ "สุจริตและวินัยการเงินชุมชน ท่องเที่ยวสีขาวทะเลบัวแดง & มรดกโลกบ้านเชียง"',
    powers: [
      { key: 'suff', name: 'พอเพียง', icon: '🌱', score: 4.32, nationalAvg: 4.22, finding: 'เกษตรกรยังต้องสร้างภูมิคุ้มกันหนี้ครัวเรือนด้วยสัจจะออมทรัพย์' },
      { key: 'disc', name: 'วินัยรับผิดชอบ', icon: '🎯', score: 4.38, nationalAvg: 4.33, finding: 'วินัยการออมและการรวมกลุ่มวิสาหกิจชุมชนกุมภวาปี-หนองหาน' },
      { key: 'integ', name: 'สุจริต', icon: '⚖️', score: 4.20, nationalAvg: 4.22, finding: '🚨 จุดอ่อนเร่งด่วน: ปัญหาเปิดบัญชีม้าและกลโกงออนไลน์' },
      { key: 'pub', name: 'จิตอาสา', icon: '🤝', score: 4.58, nationalAvg: 4.40, finding: 'จิตอาสาพิทักษ์สิ่งแวดล้อมทะเลบัวแดงและชุมชนวัฒนธรรม' },
      { key: 'grat', name: 'กตัญญู', icon: '💖', score: 4.72, nationalAvg: 4.62, finding: 'การสืบทอดภูมิปัญญาผ้าทอและอัตลักษณ์มรดกโลกบ้านเชียง' }
    ]
  },
  'ลำปาง': {
    scopeLabel: 'ผลการวิจัยสถานการณ์คุณธรรมระดับภูมิภาค: ภาคเหนือ (จ.ลำปาง)',
    scopeType: 'regional',
    weaknessVirtue: 'วินัยรับผิดชอบ',
    weaknessReason: 'ปัญหาหมอกควันไฟป่า PM2.5 ในช่วงฤดูแล้ง และสังคมสูงวัยสมบูรณ์แบบที่ต้องการการบริบาลกตัญญู',
    hackathonMission: 'แข่งขันคิดค้นโครงการ "นครลำปางเมืองน่าอยู่ วินัยสิ่งแวดล้อมไร้หมอกควันไฟป่า & กตัญญูบริบาลผู้สูงวัยเมืองรถม้า"',
    powers: [
      { key: 'suff', name: 'พอเพียง', icon: '🌱', score: 4.45, nationalAvg: 4.22, finding: 'วิถีชีวิตพอเพียง ชุมชนเซรามิกสีเขียวและการท่องเที่ยวเชิงอนุรักษ์' },
      { key: 'disc', name: 'วินัยรับผิดชอบ', icon: '🎯', score: 4.15, nationalAvg: 4.33, finding: '🚨 จุดอ่อน: วินัยสิ่งแวดล้อม การเฝ้าระวังจุดความร้อน Hotspot ในเขตป่า' },
      { key: 'integ', name: 'สุจริต', icon: '⚖️', score: 4.46, nationalAvg: 4.22, finding: 'ธรรมาภิบาลชุมชนและวิสาหกิจสร้างสรรค์ยึดมั่นความซื่อสัตย์สุจริต' },
      { key: 'pub', name: 'จิตอาสา', icon: '🤝', score: 4.62, nationalAvg: 4.40, finding: 'อาสาสมัครดับไฟป่าและกู้ภัยชุมชนเข้มแข็ง' },
      { key: 'grat', name: 'กตัญญู', icon: '💖', score: 4.68, nationalAvg: 4.62, finding: 'พลังกตัญญูดูแลผู้สูงวัยในครอบครัวและการสืบสานประเพณีล้านนา' }
    ]
  },
  'กาฬสินธุ์': {
    scopeLabel: 'ผลการวิจัยสถานการณ์คุณธรรมระดับภูมิภาค: ภาคตะวันออกเฉียงเหนือ (จ.อุดรธานี)',
    scopeType: 'regional',
    weaknessVirtue: 'สุจริต',
    weaknessReason: 'ดัชนีสุจริตและการรู้เท่าทันการเงินไซเบอร์ในกลุ่มแรงงานและคนรุ่นใหม่ยังต้องเฝ้าระวัง',
    hackathonMission: 'แข่งขันคิดค้นโครงการ "สุจริตและวินัยการเงินชุมชน ท่องเที่ยวสีขาวทะเลบัวแดง & มรดกโลกบ้านเชียง"',
    powers: [
      { key: 'suff', name: 'พอเพียง', icon: '🌱', score: 4.32, nationalAvg: 4.22, finding: 'เกษตรกรยังต้องสร้างภูมิคุ้มกันหนี้ครัวเรือนด้วยสัจจะออมทรัพย์' },
      { key: 'disc', name: 'วินัยรับผิดชอบ', icon: '🎯', score: 4.38, nationalAvg: 4.33, finding: 'วินัยการออมและการรวมกลุ่มวิสาหกิจชุมชนกุมภวาปี-หนองหาน' },
      { key: 'integ', name: 'สุจริต', icon: '⚖️', score: 4.20, nationalAvg: 4.22, finding: '🚨 จุดอ่อนเร่งด่วน: ปัญหาเปิดบัญชีม้าและกลโกงออนไลน์' },
      { key: 'pub', name: 'จิตอาสา', icon: '🤝', score: 4.58, nationalAvg: 4.40, finding: 'จิตอาสาพิทักษ์สิ่งแวดล้อมทะเลบัวแดงและชุมชนวัฒนธรรม' },
      { key: 'grat', name: 'กตัญญู', icon: '💖', score: 4.72, nationalAvg: 4.62, finding: 'การสืบทอดภูมิปัญญาผ้าทอและอัตลักษณ์มรดกโลกบ้านเชียง' }
    ]
  },
  'น่าน': {
    scopeLabel: 'ผลการวิจัยสถานการณ์คุณธรรมระดับภูมิภาค: ภาคเหนือ (จ.ลำปาง)',
    scopeType: 'regional',
    weaknessVirtue: 'วินัยรับผิดชอบ',
    weaknessReason: 'ปัญหาหมอกควันไฟป่า PM2.5 ในช่วงฤดูแล้ง และสังคมสูงวัยสมบูรณ์แบบที่ต้องการการบริบาลกตัญญู',
    hackathonMission: 'แข่งขันคิดค้นโครงการ "นครลำปางเมืองน่าอยู่ วินัยสิ่งแวดล้อมไร้หมอกควันไฟป่า & กตัญญูบริบาลผู้สูงวัยเมืองรถม้า"',
    powers: [
      { key: 'suff', name: 'พอเพียง', icon: '🌱', score: 4.45, nationalAvg: 4.22, finding: 'วิถีชีวิตพอเพียง ชุมชนเซรามิกสีเขียวและการท่องเที่ยวเชิงอนุรักษ์' },
      { key: 'disc', name: 'วินัยรับผิดชอบ', icon: '🎯', score: 4.15, nationalAvg: 4.33, finding: '🚨 จุดอ่อน: วินัยสิ่งแวดล้อม การเฝ้าระวังจุดความร้อน Hotspot ในเขตป่า' },
      { key: 'integ', name: 'สุจริต', icon: '⚖️', score: 4.46, nationalAvg: 4.22, finding: 'ธรรมาภิบาลชุมชนและวิสาหกิจสร้างสรรค์ยึดมั่นความซื่อสัตย์สุจริต' },
      { key: 'pub', name: 'จิตอาสา', icon: '🤝', score: 4.62, nationalAvg: 4.40, finding: 'อาสาสมัครดับไฟป่าและกู้ภัยชุมชนเข้มแข็ง' },
      { key: 'grat', name: 'กตัญญู', icon: '💖', score: 4.68, nationalAvg: 4.62, finding: 'พลังกตัญญูดูแลผู้สูงวัยในครอบครัวและการสืบสานประเพณีล้านนา' }
    ]
  },
  'สุราษฎร์ธานี': {
    scopeLabel: 'ผลการวิจัยสถานการณ์คุณธรรมระดับภูมิภาค: ภาคใต้ (จ.สุราษฎร์ธานี)',
    scopeType: 'regional',
    weaknessVirtue: 'สุจริต',
    weaknessReason: '',
    hackathonMission: '',
    powers: [
      { key: 'suff', name: 'พอเพียง', icon: '🌱', score: 4.11, nationalAvg: 4.22, finding: '' },
      { key: 'disc', name: 'วินัยรับผิดชอบ', icon: '🎯', score: 4.23, nationalAvg: 4.33, finding: '' },
      { key: 'integ', name: 'สุจริต', icon: '⚖️', score: 4.05, nationalAvg: 4.22, finding: '' },
      { key: 'pub', name: 'จิตอาสา', icon: '🤝', score: 4.29, nationalAvg: 4.40, finding: '' },
      { key: 'grat', name: 'กตัญญู', icon: '💖', score: 4.60, nationalAvg: 4.62, finding: '' }
    ]
  },
  // Legacy aliases
  'ระยอง': {
    scopeLabel: 'ผลการวิจัยสถานการณ์คุณธรรมระดับภูมิภาค: ภาคกลาง (dataset ดัชนีคุณธรรมกับภูมิภาค พ.ศ. 2568)',
    scopeType: 'regional',
    weaknessVirtue: 'พอเพียง',
    weaknessVirtues: ['พอเพียง', 'สุจริต'],
    weaknessReason: '',
    hackathonMission: '',
    powers: [
      { key: 'suff', name: 'พอเพียง', icon: '🌱', score: 4.32, nationalAvg: 4.22, finding: '' },
      { key: 'disc', name: 'วินัยรับผิดชอบ', icon: '🎯', score: 4.43, nationalAvg: 4.33, finding: '' },
      { key: 'integ', name: 'สุจริต', icon: '⚖️', score: 4.34, nationalAvg: 4.22, finding: '' },
      { key: 'pub', name: 'จิตอาสา', icon: '🤝', score: 4.52, nationalAvg: 4.40, finding: '' },
      { key: 'grat', name: 'กตัญญู', icon: '💖', score: 4.75, nationalAvg: 4.62, finding: '' }
    ]
  },
  'หนองคาย': {
    scopeLabel: 'ผลการวิจัยสถานการณ์คุณธรรมระดับภูมิภาค: ภาคตะวันออกเฉียงเหนือ (จ.อุดรธานี)',
    scopeType: 'regional',
    weaknessVirtue: 'สุจริต',
    weaknessReason: 'ดัชนีสุจริตและการรู้เท่าทันการเงินไซเบอร์ในกลุ่มแรงงานและคนรุ่นใหม่ยังต้องเฝ้าระวัง',
    hackathonMission: 'แข่งขันคิดค้นโครงการ "สุจริตและวินัยการเงินชุมชน ท่องเที่ยวสีขาวทะเลบัวแดง & มรดกโลกบ้านเชียง"',
    powers: [
      { key: 'suff', name: 'พอเพียง', icon: '🌱', score: 4.32, nationalAvg: 4.22, finding: 'เกษตรกรยังต้องสร้างภูมิคุ้มกันหนี้ครัวเรือนด้วยสัจจะออมทรัพย์' },
      { key: 'disc', name: 'วินัยรับผิดชอบ', icon: '🎯', score: 4.38, nationalAvg: 4.33, finding: 'วินัยการออมและการรวมกลุ่มวิสาหกิจชุมชนกุมภวาปี-หนองหาน' },
      { key: 'integ', name: 'สุจริต', icon: '⚖️', score: 4.20, nationalAvg: 4.22, finding: '🚨 จุดอ่อนเร่งด่วน: ปัญหาเปิดบัญชีม้าและกลโกงออนไลน์' },
      { key: 'pub', name: 'จิตอาสา', icon: '🤝', score: 4.58, nationalAvg: 4.40, finding: 'จิตอาสาพิทักษ์สิ่งแวดล้อมทะเลบัวแดงและชุมชนวัฒนธรรม' },
      { key: 'grat', name: 'กตัญญู', icon: '💖', score: 4.72, nationalAvg: 4.62, finding: 'การสืบทอดภูมิปัญญาผ้าทอและอัตลักษณ์มรดกโลกบ้านเชียง' }
    ]
  },
  'พังงา': {
    scopeLabel: 'ผลการวิจัยสถานการณ์คุณธรรมระดับภูมิภาค: ภาคใต้ (จ.สุราษฎร์ธานี)',
    scopeType: 'regional',
    weaknessVirtue: 'จิตอาสา',
    weaknessReason: 'ดัชนีจิตอาสาฟื้นฟูระบบนิเวศทางทะเลและอ่างเก็บน้ำยังต้องยกระดับ',
    hackathonMission: 'แข่งขันคิดค้นโครงการ "จิตอาสาเมืองคนดี พิทักษ์ป่าต้นน้ำเชี่ยวหลาน & ท่องเที่ยวสุจริตสีขาว"',
    powers: [
      { key: 'suff', name: 'พอเพียง', icon: '🌱', score: 4.38, nationalAvg: 4.42, finding: 'เกษตรกรสวนยางและปาล์มน้ำมันยังต้องสร้างภูมิคุ้มกัน' },
      { key: 'disc', name: 'วินัยรับผิดชอบ', icon: '🎯', score: 4.32, nationalAvg: 4.28, finding: 'การเคารพกฎความปลอดภัยการเดินเรือท่องเที่ยว' },
      { key: 'integ', name: 'สุจริต', icon: '⚖️', score: 4.38, nationalAvg: 4.35, finding: 'การตั้งราคาบริการนักท่องเที่ยวให้โปร่งใส' },
      { key: 'pub', name: 'จิตอาสา', icon: '🤝', score: 4.18, nationalAvg: 4.38, finding: '🚨 จุดอ่อน: ขยะพลาสติกท่องเที่ยวตกค้างในแหล่งน้ำธรรมชาติ' },
      { key: 'grat', name: 'กตัญญู', icon: '💖', score: 4.62, nationalAvg: 4.55, finding: 'ความกตัญญูต่อผืนแผ่นดินเกิดและการสืบสานอัตลักษณ์เมืองคนดี' }
    ]
  }
};

interface PilotRegionalActivityViewProps {
  province: PilotProvinceName;
  onProvinceChange?: (province: PilotProvinceName) => void;
  onBackToOverview?: () => void;
  onNavigateToVote?: () => void;
  onNavigateHome?: () => void;
  onNavigateToSettings?: () => void;
}

export const PilotRegionalActivityView: React.FC<PilotRegionalActivityViewProps> = ({
  province,
  onProvinceChange,
  onBackToOverview,
  onNavigateToVote,
  onNavigateHome,
  onNavigateToSettings
}) => {
  const meta = PILOT_4_PROVINCES_META[province];
  const research = PROVINCE_RESEARCH_DATA[province];

  // 5 Steps state (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Registration Form State
  const getOfficialProvince = (prov: string): string => {
    if (prov === 'อยุธยา') return 'พระนครศรีอยุธยา';
    return prov;
  };

  const [regFirstName, setRegFirstName] = useState<string>('');
  const [regLastName, setRegLastName] = useState<string>('');
  const [regFullName, setRegFullName] = useState<string>('');
  const [preCheckClickCount, setPreCheckClickCount] = useState<number>(0);

  const handleFirstNameChange = (val: string) => {
    setRegFirstName(val);
    const combined = `${val.trim()} ${regLastName.trim()}`.trim();
    setRegFullName(combined);
  };

  const handleLastNameChange = (val: string) => {
    setRegLastName(val);
    const combined = `${regFirstName.trim()} ${val.trim()}`.trim();
    setRegFullName(combined);
  };
  const [regPosition, setRegPosition] = useState<string>('');
  const [regAgency, setRegAgency] = useState<string>('');
  const [regLevel, setRegLevel] = useState<ParticipantLevel>('practitioner');
  const [regProvince, setRegProvince] = useState<string>(() => getOfficialProvince(province));
  const [regDistrict, setRegDistrict] = useState<string>('');
  const [regTambon, setRegTambon] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [isSavingStep1, setIsSavingStep1] = useState<boolean>(false);
  const [step1SaveToast, setStep1SaveToast] = useState<string | null>(null);
  const [step1ClearToast, setStep1ClearToast] = useState<string | null>(null);

  // Registered participants list from SQLite (Step 1 & Step 2 live synchronization)
  const [registeredParticipantsList, setRegisteredParticipantsList] = useState<PilotAgencyRegistration[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState<boolean>(false);
  const [isDbExplorerModalOpen, setIsDbExplorerModalOpen] = useState<boolean>(false);

  const reloadParticipants = useCallback(async () => {
    setIsLoadingParticipants(true);
    try {
      const res = await fetchPilotSqliteState(province as PilotProvinceName);
      if (res && res.agencies) {
        setRegisteredParticipantsList(res.agencies);
      }
    } catch (err) {
      console.warn('Error loading participants in view:', err);
    } finally {
      setIsLoadingParticipants(false);
    }
  }, [province]);

  useEffect(() => {
    reloadParticipants();
  }, [reloadParticipants]);

  const levelCounts = useMemo(() => {
    let policy = 0;
    let practitioner = 0;
    let citizen = 0;
    for (const p of registeredParticipantsList) {
      const lvl = (p.participant_level || '').toLowerCase();
      const role = (p.participant_role || '').toLowerCase();
      if (lvl === 'policy' || role.includes('นโยบาย')) policy++;
      else if (lvl === 'citizen' || role.includes('ประชาชน')) citizen++;
      else practitioner++;
    }
    return { policy, practitioner, citizen, total: registeredParticipantsList.length };
  }, [registeredParticipantsList]);

  // Update province when user changes province in dropdown (keep district textbox clear for user input)
  const handleRegProvinceChange = (newProv: string) => {
    setRegProvince(newProv);
  };

  // Clear all Step 1 textboxes and cached participant registration back to default
  const handleClearStep1Form = () => {
    setRegFirstName('');
    setRegLastName('');
    setRegFullName('');
    setRegPosition('');
    setRegAgency('');
    setRegLevel('practitioner');
    setRegProvince(getOfficialProvince(province));
    setRegDistrict('');
    setRegTambon('');
    setRegPhone('');
    setRegEmail('');
    try {
      localStorage.removeItem('mdc_hackathon_participant_reg_v2');
      clearActiveVoter();
    } catch {}
    setStep1ClearToast('ลบข้อมูลในฟิลด์ทั้งหมด และปรับเป็นค่าเริ่มต้น (Default) เรียบร้อยแล้ว');
    setTimeout(() => setStep1ClearToast(null), 3500);
  };

  // Step 2: Dynamic Coffee Groups State & CRUD (Synced with SQLite Server)
  const [coffeeGroups, setCoffeeGroups] = useState<CoffeeGroupMeta[]>(() => getStoredCoffeeGroups());
  const [selectedGroup, setSelectedGroup] = useState<CoffeeGroupKey>(() => {
    const stored = getStoredCoffeeGroups();
    return stored[0]?.key || 'mocha';
  });

  // Fetch latest coffee groups from SQLite on mount and subscribe to changes
  useEffect(() => {
    let isMounted = true;
    fetchCoffeeGroupsFromDb().then((groups) => {
      if (isMounted && groups && groups.length > 0) {
        setCoffeeGroups(groups);
      }
    });

    const handleGroupsChanged = (e: any) => {
      if (e.detail?.groups && Array.isArray(e.detail.groups)) {
        setCoffeeGroups(e.detail.groups);
      }
    };

    window.addEventListener('coffee_groups_changed', handleGroupsChanged);
    return () => {
      isMounted = false;
      window.removeEventListener('coffee_groups_changed', handleGroupsChanged);
    };
  }, []);

  // Re-fetch latest groups whenever user enters Step 2 (Group selection)
  useEffect(() => {
    if (currentStep === 2) {
      fetchCoffeeGroupsFromDb().then((groups) => {
        if (groups && groups.length > 0) {
          setCoffeeGroups(groups);
        }
      });
    }
  }, [currentStep]);

  // Modal State for Add / Edit Coffee Group
  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);
  const [groupModalMode, setGroupModalMode] = useState<'add' | 'edit'>('add');
  const [groupToEdit, setGroupToEdit] = useState<CoffeeGroupMeta | null>(null);

  // Group Handlers
  const handleOpenAddGroup = () => {
    setGroupModalMode('add');
    setGroupToEdit(null);
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (grp: CoffeeGroupMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขกลุ่มกาแฟได้');
      return;
    }
    setGroupModalMode('edit');
    setGroupToEdit(grp);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = async (key: string, groupNameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบกลุ่มกาแฟได้');
      return;
    }
    if (coffeeGroups.length <= 1) {
      alert('ไม่สามารถลบกลุ่มได้ เนื่องจากระบบต้องมีกลุ่มกาแฟอย่างน้อย 1 กลุ่ม');
      return;
    }
    const confirmed = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${groupNameToDelete}" ออกจากฐานข้อมูล PostgreSQL (DB-MDC)?`);
    if (!confirmed) return;

    try {
      const updated = await deleteCoffeeGroupFromDb(key);
      setCoffeeGroups(updated);
      if (selectedGroup === key) {
        setSelectedGroup(updated[0]?.key || 'mocha');
      }
      if (dashboardTabGroup === key) {
        setDashboardTabGroup(updated[0]?.key || 'mocha');
      }
      setSubmitFeedback(`🗑️ ลบ "${groupNameToDelete}" จากฐานข้อมูล PostgreSQL (DB-MDC) เรียบร้อยแล้ว`);
      setTimeout(() => setSubmitFeedback(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'เกิดข้อผิดพลาดในการลบกลุ่ม');
    }
  };

  const handleSaveGroup = async (groupData: Partial<CoffeeGroupMeta>) => {
    try {
      if (groupModalMode === 'add') {
        const updated = await addCoffeeGroupToDb(groupData as any);
        setCoffeeGroups(updated);
        const newlyAdded = updated.find((g) => g.name === groupData.name) || updated[updated.length - 1];
        if (newlyAdded) {
          setSelectedGroup(newlyAdded.key);
        }
        setSubmitFeedback(`✨ เพิ่มกลุ่ม "${groupData.name}" ลงฐานข้อมูล PostgreSQL (DB-MDC) สำเร็จ (ผู้ใช้ทุกคนจะมองเห็นและเลือกกลุ่มนี้ได้ทันที)!`);
        setTimeout(() => setSubmitFeedback(null), 4500);
      } else if (groupModalMode === 'edit' && groupData.key) {
        if (!isAdmin) {
          alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขข้อมูลกลุ่มกาแฟได้');
          return;
        }
        const updated = await updateCoffeeGroupInDb(groupData.key, groupData);
        setCoffeeGroups(updated);
        setSubmitFeedback(`💾 อัปเดตข้อมูลกลุ่ม "${groupData.name}" ลงฐานข้อมูล PostgreSQL (DB-MDC) สำเร็จ!`);
        setTimeout(() => setSubmitFeedback(null), 3500);
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการบันทึกกลุ่ม: ${err?.message || err}`);
    }
  };

  const handleResetGroups = async () => {
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถรีเซ็ตกลุ่มกาแฟได้');
      return;
    }
    const confirmed = window.confirm('คุณต้องการรีเซ็ตกลุ่มกาแฟในฐานข้อมูล PostgreSQL (DB-MDC) กลับเป็นค่าเริ่มต้น 5 กลุ่ม (มอคค่า, คาปูชิโน, อเมริกาโน, เอสเพรสโซ, ลาเต้) หรือไม่?');
    if (!confirmed) return;

    try {
      const defs = await resetCoffeeGroupsInDb();
      setCoffeeGroups(defs);
      setSelectedGroup(defs[0]?.key || 'mocha');
      setDashboardTabGroup(defs[0]?.key || 'mocha');
      setSubmitFeedback('↺ รีเซ็ตกลุ่มกาแฟในฐานข้อมูล PostgreSQL (DB-MDC) กลับเป็นค่าเริ่มต้น 5 กลุ่มเรียบร้อยแล้ว');
      setTimeout(() => setSubmitFeedback(null), 3500);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการรีเซ็ตกลุ่ม: ${err?.message || err}`);
    }
  };

  // Step 3: Weakness virtues state (Default from research: Ayutthaya = พอเพียง & สุจริต, or lowest scores)
  const defaultStep3Weaknesses = useMemo(() => {
    if (province === 'อยุธยา' || province === 'ระยอง') {
      return ['พอเพียง', 'สุจริต'];
    }
    if (research.weaknessVirtues && research.weaknessVirtues.length > 0) {
      return research.weaknessVirtues;
    }
    if (research.powers && research.powers.length > 0) {
      const sorted = [...research.powers].sort((a, b) => a.score - b.score);
      return [sorted[0].name];
    }
    return [research.weaknessVirtue || 'พอเพียง'];
  }, [province, research.weaknessVirtues, research.weaknessVirtue, research.powers]);

  const [selectedWeaknessVirtues, setSelectedWeaknessVirtues] = useState<string[]>(() => defaultStep3Weaknesses);

  useEffect(() => {
    setSelectedWeaknessVirtues(defaultStep3Weaknesses);
  }, [defaultStep3Weaknesses]);

  // Handle clicking / toggling a weakness card in Step 3
  const handleToggleStep3Weakness = (virtueName: string) => {
    setSelectedWeaknessVirtues((prev) => {
      let updated: string[];
      if (prev.includes(virtueName)) {
        if (prev.length <= 1) {
          alert('ต้องมีคุณธรรมจุดอ่อนอย่างน้อย 1 ด้าน');
          return prev;
        }
        updated = prev.filter((v) => v !== virtueName);
      } else {
        updated = [...prev, virtueName];
      }
      return updated;
    });
  };

  // Step 4: Hackathon Form, Challenge & AI Ideation State
  const defaultChallenge = useMemo(() => {
    if (province === 'อยุธยา' || province === 'ระยอง') {
      return 'ให้คิดโครงการที่สามารถช่วยแก้ปัญหาจุดอ่อนด้าน ความพอเพียง และ สุจริต ของพื้นที่ได้อย่างมีประสิทธิภาพ';
    }
    const weak = selectedWeaknessVirtues.length > 0
      ? selectedWeaknessVirtues.join(' และ ')
      : (research.weaknessVirtue || 'สุจริต');
    return `ให้คิดโครงการที่สามารถช่วยแก้ปัญหาและส่งเสริมพฤติกรรมคุณธรรมด้าน ${weak.replace(/^ความ/, '')} ในชุมชนอย่างตรงจุด`;
  }, [selectedWeaknessVirtues, research.weaknessVirtue, province]);

    // บันทึกจังหวัดต้นทางของโจทย์ปัญหาที่เลือก (เช่น นครราชสีมา เมื่อเลือกโจทย์จากคลังปัญหา 77 จังหวัด)
  const [challengeOriginProvince, setChallengeOriginProvince] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`pilot_challenge_origin_${province}`) || province || 'อยุธยา';
    }
    return province || 'อยุธยา';
  });

  const [hackathonChallenge, setHackathonChallenge] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`pilot_active_challenge_${province}`);
      if (saved) return saved;
    }
    return defaultChallenge;
  });
  const [selectedCriteriaVirtues, setSelectedCriteriaVirtues] = useState<string[]>(() => defaultStep3Weaknesses);
  const [criteriaSaveFeedback, setCriteriaSaveFeedback] = useState<string | null>(null);

  // Step 3: Provincial Challenge Selector Active Tab (รองรับครบทั้ง 77 จังหวัด)
  const [selectedChallengeTabProvince, setSelectedChallengeTabProvince] = useState<string>(() => {
    return province || 'พระนครศรีอยุธยา';
  });
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [provinceSearchQuery, setProvinceSearchQuery] = useState<string>('');

  // Keep tab in sync if province prop changes
  useEffect(() => {
    if (province) {
      setSelectedChallengeTabProvince(province);
    }
  }, [province]);

  const [challengeSelectFeedback, setChallengeSelectFeedback] = useState<string | null>(null);

  const normalizeVirtueName = (v: string): string => {
    if (!v) return 'พอเพียง';
    if (v.includes('วินัย')) return 'วินัย';
    if (v.includes('พอเพียง')) return 'พอเพียง';
    if (v.includes('สุจริต')) return 'สุจริต';
    if (v.includes('จิตอาสา')) return 'จิตอาสา';
    if (v.includes('กตัญญู')) return 'กตัญญู';
    return v;
  };

  const parseVirtuesFromCoreVirtue = useCallback((coreVirtueStr: string): string[] => {
    if (!coreVirtueStr) return [];
    const tokens = coreVirtueStr.split(/[\/,และ+&]/).map((s) => s.trim()).filter(Boolean);
    const result: string[] = [];
    for (const token of tokens) {
      const norm = normalizeVirtueName(token);
      if (norm && !result.includes(norm)) {
        result.push(norm);
      }
    }
    return result;
  }, []);

  // Check if current hackathonChallenge matches any challenge in the provincial repository
  const currentMatchingChallenge = useMemo(() => {
    if (!hackathonChallenge) return null;
    const cleanChallenge = hackathonChallenge.trim();
    if (!cleanChallenge) return null;
    for (const pProfile of Object.values(PROVINCIAL_CHALLENGES_PROFILES)) {
      if (pProfile) {
        for (const ch of pProfile.challenges) {
          const chClean = ch.suggestedChallenge.trim();
          const titleClean = ch.title.trim();
          const formattedTopic = formatChallengeTopicFromProblemTitle(titleClean);
          if (
            formattedTopic === cleanChallenge ||
            titleClean === cleanChallenge ||
            chClean === cleanChallenge ||
            cleanChallenge === formattedTopic ||
            (cleanChallenge.length >= 10 && cleanChallenge.includes(titleClean)) ||
            (cleanChallenge.length >= 10 && formattedTopic.includes(cleanChallenge)) ||
            (cleanChallenge.length >= 15 && chClean.includes(cleanChallenge)) ||
            (cleanChallenge.length >= 15 && cleanChallenge.includes(chClean))
          ) {
            return ch;
          }
        }
      }
    }
    return null;
  }, [hackathonChallenge]);

  const handleSelectProvincialChallenge = (item: ProvincialChallengeItem) => {
    // นำชื่อปัญหาในคลังปัญหามาใส่ในโจทย์ความท้าทายกิจกรรม เป็นชื่อเดียวกันกับชื่อ Card แต่เติม "ให้คิดโครงการแก้ปัญหา..." ไว้ด้านหน้า
    const formattedChallenge = formatChallengeTopicFromProblemTitle(item.title);

    const targetProv = selectedChallengeTabProvince || detectProvinceFromText([item.title, item.suggestedChallenge], province);
    setChallengeOriginProvince(targetProv);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`pilot_challenge_origin_${province}`, targetProv);
    }
    setHackathonChallenge(formattedChallenge);

    // รีเซ็ตประวัติ Temp File ย้อนหลังและรอบการตรวจเมื่อเปลี่ยนโจทย์ความท้าทายใหม่
    clearTempEvaluationHistory(province);
    setPreCheckClickCount(0);
    setPreCheckResult(null);

    // Automatically update evaluation criteria (เกณฑ์ตัดสินคุณธรรม) based on the chosen problem
    const matchedVirtues = parseVirtuesFromCoreVirtue(item.coreVirtue);
    if (matchedVirtues.length > 0) {
      setSelectedCriteriaVirtues(matchedVirtues);
      setPropTargetVirtue(matchedVirtues[0]);
      saveSelectedCriteriaVirtues(province, matchedVirtues, research.weaknessVirtue);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`pilot_active_challenge_${province}`, formattedChallenge);
        localStorage.setItem(`pilot_criteria_virtues_${province}`, JSON.stringify(matchedVirtues));
        localStorage.setItem(`pilot_criteria_virtues_explicit_${province}`, 'true');
        localStorage.setItem(`pilot_criteria_source_challenge_${province}`, formattedChallenge);
      }
    }

    setChallengeSelectFeedback(
      `✨ เลือกโจทย์: "${item.title}" พร้อมนำไปตั้งเป็นโจทย์ความท้าทายเรียบร้อย`
    );
    setTimeout(() => {
      setChallengeSelectFeedback(null);
    }, 4500);

    const inputElem = document.getElementById('hackathon-challenge-admin-input');
    if (inputElem) {
      inputElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputElem.focus();
    }
  };

  // Automatically sync criteria virtues whenever currentMatchingChallenge changes
  useEffect(() => {
    if (currentMatchingChallenge) {
      const matchedVirtues = parseVirtuesFromCoreVirtue(currentMatchingChallenge.coreVirtue);
      if (matchedVirtues.length > 0) {
        setSelectedCriteriaVirtues(matchedVirtues);
        setPropTargetVirtue(matchedVirtues[0]);
        if (typeof window !== 'undefined') {
          const activeChal = hackathonChallenge || formatChallengeTopicFromProblemTitle(currentMatchingChallenge.title);
          localStorage.setItem(`pilot_active_challenge_${province}`, activeChal);
          localStorage.setItem(`pilot_criteria_virtues_${province}`, JSON.stringify(matchedVirtues));
          localStorage.setItem(`pilot_criteria_virtues_explicit_${province}`, 'true');
          localStorage.setItem(`pilot_criteria_source_challenge_${province}`, activeChal);
        }
        saveSelectedCriteriaVirtues(province, matchedVirtues, research.weaknessVirtue);
      }
    }
  }, [currentMatchingChallenge, province, research.weaknessVirtue, parseVirtuesFromCoreVirtue, hackathonChallenge]);

  // Synchronize Step 4 criteria and form target virtue to match Step 3 weak virtues or active repository challenge
  const syncStep4DefaultsFromStep3 = (weakVirtues: string[]) => {
    if (currentMatchingChallenge) {
      const matchedVirtues = parseVirtuesFromCoreVirtue(currentMatchingChallenge.coreVirtue);
      if (matchedVirtues.length > 0) {
        setSelectedCriteriaVirtues(matchedVirtues);
        const primaryVirtue = matchedVirtues[0] || 'พอเพียง';
        if (!propTargetVirtue || !matchedVirtues.includes(normalizeVirtueName(propTargetVirtue))) {
          setPropTargetVirtue(primaryVirtue);
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem(`pilot_criteria_virtues_${province}`, JSON.stringify(matchedVirtues));
        }
        saveSelectedCriteriaVirtues(province, matchedVirtues, research.weaknessVirtue);
        return;
      }
    }
    const rawVirtues = weakVirtues.length > 0 ? weakVirtues : defaultStep3Weaknesses;
    const safeVirtues = rawVirtues.map(normalizeVirtueName);
    setSelectedCriteriaVirtues(safeVirtues);
    const primaryVirtue = safeVirtues[0] || 'พอเพียง';
    if (!propTargetVirtue || !safeVirtues.includes(normalizeVirtueName(propTargetVirtue))) {
      setPropTargetVirtue(primaryVirtue);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(`pilot_criteria_virtues_${province}`, JSON.stringify(safeVirtues));
    }
    saveSelectedCriteriaVirtues(province, safeVirtues, research.weaknessVirtue);
  };

  // Sync criteria virtues from SQLite database when province changes
  useEffect(() => {
    let isMounted = true;
    const defaultVirtues = defaultStep3Weaknesses.map(normalizeVirtueName);

    fetchSelectedCriteriaVirtues(province, research.weaknessVirtue).then((virtues) => {
      if (isMounted) {
        if (currentMatchingChallenge) {
          const matched = parseVirtuesFromCoreVirtue(currentMatchingChallenge.coreVirtue);
          if (matched.length > 0) {
            setSelectedCriteriaVirtues(matched);
            return;
          }
        }
        // If there's explicit manual selection saved, use it; otherwise default to only the weak virtue(s)
        const hasManualSaved = typeof window !== 'undefined' && localStorage.getItem(`pilot_criteria_virtues_explicit_${province}`) === 'true';
        if (hasManualSaved && virtues && virtues.length > 0) {
          if ((province === 'อยุธยา' || province === 'ระยอง') && virtues.length === 1 && virtues[0] === 'พอเพียง') {
            setSelectedCriteriaVirtues(['พอเพียง', 'สุจริต']);
          } else {
            setSelectedCriteriaVirtues(virtues.map(normalizeVirtueName));
          }
        } else {
          setSelectedCriteriaVirtues(defaultVirtues);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [province, research.weaknessVirtue, defaultStep3Weaknesses, currentMatchingChallenge, parseVirtuesFromCoreVirtue]);

  // When Step 3 weaknesses update, keep Step 4 criteria default synchronized (only if not customized by challenge)
  useEffect(() => {
    if (currentMatchingChallenge) return;
    const norm = selectedWeaknessVirtues.map(normalizeVirtueName);
    setSelectedCriteriaVirtues(norm);
    if (!propTargetVirtue || !norm.includes(normalizeVirtueName(propTargetVirtue))) {
      setPropTargetVirtue(norm[0] || 'พอเพียง');
    }
  }, [selectedWeaknessVirtues, currentMatchingChallenge]);

  // Sync default challenge when province changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChallenge = localStorage.getItem(`pilot_active_challenge_${province}`);
      if (savedChallenge) {
        setHackathonChallenge(savedChallenge);
        return;
      }
    }
    if (!currentMatchingChallenge) {
      setHackathonChallenge(defaultChallenge);
    }
  }, [province, defaultChallenge]);

  const handleToggleCriteriaVirtue = (virtueName: string) => {
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเลือกหรือปรับเปลี่ยนเกณฑ์การตัดสินได้');
      return;
    }
    setSelectedCriteriaVirtues((prev) => {
      let updated: string[];
      if (prev.includes(virtueName)) {
        if (prev.length <= 1) {
          alert('ต้องเลือกเกณฑ์ดัชนีคุณธรรมอย่างน้อย 1 ด้านสำหรับการตัดสินโครงการ');
          return prev;
        }
        updated = prev.filter((v) => v !== virtueName);
      } else {
        updated = [...prev, virtueName];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(`pilot_criteria_virtues_explicit_${province}`, 'true');
      }
      saveSelectedCriteriaVirtues(province, updated, research.weaknessVirtue).then(() => {
        setCriteriaSaveFeedback('✓ ปรับปรุงเกณฑ์ดัชนีเรียบร้อย (Admin)');
        setTimeout(() => setCriteriaSaveFeedback(null), 3500);
      });
      return updated;
    });
  };

  const handleSelectAllCriteriaVirtues = () => {
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเลือกเกณฑ์การตัดสินได้');
      return;
    }
    const all = ['พอเพียง', 'วินัย', 'สุจริต', 'จิตอาสา', 'กตัญญู'];
    setSelectedCriteriaVirtues(all);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`pilot_criteria_virtues_explicit_${province}`, 'true');
    }
    saveSelectedCriteriaVirtues(province, all, research.weaknessVirtue).then(() => {
      setCriteriaSaveFeedback('✓ เลือกทั้ง 5 ดัชนีเรียบร้อย (Admin)');
      setTimeout(() => setCriteriaSaveFeedback(null), 3500);
    });
  };

  const handleSelectWeaknessOnly = () => {
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเลือกเกณฑ์การตัดสินได้');
      return;
    }
    const weaknessList = (selectedWeaknessVirtues.length > 0 ? selectedWeaknessVirtues : defaultStep3Weaknesses).map(normalizeVirtueName);

    setSelectedCriteriaVirtues(weaknessList);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`pilot_criteria_virtues_explicit_${province}`, 'true');
    }
    saveSelectedCriteriaVirtues(province, weaknessList, research.weaknessVirtue).then(() => {
      setCriteriaSaveFeedback(`✓ ตั้งค่าเกณฑ์เริ่มต้น: จุดอ่อน (${weaknessList.join(' และ ')}) (Admin)`);
      setTimeout(() => setCriteriaSaveFeedback(null), 3500);
    });
  };

    const [aiPromptInput, setAiPromptInput] = useState<string>('');

  // คำนวณจังหวัดเป้าหมายที่แท้จริงของปัญหา โดยสืบหาจากข้อความโจทย์, จังหวัดที่เลือกในคลัง 77 จังหวัด หรือ Prompt
  const effectiveProvince = useMemo(() => {
    return detectProvinceFromText(
      [
        hackathonChallenge,
        challengeOriginProvince,
        aiPromptInput,
        selectedChallengeTabProvince
      ],
      province || 'อยุธยา'
    );
  }, [hackathonChallenge, challengeOriginProvince, aiPromptInput, selectedChallengeTabProvince, province]);
  const [aiIdeationCount, setAiIdeationCount] = useState<number>(0);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Helper functions and interface for Step 4 Session Auto-Save Draft
  interface Step4DraftData {
    projectName: string;
    targetVirtue: string;
    targetAudience: string;
    targetArea: string;
    proposalDetails: string;
    activityPlan: string;
    behavioralKpi: string;
    lastAiGeneratedSnapshot?: {
      projectName: string;
      proposalDetails: string;
      activityPlan: string;
      behavioralKpi: string;
    } | null;
    savedAt: string;
  }

  const getStep4DraftStorageKey = (prov: string, first: string, last: string) => {
    const cleanFirst = (first || '').trim().toLowerCase();
    const cleanLast = (last || '').trim().toLowerCase();
    const userTag = (cleanFirst || cleanLast) ? `${cleanFirst}_${cleanLast}` : 'default';
    return `mdc_step4_draft_${prov || 'อยุธยา'}_${userTag}`;
  };

  const loadStep4Draft = (prov: string, first: string, last: string): Step4DraftData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const key = getStep4DraftStorageKey(prov, first, last);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Error reading step 4 draft:', err);
      return null;
    }
  };

  const saveStep4Draft = (prov: string, first: string, last: string, data: Omit<Step4DraftData, 'savedAt'>) => {
    if (typeof window === 'undefined') return;
    try {
      const key = getStep4DraftStorageKey(prov, first, last);
      const payload: Step4DraftData = {
        ...data,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (err) {
      console.warn('Error saving step 4 draft:', err);
    }
  };

  const clearStep4Draft = (prov: string, first: string, last: string) => {
    if (typeof window === 'undefined') return;
    try {
      const key = getStep4DraftStorageKey(prov, first, last);
      localStorage.removeItem(key);
    } catch (err) {
      console.warn('Error clearing step 4 draft:', err);
    }
  };

  // ส่วนที่ 2: ฟอร์มใส่ข้อมูลโครงการที่ต้องการนำเสนอ - เริ่มต้นคุณธรรมเป้าหมายให้เลือกตัวที่อ่อนเป็น default (กู้คืนจากแบบร่างอัตโนมัติถ้ามี)
  const initialStep4Draft = useMemo(() => {
    return loadStep4Draft(province, regFirstName, regLastName) || loadStep4Draft(province, '', '');
  }, [province]);

  const [propProjectName, setPropProjectName] = useState<string>(() => initialStep4Draft?.projectName || '');
  const [propTargetVirtue, setPropTargetVirtue] = useState<string>(() => initialStep4Draft?.targetVirtue || research.weaknessVirtue || 'พอเพียง');
  const [propTargetAudience, setPropTargetAudience] = useState<string>(() => initialStep4Draft?.targetAudience || '');
  const [propTargetArea, setPropTargetArea] = useState<string>(() => initialStep4Draft?.targetArea || '');
  const [propProposalDetails, setPropProposalDetails] = useState<string>(() => initialStep4Draft?.proposalDetails || '');
  const [propActivityPlan, setPropActivityPlan] = useState<string>(() => initialStep4Draft?.activityPlan || '');
  const [propBehavioralKpi, setPropBehavioralKpi] = useState<string>(() => initialStep4Draft?.behavioralKpi || '');
  const [step4AutoSavedTime, setStep4AutoSavedTime] = useState<string | null>(() => {
    if (initialStep4Draft?.savedAt) {
      const d = new Date(initialStep4Draft.savedAt);
      return !isNaN(d.getTime()) ? d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null;
    }
    return null;
  });

  // Sync propTargetVirtue when province / weakness changes
  useEffect(() => {
    if (!propTargetVirtue) {
      setPropTargetVirtue(research.weaknessVirtue || 'พอเพียง');
    }
  }, [research.weaknessVirtue]);

  // Title Generation State for Section 2 (ระบบ AI ช่วยคิดชื่อโครงการ)
  const [isGeneratingTitle, setIsGeneratingTitle] = useState<boolean>(false);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [titleCycleIndex, setTitleCycleIndex] = useState<number>(0);

  // Snapshot ของข้อเสนอฉบับร่างที่ระบบ AI ช่วยคิด เพื่อใช้ตรวจจับว่าผู้ใช้มีการแก้ไขปรับปรุงเนื้อหาด้วยมนุษย์หรือไม่
  const [lastAiGeneratedSnapshot, setLastAiGeneratedSnapshot] = useState<{
    projectName: string;
    proposalDetails: string;
    activityPlan: string;
    behavioralKpi: string;
  } | null>(() => {
    if (initialStep4Draft?.lastAiGeneratedSnapshot) {
      return initialStep4Draft.lastAiGeneratedSnapshot;
    }
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('last_ai_generated_snapshot');
        return saved ? JSON.parse(saved) : null;
      } catch {}
    }
    return null;
  });

  const aiDraftSnapshotRef = useRef<{
    projectName: string;
    proposalDetails: string;
    activityPlan: string;
    behavioralKpi: string;
  } | null>(lastAiGeneratedSnapshot);

  const saveAiSnapshot = (snapshot: { projectName: string; proposalDetails: string; activityPlan: string; behavioralKpi: string } | null) => {
    aiDraftSnapshotRef.current = snapshot;
    setLastAiGeneratedSnapshot(snapshot);
    if (typeof window !== 'undefined') {
      try {
        if (snapshot) {
          sessionStorage.setItem('last_ai_generated_snapshot', JSON.stringify(snapshot));
        } else {
          sessionStorage.removeItem('last_ai_generated_snapshot');
        }
      } catch {}
    }
  };

  // User/Province change: restore Step 4 draft for the current participant
  const prevUserDraftRef = useRef<string>(`${province}_${regFirstName}_${regLastName}`);
  useEffect(() => {
    const userTag = `${province}_${(regFirstName || '').trim()}_${(regLastName || '').trim()}`;
    if (prevUserDraftRef.current === userTag) return;
    prevUserDraftRef.current = userTag;

    let draft = loadStep4Draft(province, regFirstName, regLastName);
    // If specific user has no draft yet, migrate unassigned default draft if present
    if (!draft && (regFirstName.trim() || regLastName.trim())) {
      const defaultDraft = loadStep4Draft(province, '', '');
      if (defaultDraft && (
        defaultDraft.projectName ||
        defaultDraft.proposalDetails ||
        defaultDraft.activityPlan ||
        defaultDraft.behavioralKpi
      )) {
        draft = defaultDraft;
        saveStep4Draft(province, regFirstName, regLastName, defaultDraft);
        clearStep4Draft(province, '', '');
      }
    }

    if (draft) {
      if (typeof draft.projectName === 'string') setPropProjectName(draft.projectName);
      if (typeof draft.targetVirtue === 'string') setPropTargetVirtue(draft.targetVirtue);
      if (typeof draft.targetAudience === 'string') setPropTargetAudience(draft.targetAudience);
      if (typeof draft.targetArea === 'string') setPropTargetArea(draft.targetArea);
      if (typeof draft.proposalDetails === 'string') setPropProposalDetails(draft.proposalDetails);
      if (typeof draft.activityPlan === 'string') setPropActivityPlan(draft.activityPlan);
      if (typeof draft.behavioralKpi === 'string') setPropBehavioralKpi(draft.behavioralKpi);
      if (draft.lastAiGeneratedSnapshot !== undefined) {
        saveAiSnapshot(draft.lastAiGeneratedSnapshot);
      }
      if (draft.savedAt) {
        const d = new Date(draft.savedAt);
        if (!isNaN(d.getTime())) {
          setStep4AutoSavedTime(d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } else {
      setPropProjectName('');
      setPropTargetVirtue(selectedWeaknessVirtues[0] || 'พอเพียง');
      setPropTargetAudience('');
      setPropTargetArea('');
      setPropProposalDetails('');
      setPropActivityPlan('');
      setPropBehavioralKpi('');
      saveAiSnapshot(null);
      setStep4AutoSavedTime(null);
    }
  }, [province, regFirstName, regLastName, selectedWeaknessVirtues]);

  // Auto-Save Step 4 Form on change (Debounce 300ms)
  const isStep4InitialMount = useRef(true);
  useEffect(() => {
    if (isStep4InitialMount.current) {
      isStep4InitialMount.current = false;
      return;
    }

    const hasAnyContent = Boolean(
      propProjectName.trim() ||
      propTargetAudience.trim() ||
      propTargetArea.trim() ||
      propProposalDetails.trim() ||
      propActivityPlan.trim() ||
      propBehavioralKpi.trim()
    );

    if (!hasAnyContent) return;

    const timer = setTimeout(() => {
      saveStep4Draft(province, regFirstName, regLastName, {
        projectName: propProjectName,
        targetVirtue: propTargetVirtue,
        targetAudience: propTargetAudience,
        targetArea: propTargetArea,
        proposalDetails: propProposalDetails,
        activityPlan: propActivityPlan,
        behavioralKpi: propBehavioralKpi,
        lastAiGeneratedSnapshot
      });
      const now = new Date();
      setStep4AutoSavedTime(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 300);

    return () => clearTimeout(timer);
  }, [
    province,
    regFirstName,
    regLastName,
    propProjectName,
    propTargetVirtue,
    propTargetAudience,
    propTargetArea,
    propProposalDetails,
    propActivityPlan,
    propBehavioralKpi,
    lastAiGeneratedSnapshot
  ]);

  // เมื่อเริ่มต้น หรือเมื่อสลับจังหวัด ยังไม่มีปุ่มชื่อโครงการแนะนำ จนกว่าจะกดปุ่มให้ AI ช่วยคิดหัวข้อโครงการในส่วนที่สอง
  useEffect(() => {
    setSuggestedTitles([]);
  }, [province]);

  // Handle Generate/Rotate Project Title Only
  const handleGenerateProjectTitleOnly = () => {
    setIsGeneratingTitle(true);
    const nextIndex = titleCycleIndex + 1;
    setTitleCycleIndex(nextIndex);

    setTimeout(() => {
      const virtue = propTargetVirtue || selectedWeaknessVirtues[0] || 'พอเพียง';
      // คิดชื่อโครงการจากบริบทของโครงการในส่วนที่ 2 (proposalDetails, targetAudience, targetArea, challenge) ห้าม copy prompt ส่วนที่ 1
      const section2Context = aiPromptInput || propProjectName || propProposalDetails || propTargetAudience || propTargetArea || hackathonChallenge || '';
      const titles = suggestCreativeProjectTitles(
        effectiveProvince,
        virtue,
        section2Context,
        aiPromptInput || hackathonChallenge
      ).map(stripProvinceFromProjectTitle);
      setSuggestedTitles(titles);
      const pickedTitle = titles[nextIndex % titles.length] || titles[0];
      setPropProjectName(pickedTitle);
      const updatedSnap = lastAiGeneratedSnapshot ? { ...lastAiGeneratedSnapshot, projectName: pickedTitle } : null;
      if (lastAiGeneratedSnapshot) {
        saveAiSnapshot(updatedSnap);
      }
      saveStep4Draft(province, regFirstName, regLastName, {
        projectName: pickedTitle,
        targetVirtue: propTargetVirtue,
        targetAudience: propTargetAudience,
        targetArea: propTargetArea,
        proposalDetails: propProposalDetails,
        activityPlan: propActivityPlan,
        behavioralKpi: propBehavioralKpi,
        lastAiGeneratedSnapshot: updatedSnap
      });
      const nowTitle = new Date();
      setStep4AutoSavedTime(nowTitle.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSubmitFeedback(`✨ AI ได้คิดชื่อโครงการเท่ ๆ เฉพาะทางจากบริบทในส่วนที่ 2 ให้ใหม่: "${pickedTitle}"`);
      setTimeout(() => setSubmitFeedback(null), 4000);
      setIsGeneratingTitle(false);
    }, 600);
  };

  // ฟังก์ชันล้างข้อมูลฟอร์มส่วนที่ 2 ให้กลับเป็นค่าว่างเริ่มต้น (คุณธรรมเป้าหมายกลับเป็นจุดอ่อน default)
  const handleClearSection2Form = (skipConfirm: boolean = false) => {
    if (!skipConfirm) {
      const confirmClear = window.confirm('คุณต้องการล้างข้อมูลโครงการที่กรอกไว้ทั้งหมดใช่หรือไม่? (แบบร่างที่บันทึกไว้ในระบบจะถูกลบออก)');
      if (!confirmClear) return;
    }

    setPropProjectName('');
    setPropTargetVirtue(selectedWeaknessVirtues[0] || 'พอเพียง');
    setPropTargetAudience('');
    setPropTargetArea('');
    setPropProposalDetails('');
    setPropActivityPlan('');
    setPropBehavioralKpi('');
    setPreCheckClickCount(0);
    setPreCheckResult(null);
    setSuggestedTitles([]);
    setSuggestedBehaviorStrategies([]);
    saveAiSnapshot(null);
    clearStep4Draft(province, regFirstName, regLastName);
    setStep4AutoSavedTime(null);
  };

  // Step 4: Behavior Modification Strategy AI Generator State
  const [isGeneratingBehaviorStrategy, setIsGeneratingBehaviorStrategy] = useState<boolean>(false);
  const [suggestedBehaviorStrategies, setSuggestedBehaviorStrategies] = useState<string[]>([]);
  const [strategyCycleIndex, setStrategyCycleIndex] = useState<number>(0);

  const handleAiGenerateBehaviorStrategy = () => {
    setIsGeneratingBehaviorStrategy(true);
    const nextCycle = strategyCycleIndex + 1;
    setStrategyCycleIndex(nextCycle);

    setTimeout(() => {
      const virtue = propTargetVirtue || selectedWeaknessVirtues[0] || 'พอเพียง';
      const promptSource = aiPromptInput || propProjectName || propProposalDetails || hackathonChallenge || '';
      const generated = generateBehaviorModificationStrategy({
        projectName: propProjectName,
        virtue,
        province: effectiveProvince,
        targetAudience: propTargetAudience,
        targetArea: propTargetArea,
        challengeTopic: aiPromptInput || hackathonChallenge,
        userPromptOrKeyword: promptSource,
        seedIndex: nextCycle
      });

      const alternatives = suggestAlternativeBehaviorStrategies({
        projectName: propProjectName,
        virtue,
        province: effectiveProvince,
        targetAudience: propTargetAudience,
        targetArea: propTargetArea,
        challengeTopic: aiPromptInput || hackathonChallenge,
        userPromptOrKeyword: promptSource
      });

      setPropProposalDetails(generated);
      const updatedStratSnap = {
        projectName: propProjectName,
        proposalDetails: generated,
        activityPlan: propActivityPlan,
        behavioralKpi: propBehavioralKpi
      };
      saveAiSnapshot(updatedStratSnap);
      saveStep4Draft(province, regFirstName, regLastName, {
        projectName: propProjectName,
        targetVirtue: propTargetVirtue,
        targetAudience: propTargetAudience,
        targetArea: propTargetArea,
        proposalDetails: generated,
        activityPlan: propActivityPlan,
        behavioralKpi: propBehavioralKpi,
        lastAiGeneratedSnapshot: updatedStratSnap
      });
      const nowStrat = new Date();
      setStep4AutoSavedTime(nowStrat.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSuggestedBehaviorStrategies(alternatives);
      setSubmitFeedback('✨ AI ได้คิดแนวคิดและกลยุทธ์ปรับเปลี่ยนพฤติกรรมที่สอดคล้องกับชื่อโครงการและ Prompt ให้เรียบร้อยแล้ว!');
      setTimeout(() => setSubmitFeedback(null), 4000);
      setIsGeneratingBehaviorStrategy(false);
    }, 250);
  };

  // Step 4: Database Tables Explorer State (SQLite PostgreSQL 16 (DB-MDC) & Connected Databases)
  const [isDbExplorerOpen, setIsDbExplorerOpen] = useState<boolean>(false);
  const [activeDbCategory, setActiveDbCategory] = useState<DbTableCategoryKey>('all');
  const [dbTables, setDbTables] = useState<SqliteTableMeta[]>([]);
  const [selectedDbTable, setSelectedDbTable] = useState<string>('pilot_hackathon_projects');
  const [selectedTableData, setSelectedTableData] = useState<SqliteTableDataResponse | null>(null);
  const [isLoadingDbTables, setIsLoadingDbTables] = useState<boolean>(false);
  const [isLoadingTableData, setIsLoadingTableData] = useState<boolean>(false);
  const [dbTableSearchQuery, setDbTableSearchQuery] = useState<string>('');

  const filteredDbTables = useMemo(() => {
    if (activeDbCategory === 'all') return dbTables;
    return dbTables.filter((t) => t.category === activeDbCategory);
  }, [dbTables, activeDbCategory]);

  const currentTableMeta = useMemo(() => {
    return dbTables.find((t) => t.name === selectedDbTable);
  }, [dbTables, selectedDbTable]);

  const handleOpenDbExplorer = async () => {
    setIsDbExplorerOpen(true);
    setIsLoadingDbTables(true);
    try {
      const res = await fetchSqliteDbTables();
      if (res.tables && res.tables.length > 0) {
        setDbTables(res.tables);
        const preferred =
          res.tables.find((t) => t.name === selectedDbTable) ||
          res.tables.find((t) => t.name === 'pilot_hackathon_projects') ||
          res.tables[0];
        setSelectedDbTable(preferred.name);
        handleLoadTableData(preferred.name);
      }
    } catch (err) {
      console.warn('Error loading SQLite tables:', err);
    } finally {
      setIsLoadingDbTables(false);
    }
  };

  const handleSelectCategory = (catKey: DbTableCategoryKey) => {
    setActiveDbCategory(catKey);
    const matching = catKey === 'all' ? dbTables : dbTables.filter((t) => t.category === catKey);
    if (matching.length > 0 && !matching.some((t) => t.name === selectedDbTable)) {
      handleLoadTableData(matching[0].name);
    }
  };

  const handleLoadTableData = async (tableName: string) => {
    setSelectedDbTable(tableName);
    setIsLoadingTableData(true);
    setDbTableSearchQuery('');
    try {
      const data = await fetchSqliteTableData(tableName);
      setSelectedTableData(data);
    } catch (err) {
      console.warn(`Error loading table data for ${tableName}:`, err);
    } finally {
      setIsLoadingTableData(false);
    }
  };

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers size={15} />;
      case 'FolderKanban':
        return <FolderKanban size={15} />;
      case 'Activity':
        return <Activity size={15} />;
      case 'Network':
        return <Network size={15} />;
      case 'LineChart':
        return <LineChart size={15} />;
      case 'Sprout':
        return <Sprout size={15} />;
      case 'Coins':
        return <Coins size={15} />;
      case 'GraduationCap':
        return <GraduationCap size={15} />;
      default:
        return <Database size={15} />;
    }
  };

  // Step 5: Group Projects Dashboard State (เริ่มต้นแสดงเฉพาะโครงการที่เสนอเข้ามาจริง)
  const [dashboardTabGroup, setDashboardTabGroup] = useState<CoffeeGroupKey>('mocha');
  const [allProjects, setAllProjects] = useState<HackathonProject[]>(() => getUserSubmittedProjects(province));
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  // Criteria Generator & Viewer Modals State (Step 4 Hackathon)
  const [isCriteriaGeneratorOpen, setIsCriteriaGeneratorOpen] = useState<boolean>(false);
  const [isCriteriaViewerOpen, setIsCriteriaViewerOpen] = useState<boolean>(false);

  // Pre-Submission Evaluation Modal State
  const [isPreCheckModalOpen, setIsPreCheckModalOpen] = useState<boolean>(false);
  const [isPreChecking, setIsPreChecking] = useState<boolean>(false);
  const [preCheckResult, setPreCheckResult] = useState<PreSubmissionEvaluationResult | null>(null);
  const [latestCriteriaRecord, setLatestCriteriaRecord] = useState<PilotHackathonCriteriaRecord | null>(null);

  // OpenRouter Config Change Listener
  const [apiKeyRefreshKey, setApiKeyRefreshKey] = useState<number>(0);

  useEffect(() => {
    const onCfgChanged = () => setApiKeyRefreshKey(k => k + 1);
    window.addEventListener('openrouter_config_changed', onCfgChanged);
    return () => window.removeEventListener('openrouter_config_changed', onCfgChanged);
  }, []);

  // Post-Submission Score Modal & Summary View Mode State
  const [isPostSubmitModalOpen, setIsPostSubmitModalOpen] = useState<boolean>(false);
  const [lastSubmittedProject, setLastSubmittedProject] = useState<HackathonProject | null>(null);
  const [dashboardViewMode, setDashboardViewMode] = useState<'submitted_only' | 'group_tabs'>('group_tabs');
  const [selectedDetailProject, setSelectedDetailProject] = useState<HackathonProject | null>(null);
  const [scoreboardFilterTab, setScoreboardFilterTab] = useState<string>('all');

  // Comparative Benchmark Anchors Context (โครงการที่ 1, 2, 3+)
  const [benchmarkContext, setBenchmarkContext] = useState<ComparativeEvaluationContext>(() =>
    getComparativeBenchmarkAnchors(province)
  );

  // Admin Authentication & User Profile State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const p = getCurrentUserProfile();
    return Boolean(p.isAdmin && p.role === 'admin' && isAdminAuthenticated());
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getCurrentUserProfile());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isAccountLoggedIn());
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const profileBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminUsernameInput, setAdminUsernameInput] = useState<string>('');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminAuthFeedback, setAdminAuthFeedback] = useState<string | null>(null);

  // Admin AI Ideation Prompt & Output Inspector State (แสดงเฉพาะ Account Admin ที่เข้าสู่ระบบแล้ว)
  const [lastAiIdeationPayload, setLastAiIdeationPayload] = useState<AiIdeationResultWithPayload | null>(null);
  const [isAdminPromptInlineExpanded, setIsAdminPromptInlineExpanded] = useState<boolean>(false);
  const [isAdminPromptModalOpen, setIsAdminPromptModalOpen] = useState<boolean>(false);
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);

  const handleCopyText = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedPromptKey(key);
      setTimeout(() => setCopiedPromptKey(null), 2500);
    }
  };

  // Computed safe payload for Admin Prompt & Output Inspector (รับประกันว่า promptPayload และ outputPayload เป็น string เสมอ ไม่เกิด undefined length)
  const activePromptData = useMemo(() => {
    if (!lastAiIdeationPayload) return null;

    const groupObj = coffeeGroups.find((g) => g.key === selectedGroup);
    const groupName = groupObj?.name || selectedGroup || 'กลุ่มกาแฟสร้างสรรค์คุณธรรม';
    const targetVirtues = (selectedCriteriaVirtues && selectedCriteriaVirtues.length > 0)
      ? selectedCriteriaVirtues
      : (selectedWeaknessVirtues.length > 0 ? selectedWeaknessVirtues : [research.weaknessVirtue || 'พอเพียง']);

    const fallbackPayloads = buildAiIdeationPayloadStrings(
      lastAiIdeationPayload.project || lastAiIdeationPayload,
      province,
      groupName,
      hackathonChallenge || 'การยกระดับพฤติกรรมคุณธรรมเพื่อการเปลี่ยนแปลงสังคม',
      targetVirtues,
      selectedWeaknessVirtues.join(' และ ') || research.weaknessVirtue || 'พอเพียง',
      aiPromptInput || '',
      aiIdeationCount || 1,
      lastAiIdeationPayload.generationSource || 'generative_models_engine',
      lastAiIdeationPayload.modelName || 'Moral Behavioral Generative Engine v2.5',
      lastAiIdeationPayload.rawJsonOutput,
      latestCriteriaRecord?.rubric || UNIVERSAL_DEFAULT_RUBRIC
    );

    const safePrompt = (typeof lastAiIdeationPayload.promptPayload === 'string' && lastAiIdeationPayload.promptPayload.trim().length > 0)
      ? lastAiIdeationPayload.promptPayload
      : fallbackPayloads.promptPayload;

    const safeOutput = (typeof lastAiIdeationPayload.outputPayload === 'string' && lastAiIdeationPayload.outputPayload.trim().length > 0)
      ? lastAiIdeationPayload.outputPayload
      : fallbackPayloads.outputPayload;

    const safeRawJson = (typeof lastAiIdeationPayload.rawJsonOutput === 'string' && lastAiIdeationPayload.rawJsonOutput.trim().length > 0)
      ? lastAiIdeationPayload.rawJsonOutput
      : fallbackPayloads.rawJsonOutput;

    return {
      ...lastAiIdeationPayload,
      projectName: lastAiIdeationPayload.projectName || lastAiIdeationPayload.project?.projectName || 'โครงการนวัตกรรมคุณธรรมนำร่อง',
      targetMoralVirtue: lastAiIdeationPayload.targetMoralVirtue || lastAiIdeationPayload.project?.targetMoralVirtue || selectedWeaknessVirtues[0] || 'พอเพียง',
      targetArea: lastAiIdeationPayload.targetArea || lastAiIdeationPayload.project?.targetArea || `จ.${province}`,
      targetAudience: lastAiIdeationPayload.targetAudience || lastAiIdeationPayload.project?.targetAudience || 'ประชาชนในพื้นที่',
      proposalDetails: lastAiIdeationPayload.proposalDetails || lastAiIdeationPayload.project?.proposalDetails || '-',
      activityPlan: lastAiIdeationPayload.activityPlan || lastAiIdeationPayload.project?.activityPlan || '-',
      behavioralKpi: lastAiIdeationPayload.behavioralKpi || lastAiIdeationPayload.project?.behavioralKpi || '-',
      promptPayload: safePrompt,
      outputPayload: safeOutput,
      rawJsonOutput: safeRawJson,
      timestamp: lastAiIdeationPayload.timestamp || new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      modelName: lastAiIdeationPayload.modelName || 'Moral Behavioral Generative Engine v2.5'
    };
  }, [
    lastAiIdeationPayload,
    province,
    selectedGroup,
    hackathonChallenge,
    selectedCriteriaVirtues,
    selectedWeaknessVirtues,
    research.weaknessVirtue,
    aiPromptInput,
    aiIdeationCount,
    coffeeGroups
  ]);

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

  // Fetch projects and benchmark anchors from SQLite DB on province change
  useEffect(() => {
    fetchHackathonProjectsFromDb(province).then((dbProjs) => {
      if (dbProjs && Array.isArray(dbProjs) && dbProjs.length > 0) {
        setAllProjects(dbProjs);
      } else {
        setAllProjects(getUserSubmittedProjects(province));
      }
    });
    getComparativeBenchmarkAnchorsFromDb(province).then((ctx) => {
      setBenchmarkContext(ctx);
    });
  }, [province]);

  // Smart Polling (Auto-Refresh) State for Step 2 & Step 5
  const [lastSyncRevision, setLastSyncRevision] = useState<string>('');
  const lastSyncRevisionRef = useRef<string>('');
  const isSyncingRef = useRef<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [newlyAddedProjectIds, setNewlyAddedProjectIds] = useState<Set<string>>(new Set());
  const [liveSyncToast, setLiveSyncToast] = useState<string | null>(null);

  const triggerLiveSync = useCallback(async (isManual: boolean = false) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const res = await pollActivityState({
        province,
        lastRevision: isManual ? undefined : lastSyncRevisionRef.current
      });

      if (res && res.ok) {
        if (res.syncTimestamp) {
          const d = new Date(res.syncTimestamp);
          const timeStr = !isNaN(d.getTime())
            ? d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSyncTime(timeStr);
        }

        if (res.changed) {
          if (res.revision) {
            lastSyncRevisionRef.current = res.revision;
            setLastSyncRevision(res.revision);
          }

          // Update Coffee Groups while preserving current selectedGroup if still valid
          if (res.coffeeGroups && Array.isArray(res.coffeeGroups) && res.coffeeGroups.length > 0) {
            setCoffeeGroups(res.coffeeGroups);
            setSelectedGroup((curr) => {
              const stillExists = res.coffeeGroups!.some((g) => g.key === curr);
              return stillExists ? curr : (res.coffeeGroups![0]?.key || 'mocha');
            });
          }

          // Update Projects & Highlight new entries
          if (res.submittedProjects && Array.isArray(res.submittedProjects)) {
            setAllProjects((prevProjects) => {
              const prevIds = new Set(prevProjects.map((p) => p.id));
              const brandNew = res.submittedProjects!.filter((p) => !prevIds.has(p.id));

              if (brandNew.length > 0 && prevProjects.length > 0) {
                const newIdsSet = new Set(brandNew.map((p) => p.id));
                setNewlyAddedProjectIds(newIdsSet);
                setLiveSyncToast(`พบโครงการใหม่ ${brandNew.length} โครงการ ถูกเพิ่มเข้ามาในระบบ`);
                setTimeout(() => {
                  setNewlyAddedProjectIds(new Set());
                }, 4000);
                setTimeout(() => {
                  setLiveSyncToast(null);
                }, 5000);
              }
              return res.submittedProjects!;
            });
          }
        }
      }
    } catch (err) {
      console.warn('Smart Polling error:', err);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [province]);

  // Smart Polling Interval (5 seconds) active ONLY on Step 2 and Step 5, paused on hidden tab
  useEffect(() => {
    if (currentStep !== 2 && currentStep !== 5) return;

    // Initial check when entering step 2 or 5
    triggerLiveSync(false);

    const intervalId = setInterval(() => {
      if (document.hidden) return; // Pause when tab is inactive
      triggerLiveSync(false);
    }, 5000);

    const handleVisibility = () => {
      if (!document.hidden) {
        triggerLiveSync(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentStep, triggerLiveSync]);

  // Load latest criteria from SQLite
  useEffect(() => {
    fetchHackathonCriteriaFromSqlite(province).then((res) => {
      if (res) setLatestCriteriaRecord(res);
    });
  }, [province, currentStep]);

  // Initial start: ensure all registration input textboxes are clean and empty by default (เริ่มต้น ข้อมูล ใน input ว่างเปล่า)
  useEffect(() => {
    setRegFirstName('');
    setRegLastName('');
    setRegFullName('');
    setRegPosition('');
    setRegAgency('');
    setRegDistrict('');
    setRegTambon('');
    setRegPhone('');
    setRegEmail('');
    setRegProvince(getOfficialProvince(province));
    setRegLevel('practitioner');
    try {
      localStorage.removeItem('mdc_hackathon_participant_reg_v2');
      clearActiveVoter();
    } catch {}
  }, [province]);

  // Synchronize dashboard tab when selected group changes
  useEffect(() => {
    setDashboardTabGroup(selectedGroup);
  }, [selectedGroup]);

  // Handle Step 1 Submit: Validate and save participant registration into system (SQLite DB & local storage)
  const handleStep1Next = async () => {
    const trimmedName = regFullName.trim();
    if (!trimmedName) {
      alert('กรุณากรอกชื่อ - นามสกุล ผู้ร่วมกิจกรรมก่อนดำเนินการต่อ');
      return;
    }

    setIsSavingStep1(true);
    const regId = `reg-${Date.now()}`;
    const registrationRecord: ParticipantRegistration = {
      id: regId,
      firstName: regFirstName.trim() || trimmedName.split(/\s+/)[0] || '',
      lastName: regLastName.trim() || trimmedName.split(/\s+/).slice(1).join(' ') || '',
      fullName: trimmedName,
      position: regPosition.trim(),
      agencyOrOrg: regAgency.trim(),
      level: regLevel,
      province: regProvince || province,
      district: regDistrict.trim(),
      subdistrict: regTambon.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      selectedGroup,
      registeredAt: new Date().toISOString()
    };

    // 1. Save to local storage for instant reactivity across all steps & bind voter identity
    saveParticipantRegistration(registrationRecord);
    setActiveVoterByName(trimmedName);

    // 2. Save directly into SQLite Database table (pilot_agency_registrations)
    try {
      await registerPilotAgencyInSqlite({
        id: regId,
        province: (regProvince as PilotProvinceName) || province,
        region: PILOT_4_PROVINCES_META[(regProvince as PilotProvinceName) || province]?.region || 'ภาคกลาง',
        agency_name: regAgency.trim() || 'หน่วยงานภาคีเครือข่ายคุณธรรม',
        agency_type: regLevel === 'policy' ? 'ภาครัฐ' : regLevel === 'practitioner' ? 'ภาคประชาสังคม/วิชาการ' : 'ภาคประชาชน/ชุมชน',
        first_name: regFirstName.trim() || trimmedName.split(/\s+/)[0] || '',
        last_name: regLastName.trim() || trimmedName.split(/\s+/).slice(1).join(' ') || '',
        position: regPosition.trim() || 'ผู้ร่วมกิจกรรม',
        participant_level: regLevel,
        phone: regPhone.trim(),
        email: regEmail.trim(),
        coffee_group: selectedGroup,
        coordinator_name: trimmedName,
        participant_role: `${regPosition.trim() || 'ผู้ร่วมกิจกรรม'} (${regLevel === 'policy' ? 'ระดับนโยบาย' : regLevel === 'practitioner' ? 'ระดับผู้ปฏิบัติการ' : 'ระดับประชาชน'})`,
        district: regDistrict.trim(),
        subdistrict: regTambon.trim(),
        contact_info: [regPhone.trim(), regEmail.trim()].filter(Boolean).join(' / '),
        activity_date: new Date().toISOString().slice(0, 10),
        synergy_topic: `กิจกรรม Hackathon คุณธรรม 4 ภาค (กลุ่มกาแฟ: ${selectedGroup})`,
        trial_project_name: `การลงทะเบียนผู้ร่วมกิจกรรม ${trimmedName}`,
        trial_project_summary: `ลงทะเบียนเข้าร่วมกิจกรรมคุณธรรม 4 ภาค จังหวัด${regProvince || province} โดย ${trimmedName} (${regPosition.trim() || 'ผู้ร่วมกิจกรรม'} - ${regAgency.trim() || 'เครือข่ายคุณธรรม'})`
      });
      await reloadParticipants();
    } catch (err) {
      console.warn('SQLite registration sync warning:', err);
    } finally {
      setIsSavingStep1(false);
    }

    // 3. Show save notification toast
    setStep1SaveToast(`บันทึกข้อมูลการลงทะเบียน "${trimmedName}" ลงสู่ระบบสำเร็จเรียบร้อยแล้ว`);
    setTimeout(() => {
      setStep1SaveToast(null);
    }, 5000);

    // 4. Advance to Step 2
    setCurrentStep(2);
  };

  // Handle Step 2 Group Select
  const handleStep2Next = () => {
    setCurrentStep(3);
  };

  // Handle Step 3 Research Next: ซิงค์เกณฑ์เริ่มต้นและคุณธรรมเป้าหมายในขั้นตอนที่ 4 ให้ตรงกับโจทย์ที่เลือก หรือจุดอ่อนขั้นตอนที่ 3
  const handleStep3Next = () => {
    if (currentMatchingChallenge) {
      const matchedVirtues = parseVirtuesFromCoreVirtue(currentMatchingChallenge.coreVirtue);
      if (matchedVirtues.length > 0) {
        setSelectedCriteriaVirtues(matchedVirtues);
        setPropTargetVirtue(matchedVirtues[0]);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`pilot_criteria_virtues_${province}`, JSON.stringify(matchedVirtues));
        }
        saveSelectedCriteriaVirtues(province, matchedVirtues, research.weaknessVirtue);
        setCurrentStep(4);
        return;
      }
    }
    syncStep4DefaultsFromStep3(selectedWeaknessVirtues);
    setCurrentStep(4);
  };

  // Handle AI Ideation trigger (คิดค้นโครงการใหม่โดย AI สังเคราะห์ลงฟอร์มส่วนที่ 2 อัตโนมัติ)
  const handleTriggerAiIdeation = async (customPrompt?: string) => {
    const promptInput = customPrompt !== undefined ? customPrompt : aiPromptInput;

    // เริ่มแสดงสถานะกำลังคิดทันที (ไอคอนหมุนวน) โดยไม่บล็อกด้วยหน้าต่าง Popup
    setIsAiGenerating(true);

    const nextCount = aiIdeationCount + 1;
    setAiIdeationCount(nextCount);

    try {
      const [idea] = await Promise.all([
        aiSuggestHackathonIdea(
          promptInput,
          effectiveProvince,
          selectedGroup,
          research.weaknessVirtue,
          hackathonChallenge,
          selectedCriteriaVirtues,
          nextCount,
          latestCriteriaRecord?.rubric || UNIVERSAL_DEFAULT_RUBRIC
        ),
        // มีดีเลย์ขั้นต่ำ 1,200ms เพื่อให้เห็นการหมุนวนและสถานะการคิดของ AI อย่างชัดเจน
        new Promise((resolve) => setTimeout(resolve, 1200))
      ]);

      // บันทึก payload ของ Prompt และ Output สำหรับ Account Admin ตรวจสอบ
      setLastAiIdeationPayload(idea);

      if (idea.projectName) setPropProjectName(stripProvinceFromProjectTitle(idea.projectName));
      if (idea.targetMoralVirtue) {
        const v = idea.targetMoralVirtue;
        setPropTargetVirtue(v.includes('วินัย') ? 'วินัย' : v);
      }
      if (idea.targetAudience) setPropTargetAudience(idea.targetAudience);
      if (idea.targetArea) setPropTargetArea(idea.targetArea);
      if (idea.proposalDetails) setPropProposalDetails(idea.proposalDetails);
      if (idea.activityPlan) setPropActivityPlan(idea.activityPlan);
      if (idea.behavioralKpi) setPropBehavioralKpi(idea.behavioralKpi);

      // บันทึก Snapshot ของข้อเสนอฉบับร่างตั้งต้นจาก AI เพื่อใช้ตรวจสอบระดับการมีส่วนร่วมของมนุษย์
      const initialAiSnap = {
        projectName: idea.projectName || '',
        proposalDetails: idea.proposalDetails || '',
        activityPlan: idea.activityPlan || '',
        behavioralKpi: idea.behavioralKpi || ''
      };
      saveAiSnapshot(initialAiSnap);

      // บันทึกร่างโครงการลง Storage ของ Session ผู้ใช้ทันที
      saveStep4Draft(province, regFirstName, regLastName, {
        projectName: stripProvinceFromProjectTitle(idea.projectName || ''),
        targetVirtue: idea.targetMoralVirtue ? (idea.targetMoralVirtue.includes('วินัย') ? 'วินัย' : idea.targetMoralVirtue) : 'พอเพียง',
        targetAudience: idea.targetAudience || '',
        targetArea: idea.targetArea || '',
        proposalDetails: idea.proposalDetails || '',
        activityPlan: idea.activityPlan || '',
        behavioralKpi: idea.behavioralKpi || '',
        lastAiGeneratedSnapshot: initialAiSnap
      });
      const nowIdea = new Date();
      setStep4AutoSavedTime(nowIdea.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // ล้าง Temp File ประวัติ 5 ครั้งล่าสุดของการตรวจคะแนนเดิมออกทันที และรีเซ็ตการตรวจกลับสู่รอบที่ 1
      clearTempEvaluationHistory(province);
      setPreCheckClickCount(0);
      setPreCheckResult(null);

      // ซิงค์ชื่อโครงการแนะนำ (Suggested Titles) และกลยุทธ์ทางเลือกให้ไปในทิศทางเดียวกับบริบทส่วนที่ 2 ทันที
      const normVirtue = idea.targetMoralVirtue ? (idea.targetMoralVirtue.includes('วินัย') ? 'วินัย' : idea.targetMoralVirtue) : 'พอเพียง';
      const alternativeTitles = suggestCreativeProjectTitles(effectiveProvince, normVirtue, promptInput || idea.projectName || idea.proposalDetails, promptInput || hackathonChallenge).map(stripProvinceFromProjectTitle);
      const combinedTitles = Array.from(new Set([idea.projectName, ...alternativeTitles].filter(Boolean) as string[]));
      setSuggestedTitles(combinedTitles.slice(0, 5));

      const alternativeStrats = suggestAlternativeBehaviorStrategies({
        projectName: idea.projectName,
        virtue: normVirtue,
        province: effectiveProvince,
        targetAudience: idea.targetAudience,
        targetArea: idea.targetArea,
        challengeTopic: promptInput || hackathonChallenge,
        userPromptOrKeyword: promptInput
      });
      setSuggestedBehaviorStrategies(alternativeStrats);

      if (idea.generationSource === 'llm_api') {
        setSubmitFeedback(`⚡ สำเร็จ! OpenRouter AI (${idea.modelName}) ได้ช่วยคิดโครงการฉบับร่างใหม่: "${idea.projectName}" และเริ่มวงจรการตรวจประเมินรอบที่ 1 เรียบร้อยแล้ว!${isAdmin ? ' (Admin สามารถกดดูข้อความ Prompt & Output ด้านล่างได้)' : ''}`);
      } else {
        const errDetail = idea.llmErrorReason
          ? ` (เหตุผลที่ไม่ใช้ OpenRouter: ${idea.llmErrorReason})`
          : ' (ใช้ Local Rule Engine เนื่องจากยังไม่ได้ระบุ OpenRouter API Key ในการตั้งค่า)';
        setSubmitFeedback(`⚙️ โครงการฉบับร่างสังเคราะห์โดย Local Rule Engine: "${idea.projectName}"${errDetail}${isAdmin ? ' (Admin สามารถกดดูข้อความ Prompt & Output ด้านล่างได้)' : ''}`);
      }
      setTimeout(() => setSubmitFeedback(null), 8000);

      // Smooth scroll to Section 2 form & pulse highlight
      setTimeout(() => {
        const formEl = document.getElementById('hackathon-proposal-form-section-2');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          formEl.classList.remove('form-highlight-pulse');
          void formEl.offsetWidth; // trigger reflow
          formEl.classList.add('form-highlight-pulse');
          setTimeout(() => {
            formEl.classList.remove('form-highlight-pulse');
          }, 2500);
        }
      }, 80);
    } catch (err) {
      console.error('AI Ideation error:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Handle Pre-Submission Score Check (ตรวจสอบคะแนนก่อนส่งโครงการ พร้อมดึง Benchmark จากฐานข้อมูล PostgreSQL (DB-MDC) และส่งตรวจผ่าน OpenRouter LLM)
  const handleTriggerPreSubmissionCheck = async () => {
    if (!propProjectName.trim()) {
      alert('กรุณาระบุ "ชื่อโครงการ (Project Title)" ในส่วนที่ 2 ก่อนทำการตรวจสอบคะแนน');
      return;
    }
    if (!propProposalDetails.trim()) {
      alert('กรุณาระบุ "แนวคิดโครงการ" ในส่วนที่ 2 ก่อนทำการตรวจสอบคะแนน');
      return;
    }

    setIsPreChecking(true);
    setIsPreCheckModalOpen(true);

    let activeRubric = UNIVERSAL_DEFAULT_RUBRIC;
    try {
      const critRec = await fetchHackathonCriteriaFromSqlite(province);
      if (critRec && critRec.rubric && critRec.rubric.length > 0) {
        activeRubric = critRec.rubric;
      }
    } catch (e) {
      console.warn('Fallback to universal rubric for pre-check evaluation:', e);
    }

    // ดึง Benchmark จากฐานข้อมูล PostgreSQL (DB-MDC) จริงก่อนการประเมิน
    let currentCompCtx = benchmarkContext;
    try {
      currentCompCtx = await getComparativeBenchmarkAnchorsFromDb(province);
      if (!currentCompCtx || currentCompCtx.totalPriorProjects === 0) {
        const localCtx = getComparativeBenchmarkAnchors(province);
        if (localCtx && localCtx.totalPriorProjects > 0) {
          currentCompCtx = localCtx;
        }
      }
    } catch (e) {
      console.warn('Fallback to memory benchmark context:', e);
      currentCompCtx = getComparativeBenchmarkAnchors(province);
    }

    const nextCheckCount = preCheckClickCount + 1;
    setPreCheckClickCount(nextCheckCount);

    const history = getTempEvaluationHistory(province);
    const prevSnap = getLatestTempSnapshot(province);

    try {
      const candFirst = regFirstName.trim();
      const candLast = regLastName.trim();
      const evaluatedProjectPayload = {
        projectName: propProjectName,
        targetMoralVirtue: propTargetVirtue || research.weaknessVirtue,
        targetArea: propTargetArea || `จ.${province}`,
        targetAudience: propTargetAudience || 'ประชาชนในพื้นที่',
        proposalDetails: propProposalDetails,
        activityPlan: propActivityPlan || 'กลไกการมีส่วนร่วมของ 3 ระดับ',
        behavioralKpi: propBehavioralKpi || 'ร้อยละพฤติกรรมเชิงบวกที่เพิ่มขึ้นอย่างเป็นรูปธรรม',
        proposerName: regFullName || `${candFirst} ${candLast}`.trim() || 'ผู้ร่วมกิจกรรม Hackathon',
        proposerFirstName: candFirst || undefined,
        proposerLastName: candLast || undefined,
        proposerPosition: regPosition || undefined,
        proposerAgency: regAgency || `เครือข่ายคุณธรรม จ.${province}`,
        proposerLevel: regLevel,
        aiDraftSnapshot: aiDraftSnapshotRef.current || lastAiGeneratedSnapshot || (() => {
          try {
            const s = typeof window !== 'undefined' ? sessionStorage.getItem('last_ai_generated_snapshot') : null;
            return s ? JSON.parse(s) : null;
          } catch { return null; }
        })() || undefined
      };

      // ประเมินข้อเสนอโครงการด้วย OpenRouter LLM (พร้อมระบบ 4 เสาหลัก, Safety Invariants & Fallback อัตโนมัติ)
      const result = await evaluatePreSubmissionWithOpenRouterLlm(
        evaluatedProjectPayload,
        hackathonChallenge,
        selectedCriteriaVirtues,
        activeRubric,
        currentCompCtx,
        nextCheckCount,
        prevSnap,
        history
      );

      // บันทึก/อัปเดตลงใน 5-Revision History Ring Buffer
      const nextIteration = (prevSnap?.iteration || 0) + 1;
      const newSnap: TempEvaluationSnapshot = {
        iteration: nextIteration,
        timestamp: new Date().toISOString(),
        province,
        projectData: evaluatedProjectPayload,
        challengeTopic: hackathonChallenge,
        finalScore: result.finalScore,
        pillarScores: {
          challenge_fit: result.evaluatedDimensions.find(d => d.virtueKey === 'challenge_fit')?.score ?? 0,
          creative_nudge: result.evaluatedDimensions.find(d => d.virtueKey === 'creative_nudge')?.score ?? 0,
          actionability: result.evaluatedDimensions.find(d => d.virtueKey === 'actionability')?.score ?? 0,
          expected_impact: result.evaluatedDimensions.find(d => d.virtueKey === 'expected_impact')?.score ?? 0,
        },
        qualityTier: result.qualityTier,
        summaryHighlights: result.evaluatedDimensions.map(d => d.virtueName),
        diffAnalysis: result.diffAnalysis,
        feasibilityAssessment: result.feasibilityAssessment,
        standoutVirtueAnalysis: result.standoutVirtueAnalysis
      };
      
      const updatedHistory = pushTempEvaluationSnapshot(province, newSnap, hackathonChallenge);
      result.historySnapshots = updatedHistory.snapshots;

      setPreCheckResult(result);
    } catch (err) {
      console.error('Pre-submission check error:', err);
    } finally {
      setIsPreChecking(false);
      // Refresh benchmark context and projects from SQLite DB
      try {
        const freshCtx = await getComparativeBenchmarkAnchorsFromDb(province);
        setBenchmarkContext(freshCtx);
        const freshProjs = await fetchHackathonProjectsFromDb(province);
        if (freshProjs && Array.isArray(freshProjs) && freshProjs.length > 0) {
          setAllProjects(freshProjs);
        } else {
          setAllProjects(getUserSubmittedProjects(province));
        }
      } catch {}
    }
  };

  // Submit Logic (shared between Step 4 Submit and PreCheck Confirm Submit)
  const doSubmitProject = async (customEval?: {
    aiScore: number;
    aiScoreBreakdown: { alignment: number; feasibility: number; innovation: number; participation: number };
    aiRecommendations: string;
  }) => {
    const candFirst = regFirstName.trim();
    const candLast = regLastName.trim();

    // ตรวจสอบผู้ส่งซ้ำจาก field ชื่อ และ field นามสกุล
    if (candFirst && candLast) {
      const dup = checkDuplicateSubmitter(candFirst, candLast, allProjects);
      if (dup.isDuplicate && dup.existingProject) {
        alert(`ไม่สามารถส่งโครงการได้: คุณ ${candFirst} ${candLast} ได้ส่งโครงการ "${dup.existingProject.projectName}" ไปแล้วในระบบ (แต่ละคนส่งได้แค่หนึ่งโครงการถ้าส่งแล้วส่งอีกไม่ได้)`);
        return;
      }
    }

    if (!propProjectName.trim()) {
      alert('กรุณาระบุชื่อโครงการที่ต้องการนำเสนอ');
      return;
    }

    const currentGroupMeta = coffeeGroups.find((g) => g.key === selectedGroup) || coffeeGroups[0] || COFFEE_GROUPS.mocha;

    const created = saveHackathonProject(
      {
        province,
        groupKey: selectedGroup,
        groupName: currentGroupMeta.name,
        projectName: propProjectName,
        targetMoralVirtue: propTargetVirtue || research.weaknessVirtue,
        targetAudience: propTargetAudience || 'ประชาชนและชุมชนในพื้นที่',
        targetArea: propTargetArea || `จ.${province}`,
        proposalDetails: propProposalDetails || 'แนวคิดกิจกรรมปรับเปลี่ยนพฤติกรรมคุณธรรม',
        activityPlan: propActivityPlan || 'การบูรณาการกลไก 3 ระดับ: นโยบาย ผู้ปฏิบัติการ และประชาชน',
        behavioralKpi: propBehavioralKpi || 'ร้อยละพฤติกรรมเชิงบวกที่เพิ่มขึ้นอย่างเป็นรูปธรรม',
        proposerName: regFullName || `${candFirst} ${candLast}`.trim() || 'ผู้ร่วมกิจกรรม Hackathon',
        proposerFirstName: candFirst || undefined,
        proposerLastName: candLast || undefined,
        proposerPosition: regPosition || undefined,
        proposerAgency: regAgency || `เครือข่ายคุณธรรม จ.${province}`,
        proposerLevel: regLevel,
        challengeTopic: hackathonChallenge,
        evaluatedCriteriaVirtues: selectedCriteriaVirtues,
        rawAiScore: preCheckResult?.rawScore ?? customEval?.aiScore,
        preCheckCount: preCheckResult?.checkCount ?? (preCheckClickCount || 1),
        preCheckPenalty: 0
      },
      customEval
    );

    setPreCheckClickCount(0);

    // Refresh state from SQLite DB
    try {
      const freshCtx = await getComparativeBenchmarkAnchorsFromDb(province);
      setBenchmarkContext(freshCtx);
      const freshProjs = await fetchHackathonProjectsFromDb(province);
      if (freshProjs && Array.isArray(freshProjs) && freshProjs.length > 0) {
        setAllProjects(freshProjs);
      } else {
        setAllProjects(getUserSubmittedProjects(province));
      }
    } catch {}

    setDashboardTabGroup(selectedGroup);
    setLastSubmittedProject(created);
    setIsPreCheckModalOpen(false);
    setIsPostSubmitModalOpen(false);
    setScoreboardFilterTab('all');
    setDashboardViewMode('submitted_only');
    setCurrentStep(5);
    handleClearSection2Form(true);
    setSubmitFeedback(`🚀 โครงการ "${created.projectName}" บันทึกลงฐานข้อมูล PostgreSQL (DB-MDC) และส่งเข้าสู่ Hackathon เรียบร้อยแล้ว! (คะแนนประเมิน AI: ${created.aiScore}/100)`);
    setTimeout(() => setSubmitFeedback(null), 5000);
  };

  // Handle Navigate to Submitted Projects Summary View from Post-Submission Dialog
  const handleGoToSubmittedProjectsSummary = () => {
    setIsPostSubmitModalOpen(false);
    setScoreboardFilterTab('all');
    setDashboardViewMode('submitted_only');
    setCurrentStep(5);
  };

  const handleConfirmSubmitFromPreCheck = () => {
    setIsPreCheckModalOpen(false);
    if (preCheckResult) {
      doSubmitProject({
        aiScore: preCheckResult.finalScore,
        aiScoreBreakdown: {
          alignment: Number(((preCheckResult.finalScore * 0.3)).toFixed(1)),
          feasibility: Number(((preCheckResult.finalScore * 0.3)).toFixed(1)),
          innovation: Number(((preCheckResult.finalScore * 0.2)).toFixed(1)),
          participation: Number(((preCheckResult.finalScore * 0.2)).toFixed(1))
        },
        aiRecommendations: preCheckResult.comparativeContext.comparativeRationale
      });
    } else {
      doSubmitProject();
    }
  };

  // Handle Step 4 Project Submit (Enter key in form triggers Pre-check popup)
  const handleStep4Submit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTriggerPreSubmissionCheck();
  };

  // Handle Reset Submission Session
  const handleResetSubmissionSession = async () => {
    if (window.confirm(`ต้องการรีเซ็ตลำดับการส่งข้อเสนอโครงการใน จ.${province} เพื่อเริ่มทดสอบรอบใหม่ (ลำดับที่ 1 -> 2 -> 3+) หรือไม่?`)) {
      resetSubmittedProjectsSession(province);
      try {
        const freshCtx = await getComparativeBenchmarkAnchorsFromDb(province);
        setBenchmarkContext(freshCtx);
      } catch {
        setBenchmarkContext(getComparativeBenchmarkAnchors(province));
      }
      setAllProjects(getUserSubmittedProjects(province));
      setSubmitFeedback('🔄 รีเซ็ตลำดับการส่งเรียบร้อยแล้ว: โครงการถัดไปจะเริ่มต้นที่ลำดับที่ 1 (Start ที่ 80.00 คะแนน)');
      setTimeout(() => setSubmitFeedback(null), 4000);
    }
  };

  // Handle Admin Reset Database (ล้างข้อมูลใน PostgreSQL (DB-MDC) เฉพาะ Account Admin)
  const handleAdminResetDatabase = async () => {
    if (!isAdmin) {
      alert('ฟังก์ชันนี้อนุญาตเฉพาะ Account Admin เท่านั้น');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ คำเตือนสำหรับผู้ดูแลระบบ (Admin):\n\nคุณต้องการ Reset ฐานข้อมูลโครงการ Hackathon ของ จ.${province} ทั้งหมดใน PostgreSQL (DB-MDC) หรือไม่?\n\n(ข้อมูลโครงการที่บันทึกไว้ในฐานข้อมูลจริงจะถูกลบ เพื่อให้ระบบเริ่มนับลำดับใหม่ที่โครงการที่ 1 เริ่มต้นที่ 80.00 คะแนน)`
    );

    if (!confirmed) return;

    const res = await resetHackathonDatabaseFromApi(province);
    try {
      const freshCtx = await getComparativeBenchmarkAnchorsFromDb(province);
      setBenchmarkContext(freshCtx);
    } catch {
      setBenchmarkContext(getComparativeBenchmarkAnchors(province));
    }
    setAllProjects(getUserSubmittedProjects(province));
    setSubmitFeedback(`🗑️ ${res.message} (สถานะ: ลำดับที่ 1 เริ่มต้นที่ 80.00 คะแนน)`);
    setTimeout(() => setSubmitFeedback(null), 5000);
  };

  // Handle Admin Delete Single Project (Admin สามารถลบโครงการที่ส่งมาได้ทุกโครงการ)
  const handleDeleteProject = async (e: React.MouseEvent | null, p: HackathonProject) => {
    if (e) e.stopPropagation();
    if (!isAdmin) {
      alert('เฉพาะบัญชีผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบโครงการได้');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ คำเตือนสำหรับผู้ดูแลระบบ (Admin):\n\nคุณต้องการลบโครงการ "${p.projectName}" ออกจากฐานข้อมูลและหน้าโหวตใช่หรือไม่?\n\n(ข้อมูลโครงการจะถูกลบออกจากฐานข้อมูล PostgreSQL (DB-MDC) และรายการโหวตอย่างถาวร)`
    );
    if (!confirmed) return;

    const res = await deleteHackathonProject(p.id);
    if (res.success) {
      setAllProjects((prev) => prev.filter((item) => item.id !== p.id));
      if (selectedDetailProject?.id === p.id) {
        setSelectedDetailProject(null);
      }
      try {
        const freshCtx = await getComparativeBenchmarkAnchorsFromDb(province);
        setBenchmarkContext(freshCtx);
      } catch {}
      setSubmitFeedback(`🗑️ ลบโครงการ "${p.projectName}" เรียบร้อยแล้ว (Admin)`);
      setTimeout(() => setSubmitFeedback(null), 4000);
    }
  };

  const handleCloseAdminModal = () => {
    setAdminUsernameInput('');
    setAdminPasswordInput('');
    setAdminAuthFeedback(null);
    setIsAdminModalOpen(false);
  };

  // Handle Admin Login Submit
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginAdmin(adminUsernameInput, adminPasswordInput);
    if (res.success) {
      setIsAdmin(true);
      setIsAdminModalOpen(false);
      setAdminUsernameInput('');
      setAdminPasswordInput('');
      setAdminAuthFeedback(null);
      setSubmitFeedback('👑 เข้าสู่ระบบ Admin สำเร็จ: ปุ่ม Reset ฐานข้อมูลพร้อมใช้งานแล้วที่มุมขวาบน');
      setTimeout(() => setSubmitFeedback(null), 5000);
    } else {
      setAdminAuthFeedback(res.message);
    }
  };

  // Group Projects for Dashboard Step 5
  const activeTabProjects = useMemo(() => {
    return allProjects.filter((p) => p.groupKey === dashboardTabGroup);
  }, [allProjects, dashboardTabGroup]);

  const groupAverageScore = useMemo(() => {
    if (!activeTabProjects.length) return '0.0';
    const sum = activeTabProjects.reduce((acc, p) => acc + p.aiScore, 0);
    return (sum / activeTabProjects.length).toFixed(1);
  }, [activeTabProjects]);

  const groupTotalVotes = useMemo(() => {
    return activeTabProjects.reduce((acc, p) => acc + (p.communityVotes || 0), 0);
  }, [activeTabProjects]);

  // Submitted Only Projects (เฉพาะโครงการที่ส่งเข้าแข่งขันจริง)
  const submittedOnlyProjects = useMemo(() => {
    const userProjs = allProjects.filter(
      (p) => !isSeedHackathonProject(p.id) && !p.id.startsWith('precheck-')
    );
    return [...userProjs].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
  }, [allProjects]);

  const submittedMaxScore = useMemo(() => {
    if (submittedOnlyProjects.length === 0) return 0;
    return Math.max(...submittedOnlyProjects.map((p) => p.aiScore || 0));
  }, [submittedOnlyProjects]);

  const submittedMinScore = useMemo(() => {
    if (submittedOnlyProjects.length === 0) return 0;
    return Math.min(...submittedOnlyProjects.map((p) => p.aiScore || 0));
  }, [submittedOnlyProjects]);

  const submittedAvgScore = useMemo(() => {
    if (submittedOnlyProjects.length === 0) return 0;
    const total = submittedOnlyProjects.reduce((sum, p) => sum + (p.aiScore || 0), 0);
    return Number((total / submittedOnlyProjects.length).toFixed(2));
  }, [submittedOnlyProjects]);

  // Computed displayed projects for Step 5 Clean Scoreboard (ผลคะแนนโครงการ)
  const displayedScoreboardProjects = useMemo(() => {
    let projs: HackathonProject[] = [];
    if (scoreboardFilterTab === 'all' || scoreboardFilterTab === 'submitted') {
      projs = allProjects;
    } else {
      projs = allProjects.filter((p) => p.groupKey === scoreboardFilterTab);
    }
    return [...projs].sort((a, b) => (Number(b.aiScore) || 0) - (Number(a.aiScore) || 0));
  }, [scoreboardFilterTab, allProjects]);

  // Set of Project IDs submitted by the current user in this browser session
  const myProjectIds = useMemo(() => {
    const list = getUserSubmittedProjects(province);
    const set = new Set(list.map((p) => p.id));
    if (lastSubmittedProject?.id) {
      set.add(lastSubmittedProject.id);
    }
    return set;
  }, [province, lastSubmittedProject]);

  const checkIsMyProject = (p: HackathonProject) => {
    if (isSeedHackathonProject(p.id) || p.id.startsWith('precheck-')) return false;

    // 1. Matches this session's last submitted project
    if (lastSubmittedProject && p.id === lastSubmittedProject.id) {
      return true;
    }

    // 2. Matches user-submitted project IDs from local storage session
    if (myProjectIds.has(p.id)) {
      return true;
    }

    // 3. Matches explicitly registered full name (excluding generic fallback strings)
    const trimmedName = regFullName.trim();
    const isGenericFallback =
      !trimmedName ||
      trimmedName === 'ผู้ร่วมกิจกรรม Hackathon' ||
      trimmedName === 'ผู้แทนร่วมกิจกรรม' ||
      trimmedName === 'ผู้เสนอโครงการ';

    if (!isGenericFallback && p.proposerName?.trim() === trimmedName) {
      return true;
    }

    return false;
  };

  return (
    <div className="pilot-hackathon-wrapper">
      {/* Toast Feedback */}
      {submitFeedback && (
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
            fontSize: '14.5px',
            fontWeight: 600,
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          <Sparkles size={18} color="#f59e0b" />
          <span>{submitFeedback}</span>
        </div>
      )}

      {/* Mobile Sticky Quick Navigation Bar */}
      {onBackToOverview && (
        <div className="pilot-mobile-sticky-topbar">
          <span className="pilot-mobile-province-label">กิจกรรม จ.{province}</span>
          <button
            type="button"
            className="pilot-mobile-back-btn"
            onClick={onBackToOverview}
            title="กลับสู่หน้ารวมกิจกรรม 4 ภาค"
          >
            <ArrowLeft size={15} />
            <span>4 ภาค</span>
          </button>
        </div>
      )}

      {/* =================================================================
          1. DYNAMIC PROVINCE HERO TOP BANNER (ภาพเดียวกับหน้าแรก)
          ================================================================= */}
      <div
        className="pilot-top-hero-banner"
        style={{
          '--hero-bg-pc': `url(${PROVINCE_HERO_BG[province]})`,
          '--hero-bg-mobile': `url(${PROVINCE_HERO_BG_MOBILE[province] || PROVINCE_HERO_BG[province]})`
        } as React.CSSProperties}
      >
        <div className="pilot-hero-top-row">
          <div className="pilot-hero-badges-row">
            <span className="pilot-hero-badge region">{meta.region}</span>
          </div>

          <div className="pilot-hero-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isLoggedIn ? (
              <button
                type="button"
                className="mdc-login-btn pilot-hero-login-btn"
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
                  ref={profileBtnRef}
                  type="button"
                  className="mdc-login-btn pilot-hero-login-btn"
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
                  isOpen={isProfileMenuOpen}
                  onClose={() => setIsProfileMenuOpen(false)}
                  isAdmin={isAdmin}
                  profile={userProfile}
                  isLoggedIn={isLoggedIn}
                  triggerRef={profileBtnRef}
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

            {onBackToOverview && (
              <button
                type="button"
                className="pilot-hero-back-btn"
                onClick={onBackToOverview}
                title="กลับสู่หน้ากิจกรรมคุณธรรม 4 ภาค"
              >
                <ArrowLeft size={16} />
                <span>กิจกรรมคุณธรรม 4 ภาค</span>
              </button>
            )}
          </div>
        </div>

        <div className="pilot-hero-content">
          <h1 className="pilot-hero-title">
            การจัดกิจกรรมคุณธรรมเชิงปฏิบัติการ: จังหวัด{province}
          </h1>
        </div>
      </div>

      {/* =================================================================
          2. STEPPER NAVIGATION (ไอคอนหมายเลข 1-5 พร้อมแสดงชื่อขั้นตอนเล็กๆ ใต้ icon เมื่อกด)
          ================================================================= */}
      <div className="hackathon-stepper-container">
        <div className="hackathon-stepper-track">
          {[
            { num: 1, name: 'ข้อมูลลงทะเบียน' },
            { num: 2, name: 'เลือกกลุ่มกาแฟ' },
            { num: 3, name: 'ผลวิจัยคุณธรรม' },
            { num: 4, name: 'ทำ Hackathon' },
            { num: 5, name: 'ผลคะแนนโครงการ' }
          ].map((s, idx) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <React.Fragment key={s.num}>
                {idx > 0 && (
                  <div
                    className={`hackathon-stepper-line ${currentStep >= s.num ? 'is-completed' : ''}`}
                  />
                )}
                <div className={`hackathon-stepper-node ${isActive ? 'is-active' : ''}`}>
                  <button
                    type="button"
                    className={`hackathon-step-icon-btn ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}
                    onClick={() => {
                      if (currentStep === 3 && s.num === 4) {
                        if (currentMatchingChallenge) {
                          const matchedVirtues = parseVirtuesFromCoreVirtue(currentMatchingChallenge.coreVirtue);
                          if (matchedVirtues.length > 0) {
                            setSelectedCriteriaVirtues(matchedVirtues);
                            setPropTargetVirtue(matchedVirtues[0]);
                            if (typeof window !== 'undefined') {
                              localStorage.setItem(`pilot_criteria_virtues_${province}`, JSON.stringify(matchedVirtues));
                            }
                            saveSelectedCriteriaVirtues(province, matchedVirtues, research.weaknessVirtue);
                          } else {
                            syncStep4DefaultsFromStep3(selectedWeaknessVirtues);
                          }
                        } else {
                          syncStep4DefaultsFromStep3(selectedWeaknessVirtues);
                        }
                      }
                      setCurrentStep(s.num);
                    }}
                    title={`ขั้นตอนที่ ${s.num}: ${s.name}`}
                  >
                    <span className="hackathon-step-icon-num">{s.num}</span>
                  </button>

                  {/* เมื่อกด icon ด้านล่างให้แสดง ชื่อของขั้นตอนที่ทำเล็กๆอยู่ใต้ icon หมายเลข */}
                  {isActive && (
                    <span className="hackathon-step-sublabel">
                      {s.name}
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* =================================================================
          STEP 1: REGISTRATION (3 ระดับบุคคล)
          ================================================================= */}
      {currentStep === 1 && (
        <div className="hackathon-content-card">
          <div className="hackathon-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div className="hackathon-section-title-wrap">
              <span className="hackathon-step-tag">ขั้นตอนที่ 1 / 5</span>
              <h2 className="hackathon-section-title">ข้อมูลการลงทะเบียนผู้ร่วมกิจกรรม</h2>
              <p className="hackathon-section-desc">
                โปรดระบุข้อมูลและเลือกระดับบทบาทของท่าน (จำเป็นต้องครอบคลุม 3 ระดับเพื่อจัดสมดุลทีมในขั้นตอนถัดไป)
              </p>
            </div>
            <button
              type="button"
              className="hackathon-btn-clear-step1"
              onClick={handleClearStep1Form}
              title="Clear All: ลบข้อมูลในฟิลด์ input ทั้งหมด และปรับเป็นค่าเริ่มต้น (Default)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 16px',
                borderRadius: '8px',
                border: '1.5px solid #fca5a5',
                backgroundColor: '#ffffff',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(220, 38, 38, 0.08)'
              }}
            >
              <RotateCcw size={14} />
              <span>Clear All</span>
            </button>
          </div>

          {/* Toast Notification when Clear All is clicked */}
          {step1ClearToast && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                fontWeight: 500,
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#dc2626" />
                <span>{step1ClearToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep1ClearToast(null)}
                style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', padding: '2px' }}
                title="ปิด"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* 3 Participant Levels Selection */}
          <div>
            <label className="reg-form-label" style={{ marginBottom: '10px', display: 'block' }}>
              ระดับบทบาทของผู้เข้าร่วม (บังคับเลือก 1 ใน 3 ระดับ) *
            </label>
            <div className="reg-level-grid">
              {/* Level 1: Policy */}
              <div
                className={`reg-level-card ${regLevel === 'policy' ? 'is-selected' : ''}`}
                onClick={() => setRegLevel('policy')}
              >
                <div className="reg-level-top">
                  <span className="reg-level-icon">🏛️</span>
                  <div className="reg-level-radio" />
                </div>
                <div className="reg-level-name">ระดับนโยบาย (Policy Maker)</div>
                <div className="reg-level-desc">
                  ผู้แทนผู้ว่าราชการจังหวัด, ผู้บริหาร อปท., นายกเทศมนตรี, หัวหน้าส่วนราชการระดับจังหวัด
                </div>
              </div>

              {/* Level 2: Practitioner */}
              <div
                className={`reg-level-card ${regLevel === 'practitioner' ? 'is-selected' : ''}`}
                onClick={() => setRegLevel('practitioner')}
              >
                <div className="reg-level-top">
                  <span className="reg-level-icon">⚙️</span>
                  <div className="reg-level-radio" />
                </div>
                <div className="reg-level-name">ระดับผู้ปฏิบัติการ (Practitioner)</div>
                <div className="reg-level-desc">
                  เจ้าหน้าที่พัฒนาชุมชน, ครู/อาจารย์, บุคลากร รพ.สต., เจ้าหน้าที่สิ่งแวดล้อมและปกครองท้องถิ่น
                </div>
              </div>

              {/* Level 3: Citizen */}
              <div
                className={`reg-level-card ${regLevel === 'citizen' ? 'is-selected' : ''}`}
                onClick={() => setRegLevel('citizen')}
              >
                <div className="reg-level-top">
                  <span className="reg-level-icon">👥</span>
                  <div className="reg-level-radio" />
                </div>
                <div className="reg-level-name">ระดับประชาชน (Citizen)</div>
                <div className="reg-level-desc">
                  ผู้นำชุมชน, อสม., สภาเด็กและเยาวชน, วิสาหกิจชุมชน, แกนนำจิตอาสา และประชาชนทั่วไป
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="reg-form-grid">
            <div className="reg-form-group">
              <label className="reg-form-label">ชื่อ (First Name) *</label>
              <input
                id="reg-firstname-input"
                type="text"
                className="reg-form-input"
                placeholder="เช่น ธีรภัทร"
                value={regFirstName}
                onChange={(e) => handleFirstNameChange(e.target.value)}
                required
              />
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">นามสกุล (Last Name) *</label>
              <input
                id="reg-lastname-input"
                type="text"
                className="reg-form-input"
                placeholder="เช่น วัฒนสุข"
                value={regLastName}
                onChange={(e) => handleLastNameChange(e.target.value)}
                required
              />
              <input
                id="reg-fullname-input"
                type="hidden"
                value={regFullName}
              />
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">ตำแหน่ง *</label>
              <input
                type="text"
                className="reg-form-input"
                placeholder="เช่น หัวหน้าฝ่ายพัฒนาชุมชน / ประธานสภาเยาวชน"
                value={regPosition}
                onChange={(e) => setRegPosition(e.target.value)}
              />
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">หน่วยงาน / องค์กร / ชุมชน *</label>
              <input
                type="text"
                className="reg-form-input"
                placeholder={`เช่น ชุมชน / หน่วยงานใน จ.${province}`}
                value={regAgency}
                onChange={(e) => setRegAgency(e.target.value)}
              />
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">จังหวัด (ต้นสังกัด / ภูมิลำเนา) *</label>
              <select
                className="reg-form-select"
                value={regProvince}
                onChange={(e) => handleRegProvinceChange(e.target.value)}
              >
                {ALL_77_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    จ.{p} {p === getOfficialProvince(province) ? '(พื้นที่จัดงาน)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">อำเภอ / เขต (กรอกเอง) *</label>
              <input
                type="text"
                className="reg-form-input"
                placeholder={`เช่น ${getDefaultDistrictForProvince(regProvince)}`}
                value={regDistrict}
                onChange={(e) => setRegDistrict(e.target.value)}
              />
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">ตำบล / ชุมชน</label>
              <input
                type="text"
                className="reg-form-input"
                placeholder="เช่น ต.มาบตาพุด / ชุมชนเนินพลา"
                value={regTambon}
                onChange={(e) => setRegTambon(e.target.value)}
              />
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                className="reg-form-input"
                placeholder="เช่น 081-234-5678"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">อีเมล (Email)</label>
              <input
                type="email"
                className="reg-form-input"
                placeholder="เช่น user@moralcenter.or.th"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="hackathon-footer-actions" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <button
              id="reg-step1-next-btn"
              type="button"
              className="hackathon-btn-next"
              onClick={handleStep1Next}
              disabled={isSavingStep1}
              style={{ opacity: isSavingStep1 ? 0.75 : 1, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isSavingStep1 ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>กำลังบันทึกข้อมูลลงระบบ...</span>
                </>
              ) : (
                <>
                  <span>บันทึกและถัดไป: เลือกกลุ่มกาแฟ</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =================================================================
          STEP 2: GROUP SELECTION (Coffee Teams with Backgrounds & CRUD)
          ================================================================= */}
      {currentStep === 2 && (
        <div className="hackathon-content-card">
          {/* Step 1 Save Success Toast */}
          {step1SaveToast && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 18px',
                borderRadius: '10px',
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #86efac',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(22, 101, 52, 0.1)',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#16a34a" />
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{step1SaveToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep1SaveToast(null)}
                style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', padding: '2px' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="hackathon-section-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div className="hackathon-section-title-wrap">
              <span className="hackathon-step-tag">ขั้นตอนที่ 2 / 5</span>
              <h2 className="hackathon-section-title">การเลือกกลุ่ม ({coffeeGroups.length} ทีมกาแฟสร้างสรรค์คุณธรรม)</h2>
              <p className="hackathon-section-desc">
                เลือกกลุ่มที่ท่านต้องการร่วมทำ Hackathon โดยแต่ละกลุ่มจะผสานพลังคนครบทั้ง 3 ระดับเพื่อร่วมแข่งขัน
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginLeft: 'auto' }}>
              {/* Live Sync Status Badge for Step 2 */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '999px', fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                <span>ซิงค์กลุ่มสด (5s)</span>
                {lastSyncTime && <span style={{ color: '#15803d', fontSize: '11px', opacity: 0.85 }}>• {lastSyncTime}</span>}
                <button
                  type="button"
                  onClick={() => triggerLiveSync(true)}
                  disabled={isSyncing}
                  title="คลิกเพื่อดึงข้อมูลกลุ่มล่าสุดทันที"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', display: 'inline-flex', alignItems: 'center', color: '#166534' }}
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Add Coffee Group Button - Always accessible to all participants & admins */}
              <button
                type="button"
                className="coffee-add-group-btn"
                onClick={handleOpenAddGroup}
                title="คลิกเพื่อเพิ่มกลุ่มกาแฟใหม่สำหรับทีมหรือกิจกรรม"
              >
                <Plus size={18} />
                <span>เพิ่มกลุ่มกาแฟใหม่ (Add Group)</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleResetGroups}
                  title="รีเซ็ตกลุ่มกาแฟกลับเป็นค่าเริ่มต้น 5 กลุ่ม"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '999px',
                    color: '#64748b',
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={14} />
                  <span>รีเซ็ต 5 กลุ่มเริ่มต้น</span>
                </button>
              )}
            </div>
          </div>

          {/* Registered Participant Info Banner in Step 2 */}
          {regFullName.trim() && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                padding: '12px 18px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span>บันทึกข้อมูลการลงทะเบียนลงระบบแล้ว:</span>
                    <span style={{ color: '#0f172a' }}>{regFullName}</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#bbf7d0', color: '#14532d' }}>
                      {regLevel === 'policy' ? 'ระดับนโยบาย' : regLevel === 'practitioner' ? 'ระดับผู้ปฏิบัติการ' : 'ระดับประชาชน'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                    {regPosition && <span>ตำแหน่ง: {regPosition} | </span>}
                    {regAgency && <span>หน่วยงาน: {regAgency} | </span>}
                    <span>พื้นที่: จ.{regProvince || province} {regDistrict ? `อ.${regDistrict}` : ''}</span>
                    {regPhone && <span> | โทร: {regPhone}</span>}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                style={{
                  padding: '5px 12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#15803d',
                  cursor: 'pointer'
                }}
              >
                แก้ไขข้อมูลลงทะเบียน
              </button>
            </div>
          )}

          {/* Step 2 Team Balance Indicator Bar & SQLite DB Explorer */}
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                ⚖️ ความสมดุล 3 ระดับในกิจกรรม (จ.{province}):
              </span>
              <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                🏛️ นโยบาย: {levelCounts.policy} คน
              </span>
              <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                ⚙️ ผู้ปฏิบัติการ: {levelCounts.practitioner} คน
              </span>
              <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                👥 ประชาชน: {levelCounts.citizen} คน
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                (รวม {levelCounts.total} คนในฐานข้อมูล)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsDbExplorerModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                border: '1.5px solid #3b82f6',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="เปิดดูตารางฐานข้อมูล PostgreSQL (DB-MDC)"
            >
              <Database size={13} />
              <span>เปิดดู Database (PostgreSQL: DB-MDC)</span>
            </button>
          </div>

          {/* Coffee Buttons Grid with Real Background Images & Actions */}
          <div className="coffee-groups-grid">
            {coffeeGroups.map((grp) => {
              const isSelected = selectedGroup === grp.key;

              return (
                <div
                  key={grp.key}
                  className={`coffee-group-button ${isSelected ? 'is-active' : ''}`}
                  style={{ backgroundImage: `url(${grp.bgImage})` }}
                  onClick={() => setSelectedGroup(grp.key)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="coffee-btn-top">
                    <span className="coffee-badge-chip">
                      <span>☕</span>
                      <span>{grp.name}</span>
                    </span>

                    <div className="coffee-top-right-actions">
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            className="coffee-card-action-btn"
                            onClick={(e) => handleOpenEditGroup(grp, e)}
                            title="แก้ไขข้อมูลกลุ่มนี้"
                          >
                            <Pencil size={12} />
                            <span>แก้ไข</span>
                          </button>

                          <button
                            type="button"
                            className="coffee-card-action-btn btn-delete"
                            onClick={(e) => handleDeleteGroup(grp.key, grp.name, e)}
                            title="ลบกลุ่มนี้"
                          >
                            <Trash2 size={12} />
                            <span>ลบ</span>
                          </button>
                        </>
                      )}

                      <div className="coffee-check-indicator">
                        {isSelected ? <CheckCircle2 size={20} /> : <span style={{ fontSize: '12px' }}>เลือก</span>}
                      </div>
                    </div>
                  </div>

                  <div className="coffee-btn-bottom">
                    <h3 className="coffee-name">{grp.name}</h3>

                    <div className="coffee-members-bar">
                      <span>สัดส่วนสมาชิก:</span>
                      <span>🏛️ 2 นโยบาย • ⚙️ 4 ปฏิบัติการ • 👥 6 ประชาชน</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="hackathon-footer-actions">
            <button
              type="button"
              className="hackathon-btn-prev"
              onClick={() => setCurrentStep(1)}
            >
              <ArrowLeft size={16} />
              <span>ย้อนกลับ</span>
            </button>

            <button type="button" className="hackathon-btn-next" onClick={handleStep2Next}>
              <span>ถัดไป: ผลวิจัยคุณธรรม 5 ด้าน</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* =================================================================
          STEP 3: RESEARCH FINDINGS, CHALLENGE STATEMENT & PROBLEM BANK
          (SEPARATED INTO 3 DEDICATED INDEPENDENT ZONES - NO OVERLAPPING)
          ================================================================= */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* =================================================================
              ZONE 1: ผลการวิจัยสถานการณ์คุณธรรม 5 ด้าน และจุดอ่อนเชิงพื้นที่
              ================================================================= */}
          <div className="hackathon-content-card" style={{ borderTop: '4px solid #2563eb' }}>
            <div className="hackathon-section-header">
              <div className="hackathon-section-title-wrap">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="hackathon-step-tag">ขั้นตอนที่ 3 / 5</span>
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'Kanit, sans-serif',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    🧭 โซนที่ 1: ผลวิจัยเชิงประจักษ์
                  </span>
                </div>
                <h2 className="hackathon-section-title" style={{ marginTop: '6px' }}>
                  ผลการวิจัยสถานการณ์คุณธรรม 5 ด้าน และจุดอ่อนเชิงพื้นที่
                </h2>
                <p className="hackathon-section-desc">
                  งานวิจัยเชิงประจักษ์ของศูนย์คุณธรรมถูกนำมาเป็นตัวตั้ง เพื่อให้ทั้ง 3 ทีมมองเห็นโจทย์ปัญหาที่แท้จริง
                </p>
              </div>
            </div>

          {/* Research Scope Label (Rayong = Provincial, Others = Regional) */}
          <div className="research-scope-banner">
            <div className="research-scope-text">
              📌 <strong>ขอบเขตข้อมูลวิจัย:</strong> {research.scopeLabel}
            </div>
            <span
              style={{
                background: research.scopeType === 'provincial' ? '#dbeafe' : '#fef3c7',
                color: research.scopeType === 'provincial' ? '#1e40af' : '#92400e',
                padding: '4px 12px',
                borderRadius: '999px',
                fontFamily: 'Kanit, sans-serif',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              {research.scopeType === 'provincial' ? `📊 วิจัยเฉพาะจังหวัด${province}` : '🌐 วิจัยภาพรวมภูมิภาค'}
            </span>
          </div>

          {/* 5 Moral Power Cards */}
          <div className="moral-power-cards-grid">
            {research.powers.map((p) => {
              const isWeakness = selectedWeaknessVirtues.some((w) => p.name.includes(w));
              const pct = (p.score / 5.0) * 100;

              return (
                <div
                  key={p.key}
                  className={`moral-power-card ${isWeakness ? 'is-weakness' : ''}`}
                  onClick={() => handleToggleStep3Weakness(p.name)}
                  role="button"
                  tabIndex={0}
                  style={{
                    minHeight: '140px',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  title={`คลิกเพื่อ${isWeakness ? 'ยกเลิก' : 'เลือก'}ด้าน ${p.name} เป็นคุณธรรมจุดอ่อนสำหรับขั้นตอนที่ 4`}
                >
                  <div className="moral-power-top">
                    <span className="moral-power-icon">{p.icon}</span>
                    <span className="moral-power-score">{p.score.toFixed(2)}</span>
                  </div>

                  <h4 className="moral-power-title">{p.name}</h4>

                  <div className="moral-power-bar-wrap">
                    <div
                      className="moral-power-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    เกณฑ์เฉลี่ยชาติ: {p.nationalAvg.toFixed(2)}
                  </div>

                  {isWeakness && (
                    <span
                      style={{
                        background: '#fee2e2',
                        color: '#b91c1c',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textAlign: 'center',
                        marginTop: 'auto',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>⚠️ จุดอ่อนเชิงพื้นที่</span>
                      <CheckCircle2 size={12} color="#b91c1c" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Weakness Detection Callout */}
          <div className="weakness-callout-box" style={{ alignItems: 'center' }}>
            <div className="weakness-callout-icon">⚠️</div>
            <div className="weakness-callout-text">
              <h3 className="weakness-callout-title" style={{ margin: 0, fontSize: '15.5px' }}>
                จุดอ่อนเชิงพื้นที่: ด้าน {selectedWeaknessVirtues.map((v) => `"${v}"`).join(' และ ')} {(province === 'อยุธยา' || province === 'ระยอง') && selectedWeaknessVirtues.length === 2 ? '(คะแนน 4.32 และ 4.34 ต่ำสุดใน 5 ด้านของภาคกลาง)' : '(คะแนนต่ำสุดตามผลวิจัย)'}
              </h3>
            </div>
          </div>
        </div>

        {/* =================================================================
            ZONE 2: โจทย์ความท้าทายกิจกรรม:
            ================================================================= */}
        <div
          className="hackathon-content-card"
          style={{
            borderTop: '4px solid #059669',
            borderLeft: '6px solid #059669',
            background: 'linear-gradient(180deg, #ffffff 0%, #fbfdfc 100%)',
            boxShadow: '0 4px 20px rgba(5, 150, 105, 0.08)'
          }}
        >
          {/* Header Title & Badges */}
          <div className="hackathon-section-header" style={{ borderBottomColor: '#ecfdf5' }}>
            <div className="hackathon-section-title-wrap">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'Kanit, sans-serif',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  🎯 โซนที่ 2: โจทย์ความท้าทาย
                </span>
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'Kanit, sans-serif'
                  }}
                >
                  ✨ ส่งต่อไปใช้ใน Prompt AI ขั้นตอนที่ 4
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <span style={{ fontSize: '26px' }}>🎯</span>
                <h2 className="hackathon-section-title" style={{ margin: 0 }}>
                  โจทย์ความท้าทายกิจกรรม:
                </h2>
              </div>
              <p className="hackathon-section-desc">
                สามารถพิมพ์ปรับแต่งโจทย์เอง หรือกดเลือกจากชุดโจทย์ปัญหาสังคมประจำจังหวัดด้านล่าง
              </p>
            </div>
          </div>

            {/* Universal Text Input Row (+30% bigger font & padding) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  id="hackathon-challenge-admin-input"
                  type="text"
                  className="hackathon-challenge-input"
                  value={hackathonChallenge}
                  onChange={(e) => setHackathonChallenge(e.target.value)}
                  placeholder="พิมพ์โจทย์ความท้าทาย หรือกดเลือกประเด็นปัญหาประจำจังหวัดจากชุดปุ่มด้านล่าง"
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    fontSize: '19px',
                    fontFamily: 'Kanit, sans-serif',
                    color: '#0f172a',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    outline: 'none',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setHackathonChallenge(defaultChallenge);
                    const defaultVirtues = (selectedWeaknessVirtues.length > 0 ? selectedWeaknessVirtues : defaultStep3Weaknesses).map(normalizeVirtueName);
                    setSelectedCriteriaVirtues(defaultVirtues);
                    setPropTargetVirtue(defaultVirtues[0] || 'พอเพียง');
                    saveSelectedCriteriaVirtues(province, defaultVirtues, research.weaknessVirtue);
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem(`pilot_criteria_source_challenge_${province}`);
                      localStorage.setItem(`pilot_criteria_virtues_${province}`, JSON.stringify(defaultVirtues));
                    }
                    setChallengeSelectFeedback('🔄 รีเซ็ตโจทย์กลับเป็นค่าเริ่มต้นตามจุดอ่อนผลวิจัยเรียบร้อย');
                    setTimeout(() => setChallengeSelectFeedback(null), 3500);
                  }}
                  title="รีเซ็ตโจทย์กลับเป็นค่าเริ่มต้นตามจุดอ่อนวิจัย"
                  style={{
                    padding: '14px 20px',
                    fontSize: '16px',
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 700,
                    color: '#334155',
                    background: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <RotateCcw size={17} />
                  <span>รีเซ็ตโจทย์</span>
                </button>
              </div>

              {/* Toast Feedback Banner */}
              {challengeSelectFeedback && (
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontSize: '17px',
                    fontFamily: 'Kanit, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <CheckCircle2 size={20} color="#059669" />
                  <span>{challengeSelectFeedback}</span>
                </div>
              )}

              <div style={{ fontSize: '15.5px', color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                <span>
                  ข้อความโจทย์ในช่องนี้จะถูกส่งไปในการประมวลผลของ AI เพื่อประเมินโครงการในขั้นตอนถัดไป
                </span>
              </div>
            </div>
          </div>

          {/* =================================================================
              ZONE 3: คลังปัญหา (PROVINCIAL PROBLEM BANK)
              ================================================================= */}
          <div
            className="hackathon-content-card"
            style={{
              borderTop: '4px solid #1d4ed8',
              borderLeft: '6px solid #1d4ed8',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)'
            }}
          >
            {/* Zone 3 Header */}
            <div className="hackathon-section-header" style={{ borderBottomColor: '#eff6ff' }}>
              <div className="hackathon-section-title-wrap">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'Kanit, sans-serif',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    🏛️ โซนที่ 3: คลังปัญหาสังคมเชิงพื้นที่
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#1d4ed8',
                      background: '#dbeafe',
                      border: '1px solid #bfdbfe',
                      padding: '3px 10px',
                      borderRadius: '999px'
                    }}
                  >
                    ชุดโจทย์ปัญหา 4 จังหวัด
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <span style={{ fontSize: '26px' }}>🏛️</span>
                  <h2 className="hackathon-section-title" style={{ margin: 0 }}>
                    คลังปัญหา
                  </h2>
                </div>
                <p className="hackathon-section-desc">
                  ชุดโจทย์ปัญหาสังคมประจำจังหวัด • คลิกเลือกประเด็นเพื่อนำไปใส่ในโจทย์ความท้าทายในโซนที่ 2 ด้านบน
                </p>
              </div>
              <span style={{ fontSize: '13.5px', color: '#475569', fontWeight: 500, background: '#f8fafc', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                👆 คลิกที่การ์ดปัญหาเพื่อนำข้อความไปใส่ในช่องโจทย์ด้านบนทันที
              </span>
            </div>

              {/* Region Filter Tabs & Province Selector (ครบทั้ง 77 จังหวัด) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 6 Region Filter Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
                    <Layers size={14} color="#2563eb" />
                    <span>ภูมิภาค:</span>
                  </span>
                  {REGION_TABS.map((reg) => {
                    const isRegActive = selectedRegionFilter === reg.key;
                    return (
                      <button
                        key={reg.key}
                        type="button"
                        onClick={() => setSelectedRegionFilter(reg.key)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontFamily: 'Kanit, sans-serif',
                          fontSize: '12.5px',
                          fontWeight: isRegActive ? 700 : 500,
                          border: isRegActive ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                          background: isRegActive ? '#eff6ff' : '#ffffff',
                          color: isRegActive ? '#1d4ed8' : '#475569',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {reg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Province Search & Quick Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Search box */}
                  <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 220px', maxWidth: '340px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={provinceSearchQuery}
                      onChange={(e) => setProvinceSearchQuery(e.target.value)}
                      placeholder="พิมพ์ค้นหาจังหวัด (เช่น อยุธยา, เชียงใหม่, ภูเก็ต)..."
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 32px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                        fontFamily: 'Kanit, sans-serif',
                        background: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {provinceSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setProvinceSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8'
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Province Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>เลือกจังหวัด:</span>
                    <select
                      value={selectedChallengeTabProvince}
                      onChange={(e) => setSelectedChallengeTabProvince(e.target.value)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #2563eb',
                        background: '#ffffff',
                        fontFamily: 'Kanit, sans-serif',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#1e3a8a',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {ALL_77_PROVINCE_KEYS.map((pKey) => {
                        const prof = PROVINCIAL_CHALLENGES_PROFILES[pKey];
                        return (
                          <option key={pKey} value={pKey}>
                            {prof.provinceLabel} ({prof.regionLabel.split(' ')[0]})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Filtered Province Quick Pills */}
                {(() => {
                  const filteredProvinceKeys = ALL_77_PROVINCE_KEYS.filter((pKey) => {
                    const prof = PROVINCIAL_CHALLENGES_PROFILES[pKey];
                    if (!prof) return false;
                    const matchesRegion = selectedRegionFilter === 'all' || prof.regionKey === selectedRegionFilter;
                    const query = provinceSearchQuery.trim();
                    const matchesQuery = !query ||
                      prof.provinceLabel.includes(query) ||
                      prof.provinceKey.includes(query) ||
                      prof.aliases.some(a => a.includes(query));
                    return matchesRegion && matchesQuery;
                  });

                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', maxHeight: '110px', overflowY: 'auto', padding: '4px 0' }}>
                      {filteredProvinceKeys.map((pKey) => {
                        const prof = PROVINCIAL_CHALLENGES_PROFILES[pKey];
                        const isSelected = selectedChallengeTabProvince === pKey;
                        const isCurrentProvince =
                          (province as string) === pKey ||
                          (pKey === 'พระนครศรีอยุธยา' && ((province as string) === 'อยุธยา' || (province as string) === 'พระนครศรีอยุธยา'));

                        return (
                          <button
                            key={pKey}
                            type="button"
                            onClick={() => setSelectedChallengeTabProvince(pKey)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '999px',
                              fontFamily: 'Kanit, sans-serif',
                              fontSize: '12px',
                              fontWeight: isSelected ? 800 : 500,
                              border: isSelected ? '1.5px solid #1d4ed8' : '1px solid #cbd5e1',
                              background: isSelected ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#334155',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: isSelected ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>{prof.provinceLabel}</span>
                            {isCurrentProvince && (
                              <span
                                style={{
                                  fontSize: '9.5px',
                                  background: isSelected ? '#1e40af' : '#e0f2fe',
                                  color: isSelected ? '#bfdbfe' : '#0369a1',
                                  padding: '1px 6px',
                                  borderRadius: '999px',
                                  fontWeight: 700
                                }}
                              >
                                พื้นที่ปัจจุบัน
                              </span>
                            )}
                          </button>
                        );
                      })}
                      {filteredProvinceKeys.length === 0 && (
                        <span style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic', padding: '4px 8px' }}>
                          ไม่พบจังหวัดที่ตรงกับการค้นหา
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Active Province Context Overview Box */}
              {(() => {
                const activeProfile = getProvincialChallengeProfile(selectedChallengeTabProvince);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #bfdbfe',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        fontSize: '13px',
                        color: '#334155',
                        lineHeight: 1.6,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>📍</span>
                          <span>{activeProfile.provinceLabel}</span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', background: '#dbeafe', padding: '1px 8px', borderRadius: '999px' }}>
                            {activeProfile.regionLabel}
                          </span>
                        </div>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                          {activeProfile.challenges.length} ประเด็นปัญหาสำคัญ
                        </span>
                      </div>

                      <div style={{ fontSize: '12.5px', color: '#475569', fontStyle: 'italic' }}>
                        {activeProfile.contextHeader}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '4px', fontSize: '12px' }}>
                        <span>
                          <strong style={{ color: '#0f172a' }}>⚙️ ปัจจัยขับเคลื่อน:</strong> {activeProfile.mainDrivers}
                        </span>
                        <span>
                          <strong style={{ color: '#b91c1c' }}>⚠️ ปัญหาสังคมเด่นชัด:</strong> {activeProfile.prominentProblems}
                        </span>
                        <span>
                          <strong style={{ color: '#047857' }}>👥 กลุ่มเปราะบางหลัก:</strong> {activeProfile.vulnerableGroups}
                        </span>
                      </div>
                    </div>

                    {/* Challenge Problem Cards (ไม่มีรูปภาพ, สรุปสั้นๆ ได้ใจความ, มี Reference ชัดเจน) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
                      {activeProfile.challenges.map((item) => {
                        const cleanChallenge = (hackathonChallenge || '').trim();
                        const cleanTitle = (item.title || '').trim();
                        const expectedChallenge = formatChallengeTopicFromProblemTitle(cleanTitle);
                        const isCurrentlyApplied =
                          cleanChallenge === expectedChallenge ||
                          cleanChallenge === cleanTitle ||
                          cleanChallenge === item.suggestedChallenge.trim() ||
                          (cleanChallenge.length >= 10 && cleanChallenge.includes(cleanTitle));

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectProvincialChallenge(item)}
                            style={{
                              background: isCurrentlyApplied ? '#f0fdf4' : '#ffffff',
                              border: isCurrentlyApplied ? '2px solid #16a34a' : '1.5px solid #cbd5e1',
                              borderRadius: '12px',
                              padding: '16px 18px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: isCurrentlyApplied ? '0 6px 18px rgba(22, 163, 74, 0.15)' : '0 2px 6px rgba(0, 0, 0, 0.04)',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {/* Top Bar: Order Pill & Category Tag */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    color: '#1d4ed8',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    padding: '2px 8px',
                                    borderRadius: '6px'
                                  }}
                                >
                                  ประเด็นที่ {item.orderNumber}
                                </span>

                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#065f46',
                                    background: '#ecfdf5',
                                    border: '1px solid #a7f3d0',
                                    padding: '2px 8px',
                                    borderRadius: '6px'
                                  }}
                                >
                                  {item.tagBadge}
                                </span>
                              </div>

                              {/* Problem Title (สั้น กระชับ คมชัด) */}
                              <h4
                                style={{
                                  margin: 0,
                                  fontSize: '14.5px',
                                  fontWeight: 800,
                                  color: '#0f172a',
                                  fontFamily: 'Kanit, sans-serif',
                                  lineHeight: 1.45
                                }}
                              >
                                {item.title}
                              </h4>

                              {/* Problem Summary (สรุปสั้นๆ ได้ใจความ) */}
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: '12.5px',
                                  color: '#475569',
                                  lineHeight: 1.6
                                }}
                              >
                                {item.summary}
                              </p>

                              {/* Target Group */}
                              <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: '#047857', fontWeight: 700 }}>👥 กลุ่มเป้าหมาย:</span>
                                <span>{item.targetGroup}</span>
                              </div>

                              {/* Official Reference Source Link (แหล่งข้อมูลต้นทาง - ตัวที่เลือกต้องมี Reference เท่านั้น) */}
                              <div
                                style={{
                                  marginTop: '6px',
                                  padding: '7px 10px',
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px',
                                  fontSize: '11.5px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', minWidth: 0 }}>
                                  <span style={{ fontSize: '13px' }}>🔗</span>
                                  <span style={{ color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>แหล่งอ้างอิง:</span>
                                  <span
                                    style={{
                                      color: '#0f172a',
                                      fontWeight: 700,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title={item.sourceName}
                                  >
                                    {item.sourceName}
                                  </span>
                                </div>
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    color: '#2563eb',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    textDecoration: 'none',
                                    flexShrink: 0,
                                    padding: '2.5px 8px',
                                    borderRadius: '6px',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title={`เปิดดูข้อมูลต้นทาง: ${item.sourceUrl}`}
                                >
                                  <span>ดูต้นทาง</span>
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                            </div>

                            {/* Action Button: Fill in Challenge */}
                            <div style={{ marginTop: '14px' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectProvincialChallenge(item);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '9px 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: isCurrentlyApplied
                                    ? 'linear-gradient(135deg, #16a34a, #15803d)'
                                    : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                  color: '#ffffff',
                                  fontFamily: 'Kanit, sans-serif',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  boxShadow: isCurrentlyApplied ? '0 2px 8px rgba(22, 163, 74, 0.35)' : '0 2px 8px rgba(37, 99, 235, 0.25)',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {isCurrentlyApplied ? (
                                  <>
                                    <CheckCircle2 size={16} />
                                    <span>✓ ใช้งานโจทย์นี้ในโซนที่ 2 เรียบร้อยแล้ว</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={15} />
                                    <span>เลือกโจทย์นี้ส่งไปยังโซนที่ 2 (โจทย์ความท้าทาย) ➔</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
          </div>

          {/* Footer Actions */}
          <div className="hackathon-footer-actions">
            <button
              type="button"
              className="hackathon-btn-prev"
              onClick={() => setCurrentStep(2)}
            >
              <ArrowLeft size={16} />
              <span>ย้อนกลับ</span>
            </button>

            <button type="button" className="hackathon-btn-next" onClick={handleStep3Next}>
              <span>ถัดไป: ทำ Hackathon โครงการคุณธรรม</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* =================================================================
          STEP 4: HACKATHON WORKSPACE (AI Ideation Helper + Proposal Form)
          ================================================================= */}
      {currentStep === 4 && (
        <div className="hackathon-content-card">
          <div className="hackathon-section-header" style={{ alignItems: 'center' }}>
            <div className="hackathon-section-title-wrap" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span className="hackathon-step-tag">ขั้นตอนที่ 4 / 5</span>
              <h2 className="hackathon-section-title" style={{ margin: 0 }}>การทำ Hackathon โครงการกิจกรรมคุณธรรม</h2>
            </div>

            {/* Action Buttons: ตั้งค่าระบบ (ตารางฐานข้อมูล / Reset / Admin) & สร้างเกณฑ์การตัดสิน & แสดงเกณฑ์การตัดสิน */}
            <div className="hackathon-criteria-action-bar" style={{ marginTop: 0, marginLeft: 'auto' }}>
              {isAdmin && onNavigateToSettings && (
                <button
                  type="button"
                  className="btn-setting-nav"
                  onClick={onNavigateToSettings}
                  title="ไปที่หน้าตั้งค่าระบบ (ตารางฐานข้อมูล, Reset ฐานข้อมูล และสิทธิ์ Admin)"
                >
                  <Settings size={16} />
                  <span>ตั้งค่า</span>
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  className="btn-create-criteria"
                  onClick={() => setIsCriteriaGeneratorOpen(true)}
                  title="สร้างเกณฑ์การตัดสินโครงการด้วย AI Agent Skill (เฉพาะ Admin)"
                >
                  <Sparkles size={18} />
                  <span>สร้างเกณฑ์การตัดสิน</span>
                </button>
              )}
              <button
                type="button"
                className="btn-view-criteria"
                onClick={() => setIsCriteriaViewerOpen(true)}
                title="แสดงตารางเกณฑ์การตัดสิน (Rubric 1-100 คะแนน) ล่าสุดจากระบบ PostgreSQL (DB-MDC)"
              >
                <TableProperties size={18} color="#7c3aed" />
                <span>แสดงเกณฑ์การตัดสิน</span>
                {latestCriteriaRecord && <span className="criteria-ready-dot" title="มีเกณฑ์การตัดสินที่บันทึกแล้ว" />}
              </button>
            </div>
          </div>

          {isDbExplorerOpen ? (
            <div className="db-explorer-view-wrapper">
              {/* Explorer Top Toolbar */}
              <div className="db-explorer-top-bar">
                <button
                  type="button"
                  className="btn-db-back"
                  onClick={() => setIsDbExplorerOpen(false)}
                  title="คลิกเพื่อย้อนกลับไปหน้าโครงการ Hackathon"
                >
                  <ArrowLeft size={18} />
                  <span>ย้อนกลับไปหน้าเดิม (โครงการ Hackathon)</span>
                </button>

                <div className="db-explorer-heading-box">
                  <h3 className="db-explorer-title">
                    <Database size={20} color="#2563eb" />
                    <span>ตารางฐานข้อมูลทั้งหมดในระบบ (PostgreSQL (DB-MDC) Explorer)</span>
                  </h3>
                  <span className="db-explorer-subtitle">
                    ฐานข้อมูล: <code>PostgreSQL 16 (DB-MDC)</code> (ทั้งหมด {dbTables.length} ตาราง)
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-db-refresh"
                  onClick={() => handleOpenDbExplorer()}
                  disabled={isLoadingDbTables || isLoadingTableData}
                  title="โหลดข้อมูลตารางใหม่จากฐานข้อมูล PostgreSQL (DB-MDC)"
                >
                  <RefreshCw size={16} className={isLoadingDbTables || isLoadingTableData ? 'spin-animation' : ''} />
                  <span>รีเฟรชข้อมูล</span>
                </button>
              </div>

              {/* Category Filter Buttons Bar (ด้านบนของส่วนเลือกตาราง) */}
              <div className="db-category-filter-bar">
                <div className="db-category-filter-header">
                  <div className="db-category-filter-title">
                    <Layers size={16} color="#0f172a" />
                    <span>หมวดหมู่ระบบ / แหล่งข้อมูล (Category Filter):</span>
                  </div>
                  <span className="db-category-filter-count">
                    {activeDbCategory === 'all'
                      ? `ทั้งหมด ${dbTables.length} ตาราง`
                      : `หมวด ${DB_CATEGORIES.find((c) => c.key === activeDbCategory)?.label || ''} (${filteredDbTables.length} ตาราง)`}
                  </span>
                </div>

                <div className="db-category-btn-group">
                  {DB_CATEGORIES.map((cat) => {
                    const count =
                      cat.key === 'all'
                        ? dbTables.length
                        : dbTables.filter((t) => t.category === cat.key).length;
                    const isActive = activeDbCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        className={`db-category-btn cat-${cat.key} ${isActive ? 'is-active' : ''}`}
                        onClick={() => handleSelectCategory(cat.key)}
                        title={cat.description}
                      >
                        {renderCategoryIcon(cat.iconName)}
                        <span className="db-category-btn-label">{cat.label}</span>
                        <span className="db-category-btn-badge">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Table Selector Tabs */}
              <div className="db-explorer-table-tabs">
                <div className="db-tabs-label">
                  <div className="db-tabs-label-left">
                    <TableProperties size={15} color="#475569" />
                    <span>เลือกตารางที่ต้องการดูข้อมูล:</span>
                  </div>
                  <span className="db-tabs-sub-badge">
                    {filteredDbTables.length} ตารางในหมวดนี้
                  </span>
                </div>
                <div className="db-tabs-scroll">
                  {isLoadingDbTables && dbTables.length === 0 ? (
                    <div className="db-tab-loading">กำลังโหลดรายชื่อตาราง...</div>
                  ) : filteredDbTables.length === 0 ? (
                    <div className="db-tab-empty-hint">ไม่พบตารางในหมวดหมู่นี้</div>
                  ) : (
                    filteredDbTables.map((tbl) => (
                      <button
                        key={tbl.name}
                        type="button"
                        className={`db-tab-chip ${selectedDbTable === tbl.name ? 'is-active' : ''}`}
                        onClick={() => handleLoadTableData(tbl.name)}
                        title={`${tbl.displayName} (${tbl.rowCount} แถว)`}
                      >
                        <div className="db-tab-chip-top">
                          <span className={`db-tab-source-badge db-tab-source-${tbl.sourceType}`}>
                            {tbl.sourceType.toUpperCase()}
                          </span>
                          <span className="db-tab-count-badge">{tbl.rowCount} แถว</span>
                        </div>
                        <span className="db-tab-name">{tbl.name}</span>
                        <span className="db-tab-desc-text" title={tbl.displayName}>
                          {tbl.displayName}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Table Data Viewer Section */}
              <div className="db-table-viewer-panel">
                <div className="db-viewer-header">
                  <div className="db-viewer-meta">
                    <span className="db-current-table-badge">
                      ตาราง: <strong>{selectedDbTable}</strong>
                    </span>
                    {currentTableMeta && (
                      <>
                        <span className="db-category-pill-tag">
                          {currentTableMeta.systemName}
                        </span>
                        <span className="db-display-name-pill" title={currentTableMeta.displayName}>
                          {currentTableMeta.displayName}
                        </span>
                      </>
                    )}
                    <span className="db-meta-badge">
                      จำนวนคอลัมน์: <strong>{selectedTableData?.columns.length || 0}</strong>
                    </span>
                    <span className="db-meta-badge">
                      จำนวนแถวทั้งหมด: <strong>{selectedTableData?.rowCount || 0}</strong>
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div className="db-viewer-search-box">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      className="db-viewer-search-input"
                      placeholder={`ค้นหาข้อมูลในตาราง ${selectedDbTable}...`}
                      value={dbTableSearchQuery}
                      onChange={(e) => setDbTableSearchQuery(e.target.value)}
                    />
                    {dbTableSearchQuery && (
                      <button
                        type="button"
                        className="db-search-clear-btn"
                        onClick={() => setDbTableSearchQuery('')}
                        title="ล้างคำค้นหา"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Table Data Grid */}
                {isLoadingTableData ? (
                  <div className="db-table-loading-state">
                    <RefreshCw size={28} className="spin-animation" color="#2563eb" />
                    <span>กำลังโหลดข้อมูลในตาราง {selectedDbTable}...</span>
                  </div>
                ) : !selectedTableData || selectedTableData.rows.length === 0 ? (
                  <div className="db-table-empty-state">
                    <Database size={40} color="#94a3b8" />
                    <h4>ไม่พบข้อมูลในตาราง {selectedDbTable}</h4>
                    <p>ตารางนี้ยังไม่มีแถวข้อมูลที่บันทึกไว้ในฐานข้อมูล PostgreSQL (DB-MDC)</p>
                  </div>
                ) : (
                  (() => {
                    const query = dbTableSearchQuery.trim().toLowerCase();
                    const filteredRows = query
                      ? selectedTableData.rows.filter((row) =>
                          Object.values(row).some((val) =>
                            String(val ?? '').toLowerCase().includes(query)
                          )
                        )
                      : selectedTableData.rows;

                    return (
                      <div className="db-data-grid-container">
                        <table className="db-data-grid-table">
                          <thead>
                            <tr>
                              <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                              {selectedTableData.columns.map((col) => (
                                <th key={col.name} className={col.pk === 1 ? 'is-pk' : ''}>
                                  <div className="db-th-wrap">
                                    <span className="db-col-name">{col.name}</span>
                                    <div className="db-col-badges">
                                      <span className="db-type-badge">{col.type || 'TEXT'}</span>
                                      {col.pk === 1 && <span className="db-pk-badge" title="Primary Key">🔑 PK</span>}
                                    </div>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRows.length === 0 ? (
                              <tr>
                                <td colSpan={selectedTableData.columns.length + 1} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                                  ไม่พบข้อมูลแถวที่ตรงกับคำค้นหา "{dbTableSearchQuery}"
                                </td>
                              </tr>
                            ) : (
                              filteredRows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  <td className="db-row-number">{rIdx + 1}</td>
                                  {selectedTableData.columns.map((col) => {
                                    const val = row[col.name];
                                    const isNull = val === null || val === undefined;
                                    const valStr = isNull ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
                                    const isJson = !isNull && typeof val === 'string' && (val.startsWith('{') || val.startsWith('['));

                                    if (col.name === 'is_precheck' && !isNull) {
                                      const isPre = Number(val) === 1 || val === true || val === '1';
                                      return (
                                        <td key={col.name} className="db-cell">
                                          <span
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              padding: '3px 8px',
                                              borderRadius: '6px',
                                              fontSize: '11.5px',
                                              fontWeight: 700,
                                              background: isPre ? '#eff6ff' : '#ecfdf5',
                                              color: isPre ? '#2563eb' : '#059669',
                                              border: isPre ? '1px solid #bfdbfe' : '1px solid #a7f3d0'
                                            }}
                                          >
                                            {isPre ? '🔍 ตรวจสอบคะแนน (Pre-check)' : '🚀 ส่งโครงการ (Submit)'}
                                          </span>
                                        </td>
                                      );
                                    }

                                    return (
                                      <td key={col.name} className="db-cell">
                                        {isNull ? (
                                          <span className="db-null-pill">NULL</span>
                                        ) : isJson ? (
                                          <div className="db-json-cell">
                                            <span className="db-json-indicator">JSON</span>
                                            <span className="db-cell-text" title={valStr}>{valStr}</span>
                                          </div>
                                        ) : (
                                          <span className="db-cell-text" title={valStr}>{valStr}</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()
                )}

                {/* Footer with Back Button */}
                <div className="db-explorer-footer-bar">
                  <span className="db-footer-info">
                    แสดง {selectedTableData?.rows.length || 0} แถวในตาราง <code>{selectedDbTable}</code>
                  </span>
                  <button
                    type="button"
                    className="btn-db-back-large"
                    onClick={() => setIsDbExplorerOpen(false)}
                    title="คลิกเพื่อย้อนกลับไปหน้าโครงการ Hackathon"
                  >
                    <ArrowLeft size={18} />
                    <span>ย้อนกลับไปหน้าเดิม (โครงการ Hackathon)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* =================================================================
                  TOP HERO BANNER: HACKATHON CHALLENGE TOPIC (หัวข้อโจทย์ Hackathon ตัวใหญ่)
                  ================================================================= */}
              <div className="hackathon-challenge-hero-banner">
                <div className="challenge-hero-badge-row">
                  <span className="challenge-hero-pill">
                    <Target size={16} />
                    <span>หัวข้อในการ Hackathon ประจำจังหวัด{province}</span>
                  </span>
                  <span className="challenge-hero-virtue-pill" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                    🎯 เกณฑ์ตัดสิน: Rubric 4 เสาหลักแก้โจทย์พื้นที่ (100 คะแนนเต็ม)
                  </span>
                </div>

                <h1 className="challenge-hero-topic-title">
                  {hackathonChallenge || defaultChallenge}
                </h1>

                <div className="challenge-hero-meta-row">
                  <span className="challenge-hero-subtext">
                    💡 ให้คิดโครงการที่สามารถปรับเปลี่ยนพฤติกรรมเพื่อแก้ปัญหาของโจทย์ที่ได้รับ
                  </span>
                </div>
              </div>

              {/* ส่วนที่ 1: ให้ AI ช่วยคิด (AI Ideation Helper) */}
              <div className="hackathon-ai-box">
            <div className="hackathon-ai-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div className="hackathon-ai-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles
                  size={24}
                  color={isAiGenerating ? '#0284c7' : '#059669'}
                  className={isAiGenerating ? 'ai-icon-spinning' : ''}
                  style={isAiGenerating ? {
                    animation: 'aiSpinPulse 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                    display: 'inline-block',
                    transformOrigin: 'center'
                  } : { display: 'inline-block' }}
                />
                <span>ส่วนที่ 1: ให้ AI ช่วยคิดโครงการ</span>
                {isAiGenerating && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '2px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    <Loader2
                      size={13}
                      className="spin-animation"
                      style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block', transformOrigin: 'center' }}
                    />
                    <span>กำลังคิดค้นโครงการ...</span>
                  </span>
                )}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  color: '#166534',
                  padding: '3px 12px',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: 700
                }}
                title={`จังหวัดเป้าหมายของโจทย์ปัญหา: จ.${effectiveProvince}`}
              >
                <span>📍 จังหวัดของปัญหา: <strong>จ.{effectiveProvince}</strong></span>
              </div>
            </div>

            {/* Quick Prompt Chips (แสดง 2 ปุ่มตัวอย่าง) */}
            <div className="hackathon-quick-chips">
              <span style={{ fontSize: '16px', color: '#065f46', fontWeight: 700 }}>
                คีย์เวิร์ดแนะนำ:
              </span>
              <button
                type="button"
                className={`hackathon-chip-btn ${aiPromptInput.includes('ลดขยะและสร้างวินัยการออม') ? 'active' : ''}`}
                onClick={() => {
                  setAiPromptInput('อยากได้โครงการลดขยะและสร้างวินัยการออมในโรงงานอุตสาหกรรมและชุมชน');
                  const el = document.getElementById('hackathon-ai-prompt-textarea');
                  if (el) el.focus();
                }}
                title="คลิกเพื่อนำข้อความใส่ลงใน Prompt (ยังไม่ส่งให้ AI)"
              >
                ลดขยะ & วินัยการออม
              </button>
              <button
                type="button"
                className={`hackathon-chip-btn ${aiPromptInput.includes('จิตอาสาดูแลผู้สูงอายุ') ? 'active' : ''}`}
                onClick={() => {
                  setAiPromptInput('อยากได้โครงการจิตอาสาดูแลผู้สูงอายุติดเตียงร่วมกับ รพ.สต. และเยาวชน');
                  const el = document.getElementById('hackathon-ai-prompt-textarea');
                  if (el) el.focus();
                }}
                title="คลิกเพื่อนำข้อความใส่ลงใน Prompt (ยังไม่ส่งให้ AI)"
              >
                จิตอาสาดูแลผู้สูงวัย
              </button>
              <button
                type="button"
                className={`hackathon-chip-btn ${aiPromptInput.includes('Startup') || aiPromptInput.includes('สตาร์ทอัพ') || aiPromptInput.includes('บ่มเพาะ') ? 'active' : ''}`}
                onClick={() => {
                  setAiPromptInput('อยากได้โครงการการบ่มเพาะ Startup นวัตกรคนรุ่นใหม่สร้างธุรกิจเพื่อสังคม');
                  const el = document.getElementById('hackathon-ai-prompt-textarea');
                  if (el) el.focus();
                }}
                title="คลิกเพื่อนำข้อความใส่ลงใน Prompt (ยังไม่ส่งให้ AI)"
              >
                บ่มเพาะ Startup & นวัตกร
              </button>
            </div>

            {/* Prompt Input */}
            <textarea
              id="hackathon-ai-prompt-textarea"
              className="hackathon-ai-textarea"
              placeholder="พิมพ์ความต้องการของโครงการ เช่น อยากได้โครงการที่ดึงเยาวชนและคนในชุมชนมาร่วมทำกิจกรรมผ่านแอปมือถือเพื่อแก้ปัญหาขยะ..."
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
            />

            <button
              type="button"
              className={`hackathon-ai-trigger-btn ${isAiGenerating ? 'is-generating' : ''}`}
              onClick={() => handleTriggerAiIdeation()}
              disabled={isAiGenerating}
            >
              {isAiGenerating ? (
                <>
                  <Loader2
                    size={22}
                    className="spin-animation"
                    style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block', transformOrigin: 'center' }}
                  />
                  <span>AI กำลังคิดโครงการใหม่ตามบริบท...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>ให้ AI ช่วยคิดโครงการ</span>
                </>
              )}
            </button>

            {/* ส่วนสำหรับ Account Admin เท่านั้น: ปุ่มแสดงข้อความ Prompt ที่ส่งให้ AI และ Output ที่ได้รับ */}
            {isAdmin && activePromptData && (
              <div className="admin-prompt-section-box">
                <div className="admin-prompt-action-bar">
                  <button
                    type="button"
                    className={`btn-admin-prompt-inspect ${isAdminPromptInlineExpanded ? 'is-active' : ''}`}
                    onClick={() => setIsAdminPromptInlineExpanded(!isAdminPromptInlineExpanded)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Terminal size={17} color="#a855f7" />
                      <span style={{ fontWeight: 700 }}>
                        {isAdminPromptInlineExpanded
                          ? 'ซ่อนข้อความ Prompt & Output ที่ส่งให้ AI'
                          : 'ดูข้อความ Prompt & Output ที่ส่งให้ AI'}
                      </span>
                      <span className="admin-only-badge">
                        <Lock size={11} /> เฉพาะ Admin
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="admin-prompt-time-chip">
                        {activePromptData.timestamp}
                      </span>
                      <span className="admin-expand-indicator">
                        {isAdminPromptInlineExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn-admin-prompt-modal-open"
                    onClick={() => setIsAdminPromptModalOpen(true)}
                    title="เปิดดูแบบหน้าต่างเต็ม (Full Modal View)"
                  >
                    <ExternalLink size={14} />
                    <span>ขยายเต็มจอ</span>
                  </button>
                </div>

                {/* เมื่อกด มันจะแสดง prompt ทั้งหมดที่ส่งให้ AI และแสดงส่วนของ output ที่ ได้จาก AI มา ด้านล่าง */}
                {isAdminPromptInlineExpanded && (
                  <div className="admin-prompt-display-panel">
                    <div className="admin-prompt-display-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <Code2 size={18} color="#8b5cf6" />
                        <span style={{ fontWeight: 800, fontSize: '15px', color: '#1e293b' }}>
                          ศูนย์ตรวจสอบคำสั่ง AI และผลลัพธ์ (Admin Prompt & Output Inspector)
                        </span>
                        <span className="admin-model-badge">
                          โมเดล: {activePromptData.modelName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="admin-mini-copy-btn"
                          onClick={() => handleCopyText(activePromptData.promptPayload || '', 'all-prompt')}
                        >
                          {copiedPromptKey === 'all-prompt' ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                          <span>{copiedPromptKey === 'all-prompt' ? 'คัดลอก Prompt แล้ว!' : 'คัดลอก Prompt ทั้งหมด'}</span>
                        </button>
                        <button
                          type="button"
                          className="admin-mini-copy-btn"
                          onClick={() => handleCopyText(activePromptData.rawJsonOutput || '', 'raw-json')}
                        >
                          {copiedPromptKey === 'raw-json' ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                          <span>{copiedPromptKey === 'raw-json' ? 'คัดลอก JSON แล้ว!' : 'คัดลอก Raw JSON'}</span>
                        </button>
                      </div>
                    </div>

                    {/* ส่วนที่ 1: Prompt ทั้งหมดที่ส่งให้ AI */}
                    <div className="admin-prompt-block-section">
                      <div className="admin-block-section-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="admin-section-num-pill">1</span>
                          <strong>Prompt ทั้งหมดที่ส่งให้ AI (AI System Prompt & Input Context)</strong>
                        </div>
                        <span className="admin-section-length-badge">
                          {(activePromptData.promptPayload || '').length.toLocaleString()} ตัวอักษร
                        </span>
                      </div>
                      <div className="admin-code-block-container">
                        <pre className="admin-code-block-pre">
                          {activePromptData.promptPayload || 'ไม่มีข้อความ Prompt'}
                        </pre>
                      </div>
                    </div>

                    {/* ส่วนที่ 2: Output ที่ได้จาก AI มาด้านล่าง */}
                    <div className="admin-output-block-section">
                      <div className="admin-block-section-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="admin-section-num-pill output">2</span>
                          <strong>Output ที่ได้จาก AI มาด้านล่าง (AI Response & Project Structure)</strong>
                        </div>
                        <button
                          type="button"
                          className="admin-mini-copy-btn"
                          onClick={() => handleCopyText(activePromptData.outputPayload || '', 'all-output')}
                        >
                          {copiedPromptKey === 'all-output' ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                          <span>{copiedPromptKey === 'all-output' ? 'คัดลอก Output แล้ว!' : 'คัดลอก Output ทั้งหมด'}</span>
                        </button>
                      </div>

                      {/* สรุปโครงสร้างผลลัพธ์โครงการ */}
                      <div className="admin-output-summary-cards">
                        <div className="admin-summary-card-item">
                          <span className="card-item-label">📌 ชื่อโครงการที่สังเคราะห์ได้:</span>
                          <strong className="card-item-val highlight">{activePromptData.projectName || '-'}</strong>
                        </div>
                        <div className="admin-summary-card-grid-2">
                          <div className="admin-summary-card-item">
                            <span className="card-item-label">🎯 มิติคุณธรรมเป้าหมาย:</span>
                            <span className="card-item-val badge-virtue">{activePromptData.targetMoralVirtue || '-'}</span>
                          </div>
                          <div className="admin-summary-card-item">
                            <span className="card-item-label">📍 พื้นที่ดำเนินงาน:</span>
                            <span className="card-item-val">{activePromptData.targetArea || '-'}</span>
                          </div>
                        </div>
                        <div className="admin-summary-card-item">
                          <span className="card-item-label">👥 กลุ่มเป้าหมาย:</span>
                          <span className="card-item-val">{activePromptData.targetAudience || '-'}</span>
                        </div>
                        <div className="admin-summary-card-item">
                          <span className="card-item-label">💡 หลักการนวัตกรรมและกิจกรรมพฤติกรรมศาสตร์:</span>
                          <span className="card-item-val text-desc">{activePromptData.proposalDetails || '-'}</span>
                        </div>
                        <div className="admin-summary-card-item">
                          <span className="card-item-label">🗺️ แผนปฏิบัติการขับเคลื่อน 3 ระดับ:</span>
                          <div className="card-item-val plan-box">{activePromptData.activityPlan || '-'}</div>
                        </div>
                        <div className="admin-summary-card-item">
                          <span className="card-item-label">📊 ผลลัพธ์ที่คาดหวัง:</span>
                          <span className="card-item-val">{activePromptData.behavioralKpi || '-'}</span>
                        </div>
                      </div>

                      {/* Raw JSON Code Block */}
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                          📦 โครงสร้าง Raw JSON จาก AI:
                        </div>
                        <div className="admin-code-block-container">
                          <pre className="admin-code-block-pre json">
                            {activePromptData.rawJsonOutput || '{}'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ส่วนที่ 2: ข้อมูลโครงการ (Structured Proposal Form) */}
          <form className="hackathon-proposal-form" id="hackathon-proposal-form-section-2" onSubmit={handleStep4Submit}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontFamily: 'Kanit, sans-serif', fontSize: '23.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                ส่วนที่ 2: ข้อมูลโครงการ
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '999px', fontWeight: 700 }}>
                  📍 จังหวัดของปัญหา: จ.{effectiveProvince}
                </span>
                <span style={{ fontSize: '15.5px', color: '#64748b' }}>
                  กลุ่ม: <strong>{coffeeGroups.find((g) => g.key === selectedGroup)?.name || selectedGroup}</strong>
                </span>
                {step4AutoSavedTime && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#059669',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: '3px 9px',
                      borderRadius: '999px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="ระบบทำการบันทึกแบบร่างโครงการในเครื่องของคุณอัตโนมัติ"
                  >
                    <span>💾 ร่างอัตโนมัติ ({step4AutoSavedTime})</span>
                  </span>
                )}
                <button
                  type="button"
                  className="btn-clear-section2-form"
                  onClick={() => handleClearSection2Form(false)}
                  title="ล้างข้อมูลในฟอร์มส่วนที่ 2 ให้กลับเป็นค่าว่างเริ่มต้น"
                >
                  <RotateCcw size={13} />
                  <span>ล้างฟอร์ม</span>
                </button>
              </div>
            </div>

            {/* แจ้งเตือนกรณีตรวจพบว่าชื่อ-นามสกุลเคยส่งโครงการแล้ว (จำกัดสิทธิ์ 1 คนต่อ 1 โครงการ) */}
            {(() => {
              const dupCheck = checkDuplicateSubmitter(regFirstName, regLastName, allProjects);
              if (dupCheck.isDuplicate && dupCheck.existingProject) {
                return (
                  <div
                    id="duplicate-submitter-warning-banner"
                    style={{
                      backgroundColor: '#fef2f2',
                      border: '2px solid #ef4444',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      color: '#991b1b',
                      marginTop: '12px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      animation: 'fadeIn 0.25s ease-out'
                    }}
                  >
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>⛔</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15.5px', fontWeight: 800 }}>
                        คุณ {regFirstName} {regLastName} ได้เคยส่งโครงการแล้วในระบบ
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '4px', color: '#b91c1c', lineHeight: 1.5 }}>
                        โครงการที่เคยส่ง: <strong>"{dupCheck.existingProject.projectName}"</strong> (คะแนน: {dupCheck.existingProject.aiScore} คะแนน)
                        <br />
                        🔒 <strong>กติกาการแข่งขัน:</strong> แต่ละคนส่งได้แค่หนึ่งโครงการถ้าส่งแล้วส่งอีกไม่ได้
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* แถบข้อมูลผู้เสนอโครงการ (field ชื่อ และ field นามสกุล) */}
            <div
              className="submitter-identity-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px 16px',
                marginTop: '12px',
                marginBottom: '14px',
                fontSize: '13.5px',
                color: '#334155'
              }}
            >
              <span style={{ fontWeight: 700, color: '#1e293b' }}>👤 ผู้เสนอโครงการ:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  id="hackathon-prop-first-name"
                  type="text"
                  className="reg-form-input"
                  style={{ padding: '4px 10px', fontSize: '13px', width: '130px', height: '32px' }}
                  placeholder="ชื่อ"
                  value={regFirstName}
                  onChange={(e) => handleFirstNameChange(e.target.value)}
                  title="ชื่อผู้เสนอโครงการ (field ชื่อ)"
                  required
                />
                <input
                  id="hackathon-prop-last-name"
                  type="text"
                  className="reg-form-input"
                  style={{ padding: '4px 10px', fontSize: '13px', width: '130px', height: '32px' }}
                  placeholder="นามสกุล"
                  value={regLastName}
                  onChange={(e) => handleLastNameChange(e.target.value)}
                  title="นามสกุลผู้เสนอโครงการ (field นามสกุล)"
                  required
                />
              </div>
              <span style={{ color: '#64748b', fontSize: '12.5px' }}>
                • บทบาท: <strong>{regLevel === 'policy' ? 'นโยบาย' : regLevel === 'practitioner' ? 'ผู้ปฏิบัติการ' : 'ประชาชน'}</strong>
              </span>
            </div>

            <div className="reg-form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="reg-form-label" style={{ margin: 0 }}>
                  ชื่อโครงการ (Project Title) *
                </label>
                <button
                  type="button"
                  className="btn-ai-retitle-action"
                  onClick={handleGenerateProjectTitleOnly}
                  disabled={isGeneratingTitle}
                  title="คลิกเพื่อให้ AI คิดชื่อโครงการใหม่ที่สร้างสรรค์และสื่อความหมาย"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    fontSize: '12px',
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 600,
                    color: '#059669',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '6px',
                    cursor: isGeneratingTitle ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isGeneratingTitle ? (
                    <Loader2 size={13} color="#059669" className="spin-animation" />
                  ) : (
                    <Sparkles size={13} color="#059669" />
                  )}
                  <span>{isGeneratingTitle ? 'AI กำลังคิดชื่อใหม่...' : '✨ ให้ AI คิดชื่อใหม่'}</span>
                </button>
              </div>
              <input
                id="hackathon-prop-project-name"
                type="text"
                className="reg-form-input"
                placeholder="เช่น โครงการคุณธรรมนวัตกรรมเพื่อการพัฒนาชุมชน"
                value={propProjectName}
                onChange={(e) => setPropProjectName(e.target.value)}
                required
              />
              {/* Quick Title Suggestion Chips */}
              {suggestedTitles.length > 0 && (
                <div className="title-suggestion-chips-box">
                  <span className="title-suggestion-label">
                    💡 คลิกเลือกชื่อโครงการแนะนำโดย AI:
                  </span>
                  <div className="title-suggestion-chips">
                    {suggestedTitles.map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`title-sugg-chip ${propProjectName === t ? 'is-selected' : ''}`}
                        onClick={() => setPropProjectName(t)}
                        title="คลิกเพื่อนำชื่อนี้ไปใส่ในช่องชื่อโครงการทันที"
                      >
                        {propProjectName === t ? '✓ ' : ''}{t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">พื้นที่ดำเนินการ</label>
              <input
                type="text"
                className="reg-form-input"
                placeholder={`เช่น อ.เมือง${effectiveProvince} และพื้นที่เป้าหมาย`}
                value={propTargetArea}
                onChange={(e) => setPropTargetArea(e.target.value)}
              />
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">กลุ่มเป้าหมาย (Target Audience) *</label>
              <input
                type="text"
                className="reg-form-input"
                placeholder="เช่น ผู้ใช้แรงงานในนิคมฯ 12,000 คน และเยาวชนในชุมชนรอบข้าง"
                value={propTargetAudience}
                onChange={(e) => setPropTargetAudience(e.target.value)}
                required
              />
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">
                แนวคิดโครงการ *
              </label>
              <textarea
                id="hackathon-prop-details"
                className="reg-form-input"
                rows={8}
                style={{ minHeight: '170px', resize: 'vertical', lineHeight: '1.6' }}
                placeholder="อธิบาย 1) วิธีการที่จะดำเนินงานว่าทำอย่างไร และ 2) แล้วจะปรับเปลี่ยนพฤติกรรมได้อย่างไรที่คาดการณ์ไว้..."
                value={propProposalDetails}
                onChange={(e) => setPropProposalDetails(e.target.value)}
                required
              />
              {/* Quick Strategy Suggestion Chips / Cards */}
              {suggestedBehaviorStrategies.length > 0 && (
                <div className="strategy-suggestion-box">
                  <span className="strategy-suggestion-label">
                    💡 ทางเลือกกลยุทธ์ปรับเปลี่ยนพฤติกรรมโดย AI (คลิกเพื่อนำไปใส่ในช่องทันที):
                  </span>
                  <div className="strategy-suggestion-cards">
                    {suggestedBehaviorStrategies.map((strat, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`strategy-sugg-chip ${propProposalDetails === strat ? 'is-selected' : ''}`}
                        onClick={() => setPropProposalDetails(strat)}
                        title="คลิกเพื่อนำกลยุทธ์ทางเลือกนี้ไปใส่ในช่องแนวคิดนวัตกรรม"
                      >
                        <div className="strat-chip-header">
                          <span className="strat-chip-badge">แนวทางที่ {idx + 1}</span>
                          {propProposalDetails === strat && <span className="strat-chip-check">✓ ใช้งานอยู่</span>}
                        </div>
                        <div className="strat-chip-snippet">
                          {strat.slice(0, 140)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">
                กลไกการมีส่วนร่วมของ 3 ระดับ (นโยบาย / ผู้ปฏิบัติการ / ประชาชน) *
              </label>
              <textarea
                id="hackathon-prop-activity-plan"
                className="reg-form-input"
                style={{ minHeight: '90px', resize: 'vertical' }}
                placeholder="1) ระดับนโยบาย: ผู้ว่าฯ/อบจ. ทำอะไร 2) ผู้ปฏิบัติการ: เจ้าหน้าที่/ครู/อสม. ทำอะไร 3) ประชาชน: ชุมชนมีส่วนร่วมอย่างไร..."
                value={propActivityPlan}
                onChange={(e) => setPropActivityPlan(e.target.value)}
                required
              />
            </div>

            <div className="reg-form-group">
              <label className="reg-form-label">
                ผลลัพธ์ที่คาดหวัง *
              </label>
              <textarea
                id="hackathon-prop-kpi"
                className="reg-form-input"
                rows={3}
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="ระบุตัวชี้วัดและผลลัพธ์ที่คาดหวัง เช่น ขยะลดลงร้อยละ 40 หรือมีเงินออมเพิ่มขึ้น..."
                value={propBehavioralKpi}
                onChange={(e) => setPropBehavioralKpi(e.target.value)}
                required
              />
            </div>

            {/* ปุ่ม ตรวจสอบคะแนนก่อนส่งโครงการ */}
            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="hackathon-precheck-btn"
                onClick={handleTriggerPreSubmissionCheck}
                disabled={isPreChecking || Boolean(checkDuplicateSubmitter(regFirstName, regLastName, allProjects).isDuplicate)}
                style={
                  checkDuplicateSubmitter(regFirstName, regLastName, allProjects).isDuplicate
                    ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#94a3b8', borderColor: '#94a3b8' }
                    : {}
                }
                title={
                  checkDuplicateSubmitter(regFirstName, regLastName, allProjects).isDuplicate
                    ? 'คุณได้ส่งโครงการไปแล้ว 1 โครงการ ไม่สามารถส่งซ้ำได้'
                    : 'คลิกเพื่อส่งข้อมูลให้ AI ผู้เชี่ยวชาญประเมินคะแนนตาม Rubric สากลก่อนการส่งจริง'
                }
              >
                {isPreChecking ? (
                  <Loader2 size={24} className="spin-animation" />
                ) : (
                  <ShieldCheck size={24} />
                )}
                <span>
                  {isPreChecking
                    ? 'AI กำลังตรวจสอบคะแนนตาม Rubric...'
                    : checkDuplicateSubmitter(regFirstName, regLastName, allProjects).isDuplicate
                    ? 'ส่งโครงการแล้ว (ไม่สามารถส่งซ้ำได้)'
                    : 'ตรวจสอบคะแนนโครงการ'}
                </span>
              </button>
            </div>
          </form>
          </>
          )}

          {/* Footer Actions (แสดงเฉพาะเมื่อไม่ได้เปิดหน้าสำรวจฐานข้อมูล) */}
          {!isDbExplorerOpen && (
            <div className="hackathon-footer-actions">
              <button
                type="button"
                className="hackathon-btn-prev"
                onClick={() => setCurrentStep(3)}
              >
                <ArrowLeft size={16} />
                <span>ย้อนกลับไปดูผลวิจัย</span>
              </button>

              <button
                type="button"
                className="hackathon-btn-next"
                style={{ background: '#475569' }}
                onClick={() => setCurrentStep(5)}
              >
                <span>ข้ามไปดูผลคะแนนโครงการ</span>
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* =================================================================
          STEP 5: ผลคะแนนโครงการ (CLEAN SCOREBOARD TABLE & DETAIL MODAL)
          ================================================================= */}
      {currentStep === 5 && (
        <div className="hackathon-content-card">
          <div className="hackathon-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div className="hackathon-section-title-wrap">
              <h2 className="hackathon-section-title">
                ผลคะแนนโครงการ
              </h2>
              <p className="hackathon-section-desc">
                ตารางผลคะแนนการประเมินโครงการโดยระบบ AI ผู้เชี่ยวชาญ (คลิกที่ปุ่มไอคอนมุมมองเพื่อดูรายละเอียดโครงการฉบับเต็ม)
              </p>
            </div>

            {/* Live Sync Status Badge for Step 5 */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '999px', fontSize: '12.5px', color: '#166534', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginLeft: 'auto' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
              <span>ซิงค์ผลสดอัตโนมัติ (5s)</span>
              {lastSyncTime && <span style={{ color: '#15803d', fontSize: '11px', opacity: 0.85 }}>• {lastSyncTime}</span>}
              <button
                type="button"
                onClick={() => triggerLiveSync(true)}
                disabled={isSyncing}
                title="คลิกเพื่อดึงข้อมูลโครงการและคะแนนล่าสุดทันที"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', display: 'inline-flex', alignItems: 'center', color: '#166534' }}
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Filter Tabs for Scoreboard */}
          <div className="dashboard-view-mode-tabs">
            <button
              type="button"
              className={`view-mode-tab-btn ${scoreboardFilterTab === 'all' ? 'is-active' : ''}`}
              onClick={() => setScoreboardFilterTab('all')}
            >
              <BarChart3 size={16} />
              <span>ทุกโครงการ ({allProjects.length})</span>
            </button>

            {coffeeGroups.map((grp) => {
              const count = allProjects.filter((p) => p.groupKey === grp.key).length;
              const isActive = scoreboardFilterTab === grp.key;
              return (
                <button
                  key={grp.key}
                  type="button"
                  className={`view-mode-tab-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setScoreboardFilterTab(grp.key)}
                >
                  <Coffee size={16} />
                  <span>{grp.name} ({count})</span>
                </button>
              );
            })}
          </div>

          {/* Clean Scoreboard Table: Displays ONLY Project Name, Score & View Icon Button */}
          {displayedScoreboardProjects.length === 0 ? (
            <div className="submitted-empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div className="empty-state-icon" style={{ fontSize: '42px', marginBottom: '12px' }}>📋</div>
              <h3 style={{ fontFamily: 'Kanit, sans-serif', fontSize: '18px', color: '#1e293b', margin: '0 0 8px 0' }}>
                ยังไม่มีข้อมูลโครงการในหมวดหมู่นี้
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                ท่านสามารถเสนอโครงการในขั้นตอนที่ 4 และกดส่งโครงการเพื่อบันทึกลงสู่ระบบและแสดงผลคะแนนที่นี่
              </p>
              <button
                type="button"
                className="hackathon-btn-next"
                onClick={() => setCurrentStep(4)}
                style={{ marginTop: '16px' }}
              >
                <span>➔ ไปเสนอโครงการในขั้นตอนที่ 4</span>
              </button>
            </div>
          ) : (
            <div className="clean-scoreboard-card">
              {/* Mobile Horizontal Scroll Hint */}
              <div className="scoreboard-mobile-scroll-hint">
                <span>👈 เลื่อนซ้าย-ขวา เพื่อดูผลคะแนนและรายละเอียด 👉</span>
              </div>
              <div className="clean-scoreboard-table-responsive">
                <table className={`clean-scoreboard-table ${isAdmin ? 'is-admin-table' : ''}`}>
                  <thead>
                    <tr>
                      <th style={{ width: '85px', minWidth: '70px', textAlign: 'center' }}>อันดับ</th>
                      <th style={{ minWidth: '280px' }}>ชื่อโครงการ</th>
                      <th style={{ width: '160px', minWidth: '130px', textAlign: 'center' }}>คะแนนโครงการ</th>
                      <th style={{ width: '180px', minWidth: '150px', textAlign: 'center' }}>เวลาที่ส่ง (Bangkok)</th>
                      <th style={{ width: isAdmin ? '240px' : '150px', minWidth: isAdmin ? '210px' : '140px', textAlign: 'center' }}>
                        {isAdmin ? 'จัดการ / รายละเอียด' : 'รายละเอียด'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                  {displayedScoreboardProjects.map((p, idx) => {
                    const rank = idx + 1;
                    const scoreVal = Number(p.aiScore || 0);
                    const isMyProject = checkIsMyProject(p);
                    const bangkokTime = formatBangkokSubmissionTime(p.createdAt);
                    const groupMeta = coffeeGroups.find((g) => g.key === p.groupKey) || (COFFEE_GROUPS as any)[p.groupKey];
                    const projectGroupName = p.groupName || groupMeta?.name || p.groupKey || 'กลุ่มกาแฟสร้างสรรค์คุณธรรม';

                    const isNewlyAdded = newlyAddedProjectIds.has(p.id);

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedDetailProject(p)}
                        className={`${idx === 0 ? 'top-rank-row' : ''} ${isMyProject ? 'my-project-highlight-row' : ''} ${isNewlyAdded ? 'animate-pulse' : ''}`}
                        style={{
                          ...(isNewlyAdded ? { backgroundColor: '#fef3c7', transition: 'background-color 0.8s ease' } : {})
                        }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <div className={`rank-badge rank-${rank <= 3 ? rank : 'other'}`}>
                            {rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `#${rank}`}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <div className="clean-project-title-cell" style={{ fontWeight: 800, fontSize: '15.5px', color: '#0f172a' }}>
                              {p.projectName}
                            </div>
                            {isNewlyAdded && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', background: '#f59e0b', color: '#ffffff', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700 }}>
                                <Sparkles size={11} />
                                <span>มาใหม่!</span>
                              </span>
                            )}
                            {isMyProject && (
                              <span className="my-project-pill-badge" title="โครงการที่คุณได้นำเสนอและส่งเข้าสู่ระบบ">
                                <Sparkles size={13} />
                                <span>โครงการของเรา</span>
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#64748b', fontFamily: 'Kanit, sans-serif' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <User size={13} color={isMyProject ? '#4f46e5' : '#2563eb'} />
                              <span>ผู้ส่ง: <strong style={{ color: isMyProject ? '#4338ca' : '#1e293b' }}>{p.proposerName || 'ผู้ร่วมกิจกรรม Hackathon'}</strong></span>
                              {isMyProject && (
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#4f46e5', background: '#e0e7ff', padding: '1px 6px', borderRadius: '4px' }}>
                                  (คุณ)
                                </span>
                              )}
                            </span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: groupMeta?.accentBg || '#fef3c7',
                                color: groupMeta?.themeColor || '#78350f',
                                padding: '1.5px 7px',
                                borderRadius: '5px',
                                fontSize: '12px',
                                fontWeight: 700,
                                border: `1px solid ${groupMeta?.themeColor ? `${groupMeta.themeColor}33` : '#fde68a'}`
                              }}
                              title={`กลุ่มที่สังกัด: ${projectGroupName}`}
                            >
                              <Coffee size={12} color={groupMeta?.themeColor || '#78350f'} />
                              <span>กลุ่ม: <strong>{projectGroupName}</strong></span>
                            </span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Briefcase size={13} color="#64748b" />
                              <span>ตำแหน่ง: <strong style={{ color: '#334155' }}>{p.proposerPosition || getProposerLevelLabel(p.proposerLevel)}</strong></span>
                            </span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Building2 size={13} color="#64748b" />
                              <span>หน่วยงาน: <strong style={{ color: '#334155' }}>{p.proposerAgency || `เครือข่ายคุณธรรม จ.${p.province}`}</strong></span>
                            </span>
                          </div>
                        </td>
                        <td className="clean-score-cell">
                          <div className={`clean-score-pill ${isMyProject ? 'my-project-score-pill' : ''}`}>
                            <span className="clean-score-num">{scoreVal.toFixed(2)}</span>
                            <span className="clean-score-max">/ 100</span>
                          </div>
                        </td>
                        <td className="clean-time-cell" style={{ textAlign: 'center' }}>
                          <div className="scoreboard-time-cell" title={`เวลาส่งข้อเสนอโครงการ: ${bangkokTime.fullBangkok}`}>
                            <div className="scoreboard-time-header">
                              <Clock size={11} color="#64748b" />
                              <span>เวลาส่ง (Bangkok)</span>
                            </div>
                            <div className="scoreboard-time-large" style={{ color: isMyProject ? '#4338ca' : '#0f172a' }}>
                              {bangkokTime.timeOnly}
                            </div>
                            <div className="scoreboard-time-date">
                              {bangkokTime.dateOnly}
                            </div>
                          </div>
                        </td>
                        <td className="clean-action-cell">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn-view-project-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDetailProject(p);
                              }}
                              title="คลิกเพื่อดูรายละเอียดโครงการทั้งหมด"
                            >
                              <Eye size={16} />
                              <span>ดูรายละเอียด</span>
                            </button>

                            {isAdmin && (
                              <button
                                type="button"
                                className="btn-admin-table-delete"
                                onClick={(e) => handleDeleteProject(e, p)}
                                style={{
                                  background: '#fee2e2',
                                  border: '1px solid #fca5a5',
                                  color: '#dc2626',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontFamily: 'Kanit, sans-serif',
                                  transition: 'all 0.15s ease'
                                }}
                                title="ลบโครงการนี้ออกจากฐานข้อมูลและหน้าโหวต (เฉพาะ Admin)"
                              >
                                <Trash2 size={14} />
                                <span>ลบ</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="hackathon-footer-actions">
            <button
              type="button"
              className="hackathon-btn-prev"
              onClick={() => setCurrentStep(4)}
            >
              <ArrowLeft size={16} />
              <span>ย้อนกลับไปหน้าเสนอโครงการ</span>
            </button>
          </div>
        </div>
      )}

      {/* Criteria Generator Modal (สร้างเกณฑ์การตัดสิน & AI Agent Skill) */}
      <CriteriaGeneratorModal
        isOpen={isCriteriaGeneratorOpen}
        onClose={() => setIsCriteriaGeneratorOpen(false)}
        province={province}
        onSavedSuccess={(rec) => setLatestCriteriaRecord(rec)}
      />

      {/* Criteria Viewer Modal (แสดงตารางเกณฑ์การตัดสินล่าสุดจาก PostgreSQL (DB-MDC)) */}
      <CriteriaViewerModal
        isOpen={isCriteriaViewerOpen}
        onClose={() => setIsCriteriaViewerOpen(false)}
        province={province}
        isAdmin={isAdmin}
      />

      {/* Coffee Group Add / Edit Modal */}
      <CoffeeGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        mode={groupModalMode}
        initialGroup={groupToEdit}
        onSave={handleSaveGroup}
      />

      {/* Floating Live Sync Toast Notification */}
      {liveSyncToast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderLeft: '4px solid #f59e0b',
            fontSize: '14px',
            fontFamily: 'Kanit, sans-serif'
          }}
        >
          <span>{liveSyncToast}</span>
          <button
            type="button"
            onClick={() => setLiveSyncToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Pre-Submission AI Evaluation Modal (ตรวจสอบคะแนนก่อนส่งโครงการ) */}
      <PreSubmissionEvaluationModal
        isOpen={isPreCheckModalOpen}
        onClose={() => setIsPreCheckModalOpen(false)}
        evaluationResult={preCheckResult}
        isLoading={isPreChecking}
        onConfirmSubmit={handleConfirmSubmitFromPreCheck}
        isAdmin={isAdmin}
        onResetHistory={() => {
          clearTempEvaluationHistory(province);
          setPreCheckClickCount(0);
          setPreCheckResult(null);
          setIsPreCheckModalOpen(false);
        }}
        onOpenApiKeySettings={() => {
          setIsPreCheckModalOpen(false);
          window.dispatchEvent(new CustomEvent('mdc_navigate_page', { detail: 'settings' }));
        }}
      />

      {/* Post-Submission Score Modal (แสดง Dialog คะแนนหลังกด Submit พร้อมปุ่มไปหน้าสรุป) */}
      <PostSubmissionScoreModal
        isOpen={isPostSubmitModalOpen}
        onClose={() => setIsPostSubmitModalOpen(false)}
        project={lastSubmittedProject}
        onGoToSummary={handleGoToSubmittedProjectsSummary}
      />

      {/* Hackathon Project Detail Modal (แสดง Dialog รายละเอียดโครงการทั้งหมดเมื่อกดปุ่ม icon view) */}
      <HackathonProjectDetailModal
        isOpen={Boolean(selectedDetailProject)}
        onClose={() => setSelectedDetailProject(null)}
        project={selectedDetailProject}
        isAdmin={isAdmin}
        onDelete={(p) => handleDeleteProject(null, p)}
      />

      {/* Admin Login Modal (สำหรับสลับเข้าสู่ระบบ Account Admin เพื่อใช้งานปุ่ม Reset ฐานข้อมูล) */}
      {isAdminModalOpen && (
        <div className="criteria-modal-backdrop" onClick={handleCloseAdminModal}>
          <div className="admin-login-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="criteria-modal-header" style={{ background: '#0f172a', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#10b981" />
                <h3 style={{ margin: 0, fontFamily: 'Kanit, sans-serif', fontSize: '18px', color: '#ffffff' }}>
                  เข้าสู่ระบบผู้ดูแลระบบ (Admin Authentication)
                </h3>
              </div>
              <button
                type="button"
                className="criteria-modal-close-btn"
                onClick={handleCloseAdminModal}
                style={{ color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdminLoginSubmit} autoComplete="off" className="admin-login-modal-form">
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                เมื่อเข้าสู่ระบบด้วย Account Admin จะสามารถมองเห็นและใช้งานปุ่ม <strong>Reset ฐานข้อมูล</strong> ในขั้นตอน Hackathon ด้านบนขวาได้ทันที
              </p>

              {adminAuthFeedback && (
                <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', fontWeight: 600 }}>
                  {adminAuthFeedback}
                </div>
              )}

              <div className="reg-form-group" style={{ marginBottom: '14px' }}>
                <label className="reg-form-label">Username (ชื่อผู้ใช้)</label>
                <input
                  type="text"
                  name="pilot_admin_username"
                  autoComplete="off"
                  className="reg-form-input"
                  value={adminUsernameInput}
                  onChange={(e) => setAdminUsernameInput(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้ (Username)"
                  required
                />
              </div>

              <div className="reg-form-group" style={{ marginBottom: '18px' }}>
                <label className="reg-form-label">Password (รหัสผ่าน)</label>
                <input
                  type="password"
                  name="pilot_admin_password"
                  autoComplete="new-password"
                  className="reg-form-input"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่าน (Password)"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-precheck-secondary"
                  onClick={handleCloseAdminModal}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn-precheck-primary"
                  style={{ background: '#0f172a', borderColor: '#0f172a' }}
                >
                  <Key size={15} />
                  <span>เข้าสู่ระบบ Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Prompt & Output Inspector Modal Dialog */}
      {isAdmin && isAdminPromptModalOpen && activePromptData && (
        <div className="criteria-modal-backdrop" onClick={() => setIsAdminPromptModalOpen(false)}>
          <div
            className="admin-prompt-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '960px', width: '92vw', maxHeight: '90vh' }}
          >
            <div className="criteria-modal-header" style={{ background: '#0f172a', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Terminal size={22} color="#a855f7" />
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'Kanit, sans-serif', fontSize: '19px', color: '#ffffff' }}>
                    ข้อความ Prompt ทั้งหมดที่ส่งให้ AI และ Output ที่ได้รับ (Admin Inspector)
                  </h3>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                    โมเดล: {activePromptData.modelName} • เวลา: {activePromptData.timestamp}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="criteria-modal-close-btn"
                onClick={() => setIsAdminPromptModalOpen(false)}
                style={{ color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-prompt-modal-body" style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
              {/* Copy actions bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="admin-only-badge" style={{ fontSize: '13px', padding: '4px 10px' }}>
                    <Lock size={12} /> เข้าสู่ระบบในฐานะ Admin
                  </span>
                  <span style={{ fontSize: '13.5px', color: '#64748b', alignSelf: 'center' }}>
                    โครงการ: <strong>{activePromptData.projectName}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="admin-mini-copy-btn"
                    onClick={() => handleCopyText(activePromptData.promptPayload || '', 'modal-prompt')}
                  >
                    {copiedPromptKey === 'modal-prompt' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copiedPromptKey === 'modal-prompt' ? 'คัดลอก Prompt แล้ว!' : 'คัดลอก Prompt ทั้งหมด'}</span>
                  </button>
                  <button
                    type="button"
                    className="admin-mini-copy-btn"
                    onClick={() => handleCopyText(activePromptData.rawJsonOutput || '', 'modal-json')}
                  >
                    {copiedPromptKey === 'modal-json' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copiedPromptKey === 'modal-json' ? 'คัดลอก JSON แล้ว!' : 'คัดลอก Raw JSON'}</span>
                  </button>
                </div>
              </div>

              {/* 1. Prompt ทั้งหมดที่ส่งให้ AI */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontFamily: 'Kanit, sans-serif', fontSize: '16.5px', color: '#1e293b' }}>
                    🤖 1. Prompt ทั้งหมดที่ส่งให้ AI (System Instructions & Context Payload)
                  </h4>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {(activePromptData.promptPayload || '').length.toLocaleString()} ตัวอักษร
                  </span>
                </div>
                <pre className="admin-code-block-pre modal-block">
                  {activePromptData.promptPayload || 'ไม่มีข้อความ Prompt'}
                </pre>
              </div>

              {/* 2. Output ที่ได้จาก AI มาด้านล่าง */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontFamily: 'Kanit, sans-serif', fontSize: '16.5px', color: '#1e293b' }}>
                    📦 2. Output ที่ได้จาก AI มาด้านล่าง (AI Response Payload)
                  </h4>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {(activePromptData.outputPayload || '').length.toLocaleString()} ตัวอักษร
                  </span>
                </div>
                <pre className="admin-code-block-pre modal-block json">
                  {activePromptData.outputPayload || 'ไม่มีข้อความ Output'}
                </pre>
              </div>
            </div>

            <div className="criteria-modal-footer" style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-precheck-secondary"
                onClick={() => setIsAdminPromptModalOpen(false)}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SQLite Database Tables Explorer Modal (ตรวจเช็คข้อมูลผู้ร่วมกิจกรรม และทุกตารางในระบบ) */}
      {isDbExplorerModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setIsDbExplorerModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '1320px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DatabaseTablesExplorer
              initialTable="pilot_agency_registrations"
              onClose={() => setIsDbExplorerModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

