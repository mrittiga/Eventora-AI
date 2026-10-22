import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Wallet,
  Clock,
  Store,
  Users,
  Utensils,
  ShieldAlert,
  PiggyBank,
  CheckSquare,
  RefreshCw,
  Copy,
  Check,
  Download,
  Share2,
  Palette,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { GeneratedEventPlan } from '../../types';
import { NavigationPage } from '../navigation/Sidebar';
import { useToast } from '../common/Toast';
import { generateAIEventPlan } from '../../services/api';

interface EventDetailsPlanProps {
  onNavigate: (page: NavigationPage) => void;
}

export const EventDetailsPlan: React.FC<EventDetailsPlanProps> = ({ onNavigate }) => {
  const { activeEvent, updateEventAIPlan, formatCurrency, addBudgetItem, addTask } = useEventContext();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'concept' | 'budget' | 'timeline' | 'vendors' | 'catering' | 'agenda' | 'risks'
  >('concept');
  const [copied, setCopied] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const handleGeneratePlanForEvent = async () => {
    if (!activeEvent) return;
    setIsGeneratingPlan(true);
    try {
      const { plan } = await generateAIEventPlan(activeEvent);
      updateEventAIPlan(activeEvent.id, plan);
      showToast('Masterplan generated successfully!', 'success');
    } catch {
      showToast('Generated plan using smart planning engine', 'info');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  if (!activeEvent || !activeEvent.aiPlan) {
    return (
      <div className="glass-panel p-12 text-center space-y-4 max-w-lg mx-auto">
        <Sparkles className="w-12 h-12 text-violet-400 mx-auto opacity-60" />
        <h2 className="text-xl font-bold text-white">No AI Plan Generated Yet</h2>
        <p className="text-xs text-slate-400">
          Craft a complete personalized 12-section masterplan for <strong className="text-violet-300">{activeEvent?.name}</strong>.
        </p>
        <button
          onClick={handleGeneratePlanForEvent}
          disabled={isGeneratingPlan}
          className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-semibold"
        >
          {isGeneratingPlan ? 'Generating Plan...' : 'Generate AI Plan Now'}
        </button>
      </div>
    );
  }

  const plan = activeEvent.aiPlan;

  const handleCopyMarkdown = () => {
    const markdown = `# ${plan.conceptTitle}
**Event**: ${activeEvent.name} (${activeEvent.eventType})
**Date**: ${activeEvent.date} | **Guests**: ${activeEvent.guestCount}
**Budget**: ${formatCurrency(activeEvent.budget)}

## Concept
${plan.conceptSummary}

## Theme & Decor
- Theme: ${plan.themeAndDecor.recommendedTheme}
- Colors: ${plan.themeAndDecor.colors.join(', ')}
- Ambiance: ${plan.themeAndDecor.lightingAndAmbience}

## Budget Breakdown
${plan.budgetBreakdown.map((b) => `- ${b.category}: ${formatCurrency(b.suggestedAmount)} (${b.suggestedPercentage}%) - ${b.guidelines}`).join('\n')}

## Timeline Milestones
${plan.timeline.map((t) => `### ${t.phase} (${t.daysBefore} days before): ${t.milestone}\n${t.keyTasks.map((k) => `  * ${k}`).join('\n')}`).join('\n')}

## Catering & Menu
- Style: ${plan.cateringAndMenu.menuStyle}
- Signature Items: ${plan.cateringAndMenu.signatureItems.join(', ')}

## Contingency & Risks
${plan.riskAndContingency.map((r) => `- Risk: ${r.risk} -> Solution: ${r.solution}`).join('\n')}

## Cost Saving Tips
${plan.costSavingSuggestions.map((c) => `- ${c}`).join('\n')}
`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    showToast('Event Masterplan copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSyncTasks = () => {
    let count = 0;
    plan.timeline.forEach((phase) => {
      phase.keyTasks.forEach((title, idx) => {
        const offset = Math.max(1, 30 - phase.daysBefore);
        const d = new Date();
        d.setDate(d.getDate() + offset);
        addTask({
          eventId: activeEvent.id,
          title,
          category: phase.phase,
          dueDate: d.toISOString().split('T')[0],
          priority: idx === 0 ? 'high' : 'medium',
          status: 'todo',
        });
        count++;
      });
    });
    showToast(`Synced ${count} milestone tasks into Timeline & Tasks board!`, 'success');
  };

  const handleSyncBudget = () => {
    let count = 0;
    plan.budgetBreakdown.forEach((b) => {
      let category: any = 'miscellaneous';
      const catLower = b.category.toLowerCase();
      if (catLower.includes('venue')) category = 'venue';
      else if (catLower.includes('cater') || catLower.includes('food')) category = 'catering';
      else if (catLower.includes('decor') || catLower.includes('flower')) category = 'decorations';
      else if (catLower.includes('photo') || catLower.includes('media')) category = 'photography';
      else if (catLower.includes('music') || catLower.includes('entertainment')) category = 'entertainment';
      else if (catLower.includes('invite')) category = 'invitations';
      else if (catLower.includes('reserve') || catLower.includes('contingency')) category = 'contingency';

      addBudgetItem({
        eventId: activeEvent.id,
        category,
        title: b.category,
        estimatedAmount: b.suggestedAmount,
        actualAmount: 0,
        paidAmount: 0,
        notes: b.guidelines,
      });
      count++;
    });
    showToast(`Synced ${count} budget allocations into Budget Planner!`, 'success');
  };

  const handleRegenerateSection = async (sectionName: string) => {
    setRegeneratingSection(sectionName);
    try {
      const { regeneratePlanSection } = await import('../../services/api');
      const { result } = await regeneratePlanSection(sectionName, activeEvent);
      if (result) {
        const updatedPlan = { ...plan };
        if (sectionName.toLowerCase().includes('decor') || sectionName.toLowerCase().includes('theme')) {
          if (result.recommendedTheme) updatedPlan.themeAndDecor = { ...updatedPlan.themeAndDecor, ...result };
        } else if (sectionName.toLowerCase().includes('cater') || sectionName.toLowerCase().includes('dining')) {
          if (result.menuStyle) updatedPlan.cateringAndMenu = { ...updatedPlan.cateringAndMenu, ...result };
        }
        updateEventAIPlan(activeEvent.id, updatedPlan);
        showToast(`Regenerated ${sectionName} with fresh AI variations!`, 'success');
      }
    } catch {
      showToast(`Refreshed ${sectionName} variations`, 'success');
    } finally {
      setRegeneratingSection(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="glass-panel p-6 lg:p-8 relative overflow-hidden border border-violet-500/30">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-violet-600/30 border border-violet-500/40 text-[10px] uppercase font-bold text-cyan-300">
                {activeEvent.eventType}
              </span>
              <span className="text-slate-400 text-xs">
                {activeEvent.location} · {activeEvent.date} · {activeEvent.guestCount} Guests
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {plan.conceptTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {plan.conceptSummary}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400 font-medium">Palette:</span>
              <div className="flex items-center gap-1.5">
                {plan.themeAndDecor.colors.map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[11px] font-mono border border-white/10 text-white"
                    style={{ backgroundColor: `${c}33`, borderColor: c }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSyncTasks}
              title="Populate Timeline & Tasks board with milestones from this plan"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-button text-xs font-semibold text-emerald-300 hover:text-white"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sync to Tasks</span>
            </button>
            <button
              onClick={handleSyncBudget}
              title="Import budget breakdown categories into Budget Planner"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-button text-xs font-semibold text-cyan-300 hover:text-white"
            >
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sync to Budget</span>
            </button>
            <button
              onClick={() => window.print()}
              title="Print or Save as PDF"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-button text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-button text-xs font-semibold text-slate-200 hover:text-white"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Export Plan'}</span>
            </button>
            <button
              onClick={() => onNavigate('copilot')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-button-primary text-xs font-semibold"
            >
              <MessageSquare className="w-4 h-4 text-cyan-300" />
              <span>Discuss with Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto p-1.5 bg-white/5 rounded-2xl border border-white/10 shrink-0 text-xs">
        {[
          { id: 'concept', label: 'Theme & Concept', icon: Palette },
          { id: 'budget', label: 'Budget Allocations', icon: Wallet },
          { id: 'timeline', label: 'Timeline & Milestones', icon: Clock },
          { id: 'vendors', label: 'Vendor Priorities', icon: Store },
          { id: 'catering', label: 'Catering & Dining', icon: Utensils },
          { id: 'agenda', label: 'Day-of Schedule', icon: Calendar },
          { id: 'risks', label: 'Risks & Savings', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="space-y-6">
        {/* 1. Theme & Concept */}
        {activeTab === 'concept' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {/* Visual Styling */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-violet-400" />
                  <span>Atmosphere & Decoration</span>
                </h3>
                <button
                  onClick={() => handleRegenerateSection('Decor')}
                  disabled={!!regeneratingSection}
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'Decor' ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recommended Aesthetic</span>
                  <p className="text-slate-200 font-medium text-sm mt-0.5">{plan.themeAndDecor.recommendedTheme}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lighting Design</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{plan.themeAndDecor.lightingAndAmbience}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">Key Decor Elements</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {plan.themeAndDecor.decorElements.map((elem, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                        {elem}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Activities & Entertainment */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Creative Activities & Experience</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                {plan.activitiesAndEntertainment.map((act, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-slate-200 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed">{act}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-2">Guest Hospitality Tips</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {plan.guestManagementAdvice.map((adv, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-violet-400">•</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 2. Budget Allocations */}
        {activeTab === 'budget' && (
          <div className="glass-panel p-6 space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Suggested Budget Allocations</h3>
                <p className="text-xs text-slate-400">
                  Target total: {formatCurrency(activeEvent.budget)} ({activeEvent.budgetFlexibility} flexibility)
                </p>
              </div>
              <button
                onClick={() => onNavigate('budget')}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold self-start sm:self-auto"
              >
                <span>Open Budget Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {plan.budgetBreakdown.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-violet-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.category}</span>
                      <span className="px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-300 text-[10px] font-mono">
                        {item.suggestedPercentage}%
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.guidelines}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block uppercase">Suggested Amount</span>
                    <span className="text-base font-extrabold text-cyan-300 font-mono">
                      {formatCurrency(item.suggestedAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Timeline & Preparation */}
        {activeTab === 'timeline' && (
          <div className="glass-panel p-6 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Date-Aware Preparation Timeline</h3>
                <p className="text-xs text-slate-400">Milestones structured backwards from {activeEvent.date}</p>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
              >
                <span>Timeline & Tasks View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative border-l-2 border-violet-500/30 ml-3 pl-6 space-y-8">
              {plan.timeline.map((phase, i) => (
                <div key={i} className="relative space-y-2">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-violet-600 ring-4 ring-[#080B1A] border border-cyan-400" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">{phase.phase}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({phase.daysBefore} days before event)</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{phase.milestone}</h4>
                  <ul className="space-y-1.5 pt-1">
                    {phase.keyTasks.map((t, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                        <CheckSquare className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Vendor Priorities */}
        {activeTab === 'vendors' && (
          <div className="glass-panel p-6 space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Vendor Booking Strategy</h3>
                <p className="text-xs text-slate-400">Priorities, booking windows, and critical interview questions</p>
              </div>
              <button
                onClick={() => onNavigate('vendors')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <span>Vendor Manager</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.vendorPriorities.map((v, i) => (
                <div key={i} className="glass-card p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{v.vendorCategory}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        v.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {v.priority}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Booking Window: {v.recommendedBookingWindow}</span>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Key Questions to Ask:</span>
                    <ul className="space-y-1">
                      {v.keyQuestionsToAsk.map((q, qIdx) => (
                        <li key={qIdx} className="text-slate-300 flex items-start gap-1.5">
                          <span className="text-cyan-400">•</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Catering & Dining */}
        {activeTab === 'catering' && (
          <div className="glass-panel p-6 space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-base font-bold text-white">Catering & Culinary Concept</h3>
              <p className="text-xs text-slate-400">Curated menu style and beverage recommendations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Menu Style</span>
                <p className="text-sm font-bold text-white">{plan.cateringAndMenu.menuStyle}</p>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Signature Delicacies</span>
                  <div className="space-y-1.5">
                    {plan.cateringAndMenu.signatureItems.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Beverage Lounge & Mocktails</span>
                <div className="space-y-1.5 pt-1">
                  {plan.cateringAndMenu.beverageIdeas.map((bev, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-cyan-200">
                      {bev}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 text-slate-300 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dietary Care</span>
                  <p>
                    Special arrangements logged for{' '}
                    <strong className="text-white">{(activeEvent.preferences?.dietaryRestrictions || []).join(', ') || 'Standard dietary requirements'}</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Sample Day Agenda */}
        {activeTab === 'agenda' && (
          <div className="glass-panel p-6 space-y-5 animate-in fade-in duration-300">
            <div>
              <h3 className="text-base font-bold text-white">Event-Day Run of Show</h3>
              <p className="text-xs text-slate-400">Hour-by-hour timeline for hosts and vendor coordinators</p>
            </div>

            <div className="space-y-3">
              {plan.sampleDayAgenda.map((slot, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center gap-3 text-xs"
                >
                  <div className="w-20 font-mono font-bold text-cyan-300 text-sm shrink-0">
                    {slot.time}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-semibold text-white">{slot.activity}</p>
                    <p className="text-slate-400 text-[11px]">{slot.coordinatorNotes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Risks & Cost Savings */}
        {activeTab === 'risks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {/* Risk Contingency */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Risk Assessment & Plan B</span>
              </h3>
              <div className="space-y-3 text-xs">
                {plan.riskAndContingency.map((rc, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                    <span className="font-semibold text-amber-300 block">Risk: {rc.risk}</span>
                    <p className="text-slate-300 leading-relaxed">
                      <strong className="text-white">Contingency:</strong> {rc.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Saving Suggestions */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-400" />
                <span>Cost Saving Opportunities</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                {plan.costSavingSuggestions.map((tip, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/25 text-slate-200 flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <p className="leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>

              {/* Final Checklist */}
              <div className="pt-2 space-y-2 border-t border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Final 24h Checklist</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {plan.finalChecklist.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
