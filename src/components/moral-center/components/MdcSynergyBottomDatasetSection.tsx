import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  ChevronDown,
  ChevronUp,
  Clock,
  Trash2,
  Search,
  Sparkles,
  ExternalLink,
  Table as TableIcon,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import {
  type DatasetAccessLogItem,
  getDatasetAccessLogs,
  logDatasetAccess,
  clearDatasetAccessLogs,
  formatThaiTimestamp
} from '../utils/datasetAccessHistoryService';
import { MdcTopicSynergyDatasetViewer } from './MdcTopicSynergyDatasetViewer';
import { ALL_DUCKDB_TABLES_META } from '../data/moralDuckDbDatasetService';
import { getTopicSynergyAttribution } from '../data/topicSynergyDatasetMapping';
import {
  isAdminAuthenticated,
  onAdminAuthChange,
  onUserProfileChange,
  getCurrentUserProfile
} from '../utils/adminAuthService';
import './MdcSynergyBottomDatasetSection.css';

export interface MdcSynergyBottomDatasetSectionProps {
  topicId: string;
  topicName: string;
  dimensionKey?: string;
  dimensionTitle?: string;
  accentColor?: string;
  customDatasetTable?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  isAdmin?: boolean;
}

export const MdcSynergyBottomDatasetSection: React.FC<MdcSynergyBottomDatasetSectionProps> = ({
  topicId,
  topicName,
  dimensionKey,
  dimensionTitle,
  accentColor = '#2563eb',
  customDatasetTable,
  defaultExpanded = false,
  className = '',
  isAdmin: propIsAdmin
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [accessLogs, setAccessLogs] = useState<DatasetAccessLogItem[]>(() => getDatasetAccessLogs());
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [activeLogTab, setActiveLogTab] = useState<'all' | 'current_topic'>('current_topic');

  // Admin authentication state: only show timestamps log when logged in as admin
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (propIsAdmin !== undefined) return propIsAdmin;
    const p = getCurrentUserProfile();
    return Boolean(p.isAdmin && p.role === 'admin' && isAdminAuthenticated());
  });

  useEffect(() => {
    if (propIsAdmin !== undefined) {
      setIsAdmin(propIsAdmin);
      return;
    }
    const unsubAuth = onAdminAuthChange((adminState) => {
      const p = getCurrentUserProfile();
      setIsAdmin(Boolean(adminState && p.isAdmin && p.role === 'admin' && isAdminAuthenticated()));
    });
    const unsubProfile = onUserProfileChange((profile) => {
      setIsAdmin(Boolean(profile.isAdmin && profile.role === 'admin' && isAdminAuthenticated()));
    });
    const handleLogout = () => {
      setIsAdmin(false);
    };
    window.addEventListener('mdc_system_logout', handleLogout);
    return () => {
      unsubAuth();
      unsubProfile();
      window.removeEventListener('mdc_system_logout', handleLogout);
    };
  }, [propIsAdmin]);

  // Resolve dataset meta info for attribution
  const attribution = useMemo(() => {
    return getTopicSynergyAttribution(topicId);
  }, [topicId]);

  // Handle Toggle & Log Access
  const handleToggle = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);

    if (nextState) {
      const firstExtTable = ALL_DUCKDB_TABLES_META.find(
        (m) => m.tableName === attribution.externalTables[0]
      );
      const sourceAgency = firstExtTable?.sourceAgency || 'หน่วยงานภาคีเครือข่าย';
      const datasetName =
        firstExtTable?.displayName ||
        attribution.synergyTitle ||
        'ชุดข้อมูลบูรณาการภายนอก & ดัชนีคุณธรรม';

      // Record access timestamp when the user clicks the dataset button
      logDatasetAccess({
        topicId,
        topicName,
        datasetName,
        sourceAgency,
        category: 'synergy',
        action: 'กดเปิดดูชุดข้อมูล (ล่างสุด)'
      });
      setAccessLogs(getDatasetAccessLogs());
    }
  };

  // Clear logs handler
  const handleClearLogs = () => {
    if (window.confirm('คุณต้องการล้างประวัติเวลาการกดดูชุดข้อมูลทั้งหมดใช่หรือไม่?')) {
      clearDatasetAccessLogs();
      setAccessLogs([]);
    }
  };

  // Filter access logs
  const filteredLogs = useMemo(() => {
    let result = [...accessLogs];
    if (activeLogTab === 'current_topic') {
      result = result.filter(
        (l) => l.topicId === topicId || l.topicName.includes(topicName)
      );
    }
    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.datasetName.toLowerCase().includes(q) ||
          l.sourceAgency.toLowerCase().includes(q) ||
          l.topicName.toLowerCase().includes(q) ||
          l.timestamp.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      );
    }
    return result;
  }, [accessLogs, activeLogTab, topicId, topicName, logSearchQuery]);

  return (
    <div className={`synergy-bottom-dataset-wrapper ${className}`}>
      {/* =========================================================================
          1. ปุ่มชุดข้อมูลล่างสุด (Bottom Dataset Button) แยกออกจากกราฟ
         ========================================================================= */}
      <div className="bottom-dataset-action-card">
        <button
          type="button"
          className={`bottom-dataset-main-btn ${isExpanded ? 'is-active' : ''}`}
          onClick={handleToggle}
          title={isExpanded ? 'คลิกเพื่อย่อชุดข้อมูล' : (isAdmin ? 'คลิกเพื่อแสดงตารางข้อมูลที่นำมา Synergy และตารางเวลาที่เรากดดูชุดข้อมูล' : 'คลิกเพื่อแสดงตารางข้อมูลที่นำมา Synergy')}
        >
          <div className="bottom-dataset-btn-left">
            <div
              className="bottom-dataset-btn-icon"
              style={{
                background: isExpanded ? accentColor : '#eff6ff',
                color: isExpanded ? '#ffffff' : accentColor
              }}
            >
              <Database size={24} />
            </div>

            <div className="bottom-dataset-btn-texts">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="bottom-dataset-btn-title">
                  {isExpanded ? '📂 ซ่อนชุดข้อมูลที่นำมา Synergy' : '📁 แสดงชุดข้อมูลที่นำมา Synergy'}
                </span>
                <span className="bottom-dataset-pill-tag">
                  แยกปุ่มชุดข้อมูลล่างสุด
                </span>
              </div>
              <span className="bottom-dataset-btn-desc">
                {isExpanded
                  ? (isAdmin
                      ? 'กำลังแสดงตารางข้อมูลสถิติที่ใช้ในการ Synergy พร้อมตารางเวลาที่เรากดดูชุดข้อมูลต่างๆ (สำหรับผู้ดูแลระบบ)'
                      : 'กำลังแสดงตารางข้อมูลสถิติเชิงประจักษ์และ Big Data ที่ใช้ในการ Synergy')
                  : (isAdmin
                      ? 'คลิกเพื่อเปิดดูตารางข้อมูลที่นำมา Synergy ของหัวข้อนี้ พร้อมตารางประวัติเวลาการกดดูชุดข้อมูล'
                      : 'คลิกเพื่อเปิดดูตารางข้อมูลที่นำมา Synergy ของหัวข้อนี้')}
              </span>
            </div>
          </div>

          <div className="bottom-dataset-btn-right">
            <div className="bottom-dataset-badge">
              <Sparkles size={16} />
              <span>{attribution.externalTables.length + attribution.internalTables.length || 2} ตารางข้อมูล</span>
            </div>
            <div className="bottom-dataset-chevron">
              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>
          </div>
        </button>
      </div>

      {/* =========================================================================
          2. เมื่อกดปุ่มชุดข้อมูล แสดง:
             (A) ตารางเวลาที่เรากดดูชุดข้อมูลต่าง ๆ (แสดงเฉพาะผู้ดูแลระบบ Admin)
             (B) ตารางข้อมูลที่นำมา Synergy
         ========================================================================= */}
      {isExpanded && (
        <div className="bottom-dataset-expanded-panel">
          {/* -------------------------------------------------------------------
              SECTION A: ตารางเวลาที่เรากดดูชุดข้อมูลต่าง ๆ (Dataset Access Timestamps Table)
              แสดงเมื่อล็อกอินเป็น admin เท่านั้น
             ------------------------------------------------------------------- */}
          {isAdmin && (
            <div className="dataset-timestamps-audit-card">
              <div className="timestamps-audit-header">
                <div className="timestamps-audit-title-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="timestamps-header-icon">
                      <Clock size={19} color="#0284c7" />
                    </span>
                    <h3 className="timestamps-header-title">
                      ตารางเวลาที่เรากดดูชุดข้อมูลต่าง ๆ (Dataset Access Timestamps Log)
                    </h3>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11.5px',
                      fontWeight: 750,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0'
                    }}>
                      <ShieldCheck size={13} color="#059669" />
                      เฉพาะผู้ดูแลระบบ (Admin Only)
                    </span>
                  </div>
                  <p className="timestamps-header-sub">
                    บันทึกประวัติวันและเวลาทุกครั้งที่มีการกดเรียกดูชุดข้อมูลในระบบ เพื่อการตรวจสอบย้อนหลัง (Audit Trail)
                  </p>
                </div>

                <div className="timestamps-header-actions">
                  <span className="timestamps-count-badge">
                    บันทึกเวลาแล้ว {filteredLogs.length} รายการ
                  </span>
                  {accessLogs.length > 0 && (
                    <button
                      type="button"
                      className="timestamps-clear-btn"
                      onClick={handleClearLogs}
                      title="ล้างประวัติเวลาการกดดูชุดข้อมูล"
                    >
                      <Trash2 size={15} />
                      <span>ล้างประวัติเวลา</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs & Search Bar for Timestamps Table */}
              <div className="timestamps-controls-bar">
                <div className="timestamps-tabs-group">
                  <button
                    type="button"
                    className={`timestamps-tab-btn ${activeLogTab === 'current_topic' ? 'active' : ''}`}
                    onClick={() => setActiveLogTab('current_topic')}
                  >
                    <span>หัวข้อปัจจุบันนี้ ({accessLogs.filter((l) => l.topicId === topicId).length})</span>
                  </button>
                  <button
                    type="button"
                    className={`timestamps-tab-btn ${activeLogTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveLogTab('all')}
                  >
                    <span>ประวัติการกดดูทั้งหมด ({accessLogs.length})</span>
                  </button>
                </div>

                <div className="timestamps-search-box">
                  <Search size={15} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อชุดข้อมูล, วันที่, หรือหน่วยงาน..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="timestamps-search-input"
                  />
                </div>
              </div>

              {/* Timestamps Table */}
              <div className="timestamps-table-container">
                {filteredLogs.length === 0 ? (
                  <div className="timestamps-empty-state">
                    <Clock size={36} color="#cbd5e1" />
                    <p>ยังไม่มีบันทึกประวัติการกดดูชุดข้อมูลในหมวดหมู่นี้</p>
                  </div>
                ) : (
                  <table className="timestamps-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>ลำดับ</th>
                        <th style={{ width: '220px' }}>วัน-เวลาที่กดดู (Timestamp)</th>
                        <th style={{ minWidth: '180px' }}>หัวข้อ Synergy</th>
                        <th style={{ minWidth: '220px' }}>ชุดข้อมูลที่เปิดดู</th>
                        <th style={{ width: '190px' }}>หน่วยงานเจ้าของข้อมูล</th>
                        <th style={{ width: '130px', textAlign: 'center' }}>ประเภท</th>
                        <th style={{ width: '150px' }}>การดำเนินการ</th>
                        <th style={{ width: '120px', textAlign: 'center' }}>สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log, idx) => {
                        const isFirst = idx === 0;
                        return (
                          <tr key={log.id} className={isFirst ? 'is-latest-log' : ''}>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                              {idx + 1}
                            </td>
                            <td>
                              <div className="timestamp-cell-main">
                                <span className="timestamp-date-time">{log.timestamp}</span>
                                <span className="timestamp-time-ago">{log.timeAgo}</span>
                              </div>
                            </td>
                            <td>
                              <span className="timestamp-topic-text">{log.topicName}</span>
                            </td>
                            <td>
                              <div className="timestamp-dataset-name">
                                <TableIcon size={14} color="#0284c7" />
                                <strong>{log.datasetName}</strong>
                              </div>
                            </td>
                            <td>
                              <div className="timestamp-agency-badge">
                                <Building2 size={13} color="#475569" />
                                <span>{log.sourceAgency}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`timestamp-cat-badge ${log.category}`}>
                                {log.category === 'external' ? '🌐 ข้อมูลภายนอก' : log.category === 'internal' ? '📊 ศูนย์คุณธรรม' : '🔗 Synergy'}
                              </span>
                            </td>
                            <td>
                              <span className="timestamp-action-tag">{log.action}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`timestamp-status-pill ${log.status}`}>
                                {log.status === 'active' ? '🟢 กำลังเปิดดู' : '📝 บันทึกแล้ว'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------------
              SECTION B: ตารางข้อมูลที่นำมา Synergy (Synergy Dataset Tables)
             ------------------------------------------------------------------- */}
          <div className="dataset-synergy-tables-section">
            <div className="synergy-tables-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="synergy-tables-icon-badge" style={{ background: `${accentColor}18`, color: accentColor }}>
                  <TableIcon size={20} />
                </span>
                <div>
                  <h3 className="synergy-tables-title">
                    ตารางข้อมูลที่นำมา Synergy: {topicName}
                  </h3>
                  <p className="synergy-tables-sub">
                    ข้อมูลดิบเชิงประจักษ์ (Ground Truth & Big Data) ที่ใช้ในการประมวลผลความสัมพันธ์เชิงพื้นที่และกราฟวิเคราะห์ (คลิกเลือกดูข้อมูลในแต่ละตารางได้ด้านล่าง)
                  </p>
                </div>
              </div>
            </div>

            <div className="synergy-tables-body">
              {customDatasetTable ? (
                customDatasetTable
              ) : (
                <MdcTopicSynergyDatasetViewer
                  topicId={topicId}
                  topicTitle={topicName}
                  accentColor={accentColor}
                  hideCorrelationSection={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
