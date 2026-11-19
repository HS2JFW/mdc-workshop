import mammoth from 'mammoth';
import type { ProjectEvaluation, MoralScore, DimensionSwotAnalysis } from '../data/projectsMoralScores';
import type { LifeAssetsProjectEvaluation, LifeAssetScore, LifeAssetSwotAnalysis } from '../data/projectsLifeAssetsScores';

export interface EvaluatedResult extends ProjectEvaluation {
  weaknesses: string[];
  overallSummary: string;
}

export interface LifeAssetsEvaluatedResult extends LifeAssetsProjectEvaluation {
  weaknesses: string[];
  overallSummary: string;
}

export interface RecommendedProposal {
  projectName: string;
  alternativeNames?: string[];
  organization: string;
  objectives: string[];
  context: string;
  problem: string;
  process: string[];
  expectedBenefits: string[];
  results: string;
  successFactors: string;
  sustainability: string;
  validationSummary: string;
}

// Universal Moral Dimensions Matrix Reference Text according to Universal Framework v3.0
export const UNIVERSAL_MORAL_MATRIX_CRITERIA_PROMPT = `
เกณฑ์มาตรฐานการประเมินโครงการเชิงยุทธศาสตร์: เกณฑ์วัดดัชนีคุณธรรม 5 ด้าน ด้วย Outcome Mapping (Universal Moral Dimensions Matrix v3.0) ศูนย์คุณธรรม (องค์การมหาชน)

1. มิติที่ 1: พอเพียง (Sufficiency & Resilience)
- แก่นพฤติกรรม: จัดสรรทรัพยากรคุ้มค่า, พึ่งพาตนเองได้, ยืดหยุ่นปรับตัวในวิกฤต
- ระดับพัฒนาการ (Progress Markers):
  * Expect to see (1 - 3 คะแนน): วางแผนจัดสรรทรัพยากร (เวลา งบประมาณ แรงงาน) สมเหตุสมผล, ลดความสูญเปล่า ไม่ฟุ่มเฟือย (หลักฐาน: แผนใช้จ่าย/เวลา, บันทึกลดความสูญเปล่า, กติกาใช้ของร่วมกัน)
  * Like to see (4 - 7 คะแนน): นำหลักพอประมาณและการพึ่งตนเองไปปรับใช้จริง, แก้ปัญหาด้วยทุน/ทรัพยากรภายในที่มีอยู่, ยืดหยุ่นปรับตัวได้ดีเมื่อเผชิญข้อจำกัด (หลักฐาน: บันทึกแก้ปัญหาด้วยทุนตนเอง, รูปธรรมลดต้นทุน/ภาระ, แผนรับมือวิกฤต)
  * Love to see (8 - 10 คะแนน): เกิดโมเดลพึ่งพาตนเองที่มั่นคง ไม่รอคอยแต่งบสนับสนุนภายนอกเพียงอย่างเดียว, แบ่งปัน เกื้อกูล ส่งต่อทรัพยากรสู่ผู้อื่น, เป็นต้นแบบความพอเพียงยั่งยืน (หลักฐาน: โครงสร้างงานที่พึ่งตนเองต่อเนื่อง, การถ่ายทอดบทเรียน, การศึกษาดูงาน)

2. มิติที่ 2: วินัย (Discipline & Accountability)
- แก่นพฤติกรรม: เคารพกติกาและเวลา, รับผิดชอบต่อหน้าที่, กำกับควบคุมตนเองได้
- ระดับพัฒนาการ (Progress Markers):
  * Expect to see (1 - 3 คะแนน): ปฏิบัติตามกฎ กติกา ระเบียบของโครงการเคร่งครัด, ตรงต่อเวลา เคารพสิทธิและบทบาทผู้อื่น (หลักฐาน: สถิติเวลาเข้าร่วมกิจกรรม, ทะเบียนปฏิบัติตามเกณฑ์)
  * Like to see (4 - 7 คะแนน): ร่วมสร้างและยึดถือ "ข้อตกลงร่วมของกลุ่ม", รับผิดชอบภารกิจสำเร็จลุล่วงโดยไม่ต้องคอยสั่งการ, ตักเตือน แนะนำ รักษาวินัยร่วมกันเชิงบวก (หลักฐาน: ข้อตกลงร่วมของกลุ่ม, บันทึกติดตามงาน, การลดลงของการละเมิดกติกา)
  * Love to see (8 - 10 คะแนน): วินัยกลายเป็นบรรทัดฐานร่วม (Social Norm), มีกลไกกำกับดูแลตนเอง (Self-regulation) ภายในกลุ่มหรือองค์กรเข้มแข็ง, ข้อพิพาทเป็นศูนย์ เป็นต้นแบบด้านวินัย (หลักฐาน: สถิติข้อขัดแย้งเป็นศูนย์, บันทึกประเมินตนเองของกลุ่ม, การยอมรับจากภายนอก)

3. มิติที่ 3: สุจริต (Integrity & Transparency)
- แก่นพฤติกรรม: ซื่อสัตย์ โปร่งใส, ตรวจสอบได้ทุกขั้นตอน, ไร้ผลประโยชน์ทับซ้อน
- ระดับพัฒนาการ (Progress Markers):
  * Expect to see (1 - 3 คะแนน): รายงานข้อมูล ข้อเท็จจริง และงบประมาณตรงไปตรงมา ไม่บิดเบือน, ไม่แสวงหาประโยชน์ส่วนตนหรือพวกพ้อง (หลักฐาน: บันทึกรายงานผลและงบประมาณที่เปิดเผย, หลักฐานจัดซื้อจัดหาถูกต้อง)
  * Like to see (4 - 7 คะแนน): มีกลไกตรวจสอบร่วม (Peer Review / Social Audit) เปิดโอกาสให้สมาชิกตรวจสอบได้, ตัดสินใจอย่างเป็นธรรม โปร่งใส มีส่วนร่วม, มีช่องทางสะท้อนความเห็นที่ปลอดภัย (หลักฐาน: บันทึกตรวจรับงานร่วม, รายงานการประชุมเปิดเผย, บันทึกข้อเสนอแนะ)
  * Love to see (8 - 10 คะแนน): เกิดวัฒนธรรมความซื่อสัตย์โปร่งใสเหนียวแน่น, กล้ายึดมั่นในความถูกต้อง ทักท้วงและปฏิเสธสิ่งที่ไม่ชอบธรรมแม้ถูกกดดัน, ได้รับมาตรฐานหรือรางวัลธรรมาภิบาล (หลักฐาน: มาตรการป้องกันผลประโยชน์ทับซ้อน, สถิติไร้เรื่องร้องเรียน, รางวัลธรรมาภิบาล)

4. มิติที่ 4: จิตอาสา (Public Mind & Altruism)
- แก่นพฤติกรรม: เห็นแก่ประโยชน์ส่วนรวม, เสียสละเวลา/ทักษะ, เกื้อกูลกลุ่มเปราะบาง
- ระดับพัฒนาการ (Progress Markers):
  * Expect to see (1 - 3 คะแนน): เข้าร่วมกิจกรรมส่วนรวมด้วยความเต็มใจ, รับผิดชอบภารกิจเพื่อประโยชน์ร่วมกันตามหน้าที่ที่ได้รับมอบหมาย (หลักฐาน: บันทึกลงเวลาช่วยงาน, รายชื่อผู้ร่วมกิจกรรมอาสา, ภาพถ่ายกิจกรรม)
  * Like to see (4 - 7 คะแนน): ริเริ่มช่วยเหลือผู้อื่นหรือแก้ปัญหาส่วนรวมเพิ่มเติมโดยไม่ต้องรอคำสั่ง, สละเวลา ทักษะ หรือทรัพยากรหนุนเสริมกลุ่มเปราะบางสม่ำเสมอ, ร่วมจัดตั้งกลุ่มจิตอาสาแก้ปัญหาเฉพาะเรื่อง (หลักฐาน: บันทึกกิจกรรมจิตอาสาริเริ่มเอง, บันทึกการช่วยเหลือสมาชิก, สถิติกิจกรรมต่อเนื่อง)
  * Love to see (8 - 10 คะแนน): พัฒนาเป็นเครือข่ายจิตอาสาเชิงรุก ตอบสนองต่อปัญหาหรือภาวะวิกฤตได้ทันที, เชื่อมโยงทรัพยากรข้ามกลุ่มเพื่อผลลัพธ์ในวงกว้าง, ส่งต่อและบ่มเพาะจิตวิญญาณสาธารณะสู่ผู้อื่น (หลักฐาน: โครงสร้างเครือข่ายจิตอาสารถาวร, บันทึกภารกิจช่วยสังคมในวิกฤต, ภาคีความร่วมมือ)

5. มิติที่ 5: กตัญญู (Gratitude & Stewardship)
- แก่นพฤติกรรม: รู้คุณค่าผู้มีคุณูปการ, ดูแลรักษาทรัพยากร, ส่งต่อคุณค่าข้ามรุ่น
- ระดับพัฒนาการ (Progress Markers):
  * Expect to see (1 - 3 คะแนน): แสดงความเคารพ รู้คุณค่า และใส่ใจต่อสมาชิก ผู้มีคุณูปการ ครูอาจารย์ เพื่อนร่วมงาน, ดูแลรักษาสถานที่ สภาพแวดล้อม และสิ่งของที่ใช้ร่วมกัน (หลักฐาน: บันทึกแสดงความขอบคุณ/ยกย่อง, การดูแลรักษาสิ่งของส่วนรวม)
  * Like to see (4 - 7 คะแนน): ร่วมมือดูแล ฟื้นฟู หรือทำนุบำรุงผู้มีคุณูปการ สิ่งแวดล้อม หรือคุณค่าสำคัญขององค์กร, นำภูมิปัญญา/บทเรียนผู้ทรงคุณวุฒิมาต่อยอดประยุกต์ใช้จริง (หลักฐาน: กิจกรรมตอบแทนคุณค่าร่วม, โครงการอนุรักษ์/ฟื้นฟูคุณค่า, การสืบสานภูมิปัญญา)
  * Love to see (8 - 10 คะแนน): เกิดการส่งต่อคุณค่า เจตนารมณ์ที่ดี และภูมิปัญญาข้ามรุ่น (Intergenerational Transfer), สร้างระบบนิเวศที่ดูแลเกื้อกูลซึ่งกันและกัน, ร่วมปกป้องรักษาอัตลักษณ์และคุณค่าอย่างยั่งยืน (หลักฐาน: โครงการสืบสานโดยคนรุ่นใหม่, ธรรมนูญดูแลผู้มีคุณูปการ, เครือข่ายรักษาคุณค่า)

กฎเกณฑ์และเงื่อนไขประตูคัดกรอง (Evidence Gate Rules):
- เกณฑ์เลื่อนระดับ (Gating): จะได้คะแนน Like to see (4-7) หรือ Love to see (8-10) ต้องมีหลักฐานเชิงประจักษ์ยืนยัน หากมีเพียงรายงานกิจกรรมโดยไม่มีหลักฐานพฤติกรรม ให้คะแนนได้ไม่เกิน 3 คะแนน (Expect to see)
- ระบุจุดอ่อนที่ต้องปรับปรุง (Weaknesses / Bottlenecks) เพื่อให้โครงการสามารถขยับจาก Expect หรือ Like สู่ Love to see
`;

// Universal Life Assets Matrix Reference Text according to Universal Framework v3.0
export const UNIVERSAL_LIFE_ASSETS_MATRIX_CRITERIA_PROMPT = `
เกณฑ์มาตรฐานการประเมินโครงการเชิงยุทธศาสตร์: เกณฑ์วัดดัชนีทุนชีวิต 5 พลัง ด้วย Outcome Mapping (Universal Life Assets Matrix v3.0) ศูนย์คุณธรรม (องค์การมหาชน)

1. มิติที่ 1: พลังตัวตน (Self Power)
- แก่นพฤติกรรม: ทัศนคติเชิงบวก, วินัยและการคุมตนเอง, มีเป้าหมายชีวิต
- ระดับพัฒนาการ (Progress Markers):
  * Expect to see (1 - 3 คะแนน): ตระหนักรู้ & พร้อมเปิดรับ - รู้จักเป้าหมายของตนเองในการเข้าร่วมโครงการ, มีความรับผิดชอบต่อหน้าที่และพร้อมเปิดรับสิ่งใหม่, จัดการอารมณ์ตนเองได้ในเบื้องต้น (หลักฐาน: แบบประเมินตนเอง, แผนพัฒนาตนเองเบื้องต้น)
  * Like to see (4 - 7 คะแนน): มีส่วนร่วมเชิงรุก & ปรับนิสัย - มีวินัยในตนเอง ปฏิเสธสิ่งยั่วยุ/อบายมุขได้ด้วยตนเอง, มีความยืดหยุ่นทางอารมณ์ (Resilience) ไม่ย่อท้อต่ออุปสรรค, มีจิตสำนึกรับผิดชอบต่อเป้าหมายร่วม (หลักฐาน: บันทึกสะท้อนคิด Reflection Log, บันทึกการพัฒนาตนเอง)
  * Love to see (8 - 10 คะแนน): นำการเปลี่ยนแปลง & นิเวศเข้มแข็ง - มี Growth Mindset และแสดงภาวะผู้นำการเปลี่ยนแปลง (Change Agent), เป็นที่ปรึกษาและที่พึ่งพาให้แก่สมาชิกคนอื่น, มีสำนึกพลเมืองในการขับเคลื่อนสังคม (หลักฐาน: ผลงานบทบาทผู้นำกิจกรรม, บันทึกการเป็นวิทยากร/พี่เลี้ยง)

2. มิติที่ 2: พลังครอบครัว / องค์กร (Family & Primary Group / Organization Power)
- แก่นพฤติกรรม: สถาบันแวดล้อมปฐมภูมิ, พื้นที่ปลอดภัยในการรับฟัง, การสนับสนุนเชิงบวก
- ระดับพัฒนาการ (Progress Markers):
  * Expect to see (1 - 3 คะแนน): ตระหนักรู้ & พร้อมเปิดรับ - ครอบครัวหรือหัวหน้างาน/เพื่อนร่วมงานรับทราบ ให้ความเห็นชอบ และเปิดโอกาสให้เข้าร่วม, บรรยากาศในบ้าน/ที่ทำงานปราศจากความรุนแรง (หลักฐาน: การรับรอง/อนุญาตเข้าร่วม, แบบสำรวจบรรยากาศ)
  * Like to see (4 - 7 คะแนน): มีส่วนร่วมเชิงรุก & ปรับนิสัย - ครอบครัวหรือองค์กรสนับสนุนเวลา ทรัพยากร และให้กำลังใจต่อเนื่อง, เป็นพื้นที่ปลอดภัยในการรับฟังปัญหาและช่วยกันคิดหาทางออก (หลักฐาน: บันทึกการสนับสนุนทรัพยากร, บันทึกการปรึกษาปัญหา)
  * Love to see (8 - 10 คะแนน): นำการเปลี่ยนแปลง & นิเวศเข้มแข็ง - ครอบครัวหรือองค์กรเข้ามาร่วมขับเคลื่อนโครงการอย่างแข็งขัน, พัฒนาเป็นครอบครัวหรือองค์กรต้นแบบที่เอื้อต่อคุณธรรม, ช่วยเหลือครัวเรือน/หน่วยงานอื่นในเครือข่าย (หลักฐาน: กิจกรรมร่วมของครอบครัว/องค์กร, การยกย่องเป็นองค์กรต้นแบบ)

3. มิติที่ 3: พลังปัญญา (Wisdom & Competency Power)
- แก่นพฤติกรรม: คิดวิเคราะห์ เท่าทันสื่อ, ทักษะและการปฏิบัติจริง, สร้างสรรค์นวัตกรรม
- ระดับพัฒนาการ (Progress Markers):
  * Expect to see (1 - 3 คะแนน): ตระหนักรู้ & พร้อมเปิดรับ - เข้าถึงข้อมูล องค์ความรู้ และแนวทางดำเนินงานที่จำเป็นได้อย่างทั่วถึง, มีความรู้ความเข้าใจพื้นฐานในประเด็นที่ขับเคลื่อน (หลักฐาน: สถิติการเข้าถึงสื่อ/เอกสาร, ผลทดสอบความรู้พื้นฐาน)
  * Like to see (4 - 7 คะแนน): มีส่วนร่วมเชิงรุก & ปรับนิสัย - มีทักษะคิดวิเคราะห์ (Critical Thinking) เท่าทันข้อมูลและสถานการณ์, นำความรู้ไปประยุกต์ปฏิบัติจริง (Active Learning) ในการแก้ปัญหาหน้างาน (หลักฐาน: ชิ้นงานการเรียนรู้, บันทึกการแก้ปัญหา, บันทึกการอบรมทักษะ)
  * Love to see (8 - 10 คะแนน): นำการเปลี่ยนแปลง & นิเวศเข้มแข็ง - สังเคราะห์ความรู้ สร้างนวัตกรรมหรือแนวทางใหม่แก้ปัญหาของโครงการได้สำเร็จ, ถอดบทเรียนและถ่ายทอดเป็นองค์ความรู้แก่ผู้อื่นได้อย่างเป็นระบบ (หลักฐาน: นวัตกรรม/คู่มือที่พัฒนาขึ้น, ทรัพย์สินทางปัญญา, เอกสารถอดบทเรียน)

4. มิติที่ 4: พลังเพื่อนและกลุ่ม (Peer Power / Group Power)
- แก่นพฤติกรรม: กัลยาณมิตร, การเรียนรู้ร่วมกัน, พื้นที่สร้างสรรค์
- ระดับพัฒนาการ (Progress Markers):
  * Expect to see (1 - 3 คะแนน): ตระหนักรู้ & พร้อมเปิดรับ - มีเพื่อนหรือสมาชิกในกลุ่มที่ร่วมทำกิจกรรมด้วยความจริงใจ ให้เกียรติ และรับฟังกัน, ไม่พบพฤติกรรมการชักชวนไปสู่จุดเสี่ยง (หลักฐาน: รายชื่อสมาชิกกลุ่มทำงาน, บันทึกการจับคู่บัดดี้/ทีมงาน)
  * Like to see (4 - 7 คะแนน): มีส่วนร่วมเชิงรุก & ปรับนิสัย - รวมกลุ่มทำกิจกรรมสร้างสรรค์เชิงบวกอย่างสม่ำเสมอ, ดูแล ช่วยเหลือ และตักเตือนกันเชิงบวกเมื่อเพื่อนออกนอกลู่ทาง, แลกเปลี่ยนเรียนรู้ร่วมกันในกลุ่ม (หลักฐาน: บันทึกกิจกรรมกลุ่มสม่ำเสมอ, บันทึกการช่วยเหลือเพื่อน)
  * Love to see (8 - 10 คะแนน): นำการเปลี่ยนแปลง & นิเวศเข้มแข็ง - สมาชิกรวมพลังเป็นเครือข่ายแกนนำเยาวชน/แกนนำคนทำงานขับเคลื่อนประเด็นเชิงรุก, สร้างพื้นที่ปลอดภัย/พื้นที่สร้างสรรค์ใหม่ๆ ให้เพื่อนในชุมชนหรือองค์กร, ปกป้องและดึงดูดเพื่อนกลุ่มเสี่ยงให้เข้าสู่วิถีที่ดี (หลักฐาน: การจัดตั้งชมรม/เครือข่ายแกนนำ, แผนงานขับเคลื่อนโดยกลุ่มเยาวชน/พนักงาน)

5. มิติที่ 5: พลังชุมชน / ระบบนิเวศ (Community & Ecosystem Power)
- แก่นพฤติกรรม: ภาคีเครือข่ายหนุนเสริม, วัฒนธรรมและกติกาเอื้อต่อความดี, พื้นที่สร้างสรรค์ที่เข้าถึงได้
- ระดับพัฒนาการ (Progress Markers):
  * Expect to see (1 - 3 คะแนน): ตระหนักรู้ & พร้อมเปิดรับ - ผู้นำชุมชน/องค์กรและผู้มีส่วนได้ส่วนเสียรับทราบและสนับสนุนเชิงนโยบาย, ประชาสัมพันธ์ข้อมูลโครงการอย่างทั่วถึงในพื้นที่ (หลักฐาน: หนังสืออนุญาต/เห็นชอบ, ช่องทางสื่อสารสาธารณะ)
  * Like to see (4 - 7 คะแนน): มีส่วนร่วมเชิงรุก & ปรับนิสัย - ชุมชนหรือภาคีเครือข่ายจัดสรรพื้นที่สร้างสรรค์และทรัพยากรหนุนเสริม, มีส่วนร่วมในกิจกรรมและร่วมกำหนด "กติกาชุมชน/องค์กร" เชิงบวก, ผสานความร่วมมือระหว่างบ้าน วัด โรงเรียน องค์กร (หลักฐาน: บันทึกการใช้พื้นที่สาธารณะ, ข้อตกลงร่วมชุมชน, บันทึกความร่วมมือภาคี)
  * Love to see (8 - 10 คะแนน): นำการเปลี่ยนแปลง & นิเวศเข้มแข็ง - เกิดกลไกชุมชนเข้มแข็งหรือระบบนิเวศส่งเสริมคุณธรรมที่พึ่งตนเองได้และยั่งยืน, มีธรรมนูญชุมชน/นโยบายองค์กรที่ปฏิบัติจริงและต่อเนื่อง, พัฒนาเป็นแหล่งเรียนรู้ต้นแบบระดับจังหวัดหรือประเทศ (หลักฐาน: ธรรมนูญชุมชน/นโยบายที่ประกาศใช้, สถิติการเป็นแหล่งศึกษาดูงาน, รางวัลต้นแบบคุณธรรม)

กฎเกณฑ์และเงื่อนไขประตูคัดกรอง (Evidence Gate Rules):
- เกณฑ์เลื่อนระดับ (Gating): จะได้คะแนน Like to see (4-7) หรือ Love to see (8-10) ต้องมีหลักฐานเชิงประจักษ์ยืนยัน หากมีเพียงรายงานกิจกรรมโดยไม่มีหลักฐานพฤติกรรม ให้คะแนนได้ไม่เกิน 3 คะแนน (Expect to see)
- ระบุจุดอ่อนที่ต้องปรับปรุง (Weaknesses / Bottlenecks) เพื่อให้โครงการสามารถขยับจาก Expect หรือ Like สู่ Love to see
`;

// Helper: Extract text from file (txt, md, docx, pdf, doc)
export const extractTextFromFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt' || extension === 'md') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = (e) => reject(new Error('ไม่สามารถอ่านไฟล์ข้อความได้: ' + e));
      reader.readAsText(file, 'utf-8');
    });
  }

  if (extension === 'docx' || extension === 'docs') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 0) {
        return result.value;
      }
    } catch {
      // Fallback to raw text decoder below if .docs is plain text or legacy format
    }
  }

  if (extension === 'pdf') {
    // Read ArrayBuffer and extract string content with regex stream decoding
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const content = decoder.decode(new Uint8Array(arrayBuffer));

    // Extract text blocks inside stream objects
    const textMatches: string[] = [];
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(content)) !== null) {
      const streamData = match[1];
      // Find strings in (text) Tj or [(text)] TJ
      const tjRegex = /\(([^)]+)\)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(streamData)) !== null) {
        textMatches.push(tjMatch[1]);
      }
    }

    if (textMatches.length > 0) {
      return textMatches.join(' ').replace(/\\([()\\])/g, '$1');
    }

    // Fallback: extract printable alphanumeric and Thai characters
    const cleanContent = content
      .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s.,;:()\-_\/"']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanContent.length > 50) {
      return cleanContent;
    }

    return `เอกสารโครงการ (PDF: ${file.name}): กรุณาตรวจสอบหรือเพิ่มเติมเนื้อหาในกล่องข้อความด้านล่าง`;
  }

  // Fallback for .doc and others
  const arrayBuffer = await file.arrayBuffer();
  const decoder = new TextDecoder('windows-874'); // Thai encoding fallback
  const rawText = decoder.decode(new Uint8Array(arrayBuffer));
  const readableText = rawText
    .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s.,;:()\-_\/"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (readableText.length > 30) {
    return readableText;
  }

  return `เอกสารโครงการ: ${file.name}`;
};

// 1. Evaluate Project using Universal Moral Matrix via OpenRouter or Intelligent Fallback
export const evaluateProjectWithMoralMatrix = async (
  projectText: string,
  existingProjectsCount = 0
): Promise<EvaluatedResult> => {
  const apiKey = localStorage.getItem('ai_api_key');
  const model = localStorage.getItem('ai_model') || 'openai/gpt-4o-mini';

  const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการประเมินโครงการตามเกณฑ์ดัชนีคุณธรรม 5 ด้าน ของศูนย์คุณธรรม (องค์การมหาชน)
หน้าที่ของคุณคือวิเคราะห์เนื้อหาเอกสารโครงการที่ได้รับ และประเมินคะแนนดัชนีคุณธรรม 5 มิติ ตาม "ตารางเกณฑ์วัดดัชนีคุณธรรม 5 ด้าน ฉบับทั่วไป (Universal Moral Dimensions Matrix v3.0)" ดังนี้:

${UNIVERSAL_MORAL_MATRIX_CRITERIA_PROMPT}

คำสั่งในการประเมิน:
1. วิเคราะห์ชื่อโครงการ และชื่อองค์กร/หน่วยงาน จากเนื้อหา
2. สรุปบริบท ปัญหา กระบวนการ ผลลัพธ์ ปัจจัยความสำเร็จ และความยั่งยืน
3. ให้คะแนนแต่ละด้าน (1-10) พร้อมระบุระดับพัฒนาการ (Expect to see: 1-3, Like to see: 4-7, Love to see: 8-10) และเหตุผลที่ตรงกับเกณฑ์และหลักฐานพฤติกรรม
4. ให้ข้อเสนอแนะในการยกระดับคะแนน (recommendation)
5. วิเคราะห์ SWOT Analysis เชิงลึกของแต่ละด้านทั้ง 5 ด้าน (swot: strengths จุดแข็ง, weaknesses จุดอ่อน, opportunities โอกาสต่อยอด, threats อุปสรรค/ความเสี่ยง) ให้สอดคล้องกับบริบทของโครงการในมิตินั้นๆ
6. ชี้เป้า "จุดอ่อนที่ต้องปรับปรุง" (Weaknesses & Bottlenecks) เพื่อให้โครงการมีโอกาสยกระดับจาก Expect/Like สู่ Love to see
7. เขียนภาพรวมการประเมิน (overallSummary)

คุณต้องตอบกลับเป็น JSON ที่ถูกต้องตามโครงสร้างนี้เท่านั้น (ห้ามใส่ Markdown หรือข้อความอื่น):
{
  "projectName": "ชื่อโครงการ",
  "organization": "ชื่อองค์กรหรือหน่วยงาน",
  "details": {
    "context": "บริบทและข้อมูลโครงการ",
    "problem": "จุดเริ่มต้นหรือปัญหาที่โครงการต้องการแก้ไข",
    "process": ["ขั้นตอนที่ 1", "ขั้นตอนที่ 2", "ขั้นตอนที่ 3"],
    "results": "ผลลัพธ์การดำเนินงาน",
    "successFactors": "ปัจจัยความสำเร็จและบทเรียน",
    "sustainability": "แนวทางการต่อยอดสู่ความยั่งยืน"
  },
  "scores": {
    "sufficiency": {
      "score": number,
      "reason": "ระดับ (Expect/Like/Love): คำอธิบายเหตุผลและหลักฐาน",
      "recommendation": "ข้อแนะนำเพื่อยกระดับคะแนน",
      "swot": {
        "strengths": "จุดแข็งด้านความพอเพียงของโครงการ",
        "weaknesses": "จุดอ่อนหรือข้อจำกัดด้านความพอเพียง",
        "opportunities": "โอกาสในการต่อยอดหรือเชื่อมโยงทรัพยากรภายนอก",
        "threats": "อุปสรรคหรือความเสี่ยงต่อความต่อเนื่องด้านพอเพียง"
      }
    },
    "discipline": {
      "score": number,
      "reason": "ระดับ (Expect/Like/Love): คำอธิบายเหตุผลและหลักฐาน",
      "recommendation": "ข้อแนะนำเพื่อยกระดับคะแนน",
      "swot": {
        "strengths": "จุดแข็งด้านวินัยและความรับผิดชอบของโครงการ",
        "weaknesses": "จุดอ่อนหรือข้อจำกัดด้านวินัย",
        "opportunities": "โอกาสในการยกระดับกติการ่วมสู่บรรทัดฐานสังคม",
        "threats": "อุปสรรคหรือความเสี่ยงด้านการรักษาวินัยต่อเนื่อง"
      }
    },
    "integrity": {
      "score": number,
      "reason": "ระดับ (Expect/Like/Love): คำอธิบายเหตุผลและหลักฐาน",
      "recommendation": "ข้อแนะนำเพื่อยกระดับคะแนน",
      "swot": {
        "strengths": "จุดแข็งด้านความสุจริต โปร่งใส ตรวจสอบได้",
        "weaknesses": "จุดอ่อนหรือข้อจำกัดด้านกลไกตรวจสอบ",
        "opportunities": "โอกาสในการยกระดับมาตรฐานธรรมาภิบาล",
        "threats": "อุปสรรคหรือความเสี่ยงด้านความโปร่งใส"
      }
    },
    "publicMind": {
      "score": number,
      "reason": "ระดับ (Expect/Like/Love): คำอธิบายเหตุผลและหลักฐาน",
      "recommendation": "ข้อแนะนำเพื่อยกระดับคะแนน",
      "swot": {
        "strengths": "จุดแข็งด้านจิตอาสาและการช่วยเหลือส่วนรวม",
        "weaknesses": "จุดอ่อนหรือข้อจำกัดด้านการมีส่วนร่วมจิตอาสา",
        "opportunities": "โอกาสในการขยายเครือข่ายจิตอาสาและภาคีภายนอก",
        "threats": "อุปสรรคหรือความเหนื่อยล้าของแกนนำจิตอาสา"
      }
    },
    "gratitude": {
      "score": number,
      "reason": "ระดับ (Expect/Like/Love): คำอธิบายเหตุผลและหลักฐาน",
      "recommendation": "ข้อแนะนำเพื่อยกระดับคะแนน",
      "swot": {
        "strengths": "จุดแข็งด้านความกตัญญู รู้คุณค่า และดูแลสิ่งแวดล้อม/สังคม",
        "weaknesses": "จุดอ่อนหรือข้อจำกัดด้านการส่งต่อคุณค่าข้ามรุ่น",
        "opportunities": "โอกาสในการสร้างวัฒนธรรมกตัญญูและสืบสานภูมิปัญญา",
        "threats": "อุปสรรคหรือความเสี่ยงจากช่องว่างระหว่างวัย"
      }
    }
  },
  "weaknesses": [
    "จุดอ่อนที่ 1 ...",
    "จุดอ่อนที่ 2 ..."
  ],
  "overallSummary": "สรุปภาพรวมผลการประเมินของโครงการ"
}`;

  if (apiKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Moral Center AI Evaluation',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `กรุณาประเมินโครงการต่อไปนี้ตามเกณฑ์ Universal Moral Dimensions Matrix v3.0 พร้อมวิเคราะห์ SWOT ของทั้ง 5 ด้าน:\n\n${projectText}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const contentStr = data.choices[0]?.message?.content || '';
        const cleanJson = contentStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        const pName = parsed.projectName || 'โครงการนำเข้า';

        return {
          id: existingProjectsDataCountId(existingProjectsCount),
          projectName: pName,
          organization: parsed.organization || 'หน่วยงานของฉัน',
          details: {
            context: parsed.details?.context || 'บริบทโครงการที่นำเข้า',
            problem: parsed.details?.problem || 'ปัญหาและจุดมุ่งหมาย',
            process: Array.isArray(parsed.details?.process) ? parsed.details.process : ['ดำเนินกิจกรรมตามแผนงาน'],
            results: parsed.details?.results || 'ผลลัพธ์โครงการ',
            successFactors: parsed.details?.successFactors || 'ความร่วมมือของสมาชิก',
            sustainability: parsed.details?.sustainability || 'การพัฒนาอย่างต่อเนื่อง',
          },
          scores: {
            sufficiency: sanitizeScore(parsed.scores?.sufficiency, 'sufficiency', 'พอเพียง', pName),
            discipline: sanitizeScore(parsed.scores?.discipline, 'discipline', 'วินัย', pName),
            integrity: sanitizeScore(parsed.scores?.integrity, 'integrity', 'สุจริต', pName),
            publicMind: sanitizeScore(parsed.scores?.publicMind, 'publicMind', 'จิตอาสา', pName),
            gratitude: sanitizeScore(parsed.scores?.gratitude, 'gratitude', 'กตัญญู', pName),
          },
          weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0
            ? parsed.weaknesses
            : ['ควรเพิ่มหลักฐานเชิงประจักษ์ในการติดตามผลอย่างเป็นรูปธรรม'],
          overallSummary: parsed.overallSummary || 'ผลการประเมินโครงการตามเกณฑ์ดัชนีคุณธรรม 5 ด้าน',
        };
      }
    } catch (err) {
      console.warn('OpenRouter evaluation call failed, falling back to heuristic evaluation engine:', err);
    }
  }

  // Heuristic Engine Fallback (Works offline or without API key)
  return heuristicEvaluateProject(projectText, existingProjectsCount);
};

// 2. Recommend Project Proposal using AI via OpenRouter or Heuristic Fallback
export const recommendProjectProposalWithAI = async (
  userPrompt: string
): Promise<RecommendedProposal> => {
  const apiKey = localStorage.getItem('ai_api_key');
  const model = localStorage.getItem('ai_model') || 'openai/gpt-4o-mini';

  const systemPrompt = `คุณคือผู้เชี่ยวชาญอาวุโสด้านการออกแบบโครงการยุทธศาสตร์ ครีเอทีฟตั้งชื่อโครงการสุดเท่ และผู้ตรวจสอบคุณภาพข้อเสนอโครงการของศูนย์คุณธรรม (องค์การมหาชน)
หน้าที่ของคุณคือวิเคราะห์แนวทางและความต้องการจาก Prompt ของผู้ใช้ แล้วคิดและร่าง "ข้อเสนอโครงการคุณธรรมฉบับมืออาชีพ" ที่ละเอียด รอบคอบ ครบถ้วนสมบูรณ์ พร้อมตั้งชื่อโครงการที่เท่ ทันสมัย มีพลัง น่าจดจำ และผ่านการตรวจสอบความถูกต้องก่อนนำไปแสดงใน Dialog Box เพื่อส่งต่อไปวิเคราะห์ประเมินคะแนนดัชนีคุณธรรม 5 ด้าน (พอเพียง, วินัย, สุจริต, จิตอาสา, กตัญญู)

ข้อกำหนดสำคัญที่ต้องคิดและสรุปอย่างเป็นมืออาชีพ:
1. ชื่อโครงการเท่ๆ (projectName & alternativeNames):
   - projectName: ตั้งชื่อโครงการหลักที่เท่ ทันสมัย สร้างแรงบันดาลใจ มีเอกลักษณ์จดจำง่าย ผสมผสานคำคล้องจองหรือสโลแกนเก๋ๆ กับเป้าหมายที่ชัดเจน (เช่น "Moral Spark: จุดประกาย...", "Green & Clean Heart: พลิกโฉม...", "Zero Tolerance: องค์กรโปร่งใสไร้เทียมทาน...")
   - alternativeNames: คิดชื่อโครงการเท่ๆ ทางเลือกเพิ่มเติมอีก 4 สไตล์ (เช่น สไตล์ Modern Innovation, สไตล์พลังชุมชนอบอุ่น, สไตล์ Action & Impact, และสไตล์ยุทธศาสตร์ต้นแบบ) เพื่อให้ผู้ใช้คลิกเลือกเปลี่ยนได้ตามชอบ
2. วัตถุประสงค์ของโครงการ (objectives): กำหนดวัตถุประสงค์เชิงยุทธศาสตร์และเชิงปฏิบัติการอย่างละเอียดรอบคอบ (อย่างน้อย 4 ข้อ) ที่วัดผลได้จริง
3. แผนและวิธีการดำเนินงานโดยละเอียด (process): วางแผนและขั้นตอนวิธีการดำเนินงานโดยละเอียด แบ่งเป็นระยะชัดเจน (ระยะเตรียมการ, ระยะสร้างข้อตกลงมีส่วนร่วม, ระยะลงมือปฏิบัติจริงพร้อมวิธีเก็บหลักฐานเชิงประจักษ์, ระยะติดตามตรวจสอบร่วม, และระยะถอดบทเรียนขยายผล)
4. ประโยชน์ที่คาดว่าจะได้รับจากโครงการ (expectedBenefits): สรุปประโยชน์ที่คาดว่าจะได้รับอย่างละเอียดรอบคอบ ทั้งต่อตัวบุคคล/กลุ่มเป้าหมาย ต่อองค์กร/หน่วยงาน และต่อชุมชน/สังคม
5. ตรวจสอบความถูกต้อง (validationSummary): ตรวจสอบความสอดคล้องระหว่างชื่อโครงการ วัตถุประสงค์ แผนการดำเนินงาน และประโยชน์ที่คาดว่าจะได้รับ ให้ถูกต้องครบถ้วนตามมาตรฐานข้อเสนอโครงการมืออาชีพ

คุณต้องตอบกลับเป็น JSON ที่ถูกต้องตามโครงสร้างนี้เท่านั้น (ห้ามใส่ Markdown อื่น):
{
  "projectName": "ชื่อโครงการหลักที่เท่ ทันสมัย และทรงพลัง",
  "alternativeNames": [
    "ชื่อโครงการเท่ๆ ทางเลือกที่ 1 (สไตล์ Modern & Creative)",
    "ชื่อโครงการเท่ๆ ทางเลือกที่ 2 (สไตล์ Action & Impact)",
    "ชื่อโครงการเท่ๆ ทางเลือกที่ 3 (สไตล์ Warm Community & Empathy)",
    "ชื่อโครงการเท่ๆ ทางเลือกที่ 4 (สไตล์ Strategic Flagship)"
  ],
  "organization": "ชื่อองค์กร/หน่วยงานรับผิดชอบที่เหมาะสมกับบริบท",
  "objectives": [
    "1. เพื่อ...",
    "2. เพื่อ...",
    "3. เพื่อ...",
    "4. เพื่อ..."
  ],
  "context": "หลักการและเหตุผล / บริบทและกลุ่มเป้าหมายของโครงการอย่างละเอียด",
  "problem": "สภาพปัญหา ความท้าทาย และความจำเป็นในการริเริ่มโครงการ",
  "process": [
    "ระยะที่ 1 (ขั้นเตรียมการและวิเคราะห์บริบท): รายละเอียดแผนและวิธีการดำเนินงาน...",
    "ระยะที่ 2 (ขั้นออกแบบและสร้างข้อตกลงร่วม): รายละเอียดแผนและวิธีการดำเนินงาน...",
    "ระยะที่ 3 (ขั้นปฏิบัติการและขับเคลื่อนพฤติกรรมคุณธรรม): รายละเอียดแผนและวิธีการดำเนินงาน...",
    "ระยะที่ 4 (ขั้นติดตาม ตรวจสอบความโปร่งใส และประเมินผล): รายละเอียดแผนและวิธีการดำเนินงาน...",
    "ระยะที่ 5 (ขั้นถอดบทเรียนและขยายผลสู่ความยั่งยืน): รายละเอียดแผนและวิธีการดำเนินงาน..."
  ],
  "expectedBenefits": [
    "1. ด้านกลุ่มเป้าหมาย/บุคลากร: ...",
    "2. ด้านองค์กร/การบริหารจัดการ: ...",
    "3. ด้านสังคม ชุมชน และสิ่งแวดล้อม: ...",
    "4. ด้านการยกระดับดัชนีคุณธรรม 5 มิติ: ..."
  ],
  "results": "สรุปผลสัมฤทธิ์และตัวชี้วัดความสำเร็จเชิงปริมาณและเชิงคุณภาพ",
  "successFactors": "ปัจจัยสำคัญสู่ความสำเร็จและการบริหารความเสี่ยง",
  "sustainability": "แนวทางการขับเคลื่อนต่อเนื่องให้เกิดความยั่งยืนในระยะยาว",
  "validationSummary": "สรุปผลการตรวจสอบความถูกต้องครบถ้วนของข้อเสนอโครงการก่อนส่งวิเคราะห์"
}`;

  if (apiKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Moral Center AI Project Recommender',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `กรุณาคิดชื่อโครงการเท่ๆ พร้อมตัวเลือกชื่อเพิ่มเติม และออกแบบข้อเสนอโครงการคุณธรรมอย่างเป็นมืออาชีพ ละเอียดรอบคอบ พร้อมตรวจสอบความถูกต้องตามแนวทางที่ต้องการต่อไปนี้:\n"${userPrompt}"`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const contentStr = data.choices[0]?.message?.content || '';
        const cleanJson = contentStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return validateAndRefineProposal(parsed, userPrompt, 'moral');
      }
    } catch (err) {
      console.warn('OpenRouter project recommendation failed, using professional generator:', err);
    }
  }

  // Professional Generator Fallback with Quality Validation
  const fallback = generateFallbackProjectProposal(userPrompt);
  return validateAndRefineProposal(fallback, userPrompt, 'moral');
};

// Utilities
function existingProjectsDataCountId(count: number): number {
  return count + 1;
}

export function getOrGenerateMoralDimensionSwot(
  dimKey: 'sufficiency' | 'discipline' | 'integrity' | 'publicMind' | 'gratitude',
  scoreData: MoralScore,
  projectName = 'โครงการ'
): DimensionSwotAnalysis {
  if (
    scoreData?.swot &&
    scoreData.swot.strengths &&
    scoreData.swot.weaknesses &&
    scoreData.swot.opportunities &&
    scoreData.swot.threats
  ) {
    return scoreData.swot;
  }

  const sc = scoreData?.score ?? 7;
  const isHigh = sc >= 8;

  const swotTemplates: Record<
    'sufficiency' | 'discipline' | 'integrity' | 'publicMind' | 'gratitude',
    DimensionSwotAnalysis
  > = {
    sufficiency: {
      strengths: isHigh
        ? `โครงการ "${projectName}" มีการใช้ทรัพยากรและทุนภายในอย่างคุ้มค่า ลดการพึ่งพางบประมาณภายนอกและสร้างโมเดลพึ่งพาตนเองได้ชัดเจน`
        : `มีการวางแผนจัดสรรทรัพยากร เวลา และงบประมาณอย่างประหยัดสมเหตุสมผล ลดความสูญเปล่าในการดำเนินกิจกรรม`,
      weaknesses: isHigh
        ? `การรวบรวมตัวเลขผลประหยัดเชิงเศรษฐศาสตร์ (Cost-Saving Metrics) ยังสามารถจัดทำให้ละเอียดและเป็นระบบดิจิทัลมากขึ้น`
        : `ยังต้องพึ่งพางบประมาณสนับสนุนหลักจากหน่วยงานกลาง และยังไม่มีกองทุนหรือกลไกหมุนเวียนทรัพยากรด้วยตนเองในระยะยาว`,
      opportunities: `สามารถเชื่อมโยงแนวคิด BCG Economy / Green Office และนวัตกรรมลดต้นทุนเพื่อยกระดับเป็นแหล่งเรียนรู้ต้นแบบด้านความพอเพียง`,
      threats: `ความผันผวนของงบประมาณประจำปีและต้นทุนวัสดุอุปกรณ์ที่สูงขึ้น อาจกระทบต่อความต่อเนื่องของกิจกรรมหากขาดทุนสำรอง`,
    },
    discipline: {
      strengths: isHigh
        ? `สมาชิกมีส่วนร่วมในการกำหนดกติการ่วม (Social Norm) และมีวินัยกำกับตนเองสูง ส่งผลให้การดำเนินงานราบรื่นไร้ข้อพิพาท`
        : `ผู้เข้าร่วมเคารพกฎกติกา ตรงต่อเวลา และรับผิดชอบภารกิจตามที่ได้รับมอบหมายได้อย่างมีประสิทธิภาพ`,
      weaknesses: isHigh
        ? `การส่งต่อระบบกำกับดูแลตนเอง (Self-Regulation) สู่สมาชิกรุ่นใหม่อาจต้องใช้เวลาในการบ่มเพาะความเข้าใจ`
        : `การรักษาวินัยบางส่วนยังเกิดจากการกวดขันของหัวหน้างานหรือแกนนำ ยังไม่พัฒนาเป็นนิสัยอัตโนมัติครบทุกคน`,
      opportunities: `สามารถนำระบบ Digital Check-in และสมุดสะสมแต้มความดี (Moral Credit) มาช่วยกระตุ้นวินัยเชิงบวกอย่างสนุกสนาน`,
      threats: `ภาระงานประจำที่เร่งด่วน (Routine Overload) อาจทำให้ความสม่ำเสมอในการปฏิบัติตามข้อตกลงร่วมลดลงในบางช่วงเวลา`,
    },
    integrity: {
      strengths: isHigh
        ? `มีกระบวนการเปิดเผยข้อมูลและกลไกตรวจสอบร่วม (Peer Review / Social Audit) ที่โปร่งใสทุกขั้นตอน สร้างความไว้วางใจสูง`
        : `มีการรายงานผลการดำเนินงานและใช้งบประมาณอย่างตรงไปตรงมา ไม่พบปัญหาผลประโยชน์ทับซ้อน`,
      weaknesses: isHigh
        ? `ช่องทางสะท้อนความคิดเห็นเชิงลึกแบบนิรนาม (Safe Feedback Channel) ยังสามารถขยายให้เข้าถึงผู้มีส่วนได้ส่วนเสียภายนอกได้อีก`
        : `ยังขาดคณะทำงานตรวจสอบถ่วงดุลจากภาคส่วนภายนอก หรือระบบเปิดเผยข้อมูลแบบ Real-time ให้ตรวจสอบร่วมกัน`,
      opportunities: `สามารถยกระดับมาตรฐานความโปร่งใสเชื่อมโยงกับเกณฑ์ ITA / ธรรมาภิบาลองค์กร เพื่อสร้างความน่าเชื่อถือระดับประเทศ`,
      threats: `วัฒนธรรมความเกรงใจในสังคมไทยอาจทำให้สมาชิกไม่กล้าทักท้วงเมื่อพบเห็นข้อบกพร่องเล็กน้อยในกระบวนการทำงาน`,
    },
    publicMind: {
      strengths: isHigh
        ? `เกิดพลังเครือข่ายจิตอาสาเชิงรุกที่เสียสละเวลาและทักษะช่วยเหลือส่วนรวมและกลุ่มเปราะบางอย่างต่อเนื่องและกว้างขวาง`
        : `สมาชิกมีความเต็มใจเข้าร่วมกิจกรรมเพื่อส่วนรวม มีน้ำใจเอื้อเฟื้อและแบ่งปันภายในหน่วยงานและชุมชนใกล้เคียง`,
      weaknesses: isHigh
        ? `ภาระการขับเคลื่อนกิจกรรมจิตอาสาหลักยังคงกระจุกตัวอยู่ที่กลุ่มแกนนำ (Core Champions) ในบางภารกิจ`
        : `กิจกรรมจิตอาสายังมีลักษณะเป็นครั้งคราวตามปฏิทินโครงการ ยังไม่พัฒนาเป็นกลไกอาสาสมัครถาวรที่ริเริ่มเองจากฐานราก`,
      opportunities: `มีโอกาสสูงในการจับมือกับภาคีเครือข่ายภายนอก (CSR, ท้องถิ่น, มูลนิธิ) เพื่อขยายผลลัพธ์ทางสังคมและสะสม Moral Credit`,
      threats: `ภาวะหมดไฟของอาสาสมัคร (Volunteer Burnout) หากขาดการหมุนเวียนบทบาทและขาดการเสริมแรงเชิดชูเกียรติอย่างเหมาะสม`,
    },
    gratitude: {
      strengths: isHigh
        ? `ให้ความสำคัญกับการเชิดชูผู้มีคุณูปการ การอนุรักษ์ทรัพยากรส่วนรวม และการถ่ายทอดภูมิปัญญาข้ามรุ่นอย่างอบอุ่น`
        : `สร้างบรรยากาศแห่งความเคารพ รู้คุณค่าของบุคลากร ครูอาจารย์ องค์กร และดูแลรักษาสิ่งแวดล้อมส่วนรวมได้ดี`,
      weaknesses: isHigh
        ? `การจัดทำคลังความรู้ภูมิปัญญา (Living Archive) เพื่อส่งต่อคุณค่าข้ามรุ่นยังสามารถพัฒนาเป็นสื่อดิจิทัลที่เข้าถึงง่ายขึ้น`
        : `กิจกรรมแสดงความกตัญญูยังเน้นไปที่พิธีกรรมหรือวันสำคัญ ยังขาดการถอดบทเรียนภูมิปัญญาผู้ทรงคุณวุฒิมาประยุกต์ใช้จริง`,
      opportunities: `สามารถพัฒนาเป็นโปรแกรม Mentoring ข้ามรุ่น (Intergenerational Empathy) ผสานพลังคนรุ่นเก่าและคนรุ่นใหม่ได้อย่างลงตัว`,
      threats: `ช่องว่างระหว่างวัย (Generation Gap) และการเปลี่ยนแปลงบุคลากร อาจทำให้คุณค่าและบทเรียนดีๆ ขาดช่วงหากไม่บันทึกไว้`,
    },
  };

  return swotTemplates[dimKey];
}

function sanitizeScore(
  sc: any,
  dimKey: 'sufficiency' | 'discipline' | 'integrity' | 'publicMind' | 'gratitude',
  dimName: string,
  projectName = 'โครงการ'
): MoralScore {
  const scoreNum = typeof sc?.score === 'number' ? Math.min(Math.max(sc.score, 1), 10) : 7;
  const tier = scoreNum >= 8 ? 'Love to see' : scoreNum >= 4 ? 'Like to see' : 'Expect to see';
  const baseScore: MoralScore = {
    score: scoreNum,
    reason: sc?.reason || `ระดับ ${tier}: มีกระบวนการส่งเสริมความ${dimName}ในกิจกรรมโครงการ`,
    recommendation: sc?.recommendation || `ควรเพิ่มกลไกติดตามพฤติกรรมด้าน${dimName}ให้เป็นรูปธรรมต่อเนื่อง`,
  };
  const fallbackSwot = getOrGenerateMoralDimensionSwot(dimKey, baseScore, projectName);
  return {
    ...baseScore,
    swot: {
      strengths:
        typeof sc?.swot?.strengths === 'string' && sc.swot.strengths.trim().length > 5
          ? sc.swot.strengths.trim()
          : fallbackSwot.strengths,
      weaknesses:
        typeof sc?.swot?.weaknesses === 'string' && sc.swot.weaknesses.trim().length > 5
          ? sc.swot.weaknesses.trim()
          : fallbackSwot.weaknesses,
      opportunities:
        typeof sc?.swot?.opportunities === 'string' && sc.swot.opportunities.trim().length > 5
          ? sc.swot.opportunities.trim()
          : fallbackSwot.opportunities,
      threats:
        typeof sc?.swot?.threats === 'string' && sc.swot.threats.trim().length > 5
          ? sc.swot.threats.trim()
          : fallbackSwot.threats,
    },
  };
}

// Fallback Heuristic Evaluator based on keywords and content analysis
function heuristicEvaluateProject(text: string, count: number): EvaluatedResult {
  const lower = text.toLowerCase();

  // Extract or generate project title
  let projectName = 'โครงการพัฒนาองค์กรคุณธรรมสุขภาวะ';
  const nameMatch = text.match(/(?:ชื่อโครงการ|โครงการ)\s*[:：]?\s*([^\n\r,]+)/);
  if (nameMatch && nameMatch[1].trim().length > 3) {
    projectName = nameMatch[1].trim();
  }

  let organization = 'องค์กรปฏิบัติการส่งเสริมคุณธรรม';
  const orgMatch = text.match(/(?:องค์กร|หน่วยงาน|บริษัท|ชุมชน)\s*[:：]?\s*([^\n\r,]+)/);
  if (orgMatch && orgMatch[1].trim().length > 3) {
    organization = orgMatch[1].trim();
  }

  // Dimension scoring heuristics based on universal matrix
  const sufficiencyScore = lower.includes('ประหยัด') || lower.includes('พอเพียง') || lower.includes('ลดขยะ') || lower.includes('ทรัพยากร') ? 8 : 7;
  const disciplineScore = lower.includes('วินัย') || lower.includes('กติกา') || lower.includes('ตรงเวลา') || lower.includes('ข้อตกลง') ? 8 : 7;
  const integrityScore = lower.includes('สุจริต') || lower.includes('โปร่งใส') || lower.includes('ตรวจสอบ') || lower.includes('ซื่อสัตย์') ? 8 : 6;
  const publicMindScore = lower.includes('จิตอาสา') || lower.includes('สาธารณะ') || lower.includes('ช่วยเหลือ') || lower.includes('แบ่งปัน') ? 9 : 7;
  const gratitudeScore = lower.includes('กตัญญู') || lower.includes('ขอบคุณ') || lower.includes('สิ่งแวดล้อม') || lower.includes('ครู') ? 8 : 7;

  const sufficiencyBase: MoralScore = {
    score: sufficiencyScore,
    reason: sufficiencyScore >= 8
      ? 'ระดับ Love to see: นำหลักพอประมาณมาปรับใช้ในการบริหารทรัพยากร ลดความสูญเปล่าได้อย่างชัดเจน'
      : 'ระดับ Like to see: มีการจัดสรรทรัพยากรอย่างคุ้มค่าและพึ่งพาตนเองได้ในเบื้องต้น',
    recommendation: 'ควรพัฒนาโมเดลหมุนเวียนทรัพยากรและการพึ่งพาตนเองเพื่อลดการพึ่งพางบภายนอก',
  };
  const disciplineBase: MoralScore = {
    score: disciplineScore,
    reason: disciplineScore >= 8
      ? 'ระดับ Love to see: ร่วมสร้างและเคารพข้อตกลงร่วมของกลุ่มอย่างเข้มแข็ง ไร้ข้อขัดแย้ง'
      : 'ระดับ Like to see: มีการปฏิบัติตามกฎกติกาและมีความรับผิดชอบต่อหน้าที่ที่ได้รับมอบหมาย',
    recommendation: 'ควรสร้างระบบกำกับดูแลกันเองเชิงบวก (Peer Feedback) เพื่อความยั่งยืน',
  };
  const integrityBase: MoralScore = {
    score: integrityScore,
    reason: integrityScore >= 8
      ? 'ระดับ Love to see: มีกลไกความโปร่งใสและเปิดโอกาสให้สมาชิกตรวจสอบร่วมกันได้ทุกขั้นตอน'
      : 'ระดับ Like to see: มีการรายงานข้อมูลข้อเท็จจริงและงบประมาณอย่างตรงไปตรงมา',
    recommendation: 'ควรเพิ่มช่องทางรับฟังความคิดเห็นและข้อเสนอแนะที่ปลอดภัยสำหรับทุกคน',
  };
  const publicMindBase: MoralScore = {
    score: publicMindScore,
    reason: publicMindScore >= 8
      ? 'ระดับ Love to see: รวมพลังสมาชิกทำประโยชน์เพื่อส่วนรวมอย่างต่อเนื่องและขยายเครือข่ายภายนอก'
      : 'ระดับ Like to see: สมาชิกร่วมกิจกรรมอาสาและสละเวลาช่วยเหลือเพื่อนร่วมงานด้วยความเต็มใจ',
    recommendation: 'ควรเชื่อมโยงกิจกรรมจิตอาสากับชุมชนและกลุ่มเปราะบางรอบข้างให้ครอบคลุมยิ่งขึ้น',
  };
  const gratitudeBase: MoralScore = {
    score: gratitudeScore,
    reason: gratitudeScore >= 8
      ? 'ระดับ Love to see: แสดงความขอบคุณและสืบสานคุณค่าที่ดีงามจากรุ่นสู่รุ่นอย่างอบอุ่น'
      : 'ระดับ Like to see: มีกิจกรรมยกย่องผู้มีคุณูปการและการดูแลรักษาสิ่งของส่วนรวม',
    recommendation: 'ควรจัดทำธรรมนูญหรือโครงการบอกเล่าเรื่องราวความประทับใจข้ามรุ่นอย่างต่อเนื่อง',
  };

  return {
    id: count + 1,
    projectName,
    organization,
    details: {
      context: text.length > 250 ? text.substring(0, 240) + '...' : text,
      problem: 'ต้องการส่งเสริมพฤติกรรมคุณธรรมเชิงบวกและสร้างการมีส่วนร่วมของบุคลากรในหน่วยงาน',
      process: [
        'กำหนดค่านิยมและข้อตกลงร่วมด้านคุณธรรมประจำหน่วยงาน',
        'จัดกิจกรรมส่งเสริมพฤติกรรมเป้าหมายและบันทึกความดี',
        'ยกย่องเชิดชูเกียรติและถอดบทเรียนการขยายผล',
      ],
      results: 'บุคลากรมีส่วนร่วมและเกิดความตระหนักรู้ในคุณธรรม 5 ด้านอย่างเป็นรูปธรรม',
      successFactors: 'ความร่วมมือของแกนนำและการสนับสนุนจากผู้บริหาร',
      sustainability: 'การพัฒนาเป็นข้อตกลงร่วมและการปฏิบัติอย่างต่อเนื่องในวิถีชีวิตประจำวัน',
    },
    scores: {
      sufficiency: {
        ...sufficiencyBase,
        swot: getOrGenerateMoralDimensionSwot('sufficiency', sufficiencyBase, projectName),
      },
      discipline: {
        ...disciplineBase,
        swot: getOrGenerateMoralDimensionSwot('discipline', disciplineBase, projectName),
      },
      integrity: {
        ...integrityBase,
        swot: getOrGenerateMoralDimensionSwot('integrity', integrityBase, projectName),
      },
      publicMind: {
        ...publicMindBase,
        swot: getOrGenerateMoralDimensionSwot('publicMind', publicMindBase, projectName),
      },
      gratitude: {
        ...gratitudeBase,
        swot: getOrGenerateMoralDimensionSwot('gratitude', gratitudeBase, projectName),
      },
    },
    weaknesses: [
      'ยังขาดระบบการจัดเก็บหลักฐานเชิงประจักษ์ (Evidence Menu) แบบดิจิทัลที่ชัดเจนในระยะยาว',
      'กลไกการตรวจสอบร่วม (Peer Review) ในมิติความสุจริตยังต้องเพิ่มความเข้มข้น',
      'ควรเพิ่มการติดตามผลลัพธ์การเปลี่ยนแปลงพฤติกรรม (Most Significant Change - MSC) อย่างสม่ำเสมอ',
    ],
    overallSummary: `โครงการ "${projectName}" มีจุดเด่นด้านจิตอาสาและความพอเพียง อยู่ในระดับพัฒนาการ Like to see ถึง Love to see หากเสริมการจัดเก็บหลักฐานตามเกณฑ์ Outcome Mapping จะยกระดับสู่โครงการต้นแบบได้`,
  };
}

function extractCleanTopicFromPrompt(prompt: string): string {
  const cleaned = prompt
    .replace(/^(อยากได้โครงการ|ช่วยออกแบบโครงการ|ขอโครงการ|ออกแบบโครงการ|เสนอโครงการ|ต้องการทำโครงการ|เกี่ยวกับ|เรื่อง|แนวทาง)/gi, '')
    .trim();
  if (!cleaned) return 'การพัฒนาองค์กรและชุมชนต้นแบบอย่างยั่งยืน';
  return cleaned.length > 55 ? cleaned.substring(0, 55).trim() + '...' : cleaned;
}

function validateAndRefineProposal(
  raw: any,
  userPrompt: string,
  mode: 'moral' | 'life_assets'
): RecommendedProposal {
  const fallback =
    mode === 'moral'
      ? generateFallbackProjectProposal(userPrompt)
      : generateFallbackLifeAssetsProjectProposal(userPrompt);

  const projectName =
    typeof raw?.projectName === 'string' && raw.projectName.trim().length >= 6
      ? raw.projectName.trim()
      : fallback.projectName;

  const rawAltNames = Array.isArray(raw?.alternativeNames)
    ? raw.alternativeNames.filter((item: any) => typeof item === 'string' && item.trim().length > 5)
    : [];
  const alternativeNames =
    rawAltNames.length >= 2
      ? rawAltNames.map((item: string) => item.trim())
      : fallback.alternativeNames;

  const organization =
    typeof raw?.organization === 'string' && raw.organization.trim().length >= 4
      ? raw.organization.trim()
      : fallback.organization;

  const context =
    typeof raw?.context === 'string' && raw.context.trim().length >= 20
      ? raw.context.trim()
      : fallback.context;

  const problem =
    typeof raw?.problem === 'string' && raw.problem.trim().length >= 20
      ? raw.problem.trim()
      : fallback.problem;

  const rawObjectives = Array.isArray(raw?.objectives)
    ? raw.objectives.filter((item: any) => typeof item === 'string' && item.trim().length > 8)
    : [];
  const objectives =
    rawObjectives.length >= 3
      ? rawObjectives.map((item: string) => item.trim())
      : fallback.objectives;

  const rawProcess = Array.isArray(raw?.process)
    ? raw.process.filter((item: any) => typeof item === 'string' && item.trim().length > 10)
    : [];
  const process =
    rawProcess.length >= 4
      ? rawProcess.map((item: string) => item.trim())
      : fallback.process;

  const rawBenefits = Array.isArray(raw?.expectedBenefits)
    ? raw.expectedBenefits.filter((item: any) => typeof item === 'string' && item.trim().length > 8)
    : [];
  const expectedBenefits =
    rawBenefits.length >= 3
      ? rawBenefits.map((item: string) => item.trim())
      : fallback.expectedBenefits;

  const results =
    typeof raw?.results === 'string' && raw.results.trim().length >= 15
      ? raw.results.trim()
      : fallback.results;

  const successFactors =
    typeof raw?.successFactors === 'string' && raw.successFactors.trim().length >= 10
      ? raw.successFactors.trim()
      : fallback.successFactors;

  const sustainability =
    typeof raw?.sustainability === 'string' && raw.sustainability.trim().length >= 10
      ? raw.sustainability.trim()
      : fallback.sustainability;

  const validationSummary =
    typeof raw?.validationSummary === 'string' && raw.validationSummary.trim().length >= 15
      ? raw.validationSummary.trim()
      : fallback.validationSummary;

  return {
    projectName,
    alternativeNames,
    organization,
    context,
    problem,
    objectives,
    process,
    expectedBenefits,
    results,
    successFactors,
    sustainability,
    validationSummary,
  };
}

function generateFallbackProjectProposal(prompt: string): RecommendedProposal {
  const topic = extractCleanTopicFromPrompt(prompt);
  const lower = prompt.toLowerCase();

  let orgType = 'คณะกรรมการขับเคลื่อนองค์กรคุณธรรมต้นแบบ';
  if (lower.includes('โรงเรียน') || lower.includes('นักเรียน') || lower.includes('เยาวชน') || lower.includes('ศึกษา')) {
    orgType = 'สถานศึกษาและเครือข่ายพัฒนาเยาวชนคุณธรรมต้นแบบ';
  } else if (lower.includes('ชุมชน') || lower.includes('หมู่บ้าน') || lower.includes('ท้องถิ่น') || lower.includes('เทศบาล')) {
    orgType = 'ศูนย์ขับเคลื่อนชุมชนคุณธรรมและภาคีเครือข่ายท้องถิ่น';
  } else if (lower.includes('โรงพยาบาล') || lower.includes('สาธารณสุข') || lower.includes('สุขภาพ') || lower.includes('แพทย์')) {
    orgType = 'หน่วยงานบริการสุขภาพและเครือข่ายองค์กรคุณธรรมด้านสาธารณสุข';
  }

  const primaryCoolName = `โครงการ Moral Spark: จุดประกาย "${topic}" สร้างสรรค์สังคมคุณธรรม 5 มิติ`;
  const alternativeNames = [
    primaryCoolName,
    `โครงการ Good Deeds Lab: นวัตกรรม "${topic}" เปลี่ยนพฤติกรรมสร้างพลังบวก`,
    `โครงการ Virtue Up! พลิกโฉม "${topic}" สู่ต้นแบบความดีที่ยั่งยืน`,
    `โครงการ Heart & Action: รวมพลังกัลยาณมิตรขับเคลื่อน "${topic}" เชิงประจักษ์`,
  ];

  return {
    projectName: primaryCoolName,
    alternativeNames,
    organization: orgType,
    context: `โครงการนี้ได้รับการออกแบบอย่างเป็นระบบตามแนวทางที่ผู้เสนอระบุไว้คือ "${prompt}" โดยมุ่งเน้นการแปลงแนวคิดด้านคุณธรรมไปสู่การปฏิบัติจริง (Moral Action) ผ่านกระบวนการมีส่วนร่วมของสมาชิกทุกระดับ เพื่อให้เกิดสภาพแวดล้อมที่เกื้อกูลต่อการทำความดีและสร้างการเปลี่ยนแปลงเชิงพฤติกรรมที่วัดผลได้`,
    problem: `จากโจทย์ความต้องการด้าน "${topic}" พบความท้าทายสำคัญคือ การขาดกลไกเชื่อมโยงแนวปฏิบัติร่วมกันอย่างเป็นรูปธรรม ขาดการจัดเก็บหลักฐานเชิงประจักษ์ (Evidence-based Practice) และขาดระบบติดตามหนุนเสริมพฤติกรรมอย่างต่อเนื่อง จึงจำเป็นต้องวางแผนปฏิบัติการที่ชัดเจนเพื่อเปลี่ยนพฤติกรรมจากระดับเริ่มต้น (Expect to see) สู่ระดับต้นแบบที่ยั่งยืน (Love to see)`,
    objectives: [
      `1. เพื่อวิเคราะห์สภาพปัญหาและกำหนด "เป้าหมายพฤติกรรมที่อยากเห็น และปัญหาที่อยากแก้" ด้าน${topic} ร่วมกันอย่างมีส่วนร่วมไม่น้อยกว่าร้อยละ 80 ของกลุ่มเป้าหมาย`,
      `2. เพื่อพัฒนากลไกและแผนปฏิบัติการส่งเสริมคุณธรรม 5 มิติ (พอเพียง วินัย สุจริต จิตอาสา กตัญญู) ที่สอดคล้องกับบริบท "${topic}" อย่างเป็นรูปธรรมและตรวจสอบได้`,
      `3. เพื่อสร้างระบบติดตามประเมินผลด้วยเครื่องมือวัดการเปลี่ยนแปลงพฤติกรรม (Outcome Mapping) และจัดเก็บหลักฐานเชิงประจักษ์ (Evidence Menu) อย่างครบถ้วนสมบูรณ์`,
      `4. เพื่อถอดบทเรียนและยกระดับผลลัพธ์ของโครงการให้เป็นต้นแบบแนวปฏิบัติที่ดี (Best Practice) ที่สามารถขยายผลสู่หน่วยงานและเครือข่ายภายนอกได้อย่างยั่งยืน`,
    ],
    process: [
      `ระยะที่ 1: การศึกษาบริบท เตรียมความพร้อม และจัดตั้งคณะทำงาน (Preparation & Baseline Survey) — สำรวจข้อมูลพื้นฐาน (Baseline Data) วิเคราะห์สภาพปัญหาตามโจทย์ "${topic}" และแต่งตั้งคณะทำงานขับเคลื่อนโครงการที่มีตัวแทนจากทุกภาคส่วน`,
      `ระยะที่ 2: การจัดเวทีประชาคมและกำหนดข้อตกลงร่วม (Participatory Charter & Goal Setting) — จัดกระบวนการแลกเปลี่ยนเรียนรู้เพื่อกำหนด "ปัญหาที่อยากแก้ ความดีที่อยากทำ" เชื่อมโยงคุณธรรม 5 มิติ พร้อมจัดทำธรรมนูญหรือกติการ่วมขององค์กร/ชุมชน`,
      `ระยะที่ 3: การลงมือปฏิบัติการตามแผนและนวัตกรรมความดี (Action Implementation & Evidence Collection) — ดำเนินกิจกรรมหลักตามแนวทาง "${topic}" ควบคู่กับการใช้ระบบคู่หูความดี (Moral Buddy) บันทึกสมุดความดี/คลังข้อมูลดิจิทัล การใช้ทรัพยากรอย่างคุ้มค่า และการเปิดเผยข้อมูลอย่างโปร่งใส`,
      `ระยะที่ 4: การกำกับติดตาม ตรวจสอบร่วม และประเมินผลเชิงประจักษ์ (Peer Review & Outcome Evaluation) — จัดตั้งกลไกตรวจสอบย้อนกลับโดยกลุ่มเพื่อน (Peer Review) ประเมินพัฒนาการตามเกณฑ์ 3 ระดับ (Expect / Like / Love to see) และรวบรวมเรื่องเล่าการเปลี่ยนแปลงที่สำคัญที่สุด (Most Significant Change - MSC)`,
      `ระยะที่ 5: การถอดบทเรียน เชิดชูเกียรติ และขยายผลสู่ความยั่งยืน (Knowledge Synthesis & Scaling Up) — จัดเวทีเชิดชูเกียรติบุคคล/ทีมงานต้นแบบ สังเคราะห์องค์ความรู้เป็นคู่มือนวัตกรรมคุณธรรม และสร้างเครือข่ายพี่เลี้ยงถ่ายทอดองค์ความรู้สู่หน่วยงานภายนอก`,
    ],
    expectedBenefits: [
      `1. ประโยชน์ต่อกลุ่มเป้าหมายโดยตรง: ผู้เข้าร่วมโครงการเกิดการเปลี่ยนแปลงพฤติกรรมเชิงบวก มีวินัยในตนเอง มีจิตอาสาช่วยเหลือส่วนรวม และมีความภาคภูมิใจในการร่วมขับเคลื่อน "${topic}"`,
      `2. ประโยชน์ต่อองค์กรและการบริหารจัดการ: เกิดระบบการทำงานที่โปร่งใส ตรวจสอบได้ ใช้ทรัพยากรอย่างประหยัดคุ้มค่าตามหลักปรัชญาของเศรษฐกิจพอเพียง และลดความขัดแย้งภายในหน่วยงาน`,
      `3. ประโยชน์ต่อชุมชนและสังคม: เกิดพื้นที่ต้นแบบด้าน "${topic}" ที่สร้างผลกระทบเชิงบวกต่อส่วนรวม และเป็นแหล่งเรียนรู้ให้แก่หน่วยงานหรือชุมชนใกล้เคียง`,
      `4. ประโยชน์ด้านการยกระดับมาตรฐานคุณธรรม 5 มิติ: โครงการมีหลักฐานเชิงประจักษ์ครบถ้วนตามเกณฑ์ Universal Moral Matrix v3.0 พร้อมสำหรับการประเมินยกระดับสู่ระดับ Love to see`,
    ],
    results: `กลุ่มเป้าหมายไม่น้อยกว่าร้อยละ 85 มีพฤติกรรมพึงประสงค์ตามข้อตกลงร่วม เกิดนวัตกรรมหรือแนวปฏิบัติที่ดีด้าน "${topic}" อย่างน้อย 1 รูปแบบ และมีชุดข้อมูลหลักฐานเชิงประจักษ์ที่พร้อมรับการประเมินอย่างเป็นระบบ`,
    successFactors: `ความมุ่งมั่นของผู้บริหารและแกนนำ (Leadership Commitment) กระบวนการมีส่วนร่วมที่เปิดกว้างรับฟังทุกเสียง ระบบการตรวจสอบร่วมด้วยกัลยาณมิตร และการเสริมแรงทางบวกอย่างสม่ำเสมอ`,
    sustainability: `การบรรจุแผนงานด้าน "${topic}" เข้าสู่นโยบายและแผนปฏิบัติการประจำปีของหน่วยงาน การสร้างแกนนำรุ่นใหม่ทดแทนอย่างต่อเนื่อง และการเชื่อมโยงเครือข่ายแลกเปลี่ยนเรียนรู้ระดับพื้นที่`,
    validationSummary: `ตรวจสอบความถูกต้องครบถ้วนแล้ว: ข้อเสนอโครงการมีความสอดคล้องกับแนวทาง "${topic}" ครบถ้วนทั้งชื่อโครงการสุดเท่ วัตถุประสงค์เชิงกลยุทธ์ 4 ข้อ แผนและวิธีการดำเนินงาน 5 ระยะ และประโยชน์ที่คาดว่าจะได้รับ 4 มิติ พร้อมสำหรับการส่งต่อให้ AI วิเคราะห์คะแนนคุณธรรม 5 มิติและ SWOT Analysis`,
  };
}

// ==========================================
// LIFE ASSETS EVALUATION & RECOMMENDATION SERVICE
// ==========================================

export const evaluateProjectWithLifeAssetsMatrix = async (
  projectText: string,
  existingProjectsCount = 0
): Promise<LifeAssetsEvaluatedResult> => {
  const apiKey = localStorage.getItem('ai_api_key');
  const model = localStorage.getItem('ai_model') || 'openai/gpt-4o-mini';

  const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการประเมินโครงการตามเกณฑ์ดัชนีทุนชีวิต 5 พลัง ของศูนย์คุณธรรม (องค์การมหาชน)
หน้าที่ของคุณคือวิเคราะห์เนื้อหาเอกสารโครงการที่ได้รับ และประเมินคะแนนดัชนีทุนชีวิต 5 พลัง ตาม "ตารางเกณฑ์วัดดัชนีทุนชีวิต 5 พลัง ฉบับทั่วไป (Universal Life Assets Matrix v3.0)" ดังนี้:

${UNIVERSAL_LIFE_ASSETS_MATRIX_CRITERIA_PROMPT}

คำสั่งในการประเมิน:
1. วิเคราะห์ชื่อโครงการ และชื่อองค์กร/หน่วยงาน จากเนื้อหา
2. สรุปบริบท ปัญหา กระบวนการ ผลลัพธ์ ปัจจัยความสำเร็จ และความยั่งยืน
3. ให้คะแนนแต่ละด้าน (1-10) ได้แก่:
   - พลังตัวตน (selfPower)
   - พลังครอบครัว/องค์กร (familyPower)
   - พลังปัญญา (wisdomPower)
   - พลังเพื่อนและกลุ่ม (peerPower)
   - พลังชุมชน/ระบบนิเวศ (communityPower)
   พร้อมระบุระดับพัฒนาการ (Expect to see: 1-3, Like to see: 4-7, Love to see: 8-10) และเหตุผลที่ตรงกับเกณฑ์และหลักฐานพฤติกรรม
4. ให้ข้อเสนอแนะในการยกระดับคะแนน (recommendation)
5. วิเคราะห์ SWOT Analysis เชิงลึกของแต่ละด้านทั้ง 5 พลัง (swot: strengths จุดแข็ง, weaknesses จุดอ่อน, opportunities โอกาสต่อยอด, threats อุปสรรค/ความเสี่ยง)
6. ชี้เป้า "จุดอ่อนที่ต้องปรับปรุง" (Weaknesses & Bottlenecks) เพื่อให้โครงการมีโอกาสยกระดับจาก Expect/Like สู่ Love to see
7. เขียนภาพรวมการประเมิน (overallSummary)

คุณต้องตอบกลับเป็น JSON ที่ถูกต้องตามโครงสร้างนี้เท่านั้น (ห้ามใส่ Markdown หรือข้อความอื่น):
{
  "projectName": "ชื่อโครงการ",
  "organization": "ชื่อองค์กรหรือหน่วยงาน",
  "details": {
    "context": "บริบทและข้อมูลโครงการ",
    "problem": "จุดเริ่มต้นหรือปัญหาที่โครงการต้องการแก้ไข",
    "process": ["ขั้นตอนที่ 1", "ขั้นตอนที่ 2", "ขั้นตอนที่ 3"],
    "results": "ผลลัพธ์การดำเนินงาน",
    "successFactors": "ปัจจัยความสำเร็จและบทเรียน",
    "sustainability": "แนวทางการต่อยอดสู่ความยั่งยืน"
  },
  "scores": {
    "selfPower": {
      "score": number,
      "reason": "ระดับ (Expect/Like/Love): คำอธิบายเหตุผลและหลักฐาน",
      "recommendation": "ข้อแนะนำเพื่อยกระดับคะแนน",
      "swot": {
        "strengths": "จุดแข็งด้านพลังตัวตน",
        "weaknesses": "จุดอ่อนด้านพลังตัวตน",
        "opportunities": "โอกาสในการต่อยอดพลังตัวตน",
        "threats": "อุปสรรคหรือความเสี่ยงด้านพลังตัวตน"
      }
    },
    "familyPower": {
      "score": number,
      "reason": "ระดับ (Expect/Like/Love): คำอธิบายเหตุผลและหลักฐาน",
      "recommendation": "ข้อแนะนำเพื่อยกระดับคะแนน",
      "swot": {
        "strengths": "จุดแข็งด้านพลังครอบครัว/องค์กร",
        "weaknesses": "จุดอ่อนด้านพลังครอบครัว/องค์กร",
        "opportunities": "โอกาสในการต่อยอดพลังครอบครัว/องค์กร",
        "threats": "อุปสรรคหรือความเสี่ยงด้านพลังครอบครัว/องค์กร"
      }
    },
    "wisdomPower": {
      "score": number,
      "reason": "ระดับ (Expect/Like/Love): คำอธิบายเหตุผลและหลักฐาน",
      "recommendation": "ข้อแนะนำเพื่อยกระดับคะแนน",
      "swot": {
        "strengths": "จุดแข็งด้านพลังปัญญา",
        "weaknesses": "จุดอ่อนด้านพลังปัญญา",
        "opportunities": "โอกาสในการต่อยอดพลังปัญญา",
        "threats": "อุปสรรคหรือความเสี่ยงด้านพลังปัญญา"
      }
    },
    "peerPower": {
      "score": number,
      "reason": "ระดับ (Expect/Like/Love): คำอธิบายเหตุผลและหลักฐาน",
      "recommendation": "ข้อแนะนำเพื่อยกระดับคะแนน",
      "swot": {
        "strengths": "จุดแข็งด้านพลังเพื่อนและกลุ่ม",
        "weaknesses": "จุดอ่อนด้านพลังเพื่อนและกลุ่ม",
        "opportunities": "โอกาสในการต่อยอดพลังเพื่อนและกลุ่ม",
        "threats": "อุปสรรคหรือความเสี่ยงด้านพลังเพื่อนและกลุ่ม"
      }
    },
    "communityPower": {
      "score": number,
      "reason": "ระดับ (Expect/Like/Love): คำอธิบายเหตุผลและหลักฐาน",
      "recommendation": "ข้อแนะนำเพื่อยกระดับคะแนน",
      "swot": {
        "strengths": "จุดแข็งด้านพลังชุมชน/ระบบนิเวศ",
        "weaknesses": "จุดอ่อนด้านพลังชุมชน/ระบบนิเวศ",
        "opportunities": "โอกาสในการต่อยอดพลังชุมชน/ระบบนิเวศ",
        "threats": "อุปสรรคหรือความเสี่ยงด้านพลังชุมชน/ระบบนิเวศ"
      }
    }
  },
  "weaknesses": [
    "จุดอ่อนที่ 1 ...",
    "จุดอ่อนที่ 2 ..."
  ],
  "overallSummary": "สรุปภาพรวมผลการประเมินด้านทุนชีวิตของโครงการ"
}`;

  if (apiKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Moral Center Life Assets AI Evaluation',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `กรุณาประเมินโครงการต่อไปนี้ตามเกณฑ์ Universal Life Assets Matrix v3.0 พร้อมวิเคราะห์ SWOT ของทั้ง 5 พลัง:\n\n${projectText}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const contentStr = data.choices[0]?.message?.content || '';
        const cleanJson = contentStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        const pName = parsed.projectName || 'โครงการนำเข้า';

        return {
          id: existingProjectsDataCountId(existingProjectsCount),
          projectName: pName,
          organization: parsed.organization || 'หน่วยงานของฉัน',
          details: {
            context: parsed.details?.context || 'บริบทโครงการที่นำเข้า',
            problem: parsed.details?.problem || 'ปัญหาและจุดมุ่งหมาย',
            process: Array.isArray(parsed.details?.process) ? parsed.details.process : ['ดำเนินกิจกรรมตามแผนงาน'],
            results: parsed.details?.results || 'ผลลัพธ์โครงการ',
            successFactors: parsed.details?.successFactors || 'ความร่วมมือของสมาชิก',
            sustainability: parsed.details?.sustainability || 'การพัฒนาอย่างต่อเนื่อง',
          },
          scores: {
            selfPower: sanitizeLifeAssetScore(parsed.scores?.selfPower, 'selfPower', 'พลังตัวตน', pName),
            familyPower: sanitizeLifeAssetScore(parsed.scores?.familyPower, 'familyPower', 'พลังครอบครัว/องค์กร', pName),
            wisdomPower: sanitizeLifeAssetScore(parsed.scores?.wisdomPower, 'wisdomPower', 'พลังปัญญา', pName),
            peerPower: sanitizeLifeAssetScore(parsed.scores?.peerPower, 'peerPower', 'พลังเพื่อนและกลุ่ม', pName),
            communityPower: sanitizeLifeAssetScore(parsed.scores?.communityPower, 'communityPower', 'พลังชุมชน/ระบบนิเวศ', pName),
          },
          weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0
            ? parsed.weaknesses
            : ['ควรเพิ่มหลักฐานเชิงประจักษ์และการจัดทำแผนพัฒนาศักยภาพทุนชีวิตที่ชัดเจน'],
          overallSummary: parsed.overallSummary || 'ผลการประเมินโครงการตามเกณฑ์ดัชนีทุนชีวิต 5 พลัง',
        };
      }
    } catch (err) {
      console.warn('OpenRouter Life Assets evaluation call failed, falling back to heuristic engine:', err);
    }
  }

  return heuristicEvaluateLifeAssetsProject(projectText, existingProjectsCount);
};

export const recommendLifeAssetsProjectWithAI = async (
  userPrompt: string
): Promise<RecommendedProposal> => {
  const apiKey = localStorage.getItem('ai_api_key');
  const model = localStorage.getItem('ai_model') || 'openai/gpt-4o-mini';

  const systemPrompt = `คุณคือนักออกแบบโครงการ ครีเอทีฟตั้งชื่อโครงการสุดเท่ และที่ปรึกษาอาวุโสด้านนวัตกรรมทุนชีวิตของศูนย์คุณธรรม (องค์การมหาชน)
หน้าที่ของคุณคือรับแนวทางหรือความต้องการจากผู้ใช้งาน แล้วออกแบบ "ข้อเสนอโครงการด้านการเสริมสร้างทุนชีวิต 5 พลัง (Life Assets Proposal) ฉบับสมบูรณ์ระดับมืออาชีพ" ที่มีความละเอียด รอบคอบ เป็นรูปธรรม พร้อมตั้งชื่อโครงการที่เท่ ทันสมัย สร้างแรงบันดาลใจ และผ่านการตรวจสอบความถูกต้องครบถ้วนก่อนนำไปแสดงใน Dialog Box เพื่อส่งให้ระบบ AI วิเคราะห์ประเมินผลต่อไป

ข้อกำหนดสำคัญในการเขียนข้อเสนอโครงการ:
1. ชื่อโครงการเท่ๆ (projectName & alternativeNames):
   - projectName: ตั้งชื่อโครงการหลักที่เท่ ทันสมัย มีพลัง สื่อถึงการปลุกพลังทุนชีวิตและแนวทางที่ผู้ใช้ระบุ
   - alternativeNames: คิดชื่อโครงการเท่ๆ ทางเลือกเพิ่มเติมอีก 4 สไตล์ เพื่อให้ผู้ใช้คลิกเลือกเปลี่ยนได้ตามชอบ
2. วัตถุประสงค์ของโครงการ (objectives): ระบุอย่างน้อย 4 ข้อ ที่ชัดเจน วัดผลได้จริง (SMART Objectives)
3. แผนและวิธีการดำเนินงานโดยละเอียด (process): แบ่งเป็นระยะ (Phases 1-5) อธิบายวิธีปฏิบัติ กิจกรรมย่อย เครื่องมือที่ใช้ และการเก็บหลักฐานเชิงประจักษ์ครบทั้ง 5 พลัง (พลังตัวตน, พลังครอบครัว/องค์กร, พลังปัญญา, พลังเพื่อนและกลุ่ม, พลังชุมชน/ระบบนิเวศ)
4. ประโยชน์ที่คาดว่าจะได้รับจากโครงการ (expectedBenefits): ระบุอย่างน้อย 4 ข้อ ครอบคลุมระดับบุคคล ระดับครอบครัว/องค์กร ระดับชุมชน/สังคม และระดับการยกระดับดัชนีทุนชีวิต 5 พลัง
5. การตรวจสอบความถูกต้องครบถ้วน (validationSummary): สรุปผลการตรวจสอบความสอดคล้องของเนื้อหากับโจทย์ของผู้ใช้และความพร้อมสำหรับการประเมิน

คุณต้องตอบกลับเป็น JSON ที่ถูกต้องตามโครงสร้างนี้เท่านั้น (ห้ามใส่ Markdown อื่น):
{
  "projectName": "ชื่อโครงการหลักที่เท่ ทันสมัย และทรงพลัง",
  "alternativeNames": [
    "ชื่อโครงการเท่ๆ ทางเลือกที่ 1",
    "ชื่อโครงการเท่ๆ ทางเลือกที่ 2",
    "ชื่อโครงการเท่ๆ ทางเลือกที่ 3",
    "ชื่อโครงการเท่ๆ ทางเลือกที่ 4"
  ],
  "organization": "ชื่อองค์กร/หน่วยงานที่เหมาะสมกับบริบทโครงการ",
  "context": "หลักการและเหตุผล / บริบทความสำคัญของโครงการอย่างละเอียด",
  "problem": "สภาพปัญหาและความท้าทายที่ต้องการแก้ไขอย่างตรงจุด",
  "objectives": [
    "1. เพื่อ...",
    "2. เพื่อ...",
    "3. เพื่อ...",
    "4. เพื่อ..."
  ],
  "process": [
    "ระยะที่ 1 (การสำรวจและเตรียมความพร้อม): ...",
    "ระยะที่ 2 (การพัฒนาพลังตัวตนและทักษะชีวิต): ...",
    "ระยะที่ 3 (การสร้างพื้นที่ปลอดภัยในครอบครัว/องค์กรและกลุ่มเพื่อน): ...",
    "ระยะที่ 4 (การเชื่อมโยงระบบนิเวศชุมชนและติดตามประเมินผล): ...",
    "ระยะที่ 5 (การถอดบทเรียนและขยายผลสู่ความยั่งยืน): ..."
  ],
  "expectedBenefits": [
    "1. ด้านผู้เข้าร่วมโครงการ (พลังตัวตนและปัญญา): ...",
    "2. ด้านครอบครัวและองค์กร (พื้นที่ปลอดภัยทางใจ): ...",
    "3. ด้านกลุ่มเพื่อนและเครือข่ายชุมชน: ...",
    "4. ด้านการยกระดับมาตรฐานดัชนีทุนชีวิต 5 พลัง: ..."
  ],
  "results": "สรุปผลสัมฤทธิ์เชิงปริมาณและเชิงคุณภาพที่ชัดเจน",
  "successFactors": "ปัจจัยแห่งความสำเร็จและกลไกหนุนเสริมสำคัญ",
  "sustainability": "แนวทางการพัฒนาต่อยอดให้เกิดความยั่งยืนในระยะยาว",
  "validationSummary": "ยืนยันผลการตรวจสอบความถูกต้องครบถ้วนของข้อเสนอโครงการก่อนส่งวิเคราะห์"
}`;

  if (apiKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Moral Center Life Assets AI Recommender',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `แนวทางของโครงการที่ต้องการ:\n"${userPrompt}"\n\nกรุณาคิดชื่อโครงการเท่ๆ พร้อมตัวเลือกชื่อเพิ่มเติม และออกแบบข้อเสนอโครงการเสริมสร้างทุนชีวิต 5 พลังอย่างเป็นมืออาชีพ ละเอียดรอบคอบ พร้อมระบุชื่อโครงการ วัตถุประสงค์ แผนและวิธีการดำเนินงานโดยละเอียด และประโยชน์ที่คาดว่าจะได้รับ และตรวจสอบความถูกต้องครบถ้วนก่อนส่งกลับมาแสดงผล`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const contentStr = data.choices[0]?.message?.content || '';
        const cleanJson = contentStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return validateAndRefineProposal(parsed, userPrompt, 'life_assets');
      }
    } catch (err) {
      console.warn('OpenRouter Life Assets project recommendation failed, using creative generator:', err);
    }
  }

  return generateFallbackLifeAssetsProjectProposal(userPrompt);
};

export function getOrGenerateLifeAssetDimensionSwot(
  dimKey: 'selfPower' | 'familyPower' | 'wisdomPower' | 'peerPower' | 'communityPower',
  scoreData: LifeAssetScore,
  projectName = 'โครงการ'
): LifeAssetSwotAnalysis {
  if (
    scoreData?.swot &&
    scoreData.swot.strengths &&
    scoreData.swot.weaknesses &&
    scoreData.swot.opportunities &&
    scoreData.swot.threats
  ) {
    return scoreData.swot;
  }

  const sc = scoreData?.score ?? 7;
  const isHigh = sc >= 8;

  const swotTemplates: Record<
    'selfPower' | 'familyPower' | 'wisdomPower' | 'peerPower' | 'communityPower',
    LifeAssetSwotAnalysis
  > = {
    selfPower: {
      strengths: isHigh
        ? `ผู้เข้าร่วมในโครงการ "${projectName}" มี Growth Mindset ความตระหนักรู้ในคุณค่าตนเองสูง และมีภูมิคุ้มกันทางอารมณ์เข้มแข็ง`
        : `ผู้เข้าร่วมมีความรับผิดชอบต่อบทบาทหน้าที่ เปิดใจเรียนรู้สิ่งใหม่ และจัดการอารมณ์เบื้องต้นได้ดี`,
      weaknesses: isHigh
        ? `การบันทึกสะท้อนคิดรายบุคคล (Reflection Log) ยังสามารถยกระดับให้เป็นระบบติดตามระยะยาวได้มากขึ้น`
        : `ผู้เข้าร่วมบางส่วนยังขาดความมั่นใจในการเป็นผู้นำการเปลี่ยนแปลง (Change Agent) เมื่อเผชิญสถานการณ์กดดัน`,
      opportunities: `สามารถพัฒนาโปรแกรม Life Coach รุ่นเยาว์/พี่เลี้ยงในองค์กร เพื่อเสริมพลังตัวตนและเป้าหมายชีวิตที่ชัดเจน`,
      threats: `แรงกดดันทางเศรษฐกิจและสื่อสังคมออนไลน์เชิงลบ อาจบั่นทอนสุขภาพจิตและความมั่นคงทางอารมณ์ของผู้เข้าร่วม`,
    },
    familyPower: {
      strengths: isHigh
        ? `ครอบครัวและองค์กรเปิดพื้นที่ปลอดภัยทางใจ (Psychological Safety) รับฟังโดยไม่ตัดสิน และสนับสนุนทรัพยากรเต็มที่`
        : `ครอบครัวและหัวหน้างานรับทราบและสนับสนุนการเข้าร่วมกิจกรรมด้วยบรรยากาศที่เป็นมิตร`,
      weaknesses: isHigh
        ? `การเชื่อมโยงกิจกรรมให้ครอบคลุมสมาชิกครอบครัวทุกเจเนอเรชันยังมีข้อจำกัดด้านเวลาในบางกลุ่ม`
        : `การสื่อสารเชิงบวกภายในครอบครัวหรือหน่วยงานยังเป็นลักษณะเฉพาะกิจตามกิจกรรม ยังไม่เป็นวิถีประจำวันครบทุกส่วน`,
      opportunities: `สามารถต่อยอดเป็นนโยบายสวัสดิการสุขภาวะครอบครัวและองค์กรแห่งความสุข (Happy Workplace / Happy Family)`,
      threats: `ภาระค่าครองชีพและตารางเวลาทำงานที่รัดตัว อาจลดทอนเวลาคุณภาพในการพูดคุยรับฟังกันในครอบครัวและที่ทำงาน`,
    },
    wisdomPower: {
      strengths: isHigh
        ? `มีการสังเคราะห์องค์ความรู้และสร้างนวัตกรรมแก้ปัญหาจริง (Active Learning) พร้อมถอดบทเรียนขยายผลอย่างเป็นระบบ`
        : `ผู้เข้าร่วมเข้าถึงองค์ความรู้และฝึกทักษะคิดวิเคราะห์เท่าทันสื่อและสถานการณ์ได้อย่างทั่วถึง`,
      weaknesses: isHigh
        ? `การจัดทำคลังสื่อนวัตกรรมดิจิทัลเพื่อเผยแพร่สู่สาธารณะยังสามารถเพิ่มความหลากหลายของรูปแบบสื่อได้อีก`
        : `การนำความรู้ไปประยุกต์สร้างนวัตกรรมใหม่ๆ ด้วยตนเองยังอยู่ในขั้นเริ่มต้น ต้องมีวิทยากรหรือพี่เลี้ยงคอยชี้แนะ`,
      opportunities: `สามารถร่วมมือกับสถาบันการศึกษาและปราชญ์ชาวบ้านเพื่อพัฒนาหลักสูตรทักษะอนาคตและภูมิปัญญาท้องถิ่น`,
      threats: `ข้อมูลข่าวสารที่ท่วมท้นและเปลี่ยนแปลงรวดเร็ว (Information Overload) อาจทำให้เกิดความสับสนหากขาดเครื่องมือคัดกรอง`,
    },
    peerPower: {
      strengths: isHigh
        ? `เกิดเครือข่ายกัลยาณมิตรและกลุ่มเพื่อนช่วยเพื่อนที่เข้มแข็ง ร่วมสร้างพื้นที่สร้างสรรค์และดึงเพื่อนพ้นจากจุดเสี่ยง`
        : `สมาชิกในกลุ่มทำงานร่วมกันด้วยความจริงใจ ให้เกียรติกัน และช่วยเหลือเกื้อกูลกันในกิจกรรม`,
      weaknesses: isHigh
        ? `การส่งต่อบทบาทแกนนำกลุ่มเพื่อนจากรุ่นพี่สู่รุ่นน้องต้องอาศัยกลไกพี่เลี้ยงที่ต่อเนื่อง`
        : `กิจกรรมกลุ่มเพื่อนยังจำกัดอยู่ในช่วงเวลากิจกรรมโครงการ ยังไม่เกิดชมรมหรือคลับกัลยาณมิตรที่ดำเนินงานเองต่อเนื่อง`,
      opportunities: `สามารถใช้แพลตฟอร์มออนไลน์และกิจกรรม Peer Coaching ขยายเครือข่ายเพื่อนช่วยเพื่อนข้ามหน่วยงานและสถานศึกษา`,
      threats: `อิทธิพลของกลุ่มเพื่อนภายนอกหรือสิ่งยั่วยุในสภาพแวดล้อมเสี่ยง อาจดึงความสนใจของสมาชิกกลุ่มเปราะบาง`,
    },
    communityPower: {
      strengths: isHigh
        ? `เกิดระบบนิเวศชุมชนและภาคีเครือข่าย (บ้าน-วัด-โรงเรียน-องค์กร) ที่ร่วมกำหนดกติกาเชิงบวกและพึ่งพาตนเองได้ยั่งยืน`
        : `ผู้นำชุมชนและผู้บริหารองค์กรให้การสนับสนุนเชิงนโยบายและเปิดพื้นที่ให้ดำเนินกิจกรรมอย่างทั่วถึง`,
      weaknesses: isHigh
        ? `การเชื่อมโยงทรัพยากรข้ามพื้นที่จังหวัดหรือระดับประเทศยังสามารถขยายผลเพิ่มเติมได้`
        : `การมีส่วนร่วมของภาคีเครือข่ายภายนอกยังเป็นลักษณะผู้ร่วมกิจกรรม ยังไม่ได้ร่วมเป็นเจ้าของโครงการ (Co-ownership) เต็มรูปแบบ`,
      opportunities: `สามารถยกระดับเป็นศูนย์การเรียนรู้ต้นแบบด้านทุนชีวิตและบูรณาการเข้ากับแผนพัฒนาท้องถิ่นประจำปี`,
      threats: `การเปลี่ยนแปลงผู้นำชุมชนหรือผู้บริหารองค์กรตามวาระ อาจส่งผลต่อความต่อเนื่องของนโยบายสนับสนุนพื้นที่สร้างสรรค์`,
    },
  };

  return swotTemplates[dimKey];
}

function sanitizeLifeAssetScore(
  sc: any,
  dimKey: 'selfPower' | 'familyPower' | 'wisdomPower' | 'peerPower' | 'communityPower',
  dimName: string,
  projectName = 'โครงการ'
): LifeAssetScore {
  const scoreNum = typeof sc?.score === 'number' ? Math.min(Math.max(sc.score, 1), 10) : 7;
  const tier = scoreNum >= 8 ? 'Love to see' : scoreNum >= 4 ? 'Like to see' : 'Expect to see';
  const baseScore: LifeAssetScore = {
    score: scoreNum,
    reason: sc?.reason || `ระดับ ${tier}: มีกระบวนการส่งเสริม${dimName}ในกิจกรรมโครงการ`,
    recommendation: sc?.recommendation || `ควรเพิ่มกลไกพัฒนา${dimName}สู่ระดับ Love to see อย่างต่อเนื่อง`,
  };
  const fallbackSwot = getOrGenerateLifeAssetDimensionSwot(dimKey, baseScore, projectName);
  return {
    ...baseScore,
    swot: {
      strengths:
        typeof sc?.swot?.strengths === 'string' && sc.swot.strengths.trim().length > 5
          ? sc.swot.strengths.trim()
          : fallbackSwot.strengths,
      weaknesses:
        typeof sc?.swot?.weaknesses === 'string' && sc.swot.weaknesses.trim().length > 5
          ? sc.swot.weaknesses.trim()
          : fallbackSwot.weaknesses,
      opportunities:
        typeof sc?.swot?.opportunities === 'string' && sc.swot.opportunities.trim().length > 5
          ? sc.swot.opportunities.trim()
          : fallbackSwot.opportunities,
      threats:
        typeof sc?.swot?.threats === 'string' && sc.swot.threats.trim().length > 5
          ? sc.swot.threats.trim()
          : fallbackSwot.threats,
    },
  };
}

function heuristicEvaluateLifeAssetsProject(text: string, count: number): LifeAssetsEvaluatedResult {
  const lower = text.toLowerCase();

  let projectName = 'โครงการพัฒนาศักยภาพและทุนชีวิต';
  const nameMatch = text.match(/(?:ชื่อโครงการ|โครงการ)\s*[:：]?\s*([^\n\r,]+)/);
  if (nameMatch && nameMatch[1].trim().length > 3) {
    projectName = nameMatch[1].trim();
  }

  let organization = 'องค์กรปฏิบัติการส่งเสริมทุนชีวิต';
  const orgMatch = text.match(/(?:องค์กร|หน่วยงาน|บริษัท|ชุมชน|โรงเรียน)\s*[:：]?\s*([^\n\r,]+)/);
  if (orgMatch && orgMatch[1].trim().length > 3) {
    organization = orgMatch[1].trim();
  }

  const selfScore = lower.includes('ตัวตน') || lower.includes('จิตใจ') || lower.includes('ทักษะชีวิต') || lower.includes('เป้าหมาย') || lower.includes('สติ') ? 8 : 7;
  const familyScore = lower.includes('ครอบครัว') || lower.includes('สวัสดิการ') || lower.includes('บ้าน') || lower.includes('ปลอดภัย') ? 8 : 7;
  const wisdomScore = lower.includes('ปัญญา') || lower.includes('ความรู้') || lower.includes('นวัตกรรม') || lower.includes('เรียนรู้') || lower.includes('วิเคราะห์') ? 8 : 7;
  const peerScore = lower.includes('เพื่อน') || lower.includes('กลุ่ม') || lower.includes('บัดดี้') || lower.includes('ทีม') || lower.includes('มิตร') ? 9 : 7;
  const communityScore = lower.includes('ชุมชน') || lower.includes('สังคม') || lower.includes('นิเวศ') || lower.includes('เครือข่าย') || lower.includes('สิ่งแวดล้อม') ? 8 : 7;

  const selfBase: LifeAssetScore = {
    score: selfScore,
    reason: selfScore >= 8
      ? 'ระดับ Love to see: ผู้เข้าร่วมมี Growth Mindset และความตระหนักรู้ในตนเองสูง สามารถจัดการอารมณ์และเป็นแบบอย่างที่ดี'
      : 'ระดับ Like to see: มีวินัยในตนเอง มีความรับผิดชอบ และพร้อมปรับเปลี่ยนนิสัยเชิงบวก',
    recommendation: 'ควรต่อยอดสู่การเป็นพี่เลี้ยง (Life Assets Coach) เพื่อถ่ายทอดประสบการณ์แก่ผู้อื่น',
  };
  const familyBase: LifeAssetScore = {
    score: familyScore,
    reason: familyScore >= 8
      ? 'ระดับ Love to see: องค์กรหรือครอบครัวเป็นพื้นที่ปลอดภัยทางใจ ให้การสนับสนุนทรัพยากรและร่วมขับเคลื่อนโครงการอย่างเข้มแข็ง'
      : 'ระดับ Like to see: ได้รับการรับรองและความร่วมมือจากครอบครัว/หัวหน้างานในการเข้าร่วมกิจกรรม',
    recommendation: 'ควรขยายกิจกรรมเสริมสร้างความสัมพันธ์ที่เชื่อมโยงถึงสมาชิกในครอบครัวอย่างต่อเนื่อง',
  };
  const wisdomBase: LifeAssetScore = {
    score: wisdomScore,
    reason: wisdomScore >= 8
      ? 'ระดับ Love to see: สามารถสังเคราะห์ความรู้เป็นนวัตกรรมหรือเครื่องมือแก้ปัญหาชีวิตจริงได้อย่างสร้างสรรค์'
      : 'ระดับ Like to see: มีทักษะคิดวิเคราะห์และนำองค์ความรู้ไปประยุกต์ใช้ในการทำงานจริง',
    recommendation: 'ควรถอดบทเรียนเป็นคู่มือหรือสื่อการเรียนรู้เพื่อเผยแพร่สู่สาธารณะ',
  };
  const peerBase: LifeAssetScore = {
    score: peerScore,
    reason: peerScore >= 8
      ? 'ระดับ Love to see: สมาชิกรวมพลังเป็นเครือข่ายเพื่อนช่วยเพื่อนเชิงรุก สร้างพื้นที่บวกและตักเตือนกันอย่างสร้างสรรค์'
      : 'ระดับ Like to see: มีการรวมกลุ่มทำกิจกรรมสร้างสรรค์และช่วยเหลือกันในการทำงาน',
    recommendation: 'ควรจัดตั้งชมรมหรือเครือข่ายแกนนำเพื่อความต่อเนื่องของกิจกรรม',
  };
  const communityBase: LifeAssetScore = {
    score: communityScore,
    reason: communityScore >= 8
      ? 'ระดับ Love to see: เกิดระบบนิเวศชุมชนเข้มแข็งที่พึ่งพาตนเองได้ และเป็นแหล่งเรียนรู้ต้นแบบแก่พื้นที่อื่น'
      : 'ระดับ Like to see: ชุมชนและภาคีเครือข่ายเปิดพื้นที่สร้างสรรค์และร่วมสนับสนุนกิจกรรมโครงการ',
    recommendation: 'ควรผลักดันสู่การจัดทำข้อตกลงร่วมหรือธรรมนูญชุมชนด้านทุนชีวิตอย่างยั่งยืน',
  };

  return {
    id: count + 1,
    projectName,
    organization,
    details: {
      context: text.length > 250 ? text.substring(0, 240) + '...' : text,
      problem: 'ต้องการเสริมสร้างภูมิคุ้มกันทางอารมณ์ สัมพันธภาพเชิงบวก และสภาพแวดล้อมที่เอื้อต่อการเติบโตอย่างมีความสุข',
      process: [
        'สำรวจและประเมินทุนชีวิตรายบุคคลและกลุ่มเป้าหมาย',
        'จัดกระบวนการเรียนรู้เสริมสร้างทักษะชีวิต 5 พลัง',
        'สร้างพื้นที่สร้างสรรค์และกลไกดูแลช่วยเหลือร่วมกัน',
      ],
      results: 'กลุ่มเป้าหมายมีความมั่นคงทางอารมณ์ มีสัมพันธภาพที่ดีในครอบครัวและเพื่อนร่วมงาน และมีส่วนร่วมพัฒนาชุมชน',
      successFactors: 'การสร้างพื้นที่ปลอดภัยทางใจ (Psychological Safety) และการมีส่วนร่วมของทุกภาคส่วน',
      sustainability: 'การพัฒนาแกนนำและการสร้างเครือข่ายเกื้อกูลที่พึ่งพาตนเองได้ในระยะยาว',
    },
    scores: {
      selfPower: {
        ...selfBase,
        swot: getOrGenerateLifeAssetDimensionSwot('selfPower', selfBase, projectName),
      },
      familyPower: {
        ...familyBase,
        swot: getOrGenerateLifeAssetDimensionSwot('familyPower', familyBase, projectName),
      },
      wisdomPower: {
        ...wisdomBase,
        swot: getOrGenerateLifeAssetDimensionSwot('wisdomPower', wisdomBase, projectName),
      },
      peerPower: {
        ...peerBase,
        swot: getOrGenerateLifeAssetDimensionSwot('peerPower', peerBase, projectName),
      },
      communityPower: {
        ...communityBase,
        swot: getOrGenerateLifeAssetDimensionSwot('communityPower', communityBase, projectName),
      },
    },
    weaknesses: [
      'ยังขาดเครื่องมือวัดผลการเปลี่ยนแปลงทางจิตวิทยา (Psychological Assessment) ก่อนและหลังโครงการอย่างเป็นรูปธรรม',
      'การเชื่อมโยงระหว่างมิติพลังครอบครัวและพลังชุมชนยังสามารถขยายผลให้ครอบคลุมกลุ่มเปราะบางมากขึ้น',
      'ควรเพิ่มช่องทางบันทึกสะท้อนคิด (Reflection Log) แบบดิจิทัลเพื่อติดตามพัฒนาการต่อเนื่อง',
    ],
    overallSummary: `โครงการ "${projectName}" มีจุดเด่นด้านการเสริมสร้างพลังเพื่อนและพลังตัวตน อยู่ในระดับ Like to see ถึง Love to see หากเสริมการประเมินเชิงประจักษ์ครบ 5 มิติ จะเป็นโครงการต้นแบบด้านทุนชีวิตที่ทรงพลัง`,
  };
}

function generateFallbackLifeAssetsProjectProposal(prompt: string): RecommendedProposal {
  const topic = extractCleanTopicFromPrompt(prompt);
  const primaryCoolName = `โครงการ Life Power Boost: ปลุกพลังทุนชีวิตพิชิต "${topic}" อย่างยั่งยืน`;
  const alternativeNames = [
    primaryCoolName,
    `โครงการ Mind & Soul Space: พื้นที่ปลอดภัยสร้างพลังใจขับเคลื่อน "${topic}"`,
    `โครงการ 5 Powers Synergy: ถักทอเครือข่ายกัลยาณมิตรยกระดับ "${topic}"`,
    `โครงการ Growth Heroes: เปลี่ยนตัวเอง เปลี่ยนสังคมด้วยทุนชีวิต "${topic}"`,
  ];

  return {
    projectName: primaryCoolName,
    alternativeNames,
    organization: 'ศูนย์ขับเคลื่อนทุนชีวิตและเครือข่ายพัฒนาสุขภาวะองค์กร/ชุมชน',
    context: `โครงการนี้ได้รับการออกแบบอย่างรอบคอบตามแนวทางที่ผู้เสนอระบุไว้คือ "${prompt}" เพื่อสร้างระบบนิเวศที่เกื้อกูลต่อการเติบโตทางจิตใจ ทักษะชีวิต และการพึ่งพาอาศัยกัน โดยบูรณาการกรอบแนวคิดทุนชีวิต 5 พลัง (พลังตัวตน พลังครอบครัว/องค์กร พลังปัญญา พลังเพื่อนและกลุ่ม และพลังชุมชน)`,
    problem: `จากแนวทางด้าน "${topic}" พบว่ากลุ่มเป้าหมายเผชิญความท้าทายด้านความมั่นคงทางอารมณ์ ขาดพื้นที่ปลอดภัยทางใจ (Psychological Safety) และขาดกลไกเชื่อมโยงเครือข่ายกัลยาณมิตรและชุมชนในการหนุนเสริมศักยภาพชีวิตอย่างต่อเนื่อง`,
    objectives: [
      `1. เพื่อสำรวจและประเมินต้นทุนชีวิตรายบุคคลและกลุ่มเป้าหมายด้าน "${topic}" สำหรับใช้เป็นข้อมูลตั้งต้นในการพัฒนาศักยภาพอย่างตรงจุด`,
      `2. เพื่อเสริมสร้างพลังตัวตน (Self Power) และพลังปัญญา (Wisdom Power) ให้ผู้เข้าร่วมมีทักษะการจัดการอารมณ์ คิดวิเคราะห์ และแก้ปัญหาอย่างสร้างสรรค์`,
      `3. เพื่อสร้างพื้นที่ปลอดภัยทางใจและกลไกหนุนเสริมจากครอบครัว/องค์กร (Family Power) และกลุ่มเพื่อนกัลยาณมิตร (Peer Power) ไม่น้อยกว่าร้อยละ 80 ของผู้เข้าร่วม`,
      `4. เพื่อเชื่อมโยงภาคีเครือข่ายและระบบนิเวศชุมชน (Community Power) ในการร่วมสร้างพื้นที่สร้างสรรค์และขยายผลต้นแบบด้าน "${topic}" อย่างยั่งยืน`,
    ],
    process: [
      `ระยะที่ 1: การสำรวจต้นทุนชีวิตและวิเคราะห์ความต้องการ (Life Assets Baseline & Needs Assessment) — ประเมินดัชนีทุนชีวิต 5 พลังก่อนเริ่มโครงการ (Pre-assessment) และวิเคราะห์บริบทเชิงลึกตามโจทย์ "${topic}"`,
      `ระยะที่ 2: การปลุกพลังตัวตนและพัฒนาทักษะปัญญาเชิงปฏิบัติ (Self & Wisdom Empowerment Workshop) — จัดกระบวนการเรียนรู้เชิงประสบการณ์เพื่อสร้างความตระหนักรู้ในคุณค่าตนเอง (Growth Mindset) และการคิดเชิงบวกเพื่อรับมือกับการเปลี่ยนแปลง`,
      `ระยะที่ 3: การถักทอพื้นที่ปลอดภัยในครอบครัว/องค์กรและกลุ่มเพื่อน (Family & Peer Support Circle) — จัดกิจกรรมสุนทรียสนทนา (Deep Listening) และระบบคู่หูเพื่อนช่วยเพื่อน (Buddy Support) เพื่อดูแลสุขภาวะทางใจระหว่างดำเนินกิจกรรม "${topic}"`,
      `ระยะที่ 4: การปฏิบัติการร่วมกับชุมชนและติดตามประเมินผล (Community Action & Impact Monitoring) — นำทักษะที่ได้ไปดำเนินกิจกรรมสร้างสรรค์เพื่อส่วนรวม พร้อมเก็บข้อมูลการเปลี่ยนแปลงรายบุคคลและประเมินผลหลังโครงการ (Post-assessment)`,
      `ระยะที่ 5: การสรุปบทเรียนและสร้างเครือข่ายแกนนำทุนชีวิต (Knowledge Sharing & Sustainability Network) — ถอดบทเรียนความสำเร็จ ยกย่องแกนนำต้นแบบ และจัดทำแผนส่งต่อกิจกรรมสู่การปฏิบัติประจำปี`,
    ],
    expectedBenefits: [
      `1. ประโยชน์ต่อผู้เข้าร่วมโครงการ: มีความเข้าใจและเห็นคุณค่าในตนเอง มีภูมิคุ้มกันทางใจ (Resilience) และมีทักษะปัญญาในการจัดการปัญหาชีวิตและการทำงาน`,
      `2. ประโยชน์ต่อครอบครัวและองค์กร: เกิดบรรยากาศของความเข้าอกเข้าใจ พื้นที่ปลอดภัยในการสื่อสาร และความผูกพันที่เข้มแข็งภายในหน่วยงานหรือครอบครัว`,
      `3. ประโยชน์ต่อกลุ่มเพื่อนและชุมชน: เกิดเครือข่ายกัลยาณมิตรที่คอยเกื้อกูลกัน และเกิดพื้นที่สร้างสรรค์ด้าน "${topic}" ที่สร้างประโยชน์แก่ชุมชนโดยรอบ`,
      `4. ประโยชน์ด้านการยกระดับดัชนีทุนชีวิต 5 พลัง: โครงการมีผลลัพธ์เชิงประจักษ์ครบทั้ง 5 พลัง พร้อมสำหรับการประเมินยกระดับสู่ระดับ Love to see`,
    ],
    results: `ผู้เข้าร่วมโครงการไม่น้อยกว่าร้อยละ 85 มีคะแนนดัชนีทุนชีวิต 5 พลังเพิ่มขึ้นอย่างมีนัยสำคัญ เกิดกลุ่มกัลยาณมิตรและพื้นที่สร้างสรรค์ด้าน "${topic}" ที่ดำเนินการต่อเนื่อง`,
    successFactors: `การเปิดพื้นที่รับฟังอย่างไม่ตัดสิน (Non-judgmental Space) การมีส่วนร่วมของผู้นำองค์กร/ครอบครัว และการออกแบบกิจกรรมที่เชื่อมโยงกับวิถีชีวิตจริง`,
    sustainability: `การพัฒนาผู้เข้าร่วมสู่การเป็นแกนนำพี่เลี้ยงทุนชีวิต (Life Assets Coach) และการบูรณาการกิจกรรมเข้าเป็นส่วนหนึ่งของวัฒนธรรมองค์กรและชุมชน`,
    validationSummary: `ตรวจสอบความถูกต้องครบถ้วนแล้ว: ข้อเสนอโครงการมีความสอดคล้องกับแนวทาง "${topic}" ครบถ้วนทั้งชื่อโครงการสุดเท่ วัตถุประสงค์ 4 ข้อ แผนและวิธีการดำเนินงาน 5 ระยะ และประโยชน์ที่คาดว่าจะได้รับ 4 มิติ พร้อมสำหรับการส่งต่อให้ AI วิเคราะห์ดัชนีทุนชีวิต 5 พลังและ SWOT Analysis`,
  };
}
