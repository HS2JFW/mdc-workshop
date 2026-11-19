import React from 'react';
import { ExternalLink, Download, Database, FileSpreadsheet, Globe, CheckCircle2 } from 'lucide-react';

export interface ExternalSynergySourceBannerProps {
  agencyName: string;
  datasetTitle: string;
  directDownloadUrl: string;
  directDownloadLabel?: string;
  officialPortalUrl?: string;
  officialPortalLabel?: string;
  fileFormats?: string[];
  accentColor?: string;
  datasetCode?: string;
  description?: string;
  className?: string;
}

export const ExternalSynergySourceBanner: React.FC<ExternalSynergySourceBannerProps> = ({
  agencyName,
  datasetTitle,
  directDownloadUrl,
  directDownloadLabel = 'หน้าดาวน์โหลดชุดข้อมูลโดยตรง (data.go.th)',
  officialPortalUrl,
  officialPortalLabel = 'เว็บไซต์ทางการของหน่วยงาน',
  fileFormats = ['CSV', 'XLSX', 'API'],
  accentColor = '#2563eb',
  datasetCode,
  description = 'ข้อมูลตารางชุดนี้บูรณาการร่วมกับ Big Data ภาครัฐ ท่านสามารถเปิดหน้าชุดข้อมูลหรือกดดาวน์โหลดไฟล์ต้นฉบับได้โดยตรง',
  className = ''
}) => {
  return (
    <div
      className={`external-synergy-source-banner ${className}`}
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        border: '1.5px solid #e2e8f0',
        borderLeft: `5px solid ${accentColor}`,
        borderRadius: '14px',
        padding: '16px 20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '14px'
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: accentColor,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Database size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '0.01em'
                }}
              >
                แหล่งที่มาและลิงก์ดาวน์โหลดข้อมูลภายนอกโดยตรง
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#dcfce7',
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                <CheckCircle2 size={13} />
                <span>Verified Data Source</span>
              </span>
              {datasetCode && (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}
                >
                  {datasetCode}
                </span>
              )}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              {description}
            </div>
          </div>
        </div>

        {/* Agency Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '20px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            fontWeight: 700,
            color: '#334155'
          }}
        >
          <Globe size={15} style={{ color: accentColor }} />
          <span>หน่วยงานเจ้าของข้อมูล: <strong style={{ color: '#0f172a' }}>{agencyName}</strong></span>
        </div>
      </div>

      {/* Dataset Title & File Format Chips */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '10px',
          background: '#ffffff',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <FileSpreadsheet size={18} style={{ color: accentColor, flexShrink: 0 }} />
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
            {datasetTitle}
          </div>
        </div>

        {/* File Format Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>รูปแบบไฟล์:</span>
          {fileFormats.map((fmt) => (
            <span
              key={fmt}
              style={{
                display: 'inline-block',
                padding: '2px 7px',
                borderRadius: '5px',
                background: fmt === 'CSV' ? '#e0f2fe' : fmt === 'XLSX' ? '#dcfce7' : '#f3e8ff',
                color: fmt === 'CSV' ? '#0369a1' : fmt === 'XLSX' ? '#15803d' : '#7e22ce',
                fontSize: '11.5px',
                fontWeight: 800,
                letterSpacing: '0.03em'
              }}
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginTop: '2px'
        }}
      >
        {/* Primary Action: Direct Download URL */}
        <a
          href={directDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '10px',
            background: accentColor,
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          title={`คลิกเพื่อเปิดหน้าดาวน์โหลดชุดข้อมูลโดยตรง: ${directDownloadUrl}`}
        >
          <Download size={16} />
          <span>{directDownloadLabel}</span>
          <ExternalLink size={14} style={{ opacity: 0.85 }} />
        </a>

        {/* Secondary Action: Official Portal URL */}
        {officialPortalUrl && (
          <a
            href={officialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: '#334155',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            title={`คลิกเพื่อเข้าสู่เว็บไซต์ทางการของหน่วยงาน: ${officialPortalUrl}`}
          >
            <Globe size={16} style={{ color: '#64748b' }} />
            <span>{officialPortalLabel}</span>
            <ExternalLink size={14} style={{ opacity: 0.7 }} />
          </a>
        )}
      </div>
    </div>
  );
};
