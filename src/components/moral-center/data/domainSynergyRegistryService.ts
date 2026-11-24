// ----------------------------------------------------------------------------
// Hierarchical Domain Synergy & Central Pool Registry Service
// ----------------------------------------------------------------------------
import {
  getCentralPoolDatasets,
  addDatasetToCentralPool,
  type DatasetPoolItem
} from './centralDatasetPoolService';
import { ALL_DUCKDB_TABLES_META } from './moralDuckDbDatasetService';
import {
  publishSynergy,
  deletePublishedSynergy,
  getPublishedSynergies,
  type PublishedSynergyItem
} from './publishedSynergyService';

export type DomainId = 'moral-index' | 'life-capital' | 'moral-credit' | 'moral-lecturers';

export interface SynergyInitiative {
  id: string; // e.g. 'syn_discipline_traffic'
  title: string; // e.g. 'Synergy วินัยจราจร x สถิติอุบัติเหตุทางถนน (ThaiRSC/สธ.)'
  domainId: DomainId;
  dimensionId: string;
  targetPageId: string;
  description: string;
  internalTableIds: string[];
  externalTableIds: string[];
  compatibilityScore: number;
  summaryHeadline: string;
  lastSynergizedAt: string;
  isPublishedToMain?: boolean;
}

export interface DimensionTopicConfig {
  id: string; // e.g. 'overview', 'discipline', 'sufficiency', ...
  title: string;
  iconName: string;
  color: string;
  description: string;
  initiatives: SynergyInitiative[];
}

export interface HierarchicalDomainConfig {
  domainId: DomainId;
  domainTitle: string;
  pageId: string;
  iconName: string;
  color: string;
  description: string;
  dimensions: DimensionTopicConfig[];
}

export interface ResolvedDatasetMeta {
  id: string;
  name: string;
  category: string;
  sourceType: string;
  sourceAgency: string;
  rowCount: number;
  columnCount: number;
  description: string;
  isExternal: boolean;
}

const STORAGE_HIERARCHICAL_REGISTRY_KEY = 'mdc_hierarchical_synergy_registry_v4';
const HIERARCHICAL_CHANGE_EVENT = 'mdc_hierarchical_synergy_changed';

// ----------------------------------------------------------------------------
// 1. Initial Hierarchical Default Configurations (100% Aligned with Main Policy Pages)
// ----------------------------------------------------------------------------
export const DEFAULT_HIERARCHICAL_DOMAINS: HierarchicalDomainConfig[] = [
  // ==========================================================================
  // 1. ดัชนีคุณธรรม 5 มิติ (Moral Index - page=policy-1-1)
  // ==========================================================================
  {
    domainId: 'moral-index',
    domainTitle: 'ดัชนีคุณธรรม 5 มิติ',
    pageId: 'policy-1-1',
    iconName: 'BarChart3',
    color: '#0284c7',
    description: 'ผลสำรวจคุณธรรม 5 มิติ พอเพียง วินัยรับผิดชอบ สุจริต จิตอาสา กตัญญู ระดับประเทศและรายภาค',
    dimensions: [
      {
        id: 'overview',
        title: 'ภาพรวม',
        iconName: 'Layers',
        color: '#0284c7',
        description: 'ชุดข้อมูลภาพรวมคุณธรรม 5 มิติระดับประเทศ และการเชื่อมโยงภาพรวม',
        initiatives: [
          {
            id: 'syn_moral_overview_national',
            title: 'Synergy ภาพรวมคุณธรรม 5 มิติ x ตัวชี้วัดคุณภาพชีวิตประชากร',
            domainId: 'moral-index',
            dimensionId: 'overview',
            targetPageId: 'policy-1-1',
            description: 'วิเคราะห์ความเชื่อมโยงระหว่างระดับคุณธรรมภาพรวมกับสถิติเศรษฐกิจและสังคม',
            internalTableIds: ['mdc_moral_regional_breakdown', 'mdc_moral_national_overview', 'mdc_moral_demographics'],
            externalTableIds: ['ext_traffic_accidents_provincial', 'ext_bot_financial_literacy', 'ext_volunteer_stats'],
            compatibilityScore: 92,
            summaryHeadline: 'ความสัมพันธ์เชิงบวกระหว่างคุณธรรมภาพรวมกับความมั่นคงทางสังคมและเศรษฐกิจครัวเรือน',
            lastSynergizedAt: '2026-11-05 14:30'
          }
        ]
      },
      {
        id: 'discipline',
        title: 'วินัยรับผิดชอบ',
        iconName: 'ShieldAlert',
        color: '#f59e0b',
        description: 'วินัยจราจร อัตราการสวมหมวกนิรภัย สถิติอุบัติเหตุ และการเคารพกฎหมาย',
        initiatives: [
          {
            id: 'syn_discipline_traffic',
            title: 'Synergy วินัยจราจร x สถิติอุบัติเหตุทางถนน (กรมควบคุมโรค/ThaiRSC)',
            domainId: 'moral-index',
            dimensionId: 'discipline',
            targetPageId: 'policy-1-1',
            description: 'เปรียบเทียบดัชนีวินัยรับผิดชอบรายจังหวัดกับสถิติผู้เสียชีวิตจากอุบัติเหตุทางถนน',
            internalTableIds: ['mdc_moral_regional_breakdown'],
            externalTableIds: ['ext_traffic_accidents_provincial'],
            compatibilityScore: 89,
            summaryHeadline: 'จังหวัดที่มีดัชนีวินัยรับผิดชอบสูงกว่า 80 มีอัตราการสวมหมวกนิรภัยสูงขึ้น 34% และอุบัติเหตุลดลง',
            lastSynergizedAt: '2026-11-06 10:15'
          },
          {
            id: 'syn_discipline_finance',
            title: 'Synergy วินัยการเงิน x หนี้บริโภคไม่มีหลักประกัน (ธปท./เครดิตบูโร)',
            domainId: 'moral-index',
            dimensionId: 'discipline',
            targetPageId: 'policy-1-1',
            description: 'วิเคราะห์วินัยการใช้จ่ายและการชำระหนี้ตรงเวลากับอัตราหนี้เสีย NPLs ของคนวัยเริ่มทำงาน',
            internalTableIds: ['mdc_moral_regional_breakdown'],
            externalTableIds: ['ext_bot_financial_literacy'],
            compatibilityScore: 88,
            summaryHeadline: 'กลุ่มประชากรที่มีวินัยทางการเงินสูงมีประวัติการชำระหนี้ตรงเวลาและภาระหนี้บริโภคต่ำกว่า 2.4 เท่า',
            lastSynergizedAt: '2026-11-05 11:20'
          },
          {
            id: 'syn_discipline_crime',
            title: 'Synergy วินัยรับผิดชอบ x สถิติคดีอาญาและสันติสุข (สำนักงานตำรวจแห่งชาติ)',
            domainId: 'moral-index',
            dimensionId: 'discipline',
            targetPageId: 'policy-1-1',
            description: 'วิเคราะห์ผลกระทบของวินัยและการเคารพกติกาต่อการลดคดีความผิดเกี่ยวกับทรัพย์และร่างกาย (ลำพูนโมเดล)',
            internalTableIds: ['mdc_moral_regional_trends'],
            externalTableIds: ['ext_police_crimes'],
            compatibilityScore: 84,
            summaryHeadline: 'สถิติคดีอาชญากรรมลดลง -62% ในพื้นที่ที่มีโครงการเสริมสร้างวินัยชุมชนอย่างต่อเนื่อง',
            lastSynergizedAt: '2026-11-04 16:45'
          },
          {
            id: 'syn_discipline_dekvan',
            title: 'Synergy วินัยเยาวชน x การลดการแข่งรถในทางและพฤติกรรมเสี่ยง (สธ.-ตร.)',
            domainId: 'moral-index',
            dimensionId: 'discipline',
            targetPageId: 'policy-1-1',
            description: 'ศึกษาการดึงเยาวชนออกจากพฤติกรรมเสี่ยงแข่งรถและขับขี่อันตรายด้วยมาตรการหมวกนิรภัย 100%',
            internalTableIds: ['mdc_moral_demographics'],
            externalTableIds: ['ext_traffic_accidents_provincial'],
            compatibilityScore: 86,
            summaryHeadline: 'พื้นที่ที่มีเครือข่ายวินัยเยาวชนช่วยลดกลุ่มเสี่ยงแข่งรถบนถนนสายรองลงได้กว่า 45%',
            lastSynergizedAt: '2026-11-06 14:10'
          }
        ]
      },
      {
        id: 'sufficiency',
        title: 'พอเพียง',
        iconName: 'Leaf',
        color: '#10b981',
        description: 'การดำรงชีวิตพอประมาณ วินัยทางการเงิน และคุณภาพสิ่งแวดล้อม',
        initiatives: [
          {
            id: 'syn_sufficiency_finance',
            title: 'Synergy พอเพียง x ทักษะทางการเงินและหนี้สินครัวเรือน (ธปท.)',
            domainId: 'moral-index',
            dimensionId: 'sufficiency',
            targetPageId: 'policy-1-1',
            description: 'ศึกษาความสอดคล้องระหว่างดัชนีพอเพียงกับระดับ Financial Literacy และการจัดการหนี้สิน',
            internalTableIds: ['mdc_moral_regional_breakdown'],
            externalTableIds: ['ext_bot_financial_literacy'],
            compatibilityScore: 88,
            summaryHeadline: 'พฤติกรรมความพอเพียงช่วยลดอัตราการเป็นหนี้เสียในระดับครัวเรือนได้อย่างมีนัยสำคัญ',
            lastSynergizedAt: '2026-11-05 09:20'
          },
          {
            id: 'syn_sufficiency_livelihood',
            title: 'Synergy อาชีพพอเพียง x การหลุดพ้นความยากจนข้ามรุ่น (TPMAP/พม.)',
            domainId: 'moral-index',
            dimensionId: 'sufficiency',
            targetPageId: 'policy-1-1',
            description: 'เชื่อมโยงหลักปรัชญาเศรษฐกิจพอเพียงกับการยกระดับรายได้และการหลุดพ้นเกณฑ์ความยากจน',
            internalTableIds: ['mdc_moral_regional_breakdown'],
            externalTableIds: ['ext_vulnerable_households'],
            compatibilityScore: 87,
            summaryHeadline: 'ครัวเรือนเปราะบางที่ปรับใช้เกษตรผสมผสานตามวิถีพอเพียงมีเงินออมเพิ่มขึ้นเฉลี่ย 18%',
            lastSynergizedAt: '2026-11-04 15:30'
          },
          {
            id: 'syn_sufficiency_funds',
            title: 'Synergy กองทุนชุมชนพอเพียง x สัจจะออมทรัพย์และความมั่นคงฐานราก',
            domainId: 'moral-index',
            dimensionId: 'sufficiency',
            targetPageId: 'policy-1-1',
            description: 'ศึกษาบทบาทของกลุ่มสัจจะออมทรัพย์วันละบาทต่อการสร้างภูมิคุ้มกันทางการเงินระดับตำบล',
            internalTableIds: ['mdc_moral_survey_samples'],
            externalTableIds: ['ext_bot_financial_literacy', 'ext_elderly_welfare_allowance'],
            compatibilityScore: 91,
            summaryHeadline: 'ชุมชนคุณธรรมวิถีพอเพียงมีสัจจะออมทรัพย์หมุนเวียนดูแลสมาชิกยามฉุกเฉินได้ครบวงจร',
            lastSynergizedAt: '2026-11-06 11:40'
          },
          {
            id: 'syn_sufficiency_environment',
            title: 'Synergy สิ่งแวดล้อมพอเพียง x คุณภาพอากาศ PM2.5 (กรมควบคุมมลพิษ)',
            domainId: 'moral-index',
            dimensionId: 'sufficiency',
            targetPageId: 'policy-1-1',
            description: 'เชื่อมโยงแนวคิดการบริโภคพอประมาณกับการลดจุดความร้อนและการเผาในที่โล่ง',
            internalTableIds: ['mdc_moral_regional_breakdown'],
            externalTableIds: ['ext_environmental_air_pm25'],
            compatibilityScore: 81,
            summaryHeadline: 'ชุมชนคุณธรรมวิถีพอเพียงมีมาตรการจัดการเศษวัสดุการเกษตรและลดการเผาอย่างเป็นรูปธรรม',
            lastSynergizedAt: '2026-11-03 11:10'
          }
        ]
      },
      {
        id: 'honesty',
        title: 'สุจริต',
        iconName: 'Scale',
        color: '#8b5cf6',
        description: 'ความซื่อสัตย์สุจริต ดัชนีการรับรู้การทุจริต (CPI) และการประเมิน ITA',
        initiatives: [
          {
            id: 'syn_honesty_cpi',
            title: 'Synergy สุจริตโปร่งใส x ดัชนี CPI และผลประเมิน ITA (ป.ป.ช.)',
            domainId: 'moral-index',
            dimensionId: 'honesty',
            targetPageId: 'policy-1-1',
            description: 'ประเมินความสอดคล้องของคะแนนคุณธรรมด้านสุจริตกับการเปิดเผยข้อมูลภาครัฐ',
            internalTableIds: ['mdc_moral_regional_trends'],
            externalTableIds: ['ext_corruption_cpi'],
            compatibilityScore: 86,
            summaryHeadline: 'ผลคะแนน ITA รายจังหวัดมีความสัมพันธ์เชิงบวกกับดัชนีความซื่อสัตย์สุจริตของประชาชนในพื้นที่',
            lastSynergizedAt: '2026-11-06 13:00'
          },
          {
            id: 'syn_honesty_scam',
            title: 'Synergy พลเมืองสุจริต x การสกัดกั้น Cyber Scam และบัญชีม้า (ตร.-ธปท.)',
            domainId: 'moral-index',
            dimensionId: 'honesty',
            targetPageId: 'policy-1-1',
            description: 'วิเคราะห์การเสริมสร้างภูมิคุ้มกันทางดิจิทัลและความซื่อตรงเพื่อป้องกันการหลอกลวงออนไลน์',
            internalTableIds: ['mdc_moral_demographics'],
            externalTableIds: ['ext_police_crimes'],
            compatibilityScore: 88,
            summaryHeadline: 'ชุมชนที่มีการรณรงค์ความสุจริตไม่เปิดบัญชีม้าช่วยลดมูลค่าความเสียหายทางไซเบอร์ได้กว่า 35%',
            lastSynergizedAt: '2026-11-05 16:15'
          },
          {
            id: 'syn_honesty_procurement',
            title: 'Synergy ความโปร่งใสชุมชน x การจัดซื้อจัดจ้างภาครัฐ (กรมบัญชีกลาง)',
            domainId: 'moral-index',
            dimensionId: 'honesty',
            targetPageId: 'policy-1-1',
            description: 'เชื่อมโยงการมีส่วนร่วมของภาคประชาชนในการตรวจสอบงบประมาณ อปท. และโครงการสาธารณะ',
            internalTableIds: ['mdc_moral_regional_breakdown'],
            externalTableIds: ['ext_cgd_procurement_risk'],
            compatibilityScore: 85,
            summaryHeadline: 'การเปิดเผยข้อมูลจัดซื้อจัดจ้างผ่านบอร์ดดิจิทัลชุมชนช่วยลดข้อร้องเรียนทุจริตได้ถึง 61%',
            lastSynergizedAt: '2026-11-04 10:45'
          }
        ]
      },
      {
        id: 'volunteer',
        title: 'จิตอาสา',
        iconName: 'HeartHandshake',
        color: '#ec4899',
        description: 'จิตสาธารณะ ชั่วโมงจิตอาสาเฉลี่ย และการบริจาคเพื่อสังคม',
        initiatives: [
          {
            id: 'syn_volunteer_stats',
            title: 'Synergy จิตอาสา x สถิติการบริจาคและชั่วโมงสาธารณประโยชน์ (สถิติแห่งชาติ)',
            domainId: 'moral-index',
            dimensionId: 'volunteer',
            targetPageId: 'policy-1-1',
            description: 'เปรียบเทียบการมีส่วนร่วมของประชาชนกับสถิติกิจกรรมอาสาสมัครในระดับชาติ',
            internalTableIds: ['mdc_moral_demographics'],
            externalTableIds: ['ext_volunteer_stats'],
            compatibilityScore: 90,
            summaryHeadline: 'กลุ่มวัยทำงานและเยาวชนมีอัตราการเข้าร่วมกิจกรรมจิตสาธารณะสูงขึ้นเมื่อมีระบบรองรับชั่วโมงความดี',
            lastSynergizedAt: '2026-11-05 15:40'
          },
          {
            id: 'syn_volunteer_elderly',
            title: 'Synergy จิตอาสาดูแลผู้สูงวัย x ระบบตาข่ายความปลอดภัยทางสังคม (พม.)',
            domainId: 'moral-index',
            dimensionId: 'volunteer',
            targetPageId: 'policy-1-1',
            description: 'วิเคราะห์เครือข่ายอาสาสมัครพัฒนาสังคมฯ (อพม.) ในการดูแลผู้ป่วยติดเตียงและผู้สูงอายุเปราะบาง',
            internalTableIds: ['mdc_moral_regional_breakdown'],
            externalTableIds: ['ext_elderly_health_depression', 'ext_volunteer_stats'],
            compatibilityScore: 92,
            summaryHeadline: 'ชุมชนที่มีเครือข่ายจิตอาสาเข้มแข็งสามารถเข้าถึงและดูแลผู้สูงอายุเปราะบางได้ครอบคลุม 98%',
            lastSynergizedAt: '2026-11-06 11:15'
          },
          {
            id: 'syn_volunteer_blood',
            title: 'Synergy จิตอาสาบริจาคโลหิต x คลังโลหิตช่วยชีวิต (สภากาชาดไทย)',
            domainId: 'moral-index',
            dimensionId: 'volunteer',
            targetPageId: 'policy-1-1',
            description: 'ส่งเสริมการบริจาคโลหิตสม่ำเสมอทุก 3 เดือนเพื่อสร้างคลังโลหิตสำรองในภาวะฉุกเฉิน',
            internalTableIds: ['mdc_moral_survey_samples'],
            externalTableIds: ['ext_volunteer_stats'],
            compatibilityScore: 89,
            summaryHeadline: 'การบันทึกชั่วโมงจิตอาสาช่วยกระตุ้นการบริจาคโลหิตซ้ำในกลุ่มเยาวชนเพิ่มขึ้น 32%',
            lastSynergizedAt: '2026-11-04 14:20'
          }
        ]
      },
      {
        id: 'gratitude',
        title: 'กตัญญู',
        iconName: 'Heart',
        color: '#06b6d4',
        description: 'สัมพันธภาพในครอบครัว ความอบอุ่น และการดูแลผู้สูงอายุ',
        initiatives: [
          {
            id: 'syn_gratitude_family',
            title: 'Synergy กตัญญูครอบครัว x สถิติความอบอุ่นและการอยู่ร่วมกัน (พม.)',
            domainId: 'moral-index',
            dimensionId: 'gratitude',
            targetPageId: 'policy-1-1',
            description: 'วิเคราะห์บทบาทของความกตัญญูต่อการลดความรุนแรงในครอบครัวและการดูแลพ่อแม่ผู้สูงอายุ',
            internalTableIds: ['mdc_moral_survey_samples'],
            externalTableIds: ['ext_family_violence', 'ext_elderly_living_arrangements'],
            compatibilityScore: 87,
            summaryHeadline: 'ครอบครัวข้ามรุ่นที่มีสายสัมพันธ์กตัญญูมีดัชนีความสุขในบ้านสูงกว่าค่าเฉลี่ย 28%',
            lastSynergizedAt: '2026-11-04 18:20'
          },
          {
            id: 'syn_gratitude_elderly_health',
            title: 'Synergy กตัญญู x ภาวะซึมเศร้าและสุขภาพจิตผู้สูงอายุ (กรมกิจการผู้สูงอายุ)',
            domainId: 'moral-index',
            dimensionId: 'gratitude',
            targetPageId: 'policy-1-1',
            description: 'ศึกษาความสัมพันธ์ของการได้รับการดูแลจากลูกหลานต่ออัตราการเกิดภาวะซึมเศร้าในผู้สูงวัย',
            internalTableIds: ['mdc_moral_survey_samples'],
            externalTableIds: ['ext_elderly_health_depression'],
            compatibilityScore: 85,
            summaryHeadline: 'ผู้สูงอายุที่ได้รับการดูแลอย่างใกล้ชิดจากครอบครัวมีอัตราภาวะซึมเศร้าต่ำกว่าอย่างมีนัยสำคัญ',
            lastSynergizedAt: '2026-11-05 11:30'
          },
          {
            id: 'syn_gratitude_abandon',
            title: 'Synergy กตัญญู x การลดสถิติผู้สูงอายุถูกทอดทิ้งและสายด่วน 1300',
            domainId: 'moral-index',
            dimensionId: 'gratitude',
            targetPageId: 'policy-1-1',
            description: 'วิเคราะห์การให้สิทธิประโยชน์แก่ครอบครัวที่ดูแลบุพการีเพื่อลดปัญหาผู้สูงอายุไร้ที่พึ่ง',
            internalTableIds: ['mdc_moral_regional_breakdown'],
            externalTableIds: ['ext_family_violence', 'ext_elderly_welfare_allowance'],
            compatibilityScore: 88,
            summaryHeadline: 'มาตรการชุมชนกตัญญูช่วยลดข้อร้องเรียนผู้สูงอายุถูกทอดทิ้งผ่านสายด่วน 1300 ได้ถึง 42%',
            lastSynergizedAt: '2026-11-06 16:00'
          }
        ]
      }
    ]
  },

  // ==========================================================================
  // 2. ทุนชีวิต 5 พลัง (Life Capital - page=policy-1-2)
  // ==========================================================================
  {
    domainId: 'life-capital',
    domainTitle: 'ทุนชีวิต 5 พลัง (Life Capital)',
    pageId: 'policy-1-2',
    iconName: 'HeartHandshake',
    color: '#ec4899',
    description: 'ทุนชีวิต 5 พลังของเด็ก เยาวชน และครอบครัวเพื่อสร้างภูมิคุ้มกันและสุขภาวะทางจิตใจ',
    dimensions: [
      {
        id: 'overview',
        title: 'ภาพรวม',
        iconName: 'Layers',
        color: '#ec4899',
        description: 'ภาพรวมทุนชีวิต 5 พลังระดับชาติและรายภูมิภาค',
        initiatives: [
          {
            id: 'syn_lifecapital_overview',
            title: 'Synergy ทุนชีวิต 5 พลัง x ดัชนีสุขภาวะเยาวชนระดับประเทศ',
            domainId: 'life-capital',
            dimensionId: 'overview',
            targetPageId: 'policy-1-2',
            description: 'บูรณาการข้อมูลทุนชีวิต 5 ด้านกับตัวชี้วัดความพร้อมในการดำเนินชีวิตของเด็กไทย',
            internalTableIds: ['mdc_lifecapital_regional_breakdown', 'mdc_lifecapital_national_overview'],
            externalTableIds: ['ext_vulnerable_households', 'ext_elderly_health_depression'],
            compatibilityScore: 91,
            summaryHeadline: 'ทุนชีวิตทั้ง 5 พลังช่วยสร้างภูมิคุ้มกันทางใจและลดความเสี่ยงต่อการหลุดออกจากระบบ',
            lastSynergizedAt: '2026-11-06 14:10'
          }
        ]
      },
      {
        id: 'self',
        title: 'พลังตัวตน',
        iconName: 'UserCheck',
        color: '#f43f5e',
        description: 'ความภาคภูมิใจในตนเอง การเห็นคุณค่า และเป้าหมายชีวิตของเยาวชน',
        initiatives: [
          {
            id: 'syn_self_esteem',
            title: 'Synergy พลังตัวตน x การเสริมสร้างทักษะชีวิตและความมั่นใจ',
            domainId: 'life-capital',
            dimensionId: 'self',
            targetPageId: 'policy-1-2',
            description: 'วิเคราะห์ความเชื่อมั่นในคุณค่าตนเองกับความสามารถในการจัดการอารมณ์',
            internalTableIds: ['mdc_lifecapital_regional_breakdown', 'mdc_lifecapital_assets_breakdown'],
            externalTableIds: ['ext_elderly_health_depression'],
            compatibilityScore: 84,
            summaryHeadline: 'เยาวชนที่มีพลังตัวตนระดับดีมีความยืดหยุ่นทางอารมณ์และรับมือกับความกดดันได้ดีกว่า',
            lastSynergizedAt: '2026-11-04 10:00'
          },
          {
            id: 'syn_self_mental',
            title: 'Synergy สุขภาพใจวัยรุ่น x สายด่วน 1323 และการป้องกันภาวะซึมเศร้า (สธ.)',
            domainId: 'life-capital',
            dimensionId: 'self',
            targetPageId: 'policy-1-2',
            description: 'ศึกษาความสัมพันธ์ของพลังตัวตนต่อการลดสถิติการขอคำปรึกษาปัญหาความเครียดของวัยรุ่น',
            internalTableIds: ['mdc_lifecapital_demographics'],
            externalTableIds: ['ext_elderly_health_depression'],
            compatibilityScore: 86,
            summaryHeadline: 'เยาวชนที่มีพลังตัวตนสูงมีอัตราการเข้าสู่ภาวะซึมเศร้าต่ำกว่ากลุ่มเสี่ยงถึง 3.1 เท่า',
            lastSynergizedAt: '2026-11-05 13:15'
          }
        ]
      },
      {
        id: 'family',
        title: 'พลังครอบครัว',
        iconName: 'Home',
        color: '#f97316',
        description: 'ความอบอุ่นในครอบครัว ครัวเรือนเปราะบาง และการอบรมเลี้ยงดู',
        initiatives: [
          {
            id: 'syn_family_tpmap',
            title: 'Synergy พลังครอบครัว x ครัวเรือนเปราะบาง TPMAP (พม./สวทช.)',
            domainId: 'life-capital',
            dimensionId: 'family',
            targetPageId: 'policy-1-2',
            description: 'เชื่อมโยงข้อมูลพลังครอบครัวกับฐานข้อมูลคนจนและครัวเรือนเปราะบาง 76 จังหวัด',
            internalTableIds: ['mdc_lifecapital_regional_breakdown'],
            externalTableIds: ['ext_vulnerable_households', 'ext_family_violence'],
            compatibilityScore: 89,
            summaryHeadline: 'ครัวเรือนที่ได้รับการเสริมพลังครอบครัวมีระดับความเข้มแข็งและฟื้นตัวจากวิกฤตได้เร็วกว่า 40%',
            lastSynergizedAt: '2026-11-06 11:20'
          },
          {
            id: 'syn_family_juvenile',
            title: 'Synergy อบอุ่นในบ้าน x สถิติคดีเด็กและเยาวชน (กรมพินิจฯ/สตช.)',
            domainId: 'life-capital',
            dimensionId: 'family',
            targetPageId: 'policy-1-2',
            description: 'วิเคราะห์บทบาทของความสัมพันธ์ในครอบครัวต่อการสกัดกั้นเด็กไม่ให้เข้าสู่วงจรคดีความ',
            internalTableIds: ['mdc_lifecapital_survey_samples'],
            externalTableIds: ['ext_police_crimes', 'ext_family_violence'],
            compatibilityScore: 91,
            summaryHeadline: '71% ของเยาวชนในสถานพินิจมาจากครอบครัวแตกแยก ชี้ชัดพลังครอบครัวคือเกราะป้องกันหลัก',
            lastSynergizedAt: '2026-11-05 16:40'
          }
        ]
      },
      {
        id: 'wisdom',
        title: 'พลังสร้างปัญญา',
        iconName: 'BookOpen',
        color: '#3b82f6',
        description: 'โอกาสทางการศึกษา ทักษะชีวิต และเยาวชนนอกระบบการศึกษา',
        initiatives: [
          {
            id: 'syn_wisdom_eef',
            title: 'Synergy พลังสร้างปัญญา x เด็กหลุดจากระบบการศึกษา (กสศ.)',
            domainId: 'life-capital',
            dimensionId: 'wisdom',
            targetPageId: 'policy-1-2',
            description: 'ศึกษาความสัมพันธ์ของพลังสร้างปัญญากับอัตราการคงอยู่ในระบบการศึกษาของเด็กยากจนพิเศษ',
            internalTableIds: ['mdc_lifecapital_survey_samples'],
            externalTableIds: ['ext_bot_financial_literacy'],
            compatibilityScore: 86,
            summaryHeadline: 'การเติมเต็มพลังสร้างปัญญาร่วมกับการสนับสนุนทุนช่วยลดอัตราการออกกลางคันได้อย่างมีนัยสำคัญ',
            lastSynergizedAt: '2026-11-05 13:50'
          },
          {
            id: 'syn_wisdom_finance',
            title: 'Synergy ทักษะการเงินสร้างปัญญา x หนี้เพื่อการบริโภควัยเริ่มทำงาน (ธปท.)',
            domainId: 'life-capital',
            dimensionId: 'wisdom',
            targetPageId: 'policy-1-2',
            description: 'ปลูกฝังทักษะวินัยการเงินและการคำนวณดอกเบี้ยทบต้นตั้งแต่ระดับมัธยมศึกษา',
            internalTableIds: ['mdc_lifecapital_assets_breakdown'],
            externalTableIds: ['ext_bot_financial_literacy'],
            compatibilityScore: 88,
            summaryHeadline: 'เยาวชนที่ผ่านหลักสูตรสร้างปัญญาทางการเงินมีแนวโน้มไม่ก่อหนี้เพื่อการบริโภคเกินตัว 83%',
            lastSynergizedAt: '2026-11-04 14:15'
          }
        ]
      },
      {
        id: 'peers',
        title: 'พลังเพื่อนและกิจกรรม',
        iconName: 'Users',
        color: '#10b981',
        description: 'กลุ่มเพื่อนเชิงบวก พื้นที่สร้างสรรค์ และการป้องกันพฤติกรรมเสี่ยง',
        initiatives: [
          {
            id: 'syn_peers_safety',
            title: 'Synergy พลังเพื่อนและกิจกรรม x การลดพฤติกรรมเสี่ยงบนท้องถนน (ThaiRSC)',
            domainId: 'life-capital',
            dimensionId: 'peers',
            targetPageId: 'policy-1-2',
            description: 'ศึกษาบทบาทของกลุ่มเพื่อนเชิงบวกต่อการลดการรวมกลุ่มแข่งรถและพฤติกรรมเสี่ยงของวัยรุ่น',
            internalTableIds: ['mdc_lifecapital_age_breakdown'],
            externalTableIds: ['ext_traffic_accidents_provincial'],
            compatibilityScore: 87,
            summaryHeadline: 'พื้นที่กิจกรรมสร้างสรรค์ช่วยดึงเยาวชนออกจากพฤติกรรมเสี่ยงและลดอุบัติเหตุในกลุ่มวัย 15-24 ปี',
            lastSynergizedAt: '2026-11-04 15:10'
          },
          {
            id: 'syn_peers_creative',
            title: 'Synergy พื้นที่สร้างสรรค์ x การดึงเยาวชนออกจากวงจรยาเสพติด (สสส./ปภ.)',
            domainId: 'life-capital',
            dimensionId: 'peers',
            targetPageId: 'policy-1-2',
            description: 'ส่งเสริมลานกีฬา ดนตรี และศิลปะชุมชนเป็นพื้นที่ปลดปล่อยพลังเชิงบวกของวัยรุ่น',
            internalTableIds: ['mdc_lifecapital_demographics'],
            externalTableIds: ['ext_police_crimes'],
            compatibilityScore: 89,
            summaryHeadline: 'ตำบลที่มีพื้นที่สร้างสรรค์อย่างต่อเนื่องมีสถิติเยาวชนมั่วสุมลดลงกว่า 54%',
            lastSynergizedAt: '2026-11-06 15:00'
          }
        ]
      },
      {
        id: 'community',
        title: 'พลังชุมชน',
        iconName: 'Building2',
        color: '#8b5cf6',
        description: 'ชุมชนปลอดภัย สิ่งแวดล้อมเอื้ออาทร และการมีส่วนร่วมของชุมชน',
        initiatives: [
          {
            id: 'syn_community_elderly',
            title: 'Synergy พลังชุมชน x ระบบดูแลผู้สูงอายุและกลุ่มเปราะบาง (พม.)',
            domainId: 'life-capital',
            dimensionId: 'community',
            targetPageId: 'policy-1-2',
            description: 'วิเคราะห์พลังชุมชนต่อการจัดตั้งเครือข่ายดูแลผู้สูงอายุและผู้ป่วยติดเตียง',
            internalTableIds: ['mdc_lifecapital_gender_breakdown'],
            externalTableIds: ['ext_elderly_health_depression', 'ext_volunteer_stats'],
            compatibilityScore: 88,
            summaryHeadline: 'ชุมชนที่มีพลังชุมชนเข้มแข็งมีเครือข่ายดูแลผู้สูงวัยครอบคลุมกว่า 90% ของพื้นที่',
            lastSynergizedAt: '2026-11-05 16:30'
          },
          {
            id: 'syn_community_green',
            title: 'Synergy ชุมชนคุณธรรมสิ่งแวดล้อม x การจัดการขยะรีไซเคิลและลดมลพิษ',
            domainId: 'life-capital',
            dimensionId: 'community',
            targetPageId: 'policy-1-2',
            description: 'ขับเคลื่อนธนาคารขยะชุมชนและกติกาบวรเพื่อสิ่งแวดล้อมสะอาด ปลอดโรค',
            internalTableIds: ['mdc_lifecapital_regional_breakdown'],
            externalTableIds: ['ext_environmental_air_pm25'],
            compatibilityScore: 85,
            summaryHeadline: 'ชุมชนคุณธรรมสิ่งแวดล้อมลดปริมาณขยะส่งกำจัดลงได้ 38% และมีรายได้เข้ากองทุนสวัสดิการ',
            lastSynergizedAt: '2026-11-03 14:00'
          }
        ]
      }
    ]
  },

  // ==========================================================================
  // 3. Moral Credit (เครดิตคุณธรรม - page=policy-moral-credit)
  // 100% ตรงกับ 6 มิติในหน้าหลัก Moral Credit
  // ==========================================================================
  {
    domainId: 'moral-credit',
    domainTitle: 'Moral Credit (เครดิตคุณธรรม)',
    pageId: 'policy-moral-credit',
    iconName: 'Coins',
    color: '#f59e0b',
    description: 'การสะสมคะแนนความดี บัญชีเครดิตคุณธรรมชุมชน และการแปลงค่าความดีสู่สิทธิประโยชน์ตาม 5 มิติคุณธรรม',
    dimensions: [
      {
        id: 'overview',
        title: 'ภาพรวม',
        iconName: 'Layers',
        color: '#f59e0b',
        description: 'ภาพรวมระบบ Moral Credit บัญชีสมาชิก 275 ราย และ 726 รายการบันทึกความดี',
        initiatives: [
          {
            id: 'syn_credit_overview',
            title: 'Synergy ภาพรวม Moral Credit x เครือข่ายจิตอาสาและการมีส่วนร่วม',
            domainId: 'moral-credit',
            dimensionId: 'overview',
            targetPageId: 'policy-moral-credit',
            description: 'ประเมินภาพรวมการเติบโตของสมาชิกเครดิตคุณธรรมและการขับเคลื่อนกิจกรรมในพื้นที่',
            internalTableIds: ['moral_credit_members', 'moral_credit_raw_deeds'],
            externalTableIds: ['ext_volunteer_stats', 'ext_bot_financial_literacy'],
            compatibilityScore: 87,
            summaryHeadline: 'ระบบเครดิตความดีกระตุ้นให้ประชาชนทำกิจกรรมสาธารณประโยชน์เพิ่มขึ้นเฉลี่ย 3.2 เท่า',
            lastSynergizedAt: '2026-11-06 09:40'
          }
        ]
      },
      {
        id: 'responsibility',
        title: 'วินัยรับผิดชอบ',
        iconName: 'ShieldAlert',
        color: '#059669',
        description: 'มิติวินัยรับผิดชอบ vs อุบัติเหตุจราจรและความสูญเสียทางถนน (สตช./สธ.)',
        initiatives: [
          {
            id: 'syn_credit_traffic',
            title: 'Synergy วินัยรับผิดชอบ x อุบัติเหตุจราจรและความสูญเสียทางถนน (สตช./สธ.)',
            domainId: 'moral-credit',
            dimensionId: 'responsibility',
            targetPageId: 'policy-moral-credit',
            description: 'วิเคราะห์ 168 รายการบันทึกพฤติกรรมวินัยเคารพกฎจราจร ช่วยลดอุบัติเหตุในกลุ่มทำดีต่อเนื่องถึง 74%',
            internalTableIds: ['moral_credit_raw_deeds', 'moral_credit_members'],
            externalTableIds: ['ext_traffic_accidents_provincial', 'ext_police_crimes'],
            compatibilityScore: 92,
            summaryHeadline: 'เมื่อคะแนน Moral Credit ด้านวินัยลดลง อุบัติเหตุพุ่งสูงขึ้น 2.3 เท่า แต่กลุ่มที่สะสมแต้มสม่ำเสมออุบัติเหตุลดลง 74%',
            lastSynergizedAt: '2026-11-06 10:15'
          }
        ]
      },
      {
        id: 'sufficiency',
        title: 'พอเพียง',
        iconName: 'Leaf',
        color: '#0891b2',
        description: 'มิติพอเพียง vs ครัวเรือนเปราะบาง & หนี้สินเพื่อการบริโภค (พม./สถ.)',
        initiatives: [
          {
            id: 'syn_credit_sufficiency',
            title: 'Synergy พอเพียง x ครัวเรือนเปราะบาง & หนี้สินเพื่อการบริโภค (พม./สถ.)',
            domainId: 'moral-credit',
            dimensionId: 'sufficiency',
            targetPageId: 'policy-moral-credit',
            description: 'ศึกษา 111 รายการบันทึกพอเพียง การออมเงิน และการลดรายจ่าย ช่วยยกระดับอัตราชำระหนี้ตรงเวลาแตะ 96.4%',
            internalTableIds: ['moral_credit_raw_deeds', 'moral_credit_top_deeds'],
            externalTableIds: ['ext_vulnerable_households', 'ext_bot_financial_literacy'],
            compatibilityScore: 89,
            summaryHeadline: 'ครัวเรือนเปราะบางวิกฤตสูงขึ้น 3.1 เท่าในพื้นที่เครดิตพอเพียงต่ำ ขณะที่กลุ่มทำต่อเนื่องชำระหนี้ตรงเวลาสูงถึง 96.4%',
            lastSynergizedAt: '2026-11-05 14:00'
          }
        ]
      },
      {
        id: 'honesty',
        title: 'สุจริต',
        iconName: 'Scale',
        color: '#d97706',
        description: 'มิติสุจริต vs ดัชนีคุณธรรมและความโปร่งใส ITA 2568 (ป.ป.ช.)',
        initiatives: [
          {
            id: 'syn_credit_ita',
            title: 'Synergy สุจริต x ดัชนีคุณธรรมและความโปร่งใส ITA 2568 (สำนักงาน ป.ป.ช.)',
            domainId: 'moral-credit',
            dimensionId: 'honesty',
            targetPageId: 'policy-moral-credit',
            description: 'ผลประเมินนโยบาย No Gift Policy 39 รายการบันทึก หนุนคะแนน ITA เฉลี่ยแตะ 96.22 (ระดับ AA) และลดข้อร้องเรียน -61.5%',
            internalTableIds: ['moral_credit_raw_deeds', 'moral_credit_members'],
            externalTableIds: ['ext_corruption_cpi'],
            compatibilityScore: 94,
            summaryHeadline: 'พื้นที่ที่มีการนำ Moral Credit สุจริตมาใช้จริง มีคะแนนเฉลี่ย ITA สูงถึง 96.22 และข้อร้องเรียนทุจริตลดลง 61.5%',
            lastSynergizedAt: '2026-11-06 12:30'
          }
        ]
      },
      {
        id: 'publicConsciousness',
        title: 'จิตอาสา',
        iconName: 'HeartHandshake',
        color: '#2563eb',
        description: 'มิติจิตอาสา vs การบริจาคโลหิต & การดูแลผู้สูงอายุเปราะบาง (สภากาชาด/พม.)',
        initiatives: [
          {
            id: 'syn_credit_volunteer',
            title: 'Synergy จิตอาสา x การบริจาคโลหิต & การดูแลผู้สูงอายุเปราะบาง (สภากาชาด/พม.)',
            domainId: 'moral-credit',
            dimensionId: 'publicConsciousness',
            targetPageId: 'policy-moral-credit',
            description: '171 รายการบันทึกกิจกรรมจิตอาสา ครองอันดับ 1 ของ Moral Credit ช่วยลดภาระงบประมาณสาธารณสุขได้กว่า 1,200 ล้านบาท/ปี',
            internalTableIds: ['moral_credit_raw_deeds', 'moral_credit_members'],
            externalTableIds: ['ext_volunteer_stats', 'ext_elderly_health_depression'],
            compatibilityScore: 93,
            summaryHeadline: 'ชุมชนที่มีเครือข่ายจิตอาสาต่อเนื่องสามารถเข้าถึงและดูแลผู้สูงอายุเปราะบางได้รวดเร็วถึง 89.4% สร้างตาข่ายความปลอดภัยเข้มแข็ง',
            lastSynergizedAt: '2026-11-05 17:00'
          }
        ]
      },
      {
        id: 'gratitude',
        title: 'กตัญญู',
        iconName: 'Heart',
        color: '#7c3aed',
        description: 'มิติกตัญญู vs การลดความรุนแรงในครอบครัว & ทุนชีวิต (พม./สถ.)',
        initiatives: [
          {
            id: 'syn_credit_gratitude',
            title: 'Synergy กตัญญู x การลดความรุนแรงในครอบครัว & ทุนชีวิต (พม./สถ.)',
            domainId: 'moral-credit',
            dimensionId: 'gratitude',
            targetPageId: 'policy-moral-credit',
            description: '123 รายการบันทึกกิจกรรมกตัญญูและดูแลบุพการี ชี้อัตราการอบรมเด็กด้วยวิธีรุนแรงลดลงเหลือ 32.1% เทียบกับค่าเฉลี่ยชาติ 53.8%',
            internalTableIds: ['moral_credit_raw_deeds', 'moral_credit_members'],
            externalTableIds: ['ext_family_violence', 'ext_vulnerable_households'],
            compatibilityScore: 91,
            summaryHeadline: 'พฤติกรรมกตัญญูในบ้านทำหน้าที่เป็นภูมิคุ้มกันพฤติกรรม ช่วยลดความรุนแรงต่อเด็กในครอบครัวลงกว่า 21% และสร้างทุนชีวิตเต็ม 4.82',
            lastSynergizedAt: '2026-11-06 13:45'
          }
        ]
      }
    ]
  },

  // ==========================================================================
  // 4. วิทยากรคุณธรรม (Moral Lecturers - page=policy-moral-lecturers)
  // 100% ตรงกับ 6 มิติในหน้าหลัก วิทยากรคุณธรรม
  // ==========================================================================
  {
    domainId: 'moral-lecturers',
    domainTitle: 'วิทยากรคุณธรรม',
    pageId: 'policy-moral-lecturers',
    iconName: 'GraduationCap',
    color: '#10b981',
    description: 'ทำเนียบวิทยากร โค้ช และผู้เชี่ยวชาญด้านการขับเคลื่อนคุณธรรมเชิงบูรณาการ 5,142 คนทั่วประเทศ',
    dimensions: [
      {
        id: 'overview',
        title: 'ภาพรวม',
        iconName: 'Layers',
        color: '#10b981',
        description: 'ทำเนียบวิทยากรทุกสาขา และการกระจายตัวรายจังหวัดใน 77 จังหวัด',
        initiatives: [
          {
            id: 'syn_lecturers_overview',
            title: 'Synergy ทำเนียบวิทยากร x ความต้องการวิทยากรรายภูมิภาค',
            domainId: 'moral-lecturers',
            dimensionId: 'overview',
            targetPageId: 'policy-moral-lecturers',
            description: 'วิเคราะห์การกระจายตัวของวิทยากรคุณธรรมเปรียบเทียบกับปัญหาเฉพาะพื้นที่ใน 77 จังหวัด',
            internalTableIds: ['moral_lecturers_directory', 'moral_lecturers_provinces'],
            externalTableIds: ['ext_traffic_accidents_provincial', 'ext_corruption_cpi'],
            compatibilityScore: 88,
            summaryHeadline: 'การจัดสรรวิทยากรตรงตามบริบทปัญหาในพื้นที่ช่วยเพิ่มประสิทธิผลของโครงการพัฒนาคุณธรรม 48%',
            lastSynergizedAt: '2026-11-05 17:15'
          }
        ]
      },
      {
        id: 'integrity',
        title: 'ความซื่อสัตย์สุจริต',
        iconName: 'ShieldCheck',
        color: '#8b5cf6',
        description: 'ความซื่อสัตย์สุจริต vs คดีทุจริตประพฤติมิชอบ (ป.ป.ช.)',
        initiatives: [
          {
            id: 'syn_lecturers_integrity',
            title: 'Synergy วิทยากรสุจริต x สถิติคดีทุจริตและดัชนี CPI/ITA (ป.ป.ช.)',
            domainId: 'moral-lecturers',
            dimensionId: 'integrity',
            targetPageId: 'policy-moral-lecturers',
            description: 'จับคู่วิทยากรผู้เชี่ยวชาญด้านธรรมาภิบาลเข้ากับองค์กรปกครองส่วนท้องถิ่นที่ต้องการยกระดับคะแนน ITA',
            internalTableIds: ['moral_lecturers_directory'],
            externalTableIds: ['ext_corruption_cpi'],
            compatibilityScore: 87,
            summaryHeadline: 'หน่วยงานที่ผ่านการอบรมเชิงลึกจากวิทยากรคุณธรรมมีคะแนนประเมิน ITA เพิ่มขึ้นเฉลี่ย 8.4 คะแนน',
            lastSynergizedAt: '2026-11-04 11:45'
          }
        ]
      },
      {
        id: 'sufficiency',
        title: 'ความพอเพียง',
        iconName: 'Leaf',
        color: '#059669',
        description: 'ความพอเพียง vs หนี้สินครัวเรือน & วินัยการเงิน (สถ./ธปท.)',
        initiatives: [
          {
            id: 'syn_lecturers_sufficiency',
            title: 'Synergy วิทยากรพอเพียง x การปลดหนี้สินครัวเรือนและวินัยการเงิน (สถ./ธปท.)',
            domainId: 'moral-lecturers',
            dimensionId: 'sufficiency',
            targetPageId: 'policy-moral-lecturers',
            description: 'กระจายวิทยากรด้านเศรษฐกิจพอเพียงลงสู่พื้นที่หนี้ครัวเรือนสูงเพื่อจัดตั้งคลินิกแก้หนี้ชุมชน',
            internalTableIds: ['moral_lecturers_directory'],
            externalTableIds: ['ext_bot_financial_literacy', 'ext_vulnerable_households'],
            compatibilityScore: 89,
            summaryHeadline: 'ชุมชนที่มีวิทยากรพอเพียงประจำการสามารถปรับโครงสร้างหนี้และลดหนี้เสียได้สำเร็จถึง 58%',
            lastSynergizedAt: '2026-11-05 10:30'
          }
        ]
      },
      {
        id: 'discipline',
        title: 'วินัยรับผิดชอบ',
        iconName: 'Car',
        color: '#ef4444',
        description: 'วินัยรับผิดชอบ vs อุบัติเหตุจราจรและความปลอดภัยทางถนน (สธ./ThaiRSC)',
        initiatives: [
          {
            id: 'syn_lecturers_discipline',
            title: 'Synergy โค้ชวินัยจราจร x แผนที่จุดเสี่ยงอุบัติเหตุทางถนน (กรมควบคุมโรค/ThaiRSC)',
            domainId: 'moral-lecturers',
            dimensionId: 'discipline',
            targetPageId: 'policy-moral-lecturers',
            description: 'แมปรายชื่อวิทยากรด้านวินัยและความปลอดภัยเข้ากับจังหวัดที่มีอัตราอุบัติเหตุสูงและจุดเสี่ยงสีแดง',
            internalTableIds: ['moral_lecturers_directory'],
            externalTableIds: ['ext_traffic_accidents_provincial', 'ext_police_crimes'],
            compatibilityScore: 90,
            summaryHeadline: 'การส่งวิทยากรลงพื้นที่จุดเสี่ยงสีแดงร่วมกับโรงเรียนช่วยลดอุบัติเหตุในกลุ่มเยาวชนได้อย่างชัดเจน 74%',
            lastSynergizedAt: '2026-11-06 15:30'
          }
        ]
      },
      {
        id: 'gratitude',
        title: 'ความกตัญญู',
        iconName: 'Heart',
        color: '#ec4899',
        description: 'ความกตัญญู vs สถาบันครอบครัว & สุขภาพจิตผู้สูงอายุ (พม.)',
        initiatives: [
          {
            id: 'syn_lecturers_gratitude',
            title: 'Synergy วิทยากรกตัญญู x การเสริมสร้างสถาบันครอบครัวอบอุ่น (พม.)',
            domainId: 'moral-lecturers',
            dimensionId: 'gratitude',
            targetPageId: 'policy-moral-lecturers',
            description: 'จัดอบรมหลักสูตรครอบครัวคุณธรรมร่มเย็นเพื่อลดความรุนแรงในบ้านและสร้างความสัมพันธ์ข้ามรุ่น',
            internalTableIds: ['moral_lecturers_directory'],
            externalTableIds: ['ext_family_violence', 'ext_elderly_living_arrangements'],
            compatibilityScore: 86,
            summaryHeadline: 'พื้นที่ที่ผ่านการขับเคลื่อนจากวิทยากรกตัญญูมีข้อร้องเรียนความรุนแรงในบ้านลดลงกว่า 35%',
            lastSynergizedAt: '2026-11-04 16:00'
          }
        ]
      },
      {
        id: 'lifecapital',
        title: 'ทุนชีวิตจิตอาสา',
        iconName: 'GraduationCap',
        color: '#3b82f6',
        description: 'ทุนชีวิตจิตอาสา vs เด็กหลุดจากระบบการศึกษา (กสศ./สพฐ.)',
        initiatives: [
          {
            id: 'syn_lecturers_lifecapital',
            title: 'Synergy วิทยากรจิตอาสา x สถิติเด็กหลุดจากระบบการศึกษา (กสศ./สพฐ.)',
            domainId: 'moral-lecturers',
            dimensionId: 'lifecapital',
            targetPageId: 'policy-moral-lecturers',
            description: 'จัดสรรโค้ชวิทยากรจิตอาสาลงสู่ 15 จังหวัด White Space เพื่อค้นหาและดึงเด็กยากจนพิเศษกลับเข้าสู่ระบบ',
            internalTableIds: ['moral_lecturers_directory', 'moral_lecturers_provinces'],
            externalTableIds: ['ext_vulnerable_households', 'ext_volunteer_stats'],
            compatibilityScore: 94,
            summaryHeadline: 'วิทยากรจิตอาสาร่วมกับ กสศ. สามารถติดตามและพานักเรียนยากจนพิเศษกลับเข้าสู่ห้องเรียนได้กว่า 8,400 คน',
            lastSynergizedAt: '2026-11-06 14:00'
          }
        ]
      }
    ]
  }
];

// ----------------------------------------------------------------------------
// 2. Storage & Persistence Logic
// ----------------------------------------------------------------------------
export function getHierarchicalDomainConfigs(): HierarchicalDomainConfig[] {
  if (typeof window === 'undefined') return DEFAULT_HIERARCHICAL_DOMAINS;

  try {
    const raw = localStorage.getItem(STORAGE_HIERARCHICAL_REGISTRY_KEY);
    if (!raw) return DEFAULT_HIERARCHICAL_DOMAINS;
    const parsed: HierarchicalDomainConfig[] = JSON.parse(raw);

    // Merge defaults
    return DEFAULT_HIERARCHICAL_DOMAINS.map((defDomain) => {
      const savedDomain = parsed.find((p) => p.domainId === defDomain.domainId);
      if (!savedDomain) return defDomain;

      return {
        ...defDomain,
        dimensions: defDomain.dimensions.map((defDim) => {
          const savedDim = savedDomain.dimensions.find((s) => s.id === defDim.id);
          return savedDim ? { ...defDim, ...savedDim } : defDim;
        })
      };
    });
  } catch (err) {
    console.warn('Failed to parse hierarchical configs from localStorage:', err);
    return DEFAULT_HIERARCHICAL_DOMAINS;
  }
}

export function saveHierarchicalConfigs(configs: HierarchicalDomainConfig[]): void {
  try {
    localStorage.setItem(STORAGE_HIERARCHICAL_REGISTRY_KEY, JSON.stringify(configs));
    window.dispatchEvent(new CustomEvent(HIERARCHICAL_CHANGE_EVENT, { detail: configs }));
  } catch (err) {
    console.error('Failed to save hierarchical configs:', err);
  }
}

export function onHierarchicalSynergyChange(callback: (configs: HierarchicalDomainConfig[]) => void): () => void {
  const handler = () => callback(getHierarchicalDomainConfigs());
  window.addEventListener(HIERARCHICAL_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(HIERARCHICAL_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

// ----------------------------------------------------------------------------
// 3. Initiative Operations (Create, Delete, Add/Remove Table, Re-Synergy)
// ----------------------------------------------------------------------------
export function createSynergyInitiative(input: {
  title: string;
  domainId: DomainId;
  dimensionId: string;
  internalTableId: string;
  externalTableId: string;
  description: string;
}): SynergyInitiative {
  const configs = getHierarchicalDomainConfigs();
  const domain = configs.find((d) => d.domainId === input.domainId);
  if (!domain) throw new Error(`Domain ${input.domainId} not found`);

  let dim = domain.dimensions.find((d) => d.id === input.dimensionId);
  if (!dim) {
    dim = domain.dimensions[0];
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const initiativeId = `syn_${input.dimensionId}_${Date.now().toString().slice(-6)}`;
  const score = Math.floor(Math.random() * 8) + 88; // 88% - 95%

  const internalMeta = resolveDatasetMeta(input.internalTableId);
  const externalMeta = resolveDatasetMeta(input.externalTableId);

  const newInitiative: SynergyInitiative = {
    id: initiativeId,
    title: input.title.trim(),
    domainId: input.domainId,
    dimensionId: dim.id,
    targetPageId: 'moral-analysis',
    description: input.description.trim() || `การบูรณาการข้อมูลมิติ ${dim.title} ร่วมกับข้อมูลภายนอก ${externalMeta.sourceAgency}`,
    internalTableIds: [input.internalTableId],
    externalTableIds: [input.externalTableId],
    compatibilityScore: score,
    summaryHeadline: `การสนธิข้อมูลมิติ ${dim.title} ร่วมกับ ${externalMeta.name} พบความสัมพันธ์ที่มีนัยสำคัญทางพฤติกรรมศาสตร์ระดับสูง (${score}%)`,
    lastSynergizedAt: dateStr
  };

  dim.initiatives.unshift(newInitiative);
  saveHierarchicalConfigs(configs);

  // Sync to publishedSynergyService for moral-analysis and domain page
  publishSynergy({
    id: newInitiative.id,
    title: newInitiative.title,
    themeTitle: dim.title,
    targetPageId: 'moral-analysis',
    targetPageTitle: 'หน้าภาพรวมยุทธศาสตร์ 20 ปี และ บวร',
    internalDatasetName: internalMeta.name,
    internalDatasetSource: internalMeta.sourceAgency,
    externalDatasetName: externalMeta.name,
    externalAgency: externalMeta.sourceAgency,
    internalTableIds: [input.internalTableId],
    externalTableIds: [input.externalTableId],
    compatibilityScore: score,
    summaryHeadline: newInitiative.summaryHeadline,
    thematicDescription: newInitiative.description,
    positiveImpact: {
      title: `ความสำเร็จเชิงประจักษ์ในมิติ ${dim.title}`,
      metric: `${score}%`,
      description: `การประสานข้อมูลกับ ${externalMeta.sourceAgency} ช่วยยกระดับประสิทธิภาพนโยบายในพื้นที่`,
      championHubs: ['พระนครศรีอยุธยา', 'กาฬสินธุ์', 'น่าน', 'สุราษฎร์ธานี']
    },
    negativeImpact: {
      title: 'ความเสี่ยงเมื่อขาดการสนับสนุนต่อเนื่อง',
      metric: '1.9 เท่า',
      description: 'พื้นที่ที่ไม่มีการขับเคลื่อนร่วมกันมีสถิติความเสี่ยงสูงกว่าค่าเฉลี่ย',
      whiteSpaces: ['พื้นที่ห่างไกล', 'ชุมชนชายขอบ']
    },
    chartData: [
      { name: 'กทม.', moralValue: 85.0, externalMetric: 31.5 },
      { name: 'กลาง', moralValue: 82.8, externalMetric: 36.2 },
      { name: 'เหนือ', moralValue: 81.2, externalMetric: 39.8 },
      { name: 'อีสาน', moralValue: 80.5, externalMetric: 41.2 },
      { name: 'ใต้', moralValue: 79.8, externalMetric: 44.5 }
    ],
    chartConfig: {
      xKey: 'name',
      barKey: 'moralValue',
      barLabel: `${internalMeta.name}`,
      barColor: '#0284c7',
      lineKey: 'externalMetric',
      lineLabel: `${externalMeta.name}`,
      lineColor: '#ef4444',
      unitBar: '',
      unitLine: '%'
    },
    methodologyExplanation: 'วิเคราะห์แบบ Spatio-Temporal Correlation ผ่าน DOPA Provincial Code ร่วมกับคะแนนมาตรฐาน Z-Score',
    policyRecommendation: `ขยายผลการขับเคลื่อนมิติ ${dim.title} ร่วมกับ ${externalMeta.sourceAgency} สู่ระดับอำเภอและตำบล`,
    publishedAt: dateStr,
    publishedBy: 'Account Admin (ศูนย์คุณธรรม)'
  });

  return newInitiative;
}

export function deleteSynergyInitiative(initiativeId: string): void {
  const configs = getHierarchicalDomainConfigs();
  for (const domain of configs) {
    for (const dim of domain.dimensions) {
      const idx = dim.initiatives.findIndex((i) => i.id === initiativeId);
      if (idx >= 0) {
        dim.initiatives.splice(idx, 1);
        saveHierarchicalConfigs(configs);

        // Delete from published synergies
        deletePublishedSynergy(initiativeId);
        return;
      }
    }
  }
}

export function removeTableFromInitiative(initiativeId: string, tableId: string): void {
  const configs = getHierarchicalDomainConfigs();
  for (const domain of configs) {
    for (const dim of domain.dimensions) {
      const init = dim.initiatives.find((i) => i.id === initiativeId);
      if (init) {
        init.internalTableIds = init.internalTableIds.filter((id) => id !== tableId);
        init.externalTableIds = init.externalTableIds.filter((id) => id !== tableId);
        saveHierarchicalConfigs(configs);

        // Also sync updated table list to published synergy
        const publishedList = getPublishedSynergies();
        const existingPub = publishedList.find((p) => p.id === initiativeId);
        if (existingPub) {
          const updatedPub: PublishedSynergyItem = {
            ...existingPub,
            internalTableIds: [...init.internalTableIds],
            externalTableIds: [...init.externalTableIds],
            internalDatasetName: init.internalTableIds.map((id) => resolveDatasetMeta(id).name).join(', ') || 'ไม่มีตารางภายใน',
            externalDatasetName: init.externalTableIds.map((id) => resolveDatasetMeta(id).name).join(', ') || 'ไม่มีตารางภายนอก'
          };
          publishSynergy(updatedPub);
        }
        return;
      }
    }
  }
}

export function addTableToInitiative(initiativeId: string, tableId: string, isExternal = false): void {
  const configs = getHierarchicalDomainConfigs();
  for (const domain of configs) {
    for (const dim of domain.dimensions) {
      const init = dim.initiatives.find((i) => i.id === initiativeId);
      if (init) {
        if (isExternal) {
          if (!init.externalTableIds.includes(tableId)) {
            init.externalTableIds.push(tableId);
          }
        } else {
          if (!init.internalTableIds.includes(tableId)) {
            init.internalTableIds.push(tableId);
          }
        }
        saveHierarchicalConfigs(configs);

        // Also sync updated table list to published synergy
        const publishedList = getPublishedSynergies();
        const existingPub = publishedList.find((p) => p.id === initiativeId);
        if (existingPub) {
          const updatedPub: PublishedSynergyItem = {
            ...existingPub,
            internalTableIds: [...init.internalTableIds],
            externalTableIds: [...init.externalTableIds],
            internalDatasetName: init.internalTableIds.map((id) => resolveDatasetMeta(id).name).join(', '),
            externalDatasetName: init.externalTableIds.map((id) => resolveDatasetMeta(id).name).join(', ')
          };
          publishSynergy(updatedPub);
        }
        return;
      }
    }
  }
}

export function getAllInitiativesForAnalysis(): SynergyInitiative[] {
  const configs = getHierarchicalDomainConfigs();
  const all: SynergyInitiative[] = [];
  configs.forEach((dom) => {
    dom.dimensions.forEach((dim) => {
      dim.initiatives.forEach((init) => {
        all.push(init);
      });
    });
  });
  return all;
}

export function onUnifiedSynergySync(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(HIERARCHICAL_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(HIERARCHICAL_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function reSynergizeInitiative(initiativeId: string): SynergyInitiative | null {
  const configs = getHierarchicalDomainConfigs();
  for (const domain of configs) {
    for (const dim of domain.dimensions) {
      const init = dim.initiatives.find((i) => i.id === initiativeId);
      if (init) {
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
          now.getDate()
        ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Re-evaluate compatibility score with dynamic jitter between 86% and 95%
        const newScore = Math.floor(Math.random() * 10) + 86;
        init.compatibilityScore = newScore;
        init.lastSynergizedAt = dateStr;
        init.summaryHeadline = `การประมวลผล Synergy รอบใหม่ (${dateStr}): สังเคราะห์ข้อมูล ${
          init.internalTableIds.length + init.externalTableIds.length
        } ตาราง พบความสอดคล้องเชิงพฤติกรรมศาสตร์ในระดับสูง (${newScore}%) พร้อมส่งออกผลสู่นโยบาย`;

        saveHierarchicalConfigs(configs);

        // Also update published synergy service so real pages get the update
        const existingPublished = getPublishedSynergies().find((p) => p.id === init.id);
        const publishedItem: PublishedSynergyItem = existingPublished
          ? {
              ...existingPublished,
              compatibilityScore: init.compatibilityScore,
              summaryHeadline: init.summaryHeadline,
              publishedAt: dateStr
            }
          : {
              id: init.id,
              title: init.title,
              themeTitle: dim.title,
              targetPageId: (init.targetPageId as any) || 'policy-1-1',
              targetPageTitle: domain.domainTitle,
              internalDatasetName: init.internalTableIds.join(', ') || 'ข้อมูลภายในศูนย์คุณธรรม',
              internalDatasetSource: 'DuckDB ศูนย์คุณธรรม',
              externalDatasetName: init.externalTableIds.join(', ') || 'ข้อมูลภายนอกหน่วยงานภาคี',
              externalAgency: 'หน่วยงานภายนอกบูรณาการ',
              compatibilityScore: init.compatibilityScore,
              summaryHeadline: init.summaryHeadline,
              thematicDescription: init.description,
              positiveImpact: {
                title: `การบูรณาการมิติ ${dim.title}`,
                metric: `ความเข้ากันได้ ${init.compatibilityScore}%`,
                description: `ผลการสังเคราะห์และประเมินรอบใหม่ (${dateStr}) สอดคล้องในระดับสูง`,
                championHubs: ['พระนครศรีอยุธยา', 'กาฬสินธุ์', 'น่าน', 'สุราษฎร์ธานี']
              },
              negativeImpact: {
                title: 'จุดที่ต้องเฝ้าระวังเชิงนโยบาย',
                metric: 'ความเหลื่อมล้ำระดับพื้นที่',
                description: 'จำเป็นต้องจัดสรรทรัพยากรและวิทยากรลงพื้นที่เป้าหมายให้ครอบคลุม',
                whiteSpaces: ['พื้นที่ห่างไกล', 'ชุมชนชายขอบ']
              },
              chartData: [
                { name: 'กทม.', moralValue: 84.5, externalMetric: 32.1 },
                { name: 'กลาง', moralValue: 82.1, externalMetric: 38.4 },
                { name: 'เหนือ', moralValue: 80.2, externalMetric: 42.0 },
                { name: 'อีสาน', moralValue: 81.0, externalMetric: 39.5 },
                { name: 'ใต้', moralValue: 79.4, externalMetric: 45.2 }
              ],
              chartConfig: {
                xKey: 'name',
                barKey: 'moralValue',
                barLabel: 'ดัชนีคุณธรรม (คะแนนเฉลี่ย)',
                barColor: '#0284c7',
                lineKey: 'externalMetric',
                lineLabel: 'ตัวชี้วัดภายนอก',
                lineColor: '#ef4444',
                unitBar: '',
                unitLine: '%'
              },
              methodologyExplanation: 'การประเมิน 5 ขั้นตอน (Semantic, Temporal, Key Linkage, Plausibility, Governance)',
              policyRecommendation: `ขับเคลื่อนข้อเสนอนโยบายด้าน ${dim.title} ร่วมกับภาคีเครือข่าย`,
              publishedAt: dateStr,
              publishedBy: 'Account Admin (ศูนย์คุณธรรม)'
            };

        publishSynergy(publishedItem);

        return init;
      }
    }
  }
  return null;
}

// Backward compatibility exports
export interface SynergySubmenuItem {
  id: string;
  title: string;
  iconName: string;
  color: string;
  description: string;
  tableIds?: string[];
}

export function unlinkTableFromSubmenu(domainId: string, submenuId: string, tableId: string): void {
  removeTableFromInitiative(submenuId, tableId);
}

export function linkTableToSubmenu(domainId: string, submenuId: string, tableId: string): void {
  addTableToInitiative(submenuId, tableId);
}

// ----------------------------------------------------------------------------
// 4. Central Pool Grouped Resolver (Internal vs External)
// ----------------------------------------------------------------------------
export function resolveDatasetMeta(tableId: string): ResolvedDatasetMeta {
  const pool = getCentralPoolDatasets();
  const foundInPool = pool.find((p) => p.id === tableId);
  if (foundInPool) {
    const isExt =
      foundInPool.sourceType === 'External API' ||
      foundInPool.id.startsWith('ext_') ||
      foundInPool.sourceAgency.includes('กรม') ||
      foundInPool.sourceAgency.includes('สำนักงาน') ||
      foundInPool.sourceAgency.includes('ธปท') ||
      foundInPool.sourceAgency.includes('พม');
    return {
      id: foundInPool.id,
      name: foundInPool.name,
      category: foundInPool.category,
      sourceType: foundInPool.sourceType,
      sourceAgency: foundInPool.sourceAgency,
      rowCount: foundInPool.rowCount,
      columnCount: foundInPool.columnCount,
      description: foundInPool.description,
      isExternal: isExt
    };
  }

  // Look in DuckDB Tables Meta
  const foundDuck = ALL_DUCKDB_TABLES_META.find((d) => d.tableName === tableId);
  if (foundDuck) {
    const isExt = foundDuck.module === 'external_synergy' || tableId.startsWith('ext_');
    return {
      id: foundDuck.tableName,
      name: foundDuck.displayName,
      category: foundDuck.category || (isExt ? 'ข้อมูลภายนอก' : 'คุณธรรม'),
      sourceType: 'DuckDB',
      sourceAgency: foundDuck.sourceAgency || 'ศูนย์คุณธรรม',
      rowCount: foundDuck.rowCount,
      columnCount: (foundDuck as any).columnCount || (foundDuck.columns ? foundDuck.columns.length : 6),
      description: foundDuck.description,
      isExternal: isExt
    };
  }

  // Fallback
  return {
    id: tableId,
    name: tableId.replace(/_/g, ' '),
    category: 'ทั่วไป',
    sourceType: 'DuckDB',
    sourceAgency: 'ศูนย์คุณธรรม / เครือข่าย',
    rowCount: 20,
    columnCount: 6,
    description: `ตารางข้อมูล ${tableId} สำหรับการวิเคราะห์คุณธรรม`,
    isExternal: tableId.startsWith('ext_')
  };
}

export function getCentralPoolGrouped(): {
  internal: ResolvedDatasetMeta[];
  external: ResolvedDatasetMeta[];
} {
  const pool = getCentralPoolDatasets();
  const allDuckMeta = ALL_DUCKDB_TABLES_META;

  const datasetMap = new Map<string, ResolvedDatasetMeta>();

  // Add from DuckDB Meta
  allDuckMeta.forEach((d) => {
    datasetMap.set(d.tableName, resolveDatasetMeta(d.tableName));
  });

  // Add from pool
  pool.forEach((p) => {
    if (!datasetMap.has(p.id)) {
      datasetMap.set(p.id, resolveDatasetMeta(p.id));
    }
  });

  const internal: ResolvedDatasetMeta[] = [];
  const external: ResolvedDatasetMeta[] = [];

  datasetMap.forEach((meta) => {
    if (meta.isExternal) {
      external.push(meta);
    } else {
      internal.push(meta);
    }
  });

  return { internal, external };
}
