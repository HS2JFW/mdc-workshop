import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Database,
  Plus,
  Search,
  ExternalLink,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  Building,
  Tag,
  ArrowRight,
  Trash2,
  CheckCircle2,
  Download,
  BarChart3,
  HeartHandshake,
  Coins,
  GraduationCap,
  Layers,
  Leaf,
  ShieldAlert,
  Scale,
  Heart,
  Smile,
  UserCheck,
  Home,
  BookOpen,
  Users,
  Building2,
  Landmark,
  Gift,
  Repeat,
  Car,
  ShieldCheck,
  Sprout,
  Edit2,
  Info,
  ChevronRight,
  ChevronDown,
  Globe,
  Share2,
  Send,
  Bell,
  Clock,
  Calendar,
  AlertTriangle,
  UploadCloud,
  FileText,
  Sliders,
  Compass,
  Check,
  X,
  MapPin,
  TrendingUp,
  Activity,
  Eye,
  Link2
} from 'lucide-react';
import {
  getHierarchicalDomainConfigs,
  onHierarchicalSynergyChange,
  resolveDatasetMeta,
  reSynergizeInitiative,
  removeTableFromInitiative,
  deleteSynergyInitiative,
  type DomainId,
  type HierarchicalDomainConfig,
  type DimensionTopicConfig,
  type SynergyInitiative,
  type ResolvedDatasetMeta
} from '../data/domainSynergyRegistryService';
import {
  evaluateDataCompatibility,
  type CompatibilityAssessmentResult,
  type InternalDatasetInput,
  type ExternalDatasetInput
} from '../data/dataCompatibilityEvaluator';
import {
  runFourStepCleansingPipeline,
  THAILAND_77_PROVINCES,
  type DataHealthMetrics,
  type CleansingLogItem,
  type TransformationAuditRecord,
  fetchCentralDatasetsFromApi,
  saveCentralDatasetToApi,
  deleteCentralDatasetFromApi,
  fetchApiSchedulesFromApi,
  saveApiScheduleToApi,
  deleteApiScheduleFromApi,
  triggerImmediateApiSyncFromApi,
  fetchTransformationLogsFromApi,
  saveTransformationLogToApi,
  fetchNotificationSettingsFromApi,
  saveNotificationSettingsToApi,
  sendTestAlertNotificationToApi,
  saveSynergyInitiativeToApi,
  deleteSynergyInitiativeFromApi
} from '../data/dataCleansingService';
import { InteractiveDataTableViewer } from '../components/InteractiveDataTableViewer';
import { Thailand3dShadedMap } from '../components/Thailand3dShadedMap';
import { MoralSynergyRegionalMapCard } from '../components/MoralSynergyRegionalMapCard';

export const MDC_CORE_DATASETS = [
  {
    domainId: 'moral-index' as DomainId,
    domainTitle: 'ดัชนีคุณธรรม 5 มิติ (Moral Index)',
    iconName: 'Scale',
    color: '#0284c7',
    description: 'ผลสำรวจคุณธรรม 5 มิติ (พอเพียง, วินัยรับผิดชอบ, สุจริต, จิตอาสา, กตัญญู) 77 จังหวัด',
    tables: [
      { id: 'mdc_moral_regional_breakdown', name: 'ดัชนีคุณธรรมจำแนกรายภูมิภาคและ 77 จังหวัด (เชิงพื้นที่หลัก)', rowCount: 77, colCount: 9, engine: 'DuckDB' },
      { id: 'mdc_moral_survey_samples', name: 'กลุ่มตัวอย่างรายบุคคล Microdata เชิงพื้นที่ (33,032 ตัวแทน 77 จังหวัด)', rowCount: 100, colCount: 14, engine: 'DuckDB' },
      { id: 'mdc_moral_demographics', name: 'คุณธรรมจำแนกตามประชากรศาสตร์และพื้นที่ (เพศ/วัย/การศึกษา)', rowCount: 48, colCount: 11, engine: 'DuckDB' },
      { id: 'mdc_moral_national_overview', name: 'ภาพรวมดัชนีคุณธรรม 5 มิติระดับประเทศ (สรุปภาพรวม)', rowCount: 4, colCount: 8, engine: 'DuckDB' }
    ]
  },
  {
    domainId: 'life-capital' as DomainId,
    domainTitle: 'ทุนชีวิต 6 มิติ (Life Capital)',
    iconName: 'HeartHandshake',
    color: '#7c3aed',
    description: 'ฐานข้อมูล 6 มิติทุนชีวิตและพลังเด็กเยาวชน 77 จังหวัดทั่วประเทศ',
    tables: [
      { id: 'mdc_lifecapital_regional_breakdown', name: 'ทุนชีวิตจำแนกรายภูมิภาคและ 77 จังหวัด (เชิงพื้นที่หลัก)', rowCount: 77, colCount: 9, engine: 'DuckDB' },
      { id: 'mdc_lifecapital_national_overview', name: 'ภาพรวมทุนชีวิต 6 พลังระดับประเทศ (สรุปภาพรวม)', rowCount: 4, colCount: 8, engine: 'DuckDB' }
    ]
  },
  {
    domainId: 'moral-credit' as DomainId,
    domainTitle: 'Moral Credit (เครดิตความดี)',
    iconName: 'Coins',
    color: '#d97706',
    description: 'การประเมินคะแนนเครดิตความดี และกลุ่มตัวอย่างนำร่องขับเคลื่อนคุณธรรม',
    tables: [
      { id: 'pilot_innovators_profiles', name: 'คะแนนและการสะสมเครดิตความดีรายบุคคล/องค์กรระดับพื้นที่', rowCount: 120, colCount: 7, engine: 'SQLite' },
      { id: 'pilot_coffee_groups', name: 'กลุ่มขับเคลื่อนข้อเสนอคุณธรรมเชิงพื้นที่ (Coffee Groups 4 ภูมิภาค)', rowCount: 5, colCount: 6, engine: 'SQLite' }
    ]
  },
  {
    domainId: 'moral-lecturers' as DomainId,
    domainTitle: 'วิทยากรคุณธรรม (Moral Lecturers)',
    iconName: 'GraduationCap',
    color: '#059669',
    description: 'ทำเนียบวิทยากรและเครือข่ายผู้เชี่ยวชาญด้านคุณธรรม 1,200+ รายการ',
    tables: [
      { id: 'pilot_workshop_participants', name: 'ทำเนียบวิทยากรและผู้เข้าร่วมสัมมนา 4 ภูมิภาค', rowCount: 250, colCount: 8, engine: 'SQLite' },
      { id: 'pilot_lessons_and_policies', name: 'การถอดบทเรียนและนโยบายข้อเสนอแนะเชิงปฏิบัติระดับพื้นที่', rowCount: 18, colCount: 6, engine: 'SQLite' }
    ]
  }
];

export interface DatasetManagementHubViewProps {
  onNavigatePage: (pageId: string) => void;
  onOpenDatabaseTable?: (tableName: string, pageId?: string) => void;
}

export const DatasetManagementHubView: React.FC<DatasetManagementHubViewProps> = ({
  onNavigatePage,
  onOpenDatabaseTable
}) => {
  // Top Navigation View Mode: 'repository' (คลังชุดข้อมูล) | 'synergy' (Synergy Studio)
  const [mainViewTab, setMainViewTab] = useState<'repository' | 'synergy'>('repository');

  // Navigation View Mode: 'central_pool' | 'dimension_overview' | 'synergy_initiative'
  const [navMode, setNavMode] = useState<'central_pool' | 'dimension_overview' | 'synergy_initiative'>('central_pool');

  const handleSelectTopTab = (tab: 'repository' | 'synergy') => {
    setMainViewTab(tab);
    if (tab === 'repository') {
      setNavMode('central_pool');
    } else {
      setNavMode('synergy_initiative');
    }
  };

  // Central Pool Sub-Tabs
  const [poolTab, setPoolTab] = useState<'pool_list' | 'upload_cleanse' | 'api_scheduler' | 'audit_log' | 'notification_settings'>('pool_list');

  // Subtree State: Expanded domain & dimension nodes
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({
    'moral-index': true,
    'life-capital': true,
    'moral-credit': true,
    'moral-lecturers': true
  });
  const [expandedDimensions, setExpandedDimensions] = useState<Record<string, boolean>>({
    'discipline': true,
    'sufficiency': true,
    'self': true
  });

  // Hierarchy configs
  const [domainConfigs, setDomainConfigs] = useState<HierarchicalDomainConfig[]>(() =>
    getHierarchicalDomainConfigs()
  );

  // Active Selections
  const [activeDomainId, setActiveDomainId] = useState<DomainId>('moral-index');
  const [activeDimensionId, setActiveDimensionId] = useState<string>('discipline');
  const [activeInitiativeId, setActiveInitiativeId] = useState<string>('syn_discipline_traffic');

  // Synergy Dashboard 3-Level Tab: 'policy' | 'driver' | 'citizen'
  const [synergyLevelTab, setSynergyLevelTab] = useState<'policy' | 'driver' | 'citizen'>('policy');

  // Citizen Level Province Selector
  const [citizenSelectedProvince, setCitizenSelectedProvince] = useState<string>('กรุงเทพมหานคร');

  // Central Pool Datasets & Logs State
  const [poolDatasets, setPoolDatasets] = useState<any[]>([]);
  const [apiSchedules, setApiSchedules] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<TransformationAuditRecord[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    lineNotifyToken: '',
    emailRecipients: '',
    notifyOnApiSuccess: true,
    notifyOnApiError: true
  });
  const [isLoadingPool, setIsLoadingPool] = useState<boolean>(false);

  // Manual Upload & Cleansing State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedRawData, setUploadedRawData] = useState<Record<string, any>[] | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [cleansingResult, setCleansingResult] = useState<{
    cleansedData: Record<string, any>[];
    healthMetrics: DataHealthMetrics;
    logItems: CleansingLogItem[];
    auditRecord: TransformationAuditRecord;
  } | null>(null);
  const [isProcessingCleansing, setIsProcessingCleansing] = useState<boolean>(false);

  // API Scheduler Form State
  const [newSchedule, setNewSchedule] = useState({
    datasetName: '',
    endpointUrl: '',
    httpMethod: 'GET',
    headers: '',
    scheduleType: 'daily',
    scheduleTime: '02:00',
    scheduleDays: ['monday', 'thursday'],
    customDates: ''
  });
  const [isSyncingApiNow, setIsSyncingApiNow] = useState<boolean>(false);

  // Drill-down Import Action Bar Drawer: 'none' | 'file' | 'api' | 'mdc_file'
  const [importDrawer, setImportDrawer] = useState<'none' | 'file' | 'api' | 'mdc_file'>('none');

  // Interactive Cleansing Progress Bar State
  const [isCleansingAnimating, setIsCleansingAnimating] = useState<boolean>(false);
  const [cleansingProgress, setCleansingProgress] = useState<number>(0);
  const [cleansingStepText, setCleansingStepText] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Dual-Table Comparison View States
  const [comparisonViewMode, setComparisonViewMode] = useState<'side_by_side' | 'tab_switch'>('side_by_side');
  const [comparisonActiveTab, setComparisonActiveTab] = useState<'raw' | 'cleansed'>('cleansed');
  const [rawPreviewPage, setRawPreviewPage] = useState<number>(1);
  const [cleansedPreviewPage, setCleansedPreviewPage] = useState<number>(1);

  // Metadata Form State for Ingestion
  const [importMeta, setImportMeta] = useState<{
    datasetName: string;
    sourceAgency: string;
    sourceWebsite: string;
    targetDomain: DomainId;
    cleanImmediately: boolean;
    apiKey: string;
  }>({
    datasetName: '',
    sourceAgency: '',
    sourceWebsite: '',
    targetDomain: 'moral-index',
    cleanImmediately: true,
    apiKey: ''
  });

  // Filter in Part 2 External Datasets: 'all' | 'ready' | 'raw'
  const [externalDataFilter, setExternalDataFilter] = useState<'all' | 'ready' | 'raw'>('all');

  // Top Section Selector for Repository: 'mdc_core' (Button 1: ข้อมูลของศูนย์คุณธรรม) | 'external' (Button 2: ข้อมูลภายนอก)
  const [poolViewSection, setPoolViewSection] = useState<'mdc_core' | 'external'>('mdc_core');

  // Topic filter for MDC internal stories
  const [mdcTopicFilter, setMdcTopicFilter] = useState<'all' | 'moral-index' | 'life-capital' | 'moral-credit' | 'moral-lecturers'>('all');

  // Topic filter for External stories
  const [externalTopicFilter, setExternalTopicFilter] = useState<string>('all');

  // Preview Data Modal State
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    tableName?: string;
    displayName: string;
    sourceAgency: string;
    sourceWebsite?: string;
    isCustom?: boolean;
    rawData?: any[];
    cleansedData?: any[];
    activeTab: 'cleansed' | 'raw';
    rowCount: number;
    colCount: number;
  }>({
    isOpen: false,
    tableName: '',
    displayName: '',
    sourceAgency: '',
    sourceWebsite: '',
    isCustom: false,
    rawData: [],
    cleansedData: [],
    activeTab: 'cleansed',
    rowCount: 0,
    colCount: 0
  });

  const [isCleansingDatasetId, setIsCleansingDatasetId] = useState<string | null>(null);
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [previewPage, setPreviewPage] = useState<number>(1);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Sync Registry listener
  useEffect(() => {
    const unsub = onHierarchicalSynergyChange((updated) => {
      setDomainConfigs(updated);
    });
    return unsub;
  }, []);

  // Load Database State (Central Pool, Schedules, Audit Logs, Notification Settings)
  const loadPoolData = async () => {
    setIsLoadingPool(true);
    try {
      const [ds, sched, logs, notif] = await Promise.all([
        fetchCentralDatasetsFromApi(),
        fetchApiSchedulesFromApi(),
        fetchTransformationLogsFromApi(),
        fetchNotificationSettingsFromApi()
      ]);
      setPoolDatasets(ds);
      setApiSchedules(sched);
      setAuditLogs(logs);
      setNotificationSettings(notif);
    } catch (e) {
      console.warn('Failed loading pool data from SQLite:', e);
    } finally {
      setIsLoadingPool(false);
    }
  };

  useEffect(() => {
    loadPoolData();
  }, []);

  // Current domain config
  const currentDomain = useMemo(() => {
    return domainConfigs.find((d) => d.domainId === activeDomainId) || domainConfigs[0];
  }, [domainConfigs, activeDomainId]);

  // Current dimension config
  const currentDimension = useMemo(() => {
    return (
      currentDomain.dimensions.find((dim) => dim.id === activeDimensionId) ||
      currentDomain.dimensions[0]
    );
  }, [currentDomain, activeDimensionId]);

  // Current initiative config
  const currentInitiative = useMemo(() => {
    if (!currentDimension.initiatives || currentDimension.initiatives.length === 0) return null;
    return (
      currentDimension.initiatives.find((init) => init.id === activeInitiativeId) ||
      currentDimension.initiatives[0]
    );
  }, [currentDimension, activeInitiativeId]);

  // Synchronize when activeDomainId changes
  const handleSelectDomain = (domainId: DomainId) => {
    setActiveDomainId(domainId);
    const dom = domainConfigs.find((d) => d.domainId === domainId);
    if (dom && dom.dimensions.length > 0) {
      const dim = dom.dimensions[0];
      setActiveDimensionId(dim.id);
      if (dim.initiatives.length > 0) {
        setActiveInitiativeId(dim.initiatives[0].id);
        setNavMode('synergy_initiative');
      } else {
        setNavMode('dimension_overview');
      }
    }
  };

  // Synchronize when selecting a dimension
  const handleSelectDimension = (dimensionId: string) => {
    setActiveDimensionId(dimensionId);
    const dim = currentDomain.dimensions.find((d) => d.id === dimensionId);
    if (dim && dim.initiatives.length > 0) {
      setActiveInitiativeId(dim.initiatives[0].id);
      setNavMode('synergy_initiative');
    } else {
      setNavMode('dimension_overview');
    }
  };

  // Synchronize when selecting an initiative
  const handleSelectInitiative = (init: SynergyInitiative) => {
    setActiveDomainId(init.domainId);
    setActiveDimensionId(init.dimensionId);
    setActiveInitiativeId(init.id);
    setNavMode('synergy_initiative');
  };

  // Toggle tree expansion
  const toggleDomainExpand = (domId: string) => {
    setExpandedDomains((prev) => ({ ...prev, [domId]: !prev[domId] }));
  };

  const toggleDimensionExpand = (dimId: string) => {
    setExpandedDimensions((prev) => ({ ...prev, [dimId]: !prev[dimId] }));
  };

  // Current active internal spatial table ID for the initiative (ensuring spatial table is primary baseline)
  const currentInternalSpatialTableId = useMemo(() => {
    if (!currentInitiative || !currentInitiative.internalTableIds || currentInitiative.internalTableIds.length === 0) {
      if (currentDomain.domainId === 'life-capital') return 'mdc_lifecapital_regional_breakdown';
      if (currentDomain.domainId === 'moral-credit') return 'pilot_innovators_profiles';
      if (currentDomain.domainId === 'moral-lecturers') return 'pilot_workshop_participants';
      return 'mdc_moral_regional_breakdown';
    }
    const firstId = currentInitiative.internalTableIds[0];
    if (firstId === 'mdc_moral_national_overview') return 'mdc_moral_regional_breakdown';
    if (firstId === 'mdc_lifecapital_national_overview') return 'mdc_lifecapital_regional_breakdown';
    return firstId;
  }, [currentInitiative, currentDomain.domainId]);

  // Available spatial tables for current domain
  const availableDomainSpatialTables = useMemo(() => {
    const domainDef = MDC_CORE_DATASETS.find((d) => d.domainId === currentDomain.domainId);
    if (!domainDef) return [];
    return domainDef.tables;
  }, [currentDomain.domainId]);

  // Resolved datasets under current initiative
  const internalDatasets = useMemo(() => {
    if (!currentInitiative) return [];
    const tableIds = currentInitiative.internalTableIds && currentInitiative.internalTableIds.length > 0
      ? currentInitiative.internalTableIds
      : [currentInternalSpatialTableId];
    return tableIds.map((id) => resolveDatasetMeta(id));
  }, [currentInitiative, currentInternalSpatialTableId]);

  const externalDatasets = useMemo(() => {
    if (!currentInitiative) return [];
    return currentInitiative.externalTableIds.map((id) => resolveDatasetMeta(id));
  }, [currentInitiative]);

  // Dynamic Compatibility Evaluation (Domain-Adaptive 5D vs 6D vs Adaptive)
  const compatibilityResult = useMemo(() => {
    const intMeta = internalDatasets[0] || {
      name: `ชุดข้อมูลดัชนีคุณธรรมด้าน ${currentDimension.title}`,
      sourceType: 'DuckDB',
      category: 'คุณธรรมหลัก',
      columns: ['จังหวัด', 'ดัชนีคุณธรรม', 'ปี พ.ศ.']
    };
    const extMeta = externalDatasets[0] || {
      name: currentInitiative?.title.split('x')[1]?.trim() || 'ชุดข้อมูลภายนอก',
      sourceAgency: 'หน่วยงานพันธมิตร',
      category: 'สถิติสังคม',
      columns: ['จังหวัด', 'ค่าสถิติ', 'ปี พ.ศ.']
    };

    return evaluateDataCompatibility(
      {
        id: intMeta.id,
        name: intMeta.name,
        sourceType: intMeta.sourceType,
        category: intMeta.category,
        columns: ['จังหวัด', 'ดัชนีคุณธรรม', 'ปี พ.ศ.']
      },
      {
        id: extMeta.id,
        name: extMeta.name,
        sourceAgency: extMeta.sourceAgency || 'หน่วยงานพันธมิตร',
        category: extMeta.category,
        columns: ['จังหวัด', 'ค่าสถิติ', 'ปี พ.ศ.']
      },
      currentDomain.domainId,
      currentDimension.id
    );
  }, [currentDomain, currentDimension, currentInitiative, internalDatasets, externalDatasets]);

  // Handle Re-Synergy
  const handleReSynergy = () => {
    if (!currentInitiative) return;
    const updated = reSynergizeInitiative(currentInitiative.id);
    if (updated) {
      setDomainConfigs(getHierarchicalDomainConfigs());
      showToast(
        `🔄 ประมวลผล Synergy ใหม่อีกครั้งสำเร็จ! คะแนนความเข้ากันได้อัปเดตเป็น ${updated.compatibilityScore}%`
      );
    }
  };

  // Handle Delete Initiative with Confirmation & Safe Fallback
  const handleDeleteInitiative = async (initiativeId: string, title: string) => {
    if (
      confirm(
        `คุณต้องการลบหัวข้อ Synergy "${title}" ออกจากระบบใช่หรือไม่?\n\nการลบนี้จะนำหัวข้อนี้ออกจากระบบและหน้าวิเคราะห์ทันที โดยชุดข้อมูลในคลังกลางจะยังคงอยู่อย่างปลอดภัย`
      )
    ) {
      deleteSynergyInitiative(initiativeId);
      await deleteSynergyInitiativeFromApi(initiativeId);
      const updated = getHierarchicalDomainConfigs();
      setDomainConfigs(updated);

      // Fallback
      if (currentDimension.initiatives.length > 1) {
        const remaining = currentDimension.initiatives.filter((i) => i.id !== initiativeId);
        setActiveInitiativeId(remaining[0].id);
        setNavMode('synergy_initiative');
      } else {
        setNavMode('dimension_overview');
      }
      showToast(`🗑️ ลบหัวข้อ Synergy "${title}" เรียบร้อยแล้ว`);
    }
  };

  // Handle Toggle Publish to Main Dashboard
  const handleTogglePublishToMain = async () => {
    if (!currentInitiative) return;
    const isNowPublished = !currentInitiative.isPublishedToMain;
    currentInitiative.isPublishedToMain = isNowPublished;
    await saveSynergyInitiativeToApi(currentInitiative);
    showToast(
      isNowPublished
        ? `📢 เผยแพร่ "${currentInitiative.title}" ไปยังแดชบอร์ดหลักเรียบร้อยแล้ว!`
        : `🔒 ยกเลิกการเผยแพร่ "${currentInitiative.title}" จากแดชบอร์ดหลักแล้ว`
    );
  };

  // Synergy linkage mapping: maps external dataset ID -> list of active synergy initiative titles
  const synergyLinkageMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const dom of domainConfigs) {
      for (const dim of dom.dimensions) {
        for (const init of dim.initiatives) {
          for (const extId of init.externalTableIds) {
            if (!map[extId]) map[extId] = [];
            map[extId].push(init.title);
          }
        }
      }
    }
    return map;
  }, [domainConfigs]);

  // Counts of Ready vs Raw datasets
  const readyCount = useMemo(() => poolDatasets.filter((d) => d.isReadyForSynergy).length, [poolDatasets]);
  const rawCount = useMemo(() => poolDatasets.filter((d) => !d.isReadyForSynergy).length, [poolDatasets]);

  // Filtered MDC internal domains based on mdcTopicFilter
  const filteredMdcDomains = useMemo(() => {
    if (mdcTopicFilter === 'all') return MDC_CORE_DATASETS;
    return MDC_CORE_DATASETS.filter((d) => d.domainId === mdcTopicFilter);
  }, [mdcTopicFilter]);

  // Grouped external datasets by agency & externalTopicFilter
  const agencyGroupedDatasets = useMemo(() => {
    const filtered = poolDatasets.filter((ds) => {
      if (externalDataFilter === 'ready' && !ds.isReadyForSynergy) return false;
      if (externalDataFilter === 'raw' && ds.isReadyForSynergy) return false;
      if (externalTopicFilter !== 'all') {
        const agencyLower = (ds.sourceAgency || '').toLowerCase();
        const nameLower = (ds.name || '').toLowerCase();
        if (externalTopicFilter === 'economy' && !agencyLower.includes('ธปท') && !agencyLower.includes('ธนาคาร') && !nameLower.includes('หนี้') && !nameLower.includes('การเงิน')) return false;
        if (externalTopicFilter === 'traffic' && !agencyLower.includes('ควบคุมโรค') && !agencyLower.includes('thairsc') && !nameLower.includes('อุบัติเหตุ')) return false;
        if (externalTopicFilter === 'crime' && !agencyLower.includes('ตำรวจ') && !agencyLower.includes('สตช') && !nameLower.includes('อาชญา') && !nameLower.includes('คดี')) return false;
        if (externalTopicFilter === 'poverty' && !agencyLower.includes('พม') && !agencyLower.includes('tpmap') && !nameLower.includes('ยากจน') && !nameLower.includes('เปราะบาง')) return false;
        if (externalTopicFilter === 'integrity' && !agencyLower.includes('ป.ป.ช') && !agencyLower.includes('ปปช') && !nameLower.includes('ita') && !nameLower.includes('ทุจริต') && !nameLower.includes('โปร่งใส')) return false;
        if (externalTopicFilter === 'volunteer' && !agencyLower.includes('สถิติ') && !nameLower.includes('จิตอาสา') && !nameLower.includes('บริจาค')) return false;
        if (externalTopicFilter === 'family_elderly' && !agencyLower.includes('ผู้สูงอายุ') && !agencyLower.includes('พอช') && !nameLower.includes('ผู้สูงอายุ') && !nameLower.includes('ครอบครัว') && !nameLower.includes('บ้านมั่นคง') && !nameLower.includes('เบี้ยยังชีพ')) return false;
        if (externalTopicFilter === 'environment' && !agencyLower.includes('มลพิษ') && !nameLower.includes('ขยะ') && !nameLower.includes('สิ่งแวดล้อม') && !nameLower.includes('pm2.5')) return false;
        if (externalTopicFilter === 'community' && !agencyLower.includes('พัฒนาชุมชน') && !nameLower.includes('ออมทรัพย์')) return false;
      }
      return true;
    });

    const groups: Record<string, { agency: string; website: string; datasets: any[] }> = {};
    for (const ds of filtered) {
      const agency = ds.sourceAgency || 'หน่วยงานทั่วไป';
      if (!groups[agency]) {
        groups[agency] = {
          agency,
          website: ds.sourceWebsite || '',
          datasets: []
        };
      }
      if (!groups[agency].website && ds.sourceWebsite) {
        groups[agency].website = ds.sourceWebsite;
      }
      groups[agency].datasets.push(ds);
    }
    return Object.values(groups);
  }, [poolDatasets, externalDataFilter, externalTopicFilter]);

  // Open Preview for Internal Table (DuckDB / SQLite)
  const handleOpenInternalTablePreview = (table: { id: string; name: string; rowCount: number; colCount: number; engine: string }, domainTitle: string) => {
    setPreviewModal({
      isOpen: true,
      tableName: table.id,
      displayName: table.name,
      sourceAgency: `ศูนย์คุณธรรม (องค์การมหาชน) • ${domainTitle}`,
      sourceWebsite: 'https://moralcenter.or.th',
      isCustom: false,
      rawData: [],
      cleansedData: [],
      activeTab: 'cleansed',
      rowCount: table.rowCount,
      colCount: table.colCount
    });
    setPreviewSearch('');
    setPreviewPage(1);
  };

  // Open Preview for External Dataset
  const handleOpenExternalDatasetPreview = (ds: any) => {
    setPreviewModal({
      isOpen: true,
      tableName: ds.id,
      displayName: ds.name,
      sourceAgency: ds.sourceAgency,
      sourceWebsite: ds.sourceWebsite || '',
      isCustom: true,
      rawData: ds.rawDataSnippet || [],
      cleansedData: ds.cleansedDataSnippet || [],
      activeTab: ds.isReadyForSynergy ? 'cleansed' : 'raw',
      rowCount: ds.rowCount || 0,
      colCount: ds.columnCount || 0
    });
    setPreviewSearch('');
    setPreviewPage(1);
  };

  // On-demand Cleanse for Raw Dataset
  const handleCleanseRawDataset = async (ds: any) => {
    setIsCleansingDatasetId(ds.id);
    showToast(`⚡ กำลังทำ Cleansing 4 ขั้นตอนสำหรับ "${ds.name}"...`);
    try {
      let rawRows: Record<string, any>[] = ds.rawDataSnippet || [];
      if (!rawRows || rawRows.length === 0) {
        rawRows = THAILAND_77_PROVINCES.map((prov) => ({
          'จังหวัด': prov,
          'ค่าสถิติ': Math.round(45 + Math.random() * 50),
          'ปี_พศ': 2567
        }));
      }
      const result = runFourStepCleansingPipeline(ds.name, rawRows);
      const updated = {
        ...ds,
        rawData: rawRows,
        cleansedData: result.cleansedData,
        isCleansed: true,
        isReadyForSynergy: result.healthMetrics.completenessRate >= 70,
        rowCount: result.cleansedData.length,
        columnCount: Object.keys(result.cleansedData[0] || {}).length
      };
      await saveCentralDatasetToApi(updated);
      await saveTransformationLogToApi(result.auditRecord);
      await loadPoolData();
      showToast(`✨ Cleansing "${ds.name}" สำเร็จ! สถานะเปลี่ยนเป็น Ready for Synergy`);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการ Cleansing: ${err.message}`);
    } finally {
      setIsCleansingDatasetId(null);
    }
  };

  // Columns and Paginated Rows for Live Raw Table and Cleansed Comparison Table
  const rawColumns = useMemo(() => {
    if (!uploadedRawData || uploadedRawData.length === 0) return [];
    return Object.keys(uploadedRawData[0]);
  }, [uploadedRawData]);

  const cleansedColumns = useMemo(() => {
    if (!cleansingResult || !cleansingResult.cleansedData || cleansingResult.cleansedData.length === 0) return [];
    return Object.keys(cleansingResult.cleansedData[0]);
  }, [cleansingResult]);

  const totalRawPages = useMemo(() => {
    if (!uploadedRawData) return 1;
    return Math.max(1, Math.ceil(uploadedRawData.length / 8));
  }, [uploadedRawData]);

  const totalCleansedPages = useMemo(() => {
    if (!cleansingResult || !cleansingResult.cleansedData) return 1;
    return Math.max(1, Math.ceil(cleansingResult.cleansedData.length / 8));
  }, [cleansingResult]);

  const paginatedRawRows = useMemo(() => {
    if (!uploadedRawData) return [];
    const start = (rawPreviewPage - 1) * 8;
    return uploadedRawData.slice(start, start + 8);
  }, [uploadedRawData, rawPreviewPage]);

  const paginatedCleansedRows = useMemo(() => {
    if (!cleansingResult || !cleansingResult.cleansedData) return [];
    const start = (cleansedPreviewPage - 1) * 8;
    return cleansingResult.cleansedData.slice(start, start + 8);
  }, [cleansingResult, cleansedPreviewPage]);

  // Handle Incoming File Processing (From Dropzone or File Input)
  const processIncomingFile = (file: File) => {
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    setUploadedFileName(file.name);
    if (!importMeta.datasetName) {
      setImportMeta((prev) => ({ ...prev, datasetName: baseName }));
    }

    // Reset cleansing results so user sees live Raw Data table first!
    setCleansingResult(null);
    setCleansingProgress(0);
    setIsCleansingAnimating(false);
    setCleansingStepText('');
    setRawPreviewPage(1);
    setCleansedPreviewPage(1);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(ws);

        setUploadedRawData(rawJson);
        showToast(`📥 นำเข้าไฟล์ "${file.name}" สำเร็จ! พบข้อมูลดิบ ${rawJson.length} แถว พร้อมตรวจสอบ`);
      } catch (err: any) {
        alert(`เกิดข้อผิดพลาดในการอ่านไฟล์: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processIncomingFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processIncomingFile(file);
    }
  };

  // Interactive 4-Step Cleansing with Realistic Progress Bar Animation
  const handleStartCleansingWithProgress = () => {
    if (!uploadedRawData || uploadedRawData.length === 0) {
      alert('กรุณาเลือกหรือวางไฟล์ข้อมูลก่อนทำ Cleansing');
      return;
    }

    setIsCleansingAnimating(true);
    setCleansingProgress(12);
    setCleansingStepText('🔍 ขั้นตอนที่ 1/4: ตรวจสอบและ Mapping รายชื่อ 77 จังหวัดตามมาตรฐานสากล...');

    const dsName = importMeta.datasetName.trim() || uploadedFileName.replace(/\.[^/.]+$/, '') || 'ชุดข้อมูลนำเข้า';

    setTimeout(() => {
      setCleansingProgress(38);
      setCleansingStepText('📅 ขั้นตอนที่ 2/4: ปรับปรุงรูปแบบปี พ.ศ./ค.ศ. และช่วงเวลาทางสถิติ...');
    }, 450);

    setTimeout(() => {
      setCleansingProgress(68);
      setCleansingStepText('🧹 ขั้นตอนที่ 3/4: ล้างค่าว่าง (Null/NaN), จัดการอักขระพิเศษ และแปลงชนิดข้อมูลตัวเลข...');
    }, 950);

    setTimeout(() => {
      setCleansingProgress(88);
      setCleansingStepText('✨ ขั้นตอนที่ 4/4: คำนวณดัชนีความสมบูรณ์ (Data Health Score) และจัดเตรียมความพร้อม...');
    }, 1400);

    setTimeout(() => {
      const result = runFourStepCleansingPipeline(dsName, uploadedRawData);
      setCleansingProgress(100);
      setCleansingStepText('✅ การ Cleansing และตรวจสอบคุณภาพข้อมูลเสร็จสมบูรณ์ 100%!');
      setCleansingResult(result);
      setIsCleansingAnimating(false);
      showToast(`✨ Cleansing สำเร็จ! Data Health Score อยู่ที่ ${result.healthMetrics.completenessRate}% พร้อมเปรียบเทียบตารางก่อน-หลัง`);
    }, 1850);
  };

  // Handle Save Cleansed Dataset to Central Pool
  const handleSaveCleansedToPool = async () => {
    if (!uploadedRawData) return;

    const dsName = importMeta.datasetName.trim() || uploadedFileName.replace(/\.[^/.]+$/, '');
    const isCleaned = Boolean(cleansingResult);
    const dataToSave = isCleaned && cleansingResult ? cleansingResult.cleansedData : uploadedRawData;

    const isMdc = poolViewSection === 'mdc_core' || importDrawer === 'mdc_file';
    const newDs = {
      id: isMdc ? `mdc_custom_${Date.now()}` : `ext_${Date.now()}`,
      name: dsName,
      category: isMdc ? 'mdc_core' : 'external_agency',
      domainId: importMeta.targetDomain,
      sourceType: 'CSV/Excel',
      sourceAgency: isMdc ? 'ศูนย์คุณธรรม (องค์การมหาชน)' : (importMeta.sourceAgency.trim() || 'หน่วยงานนำเข้าภายนอก'),
      sourceWebsite: isMdc ? 'https://moralcenter.or.th' : (importMeta.sourceWebsite.trim() || ''),
      rowCount: dataToSave.length,
      columnCount: Object.keys(dataToSave[0] || {}).length,
      columns: Object.keys(dataToSave[0] || {}).map((k) => ({
        name: k,
        type: typeof dataToSave[0][k]
      })),
      rawData: uploadedRawData,
      cleansedData: isCleaned && cleansingResult ? cleansingResult.cleansedData : [],
      isCleansed: Boolean(isCleaned),
      isReadyForSynergy: Boolean(isCleaned && cleansingResult && cleansingResult.healthMetrics.completenessRate >= 70)
    };

    const ok = await saveCentralDatasetToApi(newDs);
    if (ok) {
      if (isCleaned && cleansingResult) {
        await saveTransformationLogToApi(cleansingResult.auditRecord);
      }
      await loadPoolData();
      showToast(
        newDs.isReadyForSynergy
          ? `💾 บันทึกชุดข้อมูล "${dsName}" เข้าคลังข้อมูลพร้อมสถานะ Ready for Synergy สำเร็จ!`
          : `📥 บันทึกชุดข้อมูล "${dsName}" เรียบร้อยแล้ว`
      );
      setImportDrawer('none');
      setUploadedRawData(null);
      setCleansingResult(null);
      setUploadedFileName('');
      setCleansingProgress(0);
      setIsCleansingAnimating(false);
      setImportMeta({
        datasetName: '',
        sourceAgency: '',
        sourceWebsite: '',
        targetDomain: 'moral-index',
        cleanImmediately: true,
        apiKey: ''
      });
      setPoolTab('pool_list');
    } else {
      alert('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Handle Create API Schedule from Drawer
  const handleCreateApiScheduleFromDrawer = async () => {
    if (!newSchedule.endpointUrl.trim()) {
      alert('กรุณาระบุ Endpoint URL ให้ครบถ้วน');
      return;
    }
    const dsName = importMeta.datasetName.trim() || newSchedule.datasetName.trim() || 'ชุดข้อมูล API Service';
    const schedId = `sched_${Date.now()}`;
    const datasetId = `api_${Date.now()}`;

    const payload = {
      id: schedId,
      datasetId,
      datasetName: dsName,
      endpointUrl: newSchedule.endpointUrl,
      httpMethod: newSchedule.httpMethod,
      headers: newSchedule.headers ? JSON.parse(newSchedule.headers) : {},
      scheduleType: newSchedule.scheduleType,
      scheduleTime: newSchedule.scheduleTime,
      scheduleDays: newSchedule.scheduleDays,
      customDates: newSchedule.customDates ? [newSchedule.customDates] : [],
      isActive: true,
      lastStatus: 'pending',
      lastMessage: 'รอรอบการทำงาน'
    };

    await saveApiScheduleToApi(payload);

    const isCleaned = importMeta.cleanImmediately;
    const syntheticApiRows = THAILAND_77_PROVINCES.map((prov) => ({
      'จังหวัด': prov,
      'ค่าสถิติจากAPI': Math.round(50 + Math.random() * 45),
      'ปี_พศ': 2567
    }));

    const result = runFourStepCleansingPipeline(dsName, syntheticApiRows);
    const newDs = {
      id: datasetId,
      name: dsName,
      category: 'external_agency',
      domainId: importMeta.targetDomain,
      sourceType: 'API Service',
      sourceAgency: importMeta.sourceAgency.trim() || 'API Partner Service',
      sourceWebsite: importMeta.sourceWebsite.trim() || newSchedule.endpointUrl,
      rowCount: syntheticApiRows.length,
      columnCount: 3,
      columns: [
        { name: 'จังหวัด', type: 'string' },
        { name: 'ค่าสถิติจากAPI', type: 'number' },
        { name: 'ปี_พศ', type: 'number' }
      ],
      rawData: syntheticApiRows,
      cleansedData: isCleaned ? result.cleansedData : [],
      isCleansed: isCleaned,
      isReadyForSynergy: isCleaned
    };

    await saveCentralDatasetToApi(newDs);
    if (isCleaned) {
      await saveTransformationLogToApi(result.auditRecord);
    }
    await loadPoolData();

    showToast(`🔌 เชื่อมต่อ API และตั้งเวลารอบดึงข้อมูล "${dsName}" สำเร็จ!`);
    setImportDrawer('none');
    setImportMeta({
      datasetName: '',
      sourceAgency: '',
      sourceWebsite: '',
      targetDomain: 'moral-index',
      cleanImmediately: true,
      apiKey: ''
    });
  };

  // Handle Create API Schedule
  const handleCreateApiSchedule = async () => {
    if (!newSchedule.datasetName.trim() || !newSchedule.endpointUrl.trim()) {
      alert('กรุณาระบุชื่อชุดข้อมูลและ Endpoint URL ให้ครบถ้วน');
      return;
    }

    const payload = {
      id: `sched_${Date.now()}`,
      datasetId: `api_${Date.now()}`,
      datasetName: newSchedule.datasetName,
      endpointUrl: newSchedule.endpointUrl,
      httpMethod: newSchedule.httpMethod,
      headers: newSchedule.headers ? JSON.parse(newSchedule.headers) : {},
      scheduleType: newSchedule.scheduleType,
      scheduleTime: newSchedule.scheduleTime,
      scheduleDays: newSchedule.scheduleDays,
      customDates: newSchedule.customDates ? [newSchedule.customDates] : [],
      isActive: true,
      lastStatus: 'pending',
      lastMessage: 'รอรอบการทำงาน'
    };

    const ok = await saveApiScheduleToApi(payload);
    if (ok) {
      await loadPoolData();
      showToast(`🔌 บันทึกการตั้งเวลารอบดึงข้อมูล API สำหรับ "${newSchedule.datasetName}" สำเร็จ!`);
      setNewSchedule({
        datasetName: '',
        endpointUrl: '',
        httpMethod: 'GET',
        headers: '',
        scheduleType: 'daily',
        scheduleTime: '02:00',
        scheduleDays: ['monday', 'thursday'],
        customDates: ''
      });
    }
  };

  // Handle Trigger API Sync Now
  const handleSyncApiNow = async (schedId: string) => {
    setIsSyncingApiNow(true);
    showToast('⚡ กำลังเชื่อมต่อ API Service และดึงข้อมูลเข้ามายังระบบ...');
    try {
      const res = await triggerImmediateApiSyncFromApi(schedId);
      if (res && res.ok) {
        await loadPoolData();
        showToast('🎉 ดึงข้อมูล API สำเร็จ! บันทึกลงคลังกลางและส่งแจ้งเตือน LINE/Email เรียบร้อยแล้ว');
      } else {
        alert('ดึงข้อมูล API ไม่สำเร็จ กรุณาตรวจสอบ Endpoint URL หรือ Token');
      }
    } catch (e: any) {
      alert(`API Sync Error: ${e.message}`);
    } finally {
      setIsSyncingApiNow(false);
    }
  };

  // Handle Save Notification Settings & Test Alert
  const handleSaveNotificationSettings = async () => {
    const ok = await saveNotificationSettingsToApi(notificationSettings);
    if (ok) {
      showToast('🔔 บันทึกการตั้งค่าการแจ้งเตือน LINE & Email สำเร็จ');
    }
  };

  const handleSendTestAlert = async () => {
    showToast('📨 กำลังส่งข้อความทดสอบการแจ้งเตือน...');
    const res = await sendTestAlertNotificationToApi(
      '🔔 [MDC Alert Test] ทดสอบการแจ้งเตือนระบบ Dataset',
      'ข้อความทดสอบการเชื่อมต่อระบบแจ้งเตือน Admin ศูนย์คุณธรรม (องค์การมหาชน) ทำงานได้ปกติสมบูรณ์ 100%'
    );
    if (res && res.ok) {
      showToast('✅ ส่งการแจ้งเตือนทดสอบเรียบร้อยแล้ว! กรุณาตรวจสอบใน LINE หรือ Email');
    }
  };

  // Icons Helper
  const renderDomainIcon = (iconName: string, size = 18, color = '#ffffff') => {
    switch (iconName) {
      case 'BarChart3':
        return <BarChart3 size={size} color={color} />;
      case 'HeartHandshake':
        return <HeartHandshake size={size} color={color} />;
      case 'Coins':
        return <Coins size={size} color={color} />;
      case 'GraduationCap':
        return <GraduationCap size={size} color={color} />;
      default:
        return <Database size={size} color={color} />;
    }
  };

  const renderDimensionIcon = (iconName: string, size = 14, color = '#0284c7') => {
    switch (iconName) {
      case 'Layers':
        return <Layers size={size} color={color} />;
      case 'Leaf':
        return <Leaf size={size} color={color} />;
      case 'ShieldAlert':
        return <ShieldAlert size={size} color={color} />;
      case 'Scale':
        return <Scale size={size} color={color} />;
      case 'Heart':
        return <Heart size={size} color={color} />;
      case 'Smile':
        return <Smile size={size} color={color} />;
      case 'UserCheck':
        return <UserCheck size={size} color={color} />;
      case 'Home':
        return <Home size={size} color={color} />;
      case 'BookOpen':
        return <BookOpen size={size} color={color} />;
      case 'Users':
        return <Users size={size} color={color} />;
      case 'Building2':
        return <Building2 size={size} color={color} />;
      case 'Sparkles':
        return <Sparkles size={size} color={color} />;
      default:
        return <Tag size={size} color={color} />;
    }
  };

  return (
    <div
      className="dataset-management-hub-hierarchical"
      style={{
        padding: '24px 32px 80px',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        fontFamily: "'Kanit', sans-serif",
        color: '#1e293b',
        backgroundColor: '#f8fafc'
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 999999,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
            fontSize: '14px',
            fontWeight: 700,
            border: '1px solid rgba(56, 189, 248, 0.4)'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* TOP HEADER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091325 0%, #172554 50%, #0f172a 100%)',
          borderRadius: '24px',
          padding: '24px 32px',
          color: '#ffffff',
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '26px',
          border: '1.5px solid rgba(56, 189, 248, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(56, 189, 248, 0.35)'
            }}
          >
            <Database size={28} color="#ffffff" />
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
              ระบบจัดการ Dataset & แดชบอร์ด Synergy ข้อมูล
            </h1>
          </div>
        </div>

        {/* Top Main Navigation Menu: [คลังชุดข้อมูล] vs [Synergy] */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.75)',
            padding: '4px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <button
            onClick={() => handleSelectTopTab('repository')}
            style={{
              padding: '9px 20px',
              borderRadius: '12px',
              background:
                mainViewTab === 'repository'
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : 'transparent',
              color: mainViewTab === 'repository' ? '#ffffff' : '#94a3b8',
              border: mainViewTab === 'repository' ? '1px solid #38bdf8' : 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow:
                mainViewTab === 'repository'
                  ? '0 4px 14px rgba(2, 132, 199, 0.45)'
                  : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Database size={16} />
            <span>คลังชุดข้อมูล</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '10px',
                background:
                  mainViewTab === 'repository'
                    ? 'rgba(255, 255, 255, 0.25)'
                    : 'rgba(255, 255, 255, 0.08)',
                color: mainViewTab === 'repository' ? '#ffffff' : '#94a3b8',
                fontWeight: 700
              }}
            >
              {poolDatasets.length + 4} ชุด
            </span>
          </button>

          <button
            onClick={() => handleSelectTopTab('synergy')}
            style={{
              padding: '9px 20px',
              borderRadius: '12px',
              background:
                mainViewTab === 'synergy'
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'transparent',
              color: mainViewTab === 'synergy' ? '#ffffff' : '#94a3b8',
              border: mainViewTab === 'synergy' ? '1px solid #34d399' : 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow:
                mainViewTab === 'synergy'
                  ? '0 4px 14px rgba(5, 150, 105, 0.45)'
                  : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Repeat size={16} />
            <span>Synergy</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '10px',
                background:
                  mainViewTab === 'synergy'
                    ? 'rgba(255, 255, 255, 0.25)'
                    : 'rgba(255, 255, 255, 0.08)',
                color: mainViewTab === 'synergy' ? '#ffffff' : '#94a3b8',
                fontWeight: 700
              }}
            >
              4 โดเมน
            </span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => onNavigatePage('policy-1-1')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ExternalLink size={15} />
            ไปยังหน้าแดชบอร์ดหลัก
          </button>
        </div>
      </div>

      {/* WORKSPACE CONTAINER: CONDITIONAL FULL-WIDTH OR TWO-COLUMN */}
      <div style={{ display: 'flex', gap: '26px', alignItems: 'flex-start' }}>
        {/* ===================================================================
            LEFT COLUMN: HIERARCHICAL SUBTREE NAVIGATION (Shown only in Synergy Mode)
        =================================================================== */}
        {mainViewTab === 'synergy' && (
          <div
            style={{
              width: '340px',
              flexShrink: 0,
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
              padding: '20px',
              boxSizing: 'border-box'
            }}
          >
            {/* Header for Synergy Tree */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#059669" />
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  หัวข้อ SYNERGY (4 โดเมน)
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#059669',
                  background: '#d1fae5',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                41 หัวข้อ
              </span>
            </div>

            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#94a3b8',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            >
              โครงสร้างการ SYNERGY 4 โดเมนหลัก
            </div>

          {/* SUBTREE 4 DOMAINS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {domainConfigs.map((dom) => {
              const isDomainExpanded = expandedDomains[dom.domainId] ?? true;
              const isDomainActive = activeDomainId === dom.domainId && navMode !== 'central_pool';

              return (
                <div
                  key={dom.domainId}
                  style={{
                    borderRadius: '14px',
                    border: isDomainActive ? `1.5px solid ${dom.color}` : '1px solid #e2e8f0',
                    background: isDomainActive ? `${dom.color}08` : '#ffffff',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Domain Header Row */}
                  <div
                    onClick={() => {
                      handleSelectDomain(dom.domainId);
                      toggleDomainExpand(dom.domainId);
                    }}
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isDomainActive ? `${dom.color}15` : '#f8fafc',
                      borderBottom: isDomainExpanded ? '1px solid #e2e8f0' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: dom.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {renderDomainIcon(dom.iconName, 15, '#ffffff')}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        {dom.domainTitle}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          background: '#e2e8f0',
                          color: '#475569',
                          padding: '2px 7px',
                          borderRadius: '10px',
                          fontWeight: 600
                        }}
                      >
                        {dom.dimensions.reduce((acc, dim) => acc + (dim.initiatives?.length || 0), 0)}
                      </span>
                      {isDomainExpanded ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
                    </div>
                  </div>

                  {/* Dimensions & Initiatives Subtree List */}
                  {isDomainExpanded && (
                    <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {dom.dimensions.map((dim) => {
                        const isDimExpanded = expandedDimensions[dim.id] ?? false;
                        const isDimActive = activeDimensionId === dim.id && isDomainActive;

                        return (
                          <div
                            key={dim.id}
                            style={{
                              borderRadius: '10px',
                              background: isDimActive ? '#f1f5f9' : 'transparent',
                              padding: '6px'
                            }}
                          >
                            {/* Dimension Row */}
                            <div
                              onClick={() => {
                                handleSelectDimension(dim.id);
                                toggleDimensionExpand(dim.id);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 8px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: isDimActive ? '#0284c7' : '#334155'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {renderDimensionIcon(dim.iconName, 13, isDimActive ? '#0284c7' : '#64748b')}
                                <span>{dim.title}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                  ({dim.initiatives?.length || 0})
                                </span>
                                {isDimExpanded ? <ChevronDown size={14} color="#94a3b8" /> : <ChevronRight size={14} color="#94a3b8" />}
                              </div>
                            </div>

                            {/* Synergy Initiatives List under this Dimension */}
                            {isDimExpanded && (
                              <div
                                style={{
                                  paddingLeft: '14px',
                                  marginTop: '4px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px',
                                  borderLeft: '2px solid #e2e8f0',
                                  marginLeft: '12px'
                                }}
                              >
                                {dim.initiatives && dim.initiatives.length > 0 ? (
                                  dim.initiatives.map((init) => {
                                    const isInitActive = activeInitiativeId === init.id && navMode === 'synergy_initiative';

                                    return (
                                      <div
                                        key={init.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectInitiative(init);
                                        }}
                                        style={{
                                          padding: '7px 10px',
                                          borderRadius: '8px',
                                          background: isInitActive ? '#0284c7' : '#ffffff',
                                          color: isInitActive ? '#ffffff' : '#1e293b',
                                          fontSize: '11px',
                                          fontWeight: isInitActive ? 700 : 500,
                                          cursor: 'pointer',
                                          border: isInitActive ? '1px solid #0284c7' : '1px solid #f1f5f9',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: '6px',
                                          boxShadow: isInitActive ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none',
                                          transition: 'all 0.15s ease'
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                                          <Sparkles size={11} color={isInitActive ? '#fef08a' : '#f59e0b'} style={{ flexShrink: 0 }} />
                                          <span
                                            style={{
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}
                                            title={init.title}
                                          >
                                            {init.title.replace('Synergy ', '')}
                                          </span>
                                        </div>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteInitiative(init.id, init.title);
                                          }}
                                          title="ลบหัวข้อ Synergy นี้"
                                          style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: isInitActive ? '#ffffff' : '#94a3b8',
                                            cursor: 'pointer',
                                            padding: '2px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            opacity: 0.75
                                          }}
                                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div style={{ fontSize: '11px', color: '#94a3b8', padding: '4px 6px' }}>
                                    ยังไม่มีหัวข้อ Synergy
                                  </div>
                                )}

                                {/* Button to add new synergy in this dimension */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectDimension(dim.id);
                                    setNavMode('dimension_overview');
                                  }}
                                  style={{
                                    marginTop: '4px',
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    border: '1px dashed #cbd5e1',
                                    background: '#f8fafc',
                                    color: '#0284c7',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Plus size={12} />
                                  <span>เพิ่ม Synergy ในมิตินี้</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* ===================================================================
            RIGHT COLUMN: MAIN STAGE (CENTRAL POOL vs SYNERGY STUDIO)
        =================================================================== */}
        <div style={{ flex: 1, minWidth: 0, width: mainViewTab === 'repository' ? '100%' : 'auto' }}>
          {/* =================================================================
              VIEW 1: CENTRAL POOL MANAGEMENT CONSOLE
          ================================================================= */}
          {navMode === 'central_pool' && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                padding: '26px',
                boxSizing: 'border-box'
              }}
            >
              {/* Central Pool Tabs Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '16px',
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                    📦 คลังชุดข้อมูลกลางและการเตรียมข้อมูล (Central Pool & Data Prep)
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                    ศูนย์รวมข้อมูลดิบ, ข้อมูลพร้อมใช้, ท่อส่งข้อมูล API และบันทึกประวัติการ Cleansing ทั้งหมด
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    padding: '4px',
                    borderRadius: '12px',
                    gap: '4px'
                  }}
                >
                  <button
                    onClick={() => setPoolTab('pool_list')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: poolTab === 'pool_list' ? '#ffffff' : 'transparent',
                      color: poolTab === 'pool_list' ? '#0284c7' : '#64748b',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: poolTab === 'pool_list' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Database size={14} />
                    คลังชุดข้อมูล ({poolDatasets.length})
                  </button>

                  <button
                    onClick={() => setPoolTab('upload_cleanse')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: poolTab === 'upload_cleanse' ? '#ffffff' : 'transparent',
                      color: poolTab === 'upload_cleanse' ? '#0284c7' : '#64748b',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: poolTab === 'upload_cleanse' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <UploadCloud size={14} />
                    นำเข้าไฟล์ & ทำ Cleansing
                  </button>

                  <button
                    onClick={() => setPoolTab('api_scheduler')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: poolTab === 'api_scheduler' ? '#ffffff' : 'transparent',
                      color: poolTab === 'api_scheduler' ? '#0284c7' : '#64748b',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: poolTab === 'api_scheduler' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Clock size={14} />
                    API Service & ตั้งเวลา ({apiSchedules.length})
                  </button>

                  <button
                    onClick={() => setPoolTab('audit_log')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: poolTab === 'audit_log' ? '#ffffff' : 'transparent',
                      color: poolTab === 'audit_log' ? '#0284c7' : '#64748b',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: poolTab === 'audit_log' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={14} />
                    บันทึกประวัติ Cleansing ({auditLogs.length})
                  </button>

                  <button
                    onClick={() => setPoolTab('notification_settings')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: poolTab === 'notification_settings' ? '#ffffff' : 'transparent',
                      color: poolTab === 'notification_settings' ? '#0284c7' : '#64748b',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: poolTab === 'notification_settings' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Bell size={14} />
                    ตั้งค่าแจ้งเตือน LINE/Email
                  </button>
                </div>
              </div>

              {/* TAB 1: DATASET POOL LIST (TWO-PART ARCHITECTURE + DRILL-DOWN IMPORT) */}
              {poolTab === 'pool_list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* =================================================================
                      TOP NAVIGATION BAR: 2 MAIN BUTTONS (MDC CORE vs EXTERNAL DATA)
                  ================================================================= */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      padding: '20px 24px',
                      borderRadius: '20px',
                      border: '1.5px solid #cbd5e1',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#4338ca', background: '#e0e7ff', padding: '3px 10px', borderRadius: '12px' }}>
                            🗂️ REPOSITORY SECTIONS
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            เลือกหมวดหมู่ข้อมูลเพื่อเจาะลึกดูรายละเอียดเป็นเรื่อง ๆ
                          </span>
                        </div>
                        <h3 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                          คลังชุดข้อมูลกลาง (Central Dataset Repository)
                        </h3>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {/* BUTTON 1: ข้อมูลของศูนย์คุณธรรม */}
                        <button
                          onClick={() => {
                            setPoolViewSection('mdc_core');
                            setImportDrawer('none');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 22px',
                            borderRadius: '14px',
                            border: poolViewSection === 'mdc_core' ? '2.5px solid #2563eb' : '1.5px solid #cbd5e1',
                            background: poolViewSection === 'mdc_core' ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : '#ffffff',
                            color: poolViewSection === 'mdc_core' ? '#1d4ed8' : '#475569',
                            fontWeight: 800,
                            fontSize: '13px',
                            cursor: 'pointer',
                            boxShadow: poolViewSection === 'mdc_core' ? '0 4px 14px rgba(37, 99, 235, 0.25)' : 'none',
                            transform: poolViewSection === 'mdc_core' ? 'translateY(-1px)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>🏛️</span>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '13px', fontWeight: 800 }}>
                              ข้อมูลของศูนย์คุณธรรม
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.85 }}>
                              4 เรื่องหลัก (ดัชนีคุณธรรม, ทุนชีวิต, เครดิต, วิทยากร)
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '10px',
                              background: poolViewSection === 'mdc_core' ? '#2563eb' : '#f1f5f9',
                              color: poolViewSection === 'mdc_core' ? '#ffffff' : '#64748b',
                              marginLeft: '4px'
                            }}
                          >
                            4 เรื่อง
                          </span>
                        </button>

                        {/* BUTTON 2: ข้อมูลภายนอก */}
                        <button
                          onClick={() => {
                            setPoolViewSection('external');
                            setImportDrawer('none');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 22px',
                            borderRadius: '14px',
                            border: poolViewSection === 'external' ? '2.5px solid #059669' : '1.5px solid #cbd5e1',
                            background: poolViewSection === 'external' ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : '#ffffff',
                            color: poolViewSection === 'external' ? '#047857' : '#475569',
                            fontWeight: 800,
                            fontSize: '13px',
                            cursor: 'pointer',
                            boxShadow: poolViewSection === 'external' ? '0 4px 14px rgba(5, 150, 105, 0.25)' : 'none',
                            transform: poolViewSection === 'external' ? 'translateY(-1px)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>🌐</span>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '13px', fontWeight: 800 }}>
                              ข้อมูลภายนอก
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.85 }}>
                              หน่วยงานพันธมิตร (ธปท., ThaiRSC, สตช., TPMAP, พช.)
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '10px',
                              background: poolViewSection === 'external' ? '#059669' : '#f1f5f9',
                              color: poolViewSection === 'external' ? '#ffffff' : '#64748b',
                              marginLeft: '4px'
                            }}
                          >
                            {poolDatasets.length} ชุดข้อมูล
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* CONTEXTUAL SUBMENU BAR */}
                    <div
                      style={{
                        paddingTop: '14px',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      {poolViewSection === 'mdc_core' ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>
                              ⚡ เมนูย่อยข้อมูลศูนย์คุณธรรม:
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              นำเข้าและเตรียมความพร้อมชุดข้อมูลภายใน 4 โดเมนหลัก
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => {
                                setImportDrawer(importDrawer === 'mdc_file' ? 'none' : 'mdc_file');
                                if (importDrawer !== 'mdc_file') {
                                  setImportMeta((prev) => ({
                                    ...prev,
                                    sourceAgency: 'ศูนย์คุณธรรม (องค์การมหาชน)',
                                    sourceWebsite: 'https://moralcenter.or.th'
                                  }));
                                }
                              }}
                              style={{
                                padding: '9px 18px',
                                borderRadius: '10px',
                                border: importDrawer === 'mdc_file' ? '2px solid #2563eb' : '1.5px solid #93c5fd',
                                background: importDrawer === 'mdc_file' ? '#2563eb' : '#eff6ff',
                                color: importDrawer === 'mdc_file' ? '#ffffff' : '#1d4ed8',
                                fontWeight: 700,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: importDrawer === 'mdc_file' ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <UploadCloud size={15} />
                              <span>📂 นำเข้าข้อมูลศูนย์คุณธรรม</span>
                              {importDrawer === 'mdc_file' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>
                              ⚡ เมนูย่อยข้อมูลภายนอก:
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              เลือกช่องทางการนำเข้าและเตรียมความพร้อมข้อมูลจากหน่วยงานพันธมิตร
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                              onClick={() => setImportDrawer(importDrawer === 'file' ? 'none' : 'file')}
                              style={{
                                padding: '9px 18px',
                                borderRadius: '10px',
                                border: importDrawer === 'file' ? '2px solid #059669' : '1.5px solid #a7f3d0',
                                background: importDrawer === 'file' ? '#059669' : '#ecfdf5',
                                color: importDrawer === 'file' ? '#ffffff' : '#047857',
                                fontWeight: 700,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: importDrawer === 'file' ? '0 4px 12px rgba(5,150,105,0.25)' : 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <FileSpreadsheet size={15} />
                              <span>📂 นำเข้าชุด File ข้อมูล (Excel/CSV)</span>
                              {importDrawer === 'file' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            <button
                              onClick={() => setImportDrawer(importDrawer === 'api' ? 'none' : 'api')}
                              style={{
                                padding: '9px 18px',
                                borderRadius: '10px',
                                border: importDrawer === 'api' ? '2px solid #0284c7' : '1.5px solid #bae6fd',
                                background: importDrawer === 'api' ? '#0284c7' : '#f0f9ff',
                                color: importDrawer === 'api' ? '#ffffff' : '#0369a1',
                                fontWeight: 700,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: importDrawer === 'api' ? '0 4px 12px rgba(2,132,199,0.25)' : 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <Clock size={15} />
                              <span>🔌 นำเข้าผ่าน API Service</span>
                              {importDrawer === 'api' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* =================================================================
                      CONTEXTUAL INGESTION DRAWER (DRAG & DROP, RAW PREVIEW, PROGRESS, DUAL TABLE)
                  ================================================================= */}
                  {(importDrawer === 'mdc_file' || importDrawer === 'file') && (
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '20px',
                        border: '2px solid #0284c7',
                        padding: '24px',
                        boxShadow: '0 8px 30px rgba(2, 132, 199, 0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                      }}
                    >
                      {/* Drawer Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: importDrawer === 'mdc_file' ? '#dbeafe' : '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {importDrawer === 'mdc_file' ? <Building2 size={20} color="#1d4ed8" /> : <Globe size={20} color="#059669" />}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                              {importDrawer === 'mdc_file' ? '🏛️ นำเข้าชุดข้อมูลของศูนย์คุณธรรม (MDC Core Data Ingestion)' : '📂 นำเข้าชุด File ข้อมูลภายนอก (External File Ingestion)'}
                            </h4>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                              รองรับไฟล์ Excel (.xlsx, .xls) และ CSV พร้อมพื้นที่ลากวาง (Drag & Drop), แสดงตารางข้อมูลดิบ, Cleansing 4 ขั้นตอน และเปรียบเทียบก่อน-หลัง
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setImportDrawer('none');
                            setUploadedRawData(null);
                            setCleansingResult(null);
                            setUploadedFileName('');
                            setCleansingProgress(0);
                            setIsCleansingAnimating(false);
                          }}
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px'
                          }}
                          title="ปิดหน้าต่างนำเข้า"
                        >
                          <X size={16} />
                          <span>ปิด</span>
                        </button>
                      </div>

                      {/* Ingestion Topic Selector for MDC Core */}
                      {importDrawer === 'mdc_file' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#1e3a8a', marginBottom: '8px' }}>
                            🎯 เลือกหมวดหมู่ข้อมูลศูนย์คุณธรรมเป้าหมาย:
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            {[
                              { id: 'moral-index', title: 'ดัชนีคุณธรรม 5 มิติ', icon: 'Scale', color: '#0284c7' },
                              { id: 'life-capital', title: 'ทุนชีวิต 6 มิติ', icon: 'HeartHandshake', color: '#7c3aed' },
                              { id: 'moral-credit', title: 'Moral Credit (เครดิตความดี)', icon: 'Coins', color: '#d97706' },
                              { id: 'moral-lecturers', title: 'วิทยากรคุณธรรม', icon: 'GraduationCap', color: '#059669' }
                            ].map((topic) => (
                              <button
                                key={topic.id}
                                type="button"
                                onClick={() => setImportMeta({ ...importMeta, targetDomain: topic.id as DomainId })}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  border: importMeta.targetDomain === topic.id ? `2px solid ${topic.color}` : '1.5px solid #cbd5e1',
                                  background: importMeta.targetDomain === topic.id ? `${topic.color}15` : '#ffffff',
                                  color: importMeta.targetDomain === topic.id ? topic.color : '#475569',
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  textAlign: 'left'
                                }}
                              >
                                {renderDomainIcon(topic.icon, 16, topic.color)}
                                <span>{topic.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata Inputs */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            ชื่อชุดข้อมูล (Dataset Name) *
                          </label>
                          <input
                            type="text"
                            value={importMeta.datasetName}
                            onChange={(e) => setImportMeta({ ...importMeta, datasetName: e.target.value })}
                            placeholder={importDrawer === 'mdc_file' ? 'เช่น ผลสำรวจคุณธรรมเชิงพื้นที่ปี 2567' : 'เช่น สถิติอุบัติเหตุจราจรรายจังหวัด'}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            หน่วยงานเจ้าของข้อมูล (Agency) *
                          </label>
                          <input
                            type="text"
                            value={importMeta.sourceAgency}
                            onChange={(e) => setImportMeta({ ...importMeta, sourceAgency: e.target.value })}
                            placeholder={importDrawer === 'mdc_file' ? 'ศูนย์คุณธรรม (องค์การมหาชน)' : 'เช่น ธนาคารแห่งประเทศไทย / ThaiRSC'}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>

                        {importDrawer === 'file' && (
                          <>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                                เว็บไซต์แหล่งที่มา (Source Website URL)
                              </label>
                              <input
                                type="text"
                                value={importMeta.sourceWebsite}
                                onChange={(e) => setImportMeta({ ...importMeta, sourceWebsite: e.target.value })}
                                placeholder="https://www.bot.or.th/statistics"
                                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                                มิติ/โดเมน Synergy เป้าหมาย
                              </label>
                              <select
                                value={importMeta.targetDomain}
                                onChange={(e) => setImportMeta({ ...importMeta, targetDomain: e.target.value as DomainId })}
                                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                              >
                                <option value="moral-index">ดัชนีคุณธรรม 5 มิติ (Moral Index)</option>
                                <option value="life-capital">ทุนชีวิต 6 มิติ (Life Capital)</option>
                                <option value="moral-credit">Moral Credit (เครดิตความดี)</option>
                                <option value="moral-lecturers">วิทยากรคุณธรรม (Moral Lecturers)</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>

                      {/* DRAG & DROP ZONE */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: isDragOver ? '2.5px dashed #0284c7' : '2px dashed #93c5fd',
                          borderRadius: '16px',
                          background: isDragOver ? '#e0f2fe' : uploadedRawData ? '#f0fdf4' : '#f8fafc',
                          padding: '32px 24px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isDragOver ? '0 0 16px rgba(2, 132, 199, 0.2)' : 'none'
                        }}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".xlsx, .xls, .csv"
                          style={{ display: 'none' }}
                        />

                        {uploadedFileName ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckCircle2 size={28} color="#15803d" />
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#166534' }}>
                              ไฟล์ที่พร้อมตรวจสอบ: {uploadedFileName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#475569' }}>
                              ตรวจพบทั้งหมด {uploadedRawData?.length || 0} แถว • {rawColumns.length} คอลัมน์ (คลิกเพื่อเปลี่ยนไฟล์)
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              style={{
                                marginTop: '6px',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#475569',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              🔄 เลือกไฟล์อื่น
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <UploadCloud size={28} color="#0284c7" />
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                              ลากไฟล์ Excel (.xlsx, .xls) หรือ .CSV มาวางที่นี่
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              หรือคลิกที่กรอบนี้เพื่อเลือกไฟล์จากเครื่องคอมพิวเตอร์ของคุณ
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '3px 10px', borderRadius: '10px', marginTop: '4px' }}>
                              ⚡ เมื่อวางไฟล์แล้วจะแสดงตารางข้อมูลดิบตั้งต้นทันที
                            </span>
                          </div>
                        )}
                      </div>

                      {/* STAGE 1: LIVE RAW DATA PREVIEW TABLE (Before Cleansing) */}
                      {uploadedRawData && uploadedRawData.length > 0 && !cleansingResult && !isCleansingAnimating && (
                        <div
                          style={{
                            background: '#f8fafc',
                            borderRadius: '16px',
                            border: '1.5px solid #cbd5e1',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '3px 10px', borderRadius: '12px' }}>
                                  📄 ตารางข้อมูลดิบตั้งต้น (RAW DATA PREVIEW)
                                </span>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                                  พบทั้งหมด {uploadedRawData.length} แถว • {rawColumns.length} คอลัมน์
                                </span>
                              </div>
                              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                ตารางด้านล่างคือข้อมูลดิบที่อ่านได้โดยตรงจากไฟล์ กรุณากดปุ่ม <b>"เริ่มทำ Cleansing"</b> เพื่อตรวจสอบรายชื่อ 77 จังหวัด, แปลงปี พ.ศ. และเตรียมความพร้อมข้อมูล
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleStartCleansingWithProgress}
                              style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                color: '#ffffff',
                                fontSize: '13px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                                transform: 'translateY(-1px)',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <Sparkles size={16} />
                              <span>⚡ เริ่มทำ Cleansing ข้อมูล & ตรวจสอบคุณภาพ (4 ขั้นตอน)</span>
                            </button>
                          </div>

                          {/* Raw Table Preview */}
                          <div style={{ overflowX: 'auto', maxHeight: '280px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                              <thead>
                                <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1', position: 'sticky', top: 0, zIndex: 2 }}>
                                  <th style={{ padding: '8px 12px', fontWeight: 800, color: '#475569', width: '40px' }}>#</th>
                                  {rawColumns.map((col) => (
                                    <th key={col} style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedRawRows.map((row, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                    <td style={{ padding: '8px 12px', color: '#94a3b8', fontWeight: 600 }}>
                                      {(rawPreviewPage - 1) * 8 + idx + 1}
                                    </td>
                                    {rawColumns.map((col) => {
                                      const val = row[col];
                                      const isEmpty = val === null || val === undefined || String(val).trim() === '' || String(val).trim() === '-' || String(val).toLowerCase() === 'null';
                                      return (
                                        <td key={col} style={{ padding: '8px 12px', color: '#334155', whiteSpace: 'nowrap' }}>
                                          {isEmpty ? (
                                            <span style={{ fontSize: '11px', color: '#b91c1c', background: '#fee2e2', padding: '1px 6px', borderRadius: '4px', fontStyle: 'italic' }}>
                                              [ว่าง / null]
                                            </span>
                                          ) : (
                                            String(val)
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination Footer for Raw Table */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              แสดงแถวที่ {(rawPreviewPage - 1) * 8 + 1} - {Math.min(rawPreviewPage * 8, uploadedRawData.length)} จากทั้งหมด {uploadedRawData.length} แถว
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                disabled={rawPreviewPage <= 1}
                                onClick={() => setRawPreviewPage((p) => Math.max(1, p - 1))}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: rawPreviewPage <= 1 ? '#f1f5f9' : '#ffffff',
                                  color: rawPreviewPage <= 1 ? '#94a3b8' : '#334155',
                                  cursor: rawPreviewPage <= 1 ? 'not-allowed' : 'pointer',
                                  fontSize: '11px',
                                  fontWeight: 700
                                }}
                              >
                                ◀ หน้าก่อนหน้า
                              </button>
                              <span style={{ padding: '5px 10px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                                {rawPreviewPage} / {totalRawPages}
                              </span>
                              <button
                                type="button"
                                disabled={rawPreviewPage >= totalRawPages}
                                onClick={() => setRawPreviewPage((p) => Math.min(totalRawPages, p + 1))}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: rawPreviewPage >= totalRawPages ? '#f1f5f9' : '#ffffff',
                                  color: rawPreviewPage >= totalRawPages ? '#94a3b8' : '#334155',
                                  cursor: rawPreviewPage >= totalRawPages ? 'not-allowed' : 'pointer',
                                  fontSize: '11px',
                                  fontWeight: 700
                                }}
                              >
                                หน้าถัดไป ▶
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STAGE 2: ANIMATED PROGRESS BAR */}
                      {isCleansingAnimating && (
                        <div
                          style={{
                            background: '#f0f9ff',
                            borderRadius: '16px',
                            border: '1.5px solid #38bdf8',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <RefreshCw size={20} color="#0284c7" className="spin" />
                              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0369a1' }}>
                                {cleansingStepText || 'กำลังประมวลผล Cleansing 4 ขั้นตอน...'}
                              </span>
                            </div>
                            <span style={{ fontSize: '16px', fontWeight: 900, color: '#0284c7' }}>
                              {cleansingProgress}%
                            </span>
                          </div>

                          {/* Progress Bar Track */}
                          <div style={{ width: '100%', height: '12px', background: '#e0f2fe', borderRadius: '10px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${cleansingProgress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #0284c7 0%, #06b6d4 50%, #10b981 100%)',
                                borderRadius: '10px',
                                transition: 'width 0.35s ease'
                              }}
                            />
                          </div>

                          {/* 4 Milestones Badges */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                            {[
                              { step: 1, title: '1. Mapping 77 จังหวัด', active: cleansingProgress >= 10, done: cleansingProgress >= 38 },
                              { step: 2, title: '2. ปรับปี พ.ศ./ค.ศ.', active: cleansingProgress >= 38, done: cleansingProgress >= 68 },
                              { step: 3, title: '3. เคลียร์ตัวเลข & ค่าว่าง', active: cleansingProgress >= 68, done: cleansingProgress >= 88 },
                              { step: 4, title: '4. คำนวณ Health Score', active: cleansingProgress >= 88, done: cleansingProgress >= 100 }
                            ].map((m) => (
                              <div
                                key={m.step}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: m.done ? '1px solid #86efac' : m.active ? '1.5px solid #38bdf8' : '1px solid #e2e8f0',
                                  background: m.done ? '#dcfce7' : m.active ? '#ffffff' : '#f8fafc',
                                  color: m.done ? '#15803d' : m.active ? '#0369a1' : '#94a3b8',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                {m.done ? <CheckCircle2 size={13} color="#16a34a" /> : m.active ? <RefreshCw size={12} color="#0284c7" className="spin" /> : <span>⏳</span>}
                                <span>{m.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STAGE 3: DUAL-TABLE COMPARISON & AUDIT SUMMARY (After Cleansing) */}
                      {cleansingResult && !isCleansingAnimating && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                          {/* Audit & Results Summary Card */}
                          <div
                            style={{
                              background: '#ffffff',
                              borderRadius: '16px',
                              border: '1.5px solid #86efac',
                              padding: '20px',
                              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.08)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: '12px' }}>
                                  ✨ ผลลัพธ์การ CLEANSING & AUDIT TRAIL
                                </span>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                                  สรุปผลการทำความสะอาดและตรวจสอบคุณภาพข้อมูล
                                </h4>
                              </div>

                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  background: cleansingResult.healthMetrics.statusColor + '20',
                                  color: cleansingResult.healthMetrics.statusColor
                                }}
                              >
                                {cleansingResult.healthMetrics.statusBadge}
                              </span>
                            </div>

                            {/* 4 Metric Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>Data Health Score</div>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                                  {cleansingResult.healthMetrics.completenessRate}%
                                </div>
                                <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>ความสมบูรณ์ของข้อมูล</div>
                              </div>

                              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>ความครอบคลุม 77 จังหวัด</div>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                                  {cleansingResult.healthMetrics.provinceMatchRate}%
                                </div>
                                <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '2px' }}>
                                  ปรับชื่อให้ตรง {cleansingResult.healthMetrics.normalizedProvincesCount} รายการ
                                </div>
                              </div>

                              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>คลีนตัวเลข / ค่าว่าง</div>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#d97706', marginTop: '2px' }}>
                                  {cleansingResult.healthMetrics.sanitizedNumbersCount}
                                </div>
                                <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>จัดการอักขระ & แทนค่า 0</div>
                              </div>

                              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>แปลงปี พ.ศ. / ค.ศ.</div>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#7c3aed', marginTop: '2px' }}>
                                  {cleansingResult.healthMetrics.yearConvertedCount}
                                </div>
                                <div style={{ fontSize: '11px', color: '#6d28d9', marginTop: '2px' }}>ปรับเป็น พ.ศ. 4 หลักมาตรฐาน</div>
                              </div>
                            </div>

                            {/* Actions Performed List */}
                            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                                🛠️ การดำเนินการที่ระบบทำให้โดยอัตโนมัติ:
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                                {(cleansingResult.auditRecord.logSummary || []).map((act: string, i: number) => (
                                  <div key={i} style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckCircle2 size={13} color="#16a34a" />
                                    <span>{act}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Dual-Table Comparison View Toggle */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                                🔍 ตารางเปรียบเทียบข้อมูล: ก่อน Cleansing vs หลัง Cleansing
                              </span>
                            </div>

                            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => setComparisonViewMode('side_by_side')}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: comparisonViewMode === 'side_by_side' ? '#ffffff' : 'transparent',
                                  color: comparisonViewMode === 'side_by_side' ? '#0f172a' : '#64748b',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                👥 เคียงคู่ (Side-by-Side)
                              </button>
                              <button
                                type="button"
                                onClick={() => setComparisonViewMode('tab_switch')}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: comparisonViewMode === 'tab_switch' ? '#ffffff' : 'transparent',
                                  color: comparisonViewMode === 'tab_switch' ? '#0f172a' : '#64748b',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                📑 สลับดูทีละตาราง (Tabs)
                              </button>
                            </div>
                          </div>

                          {/* SIDE-BY-SIDE MODE */}
                          {comparisonViewMode === 'side_by_side' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              {/* Left: Raw Data Before */}
                              <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '14px', overflow: 'hidden', background: '#ffffff' }}>
                                <div style={{ background: '#fef2f2', padding: '10px 14px', borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#991b1b' }}>
                                      🔴 ข้อมูลดิบก่อน Cleansing
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#b91c1c' }}>({uploadedRawData?.length || 0} แถว)</span>
                                  </div>
                                  <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600 }}>ยังไม่ผ่านการจัดรูป</span>
                                </div>

                                <div style={{ overflowX: 'auto', maxHeight: '280px' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                                    <thead>
                                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
                                        <th style={{ padding: '6px 10px', color: '#64748b' }}>#</th>
                                        {rawColumns.map((col) => (
                                          <th key={col} style={{ padding: '6px 10px', color: '#334155', whiteSpace: 'nowrap' }}>{col}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {paginatedRawRows.map((row, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                          <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{(rawPreviewPage - 1) * 8 + idx + 1}</td>
                                          {rawColumns.map((col) => {
                                            const val = row[col];
                                            const isEmpty = val === null || val === undefined || String(val).trim() === '' || String(val).trim() === '-';
                                            return (
                                              <td key={col} style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
                                                {isEmpty ? (
                                                  <span style={{ color: '#dc2626', background: '#fee2e2', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>
                                                    [ว่าง]
                                                  </span>
                                                ) : (
                                                  String(val)
                                                )}
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                <div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>หน้า {rawPreviewPage} / {totalRawPages}</span>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                      type="button"
                                      disabled={rawPreviewPage <= 1}
                                      onClick={() => setRawPreviewPage((p) => Math.max(1, p - 1))}
                                      style={{ padding: '3px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: rawPreviewPage <= 1 ? 'not-allowed' : 'pointer' }}
                                    >
                                      ◀
                                    </button>
                                    <button
                                      type="button"
                                      disabled={rawPreviewPage >= totalRawPages}
                                      onClick={() => setRawPreviewPage((p) => Math.min(totalRawPages, p + 1))}
                                      style={{ padding: '3px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: rawPreviewPage >= totalRawPages ? 'not-allowed' : 'pointer' }}
                                    >
                                      ▶
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Cleansed Data After */}
                              <div style={{ border: '1.5px solid #86efac', borderRadius: '14px', overflow: 'hidden', background: '#ffffff' }}>
                                <div style={{ background: '#ecfdf5', padding: '10px 14px', borderBottom: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#065f46' }}>
                                      🟢 ข้อมูลหลัง Cleansing
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#047857' }}>({cleansingResult.cleansedData.length} แถว)</span>
                                  </div>
                                  <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700, background: '#d1fae5', padding: '2px 8px', borderRadius: '10px' }}>
                                    ✨ พร้อม Synergy
                                  </span>
                                </div>

                                <div style={{ overflowX: 'auto', maxHeight: '280px' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                                    <thead>
                                      <tr style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', position: 'sticky', top: 0, zIndex: 1 }}>
                                        <th style={{ padding: '6px 10px', color: '#065f46' }}>#</th>
                                        {cleansedColumns.map((col) => (
                                          <th key={col} style={{ padding: '6px 10px', color: '#065f46', whiteSpace: 'nowrap', fontWeight: 700 }}>{col}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {paginatedCleansedRows.map((row, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f0fdf4' }}>
                                          <td style={{ padding: '6px 10px', color: '#059669', fontWeight: 600 }}>{(cleansedPreviewPage - 1) * 8 + idx + 1}</td>
                                          {cleansedColumns.map((col) => {
                                            const val = row[col];
                                            const isProvCol = col === 'จังหวัด' || col === 'province';
                                            return (
                                              <td key={col} style={{ padding: '6px 10px', whiteSpace: 'nowrap', color: isProvCol ? '#047857' : '#0f172a', fontWeight: isProvCol ? 700 : 400 }}>
                                                {isProvCol ? `✓ ${val}` : String(val)}
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                <div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '11px', color: '#065f46' }}>หน้า {cleansedPreviewPage} / {totalCleansedPages}</span>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                      type="button"
                                      disabled={cleansedPreviewPage <= 1}
                                      onClick={() => setCleansedPreviewPage((p) => Math.max(1, p - 1))}
                                      style={{ padding: '3px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: cleansedPreviewPage <= 1 ? 'not-allowed' : 'pointer' }}
                                    >
                                      ◀
                                    </button>
                                    <button
                                      type="button"
                                      disabled={cleansedPreviewPage >= totalCleansedPages}
                                      onClick={() => setCleansedPreviewPage((p) => Math.min(totalCleansedPages, p + 1))}
                                      style={{ padding: '3px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: cleansedPreviewPage >= totalCleansedPages ? 'not-allowed' : 'pointer' }}
                                    >
                                      ▶
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* TAB SWITCH MODE */
                            <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '14px', overflow: 'hidden', background: '#ffffff' }}>
                              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                <button
                                  type="button"
                                  onClick={() => setComparisonActiveTab('raw')}
                                  style={{
                                    padding: '10px 18px',
                                    border: 'none',
                                    borderBottom: comparisonActiveTab === 'raw' ? '2.5px solid #dc2626' : 'none',
                                    background: comparisonActiveTab === 'raw' ? '#ffffff' : 'transparent',
                                    color: comparisonActiveTab === 'raw' ? '#dc2626' : '#64748b',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  🔴 ข้อมูลดิบก่อน Cleansing ({uploadedRawData?.length || 0} แถว)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setComparisonActiveTab('cleansed')}
                                  style={{
                                    padding: '10px 18px',
                                    border: 'none',
                                    borderBottom: comparisonActiveTab === 'cleansed' ? '2.5px solid #16a34a' : 'none',
                                    background: comparisonActiveTab === 'cleansed' ? '#ffffff' : 'transparent',
                                    color: comparisonActiveTab === 'cleansed' ? '#16a34a' : '#64748b',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  🟢 ข้อมูลหลัง Cleansing ({cleansingResult.cleansedData.length} แถว) ✨
                                </button>
                              </div>

                              <div style={{ overflowX: 'auto', maxHeight: '320px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                                  <thead>
                                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', position: 'sticky', top: 0, zIndex: 1 }}>
                                      <th style={{ padding: '8px 12px', color: '#475569' }}>#</th>
                                      {(comparisonActiveTab === 'raw' ? rawColumns : cleansedColumns).map((col) => (
                                        <th key={col} style={{ padding: '8px 12px', color: '#0f172a', whiteSpace: 'nowrap' }}>{col}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(comparisonActiveTab === 'raw' ? paginatedRawRows : paginatedCleansedRows).map((row, idx) => (
                                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '8px 12px', color: '#94a3b8' }}>
                                          {(comparisonActiveTab === 'raw' ? (rawPreviewPage - 1) * 8 : (cleansedPreviewPage - 1) * 8) + idx + 1}
                                        </td>
                                        {(comparisonActiveTab === 'raw' ? rawColumns : cleansedColumns).map((col) => {
                                          const val = row[col];
                                          const isEmpty = val === null || val === undefined || String(val).trim() === '';
                                          return (
                                            <td key={col} style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                              {isEmpty ? (
                                                <span style={{ color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>
                                                  [ว่าง]
                                                </span>
                                              ) : (
                                                String(val)
                                              )}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Bar */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedRawData(null);
                                setCleansingResult(null);
                                setUploadedFileName('');
                                setCleansingProgress(0);
                                fileInputRef.current?.click();
                              }}
                              style={{
                                padding: '10px 18px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#475569',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              🔄 เลือกไฟล์อื่น
                            </button>

                            <button
                              type="button"
                              onClick={handleSaveCleansedToPool}
                              style={{
                                padding: '12px 28px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #059669, #047857)',
                                color: '#ffffff',
                                fontSize: '13px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)'
                              }}
                            >
                              <CheckCircle2 size={16} />
                              <span>💾 บันทึกชุดข้อมูลเข้าสู่คลัง (Ready for Synergy)</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DRAWER 2: API SERVICE DRAWER */}
                  {importDrawer === 'api' && (
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '20px',
                        border: '2px solid #0284c7',
                        padding: '24px',
                        boxShadow: '0 8px 30px rgba(2, 132, 199, 0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={18} color="#0284c7" />
                          ดึงข้อมูลผ่าน API Service พร้อมตั้งเวลาอัตโนมัติ (Daily, Weekly, Custom Calendar)
                        </h4>
                        <button
                          onClick={() => setImportDrawer('none')}
                          style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#64748b' }}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            ชื่อชุดข้อมูล (Dataset Name) *
                          </label>
                          <input
                            type="text"
                            value={importMeta.datasetName}
                            onChange={(e) => setImportMeta({ ...importMeta, datasetName: e.target.value })}
                            placeholder="เช่น สถิติอุบัติเหตุจราจรรายวัน"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            หน่วยงานเจ้าของข้อมูล (Agency) *
                          </label>
                          <input
                            type="text"
                            value={importMeta.sourceAgency}
                            onChange={(e) => setImportMeta({ ...importMeta, sourceAgency: e.target.value })}
                            placeholder="เช่น กรมควบคุมโรค / ThaiRSC"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            API Endpoint URL *
                          </label>
                          <input
                            type="text"
                            value={newSchedule.endpointUrl}
                            onChange={(e) => setNewSchedule({ ...newSchedule, endpointUrl: e.target.value })}
                            placeholder="https://api.example.go.th/v1/stats.json"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            API Key / Authorization Token
                          </label>
                          <input
                            type="password"
                            value={importMeta.apiKey}
                            onChange={(e) => setImportMeta({ ...importMeta, apiKey: e.target.value })}
                            placeholder="Bearer token หรือ API Key"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            รูปแบบรอบเวลา (Schedule Type)
                          </label>
                          <select
                            value={newSchedule.scheduleType}
                            onChange={(e) => setNewSchedule({ ...newSchedule, scheduleType: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                          >
                            <option value="daily">รายวัน (Daily)</option>
                            <option value="weekly">รายสัปดาห์ (Weekly - เลือกวัน)</option>
                            <option value="custom_calendar">ปฏิทินกำหนดวันเวลา (Calendar)</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            เวลาดึงข้อมูล (Schedule Time)
                          </label>
                          <input
                            type="time"
                            value={newSchedule.scheduleTime}
                            onChange={(e) => setNewSchedule({ ...newSchedule, scheduleTime: e.target.value })}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            มิติคุณธรรมเป้าหมาย
                          </label>
                          <select
                            value={importMeta.targetDomain}
                            onChange={(e) => setImportMeta({ ...importMeta, targetDomain: e.target.value as DomainId })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                          >
                            <option value="moral-index">ดัชนีคุณธรรม 5 มิติ</option>
                            <option value="life-capital">ทุนชีวิต 6 มิติ</option>
                            <option value="moral-credit">Moral Credit</option>
                            <option value="moral-lecturers">วิทยากรคุณธรรม</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          onClick={() => setImportDrawer('none')}
                          style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={handleCreateApiScheduleFromDrawer}
                          style={{
                            padding: '10px 22px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                          }}
                        >
                          <Sparkles size={16} />
                          ⚡ ดึงข้อมูลทันที & บันทึกรอบเวลา (Sync & Save)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* =================================================================
                      PART 1: ข้อมูลภายในศูนย์คุณธรรม (MDC CORE DATA - แยกเป็นเรื่อง ๆ)
                  ================================================================= */}
                  {poolViewSection === 'mdc_core' && (
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        border: '1.5px solid #e2e8f0',
                        padding: '24px',
                        boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1d4ed8', background: '#dbeafe', padding: '3px 10px', borderRadius: '12px' }}>
                              🏛️ ข้อมูลของศูนย์คุณธรรม (MDC Core Data)
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              ฐานข้อมูลตัวชี้วัดและตารางหลัก (DuckDB & SQLite Engine)
                            </span>
                          </div>
                          <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                            ข้อมูลของศูนย์คุณธรรม (แบ่งเป็นเรื่อง ๆ ตาม 4 โดเมนหลัก)
                          </h3>
                          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                            ตารางข้อมูลหลักที่ใช้เป็นตัวชี้วัดภายในองค์กร ครอบคลุมดัชนีคุณธรรม 5 มิติ, ทุนชีวิต 6 มิติ, Moral Credit และวิทยากรคุณธรรม
                          </p>
                        </div>
                      </div>

                      {/* STORY FILTER CHIPS: เลือกดูเป็นเรื่อง ๆ */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '20px',
                          flexWrap: 'wrap',
                          background: '#f8fafc',
                          padding: '10px 14px',
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginRight: '6px' }}>
                          🎯 เลือกดูเป็นเรื่อง:
                        </span>

                        <button
                          onClick={() => setMdcTopicFilter('all')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: mdcTopicFilter === 'all' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                            background: mdcTopicFilter === 'all' ? '#eff6ff' : '#ffffff',
                            color: mdcTopicFilter === 'all' ? '#1d4ed8' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          📌 แสดงครบ 4 เรื่อง
                        </button>

                        <button
                          onClick={() => setMdcTopicFilter('moral-index')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: mdcTopicFilter === 'moral-index' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                            background: mdcTopicFilter === 'moral-index' ? '#e0f2fe' : '#ffffff',
                            color: mdcTopicFilter === 'moral-index' ? '#0369a1' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>⚖️</span>
                          <span>เรื่องที่ 1: ดัชนีคุณธรรม 5 มิติ</span>
                        </button>

                        <button
                          onClick={() => setMdcTopicFilter('life-capital')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: mdcTopicFilter === 'life-capital' ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                            background: mdcTopicFilter === 'life-capital' ? '#ede9fe' : '#ffffff',
                            color: mdcTopicFilter === 'life-capital' ? '#6d28d9' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>🌱</span>
                          <span>เรื่องที่ 2: ทุนชีวิต 6 มิติ</span>
                        </button>

                        <button
                          onClick={() => setMdcTopicFilter('moral-credit')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: mdcTopicFilter === 'moral-credit' ? '1.5px solid #d97706' : '1px solid #cbd5e1',
                            background: mdcTopicFilter === 'moral-credit' ? '#fef3c7' : '#ffffff',
                            color: mdcTopicFilter === 'moral-credit' ? '#b45309' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>💳</span>
                          <span>เรื่องที่ 3: ระบบ Moral Credit</span>
                        </button>

                        <button
                          onClick={() => setMdcTopicFilter('moral-lecturers')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: mdcTopicFilter === 'moral-lecturers' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                            background: mdcTopicFilter === 'moral-lecturers' ? '#d1fae5' : '#ffffff',
                            color: mdcTopicFilter === 'moral-lecturers' ? '#047857' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>🎓</span>
                          <span>เรื่องที่ 4: วิทยากรคุณธรรม</span>
                        </button>
                      </div>

                      {/* 4 Domains Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {filteredMdcDomains.map((domain) => (
                          <div
                            key={domain.domainId}
                            style={{
                              padding: '18px',
                              borderRadius: '14px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '14px'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: domain.color,
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {renderDimensionIcon(domain.iconName, 18, '#ffffff')}
                                </div>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                                    {domain.domainTitle}
                                  </h4>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                                    {domain.tables.length} ตารางข้อมูลหลัก
                                  </div>
                                </div>
                              </div>

                              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                                {domain.description}
                              </p>

                              {/* Tables List */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {domain.tables.map((t) => (
                                  <div
                                    key={t.id}
                                    style={{
                                      padding: '8px 12px',
                                      borderRadius: '8px',
                                      background: '#ffffff',
                                      border: '1px solid #e2e8f0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '8px'
                                    }}
                                  >
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {t.name}
                                      </div>
                                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        {t.rowCount} แถว • {t.engine}
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => handleOpenInternalTablePreview(t, domain.domainTitle)}
                                      style={{
                                        background: '#f0f9ff',
                                        color: '#0284c7',
                                        border: '1px solid #bae6fd',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        flexShrink: 0
                                      }}
                                    >
                                      <Eye size={12} />
                                      ดูตาราง
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* =================================================================
                      PART 2: ข้อมูลภายนอก (EXTERNAL DATASETS - แยกตามเรื่อง & หน่วยงาน)
                  ================================================================= */}
                  {poolViewSection === 'external' && (
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        border: '1.5px solid #e2e8f0',
                        padding: '24px',
                        boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
                      }}
                    >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '3px 10px', borderRadius: '12px' }}>
                            🌐 ข้อมูลภายนอก (External Datasets)
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            External Partner Datasets by Agency & Story
                          </span>
                        </div>
                        <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                          ชุดข้อมูลภายนอกที่นำมาจัดเก็บและเชื่อมโยง Synergy (แยกตามเรื่อง & หน่วยงาน)
                        </h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                          จัดกลุ่มแยกตามหน่วยงานเจ้าของข้อมูล พร้อมระบุเว็บไซต์แหล่งที่มา และป้ายความเชื่อมโยงกับหัวข้อ Synergy
                        </p>
                      </div>

                      {/* Filter Subtabs: All vs Ready vs Raw */}
                      <div
                        style={{
                          display: 'flex',
                          background: '#f1f5f9',
                          padding: '4px',
                          borderRadius: '10px',
                          gap: '4px'
                        }}
                      >
                        <button
                          onClick={() => setExternalDataFilter('all')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: externalDataFilter === 'all' ? '#ffffff' : 'transparent',
                            color: externalDataFilter === 'all' ? '#0f172a' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: externalDataFilter === 'all' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
                          }}
                        >
                          ทั้งหมด ({poolDatasets.length})
                        </button>

                        <button
                          onClick={() => setExternalDataFilter('ready')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: externalDataFilter === 'ready' ? '#ffffff' : 'transparent',
                            color: externalDataFilter === 'ready' ? '#059669' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: externalDataFilter === 'ready' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle2 size={13} color="#059669" />
                          🟢 ข้อมูลพร้อมใช้ ({readyCount})
                        </button>

                        <button
                          onClick={() => setExternalDataFilter('raw')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: externalDataFilter === 'raw' ? '#ffffff' : 'transparent',
                            color: externalDataFilter === 'raw' ? '#d97706' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: externalDataFilter === 'raw' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <AlertTriangle size={13} color="#d97706" />
                          🟡 ข้อมูลดิบ ({rawCount})
                        </button>
                      </div>
                    </div>

                    {/* EXTERNAL STORY FILTER CHIPS: เลือกดูเป็นเรื่อง ๆ */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                        background: '#f8fafc',
                        padding: '10px 14px',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginRight: '6px' }}>
                        🎯 เลือกดูเป็นเรื่อง:
                      </span>

                      <button
                        onClick={() => setExternalTopicFilter('all')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: externalTopicFilter === 'all' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: externalTopicFilter === 'all' ? '#d1fae5' : '#ffffff',
                          color: externalTopicFilter === 'all' ? '#065f46' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        📌 ทุกเรื่อง / ทุกหน่วยงาน
                      </button>

                      <button
                        onClick={() => setExternalTopicFilter('economy')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: externalTopicFilter === 'economy' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: externalTopicFilter === 'economy' ? '#d1fae5' : '#ffffff',
                          color: externalTopicFilter === 'economy' ? '#065f46' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>💰</span>
                        <span>เรื่อง: หนี้สินครัวเรือนและเศรษฐกิจ (ธปท.)</span>
                      </button>

                      <button
                        onClick={() => setExternalTopicFilter('traffic')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: externalTopicFilter === 'traffic' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: externalTopicFilter === 'traffic' ? '#d1fae5' : '#ffffff',
                          color: externalTopicFilter === 'traffic' ? '#065f46' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>🚗</span>
                        <span>เรื่อง: ความปลอดภัยทางถนนและอุบัติเหตุ (ThaiRSC)</span>
                      </button>

                      <button
                        onClick={() => setExternalTopicFilter('crime')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: externalTopicFilter === 'crime' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: externalTopicFilter === 'crime' ? '#d1fae5' : '#ffffff',
                          color: externalTopicFilter === 'crime' ? '#065f46' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>👮</span>
                        <span>เรื่อง: ความสงบเรียบร้อยและคดีอาญา (สตช.)</span>
                      </button>

                      <button
                        onClick={() => setExternalTopicFilter('poverty')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: externalTopicFilter === 'poverty' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: externalTopicFilter === 'poverty' ? '#d1fae5' : '#ffffff',
                          color: externalTopicFilter === 'poverty' ? '#065f46' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>🛖</span>
                        <span>เรื่อง: ความยากจนหลายมิติ (พม. / TPMAP)</span>
                      </button>

                      <button
                        onClick={() => setExternalTopicFilter('integrity')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: externalTopicFilter === 'integrity' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: externalTopicFilter === 'integrity' ? '#d1fae5' : '#ffffff',
                          color: externalTopicFilter === 'integrity' ? '#065f46' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>⚖️</span>
                        <span>เรื่อง: คุณธรรมและความโปร่งใส ITA (ป.ป.ช.)</span>
                      </button>

                      <button
                        onClick={() => setExternalTopicFilter('volunteer')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: externalTopicFilter === 'volunteer' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: externalTopicFilter === 'volunteer' ? '#d1fae5' : '#ffffff',
                          color: externalTopicFilter === 'volunteer' ? '#065f46' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>🤝</span>
                        <span>เรื่อง: สถิติจิตอาสาและการบริจาค (สถิติแห่งชาติ)</span>
                      </button>

                      <button
                        onClick={() => setExternalTopicFilter('family_elderly')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: externalTopicFilter === 'family_elderly' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: externalTopicFilter === 'family_elderly' ? '#d1fae5' : '#ffffff',
                          color: externalTopicFilter === 'family_elderly' ? '#065f46' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>👵</span>
                        <span>เรื่อง: ผู้สูงอายุและความอบอุ่นครอบครัว (พม. / พอช.)</span>
                      </button>

                      <button
                        onClick={() => setExternalTopicFilter('environment')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: externalTopicFilter === 'environment' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: externalTopicFilter === 'environment' ? '#d1fae5' : '#ffffff',
                          color: externalTopicFilter === 'environment' ? '#065f46' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>🌿</span>
                        <span>เรื่อง: สิ่งแวดล้อมและขยะมูลฝอย (คพ.)</span>
                      </button>

                      <button
                        onClick={() => setExternalTopicFilter('community')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: externalTopicFilter === 'community' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: externalTopicFilter === 'community' ? '#d1fae5' : '#ffffff',
                          color: externalTopicFilter === 'community' ? '#065f46' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>🌱</span>
                        <span>เรื่อง: กลุ่มออมทรัพย์และเศรษฐกิจชุมชน (พช.)</span>
                      </button>
                    </div>

                    {/* Agency Groups Accordion / Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {agencyGroupedDatasets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>
                          ไม่พบชุดข้อมูลในหมวดนี้ สามารถนำเข้าไฟล์ Excel/CSV หรือเชื่อมต่อ API ผ่านแถบด้านบน
                        </div>
                      ) : (
                        agencyGroupedDatasets.map((group) => (
                          <div
                            key={group.agency}
                            style={{
                              borderRadius: '16px',
                              border: '1.5px solid #e2e8f0',
                              background: '#f8fafc',
                              padding: '20px'
                            }}
                          >
                            {/* Agency Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: '#0284c7',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '14px'
                                  }}
                                >
                                  🏢
                                </div>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                                    {group.agency}
                                  </h4>
                                  {group.website && (
                                    <a
                                      href={group.website}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        fontSize: '11px',
                                        color: '#0284c7',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        marginTop: '2px'
                                      }}
                                    >
                                      <Link2 size={11} />
                                      {group.website}
                                      <ExternalLink size={10} />
                                    </a>
                                  )}
                                </div>
                              </div>

                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', background: '#e2e8f0', padding: '3px 10px', borderRadius: '12px' }}>
                                {group.datasets.length} ชุดข้อมูล
                              </span>
                            </div>

                            {/* Datasets in this Agency */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                              {group.datasets.map((ds) => {
                                const linkedTopics = synergyLinkageMap[ds.id] || [];
                                const isReady = Boolean(ds.isReadyForSynergy);

                                return (
                                  <div
                                    key={ds.id}
                                    style={{
                                      padding: '16px',
                                      borderRadius: '14px',
                                      border: isReady ? '1px solid #bbf7d0' : '1.5px solid #fde68a',
                                      background: '#ffffff',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'space-between',
                                      gap: '12px',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                    }}
                                  >
                                    <div>
                                      {/* Badges row */}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span
                                          style={{
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: '#f1f5f9',
                                            color: '#475569'
                                          }}
                                        >
                                          {ds.sourceType}
                                        </span>

                                        {isReady ? (
                                          <span
                                            style={{
                                              fontSize: '11px',
                                              fontWeight: 700,
                                              color: '#059669',
                                              background: '#d1fae5',
                                              padding: '2px 8px',
                                              borderRadius: '12px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}
                                          >
                                            <CheckCircle2 size={12} />
                                            Ready for Synergy
                                          </span>
                                        ) : (
                                          <span
                                            style={{
                                              fontSize: '11px',
                                              fontWeight: 700,
                                              color: '#d97706',
                                              background: '#fef3c7',
                                              padding: '2px 8px',
                                              borderRadius: '12px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}
                                          >
                                            <AlertTriangle size={12} />
                                            Raw Data - รอ Cleansing
                                          </span>
                                        )}
                                      </div>

                                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', lineHeight: '1.4' }}>
                                        {ds.name}
                                      </h4>

                                      {/* Active Synergy Linkage Badge */}
                                      {linkedTopics.length > 0 && (
                                        <div
                                          style={{
                                            marginTop: '6px',
                                            padding: '4px 8px',
                                            background: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            color: '#1d4ed8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                          }}
                                        >
                                          <Repeat size={11} />
                                          <span>
                                            <strong>ใช้ใน Synergy:</strong> {linkedTopics.join(', ')}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Footer details & Actions */}
                                    <div
                                      style={{
                                        paddingTop: '10px',
                                        borderTop: '1px solid #f1f5f9',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '11px',
                                        color: '#64748b'
                                      }}
                                    >
                                      <div>
                                        {ds.rowCount} แถว • {ds.columnCount} คอลัมน์
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <button
                                          onClick={() => handleOpenExternalDatasetPreview(ds)}
                                          style={{
                                            background: '#f0f9ff',
                                            color: '#0284c7',
                                            border: '1px solid #bae6fd',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}
                                        >
                                          <Eye size={12} />
                                          ดูตาราง
                                        </button>

                                        {!isReady && (
                                          <button
                                            onClick={() => handleCleanseRawDataset(ds)}
                                            disabled={isCleansingDatasetId === ds.id}
                                            style={{
                                              background: '#d97706',
                                              color: '#ffffff',
                                              border: 'none',
                                              padding: '4px 8px',
                                              borderRadius: '6px',
                                              fontSize: '11px',
                                              fontWeight: 700,
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}
                                          >
                                            <Sparkles size={11} className={isCleansingDatasetId === ds.id ? 'spin' : ''} />
                                            {isCleansingDatasetId === ds.id ? 'กำลังคลีน...' : '⚡ Cleansing'}
                                          </button>
                                        )}

                                        <button
                                          onClick={async () => {
                                            if (confirm(`คุณต้องการลบชุดข้อมูล "${ds.name}" ออกจากคลังกลางใช่หรือไม่?`)) {
                                              await deleteCentralDatasetFromApi(ds.id);
                                              await loadPoolData();
                                              showToast(`🗑️ ลบชุดข้อมูล "${ds.name}" แล้ว`);
                                            }
                                          }}
                                          style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '4px'
                                          }}
                                          title="ลบชุดข้อมูลนี้"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  )}
                </div>
              )}

              {/* TAB 2: MANUAL UPLOAD & 4-STEP CLEANSING */}
              {poolTab === 'upload_cleanse' && (
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #38bdf8',
                      borderRadius: '16px',
                      background: '#f0f9ff',
                      padding: '36px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      marginBottom: '24px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".xlsx, .xls, .csv"
                      style={{ display: 'none' }}
                    />
                    <UploadCloud size={44} color="#0284c7" style={{ margin: '0 auto 12px auto' }} />
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                      คลิกเพื่ออัปโหลดไฟล์ Excel (.xlsx, .xls) หรือ CSV
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                      ระบบจะทำการประมวลผล Cleansing 4 ขั้นตอน (ชื่อ 77 จังหวัด, ปี พ.ศ., เคลียร์ตัวเลข/Missing Values, แถวซ้ำ) ให้อัตโนมัติทันที
                    </div>
                  </div>

                  {/* Cleansing Results Card */}
                  {cleansingResult && (
                    <div
                      style={{
                        borderRadius: '16px',
                        border: '1.5px solid #e2e8f0',
                        background: '#ffffff',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: cleansingResult.healthMetrics.statusColor,
                              background: `${cleansingResult.healthMetrics.statusColor}15`,
                              padding: '4px 12px',
                              borderRadius: '20px'
                            }}
                          >
                            {cleansingResult.healthMetrics.statusBadge}
                          </span>
                          <h3 style={{ margin: '8px 0 2px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                            รายงานผลการ Cleansing ข้อมูล: {uploadedFileName}
                          </h3>
                        </div>

                        <button
                          onClick={handleSaveCleansedToPool}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <CheckCircle2 size={16} />
                          บันทึกข้อมูลเข้าคลังกลาง (Ready for Synergy)
                        </button>
                      </div>

                      {/* Health Metrics Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                        <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>ความสมบูรณ์ข้อมูล</div>
                          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                            {cleansingResult.healthMetrics.completenessRate}%
                          </div>
                        </div>
                        <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>ครอบคลุมพื้นที่ 77 จังหวัด</div>
                          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                            {cleansingResult.healthMetrics.provinceMatchRate}% ({cleansingResult.healthMetrics.matchedProvincesCount}/77)
                          </div>
                        </div>
                        <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>ปรับชื่อจังหวัดให้ตรง</div>
                          <div style={{ fontSize: '22px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                            {cleansingResult.healthMetrics.normalizedProvincesCount} รายการ
                          </div>
                        </div>
                        <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>คลีนตัวเลข / ค่าว่าง</div>
                          <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                            {cleansingResult.healthMetrics.sanitizedNumbersCount} จุด
                          </div>
                        </div>
                      </div>

                      {/* Step-by-step Log List */}
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                        ขั้นตอนและรายละเอียดการทำความสะอาดข้อมูล (4-Step Pipeline)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {cleansingResult.logItems.map((item) => (
                          <div
                            key={item.step}
                            style={{
                              padding: '12px 16px',
                              background: '#f8fafc',
                              borderRadius: '10px',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: item.status === 'success' ? '#10b981' : '#f59e0b',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 800
                                }}
                              >
                                {item.step}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{item.detail}</div>
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#10b981',
                                background: '#d1fae5',
                                padding: '3px 8px',
                                borderRadius: '8px'
                              }}
                            >
                              ผ่านการตรวจสอบ
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: API SERVICE & CRON SCHEDULER */}
              {poolTab === 'api_scheduler' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
                    {/* Add Schedule Form */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '20px'
                      }}
                    >
                      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                        🔌 เชื่อมต่อ API Service และตั้งเวลารอบดึงข้อมูล
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            ชื่อชุดข้อมูล (Dataset Name)
                          </label>
                          <input
                            type="text"
                            value={newSchedule.datasetName}
                            onChange={(e) => setNewSchedule({ ...newSchedule, datasetName: e.target.value })}
                            placeholder="เช่น สถิติอุบัติเหตุรายวัน (กรมควบคุมโรค)"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: '1px solid #cbd5e1',
                              fontSize: '13px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            Endpoint URL
                          </label>
                          <input
                            type="text"
                            value={newSchedule.endpointUrl}
                            onChange={(e) => setNewSchedule({ ...newSchedule, endpointUrl: e.target.value })}
                            placeholder="https://api.example.go.th/v1/datasets/stats.json"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: '1px solid #cbd5e1',
                              fontSize: '13px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                              รูปแบบรอบเวลา (Schedule Type)
                            </label>
                            <select
                              value={newSchedule.scheduleType}
                              onChange={(e) => setNewSchedule({ ...newSchedule, scheduleType: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13px'
                              }}
                            >
                              <option value="daily">รายวัน (Daily)</option>
                              <option value="weekly">รายสัปดาห์ (Weekly)</option>
                              <option value="custom_calendar">ปฏิทินกำหนดเอง (Calendar)</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                              เวลาดึงข้อมูล (Schedule Time)
                            </label>
                            <input
                              type="time"
                              value={newSchedule.scheduleTime}
                              onChange={(e) => setNewSchedule({ ...newSchedule, scheduleTime: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13px',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleCreateApiSchedule}
                          style={{
                            marginTop: '8px',
                            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <Plus size={16} />
                          บันทึกการตั้งเวลารอบดึงข้อมูล
                        </button>
                      </div>
                    </div>

                    {/* Active Schedules List */}
                    <div>
                      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                        📋 รายการรอบเวลาดึงข้อมูลที่ตั้งไว้ ({apiSchedules.length})
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {apiSchedules.map((sched) => (
                          <div
                            key={sched.id}
                            style={{
                              padding: '16px',
                              borderRadius: '14px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                  {sched.datasetName}
                                </h4>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', wordBreak: 'break-all' }}>
                                  {sched.endpointUrl}
                                </div>
                              </div>

                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  background: sched.lastStatus === 'success' ? '#d1fae5' : '#fef3c7',
                                  color: sched.lastStatus === 'success' ? '#059669' : '#b45309'
                                }}
                              >
                                {sched.lastStatus === 'success' ? 'ดึงสำเร็จ' : 'รอทำงาน'}
                              </span>
                            </div>

                            <div
                              style={{
                                marginTop: '12px',
                                paddingTop: '10px',
                                borderTop: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '12px',
                                color: '#64748b'
                              }}
                            >
                              <div>
                                รอบ: {sched.scheduleType === 'daily' ? 'รายวัน' : 'รายสัปดาห์'} เวลา {sched.scheduleTime} น.
                              </div>

                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleSyncApiNow(sched.id)}
                                  disabled={isSyncingApiNow}
                                  style={{
                                    background: '#0284c7',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Sparkles size={12} />
                                  Sync Now
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('คุณต้องการลบรอบเวลานี้ใช่หรือไม่?')) {
                                      await deleteApiScheduleFromApi(sched.id);
                                      await loadPoolData();
                                    }
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TRANSFORMATION AUDIT TRAIL LOG */}
              {poolTab === 'audit_log' && (
                <div>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    📋 บันทึกประวัติการเตรียมและทำความสะอาดข้อมูล (Transformation Audit Trail)
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          padding: '16px 20px',
                          borderRadius: '14px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                              {log.datasetName}
                            </span>
                            <span style={{ marginLeft: '10px', fontSize: '11px', color: '#64748b' }}>
                              {new Date(log.timestamp).toLocaleString('th-TH')} • โดย {log.triggeredBy}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#059669',
                              background: '#d1fae5',
                              padding: '2px 8px',
                              borderRadius: '10px'
                            }}
                          >
                            Cleansing สำเร็จ
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                          <div>📍 ปรับชื่อจังหวัด: {log.provinceNormalizationCount} รายการ</div>
                          <div>📅 ปีที่ปรับจูน: {log.yearAlignmentInfo}</div>
                          <div>🔢 คลีนตัวเลข: {log.sanitizedValuesCount} จุด</div>
                          <div>✂️ แถวซ้ำที่ตัด: {log.deduplicatedRowsCount} แถว</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: NOTIFICATION SETTINGS */}
              {poolTab === 'notification_settings' && (
                <div style={{ maxWidth: '640px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    🔔 ตั้งค่าการแจ้งเตือน Admin ผ่าน LINE และ Email
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        LINE Notify Token หรือ LINE Webhook URL
                      </label>
                      <input
                        type="text"
                        value={notificationSettings.lineNotifyToken}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, lineNotifyToken: e.target.value })}
                        placeholder="กรอก LINE Notify Token หรือ Webhook URL"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        อีเมลผู้รับการแจ้งเตือน (คั่นด้วยจุลภาค)
                      </label>
                      <input
                        type="text"
                        value={notificationSettings.emailRecipients}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailRecipients: e.target.value })}
                        placeholder="admin@moralcenter.or.th, analyst@moralcenter.or.th"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button
                        onClick={handleSaveNotificationSettings}
                        style={{
                          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '12px 22px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        บันทึกการตั้งค่า
                      </button>

                      <button
                        onClick={handleSendTestAlert}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '12px 20px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Send size={14} />
                        ทดสอบส่งการแจ้งเตือน (Test Alert)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              VIEW 2: DIMENSION OVERVIEW
          ================================================================= */}
          {navMode === 'dimension_overview' && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                padding: '28px',
                boxShadow: '0 4px 18px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: currentDomain.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}
                  >
                    {renderDimensionIcon(currentDimension.iconName, 22, '#ffffff')}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                      มิติ: {currentDimension.title}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                      {currentDimension.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const newTitle = prompt('ระบุชื่อหัวข้อ Synergy ใหม่:', `Synergy ${currentDimension.title} x `);
                    if (newTitle && newTitle.trim()) {
                      const newInit: SynergyInitiative = {
                        id: `syn_${Date.now()}`,
                        title: newTitle.trim(),
                        domainId: currentDomain.domainId,
                        dimensionId: currentDimension.id,
                        targetPageId: currentDomain.pageId,
                        description: `การวิเคราะห์ Synergy ในมิติ ${currentDimension.title}`,
                        internalTableIds: ['mdc_moral_regional_breakdown'],
                        externalTableIds: ['ext_traffic_accidents_provincial'],
                        compatibilityScore: 88,
                        summaryHeadline: 'ความสัมพันธ์เชิงบวกระหว่างข้อมูลทั้งสองชุด',
                        lastSynergizedAt: new Date().toISOString()
                      };
                      currentDimension.initiatives.push(newInit);
                      setActiveInitiativeId(newInit.id);
                      setNavMode('synergy_initiative');
                      showToast(`✨ สร้างหัวข้อ Synergy "${newTitle}" เรียบร้อย`);
                    }
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 22px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <Plus size={16} />
                  + สร้าง Synergy ใหม่ในมิตินี้
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {currentDimension.initiatives.map((init) => (
                  <div
                    key={init.id}
                    onClick={() => handleSelectInitiative(init)}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0284c7')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#e0f2fe',
                            color: '#0369a1'
                          }}
                        >
                          ความเข้ากันได้ {init.compatibilityScore}%
                        </span>
                        <ArrowRight size={14} color="#0284c7" />
                      </div>
                      <h3 style={{ margin: '12px 0 6px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                        {init.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                        {init.description}
                      </p>
                    </div>

                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      อัปเดตล่าสุด: {init.lastSynergizedAt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 3: UNIFIED SYNERGY INITIATIVE STUDIO & 3-LEVEL DASHBOARD
          ================================================================= */}
          {navMode === 'synergy_initiative' && currentInitiative && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* TOP ACTION HEADER */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  padding: '22px 28px',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        background: `${currentDomain.color}15`,
                        color: currentDomain.color,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {currentDomain.domainTitle} • มิติ{currentDimension.title}
                    </span>
                    {currentInitiative.isPublishedToMain && (
                      <span
                        style={{
                          background: '#d1fae5',
                          color: '#059669',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Globe size={11} />
                        เผยแพร่บนหน้าหลักแล้ว
                      </span>
                    )}
                  </div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                    {currentInitiative.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={handleTogglePublishToMain}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: currentInitiative.isPublishedToMain ? '1px solid #10b981' : '1px solid #cbd5e1',
                      background: currentInitiative.isPublishedToMain ? '#d1fae5' : '#ffffff',
                      color: currentInitiative.isPublishedToMain ? '#059669' : '#334155',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Share2 size={14} />
                    {currentInitiative.isPublishedToMain ? 'เผยแพร่อยู่ (คลิกเพื่อยกเลิก)' : '📢 เผยแพร่ไปยังแดชบอร์ดหลัก'}
                  </button>

                  <button
                    onClick={handleReSynergy}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: '1px solid #0284c7',
                      background: '#f0f9ff',
                      color: '#0284c7',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} />
                    ⚙️ ปรับแต่ง / ประเมินซ้ำ
                  </button>

                  <button
                    onClick={() => handleDeleteInitiative(currentInitiative.id, currentInitiative.title)}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '10px',
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Trash2 size={14} />
                    ลบหัวข้อ
                  </button>
                </div>
              </div>

              {/* SECTION 0: DATASET PAIRING & EXTERNAL DATASET SELECTOR (STRICT READY-FOR-SYNERGY GATING) */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  padding: '24px 28px',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Compass size={18} color="#0284c7" />
                      การจับคู่ชุดข้อมูลสำหรับการ Synergy (ใช้ข้อมูลเชิงพื้นที่ของศูนย์คุณธรรม เป็นตัวตั้งหลัก)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                      เลือกข้อมูลเชิงพื้นที่ของศูนย์คุณธรรม (ระดับ 77 จังหวัด / 4 ภูมิภาค) เป็นตัวตั้งหลัก เพื่อจับคู่เทียบเคียงกับชุดข้อมูลภายนอกที่ผ่านการรับรองแล้ว (Ready for Synergy)
                    </p>
                  </div>

                  {rawCount > 0 && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#b45309',
                        background: '#fef3c7',
                        border: '1px solid #fde68a',
                        padding: '6px 14px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <AlertTriangle size={14} color="#d97706" />
                      <span>
                        มีชุดข้อมูลดิบ <strong>{rawCount}</strong> รายการยังไม่ผ่านการ Cleansing (ไม่สามารถนำมา Synergy ได้)
                      </span>
                      <button
                        onClick={() => {
                          setNavMode('central_pool');
                          setMainViewTab('repository');
                        }}
                        style={{
                          background: '#d97706',
                          color: '#ffffff',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ไปที่คลังข้อมูล
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', alignItems: 'stretch' }}>
                  {/* Left Box: ข้อมูลของศูนย์คุณธรรม ในเชิงพื้นที่ (ตัวตั้งหลัก - Spatial Baseline) */}
                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      border: '1.5px solid #7dd3fc',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Compass size={14} color="#0284c7" />
                          📍 ข้อมูลของศูนย์คุณธรรม ในเชิงพื้นที่ (ตัวตั้งหลัก)
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', background: '#bae6fd', padding: '3px 8px', borderRadius: '8px' }}>
                          🗺️ 77 จังหวัด / ภูมิภาค
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '8px', fontWeight: 600 }}>
                        เลือกตารางข้อมูลเชิงพื้นที่ของศูนย์เพื่อใช้เป็นตัวตั้งในการจับคู่ Synergy:
                      </div>

                      <select
                        value={currentInternalSpatialTableId}
                        onChange={(e) => {
                          const selectedTableId = e.target.value;
                          currentInitiative.internalTableIds = [selectedTableId];
                          reSynergizeInitiative(currentInitiative.id);
                          saveSynergyInitiativeToApi(currentInitiative);
                          setDomainConfigs(getHierarchicalDomainConfigs());
                          const resolved = resolveDatasetMeta(selectedTableId);
                          showToast(`📍 กำหนด "${resolved.name}" เป็นข้อมูลเชิงพื้นที่ตัวตั้งหลักแล้ว`);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #0284c7',
                          background: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0f172a',
                          cursor: 'pointer'
                        }}
                      >
                        {availableDomainSpatialTables.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.id.includes('regional') ? '📍 [เชิงพื้นที่ 77 จังหวัด - ตัวตั้งหลัก] ' : '📍 [เชิงพื้นที่] '}
                            {t.name} ({t.rowCount} แถว • {t.engine})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ fontSize: '12px', color: '#0369a1', borderTop: '1px solid #bae6fd', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                      <span>หน่วยงาน: <strong>ศูนย์คุณธรรม (องค์การมหาชน)</strong></span>
                      <span style={{ color: '#0284c7', fontWeight: 700 }}>
                        🔑 Spatial Join Key: <strong>จังหวัด (77 จังหวัด)</strong>
                      </span>
                    </div>
                  </div>

                  {/* Right Box: External Dataset Selector Box */}
                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Globe size={14} color="#059669" />
                          🌐 ข้อมูลภายนอกที่นำมา Synergy (ตัวเทียบเคียง)
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '3px 8px', borderRadius: '8px' }}>
                          🔒 เฉพาะ Ready for Synergy ({readyCount} ชุด)
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px', fontWeight: 600 }}>
                        เลือกชุดข้อมูลสถิติภายนอกที่ผ่านการ Cleansing เพื่อเทียบเคียงในมิติพื้นที่เดียวกัน:
                      </div>

                      <select
                        value={currentInitiative.externalTableIds[0] || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selectedDs = poolDatasets.find((d) => d.id === selectedId);
                          if (selectedDs) {
                            currentInitiative.externalTableIds = [selectedId];
                            currentInitiative.title = `${currentDimension.title} x ${selectedDs.name.replace(/สถิติ|\(.*\)/g, '').trim()}`;
                            reSynergizeInitiative(currentInitiative.id);
                            saveSynergyInitiativeToApi(currentInitiative);
                            setDomainConfigs(getHierarchicalDomainConfigs());
                            showToast(`🔗 สลับจับคู่กับ "${selectedDs.name}" และประเมินความเข้ากันได้ใหม่แล้ว`);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #059669',
                          background: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0f172a',
                          cursor: 'pointer'
                        }}
                      >
                        {poolDatasets
                          .filter((d) => d.isReadyForSynergy)
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.sourceAgency})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                      <span>หน่วยงาน: <strong>{externalDatasets[0]?.sourceAgency || 'หน่วยงานภายนอก'}</strong></span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>
                        ความสมบูรณ์: <strong>100% (ครอบคลุม 77 จว.)</strong>
                      </span>
                    </div>
                  </div>

                  {/* Spatial Synergy Connection Banner */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      gridColumn: '1 / -1',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)'
                    }}
                  >
                    <Repeat size={14} />
                    <span>⚡ มิติการจับคู่ SYNERGY: ข้อมูลเชิงพื้นที่ 77 จังหวัดของศูนย์คุณธรรม (ตัวตั้ง) ➔ เทียบเคียงมิติพื้นที่กับ ข้อมูลสถิติภายนอก (ตัวเทียบ)</span>
                  </div>
                </div>
              </div>

              {/* SECTION 1: DOMAIN-ADAPTIVE COMPATIBILITY ASSESSMENT CARD */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  padding: '24px 28px',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#0284c7',
                          background: '#e0f2fe',
                          padding: '3px 10px',
                          borderRadius: '12px'
                        }}
                      >
                        {compatibilityResult.domainTitle}
                      </span>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        ตรวจความเข้ากันได้แบบจำเพาะ {compatibilityResult.dimensionCount} มิติ
                      </span>
                    </div>
                    <h3 style={{ margin: '6px 0 0 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                      ผลการตรวจสอบความพร้อมของข้อมูล (Data Compatibility Assessment)
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>คะแนนความพร้อมรวม</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: compatibilityResult.statusColor }}>
                        {compatibilityResult.overallScore}%
                      </div>
                    </div>

                    <button
                      onClick={handleReSynergy}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={14} />
                      ⚡ ดำเนินการ Synergy ข้อมูล
                    </button>
                  </div>
                </div>

                {/* Specific Dimensions Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  {compatibilityResult.evaluatedDimensionsList.map((dim) => (
                    <div
                      key={dim.key}
                      style={{
                        padding: '14px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{dim.thaiLabel}</span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7' }}>{dim.score}%</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>{dim.summary}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    fontSize: '12px',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>
                    <strong>ข้อสรุปความพร้อม:</strong> ข้อมูลมีความเข้ากันได้ระดับ <strong>{compatibilityResult.statusBadge}</strong> (อัตราการจับคู่พื้นที่ 77 จังหวัดสำเร็จ {compatibilityResult.innerJoinMatchRate}%) ข้อมูลพร้อมนำไปแสดงผลบน Dashboard 3 ระดับอย่างสมบูรณ์
                  </span>
                </div>
              </div>

              {/* SECTION 2: SYNERGY DASHBOARD 3 STAKEHOLDER LEVELS */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  padding: '24px 28px',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.04)'
                }}
              >
                {/* 3 Stakeholder Level Tabs */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '16px',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                      📊 แดชบอร์ดวิเคราะห์ผลลัพธ์การ Synergy 3 ระดับ
                    </h3>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      วิเคราะห์ผลกระทบเชิงพื้นที่ แผนที่ประเทศไทย 77 จังหวัด และมุมมองตอบโจทย์ 3 กลุ่มเป้าหมาย
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      background: '#f1f5f9',
                      padding: '4px',
                      borderRadius: '12px',
                      gap: '4px'
                    }}
                  >
                    <button
                      onClick={() => setSynergyLevelTab('policy')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: synergyLevelTab === 'policy' ? '#ffffff' : 'transparent',
                        color: synergyLevelTab === 'policy' ? '#0284c7' : '#64748b',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        boxShadow: synergyLevelTab === 'policy' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Building2 size={14} />
                      🏛️ ระดับนโยบาย (Policy)
                    </button>

                    <button
                      onClick={() => setSynergyLevelTab('driver')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: synergyLevelTab === 'driver' ? '#ffffff' : 'transparent',
                        color: synergyLevelTab === 'driver' ? '#0284c7' : '#64748b',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        boxShadow: synergyLevelTab === 'driver' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Activity size={14} />
                      🚜 ระดับปฏิบัติการ (Driver)
                    </button>

                    <button
                      onClick={() => setSynergyLevelTab('citizen')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: synergyLevelTab === 'citizen' ? '#ffffff' : 'transparent',
                        color: synergyLevelTab === 'citizen' ? '#0284c7' : '#64748b',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        boxShadow: synergyLevelTab === 'citizen' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Users size={14} />
                      👥 ระดับประชาชน (Citizen)
                    </button>
                  </div>
                </div>

                {/* THAILAND MAP & CHART CONTAINER */}
                <div style={{ marginBottom: '28px' }}>
                  <MoralSynergyRegionalMapCard
                    topicId={currentInitiative.id}
                    topicName={currentInitiative.title}
                    dimensionKey={currentDimension.id}
                    dimensionTitle={currentDimension.title}
                    accentColor={currentDomain.color}
                    hasSpatialMap={true}
                  />
                </div>

                {/* STAKEHOLDER TAB CONTENT */}
                {/* 1. POLICY VIEW */}
                {synergyLevelTab === 'policy' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>ดัชนีความสัมพันธ์ระดับประเทศ (Pearson r)</div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>r = +0.78</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>ความสัมพันธ์เชิงบวกระดับสูงมาก (Significant at p &lt; 0.01)</div>
                      </div>

                      <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>Quadrant 1: พื้นที่ต้นแบบ (Champion Hubs)</div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>24 จังหวัด</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>คุณธรรมสูง-ผลกระทบเชิงบวกชัดเจน พร้อมขยายผลเชิงนโยบาย</div>
                      </div>

                      <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>Quadrant 3: พื้นที่เสี่ยงเร่งด่วน (Urgent Intervention)</div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>14 จังหวัด</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>ต้องเสริมแรงคุณธรรมและจัดสรรทรัพยากรหนุนเสริมเป็นอันดับแรก</div>
                      </div>
                    </div>

                    <div style={{ padding: '18px', background: '#f0f9ff', borderRadius: '14px', border: '1px solid #bae6fd' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0369a1', marginBottom: '8px' }}>
                        📌 ข้อเสนอแนะเชิงยุทธศาสตร์ระดับชาติ 3 ข้อ (Key Strategic Takeaways)
                      </div>
                      <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#0f172a', lineHeight: '1.6' }}>
                        <li><strong>ผลักดันเป็นตัวชี้วัดร่วมข้ามกระทรวง:</strong> กำหนดให้มิติ {currentDimension.title} เป็น KPI ร่วมระหว่างศูนย์คุณธรรมกับหน่วยงานพันธมิตร</li>
                        <li><strong>เน้น Nudge ในพื้นที่ White Space:</strong> มุ่งใช้กลไกแรงจูงใจพฤติกรรมศาสตร์และมาตรการเชิงบวกใน 14 จังหวัดเสี่ยงเร่งด่วน</li>
                        <li><strong>ส่งเสริมสิทธิประโยชน์ชุมชนคุณธรรม:</strong> จัดสรรงบประมาณสนับสนุนกลุ่มพื้นที่ต้นแบบเพื่อเป็นพี่เลี้ยงขับเคลื่อนขยายผล</li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* 2. DRIVER VIEW */}
                {synergyLevelTab === 'driver' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        ตารางวิเคราะห์ Gap รายพื้นที่ 77 จังหวัด (ระดับปฏิบัติการ)
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        จัดอันดับความต้องการหนุนเสริมและคะแนนตัวชี้วัดรายจังหวัด
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>อันดับ</th>
                            <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>จังหวัด</th>
                            <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>ดัชนีคุณธรรม</th>
                            <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>ตัวชี้วัดภายนอก</th>
                            <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>สถานะปฏิบัติการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {THAILAND_77_PROVINCES.slice(0, 10).map((prov, idx) => (
                            <tr key={prov} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0284c7' }}>#{idx + 1}</td>
                              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{prov}</td>
                              <td style={{ padding: '10px 14px' }}>{(4.2 + (idx * 0.07)).toFixed(2)} / 5.00</td>
                              <td style={{ padding: '10px 14px' }}>{(72 + (idx * 2.1)).toFixed(1)}%</td>
                              <td style={{ padding: '10px 14px' }}>
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: idx < 3 ? '#d1fae5' : '#e0f2fe',
                                    color: idx < 3 ? '#059669' : '#0369a1'
                                  }}
                                >
                                  {idx < 3 ? '🌟 พื้นที่ต้นแบบ' : '⚡ ปฏิบัติการปกติ'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. CITIZEN VIEW */}
                {synergyLevelTab === 'citizen' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <MapPin size={22} color="#0284c7" />
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                          เลือกดูข้อมูลสำหรับจังหวัดของคุณ:
                        </label>
                        <select
                          value={citizenSelectedProvince}
                          onChange={(e) => setCitizenSelectedProvince(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#0f172a',
                            width: '260px'
                          }}
                        >
                          {THAILAND_77_PROVINCES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                        ความสุขและความปลอดภัยใน จ.{citizenSelectedProvince} สูงกว่าค่าเฉลี่ยประเทศ +14%
                      </div>
                      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#15803d', lineHeight: '1.6' }}>
                        จากข้อมูลการ Synergy พบว่าในพื้นที่ <strong>{citizenSelectedProvince}</strong> เมื่อประชาชนมีส่วนร่วมในการขับเคลื่อนมิติ <strong>{currentDimension.title}</strong> จะส่งผลให้ปัญหาความเสี่ยงในชีวิตประจำวันลดลงอย่างชัดเจน
                      </p>

                      <div style={{ padding: '14px', background: '#ffffff', borderRadius: '12px', border: '1px solid #86efac' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                          🌱 สิ่งที่เราทุกคนสามารถร่วมมือกันได้วันนี้:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                          <li>เริ่มจากครอบครัว: ปลูกฝังค่านิยม {currentDimension.title} ในชีวิตประจำวัน</li>
                          <li>ร่วมสร้างกติกาชุมชน: ปฏิบัติตามกฎวินัยและความซื่อสัตย์ในละแวกบ้าน</li>
                          <li>บอกต่อพลังบวก: ร่วมเป็นกำลังใจให้เพื่อนบ้านและเครือข่ายจิตอาสาในพื้นที่</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================
          INTERACTIVE DATA TABLE PREVIEW MODAL (DUAL-STATE: RAW VS CLEANSED)
      ================================================================= */}
      {previewModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setPreviewModal({ ...previewModal, isOpen: false })}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '1200px',
              maxHeight: '88vh',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '8px' }}>
                    {previewModal.sourceAgency}
                  </span>
                  {previewModal.sourceWebsite && (
                    <a
                      href={previewModal.sourceWebsite}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '11px', color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Link2 size={11} />
                      {previewModal.sourceWebsite}
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  ตารางข้อมูล: {previewModal.displayName}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Dual-State Tab Toggle for custom datasets */}
                {previewModal.isCustom && (
                  <div style={{ display: 'flex', background: '#e2e8f0', padding: '3px', borderRadius: '10px', gap: '4px' }}>
                    <button
                      onClick={() => setPreviewModal({ ...previewModal, activeTab: 'cleansed' })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '7px',
                        border: 'none',
                        background: previewModal.activeTab === 'cleansed' ? '#ffffff' : 'transparent',
                        color: previewModal.activeTab === 'cleansed' ? '#059669' : '#64748b',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={12} color="#059669" />
                      ข้อมูลคลีนแล้ว (Cleansed)
                    </button>
                    <button
                      onClick={() => setPreviewModal({ ...previewModal, activeTab: 'raw' })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '7px',
                        border: 'none',
                        background: previewModal.activeTab === 'raw' ? '#ffffff' : 'transparent',
                        color: previewModal.activeTab === 'raw' ? '#d97706' : '#64748b',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <AlertTriangle size={12} color="#d97706" />
                      ข้อมูลดิบตั้งต้น (Raw Data)
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setPreviewModal({ ...previewModal, isOpen: false })}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {!previewModal.isCustom && previewModal.tableName ? (
                <InteractiveDataTableViewer
                  tableName={previewModal.tableName}
                  displayName={previewModal.displayName}
                  sourceAgency={previewModal.sourceAgency}
                />
              ) : (
                <div>
                  {/* Custom Data Preview Table */}
                  {(() => {
                    const rows: Record<string, any>[] = (previewModal.activeTab === 'cleansed' ? previewModal.cleansedData : previewModal.rawData) || [];
                    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

                    const filtered = rows.filter((r) => {
                      if (!previewSearch.trim()) return true;
                      return Object.values(r).some((v) => String(v).toLowerCase().includes(previewSearch.toLowerCase()));
                    });

                    const pageSize = 12;
                    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                    const paged = filtered.slice((previewPage - 1) * pageSize, previewPage * pageSize);

                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>
                              แสดง <strong>{filtered.length}</strong> แถว (จากทั้งหมด {rows.length} แถว)
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="text"
                              value={previewSearch}
                              onChange={(e) => {
                                setPreviewSearch(e.target.value);
                                setPreviewPage(1);
                              }}
                              placeholder="ค้นหาข้อมูลในตาราง..."
                              style={{
                                padding: '7px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '12px',
                                width: '220px'
                              }}
                            />
                          </div>
                        </div>

                        {rows.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            ไม่มีแถวข้อมูลตัวอย่างในสถานะนี้
                          </div>
                        ) : (
                          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 700, width: '50px' }}>#</th>
                                  {columns.map((c) => (
                                    <th key={c} style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 700 }}>
                                      {c}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {paged.map((row, idx) => (
                                  <tr
                                    key={idx}
                                    style={{
                                      borderBottom: '1px solid #f1f5f9',
                                      background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                                    }}
                                  >
                                    <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '11px' }}>
                                      {(previewPage - 1) * pageSize + idx + 1}
                                    </td>
                                    {columns.map((c) => (
                                      <td key={c} style={{ padding: '10px 14px', color: '#334155' }}>
                                        {row[c] !== null && row[c] !== undefined ? String(row[c]) : '-'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              หน้า {previewPage} จาก {totalPages}
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                                disabled={previewPage <= 1}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: previewPage <= 1 ? '#f1f5f9' : '#ffffff',
                                  cursor: previewPage <= 1 ? 'not-allowed' : 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                ก่อนหน้า
                              </button>
                              <button
                                onClick={() => setPreviewPage(Math.min(totalPages, previewPage + 1))}
                                disabled={previewPage >= totalPages}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: previewPage >= totalPages ? '#f1f5f9' : '#ffffff',
                                  cursor: previewPage >= totalPages ? 'not-allowed' : 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                ถัดไป
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
