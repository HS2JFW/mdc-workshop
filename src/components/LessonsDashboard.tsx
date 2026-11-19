import React, { useState } from 'react';
import { ChevronDown, X, FileText, Presentation, FileSpreadsheet } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell
} from 'recharts';

// Mock data for the table
const lessonsData = [
  {
    id: 1,
    name: 'หัวข้อถอดบทเรียนยกระดับสาธารณสุขและคุณภาพชีวิตชุมชน',
    sourceProject: 'ศูนย์เรียนรู้สุขภาพตำบลอุลเพาะ\nพัฒนาระบบน้ำสะอาด',
    projectCount: 15,
    score: 98,
    agencies: ['/moral-center-logo.png', '/moral-center-logo.png'],
    budget: 1.2
  },
  {
    id: 2,
    name: 'หัวข้อถอดบทเรียนส่งเสริมเศรษฐกิจฐานรากและเกษตรแปรรูปอัจฉริยะ',
    sourceProject: 'แปรรูปผลผลิตทางการเกษตร\nพัฒนาท่องเที่ยวชุมชน',
    projectCount: 22,
    score: 93,
    agencies: ['/moral-center-logo.png', '/moral-center-logo.png'],
    budget: 2.5
  },
  {
    id: 3,
    name: 'หัวข้อถอดบทเรียนยกระดับสาธารณสุขและคุณภาพชีวิตชุมชน',
    sourceProject: 'แปรรูปผลผลิตทางการเกษตร\nพัฒนาท่องเที่ยวชุมชน',
    projectCount: 10,
    score: 90,
    agencies: ['/moral-center-logo.png', '/moral-center-logo.png'],
    budget: 1.2
  },
  {
    id: 4,
    name: 'หัวข้อถอดบทเรียนส่งเสริมเศรษฐกิจฐานรากและเกษตรแปรรูปอัจฉริยะ',
    sourceProject: 'ศูนย์เรียนรู้สุขภาพตำบลอุลเพาะ\nพัฒนาระบบน้ำสะอาด',
    projectCount: 15,
    score: 98,
    agencies: ['/moral-center-logo.png', '/moral-center-logo.png'],
    budget: 2.5
  },
  {
    id: 5,
    name: 'หัวข้อถอดบทเรียนส่งเสริมเศรษฐกิจฐานรากและเกษตรแปรรูปอัจฉริยะ',
    sourceProject: 'แปรรูปผลผลิตทางการเกษตร\nพัฒนาท่องเที่ยวชุมชน',
    projectCount: 22,
    score: 95,
    agencies: ['/moral-center-logo.png', '/moral-center-logo.png'],
    budget: 2.5
  },
  {
    id: 6,
    name: 'หัวข้อถอดบทเรียนส่งเสริมเศรษฐกิจฐานรากและเกษตรแปรรูปอัจฉริยะ',
    sourceProject: 'ศูนย์เรียนรู้สุขภาพ',
    projectCount: 20,
    score: 98,
    agencies: ['/moral-center-logo.png', '/moral-center-logo.png'],
    budget: 2.5
  }
];

// Mock data for radar chart
const radarData = [
  { subject: 'สุขภาพ\nHealth', A: 90, fullMark: 100 },
  { subject: 'เกษตร\nAg.', A: 85, fullMark: 100 },
  { subject: 'การศึกษา\nEdu.', A: 75, fullMark: 100 },
  { subject: 'สิ่งแวดล้อม\nEnviron.', A: 80, fullMark: 100 },
  { subject: 'เศรษฐกิจ\nEcon.', A: 95, fullMark: 100 },
];

// Mock data for bar chart
const barData = [
  { name: 'กลุ่มยุทธศาสตร์ 1', count1: 28, count2: 0 },
  { name: 'กลุ่มยุทธศาสตร์ 2', count1: 18, count2: 0 },
  { name: 'กลุ่มยุทธศาสตร์ 3', count1: 10, count2: 0 },
  { name: 'กลุ่มยุทธศาสตร์ 4', count1: 5, count2: 0 },
  { name: 'กลุ่มยุทธศาสตร์ 5', count1: 2, count2: 0 },
  { name: 'กลุ่มยุทธศาสตร์ 6', count1: 0, count2: 12 },
  { name: 'กลุ่มยุทธศาสตร์ 7', count1: 0, count2: 5 },
];

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f43f5e', '#8b5cf6'];

export const LessonsDashboard: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100%', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Filters */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#334155', fontWeight: 600 }}>กรองผลลัพธ์ระดับภูมิภาค</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {['Province', 'District', 'Sub-district', 'Village'].map((level) => (
            <div key={level} style={{ position: 'relative' }}>
              <select style={{ 
                width: '100%', padding: '10px 16px', borderRadius: '8px', 
                border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#64748b',
                appearance: 'none', cursor: 'pointer', fontSize: '14px'
              }}>
                <option>-- {level} --</option>
              </select>
              <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Table */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                ตารางสรุปหัวข้อถอดบทเรียนจากโครงการ 📋
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                สรุปข้อมูลโครงการแยกตามจังหวัด/อำเภอ/ตำบล
              </p>
            </div>
            <div style={{ color: '#475569', fontSize: '14px', fontWeight: 500 }}>
              เรียงตามคะแนนความสอดคล้องสูงสุด
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#334155', fontSize: '14px' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>ลำดับ</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>หัวข้อถอดบทเรียนภาครัฐ</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>โครงการต้นเรื่อง<br/>(ตัวอย่าง)</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>จำนวน<br/>โครงการ</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>คะแนนความ<br/>สอดคล้อง (100)</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center' }}>หน่วยงาน<br/>รับผิดชอบ</th>
                </tr>
              </thead>
              <tbody>
                {lessonsData.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 8px', color: '#0f172a', fontWeight: 500 }}>{row.id}</td>
                    <td style={{ padding: '16px 8px', color: '#0f172a', fontWeight: 600, maxWidth: '200px' }}>{row.name}</td>
                    <td 
                      style={{ padding: '16px 8px', color: '#3b82f6', fontSize: '13px', whiteSpace: 'pre-line', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => setSelectedLesson(row)}
                    >
                      {row.sourceProject}
                    </td>
                    <td style={{ padding: '16px 8px', color: '#334155', fontSize: '14px' }}>{row.projectCount} โครงการ</td>
                    <td style={{ padding: '16px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1, background: '#1e3a8a', height: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                          <span style={{ marginLeft: 'auto' }}>{row.score})</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        {row.agencies.map((img, idx) => (
                          <div key={idx} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e2e8f0', overflow: 'hidden', padding: '2px', background: '#fff' }}>
                            <img src={img} alt="agency" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>สธ.   กส.</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Radar Chart Card */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'relative' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>
              ความสอดคล้องกับยุทธศาสตร์ชาติ
            </h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'var(--font-thai)' }} />
                  <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend points manually for look */}
            <div style={{ position: 'absolute', top: '80px', right: '40px', fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-thai)' }}>
              <div><span style={{color:'#3b82f6'}}>●</span> 4.5 Health</div>
              <div><span style={{color:'#10b981'}}>●</span> 3.0 Ag.</div>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              จำนวนหัวข้อถอดบทเรียนแยกตามกลุ่มยุทธศาสตร์ภาครัฐ
            </h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-thai)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
                กลุ่มยุทธศาสตร์
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }}></div>
                กลุ่มเป้าหมาย
              </div>
            </div>
            <div style={{ height: '150px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'var(--font-thai)' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="count1" stackId="a">
                    {barData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                  <Bar dataKey="count2" fill="#ef4444" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* List Card */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              รายการหัวข้อถอดบทเรียนตามคะแนนความสอดคล้อง
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'หัวข้อถอดบทเรียนยกระดับสาธารณสุขและคุณภาพชีวิตชุมชน',
                'หัวข้อถอดบทเรียนส่งเสริมเศรษฐกิจฐานรากและเกษตร...',
                'หัวข้อถอดบทเรียนส่งเสริมเศรษฐกิจฐานรากและเกษตร...'
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#334155' }}>
                  <div style={{ fontWeight: 600 }}>{i + 1}</div>
                  <div>{item}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>งบประมาณ</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>370</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>หัวข้อถอดบทเรียนรวม</div>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', marginBottom: '8px', color: 'transparent' }}>.</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>320</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>จำนวนโครงการ</div>
            </div>
          </div>

        </div>
      </div>

      {/* Dialog Box */}
      {selectedLesson && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '600px', maxWidth: '90%', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Lessons Learned Documents</h2>
              <button onClick={() => setSelectedLesson(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{selectedLesson.name}</h3>
              
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>บทสรุปถอดบทเรียน (Lesson Learned Summary)</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                จากการดำเนินโครงการที่ผ่านมา พบว่ามีผลสัมฤทธิ์ที่ดีในด้านการมีส่วนร่วมของชุมชน แต่ยังคงพบปัญหาเชิงโครงสร้างในการกระจายงบประมาณและการติดตามผลที่ล่าช้า
              </p>

              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>สิ่งที่หน่วยงานควรปรับปรุง (Areas for Improvement)</h4>
              <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                <li style={{ marginBottom: '8px' }}><strong>ความโปร่งใสในกระบวนการจัดซื้อจัดจ้าง:</strong> ควรเพิ่มมาตรการตรวจสอบและเปิดเผยข้อมูลผ่านระบบอิเล็กทรอนิกส์ให้ประชาชนเข้าถึงได้ง่ายขึ้น</li>
                <li style={{ marginBottom: '8px' }}><strong>การสื่อสารระหว่างหน่วยงาน:</strong> ลดความซ้ำซ้อนของการทำงานข้ามกรม โดยการใช้ฐานข้อมูลกลาง (Centralized Database) ร่วมกัน</li>
                <li><strong>การประเมินผลกระทบ (Impact Assessment):</strong> ควรมีการประเมินผลกระทบเชิงบวกและลบต่อสิ่งแวดล้อมและสังคมอย่างเป็นรูปธรรมก่อนเริ่มโครงการใหม่</li>
              </ul>

              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>แนวทางแก้ไขและข้อเสนอแนะ (Future Solutions)</h4>
              <ol style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                <li style={{ marginBottom: '8px' }}>จัดตั้งคณะทำงานร่วมระหว่างหน่วยงานรัฐและภาคประชาสังคมเพื่อติดตามการดำเนินงาน</li>
                <li>พัฒนาระบบแดชบอร์ดติดตามสถานะโครงการแบบเรียลไทม์ (Real-time Monitoring)</li>
                <li>นำหลักธรรมาภิบาล (Good Governance) และดัชนีคุณธรรมมาใช้เป็นเกณฑ์หลักในการอนุมัติโครงการระยะถัดไป</li>
              </ol>
            </div>

            {/* Footer with Buttons */}
            <div style={{ padding: '16px 24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                <FileText size={18} color="#ef4444" /> PDF
              </button>
              <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                <FileText size={18} color="#3b82f6" /> DOCX
              </button>
              <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                <Presentation size={18} color="#f97316" /> PPTX
              </button>
              <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                <FileSpreadsheet size={18} color="#06b6d4" /> CSV
              </button>
              <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                <FileSpreadsheet size={18} color="#10b981" /> XLSX
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
