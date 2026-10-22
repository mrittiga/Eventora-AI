import { EventItem, BudgetItem, Task, Vendor, Guest, InspirationItem } from '../types';

// Helper to format date offset from today YYYY-MM-DD
export function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export function createInitialSeedData() {
  const weddingId = 'event-wedding-demo';
  const birthdayId = 'event-birthday-demo';
  const communityId = 'event-community-demo';

  const weddingDate = getDateOffset(48); // ~7 weeks out
  const birthdayDate = getDateOffset(16); // ~2 weeks out
  const communityDate = getDateOffset(62); // ~9 weeks out

  const events: EventItem[] = [
    {
      id: weddingId,
      name: 'Aarav & Meera’s Dream Wedding',
      eventType: 'wedding',
      date: weddingDate,
      startTime: '17:00',
      endTime: '23:30',
      location: 'Udaipur, Rajasthan',
      venueName: 'The Royal Lakeview Palace & Gardens',
      guestCount: 200,
      budget: 500000,
      currency: 'INR',
      budgetFlexibility: 'moderate',
      coverImage: '/src/assets/images/event_wedding_cover_1792651194440.jpg',
      preferences: {
        themeStyle: 'traditional',
        colorPalette: ['#8B5CF6', '#F59E0B', '#BE185D', '#FDE68A'],
        foodPreferences: ['North Indian Regal', 'Royal Rajasthani Thali', 'Live Chaat Counter'],
        dietaryRestrictions: ['Vegetarian', 'Jain Options Available'],
        culturalTradition: 'Traditional Indian Hindu & Sangeet',
        accessibilityNeeds: ['Wheelchair access for elders', 'Golf cart transport inside venue'],
        priorities: ['quality', 'convenience', 'luxury'],
        diyVsProfessional: 'professional_heavy',
        planningExperience: 'intermediate',
        specialRequests: 'Sunset mandap overlooking the lake with fairy-light canopy and live sitar ensemble.',
        isIndoorOutdoor: 'outdoor',
      },
      aiPlan: {
        conceptTitle: 'Twilight Royal Palace Grand Celebration',
        conceptSummary: 'A majestic traditional Indian wedding combining royal Rajputana hospitality with luminous twilight botanical aesthetics, live classical acoustics, and an unforgettable multi-course royal feast.',
        themeAndDecor: {
          recommendedTheme: 'Royal Heritage & Luminous Flora',
          colors: ['Imperial Indigo', 'Marigold Gold', 'Deep Rose Pink', 'Ivory'],
          decorElements: ['Mogra and marigold floral chandeliers', 'Brass diya water urns', 'Velvet royal seating', 'Carved wooden mandap with sheer silk drapes'],
          lightingAndAmbience: 'Warm amber ambient uplighting, cascading fairy light canopy, and flickering brass lantern pathways.',
        },
        budgetBreakdown: [
          { category: 'Venue & Accommodation', suggestedPercentage: 35, suggestedAmount: 175000, guidelines: 'Secures lakeside lawn, guest pavilions, and suite for bridal party.' },
          { category: 'Catering & Beverages', suggestedPercentage: 28, suggestedAmount: 140000, guidelines: '200 guests across evening tea, mocktail lounge, and regal buffet dinner.' },
          { category: 'Decorations & Flowers', suggestedPercentage: 15, suggestedAmount: 75000, guidelines: 'Floral mandap, stage backdrop, entrance torans, and table centerpieces.' },
          { category: 'Photography & Videography', suggestedPercentage: 10, suggestedAmount: 50000, guidelines: 'Candid photographer, drone cinematic video, and album delivery.' },
          { category: 'Entertainment & Music', suggestedPercentage: 5, suggestedAmount: 25000, guidelines: 'Folk singers, live shehnai / sitar welcome, and DJ sound setup.' },
          { category: 'Invitations & Favors', suggestedPercentage: 3, suggestedAmount: 15000, guidelines: 'Digital interactive invites, carved box sweets, and brass return favors.' },
          { category: 'Contingency Reserve', suggestedPercentage: 4, suggestedAmount: 20000, guidelines: 'Reserved for last-minute guest additions or weather contingencies.' },
        ],
        timeline: [
          { phase: 'Phase 1: Foundations', daysBefore: 60, milestone: 'Lock Palace Venue and Key Vendors', keyTasks: ['Sign palace agreement', 'Finalize lead caterer menu', 'Book primary photographer'] },
          { phase: 'Phase 2: Guest Experience', daysBefore: 30, milestone: 'RSVP Confirmation & Logistics', keyTasks: ['Send digital invitations', 'Organize airport transfer buses', 'Curate welcome gift boxes'] },
          { phase: 'Phase 3: Production Run', daysBefore: 14, milestone: 'Decor & Technical Walkthrough', keyTasks: ['Review stage lighting and sound test', 'Finalize seating chart for elders', 'Approve ceremony music playlist'] },
          { phase: 'Phase 4: Final Week', daysBefore: 3, milestone: 'Full Rehearsal & Vendor Sync', keyTasks: ['Conduct mandap inspection', 'Confirm guest dietary counts', 'Distribute day-of vendor timeline'] },
        ],
        vendorPriorities: [
          { vendorCategory: 'Venue & Lawns', recommendedBookingWindow: 'Book 3-6 months prior', priority: 'urgent', keyQuestionsToAsk: ['Is outside catering allowed?', 'What is the sound curfew outdoors?', 'Are generator backups included?'] },
          { vendorCategory: 'Catering Team', recommendedBookingWindow: 'Book 2-3 months prior', priority: 'urgent', keyQuestionsToAsk: ['Can you provide live tasting sessions?', 'How do you handle separate Jain food preparations?'] },
          { vendorCategory: 'Floral & Mandap Decorator', recommendedBookingWindow: 'Book 6 weeks prior', priority: 'high', keyQuestionsToAsk: ['Do you provide fresh flower guarantees?', 'What are the setup teardown windows?'] },
        ],
        guestManagementAdvice: [
          'Set up dedicated concierge desk for out-of-town guests arriving at the train station and airport.',
          'Provide printed laminated schedule cards inside guest rooms in English and Hindi.',
          'Provide golf carts between parking and the lake pavilion for elderly relatives.',
        ],
        cateringAndMenu: {
          menuStyle: 'Regal Royal Banquet with Live Cooking Stations',
          signatureItems: ['Dal Baati Churma with Pure Desi Ghee', 'Paneer Kundan Kalia', 'Live Jalebi & Rabri Counter', 'Kesar Thandai Welcome Drink'],
          beverageIdeas: ['Fresh Sugarcane & Mint Cooler', 'Masala Kokum Spritzer', 'Artisanal Spiced Chai Station'],
        },
        sampleDayAgenda: [
          { time: '16:00', activity: 'Groom & Bridal Party Preparation & Portrait Session', coordinatorNotes: 'Check makeup progress, photograph bridal jewelry in natural light.' },
          { time: '17:30', activity: 'Baraat Procession & Dhol Welcome at Main Gate', coordinatorNotes: 'Rose petal shower ready, cold drinks served immediately to arriving guests.' },
          { time: '18:45', activity: 'Jaimala Ceremony on Central Water Stage', coordinatorNotes: 'Pyrotechnic cold sparks and floral showers on cue.' },
          { time: '19:30', activity: 'Lakeside Mandap Pheras with Vedic Chants', coordinatorNotes: 'Seating arranged for close family; snacks circulated to seated guests.' },
          { time: '21:00', activity: 'Grand Royal Dinner Feast & Live Classical Sitar', coordinatorNotes: 'Buffet lines open; dessert stations staffed continuously.' },
        ],
        activitiesAndEntertainment: [
          'Live Henna / Mehendi artist booth during the early evening for guests.',
          'Customized Polaroid instant photo booth with palace arch backdrop.',
          'Surprise flash mob family dance to celebrate the newlywed couple.',
        ],
        riskAndContingency: [
          { risk: 'Unexpected evening chill or wind by the lake', solution: 'Keep 12 gas patio heaters and silk pashmina wraps on standby at the entrance pavilion.' },
          { risk: 'Sound curfew after 10 PM outdoors', solution: 'Seamlessly shift celebrations to the indoor glass palace banquet hall for late-night music.' },
        ],
        costSavingSuggestions: [
          'Use seasonal local marigolds and jasmine instead of imported lilies to reduce decor expenses by 25%.',
          'Opt for digital calligraphy invitations via WhatsApp instead of heavy physical parcel boxes.',
          'Negotiate combined package deal for photography and drone cinematography with one studio team.',
        ],
        finalChecklist: [
          'Verify priest / officiant arrival and ritual puja items list.',
          'Confirm ice, drinking water, and backup generators.',
          'Assign two trusted family coordinators with master vendor phone numbers.',
        ],
      },
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-10-21T18:00:00Z',
    },
    {
      id: birthdayId,
      name: 'Sophia’s 30th Neon & Pastel Birthday',
      eventType: 'birthday',
      date: birthdayDate,
      startTime: '19:00',
      endTime: '01:00',
      location: 'Bangalore, Indiranagar',
      venueName: 'Loft 38 Terrace Lounge',
      guestCount: 35,
      budget: 30000,
      currency: 'INR',
      budgetFlexibility: 'strict',
      coverImage: '/src/assets/images/event_birthday_cover_1792651195652.jpg',
      preferences: {
        themeStyle: 'playful',
        colorPalette: ['#F472B6', '#22D3EE', '#8B5CF6', '#F3F4F6'],
        foodPreferences: ['Gourmet Sliders', 'Woodfired Pizza', 'Artisanal Mocktails'],
        dietaryRestrictions: ['2 Gluten-free', '5 Vegan'],
        priorities: ['quality', 'cost'],
        diyVsProfessional: 'balanced',
        planningExperience: 'beginner',
        specialRequests: 'Custom two-tier matcha cake, custom neon photo arch with phrase "Cheers to 30!", DJ playlist with 90s/2000s throwback anthems.',
        isIndoorOutdoor: 'hybrid',
      },
      aiPlan: {
        conceptTitle: 'Retro Chic Neon & Pastel Rooftop Milestone',
        conceptSummary: 'An intimate, high-energy 30th birthday celebration blending chic pastel palettes with glowing neon accents, curated woodfired bites, artisanal mixology, and a nostalgic 2000s dance playlist on an open-air rooftop lounge.',
        themeAndDecor: {
          recommendedTheme: 'Modern Retro Neon & Pastel Wave',
          colors: ['Hot Pink Neon', 'Pastel Lavender', 'Electric Cyan', 'Warm Peach'],
          decorElements: ['Organic pastel balloon cascade arch', 'Custom LED neon sign "Cheers to 30 Sophia!"', 'Mirrored dessert pedestals', 'Iridescent cocktail glasses and confetti poppers'],
          lightingAndAmbience: 'Dusk ambient terrace glow, magenta and cyan wash uplighting on brick walls, and soft warm string lights overhead.',
        },
        budgetBreakdown: [
          { category: 'Venue & Minimum Spend', suggestedPercentage: 40, suggestedAmount: 12000, guidelines: 'Secures private terrace VIP section with dedicated bar staffing.' },
          { category: 'Catering & Cocktails', suggestedPercentage: 35, suggestedAmount: 10500, guidelines: 'Gourmet slider bar, woodfired pizza planks, and 2 craft signature cocktails.' },
          { category: 'Neon Decor & Balloon Arch', suggestedPercentage: 15, suggestedAmount: 4500, guidelines: 'Rental of custom neon sign and photo backdrop installation.' },
          { category: 'Cake & Dessert Platter', suggestedPercentage: 10, suggestedAmount: 3000, guidelines: 'Artisanal 2-tier matcha berry cake and personalized sugar cookies.' },
        ],
        timeline: [
          { phase: 'Phase 1: Booking', daysBefore: 20, milestone: 'Lock Rooftop Terrace & Cake Baker', keyTasks: ['Confirm Loft 38 private booth deposit', 'Order custom matcha birthday cake', 'Finalize guest list'] },
          { phase: 'Phase 2: Visuals & Playlist', daysBefore: 10, milestone: 'Neon Decor & Music Curation', keyTasks: ['Confirm balloon artist setup time', 'Share playlist tracks with terrace DJ', 'Send digital calendar reminders'] },
          { phase: 'Phase 3: Final 48 Hours', daysBefore: 2, milestone: 'Final RSVP Headcount & Deliveries', keyTasks: ['Lock final cocktail package headcount', 'Pick up party props and Polaroid cartridges', 'Confirm cake delivery window'] },
        ],
        vendorPriorities: [
          { vendorCategory: 'Rooftop Venue / Lounge', recommendedBookingWindow: 'Book 3-4 weeks prior', priority: 'urgent', keyQuestionsToAsk: ['Is outside cake fee waived?', 'Can we connect our phone to the VIP audio zone?', 'What time can decorators access the terrace?'] },
          { vendorCategory: 'Bespoke Bakery', recommendedBookingWindow: 'Book 2 weeks prior', priority: 'high', keyQuestionsToAsk: ['Are gluten-free mini cupcakes available?', 'Do you provide safe transport and cake stand rental?'] },
          { vendorCategory: 'Balloon & Neon Stylist', recommendedBookingWindow: 'Book 1-2 weeks prior', priority: 'high', keyQuestionsToAsk: ['Is setup and teardown included?', 'Do you provide extension cords and mounting stands?'] },
        ],
        guestManagementAdvice: [
          'Send WhatsApp RSVP invite with a curated cocktail dress code guide ("Chic cocktail with a pop of neon").',
          'Coordinate rideshare drop-off point at the front lounge entrance.',
          'Prepare individual welcome shots/mocktails upon guest arrival at 7 PM.',
        ],
        cateringAndMenu: {
          menuStyle: 'Passed Hors d’oeuvres & Artisanal Cocktail Lounge',
          signatureItems: ['Truffle Parmesan Hand-Cut Fries', 'Artisanal Fig & Goat Cheese Flatbread', 'Korean BBQ Pulled Jackfruit Sliders', 'Matcha White Chocolate Birthday Cake'],
          beverageIdeas: ['Sparkling Lavender Lychee Spritz', 'Smoked Rosemary Paloma', 'Spiced Hibiscus Ginger Fizz'],
        },
        sampleDayAgenda: [
          { time: '17:00', activity: 'Decorator & Balloon Stylist Load-In', coordinatorNotes: 'Verify neon sign plug socket and backdrop stability.' },
          { time: '18:15', activity: 'Matcha Cake Delivery & Cold Storage', coordinatorNotes: 'Store in restaurant refrigerator until cutting ceremony.' },
          { time: '19:00', activity: 'Guests Arrive & Welcome Drinks Poured', coordinatorNotes: 'Upbeat lounge house music playing, Polaroid camera handed out.' },
          { time: '20:30', activity: 'Passed Sliders & Woodfired Pizza Feast', coordinatorNotes: 'Ensure vegan and gluten-free plates are brought out first.' },
          { time: '21:45', activity: 'Birthday Toast, Cake Cutting & Confetti', coordinatorNotes: 'Dim terrace lights, cue favorite song chorus, hand sparklers.' },
          { time: '22:15', activity: 'DJ Party Mix & Open Dancing', coordinatorNotes: 'Transition into energetic 90s/2000s throwback dance tracks.' },
        ],
        activitiesAndEntertainment: [
          'Polaroid Guestbook station with metallic markers and neon washi tape.',
          'Friendly group trivia game about Sophia’s most memorable adventures.',
          'Sparkler send-off celebration photo moment at 10 PM.',
        ],
        riskAndContingency: [
          { risk: 'Sudden drizzle or terrace wind', solution: 'Loft 38 includes an automated retractable glass roof with heating lamps.' },
          { risk: 'Cake melting during afternoon transit', solution: 'Insulated cooler carrier with cold dry packs used by baker.' },
        ],
        costSavingSuggestions: [
          'Combine the venue cover fee directly against food and mocktail spends.',
          'Curate a custom Spotify DJ playlist through the venue sound system instead of hiring a private DJ.',
          'Use digital RSVP invites with animated video cards instead of paper stationery.',
        ],
        finalChecklist: [
          'Pack lighter/matches for birthday cake candles.',
          'Confirm guest of honor transportation.',
          'Keep 2 spare Polaroid film packs ready.',
        ],
      },
      createdAt: '2026-10-05T12:00:00Z',
      updatedAt: '2026-10-20T15:00:00Z',
    },
    {
      id: communityId,
      name: 'EcoFest 2026: Green Horizons Summit',
      eventType: 'community',
      date: communityDate,
      startTime: '10:00',
      endTime: '18:00',
      location: 'Pune, Maharashtra',
      venueName: 'Botanical Garden Amphitheater',
      guestCount: 120,
      budget: 75000,
      currency: 'INR',
      budgetFlexibility: 'flexible',
      coverImage: '/src/assets/images/event_community_cover_1792651195808.jpg',
      preferences: {
        themeStyle: 'rustic',
        colorPalette: ['#10B981', '#065F46', '#F59E0B', '#F3F4F6'],
        foodPreferences: ['Organic Millet Salads', 'Farm-to-Table Wraps', 'Fresh Cold Pressed Juices'],
        dietaryRestrictions: ['100% Plant-Based / Zero Waste Catering'],
        priorities: ['sustainability', 'cost', 'convenience'],
        diyVsProfessional: 'mostly_diy',
        planningExperience: 'experienced',
        specialRequests: 'Zero single-use plastics, solar-powered acoustic PA audio system, interactive composting and seed paper workshop tables.',
        isIndoorOutdoor: 'outdoor',
      },
      aiPlan: {
        conceptTitle: 'Green Horizons: Zero-Waste Community Earth Summit',
        conceptSummary: 'An inspiring, community-powered environmental festival uniting 120 sustainability enthusiasts, student innovators, and local artisans. Powered entirely by solar acoustics, featuring farm-to-table organic dining and interactive seed workshops.',
        themeAndDecor: {
          recommendedTheme: 'Sustainable Earth & Natural Fiber Harmony',
          colors: ['Emerald Forest Green', 'Sunlit Ochre', 'Unbleached Linen', 'Deep Terracotta'],
          decorElements: ['Reclaimed wooden pallet stages and low benches', 'Upcycled jute bunting and hemp pennants', 'Potted native neem and tulsi saplings as table centerpieces', 'Handcrafted chalk-slate signage'],
          lightingAndAmbience: 'Warm daylight golden hour illumination transitioning into low-voltage solar string bulb canopies and oil lanterns.',
        },
        budgetBreakdown: [
          { category: 'Civic Amphitheater Permit', suggestedPercentage: 20, suggestedAmount: 15000, guidelines: 'Municipal park reserve permit, waste disposal bonds, and water access.' },
          { category: 'Organic Community Feast', suggestedPercentage: 42, suggestedAmount: 31500, guidelines: 'Locally grown millet grain bowls, organic farm wraps, and cold-pressed citrus.' },
          { category: 'Solar Sound & Eco Rentals', suggestedPercentage: 24, suggestedAmount: 18000, guidelines: 'Solar-charged battery inverters, acoustic mics, and 120 wooden folding chairs.' },
          { category: 'Workshops & Seed Stationery', suggestedPercentage: 14, suggestedAmount: 10500, guidelines: 'Wildflower seed paper badges, composting soil, and artisan craft kits.' },
        ],
        timeline: [
          { phase: 'Phase 1: Municipal Approval', daysBefore: 45, milestone: 'Parks Department Approval & Volunteer Drive', keyTasks: ['Secure civic amphitheater permit', 'Issue community volunteer signup call', 'Approve organic farm sourcing list'] },
          { phase: 'Phase 2: Equipment & Partners', daysBefore: 20, milestone: 'Solar PA Testing & Workshop Setup', keyTasks: ['Inspect solar battery pack runtime', 'Finalize seed badge printing with local co-op', 'Publish speaker schedule'] },
          { phase: 'Phase 3: Final Briefing', daysBefore: 3, milestone: 'Waste Audit Plan & Volunteer Orientation', keyTasks: ['Brief 15 waste-sorting volunteers', 'Confirm composting drop-off truck', 'Distribute digital park map'] },
        ],
        vendorPriorities: [
          { vendorCategory: 'Parks / Amphitheater Civic Authority', recommendedBookingWindow: 'Book 6-8 weeks prior', priority: 'urgent', keyQuestionsToAsk: ['Are there potable water refill stations on site?', 'Where can recycling drop-off bins be stationed?'] },
          { vendorCategory: 'Zero-Waste Organic Caterer', recommendedBookingWindow: 'Book 4 weeks prior', priority: 'urgent', keyQuestionsToAsk: ['Can you provide 100% compostable palm leaf plates?', 'Is all food sourced within 100km radius?'] },
          { vendorCategory: 'Solar Audio Solutions', recommendedBookingWindow: 'Book 3 weeks prior', priority: 'high', keyQuestionsToAsk: ['Can the inverter support 6 continuous hours of acoustic sound?', 'Do you have backup batteries in case of overcast skies?'] },
        ],
        guestManagementAdvice: [
          'Advise all 120 guests via email to bring their own reusable water flask and cloth tote bag.',
          'Provide clear, color-coded compost and dry recycling stations staffed by student eco-guides.',
          'Arrange group bicycle parking racks near the amphitheater entrance gate.',
        ],
        cateringAndMenu: {
          menuStyle: 'Farm-to-Table Organic Harvest Lunch Buffet',
          signatureItems: ['Warm Spiced Foxtail Millet & Roasted Pumpkin Bowl', 'Avocado & Sprouted Moong Farm Wrap', 'Local Guava & Mint Cold-Pressed Cooler', 'Organic Jaggery & Coconut Ladoos'],
          beverageIdeas: ['Fresh Tender Coconut Water with Chia', 'Spiced Lemongrass Tisane', 'Infused Cucumber & Lime Spring Water'],
        },
        sampleDayAgenda: [
          { time: '08:30', activity: 'Volunteer Team Briefing & Zero-Waste Station Setup', coordinatorNotes: 'Check palm-leaf plate counts and setup composting bins.' },
          { time: '10:00', activity: 'Opening Circle & Welcome Acoustic Melody', coordinatorNotes: 'Solar PA system live, herbal infusions served to arriving attendees.' },
          { time: '11:15', activity: 'Panel Discussion: Urban Regenerative Living', coordinatorNotes: 'Moderator microphones ready; question cards collected.' },
          { time: '13:00', activity: 'Organic Community Harvest Feast', coordinatorNotes: 'Self-serve buffet with volunteer plate servers to prevent food waste.' },
          { time: '14:30', activity: 'Interactive Hands-On Workshops (Seed Paper & Composting)', coordinatorNotes: 'Materials distributed across 4 picnic workshop tables.' },
          { time: '16:30', activity: 'Sunset Acoustic Jam & Community Closing Pledge', coordinatorNotes: 'Guests plant seeds in botanical garden perimeter.' },
          { time: '17:30', activity: 'Zero-Waste Sweep & Site Restoration', coordinatorNotes: 'Audit compost weight; leave venue cleaner than found.' },
        ],
        activitiesAndEntertainment: [
          'Plantable Seed-Paper Badge making table with dried organic petals.',
          'Live unamplified acoustic folk duo playing wooden acoustic guitar and bansuri flute.',
          'Community seed swap exchange table where attendees trade indigenous heirloom seeds.',
        ],
        riskAndContingency: [
          { risk: 'Overcast or rainy weather affecting solar power', solution: 'Dual LiFePO4 battery storage pre-charged off-grid ensures 12 hours of audio backup.' },
          { risk: 'High midday temperature outdoors', solution: 'Pitch 4 natural jute canvas shade awnings and keep ice-chilled lemon-mint dispensers full.' },
        ],
        costSavingSuggestions: [
          'Partner with municipal botanical society for discounted amphitheater non-profit rental.',
          'Leverage volunteer community cooks and local farm co-ops to source grains at wholesale prices.',
          'Use live potted plants rented from local nurseries as centerpieces, returned unharmed after the event.',
        ],
        finalChecklist: [
          'Confirm civic noise permission document is printed and on site.',
          'Verify compost collection truck arrival at 6 PM.',
          'Inspect first-aid kit and hydration refill stations.',
        ],
      },
      createdAt: '2026-10-10T09:00:00Z',
      updatedAt: '2026-10-21T11:00:00Z',
    },
  ];

  const budgetItems: BudgetItem[] = [
    // Wedding items
    { id: 'b-1', eventId: weddingId, category: 'venue', title: 'Royal Lakeview Palace Lawn Booking', estimatedAmount: 175000, actualAmount: 170000, paidAmount: 85000, dueDate: getDateOffset(10), notes: 'Advance paid; 50% balance due 10 days before event.' },
    { id: 'b-2', eventId: weddingId, category: 'catering', title: 'Regal Banquet Catering (200 guests)', estimatedAmount: 140000, actualAmount: 135000, paidAmount: 50000, dueDate: getDateOffset(20), notes: 'Includes live chaat and royal dessert spreads.' },
    { id: 'b-3', eventId: weddingId, category: 'decorations', title: 'Floral Mandap & Fairy Light Canopy', estimatedAmount: 75000, actualAmount: 72000, paidAmount: 30000, dueDate: getDateOffset(25), notes: 'Fresh marigold and jasmine with warm hanging lanterns.' },
    { id: 'b-4', eventId: weddingId, category: 'photography', title: 'Cinematic Video & Candid Photo Studio', estimatedAmount: 50000, actualAmount: 48000, paidAmount: 25000, dueDate: getDateOffset(15), notes: 'Drone aerial footage and 2 candid shooters included.' },
    { id: 'b-5', eventId: weddingId, category: 'entertainment', title: 'Sitar & Shehnai Ensemble + DJ Setup', estimatedAmount: 25000, actualAmount: 24000, paidAmount: 12000, dueDate: getDateOffset(30), notes: 'Sound equipment provided by vendor.' },
    { id: 'b-6', eventId: weddingId, category: 'invitations', title: 'Digital Motion Video Invites & Gifts', estimatedAmount: 15000, actualAmount: 14000, paidAmount: 14000, dueDate: getDateOffset(-10), notes: 'Paid in full; invites delivered via WhatsApp and email.' },
    { id: 'b-7', eventId: weddingId, category: 'contingency', title: 'Unplanned Weather & Guest Buffer', estimatedAmount: 20000, actualAmount: 0, paidAmount: 0, dueDate: getDateOffset(45), notes: 'Emergency fund for last minute supplies.' },

    // Birthday items
    { id: 'b-8', eventId: birthdayId, category: 'venue', title: 'Loft 38 Rooftop Private Section', estimatedAmount: 12000, actualAmount: 12000, paidAmount: 6000, dueDate: getDateOffset(7), notes: 'Cover charge deducted against food bill.' },
    { id: 'b-9', eventId: birthdayId, category: 'catering', title: 'Finger Foods & Mocktail Bar (35 pax)', estimatedAmount: 10000, actualAmount: 10500, paidAmount: 4000, dueDate: getDateOffset(12), notes: 'Sliders, tacos, craft mocktails.' },
    { id: 'b-10', eventId: birthdayId, category: 'decorations', title: 'Neon Arch & Pastel Balloon Installation', estimatedAmount: 5000, actualAmount: 4500, paidAmount: 4500, dueDate: getDateOffset(-2), notes: 'Paid in full, setup scheduled 3 PM event day.' },
    { id: 'b-11', eventId: birthdayId, category: 'entertainment', title: 'Custom Matcha Cake & Birthday Props', estimatedAmount: 3000, actualAmount: 3200, paidAmount: 3200, dueDate: getDateOffset(-1), notes: 'Delivered by artisanal baker.' },

    // Community Fest items
    { id: 'b-12', eventId: communityId, category: 'venue', title: 'Amphitheater Civic Municipal Permit', estimatedAmount: 15000, actualAmount: 15000, paidAmount: 15000, dueDate: getDateOffset(-15), notes: 'Approved municipal parks permit.' },
    { id: 'b-13', eventId: communityId, category: 'catering', title: 'Organic Farm-to-Table Community Meal', estimatedAmount: 32000, actualAmount: 30000, paidAmount: 10000, dueDate: getDateOffset(30), notes: 'Volunteer-supported zero waste cooking.' },
    { id: 'b-14', eventId: communityId, category: 'rentals', title: 'Solar Powered PA System & Benches', estimatedAmount: 18000, actualAmount: 16000, paidAmount: 8000, dueDate: getDateOffset(20), notes: 'Includes 120 wooden eco folding chairs.' },
    { id: 'b-15', eventId: communityId, category: 'miscellaneous', title: 'Seed Paper Badges & Signage', estimatedAmount: 10000, actualAmount: 8500, paidAmount: 8500, dueDate: getDateOffset(-5), notes: 'Compostable paper with wild flower seeds.' },
  ];

  const tasks: Task[] = [
    // Wedding tasks
    { id: 't-1', eventId: weddingId, title: 'Finalize Stage Mandap Lighting Specs', description: 'Confirm with decorator about warm amber 2700k lights vs cool white.', category: 'Decor', dueDate: getDateOffset(5), priority: 'high', status: 'in_progress', assignee: 'Meera (Bride)', estimatedCost: 0 },
    { id: 't-2', eventId: weddingId, title: 'Send Reminders to Pending RSVPs', description: 'Contact 42 guests who have not confirmed attendance yet.', category: 'Guests', dueDate: getDateOffset(3), priority: 'urgent', status: 'todo', assignee: 'Aarav (Groom)', estimatedCost: 0 },
    { id: 't-3', eventId: weddingId, title: 'Confirm Sitar Player Playlist', description: 'Review classical raga list for the pheras ceremony.', category: 'Entertainment', dueDate: getDateOffset(12), priority: 'medium', status: 'todo', assignee: 'Aarav', estimatedCost: 0 },
    { id: 't-4', eventId: weddingId, title: 'Food Tasting Session with Caterer', description: 'Sample the dal baati churma and live jalebi batches.', category: 'Catering', dueDate: getDateOffset(-4), priority: 'high', status: 'completed', assignee: 'Both', estimatedCost: 2000 },
    { id: 't-5', eventId: weddingId, title: 'Arrange Airport Shuttle Bus', description: 'Contract two 24-seater buses for guests arriving from Mumbai and Delhi.', category: 'Logistics', dueDate: getDateOffset(14), priority: 'high', status: 'todo', assignee: 'Uncle Rajesh', estimatedCost: 12000 },
    { id: 't-6', eventId: weddingId, title: 'Finalize Seating Chart for Elders', description: 'Ensure front row chairs have clear line of sight to mandap.', category: 'Logistics', dueDate: getDateOffset(18), priority: 'medium', status: 'in_progress', assignee: 'Meera', estimatedCost: 0 },

    // Birthday tasks
    { id: 't-7', eventId: birthdayId, title: 'Confirm Custom Cake Delivery Time', description: 'Check with The Crust Studio for 5 PM delivery slot.', category: 'Food', dueDate: getDateOffset(2), priority: 'urgent', status: 'in_progress', assignee: 'Sophia', estimatedCost: 3200 },
    { id: 't-8', eventId: birthdayId, title: 'Curate Spotify Throwback Playlist', description: 'Create 4-hour high energy party mix.', category: 'Entertainment', dueDate: getDateOffset(4), priority: 'medium', status: 'completed', assignee: 'Friend Priya', estimatedCost: 0 },
    { id: 't-9', eventId: birthdayId, title: 'Pick up neon photo accessories', description: 'Glow sticks and fun photo glasses.', category: 'Decor', dueDate: getDateOffset(10), priority: 'low', status: 'todo', assignee: 'Sophia', estimatedCost: 800 },

    // Community fest tasks
    { id: 't-10', eventId: communityId, title: 'Volunteer Orientation Meeting', description: 'Brief 15 volunteers on recycling sorting and registration desk duties.', category: 'Operations', dueDate: getDateOffset(10), priority: 'high', status: 'todo', assignee: 'Karan (Lead)', estimatedCost: 0 },
    { id: 't-11', eventId: communityId, title: 'Test Solar Audio Inverter', description: 'Ensure battery holds charge for 6 hours continuous sound.', category: 'Tech', dueDate: getDateOffset(14), priority: 'medium', status: 'todo', assignee: 'Dev Tech Team', estimatedCost: 0 },
    { id: 't-12', eventId: communityId, title: 'Municipal Noise Exemption Copy', description: 'Keep printed certificate at control booth.', category: 'Legal', dueDate: getDateOffset(-10), priority: 'urgent', status: 'completed', assignee: 'Karan', estimatedCost: 0 },
  ];

  const vendors: Vendor[] = [
    // Wedding vendors
    {
      id: 'v-1',
      eventId: weddingId,
      name: 'Lakeview Heritage Palaces Ltd',
      category: 'venue',
      contactPerson: 'Mr. Vikram Rathore',
      phone: '+91 98290 12345',
      email: 'events@lakeviewpalace.com',
      website: 'https://lakeviewpalace.demo',
      city: 'Udaipur',
      quotedAmount: 170000,
      advancePayment: 85000,
      bookingStatus: 'booked',
      contractStatus: 'signed',
      paymentDueDate: getDateOffset(10),
      notes: 'Lawn reserved from 10 AM to 1 AM. Generator backup included.',
      rating: 5,
    },
    {
      id: 'v-2',
      eventId: weddingId,
      name: 'Shahi Rasoi Royal Catering',
      category: 'caterer',
      contactPerson: 'Chef Anand Sharma',
      phone: '+91 98711 54321',
      email: 'anand@shahirasoi.demo',
      website: 'https://shahirasoi.demo',
      city: 'Udaipur',
      quotedAmount: 135000,
      advancePayment: 50000,
      bookingStatus: 'booked',
      contractStatus: 'signed',
      paymentDueDate: getDateOffset(20),
      notes: 'Tasting completed. 200 guests with 10% safety margin in pantry.',
      rating: 5,
    },
    {
      id: 'v-3',
      eventId: weddingId,
      name: 'Marigold & Glow Event Stylists',
      category: 'decorator',
      contactPerson: 'Kavita Sen',
      phone: '+91 99880 77665',
      email: 'kavita@marigoldglow.demo',
      city: 'Udaipur',
      quotedAmount: 72000,
      advancePayment: 30000,
      bookingStatus: 'booked',
      contractStatus: 'signed',
      paymentDueDate: getDateOffset(25),
      notes: 'Fresh flowers sourced directly from Pushkar farms.',
      rating: 4,
    },
    {
      id: 'v-4',
      eventId: weddingId,
      name: 'Aperture Memories Cinematography',
      category: 'photographer',
      contactPerson: 'Rohan Deshmukh',
      phone: '+91 98450 99887',
      email: 'rohan@aperturememories.demo',
      city: 'Jaipur',
      quotedAmount: 48000,
      advancePayment: 25000,
      bookingStatus: 'booked',
      contractStatus: 'signed',
      paymentDueDate: getDateOffset(15),
      notes: 'Drone license verified. 2 full-frame cameras + teaser video within 7 days.',
      rating: 5,
    },
    {
      id: 'v-5',
      eventId: weddingId,
      name: 'Swara Classical Instrumentalists',
      category: 'dj_entertainment',
      contactPerson: 'Pandit Ravi Shankar Jha',
      phone: '+91 94140 33221',
      email: 'ravi@swaramusic.demo',
      city: 'Udaipur',
      quotedAmount: 24000,
      advancePayment: 12000,
      bookingStatus: 'shortlisted',
      contractStatus: 'under_review',
      paymentDueDate: getDateOffset(30),
      notes: 'Sitar, Santoor, and Flute trio for the sunset welcome.',
      rating: 4,
    },

    // Birthday vendors
    {
      id: 'v-6',
      eventId: birthdayId,
      name: 'Loft 38 Lounge',
      category: 'venue',
      contactPerson: 'David Fernandez',
      phone: '+91 80 4965 2200',
      email: 'manager@loft38.demo',
      city: 'Bangalore',
      quotedAmount: 12000,
      advancePayment: 6000,
      bookingStatus: 'booked',
      contractStatus: 'signed',
      paymentDueDate: getDateOffset(7),
      notes: 'Terrace VIP booth reserved with dedicated mixologist.',
      rating: 4,
    },
    {
      id: 'v-7',
      eventId: birthdayId,
      name: 'The Neon Balloon Co.',
      category: 'decorator',
      contactPerson: 'Sneha Roy',
      phone: '+91 98860 11223',
      email: 'sneha@neonballoon.demo',
      city: 'Bangalore',
      quotedAmount: 4500,
      advancePayment: 4500,
      bookingStatus: 'booked',
      contractStatus: 'signed',
      notes: 'LED neon sign included in rental.',
      rating: 5,
    },

    // Community vendors
    {
      id: 'v-8',
      eventId: communityId,
      name: 'SolarSound Eco PA Solutions',
      category: 'rentals',
      contactPerson: 'Nikhil Patil',
      phone: '+91 98220 44556',
      email: 'nikhil@solarsound.demo',
      city: 'Pune',
      quotedAmount: 16000,
      advancePayment: 8000,
      bookingStatus: 'booked',
      contractStatus: 'signed',
      paymentDueDate: getDateOffset(20),
      notes: 'Zero carbon footprint sound system with LiFePO4 batteries.',
      rating: 5,
    },
  ];

  const guests: Guest[] = [
    // Wedding guests
    { id: 'g-1', eventId: weddingId, name: 'Uncle Harish & Aunt Sarla', contact: '+91 98200 11111', group: 'family', rsvpStatus: 'attending', additionalGuests: 1, dietaryPreferences: 'Vegetarian', accessibilityNotes: 'Needs first-row seating', tableOrSeating: 'Table 1 (Family Elders)', invitationStatus: 'opened', notes: 'Arriving from Delhi on morning flight.' },
    { id: 'g-2', eventId: weddingId, name: 'Kunal Verma (Best Man)', contact: '+91 98765 22222', group: 'friends', rsvpStatus: 'attending', additionalGuests: 0, dietaryPreferences: 'No seafood', tableOrSeating: 'Table 4 (College Friends)', invitationStatus: 'opened', notes: 'Giving the toast at 9 PM.' },
    { id: 'g-3', eventId: weddingId, name: 'Dr. Ramesh & Sunita Joshi', contact: '+91 98111 33333', group: 'family', rsvpStatus: 'attending', additionalGuests: 2, dietaryPreferences: 'Strict Jain', tableOrSeating: 'Table 2 (Family Elders)', invitationStatus: 'sent', notes: 'Requested no onion/garlic preparation.' },
    { id: 'g-4', eventId: weddingId, name: 'Tanya Sengupta', contact: '+91 98300 44444', group: 'friends', rsvpStatus: 'declined', additionalGuests: 0, invitationStatus: 'opened', notes: 'Abroad on conference; sending wedding gift.' },
    { id: 'g-5', eventId: weddingId, name: 'Rahul & Neha Kapoor', contact: '+91 98222 55555', group: 'colleagues', rsvpStatus: 'pending', additionalGuests: 1, invitationStatus: 'viewed', notes: 'Awaiting leave confirmation.' },
    { id: 'g-6', eventId: weddingId, name: 'Vikramaditya Singhania', contact: '+91 98999 66666', group: 'vip', rsvpStatus: 'attending', additionalGuests: 1, dietaryPreferences: 'Vegetarian', tableOrSeating: 'VIP Royal Pavilion', invitationStatus: 'opened', notes: 'Provide dedicated parking pass.' },

    // Birthday guests
    { id: 'g-7', eventId: birthdayId, name: 'Arjun Mehta', contact: '+91 97400 12345', group: 'friends', rsvpStatus: 'attending', additionalGuests: 1, dietaryPreferences: 'Vegan', invitationStatus: 'opened' },
    { id: 'g-8', eventId: birthdayId, name: 'Maya Krishnan', contact: '+91 98450 67890', group: 'friends', rsvpStatus: 'attending', additionalGuests: 0, dietaryPreferences: 'Gluten-Free', invitationStatus: 'opened' },
    { id: 'g-9', eventId: birthdayId, name: 'Ritesh Sen', contact: '+91 99000 54321', group: 'friends', rsvpStatus: 'pending', additionalGuests: 0, invitationStatus: 'sent' },

    // Community guests
    { id: 'g-10', eventId: communityId, name: 'Green Earth Youth Collective (15 pax)', contact: '+91 98230 77889', group: 'community', rsvpStatus: 'attending', additionalGuests: 14, dietaryPreferences: '100% Plant Based', invitationStatus: 'opened' },
    { id: 'g-11', eventId: communityId, name: 'Pune Botanical Society Delegation', contact: '+91 98220 99887', group: 'vip', rsvpStatus: 'attending', additionalGuests: 5, invitationStatus: 'opened' },
  ];

  const inspirations: InspirationItem[] = [
    {
      id: 'ins-1',
      eventId: weddingId,
      category: 'theme',
      title: 'Luminous Rajputana Twilight Canopy',
      description: 'Layering thousands of micro warm fairy bulbs under cascading white jasmine garlands to simulate an indoor starry constellation.',
      palette: ['#8B5CF6', '#F59E0B', '#F3F4F6', '#1E1B4B'],
      tags: ['Wedding', 'Fairy Lights', 'Twilight', 'Traditional'],
      savedAt: '2026-10-15T14:00:00Z',
    },
    {
      id: 'ins-2',
      eventId: weddingId,
      category: 'menu',
      title: 'Artisanal Kesar Thandai & Smoked Chaat Station',
      description: 'Individual clay kulhads filled with chilled almond-pistachio thandai topped with edible silver leaf and dried rose petals.',
      tags: ['Food', 'Signature Drinks', 'Royal Cuisine'],
      savedAt: '2026-10-18T16:30:00Z',
    },
    {
      id: 'ins-3',
      eventId: birthdayId,
      category: 'decor',
      title: 'Retro Neon Wave with Pastel Balloon Cloud',
      description: 'Curved matte peach, lavender, and sage green organic balloon arch with center warm white glowing neon cursive signage.',
      palette: ['#F472B6', '#C084FC', '#67E8F9', '#FDF2F8'],
      tags: ['Birthday', 'Neon', 'Pastel', 'Modern'],
      savedAt: '2026-10-19T09:15:00Z',
    },
    {
      id: 'ins-4',
      eventId: communityId,
      category: 'diy',
      title: 'Seed-Infused Plantable Name Tags',
      description: 'Handmade recycled cotton paper impregnated with marigold and basil seeds. Guests plant their badge in soil after the festival.',
      tags: ['Eco', 'Zero Waste', 'DIY', 'Workshop'],
      savedAt: '2026-10-17T11:45:00Z',
    },
  ];

  return { events, budgetItems, tasks, vendors, guests, inspirations };
}
