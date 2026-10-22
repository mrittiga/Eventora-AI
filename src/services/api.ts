import { EventItem, GeneratedEventPlan, BudgetItem, Vendor } from '../types';

export async function generateAIEventPlan(eventDetails: Partial<EventItem>): Promise<{ plan: GeneratedEventPlan; source: string }> {
  try {
    const res = await fetch('/api/gemini/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventDetails }),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('API call failed, client fallback used:', err);
    throw err;
  }
}

export async function sendCopilotMessage(
  message: string,
  history: { role: string; content: string }[],
  eventContext: any
): Promise<{ reply: string; suggestions: string[]; source: string }> {
  try {
    const res = await fetch('/api/gemini/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, eventContext }),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Copilot API call failed:', err);
    throw err;
  }
}

export async function generateVendorInquiry(
  vendor: Vendor,
  eventContext: any
): Promise<{ result: string; source: string }> {
  try {
    const res = await fetch('/api/gemini/vendor-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor, eventContext }),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Vendor inquiry API call failed:', err);
    throw err;
  }
}

export async function getBudgetAdvice(
  budgetItems: BudgetItem[],
  totalBudget: number,
  currency: string,
  eventType: string
): Promise<{ advice: string; source: string }> {
  try {
    const res = await fetch('/api/gemini/budget-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budgetItems, totalBudget, currency, eventType }),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Budget advice API call failed:', err);
    throw err;
  }
}

export async function regeneratePlanSection(
  section: string,
  eventContext: any
): Promise<{ result: any; source: string }> {
  try {
    const res = await fetch('/api/gemini/regenerate-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, eventContext }),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Regenerate section API call failed:', err);
    throw err;
  }
}

export async function generateAIInspirations(
  eventType: string,
  theme: string
): Promise<{ ideas: any[]; source: string }> {
  try {
    const res = await fetch('/api/gemini/inspire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, theme }),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Inspire API call failed:', err);
    throw err;
  }
}

