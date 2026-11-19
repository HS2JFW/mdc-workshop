import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis
} from 'recharts';
import { Coins, TrendingUp, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { MoralViewHeader } from '../components/MoralViewHeader';
import { AiInsightBanner } from '../components/AiInsightBanner';
import { MoralSourceFooter } from '../components/MoralSourceFooter';
import {
  MACRO_BUDGET_MINISTRIES,
  MACRO_ECOSYSTEM_DIMENSIONS,
  SCATTER_ROI_PROJECTS,
  SANKEY_FLOW_DATA
} from '../data/moralAgencyDataCatalog';

const AGENCIES = [
  { name: 'สำนักงบประมาณ', tag: 'สำนักงบฯ' },
  { name: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', tag: 'สภาพัฒน์ฯ' },
  { name: 'สำนักงานเลขาธิการสภาการศึกษา (ศธ.)', tag: 'สภาการศึกษา' },
  { name: 'ศูนย์คุณธรรม (องค์การมหาชน)', tag: 'ศคธ.' }
];

export const PolicyMacroRoiView: React.FC = () => {
  return (
    <div className="moral-view-container">
      {/* Header */}
      <MoralViewHeader
        sectorTitle="ระดับนโยบาย (Policy Maker Dashboard)"
        sectorBadgeColor="#3b82f6"
        viewTitle="ความคุ้มค่างบประมาณและการลงทุนในระบบนิเวศ (Macro ROI & Educational Projects)"
        viewSubtitle="วิเคราะห์ประสิทธิภาพการจัดสรรงบประมาณส่งเสริมคุณธรรมระดับมหภาค คำนวณ Social ROI ใน 4 มิติระบบนิเวศ"
        agencies={[
          { name: 'สำนักงบประมาณ', tag: 'สำนักงบฯ' },
          { name: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', tag: 'สภาพัฒน์ฯ' },
          { name: 'สำนักงานเลขาธิการสภาการศึกษา (ศธ.)', tag: 'สภาการศึกษา' },
          { name: 'ศูนย์คุณธรรม (องค์การมหาชน)', tag: 'ศคธ.' }
        ]}
        aiModelTag="Macro ROI Econometric v2.1"
      />

      {/* SROI Score Card Highlights */}
      <section className="moral-section">
        <div className="moral-roi-metrics-grid">
          <div className="moral-roi-hero-card">
            <div className="moral-roi-hero-label">Social ROI Index (ภาพรวมประเทศ)</div>
            <div className="moral-roi-hero-val">1 : 3.84</div>
            <p className="moral-roi-hero-sub">ทุก 1 บาทที่รัฐลงทุนในคุณธรรม สร้างมูลค่าผลประโยชน์ทางสังคมกลับคืน 3.84 บาท</p>
            <div className="moral-roi-tags-row">
              <span className="moral-roi-pill">✓ ผ่านเกณฑ์คุ้มทุนทางเศรษฐศาสตร์</span>
              <span className="moral-roi-pill">ประเมินโดยสภาพัฒน์ฯ & ศคธ.</span>
            </div>
          </div>

          <div className="moral-roi-dimensions-card">
            <h4 className="moral-card-panel-title">ความคุ้มค่าจำแนกตาม 4 มิติระบบนิเวศ (Ecosystem ROI)</h4>
            <div className="moral-eco-roi-list">
              {MACRO_ECOSYSTEM_DIMENSIONS.map((eco) => (
                <div key={eco.name} className="moral-eco-roi-row">
                  <div className="moral-eco-name-wrap">
                    <span className="moral-eco-dot" style={{ backgroundColor: eco.color }} />
                    <span className="moral-eco-name">{eco.name}</span>
                  </div>
                  <div className="moral-eco-budget">งบ <strong>{eco.budget}</strong> ลบ.</div>
                  <div className="moral-eco-score">SROI <strong>1 : {eco.roi}</strong></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2 Charts: Budget Allocation by Ministry & Scatter Regression Plot */}
      <div className="moral-grid-2cols">
        {/* Donut Chart: สัดส่วนงบประมาณตามกระทรวง */}
        <div className="moral-card-panel">
          <div className="moral-card-panel-header">
            <div className="moral-card-panel-title-wrap">
              <Coins size={18} color="#3b82f6" />
              <div>
                <h4 className="moral-card-panel-title">สัดส่วนงบประมาณจำแนกตามกระทรวงภาคี</h4>
                <p className="moral-card-panel-sub">รวม 1,840 ล้านบาท (ข้อมูลสำนักงบประมาณ & สภาพัฒน์ฯ)</p>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: '280px', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '55%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MACRO_BUDGET_MINISTRIES}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {MACRO_BUDGET_MINISTRIES.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ fontFamily: 'var(--font-thai)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MACRO_BUDGET_MINISTRIES.map((item) => (
                <div key={item.name} className="moral-donut-legend-row">
                  <span className="moral-donut-legend-dot" style={{ backgroundColor: item.color }} />
                  <div style={{ flex: 1, fontSize: '11.5px', color: '#1e293b' }}>{item.name}</div>
                  <strong style={{ fontSize: '12px', color: '#334155' }}>{item.percent}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scatter Plot with Regression Line */}
        <div className="moral-card-panel">
          <div className="moral-card-panel-header">
            <div className="moral-card-panel-title-wrap">
              <TrendingUp size={18} color="#10b981" />
              <div>
                <h4 className="moral-card-panel-title">Scatter Plot: ความสัมพันธ์งบประมาณ vs คะแนนคุณธรรม</h4>
                <p className="moral-card-panel-sub">แกน X = งบประมาณ (ลบ.), แกน Y = คะแนนคุณธรรมที่เพิ่มขึ้น (จุด)</p>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 20, bottom: 15, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="budget" name="งบประมาณ" unit=" ลบ." stroke="#64748b" fontSize={11} domain={[20, 140]} tick={{ fontFamily: 'var(--font-thai)' }} />
                <YAxis type="number" dataKey="deltaScore" name="คะแนนเพิ่มขึ้น" unit=" จุด" stroke="#64748b" fontSize={11} domain={[1, 7]} tick={{ fontFamily: 'var(--font-thai)' }} />
                <ZAxis type="number" dataKey="projects" range={[60, 240]} name="จำนวนโครงการ" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontFamily: 'var(--font-thai)' }} />
                <Scatter name="โครงการคุณธรรม" data={SCATTER_ROI_PROJECTS} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="moral-chart-footnote">
            * ขนาดวงกลมแสดงจำนวนโครงการย่อยในพื้นที่ | เส้นแนวโน้มชี้ว่าโครงการขับเคลื่อนจังหวัดคุณธรรมมีอัตราเร่งผลลัพธ์สูงที่สุด
          </div>
        </div>
      </div>

      {/* 3. Sankey Flow Diagram Simulation */}
      <section className="moral-section">
        <h3 className="moral-section-title">
          <Layers size={18} color="#8b5cf6" />
          <span>Sankey Diagram: แผนภาพสายธารงบประมาณสู่ผลสัมฤทธิ์ (Input ➔ Activities ➔ Outcomes)</span>
        </h3>

        <div className="moral-sankey-flow-wrapper">
          {/* Stage 1: Input */}
          <div className="moral-sankey-col">
            <div className="moral-sankey-col-header">
              <span className="moral-sankey-col-badge">STAGE 1</span>
              <h5>แหล่งงบประมาณ (Input)</h5>
            </div>
            <div className="moral-sankey-cards">
              {SANKEY_FLOW_DATA.inputs.map((inp, idx) => (
                <div key={idx} className="moral-sankey-card blue">
                  <div className="moral-sankey-card-title">{inp.label}</div>
                  <div className="moral-sankey-card-val">{inp.amount}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="moral-sankey-arrow">
            <ArrowRight size={22} />
          </div>

          {/* Stage 2: Activities */}
          <div className="moral-sankey-col">
            <div className="moral-sankey-col-header">
              <span className="moral-sankey-col-badge">STAGE 2</span>
              <h5>กลุ่มกิจกรรมระบบนิเวศ (Activities)</h5>
            </div>
            <div className="moral-sankey-cards">
              {SANKEY_FLOW_DATA.activities.map((act, idx) => (
                <div key={idx} className="moral-sankey-card green">
                  <div className="moral-sankey-card-title">{act.label}</div>
                  <div className="moral-sankey-card-val">สัดส่วน {act.share}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="moral-sankey-arrow">
            <ArrowRight size={22} />
          </div>

          {/* Stage 3: Outcomes */}
          <div className="moral-sankey-col">
            <div className="moral-sankey-col-header">
              <span className="moral-sankey-col-badge">STAGE 3</span>
              <h5>ผลสัมฤทธิ์ปลายทาง (Outcomes)</h5>
            </div>
            <div className="moral-sankey-cards">
              {SANKEY_FLOW_DATA.outcomes.map((out, idx) => (
                <div key={idx} className="moral-sankey-card purple">
                  <div className="moral-sankey-card-title">
                    <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4, color: '#10b981' }} />
                    {out.label}
                  </div>
                  <div className="moral-sankey-card-val" style={{ color: '#8b5cf6' }}>สถานะ: {out.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Insight Banner */}
      <AiInsightBanner
        title="การวิเคราะห์ความคุ้มค่าของการลงทุนทางสังคม (Social ROI & Ecosystem Model)"
        badge="Ecosystem Econometrics"
        severity="normal"
        insights={[
          'เม็ดเงินงบประมาณส่งเสริมคุณธรรมบูรณาการระดับชาติปี 2568 รวม 1,840 ล้านบาท ก่อให้เกิดผลตอบแทนความคุ้มค่าทางสังคม (Social Return on Investment - SROI) เฉลี่ย 1 : 3.84 เท่า',
          'ระบบนิเวศครอบครัว (Family) มีค่าความคุ้มทุนสูงสุดที่ 4.5 เท่า ตามด้วยระบบนิเวศเด็ก (Child) ที่ 4.2 เท่า ชี้ให้เห็นว่าการลงทุนในสถาบันครอบครัวและโรงเรียนสร้างแรงกระเพื่อมต่อการลดปัญหาอาชญากรรมและการทุจริตอย่างมีนัยสำคัญ',
          'จุดคุ้มทุน (Break-even Threshold) ของโครงการส่งเสริมคุณธรรมขนาดกลางอยู่ที่ 45 ล้านบาท โดยโครงการที่มีองค์ประกอบเครือข่ายประชารัฐจะขยับดัชนีคุณธรรมได้สูงกว่าโครงการที่จัดโดยภาครัฐฝ่ายเดียวถึง 2.4 เท่า'
        ]}
        recommendation="เสนอแนะให้ปรับสัดส่วนงบประมาณปี 2569 เพิ่มขึ้น 15% ในระบบนิเวศครอบครัวและเด็ก พร้อมทั้งขยายโมเดลโครงงานคุณธรรมสภาการศึกษาไปยังโรงเรียนขยายโอกาสทั่วประเทศ"
      />

      {/* แหล่งข้อมูลบูรณาการ (ล่างสุดของหน้า) */}
      <MoralSourceFooter
        agencies={AGENCIES}
        viewTitle="1.2 ความคุ้มค่างบประมาณและการลงทุนในระบบนิเวศ"
      />
    </div>
  );
};
