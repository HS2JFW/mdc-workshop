// ----------------------------------------------------------------------------
// Published Synergy Service
// Manages published synergy configurations across target pages:
// policy-1-1 (ดัชนีคุณธรรม), policy-1-2 (ทุนชีวิต), policy-moral-credit (Moral Credit),
// policy-moral-lecturers (วิทยากรคุณธรรม), moral-analysis (ภาพรวม)
// ----------------------------------------------------------------------------

export interface PublishedSynergyItem {
  id: string; // e.g. syn_1730999999
  title: string;
  themeTitle: string;
  targetPageId: 'policy-1-1' | 'policy-1-2' | 'policy-moral-credit' | 'policy-moral-lecturers' | 'moral-analysis';
  targetPageTitle: string;
  internalDatasetName: string;
  internalDatasetSource: string;
  externalDatasetName: string;
  externalAgency: string;
  internalTableIds?: string[];
  externalTableIds?: string[];
  compatibilityScore: number; // e.g. 93
  summaryHeadline: string;
  thematicDescription: string;
  positiveImpact: {
    title: string;
    metric: string;
    description: string;
    championHubs: string[];
  };
  negativeImpact: {
    title: string;
    metric: string;
    description: string;
    whiteSpaces: string[];
  };
  chartData: {
    name: string; // Province or Region name
    moralValue: number; // e.g. Moral Lecturer count or Moral Index
    externalMetric: number; // e.g. Dropout rate or Crime rate
    secondaryMetric?: number;
    category?: 'hub' | 'whitespace' | 'normal';
  }[];
  chartConfig: {
    xKey: string;
    barKey: string;
    barLabel: string;
    barColor: string;
    lineKey: string;
    lineLabel: string;
    lineColor: string;
    unitBar: string;
    unitLine: string;
  };
  methodologyExplanation: string;
  policyRecommendation: string;
  publishedAt: string;
  publishedBy: string;
}

const STORAGE_KEY = 'mdc_published_synergy_items_v2';
const EVENT_KEY = 'mdc_published_synergies_changed';

export const TARGET_PAGES_OPTIONS: { id: PublishedSynergyItem['targetPageId']; title: string; category: string }[] = [
  { id: 'policy-1-1', title: 'หน้าดัชนีคุณธรรม 5 มิติ (Moral Index)', category: 'ดัชนีคุณธรรม' },
  { id: 'policy-1-2', title: 'หน้าทุนชีวิต (Life Capital 4+1)', category: 'ทุนชีวิต' },
  { id: 'policy-moral-credit', title: 'หน้า Moral Credit (แต้มความดี)', category: 'Moral Credit' },
  { id: 'policy-moral-lecturers', title: 'หน้าวิทยากรคุณธรรม (Moral Trainers / Coaches)', category: 'วิทยากรคุณธรรม' },
  { id: 'moral-analysis', title: 'หน้าภาพรวมยุทธศาสตร์ 20 ปี และ บวร', category: 'ภาพรวม' }
];

export const INITIAL_PUBLISHED_SYNERGIES: PublishedSynergyItem[] = [];

export function getPublishedSynergies(): PublishedSynergyItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Clean out initial mock/seed data if previously stored in localStorage
      const cleaned = parsed.filter((item) => item && item.id !== 'syn_init_moral_lecturers_education');
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return [];
  } catch (err) {
    console.warn('Error reading published synergies:', err);
    return [];
  }
}

export function getPublishedSynergiesForPage(pageId: string): PublishedSynergyItem[] {
  const all = getPublishedSynergies();
  return all.filter((item) => item.targetPageId === pageId);
}

export function publishSynergy(item: PublishedSynergyItem): void {
  const current = getPublishedSynergies();
  const filtered = current.filter((s) => s.id !== item.id);
  const updated = [item, ...filtered];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: item }));
    } catch (err) {
      console.warn('Error saving published synergy:', err);
    }
  }
}

export function deletePublishedSynergy(id: string): void {
  const current = getPublishedSynergies();
  const updated = current.filter((s) => s.id !== id);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { id, deleted: true } }));
    } catch (err) {
      console.warn('Error deleting published synergy:', err);
    }
  }
}

export function onPublishedSynergiesChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_KEY, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT_KEY, handler);
    window.removeEventListener('storage', handler);
  };
}
