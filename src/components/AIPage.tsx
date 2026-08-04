import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { PROVINCE_TO_REGION } from '../utils/thaiGeography';

import { AgencyHierarchy } from './AgencyHierarchy';
import { InteractiveMap } from './InteractiveMap';
import type { DrilldownLevel } from './InteractiveMap';
import { ChartsPanel } from './ChartsPanel';
import { DataTable } from './DataTable';
import { ActionWidgets, CommunityWidget } from './ActionWidgets';
import { AIWorkspaceZone } from './AIWorkspaceZone';

interface AIPageProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: 'TH' | 'EN';
  setLanguage: (lang: 'TH' | 'EN') => void;

  // New props for Policy Analysis layout
  viewMode: 'overview' | 'map';
  setViewMode: (mode: 'overview' | 'map') => void;
  handleAgencyFilterChange: (selectedIds: string[]) => void;
  currentLevel: DrilldownLevel;
  setCurrentLevel: (level: DrilldownLevel) => void;
  selectedProvince: string | null;
  setSelectedProvince: (province: string | null) => void;
  selectedDistrict: string | null;
  setSelectedDistrict: (district: string | null) => void;
  selectedSubdistrict: string | null;
  setSelectedSubdistrict: (subdistrict: string | null) => void;
  handleRegionChange: (level: DrilldownLevel, name: string) => void;
  effectiveAgencies: string[];
  currentStats: { totalBudget: string; activeProjects: number; averageScore: number };
  checkedGeographyNodes: string[];
  setCheckedGeographyNodes: React.Dispatch<React.SetStateAction<string[]>>;
  isAIAssistant?: boolean;
}

export const AIPage: React.FC<AIPageProps> = ({
  searchQuery,
  setSearchQuery,
  language,
  setLanguage,
  viewMode,
  setViewMode,
  handleAgencyFilterChange,
  currentLevel,
  setCurrentLevel,
  selectedProvince,
  setSelectedProvince,
  selectedDistrict,
  setSelectedDistrict,
  selectedSubdistrict,
  setSelectedSubdistrict,
  handleRegionChange,
  effectiveAgencies,
  currentStats,
  checkedGeographyNodes,
  setCheckedGeographyNodes,
  isAIAssistant
}) => {
  const [activeTab, setActiveTab] = useState<'policy' | 'government' | 'people'>('policy');
  const [selectedTarget, setSelectedTarget] = useState<string>('');

  // Reset selected target when tab changes
  useEffect(() => {
    setSelectedTarget('');
  }, [activeTab]);

  return (
    <>
      {activeTab === 'policy' && (
        <AgencyHierarchy 
          onAgencyFilterChange={handleAgencyFilterChange} 
          viewMode={viewMode}
          setViewMode={setViewMode}
          checkedGeographyNodes={checkedGeographyNodes}
          onGeographyFilterChange={setCheckedGeographyNodes}
        />
      )}
      <div className="dashboard-workspace" style={{ width: activeTab === 'policy' ? undefined : '100%', marginLeft: activeTab === 'policy' ? undefined : 0 }}>
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          language={language} 
          setLanguage={setLanguage} 
        />

        <div className="dashboard-content-scroll" style={{ padding: '24px' }}>
          
          {/* Tabs */}
          {!isAIAssistant && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            <button 
              onClick={() => setActiveTab('policy')}
              style={{ padding: '8px 16px', background: activeTab === 'policy' ? '#3b82f6' : '#fff', color: activeTab === 'policy' ? '#fff' : '#64748b', border: activeTab === 'policy' ? 'none' : '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Policy Overview
            </button>
            <button 
              onClick={() => setActiveTab('government')}
              style={{ padding: '8px 16px', background: activeTab === 'government' ? '#3b82f6' : '#fff', color: activeTab === 'government' ? '#fff' : '#64748b', border: activeTab === 'government' ? 'none' : '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Government Targets
            </button>
            <button 
              onClick={() => setActiveTab('people')}
              style={{ padding: '8px 16px', background: activeTab === 'people' ? '#3b82f6' : '#fff', color: activeTab === 'people' ? '#fff' : '#64748b', border: activeTab === 'people' ? 'none' : '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              People's Needs
            </button>
          </div>
        )}

          {/* Search / Filter Menu specific to Tab (Only for government and people) */}
          {activeTab !== 'policy' && (
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b' }}>ตัวเลือกเป้าหมายสำหรับ {activeTab}</h3>
              <select 
                value={selectedTarget} 
                onChange={e => setSelectedTarget(e.target.value)}
                style={{ width: '100%', maxWidth: '400px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="">-- เลือกจังหวัด (Province) --</option>
                {Object.keys(PROVINCE_TO_REGION).sort().map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}

          {/* Policy Analysis Views */}
          {activeTab === 'policy' && (
            <div style={{ marginBottom: '40px' }}>
              {viewMode === 'map' && (
                <div className="main-dashboard-grid" style={isAIAssistant ? { gridTemplateColumns: '1fr', display: 'block' } : {}}>
                  {!isAIAssistant && (
                    <InteractiveMap
                      currentLevel={currentLevel}
                      setCurrentLevel={setCurrentLevel}
                      selectedProvince={selectedProvince}
                      setSelectedProvince={setSelectedProvince}
                      selectedDistrict={selectedDistrict}
                      setSelectedDistrict={setSelectedDistrict}
                      selectedSubdistrict={selectedSubdistrict}
                      setSelectedSubdistrict={setSelectedSubdistrict}
                      onRegionChange={handleRegionChange}
                      activeAgencies={effectiveAgencies}
                      checkedGeographyNodes={checkedGeographyNodes}
                      onGeographyFilterChange={setCheckedGeographyNodes}
                    />
                  )}
                  <div style={{ position: 'relative', height: isAIAssistant ? 'auto' : '100%', minHeight: 0 }}>
                    <div style={{ position: isAIAssistant ? 'relative' : 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: isAIAssistant ? 'visible' : 'auto', display: 'flex', flexDirection: 'column' }}>
                      {isAIAssistant ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <AIWorkspaceZone currentContext={activeTab} />
                        </div>
                      ) : (
                        <>
                          <CommunityWidget />
                          <ActionWidgets currentContext={activeTab} />
                          <ChartsPanel 
                            stats={currentStats} 
                            activeAgencies={effectiveAgencies} 
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {viewMode === 'overview' && (
                isAIAssistant ? (
                  <AIWorkspaceZone currentContext={activeTab} />
                ) : (
                  <DataTable searchQuery={searchQuery} activeAgencies={effectiveAgencies} />
                )
              )}
            </div>
          )}



        <div style={{ marginTop: '24px' }}>
          {/* ActionWidgets removed from here as it's now rendered in ChartsPanel */}
        </div>
      </div>
    </div>
    </>
  );
};
