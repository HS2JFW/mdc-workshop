import React, { useState, useEffect } from 'react';
import {
  Save,
  Key,
  Cpu,
  FileText,
  Palette,
  Sparkles,
  Check,
  Database,
  TableProperties,
  RotateCcw,
  LogOut,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Home,
  ChevronDown,
  Users,
  UserX,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useMoralTheme, type MoralThemeMode } from './moral-center/utils/moralThemeManager';
import { ThemeSwitcherDropdown } from './moral-center/components/ThemeSwitcherDropdown';
import {
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
  onAdminAuthChange
} from './moral-center/utils/adminAuthService';
import {
  type PilotProvinceName
} from './moral-center/data/pilotActivitiesSqliteService';
import {
  resetHackathonDatabaseFromApi,
  resetRegistrationsDatabaseFromApi,
  testOpenRouterConnection,
  fetchAiConfigFromDb,
  saveAiConfigToDb
} from './moral-center/data/pilotHackathonService';
import { DatabaseTablesExplorer } from './moral-center/components/DatabaseTablesExplorer';

export interface SettingsPageProps {
  onNavigateHome?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateHome }) => {
  const { theme, isThaiModern, setTheme, options } = useMoralTheme();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-3.5-turbo');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [generatorPrompt, setGeneratorPrompt] = useState('');

  // Admin & Database Management States
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminAuthenticated());
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminAuthFeedback, setAdminAuthFeedback] = useState<string | null>(null);
  const [isDbExplorerOpen, setIsDbExplorerOpen] = useState<boolean>(false);
  const [provinceToReset, setProvinceToReset] = useState<PilotProvinceName | 'ALL'>('ALL');
  const [isResettingDb, setIsResettingDb] = useState<boolean>(false);
  const [dbResetFeedback, setDbResetFeedback] = useState<string | null>(null);
  const [isResettingRegistrations, setIsResettingRegistrations] = useState<boolean>(false);
  const [registrationResetFeedback, setRegistrationResetFeedback] = useState<string | null>(null);

  // Collapsible Accordion States for the 3 main sections
  const [isThemeExpanded, setIsThemeExpanded] = useState<boolean>(false);
  const [isAiExpanded, setIsAiExpanded] = useState<boolean>(true);
  const [isAdminDbExpanded, setIsAdminDbExpanded] = useState<boolean>(false);

  const isAllExpanded = isThemeExpanded && isAiExpanded && isAdminDbExpanded;
  const toggleExpandAll = () => {
    const next = !isAllExpanded;
    setIsThemeExpanded(next);
    setIsAiExpanded(next);
    setIsAdminDbExpanded(next);
  };

  useEffect(() => {
    return onAdminAuthChange((auth) => {
      setIsAdmin(auth);
    });
  }, []);

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminPasswordInput.trim()) {
      setAdminAuthFeedback('กรุณากรอกรหัสผ่าน Admin');
      return;
    }
    const res = loginAdmin('admin', adminPasswordInput.trim());
    if (res.success) {
      setIsAdmin(true);
      setAdminPasswordInput('');
      setAdminAuthFeedback(null);
    } else {
      setAdminAuthFeedback(res.message);
    }
  };

  const handleAdminLogout = () => {
    if (window.confirm('ต้องการออกจากระบบ Admin หรือไม่?')) {
      logoutAdmin();
      setIsAdmin(false);
      setAdminAuthFeedback(null);
    }
  };

  const handleResetDatabase = async () => {
    if (!isAdmin) {
      alert('คุณต้องเข้าสู่ระบบในสิทธิ์ Admin ก่อนจึงจะสามารถ Reset ฐานข้อมูลได้');
      return;
    }

    const provinceLabel = provinceToReset === 'ALL' ? 'ทุกจังหวัด (4 จังหวัด)' : `จังหวัด ${provinceToReset}`;
    const confirmed = window.confirm(
      `⚠️ คำเตือนระบบผู้ดูแล (Admin):\n\nคุณต้องการ Reset ฐานข้อมูลโครงการ Hackathon สำหรับ ${provinceLabel} ในระบบ SQLite หรือไม่?\n\n(ข้อมูลที่ส่งเข้ามาจะถูกลบและกู้คืนชุดโครงการมาตรฐาน 15 โครงการเริ่มต้น)`
    );
    if (!confirmed) return;

    setIsResettingDb(true);
    setDbResetFeedback(null);
    try {
      const res = await resetHackathonDatabaseFromApi(
        provinceToReset === 'ALL' ? undefined : (provinceToReset as PilotProvinceName)
      );
      if (res && res.success) {
        setDbResetFeedback(`✓ ${res.message} (ลบ ${res.deletedCount || 0} แถว)`);
      } else {
        setDbResetFeedback(`⚠️ ${res?.message || 'ไม่สามารถรีเซ็ตฐานข้อมูลได้'}`);
      }
    } catch (err: any) {
      setDbResetFeedback(`❌ เกิดข้อผิดพลาด: ${err?.message || err}`);
    } finally {
      setIsResettingDb(false);
      setTimeout(() => setDbResetFeedback(null), 6000);
    }
  };

  const handleResetRegistrations = async () => {
    if (!isAdmin) {
      alert('คุณต้องเข้าสู่ระบบในสิทธิ์ Admin ก่อนจึงจะสามารถ Reset ข้อมูลลงทะเบียนได้');
      return;
    }

    const provinceLabel = provinceToReset === 'ALL' ? 'ทุกจังหวัด (ทั้งหมดในตาราง)' : `จังหวัด ${provinceToReset}`;
    const confirmed = window.confirm(
      `⚠️ คำเตือนระบบผู้ดูแล (Admin):\n\nคุณต้องการลบข้อมูลผู้เข้าร่วมและหน่วยงานที่มาลงทะเบียนทั้งหมด (${provinceLabel}) จากตาราง pilot_agency_registrations ในระบบ SQLite หรือไม่?\n\n(ข้อมูลการลงทะเบียนจะถูกลบออกจากระบบอย่างถาวร)`
    );
    if (!confirmed) return;

    setIsResettingRegistrations(true);
    setRegistrationResetFeedback(null);
    try {
      const res = await resetRegistrationsDatabaseFromApi(provinceToReset);
      if (res && res.success) {
        setRegistrationResetFeedback(`✓ ${res.message}`);
      } else {
        setRegistrationResetFeedback(`⚠️ ${res?.message || 'ไม่สามารถลบข้อมูลการลงทะเบียนได้'}`);
      }
    } catch (err: any) {
      setRegistrationResetFeedback(`❌ เกิดข้อผิดพลาด: ${err?.message || err}`);
    } finally {
      setIsResettingRegistrations(false);
      setTimeout(() => setRegistrationResetFeedback(null), 6000);
    }
  };

  const defaultPrompt = `You are an expert public policy AI evaluator.
You will evaluate a proposed project for the target: "{targetName}" (Type: {targetType}).

Based on the project description, predict the 5 core virtue scores (0.0 to 10.0) BEFORE and AFTER the project implementation.
The 5 virtues are:
- discipline
- sufficiency
- honesty
- volunteer
- gratitude

You MUST respond with a valid JSON object ONLY, strictly matching this structure (no markdown tags, no extra text):
{
  "beforeScore": number,
  "afterScore": number,
  "beforeVirtues": { "discipline": number, "sufficiency": number, "honesty": number, "volunteer": number, "gratitude": number },
  "afterVirtues": { "discipline": number, "sufficiency": number, "honesty": number, "volunteer": number, "gratitude": number },
  "reasoning": "string explaining the rationale in Thai"
}`;

  const defaultGeneratorPrompt = `You are an expert public policy analyst and creative project planner for Thailand.
You need to recommend an impactful project to improve the 5 core virtues (discipline, sufficiency, honesty, volunteer, gratitude) for the target: "{targetName}" (Type: {targetType}).

Propose ONE highly effective, practical, and realistic project.

You MUST respond with a valid JSON object ONLY, strictly matching this structure (no markdown tags, no extra text):
{
  "name": "string (Short, catchy project name in Thai)",
  "description": "string (Detailed description, why it's needed, and how it improves virtues, in Thai)"
}`;

  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isTestingAiConnection, setIsTestingAiConnection] = useState<boolean>(false);
  const [aiTestResult, setAiTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    model?: string;
  } | null>(null);

  const POPULAR_AI_MODELS = [
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', desc: 'แนะนำ: เร็ว ฉลาด ประหยัด' },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', desc: 'ฟรี: ประมวลผลไว' },
    { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', desc: 'วิเคราะห์เฉียบคม' },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', desc: 'แม่นยำสูง' }
  ];

  useEffect(() => {
    fetchAiConfigFromDb().then((cfg) => {
      if (cfg && cfg.apiKey) {
        setApiKey(cfg.apiKey);
      } else {
        setApiKey(localStorage.getItem('ai_api_key') || '');
      }
      if (cfg && cfg.model && cfg.model !== 'openai/gpt-3.5-turbo') {
        setModel(cfg.model);
      } else {
        const storedModel = localStorage.getItem('ai_model');
        setModel(storedModel && storedModel !== 'openai/gpt-3.5-turbo' ? storedModel : 'openai/gpt-4o-mini');
      }
      if (cfg && cfg.systemPrompt) {
        setSystemPrompt(cfg.systemPrompt);
      } else {
        setSystemPrompt(localStorage.getItem('ai_system_prompt') || defaultPrompt);
      }
      if (cfg && cfg.generatorPrompt) {
        setGeneratorPrompt(cfg.generatorPrompt);
      } else {
        setGeneratorPrompt(localStorage.getItem('ai_generator_prompt') || defaultGeneratorPrompt);
      }
    });
  }, []);

  const handleTestOpenRouterConnection = async () => {
    if (!apiKey.trim()) {
      setAiTestResult({
        success: false,
        message: 'กรุณากรอก OpenRouter API Key ก่อนกดทดสอบการเชื่อมต่อ'
      });
      return;
    }
    setIsTestingAiConnection(true);
    setAiTestResult(null);
    try {
      const res = await testOpenRouterConnection(apiKey.trim(), model.trim());
      setAiTestResult(res);
    } catch (err: any) {
      setAiTestResult({
        success: false,
        message: `ข้อผิดพลาด: ${err?.message || 'เชื่อมต่อไม่สำเร็จ'}`
      });
    } finally {
      setIsTestingAiConnection(false);
    }
  };

  const handleSave = async () => {
    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
    const cleanModel = (model.trim() && model.trim() !== 'openai/gpt-3.5-turbo') ? model.trim() : 'openai/gpt-4o-mini';
    
    const res = await saveAiConfigToDb({
      apiKey: cleanKey,
      model: cleanModel,
      systemPrompt,
      generatorPrompt
    });

    alert(res.message || 'บันทึกการตั้งค่า AI ลง SQLite และ Server File เรียบร้อยแล้ว (ทุกเครื่องสามารถเชื่อมต่อ AI ได้ทันทีโดยไม่ต้องใส่ Key ใหม่)');
  };

  const handleResetPrompt = () => {
    setSystemPrompt(defaultPrompt);
    setGeneratorPrompt(defaultGeneratorPrompt);
  };

  return (
    <div
      className="settings-page-view"
      style={{
        padding: '28px clamp(16px, 3.5vw, 44px)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1.5px solid #e2e8f0',
          paddingBottom: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', fontFamily: 'Kanit, sans-serif' }}>
            ตั้งค่าระบบ (System Settings)
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px', lineHeight: 1.5, fontFamily: 'Kanit, sans-serif' }}>
            กำหนดรูปแบบธีมการแสดงผลของแพลตฟอร์ม และตั้งค่าการเชื่อมต่อ AI วิเคราะห์ผลกระทบโครงการ
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={toggleExpandAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: '#f8fafc',
              color: '#475569',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              fontFamily: 'Kanit, sans-serif',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={isAllExpanded ? 'คลิกเพื่อยุบหัวข้อทั้งหมด' : 'คลิกเพื่อขยายดูหัวข้อทั้งหมด'}
          >
            <ChevronDown
              size={17}
              style={{
                transform: isAllExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease'
              }}
            />
            <span>{isAllExpanded ? 'ยุบทั้งหมด' : 'ขยายทั้งหมด'}</span>
          </button>

          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#ffffff',
                color: '#334155',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                fontFamily: 'Kanit, sans-serif',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
              title="กลับสู่หน้าแรก (Overview Dashboard)"
            >
              <Home size={18} />
              <span>กลับหน้าแรก</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          ROW 1: รูปแบบธีมของแพลตฟอร์ม (Platform Theme)
      ========================================================= */}
      <div
        className="moral-card"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: isThemeExpanded ? '24px' : '18px 24px',
          border: isThaiModern ? '1.5px solid rgba(212, 175, 55, 0.4)' : '1px solid #e2e8f0',
          boxShadow: isThaiModern ? '0 8px 24px rgba(212, 175, 55, 0.12)' : '0 4px 14px rgba(0,0,0,0.04)',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Clickable Header Bar */}
        <div
          onClick={() => setIsThemeExpanded(!isThemeExpanded)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            gap: '16px',
            flexWrap: 'wrap'
          }}
          title={isThemeExpanded ? 'คลิกเพื่อยุบหัวข้อ' : 'คลิกเพื่อแสดงข้อมูลภายใน'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: isThaiModern ? 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)' : '#eff6ff',
                border: isThaiModern ? '1.5px solid #38bdf8' : '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isThaiModern ? '#ffffff' : '#2563eb',
                flexShrink: 0
              }}
            >
              {isThaiModern ? <Sparkles size={20} /> : <Palette size={20} />}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'Kanit, sans-serif' }}>
                รูปแบบธีมของแพลตฟอร์ม (Platform Theme)
              </h2>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontFamily: 'Kanit, sans-serif' }}>
                สลับเฉดสี ลวดลาย และบรรยากาศ UX/UI ทั่วทั้งระบบแดชบอร์ด (บันทึกอัตโนมัติ)
              </div>
            </div>
          </div>

          {/* Right Status Badge & Down Arrow Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: '#f1f5f9',
                color: '#334155',
                fontSize: '12.5px',
                fontWeight: 600,
                border: '1px solid #e2e8f0'
              }}
            >
              ธีม: {options.find((o) => o.id === theme)?.name || theme}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsThemeExpanded(!isThemeExpanded);
              }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1.5px solid #cbd5e1',
                background: isThemeExpanded ? '#eff6ff' : '#f8fafc',
                color: isThemeExpanded ? '#2563eb' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              title={isThemeExpanded ? 'คลิกเพื่อยุบหัวข้อ' : 'คลิกเพื่อแสดงข้อมูลภายใน'}
            >
              <ChevronDown
                size={20}
                style={{
                  transform: isThemeExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </button>
          </div>
        </div>

        {/* Inner Content - Displayed only when expanded */}
        {isThemeExpanded && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '18px' }}>
            {/* Theme Dropdown Selector Row */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>เลือกธีม:</span>
              <ThemeSwitcherDropdown />
            </div>

            {/* 2 Interactive Visual Selection Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {options.map((opt) => {
                const isSelected = opt.id === theme;
                const isThai = opt.id === 'thai-modern';

                return (
                  <div
                    key={opt.id}
                    onClick={() => setTheme(opt.id as MoralThemeMode)}
                    style={{
                      padding: '16px 18px',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      border: isSelected
                        ? isThai
                          ? '2.5px solid #0284c7'
                          : '2px solid #2563eb'
                        : '1.5px solid #e2e8f0',
                      background: isSelected
                        ? isThai
                          ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)'
                          : '#eff6ff'
                        : '#f8fafc',
                      boxShadow: isSelected
                        ? isThai
                          ? '0 6px 20px rgba(2, 132, 199, 0.22)'
                          : '0 4px 14px rgba(37, 99, 235, 0.16)'
                        : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px'
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        fontSize: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected && isThai
                          ? 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)'
                          : '#ffffff',
                        border: isSelected && isThai ? '1.5px solid #38bdf8' : '1px solid #e2e8f0',
                        color: isSelected && isThai ? '#ffffff' : 'inherit',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        flexShrink: 0
                      }}
                    >
                      {opt.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                          {opt.name}
                        </strong>
                        {isSelected && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: isThai ? '#e0f2fe' : '#dbeafe',
                              color: isThai ? '#0284c7' : '#1e40af',
                              border: isThai ? '1px solid #bae6fd' : '1px solid #bfdbfe'
                            }}
                          >
                            <Check size={12} /> กำลังใช้งาน
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>
                        {opt.tagline}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          ROW 2: ตั้งค่า AI วิเคราะห์โครงการ (OpenRouter)
      ========================================================= */}
      <div
        className="moral-card"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: isAiExpanded ? '24px' : '18px 24px',
          border: isThaiModern ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid #e2e8f0',
          boxShadow: isThaiModern ? '0 8px 24px rgba(11, 19, 43, 0.06)' : '0 4px 14px rgba(0,0,0,0.04)',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Clickable Header Bar */}
        <div
          onClick={() => setIsAiExpanded(!isAiExpanded)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            gap: '16px',
            flexWrap: 'wrap'
          }}
          title={isAiExpanded ? 'คลิกเพื่อยุบหัวข้อ' : 'คลิกเพื่อแสดงข้อมูลภายใน'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                flexShrink: 0
              }}
            >
              <Cpu size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'Kanit, sans-serif' }}>
                ตั้งค่า AI วิเคราะห์โครงการ (OpenRouter)
              </h2>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontFamily: 'Kanit, sans-serif' }}>
                เชื่อมต่อภายนอกเพื่อประเมินผลกระทบคุณธรรม 5 ด้าน และระบบแนะนำข้อเสนอโครงการ
              </div>
            </div>
          </div>

          {/* Right Status Badge & Down Arrow Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {apiKey.trim() ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: '#f0fdf4',
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid #86efac'
                }}
              >
                <CheckCircle2 size={13} color="#16a34a" />
                <span>ระบุ Key แล้ว</span>
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: '#fffbeb',
                  color: '#92400e',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid #fde68a'
                }}
              >
                <AlertTriangle size={13} color="#d97706" />
                <span>ยังไม่ระบุ Key</span>
              </span>
            )}

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: '#f1f5f9',
                color: '#334155',
                fontSize: '12.5px',
                fontWeight: 600,
                border: '1px solid #e2e8f0'
              }}
            >
              โมเดล: {model ? model.split('/').pop() : 'ยังไม่ระบุ'}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isAiExpanded) setIsAiExpanded(true);
                handleTestOpenRouterConnection();
              }}
              disabled={isTestingAiConnection}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1.5px solid #93c5fd',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: isTestingAiConnection ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.12)'
              }}
              title="ทดสอบส่งคำขอไปยัง OpenRouter API ทันที"
            >
              <RefreshCw size={13} className={isTestingAiConnection ? 'spin-animation' : ''} />
              <span>{isTestingAiConnection ? 'กำลังทดสอบ...' : '⚡ ทดสอบเชื่อมต่อ'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAiExpanded(!isAiExpanded);
              }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1.5px solid #cbd5e1',
                background: isAiExpanded ? '#eff6ff' : '#f8fafc',
                color: isAiExpanded ? '#2563eb' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              title={isAiExpanded ? 'คลิกเพื่อยุบหัวข้อ' : 'คลิกเพื่อแสดงข้อมูลภายใน'}
            >
              <ChevronDown
                size={20}
                style={{
                  transform: isAiExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </button>
          </div>
        </div>

        {/* Inner Content - Displayed only when expanded */}
        {isAiExpanded && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '18px' }}>
            {/* OpenRouter API Key Field */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                  <Key size={16} /> OpenRouter API Key <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                >
                  <span>รับ API Key จาก OpenRouter</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => {
                    setApiKey(e.target.value);
                    localStorage.setItem('ai_api_key', e.target.value);
                  }}
                  placeholder="sk-or-v1-xxxxxxxxxxxxxxxx..."
                  style={{
                    width: '100%',
                    padding: '11px 44px 11px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
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
                  title={showApiKey ? 'ซ่อน Key' : 'แสดง Key'}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>
                * API Key จะถูกบันทึกไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น (Local Storage) ปลอดภัยและไม่ถูกส่งไปเซิร์ฟเวอร์อื่น
              </div>
            </div>

            {/* AI Model Field with Quick Preset Pills */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                <Cpu size={16} /> AI Model (โมเดลประมวลผล)
              </label>
              <input
                type="text"
                value={model}
                onChange={e => {
                  setModel(e.target.value);
                  localStorage.setItem('ai_model', e.target.value);
                }}
                placeholder="e.g., openai/gpt-4o-mini, google/gemini-flash-1.5, anthropic/claude-3-haiku"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', marginBottom: '8px' }}
              />
              {/* Quick Model Selector Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {POPULAR_AI_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setModel(m.id);
                      localStorage.setItem('ai_model', m.id);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${model === m.id ? '#2563eb' : '#e2e8f0'}`,
                      background: model === m.id ? '#eff6ff' : '#ffffff',
                      color: model === m.id ? '#1d4ed8' : '#475569',
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

            {/* Quick Action Bar (Directly below Model & Key): Test Connection & Save */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleTestOpenRouterConnection}
                  disabled={isTestingAiConnection}
                  style={{
                    padding: '9px 18px',
                    background: '#ffffff',
                    color: '#1d4ed8',
                    border: '1.5px solid #93c5fd',
                    borderRadius: '8px',
                    cursor: isTestingAiConnection ? 'wait' : 'pointer',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13.5px',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.1)'
                  }}
                  title="ทดสอบส่งคำขอ ping ไปยัง OpenRouter API"
                >
                  <RefreshCw size={15} className={isTestingAiConnection ? 'spin-animation' : ''} />
                  <span>{isTestingAiConnection ? 'กำลังทดสอบการเชื่อมต่อ OpenRouter...' : '⚡ ทดสอบการเชื่อมต่อ OpenRouter'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    padding: '9px 20px',
                    background: isThaiModern ? 'linear-gradient(135deg, #101c33 0%, #172747 100%)' : '#2563eb',
                    color: isThaiModern ? '#faeaba' : '#ffffff',
                    border: isThaiModern ? '1px solid #d4af37' : 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13.5px',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <Save size={16} />
                  <span>บันทึกการตั้งค่า AI</span>
                </button>
              </div>

              <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                * ทดสอบความถูกต้องของ Key และความพร้อมของโมเดลก่อนส่งจริง
              </span>
            </div>

            {/* Test Connection Result Box */}
            {aiTestResult && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: aiTestResult.success ? '#f0fdf4' : '#fef2f2',
                  border: `1.5px solid ${aiTestResult.success ? '#86efac' : '#fecaca'}`,
                  color: aiTestResult.success ? '#15803d' : '#b91c1c',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {aiTestResult.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                <span>{aiTestResult.message}</span>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                  <FileText size={16} /> System Prompt (JSON Output Required)
                </label>
                <button 
                  onClick={handleResetPrompt}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer' }}
                >
                  คืนค่าเริ่มต้น
                </button>
              </div>
              <textarea
                value={systemPrompt}
                onChange={e => {
                  setSystemPrompt(e.target.value);
                  localStorage.setItem('ai_system_prompt', e.target.value);
                }}
                rows={8}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.5', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                  <FileText size={16} /> Generator Prompt (AI แนะนำโครงการ)
                </label>
              </div>
              <textarea
                value={generatorPrompt}
                onChange={e => {
                  setGeneratorPrompt(e.target.value);
                  localStorage.setItem('ai_generator_prompt', e.target.value);
                }}
                rows={8}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.5', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            {/* Action Buttons: Test Connection & Save */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                onClick={handleTestOpenRouterConnection}
                disabled={isTestingAiConnection}
                style={{
                  padding: '10px 18px',
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: isTestingAiConnection ? 'wait' : 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13.5px'
                }}
              >
                <RefreshCw size={16} className={isTestingAiConnection ? 'spin-icon' : ''} />
                <span>{isTestingAiConnection ? 'กำลังทดสอบการเชื่อมต่อ...' : '⚡ ทดสอบการเชื่อมต่อ OpenRouter'}</span>
              </button>

              <button
                onClick={handleSave}
                style={{
                  padding: '10px 24px',
                  background: isThaiModern ? 'linear-gradient(135deg, #101c33 0%, #172747 100%)' : '#3b82f6',
                  color: isThaiModern ? '#faeaba' : '#ffffff',
                  border: isThaiModern ? '1px solid #d4af37' : 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isThaiModern ? '0 4px 14px rgba(212, 175, 55, 0.28)' : '0 2px 8px rgba(59, 130, 246, 0.3)'
                }}
              >
                <Save size={18} /> บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          ROW 3: การจัดการฐานข้อมูลและสิทธิ์ผู้ดูแลระบบ (Database & Admin Controls)
      ========================================================= */}
      <div
        className="moral-card"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: isAdminDbExpanded ? '24px' : '18px 24px',
          border: isThaiModern ? '1.5px solid rgba(37, 99, 235, 0.3)' : '1px solid #e2e8f0',
          boxShadow: isThaiModern ? '0 8px 24px rgba(37, 99, 235, 0.08)' : '0 4px 14px rgba(0,0,0,0.04)',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Clickable Header Bar */}
        <div
          onClick={() => setIsAdminDbExpanded(!isAdminDbExpanded)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            gap: '16px',
            flexWrap: 'wrap'
          }}
          title={isAdminDbExpanded ? 'คลิกเพื่อยุบหัวข้อ' : 'คลิกเพื่อแสดงข้อมูลภายใน'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                flexShrink: 0
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'Kanit, sans-serif' }}>
                การจัดการฐานข้อมูลและสิทธิ์ผู้ดูแลระบบ (Database & Admin Controls)
              </h2>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontFamily: 'Kanit, sans-serif' }}>
                ตรวจสอบโครงสร้างตารางฐานข้อมูลทั้งหมดในระบบ, รีเซ็ตข้อมูล Hackathon 4 จังหวัด และจัดการสิทธิ์ Admin
              </div>
            </div>
          </div>

          {/* Right Status Badge & Down Arrow Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAdmin ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  fontSize: '12.5px',
                  fontWeight: 700
                }}
              >
                <ShieldCheck size={15} /> สิทธิ์ผู้ดูแลระบบ (Admin)
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  fontWeight: 600
                }}
              >
                <Lock size={14} /> โหมดผู้ใช้ทั่วไป (Guest)
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAdminDbExpanded(!isAdminDbExpanded);
              }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1.5px solid #cbd5e1',
                background: isAdminDbExpanded ? '#eff6ff' : '#f8fafc',
                color: isAdminDbExpanded ? '#2563eb' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              title={isAdminDbExpanded ? 'คลิกเพื่อยุบหัวข้อ' : 'คลิกเพื่อแสดงข้อมูลภายใน'}
            >
              <ChevronDown
                size={20}
                style={{
                  transform: isAdminDbExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </button>
          </div>
        </div>

        {/* Inner Content - Displayed only when expanded */}
        {isAdminDbExpanded && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '18px' }}>
            {/* Top Toolbar in Row 3: Admin Status & Logout */}
            {isAdmin && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '10px',
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: '1.5px solid #fecaca',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="คลิกเพื่อออกจากระบบ Admin"
                >
                  <LogOut size={15} />
                  <span>Logout Admin</span>
                </button>
              </div>
            )}

            {/* Guest Login Section if not admin */}
            {!isAdmin && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  marginBottom: '20px'
                }}
              >
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  🔐 เข้าสู่ระบบ Admin เพื่อเปิดใช้งานเครื่องมือ Reset ฐานข้อมูล และตรวจสอบฐานข้อมูลระดับสูง:
                </div>
                <form onSubmit={handleAdminLogin} autoComplete="off" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="password"
                    name="settings_admin_pwd"
                    autoComplete="new-password"
                    placeholder="กรอกรหัสผ่าน (Password)"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      minWidth: '280px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 18px',
                      borderRadius: '8px',
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Key size={15} />
                    <span>เข้าสู่ระบบ Admin</span>
                  </button>
                </form>
                {adminAuthFeedback && (
                  <div style={{ color: '#b91c1c', fontSize: '12.5px', marginTop: '8px', fontWeight: 600 }}>
                    ⚠️ {adminAuthFeedback}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons Row: ตารางฐานข้อมูล & Reset ฐานข้อมูล */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {/* Card: ตารางฐานข้อมูล */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  border: isDbExplorerOpen ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                  background: isDbExplorerOpen ? '#eff6ff' : '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TableProperties size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>ตารางฐานข้อมูล (Database Tables Explorer)</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>ดูข้อมูลทั้งหมด 36 ตาราง พร้อมแยก 7 หมวดหมู่ระบบ</div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  เรียกดู schema, จำนวนแถว, คอลัมน์ และค้นหาข้อมูลในตารางระบบ PMS, กิจกรรม & โหวต Hackathon, ข้อมูลบูรณาการ Synergy, ดัชนีคุณธรรม, ทุนชีวิต, Moral Credit และวิทยากรคุณธรรม
                </p>

                {/* 2. ปุ่ม ตารางฐานข้อมูล */}
                <button
                  type="button"
                  onClick={() => setIsDbExplorerOpen(!isDbExplorerOpen)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: isDbExplorerOpen ? '#1e40af' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    marginTop: 'auto'
                  }}
                >
                  <TableProperties size={17} />
                  <span>{isDbExplorerOpen ? 'ซ่อนตารางฐานข้อมูล' : 'ตารางฐานข้อมูล'}</span>
                </button>
              </div>

              {/* Card 2: Reset โครงการ Hackathon */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  border: '1.5px solid #fed7aa',
                  background: '#fffaf5',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RotateCcw size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>Reset โครงการ Hackathon</strong>
                    <div style={{ fontSize: '12px', color: '#9a3412' }}>รีเซ็ตข้อมูลโครงการในระบบ SQLite กลับสู่ชุดมาตรฐาน</div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  ล้างข้อเสนอโครงการและคะแนนที่ผู้ใช้ส่งทดสอบในตาราง <code>pilot_hackathon_projects</code> ของ SQLite และคืนค่ากลับสู่ 15 โครงการมาตรฐาน
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto', flexWrap: 'wrap' }}>
                  <select
                    value={provinceToReset}
                    onChange={(e) => setProvinceToReset(e.target.value as any)}
                    disabled={!isAdmin || isResettingDb}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#1e293b',
                      flex: 1
                    }}
                  >
                    <option value="ALL">🌐 ทุกจังหวัด (4 จังหวัดนำร่อง)</option>
                    <option value="อยุธยา">จ.อยุธยา</option>
                    <option value="อุดรธานี">จ.อุดรธานี</option>
                    <option value="ลำปาง">จ.ลำปาง</option>
                    <option value="สุราษฎร์ธานี">จ.สุราษฎร์ธานี</option>
                  </select>

                  {/* 3. ปุ่ม Reset โครงการ Hackathon */}
                  <button
                    type="button"
                    onClick={handleResetDatabase}
                    disabled={!isAdmin || isResettingDb}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      background: !isAdmin ? '#cbd5e1' : isResettingDb ? '#94a3b8' : '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: !isAdmin || isResettingDb ? 'not-allowed' : 'pointer',
                      boxShadow: !isAdmin ? 'none' : '0 2px 8px rgba(234, 88, 12, 0.25)'
                    }}
                    title={!isAdmin ? 'ต้องเข้าสู่ระบบ Admin ก่อนจึงจะ Reset ได้' : 'รีเซ็ตข้อมูลโครงการในฐานข้อมูล'}
                  >
                    <RotateCcw size={16} className={isResettingDb ? 'spin-animation' : ''} />
                    <span>{isResettingDb ? 'กำลังรีเซ็ต...' : 'Reset โครงการ Hackathon'}</span>
                  </button>
                </div>

                {dbResetFeedback && (
                  <div style={{ fontSize: '13px', fontWeight: 600, color: dbResetFeedback.startsWith('✓') ? '#047857' : '#b91c1c' }}>
                    {dbResetFeedback}
                  </div>
                )}
              </div>

              {/* Card 3: Reset Registrations */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  border: '1.5px solid #e9d5ff',
                  background: '#faf5ff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>Reset Registrations (ลบข้อมูลการลงทะเบียน)</strong>
                    <div style={{ fontSize: '12px', color: '#6b21a8' }}>ลบข้อมูลผู้เข้าร่วมและหน่วยงานที่ลงทะเบียนทั้งหมดออกจากตาราง</div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  ล้างข้อมูลในตาราง <code>pilot_agency_registrations</code> (Step 1 ข้อมูลลงทะเบียน) ของระบบ SQLite และ LocalStorage
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto', flexWrap: 'wrap' }}>
                  <select
                    value={provinceToReset}
                    onChange={(e) => setProvinceToReset(e.target.value as any)}
                    disabled={!isAdmin || isResettingRegistrations}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#1e293b',
                      flex: 1
                    }}
                  >
                    <option value="ALL">🌐 ทุกจังหวัด (ทั้งหมดในตาราง)</option>
                    <option value="อยุธยา">จ.อยุธยา</option>
                    <option value="อุดรธานี">จ.อุดรธานี</option>
                    <option value="ลำปาง">จ.ลำปาง</option>
                    <option value="สุราษฎร์ธานี">จ.สุราษฎร์ธานี</option>
                  </select>

                  {/* 4. ปุ่ม Reset Registrations */}
                  <button
                    type="button"
                    onClick={handleResetRegistrations}
                    disabled={!isAdmin || isResettingRegistrations}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      background: !isAdmin ? '#cbd5e1' : isResettingRegistrations ? '#94a3b8' : '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: !isAdmin || isResettingRegistrations ? 'not-allowed' : 'pointer',
                      boxShadow: !isAdmin ? 'none' : '0 2px 8px rgba(124, 58, 237, 0.25)'
                    }}
                    title={!isAdmin ? 'ต้องเข้าสู่ระบบ Admin ก่อนจึงจะ Reset ได้' : 'ลบข้อมูลคนที่มาลงทะเบียนทั้งหมดจากตาราง'}
                  >
                    <RotateCcw size={16} className={isResettingRegistrations ? 'spin-animation' : ''} />
                    <span>{isResettingRegistrations ? 'กำลังลบข้อมูล...' : 'Reset Registrations'}</span>
                  </button>
                </div>

                {registrationResetFeedback && (
                  <div style={{ fontSize: '13px', fontWeight: 600, color: registrationResetFeedback.startsWith('✓') ? '#047857' : '#b91c1c' }}>
                    {registrationResetFeedback}
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Database Tables Explorer (เมื่อกดเปิดปุ่มตารางฐานข้อมูล) */}
            {isDbExplorerOpen && (
              <div style={{ marginTop: '16px', borderTop: '1.5px solid #e2e8f0', paddingTop: '20px' }}>
                <DatabaseTablesExplorer onClose={() => setIsDbExplorerOpen(false)} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
