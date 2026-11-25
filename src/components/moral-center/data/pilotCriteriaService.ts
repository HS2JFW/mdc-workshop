// ============================================================================
// PILOT CRITERIA & RUBRIC SERVICE WITH SQLITE PERSISTENCE
// บริการสร้างและจัดการเกณฑ์การตัดสิน Hackathon และ AI Agent Skill
// รองรับการบันทึกลงฐานข้อมูล SQLite (Table: pilot_hackathon_criteria)
// พร้อมเกณฑ์ Universal Rubric 5 ด้านคุณธรรม (1-100 คะแนน) แก้ไขได้ทุกฟิลด์
// ============================================================================

export interface UploadedSourceFile {
  name: string;
  size: number;
  type: string;
  contentPreview?: string;
  uploadedAt: string;
}

export interface UniversalRubricDimension {
  id: string;
  virtueKey: 'challenge_fit' | 'creative_nudge' | 'actionability' | 'expected_impact' | 'discipline' | 'honesty' | 'volunteer' | 'gratitude' | 'sufficiency' | string;
  virtueTitle: string;        // ชื่อด้านคุณธรรม หรือเสาหลัก (Editable)
  subPillarTitle: string;     // เสาหลักการประเมิน (Editable)
  maxScore: number;           // คะแนนเต็ม (Editable, 20-30 คะแนน)
  level4: string;             // ดีเลิศ (85-100%) (Editable)
  level3: string;             // ดี (70-84%) (Editable)
  level2: string;             // พอใช้ (50-69%) (Editable)
  level1: string;             // ไม่ผ่าน (0-49%) (Editable)
}

export interface PilotHackathonCriteriaRecord {
  id: string;
  province: string;
  createdAt: string;
  updatedAt: string;
  sourceFiles: UploadedSourceFile[];
  aiAgentSkillText: string;
  rubric: UniversalRubricDimension[];
  promptSkill: string;
  promptRubric: string;
  isActive?: boolean;
}

const LOCAL_MIRROR_KEY = 'pilot_hackathon_criteria_sqlite_mirror_v5';

export const DEFAULT_PROMPT_SKILL =
  'ให้ศึกษาข้อมูลที่แนบไป โดยให้ สร้าง AI Agent Skill ด้านความเชี่ยวชาญ การให้คะแนนโครงการด้านคุณธรรมโดยดูจาก โครงการที่สามารถแก้โจทย์ปัญหาของพื้นที่ในแต่ละจังหวัดได้อย่างมีประสิทธิภาพสูงสุด ตามเกณฑ์ Rubric 4 เสาหลัก ได้แก่ ความตรงจุดในการตีโจทย์ปัญหาคลังปัญหา (30 คะแนน), ความคิดสร้างสรรค์และกลไกสะกิดพฤติกรรม (25 คะแนน), ความเป็นไปได้จริงและพลังเครือข่ายพื้นที่ (25 คะแนน), และประสิทธิผลการแก้ปัญหาและตัวชี้วัดพฤติกรรม (20 คะแนน)';

export const DEFAULT_PROMPT_RUBRIC =
  'คุณคือผู้เชี่ยวชาญด้านการตัดสินโครงการเพื่อแก้ปัญหาเชิงพื้นที่ โดยให้สร้างเกณฑ์ Rubric 4 เสาหลัก (100 คะแนน) สำหรับประเมินบทสรุปข้อเสนอโครงการและไอเดียเชิงนวัตกรรมที่สามารถแก้ปัญหาในคลังปัญหาของจังหวัดได้อย่างแม่นยำและมีประสิทธิภาพสูงสุด (ตัดเรื่องงบประมาณออก เน้นความคมชัดของไอเดีย ความเป็นไปได้จริง และผลลัพธ์พฤติกรรม)';

// ============================================================================
// 1. UNIVERSAL & CHALLENGE-DRIVEN RUBRIC DEFAULTS (4 เสาหลัก รวม 100 คะแนนเต็ม)
// เกณฑ์วัดไอเดียโครงการที่สามารถแก้โจทย์ปัญหาของพื้นที่ในแต่ละจังหวัดได้อย่างมีประสิทธิภาพสูงสุด
// ============================================================================
export const UNIVERSAL_DEFAULT_RUBRIC: UniversalRubricDimension[] = [
  {
    id: 'rubric-pillar-1',
    virtueKey: 'challenge_fit',
    virtueTitle: 'เสาหลักที่ 1: ความตรงจุดและลึกซึ้งในการตีโจทย์ปัญหาคลังปัญหา (Problem Fit)',
    subPillarTitle: 'การเจาะลึกถึงรากเหง้าปัญหาในคลังปัญหาประจำจังหวัด และความเฉพาะเจาะจงของกลุ่มเปราะบาง',
    maxScore: 30,
    level4:
      '• ตีโจทย์ปัญหาคลังปัญหา: วิเคราะห์เจาะลึกถึงรากเหง้า (Root Cause) ของปัญหาในคลังปัญหาประจำจังหวัดนั้นๆ ได้อย่างถ่องแท้\n• พฤติกรรมเป้าหมาย: อธิบายความเชื่อมโยงระหว่างพฤติกรรมของคนกับสภาพปัญหาชัดเจน มุ่งแก้ที่ต้นตอไม่ใช่แค่บรรเทาปลายเหตุ\n• กลุ่มเป้าหมายเฉพาะเจาะจง: เจาะจงกลุ่มเปราะบางที่เป็นหัวใจของปัญหาในพื้นที่จริง (เช่น ครอบครัวแหว่งกลาง, วัยรุ่นกลุ่มเสี่ยง, แรงงานนอกระบบ)\n• บริบทพื้นที่รูปธรรม: ระบุพื้นที่ดำเนินการและบริบทสภาพแวดล้อมสอดคล้องกับปัญหาจริงของจังหวัด',
    level3:
      '• ตีโจทย์ปัญหาคลังปัญหา: สอดคล้องกับโจทย์ปัญหาในคลังปัญหาประจำจังหวัด แต่วิเคราะห์สาเหตุเน้นเพียงมุมมองด้านความรู้หรือทัศนคติ\n• กลุ่มเป้าหมาย: ระบุกลุ่มเป้าหมายสอดคล้องกับปัญหา แต่ยังมีความกว้าง เช่น ประชาชนทั้งจังหวัด โดยไม่แยกแยะกลุ่มเสี่ยงสูง\n• ข้อจำกัดที่ต้องพัฒนา: ควรระบุรากเหง้าของปัญหาและชี้เป้ากลุ่มเปราะบางเฉพาะจุดให้คมชัดยิ่งขึ้น',
    level2:
      '• ความตรงโจทย์: แตะปัญหาในคลังปัญหาเพียงผิวเผิน สาระสำคัญยังเป็นโครงการทั่วไป ไม่ได้ออกแบบมาเฉพาะสำหรับแก้วิกฤตินั้นๆ\n• กลุ่มเป้าหมาย: คลุมเครือ ไม่สามารถระบุได้ว่าใครคือผู้ที่จะต้องปรับเปลี่ยนพฤติกรรมโดยตรง\n• ข้อจำกัดที่ต้องพัฒนา: ต้องปรับทิศทางโครงการให้มุ่งเป้าแก้ปัญหาเฉพาะของจังหวัดอย่างจริงจัง',
    level1:
      '• ความตรงโจทย์: ไม่ตรงกับโจทย์ปัญหาในคลังปัญหาที่เลือก หรือตั้งชื่อตามโจทย์แต่เนื้อหาเป็นเรื่องอื่นโดยสิ้นเชิง\n• ข้อจำกัดที่ไม่ผ่าน: ขาดการวิเคราะห์ปัญหาในพื้นที่ และไม่ระบุกลุ่มเป้าหมายที่แท้จริง'
  },
  {
    id: 'rubric-pillar-2',
    virtueKey: 'creative_nudge',
    virtueTitle: 'เสาหลักที่ 2: ความคิดสร้างสรรค์และกลไกสะกิดพฤติกรรม (Creative Nudge)',
    subPillarTitle: 'ความสดใหม่ของไอเดียนวัตกรรมทางสังคม (Social Innovation) และสถาปัตยกรรมทางเลือกที่ทำได้ง่าย',
    maxScore: 25,
    level4:
      '• ความคิดสร้างสรรค์สดใหม่: มีไอเดียแปลกใหม่ โดดเด่น น่าดึงดูดใจ ก้าวพ้นจากกิจกรรมซ้ำซากเดิมๆ (ไม่ใช่แค่จัดอบรม สัมมนา ป้ายไวนิล แจกเกียรติบัตร)\n• นวัตกรรมทางสังคม: มีจุดเด่นของแนวคิด (Social Innovation) ที่ตอบโจทย์วิถีชีวิตคนยุคปัจจุบัน\n• สถาปัตยกรรมทางเลือก (Nudge): มีกลไกสะกิดให้การทำความดี/แก้ปัญหา กลายเป็นเรื่องง่าย สะดวก และน่าทำในชีวิตประจำวัน (Easy, Attractive, Social, Timely)\n• กติกาประชาคม: มีข้อตกลงร่วมหรือธรรมนูญชุมชนที่เกิดจากการยอมรับร่วมกันอย่างแท้จริง',
    level3:
      '• ความคิดริเริ่ม: มีแนวคิดที่ดี น่าสนใจ มีการประยุกต์ใช้เครื่องมือใหม่ๆ แต่ยังมีส่วนผสมของกิจกรรมแบบเดิมอยู่พอสมควร\n• กลไกสะกิด: มีเครื่องมือช่วยเตือนหรือหนุนเสริมพฤติกรรม แต่ยังขาดกติกาทางสังคมที่ทำให้เกิดความต่อเนื่องสม่ำเสมอ\n• ข้อจำกัดที่ต้องพัฒนา: ควรเพิ่มกลไกสถาปัตยกรรมทางเลือก (Nudge) ให้ทำได้ง่ายในชีวิตประจำวัน',
    level2:
      '• รูปแบบโครงการ: ค่อนข้างคุ้นเคย เป็นกิจกรรมมาตรฐานทั่วไป (เช่น จัดค่าย อบรม เสวนา เดินรณรงค์) ขาดจุดเด่นที่น่าจดจำ\n• กลไกพฤติกรรม: เน้นการขอความร่วมมือ สร้างจิตสำนึก หรือสอนคุณธรรมแบบนามธรรม ไร้การปรับสิ่งแวดล้อมเอื้อต่อพฤติกรรม\n• ข้อจำกัดที่ต้องพัฒนา: ต้องเปลี่ยนจากเพียงการให้ความรู้ มาเป็นการสร้างสิ่งแวดล้อมและแรงจูงใจที่จับต้องได้',
    level1:
      '• รูปแบบโครงการ: ขาดความคิดสร้างสรรค์ เป็นการจัดกิจกรรมบรรยายทางเดียว หรือแจกของชั่วคราว\n• ข้อจำกัดที่ไม่ผ่าน: ไม่มีกลไกการปรับเปลี่ยนพฤติกรรม มุ่งหวังให้คนเปลี่ยนนิสัยเพียงเพราะได้ฟังคำสอน'
  },
  {
    id: 'rubric-pillar-3',
    virtueKey: 'actionability',
    virtueTitle: 'เสาหลักที่ 3: ความเป็นไปได้จริงและพลังเครือข่ายพื้นที่ (Actionability)',
    subPillarTitle: 'แผนการดำเนินงาน 3 ระดับที่สมเหตุสมผล และการผสานพลังสามประสาน บวร/บรม กับทุนเดิมในพื้นที่',
    maxScore: 25,
    level4:
      '• แผนกิจกรรมเป็นรูปธรรม: แผนการดำเนินงาน 3 ระดับ (นโยบาย, ผู้ปฏิบัติการ, ประชาชน) ชัดเจน เชื่อมโยงเป็นระบบ ปฏิบัติได้จริงในระยะเวลาที่กำหนด ไม่ซับซ้อนเกินกำลัง\n• ดึงทุนเดิมของพื้นที่: ใช้ประโยชน์จากทุนทางสังคมเดิม (ผู้นำธรรมชาติ, ปราชญ์ชาวบ้าน, แหล่งเรียนรู้) ได้อย่างชาญฉลาด\n• พลังสามประสาน (บวร/บรม): บูรณาการ บ้าน-วัด/มัสยิด-โรงเรียน/อปท. และภาคีท้องถิ่น ร่วมลงมือทำจริงอย่างเหนียวแน่น\n• ความเป็นเจ้าของ (Ownership): เกิดการระเบิดจากข้างใน ชุมชนร่วมคิด ร่วมทำ ไม่ใช่โครงการสั่งการจากภายนอก',
    level3:
      '• ความเป็นไปได้: แผนกิจกรรมทำได้จริง มีขั้นตอนชัดเจน แต่อาจขาดช่วงการรักษาสภาพพฤติกรรมต่อเนื่อง\n• เครือข่ายพื้นที่: มีการประสานความร่วมมือกับหน่วยงานในพื้นที่ 1-2 ฝ่าย แต่ยังไม่ได้ผสานพลังเครือข่ายชุมชนครบวงจร\n• ข้อจำกัดที่ต้องพัฒนา: ควรเพิ่มการมีส่วนร่วมของภาคประชาชนและสถาบันทางสังคมในพื้นที่ให้ครอบคลุม',
    level2:
      '• แผนกิจกรรม: มีลักษณะเป็นอีเวนต์เดี่ยว จัดเสร็จแล้วจบ ขาดขั้นตอนการฝังพฤติกรรมลงในวิถีชีวิตจริง\n• การมีส่วนร่วม: ดำเนินงานโดยอาศัยทีมงานผู้จัดเพียงกลุ่มเดียว ขาดการเชื่อมโยงกับโครงสร้างชุมชนหรือสถาบันในพื้นที่\n• ข้อจำกัดที่ต้องพัฒนา: ต้องวางแผนกิจกรรมให้ต่อเนื่องและเปิดพื้นที่ให้ชุมชนร่วมเป็นเจ้าของโครงการ',
    level1:
      '• ความเป็นไปได้: แผนงานเพ้อฝัน เลื่อนลอย ไม่สอดคล้องกับวิถีชีวิตจริง หรือก่อให้เกิดภาระและความขัดแย้งในพื้นที่\n• ข้อจำกัดที่ไม่ผ่าน: ชุมชนไม่ได้ร่วมรับรู้หรือมีส่วนร่วม เป็นโครงการแบบ Top-down แปลกแยกจากบริบทพื้นที่'
  },
  {
    id: 'rubric-pillar-4',
    virtueKey: 'expected_impact',
    virtueTitle: 'เสาหลักที่ 4: ประสิทธิผลการแก้ปัญหาและตัวชี้วัดพฤติกรรม (Expected Impact)',
    subPillarTitle: 'ความสามารถในการลดทอนปัญหาคลังปัญหาจริงในพื้นที่ และตัวชี้วัดพฤติกรรมเชิงประจักษ์ (Behavioral KPIs)',
    maxScore: 20,
    level4:
      '• ประสิทธิผลการลดทอนปัญหา: คาดการณ์ผลลัพธ์ได้อย่างสมเหตุสมผลและมีพลัง สามารถลดทอนความรุนแรงของปัญหาในคลังปัญหาได้อย่างเห็นผลจริงในพื้นที่\n• บรรทัดฐานสังคมใหม่: พฤติกรรมเป้าหมายกลายเป็นค่านิยมร่วมของกลุ่มหรือชุมชน\n• ตัวชี้วัดพฤติกรรมจริง (Behavioral Outcome): กำหนด KPI เป็นพฤติกรรมที่เกิดขึ้นจริงในชีวิตประจำวัน ชัดเจน วัดผลได้เชิงประจักษ์\n• การตรวจสอบและถอดบทเรียน: มีกระบวนการติดตามผลและเวทีสะท้อนคิด (AAR) ร่วมกันเป็นระยะ',
    level3:
      '• ผลกระทบ: มีแนวโน้มช่วยแก้ปัญหาได้ดีในกลุ่มสมาชิกที่เข้าร่วม แต่ผลกระทบต่อภาพรวมของปัญหายังจำกัดในวงแคบ\n• ตัวชี้วัด: มีตัวชี้วัดพฤติกรรม แต่ยังปะปนกับตัวชี้วัดเชิงผลผลิต (Output) หรือตัวเลขยังไม่คมชัดพอ\n• ข้อจำกัดที่ต้องพัฒนา: ควรกำหนดตัวชี้วัดพฤติกรรมเชิงประจักษ์ที่วัดการเปลี่ยนแปลงได้ชัดเจนและขยายผลกระทบสู่วงกว้าง',
    level2:
      '• ผลกระทบ: แก้ปัญหาได้เพียงชั่วคราวขณะดำเนินโครงการ ปัญหาเดิมมีแนวโน้มกลับมาเกิดซ้ำหลังสิ้นสุดโครงการ\n• ตัวชี้วัด: วัดผลเฉพาะระดับผลผลิตเชิงกิจกรรม (Output) เช่น จำนวนผู้เข้าร่วมอบรม หรือวัดแค่แบบสอบถามความพึงพอใจ\n• ข้อจำกัดที่ต้องพัฒนา: ต้องเปลี่ยนตัวชี้วัดจากจำนวนคนเข้าร่วม มาเป็นพฤติกรรมที่เปลี่ยนไปจริง',
    level1:
      '• ผลกระทบ: ไม่สามารถสร้างผลกระทบต่อปัญหาในคลังปัญหาได้เลย เป็นการทำกิจกรรมเชิงสัญลักษณ์\n• ข้อจำกัดที่ไม่ผ่าน: ตัวชี้วัดเลื่อนลอย วัดแค่ความรู้สึก (เช่น มีความสุขมากขึ้น) โดยไม่มีเกณฑ์วัดเชิงประจักษ์'
  }
];

// ============================================================================
// 2. SYNTHETIC AI GENERATOR ENGINES (FOR PROMPT 1 & PROMPT 2)
// ============================================================================

export function synthesizeAiAgentSkillText(
  files: UploadedSourceFile[],
  prompt: string = DEFAULT_PROMPT_SKILL
): string {
  const fileNames = files.length > 0 ? files.map((f) => f.name).join(', ') : 'เอกสารคู่มือมาตรฐานศูนย์คุณธรรมและฐานข้อมูลวิจัยพฤติกรรมศาสตร์';
  const fileSummary =
    files.length > 0
      ? `วิเคราะห์และสกัดข้อมูลจาก ${files.length} เอกสารต้นทาง ได้แก่: ${fileNames}`
      : 'อิงองค์ความรู้จากรายงานการสังเคราะห์โครงการสุขภาวะคุณธรรม และผลการประเมินสมัชชาคุณธรรมแห่งชาติ';

  return `---
name: moral-challenge-solving-evaluator
description: >-
  ผู้เชี่ยวชาญระดับสูงด้านการประเมินโครงการนวัตกรรมคุณธรรมที่สามารถแก้โจทย์ปัญหาของพื้นที่ในแต่ละจังหวัดได้อย่างมีประสิทธิภาพสูงสุด
  วิเคราะห์ศักยภาพบทสรุปข้อเสนอโครงการ (Executive Summary / Concept Proposal) ตามเกณฑ์ Rubric 4 เสาหลัก:
  1) ความตรงจุดและลึกซึ้งในการตีโจทย์ปัญหาคลังปัญหา (30 คะแนน)
  2) ความคิดสร้างสรรค์และกลไกสะกิดพฤติกรรม (25 คะแนน)
  3) ความเป็นไปได้จริงและพลังเครือข่ายพื้นที่ (25 คะแนน)
  4) ประสิทธิผลการแก้ปัญหาและตัวชี้วัดพฤติกรรม (20 คะแนน)
  (${fileSummary})
---

# โปรโตคอล AI Agent Skill: ผู้เชี่ยวชาญการประเมินโครงการแก้โจทย์ปัญหาเชิงพื้นที่
*(Provincial Challenge-Driven Moral Innovation Evaluation Specialist)*

## 1. บทบาทและอัตลักษณ์ของ AI Agent (Role & Persona)
- **ตำแหน่ง:** ผู้เชี่ยวชาญระดับสูงด้านการประเมินโครงการนวัตกรรมสังคมและการปรับเปลี่ยนพฤติกรรมเชิงพื้นที่ (Senior Behavioral & Challenge-Driven Evaluator)
- **วัตถุประสงค์หลัก:** ประเมินบทสรุปข้อเสนอโครงการ (Concept Proposal) ว่า **"Idea ของโครงการสามารถนำไปแก้โจทย์ปัญหาในคลังปัญหาของจังหวัดได้อย่างตรงจุด มีความเป็นไปได้จริง และได้ผลลัพธ์พฤติกรรมที่มีประสิทธิภาพมากน้อยเพียงใด"** โดยตัดการประเมินเรื่องงบประมาณออกทั้งหมด
- **ฐานข้อมูลอ้างอิง:** ${fileSummary}

## 2. กรอบการประเมิน 4 เสาหลัก (The 4 Challenge-Solving Pillars - 100 คะแนนเต็ม)
1. **เสาหลักที่ 1 (30 คะแนน): ความตรงจุดและลึกซึ้งในการตีโจทย์ปัญหาคลังปัญหาของจังหวัด (Problem Fit & Diagnostic Precision)**
   - วินิจฉัยรากเหง้าปัญหา (Root Cause) ของปัญหาในคลังปัญหาประจำจังหวัด
   - ชี้เป้ากลุ่มเปราะบาง/กลุ่มเป้าหมายเฉพาะเจาะจง ไม่หลงประเด็น
2. **เสาหลักที่ 2 (25 คะแนน): ความคิดสร้างสรรค์และกลไกสะกิดพฤติกรรม (Creative Idea & Behavioral Nudge)**
   - ไอเดียสดใหม่ ก้าวพ้นจากการจัดอบรม บรรยาย สัมมนา ป้ายไวนิลแบบดั้งเดิม
   - มีกลไก Nudge สถาปัตยกรรมทางเลือกที่ทำได้ง่ายในชีวิตประจำวัน (Easy, Attractive, Social, Timely)
3. **เสาหลักที่ 3 (25 คะแนน): ความเป็นไปได้จริงและพลังเครือข่ายพื้นที่ (Actionability & Local Triad Synergy)**
   - แผนขับเคลื่อน 3 ระดับ (นโยบาย, ผู้ปฏิบัติการ, ประชาชน) เป็นรูปธรรม ทำได้จริง
   - บูรณาการพลัง 3 ประสาน (บวร/บรม: บ้าน-วัด-โรงเรียน/อปท.) และดึงทุนเดิมในพื้นที่มาใช้อย่างคุ้มค่า
4. **เสาหลักที่ 4 (20 คะแนน): ประสิทธิผลการแก้ปัญหาและตัวชี้วัดพฤติกรรม (Expected Impact & Behavioral Outcomes)**
   - ลดทอนความรุนแรงของปัญหาในคลังปัญหาได้อย่างเห็นผลจริง
   - กำหนดตัวชี้วัดเชิงพฤติกรรมที่เป็นรูปธรรม (Observable Behavioral KPIs) แทนการวัดแค่ยอดผู้เข้าร่วม

## 3. กฎเหล็กการประเมิน 4 ประการ (Golden Evaluation Rules)
1. **Concept & Idea Focus:** ประเมินความเฉียบคมของแนวคิดและการแก้ปัญหาคลังปัญหา ไม่ถามหาหรือตัดคะแนนเรื่องงบประมาณ
2. **Behavioral Nudge over Lecturing:** การอบรมให้ความรู้อย่างเดียวไม่เปลี่ยนพฤติกรรม ต้องมีกลไกสะกิดพฤติกรรมในวิถีชีวิตจริง
3. **Triad Synergy & Three-Tier Ownership:** การดำเนินงานต้องระเบิดจากข้างใน เชื่อมโยง 3 ประสานและขับเคลื่อนครบ 3 ระดับ
4. **Observable Behavioral Metrics:** ตัวชี้วัดต้องสะท้อนการเปลี่ยนพฤติกรรมเชิงประจักษ์และการลดปัญหาในพื้นที่อย่างยั่งยืน

## 4. ระบบการตัดสินผล (100 คะแนนเต็ม)
- **85 - 100 คะแนน (ระดับดีเลิศ):** โครงการต้นแบบแก้โจทย์พื้นที่ได้อย่างตรงจุดและลึกซึ้ง มีกลไก Nudge ชัดเจน ทำได้จริงและยั่งยืน
- **70 - 84 คะแนน (ระดับดี):** โครงการมีไอเดียที่ดี ตอบโจทย์คลังปัญหาได้ดี ควรเพิ่มรายละเอียดกลไกสะกิดพฤติกรรมให้คมชัดขึ้น
- **50 - 69 คะแนน (ระดับพอใช้):** โครงการแตะปัญหาทั่วไป ควรระบุรากเหง้าปัญหาและปรับจากกิจกรรมอบรมมาเป็นกลไกพฤติกรรม
- **0 - 49 คะแนน (ระดับกำลังพัฒนา):** ต้องปรับปรุงทิศทางโครงการใหม่ให้ตรงกับโจทย์คลังปัญหาของจังหวัดและเพิ่มการมีส่วนร่วมของพื้นที่`;
}

export function synthesizeUniversalRubricFromSkill(
  skillText: string,
  prompt: string = DEFAULT_PROMPT_RUBRIC
): UniversalRubricDimension[] {
  // Return deep clone of Universal Default Rubric with fresh IDs
  return UNIVERSAL_DEFAULT_RUBRIC.map((item, index) => ({
    ...item,
    id: `rubric-dim-${index + 1}-${Date.now()}`
  }));
}

// ============================================================================
// 3. SQLITE PERSISTENCE API FUNCTIONS (WITH LOCAL STORAGE MIRROR)
// ============================================================================

export async function fetchHackathonCriteriaFromSqlite(
  province: string = 'ส่วนกลาง'
): Promise<PilotHackathonCriteriaRecord | null> {
  try {
    const res = await fetch(`/api/activity/hackathon-criteria?province=${encodeURIComponent(province)}&_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok && data.data) {
        const row = data.data;
        const rawRubric = safeJsonParse<UniversalRubricDimension[]>(row.rubric_json, UNIVERSAL_DEFAULT_RUBRIC);
        const has4Pillars = rawRubric.some(d => ['challenge_fit', 'creative_nudge', 'actionability', 'expected_impact'].includes(d.virtueKey));
        const finalRubric = has4Pillars ? rawRubric : UNIVERSAL_DEFAULT_RUBRIC;
        const record: PilotHackathonCriteriaRecord = {
          id: row.id,
          province: row.province || province,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          sourceFiles: safeJsonParse<UploadedSourceFile[]>(row.source_files_json, []),
          aiAgentSkillText: row.ai_agent_skill_text || '',
          rubric: finalRubric,
          promptSkill: row.prompt_skill || DEFAULT_PROMPT_SKILL,
          promptRubric: row.prompt_rubric || DEFAULT_PROMPT_RUBRIC,
          isActive: row.is_active === 1
        };
        // Mirror to local storage
        localStorage.setItem(LOCAL_MIRROR_KEY, JSON.stringify(record));
        return record;
      }
    }
  } catch (err) {
    console.warn('SQLite fetchHackathonCriteria fallback to localStorage:', err);
  }

  // Fallback to localStorage mirror
  const localRaw = localStorage.getItem(LOCAL_MIRROR_KEY);
  if (localRaw) {
    const parsed = safeJsonParse<PilotHackathonCriteriaRecord | null>(localRaw, null);
    if (parsed && parsed.rubric) {
      const has4Pillars = parsed.rubric.some(d => ['challenge_fit', 'creative_nudge', 'actionability', 'expected_impact'].includes(d.virtueKey));
      if (!has4Pillars) {
        parsed.rubric = UNIVERSAL_DEFAULT_RUBRIC;
      }
    }
    return parsed;
  }

  return null;
}

export async function saveHackathonCriteriaToSqlite(
  record: Partial<PilotHackathonCriteriaRecord>
): Promise<{ ok: boolean; id: string; dbPath: string; updatedAt: string }> {
  const now = new Date().toISOString();
  const id = record.id || `crit-${Date.now()}`;
  const fullRecord: PilotHackathonCriteriaRecord = {
    id,
    province: record.province || 'ส่วนกลาง',
    createdAt: record.createdAt || now,
    updatedAt: now,
    sourceFiles: record.sourceFiles || [],
    aiAgentSkillText: record.aiAgentSkillText || synthesizeAiAgentSkillText(record.sourceFiles || []),
    rubric: record.rubric && record.rubric.length > 0 ? record.rubric : UNIVERSAL_DEFAULT_RUBRIC,
    promptSkill: record.promptSkill || DEFAULT_PROMPT_SKILL,
    promptRubric: record.promptRubric || DEFAULT_PROMPT_RUBRIC,
    isActive: true
  };

  // Always mirror in localStorage immediately for maximum UX speed
  localStorage.setItem(LOCAL_MIRROR_KEY, JSON.stringify(fullRecord));

  try {
    const res = await fetch('/api/activity/hackathon-criteria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        id: fullRecord.id,
        province: fullRecord.province,
        createdAt: fullRecord.createdAt,
        updatedAt: fullRecord.updatedAt,
        sourceFilesJson: JSON.stringify(fullRecord.sourceFiles),
        aiAgentSkillText: fullRecord.aiAgentSkillText,
        rubricJson: JSON.stringify(fullRecord.rubric),
        promptSkill: fullRecord.promptSkill,
        promptRubric: fullRecord.promptRubric
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        ok: true,
        id: fullRecord.id,
        dbPath: data.dbPath || 'PostgreSQL 16 (DB-MDC)',
        updatedAt: fullRecord.updatedAt
      };
    }
  } catch (err) {
    console.warn('PostgreSQL saveHackathonCriteria network warning:', err);
  }

  return {
    ok: false,
    id: fullRecord.id,
    dbPath: 'PostgreSQL 16 (DB-MDC) (Offline)',
    updatedAt: fullRecord.updatedAt
  };
}

export function resetToUniversalDefaultRubric(): UniversalRubricDimension[] {
  return JSON.parse(JSON.stringify(UNIVERSAL_DEFAULT_RUBRIC));
}

// ============================================================================
// 4. CRITERIA SELECTED VIRTUES PERSISTENCE (ADMIN POSTGRESQL DB-MDC STORAGE)
// ============================================================================

export async function fetchSelectedCriteriaVirtues(province: string, fallbackWeakness: string = 'พอเพียง'): Promise<string[]> {
  const defaultVirtues = (province === 'อยุธยา' || province === 'พระนครศรีอยุธยา' || province === 'ระยอง')
    ? ['พอเพียง', 'สุจริต']
    : [fallbackWeakness];
  try {
    const res = await fetch(`/api/activity/criteria-virtues?province=${encodeURIComponent(province)}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.virtues) && data.virtues.length > 0) {
        localStorage.setItem(`pilot_criteria_virtues_${province}`, JSON.stringify(data.virtues));
        return data.virtues;
      }
    }
  } catch (err) {
    console.warn('fetchSelectedCriteriaVirtues PostgreSQL fallback:', err);
  }

  // Fallback to localStorage
  const local = localStorage.getItem(`pilot_criteria_virtues_${province}`);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  return defaultVirtues;
}

export async function saveSelectedCriteriaVirtues(province: string, virtues: string[], fallbackWeakness: string = 'พอเพียง'): Promise<boolean> {
  const safeVirtues = Array.isArray(virtues) && virtues.length > 0
    ? virtues
    : [fallbackWeakness];

  // Cache in localStorage immediately
  localStorage.setItem(`pilot_criteria_virtues_${province}`, JSON.stringify(safeVirtues));

  try {
    const res = await fetch('/api/activity/criteria-virtues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ province, virtues: safeVirtues })
    });
    return res.ok;
  } catch (err) {
    console.warn('saveSelectedCriteriaVirtues PostgreSQL error:', err);
    return false;
  }
}

function safeJsonParse<T>(raw: any, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw as T;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
