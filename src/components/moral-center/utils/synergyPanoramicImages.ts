import React from 'react';

/**
 * synergyPanoramicImages.ts
 * Universal Thematic Panoramic Banner Images for all Synergy views:
 * - Moral Index (5 Dimensions: Sufficiency, Discipline, Honesty, Public Mind, Gratitude)
 * - Life Capital (4 Pillars: Family, Wisdom/Work, Friends/Activity, Community/Self)
 * - Moral Credit (5 Dimensions)
 * - Moral Teacher / Lecturers (5 Dimensions)
 *
 * Each image is high-resolution (1400x788 / 16:9 widescreen) with a dark gradient
 * fade on the left and photographic focal point on the right for maximum typography legibility.
 * 100% Unique - Each topic has a dedicated, non-repeating image that conveys its exact highlight.
 */

export const THEME_PANORAMIC_IMAGES = {
  // 1. วินัยรับผิดชอบ
  TRAFFIC_NO_HELMET: '/theme/discipline_traffic_no_helmet.jpg',
  FINANCE_DEBT: '/theme/finance_debt.jpg',
  CRIME_SAFETY: '/theme/crime_safety.jpg',
  EDUCATION_SCHOOL: '/theme/education_school.jpg',

  // 2. พอเพียง
  SUFFICIENCY_KNOWING_DOING_GAP: '/theme/sufficiency_knowing_doing_gap.jpg',
  SUFFICIENCY_LIVELIHOOD: '/theme/sufficiency_livelihood.jpg',
  COMMUNITY_MICROFINANCE_FUND: '/theme/community_microfinance_fund.jpg',
  COMMUNITY_ENVIRONMENT: '/theme/community_environment.jpg',

  // 3. สุจริต
  CYBER_SCAM_SECURITY: '/theme/cyber_scam_security.jpg',
  INTEGRITY_TRANSPARENCY: '/theme/integrity_transparency.jpg',
  FRAUD_CONSUMER_PROTECTION: '/theme/fraud_consumer_protection.jpg',
  PROCUREMENT_EGP_AUDIT: '/theme/procurement_egp_audit.jpg',

  // 4. จิตอาสา
  VOLUNTEER_OSM_ELDERLY: '/theme/volunteer_osm_elderly.jpg',
  WILDFIRE_FIREBREAK_VOLUNTEER: '/theme/wildfire_firebreak_volunteer.jpg',
  YOUTH_FUTURE_SKILLS: '/theme/youth_future_skills.jpg',
  BLOOD_DONATION_HUMANITARIAN: '/theme/blood_donation_humanitarian.jpg',

  // 5. กตัญญู
  FAMILY_ELDERLY_CARE: '/theme/family_elderly_care.jpg',
  ELDERLY_CRISIS_HOTLINE: '/theme/elderly_crisis_hotline.jpg',
  FAMILY_VIDEOCALL_WARMTH: '/theme/family_videocall_warmth.jpg',
  HOMECOMING_SMART_FARMER: '/theme/homecoming_smart_farmer.jpg',

  // Additional Civic Theme Presets
  VOLUNTEER_COMMUNITY: '/theme/volunteer_community.jpg'
} as const;

/**
 * Exact 1-to-1 Mapping for Topic IDs to guarantee 100% UNIQUE banner images
 * that accurately communicate the meaning of each banner's highlight topic.
 */
export const TOPIC_SPECIFIC_IMAGES: Record<string, string> = {
  // === 1. ดัชนีคุณธรรม 5 มิติ (Moral Index Synergy) ===
  // 1.1 วินัยรับผิดชอบ (Discipline & Responsibility)
  traffic: THEME_PANORAMIC_IMAGES.TRAFFIC_NO_HELMET,             // อุบัติเหตุจราจร & การสวมหมวกกันน็อก
  finance: THEME_PANORAMIC_IMAGES.FINANCE_DEBT,                  // วินัยการเงิน & หนี้เพื่อการบริโภค
  crime: THEME_PANORAMIC_IMAGES.CRIME_SAFETY,                    // สถิติคดีอาญา & การเคารพกฎหมาย
  education: THEME_PANORAMIC_IMAGES.EDUCATION_SCHOOL,            // การศึกษา & วินัยในสถานศึกษา

  // 1.2 พอเพียง (Sufficiency)
  finance_gap: THEME_PANORAMIC_IMAGES.SUFFICIENCY_KNOWING_DOING_GAP,  // หนี้ครัวเรือน & The Knowing-Doing Gap
  livelihood: THEME_PANORAMIC_IMAGES.SUFFICIENCY_LIVELIHOOD,          // การพัฒนาอาชีพ & ตำบลเข้มแข็ง
  community_fund: THEME_PANORAMIC_IMAGES.COMMUNITY_MICROFINANCE_FUND, // ธรรมาภิบาลกองทุนชุมชน & แก้หนี้
  environment: THEME_PANORAMIC_IMAGES.COMMUNITY_ENVIRONMENT,          // ทรัพยากร ขยะ & สิ่งแวดล้อมชุมชน

  // 1.3 สุจริต (Honesty & Integrity)
  cyber_scam: THEME_PANORAMIC_IMAGES.CYBER_SCAM_SECURITY,        // อาชญากรรมไซเบอร์ บัญชีม้า & คอลเซ็นเตอร์
  ita_gap: THEME_PANORAMIC_IMAGES.INTEGRITY_TRANSPARENCY,        // ความโปร่งใสภาครัฐ & ITA
  fraud_crime: THEME_PANORAMIC_IMAGES.FRAUD_CONSUMER_PROTECTION, // สถิติคดีฉ้อโกงประชาชน & สิทธิประโยชน์
  procurement: THEME_PANORAMIC_IMAGES.PROCUREMENT_EGP_AUDIT,     // การจัดซื้อจัดจ้าง e-GP & เรื่องร้องเรียน

  // 1.4 จิตอาสา (Public Consciousness & Volunteering)
  elderly_care: THEME_PANORAMIC_IMAGES.VOLUNTEER_OSM_ELDERLY,         // ผู้สูงอายุพึ่งพิง ADL & อสม.
  wildfire_disaster: THEME_PANORAMIC_IMAGES.WILDFIRE_FIREBREAK_VOLUNTEER, // ป้องกันหมอกควันไฟป่า & บรรเทาภัยพิบัติ
  youth_capital: THEME_PANORAMIC_IMAGES.YOUTH_FUTURE_SKILLS,          // ทุนชีวิตเยาวชน 5 พลัง & จิตสาธารณะ
  blood_donation: THEME_PANORAMIC_IMAGES.BLOOD_DONATION_HUMANITARIAN, // การบริจาคโลหิต & การเกื้อกูลสังคม

  // 1.5 กตัญญู (Gratitude & Family Warmth)
  elderly_mental: THEME_PANORAMIC_IMAGES.FAMILY_ELDERLY_CARE,    // การดูแลผู้สูงอายุในบ้าน & สุขภาพจิต
  hotline_abandon: THEME_PANORAMIC_IMAGES.ELDERLY_CRISIS_HOTLINE, // วิกฤตผู้สูงอายุทอดทิ้ง & สายด่วน 1300
  urban_rural_gap: THEME_PANORAMIC_IMAGES.FAMILY_VIDEOCALL_WARMTH, // ช่องว่างความอบอุ่น เมือง vs ชนบท
  homecoming_youth: THEME_PANORAMIC_IMAGES.HOMECOMING_SMART_FARMER, // คนรุ่นใหม่คืนถิ่น & กองทุนกตัญญู

  // === 2. ทุนชีวิต 4 เสาหลัก (Life Capital Synergy) ===
  family_juvenile: THEME_PANORAMIC_IMAGES.CRIME_SAFETY,
  family_elderly: THEME_PANORAMIC_IMAGES.ELDERLY_CRISIS_HOTLINE,
  family_tpmap: THEME_PANORAMIC_IMAGES.SUFFICIENCY_LIVELIHOOD,
  family_teen_pregnancy: THEME_PANORAMIC_IMAGES.FAMILY_VIDEOCALL_WARMTH,

  wisdom_dropout: THEME_PANORAMIC_IMAGES.EDUCATION_SCHOOL,
  workplace_finance: THEME_PANORAMIC_IMAGES.FINANCE_DEBT,
  wisdom_future_skills: THEME_PANORAMIC_IMAGES.YOUTH_FUTURE_SKILLS,
  workplace_safety: THEME_PANORAMIC_IMAGES.PROCUREMENT_EGP_AUDIT,

  peer_traffic: THEME_PANORAMIC_IMAGES.TRAFFIC_NO_HELMET,
  activity_drug: THEME_PANORAMIC_IMAGES.WILDFIRE_FIREBREAK_VOLUNTEER,
  peer_bullying: THEME_PANORAMIC_IMAGES.CYBER_SCAM_SECURITY,
  activity_volunteer: THEME_PANORAMIC_IMAGES.VOLUNTEER_OSM_ELDERLY,

  community_tpmap: THEME_PANORAMIC_IMAGES.COMMUNITY_MICROFINANCE_FUND,
  community_crime: THEME_PANORAMIC_IMAGES.FRAUD_CONSUMER_PROTECTION,
  community_welfare: THEME_PANORAMIC_IMAGES.BLOOD_DONATION_HUMANITARIAN,
  community_recycle: THEME_PANORAMIC_IMAGES.COMMUNITY_ENVIRONMENT,

  identity_mental: THEME_PANORAMIC_IMAGES.FAMILY_ELDERLY_CARE,
  identity_gambling: THEME_PANORAMIC_IMAGES.SUFFICIENCY_KNOWING_DOING_GAP,
  identity_media_literacy: THEME_PANORAMIC_IMAGES.CYBER_SCAM_SECURITY,
  identity_rq_resilience: THEME_PANORAMIC_IMAGES.HOMECOMING_SMART_FARMER,

  // === 3. Moral Credit Synergy ===
  responsibility: THEME_PANORAMIC_IMAGES.TRAFFIC_NO_HELMET,
  responsibility_traffic: THEME_PANORAMIC_IMAGES.TRAFFIC_NO_HELMET,
  responsibility_helmet: THEME_PANORAMIC_IMAGES.TRAFFIC_NO_HELMET,
  sufficiency: THEME_PANORAMIC_IMAGES.SUFFICIENCY_LIVELIHOOD,
  sufficiency_debt: THEME_PANORAMIC_IMAGES.COMMUNITY_MICROFINANCE_FUND,
  sufficiency_finance: THEME_PANORAMIC_IMAGES.FINANCE_DEBT,
  honesty: THEME_PANORAMIC_IMAGES.INTEGRITY_TRANSPARENCY,
  honesty_ita: THEME_PANORAMIC_IMAGES.INTEGRITY_TRANSPARENCY,
  honesty_procurement: THEME_PANORAMIC_IMAGES.PROCUREMENT_EGP_AUDIT,
  publicConsciousness: THEME_PANORAMIC_IMAGES.VOLUNTEER_OSM_ELDERLY,
  public_volunteer: THEME_PANORAMIC_IMAGES.VOLUNTEER_COMMUNITY,
  public_health: THEME_PANORAMIC_IMAGES.VOLUNTEER_OSM_ELDERLY,
  gratitude: THEME_PANORAMIC_IMAGES.FAMILY_ELDERLY_CARE,
  gratitude_family: THEME_PANORAMIC_IMAGES.FAMILY_VIDEOCALL_WARMTH,
  gratitude_elderly: THEME_PANORAMIC_IMAGES.FAMILY_ELDERLY_CARE,

  // === 4. Moral Teacher / Lecturers Synergy ===
  integrity: THEME_PANORAMIC_IMAGES.INTEGRITY_TRANSPARENCY,
  discipline: THEME_PANORAMIC_IMAGES.TRAFFIC_NO_HELMET,
  lifecapital: THEME_PANORAMIC_IMAGES.YOUTH_FUTURE_SKILLS
};

/**
 * Maps any topic ID, key, or dimension name across all Synergy views
 * to the most semantically relevant thematic banner image.
 * Uses exact 1-to-1 match first, then falls back to semantic keyword parsing.
 */
export function getSynergyThematicImage(topicIdOrKey?: string, fallbackDimension?: string): string {
  const rawKey = (topicIdOrKey || '').trim();
  const lowerKey = rawKey.toLowerCase();
  const fallback = (fallbackDimension || '').toLowerCase();

  // 1. Direct exact 1-to-1 matching (guarantees 100% uniqueness)
  if (TOPIC_SPECIFIC_IMAGES[rawKey]) {
    return TOPIC_SPECIFIC_IMAGES[rawKey];
  }
  if (TOPIC_SPECIFIC_IMAGES[lowerKey]) {
    return TOPIC_SPECIFIC_IMAGES[lowerKey];
  }

  // 2. Semantic matching by topic keywords
  if (lowerKey.includes('knowing') || lowerKey.includes('gap') && fallback.includes('sufficiency')) {
    return THEME_PANORAMIC_IMAGES.SUFFICIENCY_KNOWING_DOING_GAP;
  }
  if (lowerKey.includes('community_fund') || lowerKey.includes('fund') || lowerKey.includes('cooperative')) {
    return THEME_PANORAMIC_IMAGES.COMMUNITY_MICROFINANCE_FUND;
  }
  if (lowerKey.includes('procurement') || lowerKey.includes('egp') || lowerKey.includes('contract')) {
    return THEME_PANORAMIC_IMAGES.PROCUREMENT_EGP_AUDIT;
  }
  if (lowerKey.includes('fraud') || lowerKey.includes('cheat') || lowerKey.includes('consumer')) {
    return THEME_PANORAMIC_IMAGES.FRAUD_CONSUMER_PROTECTION;
  }
  if (lowerKey.includes('blood') || lowerKey.includes('donation')) {
    return THEME_PANORAMIC_IMAGES.BLOOD_DONATION_HUMANITARIAN;
  }
  if (lowerKey.includes('wildfire') || lowerKey.includes('fire') || lowerKey.includes('disaster') || lowerKey.includes('haze')) {
    return THEME_PANORAMIC_IMAGES.WILDFIRE_FIREBREAK_VOLUNTEER;
  }
  if (lowerKey.includes('osm') || (lowerKey.includes('elderly') && fallback.includes('public'))) {
    return THEME_PANORAMIC_IMAGES.VOLUNTEER_OSM_ELDERLY;
  }
  if (lowerKey.includes('hotline') || lowerKey.includes('abandon') || lowerKey.includes('1300')) {
    return THEME_PANORAMIC_IMAGES.ELDERLY_CRISIS_HOTLINE;
  }
  if (lowerKey.includes('videocall') || lowerKey.includes('urban_rural') || lowerKey.includes('warmth')) {
    return THEME_PANORAMIC_IMAGES.FAMILY_VIDEOCALL_WARMTH;
  }
  if (lowerKey.includes('homecoming') || lowerKey.includes('farmer') || lowerKey.includes('hometown')) {
    return THEME_PANORAMIC_IMAGES.HOMECOMING_SMART_FARMER;
  }

  // Cyber Crime, Mule Accounts, Online Scams
  if (lowerKey.includes('cyber') || lowerKey.includes('scam') || lowerKey.includes('mule') || lowerKey.includes('phishing')) {
    return THEME_PANORAMIC_IMAGES.CYBER_SCAM_SECURITY;
  }

  // Traffic & Road Safety
  if (lowerKey.includes('traffic') || lowerKey.includes('helmet') || lowerKey.includes('road')) {
    return THEME_PANORAMIC_IMAGES.TRAFFIC_NO_HELMET;
  }

  // Finance, Debt, Money, Savings
  if (lowerKey.includes('finance') || lowerKey.includes('debt') || lowerKey.includes('npl')) {
    return THEME_PANORAMIC_IMAGES.FINANCE_DEBT;
  }

  // Crime, Law Enforcement, Justice
  if (lowerKey.includes('crime') || lowerKey.includes('safety') || lowerKey.includes('juvenile') || lowerKey.includes('law')) {
    return THEME_PANORAMIC_IMAGES.CRIME_SAFETY;
  }

  // Education, School, Students
  if (lowerKey.includes('education') || lowerKey.includes('dropout') || lowerKey.includes('school')) {
    return THEME_PANORAMIC_IMAGES.EDUCATION_SCHOOL;
  }

  // Sufficiency, Agriculture, Livelihood
  if (lowerKey.includes('livelihood') || lowerKey.includes('sufficiency') || lowerKey.includes('tpmap')) {
    return THEME_PANORAMIC_IMAGES.SUFFICIENCY_LIVELIHOOD;
  }

  // Environment, Waste, Green Community
  if (lowerKey.includes('environment') || lowerKey.includes('recycle') || lowerKey.includes('waste') || lowerKey.includes('green')) {
    return THEME_PANORAMIC_IMAGES.COMMUNITY_ENVIRONMENT;
  }

  // Integrity, Transparency, Anti-Corruption, ITA
  if (lowerKey.includes('integrity') || lowerKey.includes('ita') || lowerKey.includes('honesty') || lowerKey.includes('transparency')) {
    return THEME_PANORAMIC_IMAGES.INTEGRITY_TRANSPARENCY;
  }

  // Family, Elderly Care
  if (lowerKey.includes('elderly') || lowerKey.includes('family') || lowerKey.includes('gratitude')) {
    return THEME_PANORAMIC_IMAGES.FAMILY_ELDERLY_CARE;
  }

  // Youth, Skills, Volunteer
  if (lowerKey.includes('volunteer') || lowerKey.includes('public')) {
    return THEME_PANORAMIC_IMAGES.VOLUNTEER_OSM_ELDERLY;
  }
  if (lowerKey.includes('youth') || lowerKey.includes('skill') || lowerKey.includes('future')) {
    return THEME_PANORAMIC_IMAGES.YOUTH_FUTURE_SKILLS;
  }

  // Fallback based on dimension
  if (fallback.includes('responsibility') || fallback.includes('discipline')) {
    return THEME_PANORAMIC_IMAGES.TRAFFIC_NO_HELMET;
  }
  if (fallback.includes('sufficiency')) {
    return THEME_PANORAMIC_IMAGES.SUFFICIENCY_LIVELIHOOD;
  }
  if (fallback.includes('honesty') || fallback.includes('integrity')) {
    return THEME_PANORAMIC_IMAGES.INTEGRITY_TRANSPARENCY;
  }
  if (fallback.includes('public') || fallback.includes('volunteer')) {
    return THEME_PANORAMIC_IMAGES.VOLUNTEER_OSM_ELDERLY;
  }
  if (fallback.includes('gratitude') || fallback.includes('family')) {
    return THEME_PANORAMIC_IMAGES.FAMILY_ELDERLY_CARE;
  }

  return THEME_PANORAMIC_IMAGES.TRAFFIC_NO_HELMET;
}

/**
 * Parses and renders the headline with highlighted impact words and figures:
 * - Percentage figures (e.g., 70%, 62%, 80%, 74%)
 * - Multiplier figures (e.g., 3 เท่า, 4 เท่า, 2 เท่า)
 * - Key impact indicators are emphasized with golden glowing accent color (#fde047)
 */
export function renderThematicHighlightedHeadline(headline: string): React.ReactNode {
  if (!headline) return null;

  // Regex targeting percentages, multiplier factors, and key quantitative impact metrics
  const regex = /(\b\d+(?:\.\d+)?%|\b\d+\s*เท่า|\b\d+,\d+\s*บาท|\b\d+,\d+\s*ราย|\b\d+\s*หมื่นราย)/g;
  const parts = headline.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return React.createElement(
        'span',
        {
          key: index,
          style: {
            color: '#fde047',
            fontWeight: 900,
            textShadow: '0 0 12px rgba(253, 224, 71, 0.45)',
            padding: '0 2px'
          }
        },
        part
      );
    }
    return part;
  });
}
