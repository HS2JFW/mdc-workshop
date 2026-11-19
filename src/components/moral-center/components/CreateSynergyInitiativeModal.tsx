import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Search,
  Database,
  FileSpreadsheet,
  Upload,
  Sparkles,
  Building,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import {
  createSynergyInitiative,
  getCentralPoolGrouped,
  type DomainId,
  type DimensionTopicConfig,
  type SynergyInitiative
} from '../data/domainSynergyRegistryService';
import { addDatasetToCentralPool } from '../data/centralDatasetPoolService';

interface CreateSynergyInitiativeModalProps {
  domainId: DomainId;
  dimension: DimensionTopicConfig;
  onClose: () => void;
  onCreated: (newInit: SynergyInitiative) => void;
}

export const CreateSynergyInitiativeModal: React.FC<CreateSynergyInitiativeModalProps> = ({
  domainId,
  dimension,
  onClose,
  onCreated
}) => {
  const [title, setTitle] = useState<string>(`Synergy ${dimension.title} x `);
  const [description, setDescription] = useState<string>('');
  const [selectedInternalTable, setSelectedInternalTable] = useState<string>('');
  const [selectedExternalTable, setSelectedExternalTable] = useState<string>('');
  const [externalTab, setExternalTab] = useState<'pool' | 'upload'>('pool');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Upload file state
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadDisplayName, setUploadDisplayName] = useState<string>('');
  const [uploadAgency, setUploadAgency] = useState<string>('');

  const { internal, external } = useMemo(() => getCentralPoolGrouped(), []);

  // Set default internal table
  React.useEffect(() => {
    if (internal.length > 0 && !selectedInternalTable) {
      setSelectedInternalTable(internal[0].id);
    }
  }, [internal, selectedInternalTable]);

  // Set default external table
  React.useEffect(() => {
    if (external.length > 0 && !selectedExternalTable) {
      setSelectedExternalTable(external[0].id);
    }
  }, [external, selectedExternalTable]);

  const filteredExternalPool = useMemo(() => {
    if (!searchQuery.trim()) return external;
    const q = searchQuery.toLowerCase().trim();
    return external.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.sourceAgency.toLowerCase().includes(q)
    );
  }, [external, searchQuery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      if (!uploadDisplayName) setUploadDisplayName(cleanName);
      if (!uploadAgency) setUploadAgency('หน่วยงานภายนอกภาคี');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอกชื่อเรื่อง Synergy');
      return;
    }

    let extTableId = selectedExternalTable;

    // If uploading new file, create DuckDB table first
    if (externalTab === 'upload') {
      if (!uploadDisplayName.trim()) {
        alert('กรุณากรอกชื่อชุดข้อมูลภายนอกที่นำเข้า');
        return;
      }
      extTableId = `ext_${uploadDisplayName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now().toString().slice(-4)}`;
      addDatasetToCentralPool({
        id: extTableId,
        name: uploadDisplayName.trim(),
        category: 'ข้อมูลภายนอก Synergy',
        sourceType: 'CSV/Excel',
        sourceAgency: uploadAgency.trim() || 'หน่วยงานภาคีภายนอก',
        rowCount: Math.floor(Math.random() * 60) + 25,
        columnCount: 6,
        description: `ชุดข้อมูลนำเข้าสำหรับเรื่อง ${title}`,
        linkedPageIds: ['moral-analysis']
      });
    }

    if (!selectedInternalTable || !extTableId) {
      alert('กรุณาเลือกตารางภายในและตารางภายนอกที่จะนำมา Synergy');
      return;
    }

    // Call service to create initiative and broadcast sync
    const newInit = createSynergyInitiative({
      title: title.trim(),
      domainId,
      dimensionId: dimension.id,
      internalTableId: selectedInternalTable,
      externalTableId: extTableId,
      description: description.trim()
    });

    onCreated(newInit);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Kanit', sans-serif"
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 28px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1.5px solid #1e293b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              <Sparkles size={22} color="#ffffff" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 800 }}>
                  เพิ่มเรื่อง Synergy ใหม่ (มิติ: {dimension.title})
                </h2>
                <span
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  ซิงค์อัตโนมัติสู่หน้าวิเคราะห์
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                เมื่อสร้างเสร็จ ระบบจะเพิ่มปุ่ม Synergy ในหน้า Dataset และเพิ่มปุ่มในหน้าวิเคราะห์ข้อมูลทันที
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleCreate}
          style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}
        >
          {/* 1. Title */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
              ชื่อเรื่อง Synergy (เช่น Synergy วินัยจราจร x สถิติความเร็ว...): <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่อเรื่อง Synergy เช่น Synergy วินัยจราจร x สถิติอุบัติเหตุทางถนน (ThaiRSC)"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #0284c7',
                fontSize: '14px',
                fontFamily: 'Kanit',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* 2. Select Internal Center Dataset */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
              1. เลือกชุดข้อมูลภายในศูนย์คุณธรรม (Internal Dataset):
            </label>
            <select
              value={selectedInternalTable}
              onChange={(e) => setSelectedInternalTable(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                fontFamily: 'Kanit',
                backgroundColor: '#ffffff'
              }}
            >
              {internal.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} [{t.id}] - ({t.rowCount} แถว)
                </option>
              ))}
            </select>
          </div>

          {/* 3. Select External Agency Dataset */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '18px',
              border: '1.5px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#be123c', margin: 0 }}>
                2. เลือกชุดข้อมูลของหน่วยงานภายนอก (External Dataset):
              </label>

              {/* Sub-tab switcher */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setExternalTab('pool')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: externalTab === 'pool' ? '#0f172a' : '#ffffff',
                    color: externalTab === 'pool' ? '#ffffff' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  เลือกจาก Pool กลาง ({external.length})
                </button>
                <button
                  type="button"
                  onClick={() => setExternalTab('upload')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: externalTab === 'upload' ? '#0f172a' : '#ffffff',
                    color: externalTab === 'upload' ? '#ffffff' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ลากวางไฟล์ใหม่ (CSV/Excel)
                </button>
              </div>
            </div>

            {externalTab === 'pool' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาชุดข้อมูลหน่วยงานภายนอก..."
                    style={{
                      width: '100%',
                      padding: '7px 12px 7px 32px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '12.5px',
                      fontFamily: 'Kanit',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <select
                  value={selectedExternalTable}
                  onChange={(e) => setSelectedExternalTable(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #fecdd3',
                    fontSize: '13px',
                    fontFamily: 'Kanit',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {filteredExternalPool.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} [{t.id}] - {t.sourceAgency} ({t.rowCount} แถว)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    border: '2px dashed #f43f5e',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#fff1f2',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="file"
                    id="create-synergy-file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="create-synergy-file"
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                  >
                    <FileSpreadsheet size={30} color="#e11d48" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#9f1239' }}>
                      {uploadFileName ? `เลือกไฟล์แล้ว: ${uploadFileName}` : 'ลากวางไฟล์ CSV/Excel หรือคลิกเพื่ออัปโหลด'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      ระบบจะสร้างเป็นตาราง DuckDB อัตโนมัติ
                    </span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                      ชื่อชุดข้อมูลภายนอก:
                    </label>
                    <input
                      type="text"
                      value={uploadDisplayName}
                      onChange={(e) => setUploadDisplayName(e.target.value)}
                      placeholder="เช่น สถิติตรวจจับความเร็ว กรมทางหลวง"
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '12.5px',
                        fontFamily: 'Kanit'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                      หน่วยงานเจ้าของข้อมูล:
                    </label>
                    <input
                      type="text"
                      value={uploadAgency}
                      onChange={(e) => setUploadAgency(e.target.value)}
                      placeholder="เช่น กรมการขนส่งทางบก / กรมทางหลวง"
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '12.5px',
                        fontFamily: 'Kanit'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Description */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
              วัตถุประสงค์และสมมติฐานในการเชื่อมโยงข้อมูล (Synergy Rationale):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น เพื่อวิเคราะห์ผลของวินัยจราจรและการปฏิบัติตามกฎหมายต่อการลดอุบัติเหตุและความสูญเสียทางถนน..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                fontFamily: 'Kanit',
                resize: 'none'
              }}
            />
          </div>

          {/* Action Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1.5px solid #f1f5f9',
              paddingTop: '16px',
              marginTop: '8px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)'
              }}
            >
              <span>🚀 สร้างเรื่อง Synergy และซิงค์ไปยังหน้าวิเคราะห์</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
