/**
 * Thailand 77 Provinces + National Demographics Registry
 * ฐานข้อมูลประชากรและครัวเรือนจริงของ 77 จังหวัดทั่วไทย และระดับประเทศไทย
 * อ้างอิงตามสถิติทางการของสำนักบริหารการทะเบียน กรมการปกครอง กระทรวงมหาดไทย (พ.ศ. 2566-2568)
 * ใช้เป็นเกณฑ์มาตรฐานในการตรวจสอบความสมจริงและความเป็นไปได้ (Feasibility & Realism Assessment)
 * ของข้อเสนอโครงการแฮกกาธอนและการปรับพฤติกรรมคุณธรรม
 */

export interface ProvinceDemographics {
  name: string;               // ชื่อจังหวัดทางการ (เช่น 'พระนครศรีอยุธยา' หรือ 'ประเทศไทย')
  shortName: string;          // ชื่อเรียกทั่วไป (เช่น 'อยุธยา', 'โคราช', 'กทม')
  aliases: string[];          // คำพ้องและชื่อย่อ
  region: 'central' | 'northern' | 'northeastern' | 'eastern' | 'western' | 'southern' | 'national';
  regionThai: string;         // ชื่อภูมิภาคภาษาไทย
  population: number;         // จำนวนประชากรจริง (คน)
  households: number;         // จำนวนครัวเรือนจริง (ครัวเรือน)
  maxPilotAudience: number;   // เพดานกลุ่มเป้าหมายนำร่องที่สมเหตุสมผล (คน)
  maxPilotHouseholds: number; // เพดานกลุ่มเป้าหมายนำร่องที่สมเหตุสมผล (ครัวเรือน)
  isNational?: boolean;       // ระบุว่าเป็นระดับประเทศไทยหรือไม่
}

// ฐานข้อมูลประเทศไทย (ระดับชาติ / ทั่วประเทศ)
export const THAILAND_NATIONAL_DEMOGRAPHICS: ProvinceDemographics = {
  name: 'ประเทศไทย',
  shortName: 'ทั่วประเทศ',
  aliases: ['ประเทศไทย', 'ทั่วประเทศ', 'ระดับประเทศ', 'ทั้งประเทศ', 'ทุกจังหวัด', 'ส่วนกลาง', 'ไทย', 'Thailand', 'national'],
  region: 'national',
  regionThai: 'ภาพรวมระดับประเทศ',
  population: 66050000,       // ~66.05 ล้านคน
  households: 28450000,       // ~28.45 ล้านครัวเรือน
  maxPilotAudience: 50000,    // โครงการนำร่องระดับชาติระยะแรก ไม่ควรเกิน 50,000 คน
  maxPilotHouseholds: 15000,  // ไม่ควรเกิน 15,000 ครัวเรือน
  isNational: true
};

// ฐานข้อมูลครบทั้ง 77 จังหวัด
export const THAILAND_77_PROVINCES_DEMOGRAPHICS: Record<string, ProvinceDemographics> = {
  // --------------------------------------------------------------------------
  // 1. ภาคกลาง (22 จังหวัด)
  // --------------------------------------------------------------------------
  'กรุงเทพมหานคร': {
    name: 'กรุงเทพมหานคร',
    shortName: 'กทม.',
    aliases: ['กรุงเทพมหานคร', 'กรุงเทพฯ', 'กรุงเทพ', 'กทม.', 'กทม', 'Bangkok'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 5500000,
    households: 3200000,
    maxPilotAudience: 25000,
    maxPilotHouseholds: 8000
  },
  'สมุทรปราการ': {
    name: 'สมุทรปราการ',
    shortName: 'สมุทรปราการ',
    aliases: ['สมุทรปราการ', 'ปากน้ำ'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 1360000,
    households: 700000,
    maxPilotAudience: 15000,
    maxPilotHouseholds: 5000
  },
  'นนทบุรี': {
    name: 'นนทบุรี',
    shortName: 'นนทบุรี',
    aliases: ['นนทบุรี', 'เมืองนนท์'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 1300000,
    households: 650000,
    maxPilotAudience: 15000,
    maxPilotHouseholds: 5000
  },
  'ปทุมธานี': {
    name: 'ปทุมธานี',
    shortName: 'ปทุมธานี',
    aliases: ['ปทุมธานี', 'เมืองปทุม'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 1210000,
    households: 600000,
    maxPilotAudience: 14000,
    maxPilotHouseholds: 4500
  },
  'พระนครศรีอยุธยา': {
    name: 'พระนครศรีอยุธยา',
    shortName: 'อยุธยา',
    aliases: ['พระนครศรีอยุธยา', 'อยุธยา', 'กรุงเก่า'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 820000,
    households: 315000,
    maxPilotAudience: 10000,
    maxPilotHouseholds: 3500
  },
  'อ่างทอง': {
    name: 'อ่างทอง',
    shortName: 'อ่างทอง',
    aliases: ['อ่างทอง'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 275000,
    households: 105000,
    maxPilotAudience: 5000,
    maxPilotHouseholds: 1800
  },
  'ลพบุรี': {
    name: 'ลพบุรี',
    shortName: 'ลพบุรี',
    aliases: ['ลพบุรี', 'เมืองละโว้'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 735000,
    households: 280000,
    maxPilotAudience: 9000,
    maxPilotHouseholds: 3000
  },
  'สิงห์บุรี': {
    name: 'สิงห์บุรี',
    shortName: 'สิงห์บุรี',
    aliases: ['สิงห์บุรี', 'เมืองสิงห์'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 202000,
    households: 80000,
    maxPilotAudience: 4000,
    maxPilotHouseholds: 1500
  },
  'ชัยนาท': {
    name: 'ชัยนาท',
    shortName: 'ชัยนาท',
    aliases: ['ชัยนาท'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 318000,
    households: 125000,
    maxPilotAudience: 6000,
    maxPilotHouseholds: 2000
  },
  'สระบุรี': {
    name: 'สระบุรี',
    shortName: 'สระบุรี',
    aliases: ['สระบุรี'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 645000,
    households: 275000,
    maxPilotAudience: 8500,
    maxPilotHouseholds: 3000
  },
  'นครนายก': {
    name: 'นครนายก',
    shortName: 'นครนายก',
    aliases: ['นครนายก'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 260000,
    households: 110000,
    maxPilotAudience: 5000,
    maxPilotHouseholds: 1800
  },
  'นครปฐม': {
    name: 'นครปฐม',
    shortName: 'นครปฐม',
    aliases: ['นครปฐม', 'เมืองเจดีย์ใหญ่'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 925000,
    households: 390000,
    maxPilotAudience: 11000,
    maxPilotHouseholds: 3800
  },
  'สุพรรณบุรี': {
    name: 'สุพรรณบุรี',
    shortName: 'สุพรรณบุรี',
    aliases: ['สุพรรณบุรี', 'เมืองสุพรรณ'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 830000,
    households: 310000,
    maxPilotAudience: 10000,
    maxPilotHouseholds: 3500
  },
  'สมุทรสาคร': {
    name: 'สมุทรสาคร',
    shortName: 'สมุทรสาคร',
    aliases: ['สมุทรสาคร', 'มหาชัย'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 590000,
    households: 310000,
    maxPilotAudience: 8000,
    maxPilotHouseholds: 2800
  },
  'สมุทรสงคราม': {
    name: 'สมุทรสงคราม',
    shortName: 'สมุทรสงคราม',
    aliases: ['สมุทรสงคราม', 'แม่กลอง'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 190000,
    households: 75000,
    maxPilotAudience: 4000,
    maxPilotHouseholds: 1500
  },
  'เพชรบูรณ์': {
    name: 'เพชรบูรณ์',
    shortName: 'เพชรบูรณ์',
    aliases: ['เพชรบูรณ์'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 975000,
    households: 370000,
    maxPilotAudience: 11000,
    maxPilotHouseholds: 3800
  },
  'กำแพงเพชร': {
    name: 'กำแพงเพชร',
    shortName: 'กำแพงเพชร',
    aliases: ['กำแพงเพชร'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 710000,
    households: 265000,
    maxPilotAudience: 8500,
    maxPilotHouseholds: 3000
  },
  'นครสวรรค์': {
    name: 'นครสวรรค์',
    shortName: 'นครสวรรค์',
    aliases: ['นครสวรรค์', 'ปากน้ำโพ'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 1025000,
    households: 395000,
    maxPilotAudience: 12000,
    maxPilotHouseholds: 4000
  },
  'พิจิตร': {
    name: 'พิจิตร',
    shortName: 'พิจิตร',
    aliases: ['พิจิตร', 'เมืองชาละวัน'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 525000,
    households: 195000,
    maxPilotAudience: 7500,
    maxPilotHouseholds: 2600
  },
  'พิษณุโลก': {
    name: 'พิษณุโลก',
    shortName: 'พิษณุโลก',
    aliases: ['พิษณุโลก', 'เมืองสองแคว'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 845000,
    households: 335000,
    maxPilotAudience: 10000,
    maxPilotHouseholds: 3500
  },
  'สุโขทัย': {
    name: 'สุโขทัย',
    shortName: 'สุโขทัย',
    aliases: ['สุโขทัย'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 585000,
    households: 220000,
    maxPilotAudience: 8000,
    maxPilotHouseholds: 2800
  },
  'อุทัยธานี': {
    name: 'อุทัยธานี',
    shortName: 'อุทัยธานี',
    aliases: ['อุทัยธานี'],
    region: 'central',
    regionThai: 'ภาคกลาง',
    population: 325000,
    households: 125000,
    maxPilotAudience: 6000,
    maxPilotHouseholds: 2000
  },

  // --------------------------------------------------------------------------
  // 2. ภาคเหนือ (9 จังหวัด)
  // --------------------------------------------------------------------------
  'เชียงใหม่': {
    name: 'เชียงใหม่',
    shortName: 'เชียงใหม่',
    aliases: ['เชียงใหม่', 'เมืองเชียงใหม่'],
    region: 'northern',
    regionThai: 'ภาคเหนือ',
    population: 1790000,
    households: 780000,
    maxPilotAudience: 16000,
    maxPilotHouseholds: 5500
  },
  'เชียงราย': {
    name: 'เชียงราย',
    shortName: 'เชียงราย',
    aliases: ['เชียงราย'],
    region: 'northern',
    regionThai: 'ภาคเหนือ',
    population: 1300000,
    households: 490000,
    maxPilotAudience: 14000,
    maxPilotHouseholds: 4500
  },
  'ลำปาง': {
    name: 'ลำปาง',
    shortName: 'ลำปาง',
    aliases: ['ลำปาง', 'เมืองเขลางค์'],
    region: 'northern',
    regionThai: 'ภาคเหนือ',
    population: 720000,
    households: 280000,
    maxPilotAudience: 8500,
    maxPilotHouseholds: 3000
  },
  'ลำพูน': {
    name: 'ลำพูน',
    shortName: 'ลำพูน',
    aliases: ['ลำพูน', 'เมืองหริภุญชัย'],
    region: 'northern',
    regionThai: 'ภาคเหนือ',
    population: 400000,
    households: 165000,
    maxPilotAudience: 6500,
    maxPilotHouseholds: 2200
  },
  'แม่ฮ่องสอน': {
    name: 'แม่ฮ่องสอน',
    shortName: 'แม่ฮ่องสอน',
    aliases: ['แม่ฮ่องสอน', 'เมืองสามหมอก'],
    region: 'northern',
    regionThai: 'ภาคเหนือ',
    population: 285000,
    households: 110000,
    maxPilotAudience: 5000,
    maxPilotHouseholds: 1800
  },
  'น่าน': {
    name: 'น่าน',
    shortName: 'น่าน',
    aliases: ['น่าน', 'เมืองน่าน'],
    region: 'northern',
    regionThai: 'ภาคเหนือ',
    population: 475000,
    households: 180000,
    maxPilotAudience: 7000,
    maxPilotHouseholds: 2500
  },
  'พะเยา': {
    name: 'พะเยา',
    shortName: 'พะเยา',
    aliases: ['พะเยา'],
    region: 'northern',
    regionThai: 'ภาคเหนือ',
    population: 465000,
    households: 185000,
    maxPilotAudience: 7000,
    maxPilotHouseholds: 2500
  },
  'แพร่': {
    name: 'แพร่',
    shortName: 'แพร่',
    aliases: ['แพร่', 'เมืองแป้'],
    region: 'northern',
    regionThai: 'ภาคเหนือ',
    population: 430000,
    households: 170000,
    maxPilotAudience: 6500,
    maxPilotHouseholds: 2200
  },
  'อุตรดิตถ์': {
    name: 'อุตรดิตถ์',
    shortName: 'อุตรดิตถ์',
    aliases: ['อุตรดิตถ์'],
    region: 'northern',
    regionThai: 'ภาคเหนือ',
    population: 445000,
    households: 175000,
    maxPilotAudience: 6800,
    maxPilotHouseholds: 2300
  },

  // --------------------------------------------------------------------------
  // 3. ภาคตะวันออกเฉียงเหนือ / อีสาน (20 จังหวัด)
  // --------------------------------------------------------------------------
  'นครราชสีมา': {
    name: 'นครราชสีมา',
    shortName: 'โคราช',
    aliases: ['นครราชสีมา', 'โคราช', 'เมืองย่าโม'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 2630000,
    households: 950000,
    maxPilotAudience: 18000,
    maxPilotHouseholds: 6000
  },
  'ขอนแก่น': {
    name: 'ขอนแก่น',
    shortName: 'ขอนแก่น',
    aliases: ['ขอนแก่น', 'เมืองขอนแก่น'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 1785000,
    households: 635000,
    maxPilotAudience: 16000,
    maxPilotHouseholds: 5500
  },
  'อุบลราชธานี': {
    name: 'อุบลราชธานี',
    shortName: 'อุบลราชธานี',
    aliases: ['อุบลราชธานี', 'อุบล', 'เมืองอุบล'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 1865000,
    households: 585000,
    maxPilotAudience: 16000,
    maxPilotHouseholds: 5500
  },
  'อุดรธานี': {
    name: 'อุดรธานี',
    shortName: 'อุดรธานี',
    aliases: ['อุดรธานี', 'อุดร', 'เมืองอุดร'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 1560000,
    households: 540000,
    maxPilotAudience: 15000,
    maxPilotHouseholds: 5000
  },
  'บุรีรัมย์': {
    name: 'บุรีรัมย์',
    shortName: 'บุรีรัมย์',
    aliases: ['บุรีรัมย์', 'เมืองปราสาทสองยุค'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 1575000,
    households: 485000,
    maxPilotAudience: 15000,
    maxPilotHouseholds: 5000
  },
  'สุรินทร์': {
    name: 'สุรินทร์',
    shortName: 'สุรินทร์',
    aliases: ['สุรินทร์', 'เมืองช้าง'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 1375000,
    households: 420000,
    maxPilotAudience: 14000,
    maxPilotHouseholds: 4500
  },
  'ศรีสะเกษ': {
    name: 'ศรีสะเกษ',
    shortName: 'ศรีสะเกษ',
    aliases: ['ศรีสะเกษ'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 1450000,
    households: 435000,
    maxPilotAudience: 14500,
    maxPilotHouseholds: 4800
  },
  'ร้อยเอ็ด': {
    name: 'ร้อยเอ็ด',
    shortName: 'ร้อยเอ็ด',
    aliases: ['ร้อยเอ็ด', 'เมืองเกินร้อย'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 1295000,
    households: 410000,
    maxPilotAudience: 13500,
    maxPilotHouseholds: 4500
  },
  'สกลนคร': {
    name: 'สกลนคร',
    shortName: 'สกลนคร',
    aliases: ['สกลนคร', 'เมืองหนองหาร'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 1145000,
    households: 360000,
    maxPilotAudience: 12500,
    maxPilotHouseholds: 4000
  },
  'ชัยภูมิ': {
    name: 'ชัยภูมิ',
    shortName: 'ชัยภูมิ',
    aliases: ['ชัยภูมิ', 'เมืองพญาแล'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 1115000,
    households: 375000,
    maxPilotAudience: 12500,
    maxPilotHouseholds: 4000
  },
  'กาฬสินธุ์': {
    name: 'กาฬสินธุ์',
    shortName: 'กาฬสินธุ์',
    aliases: ['กาฬสินธุ์', 'เมืองน้ำดำ'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 970000,
    households: 330000,
    maxPilotAudience: 10000,
    maxPilotHouseholds: 3500
  },
  'มหาสารคาม': {
    name: 'มหาสารคาม',
    shortName: 'มหาสารคาม',
    aliases: ['มหาสารคาม', 'เมืองตักสิลา'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 945000,
    households: 320000,
    maxPilotAudience: 10000,
    maxPilotHouseholds: 3500
  },
  'นครพนม': {
    name: 'นครพนม',
    shortName: 'นครพนม',
    aliases: ['นครพนม'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 715000,
    households: 245000,
    maxPilotAudience: 8500,
    maxPilotHouseholds: 3000
  },
  'เลย': {
    name: 'เลย',
    shortName: 'เลย',
    aliases: ['เลย', 'เมืองทะเลภูเขา'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 635000,
    households: 235000,
    maxPilotAudience: 8500,
    maxPilotHouseholds: 3000
  },
  'ยโสธร': {
    name: 'ยโสธร',
    shortName: 'ยโสธร',
    aliases: ['ยโสธร', 'เมืองบั้งไฟ'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 530000,
    households: 175000,
    maxPilotAudience: 7500,
    maxPilotHouseholds: 2600
  },
  'หนองคาย': {
    name: 'หนองคาย',
    shortName: 'หนองคาย',
    aliases: ['หนองคาย'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 515000,
    households: 185000,
    maxPilotAudience: 7500,
    maxPilotHouseholds: 2600
  },
  'หนองบัวลำภู': {
    name: 'หนองบัวลำภู',
    shortName: 'หนองบัวลำภู',
    aliases: ['หนองบัวลำภู', 'หนองบัว'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 508000,
    households: 170000,
    maxPilotAudience: 7500,
    maxPilotHouseholds: 2600
  },
  'บึงกาฬ': {
    name: 'บึงกาฬ',
    shortName: 'บึงกาฬ',
    aliases: ['บึงกาฬ'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 420000,
    households: 135000,
    maxPilotAudience: 6500,
    maxPilotHouseholds: 2200
  },
  'อำนาจเจริญ': {
    name: 'อำนาจเจริญ',
    shortName: 'อำนาจเจริญ',
    aliases: ['อำนาจเจริญ'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 375000,
    households: 125000,
    maxPilotAudience: 6000,
    maxPilotHouseholds: 2000
  },
  'มุกดาหาร': {
    name: 'มุกดาหาร',
    shortName: 'มุกดาหาร',
    aliases: ['มุกดาหาร'],
    region: 'northeastern',
    regionThai: 'ภาคตะวันออกเฉียงเหนือ',
    population: 350000,
    households: 120000,
    maxPilotAudience: 6000,
    maxPilotHouseholds: 2000
  },

  // --------------------------------------------------------------------------
  // 4. ภาคตะวันออก (7 จังหวัด)
  // --------------------------------------------------------------------------
  'ชลบุรี': {
    name: 'ชลบุรี',
    shortName: 'ชลบุรี',
    aliases: ['ชลบุรี', 'บางแสน', 'พัทยา'],
    region: 'eastern',
    regionThai: 'ภาคตะวันออก',
    population: 1600000,
    households: 950000,
    maxPilotAudience: 16000,
    maxPilotHouseholds: 5500
  },
  'ระยอง': {
    name: 'ระยอง',
    shortName: 'ระยอง',
    aliases: ['ระยอง', 'เมืองระยอง'],
    region: 'eastern',
    regionThai: 'ภาคตะวันออก',
    population: 760000,
    households: 440000,
    maxPilotAudience: 9500,
    maxPilotHouseholds: 3500
  },
  'ฉะเชิงเทรา': {
    name: 'ฉะเชิงเทรา',
    shortName: 'ฉะเชิงเทรา',
    aliases: ['ฉะเชิงเทรา', 'แปดริ้ว'],
    region: 'eastern',
    regionThai: 'ภาคตะวันออก',
    population: 730000,
    households: 310000,
    maxPilotAudience: 9000,
    maxPilotHouseholds: 3200
  },
  'จันทบุรี': {
    name: 'จันทบุรี',
    shortName: 'จันทบุรี',
    aliases: ['จันทบุรี', 'เมืองจันท์'],
    region: 'eastern',
    regionThai: 'ภาคตะวันออก',
    population: 535000,
    households: 225000,
    maxPilotAudience: 7500,
    maxPilotHouseholds: 2600
  },
  'ปราจีนบุรี': {
    name: 'ปราจีนบุรี',
    shortName: 'ปราจีนบุรี',
    aliases: ['ปราจีนบุรี'],
    region: 'eastern',
    regionThai: 'ภาคตะวันออก',
    population: 495000,
    households: 220000,
    maxPilotAudience: 7000,
    maxPilotHouseholds: 2500
  },
  'สระแก้ว': {
    name: 'สระแก้ว',
    shortName: 'สระแก้ว',
    aliases: ['สระแก้ว'],
    region: 'eastern',
    regionThai: 'ภาคตะวันออก',
    population: 560000,
    households: 215000,
    maxPilotAudience: 7800,
    maxPilotHouseholds: 2700
  },
  'ตราด': {
    name: 'ตราด',
    shortName: 'ตราด',
    aliases: ['ตราด', 'เมืองเกาะช้าง'],
    region: 'eastern',
    regionThai: 'ภาคตะวันออก',
    population: 228000,
    households: 95000,
    maxPilotAudience: 4500,
    maxPilotHouseholds: 1600
  },

  // --------------------------------------------------------------------------
  // 5. ภาคตะวันตก (5 จังหวัด)
  // --------------------------------------------------------------------------
  'กาญจนบุรี': {
    name: 'กาญจนบุรี',
    shortName: 'กาญจนบุรี',
    aliases: ['กาญจนบุรี', 'เมืองกาญจน์'],
    region: 'western',
    regionThai: 'ภาคตะวันตก',
    population: 890000,
    households: 330000,
    maxPilotAudience: 10500,
    maxPilotHouseholds: 3600
  },
  'ราชบุรี': {
    name: 'ราชบุรี',
    shortName: 'ราชบุรี',
    aliases: ['ราชบุรี', 'เมืองโอ่ง'],
    region: 'western',
    regionThai: 'ภาคตะวันตก',
    population: 865000,
    households: 335000,
    maxPilotAudience: 10000,
    maxPilotHouseholds: 3500
  },
  'เพชรบุรี': {
    name: 'เพชรบุรี',
    shortName: 'เพชรบุรี',
    aliases: ['เพชรบุรี', 'เมืองเพชร'],
    region: 'western',
    regionThai: 'ภาคตะวันตก',
    population: 485000,
    households: 195000,
    maxPilotAudience: 7000,
    maxPilotHouseholds: 2500
  },
  'ประจวบคีรีขันธ์': {
    name: 'ประจวบคีรีขันธ์',
    shortName: 'ประจวบฯ',
    aliases: ['ประจวบคีรีขันธ์', 'ประจวบฯ', 'ประจวบ', 'หัวหิน'],
    region: 'western',
    regionThai: 'ภาคตะวันตก',
    population: 550000,
    households: 235000,
    maxPilotAudience: 7500,
    maxPilotHouseholds: 2600
  },
  'ตาก': {
    name: 'ตาก',
    shortName: 'ตาก',
    aliases: ['ตาก', 'เมืองตาก', 'แม่สอด'],
    region: 'western',
    regionThai: 'ภาคตะวันตก',
    population: 685000,
    households: 245000,
    maxPilotAudience: 8500,
    maxPilotHouseholds: 3000
  },

  // --------------------------------------------------------------------------
  // 6. ภาคใต้ (14 จังหวัด)
  // --------------------------------------------------------------------------
  'สงขลา': {
    name: 'สงขลา',
    shortName: 'สงขลา',
    aliases: ['สงขลา', 'หาดใหญ่'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 1430000,
    households: 550000,
    maxPilotAudience: 15000,
    maxPilotHouseholds: 5000
  },
  'นครศรีธรรมราช': {
    name: 'นครศรีธรรมราช',
    shortName: 'นครศรีฯ',
    aliases: ['นครศรีธรรมราช', 'นครศรีฯ', 'เมืองคอน'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 1540000,
    households: 565000,
    maxPilotAudience: 15000,
    maxPilotHouseholds: 5000
  },
  'สุราษฎร์ธานี': {
    name: 'สุราษฎร์ธานี',
    shortName: 'สุราษฎร์ฯ',
    aliases: ['สุราษฎร์ธานี', 'สุราษฎร์ฯ', 'สุราษฎร์', 'เกาะสมุย'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 1070000,
    households: 420000,
    maxPilotAudience: 12000,
    maxPilotHouseholds: 4000
  },
  'นราธิวาส': {
    name: 'นราธิวาส',
    shortName: 'นราธิวาส',
    aliases: ['นราธิวาส'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 815000,
    households: 230000,
    maxPilotAudience: 9500,
    maxPilotHouseholds: 3200
  },
  'ปัตตานี': {
    name: 'ปัตตานี',
    shortName: 'ปัตตานี',
    aliases: ['ปัตตานี'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 730000,
    households: 210000,
    maxPilotAudience: 9000,
    maxPilotHouseholds: 3000
  },
  'ยะลา': {
    name: 'ยะลา',
    shortName: 'ยะลา',
    aliases: ['ยะลา', 'เบตง'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 545000,
    households: 165000,
    maxPilotAudience: 7500,
    maxPilotHouseholds: 2600
  },
  'ตรัง': {
    name: 'ตรัง',
    shortName: 'ตรัง',
    aliases: ['ตรัง', 'เมืองตรัง'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 638000,
    households: 235000,
    maxPilotAudience: 8500,
    maxPilotHouseholds: 3000
  },
  'พัทลุง': {
    name: 'พัทลุง',
    shortName: 'พัทลุง',
    aliases: ['พัทลุง', 'เมืองลุง'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 522000,
    households: 195000,
    maxPilotAudience: 7500,
    maxPilotHouseholds: 2600
  },
  'ชุมพร': {
    name: 'ชุมพร',
    shortName: 'ชุมพร',
    aliases: ['ชุมพร', 'ประตูสู่ภาคใต้'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 510000,
    households: 215000,
    maxPilotAudience: 7500,
    maxPilotHouseholds: 2600
  },
  'ภูเก็ต': {
    name: 'ภูเก็ต',
    shortName: 'ภูเก็ต',
    aliases: ['ภูเก็ต', 'ไข่มุกอันดามัน'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 420000,
    households: 265000,
    maxPilotAudience: 7500,
    maxPilotHouseholds: 2800
  },
  'สตูล': {
    name: 'สตูล',
    shortName: 'สตูล',
    aliases: ['สตูล'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 325000,
    households: 105000,
    maxPilotAudience: 6000,
    maxPilotHouseholds: 2000
  },
  'กระบี่': {
    name: 'กระบี่',
    shortName: 'กระบี่',
    aliases: ['กระบี่', 'เมืองกระบี่'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 480000,
    households: 195000,
    maxPilotAudience: 7000,
    maxPilotHouseholds: 2500
  },
  'พังงา': {
    name: 'พังงา',
    shortName: 'พังงา',
    aliases: ['พังงา'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 268000,
    households: 108000,
    maxPilotAudience: 5000,
    maxPilotHouseholds: 1800
  },
  'ระนอง': {
    name: 'ระนอง',
    shortName: 'ระนอง',
    aliases: ['ระนอง', 'เมืองฝนแปดแดดสี่'],
    region: 'southern',
    regionThai: 'ภาคใต้',
    population: 195000,
    households: 82000,
    maxPilotAudience: 4000,
    maxPilotHouseholds: 1500
  }
};

/**
 * ฟังก์ชันช่วยค้นหาข้อมูลประชากรและครัวเรือน รองรับทั้ง 77 จังหวัด และ ประเทศไทย
 */
export function getProvinceDemographics(targetAreaInput?: string, fullContextText?: string): ProvinceDemographics {
  const input = (targetAreaInput || '').trim();
  const cleaned = input.replace(/^(?:จ\.|จังหวัด|พื้นที่|อำเภอ|อ\.)\s*/, '').trim();

  // 1. ตรวจสอบว่าเป็นระดับประเทศไทย / ทั่วประเทศ จาก input หรือไม่
  const nationalExplicitKeywords = [
    'ประเทศไทย', 'ทั่วประเทศ', 'ระดับประเทศ', 'ทั้งประเทศ', 'ทุกจังหวัด', 'ส่วนกลาง', 'Thailand', 'ระดับชาติ'
  ];
  if (nationalExplicitKeywords.some(k => input === k || cleaned === k || input.includes(k))) {
    return THAILAND_NATIONAL_DEMOGRAPHICS;
  }

  // 2. ตรวจสอบแบบตรงตัวใน 77 จังหวัด
  if (THAILAND_77_PROVINCES_DEMOGRAPHICS[cleaned]) {
    return THAILAND_77_PROVINCES_DEMOGRAPHICS[cleaned];
  }
  if (THAILAND_77_PROVINCES_DEMOGRAPHICS[input]) {
    return THAILAND_77_PROVINCES_DEMOGRAPHICS[input];
  }

  // 3. ตรวจสอบจาก Aliases ของแต่ละจังหวัด
  for (const [key, demo] of Object.entries(THAILAND_77_PROVINCES_DEMOGRAPHICS)) {
    if (demo.aliases.some(alias => alias.toLowerCase() === cleaned.toLowerCase() || input.includes(alias))) {
      return demo;
    }
  }

  // 4. หาก targetArea ว่างหรือระบุเป็นภาพกว้าง ลองสแกนหาชื่อจังหวัดจาก fullContextText ก่อน
  if (fullContextText) {
    // 4.1 สแกนหาจังหวัดก่อน (เพื่อไม่ให้คำว่าประเทศไทยในบริบท เช่น "คนไทย" หรือ "ในประเทศไทย" กลืนชื่อจังหวัดจริง)
    for (const [key, demo] of Object.entries(THAILAND_77_PROVINCES_DEMOGRAPHICS)) {
      if (demo.aliases.some(alias => fullContextText.includes(alias))) {
        return demo;
      }
    }
    // 4.2 ถ้าไม่พบชื่อจังหวัดใดๆ เลย และมีคำที่บ่งชี้ระดับประเทศชัดเจน
    const fullTextNationalKeywords = [
      'ทั่วประเทศ', 'ระดับประเทศ', 'ทุกจังหวัดทั่วไทย', 'ทั้ง 77 จังหวัด', 'ระดับชาติ', 'ทั้งประเทศ'
    ];
    if (fullTextNationalKeywords.some(k => fullContextText.includes(k))) {
      return THAILAND_NATIONAL_DEMOGRAPHICS;
    }
  }

  // 5. หากไม่พบจังหวัดที่แน่นอน คืนค่าเป็นตัวแทนจังหวัดมาตรฐานทั่วไป
  return {
    name: cleaned || 'พื้นที่ทั่วไป',
    shortName: cleaned || 'ทั่วไป',
    aliases: [cleaned],
    region: 'central',
    regionThai: 'พื้นที่ทั่วไป',
    population: 800000,
    households: 300000,
    maxPilotAudience: 10000,
    maxPilotHouseholds: 3500
  };
}
