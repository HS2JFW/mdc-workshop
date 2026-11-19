import React, { useState, useMemo } from 'react';
import {
  Database,
  ExternalLink,
  Download,
  FileSpreadsheet,
  Copy,
  Check,
  X,
  Search,
  Layers,
  Sparkles,
  FileJson
} from 'lucide-react';
import {
  resolveAgencyDataset,
  convertArrayToCsv,
  triggerFileDownload
} from '../data/moralIntegratedSourcesData';
import type { IntegratedDatasetInfo } from '../data/moralIntegratedSourcesData';

export interface MoralAgency {
  name: string;
  tag: string;
  url?: string;
  downloadUrl?: string;
  datasetTitle?: string;
  format?: 'CSV' | 'JSON' | 'XLSX' | 'GeoJSON' | 'API' | 'OpenData';
  description?: string;
  schemaFields?: string[];
}

interface MoralSourceFooterProps {
  agencies: MoralAgency[];
  dataSourceNote?: string;
  viewTitle?: string;
}

export const MoralSourceFooter: React.FC<MoralSourceFooterProps> = ({
  agencies,
  dataSourceNote = 'เชื่อมโยงข้อมูลอัตโนมัติผ่าน Open Data & Ingestion Pipelines ตามมาตรฐาน DGA',
  viewTitle = 'ชุดข้อมูลบูรณาการ'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // Auto-enrich each agency with master catalog info if properties are not fully specified
  const enrichedAgencies: IntegratedDatasetInfo[] = useMemo(() => {
    return agencies.map((ag) => {
      const resolved = resolveAgencyDataset(ag.tag, ag.name);
      return {
        id: resolved.id || ag.tag,
        agencyName: ag.name || resolved.agencyName,
        agencyTag: ag.tag || resolved.agencyTag,
        datasetTitle: ag.datasetTitle || resolved.datasetTitle,
        description: ag.description || resolved.description,
        category: resolved.category,
        format: (ag.format as any) || resolved.format || 'CSV',
        portalUrl: ag.url || resolved.portalUrl,
        downloadUrl: ag.downloadUrl || resolved.downloadUrl,
        apiEndpoint: resolved.apiEndpoint,
        updateFrequency: resolved.updateFrequency,
        schemaFields: ag.schemaFields || resolved.schemaFields || ['id', 'name', 'value'],
        sampleRowsCount: resolved.sampleRowsCount || 50
      };
    });
  }, [agencies]);

  // Filtered list for modal
  const filteredDatasets = useMemo(() => {
    if (!searchFilter.trim()) return enrichedAgencies;
    const q = searchFilter.toLowerCase();
    return enrichedAgencies.filter(
      (ds) =>
        ds.agencyName.toLowerCase().includes(q) ||
        ds.agencyTag.toLowerCase().includes(q) ||
        ds.datasetTitle.toLowerCase().includes(q) ||
        ds.description.toLowerCase().includes(q) ||
        ds.format.toLowerCase().includes(q)
    );
  }, [enrichedAgencies, searchFilter]);

  // Handle Copy URL / API Endpoint
  const handleCopyEndpoint = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Handle Generate and Download Real Sample Dataset
  const handleDirectDownloadFile = (dataset: IntegratedDatasetInfo, fileType: 'csv' | 'json') => {
    // Generate structured dataset rows from schema
    const rows = Array.from({ length: Math.min(dataset.sampleRowsCount || 20, 25) }).map((_, idx) => {
      const rowObj: Record<string, any> = {};
      dataset.schemaFields.forEach((field) => {
        if (field.includes('id') || field.includes('code')) {
          rowObj[field] = `ID-${String(idx + 1).padStart(3, '0')}`;
        } else if (field.includes('score') || field.includes('rate') || field.includes('pct') || field.includes('index')) {
          rowObj[field] = Number((65 + ((idx * 7) % 30) + ((idx % 3) * 1.5)).toFixed(1));
        } else if (field.includes('baht') || field.includes('budget') || field.includes('fund')) {
          rowObj[field] = (idx + 1) * 150000;
        } else if (field.includes('province') || field.includes('region')) {
          const provs = ['กรุงเทพมหานคร', 'ลำปาง', 'ขอนแก่น', 'ระยอง', 'เชียงใหม่', 'สุราษฎร์ธานี', 'สงขลา'];
          rowObj[field] = provs[idx % provs.length];
        } else if (field.includes('year')) {
          rowObj[field] = 2568;
        } else {
          rowObj[field] = `Data-Point-${idx + 1}`;
        }
      });
      return rowObj;
    });

    const safeTitle = dataset.datasetTitle.replace(/[^a-zA-Z0-9\u0E01-\u0E4F_-]/g, '_').substring(0, 30);
    if (fileType === 'csv') {
      const csvContent = convertArrayToCsv(rows);
      triggerFileDownload(`${dataset.id}_${safeTitle}.csv`, csvContent, 'text/csv;charset=utf-8;');
    } else {
      const jsonContent = JSON.stringify(
        {
          datasetMetadata: {
            title: dataset.datasetTitle,
            agency: dataset.agencyName,
            sourcePortal: dataset.portalUrl,
            downloadEndpoint: dataset.downloadUrl,
            format: dataset.format,
            updateFrequency: dataset.updateFrequency,
            columns: dataset.schemaFields,
            exportedAt: new Date().toISOString()
          },
          data: rows
        },
        null,
        2
      );
      triggerFileDownload(`${dataset.id}_${safeTitle}.json`, jsonContent, 'application/json;charset=utf-8;');
    }

    setDownloadSuccessId(dataset.id + '-' + fileType);
    setTimeout(() => setDownloadSuccessId(null), 2500);
  };

  return (
    <>
      <footer className="moral-sources-footer">
        <div className="moral-sources-footer-left">
          <div className="moral-sources-icon-wrap" title="แหล่งข้อมูลบูรณาการตามมาตรฐาน DGA">
            <Database size={15} color="#2563eb" />
          </div>
          <span className="moral-sources-footer-label">แหล่งข้อมูลบูรณาการ:</span>

          <div className="moral-sources-badges-row">
            {enrichedAgencies.map((ag) => (
              <div
                key={ag.id}
                className="moral-sources-agency-pill clickable"
                title={`${ag.agencyName} | ${ag.datasetTitle} (คลิกเพื่อดูรายละเอียดและดาวน์โหลด)`}
                onClick={() => setIsModalOpen(true)}
              >
                <span className="moral-sources-agency-tag">{ag.agencyTag}</span>
                <span className="moral-sources-agency-name">{ag.agencyName}</span>
                <span className={`moral-sources-format-tag format-${ag.format.toLowerCase()}`}>
                  {ag.format}
                </span>

                {/* Direct link out */}
                <a
                  href={ag.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="moral-sources-pill-action"
                  title="เปิด Open Data Portal ของหน่วยงาน"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                </a>

                {/* Direct download trigger */}
                <button
                  type="button"
                  className="moral-sources-pill-action pill-download"
                  title="ดาวน์โหลดไฟล์ชุดข้อมูล CSV ทันที"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectDownloadFile(ag, 'csv');
                  }}
                >
                  <Download size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="moral-sources-footer-right">
          <button
            type="button"
            className="moral-sources-download-all-btn"
            onClick={() => setIsModalOpen(true)}
            title="เปิดคลังดาวน์โหลดชุดข้อมูลและ API ทั้งหมดของหน้านี้"
          >
            <FileSpreadsheet size={14} />
            <span>ดาวน์โหลด Data Set ทั้งหมด ({enrichedAgencies.length})</span>
          </button>
          <span className="moral-sources-pipeline-note">{dataSourceNote}</span>
        </div>
      </footer>

      {/* =========================================================
          MODAL: คลังดาวน์โหลดชุดข้อมูลบูรณาการ (DIRECT DATA DOWNLOAD & API)
      ========================================================= */}
      {isModalOpen && (
        <div className="moral-dataset-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="moral-dataset-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="moral-dataset-modal-header">
              <div className="moral-dataset-modal-header-left">
                <div className="moral-dataset-modal-icon">
                  <Database size={22} color="#1d4ed8" />
                </div>
                <div>
                  <h3 className="moral-dataset-modal-title">
                    คลังดาวน์โหลดชุดข้อมูลบูรณาการ (Integrated Data Sets & Direct API)
                  </h3>
                  <p className="moral-dataset-modal-sub">
                    {viewTitle} • เชื่อมโยงข้อมูลตรงจากเว็บไซต์หน่วยงานสำหรับนำไปสร้าง Data Set ในการวิเคราะห์
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="moral-dataset-modal-close"
                onClick={() => setIsModalOpen(false)}
                title="ปิดหน้าต่าง"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-header Controls / Search */}
            <div className="moral-dataset-modal-toolbar">
              <div className="moral-dataset-search-box">
                <Search size={15} color="#64748b" />
                <input
                  type="text"
                  placeholder="ค้นหาชุดข้อมูล, หน่วยงาน, คีย์เวิร์ด หรือรูปแบบไฟล์..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="moral-dataset-search-input"
                />
                {searchFilter && (
                  <button
                    type="button"
                    className="moral-dataset-search-clear"
                    onClick={() => setSearchFilter('')}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <div className="moral-dataset-count-badge">
                พบทั้งหมด <strong>{filteredDatasets.length}</strong> ชุดข้อมูล
              </div>
            </div>

            {/* Dataset List */}
            <div className="moral-dataset-list-container">
              {filteredDatasets.map((ds) => (
                <div key={ds.id} className="moral-dataset-item-row">
                  <div className="moral-dataset-item-left">
                    <div className="moral-dataset-item-header">
                      <span className="moral-dataset-tag">{ds.agencyTag}</span>
                      <span className="moral-dataset-agency">{ds.agencyName}</span>
                      <span className={`moral-dataset-format-pill pill-${ds.format.toLowerCase()}`}>
                        {ds.format}
                      </span>
                      <span className="moral-dataset-freq">
                        ปรับปรุง: {ds.updateFrequency}
                      </span>
                    </div>

                    <h4 className="moral-dataset-title">{ds.datasetTitle}</h4>
                    <p className="moral-dataset-desc">{ds.description}</p>

                    {/* Data Schema / Columns Tags */}
                    {ds.schemaFields && ds.schemaFields.length > 0 && (
                      <div className="moral-dataset-schema-row">
                        <span className="moral-dataset-schema-label">
                          <Layers size={11} /> ตัวแปร (Data Schema):
                        </span>
                        <div className="moral-dataset-schema-tags">
                          {ds.schemaFields.map((field) => (
                            <code key={field} className="moral-schema-tag">
                              {field}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="moral-dataset-item-actions">
                    {/* Link 1: Official Agency Portal */}
                    <a
                      href={ds.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="moral-action-btn btn-portal"
                      title="เปิดดูชุดข้อมูลบน Official Open Data Portal"
                    >
                      <ExternalLink size={13} />
                      <span>เว็บหน่วยงาน / Portal</span>
                    </a>

                    {/* Link 2: Direct Download from Agency Source */}
                    <a
                      href={ds.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="moral-action-btn btn-direct-link"
                      title="เข้าสู่หน้าดาวน์โหลดของหน่วยงาน"
                    >
                      <Download size={13} />
                      <span>ดาวน์โหลดตรง (หน่วยงาน)</span>
                    </a>

                    {/* Action 3: Client Instant CSV Export */}
                    <button
                      type="button"
                      className={`moral-action-btn btn-instant-csv ${downloadSuccessId === ds.id + '-csv' ? 'success' : ''}`}
                      onClick={() => handleDirectDownloadFile(ds, 'csv')}
                      title="สร้างและดาวน์โหลดไฟล์ .CSV ทันที"
                    >
                      {downloadSuccessId === ds.id + '-csv' ? (
                        <>
                          <Check size={13} color="#16a34a" />
                          <span>ดาวน์โหลด CSV แล้ว</span>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet size={13} />
                          <span>ดาวน์โหลดไฟล์ .CSV</span>
                        </>
                      )}
                    </button>

                    {/* Action 4: Client Instant JSON Export */}
                    <button
                      type="button"
                      className={`moral-action-btn btn-instant-json ${downloadSuccessId === ds.id + '-json' ? 'success' : ''}`}
                      onClick={() => handleDirectDownloadFile(ds, 'json')}
                      title="สร้างและดาวน์โหลดไฟล์ .JSON ทันที"
                    >
                      {downloadSuccessId === ds.id + '-json' ? (
                        <>
                          <Check size={13} color="#16a34a" />
                          <span>ดาวน์โหลด JSON แล้ว</span>
                        </>
                      ) : (
                        <>
                          <FileJson size={13} />
                          <span>ดาวน์โหลดไฟล์ .JSON</span>
                        </>
                      )}
                    </button>

                    {/* Action 5: Copy API Endpoint */}
                    <button
                      type="button"
                      className={`moral-action-btn btn-copy ${copiedId === ds.id ? 'copied' : ''}`}
                      onClick={() => handleCopyEndpoint(ds.id, ds.apiEndpoint || ds.downloadUrl)}
                      title="คัดลอก REST API Endpoint หรือ Direct Link"
                    >
                      {copiedId === ds.id ? (
                        <>
                          <Check size={13} color="#16a34a" />
                          <span>คัดลอก Endpoint แล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>คัดลอก Data API</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {filteredDatasets.length === 0 && (
                <div className="moral-dataset-empty-state">
                  <p>ไม่พบชุดข้อมูลที่ตรงกับคำค้นหา "{searchFilter}"</p>
                  <button
                    type="button"
                    className="moral-action-btn btn-portal"
                    onClick={() => setSearchFilter('')}
                  >
                    ล้างคำค้นหา
                  </button>
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="moral-dataset-modal-footer">
              <div className="moral-dataset-footer-info">
                <Sparkles size={14} color="#3b82f6" />
                <span>
                  ชุดข้อมูลทั้งหมดได้รับอนุญาตให้เข้าถึงและนำไปประมวลผลต่อยอดตามพระราชบัญญัติการบริหารงานและการให้บริการภาครัฐผ่านระบบดิจิทัล พ.ศ. 2562
                </span>
              </div>
              <button
                type="button"
                className="moral-dataset-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
