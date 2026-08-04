// Thailand Districts & Subdistricts Geography Mapping Utility

export interface AreaItem {
  th: string;
  en: string;
}

// Major provinces detailed district lists
const detailedDistricts: Record<string, string[]> = {
  "กรุงเทพมหานคร": [
    "เขตปทุมวัน", "เขตดุสิต", "เขตพญาไท", "เขตบางรัก", "เขตวัฒนา", 
    "เขตคลองเตย", "เขตราชเทวี", "เขตสาทร", "เขตพระนคร", "เขตห้วยขวาง",
    "เขตดินแดง", "เขตจตุจักร", "เขตบางนา", "เขตประเวศ", "เขตสวนหลวง"
  ],
  "เชียงใหม่": [
    "อำเภอเมืองเชียงใหม่", "อำเภอแม่ริม", "อำเภอหางดง", "อำเภอสันทราย", 
    "อำเภอสันกำแพง", "อำเภอสารภี", "อำเภอจอมทอง", "อำเภอฝาง", 
    "อำเภอเชียงดาว", "อำเภอแม่แตง", "อำเภอพร้าว", "อำเภอสะเมิง"
  ],
  "ภูเก็ต": [
    "อำเภอเมืองภูเก็ต", "อำเภอกะทู้", "อำเภอถลาง"
  ],
  "ชลบุรี": [
    "อำเภอเมืองชลบุรี", "อำเภอบางละมุง", "อำเภอศรีราชา", "อำเภอสัตหีบ", 
    "อำเภอพานทอง", "อำเภอพนัสนิคม", "อำเภอบ้านบึง", "อำเภอเกาะสีชัง"
  ],
  "นครราชสีมา": [
    "อำเภอเมืองนครราชสีมา", "อำเภอปากช่อง", "อำเภอพิมาย", "อำเภอสีคิ้ว", 
    "อำเภอปักธงชัย", "อำเภอสูงเนิน", "อำเภอโชคชัย", "อำเภอจักราช"
  ],
  "ขอนแก่น": [
    "อำเภอสีชมพู", "อำเภอหนองนาคำ", "อำเภออุบลรัตน์", "อำเภอเขาสวนกวาง", "อำเภอน้ำพอง", "อำเภอกระนวน",
    "อำเภอภูผาม่าน", "อำเภอชุมแพ", "อำเภอภูเวียง", "อำเภอเวียงเก่า", "อำเภอหนองเรือ", "อำเภอบ้านฝาง", "อำเภอซำสูง",
    "อำเภอเมืองขอนแก่น", "อำเภอพระยืน", "อำเภอมัญจาคีรี", "อำเภอบ้านแฮด", "อำเภอชนบท", "อำเภอบ้านไผ่",
    "อำเภอโคกโพธิ์ไชย", "อำเภอโนนศิลา", "อำเภอเปือยน้อย", "อำเภอแวงใหญ่", "อำเภอแวงน้อย", "อำเภอพล", "อำเภอหนองสองห้อง"
  ]
};

// Detailed subdistricts mapping for major districts
const detailedSubdistricts: Record<string, string[]> = {
  "เขตปทุมวัน": ["แขวงปทุมวัน", "แขวงวังใหม่", "แขวงลุมพินี", "แขวงรองเมือง"],
  "เขตดุสิต": ["แขวงดุสิต", "แขวงวชิรพยาบาล", "แขวงสวนจิตรลดา", "แขวงถนนนครไชยศรี"],
  "เขตพญาไท": ["แขวงสามเสนใน", "แขวงพญาไท"],
  "เขตบางรัก": ["แขวงบางรัก", "แขวงสุริยวงศ์", "แขวงสีลม", "แขวงสี่พระยา", "แขวงมหาพฤฒาราม"],
  "เขตวัฒนา": ["แขวงคลองเตยเหนือ", "แขวงคลองตันเหนือ", "แขวงพระโขนงเหนือ"],
  "เขตคลองเตย": ["แขวงคลองเตย", "แขวงคลองตัน", "แขวงพระโขนง"],
  "อำเภอเมืองเชียงใหม่": ["ตำบลศรีภูมิ", "ตำบลพระสิงห์", "ตำบลหายยา", "ตำบลช้างคลาน", "ตำบลวัดเกต", "ตำบลช้างเผือก", "ตำบลสุเทพ", "ตำบลแม่เหียะ"],
  "อำเภอแม่ริม": ["ตำบลแม่ริม", "ตำบลห้วยทราย", "ตำบลแม่สา", "ตำบลดอนแก้ว", "ตำบลโป่งแยง"],
  "อำเภอกะทู้": ["ตำบลกะทู้", "ตำบลป่าตอง", "ตำบลกมลา"],
  "อำเภอเมืองภูเก็ต": ["ตำบลตลาดใหญ่", "ตำบลตลาดเหนือ", "ตำบลเกาะแก้ว", "ตำบลรัษฎา", "ตำบลวิชิต", "ตำบลฉลอง", "ตำบลราไวย์"],
  "อำเภอบางละมุง": ["ตำบลบางละมุง", "ตำบลหนองปรือ", "ตำบลโป่ง", "ตำบลห้วยใหญ่", "ตำบลนาเกลือ"],
  "อำเภอศรีราชา": ["ตำบลศรีราชา", "ตำบลสุรศักดิ์", "ตำบลทุ่งสุขลา", "ตำบลบึง", "ตำบลหนองขาม"]
};

// Seeded pseudo-random generator based on a string seed
export function getStringHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Generate realistic districts for any province procedurally
export function getDistrictsForProvince(provinceName: string): string[] {
  if (detailedDistricts[provinceName]) {
    return detailedDistricts[provinceName];
  }

  const hash = getStringHashCode(provinceName);
  const districtCount = 5 + (hash % 10); // Between 5 and 14 districts
  
  const prefixes = ["อำเภอเมือง", "อำเภอบาง", "อำเภอหนอง", "อำเภอบ้าน", "อำเภอศรี", "อำเภอโพธิ์", "อำเภอคลอง", "อำเภอปาก", "อำเภอควน", "อำเภอท่า", "อำเภอเนิน"];
  const suffixes = ["ทอง", "ใหญ่", "พัฒนา", "ชัย", "รัตน", "เจริญ", "งาม", "สวรรค์", "แก้ว", "ดี", "ใหม่", "บุรี", "ราช", "นา", "น้ำ"];

  const list: string[] = [];
  
  // Always include the central district
  list.push(`อำเภอเมือง${provinceName.replace(/อำเภอ|จังหวัด/g, "")}`);

  for (let i = 1; i < districtCount; i++) {
    const prefIdx = (hash + i * 7) % prefixes.length;
    const suffIdx = (hash + i * 13) % suffixes.length;
    const prefix = prefixes[prefIdx];
    
    // Adjust prefixes that shouldn't double with "เมือง"
    let name = "";
    if (prefix === "อำเภอเมือง") {
      name = `อำเภอเมืองน้อย-${i}`;
    } else {
      name = prefix + suffixes[suffIdx];
    }
    
    if (!list.includes(name)) {
      list.push(name);
    }
  }

  return list;
}

// Generate realistic subdistricts for any district procedurally
export function getSubdistrictsForDistrict(districtName: string): string[] {
  if (detailedSubdistricts[districtName]) {
    return detailedSubdistricts[districtName];
  }

  const hash = getStringHashCode(districtName);
  const subdistrictCount = 4 + (hash % 6); // Between 4 and 9 subdistricts
  const isBangkok = districtName.startsWith("เขต");
  const prefix = isBangkok ? "แขวง" : "ตำบล";

  const prefixes = ["บาง", "หนอง", "โคก", "ดอน", "ทุ่ง", "ท่า", "นา", "สัน", "ห้วย", "ป่า", "เนิน"];
  const suffixes = ["แก้ว", "พลอย", "ทอง", "ไผ่", "ยาง", "ยาว", "สวรรค์", "น้อย", "ใหญ่", "ใหม่", "งาม", "ชัย"];

  const list: string[] = [];

  for (let i = 0; i < subdistrictCount; i++) {
    const prefIdx = (hash + i * 9) % prefixes.length;
    const suffIdx = (hash + i * 17) % suffixes.length;
    const name = prefix + prefixes[prefIdx] + suffixes[suffIdx];
    
    if (!list.includes(name)) {
      list.push(name);
    }
  }

  return list;
}

// Generate realistic villages for any subdistrict procedurally
export function getVillagesForSubdistrict(subdistrictName: string): string[] {
  const hash = getStringHashCode(subdistrictName);
  const villageCount = 3 + (hash % 5); // Between 3 and 7 villages
  
  const prefixes = ["บ้านหนอง", "บ้านดอน", "บ้านคลอง", "บ้านทุ่ง", "บ้านโคก", "บ้านนา", "บ้านสัน", "บ้านป่า"];
  const suffixes = ["แดง", "ใหญ่", "น้อย", "ยาว", "ขาม", "ม่วง", "ทอง", "ไทร", "พัฒนา", "เหนือ", "ใต้"];

  const list: string[] = [];

  for (let i = 0; i < villageCount; i++) {
    const prefIdx = (hash + i * 11) % prefixes.length;
    const suffIdx = (hash + i * 19) % suffixes.length;
    
    // Sometimes use just "หมู่ที่ X"
    if ((hash + i) % 4 === 0) {
      list.push(`หมู่ที่ ${i + 1} ${prefixes[prefIdx]}${suffixes[suffIdx]}`);
    } else {
      const name = prefixes[prefIdx] + suffixes[suffIdx];
      if (!list.includes(name)) {
        list.push(name);
      } else {
        list.push(`${name} หมู่ ${i + 1}`);
      }
    }
  }

  return list;
}

// 6-Region Classification of Thailand
export const REGION_NAMES = {
  northern: "ภาคเหนือ",
  central: "ภาคกลาง",
  northeastern: "ภาคตะวันออกเฉียงเหนือ",
  eastern: "ภาคตะวันออก",
  western: "ภาคตะวันตก",
  southern: "ภาคใต้"
};

export type RegionKey = keyof typeof REGION_NAMES;

export const PROVINCE_TO_REGION: Record<string, RegionKey> = {
  // Northern (9)
  "เชียงใหม่": "northern", "เชียงราย": "northern", "ลำปาง": "northern", "ลำพูน": "northern", 
  "แม่ฮ่องสอน": "northern", "น่าน": "northern", "พะเยา": "northern", "แพร่": "northern", "อุตรดิตถ์": "northern",
  
  // Central (22)
  "กรุงเทพมหานคร": "central", "อ่างทอง": "central", "พระนครศรีอยุธยา": "central", "ชัยนาท": "central", 
  "กำแพงเพชร": "central", "ลพบุรี": "central", "นครนายก": "central", "นครปฐม": "central", 
  "นครสวรรค์": "central", "นนทบุรี": "central", "ปทุมธานี": "central", "เพชรบูรณ์": "central", 
  "พิจิตร": "central", "พิษณุโลก": "central", "สมุทรปราการ": "central", "สมุทรสาคร": "central", 
  "สมุทรสงคราม": "central", "สระบุรี": "central", "สิงห์บุรี": "central", "สุพรรณบุรี": "central", 
  "สุโขทัย": "central", "อุทัยธานี": "central",

  // Northeastern (20)
  "อำนาจเจริญ": "northeastern", "บึงกาฬ": "northeastern", "บุรีรัมย์": "northeastern", "ชัยภูมิ": "northeastern", 
  "กาฬสินธุ์": "northeastern", "ขอนแก่น": "northeastern", "เลย": "northeastern", "มหาสารคาม": "northeastern", 
  "มุกดาหาร": "northeastern", "นครพนม": "northeastern", "นครราชสีมา": "northeastern", "หนองบัวลำภู": "northeastern", 
  "หนองคาย": "northeastern", "ร้อยเอ็ด": "northeastern", "สกลนคร": "northeastern", "ศรีสะเกษ": "northeastern", 
  "สุรินทร์": "northeastern", "อุบลราชธานี": "northeastern", "อุดรธานี": "northeastern", "ยโสธร": "northeastern",

  // Eastern (7)
  "ฉะเชิงเทรา": "eastern", "จันทบุรี": "eastern", "ชลบุรี": "eastern", "ปราจีนบุรี": "eastern", 
  "ระยอง": "eastern", "สระแก้ว": "eastern", "ตราด": "eastern",

  // Western (5)
  "กาญจนบุรี": "western", "เพชรบุรี": "western", "ประจวบคีรีขันธ์": "western", "ราชบุรี": "western", "ตาก": "western",

  // Southern (14)
  "ชุมพร": "southern", "กระบี่": "southern", "นครศรีธรรมราช": "southern", "นราธิวาส": "southern", 
  "ปัตตานี": "southern", "พังงา": "southern", "พัทลุง": "southern", "ภูเก็ต": "southern", 
  "ระนอง": "southern", "สตูล": "southern", "สงขลา": "southern", "สุราษฎร์ธานี": "southern", 
  "ตรัง": "southern", "ยะลา": "southern"
};
