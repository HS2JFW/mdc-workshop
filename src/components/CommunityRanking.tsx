import React from 'react';
import { Users, User, Sprout, HandMetal, Award, ShoppingBag, ScrollText, MoreVertical, TrendingUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const rankingData = [
  { id: 1, rank: 1, name: 'กลุ่มรักบ้านเกิด', members: 150, projects: 12, score: 4.9, rewardTitle: 'รางวัลเกียรติยศระดับชาติ', rewardStatus: 'CLAIM', type: 'gold', icon: Users, bg: '#eff6ff', color: '#3b82f6', threshold: false },
  { id: 2, rank: 2, name: 'นายสมชาย เกษตรกรดีเด่น', members: 150, projects: 4, score: 4.8, rewardTitle: 'กระเป๋าศูนย์คุณธรรมรุ่นพิเศษ', rewardStatus: 'CLAIM', type: 'silver', icon: User, bg: '#fffbeb', color: '#f59e0b', threshold: false },
  { id: 3, rank: 3, name: 'กลุ่มรักบ้านเกิด 2', members: 150, projects: 12, score: 4.8, rewardTitle: 'เข็มกลัดเชิดชูเกียรติ', rewardStatus: 'CLAIM', type: 'bronze', icon: Users, bg: '#eff6ff', color: '#3b82f6', threshold: false },
  { id: 't1', threshold: true, title: 'กระเป๋าศูนย์คุณธรรมรุ่นพิเศษ\n(Moral Center Special Edition Bag)', color: '#d97706', icon: ShoppingBag, rank: 0, name: '', members: 0, projects: 0, score: 0, rewardTitle: '', rewardStatus: '', type: '', bg: '', rewardIcon: undefined, rewardColor: '' },
  { id: 4, rank: 10, name: 'กลุ่มพัฒนาชุมชนดอนเมือง', members: 180, projects: 8, score: 4.5, rewardTitle: 'รางวัลเกียรติยศ', rewardStatus: 'ส่งแล้ว', type: 'normal', icon: Sprout, bg: '#ecfdf5', color: '#10b981', rewardIcon: Award, rewardColor: '#f59e0b', threshold: false },
  { id: 5, rank: 51, name: 'กลุ่มพัฒนาชุมชนดอนเมือง', members: 180, projects: 8, score: 4.5, rewardTitle: 'custom Bag', rewardStatus: 'ยังไม่ได้รับ', type: 'normal', icon: Sprout, bg: '#ecfdf5', color: '#10b981', rewardIcon: ShoppingBag, rewardColor: '#334155', threshold: false },
  { id: 't2', threshold: true, title: 'เข็มกลัดเชิดชูเกียรติ', color: '#10b981', icon: Award, rank: 0, name: '', members: 0, projects: 0, score: 0, rewardTitle: '', rewardStatus: '', type: '', bg: '', rewardIcon: undefined, rewardColor: '' },
  { id: 6, rank: 100, name: 'กลุ่มพัฒนาชุมชนคลอง', members: 150, projects: 8, score: 4.0, rewardTitle: 'เข็มกลัดเชิดชูเกียรติ', rewardStatus: 'ส่งแล้ว', type: 'normal', icon: HandMetal, bg: '#fef2f2', color: '#ef4444', rewardIcon: Award, rewardColor: '#f59e0b', threshold: false },
  { id: 't3', threshold: true, title: 'ประกาศนียบัตรออนไลน์', color: '#3b82f6', icon: ScrollText, rank: 0, name: '', members: 0, projects: 0, score: 0, rewardTitle: '', rewardStatus: '', type: '', bg: '', rewardIcon: undefined, rewardColor: '' },
  { id: 7, rank: 200, name: 'กลุ่มรักบ้านเกิด', members: 150, projects: 12, score: 3.5, rewardTitle: 'ประกาศนียบัตรออนไลน์', rewardStatus: 'ส่งแล้ว', type: 'normal', icon: Users, bg: '#eff6ff', color: '#3b82f6', rewardIcon: ScrollText, rewardColor: '#3b82f6', threshold: false },
];

const miniRadarData = [
  { subject: 'วินัย (6.2)', A: 6.2, fullMark: 10 },
  { subject: 'สุจริต (6.3)', A: 6.3, fullMark: 10 },
  { subject: 'จิตอาสา (6.8)', A: 6.8, fullMark: 10 },
  { subject: 'กตัญญู (7.3)', A: 7.3, fullMark: 10 },
  { subject: 'พอเพียง (6.6)', A: 6.6, fullMark: 10 }
];

export const CommunityRanking: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: '24px', width: '100%', height: '100%' }}>
      {/* Main Ranking Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 24px 0' }}>
          ตารางคะแนนและรางวัลศูนย์คุณธรรม
        </h2>
        
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Table Header */}
          <div style={{ display: 'flex', padding: '16px 24px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
            <div style={{ width: '80px', textAlign: 'center' }}>อันดับ</div>
            <div style={{ flex: 1 }}>กลุ่มชุมชน/บุคคล</div>
            <div style={{ width: '150px', textAlign: 'center' }}>คะแนนรวม</div>
            <div style={{ width: '250px', textAlign: 'center' }}>สถานะรางวัล</div>
          </div>
          
          {/* Table Body */}
          <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: '24px' }}>
            {rankingData.map((row) => {
              if (row.threshold) {
                return (
                  <div key={row.id} style={{ position: 'relative', height: '40px', display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                    <div style={{ position: 'absolute', width: '100%', height: '2px', backgroundColor: row.color, opacity: 0.8 }} />
                    <div style={{ position: 'absolute', right: '100px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '4px 12px', borderRadius: '20px', border: `2px solid ${row.color}` }}>
                      <row.icon size={16} color={row.color} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'pre-line', textAlign: 'left' }}>
                        {row.title}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={row.id} style={{ display: 'flex', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                  {/* Rank */}
                  <div style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
                    {row.type === 'gold' && (
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
                        <Award size={48} color="#f59e0b" style={{ position: 'absolute', filter: 'drop-shadow(0 4px 6px rgba(245, 158, 11, 0.3))' }} />
                        <span style={{ position: 'relative', fontWeight: 'bold', fontSize: '18px', color: '#fff', marginTop: '-4px' }}>1</span>
                      </div>
                    )}
                    {row.type === 'silver' && (
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
                        <Award size={40} color="#94a3b8" style={{ position: 'absolute', filter: 'drop-shadow(0 4px 6px rgba(148, 163, 184, 0.3))' }} />
                        <span style={{ position: 'relative', fontWeight: 'bold', fontSize: '16px', color: '#fff', marginTop: '-4px' }}>2</span>
                      </div>
                    )}
                    {row.type === 'bronze' && (
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
                        <Award size={40} color="#b45309" style={{ position: 'absolute', filter: 'drop-shadow(0 4px 6px rgba(180, 83, 9, 0.3))' }} />
                        <span style={{ position: 'relative', fontWeight: 'bold', fontSize: '16px', color: '#fff', marginTop: '-4px' }}>3</span>
                      </div>
                    )}
                    {row.type === 'normal' && (
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                        {row.rank}
                      </div>
                    )}
                  </div>
                  
                  {/* Name */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: row.color }}>
                      <row.icon size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 600 }}>{row.name}</h4>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> สมาชิก: {row.members} ม.</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14} /> โครงการ: {row.projects}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div style={{ width: '150px', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center' }}>
                      {row.score}<span style={{ color: '#94a3b8', fontSize: '16px' }}>/5</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(row.score / 5) * 100}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                  
                  {/* Reward Status */}
                  <div style={{ width: '250px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {row.type !== 'normal' ? (
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {row.type === 'gold' && <ScrollText color="#f59e0b" size={20} />}
                          {row.type === 'silver' && <ShoppingBag color="#94a3b8" size={20} />}
                          {row.type === 'bronze' && <Award color="#b45309" size={20} />}
                        </div>
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {row.rewardIcon && <row.rewardIcon color={row.rewardColor} size={20} />}
                        </div>
                      )}
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155', width: '90px' }}>
                        {row.rewardTitle}
                      </div>
                    </div>
                    
                    {row.rewardStatus === 'CLAIM' ? (
                      <button style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(34,197,94,0.2)' }}>
                        CLAIM
                      </button>
                    ) : row.rewardStatus === 'ส่งแล้ว' ? (
                      <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>ส่งแล้ว</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>ยังไม่ได้รับ</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Right Sidebar Widgets */}
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Zone AI Card */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 12px 0' }}>Zone AI</h3>
          <div style={{ background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
               onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
               onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
            <div style={{ color: '#3b82f6' }}><SparklesIcon /></div>
            <span style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>คุณต้องการให้ AI แนะนำโครงการที่เหมาะสม</span>
          </div>
        </div>
        
        {/* AI Action Card */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '2px dashed #10b981', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ color: '#10b981' }}><BotIcon /></div>
              <span style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>นำเสนอโครงการของตนเอง และให้ AI ช่วยประเมินคะแนน</span>
            </div>
          </div>
        </div>
        
        {/* Moral Chart Mini Card */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Moral Chart</h3>
            <MoreVertical size={16} color="#94a3b8" />
          </div>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>ผลการประเมินคุณธรรม 5 ด้านของประเทศไทย</p>
          
          <div style={{ height: '180px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={miniRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                <Radar name="คุณธรรม" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px', fontSize: '11px', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }}></div>วินัย: 6.2</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }}></div>พอเพียง: 6.6</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }}></div>สุจริต: 6.3</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }}></div>จิตอาสา: 6.8</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', gridColumn: 'span 2' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }}></div>กตัญญู: 7.3</div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

// Icons not found in lucide directly but easily composed
const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18" /><path d="M3 12h18" /><path d="m18 6-12 12" /><path d="m6 6 12 12" />
  </svg>
);
const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);
