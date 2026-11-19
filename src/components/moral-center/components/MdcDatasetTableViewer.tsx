import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Database,
  TrendingUp,
  MapPin,
  BarChart3,
  Users,
  Calendar,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  Layers,
  Sparkles,
  Table as TableIcon,
  CheckCircle2
} from 'lucide-react';
import {
  type DuckDbTableMeta,
  type DuckDbTableData,
  MORAL_INDEX_TABLES_META,
  LIFE_CAPITAL_TABLES_META,
  fetchDuckDbTable,
  exportTableToCsv
} from '../data/moralDuckDbDatasetService';
import './MdcDatasetTableViewer.css';

export interface MdcDatasetTableViewerProps {
  module: 'moral_index' | 'life_capital';
  mode?: 'overview' | 'all';
  className?: string;
}

export const MdcDatasetTableViewer: React.FC<MdcDatasetTableViewerProps> = ({
  module,
  mode = 'overview',
  className = ''
}) => {
  // Primary 5 tables strictly for the specified module
  const tablesList: DuckDbTableMeta[] =
    module === 'moral_index' ? MORAL_INDEX_TABLES_META : LIFE_CAPITAL_TABLES_META;

  const [activeTableName, setActiveTableName] = useState<string>(tablesList[0].tableName);
  const [tableData, setTableData] = useState<DuckDbTableData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Sync active table if module changes
  useEffect(() => {
    setActiveTableName(tablesList[0].tableName);
  }, [module]);

  // Load table data when activeTableName changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setSearchQuery('');
    setSortCol(null);
    setCurrentPage(1);

    fetchDuckDbTable(activeTableName).then((data) => {
      if (isMounted) {
        setTableData(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeTableName]);

  // Active table metadata
  const activeMeta: DuckDbTableMeta =
    tablesList.find((t) => t.tableName === activeTableName) || tablesList[0];

  // Helper icon renderer
  const renderIcon = (iconName: string, size = 15) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp size={size} />;
      case 'MapPin':
        return <MapPin size={size} />;
      case 'BarChart3':
        return <BarChart3 size={size} />;
      case 'Users':
        return <Users size={size} />;
      case 'Calendar':
        return <Calendar size={size} />;
      default:
        return <Layers size={size} />;
    }
  };

  // Filter & Sort
  const filteredAndSortedRows = useMemo(() => {
    if (!tableData || !tableData.rows) return [];
    let rows = [...tableData.rows];

    // Filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      rows = rows.filter((r) => {
        return Object.values(r).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Sort
    if (sortCol) {
      rows.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }

        return sortAsc
          ? String(valA).localeCompare(String(valB), 'th')
          : String(valB).localeCompare(String(valA), 'th');
      });
    }

    return rows;
  }, [tableData, searchQuery, sortCol, sortAsc]);

  // Pagination & Full-Table Display (ตั้งแต่ต้นจนจบ)
  const isShowAllRows = rowsPerPage === -1;
  const totalPages = isShowAllRows ? 1 : Math.ceil(filteredAndSortedRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    if (isShowAllRows) return filteredAndSortedRows;
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedRows.slice(start, start + rowsPerPage);
  }, [filteredAndSortedRows, currentPage, rowsPerPage, isShowAllRows]);

  const handleSort = (colName: string) => {
    if (sortCol === colName) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colName);
      setSortAsc(true);
    }
  };

  const handleExportCsv = () => {
    if (!tableData) return;
    exportTableToCsv(activeTableName, tableData);
  };

  // Format column header display
  const formatColumnTitle = (colName: string): string => {
    if (colName === 'สัดส่วน (%)' || colName === 'สัดส่วน') {
      return 'สัดส่วนผู้ประเมิน (%)';
    }
    return colName;
  };

  // Format cell value
  const renderCellContent = (colName: string, val: any) => {
    if (val === null || val === undefined) return <span className="mdc-duckdb-empty-cell">-</span>;

    // Badge for quality/tier columns
    if (colName.includes('ระดับ') || colName.includes('คุณภาพ')) {
      const s = String(val);
      const isExcellent = s.includes('ดีเยี่ยม');
      const isGood = s.includes('ดี');
      const isModerate = s.includes('พอใช้');
      const badgeClass = isExcellent ? 'tier-excellent' : isGood ? 'tier-good' : isModerate ? 'tier-moderate' : 'tier-other';
      return <span className={`mdc-duckdb-tier-badge ${badgeClass}`}>{s}</span>;
    }

    // Numbers
    if (typeof val === 'number') {
      if (colName.includes('ปี')) {
        return <span className="mdc-duckdb-num-cell year">{val}</span>;
      }
      if (Number.isInteger(val)) {
        return <span className="mdc-duckdb-num-cell integer">{val.toLocaleString('th-TH')}</span>;
      }
      return <span className="mdc-duckdb-num-cell float">{val.toFixed(2)}</span>;
    }

    return String(val);
  };

  const accentColor = module === 'moral_index' ? '#2563eb' : '#059669';

  return (
    <div className={`mdc-duckdb-table-viewer-card ${className}`}>
      {/* Top Header Row with Title & Export */}
      <div className="mdc-duckdb-header">
        <div className="mdc-duckdb-header-left">
          <h3 className="mdc-duckdb-title">
            {module === 'moral_index'
              ? 'คลังชุดข้อมูลดัชนีคุณธรรม 5 มิติ (Moral Index Datasets)'
              : 'คลังชุดข้อมูลดัชนีทุนชีวิต 4+1 พลัง (Life Capital Datasets)'}
          </h3>
          <p className="mdc-duckdb-subtitle">{activeMeta.description}</p>
        </div>

        <div className="mdc-duckdb-header-right">
          <button
            type="button"
            className="mdc-duckdb-export-btn"
            onClick={handleExportCsv}
            disabled={!tableData}
            title="ดาวน์โหลดชุดข้อมูลตารางที่เลือกเป็นไฟล์ CSV (UTF-8 รองรับ Excel ภาษาไทย)"
          >
            <Download size={14} style={{ marginRight: 6 }} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 5 Dataset Pill Buttons Strictly for this Index */}
      <div className="mdc-duckdb-buttons-container">
        <div className="mdc-duckdb-dataset-tabs">
          {tablesList.map((meta, idx) => {
            const isActive = meta.tableName === activeTableName;
            return (
              <button
                key={meta.tableName}
                type="button"
                className={`mdc-duckdb-dataset-pill ${isActive ? 'is-active' : ''} theme-${module}`}
                onClick={() => setActiveTableName(meta.tableName)}
                title={`${meta.displayName}\nตารางในฐานข้อมูล: ${meta.tableName}\n${meta.description}`}
              >
                <span className="mdc-duckdb-pill-idx">{idx + 1}</span>
                <span className="mdc-duckdb-pill-icon">{renderIcon(meta.icon, 14)}</span>
                <span className="mdc-duckdb-pill-name">{meta.displayName}</span>
                <span className="mdc-duckdb-pill-count">{meta.rowCount} แถว</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Control Bar: Search, Stats & Pagination Filter */}
      <div className="mdc-duckdb-toolbar">
        <div className="mdc-duckdb-toolbar-info">
          <Database size={14} style={{ color: accentColor }} />
          <span>
            พบ <strong>{filteredAndSortedRows.length}</strong> แถว
            {searchQuery && ` (จากทั้งหมด ${tableData?.rows?.length || 0} แถว)`}
          </span>
          {tableData && (
            <>
              <span className="mdc-duckdb-divider">•</span>
              <span>
                <strong>{tableData.columns.length}</strong> คอลัมน์
              </span>
            </>
          )}
        </div>

        <div className="mdc-duckdb-toolbar-actions">
          {/* Realtime Search Input */}
          <div className="mdc-duckdb-search-box">
            <Search size={14} className="mdc-duckdb-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหาข้อมูลในตาราง..."
              className="mdc-duckdb-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="mdc-duckdb-search-clear"
                onClick={() => setSearchQuery('')}
                title="ล้างคำค้นหา"
              >
                ✕
              </button>
            )}
          </div>

          {/* Rows per page selector */}
          <div className="mdc-duckdb-page-size-select">
            <span style={{ fontSize: 12, color: '#64748b' }}>แสดง:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="mdc-duckdb-select"
            >
              <option value={10}>10 แถว / หน้า</option>
              <option value={25}>25 แถว / หน้า</option>
              <option value={50}>50 แถว / หน้า</option>
              <option value={100}>100 แถว / หน้า</option>
              <option value={-1}>✨ แสดงทั้งหมดตั้งแต่ต้นจนจบ ({filteredAndSortedRows.length} แถว)</option>
            </select>
          </div>

          {/* Show All Rows from Start to Finish Button */}
          <button
            type="button"
            className={`mdc-duckdb-show-all-btn ${isShowAllRows ? 'is-active' : ''}`}
            onClick={() => {
              if (isShowAllRows) {
                setRowsPerPage(10);
                setCurrentPage(1);
              } else {
                setRowsPerPage(-1);
                setCurrentPage(1);
              }
            }}
            title={isShowAllRows ? 'สลับกลับเป็นแสดงแบบแบ่งหน้า (10 แถว)' : 'คลิกเพื่อแสดงข้อมูลตารางตั้งแต่ต้นจนจบครบทุกแถว'}
          >
            <TableIcon size={14} />
            <span>
              {isShowAllRows
                ? '📄 สลับเป็นแบ่งหน้า (10 แถว)'
                : `📜 แสดงข้อมูลตั้งแต่ต้นจนจบ (${filteredAndSortedRows.length} แถว)`}
            </span>
            {isShowAllRows && <span className="mdc-duckdb-active-badge">แสดงครบทุกแถว</span>}
          </button>

          {/* Jump to Start / End buttons */}
          <div className="mdc-duckdb-scroll-jumper">
            <button
              type="button"
              className="mdc-duckdb-jump-btn"
              onClick={() => tableScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              title="เลื่อนไปแถวแรก (ต้นตาราง)"
            >
              <ArrowUpToLine size={13} />
              <span>ต้นตาราง</span>
            </button>
            <button
              type="button"
              className="mdc-duckdb-jump-btn"
              onClick={() => {
                if (tableScrollRef.current) {
                  tableScrollRef.current.scrollTo({
                    top: tableScrollRef.current.scrollHeight,
                    behavior: 'smooth'
                  });
                }
              }}
              title="เลื่อนไปแถวสุดท้าย (ท้ายตาราง)"
            >
              <ArrowDownToLine size={13} />
              <span>ท้ายตาราง</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Data View */}
      <div ref={tableScrollRef} className="mdc-duckdb-table-scroll-container">
        {isLoading ? (
          <div className="mdc-duckdb-loading-state">
            <div className="mdc-duckdb-spinner" />
            <p>กำลังโหลดชุดข้อมูล...</p>
          </div>
        ) : !tableData || !tableData.rows || tableData.rows.length === 0 ? (
          <div className="mdc-duckdb-empty-state">
            <Database size={36} style={{ color: '#94a3b8', marginBottom: 8 }} />
            <p>ไม่พบข้อมูลในตารางนี้</p>
          </div>
        ) : filteredAndSortedRows.length === 0 ? (
          <div className="mdc-duckdb-empty-state">
            <Search size={36} style={{ color: '#94a3b8', marginBottom: 8 }} />
            <p>ไม่พบข้อมูลที่ตรงกับคำค้นหา "{searchQuery}"</p>
            <button
              type="button"
              className="mdc-duckdb-reset-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ล้างคำค้นหา
            </button>
          </div>
        ) : (
          <table className="mdc-duckdb-data-table">
            <thead>
              <tr>
                <th className="mdc-duckdb-th-seq">#</th>
                {tableData.columns.map((col) => {
                  const isSorted = sortCol === col.name;
                  return (
                    <th
                      key={col.name}
                      onClick={() => handleSort(col.name)}
                      className={`mdc-duckdb-th ${isSorted ? 'is-sorted' : ''}`}
                      title={`คลิกเพื่อเรียงลำดับตาม ${col.name}`}
                    >
                      <div className="mdc-duckdb-th-content">
                        <span>{formatColumnTitle(col.name)}</span>
                        <span className="mdc-duckdb-sort-icon">
                          {isSorted ? (
                            sortAsc ? (
                              <ArrowUp size={12} />
                            ) : (
                              <ArrowDown size={12} />
                            )
                          ) : (
                            <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                          )}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, rowIdx) => {
                const seq = isShowAllRows ? rowIdx + 1 : (currentPage - 1) * rowsPerPage + rowIdx + 1;
                return (
                  <tr key={rowIdx} className="mdc-duckdb-tr">
                    <td className="mdc-duckdb-td-seq">{seq}</td>
                    {tableData.columns.map((col) => {
                      const val = row[col.name] !== undefined ? row[col.name] : (col.name.includes('สัดส่วน') ? (row['สัดส่วนผู้ประเมิน (%)'] ?? row['สัดส่วน (%)']) : undefined);
                      return (
                        <td key={col.name} className="mdc-duckdb-td">
                          {renderCellContent(col.name, val)}
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

      {/* Full Table Mode (ตั้งแต่ต้นจนจบ) Summary Footer */}
      {isShowAllRows && (
        <div className="mdc-duckdb-all-rows-footer">
          <div className="mdc-duckdb-all-rows-status">
            <CheckCircle2 size={16} color="#16a34a" />
            <span>
              กำลังแสดงข้อมูลในตารางตั้งแต่ต้นจนจบครบทุกแถว (แถวที่ 1 ถึง {filteredAndSortedRows.length} รวม {filteredAndSortedRows.length} แถว)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="mdc-duckdb-jump-top-pill"
              onClick={() => tableScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowUpToLine size={13} />
              <span>เลื่อนกลับไปต้นตาราง</span>
            </button>
            <button
              type="button"
              className="mdc-duckdb-paginate-toggle-pill"
              onClick={() => {
                setRowsPerPage(10);
                setCurrentPage(1);
              }}
            >
              📄 สลับเป็นแบ่งหน้า (10 แถว)
            </button>
          </div>
        </div>
      )}

      {/* Table Pagination Bar */}
      {!isShowAllRows && filteredAndSortedRows.length > rowsPerPage && (
        <div className="mdc-duckdb-pagination">
          <div className="mdc-duckdb-pagination-info">
            แสดงแถวที่ {(currentPage - 1) * rowsPerPage + 1} ถึง{' '}
            {Math.min(currentPage * rowsPerPage, filteredAndSortedRows.length)} จากทั้งหมด{' '}
            {filteredAndSortedRows.length} แถว
          </div>

          <div className="mdc-duckdb-pagination-controls">
            <button
              type="button"
              className="mdc-duckdb-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              title="หน้าแรก"
            >
              «
            </button>
            <button
              type="button"
              className="mdc-duckdb-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="ก่อนหน้า"
            >
              ‹
            </button>

            <span className="mdc-duckdb-page-current">
              หน้า <strong>{currentPage}</strong> / {totalPages}
            </span>

            <button
              type="button"
              className="mdc-duckdb-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="ถัดไป"
            >
              ›
            </button>
            <button
              type="button"
              className="mdc-duckdb-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              title="หน้าสุดท้าย"
            >
              »
            </button>

            <button
              type="button"
              className="mdc-duckdb-show-all-page-btn"
              onClick={() => {
                setRowsPerPage(-1);
                setCurrentPage(1);
              }}
              title="คลิกเพื่อแสดงข้อมูลทั้งหมดตั้งแต่ต้นจนจบ"
            >
              📜 แสดงตั้งแต่ต้นจนจบ ({filteredAndSortedRows.length} แถว)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
