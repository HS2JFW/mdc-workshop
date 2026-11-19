import React, { useState, useMemo } from 'react';
import {
  Database,
  Building,
  Search,
  ExternalLink,
  Table as TableIcon,
  Layers,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import {
  getCentralPoolGrouped,
  type ResolvedDatasetMeta
} from '../data/domainSynergyRegistryService';

interface CentralPoolDualViewProps {
  onSelectTable: (tableId: string) => void;
  selectedTableId: string;
}

export const CentralPoolDualView: React.FC<CentralPoolDualViewProps> = ({
  onSelectTable,
  selectedTableId
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { internal, external } = useMemo(() => {
    return getCentralPoolGrouped();
  }, []);

  const filterList = (list: ResolvedDatasetMeta[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.sourceAgency.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );
  };

  const filteredInternal = useMemo(() => filterList(internal), [internal, searchQuery]);
  const filteredExternal = useMemo(() => filterList(external), [external, searchQuery]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginBottom: '26px',
        fontFamily: "'Kanit', sans-serif"
      }}
    >
      {/* Search Header for Central Pool */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          padding: '16px 24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}
          >
            <Database size={22} />
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              คลังข้อมูล Pool กลางทั้งหมด (Central Dataset Pool)
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
              รวมชุดข้อมูลทั้งหมดใน DuckDB และ SQLite แบ่งแยกเป็น 2 กรุ๊ป: ภายในศูนย์คุณธรรม และ ภายนอกจากหน่วยงานอื่น
            </p>
          </div>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อชุดข้อมูล, หน่วยงาน, ID..."
            style={{
              padding: '8px 14px 8px 36px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '13px',
              fontFamily: 'Kanit',
              outline: 'none',
              width: '280px',
              backgroundColor: '#f8fafc'
            }}
          />
        </div>
      </div>

      {/* 2 DISTINCT PANELS (GROUPS) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '20px'
        }}
      >
        {/* =====================================================================
            GROUP 1: ข้อมูลภายในศูนย์คุณธรรม (INTERNAL DATASETS)
        ===================================================================== */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '2px solid #bfdbfe',
            boxShadow: '0 6px 20px rgba(2, 132, 199, 0.06)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#eff6ff',
              borderBottom: '1.5px solid #dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}
              >
                กรุ๊ปที่ 1
              </span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e3a8a' }}>
                ข้อมูลภายในศูนย์คุณธรรม (Internal Datasets)
              </h3>
            </div>

            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
              {filteredInternal.length} ชุดข้อมูล
            </span>
          </div>

          {/* Cards List */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '560px', overflowY: 'auto' }}>
            {filteredInternal.map((ds) => {
              const isSelected = ds.id === selectedTableId;
              return (
                <div
                  key={ds.id}
                  onClick={() => onSelectTable(ds.id)}
                  style={{
                    backgroundColor: isSelected ? '#f0f9ff' : '#f8fafc',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    boxShadow: isSelected ? '0 4px 14px rgba(2, 132, 199, 0.15)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#0284c7', fontFamily: 'monospace', fontWeight: 600 }}>
                      {ds.id}
                    </span>
                    {isSelected ? (
                      <span
                        style={{
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '1px 7px',
                          borderRadius: '8px'
                        }}
                      >
                        กำลังดูข้อมูลตารางนี้
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {ds.rowCount} แถว
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    {ds.name}
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    {ds.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '6px',
                      marginTop: '4px',
                      fontSize: '11.5px',
                      color: '#475569'
                    }}
                  >
                    <span>{ds.sourceAgency}</span>
                    <span style={{ color: '#0284c7', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span>ดูตารางจริง</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            GROUP 2: ข้อมูลภายนอกจากหน่วยงานอื่น (EXTERNAL DATASETS)
        ===================================================================== */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '2px solid #fecdd3',
            boxShadow: '0 6px 20px rgba(225, 29, 72, 0.06)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#fff1f2',
              borderBottom: '1.5px solid #ffe4e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  backgroundColor: '#e11d48',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}
              >
                กรุ๊ปที่ 2
              </span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#881337' }}>
                ข้อมูลภายนอกจากหน่วยงานอื่น (External Synergy Datasets)
              </h3>
            </div>

            <span style={{ fontSize: '12px', fontWeight: 700, color: '#be123c' }}>
              {filteredExternal.length} ชุดข้อมูล
            </span>
          </div>

          {/* Cards List */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '560px', overflowY: 'auto' }}>
            {filteredExternal.map((ds) => {
              const isSelected = ds.id === selectedTableId;
              return (
                <div
                  key={ds.id}
                  onClick={() => onSelectTable(ds.id)}
                  style={{
                    backgroundColor: isSelected ? '#fff1f2' : '#f8fafc',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    border: isSelected ? '2px solid #e11d48' : '1px solid #e2e8f0',
                    boxShadow: isSelected ? '0 4px 14px rgba(225, 29, 72, 0.15)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#e11d48', fontFamily: 'monospace', fontWeight: 600 }}>
                      {ds.id}
                    </span>
                    {isSelected ? (
                      <span
                        style={{
                          backgroundColor: '#e11d48',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '1px 7px',
                          borderRadius: '8px'
                        }}
                      >
                        กำลังดูข้อมูลตารางนี้
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {ds.rowCount} แถว
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    {ds.name}
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    {ds.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '6px',
                      marginTop: '4px',
                      fontSize: '11.5px',
                      color: '#475569'
                    }}
                  >
                    <span>{ds.sourceAgency}</span>
                    <span style={{ color: '#e11d48', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span>ดูตารางจริง</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
