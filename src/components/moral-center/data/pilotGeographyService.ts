import { type PilotProvinceName } from './pilotActivitiesSqliteService';
import { getDistrictsForProvince } from '../../../utils/thaiGeography';

export const ALL_77_PROVINCES: string[] = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
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

export const PROVINCE_DISTRICTS: Record<PilotProvinceName, string[]> = {
  'อยุธยา': [
    'พระนครศรีอยุธยา', 'บางปะอิน', 'เสนา', 'บางไทร', 'วังน้อย', 'อุทัย', 'นครหลวง',
    'ท่าเรือ', 'มหาราช', 'ผักไห่', 'ลาดบัวหลวง', 'บ้านแพรก', 'บางบาล', 'บางปะหัน', 'ภาชี', 'บางซ้าย'
  ],
  'อุดรธานี': [
    'เมืองอุดรธานี', 'กุมภวาปี', 'หนองหาน', 'บ้านดุง', 'เพ็ญ', 'บ้านผือ', 'โนนสะอาด', 'หนองแสง',
    'กุดจับ', 'วังสามหมอ', 'ทุ่งฝน', 'สร้างคอม', 'ศรีธาตุ', 'น้ำโสม', 'นายูง', 'พิบูลย์รักษ์', 'กู่แก้ว', 'ประจักษ์ศิลปาคม'
  ],
  'ลำปาง': [
    'เมืองลำปาง', 'แม่เมาะ', 'เกาะคา', 'เสริมงาม', 'งาว', 'แจ้ห่ม', 'วังเหนือ', 'เถิน',
    'แม่พริก', 'แม่ทะ', 'สบปราบ', 'ห้างฉัตร', 'เมืองปาน'
  ],
  'สุราษฎร์ธานี': [
    'เมืองสุราษฎร์ธานี', 'พุนพิน', 'เกาะสมุย', 'เกาะพะงัน', 'บ้านตาขุน', 'พนม', 'คีรีรัฐนิคม',
    'ดอนสัก', 'กาญจนดิษฐ์', 'ไชยา', 'ท่าชนะ', 'เวียงสระ', 'พระแสง', 'เคียนซา', 'ชัยบุรี',
    'บ้านนาสาร', 'บ้านนาเดิม', 'ท่าฉาง', 'วิภาวดี'
  ],
  // Legacy aliases
  'กาฬสินธุ์': [
    'เมืองอุดรธานี', 'กุมภวาปี', 'หนองหาน', 'บ้านดุง', 'เพ็ญ', 'บ้านผือ', 'โนนสะอาด', 'หนองแสง',
    'กุดจับ', 'วังสามหมอ', 'ทุ่งฝน', 'สร้างคอม', 'ศรีธาตุ', 'น้ำโสม', 'นายูง', 'พิบูลย์รักษ์', 'กู่แก้ว', 'ประจักษ์ศิลปาคม'
  ],
  'น่าน': [
    'เมืองลำปาง', 'แม่เมาะ', 'เกาะคา', 'เสริมงาม', 'งาว', 'แจ้ห่ม', 'วังเหนือ', 'เถิน',
    'แม่พริก', 'แม่ทะ', 'สบปราบ', 'ห้างฉัตร', 'เมืองปาน'
  ],
  'ระยอง': ['เมืองระยอง', 'บ้านฉาง', 'แกลง', 'วังจันทร์', 'บ้านค่าย', 'ปลวกแดง', 'เขาชะเมา', 'นิคมพัฒนา'],
  'หนองคาย': ['เมืองหนองคาย', 'ท่าบ่อ', 'โพนพิสัย', 'ศรีเชียงใหม่', 'สังคม', 'สระใคร', 'เฝ้าไร่', 'รัตนวาปี', 'โพธิ์ตาก'],
  'พังงา': ['เมืองพังงา', 'เกาะยาว', 'กะปง', 'ตะกั่วทุ่ง', 'ตะกั่วป่า', 'คุระบุรี', 'ทับปุด', 'ท้ายเหมือง']
};

export const getDefaultDistrictForProvince = (prov: string): string => {
  if (!prov) return '';
  if (prov === 'กรุงเทพมหานคร') return 'เขตพระนคร';
  if (PROVINCE_DISTRICTS[prov as PilotProvinceName]) {
    return PROVINCE_DISTRICTS[prov as PilotProvinceName][0];
  }
  const dists = getDistrictsForProvince(prov);
  if (dists && dists.length > 0) {
    return dists[0];
  }
  return `เมือง${prov}`;
};

export const PROVINCE_HERO_BG: Record<PilotProvinceName, string> = {
  'อยุธยา': '/theme/pilot_card_bg_ayutthaya.jpg',
  'อุดรธานี': '/theme/pilot_card_bg_udonthani.jpg',
  'ลำปาง': '/theme/pilot_card_bg_lampang.jpg',
  'สุราษฎร์ธานี': '/theme/pilot_card_bg_surat.jpg',
  'กาฬสินธุ์': '/theme/pilot_card_bg_udonthani.jpg',
  'น่าน': '/theme/pilot_card_bg_lampang.jpg',
  'ระยอง': '/theme/pilot_card_bg_ayutthaya.jpg',
  'หนองคาย': '/theme/pilot_card_bg_udonthani.jpg',
  'พังงา': '/theme/pilot_card_bg_surat.jpg'
};

export const PROVINCE_HERO_BG_MOBILE: Record<PilotProvinceName, string> = {
  'อยุธยา': '/theme/pilot_card_bg_ayutthaya_mobile.jpg',
  'อุดรธานี': '/theme/pilot_card_bg_udonthani_mobile.jpg',
  'ลำปาง': '/theme/pilot_card_bg_lampang_mobile.jpg',
  'สุราษฎร์ธานี': '/theme/pilot_card_bg_surat_mobile.jpg',
  'กาฬสินธุ์': '/theme/pilot_card_bg_udonthani_mobile.jpg',
  'น่าน': '/theme/pilot_card_bg_lampang_mobile.jpg',
  'ระยอง': '/theme/pilot_card_bg_ayutthaya_mobile.jpg',
  'หนองคาย': '/theme/pilot_card_bg_udonthani_mobile.jpg',
  'พังงา': '/theme/pilot_card_bg_surat_mobile.jpg'
};

export function detectProvinceFromText(
  texts: (string | undefined | null)[],
  fallbackProvince: string = 'อยุธยา'
): string {
  for (const raw of texts) {
    if (!raw) continue;
    const t = raw.trim();
    if (!t) continue;

    // 1. ตรวจสอบชื่อเฉพาะและนามแฝงหลัก
    if (t.includes('นครราชสีมา') || t.includes('โคราช')) return 'นครราชสีมา';
    if (t.includes('พระนครศรีอยุธยา') || t.includes('อยุธยา') || t.includes('กรุงเก่า')) return 'อยุธยา';
    if (t.includes('สุราษฎร์ธานี') || t.includes('สุราษฎร์')) return 'สุราษฎร์ธานี';
    if (t.includes('อุดรธานี') || t.includes('อุดร')) return 'อุดรธานี';
    if (t.includes('ลำปาง')) return 'ลำปาง';
    if (t.includes('เชียงใหม่')) return 'เชียงใหม่';
    if (t.includes('ขอนแก่น')) return 'ขอนแก่น';
    if (t.includes('ชลบุรี') || t.includes('พัทยา')) return 'ชลบุรี';
    if (t.includes('สงขลา') || t.includes('หาดใหญ่')) return 'สงขลา';
    if (t.includes('กรุงเทพมหานคร') || t.includes('กรุงเทพ') || t.includes('กทม')) return 'กรุงเทพมหานคร';
    if (t.includes('สมุทรปราการ') || t.includes('ปากน้ำ')) return 'สมุทรปราการ';
    if (t.includes('สมุทรสาคร') || t.includes('มหาชัย')) return 'สมุทรสาคร';
    if (t.includes('สมุทรสงคราม') || t.includes('แม่กลอง')) return 'สมุทรสงคราม';
    if (t.includes('ฉะเชิงเทรา') || t.includes('แปดริ้ว')) return 'ฉะเชิงเทรา';

    // 2. ค้นหาใน 77 จังหวัดทั้งหมด
    for (const p of ALL_77_PROVINCES) {
      if (t.includes(p)) {
        return p === 'พระนครศรีอยุธยา' ? 'อยุธยา' : p;
      }
    }
  }

  return fallbackProvince || 'อยุธยา';
}
