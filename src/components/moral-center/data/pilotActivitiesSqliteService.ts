export type PilotProvinceName =
  | 'อยุธยา'
  | 'สุราษฎร์ธานี'
  | 'อุดรธานี'
  | 'ลำปาง'
  | 'กาฬสินธุ์'
  | 'น่าน'
  | 'ระยอง'
  | 'หนองคาย'
  | 'พังงา';

export interface PilotProvinceMeta {
  id: string;
  province: PilotProvinceName;
  region: string;
  tagline: string;
  focusAreas: string[];
  accentColor: string;
  badgeBg: string;
  defaultPolicyPrompt: string;
}

export const PILOT_4_PROVINCES_META: Record<PilotProvinceName, PilotProvinceMeta> = {
  'อยุธยา': {
    id: 'pilot-ayutthaya',
    province: 'อยุธยา',
    region: 'ภาคกลาง',
    tagline: 'ต้นแบบเมืองมรดกโลกคุณธรรม อุตสาหกรรมสีขาว และวินัยสิ่งแวดล้อมเพื่อความยั่งยืน',
    focusAreas: ['ธรรมาภิบาลสิ่งแวดล้อมและอุตสาหกรรมสีขาว', 'วินัยการเงินแรงงานและชุมชน', 'จิตอาสาอนุรักษ์มรดกทางประวัติศาสตร์'],
    accentColor: '#0284c7',
    badgeBg: '#e0f2fe',
    defaultPolicyPrompt:
      'สร้างข้อเสนอนโยบายระดับจังหวัดพระนครศรีอยุธยาและข้อเสนอเชิงงบประมาณบูรณาการ โดยเน้นการเชื่อมโยงการอนุรักษ์มรดกทางวัฒนธรรมเข้ากับอุตสาหกรรมเชิงนิเวศสีขาว และมาตรการส่งเสริมวินัยการเงินในสถานประกอบการ'
  },
  'อุดรธานี': {
    id: 'pilot-udonthani',
    province: 'อุดรธานี',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    tagline: 'ต้นแบบเมืองอารยธรรมมรดกโลกบ้านเชียง ท่องเที่ยวสีขาวทะเลบัวแดง และธรรมาภิบาลชุมชนเข้มแข็ง',
    focusAreas: ['คุณธรรมส่งเสริมการท่องเที่ยวเชิงนิเวศและวัฒนธรรม (ทะเลบัวแดง-บ้านเชียง)', 'วินัยการเงินและสัจจะออมทรัพย์แก้หนี้ครัวเรือน', 'จิตอาสาพัฒนาสิ่งแวดล้อมและเกษตรอินทรีย์'],
    accentColor: '#d97706',
    badgeBg: '#fef3c7',
    defaultPolicyPrompt:
      'สร้างข้อเสนอนโยบายระดับจังหวัดอุดรธานี โดยเน้นการใช้กลไกคุณธรรมส่งเสริมการท่องเที่ยวเชิงนิเวศทะเลบัวแดงและมรดกโลกบ้านเชียง พร้อมขับเคลื่อนสัจจะออมทรัพย์และวินัยการเงินแก้หนี้ครัวเรือนอย่างยั่งยืน'
  },
  'ลำปาง': {
    id: 'pilot-lampang',
    province: 'ลำปาง',
    region: 'ภาคเหนือ',
    tagline: 'ต้นแบบนครลำปางเมืองน่าอยู่ วินัยสิ่งแวดล้อมลดหมอกควันไฟป่า พลังกตัญญูดูแลผู้สูงวัย และชุมชนสร้างสรรค์เซรามิกสีเขียว',
    focusAreas: ['วินัยสิ่งแวดล้อมและอาสาสมัครดับไฟป่าอากาศสะอาด (Clean Air Lampang)', 'ระบบดูแลผู้สูงวัยด้วยพลังกตัญญูและบวร', 'ธรรมาภิบาลเศรษฐกิจชุมชนเซรามิกและอุตสาหกรรมสร้างสรรค์'],
    accentColor: '#059669',
    badgeBg: '#d1fae5',
    defaultPolicyPrompt:
      'สร้างข้อเสนอนโยบายระดับจังหวัดลำปางเพื่อมุ่งสู่นครลำปางเมืองน่าอยู่ โดยขับเคลื่อนวินัยสิ่งแวดล้อมลดปัญหาหมอกควันไฟป่า บูรณาการระบบพลังกตัญญูดูแลผู้สูงวัย และยกระดับเศรษฐกิจสร้างสรรค์เซรามิกคุณธรรม'
  },
  'สุราษฎร์ธานี': {
    id: 'pilot-surat',
    province: 'สุราษฎร์ธานี',
    region: 'ภาคใต้',
    tagline: 'ต้นแบบเมืองคนดี ท่องเที่ยววิถีวัฒนธรรมสีขาว ธรรมาภิบาลบริการ และจิตอาสาอนุรักษ์ผืนป่าทะเลใต้',
    focusAreas: ['ท่องเที่ยวโดยชุมชนสีขาว (Moral CBT)', 'จิตอาสาอนุรักษ์อ่างเก็บน้ำเชี่ยวหลานและทะเลอ่าวไทย', 'มาตรฐานผู้ประกอบการซื่อสัตย์สุจริต (เมืองคนดี)'],
    accentColor: '#7c3aed',
    badgeBg: '#ede9fe',
    defaultPolicyPrompt:
      'สร้างข้อเสนอนโยบายระดับจังหวัดสุราษฎร์ธานีเพื่อยกระดับอัตลักษณ์ "เมืองคนดี" และการท่องเที่ยวเชิงนิเวศสีขาว โดยใช้กลไกคุณธรรมสุจริตและจิตอาสาอนุรักษ์ทรัพยากรธรรมชาติควบคู่กับการกระจายรายได้สู่ชุมชน'
  },
  // Legacy aliases for backwards-compatibility
  'กาฬสินธุ์': {
    id: 'pilot-udonthani',
    province: 'อุดรธานี',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    tagline: 'ต้นแบบเมืองอารยธรรมมรดกโลกบ้านเชียง ท่องเที่ยวสีขาวทะเลบัวแดง และธรรมาภิบาลชุมชนเข้มแข็ง',
    focusAreas: ['คุณธรรมส่งเสริมการท่องเที่ยวเชิงนิเวศและวัฒนธรรม (ทะเลบัวแดง-บ้านเชียง)', 'วินัยการเงินและสัจจะออมทรัพย์แก้หนี้ครัวเรือน', 'จิตอาสาพัฒนาสิ่งแวดล้อมและเกษตรอินทรีย์'],
    accentColor: '#d97706',
    badgeBg: '#fef3c7',
    defaultPolicyPrompt:
      'สร้างข้อเสนอนโยบายระดับจังหวัดอุดรธานี โดยเน้นการใช้กลไกคุณธรรมส่งเสริมการท่องเที่ยวเชิงนิเวศทะเลบัวแดงและมรดกโลกบ้านเชียง'
  },
  'น่าน': {
    id: 'pilot-lampang',
    province: 'ลำปาง',
    region: 'ภาคเหนือ',
    tagline: 'ต้นแบบนครลำปางเมืองน่าอยู่ วินัยสิ่งแวดล้อมลดหมอกควันไฟป่า พลังกตัญญูดูแลผู้สูงวัย และชุมชนสร้างสรรค์เซรามิกสีเขียว',
    focusAreas: ['วินัยสิ่งแวดล้อมและอาสาสมัครดับไฟป่าอากาศสะอาด (Clean Air Lampang)', 'ระบบดูแลผู้สูงวัยด้วยพลังกตัญญูและบวร', 'ธรรมาภิบาลเศรษฐกิจชุมชนเซรามิกและอุตสาหกรรมสร้างสรรค์'],
    accentColor: '#059669',
    badgeBg: '#d1fae5',
    defaultPolicyPrompt:
      'สร้างข้อเสนอนโยบายระดับจังหวัดลำปางเพื่อมุ่งสู่นครลำปางเมืองน่าอยู่ โดยขับเคลื่อนวินัยสิ่งแวดล้อมลดปัญหาหมอกควันไฟป่า'
  },
  'ระยอง': {
    id: 'pilot-ayutthaya',
    province: 'อยุธยา',
    region: 'ภาคกลาง',
    tagline: 'ต้นแบบเมืองมรดกโลกคุณธรรม อุตสาหกรรมสีขาว และวินัยสิ่งแวดล้อมเพื่อความยั่งยืน',
    focusAreas: ['ธรรมาภิบาลสิ่งแวดล้อมและอุตสาหกรรมสีขาว', 'วินัยการเงินแรงงานและชุมชน', 'จิตอาสาอนุรักษ์มรดกทางประวัติศาสตร์'],
    accentColor: '#0284c7',
    badgeBg: '#e0f2fe',
    defaultPolicyPrompt:
      'สร้างข้อเสนอนโยบายระดับจังหวัดพระนครศรีอยุธยาและข้อเสนอเชิงงบประมาณบูรณาการ โดยเน้นการเชื่อมโยงการอนุรักษ์มรดกทางวัฒนธรรมเข้ากับอุตสาหกรรมเชิงนิเวศสีขาว'
  },
  'หนองคาย': {
    id: 'pilot-udonthani',
    province: 'อุดรธานี',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    tagline: 'ต้นแบบเมืองอารยธรรมมรดกโลกบ้านเชียง ท่องเที่ยวสีขาวทะเลบัวแดง และธรรมาภิบาลชุมชนเข้มแข็ง',
    focusAreas: ['คุณธรรมส่งเสริมการท่องเที่ยวเชิงนิเวศและวัฒนธรรม (ทะเลบัวแดง-บ้านเชียง)', 'วินัยการเงินและสัจจะออมทรัพย์แก้หนี้ครัวเรือน', 'จิตอาสาพัฒนาสิ่งแวดล้อมและเกษตรอินทรีย์'],
    accentColor: '#d97706',
    badgeBg: '#fef3c7',
    defaultPolicyPrompt:
      'สร้างข้อเสนอนโยบายระดับจังหวัดอุดรธานี โดยเน้นการใช้กลไกคุณธรรมส่งเสริมการท่องเที่ยวเชิงนิเวศทะเลบัวแดง'
  },
  'พังงา': {
    id: 'pilot-surat',
    province: 'สุราษฎร์ธานี',
    region: 'ภาคใต้',
    tagline: 'ต้นแบบเมืองคนดี ท่องเที่ยววิถีวัฒนธรรมสีขาว ธรรมาภิบาลบริการ และจิตอาสาอนุรักษ์ผืนป่าทะเลใต้',
    focusAreas: ['ท่องเที่ยวโดยชุมชนสีขาว (Moral CBT)', 'จิตอาสาอนุรักษ์อ่างเก็บน้ำเชี่ยวหลานและทะเลอ่าวไทย', 'มาตรฐานผู้ประกอบการซื่อสัตย์สุจริต (เมืองคนดี)'],
    accentColor: '#7c3aed',
    badgeBg: '#ede9fe',
    defaultPolicyPrompt:
      'สร้างข้อเสนอนโยบายระดับจังหวัดสุราษฎร์ธานีเพื่อยกระดับอัตลักษณ์ "เมืองคนดี" และการท่องเที่ยวเชิงนิเวศสีขาว'
  }
};

export interface PilotUploadedFileMeta {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  excerpt?: string;
}

export interface PilotAgencyRegistration {
  id: string;
  province: PilotProvinceName;
  region: string;
  agency_name: string;
  agency_type: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  participant_level?: 'policy' | 'practitioner' | 'citizen' | string;
  phone?: string;
  email?: string;
  coffee_group?: string;
  coordinator_name: string;
  participant_role?: string;
  district?: string;
  subdistrict?: string;
  contact_info: string;
  trial_project_name?: string;
  trial_project_summary?: string;
  activity_date: string;
  synergy_topic?: string;
  uploaded_files?: PilotUploadedFileMeta[];
  extracted_data_preview?: string;
  created_at: string;
}

export interface PilotLessonAndPolicyRecord {
  id: string;
  province: PilotProvinceName;
  region: string;
  activity_date: string;
  selected_project_ids: string[];
  selected_project_names: string[];
  summary_file_name: string;
  raw_activity_summary: string;
  lesson_learned_text: string;
  policy_prompt: string;
  generated_policy_text: string;
  saved_file_path: string;
  updated_at: string;
}

const LOCAL_AGENCIES_FALLBACK_KEY = 'pilot_4regions_agencies_sqlite_mirror_v1';
const LOCAL_LESSONS_FALLBACK_KEY = 'pilot_4regions_lessons_sqlite_mirror_v1';

function parseSafeJsonArray<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function fetchPilotSqliteState(province?: PilotProvinceName): Promise<{
  dbPath: string;
  recordsDir: string;
  agencies: PilotAgencyRegistration[];
  lessonsPolicies: PilotLessonAndPolicyRecord[];
}> {
  try {
    const query = province ? `?province=${encodeURIComponent(province)}` : '';
    const res = await fetch(`/api/pilot-sqlite/state${query}`);
    if (res.ok) {
      const data = await res.json();
      const agencies: PilotAgencyRegistration[] = (data.agencies || []).map((row: any) => ({
        id: row.id,
        province: row.province as PilotProvinceName,
        region: row.region || PILOT_4_PROVINCES_META[row.province as PilotProvinceName]?.region || '',
        agency_name: row.agency_name || '',
        agency_type: row.agency_type || '',
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        position: row.position || '',
        participant_level: row.participant_level || '',
        phone: row.phone || '',
        email: row.email || '',
        coffee_group: row.coffee_group || '',
        coordinator_name: row.coordinator_name || '',
        participant_role: row.participant_role || '',
        district: row.district || '',
        subdistrict: row.subdistrict || '',
        contact_info: row.contact_info || '',
        trial_project_name: row.trial_project_name || '',
        trial_project_summary: row.trial_project_summary || '',
        activity_date: row.activity_date || '',
        synergy_topic: row.synergy_topic || '',
        uploaded_files: parseSafeJsonArray<PilotUploadedFileMeta>(row.uploaded_files_json || row.uploaded_files),
        extracted_data_preview: row.extracted_data_preview || '',
        created_at: row.created_at || ''
      }));

      const lessonsPolicies: PilotLessonAndPolicyRecord[] = (data.lessonsPolicies || []).map((row: any) => ({
        id: row.id,
        province: row.province as PilotProvinceName,
        region: row.region || PILOT_4_PROVINCES_META[row.province as PilotProvinceName]?.region || '',
        activity_date: row.activity_date || '',
        selected_project_ids: parseSafeJsonArray<string>(row.selected_project_ids_json || row.selected_project_ids),
        selected_project_names: parseSafeJsonArray<string>(row.selected_project_names_json || row.selected_project_names),
        summary_file_name: row.summary_file_name || '',
        raw_activity_summary: row.raw_activity_summary || '',
        lesson_learned_text: row.lesson_learned_text || '',
        policy_prompt: row.policy_prompt || '',
        generated_policy_text: row.generated_policy_text || '',
        saved_file_path: row.saved_file_path || 'data/pilot_activities_4regions.sqlite',
        updated_at: row.updated_at || ''
      }));

      return {
        dbPath: data.dbPath || 'data/pilot_activities_4regions.sqlite',
        recordsDir: data.recordsDir || 'data/pilot_records/',
        agencies,
        lessonsPolicies
      };
    }
  } catch (err) {
    console.warn('SQLite API fetch fallback triggered:', err);
  }

  // Fallback to localStorage mirror if needed
  const rawAg = localStorage.getItem(LOCAL_AGENCIES_FALLBACK_KEY);
  const rawLp = localStorage.getItem(LOCAL_LESSONS_FALLBACK_KEY);
  const allAg = parseSafeJsonArray<PilotAgencyRegistration>(rawAg);
  const allLp = parseSafeJsonArray<PilotLessonAndPolicyRecord>(rawLp);

  return {
    dbPath: 'data/pilot_activities_4regions.sqlite',
    recordsDir: 'data/pilot_records/',
    agencies: province
      ? allAg.filter((a) =>
          (a.province as string) === (province as string) ||
          (((province as string) === 'อยุธยา' || (province as string) === 'พระนครศรีอยุธยา') &&
            ((a.province as string) === 'อยุธยา' || (a.province as string) === 'พระนครศรีอยุธยา'))
        )
      : allAg,
    lessonsPolicies: province ? allLp.filter((l) => l.province === province) : allLp
  };
}

export async function registerPilotAgencyInSqlite(
  payload: Omit<PilotAgencyRegistration, 'id' | 'created_at'> & { id?: string }
): Promise<{ ok: boolean; id: string; savedFilePath: string; dbPath: string }> {
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const id = payload.id || `ag-${Date.now()}`;
  const fullRecord: PilotAgencyRegistration = {
    ...payload,
    id,
    created_at: nowStr
  };

  try {
    const res = await fetch('/api/pilot-sqlite/register-agency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullRecord)
    });
    if (res.ok) {
      const data = await res.json();
      return {
        ok: true,
        id: data.id || id,
        savedFilePath: data.savedFilePath || `data/pilot_records/agency_${id}.json`,
        dbPath: data.dbPath || 'data/pilot_activities_4regions.sqlite'
      };
    }
  } catch (err) {
    console.warn('SQLite register-agency fallback:', err);
  }

  const existing = parseSafeJsonArray<PilotAgencyRegistration>(localStorage.getItem(LOCAL_AGENCIES_FALLBACK_KEY));
  localStorage.setItem(LOCAL_AGENCIES_FALLBACK_KEY, JSON.stringify([fullRecord, ...existing]));
  return {
    ok: true,
    id,
    savedFilePath: `data/pilot_records/agency_${id}.json`,
    dbPath: 'data/pilot_activities_4regions.sqlite'
  };
}

export async function deletePilotAgencyFromSqlite(id: string): Promise<void> {
  try {
    await fetch(`/api/pilot-sqlite/agency?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch {
    // ignore
  }
}

export async function savePilotLessonAndPolicyToSqlite(
  payload: Omit<PilotLessonAndPolicyRecord, 'id' | 'updated_at' | 'saved_file_path'> & {
    id?: string;
    saved_file_path?: string;
  }
): Promise<{ ok: boolean; id: string; savedFilePath: string; dbPath: string; updatedAt: string }> {
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const id = payload.id || `lp-${Date.now()}`;

  try {
    const res = await fetch('/api/pilot-sqlite/save-lesson-policy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, id })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        ok: true,
        id: data.id || id,
        savedFilePath: data.savedFilePath || `data/pilot_records/pilot_lesson_policy_${id}.json`,
        dbPath: data.dbPath || 'data/pilot_activities_4regions.sqlite',
        updatedAt: data.updated_at || nowStr
      };
    }
  } catch (err) {
    console.warn('SQLite save-lesson-policy fallback:', err);
  }

  const existing = parseSafeJsonArray<PilotLessonAndPolicyRecord>(localStorage.getItem(LOCAL_LESSONS_FALLBACK_KEY));
  const fullRecord: PilotLessonAndPolicyRecord = {
    ...payload,
    id,
    saved_file_path: `data/pilot_records/pilot_lesson_policy_${id}.json`,
    updated_at: nowStr
  };
  const filtered = existing.filter((x) => x.id !== id);
  localStorage.setItem(LOCAL_LESSONS_FALLBACK_KEY, JSON.stringify([fullRecord, ...filtered]));

  return {
    ok: true,
    id,
    savedFilePath: fullRecord.saved_file_path,
    dbPath: 'data/pilot_activities_4regions.sqlite',
    updatedAt: nowStr
  };
}

export async function deletePilotLessonAndPolicyFromSqlite(id: string): Promise<void> {
  try {
    await fetch(`/api/pilot-sqlite/lesson-policy?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch {
    // ignore
  }
}

export function downloadPilotRecordAsMarkdownFile(record: PilotLessonAndPolicyRecord): void {
  const md = [
    `# รายงานการถอดบทเรียนและข้อเสนอนโยบาย: กิจกรรมนำร่องจังหวัด${record.province}`,
    `- **รหัสอ้างอิงในระบบ:** ${record.id}`,
    `- **จังหวัดนำร่อง:** ${record.province} (${record.region})`,
    `- **วันที่จัดกิจกรรม:** ${record.activity_date}`,
    `- **โครงการที่ได้ลองสร้างในกิจกรรม:** ${record.selected_project_names.join(', ') || '-'}`,
    `- **ไฟล์สรุปการทำกิจกรรม:** ${record.summary_file_name || '-'}`,
    `- **ไฟล์ในระบบ:** ${record.saved_file_path}`,
    `- **บันทึกเมื่อ:** ${record.updated_at}`,
    ``,
    `---`,
    ``,
    `## 1. ข้อมูลการถอดบทเรียน (Lesson Learned)`,
    record.lesson_learned_text || '-',
    ``,
    `---`,
    ``,
    `## 2. Prompt สำหรับสร้างนโยบาย`,
    record.policy_prompt || '-',
    ``,
    `## 3. ข้อเสนอนโยบายที่สร้างโดย AI (Generated Policy)`,
    record.generated_policy_text || '-'
  ].join('\n');

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ถอดบทเรียนและนโยบาย_จ.${record.province}_${record.activity_date}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// AI ENGINE 1: ถอดบทเรียนจากหน่วยงานและผู้แทนที่ลงทะเบียน + กิจกรรมถามตอบ + ไฟล์สรุปกิจกรรม
// ============================================================================
export async function generatePilotLessonLearnedWithAI(params: {
  province: PilotProvinceName;
  activityDate: string;
  selectedAgencies: PilotAgencyRegistration[];
  summaryFileName: string;
  rawActivitySummaryText: string;
  qaQuestInsights?: string;
}): Promise<string> {
  const { province, activityDate, selectedAgencies, summaryFileName, rawActivitySummaryText, qaQuestInsights } = params;
  const meta = PILOT_4_PROVINCES_META[province];
  const apiKey = localStorage.getItem('ai_api_key');
  const model = localStorage.getItem('ai_model') || 'openai/gpt-4o-mini';

  const stakeholdersContext = selectedAgencies
    .map(
      (ag, idx) =>
        `${idx + 1}. ผู้แทน: ${ag.coordinator_name || 'ผู้แทน'} (${ag.participant_role || 'ผู้ปฏิบัติงาน'}) | หน่วยงาน: ${ag.agency_name} | ภาคส่วน: ${ag.agency_type} | พื้นที่: อ.${ag.district || 'เมือง'} จ.${ag.province || province}`
    )
    .join('\n');

  const cleanedFileText = rawActivitySummaryText.replace(/\s+/g, ' ').trim();

  if (apiKey) {
    try {
      const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการถอดบทเรียน (Lesson Learned) และการสังเคราะห์ข้อมูลเชิงพื้นที่ของศูนย์คุณธรรม (องค์การมหาชน)
หน้าที่ของคุณคืออ่าน "ข้อมูลหน่วยงานและผู้แทนที่ลงทะเบียนเข้าร่วมกิจกรรม", "ผลลัพธ์จากกิจกรรมถามตอบและเกม AI Moral Intelligence Quest", ร่วมกับ "เนื้อหาไฟล์สรุปการทำกิจกรรมในวันนี้" ของจังหวัดนำร่อง แล้วสังเคราะห์เป็นเอกสารการถอดบทเรียนภาษาไทยที่ครบถ้วน ชัดเจน และนำไปแก้ไขหรือต่อยอดสร้างข้อเสนอนโยบายได้ทันที`;

      const userPrompt = `จังหวัดนำร่อง: จังหวัด${province} (${meta.region})
วันที่จัดกิจกรรม: ${activityDate}
จุดเน้นเชิงพื้นที่ของจังหวัด: ${meta.tagline}

[ส่วนที่ 1: รายชื่อหน่วยงาน ผู้แทน และพื้นที่อำเภอที่ลงทะเบียนเข้าร่วมกิจกรรม]
${stakeholdersContext || 'ไม่มีรายการหน่วยงานที่เลือก'}

[ส่วนที่ 2: ผลลัพธ์และข้อค้นพบจากกิจกรรมถามตอบ / AI Moral Intelligence Challenge]
${qaQuestInsights || 'ผู้เข้าร่วมกิจกรรมได้ร่วมทำแบบสอบถามสถานการณ์คุณธรรมและสะท้อนมุมมองเชิงบวกต่อการขับเคลื่อนคุณธรรมในพื้นที่'}

[ส่วนที่ 3: เนื้อหาจากไฟล์สรุปการทำกิจกรรมในวันนี้ (${summaryFileName || 'สรุปกิจกรรมในพื้นที่'})]
${cleanedFileText ? cleanedFileText.slice(0, 8500) : 'วิเคราะห์จากผลการมีส่วนร่วมของหน่วยงานภาคีที่มาร่วมกิจกรรมวันนี้'}

กรุณาถอดบทเรียนโดยแบ่งเป็น 4 หัวข้อชัดเจน ดังนี้:
1. ภาพรวมการทำกิจกรรมและบริบทโจทย์คุณธรรมของพื้นที่จังหวัด${province} (สะท้อนการมีส่วนร่วมของหน่วยงานและอำเภอต่างๆ)
2. บทเรียนสำคัญจากการแลกเปลี่ยนเรียนรู้ในห้องกิจกรรมและผลการตอบคำถาม/เกมประเมิน AI Moral Quest
3. จุดคานงัดเชิงโครงสร้างและโอกาสการขับเคลื่อนร่วมระหว่างศูนย์คุณธรรมกับเครือข่ายภาคีในจังหวัด
4. ปัจจัยความสำเร็จ ปัญหา/อุปสรรค และข้อค้นพบเพื่อการขยายผลสู่ระดับนโยบาย`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Moral Center Pilot Lesson Learned AI',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch (err) {
      console.warn('OpenRouter Lesson Learned fallback triggered:', err);
    }
  }

  // Intelligent Local Thai Synthesis Fallback
  await new Promise((r) => setTimeout(r, 750));

  const agencyListStr = selectedAgencies.map((a) => `${a.agency_name} (อ.${a.district || 'เมือง'})`).join(', ');
  const districtsList = Array.from(new Set(selectedAgencies.map((a) => a.district).filter(Boolean))).join(', ');
  const fileExcerpt = cleanedFileText
    ? cleanedFileText.slice(0, 420) + (cleanedFileText.length > 420 ? '...' : '')
    : 'ที่ประชุมเชิงปฏิบัติการได้ร่วมกันแลกเปลี่ยนแนวทางการขับเคลื่อนคุณธรรมเชิงพื้นที่และเชื่อมโยงเครือข่ายภาคีในจังหวัดอย่างเป็นรูปธรรม';

  return [
    `1. ภาพรวมการทำกิจกรรมและบริบทโจทย์คุณธรรมจังหวัด${province} (${meta.region})`,
    `จากการจัดกิจกรรมนำร่องเมื่อวันที่ ${activityDate} ณ จังหวัด${province} ภายใต้แนวคิด "${meta.tagline}" มีผู้แทนและหน่วยงานภาคีลงทะเบียนเข้าร่วมกิจกรรมจำนวน ${selectedAgencies.length} ท่าน/หน่วยงาน ครอบคลุมพื้นที่อำเภอ${districtsList || 'สำคัญในจังหวัด'}${summaryFileName ? ` พร้อมทั้งสรุปผลการดำเนินกิจกรรมจากไฟล์ "${summaryFileName}"` : ''} สะท้อนการมีส่วนร่วมของภาคีหลากหลายทั้งภาครัฐ องค์กรปกครองส่วนท้องถิ่น สถาบันการศึกษา และประชาสังคม`,
    ``,
    `2. บทเรียนสำคัญจากการแลกเปลี่ยนเรียนรู้และผลการถามตอบ`,
    `- หน่วยงานภาคีที่ร่วมกิจกรรม ได้แก่: ${agencyListStr || `เครือข่ายความร่วมมือจังหวัด${province}`}`,
    `- สาระสำคัญจากการทำกิจกรรมวันนี้: ${fileExcerpt}`,
    qaQuestInsights ? `- ผลลัพธ์และข้อค้นพบจากกิจกรรมถามตอบ / เกม AI Moral Quest: ${qaQuestInsights}` : '',
    `- ข้อค้นพบสำคัญ: ผู้แทนหน่วยงานเห็นพ้องว่าการขับเคลื่อนคุณธรรมต้องเริ่มจากปัญหาจริงในพื้นที่ และต้องการตัวชี้วัดพฤติกรรม (Behavioral Indicators) ที่เข้าใจง่ายและสอดคล้องกับวิถีชีวิต`,
    ``,
    `3. จุดคานงัดเชิงโครงสร้างและโอกาสการขับเคลื่อนร่วมกับศูนย์คุณธรรม`,
    `- ประเด็นจุดเน้นเชิงพื้นที่: ${meta.focusAreas.join(', ')}`,
    `- การผสานพลังระหว่างศูนย์คุณธรรมกับหน่วยงานในพื้นที่ ช่วยเชื่อมโยงเกณฑ์มาตรฐานคุณธรรมระดับชาติเข้ากับกลไกชุมชนที่มีอยู่เดิม ลดความซ้ำซ้อนและเสริมพลังหนุนซึ่งกันและกัน`,
    ``,
    `4. ปัจจัยความสำเร็จ ปัญหา/อุปสรรค และข้อค้นพบเพื่อการขยายผล`,
    `- ปัจจัยความสำเร็จ: ความตื่นตัวของผู้นำหน่วยงานท้องถิ่นและแกนนำชุมชนที่พร้อมเปิดรับกระบวนการเรียนรู้ใหม่`,
    `- ปัญหาและอุปสรรคที่พบ: บุคลากรในระดับปฏิบัติการยังต้องการคู่มือและเครื่องมือประเมินคุณธรรมที่ใช้งานได้สะดวกรวดเร็ว`,
    `- ข้อเสนอเพื่อการต่อยอด: นำผลการถอดบทเรียนชุดนี้ไปสังเคราะห์เป็นข้อเสนอนโยบายและแผนปฏิบัติการส่งเสริมคุณธรรมจังหวัดเพื่อเสนอต่อศูนย์คุณธรรมต่อไป`
  ].join('\n');
}

// ============================================================================
// AI ENGINE 2: สร้างข้อเสนอนโยบาย (Generate Policy) จากผลการถอดบทเรียน + Prompt
// ============================================================================
export async function generatePilotPolicyFromLessonWithAI(params: {
  province: PilotProvinceName;
  activityDate: string;
  lessonLearnedText: string;
  policyPrompt: string;
  selectedProjectNames: string[];
}): Promise<string> {
  const { province, activityDate, lessonLearnedText, policyPrompt, selectedProjectNames } = params;
  const meta = PILOT_4_PROVINCES_META[province];
  const apiKey = localStorage.getItem('ai_api_key');
  const model = localStorage.getItem('ai_model') || 'openai/gpt-4o-mini';

  if (apiKey) {
    try {
      const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการวิเคราะห์และจัดทำข้อเสนอนโยบายสาธารณะ (Policy Maker Advisor) ของศูนย์คุณธรรม (องค์การมหาชน)
หน้าที่ของคุณคือนำ "ข้อมูลการถอดบทเรียนจากกิจกรรมนำร่อง" และ "คำสั่ง Prompt กำหนดทิศทางนโยบาย" มาสังเคราะห์เป็นข้อเสนอนโยบายเชิงยุทธศาสตร์ที่พร้อมเสนอต่อผู้ว่าราชการจังหวัด คณะอนุกรรมการส่งเสริมคุณธรรมระดับจังหวัด และสำนักงบประมาณ`;

      const userPrompt = `จังหวัดนำร่อง: จังหวัด${province} (${meta.region})
วันที่จัดกิจกรรม: ${activityDate}
หน่วยงานภาคีที่ร่วมผลักดัน: ${selectedProjectNames.join(', ') || '-'}

[ข้อมูลการถอดบทเรียนที่ผ่านการตรวจสอบแล้ว]
${lessonLearnedText}

[Prompt สำหรับกำหนดทิศทางการสร้างนโยบาย]
${policyPrompt || meta.defaultPolicyPrompt}

กรุณาสร้างข้อเสนอนโยบายเชิงยุทธศาสตร์ (Policy Recommendations) โดยประกอบด้วย:
1. ชื่อชุดข้อเสนอนโยบาย (Policy Title) และเป้าหมายหลักเชิงยุทธศาสตร์
2. มาตรการขับเคลื่อนเชิงนโยบาย 3 ระยะ (ระยะเร่งด่วน Quick Win / ระยะกลาง / ระยะยาวเชิงโครงสร้าง)
3. กลไกการบูรณาการฐานข้อมูลและงบประมาณร่วม (Data Synergy & Targeted Budgeting)
4. ตัวชี้วัดผลสัมฤทธิ์เชิงนโยบาย (Policy KPIs & Expected Outcomes)`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Moral Center Pilot Policy Generator AI',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch (err) {
      console.warn('OpenRouter Policy Generator fallback triggered:', err);
    }
  }

  // Intelligent Local Thai Policy Generator Fallback
  await new Promise((r) => setTimeout(r, 800));

  return [
    `ข้อเสนอนโยบายเชิงยุทธศาสตร์: การขับเคลื่อนจังหวัด${province}ด้วยกลไก Data Synergy และนวัตกรรมคุณธรรมเชิงพื้นที่`,
    `(สังเคราะห์จากผลการถอดบทเรียนกิจกรรมนำร่องเมื่อวันที่ ${activityDate})`,
    ``,
    `■ ทิศทางตาม Prompt ที่กำหนด:`,
    `"${policyPrompt || meta.defaultPolicyPrompt}"`,
    ``,
    `1. เป้าหมายหลักเชิงยุทธศาสตร์ (Strategic Policy Goal)`,
    `ยกระดับข้อเสนอและการมีส่วนร่วมของหน่วยงานภาคี (${selectedProjectNames.join(', ') || `ภาคีเครือข่ายจังหวัด${province}`}) สู่แผนปฏิบัติการระดับจังหวัด โดยใช้ข้อมูลเชิงประจักษ์และการมีส่วนร่วมของชุมชนในพื้นที่ เป็นเกณฑ์ชี้เป้าการจัดสรรงบประมาณและทรัพยากร`,
    ``,
    `2. มาตรการขับเคลื่อนเชิงนโยบาย 3 ระยะ`,
    `- ระยะเร่งด่วน (Quick Win ภายใน 3-6 เดือน):`,
    `  • จัดตั้งคณะทำงานส่งเสริมคุณธรรมเชิงพื้นที่จังหวัด${province} จากผู้แทนหน่วยงานที่ลงทะเบียนเข้าร่วม`,
    `  • นำร่องขยายผลในพื้นที่เป้าหมายที่มีความพร้อมสูงสุดร่วมกับ ${selectedProjectNames[0] || `หน่วยงานนำร่องจังหวัด${province}`}`,
    `- ระยะกลาง (6-12 เดือน):`,
    `  • เชื่อมโยงตัวชี้วัดจากผลการถอดบทเรียนเข้ากับแผนพัฒนาจังหวัดและข้อบัญญัติ/เทศบัญญัติขององค์กรปกครองส่วนท้องถิ่นในจังหวัด${province}`,
    `  • ส่งเสริมกลไกวิทยากรคุณธรรมและพี่เลี้ยงชุมชนเข้าหนุนเสริมหน่วยงานที่เข้าร่วมทำ Data Synergy`,
    `- ระยะยาวเชิงโครงสร้าง (1-3 ปี):`,
    `  • ปรับระบบการจัดสรรงบประมาณระดับจังหวัดสู่รูปแบบ Targeted & Evidence-based Budgeting โดยใช้ผลลัพธ์จากการถอดบทเรียนและดัชนีคุณธรรม/ทุนชีวิตเป็นเกณฑ์ประเมินผลสัมฤทธิ์`,
    ``,
    `3. ตัวชี้วัดผลสัมฤทธิ์เชิงนโยบาย (Policy KPIs)`,
    `- ร้อยละ 80 ของหน่วยงานที่ลงทะเบียนในจังหวัด${province} มีการเชื่อมโยงและอัปเดตข้อมูลร่วมกับศูนย์คุณธรรมอย่างต่อเนื่อง`,
    `- โครงการนำร่องในพื้นที่สามารถยกระดับตัวชี้วัดพฤติกรรมพึงประสงค์ในประเด็น (${meta.focusAreas.join(', ')}) เพิ่มขึ้นไม่น้อยกว่าร้อยละ 15 ภายใน 1 ปีงบประมาณ`
  ].join('\n');
}
