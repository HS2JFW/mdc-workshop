import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  Table as TableIcon,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Download,
  Loader2,
  Layers,
  Network,
  BarChart3,
  HeartHandshake,
  MapPin,
  GraduationCap,
  Coins,
  Activity,
  Award,
  FolderKanban,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sparkles,
  Server,
  HardDrive
} from 'lucide-react';
import {
  MASTER_PAGES_REGISTRY,
  fetchUnifiedTableData,
  getTableDatabaseEngine,
  type PageMetaItem,
  type UnifiedTableDataResult,
  type DatabaseEngineType
} from '../data/centralDatasetPoolService';

interface AdminDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePage?: (pageId: string) => void;
  initialTable?: string;
  initialPageId?: string;
}

export const AdminDatabaseModal: React.FC<AdminDatabaseModalProps> = ({
  isOpen,
  onClose,
  onNavigatePage,
  initialTable,
  initialPageId
}) => {
  const [activeDomainTab, setActiveDomainTab] = useState<'all' | 'synergy' | 'activity'>('synergy');
  const [selectedPageId, setSelectedPageId] = useState<string>(
    initialPageId || MASTER_PAGES_REGISTRY[0].pageId
  );
  const [selectedTableName, setSelectedTableName] = useState<string>(
    initialTable || MASTER_PAGES_REGISTRY[0].relatedTableNames[0]
  );
  const [tableDataResult, setTableDataResult] = useState<UnifiedTableDataResult | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('all');

  // Sync initial selection
  useEffect(() => {
    if (initialPageId) {
      setSelectedPageId(initialPageId);
      const foundPage = MASTER_PAGES_REGISTRY.find((p) => p.pageId === initialPageId);
      if (foundPage) {
        if (foundPage.sectionGroup) {
          setActiveDomainTab(foundPage.sectionGroup);
        }
        if (foundPage.relatedTableNames.length > 0) {
          setSelectedTableName(initialTable || foundPage.relatedTableNames[0]);
        }
      }
    } else if (initialTable) {
      setSelectedTableName(initialTable);
      const foundPage = MASTER_PAGES_REGISTRY.find((p) => p.relatedTableNames.includes(initialTable));
      if (foundPage) {
        setSelectedPageId(foundPage.pageId);
        if (foundPage.sectionGroup) {
          setActiveDomainTab(foundPage.sectionGroup);
        }
      }
    }
  }, [initialPageId, initialTable]);

  // Load table data when selectedTableName changes
  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      setIsLoadingData(true);
      setSearchQuery('');
      setSelectedProvinceFilter('all');
      setCurrentPage(1);
      try {
        const res = await fetchUnifiedTableData(selectedTableName);
        if (!isCancelled) {
          setTableDataResult(res);
        }
      } catch (err) {
        console.error('Error fetching table data:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingData(false);
        }
      }
    };
    if (isOpen && selectedTableName) {
      load();
    }
    return () => {
      isCancelled = true;
    };
  }, [isOpen, selectedTableName]);

  // Check if current table has a province column
  const hasProvinceColumn = useMemo(() => {
    return (
      tableDataResult?.columns.some(
        (c) => c.name.toLowerCase() === 'province' || c.name.toLowerCase() === 'จังหวัด'
      ) ?? false
    );
  }, [tableDataResult]);

  // Filtered and sorted rows
  const processedRows = useMemo(() => {
    if (!tableDataResult || !tableDataResult.rows) return [];
    let rows = [...tableDataResult.rows];

    // Filter by province if selected
    if (hasProvinceColumn && selectedProvinceFilter !== 'all') {
      rows = rows.filter((row) => {
        const provVal = String(row.province || row['จังหวัด'] || '').trim();
        return provVal.toLowerCase().includes(selectedProvinceFilter.toLowerCase());
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter((row) =>
        Object.values(row).some((val) =>
          String(val ?? '').toLowerCase().includes(q)
        )
      );
    }

    if (sortCol) {
      rows.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA ?? '').localeCompare(String(valB ?? ''))
          : String(valB ?? '').localeCompare(String(valA ?? ''));
      });
    }

    return rows;
  }, [tableDataResult, selectedProvinceFilter, hasProvinceColumn, searchQuery, sortCol, sortAsc]);

  // Pagination calculation
  const totalRowsCount = processedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRowsCount / rowsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedRows.slice(start, start + rowsPerPage);
  }, [processedRows, currentPage, rowsPerPage]);

  const handleSelectTable = (pageId: string, tableName: string) => {
    setSelectedPageId(pageId);
    setSelectedTableName(tableName);
  };

  const handleExportCsv = () => {
    if (!tableDataResult || !tableDataResult.rows || tableDataResult.rows.length === 0) return;
    const cols = tableDataResult.columns.map((c) => c.name);
    const csvHeader = cols.join(',');
    const csvRows = tableDataResult.rows.map((row) =>
      cols
        .map((col) => {
          const val = row[col] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = '\uFEFF' + [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTableName}_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderPageIcon = (iconName: string) => {
    const props = { size: 18, color: '#38bdf8' };
    switch (iconName) {
      case 'Network': return <Network {...props} />;
      case 'BarChart3': return <BarChart3 {...props} />;
      case 'HeartHandshake': return <HeartHandshake {...props} />;
      case 'MapPin': return <MapPin {...props} />;
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'Coins': return <Coins {...props} />;
      case 'Activity': return <Activity {...props} />;
      case 'Award': return <Award {...props} />;
      case 'FolderKanban': return <FolderKanban {...props} />;
      default: return <TableIcon {...props} />;
    }
  };

  const activePageMeta = MASTER_PAGES_REGISTRY.find((p) => p.pageId === selectedPageId);

  const currentTableEngine: DatabaseEngineType = useMemo(() => {
    return tableDataResult?.engine || getTableDatabaseEngine(selectedTableName);
  }, [tableDataResult, selectedTableName]);

  const filteredPages = useMemo(() => {
    if (activeDomainTab === 'all') return MASTER_PAGES_REGISTRY;
    return MASTER_PAGES_REGISTRY.filter((p) => p.sectionGroup === activeDomainTab);
  }, [activeDomainTab]);

  const renderEngineBadge = (engine: DatabaseEngineType | string, compact = false) => {
    const isPostgres = engine === 'PostgreSQL' || engine.includes('PostgreSQL');
    const isDuckDb = engine === 'DuckDB' || engine.includes('DuckDB');
    const isSqlite = engine === 'SQLite' || engine.includes('SQLite');

    let bg = 'rgba(99, 102, 241, 0.2)';
    let border = '1px solid rgba(129, 140, 248, 0.45)';
    let color = '#a5b4fc';
    let label = 'PostgreSQL 16 (DB-MDC)';
    let icon = '🐘';

    if (isDuckDb) {
      bg = 'rgba(245, 158, 11, 0.18)';
      border = '1px solid rgba(245, 158, 11, 0.45)';
      color = '#fbbf24';
      label = 'DuckDB (Analytical)';
      icon = '🦆';
    } else if (isSqlite) {
      bg = 'rgba(16, 185, 129, 0.18)';
      border = '1px solid rgba(16, 185, 129, 0.45)';
      color = '#34d399';
      label = 'SQLite (Local Edge)';
      icon = '🗄️';
    }

    if (compact) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            backgroundColor: bg,
            color,
            border,
            borderRadius: '5px',
            padding: '1px 5px',
            fontSize: '9.5px',
            fontWeight: 700,
            lineHeight: 1.2
          }}
          title={label}
        >
          <span>{icon}</span>
          <span>{isPostgres ? 'Postgres' : isDuckDb ? 'DuckDB' : 'SQLite'}</span>
        </span>
      );
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: bg,
          color,
          border,
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: 700
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="admin-db-modal-overlay"
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
        className="admin-db-modal-container"
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
            HEADER: Title & Meta Info
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
              <Database size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                  ฐานข้อมูลและตารางประจำหน้า (Database & Page Tables)
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
                  Admin Master View
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                คลิกเลือก Card ของแต่ละหน้าเพื่อดูรายชื่อ Table ที่เกี่ยวข้อง และเรียกดูชุดข้อมูล (Data Records) ด้านล่าง
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activePageMeta && onNavigatePage && (
              <button
                type="button"
                onClick={() => {
                  onNavigatePage(activePageMeta.pageId);
                  onClose();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title={`ข้ามไปยังหน้า ${activePageMeta.pageTitle}`}
              >
                <ExternalLink size={14} />
                <span>เปิดหน้านี้ในระบบ</span>
              </button>
            )}

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
            CONTENT BODY: Scrollable Split View
        =================================================================== */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '20px 24px',
            gap: '20px'
          }}
        >
          {/* DOMAIN NAVIGATION TABS: Moral Synergy vs Activities */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              borderRadius: '16px',
              border: '1.5px solid rgba(148, 163, 184, 0.25)',
              width: 'fit-content',
              flexWrap: 'wrap'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveDomainTab('synergy');
                const firstSynergy = MASTER_PAGES_REGISTRY.find((p) => p.sectionGroup === 'synergy');
                if (firstSynergy && (!activePageMeta || activePageMeta.sectionGroup !== 'synergy')) {
                  setSelectedPageId(firstSynergy.pageId);
                  setSelectedTableName(firstSynergy.relatedTableNames[0]);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: activeDomainTab === 'synergy' ? '#0284c7' : 'transparent',
                color: activeDomainTab === 'synergy' ? '#ffffff' : '#94a3b8',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: activeDomainTab === 'synergy' ? '0 4px 14px rgba(2, 132, 199, 0.4)' : 'none'
              }}
            >
              <span>🌐</span>
              <span>Moral Synergy (วิเคราะห์ยุทธศาสตร์ & ดัชนีคุณธรรม)</span>
              <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '10px', backgroundColor: activeDomainTab === 'synergy' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)' }}>
                🦆 DuckDB
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveDomainTab('activity');
                const firstAct = MASTER_PAGES_REGISTRY.find((p) => p.sectionGroup === 'activity');
                if (firstAct && (!activePageMeta || activePageMeta.sectionGroup !== 'activity')) {
                  setSelectedPageId(firstAct.pageId);
                  setSelectedTableName(firstAct.relatedTableNames[0]);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: activeDomainTab === 'activity' ? '#7c3aed' : 'transparent',
                color: activeDomainTab === 'activity' ? '#ffffff' : '#94a3b8',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: activeDomainTab === 'activity' ? '0 4px 14px rgba(124, 58, 237, 0.4)' : 'none'
              }}
            >
              <span>🏆</span>
              <span>กิจกรรมเชิงพื้นที่ & Hackathon (เวิร์กช็อป 4 ภูมิภาค)</span>
              <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '10px', backgroundColor: activeDomainTab === 'activity' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)' }}>
                🐘 PostgreSQL 16
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDomainTab('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: activeDomainTab === 'all' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: activeDomainTab === 'all' ? '#ffffff' : '#64748b',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>📑 ทุกหน้าระบบ ({MASTER_PAGES_REGISTRY.length})</span>
            </button>
          </div>

          {/* SECTION 1: PAGE CARDS GRID */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={17} color="#38bdf8" />
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>
                  {activeDomainTab === 'synergy'
                    ? 'หมวดหมู่ Moral Synergy (แผนยุทธศาสตร์ 20 ปี, 4 ดัชนีหลัก, ทุนชีวิต & DuckDB)'
                    : activeDomainTab === 'activity'
                    ? 'หมวดหมู่ กิจกรรมเชิงพื้นที่ (เวิร์กช็อป 4 จังหวัด, ข้อเสนอโครงการ & PostgreSQL)'
                    : `หน้าระบบทั้งหมด (${MASTER_PAGES_REGISTRY.length} Pages)`} ({filteredPages.length} Pages แสดงผล)
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                * คลิกที่ชื่อ Table ภายในการ์ด เพื่อแสดงชุดข้อมูลด้านล่าง
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))',
                gap: '14px'
              }}
            >
              {filteredPages.map((page) => {
                const isPageActive = page.pageId === selectedPageId;
                return (
                  <div
                    key={page.pageId}
                    style={{
                      backgroundColor: isPageActive ? 'rgba(14, 116, 144, 0.25)' : '#1e293b',
                      borderRadius: '16px',
                      border: isPageActive
                        ? '1.5px solid #06b6d4'
                        : '1px solid rgba(148, 163, 184, 0.15)',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      transition: 'all 0.2s',
                      boxShadow: isPageActive ? '0 8px 24px rgba(6, 182, 212, 0.2)' : 'none'
                    }}
                  >
                    {/* Card Top: Icon & Title */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            backgroundColor: isPageActive ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {renderPageIcon(page.iconName)}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: isPageActive ? '#38bdf8' : '#f8fafc' }}>
                            {page.pageTitle}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                color: page.sectionGroup === 'synergy' ? '#38bdf8' : '#c084fc',
                                backgroundColor: page.sectionGroup === 'synergy' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                                padding: '1px 6px',
                                borderRadius: '6px',
                                fontWeight: 600
                              }}
                            >
                              {page.sectionGroup === 'synergy' ? 'Synergy' : 'กิจกรรม'}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                color: '#94a3b8',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                padding: '1px 6px',
                                borderRadius: '6px'
                              }}
                            >
                              {page.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {onNavigatePage && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigatePage(page.pageId);
                            onClose();
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title={`เปิดหน้า ${page.pageTitle}`}
                        >
                          <ExternalLink size={14} />
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.4, minHeight: '32px' }}>
                      {page.description}
                    </div>

                    {/* Table Pills inside Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>
                        ตารางที่ผูกไว้ ({page.relatedTableNames.length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {page.relatedTableNames.map((tbl) => {
                          const isTableActive = tbl === selectedTableName;
                          const tblEngine = getTableDatabaseEngine(tbl);
                          return (
                            <button
                              key={tbl}
                              type="button"
                              onClick={() => handleSelectTable(page.pageId, tbl)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: isTableActive ? '#0284c7' : 'rgba(255, 255, 255, 0.07)',
                                color: isTableActive ? '#ffffff' : '#94a3b8',
                                border: isTableActive
                                  ? '1px solid #38bdf8'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '3px 8px',
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                              title={`คลิกเพื่อดูชุดข้อมูลของตาราง ${tbl} (${tblEngine})`}
                            >
                              <TableIcon size={11} />
                              <span>{tbl}</span>
                              {renderEngineBadge(tblEngine, true)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===================================================================
              SECTION 2: SUMMARY DASHBOARD CARD & DATA RECORDS VIEWER
          =================================================================== */}
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '20px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* SUMMARY DASHBOARD CARD */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                borderRadius: '16px',
                border: '1.5px solid rgba(56, 189, 248, 0.3)',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
              }}
            >
              {/* Header Row: Domain badge, Table Name, Engine Badge & Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                  paddingBottom: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: activePageMeta?.sectionGroup === 'synergy'
                        ? 'linear-gradient(135deg, #0284c7, #38bdf8)'
                        : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    {activePageMeta ? renderPageIcon(activePageMeta.iconName) : <TableIcon size={20} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: activePageMeta?.sectionGroup === 'synergy'
                            ? 'rgba(56, 189, 248, 0.2)'
                            : 'rgba(168, 85, 247, 0.2)',
                          color: activePageMeta?.sectionGroup === 'synergy' ? '#38bdf8' : '#c084fc',
                          border: `1px solid ${activePageMeta?.sectionGroup === 'synergy' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(168, 85, 247, 0.4)'}`
                        }}
                      >
                        {activePageMeta?.sectionGroup === 'synergy' ? '🌐 Moral Synergy' : '🏆 กิจกรรมเชิงพื้นที่'}
                      </span>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>• {activePageMeta?.pageTitle}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
                        {selectedTableName}
                      </h3>
                      {renderEngineBadge(currentTableEngine)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    disabled={!tableDataResult || !tableDataResult.rows || tableDataResult.rows.length === 0}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: tableDataResult?.rows?.length ? 'pointer' : 'not-allowed',
                      opacity: tableDataResult?.rows?.length ? 1 : 0.5,
                      transition: 'all 0.15s'
                    }}
                    title="ดาวน์โหลดข้อมูลตารางนี้เป็นไฟล์ CSV"
                  >
                    <Download size={14} />
                    <span>ดาวน์โหลด CSV ({processedRows.length})</span>
                  </button>

                  {activePageMeta && onNavigatePage && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigatePage(activePageMeta.pageId);
                        onClose();
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      title={`เปิดไปยังหน้า ${activePageMeta.pageTitle}`}
                    >
                      <ExternalLink size={14} />
                      <span>ไปยังหน้านี้ในระบบ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics Summary Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px'
                }}
              >
                {/* Metric 1: Total Records */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>📊 จำนวนแถวข้อมูล (Total Records)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                    {tableDataResult ? `${tableDataResult.totalRows.toLocaleString()} แถว` : 'กำลังโหลด...'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {searchQuery ? `กรองพบ ${processedRows.length} แถว` : 'ข้อมูลพร้อมใช้งาน'}
                  </div>
                </div>

                {/* Metric 2: Column Fields */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>📋 โครงสร้างคอลัมน์ (Schema Fields)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                    {tableDataResult ? `${tableDataResult.columns.length} คอลัมน์` : '-'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tableDataResult?.columns.slice(0, 3).map(c => c.name).join(', ')}{tableDataResult && tableDataResult.columns.length > 3 ? '...' : ''}
                  </div>
                </div>

                {/* Metric 3: Storage Engine */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>🗄️ ฐานข้อมูลจัดเก็บ (Engine)</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: currentTableEngine === 'PostgreSQL' ? '#a78bfa' : currentTableEngine === 'DuckDB' ? '#fde047' : '#6ee7b7', marginTop: '6px' }}>
                    {currentTableEngine === 'PostgreSQL' ? '🐘 PostgreSQL 16 (DB-MDC)' : currentTableEngine === 'DuckDB' ? '🦆 DuckDB In-Memory' : '🗄️ SQLite Local Edge'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    {currentTableEngine === 'PostgreSQL' ? 'Dual-Engine Server Database' : currentTableEngine === 'DuckDB' ? 'High-Speed Analytic DB' : 'Embedded Local Database'}
                  </div>
                </div>

                {/* Metric 4: Connection & Sync Status */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>⚡ สถานะการเชื่อมต่อ (Sync Status)</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#22c55e', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                    <span>เชื่อมต่อสมบูรณ์ (Online)</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    {activePageMeta?.description.slice(0, 38)}...
                  </div>
                </div>
              </div>
            </div>

            {/* Table Viewer Header: Search & Record Filter Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                paddingBottom: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>
                  รายการข้อมูลในตาราง <code style={{ color: '#38bdf8' }}>{selectedTableName}</code>
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  ({processedRows.length} รายการที่กำลังแสดงผล)
                </span>
              </div>

              {/* Action Controls: Province Filter, Search & CSV Export */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {hasProvinceColumn && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      borderRadius: '10px',
                      padding: '4px 10px'
                    }}
                  >
                    <MapPin size={13} color="#38bdf8" />
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>จังหวัด:</span>
                    <select
                      value={selectedProvinceFilter}
                      onChange={(e) => {
                        setSelectedProvinceFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        backgroundColor: '#1e293b',
                        color: '#f8fafc',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">📍 ทุกจังหวัด (ทั้งหมด)</option>
                      <option value="พระนครศรีอยุธยา">🏛️ พระนครศรีอยุธยา</option>
                      <option value="เชียงราย">🏔️ เชียงราย</option>
                      <option value="อุดรธานี">🌸 อุดรธานี</option>
                      <option value="สุราษฎร์ธานี">🌊 สุราษฎร์ธานี</option>
                    </select>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '10px',
                    padding: '6px 12px'
                  }}
                >
                  <Search size={14} color="#94a3b8" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="ค้นหาข้อมูลในตาราง..."
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      width: '180px',
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

                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={!tableDataResult || tableDataResult.rows.length === 0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: !tableDataResult || tableDataResult.rows.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s'
                  }}
                  title="ดาวน์โหลดชุดข้อมูลเป็น CSV"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table Content Grid */}
            <div
              style={{
                position: 'relative',
                maxHeight: '380px',
                overflowX: 'auto',
                overflowY: 'auto',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)'
              }}
            >
              {isLoadingData ? (
                <div
                  style={{
                    padding: '60px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    color: '#94a3b8'
                  }}
                >
                  <Loader2 size={30} className="animate-spin" color="#38bdf8" />
                  <span style={{ fontSize: '13.5px' }}>กำลังดึงชุดข้อมูลจากฐานข้อมูล...</span>
                </div>
              ) : !tableDataResult || paginatedRows.length === 0 ? (
                <div
                  style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '14px'
                  }}
                >
                  {searchQuery ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหา' : 'ไม่มีข้อมูลในตารางนี้'}
                </div>
              ) : (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12.5px',
                    fontFamily: "'Kanit', sans-serif"
                  }}
                >
                  <thead
                    style={{
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#1e293b',
                      zIndex: 10,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    <tr>
                      <th
                        style={{
                          padding: '10px 14px',
                          textAlign: 'left',
                          color: '#94a3b8',
                          fontWeight: 700,
                          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                          width: '45px'
                        }}
                      >
                        #
                      </th>
                      {tableDataResult.columns.map((col) => (
                        <th
                          key={col.name}
                          onClick={() => {
                            if (sortCol === col.name) {
                              setSortAsc(!sortAsc);
                            } else {
                              setSortCol(col.name);
                              setSortAsc(true);
                            }
                          }}
                          style={{
                            padding: '10px 14px',
                            textAlign: 'left',
                            color: sortCol === col.name ? '#38bdf8' : '#e2e8f0',
                            fontWeight: 700,
                            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span>{col.name}</span>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>({col.type})</span>
                            {sortCol === col.name && (
                              <span style={{ fontSize: '11px' }}>{sortAsc ? '▲' : '▼'}</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row, rowIdx) => {
                      const absoluteIndex = (currentPage - 1) * rowsPerPage + rowIdx + 1;
                      return (
                        <tr
                          key={rowIdx}
                          style={{
                            backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                            transition: 'background-color 0.1s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              rowIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)';
                          }}
                        >
                          <td
                            style={{
                              padding: '9px 14px',
                              color: '#64748b',
                              fontSize: '11px',
                              borderBottom: '1px solid rgba(148, 163, 184, 0.08)'
                            }}
                          >
                            {absoluteIndex}
                          </td>
                          {tableDataResult.columns.map((col) => {
                            const val = row[col.name];
                            const isProvinceCol = col.name.toLowerCase() === 'province' || col.name.toLowerCase() === 'จังหวัด';

                            if (isProvinceCol && val) {
                              const pStr = String(val).trim();
                              let bg = 'rgba(148, 163, 184, 0.15)';
                              let textCol = '#cbd5e1';
                              let border = '1px solid rgba(148, 163, 184, 0.3)';
                              let pIcon = '📍';

                              if (pStr.includes('อยุธยา')) {
                                bg = 'rgba(245, 158, 11, 0.2)';
                                textCol = '#fbbf24';
                                border = '1px solid rgba(245, 158, 11, 0.5)';
                                pIcon = '🏛️';
                              } else if (pStr.includes('เชียงราย')) {
                                bg = 'rgba(16, 185, 129, 0.2)';
                                textCol = '#34d399';
                                border = '1px solid rgba(16, 185, 129, 0.5)';
                                pIcon = '🏔️';
                              } else if (pStr.includes('อุดร')) {
                                bg = 'rgba(168, 85, 247, 0.2)';
                                textCol = '#c084fc';
                                border = '1px solid rgba(168, 85, 247, 0.5)';
                                pIcon = '🌸';
                              } else if (pStr.includes('สุราษฎร์')) {
                                bg = 'rgba(56, 189, 248, 0.2)';
                                textCol = '#38bdf8';
                                border = '1px solid rgba(56, 189, 248, 0.5)';
                                pIcon = '🌊';
                              }

                              return (
                                <td
                                  key={col.name}
                                  style={{
                                    padding: '9px 14px',
                                    borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      backgroundColor: bg,
                                      color: textCol,
                                      border,
                                      borderRadius: '6px',
                                      padding: '2px 8px',
                                      fontSize: '11.5px',
                                      fontWeight: 700
                                    }}
                                  >
                                    <span>{pIcon}</span>
                                    <span>{pStr}</span>
                                  </span>
                                </td>
                              );
                            }

                            return (
                              <td
                                key={col.name}
                                style={{
                                  padding: '9px 14px',
                                  color: '#cbd5e1',
                                  borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '320px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                                title={String(val ?? '')}
                              >
                                {val !== null && val !== undefined ? String(val) : '-'}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* ===================================================================
                PAGINATION & NAVIGATOR TOOLBAR (Navigator ของหน้าต่างๆ)
            =================================================================== */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '6px'
              }}
            >
              {/* Left: Rows Per Page & Record Range */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: '#94a3b8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>แสดงแถว:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <span>
                  แสดง {totalRowsCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} -{' '}
                  {Math.min(currentPage * rowsPerPage, totalRowsCount)} จากทั้งหมด{' '}
                  <strong style={{ color: '#f8fafc' }}>{totalRowsCount}</strong> รายการ
                </span>
              </div>

              {/* Right: Page Navigation Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage <= 1}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: currentPage <= 1 ? '#475569' : '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '6px 9px',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                  }}
                  title="หน้าแรก"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: currentPage <= 1 ? '#475569' : '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '6px 9px',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                  }}
                  title="หน้าก่อนหน้า"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page Number indicator */}
                <span
                  style={{
                    backgroundColor: 'rgba(2, 132, 199, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '8px',
                    padding: '5px 12px',
                    fontSize: '12.5px',
                    fontWeight: 700
                  }}
                >
                  หน้า {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: currentPage >= totalPages ? '#475569' : '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '6px 9px',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                  }}
                  title="หน้าถัดไป"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: currentPage >= totalPages ? '#475569' : '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '6px 9px',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                  }}
                  title="หน้าสุดท้าย"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
