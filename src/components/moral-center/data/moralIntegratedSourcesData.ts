// moralIntegratedSourcesData.ts
// คลังชุดข้อมูลบูรณาการ ลิงก์ตรง Open Data Portal และ Direct Download Endpoints สำหรับทั้ง 12 เมนูย่อย
// ตามมาตรฐาน DGA และข้อกำหนดการเชื่อมโยงข้อมูลจริง

export interface IntegratedDatasetInfo {
  id: string;
  agencyName: string;
  agencyTag: string;
  datasetTitle: string;
  description: string;
  category: string;
  format: 'CSV' | 'JSON' | 'XLSX' | 'GeoJSON' | 'API';
  portalUrl: string;       // Official Website / Open Data Portal URL
  downloadUrl: string;     // Direct Download / Endpoint Link
  apiEndpoint?: string;    // REST API Endpoint URL
  updateFrequency: string; // ความถี่ในการปรับปรุงข้อมูล
  schemaFields: string[];  // รายการคอลัมน์/ตัวแปรในชุดข้อมูล
  sampleRowsCount?: number;
}

// Helper: แปลง JSON Array เป็น CSV String พร้อม UTF-8 BOM
export function convertArrayToCsv(data: any[]): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const headerRow = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');

  const rows = data.map(item => {
    return headers.map(h => {
      const val = item[h];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',');
  });

  return '\uFEFF' + [headerRow, ...rows].join('\r\n');
}

// Helper: สั่งดาวน์โหลดไฟล์ลงเครื่อง Browser โดยตรง
export function triggerFileDownload(filename: string, content: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// MASTER CATALOG OF INTEGRATED AGENCY DATASETS (12 SUB-MENUS)
// -------------------------------------------------------------
export const INTEGRATED_DATASETS_MASTER: Record<string, IntegratedDatasetInfo> = {
  // 1.1 ดัชนีคุณธรรม 5 มิติ (ศคธ.)
  'moral-5d-national': {
    id: 'moral-5d-national',
    agencyName: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    agencyTag: 'ศคธ.',
    datasetTitle: 'ดัชนีคุณธรรม 5 มิติ ระดับประเทศและรายจังหวัด (77 จังหวัด)',
    description: 'ชุดข้อมูลผลการสำรวจและประเมินดัชนีคุณธรรม 5 ด้าน (พอเพียง, วินัย, สุจริต, จิตอาสา, กตัญญู) ทั่วประเทศไทย 77 จังหวัด ประจำปี 2565-2568',
    category: 'ดัชนีชี้วัดคุณธรรม',
    format: 'CSV',
    portalUrl: 'https://moralcenter.or.th/opendata',
    downloadUrl: 'https://data.go.th/dataset/moral-index-thailand/resource/download/moral_5_dimensions_77prov.csv',
    apiEndpoint: 'https://data.go.th/api/3/action/datastore_search?resource_id=moral-index-77prov',
    updateFrequency: 'รายปี (ประจำปีงบประมาณ)',
    schemaFields: ['province_id', 'province_th', 'region', 'suff_score', 'disc_score', 'inte_score', 'volu_score', 'grat_score', 'overall_score', 'year'],
    sampleRowsCount: 77
  },

  // 1.1 สถิติแห่งชาติ
  'nso-social-indicators': {
    id: 'nso-social-indicators',
    agencyName: 'สำนักงานสถิติแห่งชาติ',
    agencyTag: 'สถิติแห่งชาติ',
    datasetTitle: 'สถิติตัวชี้วัดสภาวะทางสังคมและพฤติกรรมประชากรไทย',
    description: 'การสำรวจภาวะเศรษฐกิจและสังคมของครัวเรือน และพฤติกรรมคุณธรรมจริยธรรมของประชากรไทย',
    category: 'สภาวะสังคม',
    format: 'XLSX',
    portalUrl: 'https://www.nso.go.th',
    downloadUrl: 'https://catalog.nso.go.th/dataset/social-indicators-thailand/resource/download/social_indicators.xlsx',
    apiEndpoint: 'https://api.nso.go.th/v2/datasets/social-indicator/data',
    updateFrequency: 'รายไตรมาส',
    schemaFields: ['quarter', 'year', 'region', 'volunteer_rate', 'household_savings_rate', 'debt_burden_ratio'],
    sampleRowsCount: 120
  },

  // 1.1 กรมสุขภาพจิต
  'dmh-thai-happiness': {
    id: 'dmh-thai-happiness',
    agencyName: 'กรมสุขภาพจิต กระทรวงสาธารณสุข',
    agencyTag: 'กรมสุขภาพจิต',
    datasetTitle: 'ดัชนีความสุขคนไทย (Thai Happiness Index: THI) รายจังหวัด',
    description: 'ดัชนีวัดระดับความสุข สุขภาวะทางจิต และดัชนีพลังครอบครัวของประชาชนไทย 77 จังหวัด',
    category: 'สุขภาพจิตและสุขภาวะ',
    format: 'CSV',
    portalUrl: 'https://dmh.go.th',
    downloadUrl: 'https://data.go.th/dataset/dmh-happiness-index/resource/download/thai_happiness_index.csv',
    apiEndpoint: 'https://checkin.dmh.go.th/api/open/statistics',
    updateFrequency: 'รายเดือน / รายปี',
    schemaFields: ['province_code', 'province_name', 'thi_score', 'stress_level_pct', 'family_happiness_score'],
    sampleRowsCount: 77
  },

  // 1.1 Social Buzz
  'nlp-social-sentiment': {
    id: 'nlp-social-sentiment',
    agencyName: 'การประมวลผลกระแสสังคมออนไลน์ (AI Social Listening)',
    agencyTag: 'NLP Social Buzz',
    datasetTitle: 'ดัชนีประมวลผลกระแสความคิดเห็นออนไลน์ด้านคุณธรรม (Sentiment Dataset)',
    description: 'ผลการวิเคราะห์เจตคติและประเด็นสนทนาสาธารณะบนแพลตฟอร์มออนไลน์ด้านความซื่อสัตย์ วินัย และจิตอาสา',
    category: 'Big Data & AI',
    format: 'JSON',
    portalUrl: 'https://data.go.th',
    downloadUrl: 'https://data.go.th/dataset/social-sentiment-open-feed/resource/download/social_moral_sentiment.json',
    apiEndpoint: 'https://data.go.th/api/3/action/datastore_search?resource_id=social-moral-sentiment',
    updateFrequency: 'เรียลไทม์ (ทุก 24 ชั่วโมง)',
    schemaFields: ['timestamp', 'topic_dimension', 'positive_pct', 'negative_pct', 'neutral_pct', 'buzz_volume'],
    sampleRowsCount: 365
  },

  // 1.2 สำนักงบประมาณ
  'bb-annual-budget': {
    id: 'bb-annual-budget',
    agencyName: 'สำนักงบประมาณ',
    agencyTag: 'สำนักงบฯ',
    datasetTitle: 'งบประมาณรายจ่ายบูรณาการส่งเสริมคุณธรรมและพัฒนาสังคม',
    description: 'รายงานการจัดสรรงบประมาณแผ่นดินรายกระทรวงและหน่วยงานบูรณาการภายใต้แผนแม่บทคุณธรรมแห่งชาติ',
    category: 'งบประมาณและการคลัง',
    format: 'CSV',
    portalUrl: 'https://www.bb.go.th',
    downloadUrl: 'https://data.go.th/dataset/annual-budget-allocation/resource/download/budget_allocation_moral_eco.csv',
    apiEndpoint: 'https://ebudget.bb.go.th/api/v1/integrated-moral-budget',
    updateFrequency: 'รายปี',
    schemaFields: ['fiscal_year', 'ministry', 'department', 'program_name', 'budget_million_baht', 'disbursement_rate'],
    sampleRowsCount: 50
  },

  // 1.2 สภาพัฒน์ฯ
  'nesdc-social-roi': {
    id: 'nesdc-social-roi',
    agencyName: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ',
    agencyTag: 'สภาพัฒน์ฯ',
    datasetTitle: 'ดัชนีผลตอบแทนทางสังคมจากการลงทุน (Social ROI) แผนแม่บทคุณธรรม',
    description: 'แบบจำลองการคำนวณผลกระทบทางสังคม (Social Impact) และอัตราผลตอบแทนทางสังคมจากการขับเคลื่อนคุณธรรม 4 ระบบนิเวศ',
    category: 'ความคุ้มค่าทางสังคม',
    format: 'XLSX',
    portalUrl: 'https://www.nesdc.go.th',
    downloadUrl: 'https://opendata.nesdc.go.th/dataset/macro-social-roi/resource/download/nesdc_social_roi.xlsx',
    apiEndpoint: 'https://opendata.nesdc.go.th/api/v1/social-roi-metrics',
    updateFrequency: 'รายปี',
    schemaFields: ['ecosystem', 'budget_invested', 'social_return_value', 'sroi_ratio', 'beneficiary_count'],
    sampleRowsCount: 20
  },

  // 1.2 สภาการศึกษา
  'onec-moral-education': {
    id: 'onec-moral-education',
    agencyName: 'สำนักงานเลขาธิการสภาการศึกษา (ศธ.)',
    agencyTag: 'สภาการศึกษา',
    datasetTitle: 'สถิติการลงทุนและผลสัมฤทธิ์โครงการพัฒนาคุณธรรมผู้เรียน',
    description: 'ข้อมูลสถานศึกษา โครงการโรงเรียนคุณธรรม และงบประมาณสนับสนุนกิจกรรมเสริมสร้างวินัยและความซื่อสัตย์',
    category: 'การศึกษา',
    format: 'CSV',
    portalUrl: 'https://www.onec.go.th',
    downloadUrl: 'https://data.go.th/dataset/onec-moral-schools-budget/resource/download/onec_moral_projects.csv',
    apiEndpoint: 'https://opendata.onec.go.th/api/v1/moral-schools',
    updateFrequency: 'รายภาคเรียน',
    schemaFields: ['school_id', 'school_name', 'province', 'students_count', 'budget_baht', 'moral_index_score'],
    sampleRowsCount: 450
  },

  // 1.2 ศคธ. SROI
  'moral-macro-sroi': {
    id: 'moral-macro-sroi',
    agencyName: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    agencyTag: 'ศคธ.',
    datasetTitle: 'ฐานข้อมูลประเมิน Social Return on Investment (SROI) โครงการคุณธรรม',
    description: 'ผลการประเมินความคุ้มค่าโครงการขับเคลื่อนสังคมคุณธรรม 8 โครงการยุทธศาสตร์',
    category: 'ความคุ้มค่างบประมาณ',
    format: 'JSON',
    portalUrl: 'https://moralcenter.or.th',
    downloadUrl: 'https://data.go.th/dataset/moral-center-sroi/resource/download/moral_sroi_projects.json',
    apiEndpoint: 'https://moralcenter.or.th/api/sroi/projects-evaluation',
    updateFrequency: 'รายปี',
    schemaFields: ['project_name', 'budget_mb', 'delta_moral_score', 'projects_count', 'roi_multiplier'],
    sampleRowsCount: 8
  },

  // 1.3 สำนักงาน ป.ป.ช.
  'nacc-ita-national': {
    id: 'nacc-ita-national',
    agencyName: 'สำนักงาน ป.ป.ช.',
    agencyTag: 'ป.ป.ช.',
    datasetTitle: 'ผลการประเมินคุณธรรมและความโปร่งใสภาครัฐ (ITA) ทั่วประเทศ 8,420 หน่วยงาน',
    description: 'ผลคะแนนดัชนี ITA รายกระทรวง กรม จังหวัด และองค์กรปกครองส่วนท้องถิ่นทั่วประเทศไทย',
    category: 'ธรรมาภิบาลและความโปร่งใส',
    format: 'CSV',
    portalUrl: 'https://ita.nacc.go.th',
    downloadUrl: 'https://ita.nacc.go.th/open-data/download/ita_scores_full.csv',
    apiEndpoint: 'https://ita.nacc.go.th/api/v1/scores/national-report',
    updateFrequency: 'รายปี',
    schemaFields: ['agency_code', 'agency_name', 'agency_type', 'province', 'iit_score', 'eit_score', 'oit_score', 'total_score', 'grade'],
    sampleRowsCount: 8420
  },

  // 1.3 สำนักงาน ก.พ.
  'ocsc-civil-discipline': {
    id: 'ocsc-civil-discipline',
    agencyName: 'สำนักงาน ก.พ.',
    agencyTag: 'ก.พ.',
    datasetTitle: 'สถิติการรักษาวินัยและจริยธรรมข้าราชการพลเรือนสามัญ',
    description: 'รายงานสถิติคดีทางวินัย มาตรการส่งเสริมคุณธรรม และการพัฒนาข้าราชการคุณธรรมต้นแบบ',
    category: 'วินัยและจริยธรรมภาครัฐ',
    format: 'XLSX',
    portalUrl: 'https://www.ocsc.go.th',
    downloadUrl: 'https://data.go.th/dataset/ocsc-disciplinary-stats/resource/download/civil_servant_discipline.xlsx',
    apiEndpoint: 'https://opendata.ocsc.go.th/api/v1/ethics-stats',
    updateFrequency: 'รายปี',
    schemaFields: ['fiscal_year', 'ministry', 'cases_total', 'minor_discipline_count', 'severe_discipline_count', 'ethics_awards_count'],
    sampleRowsCount: 65
  },

  // 1.3 สภาพัฒน์ฯ Result Chain
  'nesdc-result-chain': {
    id: 'nesdc-result-chain',
    agencyName: 'สภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ',
    agencyTag: 'สภาพัฒน์ฯ',
    datasetTitle: 'ข้อมูลห่วงโซ่ผลลัพธ์ (Result Chain) แผนแม่บทคุณธรรมแห่งชาติ ฉบับที่ 2',
    description: 'ตัวชี้วัดความสำเร็จระดับ Input, Activity, Output, Outcome และ Impact ด้านคุณธรรมของชาติ',
    category: 'ห่วงโซ่ผลลัพธ์นโยบาย',
    format: 'CSV',
    portalUrl: 'https://www.nesdc.go.th',
    downloadUrl: 'https://opendata.nesdc.go.th/dataset/national-result-chain/download/result_chain_matrix.csv',
    apiEndpoint: 'https://opendata.nesdc.go.th/api/v1/result-chain-pipeline',
    updateFrequency: 'รายไตรมาส',
    schemaFields: ['agency_name', 'dimension', 'target_pct', 'achieved_pct', 'risk_status'],
    sampleRowsCount: 15
  },

  // 1.3 กระทรวงมหาดไทย
  'moi-dla-moral-units': {
    id: 'moi-dla-moral-units',
    agencyName: 'กระทรวงมหาดไทย',
    agencyTag: 'มท.',
    datasetTitle: 'ทำเนียบองค์กรปกครองส่วนท้องถิ่นและชุมชนคุณธรรมมาตรฐาน',
    description: 'ฐานข้อมูล อปท. (อบจ., เทศบาล, อบต.) และหมู่บ้านที่ผ่านเกณฑ์การประเมินชุมชนคุณธรรม',
    category: 'การปกครองท้องถิ่น',
    format: 'CSV',
    portalUrl: 'https://www.dla.go.th',
    downloadUrl: 'https://data.go.th/dataset/dla-moral-local-gov/download/local_moral_communities.csv',
    apiEndpoint: 'https://dla.go.th/opendata/api/moral-local-communities',
    updateFrequency: 'รายปี',
    schemaFields: ['local_code', 'local_name', 'province', 'district', 'moral_level', 'target_reached'],
    sampleRowsCount: 7850
  },

  // 1.3 กระทรวงวัฒนธรรม
  'mculture-benchmarks': {
    id: 'mculture-benchmarks',
    agencyName: 'กระทรวงวัฒนธรรม',
    agencyTag: 'วธ.',
    datasetTitle: 'ทะเบียนองค์กร ชุมชน และอำเภอคุณธรรมต้นแบบ วธ.',
    description: 'ข้อมูลชุมชนคุณธรรมพลังบวร (บ้าน-วัด-โรงเรียน) องค์กรคุณธรรม และจังหวัดคุณธรรมภายใต้การกำกับของ วธ.',
    category: 'วัฒนธรรมและคุณธรรม',
    format: 'JSON',
    portalUrl: 'https://www.m-culture.go.th',
    downloadUrl: 'https://data.go.th/dataset/mculture-moral-benchmarks/download/moral_model_entities.json',
    apiEndpoint: 'https://m-culture.go.th/opendata/api/model-entities',
    updateFrequency: 'รายปี',
    schemaFields: ['entity_id', 'entity_name', 'entity_type', 'province', 'assessment_score', 'year'],
    sampleRowsCount: 1200
  },

  // 1.3 กระทรวงศึกษาธิการ
  'moe-obec-schools': {
    id: 'moe-obec-schools',
    agencyName: 'กระทรวงศึกษาธิการ',
    agencyTag: 'ศธ.',
    datasetTitle: 'ฐานข้อมูลโรงเรียนคุณธรรม สพฐ. และคะแนนประเมินคุณธรรม 5 ด้าน',
    description: 'ผลการดำเนินงานโรงเรียนคุณธรรม สพฐ. กว่า 1,420 โรงเรียนทั่วประเทศ',
    category: 'การศึกษาขั้นพื้นฐาน',
    format: 'CSV',
    portalUrl: 'https://www.moe.go.th',
    downloadUrl: 'https://data.go.th/dataset/obec-moral-schools/download/obec_moral_schools.csv',
    apiEndpoint: 'https://moe.go.th/api/open/moral-schools',
    updateFrequency: 'รายภาคเรียน',
    schemaFields: ['school_code', 'school_name', 'educational_zone', 'province', 'star_level', 'activities_count'],
    sampleRowsCount: 1420
  },

  // 1.3 กระทรวง พม.
  'msociety-vulnerability': {
    id: 'msociety-vulnerability',
    agencyName: 'กระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์',
    agencyTag: 'พม.',
    datasetTitle: 'ดัชนีความเปราะบางทางสังคมและสถานการณ์ครอบครัวไทย',
    description: 'รายงานสถิติสภาวะครอบครัวเปราะบาง เด็กถูกทอดทิ้ง และการคุ้มครองสวัสดิภาพสังคม',
    category: 'สวัสดิการสังคม',
    format: 'CSV',
    portalUrl: 'https://www.m-society.go.th',
    downloadUrl: 'https://data.go.th/dataset/msociety-family-vulnerability/download/family_vulnerability_index.csv',
    apiEndpoint: 'https://opendata.m-society.go.th/api/family-vulnerability',
    updateFrequency: 'รายปี',
    schemaFields: ['province_id', 'province_name', 'vulnerable_families_count', 'risk_index', 'welfare_support_baht'],
    sampleRowsCount: 77
  },

  // 1.4 กรมกิจการสตรีและครอบครัว (สค.)
  'dwf-gender-family-gap': {
    id: 'dwf-gender-family-gap',
    agencyName: 'กรมกิจการสตรีและสถาบันครอบครัว (สค.)',
    agencyTag: 'พม. (สค.)',
    datasetTitle: 'สถิติช่องว่างความเท่าเทียมทางเพศและดัชนีความอบอุ่นในครอบครัว',
    description: 'ข้อมูลการสำรวจสัมพันธภาพในครอบครัวและช่องว่างคะแนนพฤติกรรมคุณธรรมระหว่างชาย-หญิง',
    category: 'ครอบครัวและความเสมอภาค',
    format: 'CSV',
    portalUrl: 'https://www.dwf.go.th',
    downloadUrl: 'https://data.go.th/dataset/dwf-domestic-violence/download/gender_family_gap_data.csv',
    apiEndpoint: 'https://dwf.go.th/api/open/family-gap',
    updateFrequency: 'รายปี',
    schemaFields: ['dimension', 'male_score', 'female_score', 'gap_difference', 'statistically_significant'],
    sampleRowsCount: 10
  },

  // 1.4 สถิติแห่งชาติ Gaps
  'nso-household-gaps': {
    id: 'nso-household-gaps',
    agencyName: 'สำนักงานสถิติแห่งชาติ (สถิติด้านแรงงานและประชากร)',
    agencyTag: 'สถิติแห่งชาติ',
    datasetTitle: 'การสำรวจภาวะเศรษฐกิจครัวเรือนและพฤติกรรมคุณธรรมตามช่วงชั้นรายได้',
    description: 'ข้อมูลเชิงลึกเปรียบเทียบพฤติกรรมวินัยการเงินและการช่วยเหลือสังคมจำแนกตามควอนไทล์รายได้',
    category: 'ประชากรศาสตร์และเศรษฐกิจ',
    format: 'XLSX',
    portalUrl: 'https://www.nso.go.th',
    downloadUrl: 'https://catalog.nso.go.th/dataset/socio-economic-gaps/download/nso_household_gaps.xlsx',
    apiEndpoint: 'https://api.nso.go.th/v2/datasets/household-socio-gap',
    updateFrequency: 'รายปี',
    schemaFields: ['income_quintile', 'discipline_financial_score', 'sufficiency_score', 'debt_burden'],
    sampleRowsCount: 15
  },

  // 1.4 ศคธ. Policy Gaps
  'moral-policy-interventions': {
    id: 'moral-policy-interventions',
    agencyName: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    agencyTag: 'ศคธ.',
    datasetTitle: 'เมทริกซ์ช่องว่างเชิงนโยบายและการจัดลำดับความเร่งด่วนในการแทรกแซง',
    description: 'ข้อมูลประเมิน Priority Quadrant (ระดับความรุนแรงของปัญหา vs งบประมาณสนับสนุน) สำหรับจัดสรรทรัพยากร',
    category: 'นโยบายและแผนยุทธศาสตร์',
    format: 'JSON',
    portalUrl: 'https://moralcenter.or.th',
    downloadUrl: 'https://data.go.th/dataset/moral-policy-gaps/download/moral_gender_gaps.json',
    apiEndpoint: 'https://moralcenter.or.th/api/policy/intervention-gaps',
    updateFrequency: 'รายปี',
    schemaFields: ['issue_name', 'problem_severity_score', 'budget_support_level', 'quadrant_category', 'urgency'],
    sampleRowsCount: 12
  },

  // 2.1 ศคธ. GIS
  'moral-gis-77-provinces': {
    id: 'moral-gis-77-provinces',
    agencyName: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    agencyTag: 'ศคธ.',
    datasetTitle: 'ดัชนีคุณธรรม 5 มิติ และแผนที่สถานการณ์ระดับพื้นที่ (GIS 77 จังหวัด)',
    description: 'พิกัดและค่าดัชนีคุณธรรม 5 ด้าน ระดับการเตือนภัย (ต่ำ/ปานกลาง/สูง) และสถิติจำนวนองค์กรคุณธรรม 77 จังหวัด',
    category: 'GIS และแผนที่ภูมิศาสตร์',
    format: 'GeoJSON',
    portalUrl: 'https://moralcenter.or.th/opendata',
    downloadUrl: 'https://data.go.th/dataset/moral-provincial-gis/download/provinces_77_moral_gis.geojson',
    apiEndpoint: 'https://moralcenter.or.th/api/gis/provinces-virtue-data',
    updateFrequency: 'รายไตรมาส',
    schemaFields: ['id', 'name_th', 'region', 'overallScore', 'suffScore', 'discScore', 'inteScore', 'voluScore', 'gratScore', 'riskLevel', 'moralOrgCount'],
    sampleRowsCount: 77
  },

  // 2.1 กรมการพัฒนาชุมชน (จปฐ.)
  'cdd-bmmn-gis': {
    id: 'cdd-bmmn-gis',
    agencyName: 'กรมการพัฒนาชุมชน (ฐานข้อมูล จปฐ.)',
    agencyTag: 'พช. (จปฐ.)',
    datasetTitle: 'ข้อมูลความจำเป็นพื้นฐาน (จปฐ.) ตัวชี้วัดด้านค่านิยมและวิถีชีวิตไทย',
    description: 'ผลการจัดเก็บข้อมูล จปฐ. มิติคนในครัวเรือนปฏิบัติตนตามหลักศีลธรรม จริยธรรม และการมีส่วนร่วมในชุมชน',
    category: 'ข้อมูลเชิงพื้นที่ จปฐ.',
    format: 'CSV',
    portalUrl: 'https://cdd.go.th',
    downloadUrl: 'https://data.go.th/dataset/cdd-bmmn-77provinces/download/cdd_bmmn_indicators.csv',
    apiEndpoint: 'https://bmmn.cdd.go.th/api/open/provinces-indicators',
    updateFrequency: 'รายปี',
    schemaFields: ['province_code', 'province_name', 'bmmn_moral_score', 'families_passed_pct', 'community_strength_score'],
    sampleRowsCount: 77
  },

  // 2.1 มท. ท้องถิ่น
  'dla-local-gis': {
    id: 'dla-local-gis',
    agencyName: 'กระทรวงมหาดไทย (ฐานข้อมูลเชิงพื้นที่)',
    agencyTag: 'มท. ท้องถิ่น',
    datasetTitle: 'ฐานข้อมูลเครือข่ายองค์กรปกครองส่วนท้องถิ่นขับเคลื่อนจังหวัดคุณธรรม',
    description: 'สถิติองค์กรปกครองส่วนท้องถิ่น ข้อมูลประชากร และพิกัดที่ทำการสนับสนุนการขับเคลื่อนจังหวัดคุณธรรม',
    category: 'การปกครองท้องถิ่น',
    format: 'XLSX',
    portalUrl: 'https://www.dla.go.th',
    downloadUrl: 'https://data.go.th/dataset/dla-local-gis-entities/download/dla_moral_local_units.xlsx',
    apiEndpoint: 'https://dla.go.th/api/gis/local-administrative-units',
    updateFrequency: 'รายปี',
    schemaFields: ['dla_code', 'dla_name', 'province', 'moral_city_status', 'projects_implemented'],
    sampleRowsCount: 250
  },

  // 2.2 สภาการศึกษา Demographics
  'onec-student-traits': {
    id: 'onec-student-traits',
    agencyName: 'สำนักงานเลขาธิการสภาการศึกษา (ศธ.)',
    agencyTag: 'สภาการศึกษา',
    datasetTitle: 'สถิติตัวชี้วัดคุณลักษณะอันพึงประสงค์ของผู้เรียนตามช่วงวัยการศึกษา',
    description: 'การประเมินคุณลักษณะด้านความซื่อสัตย์ ความมีวินัย และจิตสาธารณะของผู้เรียนในระดับปฐมวัย ประถม มัธยม และอุดมศึกษา',
    category: 'พฤติกรรมช่วงวัย',
    format: 'CSV',
    portalUrl: 'https://www.onec.go.th',
    downloadUrl: 'https://data.go.th/dataset/onec-student-moral-traits/download/student_traits_generations.csv',
    apiEndpoint: 'https://onec.go.th/api/v1/learner-traits-stats',
    updateFrequency: 'รายปี',
    schemaFields: ['education_stage', 'age_range', 'integrity_rate', 'discipline_rate', 'public_mind_rate'],
    sampleRowsCount: 16
  },

  // 2.2 สถิติแห่งชาติ ประชากรศาสตร์
  'nso-demographics-generations': {
    id: 'nso-demographics-generations',
    agencyName: 'สำนักงานสถิติแห่งชาติ',
    agencyTag: 'สถิติแห่งชาติ',
    datasetTitle: 'การสำรวจประชากรศาสตร์ โครงสร้างรุ่นวัย และครอบครัวข้ามรุ่นในประเทศไทย',
    description: 'สถิติประชากรจำแนกตาม Generation (Baby Boomer, Gen X, Gen Y, Gen Z, Alpha) พฤติกรรมการใช้สื่อ และความสัมพันธ์ครอบครัว',
    category: 'ประชากรศาสตร์',
    format: 'CSV',
    portalUrl: 'https://www.nso.go.th',
    downloadUrl: 'https://catalog.nso.go.th/dataset/thailand-demographics-generations/download/generations_data.csv',
    apiEndpoint: 'https://api.nso.go.th/v2/datasets/demographics-by-gen',
    updateFrequency: 'รายปี',
    schemaFields: ['generation_name', 'birth_years', 'population_million', 'avg_daily_screen_hours', 'family_activity_score'],
    sampleRowsCount: 5
  },

  // 2.2 ศคธ. ทุนชีวิต Demographics
  'moral-generation-insights': {
    id: 'moral-generation-insights',
    agencyName: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    agencyTag: 'ศคธ. ทุนชีวิต',
    datasetTitle: 'ผลสำรวจพฤติกรรมคุณธรรม 5 ด้าน และทุนชีวิตจำแนกตามรุ่นวัย (Generation Insights)',
    description: 'ข้อมูลวิเคราะห์คะแนนคุณธรรมและความพร้อมของทุนชีวิตระหว่าง Gen Z, Gen Y, Gen X และผู้สูงอายุ',
    category: 'มิติประชากรและทุนชีวิต',
    format: 'JSON',
    portalUrl: 'https://moralcenter.or.th',
    downloadUrl: 'https://data.go.th/dataset/moral-demographic-generations/download/moral_by_generations.json',
    apiEndpoint: 'https://moralcenter.or.th/api/demographics/generation-scores',
    updateFrequency: 'รายปี',
    schemaFields: ['generation', 'wisdom_power', 'family_power', 'community_power', 'media_power', 'overall_life_capital'],
    sampleRowsCount: 5
  },

  // 2.3 กรมกิจการเด็กและเยาวชน
  'dcy-vulnerable-youth': {
    id: 'dcy-vulnerable-youth',
    agencyName: 'กรมกิจการเด็กและเยาวชน (ดย.)',
    agencyTag: 'ดย. (เด็กเปราะบาง)',
    datasetTitle: 'ฐานข้อมูลเด็กและเยาวชนในสภาวะเปราะบาง รายจังหวัด 77 จังหวัด',
    description: 'สถิติเด็กในสถานรองรับ เด็กยากจนพิเศษ และเด็กที่ต้องการการคุ้มครองสวัสดิภาพเป็นกรณีพิเศษ',
    category: 'เด็กและเยาวชน',
    format: 'CSV',
    portalUrl: 'https://www.dcy.go.th',
    downloadUrl: 'https://data.go.th/dataset/dcy-vulnerable-youth/download/dcy_vulnerable_children.csv',
    apiEndpoint: 'https://dcy.go.th/opendata/api/vulnerable-children-provinces',
    updateFrequency: 'รายไตรมาส',
    schemaFields: ['province_code', 'province_name', 'vulnerable_children_count', 'foster_care_count', 'protection_orders'],
    sampleRowsCount: 77
  },

  // 2.3 กรมกิจการสตรีและสถาบันครอบครัว
  'dwf-violence-1300': {
    id: 'dwf-violence-1300',
    agencyName: 'กรมกิจการสตรีและสถาบันครอบครัว (สค.)',
    agencyTag: 'สค. (ความรุนแรง)',
    datasetTitle: 'สถิติการแจ้งเหตุความรุนแรงในครอบครัวผ่านศูนย์ช่วยเหลือสังคม 1300',
    description: 'รายงานสถิติการรับแจ้งเหตุ การให้คำปรึกษา และการส่งต่อเพื่อฟื้นฟูสัมพันธภาพในครอบครัว',
    category: 'ความรุนแรงในครอบครัว',
    format: 'XLSX',
    portalUrl: 'https://www.dwf.go.th',
    downloadUrl: 'https://data.go.th/dataset/dwf-family-crisis-helpline/download/family_crisis_stats.xlsx',
    apiEndpoint: 'https://dwf.go.th/api/open/helpline-1300-statistics',
    updateFrequency: 'รายเดือน',
    schemaFields: ['month_year', 'province', 'incident_type', 'cases_handled', 'reconciliation_success_rate'],
    sampleRowsCount: 120
  },

  // 2.3 ศคธ. ทุนชีวิต 4 มิติ
  'moral-life-capital-4pillars': {
    id: 'moral-life-capital-4pillars',
    agencyName: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    agencyTag: 'ศคธ. ทุนชีวิต',
    datasetTitle: 'ดัชนีทุนชีวิตเด็กและเยาวชน 4 มิติ (Life Capital 4 Pillars) ทั่วประเทศ',
    description: 'ผลสำรวจทุนชีวิตพลังปัญญา พลังครอบครัว พลังชุมชน และพลังสร้างสรรค์/สื่อ ในกลุ่มอายุ 12-24 ปี',
    category: 'ทุนชีวิตเยาวชน',
    format: 'CSV',
    portalUrl: 'https://moralcenter.or.th',
    downloadUrl: 'https://data.go.th/dataset/youth-life-capital-index/download/life_capital_youth_4pillars.csv',
    apiEndpoint: 'https://moralcenter.or.th/api/life-capital/four-pillars',
    updateFrequency: 'รายปี',
    schemaFields: ['pillar_key', 'pillar_name_th', 'score', 'yoy_change', 'risk_signal_level'],
    sampleRowsCount: 4
  },

  // 2.4 Data Hub APIs
  'moral-hub-catalog': {
    id: 'moral-hub-catalog',
    agencyName: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    agencyTag: 'ศคธ. Hub',
    datasetTitle: 'Data Catalog ชุดข้อมูลเปิดด้านคุณธรรม 18 รายการ (Metadata & Open Data)',
    description: 'พจนานุกรมข้อมูล (Data Dictionary) และ Metadata ของชุดข้อมูลเปิดด้านคุณธรรมตามมาตรฐาน DGA',
    category: 'Data Architecture & Hub',
    format: 'JSON',
    portalUrl: 'https://moralcenter.or.th/opendata',
    downloadUrl: 'https://data.go.th/dataset/moral-datahub-catalog/download/moral_data_catalog_all.json',
    apiEndpoint: 'https://data.go.th/api/3/action/package_show?id=moral-datahub-catalog',
    updateFrequency: 'รายเดือน',
    schemaFields: ['dataset_id', 'code', 'title', 'category', 'org', 'formats', 'updateFreq', 'recordsCount'],
    sampleRowsCount: 18
  },

  'nso-api-hub': {
    id: 'nso-api-hub',
    agencyName: 'สำนักงานสถิติแห่งชาติ',
    agencyTag: 'สถิติฯ API',
    datasetTitle: 'NSO Stat Data API v2 สถิติประชากรและสภาวะทางสังคม',
    description: 'REST API เชื่อมต่อดึงข้อมูลตัวเลขสถิติประชากร รายได้ หนี้สิน และกิจกรรมเพื่อสังคม',
    category: 'Open API',
    format: 'API',
    portalUrl: 'https://api.nso.go.th',
    downloadUrl: 'https://api.nso.go.th/v2/datasets/social-indicator/export?format=csv',
    apiEndpoint: 'https://api.nso.go.th/v2/datasets/social-indicator/export?format=csv',
    updateFrequency: 'รายไตรมาส',
    schemaFields: ['api_key', 'dataset_code', 'response_format', 'status', 'records'],
    sampleRowsCount: 300
  },

  'dmh-api-hub': {
    id: 'dmh-api-hub',
    agencyName: 'กรมสุขภาพจิต',
    agencyTag: 'DMH API',
    datasetTitle: 'DMH Mental Health Open API รายสัปดาห์',
    description: 'API ดึงสถิติผลการคัดกรองสุขภาพจิต ความเครียด และความสุขมวลรวมคนไทยแบบไม่ระบุตัวตน',
    category: 'Open API',
    format: 'API',
    portalUrl: 'https://checkin.dmh.go.th',
    downloadUrl: 'https://checkin.dmh.go.th/api/open/statistics?format=json',
    apiEndpoint: 'https://checkin.dmh.go.th/api/open/statistics?format=json',
    updateFrequency: 'เรียลไทม์ (ทุกสัปดาห์)',
    schemaFields: ['week_id', 'sample_size', 'happy_score', 'burnout_rate', 'depression_rate'],
    sampleRowsCount: 52
  },

  'nacc-ita-api-hub': {
    id: 'nacc-ita-api-hub',
    agencyName: 'สำนักงาน ป.ป.ช.',
    agencyTag: 'NACC ITA',
    datasetTitle: 'ITA Open Data API ผลคะแนนประเมินความโปร่งใสรายหน่วยงานภาครัฐ',
    description: 'API ดึงผลคะแนนการประเมินคุณธรรมและความโปร่งใสรายกระทรวง/กรม/อบต./เทศบาล',
    category: 'Open API',
    format: 'API',
    portalUrl: 'https://ita.nacc.go.th',
    downloadUrl: 'https://ita.nacc.go.th/api/v1/scores/download?format=csv',
    apiEndpoint: 'https://ita.nacc.go.th/api/v1/scores/download?format=csv',
    updateFrequency: 'รายปี',
    schemaFields: ['org_id', 'org_name', 'ministry', 'ita_overall_score', 'iit', 'eit', 'oit'],
    sampleRowsCount: 8420
  },

  'cdd-bmmn-api-hub': {
    id: 'cdd-bmmn-api-hub',
    agencyName: 'กรมการพัฒนาชุมชน',
    agencyTag: 'จปฐ. API',
    datasetTitle: 'CDD BMMN Data Exchange API ข้อมูล จปฐ. รายตำบล/หมู่บ้าน',
    description: 'API แลกเปลี่ยนข้อมูลตัวชี้วัดความจำเป็นพื้นฐานด้านคุณธรรมและความเข้มแข็งของชุมชน',
    category: 'Open API',
    format: 'API',
    portalUrl: 'https://bmmn.cdd.go.th',
    downloadUrl: 'https://bmmn.cdd.go.th/opendata/download/bmmn_annual.csv',
    apiEndpoint: 'https://bmmn.cdd.go.th/api/v2/bmmn-indicators',
    updateFrequency: 'รายปี',
    schemaFields: ['village_id', 'village_name', 'subdistrict', 'district', 'province', 'passed_indicators_pct'],
    sampleRowsCount: 74000
  },

  'ocsc-api-hub': {
    id: 'ocsc-api-hub',
    agencyName: 'สำนักงาน ก.พ.',
    agencyTag: 'OCSC API',
    datasetTitle: 'OCSC Open HR Data API สถิติวินัยและคุณธรรมข้าราชการ',
    description: 'API สถิติข้าราชการที่ผ่านการอบรมหลักสูตรจริยธรรม และรายงานคดีวินัยภาครัฐ',
    category: 'Open API',
    format: 'API',
    portalUrl: 'https://www.ocsc.go.th',
    downloadUrl: 'https://data.go.th/dataset/ocsc-ethics-hr/download/ocsc_ethics_stats.xlsx',
    apiEndpoint: 'https://opendata.ocsc.go.th/api/v1/hr-ethics',
    updateFrequency: 'รายปี',
    schemaFields: ['year', 'ministry_id', 'trained_civil_servants', 'integrity_index'],
    sampleRowsCount: 65
  },

  // 3.1 Public Insights
  'public-insights-report': {
    id: 'public-insights-report',
    agencyName: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    agencyTag: 'ศคธ.',
    datasetTitle: 'รายงานสรุปสถานการณ์คุณธรรมและทุนชีวิตคนไทยฉบับประชาชน (Annual Report Summary)',
    description: 'ชุดข้อมูลสรุปดัชนีคุณธรรม 5 ด้าน ทุนชีวิต 4 มิติ และสถิติเชิงลึกในรูปแบบเข้าใจง่ายสำหรับประชาชน',
    category: 'รายงานฉบับประชาชน',
    format: 'CSV',
    portalUrl: 'https://moralcenter.or.th',
    downloadUrl: 'https://data.go.th/dataset/moral-public-insight-report/resource/download/public_insights_summary.csv',
    apiEndpoint: 'https://moralcenter.or.th/api/public/annual-insights-feed',
    updateFrequency: 'รายปี',
    schemaFields: ['metric_title', 'metric_value', 'description', 'dimension_tag', 'year'],
    sampleRowsCount: 15
  },

  'thaihealth-wellbeing': {
    id: 'thaihealth-wellbeing',
    agencyName: 'สำนักงานกองทุนสนับสนุนการสร้างเสริมสุขภาพ (สสส.)',
    agencyTag: 'สสส.',
    datasetTitle: 'สถิติสุขภาวะทางปัญญาและดัชนีความสุขมวลรวม (Well-being Index)',
    description: 'ผลการสำรวจสุขภาวะองค์รวม การสร้างเสริมสุขภาวะทางปัญญา และกิจกรรมอาสาสมัครสร้างชาติ',
    category: 'สุขภาวะทางปัญญา',
    format: 'CSV',
    portalUrl: 'https://www.thaihealth.or.th',
    downloadUrl: 'https://data.go.th/dataset/thaihealth-wellbeing-index/download/thaihealth_wellbeing.csv',
    apiEndpoint: 'https://thaihealth.or.th/api/open/wellbeing-data',
    updateFrequency: 'รายปี',
    schemaFields: ['region', 'spiritual_health_score', 'volunteer_hours_avg', 'community_wellbeing_rate'],
    sampleRowsCount: 6
  },

  'nso-volunteer-survey': {
    id: 'nso-volunteer-survey',
    agencyName: 'สำนักงานสถิติแห่งชาติ',
    agencyTag: 'สถิติแห่งชาติ',
    datasetTitle: 'การสำรวจการมีส่วนร่วมในกิจกรรมจิตอาสาและสังคมของคนไทย',
    description: 'สถิติการร่วมกิจกรรมจิตอาสา ชั่วโมงการทำงานเพื่อสังคม และการบริจาคเพื่อสาธารณประโยชน์',
    category: 'จิตอาสาและสังคม',
    format: 'XLSX',
    portalUrl: 'https://www.nso.go.th',
    downloadUrl: 'https://catalog.nso.go.th/dataset/public-volunteer-survey/download/volunteer_survey.xlsx',
    apiEndpoint: 'https://api.nso.go.th/v2/datasets/public-volunteer-stats',
    updateFrequency: 'รายไตรมาส',
    schemaFields: ['quarter', 'age_group', 'volunteer_participation_pct', 'avg_hours_month', 'donation_baht_capita'],
    sampleRowsCount: 24
  },

  // 3.2 Public City Map
  'moral-pins-gis': {
    id: 'moral-pins-gis',
    agencyName: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    agencyTag: 'ศคธ. พิกัด',
    datasetTitle: 'พิกัด GIS เมืองคุณธรรม ชุมชน และแหล่งเรียนรู้คุณธรรมทั่วไทย',
    description: 'ข้อมูลพิกัดละติจูด/ลองจิจูด ภาพถ่าย จุดเด่น และข้อมูลติดต่อของแหล่งเรียนรู้และเมืองคุณธรรม',
    category: 'GIS & พิกัดสถานที่',
    format: 'GeoJSON',
    portalUrl: 'https://moralcenter.or.th',
    downloadUrl: 'https://data.go.th/dataset/moral-city-locations-gis/download/moral_places_coordinates.geojson',
    apiEndpoint: 'https://moralcenter.or.th/api/gis/moral-places-pins',
    updateFrequency: 'รายเดือน',
    schemaFields: ['id', 'name', 'category', 'categoryLabel', 'province', 'district', 'lat', 'lng', 'highlight', 'contact'],
    sampleRowsCount: 400
  },

  'mculture-bowon-gis': {
    id: 'mculture-bowon-gis',
    agencyName: 'กระทรวงวัฒนธรรม (ชุมชนต้นแบบ)',
    agencyTag: 'วธ.',
    datasetTitle: 'ทำเนียบพิกัดและข้อมูลชุมชนคุณธรรมพลังบวร กระทรวงวัฒนธรรม',
    description: 'ข้อมูลชุมชนคุณธรรมพลังบวร (บ้าน-วัด-โรงเรียน) และแหล่งท่องเที่ยวเชิงวัฒนธรรม',
    category: 'ชุมชนต้นแบบ',
    format: 'CSV',
    portalUrl: 'https://www.m-culture.go.th',
    downloadUrl: 'https://data.go.th/dataset/mculture-bowon-communities/download/bowon_communities.csv',
    apiEndpoint: 'https://m-culture.go.th/api/bowon-gis',
    updateFrequency: 'รายปี',
    schemaFields: ['community_code', 'community_name', 'temple_name', 'school_name', 'province', 'activity_highlight'],
    sampleRowsCount: 1200
  },

  'cdd-moral-villages': {
    id: 'cdd-moral-villages',
    agencyName: 'กรมการพัฒนาชุมชน',
    agencyTag: 'พช.',
    datasetTitle: 'ทะเบียนหมู่บ้าน OTOP นวัตวิถีและวิถีชีวิตพอเพียงคุณธรรม',
    description: 'พิกัดและข้อมูลชุมชนท่องเที่ยว OTOP นวัตวิถีที่นำหลักคุณธรรมความพอเพียงและความซื่อสัตย์มาใช้',
    category: 'การพัฒนาชุมชน',
    format: 'XLSX',
    portalUrl: 'https://cdd.go.th',
    downloadUrl: 'https://data.go.th/dataset/cdd-moral-villages/download/cdd_moral_villages.xlsx',
    apiEndpoint: 'https://cdd.go.th/opendata/api/otop-moral-villages',
    updateFrequency: 'รายปี',
    schemaFields: ['village_id', 'village_name', 'subdistrict', 'province', 'otop_products_count', 'income_per_year'],
    sampleRowsCount: 3200
  },

  'osm-geocoding-th': {
    id: 'osm-geocoding-th',
    agencyName: 'OpenStreetMap GIS',
    agencyTag: 'OSM Geocoding',
    datasetTitle: 'OpenStreetMap Thailand Administrative Boundaries & Points of Interest',
    description: 'ข้อมูลภูมิศาสตร์เปิด (Open Geographic Data) เส้นขอบเขตการปกครองและพิกัดภูมิศาสตร์ประเทศไทย',
    category: 'Open Geospatial Data',
    format: 'GeoJSON',
    portalUrl: 'https://www.openstreetmap.org',
    downloadUrl: 'https://overpass-turbo.eu/api/interpreter?data=[out:json];relation["ISO3166-1"="TH"];out;',
    apiEndpoint: 'https://overpass-api.de/api/interpreter',
    updateFrequency: 'เรียลไทม์',
    schemaFields: ['osm_id', 'name_th', 'name_en', 'admin_level', 'geometry_type', 'coordinates'],
    sampleRowsCount: 77
  },

  // 3.3 Public Open Data & Knowledge
  'moral-open-data-18': {
    id: 'moral-open-data-18',
    agencyName: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    agencyTag: 'ศคธ. Open Data',
    datasetTitle: 'ชุดข้อมูลเปิดด้านคุณธรรม 18 รายการ ตามมาตรฐาน DGA',
    description: 'บัญชีชุดข้อมูลเปิด (Open Data Catalog) ครบทั้ง 18 ชุดข้อมูลตามข้อกำหนด TOR พร้อม API ให้บริการ',
    category: 'คลังข้อมูลเปิดแห่งชาติ',
    format: 'JSON',
    portalUrl: 'https://moralcenter.or.th/opendata',
    downloadUrl: 'https://data.go.th/dataset/moral-open-data-catalog/download/open_datasets_18_all.json',
    apiEndpoint: 'https://data.go.th/api/3/action/package_search?q=moralcenter',
    updateFrequency: 'รายเดือน',
    schemaFields: ['code', 'title', 'category', 'org', 'updateFreq', 'formats', 'recordsCount', 'downloadCount'],
    sampleRowsCount: 18
  },

  'mculture-knowledge-assets': {
    id: 'mculture-knowledge-assets',
    agencyName: 'กระทรวงวัฒนธรรม',
    agencyTag: 'วธ.',
    datasetTitle: 'คลังความรู้ วารสาร และสื่อดิจิทัลวัฒนธรรมและคุณธรรมไทย',
    description: 'ดัชนีบทความวิจัย วารสารวิชาการ และสื่อความรู้ด้านคุณธรรมจริยธรรมของกระทรวงวัฒนธรรม',
    category: 'คลังความรู้และสื่อดิจิทัล',
    format: 'CSV',
    portalUrl: 'https://www.m-culture.go.th',
    downloadUrl: 'https://data.go.th/dataset/culture-knowledge-assets/download/cultural_knowledge_index.csv',
    apiEndpoint: 'https://m-culture.go.th/api/open/digital-knowledge',
    updateFrequency: 'รายเดือน',
    schemaFields: ['asset_id', 'title', 'type', 'category', 'downloads', 'published_date'],
    sampleRowsCount: 450
  },

  'dga-data-go-th': {
    id: 'dga-data-go-th',
    agencyName: 'สำนักงานพัฒนารัฐบาลดิจิทัล (สพร. / DGA)',
    agencyTag: 'DGA มาตรฐานเปิด',
    datasetTitle: 'ศูนย์กลางข้อมูลเปิดภาครัฐแห่งชาติ (Open Government Data: data.go.th)',
    description: 'พอร์ทัลข้อมูลเปิดกลางของประเทศไทยที่เชื่อมโยงชุดข้อมูลจากทุกกระทรวง ทบวง กรม ตามมาตรฐานดิจิทัล',
    category: 'Open Government Data',
    format: 'API',
    portalUrl: 'https://data.go.th',
    downloadUrl: 'https://data.go.th/api/3/action/package_search?q=คุณธรรม',
    apiEndpoint: 'https://data.go.th/api/3/action/package_search?q=คุณธรรม',
    updateFrequency: 'เรียลไทม์',
    schemaFields: ['package_id', 'title', 'maintainer', 'author', 'resources', 'tags', 'organization'],
    sampleRowsCount: 500
  },

  // 3.4 Community Portal
  'moral-community-proposals': {
    id: 'moral-community-proposals',
    agencyName: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    agencyTag: 'ศคธ. กองทุน',
    datasetTitle: 'สถิติการยื่นข้อเสนอโครงการชุมชนคุณธรรมและผลการประเมิน MCA',
    description: 'ข้อมูลโครงการชุมชนที่ยื่นขอรับการสนับสนุนงบประมาณ ผลคะแนน AI Pre-screening และสถานะการดำเนินงาน',
    category: 'ข้อเสนอโครงการชุมชน',
    format: 'CSV',
    portalUrl: 'https://moralcenter.or.th',
    downloadUrl: 'https://data.go.th/dataset/moral-community-proposals/download/community_proposals_mca.csv',
    apiEndpoint: 'https://moralcenter.or.th/api/community/proposals-pipeline',
    updateFrequency: 'รายไตรมาส',
    schemaFields: ['id', 'title', 'community', 'province', 'budgetRequested', 'dimensionFocus', 'stage', 'stageLabel', 'aiScore'],
    sampleRowsCount: 4
  },

  'codi-community-orgs': {
    id: 'codi-community-orgs',
    agencyName: 'สถาบันพัฒนาองค์กรชุมชน (พอช.)',
    agencyTag: 'พอช.',
    datasetTitle: 'ทะเบียนสภาองค์กรชุมชนตำบลและกองทุนสวัสดิการชุมชนทั่วประเทศ',
    description: 'ฐานข้อมูลเครือข่ายสภาองค์กรชุมชนตำบลกว่า 7,800 ตำบล และกองทุนสวัสดิการชุมชนวันละบาท',
    category: 'องค์กรชุมชนเข้มแข็ง',
    format: 'XLSX',
    portalUrl: 'https://web.codi.or.th',
    downloadUrl: 'https://web.codi.or.th/open-data/download/codi_organizations.xlsx',
    apiEndpoint: 'https://codi.or.th/opendata/api/community-councils',
    updateFrequency: 'รายปี',
    schemaFields: ['council_id', 'subdistrict', 'district', 'province', 'members_count', 'fund_balance_baht'],
    sampleRowsCount: 7800
  },

  'cdd-savings-groups': {
    id: 'cdd-savings-groups',
    agencyName: 'กรมการพัฒนาชุมชน',
    agencyTag: 'พช. ชุมชน',
    datasetTitle: 'ฐานข้อมูลกลุ่มออมทรัพย์เพื่อการผลิตและการส่งเสริมคุณธรรมทางการเงิน',
    description: 'สถิติกลุ่มออมทรัพย์เพื่อการผลิต การสร้างวินัยทางการเงิน และการช่วยเหลือสมาชิกในชุมชน',
    category: 'เศรษฐกิจชุมชนและวินัยการเงิน',
    format: 'CSV',
    portalUrl: 'https://cdd.go.th',
    downloadUrl: 'https://data.go.th/dataset/cdd-savings-groups/download/savings_groups.csv',
    apiEndpoint: 'https://cdd.go.th/api/open/savings-groups',
    updateFrequency: 'รายปี',
    schemaFields: ['group_id', 'village', 'subdistrict', 'province', 'savings_total_baht', 'integrity_rating'],
    sampleRowsCount: 28000
  },

  'msociety-community-family-centers': {
    id: 'msociety-community-family-centers',
    agencyName: 'กระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์',
    agencyTag: 'พม.',
    datasetTitle: 'ทะเบียนศูนย์พัฒนาครอบครัวในชุมชน (ศพค.) 7,000 แห่ง ทั่วประเทศ',
    description: 'ข้อมูลที่ตั้งและผลการดำเนินงานของศูนย์พัฒนาครอบครัวในชุมชนในการส่งเสริมคุณธรรมและความอบอุ่น',
    category: 'สถาบันครอบครัว',
    format: 'CSV',
    portalUrl: 'https://www.m-society.go.th',
    downloadUrl: 'https://data.go.th/dataset/msociety-family-development-centers/download/family_centers.csv',
    apiEndpoint: 'https://opendata.m-society.go.th/api/family-centers',
    updateFrequency: 'รายปี',
    schemaFields: ['center_id', 'center_name', 'subdistrict', 'district', 'province', 'activities_per_year'],
    sampleRowsCount: 7000
  }
};

// -------------------------------------------------------------
// HELPER LOOKUP: จับคู่ Agency Tag/Name ไปยัง Dataset อัตโนมัติ
// -------------------------------------------------------------
export function resolveAgencyDataset(tag: string, name: string): IntegratedDatasetInfo {
  // Direct tag match
  const t = (tag || '').toLowerCase().trim();
  const n = (name || '').toLowerCase().trim();

  // Match by exact key in dictionary
  for (const key of Object.keys(INTEGRATED_DATASETS_MASTER)) {
    const ds = INTEGRATED_DATASETS_MASTER[key];
    if (ds.agencyTag.toLowerCase() === t || ds.id === t) {
      return ds;
    }
  }

  // Tag heuristic matching
  if (t.includes('ศคธ') || n.includes('ศูนย์คุณธรรม')) {
    if (t.includes('พิกัด') || n.includes('พิกัด')) return INTEGRATED_DATASETS_MASTER['moral-pins-gis'];
    if (t.includes('ทุนชีวิต')) return INTEGRATED_DATASETS_MASTER['moral-life-capital-4pillars'];
    if (t.includes('hub') || t.includes('ฮับ')) return INTEGRATED_DATASETS_MASTER['moral-hub-catalog'];
    if (t.includes('open data')) return INTEGRATED_DATASETS_MASTER['moral-open-data-18'];
    if (t.includes('กองทุน')) return INTEGRATED_DATASETS_MASTER['moral-community-proposals'];
    return INTEGRATED_DATASETS_MASTER['moral-5d-national'];
  }

  if (t.includes('สถิติ') || n.includes('สถิติแห่งชาติ')) {
    if (t.includes('api')) return INTEGRATED_DATASETS_MASTER['nso-api-hub'];
    if (n.includes('แรงงาน') || n.includes('ประชากร')) return INTEGRATED_DATASETS_MASTER['nso-household-gaps'];
    return INTEGRATED_DATASETS_MASTER['nso-social-indicators'];
  }

  if (t.includes('ป.ป.ช.') || t.includes('ita') || n.includes('ป.ป.ช.')) {
    if (t.includes('api') || t.includes('ita')) return INTEGRATED_DATASETS_MASTER['nacc-ita-api-hub'];
    return INTEGRATED_DATASETS_MASTER['nacc-ita-national'];
  }

  if (t.includes('สุขภาพจิต') || t.includes('dmh') || n.includes('สุขภาพจิต')) {
    if (t.includes('api')) return INTEGRATED_DATASETS_MASTER['dmh-api-hub'];
    return INTEGRATED_DATASETS_MASTER['dmh-thai-happiness'];
  }

  if (t.includes('ก.พ.') || t.includes('ocsc') || n.includes('ก.พ.')) {
    if (t.includes('api')) return INTEGRATED_DATASETS_MASTER['ocsc-api-hub'];
    return INTEGRATED_DATASETS_MASTER['ocsc-civil-discipline'];
  }

  if (t.includes('จปฐ') || t.includes('พช') || n.includes('พัฒนาชุมชน')) {
    if (t.includes('api')) return INTEGRATED_DATASETS_MASTER['cdd-bmmn-api-hub'];
    if (t.includes('ชุมชน')) return INTEGRATED_DATASETS_MASTER['cdd-savings-groups'];
    if (t.includes('จปฐ')) return INTEGRATED_DATASETS_MASTER['cdd-bmmn-gis'];
    return INTEGRATED_DATASETS_MASTER['cdd-moral-villages'];
  }

  if (t.includes('สภาพัฒน์') || n.includes('สภาพัฒน์')) {
    if (n.includes('ห่วงโซ่') || t.includes('result')) return INTEGRATED_DATASETS_MASTER['nesdc-result-chain'];
    return INTEGRATED_DATASETS_MASTER['nesdc-social-roi'];
  }

  if (t.includes('สำนักงบ') || n.includes('สำนักงบ')) {
    return INTEGRATED_DATASETS_MASTER['bb-annual-budget'];
  }

  if (t.includes('สภาการศึกษา') || n.includes('สภาการศึกษา')) {
    if (n.includes('ช่วงวัย') || t.includes('ผู้เรียน')) return INTEGRATED_DATASETS_MASTER['onec-student-traits'];
    return INTEGRATED_DATASETS_MASTER['onec-moral-education'];
  }

  if (t.includes('มท') || n.includes('มหาดไทย')) {
    if (t.includes('ท้องถิ่น')) return INTEGRATED_DATASETS_MASTER['dla-local-gis'];
    return INTEGRATED_DATASETS_MASTER['moi-dla-moral-units'];
  }

  if (t.includes('วธ') || n.includes('วัฒนธรรม')) {
    if (t.includes('เปิด') || n.includes('เปิด')) return INTEGRATED_DATASETS_MASTER['mculture-knowledge-assets'];
    return INTEGRATED_DATASETS_MASTER['mculture-benchmarks'];
  }

  if (t.includes('ศธ') || n.includes('ศึกษาธิการ')) {
    return INTEGRATED_DATASETS_MASTER['moe-obec-schools'];
  }

  if (t.includes('ดย') || n.includes('เด็กและเยาวชน')) {
    return INTEGRATED_DATASETS_MASTER['dcy-vulnerable-youth'];
  }

  if (t.includes('สค') || n.includes('สตรีและครอบครัว') || n.includes('ความรุนแรง')) {
    if (t.includes('ความรุนแรง')) return INTEGRATED_DATASETS_MASTER['dwf-violence-1300'];
    return INTEGRATED_DATASETS_MASTER['dwf-gender-family-gap'];
  }

  if (t.includes('พม') || n.includes('สังคมและความมั่นคง')) {
    return INTEGRATED_DATASETS_MASTER['msociety-vulnerability'];
  }

  if (t.includes('สสส') || n.includes('สร้างเสริมสุขภาพ')) {
    return INTEGRATED_DATASETS_MASTER['thaihealth-wellbeing'];
  }

  if (t.includes('พอช') || n.includes('องค์กรชุมชน')) {
    return INTEGRATED_DATASETS_MASTER['codi-community-orgs'];
  }

  if (t.includes('dga') || n.includes('รัฐบาลดิจิทัล')) {
    return INTEGRATED_DATASETS_MASTER['dga-data-go-th'];
  }

  if (t.includes('osm') || t.includes('geocoding') || n.includes('openstreetmap')) {
    return INTEGRATED_DATASETS_MASTER['osm-geocoding-th'];
  }

  if (t.includes('buzz') || t.includes('nlp') || n.includes('กระแสสังคม')) {
    return INTEGRATED_DATASETS_MASTER['nlp-social-sentiment'];
  }

  // Fallback default
  return {
    id: `custom-${t || 'agency'}`,
    agencyName: name || 'หน่วยงานภาคีเครือข่าย',
    agencyTag: tag || 'Open Data',
    datasetTitle: `ชุดข้อมูลเปิดและตัวชี้วัดบูรณาการ (${name})`,
    description: `ชุดข้อมูลทางการจาก ${name} สำหรับบูรณาการวิเคราะห์ผลสัมฤทธิ์คุณธรรม`,
    category: 'Open Data',
    format: 'CSV',
    portalUrl: 'https://data.go.th',
    downloadUrl: `https://data.go.th/dataset?q=${encodeURIComponent(name || 'คุณธรรม')}`,
    apiEndpoint: `https://data.go.th/api/3/action/package_search?q=${encodeURIComponent(name || 'คุณธรรม')}`,
    updateFrequency: 'รายปี',
    schemaFields: ['id', 'indicator_code', 'value', 'updated_at'],
    sampleRowsCount: 50
  };
}
