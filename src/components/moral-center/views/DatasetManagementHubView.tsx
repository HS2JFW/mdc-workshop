import React, { useState, useEffect, useMemo } from 'react';
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
  Globe,
  Share2
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
import { InteractiveDataTableViewer } from '../components/InteractiveDataTableViewer';
import { CentralPoolDualView } from '../components/CentralPoolDualView';
import { AddDatasetToInitiativeModal } from '../components/AddDatasetToInitiativeModal';
import { DatasetImportSynergyStudio } from '../components/DatasetImportSynergyStudio';
import { CreateSynergyInitiativeModal } from '../components/CreateSynergyInitiativeModal';

export interface DatasetManagementHubViewProps {
  onNavigatePage: (pageId: string) => void;
  onOpenDatabaseTable?: (tableName: string, pageId?: string) => void;
}

export const DatasetManagementHubView: React.FC<DatasetManagementHubViewProps> = ({
  onNavigatePage,
  onOpenDatabaseTable
}) => {
  // View mode: 'hierarchical' (4 tabs & drilldown) or 'central_pool' (all pool datasets in 2 groups)
  const [viewMode, setViewMode] = useState<'hierarchical' | 'central_pool'>('hierarchical');

  // Hierarchy configs
  const [domainConfigs, setDomainConfigs] = useState<HierarchicalDomainConfig[]>(() =>
    getHierarchicalDomainConfigs()
  );

  // Hierarchy selections: Domain -> Dimension -> Initiative
  const [activeDomainId, setActiveDomainId] = useState<DomainId>('moral-index');
  const [activeDimensionId, setActiveDimensionId] = useState<string>('discipline');
  const [activeInitiativeId, setActiveInitiativeId] = useState<string>('syn_discipline_traffic');

  // Table Preview selection
  const [selectedTableId, setSelectedTableId] = useState<string>('mdc_moral_regional_breakdown');

  // Modals state
  const [isAddDatasetModalOpen, setIsAddDatasetModalOpen] = useState<boolean>(false);
  const [isNewDatasetStudioOpen, setIsNewDatasetStudioOpen] = useState<boolean>(false);
  const [isCreateInitiativeModalOpen, setIsCreateInitiativeModalOpen] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync registry changes
  useEffect(() => {
    const unsub = onHierarchicalSynergyChange((updated) => {
      setDomainConfigs(updated);
    });
    return unsub;
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

  // Synchronize initiative & dimension when domain changes
  useEffect(() => {
    if (currentDomain.dimensions.length > 0) {
      const dimExists = currentDomain.dimensions.some((d) => d.id === activeDimensionId);
      if (!dimExists) {
        const firstDim = currentDomain.dimensions[0];
        setActiveDimensionId(firstDim.id);
        if (firstDim.initiatives.length > 0) {
          setActiveInitiativeId(firstDim.initiatives[0].id);
        }
      }
    }
  }, [currentDomain, activeDimensionId]);

  // Synchronize initiative when dimension changes
  useEffect(() => {
    if (currentDimension.initiatives.length > 0) {
      const initExists = currentDimension.initiatives.some((i) => i.id === activeInitiativeId);
      if (!initExists) {
        setActiveInitiativeId(currentDimension.initiatives[0].id);
      }
    }
  }, [currentDimension, activeInitiativeId]);

  // Datasets under current initiative
  const initiativeDatasets = useMemo(() => {
    if (!currentInitiative) return [];
    const allIds = [...currentInitiative.internalTableIds, ...currentInitiative.externalTableIds];
    return allIds.map((id) => resolveDatasetMeta(id));
  }, [currentInitiative]);

  // Zone 1: ข้อมูลภายในศูนย์คุณธรรม (Left Zone)
  const internalDatasets = useMemo(() => {
    if (!currentInitiative) return [];
    return currentInitiative.internalTableIds.map((id) => resolveDatasetMeta(id));
  }, [currentInitiative]);

  // Zone 2: ข้อมูลหน่วยงานภายนอกพันธมิตร (Right Zone)
  const externalDatasets = useMemo(() => {
    if (!currentInitiative) return [];
    return currentInitiative.externalTableIds.map((id) => resolveDatasetMeta(id));
  }, [currentInitiative]);

  // Keep selected table valid
  useEffect(() => {
    if (initiativeDatasets.length > 0) {
      const exists = initiativeDatasets.some((d) => d.id === selectedTableId);
      if (!exists) {
        setSelectedTableId(initiativeDatasets[0].id);
      }
    }
  }, [initiativeDatasets, selectedTableId]);

  // Re-Synergy Handler
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

  // Unlink Table Handler
  const handleRemoveTable = (tableId: string) => {
    if (!currentInitiative) return;
    if (confirm(`คุณต้องการลบชุดข้อมูล "${tableId}" ออกจากการ Synergy นี้ใช่หรือไม่?`)) {
      removeTableFromInitiative(currentInitiative.id, tableId);
      setDomainConfigs(getHierarchicalDomainConfigs());
      showToast('🗑️ ปลดชุดข้อมูลออกจากการ Synergy เรียบร้อย');
    }
  };

  // Delete Initiative Handler (Full Synergy Topic Deletion synced to Analysis Page)
  const handleDeleteInitiative = (initiativeId: string, title: string) => {
    if (
      confirm(
        `คุณต้องการลบหัวข้อ Synergy "${title}" ออกจากระบบใช่หรือไม่?\n\nการลบนี้จะมีผลทำให้หน้านี้และหน้าการวิเคราะห์ (Analysis) นำหัวข้อนี้ออกทันที`
      )
    ) {
      deleteSynergyInitiative(initiativeId);
      const updated = getHierarchicalDomainConfigs();
      setDomainConfigs(updated);
      showToast(`🗑️ ลบหัวข้อ Synergy "${title}" ออกจากระบบและหน้าวิเคราะห์แล้ว`);
    }
  };

  const selectedMeta = useMemo(() => {
    return resolveDatasetMeta(selectedTableId);
  }, [selectedTableId]);

  // Helper icons
  const renderDomainIcon = (iconName: string, size = 22, color = '#ffffff') => {
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

  const renderDimensionIcon = (iconName: string, size = 16, color = '#0284c7') => {
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
      case 'Landmark':
        return <Landmark size={size} color={color} />;
      case 'Car':
        return <Car size={size} color={color} />;
      case 'ShieldCheck':
        return <ShieldCheck size={size} color={color} />;
      case 'GraduationCap':
        return <GraduationCap size={size} color={color} />;
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
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* =====================================================================
          1. TOP HERO HEADER & PRIMARY VIEW MODE TOGGLE (POOL กลาง VS 4 แท็บ)
      ===================================================================== */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091325 0%, #172554 50%, #0f172a 100%)',
          borderRadius: '24px',
          padding: '26px 32px',
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
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(56, 189, 248, 0.35)'
            }}
          >
            <Database size={30} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#f8fafc' }}>
                คลังชุดข้อมูลและการเชื่อมโยงข้อมูล (Dataset & Synergy Hub)
              </h1>
              <span
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 800
                }}
              >
                DuckDB Powered
              </span>
            </div>
            <p style={{ margin: '5px 0 0', fontSize: '13.5px', color: '#94a3b8' }}>
              ศูนย์กลางเชื่อมโยงข้อมูลภายในศูนย์คุณธรรมและข้อมูลภายนอกจากหน่วยงานอื่น เพื่อสร้างข้อเสนอนโยบายเชิงพฤติกรรมศาสตร์
            </p>
          </div>
        </div>

        {/* TOP BUTTONS: POOL กลาง (อยู่บนสุด) + NEW DATASET */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Central Pool Button (ปุ่ม Pool กลางอยู่บนสุดตามข้อกำหนด) */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'central_pool' ? 'hierarchical' : 'central_pool')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: viewMode === 'central_pool' ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)',
              color: viewMode === 'central_pool' ? '#091325' : '#ffffff',
              border: '1.5px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '14px',
              padding: '11px 22px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: viewMode === 'central_pool' ? '0 4px 16px rgba(56, 189, 248, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Globe size={18} />
            <span>
              {viewMode === 'central_pool' ? 'กลับสู่ 4 แท็บหลัก & Synergy' : '🌐 ดู Pool กลางทั้งหมด (Central Pool)'}
            </span>
          </button>

          {/* New Dataset Studio Button */}
          <button
            type="button"
            onClick={() => setIsNewDatasetStudioOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '11px 22px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={18} />
            <span>New Dataset (นำเข้าข้อมูล)</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          VIEW MODE 1: CENTRAL POOL DUAL VIEW (เมื่อกดปุ่ม Pool กลางบนสุด)
      ===================================================================== */}
      {viewMode === 'central_pool' ? (
        <div>
          <CentralPoolDualView
            onSelectTable={(id) => setSelectedTableId(id)}
            selectedTableId={selectedTableId}
          />

          {/* Table Preview Below Central Pool */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                ตารางข้อมูลจริง (Data Table Preview)
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                (ข้อมูลที่เลือกจาก Pool กลาง)
              </span>
            </div>

            <InteractiveDataTableViewer
              tableName={selectedTableId}
              displayName={selectedMeta.name}
              sourceAgency={selectedMeta.sourceAgency}
            />
          </div>
        </div>
      ) : (
        /* =====================================================================
            VIEW MODE 2: HIERARCHICAL SYNERGY VIEW (4 แท็บหลัก -> มิติ -> Synergy)
        ===================================================================== */
        <div>
          {/* LEVEL 1: TAB หน้าหลัก 4 หน้า (4 PRIMARY DOMAIN TABS) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px',
              marginBottom: '20px'
            }}
          >
            {domainConfigs.map((dom) => {
              const isActive = dom.domainId === activeDomainId;
              const totalInitiatives = dom.dimensions.reduce(
                (acc, d) => acc + d.initiatives.length,
                0
              );
              return (
                <div
                  key={dom.domainId}
                  onClick={() => {
                    setActiveDomainId(dom.domainId);
                    if (dom.dimensions.length > 0) {
                      setActiveDimensionId(dom.dimensions[0].id);
                      if (dom.dimensions[0].initiatives.length > 0) {
                        setActiveInitiativeId(dom.dimensions[0].initiatives[0].id);
                      }
                    }
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '18px',
                    padding: '16px 20px',
                    border: isActive ? `2.5px solid ${dom.color}` : '1.5px solid #e2e8f0',
                    boxShadow: isActive
                      ? `0 10px 24px ${dom.color}25, 0 2px 6px rgba(0,0,0,0.04)`
                      : '0 2px 8px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transform: isActive ? 'translateY(-2px)' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      backgroundColor: dom.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${dom.color}40`,
                      flexShrink: 0
                    }}
                  >
                    {renderDomainIcon(dom.iconName, 24, '#ffffff')}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 800,
                          color: isActive ? dom.color : '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {dom.domainTitle}
                      </h3>
                      {isActive && (
                        <span
                          style={{
                            backgroundColor: dom.color,
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '1px 7px',
                            borderRadius: '12px'
                          }}
                        >
                          เลือกอยู่
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{dom.dimensions.length} หัวข้อมิติ</span>
                      <span>•</span>
                      <span>{totalInitiatives} เรื่อง Synergy</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* LEVEL 2: แถบปุ่มหัวข้อมิติ (เช่น ภาพรวม, วินัยรับผิดชอบ, สุจริต, จิตอาสา, พอเพียง, กตัญญู) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '14px 20px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#475569',
                marginRight: '6px'
              }}
            >
              หัวข้อมิติ:
            </span>

            {currentDomain.dimensions.map((dim) => {
              const isDimActive = dim.id === activeDimensionId;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => {
                    setActiveDimensionId(dim.id);
                    if (dim.initiatives.length > 0) {
                      setActiveInitiativeId(dim.initiatives[0].id);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: isDimActive ? `1.5px solid ${dim.color}` : '1.5px solid #cbd5e1',
                    backgroundColor: isDimActive ? dim.color : '#f8fafc',
                    color: isDimActive ? '#ffffff' : '#334155',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: isDimActive ? `0 4px 12px ${dim.color}35` : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {renderDimensionIcon(dim.iconName, 15, isDimActive ? '#ffffff' : dim.color)}
                  <span>{dim.title}</span>
                  <span
                    style={{
                      backgroundColor: isDimActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                      color: isDimActive ? '#ffffff' : '#475569',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}
                  >
                    {dim.initiatives.length} Synergy
                  </span>
                </button>
              );
            })}
          </div>

          {/* LEVEL 3: ปุ่ม SYNERGY แต่ละเรื่อง (เฉพาะข้อหน้าที่เอาข้อมูลของมิตินี้ไป SYNERGY กับภายนอก) */}
          <div
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '20px',
              padding: '18px 22px',
              border: '1.5px solid #e2e8f0',
              marginBottom: '24px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  ปุ่มหัวข้อ Synergy ที่นำมิติ "{currentDimension.title}" ไปเชื่อมโยงกับข้อมูลภายนอก ({currentDimension.initiatives.length} เรื่อง):
                </h3>
              </div>

              {/* Add New Synergy Initiative Button */}
              <button
                type="button"
                onClick={() => setIsCreateInitiativeModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(2, 132, 199, 0.3)',
                  transition: 'all 0.15s ease'
                }}
                title="สร้างหัวข้อ Synergy ใหม่พร้อมเชื่อมโยงข้อมูลภายนอก (ไปแสดงผลในหน้าวิเคราะห์ด้วย)"
              >
                <Plus size={15} />
                <span>➕ เพิ่มเรื่อง Synergy ใหม่</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {currentDimension.initiatives.map((init) => {
                const isInitActive = init.id === activeInitiativeId;
                return (
                  <div
                    key={init.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: isInitActive ? '#0284c7' : '#ffffff',
                      border: isInitActive ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
                      borderRadius: '14px',
                      padding: '4px 6px 4px 14px',
                      boxShadow: isInitActive
                        ? '0 6px 18px rgba(2, 132, 199, 0.3)'
                        : '0 2px 6px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveInitiativeId(init.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isInitActive ? '#ffffff' : '#1e293b',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 0'
                      }}
                    >
                      <span>🔘 {init.title}</span>
                      <span
                        style={{
                          backgroundColor: isInitActive ? 'rgba(255,255,255,0.25)' : '#ecfdf5',
                          color: isInitActive ? '#ffffff' : '#059669',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        เข้ากันได้ {init.compatibilityScore}%
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInitiative(init.id, init.title);
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '7px',
                        backgroundColor: isInitActive ? 'rgba(255,255,255,0.2)' : '#fff1f2',
                        border: isInitActive ? '1px solid rgba(255,255,255,0.4)' : '1px solid #fecdd3',
                        color: isInitActive ? '#ffffff' : '#e11d48',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title={`ลบหัวข้อ Synergy "${init.title}" ออกจากระบบและหน้าวิเคราะห์`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEVEL 4: แผงแสดงข้อมูล DATASET ที่มีอยู่ภายใต้การ SYNERGY ของหัวข้อนั้น
              พร้อมปุ่ม: ลบออกได้, เพิ่มเข้าไปใหม่ได้ (Drag-Drop/Pool), และปุ่ม Synergy ใหม่อีกครั้ง */}
          {currentInitiative && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '22px',
                padding: '24px 28px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 6px 24px rgba(0,0,0,0.04)',
                marginBottom: '26px'
              }}
            >
              {/* Header of the Selected Synergy Initiative */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderBottom: '1.5px solid #f1f5f9',
                  paddingBottom: '18px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ flex: 1, minWidth: '320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#0284c7',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 800
                      }}
                    >
                      มิติ: {currentDimension.title}
                    </span>

                    <span
                      style={{
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 800
                      }}
                    >
                      ความเข้ากันได้ {currentInitiative.compatibilityScore}%
                    </span>

                    <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      Synergy ล่าสุดเมื่อ: {currentInitiative.lastSynergizedAt}
                    </span>
                  </div>

                  <h2 style={{ margin: '0 0 6px', fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>
                    {currentInitiative.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                    {currentInitiative.summaryHeadline}
                  </p>
                </div>

                {/* ACTION BUTTONS: ลบหัวข้อ, เพิ่มข้อมูลใหม่ (Drag-Drop / Pool), ปุ่ม Synergy ใหม่อีกครั้ง */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Button 0: ลบหัวข้อ Synergy นี้ */}
                  <button
                    type="button"
                    onClick={() => handleDeleteInitiative(currentInitiative.id, currentInitiative.title)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#fff1f2',
                      color: '#e11d48',
                      border: '1.5px solid #fecdd3',
                      borderRadius: '12px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="ลบหัวข้อ Synergy นี้ออกจากระบบและหน้าวิเคราะห์"
                  >
                    <Trash2 size={15} />
                    <span>🗑️ ลบหัวข้อ Synergy นี้</span>
                  </button>

                  {/* Button 1: เพิ่มข้อมูลเข้าสู่ Synergy */}
                  <button
                    type="button"
                    onClick={() => setIsAddDatasetModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#eff6ff',
                      color: '#0284c7',
                      border: '1.5px solid #bfdbfe',
                      borderRadius: '12px',
                      padding: '10px 18px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="เพิ่มชุดข้อมูลใหม่เข้าสู่ Synergy นี้ (Drag & Drop หรือเลือกจาก Pool กลาง)"
                  >
                    <Plus size={16} />
                    <span>➕ เพิ่มชุดข้อมูล (Drag-Drop / Pool)</span>
                  </button>

                  {/* Button 2: ปุ่ม Synergy ใหม่อีกครั้ง */}
                  <button
                    type="button"
                    onClick={handleReSynergy}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 20px',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                    title="ประเมินความเข้ากันได้และสังเคราะห์ความสัมพันธ์รอบใหม่"
                  >
                    <RefreshCw size={15} />
                    <span>🔄 Synergy ใหม่อีกครั้ง</span>
                  </button>
                </div>
              </div>

              {/* DATASET CARDS UNDER THIS SYNERGY INITIATIVE: DUAL-ZONE (LEFT: INTERNAL vs RIGHT: EXTERNAL) */}
              <div style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 800,
                    color: '#334155',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px' }}>⚖️</span>
                    <span>ตารางข้อมูลที่ใช้ในการ Synergy แบ่งโซนซ้าย-ขวา ({initiativeDatasets.length} ตารางทั้งหมด):</span>
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    💡 คลิกการ์ดตารางฝั่งซ้ายหรือขวาเพื่อดูข้อมูลจริงในตารางพรีวิวด้านล่าง
                  </span>
                </div>

                {/* DUAL ZONE CONTAINER: 2-COLUMN GRID (LEFT: INTERNAL / RIGHT: EXTERNAL) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
                    gap: '20px',
                    alignItems: 'stretch'
                  }}
                >
                  {/* =================================================================
                      ZONE 1 (ฝั่งซ้าย): ข้อมูลของศูนย์คุณธรรม / ข้อมูลภายใน (INTERNAL)
                  ================================================================= */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '20px',
                      border: '2px solid #bfdbfe',
                      boxShadow: '0 4px 16px rgba(2, 132, 199, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Zone Header */}
                    <div
                      style={{
                        padding: '14px 18px',
                        backgroundColor: '#eff6ff',
                        borderBottom: '1.5px solid #dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                          }}
                        >
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                backgroundColor: '#0284c7',
                                color: '#ffffff',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '1px 7px',
                                borderRadius: '8px'
                              }}
                            >
                              ฝั่งซ้าย • ข้อมูลภายใน
                            </span>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e3a8a' }}>
                              ข้อมูลศูนย์คุณธรรม (องค์กรมหาชน)
                            </h4>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            ฐานข้อมูลหลักด้านพฤติกรรมคุณธรรมและการขับเคลื่อนเชิงพื้นที่
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          backgroundColor: '#dbeafe',
                          color: '#0369a1',
                          fontSize: '12px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '10px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {internalDatasets.length} ตาราง
                      </span>
                    </div>

                    {/* Zone Body: Cards or Empty */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                      {internalDatasets.length === 0 ? (
                        <div
                          style={{
                            padding: '30px 20px',
                            textAlign: 'center',
                            backgroundColor: '#ffffff',
                            borderRadius: '14px',
                            border: '1.5px dashed #cbd5e1',
                            color: '#64748b',
                            fontSize: '13px'
                          }}
                        >
                          ยังไม่มีชุดข้อมูลภายในของศูนย์คุณธรรมผูกอยู่ใน Synergy นี้
                        </div>
                      ) : (
                        internalDatasets.map((ds) => {
                          const isSelected = ds.id === selectedTableId;
                          return (
                            <div
                              key={ds.id}
                              onClick={() => setSelectedTableId(ds.id)}
                              style={{
                                backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                                borderRadius: '16px',
                                padding: '16px',
                                border: isSelected ? '2px solid #0284c7' : '1.5px solid #e2e8f0',
                                boxShadow: isSelected
                                  ? '0 6px 18px rgba(2, 132, 199, 0.16)'
                                  : '0 2px 6px rgba(0,0,0,0.03)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span
                                  style={{
                                    backgroundColor: '#eff6ff',
                                    color: '#0284c7',
                                    border: '1px solid #bfdbfe',
                                    padding: '1px 8px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: 800
                                  }}
                                >
                                  ข้อมูลภายใน (Internal)
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTable(ds.id);
                                  }}
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    backgroundColor: '#fff1f2',
                                    border: '1px solid #fecdd3',
                                    color: '#e11d48',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                  title="ลบชุดข้อมูลนี้ออกจากการ Synergy"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              <div>
                                <h5
                                  style={{
                                    margin: '0 0 3px',
                                    fontSize: '14.5px',
                                    fontWeight: 800,
                                    color: isSelected ? '#0284c7' : '#0f172a'
                                  }}
                                >
                                  {ds.name}
                                </h5>
                                <div style={{ fontSize: '11px', color: '#0284c7', fontFamily: 'monospace' }}>
                                  ตาราง: {ds.id}
                                </div>
                              </div>

                              <p
                                style={{
                                  margin: 0,
                                  fontSize: '12px',
                                  color: '#64748b',
                                  lineHeight: 1.4,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {ds.description}
                              </p>

                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  borderTop: '1px solid #f1f5f9',
                                  paddingTop: '8px',
                                  marginTop: 'auto',
                                  fontSize: '11.5px',
                                  color: '#475569'
                                }}
                              >
                                <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {ds.sourceAgency}
                                </span>

                                {isSelected ? (
                                  <span style={{ color: '#0284c7', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
                                    กำลังดูตารางนี้
                                  </span>
                                ) : (
                                  <span style={{ color: '#0284c7', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                    <span>ดูตารางจริง</span>
                                    <ChevronRight size={13} />
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* =================================================================
                      ZONE 2 (ฝั่งขวา): ข้อมูลหน่วยงานภายนอก / ข้อมูลภายนอก (EXTERNAL)
                  ================================================================= */}
                  <div
                    style={{
                      backgroundColor: '#fffdfd',
                      borderRadius: '20px',
                      border: '2px solid #fecdd3',
                      boxShadow: '0 4px 16px rgba(225, 29, 72, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Zone Header */}
                    <div
                      style={{
                        padding: '14px 18px',
                        backgroundColor: '#fff1f2',
                        borderBottom: '1.5px solid #ffe4e6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            backgroundColor: '#e11d48',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)'
                          }}
                        >
                          <Globe size={18} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                backgroundColor: '#e11d48',
                                color: '#ffffff',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '1px 7px',
                                borderRadius: '8px'
                              }}
                            >
                              ฝั่งขวา • ข้อมูลภายนอก
                            </span>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#9f1239' }}>
                              ข้อมูลหน่วยงานภายนอกพันธมิตร
                            </h4>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            ตัวชี้วัด สถิติ และฐานข้อมูลเชิงประจักษ์จากกระทรวงและหน่วยงานภายนอก
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setIsAddDatasetModalOpen(true)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#ffffff',
                            color: '#e11d48',
                            border: '1.5px solid #fecdd3',
                            borderRadius: '10px',
                            padding: '4px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(225, 29, 72, 0.08)'
                          }}
                          title="เพิ่มข้อมูลภายนอกเข้าสู่ Synergy นี้ (Drag-Drop / Central Pool)"
                        >
                          <Plus size={13} />
                          <span>เพิ่มข้อมูล</span>
                        </button>

                        <span
                          style={{
                            backgroundColor: '#ffe4e6',
                            color: '#9f1239',
                            fontSize: '12px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '10px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {externalDatasets.length} ตาราง
                        </span>
                      </div>
                    </div>

                    {/* Zone Body: Cards or Empty */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                      {externalDatasets.length === 0 ? (
                        <div
                          style={{
                            padding: '30px 20px',
                            textAlign: 'center',
                            backgroundColor: '#ffffff',
                            borderRadius: '14px',
                            border: '1.5px dashed #fecdd3',
                            color: '#9f1239',
                            fontSize: '13px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>ยังไม่มีชุดข้อมูลภายนอกผูกอยู่ใน Synergy นี้</span>
                          <button
                            type="button"
                            onClick={() => setIsAddDatasetModalOpen(true)}
                            style={{
                              backgroundColor: '#e11d48',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '6px 14px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            + เพิ่มชุดข้อมูลภายนอก (Drag-Drop / Pool)
                          </button>
                        </div>
                      ) : (
                        externalDatasets.map((ds) => {
                          const isSelected = ds.id === selectedTableId;
                          return (
                            <div
                              key={ds.id}
                              onClick={() => setSelectedTableId(ds.id)}
                              style={{
                                backgroundColor: isSelected ? '#fff1f2' : '#ffffff',
                                borderRadius: '16px',
                                padding: '16px',
                                border: isSelected ? '2px solid #e11d48' : '1.5px solid #fecdd3',
                                boxShadow: isSelected
                                  ? '0 6px 18px rgba(225, 29, 72, 0.16)'
                                  : '0 2px 6px rgba(0,0,0,0.03)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span
                                  style={{
                                    backgroundColor: '#fff1f2',
                                    color: '#e11d48',
                                    border: '1px solid #fecdd3',
                                    padding: '1px 8px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: 800
                                  }}
                                >
                                  ข้อมูลภายนอก (External)
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTable(ds.id);
                                  }}
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    backgroundColor: '#fff1f2',
                                    border: '1px solid #fecdd3',
                                    color: '#e11d48',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                  title="ลบชุดข้อมูลนี้ออกจากการ Synergy"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              <div>
                                <h5
                                  style={{
                                    margin: '0 0 3px',
                                    fontSize: '14.5px',
                                    fontWeight: 800,
                                    color: isSelected ? '#e11d48' : '#0f172a'
                                  }}
                                >
                                  {ds.name}
                                </h5>
                                <div style={{ fontSize: '11px', color: '#e11d48', fontFamily: 'monospace' }}>
                                  ตาราง: {ds.id}
                                </div>
                              </div>

                              <p
                                style={{
                                  margin: 0,
                                  fontSize: '12px',
                                  color: '#64748b',
                                  lineHeight: 1.4,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {ds.description}
                              </p>

                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  borderTop: '1px solid #f1f5f9',
                                  paddingTop: '8px',
                                  marginTop: 'auto',
                                  fontSize: '11.5px',
                                  color: '#475569'
                                }}
                              >
                                <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: '#9f1239' }}>
                                  {ds.sourceAgency}
                                </span>

                                {isSelected ? (
                                  <span style={{ color: '#e11d48', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e11d48' }} />
                                    กำลังดูตารางนี้
                                  </span>
                                ) : (
                                  <span style={{ color: '#e11d48', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                    <span>ดูตารางจริง</span>
                                    <ChevronRight size={13} />
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 5: ตารางแสดงผลข้อมูลทางด้านล่าง (DATA TABLE PREVIEW) */}
          <div>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                ตารางข้อมูลจริง (Data Table Preview)
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                คลิกเปลี่ยนตารางจากการ์ดด้านบนได้ตลอดเวลา
              </span>
            </div>

            <InteractiveDataTableViewer
              tableName={selectedTableId}
              displayName={selectedMeta.name}
              sourceAgency={selectedMeta.sourceAgency}
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          MODALS
      ===================================================================== */}
      {/* 1. Add Dataset to Synergy Modal (Drag & Drop or Central Pool) */}
      {isAddDatasetModalOpen && currentInitiative && (
        <AddDatasetToInitiativeModal
          initiative={currentInitiative}
          onClose={() => setIsAddDatasetModalOpen(false)}
          onAdded={() => {
            setDomainConfigs(getHierarchicalDomainConfigs());
            setIsAddDatasetModalOpen(false);
            showToast('✨ เพิ่มชุดข้อมูลเข้าสู่ Synergy เรียบร้อยแล้ว');
          }}
        />
      )}

      {/* 2. New Dataset Ingestion Studio */}
      {isNewDatasetStudioOpen && (
        <DatasetImportSynergyStudio
          onClose={() => setIsNewDatasetStudioOpen(false)}
          onPublished={() => {
            setDomainConfigs(getHierarchicalDomainConfigs());
            setIsNewDatasetStudioOpen(false);
            showToast('🎉 นำเข้าและเชื่อมโยงชุดข้อมูลใหม่สำเร็จ!');
          }}
        />
      )}

      {/* 3. Create Synergy Initiative Modal (Full CRUD Synced to Analysis Page) */}
      {isCreateInitiativeModalOpen && currentDimension && (
        <CreateSynergyInitiativeModal
          domainId={activeDomainId}
          dimension={currentDimension}
          onClose={() => setIsCreateInitiativeModalOpen(false)}
          onCreated={(newInit) => {
            const updated = getHierarchicalDomainConfigs();
            setDomainConfigs(updated);
            setActiveInitiativeId(newInit.id);
            setIsCreateInitiativeModalOpen(false);
            showToast(`🎉 เพิ่มหัวข้อ Synergy "${newInit.title}" สำเร็จและซิงก์ไปยังหน้าวิเคราะห์แล้ว`);
          }}
        />
      )}
    </div>
  );
};
