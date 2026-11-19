import React, { useState, useMemo } from 'react';
import {
  X,
  Trash2,
  Edit2,
  Plus,
  Check,
  Building,
  Database,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  Search,
  Upload,
  Layers
} from 'lucide-react';
import {
  type DomainId,
  type SynergySubmenuItem,
  resolveDatasetMeta,
  unlinkTableFromSubmenu,
  linkTableToSubmenu,
  type ResolvedDatasetMeta
} from '../data/domainSynergyRegistryService';
import {
  getCentralPoolDatasets,
  addDatasetToCentralPool,
  type DatasetPoolItem
} from '../data/centralDatasetPoolService';

interface SynergyGroupEditModalProps {
  domainId: DomainId;
  submenu: SynergySubmenuItem;
  onClose: () => void;
  onUpdated: () => void;
}

export const SynergyGroupEditModal: React.FC<SynergyGroupEditModalProps> = ({
  domainId,
  submenu,
  onClose,
  onUpdated
}) => {
  const [activeAddTab, setActiveAddTab] = useState<'existing' | 'upload'>('existing');
  const [selectedPoolTableId, setSelectedPoolTableId] = useState<string>('');
  const [searchPoolQuery, setSearchPoolQuery] = useState<string>('');
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editAgency, setEditAgency] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New dataset upload form state
  const [newTableName, setNewTableName] = useState<string>('');
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [newAgency, setNewAgency] = useState<string>('ศูนย์คุณธรรม (นำเข้าเพิ่มเติม)');
  const [newDesc, setNewDesc] = useState<string>('');
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadRowCount, setUploadRowCount] = useState<number>(20);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Resolve current tables in submenu
  const currentDatasets: ResolvedDatasetMeta[] = useMemo(() => {
    return (submenu.tableIds || []).map((id: string) => resolveDatasetMeta(id));
  }, [submenu.tableIds]);

  // Available datasets from Central Pool not yet in this submenu
  const availablePoolDatasets = useMemo(() => {
    const pool = getCentralPoolDatasets();
    const existingSet = new Set(submenu.tableIds || []);
    let list = pool.filter((p) => !existingSet.has(p.id));

    if (searchPoolQuery.trim()) {
      const q = searchPoolQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.sourceAgency.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [submenu.tableIds, searchPoolQuery]);

  // Unlink table handler
  const handleUnlink = (tableId: string) => {
    if (confirm(`คุณต้องการปลดชุดข้อมูล "${tableId}" ออกจากกลุ่ม Synergy นี้ใช่หรือไม่?`)) {
      unlinkTableFromSubmenu(domainId, submenu.id, tableId);
      showToast('🗑️ ปลดชุดข้อมูลออกจากกลุ่มเรียบร้อย');
      onUpdated();
    }
  };

  // Add existing table handler
  const handleAddExisting = () => {
    if (!selectedPoolTableId) {
      alert('กรุณาเลือกชุดข้อมูลที่ต้องการเพิ่ม');
      return;
    }
    linkTableToSubmenu(domainId, submenu.id, selectedPoolTableId);
    showToast('✨ เพิ่มชุดข้อมูลเข้ากลุ่ม Synergy สำเร็จ');
    setSelectedPoolTableId('');
    onUpdated();
  };

  // Start editing a table's metadata
  const handleStartEdit = (ds: ResolvedDatasetMeta) => {
    setEditingTableId(ds.id);
    setEditName(ds.name);
    setEditDesc(ds.description);
    setEditAgency(ds.sourceAgency);
  };

  // Save edited metadata
  const handleSaveEdit = (tableId: string) => {
    // Add/Update in Central Pool
    addDatasetToCentralPool({
      id: tableId,
      name: editName,
      category: 'Synergy Custom',
      sourceType: 'DuckDB',
      sourceAgency: editAgency,
      description: editDesc,
      linkedPageIds: []
    });

    setEditingTableId(null);
    showToast('💾 บันทึกการแก้ไขข้อมูลสำเร็จ');
    onUpdated();
  };

  // Handle mock file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      if (!newDisplayName) setNewDisplayName(cleanName);
      if (!newTableName) {
        setNewTableName(
          `syn_${cleanName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now().toString().slice(-4)}`
        );
      }
      setUploadRowCount(Math.floor(Math.random() * 80) + 15);
    }
  };

  // Submit new dataset creation
  const handleCreateNewDataset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) {
      alert('กรุณาระบุชื่อชุดข้อมูล');
      return;
    }

    const tableId = (newTableName || `custom_${Date.now()}`).trim().replace(/\s+/g, '_').toLowerCase();

    // 1. Add to central pool
    addDatasetToCentralPool({
      id: tableId,
      name: newDisplayName.trim(),
      category: 'ข้อมูลนำเข้า Synergy',
      sourceType: 'CSV/Excel',
      sourceAgency: newAgency.trim() || 'ศูนย์คุณธรรม',
      rowCount: uploadRowCount,
      columnCount: 6,
      description: newDesc.trim() || `ชุดข้อมูลที่นำเข้าสำหรับมิติ ${submenu.title}`,
      linkedPageIds: []
    });

    // 2. Link to this submenu
    linkTableToSubmenu(domainId, submenu.id, tableId);

    showToast('🎉 นำเข้าและเชื่อมโยงชุดข้อมูลใหม่เข้ากลุ่ม Synergy สำเร็จ!');
    // Reset form
    setNewTableName('');
    setNewDisplayName('');
    setNewDesc('');
    setUploadFileName(null);
    onUpdated();
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
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 100001,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            fontSize: '13.5px',
            fontWeight: 700
          }}
        >
          {toastMessage}
        </div>
      )}

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* =====================================================================
            1. MODAL HEADER
        ===================================================================== */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: submenu.color || '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              <Edit2 size={20} color="#ffffff" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                  จัดการกลุ่ม Synergy: {submenu.title}
                </h2>
                <span
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {currentDatasets.length} ชุดข้อมูล
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                {submenu.description}
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
              padding: '6px',
              borderRadius: '8px',
              display: 'flex'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* =====================================================================
            2. MODAL BODY (SCROLLABLE)
        ===================================================================== */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* SECTION 1: Current Datasets in this Synergy Group */}
          <div style={{ marginBottom: '28px' }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Layers size={17} color={submenu.color} />
              <span>ชุดข้อมูลที่ผูกอยู่ในกลุ่มนี้ ({currentDatasets.length})</span>
            </h3>

            {currentDatasets.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '14px',
                  border: '1.5px dashed #cbd5e1',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '13.5px'
                }}
              >
                ยังไม่มีชุดข้อมูลผูกอยู่ในกลุ่ม Synergy นี้ สามารถเลือกเพิ่มได้จากส่วนด้านล่าง
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentDatasets.map((ds) => {
                  const isEditing = editingTableId === ds.id;
                  return (
                    <div
                      key={ds.id}
                      style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '14px',
                        border: '1.5px solid #e2e8f0',
                        padding: '14px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {isEditing ? (
                        /* Inline Edit Form */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                              ชื่อชุดข้อมูล:
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #0284c7',
                                fontSize: '13px',
                                fontFamily: 'Kanit'
                              }}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                                หน่วยงานเจ้าของข้อมูล:
                              </label>
                              <input
                                type="text"
                                value={editAgency}
                                onChange={(e) => setEditAgency(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #cbd5e1',
                                  fontSize: '12px',
                                  fontFamily: 'Kanit'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                                คำอธิบายชุดข้อมูล:
                              </label>
                              <input
                                type="text"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #cbd5e1',
                                  fontSize: '12px',
                                  fontFamily: 'Kanit'
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => setEditingTableId(null)}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              ยกเลิก
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(ds.id)}
                              style={{
                                padding: '5px 14px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#0284c7',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              บันทึก
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal Row View */
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: '240px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  padding: '1px 8px',
                                  borderRadius: '12px',
                                  backgroundColor: ds.isExternal ? '#fff1f2' : '#eff6ff',
                                  color: ds.isExternal ? '#e11d48' : '#0284c7',
                                  border: `1px solid ${ds.isExternal ? '#fecdd3' : '#bfdbfe'}`
                                }}
                              >
                                {ds.isExternal ? 'ข้อมูลภายนอก (External)' : 'ข้อมูลศูนย์คุณธรรม (Internal)'}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                {ds.id}
                              </span>
                            </div>

                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                              {ds.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              {ds.sourceAgency} • {ds.rowCount} แถว • {ds.columnCount} คอลัมน์
                            </div>
                          </div>

                          {/* Action Buttons: Edit, Unlink */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(ds)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                fontSize: '12px',
                                color: '#334155',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title="แก้ไขข้อมูลชุดข้อมูล"
                            >
                              <Edit2 size={13} color="#0284c7" />
                              <span>แก้ไข</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUnlink(ds.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid #fecdd3',
                                backgroundColor: '#fff1f2',
                                fontSize: '12px',
                                color: '#e11d48',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title="ปลดตารางออกจากกลุ่มนี้"
                            >
                              <Trash2 size={13} />
                              <span>ปลดออก</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: Add New or Existing Dataset to this Synergy Group */}
          <div
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '16px',
              padding: '20px',
              border: '1.5px solid #e2e8f0'
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
              + เพิ่มชุดข้อมูลเข้าไปในกลุ่ม Synergy นี้
            </h3>

            {/* Sub-tabs: Select Existing vs Upload New */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setActiveAddTab('existing')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activeAddTab === 'existing' ? '#0f172a' : '#ffffff',
                  color: activeAddTab === 'existing' ? '#ffffff' : '#475569',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Database size={14} />
                <span>เลือกจากชุดข้อมูลในระบบ (Central Pool / DuckDB)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAddTab('upload')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activeAddTab === 'upload' ? '#0f172a' : '#ffffff',
                  color: activeAddTab === 'upload' ? '#ffffff' : '#475569',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Upload size={14} />
                <span>นำเข้าไฟล์ CSV/Excel ใหม่</span>
              </button>
            </div>

            {/* TAB 1: Select Existing Pool Dataset */}
            {activeAddTab === 'existing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search
                      size={15}
                      color="#94a3b8"
                      style={{ position: 'absolute', left: '12px', top: '10px' }}
                    />
                    <input
                      type="text"
                      value={searchPoolQuery}
                      onChange={(e) => setSearchPoolQuery(e.target.value)}
                      placeholder="ค้นหาชุดข้อมูลที่มีในระบบเพื่อเพิ่มเข้ากลุ่ม..."
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 36px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        fontFamily: 'Kanit',
                        backgroundColor: '#ffffff'
                      }}
                    />
                  </div>
                </div>

                {/* Dropdown selector */}
                <select
                  value={selectedPoolTableId}
                  onChange={(e) => setSelectedPoolTableId(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'Kanit',
                    backgroundColor: '#ffffff',
                    color: '#1e293b'
                  }}
                >
                  <option value="">-- เลือกชุดข้อมูลที่ต้องการผูก ({availablePoolDatasets.length} รายการที่พร้อมเพิ่ม) --</option>
                  {availablePoolDatasets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.id}] - {p.sourceAgency} ({p.rowCount} แถว)
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleAddExisting}
                    disabled={!selectedPoolTableId}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: selectedPoolTableId ? '#0284c7' : '#cbd5e1',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: selectedPoolTableId ? 'pointer' : 'not-allowed',
                      boxShadow: selectedPoolTableId ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none'
                    }}
                  >
                    <Plus size={16} />
                    <span>เพิ่มเข้ากลุ่ม Synergy นี้</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Upload CSV/Excel Form */}
            {activeAddTab === 'upload' && (
              <form onSubmit={handleCreateNewDataset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '18px',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="file"
                    id="synergy-file-upload"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="synergy-file-upload"
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileSpreadsheet size={28} color="#0284c7" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                      {uploadFileName ? `เลือกไฟล์แล้ว: ${uploadFileName}` : 'คลิกเพื่อเลือกไฟล์ CSV หรือ Excel'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      รองรับ .csv, .xlsx (ระบบจะแปลงเข้า DuckDB อัตโนมัติ)
                    </span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                      ชื่อที่แสดง (Display Name):
                    </label>
                    <input
                      type="text"
                      required
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="เช่น สถิติความร่วมมือชุมชน 2568"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
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
                      value={newAgency}
                      onChange={(e) => setNewAgency(e.target.value)}
                      placeholder="เช่น สำนักงานสถิติแห่งชาติ / ศูนย์คุณธรรม"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '12.5px',
                        fontFamily: 'Kanit'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                    คำอธิบายชุดข้อมูล:
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="วัตถุประสงค์และการนำไปวิเคราะห์ร่วมกับมิตินี้"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '12.5px',
                      fontFamily: 'Kanit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    type="submit"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 22px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Plus size={16} />
                    <span>สร้างตาราง DuckDB และบรรจุเข้ากลุ่มนี้</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* =====================================================================
            3. MODAL FOOTER
        ===================================================================== */}
        <div
          style={{
            padding: '16px 28px',
            backgroundColor: '#f8fafc',
            borderTop: '1.5px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
