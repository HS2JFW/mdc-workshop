// moralAgencyDataCatalog.ts
// คลังข้อมูลบูรณาการระหว่างศูนย์คุณธรรม (ศคธ.) และหน่วยงานภาคีภายนอกตามข้อกำหนด TOR

// -------------------------------------------------------------
// 1.1 ภาพรวมดัชนีคุณธรรมและทุนชีวิตระดับชาติ (National Index & Mesosystem)
// -------------------------------------------------------------
export interface MoralDimensionScore {
  key: string;
  name: string;
  nameEn: string;
  score: number;
  yoy: number; // % change YoY
  color: string;
  description: string;
}

export const NATIONAL_5_DIMENSIONS: MoralDimensionScore[] = [
  { key: 'suff', name: 'พอเพียง', nameEn: 'Sufficiency', score: 76.4, yoy: 1.8, color: '#3b82f6', description: 'การดำรงชีวิตอย่างพอประมาณ มีเหตุผล และมีภูมิคุ้มกัน' },
  { key: 'disc', name: 'วินัย', nameEn: 'Discipline', score: 72.8, yoy: -0.5, color: '#f59e0b', description: 'การเคารพกฎหมาย กฎระเบียบทางสังคม และกติกาชุมชน' },
  { key: 'inte', name: 'สุจริต', nameEn: 'Integrity', score: 68.5, yoy: 2.1, color: '#ef4444', description: 'ความซื่อสัตย์ ความโปร่งใส และการต่อต้านการทุจริต' },
  { key: 'volu', name: 'จิตอาสา', nameEn: 'Public Mind', score: 84.9, yoy: 3.4, color: '#10b981', description: 'การเสียสละเพื่อส่วนรวมและร่วมกิจกรรมอาสาสมัคร' },
  { key: 'grat', name: 'กตัญญู', nameEn: 'Gratitude', score: 89.2, yoy: 1.2, color: '#8b5cf6', description: 'ความกตัญญูรู้คุณต่อครอบครัว ชุมชน และประเทศชาติ' }
];

export const LIFE_CAPITAL_SCORE = {
  overall: 69.8,
  yoy: 2.4,
  dimensions: [
    { name: 'พลังปัญญา (Wisdom)', score: 71.2, max: 100 },
    { name: 'พลังครอบครัว (Family)', score: 68.4, max: 100 },
    { name: 'พลังชุมชนและสังคม (Community)', score: 73.1, max: 100 },
    { name: 'พลังสร้างสรรค์และสื่อ (Creativity & Media)', score: 66.5, max: 100 }
  ]
};

export const LIFE_CAPITAL_4_PILLARS = [
  {
    key: 'wisdom',
    name: 'พลังปัญญา',
    nameEn: 'Wisdom & Mind',
    score: 71.2,
    yoy: 2.1,
    color: '#0284c7',
    description: 'ทักษะคิดวิเคราะห์ ความตระหนักรู้ทางจริยธรรม และการตัดสินใจบนฐานความรู้'
  },
  {
    key: 'family',
    name: 'พลังครอบครัว',
    nameEn: 'Family Attachment',
    score: 68.4,
    yoy: 1.5,
    color: '#f59e0b',
    description: 'ความอบอุ่น ความผูกพัน ความเข้าใจ และการเป็นแบบอย่างที่ดีในสถาบันครอบครัว'
  },
  {
    key: 'community',
    name: 'พลังชุมชนและสังคม',
    nameEn: 'Social Capital',
    score: 73.1,
    yoy: 3.2,
    color: '#10b981',
    description: 'ความเอื้ออาทร ตาข่ายความปลอดภัยทางสังคม การมีส่วนร่วมและความเข้มแข็งของชุมชน'
  },
  {
    key: 'media',
    name: 'พลังสร้างสรรค์และสื่อ',
    nameEn: 'Creative Media',
    score: 66.5,
    yoy: 1.8,
    color: '#8b5cf6',
    description: 'การเปิดรับสื่อสร้างสรรค์ ภูมิคุ้มกันดิจิทัล และการใช้ประโยชน์จากพื้นที่เชิงบวก'
  }
];

export const LIFE_CAPITAL_RADAR_DATA = [
  { subject: 'พลังปัญญา', year2567: 69.1, year2568: 71.2, fullMark: 100 },
  { subject: 'พลังครอบครัว', year2567: 67.2, year2568: 68.4, fullMark: 100 },
  { subject: 'พลังชุมชนและสังคม', year2567: 70.8, year2568: 73.1, fullMark: 100 },
  { subject: 'พลังสร้างสรรค์และสื่อ', year2567: 65.0, year2568: 66.5, fullMark: 100 }
];

export const LIFE_CAPITAL_TREND_DATA = [
  { year: '2565', พลังปัญญา: 66.4, พลังครอบครัว: 65.0, พลังชุมชนและสังคม: 68.2, พลังสร้างสรรค์และสื่อ: 62.5, ทุนชีวิตรวม: 64.8 },
  { year: '2566', พลังปัญญา: 67.8, พลังครอบครัว: 66.1, พลังชุมชนและสังคม: 69.5, พลังสร้างสรรค์และสื่อ: 63.9, ทุนชีวิตรวม: 66.9 },
  { year: '2567', พลังปัญญา: 69.1, พลังครอบครัว: 67.2, พลังชุมชนและสังคม: 70.8, พลังสร้างสรรค์และสื่อ: 65.0, ทุนชีวิตรวม: 68.2 },
  { year: '2568', พลังปัญญา: 71.2, พลังครอบครัว: 68.4, พลังชุมชนและสังคม: 73.1, พลังสร้างสรรค์และสื่อ: 66.5, ทุนชีวิตรวม: 69.8 },
  { year: '2569 (F)', พลังปัญญา: 73.5, พลังครอบครัว: 70.2, พลังชุมชนและสังคม: 75.0, พลังสร้างสรรค์และสื่อ: 68.8, ทุนชีวิตรวม: 72.0 }
];

export const LIFE_CAPITAL_REGIONAL_DATA = [
  { region: 'ภาคเหนือ (Northern)', พลังปัญญา: 72.5, พลังครอบครัว: 70.2, พลังชุมชนและสังคม: 74.8, พลังสร้างสรรค์และสื่อ: 67.5, ทุนชีวิตรวม: 71.5, grade: 'A', status: 'เข้มแข็ง' },
  { region: 'ภาคตะวันออกเฉียงเหนือ (Isan)', พลังปัญญา: 71.8, พลังครอบครัว: 71.5, พลังชุมชนและสังคม: 76.2, พลังสร้างสรรค์และสื่อ: 66.8, ทุนชีวิตรวม: 72.1, grade: 'A', status: 'เข้มแข็ง' },
  { region: 'ภาคกลาง (Central)', พลังปัญญา: 70.5, พลังครอบครัว: 67.0, พลังชุมชนและสังคม: 71.2, พลังสร้างสรรค์และสื่อ: 65.8, ทุนชีวิตรวม: 68.4, grade: 'B+', status: 'ปานกลาง' },
  { region: 'ภาคตะวันออก (Eastern)', พลังปัญญา: 71.0, พลังครอบครัว: 66.8, พลังชุมชนและสังคม: 72.0, พลังสร้างสรรค์และสื่อ: 66.2, ทุนชีวิตรวม: 69.0, grade: 'B+', status: 'ปานกลาง' },
  { region: 'ภาคตะวันตก (Western)', พลังปัญญา: 70.8, พลังครอบครัว: 69.5, พลังชุมชนและสังคม: 73.5, พลังสร้างสรรค์และสื่อ: 66.0, ทุนชีวิตรวม: 70.2, grade: 'B+', status: 'ปานกลาง' },
  { region: 'ภาคใต้ (Southern)', พลังปัญญา: 71.5, พลังครอบครัว: 70.0, พลังชุมชนและสังคม: 74.2, พลังสร้างสรรค์และสื่อ: 66.7, ทุนชีวิตรวม: 70.8, grade: 'B+', status: 'ปานกลาง' },
  { region: 'กรุงเทพมหานคร (Bangkok)', พลังปัญญา: 73.2, พลังครอบครัว: 63.5, พลังชุมชนและสังคม: 67.8, พลังสร้างสรรค์และสื่อ: 64.2, ทุนชีวิตรวม: 66.8, grade: 'B', status: 'เฝ้าระวัง' }
];

export const LIFE_CAPITAL_SIGNALS = [
  {
    id: 'lc-sig-1',
    level: 'critical',
    title: 'สัญญาณเปราะบาง: พลังครอบครัวในเขตเมืองหลวงและปริมณฑลลดต่ำต่อเนื่อง',
    source: 'กรมสุขภาพจิต & สำนักงานสถิติแห่งชาติ (ภาวะครอบครัวแหว่งกลาง)',
    description: 'ครอบครัวในกรุงเทพฯ และเมืองใหญ่มีเวลาคุณภาพร่วมกันเฉลี่ยต่ำกว่า 45 นาที/วัน ส่งผลต่อระดับความผูกพันและคะแนนพลังครอบครัวที่ 63.5 จุด',
    recommendation: 'ขับเคลื่อนนโยบาย Flexible Work Hours และสร้างพื้นที่กิจกรรม Family Creative Space ประจำชุมชนเมือง'
  },
  {
    id: 'lc-sig-2',
    level: 'warning',
    title: 'สัญญาณเฝ้าระวัง: พลังสร้างสรรค์และสื่อตกอยู่ใต้ภาวะ Digital Addiction',
    source: 'สภาเด็กและเยาวชนแห่งประเทศไทย & กสทช.',
    description: 'เด็กและเยาวชนใช้เวลาอยู่กับหน้าจอดิจิทัลเฉลี่ย 7.2 ชั่วโมง/วัน มีความเสี่ยงต่อข่าวปลอม (Fake News) และการพนันออนไลน์แฝงเกม',
    recommendation: 'เร่งขยายแพลตฟอร์ม "สื่อสร้างสรรค์ปลอดภัย" และสนับสนุนงบกองทุนพัฒนาสื่อปลอดภัยและสร้างสรรค์สู่ระดับโรงเรียน'
  },
  {
    id: 'lc-sig-3',
    level: 'normal',
    title: 'สัญญาณบวก: พลังชุมชนในภาคอีสานและเหนือยังเป็นเกราะคุ้มกันทางสังคมที่แข็งแกร่ง',
    source: 'สำรวจทุนชีวิตเด็กและเยาวชน สสส. & ศคธ.',
    description: 'กลไกผู้เฒ่าผู้แก่ ครู และผู้นำชุมชนในการดูแลช่วยเหลือบุตรหลานที่พ่อแม่ไปทำงานต่างถิ่น มีประสิทธิภาพสูง ช่วยพยุงคะแนนทุนชีวิตรวมเกิน 72 จุด',
    recommendation: 'ยกย่องและหนุนงบประมาณแก่ "กองทุนสวัสดิการชุมชนดูแลเยาวชน" เป็นต้นแบบระดับประเทศ'
  }
];

export const RADAR_COMPARISON_DATA = [
  { subject: 'พอเพียง', year2567: 74.6, year2568: 76.4, fullMark: 100 },
  { subject: 'วินัย', year2567: 73.3, year2568: 72.8, fullMark: 100 },
  { subject: 'สุจริต', year2567: 66.4, year2568: 68.5, fullMark: 100 },
  { subject: 'จิตอาสา', year2567: 81.5, year2568: 84.9, fullMark: 100 },
  { subject: 'กตัญญู', year2567: 88.0, year2568: 89.2, fullMark: 100 }
];

export const MULTI_LINE_TREND_DATA = [
  { year: '2565', พอเพียง: 71.2, วินัย: 69.5, สุจริต: 64.1, จิตอาสา: 77.2, กตัญญู: 85.0, ทุนชีวิต: 64.8 },
  { year: '2566', พอเพียง: 73.0, วินัย: 71.2, สุจริต: 65.3, จิตอาสา: 79.4, กตัญญู: 86.8, ทุนชีวิต: 66.9 },
  { year: '2567', พอเพียง: 74.6, วินัย: 73.3, สุจริต: 66.4, จิตอาสา: 81.5, กตัญญู: 88.0, ทุนชีวิต: 68.2 },
  { year: '2568', พอเพียง: 76.4, วินัย: 72.8, สุจริต: 68.5, จิตอาสา: 84.9, กตัญญู: 89.2, ทุนชีวิต: 69.8 },
  { year: '2569 (F)', พอเพียง: 78.1, วินัย: 74.0, สุจริต: 70.8, จิตอาสา: 87.0, กตัญญู: 90.5, ทุนชีวิต: 72.0 }
];

export const REGIONAL_HEATMAP_DATA = [
  { region: 'ภาคเหนือ (Northern)', พอเพียง: 78.2, วินัย: 74.1, สุจริต: 70.4, จิตอาสา: 86.5, กตัญญู: 91.0, ทุนชีวิต: 71.5, grade: 'A' },
  { region: 'ภาคตะวันออกเฉียงเหนือ (Isan)', พอเพียง: 81.0, วินัย: 71.5, สุจริต: 67.2, จิตอาสา: 88.2, กตัญญู: 92.4, ทุนชีวิต: 72.1, grade: 'A' },
  { region: 'ภาคกลาง (Central)', พอเพียง: 74.5, วินัย: 72.0, สุจริต: 67.9, จิตอาสา: 82.0, กตัญญู: 87.5, ทุนชีวิต: 68.4, grade: 'B+' },
  { region: 'ภาคตะวันออก (Eastern)', พอเพียง: 73.8, วินัย: 73.9, สุจริต: 69.1, จิตอาสา: 81.4, กตัญญู: 86.2, ทุนชีวิต: 69.0, grade: 'B+' },
  { region: 'ภาคตะวันตก (Western)', พอเพียง: 75.9, วินัย: 72.4, สุจริต: 68.0, จิตอาสา: 83.1, กตัญญู: 88.9, ทุนชีวิต: 70.2, grade: 'B+' },
  { region: 'ภาคใต้ (Southern)', พอเพียง: 76.1, วินัย: 71.8, สุจริต: 68.4, จิตอาสา: 85.0, กตัญญู: 89.8, ทุนชีวิต: 70.8, grade: 'B+' },
  { region: 'กรุงเทพมหานคร (Bangkok)', พอเพียง: 69.5, วินัย: 74.2, สุจริต: 68.0, จิตอาสา: 83.5, กตัญญู: 84.1, ทุนชีวิต: 66.8, grade: 'B' }
];

export const AI_SOCIAL_SIGNALS = [
  {
    id: 'sig-1',
    level: 'critical',
    title: 'สัญญาณเสี่ยง: ดัชนีความซื่อสัตย์สุจริตในกลุ่มเยาวชนเมืองลดลง',
    source: 'NLP Sentiment Analysis จากกระแสสื่อออนไลน์ & ข้อมูล ป.ป.ช.',
    description: 'พบประเด็นสนทนาเชิงลบต่อระบบอุปถัมภ์และการยอมรับการทุจริตเล็กน้อยเพื่อความอยู่รอดเพิ่มขึ้น 14.8% ในกลุ่มอายุ 18-24 ปี',
    recommendation: 'ควรเพิ่มหลักสูตร "โตไปไม่โกง 4.0" และโครงการบ่มเพาะ Integrity Lab ร่วมกับสถานศึกษาในกรุงเทพฯ และหัวเมืองใหญ่'
  },
  {
    id: 'sig-2',
    level: 'warning',
    title: 'สัญญาณเฝ้าระวัง: วินัยจราจรและวินัยทางดิจิทัลในพื้นที่ EEC ชะลอตัว',
    source: 'สถิติสภาวะทางสังคม (สถิติแห่งชาติ) & ข้อมูลอุบัติเหตุทางถนน',
    description: 'คะแนนวินัยในชลบุรีและระยองลดลง 1.2 จุด สัมพันธ์กับความหนาแน่นประชากรแฝงและการใช้ชีวิตเร่งรีบ',
    recommendation: 'ขับเคลื่อนแคมเปญ "วินัยความปลอดภัยองค์กร" ร่วมกับนิคมอุตสาหกรรมใน 3 จังหวัด EEC'
  },
  {
    id: 'sig-3',
    level: 'normal',
    title: 'สัญญาณบวก: พลังจิตอาสาและกิจกรรมช่วยเหลือภัยพิบัติภาคเหนือเพิ่มสูง',
    source: 'ดัชนีคุณธรรมมิติจิตอาสา ศคธ. & กรมการพัฒนาชุมชน',
    description: 'คะแนนจิตอาสาในเชียงราย เชียงใหม่ แพร่ พุ่งแตะ 88.5 จุด จากการรวมกลุ่มช่วยเหลือผู้ประสบอุทกภัยอย่างเข้มแข็ง',
    recommendation: 'ขยายผลเป็นเครือข่ายจิตอาสาอาชีวะและเยาวชนกู้ภัยคุณธรรมระดับภูมิภาค'
  }
];

// -------------------------------------------------------------
// 1.2 ความคุ้มค่างบประมาณและการลงทุนในระบบนิเวศ (Macro ROI & Educational Projects)
// -------------------------------------------------------------
export const MACRO_BUDGET_MINISTRIES = [
  { name: 'กระทรวงวัฒนธรรม (วธ.)', value: 644, percent: 35.0, color: '#3b82f6' },
  { name: 'กระทรวงศึกษาธิการ (ศธ.)', value: 515, percent: 28.0, color: '#10b981' },
  { name: 'กระทรวงการพัฒนาสังคมฯ (พม.)', value: 331, percent: 18.0, color: '#f59e0b' },
  { name: 'กระทรวงมหาดไทย (มท.)', value: 221, percent: 12.0, color: '#8b5cf6' },
  { name: 'ศูนย์คุณธรรม (ศคธ.)', value: 129, percent: 7.0, color: '#ec4899' }
];

export const MACRO_ECOSYSTEM_DIMENSIONS = [
  { name: 'ระบบนิเวศเด็ก (Child)', budget: 460, roi: 4.2, color: '#38bdf8' },
  { name: 'ระบบนิเวศเยาวชน (Youth)', budget: 552, roi: 3.9, color: '#4ade80' },
  { name: 'ระบบนิเวศครอบครัว (Family)', budget: 515, roi: 4.5, color: '#fbbf24' },
  { name: 'ระบบนิเวศสื่อ (Media & Creative)', budget: 313, roi: 2.8, color: '#c084fc' }
];

export const SCATTER_ROI_PROJECTS = [
  { name: 'โรงเรียนคุณธรรม สพฐ.', budget: 120, deltaScore: 4.8, projects: 450, roi: 4.5 },
  { name: 'สมัชชาคุณธรรมแห่งชาติ', budget: 45, deltaScore: 3.2, projects: 120, roi: 3.8 },
  { name: 'โครงการขับเคลื่อนจังหวัดคุณธรรม 4 จังหวัดนำร่อง', budget: 85, deltaScore: 5.6, projects: 310, roi: 5.2 },
  { name: 'เครือข่ายองค์กรคุณธรรมภาคธุรกิจ', budget: 60, deltaScore: 3.9, projects: 180, roi: 4.1 },
  { name: 'ศูนย์เรียนรู้คุณธรรมชุมชน', budget: 95, deltaScore: 4.2, projects: 260, roi: 3.9 },
  { name: 'สื่อรณรงค์แอนิเมชันเยาวชน', budget: 35, deltaScore: 2.1, projects: 80, roi: 2.6 },
  { name: 'ค่ายผู้นำเยาวชน Change Agent', budget: 50, deltaScore: 4.5, projects: 140, roi: 4.4 },
  { name: 'การประเมิน ITA ภาครัฐคุณธรรม', budget: 110, deltaScore: 3.8, projects: 390, roi: 3.5 }
];

export const SANKEY_FLOW_DATA = {
  inputs: [
    { label: 'งบประมาณแผ่นดินบูรณาการ (สำนักงบฯ)', amount: '1,840 ล้านบาท' },
    { label: 'กองทุนส่งเสริมคุณธรรม ศคธ.', amount: '85 ล้านบาท' },
    { label: 'งบหนุนเสริมภาคเอกชน/CSR', amount: '145 ล้านบาท' }
  ],
  activities: [
    { label: 'พัฒนาเด็กและสถานศึกษาคุณธรรม (ศธ.)', share: '32%' },
    { label: 'ส่งเสริมครอบครัวและชุมชนอบอุ่น (พม./มท.)', share: '28%' },
    { label: 'สร้าง Change Agent & องค์กรคุณธรรม (ศคธ.)', share: '24%' },
    { label: 'ผลิตสื่อสร้างสรรค์และรณรงค์สาธารณะ (วธ.)', share: '16%' }
  ],
  outcomes: [
    { label: 'ดัชนีคุณธรรมเฉลี่ยเพิ่มขึ้น +2.4 จุด', status: 'achieved' },
    { label: 'องค์กรคุณธรรมผ่านเกณฑ์ประเมิน 7,000 แห่ง', status: 'achieved' },
    { label: 'คดีทุจริตและวินัยข้าราชการลดลง 11.2%', status: 'on-track' },
    { label: 'Social ROI อัตราผลตอบแทนสังคม 1 : 3.84 เท่า', status: 'high' }
  ]
};

// -------------------------------------------------------------
// 1.3 ห่วงโซ่ผลลัพธ์ด้านคุณธรรมระดับชาติ (National Result Chain Pipeline)
// -------------------------------------------------------------
export const AGENCY_HEATMAP_MATRIX = [
  { agency: 'สำนักงาน ป.ป.ช. (ITA)', พอเพียง: 82, วินัย: 78, สุจริต: 92, จิตอาสา: 75, กตัญญู: 80, status: 'achieved' },
  { agency: 'สำนักงาน ก.พ. (วินัยข้าราชการ)', พอเพียง: 79, วินัย: 88, สุจริต: 84, จิตอาสา: 81, กตัญญู: 85, status: 'achieved' },
  { agency: 'สภาพัฒน์ฯ (แผนแม่บทระยะที่ 2)', พอเพียง: 85, วินัย: 74, สุจริต: 72, จิตอาสา: 88, กตัญญู: 90, status: 'on-track' },
  { agency: 'กระทรวงมหาดไทย (มท. - ชุมชนคุณธรรม)', พอเพียง: 88, วินัย: 71, สุจริต: 69, จิตอาสา: 91, กตัญญู: 93, status: 'achieved' },
  { agency: 'กระทรวงวัฒนธรรม (วธ. - สังคมคุณธรรม)', พอเพียง: 80, วินัย: 76, สุจริต: 74, จิตอาสา: 86, กตัญญู: 95, status: 'achieved' },
  { agency: 'กระทรวง พม. (ครอบครัวและกลุ่มเปราะบาง)', พอเพียง: 76, วินัย: 68, สุจริต: 71, จิตอาสา: 89, กตัญญู: 92, status: 'warning' },
  { agency: 'กระทรวงศึกษาธิการ (ศธ. - โรงเรียนคุณธรรม)', พอเพียง: 81, วินัย: 75, สุจริต: 76, จิตอาสา: 84, กตัญญู: 88, status: 'achieved' }
];

export const CROSS_AGENCY_STACKED_BAR = [
  { agency: 'ป.ป.ช.', บรรลุเป้าหมาย: 78, เฝ้าระวัง: 16, ต่ำกว่าเป้า: 6 },
  { agency: 'ก.พ.', บรรลุเป้าหมาย: 74, เฝ้าระวัง: 20, ต่ำกว่าเป้า: 6 },
  { agency: 'มท.', บรรลุเป้าหมาย: 82, เฝ้าระวัง: 14, ต่ำกว่าเป้า: 4 },
  { agency: 'วธ.', บรรลุเป้าหมาย: 85, เฝ้าระวัง: 12, ต่ำกว่าเป้า: 3 },
  { agency: 'พม.', บรรลุเป้าหมาย: 68, เฝ้าระวัง: 24, ต่ำกว่าเป้า: 8 },
  { agency: 'ศธ.', บรรลุเป้าหมาย: 76, เฝ้าระวัง: 18, ต่ำกว่าเป้า: 6 }
];

// -------------------------------------------------------------
// 1.4 สรุปสาระสำคัญเชิงนโยบายและช่องว่างการแทรกแซง (Policy Gaps & Gender)
// -------------------------------------------------------------
export const GENDER_TORNADO_DATA = [
  { dimension: 'พอเพียง', male: 75.8, female: 77.0, gap: 1.2 },
  { dimension: 'วินัย', male: 70.4, female: 75.2, gap: 4.8 },
  { dimension: 'สุจริต', male: 66.8, female: 70.2, gap: 3.4 },
  { dimension: 'จิตอาสา', male: 83.2, female: 86.6, gap: 3.4 },
  { dimension: 'กตัญญู', male: 87.5, female: 90.9, gap: 3.4 }
];

export const PRIORITY_QUADRANT_DATA = [
  { name: 'การส่งเสริมความสุจริตในสถานประกอบการ', xProblem: 82, yBudget: 35, quadrant: 'Q2-Urgent' },
  { name: 'การสร้างวินัยดิจิทัลและการรู้เท่าทันสื่อ', xProblem: 78, yBudget: 28, quadrant: 'Q2-Urgent' },
  { name: 'การดูแลผู้สูงอายุและความกตัญญูในชุมชน', xProblem: 42, yBudget: 75, quadrant: 'Q4-WellFunded' },
  { name: 'จิตอาสาพัฒนาสิ่งแวดล้อมและภัยพิบัติ', xProblem: 38, yBudget: 80, quadrant: 'Q4-WellFunded' },
  { name: 'การลดความรุนแรงในครอบครัวเปราะบาง', xProblem: 85, yBudget: 42, quadrant: 'Q2-Urgent' },
  { name: 'การพัฒนาวิทยากรคุณธรรม Change Agent', xProblem: 55, yBudget: 68, quadrant: 'Q1-Balanced' }
];

// -------------------------------------------------------------
// 2.1 การขับเคลื่อนจังหวัดคุณธรรมและแผนที่เตือนภัยระดับพื้นที่ (Provincial GIS)
// -------------------------------------------------------------
export interface ProvinceVirtueData {
  id: string;
  name: string;
  enName?: string;
  region: string;
  overallScore: number;
  suffScore: number;
  discScore: number;
  inteScore: number;
  voluScore: number;
  gratScore: number;
  moralOrgCount: number;
  moralCommunityCount: number;
  changeAgentCount: number;
  status: 'pilot' | 'moral-city' | 'developing' | 'standard';
  riskLevel: 'low' | 'moderate' | 'high';
}

export const PROVINCES_77_DATA: ProvinceVirtueData[] = [
  { id: 'bkk', name: 'กรุงเทพมหานคร', enName: 'Bangkok', region: 'กลาง', overallScore: 74.2, suffScore: 76, discScore: 72, inteScore: 70, voluScore: 79, gratScore: 82, moralOrgCount: 850, moralCommunityCount: 180, changeAgentCount: 620, status: 'moral-city', riskLevel: 'moderate' },
  { id: 'spk', name: 'สมุทรปราการ', enName: 'Samut Prakan', region: 'กลาง', overallScore: 75.8, suffScore: 78, discScore: 74, inteScore: 72, voluScore: 81, gratScore: 84, moralOrgCount: 320, moralCommunityCount: 65, changeAgentCount: 210, status: 'standard', riskLevel: 'moderate' },
  { id: 'nbi', name: 'นนทบุรี', enName: 'Nonthaburi', region: 'กลาง', overallScore: 77.4, suffScore: 79, discScore: 75, inteScore: 73, voluScore: 82, gratScore: 85, moralOrgCount: 280, moralCommunityCount: 70, changeAgentCount: 190, status: 'standard', riskLevel: 'low' },
  { id: 'pte', name: 'ปทุมธานี', enName: 'Pathum Thani', region: 'กลาง', overallScore: 76.9, suffScore: 79, discScore: 75, inteScore: 73, voluScore: 82, gratScore: 85, moralOrgCount: 290, moralCommunityCount: 68, changeAgentCount: 200, status: 'standard', riskLevel: 'moderate' },
  { id: 'aya', name: 'พระนครศรีอยุธยา', enName: 'Phra Nakhon Si Ayutthaya', region: 'กลาง', overallScore: 79.5, suffScore: 82, discScore: 78, inteScore: 76, voluScore: 85, gratScore: 88, moralOrgCount: 230, moralCommunityCount: 68, changeAgentCount: 180, status: 'moral-city', riskLevel: 'low' },
  { id: 'atg', name: 'อ่างทอง', enName: 'Ang Thong', region: 'กลาง', overallScore: 78.2, suffScore: 80, discScore: 76, inteScore: 74, voluScore: 83, gratScore: 86, moralOrgCount: 140, moralCommunityCount: 45, changeAgentCount: 110, status: 'standard', riskLevel: 'low' },
  { id: 'lri', name: 'ลพบุรี', enName: 'Lop Buri', region: 'กลาง', overallScore: 78.9, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 210, moralCommunityCount: 58, changeAgentCount: 160, status: 'standard', riskLevel: 'low' },
  { id: 'sbr', name: 'สิงห์บุรี', enName: 'Sing Buri', region: 'กลาง', overallScore: 79.2, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 130, moralCommunityCount: 42, changeAgentCount: 105, status: 'standard', riskLevel: 'low' },
  { id: 'cnt', name: 'ชัยนาท', enName: 'Chai Nat', region: 'กลาง', overallScore: 78.0, suffScore: 80, discScore: 76, inteScore: 74, voluScore: 83, gratScore: 86, moralOrgCount: 125, moralCommunityCount: 40, changeAgentCount: 98, status: 'standard', riskLevel: 'low' },
  { id: 'sri', name: 'สระบุรี', enName: 'Saraburi', region: 'กลาง', overallScore: 77.6, suffScore: 80, discScore: 76, inteScore: 74, voluScore: 83, gratScore: 86, moralOrgCount: 220, moralCommunityCount: 55, changeAgentCount: 170, status: 'standard', riskLevel: 'low' },
  { id: 'cbi', name: 'ชลบุรี', enName: 'Chon Buri', region: 'ตะวันออก', overallScore: 76.5, suffScore: 79, discScore: 75, inteScore: 73, voluScore: 82, gratScore: 85, moralOrgCount: 340, moralCommunityCount: 70, changeAgentCount: 260, status: 'moral-city', riskLevel: 'moderate' },
  { id: 'ryg', name: 'ระยอง', enName: 'Rayong', region: 'ตะวันออก', overallScore: 80.2, suffScore: 82, discScore: 78, inteScore: 76, voluScore: 85, gratScore: 88, moralOrgCount: 312, moralCommunityCount: 65, changeAgentCount: 220, status: 'pilot', riskLevel: 'moderate' },
  { id: 'cti', name: 'จันทบุรี', enName: 'Chanthaburi', region: 'ตะวันออก', overallScore: 81.0, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 190, moralCommunityCount: 58, changeAgentCount: 155, status: 'moral-city', riskLevel: 'low' },
  { id: 'trt', name: 'ตราด', enName: 'Trat', region: 'ตะวันออก', overallScore: 79.3, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 140, moralCommunityCount: 44, changeAgentCount: 115, status: 'standard', riskLevel: 'low' },
  { id: 'cco', name: 'ฉะเชิงเทรา', enName: 'Chachoengsao', region: 'ตะวันออก', overallScore: 78.5, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 210, moralCommunityCount: 60, changeAgentCount: 165, status: 'standard', riskLevel: 'low' },
  { id: 'pri', name: 'ปราจีนบุรี', enName: 'Prachin Buri', region: 'ตะวันออก', overallScore: 77.9, suffScore: 80, discScore: 76, inteScore: 74, voluScore: 83, gratScore: 86, moralOrgCount: 175, moralCommunityCount: 52, changeAgentCount: 140, status: 'standard', riskLevel: 'low' },
  { id: 'nyk', name: 'นครนายก', enName: 'Nakhon Nayok', region: 'กลาง', overallScore: 80.4, suffScore: 82, discScore: 78, inteScore: 76, voluScore: 85, gratScore: 88, moralOrgCount: 155, moralCommunityCount: 48, changeAgentCount: 125, status: 'standard', riskLevel: 'low' },
  { id: 'skw', name: 'สระแก้ว', enName: 'Sa Kaeo', region: 'ตะวันออก', overallScore: 74.5, suffScore: 77, discScore: 73, inteScore: 71, voluScore: 80, gratScore: 83, moralOrgCount: 135, moralCommunityCount: 42, changeAgentCount: 105, status: 'standard', riskLevel: 'high' },
  { id: 'nma', name: 'นครราชสีมา', enName: 'Nakhon Ratchasima', region: 'อีสาน', overallScore: 79.1, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 395, moralCommunityCount: 130, changeAgentCount: 320, status: 'moral-city', riskLevel: 'low' },
  { id: 'brm', name: 'บุรีรัมย์', enName: 'Buriram', region: 'อีสาน', overallScore: 78.8, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 260, moralCommunityCount: 85, changeAgentCount: 210, status: 'standard', riskLevel: 'low' },
  { id: 'srn', name: 'สุรินทร์', enName: 'Surin', region: 'อีสาน', overallScore: 80.6, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 245, moralCommunityCount: 80, changeAgentCount: 195, status: 'standard', riskLevel: 'low' },
  { id: 'ssk', name: 'ศรีสะเกษ', enName: 'Si Sa Ket', region: 'อีสาน', overallScore: 79.7, suffScore: 82, discScore: 78, inteScore: 76, voluScore: 85, gratScore: 88, moralOrgCount: 250, moralCommunityCount: 82, changeAgentCount: 200, status: 'standard', riskLevel: 'low' },
  { id: 'ubn', name: 'อุบลราชธานี', enName: 'Ubon Ratchathani', region: 'อีสาน', overallScore: 80.5, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 290, moralCommunityCount: 95, changeAgentCount: 230, status: 'moral-city', riskLevel: 'low' },
  { id: 'yst', name: 'ยโสธร', enName: 'Yasothon', region: 'อีสาน', overallScore: 82.3, suffScore: 84, discScore: 80, inteScore: 78, voluScore: 87, gratScore: 90, moralOrgCount: 170, moralCommunityCount: 56, changeAgentCount: 140, status: 'standard', riskLevel: 'low' },
  { id: 'cpm', name: 'ชัยภูมิ', enName: 'Chaiyaphum', region: 'อีสาน', overallScore: 78.6, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 225, moralCommunityCount: 72, changeAgentCount: 180, status: 'standard', riskLevel: 'low' },
  { id: 'acr', name: 'อำนาจเจริญ', enName: 'Amnat Charoen', region: 'อีสาน', overallScore: 81.2, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 150, moralCommunityCount: 48, changeAgentCount: 120, status: 'standard', riskLevel: 'low' },
  { id: 'bkn', name: 'บึงกาฬ', enName: 'Bueng Kan', region: 'อีสาน', overallScore: 81.5, suffScore: 84, discScore: 80, inteScore: 78, voluScore: 87, gratScore: 90, moralOrgCount: 145, moralCommunityCount: 46, changeAgentCount: 118, status: 'standard', riskLevel: 'low' },
  { id: 'nbp', name: 'หนองบัวลำภู', enName: 'Nong Bua Lam Phu', region: 'อีสาน', overallScore: 80.9, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 160, moralCommunityCount: 50, changeAgentCount: 130, status: 'standard', riskLevel: 'low' },
  { id: 'kkn', name: 'ขอนแก่น', enName: 'Khon Kaen', region: 'อีสาน', overallScore: 80.8, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 380, moralCommunityCount: 125, changeAgentCount: 310, status: 'moral-city', riskLevel: 'low' },
  { id: 'udn', name: 'อุดรธานี', enName: 'Udon Thani', region: 'อีสาน', overallScore: 81.7, suffScore: 84, discScore: 80, inteScore: 78, voluScore: 87, gratScore: 90, moralOrgCount: 275, moralCommunityCount: 90, changeAgentCount: 220, status: 'moral-city', riskLevel: 'low' },
  { id: 'lei', name: 'เลย', enName: 'Loei', region: 'อีสาน', overallScore: 82.5, suffScore: 85, discScore: 81, inteScore: 79, voluScore: 88, gratScore: 91, moralOrgCount: 180, moralCommunityCount: 60, changeAgentCount: 145, status: 'standard', riskLevel: 'low' },
  { id: 'nki', name: 'หนองคาย', enName: 'Nong Khai', region: 'อีสาน', overallScore: 82.8, suffScore: 85, discScore: 81, inteScore: 79, voluScore: 88, gratScore: 91, moralOrgCount: 198, moralCommunityCount: 72, changeAgentCount: 160, status: 'pilot', riskLevel: 'low' },
  { id: 'mkm', name: 'มหาสารคาม', enName: 'Maha Sarakham', region: 'อีสาน', overallScore: 80.1, suffScore: 82, discScore: 78, inteScore: 76, voluScore: 85, gratScore: 88, moralOrgCount: 215, moralCommunityCount: 68, changeAgentCount: 175, status: 'standard', riskLevel: 'low' },
  { id: 'ret', name: 'ร้อยเอ็ด', enName: 'Roi Et', region: 'อีสาน', overallScore: 79.9, suffScore: 82, discScore: 78, inteScore: 76, voluScore: 85, gratScore: 88, moralOrgCount: 235, moralCommunityCount: 75, changeAgentCount: 190, status: 'standard', riskLevel: 'low' },
  { id: 'ksn', name: 'กาฬสินธุ์', enName: 'Kalasin', region: 'อีสาน', overallScore: 81.1, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 195, moralCommunityCount: 62, changeAgentCount: 158, status: 'standard', riskLevel: 'low' },
  { id: 'snk', name: 'สกลนคร', enName: 'Sakon Nakhon', region: 'อีสาน', overallScore: 81.9, suffScore: 84, discScore: 80, inteScore: 78, voluScore: 87, gratScore: 90, moralOrgCount: 220, moralCommunityCount: 70, changeAgentCount: 180, status: 'standard', riskLevel: 'low' },
  { id: 'npm', name: 'นครพนม', enName: 'Nakhon Phanom', region: 'อีสาน', overallScore: 82.6, suffScore: 85, discScore: 81, inteScore: 79, voluScore: 88, gratScore: 91, moralOrgCount: 185, moralCommunityCount: 64, changeAgentCount: 155, status: 'standard', riskLevel: 'low' },
  { id: 'mdh', name: 'มุกดาหาร', enName: 'Mukdahan', region: 'อีสาน', overallScore: 80.7, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 140, moralCommunityCount: 45, changeAgentCount: 115, status: 'standard', riskLevel: 'low' },
  { id: 'cmi', name: 'เชียงใหม่', enName: 'Chiang Mai', region: 'เหนือ', overallScore: 81.4, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 420, moralCommunityCount: 140, changeAgentCount: 350, status: 'moral-city', riskLevel: 'low' },
  { id: 'lpn', name: 'ลำพูน', enName: 'Lamphun', region: 'เหนือ', overallScore: 83.2, suffScore: 85, discScore: 81, inteScore: 79, voluScore: 88, gratScore: 91, moralOrgCount: 195, moralCommunityCount: 66, changeAgentCount: 160, status: 'moral-city', riskLevel: 'low' },
  { id: 'lpg', name: 'ลำปาง', enName: 'Lampang', region: 'เหนือ', overallScore: 84.5, suffScore: 87, discScore: 83, inteScore: 81, voluScore: 90, gratScore: 93, moralOrgCount: 245, moralCommunityCount: 88, changeAgentCount: 195, status: 'pilot', riskLevel: 'low' },
  { id: 'utd', name: 'อุตรดิตถ์', enName: 'Uttaradit', region: 'เหนือ', overallScore: 80.3, suffScore: 82, discScore: 78, inteScore: 76, voluScore: 85, gratScore: 88, moralOrgCount: 170, moralCommunityCount: 54, changeAgentCount: 135, status: 'standard', riskLevel: 'low' },
  { id: 'pre', name: 'แพร่', enName: 'Phrae', region: 'เหนือ', overallScore: 82.1, suffScore: 84, discScore: 80, inteScore: 78, voluScore: 87, gratScore: 90, moralOrgCount: 185, moralCommunityCount: 65, changeAgentCount: 150, status: 'standard', riskLevel: 'low' },
  { id: 'nan', name: 'น่าน', enName: 'Nan', region: 'เหนือ', overallScore: 83.6, suffScore: 86, discScore: 82, inteScore: 80, voluScore: 89, gratScore: 92, moralOrgCount: 210, moralCommunityCount: 78, changeAgentCount: 175, status: 'moral-city', riskLevel: 'low' },
  { id: 'pyo', name: 'พะเยา', enName: 'Phayao', region: 'เหนือ', overallScore: 83.4, suffScore: 85, discScore: 81, inteScore: 79, voluScore: 88, gratScore: 91, moralOrgCount: 190, moralCommunityCount: 68, changeAgentCount: 155, status: 'moral-city', riskLevel: 'low' },
  { id: 'cri', name: 'เชียงราย', enName: 'Chiang Rai', region: 'เหนือ', overallScore: 83.0, suffScore: 85, discScore: 81, inteScore: 79, voluScore: 88, gratScore: 91, moralOrgCount: 310, moralCommunityCount: 105, changeAgentCount: 250, status: 'moral-city', riskLevel: 'low' },
  { id: 'msn', name: 'แม่ฮ่องสอน', enName: 'Mae Hong Son', region: 'เหนือ', overallScore: 78.3, suffScore: 80, discScore: 76, inteScore: 74, voluScore: 83, gratScore: 86, moralOrgCount: 130, moralCommunityCount: 42, changeAgentCount: 100, status: 'standard', riskLevel: 'moderate' },
  { id: 'nsn', name: 'นครสวรรค์', enName: 'Nakhon Sawan', region: 'กลาง', overallScore: 77.8, suffScore: 80, discScore: 76, inteScore: 74, voluScore: 83, gratScore: 86, moralOrgCount: 240, moralCommunityCount: 75, changeAgentCount: 195, status: 'standard', riskLevel: 'low' },
  { id: 'uti', name: 'อุทัยธานี', enName: 'Uthai Thani', region: 'กลาง', overallScore: 79.4, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 150, moralCommunityCount: 48, changeAgentCount: 120, status: 'standard', riskLevel: 'low' },
  { id: 'kpt', name: 'กำแพงเพชร', enName: 'Kamphaeng Phet', region: 'กลาง', overallScore: 78.7, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 190, moralCommunityCount: 60, changeAgentCount: 155, status: 'standard', riskLevel: 'low' },
  { id: 'tak', name: 'ตาก', enName: 'Tak', region: 'เหนือ', overallScore: 75.4, suffScore: 77, discScore: 73, inteScore: 71, voluScore: 80, gratScore: 83, moralOrgCount: 140, moralCommunityCount: 45, changeAgentCount: 110, status: 'standard', riskLevel: 'high' },
  { id: 'sti', name: 'สุโขทัย', enName: 'Sukhothai', region: 'เหนือ', overallScore: 81.6, suffScore: 84, discScore: 80, inteScore: 78, voluScore: 87, gratScore: 90, moralOrgCount: 180, moralCommunityCount: 58, changeAgentCount: 145, status: 'standard', riskLevel: 'low' },
  { id: 'plk', name: 'พิษณุโลก', enName: 'Phitsanulok', region: 'เหนือ', overallScore: 80.9, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 255, moralCommunityCount: 80, changeAgentCount: 205, status: 'moral-city', riskLevel: 'low' },
  { id: 'pct', name: 'พิจิตร', enName: 'Phichit', region: 'กลาง', overallScore: 79.0, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 165, moralCommunityCount: 52, changeAgentCount: 130, status: 'standard', riskLevel: 'low' },
  { id: 'pnb', name: 'เพชรบูรณ์', enName: 'Phetchabun', region: 'เหนือ', overallScore: 78.4, suffScore: 80, discScore: 76, inteScore: 74, voluScore: 83, gratScore: 86, moralOrgCount: 210, moralCommunityCount: 66, changeAgentCount: 170, status: 'standard', riskLevel: 'low' },
  { id: 'rbr', name: 'ราชบุรี', enName: 'Ratchaburi', region: 'กลาง', overallScore: 78.9, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 220, moralCommunityCount: 70, changeAgentCount: 180, status: 'standard', riskLevel: 'low' },
  { id: 'kri', name: 'กาญจนบุรี', enName: 'Kanchanaburi', region: 'กลาง', overallScore: 77.2, suffScore: 79, discScore: 75, inteScore: 73, voluScore: 82, gratScore: 85, moralOrgCount: 205, moralCommunityCount: 65, changeAgentCount: 165, status: 'standard', riskLevel: 'moderate' },
  { id: 'spb', name: 'สุพรรณบุรี', enName: 'Suphan Buri', region: 'กลาง', overallScore: 79.8, suffScore: 82, discScore: 78, inteScore: 76, voluScore: 85, gratScore: 88, moralOrgCount: 230, moralCommunityCount: 72, changeAgentCount: 185, status: 'standard', riskLevel: 'low' },
  { id: 'npt', name: 'นครปฐม', enName: 'Nakhon Pathom', region: 'กลาง', overallScore: 78.1, suffScore: 80, discScore: 76, inteScore: 74, voluScore: 83, gratScore: 86, moralOrgCount: 250, moralCommunityCount: 78, changeAgentCount: 200, status: 'standard', riskLevel: 'low' },
  { id: 'skn', name: 'สมุทรสาคร', enName: 'Samut Sakhon', region: 'กลาง', overallScore: 76.1, suffScore: 78, discScore: 74, inteScore: 72, voluScore: 81, gratScore: 84, moralOrgCount: 260, moralCommunityCount: 55, changeAgentCount: 190, status: 'standard', riskLevel: 'moderate' },
  { id: 'skm', name: 'สมุทรสงคราม', enName: 'Samut Songkhram', region: 'กลาง', overallScore: 79.6, suffScore: 82, discScore: 78, inteScore: 76, voluScore: 85, gratScore: 88, moralOrgCount: 120, moralCommunityCount: 38, changeAgentCount: 95, status: 'standard', riskLevel: 'low' },
  { id: 'pbi', name: 'เพชรบุรี', enName: 'Phetchaburi', region: 'กลาง', overallScore: 78.3, suffScore: 80, discScore: 76, inteScore: 74, voluScore: 83, gratScore: 86, moralOrgCount: 185, moralCommunityCount: 58, changeAgentCount: 150, status: 'standard', riskLevel: 'low' },
  { id: 'pkn', name: 'ประจวบคีรีขันธ์', enName: 'Prachuap Khiri Khan', region: 'กลาง', overallScore: 78.5, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 195, moralCommunityCount: 60, changeAgentCount: 160, status: 'standard', riskLevel: 'low' },
  { id: 'nrt', name: 'นครศรีธรรมราช', enName: 'Nakhon Si Thammarat', region: 'ใต้', overallScore: 80.2, suffScore: 82, discScore: 78, inteScore: 76, voluScore: 85, gratScore: 88, moralOrgCount: 295, moralCommunityCount: 92, changeAgentCount: 240, status: 'moral-city', riskLevel: 'low' },
  { id: 'kbi', name: 'กระบี่', enName: 'Krabi', region: 'ใต้', overallScore: 82.0, suffScore: 84, discScore: 80, inteScore: 78, voluScore: 87, gratScore: 90, moralOrgCount: 180, moralCommunityCount: 56, changeAgentCount: 145, status: 'moral-city', riskLevel: 'low' },
  { id: 'pna', name: 'พังงา', enName: 'Phangnga', region: 'ใต้', overallScore: 83.1, suffScore: 85, discScore: 81, inteScore: 79, voluScore: 88, gratScore: 91, moralOrgCount: 175, moralCommunityCount: 54, changeAgentCount: 145, status: 'pilot', riskLevel: 'low' },
  { id: 'pkt', name: 'ภูเก็ต', enName: 'Phuket', region: 'ใต้', overallScore: 78.6, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 210, moralCommunityCount: 48, changeAgentCount: 170, status: 'moral-city', riskLevel: 'moderate' },
  { id: 'sni', name: 'สุราษฎร์ธานี', enName: 'Surat Thani', region: 'ใต้', overallScore: 79.8, suffScore: 82, discScore: 78, inteScore: 76, voluScore: 85, gratScore: 88, moralOrgCount: 240, moralCommunityCount: 75, changeAgentCount: 190, status: 'moral-city', riskLevel: 'low' },
  { id: 'rng', name: 'ระนอง', enName: 'Ranong', region: 'ใต้', overallScore: 81.3, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 135, moralCommunityCount: 40, changeAgentCount: 105, status: 'standard', riskLevel: 'low' },
  { id: 'cpn', name: 'ชุมพร', enName: 'Chumphon', region: 'ใต้', overallScore: 79.1, suffScore: 81, discScore: 77, inteScore: 75, voluScore: 84, gratScore: 87, moralOrgCount: 185, moralCommunityCount: 58, changeAgentCount: 150, status: 'standard', riskLevel: 'low' },
  { id: 'ska', name: 'สงขลา', enName: 'Songkhla', region: 'ใต้', overallScore: 78.4, suffScore: 80, discScore: 76, inteScore: 74, voluScore: 83, gratScore: 86, moralOrgCount: 280, moralCommunityCount: 82, changeAgentCount: 210, status: 'moral-city', riskLevel: 'moderate' },
  { id: 'stn', name: 'สตูล', enName: 'Satun', region: 'ใต้', overallScore: 80.7, suffScore: 83, discScore: 79, inteScore: 77, voluScore: 86, gratScore: 89, moralOrgCount: 145, moralCommunityCount: 44, changeAgentCount: 115, status: 'standard', riskLevel: 'low' },
  { id: 'trg', name: 'ตรัง', enName: 'Trang', region: 'ใต้', overallScore: 83.2, suffScore: 85, discScore: 81, inteScore: 79, voluScore: 88, gratScore: 91, moralOrgCount: 200, moralCommunityCount: 64, changeAgentCount: 165, status: 'moral-city', riskLevel: 'low' },
  { id: 'plg', name: 'พัทลุง', enName: 'Phatthalung', region: 'ใต้', overallScore: 82.4, suffScore: 84, discScore: 80, inteScore: 78, voluScore: 87, gratScore: 90, moralOrgCount: 175, moralCommunityCount: 56, changeAgentCount: 140, status: 'standard', riskLevel: 'low' },
  { id: 'ptn', name: 'ปัตตานี', enName: 'Pattani', region: 'ใต้', overallScore: 75.1, suffScore: 77, discScore: 73, inteScore: 71, voluScore: 80, gratScore: 83, moralOrgCount: 160, moralCommunityCount: 52, changeAgentCount: 130, status: 'standard', riskLevel: 'high' },
  { id: 'yla', name: 'ยะลา', enName: 'Yala', region: 'ใต้', overallScore: 75.9, suffScore: 78, discScore: 74, inteScore: 72, voluScore: 81, gratScore: 84, moralOrgCount: 165, moralCommunityCount: 55, changeAgentCount: 135, status: 'standard', riskLevel: 'high' },
  { id: 'nwt', name: 'นราธิวาส', enName: 'Narathiwat', region: 'ใต้', overallScore: 74.8, suffScore: 77, discScore: 73, inteScore: 71, voluScore: 80, gratScore: 83, moralOrgCount: 155, moralCommunityCount: 48, changeAgentCount: 125, status: 'standard', riskLevel: 'high' }
];

export const PILOT_4_PROVINCES = [
  {
    id: 'lpg',
    name: 'ลำปาง (Lampang)',
    region: 'เหนือ',
    overallScore: 84.5,
    highlight: 'ต้นแบบนครแห่งความสุขและเมืองคุณธรรมสุขภาวะ',
    projects: 42,
    communities: 88,
    orgs: 245,
    topDimension: 'กตัญญูและพอเพียง',
    pilotAchievement: 'เครือข่ายโรงเรียนคุณธรรมและชุมชนเข้มแข็ง 100%'
  },
  {
    id: 'nki',
    name: 'หนองคาย (Nong Khai)',
    region: 'อีสาน',
    overallScore: 82.8,
    highlight: 'เมืองชายแดนคุณธรรม มิตรภาพไร้พรมแดน',
    projects: 38,
    communities: 72,
    orgs: 198,
    topDimension: 'จิตอาสาและกตัญญู',
    pilotAchievement: 'โมเดลการขับเคลื่อนหมู่บ้านศีล 5 บูรณาการ จปฐ.'
  },
  {
    id: 'ryg',
    name: 'ระยอง (Rayong)',
    region: 'ตะวันออก',
    overallScore: 80.2,
    highlight: 'อุตสาหกรรมสีขาว วินัยและความซื่อสัตย์ใน EEC',
    projects: 45,
    communities: 65,
    orgs: 312,
    topDimension: 'วินัยและสุจริต',
    pilotAchievement: 'ความร่วมมือนิคมอุตสาหกรรมคุณธรรมกว่า 150 โรงงาน'
  },
  {
    id: 'pna',
    name: 'พังงา (Phang Nga)',
    region: 'ใต้',
    overallScore: 83.1,
    highlight: 'ท่องเที่ยวคุณธรรม วิถีพหุวัฒนธรรมและสิ่งแวดล้อม',
    projects: 36,
    communities: 54,
    orgs: 175,
    topDimension: 'พอเพียงและจิตอาสา',
    pilotAchievement: 'การท่องเที่ยวชุมชนยั่งยืน Zero Carbon & Moral Tourism'
  }
];

// -------------------------------------------------------------
// 2.2 วิเคราะห์สถาบันครอบครัวและเด็กเยาวชนรายจังหวัด (Family Vulnerability)
// -------------------------------------------------------------
export const DUAL_AXIS_FAMILY_DATA = [
  { province: 'นราธิวาส', abandonmentRate: 48.2, violenceRate: 38.5, moralScore: 74.8, riskTier: 'Tier 1' },
  { province: 'ปัตตานี', abandonmentRate: 46.1, violenceRate: 36.2, moralScore: 75.1, riskTier: 'Tier 1' },
  { province: 'ตาก', abandonmentRate: 42.5, violenceRate: 34.0, moralScore: 75.4, riskTier: 'Tier 1' },
  { province: 'ชลบุรี', abandonmentRate: 39.8, violenceRate: 35.5, moralScore: 76.5, riskTier: 'Tier 2' },
  { province: 'กรุงเทพฯ', abandonmentRate: 38.2, violenceRate: 33.1, moralScore: 74.2, riskTier: 'Tier 2' },
  { province: 'สงขลา', abandonmentRate: 32.0, violenceRate: 28.4, moralScore: 78.4, riskTier: 'Tier 2' },
  { province: 'เชียงใหม่', abandonmentRate: 24.5, violenceRate: 21.0, moralScore: 81.4, riskTier: 'Tier 3' },
  { province: 'ขอนแก่น', abandonmentRate: 22.1, violenceRate: 19.5, moralScore: 80.8, riskTier: 'Tier 3' },
  { province: 'ลำปาง', abandonmentRate: 15.4, violenceRate: 14.2, moralScore: 84.5, riskTier: 'Tier 3' },
  { province: 'น่าน', abandonmentRate: 12.8, violenceRate: 11.5, moralScore: 83.6, riskTier: 'Tier 3' }
];

export const CORRELATION_MATRIX_DATA = [
  { variable: 'เด็กถูกทอดทิ้ง (ดย.)', พอเพียง: -0.58, วินัย: -0.64, สุจริต: -0.52, จิตอาสา: -0.38, กตัญญู: -0.71 },
  { variable: 'ความรุนแรงในครอบครัว (สค.)', พอเพียง: -0.62, วินัย: -0.73, สุจริต: -0.61, จิตอาสา: -0.45, กตัญญู: -0.68 },
  { variable: 'หนี้สินครัวเรือน (สถิติแห่งชาติ)', พอเพียง: -0.79, วินัย: -0.48, สุจริต: -0.55, จิตอาสา: -0.32, กตัญญู: -0.41 },
  { variable: 'การหย่าร้าง/ครอบครัวเลี้ยงเดี่ยว', พอเพียง: -0.49, วินัย: -0.58, สุจริต: -0.44, จิตอาสา: -0.35, กตัญญู: -0.65 },
  { variable: 'เด็กอยู่นอกระบบการศึกษา (ศธ.)', พอเพียง: -0.54, วินัย: -0.76, สุจริต: -0.69, จิตอาสา: -0.51, กตัญญู: -0.59 }
];

// -------------------------------------------------------------
// 2.3 วิเคราะห์พฤติกรรมจำแนกตามกลุ่มเป้าหมาย (Gender & Education)
// -------------------------------------------------------------
export const EDUCATION_BOXPLOT_DATA = [
  { level: 'ประถมศึกษา', min: 58, q1: 68, median: 76, q3: 84, max: 92, mean: 75.8, sample: 12400 },
  { level: 'มัธยมศึกษา', min: 54, q1: 65, median: 73, q3: 82, max: 90, mean: 73.2, sample: 24500 },
  { level: 'ปริญญาตรี', min: 62, q1: 72, median: 78, q3: 86, max: 96, mean: 78.4, sample: 31200 },
  { level: 'ปริญญาโท', min: 68, q1: 78, median: 84, q3: 90, max: 98, mean: 83.9, sample: 8600 },
  { level: 'ปริญญาเอก', min: 72, q1: 82, median: 88, q3: 93, max: 100, mean: 87.5, sample: 1850 }
];

export const AGE_GENERATION_DATA = [
  { gen: 'Gen Alpha (<15 ปี)', พอเพียง: 78, วินัย: 72, สุจริต: 74, จิตอาสา: 86, กตัญญู: 92 },
  { gen: 'Gen Z (15-24 ปี)', พอเพียง: 71, วินัย: 68, สุจริต: 65, จิตอาสา: 84, กตัญญู: 86 },
  { gen: 'Gen Y (25-40 ปี)', พอเพียง: 75, วินัย: 73, สุจริต: 69, จิตอาสา: 83, กตัญญู: 88 },
  { gen: 'Gen X (41-55 ปี)', พอเพียง: 79, วินัย: 77, สุจริต: 72, จิตอาสา: 85, กตัญญู: 91 },
  { gen: 'ผู้สูงอายุ (>55 ปี)', พอเพียง: 84, วินัย: 80, สุจริต: 76, จิตอาสา: 88, กตัญญู: 95 }
];

// -------------------------------------------------------------
// 2.4 ศูนย์บริหารจัดการข้อมูลและห่วงโซ่ผลลัพธ์ (Data Ingestion Hub)
// -------------------------------------------------------------
export interface ApiConnectionStatus {
  id: string;
  agency: string;
  agencyCode: string;
  endpoint: string;
  status: 'connected' | 'degraded' | 'offline';
  latencyMs: number;
  recordsCount: string;
  lastSync: string;
  dataType: string;
}

export const API_CONNECTIONS_DATA: ApiConnectionStatus[] = [
  { id: 'api-1', agency: 'สำนักงานสถิติแห่งชาติ (NSO)', agencyCode: 'NSO', endpoint: '/api/v1/social-indicators', status: 'connected', latencyMs: 142, recordsCount: '1,420,500', lastSync: '10 นาทีที่แล้ว', dataType: 'สถิติประชากรและสภาวะสังคม' },
  { id: 'api-2', agency: 'กรมสุขภาพจิต (DMH)', agencyCode: 'DMH', endpoint: '/api/v2/mental-health-index', status: 'connected', latencyMs: 185, recordsCount: '345,000', lastSync: '25 นาทีที่แล้ว', dataType: 'ดัชนีสุขภาพจิตและความเครียด' },
  { id: 'api-3', agency: 'สำนักงาน ป.ป.ช. (NACC)', agencyCode: 'NACC', endpoint: '/api/ita/provincial-ratings', status: 'connected', latencyMs: 210, recordsCount: '8,420', lastSync: '1 ชั่วโมงที่แล้ว', dataType: 'ผลคะแนนประเมินคุณธรรม ITA' },
  { id: 'api-4', agency: 'สำนักงาน ก.พ. (OCSC)', agencyCode: 'OCSC', endpoint: '/api/ethics/discipline-stats', status: 'connected', latencyMs: 168, recordsCount: '12,850', lastSync: '2 ชั่วโมงที่แล้ว', dataType: 'สถิติวินัยและจริยธรรมข้าราชการ' },
  { id: 'api-5', agency: 'สภาพัฒน์ฯ (NESDC)', agencyCode: 'NESDC', endpoint: '/api/masterplan/virtue-phase2', status: 'connected', latencyMs: 195, recordsCount: '45,200', lastSync: '30 นาทีที่แล้ว', dataType: 'ตัวชี้วัดแผนแม่บทส่งเสริมคุณธรรม' },
  { id: 'api-6', agency: 'กรมการพัฒนาชุมชน (CDD/พช.)', agencyCode: 'CDD', endpoint: '/api/basic-needs/jpatho-village', status: 'connected', latencyMs: 320, recordsCount: '12,850,000', lastSync: '40 นาทีที่แล้ว', dataType: 'ข้อมูล จปฐ. รายหมู่บ้าน' },
  { id: 'api-7', agency: 'กรมกิจการเด็กและเยาวชน (ดย.)', agencyCode: 'DCY', endpoint: '/api/vulnerable/child-abandonment', status: 'degraded', latencyMs: 840, recordsCount: '42,100', lastSync: '4 ชั่วโมงที่แล้ว', dataType: 'เด็กเปราะบางและถูกทอดทิ้ง' },
  { id: 'api-8', agency: 'สภาการศึกษา (ศธ. / OEC)', agencyCode: 'OEC', endpoint: '/api/schools/moral-projects', status: 'connected', latencyMs: 175, recordsCount: '28,400', lastSync: '1 ชั่วโมงที่แล้ว', dataType: 'ฐานข้อมูลโรงเรียนและโครงงานคุณธรรม' }
];

export const DATA_QUALITY_METRICS = {
  completeness: 96.4,
  accuracy: 98.2,
  validity: 94.8,
  freshness: 99.1
};

export const DATA_REQUIREMENT_CHECKLIST = [
  { id: 'req-1', reqNo: '4.3.2-A', title: 'ดัชนีคุณธรรม 5 มิติ รายจังหวัด (ศคธ.)', source: 'ศคธ.', records: '77 จว. x 5 ปี', status: 'พร้อมใช้งาน 100%' },
  { id: 'req-2', reqNo: '4.3.2-B', title: 'คะแนนทุนชีวิตรายมิติ (ศคธ.)', source: 'ศคธ.', records: '4 มิติ x 77 จว.', status: 'พร้อมใช้งาน 100%' },
  { id: 'req-3', reqNo: '4.3.2-C', title: 'ดัชนีความโปร่งใส ITA (ป.ป.ช.)', source: 'ป.ป.ช.', records: '8,420 หน่วยงาน', status: 'เชื่อมโยง API แล้ว' },
  { id: 'req-4', reqNo: '4.3.2-D', title: 'สถิติวินัยข้าราชการ (ก.พ.)', source: 'ก.พ.', records: 'รายกระทรวง/จังหวัด', status: 'เชื่อมโยง API แล้ว' },
  { id: 'req-5', reqNo: '4.3.2-E', title: 'สถิติเด็กถูกทอดทิ้งและครอบครัวเปราะบาง (ดย./สค.)', source: 'พม.', records: '77 จังหวัด', status: 'เชื่อมโยงกึ่งอัตโนมัติ' },
  { id: 'req-6', reqNo: '4.3.2-F', title: 'สถิติจิตอาสาและสภาวะสังคม (สถิติแห่งชาติ)', source: 'สถิติฯ', records: 'ไตรมาส 1-4', status: 'พร้อมใช้งาน 100%' }
];

// -------------------------------------------------------------
// 3.1 รายงานสถานการณ์คุณธรรมและทุนชีวิตฉบับประชาชน (Public Insights)
// -------------------------------------------------------------
export const PUBLIC_INFOGRAPHIC_METRICS = [
  { title: 'คนไทยมีจิตอาสาและพร้อมช่วยเหลือสังคม', value: '84.9%', sub: 'สูงกว่าค่าเฉลี่ยอาเซียน', icon: 'HeartHandshake', color: '#10b981' },
  { title: 'ความกตัญญูครองแชมป์คุณธรรมอันดับ 1', value: '89.2', sub: 'คะแนนความกตัญญูเฉลี่ยทั่วประเทศ', icon: 'Award', color: '#8b5cf6' },
  { title: 'ความพอเพียงและวินัยทางการเงินดีขึ้น', value: '76.4', sub: 'คนไทยมีภูมิคุ้มกันทางเศรษฐกิจเพิ่มขึ้น', icon: 'Coins', color: '#3b82f6' },
  { title: 'ทุนชีวิตพลังครอบครัวและชุมชนอบอุ่น', value: '73.1', sub: 'ชุมชนเกื้อกูลและเป็นเกราะคุ้มกันเด็ก', icon: 'Users', color: '#f59e0b' }
];

export const PUBLIC_KEY_TAKEAWAYS = [
  {
    id: 1,
    title: 'พลังจิตอาสาช่วยกู้วิกฤตสังคม',
    text: 'เมื่อเกิดภัยธรรมชาติหรือสถานการณ์ฉุกเฉิน คนไทยรวมพลังจิตอาสาช่วยเหลือเพื่อนร่วมชาติอย่างรวดเร็ว โดยภาคเหนือและภาคอีสานมีคะแนนจิตอาสาสูงสุด',
    tag: 'จิตอาสา'
  },
  {
    id: 2,
    title: 'ครอบครัวคือฐานรากของคุณธรรมที่แท้จริง',
    text: 'ผลสำรวจชี้ชัดว่า เด็กที่เติบโตในครอบครัวที่มีเวลาพูดคุยและรับประทานอาหารร่วมกัน มีคะแนนความซื่อสัตย์และวินัยสูงกว่าเด็กกลุ่มอื่นถึง 28%',
    tag: 'ครอบครัว'
  },
  {
    id: 3,
    title: 'ความซื่อสัตย์สุจริตต้องปลูกฝังตั้งแต่ปฐมวัย',
    text: 'โรงเรียนคุณธรรมกว่า 1,420 แห่งทั่วประเทศพิสูจน์แล้วว่า การฝึกวินัยและการไม่ลอกการบ้านสร้างนิสัยความซื่อสัตย์ไปจนถึงวัยทำงาน',
    tag: 'สุจริต'
  },
  {
    id: 4,
    title: 'วิถีพอเพียงคือภูมิคุ้มกันหนี้สินครัวเรือน',
    text: 'ชุมชนที่นำแนวทางบัญชีครัวเรือนและความพอประมาณมาปรับใช้ สามารถลดสัดส่วนหนี้สินนอกระบบได้เฉลี่ย 34.5%',
    tag: 'พอเพียง'
  }
];

// -------------------------------------------------------------
// 3.2 แผนที่เมืองคุณธรรมและพื้นที่ต้นแบบ (Moral City Map & Showcase)
// -------------------------------------------------------------
export interface MoralPinModel {
  id: string;
  name: string;
  category: 'city' | 'org' | 'learning' | 'award';
  categoryLabel: string;
  province: string;
  district: string;
  lat: number;
  lng: number;
  highlight: string;
  imageUrl: string;
  contact: string;
}

export const MORAL_PINS_DATA: MoralPinModel[] = [
  { id: 'pin-1', name: 'จังหวัดคุณธรรมต้นแบบ ลำปาง', category: 'city', categoryLabel: 'เมืองคุณธรรม', province: 'ลำปาง', district: 'เมืองลำปาง', lat: 18.2888, lng: 99.4928, highlight: 'ขับเคลื่อน 100% ครอบคลุมโรงเรียน ชุมชน และวัดคุณธรรม', imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400', contact: 'ศาลากลางจังหวัดลำปาง โทร. 054-265000' },
  { id: 'pin-2', name: 'ชุมชนคุณธรรมบ้านดงเย็น', category: 'learning', categoryLabel: 'แหล่งเรียนรู้คุณธรรม', province: 'สุพรรณบุรี', district: 'อู่ทอง', lat: 14.3734, lng: 99.8890, highlight: 'ศูนย์เรียนรู้วิถีเกษตรพอเพียงและการจัดการขยะเหลือศูนย์', imageUrl: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400', contact: 'ผู้นำชุมชน โทร. 081-9988776' },
  { id: 'pin-3', name: 'โรงพยาบาลคุณธรรมค่ายสุรศักดิ์มนตรี', category: 'org', categoryLabel: 'องค์กรคุณธรรม', province: 'ลำปาง', district: 'เมืองลำปาง', lat: 18.3001, lng: 99.5050, highlight: 'บริการดุจญาติมิตร โปร่งใส ปลอดการทุจริต 100%', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400', contact: 'กลุ่มงานจริยธรรม รพ. โทร. 054-323456' },
  { id: 'pin-4', name: 'นายแพทย์จิตอาสาเพื่อผู้ยากไร้ (Thailand Moral Awards)', category: 'award', categoryLabel: 'บุคคลรางวัลคุณธรรม', province: 'เชียงใหม่', district: 'แม่แจ่ม', lat: 18.4980, lng: 98.3650, highlight: 'อุทิศตนรักษาผู้ป่วยบนดอยสูงต่อเนื่องกว่า 25 ปี', imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', contact: 'มูลนิธิแพทย์ดอยแม่แจ่ม' },
  { id: 'pin-5', name: 'วิสาหกิจชุมชนเกษตรอินทรีย์พังงา', category: 'learning', categoryLabel: 'แหล่งเรียนรู้คุณธรรม', province: 'พังงา', district: 'ตะกั่วป่า', lat: 8.8820, lng: 98.3650, highlight: 'ต้นแบบการแบ่งปันผลกำไรคืนสู่เด็กยากจนในชุมชน', imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400', contact: 'สหกรณ์การเกษตรตะกั่วป่า' },
  { id: 'pin-6', name: 'โรงเรียนคุณธรรมวิทยา ระยอง', category: 'org', categoryLabel: 'องค์กรคุณธรรม', province: 'ระยอง', district: 'เมืองระยอง', lat: 12.6814, lng: 101.2816, highlight: 'หลักสูตร "ซื่อสัตย์ วินัย ใฝ่รู้" ลดปัญหาการบูลลี่ในโรงเรียน 0%', imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', contact: 'ฝ่ายวิชาการ รร. โทร. 038-611223' }
];

export const THAILAND_MORAL_AWARDS_SHOWCASE = [
  { id: 'tma-1', name: 'ศ.เกียรติคุณ นพ.เกษม วัฒนชัย', category: 'บุคคลต้นแบบด้านคุณธรรม', awardYear: '2567', province: 'กรุงเทพฯ', organization: 'องคมนตรี / ประธานมูลนิธิธรรมาภิบาลทางการแพทย์', icon: 'Award' },
  { id: 'tma-2', name: 'โรงพยาบาลสมเด็จพระยุพราชด่านซ้าย', category: 'องค์กรคุณธรรมดีเด่น', awardYear: '2567', province: 'เลย', organization: 'กระทรวงสาธารณสุข', icon: 'ShieldCheck' },
  { id: 'tma-3', name: 'กลุ่มจิตอาสาพลังแผ่นดินเกาะเต่า', category: 'ชุมชนคุณธรรมจิตอาสา', awardYear: '2566', province: 'สุราษฎร์ธานี', organization: 'ชุมชนเกาะเต่า', icon: 'HeartHandshake' },
  { id: 'tma-4', name: 'สารคดีชุด "คนดีไม่มีวันตาย"', category: 'สื่อสร้างสรรค์คุณธรรมยอดเยี่ยม', awardYear: '2567', province: 'กรุงเทพฯ', organization: 'ไทยพีบีเอส (Thai PBS)', icon: 'FileText' }
];

// -------------------------------------------------------------
// 3.3 คลังความรู้ สื่อรณรงค์ และชุดข้อมูลเปิด (Open Data & Knowledge Hub)
// -------------------------------------------------------------
export interface OpenDatasetItem {
  id: string;
  code: string;
  title: string;
  category: string;
  org: string;
  updateFreq: string;
  formats: string[];
  recordsCount: string;
  downloadCount: number;
}

export const OPEN_DATA_18_DATASETS: OpenDatasetItem[] = [
  { id: 'ds-1', code: 'OD-MC-001', title: 'ดัชนีคุณธรรม 5 มิติ ระดับจังหวัด (2565-2568)', category: 'ดัชนีชี้วัด', org: 'ศคธ.', updateFreq: 'รายปี', formats: ['CSV', 'JSON', 'API'], recordsCount: '385 รายการ', downloadCount: 1420 },
  { id: 'ds-2', code: 'OD-MC-002', title: 'คะแนนทุนชีวิตรายมิติและรายภูมิภาค', category: 'ทุนชีวิต', org: 'ศคธ.', updateFreq: 'รายปี', formats: ['CSV', 'JSON'], recordsCount: '308 รายการ', downloadCount: 980 },
  { id: 'ds-3', code: 'OD-MC-003', title: 'ทะเบียนองค์กรคุณธรรมทั่วประเทศ 7,000 แห่ง', category: 'องค์กรคุณธรรม', org: 'ศคธ.', updateFreq: 'รายไตรมาส', formats: ['CSV', 'JSON', 'API'], recordsCount: '7,000 รายการ', downloadCount: 2310 },
  { id: 'ds-4', code: 'OD-MC-004', title: 'พิกัดและข้อมูลแหล่งเรียนรู้คุณธรรม 400 แห่ง', category: 'แหล่งเรียนรู้', org: 'ศคธ.', updateFreq: 'รายไตรมาส', formats: ['CSV', 'JSON', 'GEOJSON'], recordsCount: '400 รายการ', downloadCount: 1650 },
  { id: 'ds-5', code: 'OD-MC-005', title: 'รายชื่อผู้ได้รับรางวัล Thailand Moral Awards', category: 'รางวัลคุณธรรม', org: 'ศคธ.', updateFreq: 'รายปี', formats: ['CSV', 'JSON', 'PDF'], recordsCount: '700 รายการ', downloadCount: 1890 },
  { id: 'ds-6', code: 'OD-MC-006', title: 'ทำเนียบวิทยากรส่งเสริมคุณธรรม (Change Agent)', category: 'บุคลากร', org: 'ศคธ.', updateFreq: 'รายไตรมาส', formats: ['CSV', 'JSON'], recordsCount: '5,000 รายการ', downloadCount: 1120 },
  { id: 'ds-7', code: 'OD-MC-007', title: 'สถิติการจัดสรรงบประมาณส่งเสริมคุณธรรมบูรณาการ', category: 'งบประมาณ', org: 'สำนักงบฯ/ศคธ.', updateFreq: 'รายปี', formats: ['CSV', 'JSON'], recordsCount: '120 รายการ', downloadCount: 750 },
  { id: 'ds-8', code: 'OD-MC-008', title: 'สถิติการประเมิน ITA องค์กรภาครัฐคุณธรรม', category: 'ธรรมาภิบาล', org: 'ป.ป.ช.', updateFreq: 'รายปี', formats: ['CSV', 'JSON', 'API'], recordsCount: '8,420 รายการ', downloadCount: 3100 },
  { id: 'ds-9', code: 'OD-MC-009', title: 'รายงานสถานการณ์สภาวะสังคมและจิตอาสาคนไทย', category: 'สังคม', org: 'สถิติแห่งชาติ', updateFreq: 'รายไตรมาส', formats: ['CSV', 'PDF'], recordsCount: '450 รายการ', downloadCount: 1450 },
  { id: 'ds-10', code: 'OD-MC-010', title: 'ดัชนีสุขภาพจิตและความสุขมวลรวมรายจังหวัด', category: 'สุขภาพจิต', org: 'กรมสุขภาพจิต', updateFreq: 'รายปี', formats: ['CSV', 'JSON'], recordsCount: '77 รายการ', downloadCount: 1320 },
  { id: 'ds-11', code: 'OD-MC-011', title: 'สถิติเด็กและครอบครัวเปราะบางรายจังหวัด', category: 'ครอบครัว', org: 'กรมกิจการเด็กฯ', updateFreq: 'รายปี', formats: ['CSV', 'JSON'], recordsCount: '77 รายการ', downloadCount: 940 },
  { id: 'ds-12', code: 'OD-MC-012', title: 'ฐานข้อมูลโครงงานคุณธรรมสถานศึกษา สพฐ.', category: 'การศึกษา', org: 'สภาการศึกษา', updateFreq: 'รายภาคเรียน', formats: ['CSV', 'JSON'], recordsCount: '1,420 รายการ', downloadCount: 880 },
  { id: 'ds-13', code: 'OD-MC-013', title: 'ข้อมูล จปฐ. มิติด้านจริยธรรมและวิถีชีวิต', category: 'ชุมชน', org: 'กรมการพัฒนาชุมชน', updateFreq: 'รายปี', formats: ['CSV', 'API'], recordsCount: '74,000 รายการ', downloadCount: 1750 },
  { id: 'ds-14', code: 'OD-MC-014', title: 'ข้อเสนอแนะและสรุปสาระสำคัญเชิงนโยบายคุณธรรม', category: 'นโยบาย', org: 'ศคธ.', updateFreq: 'รายปี', formats: ['PDF', 'JSON'], recordsCount: '35 รายการ', downloadCount: 620 },
  { id: 'ds-15', code: 'OD-MC-015', title: 'ดัชนีความคุ้มค่าการลงทุนทางสังคม (Social ROI)', category: 'ความคุ้มค่า', org: 'ศคธ./สภาพัฒน์', updateFreq: 'รายปี', formats: ['CSV', 'JSON'], recordsCount: '45 รายการ', downloadCount: 890 },
  { id: 'ds-16', code: 'OD-MC-016', title: 'ผลสำรวจพฤติกรรมคุณธรรมจำแนกตาม Demographic', category: 'ประชากร', org: 'ศคธ.', updateFreq: 'รายปี', formats: ['CSV', 'JSON'], recordsCount: '180 รายการ', downloadCount: 1210 },
  { id: 'ds-17', code: 'OD-MC-017', title: 'พิกัดและข้อมูลโครงการขับเคลื่อน 4 จังหวัดนำร่อง', category: 'พื้นที่นำร่อง', org: 'ศคธ.', updateFreq: 'รายไตรมาส', formats: ['CSV', 'GEOJSON'], recordsCount: '160 รายการ', downloadCount: 1040 },
  { id: 'ds-18', code: 'OD-MC-018', title: 'คลังสื่อรณรงค์คุณธรรมและคู่มือปฏิบัติการดิจิทัล', category: 'สื่อความรู้', org: 'ศคธ.', updateFreq: 'รายเดือน', formats: ['JSON', 'PDF', 'API'], recordsCount: '1,500 รายการ', downloadCount: 4500 }
];

export const MEDIA_RESOURCES = [
  { id: 'med-1', title: 'คู่มือการขับเคลื่อนจังหวัดคุณธรรมฉบับปฏิบัติการ', type: 'E-book', category: 'คู่มือ', pages: '148 หน้า', downloads: 2450, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400' },
  { id: 'med-2', title: 'สารคดีสั้น: 4 จังหวัดนำร่องสู่นครคุณธรรม', type: 'Video', category: 'วิดีโอ', duration: '18 นาที', views: 12800, imageUrl: '/moral-city-documentary.jpg' },
  { id: 'med-3', title: 'อินโฟกราฟิกชุด: 5 มิติคุณธรรมสร้างชาติ', type: 'Infographic', category: 'อินโฟกราฟิก', sheets: '12 แผ่น', downloads: 5600, imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400' },
  { id: 'med-4', title: 'รายงานผลการสำรวจสถานการณ์คุณธรรมคนไทย ปี 2567', type: 'Research', category: 'รายงานวิจัย', pages: '320 หน้า', downloads: 1850, imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400' }
];

// -------------------------------------------------------------
// 3.4 ศูนย์การมีส่วนร่วมและข้อเสนอโครงการชุมชนคุณธรรม (Community Portal)
// -------------------------------------------------------------
export interface CommunityProjectRequest {
  id: string;
  title: string;
  community: string;
  province: string;
  budgetRequested: number;
  dimensionFocus: string;
  stage: 1 | 2 | 3 | 4 | 5; // 1: ยื่นข้อเสนอ, 2: พิจารณา, 3: อนุมัติ, 4: ดำเนินงาน, 5: ส่งรายงาน
  stageLabel: string;
  dateSubmitted: string;
  aiScore: number; // 0-100 AI pre-screening compatibility score
}

export const COMMUNITY_PROJECTS_PIPELINE: CommunityProjectRequest[] = [
  { id: 'cp-101', title: 'โครงการเยาวชนจิตอาสารักษ์แม่น้ำวัง', community: 'ชุมชนสบตุ๋ย', province: 'ลำปาง', budgetRequested: 45000, dimensionFocus: 'จิตอาสา และ พอเพียง', stage: 4, stageLabel: 'อยู่ระหว่างดำเนินงาน', dateSubmitted: '12 ม.ค. 2568', aiScore: 94 },
  { id: 'cp-102', title: 'ลานวัฒนธรรมคุณธรรมสายใยผูกพันสองฝั่งโขง', community: 'ชุมชนมีชัย', province: 'หนองคาย', budgetRequested: 60000, dimensionFocus: 'กตัญญู และ วินัย', stage: 3, stageLabel: 'อนุมัติงบประมาณแล้ว', dateSubmitted: '28 ม.ค. 2568', aiScore: 88 },
  { id: 'cp-103', title: 'โรงเรียนชาวสวนคุณธรรม ผลิตทุเรียนปลอดภัยซื่อสัตย์', community: 'ชุมชนบ้านค่าย', province: 'ระยอง', budgetRequested: 50000, dimensionFocus: 'สุจริต และ พอเพียง', stage: 2, stageLabel: 'อยู่ระหว่างพิจารณา', dateSubmitted: '15 ก.พ. 2568', aiScore: 91 },
  { id: 'cp-104', title: 'ฟื้นฟูป่าชายเลนคุณธรรมชุมชนคนพังงา', community: 'ชุมชนเกาะปันหยี', province: 'พังงา', budgetRequested: 75000, dimensionFocus: 'จิตอาสา และ วินัย', stage: 5, stageLabel: 'ส่งรายงานผลสำเร็จแล้ว', dateSubmitted: '10 พ.ย. 2567', aiScore: 96 }
];
