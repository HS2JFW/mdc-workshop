import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Database,
  Plus,
  Link as LinkIcon,
  Search,
  X,
  CheckCircle2,
  ExternalLink,
  Tag,
  Building,
  Sparkles,
  RefreshCw,
  FolderPlus,
  Trash2,
  Table as TableIcon
} from 'lucide-react';
import {
  MASTER_PAGES_REGISTRY,
  getCentralPoolDatasets,
  addDatasetToCentralPool,
  linkDatasetToPage,
  unlinkDatasetFromPage,
  onCentralPoolChange,
  type DatasetPoolItem,
  type PageMetaItem
} from '../data/centralDatasetPoolService';

interface AdminDatasetPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePage?: (pageId: string) => void;
  onOpenDatabaseTable?: (tableName: string, pageId?: string) => void;
}

export const AdminDatasetPoolModal: React.FC<AdminDatasetPoolModalProps> = ({
  isOpen,
  onClose,
  onNavigatePage,
  onOpenDatabaseTable
}) => {
  const [activeTab, setActiveTab] = useState<'pool' | 'synergy'>('pool');
  const [datasets, setDatasets] = useState<DatasetPoolItem[]>(() => getCentralPoolDatasets());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State: Add Dataset to Pool
  const [isAddDatasetOpen, setIsAddDatasetOpen] = useState<boolean>(false);
  const [formId, setFormId] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('คุณธรรมหลัก');
  const [formSourceType, setFormSourceType] = useState<'DuckDB' | 'SQLite' | 'External API' | 'CSV/Excel'>('CSV/Excel');
  const [formSourceAgency, setFormSourceAgency] = useState<string>('ศูนย์คุณธรรม (องค์การมหาชน)');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formLinkedPages, setFormLinkedPages] = useState<string[]>([]);
  const [formRowCount, setFormRowCount] = useState<number>(50);

  // Modal State: Link Dataset to Page
  const [linkingTargetPage, setLinkingTargetPage] = useState<PageMetaItem | null>(null);
  const [selectedDatasetToLink, setSelectedDatasetToLink] = useState<string>('');

  // Sync on central pool change
  useEffect(() => {
    const unsub = onCentralPoolChange(() => {
      setDatasets(getCentralPoolDatasets());
    });
    return unsub;
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    datasets.forEach((d) => set.add(d.category));
    return ['all', ...Array.from(set)];
  }, [datasets]);

  const filteredDatasets = useMemo(() => {
    let list = [...datasets];
    if (categoryFilter !== 'all') {
      list = list.filter((d) => d.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.sourceAgency.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [datasets, categoryFilter, searchQuery]);

  const handleOpenAddDataset = () => {
    setFormId(`dataset_${Date.now().toString().slice(-4)}`);
    setFormName('');
    setFormCategory('คุณธรรมหลัก');
    setFormSourceType('CSV/Excel');
    setFormSourceAgency('ศูนย์คุณธรรม (องค์การมหาชน)');
    setFormDescription('');
    setFormLinkedPages(['policy-1-1']);
    setFormRowCount(50);
    setIsAddDatasetOpen(true);
  };

  const handleSaveAddDataset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    addDatasetToCentralPool({
      id: formId.trim() || `dataset_${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      sourceType: formSourceType,
      sourceAgency: formSourceAgency,
      description: formDescription,
      linkedPageIds: formLinkedPages,
      rowCount: formRowCount
    });

    setDatasets(getCentralPoolDatasets());
    setIsAddDatasetOpen(false);
  };

  const handleOpenLinkModal = (page: PageMetaItem) => {
    setLinkingTargetPage(page);
    // Find first dataset not yet linked
    const notLinked = datasets.find((d) => !d.linkedPageIds.includes(page.pageId));
    setSelectedDatasetToLink(notLinked ? notLinked.id : '');
  };

  const handleConfirmLink = () => {
    if (!linkingTargetPage || !selectedDatasetToLink) return;
    linkDatasetToPage(linkingTargetPage.pageId, selectedDatasetToLink);
    setDatasets(getCentralPoolDatasets());
    setLinkingTargetPage(null);
  };

  const handleUnlink = (pageId: string, datasetId: string) => {
    unlinkDatasetFromPage(pageId, datasetId);
    setDatasets(getCentralPoolDatasets());
  };

  if (!isOpen) return null;

  return (
    <div
      className="admin-dataset-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="admin-dataset-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '96%',
          maxWidth: '1380px',
          height: '92vh',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          borderRadius: '24px',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 50px rgba(56, 189, 248, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Kanit', sans-serif"
        }}
      >
        {/* ===================================================================
            HEADER: Title & Tab Switcher
        =================================================================== */}
        <div
          style={{
            padding: '18px 26px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(56, 189, 248, 0.3)'
              }}
            >
              <Layers size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                  คลังชุดข้อมูลกลาง & ผังเชื่อมโยง Synergy (Central Dataset Pool)
                </h2>
                <span
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '20px',
                    padding: '2px 10px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  Admin Master Pool
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                บริหารจัดการ Dataset ทั้งหมดใน Pool กลาง และกำหนดการเชื่อมโยงข้อมูลสู่ Page ต่างๆ ในระบบ
              </p>
            </div>
          </div>

          {/* Tab Selector & Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '3px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('pool')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: activeTab === 'pool' ? '#0284c7' : 'transparent',
                  color: activeTab === 'pool' ? '#ffffff' : '#cbd5e1',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Database size={15} />
                <span>ชุดข้อมูลใน Pool กลาง ({datasets.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('synergy')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: activeTab === 'synergy' ? '#0284c7' : 'transparent',
                  color: activeTab === 'synergy' ? '#ffffff' : '#cbd5e1',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Sparkles size={15} />
                <span>หน้า Synergy (เชื่อมโยงตาม Page)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              title="ปิดหน้าต่าง"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ===================================================================
            BODY CONTENT
        =================================================================== */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '20px 24px',
            gap: '18px'
          }}
        >
          {/* TAB 1: CENTRAL POOL VIEW */}
          {activeTab === 'pool' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Pool Toolbar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Search */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.9)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '10px',
                      padding: '7px 14px'
                    }}
                  >
                    <Search size={15} color="#94a3b8" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาชื่อ Dataset หรือรหัสตาราง..."
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#ffffff',
                        fontSize: '13px',
                        width: '240px',
                        fontFamily: 'inherit'
                      }}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {categories.slice(0, 7).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        style={{
                          backgroundColor: categoryFilter === cat ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                          color: categoryFilter === cat ? '#ffffff' : '#94a3b8',
                          border: categoryFilter === cat ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {cat === 'all' ? 'ทุกหมวดหมู่' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Dataset Button */}
                <button
                  type="button"
                  onClick={handleOpenAddDataset}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 18px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    transition: 'all 0.15s'
                  }}
                >
                  <Plus size={16} />
                  <span>เพิ่ม Dataset ลงใน Pool กลาง</span>
                </button>
              </div>

              {/* Pool Datasets Table */}
              <div
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '16px',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ overflowX: 'auto', maxHeight: '560px' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '13px',
                      fontFamily: "'Kanit', sans-serif"
                    }}
                  >
                    <thead
                      style={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: '#0f172a',
                        zIndex: 10,
                        borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
                      }}
                    >
                      <tr>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>
                          ชื่อชุดข้อมูล (Dataset Name)
                        </th>
                        <th style={{ padding: '12px 14px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>
                          รหัสตาราง (Table ID)
                        </th>
                        <th style={{ padding: '12px 14px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>
                          หมวดหมู่
                        </th>
                        <th style={{ padding: '12px 14px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>
                          แหล่งข้อมูล (Source)
                        </th>
                        <th style={{ padding: '12px 14px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>
                          หน่วยงานต้นทาง
                        </th>
                        <th style={{ padding: '12px 14px', textAlign: 'right', color: '#94a3b8', fontWeight: 700 }}>
                          จำนวนแถว
                        </th>
                        <th style={{ padding: '12px 14px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>
                          หน้าที่เชื่อมโยง (Pages)
                        </th>
                        <th style={{ padding: '12px 14px', textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>
                          เรียกดู
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDatasets.map((d, idx) => (
                        <tr
                          key={d.id}
                          style={{
                            backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                            borderBottom: '1px solid rgba(148, 163, 184, 0.08)'
                          }}
                        >
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{d.name}</span>
                              {d.isCustomAdded && (
                                <span
                                  style={{
                                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                    color: '#10b981',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px'
                                  }}
                                >
                                  กำหนดเอง
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 400 }}>
                              {d.description}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '12px' }}>
                            {d.id}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>
                            <span
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px'
                              }}
                            >
                              {d.category}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                backgroundColor:
                                  d.sourceType === 'DuckDB'
                                    ? 'rgba(234, 179, 8, 0.15)'
                                    : d.sourceType === 'SQLite'
                                    ? 'rgba(56, 189, 248, 0.15)'
                                    : 'rgba(168, 85, 247, 0.15)',
                                color:
                                  d.sourceType === 'DuckDB'
                                    ? '#facc15'
                                    : d.sourceType === 'SQLite'
                                    ? '#38bdf8'
                                    : '#c084fc',
                                borderRadius: '6px',
                                padding: '2px 8px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}
                            >
                              {d.sourceType}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '12px' }}>
                            {d.sourceAgency}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                            {d.rowCount.toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {d.linkedPageIds.map((pid) => {
                                const pMeta = MASTER_PAGES_REGISTRY.find((p) => p.pageId === pid);
                                return (
                                  <span
                                    key={pid}
                                    style={{
                                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                      color: '#38bdf8',
                                      border: '1px solid rgba(56, 189, 248, 0.25)',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontSize: '10.5px'
                                    }}
                                  >
                                    {pMeta ? pMeta.pageTitle.split(' ')[0] : pid}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            {onOpenDatabaseTable && (
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenDatabaseTable(d.id, d.linkedPageIds[0]);
                                }}
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  color: '#38bdf8',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  cursor: 'pointer'
                                }}
                                title="เปิดดูชุดข้อมูลในตาราง"
                              >
                                ตรวจสอบ
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYNERGY VIEW (แสดงว่าหน้านั้นเชื่อมกับ Dataset อะไรใน pool) */}
          {activeTab === 'synergy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                    ผังความสัมพันธ์ Synergy ประจำหน้า (Page to Central Pool Lineage)
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
                    ตรวจสอบว่าแต่ละหน้าในระบบเชื่อมโยงกับ Dataset ใดบ้างใน Pool กลาง และสามารถเพิ่ม/ปลดการเชื่อมโยงได้
                  </p>
                </div>
              </div>

              {/* Grid of Page Synergy Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
                  gap: '16px'
                }}
              >
                {MASTER_PAGES_REGISTRY.map((page) => {
                  // Find datasets linked to this page
                  const linkedDatasets = datasets.filter((d) => d.linkedPageIds.includes(page.pageId));

                  return (
                    <div
                      key={page.pageId}
                      style={{
                        backgroundColor: '#1e293b',
                        borderRadius: '16px',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        padding: '16px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      {/* Page Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              backgroundColor: 'rgba(2, 132, 199, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#38bdf8'
                            }}
                          >
                            <TableIcon size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                              {page.pageTitle}
                            </div>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {page.category} | {linkedDatasets.length} Datasets เชื่อมโยง
                            </span>
                          </div>
                        </div>

                        {/* Add Dataset to Page Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenLinkModal(page)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title={`เพิ่ม Dataset จาก Pool กลางลงในหน้า ${page.pageTitle}`}
                        >
                          <Plus size={13} />
                          <span>เชื่อมโยง Dataset</span>
                        </button>
                      </div>

                      <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                        {page.description}
                      </div>

                      {/* Linked Datasets Pill List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#cbd5e1' }}>
                          ชุดข้อมูลใน Pool กลางที่หน้านี้เชื่อมต่ออยู่:
                        </div>
                        {linkedDatasets.length === 0 ? (
                          <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                            ยังไม่มี Dataset ที่ผูกไว้ กดปุ่ม &quot;เชื่อมโยง Dataset&quot; เพื่อเพิ่ม
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {linkedDatasets.map((ds) => (
                              <div
                                key={ds.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                  border: '1px solid rgba(148, 163, 184, 0.25)',
                                  borderRadius: '8px',
                                  padding: '4px 8px',
                                  fontSize: '11.5px'
                                }}
                              >
                                <span
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: ds.sourceType === 'DuckDB' ? '#facc15' : '#38bdf8'
                                  }}
                                />
                                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{ds.name}</span>
                                <span style={{ color: '#64748b', fontSize: '10px' }}>({ds.sourceType})</span>
                                <button
                                  type="button"
                                  onClick={() => handleUnlink(page.pageId, ds.id)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '0 2px'
                                  }}
                                  title="ยกเลิกการเชื่อมโยงจากหน้านี้"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            SUB-MODAL: ADD DATASET TO CENTRAL POOL
        =================================================================== */}
        {isAddDatasetOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(5px)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setIsAddDatasetOpen(false)}
          >
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1.5px solid rgba(16, 185, 129, 0.5)',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '560px',
                padding: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                color: '#ffffff'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FolderPlus size={20} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                    เพิ่ม Dataset ลงใน Pool กลาง
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddDatasetOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveAddDataset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', color: '#94a3b8', marginBottom: '5px' }}>
                    ชื่อชุดข้อมูล (Dataset Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="เช่น สถิติการมีส่วนร่วมในกิจกรรมส่งเสริมคุณธรรม"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', color: '#94a3b8', marginBottom: '5px' }}>
                      รหัสตาราง (Table ID)
                    </label>
                    <input
                      type="text"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder="custom_table_key"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '8px',
                        color: '#38bdf8',
                        fontFamily: 'monospace',
                        fontSize: '12.5px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', color: '#94a3b8', marginBottom: '5px' }}>
                      หมวดหมู่ข้อมูล
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="เช่น คุณธรรมหลัก, กิจกรรม"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', color: '#94a3b8', marginBottom: '5px' }}>
                      ประเภทแหล่งข้อมูล (Source Type)
                    </label>
                    <select
                      value={formSourceType}
                      onChange={(e: any) => setFormSourceType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="DuckDB">DuckDB</option>
                      <option value="SQLite">SQLite</option>
                      <option value="External API">External API</option>
                      <option value="CSV/Excel">CSV / Excel Import</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', color: '#94a3b8', marginBottom: '5px' }}>
                      หน่วยงานเจ้าของข้อมูล
                    </label>
                    <input
                      type="text"
                      value={formSourceAgency}
                      onChange={(e) => setFormSourceAgency(e.target.value)}
                      placeholder="เช่น ศูนย์คุณธรรม (องค์การมหาชน)"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', color: '#94a3b8', marginBottom: '5px' }}>
                    คำอธิบายชุดข้อมูล
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="รายละเอียดและวัตถุประสงค์ของชุดข้อมูล..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', color: '#94a3b8', marginBottom: '6px' }}>
                    เชื่อมโยงกับ Page ทันที (เลือกหน้า):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {MASTER_PAGES_REGISTRY.map((p) => {
                      const checked = formLinkedPages.includes(p.pageId);
                      return (
                        <label
                          key={p.pageId}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: checked ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: checked ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '11.5px',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormLinkedPages([...formLinkedPages, p.pageId]);
                              } else {
                                setFormLinkedPages(formLinkedPages.filter((x) => x !== p.pageId));
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{p.pageTitle.split(' ')[0]}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddDatasetOpen(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: '#cbd5e1',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#10b981',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    บันทึกเข้าสู่ Pool กลาง
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-MODAL: LINK DATASET TO PAGE
        =================================================================== */}
        {linkingTargetPage && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(5px)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setLinkingTargetPage(null)}
          >
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1.5px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '480px',
                padding: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                color: '#ffffff'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LinkIcon size={18} color="#38bdf8" />
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                    เชื่อมโยง Dataset เข้าสู่หน้า
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkingTargetPage(null)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#cbd5e1' }}>
                เลือก Dataset จาก Pool กลางเพื่อเชื่อมโยงเข้าสู่หน้า <strong>&quot;{linkingTargetPage.pageTitle}&quot;</strong>
              </p>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', color: '#94a3b8', marginBottom: '6px' }}>
                  เลือก Dataset จาก Pool กลาง:
                </label>
                <select
                  value={selectedDatasetToLink}
                  onChange={(e) => setSelectedDatasetToLink(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {datasets
                    .filter((d) => !d.linkedPageIds.includes(linkingTargetPage.pageId))
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        [{d.sourceType}] {d.name} ({d.rowCount} แถว)
                      </option>
                    ))}
                </select>
                {datasets.filter((d) => !d.linkedPageIds.includes(linkingTargetPage.pageId)).length === 0 && (
                  <span style={{ fontSize: '11.5px', color: '#facc15', marginTop: '4px', display: 'block' }}>
                    หน้านี้เชื่อมโยงกับทุก Dataset ใน Pool กลางแล้ว
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setLinkingTargetPage(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: '#cbd5e1',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLink}
                  disabled={!selectedDatasetToLink}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: !selectedDatasetToLink ? '#475569' : '#0284c7',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: !selectedDatasetToLink ? 'not-allowed' : 'pointer',
                    boxShadow: !selectedDatasetToLink ? 'none' : '0 4px 14px rgba(2, 132, 199, 0.35)'
                  }}
                >
                  บันทึกการเชื่อมโยง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
