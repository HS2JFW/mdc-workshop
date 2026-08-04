import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Sidebar } from './components/Sidebar';
import { AgencyHierarchy } from './components/AgencyHierarchy';
import { Header } from './components/Header';
import { InteractiveMap } from './components/InteractiveMap';
import type { DrilldownLevel } from './components/InteractiveMap';
import { ReportBuilder } from './components/ReportBuilder';
import { SocialEyeDashboard } from './components/SocialEyeDashboard';
import { ChartsPanel } from './components/ChartsPanel';
import { DataTable } from './components/DataTable';

import { LoginPage } from './components/LoginPage';
import { AIPage } from './components/AIPage';
import { SettingsPage } from './components/SettingsPage';
import { ActionWidgets, CommunityWidget } from './components/ActionWidgets';
import { CommunityPage } from './components/CommunityPage';
import { getStringHashCode } from './utils/thaiGeography';



// Stats corresponding to major pre-defined levels
const statsByRegion: Record<string, { totalBudget: string; activeProjects: number; averageScore: number }> = {
  'country': { totalBudget: '฿12,000', activeProjects: 312, averageScore: 6.5 },
  'กรุงเทพมหานคร': { totalBudget: '฿8,400', activeProjects: 144, averageScore: 7.2 },
  'เขตปทุมวัน': { totalBudget: '฿3,800', activeProjects: 56, averageScore: 8.1 },
  'แขวงปทุมวัน': { totalBudget: '฿1,200', activeProjects: 18, averageScore: 9.35 },
  'แขวงวังใหม่': { totalBudget: '฿950', activeProjects: 12, averageScore: 7.7 },
  'แขวงลุมพินี': { totalBudget: '฿1,100', activeProjects: 15, averageScore: 8.0 },
  'แขวงรองเมือง': { totalBudget: '฿550', activeProjects: 11, averageScore: 6.8 }
};



function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [viewMode, setViewMode] = useState<'overview' | 'map'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAgencyNames, setActiveAgencyNames] = useState<string>('');
  const [language, setLanguage] = useState<'TH' | 'EN'>('TH');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('is_authenticated') === 'true';
  });

  // Drilldown states
  const [currentLevel, setCurrentLevel] = useState<DrilldownLevel>('country');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string | null>(null);

  // Agency hierarchy filters
  const [activeAgencies, setActiveAgencies] = useState<string[]>([]);
  const [checkedGeographyNodes, setCheckedGeographyNodes] = useState<string[]>([]);

  useEffect(() => {
    const handleNavigation = (e: CustomEvent) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('navigate', handleNavigation as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
    };
  }, []);

  const handleRegionChange = (_level: DrilldownLevel, _name: string) => {
    // Custom region click actions
  };

  const handleAgencyFilterChange = (selectedAgencies: string[]) => {
    setActiveAgencies(selectedAgencies);
  };

  // Determine current active region for stats binding
  const CHULA_ID = 'd22b0d9a-2bcd-405f-a34e-959661fefe7f';
  const effectiveAgencies = activeTab === 'projects' 
    ? (activeAgencies.length > 0 ? activeAgencies : [CHULA_ID]) 
    : activeAgencies;

  useEffect(() => {
    // Optionally fetch names for App level display
    const fetchNames = async () => {
      if (effectiveAgencies && effectiveAgencies.length > 0) {
        const { data: namesData } = await supabase.from('agencies').select('name').in('id', effectiveAgencies);
        if (namesData && namesData.length > 0) {
          setActiveAgencyNames(namesData.map(n => n.name).join(', '));
        } else {
          setActiveAgencyNames('');
        }
      } else {
        setActiveAgencyNames('ภาพรวมทุกหน่วยงาน');
      }
    };
    fetchNames();
  }, [effectiveAgencies]);

  const getCurrentRegionName = (): string => {
    if (selectedSubdistrict) return selectedSubdistrict;
    if (selectedDistrict) return selectedDistrict;
    if (selectedProvince) return selectedProvince;
    return 'country';
  };

  const currentRegion = getCurrentRegionName();

  // Resolve Stats: Static lookup or dynamic generation
  const getStatsForRegion = () => {
    if (statsByRegion[currentRegion]) {
      return statsByRegion[currentRegion];
    }
    
    // Procedural stats generation based on hash seed
    const hash = getStringHashCode(currentRegion);
    let budget = 12000;
    let projects = 312;
    let score = 6.5;

    if (selectedSubdistrict) {
      budget = 400 + (hash % 1000);
      projects = 4 + (hash % 12);
      score = 7.0 + (hash % 25) / 10;
    } else if (selectedDistrict) {
      budget = 2000 + (hash % 3000);
      projects = 20 + (hash % 50);
      score = 6.8 + (hash % 20) / 10;
    } else if (selectedProvince) {
      budget = 6000 + (hash % 4000);
      projects = 80 + (hash % 120);
      score = 6.5 + (hash % 15) / 10;
    }

    return {
      totalBudget: `฿${budget.toLocaleString()}`,
      activeProjects: projects,
      averageScore: parseFloat(score.toFixed(1))
    };
  };

  const currentStats = getStatsForRegion();

  // Mock data removed in favor of Supabase
  // Removed static list filtering since DataTable handles Supabase fetching

  const handleLoginSuccess = () => {
    sessionStorage.setItem('is_authenticated', 'true');
    setIsAuthenticated(true);
  };


  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="dashboard-wrapper">
      {/* 1. Main Navigation Sidebar (Far Left) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Subpanel Sidebar Hierarchy & Main Workspace for Dashboard */}
      {activeTab === 'dashboard' && (
        <>
          <AgencyHierarchy 
            onAgencyFilterChange={handleAgencyFilterChange} 
            viewMode={viewMode}
            setViewMode={setViewMode}
            checkedGeographyNodes={checkedGeographyNodes}
            onGeographyFilterChange={setCheckedGeographyNodes}
          />

          <div className="dashboard-workspace">
            <Header 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              language={language} 
              setLanguage={setLanguage} 
            />

            <div className="dashboard-content-scroll">
              {viewMode === 'map' && (
                <div className="main-dashboard-grid">
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
                  />
                  <div style={{ position: 'relative', height: '100%', minHeight: 0 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                      <CommunityWidget />
                      <ActionWidgets currentContext="policy" />
                      <ChartsPanel 
                        stats={currentStats} 
                        activeAgencies={effectiveAgencies} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'overview' && (
                <div className="main-dashboard-grid">
                  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <DataTable searchQuery={searchQuery} activeAgencies={effectiveAgencies} />
                  </div>
                  <div style={{ position: 'relative', height: '100%', minHeight: 0 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                      <CommunityWidget />
                      <ActionWidgets currentContext="policy" />
                      <ChartsPanel 
                        stats={currentStats} 
                        activeAgencies={effectiveAgencies} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 3. Main Workspace for People (Users) */}
      {activeTab === 'users' && (
        <>
          <AgencyHierarchy 
            viewMode="map"
            hideTabs={true}
            checkedGeographyNodes={checkedGeographyNodes}
            onGeographyFilterChange={setCheckedGeographyNodes}
          />
          <div className="dashboard-workspace">
            <Header 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            language={language} 
            setLanguage={setLanguage} 
          />

          <div className="dashboard-content-scroll">
            <div className="main-dashboard-grid">
              {/* Left Column: Map */}
              <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '16px', display: 'flex', flexDirection: 'column' }}>
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
                  hideProjectFilters={true}
                />
              </div>

              {/* Right Column: Province Virtue Charts */}
              <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px' }}>
                  <CommunityWidget onNavigateToCommunity={() => setActiveTab('community')} />
                  <ActionWidgets currentContext="people" />
                  <ChartsPanel activeAgencies={effectiveAgencies} hideBarChart={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* 3. Main Workspace for Government Offices (Projects) */}
      {activeTab === 'projects' && (
        <>
          <AgencyHierarchy 
            onAgencyFilterChange={handleAgencyFilterChange} 
            viewMode={viewMode}
            setViewMode={setViewMode}
            checkedGeographyNodes={checkedGeographyNodes}
            onGeographyFilterChange={setCheckedGeographyNodes}
            restrictToChula={viewMode === 'overview'}
          />
          <div className="dashboard-workspace">
            <Header 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            language={language} 
            setLanguage={setLanguage} 
          />

          <div className="dashboard-content-scroll">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px 0 24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                  {activeAgencyNames}
                </h2>
                <span style={{ fontSize: '16px', color: '#64748b' }}>
                  รายการโครงการโดยละเอียด และดัชนีคุณธรรม 5 ด้าน
                </span>
              </div>
              {/* Removed Overview and Country Map tabs as requested */}
            </div>

            {viewMode === 'map' && (
              <div className="main-dashboard-grid">
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
                  />
                  <div style={{ position: 'relative', height: '100%', minHeight: 0 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                      <CommunityWidget />
                      <ActionWidgets currentContext="government" />
                      <ChartsPanel 
                        stats={currentStats} 
                        activeAgencies={effectiveAgencies} 
                      />
                    </div>
                  </div>
              </div>
            )}

              {viewMode === 'overview' && (
                <div className="main-dashboard-grid">
                  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <DataTable searchQuery={searchQuery} activeAgencies={effectiveAgencies} hideSubAgencies={true} />
                  </div>
                  <div style={{ position: 'relative', height: '100%', minHeight: 0 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                      <CommunityWidget />
                      <ActionWidgets currentContext="government" />
                      <ChartsPanel 
                        stats={currentStats} 
                        activeAgencies={effectiveAgencies} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Other tabs placeholder */}
      {activeTab !== 'dashboard' && activeTab !== 'projects' && activeTab !== 'users' && activeTab !== 'ai' && activeTab !== 'settings' && activeTab !== 'community' && activeTab !== 'report' && activeTab !== 'social-eye' && (
        <div className="dashboard-workspace">
           <Header 
             searchQuery={searchQuery} 
             setSearchQuery={setSearchQuery} 
             language={language} 
             setLanguage={setLanguage} 
           />
           <div className="dashboard-content-scroll" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
             <h2>Coming Soon</h2>
             <p>This page is under construction.</p>
           </div>
        </div>
      )}
      {/* 4. Policy Overview via AIPage */}
      {activeTab === 'policy' && (
        <AIPage 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          language={language}
          setLanguage={setLanguage}
          viewMode={viewMode}
          setViewMode={setViewMode}
          handleAgencyFilterChange={handleAgencyFilterChange}
          currentLevel={currentLevel}
          setCurrentLevel={setCurrentLevel}
          selectedProvince={selectedProvince}
          setSelectedProvince={setSelectedProvince}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedSubdistrict={selectedSubdistrict}
          setSelectedSubdistrict={setSelectedSubdistrict}
          handleRegionChange={handleRegionChange}
          effectiveAgencies={effectiveAgencies}
          currentStats={currentStats}
          checkedGeographyNodes={checkedGeographyNodes}
          setCheckedGeographyNodes={setCheckedGeographyNodes}
        />
      )}
      {/* 5. AI Workspace */}
      {activeTab === 'ai' && (
        <AIPage 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          language={language}
          setLanguage={setLanguage}
          viewMode={viewMode}
          setViewMode={setViewMode}
          handleAgencyFilterChange={handleAgencyFilterChange}
          currentLevel={currentLevel}
          setCurrentLevel={setCurrentLevel}
          selectedProvince={selectedProvince}
          setSelectedProvince={setSelectedProvince}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedSubdistrict={selectedSubdistrict}
          setSelectedSubdistrict={setSelectedSubdistrict}
          handleRegionChange={handleRegionChange}
          effectiveAgencies={effectiveAgencies}
          currentStats={currentStats}
          checkedGeographyNodes={checkedGeographyNodes}
          setCheckedGeographyNodes={setCheckedGeographyNodes}
          isAIAssistant={true}
        />
      )}
      {/* 6. Community Workspace */}
      {activeTab === 'community' && (
        <CommunityPage
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          language={language}
          setLanguage={setLanguage}
          checkedGeographyNodes={checkedGeographyNodes}
          setCheckedGeographyNodes={setCheckedGeographyNodes}
        />
      )}

      {/* 7. Social Eye Workspace */}
      {activeTab === 'social-eye' && (
        <SocialEyeDashboard 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          language={language}
          setLanguage={setLanguage}
        />
      )}

      {/* 8. Report Builder Workspace */}
      {activeTab === 'report' && (
        <ReportBuilder 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          language={language}
          setLanguage={setLanguage}
          checkedGeographyNodes={checkedGeographyNodes}
          setCheckedGeographyNodes={setCheckedGeographyNodes}
        />
      )}

      {/* 8. Settings Workspace */}
      {activeTab === 'settings' && (
        <div className="dashboard-workspace" style={{ width: '100%', marginLeft: 0 }}>
          <Header 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            language={language} 
            setLanguage={setLanguage} 
          />
          <div className="dashboard-content-scroll">
            <SettingsPage />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
