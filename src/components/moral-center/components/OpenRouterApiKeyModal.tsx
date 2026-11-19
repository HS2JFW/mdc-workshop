import React, { useState, useEffect } from 'react';
import {
  Key,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  ExternalLink,
  Save,
  Trash2
} from 'lucide-react';
import {
  getStoredOpenRouterApiKey,
  getStoredOpenRouterModel,
  saveStoredOpenRouterConfig,
  testOpenRouterConnection
} from '../data/pilotHackathonService';

interface OpenRouterApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (key: string, model: string) => void;
}

const POPULAR_MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', desc: 'แนะนำ: เร็ว ฉลาด ประหยัด' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', desc: 'ฟรี: ประมวลผลไว' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', desc: 'วิเคราะห์เฉียบคม' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', desc: 'แม่นยำสูง' }
];

export const OpenRouterApiKeyModal: React.FC<OpenRouterApiKeyModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-4o-mini');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredOpenRouterApiKey());
      setModel(getStoredOpenRouterModel());
      setTestResult(null);
      setSaveToast(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'กรุณากรอก API Key ก่อนกดทดสอบการเชื่อมต่อ'
      });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testOpenRouterConnection(apiKey.trim(), model.trim());
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `ข้อผิดพลาด: ${err?.message || 'เชื่อมต่อไม่สำเร็จ'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    saveStoredOpenRouterConfig(apiKey.trim(), model.trim());
    setSaveToast(true);
    if (onConfigSaved) {
      onConfigSaved(apiKey.trim(), model.trim());
    }
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    if (window.confirm('ต้องการลบ OpenRouter API Key ออกจากเบราว์เซอร์นี้หรือไม่? (ระบบจะสลับไปใช้ Local Rule Engine)')) {
      setApiKey('');
      saveStoredOpenRouterConfig('', model.trim());
      setTestResult(null);
      if (onConfigSaved) onConfigSaved('', model.trim());
    }
  };

  return (
    <div className="criteria-modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="criteria-modal-container"
        style={{ maxWidth: '640px', width: '92%', borderRadius: '18px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
            padding: '20px 24px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              <Key size={22} color="#a5b4fc" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                ตั้งค่าการเชื่อมต่อ OpenRouter AI
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#c7d2fe' }}>
                สำหรับ "AI ช่วยคิดโครงการ" และ "การตรวจคะแนนตัดเกรดสดตามเกณฑ์ 4 เสาหลัก"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', background: '#f8fafc' }}>
          {/* Status banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: apiKey.trim() ? '#f0fdf4' : '#fffbeb',
              border: `1.5px solid ${apiKey.trim() ? '#86efac' : '#fde68a'}`,
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {apiKey.trim() ? (
                <CheckCircle2 size={20} color="#16a34a" />
              ) : (
                <AlertCircle size={20} color="#d97706" />
              )}
              <div>
                <strong style={{ fontSize: '13.5px', color: apiKey.trim() ? '#166534' : '#92400e' }}>
                  {apiKey.trim() ? 'พบการระบุ OpenRouter API Key ในระบบ' : 'ยังไม่พบ OpenRouter API Key'}
                </strong>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {apiKey.trim()
                    ? `Key: ${apiKey.trim().slice(0, 10)}...${apiKey.trim().slice(-4)} (บันทึกในเบราว์เซอร์นี้)`
                    : 'ระบบจะใช้ Local Rule Engine คำนวณตามรูบิคชั่วคราว'}
                </div>
              </div>
            </div>
            {apiKey.trim() && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  cursor: 'pointer'
                }}
                title="ลบ Key ออกจากเครื่องนี้"
              >
                <Trash2 size={13} />
                <span>ล้าง Key</span>
              </button>
            )}
          </div>

          {/* API Key Input */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              OpenRouter API Key <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-xxxxxxxxxxxxxxxx..."
                style={{
                  width: '100%',
                  padding: '11px 44px 11px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
                title={showKey ? 'ซ่อน Key' : 'แสดง Key'}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                * รับ API Key ได้ฟรีจาก{' '}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#4338ca', fontWeight: 600, textDecoration: 'underline' }}
                >
                  openrouter.ai/keys <ExternalLink size={11} style={{ display: 'inline' }} />
                </a>
              </span>
            </div>
          </div>

          {/* Model Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              AI Model ที่ต้องการใช้งาน
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. openai/gpt-4o-mini"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13.5px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
                outline: 'none',
                background: '#ffffff',
                marginBottom: '8px'
              }}
            />
            {/* Quick model pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {POPULAR_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModel(m.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: `1.5px solid ${model === m.id ? '#4338ca' : '#e2e8f0'}`,
                    background: model === m.id ? '#eef2ff' : '#ffffff',
                    color: model === m.id ? '#3730a3' : '#475569',
                    fontSize: '12px',
                    fontWeight: model === m.id ? 700 : 500,
                    cursor: 'pointer'
                  }}
                  title={m.desc}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: testResult.success ? '#f0fdf4' : '#fef2f2',
                border: `1.5px solid ${testResult.success ? '#86efac' : '#fecaca'}`,
                color: testResult.success ? '#15803d' : '#b91c1c',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {testResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {saveToast && (
            <div
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: '14px'
              }}
            >
              ✓ บันทึกการตั้งค่า OpenRouter AI เรียบร้อยแล้ว!
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: isTesting ? 'wait' : 'pointer'
              }}
            >
              <RefreshCw size={15} className={isTesting ? 'spin-icon' : ''} />
              <span>{isTesting ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4338ca 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(67, 56, 202, 0.3)'
                }}
              >
                <Save size={15} />
                <span>บันทึกการตั้งค่า</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
