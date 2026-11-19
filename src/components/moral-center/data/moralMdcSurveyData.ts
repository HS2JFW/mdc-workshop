/**
 * Authentic MDC Survey Dataset (พ.ศ. 2565 - 2568)
 * Sourced directly from Moral Data Center (ศูนย์กลางข้อมูลสารสนเทศด้านคุณธรรม)
 * https://mdc.moralcenter.or.th/
 * Research by: Assoc. Prof. Suriyadeo Tripathi, M.D. (รศ.นพ.สุริยเดว ทรีปาตี)
 * 100% Arabic Numerals (0-9)
 */

export type MdcSurveyYear = '2565' | '2566' | '2567' | '2568';

export interface MdcGenderSummary {
  male: number;      // %
  female: number;    // %
  lgbtq: number;     // %
  total: number;
}

export interface MdcAgeSummary {
  age13_24: number;  // % (13-24 ปี)
  age25_40: number;  // % (25-40 ปี)
  age41plus: number; // % (41 ปีขึ้นไป)
  total: number;
}

export interface MoralBehaviorSummary {
  year: MdcSurveyYear;
  totalSurvey: number;
  overallScore: number;       // scale 1-5 (e.g. 4.36)
  overallPercentage: number;  // scale 0-100 (e.g. 87.2)
  dimensions: {
    gratitude: number;             // กตัญญู
    publicConsciousness: number;   // จิตสาธารณะ/จิตอาสา
    responsibility: number;        // วินัยรับผิดชอบ
    honesty: number;               // สุจริต
    sufficiency: number;           // พอเพียง
  };
  gender: MdcGenderSummary;
  age: MdcAgeSummary;
  regions: Record<string, {
    key: string;
    name: string;
    score: number;
    scorePct: number;
    color: string;
    tier: string;
    provinceCount: number;
  }>;
}

export interface MoralLifeSummary {
  year: MdcSurveyYear;
  totalSurvey: number;
  overallScore: number;       // scale 0-100 (e.g. 78.52)
  tier: string;               // ระดับดีมาก, ระดับดี, ระดับพอใช้
  pillars: {
    identity: number;        // พลังตัวตน
    family: number;          // พลังครอบครัว
    talent: number;          // พลังสร้างปัญญา
    organization: number;    // พลังที่ทำงาน/สถานศึกษา
    friend: number;          // พลังเพื่อนและกิจกรรม
    community: number;       // พลังชุมชน
  };
  gender: MdcGenderSummary;
  age: MdcAgeSummary;
  demographics?: {
    genderCounts: { male: number; female: number; lgbtq: number; unspecified?: number };
    ageCounts: { age13_24: number; age25_40: number; age41plus: number };
    regionCounts: Record<string, { count: number; pct: number }>;
  };
  regions: Record<string, {
    key: string;
    name: string;
    score: number;
    scorePct?: number;
    color: string;
    tier: string;
    provinceCount: number;
    respondents?: number;
    respondentsPct?: number;
  }>;
}

export interface MoralTierInfo {
  tier: string;
  color: string;
  hoverColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  textColor: string;
  emotion?: 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';
}

/**
 * เกณฑ์การแปลระดับคะแนนมาตรฐานศูนย์คุณธรรม (องค์การมหาชน) เต็ม 6.00 คะแนน
 * 1. ระดับมากที่สุด (Excellent): มากกว่า 5.41 -> สีน้ำเงิน (#2563eb) 😄
 * 2. ระดับมาก (Good): 4.86 – 5.41 -> สีเขียว (#16a34a) 🙂
 * 3. ระดับพอใช้ (Moderate): 4.30 – 4.85 -> สีเหลืองทอง/ส้ม (#f59e0b) 😐
 * 4. ระดับน้อย (Low): 3.75 – 4.29 -> สีแดง (#ef4444) ☹️
 * 5. ระดับควรปรับปรุง (Very Low): น้อยกว่าหรือเท่ากับ 3.74 -> สีแดงเข้ม (#991b1b) 😢
 */
export const getMoralTierInfo = (score: number): MoralTierInfo => {
  if (score > 5.41) {
    return {
      tier: 'ระดับมากที่สุด',
      color: '#92c784', // เขียว (คะแนนสูงสุด)
      hoverColor: '#7cb342',
      badgeBg: '#f0fdf4',
      badgeText: '#15803d',
      badgeBorder: '#bbf7d0',
      textColor: '#15803d',
      emotion: 'very-happy'
    };
  }
  if (score >= 4.86) {
    return {
      tier: 'ระดับมาก',
      color: '#facc15', // เหลือง
      hoverColor: '#eab308',
      badgeBg: '#fefce8',
      badgeText: '#a16207',
      badgeBorder: '#fef08a',
      textColor: '#a16207',
      emotion: 'happy'
    };
  }
  if (score >= 4.30) {
    return {
      tier: 'ระดับพอใช้',
      color: '#edb75f', // ส้ม
      hoverColor: '#f59e0b',
      badgeBg: '#fffbeb',
      badgeText: '#b45309',
      badgeBorder: '#fde68a',
      textColor: '#b45309',
      emotion: 'neutral'
    };
  }
  if (score >= 3.75) {
    return {
      tier: 'ระดับน้อย',
      color: '#e57f6a', // ส้มแดง
      hoverColor: '#ef4444',
      badgeBg: '#fff1f2',
      badgeText: '#be123c',
      badgeBorder: '#fecdd3',
      textColor: '#be123c',
      emotion: 'sad'
    };
  }
  return {
    tier: 'ระดับควรปรับปรุง',
    color: '#ae7bb7', // ม่วง (คะแนนต่ำสุด)
    hoverColor: '#9333ea',
    badgeBg: '#faf5ff',
    badgeText: '#7e22ce',
    badgeBorder: '#e9d5ff',
    textColor: '#7e22ce',
    emotion: 'very-sad'
  };
};

/**
 * เกณฑ์คะแนนทุนชีวิต (MDC) 4 ระดับ (สีซีดลง 20% สไตล์ Soft Matte / Pastel)
 * 80.00 คะแนนขึ้นไป (ระดับดีมาก) -> น้ำเงิน (#5082ef)
 * 70.00 - 79.99 คะแนน (ระดับดี) -> สีเขียว (#44b56e)
 * 60.00 - 69.99 คะแนน (ระดับพอใช้) -> สีส้ม (#ee793d)
 * ต่ำกว่า 60.00 คะแนน (ปรับปรุง) -> สีแดง (#e35151)
 */
export const getLifeTierInfo = (score: number): MoralTierInfo => {
  if (score >= 80.00) {
    return {
      tier: 'ระดับดีมาก',
      color: '#92c784', // เขียว (คะแนนสูงสุด)
      hoverColor: '#7cb342',
      badgeBg: '#f0fdf4',
      badgeText: '#15803d',
      badgeBorder: '#bbf7d0',
      textColor: '#15803d',
      emotion: 'very-happy'
    };
  }
  if (score >= 70.00) {
    return {
      tier: 'ระดับดี',
      color: '#facc15', // เหลือง
      hoverColor: '#eab308',
      badgeBg: '#fefce8',
      badgeText: '#a16207',
      badgeBorder: '#fef08a',
      textColor: '#a16207',
      emotion: 'happy'
    };
  }
  if (score >= 60.00) {
    return {
      tier: 'ระดับพอใช้',
      color: '#edb75f', // ส้ม
      hoverColor: '#f59e0b',
      badgeBg: '#fffbeb',
      badgeText: '#b45309',
      badgeBorder: '#fde68a',
      textColor: '#b45309',
      emotion: 'neutral'
    };
  }
  return {
    tier: 'ระดับควรปรับปรุง',
    color: '#ae7bb7', // ม่วง (คะแนนต่ำสุด)
    hoverColor: '#9333ea',
    badgeBg: '#faf5ff',
    badgeText: '#7e22ce',
    badgeBorder: '#e9d5ff',
    textColor: '#7e22ce',
    emotion: 'very-sad'
  };
};

export const REGION_NAMES_TH: Record<string, string> = {
  North: 'ภาคเหนือ',
  Northeast: 'ภาคตะวันออกเฉียงเหนือ',
  Central: 'ภาคกลาง',
  South: 'ภาคใต้',
  East: 'ภาคตะวันออก',
  West: 'ภาคตะวันตก',
};

export const REGION_PROVINCE_COUNTS: Record<string, number> = {
  North: 9,
  Northeast: 20,
  Central: 22,
  South: 14,
  East: 7,
  West: 5,
};

export const MDC_MORAL_BEHAVIOR_DATA: Record<MdcSurveyYear, MoralBehaviorSummary> = {
  '2565': {
    year: '2565',
    totalSurvey: 15720,
    overallScore: 4.56,
    overallPercentage: 91.2,
    dimensions: {
      gratitude: 4.98,
      publicConsciousness: 4.58,
      responsibility: 4.47,
      honesty: 4.41,
      sufficiency: 4.38,
    },
    gender: { male: 38.92, female: 53.76, lgbtq: 7.32, total: 100 },
    age: { age13_24: 40.3, age25_40: 32.9, age41plus: 26.8, total: 100 },
    regions: {
      North: { key: 'North', name: 'ภาคเหนือ', score: 4.53, scorePct: 75.5, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 9 },
      Northeast: { key: 'Northeast', name: 'ภาคตะวันออกเฉียงเหนือ', score: 4.51, scorePct: 75.2, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 20 },
      Central: { key: 'Central', name: 'ภาคกลาง', score: 4.57, scorePct: 76.2, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 22 },
      East: { key: 'East', name: 'ภาคตะวันออก', score: 4.67, scorePct: 77.8, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 7 },
      West: { key: 'West', name: 'ภาคตะวันตก', score: 4.54, scorePct: 75.7, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 5 },
      South: { key: 'South', name: 'ภาคใต้', score: 4.62, scorePct: 77.0, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 14 },
    },
  },
  '2566': {
    year: '2566',
    totalSurvey: 30269,
    overallScore: 4.73,
    overallPercentage: 94.6,
    dimensions: {
      gratitude: 4.88,
      publicConsciousness: 4.76,
      responsibility: 4.61,
      honesty: 4.6,
      sufficiency: 4.59,
    },
    gender: { male: 39.59, female: 53.52, lgbtq: 6.82, total: 100 },
    age: { age13_24: 44.07, age25_40: 29.47, age41plus: 26.47, total: 100 },
    regions: {
      North: { key: 'North', name: 'ภาคเหนือ', score: 4.70, scorePct: 78.3, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 9 },
      Northeast: { key: 'Northeast', name: 'ภาคตะวันออกเฉียงเหนือ', score: 4.94, scorePct: 82.3, color: '#16a34a', tier: 'ระดับมาก', provinceCount: 20 },
      Central: { key: 'Central', name: 'ภาคกลาง', score: 4.60, scorePct: 76.7, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 22 },
      East: { key: 'East', name: 'ภาคตะวันออก', score: 4.69, scorePct: 78.2, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 7 },
      West: { key: 'West', name: 'ภาคตะวันตก', score: 4.68, scorePct: 78.0, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 5 },
      South: { key: 'South', name: 'ภาคใต้', score: 4.71, scorePct: 78.5, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 14 },
    },
  },
  '2567': {
    year: '2567',
    totalSurvey: 29432,
    overallScore: 4.32,
    overallPercentage: 86.4,
    dimensions: {
      gratitude: 4.64,
      publicConsciousness: 4.35,
      responsibility: 4.27,
      honesty: 4.19,
      sufficiency: 4.17,
    },
    gender: { male: 39.76, female: 51.73, lgbtq: 8.51, total: 100 },
    age: { age13_24: 39.01, age25_40: 29.68, age41plus: 31.31, total: 100 },
    regions: {
      North: { key: 'North', name: 'ภาคเหนือ', score: 4.14, scorePct: 69.0, color: '#ef4444', tier: 'ระดับน้อย', provinceCount: 9 },
      Northeast: { key: 'Northeast', name: 'ภาคตะวันออกเฉียงเหนือ', score: 4.41, scorePct: 73.5, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 20 },
      Central: { key: 'Central', name: 'ภาคกลาง', score: 4.40, scorePct: 73.3, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 22 },
      East: { key: 'East', name: 'ภาคตะวันออก', score: 4.30, scorePct: 71.7, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 7 },
      West: { key: 'West', name: 'ภาคตะวันตก', score: 4.36, scorePct: 72.7, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 5 },
      South: { key: 'South', name: 'ภาคใต้', score: 4.29, scorePct: 71.5, color: '#ef4444', tier: 'ระดับน้อย', provinceCount: 14 },
    },
  },
  '2568': {
    year: '2568',
    totalSurvey: 33032,
    overallScore: 4.36,
    overallPercentage: 87.2,
    dimensions: {
      gratitude: 4.62,
      publicConsciousness: 4.4,
      responsibility: 4.33,
      honesty: 4.22,
      sufficiency: 4.22,
    },
    gender: { male: 43.09, female: 49.03, lgbtq: 7.88, total: 100 },
    age: { age13_24: 34.78, age25_40: 34.55, age41plus: 30.68, total: 100 },
    regions: {
      North: { key: 'North', name: 'ภาคเหนือ', score: 4.06, scorePct: 67.7, color: '#ef4444', tier: 'ระดับน้อย', provinceCount: 9 },
      Northeast: { key: 'Northeast', name: 'ภาคตะวันออกเฉียงเหนือ', score: 4.42, scorePct: 73.7, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 20 },
      Central: { key: 'Central', name: 'ภาคกลาง', score: 4.47, scorePct: 74.5, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 22 },
      East: { key: 'East', name: 'ภาคตะวันออก', score: 4.43, scorePct: 73.8, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 7 },
      West: { key: 'West', name: 'ภาคตะวันตก', score: 4.41, scorePct: 73.5, color: '#f59e0b', tier: 'ระดับพอใช้', provinceCount: 5 },
      South: { key: 'South', name: 'ภาคใต้', score: 4.25, scorePct: 70.8, color: '#ef4444', tier: 'ระดับน้อย', provinceCount: 14 },
    },
  },
};

export const MDC_MORAL_LIFE_DATA: Record<MdcSurveyYear, MoralLifeSummary> = {
  '2565': {
    year: '2565',
    totalSurvey: 15720,
    overallScore: 78.08,
    tier: 'ระดับดี',
    pillars: {
      identity: 81.86,
      family: 81.92,
      talent: 77.06,
      organization: 77.06,
      friend: 77.37,
      community: 72.17,
    },
    gender: { male: 38.92, female: 53.76, lgbtq: 7.32, total: 100 },
    age: { age13_24: 40.30, age25_40: 32.90, age41plus: 26.80, total: 100 },
    demographics: {
      genderCounts: { male: 6118, female: 8451, lgbtq: 1151 },
      ageCounts: { age13_24: 6335, age25_40: 5172, age41plus: 4213 },
      regionCounts: {
        Central: { count: 4156, pct: 26.44 },
        Northeast: { count: 4288, pct: 27.28 },
        South: { count: 2892, pct: 18.40 },
        North: { count: 1806, pct: 11.49 },
        East: { count: 1405, pct: 8.94 },
        West: { count: 1173, pct: 7.46 }
      }
    },
    regions: {
      North: { key: 'North', name: 'ภาคเหนือ', score: 76.83, tier: 'ระดับดี', color: '#44b56e', provinceCount: 9, respondents: 1806, respondentsPct: 11.49 },
      Northeast: { key: 'Northeast', name: 'ภาคตะวันออกเฉียงเหนือ', score: 77.31, tier: 'ระดับดี', color: '#44b56e', provinceCount: 20, respondents: 4288, respondentsPct: 27.28 },
      Central: { key: 'Central', name: 'ภาคกลาง', score: 78.26, tier: 'ระดับดี', color: '#44b56e', provinceCount: 22, respondents: 4156, respondentsPct: 26.44 },
      East: { key: 'East', name: 'ภาคตะวันออก', score: 79.29, tier: 'ระดับดี', color: '#44b56e', provinceCount: 7, respondents: 1405, respondentsPct: 8.94 },
      West: { key: 'West', name: 'ภาคตะวันตก', score: 78.18, tier: 'ระดับดี', color: '#44b56e', provinceCount: 5, respondents: 1173, respondentsPct: 7.46 },
      South: { key: 'South', name: 'ภาคใต้', score: 79.11, tier: 'ระดับดี', color: '#44b56e', provinceCount: 14, respondents: 2892, respondentsPct: 18.40 },
    },
  },
  '2566': {
    year: '2566',
    totalSurvey: 30269,
    overallScore: 83.80,
    tier: 'ระดับดีมาก',
    pillars: {
      identity: 86.63,
      family: 85.94,
      talent: 83.47,
      organization: 83.47,
      friend: 82.97,
      community: 80.02,
    },
    gender: { male: 39.59, female: 53.52, lgbtq: 6.82, total: 100 },
    age: { age13_24: 44.07, age25_40: 29.47, age41plus: 26.47, total: 100 },
    demographics: {
      genderCounts: { male: 11983, female: 16199, lgbtq: 2063, unspecified: 24 },
      ageCounts: { age13_24: 13339, age25_40: 8919, age41plus: 8011 },
      regionCounts: {
        Central: { count: 7464, pct: 24.66 },
        Northeast: { count: 7469, pct: 24.68 },
        South: { count: 6707, pct: 22.16 },
        North: { count: 2833, pct: 9.36 },
        East: { count: 2524, pct: 8.34 },
        West: { count: 3272, pct: 10.81 }
      }
    },
    regions: {
      North: { key: 'North', name: 'ภาคเหนือ', score: 86.83, tier: 'ระดับดีมาก', color: '#5082ef', provinceCount: 9, respondents: 2833, respondentsPct: 9.36 },
      Northeast: { key: 'Northeast', name: 'ภาคตะวันออกเฉียงเหนือ', score: 82.32, tier: 'ระดับดีมาก', color: '#5082ef', provinceCount: 20, respondents: 7469, respondentsPct: 24.68 },
      Central: { key: 'Central', name: 'ภาคกลาง', score: 79.39, tier: 'ระดับดี', color: '#44b56e', provinceCount: 22, respondents: 7464, respondentsPct: 24.66 },
      East: { key: 'East', name: 'ภาคตะวันออก', score: 79.34, tier: 'ระดับดี', color: '#44b56e', provinceCount: 7, respondents: 2524, respondentsPct: 8.34 },
      West: { key: 'West', name: 'ภาคตะวันตก', score: 78.39, tier: 'ระดับดี', color: '#44b56e', provinceCount: 5, respondents: 3272, respondentsPct: 10.81 },
      South: { key: 'South', name: 'ภาคใต้', score: 80.48, tier: 'ระดับดีมาก', color: '#5082ef', provinceCount: 14, respondents: 6707, respondentsPct: 22.16 },
    },
  },
  '2567': {
    year: '2567',
    totalSurvey: 29432,
    overallScore: 77.57,
    tier: 'ระดับดี',
    pillars: {
      identity: 79.84,
      family: 79.10,
      talent: 77.22,
      organization: 77.22,
      friend: 76.83,
      community: 74.84,
    },
    gender: { male: 39.76, female: 51.73, lgbtq: 8.51, total: 100 },
    age: { age13_24: 39.01, age25_40: 29.68, age41plus: 31.31, total: 100 },
    demographics: {
      genderCounts: { male: 11702, female: 15225, lgbtq: 2505 },
      ageCounts: { age13_24: 11482, age25_40: 8736, age41plus: 9214 },
      regionCounts: {
        Central: { count: 7765, pct: 26.38 },
        Northeast: { count: 4881, pct: 16.58 },
        South: { count: 5542, pct: 18.83 },
        North: { count: 4625, pct: 15.71 },
        East: { count: 3185, pct: 10.82 },
        West: { count: 3434, pct: 11.67 }
      }
    },
    regions: {
      North: { key: 'North', name: 'ภาคเหนือ', score: 78.80, tier: 'ระดับดี', color: '#44b56e', provinceCount: 9, respondents: 4625, respondentsPct: 15.71 },
      Northeast: { key: 'Northeast', name: 'ภาคตะวันออกเฉียงเหนือ', score: 76.76, tier: 'ระดับดี', color: '#44b56e', provinceCount: 20, respondents: 4881, respondentsPct: 16.58 },
      Central: { key: 'Central', name: 'ภาคกลาง', score: 77.87, tier: 'ระดับดี', color: '#44b56e', provinceCount: 22, respondents: 7765, respondentsPct: 26.38 },
      East: { key: 'East', name: 'ภาคตะวันออก', score: 77.62, tier: 'ระดับดี', color: '#44b56e', provinceCount: 7, respondents: 3185, respondentsPct: 10.82 },
      West: { key: 'West', name: 'ภาคตะวันตก', score: 76.06, tier: 'ระดับดี', color: '#44b56e', provinceCount: 5, respondents: 3434, respondentsPct: 11.67 },
      South: { key: 'South', name: 'ภาคใต้', score: 78.12, tier: 'ระดับดี', color: '#44b56e', provinceCount: 14, respondents: 5542, respondentsPct: 18.83 },
    },
  },
  '2568': {
    year: '2568',
    totalSurvey: 33032,
    overallScore: 78.52,
    tier: 'ระดับดี',
    pillars: {
      identity: 79.93,
      family: 79.17,
      talent: 78.88,
      organization: 78.88,
      friend: 77.44,
      community: 77.39,
    },
    gender: { male: 43.09, female: 49.03, lgbtq: 7.88, total: 100 },
    age: { age13_24: 34.78, age25_40: 34.55, age41plus: 30.68, total: 100 },
    demographics: {
      genderCounts: { male: 14233, female: 16197, lgbtq: 2602 },
      ageCounts: { age13_24: 11488, age25_40: 11411, age41plus: 10133 },
      regionCounts: {
        Central: { count: 9254, pct: 28.02 },
        Northeast: { count: 7054, pct: 21.36 },
        South: { count: 5572, pct: 16.87 },
        North: { count: 4686, pct: 14.19 },
        East: { count: 3861, pct: 11.69 },
        West: { count: 2605, pct: 7.89 }
      }
    },
    regions: {
      North: { key: 'North', name: 'ภาคเหนือ', score: 79.84, tier: 'ระดับดี', color: '#44b56e', provinceCount: 9, respondents: 4686, respondentsPct: 14.19 },
      Northeast: { key: 'Northeast', name: 'ภาคตะวันออกเฉียงเหนือ', score: 77.12, tier: 'ระดับดี', color: '#44b56e', provinceCount: 20, respondents: 7054, respondentsPct: 21.36 },
      Central: { key: 'Central', name: 'ภาคกลาง', score: 79.33, tier: 'ระดับดี', color: '#44b56e', provinceCount: 22, respondents: 9254, respondentsPct: 28.02 },
      East: { key: 'East', name: 'ภาคตะวันออก', score: 78.83, tier: 'ระดับดี', color: '#44b56e', provinceCount: 7, respondents: 3861, respondentsPct: 11.69 },
      West: { key: 'West', name: 'ภาคตะวันตก', score: 77.08, tier: 'ระดับดี', color: '#44b56e', provinceCount: 5, respondents: 2605, respondentsPct: 7.89 },
      South: { key: 'South', name: 'ภาคใต้', score: 79.13, tier: 'ระดับดี', color: '#44b56e', provinceCount: 14, respondents: 5572, respondentsPct: 16.87 },
    },
  },
};

// Multi-Year Overview Trend (2565 - 2568)
export const MDC_MULTI_YEAR_OVERVIEW = [
  {
    year: '2565',
    adYear: '2022',
    respondents: 15720,
    moralScore: 4.56,
    moralPct: 91.2,
    lifeScore: 78.08,
    female: 53.76,
    male: 38.92,
    lgbtq: 7.32,
    youth: 40.30,
    adult: 32.90,
    senior: 26.80
  },
  {
    year: '2566',
    adYear: '2023',
    respondents: 30269,
    moralScore: 4.73,
    moralPct: 94.6,
    lifeScore: 83.80,
    female: 53.52,
    male: 39.59,
    lgbtq: 6.82,
    youth: 44.07,
    adult: 29.47,
    senior: 26.47
  },
  {
    year: '2567',
    adYear: '2024',
    respondents: 29432,
    moralScore: 4.32,
    moralPct: 86.4,
    lifeScore: 77.57,
    female: 51.73,
    male: 39.76,
    lgbtq: 8.51,
    youth: 39.01,
    adult: 29.68,
    senior: 31.31
  },
  {
    year: '2568',
    adYear: '2025',
    respondents: 33032,
    moralScore: 4.36,
    moralPct: 87.2,
    lifeScore: 78.52,
    female: 49.03,
    male: 43.09,
    lgbtq: 7.88,
    youth: 34.78,
    adult: 34.55,
    senior: 30.68
  }
];

// Region ID to MDC Region Key mapping
export const PROVINCE_TO_MDC_REGION: Record<string, string> = {
  // North
  cmi: 'North', cri: 'North', msn: 'North', lpn: 'North', lpg: 'North', pyo: 'North', pre: 'North', nan: 'North', utd: 'North',
  // Northeast
  nma: 'Northeast', brm: 'Northeast', srn: 'Northeast', ssk: 'Northeast', ubn: 'Northeast', yst: 'Northeast', cpm: 'Northeast',
  acr: 'Northeast', bkn: 'Northeast', nbp: 'Northeast', kkn: 'Northeast', udn: 'Northeast', lei: 'Northeast', nki: 'Northeast',
  mkm: 'Northeast', ret: 'Northeast', ksn: 'Northeast', snk: 'Northeast', npm: 'Northeast', mdh: 'Northeast',
  // Central
  bkk: 'Central', spk: 'Central', nbi: 'Central', pte: 'Central', aya: 'Central', atg: 'Central', lri: 'Central', sbr: 'Central',
  cnt: 'Central', sri: 'Central', nyk: 'Central', nsn: 'Central', uti: 'Central', kpt: 'Central', sti: 'Central', plk: 'Central',
  pct: 'Central', pnb: 'Central', spb: 'Central', npt: 'Central', skn: 'Central', skm: 'Central',
  // East
  cbi: 'East', ryg: 'East', cti: 'East', trt: 'East', cco: 'East', pri: 'East', skw: 'East',
  // West
  tak: 'West', kri: 'West', rbr: 'West', pbi: 'West', pkn: 'West',
  // South
  cpn: 'South', rng: 'South', sni: 'South', pna: 'South', pkt: 'South', kbi: 'South', nrt: 'South', trg: 'South', plg: 'South',
  stn: 'South', ska: 'South', ptn: 'South', yla: 'South', nwt: 'South', lksg: 'South'
};

export const getMdcRegionKey = (provId?: string | null): string => {
  if (!provId) return 'Central';
  return PROVINCE_TO_MDC_REGION[provId.toLowerCase()] || 'Central';
};
