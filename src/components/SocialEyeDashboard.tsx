import React from 'react';
import { Header } from './Header';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar
} from 'recharts';
import { MoreVertical } from 'lucide-react';

interface SocialEyeDashboardProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: 'TH' | 'EN';
  setLanguage: (lang: 'TH' | 'EN') => void;
}

// --- MOCK DATA ---
const trendData = [
  { date: '10 ม.ค.', วินัย: 120, สุจริต: 100, จิตอาสา: 150, กตัญญู: 250, พอเพียง: 180, 
    us_วินัย: 0.2, us_สุจริต: 0.3, us_จิตอาสา: 0.6, us_กตัญญู: 0.1, us_พอเพียง: 0.1 },
  { date: '11 ม.ค.', วินัย: 450, สุจริต: 180, จิตอาสา: 200, กตัญญู: 300, พอเพียง: 250,
    us_วินัย: 0.4, us_สุจริต: 0.5, us_จิตอาสา: 0.65, us_กตัญญู: 0.3, us_พอเพียง: 0.4 },
  { date: '12 ม.ค.', วินัย: 550, สุจริต: 220, จิตอาสา: 210, กตัญญู: 320, พอเพียง: 280,
    us_วินัย: 0.6, us_สุจริต: 0.55, us_จิตอาสา: 0.7, us_กตัญญู: 0.5, us_พอเพียง: 0.55 },
  { date: '13 ม.ค.', วินัย: 1100, สุจริต: 500, จิตอาสา: 450, กตัญญู: 600, พอเพียง: 550,
    us_วินัย: 0.65, us_สุจริต: 0.52, us_จิตอาสา: 0.75, us_กตัญญู: 0.55, us_พอเพียง: 0.58 },
  { date: '14 ม.ค.', วินัย: 300, สุจริต: 200, จิตอาสา: 150, กตัญญู: 250, พอเพียง: 300,
    us_วินัย: 0.7, us_สุจริต: 0.6, us_จิตอาสา: 0.78, us_กตัญญู: 0.6, us_พอเพียง: 0.65 },
  { date: '15 ม.ค.', วินัย: 600, สุจริต: 350, จิตอาสา: 280, กตัญญู: 400, พอเพียง: 450,
    us_วินัย: 0.75, us_สุจริต: 0.5, us_จิตอาสา: 0.76, us_กตัญญู: 0.65, us_พอเพียง: 0.62 },
  { date: '16 ม.ค.', วินัย: 500, สุจริต: 280, จิตอาสา: 250, กตัญญู: 380, พอเพียง: 350,
    us_วินัย: 0.72, us_สุจริต: 0.55, us_จิตอาสา: 0.8, us_กตัญญู: 0.7, us_พอเพียง: 0.6 },
  { date: '17 ม.ค.', วินัย: 900, สุจริต: 450, จิตอาสา: 400, กตัญญู: 500, พอเพียง: 520,
    us_วินัย: 0.82, us_สุจริต: 0.6, us_จิตอาสา: 0.9, us_กตัญญู: 0.75, us_พอเพียง: 0.65 },
  { date: '18 ม.ค.', วินัย: 400, สุจริต: 200, จิตอาสา: 220, กตัญญู: 300, พอเพียง: 250,
    us_วินัย: 0.78, us_สุจริต: 0.58, us_จิตอาสา: 0.85, us_กตัญญู: 0.8, us_พอเพียง: 0.7 },
  { date: '19 ม.ค.', วินัย: 200, สุจริต: 100, จิตอาสา: 150, กตัญญู: 200, พอเพียง: 180,
    us_วินัย: 0.85, us_สุจริต: 0.6, us_จิตอาสา: 0.88, us_กตัญญู: 0.82, us_พอเพียง: 0.68 }
];

const moralChartData = [
  { subject: 'วินัย (85)', A: 85, fullMark: 100 },
  { subject: 'สุจริต (65)', A: 65, fullMark: 100 },
  { subject: 'จิตอาสา (90)', A: 90, fullMark: 100 },
  { subject: 'กตัญญู (75)', A: 75, fullMark: 100 },
  { subject: 'พอเพียง (70)', A: 70, fullMark: 100 }
];

const sentimentData = [
  { name: 'วินัย', Positive: 4.2, Neutral: 2.1, Negative: 1.5 },
  { name: 'สุจริต', Positive: 3.1, Neutral: 1.8, Negative: 2.0 },
  { name: 'จิตอาสา', Positive: 2.5, Neutral: 2.8, Negative: 1.5 },
  { name: 'กตัญญู', Positive: 3.7, Neutral: 2.2, Negative: 1.2 },
  { name: 'พอเพียง', Positive: 4.1, Neutral: 2.5, Negative: 1.2 }
];

const platformData = [
  { name: 'วินัย', Facebook: 40, TikTok: 20, X: 15, YouTube: 25 },
  { name: 'สุจริต', Facebook: 45, TikTok: 25, X: 20, YouTube: 10 },
  { name: 'จิตอาสา', Facebook: 30, TikTok: 40, X: 10, YouTube: 20 },
  { name: 'กตัญญู', Facebook: 50, TikTok: 15, X: 25, YouTube: 10 },
  { name: 'พอเพียง', Facebook: 35, TikTok: 30, X: 20, YouTube: 15 }
];

const regionData = [
  { name: 'กทม.', Pos: 40, Neu: 20, Neg: 10, Other: 5 },
  { name: 'เชียงใหม่', Pos: 30, Neu: 15, Neg: 15, Other: 10 },
  { name: 'ภูเก็ต', Pos: 25, Neu: 20, Neg: 5, Other: 0 },
  { name: 'ขอนแก่น', Pos: 15, Neu: 10, Neg: 10, Other: 5 },
  { name: 'นครราชสีมา', Pos: 20, Neu: 15, Neg: 5, Other: 0 }
];

const colors = {
  วินัย: '#3b82f6',
  สุจริต: '#ef4444',
  จิตอาสา: '#eab308',
  กตัญญู: '#10b981',
  พอเพียง: '#8b5cf6',
  Positive: '#3b82f6',
  Neutral: '#94a3b8',
  Negative: '#ef4444',
  Facebook: '#3b82f6',
  TikTok: '#000000',
  X: '#10b981',
  YouTube: '#ef4444'
};

export const SocialEyeDashboard: React.FC<SocialEyeDashboardProps> = ({
  searchQuery,
  setSearchQuery,
  language,
  setLanguage
}) => {
  return (
    <div className="dashboard-workspace" style={{ width: '100%', marginLeft: 0, display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header - Kept standard as in App */}
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        language={language} 
        setLanguage={setLanguage} 
      />
      
      <div style={{ display: 'flex', flex: 1, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
        
        {/* Main Canvas Area */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Social Eye: บทสรุปการวิเคราะห์คุณธรรม 5 ด้าน</h1>
          </div>

          {/* Grid Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
            
            {/* Top Left: Trend Lines (Spans 8 cols) */}
            <div className="social-card" style={{ gridColumn: 'span 8' }}>
              <div className="social-card-header" style={{ background: '#e0e7ff' }}>
                <h3 className="social-card-title">แนวโน้มการพูดถึงและความเข้าใจตามเวลา</h3>
                <MoreVertical size={20} color="#64748b" />
              </div>
              <div className="social-card-body" style={{ display: 'flex', gap: '24px', height: '300px' }}>
                
                {/* Mention Volume */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '16px' }}>ปริมาณการพูดถึง (Mention Volume)</div>
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} />
                        <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} layout="horizontal" verticalAlign="bottom" align="center" />
                        <Line type="monotone" dataKey="วินัย" stroke={colors.วินัย} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="สุจริต" stroke={colors.สุจริต} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="จิตอาสา" stroke={colors.จิตอาสา} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="กตัญญู" stroke={colors.กตัญญู} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="พอเพียง" stroke={colors.พอเพียง} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Understanding Score */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '16px' }}>ความเข้าใจสาธารณะ (Public Understanding Score)</div>
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} />
                        <YAxis domain={[0, 1]} tick={{fontSize: 12, fill: '#64748b'}} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} layout="horizontal" verticalAlign="bottom" align="center" />
                        <Line type="monotone" dataKey="us_วินัย" name="วินัย" stroke={colors.วินัย} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="us_สุจริต" name="สุจริต" stroke={colors.สุจริต} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="us_จิตอาสา" name="จิตอาสา" stroke={colors.จิตอาสา} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="us_กตัญญู" name="กตัญญู" stroke={colors.กตัญญู} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="us_พอเพียง" name="พอเพียง" stroke={colors.พอเพียง} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>

            {/* Top Right: Moral Chart (Spans 4 cols) */}
            <div className="social-card" style={{ gridColumn: 'span 4' }}>
              <div className="social-card-header">
                <div>
                  <h3 className="social-card-title">Moral Chart</h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>คะแนนประเมินการรับรู้คุณธรรม 5 ด้านของสาธารณชน</div>
                </div>
                <MoreVertical size={20} color="#64748b" />
              </div>
              <div className="social-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '300px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '8px' }}>คะแนนการรับรู้และความเข้าใจคุณธรรม</div>
                <div style={{ flex: 1, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={moralChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fill: '#334155'}} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                      <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#bfdbfe" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Left: Sentiment (Spans 4 cols) */}
            <div className="social-card" style={{ gridColumn: 'span 4' }}>
              <div className="social-card-header">
                <h3 className="social-card-title">อารมณ์สังคม (Public Sentiment Breakdown)</h3>
                <MoreVertical size={20} color="#64748b" />
              </div>
              <div className="social-card-body" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px', top: -10 }} />
                    <Bar dataKey="Positive" fill={colors.Positive} />
                    <Bar dataKey="Neutral" fill={colors.Neutral} />
                    <Bar dataKey="Negative" fill={colors.Negative} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Middle: Platforms (Spans 4 cols) */}
            <div className="social-card" style={{ gridColumn: 'span 4' }}>
              <div className="social-card-header">
                <h3 className="social-card-title">แพลตฟอร์มยอดนิยม (Popular Platforms)</h3>
                <MoreVertical size={20} color="#64748b" />
              </div>
              <div className="social-card-body" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px', top: -10 }} />
                    <Bar dataKey="Facebook" stackId="a" fill={colors.Facebook} />
                    <Bar dataKey="TikTok" stackId="a" fill={colors.TikTok} />
                    <Bar dataKey="X" stackId="a" fill={colors.X} />
                    <Bar dataKey="YouTube" stackId="a" fill={colors.YouTube} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Right: Regions (Spans 4 cols) */}
            <div className="social-card" style={{ gridColumn: 'span 4' }}>
              <div className="social-card-header">
                <h3 className="social-card-title">ภูมิภาคที่มีการพูดถึงคุณธรรมสูงสุด</h3>
                <MoreVertical size={20} color="#64748b" />
              </div>
              <div className="social-card-body" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={regionData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis type="category" dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} width={80} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px', top: -10 }} />
                    <Bar dataKey="Pos" name="พอเพียง" stackId="a" fill={colors.พอเพียง} />
                    <Bar dataKey="Neu" name="กตัญญู" stackId="a" fill={colors.กตัญญู} />
                    <Bar dataKey="Neg" name="จิตอาสา" stackId="a" fill={colors.จิตอาสา} />
                    <Bar dataKey="Other" name="สุจริต" stackId="a" fill={colors.สุจริต} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
