import React from 'react';
import { 
  Map, 
  Building2, 
  User, 
  Monitor, 
  LogOut,
  Bot,
  Users,
  FileBarChart,
  Activity
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sidebar-nav">
      <div>

        {/* Moral Center Logo */}
        <div 
          className="sidebar-emblem" 
          style={{ border: 'none', background: 'transparent', width: '72px', height: '72px', padding: 0, borderRadius: 0, cursor: 'pointer' }}
          onClick={() => setActiveTab('moral-center')}
          title="ศูนย์คุณธรรม Dashboard (หน้าหลัก)"
        >
          <img src="/moral-center-logo.png" alt="Moral Center Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        {/* Menu Items */}
        <div className="sidebar-menu-group">
          <div 
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            title="Policy Analysis"
          >
            <Map size={20} />
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
            title="Government Offices"
          >
            <Building2 size={20} />
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            title="People"
          >
            <User size={20} />
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
            title="AI Assistant"
          >
            <Bot size={20} />
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'community' ? 'active' : ''}`}
            onClick={() => setActiveTab('community')}
            title="Community"
          >
            <Users size={20} />
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'social-eye' ? 'active' : ''}`}
            onClick={() => setActiveTab('social-eye')}
            title="Social Eye"
          >
            <Activity size={20} />
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
            title="Report Builder"
          >
            <FileBarChart size={20} />
          </div>


          <div 
            className={`sidebar-item ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
            title="Monitor"
          >
            <Monitor size={20} />
          </div>

          <div className="sidebar-item" title="Logout">
            <LogOut size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
