// ----------------------------------------------------------------------------
// Central Dataset Pool & Page Synergy Mapping Service
// ----------------------------------------------------------------------------
import {
  ALL_DUCKDB_TABLES_META,
  fetchDuckDbTable,
  type DuckDbTableMeta,
  type DuckDbTableData
} from './moralDuckDbDatasetService';
import {
  fetchSqliteTableData,
  fetchSqliteDbTables,
  type SqliteTableMeta,
  type SqliteTableDataResponse
} from './pilotHackathonService';

export interface DatasetColumn {
  name: string;
  type: string;
}

export interface DatasetPoolItem {
  id: string; // e.g. 'mdc_moral_national_overview'
  name: string;
  category: string;
  sourceType: 'DuckDB' | 'SQLite' | 'External API' | 'CSV/Excel';
  sourceAgency: string;
  rowCount: number;
  columnCount: number;
  columns?: DatasetColumn[];
  linkedPageIds: string[];
  description: string;
  lastUpdated: string;
  isCustomAdded?: boolean;
}

export interface PageMetaItem {
  pageId: string;
  pageTitle: string;
  category: string;
  iconName: string;
  relatedTableNames: string[];
  description: string;
}

const STORAGE_POOL_KEY = 'mdc_central_dataset_pool_custom';
const STORAGE_LINKS_KEY = 'mdc_page_dataset_links_custom';
const POOL_CHANGE_EVENT = 'mdc_dataset_pool_changed';

// ----------------------------------------------------------------------------
// 1. Master Page-to-Table Registry (ทุกหน้าในระบบและตารางที่เกี่ยวข้อง)
// ----------------------------------------------------------------------------
export const MASTER_PAGES_REGISTRY: PageMetaItem[] = [
  {
    pageId: 'moral-analysis',
    pageTitle: 'วิเคราะห์ (ภาพรวม 20 ปี & บวร)',
    category: 'ภาพรวมยุทธศาสตร์',
    iconName: 'Network',
    relatedTableNames: [
      'mdc_moral_national_overview',
      'mdc_lifecapital_national_overview',
      'pilot_lessons_and_policies',
      'ext_traffic_fatalities'
    ],
    description: 'ภาพรวมยุทธศาสตร์ชาติ 20 ปี บวร สู่ 4 เสาหลัก และความสัมพันธ์เชิงสังเคราะห์'
  },
  {
    pageId: 'policy-1-1',
    pageTitle: 'ดัชนีคุณธรรม 5 มิติ',
    category: 'ดัชนีคุณธรรม',
    iconName: 'BarChart3',
    relatedTableNames: [
      'mdc_moral_national_overview',
      'mdc_moral_regional_breakdown',
      'mdc_moral_regional_trends',
      'mdc_moral_demographics',
      'mdc_moral_survey_samples'
    ],
    description: 'ผลสำรวจคุณธรรม 5 มิติ พอเพียง วินัยรับผิดชอบ สุจริต จิตอาสา กตัญญู'
  },
  {
    pageId: 'policy-1-2',
    pageTitle: 'ทุนชีวิต (Life Capital)',
    category: 'ทุนชีวิต',
    iconName: 'HeartHandshake',
    relatedTableNames: [
      'mdc_lifecapital_national_overview',
      'mdc_lifecapital_regional_breakdown',
      'mdc_lifecapital_assets_breakdown',
      'mdc_lifecapital_demographics',
      'mdc_lifecapital_survey_samples'
    ],
    description: 'ข้อมูลทุนชีวิต 5 พลังของเด็ก เยาวชน และครอบครัวเพื่อความมั่นคงทางจิตใจ'
  },
  {
    pageId: 'policy-national',
    pageTitle: 'จังหวัดคุณธรรม 77 จังหวัด',
    category: 'เชิงพื้นที่ระดับชาติ',
    iconName: 'MapPin',
    relatedTableNames: [
      'mdc_moral_regional_breakdown',
      'provincial_moral_survey_77',
      'pilot_4_provinces_meta'
    ],
    description: 'ข้อมูลดัชนีคุณธรรมและการประเมินเชิงพื้นที่ 77 จังหวัดทั่วประเทศไทย'
  },
  {
    pageId: 'policy-moral-lecturers',
    pageTitle: 'วิทยากรคุณธรรม',
    category: 'ทำเนียบบุคลากร',
    iconName: 'GraduationCap',
    relatedTableNames: [
      'moral_lecturers_directory',
      'moral_lecturers_provinces'
    ],
    description: 'ทำเนียบวิทยากรและผู้ทรงคุณวุฒิด้านการส่งเสริมคุณธรรมเชิงบูรณาการ'
  },
  {
    pageId: 'policy-moral-credit',
    pageTitle: 'Moral Credit (เครดิตคุณธรรม)',
    category: 'ชุมชนและสังคม',
    iconName: 'Coins',
    relatedTableNames: [
      'moral_credit_members',
      'moral_credit_raw_deeds',
      'moral_credit_top_deeds'
    ],
    description: 'บันทึกคะแนนสะสมความดี เครดิตคุณธรรมชุมชน และการแปลงค่าความดี'
  },
  {
    pageId: 'pilot-dashboard',
    pageTitle: 'กิจกรรมนำร่อง 4 ภูมิภาค',
    category: 'กิจกรรมเชิงลึก',
    iconName: 'Activity',
    relatedTableNames: [
      'pilot_hackathon_projects',
      'pilot_agency_registrations',
      'pilot_lessons_and_policies',
      'pilot_hackathon_criteria'
    ],
    description: 'กิจกรรมการลงทะเบียนหน่วยงาน กิจกรรมนำร่อง 4 จังหวัด และการถอดบทเรียน'
  },
  {
    pageId: 'pilot-vote',
    pageTitle: 'โหวตโครงการคุณธรรม (Hackathon)',
    category: 'การตัดสินและโหวต',
    iconName: 'Award',
    relatedTableNames: [
      'pilot_hackathon_projects',
      'pilot_community_votes',
      'pilot_criteria_selected_virtues'
    ],
    description: 'การเปิดรับและตัดสินโหวตโครงการนวัตกรรมคุณธรรม Hackathon รางวัลยอดเยี่ยม'
  },
  {
    pageId: 'project-tracking',
    pageTitle: 'PMS (ระบบติดตามโครงการ)',
    category: 'การบริหารโครงการ',
    iconName: 'FolderKanban',
    relatedTableNames: [
      'task_project',
      'pms_strategic_plans',
      'pms_projects',
      'pms_kpi_registry',
      'pms_meeting_reports'
    ],
    description: 'ระบบบริหารยุทธศาสตร์ โครงการตามแผนปฏิบัติการ งานย่อย และการประชุม'
  }
];

// ----------------------------------------------------------------------------
// 2. Default Central Dataset Pool Items (ชุดข้อมูลใน Pool กลาง)
// ----------------------------------------------------------------------------
const DEFAULT_CENTRAL_DATASETS: DatasetPoolItem[] = [
  // DuckDB Core Moral
  {
    id: 'mdc_moral_national_overview',
    name: 'ภาพรวมคุณธรรม 5 มิติระดับประเทศ (2565–2568)',
    category: 'คุณธรรมหลัก',
    sourceType: 'DuckDB',
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    rowCount: 4,
    columnCount: 8,
    linkedPageIds: ['moral-analysis', 'policy-1-1'],
    description: 'คะแนนเฉลี่ยคุณธรรม 5 มิติระดับประเทศ จำแนกตามปี พ.ศ. 2565–2568 (33,032 ผู้ประเมิน)',
    lastUpdated: '2026-11-01'
  },
  {
    id: 'mdc_moral_regional_breakdown',
    name: 'คุณธรรม 5 มิติจำแนกรายภูมิภาค',
    category: 'คุณธรรมหลัก',
    sourceType: 'DuckDB',
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    rowCount: 24,
    columnCount: 9,
    linkedPageIds: ['policy-1-1', 'policy-national'],
    description: 'คะแนนคุณธรรม 5 มิติจำแนกตามภูมิภาค กทม. กลาง เหนือ อีสาน ใต้',
    lastUpdated: '2026-11-01'
  },
  {
    id: 'mdc_moral_regional_trends',
    name: 'แนวโน้มการเปลี่ยนแปลงคุณธรรมรายภูมิภาค',
    category: 'คุณธรรมหลัก',
    sourceType: 'DuckDB',
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    rowCount: 24,
    columnCount: 8,
    linkedPageIds: ['policy-1-1', 'policy-national'],
    description: 'การเติบโตและแนวโน้มค่าดัชนีคุณธรรมรายภูมิภาค',
    lastUpdated: '2026-11-01'
  },
  {
    id: 'mdc_moral_demographics',
    name: 'คุณธรรมจำแนกตามประชากรศาสตร์ (เพศ/วัย/การศึกษา)',
    category: 'คุณธรรมหลัก',
    sourceType: 'DuckDB',
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    rowCount: 48,
    columnCount: 11,
    linkedPageIds: ['policy-1-1'],
    description: 'ผลสำรวจคุณธรรมจำแนกกลุ่มอายุ ระดับการศึกษา และอาชีพ',
    lastUpdated: '2026-11-01'
  },
  {
    id: 'mdc_moral_survey_samples',
    name: 'กลุ่มตัวอย่างผลสำรวจคุณธรรมรายบุคคล (Microdata)',
    category: 'คุณธรรมหลัก',
    sourceType: 'DuckDB',
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    rowCount: 100,
    columnCount: 14,
    linkedPageIds: ['policy-1-1'],
    description: 'ตัวอย่างชุดข้อมูลสำรวจระดับบุคคล สุ่มตัวอย่าง 33,032 ตัวแทนทั่วประเทศ',
    lastUpdated: '2026-11-01'
  },
  // DuckDB Life Capital
  {
    id: 'mdc_lifecapital_national_overview',
    name: 'ภาพรวมทุนชีวิต 5 พลังระดับประเทศ',
    category: 'ทุนชีวิต',
    sourceType: 'DuckDB',
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    rowCount: 4,
    columnCount: 8,
    linkedPageIds: ['moral-analysis', 'policy-1-2'],
    description: 'พลังตนเอง พลังครอบครัว พลังสร้างปัญญา พลังเพื่อนและกิจกรรม พลังชุมชน',
    lastUpdated: '2026-11-01'
  },
  {
    id: 'mdc_lifecapital_regional_breakdown',
    name: 'ทุนชีวิตจำแนกรายภูมิภาค',
    category: 'ทุนชีวิต',
    sourceType: 'DuckDB',
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    rowCount: 24,
    columnCount: 9,
    linkedPageIds: ['policy-1-2'],
    description: 'การกระจายตัวของทุนชีวิตในเด็กและเยาวชนรายภาค',
    lastUpdated: '2026-11-01'
  },
  {
    id: 'mdc_lifecapital_assets_breakdown',
    name: 'องค์ประกอบและมิติย่อยของทุนชีวิต',
    category: 'ทุนชีวิต',
    sourceType: 'DuckDB',
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    rowCount: 30,
    columnCount: 10,
    linkedPageIds: ['policy-1-2'],
    description: 'ตัวชี้วัดย่อยแต่ละด้าน เช่น ความภาคภูมิใจ การอบรมเลี้ยงดู',
    lastUpdated: '2026-11-01'
  },
  {
    id: 'mdc_lifecapital_survey_samples',
    name: 'ตัวอย่างสำรวจทุนชีวิตระดับเยาวชน',
    category: 'ทุนชีวิต',
    sourceType: 'DuckDB',
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    rowCount: 100,
    columnCount: 12,
    linkedPageIds: ['policy-1-2'],
    description: 'ข้อมูลรายบุคคลของเยาวชนผู้ตอบแบบสำรวจทุนชีวิต',
    lastUpdated: '2026-11-01'
  },
  // External Synergy Datasets
  {
    id: 'ext_traffic_fatalities',
    name: 'สถิติอุบัติเหตุจราจรและการสวมหมวกนิรภัย',
    category: 'วินัยรับผิดชอบ',
    sourceType: 'DuckDB',
    sourceAgency: 'กรมควบคุมโรค / สำนักงานตำรวจแห่งชาติ',
    rowCount: 77,
    columnCount: 8,
    linkedPageIds: ['moral-analysis', 'policy-1-1'],
    description: 'ข้อมูลผู้เสียชีวิตจากอุบัติเหตุทางถนนต่อแสนประชากร และอัตราสวมหมวกนิรภัย',
    lastUpdated: '2026-10-15'
  },
  {
    id: 'ext_corruption_cpi',
    name: 'ดัชนีการรับรู้การทุจริต (CPI) & คดี ป.ป.ช.',
    category: 'สุจริต',
    sourceType: 'DuckDB',
    sourceAgency: 'สำนักงาน ป.ป.ช. / องค์กรเพื่อความโปร่งใสนานาชาติ',
    rowCount: 77,
    columnCount: 7,
    linkedPageIds: ['moral-analysis', 'policy-1-1'],
    description: 'การประเมิน ITA รายจังหวัดและข้อร้องเรียนคดีทุจริต',
    lastUpdated: '2026-10-10'
  },
  {
    id: 'ext_volunteer_stats',
    name: 'สถิติการบริจาคและกิจกรรมจิตอาสาเพื่อสังคม',
    category: 'จิตอาสา',
    sourceType: 'DuckDB',
    sourceAgency: 'สำนักงานสถิติแห่งชาติ / ศูนย์ส่งเสริมจิตอาสา',
    rowCount: 77,
    columnCount: 8,
    linkedPageIds: ['moral-analysis', 'policy-1-1'],
    description: 'ชั่วโมงจิตอาสาเฉลี่ยต่อปี และสัดส่วนประชากรที่ร่วมกิจกรรมสาธารณะประโยชน์',
    lastUpdated: '2026-10-20'
  },
  {
    id: 'ext_family_violence',
    name: 'สถิติความอบอุ่นในครอบครัวและการดูแลผู้สูงอายุ',
    category: 'กตัญญู',
    sourceType: 'DuckDB',
    sourceAgency: 'กระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์ (พม.)',
    rowCount: 77,
    columnCount: 7,
    linkedPageIds: ['policy-1-1', 'policy-1-2'],
    description: 'อัตราการอยู่ร่วมกันของคนต่างรุ่นและความสุขในครอบครัว',
    lastUpdated: '2026-10-12'
  },
  {
    id: 'ext_environmental_air_pm25',
    name: 'คุณภาพอากาศ PM2.5 และการอนุรักษ์สิ่งแวดล้อม',
    category: 'พอเพียง',
    sourceType: 'DuckDB',
    sourceAgency: 'กรมควบคุมมลพิษ',
    rowCount: 77,
    columnCount: 6,
    linkedPageIds: ['policy-1-1'],
    description: 'จุดความร้อนและสถิติคุณภาพอากาศเฉลี่ยรายจังหวัด',
    lastUpdated: '2026-10-18'
  },
  // SQLite Pilot Hackathon
  {
    id: 'pilot_hackathon_projects',
    name: 'ข้อเสนอโครงการนวัตกรรมคุณธรรม Hackathon',
    category: 'กิจกรรม Hackathon',
    sourceType: 'SQLite',
    sourceAgency: 'ศูนย์คุณธรรม (เครือข่าย 4 ภูมิภาค)',
    rowCount: 38,
    columnCount: 16,
    linkedPageIds: ['pilot-dashboard', 'pilot-vote'],
    description: 'ข้อเสนอโครงการที่ส่งเข้าประกวด เกณฑ์คะแนน AI และสถานะการโหวต',
    lastUpdated: '2026-11-04'
  },
  {
    id: 'pilot_agency_registrations',
    name: 'ข้อมูลการลงทะเบียนผู้ร่วมกิจกรรม 3 ระดับ (pilot_agency_registrations)',
    category: 'กิจกรรม Hackathon',
    sourceType: 'SQLite',
    sourceAgency: 'ศูนย์คุณธรรม',
    rowCount: 59,
    columnCount: 24,
    linkedPageIds: ['pilot-dashboard'],
    description: 'ข้อมูลผู้ลงทะเบียนเข้าร่วมกิจกรรม 3 ระดับ (นโยบาย, ผู้ปฏิบัติการ, ประชาชน) พร้อมตำแหน่ง หน่วยงาน และกลุ่มกาแฟ (ขั้นตอนที่ 1/5)',
    lastUpdated: '2026-11-19'
  },
  {
    id: 'pilot_lessons_and_policies',
    name: 'การถอดบทเรียนและข้อเสนอเชิงนโยบาย',
    category: 'กิจกรรม Hackathon',
    sourceType: 'SQLite',
    sourceAgency: 'ศูนย์คุณธรรม',
    rowCount: 4,
    columnCount: 14,
    linkedPageIds: ['moral-analysis', 'pilot-dashboard'],
    description: 'บทเรียนความสำเร็จจากการจัดกิจกรรมนำร่อง 4 จังหวัด และการยกร่างนโยบาย',
    lastUpdated: '2026-11-04'
  },
  {
    id: 'pilot_hackathon_criteria',
    name: 'เกณฑ์การประเมินและทักษะ Agent คุณธรรม',
    category: 'กิจกรรม Hackathon',
    sourceType: 'SQLite',
    sourceAgency: 'ศูนย์คุณธรรม',
    rowCount: 4,
    columnCount: 9,
    linkedPageIds: ['pilot-dashboard', 'pilot-vote'],
    description: 'Rubric การประเมินโครงการ และ System Prompt ของ AI Evaluator',
    lastUpdated: '2026-11-03'
  },
  {
    id: 'pilot_community_votes',
    name: 'ผลการลงคะแนนและโหวตของชุมชน',
    category: 'การตัดสินและโหวต',
    sourceType: 'SQLite',
    sourceAgency: 'ระบบโหวตศูนย์คุณธรรม',
    rowCount: 42,
    columnCount: 8,
    linkedPageIds: ['pilot-vote'],
    description: 'คะแนนโหวตรายโครงการจากภาคประชาชนและคณะกรรมการ',
    lastUpdated: '2026-11-04'
  },
  // SQLite PMS
  {
    id: 'task_project',
    name: 'งานย่อยและกิจกรรมภายใต้โครงการ (PMS Tasks)',
    category: 'PMS',
    sourceType: 'SQLite',
    sourceAgency: 'กลุ่มงานยุทธศาสตร์และแผนงาน ศูนย์คุณธรรม',
    rowCount: 28,
    columnCount: 15,
    linkedPageIds: ['project-tracking'],
    description: 'รายการงานย่อย ผู้รับผิดชอบ งบประมาณ และสถานะความคืบหน้า',
    lastUpdated: '2026-11-02'
  },
  {
    id: 'pms_strategic_plans',
    name: 'แผนยุทธศาสตร์และเป้าประสงค์หลัก',
    category: 'PMS',
    sourceType: 'SQLite',
    sourceAgency: 'ศูนย์คุณธรรม',
    rowCount: 5,
    columnCount: 9,
    linkedPageIds: ['project-tracking'],
    description: 'ยุทธศาสตร์ศูนย์คุณธรรม 4 ยุทธศาสตร์หลักและตัวชี้วัดความสำเร็จ',
    lastUpdated: '2026-10-01'
  },
  // Moral Lecturers & Credit
  {
    id: 'moral_lecturers_directory',
    name: 'ทำเนียบวิทยากรและผู้เชี่ยวชาญด้านคุณธรรม',
    category: 'วิทยากรคุณธรรม',
    sourceType: 'DuckDB',
    sourceAgency: 'ศูนย์คุณธรรม',
    rowCount: 120,
    columnCount: 11,
    linkedPageIds: ['policy-moral-lecturers'],
    description: 'รายชื่อ ความเชี่ยวชาญ สังกัด และเบอร์ติดต่อของวิทยากรทั่วประเทศ',
    lastUpdated: '2026-10-25'
  },
  {
    id: 'moral_credit_members',
    name: 'สมาชิกและบัญชีเครดิตความดี (Moral Credit)',
    category: 'เครดิตคุณธรรม',
    sourceType: 'SQLite',
    sourceAgency: 'ศูนย์คุณธรรม',
    rowCount: 85,
    columnCount: 10,
    linkedPageIds: ['policy-moral-credit'],
    description: 'บัญชีสะสมคะแนนความดีและประวัติการทำกิจกรรมเพื่อสาธารณะ',
    lastUpdated: '2026-11-01'
  }
];

// ----------------------------------------------------------------------------
// 3. Central Dataset Pool Functions (CRUD & Persistence)
// ----------------------------------------------------------------------------
export function getCentralPoolDatasets(): DatasetPoolItem[] {
  if (typeof window === 'undefined') return DEFAULT_CENTRAL_DATASETS;

  try {
    const raw = localStorage.getItem(STORAGE_POOL_KEY);
    const customDatasets: DatasetPoolItem[] = raw ? JSON.parse(raw) : [];

    // Map custom links
    const linksRaw = localStorage.getItem(STORAGE_LINKS_KEY);
    const customLinks: Record<string, string[]> = linksRaw ? JSON.parse(linksRaw) : {};

    // Merge default and custom
    const baseList = [...DEFAULT_CENTRAL_DATASETS];

    // Apply custom links to existing datasets
    const merged = baseList.map((item) => {
      if (customLinks[item.id]) {
        return { ...item, linkedPageIds: Array.from(new Set([...item.linkedPageIds, ...customLinks[item.id]])) };
      }
      return item;
    });

    // Add new custom datasets
    customDatasets.forEach((custom) => {
      const existingIdx = merged.findIndex((m) => m.id === custom.id);
      if (existingIdx >= 0) {
        merged[existingIdx] = { ...merged[existingIdx], ...custom };
      } else {
        merged.push(custom);
      }
    });

    return merged;
  } catch (err) {
    console.warn('Failed to load central pool from localStorage:', err);
    return DEFAULT_CENTRAL_DATASETS;
  }
}

export function addDatasetToCentralPool(
  item: Omit<DatasetPoolItem, 'rowCount' | 'columnCount' | 'lastUpdated'> & {
    rowCount?: number;
    columnCount?: number;
    sampleRows?: any[];
  }
): DatasetPoolItem {
  const current = getCentralPoolDatasets();
  const now = new Date().toISOString().split('T')[0];

  const newItem: DatasetPoolItem = {
    id: (item.id || `custom_dataset_${Date.now()}`).trim().replace(/\s+/g, '_').toLowerCase(),
    name: item.name.trim(),
    category: item.category || 'ทั่วไป',
    sourceType: item.sourceType || 'CSV/Excel',
    sourceAgency: item.sourceAgency || 'ศูนย์คุณธรรม (นำเข้าข้อมูลเพิ่มเติม)',
    rowCount: item.rowCount || (item.sampleRows ? item.sampleRows.length : 10),
    columnCount: item.columnCount || (item.columns ? item.columns.length : 5),
    columns: item.columns || [
      { name: 'id', type: 'VARCHAR' },
      { name: 'name', type: 'VARCHAR' },
      { name: 'value', type: 'DOUBLE' },
      { name: 'created_at', type: 'DATE' }
    ],
    linkedPageIds: item.linkedPageIds || [],
    description: item.description || 'ชุดข้อมูลที่เพิ่มเข้าสู่ Pool กลาง',
    lastUpdated: now,
    isCustomAdded: true
  };

  try {
    const raw = localStorage.getItem(STORAGE_POOL_KEY);
    const customDatasets: DatasetPoolItem[] = raw ? JSON.parse(raw) : [];
    const filtered = customDatasets.filter((d) => d.id !== newItem.id);
    filtered.push(newItem);
    localStorage.setItem(STORAGE_POOL_KEY, JSON.stringify(filtered));

    window.dispatchEvent(new CustomEvent(POOL_CHANGE_EVENT, { detail: newItem }));
  } catch (err) {
    console.error('Error saving custom dataset to pool:', err);
  }

  return newItem;
}

export function linkDatasetToPage(pageId: string, datasetId: string): void {
  try {
    const linksRaw = localStorage.getItem(STORAGE_LINKS_KEY);
    const customLinks: Record<string, string[]> = linksRaw ? JSON.parse(linksRaw) : {};

    if (!customLinks[datasetId]) {
      customLinks[datasetId] = [];
    }
    if (!customLinks[datasetId].includes(pageId)) {
      customLinks[datasetId].push(pageId);
    }

    localStorage.setItem(STORAGE_LINKS_KEY, JSON.stringify(customLinks));
    window.dispatchEvent(new CustomEvent(POOL_CHANGE_EVENT));
  } catch (err) {
    console.error('Error linking dataset to page:', err);
  }
}

export function unlinkDatasetFromPage(pageId: string, datasetId: string): void {
  try {
    const linksRaw = localStorage.getItem(STORAGE_LINKS_KEY);
    const customLinks: Record<string, string[]> = linksRaw ? JSON.parse(linksRaw) : {};

    if (customLinks[datasetId]) {
      customLinks[datasetId] = customLinks[datasetId].filter((id) => id !== pageId);
      localStorage.setItem(STORAGE_LINKS_KEY, JSON.stringify(customLinks));
      window.dispatchEvent(new CustomEvent(POOL_CHANGE_EVENT));
    }
  } catch (err) {
    console.error('Error unlinking dataset from page:', err);
  }
}

export function onCentralPoolChange(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(POOL_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(POOL_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

// ----------------------------------------------------------------------------
// 4. Unified Table Data Fetcher (Handles DuckDB, SQLite & In-Memory Fallback)
// ----------------------------------------------------------------------------
export interface UnifiedTableDataResult {
  tableName: string;
  sourceType: string;
  columns: DatasetColumn[];
  rows: Record<string, any>[];
  totalRows: number;
}

export async function fetchUnifiedTableData(tableName: string): Promise<UnifiedTableDataResult> {
  // Check if DuckDB table
  const duckMeta = ALL_DUCKDB_TABLES_META.find((m) => m.tableName === tableName);
  if (duckMeta) {
    try {
      const data = await fetchDuckDbTable(tableName);
      if (data && data.rows) {
        return {
          tableName,
          sourceType: 'DuckDB',
          columns: data.columns || (data.rows.length > 0 ? Object.keys(data.rows[0]).map((k) => ({ name: k, type: 'VARCHAR' })) : []),
          rows: data.rows,
          totalRows: data.rows.length
        };
      }
    } catch (err) {
      console.warn(`Error fetching DuckDB table ${tableName}:`, err);
    }
  }

  // Try SQLite API
  try {
    const sqliteRes = await fetchSqliteTableData(tableName);
    if (sqliteRes && sqliteRes.rows) {
      return {
        tableName,
        sourceType: 'SQLite',
        columns: sqliteRes.columns.map((c) => ({ name: c.name, type: c.type })),
        rows: sqliteRes.rows,
        totalRows: sqliteRes.rows.length
      };
    }
  } catch (err) {
    console.warn(`Error fetching SQLite table ${tableName}:`, err);
  }

  // Fallback: Mock rows based on table name
  return generateFallbackTableData(tableName);
}

function generateFallbackTableData(tableName: string): UnifiedTableDataResult {
  const sampleRows: Record<string, any>[] = [];
  const provinces = ['พระนครศรีอยุธยา', 'กาฬสินธุ์', 'น่าน', 'สุราษฎร์ธานี', 'เชียงใหม่', 'ขอนแก่น', 'สงขลา'];

  for (let i = 1; i <= 15; i++) {
    sampleRows.push({
      id: `${tableName.substring(0, 4)}_${1000 + i}`,
      province_name: provinces[i % provinces.length],
      metric_name: `ตัวชี้วัดที่ ${i}`,
      score_value: +(75 + (i * 1.5) % 25).toFixed(2),
      status: i % 3 === 0 ? 'สมบูรณ์' : 'รอดำเนินการ',
      recorded_date: `2568-0${(i % 9) + 1}-15`
    });
  }

  return {
    tableName,
    sourceType: 'Central Pool',
    columns: [
      { name: 'id', type: 'VARCHAR' },
      { name: 'province_name', type: 'VARCHAR' },
      { name: 'metric_name', type: 'VARCHAR' },
      { name: 'score_value', type: 'DOUBLE' },
      { name: 'status', type: 'VARCHAR' },
      { name: 'recorded_date', type: 'DATE' }
    ],
    rows: sampleRows,
    totalRows: sampleRows.length
  };
}
