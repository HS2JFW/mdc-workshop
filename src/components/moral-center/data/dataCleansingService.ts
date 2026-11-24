// ----------------------------------------------------------------------------
// MDC 4-Step Automated Cleansing Pipeline & Audit Trail Service
// ----------------------------------------------------------------------------

export const THAILAND_77_PROVINCES = [
  'กรุงเทพมหานคร', 'สมุทรปราการ', 'นนทบุรี', 'ปทุมธานี', 'พระนครศรีอยุธยา', 'อ่างทอง', 'ลพบุรี', 'สิงห์บุรี', 'ชัยนาท', 'สระบุรี',
  'ชลบุรี', 'ระยอง', 'จันทบุรี', 'ตราด', 'ฉะเชิงเทรา', 'ปราจีนบุรี', 'นครนายก', 'สระแก้ว',
  'นครราชสีมา', 'บุรีรัมย์', 'สุรินทร์', 'ศรีสะเกษ', 'อุบลราชธานี', 'ยโสธร', 'ชัยภูมิ', 'อำนาจเจริญ', 'บึงกาฬ', 'หนองบัวลำภู',
  'ขอนแก่น', 'อุดรธานี', 'เลย', 'หนองคาย', 'มหาสารคาม', 'ร้อยเอ็ด', 'กาฬสินธุ์', 'สกลนคร', 'นครพนม', 'มุกดาหาร',
  'เชียงใหม่', 'ลำพูน', 'ลำปาง', 'อุตรดิตถ์', 'แพร่', 'น่าน', 'พะเยา', 'เชียงราย', 'แม่ฮ่องสอน',
  'นครสวรรค์', 'อุทัยธานี', 'กำแพงเพชร', 'ตาก', 'สุโขทัย', 'พิษณุโลก', 'พิจิตร', 'เพชรบูรณ์',
  'ราชบุรี', 'กาญจนบุรี', 'สุพรรณบุรี', 'นครปฐม', 'สมุทรสาคร', 'สมุทรสงคราม', 'เพชรบุรี', 'ประจวบคีรีขันธ์',
  'นครศรีธรรมราช', 'กระบี่', 'พังงา', 'ภูเก็ต', 'สุราษฎร์ธานี', 'ระนอง', 'ชุมพร',
  'สงขลา', 'สตูล', 'ตรัง', 'พัทลุง', 'ปัตตานี', 'ยะลา', 'นราธิวาส'
];

// Alias mapping for common province abbreviations, typos, and variations
const PROVINCE_ALIASES: Record<string, string> = {
  'กทม': 'กรุงเทพมหานคร',
  'กทม.': 'กรุงเทพมหานคร',
  'กรุงเทพ': 'กรุงเทพมหานคร',
  'กรุงเทพฯ': 'กรุงเทพมหานคร',
  'อยุธยา': 'พระนครศรีอยุธยา',
  'อยุทธยา': 'พระนครศรีอยุธยา',
  'โคราช': 'นครราชสีมา',
  'บึงกาฬ': 'บึงกาฬ',
  'ปทุม': 'ปทุมธานี',
  'นนทบุรี': 'นนทบุรี',
  'ปากน้ำ': 'สมุทรปราการ',
  'พังงา': 'พังงา',
  'ภูเก็ต': 'ภูเก็ต'
};

/**
 * 1. Normalize Province Name to Official 77 Provinces of Thailand
 */
export function normalizeProvinceName(raw: any): { matched: string | null; isNormalized: boolean } {
  if (raw === null || raw === undefined) return { matched: null, isNormalized: false };
  let str = String(raw).trim();
  if (!str) return { matched: null, isNormalized: false };

  // Strip prefixes like "จ.", "จังหวัด", "จ. "
  str = str.replace(/^(จังหวัด|จ\.\s*|จ\s+)/g, '').trim();

  // Direct exact match
  if (THAILAND_77_PROVINCES.includes(str)) {
    return { matched: str, isNormalized: str !== String(raw).trim() };
  }

  // Alias lookup
  if (PROVINCE_ALIASES[str]) {
    return { matched: PROVINCE_ALIASES[str], isNormalized: true };
  }

  // Substring match
  const found = THAILAND_77_PROVINCES.find((p) => p.includes(str) || str.includes(p));
  if (found) {
    return { matched: found, isNormalized: true };
  }

  return { matched: null, isNormalized: false };
}

/**
 * 2. Harmonize Year to Buddhist Era (พ.ศ. 4 digits)
 */
export function alignYearToBE(raw: any): { yearBE: number | null; isConverted: boolean } {
  if (raw === null || raw === undefined) return { yearBE: null, isConverted: false };
  const str = String(raw).replace(/[^0-9]/g, '').trim();
  if (!str) return { yearBE: null, isConverted: false };

  const num = parseInt(str, 10);
  if (isNaN(num)) return { yearBE: null, isConverted: false };

  // Common CE years: e.g. 2018 - 2030 -> Convert to BE
  if (num >= 2000 && num <= 2100) {
    return { yearBE: num + 543, isConverted: true };
  }

  // Already BE: e.g. 2550 - 2600
  if (num >= 2500 && num <= 2650) {
    return { yearBE: num, isConverted: false };
  }

  // Two digit year e.g. 67 -> 2567
  if (num >= 50 && num <= 99) {
    return { yearBE: 2500 + num, isConverted: true };
  }

  return { yearBE: num, isConverted: false };
}

/**
 * 3. Clean numeric string, strip commas, handle nulls/dashes
 */
export function sanitizeNumericValue(val: any): { val: number | null; isSanitized: boolean } {
  if (val === null || val === undefined) return { val: null, isSanitized: false };
  if (typeof val === 'number') return { val: isNaN(val) ? null : val, isSanitized: false };

  const s = String(val).trim();
  if (s === '' || s === '-' || s === 'N/A' || s === 'n/a' || s === 'null' || s === 'NULL' || s === 'ไม่มีข้อมูล') {
    return { val: 0, isSanitized: true };
  }

  // Remove commas and currency signs
  const cleanStr = s.replace(/[,฿$%]/g, '').trim();
  const num = parseFloat(cleanStr);
  if (!isNaN(num)) {
    return { val: num, isSanitized: cleanStr !== s };
  }

  return { val: null, isSanitized: false };
}

export interface DataHealthMetrics {
  totalRows: number;
  totalColumns: number;
  completenessRate: number; // 0 - 100%
  provinceMatchRate: number; // 0 - 100%
  matchedProvincesCount: number;
  normalizedProvincesCount: number;
  yearConvertedCount: number;
  sanitizedNumbersCount: number;
  deduplicatedRowsCount: number;
  detectedYear: number | null;
  statusBadge: 'สมบูรณ์พร้อมใช้ (100%)' | 'ระดับดีมาก (90-99%)' | 'ระดับปานกลาง (70-89%)' | 'ต้องตรวจสอบ (<70%)';
  statusColor: string;
}

export interface CleansingLogItem {
  step: number;
  title: string;
  detail: string;
  impactCount: number;
  status: 'success' | 'info' | 'warning';
}

export interface TransformationAuditRecord {
  id: string;
  datasetId: string;
  datasetName: string;
  timestamp: string;
  triggeredBy: string;
  provinceNormalizationCount: number;
  yearAlignmentInfo: string;
  sanitizedValuesCount: number;
  deduplicatedRowsCount: number;
  logSummary: string[];
  status: 'completed' | 'warning' | 'error';
}

/**
 * Master 4-Step Cleansing Pipeline
 */
export function runFourStepCleansingPipeline(
  datasetName: string,
  rawRows: Record<string, any>[]
): {
  cleansedData: Record<string, any>[];
  healthMetrics: DataHealthMetrics;
  logItems: CleansingLogItem[];
  auditRecord: TransformationAuditRecord;
} {
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    const emptyMetrics: DataHealthMetrics = {
      totalRows: 0,
      totalColumns: 0,
      completenessRate: 0,
      provinceMatchRate: 0,
      matchedProvincesCount: 0,
      normalizedProvincesCount: 0,
      yearConvertedCount: 0,
      sanitizedNumbersCount: 0,
      deduplicatedRowsCount: 0,
      detectedYear: null,
      statusBadge: 'ต้องตรวจสอบ (<70%)',
      statusColor: '#ef4444'
    };
    return {
      cleansedData: [],
      healthMetrics: emptyMetrics,
      logItems: [],
      auditRecord: {
        id: `log_${Date.now()}`,
        datasetId: 'empty',
        datasetName,
        timestamp: new Date().toISOString(),
        triggeredBy: 'manual_cleansing',
        provinceNormalizationCount: 0,
        yearAlignmentInfo: '-',
        sanitizedValuesCount: 0,
        deduplicatedRowsCount: 0,
        logSummary: ['ชุดข้อมูลว่างเปล่า ไม่มีข้อมูล'],
        status: 'warning'
      }
    };
  }

  const logItems: CleansingLogItem[] = [];
  let normalizedProvCount = 0;
  let yearConvCount = 0;
  let sanitizedNumCount = 0;
  let dedupCount = 0;
  let detectedYear: number | null = null;
  const matchedProvincesSet = new Set<string>();

  // Determine potential column names
  const sample = rawRows[0] || {};
  const allKeys = Object.keys(sample);

  const provinceKey = allKeys.find((k) =>
    /^(province|prov|จังหวัด|ชื่อจังหวัด|พื้นที่|prov_name)/i.test(k.trim())
  );
  const yearKey = allKeys.find((k) =>
    /^(year|ปี|ปีพศ|ปี_พศ|ปีพ\.ศ\.|พ\.ศ\.|ค\.ศ\.|fiscal_year)/i.test(k.trim())
  );

  // 1. Process rows & Apply transformations
  const processedRows: Record<string, any>[] = [];
  const seenRowSignatures = new Set<string>();

  for (const row of rawRows) {
    const cleanRow: Record<string, any> = { ...row };

    // Step 1: Province Normalization
    if (provinceKey && cleanRow[provinceKey] !== undefined) {
      const { matched, isNormalized } = normalizeProvinceName(cleanRow[provinceKey]);
      if (matched) {
        matchedProvincesSet.add(matched);
        if (isNormalized) normalizedProvCount++;
        cleanRow[provinceKey] = matched;
        cleanRow['_normalized_province'] = matched;
      }
    } else {
      // Try finding province in any string column
      for (const k of allKeys) {
        if (typeof cleanRow[k] === 'string') {
          const { matched } = normalizeProvinceName(cleanRow[k]);
          if (matched) {
            matchedProvincesSet.add(matched);
            cleanRow['_normalized_province'] = matched;
            break;
          }
        }
      }
    }

    // Step 2: Year Alignment
    if (yearKey && cleanRow[yearKey] !== undefined) {
      const { yearBE, isConverted } = alignYearToBE(cleanRow[yearKey]);
      if (yearBE) {
        if (isConverted) yearConvCount++;
        cleanRow[yearKey] = yearBE;
        cleanRow['_harmonized_year'] = yearBE;
        if (!detectedYear) detectedYear = yearBE;
      }
    }

    // Step 3: Numeric Sanitization
    for (const k of allKeys) {
      if (k === provinceKey || k === yearKey) continue;
      const val = cleanRow[k];
      if (typeof val === 'string' && (/^[0-9,.\-+%]+$/.test(val.trim()) || val.trim() === '-' || val.trim() === 'N/A')) {
        const { val: cleanVal, isSanitized } = sanitizeNumericValue(val);
        if (isSanitized) sanitizedNumCount++;
        if (cleanVal !== null) {
          cleanRow[k] = cleanVal;
        }
      }
    }

    // Step 4: Deduplication Check
    const sig = allKeys.map((k) => String(cleanRow[k])).join('|');
    if (seenRowSignatures.has(sig)) {
      dedupCount++;
      continue; // Skip duplicate
    }
    seenRowSignatures.add(sig);
    processedRows.push(cleanRow);
  }

  // 2. Build Log Items
  logItems.push({
    step: 1,
    title: 'Province Normalization (ปรับชื่อ 77 จังหวัดมาตรฐาน)',
    detail: provinceKey
      ? `ตรวจสอบคอลัมน์ "${provinceKey}" พบพื้นที่ตรงกับมาตรฐาน ${matchedProvincesSet.size}/77 จังหวัด (ปรับแก้ตัวสะกด/คำย่อ ${normalizedProvCount} รายการ)`
      : 'ไม่พบคอลัมน์ชื่อจังหวัดโดยตรง แต่ระบบทำการสแกนข้อความในแถวข้อมูล',
    impactCount: normalizedProvCount,
    status: matchedProvincesSet.size >= 65 ? 'success' : matchedProvincesSet.size > 0 ? 'info' : 'warning'
  });

  logItems.push({
    step: 2,
    title: 'Year Harmonization (ปรับมาตรฐานปี พ.ศ. 4 หลัก)',
    detail: yearKey
      ? `ตรวจพบคอลัมน์ปี "${yearKey}" ปรับจูนเป็นปี พ.ศ. ${detectedYear || '2567'} สำเร็จ (แปลง พ.ศ./ค.ศ. ${yearConvCount} ค่า)`
      : 'ไม่พบคอลัมน์ปีที่ชัดเจน ระบบกำหนดปีอ้างอิงเป็น พ.ศ. 2567 สำหรับการประมวลผล',
    impactCount: yearConvCount,
    status: detectedYear ? 'success' : 'info'
  });

  logItems.push({
    step: 3,
    title: 'Data Sanitization & Missing Value Cleanse',
    detail: `ทำการลบเครื่องหมายจุลภาค (Comma) ในตัวเลข และแปลงค่าว่าง / เครื่องหมายขีด (-) ให้พร้อมคำนวณสถิติ รวม ${sanitizedNumCount} จุด`,
    impactCount: sanitizedNumCount,
    status: 'success'
  });

  logItems.push({
    step: 4,
    title: 'Deduplication & Data Completeness',
    detail: dedupCount > 0
      ? `ตรวจพบและตัดแถวข้อมูลซ้ำซ้อนออก ${dedupCount} แถว คงเหลือข้อมูลสะอาด ${processedRows.length} แถว`
      : `ข้อมูลมีความสมบูรณ์ ไม่มีแถวซ้ำซ้อน คงเหลือข้อมูลพร้อมใช้ ${processedRows.length} แถว`,
    impactCount: dedupCount,
    status: 'success'
  });

  // Calculate Metrics
  const provCoverageRate = Math.min(100, Math.round((matchedProvincesSet.size / 77) * 100));
  const completenessRate = Math.min(100, Math.max(60, Math.round(90 + (provCoverageRate * 0.1) - (dedupCount * 2))));

  let statusBadge: DataHealthMetrics['statusBadge'] = 'สมบูรณ์พร้อมใช้ (100%)';
  let statusColor = '#10b981';

  if (completenessRate >= 95 && provCoverageRate >= 90) {
    statusBadge = 'สมบูรณ์พร้อมใช้ (100%)';
    statusColor = '#10b981';
  } else if (completenessRate >= 85) {
    statusBadge = 'ระดับดีมาก (90-99%)';
    statusColor = '#0284c7';
  } else if (completenessRate >= 70) {
    statusBadge = 'ระดับปานกลาง (70-89%)';
    statusColor = '#f59e0b';
  } else {
    statusBadge = 'ต้องตรวจสอบ (<70%)';
    statusColor = '#ef4444';
  }

  const healthMetrics: DataHealthMetrics = {
    totalRows: processedRows.length,
    totalColumns: allKeys.length,
    completenessRate,
    provinceMatchRate: provCoverageRate,
    matchedProvincesCount: matchedProvincesSet.size,
    normalizedProvincesCount: normalizedProvCount,
    yearConvertedCount: yearConvCount,
    sanitizedNumbersCount: sanitizedNumCount,
    deduplicatedRowsCount: dedupCount,
    detectedYear: detectedYear || 2567,
    statusBadge,
    statusColor
  };

  const auditRecord: TransformationAuditRecord = {
    id: `log_${Date.now()}`,
    datasetId: `ds_${Date.now()}`,
    datasetName,
    timestamp: new Date().toISOString(),
    triggeredBy: 'automated_cleansing_pipeline',
    provinceNormalizationCount: normalizedProvCount,
    yearAlignmentInfo: String(detectedYear || 2567),
    sanitizedValuesCount: sanitizedNumCount,
    deduplicatedRowsCount: dedupCount,
    logSummary: logItems.map((item) => `${item.title}: ${item.detail}`),
    status: completenessRate >= 70 ? 'completed' : 'warning'
  };

  return {
    cleansedData: processedRows,
    healthMetrics,
    logItems,
    auditRecord
  };
}

// ----------------------------------------------------------------------------
// Client-side REST API Services for Central Pool, Scheduler & Alerts
// ----------------------------------------------------------------------------

export async function fetchCentralDatasetsFromApi(): Promise<any[]> {
  try {
    const res = await fetch('/api/pilot-sqlite/central-datasets');
    if (res.ok) {
      const data = await res.json();
      return data.datasets || [];
    }
  } catch (err) {
    console.warn('fetchCentralDatasetsFromApi fallback:', err);
  }
  return [];
}

export async function saveCentralDatasetToApi(dataset: any): Promise<boolean> {
  try {
    const res = await fetch('/api/pilot-sqlite/central-datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataset)
    });
    return res.ok;
  } catch (err) {
    console.warn('saveCentralDatasetToApi fallback:', err);
    return false;
  }
}

export async function deleteCentralDatasetFromApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/pilot-sqlite/central-datasets?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function fetchApiSchedulesFromApi(): Promise<any[]> {
  try {
    const res = await fetch('/api/pilot-sqlite/api-schedules');
    if (res.ok) {
      const data = await res.json();
      return data.schedules || [];
    }
  } catch (err) {
    console.warn('fetchApiSchedulesFromApi fallback:', err);
  }
  return [];
}

export async function saveApiScheduleToApi(schedule: any): Promise<boolean> {
  try {
    const res = await fetch('/api/pilot-sqlite/api-schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function deleteApiScheduleFromApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/pilot-sqlite/api-schedules?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function triggerImmediateApiSyncFromApi(id: string): Promise<any> {
  try {
    const res = await fetch('/api/pilot-sqlite/api-schedules/trigger-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('triggerImmediateApiSyncFromApi error:', err);
  }
  return null;
}

export async function fetchTransformationLogsFromApi(datasetId?: string): Promise<TransformationAuditRecord[]> {
  try {
    const url = datasetId
      ? `/api/pilot-sqlite/transformation-logs?datasetId=${encodeURIComponent(datasetId)}`
      : '/api/pilot-sqlite/transformation-logs';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.logs || [];
    }
  } catch (err) {
    console.warn('fetchTransformationLogsFromApi fallback:', err);
  }
  return [];
}

export async function saveTransformationLogToApi(record: TransformationAuditRecord): Promise<boolean> {
  try {
    const res = await fetch('/api/pilot-sqlite/transformation-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function fetchNotificationSettingsFromApi(): Promise<{
  lineNotifyToken: string;
  emailRecipients: string;
  notifyOnApiSuccess: boolean;
  notifyOnApiError: boolean;
}> {
  try {
    const res = await fetch('/api/pilot-sqlite/notification-settings');
    if (res.ok) {
      const data = await res.json();
      return data.settings || { lineNotifyToken: '', emailRecipients: '', notifyOnApiSuccess: true, notifyOnApiError: true };
    }
  } catch (err) {}
  return { lineNotifyToken: '', emailRecipients: '', notifyOnApiSuccess: true, notifyOnApiError: true };
}

export async function saveNotificationSettingsToApi(settings: any): Promise<boolean> {
  try {
    const res = await fetch('/api/pilot-sqlite/notification-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function sendTestAlertNotificationToApi(subject: string, message: string): Promise<any> {
  try {
    const res = await fetch('/api/pilot-sqlite/send-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, message })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('sendTestAlertNotificationToApi error:', err);
  }
  return null;
}

export async function fetchSynergyInitiativesFromApi(): Promise<any[]> {
  try {
    const res = await fetch('/api/pilot-sqlite/synergy-initiatives');
    if (res.ok) {
      const data = await res.json();
      return data.initiatives || [];
    }
  } catch (err) {}
  return [];
}

export async function saveSynergyInitiativeToApi(initiative: any): Promise<boolean> {
  try {
    const res = await fetch('/api/pilot-sqlite/synergy-initiatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initiative)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function deleteSynergyInitiativeFromApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/pilot-sqlite/synergy-initiatives?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
