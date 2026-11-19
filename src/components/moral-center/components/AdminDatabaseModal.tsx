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
  Eye
} from 'lucide-react';
import {
  MASTER_PAGES_REGISTRY,
  fetchUnifiedTableData,
  type PageMetaItem,
  type UnifiedTableDataResult
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

  // Sync initial selection
  useEffect(() => {
    if (initialPageId) {
      setSelectedPageId(initialPageId);
      const foundPage = MASTER_PAGES_REGISTRY.find((p) => p.pageId === initialPageId);
      if (foundPage && foundPage.relatedTableNames.length > 0) {
        setSelectedTableName(initialTable || foundPage.relatedTableNames[0]);
      }
    } else if (initialTable) {
      setSelectedTableName(initialTable);
      const foundPage = MASTER_PAGES_REGISTRY.find((p) => p.relatedTableNames.includes(initialTable));
      if (foundPage) {
        setSelectedPageId(foundPage.pageId);
      }
    }
  }, [initialPageId, initialTable]);

  // Load table data when selectedTableName changes
  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      setIsLoadingData(true);
      setSearchQuery('');
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

  // Filtered and sorted rows
  const processedRows = useMemo(() => {
    if (!tableDataResult || !tableDataResult.rows) return [];
    let rows = [...tableDataResult.rows];

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
  }, [tableDataResult, searchQuery, sortCol, sortAsc]);

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
    const props = { size: 18, color: '#3b82f6' };
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

  if (!isOpen) return null;

  const activePageMeta = MASTER_PAGES_REGISTRY.find((p) => p.pageId === selectedPageId);

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
          {/* SECTION 1: PAGE CARDS GRID */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={17} color="#38bdf8" />
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>
                  หน้าระบบทั้งหมด ({MASTER_PAGES_REGISTRY.length} Pages) และ Table ที่เกี่ยวข้อง
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
              {MASTER_PAGES_REGISTRY.map((page) => {
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
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#94a3b8',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              padding: '2px 6px',
                              borderRadius: '6px'
                            }}
                          >
                            {page.category}
                          </span>
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
                          return (
                            <button
                              key={tbl}
                              type="button"
                              onClick={() => handleSelectTable(page.pageId, tbl)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
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
                              title={`คลิกเพื่อดูชุดข้อมูลของตาราง ${tbl}`}
                            >
                              <TableIcon size={11} />
                              <span>{tbl}</span>
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
              SECTION 2: DATA RECORDS VIEWER & PAGINATION (ชุดข้อมูลด้านล่าง)
          =================================================================== */}
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '20px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Table Viewer Header */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(2, 132, 199, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}
                >
                  <TableIcon size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
                      {selectedTableName}
                    </span>
                    <span
                      style={{
                        backgroundColor:
                          tableDataResult?.sourceType === 'DuckDB'
                            ? 'rgba(234, 179, 8, 0.15)'
                            : 'rgba(56, 189, 248, 0.15)',
                        color: tableDataResult?.sourceType === 'DuckDB' ? '#facc15' : '#38bdf8',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {tableDataResult?.sourceType || 'กำลังโหลด'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    หน้า: <strong>{activePageMeta?.pageTitle || selectedPageId}</strong> | จำนวนแถวทั้งหมด:{' '}
                    <strong style={{ color: '#38bdf8' }}>{tableDataResult?.totalRows || 0}</strong> แถว |{' '}
                    จำนวนคอลัมน์: <strong style={{ color: '#38bdf8' }}>{tableDataResult?.columns.length || 0}</strong> คอลัมน์
                  </div>
                </div>
              </div>

              {/* Action Controls: Search & CSV Export */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
