import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { AgencyHierarchy } from './AgencyHierarchy';
import { ActionWidgets, CommunityWidget } from './ActionWidgets';
import type { ProposedProject } from './ActionWidgets';
import { ChartsPanel } from './ChartsPanel';
import { CommunityChat } from './CommunityChat';
import { CommunityRanking } from './CommunityRanking';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { Users, Sprout, HandMetal, ArrowLeft, Trash2, TrendingUp, Eye, Search, User, PieChart as PieChartIcon, BarChart2, Target, Bot, Trophy, MessageSquare, Send } from 'lucide-react';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

interface CommunityPageProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: 'TH' | 'EN';
  setLanguage: (lang: 'TH' | 'EN') => void;
  checkedGeographyNodes: string[];
  setCheckedGeographyNodes: React.Dispatch<React.SetStateAction<string[]>>;
}

const MOCK_COMMUNITIES = [
  { id: 1, name: 'กลุ่มรักบ้านเกิด', members: 150, projects: 12, score: 4.8, icon: Users, color: '#3b82f6', bg: '#eff6ff', type: 'group' },
  { id: 2, name: 'นายสมชาย เกษตรกรดีเด่น', members: 1, projects: 4, score: 4.9, icon: User, color: '#f59e0b', bg: '#fffbeb', type: 'individual' },
  { id: 3, name: 'กลุ่มพัฒนาชุมชนดอนเมือง', members: 180, projects: 8, score: 4.5, icon: Sprout, color: '#10b981', bg: '#ecfdf5', type: 'group' },
  { id: 4, name: 'กลุ่มพัฒนาชุมชนคลอง', members: 150, projects: 8, score: 4.2, icon: HandMetal, color: '#ef4444', bg: '#fef2f2', type: 'group' },
  { id: 5, name: 'กลุ่มรักบ้านเกิด 2', members: 150, projects: 12, score: 4.1, icon: Users, color: '#3b82f6', bg: '#eff6ff', type: 'group' },
  { id: 6, name: 'นางสาววิไลลักษณ์ ถิ่นป่า', members: 1, projects: 3, score: 5.0, icon: User, color: '#10b981', bg: '#ecfdf5', type: 'individual' },
  { id: 7, name: 'กลุ่มพัฒนาชุมชนดอนเมือง 2', members: 150, projects: 8, score: 4.7, icon: Sprout, color: '#10b981', bg: '#ecfdf5', type: 'group' },
  { id: 8, name: 'ลุงพล คนสู้ชีวิต', members: 1, projects: 2, score: 4.4, icon: User, color: '#ef4444', bg: '#fef2f2', type: 'individual' },
  { id: 9, name: 'กลุ่มคอเอมข้น', members: 150, projects: 12, score: 4.8, icon: Sprout, color: '#10b981', bg: '#ecfdf5', type: 'group' },
  { id: 10, name: 'กลุ่มพัฒนาชุมชนดอนเมือง 3', members: 150, projects: 5, score: 4.6, icon: Users, color: '#3b82f6', bg: '#eff6ff', type: 'group' },
  { id: 11, name: 'ป้าศรี ปลูกผักอินทรีย์', members: 1, projects: 6, score: 4.9, icon: User, color: '#f59e0b', bg: '#fffbeb', type: 'individual' },
  { id: 12, name: 'กลุ่มเกษตรยั่งยืน 3', members: 150, projects: 5, score: 4.8, icon: Users, color: '#3b82f6', bg: '#eff6ff', type: 'group' },
  { id: 13, name: 'กลุ่มบ้านเก่าก', members: 150, projects: 5, score: 4.2, icon: Users, color: '#3b82f6', bg: '#eff6ff', type: 'group' },
  { id: 14, name: 'พี่โดม คนรักษ์น้ำ', members: 1, projects: 5, score: 4.8, icon: User, color: '#3b82f6', bg: '#eff6ff', type: 'individual' },
  { id: 15, name: 'กลุ่มตากศาลา', members: 150, projects: 5, score: 4.5, icon: Users, color: '#3b82f6', bg: '#eff6ff', type: 'group' },
  { id: 16, name: 'กลุ่มลดบ่อม่วง', members: 150, projects: 5, score: 4.3, icon: HandMetal, color: '#ef4444', bg: '#fef2f2', type: 'group' }
];

const VIRTUE_KEYS = ['วินัย', 'พอเพียง', 'สุจริต', 'จิตอาสา', 'กตัญญู'];

const REALISTIC_PROJECT_NAMES = [
  'โครงการสร้างฝายชะลอน้ำเพื่อการเกษตร',
  'โครงการจัดการขยะมูลฝอยในชุมชนแบบครบวงจร',
  'โครงการส่งเสริมอาชีพผู้สูงอายุและแม่บ้าน',
  'โครงการยุวชนจิตอาสาดูแลสิ่งแวดล้อมคลอง',
  'โครงการเกษตรอินทรีย์วิถีพอเพียง',
  'โครงการตลาดนัดชุมชนกระตุ้นเศรษฐกิจ',
  'โครงการแปรรูปผลผลิตทางการเกษตร',
  'โครงการเฝ้าระวังยาเสพติดในหมู่บ้าน',
  'โครงการปลูกป่าชุมชนเพิ่มพื้นที่สีเขียว',
  'โครงการศูนย์เรียนรู้เศรษฐกิจพอเพียง'
];

function generateMockProjects(count: number): ProposedProject[] {
  const projects: ProposedProject[] = [];
  for (let i = 0; i < count; i++) {
    const beforeVirtues: Record<string, number> = {};
    const afterVirtues: Record<string, number> = {};
    let beforeSum = 0;
    let afterSum = 0;

    VIRTUE_KEYS.forEach(v => {
      const bScore = Math.floor(Math.random() * 3); // 0 to 2
      const aScore = Math.min(10, bScore + Math.floor(Math.random() * 5) + 1); 
      beforeVirtues[v] = bScore;
      afterVirtues[v] = aScore;
      beforeSum += beforeVirtues[v];
      afterSum += afterVirtues[v];
    });

    projects.push({
      id: `mock-${i}-${Date.now()}`,
      name: REALISTIC_PROJECT_NAMES[i % REALISTIC_PROJECT_NAMES.length] + (Math.random() > 0.5 ? ` รุ่นที่ ${Math.floor(Math.random() * 5) + 1}` : ''),
      description: 'รายละเอียดโครงการนี้จัดทำขึ้นเพื่อพัฒนาคุณภาพชีวิตของคนในชุมชน โดยมุ่งเน้นการมีส่วนร่วมและใช้ทรัพยากรที่มีอยู่อย่างคุ้มค่าที่สุด เพื่อให้เกิดความยั่งยืนในระยะยาว',
      targetType: 'Community',
      targetName: 'Local Group',
      beforeScore: Number((beforeSum / 5).toFixed(2)),
      afterScore: Number((afterSum / 5).toFixed(2)),
      beforeVirtues,
      afterVirtues,
      aiReasoning: 'Random mock reasoning'
    });
  }
  return projects;
}


export const CommunityPage: React.FC<CommunityPageProps> = ({
  searchQuery,
  setSearchQuery,
  language,
  setLanguage,
  checkedGeographyNodes,
  setCheckedGeographyNodes
}) => {
  const [selectedCommunity, setSelectedCommunity] = useState<typeof MOCK_COMMUNITIES[0] | null>(null);
  const [communityProjects, setCommunityProjects] = useState<ProposedProject[]>([]);
  const [viewingProjectDetails, setViewingProjectDetails] = useState<ProposedProject | null>(null);
  const [chartType, setChartType] = useState<'radar' | 'bar' | 'pie' | 'post'>('radar');

  const [posts, setPosts] = useState<{ id: string, author: string, time: string, content: string }[]>([
    { id: '1', author: 'ผู้ใหญ่บ้าน สมศรี', time: '2 ชั่วโมงที่แล้ว', content: 'สัปดาห์หน้าเรามีนัดรวมตัวกันทำความสะอาดลานวัดนะคะ ใครว่างมาร่วมด้วยช่วยกันได้เลย' },
    { id: '2', author: 'นพดล (จิตอาสา)', time: '5 ชั่วโมงที่แล้ว', content: 'โครงการแยกขยะในชุมชนเริ่มเห็นผลแล้วครับ ขยะเปียกลดลงไปเยอะมาก ขอบคุณทุกความร่วมมือครับ' }
  ]);
  const [newPostContent, setNewPostContent] = useState('');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    const newPost = {
      id: Date.now().toString(),
      author: 'ฉันเอง',
      time: 'เมื่อสักครู่',
      content: newPostContent
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const [communityType, setCommunityType] = useState<'all' | 'individual' | 'group'>('all');
  const [communitySearch, setCommunitySearch] = useState('');
  const [showRanking, setShowRanking] = useState(false);

  useEffect(() => {
    if (selectedCommunity) {
      setCommunityProjects(generateMockProjects(selectedCommunity.projects));
    } else {
      setCommunityProjects([]);
    }
  }, [selectedCommunity]);

  const handleAddProjectToCommunity = (project: ProposedProject) => {
    setCommunityProjects(prev => [project, ...prev]);
  };

  const handleDeleteProject = (id: string) => {
    setCommunityProjects(prev => prev.filter(p => p.id !== id));
  };

  // Compute aggregate stats for Before/After Chart
  const aggregateStats = {
    before: 0,
    after: 0
  };
  
  const radarData = VIRTUE_KEYS.map(v => {
    let bSum = 0, aSum = 0;
    communityProjects.forEach(p => {
      bSum += p.beforeVirtues[v] || 0;
      aSum += p.afterVirtues[v] || 0;
    });
    const count = communityProjects.length || 1;
    const beforeVal = Number((bSum / count).toFixed(2));
    const afterVal = Number((aSum / count).toFixed(2));
    return {
      subject: v,
      before: beforeVal,
      after: afterVal,
      displayBefore: `${v} ${beforeVal.toFixed(1)}`,
      displayAfter: `${v} ${afterVal.toFixed(1)}`
    };
  });

  if (communityProjects.length > 0) {
    aggregateStats.before = communityProjects.reduce((sum, p) => sum + p.beforeScore, 0) / communityProjects.length;
    aggregateStats.after = communityProjects.reduce((sum, p) => sum + p.afterScore, 0) / communityProjects.length;
  }

  const mockStats = { totalBudget: "0", activeProjects: communityProjects.length, averageScore: aggregateStats.after || 4.8 };
  
  const filteredCommunities = MOCK_COMMUNITIES.filter(comm => {
    if (communityType !== 'all' && comm.type !== communityType) return false;
    if (communitySearch.trim() && !comm.name.toLowerCase().includes(communitySearch.toLowerCase())) return false;
    return true;
  });
  
  return (
    <>
      <AgencyHierarchy 
        viewMode="map"
        checkedGeographyNodes={checkedGeographyNodes}
        onGeographyFilterChange={setCheckedGeographyNodes}
      />
      
      <div className="dashboard-workspace">
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          language={language} 
          setLanguage={setLanguage} 
        />
        
        <div className="dashboard-content-scroll">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px 0 24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
              ชุมชนกลุ่มชาวบ้าน (Groups of Community)
            </h2>
            
            {!selectedCommunity && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                  <button 
                    onClick={() => { setCommunityType('all'); setShowRanking(false); }}
                    style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: communityType === 'all' && !showRanking ? '#fff' : 'transparent', color: communityType === 'all' && !showRanking ? '#0f172a' : '#64748b', fontWeight: communityType === 'all' && !showRanking ? 600 : 500, boxShadow: communityType === 'all' && !showRanking ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                  >
                    ทั้งหมด
                  </button>
                  <button 
                    onClick={() => { setCommunityType('group'); setShowRanking(false); }}
                    style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: communityType === 'group' && !showRanking ? '#fff' : 'transparent', color: communityType === 'group' && !showRanking ? '#0f172a' : '#64748b', fontWeight: communityType === 'group' && !showRanking ? 600 : 500, boxShadow: communityType === 'group' && !showRanking ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                  >
                    กลุ่ม
                  </button>
                  <button 
                    onClick={() => { setCommunityType('individual'); setShowRanking(false); }}
                    style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: communityType === 'individual' && !showRanking ? '#fff' : 'transparent', color: communityType === 'individual' && !showRanking ? '#0f172a' : '#64748b', fontWeight: communityType === 'individual' && !showRanking ? 600 : 500, boxShadow: communityType === 'individual' && !showRanking ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                  >
                    บุคคล
                  </button>
                </div>
                
                <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }} />
                
                <button
                  onClick={() => setShowRanking(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '6px', border: 'none', background: showRanking ? '#f59e0b' : '#fff', color: showRanking ? '#fff' : '#f59e0b', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <Trophy size={16} /> รางวัล
                </button>
                
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อกลุ่ม/บุคคล..." 
                    value={communitySearch}
                    onChange={(e) => setCommunitySearch(e.target.value)}
                    style={{ padding: '8px 16px 8px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', width: '250px' }}
                  />
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    <Search size={16} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="main-dashboard-grid" style={{ height: showRanking ? 'calc(100vh - 170px)' : undefined, minHeight: 'calc(100vh - 160px)', padding: '0 24px 24px 24px', display: showRanking ? 'block' : '' }}>
            
            {showRanking ? <CommunityRanking /> : <>
            {/* Left side: Main Content Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {!selectedCommunity ? (
                /* Grid of Community Cards */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', alignContent: 'start' }}>
                  {filteredCommunities.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                      ไม่พบข้อมูลที่ค้นหา
                    </div>
                  ) : (
                    filteredCommunities.map(comm => (
                      <div 
                      key={comm.id} 
                      onClick={() => setSelectedCommunity(comm)}
                      style={{ 
                        backgroundColor: '#fff', borderRadius: '16px', padding: '20px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', 
                        display: 'flex', flexDirection: 'column', gap: '16px',
                        cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: comm.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: comm.color }}>
                          <comm.icon size={24} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>{comm.name}</h3>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Users size={16} /> สมาชิก: {comm.members} คน
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <TrendingUp size={16} /> โครงการ: {comm.projects}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '14px', fontWeight: 'bold' }}>
                          คะแนน: {comm.score}/5
                        </div>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${(comm.score / 5) * 100}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              ) : (
                /* Detailed Community View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <button 
                      onClick={() => setSelectedCommunity(null)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <ArrowLeft size={16} /> ย้อนกลับ
                    </button>
                    <div style={{ width: '1px', height: '32px', background: '#e2e8f0', margin: '0 8px' }}></div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: selectedCommunity.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedCommunity.color }}>
                      <selectedCommunity.icon size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>{selectedCommunity.name}</h3>
                      <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>จำนวนสมาชิก: {selectedCommunity.members} คน | โครงการ: {communityProjects.length}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#475569' }}>ช่วงเวลา:</span>
                        <input type="date" style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#334155', outline: 'none' }} />
                        <span style={{ fontSize: '13px', color: '#475569' }}>-</span>
                        <input type="date" style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#334155', outline: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* Chart Type Toggles */}
                                    {/* Chart Type Toggles */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-8px' }}>
                    <button 
                      onClick={() => setChartType('post')}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: chartType === 'post' ? '#f1f5f9' : '#fff', color: '#334155', cursor: 'pointer' }}
                    >
                      <MessageSquare size={14} /> ความคิดเห็น
                    </button>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setChartType('pie')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: chartType === 'pie' ? '#f1f5f9' : '#fff', color: '#334155', cursor: 'pointer' }}
                      >
                        <PieChartIcon size={14} /> Pie Chart
                      </button>
                      <button 
                        onClick={() => setChartType('bar')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: chartType === 'bar' ? '#f1f5f9' : '#fff', color: '#334155', cursor: 'pointer' }}
                      >
                        <BarChart2 size={14} /> Bar Chart
                      </button>
                      <button 
                        onClick={() => setChartType('radar')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: chartType === 'radar' ? '#f1f5f9' : '#fff', color: '#334155', cursor: 'pointer' }}
                      >
                        <Target size={14} /> Moral Chart
                      </button>
                    </div>
                  </div>

                  {/* Top Chart: Two Charts (Before / After) or Posts */}
                  
                  {chartType === 'post' ? (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={20} className="text-blue-500" /> กระดานสนทนาชุมชน
                      </h3>
                      
                      {/* Post Input Form */}
                      <form onSubmit={handleCreatePost} style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="พิมพ์ข้อความเพื่อพูดคุย หรือแจ้งปัญหาในชุมชน..."
                          rows={3}
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'none', outline: 'none' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            type="submit"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            <Send size={16} /> โพสต์
                          </button>
                        </div>
                      </form>

                      {/* Post List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
                        {posts.length === 0 ? (
                          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>ยังไม่มีการพูดคุยในชุมชนนี้</div>
                        ) : (
                          posts.map(post => (
                            <div key={post.id} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                <User size={20} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{post.author}</span>
                                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{post.time}</span>
                                </div>
                                <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>{post.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                    {/* Before Chart */}
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#334155' }}>ก่อนเริ่มโครงการ</h3>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>ผลการประเมินคุณธรรม 5 ด้านของกลุ่ม</span>
                      </div>
                      <div style={{ height: '240px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === 'radar' ? (
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="displayBefore" tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 600 }} />
                              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                              <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                              <Radar name="ก่อนเริ่มโครงการ" dataKey="before" stroke="#94a3b8" strokeWidth={2} fill="#cbd5e1" fillOpacity={0.4} />
                            </RadarChart>
                          ) : chartType === 'bar' ? (
                            <BarChart data={radarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="subject" tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                              <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                              <Tooltip />
                              <Bar dataKey="before" name="คะแนน" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                          ) : (
                            <PieChart>
                              <Pie data={radarData} dataKey="before" nameKey="subject" cx="50%" cy="50%" outerRadius="80%" label={(props: any) => `${props.name} ${props.value.toFixed(1)}`} labelLine={true}>
                                {radarData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* After Chart */}
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#334155' }}>หลังเริ่มโครงการ</h3>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>ผลการประเมินคุณธรรม 5 ด้านของกลุ่ม</span>
                      </div>
                      <div style={{ height: '240px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === 'radar' ? (
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="displayAfter" tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 600 }} />
                              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                              <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                              <Radar name="หลังเริ่มโครงการ" dataKey="after" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.5} />
                            </RadarChart>
                          ) : chartType === 'bar' ? (
                            <BarChart data={radarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="subject" tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                              <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                              <Tooltip />
                              <Bar dataKey="after" name="คะแนน" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                          ) : (
                            <PieChart>
                              <Pie data={radarData} dataKey="after" nameKey="subject" cx="50%" cy="50%" outerRadius="80%" label={(props: any) => `${props.name} ${props.value.toFixed(1)}`} labelLine={true}>
                                {radarData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                    </div>
                  )}

                  {/* Projects Table */}
                  <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', color: '#334155' }}>รายการโครงการ ({communityProjects.length})</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                          <tr style={{ background: '#fff', color: '#64748b', fontSize: '13px', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', fontWeight: 600, width: '25%' }}>ชื่อโครงการ</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600 }}>ผลประเมิน (คุณธรรม 5 ด้าน)</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'center', width: '10%' }}>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {communityProjects.length === 0 ? (
                            <tr>
                              <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                ยังไม่มีโครงการ กดประเมินผ่าน Zone AI แล้วเพิ่มลงตารางได้เลย
                              </td>
                            </tr>
                          ) : (
                            communityProjects.map(proj => {
                              const projData = VIRTUE_KEYS.map(v => ({
                                subject: v,
                                before: proj.beforeVirtues[v] || 0,
                                after: proj.afterVirtues[v] || 0,
                                displayBefore: `${v} ${(proj.beforeVirtues[v] || 0).toFixed(1)}`,
                                displayAfter: `${v} ${(proj.afterVirtues[v] || 0).toFixed(1)}`
                              }));

                              return (
                                <tr key={proj.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '24px', fontWeight: 500, color: '#0f172a', verticalAlign: 'top' }}>
                                  <div style={{ fontSize: '15px' }}>{proj.name}</div>
                                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>เป้าหมาย: {proj.targetName}</div>
                                </td>
                                  <td style={{ padding: '24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: '180px', width: '400px' }}>
                                      {/* Before Chart */}
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>ก่อนเริ่มโครงการ</span>
                                        <div style={{ width: '100%', height: '100%', minHeight: 0 }}>
                                          <ResponsiveContainer width="100%" height="100%">
                                            {chartType === 'radar' ? (
                                              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={projData}>
                                                <PolarGrid stroke="#e2e8f0" />
                                                <PolarAngleAxis dataKey="displayBefore" tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 600 }} />
                                                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                                                <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                                                <Radar name="ก่อนเริ่มโครงการ" dataKey="before" stroke="#94a3b8" strokeWidth={2} fill="#cbd5e1" fillOpacity={0.4} />
                                              </RadarChart>
                                            ) : chartType === 'bar' ? (
                                              <BarChart data={projData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="subject" tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                                                <Tooltip />
                                                <Bar dataKey="before" name="คะแนน" fill="#94a3b8" radius={[2, 2, 0, 0]} barSize={20} />
                                              </BarChart>
                                            ) : (
                                              <PieChart>
                                                <Pie data={projData} dataKey="before" nameKey="subject" cx="50%" cy="50%" outerRadius="70%" label={(props: any) => `${props.name} ${props.value.toFixed(1)}`} labelLine={true}>
                                                  {projData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip />
                                              </PieChart>
                                            )}
                                          </ResponsiveContainer>
                                        </div>
                                      </div>
                                      {/* After Chart */}
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', marginBottom: '8px' }}>หลังเริ่มโครงการ</span>
                                        <div style={{ width: '100%', height: '100%', minHeight: 0 }}>
                                          <ResponsiveContainer width="100%" height="100%">
                                            {chartType === 'radar' ? (
                                              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={projData}>
                                                <PolarGrid stroke="#e2e8f0" />
                                                <PolarAngleAxis dataKey="displayAfter" tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 600 }} />
                                                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                                                <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                                                <Radar name="หลังเริ่มโครงการ" dataKey="after" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.5} />
                                              </RadarChart>
                                            ) : chartType === 'bar' ? (
                                              <BarChart data={projData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="subject" tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                                                <Tooltip />
                                                <Bar dataKey="after" name="คะแนน" fill="#10b981" radius={[2, 2, 0, 0]} barSize={20} />
                                              </BarChart>
                                            ) : (
                                              <PieChart>
                                                <Pie data={projData} dataKey="after" nameKey="subject" cx="50%" cy="50%" outerRadius="70%" label={(props: any) => `${props.name} ${props.value.toFixed(1)}`} labelLine={true}>
                                                  {projData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip />
                                              </PieChart>
                                            )}
                                          </ResponsiveContainer>
                                        </div>
                                      </div>

                                    </div>
                                  </td>
                                <td style={{ padding: '24px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                  <button 
                                    onClick={() => setViewingProjectDetails(proj)}
                                    style={{ padding: '10px', background: '#f5f3ff', color: '#8b5cf6', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', marginRight: '8px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#ede9fe'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#f5f3ff'}
                                    title="AI วิเคราะห์"
                                  >
                                    <Bot size={18} />
                                  </button>
                                  <button 
                                    onClick={() => setViewingProjectDetails(proj)}
                                    style={{ padding: '10px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', marginRight: '8px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#eff6ff'}
                                    title="ดูรายละเอียด"
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProject(proj.id)}
                                    style={{ padding: '10px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                                    title="ลบโครงการ"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right side: Widgets */}
            <div style={{ position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <CommunityWidget />
                <ActionWidgets 
                  currentContext="community" 
                  onAddProjectToCommunity={selectedCommunity ? handleAddProjectToCommunity : undefined}
                />
                <ChartsPanel 
                  stats={mockStats} 
                  activeAgencies={[]} 
                />
                <CommunityChat />
              </div>
            </div>
            </> }
          </div>
        </div>
      </div>

      {viewingProjectDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '600px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot color="#3b82f6" /> ผลการวิเคราะห์โครงการ
              </h2>
              <button onClick={() => setViewingProjectDetails(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', color: '#1e293b' }}>{viewingProjectDetails.name}</h3>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>เป้าหมาย: {viewingProjectDetails.targetName} ({viewingProjectDetails.targetType})</p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '8px', flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>คะแนนก่อนเริ่ม</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#475569' }}>{viewingProjectDetails.beforeScore.toFixed(2)}</div>
                </div>
                <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px', flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#059669', marginBottom: '4px' }}>คะแนนหลังเริ่ม (คาดการณ์)</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{viewingProjectDetails.afterScore.toFixed(2)}</div>
                </div>
              </div>
              <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e3a8a', fontSize: '14px' }}>บทสรุปและเหตุผลจาก AI</h4>
                <p style={{ margin: 0, color: '#1e40af', fontSize: '13px', lineHeight: '1.6' }}>{viewingProjectDetails.aiReasoning || 'AI กำลังประมวลผลหรือไม่มีความเห็นเพิ่มเติม'}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '14px' }}>รายละเอียดโครงการ</h4>
                {viewingProjectDetails.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setViewingProjectDetails(null)} style={{ padding: '8px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>ปิด</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
