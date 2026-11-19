import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { GitMerge, Layers, CheckCircle2, Building2, BookOpen, Users } from 'lucide-react';
import { MoralViewHeader } from '../components/MoralViewHeader';
import { AiInsightBanner } from '../components/AiInsightBanner';
import { MoralSourceFooter } from '../components/MoralSourceFooter';
import {
  AGENCY_HEATMAP_MATRIX,
  CROSS_AGENCY_STACKED_BAR
} from '../data/moralAgencyDataCatalog';

const AGENCIES = [
  { name: 'สำนักงาน ป.ป.ช. (ดัชนี ITA)', tag: 'ป.ป.ช.' },
  { name: 'สำนักงาน ก.พ. (วินัยข้าราชการ)', tag: 'ก.พ.' },
  { name: 'สภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', tag: 'สภาพัฒน์ฯ' },
  { name: 'กระทรวงมหาดไทย', tag: 'มท.' },
  { name: 'กระทรวงวัฒนธรรม', tag: 'วธ.' },
  { name: 'กระทรวงศึกษาธิการ', tag: 'ศธ.' },
  { name: 'กระทรวง พม.', tag: 'พม.' }
];

export const PolicyResultChainView: React.FC = () => {
  return (
    <div className="moral-view-container">
      {/* Header */}
      <MoralViewHeader
        sectorTitle="ระดับนโยบาย (Policy Maker Dashboard)"
        sectorBadgeColor="#3b82f6"
        viewTitle="ห่วงโซ่ผลลัพธ์ด้านคุณธรรมระดับชาติ (National Result Chain Pipeline)"
        viewSubtitle="วิเคราะห์ความสอดคล้องของห่วงโซ่ผลลัพธ์ ตรวจจับภารกิจซ้ำซ้อน และติดตามตัวชี้วัดแผนแม่บทคุณธรรม ระยะที่ 2"
        agencies={[
          { name: 'สำนักงาน ป.ป.ช. (ดัชนี ITA)', tag: 'ป.ป.ช.' },
          { name: 'สำนักงาน ก.พ. (วินัยข้าราชการ)', tag: 'ก.พ.' },
          { name: 'สภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', tag: 'สภาพัฒน์ฯ' },
          { name: 'กระทรวงมหาดไทย', tag: 'มท.' },
          { name: 'กระทรวงวัฒนธรรม', tag: 'วธ.' },
          { name: 'กระทรวงศึกษาธิการ', tag: 'ศธ.' },
          { name: 'กระทรวง พม.', tag: 'พม.' }
        ]}
        aiModelTag="Result-Chain Alignment v3.0"
      />

      {/* 3 Core Stats Cards from ศคธ. */}
      <section className="moral-section">
        <div className="moral-grid-3cols">
          <div className="moral-stat-box blue">
            <div className="moral-stat-box-icon"><Building2 size={24} /></div>
            <div>
              <div className="moral-stat-box-num">7,000 แห่ง</div>
              <div className="moral-stat-box-label">องค์กรคุณธรรมทั่วประเทศ</div>
              <span className="moral-stat-box-sub">บรรลุ 140% ของเป้าหมายแผนแม่บทฯ</span>
            </div>
          </div>

          <div className="moral-stat-box green">
            <div className="moral-stat-box-icon"><BookOpen size={24} /></div>
            <div>
              <div className="moral-stat-box-num">400 แห่ง</div>
              <div className="moral-stat-box-label">แหล่งเรียนรู้คุณธรรม</div>
              <span className="moral-stat-box-sub">ครอบคลุมทุกภูมิภาคทั่วประเทศ</span>
            </div>
          </div>

          <div className="moral-stat-box purple">
            <div className="moral-stat-box-icon"><Users size={24} /></div>
            <div>
              <div className="moral-stat-box-num">5,000 คน</div>
              <div className="moral-stat-box-label">วิทยากร Change Agent</div>
              <span className="moral-stat-box-sub">ผู้นำขับเคลื่อนการเปลี่ยนแปลงในพื้นที่</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Interactive Pipeline Diagram (Input -> Output -> Outcome -> Impact) */}
      <section className="moral-section">
        <h3 className="moral-section-title">
          <GitMerge size={18} color="#3b82f6" />
          <span>ผังจำลองห่วงโซ่ผลลัพธ์คุณธรรมระดับชาติ (Interactive Result Chain Pipeline)</span>
        </h3>

        <div className="moral-pipeline-flow">
          <div className="moral-pipeline-step">
            <div className="moral-pipeline-badge">INPUTS (ปัจจัยนำเข้า)</div>
            <div className="moral-pipeline-content">
              <strong>งบประมาณบูรณาการ 1,840 ลบ.</strong>
              <p>งบประมาณ 5 กระทรวงหลัก, กองทุน ศคธ., ทรัพยากรบุคคล Change Agent 5,000 คน</p>
              <div className="moral-pipeline-tag success">100% บรรลุการจัดสรร</div>
            </div>
          </div>

          <div className="moral-pipeline-connector">➔</div>

          <div className="moral-pipeline-step">
            <div className="moral-pipeline-badge">OUTPUTS (ผลผลิต)</div>
            <div className="moral-pipeline-content">
              <strong>องค์กร & แหล่งเรียนรู้</strong>
              <p>องค์กรคุณธรรม 7,000 แห่ง, แหล่งเรียนรู้ 400 แห่ง, โครงงานคุณธรรม 1,420 โรงเรียน</p>
              <div className="moral-pipeline-tag success">140% เกินเป้าหมาย</div>
            </div>
          </div>

          <div className="moral-pipeline-connector">➔</div>

          <div className="moral-pipeline-step">
            <div className="moral-pipeline-badge">OUTCOMES (ผลลัพธ์)</div>
            <div className="moral-pipeline-content">
              <strong>พฤติกรรม & ธรรมาภิบาล</strong>
              <p>ดัชนีคุณธรรม 5 มิติเฉลี่ยแตะ 76.4 จุด, ดัชนี ITA ผ่านเกณฑ์เพิ่มขึ้น 12.8%</p>
              <div className="moral-pipeline-tag warning">85% บรรลุตามแผน</div>
            </div>
          </div>

          <div className="moral-pipeline-connector">➔</div>

          <div className="moral-pipeline-step">
            <div className="moral-pipeline-badge">IMPACTS (ผลกระทบ)</div>
            <div className="moral-pipeline-content">
              <strong>สังคมสันติสุข & สังคมคุณธรรม</strong>
              <p>คดีทุจริตลดลง, ความรุนแรงในครอบครัวลดลง, ทุนชีวิตสังคมเกื้อกูลยั่งยืน</p>
              <div className="moral-pipeline-tag info">เป้าหมายยุทธศาสตร์ 20 ปี</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Heatmap Matrix & Stacked Bar Chart */}
      <div className="moral-grid-2cols">
        {/* Heatmap Matrix สถานะตัวชี้วัดภาคี */}
        <div className="moral-card-panel">
          <div className="moral-card-panel-header">
            <div className="moral-card-panel-title-wrap">
              <Layers size={18} color="#8b5cf6" />
              <div>
                <h4 className="moral-card-panel-title">Heatmap Matrix: สถานะความสำเร็จตามตัวชี้วัดหน่วยงานภาคี</h4>
                <p className="moral-card-panel-sub">เขียว: บรรลุเป้าหมาย (&gt;90%) | เหลือง: เฝ้าระวัง (70-89%) | แดง: ต่ำกว่าเป้า</p>
              </div>
            </div>
          </div>

          <div className="moral-table-wrapper" style={{ marginTop: '10px' }}>
            <table className="moral-data-table">
              <thead>
                <tr>
                  <th>หน่วยงานภาคี</th>
                  <th style={{ textAlign: 'center' }}>พอเพียง</th>
                  <th style={{ textAlign: 'center' }}>วินัย</th>
                  <th style={{ textAlign: 'center' }}>สุจริต</th>
                  <th style={{ textAlign: 'center' }}>จิตอาสา</th>
                  <th style={{ textAlign: 'center' }}>กตัญญู</th>
                  <th style={{ textAlign: 'center' }}>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {AGENCY_HEATMAP_MATRIX.map((row) => (
                  <tr key={row.agency}>
                    <td style={{ fontSize: '12px', fontWeight: 600 }}>{row.agency}</td>
                    <td style={{ textAlign: 'center' }} className={`score-cell ${row.พอเพียง >= 80 ? 'high' : 'mid'}`}>{row.พอเพียง}%</td>
                    <td style={{ textAlign: 'center' }} className={`score-cell ${row.วินัย >= 75 ? 'high' : 'mid'}`}>{row.วินัย}%</td>
                    <td style={{ textAlign: 'center' }} className={`score-cell ${row.สุจริต >= 75 ? 'high' : 'mid'}`}>{row.สุจริต}%</td>
                    <td style={{ textAlign: 'center' }} className={`score-cell ${row.จิตอาสา >= 85 ? 'high' : 'mid'}`}>{row.จิตอาสา}%</td>
                    <td style={{ textAlign: 'center' }} className={`score-cell high`}>{row.กตัญญู}%</td>
                    <td style={{ textAlign: 'center' }}>
                      {row.status === 'achieved' && <span className="status-badge green">บรรลุเป้า</span>}
                      {row.status === 'on-track' && <span className="status-badge blue">ตามแผน</span>}
                      {row.status === 'warning' && <span className="status-badge yellow">เฝ้าระวัง</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cross-Agency Stacked Bar Chart */}
        <div className="moral-card-panel">
          <div className="moral-card-panel-header">
            <div className="moral-card-panel-title-wrap">
              <CheckCircle2 size={18} color="#10b981" />
              <div>
                <h4 className="moral-card-panel-title">Cross-Agency Stacked Bar: สัดส่วนผลสำเร็จตามตัวชี้วัด</h4>
                <p className="moral-card-panel-sub">เปรียบเทียบสัดส่วนเป้าหมาย (บรรลุเป้าหมาย / เฝ้าระวัง / ต่ำกว่าเป้า)</p>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CROSS_AGENCY_STACKED_BAR} layout="vertical" margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" unit="%" stroke="#64748b" fontSize={11} domain={[0, 100]} tick={{ fontFamily: 'var(--font-thai)' }} />
                <YAxis type="category" dataKey="agency" stroke="#64748b" fontSize={11} tick={{ fontFamily: 'var(--font-thai)' }} />
                <RechartsTooltip contentStyle={{ fontFamily: 'var(--font-thai)' }} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-thai)' }} />
                <Bar dataKey="บรรลุเป้าหมาย" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="เฝ้าระวัง" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="ต่ำกว่าเป้า" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insight Banner */}
      <AiInsightBanner
        title="ผลการวิเคราะห์ความสอดคล้องของห่วงโซ่ผลลัพธ์ (Result Chain Alignment & Task Overlap)"
        badge="Cross-Agency Policy Synthesis"
        severity="normal"
        insights={[
          'ภาพรวมตัวชี้วัดตามแผนแม่บทส่งเสริมคุณธรรมแห่งชาติ ระยะที่ 2 บรรลุเป้าหมายแล้ว 78% ของเป้าหมายรวม 5 ปี โดยมีองค์กรคุณธรรมผ่านเกณฑ์ประเมินทะลุเป้าหมายที่ 7,000 แห่ง (เป้าหมาย 5,000 แห่ง)',
          'AI ตรวจพบความซ้ำซ้อนของภารกิจ (Task Overlap) ในการจัดอบรมคุณธรรมเด็กและเยาวชน ระหว่าง วธ. (ชุมชนคุณธรรม) และ ศธ. (โรงเรียนคุณธรรม) ใน 18 จังหวัด แนะนำให้บูรณาการงบประมาณเป็นชุดฝึกอบรมร่วมกัน',
          'ดัชนีความโปร่งใส ITA จาก ป.ป.ช. มีความสัมพันธ์เชิงบวกสูง (r = 0.82) กับคะแนนคุณธรรมมิติวินัยและสุจริตของสำนักงาน ก.พ.'
        ]}
        recommendation="เสนอแนะให้สภาพัฒน์ฯ กำหนด Single KPI ร่วมระหว่าง วธ. พม. และ ศธ. เพื่อลดความซ้ำซ้อนในการรายงานผล และรวมศูนย์ฐานข้อมูล Change Agent ทั้ง 5,000 คน ไว้ที่ ศคธ."
      />

      {/* แหล่งข้อมูลบูรณาการ (ล่างสุดของหน้า) */}
      <MoralSourceFooter
        agencies={AGENCIES}
        viewTitle="1.3 ห่วงโซ่ผลลัพธ์ด้านคุณธรรมระดับชาติ"
      />
    </div>
  );
};
