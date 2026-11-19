import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { FileText, ArrowDownToLine, Users, Compass } from 'lucide-react';
import { MoralViewHeader } from '../components/MoralViewHeader';
import { AiInsightBanner } from '../components/AiInsightBanner';
import { MoralSourceFooter } from '../components/MoralSourceFooter';
import {
  GENDER_TORNADO_DATA,
  PRIORITY_QUADRANT_DATA
} from '../data/moralAgencyDataCatalog';

const AGENCIES = [
  { name: 'กรมกิจการสตรีและสถาบันครอบครัว (สค.)', tag: 'พม. (สค.)' },
  { name: 'สำนักงานสถิติแห่งชาติ (สถิติด้านแรงงานและประชากร)', tag: 'สถิติแห่งชาติ' },
  { name: 'ศูนย์คุณธรรม (องค์การมหาชน)', tag: 'ศคธ.' }
];

export const PolicyGapsView: React.FC = () => {
  return (
    <div className="moral-view-container">
      {/* Header */}
      <MoralViewHeader
        sectorTitle="ระดับนโยบาย (Policy Maker Dashboard)"
        sectorBadgeColor="#3b82f6"
        viewTitle="สรุปสาระสำคัญเชิงนโยบายและช่องว่างการแทรกแซง (Policy Gaps & Gender-Responsive Policy)"
        viewSubtitle="วิเคราะห์ความแตกต่างเชิงเพศสภาพ ค้นหาช่องว่างนโยบาย และสังเคราะห์ข้อเสนอแนะเชิงมาตรการด้วย Agentic AI"
        agencies={[
          { name: 'กรมกิจการสตรีและสถาบันครอบครัว (สค.)', tag: 'พม. (สค.)' },
          { name: 'สำนักงานสถิติแห่งชาติ (สถิติด้านแรงงานและประชากร)', tag: 'สถิติแห่งชาติ' },
          { name: 'ศูนย์คุณธรรม (องค์การมหาชน)', tag: 'ศคธ.' }
        ]}
        aiModelTag="Policy Gap Agentic AI v3.2"
        onExportPdf={() => alert('สร้างและส่งออกเอกสาร Policy Brief ฉบับสมบูรณ์ (PDF) สำเร็จ')}
      />

      {/* 1. Charts: Tornado Chart (Male vs Female) & Priority Matrix (Quadrant Chart) */}
      <div className="moral-grid-2cols">
        {/* Tornado Chart / Grouped Bar (เพศชาย vs เพศหญิง) */}
        <div className="moral-card-panel">
          <div className="moral-card-panel-header">
            <div className="moral-card-panel-title-wrap">
              <Users size={18} color="#ec4899" />
              <div>
                <h4 className="moral-card-panel-title">Tornado Chart: เปรียบเทียบคะแนนคุณธรรม ชาย vs หญิง</h4>
                <p className="moral-card-panel-sub">สะท้อนมิติ Gender Gap ใน 5 มิติคุณธรรม (สีน้ำเงิน: ชาย | สีชมพู: หญิง)</p>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GENDER_TORNADO_DATA} layout="vertical" margin={{ top: 15, right: 25, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[60, 95]} stroke="#64748b" fontSize={11} ticks={[60, 70, 80, 90]} tick={{ fontFamily: 'var(--font-thai)' }} />
                <YAxis type="category" dataKey="dimension" stroke="#64748b" fontSize={12} tick={{ fontFamily: 'var(--font-thai)' }} />
                <RechartsTooltip contentStyle={{ fontFamily: 'var(--font-thai)' }} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-thai)' }} />
                <Bar dataKey="male" name="เพศชาย (Male)" fill="#3b82f6" radius={[0, 3, 3, 0]} />
                <Bar dataKey="female" name="เพศหญิง (Female)" fill="#ec4899" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="moral-chart-footnote">
            * สังเกตว่าเพศหญิงมีคะแนนนำเพศชายในทุกมิติ โดยเฉพาะมิติวินัย (ต่างกัน +4.8 จุด)
          </div>
        </div>

        {/* Priority Matrix: Quadrant Chart 4 จตุภาค */}
        <div className="moral-card-panel">
          <div className="moral-card-panel-header">
            <div className="moral-card-panel-title-wrap">
              <Compass size={18} color="#f59e0b" />
              <div>
                <h4 className="moral-card-panel-title">Priority Matrix: กราฟ 4 จตุภาคชี้จุดแทรกแซงเร่งด่วน</h4>
                <p className="moral-card-panel-sub">แกน X = ความรุนแรงของปัญหา | แกน Y = งบประมาณที่ได้รับการสนับสนุน</p>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="xProblem" name="ความรุนแรงของปัญหา" stroke="#64748b" fontSize={11} domain={[20, 100]} tick={{ fontFamily: 'var(--font-thai)' }} />
                <YAxis type="number" dataKey="yBudget" name="การสนับสนุนงบประมาณ" stroke="#64748b" fontSize={11} domain={[10, 90]} tick={{ fontFamily: 'var(--font-thai)' }} />
                <ZAxis range={[100, 120]} />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontFamily: 'var(--font-thai)' }} />
                <Scatter name="ประเด็นนโยบาย" data={PRIORITY_QUADRANT_DATA} fill="#ef4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="moral-quadrant-legend">
            <span className="moral-quadrant-tag urgent">🔴 Q2 วิกฤต (ปัญหาหนัก แต่ขาดงบ) - ต้องแทรกแซงทันที</span>
            <span className="moral-quadrant-tag wellfunded">🟢 Q4 ได้รับงบพอเพียง - ดำเนินการต่อเนื่อง</span>
          </div>
        </div>
      </div>

      {/* 2. AI Insight Banner */}
      <AiInsightBanner
        title="การวิเคราะห์ความแตกต่างเชิงเพศสภาพและช่องว่างนโยบาย (Gender-Responsive Analysis)"
        badge="Agentic Policy Synthesis"
        severity="warning"
        insights={[
          'Gender Gap Analysis: เพศหญิงมีคะแนนดัชนีคุณธรรมสูงกว่าเพศชายในทุกมิติ โดยช่องว่างสูงสุดอยู่ที่มิติ "วินัย" (หญิง 75.2 vs ชาย 70.4, ต่างกัน 4.8 จุด) และมิติ "สุจริต" (หญิง 70.2 vs ชาย 66.8, ต่างกัน 3.4 จุด)',
          'Policy Gap: ปัญหา "ความสุจริตในสถานประกอบการ" และ "วินัยดิจิทัลในกลุ่มวัยทำงานตอนต้น" จัดอยู่ใน จตุภาควิกฤต (High Problem / Low Budget) ที่มีงบประมาณสนับสนุนไม่ถึง 20% ของความต้องการแทรกแซง',
          'Agentic AI Recommendation: แนะนำให้ปรับนโยบายการฝึกอบรมคุณธรรมในองค์กรธุรกิจ ให้เน้นกลุ่มพนักงานเพศชายช่วงอายุ 25-39 ปี ซึ่งเป็นกลุ่มที่มีความเสี่ยงต่อการถูกชักจูงสู่การทุจริตสูงสุด'
        ]}
        recommendation="จัดทำร่างข้อเสนอนโยบายเร่งด่วน (Urgent Policy Brief) เสนอต่อคณะกรรมการส่งเสริมคุณธรรมแห่งชาติ เพื่ออนุมัติงบกองทุนส่งเสริมคุณธรรมแทรกแซงใน 10 คลัสเตอร์อุตสาหกรรมเสี่ยง"
      />

      {/* 3. AI Policy Brief Summary Card with Download Button (ย้ายมาอยู่ก่อนแหล่งข้อมูลบูรณาการ) */}
      <section className="moral-section">
        <div className="moral-policy-brief-card">
          <div className="moral-policy-brief-header">
            <div className="moral-policy-brief-title-wrap">
              <FileText size={22} color="#3b82f6" />
              <div>
                <h3 className="moral-policy-brief-title">AI Automated Policy Brief: สรุปสาระสำคัญเชิงนโยบายประจำปี 2568</h3>
                <span className="moral-policy-brief-sub">สังเคราะห์อัตโนมัติจากข้อมูล ศคธ., สค., และสำนักงานสถิติแห่งชาติ</span>
              </div>
            </div>

            <button
              className="moral-policy-brief-download-btn"
              onClick={() => alert('ดาวน์โหลด Executive Policy Brief (PDF) 12 หน้าฉบับเต็ม')}
            >
              <ArrowDownToLine size={16} />
              <span>ดาวน์โหลด Policy Brief (PDF)</span>
            </button>
          </div>

          <div className="moral-policy-brief-body">
            <div className="moral-brief-col">
              <h6>1. ประเด็นสถานการณ์สำคัญ (Key Findings)</h6>
              <p>
                แม้ภาพรวมความกตัญญูและจิตอาสาจะอยู่ในเกณฑ์ดีมาก แต่ความซื่อสัตย์สุจริตและวินัยการเคารพกฎหมายยังคงเป็นจุดเปราะบาง โดยเฉพาะในประชากรชายวัยแรงงานที่มีอัตราการยอมรับคอร์รัปชันเล็กน้อยเพื่อความสะดวกในธุรกิจสูงกว่าเพศหญิง 2.1 เท่า
              </p>
            </div>
            <div className="moral-brief-col">
              <h6>2. ช่องว่างเชิงนโยบาย (Identified Gaps)</h6>
              <p>
                งบประมาณกว่า 60% กระจุกตัวอยู่ที่กิจกรรมสร้างความตระหนักรู้และงานพิธีการ แต่ขาดงบประมาณด้านการพัฒนาระบบตรวจสอบความโปร่งใสภาคประชาชน และการสร้างมาตรการคุ้มครองผู้แจ้งเบาะแส (Whistleblower Protection) ในระดับท้องถิ่น
              </p>
            </div>
            <div className="moral-brief-col">
              <h6>3. ข้อเสนอแนะเชิงมาตรการ (Actionable Policy)</h6>
              <p>
                1) บูรณาการหลักสูตรคุณธรรมและวินัยทางการเงินร่วมกับกระทรวงแรงงาน 2) สนับสนุนงบประมาณตรงสู่องค์กรภาคประชาสังคมในการเฝ้าระวังการทุจริต 3) กำหนดดัชนีคุณธรรมเป็นเงื่อนไขในการพิจารณาจัดซื้อจัดจ้างภาครัฐ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* แหล่งข้อมูลบูรณาการ (ล่างสุดของหน้า) */}
      <MoralSourceFooter
        agencies={AGENCIES}
        viewTitle="1.4 สรุปสาระสำคัญเชิงนโยบายและช่องว่างการแทรกแซง"
      />
    </div>
  );
};
