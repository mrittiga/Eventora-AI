import React from 'react';
import {
  Sparkles,
  Calendar,
  Wallet,
  CheckCircle2,
  Users,
  Store,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  PlusCircle,
  MessageSquare,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { NavigationPage } from '../navigation/Sidebar';

interface OverviewDashboardProps {
  onNavigate: (page: NavigationPage) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const {
    events,
    activeEvent,
    setActiveEventId,
    activeBudgetItems,
    activeTasks,
    activeVendors,
    activeGuests,
    formatCurrency,
    getEventReadiness,
  } = useEventContext();

  const readiness = getEventReadiness();

  // Metrics calculation
  const totalPlannedBudget = activeEvent ? activeEvent.budget : events.reduce((sum, e) => sum + e.budget, 0);
  const totalEstimatedSpending = activeBudgetItems.reduce((sum, b) => sum + b.estimatedAmount, 0);
  const totalActualSpent = activeBudgetItems.reduce((sum, b) => sum + b.actualAmount, 0);
  const totalPaid = activeBudgetItems.reduce((sum, b) => sum + b.paidAmount, 0);
  const remainingBudget = Math.max(0, totalPlannedBudget - totalEstimatedSpending);
  const budgetUtilization = totalPlannedBudget > 0 ? Math.round((totalEstimatedSpending / totalPlannedBudget) * 100) : 0;

  const totalTasksCount = activeTasks.length;
  const completedTasksCount = activeTasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const attendingGuests = activeGuests.reduce((sum, g) => (g.rsvpStatus === 'attending' ? sum + 1 + (g.additionalGuests || 0) : sum), 0);
  const pendingGuests = activeGuests.filter((g) => g.rsvpStatus === 'pending').length;

  const bookedVendorsCount = activeVendors.filter((v) => v.bookingStatus === 'booked').length;

  // Days countdown for active event
  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return 0;
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const daysLeft = getDaysRemaining(activeEvent?.date);

  // Budget category distribution for SVG ring
  const categoryGroups = activeBudgetItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.estimatedAmount;
    return acc;
  }, {} as Record<string, number>);

  const categoryEntries = Object.entries(categoryGroups).sort((a, b) => b[1] - a[1]);
  const categoryColors = ['#8B5CF6', '#22D3EE', '#F472B6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 lg:p-8 border border-violet-500/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Eventora Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Let's make your next event unforgettable.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {activeEvent ? (
                <>
                  Focusing on <strong className="text-violet-300">{activeEvent.name}</strong> scheduled for{' '}
                  <span className="text-white font-medium">{activeEvent.date}</span> in{' '}
                  <span className="text-slate-200">{activeEvent.location}</span>.
                </>
              ) : (
                'Transform your ideas into curated milestones, precise budgets, and vendor checklists with Gemini AI.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('copilot')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button text-xs font-semibold hover:border-violet-400 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span>Ask Copilot</span>
            </button>
            <button
              onClick={() => onNavigate('create_event')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button-primary text-xs font-semibold transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Planned Budget */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Planned Budget</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {formatCurrency(totalPlannedBudget)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Estimated: {formatCurrency(totalEstimatedSpending)}</span>
              <span className={`font-semibold ${totalEstimatedSpending > totalPlannedBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                {budgetUtilization}%
              </span>
            </div>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUtilization > 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-violet-500 to-cyan-400'
              }`}
              style={{ width: `${Math.min(100, budgetUtilization)}%` }}
            />
          </div>
        </div>

        {/* Days Countdown */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Countdown</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">{daysLeft}</span>
              <span className="text-xs text-slate-400 font-medium">Days remaining</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {activeEvent ? `Target: ${activeEvent.date}` : 'No active date'}
            </p>
          </div>
          <div className="text-[11px] text-cyan-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span className="truncate">{activeEvent?.location || 'Select an event'}</span>
          </div>
        </div>

        {/* Task Progress */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Task Progress</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {completedTasksCount} / {totalTasksCount}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Completion rate</span>
              <span className="font-semibold text-emerald-400">{taskCompletionRate}%</span>
            </div>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Confirmed Guests */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Guest RSVPs</span>
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {attendingGuests} <span className="text-xs font-normal text-slate-400">confirmed</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Pending response: {pendingGuests}</span>
              <span className="text-violet-300 font-mono">
                {activeGuests.length > 0 ? `${Math.round((attendingGuests / (activeEvent?.guestCount || 1)) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Target capacity: {activeEvent?.guestCount || 0} guests
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Upcoming Events & Budget Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events Carousel/Cards */}
          <div className="glass-panel p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Upcoming Events</h2>
                <p className="text-xs text-slate-400">Active celebrations and gatherings in progress</p>
              </div>
              <button
                onClick={() => onNavigate('my_events')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                <span>View All ({events.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.slice(0, 2).map((ev) => {
                const isActive = ev.id === activeEvent?.id;
                const evDays = getDaysRemaining(ev.date);
                return (
                  <div
                    key={ev.id}
                    onClick={() => setActiveEventId(ev.id)}
                    className={`glass-card overflow-hidden cursor-pointer transition-all ${
                      isActive ? 'border-violet-500/70 shadow-lg shadow-violet-500/20' : 'hover:border-white/30'
                    }`}
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                      {ev.coverImage ? (
                        <img
                          src={ev.coverImage}
                          alt={ev.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-violet-900 to-indigo-900 flex items-center justify-center text-slate-400">
                          <Calendar className="w-8 h-8 opacity-40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] uppercase font-bold text-cyan-300 border border-white/10">
                        {ev.eventType}
                      </div>
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-violet-600/80 backdrop-blur-md text-[10px] font-mono text-white">
                        {evDays} days left
                      </div>
                      <div className="absolute bottom-2 left-3 right-3 text-white">
                        <p className="font-bold text-sm truncate">{ev.name}</p>
                        <p className="text-[11px] text-slate-300 truncate">{ev.venueName || ev.location}</p>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Guests: {ev.guestCount}</span>
                        <span className="font-mono text-white">{formatCurrency(ev.budget, ev.currency)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className={`text-[10px] font-semibold ${isActive ? 'text-violet-400' : 'text-slate-400'}`}>
                          {isActive ? '● Active Focus' : 'Click to select'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEventId(ev.id);
                            onNavigate('event_plan');
                          }}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                        >
                          View Plan <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget Allocation Breakdown */}
          <div className="glass-panel p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Budget Allocation & Expenses</h2>
                <p className="text-xs text-slate-400">Distribution across major event categories</p>
              </div>
              <button
                onClick={() => onNavigate('budget')}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
              >
                <span>Budget Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {categoryEntries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No budget entries logged yet. Visit the Budget Planner to allocate your funds.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Visual Bars Breakdown */}
                <div className="space-y-3">
                  {categoryEntries.slice(0, 5).map(([cat, amount], index) => {
                    const percent = totalEstimatedSpending > 0 ? Math.round((amount / totalEstimatedSpending) * 100) : 0;
                    const color = categoryColors[index % categoryColors.length];
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 capitalize">{cat.replace('_', ' ')}</span>
                          <span className="font-mono text-slate-200 tabular-nums">
                            {formatCurrency(amount)} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Summary Card */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-slate-400">Planned Budget:</span>
                    <span className="font-bold text-white font-mono">{formatCurrency(totalPlannedBudget)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-slate-400">Total Committed:</span>
                    <span className="font-semibold text-slate-200 font-mono">{formatCurrency(totalEstimatedSpending)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-slate-400">Actual Paid So Far:</span>
                    <span className="font-semibold text-emerald-400 font-mono">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Remaining Cushion:</span>
                    <span
                      className={`font-bold font-mono ${
                        remainingBudget <= 0 ? 'text-rose-400' : 'text-cyan-400'
                      }`}
                    >
                      {formatCurrency(remainingBudget)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Readiness Score, AI Advice & Urgent Actions */}
        <div className="space-y-6">
          {/* Transparent Readiness Score Card */}
          <div className="glass-panel p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Event Readiness</h2>
                <p className="text-xs text-slate-400">Objective score from application state</p>
              </div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">
                {readiness.score}<span className="text-xs text-slate-400">/100</span>
              </div>
            </div>

            {/* Score Ring / Bar */}
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  readiness.score >= 80
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                    : readiness.score >= 50
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-400'
                    : 'bg-gradient-to-r from-amber-500 to-rose-400'
                }`}
                style={{ width: `${readiness.score}%` }}
              />
            </div>

            {/* Transparent Breakdown Factors */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Tasks Completed</span>
                <span className="font-bold text-slate-200 tabular-nums">
                  {readiness.breakdown.tasksScore} / 30 pts
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Vendors Booked</span>
                <span className="font-bold text-slate-200 tabular-nums">
                  {readiness.breakdown.vendorScore} / 25 pts
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Budget Health</span>
                <span className="font-bold text-slate-200 tabular-nums">
                  {readiness.breakdown.budgetScore} / 25 pts
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Guest Response</span>
                <span className="font-bold text-slate-200 tabular-nums">
                  {readiness.breakdown.guestScore} / 20 pts
                </span>
              </div>
            </div>

            {/* Urgent Next Actions */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>What Needs Attention</span>
              </span>
              <ul className="space-y-1.5">
                {readiness.urgentActions.map((act, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Copilot Next-Best Actions */}
          <div className="glass-panel p-5 space-y-3 border border-cyan-500/20">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <span>AI Director's Weekly Advice</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeEvent?.aiPlan?.costSavingSuggestions?.[0] ||
                'Repurpose entrance welcome flowers onto the banquet stage after arrivals to reduce floral costs by up to 20%.'}
            </p>
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => onNavigate('copilot')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                Chat with Copilot <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('event_plan')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Full AI Plan
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="glass-card p-4 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('tasks')}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-slate-200 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="font-medium block">Add Task</span>
              </button>
              <button
                onClick={() => onNavigate('budget')}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-slate-200 transition-colors"
              >
                <Wallet className="w-4 h-4 text-violet-400 mb-1" />
                <span className="font-medium block">Add Expense</span>
              </button>
              <button
                onClick={() => onNavigate('vendors')}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-slate-200 transition-colors"
              >
                <Store className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="font-medium block">Add Vendor</span>
              </button>
              <button
                onClick={() => onNavigate('guests')}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-slate-200 transition-colors"
              >
                <Users className="w-4 h-4 text-pink-400 mb-1" />
                <span className="font-medium block">Import Guests</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
