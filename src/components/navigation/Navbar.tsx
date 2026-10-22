import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Search,
  Sparkles,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { NavigationPage } from './Sidebar';

interface NavbarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onOpenMobileSidebar: () => void;
  isSidebarCollapsed: boolean;
  onSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenMobileSidebar,
  isSidebarCollapsed,
}) => {
  const { activeEvent, events, setActiveEventId, getEventReadiness } = useEventContext();
  const [searchQuery, setSearchQuery] = useState('');
  const readiness = getEventReadiness();

  const getPageTitle = (page: NavigationPage): string => {
    switch (page) {
      case 'overview':
        return 'Overview Dashboard';
      case 'my_events':
        return 'My Events';
      case 'create_event':
        return 'AI Event Creator';
      case 'event_plan':
        return 'Personalized Event Plan';
      case 'copilot':
        return 'Eventora Copilot Assistant';
      case 'budget':
        return 'Smart Budget Planner';
      case 'tasks':
        return 'Timeline & Task Management';
      case 'vendors':
        return 'Vendor & Supplier Manager';
      case 'guests':
        return 'Guest Management & RSVPs';
      case 'inspiration':
        return 'Inspiration & Theme Studio';
      case 'settings':
        return 'Settings & Data Controls';
      default:
        return 'Eventora AI';
    }
  };

  const filteredEvents = searchQuery.trim()
    ? events.filter(
        (e) =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.eventType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 glass-navbar flex items-center justify-between px-4 lg:px-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'
      }`}
    >
      {/* Zone 1: Mobile Hamburger & Breadcrumb Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open mobile menu"
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-400 truncate">
          <span className="font-semibold text-white whitespace-nowrap hidden sm:inline">Eventora AI</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          {activeEvent && currentPage !== 'overview' && currentPage !== 'my_events' && (
            <>
              <span className="text-violet-300 truncate max-w-[140px] md:max-w-[200px] font-medium hidden md:inline">
                {activeEvent.name}
              </span>
              <span className="text-slate-600 hidden md:inline">/</span>
            </>
          )}
          <span className="text-slate-200 font-semibold truncate">{getPageTitle(currentPage)}</span>
        </div>
      </div>

      {/* Zone 2: Search, Event Switcher & Readiness Badge */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Quick Search */}
        <div className="relative hidden xl:block w-56">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          {searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 glass-panel p-2 shadow-2xl z-50 max-h-60 overflow-y-auto">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Matching Events</div>
              {filteredEvents.length === 0 ? (
                <div className="text-xs text-slate-400 px-2 py-2">No matching events found.</div>
              ) : (
                filteredEvents.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => {
                      setActiveEventId(ev.id);
                      setSearchQuery('');
                      onNavigate('event_plan');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-200 hover:bg-violet-600/30 flex items-center justify-between"
                  >
                    <span className="truncate">{ev.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{ev.eventType}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Active Event Selector */}
        {events.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={activeEvent?.id || ''}
              onChange={(e) => setActiveEventId(e.target.value)}
              className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer max-w-[140px] md:max-w-[180px] truncate"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Readiness Meter Pill */}
        {activeEvent && (
          <button
            onClick={() => onNavigate('overview')}
            title="Calculated Readiness Score from verified application data"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/50 transition-colors text-xs"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Readiness:</span>
            <span className="font-bold text-white tabular-nums">{readiness.score}%</span>
          </button>
        )}

        {/* Primary CTA: + Create Event */}
        <button
          onClick={() => onNavigate('create_event')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-button-primary text-xs font-semibold whitespace-nowrap transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Event</span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-200 hidden sm:inline" />
        </button>
      </div>
    </header>
  );
};
