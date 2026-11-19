// moralOperationalMneData.ts
// ชุดข้อมูลสำหรับ Dashboard ภาคปฏิบัติการ (Multi-Provincial Operational & M&E Intelligence Platform)
// บูรณาการสถิติจริง 5 จังหวัด: พังงา (ใต้), ลำปาง และ น่าน (เหนือ), หนองคาย (อีสาน), กำแพงเพชร (กลาง/เหนือตอนล่าง)
// ครอบคลุม: MCA Multi-Criteria Analysis, 5-Virtue Radar, Maturity Levels, Rule Table Simulator, CIPP Bottleneck Matrix, และแบบจำลองพยากรณ์ 2569-2571

export interface OperationalProvinceStats {
  id: string;
  name: string;
  region: string;
  sampleSize: string;
  mcaScore: number;
  mcaLevel: string;
  mcaColor: string;
  scores: {
    volunteer: number;    // จิตอาสา
    sufficiency: number;  // พอเพียง
    gratitude: number;    // กตัญญู
    integrity: number;    // สุจริต
    discipline: number;   // วินัย
  };
  maturity: {
    level1: number; // ร้อยละ
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  };
  orgDistribution: {
    modelPct: number;
    modelCount: number;
    developingPct: number;
    developingCount: number;
    promotedPct: number;
    promotedCount: number;
  };
  pendingEvaluation: {
    pct: number;
    count: number;
  };
  policyExpansionRate: string;
  bottleneckBudgetPct: string;
  bottleneckMnePct: string;
  highlight: string;
  diagnosis: string;
}

// -------------------------------------------------------------
// 1. สถิติจริงระดับจังหวัด (PROVINCIAL REAL OPERATIONAL STATS)
// -------------------------------------------------------------
export const PROVINCIAL_OPERATIONAL_STATS: Record<string, OperationalProvinceStats> = {
  all: {
    id: 'all',
    name: 'ทั่วประเทศ (Multi-Province Overview)',
    region: 'ทุกภูมิภาคทั่วประเทศ',
    sampleSize: 'รวม 517+ องค์กร/หน่วยงาน',
    mcaScore: 3.48,
    mcaLevel: 'ระดับส่งเสริม เชิงบวกขั้นสูง (+3.48)',
    mcaColor: '#059669',
    scores: {
      volunteer: 4.54,
      sufficiency: 4.33,
      gratitude: 4.32,
      integrity: 4.31,
      discipline: 4.30
    },
    maturity: {
      level1: 100.0,
      level2: 97.4,
      level3: 79.8,
      level4: 68.2,
      level5: 48.6
    },
    orgDistribution: {
      modelPct: 43.1,
      modelCount: 223,
      developingPct: 24.8,
      developingCount: 128,
      promotedPct: 32.1,
      promotedCount: 166
    },
    pendingEvaluation: {
      pct: 11.2,
      count: 58
    },
    policyExpansionRate: '50.0% - 65.8%',
    bottleneckBudgetPct: '4.0% - 8.0%',
    bottleneckMnePct: '6.0% - 8.0%',
    highlight: 'จิตอาสาโดดเด่นสูงสุดทุกพื้นที่ (4.54) แต่วินัย (4.30) และสุจริต (4.31) ต้องเร่งยกระดับ',
    diagnosis: 'คอขวดวิกฤตระดับชาติ: มีแผนปฏิบัติการถึง 98.7% แต่งบประมาณ M&E ได้รับการจัดสรรเพียง 4-8%'
  },
  phangnga: {
    id: 'phangnga',
    name: 'จังหวัดพังงา',
    region: 'ภาคใต้ (8 อำเภอ)',
    sampleSize: 'N=279 องค์กร',
    mcaScore: 3.45,
    mcaLevel: 'ระดับส่งเสริม เชิงบวกขั้นสูง (+3.45)',
    mcaColor: '#059669',
    scores: {
      volunteer: 4.52,
      sufficiency: 4.40,
      gratitude: 4.38,
      integrity: 4.33,
      discipline: 4.32
    },
    maturity: {
      level1: 100.0,
      level2: 96.4,
      level3: 33.85,
      level4: 61.54,
      level5: 50.00
    },
    orgDistribution: {
      modelPct: 42.2,
      modelCount: 95,
      developingPct: 23.1,
      developingCount: 52,
      promotedPct: 34.7,
      promotedCount: 78
    },
    pendingEvaluation: {
      pct: 15.0,
      count: 10
    },
    policyExpansionRate: '50.00% (เพิ่มขึ้น 50%)',
    bottleneckBudgetPct: '6.0%',
    bottleneckMnePct: '7.5%',
    highlight: 'จิตอาสา 4.52 โดดเด่นสุด วินัยต่ำสุด 4.32 เติบโตองค์กรต้นแบบ +23.2% ต่อปี',
    diagnosis: 'พังงามีหน่วยงานรอการประเมิน 15% (10 หน่วยงาน) และยังขาดงบประมาณขับเคลื่อนต่อเนื่อง'
  },
  lampang: {
    id: 'lampang',
    name: 'จังหวัดลำปาง',
    region: 'ภาคเหนือ (13 อำเภอ)',
    sampleSize: 'N=99 องค์กร',
    mcaScore: 3.68,
    mcaLevel: 'ระดับส่งเสริมมุ่งสู่นวัตกรรม (+3.68)',
    mcaColor: '#047857',
    scores: {
      volunteer: 4.63,
      sufficiency: 4.10,
      gratitude: 3.90,
      integrity: 4.36,
      discipline: 4.39
    },
    maturity: {
      level1: 100.0,
      level2: 97.0,
      level3: 85.0,
      level4: 72.0,
      level5: 65.80
    },
    orgDistribution: {
      modelPct: 44.5,
      modelCount: 44,
      developingPct: 25.5,
      developingCount: 25,
      promotedPct: 30.0,
      promotedCount: 30
    },
    pendingEvaluation: {
      pct: 8.0,
      count: 8
    },
    policyExpansionRate: '65.80% (40 แห่งผลักดันสู่นโยบาย)',
    bottleneckBudgetPct: '7.2%',
    bottleneckMnePct: '8.0%',
    highlight: 'การเปลี่ยนแปลงเฉลี่ย 77.7% (จิตอาสา 90.9%, วินัย 84.8%, สุจริต 82.8%) ผลักดันนโยบาย 40 แห่ง',
    diagnosis: 'ลำปางเด่นเรื่องการผลักดันสู่นโยบายสาธารณะ (65.8%) แต่ต้องระวังมิติกตัญญูและพอเพียง'
  },
  nongkhai: {
    id: 'nongkhai',
    name: 'จังหวัดหนองคาย',
    region: 'ภาคตะวันออกเฉียงเหนือ (9 อำเภอ)',
    sampleSize: '60+ หน่วยงาน',
    mcaScore: 3.30,
    mcaLevel: 'ระดับส่งเสริม เชิงบวก (+3.30)',
    mcaColor: '#10b981',
    scores: {
      volunteer: 4.48,
      sufficiency: 4.25,
      gratitude: 4.32,
      integrity: 4.28,
      discipline: 4.20
    },
    maturity: {
      level1: 100.0,
      level2: 95.0,
      level3: 92.50,
      level4: 55.00,
      level5: 38.30
    },
    orgDistribution: {
      modelPct: 40.0,
      modelCount: 24,
      developingPct: 28.3,
      developingCount: 17,
      promotedPct: 31.7,
      promotedCount: 19
    },
    pendingEvaluation: {
      pct: 12.0,
      count: 7
    },
    policyExpansionRate: '38.30%',
    bottleneckBudgetPct: '4.5%',
    bottleneckMnePct: '6.0%',
    highlight: 'ขับเคลื่อน 5 ด้านครบถ้วนทุกองค์กร ระดับ 3 หนาแน่นสุด ภาคเอกชนเด่นระดับ 4-5',
    diagnosis: 'หนองคายมีหน่วยงานรอการประเมิน 12% (7 แห่ง) สพป.หนองคาย เขต 1 เป็นแกนนำยกระดับสู่ต้นแบบ'
  },
  kamphaengphet: {
    id: 'kamphaengphet',
    name: 'จังหวัดกำแพงเพชร',
    region: 'ภาคกลาง / เหนือตอนล่าง (11 อำเภอ)',
    sampleSize: '79 หน่วยงาน',
    mcaScore: 3.40,
    mcaLevel: 'ระดับส่งเสริม เชิงบวก (+3.40)',
    mcaColor: '#059669',
    scores: {
      volunteer: 4.45,
      sufficiency: 4.35,
      gratitude: 4.36,
      integrity: 4.30,
      discipline: 4.26
    },
    maturity: {
      level1: 100.0,
      level2: 98.73,
      level3: 100.0,
      level4: 88.61,
      level5: 42.00
    },
    orgDistribution: {
      modelPct: 45.6,
      modelCount: 36,
      developingPct: 24.0,
      developingCount: 19,
      promotedPct: 30.4,
      promotedCount: 24
    },
    pendingEvaluation: {
      pct: 10.1,
      count: 8
    },
    policyExpansionRate: '42.00%',
    bottleneckBudgetPct: '5.5%',
    bottleneckMnePct: '7.0%',
    highlight: 'ขับเคลื่อนระดับ 1-3 ครบ 100% ระดับ 4 แตะ 88.61% ยกระดับองค์กรตามเกณฑ์ 9 ข้ออย่างมีนัยสำคัญ',
    diagnosis: 'กำแพงเพชรระดับ 1-3 สมบูรณ์มาก แต่คอขวดอยู่ที่การก้าวข้ามจากระดับ 4 สู่ระดับ 5 (นโยบายสาธารณะ)'
  },
  nan: {
    id: 'nan',
    name: 'จังหวัดน่าน',
    region: 'ภาคเหนือ (15 อำเภอ)',
    sampleSize: '45+ หน่วยงาน',
    mcaScore: 3.35,
    mcaLevel: 'ระดับส่งเสริม เชิงบวก (+3.35)',
    mcaColor: '#10b981',
    scores: {
      volunteer: 4.50,
      sufficiency: 4.30,
      gratitude: 4.40,
      integrity: 4.25,
      discipline: 4.22
    },
    maturity: {
      level1: 100.0,
      level2: 94.0,
      level3: 88.0,
      level4: 58.0,
      level5: 41.50
    },
    orgDistribution: {
      modelPct: 41.5,
      modelCount: 19,
      developingPct: 27.0,
      developingCount: 12,
      promotedPct: 31.5,
      promotedCount: 14
    },
    pendingEvaluation: {
      pct: 9.0,
      count: 6
    },
    policyExpansionRate: '41.50%',
    bottleneckBudgetPct: '4.8%',
    bottleneckMnePct: '6.5%',
    highlight: 'โดดเด่นด้านพลังประชาสังคม วัฒนธรรมชุมชน บวร และมูลนิธิท้องถิ่นเข้มแข็ง',
    diagnosis: 'น่านมีภาคประชาสังคมและวัฒนธรรมเป็นแกนนำหลัก แต่ภาครัฐต้องหนุนงบประมาณถาวร'
  }
};

// เกณฑ์เป้าหมายมาตรฐานจังหวัด
export const STANDARD_BENCHMARK_TARGET = 4.50;

// -------------------------------------------------------------
// 2. ข้อมูลเปรียบเทียบ RADAR 5 ด้านข้ามจังหวัด (PANEL B)
// -------------------------------------------------------------
export interface CrossProvinceRadarItem {
  dimension: string;
  dimensionEn: string;
  phangnga: number;
  lampang: number;
  nongkhai: number;
  kamphaengphet: number;
  nan: number;
  target: number;
  weight: number;
}

export const CROSS_PROVINCE_RADAR_DATA: CrossProvinceRadarItem[] = [
  {
    dimension: 'จิตอาสา',
    dimensionEn: 'Volunteer',
    phangnga: 4.52,
    lampang: 4.63, // 90.9%
    nongkhai: 4.48,
    kamphaengphet: 4.45,
    nan: 4.50,
    target: 4.50,
    weight: 15
  },
  {
    dimension: 'พอเพียง',
    dimensionEn: 'Sufficiency',
    phangnga: 4.40,
    lampang: 4.10, // 70.0%
    nongkhai: 4.25,
    kamphaengphet: 4.35,
    nan: 4.30,
    target: 4.50,
    weight: 20
  },
  {
    dimension: 'กตัญญู',
    dimensionEn: 'Gratitude',
    phangnga: 4.38,
    lampang: 3.90, // 60.0%
    nongkhai: 4.32,
    kamphaengphet: 4.36,
    nan: 4.40,
    target: 4.50,
    weight: 20
  },
  {
    dimension: 'สุจริต',
    dimensionEn: 'Integrity',
    phangnga: 4.33,
    lampang: 4.36, // 82.8%
    nongkhai: 4.28,
    kamphaengphet: 4.30,
    nan: 4.25,
    target: 4.50,
    weight: 30
  },
  {
    dimension: 'วินัย',
    dimensionEn: 'Discipline',
    phangnga: 4.32,
    lampang: 4.39, // 84.8%
    nongkhai: 4.20,
    kamphaengphet: 4.26,
    nan: 4.22,
    target: 4.50,
    weight: 15
  }
];

// -------------------------------------------------------------
// 3. กราฟแท่งเปรียบเทียบวุฒิภาวะ 5 ระดับ (PANEL C)
// -------------------------------------------------------------
export interface ProvinceMaturityItem {
  province: string;
  provinceEn: string;
  level1: number; // ร้อยละ
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  sampleSize: string;
  dominantLevel: string;
  notes: string;
}

export const PROVINCE_MATURITY_DATA: ProvinceMaturityItem[] = [
  {
    province: 'กำแพงเพชร',
    provinceEn: 'Kamphaeng Phet',
    level1: 100.0,
    level2: 98.73,
    level3: 100.0,
    level4: 88.61,
    level5: 42.00,
    sampleSize: '79 หน่วยงาน',
    dominantLevel: 'ระดับ 1-3 เต็ม 100%, ระดับ 4 สูงถึง 88.61%',
    notes: 'ฐานรากแข็งแกร่งมาก ติดขัดการก้าวสู่ระดับ 5 นโยบายสาธารณะ'
  },
  {
    province: 'พังงา',
    provinceEn: 'Phang Nga',
    level1: 100.0,
    level2: 96.40,
    level3: 33.85,
    level4: 61.54,
    level5: 50.00,
    sampleSize: '279 องค์กร',
    dominantLevel: 'ระดับ 4 แตะ 61.54%, ระดับ 5 พุ่ง 50.00%',
    notes: 'ระดับ 4 เพิ่มขึ้น +29.03%, ระดับ 5 เพิ่มขึ้น +50.0% สูงเป็นประวัติการณ์'
  },
  {
    province: 'หนองคาย',
    provinceEn: 'Nong Khai',
    level1: 100.0,
    level2: 95.00,
    level3: 92.50,
    level4: 55.00,
    level5: 38.30,
    sampleSize: '60+ หน่วยงาน',
    dominantLevel: 'ระดับ 3 หนาแน่นสุด 92.50%',
    notes: 'ระดับ 3 หนาแน่นมาก ภาคเอกชน (ธ.ก.ส., หอการค้า) เด่นระดับ 4-5'
  },
  {
    province: 'ลำปาง',
    provinceEn: 'Lampang',
    level1: 100.0,
    level2: 97.00,
    level3: 85.00,
    level4: 72.00,
    level5: 65.80,
    sampleSize: '99 องค์กร',
    dominantLevel: 'ระดับ 5 สูงสุด 65.80% (40 แห่ง)',
    notes: 'ผลักดันสู่แผนงานและนโยบายสาธารณะท้องถิ่นได้สูงที่สุดใน 5 จังหวัด'
  },
  {
    province: 'น่าน',
    provinceEn: 'Nan',
    level1: 100.0,
    level2: 94.00,
    level3: 88.00,
    level4: 58.00,
    level5: 41.50,
    sampleSize: '45+ หน่วยงาน',
    dominantLevel: 'ระดับ 3-4 ในภาคประชาสังคม',
    notes: 'เด่นในระดับชุมชนและบวร แต่ต้องการผลักดันสู่เทศบัญญัติระดับ 5'
  }
];

// -------------------------------------------------------------
// 4. แผนที่ GIS ปฏิบัติการ: CHOROPLETH FILLS & CLUSTER PINS (PANEL A)
// -------------------------------------------------------------
export const OPERATIONAL_CHOROPLETH_FILLS: Record<string, string> = {
  'พังงา': '#059669',       // MCA +3.45 (เขียวเข้ม ส่งเสริมขั้นสูง)
  'ลำปาง': '#047857',       // MCA +3.68 (เขียวเข้มมาก นวัตกรรม)
  'หนองคาย': '#10b981',     // MCA +3.30 (เขียวสด ส่งเสริมเชิงบวก)
  'กำแพงเพชร': '#059669',   // MCA +3.40 (เขียวเข้ม ส่งเสริมเชิงบวก)
  'น่าน': '#10b981'         // MCA +3.35 (เขียวสด ส่งเสริมเชิงบวก)
};

export const OPERATIONAL_MCA_SCALE_LEGEND = [
  { range: '+4.0 ถึง +5.0', label: 'ดีเลิศ (Excellence)', color: '#047857' },
  { range: '+2.5 ถึง +3.9', label: 'ส่งเสริม (Promoting)', color: '#10b981' },
  { range: '-1.0 ถึง +2.4', label: 'เป็นกลาง (Neutral)', color: '#94a3b8' },
  { range: '-4.9 ถึง -1.1', label: 'บกพร่อง (Deficient)', color: '#f59e0b' },
  { range: '-5.0', label: 'วิกฤต (Critical Violation)', color: '#dc2626' }
];

export interface OperationalMapPin {
  id: string;
  name: string;
  province: string;
  district: string;
  sector: 'gov' | 'edu' | 'private' | 'civic' | 'religion' | 'media';
  sectorName: string;
  pinColor: string;
  lat: number;
  lng: number;
  mcaScore: number;
  statusLevel: 'คุณธรรมต้นแบบ' | 'พัฒนาคุณธรรม' | 'ส่งเสริมคุณธรรม';
  highlight: string;
  bestPractice: string;
  hasPlan: boolean;
  hasWorkingGroup: boolean;
  hasBudget: boolean;
  hasMne: boolean;
  certifiedYear?: '2566' | '2567' | '2568' | '2569' | '2570' | '2571';
}

export const OPERATIONAL_MAP_PINS: OperationalMapPin[] = [
  // 1. เครือข่ายภาครัฐ (สีน้ำเงิน #2563eb)
  {
    id: 'pin-gov-01',
    name: 'ศูนย์คุ้มครองคนไร้ที่พึ่งจังหวัดหนองคาย',
    province: 'หนองคาย',
    district: 'เมืองหนองคาย',
    sector: 'gov',
    sectorName: 'เครือข่ายภาครัฐ',
    pinColor: '#2563eb',
    lat: 17.8783,
    lng: 102.7420,
    mcaScore: 3.35,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'การบริการประชาชนด้วยความโปร่งใสและดูแลผู้เปราะบางอย่างมีมนุษยธรรม',
    bestPractice: 'ระบบ One-Stop Care สำหรับผู้ด้อยโอกาส เชื่อมโยงฐานข้อมูลยุติธรรมชุมชน',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-gov-02',
    name: 'สำนักงานที่ดินจังหวัดพังงา',
    province: 'พังงา',
    district: 'เมืองพังงา',
    sector: 'gov',
    sectorName: 'เครือข่ายภาครัฐ',
    pinColor: '#2563eb',
    lat: 8.4501,
    lng: 98.5255,
    mcaScore: 3.42,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'ระบบคิวอิเล็กทรอนิกส์และเปิดเผยขั้นตอนรังวัดที่ดิน ลดขั้นตอนและลดสินบน',
    bestPractice: 'การบริการโปร่งใส ไร้เงินสด และกล่องรับฟังเสียงประชาชนแบบดิจิทัล',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-gov-03',
    name: 'ที่ทำการปกครองอำเภอเมืองลำปาง',
    province: 'ลำปาง',
    district: 'เมืองลำปาง',
    sector: 'gov',
    sectorName: 'เครือข่ายภาครัฐ',
    pinColor: '#2563eb',
    lat: 18.2888,
    lng: 99.4928,
    mcaScore: 3.70,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'ศูนย์ดำรงธรรมคุณธรรมเชิงรุก และการขับเคลื่อนหมู่บ้านศีลห้า',
    bestPractice: 'โมเดลบูรณาการ 13 ตำบลแก้ปัญหาความยากจนด้วยหลักปรัชญาเศรษฐกิจพอเพียง',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-gov-04',
    name: 'เรือนจำจังหวัดน่าน',
    province: 'น่าน',
    district: 'เมืองน่าน',
    sector: 'gov',
    sectorName: 'เครือข่ายภาครัฐ',
    pinColor: '#2563eb',
    lat: 18.7756,
    lng: 100.7730,
    mcaScore: 3.38,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'การฝึกอาชีพตามหลักพอเพียงและการฟื้นฟูจิตใจผู้ต้องขังเพื่อคืนคนดีสู่สังคม',
    bestPractice: 'โครงการโคกหนองนาเรือนจำ และการอบรมจริยธรรมผู้ต้องขังก่อนปล่อยตัว',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-gov-05',
    name: 'โรงพยาบาลพังงา',
    province: 'พังงา',
    district: 'เมืองพังงา',
    sector: 'gov',
    sectorName: 'เครือข่ายภาครัฐ',
    pinColor: '#2563eb',
    lat: 8.4410,
    lng: 98.5180,
    mcaScore: 3.55,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'โรงพยาบาลคุณธรรม ต้นแบบจิตอาสาบริการและการจัดหายาโปร่งใส 100%',
    bestPractice: 'มาตรฐานความซื่อสัตย์ในการจัดซื้อเวชภัณฑ์และการดูแลผู้ป่วยติดเตียงในชุมชน',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-gov-06',
    name: 'สำนักงานวัฒนธรรมจังหวัดกำแพงเพชร',
    province: 'กำแพงเพชร',
    district: 'เมืองกำแพงเพชร',
    sector: 'gov',
    sectorName: 'เครือข่ายภาครัฐ',
    pinColor: '#2563eb',
    lat: 16.4828,
    lng: 99.5227,
    mcaScore: 3.45,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'ศูนย์ประสานงานขับเคลื่อน 9 เกณฑ์องค์กรคุณธรรม และขับเคลื่อน 79 หน่วยงาน',
    bestPractice: 'ระบบฐานข้อมูลดิจิทัลติดตามแผนปฏิบัติการคุณธรรมระดับ 1-4 ครบ 100%',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-gov-07',
    name: 'สำนักงานพัฒนาชุมชนจังหวัดหนองคาย',
    province: 'หนองคาย',
    district: 'เมืองหนองคาย',
    sector: 'gov',
    sectorName: 'เครือข่ายภาครัฐ',
    pinColor: '#2563eb',
    lat: 17.8845,
    lng: 102.7485,
    mcaScore: 3.28,
    statusLevel: 'พัฒนาคุณธรรม',
    highlight: 'การส่งเสริมกลุ่มออมทรัพย์เพื่อการผลิตและการพัฒนาผลิตภัณฑ์คุณธรรม OTOP',
    bestPractice: 'ส่งเสริมธรรมาภิบาลกลุ่มอาชีพสตรีและกองทุนหมู่บ้าน แต่ยังขาดงบเฉพาะ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: true,
    certifiedYear: '2566'
  },

  // 2. เครือข่ายการศึกษา (สีเขียว #10b981)
  {
    id: 'pin-edu-01',
    name: 'สพป.หนองคาย เขต 1',
    province: 'หนองคาย',
    district: 'เมืองหนองคาย',
    sector: 'edu',
    sectorName: 'เครือข่ายการศึกษา',
    pinColor: '#10b981',
    lat: 17.8720,
    lng: 102.7310,
    mcaScore: 3.48,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'แกนนำสถานศึกษาคุณธรรม 160 โรงเรียน บูรณาการหลักสูตรโตไปไม่โกง',
    bestPractice: 'โรงเรียนสุจริตและระบบประเมินคุณธรรมและความโปร่งใส (ITA Online)',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-edu-02',
    name: 'ศูนย์การศึกษาพิเศษประจำจังหวัดพังงา',
    province: 'พังงา',
    district: 'ทับปุด',
    sector: 'edu',
    sectorName: 'เครือข่ายการศึกษา',
    pinColor: '#10b981',
    lat: 8.5200,
    lng: 98.6300,
    mcaScore: 3.50,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'การจัดการศึกษาเพื่อเด็กพิเศษด้วยหัวใจจิตอาสาและการมีส่วนร่วมของครอบครัว',
    bestPractice: 'ห้องเรียนบำบัดคุณธรรมและการพัฒนาทักษะชีวิตตามวิถีพอเพียง',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-edu-03',
    name: 'โรงเรียนดีบุกพังงาวิทยายน',
    province: 'พังงา',
    district: 'เมืองพังงา',
    sector: 'edu',
    sectorName: 'เครือข่ายการศึกษา',
    pinColor: '#10b981',
    lat: 8.4480,
    lng: 98.5220,
    mcaScore: 3.52,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'สถานศึกษาคุณธรรมระดับชาติ ชมรมเยาวชนจิตอาสา และโครงงานคุณธรรมลดขยะ',
    bestPractice: 'โครงงานคุณธรรมนำความรู้ สภานักเรียนคุณธรรม และธนาคารความดี',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-edu-04',
    name: 'มหาวิทยาลัยราชภัฏกำแพงเพชร',
    province: 'กำแพงเพชร',
    district: 'เมืองกำแพงเพชร',
    sector: 'edu',
    sectorName: 'เครือข่ายการศึกษา',
    pinColor: '#10b981',
    lat: 16.5130,
    lng: 99.5050,
    mcaScore: 3.42,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'สถาบันอุดมศึกษาเพื่อการพัฒนาท้องถิ่น ศูนย์วิจัยคุณธรรมและทุนชีวิตเยาวชน',
    bestPractice: 'โครงการวิศวกรสังคม พัฒนานักศึกษาสู่การแก้ปัญหาชุมชนตามหลักจิตอาสา',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-edu-05',
    name: 'โรงเรียนลำปางกัลยาณี',
    province: 'ลำปาง',
    district: 'เมืองลำปาง',
    sector: 'edu',
    sectorName: 'เครือข่ายการศึกษา',
    pinColor: '#10b981',
    lat: 18.2940,
    lng: 99.4990,
    mcaScore: 3.65,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'การปลูกฝังกตัญญูและจิตอาสาผ่านกิจกรรมดนตรีและศิลปวัฒนธรรมล้านนา',
    bestPractice: 'หลักสูตรสถานศึกษาคุณธรรมวิถีพุทธ และค่ายเยาวชนผู้นำการเปลี่ยนแปลง',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },

  // 3. เครือข่ายภาคธุรกิจเอกชน (สีส้ม #f59e0b)
  {
    id: 'pin-biz-01',
    name: 'ธ.ก.ส. สาขาหนองคาย',
    province: 'หนองคาย',
    district: 'เมืองหนองคาย',
    sector: 'private',
    sectorName: 'ภาคธุรกิจเอกชน',
    pinColor: '#f59e0b',
    lat: 17.8890,
    lng: 102.7540,
    mcaScore: 3.40,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'สถาบันการเงินคุณธรรม สนับสนุนสินเชื่อสีเขียวและโครงการชุมชนอุดมสุข',
    bestPractice: 'สินเชื่อดอกเบี้ยต่ำแก่เกษตรกรซื่อสัตย์ และระบบตรวจสอบความโปร่งใสสินเชื่อ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-biz-02',
    name: 'หอการค้าจังหวัดหนองคาย',
    province: 'หนองคาย',
    district: 'เมืองหนองคาย',
    sector: 'private',
    sectorName: 'ภาคธุรกิจเอกชน',
    pinColor: '#f59e0b',
    lat: 17.8760,
    lng: 102.7390,
    mcaScore: 3.32,
    statusLevel: 'พัฒนาคุณธรรม',
    highlight: 'การผลักดันธุรกิจริมแม่น้ำโขงโปร่งใสและการค้าชายแดนไร้คอร์รัปชัน',
    bestPractice: 'มาตรฐานจรรยาบรรณผู้ประกอบการการค้าชายแดนไทย-ลาว (อยู่ระหว่างจัดทำ M&E)',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: false,
    certifiedYear: '2566'
  },
  {
    id: 'pin-biz-03',
    name: 'หอการค้าจังหวัดพังงา & YEC พังงา',
    province: 'พังงา',
    district: 'เมืองพังงา',
    sector: 'private',
    sectorName: 'ภาคธุรกิจเอกชน',
    pinColor: '#f59e0b',
    lat: 8.4450,
    lng: 98.5200,
    mcaScore: 3.38,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'การท่องเที่ยวสีเขียวที่เป็นธรรม (Green Tourism & Fair Trade)',
    bestPractice: 'ข้อตกลงไม่เอารัดเอาเปรียบนักท่องเที่ยว และการจ้างงานคนในท้องถิ่น',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-biz-04',
    name: 'หอการค้าจังหวัดลำปาง',
    province: 'ลำปาง',
    district: 'เมืองลำปาง',
    sector: 'private',
    sectorName: 'ภาคธุรกิจเอกชน',
    pinColor: '#f59e0b',
    lat: 18.2830,
    lng: 99.4870,
    mcaScore: 3.58,
    statusLevel: 'คุณธรรมต้นแบบ',
    highlight: 'การส่งเสริมเซรามิกแฟร์เทรด และธุรกิจพลังงานสะอาดที่มีธรรมาภิบาล',
    bestPractice: 'บรรษัทภิบาลเซรามิกนครลำปาง และมาตรฐาน ESG วิสาหกิจขนาดกลางและย่อม',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    certifiedYear: '2566'
  },
  {
    id: 'pin-biz-05',
    name: 'กลุ่มธุรกิจเกษตรปลอดภัยกำแพงเพชร',
    province: 'กำแพงเพชร',
    district: 'คลองขลุง',
    sector: 'private',
    sectorName: 'ภาคธุรกิจเอกชน',
    pinColor: '#f59e0b',
    lat: 16.2100,
    lng: 99.7200,
    mcaScore: 3.30,
    statusLevel: 'พัฒนาคุณธรรม',
    highlight: 'วิสาหกิจกล้วยไข่และมันสำปะหลังอินทรีย์ ซื่อสัตย์ต่อผู้บริโภค',
    bestPractice: 'ประกันราคาผลผลิตที่เป็นธรรมแก่สมาชิกเกษตรกร ขาดการทำ M&E ต่อเนื่อง',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: false,
    certifiedYear: '2566'
  },

  // 4. เครือข่ายประชาสังคมและชุมชน (สีม่วง #8b5cf6)
  {
    id: 'pin-civic-01',
    name: 'สมาคมประชาสังคมพังงาแห่งความสุข',
    province: 'พังงา',
    district: 'เมืองพังงา',
    sector: 'civic',
    sectorName: 'ภาคประชาสังคมและชุมชน',
    pinColor: '#8b5cf6',
    lat: 8.4350,
    lng: 98.5120,
    mcaScore: 3.35,
    statusLevel: 'พัฒนาคุณธรรม',
    highlight: 'เครือข่ายอนุรักษ์ป่าชายเลนอ่าวพังงาและการจัดการขยะชุมชนอย่างยั่งยืน',
    bestPractice: 'ธรรมนูญสุขภาพชุมชนพังงา แต่ประสบปัญหาขาดแคลนงบประมาณดำเนินการ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: false,
    certifiedYear: '2566'
  },
  {
    id: 'pin-civic-02',
    name: 'ชุมชนคุณธรรมบ้านสีกายเหนือ',
    province: 'หนองคาย',
    district: 'เมืองหนองคาย',
    sector: 'civic',
    sectorName: 'ภาคประชาสังคมและชุมชน',
    pinColor: '#8b5cf6',
    lat: 17.9150,
    lng: 102.8200,
    mcaScore: 3.25,
    statusLevel: 'ส่งเสริมคุณธรรม',
    highlight: 'ชุมชนวัฒนธรรมริมโขง ธนาคารความดี และกิจกรรมรวมพลังบวรเข้มแข็ง',
    bestPractice: 'กองทุนวันละบาทช่วยเหลือผู้ยากไร้ ต้องการระบบรายงาน M&E ประจำพื้นที่',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: true,
    certifiedYear: '2567'
  },
  {
    id: 'pin-civic-03',
    name: 'ชุมชนคุณธรรมบ้านใหม่พัฒนา',
    province: 'น่าน',
    district: 'เวียงสา',
    sector: 'civic',
    sectorName: 'ภาคประชาสังคมและชุมชน',
    pinColor: '#8b5cf6',
    lat: 18.5800,
    lng: 100.7400,
    mcaScore: 3.22,
    statusLevel: 'ส่งเสริมคุณธรรม',
    highlight: 'การอนุรักษ์ป่าต้นน้ำน่าน และกติกาชุมชนห้ามเผาป่าลดฝุ่นควัน',
    bestPractice: 'ฝายมีชีวิตและสภาเด็กเยาวชนรักษ์ป่าน่าน ยังไม่มีงบประมาณเฉพาะ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: false,
    certifiedYear: '2567'
  },
  {
    id: 'pin-civic-04',
    name: 'มูลนิธิฮักเมืองน่าน',
    province: 'น่าน',
    district: 'เมืองน่าน',
    sector: 'civic',
    sectorName: 'ภาคประชาสังคมและชุมชน',
    pinColor: '#8b5cf6',
    lat: 18.7850,
    lng: 100.7820,
    mcaScore: 3.30,
    statusLevel: 'ส่งเสริมคุณธรรม',
    highlight: 'องค์กรสาธารณประโยชน์ขับเคลื่อนจิตสำนึกสิ่งแวดล้อมและเมืองน่าอยู่',
    bestPractice: 'เวทีพลเมืองน่านสร้างสรรค์ ขับเคลื่อนนโยบายสาธารณะ แต่ไม่มีงบประจำ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: true,
    certifiedYear: '2567'
  },
  {
    id: 'pin-civic-05',
    name: 'สมาคมสื่อสารมวลชนลำปาง',
    province: 'ลำปาง',
    district: 'เมืองลำปาง',
    sector: 'media',
    sectorName: 'ศาสนา วัฒนธรรม และสื่อมวลชน',
    pinColor: '#8b5cf6',
    lat: 18.2810,
    lng: 99.4950,
    mcaScore: 3.20,
    statusLevel: 'ส่งเสริมคุณธรรม',
    highlight: 'การสื่อสารคุณธรรมสร้างสรรค์ การตรวจสอบข้อมูลเท็จ และเชิดชูคนดี',
    bestPractice: 'พื้นที่ข่าวสร้างสรรค์ลดความรุนแรง แต่ขาดงบประมาณและเจ้าหน้าที่ M&E',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: false,
    certifiedYear: '2567'
  },
  {
    id: 'pin-civic-06',
    name: 'ชุมชนคุณธรรมบ้านคลองลานพัฒนา',
    province: 'กำแพงเพชร',
    district: 'คลองลาน',
    sector: 'civic',
    sectorName: 'ภาคประชาสังคมและชุมชน',
    pinColor: '#8b5cf6',
    lat: 16.1400,
    lng: 99.2800,
    mcaScore: 3.28,
    statusLevel: 'พัฒนาคุณธรรม',
    highlight: 'การท่องเที่ยวชุมชนยลวิถี กฎระเบียบหมู่บ้านปลอดเหล้าในงานบุญประเพณี',
    bestPractice: 'กองทุนหมู่บ้านพัฒนาสัมมาชีพตามหลักพอเพียง รายงานผล M&E ต่อเนื่อง',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: true,
    certifiedYear: '2567'
  }
];

// -------------------------------------------------------------
// 5. ตารางตรวจสอบคอขวด M&E รายหน่วยงานจริง (PANEL E)
// -------------------------------------------------------------
export interface OperationalBottleneckUnit {
  code: string;
  name: string;
  province: string;
  sector: string;
  hasPlan: boolean;
  hasWorkingGroup: boolean;
  hasBudget: boolean;
  hasMne: boolean;
  statusLevel: 'คุณธรรมต้นแบบ' | 'พัฒนาคุณธรรม' | 'ส่งเสริมคุณธรรม';
  bottleneckType: 'none' | 'budget' | 'mne' | 'both';
  recommendation: string;
}

export const OPERATIONAL_BOTTLENECK_TABLE_DATA: OperationalBottleneckUnit[] = [
  {
    code: 'NK-01',
    name: 'สพป.หนองคาย เขต 1',
    province: 'หนองคาย',
    sector: 'การศึกษา',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    statusLevel: 'คุณธรรมต้นแบบ',
    bottleneckType: 'none',
    recommendation: 'ยกระดับเป็นศูนย์เรียนรู้ต้นแบบระดับภูมิภาคและขยายผลสู่ 160 โรงเรียน'
  },
  {
    code: 'NK-02',
    name: 'สนง.พัฒนาชุมชนจังหวัดหนองคาย',
    province: 'หนองคาย',
    sector: 'ภาครัฐ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: true,
    statusLevel: 'พัฒนาคุณธรรม',
    bottleneckType: 'budget',
    recommendation: 'คอขวดงบประมาณ: ผลักดันขอจัดสรรงบประมาณพัฒนาจังหวัด (งบยุทธศาสตร์)'
  },
  {
    code: 'NK-03',
    name: 'ศูนย์คุ้มครองคนไร้ที่พึ่งหนองคาย',
    province: 'หนองคาย',
    sector: 'ภาครัฐ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    statusLevel: 'คุณธรรมต้นแบบ',
    bottleneckType: 'none',
    recommendation: 'รักษามาตรฐานธรรมาภิบาลและการบริการกลุ่มเปราะบางอย่างต่อเนื่อง'
  },
  {
    code: 'NK-04',
    name: 'หอการค้าจังหวัดหนองคาย',
    province: 'หนองคาย',
    sector: 'ธุรกิจเอกชน',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: false,
    statusLevel: 'พัฒนาคุณธรรม',
    bottleneckType: 'mne',
    recommendation: 'คอขวด M&E: อบรมการรายงานดัชนีคุณธรรมทางธุรกิจและการประเมิน ESG'
  },
  {
    code: 'NK-05',
    name: 'ชุมชนคุณธรรมบ้านสีกายเหนือ',
    province: 'หนองคาย',
    sector: 'ประชาสังคม',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: true,
    statusLevel: 'ส่งเสริมคุณธรรม',
    bottleneckType: 'budget',
    recommendation: 'สนับสนุนงบเงินอุดหนุนจาก อบต.สีกาย เพื่อดำเนินกิจกรรมธนาคารความดี'
  },
  {
    code: 'PG-01',
    name: 'โรงพยาบาลพังงา',
    province: 'พังงา',
    sector: 'ภาครัฐ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    statusLevel: 'คุณธรรมต้นแบบ',
    bottleneckType: 'none',
    recommendation: 'รักษามาตรฐานการจัดซื้อยาโปร่งใสและระบบจิตอาสาดูแลผู้ป่วยติดเตียง'
  },
  {
    code: 'PG-02',
    name: 'สมาคมประชาสังคมพังงาแห่งความสุข',
    province: 'พังงา',
    sector: 'ประชาสังคม',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: false,
    statusLevel: 'พัฒนาคุณธรรม',
    bottleneckType: 'both',
    recommendation: 'คอขวดวิกฤต: ขาดทั้งงบประมาณและระบบ M&E ต้องจับคู่พี่เลี้ยงภาครัฐหนุนเสริม'
  },
  {
    code: 'PG-03',
    name: 'สำนักงานที่ดินจังหวัดพังงา',
    province: 'พังงา',
    sector: 'ภาครัฐ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    statusLevel: 'คุณธรรมต้นแบบ',
    bottleneckType: 'none',
    recommendation: 'พัฒนาต่อยอดสู่ระบบจองคิวออนไลน์ไร้เงินสด 100% ป้องกันการทุจริต'
  },
  {
    code: 'PG-04',
    name: 'โรงเรียนดีบุกพังงาวิทยายน',
    province: 'พังงา',
    sector: 'การศึกษา',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    statusLevel: 'คุณธรรมต้นแบบ',
    bottleneckType: 'none',
    recommendation: 'ขยายผลชมรมจิตอาสาและหลักสูตรวินัยจราจรสู่โรงเรียนขยายโอกาสใน 8 อำเภอ'
  },
  {
    code: 'LP-01',
    name: 'ที่ทำการปกครองอำเภอเมืองลำปาง',
    province: 'ลำปาง',
    sector: 'ภาครัฐ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    statusLevel: 'คุณธรรมต้นแบบ',
    bottleneckType: 'none',
    recommendation: 'ต้นแบบการผลักดันสู่นโยบายสาธารณะระดับ 5 (ขยายผลครบ 13 ตำบล)'
  },
  {
    code: 'LP-02',
    name: 'หอการค้าจังหวัดลำปาง',
    province: 'ลำปาง',
    sector: 'ธุรกิจเอกชน',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    statusLevel: 'คุณธรรมต้นแบบ',
    bottleneckType: 'none',
    recommendation: 'สร้างความร่วมมือธุรกิจเซรามิกและพลังงานสีเขียวตามมาตรฐาน ESG สู่ระดับสากล'
  },
  {
    code: 'LP-03',
    name: 'สมาคมสื่อสารมวลชนลำปาง',
    province: 'ลำปาง',
    sector: 'สื่อมวลชน',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: false,
    statusLevel: 'ส่งเสริมคุณธรรม',
    bottleneckType: 'both',
    recommendation: 'คอขวดวิกฤต: จัดสรรงบสนับสนุนสื่อสร้างสรรค์และตั้งคณะทำงานประเมินผล'
  },
  {
    code: 'NN-01',
    name: 'เรือนจำจังหวัดน่าน',
    province: 'น่าน',
    sector: 'ภาครัฐ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    statusLevel: 'คุณธรรมต้นแบบ',
    bottleneckType: 'none',
    recommendation: 'รักษาความต่อเนื่องของโครงการโคกหนองนาและสร้างเครือข่ายรับผู้พ้นโทษเข้าทำงาน'
  },
  {
    code: 'NN-02',
    name: 'มูลนิธิฮักเมืองน่าน',
    province: 'น่าน',
    sector: 'ประชาสังคม',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: true,
    statusLevel: 'ส่งเสริมคุณธรรม',
    bottleneckType: 'budget',
    recommendation: 'คอขวดงบประมาณ: เชื่อมโยงงบกองทุนสิ่งแวดล้อมและ CSR เอกชนสนับสนุนการอนุรักษ์ป่า'
  },
  {
    code: 'NN-03',
    name: 'ชุมชนคุณธรรมบ้านใหม่พัฒนา',
    province: 'น่าน',
    sector: 'ประชาสังคม',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: false,
    statusLevel: 'ส่งเสริมคุณธรรม',
    bottleneckType: 'both',
    recommendation: 'คอขวดวิกฤต: ขาดงบและระบบ M&E ต้องดึง อบต.เวียงสา เข้ามาเป็นพี่เลี้ยง'
  },
  {
    code: 'KP-01',
    name: 'สำนักงานวัฒนธรรมจังหวัดกำแพงเพชร',
    province: 'กำแพงเพชร',
    sector: 'ภาครัฐ',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    statusLevel: 'คุณธรรมต้นแบบ',
    bottleneckType: 'none',
    recommendation: 'ศูนย์ประสานงานขับเคลื่อนระดับจังหวัด ผลักดัน 79 องค์กรสู่ระดับ 4 และ 5'
  },
  {
    code: 'KP-02',
    name: 'มหาวิทยาลัยราชภัฏกำแพงเพชร',
    province: 'กำแพงเพชร',
    sector: 'การศึกษา',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: true,
    statusLevel: 'คุณธรรมต้นแบบ',
    bottleneckType: 'none',
    recommendation: 'ทำหน้าที่หน่วยวิจัยและตรวจประเมิน M&E ให้แก่หน่วยงานภาคีทั่วจังหวัด'
  },
  {
    code: 'KP-03',
    name: 'ชุมชนคุณธรรมบ้านคลองลานพัฒนา',
    province: 'กำแพงเพชร',
    sector: 'ประชาสังคม',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: false,
    hasMne: true,
    statusLevel: 'พัฒนาคุณธรรม',
    bottleneckType: 'budget',
    recommendation: 'ขอสนับสนุนงบพัฒนาการท่องเที่ยววิถีชุมชนจากกองทุนพัฒนาบทบาทสตรีและ อบจ.'
  },
  {
    code: 'KP-04',
    name: 'กลุ่มธุรกิจเกษตรปลอดภัยกำแพงเพชร',
    province: 'กำแพงเพชร',
    sector: 'ธุรกิจเอกชน',
    hasPlan: true,
    hasWorkingGroup: true,
    hasBudget: true,
    hasMne: false,
    statusLevel: 'พัฒนาคุณธรรม',
    bottleneckType: 'mne',
    recommendation: 'อบรมระบบการตรวจย้อนกลับ (Traceability) และระบบ M&E ด้านความซื่อสัตย์คู่ค้า'
  }
];

// -------------------------------------------------------------
// 6. ข้อมูลการคาดการณ์แนวโน้มในอนาคต (PREDICTIVE TRENDS 2569-2571)
// -------------------------------------------------------------

// กราฟที่ 1: การขยายตัวขององค์กรคุณธรรมต้นแบบ (Time-Series & Regression)
export interface ModelOrgTrajectoryPoint {
  year: string;
  actualCount?: number;
  predictedCount?: number;
  modelPct: number;
  promotedCount: number; // ระดับส่งเสริม (ลดลงอย่างต่อเนื่อง = เชิงบวก)
  isActual: boolean;
}

export const MODEL_ORG_TRAJECTORY_DATA: ModelOrgTrajectoryPoint[] = [
  { year: '2566', actualCount: 56, modelPct: 26.7, promotedCount: 88, isActual: true },
  { year: '2567', actualCount: 84, modelPct: 38.7, promotedCount: 82, isActual: true },
  { year: '2568', actualCount: 95, modelPct: 42.2, promotedCount: 78, isActual: true },
  { year: '2569', predictedCount: 114, modelPct: 48.7, promotedCount: 70, isActual: false },
  { year: '2570', predictedCount: 133, modelPct: 54.5, promotedCount: 62, isActual: false },
  { year: '2571', predictedCount: 153, modelPct: 60.2, promotedCount: 54, isActual: false }
];

export const MODEL_ORG_REGRESSION_INFO = {
  equation: 'Y_t = 19.5 t + 35.7',
  rSquared: 0.982,
  cagrGrowthRate: '+23.2% ต่อปี',
  totalPastGrowth: '+69.64% (2566-2568)',
  futureMilestone: 'ปี 2571 แตะ 153 แห่ง (60.2% ขององค์กรทั้งหมด)'
};

// กราฟที่ 2: การก้าวสู่บทบาทนโยบายสาธารณะ (Maturity Level 5 Expansion)
export interface Level5PolicyExpansionPoint {
  year: string;
  level5Pct: number;
  policyOrgsCount: number;
  isActual: boolean;
}

export const LEVEL5_POLICY_EXPANSION_DATA: Level5PolicyExpansionPoint[] = [
  { year: '2566', level5Pct: 22.5, policyOrgsCount: 47, isActual: true },
  { year: '2567', level5Pct: 31.0, policyOrgsCount: 65, isActual: true },
  { year: '2568', level5Pct: 37.7, policyOrgsCount: 79, isActual: true },
  { year: '2569', level5Pct: 45.0, policyOrgsCount: 94, isActual: false },
  { year: '2570', level5Pct: 49.2, policyOrgsCount: 103, isActual: false },
  { year: '2571', level5Pct: 52.5, policyOrgsCount: 110, isActual: false }
];

// กราฟที่ 3: แบบจำลองปลดล็อกคอขวดงบประมาณและ M&E (Intervention Projection)
export interface ScenarioSimulationPoint {
  year: string;
  scenarioA: number; // ปล่อยตามธรรมชาติ (No Intervention)
  scenarioB: number; // นโยบายบังคับผ่าน MCA Simulator
  baseline?: number;
  isActual: boolean;
}

export const SCENARIO_SIMULATION_DATA: ScenarioSimulationPoint[] = [
  { year: '2566', scenarioA: 5.0, scenarioB: 5.0, baseline: 5.0, isActual: true },
  { year: '2567', scenarioA: 6.5, scenarioB: 6.5, baseline: 6.5, isActual: true },
  { year: '2568', scenarioA: 7.5, scenarioB: 7.5, baseline: 7.5, isActual: true },
  { year: '2569', scenarioA: 9.0, scenarioB: 25.0, isActual: false },
  { year: '2570', scenarioA: 12.0, scenarioB: 45.0, isActual: false },
  { year: '2571', scenarioA: 15.0, scenarioB: 68.0, isActual: false }
];

// -------------------------------------------------------------
// 7. RULE TABLE 5 หมวด & MCA SIMULATOR ENGINE (PANEL D)
// -------------------------------------------------------------
export interface RuleCategoryDef {
  id: number;
  code: string;
  name: string;
  weight: number; // Percentage
  linkedVirtues: string[];
  inspectionFocus: string;
  rubricLevels: {
    level: number;
    label: string;
    description: string;
    badgeColor: string;
  }[];
}

export const RULE_TABLE_CATEGORIES: RuleCategoryDef[] = [
  {
    id: 1,
    code: 'CAT-1',
    name: 'วิธีดำเนินการ / กิจกรรมโครงการ',
    weight: 35,
    linkedVirtues: ['วินัย', 'สุจริต', 'จิตอาสา'],
    inspectionFocus: 'ตรวจสอบกระบวนการทำงานที่เป็นธรรม ปฏิบัติตามระเบียบ และการกระจายประโยชน์สู่ส่วนรวม',
    rubricLevels: [
      { level: 5, label: '+5 ดีเลิศ', description: 'มีขั้นตอนการดำเนินงานโปร่งใส ตรวจสอบได้ทุกขั้นตอน ชุมชนมีส่วนร่วมตัดสินใจ', badgeColor: '#059669' },
      { level: 3, label: '+3 ส่งเสริม', description: 'ดำเนินงานตามระเบียบแบบแผนชัดเจน สอดคล้องกับกรอบเวลาและเป้าหมาย', badgeColor: '#2563eb' },
      { level: 0, label: '0 เป็นกลาง', description: 'มีขั้นตอนการดำเนินงานตามมาตรฐานทั่วไป ไม่พบข้อบกพร่องแต่ยังขาดจุดเด่น', badgeColor: '#64748b' },
      { level: -2, label: '-2 บกพร่อง', description: 'ขั้นตอนคลุมเครือ ลำดับกิจกรรมซ้ำซ้อน เสี่ยงต่อความล่าช้า', badgeColor: '#f59e0b' },
      { level: -5, label: '-5 วิกฤต', description: 'กิจกรรมสุ่มเสี่ยงผิดระเบียบราชการ ขาดการมีส่วนร่วม หรือเอื้อประโยชน์เฉพาะกลุ่ม', badgeColor: '#dc2626' }
    ]
  },
  {
    id: 2,
    code: 'CAT-2',
    name: 'งบประมาณและทรัพยากร',
    weight: 30,
    linkedVirtues: ['พอเพียง', 'สุจริต'],
    inspectionFocus: 'ตรวจสอบราคากลาง การใช้ทรัพยากรร่วม (Shared Resources) และความคุ้มค่าตามหลักพอเพียง',
    rubricLevels: [
      { level: 5, label: '+5 ดีเลิศ', description: 'งบประมาณสมเหตุสมผลเทียบราคากลาง มีการระดมทรัพยากรร่วมในพื้นที่ ไม่ตั้งงบซ้ำซ้อน', badgeColor: '#059669' },
      { level: 3, label: '+3 ส่งเสริม', description: 'งบประมาณเป็นไปตามระเบียบ มีรายละเอียดค่าใช้จ่ายชัดเจนคุ้มค่า', badgeColor: '#2563eb' },
      { level: 0, label: '0 เป็นกลาง', description: 'ประมาณการค่าใช้จ่ายตามเกณฑ์มาตรฐานราชการทั่วไป', badgeColor: '#64748b' },
      { level: -2, label: '-2 บกพร่อง', description: 'รายการงบประมาณบางรายการสูงกว่าปกติ หรือไม่ระบุแหล่งที่มาของราคา', badgeColor: '#f59e0b' },
      { level: -5, label: '-5 วิกฤต', description: 'พบแนวโน้มจัดซื้อจัดจ้างราคาสูงเกินจริงอย่างมีนัยสำคัญ หรือส่อเจตนาล็อกสเปก', badgeColor: '#dc2626' }
    ]
  },
  {
    id: 3,
    code: 'CAT-3',
    name: 'การติดตามและประเมินผล M&E',
    weight: 20,
    linkedVirtues: ['วินัย', 'สุจริต'],
    inspectionFocus: 'ตรวจสอบตัวชี้วัดที่วัดได้จริง ระบบรายงานผลตามงวดเวลา และกลไกเปิดเผยข้อมูล',
    rubricLevels: [
      { level: 5, label: '+5 ดีเลิศ', description: 'มีตัวชี้วัดเชิงประจักษ์ (KPIs) ระบบรายงานออนไลน์แบบเรียลไทม์ และบัญชีเปิดเผย (Open Data)', badgeColor: '#059669' },
      { level: 3, label: '+3 ส่งเสริม', description: 'มีแผนการประเมินผลชัดเจนทั้งก่อน ระหว่าง และหลังเสร็จสิ้นโครงการ', badgeColor: '#2563eb' },
      { level: 0, label: '0 เป็นกลาง', description: 'มีตัวชี้วัดพื้นฐานและรายงานสรุปผลตามแบบฟอร์มมาตรฐาน', badgeColor: '#64748b' },
      { level: -2, label: '-2 บกพร่อง', description: 'ตัวชี้วัดวัดผลได้ยาก ขาดกลไกการติดตามความก้าวหน้าระหว่างดำเนินงาน', badgeColor: '#f59e0b' },
      { level: -5, label: '-5 วิกฤต', description: 'ไม่มีระบบประเมินผล ไม่สามารถตรวจสอบผลสัมฤทธิ์จริงได้หลังเบิกจ่ายงบประมาณ', badgeColor: '#dc2626' }
    ]
  },
  {
    id: 4,
    code: 'CAT-4',
    name: 'ผลลัพธ์ที่ตกแก่ประชาชน',
    weight: 10,
    linkedVirtues: ['จิตอาสา', 'กตัญญู'],
    inspectionFocus: 'ตรวจสอบผลประโยชน์ส่วนรวม ผลกระทบทางสังคมและสิ่งแวดล้อม และความยั่งยืนของชุมชน',
    rubricLevels: [
      { level: 5, label: '+5 ดีเลิศ', description: 'สร้างการเปลี่ยนแปลงพฤติกรรมยั่งยืน ประชาชนได้รับผลประโยชน์อย่างทั่วถึงและเป็นธรรม', badgeColor: '#059669' },
      { level: 3, label: '+3 ส่งเสริม', description: 'ผลผลิตตรงตามเป้าหมายและเกิดประโยชน์ต่อกลุ่มเป้าหมายในพื้นที่', badgeColor: '#2563eb' },
      { level: 0, label: '0 เป็นกลาง', description: 'บรรลุเป้าหมายตามเอกสาร แต่ผลลัพธ์ยังจำกัดในวงแคบ', badgeColor: '#64748b' },
      { level: -2, label: '-2 บกพร่อง', description: 'ผลลัพธ์ที่ได้ไม่คุ้มค่า หรือประชาชนส่วนใหญ่ไม่ได้รับประโยชน์จริง', badgeColor: '#f59e0b' },
      { level: -5, label: '-5 วิกฤต', description: 'เกิดผลกระทบเชิงลบต่อชุมชน สิ่งแวดล้อม หรือความขัดแย้งในพื้นที่', badgeColor: '#dc2626' }
    ]
  },
  {
    id: 5,
    code: 'CAT-5',
    name: 'หลักการและเหตุผล',
    weight: 5,
    linkedVirtues: ['พอเพียง', 'กตัญญู'],
    inspectionFocus: 'ตรวจสอบความจำเป็นที่แท้จริงในพื้นที่ สอดคล้องกับปัญหาจริง มิใช่การตั้งโครงการเพื่อของบ',
    rubricLevels: [
      { level: 5, label: '+5 ดีเลิศ', description: 'ตั้งอยู่บนฐานข้อมูลปัญหาจริงในพื้นที่ ผ่านเวทีประชาคมรับฟังความคิดเห็นประชาชน', badgeColor: '#059669' },
      { level: 3, label: '+3 ส่งเสริม', description: 'หลักการและเหตุผลสอดคล้องกับยุทธศาสตร์จังหวัดคุณธรรมและนโยบาย ศคธ.', badgeColor: '#2563eb' },
      { level: 0, label: '0 เป็นกลาง', description: 'หลักการและเหตุผลระบุปัญหาทั่วไปตามแบบโครงการมาตรฐาน', badgeColor: '#64748b' },
      { level: -2, label: '-2 บกพร่อง', description: 'ขาดความเชื่อมโยงระหว่างสภาพปัญหากับกิจกรรมที่จะดำเนินการ', badgeColor: '#f59e0b' },
      { level: -5, label: '-5 วิกฤต', description: 'เป็นการสร้างความจำเป็นเทียม ไม่มีความต้องการจริงในพื้นที่เพื่อขอใช้งบประมาณ', badgeColor: '#dc2626' }
    ]
  }
];

export interface ProjectPreset {
  id: string;
  name: string;
  organization: string;
  province: string;
  budget: number;
  categoryScores: Record<number, number>;
  description: string;
}

export const PROJECT_PRESETS: ProjectPreset[] = [
  {
    id: 'preset-traffic-discipline',
    name: 'โครงการรณรงค์วินัยจราจรและทางม้าลายปลอดภัยหน้าโรงเรียน',
    organization: 'เทศบาลเมืองพังงา ร่วมกับ สภ.เมืองพังงา',
    province: 'พังงา',
    budget: 180000,
    categoryScores: {
      1: 5,
      2: 5,
      3: 4,
      4: 5,
      5: 5
    },
    description: 'โครงการมุ่งแก้จุดบกพร่องด้านวินัยของจังหวัดโดยตรง มีกลไกการมีส่วนร่วมของนักเรียนและตำรวจจราจร'
  },
  {
    id: 'preset-lampang-clean-air',
    name: 'โครงการเครือข่ายชุมชนปลอดควันไฟและธรรมาภิบาลสิ่งแวดล้อม',
    organization: 'ที่ทำการปกครองอำเภอเมืองลำปาง',
    province: 'ลำปาง',
    budget: 240000,
    categoryScores: {
      1: 5,
      2: 4,
      3: 5,
      4: 5,
      5: 5
    },
    description: 'ขยายผลสู่นโยบายระดับ 5 มีดัชนีวัดปริมาณจุดความร้อน (Hotspots) ลดลงชัดเจน'
  },
  {
    id: 'preset-nongkhai-edu-integrity',
    name: 'โครงการโรงเรียนสุจริตและเยาวชนต้านทุจริตริมโขง',
    organization: 'สพป.หนองคาย เขต 1',
    province: 'หนองคาย',
    budget: 150000,
    categoryScores: {
      1: 4,
      2: 4,
      3: 4,
      4: 5,
      5: 4
    },
    description: 'ยกระดับองค์กรการศึกษาสู่คุณธรรมต้นแบบ บูรณาการหลักสูตรโตไปไม่โกง'
  },
  {
    id: 'preset-pr-supplies',
    name: 'โครงการจัดซื้อครุภัณฑ์ป้ายประชาสัมพันธ์อิเล็กทรอนิกส์เร่งด่วน',
    organization: 'สำนักงานเครือข่ายเฉพาะกิจ',
    province: 'พังงา',
    budget: 650000,
    categoryScores: {
      1: 0,
      2: -5, // วิกฤต: ล็อกสเปก
      3: -2,
      4: 0,
      5: -2
    },
    description: 'ตั้งราคากลางสูงเกินจริง ไม่มีการใช้ทรัพยากรร่วม ส่อความเสี่ยงทุจริตเชิงนโยบาย (ระบบจะระงับทันที)'
  }
];

export interface McaEvaluationResult {
  totalMcaScore: number;
  status: 'approved' | 'needs_revision' | 'rejected' | 'terminated';
  statusText: string;
  badgeClass: string;
  explanation: string;
  hasCriticalViolation: boolean;
  violatedCategories: string[];
}

export function evaluateProjectProposal(scores: Record<number, number>): McaEvaluationResult {
  let weightedSum = 0;
  let hasCriticalViolation = false;
  const violatedCategories: string[] = [];

  RULE_TABLE_CATEGORIES.forEach((cat) => {
    const rawScore = scores[cat.id] ?? 0;
    weightedSum += rawScore * cat.weight;
    // Automated Gatekeeper: Category 1 or 2 with -5 immediately terminates proposal
    if ((cat.id === 1 || cat.id === 2) && rawScore <= -5) {
      hasCriticalViolation = true;
      violatedCategories.push(`หมวด ${cat.id}: ${cat.name}`);
    } else if (rawScore <= -5) {
      hasCriticalViolation = true;
      violatedCategories.push(`หมวด ${cat.id}: ${cat.name}`);
    }
  });

  const totalScore = Number((weightedSum / 100).toFixed(2));

  if (hasCriticalViolation) {
    return {
      totalMcaScore: totalScore,
      status: 'terminated',
      statusText: 'ตัดสิทธิ์ / ระงับโครงการทันที (Automated Terminated: -5 Critical Alert)',
      badgeClass: 'status-critical',
      explanation: `ระบบตัดสิทธิ์โครงการทันที (Gatekeeper): ตรวจพบข้อบกพร่องระดับวิกฤต (-5.00) ในหมวด: ${violatedCategories.join(', ')} ส่อเจตนาล็อกสเปก ทุจริต หรือขัดระเบียบร้ายแรง ไม่อนุมัติจัดสรรงบประมาณ`,
      hasCriticalViolation: true,
      violatedCategories
    };
  }

  if (totalScore < 0) {
    return {
      totalMcaScore: totalScore,
      status: 'rejected',
      statusText: 'ปัดตก / ไม่ผ่านเกณฑ์ขั้นต่ำ (Rejected)',
      badgeClass: 'status-rejected',
      explanation: `คะแนนเฉลี่ยถ่วงน้ำหนักรวม (${totalScore >= 0 ? '+' : ''}${totalScore.toFixed(2)}) ต่ำกว่าเกณฑ์มาตรฐานเป็นกลาง (0.00) โครงการขาดความคุ้มค่าและความพร้อมในการดำเนินงาน`,
      hasCriticalViolation: false,
      violatedCategories
    };
  }

  if (totalScore < 2.50) {
    return {
      totalMcaScore: totalScore,
      status: 'needs_revision',
      statusText: 'ต้องปรับปรุงข้อเสนอโครงการ (Needs Revision)',
      badgeClass: 'status-warning',
      explanation: `คะแนนอยู่ในช่วงเป็นกลาง (${totalScore >= 0 ? '+' : ''}${totalScore.toFixed(2)}) ยังขาดความโดดเด่นและนวัตกรรม ให้ส่งกลับผู้เสนอโครงการเพื่อปรับแผนงานและระบบ M&E`,
      hasCriticalViolation: false,
      violatedCategories
    };
  }

  return {
    totalMcaScore: totalScore,
    status: 'approved',
    statusText: 'ผ่านเกณฑ์การอนุมัติโครงการ (Approved: +3 ถึง +5)',
    badgeClass: 'status-approved',
    explanation: `คะแนนอยู่ในเกณฑ์ส่งเสริมถึงดีเลิศ (${totalScore >= 0 ? '+' : ''}${totalScore.toFixed(2)}) สอดคล้องกับยุทธศาสตร์เมืองคุณธรรม งบประมาณสมเหตุสมผล และมีระบบ M&E ชัดเจน`,
    hasCriticalViolation: false,
    violatedCategories
  };
}

// -------------------------------------------------------------
// 8. ภาคีเครือข่าย 6 ด้าน และ CIPP Matrix เดิมที่คงไว้และเสริม
// -------------------------------------------------------------
export interface NetworkSectorDistribution {
  id: string;
  name: string;
  nameEn: string;
  percentage: number;
  count: number;
  color: string;
  roleDescription: string;
  riskStatus: 'strong' | 'moderate' | 'weak';
}

export const NETWORK_6_SECTORS_DATA: NetworkSectorDistribution[] = [
  {
    id: 'gov',
    name: 'ภาครัฐและองค์กรปกครองส่วนท้องถิ่น',
    nameEn: 'Government & Local Admin',
    percentage: 64.56,
    count: 51,
    color: '#2563eb',
    roleDescription: 'แกนนำหลักในการขับเคลื่อนนโยบาย กำหนดกรอบแผนงาน และจัดสรรงบประมาณสนับสนุน',
    riskStatus: 'strong'
  },
  {
    id: 'edu',
    name: 'การศึกษา เด็ก และเยาวชน',
    nameEn: 'Education & Youth',
    percentage: 15.19,
    count: 12,
    color: '#10b981',
    roleDescription: 'ปลูกฝังคุณธรรมในสถานศึกษา พัฒนาโรงเรียนคุณธรรม และสร้างแกนนำเยาวชนจิตอาสา',
    riskStatus: 'strong'
  },
  {
    id: 'civic',
    name: 'ภาคประชาสังคม ชุมชน และครอบครัว',
    nameEn: 'Civil Society & Community',
    percentage: 13.92,
    count: 11,
    color: '#8b5cf6',
    roleDescription: 'ขับเคลื่อนกิจกรรมระดับฐานราก สภาชุมชน ธนาคารความดี และการอนุรักษ์สิ่งแวดล้อม',
    riskStatus: 'strong'
  },
  {
    id: 'private',
    name: 'ภาคธุรกิจเอกชน',
    nameEn: 'Private Sector & Business',
    percentage: 3.80,
    count: 3,
    color: '#f59e0b',
    roleDescription: 'จุดเปราะบางที่ต้องเร่งดึงดูดเข้ามาร่วม ผ่านโครงการ CSR และมาตรฐานจริยธรรมคู่ค้า',
    riskStatus: 'weak'
  },
  {
    id: 'religion_media',
    name: 'ศาสนา วัฒนธรรม และสื่อมวลชน',
    nameEn: 'Religion, Culture & Media',
    percentage: 2.53,
    count: 2,
    color: '#ec4899',
    roleDescription: 'จุดเปราะบางที่ยังขาดการมีส่วนร่วม ต้องเชื่อมโยงพลัง บวร และสื่อสารมวลชนท้องถิ่น',
    riskStatus: 'weak'
  }
];

export interface CippMatrixPhase {
  phaseId: number;
  phaseName: string;
  phaseNameEn: string;
  achievementRate: number;
  targetRate: number;
  status: 'success' | 'warning' | 'critical';
  details: {
    label: string;
    rateText: string;
    isBottleneck: boolean;
    recommendation: string;
  }[];
}

export const CIPP_BOTTLENECK_MATRIX_DATA: CippMatrixPhase[] = [
  {
    phaseId: 1,
    phaseName: 'ระดับที่ 1: บริบทและการรับรู้ร่วม (Context Awareness)',
    phaseNameEn: 'Context & Alignment',
    achievementRate: 88.50,
    targetRate: 85.00,
    status: 'success',
    details: [
      {
        label: 'การลงนามบันทึกข้อตกลง (MOU) ความร่วมมือ',
        rateText: '88.50%',
        isBottleneck: false,
        recommendation: 'ภาคีเครือข่ายมีความตระหนักและพร้อมร่วมขับเคลื่อนในระดับสูง'
      },
      {
        label: 'การประกาศเจตนารมณ์จังหวัดคุณธรรม',
        rateText: '91.20%',
        isBottleneck: false,
        recommendation: 'สร้างกระแสการรับรู้ในพื้นที่ได้ครอบคลุมทุกอำเภอ'
      }
    ]
  },
  {
    phaseId: 2,
    phaseName: 'ระดับที่ 2: การจัดทำแผนงานและโครงสร้าง (Input & Planning)',
    phaseNameEn: 'Input & Action Planning',
    achievementRate: 98.73,
    targetRate: 90.00,
    status: 'success',
    details: [
      {
        label: 'การจัดทำแผนปฏิบัติการขับเคลื่อนคุณธรรมชัดเจน',
        rateText: '36.00% - 43.00%',
        isBottleneck: false,
        recommendation: 'มีการบรรจุแผนงานในระดับองค์กรสำเร็จตามเกณฑ์มาตรฐาน'
      },
      {
        label: 'การแต่งตั้งคณะทำงานขับเคลื่อนรับผิดชอบโดยตรง',
        rateText: '14.00% - 34.00%',
        isBottleneck: false,
        recommendation: 'มีกลไกคณะกรรมการระดับพื้นที่รองรับการดำเนินงาน'
      }
    ]
  },
  {
    phaseId: 3,
    phaseName: 'ระดับที่ 3: ความต่อเนื่องและการจัดสรรทรัพยากร (Process & Resources)',
    phaseNameEn: 'Process & Bottlenecks',
    achievementRate: 15.20,
    targetRate: 75.00,
    status: 'critical',
    details: [
      {
        label: 'การจัดสรรงบประมาณสนับสนุนเฉพาะด้านคุณธรรม',
        rateText: '4.00% - 8.00%',
        isBottleneck: true,
        recommendation: 'คอขวดวิกฤต: หน่วยงานส่วนใหญ่ยังไม่มีงบประมาณเฉพาะ ต้องพึ่งพางบส่วนกลางหรือโครงการชั่วคราว'
      },
      {
        label: 'การจัดระบบติดตามและประเมินผลต่อเนื่อง (M&E)',
        rateText: '6.00% - 8.00%',
        isBottleneck: true,
        recommendation: 'คอขวดวิกฤต: ขาดเจ้าหน้าที่รับผิดชอบ M&E ประจำ และไม่มีแดชบอร์ดติดตามข้อมูลเชิงประจักษ์'
      }
    ]
  },
  {
    phaseId: 4,
    phaseName: 'ระดับที่ 4: ความยั่งยืนและผลสัมฤทธิ์เชิงประจักษ์ (Product & Sustainability)',
    phaseNameEn: 'Product & Outcomes',
    achievementRate: 12.40,
    targetRate: 60.00,
    status: 'warning',
    details: [
      {
        label: 'การถอดบทเรียน Best Practice สู่การขยายผล',
        rateText: '12.40%',
        isBottleneck: false,
        recommendation: 'จำเป็นต้องแก้ปัญหาคอขวดในระดับที่ 3 ก่อน เพื่อให้เกิดความต่อเนื่องในการสร้างต้นแบบยั่งยืน'
      },
      {
        label: 'การประเมินผลกระทบทางสังคม (Social Return on Investment)',
        rateText: '5.60%',
        isBottleneck: true,
        recommendation: 'ควรนำกรอบ MCA และการวัดดัชนีคุณธรรม 5 ด้านเข้าเป็นตัวชี้วัดประจำปีของหน่วยงาน'
      }
    ]
  }
];

export const MNE_EXECUTIVE_ACTIONS = [
  {
    title: 'ปลดล็อกจุดคอขวดงบประมาณท้องถิ่น (Budget Allocation Bottleneck)',
    action: 'ผลักดันให้ อปท. (อบจ., เทศบาล, อบต.) บรรจุแผนงานด้านคุณธรรมลงในแผนพัฒนาท้องถิ่น 5 ปี เพื่อให้สามารถตั้งข้อบัญญัติงบประมาณถาวรได้',
    timeline: 'ไตรมาส 1 - 2 (ต.ค. 2567 - มี.ค. 2568)',
    urgency: 'high'
  },
  {
    title: 'ติดตั้งระบบติดตามประเมินผลดิจิทัล (Digital M&E Monitoring)',
    action: 'นำแบบฟอร์มประเมินโครงการตามเกณฑ์ Rule Table 5 หมวด ขึ้นสู่ระบบออนไลน์ เพื่อให้ผู้รับผิดชอบรายงานความก้าวหน้าตามงวดเวลาจริง',
    timeline: 'ไตรมาส 2 (ม.ค. - มี.ค. 2568)',
    urgency: 'high'
  },
  {
    title: 'เร่งแก้ช่องว่างมิติ "วินัย" (-0.18) และ "สุจริต" (-0.17)',
    action: 'จัดทำโครงการพัฒนาวินัยจราจรและระบบเปิดเผยการจัดซื้อจัดจ้าง (Open Procurement) เป็น Quick Win ประจำปีงบประมาณ 2568',
    timeline: 'เร่งด่วนทันที',
    urgency: 'critical'
  }
];

// =========================================================================
// 8. ข้อมูลตัวชี้วัดรายปีงบประมาณ (ANNUAL OPERATIONAL METRICS 2566-2571)
// สำหรับ Dynamic Interactive Year Filtering
// =========================================================================

export interface AnnualOperationalMetric {
  year: string;
  isActual: boolean;
  statusLabel: string;
  statusTag: 'actual' | 'current' | 'projected';
  statusBadgeColor: 'blue' | 'green' | 'purple';
  statusBadgeText: string;
  description: string;
  // KPI 1: MCA
  mcaScore: number;
  mcaLevel: string;
  mcaSubtext: string;
  // KPI 2: Model Orgs
  modelOrgPct: number;
  modelOrgCount: number;
  totalSampleOrgs: number;
  modelGrowthText: string;
  // KPI 3: Level 5 Policy
  level5PolicyPct: number;
  level5PolicyOrgs: number;
  policyExpansionRate: string;
  policySubtext: string;
  // KPI 4: Bottleneck & Budget
  bottleneckBudgetPct: string;
  bottleneckAlertTitle: string;
  bottleneckSubtext: string;
  bottleneckBadgeClass: 'badge-red' | 'badge-yellow' | 'badge-green';
  // Radar 5 Dimensions Scores (National Baseline Shift)
  radarDimensionScores: {
    volunteer: number;
    sufficiency: number;
    gratitude: number;
    integrity: number;
    discipline: number;
  };
  // Province Maturity Distribution Multiplier
  maturityLevel5Ratios: {
    kamphaengphet: number;
    phangnga: number;
    nongkhai: number;
    lampang: number;
    nan: number;
  };
}

export const ANNUAL_OPERATIONAL_METRICS_BY_YEAR: Record<string, AnnualOperationalMetric> = {
  '2566': {
    year: '2566',
    isActual: true,
    statusLabel: 'ข้อมูลสำรวจจริง (Baseline Data)',
    statusTag: 'actual',
    statusBadgeColor: 'blue',
    statusBadgeText: '📊 ข้อมูลสำรวจจริงปีเริ่มต้น (Baseline Phase)',
    description: 'ปีเริ่มต้นขับเคลื่อนแผนปฏิบัติการฯ ระยะที่ 2 เริ่มต้นนำร่องในกลุ่มองค์กรเครือข่ายบุกเบิกรุ่นแรก',
    mcaScore: 3.18,
    mcaLevel: 'ระดับส่งเสริมคุณธรรม',
    mcaSubtext: 'คะแนนเริ่มต้นก่อนการแทรกแซงเชิงระบบ (Baseline Evaluation)',
    modelOrgPct: 26.7,
    modelOrgCount: 56,
    totalSampleOrgs: 210,
    modelGrowthText: 'ระยะเริ่มต้น (56 แห่ง จาก 210 แห่ง)',
    level5PolicyPct: 22.5,
    level5PolicyOrgs: 47,
    policyExpansionRate: '22.5% (47 แห่ง)',
    policySubtext: 'ผลักดันสู่นโยบายสาธารณะระยะแรกเริ่ม (47 แห่ง)',
    bottleneckBudgetPct: '4.2%',
    bottleneckAlertTitle: '🚨 ขาดระบบ M&E และการจัดสรรงบประมาณเฉพาะ',
    bottleneckSubtext: 'หน่วยงานมีแผนงานเพียง 82% และมีงบประมาณเฉพาะเพียง 4.2%',
    bottleneckBadgeClass: 'badge-red',
    radarDimensionScores: {
      volunteer: 4.35,
      sufficiency: 4.18,
      gratitude: 4.15,
      integrity: 4.08,
      discipline: 4.02
    },
    maturityLevel5Ratios: {
      kamphaengphet: 25.0,
      phangnga: 30.0,
      nongkhai: 22.5,
      lampang: 41.7,
      nan: 28.0
    }
  },
  '2567': {
    year: '2567',
    isActual: true,
    statusLabel: 'ข้อมูลสำรวจจริง (Mid-term Evaluation)',
    statusTag: 'actual',
    statusBadgeColor: 'blue',
    statusBadgeText: '📊 ข้อมูลสำรวจจริงรอบกลางแผน (Scaling Phase)',
    description: 'ขยายผลการขับเคลื่อนสู่เครือข่ายระดับจังหวัด เริ่มต้นโครงการนำร่องในจังหวัดลำปางและหนองคาย',
    mcaScore: 3.32,
    mcaLevel: 'ระดับส่งเสริมคุณธรรม',
    mcaSubtext: 'พัฒนาการขยับขึ้นอย่างมีนัยสำคัญ (+0.14 YoY)',
    modelOrgPct: 38.7,
    modelOrgCount: 84,
    totalSampleOrgs: 217,
    modelGrowthText: 'เติบโต +45.0% จากปี 2566 (84 แห่ง จาก 217 แห่ง)',
    level5PolicyPct: 31.0,
    level5PolicyOrgs: 65,
    policyExpansionRate: '31.0% (65 แห่ง)',
    policySubtext: 'เริ่มมีการออกเทศบัญญัติและบันทึกข้อตกลง (MOU) ท้องถิ่น',
    bottleneckBudgetPct: '5.8%',
    bottleneckAlertTitle: '⚠️ คอขวดด้านการตั้งงบประมาณและเครื่องมือประเมิน',
    bottleneckSubtext: 'เริ่มมีระบบ M&E บางส่วน แต่การจัดสรรงบยังไม่ถึง 7% จุดคุ้มทุน',
    bottleneckBadgeClass: 'badge-yellow',
    radarDimensionScores: {
      volunteer: 4.42,
      sufficiency: 4.26,
      gratitude: 4.24,
      integrity: 4.18,
      discipline: 4.15
    },
    maturityLevel5Ratios: {
      kamphaengphet: 33.0,
      phangnga: 40.0,
      nongkhai: 30.0,
      lampang: 53.0,
      nan: 38.0
    }
  },
  '2568': {
    year: '2568',
    isActual: true,
    statusLabel: 'ปีงบประมาณปัจจุบัน (Current Active Evaluation)',
    statusTag: 'current',
    statusBadgeColor: 'green',
    statusBadgeText: '✅ ข้อมูลสถิติจริงปีงบประมาณปัจจุบัน (Current Active Dataset N=279+)',
    description: 'ชุดข้อมูลสำรวจวิจัยจริงฉบับสมบูรณ์ ครอบคลุมพังงา (N=279), ลำปาง, น่าน, หนองคาย, กำแพงเพชร',
    mcaScore: 3.45,
    mcaLevel: 'ระดับส่งเสริมคุณธรรมขั้นสูง',
    mcaSubtext: 'คำนวณตามกรอบ MCA ถ่วงน้ำหนัก 5 ด้าน (สุจริต 30%)',
    modelOrgPct: 42.2,
    modelOrgCount: 95,
    totalSampleOrgs: 225,
    modelGrowthText: 'เติบโตเฉลี่ย +23.2% ต่อปี (95 แห่ง จาก 225 แห่ง)',
    level5PolicyPct: 37.7,
    level5PolicyOrgs: 79,
    policyExpansionRate: '37.7% (79 แห่ง)',
    policySubtext: 'ลำปางเด่นสุด 65.8% (40 แห่ง), พังงา 50.0% สู่นโยบายสาธารณะ',
    bottleneckBudgetPct: '7.5%',
    bottleneckAlertTitle: '🚨 คอขวดงบประมาณ M&E (4 - 8%)',
    bottleneckSubtext: 'มีแผนงาน 98.7% แต่ตั้งงบเพียง 7.5% และมีระบบ M&E เพียง 6-8%',
    bottleneckBadgeClass: 'badge-red',
    radarDimensionScores: {
      volunteer: 4.52,
      sufficiency: 4.38,
      gratitude: 4.41,
      integrity: 4.33,
      discipline: 4.32
    },
    maturityLevel5Ratios: {
      kamphaengphet: 42.0,
      phangnga: 50.0,
      nongkhai: 38.3,
      lampang: 65.8,
      nan: 46.7
    }
  },
  '2569': {
    year: '2569',
    isActual: false,
    statusLabel: 'แบบจำลองพยากรณ์เชิงสถิติ (Projected Model R²=0.982)',
    statusTag: 'projected',
    statusBadgeColor: 'purple',
    statusBadgeText: '🔮 แบบจำลองพยากรณ์อนาคตระยะสั้น (Predictive Forecast Y_t = 19.5t + 35.7)',
    description: 'คาดการณ์ผลกระทบจากการนำระเบียบวิธี MCA Simulator เข้าใช้บังคับในระบบกลั่นกรองโครงการ',
    mcaScore: 3.58,
    mcaLevel: 'ระดับส่งเสริมคุณธรรมขั้นสูง (กำลังก้าวสู่ระดับดีเลิศ)',
    mcaSubtext: 'คาดการณ์คะแนนขยับขึ้น +0.13 จากการปลดล็อกคอขวดงบประมาณ',
    modelOrgPct: 48.7,
    modelOrgCount: 114,
    totalSampleOrgs: 234,
    modelGrowthText: 'พยากรณ์แตะ 114 แห่ง (48.7% ขององค์กรเป้าหมาย)',
    level5PolicyPct: 45.0,
    level5PolicyOrgs: 94,
    policyExpansionRate: '45.0% (94 แห่ง)',
    policySubtext: 'ขยายผลสู่ธรรมนูญชุมชนและข้อบัญญัติ อปท. เพิ่มขึ้น +7.3%',
    bottleneckBudgetPct: '18.0%',
    bottleneckAlertTitle: '⚡ ปลดล็อกคอขวดระยะที่ 1 (Scenario B Intervention)',
    bottleneckSubtext: 'การจัดสรรงบประมาณเฉพาะแตะ 18.0% ข้ามจุดคุ้มทุนทางสังคม (SROI 4.8x)',
    bottleneckBadgeClass: 'badge-yellow',
    radarDimensionScores: {
      volunteer: 4.60,
      sufficiency: 4.46,
      gratitude: 4.48,
      integrity: 4.44,
      discipline: 4.42
    },
    maturityLevel5Ratios: {
      kamphaengphet: 49.0,
      phangnga: 57.0,
      nongkhai: 46.0,
      lampang: 72.0,
      nan: 53.0
    }
  },
  '2570': {
    year: '2570',
    isActual: false,
    statusLabel: 'แบบจำลองพยากรณ์เชิงสถิติ (Mid-term Projection)',
    statusTag: 'projected',
    statusBadgeColor: 'purple',
    statusBadgeText: '🔮 แบบจำลองพยากรณ์อนาคตระยะกลาง (Accelerated Policy Institutionalization)',
    description: 'ระยะเร่งรัดการบังคับใช้นโยบายสาธารณะและการประเมินความคุ้มค่า CIPP ทุกไตรมาส',
    mcaScore: 3.72,
    mcaLevel: 'ระดับดีเลิศ นวัตกรรมเชิงระบบ (Excellence Level)',
    mcaSubtext: 'องค์กรผ่านเกณฑ์ MCA Score > +3.60 เกินกึ่งหนึ่ง',
    modelOrgPct: 54.5,
    modelOrgCount: 133,
    totalSampleOrgs: 244,
    modelGrowthText: 'พยากรณ์แตะ 133 แห่ง (54.5% ขององค์กรทั้งหมด)',
    level5PolicyPct: 49.2,
    level5PolicyOrgs: 103,
    policyExpansionRate: '49.2% (103 แห่ง)',
    policySubtext: 'ยกระดับองค์กรสู่กลไกนโยบายสาธารณะระดับจังหวัดและกลุ่มจังหวัด',
    bottleneckBudgetPct: '35.0%',
    bottleneckAlertTitle: '✅ ปลดล็อกคอขวดระยะที่ 2 (Institutionalized M&E)',
    bottleneckSubtext: 'หน่วยงานจัดสรรงบประเมินผล 35.0% เข้าสู่ระบบงบประมาณประจำปีตามปกติ',
    bottleneckBadgeClass: 'badge-green',
    radarDimensionScores: {
      volunteer: 4.68,
      sufficiency: 4.54,
      gratitude: 4.55,
      integrity: 4.52,
      discipline: 4.49
    },
    maturityLevel5Ratios: {
      kamphaengphet: 55.0,
      phangnga: 63.0,
      nongkhai: 52.0,
      lampang: 77.0,
      nan: 59.0
    }
  },
  '2571': {
    year: '2571',
    isActual: false,
    statusLabel: 'ปีเป้าหมายยุทธศาสตร์ชาติ (Target Horizon 2571)',
    statusTag: 'projected',
    statusBadgeColor: 'purple',
    statusBadgeText: '🎯 ปีเป้าหมายสูงสุดปลายแผนปฏิบัติการฯ (Strategic Target Horizon)',
    description: 'หมุดหมายสูงสุดตามแผนยุทธศาสตร์ชาติ 20 ปี และแผนปฏิบัติการด้านการส่งเสริมคุณธรรม ระยะที่ 2',
    mcaScore: 3.85,
    mcaLevel: 'ระดับดีเลิศ นวัตกรรมเชิงระบบขั้นสูง (Systemic Innovation)',
    mcaSubtext: 'บรรลุเป้าหมายเมืองคุณธรรมต้นแบบระดับชาติอย่างสมบูรณ์แบบ',
    modelOrgPct: 60.2,
    modelOrgCount: 153,
    totalSampleOrgs: 254,
    modelGrowthText: 'บรรลุเป้าหมาย 153 แห่ง (60.2% จากฐานประเมิน 254 แห่ง)',
    level5PolicyPct: 52.5,
    level5PolicyOrgs: 110,
    policyExpansionRate: '52.5% (110 แห่ง)',
    policySubtext: 'เกินครึ่งหนึ่งขององค์กรขับเคลื่อนสู่นโยบายสาธารณะและนวัตกรรมเชิงระบบ',
    bottleneckBudgetPct: '55.0%',
    bottleneckAlertTitle: '🎉 ปลดล็อกคอขวดสมบูรณ์ (Sustainable Social Ecosystem)',
    bottleneckSubtext: 'ระบบ M&E และผลตอบแทนสังคม SROI 5.6x เท่า ดำเนินการเต็มรูปแบบทั่วประเทศ',
    bottleneckBadgeClass: 'badge-green',
    radarDimensionScores: {
      volunteer: 4.75,
      sufficiency: 4.62,
      gratitude: 4.64,
      integrity: 4.60,
      discipline: 4.58
    },
    maturityLevel5Ratios: {
      kamphaengphet: 60.0,
      phangnga: 68.0,
      nongkhai: 58.0,
      lampang: 82.0,
      nan: 65.0
    }
  }
};
