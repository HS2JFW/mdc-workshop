import React, { useState, useEffect } from 'react';
import {
  X,
  Shuffle,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Coffee,
  Palette
} from 'lucide-react';
import {
  type CoffeeGroupMeta,
  COFFEE_BACKGROUND_PRESETS,
  getRandomCoffeeBgUrl
} from '../data/pilotHackathonService';

interface CoffeeGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  initialGroup?: CoffeeGroupMeta | null;
  onSave: (groupData: Partial<CoffeeGroupMeta>) => void;
}

const THEME_COLOR_PRESETS = [
  { name: 'น้ำตาลเข้มเอสเพรสโซ', color: '#451a03', bg: '#fef2f2' },
  { name: 'มอคค่าช็อกโกแลต', color: '#78350f', bg: '#fef3c7' },
  { name: 'คาราเมลลาเต้', color: '#b45309', bg: '#fffbeb' },
  { name: 'คาปูชิโน่อบอุ่น', color: '#92400e', bg: '#ffedd5' },
  { name: 'อเมริกาโน่เข้มขรึม', color: '#1c1917', bg: '#f5f5f4' },
  { name: 'เขียวธรรมชาติรักษ์ป่า', color: '#065f46', bg: '#ecfdf5' },
  { name: 'น้ำเงินคุณธรรมสากล', color: '#1e3a8a', bg: '#eff6ff' }
];

export const CoffeeGroupModal: React.FC<CoffeeGroupModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialGroup,
  onSave
}) => {
  const [name, setName] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [themeColor, setThemeColor] = useState('#451a03');
  const [accentBg, setAccentBg] = useState('#fef2f2');

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && initialGroup) {
      setName(initialGroup.name || '');
      setBgImage(initialGroup.bgImage || getRandomCoffeeBgUrl());
      setThemeColor(initialGroup.themeColor || '#78350f');
      setAccentBg(initialGroup.accentBg || '#fef3c7');
    } else {
      // Add mode: pre-fill with defaults and RANDOM coffee background
      const randomBg = getRandomCoffeeBgUrl();
      setName('');
      setBgImage(randomBg);
      setThemeColor('#b45309');
      setAccentBg('#fffbeb');
    }
  }, [isOpen, mode, initialGroup]);

  if (!isOpen) return null;

  const handleRandomizeBg = () => {
    // Pick a random preset different from current
    const available = COFFEE_BACKGROUND_PRESETS.filter((p) => p.url !== bgImage);
    const chosen = available[Math.floor(Math.random() * available.length)] || COFFEE_BACKGROUND_PRESETS[0];
    setBgImage(chosen.url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('กรุณาระบุชื่อกลุ่ม');
      return;
    }

    onSave({
      key: initialGroup?.key,
      name: name.trim(),
      bgImage: bgImage || getRandomCoffeeBgUrl(),
      themeColor,
      accentBg
    });

    onClose();
  };

  const selectedPreset = COFFEE_BACKGROUND_PRESETS.find((p) => p.url === bgImage);

  return (
    <div className="criteria-modal-backdrop" onClick={onClose}>
      <div
        className="criteria-modal-container"
        style={{ maxWidth: '960px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="criteria-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '22px'
              }}
            >
              ☕
            </div>
            <div>
              <h2
                style={{
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0
                }}
              >
                {mode === 'add' ? 'เพิ่มกลุ่มกาแฟสร้างสรรค์คุณธรรมใหม่' : `แก้ไขกลุ่ม: ${initialGroup?.name}`}
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: '2px 0 0' }}>
                กำหนดชื่อกลุ่ม และเลือกหรือสุ่มภาพพื้นหลังกาแฟ 10 รูปแบบสำหรับทีม Hackathon
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Section 1: Live Card Preview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Kanit, sans-serif', fontSize: '14.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={16} /> ภาพตัวอย่างการ์ดกลุ่ม (Card Live Preview)
              </span>
              <button
                type="button"
                onClick={handleRandomizeBg}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)'
                }}
              >
                <Shuffle size={14} />
                <span>🎲 สุ่มภาพพื้นหลังกาแฟใหม่</span>
              </button>
            </div>

            {/* Simulated Coffee Group Button Card */}
            <div
              className="coffee-group-button is-active"
              style={{
                backgroundImage: `url(${bgImage})`,
                minHeight: '180px',
                cursor: 'default',
                transform: 'none'
              }}
            >
              <div className="coffee-btn-top">
                <span className="coffee-badge-chip">
                  <span>☕</span>
                  <span>{name || 'ชื่อกลุ่มกาแฟ'}</span>
                </span>
                <div className="coffee-check-indicator">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <div className="coffee-btn-bottom">
                <h3 className="coffee-name">{name || 'ชื่อกลุ่มกาแฟของคุณ'}</h3>
                <div className="coffee-members-bar">
                  <span>สัดส่วนสมาชิก:</span>
                  <span>🏛️ 2 นโยบาย • ⚙️ 4 ปฏิบัติการ • 👥 6 ประชาชน</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 10 Coffee Background Presets Selector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Kanit, sans-serif', fontSize: '14.5px', fontWeight: 700, color: '#334155' }}>
                เลือกภาพพื้นหลังกาแฟ (10 รูปแบบพรีเมียม):
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                เลือกแล้ว: <strong>{selectedPreset?.name || 'ภาพพื้นหลังกาแฟ'}</strong>
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '10px'
              }}
            >
              {COFFEE_BACKGROUND_PRESETS.map((preset) => {
                const isSelected = bgImage === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setBgImage(preset.url)}
                    style={{
                      position: 'relative',
                      height: '84px',
                      borderRadius: '10px',
                      backgroundImage: `url(${preset.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      border: isSelected ? '3px solid #f59e0b' : '2px solid #e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px rgba(245, 158, 11, 0.4)' : 'none',
                      overflow: 'hidden',
                      transition: 'all 0.18s ease'
                    }}
                    title={preset.name}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: isSelected
                          ? 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(245, 158, 11, 0.45) 100%)'
                          : 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {isSelected && (
                          <span
                            style={{
                              background: '#f59e0b',
                              color: '#ffffff',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                          >
                            <Check size={13} />
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#ffffff',
                          fontFamily: 'Kanit, sans-serif',
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {preset.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Group Information Form Field */}
          <div className="reg-form-group">
            <label className="reg-form-label">
              ชื่อกลุ่ม *
            </label>
            <input
              type="text"
              className="reg-form-input"
              placeholder="เช่น กลุ่มเอสเพรสโซ, กลุ่มเดอร์ตี้, กลุ่มโคลด์บริว"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Theme Color Picker */}
          <div>
            <label className="reg-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Palette size={15} /> โทนสีประจำกลุ่ม (Theme Accent)
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {THEME_COLOR_PRESETS.map((item) => (
                <button
                  key={item.color}
                  type="button"
                  onClick={() => {
                    setThemeColor(item.color);
                    setAccentBg(item.bg);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: themeColor === item.color ? '2px solid #0f172a' : '1px solid #cbd5e1',
                    background: item.bg,
                    color: item.color,
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: item.color
                    }}
                  />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0'
            }}
          >
            <button
              type="button"
              className="btn-modal-dismiss"
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                color: '#ffffff',
                fontFamily: 'Kanit, sans-serif',
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
              }}
            >
              <Check size={18} />
              <span>{mode === 'add' ? 'บันทึกกลุ่มใหม่' : 'บันทึกการแก้ไข'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
