import { useState, useEffect } from 'react';

export type MoralLanguageCode = 'th' | 'en' | 'zh';

export interface MoralLanguageOption {
  code: MoralLanguageCode;
  label: string;
  shortLabel: string;
  flag: string;
}

export const MORAL_LANGUAGE_OPTIONS: MoralLanguageOption[] = [
  { code: 'th', label: 'ไทย', shortLabel: 'ไทย', flag: '🇹🇭' },
  { code: 'en', label: 'Eng', shortLabel: 'Eng', flag: '🇬🇧' },
  { code: 'zh', label: 'ภาษาจีน (中文)', shortLabel: 'ภาษาจีน', flag: '🇨🇳' }
];

const STORAGE_KEY = 'moral_center_language_v1';
const EVENT_NAME = 'moral-language-change';

export function getStoredMoralLanguage(): MoralLanguageCode {
  if (typeof window === 'undefined') return 'th';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'th' || saved === 'en' || saved === 'zh') {
    return saved;
  }
  return 'th';
}

export function setStoredMoralLanguage(lang: MoralLanguageCode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: lang }));
  applyDomLanguageTranslation(lang);
}

// Phrase dictionary ordered from longer/more specific phrases to shorter terms
const PHRASE_DICTIONARY: Array<{ th: string; en: string; zh: string }> = [
  // Main Sectors & Headers
  {
    th: 'ระดับนโยบาย (Policy Maker Dashboard)',
    en: 'Policy Level (Policy Maker Dashboard)',
    zh: '政策层级 (政策制定者仪表板)'
  },
  {
    th: 'ระดับปฏิบัติการ (Implementor Dashboard)',
    en: 'Operational Level (Implementor Dashboard)',
    zh: '执行层级 (项目执行者仪表板)'
  },
  {
    th: 'ระดับประชาชน (Public Dashboard)',
    en: 'Public Level (Public Dashboard)',
    zh: '公众层级 (公众参与仪表板)'
  },
  {
    th: 'ระดับนโยบาย',
    en: 'Policy Level',
    zh: '政策层级'
  },
  {
    th: 'ระดับปฏิบัติการ',
    en: 'Operational Level',
    zh: '执行层级'
  },
  {
    th: 'ระดับประชาชน',
    en: 'Public Level',
    zh: '公众层级'
  },
  {
    th: 'ดัชนีและทุนชีวิต',
    en: 'Moral Index & Life Capital',
    zh: '道德指数与生命资本'
  },
  {
    th: 'กิจกรรมนำร่อง 4 ภูมิภาค',
    en: '4-Region Pilot Activities',
    zh: '四大区域试点活动'
  },
  {
    th: 'เลือกจังหวัดนำร่องเพื่อลงทะเบียน & ถอดบทเรียน',
    en: 'Select a pilot province for registration & AI lesson learned',
    zh: '选择试点府进行机构登记与AI经验总结'
  },

  // Main View Titles
  {
    th: 'Moral City Dashboard (จังหวัดคุณธรรม & การชี้เป้างบประมาณเชิงพื้นที่)',
    en: 'Moral City Dashboard (Moral Provinces & Spatial Budget Targeting)',
    zh: '道德城市仪表板 (道德促进府与空间预算精准配置)'
  },
  {
    th: 'สังเคราะห์ผลสำเร็จกระบวนการขับเคลื่อนจังหวัดส่งเสริมคุณธรรม ระยะ 3 ปี (พ.ศ. 2566–2568) จากรายงานฉบับสมบูรณ์ 9 จังหวัด',
    en: '3-Year Synthesis of Moral Province Achievements (2023–2025) from 9 Complete Provincial Reports',
    zh: '9个道德促进府三年期（2023–2025年）完整报告成果综合分析'
  },
  {
    th: 'ภาพรวม 9 จังหวัด',
    en: 'Overview (9 Provinces)',
    zh: '9府总体概览'
  },
  {
    th: 'เมนูจังหวัดคุณธรรม (9 จังหวัด):',
    en: 'Moral City Provinces (9 Provinces):',
    zh: '道德促进府菜单 (9个府):'
  },
  {
    th: 'ทั้งหมด (9 จังหวัด)',
    en: 'All (9 Provinces)',
    zh: '全部 (9个府)'
  },
  {
    th: '1. ธรรมาภิบาล & ต้านทุจริตท้องถิ่น',
    en: '1. Local Governance & Anti-Corruption',
    zh: '1. 地方善治与反腐败'
  },
  {
    th: '2. หนี้ครัวเรือน & ภูมิคุ้มกันเศรษฐกิจ',
    en: '2. Household Debt & Economic Resilience',
    zh: '2. 家庭债务与经济韧性'
  },
  {
    th: '3. วินัยพลเมือง ถนนปลอดภัย & สิทธิฯ',
    en: '3. Civic Discipline, Road Safety & Rights',
    zh: '3. 公民纪律、道路安全与人权'
  },
  {
    th: '4. สังคมสูงวัย & บริบาลชุมชนคุณธรรม',
    en: '4. Aging Society & Moral Community Care',
    zh: '4. 老龄化社会与道德社区照护'
  },
  {
    th: '5. ทุนชีวิตเยาวชน & ว่างงานเชิงโครงสร้าง',
    en: '5. Youth Life Capital & Structural Unemployment',
    zh: '5. 青年生命资本与结构性失业'
  },

  // Submenu Items & Views
  {
    th: 'ประเมินคะแนนโครงการด้านดัชนีคุณธรรม',
    en: 'Project Moral Index Evaluation',
    zh: '项目道德指数评估'
  },
  {
    th: 'ประเมินคะแนนโครงการด้านทุนชีวิต',
    en: 'Project Life Capital Evaluation',
    zh: '项目生命资本评估'
  },
  {
    th: 'การประชุมแลกเปลี่ยนเรียนรู้',
    en: 'Knowledge Exchange Meetings',
    zh: '知识交流与研讨会议'
  },
  {
    th: 'ติดตามโครงการคุณธรรมแบบ Real time',
    en: 'Real-Time Moral Project Tracker',
    zh: '道德项目实时追踪仪表板'
  },
  {
    th: 'วิทยากรคุณธรรม',
    en: 'Moral Lecturers',
    zh: '道德讲师网络'
  },
  {
    th: 'ดัชนีคุณธรรม',
    en: 'Moral Index',
    zh: '道德指数'
  },
  {
    th: 'ทุนชีวิต',
    en: 'Life Capital',
    zh: '生命资本'
  },

  // Pilot 4 Regions View
  {
    th: '1. ลงทะเบียนหน่วยงาน & นำข้อมูลมา Synergy ร่วมกับศูนย์คุณธรรม',
    en: '1. Agency Registration & Data Synergy with Moral Center',
    zh: '1. 机构登记与道德中心数据协同 (Data Synergy)'
  },
  {
    th: '2. ถอดบทเรียนกิจกรรมด้วย AI & Generate นโยบาย',
    en: '2. AI Activity Lesson Learned & Policy Generator',
    zh: '2. AI活动经验总结与政策生成'
  },
  {
    th: 'ถอดบทเรียนด้วย AI',
    en: 'Extract Lessons with AI',
    zh: '使用AI总结经验教训'
  },
  {
    th: 'Edit ข้อมูลการถอดบทเรียน',
    en: 'Edit Lesson Learned Data',
    zh: '编辑经验总结内容'
  },
  {
    th: 'Generate นโยบาย',
    en: 'Generate Policy',
    zh: '生成政策建议'
  },
  {
    th: 'บันทึกการลงทะเบียน & ข้อมูล Synergy ลงฐานข้อมูล',
    en: 'Save Agency Registration & Synergy Data to Database',
    zh: '保存机构登记与协同数据至数据库'
  },

  // Calendar & Real-Time Project States
  {
    th: 'เสร็จสิ้นการดำเนินงาน',
    en: 'Completed',
    zh: '已完成执行'
  },
  {
    th: 'กำลังดำเนินงาน',
    en: 'In Progress',
    zh: '正在执行中'
  },
  {
    th: 'เริ่มต้น',
    en: 'Initiated',
    zh: '启动阶段'
  },
  {
    th: 'ชื่อโครงการ',
    en: 'Project Name',
    zh: '项目名称'
  },
  {
    th: 'บันทึกการประชุม',
    en: 'Meeting Minutes',
    zh: '会议纪要'
  },

  // 5 Moral Virtues
  {
    th: 'พอเพียง',
    en: 'Sufficiency',
    zh: '知足适度'
  },
  {
    th: 'วินัย',
    en: 'Discipline',
    zh: '纪律守法'
  },
  {
    th: 'สุจริต',
    en: 'Integrity',
    zh: '诚实廉洁'
  },
  {
    th: 'จิตอาสา',
    en: 'Volunteerism',
    zh: '志愿精神'
  },
  {
    th: 'กตัญญู',
    en: 'Gratitude',
    zh: '感恩回馈'
  },

  // 6 Life Capital Powers
  {
    th: 'พลังตัวตน',
    en: 'Self Power',
    zh: '自我力量'
  },
  {
    th: 'พลังครอบครัว',
    en: 'Family Power',
    zh: '家庭力量'
  },
  {
    th: 'พลังสร้างปัญญา',
    en: 'Wisdom Power',
    zh: '智慧力量'
  },
  {
    th: 'พลังเพื่อนและกิจกรรม',
    en: 'Peer & Activity Power',
    zh: '同伴与活动力量'
  },
  {
    th: 'พลังชุมชน',
    en: 'Community Power',
    zh: '社区力量'
  },
  {
    th: 'พลังสร้างสรรค์',
    en: 'Creative Power',
    zh: '创造力量'
  },

  // Regions & Provinces
  {
    th: 'ภาคตะวันออกเฉียงเหนือ',
    en: 'Northeast Region',
    zh: '东北部地区'
  },
  {
    th: 'ภาคตะวันออก',
    en: 'Eastern Region',
    zh: '东部地区'
  },
  {
    th: 'ภาคเหนือ',
    en: 'Northern Region',
    zh: '北部地区'
  },
  {
    th: 'ภาคกลาง',
    en: 'Central Region',
    zh: '中部地区'
  },
  {
    th: 'ภาคใต้',
    en: 'Southern Region',
    zh: '南部地区'
  },
  {
    th: 'สุราษฎร์ธานี',
    en: 'Surat Thani',
    zh: '素叻他尼府'
  },
  {
    th: 'กำแพงเพชร',
    en: 'Kamphaeng Phet',
    zh: '甘烹碧府'
  },
  {
    th: 'กาฬสินธุ์',
    en: 'Kalasin',
    zh: '加拉信府'
  },
  {
    th: 'หนองคาย',
    en: 'Nong Khai',
    zh: '廊开府'
  },
  {
    th: 'ลำปาง',
    en: 'Lampang',
    zh: '南邦府'
  },
  {
    th: 'ระยอง',
    en: 'Rayong',
    zh: '罗勇府'
  },
  {
    th: 'พังงา',
    en: 'Phang Nga',
    zh: '攀牙府'
  },
  {
    th: 'แพร่',
    en: 'Phrae',
    zh: '帕府'
  },
  {
    th: 'น่าน',
    en: 'Nan',
    zh: '难府'
  },

  // Common Dashboard Labels
  {
    th: 'พื้นที่ขับเคลื่อนจังหวัดคุณธรรม',
    en: 'Moral Province Driving Areas',
    zh: '道德促进府推进区域'
  },
  {
    th: 'องค์กรประกาศเจตนารมณ์ / ติดตาม',
    en: 'Declared / Tracked Organizations',
    zh: '签署宣言 / 持续追踪机构'
  },
  {
    th: 'ระดับการแปลงมติสู่การปฏิบัติ',
    en: 'Action Implementation Maturity Level',
    zh: '决议转化为行动成熟度'
  },
  {
    th: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    en: 'Center for Morality Promotion (Public Organization)',
    zh: '泰国道德促进中心（公共机构）'
  },
  {
    th: 'ศูนย์คุณธรรม',
    en: 'Moral Promotion Center',
    zh: '道德促进中心'
  },
  {
    th: 'จังหวัด',
    en: 'Province',
    zh: '府'
  },
  {
    th: 'ภูมิภาค',
    en: 'Region',
    zh: '区域'
  },
  {
    th: 'หน่วยงาน',
    en: 'Agency',
    zh: '机构'
  },
  {
    th: 'โครงการ',
    en: 'Project',
    zh: '项目'
  },
  {
    th: 'นโยบาย',
    en: 'Policy',
    zh: '政策'
  }
];

const originalTextNodeMap = new WeakMap<Text, string>();
let isApplyingTranslation = false;

export function translateTextString(input: string, lang: MoralLanguageCode): string {
  if (lang === 'th' || !input) return input;
  let result = input;
  for (const entry of PHRASE_DICTIONARY) {
    if (result.includes(entry.th)) {
      const replacement = lang === 'en' ? entry.en : entry.zh;
      result = result.split(entry.th).join(replacement);
    }
  }
  return result;
}

export function applyDomLanguageTranslation(lang: MoralLanguageCode): void {
  if (typeof document === 'undefined' || isApplyingTranslation) return;
  const root = document.querySelector('.moral-fullscreen-root');
  if (!root) return;

  isApplyingTranslation = true;
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let currentNode = walker.nextNode() as Text | null;

    while (currentNode) {
      const parentEl = currentNode.parentElement;
      if (
        parentEl &&
        parentEl.tagName !== 'SCRIPT' &&
        parentEl.tagName !== 'STYLE' &&
        !parentEl.closest('[data-no-translate="true"]')
      ) {
        const currentVal = currentNode.nodeValue || '';
        if (currentVal.trim().length > 0) {
          if (!originalTextNodeMap.has(currentNode)) {
            originalTextNodeMap.set(currentNode, currentVal);
          }
          const baseThai = originalTextNodeMap.get(currentNode) ?? currentVal;
          const nextText = lang === 'th' ? baseThai : translateTextString(baseThai, lang);
          if (currentNode.nodeValue !== nextText) {
            currentNode.nodeValue = nextText;
          }
        }
      }
      currentNode = walker.nextNode() as Text | null;
    }
  } finally {
    isApplyingTranslation = false;
  }
}

export function useMoralLanguage(): {
  language: MoralLanguageCode;
  setLanguage: (lang: MoralLanguageCode) => void;
  t: (thText: string, enText?: string, zhText?: string) => string;
} {
  const [language, setLanguageState] = useState<MoralLanguageCode>(() => getStoredMoralLanguage());

  useEffect(() => {
    const handleLangEvent = (e: Event) => {
      const custom = e as CustomEvent<MoralLanguageCode>;
      if (custom.detail) {
        setLanguageState(custom.detail);
      }
    };
    window.addEventListener(EVENT_NAME, handleLangEvent);
    return () => window.removeEventListener(EVENT_NAME, handleLangEvent);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyDomLanguageTranslation(language);
    }, 60);
    return () => clearTimeout(timer);
  }, [language]);

  const setLanguage = (lang: MoralLanguageCode) => {
    setLanguageState(lang);
    setStoredMoralLanguage(lang);
  };

  const t = (thText: string, enText?: string, zhText?: string): string => {
    if (language === 'th') return thText;
    if (language === 'en') return enText || translateTextString(thText, 'en');
    return zhText || translateTextString(thText, 'zh');
  };

  return { language, setLanguage, t };
}
