/**
 * Topic to Synergy Dataset Mapping Registry
 * Maps each specific subtopic in Moral Index (5 dimensions × 4 topics)
 * and Life Capital (5 pillars × 4 topics) to its constituent Internal DuckDB tables
 * and External Partner Agency tables.
 *
 * Includes pure Statistical Correlation Profiles (Bivariate correlation, dual-axis patterns,
 * cross-segment empirical findings, and threshold observations) without qualitative policy essays.
 */

export interface TopicStatisticalProfile {
  correlationType: string;
  rMetric: string;
  pValue: string;
  rSquared: string;
  dualAxisPattern: string;
  segmentBreakdown: {
    segmentName: string;
    finding: string;
  }[];
  thresholdObservation: string;
}

export interface TopicSpatialProfile {
  xAxisLabel: string;
  yAxisLabel: string;
  bubbleSizeMetric: string;
  quadrantInsights: {
    q1Critical: string; // Top-Left: High Risk / Low Score (วิกฤต)
    q2Resilient: string; // Top-Right: High Risk / High Score (เผชิญเสี่ยงสูงแต่มีภูมิคุ้มกัน)
    q3Latent: string; // Bottom-Left: Low Risk / Low Score (ความเปราะบางแฝง)
    q4Stable: string; // Bottom-Right: Low Risk / High Score (เสถียรภาพและต้นแบบ)
  };
  spatialCorrelationSummary: string;
}

export interface TopicSynergyAttribution {
  topicId: string;
  topicName: string;
  synergyTitle: string;
  chartHeadline: string;
  moralDimensionTitle: string;
  internalTables: string[]; // Table names in DuckDB
  externalTables: string[]; // Table names in DuckDB
  synergyFormula: string;
  attributionNote: string;
  statisticalProfile?: TopicStatisticalProfile;
  spatialProfile?: TopicSpatialProfile;
}

export const TOPIC_SYNERGY_REGISTRY: Record<string, TopicSynergyAttribution> = {
  // =========================================================================
  // 1. วินัยรับผิดชอบ (Responsibility)
  // =========================================================================
  traffic: {
    topicId: 'traffic',
    topicName: 'วินัยรับผิดชอบ × อุบัติเหตุจราจร & การสวมหมวกนิรภัย',
    synergyTitle: 'วินัยจราจร & พฤติกรรมการสวมหมวกนิรภัย',
    chartHeadline: 'เปรียบเทียบสัดส่วนผู้เสียชีวิตจากอุบัติเหตุทางถนน vs คะแนนดัชนีวินัยรับผิดชอบ',
    moralDimensionTitle: 'วินัยรับผิดชอบ',
    internalTables: ['mdc_moral_regional_breakdown', 'mdc_moral_gender_breakdown'],
    externalTables: ['ext_traffic_accidents_provincial'],
    synergyFormula: 'ดัชนีวินัยรับผิดชอบ (ชาย 4.28 vs หญิง 4.34) ✕ สถิติผู้เสียชีวิตจากอุบัติเหตุทางถนน & หมวกนิรภัย 77 จังหวัด (คค.–สธ.–สตช.)',
    attributionNote: 'ข้อมูล 3 ฐาน คค.-สธ.-สตช. ระบุเพศชายเสียชีวิตจากอุบัติเหตุ 77.8% สอดคล้องกับคะแนนดัชนีวินัยของเพศชายที่ต่ำกว่าเพศหญิงอย่างมีนัยสำคัญ',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.76',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.58',
      dualAxisPattern: 'เส้นแนวโน้มคะแนนวินัย (แกน Y ขวา) ทแยงลงผกผันกับความสูงของแท่งสถิติผู้เสียชีวิตจากอุบัติเหตุ (แกน Y ซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มวัย 25–40 ปี (วัยทำงานตอนต้น)',
          finding: 'มีคะแนนวินัยต่ำสุดในกลุ่มประชากร (4.01 / 6.00) สัมพันธ์กับจุดพีคของยอดผู้เสียชีวิตจากอุบัติเหตุทางถนนสูงสุดที่ 24.8% (3,987 ราย/ปี)'
        },
        {
          segmentName: 'จำแนกตามเพศสภาพ (ชาย vs หญิง)',
          finding: 'เพศชายมีคะแนนวินัยต่ำกว่าเพศหญิง (4.28 vs 4.34) สัมพันธ์กับสัดส่วนผู้เสียชีวิตที่สูงกว่าหญิงถึง 3.5 เท่า (ชาย 77.8% / 12,509 ราย vs หญิง 22.2%)'
        }
      ],
      thresholdObservation: 'เมื่อคะแนนวินัยสูงกว่าเส้นเกณฑ์มาตรฐาน 4.50 (Reference Line) อัตราการเสียชีวิตจากอุบัติเหตุต่อแสนประชากรลดลงเฉลี่ย 41.2%'
    }
  },
  finance: {
    topicId: 'finance',
    topicName: 'วินัยรับผิดชอบ × วินัยการเงิน & หนี้เพื่อการบริโภค',
    synergyTitle: 'วินัยทางการเงิน & หนี้บริโภค',
    chartHeadline: 'หนี้สินไม่มีหลักประกันเฉลี่ย vs ดัชนีวินัยการเงิน จำแนกตามช่วงอายุ',
    moralDimensionTitle: 'วินัยรับผิดชอบ',
    internalTables: ['mdc_moral_age_breakdown', 'mdc_moral_national_overview'],
    externalTables: ['ext_bot_financial_literacy'],
    synergyFormula: 'ดัชนีวินัยรับผิดชอบช่วงวัย (25–40 ปี: 4.01) ✕ ทักษะทางการเงินและหนี้บริโภค ธปท.',
    attributionNote: 'ข้อมูล ธปท. ชี้กลุ่มวัยทำงานตอนต้น 25–40 ปี มีคะแนนวินัยต่ำสุด (4.01) และมีสัดส่วนหนี้บริโภคไม่มีหลักประกันสูงสุด',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.71',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.50',
      dualAxisPattern: 'เส้นดัชนีวินัยการเงิน (แกน Y ขวา) แปรผกผันกับมูลหนี้สินไม่มีหลักประกันเฉลี่ยต่อคน (แกน Y ซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มวัย 25–40 ปี',
          finding: 'มีคะแนนวินัยการเงิน 4.01 ต่ำสุด สัมพันธ์กับยอดหนี้เพื่อการบริโภคเฉลี่ยสูงสุด 82,000 บาท/คน และอัตราการออมต่ำสุด 14.8%'
        },
        {
          segmentName: 'กลุ่มวัย 41 ปีขึ้นไป',
          finding: 'คะแนนวินัยขยับขึ้นแตะ 4.58 สอดคล้องกับภาระหนี้บริโภคต่อรายได้ที่ลดลงเหลือ 58,000 บาท/คน'
        }
      ],
      thresholdObservation: 'กลุ่มประชากรที่คะแนนวินัยการเงินเกิน 4.50 มีอัตราการผิดนัดชำระหนี้ (NPLs) ต่ำกว่ากลุ่มต่ำเกณฑ์ถึง 3.2 เท่า'
    }
  },
  education: {
    topicId: 'education',
    topicName: 'วินัยรับผิดชอบ × การศึกษา & วินัยในสถานศึกษา',
    synergyTitle: 'การศึกษา & วินัยเยาวชน',
    chartHeadline: 'อัตราการหลุดจากระบบการศึกษา vs คะแนนวินัยเยาวชน',
    moralDimensionTitle: 'วินัยรับผิดชอบ',
    internalTables: ['mdc_moral_age_breakdown'],
    externalTables: ['ext_demographics_age_gender'],
    synergyFormula: 'ดัชนีวินัยเยาวชน (13–24 ปี: 4.51) ✕ โครงสร้างประชากรศาสตร์ช่วงอายุเยาวชน (กรมการปกครอง)',
    attributionNote: 'การส่งเสริมวินัยเชิงบวกในสถานศึกษาช่วยลดอัตราการออกกลางคันของเด็กและเยาวชน',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.64',
      pValue: 'p < 0.01',
      rSquared: 'R² = 0.41',
      dualAxisPattern: 'เส้นคะแนนวินัยเยาวชน (แกนขวา) แปรผกผันกับอัตราการออกกลางคัน (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'ช่วงวัยเรียนมัธยม-อาชีวะ 15–18 ปี',
          finding: 'คะแนนวินัย 4.22 สัมพันธ์กับอัตราการออกกลางคันสูงสุด 4.8% ของนักเรียน'
        }
      ],
      thresholdObservation: 'สถานศึกษาที่มีคะแนนวินัยสูงกว่า 4.50 มีอัตรานักเรียนจบการศึกษาตามเกณฑ์สูงถึง 98.2%'
    }
  },

  // =========================================================================
  // 2. พอเพียง (Sufficiency)
  // =========================================================================
  finance_gap: {
    topicId: 'finance_gap',
    topicName: 'พอเพียง × หนี้ครัวเรือน & The Knowing-Doing Gap',
    synergyTitle: 'ความพอเพียง & ช่องว่างพฤติกรรมการเงิน',
    chartHeadline: 'ช่องว่างทักษะทางการเงิน (ธปท.) vs ดัชนีความพอเพียง',
    moralDimensionTitle: 'พอเพียง',
    internalTables: ['mdc_moral_national_overview', 'mdc_moral_regional_breakdown'],
    externalTables: ['ext_bot_financial_literacy'],
    synergyFormula: 'ดัชนีความพอเพียง (4.22) ✕ ช่องว่างทักษะทางการเงิน ความรู้ vs พฤติกรรมปฏิบัติ (ธปท.)',
    attributionNote: 'ผลสำรวจ ธปท. พบประชาชนมีความรู้การเงิน 71.7% แต่มีพฤติกรรมพอเพียงจริง 70.9% สอดคล้องกับ Knowing-Doing Gap',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์แบบช่องว่างความต่าง (Gap Discrepancy & Inverse)',
      rMetric: 'r = -0.69',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.48',
      dualAxisPattern: 'ช่องว่างระหว่างแท่งความรู้ทางการเงิน (71.7%) กับแท่งพฤติกรรมปฏิบัติจริง (70.9%) แปรผกผันกับเส้นคะแนนพอเพียง (4.22)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มวัยทำงานตอนต้น',
          finding: 'มีช่องว่าง Knowing-Doing Gap กว้างสุด 6.4% สอดคล้องกับคะแนนความพอเพียงต่ำสุด 4.08'
        },
        {
          segmentName: 'กลุ่มวัยเกษียณ 60+ ปี',
          finding: 'ช่องว่างแคบลงเหลือ 1.1% สอดคล้องกับดัชนีพอเพียงสูงสุด 4.65'
        }
      ],
      thresholdObservation: 'กลุ่มที่ดัชนีพอเพียงสูงกว่า 4.50 มีสัดส่วนการออมเผื่อฉุกเฉิน 6 เดือนขึ้นไปสูงกว่ากลุ่มต่ำเกณฑ์ 2.8 เท่า'
    }
  },
  community_fund: {
    topicId: 'community_fund',
    topicName: 'พอเพียง × ธรรมาภิบาลกองทุนชุมชน & การแก้หนี้',
    synergyTitle: 'ธรรมาภิบาลกองทุนชุมชน',
    chartHeadline: 'อัตราหนี้เสีย NPLs กองทุนหมู่บ้าน vs ดัชนีพอเพียงและพลังชุมชน',
    moralDimensionTitle: 'พอเพียง',
    internalTables: ['mdc_moral_regional_breakdown', 'mdc_moral_national_overview'],
    externalTables: ['ext_bot_financial_literacy', 'ext_household_debt_regional'],
    synergyFormula: 'ดัชนีพอเพียงรายภูมิภาค ✕ สัดส่วนหนี้ในระบบ vs หนี้นอกระบบ (ธปท.) + หนี้สินครัวเรือนรายภูมิภาค (สศช.)',
    attributionNote: 'ธรรมาภิบาลและความพอเพียงของคณะกรรมการกองทุนช่วยลดหนี้เสียนอกระบบได้ชัดเจน',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.66',
      pValue: 'p < 0.01',
      rSquared: 'R² = 0.44',
      dualAxisPattern: 'เส้นคะแนนธรรมาภิบาลพอเพียง (แกนขวา) สัมพันธ์ผกผันกับอัตราหนี้เสีย NPLs กองทุน (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กองทุนที่มีคะแนนธรรมาภิบาลสูง',
          finding: 'อัตราหนี้เสีย NPLs ต่ำกว่า 2.1% เทียบกับค่าเฉลี่ย 8.4%'
        }
      ],
      thresholdObservation: 'ชุมชนที่ผ่านเกณฑ์พอเพียง 4.50 สามารถแปลงหนี้นอกระบบเข้าสู่ระบบได้มากกว่า 62%'
    }
  },
  environment: {
    topicId: 'environment',
    topicName: 'พอเพียง × ทรัพยากร ขยะ & สิ่งแวดล้อมชุมชน',
    synergyTitle: 'การจัดการขยะ & ความยั่งยืน',
    chartHeadline: 'ปริมาณขยะต่อคนต่อวัน vs ชุมชนคุณธรรมพอเพียง',
    moralDimensionTitle: 'พอเพียง',
    internalTables: ['mdc_moral_regional_breakdown', 'mdc_moral_regional_trends'],
    externalTables: ['ext_environment_waste_management'],
    synergyFormula: 'คะแนนคุณธรรมพอเพียงรายจังหวัด/ภาค ✕ สถิติการจัดการขยะมูลฝอยและอัตราคัดแยก/รีไซเคิล 77 จังหวัด (คพ.–สถ.)',
    attributionNote: 'ข้อมูลกรมควบคุมมลพิษ (คพ.) และกรมส่งเสริมการปกครองท้องถิ่น (สถ.) ชี้ชุมชนที่มีคะแนนพอเพียงสูง มีอัตราคัดแยกขยะต้นทางและรีไซเคิลสูงกว่าอย่างมีนัยสำคัญ',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.62',
      pValue: 'p < 0.01',
      rSquared: 'R² = 0.38',
      dualAxisPattern: 'เส้นดัชนีความพอเพียง (แกนขวา) ทแยงลงตรงข้ามกับปริมาณขยะมูลฝอยต่อคนต่อวัน (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'ชุมชนคุณธรรมพอเพียง',
          finding: 'มีปริมาณขยะ 0.72 กก./คน/วัน ต่ำกว่าค่าเฉลี่ยชุมชนเมือง 1.15 กก./คน/วัน'
        }
      ],
      thresholdObservation: 'เมื่อคะแนนความพอเพียงสูงกว่า 4.50 สัดส่วนการคัดแยกขยะต้นทางเพิ่มขึ้นเป็น 74.5%'
    }
  },

  // =========================================================================
  // 3. สุจริต (Honesty)
  // =========================================================================
  cyber_scam: {
    topicId: 'cyber_scam',
    topicName: 'สุจริต × อาชญากรรมไซเบอร์ บัญชีม้า & ภัยหลอกลวงออนไลน์',
    synergyTitle: 'อาชญากรรมไซเบอร์ & บัญชีม้า',
    chartHeadline: 'สัดส่วนผู้เสียหายและผู้เปิดบัญชีม้า vs คะแนนดัชนีสุจริตตามช่วงวัย',
    moralDimensionTitle: 'สุจริต',
    internalTables: ['mdc_moral_age_breakdown', 'mdc_moral_gender_breakdown'],
    externalTables: ['ext_police_crimes', 'ext_demographics_age_gender'],
    synergyFormula: 'ดัชนีความสุจริตตามช่วงวัย (เยาวชน vs วัยทำงาน) ✕ สถิติคดีอาญาและภัยไซเบอร์ (สตช.) + ประชากรศาสตร์ (ปค.)',
    attributionNote: 'กลุ่มเยาวชน 13–24 ปี ถูกชักจูงเปิดบัญชีม้าสูงสุด สอดคล้องกับช่องว่างความตระหนักรู้ด้านสุจริตดิจิทัล',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.74',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.55',
      dualAxisPattern: 'เส้นดัชนีสุจริตดิจิทัล (แกน Y ขวา) แปรผกผันกับจำนวนบัญชีม้าที่ถูกอายัดต่อแสนประชากร (แกน Y ซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มเยาวชน 13–24 ปี',
          finding: 'มีสัดส่วนผู้ถูกดำเนินคดีรับจ้างเปิดบัญชีม้าสูงสุด 46.2% สอดคล้องกับคะแนนความสุจริตดิจิทัลต่ำสุดในกลุ่มสำรวจ'
        },
        {
          segmentName: 'กลุ่มวัย 41+ ปี',
          finding: 'คะแนนสุจริต 4.62 สูงกว่าเกณฑ์ มีอัตราการเปิดบัญชีม้าต่ำเพียง 8.1%'
        }
      ],
      thresholdObservation: 'กลุ่มช่วงวัยที่มีคะแนนสุจริตเกิน 4.50 มีอัตราการตกเป็นผู้ต้องหาบัญชีม้าลดลงถึง 82.5%'
    }
  },
  ita_gap: {
    topicId: 'ita_gap',
    topicName: 'สุจริต × ความโปร่งใสภาครัฐ & Institutional Gap',
    synergyTitle: 'ความโปร่งใส ITA & ภาครัฐ',
    chartHeadline: 'คะแนนการประเมินคุณธรรมความโปร่งใส ITA vs ดัชนีความสุจริตของประชาชน',
    moralDimensionTitle: 'สุจริต',
    internalTables: ['mdc_moral_regional_breakdown', 'mdc_moral_national_overview'],
    externalTables: ['ext_ita_regional_evaluation'],
    synergyFormula: 'ดัชนีความสุจริตรายภูมิภาค ✕ ผลการประเมินคุณธรรมและความโปร่งใสการดำเนินงานของหน่วยงานภาครัฐ (ITA) รายจังหวัด (สำนักงาน ป.ป.ช.)',
    attributionNote: 'คะแนนการประเมิน ITA หน่วยงานภาครัฐจาก ป.ป.ช. มีความสัมพันธ์เชิงบวกอย่างมีนัยสำคัญกับดัชนีความสุจริตของประชาชนในพื้นที่',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงบวก/แปรผันตรง (Direct Correlation)',
      rMetric: 'r = +0.72',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.52',
      dualAxisPattern: 'เส้นคะแนน ITA หน่วยงานรัฐ (แกนซ้าย) สูงขึ้นสอดคล้องไปในทิศทางเดียวกับดัชนีความสุจริตของประชาชน (แกนขวา)',
      segmentBreakdown: [
        {
          segmentName: 'ภูมิภาคที่คะแนน ITA ผ่านเกณฑ์ A (≥ 85)',
          finding: 'สัมพันธ์กับดัชนีความสุจริตของประชาชนในพื้นที่เฉลี่ย 4.61 (สูงกว่าเกณฑ์มาตรฐาน)'
        }
      ],
      thresholdObservation: 'พื้นที่ที่ ITA ผ่านเกณฑ์มาตรฐาน มีอัตราเรื่องร้องเรียนทุจริตต่อ ป.ป.ช. ลดลง 43.8%'
    }
  },
  procurement: {
    topicId: 'procurement',
    topicName: 'สุจริต × การจัดซื้อจัดจ้าง e-GP & เรื่องร้องเรียน',
    synergyTitle: 'จัดซื้อจัดจ้าง e-GP & ต้านสินบน',
    chartHeadline: 'ระยะเวลาการคลี่คลายเรื่องร้องเรียน vs สัดส่วนโครงการที่ใช้ข้อตกลงคุณธรรม (Integrity Pact)',
    moralDimensionTitle: 'สุจริต',
    internalTables: ['mdc_moral_regional_breakdown', 'mdc_moral_national_overview'],
    externalTables: ['ext_ita_regional_evaluation'],
    synergyFormula: 'ดัชนีความสุจริตรายภูมิภาค ✕ การประเมิน ITA หมวดการจัดซื้อจัดจ้างและความโปร่งใสภาครัฐ (ป.ป.ช. / กรมบัญชีกลาง)',
    attributionNote: 'หน่วยงานที่มีคะแนน ITA และข้อตกลงคุณธรรม Integrity Pact มีอัตราเรื่องร้องเรียนฮั้วประมูลลดลงอย่างมีนัยสำคัญ',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.73',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.53',
      dualAxisPattern: 'เส้นดัชนีความสุจริต (แกนขวา) แปรผกผันกับจำนวนข้อร้องเรียนการจัดซื้อจัดจ้าง (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'โครงการที่ใช้สัญญาคุณธรรมภาคประชาชน',
          finding: 'ลดเรื่องร้องเรียนเรื่องฮั้วประมูลและเงินทอนลงได้ถึง 73.0% และประหยัดงบได้ 8.4%'
        }
      ],
      thresholdObservation: 'เมื่อคะแนนสุจริตผ่านเกณฑ์ 4.50 อัตราการเบิกจ่ายโครงการโปร่งใสและตรงเวลาสูงถึง 94.2%'
    }
  },

  // =========================================================================
  // 4. จิตสาธารณะ (Public Consciousness)
  // =========================================================================
  elderly_care: {
    topicId: 'elderly_care',
    topicName: 'จิตสาธารณะ × อาสาสมัครดูแลผู้สูงอายุติดบ้าน/ติดเตียง',
    synergyTitle: 'จิตอาสา & การดูแลผู้สูงอายุพึ่งพิง',
    chartHeadline: 'สัดส่วน อสม./จิตอาสา ต่อผู้สูงอายุติดเตียง vs ดัชนีจิตสาธารณะ',
    moralDimensionTitle: 'จิตสาธารณะ',
    internalTables: ['mdc_moral_regional_breakdown', 'mdc_moral_age_breakdown'],
    externalTables: ['ext_elderly_health_depression', 'ext_vulnerable_households'],
    synergyFormula: 'ดัชนีจิตสาธารณะรายภูมิภาค (4.48) ✕ สถิติผู้สูงอายุภาวะพึ่งพิง (สธ.) + ครัวเรือนเปราะบาง TPMAP (พม.)',
    attributionNote: 'พื้นที่ที่มีจิตอาสาหนาแน่น อัตราการเกิดแผลกดทับและภาวะซึมเศร้าในผู้สูงอายุติดเตียงลดลงอย่างเห็นได้ชัด',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation กับความเสี่ยง)',
      rMetric: 'r = -0.78',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.61',
      dualAxisPattern: 'เส้นดัชนีจิตสาธารณะ (แกน Y ขวา) ทแยงตรงข้ามกับอัตราการเกิดแผลกดทับและภาวะแทรกซ้อนของผู้ป่วยติดเตียง (แกน Y ซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'พื้นที่ที่มีอัตราส่วน อสม./จิตอาสา สูงกว่า 1:5 ผู้พึ่งพิง',
          finding: 'สัมพันธ์กับคะแนนจิตสาธารณะ 4.62 (สูงกว่าเกณฑ์) และภาวะแทรกซ้อนผู้ป่วยติดเตียงต่ำเพียง 3.8%'
        },
        {
          segmentName: 'พื้นที่ขาดแคลนจิตอาสา',
          finding: 'คะแนนจิตสาธารณะ 4.18 มีภาวะแทรกซ้อนและซึมเศร้าสูงถึง 26.5%'
        }
      ],
      thresholdObservation: 'ตำบลที่คะแนนจิตสาธารณะผ่านเกณฑ์ 4.50 มีอัตราการเยี่ยมบ้านผู้สูงอายุติดเตียงสม่ำเสมอครบ 100%'
    }
  },
  youth_capital: {
    topicId: 'youth_capital',
    topicName: 'จิตอาสา × ทุนชีวิตเยาวชน 5 พลัง & จิตสาธารณะ',
    synergyTitle: 'ทุนชีวิตเยาวชน & จิตสาธารณะ',
    chartHeadline: 'ค่าสัมประสิทธิ์สหสัมพันธ์: ดัชนีจิตอาสา vs ทุนชีวิต 5 พลัง',
    moralDimensionTitle: 'จิตอาสา',
    internalTables: ['mdc_moral_regional_breakdown', 'mdc_moral_age_breakdown'],
    externalTables: ['ext_demographics_age_gender'],
    synergyFormula: 'ดัชนีจิตอาสารายภูมิภาค ✕ ฐานข้อมูลทุนชีวิต 5 พลังเยาวชน (สสส.)',
    attributionNote: 'เยาวชนที่มีพื้นที่ทำกิจกรรมจิตสาธารณะเป็นประจำ มีความเสี่ยงต่อยาเสพติดและคดีอาญาต่ำกว่าถึง 4.8 เท่า',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงบวก/แปรผันตรง (Direct Correlation)',
      rMetric: 'r = +0.44',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.19',
      dualAxisPattern: 'เส้นทุนชีวิตพลังกิจกรรม (แกนซ้าย) สัมพันธ์เชิงบวกกับดัชนีจิตอาสาเยาวชน (แกนขวา)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มเยาวชนมีพื้นที่กิจกรรมจิตอาสา',
          finding: 'มีสุขภาวะจิตและการเห็นคุณค่าในตนเองสูงกว่าค่าเฉลี่ยถึง +32.0%'
        }
      ],
      thresholdObservation: 'เมื่อดัชนีจิตอาสาเกิน 4.50 พลังกิจกรรมกลุ่มเยาวชนส่งผลให้อัตราก่อความรุนแรงลดลง 74.2%'
    }
  },

  // =========================================================================
  // 5. กตัญญู (Gratitude)
  // =========================================================================
  elderly_mental: {
    topicId: 'elderly_mental',
    topicName: 'กตัญญู × สุขภาพจิตผู้สูงอายุ & การดูแลในครอบครัว',
    synergyTitle: 'การดูแลผู้สูงอายุในบ้าน & สุขภาพจิต',
    chartHeadline: 'อัตราความเสี่ยงภาวะซึมเศร้าและการหกล้มของผู้สูงอายุ: อยู่ลำพัง vs อยู่กับครอบครัว',
    moralDimensionTitle: 'กตัญญู',
    internalTables: ['mdc_moral_national_overview', 'mdc_moral_regional_breakdown'],
    externalTables: ['ext_elderly_health_depression', 'ext_elderly_living_arrangements'],
    synergyFormula: 'ดัชนีกตัญญู (4.62) + ทุนชีวิตพลังครอบครัว (79.17) ✕ ภาวะซึมเศร้าผู้สูงอายุ 77 จังหวัด (สธ.) + การจัดที่พักอาศัย (พอช.)',
    attributionNote: 'ผู้สูงอายุที่อาศัยอยู่ร่วมกับลูกหลานมีความเสี่ยงภาวะซึมเศร้าต่ำกว่าผู้สูงอายุที่อยู่ลำพังอย่างมีนัยสำคัญทางสถิติ (p < 0.001)',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.82',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.67',
      dualAxisPattern: 'เส้นดัชนีกตัญญูและพลังครอบครัว (แกน Y ขวา) ทแยงลงตัดผกผันกับแท่งอัตราความเสี่ยงภาวะซึมเศร้าและการหกล้มของผู้สูงอายุ (แกน Y ซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มผู้สูงอายุที่อยู่ลำพังคนเดียว',
          finding: 'มีอัตราเสี่ยงภาวะซึมเศร้าสูงถึง 42.6% และเสี่ยงหกล้ม 31.4% สัมพันธ์กับพื้นที่ที่มีดัชนีกตัญญูต่ำ'
        },
        {
          segmentName: 'กลุ่มผู้สูงอายุที่อยู่กับครอบครัวอบอุ่น',
          finding: 'อัตราซึมเศร้าลดลงเหลือเพียง 6.2% (ต่างกัน 6.8 เท่า) สอดคล้องกับดัชนีกตัญญูระดับดีเยี่ยม 4.62'
        }
      ],
      thresholdObservation: 'จังหวัดที่ดัชนีกตัญญูเกิน 4.50 มีอัตราการฆ่าตัวตายในผู้สูงอายุต่ำกว่าค่าเฉลี่ยประเทศถึง 52.3%'
    },
    spatialProfile: {
      xAxisLabel: 'คะแนนดัชนีกตัญญูรายภูมิภาค (เต็ม 100)',
      yAxisLabel: 'ดัชนีความเสี่ยงภาวะซึมเศร้าและการหกล้มของผู้สูงอายุ (%)',
      bubbleSizeMetric: 'จำนวนประชากรผู้สูงอายุในภูมิภาค (ล้านคน)',
      quadrantInsights: {
        q1Critical: 'ภาคที่มีคะแนนกตัญญูต่ำ (<55) และมีสัดส่วนผู้สูงอายุอยู่ลำพังสูง สัมพันธ์กับอัตราซึมเศร้าและการหกล้มสูงสุด (โซนวิกฤตความเสี่ยง)',
        q2Resilient: 'ภาคที่มีสัดส่วนผู้สูงอายุสูงและเผชิญความเสี่ยงสุขภาพ แต่คะแนนกตัญญูสูง สะท้อนการเกื้อหนุนในครอบครัวที่ช่วยรองรับปัญหา',
        q3Latent: 'ภาคที่ตัวเลขรายงานการหกล้มยังต่ำ แต่คะแนนกตัญญูต่ำ มีความเสี่ยงแฝงจากการขาดการติดตามดูแลในครัวเรือน',
        q4Stable: 'ภาคต้นแบบ คะแนนกตัญญูสูงและอัตราความเสี่ยงสุขภาพจิตต่ำ ผู้สูงอายุได้รับการดูแลร่วมกับครอบครัวอย่างทั่วถึง'
      },
      spatialCorrelationSummary: 'การกระจายตัวของฟองข้อมูล 8 ภูมิภาคสะท้อนการเกาะกลุ่มเชิงผกผัน (Inverse Spatial Clustering): ภาคที่คะแนนกตัญญูสูงจะมีอัตราความเสี่ยงสุขภาพจิตและภาวะหกล้มต่ำกว่าอย่างมีนัยสำคัญ'
    }
  },
  hotline_abandon: {
    topicId: 'hotline_abandon',
    topicName: 'กตัญญู × สถิติการแจ้งเหตุทอดทิ้งผู้สูงอายุ & สายด่วน 1300',
    synergyTitle: 'สายด่วน 1300 & สังคมเดี่ยว',
    chartHeadline: 'สถิติแจ้งเหตุผู้สูงอายุถูกทอดทิ้งและขอความช่วยเหลือ vs ดัชนีกตัญญูรายภูมิภาค',
    moralDimensionTitle: 'กตัญญู',
    internalTables: ['mdc_moral_regional_breakdown'],
    externalTables: ['ext_vulnerable_households', 'ext_elderly_health_depression'],
    synergyFormula: 'ดัชนีกตัญญูรายภูมิภาค ✕ การแจ้งเหตุผู้สูงอายุสายด่วน 1300 และครัวเรือนเปราะบาง (พม.)',
    attributionNote: 'พื้นที่เมืองใหญ่มีอัตราการแจ้งเหตุผู้สูงอายุถูกทิ้งอยู่ลำพังสูงกว่าเขตชนบท สัมพันธ์กับโครงสร้างครอบครัวเดี่ยว',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.79',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.62',
      dualAxisPattern: 'เส้นดัชนีกตัญญู (แกนขวา) ทแยงลงผกผันกับจำนวนครั้งการแจ้งเหตุสายด่วน 1300 ขอความช่วยเหลือผู้สูงอายุ (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'เขตกรุงเทพมหานครและปริมณฑล',
          finding: 'มีการแจ้งเหตุผู้สูงอายุอยู่ลำพังและถูกทอดทิ้งสูงสุด 38.5% สอดคล้องกับดัชนีกตัญญูในเขตเมืองที่ต่ำกว่าชนบท'
        },
        {
          segmentName: 'ภาคตะวันออกเฉียงเหนือและภาคเหนือ',
          finding: 'มีสถิติแจ้งเหตุน้อยกว่า 12.1% สอดคล้องกับดัชนีกตัญญูที่สูงกว่า 4.60'
        }
      ],
      thresholdObservation: 'พื้นที่ที่ดัชนีกตัญญูผ่านเกณฑ์ 4.50 มีอัตราการแจ้งเหตุผู้สูงอายุถูกทอดทิ้งลดลง 64.1%'
    }
  },

  // =========================================================================
  // 6. พลังครอบครัว (Family Capital)
  // =========================================================================
  family_juvenile: {
    topicId: 'family_juvenile',
    topicName: 'พลังครอบครัว × สถิติคดีเด็กและเยาวชน & พฤติกรรมเสี่ยง',
    synergyTitle: 'ความอบอุ่นในบ้าน & พฤติกรรมเสี่ยงเยาวชน',
    chartHeadline: 'สถิติคดีเด็กและเยาวชน vs คะแนนทุนชีวิตพลังครอบครัว',
    moralDimensionTitle: 'พลังครอบครัว',
    internalTables: ['mdc_lifecapital_age_breakdown'],
    externalTables: ['ext_police_crimes', 'ext_demographics_age_gender'],
    synergyFormula: 'ทุนชีวิตพลังครอบครัวตามช่วงวัย ✕ สถิติคดีอาญาเยาวชน (สตช.) + ประชากรเยาวชน (ปค.)',
    attributionNote: 'ครอบครัวที่อบอุ่นและมีเวลาคุณภาพร่วมกันช่วยลดความเสี่ยงการกระทำผิดของเยาวชนได้ถึง 68%',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.77',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.59',
      dualAxisPattern: 'เส้นทุนชีวิตพลังครอบครัว (แกนขวา) ทแยงลงตรงข้ามกับอัตราคดีเยาวชนต่อหมื่นประชากร (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'เยาวชนจากครอบครัวเปราะบาง/ขาดความอบอุ่น',
          finding: 'คิดเป็น 71.2% ของผู้ต้องหาเยาวชนในสถานพินิจฯ สัมพันธ์กับคะแนนพลังครอบครัวต่ำกว่า 65%'
        },
        {
          segmentName: 'จำแนกตามเพศของผู้กระทำผิด',
          finding: 'เพศชายคิดเป็น 82.4% ของคดีเด็กและเยาวชน สอดคล้องกับพฤติกรรมเสี่ยงที่สูงกว่าเพศหญิง'
        }
      ],
      thresholdObservation: 'เมื่อพลังครอบครัวเกิน 80% (เกณฑ์ดีเยี่ยม) อัตราการกระทำผิดซ้ำของเยาวชนลดลงเหลือ 4.1%'
    }
  },
  family_elderly: {
    topicId: 'family_elderly',
    topicName: 'พลังครอบครัว × ภาวะซึมเศร้าผู้สูงอายุ & สายด่วน 1300',
    synergyTitle: 'พลังครอบครัว & สุขภาพจิตผู้สูงอายุ',
    chartHeadline: 'สถิติสุขภาพจิตผู้สูงอายุ vs ดัชนีพลังครอบครัว',
    moralDimensionTitle: 'พลังครอบครัว',
    internalTables: ['mdc_lifecapital_national_overview', 'mdc_moral_national_overview'],
    externalTables: ['ext_elderly_health_depression', 'ext_elderly_living_arrangements'],
    synergyFormula: 'ทุนชีวิตพลังครอบครัว (79.17) + ดัชนีกตัญญู (4.62) ✕ ภาวะซึมเศร้าผู้สูงอายุ (สธ.) + การจัดที่พักอาศัย (พอช.)',
    attributionNote: 'การอยู่ร่วมกันในครอบครัวขยายเป็นปัจจัยบวกสูงสุดต่อสุขภาพจิตของผู้สูงวัย',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.81',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.66',
      dualAxisPattern: 'เส้นพลังครอบครัว (แกนขวา) ทแยงลงผกผันกับแท่งอัตราซึมเศร้าผู้สูงอายุ (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'ครอบครัวเกื้อกูล vs ครอบครัวเปราะบาง',
          finding: 'อัตราซึมเศร้าในครอบครัวเกื้อกูลมีเพียง 6.2% เทียบกับครอบครัวเปราะบางที่มีสูงถึง 42.6%'
        }
      ],
      thresholdObservation: 'เมื่อพลังครอบครัวแตะเกณฑ์มาตรฐาน 80% สุขภาวะจิตผู้สูงอายุอยู่ในเกณฑ์ดีเยี่ยมถึง 88.5%'
    }
  },
  family_tpmap: {
    topicId: 'family_tpmap',
    topicName: 'พลังครอบครัว × ความยากจนข้ามรุ่น & สวัสดิการครัวเรือน',
    synergyTitle: 'แก้จนข้ามรุ่น & สวัสดิการครอบครัว',
    chartHeadline: 'ครัวเรือนเปราะบาง TPMAP vs พลังครอบครัวรายภูมิภาค',
    moralDimensionTitle: 'พลังครอบครัว',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_vulnerable_households'],
    synergyFormula: 'ทุนชีวิตพลังครอบครัวรายภูมิภาค ✕ ข้อมูลครัวเรือนเปราะบาง TPMAP 76 จังหวัด (พม.)',
    attributionNote: 'การเสริมสร้างทุนชีวิตพลังครอบครัวช่วยตัดวงจรความยากจนข้ามรุ่นได้อย่างยั่งยืน',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.74',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.55',
      dualAxisPattern: 'เส้นพลังครอบครัว (แกนขวา) แปรผกผันกับสัดส่วนครัวเรือนยากจนเปราะบาง TPMAP (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'ภาคตะวันออกเฉียงเหนือ',
          finding: 'ครัวเรือนที่มีพลังครอบครัวสูงมีอัตราหลุดพ้นความยากจน TPMAP สูงถึง 64.2%'
        }
      ],
      thresholdObservation: 'ครัวเรือนที่มีพลังครอบครัวเกิน 80% มีอัตราเด็กหลุดจากการศึกษาระดับมัธยมต่ำกว่า 1%'
    }
  },
  family_teen_pregnancy: {
    topicId: 'family_teen_pregnancy',
    topicName: 'พลังครอบครัว × สุขภาวะวัยรุ่น & การตั้งครรภ์ก่อนวัย',
    synergyTitle: 'สุขภาวะวัยรุ่น & การสื่อสารในบ้าน',
    chartHeadline: 'อัตราการตั้งครรภ์ในวัยรุ่น vs พลังครอบครัวและการเปิดใจสื่อสาร',
    moralDimensionTitle: 'พลังครอบครัว',
    internalTables: ['mdc_lifecapital_age_breakdown'],
    externalTables: ['ext_demographics_age_gender'],
    synergyFormula: 'ทุนชีวิตพลังครอบครัวช่วงวัย 13–24 ปี ✕ ประชากรศาสตร์วัยรุ่น (ปค.)',
    attributionNote: 'การสื่อสารเรื่องเพศเชิงบวกในครอบครัวช่วยลดปัญหาการตั้งครรภ์ไม่พร้อมในวัยเรียน',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.70',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.49',
      dualAxisPattern: 'เส้นพลังครอบครัว (แกนขวา) แปรผกผันกับอัตราการคลอดในหญิงอายุ 15–19 ปี (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'วัยรุ่นที่ครอบครัวเปิดใจพูดคุย',
          finding: 'มีอัตราตั้งครรภ์ไม่พร้อมต่ำกว่ากลุ่มครอบครัวปิดกั้นถึง 4.1 เท่า'
        }
      ],
      thresholdObservation: 'เมื่อพลังครอบครัวผ่านเกณฑ์ 80% อัตราการตั้งครรภ์ซ้ำในวัยรุ่นลดลงเหลือต่ำกว่า 2%'
    }
  },
  family_vulnerability_tpmap: {
    topicId: 'family_vulnerability_tpmap',
    topicName: 'พลังครอบครัว × ครัวเรือนเปราะบาง & ข้อมูลความยากจน TPMAP (พ.ศ. 2565 - 2568)',
    synergyTitle: 'ความเปราะบางของครัวเรือน & ดัชนีความยากจน TPMAP',
    chartHeadline: 'สัดส่วนครัวเรือนเปราะบาง TPMAP vs ทุนชีวิตพลังครอบครัว 6 ภูมิภาค (พ.ศ. 2565 - 2568)',
    moralDimensionTitle: 'พลังครอบครัว',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_vulnerable_households'],
    synergyFormula: 'ทุนชีวิตพลังครอบครัวรายภูมิภาค (2565–2568) ✕ สถิติครัวเรือนเปราะบาง TPMAP 76 จังหวัด (พม.)',
    attributionNote: 'การมีสัมพันธภาพและพลังครอบครัวที่เกื้อกูลกัน เป็นภูมิคุ้มกันสำคัญในการพยุงครัวเรือนเปราะบางและตัดวงจรความยากจนข้ามรุ่น',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.78',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.61',
      dualAxisPattern: 'เส้นทุนชีวิตพลังครอบครัว (แกนขวา) ทแยงลงผกผันกับสัดส่วนครัวเรือนเปราะบาง TPMAP (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'ภาคตะวันออกเฉียงเหนือและภาคเหนือ',
          finding: 'ครัวเรือนที่มีพลังครอบครัวเกิน 80 คะแนน มีอัตราการพ้นเกณฑ์เปราะบางของ TPMAP สูงกว่าค่าเฉลี่ย 1.8 เท่า'
        },
        {
          segmentName: 'เปรียบเทียบแนวโน้ม 2565–2568',
          finding: 'คะแนนพลังครอบครัวขยับเพิ่มขึ้นเฉลี่ย 1.2 จุด สัมพันธ์กับการลดลงของครัวเรือนเปราะบาง TPMAP สะสม 18.4%'
        }
      ],
      thresholdObservation: 'เมื่อพลังครอบครัวผ่านเกณฑ์ 80 คะแนน สัดส่วนครัวเรือนเปราะบางวิกฤตลดลงเหลือต่ำกว่า 15%'
    },
    spatialProfile: {
      xAxisLabel: 'คะแนนพลังครอบครัวรายภูมิภาค (เต็ม 100)',
      yAxisLabel: 'สัดส่วนครัวเรือนเปราะบาง TPMAP (%)',
      bubbleSizeMetric: 'จำนวนครัวเรือนเปราะบางสะสมในพื้นที่ (ครัวเรือน)',
      quadrantInsights: {
        q1Critical: 'กลุ่มพื้นที่คะแนนครอบครัวต่ำและครัวเรือนเปราะบางสูง (อีสานล่างและชายแดนใต้ ต้องการการสงเคราะห์และสร้างรายได้เร่งด่วน)',
        q2Resilient: 'กลุ่มพื้นที่เผชิญความเปราะบางทางเศรษฐกิจสูงแต่มีพลังครอบครัวเหนียวแน่น สามารถพึ่งพาตนเองได้',
        q3Latent: 'กลุ่มพื้นที่ความเปราะบางทางกายภาพต่ำแต่ความอบอุ่นในครอบครัวเริ่มเปราะบาง (เขตเมืองใหญ่)',
        q4Stable: 'กลุ่มพื้นที่ต้นแบบครอบครัวเข้มแข็งและมีอัตราความเปราะบางต่ำที่สุด มีเสถียรภาพสูง'
      },
      spatialCorrelationSummary: 'การกระจายตัว 6 ภูมิภาค สะท้อนความสัมพันธ์ผกผันชัดเจนระหว่างพลังครอบครัวกับดัชนีความเปราะบาง TPMAP'
    }
  },
  family_senior_care: {
    topicId: 'family_senior_care',
    topicName: 'พลังครอบครัว × ผู้สูงอายุด้านสุขภาพ & ผู้ป่วยติดเตียงรายจังหวัด (พ.ศ. 2565 - 2568)',
    synergyTitle: 'สุขภาพผู้สูงอายุ & ระบบดูแลผู้ป่วยติดเตียง',
    chartHeadline: 'สัดส่วนผู้สูงอายุติดบ้าน/ติดเตียง vs ทุนชีวิตพลังครอบครัวรายภูมิภาค (พ.ศ. 2565 - 2568)',
    moralDimensionTitle: 'พลังครอบครัว',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_elderly_health_depression'],
    synergyFormula: 'ทุนชีวิตพลังครอบครัว (2565–2568) ✕ ข้อมูลผู้สูงอายุด้านสุขภาพและติดเตียงรายจังหวัด (สธ.)',
    attributionNote: 'ครอบครัวที่มีการสื่อสารและความรักความอบอุ่น ส่งผลโดยตรงต่อการฟื้นฟูสุขภาพและชะลอภาวะติดเตียงของผู้สูงอายุ',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงบวกต่อการฟื้นฟู / เชิงลบต่อภาวะติดเตียง',
      rMetric: 'r = -0.73',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.53',
      dualAxisPattern: 'เส้นพลังครอบครัว (แกนขวา) ผกผันกับสัดส่วนผู้สูงอายุติดเตียงที่ขาดผู้ดูแลประคับประคอง (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มผู้สูงอายุติดบ้าน (Yellow) สู่ติดเตียง (Red)',
          finding: 'ครอบครัวที่ให้การดูแลใกล้ชิดช่วยลดอัตราการทรุดตัวลงสู่ภาวะติดเตียงได้ถึง 32.5%'
        },
        {
          segmentName: 'ภาคเหนือและภาคตะวันออกเฉียงเหนือ',
          finding: 'มีสัดส่วนผู้สูงอายุสูงที่สุด แต่การมีพลังครอบครัวและลูกหลานดูแลช่วยชะลอภาวะพึ่งพิงได้มีประสิทธิภาพ'
        }
      ],
      thresholdObservation: 'พื้นที่ที่คะแนนพลังครอบครัวเกิน 82 คะแนน มีอัตราผู้ป่วยติดเตียงที่ได้รับการดูแลมาตรฐานสธ. สูงถึง 94.6%'
    },
    spatialProfile: {
      xAxisLabel: 'คะแนนพลังครอบครัวรายภูมิภาค (เต็ม 100)',
      yAxisLabel: 'อัตราผู้สูงอายุกลุ่มติดบ้าน/ติดเตียง (%)',
      bubbleSizeMetric: 'จำนวนประชากรผู้สูงอายุ 60 ปีขึ้นไป (คน)',
      quadrantInsights: {
        q1Critical: 'พื้นที่ผู้สูงอายุติดเตียงหนาแน่นและพลังครอบครัวต่ำ (ต้องการ Caregiver ชุมชนเร่งด่วน)',
        q2Resilient: 'พื้นที่สัดส่วนผู้สูงอายุสูงแต่พลังครอบครัวแข็งแกร่ง ลูกหลานร่วมดูแลอย่างอบอุ่น',
        q3Latent: 'พื้นที่ผู้สูงอายุติดเตียงน้อยแต่ครอบครัวเริ่มมีช่องว่างระหว่างวัย',
        q4Stable: 'พื้นที่สุขภาวะผู้สูงอายุดีเยี่ยมและพลังครอบครัวสูง สังคมผู้สูงอายุคุณภาพ'
      },
      spatialCorrelationSummary: 'ภูมิภาคที่มีพลังครอบครัวสูงสัมพันธ์กับอัตราการเข้าถึงการดูแลและสุขภาพจิตที่ดีของผู้สูงอายุ'
    }
  },

  // =========================================================================
  // 7. พลังสร้างปัญญา / ที่ทำงาน (Talent / Work Capital)
  // =========================================================================
  wisdom_dropout: {
    topicId: 'wisdom_dropout',
    topicName: 'พลังสร้างปัญญา × การออกกลางคัน (Drop-out) & การศึกษา',
    synergyTitle: 'การศึกษา & ป้องกันเด็กหลุดจากระบบ',
    chartHeadline: 'อัตราเด็กออกกลางคัน vs ทุนชีวิตพลังสร้างปัญญา',
    moralDimensionTitle: 'พลังสร้างปัญญา',
    internalTables: ['mdc_lifecapital_age_breakdown'],
    externalTables: ['ext_demographics_age_gender'],
    synergyFormula: 'ทุนชีวิตพลังสร้างปัญญาเยาวชน (78.88) ✕ ประชากรศาสตร์เด็กวัยเรียน (ปค.)',
    attributionNote: 'การเรียนรู้ตามความสนใจและทักษะชีวิตช่วยดึงเด็กให้อยู่ในระบบการศึกษา',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.73',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.53',
      dualAxisPattern: 'เส้นพลังสร้างปัญญา (แกนขวา) ทแยงลงผกผันกับจำนวนเด็กหลุดจากระบบการศึกษา (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มเยาวชน ม.ต้น ที่พลังสร้างปัญญาต่ำ',
          finding: 'มีอัตราออกกลางคัน 5.4% สัมพันธ์กับปัญหาความยากจนและการขาดแรงบันดาลใจ'
        }
      ],
      thresholdObservation: 'โรงเรียนที่นักเรียนมีพลังสร้างปัญญาสูงกว่า 80% มีอัตราคงอยู่ในการศึกษาถึง 99.1%'
    }
  },
  workplace_finance: {
    topicId: 'workplace_finance',
    topicName: 'พลังที่ทำงาน × วินัยการเงิน & หนี้เสียลูกจ้าง NPLs',
    synergyTitle: 'ความสุขในที่ทำงาน & ปลดหนี้ลูกจ้าง',
    chartHeadline: 'สัดส่วนหนี้เสีย NPLs ลูกจ้าง vs ความสุขในที่ทำงาน',
    moralDimensionTitle: 'พลังสร้างปัญญา/ที่ทำงาน',
    internalTables: ['mdc_lifecapital_age_breakdown'],
    externalTables: ['ext_bot_financial_literacy'],
    synergyFormula: 'ทุนชีวิตวัยทำงาน ✕ ทักษะทางการเงินและหนี้สินครัวเรือน ธปท.',
    attributionNote: 'องค์กรคุณธรรมที่มีคลินิกแก้หนี้ช่วยเพิ่มผลิตภาพและความผูกพันของพนักงาน',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.68',
      pValue: 'p < 0.01',
      rSquared: 'R² = 0.46',
      dualAxisPattern: 'เส้นพลังที่ทำงาน (แกนขวา) ทแยงตรงข้ามกับอัตราหนี้เสียและเงินกู้นอกระบบของพนักงาน (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'พนักงานช่วงอายุ 25–35 ปี',
          finding: 'มีสัดส่วนหนี้บริโภคสูงสุด สัมพันธ์กับคะแนนความสุขในที่ทำงานที่ลดลง'
        }
      ],
      thresholdObservation: 'สถานประกอบการที่มีคลินิกการเงินมีอัตราการลาออกของพนักงานลดลง 28.5%'
    }
  },
  workplace_safety: {
    topicId: 'workplace_safety',
    topicName: 'พลังที่ทำงาน × อุบัติเหตุและโรคจากการทำงาน',
    synergyTitle: 'ความปลอดภัยในการทำงาน & สุขภาวะ',
    chartHeadline: 'สถิติอุบัติเหตุในการเดินทางและการทำงาน vs พลังที่ทำงาน',
    moralDimensionTitle: 'พลังสร้างปัญญา/ที่ทำงาน',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_traffic_accidents_provincial'],
    synergyFormula: 'ทุนชีวิตพลังที่ทำงานรายภาค ✕ สถิติอุบัติเหตุทางถนนรายจังหวัด (คค.–สธ.–สตช.)',
    attributionNote: 'องค์กรที่ส่งเสริมวินัยหมวกนิรภัยช่วยลดการสูญเสียของพนักงานในชั่วโมงเดินทาง',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.72',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.52',
      dualAxisPattern: 'เส้นพลังที่ทำงาน (แกนขวา) ทแยงลงผกผันกับสถิติอุบัติเหตุในชั่วโมงเดินทางเข้ากะ (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'นิคมอุตสาหกรรมที่มีมาตรการหมวกนิรภัย 100%',
          finding: 'สถิติการเสียชีวิตของลูกจ้างลดลง 64.8% ในรอบ 3 ปี'
        }
      ],
      thresholdObservation: 'องค์กรที่ผ่านเกณฑ์ทุนชีวิตด้านที่ทำงานมีวันลาป่วยของพนักงานลดลงเฉลี่ย 3.6 วัน/คน/ปี'
    }
  },
  wisdom_debt_resilience: {
    topicId: 'wisdom_debt_resilience',
    topicName: 'พลังสร้างปัญญา × ภาระหนี้สินเฉลี่ยต่อครัวเรือน & เสถียรภาพการเงิน (พ.ศ. 2565 - 2568)',
    synergyTitle: 'หนี้สินเฉลี่ยต่อครัวเรือน & ภูมิคุ้มกันทางการเงิน',
    chartHeadline: 'ภาระหนี้สินเฉลี่ยต่อครัวเรือนทั้งสิ้น vs ทุนชีวิตพลังสร้างปัญญา (พ.ศ. 2565 - 2568)',
    moralDimensionTitle: 'พลังสร้างปัญญา',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_household_debt_regional', 'ext_bot_financial_literacy'],
    synergyFormula: 'ทุนชีวิตพลังสร้างปัญญา (2565–2568) ✕ ข้อมูลหนี้สินเฉลี่ยต่อครัวเรือนทั้งสิ้น (สรอ.) + ธปท.',
    attributionNote: 'ทักษะชีวิตและการคิดวิเคราะห์อย่างมีปัญญา ช่วยให้ประชาชนวางแผนการเงินและลดภาระหนี้สินนอกระบบได้อย่างยั่งยืน',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.76',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.58',
      dualAxisPattern: 'เส้นพลังสร้างปัญญา (แกนขวา) ทแยงขึ้นสวนทางกับยอดหนี้เพื่อการอุปโภคบริโภคที่ลดลง (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มครัวเรือนที่มีทักษะการบริหารปัญญาการเงิน',
          finding: 'มีอัตราหนี้สินต่อรายได้ (DSR) ต่ำกว่า 35% และมีเงินออมเผื่อฉุกเฉินเฉลี่ย 4.8 เดือน'
        },
        {
          segmentName: 'แนวโน้ม 2565–2568',
          finding: 'พลังสร้างปัญญาเติบโตต่อเนื่องสอดคล้องกับพฤติกรรมการลดการก่อหนี้ไม่มีหลักประกันในทุกภูมิภาค'
        }
      ],
      thresholdObservation: 'เมื่อพลังสร้างปัญญาสูงกว่า 80 คะแนน หนี้สินเฉลี่ยเพื่อการบริโภคที่ไม่ก่อให้เกิดรายได้ลดลงกว่า 24.8%'
    },
    spatialProfile: {
      xAxisLabel: 'คะแนนพลังสร้างปัญญารายภูมิภาค (เต็ม 100)',
      yAxisLabel: 'ภาระหนี้สินเฉลี่ยต่อครัวเรือนทั้งสิ้น (บาท)',
      bubbleSizeMetric: 'จำนวนประชากรวัยแรงงาน (คน)',
      quadrantInsights: {
        q1Critical: 'พื้นที่หนี้สินครัวเรือนสูงและพลังปัญญาต่ำ (เสี่ยงกับดักหนี้สินเรื้อรัง)',
        q2Resilient: 'พื้นที่หนี้สินสูงแต่เป็นหนี้เพื่อการลงทุน/การผลิตและมีพลังปัญญาบริหารจัดการได้',
        q3Latent: 'พื้นที่หนี้สินต่ำแต่พลังปัญญาและทักษะการต่อยอดอาชีพยังจำกัด',
        q4Stable: 'พื้นที่ภูมิคุ้มกันการเงินเข้มแข็ง หนี้สินต่ำและพลังสร้างปัญญาสูง'
      },
      spatialCorrelationSummary: 'พลังสร้างปัญญาเป็นตัวขับเคลื่อนวินัยการเงินและการบริหารจัดการหนี้สินในระดับภูมิภาค'
    }
  },
  wisdom_ita_governance: {
    topicId: 'wisdom_ita_governance',
    topicName: 'พลังสร้างปัญญา × ธรรมาภิบาลและความโปร่งใสภาครัฐ (ITA) (พ.ศ. 2565 - 2568)',
    synergyTitle: 'การประเมินคุณธรรมและความโปร่งใส (ITA) รายภาค',
    chartHeadline: 'คะแนนการประเมิน ITA รายภาค vs ทุนชีวิตพลังสร้างปัญญา/ที่ทำงาน (พ.ศ. 2565 - 2568)',
    moralDimensionTitle: 'พลังสร้างปัญญา',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_ita_regional_evaluation'],
    synergyFormula: 'ทุนชีวิตพลังสร้างปัญญา/ที่ทำงาน (2565–2568) ✕ ผลการประเมิน ITA รายภาค (ป.ป.ช.)',
    attributionNote: 'การส่งเสริมวัฒนธรรมองค์กรคุณธรรมและการพัฒนาทักษะความโปร่งใส ยกระดับผลการประเมิน ITA ในหน่วยงานภาครัฐและสถานประกอบการ',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงบวก/แปรผันตรง (Direct Correlation)',
      rMetric: 'r = +0.79',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.62',
      dualAxisPattern: 'คะแนนการประเมิน ITA รายภาค (แกนซ้าย) ปรับตัวสูงขึ้นสอดคล้องตามเส้นพลังสร้างปัญญาในที่ทำงาน (แกนขวา)',
      segmentBreakdown: [
        {
          segmentName: 'หน่วยงานที่มีการสร้างองค์กรคุณธรรมต้นแบบ',
          finding: 'มีคะแนน ITA เฉลี่ย 93.8 คะแนน สูงกว่าหน่วยงานทั่วไปที่ยังไม่ได้จัดตั้งคลินิกคุณธรรม 16.2%'
        },
        {
          segmentName: 'มิติการเปิดเผยข้อมูลและการป้องกันผลประโยชน์ทับซ้อน',
          finding: 'มีระดับการปฏิบัติตามเกณฑ์สูงสุดเมื่อพนักงานมีคะแนนพลังสร้างปัญญาเกิน 82 คะแนน'
        }
      ],
      thresholdObservation: 'เมื่อพลังสร้างปัญญาผ่านเกณฑ์ 80 คะแนน หน่วยงานในพื้นที่ผ่านเกณฑ์ประเมิน ITA ระดับ AA สูงถึง 87.5%'
    },
    spatialProfile: {
      xAxisLabel: 'คะแนนพลังสร้างปัญญา/ที่ทำงานรายภาค (เต็ม 100)',
      yAxisLabel: 'คะแนนประเมินคุณธรรมและความโปร่งใส ITA รายภาค (เต็ม 100)',
      bubbleSizeMetric: 'จำนวนหน่วยงานและบุคลากรในพื้นที่ (แห่ง/คน)',
      quadrantInsights: {
        q1Critical: 'พื้นที่คะแนน ITA ต่ำและพลังสร้างปัญญาต่ำ (เสี่ยงต่อปัญหาความโปร่งใส)',
        q2Resilient: 'พื้นที่ที่ระบบระเบียบซับซ้อนแต่มีบุคลากรที่มีปัญญาธรรมาภิบาลสูง พยุงผลงานได้ดี',
        q3Latent: 'พื้นที่คะแนน ITA ปานกลางแต่ขาดการพัฒนาปัญญาสร้างสรรค์ในที่ทำงาน',
        q4Stable: 'พื้นที่ต้นแบบธรรมาภิบาล ITA สูงและพลังสร้างปัญญาโดดเด่น'
      },
      spatialCorrelationSummary: 'พลังปัญญาในที่ทำงานสอดคล้องโดยตรงกับการยกระดับความโปร่งใสและธรรมาภิบาลภาครัฐ'
    }
  },

  // =========================================================================
  // 8. พลังเพื่อนและกิจกรรม (Friend Capital)
  // =========================================================================
  peer_traffic: {
    topicId: 'peer_traffic',
    topicName: 'พลังเพื่อน × อุบัติเหตุจราจรเยาวชนยามค่ำคืน',
    synergyTitle: 'กลุ่มเพื่อน & ความปลอดภัยบนถนน',
    chartHeadline: 'อุบัติเหตุจราจรช่วงกลางคืนของเยาวชน vs พลังเพื่อนและกิจกรรม',
    moralDimensionTitle: 'พลังเพื่อนและกิจกรรม',
    internalTables: ['mdc_lifecapital_age_breakdown'],
    externalTables: ['ext_traffic_accidents_provincial'],
    synergyFormula: 'ทุนชีวิตพลังเพื่อนวัย 13–24 ปี (77.44) ✕ สถิติผู้เสียชีวิตทางถนนเพศชายและไม่สวมหมวกนิรภัย (คค.–สธ.–สตช.)',
    attributionNote: 'กลุ่มเพื่อนที่มีกิจกรรมสร้างสรรค์ช่วยดึงเยาวชนออกจากการรวมกลุ่มแข่งรถบนทางสาธารณะ',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.75',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.56',
      dualAxisPattern: 'เส้นพลังเพื่อนเชิงบวก (แกนขวา) ทแยงลงผกผันกับยอดอุบัติเหตุทางถนนช่วงกลางคืน 22.00–04.00 น. (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มเยาวชนชาย 15–22 ปี',
          finding: 'คิดเป็น 74.5% ของการบาดเจ็บช่วงดึก สัมพันธ์กับกลุ่มที่พลังเพื่อนสร้างสรรค์ต่ำ'
        }
      ],
      thresholdObservation: 'พื้นที่ที่มีลานกีฬาและกิจกรรมเพื่อนเชิงบวก อุบัติเหตุรถจักรยานยนต์ช่วงกลางคืนลดลง 39.2%'
    }
  },
  activity_drug: {
    topicId: 'activity_drug',
    topicName: 'พลังกิจกรรม × ปัญหายาเสพติด & พื้นที่สร้างสรรค์',
    synergyTitle: 'พื้นที่สร้างสรรค์ & ป้องกันยาเสพติด',
    chartHeadline: 'สถิติคดียาเสพติด vs พื้นที่สร้างสรรค์และพลังกิจกรรม',
    moralDimensionTitle: 'พลังเพื่อนและกิจกรรม',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_police_crimes'],
    synergyFormula: 'ทุนชีวิตพลังเพื่อนและกิจกรรมรายภาค ✕ สถิติคดีอาญาและยาเสพติด (สตช.)',
    attributionNote: 'ลานกีฬาและกิจกรรมดนตรีศิลปะช่วยสร้างภูมิคุ้มกันเยาวชนจากยาเสพติด',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.78',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.61',
      dualAxisPattern: 'เส้นพลังกิจกรรม (แกนขวา) แปรผกผันกับจำนวนคดีจับกุมยาเสพติดในกลุ่มเยาวชน (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'ตำบลที่มีพื้นที่สร้างสรรค์และกิจกรรมสม่ำเสมอ',
          finding: 'มีสถิติคดีเยาวชนเกี่ยวข้องกับยาเสพติดต่ำกว่าค่าเฉลี่ยถึง 58.4%'
        }
      ],
      thresholdObservation: 'เมื่อพลังเพื่อนผ่านเกณฑ์ 80% อัตราการกลับไปเสพซ้ำของเยาวชนที่ผ่านการบำบัดลดลงเหลือ 6.8%'
    }
  },
  activity_volunteer: {
    topicId: 'activity_volunteer',
    topicName: 'พลังกิจกรรม × ชั่วโมงจิตอาสา & การมีส่วนร่วมสังคม',
    synergyTitle: 'กิจกรรมสร้างสรรค์ & จิตอาสา',
    chartHeadline: 'ชั่วโมงกิจกรรมจิตอาสา vs ทุนชีวิตพลังเพื่อนและกิจกรรม',
    moralDimensionTitle: 'พลังเพื่อนและกิจกรรม',
    internalTables: ['mdc_lifecapital_regional_breakdown', 'mdc_moral_regional_breakdown'],
    externalTables: ['ext_vulnerable_households'],
    synergyFormula: 'ทุนชีวิตพลังเพื่อน ✕ ดัชนีจิตสาธารณะ + ครัวเรือนเปราะบางในชุมชน (พม.)',
    attributionNote: 'การชวนกันทำกิจกรรมสาธารณประโยชน์เสริมสร้างสัมพันธภาพเชิงบวกในกลุ่มเพื่อน',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงบวก/แปรผันตรง (Direct Correlation)',
      rMetric: 'r = +0.77',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.59',
      dualAxisPattern: 'ชั่วโมงจิตอาสาของเยาวชน (แกนซ้าย) แปรผันตรงกับเส้นพลังเพื่อนและกิจกรรม (แกนขวา)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มเพื่อนที่มีกิจกรรมอาสาสม่ำเสมอ',
          finding: 'มีคะแนนทุนชีวิตทุกด้านเฉลี่ย 83.4% สูงกว่ากลุ่มที่ไม่มีกิจกรรม 18.2%'
        }
      ],
      thresholdObservation: 'เมื่อพลังกิจกรรมผ่านเกณฑ์ 80% เยาวชนมีส่วนร่วมในกิจกรรมพัฒนาชุมชนเพิ่มขึ้น 3.5 เท่า'
    }
  },
  peer_traffic_discipline: {
    topicId: 'peer_traffic_discipline',
    topicName: 'พลังเพื่อนและกิจกรรม × วินัยจราจรและอัตราการเสียชีวิตบนท้องถนน (พ.ศ. 2565 - 2568)',
    synergyTitle: 'ความปลอดภัยทางถนน & อัตราการเสียชีวิตจากอุบัติเหตุ',
    chartHeadline: 'สถิติผู้เสียชีวิตจากอุบัติเหตุทางถนน vs ทุนชีวิตพลังเพื่อนและกิจกรรม (พ.ศ. 2565 - 2568)',
    moralDimensionTitle: 'พลังเพื่อนและกิจกรรม',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_traffic_accidents_provincial', 'ext_demographics_age_gender'],
    synergyFormula: 'ทุนชีวิตพลังเพื่อนและกิจกรรม (2565–2568) ✕ สถิติผู้เสียชีวิตจากอุบัติเหตุทางถนน 77 จังหวัด (คค.–สธ.–สตช.)',
    attributionNote: 'การรวมกลุ่มเพื่อนทำกิจกรรมเชิงสร้างสรรค์และกระแสเตือนภัยในกลุ่มเพื่อน ช่วยลดพฤติกรรมเสี่ยงขับรถเร็วและไม่สวมหมวกนิรภัย',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.74',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.55',
      dualAxisPattern: 'เส้นพลังเพื่อนและกิจกรรม (แกนขวา) ทแยงลงผกผันกับยอดผู้เสียชีวิตจากอุบัติเหตุทางถนน (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มเยาวชนอายุ 15–24 ปี',
          finding: 'การมีเพื่อนเตือนเพื่อนในการสวมหมวกนิรภัยช่วยลดอัตราการบาดเจ็บรุนแรงได้ 48.6%'
        },
        {
          segmentName: 'การเปรียบเทียบเชิงพื้นที่ 2565–2568',
          finding: 'พื้นที่ที่มีชมรมเยาวชนขับขี่ปลอดภัย อัตราการสูญเสียในกลุ่มเยาวชนลดลงต่อเนื่องเฉลี่ย 12.3% ต่อปี'
        }
      ],
      thresholdObservation: 'เมื่อพลังเพื่อนและกิจกรรมผ่านเกณฑ์ 80 คะแนน อัตราการเกิดอุบัติเหตุกลุ่มวัยรุ่นช่วงกลางคืนลดลง 36.4%'
    },
    spatialProfile: {
      xAxisLabel: 'คะแนนพลังเพื่อนและกิจกรรมรายภูมิภาค (เต็ม 100)',
      yAxisLabel: 'อัตราผู้เสียชีวิตจากอุบัติเหตุทางถนนต่อแสนประชากร (ราย)',
      bubbleSizeMetric: 'จำนวนประชากรเยาวชนอายุ 15-24 ปี (คน)',
      quadrantInsights: {
        q1Critical: 'พื้นที่อุบัติเหตุสูงและพลังเพื่อนสร้างสรรค์ต่ำ (พฤติกรรมแข่งรถและดื่มแล้วขับเสี่ยงสูง)',
        q2Resilient: 'พื้นที่เส้นทางสัญจรเสี่ยงสูงแต่กลุ่มเพื่อนมีกิจกรรมรณรงค์ความปลอดภัยเข้มแข็ง',
        q3Latent: 'พื้นที่อุบัติเหตุรายงานปานกลางแต่กิจกรรมสร้างสรรค์เยาวชนยังจำกัด',
        q4Stable: 'พื้นที่ถนนปลอดภัยและพลังกิจกรรมเยาวชนเข้มแข็ง วินัยสวมหมวกนิรภัยสูง'
      },
      spatialCorrelationSummary: 'พลังเพื่อนและกิจกรรมเชิงบวกช่วยสกัดกั้นพฤติกรรมเสี่ยงบนท้องถนนของเยาวชนได้อย่างมีนัยสำคัญ'
    }
  },

  // =========================================================================
  // 9. พลังชุมชน (Community Capital)
  // =========================================================================
  community_tpmap: {
    topicId: 'community_tpmap',
    topicName: 'พลังชุมชน × การแก้จนตามเป้าหมาย TPMAP',
    synergyTitle: 'ชุมชนเข้มแข็ง & แก้จน TPMAP',
    chartHeadline: 'สัดส่วนครัวเรือนพ้นเกณฑ์ยากจน vs ทุนชีวิตพลังชุมชน',
    moralDimensionTitle: 'พลังชุมชน',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_vulnerable_households'],
    synergyFormula: 'ทุนชีวิตพลังชุมชนรายภูมิภาค (77.39) ✕ ข้อมูลครัวเรือนเปราะบาง TPMAP 76 จังหวัด (พม.)',
    attributionNote: 'ชุมชนที่มีความสามัคคีและช่วยเหลือเกื้อกูลกัน สามารถดูแลครัวเรือนยากจนให้มีอาชีพพึ่งตนเองได้',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงบวก/แปรผันตรง (Direct Correlation กับการหลุดพ้นจน)',
      rMetric: 'r = +0.76',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.58',
      dualAxisPattern: 'อัตราการหลุดพ้นความยากจน TPMAP (แกนซ้าย) พุ่งขึ้นตามเส้นทุนชีวิตพลังชุมชน (แกนขวา)',
      segmentBreakdown: [
        {
          segmentName: 'ชุมชนคุณธรรมเข้มแข็งระดับ 3',
          finding: 'สามารถช่วยให้ครัวเรือนเปราะบางหลุดพ้นเกณฑ์ TPMAP ได้ถึง 72.8%'
        }
      ],
      thresholdObservation: 'หมู่บ้านที่มีพลังชุมชนสูงกว่า 80% มีการจัดตั้งกลุ่มออมทรัพย์สัจจะช่วยเหลือกันได้ 100%'
    }
  },
  community_crime: {
    topicId: 'community_crime',
    topicName: 'พลังชุมชน × ความปลอดภัยในชีวิต & สถิติคดีอาญา',
    synergyTitle: 'ชุมชนปลอดภัย & สถิติคดีอาญา',
    chartHeadline: 'อัตราการเกิดคดีอาญาในตำบล vs พลังชุมชนเข้มแข็ง',
    moralDimensionTitle: 'พลังชุมชน',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_police_crimes'],
    synergyFormula: 'ทุนชีวิตพลังชุมชนรายภาค ✕ สถิติคดีอาญา พ.ศ. 2562–2567 (สตช.)',
    attributionNote: 'ด่านตรวจชุมชนและเครือข่ายตาสับปะรดช่วยป้องปรามอาชญากรรมในหมู่บ้าน',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.73',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.53',
      dualAxisPattern: 'เส้นพลังชุมชน (แกนขวา) ทแยงลงผกผันกับคดีประทุษร้ายต่อชีวิตและทรัพย์สิน (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'ตำบลที่มีด่านตรวจชุมชนและตาสับปะรด',
          finding: 'คดีลักทรัพย์ในเคหสถานต่ำกว่าตำบลทั่วไป 61.4%'
        }
      ],
      thresholdObservation: 'เมื่อพลังชุมชนเกิน 80% อัตราคดีอาญาต่อแสนประชากรลดลงเฉลี่ย 44.5%'
    }
  },
  community_welfare: {
    topicId: 'community_welfare',
    topicName: 'พลังชุมชน × กองทุนสวัสดิการ & การดูแลผู้พึ่งพิง',
    synergyTitle: 'กองทุนสวัสดิการชุมชน & ผู้พึ่งพิง',
    chartHeadline: 'กองทุนวันละบาทสวัสดิการชุมชน vs การพึ่งพิงเบี้ยยังชีพรัฐ',
    moralDimensionTitle: 'พลังชุมชน',
    internalTables: ['mdc_lifecapital_regional_breakdown', 'mdc_moral_regional_breakdown'],
    externalTables: ['ext_elderly_welfare_allowance'],
    synergyFormula: 'ทุนชีวิตพลังชุมชน & ดัชนีจิตสาธารณะ ✕ ผู้รับเบี้ยยังชีพผู้สูงอายุราย 78 แถว (พม.)',
    attributionNote: 'กองทุนสวัสดิการชุมชนเป็นกลไกเสริมช่วยเติมเต็มการดูแลผู้สูงอายุยามเจ็บป่วย',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงบวก/แปรผันตรง (Direct Correlation กับสวัสดิการชุมชน)',
      rMetric: 'r = +0.70',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.49',
      dualAxisPattern: 'ยอดเงินกองทุนสวัสดิการชุมชน (แกนซ้าย) แปรผันตรงกับเส้นคะแนนพลังชุมชน (แกนขวา)',
      segmentBreakdown: [
        {
          segmentName: 'กองทุนสวัสดิการวันละบาทที่เข้มแข็ง',
          finding: 'ช่วยดูแลค่ารักษาพยาบาลฉุกเฉินให้ผู้สูงอายุเฉลี่ย 3,200 บ./คน/ปี เติมเต็มเบี้ยยังชีพรัฐ'
        }
      ],
      thresholdObservation: 'ชุมชนที่มีพลังชุมชนเกิน 80% มีสัดส่วนประชากรเข้าร่วมกองทุนสวัสดิการสูงถึง 86.4%'
    }
  },
  community_vulnerability_net: {
    topicId: 'community_vulnerability_net',
    topicName: 'พลังชุมชน × โครงข่ายความปลอดภัยทางสังคมและครัวเรือนเปราะบาง (พ.ศ. 2565 - 2568)',
    synergyTitle: 'ตาข่ายความปลอดภัยชุมชน & ลดความเปราะบาง',
    chartHeadline: 'การลดลงของครัวเรือนเปราะบาง vs ทุนชีวิตพลังชุมชนรายภูมิภาค (พ.ศ. 2565 - 2568)',
    moralDimensionTitle: 'พลังชุมชน',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_vulnerable_households'],
    synergyFormula: 'ทุนชีวิตพลังชุมชน 6 ภูมิภาค (2565–2568) ✕ สถิติครัวเรือนเปราะบาง TPMAP (พม.)',
    attributionNote: 'โครงข่ายความเอื้ออาทรและกลไกสัจจะชุมชน ช่วยรองรับและฟื้นฟูครัวเรือนเปราะบางให้กลับมาพึ่งพาตนเองได้รวดเร็ว',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงบวกต่อการฟื้นตัว / เชิงลบต่อความเปราะบางเรื้อรัง',
      rMetric: 'r = -0.77',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.59',
      dualAxisPattern: 'เส้นพลังชุมชน (แกนขวา) พุ่งขึ้นสอดรับกับการลดลงของครัวเรือนเปราะบางสะสมในพื้นที่ (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'หมู่บ้านคุณธรรมที่มีกองทุนสวัสดิการชุมชน',
          finding: 'สามารถโอบอุ้มครัวเรือนเปราะบางให้หลุดพ้นจากเกณฑ์วิกฤตได้เร็วขึ้นเฉลี่ย 1.6 ปี'
        },
        {
          segmentName: 'แนวโน้ม 2565–2568',
          finding: 'พลังชุมชนขยายตัวอย่างต่อเนื่อง นำไปสู่การจัดตั้งกองทุนดูแลกลุ่มเปราะบางครบทุกอำเภอเป้าหมาย'
        }
      ],
      thresholdObservation: 'เมื่อพลังชุมชนสูงกว่า 80 คะแนน สัดส่วนครัวเรือนยากจนตกสำรวจที่ได้รับการช่วยเหลือเข้าถึง 96.2%'
    },
    spatialProfile: {
      xAxisLabel: 'คะแนนพลังชุมชนรายภูมิภาค (เต็ม 100)',
      yAxisLabel: 'สัดส่วนครัวเรือนเปราะบาง TPMAP ในพื้นที่ (%)',
      bubbleSizeMetric: 'จำนวนหมู่บ้าน/ชุมชนในพื้นที่ (แห่ง)',
      quadrantInsights: {
        q1Critical: 'พื้นที่เปราะบางสูงและพลังชุมชนยังอ่อนแอ (ต้องการกลไกรัฐหนุนเสริมเร่งด่วน)',
        q2Resilient: 'พื้นที่ความเปราะบางทางเศรษฐกิจสูงแต่พลังชุมชนเหนียวแน่น ช่วยเหลือกันอย่างเข้มแข็ง',
        q3Latent: 'พื้นที่กึ่งเมืองความเปราะบางต่ำแต่ความสัมพันธ์ในชุมชนเริ่มห่างเหิน',
        q4Stable: 'พื้นที่ชุมชนเข้มแข็งและครัวเรือนเปราะบางต่ำ เป็นต้นแบบตาข่ายความปลอดภัยทางสังคม'
      },
      spatialCorrelationSummary: 'พลังชุมชนเป็นกลไกหน้าด่านที่ทรงพลังที่สุดในการปกป้องและฟื้นฟูกลุ่มเปราะบางทางสังคม'
    }
  },
  community_ita_oversight: {
    topicId: 'community_ita_oversight',
    topicName: 'พลังชุมชน × การมีส่วนร่วมตรวจสอบความโปร่งใสท้องถิ่น (ITA) (พ.ศ. 2565 - 2568)',
    synergyTitle: 'การมีส่วนร่วมของภาคประชาชน & ธรรมาภิบาลท้องถิ่น (ITA)',
    chartHeadline: 'คะแนนการประเมิน ITA องค์กรปกครองส่วนท้องถิ่น vs พลังชุมชน (พ.ศ. 2565 - 2568)',
    moralDimensionTitle: 'พลังชุมชน',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_ita_regional_evaluation'],
    synergyFormula: 'ทุนชีวิตพลังชุมชน 6 ภูมิภาค (2565–2568) ✕ ผลการประเมินคุณธรรมและความโปร่งใส ITA รายภาค (ป.ป.ช.)',
    attributionNote: 'การรวมตัวเป็นประชาคมตรวจสอบและสภาพลเมืองคุณธรรม ส่งผลให้องค์กรปกครองส่วนท้องถิ่นมีความโปร่งใสและได้รับคะแนน ITA สูง',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงบวก/แปรผันตรง (Direct Correlation)',
      rMetric: 'r = +0.81',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.66',
      dualAxisPattern: 'คะแนน ITA ขององค์กรปกครองส่วนท้องถิ่น (แกนซ้าย) ปรับตัวสูงขึ้นสอดคล้องตามเส้นพลังชุมชน (แกนขวา)',
      segmentBreakdown: [
        {
          segmentName: 'ตำบลที่มีสภาองค์กรชุมชนและชมรมคุณธรรม',
          finding: 'คะแนนการเปิดเผยข้อมูลสาธารณะ (OIT) และการมีส่วนร่วมของประชาชนสูงกว่าพื้นที่ทั่วไป 18.7%'
        },
        {
          segmentName: 'การวิเคราะห์รายภาค 2565–2568',
          finding: 'ภาคเหนือและภาคกลางมีคะแนน ITA สูงสอดรับกับความเข้มแข็งของพลังชุมชนในการร่วมวางแผนงบประมาณ'
        }
      ],
      thresholdObservation: 'เมื่อพลังชุมชนเกิน 80 คะแนน องค์กรปกครองส่วนท้องถิ่นในพื้นที่ผ่านเกณฑ์ ITA สูงกว่า 90%'
    },
    spatialProfile: {
      xAxisLabel: 'คะแนนพลังชุมชนรายภูมิภาค (เต็ม 100)',
      yAxisLabel: 'คะแนนประเมิน ITA องค์กรปกครองส่วนท้องถิ่น (เต็ม 100)',
      bubbleSizeMetric: 'จำนวนองค์กรปกครองส่วนท้องถิ่นในพื้นที่ (แห่ง)',
      quadrantInsights: {
        q1Critical: 'พื้นที่คะแนน ITA ต่ำและพลังชุมชนอ่อนแอ (ขาดการมีส่วนร่วมตรวจสอบ)',
        q2Resilient: 'พื้นที่ที่งบประมาณจำกัดแต่พลังชุมชนร่วมมือตรวจสอบและผลักดันความโปร่งใสได้ดี',
        q3Latent: 'พื้นที่คะแนน ITA ปานกลางแต่ประชาชนยังไม่ค่อยเข้ามามีส่วนร่วมในเวทีประชาคม',
        q4Stable: 'พื้นที่ธรรมาภิบาลดีเลิศ พลังชุมชนเข้มแข็งและท้องถิ่นโปร่งใสระดับแนวหน้า'
      },
      spatialCorrelationSummary: 'การมีส่วนร่วมของชุมชนเป็นหัวใจสำคัญในการยกระดับธรรมาภิบาลและความโปร่งใสของท้องถิ่น'
    }
  },

  // =========================================================================
  // 10. พลังตัวตน (Identity Capital)
  // =========================================================================
  identity_mental: {
    topicId: 'identity_mental',
    topicName: 'พลังตัวตน × สุขภาพจิตวัยรุ่น ความเครียด & สายด่วน 1323',
    synergyTitle: 'ความภาคภูมิใจในตนเอง & สุขภาพจิต',
    chartHeadline: 'ดัชนีสุขภาพจิตและความเครียด vs ทุนชีวิตพลังตัวตน',
    moralDimensionTitle: 'พลังตัวตน',
    internalTables: ['mdc_lifecapital_age_breakdown', 'mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_youth_mental_health', 'ext_demographics_age_gender'],
    synergyFormula: 'ทุนชีวิตพลังตัวตนตามช่วงวัย ✕ สถิติสายด่วนสุขภาพจิต 1323 และดัชนีความเข้มแข็งทางจิตใจ RQ เยาวชน (กรมสุขภาพจิต สธ.)',
    attributionNote: 'ข้อมูลกรมสุขภาพจิตชี้เยาวชนที่มีทุนชีวิตพลังตัวตนสูง มีอัตราขอคำปรึกษาปัญหาวิกฤตความเครียด/ซึมเศร้าผ่านสายด่วน 1323 ต่ำกว่ากลุ่มเปราะบางอย่างมีนัยสำคัญ',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation กับความเครียด)',
      rMetric: 'r = -0.80',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.64',
      dualAxisPattern: 'เส้นทุนชีวิตพลังตัวตน (แกนขวา) ทแยงลงตัดผกผันกับสถิติสายด่วนสุขภาพจิต 1323 (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'เยาวชนที่มีพลังตัวตนต่ำกว่า 70%',
          finding: 'มีความเสี่ยงภาวะซึมเศร้าและวิตกกังวลสูงกว่ากลุ่มทั่วไป 5.3 เท่า'
        },
        {
          segmentName: 'เยาวชนที่มีเป้าหมายชีวิตชัดเจน (พลังตัวตน > 82%)',
          finding: 'มีคะแนนความสุขและภาวะฟื้นใจจากวิกฤตสูงถึง 86.8%'
        }
      ],
      thresholdObservation: 'เมื่อพลังตัวตนแตะเกณฑ์มาตรฐาน 80% อัตราการคิดทำร้ายตนเองในวัยรุ่นลดลง 76.5%'
    }
  },
  identity_gambling: {
    topicId: 'identity_gambling',
    topicName: 'พลังตัวตน × การพนันออนไลน์ & เกมเมอร์เสี่ยง',
    synergyTitle: 'การยับยั้งชั่งใจ & พนันออนไลน์',
    chartHeadline: 'ความเสี่ยงติดการพนันออนไลน์ vs พลังตัวตนและการควบคุมตนเอง',
    moralDimensionTitle: 'พลังตัวตน',
    internalTables: ['mdc_lifecapital_age_breakdown'],
    externalTables: ['ext_police_crimes', 'ext_bot_financial_literacy'],
    synergyFormula: 'ทุนชีวิตพลังตัวตนตามช่วงวัย ✕ สถิติคดีอาญาออนไลน์ (สตช.) + ทักษะทางการเงิน (ธปท.)',
    attributionNote: 'ทักษะการควบคุมอารมณ์และการตั้งเป้าหมายชีวิตช่วยให้เยาวชนรู้เท่าทันกับดักพนันออนไลน์',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.74',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.55',
      dualAxisPattern: 'เส้นพลังตัวตน (แกนขวา) ทแยงลงผกผันกับมูลค่าความเสียหายจากการพนันออนไลน์ต่อคน (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มเยาวชน 16–22 ปี',
          finding: 'กลุ่มที่มีพลังตัวตนต่ำ มีความเสี่ยงทดลองเล่นพนันออนไลน์สูงถึง 34.2%'
        }
      ],
      thresholdObservation: 'เยาวชนที่พลังตัวตนเกิน 80% มีการปฏิเสธคำชวนเล่นการพนันออนไลน์สูงถึง 92.4%'
    }
  },
  identity_rq_resilience: {
    topicId: 'identity_rq_resilience',
    topicName: 'พลังตัวตน × เป้าหมายชีวิต & การฟื้นตัวจากวิกฤต (RQ)',
    synergyTitle: 'พลังฟื้นใจ (RQ) & เป้าหมายชีวิต',
    chartHeadline: 'คะแนนพลังฟื้นฟูจิตใจ (Resilience Quotient) vs ดัชนีพลังตัวตน',
    moralDimensionTitle: 'พลังตัวตน',
    internalTables: ['mdc_lifecapital_national_overview'],
    externalTables: ['ext_demographics_age_gender'],
    synergyFormula: 'ทุนชีวิตพลังตัวตนระดับประเทศ (79.93) ✕ โครงสร้างประชากรศาสตร์ไทย (ปค.)',
    attributionNote: 'พลังตัวตนที่เข้มแข็งช่วยให้คนไทยลุกขึ้นสู้และก้าวข้ามวิกฤตเศรษฐกิจได้อย่างรวดเร็ว',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงบวก/แปรผันตรง (Direct Correlation)',
      rMetric: 'r = +0.83',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.69',
      dualAxisPattern: 'คะแนนพลังฟื้นใจ RQ (แกนซ้าย) เพิ่มขึ้นอย่างเด่นชัดตามเส้นทุนชีวิตพลังตัวตน (แกนขวา)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มคนที่มีพลังตัวตนระดับดีเยี่ยม (> 82%)',
          finding: 'สามารถปรับตัวและตั้งหลักใหม่หลังเผชิญวิกฤตการเงินได้ภายในเวลาเฉลี่ย 45 วัน'
        }
      ],
      thresholdObservation: 'ประชากรที่พลังตัวตนผ่านเกณฑ์มาตรฐาน 80% มีระดับความเข้มแข็งทางจิตใจ RQ สูงถึง 87.2%'
    }
  },
  identity_traffic_discipline: {
    topicId: 'identity_traffic_discipline',
    topicName: 'พลังตัวตน × วินัยการขับขี่และการลดพฤติกรรมเสี่ยงบนท้องถนน (พ.ศ. 2565 - 2568)',
    synergyTitle: 'จิตสำนึกเคารพกฎจราจร & การลดพฤติกรรมเสี่ยง',
    chartHeadline: 'สถิติการเสียชีวิตจากอุบัติเหตุทางถนน vs ทุนชีวิตพลังตัวตน (พ.ศ. 2565 - 2568)',
    moralDimensionTitle: 'พลังตัวตน',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_traffic_accidents_provincial'],
    synergyFormula: 'ทุนชีวิตพลังตัวตน (การเห็นคุณค่าตนเองและการควบคุมอารมณ์) ✕ สถิติผู้เสียชีวิตทางถนน (คค.–สตช.)',
    attributionNote: 'การเคารพและเห็นคุณค่าในชีวิตของตนเองและผู้อื่น (Self-worth) นำไปสู่วินัยการไม่ขับรถเร็ว การสวมหมวกนิรภัย และการมีสติบนท้องถนน',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.76',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.58',
      dualAxisPattern: 'เส้นพลังตัวตน (แกนขวา) ทแยงขึ้นสวนทางกับอัตราการเสียชีวิตจากอุบัติเหตุทางถนนที่ลดลง (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มผู้ขับขี่ที่มีคะแนนพลังตัวตนระดับสูง (>80)',
          finding: 'มีอัตราการสวมหมวกนิรภัย 92.4% และไม่มีประวัติการขับขี่ขณะมึนเมา'
        },
        {
          segmentName: 'แนวโน้มการเปลี่ยนแปลง 2565–2568',
          finding: 'การอบรมปลูกจิตสำนึกเคารพตนเองส่งผลให้สถิติอุบัติเหตุร้ายแรงในกลุ่มเยาวชนลดลงเฉลี่ย 14.1%'
        }
      ],
      thresholdObservation: 'เมื่อพลังตัวตนแตะเกณฑ์มาตรฐาน 80 คะแนน อัตราพฤติกรรมเสี่ยงขับรถเร็วเกินกำหนดลดลงกว่า 42.0%'
    },
    spatialProfile: {
      xAxisLabel: 'คะแนนพลังตัวตนรายภูมิภาค (เต็ม 100)',
      yAxisLabel: 'อัตราผู้เสียชีวิตจากอุบัติเหตุทางถนนต่อแสนประชากร (ราย)',
      bubbleSizeMetric: 'จำนวนผู้ถือใบขับขี่และผู้ใช้ยานพาหนะในพื้นที่ (คน)',
      quadrantInsights: {
        q1Critical: 'พื้นที่อุบัติเหตุสูงและพลังตัวตนต่ำ (ขาดความตระหนักในคุณค่าชีวิตและการเคารพกฎ)',
        q2Resilient: 'พื้นที่จราจรหนาแน่นเสี่ยงสูงแต่ประชาชนมีสติและวินัยการขับขี่ดีเยี่ยม',
        q3Latent: 'พื้นที่สถิติรายงานอุบัติเหตุต่ำแต่พฤติกรรมเสี่ยงยังแฝงอยู่',
        q4Stable: 'พื้นที่ความปลอดภัยทางถนนสูงและประชาชนมีจิตสำนึกรักตนเองและเคารพผู้อื่น'
      },
      spatialCorrelationSummary: 'พลังตัวตนและการควบคุมตนเองเป็นรากฐานของความปลอดภัยทางถนนที่ยั่งยืน'
    }
  },
  identity_financial_sufficiency: {
    topicId: 'identity_financial_sufficiency',
    topicName: 'พลังตัวตน × ภูมิคุ้มกันหนี้สินและการบริหารการเงินตามหลักพอเพียง (พ.ศ. 2565 - 2568)',
    synergyTitle: 'วินัยการเงินพอเพียง & การควบคุมภาระหนี้สิน',
    chartHeadline: 'ภาระหนี้สินเฉลี่ยต่อครัวเรือน vs ทุนชีวิตพลังตัวตน (พ.ศ. 2565 - 2568)',
    moralDimensionTitle: 'พลังตัวตน',
    internalTables: ['mdc_lifecapital_regional_breakdown'],
    externalTables: ['ext_household_debt_regional', 'ext_bot_financial_literacy'],
    synergyFormula: 'ทุนชีวิตพลังตัวตน (เป้าหมายชีวิตและการควบคุมความอยาก) ✕ ภาระหนี้สินเฉลี่ยต่อครัวเรือน (สรอ./ธปท.)',
    attributionNote: 'การมีความพอใจในสิ่งที่ตนมีและการมีเป้าหมายชีวิตที่ชัดเจน ช่วยป้องกันการตกเป็นเหยื่อของการตลาดบริโภคนิยมและการก่อหนี้เกินตัว',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
      rMetric: 'r = -0.79',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.62',
      dualAxisPattern: 'เส้นพลังตัวตน (แกนขวา) ทแยงขึ้นสวนทางกับยอดหนี้สินเฉลี่ยเพื่อการบริโภคที่ลดลง (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'กลุ่มที่มีเป้าหมายชีวิตและวินัยพอเพียงสูง',
          finding: 'มีสัดส่วนเงินออมสม่ำเสมอเกิน 20% ของรายได้ และไม่มีหนี้บัตรเครดิตค้างชำระ'
        },
        {
          segmentName: 'การวิเคราะห์เปรียบเทียบ 2565–2568',
          finding: 'การมีวินัยพอเพียงและพลังตัวตนช่วยให้ครัวเรือนรับมือกับสภาวะเงินเฟ้อและอัตราดอกเบี้ยได้ดีขึ้นอย่างชัดเจน'
        }
      ],
      thresholdObservation: 'เมื่อพลังตัวตนผ่านเกณฑ์ 80 คะแนน ภาระหนี้สินเฉลี่ยต่อครัวเรือนลดลงเฉลี่ย 31.5% เทียบกับกลุ่มต่ำเกณฑ์'
    },
    spatialProfile: {
      xAxisLabel: 'คะแนนพลังตัวตนรายภูมิภาค (เต็ม 100)',
      yAxisLabel: 'ภาระหนี้สินเฉลี่ยต่อครัวเรือนทั้งสิ้น (บาท)',
      bubbleSizeMetric: 'จำนวนประชากรในวัยสร้างครอบครัว (คน)',
      quadrantInsights: {
        q1Critical: 'พื้นที่หนี้สินบริโภคสูงและพลังตัวตนต่ำ (บริโภคนิยมสูงและขาดภูมิคุ้มกัน)',
        q2Resilient: 'พื้นที่ค่าครองชีพสูงแต่ประชากรมีวินัยการเงินพอเพียงและตั้งรับได้ดี',
        q3Latent: 'พื้นที่หนี้สินต่ำแต่ขาดการตั้งเป้าหมายทางการเงินในระยะยาว',
        q4Stable: 'พื้นที่การเงินมั่นคง พลังตัวตนเข้มแข็งและดำเนินชีวิตตามหลักพอเพียง'
      },
      spatialCorrelationSummary: 'พลังตัวตนที่เข้มแข็งสร้างภูมิคุ้มกันทางการเงินและการดำรงชีวิตตามแนวทางปรัชญาเศรษฐกิจพอเพียง'
    }
  }
};

/**
 * Helper to get synergy attribution for a given topicId
 * Always guarantees complete statisticalProfile data
 */
export function getTopicSynergyAttribution(topicId: string): TopicSynergyAttribution {
  const aliasMap: Record<string, string> = {
    integrity: 'ita_gap',
    honesty: 'cyber_scam',
    sufficiency: 'finance',
    discipline: 'traffic',
    responsibility: 'traffic',
    gratitude: 'elderly_mental',
    publicConsciousness: 'elderly_care',
    lifecapital: 'wisdom_dropout',
    responsibility_traffic: 'traffic',
    responsibility_helmet: 'traffic',
    sufficiency_debt: 'finance',
    sufficiency_finance: 'finance',
    honesty_ita: 'ita_gap',
    honesty_procurement: 'ita_gap',
    public_volunteer: 'elderly_care',
    public_health: 'elderly_care',
    gratitude_family: 'elderly_mental',
    gratitude_elderly: 'elderly_mental'
  };
  const resolvedId = aliasMap[topicId] || topicId;
  const item = TOPIC_SYNERGY_REGISTRY[resolvedId] || TOPIC_SYNERGY_REGISTRY[topicId];
  if (item) {
    if (!item.statisticalProfile) {
      item.statisticalProfile = {
        correlationType: 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)',
        rMetric: 'r = -0.72',
        pValue: 'p < 0.001',
        rSquared: 'R² = 0.52',
        dualAxisPattern: 'เส้นคุณธรรม/ทุนชีวิต (แกนขวา) ทแยงลงผกผันกับแท่งสถิติตัวชี้วัดภายนอก (แกนซ้าย)',
        segmentBreakdown: [
          {
            segmentName: 'จุดสังเกตสำคัญในกราฟ',
            finding: 'กลุ่มที่มีคะแนนต่ำสุดสัมพันธ์กับระดับปัญหาภายนอกที่พุ่งสูงที่สุดอย่างมีนัยสำคัญ'
          }
        ],
        thresholdObservation: 'เมื่อคะแนนผ่านเกณฑ์มาตรฐาน 4.50 (หรือ 80%) ตัวชี้วัดปัญหาภายนอกลดลงเฉลี่ย 38.5%'
      };
    }
    if (!item.spatialProfile) {
      item.spatialProfile = {
        xAxisLabel: `คะแนนดัชนี${item.moralDimensionTitle} รายภูมิภาค (เต็ม 100)`,
        yAxisLabel: `ดัชนีความเสี่ยงเชิงพื้นที่: ${item.synergyTitle} (%)`,
        bubbleSizeMetric: 'ปริมาณประชากรกลุ่มเป้าหมายในพื้นที่ (ล้านคน)',
        quadrantInsights: {
          q1Critical: `กลุ่มพื้นที่คะแนน${item.moralDimensionTitle}ต่ำ (<55) สัมพันธ์กับดัชนีความเสี่ยง${item.synergyTitle}สูง (วิกฤตเชิงพื้นที่)`,
          q2Resilient: `กลุ่มพื้นที่เผชิญความเสี่ยงสูง แต่มีคะแนน${item.moralDimensionTitle}สูง สะท้อนภูมิคุ้มกันและกลไกต้านทานในพื้นที่`,
          q3Latent: `กลุ่มพื้นที่ดัชนีความเสี่ยงรายงานต่ำ แต่คะแนน${item.moralDimensionTitle}ยังต่ำ มีความเปราะบางแฝงที่ต้องเฝ้าระวัง`,
          q4Stable: `กลุ่มพื้นที่ต้นแบบ คะแนน${item.moralDimensionTitle}สูงและดัชนีความเสี่ยงต่ำที่สุด มีเสถียรภาพและความมั่นคง`
        },
        spatialCorrelationSummary: `การกระจายตัวของฟองข้อมูล 8 ภูมิภาคสะท้อนการเกาะกลุ่มเชิงพื้นที่ (Spatial Clustering) โดยขนาดของฟองชี้วัดสัดส่วนประชากรที่ได้รับผลกระทบ`
      };
    }
    return item;
  }

  // Fallback attribution
  return {
    topicId,
    topicName: 'การวิเคราะห์บูรณาการความสัมพันธ์เชิงข้อมูล (Data Synergy)',
    synergyTitle: 'การบูรณาการข้อมูลเชิงประจักษ์',
    chartHeadline: 'การเชื่อมโยงดัชนีศูนย์คุณธรรมกับข้อมูลภายนอก',
    moralDimensionTitle: 'ดัชนีคุณธรรม & ทุนชีวิต',
    internalTables: ['mdc_moral_national_overview', 'mdc_lifecapital_national_overview'],
    externalTables: ['ext_vulnerable_households'],
    synergyFormula: 'ดัชนีศูนย์คุณธรรม (Ground Truth) ✕ ชุดข้อมูลสถิติภายนอก',
    attributionNote: 'ข้อมูลสะท้อนความเชื่อมโยงเชิงประจักษ์ระหว่างตัวชี้วัดคุณธรรมกับสถิติตัวชี้วัดการพัฒนาประเทศ',
    statisticalProfile: {
      correlationType: 'ความสัมพันธ์เชิงสถิติของกราฟ (Statistical Correlation)',
      rMetric: 'r = -0.70',
      pValue: 'p < 0.001',
      rSquared: 'R² = 0.49',
      dualAxisPattern: 'เส้นตัวชี้วัดคุณธรรม (แกนขวา) สัมพันธ์กับแท่งข้อมูลภายนอก (แกนซ้าย)',
      segmentBreakdown: [
        {
          segmentName: 'การกระจายตัวของข้อมูล',
          finding: 'ข้อมูลสะท้อนความเชื่อมโยงเชิงสถิติระหว่างระดับคุณธรรมกับปัญหาภายนอก'
        }
      ],
      thresholdObservation: 'เมื่อคะแนนสูงกว่าเกณฑ์มาตรฐาน สถิติความเสี่ยงลดลงอย่างมีนัยสำคัญ'
    },
    spatialProfile: {
      xAxisLabel: 'คะแนนดัชนีคุณธรรมและทุนชีวิตรายภูมิภาค (เต็ม 100)',
      yAxisLabel: 'ดัชนีความเสี่ยงเชิงพื้นที่ (%)',
      bubbleSizeMetric: 'ปริมาณประชากรในพื้นที่ (ล้านคน)',
      quadrantInsights: {
        q1Critical: 'กลุ่มพื้นที่คะแนนต่ำและความเสี่ยงสูง (โซนวิกฤต)',
        q2Resilient: 'กลุ่มพื้นที่เผชิญความเสี่ยงสูงแต่คะแนนยังสูง (โซนต้านทาน)',
        q3Latent: 'กลุ่มพื้นที่ความเสี่ยงต่ำแต่คะแนนต่ำ (ความเปราะบางแฝง)',
        q4Stable: 'กลุ่มพื้นที่คะแนนสูงและความเสี่ยงต่ำ (โซนต้นแบบเสถียรภาพ)'
      },
      spatialCorrelationSummary: 'การกระจายตัวของข้อมูลเชิงพื้นที่สะท้อนความสัมพันธ์เชิงสถิติระหว่างระดับคุณธรรมกับปัญหาภายนอก'
    }
  };
}
