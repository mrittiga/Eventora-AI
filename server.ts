import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Generate Full Event Plan Endpoint
app.post('/api/gemini/plan', async (req: Request, res: Response) => {
  const { eventDetails } = req.body;
  if (!eventDetails) {
    return res.status(400).json({ error: 'Missing eventDetails payload' });
  }

  // If Gemini API is available, generate live structured plan
  if (ai) {
    try {
      const prompt = `You are Eventora AI, a world-class luxury and community event planner.
Generate a comprehensive, highly personalized, actionable event plan in JSON for the following event:
Event Name: ${eventDetails.name}
Event Type: ${eventDetails.eventType}
Date: ${eventDetails.date}
Location: ${eventDetails.location}
Guest Count: ${eventDetails.guestCount}
Budget: ${eventDetails.currency} ${eventDetails.budget} (${eventDetails.budgetFlexibility} flexibility)
Indoor/Outdoor: ${eventDetails.preferences?.isIndoorOutdoor || 'indoor'}
Theme Style: ${eventDetails.preferences?.themeStyle || 'custom'}
Food Preferences: ${(eventDetails.preferences?.foodPreferences || []).join(', ')}
Dietary Restrictions: ${(eventDetails.preferences?.dietaryRestrictions || []).join(', ')}
Cultural Traditions: ${eventDetails.preferences?.culturalTradition || 'None specified'}
Accessibility Needs: ${(eventDetails.preferences?.accessibilityNeeds || []).join(', ')}
Priorities: ${(eventDetails.preferences?.priorities || []).join(', ')}
Planning Preferences: DIY vs Pro: ${eventDetails.preferences?.diyVsProfessional}, Experience: ${eventDetails.preferences?.planningExperience}
Special Requests: ${eventDetails.preferences?.specialRequests || 'None'}

Provide an inspiring, specific, culturally respectful, and realistic plan adhering to the specified budget.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are Eventora AI, an elite event planner and budgeting strategist. Always output valid JSON strictly matching the provided schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conceptTitle: { type: Type.STRING },
              conceptSummary: { type: Type.STRING },
              themeAndDecor: {
                type: Type.OBJECT,
                properties: {
                  recommendedTheme: { type: Type.STRING },
                  colors: { type: Type.ARRAY, items: { type: Type.STRING } },
                  decorElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  lightingAndAmbience: { type: Type.STRING },
                },
                required: ['recommendedTheme', 'colors', 'decorElements', 'lightingAndAmbience'],
              },
              budgetBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    suggestedPercentage: { type: Type.NUMBER },
                    suggestedAmount: { type: Type.NUMBER },
                    guidelines: { type: Type.STRING },
                  },
                  required: ['category', 'suggestedPercentage', 'suggestedAmount', 'guidelines'],
                },
              },
              timeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    daysBefore: { type: Type.NUMBER },
                    milestone: { type: Type.STRING },
                    keyTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['phase', 'daysBefore', 'milestone', 'keyTasks'],
                },
              },
              vendorPriorities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    vendorCategory: { type: Type.STRING },
                    recommendedBookingWindow: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    keyQuestionsToAsk: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['vendorCategory', 'recommendedBookingWindow', 'priority', 'keyQuestionsToAsk'],
                },
              },
              guestManagementAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
              cateringAndMenu: {
                type: Type.OBJECT,
                properties: {
                  menuStyle: { type: Type.STRING },
                  signatureItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                  beverageIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['menuStyle', 'signatureItems', 'beverageIdeas'],
              },
              sampleDayAgenda: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    activity: { type: Type.STRING },
                    coordinatorNotes: { type: Type.STRING },
                  },
                  required: ['time', 'activity', 'coordinatorNotes'],
                },
              },
              activitiesAndEntertainment: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskAndContingency: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    risk: { type: Type.STRING },
                    solution: { type: Type.STRING },
                  },
                  required: ['risk', 'solution'],
                },
              },
              costSavingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              finalChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'conceptTitle',
              'conceptSummary',
              'themeAndDecor',
              'budgetBreakdown',
              'timeline',
              'vendorPriorities',
              'guestManagementAdvice',
              'cateringAndMenu',
              'sampleDayAgenda',
              'activitiesAndEntertainment',
              'riskAndContingency',
              'costSavingSuggestions',
              'finalChecklist',
            ],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({ plan: parsed, source: 'gemini' });
      }
    } catch (err: any) {
      console.warn('Gemini Plan Generation error, falling back to smart dynamic generator:', err?.message || err);
    }
  }

  // Fallback intelligent plan generator matching exact schema
  const plan = generateSmartFallbackPlan(eventDetails);
  return res.json({ plan, source: 'fallback_engine' });
});

// 2. Copilot Chat Endpoint
app.post('/api/gemini/copilot', async (req: Request, res: Response) => {
  const { message, history, eventContext } = req.body;

  if (ai) {
    try {
      const systemInstruction = `You are Eventora Copilot, a helpful, highly knowledgeable AI event planning director.
Active Event Context:
- Name: ${eventContext?.name || 'Upcoming Event'}
- Type: ${eventContext?.eventType || 'Celebration'}
- Date: ${eventContext?.date || 'Upcoming'}
- Location: ${eventContext?.location || 'TBD'}
- Guests: ${eventContext?.guestCount || 0}
- Budget: ${eventContext?.currency || 'INR'} ${eventContext?.budget || 0}
- Readiness Score: ${eventContext?.readinessScore || 0}%
- Urgent Alerts: ${(eventContext?.urgentActions || []).join('; ')}

Be empathetic, concise, creative, and tactical. Offer concrete advice, budget breakdowns, cultural nuances, or timeline suggestions.
Provide 2-3 quick follow-up prompt suggestions at the very end formatted as:
SUGGESTIONS: [Suggestion 1] | [Suggestion 2] | [Suggestion 3]`;

      const contents = (history || []).map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      }));

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const rawText = response.text || '';
      let replyText = rawText;
      let suggestions: string[] = [];

      if (rawText.includes('SUGGESTIONS:')) {
        const parts = rawText.split('SUGGESTIONS:');
        replyText = parts[0].trim();
        suggestions = parts[1]
          .split('|')
          .map((s) => s.trim().replace(/^\[|\]$/g, ''))
          .filter(Boolean);
      } else {
        suggestions = [
          'How can I save 15% on catering?',
          'Create a 30-day countdown checklist',
          'What questions should I ask my venue?',
        ];
      }

      return res.json({ reply: replyText, suggestions, source: 'gemini' });
    } catch (e: any) {
      console.warn('Gemini Copilot chat error, falling back:', e?.message || e);
    }
  }

  // Fallback assistant response
  const { reply, suggestions } = generateSmartCopilotResponse(message, eventContext);
  return res.json({ reply, suggestions, source: 'fallback_engine' });
});

// 3. Vendor Inquiry Generator
app.post('/api/gemini/vendor-inquiry', async (req: Request, res: Response) => {
  const { vendor, eventContext } = req.body;

  if (ai) {
    try {
      const prompt = `Write a polite, professional, and clear vendor inquiry email draft for a ${vendor.category} named "${vendor.name}".
Event Name: ${eventContext.name}
Event Date: ${eventContext.date}
Location: ${eventContext.location}
Guest Count: ${eventContext.guestCount}
Budget for this category: ${eventContext.currency} ${vendor.quotedAmount || 'Flexible'}
Special notes: ${vendor.notes || 'None'}

Also provide 4 crucial questions to ask this vendor before signing a contract.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ result: response.text, source: 'gemini' });
    } catch (err: any) {
      console.warn('Vendor inquiry generation error:', err?.message || err);
    }
  }

  // Fallback inquiry draft
  const fallbackText = `Subject: Inquiry: Availability & Quotation for ${eventContext?.name || 'Upcoming Event'} on ${eventContext?.date || 'Event Date'}

Dear ${vendor?.contactPerson || vendor?.name || 'Vendor Team'},

I hope this message finds you well. We are currently organizing "${eventContext?.name || 'our upcoming celebration'}" scheduled for ${eventContext?.date || 'an upcoming date'} in ${eventContext?.location || 'our city'} with approximately ${eventContext?.guestCount || 50} guests.

We came across your stellar work in ${vendor?.category || 'event services'} and would love to learn more about your availability and package options. We are planning a budget allocation around ${eventContext?.currency || 'INR'} ${(vendor?.quotedAmount || 50000).toLocaleString()}.

Could you please share:
1. Your availability for ${eventContext?.date || 'our target date'}.
2. A comprehensive service brochure and sample package breakdown.
3. Details on your advance deposit and cancellation policies.

Key questions before booking:
• What is included in your standard package vs extra add-on costs?
• How many hours of on-site service and staff are provided?
• What is your backup contingency in case of illness or equipment failure?
• By what date do you require final headcounts and specifications?

Looking forward to hearing from you soon!

Warm regards,
Event Planning Team`;

  return res.json({ result: fallbackText, source: 'fallback_engine' });
});

// 4. Budget Reallocation Advice
app.post('/api/gemini/budget-advice', async (req: Request, res: Response) => {
  const { budgetItems, totalBudget, currency, eventType } = req.body;

  if (ai) {
    try {
      const itemsSummary = (budgetItems || [])
        .map((b: any) => `${b.category} (${b.title}): Estimated ${currency} ${b.estimatedAmount}, Actual ${currency} ${b.actualAmount}`)
        .join('\n');

      const prompt = `Analyze this event budget for a ${eventType} with total budget ${currency} ${totalBudget}:
Current Line Items:
${itemsSummary}

Provide:
1. Overall budget health assessment (overrun or savings).
2. 3 specific category reallocation recommendations.
3. 3 practical ways to save without compromising guest experience.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ advice: response.text, source: 'gemini' });
    } catch (e: any) {
      console.warn('Budget advice error:', e?.message || e);
    }
  }

  return res.json({
    advice: `### 📊 Smart Budget Health Assessment
Your total budget is **${currency} ${totalBudget.toLocaleString()}**.

1. **Strategic Category Reallocation**:
   • **Venue & Decor Synergy**: Negotiate with the venue to provide standard chiavari chairs and stage drapery to free up 10-15% of your decor budget.
   • **Catering Optimization**: Replace 2 heavy meat/imported items with high-appeal regional live cooking counters (chaat/pasta/tacos) to reduce per-plate costs by 12%.
   • **Contingency Buffer**: Ensure at least 5% (${currency} ${Math.round(totalBudget * 0.05).toLocaleString()}) is uncommitted for unexpected transport or electricity setup fees.

2. **Immediate Actionable Savings**:
   • Send interactive digital video invitations rather than physical luxury print boxes.
   • Hire local student musicians or duo performers for the afternoon welcome instead of a full band.
   • Book photography and videography as an integrated bundle with one studio.`,
    source: 'fallback_engine',
  });
});

// 5. Regenerate Individual Plan Section
app.post('/api/gemini/regenerate-section', async (req: Request, res: Response) => {
  const { section, eventContext } = req.body;
  if (!section || !eventContext) {
    return res.status(400).json({ error: 'Missing section or eventContext' });
  }

  if (ai) {
    try {
      const prompt = `As Eventora AI, generate a fresh, distinctive new variation for the "${section}" section of:
Event: ${eventContext.name} (${eventContext.eventType})
Location: ${eventContext.location} | Date: ${eventContext.date}
Guest Count: ${eventContext.guestCount} | Budget: ${eventContext.currency} ${eventContext.budget}
Theme: ${eventContext.preferences?.themeStyle || 'contemporary'}

Return a valid JSON object matching the requested section.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        return res.json({ result: JSON.parse(response.text.trim()), source: 'gemini' });
      }
    } catch (e: any) {
      console.warn('Regenerate section error, using smart generator:', e?.message || e);
    }
  }

  // Smart fallback per section
  const isWedding = eventContext.eventType === 'wedding';
  if (section.toLowerCase().includes('decor') || section.toLowerCase().includes('theme')) {
    return res.json({
      result: {
        recommendedTheme: isWedding ? 'Luminous Royal Jasmine & Antique Brass' : 'Sunset Terracotta & Neon Amber',
        colors: isWedding ? ['#BE185D', '#F59E0B', '#8B5CF6', '#FDE68A'] : ['#F43F5E', '#FB923C', '#FBBF24', '#F8FAFC'],
        decorElements: [
          'Hanging brass diya rings with fresh tuberose strings',
          'Low velvet lounge diwans with mirror-work cushions',
          'Floating candle bowls with marigold petals',
          'Architectural warm back-lit sheer drapery arches',
        ],
        lightingAndAmbience: '2400K deep warm amber candlelight ambiance with gentle perimeter uplighting.',
      },
      source: 'fallback_engine',
    });
  }

  if (section.toLowerCase().includes('cater') || section.toLowerCase().includes('dining')) {
    return res.json({
      result: {
        menuStyle: 'Interactive Regional Royal Feast with Live Culinary Showcases',
        signatureItems: [
          'Kundan Rogan Paneer with Flaky Sheermal',
          'Live Woodfired Naan & Artisan Kulcha Hearth',
          'Smoked Beetroot & Lotus Stem Kebabs',
          'Warm Malpua with Pistachio Rabri Pot',
        ],
        beverageIdeas: [
          'Chilled Rooh Afza Hibiscus Sparkler',
          'Smoked Plum & Cumin Shikanji',
          'Fresh Saffron Almond Milk Kulhad',
        ],
      },
      source: 'fallback_engine',
    });
  }

  return res.json({
    result: { message: `Updated ${section} with fresh optimizations` },
    source: 'fallback_engine',
  });
});

// 6. AI Creative Inspiration Generator
app.post('/api/gemini/inspire', async (req: Request, res: Response) => {
  const { eventType, theme, mood } = req.body;

  if (ai) {
    try {
      const prompt = `Generate 3 fresh, highly creative event inspiration ideas for a ${eventType || 'celebration'} with ${theme || 'modern'} style.
For each idea provide:
- title (string)
- category (one of: 'theme', 'palette', 'decor', 'menu', 'entertainment', 'diy')
- description (1-2 sentences)
- palette (array of 4 hex color codes)
- tags (array of 3-4 strings)
Return as a JSON array of objects.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                palette: { type: Type.ARRAY, items: { type: Type.STRING } },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['title', 'category', 'description', 'palette', 'tags'],
            },
          },
        },
      });

      if (response.text) {
        return res.json({ ideas: JSON.parse(response.text.trim()), source: 'gemini' });
      }
    } catch (e: any) {
      console.warn('Inspire API error:', e?.message || e);
    }
  }

  // Fallback creative ideas
  return res.json({
    ideas: [
      {
        title: 'Twilight Floral Constellation',
        category: 'decor',
        description: 'Delicate cascading hanging glass orbs with floating tea-lights and fragrant night-blooming jasmine vines.',
        palette: ['#4C1D95', '#8B5CF6', '#FDE047', '#FAF5FF'],
        tags: ['Twilight', 'Constellation', 'Floral', 'Ambiance'],
      },
      {
        title: 'Farm-to-Glass Herbal Cocktail Lab',
        category: 'menu',
        description: 'Interactive cocktail dispensary where guests select fresh herbs like basil and rosemary to muddle with local fruits.',
        palette: ['#047857', '#10B981', '#F59E0B', '#F3F4F6'],
        tags: ['Mixology', 'Craft', 'Organic', 'Interactive'],
      },
      {
        title: 'Velvet Midnight & Champagne Gold',
        category: 'palette',
        description: 'A regal, deep midnight hue framed by warm brushed champagne metallics and muted blush rose florals.',
        palette: ['#0F172A', '#D97706', '#FB7185', '#F8FAFC'],
        tags: ['Luxury', 'Palette', 'Elegance', 'Evening'],
      },
    ],
    source: 'fallback_engine',
  });
});

// Helpers for Smart Fallback
function generateSmartFallbackPlan(eventDetails: any) {
  const isWedding = eventDetails.eventType === 'wedding';
  const isBirthday = eventDetails.eventType === 'birthday';
  const isCommunity = eventDetails.eventType === 'community';
  const total = eventDetails.budget || 100000;

  return {
    conceptTitle: isWedding
      ? 'Celestial Twilight Harmony'
      : isBirthday
      ? 'Radiant Neon Glow & Pastels'
      : isCommunity
      ? 'Green Horizon Eco-Festival'
      : 'Elegance & Modern Celebration',
    conceptSummary: `A meticulously curated ${eventDetails.eventType} designed for ${eventDetails.guestCount} guests in ${eventDetails.location}. Balances ${eventDetails.preferences?.themeStyle || 'contemporary'} aesthetics with seamless hospitality, authentic food, and memorable guest moments.`,
    themeAndDecor: {
      recommendedTheme: isWedding
        ? 'Royal Botanical Twilight'
        : isBirthday
        ? 'Retro Chic & Soft Neon Glow'
        : 'Sustainable Earth & Artisan Elements',
      colors: eventDetails.preferences?.colorPalette?.length
        ? eventDetails.preferences.colorPalette
        : ['#8B5CF6', '#22D3EE', '#F472B6', '#F8FAFC'],
      decorElements: isWedding
        ? ['Brass diya lanterns', 'Mogra and tuberose floral canopy', 'Velvet low-seating diwans', 'Warm fairy light backdrop']
        : isBirthday
        ? ['Organic pastel balloon cascade', 'Custom warm white neon sign', 'Mirrored dessert pedestal', 'Insta-worthy photo frame']
        : ['Upcycled wooden picnic benches', 'Jute bunting', 'Potted native plants', 'Solar fairy string lights'],
      lightingAndAmbience: 'Warm 2700K ambient illumination with subtle architectural wall washing and soft acoustic background harmony.',
    },
    budgetBreakdown: [
      { category: 'Venue & Accommodation', suggestedPercentage: 35, suggestedAmount: Math.round(total * 0.35), guidelines: 'Secures prime indoor/outdoor setting with ample parking and accessibility.' },
      { category: 'Catering & Beverages', suggestedPercentage: 30, suggestedAmount: Math.round(total * 0.30), guidelines: `Covers ${eventDetails.guestCount} guests with welcome beverages, multi-course feast, and desserts.` },
      { category: 'Decorations & Flowers', suggestedPercentage: 15, suggestedAmount: Math.round(total * 0.15), guidelines: 'Focal entrance, stage backdrop, table centerpieces, and mood lighting.' },
      { category: 'Photography & Media', suggestedPercentage: 10, suggestedAmount: Math.round(total * 0.10), guidelines: 'Candid portraits, cinematic short reel, and full event documentation.' },
      { category: 'Music & Entertainment', suggestedPercentage: 5, suggestedAmount: Math.round(total * 0.05), guidelines: 'Audio equipment, curated sound engineer, and live performance.' },
      { category: 'Emergency Reserve', suggestedPercentage: 5, suggestedAmount: Math.round(total * 0.05), guidelines: 'Preserved strictly for weather adjustments or unexpected guests.' },
    ],
    timeline: [
      { phase: 'Phase 1: Foundation', daysBefore: 45, milestone: 'Lock Primary Venue & Main Caterer', keyTasks: ['Sign contract', 'Pay advance deposit', 'Finalize food tasting'] },
      { phase: 'Phase 2: Guest Outreach', daysBefore: 25, milestone: 'Invitations & Logistics', keyTasks: ['Distribute invitations', 'Setup RSVP tracker', 'Collect dietary restrictions'] },
      { phase: 'Phase 3: Production Sync', daysBefore: 10, milestone: 'Decor & Audio Check', keyTasks: ['Review lighting plot', 'Confirm vendor arrival times', 'Prepare final music playlist'] },
      { phase: 'Phase 4: Final Sprint', daysBefore: 2, milestone: 'Walkthrough & Rehearsal', keyTasks: ['Venue layout walkthrough', 'Distribute day-of timeline', 'Emergency contact briefing'] },
    ],
    vendorPriorities: [
      { vendorCategory: 'Venue', recommendedBookingWindow: '6-8 weeks in advance', priority: 'urgent', keyQuestionsToAsk: ['Are there outdoor noise curfews?', 'Is generator backup included?'] },
      { vendorCategory: 'Catering Team', recommendedBookingWindow: '4-6 weeks in advance', priority: 'urgent', keyQuestionsToAsk: ['How do you manage dietary special requests?', 'Are servers and cutlery included?'] },
      { vendorCategory: 'Decorator', recommendedBookingWindow: '3-4 weeks in advance', priority: 'high', keyQuestionsToAsk: ['What is the exact teardown window?', 'Can we substitute seasonal flowers?'] },
    ],
    guestManagementAdvice: [
      'Send WhatsApp calendar invites with Google Maps pin 2 weeks prior.',
      'Provide clearly labeled dietary signs (Vegetarian, Vegan, Gluten-Free) at every buffet station.',
      'Assign an on-site contact person who is NOT the host for immediate guest directions.',
    ],
    cateringAndMenu: {
      menuStyle: 'Seasonal Gourmet Buffet with 2 Live Interactive Stations',
      signatureItems: ['Artisanal Spiced Welcome Coolers', 'Live Flatbread / Chaat Station', 'Slow-cooked signature delicacy', 'Miniature dessert tasting platter'],
      beverageIdeas: ['Fresh Mint Citrus Sparkler', 'Pomegranate Ginger Mocktail', 'Spiced Gourmet Masala Tea'],
    },
    sampleDayAgenda: [
      { time: '14:00', activity: 'Vendor Load-In & Technical Sound Check', coordinatorNotes: 'Verify stage power and audio connections.' },
      { time: '16:30', activity: 'Final Decor & Florals Inspection', coordinatorNotes: 'Ensure candles and lighting are set.' },
      { time: '18:00', activity: 'Guest Welcome & Signature Mocktails', coordinatorNotes: 'Host greeting at the entry archway.' },
      { time: '19:30', activity: 'Main Ceremony / Highlight Speeches', coordinatorNotes: 'Dim house lights and cue spotlight.' },
      { time: '20:30', activity: 'Dinner Feast Service Opens', coordinatorNotes: 'Replenish buffet stations continuously.' },
      { time: '22:00', activity: 'Socializing, Dancing & Sweet Farewells', coordinatorNotes: 'Distribute return favors.' },
    ],
    activitiesAndEntertainment: [
      'Interactive Polaroid memory guestbook table with metallic pens.',
      'Curated acoustic musical performance during the golden hour.',
      'Personalized trivia game or heartfelt family toast segment.',
    ],
    riskAndContingency: [
      { risk: 'Sudden rain or high wind outdoors', solution: 'Keep clear tent sidewalls and indoor pavilion on immediate 2-hour standby.' },
      { risk: 'Power surge or blackout', solution: 'Verify automated dual generator changeover with venue management.' },
    ],
    costSavingSuggestions: [
      'Repurpose entrance welcome flowers onto the banquet stage after guest arrivals.',
      'Opt for batch craft mocktail dispensers rather than individual made-to-order bartending.',
      'Leverage natural daytime or golden hour lighting to minimize heavy lighting rig rentals.',
    ],
    finalChecklist: [
      'Confirm final attendee numbers with head caterer 48h prior.',
      'Pack emergency event kit (safety pins, phone chargers, scissors, first aid).',
      'Have cash envelopes prepared for vendor final tip/balances.',
    ],
  };
}

function generateSmartCopilotResponse(message: string, eventContext: any) {
  const lower = message.toLowerCase();
  let reply = '';
  let suggestions = [
    'How do I negotiate venue rates?',
    'Create a 14-day checklist',
    'Recommend vegetarian catering items',
  ];

  if (lower.includes('budget') || lower.includes('reduce') || lower.includes('cost') || lower.includes('save')) {
    reply = `To optimize your budget for **${eventContext?.name || 'your event'}** (${eventContext?.currency || 'INR'} ${eventContext?.budget?.toLocaleString()}):

1. **Catering Strategy (Highest impact)**: Focus on quality over quantity. Offering 4 standout signature dishes plus 2 live stations (like fresh pasta or chaat) creates a much more premium impression than 15 mediocre buffet trays, while saving 15–20% on food waste.
2. **Floral Repurposing**: Ask your decorator to move your entrance flower arrangements to the dining tables or stage once all guests have arrived.
3. **Lighting over Props**: Up-lighting and fairy strings cost a fraction of physical wooden or acrylic props while transforming the atmosphere dramatically.

Would you like me to suggest specific category-by-category reallocations for your active budget?`;
    suggestions = ['Suggest budget reallocations', 'What are hidden event expenses?', 'Compare DIY vs vendor decor costs'];
  } else if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('week') || lower.includes('task')) {
    reply = `Here is your high-priority action roadmap for **${eventContext?.name || 'this event'}**:

• **Immediate Focus (Next 7 Days)**: Confirm remaining vendor quotes (especially catering & photo) and pay initial booking deposits to lock in dates.
• **RSVP Follow-ups**: Send friendly reminder messages to unconfirmed guests to finalize your headcount.
• **Equipment & Venue Walkthrough**: Verify outdoor power sockets, sound limits, and parking space access.

Would you like me to automatically add these tasks to your Timeline & Tasks board?`;
    suggestions = ['Add tasks to my timeline', 'Draft RSVP reminder text', 'Plan day-of coordinator schedule'];
  } else if (lower.includes('rain') || lower.includes('weather') || lower.includes('outdoor')) {
    reply = `For outdoor celebrations like **${eventContext?.name || 'your event'}**, having a solid Plan B is essential:

1. **Venue Shelter Guarantee**: Ensure the venue contract includes complimentary or discounted transition to their covered pavilion if rain exceeds 30% forecast probability.
2. **Flooring Protection**: Keep heavy duty coir/tarpaulin walkway runners on call so grass areas don't turn into mud.
3. **Audio & Electrical Safeties**: All outdoor extension cords must be elevated or housed inside waterproof rubber cable protectors with GFCI breakers.`;
    suggestions = ['Draft venue weather clause', 'Indoor decoration alternatives', 'What heaters/fans are needed?'];
  } else {
    reply = `I'm analyzing your event details for **${eventContext?.name || 'your upcoming event'}** (${eventContext?.guestCount || 50} guests, ${eventContext?.currency || 'INR'} ${eventContext?.budget?.toLocaleString()} budget).

Your current Readiness Score is **${eventContext?.readinessScore || 65}%**.

Here are three key areas we can focus on right now:
1. **Refining Budget Allocations**: Balance actual vs estimated payments to avoid last-minute overruns.
2. **Vendor Communication**: Draft professional inquiry letters or negotiation notes.
3. **Creative Experience**: Curate color palettes, signature mocktail menus, and entertainment flow.

What specific aspect would you like to tackle first?`;
  }

  return { reply, suggestions };
}

// Development Vite Server integration or Static Serving in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Eventora AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
