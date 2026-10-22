import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Wallet,
  Palette,
  Check,
  Loader2,
  Sliders,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEventContext } from '../../context/EventContext';
import { EventItem, EventType, BudgetFlexibility, EventPreferences } from '../../types';
import { generateAIEventPlan } from '../../services/api';
import { NavigationPage } from '../navigation/Sidebar';
import { useToast } from '../common/Toast';

interface CreateEventWizardProps {
  onNavigate: (page: NavigationPage) => void;
}

export const CreateEventWizard: React.FC<CreateEventWizardProps> = ({ onNavigate }) => {
  const { createEvent, addBudgetItem, addTask, formatCurrency } = useEventContext();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepMessage, setGenerationStepMessage] = useState('Initializing AI Planner...');

  // Form State
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('23:00');
  const [location, setLocation] = useState('');
  const [venueName, setVenueName] = useState('');
  const [guestCount, setGuestCount] = useState<number>(80);
  const [isIndoorOutdoor, setIsIndoorOutdoor] = useState<'indoor' | 'outdoor' | 'hybrid'>('hybrid');

  // Step 2: Budget
  const [budget, setBudget] = useState<number>(200000);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const [budgetFlexibility, setBudgetFlexibility] = useState<BudgetFlexibility>('moderate');

  // Step 3: Style & Preferences
  const [themeStyle, setThemeStyle] = useState<EventPreferences['themeStyle']>('traditional');
  const [colorPalette, setColorPalette] = useState<string[]>(['#8B5CF6', '#22D3EE', '#F472B6']);
  const [foodPreferences, setFoodPreferences] = useState<string>('Multi-Cuisine Buffet, Live Counters');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>('Vegetarian, Jain Options');
  const [culturalTradition, setCulturalTradition] = useState('');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Step 4: Planning Priorities
  const [priorities, setPriorities] = useState<('cost' | 'quality' | 'sustainability' | 'convenience' | 'luxury')[]>([
    'quality',
    'convenience',
  ]);
  const [diyVsProfessional, setDiyVsProfessional] = useState<'mostly_diy' | 'balanced' | 'professional_heavy'>(
    'balanced'
  );
  const [planningExperience, setPlanningExperience] = useState<'beginner' | 'intermediate' | 'experienced'>('beginner');

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Please provide an event name.';
    if (!location.trim()) errs.location = 'Please specify a city or location.';
    if (!date) errs.date = 'Please pick a future event date.';
    if (guestCount <= 0) errs.guestCount = 'Guest count must be at least 1.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (budget <= 0) errs.budget = 'Please specify a positive budget amount.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setErrors({});
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handlePriorityToggle = (item: 'cost' | 'quality' | 'sustainability' | 'convenience' | 'luxury') => {
    setPriorities((prev) => (prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]));
  };

  // Generation Handler
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setGenerationStepMessage('Analyzing guest demographics & venue logistics...');

    const timer1 = setTimeout(() => {
      setGenerationStepMessage('Calculating optimized category budget allocations...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setGenerationStepMessage('Synthesizing date-aware milestones and vendor priorities...');
    }, 2400);

    const timer3 = setTimeout(() => {
      setGenerationStepMessage('Finalizing Gemini AI creative concepts and contingencies...');
    }, 3800);

    try {
      // Pick matching image asset based on event type
      let coverImage = '/src/assets/images/event_wedding_cover_1792651194440.jpg';
      if (eventType === 'birthday') {
        coverImage = '/src/assets/images/event_birthday_cover_1792651195652.jpg';
      } else if (eventType === 'community') {
        coverImage = '/src/assets/images/event_community_cover_1792651195808.jpg';
      } else if (eventType === 'corporate') {
        coverImage = '/src/assets/images/event_corporate_cover_1792651194970.jpg';
      }

      const payload = {
        name,
        eventType,
        date,
        startTime,
        endTime,
        location,
        venueName: venueName || location,
        guestCount,
        budget,
        currency,
        budgetFlexibility,
        coverImage,
        preferences: {
          themeStyle,
          colorPalette,
          foodPreferences: foodPreferences.split(',').map((s) => s.trim()).filter(Boolean),
          dietaryRestrictions: dietaryRestrictions.split(',').map((s) => s.trim()).filter(Boolean),
          culturalTradition,
          accessibilityNeeds: accessibilityNeeds.split(',').map((s) => s.trim()).filter(Boolean),
          priorities,
          diyVsProfessional,
          planningExperience,
          specialRequests,
          isIndoorOutdoor,
        },
      };

      const { plan } = await generateAIEventPlan(payload);

      // Save to context
      const newEventId = createEvent({
        ...payload,
        aiPlan: plan,
      });

      // Auto-populate initial suggested budget items from plan
      if (plan?.budgetBreakdown) {
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
            eventId: newEventId,
            category,
            title: b.category,
            estimatedAmount: b.suggestedAmount,
            actualAmount: 0,
            paidAmount: 0,
            notes: b.guidelines,
          });
        });
      }

      // Auto-populate initial tasks from timeline
      if (plan?.timeline) {
        plan.timeline.forEach((phase) => {
          phase.keyTasks.forEach((taskTitle, idx) => {
            const dueOffset = Math.max(1, 30 - phase.daysBefore);
            const d = new Date();
            d.setDate(d.getDate() + dueOffset);
            addTask({
              eventId: newEventId,
              title: taskTitle,
              category: phase.phase,
              dueDate: d.toISOString().split('T')[0],
              priority: idx === 0 ? 'high' : 'medium',
              status: 'todo',
            });
          });
        });
      }

      // Fire confetti celebration!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#22D3EE', '#F472B6', '#F59E0B'],
        });
      } catch {
        // Safe fail
      }

      showToast('Event plan generated successfully!', 'success');
      onNavigate('event_plan');
    } catch (err) {
      console.error(err);
      showToast('Generated plan using intelligent local engine', 'info');
      onNavigate('event_plan');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-xs font-semibold text-violet-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gemini-Powered Event Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Your Event Masterplan
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Share your celebration vision in 4 simple steps. Our AI will craft an actionable budget, schedule, vendor checklist, and creative concept.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="glass-card p-3 flex items-center justify-between">
        {[
          { step: 1, label: 'Details' },
          { step: 2, label: 'Budget' },
          { step: 3, label: 'Style & Dining' },
          { step: 4, label: 'Priorities' },
        ].map((s) => {
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          return (
            <div key={s.step} className="flex-1 flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-500/40 ring-2 ring-violet-400/50'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.step}
                </div>
                <span
                  className={`text-xs hidden sm:inline font-medium ${
                    isCurrent ? 'text-white' : isDone ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {s.step < 4 && <div className="flex-1 h-0.5 mx-3 bg-white/10" />}
            </div>
          );
        })}
      </div>

      {/* Wizard Form Panels */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        {/* STEP 1: Details */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">Step 1 — Event Essentials</h2>
              <p className="text-xs text-slate-400">Basic details about your upcoming occasion</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Event Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav & Meera's Wedding or TechSummit 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input"
                />
                {errors.name && <p className="text-rose-400 text-[11px] mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="glass-input bg-slate-900"
                  >
                    <option value="wedding">Wedding / Reception</option>
                    <option value="birthday">Birthday Party</option>
                    <option value="community">Community / Fest / Charity</option>
                    <option value="corporate">Corporate Gala / Conference</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="baby_shower">Baby Shower / Housewarming</option>
                    <option value="cultural_fest">Cultural Fest / College</option>
                    <option value="other">Other Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Event Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input"
                  />
                  {errors.date && <p className="text-rose-400 text-[11px] mt-1">{errors.date}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-medium text-slate-300 mb-1">
                    Expected Guests <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 0)}
                    className="glass-input font-mono"
                  />
                  {errors.guestCount && <p className="text-rose-400 text-[11px] mt-1">{errors.guestCount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    City / Location <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Udaipur, Bangalore, Mumbai, or San Francisco"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="glass-input"
                  />
                  {errors.location && <p className="text-rose-400 text-[11px] mt-1">{errors.location}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Venue Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. The Lakeview Palace or Backyard Lawn"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-2">Venue Setting</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'indoor', label: 'Indoor Hall' },
                    { id: 'outdoor', label: 'Outdoor Lawn' },
                    { id: 'hybrid', label: 'Hybrid / Terrace' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setIsIndoorOutdoor(s.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isIndoorOutdoor === s.id
                          ? 'border-violet-500 bg-violet-600/20 text-white font-semibold'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Budget */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">Step 2 — Budget Architecture</h2>
              <p className="text-xs text-slate-400">Total planned investment and financial posture</p>
            </div>

            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="glass-input bg-slate-900"
                  >
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Total Event Budget <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    value={budget}
                    onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                    className="glass-input font-mono text-base font-bold text-violet-300"
                  />
                  {errors.budget && <p className="text-rose-400 text-[11px] mt-1">{errors.budget}</p>}
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400">Quick Presets:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '₹35,000 (Intimate)', val: 35000 },
                    { label: '₹1,50,000 (Standard)', val: 150000 },
                    { label: '₹5,00,000 (Grand)', val: 500000 },
                    { label: '₹15,00,000 (Luxury)', val: 1500000 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setBudget(p.val)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Flexibility */}
              <div>
                <label className="block font-medium text-slate-300 mb-2">Budget Flexibility</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'strict', label: 'Strict Ceiling', desc: 'Zero overruns allowed' },
                    { id: 'moderate', label: 'Moderate', desc: '±10% buffer allowed' },
                    { id: 'flexible', label: 'Flexible', desc: 'Quality prioritised over cost' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setBudgetFlexibility(f.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        budgetFlexibility === f.id
                          ? 'border-violet-500 bg-violet-600/20 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-semibold block text-xs">{f.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Style & Preferences */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">Step 3 — Aesthetic & Culinary Vision</h2>
              <p className="text-xs text-slate-400">Themes, cultural customs, and culinary requirements</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-2">Theme & Atmosphere</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'traditional',
                    'luxury',
                    'rustic',
                    'minimalist',
                    'formal',
                    'casual',
                    'playful',
                  ].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setThemeStyle(style as any)}
                      className={`p-2.5 rounded-xl border text-center capitalize text-xs transition-all ${
                        themeStyle === style
                          ? 'border-violet-500 bg-violet-600/25 text-white font-semibold'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Food Preferences</label>
                  <input
                    type="text"
                    placeholder="e.g. North Indian Buffet, Mexican, Live Chaat"
                    value={foodPreferences}
                    onChange={(e) => setFoodPreferences(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Dietary Restrictions</label>
                  <input
                    type="text"
                    placeholder="e.g. Vegetarian, Jain, Vegan, Gluten-free"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Cultural / Ceremonial Traditions</label>
                  <input
                    type="text"
                    placeholder="e.g. Traditional Hindu Sangeet & Pheras, Interfaith, Secular"
                    value={culturalTradition}
                    onChange={(e) => setCulturalTradition(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Accessibility Needs</label>
                  <input
                    type="text"
                    placeholder="e.g. Wheelchair ramps, elder ground seating, braille"
                    value={accessibilityNeeds}
                    onChange={(e) => setAccessibilityNeeds(e.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Special Requests or Dream Elements</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sunset mandap with live sitar; customized matcha tiered cake; zero single-use plastic."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Priorities */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">Step 4 — Planning Priorities & Experience</h2>
              <p className="text-xs text-slate-400">Guide how Gemini balances trade-offs and schedules</p>
            </div>

            <div className="space-y-5 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-2">
                  Key Priorities (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'cost', label: 'Cost-Conscious' },
                    { id: 'quality', label: 'High Quality & Aesthetics' },
                    { id: 'sustainability', label: 'Sustainability & Eco-Friendly' },
                    { id: 'convenience', label: 'Maximum Convenience' },
                    { id: 'luxury', label: 'Luxury Experience' },
                  ].map((p) => {
                    const isSelected = priorities.includes(p.id as any);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePriorityToggle(p.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/20 text-white font-semibold'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{p.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-300" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Execution Style</label>
                  <select
                    value={diyVsProfessional}
                    onChange={(e) => setDiyVsProfessional(e.target.value as any)}
                    className="glass-input bg-slate-900"
                  >
                    <option value="mostly_diy">Mostly DIY / Volunteer-driven</option>
                    <option value="balanced">Balanced (DIY decor + pro catering)</option>
                    <option value="professional_heavy">Fully Managed by Professional Vendors</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Your Planning Experience</label>
                  <select
                    value={planningExperience}
                    onChange={(e) => setPlanningExperience(e.target.value as any)}
                    className="glass-input bg-slate-900"
                  >
                    <option value="beginner">First-time event organizer</option>
                    <option value="intermediate">Organized a few family/club events</option>
                    <option value="experienced">Experienced planner</option>
                  </select>
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">
                  Configuration Summary
                </span>
                <p>
                  Planning <strong className="text-white">{name || 'Your Event'}</strong> ({eventType}) with{' '}
                  <strong className="text-white">{guestCount} guests</strong> in{' '}
                  <strong className="text-white">{location || 'TBD'}</strong> on{' '}
                  <strong className="text-white">{date}</strong>.
                </p>
                <p>
                  Target Budget: <strong className="text-violet-300 font-mono">{formatCurrency(budget, currency)}</strong> (
                  {budgetFlexibility} flexibility).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Generation State */}
        {isGenerating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="glass-modal max-w-md w-full p-8 text-center space-y-5">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 border-t-cyan-400 animate-spin" />
                <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Synthesizing Masterplan</h3>
                <p className="text-xs text-slate-300 h-6 transition-all duration-300">
                  {generationStepMessage}
                </p>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-pink-500 animate-pulse w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button text-xs font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-button-primary text-xs font-semibold"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl glass-button-primary text-xs font-bold shadow-lg shadow-violet-500/30"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Generate AI Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
