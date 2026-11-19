import { Search, Bell, Settings, Building2 } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: 'TH' | 'EN';
  setLanguage: (lang: 'TH' | 'EN') => void;
  customTitle?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  language,
  setLanguage,
  customTitle,
  activeTab,
  setActiveTab
}) => {
  const handleTabClick = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { detail: tab }));
    }
  };

  return (
    <header className="dashboard-header">
      {/* Search Bar & Top Menu */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาโครงการ, หน่วยงาน, สถานที่..."
            className="search-input"
          />
        </div>

        {/* Top Menu: ศูนย์คุณธรรม */}
        <div className="header-top-navigation">
          <button
            type="button"
            className={`header-top-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('dashboard')}
            title="แผนที่ภาพรวม"
          >
            <Building2 size={16} />
            <span>แผนที่ภาพรวม</span>
          </button>

          <button
            type="button"
            className={`header-top-tab-btn ${activeTab === 'moral-center' ? 'active' : ''}`}
            onClick={() => handleTabClick('moral-center')}
            title="ไปยังหน้า Dashboard ศูนย์คุณธรรม"
          >
            <img
              src="/moral-center-logo.png"
              alt="Moral Center"
              style={{ width: 16, height: 16, objectFit: 'contain' }}
            />
            <span>ศูนย์คุณธรรม</span>
            <span className="header-top-badge">Dashboard</span>
          </button>
        </div>
      </div>

      {customTitle && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontWeight: 600, fontSize: '18px', color: '#1e293b' }}>
          {customTitle}
        </div>
      )}

      {/* User Actions & Profile */}
      <div className="header-user-panel">
        {/* User Profile */}
        <div className="user-profile">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
            alt="User Avatar"
            className="user-avatar"
          />
          <span className="user-name">Jrain Jumes</span>
        </div>

        {/* Notification Icon */}
        <button className="header-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="header-badge" />
        </button>

        {/* Settings Icon */}
        <button className="header-icon-btn" title="Settings">
          <Settings size={18} />
        </button>

        {/* Language Toggler */}
        <div className="lang-selector">
          <button
            className={`lang-btn ${language === 'TH' ? 'active' : ''}`}
            onClick={() => setLanguage('TH')}
          >
            TH
          </button>
          <button
            className={`lang-btn ${language === 'EN' ? 'active' : ''}`}
            onClick={() => setLanguage('EN')}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
};
