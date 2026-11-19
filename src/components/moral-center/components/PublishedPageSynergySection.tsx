import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  Award,
  Layers,
  Info,
  Building2,
  TrendingUp,
  BarChart2,
  Trash2,
  Database,
  Table as TableIcon
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
import {
  getPublishedSynergies,
  getPublishedSynergiesForPage,
  onPublishedSynergiesChange,
  deletePublishedSynergy,
  type PublishedSynergyItem
} from '../data/publishedSynergyService';
import {
  getHierarchicalDomainConfigs,
  deleteSynergyInitiative,
  resolveDatasetMeta,
  onHierarchicalSynergyChange,
  type SynergyInitiative
} from '../data/domainSynergyRegistryService';

export interface PublishedPageSynergySectionProps {
  pageId: 'policy-1-1' | 'policy-1-2' | 'policy-moral-credit' | 'policy-moral-lecturers' | 'moral-analysis';
  pageTitle?: string;
}

export const PublishedPageSynergySection: React.FC<PublishedPageSynergySectionProps> = ({
  pageId,
  pageTitle
}) => {
  const [synergies, setSynergies] = useState<PublishedSynergyItem[]>(() => {
    return getPublishedSynergiesForPage(pageId);
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [domainConfigs, setDomainConfigs] = useState(() => getHierarchicalDomainConfigs());

  useEffect(() => {
    const refresh = () => {
      const list = getPublishedSynergiesForPage(pageId);
      setSynergies(list);
      setDomainConfigs(getHierarchicalDomainConfigs());
    };
    refresh();
    const unsub1 = onPublishedSynergiesChange(refresh);
    const unsub2 = onHierarchicalSynergyChange(refresh);
    return () => {
      unsub1();
      unsub2();
    };
  }, [pageId]);

  // Lookup map of live initiatives to get real-time internal and external table IDs
  const liveInitiativesMap = useMemo(() => {
    const map = new Map<string, SynergyInitiative>();
    domainConfigs.forEach((dom) => {
      dom.dimensions.forEach((dim) => {
        dim.initiatives.forEach((init) => {
          map.set(init.id, init);
        });
      });
    });
    return map;
  }, [domainConfigs]);

  if (synergies.length === 0) {
    return null;
  }

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDeleteSynergy = (id: string, title: string) => {
    if (confirm(`คุณต้องการลบหัวข้อ Synergy "${title}" ออกจากระบบใช่หรือไม่?\n(การลบนี้จะนำหัวข้อ Synergy นี้ออกจากหน้า Dataset ด้วย)`)) {
      deleteSynergyInitiative(id);
      deletePublishedSynergy(id);
      const list = getPublishedSynergiesForPage(pageId);
      setSynergies(list);
    }
  };

  return (
    <div
      className="published-page-synergy-wrapper"
      style={{
        margin: '28px 0 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: "'Kanit', sans-serif"
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '-8px' }}>
        <Sparkles size={20} color="#0284c7" />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
          หัวข้อการเชื่อมโยงข้อมูล Data Synergy ({synergies.length} เรื่องที่เผยแพร่)
        </h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          • ซิงค์ชุดข้อมูลร่วมกับหน้า Dataset Hub โดยตรง
        </span>
      </div>

      {synergies.map((syn) => {
        const isExpanded = expandedId === syn.id;
        const liveInit = liveInitiativesMap.get(syn.id);

        // Get live external and internal tables
        const externalTables = liveInit ? liveInit.externalTableIds : (syn.externalTableIds || []);
        const internalTables = liveInit ? liveInit.internalTableIds : (syn.internalTableIds || []);

        const resolvedExternal = externalTables.map((tId) => resolveDatasetMeta(tId));
        const resolvedInternal = internalTables.map((tId) => resolveDatasetMeta(tId));

        return (
          <div
            key={syn.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '2px solid #e0f2fe',
              boxShadow: '0 8px 30px rgba(2, 132, 199, 0.08)',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            {/* 1. Header Trigger Banner / Button (ปุ่ม Synergy) */}
            <div
              onClick={() => handleToggleExpand(syn.id)}
              style={{
                padding: '18px 24px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                borderBottom: isExpanded ? '1.5px solid #bae6fd' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <Sparkles size={22} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}
                    >
                      ⚡ DATA SYNERGY ข้อมูลร่วมภายนอก
                    </span>
                    <span
                      style={{
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      ความเข้ากันได้ {syn.compatibilityScore}%
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      (หน่วยงาน: {syn.externalAgency})
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: 600 }}>
                      • {resolvedExternal.length} ตารางภายนอก
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: '4px 0 0',
                      fontSize: '16.5px',
                      fontWeight: 800,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {syn.title}
                  </h3>
                </div>
              </div>

              {/* Action Buttons: Expand Toggle & Delete Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleToggleExpand(syn.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: isExpanded ? '#0284c7' : '#ffffff',
                    color: isExpanded ? '#ffffff' : '#0284c7',
                    border: '1.5px solid #0284c7',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <span>{isExpanded ? 'ย่อผลลัพธ์' : 'กดดูผล Synergy ข้อมูล'}</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Delete Synergy Button in Analysis page */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSynergy(syn.id, syn.title);
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3',
                    color: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="ลบหัวข้อ Synergy นี้ออกจากระบบและหน้า Dataset"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* 2. Expanded Panel: Graphs, Evidence & Tables */}
            {isExpanded && (
              <div
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  animation: 'fadeIn 0.25s ease-out',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* A. Summary Headline Card */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    border: '1px solid #e2e8f0',
                    borderLeft: '5px solid #0284c7'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Info size={16} color="#0284c7" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7' }}>
                      บทสรุปความสัมพันธ์เชิงประจักษ์ (Empirical Finding)
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', lineHeight: 1.5 }}>
                    {syn.summaryHeadline}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                    {syn.thematicDescription}
                  </div>
                </div>

                {/* =============================================================
                    B. SECTION ตารางของหน่วยงานภายนอก และ ตารางภายใน (THE USER'S CORE REQUIREMENT)
                ============================================================= */}
                <div
                  style={{
                    backgroundColor: '#fff1f2',
                    borderRadius: '18px',
                    padding: '20px 22px',
                    border: '1.5px solid #fecdd3'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={18} color="#e11d48" />
                      <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#9f1239' }}>
                        ตารางข้อมูลของหน่วยงานภายนอกที่นำมา Synergy (External Agency Tables):
                      </h4>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#be123c' }}>
                      {resolvedExternal.length} ตารางที่เชื่อมต่อ
                    </span>
                  </div>

                  {resolvedExternal.length === 0 ? (
                    <div
                      style={{
                        padding: '20px',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1.5px dashed #fca5a5',
                        textAlign: 'center',
                        color: '#9f1239',
                        fontSize: '13px'
                      }}
                    >
                      ⚠️ ตารางข้อมูลภายนอกถูกปลดออกทั้งหมดแล้ว สามารถเพิ่มตารางใหม่ได้จากหน้า Dataset Hub
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '12px'
                      }}
                    >
                      {resolvedExternal.map((ext) => (
                        <div
                          key={ext.id}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            border: '1px solid #fecdd3',
                            boxShadow: '0 2px 8px rgba(225, 29, 72, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#e11d48', fontFamily: 'monospace' }}>
                              {ext.id}
                            </span>
                            <span style={{ fontSize: '10px', backgroundColor: '#ffe4e6', color: '#be123c', padding: '1px 6px', borderRadius: '6px', fontWeight: 700 }}>
                              {ext.sourceType}
                            </span>
                          </div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {ext.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            หน่วยงาน: {ext.sourceAgency} • {ext.rowCount} แถว
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Internal Center Tables */}
                  {resolvedInternal.length > 0 && (
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #fecdd3' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                        ตารางข้อมูลศูนย์คุณธรรม (Internal Tables):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {resolvedInternal.map((int) => (
                          <div
                            key={int.id}
                            style={{
                              backgroundColor: '#ffffff',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              border: '1px solid #cbd5e1',
                              fontSize: '12px',
                              color: '#334155',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Database size={13} color="#0284c7" />
                            <span style={{ fontWeight: 700 }}>{int.name}</span>
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>({int.id})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* C. Dual-Axis Recharts Visualization */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                        กราฟเปรียบเทียบความสัมพันธ์รายพื้นที่ (Dual-Axis Composed Chart)
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                        แท่งสีน้ำเงิน: {syn.chartConfig.barLabel} | เส้นสีแดง: {syn.chartConfig.lineLabel}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: 700
                      }}
                    >
                      77 จังหวัดทั่วประเทศ
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 340 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={syn.chartData}
                        margin={{ top: 15, right: 25, bottom: 25, left: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey={syn.chartConfig.xKey}
                          tick={{ fontSize: 11, fontFamily: 'Kanit', fill: '#475569' }}
                          interval={0}
                          angle={-30}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 11, fontFamily: 'Kanit', fill: syn.chartConfig.barColor }}
                          unit={` ${syn.chartConfig.unitBar}`}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 11, fontFamily: 'Kanit', fill: syn.chartConfig.lineColor }}
                          unit={` ${syn.chartConfig.unitLine}`}
                        />
                        <Tooltip
                          contentStyle={{
                            fontFamily: 'Kanit',
                            fontSize: '12.5px',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            borderRadius: '10px',
                            border: 'none',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            fontFamily: 'Kanit',
                            fontSize: '12.5px',
                            paddingTop: '10px'
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey={syn.chartConfig.barKey}
                          name={syn.chartConfig.barLabel}
                          fill={syn.chartConfig.barColor}
                          radius={[6, 6, 0, 0]}
                          maxBarSize={45}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey={syn.chartConfig.lineKey}
                          name={syn.chartConfig.lineLabel}
                          stroke={syn.chartConfig.lineColor}
                          strokeWidth={3}
                          dot={{ r: 4, fill: syn.chartConfig.lineColor }}
                          activeDot={{ r: 7 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* D. Negative Impact & Positive Impact Cards Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '16px'
                  }}
                >
                  {/* Negative Impact */}
                  <div
                    style={{
                      borderRadius: '16px',
                      padding: '20px',
                      backgroundColor: '#fff1f2',
                      border: '1.5px solid #fecdd3',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#ffe4e6',
                          color: '#e11d48',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <ShieldAlert size={18} />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#e11d48', letterSpacing: '0.5px' }}>
                          NEGATIVE IMPACT • เมื่อขาดแคลน/คุณธรรมลดลง
                        </span>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#9f1239' }}>
                          {syn.negativeImpact.title}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '32px', fontWeight: 900, color: '#e11d48', lineHeight: 1 }}>
                        {syn.negativeImpact.metric}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#9f1239' }}>
                        อัตราความเสี่ยงพุ่งสูงขึ้นอย่างมีนัยสำคัญ
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '13px', color: '#4c0519', lineHeight: 1.5 }}>
                      {syn.negativeImpact.description}
                    </p>
                  </div>

                  {/* Positive Impact */}
                  <div
                    style={{
                      borderRadius: '16px',
                      padding: '20px',
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #bbf7d0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#dcfce7',
                          color: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Award size={18} />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', letterSpacing: '0.5px' }}>
                          🟢 POSITIVE IMPACT • เมื่อขยายผลเข้มแข็ง
                        </span>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#166534' }}>
                          {syn.positiveImpact.title}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '32px', fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>
                        {syn.positiveImpact.metric}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>
                        ความสำเร็จเชิงประจักษ์ในพื้นที่นำร่อง
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '13px', color: '#14532d', lineHeight: 1.5 }}>
                      {syn.positiveImpact.description}
                    </p>
                  </div>
                </div>

                {/* E. Methodology & Policy Recommendations */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#334155' }}>
                    📐 ระเบียบวิธีคำนวณและข้อเสนอแนะเชิงนโยบาย (Methodology & Policy Insight)
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                    <strong>วิธีคำนวณ:</strong> {syn.methodologyExplanation}
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: 1.6 }}>
                    <strong>ข้อเสนอแนะเชิงนโยบาย:</strong> {syn.policyRecommendation}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
