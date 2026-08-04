import React, { useState, useEffect } from 'react';
import { Save, Key, Cpu, FileText } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-3.5-turbo');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [generatorPrompt, setGeneratorPrompt] = useState('');

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

  useEffect(() => {
    setApiKey(localStorage.getItem('ai_api_key') || '');
    setModel(localStorage.getItem('ai_model') || 'openai/gpt-3.5-turbo');
    setSystemPrompt(localStorage.getItem('ai_system_prompt') || defaultPrompt);
    setGeneratorPrompt(localStorage.getItem('ai_generator_prompt') || defaultGeneratorPrompt);
  }, []);

  const handleSave = () => {
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_model', model);
    localStorage.setItem('ai_system_prompt', systemPrompt);
    localStorage.setItem('ai_generator_prompt', generatorPrompt);
    alert('บันทึกการตั้งค่า AI เรียบร้อยแล้ว');
  };

  const handleResetPrompt = () => {
    setSystemPrompt(defaultPrompt);
    setGeneratorPrompt(defaultGeneratorPrompt);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '24px' }}>ตั้งค่า AI (OpenRouter)</h1>
      
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
          กำหนดค่า API Key และ Model สำหรับเชื่อมต่อกับระบบ AI ภายนอกผ่าน <strong>OpenRouter</strong> เพื่อใช้วิเคราะห์ผลกระทบของโครงการ (Project Evaluation)
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            <Key size={16} /> OpenRouter API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={e => {
              setApiKey(e.target.value);
              localStorage.setItem('ai_api_key', e.target.value);
            }}
            placeholder="sk-or-v1-..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            * API Key จะถูกบันทึกไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น (Local Storage)
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            <Cpu size={16} /> AI Model
          </label>
          <input
            type="text"
            value={model}
            onChange={e => {
              setModel(e.target.value);
              localStorage.setItem('ai_model', e.target.value);
            }}
            placeholder="e.g., openai/gpt-4o-mini, google/gemini-flash-1.5, anthropic/claude-3-haiku"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

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
            rows={10}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.5', resize: 'vertical' }}
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
            rows={10}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.5', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} /> บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
};
