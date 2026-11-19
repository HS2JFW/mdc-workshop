import React, { useState } from 'react';
import { Bot, Send, Loader2, BarChart2, Edit2, Trash2, Sparkles, Users } from 'lucide-react';
import { evaluateProjectWithAI, generateProjectIdeaWithAI } from '../lib/openRouter';

export interface ProposedProject {
  id: string;
  name: string;
  description: string;
  targetType: string;
  targetName: string;
  beforeScore: number;
  afterScore: number;
  beforeVirtues: Record<string, number>;
  afterVirtues: Record<string, number>;
  aiReasoning: string;
  status?: 'AI' | 'Human';
}

export interface CommunityWidgetProps {
  onNavigateToCommunity?: () => void;
}

export const CommunityWidget: React.FC<CommunityWidgetProps> = ({ onNavigateToCommunity }) => {
  const handleClick = () => {
    if (onNavigateToCommunity) {
      onNavigateToCommunity();
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { tab: 'dashboard', viewMode: 'overview', overviewTab: 'policy', showAiInsights: true } 
      }));
    }
  };

  return (
    <div className="chart-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px' }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>Community</h4>
      <button 
        onClick={handleClick}
        style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
        background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', 
        padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', width: '100%'
      }}>
        <Users size={18} />
        เสียงสะท้อนจากประชาชน
      </button>
    </div>
  );
};

export interface ActionWidgetsProps {
  currentContext: string;
  onAddProjectToCommunity?: (project: ProposedProject) => void;
}

export const ActionWidgets: React.FC<ActionWidgetsProps> = ({ currentContext, onAddProjectToCommunity }) => {
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [projects, setProjects] = useState<ProposedProject[]>([]);
  const [editingProject, setEditingProject] = useState<ProposedProject | null>(null);
  const [viewingProject, setViewingProject] = useState<ProposedProject | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const handleGenerateIdea = async () => {
    setIsGeneratingIdea(true);
    try {
      const idea = await generateProjectIdeaWithAI(currentContext, 'พื้นที่ทั่วไป');
      setFormName(idea.name);
      setFormDescription(idea.description);
      setIsAiGenerated(true);
      setIsModalOpen(true);
      setEditingProject(null);
    } catch (error) {
      console.error('Error generating idea:', error);
      alert('เกิดข้อผิดพลาดในการสร้างโครงการ แนะนำให้ลองใหม่อีกครั้ง');
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  const handleEvaluate = async () => {
    if (!formName || !formDescription) {
      alert('กรุณากรอกชื่อและรายละเอียดโครงการ');
      return;
    }
    setIsEvaluating(true);
    try {
      const evaluation = await evaluateProjectWithAI(
        formDescription,
        'พื้นที่ทั่วไป',
        currentContext
      );
      
      const newProject: ProposedProject = {
        id: editingProject ? editingProject.id : Date.now().toString(),
        name: formName,
        description: formDescription,
        targetType: currentContext,
        targetName: 'พื้นที่ทั่วไป',
        beforeScore: evaluation.beforeScore,
        afterScore: evaluation.afterScore,
        beforeVirtues: evaluation.beforeVirtues,
        afterVirtues: evaluation.afterVirtues,
        aiReasoning: evaluation.reasoning,
        status: isAiGenerated ? 'AI' : 'Human'
      };

      if (editingProject) {
        setProjects(projects.map(p => p.id === editingProject.id ? newProject : p));
      } else {
        setProjects([...projects, newProject]);
      }
      setIsModalOpen(false);
      setFormName('');
      setFormDescription('');
      setEditingProject(null);
      
      setViewingProject(newProject);
      setIsAnalysisModalOpen(true);
    } catch (error) {
      console.error('Evaluation error:', error);
      alert('เกิดข้อผิดพลาดในการประเมินโครงการ');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
      


      {/* Zone AI */}
      <div className="chart-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>Zone AI</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

          <button 
            style={{ padding: '16px', background: isModalOpen ? '#eff6ff' : '#fff', border: `2px dashed ${isModalOpen ? '#3b82f6' : '#cbd5e1'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
            onMouseOver={e => !isModalOpen && (e.currentTarget.style.borderColor = '#10b981')}
            onMouseOut={e => !isModalOpen && (e.currentTarget.style.borderColor = '#cbd5e1')}
            onClick={() => {
              setIsModalOpen(!isModalOpen);
              if (!isModalOpen) {
                setEditingProject(null);
                setFormName('');
                setFormDescription('');
              }
            }}
          >
            <Bot size={24} color="#10b981" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155', textAlign: 'left' }}>นำเสนอโครงการของตนเอง และให้ AI ช่วยประเมินคะแนน</span>
          </button>
        </div>

        {/* Inline Prompt Textarea */}
        {isModalOpen && (
          <div style={{ marginTop: '16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <input 
              type="text" 
              value={formName} 
              onChange={e => { setFormName(e.target.value); setIsAiGenerated(false); }} 
              placeholder="ชื่อโครงการ..." 
              style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600 }}
            />
            <textarea 
              value={formDescription} 
              onChange={e => { setFormDescription(e.target.value); setIsAiGenerated(false); }} 
              placeholder="อธิบายรายละเอียดโครงการที่ต้องการให้ AI วิเคราะห์..." 
              rows={4}
              style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ padding: '8px 12px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleEvaluate} 
                disabled={isEvaluating}
                style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: isEvaluating ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', opacity: isEvaluating ? 0.7 : 1 }}
              >
                {isEvaluating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isEvaluating ? 'กำลังวิเคราะห์...' : (editingProject ? 'อัปเดต' : 'ส่งวิเคราะห์')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Proposed Projects Table (if any) */}
      {projects.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '14px' }}>โครงการที่นำเสนอ (Proposed Projects)</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>ชื่อโครงการ</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>เป้าหมาย</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>สถานะ</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '12px' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '8px 12px', color: '#64748b' }}>
                    <span style={{ background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '8px', fontWeight: 'bold', marginRight: '4px' }}>
                      {p.afterScore.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    {p.status === 'AI' ? (
                      <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>AI</span>
                    ) : p.status === 'Human' ? (
                      <span style={{ background: '#f8fafc', color: '#64748b', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Human</span>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setViewingProject(p); setIsAnalysisModalOpen(true); }} style={{ padding: '4px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="AI วิเคราะห์">
                      <BarChart2 size={14} />
                    </button>
                    <button onClick={() => { setEditingProject(p); setFormName(p.name); setFormDescription(p.description); setIsModalOpen(true); }} style={{ padding: '4px', background: '#f8fafc', color: '#64748b', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="แก้ไข">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setProjects(projects.filter(proj => proj.id !== p.id))} style={{ padding: '4px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="ลบ">
                      <Trash2 size={14} />
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 16px 0', textAlign: 'center', color: '#64748b' }}>คะแนนก่อนมีโครงการ</h4>
                <div style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', color: '#334155', marginBottom: '16px' }}>
                  {viewingProject.beforeScore.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 16px 0', textAlign: 'center', color: '#059669' }}>คะแนนหลังมีโครงการ</h4>
                <div style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', color: '#10b981', marginBottom: '16px' }}>
                  {viewingProject.afterScore.toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1e3a8a' }}>เหตุผลจาก AI</h4>
              <p style={{ margin: 0, color: '#1e40af', fontSize: '14px', lineHeight: '1.6' }}>{viewingProject.aiReasoning}</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsAnalysisModalOpen(false)} style={{ padding: '12px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>ปิดหน้าต่าง</button>
              {onAddProjectToCommunity && (
                <button 
                  onClick={() => {
                    onAddProjectToCommunity(viewingProject);
                    setIsAnalysisModalOpen(false);
                  }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  <Sparkles size={16} /> เพิ่มลงตารางกลุ่ม
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
