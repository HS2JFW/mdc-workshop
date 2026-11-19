// =========================================================================
// Dynamic Synergy Filter Engine (MDC Big Data Slicing & Synthesis Engine)
// รองรับการคำนวณและตอบสนองตัวกรองมิติข้อมูลครบทั้ง 4 มิติ:
// 1. พื้นที่ (Area: 9 ภาค/จังหวัด)
// 2. ปีงบประมาณ / แนวโน้ม (Year: 2565-2568 / Multi-Year Trend)
// 3. เพศสภาพ (Gender: ชาย, หญิง, LGBTQ+)
// 4. ช่วงวัย (Age: 13-24, 25-40, 41+)
// =========================================================================

export interface SynergyChartItem {
  name: string;
  externalMetric: number;
  moralScore?: number;
  capitalScore?: number;
  controlMetric?: number;
  baseline?: number;
}

export interface MoralSliceMetric {
  overall: number;
  responsibility: number;
  sufficiency: number;
  honesty: number;
  publicConsciousness: number;
  gratitude: number;
  sampleSize: number;
  label: string;
}

export interface LifeCapitalSliceMetric {
  overall: number;
  identity: number;
  family: number;
  talent: number;
  friend: number;
  community: number;
  sampleSize: number;
  label: string;
}

// -------------------------------------------------------------------------
// 1. Ground Truth Survey Matrices (ศูนย์คุณธรรม 2565 - 2568)
// -------------------------------------------------------------------------
export const MDC_SURVEY_MORAL_MATRIX: {
  nationalByYear: Record<string, MoralSliceMetric>;
  regional2568: Record<string, MoralSliceMetric>;
  gender2568: Record<string, MoralSliceMetric>;
  age2568: Record<string, MoralSliceMetric>;
} = {
  nationalByYear: {
    '2568': { label: 'ภาพรวมประเทศ พ.ศ. 2568', overall: 4.36, sufficiency: 4.22, responsibility: 4.33, honesty: 4.22, publicConsciousness: 4.40, gratitude: 4.62, sampleSize: 33032 },
    '2567': { label: 'ภาพรวมประเทศ พ.ศ. 2567', overall: 4.32, sufficiency: 4.17, responsibility: 4.27, honesty: 4.19, publicConsciousness: 4.35, gratitude: 4.64, sampleSize: 29432 },
    '2566': { label: 'ภาพรวมประเทศ พ.ศ. 2566', overall: 4.73, sufficiency: 4.59, responsibility: 4.61, honesty: 4.60, publicConsciousness: 4.76, gratitude: 4.88, sampleSize: 30269 },
    '2565': { label: 'ภาพรวมประเทศ พ.ศ. 2565', overall: 4.56, sufficiency: 4.38, responsibility: 4.47, honesty: 4.41, publicConsciousness: 4.58, gratitude: 4.98, sampleSize: 15720 }
  },
  regional2568: {
    central: { label: 'ภาคกลาง', overall: 4.47, sufficiency: 4.32, responsibility: 4.43, honesty: 4.34, publicConsciousness: 4.52, gratitude: 4.75, sampleSize: 9254 },
    east: { label: 'ภาคตะวันออก', overall: 4.43, sufficiency: 4.36, responsibility: 4.37, honesty: 4.33, publicConsciousness: 4.48, gratitude: 4.63, sampleSize: 3861 },
    northeast: { label: 'ภาคตะวันออกเฉียงเหนือ', overall: 4.42, sufficiency: 4.25, responsibility: 4.40, honesty: 4.33, publicConsciousness: 4.48, gratitude: 4.63, sampleSize: 7054 },
    west: { label: 'ภาคตะวันตก', overall: 4.41, sufficiency: 4.26, responsibility: 4.37, honesty: 4.27, publicConsciousness: 4.45, gratitude: 4.71, sampleSize: 2605 },
    south: { label: 'ภาคใต้', overall: 4.26, sufficiency: 4.11, responsibility: 4.23, honesty: 4.05, publicConsciousness: 4.29, gratitude: 4.60, sampleSize: 5572 },
    north: { label: 'ภาคเหนือ', overall: 4.07, sufficiency: 3.95, responsibility: 4.07, honesty: 3.91, publicConsciousness: 4.09, gratitude: 4.35, sampleSize: 4686 },
    lamphun: { label: 'จังหวัดลำพูน (ต้นแบบคุณธรรม)', overall: 4.82, sufficiency: 4.72, responsibility: 4.88, honesty: 4.78, publicConsciousness: 4.85, gratitude: 4.95, sampleSize: 650 },
    nan: { label: 'จังหวัดน่าน (ต้นแบบพอเพียง)', overall: 4.65, sufficiency: 4.76, responsibility: 4.68, honesty: 4.65, publicConsciousness: 4.70, gratitude: 4.88, sampleSize: 580 },
    bkk: { label: 'กทม. และปริมณฑล', overall: 4.29, sufficiency: 4.15, responsibility: 4.38, honesty: 4.12, publicConsciousness: 4.35, gratitude: 4.45, sampleSize: 4200 }
  },
  gender2568: {
    male: { label: 'เพศชาย', overall: 4.31, sufficiency: 4.17, responsibility: 4.28, honesty: 4.15, publicConsciousness: 4.35, gratitude: 4.59, sampleSize: 14233 },
    female: { label: 'เพศหญิง', overall: 4.38, sufficiency: 4.24, responsibility: 4.34, honesty: 4.26, publicConsciousness: 4.42, gratitude: 4.64, sampleSize: 16197 },
    lgbtq: { label: 'LGBTQ+ (เพศทางเลือก)', overall: 4.50, sufficiency: 4.37, responsibility: 4.48, honesty: 4.39, publicConsciousness: 4.53, gratitude: 4.72, sampleSize: 2602 }
  },
  age2568: {
    '13-24': { label: 'วัยเด็กและเยาวชน (13–24 ปี)', overall: 4.43, sufficiency: 4.27, responsibility: 4.51, honesty: 4.22, publicConsciousness: 4.46, gratitude: 4.70, sampleSize: 11488 },
    '25-40': { label: 'วัยทำงานตอนต้น (25–40 ปี)', overall: 4.21, sufficiency: 4.23, responsibility: 4.01, honesty: 4.08, publicConsciousness: 4.21, gratitude: 4.55, sampleSize: 11411 },
    '41+': { label: 'วัยทำงานตอนปลายและผู้สูงอายุ (41 ปีขึ้นไป)', overall: 4.44, sufficiency: 4.15, responsibility: 4.48, honesty: 4.38, publicConsciousness: 4.55, gratitude: 4.63, sampleSize: 10133 }
  }
};

export const MDC_SURVEY_LIFE_CAPITAL_MATRIX: {
  nationalByYear: Record<string, LifeCapitalSliceMetric>;
  regional2568: Record<string, LifeCapitalSliceMetric>;
  gender2568: Record<string, LifeCapitalSliceMetric>;
  age2568: Record<string, LifeCapitalSliceMetric>;
} = {
  nationalByYear: {
    '2568': { label: 'ภาพรวมประเทศ พ.ศ. 2568', overall: 78.52, identity: 79.93, family: 79.17, talent: 78.88, friend: 77.44, community: 77.39, sampleSize: 33032 },
    '2567': { label: 'ภาพรวมประเทศ พ.ศ. 2567', overall: 77.57, identity: 79.84, family: 79.10, talent: 77.22, friend: 76.83, community: 74.84, sampleSize: 29432 },
    '2566': { label: 'ภาพรวมประเทศ พ.ศ. 2566', overall: 83.80, identity: 86.63, family: 85.94, talent: 83.47, friend: 82.97, community: 80.02, sampleSize: 30269 },
    '2565': { label: 'ภาพรวมประเทศ พ.ศ. 2565', overall: 78.08, identity: 81.86, family: 81.92, talent: 77.06, friend: 77.37, community: 72.17, sampleSize: 15720 }
  },
  regional2568: {
    north: { label: 'ภาคเหนือ', overall: 79.84, identity: 81.25, family: 80.50, talent: 80.10, friend: 78.70, community: 78.65, sampleSize: 4686 },
    central: { label: 'ภาคกลาง', overall: 79.33, identity: 80.70, family: 79.95, talent: 79.65, friend: 78.20, community: 78.15, sampleSize: 9254 },
    south: { label: 'ภาคใต้', overall: 79.13, identity: 80.50, family: 79.75, talent: 79.45, friend: 78.00, community: 77.95, sampleSize: 5572 },
    east: { label: 'ภาคตะวันออก', overall: 78.83, identity: 80.20, family: 79.45, talent: 79.15, friend: 77.70, community: 77.65, sampleSize: 3861 },
    northeast: { label: 'ภาคตะวันออกเฉียงเหนือ', overall: 77.12, identity: 78.50, family: 77.75, talent: 77.40, friend: 76.00, community: 75.95, sampleSize: 7054 },
    west: { label: 'ภาคตะวันตก', overall: 77.08, identity: 78.45, family: 77.60, talent: 77.40, friend: 76.05, community: 75.90, sampleSize: 2605 },
    lamphun: { label: 'จังหวัดลำพูน (ชุมชนเด่น)', overall: 83.42, identity: 84.50, family: 83.80, talent: 82.50, friend: 81.20, community: 85.10, sampleSize: 650 },
    nan: { label: 'จังหวัดน่าน (พอเพียงเด่น)', overall: 82.56, identity: 83.80, family: 82.90, talent: 83.10, friend: 80.40, community: 82.60, sampleSize: 580 },
    bkk: { label: 'กทม. และปริมณฑล', overall: 77.32, identity: 78.90, family: 76.80, talent: 80.20, friend: 76.50, community: 74.20, sampleSize: 4200 }
  },
  gender2568: {
    male: { label: 'เพศชาย', overall: 78.18, identity: 79.55, family: 78.80, talent: 78.50, friend: 77.05, community: 77.00, sampleSize: 14233 },
    female: { label: 'เพศหญิง', overall: 78.91, identity: 80.28, family: 79.50, talent: 79.20, friend: 77.80, community: 77.75, sampleSize: 16197 },
    lgbtq: { label: 'LGBTQ+ (เพศทางเลือก)', overall: 77.70, identity: 79.05, family: 78.30, talent: 78.00, friend: 76.60, community: 76.55, sampleSize: 2602 }
  },
  age2568: {
    '13-24': { label: 'วัยเด็กและเยาวชน (13–24 ปี)', overall: 78.27, identity: 79.74, family: 78.79, talent: 78.23, friend: 77.57, community: 76.99, sampleSize: 11488 },
    '25-40': { label: 'วัยทำงานตอนต้น (25–40 ปี)', overall: 78.52, identity: 79.84, family: 79.10, talent: 78.78, friend: 77.36, community: 77.52, sampleSize: 11411 },
    '41+': { label: 'วัยทำงานตอนปลายและผู้สูงอายุ (41 ปีขึ้นไป)', overall: 78.80, identity: 80.26, family: 79.69, talent: 78.98, friend: 77.37, community: 77.69, sampleSize: 10133 }
  }
};

// -------------------------------------------------------------------------
// 2. Slicing Resolvers & Weights
// -------------------------------------------------------------------------

export interface FilterState {
  area: string;
  year: string;
  gender: string;
  age: string;
}

export interface SliceResolutionResult {
  effectiveScore: number;
  effectiveSampleSize: number;
  sliceContextLabel: string;
  isFiltered: boolean;
  activeBadges: Array<{ id: string; label: string; iconType: string }>;
  weights: {
    ym: number;
    areaWeight: number;
    genderWeight: number;
    ageWeight: number;
    combinedWeight: number;
  };
  deltas: {
    areaDelta: number;
    genderDelta: number;
    ageDelta: number;
  };
}

export function resolveMoralSlice(
  dimKey: 'responsibility' | 'sufficiency' | 'honesty' | 'publicConsciousness' | 'gratitude',
  filters: FilterState
): SliceResolutionResult {
  const { area, year, gender, age } = filters;
  const yearKey = year === 'trend' ? '2568' : year;
  const natYear = MDC_SURVEY_MORAL_MATRIX.nationalByYear[yearKey] || MDC_SURVEY_MORAL_MATRIX.nationalByYear['2568'];
  const baseScore = natYear[dimKey] || 4.33;
  const nat2568Score = MDC_SURVEY_MORAL_MATRIX.nationalByYear['2568'][dimKey];

  let areaDelta = 0;
  let genderDelta = 0;
  let ageDelta = 0;
  let size = natYear.sampleSize;

  const sliceParts: string[] = [];
  const activeBadges: Array<{ id: string; label: string; iconType: string }> = [];

  // 1. Area
  let areaWeight = 1.0;
  if (area !== 'all' && MDC_SURVEY_MORAL_MATRIX.regional2568[area]) {
    const reg = MDC_SURVEY_MORAL_MATRIX.regional2568[area];
    areaDelta = reg[dimKey] - nat2568Score;
    size = Math.round(reg.sampleSize * (natYear.sampleSize / 33032));
    const cleanLabel = reg.label.split('(')[0].trim();
    sliceParts.push(cleanLabel);
    activeBadges.push({ id: 'area', label: cleanLabel, iconType: 'map-pin' });

    // Area risk multiplier
    if (area === 'north') areaWeight = 1.12;
    else if (area === 'lamphun' || area === 'nan') areaWeight = 0.72;
    else if (area === 'bkk') areaWeight = 1.15;
    else if (area === 'northeast') areaWeight = 0.94;
    else if (area === 'south') areaWeight = 1.05;
    else areaWeight = 1.0;
  } else {
    sliceParts.push('ทั้งประเทศ');
  }

  // 2. Year
  const yearWeights: Record<string, number> = {
    '2565': 1.08,
    '2566': 1.04,
    '2567': 1.00,
    '2568': 0.95,
    'trend': 1.00
  };
  const ym = yearWeights[year] || 1.0;
  if (year === 'trend') {
    sliceParts.push('แนวโน้ม 2565–2568');
    activeBadges.push({ id: 'year', label: 'แนวโน้ม 2565–2568', iconType: 'calendar' });
  } else {
    sliceParts.push(`พ.ศ. ${year}`);
    if (year !== '2568') {
      activeBadges.push({ id: 'year', label: `พ.ศ. ${year}`, iconType: 'calendar' });
    }
  }

  // 3. Gender
  let genderWeight = 1.0;
  if (gender !== 'all' && MDC_SURVEY_MORAL_MATRIX.gender2568[gender]) {
    const gen = MDC_SURVEY_MORAL_MATRIX.gender2568[gender];
    genderDelta = gen[dimKey] - nat2568Score;
    size = Math.round(size * (gen.sampleSize / 33032));
    sliceParts.push(gen.label);
    activeBadges.push({ id: 'gender', label: gen.label, iconType: 'users' });

    if (gender === 'male') genderWeight = 1.18;
    else if (gender === 'female') genderWeight = 0.82;
    else if (gender === 'lgbtq') genderWeight = 0.95;
  }

  // 4. Age
  let ageWeight = 1.0;
  if (age !== 'all' && MDC_SURVEY_MORAL_MATRIX.age2568[age]) {
    const ag = MDC_SURVEY_MORAL_MATRIX.age2568[age];
    ageDelta = ag[dimKey] - nat2568Score;
    size = Math.round(size * (ag.sampleSize / 33032));
    const cleanLabel = ag.label.split('(')[0].trim();
    sliceParts.push(cleanLabel);
    activeBadges.push({ id: 'age', label: cleanLabel, iconType: 'user-check' });

    if (age === '25-40') ageWeight = 1.22; // High debt & scam vulnerability
    else if (age === '13-24') ageWeight = 1.14; // High risk traffic & online
    else if (age === '41+') ageWeight = 0.88;
  }

  const calculated = Math.min(6.0, Math.max(1.0, baseScore + areaDelta + genderDelta + ageDelta));
  const isFiltered = activeBadges.length > 0;
  const combinedWeight = Number((ym * areaWeight * genderWeight * ageWeight).toFixed(3));

  return {
    effectiveScore: Number(calculated.toFixed(2)),
    effectiveSampleSize: size,
    sliceContextLabel: sliceParts.join(' | '),
    isFiltered,
    activeBadges,
    weights: { ym, areaWeight, genderWeight, ageWeight, combinedWeight },
    deltas: { areaDelta, genderDelta, ageDelta }
  };
}

export function resolveLifeCapitalSlice(
  pillarKey: 'family' | 'talent' | 'friend' | 'community' | 'identity',
  filters: FilterState
): SliceResolutionResult {
  const { area, year, gender, age } = filters;
  const yearKey = year === 'trend' ? '2568' : year;
  const natYear = MDC_SURVEY_LIFE_CAPITAL_MATRIX.nationalByYear[yearKey] || MDC_SURVEY_LIFE_CAPITAL_MATRIX.nationalByYear['2568'];
  const baseScore = natYear[pillarKey] || 79.17;
  const nat2568Score = MDC_SURVEY_LIFE_CAPITAL_MATRIX.nationalByYear['2568'][pillarKey];

  let areaDelta = 0;
  let genderDelta = 0;
  let ageDelta = 0;
  let size = natYear.sampleSize;

  const sliceParts: string[] = [];
  const activeBadges: Array<{ id: string; label: string; iconType: string }> = [];

  // 1. Area
  let areaWeight = 1.0;
  if (area !== 'all' && MDC_SURVEY_LIFE_CAPITAL_MATRIX.regional2568[area]) {
    const reg = MDC_SURVEY_LIFE_CAPITAL_MATRIX.regional2568[area];
    areaDelta = reg[pillarKey] - nat2568Score;
    size = Math.round(reg.sampleSize * (natYear.sampleSize / 33032));
    const cleanLabel = reg.label.split('(')[0].trim();
    sliceParts.push(cleanLabel);
    activeBadges.push({ id: 'area', label: cleanLabel, iconType: 'map-pin' });

    if (area === 'north') areaWeight = 1.08;
    else if (area === 'lamphun' || area === 'nan') areaWeight = 0.75;
    else if (area === 'bkk') areaWeight = 1.12;
    else if (area === 'northeast') areaWeight = 0.95;
    else if (area === 'south') areaWeight = 1.04;
    else areaWeight = 1.0;
  } else {
    sliceParts.push('ทั้งประเทศ');
  }

  // 2. Year
  const yearWeights: Record<string, number> = {
    '2565': 1.08,
    '2566': 1.04,
    '2567': 1.00,
    '2568': 0.95,
    'trend': 1.00
  };
  const ym = yearWeights[year] || 1.0;
  if (year === 'trend') {
    sliceParts.push('แนวโน้ม 2565–2568');
    activeBadges.push({ id: 'year', label: 'แนวโน้ม 2565–2568', iconType: 'calendar' });
  } else {
    sliceParts.push(`พ.ศ. ${year}`);
    if (year !== '2568') {
      activeBadges.push({ id: 'year', label: `พ.ศ. ${year}`, iconType: 'calendar' });
    }
  }

  // 3. Gender
  let genderWeight = 1.0;
  if (gender !== 'all' && MDC_SURVEY_LIFE_CAPITAL_MATRIX.gender2568[gender]) {
    const gen = MDC_SURVEY_LIFE_CAPITAL_MATRIX.gender2568[gender];
    genderDelta = gen[pillarKey] - nat2568Score;
    size = Math.round(size * (gen.sampleSize / 33032));
    sliceParts.push(gen.label);
    activeBadges.push({ id: 'gender', label: gen.label, iconType: 'users' });

    if (gender === 'male') genderWeight = 1.15;
    else if (gender === 'female') genderWeight = 0.85;
    else if (gender === 'lgbtq') genderWeight = 0.95;
  }

  // 4. Age
  let ageWeight = 1.0;
  if (age !== 'all' && MDC_SURVEY_LIFE_CAPITAL_MATRIX.age2568[age]) {
    const ag = MDC_SURVEY_LIFE_CAPITAL_MATRIX.age2568[age];
    ageDelta = ag[pillarKey] - nat2568Score;
    size = Math.round(size * (ag.sampleSize / 33032));
    const cleanLabel = ag.label.split('(')[0].trim();
    sliceParts.push(cleanLabel);
    activeBadges.push({ id: 'age', label: cleanLabel, iconType: 'user-check' });

    if (age === '13-24') ageWeight = 1.20; // High youth vulnerability
    else if (age === '25-40') ageWeight = 1.10;
    else if (age === '41+') ageWeight = 0.90;
  }

  const calculated = Math.min(100.0, Math.max(0.0, baseScore + areaDelta + genderDelta + ageDelta));
  const isFiltered = activeBadges.length > 0;
  const combinedWeight = Number((ym * areaWeight * genderWeight * ageWeight).toFixed(3));

  return {
    effectiveScore: Number(calculated.toFixed(2)),
    effectiveSampleSize: size,
    sliceContextLabel: sliceParts.join(' | '),
    isFiltered,
    activeBadges,
    weights: { ym, areaWeight, genderWeight, ageWeight, combinedWeight },
    deltas: { areaDelta, genderDelta, ageDelta }
  };
}

// -------------------------------------------------------------------------
// 3. Dynamic Moral Synergy Chart Data Generator (20 Topics)
// -------------------------------------------------------------------------

export function getMoralSynergyChartData(
  topicId: string,
  dimKey: 'responsibility' | 'sufficiency' | 'honesty' | 'publicConsciousness' | 'gratitude',
  filters: FilterState
): SynergyChartItem[] {
  const { area, year, gender, age } = filters;
  const slice = resolveMoralSlice(dimKey, filters);
  const { ym, genderWeight, ageWeight, areaWeight, combinedWeight } = slice.weights;
  const { areaDelta, genderDelta, ageDelta } = slice.deltas;
  const scoreDelta = areaDelta + genderDelta + ageDelta;

  const calcScore = (base: number) => Number(Math.min(6.0, Math.max(1.0, base + scoreDelta)).toFixed(2));
  const scaleVal = (base: number) => Math.round(base * combinedWeight);
  const scaleFloat = (base: number) => Number((base * ym * (genderWeight * 0.5 + 0.5) * (areaWeight * 0.5 + 0.5)).toFixed(1));

  // -----------------------------------------------------------------------
  // Mode 1: Multi-Year Trend Mode (When User chooses year === 'trend')
  // -----------------------------------------------------------------------
  if (year === 'trend') {
    const yScore = (yr: string) => {
      const base = MDC_SURVEY_MORAL_MATRIX.nationalByYear[yr]?.[dimKey] || 4.33;
      return calcScore(base);
    };

    if (topicId === 'traffic') {
      return [
        { name: 'ปี 2565', externalMetric: Math.round(17300 * genderWeight * areaWeight), moralScore: yScore('2565'), baseline: 15000 },
        { name: 'ปี 2566', externalMetric: Math.round(16800 * genderWeight * areaWeight), moralScore: yScore('2566'), baseline: 15000 },
        { name: 'ปี 2567', externalMetric: Math.round(16400 * genderWeight * areaWeight), moralScore: yScore('2567'), baseline: 15000 },
        { name: 'ปี 2568 (ล่าสุด)', externalMetric: Math.round(16078 * genderWeight * areaWeight), moralScore: yScore('2568'), baseline: 15000 }
      ];
    }
    if (topicId === 'finance') {
      return [
        { name: 'ปี 2565', externalMetric: Math.round(71000 * ageWeight * areaWeight), moralScore: yScore('2565'), baseline: 50000 },
        { name: 'ปี 2566', externalMetric: Math.round(76000 * ageWeight * areaWeight), moralScore: yScore('2566'), baseline: 50000 },
        { name: 'ปี 2567', externalMetric: Math.round(79500 * ageWeight * areaWeight), moralScore: yScore('2567'), baseline: 50000 },
        { name: 'ปี 2568 (หนี้พุ่ง)', externalMetric: Math.round(82000 * ageWeight * areaWeight), moralScore: yScore('2568'), baseline: 50000 }
      ];
    }
    if (topicId === 'crime') {
      return [
        { name: 'ปี 2565', externalMetric: Math.round(7160 * combinedWeight), controlMetric: 6980, moralScore: yScore('2565') },
        { name: 'ปี 2566', externalMetric: Math.round(5420 * combinedWeight), controlMetric: 6850, moralScore: yScore('2566') },
        { name: 'ปี 2567', externalMetric: Math.round(3890 * combinedWeight), controlMetric: 6720, moralScore: yScore('2567') },
        { name: 'ปี 2568 (ลำพูน)', externalMetric: Math.round(2718 * combinedWeight), controlMetric: 6610, moralScore: yScore('2568') }
      ];
    }
    if (topicId === 'education') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(5.6), controlMetric: 18.0, moralScore: yScore('2565') },
        { name: 'ปี 2566', externalMetric: scaleFloat(5.2), controlMetric: 16.5, moralScore: yScore('2566') },
        { name: 'ปี 2567', externalMetric: scaleFloat(4.9), controlMetric: 15.2, moralScore: yScore('2567') },
        { name: 'ปี 2568 (กสศ.)', externalMetric: scaleFloat(4.8), controlMetric: 14.8, moralScore: yScore('2568') }
      ];
    }
    if (topicId === 'finance_gap') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(62.4), moralScore: yScore('2565'), baseline: 75.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(65.1), moralScore: yScore('2566'), baseline: 75.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(66.8), moralScore: yScore('2567'), baseline: 75.0 },
        { name: 'ปี 2568 (ล่าสุด)', externalMetric: scaleFloat(67.9), moralScore: yScore('2568'), baseline: 75.0 }
      ];
    }
    if (topicId === 'livelihood') {
      return [
        { name: 'ปี 2565', externalMetric: Math.round(78000 * combinedWeight), controlMetric: 15200, moralScore: yScore('2565') },
        { name: 'ปี 2566', externalMetric: Math.round(65400 * combinedWeight), controlMetric: 24800, moralScore: yScore('2566') },
        { name: 'ปี 2567', externalMetric: Math.round(52100 * combinedWeight), controlMetric: 38900, moralScore: yScore('2567') },
        { name: 'ปี 2568 (น่าน)', externalMetric: Math.round(45860 * combinedWeight), controlMetric: 48600, moralScore: yScore('2568') }
      ];
    }
    if (topicId === 'community_fund') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(8.4), moralScore: yScore('2565'), baseline: 5.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(6.2), moralScore: yScore('2566'), baseline: 5.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(4.1), moralScore: yScore('2567'), baseline: 5.0 },
        { name: 'ปี 2568 (กทบ.)', externalMetric: scaleFloat(2.8), moralScore: yScore('2568'), baseline: 5.0 }
      ];
    }
    if (topicId === 'environment') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(1.18), moralScore: yScore('2565'), baseline: 1.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(0.95), moralScore: yScore('2566'), baseline: 1.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(0.78), moralScore: yScore('2567'), baseline: 1.0 },
        { name: 'ปี 2568 (อปท.)', externalMetric: scaleFloat(0.62), moralScore: yScore('2568'), baseline: 1.0 }
      ];
    }
    if (topicId === 'cyber_scam') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(24.5), moralScore: yScore('2565'), baseline: 15.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(38.2), moralScore: yScore('2566'), baseline: 15.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(49.8), moralScore: yScore('2567'), baseline: 15.0 },
        { name: 'ปี 2568 (AOC)', externalMetric: scaleFloat(54.8), moralScore: yScore('2568'), baseline: 15.0 }
      ];
    }
    if (topicId === 'ita_gap') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(5.42), moralScore: yScore('2565'), baseline: 5.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(5.35), moralScore: yScore('2566'), baseline: 5.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(5.24), moralScore: yScore('2567'), baseline: 5.0 },
        { name: 'ปี 2568 (ITA)', externalMetric: scaleFloat(5.12), moralScore: yScore('2568'), baseline: 5.0 }
      ];
    }
    if (topicId === 'fraud_crime') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(28.4), moralScore: yScore('2565'), baseline: 40.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(22.1), moralScore: yScore('2566'), baseline: 40.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(17.8), moralScore: yScore('2567'), baseline: 40.0 },
        { name: 'ปี 2568 (สตช.)', externalMetric: scaleFloat(14.2), moralScore: yScore('2568'), baseline: 40.0 }
      ];
    }
    if (topicId === 'procurement') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(12.8), moralScore: yScore('2565'), baseline: 10.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(8.4), moralScore: yScore('2566'), baseline: 10.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(5.1), moralScore: yScore('2567'), baseline: 10.0 },
        { name: 'ปี 2568 (e-GP)', externalMetric: scaleFloat(2.4), moralScore: yScore('2568'), baseline: 10.0 }
      ];
    }
    if (topicId === 'elderly_care') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(78.5), moralScore: yScore('2565'), baseline: 80.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(83.2), moralScore: yScore('2566'), baseline: 80.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(88.4), moralScore: yScore('2567'), baseline: 80.0 },
        { name: 'ปี 2568 (อสม.)', externalMetric: scaleFloat(91.4), moralScore: yScore('2568'), baseline: 80.0 }
      ];
    }
    if (topicId === 'wildfire_disaster') {
      return [
        { name: 'ปี 2565', externalMetric: Math.round(1420 * combinedWeight), controlMetric: 1450, moralScore: yScore('2565') },
        { name: 'ปี 2566', externalMetric: Math.round(1180 * combinedWeight), controlMetric: 1510, moralScore: yScore('2566') },
        { name: 'ปี 2567', externalMetric: Math.round(980 * combinedWeight), controlMetric: 1560, moralScore: yScore('2567') },
        { name: 'ปี 2568 (GISTDA)', externalMetric: Math.round(917 * combinedWeight), controlMetric: 1620, moralScore: yScore('2568') }
      ];
    }
    if (topicId === 'youth_capital') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(68.2), moralScore: yScore('2565'), baseline: 70.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(71.4), moralScore: yScore('2566'), baseline: 70.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(74.6), moralScore: yScore('2567'), baseline: 70.0 },
        { name: 'ปี 2568 (จิตอาสา)', externalMetric: scaleFloat(76.8), moralScore: yScore('2568'), baseline: 70.0 }
      ];
    }
    if (topicId === 'blood_donation') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(36.2), moralScore: yScore('2565'), baseline: 30.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(40.5), moralScore: yScore('2566'), baseline: 30.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(44.8), moralScore: yScore('2567'), baseline: 30.0 },
        { name: 'ปี 2568 (กาชาด)', externalMetric: scaleFloat(48.6), moralScore: yScore('2568'), baseline: 30.0 }
      ];
    }
    if (topicId === 'elderly_mental') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(34.2), controlMetric: 4.8, moralScore: yScore('2565') },
        { name: 'ปี 2566', externalMetric: scaleFloat(28.5), controlMetric: 3.6, moralScore: yScore('2566') },
        { name: 'ปี 2567', externalMetric: scaleFloat(24.1), controlMetric: 2.5, moralScore: yScore('2567') },
        { name: 'ปี 2568 (สธ.)', externalMetric: scaleFloat(18.2), controlMetric: 2.1, moralScore: yScore('2568') }
      ];
    }
    if (topicId === 'hotline_abandon') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(32.4), moralScore: yScore('2565'), baseline: 30.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(36.8), moralScore: yScore('2566'), baseline: 30.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(41.2), moralScore: yScore('2567'), baseline: 30.0 },
        { name: 'ปี 2568 (1300)', externalMetric: scaleFloat(44.8), moralScore: yScore('2568'), baseline: 30.0 }
      ];
    }
    if (topicId === 'urban_rural_gap') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(72.5), controlMetric: 38.2, moralScore: yScore('2565') },
        { name: 'ปี 2566', externalMetric: scaleFloat(70.8), controlMetric: 36.5, moralScore: yScore('2566') },
        { name: 'ปี 2567', externalMetric: scaleFloat(69.4), controlMetric: 35.1, moralScore: yScore('2567') },
        { name: 'ปี 2568 (สสช.)', externalMetric: scaleFloat(68.4), controlMetric: 34.2, moralScore: yScore('2568') }
      ];
    }
    if (topicId === 'homecoming_youth') {
      return [
        { name: 'ปี 2565', externalMetric: Math.round(12400 * combinedWeight), controlMetric: 32000, moralScore: yScore('2565') },
        { name: 'ปี 2566', externalMetric: Math.round(18500 * combinedWeight), controlMetric: 38400, moralScore: yScore('2566') },
        { name: 'ปี 2567', externalMetric: Math.round(26800 * combinedWeight), controlMetric: 42100, moralScore: yScore('2567') },
        { name: 'ปี 2568 (คืนถิ่น)', externalMetric: Math.round(36500 * combinedWeight), controlMetric: 46400, moralScore: yScore('2568') }
      ];
    }
  }

  // -----------------------------------------------------------------------
  // Mode 2: Specific Regional Comparison Topics (When filtering Area)
  // -----------------------------------------------------------------------
  if (['finance_gap', 'ita_gap'].includes(topicId) && area !== 'all') {
    const regionalData: Record<string, SynergyChartItem[]> = {
      north: [
        { name: 'ภาคเหนือ (พื้นที่เลือก)', externalMetric: scaleFloat(67.9), moralScore: calcScore(3.91), baseline: 75.0 },
        { name: 'ค่าเฉลี่ยทั้งประเทศ', externalMetric: 72.8, moralScore: 4.33, baseline: 75.0 },
        { name: 'ภาคตะวันออกเฉียงเหนือ', externalMetric: 74.1, moralScore: 4.33, baseline: 75.0 },
        { name: 'ภาคกลาง', externalMetric: 72.8, moralScore: 4.34, baseline: 75.0 }
      ],
      bkk: [
        { name: 'กทม. และปริมณฑล (พื้นที่เลือก)', externalMetric: scaleFloat(74.2), moralScore: calcScore(4.12), baseline: 75.0 },
        { name: 'ค่าเฉลี่ยทั้งประเทศ', externalMetric: 72.8, moralScore: 4.33, baseline: 75.0 },
        { name: 'ภาคกลาง', externalMetric: 72.8, moralScore: 4.34, baseline: 75.0 },
        { name: 'ภาคเหนือ', externalMetric: 67.9, moralScore: 3.91, baseline: 75.0 }
      ],
      lamphun: [
        { name: 'จ.ลำพูน (ต้นแบบคุณธรรม)', externalMetric: scaleFloat(82.4), moralScore: calcScore(4.88), baseline: 75.0 },
        { name: 'ค่าเฉลี่ยภาคเหนือ', externalMetric: 67.9, moralScore: 3.91, baseline: 75.0 },
        { name: 'ค่าเฉลี่ยทั้งประเทศ', externalMetric: 72.8, moralScore: 4.33, baseline: 75.0 }
      ],
      nan: [
        { name: 'จ.น่าน (ต้นแบบพอเพียง)', externalMetric: scaleFloat(80.5), moralScore: calcScore(4.76), baseline: 75.0 },
        { name: 'ค่าเฉลี่ยภาคเหนือ', externalMetric: 67.9, moralScore: 3.91, baseline: 75.0 },
        { name: 'ค่าเฉลี่ยทั้งประเทศ', externalMetric: 72.8, moralScore: 4.33, baseline: 75.0 }
      ]
    };
    if (regionalData[area]) return regionalData[area];
  }

  // -----------------------------------------------------------------------
  // Mode 3: Categorical Topics with Full Slicing Response
  // -----------------------------------------------------------------------
  // 1. Responsibility
  if (topicId === 'traffic') {
    return [
      { name: 'ต่ำกว่า 15 ปี', externalMetric: scaleVal(675), moralScore: calcScore(4.45), baseline: 800 },
      { name: '15–24 ปี (เสี่ยงสูง)', externalMetric: scaleVal(3457), moralScore: calcScore(4.51), baseline: 2500 },
      { name: '25–40 ปี (วิกฤตสุด)', externalMetric: scaleVal(3987), moralScore: calcScore(4.01), baseline: 2500 },
      { name: '41–59 ปี', externalMetric: scaleVal(4356), moralScore: calcScore(4.38), baseline: 2500 },
      { name: '60 ปีขึ้นไป', externalMetric: scaleVal(3603), moralScore: calcScore(4.58), baseline: 2500 }
    ];
  }

  if (topicId === 'finance') {
    return [
      { name: '13–24 ปี (เยาวชน)', externalMetric: scaleVal(34500), moralScore: calcScore(4.27), baseline: 40000 },
      { name: '25–40 ปี (หนี้พุ่ง)', externalMetric: scaleVal(82000), moralScore: calcScore(4.01), baseline: 50000 },
      { name: '41–59 ปี', externalMetric: scaleVal(58000), moralScore: calcScore(4.48), baseline: 50000 },
      { name: '60 ปีขึ้นไป', externalMetric: scaleVal(21000), moralScore: calcScore(4.62), baseline: 30000 }
    ];
  }

  if (topicId === 'crime') {
    return [
      { name: 'ปี 2565', externalMetric: scaleVal(7160), controlMetric: 6980, moralScore: calcScore(4.52) },
      { name: 'ปี 2566', externalMetric: scaleVal(5420), controlMetric: 6850, moralScore: calcScore(4.67) },
      { name: 'ปี 2567', externalMetric: scaleVal(3890), controlMetric: 6720, moralScore: calcScore(4.79) },
      { name: 'ปี 2568 (ลำพูนโมเดล)', externalMetric: scaleVal(2718), controlMetric: 6610, moralScore: calcScore(4.88) }
    ];
  }

  if (topicId === 'education') {
    return [
      { name: 'ม.ต้น (ม.1–ม.3)', externalMetric: scaleFloat(4.8), moralScore: calcScore(4.51), controlMetric: 18.5 },
      { name: 'ม.ปลาย (ม.4–ม.6)', externalMetric: scaleFloat(3.2), moralScore: calcScore(4.48), controlMetric: 14.2 },
      { name: 'อาชีวศึกษา (ปวช.)', externalMetric: scaleFloat(6.5), moralScore: calcScore(4.25), controlMetric: 24.8 },
      { name: 'การศึกษานอกระบบ', externalMetric: scaleFloat(8.9), moralScore: calcScore(4.12), controlMetric: 31.4 }
    ];
  }

  // 2. Sufficiency
  if (topicId === 'finance_gap') {
    return [
      { name: 'ภาคเหนือ (วิกฤตพฤติกรรม)', externalMetric: scaleFloat(67.9), moralScore: calcScore(3.95), baseline: 75.0 },
      { name: 'กทม. และปริมณฑล', externalMetric: scaleFloat(74.2), moralScore: calcScore(4.15), baseline: 75.0 },
      { name: 'ภาคกลาง', externalMetric: scaleFloat(72.8), moralScore: calcScore(4.32), baseline: 75.0 },
      { name: 'ภาคใต้', externalMetric: scaleFloat(73.5), moralScore: calcScore(4.11), baseline: 75.0 },
      { name: 'ภาคอีสาน', externalMetric: scaleFloat(74.1), moralScore: calcScore(4.25), baseline: 75.0 }
    ];
  }

  if (topicId === 'livelihood') {
    return [
      { name: 'ปี 2565 (ก่อนโครงการ)', externalMetric: scaleVal(78000), controlMetric: 15200, moralScore: calcScore(4.22) },
      { name: 'ปี 2566', externalMetric: scaleVal(65400), controlMetric: 24800, moralScore: calcScore(4.38) },
      { name: 'ปี 2567', externalMetric: scaleVal(52100), controlMetric: 38900, moralScore: calcScore(4.55) },
      { name: 'ปี 2568 (น่านโมเดล)', externalMetric: scaleVal(45860), controlMetric: 48600, moralScore: calcScore(4.76) }
    ];
  }

  if (topicId === 'community_fund') {
    return [
      { name: 'กลุ่มคุณธรรมสูง (Top 20%)', externalMetric: scaleFloat(2.8), moralScore: calcScore(4.82), baseline: 5.0 },
      { name: 'กลุ่มปานกลางบน', externalMetric: scaleFloat(4.5), moralScore: calcScore(4.45), baseline: 5.0 },
      { name: 'กลุ่มค่าเฉลี่ยประเทศ', externalMetric: scaleFloat(7.8), moralScore: calcScore(4.22), baseline: 5.0 },
      { name: 'กลุ่มเปราะบาง (Bottom 20%)', externalMetric: scaleFloat(14.5), moralScore: calcScore(3.84), baseline: 5.0 }
    ];
  }

  if (topicId === 'environment') {
    return [
      { name: 'อปท. ต้นแบบพอเพียง', externalMetric: scaleFloat(0.62), moralScore: calcScore(4.85), baseline: 1.0 },
      { name: 'อปท. ระดับพัฒนา', externalMetric: scaleFloat(0.84), moralScore: calcScore(4.42), baseline: 1.0 },
      { name: 'อปท. ค่าเฉลี่ยทั่วไป', externalMetric: scaleFloat(1.14), moralScore: calcScore(4.18), baseline: 1.0 },
      { name: 'อปท. เมืองหนาแน่นสูง', externalMetric: scaleFloat(1.48), moralScore: calcScore(4.02), baseline: 1.0 }
    ];
  }

  // 3. Honesty
  if (topicId === 'cyber_scam') {
    return [
      { name: '15–21 ปี (เสี่ยงเปิดบัญชีม้า)', externalMetric: scaleFloat(31.2), moralScore: calcScore(4.22), baseline: 15.0 },
      { name: '22–44 ปี (ความเสียหายหลัก 66%)', externalMetric: scaleFloat(54.8), moralScore: calcScore(4.08), baseline: 15.0 },
      { name: '45–59 ปี', externalMetric: scaleFloat(11.5), moralScore: calcScore(4.38), baseline: 15.0 },
      { name: '60 ปีขึ้นไป', externalMetric: scaleFloat(2.5), moralScore: calcScore(4.54), baseline: 15.0 }
    ];
  }

  if (topicId === 'ita_gap') {
    return [
      { name: 'กทม. (Gap -1.16 สูงสุด)', externalMetric: scaleFloat(5.28), moralScore: calcScore(4.12), baseline: 5.0 },
      { name: 'ภาคกลาง', externalMetric: scaleFloat(5.15), moralScore: calcScore(4.34), baseline: 5.0 },
      { name: 'ภาคใต้', externalMetric: scaleFloat(5.08), moralScore: calcScore(4.05), baseline: 5.0 },
      { name: 'ภาคเหนือ', externalMetric: scaleFloat(5.12), moralScore: calcScore(3.91), baseline: 5.0 },
      { name: 'ภาคอีสาน', externalMetric: scaleFloat(5.20), moralScore: calcScore(4.33), baseline: 5.0 }
    ];
  }

  if (topicId === 'fraud_crime') {
    return [
      { name: 'กลุ่มคุณธรรมสูง (Top 10)', externalMetric: scaleFloat(14.2), moralScore: calcScore(4.78), baseline: 40.0 },
      { name: 'กลุ่มค่าเฉลี่ยประเทศ', externalMetric: scaleFloat(39.8), moralScore: calcScore(4.22), baseline: 40.0 },
      { name: 'กลุ่มเปราะบาง (Bottom 10)', externalMetric: scaleFloat(78.4), moralScore: calcScore(3.85), baseline: 40.0 }
    ];
  }

  if (topicId === 'procurement') {
    return [
      { name: 'โครงการใช้ Integrity Pact', externalMetric: scaleFloat(2.4), moralScore: calcScore(4.88), baseline: 10.0 },
      { name: 'โครงการทั่วไปแบบ e-Bidding', externalMetric: scaleFloat(8.9), moralScore: calcScore(4.35), baseline: 10.0 },
      { name: 'โครงการประกวดราคาเฉพาะเจาะจง', externalMetric: scaleFloat(14.6), moralScore: calcScore(4.02), baseline: 10.0 }
    ];
  }

  // 4. Public Consciousness
  if (topicId === 'elderly_care') {
    return [
      { name: 'ผู้สูงอายุติดเตียง (ADL 0–4)', externalMetric: scaleFloat(91.4), moralScore: calcScore(4.55), baseline: 80.0 },
      { name: 'ผู้สูงอายุติดบ้าน (ADL 5–11)', externalMetric: scaleFloat(86.8), moralScore: calcScore(4.42), baseline: 80.0 },
      { name: 'ผู้สูงอายุติดสังคม (ADL 12+)', externalMetric: scaleFloat(74.2), moralScore: calcScore(4.38), baseline: 80.0 }
    ];
  }

  if (topicId === 'wildfire_disaster') {
    return [
      { name: 'ปี 2565', externalMetric: scaleVal(1420), controlMetric: 1450, moralScore: calcScore(4.25) },
      { name: 'ปี 2566', externalMetric: scaleVal(1180), controlMetric: 1510, moralScore: calcScore(4.34) },
      { name: 'ปี 2567', externalMetric: scaleVal(980), controlMetric: 1560, moralScore: calcScore(4.42) },
      { name: 'ปี 2568 (อาสาดับไฟป่า)', externalMetric: scaleVal(917), controlMetric: 1620, moralScore: calcScore(4.51) }
    ];
  }

  if (topicId === 'youth_capital') {
    return [
      { name: 'พลังกิจกรรม & จิตสาธารณะ', externalMetric: scaleFloat(76.8), moralScore: calcScore(4.52), baseline: 70.0 },
      { name: 'พลังเพื่อน & เครือข่าย', externalMetric: scaleFloat(74.5), moralScore: calcScore(4.46), baseline: 70.0 },
      { name: 'พลังครอบครัว', externalMetric: scaleFloat(79.2), moralScore: calcScore(4.41), baseline: 70.0 },
      { name: 'พลังชุมชน', externalMetric: scaleFloat(72.1), moralScore: calcScore(4.38), baseline: 70.0 },
      { name: 'พลังตนเอง', externalMetric: scaleFloat(75.3), moralScore: calcScore(4.34), baseline: 70.0 }
    ];
  }

  if (topicId === 'blood_donation') {
    return [
      { name: 'จังหวัดจิตอาสาเด่น (Top 10)', externalMetric: scaleFloat(48.6), moralScore: calcScore(4.75), baseline: 30.0 },
      { name: 'จังหวัดกลุ่มค่าเฉลี่ย', externalMetric: scaleFloat(34.2), moralScore: calcScore(4.38), baseline: 30.0 },
      { name: 'จังหวัดกลุ่มต้องส่งเสริม', externalMetric: scaleFloat(22.1), moralScore: calcScore(4.05), baseline: 30.0 }
    ];
  }

  // 5. Gratitude
  if (topicId === 'elderly_mental') {
    return [
      { name: 'อาศัยอยู่คนเดียวตามลำพัง', externalMetric: scaleFloat(28.4), moralScore: calcScore(4.12), controlMetric: 4.6 },
      { name: 'อาศัยอยู่กับคู่สมรสสูงวัย', externalMetric: scaleFloat(18.2), moralScore: calcScore(4.56), controlMetric: 2.1 },
      { name: 'อาศัยอยู่กับลูกหลาน (อบอุ่น)', externalMetric: scaleFloat(9.5), moralScore: calcScore(4.88), controlMetric: 1.0 }
    ];
  }

  if (topicId === 'hotline_abandon') {
    return [
      { name: 'กทม. และปริมณฑล (วิกฤตโดดเดี่ยว)', externalMetric: scaleFloat(44.8), moralScore: calcScore(4.45), baseline: 30.0 },
      { name: 'หัวเมืองใหญ่ภูมิภาค', externalMetric: scaleFloat(28.5), moralScore: calcScore(4.88), baseline: 30.0 },
      { name: 'ชุมชนชนบทและเกษตรกรรม', externalMetric: scaleFloat(26.7), moralScore: calcScore(5.25), baseline: 30.0 }
    ];
  }

  if (topicId === 'urban_rural_gap') {
    return [
      { name: 'อาศัยอยู่ร่วมกับพ่อแม่ (%)', externalMetric: scaleFloat(68.4), controlMetric: 34.2, moralScore: calcScore(4.88) },
      { name: 'พบปะเยี่ยมเยียนรายสัปดาห์ (%)', externalMetric: scaleFloat(74.1), controlMetric: 29.5, moralScore: calcScore(5.08) },
      { name: 'ส่งเงินทองสม่ำเสมอ (%)', externalMetric: scaleFloat(62.8), controlMetric: 71.4, moralScore: calcScore(4.95) },
      { name: 'คะแนนความอบอุ่นครอบครัว (/10)', externalMetric: scaleFloat(8.4), controlMetric: 6.8, moralScore: calcScore(5.22) }
    ];
  }

  if (topicId === 'homecoming_youth') {
    return [
      { name: 'ปี 2565 (เริ่มต้นโครงการ)', externalMetric: scaleVal(12400), controlMetric: 32000, moralScore: calcScore(4.65) },
      { name: 'ปี 2566', externalMetric: scaleVal(18500), controlMetric: 38400, moralScore: calcScore(4.82) },
      { name: 'ปี 2567', externalMetric: scaleVal(26800), controlMetric: 42100, moralScore: calcScore(4.98) },
      { name: 'ปี 2568 (คืนถิ่นกตัญญู)', externalMetric: scaleVal(36500), controlMetric: 46400, moralScore: calcScore(5.15) }
    ];
  }

  // Fallback
  return [
    { name: 'กลุ่มที่ 1', externalMetric: scaleFloat(65), moralScore: calcScore(4.20) },
    { name: 'กลุ่มที่ 2', externalMetric: scaleFloat(80), moralScore: calcScore(4.50) }
  ];
}

// -------------------------------------------------------------------------
// 4. Dynamic Life Capital Synergy Chart Data Generator (20 Topics)
// -------------------------------------------------------------------------

export function getLifeCapitalSynergyChartData(
  topicId: string,
  pillarKey: 'family' | 'talent' | 'friend' | 'community' | 'identity',
  filters: FilterState
): SynergyChartItem[] {
  const { area, year, gender, age } = filters;
  const slice = resolveLifeCapitalSlice(pillarKey, filters);
  const { ym, genderWeight, ageWeight, areaWeight, combinedWeight } = slice.weights;
  const { areaDelta, genderDelta, ageDelta } = slice.deltas;
  const scoreDelta = areaDelta + genderDelta + ageDelta;

  const calcScore = (base: number) => Number(Math.min(100.0, Math.max(0.0, base + scoreDelta)).toFixed(2));
  const scaleVal = (base: number) => Math.round(base * combinedWeight);
  const scaleFloat = (base: number) => Number((base * ym * (genderWeight * 0.5 + 0.5) * (areaWeight * 0.5 + 0.5)).toFixed(1));

  // -----------------------------------------------------------------------
  // Mode 1: Multi-Year Trend Mode (When User chooses year === 'trend')
  // -----------------------------------------------------------------------
  if (year === 'trend') {
    const yScore = (yr: string) => {
      const base = MDC_SURVEY_LIFE_CAPITAL_MATRIX.nationalByYear[yr]?.[pillarKey] || 79.17;
      return calcScore(base);
    };

    if (topicId === 'family_juvenile') {
      return [
        { name: 'ปี 2565', externalMetric: Math.round(21200 * genderWeight * areaWeight), capitalScore: yScore('2565'), baseline: 15000 },
        { name: 'ปี 2566', externalMetric: Math.round(19800 * genderWeight * areaWeight), capitalScore: yScore('2566'), baseline: 15000 },
        { name: 'ปี 2567', externalMetric: Math.round(18950 * genderWeight * areaWeight), capitalScore: yScore('2567'), baseline: 15000 },
        { name: 'ปี 2568 (ล่าสุด)', externalMetric: Math.round(18450 * genderWeight * areaWeight), capitalScore: yScore('2568'), baseline: 15000 }
      ];
    }
    if (topicId === 'family_elderly') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(14.8), capitalScore: yScore('2565'), baseline: 20.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(16.5), capitalScore: yScore('2566'), baseline: 20.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(17.8), capitalScore: yScore('2567'), baseline: 20.0 },
        { name: 'ปี 2568 (สธ.)', externalMetric: scaleFloat(18.5), capitalScore: yScore('2568'), baseline: 20.0 }
      ];
    }
    if (topicId === 'family_tpmap') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(45.2), capitalScore: yScore('2565'), baseline: 50.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(53.6), capitalScore: yScore('2566'), baseline: 50.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(62.1), capitalScore: yScore('2567'), baseline: 50.0 },
        { name: 'ปี 2568 (TPMAP)', externalMetric: scaleFloat(68.5), capitalScore: yScore('2568'), baseline: 50.0 }
      ];
    }
    if (topicId === 'family_teen_pregnancy') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(32.4), capitalScore: yScore('2565'), baseline: 25.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(28.1), capitalScore: yScore('2566'), baseline: 25.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(24.5), capitalScore: yScore('2567'), baseline: 25.0 },
        { name: 'ปี 2568 (สธ.)', externalMetric: scaleFloat(22.8), capitalScore: yScore('2568'), baseline: 25.0 }
      ];
    }
    if (topicId === 'wisdom_dropout') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(1.42), capitalScore: yScore('2565'), baseline: 1.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(1.25), capitalScore: yScore('2566'), baseline: 1.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(1.04), capitalScore: yScore('2567'), baseline: 1.0 },
        { name: 'ปี 2568 (กสศ.)', externalMetric: scaleFloat(0.92), capitalScore: yScore('2568'), baseline: 1.0 }
      ];
    }
    if (topicId === 'workplace_finance') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(11.2), capitalScore: yScore('2565'), baseline: 8.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(9.5), capitalScore: yScore('2566'), baseline: 8.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(8.4), capitalScore: yScore('2567'), baseline: 8.0 },
        { name: 'ปี 2568 (Happy)', externalMetric: scaleFloat(7.8), capitalScore: yScore('2568'), baseline: 8.0 }
      ];
    }
    if (topicId === 'wisdom_future_skills') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(65.2), capitalScore: yScore('2565'), baseline: 70.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(68.4), capitalScore: yScore('2566'), baseline: 70.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(70.5), capitalScore: yScore('2567'), baseline: 70.0 },
        { name: 'ปี 2568 (อว.)', externalMetric: scaleFloat(72.1), capitalScore: yScore('2568'), baseline: 70.0 }
      ];
    }
    if (topicId === 'workplace_safety') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(14.2), capitalScore: yScore('2565'), baseline: 10.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(12.1), capitalScore: yScore('2566'), baseline: 10.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(10.8), capitalScore: yScore('2567'), baseline: 10.0 },
        { name: 'ปี 2568 (รง.)', externalMetric: scaleFloat(9.8), capitalScore: yScore('2568'), baseline: 10.0 }
      ];
    }
    if (topicId === 'peer_traffic') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(78.5), capitalScore: yScore('2565'), baseline: 30.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(76.4), capitalScore: yScore('2566'), baseline: 30.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(75.1), capitalScore: yScore('2567'), baseline: 30.0 },
        { name: 'ปี 2568 (สตช.)', externalMetric: scaleFloat(74.0), capitalScore: yScore('2568'), baseline: 30.0 }
      ];
    }
    if (topicId === 'activity_drug') {
      return [
        { name: 'ปี 2565 (ก่อนโครงการ)', externalMetric: Math.round(1420 * combinedWeight), controlMetric: 1450, capitalScore: yScore('2565') },
        { name: 'ปี 2566', externalMetric: Math.round(1180 * combinedWeight), controlMetric: 1520, capitalScore: yScore('2566') },
        { name: 'ปี 2567', externalMetric: Math.round(950 * combinedWeight), controlMetric: 1580, capitalScore: yScore('2567') },
        { name: 'ปี 2568 (พื้นที่สร้างสรรค์)', externalMetric: Math.round(830 * combinedWeight), controlMetric: 1640, capitalScore: yScore('2568') }
      ];
    }
    if (topicId === 'peer_bullying') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(34.2), capitalScore: yScore('2565'), baseline: 25.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(29.8), capitalScore: yScore('2566'), baseline: 25.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(26.4), capitalScore: yScore('2567'), baseline: 25.0 },
        { name: 'ปี 2568 (สพฐ.)', externalMetric: scaleFloat(24.2), capitalScore: yScore('2568'), baseline: 25.0 }
      ];
    }
    if (topicId === 'activity_volunteer') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(65.4), capitalScore: yScore('2565'), baseline: 70.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(69.8), capitalScore: yScore('2566'), baseline: 70.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(73.5), capitalScore: yScore('2567'), baseline: 70.0 },
        { name: 'ปี 2568 (สสส.)', externalMetric: scaleFloat(76.8), capitalScore: yScore('2568'), baseline: 70.0 }
      ];
    }
    if (topicId === 'community_tpmap') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(38.4), capitalScore: yScore('2565'), baseline: 40.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(44.2), capitalScore: yScore('2566'), baseline: 40.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(52.8), capitalScore: yScore('2567'), baseline: 40.0 },
        { name: 'ปี 2568 (พช.)', externalMetric: scaleFloat(68.5), capitalScore: yScore('2568'), baseline: 40.0 }
      ];
    }
    if (topicId === 'community_crime') {
      return [
        { name: 'ปี 2565', externalMetric: Math.round(7160 * combinedWeight), controlMetric: 6980, capitalScore: yScore('2565') },
        { name: 'ปี 2566', externalMetric: Math.round(5420 * combinedWeight), controlMetric: 6850, capitalScore: yScore('2566') },
        { name: 'ปี 2567', externalMetric: Math.round(3890 * combinedWeight), controlMetric: 6720, capitalScore: yScore('2567') },
        { name: 'ปี 2568 (สตช.)', externalMetric: Math.round(2718 * combinedWeight), controlMetric: 6610, capitalScore: yScore('2568') }
      ];
    }
    if (topicId === 'community_welfare') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(62.4), capitalScore: yScore('2565'), baseline: 70.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(68.5), capitalScore: yScore('2566'), baseline: 70.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(72.1), capitalScore: yScore('2567'), baseline: 70.0 },
        { name: 'ปี 2568 (พม.)', externalMetric: scaleFloat(76.5), capitalScore: yScore('2568'), baseline: 70.0 }
      ];
    }
    if (topicId === 'community_recycle') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(14.2), capitalScore: yScore('2565'), baseline: 20.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(18.5), capitalScore: yScore('2566'), baseline: 20.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(22.8), capitalScore: yScore('2567'), baseline: 20.0 },
        { name: 'ปี 2568 (กสล.)', externalMetric: scaleFloat(26.5), capitalScore: yScore('2568'), baseline: 20.0 }
      ];
    }
    if (topicId === 'identity_mental') {
      return [
        { name: 'ปี 2565', externalMetric: Math.round(14200 * ageWeight), capitalScore: yScore('2565'), baseline: 25000 },
        { name: 'ปี 2566', externalMetric: Math.round(26400 * ageWeight), capitalScore: yScore('2566'), baseline: 25000 },
        { name: 'ปี 2567', externalMetric: Math.round(41800 * ageWeight), capitalScore: yScore('2567'), baseline: 25000 },
        { name: 'ปี 2568 (1323)', externalMetric: Math.round(54100 * ageWeight), capitalScore: yScore('2568'), baseline: 25000 }
      ];
    }
    if (topicId === 'identity_gambling') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(12.4), capitalScore: yScore('2565'), baseline: 15.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(15.2), capitalScore: yScore('2566'), baseline: 15.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(17.1), capitalScore: yScore('2567'), baseline: 15.0 },
        { name: 'ปี 2568 (พนันออนไลน์)', externalMetric: scaleFloat(18.2), capitalScore: yScore('2568'), baseline: 15.0 }
      ];
    }
    if (topicId === 'identity_media_literacy') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(48.5), capitalScore: yScore('2565'), baseline: 60.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(53.2), capitalScore: yScore('2566'), baseline: 60.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(57.8), capitalScore: yScore('2567'), baseline: 60.0 },
        { name: 'ปี 2568 (กสทช.)', externalMetric: scaleFloat(61.2), capitalScore: yScore('2568'), baseline: 60.0 }
      ];
    }
    if (topicId === 'identity_rq_resilience') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(7.8), capitalScore: yScore('2565'), baseline: 6.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(6.9), capitalScore: yScore('2566'), baseline: 6.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(6.1), capitalScore: yScore('2567'), baseline: 6.0 },
        { name: 'ปี 2568 (สธ.)', externalMetric: scaleFloat(5.4), capitalScore: yScore('2568'), baseline: 6.0 }
      ];
    }
    if (topicId === 'family_vulnerability_tpmap' || topicId === 'community_vulnerability_net') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(18.9), capitalScore: yScore('2565'), baseline: 15.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(16.4), capitalScore: yScore('2566'), baseline: 15.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(14.2), capitalScore: yScore('2567'), baseline: 15.0 },
        { name: 'ปี 2568 (TPMAP)', externalMetric: scaleFloat(12.4), capitalScore: yScore('2568'), baseline: 15.0 }
      ];
    }
    if (topicId === 'family_senior_care') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(22.4), capitalScore: yScore('2565'), baseline: 18.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(19.8), capitalScore: yScore('2566'), baseline: 18.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(16.5), capitalScore: yScore('2567'), baseline: 18.0 },
        { name: 'ปี 2568 (สธ.-พม.)', externalMetric: scaleFloat(14.2), capitalScore: yScore('2568'), baseline: 18.0 }
      ];
    }
    if (topicId === 'wisdom_debt_resilience' || topicId === 'identity_financial_sufficiency') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(1.95), capitalScore: yScore('2565'), baseline: 1.5 },
        { name: 'ปี 2566', externalMetric: scaleFloat(1.78), capitalScore: yScore('2566'), baseline: 1.5 },
        { name: 'ปี 2567', externalMetric: scaleFloat(1.58), capitalScore: yScore('2567'), baseline: 1.5 },
        { name: 'ปี 2568 (สถิติฯ-ธปท.)', externalMetric: scaleFloat(1.42), capitalScore: yScore('2568'), baseline: 1.5 }
      ];
    }
    if (topicId === 'wisdom_ita_governance' || topicId === 'community_ita_oversight') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(87.5), capitalScore: yScore('2565'), baseline: 90.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(90.2), capitalScore: yScore('2566'), baseline: 90.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(92.8), capitalScore: yScore('2567'), baseline: 90.0 },
        { name: 'ปี 2568 (ITA ป.ป.ช.)', externalMetric: scaleFloat(94.4), capitalScore: yScore('2568'), baseline: 90.0 }
      ];
    }
    if (topicId === 'peer_traffic_discipline' || topicId === 'identity_traffic_discipline') {
      return [
        { name: 'ปี 2565', externalMetric: scaleFloat(34.8), capitalScore: yScore('2565'), baseline: 25.0 },
        { name: 'ปี 2566', externalMetric: scaleFloat(31.2), capitalScore: yScore('2566'), baseline: 25.0 },
        { name: 'ปี 2567', externalMetric: scaleFloat(27.9), capitalScore: yScore('2567'), baseline: 25.0 },
        { name: 'ปี 2568 (3 ฐาน)', externalMetric: scaleFloat(24.8), capitalScore: yScore('2568'), baseline: 25.0 }
      ];
    }
  }

  // -----------------------------------------------------------------------
  // Mode 2: Specific Regional Comparison Topics (When Area Filter is selected)
  // -----------------------------------------------------------------------
  if (['family_elderly', 'community_tpmap'].includes(topicId) && area !== 'all') {
    const regionalData: Record<string, SynergyChartItem[]> = {
      north: [
        { name: 'ภาคเหนือ (พื้นที่เลือก)', externalMetric: scaleFloat(80.5), capitalScore: calcScore(80.50), baseline: 75.0 },
        { name: 'ภาคกลาง', externalMetric: 79.9, capitalScore: 79.95, baseline: 75.0 },
        { name: 'ค่าเฉลี่ยทั้งประเทศ', externalMetric: 79.1, capitalScore: 79.17, baseline: 75.0 },
        { name: 'ภาคอีสาน', externalMetric: 77.7, capitalScore: 77.75, baseline: 75.0 }
      ],
      bkk: [
        { name: 'กทม. และปริมณฑล (พื้นที่เลือก)', externalMetric: scaleFloat(76.8), capitalScore: calcScore(76.80), baseline: 75.0 },
        { name: 'ค่าเฉลี่ยทั้งประเทศ', externalMetric: 79.1, capitalScore: 79.17, baseline: 75.0 },
        { name: 'ภาคกลาง', externalMetric: 79.9, capitalScore: 79.95, baseline: 75.0 },
        { name: 'ภาคเหนือ', externalMetric: 80.5, capitalScore: 80.50, baseline: 75.0 }
      ],
      lamphun: [
        { name: 'จ.ลำพูน (ชุมชนต้นแบบ)', externalMetric: scaleFloat(85.1), capitalScore: calcScore(85.10), baseline: 75.0 },
        { name: 'ค่าเฉลี่ยภาคเหนือ', externalMetric: 78.6, capitalScore: 78.65, baseline: 75.0 },
        { name: 'ค่าเฉลี่ยทั้งประเทศ', externalMetric: 77.3, capitalScore: 77.39, baseline: 75.0 }
      ],
      nan: [
        { name: 'จ.น่าน (พอเพียงต้นแบบ)', externalMetric: scaleFloat(82.6), capitalScore: calcScore(82.60), baseline: 75.0 },
        { name: 'ค่าเฉลี่ยภาคเหนือ', externalMetric: 78.6, capitalScore: 78.65, baseline: 75.0 },
        { name: 'ค่าเฉลี่ยทั้งประเทศ', externalMetric: 77.3, capitalScore: 77.39, baseline: 75.0 }
      ]
    };
    if (regionalData[area]) return regionalData[area];
  }

  // -----------------------------------------------------------------------
  // Mode 3: Categorical Topics with Full Slicing Response
  // -----------------------------------------------------------------------
  // 1. Family Capital Topics
  if (topicId === 'family_juvenile') {
    return [
      { name: 'ครอบครัวเปราะบาง/หย่าร้าง (71%)', externalMetric: scaleVal(18450), capitalScore: calcScore(68.4), baseline: 12000 },
      { name: 'ครอบครัวอยู่ร่วมกันอบอุ่น (29%)', externalMetric: scaleVal(7460), capitalScore: calcScore(84.6), baseline: 12000 }
    ];
  }

  if (topicId === 'family_elderly') {
    return [
      { name: 'ครอบครัวเกื้อกูลสูง (ทุน >85)', externalMetric: scaleFloat(6.2), capitalScore: calcScore(86.8), baseline: 20.0 },
      { name: 'เกณฑ์เฉลี่ยประเทศ (ทุน 79.17)', externalMetric: scaleFloat(18.5), capitalScore: calcScore(79.17), baseline: 20.0 },
      { name: 'ครอบครัวเปราะบาง (ทุน <70)', externalMetric: scaleFloat(42.6), capitalScore: calcScore(65.2), baseline: 20.0 }
    ];
  }

  if (topicId === 'family_tpmap') {
    return [
      { name: 'ครัวเรือนทุนครอบครัวสูง (>80)', externalMetric: scaleFloat(68.5), capitalScore: calcScore(83.4), baseline: 50.0 },
      { name: 'ครัวเรือนระดับปานกลาง (70–79)', externalMetric: scaleFloat(44.2), capitalScore: calcScore(75.8), baseline: 50.0 },
      { name: 'ครัวเรือนเปราะบางวิกฤต (<70)', externalMetric: scaleFloat(20.2), capitalScore: calcScore(64.5), baseline: 50.0 }
    ];
  }

  if (topicId === 'family_teen_pregnancy') {
    return [
      { name: 'จังหวัดกลุ่มทุนครอบครัวสูง (Top 10)', externalMetric: scaleFloat(12.4), capitalScore: calcScore(83.2), baseline: 25.0 },
      { name: 'จังหวัดกลุ่มค่าเฉลี่ยประเทศ', externalMetric: scaleFloat(22.8), capitalScore: calcScore(79.17), baseline: 25.0 },
      { name: 'จังหวัดกลุ่มเปราะบาง (Bottom 10)', externalMetric: scaleFloat(34.5), capitalScore: calcScore(71.8), baseline: 25.0 }
    ];
  }

  // 2. Wisdom & Workplace Topics
  if (topicId === 'wisdom_dropout') {
    return [
      { name: 'กลุ่มทุนปัญญาสูง (Top 15 จว.)', externalMetric: scaleFloat(0.38), capitalScore: calcScore(84.5), baseline: 1.0 },
      { name: 'เกณฑ์เฉลี่ยประเทศ', externalMetric: scaleFloat(0.92), capitalScore: calcScore(78.88), baseline: 1.0 },
      { name: 'กลุ่มเปราะบาง (Bottom 15 จว.)', externalMetric: scaleFloat(1.65), capitalScore: calcScore(71.2), baseline: 1.0 }
    ];
  }

  if (topicId === 'workplace_finance') {
    return [
      { name: 'องค์กรคุณธรรม (Happy Workplace)', externalMetric: scaleFloat(3.2), capitalScore: calcScore(83.5), baseline: 8.0 },
      { name: 'สถานประกอบการทั่วไป', externalMetric: scaleFloat(7.8), capitalScore: calcScore(78.88), baseline: 8.0 },
      { name: 'แรงงานนอกระบบ/ภาคเกษตร', externalMetric: scaleFloat(13.8), capitalScore: calcScore(72.8), baseline: 8.0 }
    ];
  }

  if (topicId === 'wisdom_future_skills') {
    return [
      { name: 'บัณฑิตกลุ่มทุนปัญญาสูง', externalMetric: scaleFloat(88.4), capitalScore: calcScore(85.2), baseline: 70.0 },
      { name: 'บัณฑิตกลุ่มค่าเฉลี่ย', externalMetric: scaleFloat(72.1), capitalScore: calcScore(78.88), baseline: 70.0 },
      { name: 'บัณฑิตกลุ่มต้องพัฒนาทักษะ', externalMetric: scaleFloat(54.6), capitalScore: calcScore(70.5), baseline: 70.0 }
    ];
  }

  if (topicId === 'workplace_safety') {
    return [
      { name: 'สถานประกอบการคุณธรรม', externalMetric: scaleFloat(4.2), capitalScore: calcScore(84.2), baseline: 10.0 },
      { name: 'สถานประกอบการทั่วไป', externalMetric: scaleFloat(9.8), capitalScore: calcScore(78.88), baseline: 10.0 },
      { name: 'กลุ่มโรงงานอุตสาหกรรมเสี่ยง', externalMetric: scaleFloat(15.6), capitalScore: calcScore(72.4), baseline: 10.0 }
    ];
  }

  // 3. Peer & Activity Topics
  if (topicId === 'peer_traffic') {
    return [
      { name: 'กลางคืน รวมกลุ่มเพื่อน (20:00-04:00)', externalMetric: scaleFloat(74.0), capitalScore: calcScore(71.5), baseline: 30.0 },
      { name: 'กลางวัน เวลาเรียน/ทำงาน (08:00-16:00)', externalMetric: scaleFloat(14.5), capitalScore: calcScore(79.2), baseline: 30.0 },
      { name: 'ช่วงเปลี่ยนผ่าน (16:00-20:00)', externalMetric: scaleFloat(11.5), capitalScore: calcScore(77.44), baseline: 30.0 }
    ];
  }

  if (topicId === 'activity_drug') {
    return [
      { name: 'ปี 2565 (ก่อนโครงการ)', externalMetric: scaleVal(1420), controlMetric: 1450, capitalScore: calcScore(77.37) },
      { name: 'ปี 2566', externalMetric: scaleVal(1180), controlMetric: 1520, capitalScore: calcScore(82.97) },
      { name: 'ปี 2567', externalMetric: scaleVal(950), controlMetric: 1580, capitalScore: calcScore(76.83) },
      { name: 'ปี 2568 (พื้นที่สร้างสรรค์)', externalMetric: scaleVal(830), controlMetric: 1640, capitalScore: calcScore(77.44) }
    ];
  }

  if (topicId === 'peer_bullying') {
    return [
      { name: 'มีเพื่อนสนิทช่วยเหลือสม่ำเสมอ', externalMetric: scaleFloat(8.5), capitalScore: calcScore(82.4), baseline: 25.0 },
      { name: 'มีกลุ่มเพื่อนระดับปานกลาง', externalMetric: scaleFloat(24.2), capitalScore: calcScore(77.44), baseline: 25.0 },
      { name: 'โดดเดี่ยว ไร้เพื่อนรับฟัง (เสี่ยงสูง)', externalMetric: scaleFloat(48.6), capitalScore: calcScore(68.2), baseline: 25.0 }
    ];
  }

  if (topicId === 'activity_volunteer') {
    return [
      { name: 'พลังกิจกรรม & จิตสาธารณะ', externalMetric: scaleFloat(76.8), capitalScore: calcScore(77.44), baseline: 70.0 },
      { name: 'พลังเพื่อน & เครือข่าย', externalMetric: scaleFloat(74.5), capitalScore: calcScore(77.44), baseline: 70.0 },
      { name: 'พลังครอบครัว', externalMetric: scaleFloat(79.2), capitalScore: calcScore(79.17), baseline: 70.0 },
      { name: 'พลังชุมชน', externalMetric: scaleFloat(72.1), capitalScore: calcScore(77.39), baseline: 70.0 },
      { name: 'พลังตัวตน', externalMetric: scaleFloat(75.3), capitalScore: calcScore(79.93), baseline: 70.0 }
    ];
  }

  // 4. Community Topics
  if (topicId === 'community_tpmap') {
    return [
      { name: 'ตำบลคุณธรรม บวร. เข้มแข็ง', externalMetric: scaleFloat(68.5), capitalScore: calcScore(83.4), baseline: 40.0 },
      { name: 'ตำบลระดับปานกลาง', externalMetric: scaleFloat(48.2), capitalScore: calcScore(77.39), baseline: 40.0 },
      { name: 'ตำบลทั่วไปขาดกลไก บวร.', externalMetric: scaleFloat(32.6), capitalScore: calcScore(69.8), baseline: 40.0 }
    ];
  }

  if (topicId === 'community_crime') {
    return [
      { name: 'ปี 2565', externalMetric: scaleVal(7160), controlMetric: 6980, capitalScore: calcScore(72.17) },
      { name: 'ปี 2566', externalMetric: scaleVal(5420), controlMetric: 6850, capitalScore: calcScore(80.02) },
      { name: 'ปี 2567', externalMetric: scaleVal(3890), controlMetric: 6720, capitalScore: calcScore(74.84) },
      { name: 'ปี 2568 (สตช.)', externalMetric: scaleVal(2718), controlMetric: 6610, capitalScore: calcScore(77.39) }
    ];
  }

  if (topicId === 'community_welfare') {
    return [
      { name: 'ตำบลมีกองทุนสวัสดิการวันละบาท', externalMetric: scaleFloat(94.0), capitalScore: calcScore(82.8), baseline: 70.0 },
      { name: 'ตำบลมีกลุ่มออมทรัพย์ทั่วไป', externalMetric: scaleFloat(76.5), capitalScore: calcScore(77.39), baseline: 70.0 },
      { name: 'ตำบลขาดกองทุนสวัสดิการชุมชน', externalMetric: scaleFloat(52.4), capitalScore: calcScore(70.2), baseline: 70.0 }
    ];
  }

  if (topicId === 'community_recycle') {
    return [
      { name: 'ชุมชนต้นแบบธนาคารขยะพอเพียง', externalMetric: scaleFloat(42.0), capitalScore: calcScore(83.5), baseline: 20.0 },
      { name: 'ชุมชนระดับพัฒนา', externalMetric: scaleFloat(26.5), capitalScore: calcScore(77.39), baseline: 20.0 },
      { name: 'ชุมชนทั่วไปที่ยังไม่คัดแยก', externalMetric: scaleFloat(8.2), capitalScore: calcScore(71.0), baseline: 20.0 }
    ];
  }

  // 5. Identity Topics
  if (topicId === 'identity_mental') {
    return [
      { name: 'ปี 2565', externalMetric: scaleVal(14200), capitalScore: calcScore(81.86), baseline: 25000 },
      { name: 'ปี 2566', externalMetric: scaleVal(26400), capitalScore: calcScore(86.63), baseline: 25000 },
      { name: 'ปี 2567', externalMetric: scaleVal(41800), capitalScore: calcScore(79.84), baseline: 25000 },
      { name: 'ปี 2568 (สายด่วน 1323 พุ่ง)', externalMetric: scaleVal(54100), capitalScore: calcScore(79.93), baseline: 25000 }
    ];
  }

  if (topicId === 'identity_gambling') {
    return [
      { name: 'กลุ่มทุนตัวตนต่ำ (<70 วิกฤต)', externalMetric: scaleFloat(34.8), capitalScore: calcScore(66.5), baseline: 15.0 },
      { name: 'กลุ่มค่าเฉลี่ยประเทศ', externalMetric: scaleFloat(18.2), capitalScore: calcScore(79.93), baseline: 15.0 },
      { name: 'กลุ่มทุนตัวตนเข้มแข็ง (>82)', externalMetric: scaleFloat(8.2), capitalScore: calcScore(84.1), baseline: 15.0 }
    ];
  }

  if (topicId === 'identity_media_literacy') {
    return [
      { name: 'เยาวชนกลุ่มทุนตัวตนสูง (>80)', externalMetric: scaleFloat(84.5), capitalScore: calcScore(83.2), baseline: 60.0 },
      { name: 'เยาวชนกลุ่มค่าเฉลี่ยประเทศ', externalMetric: scaleFloat(61.2), capitalScore: calcScore(79.93), baseline: 60.0 },
      { name: 'เยาวชนกลุ่มเปราะบาง (<70)', externalMetric: scaleFloat(38.2), capitalScore: calcScore(67.4), baseline: 60.0 }
    ];
  }

  if (topicId === 'identity_rq_resilience') {
    return [
      { name: 'กลุ่มทุนตัวตนสูง (RQ สูง)', externalMetric: scaleFloat(2.8), capitalScore: calcScore(84.6), baseline: 6.0 },
      { name: 'กลุ่มค่าเฉลี่ยประเทศ', externalMetric: scaleFloat(5.4), capitalScore: calcScore(79.93), baseline: 6.0 },
      { name: 'กลุ่มเปราะบางจมปลัก (RQ ต่ำ)', externalMetric: scaleFloat(9.4), capitalScore: calcScore(67.2), baseline: 6.0 }
    ];
  }

  if (topicId === 'family_vulnerability_tpmap' || topicId === 'community_vulnerability_net') {
    return [
      { name: 'ภูมิภาคกลุ่มทุนครอบครัว/ชุมชนสูง (>82)', externalMetric: scaleFloat(10.2), capitalScore: calcScore(83.5), baseline: 15.0 },
      { name: 'ค่าเฉลี่ย 6 ภูมิภาค', externalMetric: scaleFloat(14.8), capitalScore: calcScore(78.5), baseline: 15.0 },
      { name: 'ภูมิภาคกลุ่มเปราะบาง (<75)', externalMetric: scaleFloat(24.5), capitalScore: calcScore(71.2), baseline: 15.0 }
    ];
  }

  if (topicId === 'family_senior_care') {
    return [
      { name: 'กลุ่มครอบครัวดูแลเข้มแข็ง (ทุน >82)', externalMetric: scaleFloat(11.2), capitalScore: calcScore(84.0), baseline: 20.0 },
      { name: 'เกณฑ์เฉลี่ยประเทศ', externalMetric: scaleFloat(18.5), capitalScore: calcScore(79.17), baseline: 20.0 },
      { name: 'กลุ่มผู้สูงอายุอยู่ลำพัง/เปราะบาง', externalMetric: scaleFloat(38.6), capitalScore: calcScore(68.5), baseline: 20.0 }
    ];
  }

  if (topicId === 'wisdom_debt_resilience' || topicId === 'identity_financial_sufficiency') {
    return [
      { name: 'กลุ่มทุนปัญญา/พอเพียงสูง (Top ภูมิภาค)', externalMetric: scaleFloat(0.95), capitalScore: calcScore(84.2), baseline: 1.5 },
      { name: 'เกณฑ์เฉลี่ยประเทศ', externalMetric: scaleFloat(1.42), capitalScore: calcScore(78.88), baseline: 1.5 },
      { name: 'กลุ่มเปราะบางหนี้บริโภคสูง', externalMetric: scaleFloat(2.65), capitalScore: calcScore(69.8), baseline: 1.5 }
    ];
  }

  if (topicId === 'wisdom_ita_governance' || topicId === 'community_ita_oversight') {
    return [
      { name: 'ภาคกลาง / ตะวันออก (ITA > 95)', externalMetric: scaleFloat(95.5), capitalScore: calcScore(84.8), baseline: 90.0 },
      { name: 'ภาคเหนือ / ตะวันตก (ITA ~ 94-95)', externalMetric: scaleFloat(94.6), capitalScore: calcScore(80.5), baseline: 90.0 },
      { name: 'ภาคใต้ / อีสาน (ITA ~ 92-94)', externalMetric: scaleFloat(93.2), capitalScore: calcScore(76.2), baseline: 90.0 }
    ];
  }

  if (topicId === 'peer_traffic_discipline' || topicId === 'identity_traffic_discipline') {
    return [
      { name: 'เยาวชนกลุ่มเพื่อนคุณธรรม/วินัยสูง', externalMetric: scaleFloat(16.5), capitalScore: calcScore(85.4), baseline: 25.0 },
      { name: 'เกณฑ์เฉลี่ยประเทศ', externalMetric: scaleFloat(24.8), capitalScore: calcScore(77.5), baseline: 25.0 },
      { name: 'กลุ่มเสี่ยงไม่สวมหมวกนิรภัย', externalMetric: scaleFloat(48.2), capitalScore: calcScore(68.2), baseline: 25.0 }
    ];
  }

  // Fallback
  return [
    { name: 'กลุ่มที่ 1', externalMetric: scaleFloat(65), capitalScore: calcScore(75.0) },
    { name: 'กลุ่มที่ 2', externalMetric: scaleFloat(80), capitalScore: calcScore(82.0) }
  ];
}
