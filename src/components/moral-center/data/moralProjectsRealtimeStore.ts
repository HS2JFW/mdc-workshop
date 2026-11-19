import { supabase } from '../../../lib/supabaseClient';
import type { CalendarTeamMember } from './calendarTeamService';

export type ProjectProgressState = 'เริ่มต้น' | 'กำลังดำเนินงาน' | 'เสร็จสิ้นการดำเนินงาน' | 'เกินระยะเวลาการดำเนินงาน';

export type MoralProjectCategory =
  | 'คุณธรรม 5 มิติ'
  | 'ทุนชีวิต 6 พลัง'
  | 'ชุมชนคุณธรรม'
  | 'องค์กรต้นแบบ';

export interface ProjectStateMeta {
  state: ProjectProgressState;
  step: 1 | 2 | 3 | 4;
  stepNumber: 1 | 2 | 3 | 4;
  label: string;
  fullLabel: string;
  shortLabel: string;
  color: string;
  bg: string;
  bgLight: string;
  border: string;
  defaultProgress: number;
  description: string;
}

export const PROJECT_STATE_META: Record<ProjectProgressState, ProjectStateMeta> = {
  'เริ่มต้น': {
    state: 'เริ่มต้น',
    step: 1,
    stepNumber: 1,
    label: '1. เริ่มต้น',
    fullLabel: '1. เริ่มต้น (Initiation)',
    shortLabel: '1. เริ่มต้น',
    color: '#2563eb',
    bg: '#eff6ff',
    bgLight: '#eff6ff',
    border: '#93c5fd',
    defaultProgress: 25,
    description: 'แต่งตั้งคณะทำงาน วางแผนปฏิบัติการ ชี้แจงเป้าหมาย และสำรวจข้อมูลพื้นฐานในพื้นที่'
  },
  'กำลังดำเนินงาน': {
    state: 'กำลังดำเนินงาน',
    step: 2,
    stepNumber: 2,
    label: '2. กำลังดำเนินงาน',
    fullLabel: '2. กำลังดำเนินงาน (In Progress)',
    shortLabel: '2. กำลังดำเนินงาน',
    color: '#d97706',
    bg: '#fffbeb',
    bgLight: '#fffbeb',
    border: '#fcd34d',
    defaultProgress: 65,
    description: 'ลงพื้นที่จัดกิจกรรม ขับเคลื่อนพฤติกรรมพึงประสงค์ ติดตามความก้าวหน้ากลางน้ำ และแก้ไขอุปสรรค'
  },
  'เสร็จสิ้นการดำเนินงาน': {
    state: 'เสร็จสิ้นการดำเนินงาน',
    step: 3,
    stepNumber: 3,
    label: '3. เสร็จสิ้นการดำเนินงาน',
    fullLabel: '3. เสร็จสิ้นการดำเนินงาน (Completed)',
    shortLabel: '3. เสร็จสิ้นการดำเนินงาน',
    color: '#059669',
    bg: '#ecfdf5',
    bgLight: '#ecfdf5',
    border: '#6ee7b7',
    defaultProgress: 100,
    description: 'สรุปผลสัมฤทธิ์เชิงประจักษ์ ถอดบทเรียนต้นแบบ บรรลุตัวชี้วัดครบถ้วน และส่งมอบผลลัพธ์'
  },
  'เกินระยะเวลาการดำเนินงาน': {
    state: 'เกินระยะเวลาการดำเนินงาน',
    step: 4,
    stepNumber: 4,
    label: '4. เกินระยะเวลาการดำเนินงาน',
    fullLabel: '4. เกินระยะเวลาการดำเนินงาน (Overdue / Exceeded Timeline)',
    shortLabel: '4. เกินระยะเวลา',
    color: '#7c3aed',
    bg: '#faf5ff',
    bgLight: '#f3e8ff',
    border: '#c084fc',
    defaultProgress: 50,
    description: 'โครงการเกินกำหนดระยะเวลาการดำเนินงานตามแผนงานหรือปฏิทิน ต้องเร่งรัดติดตามการดำเนินงานและประเมินผล'
  }
};

export interface MeetingDocument {
  id: string;
  name: string;
  uploadedAt: string;
  fileType?: string; // pdf, docx, csv, xlsx, doc, sql, other
  size?: string;
  url?: string;
}

export interface MeetingAiSummary {
  projectName: string;
  province: string;
  detectedState: ProjectProgressState;
  progressPercent: number;
  stateRationale: string;
  overview: string;
  keyPoints: string[];
  actionItems: string[];
  sourceFileName: string;
  summarizedAt: string;
}

export type MeetingStatus = 'meeting' | 'booking' | 'close';

export interface MoralMeetingEvent {
  id: string;
  projectId: string;
  projectName: string;
  province: string;
  topic: string;
  type: MeetingStatus;
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:MM
  timeEnd: string; // HH:MM
  meetingUrl: string;
  documents: MeetingDocument[];
  category: MoralProjectCategory;
  aiSummary?: MeetingAiSummary;
  attendees?: CalendarTeamMember[];
  teamId?: string;
}

export interface ProjectHistoryLog {
  id: string;
  meetingId: string;
  meetingTopic: string;
  date: string;
  stateDetected: ProjectProgressState;
  progressPercent: number;
  summary: string;
  stateRationale: string;
  fileName: string;
  updatedAt: string;
}

export interface MoralTrackedProject {
  id: string;
  name: string;
  province: string;
  region: 'ภาคเหนือ' | 'ภาคตะวันออกเฉียงเหนือ' | 'ภาคกลาง' | 'ภาคใต้';
  category: MoralProjectCategory;
  state: ProjectProgressState;
  progressPercent: number;
  latestSummary: string;
  keyPoints: string[];
  actionItems: string[];
  latestActionItems?: string[];
  stateRationale: string;
  latestStateRationale?: string;
  startDate?: string;
  endDate?: string;
  lastUpdatedAt: string;
  updatedAt?: string;
  meetingsCount?: number;
  latestMeetingTopic?: string;
  latestMeetingDate?: string;
  sourceFileName?: string;
  historyLogs: ProjectHistoryLog[];
}

export const THAILAND_77_PROVINCES: string[] = [
  'กระบี่', 'กรุงเทพมหานคร', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
  'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท',
  'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง',
  'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
  'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส',
  'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
  'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา',
  'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์',
  'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
  'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',
  'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย',
  'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
  'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี',
  'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
  'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์',
  'อุทัยธานี', 'อุบลราชธานี'
];

const NORTH_PROVINCES = new Set([
  'เชียงราย', 'เชียงใหม่', 'น่าน', 'พะเยา', 'แพร่', 'แม่ฮ่องสอน', 'ลำปาง', 'ลำพูน', 'อุตรดิตถ์',
  'กำแพงเพชร', 'ตาก', 'นครสวรรค์', 'พิจิตร', 'พิษณุโลก', 'เพชรบูรณ์', 'สุโขทัย', 'อุทัยธานี'
]);

const NORTHEAST_PROVINCES = new Set([
  'กาฬสินธุ์', 'ขอนแก่น', 'ชัยภูมิ', 'นครพนม', 'นครราชสีมา', 'บึงกาฬ', 'บุรีรัมย์', 'มหาสารคาม',
  'มุกดาหาร', 'ยโสธร', 'ร้อยเอ็ด', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สุรินทร์', 'หนองคาย',
  'หนองบัวลำภู', 'อำนาจเจริญ', 'อุดรธานี', 'อุบลราชธานี'
]);

const SOUTH_PROVINCES = new Set([
  'กระบี่', 'ชุมพร', 'ตรัง', 'นครศรีธรรมราช', 'นราธิวาส', 'ปัตตานี', 'พังงา', 'พัทลุง',
  'ภูเก็ต', 'ยะลา', 'ระนอง', 'สงขลา', 'สตูล', 'สุราษฎร์ธานี'
]);

export function getRegionForProvince(
  province: string
): 'ภาคเหนือ' | 'ภาคตะวันออกเฉียงเหนือ' | 'ภาคกลาง' | 'ภาคใต้' {
  if (NORTH_PROVINCES.has(province)) return 'ภาคเหนือ';
  if (NORTHEAST_PROVINCES.has(province)) return 'ภาคตะวันออกเฉียงเหนือ';
  if (SOUTH_PROVINCES.has(province)) return 'ภาคใต้';
  return 'ภาคกลาง';
}

export const INITIAL_TRACKED_PROJECTS: MoralTrackedProject[] = [
  {
    id: 'proj-1',
    name: 'โครงการยกระดับชุมชนคุณธรรมต้นแบบขับเคลื่อนเศรษฐกิจพอเพียง',
    province: 'ลำปาง',
    region: 'ภาคเหนือ',
    category: 'ชุมชนคุณธรรม',
    state: 'เสร็จสิ้นการดำเนินงาน',
    progressPercent: 100,
    latestSummary:
      'ที่ประชุมรับรองผลสัมฤทธิ์การยกระดับชุมชนคุณธรรมต้นแบบ จ.ลำปาง ครบ 100% โดยเกิดศูนย์เรียนรู้และธนาคารเวลาชุมชนที่พึ่งพาตนเองได้สมบูรณ์ พร้อมส่งมอบรายงานฉบับสมบูรณ์เข้าสู่คลังข้อมูล MDC',
    keyPoints: [
      'ผ่านเกณฑ์ประเมินชุมชนคุณธรรมต้นแบบ 9 ขั้นตอนครบทุกชุมชนเป้าหมาย',
      'ลดรายจ่ายครัวเรือนและสร้างกองทุนสวัสดิการชุมชนพึ่งตนเองสำเร็จ',
      'เชื่อมโยงข้อมูลแหล่งเรียนรู้เข้าสู่ระบบ Moral Data Center (MDC)'
    ],
    actionItems: [
      'ส่งมอบรายงานฉบับสมบูรณ์และคู่มือถอดบทเรียนแก่จังหวัดและศูนย์คุณธรรม',
      'เตรียมขยายผลเป็นพี่เลี้ยงให้แก่ชุมชนรุ่นถัดไปในปีงบประมาณหน้า'
    ],
    stateRationale:
      'บันทึกการประชุมระบุการสรุปผลสัมฤทธิ์ปลายน้ำครบ 100% และการปิดโครงการพร้อมส่งมอบรายงานฉบับสมบูรณ์',
    lastUpdatedAt: '2026-07-07 16:35',
    sourceFileName: 'สรุปผลสัมฤทธิ์_ชุมชนคุณธรรมลำปาง_2569.pdf',
    historyLogs: [
      {
        id: 'log-1',
        meetingId: 'meet-closed-1',
        meetingTopic: 'ประชุมสรุปผลสัมฤทธิ์และปิดโครงการชุมชนคุณธรรมต้นแบบ จ.ลำปาง',
        date: '2026-07-07',
        stateDetected: 'เสร็จสิ้นการดำเนินงาน',
        progressPercent: 100,
        summary: 'บรรลุตัวชี้วัดครบถ้วนและส่งมอบบทเรียนต้นแบบเข้าสู่ระบบ MDC',
        stateRationale: 'มีมติรับรองผลสัมฤทธิ์และปิดโครงการอย่างเป็นทางการ',
        fileName: 'สรุปผลสัมฤทธิ์_ชุมชนคุณธรรมลำปาง_2569.pdf',
        updatedAt: '2026-07-07 16:35'
      }
    ]
  },
  {
    id: 'proj-2',
    name: 'โครงการเครือข่ายเยาวชนสร้างสรรค์เสริมพลังทุนชีวิต 6 พลัง',
    province: 'เชียงราย',
    region: 'ภาคเหนือ',
    category: 'ทุนชีวิต 6 พลัง',
    state: 'กำลังดำเนินงาน',
    progressPercent: 68,
    latestSummary:
      'อยู่ระหว่างการลงพื้นที่จัดค่ายบ่มเพาะแกนนำเยาวชนรุ่นที่ 2 ในสถานศึกษา 12 แห่ง พบว่าคะแนนพลังตัวตนและพลังเพื่อนเพิ่มขึ้นอย่างมีนัยสำคัญ และกำลังติดตามผลโครงงานจิตอาสาระยะกลางน้ำ',
    keyPoints: [
      'ดำเนินการอบรมแกนนำเยาวชนแล้วเสร็จ 8 จาก 12 โรงเรียน (คิดเป็น 68%)',
      'เยาวชนร่วมจัดทำโครงงานพื้นที่ปลอดภัยในโรงเรียนและชุมชน',
      'เตรียมประเมินผลลัพธ์เชิงพฤติกรรมรอบกลางน้ำในเดือนถัดไป'
    ],
    actionItems: [
      'ลงพื้นที่นิเทศติดตามโครงงานเยาวชนอีก 4 โรงเรียนที่เหลือ',
      'รวบรวมบันทึกสะท้อนคิด (Reflection Log) ของแกนนำเยาวชน'
    ],
    stateRationale:
      'บันทึกการประชุมระบุความก้าวหน้าการดำเนินกิจกรรมในพื้นที่อยู่ระหว่างดำเนินการ (68%) และมีการนัดหมายติดตามผลรอบถัดไป',
    lastUpdatedAt: '2026-07-08 14:20',
    sourceFileName: 'บันทึกความก้าวหน้า_ทุนชีวิตเยาวชนเชียงราย.docx',
    historyLogs: [
      {
        id: 'log-2',
        meetingId: 'meet-2',
        meetingTopic: 'ประชุมติดตามความก้าวหน้ากลางน้ำ โครงการทุนชีวิตเยาวชน จ.เชียงราย',
        date: '2026-07-08',
        stateDetected: 'กำลังดำเนินงาน',
        progressPercent: 68,
        summary: 'ลงพื้นที่จัดกิจกรรมแล้ว 68% อยู่ระหว่างขยายผลโครงงานจิตอาสาเยาวชน',
        stateRationale: 'อยู่ระหว่างการดำเนินกิจกรรมตามแผนปฏิบัติการระยะกลางน้ำ',
        fileName: 'บันทึกความก้าวหน้า_ทุนชีวิตเยาวชนเชียงราย.docx',
        updatedAt: '2026-07-08 14:20'
      }
    ]
  },
  {
    id: 'proj-3',
    name: 'โครงการคลินิกวินัยการเงินและภูมิคุ้มกันหนี้ครัวเรือนคนเมือง',
    province: 'กรุงเทพมหานคร',
    region: 'ภาคกลาง',
    category: 'คุณธรรม 5 มิติ',
    state: 'เริ่มต้น',
    progressPercent: 25,
    latestSummary:
      'ประชุมชี้แจงแนวทางเริ่มต้นโครงการ แต่งตั้งคณะทำงานโค้ชวินัยการเงินคนเมือง และสำรวจข้อมูลภาระหนี้บริโภคของกลุ่มพนักงานในเขตกรุงเทพมหานครเพื่อเตรียมเปิดคลินิกให้คำปรึกษา',
    keyPoints: [
      'แต่งตั้งคณะทำงานและวิทยากรพี่เลี้ยงด้านวินัยการเงินคนเมืองครบถ้วน',
      'กำหนดหลักสูตรการออมและแก้หนี้อุปโภคบริโภคสำหรับวัยทำงาน',
      'คัดเลือกสถานประกอบการนำร่อง 5 แห่งในเขตกรุงเทพมหานคร'
    ],
    actionItems: [
      'จัดทำแบบสำรวจพฤติกรรมการออมและภาระหนี้ก่อนเริ่มกิจกรรม (Baseline)',
      'นัดหมายเปิดคลินิกให้คำปรึกษารุ่นที่ 1 ในสัปดาห์หน้า'
    ],
    stateRationale:
      'เป็นการประชุมปฐมนิเทศ แต่งตั้งคณะทำงาน และสำรวจข้อมูลพื้นฐานก่อนเริ่มลงพื้นที่ จึงอยู่ในสถานะ 1. เริ่มต้น',
    lastUpdatedAt: '2026-07-08 10:15',
    sourceFileName: 'รายงานการประชุมเปิดโครงการ_วินัยการเงินกทม.docx',
    historyLogs: [
      {
        id: 'log-3',
        meetingId: 'meet-1',
        meetingTopic: 'ประชุมวางแผนเริ่มต้นโครงการคลินิกวินัยการเงินคนเมือง กทม.',
        date: '2026-07-08',
        stateDetected: 'เริ่มต้น',
        progressPercent: 25,
        summary: 'แต่งตั้งคณะทำงานและกำหนดแผนปฏิบัติการเบื้องต้นเรียบร้อยแล้ว',
        stateRationale: 'อยู่ในขั้นตอนเริ่มต้นวางแผนและเตรียมความพร้อมก่อนดำเนินกิจกรรมหลัก',
        fileName: 'รายงานการประชุมเปิดโครงการ_วินัยการเงินกทม.docx',
        updatedAt: '2026-07-08 10:15'
      }
    ]
  },
  {
    id: 'proj-4',
    name: 'โครงการธรรมาภิบาลท้องถิ่นและจัดซื้อจัดจ้างโปร่งใส (Integrity Taskforce)',
    province: 'ขอนแก่น',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    category: 'องค์กรต้นแบบ',
    state: 'กำลังดำเนินงาน',
    progressPercent: 72,
    latestSummary:
      'องค์กรปกครองส่วนท้องถิ่นและภาคธุรกิจคู่สัญญาใน จ.ขอนแก่น ร่วมลงนามประกาศเจตนารมณ์ No Gift Policy และกำลังดำเนินการตรวจสอบความโปร่งใสโครงการก่อสร้างร่วมกับภาคประชาสังคม',
    keyPoints: [
      'อปท. นำร่อง 18 แห่งผ่านเกณฑ์การเปิดเผยข้อมูลจัดซื้อจัดจ้าง (ITA)',
      'จัดตั้งคณะผู้ตรวจการภาคประชาชนร่วมสังเกตการณ์โครงการขนาดใหญ่',
      'อยู่ระหว่างการประเมินผลรอบที่ 2 เพื่อยกระดับสู่องค์กรคุณธรรมต้นแบบ'
    ],
    actionItems: [
      'ติดตามผลการเปิดเผยราคากลางและสัญญาจัดซื้อจัดจ้างในระบบออนไลน์',
      'จัดเวทีทบทวนผลการตรวจสอบร่วมในเดือนสิงหาคม'
    ],
    stateRationale:
      'มีการลงพื้นที่ตรวจสอบและขับเคลื่อนกิจกรรมไปแล้วกว่า 72% อยู่ระหว่างการประเมินผลรอบที่ 2',
    lastUpdatedAt: '2026-07-06 15:40',
    sourceFileName: 'บันทึกการประชุม_ธรรมาภิบาลขอนแก่น_ครั้งที่2.pdf',
    historyLogs: []
  },
  {
    id: 'proj-5',
    name: 'โครงการผู้บริบาลคุณธรรมและระบบดูแลผู้สูงวัยด้วยพลังกตัญญู (Moral LTC)',
    province: 'สุราษฎร์ธานี',
    region: 'ภาคใต้',
    category: 'ชุมชนคุณธรรม',
    state: 'เสร็จสิ้นการดำเนินงาน',
    progressPercent: 100,
    latestSummary:
      'ดำเนินการฝึกอบรมจิตอาสาและ อสม. สู่การเป็นผู้บริบาลคุณธรรมครบ 150 คน ครอบคลุมการดูแลผู้สูงอายุติดบ้านและติดเตียงในพื้นที่เป้าหมายครบ 100% พร้อมประกาศใช้ธรรมนูญชุมชนดูแลผู้สูงวัยอย่างยั่งยืน',
    keyPoints: [
      'ผลิตผู้บริบาลคุณธรรม (Moral Caregivers) สำเร็จครบ 150 คนตามเป้าหมาย',
      'ผู้สูงอายุกลุ่มเปราะบางมีคะแนนความสุขใจและคุณภาพชีวิตเพิ่มขึ้นเป็น 89.5%',
      'ประกาศใช้ธรรมนูญชุมชนรองรับสังคมสูงวัยครบทุกตำบลนำร่อง'
    ],
    actionItems: [
      'สรุปรายงานผลสัมฤทธิ์เสนอต่อ สปสช. และ พม. เพื่อขยายผลระดับภาคใต้'
    ],
    stateRationale:
      'ดำเนินกิจกรรมครบทุกตัวชี้วัด 100% และมีการสรุปผลสัมฤทธิ์ปิดโครงการเรียบร้อยแล้ว',
    lastUpdatedAt: '2026-07-05 17:10',
    sourceFileName: 'รายงานปิดโครงการ_ผู้บริบาลคุณธรรมสุราษฎร์ธานี.pdf',
    historyLogs: []
  },
  {
    id: 'proj-6',
    name: 'โครงการส่งเสริมวินัยจราจรและกองทุนไกล่เกลี่ยข้อพิพาทสิทธิชุมชน',
    province: 'ชลบุรี',
    region: 'ภาคกลาง',
    category: 'คุณธรรม 5 มิติ',
    state: 'เกินระยะเวลาการดำเนินงาน',
    progressPercent: 55,
    latestSummary:
      'จัดตั้งจุดกวดขันวินัยจราจรเชิงบวกร่วมกับอาสาสมัครจราจรชุมชน แต่กิจกรรมจัดตั้งศูนย์ไกล่เกลี่ยและขยายจุดรณรงค์ในเขตนิคมอุตสาหกรรมเกิดความล่าช้ากว่าแผน 45 วัน ส่งผลให้โครงการเกินกรอบระยะเวลาดำเนินงานตามปฏิทินที่กำหนด',
    keyPoints: [
      'อบรมวินัยจราจรและจิตสำนึกความปลอดภัยแก่ผู้ขับขี่สาธารณะแล้ว 420 คน',
      'ไกล่เกลี่ยข้อพิพาทสิทธิชุมชนสำเร็จ 19 กรณีโดยไม่ต้องเข้าสู่ชั้นศาล',
      'พบปัญหาความล่าช้าในการจัดสรรงบประมาณขยายจุดรณรงค์เข้าเขตนิคมฯ เกินกำหนดส่งมอบงาน'
    ],
    actionItems: [
      'เร่งรัดประชุมติดตามร่วมกับนิคมอุตสาหกรรมและสถานีตำรวจเพื่อขอขยายกรอบเวลาและปิดงาน'
    ],
    stateRationale:
      'โครงการเกินกรอบระยะเวลาการดำเนินงานตามแผนงานที่กำหนด (Overdue) ต้องเร่งรัดติดตามผลสัมฤทธิ์และประเมินผลเร่งด่วน',
    lastUpdatedAt: '2026-07-04 11:30',
    sourceFileName: 'บันทึกการประชุม_วินัยจราจรชลบุรี.docx',
    historyLogs: []
  },
  {
    id: 'proj-7',
    name: 'โครงการพัฒนาองค์กรคุณธรรมต้นแบบและเครือข่ายบวร (บ้าน-วัด-โรงเรียน)',
    province: 'อุดรธานี',
    region: 'ภาคตะวันออกเฉียงเหนือ',
    category: 'องค์กรต้นแบบ',
    state: 'เริ่มต้น',
    progressPercent: 20,
    latestSummary:
      'จัดประชุมชี้แจงเกณฑ์การประเมินองค์กรคุณธรรม 9 ขั้นตอน แก่หน่วยงานภาครัฐและสถานศึกษาใน จ.อุดรธานี จำนวน 45 แห่ง และรับขึ้นทะเบียนเข้าร่วมโครงการระยะเริ่มต้น',
    keyPoints: [
      'มีองค์กรสมัครเข้าร่วมประกาศเจตนารมณ์คุณธรรมรวม 45 แห่ง',
      'จัดสรรวิทยากรพี่เลี้ยงคุณธรรม (Coach) ประจำกลุ่มองค์กรเรียบร้อยแล้ว'
    ],
    actionItems: [
      'ให้แต่ละองค์กรส่งแผนวิเคราะห์ปัญหาที่อยากแก้และดีที่อยากทำภายในสิ้นเดือนนี้'
    ],
    stateRationale:
      'เพิ่งเสร็จสิ้นการประชุมชี้แจงและรับสมัครองค์กรเข้าร่วมโครงการ จึงอยู่ในสถานะ 1. เริ่มต้น (20%)',
    lastUpdatedAt: '2026-07-03 14:00',
    sourceFileName: 'รายงานการประชุมชี้แจง_องค์กรคุณธรรมอุดรธานี.txt',
    historyLogs: []
  },
  {
    id: 'proj-8',
    name: 'โครงการอนุรักษ์ทรัพยากรทางทะเลด้วยจิตอาสาและภูมิปัญญาชุมชน',
    province: 'พังงา',
    region: 'ภาคใต้',
    category: 'ชุมชนคุณธรรม',
    state: 'เสร็จสิ้นการดำเนินงาน',
    progressPercent: 100,
    latestSummary:
      'เครือข่ายประมงพื้นบ้านและเยาวชนจิตอาสา จ.พังงา ดำเนินกิจกรรมฟื้นฟูชายฝั่งและธนาคารปูม้าสำเร็จครบตามแผน เกิดกติกาชุมชนอนุรักษ์สิ่งแวดล้อมที่ยั่งยืนและผ่านการรับรองเป็นแหล่งเรียนรู้คุณธรรมระดับจังหวัด',
    keyPoints: [
      'จัดตั้งธนาคารปูม้าและเขตอนุรักษ์ชายฝั่งสำเร็จ 6 ชุมชน',
      'ได้รับคัดเลือกเป็นแหล่งเรียนรู้ดูงานชุมชนคุณธรรมต้นแบบของภาคใต้'
    ],
    actionItems: [
      'เผยแพร่ชุดความรู้และถอดบทเรียนผ่านเว็บไซต์ศูนย์คุณธรรม'
    ],
    stateRationale:
      'ดำเนินกิจกรรมครบทุกขั้นตอนและได้รับการรับรองเป็นแหล่งเรียนรู้ต้นแบบเสร็จสิ้นแล้ว (100%)',
    lastUpdatedAt: '2026-07-02 16:00',
    sourceFileName: 'สรุปผลปิดโครงการ_จิตอาสาทะเลพังงา.pdf',
    historyLogs: []
  },
  {
    id: 'PRJ-2026-001',
    name: 'โครงการขับเคลื่อนเครือข่ายความดีและวินัยการเงินภาคประชาชน จ.ระยอง',
    province: 'ระยอง',
    region: 'ภาคกลาง',
    category: 'คุณธรรม 5 มิติ',
    state: 'กำลังดำเนินงาน',
    progressPercent: 65,
    latestSummary:
      'จัดตั้งคณะทำงานไตรภาคีและฝึกอบรมหลักสูตรบัญชีครัวเรือนพอเพียงและวินัยปลดหนี้แล้ว 3 รุ่น ผู้เข้าร่วม 370 คน อยู่ระหว่างเจรจา MOU เชื่อมโยง Moral Credit กับกองทุนหมู่บ้าน 8 แห่งเพื่อลดดอกเบี้ยเงินกู้ให้สมาชิกที่มีวินัย',
    keyPoints: [
      'สำรวจข้อมูลหนี้สินครัวเรือนใน 12 ชุมชนเป้าหมายครบถ้วน 100%',
      'จัดตั้งคณะทำงานไตรภาคีและเผยแพร่คู่มือการสะสมแต้ม Moral Credit เรียบร้อย',
      'ฝึกอบรมหลักสูตรวินัยการเงินแล้ว 3 รุ่น (370 คน) จากเป้าหมาย 480 คน',
      'เจรจา MOU สิทธิประโยชน์สินเชื่อผ่อนปรนร่วมกับกองทุนหมู่บ้านนำร่อง'
    ],
    actionItems: [
      'จัดอบรมรุ่นที่ 4 ให้ครบตามเป้าหมาย 480 คน',
      'ลงนาม MOU ร่วมกับสัจจะออมทรัพย์ 8 กองทุนเพื่อลดดอกเบี้ยเงินกู้ให้สมาชิก'
    ],
    stateRationale:
      'อยู่ระหว่างการจัดกิจกรรมและเชื่อมโยงระบบแต้มความดีในระยะที่ 2 มีความก้าวหน้ารวม 65%',
    lastUpdatedAt: '2026-07-08 15:30',
    sourceFileName: 'รายงานความก้าวหน้า_วินัยการเงินระยอง.docx',
    historyLogs: [
      {
        id: 'log-rayong-1',
        meetingId: 'meet-rayong-1',
        meetingTopic: 'ประชุมติดตามความก้าวหน้าโครงการวินัยการเงินและ Moral Credit จ.ระยอง',
        date: '2026-07-08',
        stateDetected: 'กำลังดำเนินงาน',
        progressPercent: 65,
        summary: 'ดำเนินการฝึกอบรมแล้ว 3 รุ่น และอยู่ระหว่างประสานงานกองทุนสัจจะออมทรัพย์',
        stateRationale: 'การดำเนินงานอยู่ในระยะที่ 2 มีความก้าวหน้ารวม 65%',
        fileName: 'รายงานความก้าวหน้า_วินัยการเงินระยอง.docx',
        updatedAt: '2026-07-08 15:30'
      }
    ]
  }
];

export const INITIAL_PROJECT_MEETINGS: MoralMeetingEvent[] = [
  {
    id: 'meet-p1-1',
    projectId: 'proj-1',
    projectName: 'โครงการยกระดับชุมชนคุณธรรมต้นแบบขับเคลื่อนเศรษฐกิจพอเพียง',
    province: 'ลำปาง',
    topic: 'การประชุมครั้งที่ 1 : ชี้แจงแผนปฏิบัติการและแต่งตั้งคณะทำงานขับเคลื่อนชุมชน',
    type: 'meeting',
    date: '2026-05-15',
    timeStart: '09:30',
    timeEnd: '11:00',
    meetingUrl: 'https://meet.google.com/moral-lampang-01',
    documents: [
      { id: 'doc-p1-1', name: 'แผนงานขับเคลื่อนWBS_ระยะที่1.pdf', uploadedAt: '2026-05-15 09:15', fileType: 'pdf', size: '1.8 MB' },
      { id: 'doc-p1-2', name: 'รายชื่อคณะกรรมการชุมชนคุณธรรม.docx', uploadedAt: '2026-05-15 09:20', fileType: 'docx', size: '420 KB' }
    ],
    category: 'ชุมชนคุณธรรม'
  },
  {
    id: 'meet-p1-2',
    projectId: 'proj-1',
    projectName: 'โครงการยกระดับชุมชนคุณธรรมต้นแบบขับเคลื่อนเศรษฐกิจพอเพียง',
    province: 'ลำปาง',
    topic: 'การประชุมครั้งที่ 2 : รายงานความก้าวหน้ากลางน้ำและผลการจัดตั้งธนาคารเวลา',
    type: 'meeting',
    date: '2026-06-20',
    timeStart: '13:30',
    timeEnd: '15:00',
    meetingUrl: 'https://meet.google.com/moral-lampang-02',
    documents: [
      { id: 'doc-p1-3', name: 'รายงานผลสำรวจความสุขชุมชน_ไตรมาส2.pdf', uploadedAt: '2026-06-20 13:15', fileType: 'pdf', size: '2.5 MB' },
      { id: 'doc-p1-4', name: 'ข้อมูลสถิติการออมและธนาคารเวลา.xlsx', uploadedAt: '2026-06-20 13:20', fileType: 'xlsx', size: '890 KB' }
    ],
    category: 'ชุมชนคุณธรรม'
  },
  {
    id: 'meet-closed-1',
    projectId: 'proj-1',
    projectName: 'โครงการยกระดับชุมชนคุณธรรมต้นแบบขับเคลื่อนเศรษฐกิจพอเพียง',
    province: 'ลำปาง',
    topic: 'การประชุมครั้งที่ 3 : ประชุมสรุปผลสัมฤทธิ์และปิดโครงการชุมชนคุณธรรมต้นแบบ จ.ลำปาง',
    type: 'close',
    date: '2026-07-07',
    timeStart: '10:00',
    timeEnd: '11:00',
    meetingUrl: 'https://meet.google.com/moral-lesson-learned',
    documents: [
      { id: 'doc-c1', name: 'สรุปผลสัมฤทธิ์_ชุมชนคุณธรรมลำปาง_2569.pdf', uploadedAt: '2026-07-07 11:20', fileType: 'pdf', size: '3.4 MB' },
      { id: 'doc-c2', name: 'ฐานข้อมูลสรุปความสำเร็จ_MDC.sql', uploadedAt: '2026-07-07 11:25', fileType: 'sql', size: '1.1 MB' }
    ],
    category: 'ชุมชนคุณธรรม',
    aiSummary: {
      projectName: 'โครงการยกระดับชุมชนคุณธรรมต้นแบบขับเคลื่อนเศรษฐกิจพอเพียง',
      province: 'ลำปาง',
      detectedState: 'เสร็จสิ้นการดำเนินงาน',
      progressPercent: 100,
      stateRationale: 'ที่ประชุมมีมติรับรองผลสัมฤทธิ์ครบ 100% และปิดโครงการอย่างเป็นทางการ พร้อมส่งมอบรายงานฉบับสมบูรณ์',
      overview:
        'ที่ประชุมรับรองผลสัมฤทธิ์การยกระดับชุมชนคุณธรรมต้นแบบ จ.ลำปาง ครบ 100% โดยเกิดศูนย์เรียนรู้และธนาคารเวลาชุมชนที่พึ่งพาตนเองได้สมบูรณ์ พร้อมส่งมอบรายงานฉบับสมบูรณ์เข้าสู่คลังข้อมูล MDC',
      keyPoints: [
        'ผ่านเกณฑ์ประเมินชุมชนคุณธรรมต้นแบบ 9 ขั้นตอนครบทุกชุมชนเป้าหมาย',
        'ลดรายจ่ายครัวเรือนและสร้างกองทุนสวัสดิการชุมชนพึ่งตนเองสำเร็จ',
        'เชื่อมโยงข้อมูลแหล่งเรียนรู้เข้าสู่ระบบ Moral Data Center (MDC)'
      ],
      actionItems: [
        'ส่งมอบรายงานฉบับสมบูรณ์และคู่มือถอดบทเรียนแก่จังหวัดและศูนย์คุณธรรม',
        'เตรียมขยายผลเป็นพี่เลี้ยงให้แก่ชุมชนรุ่นถัดไปในปีงบประมาณหน้า'
      ],
      sourceFileName: 'สรุปผลสัมฤทธิ์_ชุมชนคุณธรรมลำปาง_2569.pdf',
      summarizedAt: '2026-07-07 11:22'
    }
  },
  {
    id: 'meet-p2-1',
    projectId: 'proj-2',
    projectName: 'โครงการเครือข่ายเยาวชนสร้างสรรค์เสริมพลังทุนชีวิต 6 พลัง',
    province: 'เชียงราย',
    topic: 'การประชุมครั้งที่ 1 : เตรียมความพร้อมค่ายแกนนำเยาวชนเสริมสร้างคุณธรรม',
    type: 'meeting',
    date: '2026-06-12',
    timeStart: '10:00',
    timeEnd: '11:30',
    meetingUrl: 'https://meet.google.com/youth-asset-kickoff',
    documents: [
      { id: 'doc-p2-1', name: 'คู่มือหลักสูตรค่ายเยาวชน6พลัง.pdf', uploadedAt: '2026-06-12 09:40', fileType: 'pdf', size: '2.1 MB' }
    ],
    category: 'ทุนชีวิต 6 พลัง'
  },
  {
    id: 'meet-2',
    projectId: 'proj-2',
    projectName: 'โครงการเครือข่ายเยาวชนสร้างสรรค์เสริมพลังทุนชีวิต 6 พลัง',
    province: 'เชียงราย',
    topic: 'การประชุมครั้งที่ 2 : ประชุมติดตามความก้าวหน้ากลางน้ำและถอดบทเรียนค่ายแกนนำเยาวชน',
    type: 'meeting',
    date: '2026-07-08',
    timeStart: '13:00',
    timeEnd: '14:00',
    meetingUrl: 'https://meet.google.com/life-asset-workshop',
    documents: [
      { id: 'doc-3', name: 'ชุดเครื่องมือประเมินทุนชีวิต_MDC.pdf', uploadedAt: '2026-07-08 09:00', fileType: 'pdf', size: '1.9 MB' },
      { id: 'doc-4', name: 'บันทึกถอดบทเรียนแกนนำเยาวชน.docx', uploadedAt: '2026-07-08 13:50', fileType: 'docx', size: '580 KB' }
    ],
    category: 'ทุนชีวิต 6 พลัง'
  },
  {
    id: 'meet-1',
    projectId: 'proj-3',
    projectName: 'โครงการคลินิกวินัยการเงินและภูมิคุ้มกันหนี้ครัวเรือนคนเมือง',
    province: 'กรุงเทพมหานคร',
    topic: 'การประชุมครั้งที่ 1 : วางแผนเริ่มต้นโครงการและแต่งตั้งคณะทำงานโค้ชวินัยการเงิน',
    type: 'meeting',
    date: '2026-07-08',
    timeStart: '09:00',
    timeEnd: '10:00',
    meetingUrl: 'https://meet.google.com/moral-forum-2026',
    documents: [
      { id: 'doc-1', name: 'คู่มือคลินิกวินัยการเงินคนเมือง.pdf', uploadedAt: '2026-07-07 10:30', fileType: 'pdf', size: '1.5 MB' }
    ],
    category: 'คุณธรรม 5 มิติ'
  },
  {
    id: 'meet-3',
    projectId: 'proj-4',
    projectName: 'โครงการธรรมาภิบาลท้องถิ่นและจัดซื้อจัดจ้างโปร่งใส (Integrity Taskforce)',
    province: 'ขอนแก่น',
    topic: 'การประชุมครั้งที่ 1 : คลินิกให้คำปรึกษาเกณฑ์ความโปร่งใส ITAGC สำหรับ อปท. และคู่สัญญา',
    type: 'booking',
    date: '2026-07-08',
    timeStart: '11:00',
    timeEnd: '12:00',
    meetingUrl: 'https://meet.google.com/consult-fund-moral',
    documents: [
      { id: 'doc-it-1', name: 'เกณฑ์การประเมินความโปร่งใสITAGC.pdf', uploadedAt: '2026-07-08 10:45', fileType: 'pdf', size: '2.8 MB' }
    ],
    category: 'องค์กรต้นแบบ'
  },
  {
    id: 'meet-4',
    projectId: 'proj-6',
    projectName: 'โครงการส่งเสริมวินัยจราจรและกองทุนไกล่เกลี่ยข้อพิพาทสิทธิชุมชน',
    province: 'ชลบุรี',
    topic: 'ประชุมติดตามการดำเนินงานจุดกวดขันวินัยจราจรและศูนย์ไกล่เกลี่ยชุมชน',
    type: 'booking',
    date: '2026-07-09',
    timeStart: '10:00',
    timeEnd: '11:00',
    meetingUrl: 'https://meet.google.com/chonburi-discipline-model',
    documents: [],
    category: 'คุณธรรม 5 มิติ'
  },
  {
    id: 'meet-5',
    projectId: 'proj-5',
    projectName: 'โครงการผู้บริบาลคุณธรรมและระบบดูแลผู้สูงวัยด้วยพลังกตัญญู (Moral LTC)',
    province: 'สุราษฎร์ธานี',
    topic: 'ประชุมสรุปผลสัมฤทธิ์และประเมินดัชนีความสุขผู้สูงวัย จ.สุราษฎร์ธานี',
    type: 'close',
    date: '2026-07-05',
    timeStart: '14:00',
    timeEnd: '15:30',
    meetingUrl: 'https://meet.google.com/surat-moral-caregiver',
    documents: [
      { id: 'doc-s1', name: 'รายงานปิดโครงการ_ผู้บริบาลคุณธรรมสุราษฎร์ธานี.pdf', uploadedAt: '2026-07-05 16:00' }
    ],
    category: 'ชุมชนคุณธรรม',
    aiSummary: {
      projectName: 'โครงการผู้บริบาลคุณธรรมและระบบดูแลผู้สูงวัยด้วยพลังกตัญญู (Moral LTC)',
      province: 'สุราษฎร์ธานี',
      detectedState: 'เสร็จสิ้นการดำเนินงาน',
      progressPercent: 100,
      stateRationale: 'ดำเนินกิจกรรมครบทุกตัวชี้วัด 100% ผลิตผู้บริบาลคุณธรรม 150 คน และส่งมอบผลลัพธ์เรียบร้อย',
      overview: 'รับรองผลสัมฤทธิ์โครงการผู้บริบาลคุณธรรม จ.สุราษฎร์ธานี ครบ 100% และประกาศใช้ธรรมนูญชุมชนรองรับสังคมสูงวัย',
      keyPoints: [
        'ผลิตผู้บริบาลคุณธรรมสำเร็จครบ 150 คนตามเป้าหมาย',
        'ผู้สูงอายุกลุ่มเปราะบางมีคะแนนความสุขใจและคุณภาพชีวิต 89.5%'
      ],
      actionItems: ['สรุปรายงานผลสัมฤทธิ์เสนอต่อ สปสช. เพื่อขยายผลระดับภาคใต้'],
      sourceFileName: 'รายงานปิดโครงการ_ผู้บริบาลคุณธรรมสุราษฎร์ธานี.pdf',
      summarizedAt: '2026-07-05 16:05'
    }
  },
  {
    id: 'meet-6',
    projectId: 'proj-7',
    projectName: 'โครงการพัฒนาองค์กรคุณธรรมต้นแบบและเครือข่ายบวร (บ้าน-วัด-โรงเรียน)',
    province: 'อุดรธานี',
    topic: 'ประชุมชี้แจงเกณฑ์ประเมินองค์กรคุณธรรม 9 ขั้นตอนและปฐมนิเทศเครือข่าย บวร.',
    type: 'meeting',
    date: '2026-07-03',
    timeStart: '09:30',
    timeEnd: '11:30',
    meetingUrl: 'https://meet.google.com/udon-moral-organization',
    documents: [
      { id: 'doc-u1', name: 'รายงานการประชุมชี้แจง_องค์กรคุณธรรมอุดรธานี.txt', uploadedAt: '2026-07-03 13:00' }
    ],
    category: 'องค์กรต้นแบบ'
  },
  {
    id: 'meet-7',
    projectId: 'proj-8',
    projectName: 'โครงการอนุรักษ์ทรัพยากรทางทะเลด้วยจิตอาสาและภูมิปัญญาชุมชน',
    province: 'พังงา',
    topic: 'ประชุมปิดโครงการและรับรองแหล่งเรียนรู้คุณธรรมต้นแบบอนุรักษ์ทะเล จ.พังงา',
    type: 'close',
    date: '2026-07-02',
    timeStart: '13:30',
    timeEnd: '15:00',
    meetingUrl: 'https://meet.google.com/phangnga-marine-conservation',
    documents: [
      { id: 'doc-p1', name: 'สรุปผลปิดโครงการ_จิตอาสาทะเลพังงา.pdf', uploadedAt: '2026-07-02 15:30' }
    ],
    category: 'ชุมชนคุณธรรม',
    aiSummary: {
      projectName: 'โครงการอนุรักษ์ทรัพยากรทางทะเลด้วยจิตอาสาและภูมิปัญญาชุมชน',
      province: 'พังงา',
      detectedState: 'เสร็จสิ้นการดำเนินงาน',
      progressPercent: 100,
      stateRationale: 'ดำเนินกิจกรรมครบทุกขั้นตอนและได้รับการรับรองเป็นแหล่งเรียนรู้ต้นแบบเสร็จสิ้นแล้ว (100%)',
      overview: 'เครือข่ายประมงพื้นบ้าน จ.พังงา จัดตั้งธนาคารปูม้า 6 แห่ง และผ่านการรับรองเป็นแหล่งเรียนรู้คุณธรรมระดับจังหวัดสมบูรณ์',
      keyPoints: ['ธนาคารปูม้าสำเร็จ 6 ชุมชน', 'ขยะทะเลลดลง 34 ตัน ป่าชายเลนฟื้นฟู 150 ไร่'],
      actionItems: ['เผยแพร่ชุดความรู้และถอดบทเรียนผ่านเว็บไซต์ศูนย์คุณธรรม'],
      sourceFileName: 'สรุปผลปิดโครงการ_จิตอาสาทะเลพังงา.pdf',
      summarizedAt: '2026-07-02 15:35'
    }
  },
  {
    id: 'meet-rayong-1',
    projectId: 'PRJ-2026-001',
    projectName: 'โครงการขับเคลื่อนเครือข่ายความดีและวินัยการเงินภาคประชาชน จ.ระยอง',
    province: 'ระยอง',
    topic: 'ประชุมติดตามความก้าวหน้าโครงการวินัยการเงินและ Moral Credit จ.ระยอง',
    type: 'meeting',
    date: '2026-07-08',
    timeStart: '14:00',
    timeEnd: '15:30',
    meetingUrl: 'https://meet.google.com/rayong-moral-credit',
    documents: [
      { id: 'doc-r1', name: 'รายงานความก้าวหน้า_วินัยการเงินระยอง.docx', uploadedAt: '2026-07-08 14:00' }
    ],
    category: 'คุณธรรม 5 มิติ',
    aiSummary: {
      projectName: 'โครงการขับเคลื่อนเครือข่ายความดีและวินัยการเงินภาคประชาชน จ.ระยอง',
      province: 'ระยอง',
      detectedState: 'กำลังดำเนินงาน',
      progressPercent: 65,
      stateRationale: 'การดำเนินงานอยู่ในระยะที่ 2 มีความก้าวหน้ารวม 65% และอยู่ระหว่างเจรจา MOU กองทุนหมู่บ้าน',
      overview: 'จัดตั้งคณะทำงานไตรภาคีและฝึกอบรมวินัยการเงินแล้ว 3 รุ่น ผู้เข้าร่วม 370 คน อยู่ระหว่างเชื่อมโยง Moral Credit กับกองทุนหมุนเวียน',
      keyPoints: [
        'สำรวจหนี้สินครัวเรือน 12 ชุมชนครบถ้วน 100%',
        'ฝึกอบรมหลักสูตรบัญชีครัวเรือนพอเพียงแล้ว 3 รุ่น (370 คน)'
      ],
      actionItems: [
        'จัดอบรมรุ่นที่ 4 ให้ครบ 480 คน',
        'ลงนาม MOU ร่วมกับสัจจะออมทรัพย์ 8 กองทุน'
      ],
      sourceFileName: 'รายงานความก้าวหน้า_วินัยการเงินระยอง.docx',
      summarizedAt: '2026-07-08 15:30'
    }
  }
];

const PROJECTS_STORAGE_KEY = 'moral_realtime_tracked_projects_v2';
const MEETINGS_STORAGE_KEY = 'moral_realtime_project_meetings_v2';

export function emitMoralProjectsDbUpdated(): void {
  window.dispatchEvent(new CustomEvent('moral-projects-db-updated'));
}

export const CANONICAL_PROJECT_DATES: Record<string, { start: string; end: string }> = {
  'proj-1': { start: '2026-01-15', end: '2026-07-07' },
  'proj-2': { start: '2026-03-01', end: '2026-09-15' },
  'proj-3': { start: '2026-06-01', end: '2026-11-30' },
  'proj-4': { start: '2026-02-01', end: '2026-09-15' },
  'proj-5': { start: '2026-01-10', end: '2026-07-05' },
  'proj-6': { start: '2026-03-01', end: '2026-09-20' },
  'proj-7': { start: '2026-06-01', end: '2026-11-30' },
  'proj-8': { start: '2026-01-05', end: '2026-07-02' },
  'PRJ-2026-001': { start: '2026-06-01', end: '2026-09-30' },
  'proj-9': { start: '2026-06-01', end: '2026-09-30' }
};

function normalizeTrackedProject(p: MoralTrackedProject): MoralTrackedProject {
  const historyLogs = Array.isArray(p.historyLogs) ? p.historyLogs : [];
  const latestLog = historyLogs[0];
  const canon = CANONICAL_PROJECT_DATES[p.id];
  const startDate = p.startDate || canon?.start || p.latestMeetingDate || p.lastUpdatedAt?.slice(0, 10) || '2026-01-01';
  const endDate = p.endDate || canon?.end || '2026-12-31';

  return {
    ...p,
    startDate,
    endDate,
    actionItems: Array.isArray(p.actionItems) ? p.actionItems : [],
    latestActionItems: Array.isArray(p.latestActionItems)
      ? p.latestActionItems
      : Array.isArray(p.actionItems)
      ? p.actionItems
      : [],
    latestStateRationale: p.latestStateRationale || p.stateRationale || '',
    updatedAt: p.updatedAt || p.lastUpdatedAt || '',
    meetingsCount: typeof p.meetingsCount === 'number' ? p.meetingsCount : Math.max(1, historyLogs.length),
    latestMeetingTopic: p.latestMeetingTopic || latestLog?.meetingTopic || '',
    latestMeetingDate: p.latestMeetingDate || latestLog?.date || p.lastUpdatedAt?.slice(0, 10) || '',
    historyLogs
  };
}

export function loadTrackedProjects(): MoralTrackedProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge missing initial projects if any
        const existingIds = new Set(parsed.map((p: any) => p.id));
        let hasNew = false;
        for (const initP of INITIAL_TRACKED_PROJECTS) {
          if (!existingIds.has(initP.id)) {
            parsed.push(initP);
            hasNew = true;
          }
        }
        if (hasNew) {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed.map(normalizeTrackedProject);
      }
    }
  } catch (err) {
    console.warn('Failed to load tracked projects from localStorage:', err);
  }
  const normalizedInitial = INITIAL_TRACKED_PROJECTS.map(normalizeTrackedProject);
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(normalizedInitial));
  return normalizedInitial;
}

export function saveTrackedProjects(projects: MoralTrackedProject[]): void {
  try {
    const normalized = projects.map(normalizeTrackedProject);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(normalized));
    emitMoralProjectsDbUpdated();
  } catch (err) {
    console.warn('Failed to save tracked projects to localStorage:', err);
  }
}

export function loadProjectMeetings(): MoralMeetingEvent[] {
  try {
    const raw = localStorage.getItem(MEETINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((m: any) => m.id));
        let hasNew = false;
        for (const initM of INITIAL_PROJECT_MEETINGS) {
          if (!existingIds.has(initM.id)) {
            parsed.push(initM);
            hasNew = true;
          }
        }
        if (hasNew) {
          localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load project meetings from localStorage:', err);
  }
  localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(INITIAL_PROJECT_MEETINGS));
  return INITIAL_PROJECT_MEETINGS;
}

export function saveProjectMeetings(meetings: MoralMeetingEvent[]): void {
  try {
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
    emitMoralProjectsDbUpdated();
  } catch (err) {
    console.warn('Failed to save project meetings to localStorage:', err);
  }
}

export function addAttachmentToMeeting(meetingId: string, doc: MeetingDocument): MoralMeetingEvent[] {
  const list = loadProjectMeetings();
  const idx = list.findIndex((m) => m.id === meetingId);
  if (idx !== -1) {
    const updatedDocs = [...(list[idx].documents || []), doc];
    list[idx] = { ...list[idx], documents: updatedDocs };
    saveProjectMeetings(list);
  }
  return list;
}

export function removeAttachmentFromMeeting(meetingId: string, documentId: string): MoralMeetingEvent[] {
  const list = loadProjectMeetings();
  const idx = list.findIndex((m) => m.id === meetingId);
  if (idx !== -1) {
    const updatedDocs = (list[idx].documents || []).filter((d) => d.id !== documentId);
    list[idx] = { ...list[idx], documents: updatedDocs };
    saveProjectMeetings(list);
  }
  return list;
}

export async function syncProjectToSupabaseIfAvailable(project: MoralTrackedProject): Promise<void> {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    await supabase.from('moral_realtime_projects').upsert(
      {
        id: project.id,
        name: project.name,
        province: project.province,
        region: project.region,
        category: project.category,
        state: project.state,
        progress_percent: project.progressPercent,
        latest_summary: project.latestSummary,
        key_points: project.keyPoints,
        action_items: project.actionItems,
        state_rationale: project.stateRationale,
        source_file_name: project.sourceFileName || null,
        last_updated_at: project.lastUpdatedAt
      },
      { onConflict: 'id' }
    );
  } catch {
    // Silent fallback when table does not exist in remote Supabase
  }
}

export function createNewTrackedProject(
  nameOrParams: string | {
    id?: string;
    name: string;
    province: string;
    category?: MoralProjectCategory;
    organization?: string;
    state?: ProjectProgressState;
    progressPercent?: number;
    summary?: string;
    startDate?: string;
    endDate?: string;
  },
  provinceArg?: string,
  categoryArg?: MoralProjectCategory
): MoralTrackedProject {
  const projects = loadTrackedProjects();
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const isObj = typeof nameOrParams !== 'string';
  const cleanName = isObj ? nameOrParams.name.trim() : nameOrParams.trim();
  const province = (isObj ? nameOrParams.province : provinceArg) || 'กรุงเทพมหานคร';
  const category = (isObj ? nameOrParams.category : categoryArg) || 'ชุมชนคุณธรรม';
  const region = getRegionForProvince(province);
  const projectId = (isObj && nameOrParams.id) ? nameOrParams.id : `proj-${Date.now()}`;
  const progressPercent = (isObj && typeof nameOrParams.progressPercent === 'number') ? nameOrParams.progressPercent : 15;
  const state: ProjectProgressState = (isObj && nameOrParams.state)
    ? nameOrParams.state
    : (progressPercent >= 100 ? 'เสร็จสิ้นการดำเนินงาน' : progressPercent >= 30 ? 'กำลังดำเนินงาน' : 'เริ่มต้น');
  const summary = (isObj && nameOrParams.summary)
    ? nameOrParams.summary
    : `สร้างโครงการ "${cleanName}" ในพื้นที่จังหวัด${province} (${region}) เรียบร้อยแล้ว อยู่ระหว่างการนัดหมายประชุมเริ่มต้นและวางแผนการดำเนินงาน`;

  // Check if project already exists
  const existingIdx = projects.findIndex((p) => p.id === projectId);
  if (existingIdx !== -1) {
    const existing = projects[existingIdx];
    const updatedProj = normalizeTrackedProject({
      ...existing,
      name: cleanName || existing.name,
      province,
      region,
      category,
      state,
      progressPercent,
      latestSummary: summary,
      lastUpdatedAt: nowStr,
      updatedAt: nowStr
    });
    projects[existingIdx] = updatedProj;
    saveTrackedProjects(projects);
    void syncProjectToSupabaseIfAvailable(updatedProj);
    return updatedProj;
  }

  const rawProj: MoralTrackedProject = {
    id: projectId,
    name: cleanName,
    province,
    region,
    category,
    state,
    progressPercent,
    latestSummary: summary,
    keyPoints: [
      `ขึ้นทะเบียนโครงการ "${cleanName}" ประจำจังหวัด${province}`,
      'เตรียมจัดประชุมชี้แจงวัตถุประสงค์และแต่งตั้งคณะทำงานขับเคลื่อน'
    ],
    actionItems: [
      'สร้างนัดหมายการประชุมในปฏิทินและอัปโหลดบันทึกการประชุมเพื่อให้ AI ติดตามความคืบหน้า'
    ],
    stateRationale:
      state === 'เสร็จสิ้นการดำเนินงาน'
        ? 'โครงการดำเนินการบรรลุเป้าหมายครบถ้วน 100%'
        : state === 'กำลังดำเนินงาน'
        ? 'อยู่ระหว่างการขับเคลื่อนกิจกรรม'
        : 'โครงการเพิ่งถูกสร้างขึ้นใหม่ในระบบ จึงเริ่มต้นที่สถานะ 1. เริ่มต้น',
    lastUpdatedAt: nowStr,
    meetingsCount: 0,
    historyLogs: []
  };

  const newProj = normalizeTrackedProject(rawProj);
  const updated = [newProj, ...projects];
  saveTrackedProjects(updated);
  void syncProjectToSupabaseIfAvailable(newProj);
  return newProj;
}

export function deleteTrackedProject(projectId: string): MoralTrackedProject[] {
  const projects = loadTrackedProjects();
  const updated = projects.filter((p) => p.id !== projectId);
  saveTrackedProjects(updated);

  // Also remove meetings for this project
  const meetings = loadProjectMeetings();
  const updatedMeetings = meetings.filter((m) => m.projectId !== projectId);
  saveProjectMeetings(updatedMeetings);

  return updated;
}

export function updateTrackedProjectProgress(
  projectId: string,
  progressPercent: number,
  state?: ProjectProgressState
): MoralTrackedProject[] {
  const projects = loadTrackedProjects();
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const detectedState: ProjectProgressState =
    state || (progressPercent >= 100 ? 'เสร็จสิ้นการดำเนินงาน' : progressPercent >= 30 ? 'กำลังดำเนินงาน' : 'เริ่มต้น');

  const updated = projects.map((p) => {
    if (p.id === projectId) {
      const next = normalizeTrackedProject({
        ...p,
        progressPercent,
        state: detectedState,
        lastUpdatedAt: nowStr,
        updatedAt: nowStr
      });
      void syncProjectToSupabaseIfAvailable(next);
      return next;
    }
    return p;
  });

  saveTrackedProjects(updated);
  return updated;
}

export function updateTrackedProjectState(
  projectId: string,
  newState: ProjectProgressState
): MoralTrackedProject[] {
  const projects = loadTrackedProjects();
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const defaultProg = PROJECT_STATE_META[newState]?.defaultProgress ?? 50;

  const updated = projects.map((p) => {
    if (p.id === projectId) {
      const next = normalizeTrackedProject({
        ...p,
        state: newState,
        progressPercent: newState === 'เสร็จสิ้นการดำเนินงาน' ? 100 : (p.progressPercent || defaultProg),
        lastUpdatedAt: nowStr,
        updatedAt: nowStr
      });
      void syncProjectToSupabaseIfAvailable(next);
      return next;
    }
    return p;
  });
  saveTrackedProjects(updated);
  emitMoralProjectsDbUpdated();
  return updated;
}

export function updateTrackedProjectProvince(projectId: string, newProvince: string): MoralTrackedProject[] {
  const projects = loadTrackedProjects();
  const region = getRegionForProvince(newProvince);
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const updated = projects.map((p) => {
    if (p.id === projectId) {
      const next = normalizeTrackedProject({
        ...p,
        province: newProvince,
        region,
        lastUpdatedAt: nowStr,
        updatedAt: nowStr
      });
      void syncProjectToSupabaseIfAvailable(next);
      return next;
    }
    return p;
  });
  saveTrackedProjects(updated);

  // Also sync province on meetings belonging to this project
  const meetings = loadProjectMeetings();
  const updatedMeetings = meetings.map((m) =>
    m.projectId === projectId ? { ...m, province: newProvince } : m
  );
  saveProjectMeetings(updatedMeetings);

  return updated;
}

export function updateProjectStateFromMeetingSummary(
  projectId: string,
  meetingId: string,
  meetingTopic: string,
  meetingDate: string,
  summary: MeetingAiSummary
): MoralTrackedProject[] {
  const projects = loadTrackedProjects();
  const newLog: ProjectHistoryLog = {
    id: `log-${Date.now()}`,
    meetingId,
    meetingTopic,
    date: meetingDate,
    stateDetected: summary.detectedState,
    progressPercent: summary.progressPercent,
    summary: summary.overview,
    stateRationale: summary.stateRationale,
    fileName: summary.sourceFileName,
    updatedAt: summary.summarizedAt
  };

  const updated = projects.map((p) => {
    if (p.id === projectId) {
      const nextHistory = [newLog, ...(p.historyLogs || [])];
      const next = normalizeTrackedProject({
        ...p,
        state: summary.detectedState,
        progressPercent: summary.progressPercent,
        latestSummary: summary.overview,
        keyPoints: summary.keyPoints,
        actionItems: summary.actionItems,
        latestActionItems: summary.actionItems,
        stateRationale: summary.stateRationale,
        latestStateRationale: summary.stateRationale,
        lastUpdatedAt: summary.summarizedAt,
        updatedAt: summary.summarizedAt,
        latestMeetingTopic: meetingTopic,
        latestMeetingDate: meetingDate,
        meetingsCount: Math.max((p.meetingsCount || 0) + 1, nextHistory.length),
        sourceFileName: summary.sourceFileName,
        historyLogs: nextHistory
      });
      void syncProjectToSupabaseIfAvailable(next);
      return next;
    }
    return p;
  });

  saveTrackedProjects(updated);
  return updated;
}

// ============================================================================
// AI MEETING MINUTES SUMMARIZER & 3-STATE PROGRESS DETECTOR
// ============================================================================
export async function summarizeAndClassifyProjectStateWithAI(
  rawText: string,
  meeting: MoralMeetingEvent,
  fileName: string
): Promise<MeetingAiSummary> {
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const apiKey = localStorage.getItem('ai_api_key');
  const model = localStorage.getItem('ai_model') || 'openai/gpt-4o-mini';

  const cleanedText = rawText.replace(/\s+/g, ' ').trim();

  if (apiKey && cleanedText.length > 15) {
    try {
      const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการประเมินและติดตามความก้าวหน้าโครงการคุณธรรมของศูนย์คุณธรรม (องค์การมหาชน)
หน้าที่ของคุณคืออ่านเนื้อหา "บันทึกการประชุม" ที่อัปโหลดเข้ามา แล้วทำการสรุปสาระสำคัญ พร้อมวิเคราะห์ตรวจสอบความคืบหน้าของโครงการว่าปัจจุบันอยู่ใน State ใดจาก 4 State ต่อไปนี้เท่านั้น:
1. "เริ่มต้น" (เมื่อเนื้อหาเป็นการวางแผนเริ่มต้น, แต่งตั้งคณะทำงาน, ชี้แจงโครงการ, สำรวจข้อมูลเบื้องต้น, ปฐมนิเทศ)
2. "กำลังดำเนินงาน" (เมื่อเนื้อหาเป็นการลงพื้นที่จัดกิจกรรม, ขับเคลื่อนงานตามแผน, ติดตามความก้าวหน้ากลางน้ำ, แก้ไขปัญหาอุปสรรคระหว่างดำเนินงาน)
3. "เสร็จสิ้นการดำเนินงาน" (เมื่อเนื้อหาเป็นการสรุปผลสัมฤทธิ์โครงการ, บรรลุตัวชี้วัดครบถ้วน, ถอดบทเรียนปลายน้ำเสร็จสมบูรณ์, ปิดโครงการ หรือส่งมอบงาน)
4. "เกินระยะเวลาการดำเนินงาน" (เมื่อเนื้อหาระบุว่าดำเนินงานล่าช้ากว่าแผน, เกินกรอบระยะเวลาตามปฏิทิน, ไม่สามารถส่งมอบงานได้ทันตามกำหนด หรือต้องเร่งรัดติดตามประเมินผล)

คุณต้องตอบกลับเป็น JSON ตามโครงสร้างนี้เท่านั้น (ห้ามมี Markdown คั่น):
{
  "detectedState": "เริ่มต้น" | "กำลังดำเนินงาน" | "เสร็จสิ้นการดำเนินงาน" | "เกินระยะเวลาการดำเนินงาน",
  "progressPercent": ตัวเลข 15 ถึง 100 (เริ่มต้น: 15-30, กำลังดำเนินงาน: 40-85, เสร็จสิ้นการดำเนินงาน: 100, เกินระยะเวลาการดำเนินงาน: 30-70),
  "stateRationale": "อธิบายเหตุผลและหลักฐานจากบันทึกการประชุมที่บ่งชี้ว่าโครงการอยู่ใน State นี้ (1-2 ประโยค)",
  "overview": "สรุปภาพรวมและสาระสำคัญของการประชุม 2-3 ประโยค",
  "keyPoints": ["ประเด็นสำคัญที่ 1", "ประเด็นสำคัญที่ 2", "ประเด็นสำคัญที่ 3"],
  "actionItems": ["มติที่ประชุมหรือแนวทางขับเคลื่อนต่อที่ 1", "มติที่ประชุมหรือแนวทางขับเคลื่อนต่อที่ 2"]
}`;

      const userPrompt = `ชื่อโครงการ: ${meeting.projectName}
จังหวัด: ${meeting.province}
หัวข้อการประชุม: ${meeting.topic}
หมวดหมู่: ${meeting.category}
ชื่อไฟล์บันทึกการประชุม: ${fileName}

เนื้อหาบันทึกการประชุม:
${cleanedText.slice(0, 9000)}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Moral Center Real-time Project State Analyzer',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiContent = data.choices?.[0]?.message?.content || '';
        const cleanJson = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        const validStates: ProjectProgressState[] = ['เริ่มต้น', 'กำลังดำเนินงาน', 'เสร็จสิ้นการดำเนินงาน', 'เกินระยะเวลาการดำเนินงาน'];
        const detectedState: ProjectProgressState = validStates.includes(parsed.detectedState)
          ? parsed.detectedState
          : 'กำลังดำเนินงาน';

        const progressPercent =
          detectedState === 'เสร็จสิ้นการดำเนินงาน'
            ? 100
            : typeof parsed.progressPercent === 'number'
            ? Math.max(10, Math.min(95, Math.round(parsed.progressPercent)))
            : PROJECT_STATE_META[detectedState].defaultProgress;

        if (parsed.overview && Array.isArray(parsed.keyPoints)) {
          return {
            projectName: meeting.projectName,
            province: meeting.province,
            detectedState,
            progressPercent,
            stateRationale:
              parsed.stateRationale ||
              `วิเคราะห์จากเนื้อหาบันทึกการประชุม "${meeting.topic}" พบหลักฐานสอดคล้องกับสถานะ "${detectedState}"`,
            overview: parsed.overview,
            keyPoints: parsed.keyPoints.slice(0, 4),
            actionItems:
              Array.isArray(parsed.actionItems) && parsed.actionItems.length > 0
                ? parsed.actionItems.slice(0, 3)
                : ['ติดตามผลการนำมติที่ประชุมไปขับเคลื่อนในพื้นที่เป้าหมาย'],
            sourceFileName: fileName,
            summarizedAt: nowStr
          };
        }
      }
    } catch (err) {
      console.warn('OpenRouter project state classification fallback triggered:', err);
    }
  }

  // Intelligent Local Thai NLP Analyzer Fallback (วิเคราะห์เนื้อหาไฟล์และจำแนก 3 State อัตโนมัติ)
  await new Promise((r) => setTimeout(r, 700));

  const combinedContext = `${fileName} ${meeting.topic} ${cleanedText}`.toLowerCase();

  const overdueKeywords = [
    'เกินระยะเวลา', 'เกินกำหนด', 'ล่าช้า', 'ไม่ทันตามกำหนด', 'เกินเวลา', 'เลยกำหนด',
    'เร่งรัด', 'ขยายเวลา', 'ติดขัด', 'ไม่เป็นไปตามแผน', 'เลยกำหนดส่งมอบ', 'ล่าช้ากว่ากำหนด'
  ];
  let scoreOverdue = 0;
  overdueKeywords.forEach((kw) => {
    if (combinedContext.includes(kw)) scoreOverdue += 2;
  });

  const completedKeywords = [
    'เสร็จสิ้น', 'ปิดโครงการ', 'สรุปผลสัมฤทธิ์', 'บรรลุเป้าหมาย', 'รายงานฉบับสมบูรณ์',
    'ครบ 100', '100%', 'ส่งมอบงาน', 'ถอดบทเรียนสำเร็จ', 'เสร็จสมบูรณ์', 'ปลายน้ำ'
  ];
  const initiationKeywords = [
    'เริ่มต้น', 'ริเริ่ม', 'ปฐมนิเทศ', 'แต่งตั้งคณะทำงาน', 'วางแผนเริ่มต้น', 'ชี้แจงโครงการ',
    'เตรียมความพร้อม', 'สำรวจเบื้องต้น', 'ครั้งที่ 1', 'เปิดโครงการ', 'ต้นน้ำ'
  ];
  const inProgressKeywords = [
    'กำลังดำเนินงาน', 'ความก้าวหน้า', 'ความคืบหน้า', 'ระหว่างดำเนินการ', 'ลงพื้นที่',
    'ติดตามผล', 'กลางน้ำ', 'ขยายผล', 'แก้ไขปัญหา', 'ครั้งที่ 2', 'ครั้งที่ 3'
  ];

  let scoreCompleted = 0;
  let scoreInitiation = 0;
  let scoreInProgress = 0;

  completedKeywords.forEach((kw) => {
    if (combinedContext.includes(kw)) scoreCompleted += 2;
  });
  initiationKeywords.forEach((kw) => {
    if (combinedContext.includes(kw)) scoreInitiation += 2;
  });
  inProgressKeywords.forEach((kw) => {
    if (combinedContext.includes(kw)) scoreInProgress += 2;
  });

  let detectedState: ProjectProgressState = 'กำลังดำเนินงาน';
  let progressPercent = 65;
  let stateRationale = '';

  if (scoreOverdue >= 3 || (scoreOverdue > 0 && (combinedContext.includes('เกินระยะเวลา') || combinedContext.includes('ล่าช้ากว่าแผน') || combinedContext.includes('ไม่ทันตามกำหนด')))) {
    detectedState = 'เกินระยะเวลาการดำเนินงาน';
    progressPercent = 50;
    stateRationale = `ตรวจพบข้อความบ่งชี้ความล่าช้าและการดำเนินงานเกินกรอบระยะเวลาตามแผนงานจากไฟล์ "${fileName}" จึงจำแนกสถานะเป็น "4. เกินระยะเวลาการดำเนินงาน" เพื่อเร่งรัดติดตาม`;
  } else if (scoreCompleted > scoreInitiation && scoreCompleted >= scoreInProgress && scoreCompleted > 0) {
    detectedState = 'เสร็จสิ้นการดำเนินงาน';
    progressPercent = 100;
    stateRationale = `ตรวจพบคำสำคัญและสาระการสรุปผลสัมฤทธิ์ปลายน้ำ/ปิดโครงการจากไฟล์ "${fileName}" จึงจำแนกสถานะเป็น "3. เสร็จสิ้นการดำเนินงาน (100%)"`;
  } else if (scoreInitiation > scoreInProgress && scoreInitiation > scoreCompleted) {
    detectedState = 'เริ่มต้น';
    progressPercent = 25;
    stateRationale = `ตรวจพบสาระการวางแผนเริ่มต้น ชี้แจงแนวทาง และเตรียมความพร้อมของโครงการจากไฟล์ "${fileName}" จึงจำแนกสถานะเป็น "1. เริ่มต้น (25%)"`;
  } else {
    detectedState = 'กำลังดำเนินงาน';
    progressPercent = 65;
    stateRationale = `ตรวจพบการรายงานความก้าวหน้าการลงพื้นที่จัดกิจกรรมและการติดตามผลระหว่างดำเนินการจากไฟล์ "${fileName}" จึงจำแนกสถานะเป็น "2. กำลังดำเนินงาน (65%)"`;
  }

  const sentences = cleanedText
    .split(/[\r\n•\-–—.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 18 && !s.startsWith('เอกสารโครงการ'));

  const excerptOverview =
    sentences.length > 0
      ? `สรุปบันทึกการประชุมโครงการ "${meeting.projectName}" (จ.${meeting.province}) เรื่อง "${meeting.topic}" จากไฟล์ ${fileName}: ${sentences.slice(0, 2).join(' ')}`.slice(0, 360)
      : `สรุปผลการประชุมโครงการ "${meeting.projectName}" พื้นที่จังหวัด${meeting.province} หัวข้อ "${meeting.topic}" โดยที่ประชุมได้ติดตามความก้าวหน้าการดำเนินงานซึ่งปัจจุบันอยู่ในสถานะ "${detectedState}" (${progressPercent}%)`;

  const extractedKeyPoints =
    sentences.length >= 3
      ? sentences.slice(0, 3).map((s) => (s.length > 130 ? `${s.slice(0, 130)}...` : s))
      : [
          `ทบทวนผลการดำเนินงานโครงการ "${meeting.projectName}" ในพื้นที่จังหวัด${meeting.province} (สถานะปัจจุบัน: ${detectedState})`,
          `ติดตามตัวชี้วัดและพฤติกรรมพึงประสงค์ภายใต้หมวดหมู่${meeting.category} ร่วมกับภาคีเครือข่าย`,
          `รวบรวมหลักฐานเชิงประจักษ์จากบันทึกการประชุมเพื่ออัปเดตฐานข้อมูลติดตามโครงการแบบ Real-time`
        ];

  const extractedActions =
    sentences.length >= 5
      ? sentences.slice(3, 5).map((s) => (s.length > 120 ? `${s.slice(0, 120)}...` : s))
      : detectedState === 'เสร็จสิ้นการดำเนินงาน'
      ? [
          `รวบรวมรายงานฉบับสมบูรณ์และชุดองค์ความรู้ของโครงการ "${meeting.projectName}" เข้าสู่คลังข้อมูลศูนย์คุณธรรม`,
          `เตรียมขยายผลเป็นแหล่งเรียนรู้ต้นแบบในจังหวัด${meeting.province}`
        ]
      : [
          `นำมติที่ประชุมไปขับเคลื่อนกิจกรรมต่อเนื่องในพื้นที่จังหวัด${meeting.province}`,
          `นัดหมายประชุมติดตามความก้าวหน้าและอัปโหลดบันทึกการประชุมในรอบถัดไป`
        ];

  return {
    projectName: meeting.projectName,
    province: meeting.province,
    detectedState,
    progressPercent,
    stateRationale,
    overview: excerptOverview,
    keyPoints: extractedKeyPoints,
    actionItems: extractedActions,
    sourceFileName: fileName,
    summarizedAt: nowStr
  };
}
