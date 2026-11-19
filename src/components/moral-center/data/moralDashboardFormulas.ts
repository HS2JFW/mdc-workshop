import type { ChartFormulaData } from '../components/ChartFormulaDrawer';

// ==========================================
// 1. FORMULAS FOR MORAL CREDIT DASHBOARD & SUB-MENUS
// ==========================================

export const FORMULA_MORAL_CREDIT_PARETO: ChartFormulaData = {
  title: 'อัตราการกระจุกตัวแบบพาเรโต 80/20 (Pareto Accumulation Rate)',
  badge: 'กฎ 80/20 รายการความดี',
  formulaLatex: '\\text{Cumulative Points \\%} = \\frac{\\sum_{i=1}^{k} \\text{Points}_i}{\\text{Total Accumulated Points}} \\times 100',
  formulaDisplay: 'สัดส่วนคะแนนสะสม (%) = (คะแนนรวมของรายการความดีลำดับที่ 1 ถึง k ÷ คะแนนสะสมทั้งหมด) × 100',
  objective: 'วิเคราะห์ว่าพฤติกรรมความดีส่วนใหญ่ในสังคมขับเคลื่อนด้วยกิจกรรมหลักใดบ้าง เพื่อกำหนดนโยบายส่งเสริมให้ตรงจุด ไม่หว่านแห',
  variables: [
    {
      symbol: 'k',
      name: 'ลำดับรายการความดี',
      definition: 'รายการพฤติกรรมความดีที่จัดเรียงจากคะแนนสูงสุดลงมาต่ำสุด (มีทั้งหมด 72 รายการ)',
      sourceDataset: 'Moral Credit Deeds Registry'
    },
    {
      symbol: 'Points_i',
      name: 'คะแนนความดีในรายการที่ i',
      definition: 'แต้มความดีสะสมทั้งหมดที่สมาชิกบันทึกในรายการนั้นๆ',
      sourceDataset: 'ระบบฐานข้อมูลธุรกรรมความดี (Moral Credit System)'
    },
    {
      symbol: 'Total Accumulated Points',
      name: 'คะแนนรวมทั้งระบบ',
      definition: 'ยอดแต้มความดีสะสมทั้งหมดของสมาชิก 46 จังหวัด (รวม 9,240 แต้ม)',
      sourceDataset: 'Moral Credit KPI Overview'
    }
  ],
  workedExample: {
    inputs: 'รายการความดี 12 ลำดับแรก (จาก 72 รายการ) มีคะแนนสะสมรวม 7,410 แต้ม จากยอดรวม 9,240 แต้ม',
    calculation: '(7,410 ÷ 9,240) × 100 = 80.19%',
    result: '80.2% ของแต้มความดีทั้งระบบ',
    interpretation: 'กิจกรรมความดีเพียง 16.7% (12 จาก 72 พฤติกรรม) สร้างผลลัพธ์แต้มความดีถึง 80.2% เช่น การช่วยเหลือผู้ยากไร้, จิตอาสาทำความสะอาด และการบริจาคโลหิต'
  },
  academicReference: 'Pareto Principle in Civic Engagement & Behavioral Economics (Joseph M. Juran, 1951)'
};

export const FORMULA_MORAL_CREDIT_BREADTH: ChartFormulaData = {
  title: 'ดัชนีความครอบคลุมมิติคุณธรรม (Dimension Breadth Index)',
  badge: 'ความกว้างของพฤติกรรม (1-6 ด้าน)',
  formulaLatex: '\\text{Breadth Score} = \\sum_{d \\in \\text{VirtueDimensions}} \\mathbb{I}(\\text{Points}_d > 0) \\quad [1 \\le \\text{Breadth} \\le 6]',
  formulaDisplay: 'คะแนนความกว้างมิติ = นับจำนวนมิติคุณธรรม (จาก 6 ด้าน) ที่สมาชิกมีการบันทึกคะแนนมากกว่า 0 แต้ม',
  objective: 'วัดว่าสมาชิกมีพฤติกรรมความดีรอบด้าน (Holistic Moral Behavior) หรือเชี่ยวชาญเฉพาะด้านเดียว เพื่อใช้ออกแบบรางวัลเชิดชูเกียรติ',
  variables: [
    {
      symbol: 'd',
      name: 'มิติคุณธรรม',
      definition: 'มิติคุณธรรม 6 ด้าน (จิตอาสา, วินัย, กตัญญู, พอเพียง, สุจริต, และสถาบันหลัก)',
      sourceDataset: 'กรอบแนวคิดคุณธรรม 5+1 ศูนย์คุณธรรม'
    },
    {
      symbol: 'I(Points_d > 0)',
      name: 'ฟังก์ชันตรวจสอบการมีส่วนร่วม',
      definition: 'มีค่าเท่ากับ 1 หากสมาชิกเคยบันทึกคะแนนในมิตินั้น และ 0 หากยังไม่เคยบันทึก',
      sourceDataset: 'Moral Credit Member Profile'
    }
  ],
  workedExample: {
    inputs: 'สมาชิกท่านหนึ่งบันทึก: จิตอาสา 120 แต้ม, วินัย 40 แต้ม, พอเพียง 15 แต้ม (อีก 3 มิติเป็น 0)',
    calculation: '1 (จิตอาสา) + 1 (วินัย) + 1 (พอเพียง) + 0 + 0 + 0 = 3 ด้าน',
    result: 'Breadth Level = 3 (ระดับ Routine Practitioner)',
    interpretation: 'สมาชิกท่านนี้มีพฤติกรรมความดีครอบคลุม 3 ด้าน จัดอยู่ในกลุ่มผู้ปฏิบัติสม่ำเสมอ ควรส่งเสริมให้ขยายสู่มิติกตัญญูและสุจริตเพิ่มเติม'
  },
  academicReference: 'Multidimensional Civic Participation Framework (UNESCO / Moral Center Thailand)'
};

export const FORMULA_MORAL_CREDIT_SCORE_BRACKETS: ChartFormulaData = {
  title: 'การแบ่งชั้นพีระมิดระดับคะแนน (Score Bracket Tiering)',
  badge: 'การจัดกลุ่ม 5 ขั้น',
  formulaLatex: '\\text{Tier}(S) = \\begin{cases} \\text{Inactive} & S = 0 \\\\ \\text{Emerging} & 1 \\le S \\le 20 \\\\ \\text{Routine} & 21 \\le S \\le 50 \\\\ \\text{High-Impact} & 51 \\le S \\le 100 \\\\ \\text{Moral Champion} & S > 100 \\end{cases}',
  formulaDisplay: 'ระดับขั้น = จัดกลุ่มสมาชิกตามคะแนนสะสม: 0 แต้ม (Inactive), 1-20 (เริ่มต้น), 21-50 (สม่ำเสมอ), 51-100 (ผลกระทบสูง), >100 (แชมป์คุณธรรม)',
  objective: 'แบ่งกลุ่มประชากรตามระดับความผูกพันกับระบบแต้มความดี เพื่อให้สิทธิประโยชน์และแรงจูงใจที่เหมาะสมในแต่ละขั้น',
  variables: [
    {
      symbol: 'S',
      name: 'คะแนนสะสมรวมของสมาชิก (Total Score)',
      definition: 'ผลรวมของแต้มความดีทุกรายการที่สมาชิกได้รับการอนุมัติ',
      sourceDataset: 'Moral Credit Member Database'
    }
  ],
  workedExample: {
    inputs: 'สมาชิกสะสมคะแนนได้ 84 แต้ม',
    calculation: 'เข้าเกณฑ์ช่วง 51 ถึง 100 แต้ม',
    result: 'ระดับ High-Impact Altruist (กลุ่มจิตอาสาผลกระทบสูง)',
    interpretation: 'ได้รับสิทธิ์เข้ารับการคัดเลือกเป็นผู้นำจิตอาสาและสิทธิประโยชน์ส่วนลดพิเศษจากภาคีเครือข่าย'
  }
};

export const FORMULA_MORAL_CREDIT_MCWS: ChartFormulaData = {
  title: 'คะแนนเครดิตทางสังคมและวินัยการเงิน (Moral Credit Worthiness Score - MCWS)',
  badge: 'หัวข้อ 1.1: แก้หนี้ครัวเรือน & สินเชื่อฐานราก',
  formulaLatex: '\\text{MCWS} = 0.40(\\text{Discipline}) + 0.30(\\text{Sufficiency}) + 0.20(\\text{CivicVolunteering}) + 0.10(\\text{ConsistencyBonus})',
  formulaDisplay: 'คะแนน MCWS = (คะแนนวินัย × 40%) + (คะแนนพอเพียง × 30%) + (คะแนนจิตอาสา × 20%) + (โบนัสความสม่ำเสมอ × 10%)',
  objective: 'ใช้เป็นคะแนนเครดิตทางเลือก (Alternative Credit Scoring) สำหรับผู้มีรายได้น้อยและเกษตรกรที่ไม่มีหลักทรัพย์ค้ำประกัน เพื่อเข้าถึงสินเชื่อดอกเบี้ยต่ำ',
  variables: [
    {
      symbol: 'Discipline',
      name: 'วินัยการเงินและการปฏิบัติตามสัญญา',
      definition: 'คะแนนความตรงต่อเวลาและการบันทึกบัญชีครัวเรือน',
      sourceDataset: 'Moral Credit Discipline Sub-category'
    },
    {
      symbol: 'Sufficiency',
      name: 'ดัชนีความพอเพียงและการออม',
      definition: 'สัดส่วนการออมและการลดรายจ่ายที่ไม่จำเป็น',
      sourceDataset: 'Moral Credit Sufficiency Sub-category & TPMAP'
    },
    {
      symbol: 'CivicVolunteering',
      name: 'กิจกรรมจิตอาสาเพื่อส่วนรวม',
      definition: 'การเข้าร่วมพัฒนาชุมชนและช่วยเหลือเพื่อนบ้าน',
      sourceDataset: 'Moral Credit Volunteering Deeds'
    }
  ],
  workedExample: {
    inputs: 'วินัย 85 คะแนน, พอเพียง 78 คะแนน, จิตอาสา 90 คะแนน, โบนัสความสม่ำเสมอ 100 คะแนน',
    calculation: '(85×0.40) + (78×0.30) + (90×0.20) + (100×0.10) = 34.0 + 23.4 + 18.0 + 10.0 = 85.4',
    result: 'MCWS = 85.4 / 100 (เกรด A: อนุมัติสินเชื่อพิเศษ)',
    interpretation: 'ผู้กู้มีประวัติวินัยและความพอเพียงสูงมาก มีอัตราการชำระหนี้คืนสูงกว่าเกณฑ์ปกติ 24.5%'
  },
  academicReference: 'Alternative Credit Scoring with Psychometric & Behavioral Indicators (World Bank, 2019)'
};

export const FORMULA_MORAL_CREDIT_MWAI: ChartFormulaData = {
  title: 'ดัชนีการเข้าถึงแหล่งเรียนรู้วิทยาศาสตร์ผ่านแต้มความดี (Moral Voucher Access Index - MWAI)',
  badge: 'หัวข้อ 1.2: การเรียนรู้ตลอดชีวิต & ลดความเหลื่อมล้ำ STEM',
  formulaLatex: '\\text{MWAI} = \\frac{\\text{Learning Vouchers Redeemed} \\times \\text{STEM Center Reach}}{\\text{Underprivileged Youth Count in Area}} \\times 100',
  formulaDisplay: 'ดัชนี MWAI = (จำนวนตั๋วเรียนรู้ที่แลกได้ × การเข้าถึงแหล่งเรียนรู้ STEM) ÷ จำนวนเยาวชนยากจนพิเศษในพื้นที่ × 100',
  objective: 'วัดประสิทธิผลในการเปลี่ยนแต้มความดีของเด็กและเยาวชนให้เป็นโอกาสในการเข้าชมพิพิธภัณฑ์วิทยาศาสตร์และคอร์สอบรม STEM ฟรี',
  variables: [
    {
      symbol: 'Learning Vouchers',
      name: 'ตั๋วการเรียนรู้ที่แลกผ่านแต้มความดี',
      definition: 'จำนวนสิทธิ์ที่เด็กแลกแต้มความดีเข้าเรียนรู้ฟรี',
      sourceDataset: 'Moral Credit Voucher Redemption System'
    },
    {
      symbol: 'Underprivileged Youth',
      name: 'เด็กและเยาวชนยากจนพิเศษ',
      definition: 'ข้อมูลเด็กนักเรียนยากจนพิเศษจากกองทุนเพื่อความเสมอภาคทางการศึกษา (กสศ.)',
      sourceDataset: 'กสศ. (EEF Data Sandbox)'
    }
  ],
  workedExample: {
    inputs: 'ตั๋วเรียนรู้แลกแล้ว 450 ใบ ในพื้นที่ที่มีเด็กยากจนพิเศษ 1,200 คน ค่าการเข้าถึงแหล่งเรียนรู้ 0.85',
    calculation: '(450 × 0.85 ÷ 1,200) × 100 = 31.87',
    result: 'MWAI = 31.9% (เข้าถึงเกือบ 1 ใน 3)',
    interpretation: 'แต้มความดีสามารถช่วยให้เด็กยากจนพิเศษ 31.9% ได้เข้าถึงแหล่งเรียนรู้นอกห้องเรียนโดยไม่เสียค่าใช้จ่าย'
  }
};

export const FORMULA_MORAL_CREDIT_BCR: ChartFormulaData = {
  title: 'อัตราผลประโยชน์ต่อต้นทุนจากวินัยพลเมือง (Benefit-Cost Ratio - BCR)',
  badge: 'หัวข้อ 1.3: บริการสาธารณะ & ลดอุบัติเหตุ',
  formulaLatex: '\\text{BCR} = \\frac{\\Delta \\text{Economic Loss Avoided (Accidents + Health)}}{\\text{Total Investment in Moral Credit Incentives}}',
  formulaDisplay: 'อัตราส่วน BCR = มูลค่าความสูญเสียทางเศรษฐกิจที่ประหยัดได้ (ลดอุบัติเหตุ + สุขภาพ) ÷ งบประมาณสนับสนุนแต้มความดี',
  objective: 'คำนวณความคุ้มค่าทางเศรษฐศาสตร์ของนโยบายแต้มความดี ว่าทุก 1 บาทที่ลงทุนในสิทธิประโยชน์ สร้างผลตอบแทนคืนสู่สังคมกี่บาท',
  variables: [
    {
      symbol: 'Economic Loss Avoided',
      name: 'มูลค่าความสูญเสียที่ประหยัดได้',
      definition: 'ค่ารักษาพยาบาลและความเสียหายจากอุบัติเหตุจราจรและการคัดแยกขยะที่ลดลง',
      sourceDataset: 'สถิติอุบัติเหตุ สธ. และ กรมควบคุมมลพิษ'
    },
    {
      symbol: 'Investment',
      name: 'งบประมาณสนับสนุนแต้มความดี',
      definition: 'มูลค่าของรางวัลและส่วนลดที่ภาครัฐและเอกชนจัดสรร',
      sourceDataset: 'รายงานงบประมาณระบบ Moral Credit'
    }
  ],
  workedExample: {
    inputs: 'ลดความสูญเสียจากอุบัติเหตุและขยะได้ 48.6 ล้านบาท จากงบอุดหนุนแต้มความดี 12.8 ล้านบาท',
    calculation: '48.6 ÷ 12.8 = 3.79',
    result: 'BCR = 3.80 เท่า (คุ้มค่าการลงทุนสูง)',
    interpretation: 'การลงทุนทุก 1 บาทในโครงการ Moral Credit ก่อให้เกิดผลประโยชน์กลับคืนสู่สังคม 3.80 บาท'
  },
  academicReference: 'Social Return on Investment (SROI) & Cost-Benefit Analysis (HM Treasury Green Book)'
};

// ==========================================
// 2. FORMULAS FOR MORAL LECTURERS DASHBOARD & SUB-MENUS
// ==========================================

export const FORMULA_MORAL_LECTURERS_DENSITY: ChartFormulaData = {
  title: 'อัตราความหนาแน่นวิทยากรคุณธรรมต่อประชากร (Lecturer Density Rate)',
  badge: 'ต่อประชากร 100,000 คน',
  formulaLatex: '\\text{Lecturer Density} = \\frac{\\text{Total Registered Lecturers in Province}}{\\text{Provincial Population}} \\times 100,000',
  formulaDisplay: 'ความหนาแน่นวิทยากร (คนต่อแสนประชากร) = (จำนวนวิทยากรที่ขึ้นทะเบียนในจังหวัด ÷ จำนวนประชากรของจังหวัด) × 100,000',
  objective: 'เปรียบเทียบสัดส่วนวิทยากรอย่างเป็นธรรมระหว่างจังหวัดใหญ่และจังหวัดเล็ก เพื่อระบุพื้นที่ขาดแคลน (White Space)',
  variables: [
    {
      symbol: 'Total Registered Lecturers',
      name: 'จำนวนวิทยากรที่ขึ้นทะเบียน',
      definition: 'วิทยากรคุณธรรมที่ผ่านการอบรมและรับรองจากศูนย์คุณธรรมในจังหวัดนั้นๆ',
      sourceDataset: 'ทำเนียบวิทยากรคุณธรรม (MDC Lecturers Directory)'
    },
    {
      symbol: 'Provincial Population',
      name: 'จำนวนประชากรในจังหวัด',
      definition: 'สถิติจำนวนประชากรตามทะเบียนราษฎร กรมการปกครอง',
      sourceDataset: 'ฐานข้อมูลประชากรรายจังหวัด กรมการปกครอง'
    }
  ],
  workedExample: {
    inputs: 'จังหวัดเชียงใหม่ มีวิทยากรขึ้นทะเบียน 48 คน ประชากร 1,790,000 คน',
    calculation: '(48 ÷ 1,790,000) × 100,000 = 2.68 คน',
    result: '2.68 คน ต่อแสนประชากร',
    interpretation: 'จังหวัดเชียงใหม่มีความหนาแน่นของวิทยากรอยู่ในเกณฑ์ดี สามารถกระจายการขับเคลื่อนลงสู่ระดับอำเภอได้อย่างทั่วถึง'
  },
  academicReference: 'Human Capital Density Metric (OECD / Ministry of Culture Thailand)'
};

export const FORMULA_MORAL_LECTURERS_CBI: ChartFormulaData = {
  title: 'ดัชนีความสมดุลด้านความเชี่ยวชาญคุณธรรม (Competency Balance Index - CBI)',
  badge: 'ความสมดุล 5 ด้าน',
  formulaLatex: '\\text{CBI} = 1 - \\frac{\\sigma(C_1, C_2, C_3, C_4, C_5)}{\\mu(C_1, C_2, C_3, C_4, C_5)} \\quad [0 \\le \\text{CBI} \\le 1]',
  formulaDisplay: 'ดัชนีความสมดุล (0 ถึง 1) = 1 - (ส่วนเบี่ยงเบนมาตรฐานของวิทยากร 5 ด้าน ÷ ค่าเฉลี่ยของวิทยากร 5 ด้าน)',
  objective: 'ตรวจสอบว่าจังหวัดมีวิทยากรครบทั้ง 5 ด้านคุณธรรม (พอเพียง, วินัย, สุจริต, จิตอาสา, กตัญญู) อย่างสมดุล หรือกระจุกตัวด้านใดด้านหนึ่ง',
  variables: [
    {
      symbol: 'C_i',
      name: 'จำนวนวิทยากรในแต่ละมิติคุณธรรม',
      definition: 'จำนวนวิทยากรที่มีความเชี่ยวชาญในด้าน i (จากทั้งหมด 5 ด้าน)',
      sourceDataset: 'MDC Moral Competencies Data'
    },
    {
      symbol: 'σ (Sigma)',
      name: 'ส่วนเบี่ยงเบนมาตรฐาน',
      definition: 'การกระจายตัวของจำนวนวิทยากรระหว่าง 5 ด้าน',
      sourceDataset: 'การวิเคราะห์เชิงสถิติ'
    },
    {
      symbol: 'μ (Mu)',
      name: 'ค่าเฉลี่ยวิทยากรต่อด้าน',
      definition: 'ผลรวมวิทยากรทุกด้านหารด้วย 5',
      sourceDataset: 'การวิเคราะห์เชิงสถิติ'
    }
  ],
  workedExample: {
    inputs: 'ภาคตะวันออกเฉียงเหนือ มีวิทยากรเฉลี่ยด้านละ 142 คน ส่วนเบี่ยงเบนมาตรฐาน 28.4 คน',
    calculation: '1 - (28.4 ÷ 142) = 1 - 0.20 = 0.80',
    result: 'CBI = 0.80 (ระดับความสมดุลสูง)',
    interpretation: 'มีการกระจายตัวของความเชี่ยวชาญทั้ง 5 ด้านอย่างสมดุล ไม่เกิดภาวะขาดแคลนด้านใดด้านหนึ่งอย่างรุนแรง'
  }
};

export const FORMULA_MORAL_LECTURERS_SUPPLY_DEMAND: ChartFormulaData = {
  title: 'สัดส่วนช่องว่างความต้องการวิทยากร (Lecturer Supply-Demand Gap Ratio)',
  badge: 'การจัดสรรงบประมาณเชิงพื้นที่',
  formulaLatex: '\\text{Gap Ratio} = \\frac{\\text{Target Communities in Area}}{\\text{Certified Lecturers in Area}} \\times \\text{Risk Multiplier}',
  formulaDisplay: 'อัตราส่วนช่องว่าง = (จำนวนชุมชนเป้าหมายในพื้นที่ ÷ จำนวนวิทยากรที่ขึ้นทะเบียน) × ตัวคูณความเสี่ยงเชิงพื้นที่',
  objective: 'ระบุพื้นที่ที่วิทยากรไม่เพียงพอต่อปริมาณชุมชนเป้าหมาย เพื่อจัดสรรงบประมาณส่งวิทยากรพี่เลี้ยงข้ามพื้นที่',
  variables: [
    {
      symbol: 'Target Communities',
      name: 'ชุมชนเป้าหมายในพื้นที่',
      definition: 'จำนวนหมู่บ้านและชุมชนที่กำลังอยู่ในกระบวนการยกระดับสู่ชุมชนคุณธรรม',
      sourceDataset: 'Moral City Database'
    },
    {
      symbol: 'Certified Lecturers',
      name: 'วิทยากรที่ขึ้นทะเบียน',
      definition: 'จำนวนวิทยากรที่มีภูมิลำเนาหรือสังกัดอยู่ในพื้นที่นั้น',
      sourceDataset: 'MDC People Database'
    }
  ],
  workedExample: {
    inputs: 'ชุมชนเป้าหมาย 120 แห่ง, วิทยากรในพื้นที่ 4 คน, ตัวคูณความเสี่ยง 1.25',
    calculation: '(120 ÷ 4) × 1.25 = 30 × 1.25 = 37.5',
    result: 'ภาระ 37.5 ชุมชน/คน (ระดับขาดแคลนวิกฤต)',
    interpretation: 'วิทยากร 1 คนต้องดูแลถึง 37 ชุมชน เกินเกณฑ์มาตรฐาน (1 ต่อ 10 ชุมชน) จำเป็นต้องส่งวิทยากรเสริมเร่งด่วน'
  }
};

// ==========================================
// 3. FORMULAS FOR MORAL CITY DASHBOARD & SUB-MENUS
// ==========================================

export const FORMULA_MORAL_CITY_MATURITY: ChartFormulaData = {
  title: 'คะแนนวุฒิภาวะเมืองคุณธรรมเฉลี่ย (Average Moral City Maturity Score)',
  badge: 'คะแนนเต็ม 5.00 ขั้น',
  formulaLatex: '\\text{Maturity Score} = \\sum_{k=1}^{5} \\left( k \\times \\frac{\\text{Entities in Level } k}{\\text{Total Tracked Entities}} \\right)',
  formulaDisplay: 'คะแนนวุฒิภาวะเฉลี่ย (1.00 - 5.00) = ผลรวมของ (ระดับขั้นที่ k × สัดส่วนองค์กรที่อยู่ในระดับ k)',
  objective: 'วัดระดับพัฒนาการเฉลี่ยของจังหวัด จากขั้นที่ 1 (รับรู้/สื่อสาร) ไปจนถึงขั้นที่ 5 (ถ่ายทอดองค์ความรู้สู่สากล)',
  variables: [
    {
      symbol: 'k',
      name: 'ระดับวุฒิภาวะ (Levels 1 to 5)',
      definition: 'ระดับความพร้อม 5 ขั้น: 1=รับรู้, 2=มีแผนงาน, 3=ลงมือปฏิบัติ, 4=พี่เลี้ยง/แหล่งเรียนรู้, 5=นวัตกรรมต้นแบบ',
      sourceDataset: 'เกณฑ์มาตรฐานการประเมินเมืองคุณธรรม ศูนย์คุณธรรม'
    },
    {
      symbol: 'Entities in Level k',
      name: 'จำนวนองค์กรในระดับ k',
      definition: 'จำนวนชุมชน องค์กร และอำเภอ ที่ผ่านการประเมินในระดับขั้นนั้นๆ',
      sourceDataset: 'รายงานผลการติดตามเมืองคุณธรรมรายจังหวัด (Moral City Reports)'
    },
    {
      symbol: 'Total Tracked Entities',
      name: 'จำนวนองค์กรที่ได้รับการติดตามทั้งหมด',
      definition: 'ผลรวมขององค์กรเป้าหมายทั้งหมดในจังหวัด',
      sourceDataset: 'Moral City Database'
    }
  ],
  workedExample: {
    inputs: 'จังหวัดพิษณุโลก: Level 1 (10%), Level 2 (20%), Level 3 (35%), Level 4 (25%), Level 5 (10%)',
    calculation: '(1×0.10) + (2×0.20) + (3×0.35) + (4×0.25) + (5×0.10) = 0.10 + 0.40 + 1.05 + 1.00 + 0.50 = 3.05',
    result: '3.05 / 5.00 (ระดับ 3: กิจกรรมต่อเนื่องเป็นรูปธรรม)',
    interpretation: 'จังหวัดพิษณุโลกมีคะแนนวุฒิภาวะเกินระดับ 3 แสดงว่าระบบขับเคลื่อนหยั่งรากลึกเข้าสู่วิถีปฏิบัติประจำวันของชุมชนแล้ว'
  },
  academicReference: 'Capability Maturity Model Integration (CMMI adapted for Public Virtue Governance)'
};

export const FORMULA_MORAL_CITY_MODEL_RATIO: ChartFormulaData = {
  title: 'อัตราส่วนองค์กรคุณธรรมต้นแบบ (% Model Entity Ratio)',
  badge: 'สัดส่วนองค์กรต้นแบบ',
  formulaLatex: '\\text{Model Ratio (\\%)} = \\frac{\\text{Model Communities} + \\text{Model Orgs} + \\text{Model Districts}}{\\text{Total Declared Entities}} \\times 100',
  formulaDisplay: 'อัตราส่วนองค์กรต้นแบบ (%) = [(ชุมชนต้นแบบ + องค์กรต้นแบบ + อำเภอต้นแบบ) ÷ องค์กรที่ประกาศเจตนารมณ์ทั้งหมด] × 100',
  objective: 'วัดประสิทธิผลในการยกระดับองค์กรจากระดับส่งเสริมและพัฒนา สู่การเป็น "ต้นแบบ" ที่สามารถเป็นแหล่งศึกษาดูงานได้',
  variables: [
    {
      symbol: 'Model Entities',
      name: 'องค์กรคุณธรรมต้นแบบ',
      definition: 'องค์กรที่ผ่านเกณฑ์ประเมินระดับสูงสุด ได้รับการประกาศเกียรติคุณจากคณะกรรมการส่งเสริมคุณธรรมแห่งชาติ',
      sourceDataset: 'ทำเนียบองค์กรคุณธรรมต้นแบบ'
    },
    {
      symbol: 'Total Declared Entities',
      name: 'องค์กรที่ประกาศเจตนารมณ์ทั้งหมด',
      definition: 'จำนวนองค์กรทั้งหมดที่เข้าร่วมกระบวนการขับเคลื่อนคุณธรรมในพื้นที่',
      sourceDataset: 'ระบบติดตามการขับเคลื่อนจังหวัดคุณธรรม'
    }
  ],
  workedExample: {
    inputs: 'จังหวัดมีองค์กรต้นแบบรวม 168 แห่ง จากองค์กรที่ประกาศเจตนารมณ์ 420 แห่ง',
    calculation: '(168 ÷ 420) × 100 = 40.0%',
    result: '40.0% เป็นองค์กรต้นแบบ',
    interpretation: 'ถือว่าสูงกว่าค่าเฉลี่ยประเทศ (32.4%) แสดงถึงศักยภาพของกลไกพี่เลี้ยงในการยกระดับองค์กรในพื้นที่ได้อย่างมีประสิทธิภาพ'
  }
};

export const FORMULA_MORAL_CITY_GOVERNANCE_ITA: ChartFormulaData = {
  title: 'ดัชนีธรรมาภิบาลและความโปร่งใสร่วม (Moral Governance & Transparency Index)',
  badge: 'หัวข้อ 1: ธรรมาภิบาล & ต้านทุจริต',
  formulaLatex: '\\text{MGTI} = 0.50(\\text{ITA Score}) + 0.30(\\text{Integrity Virtue Index}) - 0.20(\\text{Procurement Corruption Cases Normalized})',
  formulaDisplay: 'ดัชนี MGTI = (คะแนน ITA × 50%) + (ดัชนีสุจริต × 30%) - (คดีทุจริตจัดซื้อจัดจ้าง ป.ป.ช. × 20%)',
  objective: 'ประเมินความโปร่งใสในระดับจังหวัดโดยผสานผลประเมินเชิงสถาบัน (ITA) เข้ากับพฤติกรรมคุณธรรมเชิงประจักษ์และการป้องปรามคดีทุจริต',
  variables: [
    {
      symbol: 'ITA Score',
      name: 'คะแนนการประเมินคุณธรรมและความโปร่งใส (ITA)',
      definition: 'คะแนนผลประเมินหน่วยงานภาครัฐโดยสำนักงาน ป.ป.ช.',
      sourceDataset: 'สำนักงาน ป.ป.ช. (ITA National Portal)'
    },
    {
      symbol: 'Integrity Virtue Index',
      name: 'ดัชนีคุณธรรมด้านสุจริต',
      definition: 'คะแนนดัชนีชี้วัดคุณธรรมมิติสุจริตจากผลสำรวจศูนย์คุณธรรม',
      sourceDataset: 'Moral Index Survey Data (MDC)'
    }
  ],
  workedExample: {
    inputs: 'ITA 92.4, ดัชนีสุจริต 4.45 (แปลงเป็นร้อยละ = 89.0), คดีทุจริตปรับเทียบ 12.0',
    calculation: '(92.4 × 0.50) + (89.0 × 0.30) - (12.0 × 0.20) = 46.2 + 26.7 - 2.4 = 70.5',
    result: 'MGTI = 70.5 / 100 (ระดับธรรมาภิบาลดีเด่น)',
    interpretation: 'จังหวัดมีมาตรการป้องกันการทุจริตที่เข้มแข็งและบุคลากรมีค่านิยมสุจริตเป็นที่ประจักษ์'
  }
};

export const FORMULA_MORAL_CITY_BEDI: ChartFormulaData = {
  title: 'ดัชนีภูมิคุ้มกันหนี้สินและความพอเพียง (Basic Economic & Debt Immunity Index - BEDI)',
  badge: 'หัวข้อ 2: แก้หนี้ครัวเรือน & เศรษฐกิจฐานราก',
  formulaLatex: '\\text{BEDI} = \\frac{\\text{Household Savings Rate} \\times \\text{Sufficiency Virtue Score}}{\\text{Consumption Debt to Income Ratio}}',
  formulaDisplay: 'ดัชนี BEDI = (อัตราการออมครัวเรือน × คะแนนมิติพอเพียง) ÷ สัดส่วนหนี้เพื่อการอุปโภคบริโภคต่อรายได้',
  objective: 'วัดขีดความสามารถของครัวเรือนในชุมชนคุณธรรมในการรับมือวิกฤตเศรษฐกิจและการปลดเปลื้องหนี้สินนอกระบบ',
  variables: [
    {
      symbol: 'Household Savings Rate',
      name: 'อัตราการออมครัวเรือน',
      definition: 'ร้อยละของรายได้ที่ครัวเรือนสามารถจัดสรรเป็นเงินออม',
      sourceDataset: 'สำนักงานสถิติแห่งชาติ / ธปท.'
    },
    {
      symbol: 'Sufficiency Score',
      name: 'คะแนนมิติพอเพียง',
      definition: 'คะแนนดัชนีคุณธรรมด้านความพอเพียงและการลดรายจ่ายฟุ่มเฟือย',
      sourceDataset: 'ดัชนีคุณธรรม 5 มิติ ศูนย์คุณธรรม'
    }
  ],
  workedExample: {
    inputs: 'อัตราการออม 14.2%, คะแนนพอเพียง 4.38, สัดส่วนหนี้บริโภค 28.5%',
    calculation: '(14.2 × 4.38) ÷ 28.5 = 62.19 ÷ 28.5 = 2.18',
    result: 'BEDI = 2.18 (เกณฑ์ปลอดภัย > 1.80)',
    interpretation: 'ครัวเรือนในพื้นที่มีภูมิคุ้มกันทางการเงินแข็งแรง สามารถชำระหนี้ได้ตามกำหนดโดยไม่ก่อหนี้ซ้ำซ้อน'
  }
};

// ==========================================
// 4. ADDITIONAL DETAILED FORMULAS FOR LECTURERS & CITY SUB-MENUS
// ==========================================

export const FORMULA_MORAL_LECTURERS_IIDI: ChartFormulaData = {
  title: 'ดัชนีช่องว่างการแทรกแซงด้านสุจริต (Integrity Intervention Deficit Index - IIDI)',
  badge: 'มิติที่ 1: สุจริต vs ป.ป.ช. & ITA',
  formulaLatex: '\\text{IIDI} = \\frac{\\text{Corruption Risk Index (CRI \\%)}}{\\text{Lecturers per 100k Population}} \\times \\left(1 - \\frac{\\text{ITA Score}}{100}\\right)',
  formulaDisplay: 'ดัชนี IIDI = (ดัชนีความเสี่ยงทุจริต CRI ÷ จำนวนวิทยากรสุจริตต่อแสนคน) × (1 - คะแนน ITA ÷ 100)',
  objective: 'ตรวจจับ "พื้นที่สุญญากาศทางจริยธรรม (Integrity Desert)" ที่มีความเสี่ยงทุจริตสูงแต่ขาดแคลนวิทยากร เพื่อส่งทีมวิทยากรลงพื้นที่เร่งด่วน',
  variables: [
    {
      symbol: 'CRI (%)',
      name: 'ดัชนีความเสี่ยงทุจริต (Corruption Risk Index)',
      definition: 'สัดส่วนคดีทุจริตในพื้นที่ต่อปริมาณงบประมาณจัดซื้อจัดจ้าง',
      sourceDataset: 'ระบบ PESCA/CCMS ของสำนักงาน ป.ป.ช.'
    },
    {
      symbol: 'Lecturers/100k',
      name: 'ความหนาแน่นวิทยากรสุจริต',
      definition: 'จำนวนวิทยากรคุณธรรมด้านสุจริตที่พร้อมปฏิบัติการต่อประชากร 1 แสนคน',
      sourceDataset: 'ทำเนียบวิทยากรคุณธรรม (MDC People)'
    },
    {
      symbol: 'ITA Score',
      name: 'คะแนนการประเมินคุณธรรมและความโปร่งใส',
      definition: 'ผลการประเมิน ITA เฉลี่ยของหน่วยงานรัฐและ อปท. ในจังหวัด',
      sourceDataset: 'สำนักงาน ป.ป.ช.'
    }
  ],
  workedExample: {
    inputs: 'กทม.และปริมณฑล: CRI = 74.5%, วิทยากร = 1.8 คน/แสนคน, ITA เฉลี่ย = 81.2 คะแนน',
    calculation: '(74.5 ÷ 1.8) × (1 - 0.812) = 41.39 × 0.188 = 7.78',
    result: 'IIDI = 7.78 (ระดับวิกฤตสีแดงเข้ม > 5.0)',
    interpretation: 'พื้นที่นี้มีความเสี่ยงการทุจริตสูง แต่วิทยากรมีน้อยมาก จำเป็นต้องระดมวิทยากรจากเครือข่าย ป.ป.ช. และภาคีเอกชนเข้าช่วยเสริมศักยภาพ'
  },
  academicReference: 'Integrity Vacuum & Anti-Corruption Intervention Modeling (Transparency International / UNODC)'
};

export const FORMULA_MORAL_LECTURERS_SUFFICIENCY_QUADRANT: ChartFormulaData = {
  title: 'ดัชนีการจัดสรรวิทยากรด้านความพอเพียง (Sufficiency & Debt Immunity Score)',
  badge: 'มิติที่ 2: พอเพียง vs วินัยการเงิน & หนี้ครัวเรือน',
  formulaLatex: '\\text{Sufficiency Need} = \\frac{\\text{Consumer Debt per Capita}}{\\text{Provincial Household Income}} \\times (6 - \\text{Sufficiency Score})',
  formulaDisplay: 'ความต้องการวิทยากรพอเพียง = (ภาระหนี้เพื่อการอุปโภคต่อหัว ÷ รายได้เฉลี่ยครัวเรือน) × (6 - คะแนนคุณธรรมด้านพอเพียง)',
  objective: 'วิเคราะห์ 4 จตุภาคเพื่อปรับเปลี่ยนหลักสูตรวิทยากรจาก "เกษตรทฤษฎีใหม่" สู่ "วินัยการเงินคนเมืองและการแก้หนี้บัตรเครดิต"',
  variables: [
    {
      symbol: 'Consumer Debt',
      name: 'หนี้สินเพื่อการอุปโภคบริโภคต่อหัว',
      definition: 'ยอดหนี้บัตรเครดิต หนี้ส่วนบุคคล และหนี้นอกระบบเฉลี่ยต่อคน',
      sourceDataset: 'ธนาคารแห่งประเทศไทย / สำนักงานสถิติแห่งชาติ'
    },
    {
      symbol: 'Sufficiency Score',
      name: 'คะแนนคุณธรรมด้านพอเพียง',
      definition: 'คะแนนจากการสำรวจดัชนีคุณธรรม (เต็ม 5.00)',
      sourceDataset: 'ศูนย์คุณธรรม (องค์การมหาชน)'
    }
  ],
  workedExample: {
    inputs: 'ภาคตะวันออกเฉียงเหนือ: หนี้บริโภค 168,000 บาท/คน, คะแนนพอเพียง 5.48/6',
    calculation: '(168,000 ÷ 220,000) × (6 - 5.48) = 0.764 × 0.52 = 0.397',
    result: 'Need Score = 0.40 (กลุ่มต้นแบบภูมิคุ้มกันหนี้)',
    interpretation: 'ชุมชนมีภูมิคุ้มกันความพอเพียงสูงอยู่แล้ว ควรพัฒนาเป็นแหล่งเรียนรู้วิทยากรพี่เลี้ยงไปช่วยภาคกลางและ กทม.'
  }
};

export const FORMULA_MORAL_LECTURERS_DISCIPLINE_GAP: ChartFormulaData = {
  title: 'ช่องว่างความสอดคล้องด้านวินัยและธรรมาภิบาล (Discipline Alignment Gap - DAG)',
  badge: 'มิติที่ 3: วินัยพลเมือง vs ความโปร่งใสรัฐ',
  formulaLatex: '\\text{DAG} = |\\text{Civic Discipline Score} - \\text{Gov Transparency (ITA Ind 9 Normalized)}|',
  formulaDisplay: 'ค่า DAG (คะแนน) = |คะแนนวินัยของประชาชน - คะแนนความโปร่งใสของภาครัฐ (ITA ตัวชี้วัดที่ 9)|',
  objective: 'วัดความไม่สอดคล้องกันระหว่างวินัยของประชาชนกับความโปร่งใสของกลไกรัฐ เพื่อปรับปรุงทั้งสองฝ่ายไปพร้อมกัน',
  variables: [
    {
      symbol: 'Civic Discipline',
      name: 'คะแนนวินัยของประชาชน',
      definition: 'การปฏิบัติตามกฎหมายจราจร วินัยชุมชน และความซื่อตรง (ฐาน 6)',
      sourceDataset: 'Moral Index Discipline Dimension'
    },
    {
      symbol: 'ITA Ind 9',
      name: 'ITA ตัวชี้วัดที่ 9 ของภาครัฐ',
      definition: 'การเปิดเผยข้อมูลสาธารณะและการอำนวยความสะดวกประชาชน (ปรับเทียบฐาน 6)',
      sourceDataset: 'สำนักงาน ป.ป.ช.'
    }
  ],
  workedExample: {
    inputs: 'ภาคใต้: คะแนนวินัยประชาชน 5.10 คะแนน, คะแนนความโปร่งใสรัฐ 3.65 คะแนน',
    calculation: '|5.10 - 3.65| = 1.45 คะแนน',
    result: 'DAG = 1.45 (ช่องว่างสูง เกิดความไม่ไว้วางใจต่อกลไกรัฐ)',
    interpretation: 'ประชาชนมีวินัยสูงแต่ภาครัฐยังมีจุดอ่อนด้านความโปร่งใส วิทยากรต้องมุ่งเน้นอบรมธรรมาภิบาลในหน่วยงานรัฐเป็นลำดับแรก'
  }
};

export const FORMULA_MORAL_CITY_DISCIPLINE_DAG: ChartFormulaData = {
  title: 'ช่องว่างความสอดคล้องวินัยพลเมืองต่อกลไกรัฐ (Discipline Alignment Gap - DAG)',
  badge: 'หัวข้อ 3: วินัยจราจร & ธรรมาภิบาลภาครัฐ',
  formulaLatex: '\\text{DAG} = \\left|\\text{Civic Discipline Score (1-6)} - \\frac{\\text{ITA Indicator 9 Score}}{100} \\times 6\\right|',
  formulaDisplay: 'ช่องว่าง DAG = |คะแนนวินัยประชาชน (1-6) - (คะแนน ITA ตัวชี้วัดที่ 9 ÷ 100 × 6)|',
  objective: 'เปรียบเทียบระดับวินัยของพลเมืองกับระดับความโปร่งใสของหน่วยงานรัฐ เพื่อสร้างความสมดุลและความเชื่อมั่นในเมืองคุณธรรม',
  variables: [
    {
      symbol: 'Civic Discipline Score',
      name: 'คะแนนวินัยของพลเมือง',
      definition: 'คะแนนดัชนีคุณธรรมด้านวินัยรับผิดชอบจากการสำรวจภาคประชาชน',
      sourceDataset: 'Moral Index Survey Data (MDC)'
    },
    {
      symbol: 'ITA Indicator 9 Score',
      name: 'คะแนน ITA ตัวชี้วัดที่ 9',
      definition: 'การเปิดเผยข้อมูลและการให้บริการที่โปร่งใสของ อปท. และส่วนราชการ',
      sourceDataset: 'สำนักงาน ป.ป.ช. (ITA Data Portal)'
    }
  ],
  workedExample: {
    inputs: 'วินัยประชาชน 5.24 คะแนน, ITA ตัวชี้วัด 9 = 62.5 คะแนน (แปลงเป็นฐาน 6 ได้ 3.75)',
    calculation: '|5.24 - 3.75| = 1.49 คะแนน',
    result: 'DAG = 1.49 คะแนน (ช่องว่างระดับสูง)',
    interpretation: 'ประชาชนมีวินัยสูงแต่บริการรัฐยังไม่โปร่งใสเพียงพอ ชี้เป้าให้เมืองคุณธรรมเร่งปฏิรูปการให้บริการภาครัฐ (Smart Open Gov)'
  }
};

export const FORMULA_MORAL_CITY_AGING_SSI: ChartFormulaData = {
  title: 'ดัชนีความยืดหยุ่นทางสังคมในการค้ำจุนผู้สูงอายุ (Social Solidarity Index - SSI)',
  badge: 'หัวข้อ 4: สังคมสูงวัย & ทุนกตัญญูจิตอาสา',
  formulaLatex: '\\text{SSI} = \\frac{(\\text{Gratitude Score} \\times 0.6) + (\\text{Public Mind Score} \\times 0.4)}{\\text{Old-Age Dependency Ratio (\\%)}} \\times 100',
  formulaDisplay: 'ดัชนี SSI = [(คะแนนกตัญญู × 60%) + (คะแนนจิตอาสา × 40%)] ÷ อัตราภาระพึ่งพิงผู้สูงอายุ (%) × 100',
  objective: 'ประเมินขีดความสามารถของชุมชนในการดูแลผู้สูงอายุติดบ้านติดเตียง โดยใช้ทุนทางสังคมและจิตอาสา ลดภาระงบประมาณสาธารณสุข',
  variables: [
    {
      symbol: 'Gratitude Score',
      name: 'คะแนนคุณธรรมด้านกตัญญู',
      definition: 'ความผูกพันและการดูแลเอาใจใส่ผู้มีพระคุณในครอบครัวและชุมชน',
      sourceDataset: 'ดัชนีคุณธรรม 5 มิติ ศูนย์คุณธรรม'
    },
    {
      symbol: 'Public Mind Score',
      name: 'คะแนนคุณธรรมด้านจิตอาสา',
      definition: 'การมีส่วนร่วมในกิจกรรมดูแลผู้เปราะบางและพัฒนาชุมชน',
      sourceDataset: 'ดัชนีคุณธรรม 5 มิติ ศูนย์คุณธรรม'
    },
    {
      symbol: 'Old-Age Dependency Ratio',
      name: 'อัตราส่วนภาระพึ่งพิงผู้สูงวัย',
      definition: 'สัดส่วนประชากรอายุ 60 ปีขึ้นไป เทียบกับประชากรวัยแรงงาน (15-59 ปี)',
      sourceDataset: 'สำนักงานสถิติแห่งชาติ / กรมการปกครอง'
    }
  ],
  workedExample: {
    inputs: 'คะแนนกตัญญู 5.40, จิตอาสา 5.10, อัตราพึ่งพิงผู้สูงอายุ 28.5%',
    calculation: '[(5.40 × 0.6) + (5.10 × 0.4)] ÷ 28.5 × 100 = (3.24 + 2.04) ÷ 28.5 × 100 = 5.28 ÷ 28.5 × 100 = 18.53',
    result: 'SSI = 18.53 (เกณฑ์เข้มแข็ง > 15.0)',
    interpretation: 'ชุมชนมีสายใยความกตัญญูและอาสาสมัครบริบาลท้องถิ่นหนาแน่น สามารถรองรับสังคมสูงวัยได้อย่างยั่งยืน'
  }
};

export const FORMULA_MORAL_CITY_YOUTH_YTRI: ChartFormulaData = {
  title: 'ดัชนีความเสี่ยงการเปลี่ยนผ่านของเยาวชน (Youth Transition Risk Index - YTRI)',
  badge: 'หัวข้อ 5: เยาวชน & ทุนชีวิต 4 มิติ',
  formulaLatex: '\\text{YTRI} = \\frac{\\text{Youth Unemployment Rate (\\%)} \\times (6 - \\text{Wisdom Capital})}{\\text{Identity Capital Score}}',
  formulaDisplay: 'ดัชนี YTRI = [อัตราว่างงานเยาวชน (%) × (6 - คะแนนพลังปัญญา)] ÷ คะแนนพลังตัวตน',
  objective: 'ตรวจจับสัญญาณความเสี่ยงของเยาวชนที่จะกลายเป็นกลุ่ม NEETs (ไม่ได้เรียนและไม่ได้ทำงาน) เพื่อจัดกิจกรรมพัฒนาทักษะชีวิต',
  variables: [
    {
      symbol: 'Youth Unemployment Rate',
      name: 'อัตราการว่างงานของเยาวชน',
      definition: 'สัดส่วนเยาวชนอายุ 15-24 ปีที่ไม่มีงานทำและไม่ได้อยู่ในระบบการศึกษา',
      sourceDataset: 'สำนักงานสถิติแห่งชาติ'
    },
    {
      symbol: 'Wisdom Capital',
      name: 'ทุนชีวิต: พลังสร้างปัญญา',
      definition: 'ทักษะการคิดวิเคราะห์ คุณธรรม และการใฝ่เรียนรู้ (เต็ม 5.00)',
      sourceDataset: 'ดัชนีทุนชีวิต ศูนย์คุณธรรม'
    },
    {
      symbol: 'Identity Capital',
      name: 'ทุนชีวิต: พลังตัวตน',
      definition: 'ความภาคภูมิใจในตนเอง ความมุ่งมั่น และเป้าหมายในชีวิต (เต็ม 5.00)',
      sourceDataset: 'ดัชนีทุนชีวิต ศูนย์คุณธรรม'
    }
  ],
  workedExample: {
    inputs: 'อัตราว่างงานเยาวชน 8.4%, พลังสร้างปัญญา 4.20/6, พลังตัวตน 4.50/6',
    calculation: '[8.4 × (6 - 4.20)] ÷ 4.50 = [8.4 × 1.80] ÷ 4.50 = 15.12 ÷ 4.50 = 3.36',
    result: 'YTRI = 3.36 (ระดับความเสี่ยงปานกลาง)',
    interpretation: 'เยาวชนมีเป้าหมายชีวิตดี แต่ขาดโอกาสเสริมทักษะความรู้สมัยใหม่ ควรเพิ่มแหล่งเรียนรู้และคูปองทักษะอาชีพ'
  }
};
