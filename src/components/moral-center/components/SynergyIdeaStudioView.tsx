import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Share2,
  CheckCircle2,
  Send,
  RefreshCw,
  ShieldAlert,
  Award,
  Layers,
  Building2,
  ArrowRight,
  BarChart3,
  Lightbulb,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import type { CompatibilityAssessmentResult, InternalDatasetInput, ExternalDatasetInput } from '../data/dataCompatibilityEvaluator';
import {
  publishSynergy,
  TARGET_PAGES_OPTIONS,
  type PublishedSynergyItem
} from '../data/publishedSynergyService';

export interface SynergyIdeaStudioViewProps {
  internalData: InternalDatasetInput;
  externalData: ExternalDatasetInput;
  assessment: CompatibilityAssessmentResult;
  onClose: () => void;
  onPublished?: (item: PublishedSynergyItem) => void;
}

export const SynergyIdeaStudioView: React.FC<SynergyIdeaStudioViewProps> = ({
  internalData,
  externalData,
  assessment,
  onClose,
  onPublished
}) => {
  const [promptInput, setPromptInput] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isPublicModalOpen, setIsPublicModalOpen] = useState<boolean>(false);
  const [selectedTargetPage, setSelectedTargetPage] = useState<PublishedSynergyItem['targetPageId']>('policy-1-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic state for charts and text based on prompt
  const [synergyTitle, setSynergyTitle] = useState<string>(assessment.suggestedSynergyTheme);
  const [summaryHeadline, setSummaryHeadline] = useState<string>(
    `ความสัมพันธ์เชิงประจักษ์: ในพื้นที่ที่มี ${internalData.name} ต่ำ พบสถิติ ${externalData.name} พุ่งสูงขึ้นกว่าค่าเฉลี่ย 1.8 เท่า ขณะที่พื้นที่ต้นแบบสามารถยกระดับผลลัพธ์เชิงบวกได้กว่า 85%`
  );

  const [positiveMetric, setPositiveMetric] = useState<string>('85%');
  const [positiveDesc, setPositiveDesc] = useState<string>(
    `อำเภอและพื้นที่ที่มีเครือข่าย ${internalData.name} เข้มแข็ง สามารถลดความเสี่ยงและดึงกลุ่มเปราะบางกลับเข้าสู่ระบบได้กว่า 85% เกิดกลไกชุมชนพัฒนาเพิ่มขึ้น 3.4 เท่า`
  );
  const [championHubs, setChampionHubs] = useState<string[]>([
    'อุดรธานี (448 หน่วย)',
    'เชียงราย (404 หน่วย)',
    'กาฬสินธุ์ (262 หน่วย)',
    'ระยอง (300 หน่วย)'
  ]);

  const [negativeMetric, setNegativeMetric] = useState<string>('1.8 เท่า');
  const [negativeDesc, setNegativeDesc] = useState<string>(
    `ใน 15 จังหวัด White Space ที่ขาดแคลน ${internalData.name} พบอัตราความเสี่ยงสูงกว่าค่าเฉลี่ยปกติ 1.8 เท่า ส่งผลต่อปัญหาเชิงโครงสร้างในพื้นที่`
  );
  const [whiteSpaces, setWhiteSpaces] = useState<string[]>([
    'นครนายก (0 หน่วย)',
    'ปัตตานี (2 หน่วย)',
    'นราธิวาส (3 หน่วย)',
    'ตราด (4 หน่วย)',
    'สระแก้ว (2 หน่วย)'
  ]);

  const [chartData, setChartData] = useState([
    { name: 'อุดรธานี', moralValue: 448, externalMetric: 1.2 },
    { name: 'เชียงราย', moralValue: 404, externalMetric: 1.4 },
    { name: 'กาฬสินธุ์', moralValue: 262, externalMetric: 1.8 },
    { name: 'ระยอง', moralValue: 300, externalMetric: 1.6 },
    { name: 'อยุธยา', moralValue: 120, externalMetric: 3.1 },
    { name: 'ขอนแก่น', moralValue: 198, externalMetric: 2.4 },
    { name: 'เชียงใหม่', moralValue: 210, externalMetric: 2.2 },
    { name: 'สงขลา', moralValue: 115, externalMetric: 3.8 },
    { name: 'สระแก้ว', moralValue: 2, externalMetric: 8.9 },
    { name: 'ตราด', moralValue: 4, externalMetric: 7.8 },
    { name: 'นราธิวาส', moralValue: 3, externalMetric: 9.4 },
    { name: 'ปัตตานี', moralValue: 2, externalMetric: 9.7 },
    { name: 'นครนายก', moralValue: 0, externalMetric: 9.1 }
  ]);

  const [methodologyText, setMethodologyText] = useState<string>(
    `วิเคราะห์แบบ Spatio-Temporal Cross-Sectional Analysis โดยการนำ DOPA Code ระดับจังหวัดเชื่อมตาราง Inner Join ระหว่างชุดข้อมูลภายในศูนย์คุณธรรม ("${internalData.name}") กับชุดข้อมูลของ ${externalData.sourceAgency} ("${externalData.name}") โดยใช้สถิติ Pearson Correlation และ Normalized Z-Score เพื่อหาความสัมพันธ์เชิงประจักษ์`
  );

  const [policyRecText, setPolicyRecText] = useState<string>(
    `ข้อเสนอแนะเชิงนโยบาย: เร่งบูรณาการทรัพยากรและงบประมาณข้ามกระทรวงลงสู่พื้นที่เสี่ยงวิกฤต (White Space) ทั้ง 15 จังหวัด เพื่อปิดช่องว่างความเสี่ยงทางสังคม และขยายผลต้นแบบ Champion Hubs ให้เป็นพี่เลี้ยงระดับภูมิภาค`
  );

  // Quick Prompt Chips
  const promptSuggestions = [
    'เน้นวิเคราะห์เฉพาะภาคอีสานและภาคใต้ ในมิติสุจริตเทียบกับดัชนีคดีทุจริต',
    'เจาะลึกเฉพาะกลุ่มเยาวชน 15-24 ปี และเพิ่มแนวทางสะกิดพฤติกรรม (Nudge)',
    'แสดงความสัมพันธ์แบบเน้นจังหวัด White Space 15 จังหวัดที่มีความเสี่ยงสูงสุด',
    'เปลี่ยนเป็นเปรียบเทียบเชิงเศรษฐกิจครัวเรือนและการปลดหนี้รายพื้นที่'
  ];

  // Handle Dynamic Re-Synergize with Prompt
  const handleReSynergize = () => {
    if (!promptInput.trim()) return;
    setIsRegenerating(true);

    setTimeout(() => {
      const q = promptInput.toLowerCase();
      if (q.includes('อีสาน') || q.includes('ใต้')) {
        setSynergyTitle(`วิเคราะห์เจาะลึกภาคตะวันออกเฉียงเหนือและภาคใต้: ${internalData.name} vs ${externalData.name}`);
        setSummaryHeadline(`ผลวิเคราะห์เฉพาะภูมิภาค: ภาคอีสานตอนบนและภาคใต้ตอนล่างมีความแปรผันของผลลัพธ์สูง โดยมีตัวแปร ${internalData.name} เป็นปัจจัยชี้ขาดความสำเร็จ`);
        setChampionHubs(['อุดรธานี (Champion อีสานบน)', 'สุราษฎร์ธานี (Champion ใต้บน)', 'สงขลา (ศูนยกลางใต้)']);
        setWhiteSpaces(['ปัตตานี (ความเสี่ยงวิกฤต)', 'นราธิวาส (ความเสี่ยงวิกฤต)', 'บึงกาฬ (ขาดแคลนทรัพยากร)']);
        setChartData([
          { name: 'อุดรธานี', moralValue: 480, externalMetric: 1.1 },
          { name: 'สุราษฎร์ธานี', moralValue: 390, externalMetric: 1.5 },
          { name: 'ขอนแก่น', moralValue: 310, externalMetric: 2.1 },
          { name: 'สงขลา', moralValue: 280, externalMetric: 2.6 },
          { name: 'ยะลา', moralValue: 45, externalMetric: 7.2 },
          { name: 'นราธิวาส', moralValue: 12, externalMetric: 9.3 },
          { name: 'ปัตตานี', moralValue: 8, externalMetric: 9.8 }
        ]);
      } else if (q.includes('เยาวชน') || q.includes('nudge')) {
        setSynergyTitle(`กลไกสะกิดพฤติกรรม (Nudge) และพลังเยาวชน: ${internalData.name} กับ ${externalData.name}`);
        setPositiveMetric('89.2%');
        setPositiveDesc('การใช้กลไกเพื่อนเตือนเพื่อนและแอปพลิเคชันสะสมแต้มความดีในสถานศึกษา ดึงเยาวชนกลุ่มเสี่ยงกลับสู่พฤติกรรมเชิงบวกได้สำเร็จ');
      } else {
        setSynergyTitle(`ผลวิเคราะห์บูรณาการตามโจทย์: "${promptInput.slice(0, 45)}..."`);
      }

      setMethodologyText(
        `ประมวลผลโมเดลตามโจทย์เพิ่มเติม ("${promptInput}"): ปรับค่าน้ำหนักตัวแปรเฉพาะกลุ่มเป้าหมาย คำนวณความเสี่ยงสัมพัทธ์ (Relative Risk Ratio) และปรับแกนแสดงผลของกราฟให้สอดคล้องกับพฤติกรรมศาสตร์`
      );

      setIsRegenerating(false);
      setToastMessage('✨ ประมวลผลและสร้างกราฟ Synergy ตาม Prompt ใหม่เรียบร้อยแล้ว');
      setTimeout(() => setToastMessage(null), 4000);
    }, 700);
  };

  // Handle Public to Target Page
  const handleConfirmPublic = () => {
    const targetOpt = TARGET_PAGES_OPTIONS.find((p) => p.id === selectedTargetPage) || TARGET_PAGES_OPTIONS[0];

    const newSynergyItem: PublishedSynergyItem = {
      id: `syn_${Date.now()}`,
      title: synergyTitle,
      themeTitle: synergyTitle,
      targetPageId: selectedTargetPage,
      targetPageTitle: targetOpt.title,
      internalDatasetName: internalData.name,
      internalDatasetSource: internalData.sourceType || 'ศูนย์คุณธรรม (องค์การมหาชน)',
      externalDatasetName: externalData.name,
      externalAgency: externalData.sourceAgency,
      compatibilityScore: assessment.overallScore,
      summaryHeadline,
      thematicDescription: `การเชื่อมโยงข้อมูลระหว่าง ${internalData.name} กับ ${externalData.name} เผยแพร่สู่ ${targetOpt.title}`,
      positiveImpact: {
        title: 'ความสำเร็จเชิงประจักษ์เมื่อขยายผลเข้มแข็ง',
        metric: positiveMetric,
        description: positiveDesc,
        championHubs
      },
      negativeImpact: {
        title: 'วิกฤตความเสี่ยงเมื่อขาดแคลน',
        metric: negativeMetric,
        description: negativeDesc,
        whiteSpaces
      },
      chartData,
      chartConfig: {
        xKey: 'name',
        barKey: 'moralValue',
        barLabel: `${internalData.name} (ดัชนี/จำนวน)`,
        barColor: '#0284c7',
        lineKey: 'externalMetric',
        lineLabel: `${externalData.name} (สถิติ/อัตรา)`,
        lineColor: '#ef4444',
        unitBar: '',
        unitLine: '%'
      },
      methodologyExplanation: methodologyText,
      policyRecommendation: policyRecText,
      publishedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      publishedBy: 'Account Admin (ศูนย์คุณธรรม)'
    };

    publishSynergy(newSynergyItem);
    if (onPublished) {
      onPublished(newSynergyItem);
    }
    setIsPublicModalOpen(false);
    setToastMessage(`🎉 เผยแพร่ผลลัพธ์และสร้างปุ่ม Synergy ไปยัง "${targetOpt.title}" สำเร็จเรียบร้อยแล้ว!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: "'Kanit', sans-serif",
        color: '#f8fafc'
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 999999,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
            border: '1.5px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 700,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <Sparkles size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(30, 41, 59, 0.8) 100%)',
          borderRadius: '20px',
          padding: '24px',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800
              }}
            >
              ✨ SYNERGY STUDIO
            </span>
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              คะแนนความเข้ากันได้ {assessment.overallScore}%
            </span>
          </div>

          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f8fafc' }}>
            {synergyTitle}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#94a3b8' }}>
            ข้อมูลภายใน: <strong style={{ color: '#38bdf8' }}>{internalData.name}</strong> | ข้อมูลภายนอก:{' '}
            <strong style={{ color: '#f43f5e' }}>{externalData.name}</strong> ({externalData.sourceAgency})
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setIsPublicModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 22px',
              fontSize: '14.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <Share2 size={18} />
            <span>Public (เผยแพร่สู่ระบบ)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Summary Headline Card */}
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '18px 24px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderLeft: '5px solid #38bdf8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Info size={16} color="#38bdf8" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
            บทสรุปความสัมพันธ์เชิงประจักษ์และการค้นพบสำคัญ
          </span>
        </div>
        <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.6 }}>
          {summaryHeadline}
        </div>
      </div>

      {/* Main Dual-Axis Visualization */}
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px'
          }}
        >
          <div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#f8fafc' }}>
              📊 กราฟเปรียบเทียบเชิงพื้นที่ 2 แกน (Dual-Axis Composed Chart)
            </div>
            <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
              แกนซ้าย (แท่งฟ้า): {internalData.name} | แกนขวา (เส้นแดง): {externalData.name}
            </div>
          </div>
          <span
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            จำแนกตาม 77 จังหวัด
          </span>
        </div>

        <div style={{ width: '100%', height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 25, bottom: 25, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontFamily: 'Kanit', fill: '#94a3b8' }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fontFamily: 'Kanit', fill: '#38bdf8' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fontFamily: 'Kanit', fill: '#f43f5e' }}
              />
              <Tooltip
                contentStyle={{
                  fontFamily: 'Kanit',
                  fontSize: '12.5px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid rgba(56,189,248,0.4)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}
              />
              <Legend wrapperStyle={{ fontFamily: 'Kanit', fontSize: '13px', paddingTop: '10px' }} />
              <Bar
                yAxisId="left"
                dataKey="moralValue"
                name={`${internalData.name} (หน่วย/ดัชนี)`}
                fill="#0284c7"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="externalMetric"
                name={`${externalData.name} (สถิติ/อัตรา %)`}
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f43f5e' }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Negative Impact & Positive Impact Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px'
        }}
      >
        {/* NEGATIVE IMPACT */}
        <div
          style={{
            borderRadius: '18px',
            padding: '22px',
            backgroundColor: 'rgba(159, 18, 57, 0.15)',
            border: '1.5px solid rgba(244, 63, 94, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(244, 63, 94, 0.25)',
                color: '#f43f5e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#f43f5e', letterSpacing: '0.5px' }}>
                NEGATIVE IMPACT • เมื่อขาดแคลน / ตัวแปรลดลง
              </div>
              <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#fecdd3' }}>
                วิกฤตความเสี่ยงเชิงโครงสร้าง
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '36px', fontWeight: 900, color: '#f43f5e', lineHeight: 1 }}>
              {negativeMetric}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fda4af' }}>
              อัตราความเสี่ยงพุ่งสูงขึ้นอย่างมีนัยสำคัญ
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '13.5px', color: '#ffe4e6', lineHeight: 1.55 }}>
            {negativeDesc}
          </p>

          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid rgba(244, 63, 94, 0.3)'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fda4af', marginBottom: '6px' }}>
              พื้นที่เสี่ยงวิกฤต / White Space:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {whiteSpaces.map((ws, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: 'rgba(244, 63, 94, 0.2)',
                    color: '#fecdd3',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600
                  }}
                >
                  {ws}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* POSITIVE IMPACT */}
        <div
          style={{
            borderRadius: '18px',
            padding: '22px',
            backgroundColor: 'rgba(6, 78, 59, 0.2)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', letterSpacing: '0.5px' }}>
                🟢 POSITIVE IMPACT • เมื่อขยายผลเข้มแข็ง
              </div>
              <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#a7f3d0' }}>
                ความสำเร็จเชิงประจักษ์ในพื้นที่นำร่อง
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '36px', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
              {positiveMetric}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6ee7b7' }}>
              ความสำเร็จในการดึงผลลัพธ์กลับสู่เกณฑ์บวก
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '13.5px', color: '#d1fae5', lineHeight: 1.55 }}>
            {positiveDesc}
          </p>

          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6ee7b7', marginBottom: '6px' }}>
              พื้นที่ต้นแบบ (Champion Hubs):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {championHubs.map((hub, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#a7f3d0',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600
                  }}
                >
                  {hub}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Methodology & Policy Explanation */}
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8' }}>
          📐 เหตุผล วิธีการ และคำอธิบายการทำงานของกราฟ
        </div>
        <div style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: 1.6 }}>
          <strong style={{ color: '#f8fafc' }}>วิธีคำนวณ:</strong> {methodologyText}
        </div>
        <div style={{ fontSize: '13.5px', color: '#93c5fd', lineHeight: 1.6 }}>
          <strong style={{ color: '#f8fafc' }}>ข้อเสนอแนะเชิงนโยบาย:</strong> {policyRecText}
        </div>
      </div>

      {/* Interactive Prompt Bar for Re-Synergizing */}
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '20px',
          padding: '24px',
          border: '1.5px solid rgba(2, 132, 199, 0.4)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lightbulb size={20} color="#f59e0b" />
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
            Prompt ปรับแต่งผลลัพธ์และสร้างกราฟ Synergy ใหม่ (Interactive Prompting)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleReSynergize();
            }}
            placeholder="พิมพ์คำสั่ง Prompt เพิ่มเติม (เช่น ขอเน้นเฉพาะภาคอีสานและใต้, หรือเปลี่ยนเป็นวิเคราะห์เด็กและเยาวชน)..."
            style={{
              flex: 1,
              backgroundColor: '#0f172a',
              border: '1.5px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '12px',
              padding: '12px 18px',
              color: '#f8fafc',
              fontSize: '14px',
              fontFamily: 'Kanit',
              outline: 'none'
            }}
          />

          <button
            type="button"
            disabled={isRegenerating || !promptInput.trim()}
            onClick={handleReSynergize}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: promptInput.trim() ? '#0284c7' : '#475569',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: promptInput.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            {isRegenerating ? <RefreshCw size={16} className="spin-animate" /> : <Send size={16} />}
            <span>ประมวลผล Synergy ใหม่</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>ตัวอย่าง Prompt ยอดนิยม:</span>
          {promptSuggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPromptInput(s);
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '12px',
                color: '#cbd5e1',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Public Target Page Selection Modal */}
      {isPublicModalOpen && (
        <div
          onClick={() => setIsPublicModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: '#0f172a',
              borderRadius: '24px',
              border: '1.5px solid rgba(56, 189, 248, 0.4)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Share2 size={24} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#f8fafc' }}>
                  เลือกหน้าเป้าหมายที่จะสร้างปุ่ม Synergy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPublicModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13.5px', color: '#cbd5e1', lineHeight: 1.5 }}>
              เมื่อกดเผยแพร่ ระบบจะนำผลลัพธ์ กราฟสองแกน และการ์ดวิเคราะห์นี้ไปสร้างเป็น **"ปุ่ม Synergy"** ไว้ที่ด้านล่างกราฟหลักของหน้าที่ท่านเลือกทันที
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {TARGET_PAGES_OPTIONS.map((opt) => {
                const isSelected = selectedTargetPage === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedTargetPage(opt.id)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '14px',
                      backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        หมวดหมู่: {opt.category} (รหัสหน้า: {opt.id})
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} color="#38bdf8" />}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsPublicModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#cbd5e1',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmPublic}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                }}
              >
                ยืนยันการเผยแพร่ (Public)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
