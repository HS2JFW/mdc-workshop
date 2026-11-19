import React, { useState } from 'react';
import {
  Maximize2
} from 'lucide-react';
import { useMoralTheme } from '../utils/moralThemeManager';
import { PmsExecutiveDashboardView } from './PmsExecutiveDashboardView';
import { ProjectTrackingDashboardView } from './ProjectTrackingDashboardView';
import { PublicKnowledgeMeetingView } from './PublicKnowledgeMeetingView';
import { PublicRealtimeProjectsDashboardView } from './PublicRealtimeProjectsDashboardView';
import type { ProjectSummary } from '../data/taskProjectSqliteService';

export type ProjectTrackingTabId = 'tracking' | 'meeting' | 'realtime' | 'overview';

interface ProjectTrackingMainViewProps {
  initialTab?: ProjectTrackingTabId;
  onTabChange?: (tab: ProjectTrackingTabId) => void;
}

export const ProjectTrackingMainView: React.FC<ProjectTrackingMainViewProps> = ({
  initialTab = 'tracking',
  onTabChange
}) => {
  const { theme } = useMoralTheme();
  const [activeTab, setActiveTab] = useState<ProjectTrackingTabId>(initialTab);
  const [isCalendarFullscreen, setIsCalendarFullscreen] = useState<boolean>(true);
  const [calendarTargetProjectId, setCalendarTargetProjectId] = useState<string | undefined>(undefined);
  const [calendarTargetMeetingId, setCalendarTargetMeetingId] = useState<string | undefined>(undefined);

  const handleTabSwitch = (nextTab: ProjectTrackingTabId) => {
    setActiveTab(nextTab);
    if (nextTab === 'meeting') {
      setIsCalendarFullscreen(true);
    }
    onTabChange?.(nextTab);
  };

  const handleOpenProjectCalendar = (project?: ProjectSummary, targetMeetingId?: string) => {
    if (project?.projectId) {
      setCalendarTargetProjectId(project.projectId);
    }
    setCalendarTargetMeetingId(targetMeetingId);
    handleTabSwitch('meeting');
  };

  // Keep parent in sync when initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
    if (initialTab === 'meeting') {
      setIsCalendarFullscreen(true);
    }
    onTabChange?.(initialTab);
  }, [initialTab]);

  // Full Screen Mode for Calendar View
  if (activeTab === 'meeting' && isCalendarFullscreen) {
    return (
      <div
        className="moral-calendar-fullscreen-stage"
        style={{
          width: '100%',
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          margin: 0,
          padding: 0,
          position: 'relative'
        }}
      >
        <PublicKnowledgeMeetingView
          onBack={() => {
            setCalendarTargetMeetingId(undefined);
            handleTabSwitch('tracking');
          }}
          onToggleFullscreen={() => setIsCalendarFullscreen(false)}
          isFullscreen={true}
          initialProjectId={calendarTargetProjectId}
          initialMeetingId={calendarTargetMeetingId}
        />
      </div>
    );
  }

  if (theme === 'thai-modern') {
    return (
      <div className="moral-project-page-root">
        {/* Dynamic Content for Active Tab (No top cards row) */}
        <div className="moral-project-content-container">
          {activeTab === 'overview' && <PmsExecutiveDashboardView />}
          {activeTab === 'tracking' && (
            <ProjectTrackingDashboardView
              onOpenCalendar={handleOpenProjectCalendar}
              onOpenRealtime={() => handleTabSwitch('realtime')}
            />
          )}
          {activeTab === 'meeting' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsCalendarFullscreen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    backgroundColor: '#2544a8',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 68, 168, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Maximize2 size={16} />
                  <span>ขยายเต็มหน้าจอ (Full Screen)</span>
                </button>
              </div>
              <div
                style={{
                  height: 'calc(100vh - 460px)',
                  minHeight: '680px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)'
                }}
              >
                <PublicKnowledgeMeetingView
                  onBack={() => handleTabSwitch('tracking')}
                  onToggleFullscreen={() => setIsCalendarFullscreen(true)}
                  isFullscreen={false}
                  initialProjectId={calendarTargetProjectId}
                />
              </div>
            </div>
          )}
          {activeTab === 'realtime' && (
            <PublicRealtimeProjectsDashboardView onBack={() => handleTabSwitch('tracking')} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="moral-view-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: '40px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Dynamic Content Based on Selected Tab (No top arch cards) */}
      {activeTab === 'overview' && <PmsExecutiveDashboardView />}
      {activeTab === 'tracking' && (
        <ProjectTrackingDashboardView
          onOpenCalendar={handleOpenProjectCalendar}
          onOpenRealtime={() => handleTabSwitch('realtime')}
        />
      )}
      {activeTab === 'meeting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setIsCalendarFullscreen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '9999px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <Maximize2 size={16} />
              <span>ขยายเต็มหน้าจอ (Full Screen)</span>
            </button>
          </div>
          <div
            style={{
              height: 'calc(100vh - 460px)',
              minHeight: '680px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)'
            }}
          >
            <PublicKnowledgeMeetingView
              onBack={() => {
                setCalendarTargetMeetingId(undefined);
                handleTabSwitch('tracking');
              }}
              onToggleFullscreen={() => setIsCalendarFullscreen(true)}
              isFullscreen={false}
              initialProjectId={calendarTargetProjectId}
              initialMeetingId={calendarTargetMeetingId}
            />
          </div>
        </div>
      )}
      {activeTab === 'realtime' && (
        <PublicRealtimeProjectsDashboardView onBack={() => handleTabSwitch('tracking')} />
      )}
    </div>
  );
};
