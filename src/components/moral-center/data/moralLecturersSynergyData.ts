// ============================================================================
// MORAL LECTURERS (mdc_people) x NATIONAL DATA SYNERGY (133 DATASETS)
// Supply-Demand Policy Targeting & Evidence-Based Budget Reallocation Dataset
// ============================================================================

export type SynergyAspectKey =
  | 'overview'
  | 'integrity'
  | 'sufficiency'
  | 'discipline'
  | 'gratitude'
  | 'lifecapital'
  | 'master_matrix';

export interface SynergyAspectTab {
  key: SynergyAspectKey;
  shortLabel: string;
  fullTitle: string;
  icon: string;
  badgeColor: string;
  badgeBg: string;
}

export const SYNERGY_ASPECT_TABS: SynergyAspectTab[] = [
  {
    key: 'overview',
    shortLabel: 'ภาพรวม',
    fullTitle: 'ภาพรวมฐานข้อมูลวิทยากรคุณธรรม (mdc_people 5,346 คน 76 จังหวัด)',
    icon: '✨',
    badgeColor: '#1e3a8a',
    badgeBg: '#eff6ff'
  },
  {
    key: 'integrity',
    shortLabel: 'ด้านสุจริต vs ความเสี่ยงทุจริตภาครัฐ',
    fullTitle: 'ด้านที่ 1: คุณธรรมด้านสุจริต (Integrity) vs ความเสี่ยงการทุจริตจัดซื้อจัดจ้างภาครัฐ (ป.ป.ช. & ITA)',
    icon: '⚖️',
    badgeColor: '#dc2626',
    badgeBg: '#fef2f2'
  },
  {
    key: 'sufficiency',
    shortLabel: 'ด้านพอเพียง vs วิกฤตหนี้ครัวเรือน',
    fullTitle: 'ด้านที่ 2: คุณธรรมด้านพอเพียง (Sufficiency) vs วิกฤตหนี้สินครัวเรือนและเงินออม (สศช. & ธปท.)',
    icon: '🌱',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5'
  },
  {
    key: 'discipline',
    shortLabel: 'ด้านวินัยรับผิดชอบ vs ธรรมาภิบาล & สิทธิฯ',
    fullTitle: 'ด้านที่ 3: คุณธรรมด้านวินัยรับผิดชอบ (Discipline) vs ธรรมาภิบาลภาครัฐ สิทธิมนุษยชน (กสม.) และความปลอดภัย',
    icon: '🎯',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff'
  },
  {
    key: 'gratitude',
    shortLabel: 'ด้านกตัญญู vs สังคมสูงวัย (LTC)',
    fullTitle: 'ด้านที่ 4: คุณธรรมด้านกตัญญู (Gratitude) vs สุขภาวะและความสุขในสังคมสูงวัยขั้นสุดยอด (14.02 ล้านคน)',
    icon: '🙏',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff'
  },
  {
    key: 'lifecapital',
    shortLabel: 'ด้านทุนชีวิต & จิตอาสา vs เยาวชนว่างงาน',
    fullTitle: 'ด้านที่ 5: ทุนชีวิต 4 พลังและจิตอาสา vs ความมั่นคงของเยาวชน การว่างงาน และกลุ่มเปราะบาง (TPMAP)',
    icon: '🤝',
    badgeColor: '#d97706',
    badgeBg: '#fffbeb'
  },
  {
    key: 'master_matrix',
    shortLabel: 'พิมพ์เขียวชี้เป้างบประมาณ (Master Matrix)',
    fullTitle: 'สรุปความเชื่อมโยงเชิงยุทธศาสตร์และพิมพ์เขียวการปรับทิศทางงบประมาณภาครัฐ (Master Policy Synergy Matrix)',
    icon: '📊',
    badgeColor: '#0f172a',
    badgeBg: '#f1f5f9'
  }
];

// ============================================================================
// 1. ด้านที่ 1: คุณธรรมด้านสุจริต (Integrity) vs ความเสี่ยงการทุจริตจัดซื้อจัดจ้างภาครัฐ
// ============================================================================
export interface SynergyIntegrityRow {
  region: string;
  integrityScore: number; // เต็ม 5
  moralLevel: string;
  naccCases: number; // คดีชี้มูล ป.ป.ช.
  procurementFraudPct: number; // สัดส่วนคดีจัดซื้อจัดจ้าง (%)
  conflictOfInterestPct: number; // สัดส่วนคดีผลประโยชน์ทับซ้อน (%)
  otherFraudPct: number; // คดีสาธารณูปโภค/อื่นๆ (%)
  procurementCasesCount: number;
  conflictCasesCount: number;
  otherCasesCount: number;
  criIndexPct: number; // ดัชนีความเสี่ยง CRI (%)
  lecturersPer100k: number; // วิทยากรสุจริตต่อแสน ปชช. (คน)
  iidiRatio: number; // Integrity Intervention Deficit Index (CRI / Lecturers)
  riskStatus: string;
  statusColor: string;
  statusBg: string;
  isNationalAvg?: boolean;
}

export const SYNERGY_INTEGRITY_TABLE: SynergyIntegrityRow[] = [
  {
    region: 'กรุงเทพมหานคร',
    integrityScore: 4.68,
    moralLevel: 'พอใช้',
    naccCases: 210,
    procurementFraudPct: 52.3,
    conflictOfInterestPct: 25.1,
    otherFraudPct: 22.6,
    procurementCasesCount: 110,
    conflictCasesCount: 53,
    otherCasesCount: 47,
    criIndexPct: 74.5,
    lecturersPer100k: 1.8,
    iidiRatio: 41.4,
    riskStatus: 'พื้นที่วิกฤตสีแดง (เสี่ยงสูงสุด-วิทยากรต่ำ)',
    statusColor: '#dc2626',
    statusBg: '#fee2e2'
  },
  {
    region: 'ภาคกลาง',
    integrityScore: 4.75,
    moralLevel: 'พอใช้',
    naccCases: 168,
    procurementFraudPct: 49.8,
    conflictOfInterestPct: 22.5,
    otherFraudPct: 27.7,
    procurementCasesCount: 84,
    conflictCasesCount: 38,
    otherCasesCount: 46,
    criIndexPct: 66.8,
    lecturersPer100k: 2.1,
    iidiRatio: 31.8,
    riskStatus: 'พื้นที่วิกฤตสีส้ม (เสี่ยงสูง-คดีจัดซื้อพุ่ง)',
    statusColor: '#ea580c',
    statusBg: '#ffedd5'
  },
  {
    region: 'ภาคใต้',
    integrityScore: 4.82,
    moralLevel: 'พอใช้',
    naccCases: 115,
    procurementFraudPct: 46.2,
    conflictOfInterestPct: 21.0,
    otherFraudPct: 32.8,
    procurementCasesCount: 53,
    conflictCasesCount: 24,
    otherCasesCount: 38,
    criIndexPct: 58.4,
    lecturersPer100k: 2.9,
    iidiRatio: 20.1,
    riskStatus: 'พื้นที่เฝ้าระวัง (เสี่ยงปานกลาง)',
    statusColor: '#d97706',
    statusBg: '#fef3c7'
  },
  {
    region: 'ภาคเหนือ',
    integrityScore: 4.29,
    moralLevel: 'มาก',
    naccCases: 98,
    procurementFraudPct: 38.0,
    conflictOfInterestPct: 15.4,
    otherFraudPct: 46.6,
    procurementCasesCount: 37,
    conflictCasesCount: 15,
    otherCasesCount: 46,
    criIndexPct: 38.6,
    lecturersPer100k: 4.2,
    iidiRatio: 9.2,
    riskStatus: 'พื้นที่ปลอดภัย (ธรรมาภิบาลดี)',
    statusColor: '#059669',
    statusBg: '#d1fae5'
  },
  {
    region: 'ภาคตะวันออกเฉียงเหนือ',
    integrityScore: 4.42,
    moralLevel: 'มาก',
    naccCases: 142,
    procurementFraudPct: 41.5,
    conflictOfInterestPct: 18.2,
    otherFraudPct: 40.3,
    procurementCasesCount: 59,
    conflictCasesCount: 26,
    otherCasesCount: 57,
    criIndexPct: 45.2,
    lecturersPer100k: 4.8,
    iidiRatio: 9.4,
    riskStatus: 'พื้นที่ต้นแบบ (สำนึกสุจริตเข้มแข็ง)',
    statusColor: '#2563eb',
    statusBg: '#dbeafe'
  },
  {
    region: 'ทั่วราชอาณาจักร',
    integrityScore: 4.94,
    moralLevel: 'มาก',
    naccCases: 733,
    procurementFraudPct: 45.6,
    conflictOfInterestPct: 20.4,
    otherFraudPct: 34.0,
    procurementCasesCount: 343,
    conflictCasesCount: 156,
    otherCasesCount: 234,
    criIndexPct: 56.7,
    lecturersPer100k: 3.2,
    iidiRatio: 17.7,
    riskStatus: 'ค่าเฉลี่ยอ้างอิงประเทศ',
    statusColor: '#334155',
    statusBg: '#e2e8f0',
    isNationalAvg: true
  }
];

export const INTEGRITY_SKILL_MISMATCH_DATA = [
  {
    category: 'การจัดซื้อจัดจ้าง & พัสดุภาครัฐ (พ.ร.บ.จัดซื้อฯ)',
    naccCaseSharePct: 45.6,
    lecturerSkillSharePct: 11.5
  },
  {
    category: 'การขัดกันแห่งผลประโยชน์ทับซ้อน (Conflict of Interest)',
    naccCaseSharePct: 20.4,
    lecturerSkillSharePct: 14.0
  },
  {
    category: 'โครงการโครงสร้างพื้นฐาน & สาธารณูปโภค อปท.',
    naccCaseSharePct: 21.8,
    lecturerSkillSharePct: 9.5
  },
  {
    category: 'ปลูกฝังจริยธรรม/ต้านโกงทั่วไปในสถานศึกษา',
    naccCaseSharePct: 12.2,
    lecturerSkillSharePct: 65.0
  }
];

// ============================================================================
// 2. ด้านที่ 2: คุณธรรมด้านพอเพียง (Sufficiency) vs วิกฤตหนี้สินครัวเรือนและเงินออม
// ============================================================================
export interface SynergySufficiencyRow {
  region: string;
  sufficiencyScore: number; // เต็ม 5
  moralLevel: string;
  consumerDebtBaht: number; // หนี้บริโภคเฉลี่ย (บาท/ครัวเรือน)
  savingsHouseholdPct: number; // ครัวเรือนที่มีเงินออม (%)
  lecturersPer100k: number; // ความหนาแน่นวิทยากรพอเพียง (คน/แสน ปชช.)
  urbanFinanceSkillPct: number; // สัดส่วนวิทยากรสายการเงินเมือง (%)
  agriTraditionalSkillPct: number; // สัดส่วนวิทยากรสายเกษตรทฤษฎีใหม่ (%)
  quadrantStatus: string;
  statusColor: string;
  statusBg: string;
  isNationalAvg?: boolean;
}

export const SYNERGY_SUFFICIENCY_TABLE: SynergySufficiencyRow[] = [
  {
    region: 'กรุงเทพฯ และปริมณฑล',
    sufficiencyScore: 4.62,
    moralLevel: 'พอใช้',
    consumerDebtBaht: 7158,
    savingsHouseholdPct: 18.4,
    lecturersPer100k: 1.2,
    urbanFinanceSkillPct: 12.0,
    agriTraditionalSkillPct: 88.0,
    quadrantStatus: 'Q4: กลุ่มเปราะบางวิกฤต (หนี้สูง-พอเพียงต่ำ)',
    statusColor: '#dc2626',
    statusBg: '#fee2e2'
  },
  {
    region: 'ภาคกลาง',
    sufficiencyScore: 4.78,
    moralLevel: 'พอใช้',
    consumerDebtBaht: 6028,
    savingsHouseholdPct: 19.8,
    lecturersPer100k: 2.4,
    urbanFinanceSkillPct: 15.5,
    agriTraditionalSkillPct: 84.5,
    quadrantStatus: 'Q4: กลุ่มเฝ้าระวังหนี้สิน (หนี้สูง-พอเพียงปานกลาง)',
    statusColor: '#ea580c',
    statusBg: '#ffedd5'
  },
  {
    region: 'ภาคใต้',
    sufficiencyScore: 4.81,
    moralLevel: 'พอใช้',
    consumerDebtBaht: 6050,
    savingsHouseholdPct: 21.0,
    lecturersPer100k: 3.1,
    urbanFinanceSkillPct: 18.0,
    agriTraditionalSkillPct: 82.0,
    quadrantStatus: 'Q4: กลุ่มเฝ้าระวังหนี้สิน (หนี้สูง-พอเพียงปานกลาง)',
    statusColor: '#d97706',
    statusBg: '#fef3c7'
  },
  {
    region: 'ภาคเหนือ',
    sufficiencyScore: 4.23,
    moralLevel: 'มาก',
    consumerDebtBaht: 5171,
    savingsHouseholdPct: 24.5,
    lecturersPer100k: 5.6,
    urbanFinanceSkillPct: 8.5,
    agriTraditionalSkillPct: 91.5,
    quadrantStatus: 'Q2: กลุ่มสมดุลพอดี (หนี้ต่ำ-พอเพียงสูง)',
    statusColor: '#059669',
    statusBg: '#d1fae5'
  },
  {
    region: 'ภาคตะวันออกเฉียงเหนือ',
    sufficiencyScore: 4.37,
    moralLevel: 'มาก',
    consumerDebtBaht: 4431,
    savingsHouseholdPct: 27.2,
    lecturersPer100k: 6.8,
    urbanFinanceSkillPct: 6.0,
    agriTraditionalSkillPct: 94.0,
    quadrantStatus: 'Q2: กลุ่มต้นแบบพึ่งตนเอง (หนี้ต่ำสุด-พอเพียงสูงสุด)',
    statusColor: '#2563eb',
    statusBg: '#dbeafe'
  },
  {
    region: 'ทั่วราชอาณาจักร',
    sufficiencyScore: 4.91,
    moralLevel: 'มาก',
    consumerDebtBaht: 5624,
    savingsHouseholdPct: 22.2,
    lecturersPer100k: 3.8,
    urbanFinanceSkillPct: 12.0,
    agriTraditionalSkillPct: 88.0,
    quadrantStatus: 'ค่าอ้างอิงระดับประเทศ',
    statusColor: '#334155',
    statusBg: '#e2e8f0',
    isNationalAvg: true
  }
];

export const SUFFICIENCY_CONTENT_PROFILE_DONUT = [
  {
    name: 'เกษตรทฤษฎีใหม่ / ปราชญ์ชาวบ้านชนบท',
    value: 62,
    color: '#059669',
    desc: 'เน้นพึ่งตนเองภาคเกษตรและเศรษฐกิจชุมชนชนบท'
  },
  {
    name: 'ปรัชญาเศรษฐกิจพอเพียงขั้นพื้นฐานในสถานศึกษา',
    value: 26,
    color: '#10b981',
    desc: 'เน้นการอบรมเยาวชนและนักเรียนในโรงเรียน'
  },
  {
    name: 'วินัยการเงินคนเมือง / บริหารหนี้บัตรเครดิต-นอกระบบ',
    value: 12,
    color: '#dc2626',
    desc: 'ขาดแคลนหนักในกลุ่มแรงงานอุตสาหกรรมและคนเมือง'
  }
];

// ============================================================================
// 3. ด้านที่ 3: คุณธรรมด้านวินัยรับผิดชอบ (Discipline) vs ธรรมาภิบาล สิทธิมนุษยชน & อุบัติเหตุ
// ============================================================================
export interface SynergyDisciplineRow {
  region: string;
  disciplineScore: number; // เต็ม 5
  moralLevel: string;
  itaInd9Raw: number; // เต็ม 100
  itaInd9Scaled: number; // แปลงฐาน 6
  alignmentGap: number; // ช่องว่างสอดคล้อง (วินัย - ITA ฐาน 6)
  nhrcComplaints: number; // เรื่องร้องเรียน กสม. (เรื่อง)
  trafficAccidents: number; // คดีอุบัติเหตุจราจร (คดี)
  governanceSummary: string;
  statusColor: string;
  statusBg: string;
  isNationalAvg?: boolean;
}

export const SYNERGY_DISCIPLINE_TABLE: SynergyDisciplineRow[] = [
  {
    region: 'กรุงเทพฯ และปริมณฑล',
    disciplineScore: 4.71,
    moralLevel: 'พอใช้',
    itaInd9Raw: 84.60,
    itaInd9Scaled: 5.08,
    alignmentGap: -0.37,
    nhrcComplaints: 345,
    trafficAccidents: 168,
    governanceSummary: 'รัฐเปิดเผยข้อมูลสูง แต่วินัยพลเมืองหย่อนยาน',
    statusColor: '#dc2626',
    statusBg: '#fee2e2'
  },
  {
    region: 'ภาคกลาง',
    disciplineScore: 4.88,
    moralLevel: 'มาก',
    itaInd9Raw: 82.30,
    itaInd9Scaled: 4.94,
    alignmentGap: -0.06,
    nhrcComplaints: 215,
    trafficAccidents: 142,
    governanceSummary: 'ความรับผิดชอบและกฎระเบียบปานกลางค่อนข้างดี',
    statusColor: '#ea580c',
    statusBg: '#ffedd5'
  },
  {
    region: 'ภาคใต้',
    disciplineScore: 4.79,
    moralLevel: 'พอใช้',
    itaInd9Raw: 79.50,
    itaInd9Scaled: 4.77,
    alignmentGap: 0.02,
    nhrcComplaints: 162,
    trafficAccidents: 84,
    governanceSummary: 'วินัยพลเมืองและธรรมาภิบาลรัฐหย่อนยานคู่ขนาน',
    statusColor: '#d97706',
    statusBg: '#fef3c7'
  },
  {
    region: 'ภาคเหนือ',
    disciplineScore: 4.2,
    moralLevel: 'มาก',
    itaInd9Raw: 86.12,
    itaInd9Scaled: 5.17,
    alignmentGap: -0.13,
    nhrcComplaints: 140,
    trafficAccidents: 76,
    governanceSummary: 'วินัยพลเมืองสูง รัฐโปร่งใส สอดคล้องกลมกลืน',
    statusColor: '#059669',
    statusBg: '#d1fae5'
  },
  {
    region: 'ภาคตะวันออกเฉียงเหนือ',
    disciplineScore: 4.27,
    moralLevel: 'มาก',
    itaInd9Raw: 88.45,
    itaInd9Scaled: 5.31,
    alignmentGap: -0.19,
    nhrcComplaints: 165,
    trafficAccidents: 68,
    governanceSummary: 'พลเมืองตื่นรู้และร่วมตรวจสอบการใช้อำนาจรัฐ',
    statusColor: '#2563eb',
    statusBg: '#dbeafe'
  },
  {
    region: 'รวม / ค่าเฉลี่ย',
    disciplineScore: 4.91,
    moralLevel: 'มาก',
    itaInd9Raw: 84.19,
    itaInd9Scaled: 5.05,
    alignmentGap: -0.14,
    nhrcComplaints: 1027,
    trafficAccidents: 538,
    governanceSummary: 'ภาพรวมระดับประเทศ (กสม. 1,027 เรื่อง • อุบัติเหตุ 538 คดี)',
    statusColor: '#334155',
    statusBg: '#e2e8f0',
    isNationalAvg: true
  }
];

export const DISCIPLINE_5_SUBDIMENSIONS_RADAR = [
  {
    dimension: 'วินัยจราจรและความปลอดภัย',
    lecturerCoveragePct: 24,
    problemSeverityPct: 88
  },
  {
    dimension: 'เคารพกฎหมายและสิทธิมนุษยชน (กสม.)',
    lecturerCoveragePct: 18,
    problemSeverityPct: 82
  },
  {
    dimension: 'วินัยต่อหน้าที่ราชการ/นิติธรรม',
    lecturerCoveragePct: 48,
    problemSeverityPct: 74
  },
  {
    dimension: 'วินัยทางการเงินและการออม',
    lecturerCoveragePct: 32,
    problemSeverityPct: 79
  },
  {
    dimension: 'วินัยสิ่งแวดล้อมและสาธารณะ',
    lecturerCoveragePct: 72,
    problemSeverityPct: 58
  }
];

export const NHRC_COMPLAINTS_BREAKDOWN = [
  { name: 'สิทธิชุมชนและสิ่งแวดล้อม', pct: 40.85, count: 420, lecturerMatchPct: 14.0, color: '#dc2626' },
  { name: 'สิทธิในกระบวนการยุติธรรม', pct: 16.90, count: 174, lecturerMatchPct: 8.5, color: '#ea580c' },
  { name: 'เสรีภาพในชีวิตและร่างกาย', pct: 9.86, count: 101, lecturerMatchPct: 11.2, color: '#d97706' },
  { name: 'สิทธิสวัสดิการและสถานะบุคคล', pct: 18.20, count: 187, lecturerMatchPct: 26.3, color: '#2563eb' },
  { name: 'สิทธิอื่นๆ และการเลือกปฏิบัติ', pct: 14.19, count: 145, lecturerMatchPct: 40.0, color: '#64748b' }
];

// ============================================================================
// 4. ด้านที่ 4: คุณธรรมด้านกตัญญู (Gratitude) vs สุขภาวะและความสุขในสังคมสูงวัย
// ============================================================================
export interface SynergyGratitudeRow {
  ageGroup: string;
  gratitudeScore: number; // เต็ม 5
  elderlyPop2567: number; // จำนวนประชากรสูงวัย ปี 2567 (คน)
  desirableHealthPop: number; // สุขภาพกายพึงประสงค์ (คน)
  undesirableHealthPop: number; // สุขภาพกายไม่พึงประสงค์ (คน)
  undesirableHealthPct: number; // สัดส่วนสุขภาพถดถอย (%)
  highHappinessPop: number; // ความสุขระดับมาก-มากที่สุด (คน)
  highHappinessPct: number; // สัดส่วนผู้มีความสุขสูง (%)
  familyRoleSummary: string;
  statusColor: string;
  statusBg: string;
  isSummaryRow?: boolean;
  isComparisonRow?: boolean;
}

export const SYNERGY_GRATITUDE_TABLE: SynergyGratitudeRow[] = [
  {
    ageGroup: '60 – 69 ปี (วัยต้น)',
    gratitudeScore: 4.4,
    elderlyPop2567: 8321036,
    desirableHealthPop: 2339310,
    undesirableHealthPop: 5953985,
    undesirableHealthPct: 71.6,
    highHappinessPop: 4989617,
    highHappinessPct: 60.0,
    familyRoleSummary: 'พึ่งตนเองได้ เกื้อกูลลูกหลาน ดูแลสังคม',
    statusColor: '#059669',
    statusBg: '#d1fae5'
  },
  {
    ageGroup: '70 – 79 ปี (วัยกลาง)',
    gratitudeScore: 4.46,
    elderlyPop2567: 4180852,
    desirableHealthPop: 1052437,
    undesirableHealthPop: 3114967,
    undesirableHealthPct: 74.5,
    highHappinessPop: 2221932,
    highHappinessPct: 53.1,
    familyRoleSummary: 'ภาวะพึ่งพิงเริ่มเพิ่ม ต้องอาศัยการบริบาล',
    statusColor: '#d97706',
    statusBg: '#fef3c7'
  },
  {
    ageGroup: '80 ปีขึ้นไป (วัยปลาย)',
    gratitudeScore: 4.52,
    elderlyPop2567: 1525523,
    desirableHealthPop: 274174,
    undesirableHealthPop: 1249327,
    undesirableHealthPct: 81.9,
    highHappinessPop: 628012,
    highHappinessPct: 41.2,
    familyRoleSummary: 'ติดบ้าน/ติดเตียง กตัญญูค้ำจุนสภาพจิตใจ',
    statusColor: '#dc2626',
    statusBg: '#fee2e2'
  },
  {
    ageGroup: 'รวมผู้สูงอายุ 60+ ปี',
    gratitudeScore: 4.43,
    elderlyPop2567: 14027411,
    desirableHealthPop: 3665921,
    undesirableHealthPop: 10318279,
    undesirableHealthPct: 73.6,
    highHappinessPop: 7839561,
    highHappinessPct: 55.9,
    familyRoleSummary: 'ภาพรวมผู้สูงอายุทั้งประเทศ (14.03 ล้านคน)',
    statusColor: '#1e40af',
    statusBg: '#dbeafe',
    isSummaryRow: true
  },
  {
    ageGroup: 'กลุ่มเปรียบเทียบ: เยาวชน (15–24 ปี)',
    gratitudeScore: 4.74,
    elderlyPop2567: 0,
    desirableHealthPop: 0,
    undesirableHealthPop: 0,
    undesirableHealthPct: 0,
    highHappinessPop: 0,
    highHappinessPct: 0,
    familyRoleSummary: 'Gap ความกตัญญูระหว่างวัย = -0.58 คะแนน (สัญญาณเตือนสายสัมพันธ์ครอบครัว)',
    statusColor: '#7c3aed',
    statusBg: '#ede9fe',
    isComparisonRow: true
  }
];

export const GRATITUDE_INTERGENERATIONAL_GAP_BY_REGION = [
  { region: 'กรุงเทพฯ และปริมณฑล', elderlyScore: 4.32, youthScore: 4.42, gap: -0.76, elderlyPopMillion: 1.46, gratitudeLecturers: 68 },
  { region: 'ภาคกลาง', elderlyScore: 4.38, youthScore: 4.65, gap: -0.61, elderlyPopMillion: 3.78, gratitudeLecturers: 112 },
  { region: 'ภาคใต้', elderlyScore: 4.42, youthScore: 4.78, gap: -0.53, elderlyPopMillion: 1.66, gratitudeLecturers: 84 },
  { region: 'ภาคเหนือ', elderlyScore: 4.48, youthScore: 4.86, gap: -0.52, elderlyPopMillion: 2.91, gratitudeLecturers: 146 },
  { region: 'ภาคตะวันออกเฉียงเหนือ', elderlyScore: 4.54, youthScore: 4.98, gap: -0.47, elderlyPopMillion: 4.22, gratitudeLecturers: 125 }
];

// ============================================================================
// 5. ด้านที่ 5: ทุนชีวิต 4 พลังและจิตอาสา vs ความมั่นคงของเยาวชนและแรงงาน
// ============================================================================
export interface SynergyLifeCapitalRow {
  region: string;
  selfPowerScore: number; // พลังตัวตน (เต็ม 5)
  wisdomPowerScore: number; // พลังสร้างปัญญา (เต็ม 5)
  volunteerCapitalScore: number; // ทุนจิตอาสา (เต็ม 5)
  familyPowerScore: number; // พลังครอบครัว (เต็ม 5)
  eduDebtBaht: number; // หนี้เฉลี่ยเพื่อการศึกษา (บาท/ครัวเรือน)
  youthUnemploymentPct: number; // อัตราว่างงานเยาวชน 15-24 ปี (%)
  tpmapPoorPct: number; // ครัวเรือนยากจน TPMAP (%)
  ucGoldCardPct: number; // บัตรทอง UC (%)
  vulnerabilityStatus: string;
  statusColor: string;
  statusBg: string;
  isNationalAvg?: boolean;
}

export const SYNERGY_LIFECAPITAL_TABLE: SynergyLifeCapitalRow[] = [
  {
    region: 'กรุงเทพฯ และปริมณฑล',
    selfPowerScore: 4.65,
    wisdomPowerScore: 4.23,
    volunteerCapitalScore: 4.55,
    familyPowerScore: 4.68,
    eduDebtBaht: 2316,
    youthUnemploymentPct: 7.8,
    tpmapPoorPct: 9.8,
    ucGoldCardPct: 54.3,
    vulnerabilityStatus: 'เสี่ยงสูงเรื่องภาวะว่างงานและหลุดจากระบบ',
    statusColor: '#dc2626',
    statusBg: '#fee2e2'
  },
  {
    region: 'ภาคกลาง',
    selfPowerScore: 4.72,
    wisdomPowerScore: 4.80,
    volunteerCapitalScore: 4.80,
    familyPowerScore: 4.79,
    eduDebtBaht: 1275,
    youthUnemploymentPct: 5.4,
    tpmapPoorPct: 18.5,
    ucGoldCardPct: 68.5,
    vulnerabilityStatus: 'ปานกลาง ขาดทักษะแรงงานแห่งอนาคต',
    statusColor: '#ea580c',
    statusBg: '#ffedd5'
  },
  {
    region: 'ภาคใต้',
    selfPowerScore: 4.78,
    wisdomPowerScore: 4.85,
    volunteerCapitalScore: 4.96,
    familyPowerScore: 4.88,
    eduDebtBaht: 1427,
    youthUnemploymentPct: 5.9,
    tpmapPoorPct: 22.1,
    ucGoldCardPct: 72.1,
    vulnerabilityStatus: 'เฝ้าระวังโอกาสการเข้าถึงอุดมศึกษา',
    statusColor: '#d97706',
    statusBg: '#fef3c7'
  },
  {
    region: 'ภาคเหนือ',
    selfPowerScore: 4.95,
    wisdomPowerScore: 4.98,
    volunteerCapitalScore: 4.34,
    familyPowerScore: 4.22,
    eduDebtBaht: 1858,
    youthUnemploymentPct: 5.1,
    tpmapPoorPct: 28.4,
    ucGoldCardPct: 74.2,
    vulnerabilityStatus: 'สมดุล ทุนชุมชนเข้มแข็งค้ำจุน',
    statusColor: '#059669',
    statusBg: '#d1fae5'
  },
  {
    region: 'ภาคตะวันออกเฉียงเหนือ',
    selfPowerScore: 4.25,
    wisdomPowerScore: 4.29,
    volunteerCapitalScore: 4.48,
    familyPowerScore: 4.32,
    eduDebtBaht: 3415,
    youthUnemploymentPct: 6.2,
    tpmapPoorPct: 32.5,
    ucGoldCardPct: 78.4,
    vulnerabilityStatus: 'ลงทุนการศึกษาสูง ชุมชนเกื้อหนุนดีเลิศ',
    statusColor: '#2563eb',
    statusBg: '#dbeafe'
  },
  {
    region: 'ทั่วราชอาณาจักร',
    selfPowerScore: 4.84,
    wisdomPowerScore: 4.97,
    volunteerCapitalScore: 4.98,
    familyPowerScore: 4.92,
    eduDebtBaht: 2058,
    youthUnemploymentPct: 6.1,
    tpmapPoorPct: 22.3,
    ucGoldCardPct: 69.5,
    vulnerabilityStatus: 'ค่าเฉลี่ยอ้างอิงประเทศ',
    statusColor: '#334155',
    statusBg: '#e2e8f0',
    isNationalAvg: true
  }
];

export const LIFECAPITAL_4PILLARS_RADAR = [
  { pillar: 'พลังตัวตน (Self-efficacy)', bkkScore: 4.65, regionalAvgScore: 4.89, fullMark: 6.0 },
  { pillar: 'พลังครอบครัว (Family)', bkkScore: 4.68, regionalAvgScore: 4.98, fullMark: 6.0 },
  { pillar: 'พลังสร้างปัญญา (Wisdom)', bkkScore: 5.08, regionalAvgScore: 4.95, fullMark: 6.0 },
  { pillar: 'พลังชุมชนและจิตอาสา (Community)', bkkScore: 4.55, regionalAvgScore: 5.09, fullMark: 6.0 }
];

export const YOUTH_TARGET_GROUP_COVERAGE = [
  {
    region: 'กรุงเทพฯ และปริมณฑล',
    formalSchoolPct: 78,
    vocationalPct: 14,
    neetVulnerablePct: 8
  },
  {
    region: 'ภาคกลาง',
    formalSchoolPct: 74,
    vocationalPct: 16,
    neetVulnerablePct: 10
  },
  {
    region: 'ภาคใต้',
    formalSchoolPct: 70,
    vocationalPct: 18,
    neetVulnerablePct: 12
  },
  {
    region: 'ภาคเหนือ',
    formalSchoolPct: 64,
    vocationalPct: 20,
    neetVulnerablePct: 16
  },
  {
    region: 'ภาคตะวันออกเฉียงเหนือ',
    formalSchoolPct: 62,
    vocationalPct: 21,
    neetVulnerablePct: 17
  }
];

// ============================================================================
// 6. MASTER POLICY SYNERGY MATRIX & BUDGET REALLOCATION MATRIX
// ============================================================================
export interface MasterPolicySynergyRow {
  id: number;
  policyIssue: string;
  supplyDataset: string[];
  demandDataset: string[];
  analyticalMethods: string[];
  dashboardCharts: string[];
  rootCauses: string;
  targetAgenciesAndBudget: string;
  accentColor: string;
}

export const MASTER_POLICY_SYNERGY_MATRIX: MasterPolicySynergyRow[] = [
  {
    id: 1,
    policyIssue: '1. ป้องกันการทุจริต & ธรรมาภิบาลภาครัฐ',
    supplyDataset: ['ความเชี่ยวชาญสุจริต', 'สังกัด อปท./ส่วนกลาง', 'จังหวัดที่ปฏิบัติงาน'],
    demandDataset: ['สถิติคดีจัดซื้อจัดจ้าง ป.ป.ช.', 'คดีผลประโยชน์ทับซ้อน', 'ผลประเมิน ITA รายพื้นที่'],
    analyticalMethods: ['Integrity Intervention Deficit Index (IIDI)', 'Spatial Hotspot Analysis'],
    dashboardCharts: ['Bivariate Choropleth Map', 'Grouped Stacked Bar Chart'],
    rootCauses: 'วิทยากรกระจุกตัวในส่วนกลางและสถานศึกษา แต่คดีทุจริตกว่า 40% เกิดใน อปท. และการจัดซื้อจัดจ้างวิธีเฉพาะเจาะจง',
    targetAgenciesAndBudget: 'สำนักงาน ป.ป.ช. / สถ. / กรมบัญชีกลาง / สำนักงบประมาณ: ทุ่มงบสร้าง "วิทยากรตัวคูณด้านการจัดซื้อจัดจ้าง" เจาะตรง อปท. สีแดง',
    accentColor: '#dc2626'
  },
  {
    id: 2,
    policyIssue: '2. วินัยการเงิน & แก้หนี้ครัวเรือน',
    supplyDataset: ['ความเชี่ยวชาญพอเพียง', 'บริบทเกษตร vs การเงิน', 'ประวัติการอบรม'],
    demandDataset: ['หนี้อุปโภคบริโภคครัวเรือน', 'สัดส่วนเงินเหลือเก็บ', 'คะแนนคุณธรรมพอเพียง'],
    analyticalMethods: ['Gap & Content Profiling Analysis', "Spearman's Rank Correlation"],
    dashboardCharts: ['Quadrant Scatter Plot (4 จตุภาค)', 'Donut Chart (ความถนัดวิทยากร)'],
    rootCauses: 'วิทยากรชำนาญแต่วิถีเกษตรทฤษฎีใหม่ (85%+) ขณะที่วิกฤตหนี้สินรุนแรงสุดอยู่ในกลุ่มแรงงานเมืองและลูกจ้าง (หนี้บริโภค > 7,158 บาท)',
    targetAgenciesAndBudget: 'ธปท. / กระทรวงการคลัง / สศช. / แรงงาน: จัดงบ Re-skill วิทยากรพอเพียงเป็น "โค้ชวินัยการเงินคนเมือง" สู่โรงงานและชุมชนเมือง',
    accentColor: '#059669'
  },
  {
    id: 3,
    policyIssue: '3. สังคมสูงวัย & บริบาลระยะยาว (LTC)',
    supplyDataset: ['ความเชี่ยวชาญกตัญญู', 'การพัฒนาครอบครัว', 'กลุ่มอายุวิทยากร'],
    demandDataset: ['สัดส่วนประชากรสูงวัย 60+ (14.03 ล้านคน)', 'สถิติความสุขผู้สูงอายุ (55.9%)', 'ทุนชีวิตพลังครอบครัว'],
    analyticalMethods: ['Caregiver Capacity Ratio', 'Intergenerational Synergy Modeling'],
    dashboardCharts: ['Bubble Chart ผสาน 100% Stacked Bar', 'Dumbbell Plot (Gap วัยรุ่น vs สูงวัย)'],
    rootCauses: 'วิทยากรด้านกตัญญูมีน้อยที่สุด (10%) แต่ประเทศเข้าสู่ Aged Society เร็วมาก และเกิดช่องว่างความกตัญญูระหว่างวัย (-0.58)',
    targetAgenciesAndBudget: 'กระทรวง พม. / สปสช. / กระทรวงการคลัง: ผูกงบ LTC ผลิต "ผู้บริบาลคุณธรรม (Moral Caregivers)" และลดหย่อนภาษีดูแลบุพการีขั้นบันได',
    accentColor: '#7c3aed'
  },
  {
    id: 4,
    policyIssue: '4. วินัยจราจร & การเคารพสิทธิพลเมือง',
    supplyDataset: ['ความเชี่ยวชาญวินัย', 'สังกัดตำรวจ/ขนส่ง/ศธ.', 'กลุ่มเป้าหมายที่อบรม'],
    demandDataset: ['เรื่องร้องเรียน กสม. 1,027 เรื่อง', 'สถิติอุบัติเหตุจราจร (538 คดี)', 'ITA ตัวชี้วัดที่ 9 (84.19)'],
    analyticalMethods: ['Cross-lagged Impact Analysis', 'Sectoral Representation Gap'],
    dashboardCharts: ['Dumbbell Chart (Gap วินัย vs ITA)', 'Radar Chart (วินัย 5 มิติ) & Donut กสม.'],
    rootCauses: 'อบรมวินัยผูกขาดเฉพาะในโรงเรียน แต่วิกฤตอุบัติเหตุและการละเมิดสิทธิมนุษยชน (รัฐถูกร้องเรียน 53.46%) เกิดในกลุ่มผู้ใหญ่',
    targetAgenciesAndBudget: 'กสม. / คมนาคม (กปถ.) / กระทรวงยุติธรรม / สตช.: ตั้งกองทุนวิทยากรไกล่เกลี่ยสิทธิชุมชน และผูกหลักสูตรวินัยเข้ากับระบบตัดแต้มใบขับขี่',
    accentColor: '#2563eb'
  },
  {
    id: 5,
    policyIssue: '5. ทุนชีวิต & เยาวชนว่างงาน/กลุ่มเสี่ยง',
    supplyDataset: ['ความเชี่ยวชาญจิตอาสา', 'ทุนชีวิต 4 พลัง', 'โค้ชเยาวชนนอกระบบ'],
    demandDataset: ['อัตราว่างงานเยาวชน 15–24 ปี (7.8% ใน กทม.)', 'หนี้เพื่อการศึกษา (2,058 บ.)', 'ครัวเรือนยากจน TPMAP (22.3%)'],
    analyticalMethods: ['School-to-Work Transition Risk Index', 'Social Capital Multiplier (SCM)'],
    dashboardCharts: ['Scatter Plot with Regression Trendline', 'Radar 4 พลัง & Stacked Bar (NEETs)'],
    rootCauses: 'ขาดวิทยากรลงพื้นที่อาชีวะและเด็กนอกระบบ (NEETs) ทั้งที่เป็นกลุ่มที่ขาดพลังตัวตน (Self-efficacy 4.65) ในการปรับตัวสู่ตลาดงาน',
    targetAgenciesAndBudget: 'กสศ. / กระทรวงแรงงาน / อว. / กยศ.: ตั้งงบโครงการ "Life Capital Mentorship" ส่งโค้ชคุณธรรมลงสู่อาชีวะและเด็กนอกระบบ',
    accentColor: '#d97706'
  }
];

export interface BudgetReallocationRow {
  dimension: string;
  redZones: string;
  obsoleteBudgetToCut: string;
  targetedNewBudget: string;
  leadAgencies: string;
  badgeColor: string;
}

export const MASTER_BUDGET_REALLOCATION_MATRIX: BudgetReallocationRow[] = [
  {
    dimension: '1. สุจริต & ต้านทุจริต',
    redZones: 'กรุงเทพมหานคร และ อปท. ในเขตภาคกลาง (15 จังหวัด)',
    obsoleteBudgetToCut: 'งบอบรมบรรยายต้านโกงทั่วไปในสถานศึกษาและส่วนกลางที่ซ้ำซ้อน',
    targetedNewBudget: 'ทุ่มงบคลินิกพี่เลี้ยงวิทยากรจัดซื้อจัดจ้างคุณธรรม (Integrity Procurement Taskforce) เจาะลึก อปท. ที่มีความเสี่ยงสูง',
    leadAgencies: 'ป.ป.ช., กรมบัญชีกลาง, สถ., สำนักงบประมาณ',
    badgeColor: '#dc2626'
  },
  {
    dimension: '2. พอเพียง & แก้หนี้',
    redZones: 'กรุงเทพฯ ปริมณฑล และชุมชนแรงงานอุตสาหกรรมภาคกลาง',
    obsoleteBudgetToCut: 'งบอบรมเกษตรพอเพียงในพื้นที่เมืองที่ไม่สอดคล้องกับอาชีพแรงงาน',
    targetedNewBudget: 'จัดสรรงบ Re-skill วิทยากรพอเพียงเป็น "โค้ชวินัยการเงินคนเมือง" ควบคู่กับคลินิกแก้หนี้ในโรงงานและสถานประกอบการ',
    leadAgencies: 'ธนาคารแห่งประเทศไทย (ธปท.), สศช., กระทรวงแรงงาน, กระทรวงการคลัง',
    badgeColor: '#059669'
  },
  {
    dimension: '3. วินัย & สิทธิมนุษยชน',
    redZones: 'กรุงเทพฯ ปริมณฑล และหน่วยงานบังคับใช้กฎหมาย',
    obsoleteBudgetToCut: 'งบผลิตสื่อประชาสัมพันธ์และป้ายรณรงค์แบบตั้งรับ',
    targetedNewBudget: 'ตั้งกองทุนวิทยากรไกล่เกลี่ยข้อพิพาทสิทธิชุมชน และเชื่อมโยงระบบตัดคะแนนจราจรเข้ากับค่ายอบรมปรับพฤติกรรม',
    leadAgencies: 'สำนักงาน กสม., กระทรวงยุติธรรม, สตช., กระทรวงคมนาคม (กปถ.)',
    badgeColor: '#2563eb'
  },
  {
    dimension: '4. กตัญญู & สังคมสูงวัย',
    redZones: 'ชุมชนเมืองทั่วประเทศ และกลุ่มผู้สูงอายุ 70+ ปี',
    obsoleteBudgetToCut: 'งบจัดกิจกรรมสันทนาการผู้สูงอายุแบบจัดอีเวนต์ชั่วคราว',
    targetedNewBudget: 'บูรณาการงบ Long-Term Care (LTC) สร้าง "ผู้บริบาลคุณธรรมและจิตวิทยาครอบครัว" ดูแลผู้ป่วยติดบ้านติดเตียง',
    leadAgencies: 'กระทรวง พม., สปสช., กรมอนามัย, กระทรวงการคลัง',
    badgeColor: '#7c3aed'
  },
  {
    dimension: '5. ทุนชีวิต & เยาวชน',
    redZones: 'สถาบันอาชีวศึกษา และเยาวชนนอกระบบ (NEETs) ใน กทม./เมืองใหญ่',
    obsoleteBudgetToCut: 'งบจัดนิทรรศการวิชาการและการแจกทุนการศึกษาแบบไร้เงื่อนไขพี่เลี้ยง',
    targetedNewBudget: 'ทุ่มงบ "Life Capital Mentorship" ส่งโค้ชเสริมพลังตัวตนและทักษะชีวิต (Soft Skills) ก่อนก้าวสู่ตลาดแรงงาน',
    leadAgencies: 'กสศ., กระทรวง อว., กรมการจัดหางาน (กระทรวงแรงงาน), กยศ.',
    badgeColor: '#d97706'
  }
];

export const BI_READY_MASTER_DATASET = [
  {
    region: 'กรุงเทพฯ และปริมณฑล',
    sufficiency_score: 4.62,
    discipline_score: 4.71,
    integrity_score: 4.68,
    public_mind_score: 4.55,
    consumer_debt_baht: 7158,
    nacc_cases: 210,
    procurement_fraud_pct: 52.3,
    ita_ind9_scaled: 5.08,
    discipline_ita_gap: -0.37,
    youth_unemployment_pct: 7.8,
    elderly_pop_60up: 1456740,
    procurement_risk_tier: 'High Risk (Red Zone)'
  },
  {
    region: 'ภาคกลาง',
    sufficiency_score: 4.78,
    discipline_score: 4.88,
    integrity_score: 4.75,
    public_mind_score: 4.80,
    consumer_debt_baht: 6028,
    nacc_cases: 168,
    procurement_fraud_pct: 49.8,
    ita_ind9_scaled: 4.94,
    discipline_ita_gap: -0.06,
    youth_unemployment_pct: 5.4,
    elderly_pop_60up: 3778750,
    procurement_risk_tier: 'High Risk (Red Zone)'
  },
  {
    region: 'ภาคใต้',
    sufficiency_score: 4.81,
    discipline_score: 4.79,
    integrity_score: 4.82,
    public_mind_score: 4.96,
    consumer_debt_baht: 6050,
    nacc_cases: 115,
    procurement_fraud_pct: 46.2,
    ita_ind9_scaled: 4.77,
    discipline_ita_gap: 0.02,
    youth_unemployment_pct: 5.9,
    elderly_pop_60up: 1659190,
    procurement_risk_tier: 'Normal/Low Risk'
  },
  {
    region: 'ภาคเหนือ',
    sufficiency_score: 4.23,
    discipline_score: 4.2,
    integrity_score: 4.29,
    public_mind_score: 4.34,
    consumer_debt_baht: 5171,
    nacc_cases: 98,
    procurement_fraud_pct: 38.0,
    ita_ind9_scaled: 5.17,
    discipline_ita_gap: -0.13,
    youth_unemployment_pct: 5.1,
    elderly_pop_60up: 2913885,
    procurement_risk_tier: 'Normal/Low Risk'
  },
  {
    region: 'ภาคตะวันออกเฉียงเหนือ',
    sufficiency_score: 4.37,
    discipline_score: 4.27,
    integrity_score: 4.42,
    public_mind_score: 4.48,
    consumer_debt_baht: 4431,
    nacc_cases: 142,
    procurement_fraud_pct: 41.5,
    ita_ind9_scaled: 5.31,
    discipline_ita_gap: -0.19,
    youth_unemployment_pct: 6.2,
    elderly_pop_60up: 4218846,
    procurement_risk_tier: 'Normal/Low Risk'
  }
];

export const PYTHON_DATA_CONNECTOR_CODE = `import pandas as pd

# 1. รวบรวมชุดข้อมูลบูรณาการระดับภูมิภาค (Regional Integrated Master Dataset)
dashboard_master_data = {
    "region": [
        "กรุงเทพฯ และปริมณฑล",
        "ภาคกลาง",
        "ภาคใต้",
        "ภาคเหนือ",
        "ภาคตะวันออกเฉียงเหนือ",
    ],
    "sufficiency_score": [4.62, 4.78, 4.81, 5.08, 5.24],
    "discipline_score": [3.93, 4.07, 3.99, 4.20, 4.27],
    "integrity_score": [4.68, 4.75, 4.82, 5.15, 5.30],
    "public_mind_score": [4.55, 4.80, 4.96, 5.21, 5.38],
    "consumer_debt_baht": [7158, 6028, 6050, 5171, 4431],
    "nacc_cases": [210, 168, 115, 98, 142],
    "procurement_fraud_pct": [52.3, 49.8, 46.2, 38.0, 41.5],
    "ita_ind9_scaled": [5.08, 4.94, 4.77, 5.17, 5.31],
    "youth_unemployment_pct": [7.8, 5.4, 5.9, 5.1, 6.2],
    "elderly_pop_60up": [1456740, 3778750, 1659190, 2913885, 4218846],
}

df_master = pd.DataFrame(dashboard_master_data)

# 2. คำนวณดัชนีชี้วัดเชิงวิเคราะห์ (Analytical Index Calculation)
# ช่องว่างความสอดคล้องด้านวินัยและธรรมาภิบาล (Alignment Gap: วินัยพลเมือง - ITA)
df_master["discipline_ita_gap"] = (
    df_master["discipline_score"] - df_master["ita_ind9_scaled"]
).round(2)

# จัดกลุ่มพื้นที่วิกฤตความเสี่ยงทุจริตจัดซื้อจัดจ้าง (Procurement Risk Classification)
df_master["procurement_risk_tier"] = df_master["procurement_fraud_pct"].apply(
    lambda x: "High Risk (Red Zone)" if x >= 48.0 else "Normal/Low Risk"
)

# ส่งออกเป็นไฟล์ CSV สำหรับสร้าง Dashboard Visualizations
df_master.to_csv("bi_ready_moral_synergy_dashboard.csv", index=False)`;
