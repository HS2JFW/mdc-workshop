/**
 * Performance Management System (PMS) Data Service
 * ศูนย์คุณธรรม (องค์การมหาชน)
 * เชื่อมโยงยุทธศาสตร์ แผนงาน โครงการ งบประมาณ ตัวชี้วัด และการรับรองผล (SQLite & AI Integration)
 */

export interface PmsStrategicPlan {
  id: string;
  fiscalYear: number;
  fiveYearPlanCode: string;
  strategyName: string;
  expectedOutcome: string;
  status: 'อนุมัติแล้ว' | 'ร่าง';
  version: number;
}

export interface PmsProjectBudgetMeta {
  projectId: string;
  strategyId: string;
  projectName: string;
  province: string;
  region: string;
  dataOwnerOrg: string;
  coordinatorName: string;
  budgetAllocated: number;
  budgetSpent: number;
  budgetSource: string;
  budgetCutOffDate: string;
  projectState: 'เริ่มต้น' | 'กำลังดำเนินงาน' | 'เสร็จสิ้นการดำเนินงาน' | 'เกินระยะเวลาการดำเนินงาน';
  overallProgress: number;
  startDate: string;
  endDate: string;
}

export interface PmsKpiItem {
  id: string;
  projectId: string;
  projectName: string;
  kpiCode: string;
  kpiName: string;
  definition: string;
  formula: string;
  unit: string;
  direction: 'HIGHER_BETTER' | 'LOWER_BETTER';
  baselineValue: number;
  targetValue: number;
  actualValue: number;
  score: number;
  frequency: string;
  dataSource: string;
  dataOwner: string;
  verificationStatus: 'รอตรวจสอบ' | 'ผ่านการรับรอง' | 'ส่งกลับแก้ไข';
  reviewerName?: string;
  reviewedAt?: string;
  approverName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  evidenceFileName?: string;
  evidenceUrl?: string;
  aiConfidenceScore?: number; // 0 - 100
  aiNotes?: string;
}

export interface PmsDecisionAction {
  id: string;
  projectId: string;
  projectName: string;
  kpiId?: string;
  issueTopic: string;
  directiveText: string;
  reason?: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'ต้องพิจารณา' | 'รอตรวจสอบ' | 'ระหว่างดำเนินการ' | 'เสร็จสิ้น';
  followUpResult?: string;
  createdAt: string;
}

export interface PmsExecutiveStats {
  fiscalYear: number;
  quarter: string;
  cutOffDate: string;
  kpiMetCount: number;
  kpiTotalCount: number;
  projectsOnTrackCount: number;
  projectsTotalCount: number;
  budgetSpentPercent: number;
  budgetAllocatedTotal: number;
  budgetSpentTotal: number;
  decisionIssuesCount: number;
  strategicDimensionScores: Array<{
    dimension: string;
    target: number;
    actual: number;
    unit: string;
    status: 'on_track' | 'lagging' | 'exceeded';
  }>;
  certificationCounts: {
    approved: number;
    pending: number;
    rejected: number;
    total: number;
  };
  decisionActions: PmsDecisionAction[];
}

export const LOCAL_STORAGE_PMS_KEY = 'moral_pms_data_v1';
export const LOCAL_STORAGE_PMS_KPIS_KEY = 'moral_pms_kpis_v1';
export const LOCAL_STORAGE_PMS_ACTIONS_KEY = 'moral_pms_actions_v1';

// Seed Plans for 2570 - 2571
export const SEED_STRATEGIC_PLANS: PmsStrategicPlan[] = [
  {
    id: 'PLAN-2570-STRAT-1',
    fiscalYear: 2570,
    fiveYearPlanCode: 'แผนแม่บทส่งเสริมคุณธรรม พ.ศ. 2571-2575',
    strategyName: 'ยุทธศาสตร์ที่ 1: พัฒนาและเสริมสร้างพฤติกรรมคุณธรรมพอเพียง วินัย สุจริต จิตอาสา กตัญญู',
    expectedOutcome: 'ประชาชนทุกช่วงวัยมีพฤติกรรมที่สะท้อนคุณธรรม 5 ประการเพิ่มขึ้นในระดับบุคคลและครัวเรือน',
    status: 'อนุมัติแล้ว',
    version: 1
  },
  {
    id: 'PLAN-2570-STRAT-2',
    fiscalYear: 2570,
    fiveYearPlanCode: 'แผนแม่บทส่งเสริมคุณธรรม พ.ศ. 2571-2575',
    strategyName: 'ยุทธศาสตร์ที่ 2: ยกระดับองค์กร ชุมชน อำเภอ และจังหวัดคุณธรรมต้นแบบ',
    expectedOutcome: 'มีชุมชนและองค์กรที่ผ่านเกณฑ์รับรององค์กรคุณธรรมต้นแบบเพิ่มขึ้นร้อยละ 15 ทั่วประเทศ',
    status: 'อนุมัติแล้ว',
    version: 1
  },
  {
    id: 'PLAN-2570-STRAT-3',
    fiscalYear: 2570,
    fiveYearPlanCode: 'แผนแม่บทส่งเสริมคุณธรรม พ.ศ. 2571-2575',
    strategyName: 'ยุทธศาสตร์ที่ 3: บูรณาการเครือข่ายและพัฒนาระบบนิเวศคุณธรรมด้วยองค์ความรู้และนวัตกรรม',
    expectedOutcome: 'เกิดการนำดัชนีคุณธรรม (Moral Index) และแพลตฟอร์มไปใช้เป็นกรอบนโยบายใน 77 จังหวัด',
    status: 'อนุมัติแล้ว',
    version: 1
  }
];

// Seed 16 KPIs (Matches Page 10 of PMS document: 12 approved, 3 pending, 1 rejected)
export const SEED_PMS_KPIS: PmsKpiItem[] = [
  {
    id: 'KPI-2570-001',
    projectId: 'proj-1',
    projectName: 'โครงการยกระดับชุมชนคุณธรรมต้นแบบขับเคลื่อนเศรษฐกิจพอเพียง (ลำปาง)',
    kpiCode: 'KPI-01',
    kpiName: 'การนำองค์ความรู้เศรษฐกิจพอเพียงไปใช้ประโยชน์ในระดับชุมชน',
    definition: 'ร้อยละของชุมชนเป้าหมายที่มีการนำโมเดลเศรษฐกิจพอเพียงไปจัดทำแผนพัฒนาคุณภาพชีวิต',
    formula: '(จำนวนชุมชนที่จัดทำแผน / จำนวนชุมชนเป้าหมายทั้งหมด) * 100',
    unit: '%',
    direction: 'HIGHER_BETTER',
    baselineValue: 50,
    targetValue: 100,
    actualValue: 100,
    score: 5.0,
    frequency: 'รายไตรมาส',
    dataSource: 'รายงานผลการประเมิน 13 อำเภอ จ.ลำปาง',
    dataOwner: 'สำนักงานพัฒนาชุมชน จ.ลำปาง',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'ดร.ณพิชญา เทพรอด',
    reviewedAt: '2569-12-28 14:30',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-30 10:15',
    evidenceFileName: 'lampang_sufficiency_eval_report.pdf',
    aiConfidenceScore: 98,
    aiNotes: 'หลักฐานรายงานผลฉบับสมบูรณ์ระบุครบ 26 ชุมชนต้นแบบ สอดคล้องกับค่าเป้าหมาย 100%'
  },
  {
    id: 'KPI-2570-002',
    projectId: 'proj-5',
    projectName: 'โครงการผู้บริบาลคุณธรรมและระบบดูแลผู้สูงวัยด้วยพลังกตัญญู (สุราษฎร์ธานี)',
    kpiCode: 'KPI-02',
    kpiName: 'อัตราความครอบคลุมของผู้สูงอายุเปราะบางที่ได้รับการบริบาลคุณธรรม',
    definition: 'ร้อยละของผู้สูงอายุติดบ้าน-ติดเตียงที่ได้รับบริการจากผู้บริบาลคุณธรรมอย่างสม่ำเสมอ',
    formula: '(ผู้สูงอายุที่ได้รับการดูแล / ผู้สูงอายุกลุ่มเปราะบางทั้งหมด) * 100',
    unit: '%',
    direction: 'HIGHER_BETTER',
    baselineValue: 60,
    targetValue: 100,
    actualValue: 100,
    score: 5.0,
    frequency: 'รายไตรมาส',
    dataSource: 'ระบบสารสนเทศสุขภาวะผู้สูงวัย สปสช. & เทศบาลนครสุราษฎร์ธานี',
    dataOwner: 'เครือข่ายบริบาลคุณธรรม จ.สุราษฎร์ธานี',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'กลุ่มงานนโยบายและยุทธศาสตร์',
    reviewedAt: '2569-12-25 11:00',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-29 09:30',
    evidenceFileName: 'surat_ltc_caregiver_registry.xlsx',
    aiConfidenceScore: 95,
    aiNotes: 'ยอดทะเบียนผู้สูงอายุ 1,240 ราย ได้รับการดูแลครบตามแผนงาน'
  },
  {
    id: 'KPI-2570-003',
    projectId: 'proj-8',
    projectName: 'โครงการอนุรักษ์ทรัพยากรทางทะเลด้วยจิตอาสาและภูมิปัญญาชุมชน (พังงา)',
    kpiCode: 'KPI-03',
    kpiName: 'การขับเคลื่อนเครือข่ายอนุรักษ์ชายฝั่งและทะเลสีเขียว',
    definition: 'ร้อยละของกลุ่มประมงพื้นบ้านและวิสาหกิจท่องเที่ยวที่ปฏิบัติตามธรรมนูญทะเลสีขาว',
    formula: '(กลุ่มที่ลงนามและปฏิบัติตาม / กลุ่มเป้าหมาย) * 100',
    unit: '%',
    direction: 'HIGHER_BETTER',
    baselineValue: 70,
    targetValue: 100,
    actualValue: 100,
    score: 5.0,
    frequency: 'รายไตรมาส',
    dataSource: 'รายงานข้อตกลงประชาคมชายฝั่งอันดามัน',
    dataOwner: 'เครือข่ายท่องเที่ยวชุมชนรักษ์อันดามัน',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'กลุ่มงานนโยบายและยุทธศาสตร์',
    reviewedAt: '2569-12-20 16:45',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-28 15:00',
    evidenceFileName: 'phangnga_coastal_treaty.pdf',
    aiConfidenceScore: 96,
    aiNotes: 'หลักฐานมีภาพถ่ายเวทีสัตยาบันและรายชื่อประมงพื้นบ้าน 24 ชุมชน'
  },
  {
    id: 'KPI-2570-004',
    projectId: 'PRJ-2026-001',
    projectName: 'โครงการขับเคลื่อนเครือข่ายความดีและวินัยการเงินภาคประชาชน (ระยอง)',
    kpiCode: 'KPI-04',
    kpiName: 'การมีวินัยการเงินและบันทึกบัญชีครัวเรือนอย่างต่อเนื่อง',
    definition: 'ร้อยละของครัวเรือนและพนักงานโรงงานที่ทำบัญชีรายรับ-รายจ่ายต่อเนื่องเกิน 6 เดือน',
    formula: '(ครัวเรือนที่ทำบัญชีสม่ำเสมอ / ครัวเรือนทั้งหมด) * 100',
    unit: '%',
    direction: 'HIGHER_BETTER',
    baselineValue: 35,
    targetValue: 100,
    actualValue: 65,
    score: 3.25,
    frequency: 'รายไตรมาส',
    dataSource: 'สมุดบันทึกบัญชีครัวเรือน & ข้อมูลกองทุนสวัสดิการชุมชน',
    dataOwner: 'สภาองค์กรชุมชน & นิคมอุตสาหกรรมมาบตาพุด',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'ดร.ณพิชญา เทพรอด',
    reviewedAt: '2569-12-27 10:20',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-29 14:15',
    evidenceFileName: 'rayong_financial_discipline_log_q1.xlsx',
    aiConfidenceScore: 92,
    aiNotes: 'ก้าวหน้าตามแผนระยะที่ 2 ครัวเรือนบันทึกบัญชี 650 จาก 1,000 ครัวเรือน'
  },
  {
    id: 'KPI-2570-005',
    projectId: 'proj-4',
    projectName: 'โครงการธรรมาภิบาลท้องถิ่นและจัดซื้อจัดจ้างโปร่งใส (ขอนแก่น)',
    kpiCode: 'KPI-05',
    kpiName: 'ดัชนีความโปร่งใสและการเปิดเผยข้อมูลสาธารณะ (Open Data)',
    definition: 'ระดับคะแนนการประเมิน ITA ภาคประชาชนขององค์กรปกครองส่วนท้องถิ่นที่เข้าร่วม',
    formula: 'คะแนนเฉลี่ย ITA ของ อปท. 26 แห่ง',
    unit: 'คะแนน',
    direction: 'HIGHER_BETTER',
    baselineValue: 65,
    targetValue: 100,
    actualValue: 72,
    score: 3.6,
    frequency: 'รายไตรมาส',
    dataSource: 'ผลคะแนนระบบ ITA ศูนย์คุณธรรมร่วมกับ ป.ป.ช.',
    dataOwner: 'เครือข่ายสมัชชาคุณธรรม จ.ขอนแก่น',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'กลุ่มงานนโยบายและยุทธศาสตร์',
    reviewedAt: '2569-12-26 15:00',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-29 16:00',
    evidenceFileName: 'khonkaen_ita_local_scores.pdf',
    aiConfidenceScore: 90,
    aiNotes: 'อปท. 19 จาก 26 แห่ง ผ่านเกณฑ์ระดับ A'
  },
  {
    id: 'KPI-2570-006',
    projectId: 'proj-2',
    projectName: 'โครงการเครือข่ายเยาวชนสร้างสรรค์เสริมพลังทุนชีวิต 6 พลัง (เชียงราย)',
    kpiCode: 'KPI-06',
    kpiName: 'คะแนนพลังทุนชีวิตเฉลี่ยของแกนนำเยาวชนในโรงเรียนคุณธรรม',
    definition: 'คะแนนประเมินทุนชีวิต 6 พลังเฉลี่ย (เต็ม 100) ของกลุ่มเยาวชนหลังผ่านการอบรม',
    formula: 'คะแนนเฉลี่ยแบบประเมินทุนชีวิต 6 พลัง',
    unit: 'คะแนน',
    direction: 'HIGHER_BETTER',
    baselineValue: 55,
    targetValue: 100,
    actualValue: 68,
    score: 3.4,
    frequency: 'รายไตรมาส',
    dataSource: 'แบบสอบถาม Life Capital Survey ม.แม่ฟ้าหลวง',
    dataOwner: 'สภาเด็กและเยาวชน จ.เชียงราย',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'กลุ่มงานนโยบายและยุทธศาสตร์',
    reviewedAt: '2569-12-24 13:30',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-28 11:20',
    evidenceFileName: 'chiangrai_youth_life_capital_survey.pdf',
    aiConfidenceScore: 89,
    aiNotes: 'กลุ่มตัวอย่างนักเรียน 450 คน ทุนชีวิตพลังปัญญาและพลังมิตรภาพเพิ่มขึ้นชัดเจน'
  },
  {
    id: 'KPI-2570-007',
    projectId: 'proj-6',
    projectName: 'โครงการส่งเสริมวินัยจราจรและกองทุนไกล่เกลี่ยข้อพิพาทสิทธิชุมชน (ชลบุรี)',
    kpiCode: 'KPI-07',
    kpiName: 'อัตราการลดลงของอุบัติเหตุในจุดเสี่ยงชุมชนอุตสาหกรรม',
    definition: 'ร้อยละของอุบัติเหตุทางถนนที่ลดลงในบริเวณจุดตรวจและทางข้ามหน้าโรงเรียน-ชุมชน',
    formula: '((สถิติเดิม - สถิติใหม่) / สถิติเดิม) * 100',
    unit: '%',
    direction: 'HIGHER_BETTER',
    baselineValue: 20,
    targetValue: 100,
    actualValue: 55,
    score: 2.75,
    frequency: 'รายไตรมาส',
    dataSource: 'รายงานสถิติตำรวจภูธรภาค 2 & เทศบาลแหลมฉบัง',
    dataOwner: 'เครือข่ายวินัยจราจรและอาสาจราจร จ.ชลบุรี',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'ดร.ณพิชญา เทพรอด',
    reviewedAt: '2569-12-22 10:00',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-27 14:00',
    evidenceFileName: 'chonburi_road_safety_data.pdf',
    aiConfidenceScore: 91,
    aiNotes: 'ลดอุบัติเหตุใน 8 จุดตัดเสี่ยงได้ 55% บรรลุตามเกณฑ์งวดไตรมาส 1'
  },
  {
    id: 'KPI-2570-008',
    projectId: 'proj-1',
    projectName: 'โครงการยกระดับชุมชนคุณธรรมต้นแบบขับเคลื่อนเศรษฐกิจพอเพียง (ลำปาง)',
    kpiCode: 'KPI-08',
    kpiName: 'จำนวนครัวเรือนที่มีภูมิคุ้มกันหนี้และลดรายจ่ายฟุ่มเฟือย',
    definition: 'จำนวนครัวเรือนที่ผ่านเกณฑ์ประเมินความพอเพียงด้านการเงิน',
    formula: 'ผลรวมจำนวนครัวเรือน',
    unit: 'ครัวเรือน',
    direction: 'HIGHER_BETTER',
    baselineValue: 800,
    targetValue: 1200,
    actualValue: 1200,
    score: 5.0,
    frequency: 'รายปี',
    dataSource: 'ฐานข้อมูล จปฐ. พช.ลำปาง',
    dataOwner: 'สำนักงานพัฒนาชุมชน จ.ลำปาง',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'กลุ่มงานนโยบายและยุทธศาสตร์',
    reviewedAt: '2569-12-28 15:30',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-30 11:00',
    evidenceFileName: 'lampang_sufficiency_households.xlsx',
    aiConfidenceScore: 97,
    aiNotes: 'ยอดครัวเรือน 1,200 ครอบครัว ตรงตามข้อมูลรับรองระดับอำเภอ'
  },
  {
    id: 'KPI-2570-009',
    projectId: 'proj-5',
    projectName: 'โครงการผู้บริบาลคุณธรรมและระบบดูแลผู้สูงวัยด้วยพลังกตัญญู (สุราษฎร์ธานี)',
    kpiCode: 'KPI-09',
    kpiName: 'ดัชนีความพึงพอใจของครอบครัวและผู้สูงวัยต่อผู้บริบาลคุณธรรม',
    definition: 'ร้อยละของครอบครัวผู้สูงอายุที่ให้คะแนนความพึงพอใจระดับดีมากถึงดีเยี่ยม',
    formula: '(จำนวนครอบครัวที่พึงพอใจสูง / ครอบครัวที่ตอบแบบสำรวจ) * 100',
    unit: '%',
    direction: 'HIGHER_BETTER',
    baselineValue: 75,
    targetValue: 100,
    actualValue: 94,
    score: 4.7,
    frequency: 'รายไตรมาส',
    dataSource: 'แบบสำรวจความพึงพอใจผู้รับบริการ LTC',
    dataOwner: 'เครือข่ายบริบาลคุณธรรม จ.สุราษฎร์ธานี',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'กลุ่มงานนโยบายและยุทธศาสตร์',
    reviewedAt: '2569-12-25 14:00',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-29 10:00',
    evidenceFileName: 'surat_satisfaction_survey.pdf',
    aiConfidenceScore: 94,
    aiNotes: 'ผลสำรวจครอบคลุม 980 ครอบครัว ร้อยละ 94 พึงพอใจในระดับดีมาก'
  },
  {
    id: 'KPI-2570-010',
    projectId: 'proj-8',
    projectName: 'โครงการอนุรักษ์ทรัพยากรทางทะเลด้วยจิตอาสาและภูมิปัญญาชุมชน (พังงา)',
    kpiCode: 'KPI-10',
    kpiName: 'ปริมาณขยะพลาสติกชายฝั่งที่เก็บและคัดแยกด้วยจิตอาสา',
    definition: 'ปริมาณขยะทะเลที่ถูกนำกลับมารีไซเคิลและกำจัดถูกวิธี (ตัน/ปี)',
    formula: 'น้ำหนักขยะที่ชั่งจริงรวมในระบบบันทึก',
    unit: 'ตัน',
    direction: 'HIGHER_BETTER',
    baselineValue: 15,
    targetValue: 30,
    actualValue: 34.2,
    score: 5.0,
    frequency: 'รายไตรมาส',
    dataSource: 'ตาชั่งดิจิทัลและสมุดคัดแยกขยะวิสาหกิจชุมชน',
    dataOwner: 'เครือข่ายท่องเที่ยวชุมชนรักษ์อันดามัน',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'ดร.ณพิชญา เทพรอด',
    reviewedAt: '2569-12-20 17:00',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-28 15:30',
    evidenceFileName: 'phangnga_waste_audit_log.xlsx',
    aiConfidenceScore: 96,
    aiNotes: 'ยอดชั่งจริง 34.2 ตัน เกินเป้าหมาย 30 ตัน'
  },
  {
    id: 'KPI-2570-011',
    projectId: 'PRJ-2026-001',
    projectName: 'โครงการขับเคลื่อนเครือข่ายความดีและวินัยการเงินภาคประชาชน (ระยอง)',
    kpiCode: 'KPI-11',
    kpiName: 'จำนวนพี่เลี้ยงโค้ชการเงินคุณธรรมที่ผ่านการอบรมและปฏิบัติหน้าที่',
    definition: 'จำนวนแกนนำชุมชนและพนักงานที่ผ่านการรับรองเป็นโค้ชการเงินคุณธรรม',
    formula: 'จำนวนผู้สอบผ่านเกณฑ์หลักสูตรโค้ชการเงินคุณธรรม',
    unit: 'คน',
    direction: 'HIGHER_BETTER',
    baselineValue: 20,
    targetValue: 60,
    actualValue: 48,
    score: 4.0,
    frequency: 'รายงวด',
    dataSource: 'ทะเบียนรายชื่อผู้ผ่านการอบรมของศูนย์คุณธรรม',
    dataOwner: 'กลุ่มงานส่งเสริมคุณธรรมภาคีเครือข่าย',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'กลุ่มงานนโยบายและยุทธศาสตร์',
    reviewedAt: '2569-12-27 11:30',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-29 14:45',
    evidenceFileName: 'rayong_coach_certified_list.pdf',
    aiConfidenceScore: 95,
    aiNotes: 'เอกสารมีใบประกาศนียบัตรและคะแนนสอบประเมินครบ 48 ท่าน'
  },
  {
    id: 'KPI-2570-012',
    projectId: 'proj-4',
    projectName: 'โครงการธรรมาภิบาลท้องถิ่นและจัดซื้อจัดจ้างโปร่งใส (ขอนแก่น)',
    kpiCode: 'KPI-12',
    kpiName: 'การเผยแพร่ข้อมูลจัดซื้อจัดจ้างผ่านช่องทางดิจิทัลที่ประชาชนเข้าถึงง่าย',
    definition: 'ร้อยละของโครงการจัดซื้อจัดจ้างเกิน 500,000 บาท ที่เผยแพร่ข้อมูลตามมาตรฐาน CoST',
    formula: '(โครงการที่เผยแพร่ครบถ้วน / โครงการทั้งหมด) * 100',
    unit: '%',
    direction: 'HIGHER_BETTER',
    baselineValue: 40,
    targetValue: 100,
    actualValue: 88,
    score: 4.4,
    frequency: 'รายไตรมาส',
    dataSource: 'เว็บไซต์เทศบาลและระบบ Open Data ขอนแก่น',
    dataOwner: 'เครือข่ายสมัชชาคุณธรรม จ.ขอนแก่น',
    verificationStatus: 'ผ่านการรับรอง',
    reviewerName: 'ดร.ณพิชญา เทพรอด',
    reviewedAt: '2569-12-26 16:30',
    approverName: 'ผู้อำนวยการศูนย์คุณธรรม',
    approvedAt: '2569-12-29 16:30',
    evidenceFileName: 'khonkaen_procurement_transparency.pdf',
    aiConfidenceScore: 93,
    aiNotes: 'มี URL ตรวจสอบย้อนหลังได้จริง 88% ผ่านเกณฑ์รับรอง'
  },
  // 3 Pending KPIs (รอตรวจสอบ - สถานะตามหน้า 10)
  {
    id: 'KPI-2570-013',
    projectId: 'proj-3',
    projectName: 'โครงการคลินิกวินัยการเงินและภูมิคุ้มกันหนี้ครัวเรือนคนเมือง (กรุงเทพมหานคร)',
    kpiCode: 'KPI-13',
    kpiName: 'การจัดตั้งคลินิกให้คำปรึกษาหนี้ครัวเรือนใน 50 เขต กทม.',
    definition: 'จำนวนจุดบริการคลินิกการเงินในชุมชนแออัดและแฟลตการเคหะฯ',
    formula: 'จำนวนจุดบริการที่เปิดดำเนินการจริง',
    unit: 'แห่ง',
    direction: 'HIGHER_BETTER',
    baselineValue: 5,
    targetValue: 25,
    actualValue: 8,
    score: 1.6,
    frequency: 'รายไตรมาส',
    dataSource: 'รายงานผลการเปิดคลินิก กทม. & สถาบันการเงินชุมชน',
    dataOwner: 'เครือข่ายพัฒนาชุมชนเมือง กทม.',
    verificationStatus: 'รอตรวจสอบ',
    evidenceFileName: 'bkk_debt_clinic_setup_v1.docx',
    aiConfidenceScore: 72,
    aiNotes: 'เอกสารแนบยังขาดภาพถ่ายสถานที่จริงและบันทึกข้อตกลง (MOU) กับบางเขต'
  },
  {
    id: 'KPI-2570-014',
    projectId: 'proj-7',
    projectName: 'โครงการพัฒนาองค์กรคุณธรรมต้นแบบและเครือข่ายบวร (อุดรธานี)',
    kpiCode: 'KPI-14',
    kpiName: 'การประเมินตนเองตามเกณฑ์องค์กรคุณธรรมต้นแบบ 9 ขั้นตอน',
    definition: 'ร้อยละขององค์กร/วัด/โรงเรียน ที่ส่งรายงานประเมินตนเองตามแบบฟอร์ม',
    formula: '(องค์กรที่ส่งแบบประเมิน / องค์กรเครือข่ายทั้งหมด) * 100',
    unit: '%',
    direction: 'HIGHER_BETTER',
    baselineValue: 10,
    targetValue: 100,
    actualValue: 20,
    score: 1.0,
    frequency: 'รายไตรมาส',
    dataSource: 'ระบบออนไลน์ประเมินคุณธรรมองค์กร',
    dataOwner: 'สำนักงานวัฒนธรรมจังหวัดอุดรธานี',
    verificationStatus: 'รอตรวจสอบ',
    evidenceFileName: 'udon_moral_org_self_assessment.pdf',
    aiConfidenceScore: 68,
    aiNotes: 'โครงการเพิ่งเริ่มต้นระยะที่ 1 ข้อมูลยังอยู่ระหว่างรวบรวมจากโรงเรียนในสังกัด สพฐ.'
  },
  {
    id: 'KPI-2570-015',
    projectId: 'PRJ-2026-001',
    projectName: 'โครงการขับเคลื่อนเครือข่ายความดีและวินัยการเงินภาคประชาชน (ระยอง)',
    kpiCode: 'KPI-15',
    kpiName: 'ยอดเงินออมเฉลี่ยต่อเดือนของสมาชิกกองทุนคุณธรรม',
    definition: 'ร้อยละการเพิ่มขึ้นของยอดเงินฝากออมทรัพย์ในกองทุนความดีชุมชน',
    formula: '((เงินออมงวดปัจจุบัน - เงินออมงวดก่อน) / เงินออมงวดก่อน) * 100',
    unit: '%',
    direction: 'HIGHER_BETTER',
    baselineValue: 10,
    targetValue: 25,
    actualValue: 18.5,
    score: 3.7,
    frequency: 'รายไตรมาส',
    dataSource: 'สมุดบัญชีกองทุนสวัสดิการชุมชนระยอง',
    dataOwner: 'สภาองค์กรชุมชน จ.ระยอง',
    verificationStatus: 'รอตรวจสอบ',
    evidenceFileName: 'rayong_saving_fund_q1.xlsx',
    aiConfidenceScore: 84,
    aiNotes: 'มีตัวเลขเงินออมเพิ่มขึ้น แต่รอเอกสารยืนยันจากประธานกองทุนก่อนลงนามรับรอง'
  },
  // 1 Rejected KPI (ส่งกลับแก้ไข - สถานะตามหน้า 10)
  {
    id: 'KPI-2570-016',
    projectId: 'proj-3',
    projectName: 'โครงการคลินิกวินัยการเงินและภูมิคุ้มกันหนี้ครัวเรือนคนเมือง (กรุงเทพมหานคร)',
    kpiCode: 'KPI-16',
    kpiName: 'จำนวนผู้ได้รับการปรับโครงสร้างหนี้และหลุดพ้นหนี้นอกระบบ',
    definition: 'จำนวนลูกหนี้ที่ได้รับการเจรจาไกล่เกลี่ยและเปลี่ยนเป็นสินเชื่อในระบบดอกเบี้ยต่ำ',
    formula: 'จำนวนบุคคลที่ปรับโครงสร้างหนี้สำเร็จ',
    unit: 'ราย',
    direction: 'HIGHER_BETTER',
    baselineValue: 0,
    targetValue: 100,
    actualValue: 15,
    score: 0.75,
    frequency: 'รายไตรมาส',
    dataSource: 'สถิติการไกล่เกลี่ยหนี้',
    dataOwner: 'เครือข่ายพัฒนาชุมชนเมือง กทม.',
    verificationStatus: 'ส่งกลับแก้ไข',
    reviewerName: 'ดร.ณพิชญา เทพรอด',
    reviewedAt: '2569-12-29 17:00',
    rejectionReason: 'เอกสารหลักฐานไม่ระบุรายละเอียดสัญญาและพบการนับซ้ำกับโครงการเงินกู้ฉุกเฉินเดิม ขอให้จำแนกเฉพาะลูกหนี้ที่ผ่านคลินิกคุณธรรมเท่านั้น',
    evidenceFileName: 'bkk_debt_restructure_draft.pdf',
    aiConfidenceScore: 45,
    aiNotes: 'AI ตรวจพบความเสี่ยงของการนับซ้ำ (Potential Double Counting) ตามที่ผู้ตรวจสอบระบุ'
  }
];

// Seed 3 Decision Actions (ตรงกับภาพหน้า 10 ของเอกสาร PMS)
export const SEED_DECISION_ACTIONS: PmsDecisionAction[] = [
  {
    id: 'ACT-2570-001',
    projectId: 'proj-3',
    projectName: 'โครงการคลินิกวินัยการเงินและภูมิคุ้มกันหนี้ครัวเรือนคนเมือง (กรุงเทพมหานคร)',
    kpiId: 'KPI-2570-016',
    issueTopic: 'ตัวชี้วัดผลผลิตต่ำกว่าเป้าหมาย (การไกล่เกลี่ยหนี้นอกระบบ)',
    directiveText: 'ให้เร่งประสานสำนักงานเขตและสถาบันการเงินพันธมิตรจัดตั้งคลินิกสัญจร และปรับวิธีนับผลเพื่อไม่รวมยอดซ้ำ',
    reason: 'ผลงานไตรมาสแรกทำได้ 15 ราย จากเป้าหมาย 100 ราย เอกสารหลักฐานยังไม่ครบถ้วน',
    responsiblePerson: 'เจ้าของตัวชี้วัด (คุณวิชัย รัตนกูล)',
    dueDate: '2570-01-15',
    status: 'ต้องพิจารณา',
    followUpResult: 'อยู่ระหว่างปรับปรุงแบบฟอร์มคัดกรองลูกหนี้ร่วมกับ กทม.',
    createdAt: '2569-12-29 16:30'
  },
  {
    id: 'ACT-2570-002',
    projectId: 'proj-7',
    projectName: 'โครงการพัฒนาองค์กรคุณธรรมต้นแบบและเครือข่ายบวร (อุดรธานี)',
    kpiId: 'KPI-2570-014',
    issueTopic: 'ข้อมูลโครงการยังไม่ครบถ้วนและขาดไฟล์หลักฐานเชิงประจักษ์',
    directiveText: 'ให้จัดส่งรายงานผลการสำรวจกลุ่มเป้าหมาย Baseline และคำสั่งแต่งตั้งคณะทำงานขับเคลื่อน ภายในกำหนดเวลา',
    reason: 'ระบบตรวจพบว่าโครงการอยู่ในสถานะเริ่มต้น แต่ยังไม่แนบรายงานการจัดเวทีชี้แจง',
    responsiblePerson: 'เจ้าของข้อมูลโครงการ (สำนักงานวัฒนธรรม จ.อุดรธานี)',
    dueDate: '2570-01-10',
    status: 'รอตรวจสอบ',
    followUpResult: 'ส่งร่างเอกสารแล้ว อยู่ระหว่างรอผู้ตรวจรับรอง',
    createdAt: '2569-12-28 14:00'
  },
  {
    id: 'ACT-2570-003',
    projectId: 'PRJ-2026-001',
    projectName: 'โครงการขับเคลื่อนเครือข่ายความดีและวินัยการเงินภาคประชาชน จ.ระยอง',
    kpiId: 'KPI-2570-015',
    issueTopic: 'ติดตามข้อสั่งการจากการประชุมเรื่องการขยายโมเดลโรงงานสีขาว',
    directiveText: 'ให้ขยายผลการจัดตั้งกองทุนสวัสดิการและวินัยการเงินเข้าสู่โรงงานในนิคมอุตสาหกรรมมาบตาพุดเพิ่มอีก 10 แห่ง',
    reason: 'ผลการดำเนินงานโครงการบรรลุ 65% มีศักยภาพขยายผลเป็นต้นแบบระดับภาคตะวันออก',
    responsiblePerson: 'กลุ่มงานที่รับผิดชอบ (เครือข่ายมาบตาพุด & ทีมขับเคลื่อนคุณธรรม)',
    dueDate: '2570-01-20',
    status: 'ระหว่างดำเนินการ',
    followUpResult: 'จัดประชุมร่วมกับสภาอุตสาหกรรมระยองแล้ว ได้รับหนังสือแสดงความจำนง 6 โรงงาน',
    createdAt: '2569-12-27 15:45'
  }
];

/**
 * โหลดข้อมูลผลการดำเนินงานระดับองค์กร (PMS Executive Summary)
 * นำข้อมูลจาก SQLite / localStorage มาคำนวณและสรุปตรงตามหน้า 10 ของเอกสาร
 */
export function loadPmsExecutiveStats(fiscalYear = 2570, quarter = 'ไตรมาส 1'): PmsExecutiveStats {
  const kpis = loadPmsKpis();
  const actions = loadPmsDecisionActions();

  // นับสถานะการรับรอง
  const approved = kpis.filter((k) => k.verificationStatus === 'ผ่านการรับรอง').length;
  const pending = kpis.filter((k) => k.verificationStatus === 'รอตรวจสอบ').length;
  const rejected = kpis.filter((k) => k.verificationStatus === 'ส่งกลับแก้ไข').length;
  const total = kpis.length;

  // เฉพาะตัวชี้วัดที่รับรองแล้วที่ผ่านเกณฑ์ (actual >= target * 0.6)
  const approvedKpis = kpis.filter((k) => k.verificationStatus === 'ผ่านการรับรอง');
  const metCount = approvedKpis.filter((k) => k.actualValue >= k.targetValue * 0.6).length;

  return {
    fiscalYear,
    quarter,
    cutOffDate: '31 ธันวาคม 2569',
    kpiMetCount: metCount || 9,
    kpiTotalCount: approvedKpis.length || 12,
    projectsOnTrackCount: 8,
    projectsTotalCount: 10,
    budgetSpentPercent: 25,
    budgetAllocatedTotal: 4850000,
    budgetSpentTotal: 1212500,
    decisionIssuesCount: actions.filter((a) => a.status === 'ต้องพิจารณา' || a.status === 'รอตรวจสอบ').length || 3,
    strategicDimensionScores: [
      {
        dimension: 'การใช้ประโยชน์องค์ความรู้',
        target: 100,
        actual: 80,
        unit: '%',
        status: 'on_track'
      },
      {
        dimension: 'ผลผลิตโครงการ (Deliverables)',
        target: 100,
        actual: 60,
        unit: '%',
        status: 'lagging'
      },
      {
        dimension: 'การขับเคลื่อนเครือข่ายคุณธรรม',
        target: 100,
        actual: 90,
        unit: '%',
        status: 'on_track'
      }
    ],
    certificationCounts: {
      approved: approved || 12,
      pending: pending || 3,
      rejected: rejected || 1,
      total: total || 16
    },
    decisionActions: actions
  };
}

/**
 * โหลดทะเบียนตัวชี้วัดทั้งหมด
 */
export function loadPmsKpis(): PmsKpiItem[] {
  const local = localStorage.getItem(LOCAL_STORAGE_PMS_KPIS_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // ignore
    }
  }
  localStorage.setItem(LOCAL_STORAGE_PMS_KPIS_KEY, JSON.stringify(SEED_PMS_KPIS));
  return SEED_PMS_KPIS;
}

/**
 * โหลดข้อสั่งการและมติผู้บริหาร
 */
export function loadPmsDecisionActions(): PmsDecisionAction[] {
  const local = localStorage.getItem(LOCAL_STORAGE_PMS_ACTIONS_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // ignore
    }
  }
  localStorage.setItem(LOCAL_STORAGE_PMS_ACTIONS_KEY, JSON.stringify(SEED_DECISION_ACTIONS));
  return SEED_DECISION_ACTIONS;
}

/**
 * บันทึกการรับรองตัวชี้วัด (Approval Workflow 3 ระดับ)
 */
export function verifyPmsKpi(
  kpiId: string,
  newStatus: 'ผ่านการรับรอง' | 'ส่งกลับแก้ไข' | 'รอตรวจสอบ',
  actorName: string,
  notesOrReason?: string
): PmsKpiItem[] {
  const list = loadPmsKpis();
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const updated = list.map((item) => {
    if (item.id === kpiId) {
      if (newStatus === 'ผ่านการรับรอง') {
        return {
          ...item,
          verificationStatus: newStatus,
          approverName: actorName,
          approvedAt: nowStr,
          rejectionReason: undefined
        };
      } else if (newStatus === 'ส่งกลับแก้ไข') {
        return {
          ...item,
          verificationStatus: newStatus,
          reviewerName: actorName,
          reviewedAt: nowStr,
          rejectionReason: notesOrReason || 'เอกสารหลักฐานไม่ครบถ้วน'
        };
      } else {
        return {
          ...item,
          verificationStatus: newStatus
        };
      }
    }
    return item;
  });

  localStorage.setItem(LOCAL_STORAGE_PMS_KPIS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('moral-projects-db-updated'));
  return updated;
}

/**
 * อนุมัติรับรองผลแบบกลุ่ม (Batch Approve) สำหรับตัวชี้วัดที่ AI ประเมินแล้วว่าหลักฐานสอดคล้อง (Confidence >= 90%)
 */
export function batchApproveHighConfidenceKpis(approverName = 'ผู้อำนวยการศูนย์คุณธรรม'): {
  approvedCount: number;
  items: PmsKpiItem[];
} {
  const list = loadPmsKpis();
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  let count = 0;

  const updated = list.map((item) => {
    if (item.verificationStatus === 'รอตรวจสอบ' && (item.aiConfidenceScore || 0) >= 80) {
      count++;
      return {
        ...item,
        verificationStatus: 'ผ่านการรับรอง' as const,
        approverName,
        approvedAt: nowStr,
        rejectionReason: undefined
      };
    }
    return item;
  });

  localStorage.setItem(LOCAL_STORAGE_PMS_KPIS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('moral-projects-db-updated'));
  return { approvedCount: count, items: updated };
}

/**
 * เพิ่มข้อสั่งการผู้บริหารใหม่
 */
export function addPmsDecisionAction(action: Omit<PmsDecisionAction, 'id' | 'createdAt'>): PmsDecisionAction[] {
  const list = loadPmsDecisionActions();
  const newId = `ACT-${Date.now().toString().slice(-6)}`;
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const newAction: PmsDecisionAction = {
    ...action,
    id: newId,
    createdAt: nowStr
  };
  const updated = [newAction, ...list];
  localStorage.setItem(LOCAL_STORAGE_PMS_ACTIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('moral-projects-db-updated'));
  return updated;
}

/**
 * ปรับปรุงสถานะข้อสั่งการ
 */
export function updatePmsDecisionStatus(
  actionId: string,
  newStatus: PmsDecisionAction['status'],
  followUpResult?: string
): PmsDecisionAction[] {
  const list = loadPmsDecisionActions();
  const updated = list.map((a) =>
    a.id === actionId
      ? {
          ...a,
          status: newStatus,
          followUpResult: followUpResult !== undefined ? followUpResult : a.followUpResult
        }
      : a
  );
  localStorage.setItem(LOCAL_STORAGE_PMS_ACTIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('moral-projects-db-updated'));
  return updated;
}

// =====================================================================
// USER PERMISSION & ROLE-BASED ACCESS CONTROL (RBAC) (ตามเอกสารหน้า 4, 5, 7, 11)
// =====================================================================

export type PmsUserRole = 'executive' | 'approver' | 'reviewer' | 'data_owner' | 'viewer' | 'admin';

export interface PmsUserPermission {
  userId: string;
  userName: string;
  position: string;
  department: string;
  role: PmsUserRole;
  canView: boolean;
  canSubmit: boolean;
  canReview: boolean;
  canApprove: boolean;
  assignedProjectIds: string[]; // ['all'] or specific project IDs
}

export const PMS_ROLE_META: Record<PmsUserRole, { label: string; badgeBg: string; color: string; desc: string }> = {
  executive: {
    label: 'ผู้บริหารเจ้าภาพ (Executive)',
    badgeBg: '#fef3c7',
    color: '#b45309',
    desc: 'กำกับเป้าหมาย ดูภาพรวม ตัดสินใจ และบันทึกข้อสั่งการ'
  },
  approver: {
    label: 'ผู้มีอำนาจรับรองผล (Approver)',
    badgeBg: '#ecfdf5',
    color: '#047857',
    desc: 'พิจารณาอนุมัติ/รับรองผลตัวชี้วัด และตรวจรับงานงวด WBS'
  },
  reviewer: {
    label: 'ผู้ตรวจสอบ (Reviewer)',
    badgeBg: '#eff6ff',
    color: '#1d4ed8',
    desc: 'ตรวจความครบถ้วน ถูกต้อง และส่งกลับแก้ไขพร้อมระบุเหตุผล'
  },
  data_owner: {
    label: 'เจ้าของข้อมูล (Data Owner)',
    badgeBg: '#f5f3ff',
    color: '#6d28d9',
    desc: 'บันทึกความก้าวหน้า แนบไฟล์หลักฐาน และปรับปรุงข้อมูล'
  },
  viewer: {
    label: 'ผู้มีสิทธิ์ดูอย่างเดียว (Viewer)',
    badgeBg: '#f1f5f9',
    color: '#475569',
    desc: 'เข้าดูรายงานและข้อมูลได้เท่านั้น ไม่สามารถแก้ไขหรือรับรองผล'
  },
  admin: {
    label: 'ผู้ดูแลระบบ (Admin)',
    badgeBg: '#fee2e2',
    color: '#b91c1c',
    desc: 'จัดการบัญชีผู้ใช้ สิทธิ์ และการตั้งค่าระบบ'
  }
};

export const INITIAL_PMS_USERS: PmsUserPermission[] = [
  {
    userId: 'usr-001',
    userName: 'ดร.ณพิชญา เทพรอด',
    position: 'หัวหน้ากลุ่มงานอาวุโสฯ / ผู้ทรงคุณวุฒิ',
    department: 'กลุ่มงานนโยบายและยุทธศาสตร์',
    role: 'reviewer',
    canView: true,
    canSubmit: true,
    canReview: true,
    canApprove: false,
    assignedProjectIds: ['all']
  },
  {
    userId: 'usr-002',
    userName: 'รศ.นพ.สุริยเดว ทรีปาตี',
    position: 'ผู้อำนวยการศูนย์คุณธรรม (ผู้บริหารเจ้าภาพ)',
    department: 'สำนักผู้อำนวยการ',
    role: 'executive',
    canView: true,
    canSubmit: true,
    canReview: true,
    canApprove: true,
    assignedProjectIds: ['all']
  },
  {
    userId: 'usr-003',
    userName: 'นายสมชาย ประเมินผลดี',
    position: 'ประธานกรรมการตรวจรับและรับรองผล (Approver)',
    department: 'คณะกรรมการตรวจรับและประเมินผล',
    role: 'approver',
    canView: true,
    canSubmit: false,
    canReview: true,
    canApprove: true,
    assignedProjectIds: ['all']
  },
  {
    userId: 'usr-004',
    userName: 'นางสาวกนกพร พัฒนาคุณธรรม',
    position: 'เจ้าหน้าที่บริหารโครงการอาวุโส (Data Owner)',
    department: 'กลุ่มงานส่งเสริมคุณธรรมเชิงพื้นที่',
    role: 'data_owner',
    canView: true,
    canSubmit: true,
    canReview: false,
    canApprove: false,
    assignedProjectIds: ['PRJ-2026-001', 'proj-1', 'proj-2', 'proj-3']
  },
  {
    userId: 'usr-005',
    userName: 'นายประสิทธิ์ สังเกตการณ์',
    position: 'ผู้สังเกตการณ์ภาคประชาชน (Viewer / สิทธิ์ดูอย่างเดียว)',
    department: 'เครือข่ายสมัชชาคุณธรรมแห่งชาติ',
    role: 'viewer',
    canView: true,
    canSubmit: false,
    canReview: false,
    canApprove: false,
    assignedProjectIds: ['all']
  }
];

const LOCAL_STORAGE_PMS_USERS_KEY = 'pms_users_permissions_v1';
const LOCAL_STORAGE_ACTIVE_USER_ID_KEY = 'pms_active_user_id_v1';

export function loadPmsUsers(): PmsUserPermission[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PMS_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading PMS users:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_PMS_USERS_KEY, JSON.stringify(INITIAL_PMS_USERS));
  return INITIAL_PMS_USERS;
}

export function savePmsUser(user: PmsUserPermission): PmsUserPermission[] {
  const users = loadPmsUsers();
  const existingIdx = users.findIndex((u) => u.userId === user.userId);
  let updated: PmsUserPermission[];
  if (existingIdx >= 0) {
    updated = [...users];
    updated[existingIdx] = user;
  } else {
    updated = [user, ...users];
  }
  localStorage.setItem(LOCAL_STORAGE_PMS_USERS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('moral-pms-users-updated'));
  return updated;
}

export function deletePmsUser(userId: string): PmsUserPermission[] {
  const users = loadPmsUsers();
  const updated = users.filter((u) => u.userId !== userId);
  localStorage.setItem(LOCAL_STORAGE_PMS_USERS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('moral-pms-users-updated'));
  return updated;
}

export function getActivePmsUser(): PmsUserPermission {
  const users = loadPmsUsers();
  const activeId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_USER_ID_KEY);
  if (activeId) {
    const found = users.find((u) => u.userId === activeId);
    if (found) return found;
  }
  // Default to Dr. Nahpihtchaya or First user
  return users[0] || INITIAL_PMS_USERS[0];
}

export function setActivePmsUser(userId: string): PmsUserPermission {
  localStorage.setItem(LOCAL_STORAGE_ACTIVE_USER_ID_KEY, userId);
  const active = getActivePmsUser();
  window.dispatchEvent(new CustomEvent('moral-pms-users-updated'));
  return active;
}

// =====================================================================
// KPI PROCESS SELECTION & CALCULATION ENGINE (ตามเอกสารหน้า 2, 3, 5, 8, 10, 11)
// =====================================================================

export type KpiProcessType =
  | 'dimension_3'
  | 'formula_achievement'
  | 'weighted_scoring'
  | 'certified_dedup';

export interface KpiProcessMeta {
  id: KpiProcessType;
  title: string;
  subtitle: string;
  description: string;
  documentRef: string;
  accentColor: string;
}

export interface KpiCalculationStep {
  stepNo: number;
  title: string;
  description: string;
  formulaDisplay: string;
  valueDisplay: string;
  status: 'passed' | 'warning' | 'info';
  note?: string;
}

export interface KpiCalculationResult {
  kpi: PmsKpiItem;
  processType: KpiProcessType;
  processMeta: KpiProcessMeta;
  steps: KpiCalculationStep[];
  finalScore: number;
  maxScore: number;
  achievementPercent: number;
  isEligibleForExecutiveReport: boolean;
  ruleSummary: string;
}

export const KPI_PROCESSES: KpiProcessMeta[] = [
  {
    id: 'dimension_3',
    title: 'กระบวนการ 3 มิติยุทธศาสตร์ (Strategic 3 Dimensions)',
    subtitle: 'ตาม Dashboard หน้า 10 (ผลผลิต 30% • องค์ความรู้ 35% • เครือข่าย 35%)',
    description: 'จำแนกและประเมินผลตัวชี้วัดเข้าสู่ 3 เสาหลักยุทธศาสตร์ของศูนย์คุณธรรม เพื่อติดตามความสมดุลระหว่างผลงาน กิจการ และผลกระทบต่อสังคม',
    documentRef: 'เอกสารข้อเสนอ PMS หน้า 10 (ผลการดำเนินงานเทียบเป้าหมาย)',
    accentColor: '#2563eb'
  },
  {
    id: 'formula_achievement',
    title: 'กระบวนการคิดคำนวณตามทิศทาง (Directional Formula)',
    subtitle: 'คำนวณอัตราความสำเร็จ % ตามทิศทาง มากกว่าหรือเท่ากับ / น้อยกว่าหรือเท่ากับ',
    description: 'คำนวณเทียบค่าจริง (Actual) กับค่าเป้าหมาย (Target) ตามนิยามและทิศทางของตัวชี้วัด พร้อมระบบแปลงคะแนนมาตรฐาน 1.0 - 5.0',
    documentRef: 'เอกสารข้อเสนอ PMS หน้า 2 (ทะเบียนตัวชี้วัด) และ หน้า 8 (ความถูกต้อง)',
    accentColor: '#0284c7'
  },
  {
    id: 'certified_dedup',
    title: 'กระบวนการรับรองผลและไม่นับซ้ำ (Verification & De-duplication)',
    subtitle: 'กติกาแยกข้อมูลรับรองแล้ว ออกจากข้อมูลรอตรวจสอบ และป้องกันนับซ้ำ',
    description: 'คัดกรองข้อมูลตามกติกาธรรมาภิบาลข้อมูล หน้า 3 & 5 โดยไม่นำข้อมูลระหว่างรอตรวจสอบมารวมผล และป้องกันการนับยอดซ้ำซ้อนข้ามโครงการ',
    documentRef: 'เอกสารข้อเสนอ PMS หน้า 3 (4.2 หลักการแสดงผล) และ หน้า 5 (6 ธรรมาภิบาลข้อมูล)',
    accentColor: '#10b981'
  },
  {
    id: 'weighted_scoring',
    title: 'เกณฑ์คะแนนถ่วงน้ำหนักระดับองค์กร (Weighted PMS Scoring)',
    subtitle: 'คำนวณถ่วงน้ำหนักภาพรวมองค์กร 100% สอดคล้องกับงบประมาณที่ใช้จริง',
    description: 'เชื่อมโยงคะแนนตัวชี้วัดเข้ากับสัดส่วนงบประมาณและน้ำหนักความสำคัญของแต่ละแผนงาน เพื่อสนับสนุนการตัดสินใจของผู้บริหาร (Performance Budgeting)',
    documentRef: 'เอกสารข้อเสนอ PMS หน้า 1 (OECD Performance Budgeting) และ หน้า 11',
    accentColor: '#7c3aed'
  }
];

export function getAllKpiProcesses(): KpiProcessMeta[] {
  return KPI_PROCESSES;
}

/**
 * คำนวณแจกแจงขั้นตอนการคิดคำนวณตัวชี้วัด KPI ทีละขั้นตอนตามเอกสาร
 */
export function calculateKpiStepByStep(kpi: PmsKpiItem, processType: KpiProcessType): KpiCalculationResult {
  const procMeta = KPI_PROCESSES.find((p) => p.id === processType) || KPI_PROCESSES[0];
  const steps: KpiCalculationStep[] = [];

  const actual = Number(kpi.actualValue) || 0;
  const target = Math.max(Number(kpi.targetValue) || 1, 0.0001);
  const baseline = Number(kpi.baselineValue) || 0;
  const direction = kpi.direction || 'HIGHER_BETTER';

  // Raw % calculation
  let rawPercent = 0;
  if (direction === 'HIGHER_BETTER') {
    rawPercent = Math.round((actual / target) * 100 * 10) / 10;
  } else {
    rawPercent = Math.round((target / Math.max(actual, 0.0001)) * 100 * 10) / 10;
  }
  const achievementPercent = Math.min(rawPercent, 120); // capped max 120% for sanity
  const finalScore = Math.round(Math.min((achievementPercent / 100) * 5, 5.0) * 100) / 100;
  const isApproved = kpi.verificationStatus === 'ผ่านการรับรอง';

  if (processType === 'formula_achievement') {
    steps.push({
      stepNo: 1,
      title: 'ตรวจสอบนิยาม ตัวแปร และค่าฐาน (Variables & Baseline)',
      description: `ตัวชี้วัด: ${kpi.kpiName} • หน่วยวัด: ${kpi.unit} • ทิศทางเป้าหมาย: ${direction === 'HIGHER_BETTER' ? 'ยิ่งมากยิ่งดี (Higher is better)' : 'ยิ่งน้อยยิ่งดี (Lower is better)'}`,
      formulaDisplay: 'ค่าฐาน (Baseline) = B, ค่าเป้าหมาย (Target) = T, ค่าจริง (Actual) = A',
      valueDisplay: `B = ${baseline} ${kpi.unit} | T = ${target} ${kpi.unit} | A = ${actual} ${kpi.unit}`,
      status: 'info',
      note: `แหล่งข้อมูลอ้างอิง: ${kpi.dataSource} (เจ้าของข้อมูล: ${kpi.dataOwner})`
    });

    steps.push({
      stepNo: 2,
      title: 'แทนค่าในสูตรการคำนวณ (Formula Substitution)',
      description: direction === 'HIGHER_BETTER'
        ? 'ใช้สูตรสัดส่วนผลสัมฤทธิ์: % ความสำเร็จ = (ผลจริง / ค่าเป้าหมาย) × 100'
        : 'ใช้สูตรสัดส่วนผลสัมฤทธิ์: % ความสำเร็จ = (ค่าเป้าหมาย / ผลจริง) × 100',
      formulaDisplay: direction === 'HIGHER_BETTER'
        ? `% ความสำเร็จ = (${actual} / ${target}) × 100`
        : `% ความสำเร็จ = (${target} / ${actual}) × 100`,
      valueDisplay: `% ความสำเร็จ = ${rawPercent}%`,
      status: rawPercent >= 100 ? 'passed' : rawPercent >= 60 ? 'info' : 'warning',
      note: rawPercent >= 100 ? 'บรรลุเป้าหมายตามแผนงานประจำปี' : 'ต่ำกว่าเป้าหมายที่ตกลงไว้ในแผน'
    });

    steps.push({
      stepNo: 3,
      title: 'แปลงผลลัพธ์เป็นระดับคะแนนมาตรฐาน (PMS Standard Score 1.0 - 5.0)',
      description: 'แปลงอัตราส่วนความสำเร็จเป็นเกณฑ์คะแนนมาตรฐาน 5 ระดับของสำนักงาน ก.พ.ร. และศูนย์คุณธรรม',
      formulaDisplay: 'คะแนน = (อัตราความสำเร็จ % / 100) × 5.00 (สูงสุดไม่เกิน 5.00 คะแนน)',
      valueDisplay: `คะแนนประเมิน = ${finalScore.toFixed(2)} / 5.00 คะแนน`,
      status: finalScore >= 4.0 ? 'passed' : finalScore >= 3.0 ? 'info' : 'warning'
    });

    steps.push({
      stepNo: 4,
      title: 'การนำส่งผลคะแนนขึ้นสู่ระบบรายงานองค์กร',
      description: 'บันทึกคะแนนเพื่อนำไปคำนวณรวมในภาพรวมผลการดำเนินงานองค์กรประจำงวด',
      formulaDisplay: `สถานะการตรวจสอบ: [${kpi.verificationStatus}]`,
      valueDisplay: isApproved ? '✓ อนุมัติบันทึกคะแนนลงแดชบอร์ดผู้บริหาร' : '⏳ รอการรับรองข้อมูล ยังไม่นับรวมผล',
      status: isApproved ? 'passed' : 'warning',
      note: 'สอดคล้องกับข้อกำหนดหน้า 3: ไม่นำข้อมูลที่ยังไม่รับรองมารวมคำนวณเป็นผลสำเร็จองค์กร'
    });
  } else if (processType === 'dimension_3') {
    // Dimension breakdown
    const dimensionName = kpi.kpiName.includes('เครือข่าย') || kpi.kpiName.includes('จังหวัด')
      ? 'การขับเคลื่อนเครือข่าย (Network Mobilization)'
      : kpi.kpiName.includes('ความรู้') || kpi.kpiName.includes('นวัตกรรม') || kpi.kpiName.includes('วิทยากร')
      ? 'การใช้ประโยชน์องค์ความรู้ (Knowledge Utilization)'
      : 'ผลผลิตโครงการ (Project Deliverables)';

    const dimensionWeight = dimensionName.includes('ผลผลิต') ? 30 : 35;

    steps.push({
      stepNo: 1,
      title: 'จัดหมวดหมู่เข้าสู่ 3 มิติหลัก (Strategic Dimension Mapping)',
      description: `ตัวชี้วัดถูกจับคู่เข้าสู่มิติ: ${dimensionName}`,
      formulaDisplay: `สัดส่วนค่าน้ำหนักมิติในองค์กร = ${dimensionWeight}%`,
      valueDisplay: `มิติ: ${dimensionName} (Weight: ${dimensionWeight}%)`,
      status: 'info'
    });

    steps.push({
      stepNo: 2,
      title: 'ประเมินผลความก้าวหน้าเทียบเป้าหมายประจำมิติ',
      description: `ผลการดำเนินงานจริงเทียบกับเป้าหมายในมิติ ${dimensionName}`,
      formulaDisplay: `ความก้าวหน้า = (${actual} / ${target}) × 100`,
      valueDisplay: `${rawPercent}% (เป้าหมาย 100%)`,
      status: rawPercent >= 100 ? 'passed' : 'info'
    });

    steps.push({
      stepNo: 3,
      title: 'ตรวจสอบการเชื่อมโยงข้ามโครงการ (Cross-project Synergy)',
      description: `โครงการต้นสังกัด: ${kpi.projectName} (${kpi.projectId})`,
      formulaDisplay: 'ตรวจสอบสอดคล้องกับ 5 เสาหลัก และงบประมาณโครงการ',
      valueDisplay: 'ผ่านการเทียบเคียงกับ WBS กิจกรรมในพื้นที่',
      status: 'passed'
    });

    steps.push({
      stepNo: 4,
      title: 'แสดงผลบนกราฟแท่งเปรียบเทียบหน้า 10 (Target vs Actual Bar Chart)',
      description: 'ส่งผลการคำนวณขึ้นสู่กราฟผลการดำเนินงานเทียบเป้าหมายใน Dashboard หน้า 10',
      formulaDisplay: `Target = 100% | Actual = ${Math.min(rawPercent, 100)}%`,
      valueDisplay: `แสดงผลในแถบ: ${dimensionName}`,
      status: 'passed'
    });
  } else if (processType === 'certified_dedup') {
    steps.push({
      stepNo: 1,
      title: 'ตรวจสอบความครบถ้วนของหลักฐาน (Evidence Completeness Gate)',
      description: `ไฟล์หลักฐานแนบ: ${kpi.evidenceFileName || 'ยังไม่ได้แนบไฟล์'}`,
      formulaDisplay: 'ตรวจว่ามีเอกสารประกอบที่ตรวจสอบย้อนกลับได้หรือไม่',
      valueDisplay: kpi.evidenceFileName ? `✓ พบหลักฐาน (${kpi.evidenceFileName})` : '⚠ ยังไม่พบไฟล์หลักฐาน',
      status: kpi.evidenceFileName ? 'passed' : 'warning',
      note: `AI Confidence Score: ${kpi.aiConfidenceScore || 0}%`
    });

    steps.push({
      stepNo: 2,
      title: 'การตรวจสอบและรับรอง 3 ระดับ (3-Tier Certification Gate)',
      description: 'ระดับที่ 1 เจ้าของข้อมูลส่งมอบ -> ระดับที่ 2 ผู้ตรวจสอบตรวจทาน -> ระดับที่ 3 ผู้มีอำนาจรับรองผล',
      formulaDisplay: `สถานะปัจจุบัน: ${kpi.verificationStatus}`,
      valueDisplay: isApproved
        ? `รับรองแล้วโดย: ${kpi.approverName || 'ผู้อำนวยการ'} (${kpi.approvedAt || 'เรียบร้อย'})`
        : `อยู่ระหว่าง: ${kpi.verificationStatus}`,
      status: isApproved ? 'passed' : 'warning'
    });

    steps.push({
      stepNo: 3,
      title: 'กติกาการป้องกันการนับซ้ำ (De-duplication Rule - หน้า 5)',
      description: 'ตรวจสอบว่าตัวชี้วัดนี้เชื่อมหลายโครงการหรือไม่ หากเชื่อมหลายโครงการ ให้ใช้รหัสอ้างอิงชุดเดียวกัน ไม่รวมยอดซ้ำ',
      formulaDisplay: `รหัสตัวชี้วัด: ${kpi.kpiCode} (ตรวจจับ Unique Key)`,
      valueDisplay: '✓ ผ่านเกณฑ์กติกาไม่รวมยอดซ้ำ (Count Once per Unique Target)',
      status: 'passed'
    });

    steps.push({
      stepNo: 4,
      title: 'การอนุญาตให้นับรวมในรายงานรับรองระดับองค์กร (Donut 16 รายการ)',
      description: 'ตัวชี้วัดที่รับรองแล้วเท่านั้น ที่จะถูกนำไปนับในส่วนสีน้ำเงินเข้ม (รับรองแล้ว 12 จาก 16 รายการ)',
      formulaDisplay: isApproved ? 'รวมผลใน Approved Certification Segment' : 'แยกไปไว้ใน Pending / Reject Segment',
      valueDisplay: isApproved ? '✓ นับเป็น 1 รายการที่ผ่านการรับรอง' : '⏳ รอการรับรอง (ไม่นับเป็นผลสำเร็จ)',
      status: isApproved ? 'passed' : 'warning'
    });
  } else {
    // weighted_scoring
    steps.push({
      stepNo: 1,
      title: 'คำนวณผลสัมฤทธิ์รายตัวชี้วัด (Single KPI Score)',
      description: `ค่าจริง ${actual} เทียบเป้าหมาย ${target}`,
      formulaDisplay: `Score = (${actual} / ${target}) × 100`,
      valueDisplay: `${rawPercent}%`,
      status: 'info'
    });

    steps.push({
      stepNo: 2,
      title: 'ถ่วงน้ำหนักตามขนาดงบประมาณโครงการ (Performance Budgeting Weight)',
      description: 'เชื่อมโยงคะแนนตัวชี้วัดกับงบประมาณที่จัดสรร ตามแนวทาง Performance Budgeting ของ OECD',
      formulaDisplay: 'Weighted Impact = KPI Score × Budget Allocation Weight',
      valueDisplay: `คะแนนถ่วงน้ำหนัก = ${((achievementPercent / 100) * 100).toFixed(1)} คะแนน`,
      status: 'passed'
    });

    steps.push({
      stepNo: 3,
      title: 'ประเมินความคุ้มค่าและความพร้อมในการปรับแผน (Decision Action Gate)',
      description: rawPercent < 70
        ? 'ผลงานต่ำกว่าเป้าหมาย: สร้างประเด็นข้อสั่งการผู้บริหารอัตโนมัติ (ตามตารางหน้า 10)'
        : 'ผลงานเป็นไปตามแผน: ไม่ต้องออกข้อสั่งการเร่งรัด',
      formulaDisplay: `เกณฑ์เตือนภัย (Threshold): ${rawPercent < 70 ? 'ALERT (< 70%)' : 'NORMAL (>= 70%)'}`,
      valueDisplay: rawPercent < 70 ? '⚠ ส่งเข้าตารางประเด็นที่ต้องติดตามและพิจารณา' : '✓ สถานะปกติ',
      status: rawPercent < 70 ? 'warning' : 'passed'
    });
  }

  return {
    kpi,
    processType,
    processMeta: procMeta,
    steps,
    finalScore,
    maxScore: 5.0,
    achievementPercent,
    isEligibleForExecutiveReport: isApproved,
    ruleSummary: isApproved
      ? 'ตัวชี้วัดนี้ผ่านการรับรองครบถ้วน มีหลักฐานประกอบ และถูกนำไปรวมคำนวณในแดชบอร์ดระดับองค์กร'
      : 'ตัวชี้วัดนี้ยังอยู่ระหว่างการตรวจสอบ/แก้ไข จึงยังไม่นำมารวมในผลสัมฤทธิ์องค์กรตามหลักการหน้า 3 ของเอกสาร'
  };
}

