import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface ChartsPanelProps {
  stats?: {
    totalBudget: string;
    activeProjects: number;
    averageScore: number;
  };
  activeAgencies?: string[];
  middleWidget?: React.ReactNode;
  hideBarChart?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        padding: '12px 16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        minWidth: '200px',
        maxWidth: '350px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#1e293b', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4' }}>
          {label}
        </p>
        <div style={{ display: 'grid', gap: '4px' }}>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: entry.color, borderRadius: '2px' }} />
                <span style={{ fontSize: '11px', color: '#64748b' }}>{entry.name}</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ChartsPanel: React.FC<ChartsPanelProps> = ({ stats, activeAgencies, middleWidget, hideBarChart }) => {
  const [barData, setBarData] = useState<any[]>([]);
  const [moralRadarData, setMoralRadarData] = useState<any[]>([]);

  useEffect(() => {
    fetchTopAgencies();
  }, [activeAgencies]);

  const fetchTopAgencies = async () => {
    let query = supabase
      .from('agencies')
      .select('*')
      .order('calculated_average', { ascending: false });

    if (activeAgencies && activeAgencies.length > 0) {
      query = query.in('parent_id', activeAgencies);
    }

    const { data } = await query.limit(10);
      
    if (data && data.length > 0) {
      const formattedBarData = data.map((agency: any) => ({
        name: agency.name || 'Unknown',
        'วินัย': agency.discipline || 0,
        'พอเพียง': agency.sufficiency || 0,
        'สุจริต': agency.honesty || 0,
        'จิตอาสา': agency.volunteer || 0,
        'กตัญญู': agency.gratitude || 0
      }));
      setBarData(formattedBarData);

      // Calculate averages for radar chart
      let sumDiscipline = 0, sumSufficiency = 0, sumHonesty = 0, sumVolunteer = 0, sumGratitude = 0;
      data.forEach((agency: any) => {
        sumDiscipline += agency.discipline || 0;
        sumSufficiency += agency.sufficiency || 0;
        sumHonesty += agency.honesty || 0;
        sumVolunteer += agency.volunteer || 0;
        sumGratitude += agency.gratitude || 0;
      });
      
      const count = data.length;
      
      const getLevel = (score: number) => {
        if (score >= 9.0) return 'ดีเยี่ยม';
        if (score >= 7.0) return 'ระดับดี';
        if (score >= 5.0) return 'ระดับพอใช้';
        return 'ระดับน้อย';
      };

      const getScoreColor = (score: number) => {
        if (score >= 9.0) return '#10b981';
        if (score >= 7.0) return '#3b82f6';
        if (score >= 5.0) return '#eab308';
        return '#f43f5e';
      };

      setMoralRadarData([
        { subject: 'วินัย', displayName: `วินัย ${(sumDiscipline/count).toFixed(1)}`, score: sumDiscipline/count, level: getLevel(sumDiscipline/count), color: getScoreColor(sumDiscipline/count) },
        { subject: 'พอเพียง', displayName: `พอเพียง ${(sumSufficiency/count).toFixed(1)}`, score: sumSufficiency/count, level: getLevel(sumSufficiency/count), color: getScoreColor(sumSufficiency/count) },
        { subject: 'สุจริต', displayName: `สุจริต ${(sumHonesty/count).toFixed(1)}`, score: sumHonesty/count, level: getLevel(sumHonesty/count), color: getScoreColor(sumHonesty/count) },
        { subject: 'จิตอาสา', displayName: `จิตอาสา ${(sumVolunteer/count).toFixed(1)}`, score: sumVolunteer/count, level: getLevel(sumVolunteer/count), color: getScoreColor(sumVolunteer/count) },
        { subject: 'กตัญญู', displayName: `กตัญญู ${(sumGratitude/count).toFixed(1)}`, score: sumGratitude/count, level: getLevel(sumGratitude/count), color: getScoreColor(sumGratitude/count) },
      ]);
    } else {
      setBarData([]);
      setMoralRadarData([]);
    }
  };

  const displayStats = stats || {
    totalBudget: '฿12,000',
    activeProjects: 312,
    averageScore: 6.5
  };

  return (
    <div className="stats-column">
      {/* Moral Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <h4 className="chart-title">Moral Chart</h4>
            <span className="chart-subtitle">ผลการประเมินคุณธรรม 5 ด้านของประเทศไทย</span>
          </div>
          <button className="chart-more-btn">
            <MoreVertical size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4px', height: 160, alignItems: 'center' }}>
          {/* Radar Chart */}
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={moralRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="displayName" 
                  tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 700 }} 
                />
                {/* Domain set from 0 to 10 since average scores are up to 10 */}
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                <Radar 
                  name="คะแนนเฉลี่ย" 
                  dataKey="score" 
                  stroke="var(--color-integrity)" 
                  fill="var(--color-integrity)" 
                  fillOpacity={0.25} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Moral Legend */}
          <div className="radar-legend-container" style={{ gap: '6px' }}>
            {moralRadarData.map((item) => (
              <div key={item.subject} className="radar-legend-item" style={{ gap: '6px' }}>
                <span 
                  className="radar-legend-color" 
                  style={{ 
                    backgroundColor: item.color,
                    width: '6px',
                    height: '6px'
                  }} 
                />
                <div className="radar-legend-text">
                  <span className="radar-legend-label" style={{ fontSize: '9.5px', lineHeight: 1.1 }}>
                    {item.subject}: {item.score.toFixed(2)}
                  </span>
                  <span className="radar-legend-sub" style={{ fontSize: '8.5px', color: '#64748b' }}>
                    {item.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {middleWidget}

      {/* Top 10 High-Scoring Projects Bar Chart */}
      {!hideBarChart && (
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-group">
              <h4 className="chart-title">Top 10 Sub Government Offices</h4>
              <span className="chart-subtitle">คะแนนสูงสุด 10 หน่วยงาน</span>
            </div>
            <button className="chart-more-btn">
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', fontSize: '9px', fontWeight: 'bold', marginBottom: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#8b5cf6', borderRadius: '2px' }} />
              <span style={{ color: '#64748b' }}>วินัย</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '2px' }} />
              <span style={{ color: '#64748b' }}>พอเพียง</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
              <span style={{ color: '#64748b' }}>สุจริต</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
              <span style={{ color: '#64748b' }}>จิตอาสา</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
              <span style={{ color: '#64748b' }}>กตัญญู</span>
            </div>
          </div>

          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 5, right: 5, left: -25, bottom: 80 }}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-90}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 8 }}
                  domain={[0, 25]}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip 
                  content={<CustomTooltip />} 
                  position={{ y: 150 }} 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} 
                />
                <Bar dataKey="วินัย" stackId="a" fill="#8b5cf6" barSize={12} />
                <Bar dataKey="พอเพียง" stackId="a" fill="#10b981" barSize={12} />
                <Bar dataKey="สุจริต" stackId="a" fill="#f59e0b" barSize={12} />
                <Bar dataKey="จิตอาสา" stackId="a" fill="#ef4444" barSize={12} />
                <Bar dataKey="กตัญญู" stackId="a" fill="#3b82f6" barSize={12} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* KPI Stats Footer */}
      <div className="summary-stats-footer">
        <div className="summary-stat-box">
          <span className="summary-stat-value">{displayStats.totalBudget}</span>
          <span className="summary-stat-label">Total Budget</span>
        </div>

        <div className="summary-stat-box" style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '20px' }}>
          <span className="summary-stat-value">{displayStats.activeProjects}</span>
          <span className="summary-stat-label">Active Projects</span>
        </div>

        <div className="summary-stat-box" style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '20px' }}>
          <span className="summary-stat-value">125</span>
          <span className="summary-stat-label">Finish Project</span>
        </div>
      </div>
    </div>
  );
};
