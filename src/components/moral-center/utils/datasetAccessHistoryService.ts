/**
 * datasetAccessHistoryService.ts
 * บริการจัดเก็บและติดตามประวัติวัน-เวลาการกดดูชุดข้อมูลต่างๆ (Dataset Access Timestamps & Audit Log)
 * สำหรับหน้า Synergy แต่ละด้าน
 */

export interface DatasetAccessLogItem {
  id: string;
  timestamp: string;      // e.g. "17 พ.ย. 2569, 03:45:22"
  rawTime: number;        // Epoch ms for sorting
  timeAgo: string;        // e.g. "เมื่อสักครู่"
  topicId: string;
  topicName: string;
  datasetName: string;
  tableName?: string;
  sourceAgency: string;
  category: 'internal' | 'external' | 'synergy';
  action: string;         // e.g. "กดเปิดดูชุดข้อมูล", "สลับดูตารางข้อมูล", "ดาวน์โหลด CSV"
  status: 'active' | 'logged';
}

const STORAGE_KEY = 'mdc_synergy_dataset_access_logs';

/**
 * แปลงวันที่เป็นข้อความภาษาไทยพร้อมเวลาที่แม่นยำ
 */
export function formatThaiTimestamp(date: Date = new Date()): string {
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const d = date.getDate();
  const m = thaiMonths[date.getMonth()];
  const y = date.getFullYear() + 543;
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${d} ${m} ${y}, ${hh}:${mm}:${ss} น.`;
}

/**
 * คำนวณระยะเวลาแบบสัมพันธ์ (Relative Time)
 */
export function calculateTimeAgo(timestampMs: number): string {
  const diffSec = Math.floor((Date.now() - timestampMs) / 1000);
  if (diffSec < 15) return 'เมื่อสักครู่';
  if (diffSec < 60) return `${diffSec} วินาทีที่แล้ว`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  return 'มากกว่า 1 วัน';
}

/**
 * ดึงรายการประวัติการกดดูชุดข้อมูลทั้งหมด
 */
export function getDatasetAccessLogs(): DatasetAccessLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // ตัวอย่างประวัติเริ่มต้น เพื่อให้ผู้ใช้เห็นตารางเวลาทันทีที่เปิดดู
      const seedLogs: DatasetAccessLogItem[] = [
        {
          id: 'log-seed-1',
          timestamp: formatThaiTimestamp(new Date(Date.now() - 1000 * 60 * 12)),
          rawTime: Date.now() - 1000 * 60 * 12,
          timeAgo: '12 นาทีที่แล้ว',
          topicId: 'crime',
          topicName: 'วินัยรับผิดชอบ × สถิติคดีอาญา (สตช.)',
          datasetName: 'สถิติคดีอาญาที่รัฐเป็นผู้เสียหาย (สตช.)',
          tableName: 'ext_police_crime_stats',
          sourceAgency: 'สำนักงานตำรวจแห่งชาติ (สตช.)',
          category: 'external',
          action: 'กดเปิดดูชุดข้อมูล',
          status: 'logged'
        },
        {
          id: 'log-seed-2',
          timestamp: formatThaiTimestamp(new Date(Date.now() - 1000 * 60 * 5)),
          rawTime: Date.now() - 1000 * 60 * 5,
          timeAgo: '5 นาทีที่แล้ว',
          topicId: 'crime',
          topicName: 'วินัยรับผิดชอบ × สถิติคดีอาญา (สตช.)',
          datasetName: 'คะแนนดัชนีวินัยรับผิดชอบรายจังหวัด (ศค.)',
          tableName: 'mdc_discipline_provinces',
          sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
          category: 'internal',
          action: 'สลับดูตารางข้อมูลภายใน',
          status: 'logged'
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedLogs));
      return seedLogs;
    }
    const parsed: DatasetAccessLogItem[] = JSON.parse(raw);
    return parsed.map((item) => ({
      ...item,
      timeAgo: calculateTimeAgo(item.rawTime)
    }));
  } catch (err) {
    console.error('Failed to load dataset access logs:', err);
    return [];
  }
}

/**
 * บันทึกประวัติเวลาการกดดูชุดข้อมูลใหม่
 */
export function logDatasetAccess(entry: {
  topicId: string;
  topicName: string;
  datasetName: string;
  tableName?: string;
  sourceAgency: string;
  category: 'internal' | 'external' | 'synergy';
  action?: string;
}): DatasetAccessLogItem {
  const now = Date.now();
  const newItem: DatasetAccessLogItem = {
    id: `log-${now}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: formatThaiTimestamp(new Date(now)),
    rawTime: now,
    timeAgo: 'เมื่อสักครู่',
    topicId: entry.topicId,
    topicName: entry.topicName,
    datasetName: entry.datasetName,
    tableName: entry.tableName,
    sourceAgency: entry.sourceAgency,
    category: entry.category,
    action: entry.action || 'กดเปิดดูชุดข้อมูล',
    status: 'active'
  };

  try {
    const existing = getDatasetAccessLogs();
    // ปรับสถานะรายการก่อนหน้าเป็น logged
    const updated = [
      newItem,
      ...existing.map((e) => ({ ...e, status: 'logged' as const }))
    ].slice(0, 50); // เก็บประวัติล่าสุด 50 รายการ

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save dataset access log:', err);
  }

  return newItem;
}

/**
 * ล้างประวัติเวลาการกดดูชุดข้อมูลทั้งหมด
 */
export function clearDatasetAccessLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear dataset access logs:', err);
  }
}
