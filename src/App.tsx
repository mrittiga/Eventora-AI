import React, { useState } from 'react';
import { EventProvider } from './context/EventContext';
import { ToastProvider } from './components/common/Toast';
import { Sidebar, NavigationPage } from './components/navigation/Sidebar';
import { Navbar } from './components/navigation/Navbar';

// Pages
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { MyEventsPage } from './components/events/MyEventsPage';
import { CreateEventWizard } from './components/events/CreateEventWizard';
import { EventDetailsPlan } from './components/events/EventDetailsPlan';
import { EventoraCopilot } from './components/copilot/EventoraCopilot';
import { BudgetPlanner } from './components/budget/BudgetPlanner';
import { TimelineTasks } from './components/tasks/TimelineTasks';
import { VendorManager } from './components/vendors/VendorManager';
import { GuestManager } from './components/guests/GuestManager';
import { InspirationStudio } from './components/inspiration/InspirationStudio';
import { SettingsPage } from './components/settings/SettingsPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderActivePage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewDashboard onNavigate={setCurrentPage} />;
      case 'my_events':
        return <MyEventsPage onNavigate={setCurrentPage} />;
      case 'create_event':
        return <CreateEventWizard onNavigate={setCurrentPage} />;
      case 'event_plan':
        return <EventDetailsPlan onNavigate={setCurrentPage} />;
      case 'copilot':
        return <EventoraCopilot />;
      case 'budget':
        return <BudgetPlanner />;
      case 'tasks':
        return <TimelineTasks />;
      case 'vendors':
        return <VendorManager />;
      case 'guests':
        return <GuestManager />;
      case 'inspiration':
        return <InspirationStudio />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewDashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080B1A] text-slate-100 flex relative overflow-x-hidden">
      {/* Background radial ambient lights for authentic glassmorphism */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-700/12 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-cyan-600/10 blur-[140px] pointer-events-none" />
      <div className="fixed top-[40%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-pink-600/8 blur-[100px] pointer-events-none" />

      {/* Collapsible Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Content Viewport */}
        <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <EventProvider>
        <AppContent />
      </EventProvider>
    </ToastProvider>
  );
}
