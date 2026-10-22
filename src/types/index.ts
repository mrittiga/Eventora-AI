export type EventType =
  | 'wedding'
  | 'birthday'
  | 'community'
  | 'corporate'
  | 'anniversary'
  | 'baby_shower'
  | 'cultural_fest'
  | 'other';

export type BudgetFlexibility = 'strict' | 'moderate' | 'flexible';

export interface EventPreferences {
  themeStyle: 'formal' | 'casual' | 'traditional' | 'luxury' | 'rustic' | 'minimalist' | 'playful';
  colorPalette: string[];
  foodPreferences: string[];
  dietaryRestrictions: string[];
  culturalTradition?: string;
  accessibilityNeeds?: string[];
  priorities: ('cost' | 'quality' | 'sustainability' | 'convenience' | 'luxury')[];
  diyVsProfessional: 'mostly_diy' | 'balanced' | 'professional_heavy';
  planningExperience: 'beginner' | 'intermediate' | 'experienced';
  specialRequests?: string;
  isIndoorOutdoor: 'indoor' | 'outdoor' | 'hybrid';
}

export interface GeneratedEventPlan {
  conceptTitle: string;
  conceptSummary: string;
  themeAndDecor: {
    recommendedTheme: string;
    colors: string[];
    decorElements: string[];
    lightingAndAmbience: string;
  };
  budgetBreakdown: {
    category: string;
    suggestedPercentage: number;
    suggestedAmount: number;
    guidelines: string;
  }[];
  timeline: {
    phase: string;
    daysBefore: number;
    milestone: string;
    keyTasks: string[];
  }[];
  vendorPriorities: {
    vendorCategory: string;
    recommendedBookingWindow: string;
    priority: 'urgent' | 'high' | 'medium';
    keyQuestionsToAsk: string[];
  }[];
  guestManagementAdvice: string[];
  cateringAndMenu: {
    menuStyle: string;
    signatureItems: string[];
    beverageIdeas: string[];
  };
  sampleDayAgenda: {
    time: string;
    activity: string;
    coordinatorNotes: string;
  }[];
  activitiesAndEntertainment: string[];
  riskAndContingency: {
    risk: string;
    solution: string;
  }[];
  costSavingSuggestions: string[];
  finalChecklist: string[];
}

export interface EventItem {
  id: string;
  name: string;
  eventType: EventType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  venueName?: string;
  guestCount: number;
  budget: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  budgetFlexibility: BudgetFlexibility;
  coverImage?: string;
  theme?: string;
  preferences: EventPreferences;
  aiPlan?: GeneratedEventPlan;
  createdAt: string;
  updatedAt: string;
}

export type BudgetCategory =
  | 'venue'
  | 'catering'
  | 'decorations'
  | 'photography'
  | 'entertainment'
  | 'invitations'
  | 'attire_makeup'
  | 'transportation'
  | 'gifts_favors'
  | 'rentals'
  | 'contingency'
  | 'miscellaneous';

export interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  title: string;
  estimatedAmount: number;
  actualAmount: number;
  paidAmount: number;
  vendorId?: string;
  dueDate?: string;
  notes?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  category: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee?: string;
  estimatedCost?: number;
  notes?: string;
}

export type VendorCategory =
  | 'venue'
  | 'caterer'
  | 'photographer'
  | 'videographer'
  | 'decorator'
  | 'florist'
  | 'dj_entertainment'
  | 'makeup_artist'
  | 'transport'
  | 'rentals'
  | 'coordinator'
  | 'other';

export type BookingStatus =
  | 'researching'
  | 'contacted'
  | 'quoted'
  | 'shortlisted'
  | 'booked'
  | 'cancelled';

export type ContractStatus = 'pending' | 'signed' | 'under_review' | 'none';

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  category: VendorCategory;
  contactPerson: string;
  phone: string;
  email: string;
  website?: string;
  city: string;
  quotedAmount: number;
  advancePayment: number;
  bookingStatus: BookingStatus;
  contractStatus: ContractStatus;
  paymentDueDate?: string;
  notes?: string;
  rating?: number;
}

export type RsvpStatus = 'pending' | 'attending' | 'declined';
export type InvitationStatus = 'not_sent' | 'sent' | 'viewed' | 'opened';
export type GuestGroup = 'family' | 'friends' | 'colleagues' | 'vip' | 'community' | 'general';

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  contact: string;
  group: GuestGroup;
  rsvpStatus: RsvpStatus;
  additionalGuests: number;
  dietaryPreferences?: string;
  accessibilityNotes?: string;
  tableOrSeating?: string;
  invitationStatus: InvitationStatus;
  notes?: string;
}

export interface InspirationItem {
  id: string;
  eventId?: string;
  category: 'theme' | 'palette' | 'decor' | 'invitation' | 'menu' | 'entertainment' | 'diy' | 'tagline';
  title: string;
  description: string;
  palette?: string[];
  tags: string[];
  savedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
}
