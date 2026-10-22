import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  FileText,
  MessageSquareText,
  Wallet,
  CheckSquare,
  Users,
  Store,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkle,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';

export type NavigationPage =
  | 'overview'
  | 'my_events'
  | 'create_event'
  | 'event_plan'
  | 'copilot'
  | 'budget'
  | 'tasks'
  | 'vendors'
  | 'guests'
  | 'inspiration'
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { activeEvent, events, setActiveEventId } = useEventContext();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'my_events', label: 'My Events', icon: CalendarDays, badge: events.length },
    { id: 'create_event', label: 'AI Event Creator', icon: Sparkles, highlight: true },
    { id: 'event_plan', label: 'Event Plan', icon: FileText },
    { id: 'copilot', label: 'Eventora Copilot', icon: MessageSquareText },
    { id: 'budget', label: 'Budget Planner', icon: Wallet },
    { id: 'tasks', label: 'Timeline & Tasks', icon: CheckSquare },
    { id: 'vendors', label: 'Vendor Manager', icon: Store },
    { id: 'guests', label: 'Guest Manager', icon: Users },
    { id: 'inspiration', label: 'Inspiration Studio', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: NavigationPage) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col glass-sidebar transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
          <div
            onClick={() => handleItemClick('overview')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-violet-500/25 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#080B1A] rounded-[10px] flex items-center justify-center">
                <Sparkle className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight gradient-text whitespace-nowrap">
                  Eventora AI
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Event Planner
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id as NavigationPage)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-violet-600/25 text-white border border-violet-500/40 shadow-lg shadow-violet-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                } ${item.highlight && !isActive ? 'text-cyan-300 font-semibold' : ''}`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-cyan-300'
                      : item.highlight
                      ? 'text-cyan-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate text-left flex-1 whitespace-nowrap">{item.label}</span>
                )}
                {!isCollapsed && item.badge !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Event Context Card */}
        {activeEvent && !isCollapsed && (
          <div className="p-3 border-t border-white/10 shrink-0">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                <span>Active Event</span>
                <span className="text-cyan-400 capitalize">{activeEvent.eventType}</span>
              </div>
              <p className="font-semibold text-slate-100 truncate">{activeEvent.name}</p>
              <div className="flex items-center justify-between mt-2 text-slate-400">
                <span>{activeEvent.date}</span>
                <span className="font-mono text-violet-300">
                  {Math.max(0, Math.ceil((new Date(activeEvent.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))}d left
                </span>
              </div>
              {events.length > 1 && (
                <select
                  value={activeEvent.id}
                  onChange={(e) => setActiveEventId(e.target.value)}
                  className="mt-2 w-full bg-black/40 border border-white/15 rounded-lg py-1 px-2 text-[11px] text-slate-200 outline-none focus:border-violet-500"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                      {ev.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
