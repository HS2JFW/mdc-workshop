export type MoralCreditSynergyTabKey =
  | 'overview'
  | 'financial_mcws'
  | 'stem_mwai'
  | 'civic_bcr'
  | 'master_matrix';

export interface MoralCreditSynergyTab {
  key: MoralCreditSynergyTabKey;
  shortLabel: string;
  topicCode?: string;
  fullTitle: string;
  subtitle: string;
  icon: string;
  badgeColor: string;
  lightBg: string;
  borderColor: string;
}

export const MORAL_CREDIT_SYNERGY_TABS: MoralCreditSynergyTab[] = [
  {
    key: 'overview',
    shortLabel: 'ภาพรวม',
    fullTitle: 'Moral Credit Dashboard (ระบบสะสมหน่วยกิตความดีเชิงประจักษ์)',
    subtitle:
      'แดชบอร์ดสรุปภาพรวมและวิเคราะห์ความสัมพันธ์จากไฟล์ Moral Credit_รายงานสถิติบันทึกความดี.xlsx (สมาชิก 275 คน • 726 แถวข้อมูล • 1,148 ครั้ง • 9,229 คะแนนสะสม)',
    icon: '✨',
    badgeColor: '#1e3a8a',
    lightBg: '#eff6ff',
    borderColor: '#93c5fd'
  },
  {
    key: 'financial_mcws',
    topicCode: 'หัวข้อ 1.1',
    shortLabel: '1.1 แก้หนี้ครัวเรือน & สินเชื่อฐานราก (MCWS)',
    fullTitle:
      'หัวข้อ 1.1: Moral Credit กับการแก้หนี้ครัวเรือนและการเข้าถึงสินเชื่อฐานราก (Alternative Credit Scoring & Debt Alleviation)',
    subtitle:
      'บูรณาการแต้มวินัยการเงิน Moral Credit ร่วมกับสถิติหนี้บริโภค (สศช./สถิติแห่งชาติ), สัดส่วนการออม (TPMAP) และดัชนีพอเพียง เพื่อสร้างคะแนนเครดิตคุณธรรม (MCWS) ทดแทนหลักทรัพย์ค้ำประกัน',
    icon: '💳',
    badgeColor: '#059669',
    lightBg: '#ecfdf5',
    borderColor: '#6ee7b7'
  },
  {
    key: 'stem_mwai',
    topicCode: 'หัวข้อ 1.2',
    shortLabel: '1.2 การเรียนรู้ตลอดชีวิต & วิทยาศาสตร์ (MWAI)',
    fullTitle:
      'หัวข้อ 1.2: Moral Credit กับการส่งเสริมการเรียนรู้ตลอดชีวิตและลดความเหลื่อมล้ำทางวิทยาศาสตร์ (Lifelong Learning & STEM Access)',
    subtitle:
      'บูรณาการการแลกแต้มความดีเป็นตั๋วการเรียนรู้ (Learning Vouchers) ร่วมกับฐานข้อมูลเด็กยากจนพิเศษ (กสศ.), ทุนชีวิตพลังสร้างปัญญา (Benchmark 4.86) และพิกัดแหล่งเรียนรู้ อพวช.',
    icon: '🔬',
    badgeColor: '#2563eb',
    lightBg: '#eff6ff',
    borderColor: '#93c5fd'
  },
  {
    key: 'civic_bcr',
    topicCode: 'หัวข้อ 1.3',
    shortLabel: '1.3 วินัยพลเมือง ลดอุบัติเหตุ & ลดภาระเมือง (BCR)',
    fullTitle:
      'หัวข้อ 1.3: Moral Credit กับวินัยพลเมือง การลดอุบัติเหตุ และการลดภาระเมือง (Civic Discipline & Municipal Burden Reduction)',
    subtitle:
      'บูรณาการแต้มขับขี่ปลอดภัยและการคัดแยกขยะรีไซเคิล ร่วมกับสถิติอุบัติเหตุจราจร (สตช.), ต้นทุนกำจัดขยะ อปท. และผลประเมิน ITA เพื่อวัดความคุ้มค่าทางเศรษฐศาสตร์ (BCR = 3.98 เท่า)',
    icon: '🚦',
    badgeColor: '#7c3aed',
    lightBg: '#f5f3ff',
    borderColor: '#c4b5fd'
  },
  {
    key: 'master_matrix',
    topicCode: 'Master Matrix',
    shortLabel: 'ผังเชื่อมโยงยุทธศาสตร์ & Data Schema',
    fullTitle:
      'ผังเชื่อมโยงเชิงยุทธศาสตร์เพื่อการตัดสินใจเชิงนโยบาย (Master Policy Synergy Matrix & Data Ingestion Schema)',
    subtitle:
      'สังเคราะห์โครงสร้างพื้นฐานข้อมูลพฤติกรรม (Behavioral Data Infrastructure) เชื่อมโยงสมการสถิติ แหล่งข้อมูลภายนอก และการจัดสรรงบประมาณแผ่นดินแบบมุ่งเป้า',
    icon: '🏛️',
    badgeColor: '#d97706',
    lightBg: '#fffbeb',
    borderColor: '#fcd34d'
  }
];

// ============================================================================
// หัวข้อ 1.1: ข้อมูลแก้หนี้ครัวเรือนและการเข้าถึงสินเชื่อฐานราก (Alternative Credit Scoring)
// ============================================================================
export interface MoralCreditFinancialRow {
  region: string;
  moralPoints: number; // เต็ม 1,000
  sufficiencyScore: number; // เต็ม 5
  savingRatePct: number; // %
  consumerDebtThb: number; // บาท/ครัวเรือน
  mcwsScore: number; // 0-100
  repaymentRatePct: number; // %
  tierCode: 'Prime_Plus' | 'Prime' | 'Near_Prime' | 'Subprime' | 'National_Benchmark';
  tierLabel: string;
  riskColor: string;
  badgeBg: string;
  isBenchmark?: boolean;
}

export const MORAL_CREDIT_FINANCIAL_DATA: MoralCreditFinancialRow[] = [
  {
    region: 'ภาคตะวันออกเฉียงเหนือ',
    moralPoints: 880,
    sufficiencyScore: 4.37,
    savingRatePct: 68.4,
    consumerDebtThb: 4431,
    mcwsScore: 81.92,
    repaymentRatePct: 97.2,
    tierCode: 'Prime_Plus',
    tierLabel: 'ความน่าเชื่อถือสูงมาก (Prime Plus)',
    riskColor: '#059669',
    badgeBg: '#d1fae5'
  },
  {
    region: 'ภาคเหนือ',
    moralPoints: 820,
    sufficiencyScore: 4.23,
    savingRatePct: 63.8,
    consumerDebtThb: 5171,
    mcwsScore: 77.34,
    repaymentRatePct: 95.8,
    tierCode: 'Prime',
    tierLabel: 'ความน่าเชื่อถือสูง (Prime)',
    riskColor: '#2563eb',
    badgeBg: '#dbeafe'
  },
  {
    region: 'ภาคกลาง',
    moralPoints: 640,
    sufficiencyScore: 4.78,
    savingRatePct: 51.2,
    consumerDebtThb: 6028,
    mcwsScore: 64.86,
    repaymentRatePct: 89.4,
    tierCode: 'Near_Prime',
    tierLabel: 'ปานกลาง (Near Prime)',
    riskColor: '#d97706',
    badgeBg: '#fef3c7'
  },
  {
    region: 'ภาคใต้',
    moralPoints: 610,
    sufficiencyScore: 4.81,
    savingRatePct: 48.0,
    consumerDebtThb: 6050,
    mcwsScore: 62.85,
    repaymentRatePct: 88.1,
    tierCode: 'Near_Prime',
    tierLabel: 'ปานกลาง (Near Prime)',
    riskColor: '#d97706',
    badgeBg: '#fef3c7'
  },
  {
    region: 'กรุงเทพฯ และปริมณฑล',
    moralPoints: 480,
    sufficiencyScore: 4.62,
    savingRatePct: 42.5,
    consumerDebtThb: 7158,
    mcwsScore: 55.05,
    repaymentRatePct: 81.6,
    tierCode: 'Subprime',
    tierLabel: 'เฝ้าระวังวินัยการเงิน (Subprime)',
    riskColor: '#dc2626',
    badgeBg: '#fee2e2'
  },
  {
    region: 'ค่าเฉลี่ยระดับประเทศ',
    moralPoints: 686,
    sufficiencyScore: 4.91,
    savingRatePct: 54.8,
    consumerDebtThb: 5624,
    mcwsScore: 68.4,
    repaymentRatePct: 90.4,
    tierCode: 'National_Benchmark',
    tierLabel: 'เกณฑ์มาตรฐานระดับชาติ',
    riskColor: '#1e3a8a',
    badgeBg: '#e0f2fe',
    isBenchmark: true
  }
];

// ข้อมูลกราฟ Credit Frontier ROC Curve & Repayment Rate by Deciles (Decile 1–10)
export interface CreditFrontierDecilePoint {
  decile: string;
  mcwsRange: string;
  mcwsMidpoint: number;
  repaymentRateMoralCredit: number;
  repaymentRateTraditional: number;
  defaultRatePct: number;
  recommendedInterestReductionPct: number;
}

export const CREDIT_FRONTIER_DECILE_CURVE: CreditFrontierDecilePoint[] = [
  { decile: 'D1', mcwsRange: '10–25', mcwsMidpoint: 18, repaymentRateMoralCredit: 68.5, repaymentRateTraditional: 64.0, defaultRatePct: 31.5, recommendedInterestReductionPct: 0.0 },
  { decile: 'D2', mcwsRange: '26–35', mcwsMidpoint: 31, repaymentRateMoralCredit: 73.2, repaymentRateTraditional: 67.5, defaultRatePct: 26.8, recommendedInterestReductionPct: 0.0 },
  { decile: 'D3', mcwsRange: '36–45', mcwsMidpoint: 41, repaymentRateMoralCredit: 78.0, repaymentRateTraditional: 71.0, defaultRatePct: 22.0, recommendedInterestReductionPct: 0.25 },
  { decile: 'D4', mcwsRange: '46–55', mcwsMidpoint: 51, repaymentRateMoralCredit: 81.6, repaymentRateTraditional: 74.2, defaultRatePct: 18.4, recommendedInterestReductionPct: 0.5 },
  { decile: 'D5', mcwsRange: '56–62', mcwsMidpoint: 59, repaymentRateMoralCredit: 86.4, repaymentRateTraditional: 77.8, defaultRatePct: 13.6, recommendedInterestReductionPct: 0.75 },
  { decile: 'D6', mcwsRange: '63–68', mcwsMidpoint: 65, repaymentRateMoralCredit: 89.4, repaymentRateTraditional: 80.5, defaultRatePct: 10.6, recommendedInterestReductionPct: 1.0 },
  { decile: 'D7', mcwsRange: '69–74', mcwsMidpoint: 72, repaymentRateMoralCredit: 92.8, repaymentRateTraditional: 83.0, defaultRatePct: 7.2, recommendedInterestReductionPct: 1.0 },
  { decile: 'D8', mcwsRange: '75–80', mcwsMidpoint: 77, repaymentRateMoralCredit: 95.8, repaymentRateTraditional: 85.4, defaultRatePct: 4.2, recommendedInterestReductionPct: 1.25 },
  { decile: 'D9', mcwsRange: '81–88', mcwsMidpoint: 84, repaymentRateMoralCredit: 97.2, repaymentRateTraditional: 87.2, defaultRatePct: 2.8, recommendedInterestReductionPct: 1.5 },
  { decile: 'D10', mcwsRange: '89–100', mcwsMidpoint: 94, repaymentRateMoralCredit: 98.9, repaymentRateTraditional: 89.0, defaultRatePct: 1.1, recommendedInterestReductionPct: 1.5 }
];

// ข้อมูลผังกระแสการแปลงผลสัมฤทธิ์ (Sankey Flow Stages) สำหรับหัวข้อ 1.1
export interface FinancialSankeyStage {
  stageOrder: number;
  stageTitle: string;
  stageSubtitle: string;
  nodes: {
    label: string;
    metricValue: string;
    sharePct: number;
    color: string;
    detail: string;
  }[];
}

export const FINANCIAL_SANKEY_FLOW_STAGES: FinancialSankeyStage[] = [
  {
    stageOrder: 1,
    stageTitle: '1. กิจกรรมบันทึกความดี (Behavioral Input)',
    stageSubtitle: 'พฤติกรรมวินัยการเงินและพอเพียงในชุมชน',
    nodes: [
      { label: 'ออมสัจจะสม่ำเสมอ & ลดรายจ่าย', metricValue: '54.8% ครัวเรือนออม', sharePct: 42, color: '#059669', detail: 'การออมกลุ่มสัจจะวันละ 1–10 บาทต่อเนื่อง' },
      { label: 'ทำบัญชีครัวเรือน & พอเพียง', metricValue: 'เฉลี่ย 4.09 / 5.00', sharePct: 35, color: '#2563eb', detail: 'ดัชนีคุณธรรมด้านพอเพียงและการพึ่งพาตนเอง' },
      { label: 'ชำระหนี้กองทุนหมู่บ้านตรงเวลา', metricValue: '686 แต้มเฉลี่ย', sharePct: 23, color: '#7c3aed', detail: 'ประวัติวินัยการชำระคืนในระดับชุมชน' }
    ]
  },
  {
    stageOrder: 2,
    stageTitle: '2. คะแนนเครดิตคุณธรรม (MCWS Engine)',
    stageSubtitle: 'การประมวลผล Alternative Credit Scoring',
    nodes: [
      { label: 'Prime Plus & Prime (MCWS ≥ 75)', metricValue: 'ภาคอีสาน 81.92 • เหนือ 77.34', sharePct: 48, color: '#059669', detail: 'กลุ่มวินัยสูงมาก ทดแทนหลักทรัพย์ค้ำประกันได้ 100%' },
      { label: 'Near Prime (MCWS 60–74)', metricValue: 'ภาคกลาง 64.86 • ใต้ 62.85', sharePct: 34, color: '#d97706', detail: 'กลุ่มวินัยปานกลาง ใช้แต้มค้ำประกันร่วมกับ บสย.' },
      { label: 'Subprime (MCWS < 60)', metricValue: 'กทม.และปริมณฑล 55.05', sharePct: 18, color: '#dc2626', detail: 'กลุ่มเฝ้าระวัง ต้องเข้าโปรแกรมฟื้นฟูวินัยการเงินก่อนกู้' }
    ]
  },
  {
    stageOrder: 3,
    stageTitle: '3. สิทธิประโยชน์สินเชื่อ SFIs (Policy Intervention)',
    stageSubtitle: 'งบอุดหนุนชดเชยดอกเบี้ย 2,000 ล้านบาท',
    nodes: [
      { label: 'ธนาคารออมสิน & ธ.ก.ส. ลดดอกเบี้ย', metricValue: 'ลดดอกเบี้ย 1.0%–1.5%/ปี', sharePct: 60, color: '#1e3a8a', detail: 'สินเชื่อฐานรากสำหรับผู้ถือบัตรสวัสดิการแห่งรัฐที่มีแต้มถึงเกณฑ์' },
      { label: 'บสย. ค้ำประกันด้วยแต้มความดี', metricValue: 'ปลอดหลักทรัพย์ค้ำประกัน', sharePct: 40, color: '#0891b2', detail: 'ปลดล็อกกับดัก Collateral Trap ให้ผู้ประกอบการรายย่อย' }
    ]
  },
  {
    stageOrder: 4,
    stageTitle: '4. ผลสัมฤทธิ์ทางเศรษฐกิจ (Empirical Outcome)',
    stageSubtitle: 'การลดหนี้นอกระบบและควบคุม NPL',
    nodes: [
      { label: 'อัตราชำระคืนตรงเวลาสูงสุด', metricValue: '95.8%–97.2% (อีสาน/เหนือ)', sharePct: 68, color: '#059669', detail: 'พิสูจน์ว่าผู้มีแต้ม Moral Credit สูงมี NPL ต่ำกว่าเกณฑ์ปกติ' },
      { label: 'ดึงครัวเรือนพ้นวงจรหนี้นอกระบบ', metricValue: 'ลดภาระดอกเบี้ยนอกระบบ', sharePct: 32, color: '#2563eb', detail: 'เปลี่ยนภาระดอกเบี้ยร้อยละ 20/เดือน เป็นสินเชื่อในระบบดอกเบี้ยต่ำ' }
    ]
  }
];

export const MORAL_CREDIT_FINANCIAL_JSON_SPEC = {
  module: 'Moral_Credit_Financial',
  chart_type: 'credit_frontier_and_sankey',
  data: [
    { region: 'ภาคตะวันออกเฉียงเหนือ', moral_points: 880, sufficiency_score: 4.37, saving_rate: 68.4, consumer_debt: 4431, mcws_score: 81.92, repayment_rate: 97.2, tier: 'Prime_Plus' },
    { region: 'ภาคเหนือ', moral_points: 820, sufficiency_score: 4.23, saving_rate: 63.8, consumer_debt: 5171, mcws_score: 77.34, repayment_rate: 95.8, tier: 'Prime' },
    { region: 'ภาคกลาง', moral_points: 640, sufficiency_score: 4.78, saving_rate: 51.2, consumer_debt: 6028, mcws_score: 64.86, repayment_rate: 89.4, tier: 'Near_Prime' },
    { region: 'ภาคใต้', moral_points: 610, sufficiency_score: 4.81, saving_rate: 48.0, consumer_debt: 6050, mcws_score: 62.85, repayment_rate: 88.1, tier: 'Near_Prime' },
    { region: 'กรุงเทพฯ และปริมณฑล', moral_points: 480, sufficiency_score: 4.62, saving_rate: 42.5, consumer_debt: 7158, mcws_score: 55.05, repayment_rate: 81.6, tier: 'Subprime' }
  ]
};

// ============================================================================
// หัวข้อ 1.2: ข้อมูลการส่งเสริมการเรียนรู้ตลอดชีวิตและลดความเหลื่อมล้ำทางวิทยาศาสตร์ (STEM Access)
// ============================================================================
export interface MoralCreditStemRow {
  region: string;
  poorStudents: number; // คน (กสศ.)
  redemptions: number; // ครั้ง
  redemptionRatePct: number; // %
  wisdomScore: number; // เต็ม 5 (Benchmark = 4.05)
  mwaiIndex: number; // ดัชนีเข้าถึงปัญญา
  centersCount: number; // แห่ง
  statusCode: 'High_Access' | 'Moderate_Access' | 'Low_Access' | 'Severe_Shortage' | 'Learning_Desert';
  statusLabel: string;
  statusColor: string;
  badgeBg: string;
}

export const MORAL_CREDIT_STEM_DATA: MoralCreditStemRow[] = [
  {
    region: 'กรุงเทพฯ และปริมณฑล',
    poorStudents: 82000,
    redemptions: 45200,
    redemptionRatePct: 55.12,
    wisdomScore: 4.23,
    mwaiIndex: 0.576,
    centersCount: 28,
    statusCode: 'High_Access',
    statusLabel: 'เข้าถึงง่าย (ศูนย์เรียนรู้หนาแน่น)',
    statusColor: '#059669',
    badgeBg: '#d1fae5'
  },
  {
    region: 'ภาคกลาง',
    poorStudents: 95000,
    redemptions: 28400,
    redemptionRatePct: 29.89,
    wisdomScore: 4.8,
    mwaiIndex: 0.295,
    centersCount: 12,
    statusCode: 'Moderate_Access',
    statusLabel: 'ปานกลาง (เดินทางสะดวก)',
    statusColor: '#2563eb',
    badgeBg: '#dbeafe'
  },
  {
    region: 'ภาคเหนือ',
    poorStudents: 135000,
    redemptions: 34500,
    redemptionRatePct: 25.56,
    wisdomScore: 4.98,
    mwaiIndex: 0.262,
    centersCount: 9,
    statusCode: 'Low_Access',
    statusLabel: 'เฝ้าระวังพื้นที่ห่างไกล',
    statusColor: '#d97706',
    badgeBg: '#fef3c7'
  },
  {
    region: 'ภาคใต้',
    poorStudents: 110000,
    redemptions: 22100,
    redemptionRatePct: 20.09,
    wisdomScore: 4.85,
    mwaiIndex: 0.201,
    centersCount: 6,
    statusCode: 'Severe_Shortage',
    statusLabel: 'ขาดแคลนแหล่งเรียนรู้',
    statusColor: '#ea580c',
    badgeBg: '#ffedd5'
  },
  {
    region: 'ภาคตะวันออกเฉียงเหนือ',
    poorStudents: 220000,
    redemptions: 41200,
    redemptionRatePct: 18.73,
    wisdomScore: 4.29,
    mwaiIndex: 0.198,
    centersCount: 7,
    statusCode: 'Learning_Desert',
    statusLabel: 'วิกฤตทะเลทรายแห่งการเรียนรู้ (Learning Desert)',
    statusColor: '#dc2626',
    badgeBg: '#fee2e2'
  }
];

// ข้อมูลโครงสร้าง 3 ชั้นสำหรับ Multi-level Sunburst / Concentric Breakdown (หัวข้อ 1.2)
export interface StemSunburstRingItem {
  ringLevel: 1 | 2 | 3;
  ringTitle: string;
  name: string;
  redemptionsCount: number;
  sharePct: number;
  wisdomLiftScore: string;
  color: string;
  parentCategory?: string;
}

export const STEM_SUNBURST_RINGS_DATA: StemSunburstRingItem[] = [
  // ชั้นที่ 1 (Inner Ring): กิจกรรมทำความดีที่เยาวชนสะสมแต้ม
  { ringLevel: 1, ringTitle: 'ชั้นใน: ประเภทความดีที่เยาวชนบันทึก', name: 'จิตอาสาในโรงเรียน & ชุมชน', redemptionsCount: 82200, sharePct: 48.0, wisdomLiftScore: '+0.42 คะแนน', color: '#2563eb' },
  { ringLevel: 1, ringTitle: 'ชั้นใน: ประเภทความดีที่เยาวชนบันทึก', name: 'อนุรักษ์สิ่งแวดล้อม & คัดแยกขยะ', redemptionsCount: 53100, sharePct: 31.0, wisdomLiftScore: '+0.35 คะแนน', color: '#059669' },
  { ringLevel: 1, ringTitle: 'ชั้นใน: ประเภทความดีที่เยาวชนบันทึก', name: 'กตัญญู & ช่วยเหลือเพื่อน/ครอบครัว', redemptionsCount: 36100, sharePct: 21.0, wisdomLiftScore: '+0.29 คะแนน', color: '#7c3aed' },

  // ชั้นที่ 2 (Middle Ring): ประเภทแหล่งเรียนรู้ที่นำแต้มไปแลก (Learning Vouchers)
  { ringLevel: 2, ringTitle: 'ชั้นกลาง: แหล่งเรียนรู้ที่นำแต้มไปแลกสิทธิ์', name: 'พิพิธภัณฑ์วิทยาศาสตร์ อพวช. & สวนวิทยาศาสตร์', redemptionsCount: 75400, sharePct: 44.0, wisdomLiftScore: '+0.45 คะแนน', color: '#1d4ed8', parentCategory: 'จิตอาสาในโรงเรียน & ชุมชน' },
  { ringLevel: 2, ringTitle: 'ชั้นกลาง: แหล่งเรียนรู้ที่นำแต้มไปแลกสิทธิ์', name: 'นิทรรศการดาราศาสตร์ & ท้องฟ้าจำลองสัญจร', redemptionsCount: 49700, sharePct: 29.0, wisdomLiftScore: '+0.38 คะแนน', color: '#0d9488', parentCategory: 'อนุรักษ์สิ่งแวดล้อม & คัดแยกขยะ' },
  { ringLevel: 2, ringTitle: 'ชั้นกลาง: แหล่งเรียนรู้ที่นำแต้มไปแลกสิทธิ์', name: 'คอร์สทักษะดิจิทัล โค้ดดิ้ง & ศูนย์เรียนรู้ TK Park', redemptionsCount: 46300, sharePct: 27.0, wisdomLiftScore: '+0.41 คะแนน', color: '#6d28d9', parentCategory: 'กตัญญู & ช่วยเหลือเพื่อน/ครอบครัว' },

  // ชั้นที่ 3 (Outer Ring): ระดับการเปลี่ยนแปลงของพลังสร้างปัญญา (Delta Wisdom)
  { ringLevel: 3, ringTitle: 'ชั้นนอก: ผลลัพธ์การเติบโตของพลังสร้างปัญญา', name: 'ก้าวกระโดดสูงกว่าเกณฑ์ชาติ (≥ 4.25 / 5.00)', redemptionsCount: 86400, sharePct: 50.4, wisdomLiftScore: 'สูงกว่า Benchmark 4.05 (+0.24)', color: '#059669' },
  { ringLevel: 3, ringTitle: 'ชั้นนอก: ผลลัพธ์การเติบโตของพลังสร้างปัญญา', name: 'ผ่านเกณฑ์มาตรฐานระดับชาติ (4.86–5.09)', redemptionsCount: 56700, sharePct: 33.1, wisdomLiftScore: 'ผ่านเกณฑ์ Benchmark 4.86', color: '#2563eb' },
  { ringLevel: 3, ringTitle: 'ชั้นนอก: ผลลัพธ์การเติบโตของพลังสร้างปัญญา', name: 'กลุ่มรอคาราวานวิทยาศาสตร์เคลื่อนที่เข้าถึง', redemptionsCount: 28300, sharePct: 16.5, wisdomLiftScore: 'ต้องการ Mobile STEM Caravan', color: '#d97706' }
];

export const MORAL_CREDIT_STEM_JSON_SPEC = {
  module: 'Moral_Credit_STEM',
  chart_type: 'sunburst_and_learning_desert_map',
  data: [
    { region: 'กรุงเทพฯ และปริมณฑล', poor_students: 82000, redemptions: 45200, wisdom_score: 4.23, mwai_index: 0.576, centers: 28, status: 'High_Access' },
    { region: 'ภาคกลาง', poor_students: 95000, redemptions: 28400, wisdom_score: 4.8, mwai_index: 0.295, centers: 12, status: 'Moderate_Access' },
    { region: 'ภาคเหนือ', poor_students: 135000, redemptions: 34500, wisdom_score: 4.98, mwai_index: 0.262, centers: 9, status: 'Low_Access' },
    { region: 'ภาคใต้', poor_students: 110000, redemptions: 22100, wisdom_score: 4.85, mwai_index: 0.201, centers: 6, status: 'Severe_Shortage' },
    { region: 'ภาคตะวันออกเฉียงเหนือ', poor_students: 220000, redemptions: 41200, wisdom_score: 4.29, mwai_index: 0.198, centers: 7, status: 'Learning_Desert' }
  ]
};

// ============================================================================
// หัวข้อ 1.3: ข้อมูลวินัยพลเมือง การลดอุบัติเหตุ และการลดภาระเมือง (Civic Discipline)
// ============================================================================
export interface MoralCreditCivicRow {
  municipality: string;
  shortCity: string;
  region: string;
  participants: number; // คน
  recycledWasteTons: number; // ตัน
  wasteBudgetSavedMthb: number; // ล้านบาท (ตันละ 1,200 บาท)
  accidentsReducedCases: number; // คดี
  accidentCostSavedMthb: number; // ล้านบาท
  totalBenefitMthb: number; // ล้านบาท (waste + accident)
  subsidyCostMthb: number; // ล้านบาท
  bcrRatio: number; // เท่า
  accidentsBeforeCases: number; // ก่อนเริ่มโครงการ (สำหรับ Diverging Slopegraph)
  accidentsAfterCases: number; // หลังเริ่มโครงการ (สำหรับ Diverging Slopegraph)
  landfillBeforeTons: number; // ก่อนเริ่มโครงการ
  landfillAfterTons: number; // หลังเริ่มโครงการ
  isTotalRow?: boolean;
}

export const MORAL_CREDIT_CIVIC_DATA: MoralCreditCivicRow[] = [
  {
    municipality: 'เทศบาลนครขอนแก่น',
    shortCity: 'ขอนแก่น',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    participants: 45000,
    recycledWasteTons: 12400,
    wasteBudgetSavedMthb: 14.88,
    accidentsReducedCases: 58,
    accidentCostSavedMthb: 46.4,
    totalBenefitMthb: 61.28,
    subsidyCostMthb: 12.5,
    bcrRatio: 4.9,
    accidentsBeforeCases: 215,
    accidentsAfterCases: 157,
    landfillBeforeTons: 48500,
    landfillAfterTons: 36100
  },
  {
    municipality: 'เทศบาลนครเชียงใหม่',
    shortCity: 'เชียงใหม่',
    region: 'ภาคเหนือ',
    participants: 38000,
    recycledWasteTons: 9800,
    wasteBudgetSavedMthb: 11.76,
    accidentsReducedCases: 45,
    accidentCostSavedMthb: 36.0,
    totalBenefitMthb: 47.76,
    subsidyCostMthb: 10.2,
    bcrRatio: 4.68,
    accidentsBeforeCases: 190,
    accidentsAfterCases: 145,
    landfillBeforeTons: 42000,
    landfillAfterTons: 32200
  },
  {
    municipality: 'เทศบาลนครพิษณุโลก',
    shortCity: 'พิษณุโลก',
    region: 'ภาคเหนือ',
    participants: 24000,
    recycledWasteTons: 6500,
    wasteBudgetSavedMthb: 7.8,
    accidentsReducedCases: 28,
    accidentCostSavedMthb: 22.4,
    totalBenefitMthb: 30.2,
    subsidyCostMthb: 6.8,
    bcrRatio: 4.44,
    accidentsBeforeCases: 128,
    accidentsAfterCases: 100,
    landfillBeforeTons: 27500,
    landfillAfterTons: 21000
  },
  {
    municipality: 'เทศบาลนครสุราษฎร์ธานี',
    shortCity: 'สุราษฎร์ธานี',
    region: 'ภาคใต้',
    participants: 22000,
    recycledWasteTons: 5200,
    wasteBudgetSavedMthb: 6.24,
    accidentsReducedCases: 24,
    accidentCostSavedMthb: 19.2,
    totalBenefitMthb: 25.44,
    subsidyCostMthb: 6.0,
    bcrRatio: 4.24,
    accidentsBeforeCases: 118,
    accidentsAfterCases: 94,
    landfillBeforeTons: 24200,
    landfillAfterTons: 19000
  },
  {
    municipality: 'กรุงเทพมหานคร (3 เขตนำร่อง)',
    shortCity: 'กทม. (นำร่อง)',
    region: 'กรุงเทพฯ และปริมณฑล',
    participants: 62000,
    recycledWasteTons: 15600,
    wasteBudgetSavedMthb: 18.72,
    accidentsReducedCases: 72,
    accidentCostSavedMthb: 57.6,
    totalBenefitMthb: 76.32,
    subsidyCostMthb: 25.0,
    bcrRatio: 3.05,
    accidentsBeforeCases: 340,
    accidentsAfterCases: 268,
    landfillBeforeTons: 68000,
    landfillAfterTons: 52400
  },
  {
    municipality: 'รวมโครงการนำร่อง (5 พื้นที่)',
    shortCity: 'รวมนำร่อง',
    region: 'ค่าเฉลี่ยระดับประเทศ',
    participants: 191000,
    recycledWasteTons: 49500,
    wasteBudgetSavedMthb: 59.4,
    accidentsReducedCases: 227,
    accidentCostSavedMthb: 181.6,
    totalBenefitMthb: 241.0,
    subsidyCostMthb: 60.5,
    bcrRatio: 3.98,
    accidentsBeforeCases: 991,
    accidentsAfterCases: 764,
    landfillBeforeTons: 210200,
    landfillAfterTons: 160700,
    isTotalRow: true
  }
];

// ข้อมูล Pareto 80/20 พฤติกรรมวินัยพลเมืองที่ลดต้นทุนบริการสาธารณะของเมือง (หัวข้อ 1.3)
export interface CivicDisciplineParetoItem {
  behaviorName: string;
  shortBehavior: string;
  moralPointsGeneratedPct: number;
  municipalCostSavedMthb: number;
  cumulativeImpactPct: number;
  isTop20Core: boolean;
}

export const CIVIC_DISCIPLINE_PARETO_DATA: CivicDisciplineParetoItem[] = [
  {
    behaviorName: '1. ขับขี่ปลอดภัยไร้ใบสั่งตลอดปี (Zero-Traffic-Violation Bonus)',
    shortBehavior: 'ไร้ใบสั่งจราจร (Zero Violation)',
    moralPointsGeneratedPct: 38.5,
    municipalCostSavedMthb: 118.4,
    cumulativeImpactPct: 49.1,
    isTop20Core: true
  },
  {
    behaviorName: '2. คัดแยกขยะรีไซเคิลและขยะอินทรีย์ต้นทางครัวเรือน (แลกแต้มลดค่าขยะ)',
    shortBehavior: 'คัดแยกขยะต้นทางครัวเรือน',
    moralPointsGeneratedPct: 29.5,
    municipalCostSavedMthb: 74.8,
    cumulativeImpactPct: 80.2,
    isTop20Core: true
  },
  {
    behaviorName: '3. สวมหมวกนิรภัย 100% & หยุดรถให้คนข้ามทางม้าลาย',
    shortBehavior: 'หมวกนิรภัย & ทางม้าลาย',
    moralPointsGeneratedPct: 14.0,
    municipalCostSavedMthb: 24.6,
    cumulativeImpactPct: 90.4,
    isTop20Core: false
  },
  {
    behaviorName: '4. ใช้ขนส่งสาธารณะพลังงานสะอาด & ลดใช้รถยนต์ส่วนบุคคล',
    shortBehavior: 'ใช้ขนส่งสาธารณะ (Green Transit)',
    moralPointsGeneratedPct: 10.5,
    municipalCostSavedMthb: 14.2,
    cumulativeImpactPct: 96.3,
    isTop20Core: false
  },
  {
    behaviorName: '5. แจ้งเหตุจุดเสี่ยงอุบัติเหตุและจุดขยะตกค้างผ่านแอปพลิเคชันเมือง',
    shortBehavior: 'แจ้งพิกัดจุดเสี่ยงเมือง (Active Citizen)',
    moralPointsGeneratedPct: 7.5,
    municipalCostSavedMthb: 9.0,
    cumulativeImpactPct: 100.0,
    isTop20Core: false
  }
];

export const MORAL_CREDIT_CIVIC_JSON_SPEC = {
  module: 'Moral_Credit_Civic',
  chart_type: 'diverging_slopegraph_and_pareto',
  data: [
    { city: 'ขอนแก่น', waste_saved_mthb: 14.88, accident_saved_mthb: 46.4, subsidy_mthb: 12.5, bcr_ratio: 4.9 },
    { city: 'เชียงใหม่', waste_saved_mthb: 11.76, accident_saved_mthb: 36.0, subsidy_mthb: 10.2, bcr_ratio: 4.68 },
    { city: 'พิษณุโลก', waste_saved_mthb: 7.8, accident_saved_mthb: 22.4, subsidy_mthb: 6.8, bcr_ratio: 4.44 },
    { city: 'สุราษฎร์ธานี', waste_saved_mthb: 6.24, accident_saved_mthb: 19.2, subsidy_mthb: 6.0, bcr_ratio: 4.24 },
    { city: 'กทม. (นำร่อง)', waste_saved_mthb: 18.72, accident_saved_mthb: 57.6, subsidy_mthb: 25.0, bcr_ratio: 3.05 }
  ]
};

// ============================================================================
// ผังเชื่อมโยงเชิงยุทธศาสตร์เพื่อการตัดสินใจเชิงนโยบาย (Master Policy Synergy Matrix)
// ============================================================================
export interface MoralCreditMasterMatrixRow {
  topicKey: Exclude<MoralCreditSynergyTabKey, 'overview' | 'master_matrix'>;
  mechanism: string;
  strategicDimension: string;
  internalDataset: string;
  externalSynergyDatasets: string;
  statisticalFormulaTitle: string;
  statisticalEquationText: string;
  chartPresentation: string;
  policyAndBudgetTargeting: string;
  budgetAmountText: string;
  targetAgencies: string;
  apiEndpoint: string;
  badgeColor: string;
}

export const MORAL_CREDIT_MASTER_POLICY_MATRIX: MoralCreditMasterMatrixRow[] = [
  {
    topicKey: 'financial_mcws',
    mechanism: 'Moral Credit (วินัยการเงิน & พอเพียง)',
    strategicDimension: '1.1 แก้หนี้ครัวเรือน & สินเชื่อฐานราก (Alternative Credit Scoring)',
    internalDataset: 'แต้มวินัยการเงิน (บัญชีครัวเรือน, ออมสัจจะ, ชำระหนี้ตรงเวลา) เต็ม 1,000 แต้ม',
    externalSynergyDatasets: 'หนี้บริโภคเฉลี่ยรายจังหวัด (สศช./สถิติแห่งชาติ), สัดส่วนเงินออม & เดไซล์รายได้ 1–3 (TPMAP), ดัชนีคุณธรรมพอเพียง (สเกล 1–6)',
    statisticalFormulaTitle: 'คะแนนเครดิตคุณธรรม (MCWS) & Logistic Non-Default Model',
    statisticalEquationText: 'P(Non-Default) = 1 / [1 + exp(-(β₀ + β₁·MCWS + β₂·Saving_Rate + ε))]',
    chartPresentation: 'Credit Frontier ROC Curve (Decile 1–10) & Sankey Conversion Flow Diagram',
    policyAndBudgetTargeting: 'จัดสรรงบชดเชยดอกเบี้ยสินเชื่อฐานราก SFIs ให้ผู้ถือบัตรสวัสดิการแห่งรัฐที่มีแต้มวินัยการเงินเกินเกณฑ์ ลดดอกเบี้ยกู้ยืม 1.0–1.5% ต่อปีโดยไม่ต้องใช้หลักทรัพย์ค้ำประกัน',
    budgetAmountText: '2,000 ล้านบาท (Interest & Credit Guarantee Subsidy)',
    targetAgencies: 'กระทรวงการคลัง, ธปท., ธนาคารออมสิน, ธ.ก.ส., บสย.',
    apiEndpoint: '/api/v1/moral-credit/financial',
    badgeColor: '#059669'
  },
  {
    topicKey: 'stem_mwai',
    mechanism: 'Moral Credit (จิตอาสา & กตัญญูเยาวชน)',
    strategicDimension: '1.2 การศึกษาตลอดชีวิต & ลดความเหลื่อมล้ำวิทยาศาสตร์ (STEM Access)',
    internalDataset: 'แต้มความดีเด็ก/เยาวชน และสถิติการแลกแต้มเข้าชมสวนวิทยาศาสตร์/อพวช./TK Park',
    externalSynergyDatasets: 'เด็กยากจนและยากจนพิเศษ (กสศ.), ดัชนีทุนชีวิต 4 พลัง (พลังสร้างปัญญา Benchmark 4.86), ดัชนีความยากจนด้านการศึกษา (TPMAP)',
    statisticalFormulaTitle: 'ดัชนีเข้าถึงปัญญา (MWAI) & Difference Wisdom Model',
    statisticalEquationText: 'ΔWisdom = α + β₁·(Moral Credit Redemptions) + β₂·(Baseline Capital) + ε',
    chartPresentation: 'Multi-level Sunburst Chart (3 ชั้น) & Choropleth Heatmap with STEM Facility Overlay',
    policyAndBudgetTargeting: 'อุดหนุนงบ Science Access Voucher ชดเชยรายได้ให้ อพวช. ตามแต้มที่เยาวชนแลก และจัดตั้งคาราวานวิทยาศาสตร์เคลื่อนที่ (Mobile STEM Caravans) ลุยพื้นที่อีสานและใต้',
    budgetAmountText: '450 ล้านบาท (Science Voucher & Mobile STEM Caravans)',
    targetAgencies: 'กระทรวง อว., กสศ., อพวช., TK Park',
    apiEndpoint: '/api/v1/moral-credit/stem-learning',
    badgeColor: '#2563eb'
  },
  {
    topicKey: 'civic_bcr',
    mechanism: 'Moral Credit (วินัยจราจร & คัดแยกขยะ)',
    strategicDimension: '1.3 วินัยพลเมือง การลดอุบัติเหตุ & การลดภาระเมือง (Civic Discipline)',
    internalDataset: 'แต้มขับขี่ปลอดภัย (Zero-Traffic-Violation Bonus) และแต้มคัดแยกขยะรีไซเคิลแลกส่วนลดค่าธรรมเนียม อปท.',
    externalSynergyDatasets: 'สถิติคดีอุบัติเหตุจราจร (สตช./คมนาคม), ต้นทุนกำจัดขยะ อปท. (1,200 บาท/ตัน), ดัชนีวินัยรับผิดชอบ (สเกล 1–6), ผลประเมิน ITA',
    statisticalFormulaTitle: 'อัตราส่วนผลประโยชน์ต่อต้นทุน (BCR) & Fixed Effects Panel Regression',
    statisticalEquationText: 'BCR = (งบกำจัดขยะที่ประหยัดได้ + มูลค่าความเสียหายอุบัติเหตุที่ลดลง) / งบอุดหนุนสิทธิประโยชน์แต้มความดี',
    chartPresentation: 'Diverging Before/After Slopegraph & 80/20 Civic Discipline Pareto Chart',
    policyAndBudgetTargeting: 'ออกระเบียบให้ อปท. กันงบสิ่งแวดล้อมและความปลอดภัยร้อยละ 10 จัดตั้ง “กองทุนแต้มความดีพัฒนาเมือง (Civic Moral Fund)” เปลี่ยนค่ากำจัดขยะเป็นส่วนลดภาษีท้องถิ่น/ตั๋วรถสาธารณะ',
    budgetAmountText: '60.50 ล้านบาท (สร้างผลตอบแทนคืนสู่เมือง 241.00 ลบ. • BCR = 3.98 เท่า)',
    targetAgencies: 'กระทรวงมหาดไทย, กรมส่งเสริมการปกครองท้องถิ่น (สถ.), อปท., สตช.',
    apiEndpoint: '/api/v1/moral-credit/civic-burden',
    badgeColor: '#7c3aed'
  }
];
