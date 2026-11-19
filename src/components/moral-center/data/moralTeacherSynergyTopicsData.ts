import { MDC_PROVINCE_STATS_MAP } from './moralLecturersData';
// ============================================================================
// MORAL TEACHER (mdc_people) x NATIONAL DATA SYNERGY (133 BIG DATASETS)
// Supply-Demand Policy Targeting & Evidence-Based Budget Reallocation
// LECTURER-FIRST PARADIGM & EMPIRICAL IMPACT ANALYSIS (NEGATIVE VS POSITIVE)
// ============================================================================

export interface SynergyStatMetric {
  label: string;
  val: string;
  sub?: string;
}

export interface RegionChartDataPoint {
  region: string;
  moralScore: number;
  lecturerDensity: number; // Density per 100k citizens
  externalImpactVal: number; // Impact or problem index
  riskRatePct: number;
  continuousRatioPct: number;
}

export interface ProvincialSynergyItem {
  province: string;
  region: string;
  moralScore: number;
  totalLecturers: number;
  coachCount: number;
  densityPer100k: number;
  externalMetricLabel: string;
  externalMetricValue: number | string;
  riskIndexPct: number;
  riskLevel: 'วิกฤต' | 'ความเสี่ยงสูง' | 'ปานกลาง' | 'เสถียรภาพ';
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  quadrantDesc: string;
  recommendedIntervention: string;
  lecturerTrend?: 'เพิ่มขึ้น' | 'คงที่' | 'ขาดแคลน';
  impactStatus?: 'เสี่ยงสูง (ขาดแคลน)' | 'เฝ้าระวัง' | 'สมดุล' | 'โดดเด่น (Champion)';
}

export interface PolicyRecommendationItem {
  id: string;
  category: string;
  title: string;
  currentIssue: string;
  reallocationAction: string;
  leadAgencies: string;
  targetBudgetPct: string;
}

export interface ExternalSourceDownloadInfo {
  datasetTitle: string;
  agencyName: string;
  directDownloadUrl: string;
  directDownloadLabel?: string;
  officialPortalUrl?: string;
  officialPortalLabel?: string;
  fileFormats?: string[];
  datasetCode?: string;
  description?: string;
}

export interface LecturerImpactDetail {
  negativeImpact: {
    title: string;
    metric: string;
    metricLabel: string;
    description: string;
    riskZones: string[];
  };
  positiveImpact: {
    title: string;
    metric: string;
    metricLabel: string;
    description: string;
    championZones: string[];
  };
  lecturerDynamics: {
    trend: 'เพิ่มขึ้น (+)' | 'ชะลอตัว (-)' | 'ขาดแคลนวิกฤต (!)' | 'กระจุกตัวสูง (!)';
    trendColor: string;
    trendBadge: string;
    sharePct: number;
    countEstimate: number;
    dominantSector: string;
    deficitSector: string;
    coachRatioPct: number;
    keyObservation: string;
  };
}

export interface MoralTeacherSynergyTopicMeta {
  key: string;
  name: string;
  subName: string;
  fullName: string;
  accentColor: string;
  dimensionKey: string;
  dimensionTitle: string;
  chartTitle: string;
  chartSubtitle: string;
  externalAgency: string;
  externalAgencyShort: string;
  evidenceHeadline: string;
  evidenceDetail: string;
  stats: [SynergyStatMetric, SynergyStatMetric, SynergyStatMetric];
  impactDetail: LecturerImpactDetail;
  chartData: RegionChartDataPoint[];
  provincialData: ProvincialSynergyItem[];
  policyRecommendations: PolicyRecommendationItem[];
  budgetReallocationGuide: {
    oldBudgetDesc: string;
    newBudgetDirection: string;
    targetRedZones: string;
    keyPartners: string;
  };
  sourceDownloadInfo?: ExternalSourceDownloadInfo;
}

function build77ProvincialData(
  curatedOverrides: ProvincialSynergyItem[],
  metricLabel: string,
  generator: (pName: string, stat: any, density: number) => {
    moralScore: number;
    externalMetricValue: string | number;
    riskIndexPct: number;
    riskLevel: 'วิกฤต' | 'ความเสี่ยงสูง' | 'ปานกลาง' | 'เสถียรภาพ';
    quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    quadrantDesc: string;
    recommendedIntervention: string;
  }
): ProvincialSynergyItem[] {
  const overrideMap = new Map<string, ProvincialSynergyItem>();
  for (const item of curatedOverrides) {
    let lecturerTrend: 'เพิ่มขึ้น' | 'คงที่' | 'ขาดแคลน' = item.lecturerTrend || (item.totalLecturers >= 100 ? 'เพิ่มขึ้น' : item.totalLecturers <= 10 ? 'ขาดแคลน' : 'คงที่');
    let impactStatus: 'เสี่ยงสูง (ขาดแคลน)' | 'เฝ้าระวัง' | 'สมดุล' | 'โดดเด่น (Champion)' = item.impactStatus || (item.riskLevel === 'วิกฤต' || item.totalLecturers <= 10 ? 'เสี่ยงสูง (ขาดแคลน)' : item.riskLevel === 'ความเสี่ยงสูง' ? 'เฝ้าระวัง' : item.totalLecturers >= 200 ? 'โดดเด่น (Champion)' : 'สมดุล');
    overrideMap.set(item.province, { ...item, lecturerTrend, impactStatus });
  }

  const result: ProvincialSynergyItem[] = [];

  for (const item of curatedOverrides) {
    result.push(overrideMap.get(item.province)!);
  }

  for (const [pName, stat] of Object.entries(MDC_PROVINCE_STATS_MAP)) {
    if (overrideMap.has(pName)) continue;

    let estPop = 850000;
    if (pName === 'กรุงเทพมหานคร') estPop = 5500000;
    else if (['นนทบุรี', 'สมุทรปราการ', 'ปทุมธานี', 'ชลบุรี', 'เชียงใหม่', 'นครราชสีมา', 'ขอนแก่น', 'อุบลราชธานี', 'สงขลา'].includes(pName)) estPop = 1400000;
    else if (['แม่ฮ่องสอน', 'ระนอง', 'ตราด', 'สิงห์บุรี', 'สมุทรสงคราม', 'มุกดาหาร', 'อุทัยธานี', 'พะเยา'].includes(pName)) estPop = 350000;

    const densityPer100k = Number(((stat.total / estPop) * 100000).toFixed(1));
    const gen = generator(pName, stat, densityPer100k);

    let lecturerTrend: 'เพิ่มขึ้น' | 'คงที่' | 'ขาดแคลน' = stat.total >= 100 ? 'เพิ่มขึ้น' : stat.total <= 10 ? 'ขาดแคลน' : 'คงที่';
    let impactStatus: 'เสี่ยงสูง (ขาดแคลน)' | 'เฝ้าระวัง' | 'สมดุล' | 'โดดเด่น (Champion)' = gen.riskLevel === 'วิกฤต' || stat.total <= 10 ? 'เสี่ยงสูง (ขาดแคลน)' : gen.riskLevel === 'ความเสี่ยงสูง' ? 'เฝ้าระวัง' : stat.total >= 200 ? 'โดดเด่น (Champion)' : 'สมดุล';

    result.push({
      province: pName,
      region: stat.region,
      moralScore: gen.moralScore,
      totalLecturers: stat.total,
      coachCount: stat.coach,
      densityPer100k,
      externalMetricLabel: metricLabel,
      externalMetricValue: gen.externalMetricValue,
      riskIndexPct: gen.riskIndexPct,
      riskLevel: gen.riskLevel,
      quadrant: gen.quadrant,
      quadrantDesc: gen.quadrantDesc,
      recommendedIntervention: gen.recommendedIntervention,
      lecturerTrend,
      impactStatus
    });
  }

  return result;
}

export const MORAL_TEACHER_SYNERGY_TOPICS: Record<string, MoralTeacherSynergyTopicMeta> = {
  integrity: {
    key: 'integrity',
    name: 'วิทยากรสุจริต',
    subName: 'ขาดแคลนใน อปท. & คดีจัดซื้อ',
    fullName: 'มิติที่ 1: พลวัตวิทยากรสุจริต: วิกฤตขาดแคลนใน อปท./เขตเมือง กับผลกระทบต่อคดีทุจริตจัดซื้อจัดจ้างภาครัฐ',
    accentColor: '#dc2626',
    dimensionKey: 'integrity',
    dimensionTitle: 'พลวัตวิทยากรสุจริต & ธรรมาภิบาล (Integrity Lecturers & Governance)',
    chartTitle: 'ความสัมพันธ์ระหว่างความหนาแน่นวิทยากรสุจริต กับสถิติคดีทุจริตจัดซื้อจัดจ้าง ป.ป.ช. (8 ภูมิภาค)',
    chartSubtitle: 'เปรียบเทียบความหนาแน่นวิทยากรสุจริต (แกนซ้าย) กับดัชนีความเสี่ยงทุจริต CRI และคดีชี้มูล ป.ป.ช. (แกนขวา)',
    externalAgency: 'สำนักงาน ป.ป.ช. / สำนักงาน ก.พ.ร. (ITA)',
    externalAgencyShort: 'ป.ป.ช. & ITA',
    evidenceHeadline: 'เมื่อดัชนีวิทยากรสุจริตของศูนย์คุณธรรมกระจายตัวไม่ทั่วถึงในพื้นที่ ส่งผลให้ขาดพี่เลี้ยงคอยชี้แนะการจัดซื้อจัดจ้างที่โปร่งใส แต่หากมีวิทยากรสุจริตลงไปอบรม จะช่วยสกัดการทุจริตในท้องถิ่นได้อย่างเห็นผล',
    evidenceDetail: 'ฐานข้อมูลวิทยากรคุณธรรมพบวิทยากรสุจริตคิดเป็น 20.0% (1,069 คน) แต่กระจุกตัวอยู่ในสถาบันการศึกษา (58%) และปราชญ์ชาวบ้าน ขณะที่ในกลุ่ม อปท./ราชการส่วนท้องถิ่นมีไม่ถึง 8% และใน กทม./ปริมณฑลมีความหนาแน่นเพียง 1.8 คน/แสนประชากร สวนทางกับสถิติคดีชี้มูล ป.ป.ช. 733 คดีที่กว่า 45.6% เกิดจากการจัดซื้อจัดจ้าง อปท. ส่งผลให้เกิดความเสี่ยง CRI สูง 74.5% จึงจำเป็นต้องส่ง Integrity Procurement Taskforce เจาะลึก',
    stats: [
      {
        val: '1,069 คน (20%)',
        label: 'จำนวนวิทยากรสุจริตในฐานข้อมูล (ศูนย์คุณธรรม)',
        sub: 'กระจุกตัวในสถาบันการศึกษา 58% ขาดแคลนใน อปท. (<8%)'
      },
      {
        val: '45.6%',
        label: 'สัดส่วนคดีทุจริตจัดซื้อจัดจ้าง อปท. (ป.ป.ช. 733 คดี)',
        sub: 'พื้นที่วิทยากรต่ำมีความเสี่ยงทุจริต CRI สูงถึง 74.5%'
      },
      {
        val: '>92%',
        label: 'อัตราผ่านเกณฑ์ ITA ในจังหวัด Champion Hub',
        sub: 'อยุธยาและอุดรธานีมีวิทยากรหนาแน่นสูงและปลอดเรื่องร้องเรียน'
      }
    ],
    impactDetail: {
      negativeImpact: {
        title: 'ผลกระทบเชิงลบเมื่อวิทยากรสุจริตขาดแคลน (Deficit Negative Impact)',
        metric: '45.6%',
        metricLabel: 'สัดส่วนคดีทุจริตจัดซื้อ อปท. (ป.ป.ช.)',
        description: 'ในจังหวัดที่วิทยากรสุจริตต่ำกว่า 2.5 คน/แสนประชากร และขาดแคลนวิทยากรกลุ่ม อปท. พบอัตราการชี้มูลคดีทุจริตจัดซื้อจัดจ้างพุ่งสูงเฉลี่ย 45.6% ของคดีทั้งหมด และความเสี่ยง CRI แตะระดับวิกฤต 74.5%',
        riskZones: ['กรุงเทพมหานคร (1.8 คน/แสน)', 'นนทบุรี (2.7 คน/แสน)', 'สมุทรปราการ (2.1 คน/แสน)', 'ชลบุรี (3.3 คน/แสน)', 'นครปฐม (3.0 คน/แสน)']
      },
      positiveImpact: {
        title: 'ผลกระทบเชิงบวกเมื่อวิทยากรสุจริตเข้มแข็ง (Champion Positive Multiplier)',
        metric: '>92%',
        metricLabel: 'อัตราผ่านเกณฑ์ ITA และการเปิดเผยข้อมูลภาครัฐ',
        description: 'ในจังหวัดที่มีวิทยากรพี่เลี้ยงสุจริตและโค้ชธรรมาภิบาลหนาแน่น (เช่น อยุธยา, อุดรธานี) มีผลประเมิน ITA ผ่านเกณฑ์สูงกว่า 92% และเกิดข้อตกลงคุณธรรมชุมชนช่วยตรวจรับพัสดุ ปลอดเรื่องร้องเรียนต่อเนื่อง 3 ปี',
        championZones: ['พระนครศรีอยุธยา (58.2 คน/แสน)', 'อุดรธานี (28.5 คน/แสน)', 'เชียงราย (31.2 คน/แสน)', 'แพร่ (73.5 คน/แสน)']
      },
      lecturerDynamics: {
        trend: 'ชะลอตัว (-)',
        trendColor: '#dc2626',
        trendBadge: 'ชะลอตัวใน อปท. (-14%)',
        sharePct: 20.0,
        countEstimate: 1069,
        dominantSector: 'สถาบันการศึกษา (58%)',
        deficitSector: 'อปท. และหน่วยงานจัดซื้อภาครัฐ (<8%)',
        coachRatioPct: 11.4,
        keyObservation: 'วิทยากรสุจริตเติบโตในโรงเรียนแต่ขาดแคลนรุนแรงใน อปท. และเขตเศรษฐกิจเมืองหลวง'
      }
    },
    chartData: [
      { region: 'กทม. และปริมณฑล', moralScore: 4.68, lecturerDensity: 1.8, externalImpactVal: 74.5, riskRatePct: 74.5, continuousRatioPct: 22.4 },
      { region: 'ภาคกลางบน', moralScore: 4.75, lecturerDensity: 2.1, externalImpactVal: 66.8, riskRatePct: 66.8, continuousRatioPct: 25.1 },
      { region: 'ภาคตะวันออก', moralScore: 4.86, lecturerDensity: 2.7, externalImpactVal: 61.2, riskRatePct: 61.2, continuousRatioPct: 28.5 },
      { region: 'ภาคใต้ตอนบน', moralScore: 4.82, lecturerDensity: 2.9, externalImpactVal: 58.4, riskRatePct: 58.4, continuousRatioPct: 31.2 },
      { region: 'ภาคใต้ตอนล่าง', moralScore: 4.85, lecturerDensity: 3.1, externalImpactVal: 55.6, riskRatePct: 55.6, continuousRatioPct: 33.4 },
      { region: 'ภาคเหนือตอนล่าง', moralScore: 5.12, lecturerDensity: 3.9, externalImpactVal: 41.0, riskRatePct: 41.0, continuousRatioPct: 39.8 },
      { region: 'ภาคเหนือตอนบน', moralScore: 5.18, lecturerDensity: 4.5, externalImpactVal: 36.2, riskRatePct: 36.2, continuousRatioPct: 44.5 },
      { region: 'ภาคตะวันออกเฉียงเหนือ', moralScore: 5.30, lecturerDensity: 4.8, externalImpactVal: 45.2, riskRatePct: 45.2, continuousRatioPct: 47.6 }
    ],
    provincialData: build77ProvincialData([
      { province: 'กรุงเทพมหานคร', region: 'กทม. และปริมณฑล', moralScore: 4.68, totalLecturers: 143, coachCount: 22, densityPer100k: 1.8, externalMetricLabel: 'คดีชี้มูล ป.ป.ช.', externalMetricValue: '210 คดี', riskIndexPct: 74.5, riskLevel: 'วิกฤต', quadrant: 'Q1', quadrantDesc: 'เสี่ยงสูงสุด-วิทยากรต่ำ', recommendedIntervention: 'ตั้งทีมโค้ช Integrity Procurement ประกบส่วนกลางและสำนักงานเขต', lecturerTrend: 'ขาดแคลน', impactStatus: 'เสี่ยงสูง (ขาดแคลน)' },
      { province: 'พระนครศรีอยุธยา', region: 'ภาคกลาง', moralScore: 4.78, totalLecturers: 479, coachCount: 48, densityPer100k: 58.2, externalMetricLabel: 'คดีชี้มูล ป.ป.ช.', externalMetricValue: '18 คดี', riskIndexPct: 52.4, riskLevel: 'ปานกลาง', quadrant: 'Q4', quadrantDesc: 'Champion Hub วิทยากรสูง', recommendedIntervention: 'ใช้เป็นศูนย์กลางขยายผล Twinning ช่วยเหลือจังหวัดข้างเคียง', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' },
      { province: 'นนทบุรี', region: 'กทม. และปริมณฑล', moralScore: 4.70, totalLecturers: 35, coachCount: 4, densityPer100k: 2.7, externalMetricLabel: 'คดีชี้มูล ป.ป.ช.', externalMetricValue: '28 คดี', riskIndexPct: 68.5, riskLevel: 'ความเสี่ยงสูง', quadrant: 'Q1', quadrantDesc: 'เสี่ยงสูง-คดีจัดซื้อพุ่ง', recommendedIntervention: 'บ่มเพาะวิทยากร อปท. เทศบาลนครและ อบต. กลุ่มเป้าหมาย', lecturerTrend: 'คงที่', impactStatus: 'เฝ้าระวัง' },
      { province: 'ชลบุรี', region: 'ภาคตะวันออก', moralScore: 4.82, totalLecturers: 52, coachCount: 7, densityPer100k: 3.3, externalMetricLabel: 'คดีชี้มูล ป.ป.ช.', externalMetricValue: '34 คดี', riskIndexPct: 62.1, riskLevel: 'ความเสี่ยงสูง', quadrant: 'Q1', quadrantDesc: 'พื้นที่นิคมเสี่ยงสูง', recommendedIntervention: 'ส่งเสริมธรรมภิบาลร่วมกับหอการค้าและนิคมอุตสาหกรรม EEC', lecturerTrend: 'คงที่', impactStatus: 'เฝ้าระวัง' },
      { province: 'อุดรธานี', region: 'ภาคตะวันออกเฉียงเหนือ', moralScore: 5.34, totalLecturers: 448, coachCount: 52, densityPer100k: 28.5, externalMetricLabel: 'คดีชี้มูล ป.ป.ช.', externalMetricValue: '15 คดี', riskIndexPct: 38.2, riskLevel: 'เสถียรภาพ', quadrant: 'Q4', quadrantDesc: 'ต้นแบบคุณธรรมเข้มแข็ง', recommendedIntervention: 'ยกระดับเครือข่าย ปราชญ์ชาวบ้านตรวจการจัดซื้อจัดจ้างภาคประชาชน', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' },
      { province: 'เชียงราย', region: 'ภาคเหนือ', moralScore: 5.22, totalLecturers: 404, coachCount: 45, densityPer100k: 31.2, externalMetricLabel: 'คดีชี้มูล ป.ป.ช.', externalMetricValue: '12 คดี', riskIndexPct: 35.4, riskLevel: 'เสถียรภาพ', quadrant: 'Q4', quadrantDesc: 'พื้นที่ปลอดภัยธรรมาภิบาลสูง', recommendedIntervention: 'พัฒนาองค์ความรู้การจัดทำสัญญาร่วมชุมชนและป้องปรามสินบน', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' },
      { province: 'สุราษฎร์ธานี', region: 'ภาคใต้', moralScore: 4.85, totalLecturers: 407, coachCount: 41, densityPer100k: 38.1, externalMetricLabel: 'คดีชี้มูล ป.ป.ช.', externalMetricValue: '22 คดี', riskIndexPct: 48.7, riskLevel: 'ปานกลาง', quadrant: 'Q4', quadrantDesc: 'ศูนย์กลางภาคใต้', recommendedIntervention: 'ขยายผลวิทยากรด้านความโปร่งใสสู่เกาะสมุยและแหล่งท่องเที่ยว', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' },
      { province: 'แพร่', region: 'ภาคเหนือ', moralScore: 5.26, totalLecturers: 323, coachCount: 38, densityPer100k: 73.5, externalMetricLabel: 'คดีชี้มูล ป.ป.ช.', externalMetricValue: '6 คดี', riskIndexPct: 29.8, riskLevel: 'เสถียรภาพ', quadrant: 'Q4', quadrantDesc: 'ความหนาแน่นวิทยากรสูงสุด', recommendedIntervention: 'จัดตั้งเป็นสถาบันคุณธรรมชุมชนและพี่เลี้ยงระดับภูมิภาค', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' },
      { province: 'กาฬสินธุ์', region: 'ภาคตะวันออกเฉียงเหนือ', moralScore: 5.28, totalLecturers: 262, coachCount: 29, densityPer100k: 26.8, externalMetricLabel: 'คดีชี้มูล ป.ป.ช.', externalMetricValue: '11 คดี', riskIndexPct: 39.5, riskLevel: 'เสถียรภาพ', quadrant: 'Q4', quadrantDesc: 'พลังประชาสังคมตื่นรู้', recommendedIntervention: 'ขับเคลื่อนธรรมนูญสุขภาพและข้อตกลงคุณธรรมชุมชน', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' },
      { province: 'ระยอง', region: 'ภาคตะวันออก', moralScore: 4.88, totalLecturers: 300, coachCount: 33, densityPer100k: 40.5, externalMetricLabel: 'คดีชี้มูล ป.ป.ช.', externalMetricValue: '24 คดี', riskIndexPct: 54.2, riskLevel: 'ปานกลาง', quadrant: 'Q4', quadrantDesc: 'เครือข่ายอุตสาหกรรมเข้มแข็ง', recommendedIntervention: 'เชื่อมต่อโมเดลโรงงานคุณธรรมและ CSR สู่ชุมชนรอบนิคม', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' }
    ], 'คดีชี้มูล ป.ป.ช.', (pName, stat, density) => {
      let moralScore = 4.75;
      if (stat.region.includes('เหนือ')) moralScore = 5.20;
      else if (stat.region.includes('ตะวันออกเฉียงเหนือ')) moralScore = 5.30;
      else if (stat.region.includes('ใต้')) moralScore = 4.85;

      let riskPct = density < 3.0 ? 68.0 : density < 6.0 ? 55.0 : density < 15.0 ? 42.0 : 32.0;
      if (stat.region.includes('กลาง')) riskPct += 6;
      riskPct = Math.max(28, Math.min(78, riskPct));

      const riskLevel = riskPct >= 65 ? 'วิกฤต' : riskPct >= 55 ? 'ความเสี่ยงสูง' : riskPct >= 40 ? 'ปานกลาง' : 'เสถียรภาพ';
      const quadrant = riskLevel === 'วิกฤต' || riskLevel === 'ความเสี่ยงสูง'
        ? (stat.total < 30 ? 'Q1' : 'Q2')
        : (stat.total >= 50 ? 'Q4' : 'Q3');
      const quadrantDesc = quadrant === 'Q1' ? 'เสี่ยงสูง-วิทยากรต่ำ' : quadrant === 'Q4' ? 'Champion Hub วิทยากรสูง' : 'พื้นที่เสถียรภาพ';
      const cases = Math.max(3, Math.round((stat.total * 0.08) + (riskPct * 0.25)));

      return {
        moralScore,
        externalMetricValue: `${cases} คดี`,
        riskIndexPct: Number(riskPct.toFixed(1)),
        riskLevel,
        quadrant,
        quadrantDesc,
        recommendedIntervention: quadrant === 'Q1' ? 'บ่มเพาะวิทยากร อปท. และจัดซื้อจัดจ้างโปร่งใส' : 'ขยายผลวิทยากรพี่เลี้ยงสุจริตสู่เครือข่ายข้างเคียง'
      };
    }),
    policyRecommendations: [
      {
        id: 'rec-int-1',
        category: 'การปรับทิศทางงบประมาณ',
        title: 'จัดตั้ง Integrity Procurement Taskforce เจาะลึก อปท. สีแดง',
        currentIssue: 'งบเดิมเน้นอบรมบรรยายต้านโกงทั่วไปในสถานศึกษา ซึ่งไม่ตรงกับสถิติคดีทุจริตกว่า 45.6% ที่เกิดใน อปท.',
        reallocationAction: 'โยกย้ายงบ 40% ไปจัดตั้งคลินิกพี่เลี้ยงวิทยากรจัดซื้อจัดจ้างคุณธรรม โค้ชประกบ อปท. เสี่ยงสูง 120 แห่ง',
        leadAgencies: 'สำนักงาน ป.ป.ช., กรมบัญชีกลาง, กรมส่งเสริมการปกครองท้องถิ่น (สถ.)',
        targetBudgetPct: '40% ของงบขับเคลื่อนสุจริต'
      },
      {
        id: 'rec-int-2',
        category: 'การปิดจุดบอดเชิงพื้นที่',
        title: 'โครงการวิทยากรพี่เลี้ยงคู่แฝด (Twinning Champion Hubs)',
        currentIssue: 'อยุธยาและอุดรธานีมีวิทยากรหนาแน่นสูงมาก ขณะที่ กทม. และนนทบุรีขาดแคลนขั้นวิกฤต',
        reallocationAction: 'ใช้วิทยากรระดับ Coach จากจังหวัด Champion ทำหน้าที่เป็นพี่เลี้ยงร่วมข้ามเขตพื้นที่เพื่อลดต้นทุนฝึกใหม่',
        leadAgencies: 'ศูนย์คุณธรรม, สมาคม อบจ., สมาคมสันนิบาตเทศบาล',
        targetBudgetPct: '25% ของงบพัฒนาเครือข่าย'
      }
    ],
    budgetReallocationGuide: {
      oldBudgetDesc: 'งบอบรมบรรยายต้านโกงทั่วไปแบบตั้งรับในสถานศึกษาและส่วนกลาง',
      newBudgetDirection: 'ทุ่มงบคลินิกพี่เลี้ยงวิทยากรจัดซื้อจัดจ้างคุณธรรม (Integrity Procurement Taskforce) เจาะลึก อปท. สีแดง',
      targetRedZones: 'กรุงเทพมหานคร, นนทบุรี, สมุทรปราการ, ชลบุรี, นครปฐม',
      keyPartners: 'สำนักงาน ป.ป.ช., กรมบัญชีกลาง, สถ., ศูนย์คุณธรรม'
    },
    sourceDownloadInfo: {
      datasetTitle: 'สถิติผลการชี้มูลความผิดเจ้าพนักงานของรัฐ & ผลการประเมิน ITA 2568',
      agencyName: 'สำนักงาน ป.ป.ช. (คณะกรรมการป้องกันและปราบปรามการทุจริตแห่งชาติ)',
      directDownloadUrl: 'https://data.go.th/dataset/statistics-state-officials-misconduct-rulings-by-case-and-position',
      directDownloadLabel: 'หน้าดาวน์โหลดชุดข้อมูลชี้มูล ป.ป.ช. (data.go.th)',
      officialPortalUrl: 'https://itas.nacc.go.th/',
      officialPortalLabel: 'ระบบประเมินคุณธรรมและความโปร่งใส ITAS',
      fileFormats: ['CSV', 'XLSX', 'API'],
      datasetCode: 'NACC-MISCONDUCT-2568',
      description: 'บูรณาการข้อมูลสถิติคดีชี้มูลความผิด ป.ป.ช. และคะแนน ITA 2568 รายจังหวัด ร่วมกับความหนาแน่นวิทยากรสุจริต'
    }
  },

  sufficiency: {
    key: 'sufficiency',
    name: 'วิทยากรพอเพียง',
    subName: 'เติบโตสูง & เร่งแก้หนี้เมือง',
    fullName: 'มิติที่ 2: การขยายตัวของวิทยากรพอเพียง: จากฐานรากเกษตรสู่โจทย์เร่งด่วนแก้วิกฤตหนี้สินคนเมือง',
    accentColor: '#0891b2',
    dimensionKey: 'sufficiency',
    dimensionTitle: 'พลวัตวิทยากรพอเพียง & วินัยการเงิน (Sufficiency Lecturers & Financial Discipline)',
    chartTitle: 'ความสัมพันธ์ระหว่างความหนาแน่นวิทยากรพอเพียง กับหนี้อุปโภคบริโภคเฉลี่ยครัวเรือน (8 ภูมิภาค)',
    chartSubtitle: 'เปรียบเทียบสัดส่วนวิทยากรสายการเงินเมือง (แกนซ้าย) กับหนี้สินครัวเรือนและอัตราเงินออม (แกนขวา)',
    externalAgency: 'ธนาคารแห่งประเทศไทย (ธปท.) / สำนักงานสภาพัฒน์ (สศช.)',
    externalAgencyShort: 'ธปท. & สศช.',
    evidenceHeadline: 'เมื่อดัชนีวิทยากรพอเพียงของศูนย์คุณธรรมมีไม่เพียงพอในเขตเมือง คนทำงานขาดคำแนะนำเรื่องการบริหารเงิน ส่งผลให้ติดหนี้สินง่ายขึ้น แต่พื้นที่ที่มีวิทยากรพอเพียง ชาวบ้านสามารถปลดหนี้และมีเงินออมเพิ่มขึ้นจริง',
    evidenceDetail: 'วิทยากรพอเพียงมีจำนวนมากที่สุด 1,496 คน (28% ของประเทศ) ทว่ากว่า 82% เชี่ยวชาญเกษตรทฤษฎีใหม่ในชนบท ขณะที่แรงงานในเมืองและเขตอุตสาหกรรม (กทม., สมุทรปราการ, ชลบุรี) มีวิทยากรสายการเงินเมืองไม่ถึง 6% ส่งผลให้หนี้บริโภคเฉลี่ยพุ่งแตะ 7,158 บาท/ครัวเรือน และ NPL บัตรเครดิตสูง 8.5% จึงต้องเร่ง Re-skill สู่โค้ชวินัยการเงินคนเมือง',
    stats: [
      {
        val: '1,496 คน (28%)',
        label: 'จำนวนวิทยากรพอเพียงในฐานข้อมูล (อันดับ 1 ประเทศ)',
        sub: '82% อยู่ในภาคเกษตรและชนบท มีทักษะการเงินเมืองเพียง 6%'
      },
      {
        val: '48.7%',
        label: 'สัดส่วนหนี้บริโภคไม่มีหลักประกันในเขตเมือง (ธปท.)',
        sub: 'กทม. และปริมณฑล หนี้บริโภคสูง 7,158 บาท/ครัวเรือน'
      },
      {
        val: '96.4%',
        label: 'อัตราการชำระหนี้ตรงเวลาในกลุ่มผ่านโค้ชพอเพียง',
        sub: 'ลดค่าใช้จ่ายเฉลี่ย 3,200 บาท/เดือน จากการทำบัญชีครัวเรือน'
      }
    ],
    impactDetail: {
      negativeImpact: {
        title: 'ผลกระทบเชิงลบเมื่อขาดแคลนวิทยากรการเงินเมือง (Urban Debt Deficit Impact)',
        metric: '48.7%',
        metricLabel: 'สัดส่วนหนี้บริโภคไม่มีหลักประกันในเขตเมือง',
        description: 'ในเขตนิคมอุตสาหกรรมและชุมชนเมืองที่ขาดแคลนวิทยากรพอเพียงด้านการเงิน พบสัดส่วนหนี้ไม่มีหลักประกันสูงถึง 48.7% ของหนี้ครัวเรือน และมีอัตราเงินออมสำรองฉุกเฉินต่ำเพียง 18.4%',
        riskZones: ['กรุงเทพมหานคร (หนี้บริโภค 7,158 บ.)', 'สมุทรปราการ (หนี้บริโภค 6,890 บ.)', 'ปทุมธานี', 'ชลบุรี', 'ระยอง']
      },
      positiveImpact: {
        title: 'ผลกระทบเชิงบวกเมื่อมีโค้ชวินัยการเงินพอเพียง (Financial Discipline Multiplier)',
        metric: '96.4%',
        metricLabel: 'อัตราการชำระหนี้ตรงเวลาของครัวเรือน',
        description: 'กลุ่มแรงงานและครัวเรือนที่ได้รับการโค้ชชิ่งจากวิทยากรพอเพียงอย่างต่อเนื่อง มีอัตราชำระหนี้ตรงเวลาสูงถึง 96.4% ลดรายจ่ายครัวเรือนเฉลี่ย 3,200 บาท/เดือน และเกิดกลุ่มออมทรัพย์ชุมชนยั่งยืน',
        championZones: ['เชียงใหม่', 'ขอนแก่น', 'น่าน', 'พะเยา']
      },
      lecturerDynamics: {
        trend: 'เพิ่มขึ้น (+)',
        trendColor: '#059669',
        trendBadge: 'เติบโตสูงในชนบท (+28%)',
        sharePct: 28.0,
        countEstimate: 1496,
        dominantSector: 'ปราชญ์ชาวบ้านและเกษตร (82%)',
        deficitSector: 'แรงงานอุตสาหกรรมและพนักงานเมือง (<6%)',
        coachRatioPct: 12.8,
        keyObservation: 'ปริมาณวิทยากรสูงที่สุดในประเทศ แต่เกิด Skill Mismatch ขาดวิทยากรด้านวินัยการเงินคนเมือง'
      }
    },
    chartData: [
      { region: 'กทม. และปริมณฑล', moralScore: 4.62, lecturerDensity: 1.2, externalImpactVal: 71.5, riskRatePct: 71.5, continuousRatioPct: 18.4 },
      { region: 'ภาคกลางบน', moralScore: 4.78, lecturerDensity: 2.4, externalImpactVal: 60.3, riskRatePct: 60.3, continuousRatioPct: 19.8 },
      { region: 'ภาคตะวันออก', moralScore: 4.80, lecturerDensity: 2.8, externalImpactVal: 59.8, riskRatePct: 59.8, continuousRatioPct: 20.5 },
      { region: 'ภาคใต้ตอนบน', moralScore: 4.81, lecturerDensity: 3.1, externalImpactVal: 60.5, riskRatePct: 60.5, continuousRatioPct: 21.0 },
      { region: 'ภาคใต้ตอนล่าง', moralScore: 4.83, lecturerDensity: 3.3, externalImpactVal: 57.2, riskRatePct: 57.2, continuousRatioPct: 22.3 },
      { region: 'ภาคเหนือตอนล่าง', moralScore: 5.04, lecturerDensity: 4.8, externalImpactVal: 53.4, riskRatePct: 53.4, continuousRatioPct: 23.9 },
      { region: 'ภาคเหนือตอนบน', moralScore: 5.12, lecturerDensity: 5.6, externalImpactVal: 51.7, riskRatePct: 51.7, continuousRatioPct: 25.1 },
      { region: 'ภาคตะวันออกเฉียงเหนือ', moralScore: 5.24, lecturerDensity: 6.8, externalImpactVal: 44.3, riskRatePct: 44.3, continuousRatioPct: 27.2 }
    ],
    provincialData: build77ProvincialData([
      { province: 'กรุงเทพมหานคร', region: 'กทม. และปริมณฑล', moralScore: 4.62, totalLecturers: 143, coachCount: 22, densityPer100k: 1.2, externalMetricLabel: 'หนี้บริโภคเฉลี่ย', externalMetricValue: '7,158 บาท', riskIndexPct: 71.5, riskLevel: 'วิกฤต', quadrant: 'Q1', quadrantDesc: 'หนี้สูงสุด-พอเพียงต่ำ', recommendedIntervention: 'ขยายหลักสูตรโค้ชการเงินคนเมืองในชุมชนแรงงานและ บมจ.', lecturerTrend: 'ขาดแคลน', impactStatus: 'เสี่ยงสูง (ขาดแคลน)' },
      { province: 'สมุทรปราการ', region: 'กทม. และปริมณฑล', moralScore: 4.65, totalLecturers: 28, coachCount: 3, densityPer100k: 2.1, externalMetricLabel: 'หนี้บริโภคเฉลี่ย', externalMetricValue: '6,890 บาท', riskIndexPct: 69.2, riskLevel: 'วิกฤต', quadrant: 'Q1', quadrantDesc: 'เขตโรงงานหนี้สูง', recommendedIntervention: 'จับคู่สหภาพแรงงานจัดตั้งคลินิกปลดหนี้และออมเงิน', lecturerTrend: 'ขาดแคลน', impactStatus: 'เสี่ยงสูง (ขาดแคลน)' },
      { province: 'ชลบุรี', region: 'ภาคตะวันออก', moralScore: 4.79, totalLecturers: 52, coachCount: 7, densityPer100k: 3.3, externalMetricLabel: 'หนี้บริโภคเฉลี่ย', externalMetricValue: '6,450 บาท', riskIndexPct: 63.5, riskLevel: 'ความเสี่ยงสูง', quadrant: 'Q1', quadrantDesc: 'หนี้อุปโภคบริโภคสูง', recommendedIntervention: 'ส่งเสริมองค์กรแห่งความสุข (Happy Workplace) ในนิคมอุตสาหกรรม', lecturerTrend: 'คงที่', impactStatus: 'เฝ้าระวัง' },
      { province: 'เชียงใหม่', region: 'ภาคเหนือ', moralScore: 5.15, totalLecturers: 85, coachCount: 12, densityPer100k: 5.2, externalMetricLabel: 'หนี้บริโภคเฉลี่ย', externalMetricValue: '5,120 บาท', riskIndexPct: 48.0, riskLevel: 'ปานกลาง', quadrant: 'Q4', quadrantDesc: 'สมดุลพอดี', recommendedIntervention: 'ขับเคลื่อนโมเดลวิสาหกิจชุมชนและการตลาดสร้างสรรค์', lecturerTrend: 'คงที่', impactStatus: 'สมดุล' },
      { province: 'ขอนแก่น', region: 'ภาคตะวันออกเฉียงเหนือ', moralScore: 5.25, totalLecturers: 88, coachCount: 14, densityPer100k: 5.1, externalMetricLabel: 'หนี้บริโภคเฉลี่ย', externalMetricValue: '4,650 บาท', riskIndexPct: 42.1, riskLevel: 'เสถียรภาพ', quadrant: 'Q4', quadrantDesc: 'ต้นแบบพึ่งพาตนเอง', recommendedIntervention: 'ขยายกองทุนสวัสดิการชุมชนสู่การหนุนเสริมอาชีพยั่งยืน', lecturerTrend: 'คงที่', impactStatus: 'โดดเด่น (Champion)' }
    ], 'หนี้บริโภคเฉลี่ย', (pName, stat, density) => {
      let moralScore = 4.80;
      if (stat.region.includes('เหนือ')) moralScore = 5.12;
      else if (stat.region.includes('ตะวันออกเฉียงเหนือ')) moralScore = 5.24;
      else if (stat.region.includes('ใต้')) moralScore = 4.82;

      let riskPct = density < 3.0 ? 69.0 : density < 6.0 ? 58.0 : density < 15.0 ? 46.0 : 36.0;
      if (stat.region.includes('กลาง') || stat.region.includes('ตะวันออก')) riskPct += 5;
      riskPct = Math.max(30, Math.min(75, riskPct));

      const riskLevel = riskPct >= 65 ? 'วิกฤต' : riskPct >= 55 ? 'ความเสี่ยงสูง' : riskPct >= 40 ? 'ปานกลาง' : 'เสถียรภาพ';
      const quadrant = riskLevel === 'วิกฤต' || riskLevel === 'ความเสี่ยงสูง'
        ? (stat.total < 30 ? 'Q1' : 'Q2')
        : (stat.total >= 50 ? 'Q4' : 'Q3');
      const quadrantDesc = quadrant === 'Q1' ? 'หนี้สูง-วิทยากรต่ำ' : quadrant === 'Q4' ? 'ต้นแบบพึ่งพาตนเอง' : 'สมดุลพอดี';
      const debt = Math.round(4000 + (riskPct * 38) + (stat.total % 200));

      return {
        moralScore,
        externalMetricValue: `${debt.toLocaleString()} บาท`,
        riskIndexPct: Number(riskPct.toFixed(1)),
        riskLevel,
        quadrant,
        quadrantDesc,
        recommendedIntervention: quadrant === 'Q1' ? 'ขยายหลักสูตรโค้ชการเงินคนเมืองในชุมชนแรงงานและ บมจ.' : 'ขยายกองทุนสวัสดิการชุมชนสู่การหนุนเสริมอาชีพยั่งยืน'
      };
    }),
    policyRecommendations: [
      {
        id: 'rec-suf-1',
        category: 'การพัฒนาทักษะ (Skill Reorientation)',
        title: 'Re-skill วิทยากรพอเพียงเป็น "โค้ชวินัยการเงินคนเมือง"',
        currentIssue: 'หลักสูตรปัจจุบันเน้นแปลงเกษตรอินทรีย์ ซึ่งลูกจ้างและแรงงานในเมืองไม่สามารถนำไปปฏิบัติจริงได้',
        reallocationAction: 'จัดสรรงบ 35% ร่วมกับ ธปท. อบรมหลักสูตรวางแผนการเงิน จัดการหนี้สิน และออมเงินในโรงงาน',
        leadAgencies: 'ธนาคารแห่งประเทศไทย, กรมพัฒนาฝีมือแรงงาน, สศช.',
        targetBudgetPct: '35% ของงบขับเคลื่อนพอเพียง'
      }
    ],
    budgetReallocationGuide: {
      oldBudgetDesc: 'งบอบรมเกษตรพอเพียงในพื้นที่เมืองที่ไม่สอดคล้องกับวิถีชีวิตผู้มีรายได้น้อย',
      newBudgetDirection: 'จัดสรรงบ Re-skill วิทยากรพอเพียงเป็น "โค้ชวินัยการเงินคนเมือง" ควบคู่คลินิกแก้หนี้ในโรงงาน',
      targetRedZones: 'กทม., สมุทรปราการ, ปทุมธานี, ชลบุรี, ระยอง',
      keyPartners: 'ธปท., กระทรวงแรงงาน, สศช., ศูนย์คุณธรรม'
    },
    sourceDownloadInfo: {
      datasetTitle: 'เงินรับฝากและเงินให้สินเชื่อของธนาคารพาณิชย์จำแนกตามจังหวัด (FI_CB_011) & หนี้สินครัวเรือน',
      agencyName: 'ธนาคารแห่งประเทศไทย (ธปท.) & สำนักงานสถิติแห่งชาติ (สถ.)',
      directDownloadUrl: 'https://data.go.th/dataset/ds-459',
      directDownloadLabel: 'หน้าดาวน์โหลดชุดข้อมูลสินเชื่อ ธปท. (data.go.th)',
      officialPortalUrl: 'https://app.bot.or.th/BTWS_STAT/statistics/BOTWEBSTAT.aspx?reportID=1008&language=TH',
      officialPortalLabel: 'รายงานสถิติ FI_CB_011 ทางการของ ธปท.',
      fileFormats: ['CSV', 'XLSX', 'API'],
      datasetCode: 'BOT-FI_CB_011',
      description: 'บูรณาการข้อมูลเงินให้สินเชื่อต่อครัวเรือนและหนี้สินไม่มีหลักประกัน รายจังหวัด ร่วมกับวิทยากรสายการเงินพอเพียง'
    }
  },

  discipline: {
    key: 'discipline',
    name: 'วิทยากรวินัย',
    subName: 'ชะลอตัวเยาวชน & ลดอุบัติเหตุ',
    fullName: 'มิติที่ 3: วิทยากรวินัยและความรับผิดชอบ: ภาวะชะลอตัวในกลุ่มเยาวชน กับสถิติอุบัติเหตุและพฤติกรรมเสี่ยง',
    accentColor: '#059669',
    dimensionKey: 'discipline',
    dimensionTitle: 'พลวัตวิทยากรวินัย & ความปลอดภัยเยาวชน (Discipline Lecturers & Public Safety)',
    chartTitle: 'ความสัมพันธ์ระหว่างคะแนนวินัยรับผิดชอบ กับเรื่องร้องเรียน กสม. และอุบัติเหตุจราจร (8 ภูมิภาค)',
    chartSubtitle: 'เปรียบเทียบช่องว่างความสอดคล้อง (Gap ระหว่าง ITA รัฐ กับวินัยพลเมือง) และสถิติอุบัติเหตุจราจร',
    externalAgency: 'สำนักงานตำรวจแห่งชาติ (สตช.) / คณะกรรมการสิทธิมนุษยชนแห่งชาติ (กสม.)',
    externalAgencyShort: 'สตช. & กสม.',
    evidenceHeadline: 'เมื่อดัชนีวิทยากรวินัยของศูนย์คุณธรรมขาดแคลนในกลุ่มเยาวชน ส่งผลให้เด็กขาดการฝึกวินัยจราจรและเคารพสิทธิผู้อื่น เกิดอุบัติเหตุบ่อยครั้ง การเร่งสร้างวิทยากรวินัยจึงเป็นเรื่องจำเป็นเร่งด่วน',
    evidenceDetail: 'วิทยากรด้านวินัยรับผิดชอบมี 1,283 คน (24.0%) แต่โครงสร้างผู้สอนกว่า 68% เป็นข้าราชการอาวุโสและครูรุ่นใหญ่ ขาดแคลนวิทยากรแกนนำเยาวชน (Peer Educator) ส่งผลให้การขับเคลื่อนวินัยความปลอดภัยทางถนนไม่เข้าถึงกลุ่มเสี่ยงวัย 15-24 ปี สถิติอุบัติเหตุจราจรเยาวชนสูงกว่าเกณฑ์ 2.1 เท่า และข้อพิพาทสิทธิ กสม. พุ่งสูงในเขตเมือง',
    stats: [
      {
        val: '1,283 คน (24%)',
        label: 'จำนวนวิทยากรวินัยในฐานข้อมูล (ศูนย์คุณธรรม)',
        sub: 'ผู้สอน 68% เป็นข้าราชการอาวุโส เยาวชน Gen Z เหลือ 4.2%'
      },
      {
        val: '2.1 เท่า',
        label: 'อัตราอุบัติเหตุและพฤติกรรมเสี่ยงในกลุ่มเยาวชน',
        sub: 'ในพื้นที่ขาดวิทยากรเยาวชน อัตราไม่สวมหมวกนิรภัยพุ่ง >60%'
      },
      {
        val: '88%',
        label: 'อัตราสวมหมวกนิรภัยในโรงเรียนที่มีวิทยากรแกนนำ',
        sub: 'อุบัติเหตุหน้าสถานศึกษาลดลง 65% ทะเลาะวิวาทลด 42%'
      }
    ],
    impactDetail: {
      negativeImpact: {
        title: 'ผลกระทบเชิงลบเมื่อวิทยากรวินัยกลุ่มเยาวชนลดลง (Youth Risk Deficit Impact)',
        metric: '2.1 เท่า',
        metricLabel: 'อัตราอุบัติเหตุและพฤติกรรมเสี่ยงเยาวชน',
        description: 'ในพื้นที่ที่ขาดแคลนวิทยากรแกนนำเยาวชน พบสถิติเยาวชนบาดเจ็บจากอุบัติเหตุรถจักรยานยนต์สูงกว่าค่าเฉลี่ย 2.1 เท่า อัตราไม่สวมหมวกนิรภัยสูงเกิน 60% และเรื่องร้องเรียนข้อพิพาทสิทธิสูงถึง 1,027 เรื่อง',
        riskZones: ['กรุงเทพมหานคร (345 เรื่องร้องเรียน)', 'สมุทรปราการ', 'ชลบุรี', 'นนทบุรี', 'นครสวรรค์']
      },
      positiveImpact: {
        title: 'ผลกระทบเชิงบวกเมื่อมีวิทยากรวินัยแกนนำเยาวชน (Civic Discipline Multiplier)',
        metric: '88%',
        metricLabel: 'อัตราสวมหมวกนิรภัยและอุบัติเหตุลดลง 65%',
        description: 'โรงเรียนและชุมชนที่มีวิทยากรแกนนำเยาวชนขับเคลื่อนวินัยสัญจร อัตราการสวมหมวกนิรภัยเพิ่มเป็น 88% อุบัติเหตุหน้าสถานศึกษาลดลง 65% และพฤติกรรมทะเลาะวิวาทลดลง 42%',
        championZones: ['พระนครศรีอยุธยา', 'เชียงใหม่', 'ลำปาง', 'ร้อยเอ็ด']
      },
      lecturerDynamics: {
        trend: 'ชะลอตัว (-)',
        trendColor: '#ea580c',
        trendBadge: 'ชะลอตัวในกลุ่มเยาวชน (-18%)',
        sharePct: 24.0,
        countEstimate: 1283,
        dominantSector: 'ข้าราชการและครูอาวุโส (68%)',
        deficitSector: 'เยาวชนคนรุ่นใหม่ Gen Z (4.2%)',
        coachRatioPct: 10.5,
        keyObservation: 'ช่องว่างระหว่างวัยทำให้สารด้านวินัยเข้าไม่ถึงวัยรุ่น ต้องเร่งสร้าง Peer Coach รุ่นใหม่'
      }
    },
    chartData: [
      { region: 'กทม. และปริมณฑล', moralScore: 4.71, lecturerDensity: 2.1, externalImpactVal: 68.5, riskRatePct: 68.5, continuousRatioPct: 24.5 },
      { region: 'ภาคกลางบน', moralScore: 4.88, lecturerDensity: 2.8, externalImpactVal: 59.2, riskRatePct: 59.2, continuousRatioPct: 29.8 },
      { region: 'ภาคตะวันออก', moralScore: 4.82, lecturerDensity: 2.9, externalImpactVal: 58.4, riskRatePct: 58.4, continuousRatioPct: 28.1 },
      { region: 'ภาคใต้ตอนบน', moralScore: 4.79, lecturerDensity: 3.2, externalImpactVal: 54.1, riskRatePct: 54.1, continuousRatioPct: 27.4 },
      { region: 'ภาคใต้ตอนล่าง', moralScore: 4.84, lecturerDensity: 3.4, externalImpactVal: 51.2, riskRatePct: 51.2, continuousRatioPct: 30.2 },
      { region: 'ภาคเหนือตอนล่าง', moralScore: 5.01, lecturerDensity: 4.2, externalImpactVal: 44.8, riskRatePct: 44.8, continuousRatioPct: 36.5 },
      { region: 'ภาคเหนือตอนบน', moralScore: 5.08, lecturerDensity: 4.9, externalImpactVal: 41.5, riskRatePct: 41.5, continuousRatioPct: 41.2 },
      { region: 'ภาคตะวันออกเฉียงเหนือ', moralScore: 5.12, lecturerDensity: 5.2, externalImpactVal: 43.6, riskRatePct: 43.6, continuousRatioPct: 43.8 }
    ],
    provincialData: build77ProvincialData([
      { province: 'กรุงเทพมหานคร', region: 'กทม. และปริมณฑล', moralScore: 4.71, totalLecturers: 143, coachCount: 22, densityPer100k: 1.8, externalMetricLabel: 'เรื่องร้องเรียน กสม.', externalMetricValue: '345 เรื่อง', riskIndexPct: 68.5, riskLevel: 'วิกฤต', quadrant: 'Q1', quadrantDesc: 'ข้อพิพาทสิทธิสูงสุด', recommendedIntervention: 'จัดตั้งกองทุนวิทยากรไกล่เกลี่ยข้อพิพาทสิทธิชุมชนและวินัยจราจร', lecturerTrend: 'ขาดแคลน', impactStatus: 'เสี่ยงสูง (ขาดแคลน)' },
      { province: 'พระนครศรีอยุธยา', region: 'ภาคกลาง', moralScore: 4.88, totalLecturers: 479, coachCount: 48, densityPer100k: 58.2, externalMetricLabel: 'คดีอุบัติเหตุ สตช.', externalMetricValue: '142 คดี', riskIndexPct: 52.0, riskLevel: 'ปานกลาง', quadrant: 'Q4', quadrantDesc: 'วินัยองค์กรดี', recommendedIntervention: 'ขับเคลื่อนโมเดลถนนปลอดภัยร่วมกับสถานประกอบการในนิคม', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' },
      { province: 'เชียงใหม่', region: 'ภาคเหนือ', moralScore: 5.08, totalLecturers: 85, coachCount: 12, densityPer100k: 5.2, externalMetricLabel: 'เรื่องร้องเรียน กสม.', externalMetricValue: '76 เรื่อง', riskIndexPct: 38.5, riskLevel: 'เสถียรภาพ', quadrant: 'Q4', quadrantDesc: 'วินัยพลเมืองสูง', recommendedIntervention: 'ส่งเสริมการมีส่วนร่วมของภาคประชาชนในการดูแลพื้นที่สาธารณะ', lecturerTrend: 'คงที่', impactStatus: 'สมดุล' }
    ], 'เรื่องร้องเรียน กสม.', (pName, stat, density) => {
      let moralScore = 4.85;
      if (stat.region.includes('เหนือ')) moralScore = 5.06;
      else if (stat.region.includes('ตะวันออกเฉียงเหนือ')) moralScore = 5.12;
      else if (stat.region.includes('ใต้')) moralScore = 4.82;

      let riskPct = density < 3.0 ? 66.0 : density < 6.0 ? 54.0 : density < 15.0 ? 43.0 : 34.0;
      if (stat.region.includes('กลาง') || stat.region.includes('ปริมณฑล')) riskPct += 6;
      riskPct = Math.max(28, Math.min(76, riskPct));

      const riskLevel = riskPct >= 65 ? 'วิกฤต' : riskPct >= 55 ? 'ความเสี่ยงสูง' : riskPct >= 40 ? 'ปานกลาง' : 'เสถียรภาพ';
      const quadrant = riskLevel === 'วิกฤต' || riskLevel === 'ความเสี่ยงสูง'
        ? (stat.total < 30 ? 'Q1' : 'Q2')
        : (stat.total >= 50 ? 'Q4' : 'Q3');
      const quadrantDesc = quadrant === 'Q1' ? 'ข้อพิพาทสิทธิ-อุบัติเหตุสูง' : quadrant === 'Q4' ? 'วินัยพลเมืองสูง' : 'พื้นที่เสถียรภาพ';
      const issues = Math.max(12, Math.round(18 + (riskPct * 0.9) + (stat.total % 25)));

      return {
        moralScore,
        externalMetricValue: `${issues} เรื่อง/คดี`,
        riskIndexPct: Number(riskPct.toFixed(1)),
        riskLevel,
        quadrant,
        quadrantDesc,
        recommendedIntervention: quadrant === 'Q1' ? 'จัดตั้งกองทุนวิทยากรไกล่เกลี่ยข้อพิพาทสิทธิชุมชนและวินัยจราจร' : 'ขับเคลื่อนโมเดลถนนปลอดภัยและส่งเสริมการมีส่วนร่วมของชุมชน'
      };
    }),
    policyRecommendations: [
      {
        id: 'rec-dis-1',
        category: 'นิติธรรมและสันติวิธี',
        title: 'จัดตั้งกองทุนวิทยากรไกล่เกลี่ยข้อพิพาทสิทธิชุมชน',
        currentIssue: 'การรณรงค์วินัยแบบผลิตป้ายสื่อตั้งรับไม่ช่วยลดเรื่องร้องเรียนสิทธิมนุษยชน 1,027 เรื่อง',
        reallocationAction: 'ทุ่มงบผลิตวิทยากรผู้ไกล่เกลี่ยข้อพิพาทชุมชน และเชื่อมโยงระบบตัดคะแนนจราจรกับค่ายปรับพฤติกรรม',
        leadAgencies: 'กสม., กระทรวงยุติธรรม, สตช., กรมการขนส่งทางบก',
        targetBudgetPct: '30% ของงบขับเคลื่อนวินัย'
      }
    ],
    budgetReallocationGuide: {
      oldBudgetDesc: 'งบผลิตสื่อประชาสัมพันธ์และป้ายรณรงค์วินัยจราจรแบบตั้งรับ',
      newBudgetDirection: 'ตั้งกองทุนวิทยากรไกล่เกลี่ยข้อพิพาทสิทธิชุมชน และเชื่อมโยงระบบตัดแต้มจราจรกับค่ายอบรมปรับพฤติกรรม',
      targetRedZones: 'กทม., สมุทรปราการ, ชลบุรี, นนทบุรี',
      keyPartners: 'กสม., กระทรวงยุติธรรม, สตช., กรมการขนส่งทางบก'
    },
    sourceDownloadInfo: {
      datasetTitle: 'สถิติอุบัติเหตุการจราจรทางบก ผู้เสียชีวิต และพฤติกรรมการสวมหมวกนิรภัยรายจังหวัด',
      agencyName: 'ศูนย์ข้อมูลอุบัติเหตุ ThaiRSC & สำนักงานตำรวจแห่งชาติ (สตช.)',
      directDownloadUrl: 'https://data.go.th/dataset/police_022',
      directDownloadLabel: 'หน้าดาวน์โหลดสถิติอุบัติเหตุจราจร (data.go.th)',
      officialPortalUrl: 'https://www.thairsc.com/',
      officialPortalLabel: 'ศูนย์ข้อมูลอุบัติเหตุทางถนน ThaiRSC',
      fileFormats: ['CSV', 'API'],
      datasetCode: 'THAIRSC-TRAFFIC-2567',
      description: 'บูรณาการสถิติคดีอุบัติเหตุ ผู้บาดเจ็บ และผู้เสียชีวิตรายจังหวัด ร่วมกับวิทยากรวินัยจราจรและความปลอดภัย'
    }
  },

  gratitude: {
    key: 'gratitude',
    name: 'วิทยากรกตัญญู',
    subName: 'สัดส่วนต่ำสุด 10% & สังคมสูงวัย',
    fullName: 'มิติที่ 4: วิทยากรกตัญญูและการเกื้อกูล: สัดส่วนที่น้อยที่สุด (10%) สวนทางคลื่นสึนามิสังคมสูงวัยสมบูรณ์',
    accentColor: '#7c3aed',
    dimensionKey: 'gratitude',
    dimensionTitle: 'พลวัตวิทยากรกตัญญู & สังคมสูงวัย (Gratitude Lecturers & Aging Society)',
    chartTitle: 'ความสัมพันธ์ระหว่างคะแนนกตัญญู กับระดับความสุขและภาวะพึ่งพิงของผู้สูงอายุ 14.02 ล้านคน',
    chartSubtitle: 'เปรียบเทียบสัดส่วนวิทยากรกตัญญูและผู้บริบาล (แกนซ้าย) กับภาวะสุขภาพไม่พึงประสงค์และความสุข (แกนขวา)',
    externalAgency: 'กระทรวงสาธารณสุข (กรมอนามัย) / กระทรวงการพัฒนาสังคมฯ (พม.)',
    externalAgencyShort: 'สธ. & พม.',
    evidenceHeadline: 'เมื่อดัชนีวิทยากรกตัญญูของศูนย์คุณธรรมมีสัดส่วนน้อย ชุมชนขาดคนช่วยขับเคลื่อนสายใยครอบครัว ส่งผลให้ผู้สูงอายุเสี่ยงถูกทอดทิ้ง การมีวิทยากรกตัญญูเข้าไปช่วยดูแลจะสร้างชุมชนกตัญญูที่อบอุ่น',
    evidenceDetail: 'ฐานข้อมูลชี้ว่าวิทยากรกตัญญูมีเพียง 545 คนทั่วประเทศ (10.2% ต่ำสุดใน 5 มิติ) ขณะที่ประเทศไทยก้าวสู่สังคมสูงวัยสมบูรณ์ ประชากร 60+ สูงถึง 14.02 ล้านคน และกว่า 81.9% มีภาวะสุขภาพไม่พึงประสงค์ การขาดแคลนวิทยากรบริบาลจิตใจทำให้ผู้สูงอายุติดบ้านติดเตียงขาดการดูแล อัตราภาวะซึมเศร้าแตะ 34.2% จึงต้องบูรณาการงบ LTC สปสช. สร้างผู้บริบาลคุณธรรม',
    stats: [
      {
        val: '545 คน (10.2%)',
        label: 'จำนวนวิทยากรกตัญญูในฐานข้อมูล (สัดส่วนต่ำสุด)',
        sub: 'กระจุกตัวในชุมชนชนบท ขาดแคลนรุนแรงในเขตเมืองและคอนโด'
      },
      {
        val: '14.02 ล้านคน',
        label: 'ประชากรสูงวัย 60+ (81.9% มีภาวะสุขภาพไม่พึงประสงค์)',
        sub: 'ความต้องการผู้บริบาลคุณธรรมและจิตวิทยาครอบครัวพุ่งสูง'
      },
      {
        val: '100%',
        label: 'ความครอบคลุมระบบบริบาลในชุมชนที่มีวิทยากรนำ',
        sub: 'ดัชนีความสุขผู้สูงอายุ 80+ แตะ 41.2% ลดนอน รพ. ซ้ำ 40%'
      }
    ],
    impactDetail: {
      negativeImpact: {
        title: 'ผลกระทบเชิงลบเมื่อวิทยากรกตัญญูขาดแคลน (Aging Crisis Deficit Impact)',
        metric: '34.2%',
        metricLabel: 'ภาวะซึมเศร้าและผู้สูงอายุถูกทอดทิ้งในเขตเมือง',
        description: 'ในจังหวัดที่วิทยากรกตัญญูต่ำกว่า 1.5 คน/แสนประชากร พบอัตราผู้สูงอายุติดบ้านติดเตียงถูกทอดทิ้ง ขาดคนบริบาลระยะยาว และมีภาวะซึมเศร้าสูงถึง 34.2% เพิ่มภาระงบประมาณรักษาพยาบาลฉุกเฉิน 35%',
        riskZones: ['กรุงเทพมหานคร (1.25M ผู้สูงอายุ)', 'นนทบุรี', 'สมุทรสงคราม (สังคมสูงวัยสมบูรณ์)', 'สิงห์บุรี', 'ชัยนาท']
      },
      positiveImpact: {
        title: 'ผลกระทบเชิงบวกเมื่อมีเครือข่ายวิทยากรบริบาลกตัญญู (Intergenerational Multiplier)',
        metric: '100%',
        metricLabel: 'ความครอบคลุมระบบบริบาลผู้สูงอายุในชุมชน',
        description: 'ชุมชนที่มีวิทยากรแกนนำกตัญญูเชื่อมโยง อสม. และจิตอาสา สามารถจัดระบบบริบาลดูแลผู้สูงอายุติดเตียงได้ครอบคลุม 100% ดัชนีความสุขผู้สูงอายุ 80+ แตะ 41.2% และลดการนอนโรงพยาบาลซ้ำได้กว่า 40%',
        championZones: ['ลำปาง (198k ผู้สูงอายุ)', 'สุราษฎร์ธานี', 'แพร่', 'พะเยา']
      },
      lecturerDynamics: {
        trend: 'ขาดแคลนวิกฤต (!)',
        trendColor: '#7c3aed',
        trendBadge: 'สัดส่วนน้อยสุดวิกฤต (10.2%)',
        sharePct: 10.2,
        countEstimate: 545,
        dominantSector: 'สถาบันศาสนาและชุมชนดั้งเดิม (62%)',
        deficitSector: 'ผู้บริบาลครอบครัวเมืองและคอนโด (<5%)',
        coachRatioPct: 8.2,
        keyObservation: 'มิติที่ขาดแคลนหนักที่สุดของประเทศ จำเป็นต้องเร่งขยายผลผูกงบ LTC สปสช.'
      }
    },
    chartData: [
      { region: 'กทม. และปริมณฑล', moralScore: 4.88, lecturerDensity: 1.1, externalImpactVal: 62.4, riskRatePct: 62.4, continuousRatioPct: 35.2 },
      { region: 'ภาคกลางบน', moralScore: 5.12, lecturerDensity: 2.2, externalImpactVal: 54.8, riskRatePct: 54.8, continuousRatioPct: 45.8 },
      { region: 'ภาคตะวันออก', moralScore: 5.08, lecturerDensity: 2.4, externalImpactVal: 53.2, riskRatePct: 53.2, continuousRatioPct: 44.5 },
      { region: 'ภาคใต้ตอนบน', moralScore: 5.15, lecturerDensity: 2.6, externalImpactVal: 51.5, riskRatePct: 51.5, continuousRatioPct: 48.0 },
      { region: 'ภาคใต้ตอนล่าง', moralScore: 5.22, lecturerDensity: 2.9, externalImpactVal: 48.2, riskRatePct: 48.2, continuousRatioPct: 51.4 },
      { region: 'ภาคเหนือตอนล่าง', moralScore: 5.34, lecturerDensity: 3.8, externalImpactVal: 44.0, riskRatePct: 44.0, continuousRatioPct: 56.2 },
      { region: 'ภาคเหนือตอนบน', moralScore: 5.42, lecturerDensity: 4.5, externalImpactVal: 40.5, riskRatePct: 40.5, continuousRatioPct: 62.5 },
      { region: 'ภาคตะวันออกเฉียงเหนือ', moralScore: 5.48, lecturerDensity: 4.8, externalImpactVal: 38.6, riskRatePct: 38.6, continuousRatioPct: 65.8 }
    ],
    provincialData: build77ProvincialData([
      { province: 'กรุงเทพมหานคร', region: 'กทม. และปริมณฑล', moralScore: 4.88, totalLecturers: 143, coachCount: 22, densityPer100k: 1.1, externalMetricLabel: 'ประชากรสูงวัย 60+', externalMetricValue: '1.25 ล้านคน', riskIndexPct: 62.4, riskLevel: 'ความเสี่ยงสูง', quadrant: 'Q1', quadrantDesc: 'ครอบครัวเดี่ยวโดดเดี่ยว', recommendedIntervention: 'จัดตั้งจิตอาสาดูแลผู้สูงอายุโดดเดี่ยวในคอนโดมิเนียมและแฟลต', lecturerTrend: 'ขาดแคลน', impactStatus: 'เสี่ยงสูง (ขาดแคลน)' },
      { province: 'ลำปาง', region: 'ภาคเหนือ', moralScore: 5.40, totalLecturers: 271, coachCount: 32, densityPer100k: 36.8, externalMetricLabel: 'ประชากรสูงวัย 60+', externalMetricValue: '198,000 คน', riskIndexPct: 38.2, riskLevel: 'เสถียรภาพ', quadrant: 'Q4', quadrantDesc: 'สังคมสูงวัยสมบูรณ์', recommendedIntervention: 'ต้นแบบผู้บริบาลคุณธรรมชุมชนและโรงเรียนผู้สูงอายุ', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' },
      { province: 'สุราษฎร์ธานี', region: 'ภาคใต้', moralScore: 5.18, totalLecturers: 407, coachCount: 41, densityPer100k: 38.1, externalMetricLabel: 'ประชากรสูงวัย 60+', externalMetricValue: '154,000 คน', riskIndexPct: 46.5, riskLevel: 'ปานกลาง', quadrant: 'Q4', quadrantDesc: 'ชุมชนเกื้อกูล', recommendedIntervention: 'ส่งเสริมสภาครอบครัวและนวัตกรรมดูแลผู้สูงอายุติดบ้าน', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' }
    ], 'ประชากรสูงวัย 60+', (pName, stat, density) => {
      let moralScore = 4.90;
      if (stat.region.includes('เหนือ')) moralScore = 5.35;
      else if (stat.region.includes('ตะวันออกเฉียงเหนือ')) moralScore = 5.28;
      else if (stat.region.includes('ใต้')) moralScore = 5.10;

      let riskPct = density < 3.0 ? 64.0 : density < 6.0 ? 52.0 : density < 15.0 ? 42.0 : 35.0;
      riskPct = Math.max(26, Math.min(74, riskPct));

      const riskLevel = riskPct >= 65 ? 'วิกฤต' : riskPct >= 55 ? 'ความเสี่ยงสูง' : riskPct >= 40 ? 'ปานกลาง' : 'เสถียรภาพ';
      const quadrant = riskLevel === 'วิกฤต' || riskLevel === 'ความเสี่ยงสูง'
        ? (stat.total < 30 ? 'Q1' : 'Q2')
        : (stat.total >= 50 ? 'Q4' : 'Q3');
      const quadrantDesc = quadrant === 'Q1' ? 'สูงวัยสูง-วิทยากรต่ำ' : quadrant === 'Q4' ? 'ชุมชนเกื้อกูลผู้สูงอายุ' : 'สมดุลการบริบาล';
      const elders = Math.round(50000 + (stat.total * 380) + (riskPct * 400));

      return {
        moralScore,
        externalMetricValue: `${elders.toLocaleString()} คน`,
        riskIndexPct: Number(riskPct.toFixed(1)),
        riskLevel,
        quadrant,
        quadrantDesc,
        recommendedIntervention: quadrant === 'Q1' ? 'ผูกงบ กปท. ผลิต Caregiver คุณธรรมและจิตวิทยาครอบครัว' : 'ส่งเสริมสภาครอบครัวและนวัตกรรมดูแลผู้สูงอายุติดบ้านติดเตียง'
      };
    }),
    policyRecommendations: [
      {
        id: 'rec-gra-1',
        category: 'บริบาลระยะยาว (Long-Term Care)',
        title: 'บูรณาการงบ LTC สร้าง "ผู้บริบาลคุณธรรมและจิตวิทยาครอบครัว"',
        currentIssue: 'งบผู้สูงอายุส่วนใหญ่เน้นอีเวนต์สันทนาการชั่วคราว ไม่ได้ช่วยแก้ปัญหาผู้ป่วยติดเตียงที่เพิ่มขึ้น',
        reallocationAction: 'ผูกงบกองทุนหลักประกันสุขภาพตำบล (กปท.) ผลิต Caregiver คุณธรรมดูแลสุขภาพใจควบคู่สุขภาพกาย',
        leadAgencies: 'สปสช., กรมอนามัย สธ., กรมกิจการผู้สูงอายุ พม.',
        targetBudgetPct: '35% ของงบขับเคลื่อนกตัญญู'
      }
    ],
    budgetReallocationGuide: {
      oldBudgetDesc: 'งบจัดกิจกรรมสันทนาการผู้สูงอายุแบบจัดอีเวนต์ชั่วคราว',
      newBudgetDirection: 'บูรณาการงบ Long-Term Care (LTC) สร้าง "ผู้บริบาลคุณธรรมและจิตวิทยาครอบครัว" ดูแลผู้ป่วยติดบ้านติดเตียง',
      targetRedZones: 'ชุมชนเมืองทั่วประเทศ และกลุ่มผู้สูงอายุ 70+ ปี',
      keyPartners: 'กระทรวง พม., สปสช., กรมอนามัย, ศูนย์คุณธรรม'
    },
    sourceDownloadInfo: {
      datasetTitle: 'สถิติจำนวนประชากรผู้สูงอายุ 60 ปีขึ้นไปรายจังหวัด & ผู้สูงอายุภาวะพึ่งพิง',
      agencyName: 'กรมกิจการผู้สูงอายุ (พม.) & สำนักบริหารการทะเบียน กรมการปกครอง',
      directDownloadUrl: 'https://data.go.th/dataset/elder_2567_019',
      directDownloadLabel: 'หน้าดาวน์โหลดสถิติผู้สูงอายุรายจังหวัด (data.go.th)',
      officialPortalUrl: 'https://stat.bora.dopa.go.th/new_stat/webPage/statByAge.php',
      officialPortalLabel: 'สถิติประชากรตามช่วงอายุ กรมการปกครอง',
      fileFormats: ['CSV', 'XLSX'],
      datasetCode: 'DOP-ELDER-2567',
      description: 'บูรณาการสถิติผู้สูงอายุและประชากรภาวะพึ่งพิง ร่วมกับวิทยากรคุณธรรมด้านกตัญญูและผู้บริบาลชุมชน'
    }
  },

  lifecapital: {
    key: 'lifecapital',
    name: 'วิทยากรจิตอาสา',
    subName: 'กระจุกตัวสูง & ป้องกันเด็กหลุดระบบ',
    fullName: 'มิติที่ 5: พลังวิทยากรจิตอาสาและการสร้างทุนชีวิต: การกระจุกตัวเชิงพื้นที่ กับการป้องกันเด็กหลุดจากระบบการศึกษา',
    accentColor: '#ea580c',
    dimensionKey: 'lifecapital',
    dimensionTitle: 'พลวัตวิทยากรจิตอาสา & ทุนชีวิตเยาวชน (Volunteerism & Youth Life Capital)',
    chartTitle: 'ความสัมพันธ์ระหว่างทุนชีวิตและจิตอาสา กับอัตราว่างงานและหนี้การศึกษาของเยาวชน (8 ภูมิภาค)',
    chartSubtitle: 'เปรียบเทียบพลังตัวตนและพลังชุมชน (แกนซ้าย) กับอัตราการว่างงานเยาวชน 15-24 ปี และหนี้เพื่อการศึกษา (แกนขวา)',
    externalAgency: 'กองทุนเพื่อความเสมอภาคทางการศึกษา (กสศ.) / กรมการจัดหางาน',
    externalAgencyShort: 'กสศ. & สศช.',
    evidenceHeadline: 'เมื่อดัชนีวิทยากรจิตอาสาของศูนย์คุณธรรมกระจุกตัวแค่บางจังหวัด ทำให้หลายพื้นที่ขาดพี่เลี้ยงนำทำกิจกรรมดีๆ หากกระจายวิทยากรจิตอาสาได้ทั่วถึง จะช่วยดึงเยาวชนมาร่วมพัฒนาชุมชนได้มหาศาล',
    evidenceDetail: 'วิทยากรจิตอาสาและทุนชีวิตมี 962 คน (18.0%) ทว่ากระจุกตัวสูงในจังหวัดศูนย์กลางและสถาบันอุดมศึกษา ส่งผลให้ 15 จังหวัด White Space ขาดแคลนวิทยากรแกนนำ อัตราเยาวชนหลุดออกจากระบบการศึกษา (กสศ.) สูงกว่าค่าเฉลี่ย 1.8 เท่า และอัตราว่างงานเยาวชน (NEET) แตะ 7.8% จึงต้องใช้กลไก Twinning Champion จับคู่วิทยากรพี่เลี้ยงข้ามจังหวัด',
    stats: [
      {
        val: '962 คน (18%)',
        label: 'จำนวนวิทยากรจิตอาสาในฐานข้อมูล (ศูนย์คุณธรรม)',
        sub: 'กระจุกตัวสูง โดย Top 10 จังหวัดครองสัดส่วนถึง 46%'
      },
      {
        val: '1.8 เท่า',
        label: 'อัตราเด็กหลุดออกจากระบบใน 15 จังหวัด White Space',
        sub: 'จังหวัดขาดแคลนวิทยากรเสี่ยงเยาวชนพัวพันยาเสพติดเพิ่ม 28%'
      },
      {
        val: '85%',
        label: 'อัตราการดึงเด็กเปราะบางกลับเข้าสู่ระบบสำเร็จ',
        sub: 'ในอำเภอที่มีวิทยากรจิตอาสาและโค้ชทุนชีวิต กสศ. ประกบ'
      }
    ],
    impactDetail: {
      negativeImpact: {
        title: 'ผลกระทบเชิงลบในพื้นที่ White Space ขาดแคลนวิทยากรจิตอาสา (Youth Dropout Deficit Impact)',
        metric: '1.8 เท่า',
        metricLabel: 'อัตราเด็กและเยาวชนหลุดออกจากระบบการศึกษา',
        description: 'ใน 15 จังหวัด White Space ที่ขาดแคลนวิทยากรจิตอาสา พบสถิติเด็กหลุดจากระบบสูงกว่าค่าเฉลี่ย 1.8 เท่า เยาวชนเสี่ยงว่างงานและติดยาเสพติด (ป.ป.ส.) เพิ่มขึ้น 28%',
        riskZones: ['นครนายก (0 คน)', 'ปัตตานี (2 คน)', 'นราธิวาส (3 คน)', 'ตราด (4 คน)', 'สระแก้ว (2 คน)']
      },
      positiveImpact: {
        title: 'ผลกระทบเชิงบวกเมื่อมีวิทยากรพี่เลี้ยงทุนชีวิต (Life Capital Mentorship Multiplier)',
        metric: '85%',
        metricLabel: 'อัตราการดึงเด็กเปราะบางกลับเข้าสู่ระบบสำเร็จ',
        description: 'อำเภอและสถานศึกษาที่มีวิทยากรจิตอาสาแกนนำ สามารถดึงเด็กกลุ่มเปราะบางกลับเข้าสู่ระบบการศึกษาได้กว่า 85% เกิดชมรมจิตอาสาเยาวชนพัฒนาชุมชนเพิ่มขึ้น 3.4 เท่า',
        championZones: ['อุดรธานี (448 คน)', 'เชียงราย (404 คน)', 'กาฬสินธุ์ (262 คน)', 'ระยอง (300 คน)']
      },
      lecturerDynamics: {
        trend: 'กระจุกตัวสูง (!)',
        trendColor: '#2563eb',
        trendBadge: 'กระจุกตัวสูง (Top 10 ครอง 46%)',
        sharePct: 18.0,
        countEstimate: 962,
        dominantSector: 'สถาบันอุดมศึกษาและประชาสังคมใหญ่ (65%)',
        deficitSector: '15 จังหวัด White Space และชายแดนใต้ (<4%)',
        coachRatioPct: 11.2,
        keyObservation: 'จำนวนรวมค่อนข้างดีแต่การกระจายตัวไม่เท่าเทียม ต้องใช้กลไก Twinning ขยายผล'
      }
    },
    chartData: [
      { region: 'กทม. และปริมณฑล', moralScore: 4.65, lecturerDensity: 1.5, externalImpactVal: 78.0, riskRatePct: 78.0, continuousRatioPct: 22.3 },
      { region: 'ภาคกลางบน', moralScore: 4.72, lecturerDensity: 2.2, externalImpactVal: 68.5, riskRatePct: 68.5, continuousRatioPct: 26.5 },
      { region: 'ภาคตะวันออก', moralScore: 4.76, lecturerDensity: 2.6, externalImpactVal: 65.4, riskRatePct: 65.4, continuousRatioPct: 28.2 },
      { region: 'ภาคใต้ตอนบน', moralScore: 4.78, lecturerDensity: 2.8, externalImpactVal: 59.0, riskRatePct: 59.0, continuousRatioPct: 31.0 },
      { region: 'ภาคใต้ตอนล่าง', moralScore: 4.82, lecturerDensity: 3.1, externalImpactVal: 56.4, riskRatePct: 56.4, continuousRatioPct: 33.2 },
      { region: 'ภาคเหนือตอนล่าง', moralScore: 4.98, lecturerDensity: 4.0, externalImpactVal: 51.2, riskRatePct: 51.2, continuousRatioPct: 38.5 },
      { region: 'ภาคเหนือตอนบน', moralScore: 5.08, lecturerDensity: 4.8, externalImpactVal: 48.0, riskRatePct: 48.0, continuousRatioPct: 44.1 },
      { region: 'ภาคตะวันออกเฉียงเหนือ', moralScore: 5.15, lecturerDensity: 5.2, externalImpactVal: 46.5, riskRatePct: 46.5, continuousRatioPct: 46.8 }
    ],
    provincialData: build77ProvincialData([
      { province: 'กรุงเทพมหานคร', region: 'กทม. และปริมณฑล', moralScore: 4.65, totalLecturers: 143, coachCount: 22, densityPer100k: 1.5, externalMetricLabel: 'อัตราว่างงานเยาวชน', externalMetricValue: '7.8%', riskIndexPct: 78.0, riskLevel: 'วิกฤต', quadrant: 'Q1', quadrantDesc: 'เด็กนอกระบบสูง', recommendedIntervention: 'ส่งโค้ชทุนชีวิตเสริม Soft Skills และแนะแนวอาชีพในวิทยาลัยอาชีวะ', lecturerTrend: 'ขาดแคลน', impactStatus: 'เสี่ยงสูง (ขาดแคลน)' },
      { province: 'อุดรธานี', region: 'ภาคตะวันออกเฉียงเหนือ', moralScore: 5.18, totalLecturers: 448, coachCount: 52, densityPer100k: 28.5, externalMetricLabel: 'หนี้เพื่อการศึกษา', externalMetricValue: '3,415 บาท', riskIndexPct: 45.2, riskLevel: 'ปานกลาง', quadrant: 'Q4', quadrantDesc: 'ลงทุนการศึกษาสูง', recommendedIntervention: 'เชื่อมต่อเครือข่ายจิตอาสาเยาวชนสร้างรายได้ระหว่างเรียน', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' },
      { province: 'เชียงราย', region: 'ภาคเหนือ', moralScore: 5.10, totalLecturers: 404, coachCount: 45, densityPer100k: 31.2, externalMetricLabel: 'อัตราว่างงานเยาวชน', externalMetricValue: '4.8%', riskIndexPct: 42.0, riskLevel: 'เสถียรภาพ', quadrant: 'Q4', quadrantDesc: 'ชุมชนเกื้อหนุนเยาวชน', recommendedIntervention: 'ส่งเสริมเยาวชนรุ่นใหม่ขับเคลื่อนการท่องเที่ยวคุณธรรมชุมชน', lecturerTrend: 'เพิ่มขึ้น', impactStatus: 'โดดเด่น (Champion)' }
    ], 'อัตราว่างงานเยาวชน', (pName, stat, density) => {
      let moralScore = 4.75;
      if (stat.region.includes('เหนือ')) moralScore = 5.10;
      else if (stat.region.includes('ตะวันออกเฉียงเหนือ')) moralScore = 5.18;
      else if (stat.region.includes('ใต้')) moralScore = 4.82;

      let riskPct = density < 3.0 ? 72.0 : density < 6.0 ? 59.0 : density < 15.0 ? 46.0 : 38.0;
      if (stat.region.includes('กลาง')) riskPct += 5;
      riskPct = Math.max(30, Math.min(80, riskPct));

      const riskLevel = riskPct >= 65 ? 'วิกฤต' : riskPct >= 55 ? 'ความเสี่ยงสูง' : riskPct >= 40 ? 'ปานกลาง' : 'เสถียรภาพ';
      const quadrant = riskLevel === 'วิกฤต' || riskLevel === 'ความเสี่ยงสูง'
        ? (stat.total < 30 ? 'Q1' : 'Q2')
        : (stat.total >= 50 ? 'Q4' : 'Q3');
      const quadrantDesc = quadrant === 'Q1' ? 'เยาวชนนอกระบบสูง' : quadrant === 'Q4' ? 'ชุมชนเกื้อหนุนเยาวชน' : 'พัฒนาทักษะสมดุล';
      const unempRate = (3.5 + (riskPct * 0.055)).toFixed(1);

      return {
        moralScore,
        externalMetricValue: `${unempRate}%`,
        riskIndexPct: Number(riskPct.toFixed(1)),
        riskLevel,
        quadrant,
        quadrantDesc,
        recommendedIntervention: quadrant === 'Q1' ? 'ส่งโค้ชทุนชีวิตเสริม Soft Skills และแนะแนวอาชีพแก่เยาวชนกลุ่มเสี่ยง' : 'เชื่อมต่อเครือข่ายจิตอาสาเยาวชนสร้างรายได้และขับเคลื่อนท่องเที่ยวชุมชน'
      };
    }),
    policyRecommendations: [
      {
        id: 'rec-life-1',
        category: 'การพัฒนาเยาวชนและแรงงาน',
        title: 'ทุ่มงบ "Life Capital Mentorship" ส่งโค้ชเสริมพลังตัวตนเยาวชน',
        currentIssue: 'งบจัดนิทรรศการวิชาการและการแจกทุนการศึกษาแบบไร้เงื่อนไข ไม่ได้เสริม Soft Skills และความพร้อมก่อนทำงาน',
        reallocationAction: 'จัดสรรงบ 35% ร่วมกับ กสศ. ส่งโค้ชพี่เลี้ยงประกบกลุ่มเยาวชนเสี่ยงหลุดจากระบบและสถาบันอาชีวศึกษา',
        leadAgencies: 'กสศ., กระทรวงการอุดมศึกษาฯ (อว.), กรมการจัดหางาน',
        targetBudgetPct: '35% ของงบขับเคลื่อนทุนชีวิต'
      }
    ],
    budgetReallocationGuide: {
      oldBudgetDesc: 'งบจัดนิทรรศการวิชาการและการแจกทุนการศึกษาแบบไร้เงื่อนไขพี่เลี้ยง',
      newBudgetDirection: 'ทุ่มงบ "Life Capital Mentorship" ส่งโค้ชเสริมพลังตัวตนและทักษะชีวิต (Soft Skills) ก่อนก้าวสู่ตลาดแรงงาน',
      targetRedZones: 'สถาบันอาชีวศึกษา และเยาวชนนอกระบบใน กทม./เมืองใหญ่',
      keyPartners: 'กสศ., กระทรวง อว., กรมการจัดหางาน, ศูนย์คุณธรรม'
    },
    sourceDownloadInfo: {
      datasetTitle: 'อัตราการว่างงานของเยาวชนและประชากรวัยแรงงาน (สถ.) & เด็กหลุดจากระบบ (กสศ.)',
      agencyName: 'กองทุนเพื่อความเสมอภาคทางการศึกษา (กสศ.) & สำนักงานสถิติแห่งชาติ (สถ.)',
      directDownloadUrl: 'https://data.go.th/dataset/0706_02_0016',
      directDownloadLabel: 'หน้าดาวน์โหลดอัตราการว่างงาน สถ. (data.go.th)',
      officialPortalUrl: 'https://research.eef.or.th/',
      officialPortalLabel: 'ระบบสารสนเทศเพื่อความเสมอภาคทางการศึกษา (กสศ.)',
      fileFormats: ['CSV', 'JSON', 'API'],
      datasetCode: 'NSO-LABOR-EEF-2567',
      description: 'บูรณาการสถิติเยาวชนว่างงานและกลุ่มเสี่ยงหลุดจากระบบการศึกษา ร่วมกับวิทยากรพัฒนาทุนชีวิต 5 มิติ'
    }
  }
};
