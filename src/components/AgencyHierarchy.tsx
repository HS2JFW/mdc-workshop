import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, ChevronRight, LayoutGrid, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PROVINCE_TO_REGION, REGION_NAMES, getDistrictsForProvince, getSubdistrictsForDistrict, getVillagesForSubdistrict } from '../utils/thaiGeography';

interface AgencyHierarchyProps {
  onAgencyFilterChange?: (selectedAgencies: string[]) => void;
  onGeographyFilterChange?: (selectedGeoNodes: string[]) => void;
  checkedGeographyNodes?: string[];
  viewMode?: 'overview' | 'map';
  setViewMode?: (mode: 'overview' | 'map') => void;
  hideContent?: boolean;
  restrictToChula?: boolean;
  hideTabs?: boolean;
}

interface TreeNode {
  id: string;
  labelTh: string;
  labelEn: string;
  badge?: {
    color: 'blue' | 'orange' | 'red';
    text: string;
  };
  children?: TreeNode[];
  isCheckedByDefault?: boolean;
}

export const AgencyHierarchy: React.FC<AgencyHierarchyProps> = ({ 
  onAgencyFilterChange, 
  onGeographyFilterChange,
  checkedGeographyNodes = [],
  viewMode = 'overview', 
  setViewMode = () => {},
  hideContent = false,
  restrictToChula = false,
  hideTabs = false
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [checkedNodes, setCheckedNodes] = useState<Record<string, boolean>>({});
  const [agencyTreeData, setAgencyTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelRef.current?.getBoundingClientRect().width || 250;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(600, startWidth + (moveEvent.clientX - startX)));
      if (panelRef.current) {
        panelRef.current.style.width = `${newWidth}px`;
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const nodeMap = new Map<string, TreeNode>();
      const roots: TreeNode[] = [];
      const defaultExpanded: Record<string, boolean> = {};
      
      // Initialize map
      data.forEach(item => {
        nodeMap.set(item.id, {
          id: item.id,
          labelTh: item.name,
          labelEn: '', // English mapping can be added here if available
          children: []
        });
        
        // Let's expand root level by default for UX
        if (!item.parent_id) {
           defaultExpanded[item.id] = true;
        }
      });
      
      // Build hierarchy
      data.forEach(item => {
        const node = nodeMap.get(item.id)!;
        if (item.parent_id && nodeMap.has(item.parent_id)) {
          nodeMap.get(item.parent_id)!.children!.push(node);
        } else {
          roots.push(node);
        }
      });
      
      let finalRoots = roots;
      if (restrictToChula) {
        const chulaItem = data.find(item => item.name.includes("จุฬาลงกรณ์มหาวิทยาลัย"));
        if (chulaItem) {
          const chulaNode = nodeMap.get(chulaItem.id);
          if (chulaNode) {
            finalRoots = [chulaNode];
            defaultExpanded[chulaNode.id] = true;
          }
        }
      }
      
      setAgencyTreeData(finalRoots);
      setExpandedNodes(defaultExpanded);
    } catch (err) {
      console.error('Error fetching agencies:', err);
    } finally {
      setLoading(false);
    }
  };

  const geographyTree = useMemo(() => {
    // 1. Group provinces by region
    const regionToProvinces: Record<string, string[]> = {};
    Object.keys(REGION_NAMES).forEach(reg => { regionToProvinces[reg] = []; });
    
    Object.entries(PROVINCE_TO_REGION).forEach(([prov, reg]) => {
      if (regionToProvinces[reg]) {
        regionToProvinces[reg].push(prov);
      }
    });

    // 2. Build Tree: Region -> Province -> District -> Subdistrict -> Village
    return Object.entries(REGION_NAMES).map(([regKey, regName]) => {
      const regId = `reg-${regKey}`;
      const isRegExpanded = expandedNodes[regId];
      
      const regNode: TreeNode = {
        id: regId,
        labelTh: regName,
        labelEn: '',
        children: isRegExpanded ? [] : [{ id: `dummy-${regId}`, labelTh: '', labelEn: '' }]
      };
      
      if (isRegExpanded) {
        const provinces = regionToProvinces[regKey].sort();
        regNode.children = provinces.map(prov => {
          const provId = `prov-${prov}`;
          const isProvExpanded = expandedNodes[provId];
          
          const provNode: TreeNode = {
            id: provId,
            labelTh: prov,
            labelEn: '',
            children: isProvExpanded ? [] : [{ id: `dummy-${provId}`, labelTh: '', labelEn: '' }]
          };
          
          if (isProvExpanded) {
            const districts = getDistrictsForProvince(prov);
            provNode.children = districts.map(dist => {
              const distId = `dist-${prov}-${dist}`;
              const isDistExpanded = expandedNodes[distId];
              
              const distNode: TreeNode = {
                id: distId,
                labelTh: dist,
                labelEn: '',
                children: isDistExpanded ? [] : [{ id: `dummy-${distId}`, labelTh: '', labelEn: '' }]
              };
              
              if (isDistExpanded) {
                 const subdistricts = getSubdistrictsForDistrict(dist);
                 distNode.children = subdistricts.map(sub => {
                   const subId = `sub-${prov}-${dist}-${sub}`;
                   const isSubExpanded = expandedNodes[subId];
                   
                   const subNode: TreeNode = {
                     id: subId,
                     labelTh: sub,
                     labelEn: '',
                     children: isSubExpanded ? [] : [{ id: `dummy-${subId}`, labelTh: '', labelEn: '' }]
                   };
                   
                   if (isSubExpanded) {
                     const villages = getVillagesForSubdistrict(sub);
                     subNode.children = villages.map(vil => ({
                       id: `vil-${prov}-${dist}-${sub}-${vil}`,
                       labelTh: vil,
                       labelEn: ''
                     }));
                   }
                   
                   return subNode;
                 });
              }
              return distNode;
            });
          }
          return provNode;
        });
      }
      return regNode;
    });
  }, [expandedNodes]);

  const treeData = viewMode === 'map' ? geographyTree : agencyTreeData;

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (viewMode === 'map') {
      if (onGeographyFilterChange) {
        const isCurrentlyChecked = checkedGeographyNodes.includes(id);
        const activeIds = isCurrentlyChecked 
          ? checkedGeographyNodes.filter(k => k !== id)
          : [...checkedGeographyNodes, id];
        onGeographyFilterChange(activeIds);
      }
    } else {
      const newChecked = { ...checkedNodes, [id]: !checkedNodes[id] };
      setCheckedNodes(newChecked);

      if (onAgencyFilterChange) {
        const activeIds = Object.keys(newChecked).filter(k => newChecked[k]);
        onAgencyFilterChange(activeIds);
      }
    }
  };

  // Node rendering helper (Unchanged to preserve exact UI)
  const renderNode = (node: TreeNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedNodes[node.id];
    
    let isChecked = false;
    if (viewMode === 'map') {
      isChecked = checkedGeographyNodes.includes(node.id);
    } else {
      isChecked = !!checkedNodes[node.id];
    }

    return (
      <div key={node.id} className="tree-node">
        <div 
          className="tree-row" 
          style={{ paddingLeft: `${depth * 10 + 6}px` }}
          onClick={(e) => hasChildren ? toggleExpand(node.id, e) : toggleCheck(node.id, e)}
        >
          {/* Arrow */}
          <span 
            className="tree-arrow"
            onClick={(e) => {
              if (hasChildren) {
                toggleExpand(node.id, e);
              }
            }}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : null}
          </span>

          {/* Checkbox */}
          <span 
            className={`tree-checkbox ${isChecked ? 'checked' : ''}`}
            onClick={(e) => toggleCheck(node.id, e)}
          />

          {/* Label Group */}
          <div className="tree-label-group">
            <span className="tree-label-th">{node.labelTh}</span>
            {node.labelEn && <span className="tree-label-en">{node.labelEn}</span>}
          </div>

          {/* Badge */}
          {node.badge && (
            <span className={`tree-badge ${node.badge.color}`}>
              {node.badge.text}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="tree-children">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sidebar-panel" ref={panelRef} style={{ position: 'relative' }}>
      {/* Resizer Handle */}
      <div 
        className="sidebar-resizer"
        onMouseDown={startResizing}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '6px',
          height: '100%',
          cursor: 'col-resize',
          zIndex: 10,
          backgroundColor: 'transparent',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      />
      {/* Title */}
      <div className="panel-header">
        <div className="panel-title-container">
          <div className="panel-title">
            Thailand Government<br />Project Analysis
          </div>
          <LayoutGrid size={16} className="panel-grid-icon" />
        </div>

        {/* Tabs */}
        {!hideTabs && (
          <div className="tabs-container">
            <button 
              className={`tab-btn ${viewMode === 'overview' ? 'active' : ''}`}
              onClick={() => setViewMode('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              Country Map
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {!hideContent && (
        <div className="panel-content">
          <div className="section-label-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-label">{viewMode === 'map' ? 'Hierarchy Country' : 'Hierarchy & Agency'}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (viewMode === 'map' && onGeographyFilterChange) {
                  onGeographyFilterChange([]);
                } else {
                  setCheckedNodes({});
                  if (onAgencyFilterChange) {
                    onAgencyFilterChange([]);
                  }
                }
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#94a3b8' }}
              title="Clear all selections"
            >
              <XCircle size={16} className="panel-grid-icon" style={{ margin: 0 }} />
            </button>
          </div>

          {/* Tree List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {loading ? (
               <div style={{ padding: '10px', fontSize: '12px', color: '#64748b' }}>Loading...</div>
            ) : treeData.length > 0 ? (
               treeData.map(node => renderNode(node, 0))
            ) : (
               <div style={{ padding: '10px', fontSize: '12px', color: '#64748b' }}>No agencies found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
