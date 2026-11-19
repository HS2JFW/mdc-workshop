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
  Tag,
  Car,
  Home,
  HeartPulse,
  Coins,
  Building2,
  Banknote,
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
  Activity,
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  type DuckDbTableMeta,
  type DuckDbTableData,
  ALL_DUCKDB_TABLES_META,
  fetchDuckDbTable,
  exportTableToCsv
} from '../data/moralDuckDbDatasetService';
import {
  getTopicSynergyAttribution,
  type TopicSynergyAttribution
} from '../data/topicSynergyDatasetMapping';
import { ExternalSynergySourceBanner } from './ExternalSynergySourceBanner';
import './MdcTopicSynergyDatasetViewer.css';

export interface MdcTopicSynergyDatasetViewerProps {
  topicId: string;
  topicTitle?: string;
  accentColor?: string;
  className?: string;
  hideCorrelationSection?: boolean;
}

export const MdcTopicSynergyDatasetViewer: React.FC<MdcTopicSynergyDatasetViewerProps> = ({
  topicId,
  topicTitle,
  accentColor = '#2563eb',
  className = '',
  hideCorrelationSection = false
}) => {
  const attribution: TopicSynergyAttribution = useMemo(() => {
    return getTopicSynergyAttribution(topicId);
  }, [topicId]);

  const statProfile = attribution.statisticalProfile;

  // Lookup internal table metas
  const internalMetas = useMemo(() => {
    return attribution.internalTables
      .map((tName) => ALL_DUCKDB_TABLES_META.find((m) => m.tableName === tName))
      .filter((m): m is DuckDbTableMeta => Boolean(m));
  }, [attribution.internalTables]);

  // Lookup external table metas
  const externalMetas = useMemo(() => {
    return attribution.externalTables
      .map((tName) => ALL_DUCKDB_TABLES_META.find((m) => m.tableName === tName))
      .filter((m): m is DuckDbTableMeta => Boolean(m));
  }, [attribution.externalTables]);

  const allAvailableMetas = useMemo(() => {
    return [...internalMetas, ...externalMetas];
  }, [internalMetas, externalMetas]);

  // Default active table: preferably first external or first internal
  const defaultTable =
    externalMetas[0]?.tableName || internalMetas[0]?.tableName || 'mdc_moral_national_overview';

  const [activeTableName, setActiveTableName] = useState<string>(defaultTable);
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(true);
  const [tableData, setTableData] = useState<DuckDbTableData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Sync active table if topic changes
  useEffect(() => {
    const nextDefault =
      externalMetas[0]?.tableName || internalMetas[0]?.tableName || 'mdc_moral_national_overview';
    setActiveTableName(nextDefault);
    setIsTableExpanded(true); // keep table open when switching topics
  }, [topicId, externalMetas, internalMetas]);

  // Load table data when activeTableName changes or table is expanded
  useEffect(() => {
    if (!isTableExpanded) return;
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
  }, [activeTableName, isTableExpanded]);

  const handleTableToggle = (tableName: string) => {
    if (isTableExpanded && activeTableName === tableName) {
      setIsTableExpanded(false);
    } else {
      setActiveTableName(tableName);
      setIsTableExpanded(true);
    }
  };

  // Active table metadata
  const activeMeta: DuckDbTableMeta =
    allAvailableMetas.find((t) => t.tableName === activeTableName) ||
    allAvailableMetas[0] || {
      tableName: activeTableName,
      module: 'external_synergy',
      category: 'external',
      displayName: activeTableName,
      description: '',
      icon: 'Database',
      rowCount: 0,
      sourceAgency: 'ฐานข้อมูลบูรณาการภายนอก',
      synergyDimension: 'Synergy'
    };

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
      case 'Car':
        return <Car size={size} />;
      case 'Home':
        return <Home size={size} />;
      case 'HeartPulse':
        return <HeartPulse size={size} />;
      case 'Coins':
        return <Coins size={size} />;
      case 'Building2':
        return <Building2 size={size} />;
      case 'Banknote':
        return <Banknote size={size} />;
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

  // Format cell value
  const renderCellContent = (colName: string, val: any) => {
    if (val === null || val === undefined) return <span className="mdc-duckdb-empty-cell">-</span>;

    if (colName.includes('ระดับ') || colName.includes('คุณภาพ')) {
      const s = String(val);
      const isExcellent = s.includes('ดีเยี่ยม');
      const isGood = s.includes('ดี');
      const isModerate = s.includes('พอใช้');
      const badgeClass = isExcellent ? 'tier-excellent' : isGood ? 'tier-good' : isModerate ? 'tier-moderate' : 'tier-other';
      return <span className={`mdc-duckdb-tier-badge ${badgeClass}`}>{s}</span>;
    }

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

  return (
    <div className={`topic-synergy-viewer-card ${className}`}>
      {/* 1. Graph Statistical Relationship & Empirical Correlation Analysis */}
      {!hideCorrelationSection && (
        <div className="stat-relationship-card">
        <div className="stat-relationship-header">
          <div className="stat-title-group">
            <div className="stat-badge">
              <Activity size={14} style={{ color: accentColor }} />
              <span>กราฟที่ 2: การวิเคราะห์รูปแบบความสัมพันธ์เชิงสถิติ (Statistical Graph Correlation)</span>
            </div>
            <h4 className="stat-chart-title">
              กราฟที่ 2: {topicTitle || attribution.topicName}
            </h4>
            <p className="stat-chart-subtitle">
              {attribution.chartHeadline}
            </p>
          </div>

          {/* Statistical Metric Badges */}
          {statProfile && (
            <div className="stat-metrics-pills">
              <div className="stat-pill metric-r" title="ค่าสัมประสิทธิ์สหสัมพันธ์ (Pearson Correlation Coefficient)">
                <span className="pill-label">สหสัมพันธ์</span>
                <strong className="pill-val">{statProfile.rMetric}</strong>
              </div>
              <div className="stat-pill metric-p" title="ระดับนัยสำคัญทางสถิติ (Statistical Significance)">
                <span className="pill-label">นัยสำคัญ</span>
                <strong className="pill-val">{statProfile.pValue}</strong>
              </div>
              <div className="stat-pill metric-r2" title="สัมประสิทธิ์การตัดสินใจ (Coefficient of Determination)">
                <span className="pill-label">R²</span>
                <strong className="pill-val">{statProfile.rSquared}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Statistical Pattern Insights Grid */}
        <div className="stat-insights-grid">
          {/* Box 1: Dual-Axis Interpretation */}
          <div className="stat-box dual-axis-box">
            <div className="stat-box-title">
              <TrendingUp size={15} style={{ color: '#0284c7' }} />
              <span>ลักษณะความสัมพันธ์ของทั้งสองแกนในกราฟ</span>
            </div>
            <div className="correlation-type-badge">
              {statProfile?.correlationType || 'ความสัมพันธ์เชิงลบ/ผกผัน (Inverse Correlation)'}
            </div>
            <p className="stat-box-desc">
              {statProfile?.dualAxisPattern || 'เส้นคะแนนคุณธรรม (แกน Y ขวา) ทแยงลงผกผันกับแท่งสถิติตัวชี้วัดภายนอก (แกน Y ซ้าย)'}
            </p>
          </div>

          {/* Box 2: Cross-Segment Correlation (ข้อมูลส่วนไหน สัมพันธ์อย่างไรกับข้อมูลส่วนไหน) */}
          <div className="stat-box segment-box">
            <div className="stat-box-title">
              <BarChart3 size={15} style={{ color: '#059669' }} />
              <span>ข้อมูลส่วนไหน สัมพันธ์อย่างไรกับข้อมูลส่วนไหน (Cross-Segment Evidence)</span>
            </div>
            <div className="segment-list">
              {statProfile?.segmentBreakdown.map((seg, idx) => (
                <div key={idx} className="segment-item">
                  <span className="segment-tag">{seg.segmentName}:</span>
                  <span className="segment-finding">{seg.finding}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Baseline / Threshold Reference Note */}
        {statProfile?.thresholdObservation && (
          <div className="stat-threshold-note">
            <span className="threshold-icon">🎯</span>
            <span className="threshold-txt">
              <strong>จุดสังเกตเกณฑ์อ้างอิงมาตรฐาน (Reference Line 4.50):</strong> {statProfile.thresholdObservation}
            </span>
          </div>
        )}
      </div>
      )}

      {/* 2. Synergy Dataset Attribution Bar & Pill Buttons directly under the Chart */}
      <div className="topic-synergy-banner">
        <div className="topic-synergy-banner-top">
          <div className="topic-synergy-badge" style={{ borderColor: accentColor }}>
            <Sparkles size={20} style={{ color: accentColor }} />
            <span>ตารางข้อมูลที่นำมาใช้ทำ Synergy ในกราฟนี้</span>
          </div>

          <div className="topic-synergy-guide-tag">
            <TableIcon size={18} style={{ marginRight: 5 }} />
            <span>คลิกปุ่มตารางเพื่อเปิดดูข้อมูลดิบในตาราง</span>
          </div>
        </div>

        {/* Visual Synergy Formula Equation Box with Clickable Buttons */}
        <div className="topic-synergy-formula-box">
          <div className="formula-part internal-side">
            <div className="formula-part-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span className="formula-tag internal">
                  <Building2 size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                  ชุดข้อมูลศูนย์คุณธรรม (ทางซ้ายมือ)
                </span>
                <span className="dual-side-role-tag">Ground Truth</span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#1e1b4b' }}>
                {attribution.moralDimensionTitle ? `ดัชนีคุณธรรม 5 มิติ & ทุนชีวิต: ${attribution.moralDimensionTitle}` : 'ชุดข้อมูลดัชนีคุณธรรม 5 มิติ & ทุนชีวิต'}
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                {attribution.topicId.startsWith('family_') || attribution.topicId.startsWith('wisdom_') || attribution.topicId.startsWith('peer_') || attribution.topicId.startsWith('activity_') || attribution.topicId.startsWith('community_') || attribution.topicId.startsWith('identity_')
                  ? 'ชุดข้อมูลสำรวจทุนชีวิต 5 พลัง พ.ศ. 2565–2568 รายภูมิภาคและช่วงวัย ครอบคลุม 8 ภูมิภาคทั่วประเทศ'
                  : 'ชุดข้อมูลสำรวจระดับคุณธรรมรายปี พ.ศ. 2565–2568 (33,032 กลุ่มตัวอย่าง) ครอบคลุม 5 มิติคุณธรรมและ 77 จังหวัด'}
              </p>
            </div>
            <div className="formula-pills-row">
              {internalMetas.map((m) => {
                const isActive = m.tableName === activeTableName && isTableExpanded;
                return (
                  <button
                    key={m.tableName}
                    type="button"
                    className={`formula-table-btn internal ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleTableToggle(m.tableName)}
                    title={`คลิกเพื่อเปิด/ปิดตาราง: ${m.displayName} (${m.tableName})`}
                  >
                    <span className="btn-icon">{renderIcon(m.icon, 19)}</span>
                    <span className="btn-name">{m.displayName}</span>
                    <span className="btn-count">{m.rowCount} แถว</span>
                    {isActive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="formula-operator">
            <span className="operator-cross">✕</span>
            <span className="operator-txt">Synergy With</span>
          </div>

          <div className="formula-part external-side">
            <div className="formula-part-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span className="formula-tag external">
                  <Layers size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                  ชุดข้อมูลหน่วยงานภายนอก (ทางขวามือ)
                </span>
                <span className="dual-side-role-tag ext">External Big Data</span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#042f2e' }}>
                {attribution.synergyTitle || topicTitle || attribution.topicName}
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                {attribution.chartHeadline || attribution.attributionNote || 'ข้อมูลสถิติเชิงประจักษ์และ Big Data ภายนอกที่นำมาจับคู่เปรียบเทียบเชิงพื้นที่'}
              </p>
            </div>
            <div className="formula-pills-row">
              {externalMetas.map((m) => {
                const isActive = m.tableName === activeTableName && isTableExpanded;
                return (
                  <button
                    key={m.tableName}
                    type="button"
                    className={`formula-table-btn external ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleTableToggle(m.tableName)}
                    title={`คลิกเพื่อเปิด/ปิดตาราง: ${m.displayName} (${m.tableName})\nหน่วยงาน: ${m.sourceAgency}`}
                  >
                    <span className="btn-icon">{renderIcon(m.icon, 19)}</span>
                    <span className="btn-name">{m.displayName}</span>
                    <span className="btn-agency-tag">{m.sourceAgency}</span>
                    <span className="btn-count">{m.rowCount} แถว</span>
                    {isActive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>


      </div>

      {/* 3. Collapsible Table Viewer (Opens on Demand when user clicks a button) */}
      {isTableExpanded && (
        <div className="topic-synergy-collapsible-table-wrap">
          {/* Active Table Details Strip */}
          <div className="topic-synergy-strip">
            <div className="strip-info-group">
              <span className="strip-title">{activeMeta.displayName}</span>
              <code className="strip-code">{activeMeta.tableName}</code>
              <span className="strip-agency">{activeMeta.sourceAgency || 'ศูนย์คุณธรรม'}</span>
              <span className="strip-dim">
                <Tag size={12} style={{ marginRight: 4, display: 'inline' }} />
                {activeMeta.synergyDimension || 'Synergy'}
              </span>
            </div>

            <div className="strip-actions-group">
              {activeMeta.directDownloadUrl && (
                <a
                  href={activeMeta.directDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mdc-duckdb-download-link-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: '7px',
                    background: accentColor || '#2563eb',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  title={`ไปที่หน้าดาวน์โหลดชุดข้อมูลโดยตรง: ${activeMeta.directDownloadUrl}`}
                >
                  <Download size={13} />
                  <span>{activeMeta.directDownloadLabel || 'หน้าดาวน์โหลดข้อมูลโดยตรง'}</span>
                  <ExternalLink size={12} />
                </a>
              )}

              {activeMeta.sourceUrl && (
                <a
                  href={activeMeta.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mdc-duckdb-source-link-btn"
                  title={`ไปที่เว็บไซต์ทางการของหน่วยงานเจ้าของข้อมูล: ${activeMeta.sourceAgency || 'ศูนย์คุณธรรม'}`}
                >
                  <ExternalLink size={14} style={{ marginRight: 6 }} />
                  <span>เว็บไซต์เจ้าของข้อมูล</span>
                </a>
              )}

              <button
                type="button"
                className="mdc-duckdb-export-btn"
                onClick={handleExportCsv}
                disabled={!tableData}
                title="ดาวน์โหลดชุดข้อมูลตารางนี้เป็นไฟล์ CSV"
              >
                <Download size={13} style={{ marginRight: 5 }} />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                className="collapse-table-btn"
                onClick={() => setIsTableExpanded(false)}
                title="ซ่อนตารางข้อมูล"
              >
                <ChevronUp size={14} style={{ marginRight: 4 }} />
                <span>ซ่อนตาราง</span>
              </button>
            </div>
          </div>

          {/* External Synergy Source Banner for External Tables */}
          {activeMeta.category === 'external' && activeMeta.directDownloadUrl && (
            <div style={{ padding: '12px 16px 0 16px' }}>
              <ExternalSynergySourceBanner
                agencyName={activeMeta.sourceAgency || 'หน่วยงานภาครัฐ'}
                datasetTitle={activeMeta.displayName}
                directDownloadUrl={activeMeta.directDownloadUrl}
                directDownloadLabel={activeMeta.directDownloadLabel || 'หน้าดาวน์โหลดชุดข้อมูลโดยตรง (data.go.th)'}
                officialPortalUrl={activeMeta.sourceUrl}
                officialPortalLabel="เว็บไซต์ทางการของหน่วยงาน"
                fileFormats={['CSV', 'API']}
                datasetCode={activeMeta.tableName}
                description={activeMeta.description}
                accentColor={accentColor}
              />
            </div>
          )}

          {/* Table Toolbar */}
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
                  placeholder="ค้นหาข้อมูลในตารางนี้..."
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
            </div>
          </div>

          {/* Data Table View */}
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
                            <span>{col.name}</span>
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
                          const val = row[col.name];
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

          {/* Pagination: Show only when not showing all rows and there are more rows than rowsPerPage */}
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
      )}
    </div>
  );
};
 