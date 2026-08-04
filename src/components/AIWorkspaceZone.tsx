import React, { useState } from 'react';
import { Bot, Send, Loader2, BarChart2, Edit2, Trash2, Sparkles } from 'lucide-react';
import { evaluateProjectWithAI, generateProjectIdeaWithAI } from '../lib/openRouter';
import type { ProposedProject } from './ActionWidgets';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AIWorkspaceZoneProps {
  currentContext: string;
}

export const AIWorkspaceZone: React.FC<AIWorkspaceZoneProps> = ({ currentContext }) => {
  const [projects, setProjects] = useState<ProposedProject[]>([]);
  const [aiFormName, setAiFormName] = useState('');
  const [aiFormDescription, setAiFormDescription] = useState('');
  const [userFormName, setUserFormName] = useState('');
  const [userFormDescription, setUserFormDescription] = useState('');
  
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [evaluatingSide, setEvaluatingSide] = useState<'ai' | 'user' | null>(null);
  
  const [editingProject, setEditingProject] = useState<ProposedProject | null>(null);
  const [viewingProject, setViewingProject] = useState<ProposedProject | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const handleGenerateIdea = async () => {
    setIsGeneratingIdea(true);
    try {
      const idea = await generateProjectIdeaWithAI(currentContext, 'พื้นที่ทั่วไป');
      setAiFormName(idea.name);
      setAiFormDescription(idea.description);
      setEditingProject(null);
    } catch (error) {
      console.error('Error generating idea:', error);
      alert('เกิดข้อผิดพลาดในการสร้างโครงการ แนะนำให้ลองใหม่อีกครั้ง');
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  const handleEvaluate = async (side: 'ai' | 'user') => {
    const isAi = side === 'ai';
    const currentName = isAi ? aiFormName : userFormName;
    const currentDesc = isAi ? aiFormDescription : userFormDescription;

    if (!currentName || !currentDesc) {
      alert('กรุณากรอกชื่อและรายละเอียดโครงการ');
      return;
    }
    setEvaluatingSide(side);
    try {
      const evaluation = await evaluateProjectWithAI(
        currentDesc,
        'พื้นที่ทั่วไป',
        currentContext
      );
      
      const newProject: ProposedProject = {
        id: editingProject ? editingProject.id : Date.now().toString(),
        name: currentName,
        description: currentDesc,
        targetType: currentContext,
        targetName: 'พื้นที่ทั่วไป',
        beforeScore: evaluation.beforeScore,
        afterScore: evaluation.afterScore,
        beforeVirtues: evaluation.beforeVirtues,
        afterVirtues: evaluation.afterVirtues,
        aiReasoning: evaluation.reasoning,
        status: isAi ? 'AI' : 'Human'
      };

      if (editingProject) {
        setProjects(projects.map(p => p.id === editingProject.id ? newProject : p));
      } else {
        setProjects([...projects, newProject]);
      }
      
      if (isAi) {
        setAiFormName('');
        setAiFormDescription('');
      } else {
        setUserFormName('');
        setUserFormDescription('');
      }
      setEditingProject(null);
      
      setViewingProject(newProject);
      setIsAnalysisModalOpen(true);
    } catch (error) {
      console.error('Evaluation error:', error);
      alert('เกิดข้อผิดพลาดในการประเมินโครงการ');
    } finally {
      setEvaluatingSide(null);
    }
  };

  const renderVirtueChart = (beforeVirtues: Record<string, number>, afterVirtues: Record<string, number>) => {
    const data = Object.keys(beforeVirtues).map(key => ({
      subject: key,
      ก่อนเริ่มโครงการ: beforeVirtues[key],
      หลังจบโครงการ: afterVirtues[key]
    }));

    return (
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Radar name="ก่อนเริ่มโครงการ" dataKey="ก่อนเริ่มโครงการ" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.4} />
            <Radar name="หลังจบโครงการ" dataKey="หลังจบโครงการ" stroke="#10b981" fill="#34d399" fillOpacity={0.6} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px', width: '100%' }}>
      
      {/* Zone AI 2 Columns */}
      <div className="chart-card" style={{ padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 24px 0', color: '#334155', fontSize: '20px' }}>Zone AI</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          
          {/* AI Recommend Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button 
              style={{ padding: '16px', background: isGeneratingIdea ? '#eff6ff' : '#fff', border: `2px dashed ${isGeneratingIdea ? '#3b82f6' : '#cbd5e1'}`, borderRadius: '12px', cursor: isGeneratingIdea ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', opacity: isGeneratingIdea ? 0.7 : 1 }}
              onMouseOver={e => !isGeneratingIdea && (e.currentTarget.style.borderColor = '#3b82f6')}
              onMouseOut={e => !isGeneratingIdea && (e.currentTarget.style.borderColor = '#cbd5e1')}
              onClick={handleGenerateIdea}
              disabled={isGeneratingIdea}
            >
              {isGeneratingIdea ? <Loader2 size={24} color="#3b82f6" className="animate-spin" /> : <Sparkles size={24} color="#3b82f6" />}
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155', textAlign: 'left' }}>
                {isGeneratingIdea ? 'กำลังคิดค้นโครงการ...' : 'คุณต้องการให้ AI แนะนำโครงการที่เหมาะสม'}
              </span>
            </button>
            
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <input 
                type="text" 
                value={aiFormName} 
                onChange={e => setAiFormName(e.target.value)} 
                placeholder="ชื่อโครงการ..." 
                style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600 }}
              />
              <textarea 
                value={aiFormDescription} 
                onChange={e => setAiFormDescription(e.target.value)} 
                placeholder="รายละเอียดโครงการ..." 
                rows={6}
                style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical', flexGrow: 1 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleEvaluate('ai')} 
                  disabled={evaluatingSide === 'ai'}
                  style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: evaluatingSide === 'ai' ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', opacity: evaluatingSide === 'ai' ? 0.7 : 1 }}
                >
                  {evaluatingSide === 'ai' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  ส่งวิเคราะห์
                </button>
              </div>
            </div>
          </div>

          {/* User Submit Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bot size={24} color="#10b981" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155', textAlign: 'left' }}>นำเสนอโครงการของตนเอง และให้ AI ช่วยประเมินคะแนน</span>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <input 
                type="text" 
                value={userFormName} 
                onChange={e => setUserFormName(e.target.value)} 
                placeholder="ชื่อโครงการ..." 
                style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600 }}
              />
              <textarea 
                value={userFormDescription} 
                onChange={e => setUserFormDescription(e.target.value)} 
                placeholder="อธิบายรายละเอียดโครงการที่ต้องการให้ AI วิเคราะห์..." 
                rows={6}
                style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical', flexGrow: 1 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={() => { setUserFormName(''); setUserFormDescription(''); setEditingProject(null); }} 
                  style={{ padding: '10px 16px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  ล้าง
                </button>
                <button 
                  onClick={() => handleEvaluate('user')} 
                  disabled={evaluatingSide === 'user'}
                  style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: evaluatingSide === 'user' ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', opacity: evaluatingSide === 'user' ? 0.7 : 1 }}
                >
                  {evaluatingSide === 'user' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {editingProject ? 'อัปเดต' : 'ส่งวิเคราะห์'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Proposed Projects Table */}
      {projects.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px' }}>โครงการที่นำเสนอ (Proposed Projects)</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', fontSize: '14px', color: '#64748b' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ชื่อโครงการ</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>เป้าหมาย</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>สถานะ</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    <span style={{ background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold', marginRight: '4px' }}>
                      {p.afterScore.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {p.status === 'AI' ? (
                      <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>AI</span>
                    ) : p.status === 'Human' ? (
                      <span style={{ background: '#f8fafc', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Human</span>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setViewingProject(p); setIsAnalysisModalOpen(true); }} style={{ padding: '6px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="AI วิเคราะห์">
                      <BarChart2 size={16} />
                    </button>
                    <button onClick={() => { setEditingProject(p); setUserFormName(p.name); setUserFormDescription(p.description); }} style={{ padding: '6px', background: '#f8fafc', color: '#64748b', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="แก้ไข">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setProjects(projects.filter(proj => proj.id !== p.id))} style={{ padding: '6px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="ลบ">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Analysis Result Modal */}
      {isAnalysisModalOpen && viewingProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '700px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot color="#3b82f6" /> ผลการวิเคราะห์โครงการ
              </h2>
              <button onClick={() => setIsAnalysisModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', color: '#0f172a' }}>{viewingProject.name}</h3>
              <p style={{ margin: 0, color: '#64748b' }}>เป้าหมาย: <strong>{viewingProject.targetName}</strong> ({viewingProject.targetType})</p>
              <p style={{ marginTop: '8px', padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '14px', lineHeight: '1.5' }}>{viewingProject.description || 'ไม่มีรายละเอียด'}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>คะแนนคุณธรรมก่อนเริ่ม</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#94a3b8' }}>{viewingProject.beforeScore.toFixed(2)}</div>
              </div>
              <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#059669', fontSize: '14px' }}>คะแนนคุณธรรมหลังจบ</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{viewingProject.afterScore.toFixed(2)}</div>
              </div>
            </div>

            {renderVirtueChart(viewingProject.beforeVirtues, viewingProject.afterVirtues)}

            <div style={{ marginTop: '24px', background: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1e40af', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} /> บทสรุปและคำแนะนำจาก AI
              </h4>
              <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.6' }}>{viewingProject.aiReasoning}</p>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsAnalysisModalOpen(false)} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
