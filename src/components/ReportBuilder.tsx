import React, { useState } from 'react';
import { Header } from './Header';
import { AgencyHierarchy } from './AgencyHierarchy';

import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Hexagon, 
  ScatterChart, 
  Grid, 
  Table,
  FileText,
  FileSpreadsheet,
  FileJson,
  File,
  Code,
  Sparkles,
  LayoutTemplate,
  Loader2,
  X
} from 'lucide-react';

interface ReportBuilderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: 'TH' | 'EN';
  setLanguage: (lang: 'TH' | 'EN') => void;
  checkedGeographyNodes: string[];
  setCheckedGeographyNodes: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  searchQuery,
  setSearchQuery,
  language,
  setLanguage,
  checkedGeographyNodes,
  setCheckedGeographyNodes
}) => {
  const [reportState, setReportState] = useState<'empty' | 'generating' | 'completed'>('empty');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);


  const handleTemplateSelect = (_templateName: string) => {
    setShowTemplateDialog(false);
    handleGenerateReport();
  };

  const handleGenerateReport = () => {
    if (!aiPrompt && reportState === 'empty') {
        // If clicking sample without prompt, it's fine.
    }
    setReportState('generating');
    setTimeout(() => {
      setReportState('completed');
    }, 1500);
  };

  return (
    <div className="dashboard-workspace" style={{ width: '100%', marginLeft: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Template Selection Dialog */}
      {showTemplateDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '700px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b', fontWeight: 700 }}>Choose a Sample Template</h2>
              <button onClick={() => setShowTemplateDialog(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {[
                { name: 'Executive Summary', icon: <FileText size={32} color="#3b82f6" />, desc: 'High-level overview for management' },
                { name: 'Project Overview', icon: <LayoutTemplate size={32} color="#8b5cf6" />, desc: 'Detailed status of all active projects' },
                { name: 'Budget Analysis', icon: <PieChart size={32} color="#f59e0b" />, desc: 'Financial tracking and allocations' },
                { name: 'KPI Tracking', icon: <BarChart size={32} color="#10b981" />, desc: 'Performance metrics and goals' },
                { name: 'Monthly Progress', icon: <LineChart size={32} color="#0ea5e9" />, desc: 'Month-over-month trend analysis' },
                { name: 'Annual Report', icon: <FileSpreadsheet size={32} color="#ec4899" />, desc: 'Comprehensive yearly summary' }
              ].map((template, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleTemplateSelect(template.name)}
                  style={{ 
                    border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: '#f8fafc'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ marginBottom: '16px' }}>{template.icon}</div>
                  <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{template.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{template.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowTemplateDialog(false)} 
                style={{ padding: '10px 24px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        language={language} 
        setLanguage={setLanguage} 
        customTitle="Project Summary Report Creation"
      />
      
      <div className="report-builder-container" style={{ display: 'flex', flex: 1, padding: '24px', gap: '24px', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
        
        {/* Left Sidebar - Thailand Government Project Analysis */}
        <div className="report-left-panel" style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '8px' }}>
          <AgencyHierarchy 
            checkedGeographyNodes={checkedGeographyNodes}
            onGeographyFilterChange={setCheckedGeographyNodes}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="report-main-canvas" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* AI Prompt Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Sparkles size={20} color="#8b5cf6" />
            <input 
              type="text" 
              placeholder="อธิบายรายงานที่คุณต้องการสร้างด้วย AI (เช่น 'ขอรายงานสรุปงบประมาณและคุณธรรม 5 ด้าน...')"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', outline: 'none' }}
              disabled={reportState === 'generating'}
            />
            <button 
              onClick={handleGenerateReport}
              disabled={reportState === 'generating'}
              style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {reportState === 'generating' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              สร้างด้วย AI
            </button>
            <button 
              onClick={() => setShowTemplateDialog(true)}
              disabled={reportState === 'generating'}
              style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LayoutTemplate size={16} />
              Sample Report
            </button>
          </div>

          {/* Chart Creation Toolbar */}
          <div className="report-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontWeight: 600, color: '#334155', marginRight: '8px' }}>Chart<br/>Creation</div>
            
            <div className="chart-tool-item">
              <div className="tool-icon"><BarChart size={24} color="#3b82f6" /></div>
              <span>Bar</span>
            </div>
            <div className="chart-tool-item">
              <div className="tool-icon"><LineChart size={24} color="#3b82f6" /></div>
              <span>Line</span>
            </div>
            <div className="chart-tool-item">
              <div className="tool-icon"><PieChart size={24} color="#f59e0b" /></div>
              <span>Pie</span>
            </div>
            <div className="chart-tool-item active">
              <div className="tool-icon"><Hexagon size={24} color="#8b5cf6" /></div>
              <span>Five Moral</span>
            </div>
            <div className="chart-tool-item">
              <div className="tool-icon"><ScatterChart size={24} color="#3b82f6" /></div>
              <span>Scatter</span>
            </div>
            <div className="chart-tool-item">
              <div className="tool-icon"><Grid size={24} color="#f97316" /></div>
              <span>Heatmap</span>
            </div>
            <div className="chart-tool-item">
              <div className="tool-icon"><Table size={24} color="#64748b" /></div>
              <span>Table</span>
            </div>
          </div>

          {/* Draggable Canvas Area */}
          <div className="report-canvas-board" style={{ flex: 1, background: '#fff', borderRadius: '12px', border: reportState === 'completed' ? 'none' : '2px dashed #cbd5e1', boxShadow: reportState === 'completed' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none', position: 'relative', overflow: reportState === 'completed' ? 'auto' : 'hidden' }}>
            {/* Dotted Grid Background */}
            {reportState !== 'completed' && <div className="canvas-grid-bg"></div>}

            {reportState === 'empty' && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#94a3b8' }}>
                <LayoutTemplate size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <h3>เริ่มสร้างรายงานของคุณ</h3>
                <p>ลากแผนภูมิจากด้านบนมาวาง หรือพิมพ์คำสั่งให้ AI สร้างให้</p>
              </div>
            )}

            {reportState === 'generating' && (
              <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', zIndex: 50, color: '#8b5cf6' }}>
                <Loader2 size={48} className="animate-spin" style={{ marginBottom: '16px' }} />
                <h3>AI กำลังวิเคราะห์และจัดรูปแบบรายงาน...</h3>
              </div>
            )}

            {reportState === 'completed' ? (
              <div style={{ padding: '40px', background: '#fff', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '24px', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 8px 0' }}>สรุปผลการดำเนินงานโครงการภาครัฐ ประจำปี</h2>
                  <p style={{ color: '#64748b', margin: 0 }}>รายงานฉบับสมบูรณ์ วิเคราะห์และจัดทำโดย AI Assistant</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  
                  {/* Radar Chart Block */}
                  <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="block-header" style={{ padding: '0 0 16px 0', border: 'none' }}>
                      <span className="block-title">Five Moral Indicators Radar Chart</span>
                      <span className="block-subtitle">ผลการประเมินไทยธรรม 5 ด้าน</span>
                    </div>
                    <div className="block-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
                      <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%' }}>
                        <polygon points="50,10 90,40 75,90 25,90 10,40" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
                        <polygon points="50,30 70,45 60,70 40,70 30,45" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1" />
                        <line x1="50" y1="50" x2="50" y2="10" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="50" y1="50" x2="90" y2="40" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="50" y1="50" x2="75" y2="90" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="50" y1="50" x2="25" y2="90" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="50" y1="50" x2="10" y2="40" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                      </svg>
                    </div>
                  </div>

                  {/* Heatmap Block */}
                  <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="block-header" style={{ padding: '0 0 16px 0', border: 'none' }}>
                      <span className="block-title">Heatmap by agency</span>
                      <span className="block-subtitle">Agency Performance</span>
                    </div>
                    <div className="block-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px', height: '240px' }}>
                      <div className="hm-cell hm-4">5.8</div><div className="hm-cell hm-5">6.5</div><div className="hm-cell hm-2">3.7</div><div className="hm-cell hm-5">6.3</div><div className="hm-cell hm-5">6.7</div>
                      <div className="hm-cell hm-5">6.7</div><div className="hm-cell hm-5">6.7</div><div className="hm-cell hm-3">4.8</div><div className="hm-cell hm-2">3.2</div><div className="hm-cell hm-3">4.3</div>
                      <div className="hm-cell hm-5">6.8</div><div className="hm-cell hm-4">6.2</div><div className="hm-cell hm-2">3.8</div><div className="hm-cell hm-2">3.7</div><div className="hm-cell hm-5">6.3</div>
                      <div className="hm-cell hm-4">5.8</div><div className="hm-cell hm-5">6.9</div><div className="hm-cell hm-3">4.7</div><div className="hm-cell hm-3">4.7</div><div className="hm-cell hm-3">4.3</div>
                    </div>
                  </div>

                  {/* Bar Chart Block */}
                  <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
                    <div className="block-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0 16px 0', border: 'none' }}>
                      <div>
                        <span className="block-title">Project Status Overview</span>
                        <span className="block-subtitle">ผลการดำเนินงานแบ่งตามสถานะภาพรวม</span>
                      </div>
                    </div>
                    <div className="block-content" style={{ display: 'flex', gap: '32px', alignItems: 'flex-end', height: '160px', padding: '10px 0', borderBottom: '1px solid #e2e8f0', borderLeft: '1px solid #e2e8f0', marginLeft: '24px' }}>
                      <div className="mock-bar-col" style={{ width: '60px' }}><div className="mb-1" style={{height:'30%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'40%', background:'#10b981'}}></div><div className="mb-3" style={{height:'30%', background:'#f59e0b'}}></div></div>
                      <div className="mock-bar-col" style={{ width: '60px' }}><div className="mb-1" style={{height:'40%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'30%', background:'#10b981'}}></div><div className="mb-3" style={{height:'20%', background:'#f59e0b'}}></div></div>
                      <div className="mock-bar-col" style={{ width: '60px' }}><div className="mb-1" style={{height:'20%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'50%', background:'#10b981'}}></div><div className="mb-3" style={{height:'25%', background:'#f59e0b'}}></div></div>
                      <div className="mock-bar-col" style={{ width: '60px' }}><div className="mb-1" style={{height:'35%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'35%', background:'#10b981'}}></div><div className="mb-3" style={{height:'20%', background:'#f59e0b'}}></div></div>
                      <div className="mock-bar-col" style={{ width: '60px' }}><div className="mb-1" style={{height:'50%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'20%', background:'#10b981'}}></div><div className="mb-3" style={{height:'30%', background:'#f59e0b'}}></div></div>
                      <div className="mock-bar-col" style={{ width: '60px' }}><div className="mb-1" style={{height:'20%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'60%', background:'#10b981'}}></div><div className="mb-3" style={{height:'10%', background:'#f59e0b'}}></div></div>
                      <div className="mock-bar-col" style={{ width: '60px' }}><div className="mb-1" style={{height:'10%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'80%', background:'#10b981'}}></div><div className="mb-3" style={{height:'10%', background:'#f59e0b'}}></div></div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <>
                {/* Legacy scattered blocks for 'empty' state */}
                {/* Radar Chart Block */}
                <div className="canvas-block active-block" style={{ top: '24px', left: '24px', width: '340px', height: '320px', zIndex: 10 }}>
              <div className="block-header">
                <span className="block-title">Five Moral Indicators Radar Chart</span>
                <span className="block-subtitle">ผลการประเมินไทยธรรม 5 ด้าน</span>
              </div>
              <div className="block-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                <img src="/radar-mock.png" alt="Radar Chart" style={{ width: '80%', opacity: 0.8 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                {/* Fallback geometric shape if image is missing */}
                <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%', position: 'absolute' }}>
                  <polygon points="50,10 90,40 75,90 25,90 10,40" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
                  <polygon points="50,30 70,45 60,70 40,70 30,45" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1" />
                  <line x1="50" y1="50" x2="50" y2="10" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="50" y1="50" x2="90" y2="40" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="50" y1="50" x2="75" y2="90" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="50" y1="50" x2="25" y2="90" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="50" y1="50" x2="10" y2="40" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                </svg>
              </div>
              
              {/* Resize Handles */}
              <div className="resize-handle tl"></div>
              <div className="resize-handle tr"></div>
              <div className="resize-handle bl"></div>
              <div className="resize-handle br"></div>
            </div>

            {/* Bar Chart Block */}
            <div className="canvas-block" style={{ top: '24px', left: '388px', width: '400px', height: '240px' }}>
              <div className="block-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span className="block-title">Project Status</span>
                  <span className="block-subtitle">ผลการดำเนินงานแบ่งตามสถานะ</span>
                </div>
                <div style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>Target v</div>
              </div>
              <div className="block-content" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '60%', padding: '10px 0', borderBottom: '1px solid #e2e8f0', borderLeft: '1px solid #e2e8f0', marginLeft: '24px', marginTop: '16px' }}>
                <div className="mock-bar-col"><div className="mb-1" style={{height:'30%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'40%', background:'#10b981'}}></div><div className="mb-3" style={{height:'30%', background:'#f59e0b'}}></div></div>
                <div className="mock-bar-col"><div className="mb-1" style={{height:'40%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'30%', background:'#10b981'}}></div><div className="mb-3" style={{height:'20%', background:'#f59e0b'}}></div></div>
                <div className="mock-bar-col"><div className="mb-1" style={{height:'20%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'50%', background:'#10b981'}}></div><div className="mb-3" style={{height:'25%', background:'#f59e0b'}}></div></div>
                <div className="mock-bar-col"><div className="mb-1" style={{height:'35%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'35%', background:'#10b981'}}></div><div className="mb-3" style={{height:'20%', background:'#f59e0b'}}></div></div>
                <div className="mock-bar-col"><div className="mb-1" style={{height:'50%', background:'#8b5cf6'}}></div><div className="mb-2" style={{height:'20%', background:'#10b981'}}></div><div className="mb-3" style={{height:'30%', background:'#f59e0b'}}></div></div>
              </div>
              
              <div className="resize-handle tl"></div>
              <div className="resize-handle tr"></div>
              <div className="resize-handle bl"></div>
              <div className="resize-handle br"></div>
            </div>

            {/* Pie Chart Block */}
            <div className="canvas-block" style={{ top: '368px', left: '24px', width: '340px', height: '240px' }}>
              <div className="block-header">
                <span className="block-title">Budget Allocation</span>
                <span className="block-subtitle">Allocation by Region</span>
              </div>
              <div className="block-content" style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingLeft: '16px', marginTop: '16px' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'conic-gradient(#3b82f6 0% 38.5%, #f59e0b 38.5% 63.7%, #64748b 63.7% 80.1%, #eab308 80.1% 100%)', position: 'relative' }}>
                  <div style={{ position: 'absolute', width: '50%', height: '50%', background: '#fff', borderRadius: '50%', top: '25%', left: '25%' }}></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div> Region 1 (38.5%)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div> Region 2 (25.2%)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }}></div> Region 3 (16.4%)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></div> Region 4 (19.9%)</div>
                </div>
              </div>
              
              <div className="resize-handle tl"></div>
              <div className="resize-handle tr"></div>
              <div className="resize-handle bl"></div>
              <div className="resize-handle br"></div>
            </div>

            {/* Heatmap Block */}
            <div className="canvas-block" style={{ top: '288px', left: '388px', width: '400px', height: '320px' }}>
              <div className="block-header">
                <span className="block-title">Heatmap by agency</span>
                <span className="block-subtitle">Agency Performance</span>
              </div>
              <div className="block-content" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px', padding: '0 16px' }}>
                <div className="hm-cell hm-4">5.8</div><div className="hm-cell hm-5">6.5</div><div className="hm-cell hm-2">3.7</div><div className="hm-cell hm-5">6.3</div><div className="hm-cell hm-5">6.7</div>
                <div className="hm-cell hm-5">6.7</div><div className="hm-cell hm-5">6.7</div><div className="hm-cell hm-3">4.8</div><div className="hm-cell hm-2">3.2</div><div className="hm-cell hm-3">4.3</div>
                <div className="hm-cell hm-5">6.8</div><div className="hm-cell hm-4">6.2</div><div className="hm-cell hm-2">3.8</div><div className="hm-cell hm-2">3.7</div><div className="hm-cell hm-5">6.3</div>
                <div className="hm-cell hm-4">5.8</div><div className="hm-cell hm-5">6.9</div><div className="hm-cell hm-3">4.7</div><div className="hm-cell hm-3">4.7</div><div className="hm-cell hm-3">4.3</div>
              </div>
              
              <div className="resize-handle tl"></div>
              <div className="resize-handle tr"></div>
              <div className="resize-handle bl"></div>
              <div className="resize-handle br"></div>
            </div>

              </>
            )}

          </div>
        </div>

        {/* Right Sidebar - Export Options */}
        <div className="report-right-panel" style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, color: '#334155', fontSize: '16px' }}>Export Options</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="export-btn" style={{ color: '#10b981' }}>
              <Code size={36} />
              <span>CSV</span>
            </div>
            <div className="export-btn" style={{ color: '#ef4444' }}>
              <FileText size={36} />
              <span>PDF</span>
            </div>
            <div className="export-btn" style={{ color: '#22c55e' }}>
              <FileSpreadsheet size={36} />
              <span>EXCEL</span>
            </div>
            <div className="export-btn" style={{ color: '#3b82f6' }}>
              <File size={36} />
              <span>WORD</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>PDF security</label>
            <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
              <option>PDF security</option>
            </select>
          </div>

          <div className="export-btn-large" style={{ color: '#0ea5e9' }}>
            <FileJson size={48} />
            <span>JSON</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>JSON formatting</label>
            <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
              <option>JSON formatting</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};
