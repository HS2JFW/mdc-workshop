import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, BarChart2, AlignLeft, Target, PieChart as PieChartIcon, CircleDashed, Table as TableIcon, Sparkles, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell
} from 'recharts';

export interface OfficeData {
  id: string;
  name: string;
  type: string;
  address: string;
  contact: string;
  subdistrict: string;
  virtue?: number;
  discipline?: number;
  sufficiency?: number;
  honesty?: number;
  volunteer?: number;
  gratitude?: number;
}

export interface TorData {
  id: string;
  project: string;
  budget: string;
  rawBudget?: number;
  duration: string;
  virtue: number;
  subdistrict: string;
  discipline?: number;
  sufficiency?: number;
  honesty?: number;
  volunteer?: number;
  gratitude?: number;
  type?: string;
  status?: string;
}

export interface LocationData {
  province: string;
  district: string;
  subdistrict: string;
  village: string;
}

export interface OptionData {
  id: string | number;
  label: string;
}

export interface DataTableProps {
  searchQuery?: string;
  activeAgencies?: string[];
  hideSubAgencies?: boolean;
}

type SortFieldOffice = keyof OfficeData;
type SortFieldTor = keyof TorData;
type ViewMode = 'table' | 'bar-vertical' | 'bar-horizontal' | 'radar' | 'pie' | 'donuts';

const ITEMS_PER_PAGE = 10;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#d946ef', '#14b8a6', '#f43f5e', '#8b5cf6', '#eab308'];
const VIRTUE_KEYS = [
  { key: 'discipline', name: 'วินัย', color: '#8b5cf6' },
  { key: 'sufficiency', name: 'พอเพียง', color: '#10b981' },
  { key: 'honesty', name: 'สุจริต', color: '#f59e0b' },
  { key: 'volunteer', name: 'จิตอาสา', color: '#ef4444' },
  { key: 'gratitude', name: 'กตัญญู', color: '#3b82f6' }
];

export const DataTable: React.FC<DataTableProps> = ({ searchQuery, activeAgencies, hideSubAgencies }) => {
  const [offices, setOffices] = useState<OfficeData[]>([]);
  const [tors, setTors] = useState<TorData[]>([]);
  const [activeAgencyNames, setActiveAgencyNames] = useState<string>('');

  const [officeSortField, setOfficeSortField] = useState<SortFieldOffice>('name');
  const [officeSortAsc, setOfficeSortAsc] = useState<boolean>(true);
  
  const [torSortField, setTorSortField] = useState<SortFieldTor>('project');
  const [torSortAsc, setTorSortAsc] = useState<boolean>(true);

  const [selectedOffices, setSelectedOffices] = useState<Record<string, boolean>>({});
  const [selectedTors, setSelectedTors] = useState<Record<string, boolean>>({});

  const [officePage, setOfficePage] = useState(1);
  const [torPage, setTorPage] = useState(1);
  
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isSummarized, setIsSummarized] = useState<boolean>(false);
  const [analyzedTor, setAnalyzedTor] = useState<TorData | null>(null);

  // New Filter States
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [types, setTypes] = useState<OptionData[]>([]);
  const [statuses, setStatuses] = useState<OptionData[]>([]);
  
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBudget, setFilterBudget] = useState<string>('');
  const [filterProvince, setFilterProvince] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');
  const [filterSubdistrict, setFilterSubdistrict] = useState<string>('');
  const [filterVillage, setFilterVillage] = useState<string>('');

  const [totalOfficePages, setTotalOfficePages] = useState(1);
  const [totalTorPages, setTotalTorPages] = useState(1);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    setOfficePage(1);
    setTorPage(1);
  }, [searchQuery, filterType, filterStatus, filterBudget, filterProvince, filterDistrict, filterSubdistrict, filterVillage]);

  useEffect(() => {
    fetchAgencies();
  }, [searchQuery, officePage, activeAgencies]);

  useEffect(() => {
    fetchTors();
  }, [searchQuery, torPage, filterType, filterStatus, filterBudget, filterProvince, filterDistrict, filterSubdistrict, filterVillage, selectedOffices, activeAgencies]);

  const fetchOptions = async () => {
    const { data: locData } = await supabase.rpc('get_unique_locations');
    if (locData) setLocations(locData as LocationData[]);
    
    const { data: typeData } = await supabase.from('tor_types').select('id, type, method').order('id');
    if (typeData) setTypes(typeData.map(t => ({ id: t.id, label: `${t.type} - ${t.method}` })));
    
    const { data: statusData } = await supabase.from('tor_status').select('id, status').order('id');
    if (statusData) setStatuses(statusData.map(s => ({ id: s.id, label: s.status })));
  };

  const fetchAgencies = async () => {
    const start = (officePage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    let query = supabase.from('agencies').select('*', { count: 'exact' }).range(start, end);
    if (searchQuery && searchQuery.trim() !== '') query = query.ilike('name', `%${searchQuery}%`);
    if (activeAgencies && activeAgencies.length > 0) {
      query = query.in('parent_id', activeAgencies);
    }

    const { data: agencyData, count } = await query;
      
    if (count !== null) {
      setTotalOfficePages(Math.max(1, Math.ceil(count / ITEMS_PER_PAGE)));
    }
      
    if (agencyData) {
      setOffices(agencyData.map(a => ({
        id: a.id,
        name: a.name,
        type: a.level_id === 5 ? 'กรม' : (a.level_id === 3 ? 'กระทรวง' : 'หน่วยงานรัฐ'),
        address: 'ส่วนกลาง',
        contact: '-',
        subdistrict: 'กรุงเทพมหานคร',
        virtue: a.calculated_average || 0,
        discipline: a.discipline || 0,
        sufficiency: a.sufficiency || 0,
        honesty: a.honesty || 0,
        volunteer: a.volunteer || 0,
        gratitude: a.gratitude || 0
      })));
    } else {
      setOffices([]);
    }

    // Fetch parent agency names for the header
    if (activeAgencies && activeAgencies.length > 0) {
      const { data: namesData } = await supabase.from('agencies').select('name').in('id', activeAgencies);
      if (namesData && namesData.length > 0) {
        setActiveAgencyNames(namesData.map(n => n.name).join(', '));
      } else {
        setActiveAgencyNames('');
      }
    } else {
      setActiveAgencyNames('ภาพรวมทุกหน่วยงาน');
    }
  };

  const fetchTors = async () => {
    const start = (torPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    let query = supabase.from('tor_projects').select('*, tor_types(type, method), tor_status(status)', { count: 'exact' }).range(start, end);
    if (searchQuery && searchQuery.trim() !== '') query = query.ilike('name', `%${searchQuery}%`);

    // Filter by selected sub-government offices in the table
    const checkedOfficeIds = Object.keys(selectedOffices).filter(k => selectedOffices[k]);
    if (checkedOfficeIds.length > 0) {
      query = query.in('agency_id', checkedOfficeIds);
    } else if (activeAgencies && activeAgencies.length > 0) {
      // If none selected in table, filter by the parent agencies selected in the sidebar
      const { data: subAgencies } = await supabase.from('agencies').select('id').in('parent_id', activeAgencies);
      const subAgencyIds = subAgencies ? subAgencies.map(a => a.id) : [];
      query = query.in('agency_id', [...subAgencyIds, ...activeAgencies]);
    }

    if (filterType) query = query.eq('type_id', filterType);
    if (filterStatus) query = query.eq('status_id', filterStatus);
    if (filterProvince) query = query.eq('province', filterProvince);
    if (filterDistrict) query = query.eq('district', filterDistrict);
    if (filterSubdistrict) query = query.eq('subdistrict', filterSubdistrict);
    if (filterVillage) query = query.eq('village', filterVillage);
    
    if (filterBudget) {
      const parts = filterBudget.split('-');
      if (parts[0] !== '0') query = query.gte('budget', parseInt(parts[0], 10));
      if (parts[1] && parts[1] !== 'null') query = query.lt('budget', parseInt(parts[1], 10));
    }

    const { data: torData, count } = await query;

    if (count !== null) {
      setTotalTorPages(Math.max(1, Math.ceil(count / ITEMS_PER_PAGE)));
    }

    if (torData) {
      setTors(torData.map(t => {
        return {
          id: t.id,
          project: t.name,
          budget: `฿${t.budget?.toLocaleString()}`,
          rawBudget: t.budget || 0,
          duration: `${t.end_date ? 'Custom' : '12 months'}`,
          virtue: t.calculated_average || 0,
          discipline: t.discipline || 0,
          sufficiency: t.sufficiency || 0,
          honesty: t.honesty || 0,
          volunteer: t.volunteer || 0,
          gratitude: t.gratitude || 0,
          subdistrict: t.subdistrict || 'กรุงเทพมหานคร',
          type: t.tor_types ? `${t.tor_types.type} - ${t.tor_types.method}` : '-',
          status: t.tor_status ? t.tor_status.status : '-'
        };
      }));
    } else {
      setTors([]);
    }
  };

  const handleOfficeSort = (field: SortFieldOffice) => {
    if (officeSortField === field) setOfficeSortAsc(!officeSortAsc);
    else { setOfficeSortField(field); setOfficeSortAsc(true); }
  };

  const sortedOffices = [...offices].sort((a, b) => {
    const valA = a[officeSortField] || '';
    const valB = b[officeSortField] || '';
    if (valA < valB) return officeSortAsc ? -1 : 1;
    if (valA > valB) return officeSortAsc ? 1 : -1;
    return 0;
  });

  const handleTorSort = (field: SortFieldTor) => {
    if (torSortField === field) setTorSortAsc(!torSortAsc);
    else { setTorSortField(field); setTorSortAsc(true); }
  };

  const sortedTors = [...tors].sort((a, b) => {
    const valA = a[torSortField];
    const valB = b[torSortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
       return torSortAsc ? valA - valB : valB - valA;
    }
    const strA = String(valA || '');
    const strB = String(valB || '');
    if (strA < strB) return torSortAsc ? -1 : 1;
    if (strA > strB) return torSortAsc ? 1 : -1;
    return 0;
  });

  const toggleOfficeSelect = (id: string) => setSelectedOffices(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleTorSelect = (id: string) => setSelectedTors(prev => ({ ...prev, [id]: !prev[id] }));

  const renderBadge = (score: number) => {
    const className = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
    return <span className={`table-pill ${className}`}>{score.toFixed(1)}</span>;
  };

  const availableProvinces = Array.from(new Set(locations.map(l => l.province))).sort();
  const availableDistricts = filterProvince 
    ? Array.from(new Set(locations.filter(l => l.province === filterProvince).map(l => l.district))).sort() 
    : [];
  const availableSubdistricts = filterDistrict 
    ? Array.from(new Set(locations.filter(l => l.province === filterProvince && l.district === filterDistrict).map(l => l.subdistrict))).sort() 
    : [];
  const availableVillages = filterSubdistrict 
    ? Array.from(new Set(locations.filter(l => l.province === filterProvince && l.district === filterDistrict && l.subdistrict === filterSubdistrict).map(l => l.village))).sort() 
    : [];

  const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
    if (totalPages === 0) return null;
    
    const maxPages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = startPage + maxPages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', gap: '8px', borderTop: '1px solid #e2e8f0', background: '#fff', margin: 'auto -16px -16px -16px', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
        <button onClick={() => setPage(1)} disabled={currentPage === 1} className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#cbd5e1' : '#64748b', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
          <ChevronsLeft size={16} />
        </button>
        <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#cbd5e1' : '#64748b', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
          <ChevronLeft size={16} />
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => setPage(p)} className={`pagination-number ${currentPage === p ? 'active' : ''}`} style={{ width: '32px', height: '32px', borderRadius: '6px', border: currentPage === p ? '1px solid #bfdbfe' : '1px solid transparent', background: currentPage === p ? '#eff6ff' : 'transparent', color: currentPage === p ? '#3b82f6' : '#64748b', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            {p}
          </button>
        ))}
        <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', color: currentPage === totalPages ? '#cbd5e1' : '#64748b', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
          <ChevronRight size={16} />
        </button>
        <button onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', color: currentPage === totalPages ? '#cbd5e1' : '#64748b', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
          <ChevronsRight size={16} />
        </button>
      </div>
    );
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setFilterProvince(e.target.value); setFilterDistrict(''); setFilterSubdistrict(''); setFilterVillage(''); };
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setFilterDistrict(e.target.value); setFilterSubdistrict(''); setFilterVillage(''); };
  const handleSubdistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setFilterSubdistrict(e.target.value); setFilterVillage(''); };

  const getSummarizedData = () => {
    if (tors.length === 0) return [];
    let sumDis = 0, sumSuf = 0, sumHon = 0, sumVol = 0, sumGra = 0;
    tors.forEach(t => {
      sumDis += t.discipline || 0; sumSuf += t.sufficiency || 0; sumHon += t.honesty || 0; sumVol += t.volunteer || 0; sumGra += t.gratitude || 0;
    });
    const len = tors.length;
    return [{
      project: 'Average (All Projects)',
      budget: '-',
      discipline: sumDis / len, sufficiency: sumSuf / len, honesty: sumHon / len, volunteer: sumVol / len, gratitude: sumGra / len
    }];
  };

  const getRadarDataSummarized = () => {
    const sumData = getSummarizedData()[0];
    if (!sumData) return [];
    return [
      { subject: 'วินัย', displayName: `วินัย ${sumData.discipline.toFixed(1)}`, A: sumData.discipline, fullMark: 5 },
      { subject: 'พอเพียง', displayName: `พอเพียง ${sumData.sufficiency.toFixed(1)}`, A: sumData.sufficiency, fullMark: 5 },
      { subject: 'สุจริต', displayName: `สุจริต ${sumData.honesty.toFixed(1)}`, A: sumData.honesty, fullMark: 5 },
      { subject: 'จิตอาสา', displayName: `จิตอาสา ${sumData.volunteer.toFixed(1)}`, A: sumData.volunteer, fullMark: 5 },
      { subject: 'กตัญญู', displayName: `กตัญญู ${sumData.gratitude.toFixed(1)}`, A: sumData.gratitude, fullMark: 5 }
    ];
  };

  const getSingleProjectData = (pid: string) => {
    const t = tors.find(x => x.id === pid) || tors[0];
    if (!t) return [];
    return [
      { subject: 'วินัย', displayName: `วินัย ${(t.discipline || 0).toFixed(1)}`, A: t.discipline || 0 },
      { subject: 'พอเพียง', displayName: `พอเพียง ${(t.sufficiency || 0).toFixed(1)}`, A: t.sufficiency || 0 },
      { subject: 'สุจริต', displayName: `สุจริต ${(t.honesty || 0).toFixed(1)}`, A: t.honesty || 0 },
      { subject: 'จิตอาสา', displayName: `จิตอาสา ${(t.volunteer || 0).toFixed(1)}`, A: t.volunteer || 0 },
      { subject: 'กตัญญู', displayName: `กตัญญู ${(t.gratitude || 0).toFixed(1)}`, A: t.gratitude || 0 }
    ];
  };

  const CustomBarTooltip = ({ active, payload, label, hideBudget }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#fff', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <p style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{label || data.project}</p>
          {!isSummarized && !hideBudget && <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>Budget: {data.budget}</p>}
          <div style={{ display: 'grid', gap: '4px' }}>
            {payload.map((p: any) => (
              <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '13px' }}>
                <span style={{ color: p.color }}>{p.name}:</span>
                <span style={{ fontWeight: 600 }}>{Number(p.value).toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderProjectCard = (projectData: any, chartRender: React.ReactNode, index: number) => (
    <div key={projectData.id || `proj-${index}`} style={{ 
      background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', padding: '20px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
    }}>
      <div style={{ marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
        <h5 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 6px 0' }}>{projectData.project}</h5>
        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}/>
            Budget: <strong style={{ color: '#0f172a' }}>{projectData.budget}</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}/>
            Type: <strong style={{ color: '#0f172a' }}>{projectData.type || '-'}</strong>
          </span>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        {chartRender}
      </div>
    </div>
  );

  const renderViewContent = () => {
    if (viewMode === 'table') {
      return (
        <div className="table-wrapper" style={{ maxHeight: 'none', overflowY: 'visible' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '32px' }} />
                <th onClick={() => handleTorSort('project')} style={{ cursor: 'pointer' }}>Project Name</th>
                <th onClick={() => handleTorSort('budget')} style={{ cursor: 'pointer' }}>Budget</th>
                <th onClick={() => handleTorSort('type')} style={{ cursor: 'pointer' }}>Type</th>
                <th onClick={() => handleTorSort('status')} style={{ cursor: 'pointer' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedTors.map((tor) => (
                <React.Fragment key={tor.id}>
                  <tr style={{ borderBottom: 'none' }}>
                    <td style={{ verticalAlign: 'middle', borderBottom: 'none' }}>
                      <input type="checkbox" checked={!!selectedTors[tor.id]} onChange={() => toggleTorSelect(tor.id)} className="table-checkbox" />
                    </td>
                    <td className="text-truncate-cell" style={{ fontWeight: 600, color: '#0f172a', maxWidth: '300px', borderBottom: 'none' }} title={tor.project}>{tor.project}</td>
                    <td style={{ borderBottom: 'none' }}>{tor.budget}</td>
                    <td className="text-truncate-cell" title={tor.type} style={{ maxWidth: '150px', borderBottom: 'none' }}>{tor.type}</td>
                    <td className="text-truncate-cell" title={tor.status} style={{ maxWidth: '150px', borderBottom: 'none' }}>{tor.status}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 0 }}></td>
                    <td colSpan={4} style={{ paddingTop: 0, paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', overflowX: 'auto', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>วินัย</span>
                          <div style={{ backgroundColor: '#8b5cf6', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{tor.discipline}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>พอเพียง</span>
                          <div style={{ backgroundColor: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{tor.sufficiency}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>สุจริต</span>
                          <div style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{tor.honesty}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>จิตอาสา</span>
                          <div style={{ backgroundColor: '#ef4444', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{tor.volunteer}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>กตัญญู</span>
                          <div style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{tor.gratitude}</div>
                        </div>
                        <div style={{ width: '1px', height: '32px', backgroundColor: '#e2e8f0', margin: '0 8px' }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
                          {renderBadge(tor.virtue)}
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                          <button 
                            onClick={() => setAnalyzedTor(tor)}
                            style={{ 
                              background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', 
                              padding: '8px 12px', fontSize: '12px', color: '#1d4ed8', fontWeight: 600,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            <Sparkles size={14} color="#3b82f6" /> บทวิเคราะห์
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {renderPagination(torPage, totalTorPages, setTorPage)}
        </div>
      );
    }

    if (tors.length === 0) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>ไม่พบข้อมูลสำหรับสร้างกราฟ</div>;

    if (viewMode === 'bar-vertical') {
      if (isSummarized) {
        return (
          <div style={{ width: '100%', height: 450, padding: '20px' }}>
            <ResponsiveContainer>
              <BarChart data={getSummarizedData()} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="project" tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis domain={[-5, 5]} tick={{fill: '#64748b'}} />
                <RechartsTooltip content={<CustomBarTooltip hideBudget />} cursor={{fill: '#f1f5f9'}} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                {VIRTUE_KEYS.map((vk) => <Bar key={vk.key} dataKey={vk.key} name={vk.name} fill={vk.color} radius={[4, 4, 0, 0]} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      } else {
        return (
          <div style={{ padding: '20px', background: '#f8fafc' }}>
            {sortedTors.map((tor, idx) => renderProjectCard(tor, (
              <div style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={[tor]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="project" tick={false} axisLine={false} />
                    <YAxis domain={[-5, 5]} tick={{fill: '#64748b'}} />
                    <RechartsTooltip content={<CustomBarTooltip hideBudget />} cursor={{fill: '#f1f5f9'}} />
                    <Legend />
                    {VIRTUE_KEYS.map((vk) => <Bar key={vk.key} dataKey={vk.key} name={vk.name} fill={vk.color} radius={[4, 4, 0, 0]} />)}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ), idx))}
            {renderPagination(torPage, totalTorPages, setTorPage)}
          </div>
        );
      }
    }

    if (viewMode === 'bar-horizontal') {
      if (isSummarized) {
        return (
          <div style={{ width: '100%', height: 300, padding: '20px' }}>
            <ResponsiveContainer>
              <BarChart layout="vertical" data={getSummarizedData()} margin={{ top: 20, right: 30, left: 150, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[-5, 5]} tick={{fill: '#64748b'}} />
                <YAxis dataKey="project" type="category" width={140} tick={{fontSize: 12, fill: '#64748b'}} />
                <RechartsTooltip content={<CustomBarTooltip hideBudget />} cursor={{fill: '#f1f5f9'}} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                {VIRTUE_KEYS.map((vk) => <Bar key={vk.key} dataKey={vk.key} name={vk.name} fill={vk.color} radius={[0, 4, 4, 0]} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      } else {
        return (
          <div style={{ padding: '20px', background: '#f8fafc' }}>
            {sortedTors.map((tor, idx) => renderProjectCard(tor, (
              <div style={{ height: 250 }}>
                <ResponsiveContainer>
                  <BarChart layout="vertical" data={[tor]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[-5, 5]} tick={{fill: '#64748b'}} />
                    <YAxis dataKey="project" type="category" tick={false} axisLine={false} width={10} />
                    <RechartsTooltip content={<CustomBarTooltip hideBudget />} cursor={{fill: '#f1f5f9'}} />
                    <Legend />
                    {VIRTUE_KEYS.map((vk) => <Bar key={vk.key} dataKey={vk.key} name={vk.name} fill={vk.color} radius={[0, 4, 4, 0]} />)}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ), idx))}
            {renderPagination(torPage, totalTorPages, setTorPage)}
          </div>
        );
      }
    }

    if (viewMode === 'radar') {
      if (isSummarized) {
        return (
          <div style={{ width: '100%', height: 450, padding: '20px' }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarDataSummarized()}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="displayName" tick={{fill: '#334155', fontWeight: 600}} />
                <PolarRadiusAxis angle={30} domain={[-5, 5]} tick={{fill: '#94a3b8'}} />
                <Radar name="Average Virtue Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                <RechartsTooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );
      } else {
        return (
          <div style={{ padding: '20px', background: '#f8fafc' }}>
            {sortedTors.map((tor, idx) => renderProjectCard(tor, (
              <div style={{ height: 350 }}>
                <ResponsiveContainer>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getSingleProjectData(tor.id)}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="displayName" tick={{fill: '#334155', fontWeight: 600}} />
                    <PolarRadiusAxis angle={30} domain={[-5, 5]} tick={{fill: '#94a3b8'}} />
                    <Radar name={tor.project} dataKey="A" stroke={COLORS[idx % COLORS.length]} fill={COLORS[idx % COLORS.length]} fillOpacity={0.5} />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ), idx))}
            {renderPagination(torPage, totalTorPages, setTorPage)}
          </div>
        );
      }
    }

    if (viewMode === 'pie') {
      if (isSummarized) {
        const pData = getRadarDataSummarized().map(d => ({ name: d.subject, value: d.A }));
        return (
          <div style={{ width: '100%', height: 450, padding: '20px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`} outerRadius={130} fill="#8884d8" dataKey="value">
                  {pData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip formatter={(val: any) => typeof val === 'number' ? val.toFixed(2) : val} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      } else {
        return (
          <div style={{ padding: '20px', background: '#f8fafc' }}>
            {sortedTors.map((tor, idx) => {
              const pData = getSingleProjectData(tor.id).map(d => ({ name: d.subject, value: d.A }));
              return renderProjectCard(tor, (
                <div style={{ height: 350 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                        {pData.map((_entry, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip formatter={(val: any) => typeof val === 'number' ? val.toFixed(2) : val} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ), idx);
            })}
            {renderPagination(torPage, totalTorPages, setTorPage)}
          </div>
        );
      }
    }

    if (viewMode === 'donuts') {
      if (isSummarized) {
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '30px', width: '100%' }}>
            {getRadarDataSummarized().map((d, index) => (
              <div key={d.subject} style={{ height: '200px', position: 'relative', background: '#f8fafc', borderRadius: '12px', padding: '10px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={[{name: d.subject, value: d.A}, {name: 'Remaining', value: Math.max(0, 10 - d.A)}]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                      <Cell fill={COLORS[index % COLORS.length]} />
                      <Cell fill="#e2e8f0" />
                    </Pie>
                    <RechartsTooltip formatter={(val: any) => typeof val === 'number' ? val.toFixed(2) : val} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS[index % COLORS.length] }}>{d.A.toFixed(1)}</div>
                  <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>{d.subject}</div>
                </div>
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div style={{ padding: '20px', background: '#f8fafc' }}>
            {sortedTors.map((tor, idx) => {
              const activeData = getSingleProjectData(tor.id);
              return renderProjectCard(tor, (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', padding: '10px' }}>
                  {activeData.map((d, i) => (
                    <div key={d.subject} style={{ height: '160px', position: 'relative', background: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #f1f5f9' }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={[{name: d.subject, value: d.A}, {name: 'Remaining', value: Math.max(0, 10 - d.A)}]} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                            <Cell fill={COLORS[i % COLORS.length]} />
                            <Cell fill="#e2e8f0" />
                          </Pie>
                          <RechartsTooltip content={({ payload, label }) => {
                            if (payload && payload.length) {
                              return (
                                <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                  <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
                                  {payload.map((entry: any, index: number) => (
                                    <p key={index} style={{ margin: 0, color: entry.color }}>
                                      {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value} ({entry.payload.percent !== undefined ? (entry.payload.percent * 100).toFixed(0) : 0}%)
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: COLORS[i % COLORS.length] }}>{d.A.toFixed(1)}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{d.subject}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ), idx);
            })}
            {renderPagination(torPage, totalTorPages, setTorPage)}
          </div>
        );
      }
    }
    
    return null;
  };

  return (
    <div className="tables-row-grid">
      {/* Government Offices Table */}
      {!hideSubAgencies && (
      <div className="table-card" style={{ marginBottom: '24px' }}>
        <div className="table-header">
          <div className="table-title-group">
            <h4 className="table-title-th">Sub Government Offices</h4>
            <span className="table-title-en">หน่วยงาน ภายใต้สังกัด</span>
          </div>
        </div>

        <div className="table-wrapper" style={{ maxHeight: 'none', overflowY: 'visible' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }} />
                <th onClick={() => handleOfficeSort('name')} style={{ cursor: 'pointer' }}>Name {officeSortField === 'name' ? (officeSortAsc ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleOfficeSort('type')} style={{ cursor: 'pointer' }}>Type {officeSortField === 'type' ? (officeSortAsc ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleOfficeSort('address')} style={{ cursor: 'pointer' }}>Address {officeSortField === 'address' ? (officeSortAsc ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleOfficeSort('contact')} style={{ cursor: 'pointer' }}>Contact {officeSortField === 'contact' ? (officeSortAsc ? '▲' : '▼') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {sortedOffices.map((office) => (
                <tr key={office.id}>
                  <td><input type="checkbox" checked={!!selectedOffices[office.id]} onChange={() => toggleOfficeSelect(office.id)} className="table-checkbox" /></td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{office.name}</td>
                  <td>{office.type}</td>
                  <td className="text-truncate-cell" title={office.address}>{office.address}</td>
                  <td>{office.contact}</td>
                </tr>
              ))}
              {sortedOffices.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>ไม่พบข้อมูล</td></tr>}
            </tbody>
          </table>
        </div>
        {renderPagination(officePage, totalOfficePages, setOfficePage)}
      </div>
      )}

      {/* Projects Score Visualization */}
      <div className="table-card">
        {!hideSubAgencies && (
          <div className="table-header">
            <div className="table-title-group">
              <h4 className="table-title-th">Projects Score {activeAgencyNames ? `- ${activeAgencyNames}` : ''}</h4>
              <span className="table-title-en">รายการโครงการโดยละเอียด และดัชนีคุณธรรม 5 ด้าน</span>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 200px' }}>
            <option value="">-- All Types --</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 200px' }}>
            <option value="">-- All Statuses --</option>
            {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={filterBudget} onChange={(e) => setFilterBudget(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 200px' }}>
            <option value="">-- All Budgets --</option>
            <option value="0-500000">&lt; 500,000</option>
            <option value="500000-2000000">500,000 - 2,000,000</option>
            <option value="2000000-5000000">2,000,000 - 5,000,000</option>
            <option value="5000000-10000000">5,000,000 - 10,000,000</option>
            <option value="10000000-50000000">10,000,000 - 50,000,000</option>
            <option value="50000000-100000000">50,000,000 - 100,000,000</option>
            <option value="100000000-500000000">100,000,000 - 500,000,000</option>
            <option value="500000000-1000000000">500,000,000 - 1,000,000,000</option>
            <option value="1000000000-null">&gt; 1,000,000,000</option>
          </select>
          <select value={filterProvince} onChange={handleProvinceChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 150px' }}>
            <option value="">-- Province --</option>
            {availableProvinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterDistrict} onChange={handleDistrictChange} disabled={!filterProvince} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 150px' }}>
            <option value="">-- District --</option>
            {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterSubdistrict} onChange={handleSubdistrictChange} disabled={!filterDistrict} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 150px' }}>
            <option value="">-- Subdistrict --</option>
            {availableSubdistricts.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterVillage} onChange={(e) => setFilterVillage(e.target.value)} disabled={!filterSubdistrict} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1 1 150px' }}>
            <option value="">-- Village --</option>
            {availableVillages.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Navigator Bar with Summarize Checkbox */}
        <div className="navigator-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '12px 16px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button onClick={() => setViewMode('table')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '6px', background: viewMode === 'table' ? '#eff6ff' : 'transparent', color: viewMode === 'table' ? '#3b82f6' : '#64748b', border: viewMode === 'table' ? '1px solid #bfdbfe' : '1px solid transparent', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
              <TableIcon size={16} /> ตาราง
            </button>
            <button onClick={() => setViewMode('bar-vertical')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '6px', background: viewMode === 'bar-vertical' ? '#eff6ff' : 'transparent', color: viewMode === 'bar-vertical' ? '#3b82f6' : '#64748b', border: viewMode === 'bar-vertical' ? '1px solid #bfdbfe' : '1px solid transparent', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
              <BarChart2 size={16} /> กราฟแท่งแนวตั้ง
            </button>
            <button onClick={() => setViewMode('bar-horizontal')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '6px', background: viewMode === 'bar-horizontal' ? '#eff6ff' : 'transparent', color: viewMode === 'bar-horizontal' ? '#3b82f6' : '#64748b', border: viewMode === 'bar-horizontal' ? '1px solid #bfdbfe' : '1px solid transparent', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
              <AlignLeft size={16} /> กราฟแท่งแนวนอน
            </button>
            <button onClick={() => setViewMode('radar')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '6px', background: viewMode === 'radar' ? '#eff6ff' : 'transparent', color: viewMode === 'radar' ? '#3b82f6' : '#64748b', border: viewMode === 'radar' ? '1px solid #bfdbfe' : '1px solid transparent', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
              <Target size={16} /> ค่าพลัง 5 ด้าน
            </button>
            <button onClick={() => setViewMode('pie')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '6px', background: viewMode === 'pie' ? '#eff6ff' : 'transparent', color: viewMode === 'pie' ? '#3b82f6' : '#64748b', border: viewMode === 'pie' ? '1px solid #bfdbfe' : '1px solid transparent', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
              <PieChartIcon size={16} /> สัดส่วนคะแนนรวม
            </button>
            <button onClick={() => setViewMode('donuts')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '6px', background: viewMode === 'donuts' ? '#eff6ff' : 'transparent', color: viewMode === 'donuts' ? '#3b82f6' : '#64748b', border: viewMode === 'donuts' ? '1px solid #bfdbfe' : '1px solid transparent', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
              <CircleDashed size={16} /> ดัชนีรายด้าน
            </button>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#334155', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <input 
                type="checkbox" 
                checked={isSummarized} 
                onChange={(e) => setIsSummarized(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
              />
              สรุปรวมทุกโครงการ
            </label>
          </div>
        </div>

        {/* Dynamic View Content */}
        {renderViewContent()}
        
      </div>

      {analyzedTor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '700px', maxWidth: '90%', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>บทวิเคราะห์เหตุผลการให้คะแนน</h2>
              <button onClick={() => setAnalyzedTor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#1e3a8a' }}>{analyzedTor.project}</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                งบประมาณ: {analyzedTor.budget} | ประเภท: {analyzedTor.type || '-'}
              </p>
              
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>บทวิเคราะห์การประเมินดัชนีคุณธรรม 5 ด้าน</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', borderLeft: '4px solid #8b5cf6', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a' }}>1. วินัย (Discipline)</strong>
                    <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>{analyzedTor.discipline} / 5</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {(analyzedTor.discipline || 0) >= 3 ? 'มีการวางแผนงบประมาณและระยะเวลาที่ชัดเจน ปฏิบัติตามระเบียบข้อบังคับอย่างเคร่งครัด' : 'ควรเพิ่มความเข้มงวดในการเบิกจ่ายและการควบคุมระยะเวลาโครงการ'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderLeft: '4px solid #10b981', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a' }}>2. พอเพียง (Sufficiency)</strong>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>{analyzedTor.sufficiency} / 5</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {(analyzedTor.sufficiency || 0) >= 3 ? 'ใช้งบประมาณได้อย่างคุ้มค่า เน้นการใช้ทรัพยากรที่มีในท้องถิ่นให้เกิดประโยชน์สูงสุด' : 'ควรพิจารณาปรับลดค่าใช้จ่ายที่ไม่จำเป็น และเน้นความคุ้มค่าในระยะยาว'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderLeft: '4px solid #f59e0b', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a' }}>3. สุจริต (Honesty)</strong>
                    <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{analyzedTor.honesty} / 5</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {(analyzedTor.honesty || 0) >= 3 ? 'กระบวนการจัดซื้อจัดจ้างโปร่งใส สามารถตรวจสอบได้ทุกขั้นตอน มีการเปิดเผยข้อมูลแก่สาธารณะ' : 'ควรเพิ่มการเปิดเผยข้อมูลโครงการให้ประชาชนตรวจสอบได้ง่ายขึ้น'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a' }}>4. จิตอาสา (Volunteer)</strong>
                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{analyzedTor.volunteer} / 5</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {(analyzedTor.volunteer || 0) >= 3 ? 'เปิดโอกาสให้ประชาชนและอาสาสมัครมีส่วนร่วมในการขับเคลื่อนโครงการอย่างเป็นรูปธรรม' : 'ยังขาดการมีส่วนร่วมจากภาคประชาชน ควรเพิ่มกิจกรรมที่ให้ชุมชนเข้ามามีบทบาท'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderLeft: '4px solid #3b82f6', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a' }}>5. กตัญญู (Gratitude)</strong>
                    <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{analyzedTor.gratitude} / 5</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {(analyzedTor.gratitude || 0) >= 3 ? 'คำนึงถึงผลกระทบต่อสิ่งแวดล้อมและวัฒนธรรมท้องถิ่น มีการตอบแทนและดูแลรักษาสิ่งแวดล้อม' : 'ควรเพิ่มแนวทางการอนุรักษ์สิ่งแวดล้อมหรือการสืบสานวัฒนธรรมท้องถิ่นในโครงการ'}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setAnalyzedTor(null)}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
