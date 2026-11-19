import React, { useState } from 'react';
import { ChevronDown, Plus, Minus, Info, X, Sparkles } from 'lucide-react';

interface ProjectSummaryDashboardProps {
  groupMode: 'agency' | 'province';
}

// Helper to render moral badges
const RenderMorals = ({ scores, label = '' }: { scores: number[], label?: string }) => {
  const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
  const labels = ['วินัย', 'พอเพียง', 'สุจริต', 'จิตอาสา', 'กตัญญู'];
  const total = scores.reduce((a, b) => a + b, 0);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {scores.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>{labels[i]}</span>
            <div style={{ 
              width: '28px', height: '24px', borderRadius: '4px', background: colors[i], 
              color: '#fff', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {s}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '4px' }}>
          <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>TOTAL</span>
          <div style={{ 
            width: '32px', height: '24px', borderRadius: '12px', background: '#ef4444', 
            color: '#fff', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {total}
          </div>
        </div>
      </div>
      {label && <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500, marginLeft: '8px', minWidth: '60px' }}>{label}</span>}
    </div>
  );
};

export const ProjectSummaryDashboard: React.FC<ProjectSummaryDashboardProps> = ({ groupMode }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'node-1': true,
    'node-1-1': true,
    'node-1-1-1': true,
  });

  const [selectedProject, setSelectedProject] = useState<any>(null);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const mockProjectDetails = {
    name: 'โครงการพัฒนาแหล่งน้ำชุมชน (ร่วมเสนอ)',
    description: 'โครงการนี้มุ่งเน้นการปรับปรุงและฟื้นฟูแหล่งน้ำในชุมชนเพื่อให้ประชาชนมีน้ำใช้อย่างเพียงพอตลอดปี โดยเน้นการมีส่วนร่วมของประชาชนในการบำรุงรักษา',
    beforeScores: [-2, 1, -1, 3, 0],
    afterScores: [2, 3, 2, 5, 1],
    analysis: 'จากการวิเคราะห์เปรียบเทียบก่อนและหลังการปรับปรุงโครงการ พบว่าคะแนนด้านวินัยและจิตอาสามีการพัฒนาอย่างก้าวกระโดด เนื่องจากการเพิ่มกระบวนการตรวจสอบและกิจกรรมจิตอาสาในแผนงานที่ชัดเจนขึ้น'
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100%', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Filters */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
          กรองผลลัพธ์ระดับภูมิภาค <span style={{ marginLeft: '120px' }}>[{groupMode === 'agency' ? 'หน่วยงาน' : 'จังหวัด'}]</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '600px' }}>
          <div style={{ position: 'relative' }}>
            <select style={{ 
              width: '100%', padding: '10px 16px', borderRadius: '8px', 
              border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a',
              appearance: 'none', cursor: 'pointer', fontSize: '14px'
            }}>
              <option>[ประเภทผู้เสนอ: ร่วมมือ ประชาชน+ภาครัฐ]</option>
            </select>
            <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <select style={{ 
              width: '100%', padding: '10px 16px', borderRadius: '8px', 
              border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a',
              appearance: 'none', cursor: 'pointer', fontSize: '14px'
            }}>
              <option>[กระทรวงมหาดไทย]</option>
            </select>
            <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              ตารางสรุปโครงการแยกตาม{groupMode === 'agency' ? 'หน่วยงาน' : 'จังหวัด'}
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
              สรุปข้อมูลโครงการแยกตาม{groupMode === 'agency' ? 'กระทรวง/กรม' : 'จังหวัด/อำเภอ/ตำบล'}
            </p>
          </div>
          <div style={{ color: '#475569', fontSize: '14px', fontWeight: 500 }}>
            จัดเรียงโครงการตามคะแนนคุณธรรมรวมจากมากไปน้อย
          </div>
        </div>

        {/* Tree Table Header */}
        <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
          <div style={{ flex: 1 }}>Project Name</div>
          <div style={{ flex: '0 0 320px' }}>คะแนน</div>
          <div style={{ flex: '0 0 240px', textAlign: 'right' }}>รายละเอียดโครงการ</div>
        </div>

        {/* Tree Table Body - Mock Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          
          {/* Level 1 */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
              <button onClick={() => toggleExpand('node-1')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748b', display: 'flex' }}>
                {expanded['node-1'] ? <Minus size={16} /> : <Plus size={16} />}
              </button>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }}></div>
              {groupMode === 'agency' ? 'กระทรวงมหาดไทย' : 'จังหวัดเชียงใหม่'} (50 โครงการ)
            </div>
          </div>

          {expanded['node-1'] && (
            <div style={{ paddingLeft: '24px', borderLeft: '1px dashed #cbd5e1', marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              
              {/* Level 2 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                  <button onClick={() => toggleExpand('node-1-1')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748b', display: 'flex' }}>
                    {expanded['node-1-1'] ? <Minus size={16} /> : <Plus size={16} />}
                  </button>
                  <div style={{ width: 10, height: 10, transform: 'rotate(45deg)', background: '#3b82f6' }}></div>
                  {groupMode === 'agency' ? 'กรมการปกครอง' : 'อำเภอเมืองเชียงใหม่'} (15 โครงการ)
                </div>
              </div>

              {expanded['node-1-1'] && (
                <div style={{ paddingLeft: '24px', borderLeft: '1px dashed #cbd5e1', marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  
                  {/* Level 3 */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#334155', fontSize: '14px' }}>
                      <button onClick={() => toggleExpand('node-1-1-1')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748b', display: 'flex' }}>
                        {expanded['node-1-1-1'] ? <Minus size={16} /> : <Plus size={16} />}
                      </button>
                      <div style={{ width: 10, height: 10, transform: 'rotate(45deg)', background: '#3b82f6' }}></div>
                      {groupMode === 'agency' ? 'กรมส่งเสริมการปกครองท้องถิ่น' : 'ตำบลพระสิงห์'} (20 โครงการ)
                    </div>
                  </div>

                  {expanded['node-1-1-1'] && (
                    <div style={{ paddingLeft: '32px', borderLeft: '1px dashed #cbd5e1', marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      
                      {/* Project Row 1 */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#0f172a' }}>
                          <span style={{ color: '#94a3b8' }}>1 |</span>
                          <div>
                            <div>โครงการพัฒนาแหล่งน้ำชุมชน (ร่วมเสนอ)</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{groupMode === 'agency' ? 'กรมการปกครอง' : 'จังหวัดเชียงใหม่'}</div>
                          </div>
                        </div>
                        
                        {/* Scores Box */}
                        <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <RenderMorals scores={[2, 3, 1, 5, 1]} label="(คะแนนก่อน)" />
                          <RenderMorals scores={[5, 1, 0, 6, 1]} label="(คะแนนหลัง)" />
                        </div>
                        
                        {/* Details Button */}
                        <div style={{ flex: '0 0 240px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            onClick={() => setSelectedProject(mockProjectDetails)}
                            style={{ 
                              background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', 
                              padding: '8px 12px', fontSize: '12px', color: '#334155', fontWeight: 600,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            <Info size={14} color="#3b82f6" /> รายละเอียด
                          </button>
                          <button 
                            onClick={() => setSelectedProject(mockProjectDetails)}
                            style={{ 
                              background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', 
                              padding: '8px 12px', fontSize: '12px', color: '#1d4ed8', fontWeight: 600,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            <Sparkles size={14} color="#3b82f6" /> บทวิเคราะห์
                          </button>
                        </div>
                      </div>

                      {/* Project Row 2 */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#0f172a' }}>
                          <span style={{ color: '#94a3b8' }}>2 |</span>
                          <div>
                            <div>โครงการสร้างศูนย์เรียนรู้ชุมชน (ร่วมเสนอ)</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{groupMode === 'agency' ? 'กรมการปกครอง' : 'จังหวัดเชียงใหม่'}</div>
                          </div>
                        </div>
                        
                        <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <RenderMorals scores={[2, 3, 1, 5, 1]} label="(คะแนนก่อน)" />
                          <RenderMorals scores={[5, 1, 0, 6, 1]} label="(คะแนนหลัง)" />
                        </div>
                        
                        <div style={{ flex: '0 0 150px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => setSelectedProject({ ...mockProjectDetails, name: 'โครงการสร้างศูนย์เรียนรู้ชุมชน (ร่วมเสนอ)' })}
                            style={{ 
                              background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', 
                              padding: '8px 12px', fontSize: '12px', color: '#334155', fontWeight: 600,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            <Info size={14} color="#3b82f6" /> รายละเอียด
                          </button>
                        </div>
                      </div>

                      {/* Project Row 3 */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#0f172a' }}>
                          <span style={{ color: '#94a3b8' }}>3 |</span>
                          <div>
                            <div>โครงการอบรมอาสาสมัครสีเขียว (ร่วมเสนอ)</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{groupMode === 'agency' ? 'กรมการปกครอง' : 'จังหวัดเชียงใหม่'}</div>
                          </div>
                        </div>
                        
                        <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <RenderMorals scores={[2, 3, 1, 5, 1]} label="(คะแนนก่อน)" />
                          <RenderMorals scores={[5, 1, 2, 5, 1]} label="(คะแนนหลัง)" />
                        </div>
                        
                        <div style={{ flex: '0 0 150px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => setSelectedProject({ ...mockProjectDetails, name: 'โครงการอบรมอาสาสมัครสีเขียว (ร่วมเสนอ)' })}
                            style={{ 
                              background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', 
                              padding: '8px 12px', fontSize: '12px', color: '#334155', fontWeight: 600,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            <Info size={14} color="#3b82f6" /> รายละเอียด
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project Details Dialog */}
      {selectedProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '700px', maxWidth: '90%', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>ข้อมูลโครงการ และบทวิเคราะห์คะแนน</h2>
              <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#1e3a8a' }}>{selectedProject.name}</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                {selectedProject.description}
              </p>
              
              <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>เปรียบเทียบดัชนีคุณธรรม 5 ด้าน (ก่อน-หลัง)</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '80px', fontWeight: 600, color: '#64748b', fontSize: '14px' }}>ก่อนแก้ไข</div>
                    <div style={{ flex: 1 }}>
                      <RenderMorals scores={selectedProject.beforeScores} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '80px', fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>หลังแก้ไข</div>
                    <div style={{ flex: 1 }}>
                      <RenderMorals scores={selectedProject.afterScores} />
                    </div>
                  </div>
                </div>
              </div>

              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>บทวิเคราะห์การประเมินดัชนีคุณธรรม 5 ด้าน (คะแนนหลังการพัฒนา)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', borderLeft: '4px solid #8b5cf6', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a' }}>1. วินัย (Discipline)</strong>
                    <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>{selectedProject.afterScores[0]} / 5</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {selectedProject.afterScores[0] >= 3 ? 'มีการวางแผนงบประมาณและระยะเวลาที่ชัดเจน ปฏิบัติตามระเบียบข้อบังคับอย่างเคร่งครัด' : 'ควรเพิ่มความเข้มงวดในการเบิกจ่ายและการควบคุมระยะเวลาโครงการ'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderLeft: '4px solid #10b981', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a' }}>2. พอเพียง (Sufficiency)</strong>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>{selectedProject.afterScores[1]} / 5</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {selectedProject.afterScores[1] >= 3 ? 'ใช้งบประมาณได้อย่างคุ้มค่า เน้นการใช้ทรัพยากรที่มีในท้องถิ่นให้เกิดประโยชน์สูงสุด' : 'ควรพิจารณาปรับลดค่าใช้จ่ายที่ไม่จำเป็น และเน้นความคุ้มค่าในระยะยาว'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderLeft: '4px solid #f59e0b', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a' }}>3. สุจริต (Honesty)</strong>
                    <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{selectedProject.afterScores[2]} / 5</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {selectedProject.afterScores[2] >= 3 ? 'กระบวนการจัดซื้อจัดจ้างโปร่งใส สามารถตรวจสอบได้ทุกขั้นตอน มีการเปิดเผยข้อมูลแก่สาธารณะ' : 'ควรเพิ่มการเปิดเผยข้อมูลโครงการให้ประชาชนตรวจสอบได้ง่ายขึ้น'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a' }}>4. จิตอาสา (Volunteer)</strong>
                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{selectedProject.afterScores[3]} / 5</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {selectedProject.afterScores[3] >= 3 ? 'เปิดโอกาสให้ประชาชนและอาสาสมัครมีส่วนร่วมในการขับเคลื่อนโครงการอย่างเป็นรูปธรรม' : 'ยังขาดการมีส่วนร่วมจากภาคประชาชน ควรเพิ่มกิจกรรมที่ให้ชุมชนเข้ามามีบทบาท'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderLeft: '4px solid #3b82f6', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a' }}>5. กตัญญู (Gratitude)</strong>
                    <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{selectedProject.afterScores[4]} / 5</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {selectedProject.afterScores[4] >= 3 ? 'คำนึงถึงผลกระทบต่อสิ่งแวดล้อมและวัฒนธรรมท้องถิ่น มีการตอบแทนและดูแลรักษาสิ่งแวดล้อม' : 'ควรเพิ่มแนวทางการอนุรักษ์สิ่งแวดล้อมหรือการสืบสานวัฒนธรรมท้องถิ่นในโครงการ'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedProject(null)}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
