import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  TableProperties,
  RefreshCw,
  Search,
  X,
  ArrowLeft,
  Layers,
  FolderKanban,
  Activity,
  Network,
  LineChart,
  Sprout,
  Coins,
  GraduationCap
} from 'lucide-react';
import {
  DB_CATEGORIES,
  type DbTableCategoryKey,
  type SqliteTableMeta,
  type SqliteTableDataResponse,
  fetchSqliteDbTables,
  fetchSqliteTableData
} from '../data/pilotHackathonService';

const COLUMN_LABEL_MAP: Record<string, string> = {
  first_name: 'ชื่อ',
  last_name: 'นามสกุล',
  position: 'ตำแหน่ง',
  participant_level: 'ระดับบทบาท (3 ระดับ)',
  phone: 'เบอร์โทร',
  email: 'อีเมล',
  coffee_group: 'กลุ่มกาแฟ',
  coordinator_name: 'ชื่อ-นามสกุล',
  participant_role: 'บทบาท/ตำแหน่งเดิม',
  agency_name: 'หน่วยงาน/องค์กร/ชุมชน',
  agency_type: 'ประเภทหน่วยงาน',
  province: 'จังหวัด',
  region: 'ภูมิภาค',
  district: 'อำเภอ',
  subdistrict: 'ตำบล',
  created_at: 'วันที่ลงทะเบียน/สร้าง',
  updated_at: 'วันที่อัปเดตล่าสุด',
  contact_info: 'ข้อมูลติดต่อ',
  trial_project_name: 'ชื่อโครงการทดลอง',
  synergy_topic: 'ประเด็นความร่วมมือ',
  key: 'รหัสกลุ่ม (Key)',
  name: 'ชื่อกลุ่มกาแฟ',
  bg_image: 'ภาพพื้นหลัง (URL)',
  theme_color: 'สีประจำกลุ่ม',
  accent_bg: 'สีพื้นหลัง Accent',
  is_custom: 'กลุ่มที่สร้างเพิ่มเติม (Custom)',
  order_index: 'ลำดับแสดงผล'
};

interface DatabaseTablesExplorerProps {
  onClose?: () => void;
  initialTable?: string;
}

export const DatabaseTablesExplorer: React.FC<DatabaseTablesExplorerProps> = ({
  onClose,
  initialTable = 'pilot_hackathon_projects'
}) => {
  const [activeDbCategory, setActiveDbCategory] = useState<DbTableCategoryKey>('all');
  const [dbTables, setDbTables] = useState<SqliteTableMeta[]>([]);
  const [selectedDbTable, setSelectedDbTable] = useState<string>(initialTable);
  const [selectedTableData, setSelectedTableData] = useState<SqliteTableDataResponse | null>(null);
  const [isLoadingDbTables, setIsLoadingDbTables] = useState<boolean>(false);
  const [isLoadingTableData, setIsLoadingTableData] = useState<boolean>(false);
  const [dbTableSearchQuery, setDbTableSearchQuery] = useState<string>('');

  const filteredDbTables = useMemo(() => {
    if (activeDbCategory === 'all') return dbTables;
    return dbTables.filter((t) => t.category === activeDbCategory);
  }, [dbTables, activeDbCategory]);

  const currentTableMeta = useMemo(() => {
    return dbTables.find((t) => t.name === selectedDbTable);
  }, [dbTables, selectedDbTable]);

  const loadTables = async () => {
    setIsLoadingDbTables(true);
    try {
      const res = await fetchSqliteDbTables();
      if (res.tables && res.tables.length > 0) {
        setDbTables(res.tables);
        const preferred =
          res.tables.find((t) => t.name === selectedDbTable) ||
          res.tables.find((t) => t.name === 'pilot_hackathon_projects') ||
          res.tables[0];
        setSelectedDbTable(preferred.name);
        loadTableData(preferred.name);
      }
    } catch (err) {
      console.warn('Error loading tables in DatabaseTablesExplorer:', err);
    } finally {
      setIsLoadingDbTables(false);
    }
  };

  const loadTableData = async (tableName: string) => {
    setSelectedDbTable(tableName);
    setIsLoadingTableData(true);
    setDbTableSearchQuery('');
    try {
      const data = await fetchSqliteTableData(tableName);
      setSelectedTableData(data);
    } catch (err) {
      console.warn(`Error loading table data for ${tableName}:`, err);
    } finally {
      setIsLoadingTableData(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleSelectCategory = (catKey: DbTableCategoryKey) => {
    setActiveDbCategory(catKey);
    const matching = catKey === 'all' ? dbTables : dbTables.filter((t) => t.category === catKey);
    if (matching.length > 0 && !matching.some((t) => t.name === selectedDbTable)) {
      loadTableData(matching[0].name);
    }
  };

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers size={15} />;
      case 'FolderKanban':
        return <FolderKanban size={15} />;
      case 'Activity':
        return <Activity size={15} />;
      case 'Network':
        return <Network size={15} />;
      case 'LineChart':
        return <LineChart size={15} />;
      case 'Sprout':
        return <Sprout size={15} />;
      case 'Coins':
        return <Coins size={15} />;
      case 'GraduationCap':
        return <GraduationCap size={15} />;
      default:
        return <Database size={15} />;
    }
  };

  return (
    <div className="db-explorer-view-wrapper">
      {/* Explorer Top Toolbar */}
      <div className="db-explorer-top-bar">
        {onClose && (
          <button
            type="button"
            className="btn-db-back"
            onClick={onClose}
            title="คลิกเพื่อปิดหน้าตารางฐานข้อมูลและย้อนกลับ"
          >
            <ArrowLeft size={18} />
            <span>ย้อนกลับไปหน้าเดิม</span>
          </button>
        )}

        <div className="db-explorer-heading-box">
          <h3 className="db-explorer-title">
            <Database size={20} color="#2563eb" />
            <span>ตารางฐานข้อมูลทั้งหมดในระบบ (Database Explorer)</span>
          </h3>
          <span className="db-explorer-subtitle">
            ฐานข้อมูล: <code>PostgreSQL 16 (DB-MDC) & duckdb_tables</code> (ทั้งหมด {dbTables.length} ตาราง)
          </span>
        </div>

        <button
          type="button"
          className="btn-db-refresh"
          onClick={loadTables}
          disabled={isLoadingDbTables || isLoadingTableData}
          title="โหลดข้อมูลตารางใหม่จากฐานข้อมูล"
        >
          <RefreshCw size={16} className={isLoadingDbTables || isLoadingTableData ? 'spin-animation' : ''} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Category Filter Buttons Bar (ด้านบนของส่วนเลือกตาราง) */}
      <div className="db-category-filter-bar">
        <div className="db-category-filter-header">
          <div className="db-category-filter-title">
            <Layers size={16} color="#0f172a" />
            <span>หมวดหมู่ระบบ / แหล่งข้อมูล (Category Filter):</span>
          </div>
          <span className="db-category-filter-count">
            {activeDbCategory === 'all'
              ? `ทั้งหมด ${dbTables.length} ตาราง`
              : `หมวด ${DB_CATEGORIES.find((c) => c.key === activeDbCategory)?.label || ''} (${filteredDbTables.length} ตาราง)`}
          </span>
        </div>

        <div className="db-category-btn-group">
          {DB_CATEGORIES.map((cat) => {
            const count =
              cat.key === 'all'
                ? dbTables.length
                : dbTables.filter((t) => t.category === cat.key).length;
            const isActive = activeDbCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                className={`db-category-btn cat-${cat.key} ${isActive ? 'is-active' : ''}`}
                onClick={() => handleSelectCategory(cat.key)}
                title={cat.description}
              >
                {renderCategoryIcon(cat.iconName)}
                <span className="db-category-btn-label">{cat.label}</span>
                <span className="db-category-btn-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div className="db-explorer-table-tabs">
        <div className="db-tabs-label">
          <div className="db-tabs-label-left">
            <TableProperties size={15} color="#475569" />
            <span>เลือกตารางที่ต้องการดูข้อมูล:</span>
          </div>
          <span className="db-tabs-sub-badge">
            {filteredDbTables.length} ตารางในหมวดนี้
          </span>
        </div>
        <div className="db-tabs-scroll">
          {isLoadingDbTables && dbTables.length === 0 ? (
            <div className="db-tab-loading">กำลังโหลดรายชื่อตาราง...</div>
          ) : filteredDbTables.length === 0 ? (
            <div className="db-tab-empty-hint">ไม่พบตารางในหมวดหมู่นี้</div>
          ) : (
            filteredDbTables.map((tbl) => (
              <button
                key={tbl.name}
                type="button"
                className={`db-tab-chip ${selectedDbTable === tbl.name ? 'is-active' : ''}`}
                onClick={() => loadTableData(tbl.name)}
                title={`${tbl.displayName} (${tbl.rowCount} แถว)`}
              >
                <div className="db-tab-chip-top">
                  <span className={`db-tab-source-badge db-tab-source-${tbl.sourceType}`}>
                    {tbl.sourceType.toUpperCase()}
                  </span>
                  <span className="db-tab-count-badge">{tbl.rowCount} แถว</span>
                </div>
                <span className="db-tab-name">{tbl.name}</span>
                <span className="db-tab-desc-text" title={tbl.displayName}>
                  {tbl.displayName}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Table Data Viewer Section */}
      <div className="db-table-viewer-panel">
        <div className="db-viewer-header">
          <div className="db-viewer-meta">
            <span className="db-current-table-badge">
              ตาราง: <strong>{selectedDbTable}</strong>
            </span>
            {currentTableMeta && (
              <>
                <span className="db-category-pill-tag">
                  {currentTableMeta.systemName}
                </span>
                <span className="db-display-name-pill" title={currentTableMeta.displayName}>
                  {currentTableMeta.displayName}
                </span>
              </>
            )}
            <span className="db-meta-badge">
              จำนวนคอลัมน์: <strong>{selectedTableData?.columns.length || 0}</strong>
            </span>
            <span className="db-meta-badge">
              จำนวนแถวทั้งหมด: <strong>{selectedTableData?.rowCount || 0}</strong>
            </span>
          </div>

          {/* Search Bar */}
          <div className="db-viewer-search-box">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              className="db-viewer-search-input"
              placeholder={`ค้นหาข้อมูลในตาราง ${selectedDbTable}...`}
              value={dbTableSearchQuery}
              onChange={(e) => setDbTableSearchQuery(e.target.value)}
            />
            {dbTableSearchQuery && (
              <button
                type="button"
                className="db-search-clear-btn"
                onClick={() => setDbTableSearchQuery('')}
                title="ล้างคำค้นหา"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table Data Grid */}
        {isLoadingTableData ? (
          <div className="db-table-loading-state">
            <RefreshCw size={28} className="spin-animation" color="#2563eb" />
            <span>กำลังโหลดข้อมูลในตาราง {selectedDbTable}...</span>
          </div>
        ) : !selectedTableData || selectedTableData.rows.length === 0 ? (
          <div className="db-table-empty-state">
            <Database size={40} color="#94a3b8" />
            <h4>ไม่พบข้อมูลในตาราง {selectedDbTable}</h4>
            <p>ตารางนี้ยังไม่มีแถวข้อมูลที่บันทึกไว้ในฐานข้อมูล</p>
          </div>
        ) : (
          (() => {
            const query = dbTableSearchQuery.trim().toLowerCase();
            const filteredRows = query
              ? selectedTableData.rows.filter((row) =>
                  Object.values(row).some((val) =>
                    String(val ?? '').toLowerCase().includes(query)
                  )
                )
              : selectedTableData.rows;

            return (
              <div className="db-data-grid-container">
                <table className="db-data-grid-table">
                  <thead>
                    <tr>
                      <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                      {selectedTableData.columns.map((col) => (
                        <th key={col.name} className={col.pk === 1 ? 'is-pk' : ''}>
                          <div className="db-th-wrap">
                            <span className="db-col-name">{col.name}</span>
                            {COLUMN_LABEL_MAP[col.name] && (
                              <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 600 }}>
                                ({COLUMN_LABEL_MAP[col.name]})
                              </span>
                            )}
                            <div className="db-col-badges">
                              <span className="db-type-badge">{col.type || 'TEXT'}</span>
                              {col.pk === 1 && <span className="db-pk-badge" title="Primary Key">🔑 PK</span>}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={selectedTableData.columns.length + 1} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                          ไม่พบข้อมูลแถวที่ตรงกับคำค้นหา "{dbTableSearchQuery}"
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td className="db-row-number">{rIdx + 1}</td>
                          {selectedTableData.columns.map((col) => {
                            const val = row[col.name];
                            const isNull = val === null || val === undefined;
                            const valStr = isNull ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
                            const isJson = !isNull && typeof val === 'string' && (val.startsWith('{') || val.startsWith('['));

                            if (col.name === 'is_precheck' && !isNull) {
                              const isPre = Number(val) === 1 || val === true || val === '1';
                              return (
                                <td key={col.name} className="db-cell">
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      background: isPre ? '#eff6ff' : '#ecfdf5',
                                      color: isPre ? '#2563eb' : '#059669',
                                      border: isPre ? '1px solid #bfdbfe' : '1px solid #a7f3d0'
                                    }}
                                  >
                                    {isPre ? '🔍 ตรวจสอบคะแนน (Pre-check)' : '🚀 ส่งโครงการ (Submit)'}
                                  </span>
                                </td>
                              );
                            }

                            if (col.name === 'participant_level' && !isNull) {
                              const lvl = String(val).toLowerCase();
                              const isPolicy = lvl === 'policy' || lvl.includes('นโยบาย');
                              const isCitizen = lvl === 'citizen' || lvl.includes('ประชาชน');
                              const isPractitioner = !isPolicy && !isCitizen;
                              return (
                                <td key={col.name} className="db-cell">
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      background: isPolicy ? '#eff6ff' : isPractitioner ? '#ecfdf5' : '#fef3c7',
                                      color: isPolicy ? '#1e40af' : isPractitioner ? '#065f46' : '#92400e',
                                      border: isPolicy ? '1px solid #bfdbfe' : isPractitioner ? '1px solid #a7f3d0' : '1px solid #fde68a'
                                    }}
                                  >
                                    {isPolicy ? '🏛️ ระดับนโยบาย' : isPractitioner ? '⚙️ ระดับผู้ปฏิบัติการ' : '👥 ระดับประชาชน'}
                                  </span>
                                </td>
                              );
                            }

                            return (
                              <td key={col.name} className="db-cell">
                                {isNull ? (
                                  <span className="db-null-pill">NULL</span>
                                ) : isJson ? (
                                  <div className="db-json-cell">
                                    <span className="db-json-indicator">JSON</span>
                                    <span className="db-cell-text" title={valStr}>{valStr}</span>
                                  </div>
                                ) : (
                                  <span className="db-cell-text" title={valStr}>{valStr}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()
        )}

        {/* Footer with Back Button */}
        {onClose && (
          <div className="db-explorer-footer-bar">
            <span className="db-footer-info">
              แสดง {selectedTableData?.rows.length || 0} แถวในตาราง <code>{selectedDbTable}</code>
            </span>
            <button
              type="button"
              className="btn-db-back-large"
              onClick={onClose}
              title="คลิกเพื่อปิดหน้าตารางฐานข้อมูล"
            >
              <ArrowLeft size={18} />
              <span>ย้อนกลับไปหน้าเดิม</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
