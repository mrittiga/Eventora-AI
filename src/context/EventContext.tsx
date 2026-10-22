import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  EventItem,
  BudgetItem,
  Task,
  Vendor,
  Guest,
  InspirationItem,
  GeneratedEventPlan,
} from '../types';
import { createInitialSeedData } from '../data/seedData';

interface ReadinessResult {
  score: number;
  breakdown: {
    tasksScore: number;
    vendorScore: number;
    budgetScore: number;
    guestScore: number;
  };
  urgentActions: string[];
}

interface EventContextType {
  events: EventItem[];
  activeEventId: string | null;
  activeEvent: EventItem | undefined;
  setActiveEventId: (id: string) => void;
  createEvent: (newEvent: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEvent: (event: EventItem) => void;
  deleteEvent: (id: string) => void;
  updateEventAIPlan: (eventId: string, plan: GeneratedEventPlan) => void;

  // Budget
  budgetItems: BudgetItem[];
  activeBudgetItems: BudgetItem[];
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (item: BudgetItem) => void;
  deleteBudgetItem: (id: string) => void;

  // Tasks
  tasks: Task[];
  activeTasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Vendors
  vendors: Vendor[];
  activeVendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;

  // Guests
  guests: Guest[];
  activeGuests: Guest[];
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (guest: Guest) => void;
  deleteGuest: (id: string) => void;
  importGuestsFromCSV: (csvText: string, eventId: string) => { added: number; errors: string[] };

  // Inspiration
  inspirations: InspirationItem[];
  activeInspirations: InspirationItem[];
  addInspiration: (item: Omit<InspirationItem, 'id' | 'savedAt'>) => void;
  deleteInspiration: (id: string) => void;

  // Helpers & Stats
  formatCurrency: (amount: number, currencyCode?: string) => string;
  getEventReadiness: (eventId?: string) => ReadinessResult;
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const STORAGE_KEY = 'EVENTORA_AI_DATA_V1';

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load data from localStorage or seed
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.events) && parsed.events.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse stored Eventora data:', e);
    }
    return createInitialSeedData();
  });

  const [activeEventId, setActiveEventId] = useState<string | null>(() => {
    if (data.events && data.events.length > 0) {
      return data.events[0].id;
    }
    return null;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data]);

  const events: EventItem[] = data.events || [];
  const budgetItems: BudgetItem[] = data.budgetItems || [];
  const tasks: Task[] = data.tasks || [];
  const vendors: Vendor[] = data.vendors || [];
  const guests: Guest[] = data.guests || [];
  const inspirations: InspirationItem[] = data.inspirations || [];

  const activeEvent = useMemo(() => {
    return events.find((e) => e.id === activeEventId) || events[0];
  }, [events, activeEventId]);

  const activeBudgetItems = useMemo(() => {
    if (!activeEvent) return [];
    return budgetItems.filter((b) => b.eventId === activeEvent.id);
  }, [budgetItems, activeEvent]);

  const activeTasks = useMemo(() => {
    if (!activeEvent) return [];
    return tasks.filter((t) => t.eventId === activeEvent.id);
  }, [tasks, activeEvent]);

  const activeVendors = useMemo(() => {
    if (!activeEvent) return [];
    return vendors.filter((v) => v.eventId === activeEvent.id);
  }, [vendors, activeEvent]);

  const activeGuests = useMemo(() => {
    if (!activeEvent) return [];
    return guests.filter((g) => g.eventId === activeEvent.id);
  }, [guests, activeEvent]);

  const activeInspirations = useMemo(() => {
    if (!activeEvent) return inspirations;
    return inspirations.filter((i) => !i.eventId || i.eventId === activeEvent.id);
  }, [inspirations, activeEvent]);

  // Event actions
  const createEvent = (newEventData: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `event-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const event: EventItem = {
      ...newEventData,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setData((prev: typeof data) => ({
      ...prev,
      events: [event, ...prev.events],
    }));
    setActiveEventId(id);
    return id;
  };

  const updateEvent = (updated: EventItem) => {
    const timestamp = new Date().toISOString();
    setData((prev: typeof data) => ({
      ...prev,
      events: prev.events.map((e: EventItem) => (e.id === updated.id ? { ...updated, updatedAt: timestamp } : e)),
    }));
  };

  const deleteEvent = (id: string) => {
    setData((prev: typeof data) => {
      const remainingEvents = prev.events.filter((e: EventItem) => e.id !== id);
      return {
        events: remainingEvents,
        budgetItems: prev.budgetItems.filter((b: BudgetItem) => b.eventId !== id),
        tasks: prev.tasks.filter((t: Task) => t.eventId !== id),
        vendors: prev.vendors.filter((v: Vendor) => v.eventId !== id),
        guests: prev.guests.filter((g: Guest) => g.eventId !== id),
        inspirations: prev.inspirations.filter((i: InspirationItem) => i.eventId !== id),
      };
    });

    if (activeEventId === id) {
      const remaining = events.filter((e) => e.id !== id);
      setActiveEventId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updateEventAIPlan = (eventId: string, plan: GeneratedEventPlan) => {
    setData((prev: typeof data) => ({
      ...prev,
      events: prev.events.map((e: EventItem) => (e.id === eventId ? { ...e, aiPlan: plan, updatedAt: new Date().toISOString() } : e)),
    }));
  };

  // Budget actions
  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const id = `budget-${Date.now()}`;
    setData((prev: typeof data) => ({
      ...prev,
      budgetItems: [...prev.budgetItems, { ...item, id }],
    }));
  };

  const updateBudgetItem = (updated: BudgetItem) => {
    setData((prev: typeof data) => ({
      ...prev,
      budgetItems: prev.budgetItems.map((b: BudgetItem) => (b.id === updated.id ? updated : b)),
    }));
  };

  const deleteBudgetItem = (id: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      budgetItems: prev.budgetItems.filter((b: BudgetItem) => b.id !== id),
    }));
  };

  // Task actions
  const addTask = (task: Omit<Task, 'id'>) => {
    const id = `task-${Date.now()}`;
    setData((prev: typeof data) => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id }],
    }));
  };

  const updateTask = (updated: Task) => {
    setData((prev: typeof data) => ({
      ...prev,
      tasks: prev.tasks.map((t: Task) => (t.id === updated.id ? updated : t)),
    }));
  };

  const deleteTask = (id: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      tasks: prev.tasks.filter((t: Task) => t.id !== id),
    }));
  };

  const toggleTaskStatus = (id: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      tasks: prev.tasks.map((t: Task) => {
        if (t.id === id) {
          const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      }),
    }));
  };

  // Vendor actions
  const addVendor = (vendor: Omit<Vendor, 'id'>) => {
    const id = `vendor-${Date.now()}`;
    setData((prev: typeof data) => ({
      ...prev,
      vendors: [...prev.vendors, { ...vendor, id }],
    }));
  };

  const updateVendor = (updated: Vendor) => {
    setData((prev: typeof data) => ({
      ...prev,
      vendors: prev.vendors.map((v: Vendor) => (v.id === updated.id ? updated : v)),
    }));
  };

  const deleteVendor = (id: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      vendors: prev.vendors.filter((v: Vendor) => v.id !== id),
    }));
  };

  // Guest actions
  const addGuest = (guest: Omit<Guest, 'id'>) => {
    const id = `guest-${Date.now()}`;
    setData((prev: typeof data) => ({
      ...prev,
      guests: [...prev.guests, { ...guest, id }],
    }));
  };

  const updateGuest = (updated: Guest) => {
    setData((prev: typeof data) => ({
      ...prev,
      guests: prev.guests.map((g: Guest) => (g.id === updated.id ? updated : g)),
    }));
  };

  const deleteGuest = (id: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      guests: prev.guests.filter((g: Guest) => g.id !== id),
    }));
  };

  const importGuestsFromCSV = (csvText: string, eventId: string) => {
    const lines = csvText.trim().split('\n');
    let added = 0;
    const errors: string[] = [];
    const newGuests: Guest[] = [];

    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('name')) {
        // Skip header
        return;
      }
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 1 && parts[0]) {
        const name = parts[0];
        const contact = parts[1] || '';
        const groupRaw = (parts[2] || 'general').toLowerCase();
        const validGroup = ['family', 'friends', 'colleagues', 'vip', 'community', 'general'].includes(groupRaw)
          ? (groupRaw as any)
          : 'general';
        const dietary = parts[3] || '';
        const additionalGuests = parseInt(parts[4] || '0', 10) || 0;

        newGuests.push({
          id: `guest-${Date.now()}-${index}`,
          eventId,
          name,
          contact,
          group: validGroup,
          rsvpStatus: 'pending',
          additionalGuests,
          dietaryPreferences: dietary,
          invitationStatus: 'not_sent',
        });
        added++;
      }
    });

    if (newGuests.length > 0) {
      setData((prev: typeof data) => ({
        ...prev,
        guests: [...prev.guests, ...newGuests],
      }));
    }

    return { added, errors };
  };

  // Inspiration actions
  const addInspiration = (item: Omit<InspirationItem, 'id' | 'savedAt'>) => {
    const id = `ins-${Date.now()}`;
    const newItem: InspirationItem = {
      ...item,
      id,
      savedAt: new Date().toISOString(),
    };
    setData((prev: typeof data) => ({
      ...prev,
      inspirations: [newItem, ...prev.inspirations],
    }));
  };

  const deleteInspiration = (id: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      inspirations: prev.inspirations.filter((i: InspirationItem) => i.id !== id),
    }));
  };

  // Currency helper
  const formatCurrency = (amount: number, currencyCode?: string): string => {
    const code = currencyCode || activeEvent?.currency || 'INR';
    try {
      if (code === 'INR') {
        // Format with Indian numbering system: ₹1,00,000
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(amount);
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `₹${amount.toLocaleString()}`;
    }
  };

  // Event Readiness Score Calculator (Transparent, real-data formula)
  const getEventReadiness = (eventId?: string): ReadinessResult => {
    const targetId = eventId || activeEvent?.id;
    if (!targetId) {
      return {
        score: 0,
        breakdown: { tasksScore: 0, vendorScore: 0, budgetScore: 0, guestScore: 0 },
        urgentActions: ['Select or create an event to begin planning.'],
      };
    }

    const currentEvent = events.find((e) => e.id === targetId);
    const evTasks = tasks.filter((t) => t.eventId === targetId);
    const evVendors = vendors.filter((v) => v.eventId === targetId);
    const evBudget = budgetItems.filter((b) => b.eventId === targetId);
    const evGuests = guests.filter((g) => g.eventId === targetId);

    const urgentActions: string[] = [];

    // 1. Task Score (max 30 pts)
    let tasksScore = 0;
    if (evTasks.length === 0) {
      tasksScore = 10;
      urgentActions.push('Generate or add preparation tasks for your timeline.');
    } else {
      const completed = evTasks.filter((t) => t.status === 'completed').length;
      tasksScore = Math.round((completed / evTasks.length) * 30);
      const overdueTasks = evTasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < new Date());
      if (overdueTasks.length > 0) {
        urgentActions.push(`${overdueTasks.length} task(s) are past their due dates.`);
      }
    }

    // 2. Vendor Score (max 25 pts)
    let vendorScore = 0;
    if (evVendors.length === 0) {
      urgentActions.push('Add and shortlist critical vendors (venue, catering, decor).');
    } else {
      const booked = evVendors.filter((v) => v.bookingStatus === 'booked').length;
      vendorScore = Math.round((booked / evVendors.length) * 25);
      const pendingContracts = evVendors.filter((v) => v.bookingStatus === 'booked' && v.contractStatus !== 'signed');
      if (pendingContracts.length > 0) {
        urgentActions.push(`${pendingContracts.length} booked vendor(s) need signed contracts.`);
      }
    }

    // 3. Budget Score (max 25 pts)
    let budgetScore = 25;
    if (currentEvent && currentEvent.budget > 0) {
      const totalEstimated = evBudget.reduce((sum, b) => sum + (b.estimatedAmount || 0), 0);
      const variance = currentEvent.budget - totalEstimated;
      if (totalEstimated === 0) {
        budgetScore = 12;
        urgentActions.push('Allocate estimated expenses to your budget categories.');
      } else if (variance < 0) {
        const overrunRatio = Math.abs(variance) / currentEvent.budget;
        if (overrunRatio > 0.15) {
          budgetScore = 8;
          urgentActions.push(`Budget overrun by ${formatCurrency(Math.abs(variance), currentEvent.currency)}.`);
        } else {
          budgetScore = 18;
          urgentActions.push(`Expenses slightly exceed budget by ${formatCurrency(Math.abs(variance), currentEvent.currency)}.`);
        }
      } else {
        budgetScore = 25;
      }
    }

    // 4. Guest RSVP Score (max 20 pts)
    let guestScore = 0;
    if (evGuests.length === 0) {
      guestScore = 5;
      urgentActions.push('Import or add guest list to begin tracking invitations and dietary requirements.');
    } else {
      const responded = evGuests.filter((g) => g.rsvpStatus !== 'pending').length;
      guestScore = Math.round((responded / evGuests.length) * 20);
      const pendingRsvps = evGuests.filter((g) => g.rsvpStatus === 'pending').length;
      if (pendingRsvps > 5) {
        urgentActions.push(`${pendingRsvps} guests have not responded to RSVPs.`);
      }
    }

    const totalScore = Math.min(100, tasksScore + vendorScore + budgetScore + guestScore);

    return {
      score: totalScore,
      breakdown: {
        tasksScore,
        vendorScore,
        budgetScore,
        guestScore,
      },
      urgentActions: urgentActions.slice(0, 4),
    };
  };

  const resetToDemoData = () => {
    const initial = createInitialSeedData();
    setData(initial);
    if (initial.events.length > 0) {
      setActiveEventId(initial.events[0].id);
    }
  };

  const clearAllData = () => {
    setData({
      events: [],
      budgetItems: [],
      tasks: [],
      vendors: [],
      guests: [],
      inspirations: [],
    });
    setActiveEventId(null);
  };

  return (
    <EventContext.Provider
      value={{
        events,
        activeEventId,
        activeEvent,
        setActiveEventId,
        createEvent,
        updateEvent,
        deleteEvent,
        updateEventAIPlan,

        budgetItems,
        activeBudgetItems,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,

        tasks,
        activeTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,

        vendors,
        activeVendors,
        addVendor,
        updateVendor,
        deleteVendor,

        guests,
        activeGuests,
        addGuest,
        updateGuest,
        deleteGuest,
        importGuestsFromCSV,

        inspirations,
        activeInspirations,
        addInspiration,
        deleteInspiration,

        formatCurrency,
        getEventReadiness,
        resetToDemoData,
        clearAllData,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
