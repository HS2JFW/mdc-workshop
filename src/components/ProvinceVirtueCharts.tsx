import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ProvinceVirtueChartsProps {
  activeAgencies?: string[];
}

interface ProvinceData {
  province: string;
  count: number;
  discipline: number;
  sufficiency: number;
  honesty: number;
  volunteer: number;
  gratitude: number;
}

export const ProvinceVirtueCharts: React.FC<ProvinceVirtueChartsProps> = ({ activeAgencies }) => {
  const [data, setData] = useState<ProvinceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProvinceData();
  }, [activeAgencies]);

  const fetchProvinceData = async () => {
    setLoading(true);
    try {
      let query = supabase.from('tor_projects').select('province, discipline, sufficiency, honesty, volunteer, gratitude');
      
      if (activeAgencies && activeAgencies.length > 0) {
        query = query.in('agency_id', activeAgencies);
      }

      const { data: projects, error } = await query;

      if (error) {
        console.error("Error fetching projects for province charts:", error);
        setLoading(false);
        return;
      }

      if (projects) {
        // Group by province
        const grouped: Record<string, { count: number; discipline: number; sufficiency: number; honesty: number; volunteer: number; gratitude: number }> = {};
        
        projects.forEach(p => {
          const prov = p.province || 'ไม่ระบุจังหวัด';
          if (!grouped[prov]) {
            grouped[prov] = { count: 0, discipline: 0, sufficiency: 0, honesty: 0, volunteer: 0, gratitude: 0 };
          }
          grouped[prov].count += 1;
          grouped[prov].discipline += p.discipline || 0;
          grouped[prov].sufficiency += p.sufficiency || 0;
          grouped[prov].honesty += p.honesty || 0;
          grouped[prov].volunteer += p.volunteer || 0;
          grouped[prov].gratitude += p.gratitude || 0;
        });

        // Calculate averages
        const aggregatedData: ProvinceData[] = Object.keys(grouped).map(prov => {
          const g = grouped[prov];
          return {
            province: prov,
            count: g.count,
            discipline: Number((g.discipline / g.count).toFixed(2)),
            sufficiency: Number((g.sufficiency / g.count).toFixed(2)),
            honesty: Number((g.honesty / g.count).toFixed(2)),
            volunteer: Number((g.volunteer / g.count).toFixed(2)),
            gratitude: Number((g.gratitude / g.count).toFixed(2))
          };
        });

        // Sort by total score descending (optional)
        aggregatedData.sort((a, b) => {
          const totalA = a.discipline + a.sufficiency + a.honesty + a.volunteer + a.gratitude;
          const totalB = b.discipline + b.sufficiency + b.honesty + b.volunteer + b.gratitude;
          return totalB - totalA;
        });

        setData(aggregatedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    discipline: '#8b5cf6', // Purple
    sufficiency: '#10b981', // Emerald
    honesty: '#f59e0b', // Amber
    volunteer: '#ef4444', // Red
    gratitude: '#3b82f6' // Blue
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
        ไม่พบข้อมูลโครงการ
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px', flex: 1, overflowY: 'auto', boxSizing: 'border-box' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0, position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
        ค่าเฉลี่ยดัชนีคุณธรรม 5 ด้าน (แยกตามจังหวัด)
      </h3>
      
      {data.map((provData, idx) => (
        <div key={idx} style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{provData.province}</h4>
            <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>
              {provData.count} โครงการ
            </span>
          </div>
          
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[provData]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="province" hide />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'var(--font-thai)' }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontFamily: 'var(--font-thai)' }}
                  formatter={(value: any) => [`${typeof value === 'number' ? value.toFixed(1) : value}`, 'คะแนน']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontFamily: 'var(--font-thai)' }} />
                <Bar dataKey="discipline" name="วินัย" fill={colors.discipline} radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="sufficiency" name="พอเพียง" fill={colors.sufficiency} radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="honesty" name="สุจริต" fill={colors.honesty} radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="volunteer" name="จิตอาสา" fill={colors.volunteer} radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="gratitude" name="กตัญญู" fill={colors.gratitude} radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
};
