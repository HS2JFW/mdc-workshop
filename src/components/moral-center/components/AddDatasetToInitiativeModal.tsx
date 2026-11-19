import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Search,
  Database,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  Building,
  Sparkles
} from 'lucide-react';
import {
  getCentralPoolGrouped,
  addTableToInitiative,
  type SynergyInitiative,
  type ResolvedDatasetMeta
} from '../data/domainSynergyRegistryService';
import { addDatasetToCentralPool } from '../data/centralDatasetPoolService';

interface AddDatasetToInitiativeModalProps {
  initiative: SynergyInitiative;
  onClose: () => void;
  onAdded: () => void;
}

export const AddDatasetToInitiativeModal: React.FC<AddDatasetToInitiativeModalProps> = ({
  initiative,
  onClose,
  onAdded
}) => {
  const [activeTab, setActiveTab] = useState<'pool' | 'upload'>('pool');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [datasetType, setDatasetType] = useState<'internal' | 'external'>('external');

  // File upload state
  const [fileName, setFileName] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [agency, setAgency] = useState<string>('ศูนย์คุณธรรม (นำเข้าเพิ่มเติม)');
  const [description, setDescription] = useState<string>('');
  const [rowCount, setRowCount] = useState<number>(30);

  const { internal, external } = useMemo(() => getCentralPoolGrouped(), []);

  // Filter pool items not yet in initiative
  const existingSet = useMemo(() => {
    return new Set([...initiative.internalTableIds, ...initiative.externalTableIds]);
  }, [initiative]);

  const poolOptions = useMemo(() => {
    const list = datasetType === 'internal' ? internal : external;
    let filtered = list.filter((item) => !existingSet.has(item.id));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          i.sourceAgency.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [datasetType, internal, external, existingSet, searchQuery]);

  const handleAddFromPool = () => {
    if (!selectedTableId) {
      alert('กรุณาเลือกชุดข้อมูลที่ต้องการเพิ่ม');
      return;
    }
    const isExt = datasetType === 'external';
    addTableToInitiative(initiative.id, selectedTableId, isExt);
    onAdded();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      if (!displayName) setDisplayName(cleanName);
      setRowCount(Math.floor(Math.random() * 80) + 20);
    }
  };

  const handleCreateAndUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert('กรุณากรอกชื่อชุดข้อมูล');
      return;
    }

    const tableId = `syn_${(displayName || 'custom').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now().toString().slice(-4)}`;
    const isExt = datasetType === 'external';

    // 1. Add to Central Pool DuckDB
    addDatasetToCentralPool({
      id: tableId,
      name: displayName.trim(),
      category: isExt ? 'ข้อมูลภายนอก Synergy' : 'ข้อมูลศูนย์คุณธรรม',
      sourceType: 'CSV/Excel',
      sourceAgency: agency.trim() || 'หน่วยงานภาคี',
      rowCount: rowCount,
      columnCount: 6,
      description: description.trim() || `ชุดข้อมูลสำหรับ ${initiative.title}`,
      linkedPageIds: [initiative.targetPageId]
    });

    // 2. Add to Initiative
    addTableToInitiative(initiative.id, tableId, isExt);
    onAdded();
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
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 26px',
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
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Plus size={22} color="#ffffff" />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                เพิ่มชุดข้อมูลเข้าสู่ Synergy
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
                {initiative.title}
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

        {/* Tab switcher: Pool vs Upload */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            padding: '8px 26px',
            borderBottom: '1.5px solid #e2e8f0',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('pool')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'pool' ? '#0f172a' : 'transparent',
              color: activeTab === 'pool' ? '#ffffff' : '#64748b',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Database size={15} />
            <span>เลือกจาก Pool กลาง (Central Pool)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'upload' ? '#0f172a' : 'transparent',
              color: activeTab === 'upload' ? '#ffffff' : '#64748b',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Upload size={15} />
            <span>ลากวางไฟล์ (Drag & Drop CSV/Excel)</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 26px' }}>
          {/* Target Group Radio */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
              ระบุประเภทของชุดข้อมูล:
            </label>
            <div style={{ display: 'flex', gap: '14px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: datasetType === 'internal' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: datasetType === 'internal' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: datasetType === 'internal' ? '#0284c7' : '#475569'
                }}
              >
                <input
                  type="radio"
                  name="datasetType"
                  checked={datasetType === 'internal'}
                  onChange={() => setDatasetType('internal')}
                  style={{ display: 'none' }}
                />
                <span>ข้อมูลภายในศูนย์คุณธรรม (Internal)</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: datasetType === 'external' ? '2px solid #e11d48' : '1px solid #cbd5e1',
                  backgroundColor: datasetType === 'external' ? '#fff1f2' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: datasetType === 'external' ? '#e11d48' : '#475569'
                }}
              >
                <input
                  type="radio"
                  name="datasetType"
                  checked={datasetType === 'external'}
                  onChange={() => setDatasetType('external')}
                  style={{ display: 'none' }}
                />
                <span>ข้อมูลภายนอกจากหน่วยงานอื่น (External Synergy)</span>
              </label>
            </div>
          </div>

          {/* TAB 1: POOL SELECTION */}
          {activeTab === 'pool' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชุดข้อมูลใน Pool กลาง..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'Kanit'
                  }}
                />
              </div>

              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'Kanit',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="">-- เลือกชุดข้อมูลที่ต้องการเพิ่ม ({poolOptions.length} รายการพร้อมเพิ่ม) --</option>
                {poolOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} [{opt.id}] - {opt.sourceAgency} ({opt.rowCount} แถว)
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleAddFromPool}
                  disabled={!selectedTableId}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: selectedTableId ? '#0284c7' : '#cbd5e1',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: selectedTableId ? 'pointer' : 'not-allowed',
                    boxShadow: selectedTableId ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none'
                  }}
                >
                  <Plus size={16} />
                  <span>เพิ่มเข้าสู่ Synergy นี้</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DRAG & DROP FILE */}
          {activeTab === 'upload' && (
            <form onSubmit={handleCreateAndUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  border: '2px dashed #0284c7',
                  borderRadius: '14px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="file"
                  id="drag-drop-file-upload"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="drag-drop-file-upload"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FileSpreadsheet size={34} color="#0284c7" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                    {fileName ? `ไฟล์ที่เลือก: ${fileName}` : 'ลากวางไฟล์ CSV หรือ Excel ที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    ระบบจะทำการแปลงเป็นตาราง DuckDB อัตโนมัติและเชื่อมโยงกับ Synergy ทันที
                  </span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    ชื่อชุดข้อมูล (Display Name):
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น สถิติอุบัติเหตุรายอำเภอ 2568"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'Kanit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    หน่วยงานเจ้าของข้อมูล:
                  </label>
                  <input
                    type="text"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    placeholder="เช่น กรมควบคุมโรค / ThaiRSC"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'Kanit'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  คำอธิบายชุดข้อมูล:
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="วัตถุประสงค์ในการนำมา Synergy และตัวชี้วัดสำคัญ"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'Kanit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Plus size={16} />
                  <span>สร้างตาราง DuckDB และบรรจุเข้าสู่ Synergy นี้</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
