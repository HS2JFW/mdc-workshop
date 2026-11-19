import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Database, 
  List, 
  FileText, 
  ArrowRight,
  Table as TableIcon,
  LayoutGrid,
  Columns,
  Play,
  Square,
  Globe,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { Header } from './Header';

interface TorProjectData {
  id: string;
  name: string;
  agency: string;
  status: string;
  scores: number[];
  total: number;
  sourceFile?: string;
  reason?: string;
}

export const MonitorPage: React.FC = () => {
  const [showCriteriaDialog, setShowCriteriaDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'TH' | 'EN'>('TH');
  const [isSystemRunning, setIsSystemRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [torData, setTorData] = useState<TorProjectData[]>([]);
  
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [sourceFileContent, setSourceFileContent] = useState('');
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [sourceFileName, setSourceFileName] = useState('');

  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reasonContent, setReasonContent] = useState('');
  const [reasonProjectName, setReasonProjectName] = useState('');

  const [showRuleTableDialog, setShowRuleTableDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'alerts'>('all');

  useEffect(() => {
    const fetchTorData = async () => {
      const { data, error } = await supabase
        .from('tor_projects_prepare')
        .select(`
          id,
          name,
          discipline,
          sufficiency,
          honesty,
          volunteer,
          gratitude,
          calculated_average,
          project_owner,
          province,
          "Source_File1",
          "Reason",
          agencies:agency_id (name),
          tor_status:status_id (status)
        `)
        .order('created_at', { ascending: false });


      const mockProjects = [
        {
          id: "mock-1",
          name: "โครงการก่อสร้างถนนคอนกรีตเสริมเหล็ก",
          discipline: 4,
          sufficiency: 3,
          honesty: 5,
          volunteer: 2,
          gratitude: 4,
          calculated_average: 3.6,
          project_owner: "เทศบาลตำบลสันกำแพง",
          province: "เชียงใหม่",
          Source_File1: "tor_road_construction.pdf",
          Reason: "โครงการมีความโปร่งใสสูง มีการเปิดเผยข้อมูลครบถ้วน และส่งเสริมการมีส่วนร่วม",
          tor_status: { status: "เสร็จสิ้น" }
        },
        {
          id: "mock-2",
          name: "โครงการจัดซื้อครุภัณฑ์ทางการแพทย์",
          discipline: -5,
          sufficiency: -5,
          honesty: -5,
          volunteer: -5,
          gratitude: -5,
          calculated_average: 0,
          project_owner: "โรงพยาบาลมหาราชนครราชสีมา",
          province: "นครราชสีมา",
          Source_File1: null,
          Reason: null,
          tor_status: { status: "อยู่ระหว่างดำเนินการ" }
        },
        {
          id: "mock-3",
          name: "โครงการปรับปรุงภูมิทัศน์โรงเรียน",
          discipline: 3,
          sufficiency: 4,
          honesty: 3,
          volunteer: 5,
          gratitude: 4,
          calculated_average: 3.8,
          project_owner: "โรงเรียนสวนกุหลาบวิทยาลัย",
          province: "กรุงเทพมหานคร",
          Source_File1: "tor_landscape.pdf",
          Reason: null,
          tor_status: { status: "อยู่ระหว่างดำเนินการ" }
        },
        {
          id: "mock-4",
          name: "โครงการพัฒนาระบบสารสนเทศ",
          discipline: 2,
          sufficiency: 2,
          honesty: 4,
          volunteer: 1,
          gratitude: 2,
          calculated_average: 2.2,
          project_owner: "สำนักงานเทคโนโลยีสารสนเทศ",
          province: "นนทบุรี",
          Source_File1: null,
          Reason: "เอกสารมีรายละเอียด แต่ขาดข้อมูลที่ชัดเจนด้านการประเมินความคุ้มค่าของทรัพยากร",
          tor_status: { status: "เสร็จสิ้น" }
        },
        {
          id: "mock-5",
          name: "โครงการจัดอบรมส่งเสริมคุณธรรม",
          discipline: 5,
          sufficiency: 5,
          honesty: 5,
          volunteer: 5,
          gratitude: 5,
          calculated_average: 5.0,
          project_owner: "ศูนย์ส่งเสริมจริยธรรม",
          province: "ขอนแก่น",
          Source_File1: "training_tor.pdf",
          Reason: "เป็นโครงการต้นแบบที่มีคุณธรรมทั้ง 5 ด้านครบถ้วนสมบูรณ์ มีการวางแผนงานชัดเจน",
          tor_status: { status: "เสร็จสิ้น" }
        }
      ];

      if (error) {
        console.error('Error fetching TOR projects:', error);
      } else if (data) {
        // Append mock data to real data (or use mock data if real data is empty)
        const combinedData = [...data, ...mockProjects];

        const extractAgency = (name: string, province: string) => {
          const match = name.match(/(โรงพยาบาล|โรงเรียน|สำนักงาน|คณะ|มหาวิทยาลัย|วิทยาลัย|ศูนย์|สถาบัน|พิพิธภัณฑสถาน|เทศบาล|องค์การบริหารส่วน)[^\s]*.*/);
          if (match) {
            return match[0].trim();
          }
          return province || 'ไม่ระบุหน่วยงาน';
        };

        const formattedData = combinedData.map((item: any) => ({
          id: item.id,
          name: item.name,
          agency: extractAgency(item.name, item.province),
          status: item.tor_status?.status || 'อยู่ระหว่างดำเนินการ',
          scores: [
            Number(item.discipline),
            Number(item.sufficiency),
            Number(item.honesty),
            Number(item.volunteer),
            Number(item.gratitude)
          ],
          total: Number(item.calculated_average),
          sourceFile: item.Source_File1,
          reason: item.Reason
        }));
        setTorData(formattedData);
      }
    };

    fetchTorData();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isSystemRunning) {
      interval = setInterval(() => {
        setProgress(p => p >= 100 ? 0 : p + 5);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSystemRunning]);

  const handleOpenSource = async (row: TorProjectData) => {
    if (!row.sourceFile) return;
    setSourceFileName(row.name);
    setShowSourceDialog(true);
    setIsLoadingSource(true);
    try {
      const { data, error } = await supabase.storage.from('tor_documents').download(row.sourceFile);
      if (error) throw error;
      const text = await data.text();
      setSourceFileContent(text);
    } catch (e) {
      setSourceFileContent("ไม่สามารถโหลดไฟล์ได้ หรือไฟล์ไม่ได้อยู่ในระบบ Storage");
    } finally {
      setIsLoadingSource(false);
    }
  };

  const handleOpenReason = (row: TorProjectData) => {
    if (!row.reason) return;
    setReasonProjectName(row.name);
    setReasonContent(row.reason);
    setShowReasonDialog(true);
  };

  const getScoreColor = (index: number, score: number) => {
    if (score === -5) return '#cbd5e1';
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    return colors[index % colors.length];
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', overflow: 'hidden' }}>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} language={language} setLanguage={setLanguage} />
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>ระบบติดตามข้อมูล TOR ทั่วประเทศ (TOR Data Monitor Nationwide)</h1>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setIsSystemRunning(!isSystemRunning)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: isSystemRunning ? '#ef4444' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
              >
                {isSystemRunning ? <Square size={18} /> : <Play size={18} />} 
                {isSystemRunning ? 'หยุดการทำงาน (Stop)' : 'เริ่มการทำงาน (Start)'}
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}>
                <Globe size={18} /> ข้อมูลสาธารณะ Public Data
              </button>
            </div>
          </div>

          {isSystemRunning && (
            <div style={{ marginBottom: '24px', padding: '16px', background: '#f1f5f9', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                <span>กำลังประมวลผลข้อมูล AI...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.5s ease-out' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="ค้นหาโครงการ / หน่วยงาน..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '300px', outline: 'none' }}
              />
              <span style={{ color: '#64748b', fontSize: '14px' }}>พบ {torData.length} รายการ</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowCriteriaDialog(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                <TableIcon size={18} /> MCA Table
              </button>
              <button 
                onClick={() => setShowRuleTableDialog(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                <Columns size={18} /> Rule Table
              </button>
              <button 
                onClick={() => setViewMode(viewMode === 'all' ? 'alerts' : 'all')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: viewMode === 'alerts' ? '#fef2f2' : '#fff', color: viewMode === 'alerts' ? '#dc2626' : '#64748b', border: viewMode === 'alerts' ? '1px solid #fecaca' : '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                <Bell size={18} /> {viewMode === 'all' ? 'รายงานแจ้งเตือนปัญหา' : 'กลับไปหน้าตารางปกติ'}
              </button>
              <button style={{ padding: '8px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '16px 24px', textAlign: 'left', width: '40px' }}><input type="checkbox" defaultChecked /></th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>ชื่อโครงการ TOR</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>หน่วยงานเจ้าของ</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>กระบวนการข้อมูล</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>ผลลัพธ์</th>
                  {viewMode === 'all' ? (
                    <>
                      <th style={{ padding: '16px 8px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>วินัย</th>
                      <th style={{ padding: '16px 8px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>พอเพียง</th>
                      <th style={{ padding: '16px 8px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>สุจริต</th>
                      <th style={{ padding: '16px 8px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>จิตอาสา</th>
                      <th style={{ padding: '16px 8px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>กตัญญู</th>
                      <th style={{ padding: '16px 24px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>คะแนนรวม</th>
                    </>
                  ) : (
                    <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>สถานะของปัญหา</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(viewMode === 'all' ? torData : torData.filter(row => !row.sourceFile || !row.reason || row.total === 0 || row.scores.every(s => s === -5))).map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ padding: '16px 24px' }}><input type="checkbox" /></td>
                    <td style={{ padding: '16px 12px', color: '#0f172a', fontWeight: 500, fontSize: '14px' }}>{row.name}</td>
                    <td style={{ padding: '16px 12px', color: '#475569', fontSize: '14px' }}>{row.agency}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div 
                          onClick={() => handleOpenSource(row)}
                          title={row.sourceFile || "ไม่มีข้อมูล Source File"}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: row.sourceFile ? 'pointer' : 'not-allowed', opacity: row.sourceFile ? 1 : 0.5 }}
                        >
                          <Database size={16} />
                        </div>
                        <ArrowRight size={14} color="#94a3b8" />
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><List size={16} /></div>
                        <ArrowRight size={14} color="#94a3b8" />
                        <div 
                          onClick={() => handleOpenReason(row)}
                          title={row.reason ? "ดูเหตุผล (Reason)" : "ไม่มีข้อมูล Reason"}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: row.reason ? 'pointer' : 'not-allowed', opacity: row.reason ? 1 : 0.5 }}
                        >
                          <FileText size={16} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center', color: '#334155', fontSize: '14px', fontWeight: 500 }}>
                      {row.status}
                    </td>
                    {viewMode === 'all' ? (
                      <>
                        {row.scores.map((score, i) => (
                          <td key={i} style={{ padding: '16px 8px', textAlign: 'center' }}>
                            <div style={{ 
                              background: getScoreColor(i, score), 
                              color: '#fff', 
                              width: '36px', 
                              height: '24px', 
                              borderRadius: '12px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              margin: '0 auto',
                              fontSize: '13px',
                              fontWeight: 'bold'
                            }}>
                              {score}
                            </div>
                          </td>
                        ))}
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                          <div style={{ 
                            background: '#ef4444', 
                            color: '#fff', 
                            padding: '4px 12px', 
                            borderRadius: '16px', 
                            display: 'inline-block',
                            fontWeight: 'bold'
                          }}>
                            {row.total.toFixed(2)}
                          </div>
                        </td>
                      </>
                    ) : (
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {!row.sourceFile && <span style={{ color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16}/> ข้อมูลไม่ครบ: ไม่มีข้อมูลเอกสารต้นฉบับ (Source File)</span>}
                          {!row.reason && <span style={{ color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16}/> ข้อมูลไม่ครบ: ยังไม่มีการวิเคราะห์ผล (Reason)</span>}
                          {(row.total === 0 || row.scores.every(s => s === -5)) && <span style={{ color: '#f59e0b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16}/> ข้อสังเกต: คะแนนยังไม่ถูกประเมิน</span>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {showCriteriaDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '1200px', maxHeight: '90vh', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TableIcon color="#3b82f6" /> MCA Table (เกณฑ์การประเมินดัชนีคุณธรรม 5 ด้าน)
              </h2>
              <button onClick={() => setShowCriteriaDialog(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
              <img src="/mca-framework.png" alt="MCA Framework" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={() => setShowCriteriaDialog(false)} style={{ padding: '8px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>ปิด</button>
            </div>
          </div>
        </div>
      )}

      {showRuleTableDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '1200px', maxHeight: '90vh', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Columns color="#3b82f6" /> Rule Table (สรุปเกณฑ์การประเมินโครงการและดัชนีคุณธรรม 5 ด้าน)
              </h2>
              <button onClick={() => setShowRuleTableDialog(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
              <img src="/rule-table.jpg" alt="Rule Table" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={() => setShowRuleTableDialog(false)} style={{ padding: '8px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>ปิด</button>
            </div>
          </div>
        </div>
      )}

      {showSourceDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '800px', height: '80vh', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database color="#3b82f6" /> ข้อมูลจากไฟล์ {sourceFileName}
              </h2>
              <button onClick={() => setShowSourceDialog(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-wrap', fontSize: '14px', color: '#334155', fontFamily: 'monospace' }}>
              {isLoadingSource ? 'กำลังโหลดข้อมูล...' : sourceFileContent}
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSourceDialog(false)} style={{ padding: '8px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>ปิด</button>
            </div>
          </div>
        </div>
      )}

      {showReasonDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '800px', height: '80vh', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText color="#3b82f6" /> เหตุผลและบทวิเคราะห์โครงการ: {reasonProjectName}
              </h2>
              <button onClick={() => setShowReasonDialog(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-wrap', fontSize: '15px', color: '#334155', lineHeight: '1.6' }}>
              {reasonContent}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowReasonDialog(false)} style={{ padding: '8px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
