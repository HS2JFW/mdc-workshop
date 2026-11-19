import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Database,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  Table as TableIcon
} from 'lucide-react';
import {
  fetchUnifiedTableData,
  type UnifiedTableDataResult,
  type DatasetColumn
} from '../data/centralDatasetPoolService';

interface InteractiveDataTableViewerProps {
  tableName: string;
  displayName?: string;
  sourceAgency?: string;
}

export const InteractiveDataTableViewer: React.FC<InteractiveDataTableViewerProps> = ({
  tableName,
  displayName,
  sourceAgency
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [tableData, setTableData] = useState<UnifiedTableDataResult | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Fetch table data when tableName changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setCurrentPage(1);
    setSearchQuery('');

    fetchUnifiedTableData(tableName)
      .then((res) => {
        if (isMounted) {
          setTableData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching table data:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tableName]);

  // Filtered & Sorted rows
  const processedRows = useMemo(() => {
    if (!tableData || !tableData.rows) return [];
    let rows = [...tableData.rows];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter((r) =>
        Object.values(r).some((val) =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
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
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return rows;
  }, [tableData, searchQuery, sortCol, sortAsc]);

  // Pagination calculation
  const totalRows = processedRows.length;
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalRows / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return processedRows;
    const start = (validCurrentPage - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, validCurrentPage, pageSize]);

  const handleSort = (colName: string) => {
    if (sortCol === colName) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colName);
      setSortAsc(true);
    }
  };

  const handleExportCsv = () => {
    if (!tableData || !tableData.rows.length) return;
    const rawHeaders = tableData.columns.map((c) => c.name);
    const csvLines: string[] = [];

    // UTF-8 BOM so Excel on Windows recognizes Thai text properly
    csvLines.push(rawHeaders.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

    processedRows.forEach((row) => {
      const line = rawHeaders.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvLines.push(line.join(','));
    });

    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Kanit', sans-serif"
      }}
    >
      {/* =====================================================================
          1. DATA TABLE HEADER & CONTROLS BAR
      ===================================================================== */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1.5px solid #f1f5f9',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}
          >
            <TableIcon size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {displayName || tableName}
              </h3>
              <span
                style={{
                  backgroundColor: '#eff6ff',
                  color: '#0284c7',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'monospace'
                }}
              >
                {tableName}
              </span>
              {tableData && (
                <span
                  style={{
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    borderRadius: '8px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {tableData.sourceType}
                </span>
              )}
            </div>

            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
              {sourceAgency ? `แหล่งข้อมูล: ${sourceAgency} • ` : ''}
              {tableData ? `${tableData.totalRows.toLocaleString()} แถว, ${tableData.columns.length} คอลัมน์` : 'กำลังโหลด...'}
            </p>
          </div>
        </div>

        {/* Right Controls: Search, PageSize, CSV Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหาข้อมูลในตาราง..."
              style={{
                padding: '7px 12px 7px 34px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                fontFamily: 'Kanit',
                outline: 'none',
                width: '210px',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Rows per page select */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '13px',
              fontFamily: 'Kanit',
              outline: 'none',
              backgroundColor: '#ffffff',
              color: '#334155'
            }}
          >
            <option value={10}>10 แถว/หน้า</option>
            <option value={25}>25 แถว/หน้า</option>
            <option value={50}>50 แถว/หน้า</option>
            <option value={-1}>ทั้งหมด</option>
          </select>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={loading || !tableData || !tableData.rows.length}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: '#334155',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="ส่งออกตารางเป็นไฟล์ CSV"
          >
            <Download size={15} color="#0284c7" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. DATA TABLE VIEW
      ===================================================================== */}
      <div style={{ overflowX: 'auto', width: '100%', minHeight: '260px' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: '#64748b',
              gap: '12px'
            }}
          >
            <RefreshCw size={28} className="animate-spin" color="#0284c7" />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>กำลังดึงข้อมูลตาราง {tableName}...</span>
          </div>
        ) : !tableData || tableData.columns.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            ไม่พบโครงสร้างข้อมูลในตารางนี้
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800, width: '48px' }}>#</th>
                {tableData.columns.map((col) => {
                  const isSorted = sortCol === col.name;
                  return (
                    <th
                      key={col.name}
                      onClick={() => handleSort(col.name)}
                      style={{
                        padding: '12px 16px',
                        color: isSorted ? '#0284c7' : '#334155',
                        fontWeight: 800,
                        cursor: 'pointer',
                        userSelect: 'none',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{col.name}</span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: isSorted ? '#e0f2fe' : '#e2e8f0',
                            color: isSorted ? '#0369a1' : '#64748b'
                          }}
                        >
                          {col.type}
                        </span>
                        <ArrowUpDown size={12} color={isSorted ? '#0284c7' : '#94a3b8'} />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableData.columns.length + 1}
                    style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}
                  >
                    ไม่พบข้อมูลที่ตรงกับคำค้นหา "{searchQuery}"
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const rowNum = pageSize === -1 ? idx + 1 : (validCurrentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fafafa')
                      }
                    >
                      <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
                        {rowNum}
                      </td>
                      {tableData.columns.map((col) => {
                        const val = row[col.name];
                        const displayVal =
                          val === null || val === undefined
                            ? '-'
                            : typeof val === 'number'
                            ? val.toLocaleString()
                            : String(val);
                        return (
                          <td
                            key={col.name}
                            style={{
                              padding: '10px 16px',
                              color: '#1e293b',
                              whiteSpace: 'nowrap',
                              maxWidth: '300px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={String(val ?? '')}
                          >
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* =====================================================================
          3. PAGINATION FOOTER
      ===================================================================== */}
      {!loading && tableData && tableData.columns.length > 0 && (
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1.5px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '13px',
            color: '#64748b'
          }}
        >
          <div>
            แสดง {totalRows === 0 ? 0 : pageSize === -1 ? `1 - ${totalRows}` : `${(validCurrentPage - 1) * pageSize + 1} - ${Math.min(validCurrentPage * pageSize, totalRows)}`} จากทั้งหมด {totalRows.toLocaleString()} รายการ
            {searchQuery && ` (กรองจาก ${tableData.totalRows.toLocaleString()} รายการ)`}
          </div>

          {pageSize !== -1 && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={validCurrentPage <= 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: validCurrentPage <= 1 ? '#f1f5f9' : '#ffffff',
                  color: validCurrentPage <= 1 ? '#94a3b8' : '#334155',
                  cursor: validCurrentPage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ padding: '0 8px', fontWeight: 700, color: '#334155' }}>
                หน้า {validCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={validCurrentPage >= totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: validCurrentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                  color: validCurrentPage >= totalPages ? '#94a3b8' : '#334155',
                  cursor: validCurrentPage >= totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
