/**
 * Service to load and query Local DuckDB tables for Moral Index, Life Capital, and External Datasets.
 * Data source is generated from data/moral_index_datasets.duckdb.
 */
import { GENERATED_MORAL_DUCKDB_DATA } from './generatedMoralDuckDbData';

export interface DuckDbColumn {
  name: string;
  type: string;
}

export interface DuckDbTableMeta {
  tableName: string;
  module: 'moral_index' | 'life_capital' | 'external_synergy';
  category?: 'moral_center' | 'external';
  displayName: string;
  description: string;
  icon: string;
  rowCount: number;
  sourceAgency?: string;
  sourceUrl?: string;
  directDownloadUrl?: string;
  directDownloadLabel?: string;
  synergyDimension?: string;
  columns?: DuckDbColumn[];
}

export interface DuckDbTableData extends DuckDbTableMeta {
  columns: DuckDbColumn[];
  rows: Record<string, any>[];
}

// 1. Metadata for the 5 Moral Index Tables (Ground Truth)
export const MORAL_INDEX_TABLES_META: DuckDbTableMeta[] = [
  {
    tableName: 'mdc_moral_national_overview',
    module: 'moral_index',
    category: 'moral_center',
    displayName: 'ภาพรวมระดับประเทศ (2565–2568)',
    description: 'คะแนนเฉลี่ยคุณธรรม 5 มิติระดับประเทศ จำแนกตามปี พ.ศ. 2565–2568 (33,032 ผู้ประเมิน)',
    icon: 'TrendingUp',
    rowCount: 4,
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    sourceUrl: 'https://www.moralcenter.or.th/',
    synergyDimension: 'ภาพรวม 5 มิติคุณธรรม'
  },
  {
    tableName: 'mdc_moral_regional_breakdown',
    module: 'moral_index',
    category: 'moral_center',
    displayName: 'จำแนกรายภูมิภาค',
    description: 'คะแนนคุณธรรม 5 มิติจำแนกรายภูมิภาค (กทม., กลาง, เหนือ, ตะวันออกเฉียงเหนือ, ใต้)',
    icon: 'MapPin',
    rowCount: 24,
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    sourceUrl: 'https://www.moralcenter.or.th/',
    synergyDimension: 'รายภูมิภาค 5 ภาค'
  },
  {
    tableName: 'mdc_moral_regional_trends',
    module: 'moral_index',
    category: 'moral_center',
    displayName: 'เปรียบเทียบแนวโน้มภูมิภาค',
    description: 'เปรียบเทียบแนวโน้มและการเปลี่ยนแปลงคะแนนเฉลี่ยแต่ละภูมิภาคระหว่างปี 2565 ถึง 2568',
    icon: 'BarChart3',
    rowCount: 6,
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    sourceUrl: 'https://www.moralcenter.or.th/',
    synergyDimension: 'แนวโน้มการเปลี่ยนแปลง'
  },
  {
    tableName: 'mdc_moral_gender_breakdown',
    module: 'moral_index',
    category: 'moral_center',
    displayName: 'จำแนกตามกลุ่มเพศ',
    description: 'คะแนนเฉลี่ยคุณธรรม 5 มิติจำแนกตามเพศชายและเพศหญิง',
    icon: 'Users',
    rowCount: 13,
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    sourceUrl: 'https://www.moralcenter.or.th/',
    synergyDimension: 'เพศสภาพ (ชาย, หญิง)'
  },
  {
    tableName: 'mdc_moral_age_breakdown',
    module: 'moral_index',
    category: 'moral_center',
    displayName: 'จำแนกตามช่วงวัย',
    description: 'คะแนนเฉลี่ยคุณธรรม 5 มิติจำแนกตามกลุ่มช่วงวัยประชากร (เด็ก/เยาวชน, วัยทำงาน, ผู้สูงอายุ)',
    icon: 'Calendar',
    rowCount: 12,
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    sourceUrl: 'https://www.moralcenter.or.th/',
    synergyDimension: 'กลุ่มช่วงวัยประชากร'
  }
];

// 2. Metadata for the 5 Life Capital Tables (Ground Truth)
export const LIFE_CAPITAL_TABLES_META: DuckDbTableMeta[] = [
  {
    tableName: 'mdc_lifecapital_national_overview',
    module: 'life_capital',
    category: 'moral_center',
    displayName: 'ภาพรวมทุนชีวิตระดับประเทศ',
    description: 'คะแนนเฉลี่ย 4+1 พลังทุนชีวิตระดับประเทศ จำแนกตามปี พ.ศ. 2565–2568',
    icon: 'TrendingUp',
    rowCount: 4,
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    sourceUrl: 'https://www.moralcenter.or.th/',
    synergyDimension: 'ภาพรวม 4+1 พลังทุนชีวิต'
  },
  {
    tableName: 'mdc_lifecapital_regional_breakdown',
    module: 'life_capital',
    category: 'moral_center',
    displayName: 'จำแนกทุนชีวิตรายภูมิภาค',
    description: 'คะแนนเฉลี่ยพลังทุนชีวิตจำแนกตามรายภูมิภาคและระดับคุณภาพ',
    icon: 'MapPin',
    rowCount: 24,
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    sourceUrl: 'https://www.moralcenter.or.th/',
    synergyDimension: 'รายภูมิภาค 5 ภาค'
  },
  {
    tableName: 'mdc_lifecapital_regional_trends',
    module: 'life_capital',
    category: 'moral_center',
    displayName: 'เปรียบเทียบแนวโน้มทุนชีวิต',
    description: 'เปรียบเทียบแนวโน้มและอัตราการเติบโตของทุนชีวิตแต่ละภูมิภาค พ.ศ. 2565–2568',
    icon: 'BarChart3',
    rowCount: 7,
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    sourceUrl: 'https://www.moralcenter.or.th/',
    synergyDimension: 'แนวโน้มการเติบโต'
  },
  {
    tableName: 'mdc_lifecapital_gender_breakdown',
    module: 'life_capital',
    category: 'moral_center',
    displayName: 'จำแนกทุนชีวิตตามเพศ',
    description: 'คะแนนเฉลี่ย 4+1 พลังทุนชีวิตจำแนกตามกลุ่มเพศชายและหญิง',
    icon: 'Users',
    rowCount: 12,
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    sourceUrl: 'https://www.moralcenter.or.th/',
    synergyDimension: 'เพศสภาพ (ชาย, หญิง)'
  },
  {
    tableName: 'mdc_lifecapital_age_breakdown',
    module: 'life_capital',
    category: 'moral_center',
    displayName: 'จำแนกทุนชีวิตตามช่วงวัย',
    description: 'คะแนนเฉลี่ยพลังทุนชีวิตจำแนกตามกลุ่มช่วงวัยของประชากร',
    icon: 'Calendar',
    rowCount: 12,
    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
    sourceUrl: 'https://www.moralcenter.or.th/',
    synergyDimension: 'กลุ่มช่วงวัยประชากร'
  }
];

// 3. Metadata for the 8 External Synergy Tables
export const EXTERNAL_SYNERGY_TABLES_META: DuckDbTableMeta[] = [
  {
    tableName: 'ext_traffic_accidents_provincial',
    module: 'external_synergy',
    category: 'external',
    displayName: 'อุบัติเหตุทางถนนรายจังหวัด (2568/2026)',
    description: 'สถิติผู้เสียชีวิตราย 77 จังหวัด จำแนกตามเพศ และพฤติกรรมการสวมหมวกนิรภัย (คค.–สธ.–สตช.)',
    icon: 'Car',
    rowCount: 77,
    sourceAgency: 'ศูนย์ข้อมูลอุบัติเหตุทางถนน (ThaiRSC) ร่วมกับ คค. - สธ. - สตช.',
    sourceUrl: 'https://www.thairsc.com/',
    directDownloadUrl: 'https://data.go.th/dataset/road-accidents-thailand',
    directDownloadLabel: 'ฐานข้อมูลสถิติอุบัติเหตุทางถนน (ThaiRSC / data.go.th)',
    synergyDimension: 'วินัยรับผิดชอบ / พลังเพื่อนและกิจกรรม'
  },
  {
    tableName: 'ext_police_crimes',
    module: 'external_synergy',
    category: 'external',
    displayName: 'สถิติคดีอาญา พ.ศ. 2562–2567',
    description: 'สถิติคดีอาญาจำแนกตามประเภทความผิด (ทรัพย์, ชีวิตร่างกาย, เพศ, พิเศษ) รับแจ้ง vs จับกุม (สตช.)',
    icon: 'ShieldAlert',
    rowCount: 28,
    sourceAgency: 'สำนักงานตำรวจแห่งชาติ (สตช.)',
    sourceUrl: 'https://www.royalthaipolice.go.th/',
    directDownloadUrl: 'https://www.nso.go.th/nsoweb/nso/statistics_and_indicators?impt_branch=310',
    directDownloadLabel: 'สถิติคดีอาชญากรรม สำนักงานสถิติแห่งชาติ (สสช.)',
    synergyDimension: 'วินัยรับผิดชอบ และ สุจริต / พลังชุมชน'
  },
  {
    tableName: 'ext_vulnerable_households',
    module: 'external_synergy',
    category: 'external',
    displayName: 'ครัวเรือนเปราะบางรายจังหวัด (TPMAP 2568)',
    description: 'จำนวนครัวเรือนและคนเปราะบางราย 76 จังหวัด จำแนกตามระดับความเปราะบาง 0–3 (กระทรวง พม.)',
    icon: 'Home',
    rowCount: 76,
    sourceAgency: 'กระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์ (พม.) ร่วมกับ NECTEC/สวทช.',
    sourceUrl: 'https://www.tpmap.in.th/',
    directDownloadUrl: 'https://data.go.th/dataset/dataset_10_2012',
    directDownloadLabel: 'ชุดข้อมูลครัวเรือนเปราะบาง TPMAP (data.go.th)',
    synergyDimension: 'จิตสาธารณะ และ กตัญญู / พลังครอบครัว'
  },
  {
    tableName: 'ext_elderly_health_depression',
    module: 'external_synergy',
    category: 'external',
    displayName: 'สุขภาพและภาวะซึมเศร้าผู้สูงอายุ (2567)',
    description: 'สถิติผู้สูงอายุหกล้ม ภาวะซึมเศร้า และการทำร้ายตัวเองราย 77 จังหวัด (กรมกิจการผู้สูงอายุ 2567)',
    icon: 'HeartPulse',
    rowCount: 77,
    sourceAgency: 'กรมกิจการผู้สูงอายุ (ผส.) กระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์',
    sourceUrl: 'https://www.dop.go.th/th/knowledge/6',
    directDownloadUrl: 'https://opendata.m-society.go.th/',
    directDownloadLabel: 'คลังข้อมูลและสถิติผู้สูงอายุ กรมกิจการผู้สูงอายุ (ผส.)',
    synergyDimension: 'กตัญญู / พลังตัวตน'
  },
  {
    tableName: 'ext_elderly_welfare_allowance',
    module: 'external_synergy',
    category: 'external',
    displayName: 'ผู้รับเบี้ยยังชีพผู้สูงอายุรายจังหวัด (2567)',
    description: 'สถิติผู้รับเบี้ยยังชีพผู้สูงอายุราย 78 แถว จำแนกตามกลุ่มอายุ 60–90+ ปี (สถ./พม. 2567)',
    icon: 'Coins',
    rowCount: 78,
    sourceAgency: 'กรมส่งเสริมการปกครองท้องถิ่น (สถ.) ร่วมกับ กระทรวงการพัฒนาสังคมฯ (พม.)',
    sourceUrl: 'https://opendata.m-society.go.th/',
    directDownloadUrl: 'https://www.dla.go.th/',
    directDownloadLabel: 'ระบบข้อมูลสถิติเบี้ยยังชีพผู้สูงอายุ กรมส่งเสริมการปกครองท้องถิ่น',
    synergyDimension: 'พอเพียง และ กตัญญู / พลังชุมชน'
  },
  {
    tableName: 'ext_elderly_living_arrangements',
    module: 'external_synergy',
    category: 'external',
    displayName: 'ที่พักอาศัยและบ้านมั่นคงผู้สูงอายุ (2567)',
    description: 'โครงการบ้านมั่นคงและบ้านพอเพียงเพื่อผู้สูงอายุและคนพิการรายจังหวัด (พอช. / พม. 2567)',
    icon: 'Building2',
    rowCount: 77,
    sourceAgency: 'สถาบันพัฒนาองค์กรชุมชน (พอช.) ร่วมกับ กรมส่งเสริมและพัฒนาคุณภาพชีวิตคนพิการ',
    sourceUrl: 'https://web.codi.or.th/',
    directDownloadUrl: 'https://opendata.m-society.go.th/',
    directDownloadLabel: 'สถิติโครงการบ้านมั่นคง สถาบันพัฒนาองค์กรชุมชน (องค์การมหาชน)',
    synergyDimension: 'กตัญญู / พลังครอบครัว'
  },
  {
    tableName: 'ext_demographics_age_gender',
    module: 'external_synergy',
    category: 'external',
    displayName: 'ประชากรศาสตร์ตามช่วงอายุและเพศ 2568',
    description: 'สถิติประชากรไทยรายอายุ 0–100+ ปี แยกเพศชาย–หญิง ทั่วประเทศ (สำนักบริหารการทะเบียน 2568)',
    icon: 'Users',
    rowCount: 104,
    sourceAgency: 'สำนักบริหารการทะเบียน กรมการปกครอง (ปค.) กระทรวงมหาดไทย',
    sourceUrl: 'https://stat.bora.dopa.go.th/stat/statnew/statMONTH/statmonth/',
    directDownloadUrl: 'https://stat.bora.dopa.go.th/',
    directDownloadLabel: 'สถิติประชากรทางการทะเบียน กรมการปกครอง (BORA DOPA)',
    synergyDimension: 'กลุ่มเป้าหมายเชิงนโยบาย'
  },
  {
    tableName: 'ext_bot_financial_literacy',
    module: 'external_synergy',
    category: 'external',
    displayName: 'ทักษะทางการเงินและหนี้สินครัวเรือน ธปท. (2567)',
    description: 'ระดับ Financial Literacy ความรู้ พฤติกรรม ทัศนคติทางการเงิน จำแนกตามเพศ อายุ ภาค อาชีพ (ธปท. 2567 / OECD INFE)',
    icon: 'Banknote',
    rowCount: 17,
    sourceAgency: 'ธนาคารแห่งประเทศไทย (ธปท.) ร่วมกับ สำนักงานสถิติแห่งชาติ (สสช.)',
    sourceUrl: 'https://www.bot.or.th/th/research-and-publications/articles-and-publications/financial-literacy-survey.html',
    directDownloadUrl: 'https://www.bot.or.th/',
    directDownloadLabel: 'รายงานผลการสำรวจทักษะทางการเงินของไทย ธนาคารแห่งประเทศไทย',
    synergyDimension: 'พอเพียง / พลังสร้างปัญญา'
  },
  {
    tableName: 'ext_ita_regional_evaluation',
    module: 'external_synergy',
    category: 'external',
    displayName: 'การประเมินคุณธรรมและความโปร่งใส (ITA) รายจังหวัด (2568)',
    description: 'ผลการประเมิน ITA ราย 77 จังหวัด จำแนกตามอันดับ คะแนนเฉลี่ย และระดับผลการประเมิน (สำนักงาน ป.ป.ช. 2568)',
    icon: 'ShieldAlert',
    rowCount: 78,
    sourceAgency: 'สำนักงานคณะกรรมการป้องกันและปราบปรามการทุจริตแห่งชาติ (ป.ป.ช.)',
    sourceUrl: 'https://itas.nacc.go.th/',
    directDownloadUrl: 'https://itas.nacc.go.th/',
    directDownloadLabel: 'ระบบประเมินคุณธรรมและความโปร่งใส ITA (สำนักงาน ป.ป.ช.)',
    synergyDimension: 'สุจริต และ วินัยรับผิดชอบ / พลังสร้างปัญญา และ พลังชุมชน'
  },
  {
    tableName: 'ext_household_debt_regional',
    module: 'external_synergy',
    category: 'external',
    displayName: 'หนี้สินเฉลี่ยต่อครัวเรือนและวัตถุประสงค์การกู้ยืมรายจังหวัด (2566–2568)',
    description: 'สถิติหนี้สินเฉลี่ยต่อครัวเรือน 77 จังหวัด จำแนกตามวัตถุประสงค์ (ที่อยู่อาศัย, การศึกษา, อุปโภคบริโภค) และหนี้ใน/นอกระบบ (สสช.)',
    icon: 'Banknote',
    rowCount: 154,
    sourceAgency: 'สำนักงานสถิติแห่งชาติ (สสช.) กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม',
    sourceUrl: 'https://www.nso.go.th/',
    directDownloadUrl: 'https://data.go.th/',
    directDownloadLabel: 'สถิติการสำรวจภาวะเศรษฐกิจและสังคมของครัวเรือน (สสช. / data.go.th)',
    synergyDimension: 'พอเพียง และ วินัยรับผิดชอบ / พลังสร้างปัญญา'
  },
  {
    tableName: 'ext_environment_waste_management',
    module: 'external_synergy',
    category: 'external',
    displayName: 'การจัดการขยะมูลฝอยและสิ่งแวดล้อมชุมชน 77 จังหวัด (2567–2568)',
    description: 'สถิติปริมาณขยะมูลฝอย อัตราการคัดแยกขยะต้นทาง ธนาคารขยะชุมชน และการจัดการขยะเปียกลดโลกร้อน (คพ.–สถ.)',
    icon: 'Recycle',
    rowCount: 77,
    sourceAgency: 'กรมควบคุมมลพิษ (คพ.) ร่วมกับ กรมส่งเสริมการปกครองท้องถิ่น (สถ.)',
    sourceUrl: 'https://www.pcd.go.th/',
    directDownloadUrl: 'https://data.go.th/dataset/waste-management-local-thailand',
    directDownloadLabel: 'สถิติการจัดการขยะมูลฝอยชุมชน กรมควบคุมมลพิษ (data.go.th)',
    synergyDimension: 'พอเพียง / สิ่งแวดล้อมชุมชน'
  },
  {
    tableName: 'ext_youth_mental_health',
    module: 'external_synergy',
    category: 'external',
    displayName: 'สุขภาพจิตวัยรุ่นและสถิติสายด่วน 1323 (2567–2568)',
    description: 'สถิติการให้บริการปรึกษาสายด่วนสุขภาพจิต 1323 จำแนกตามภูมิภาค ปัญหาความเครียด และดัชนีพลังฟื้นฟูจิตใจ (RQ) (กรมสุขภาพจิต สธ.)',
    icon: 'HeartPulse',
    rowCount: 18,
    sourceAgency: 'กรมสุขภาพจิต กระทรวงสาธารณสุข ร่วมกับ สำนักบริหารการทะเบียน',
    sourceUrl: 'https://www.dmh.go.th/',
    directDownloadUrl: 'https://data.go.th/dataset/youth-mental-health-survey',
    directDownloadLabel: 'สถิติสุขภาพจิตวัยรุ่นและสายด่วน 1323 กรมสุขภาพจิต',
    synergyDimension: 'พลังตัวตน / ทุนชีวิตเยาวชน'
  }
];

// All table metadata list
export const ALL_DUCKDB_TABLES_META: DuckDbTableMeta[] = [
  ...MORAL_INDEX_TABLES_META,
  ...LIFE_CAPITAL_TABLES_META,
  ...EXTERNAL_SYNERGY_TABLES_META
];

const cache = new Map<string, DuckDbTableData>();

/**
 * Fetch table dataset from bundled DuckDB data or API / static mirror.
 */
export async function fetchDuckDbTable(tableName: string): Promise<DuckDbTableData | null> {
  if (cache.has(tableName)) {
    return cache.get(tableName)!;
  }

  // Priority 1: Instant zero-latency bundled dataset from DuckDB
  if (GENERATED_MORAL_DUCKDB_DATA && GENERATED_MORAL_DUCKDB_DATA[tableName]) {
    const bundled = GENERATED_MORAL_DUCKDB_DATA[tableName];
    cache.set(tableName, bundled);
    return bundled;
  }

  // Priority 2: Try public static json without /data/ prefix
  try {
    const res = await fetch(`/duckdb_tables/${tableName}.json`);
    if (res.ok) {
      const data: DuckDbTableData = await res.json();
      cache.set(tableName, data);
      return data;
    }
  } catch (_e) {
    // Continue to next fallback
  }

  // Priority 3: Try Vite backend API
  try {
    const res = await fetch(`/api/duckdb/table?name=${encodeURIComponent(tableName)}`);
    if (res.ok) {
      const data: DuckDbTableData = await res.json();
      cache.set(tableName, data);
      return data;
    }
  } catch (err) {
    console.warn(`Error loading DuckDB table ${tableName}:`, err);
  }

  return null;
}

/**
 * Export table data to CSV format and trigger download.
 */
export function exportTableToCsv(tableName: string, data: DuckDbTableData): void {
  if (!data || !data.rows || data.rows.length === 0) return;

  const rawHeaders = data.columns.map((c) => c.name);
  const displayHeaders = rawHeaders.map((h) => (h === 'สัดส่วน (%)' || h === 'สัดส่วน' ? 'สัดส่วนผู้ประเมิน (%)' : h));
  const csvLines: string[] = [];

  // UTF-8 BOM so Excel on Windows recognizes Thai text properly
  csvLines.push(displayHeaders.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  data.rows.forEach((row) => {
    const line = rawHeaders.map((h) => {
      let val = row[h];
      if (val === undefined && h.includes('สัดส่วน')) {
        val = row['สัดส่วนผู้ประเมิน (%)'] ?? row['สัดส่วน (%)'];
      }
      const strVal = val !== undefined && val !== null ? String(val) : '';
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvLines.push(line.join(','));
  });

  const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tableName}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
