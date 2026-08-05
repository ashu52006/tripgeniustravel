// Single source of truth for plan tiers and feature gating.
// Every gated action must go through canAccess() — do not scatter plan checks inline.

export type PlanId = 'free' | 'pro' | 'premium' | 'enterprise';

export type Feature =
  // Free
  | 'aiTripPlanner'
  | 'itinerarySharing'
  | 'liveMap'
  | 'destinationGuides'
  // Pro
  | 'fullItinerary'
  | 'unlimitedPdf'
  | 'saveTrip'
  | 'shareTrip'
  | 'dayEditing'
  | 'expenseTracker'
  | 'budgetForecast'
  | 'savedSearches'
  | 'csvExport'
  | 'advancedReports'
  // Premium
  | 'offlineAccess'
  | 'versionHistory'
  | 'prioritySupport'
  | 'groupSplit'
  | 'buddyVisibility'
  | 'premiumAnalytics'
  // Enterprise
  | 'whiteLabel'
  | 'apiAccess'
  | 'orgManagement';

const RANK: Record<PlanId, number> = { free: 0, pro: 1, premium: 2, enterprise: 3 };

/** Minimum tier required for each feature. */
export const FEATURE_TIER: Record<Feature, PlanId> = {
  aiTripPlanner: 'free',
  itinerarySharing: 'free',
  liveMap: 'free',
  destinationGuides: 'free',

  fullItinerary: 'pro',
  unlimitedPdf: 'pro',
  saveTrip: 'pro',
  shareTrip: 'pro',
  dayEditing: 'pro',
  expenseTracker: 'pro',
  budgetForecast: 'pro',
  savedSearches: 'pro',
  csvExport: 'pro',
  advancedReports: 'pro',

  offlineAccess: 'premium',
  versionHistory: 'premium',
  prioritySupport: 'premium',
  groupSplit: 'premium',
  buddyVisibility: 'premium',
  premiumAnalytics: 'premium',

  whiteLabel: 'enterprise',
  apiAccess: 'enterprise',
  orgManagement: 'enterprise',
};

/** Normalises legacy plan ids (basic/silver/gold/platinum) to the current tiers. */
export const normalizePlan = (plan: string | null | undefined): PlanId => {
  switch (plan) {
    case 'basic':
      return 'free';
    case 'silver':
      return 'pro';
    case 'gold':
      return 'premium';
    case 'platinum':
      return 'enterprise';
    case 'free':
    case 'pro':
    case 'premium':
    case 'enterprise':
      return plan;
    default:
      return 'free';
  }
};

export const isPaid = (plan: string | null | undefined): boolean =>
  RANK[normalizePlan(plan)] >= RANK.pro;

/** Kept for backwards compatibility with existing call sites. */
export const isPremium = isPaid;

/** Central entitlement check. */
export const canAccess = (plan: string | null | undefined, feature: Feature): boolean =>
  RANK[normalizePlan(plan)] >= RANK[FEATURE_TIER[feature]];

export const FREE_DAYS_VISIBLE = 1;

export interface PlanMeta {
  id: PlanId;
  name: string;
  price: number; // INR per month (per seat for enterprise)
  priceLabel: string;
  priceSubtext: string;
  tagline: string;
  highlights: string[];
  cta: string;
  contactOnly?: boolean;
}

export const PLANS: PlanMeta[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '₹0',
    priceSubtext: 'per month, forever',
    tagline: 'Plan your trip with AI, no card needed.',
    highlights: [
      'AI trip planner & day-wise itinerary',
      'Destination guides, weather & visa info',
      'Live maps and route tracking',
      'Day 1 fully unlocked + 1 PDF per trip',
      'Multi-currency & multi-language',
    ],
    cta: 'Current Plan',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    priceLabel: '₹299',
    priceSubtext: 'per month',
    tagline: 'For frequent travellers who want the full plan.',
    highlights: [
      'Everything in Free',
      'Full itinerary unlocked, every day',
      'Unlimited PDF export, save & share',
      'Day editing with auto de-duplication',
      'AI budget planner, forecast & expense tracker',
      'Saved searches, CSV export & reports',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 699,
    priceLabel: '₹699',
    priceSubtext: 'per month',
    tagline: 'Offline-ready travel with priority support.',
    highlights: [
      'Everything in Pro',
      'Offline itinerary access & version history',
      'Group expense split & UPI settlement',
      'Travel buddy visibility & group voting',
      'Premium analytics across all trips',
      '24×7 priority human support',
      'All international travel features included',
    ],
    cta: 'Upgrade to Premium',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    priceLabel: '₹499',
    priceSubtext: 'per seat / month · min 20 seats (₹9,980)',
    tagline: 'White-label travel operations for teams.',
    highlights: [
      'Everything in Premium',
      'White-label platform & custom domain',
      'REST API access with OpenAPI docs',
      'Role-based access & org management',
      'Enterprise spend & booking analytics',
      '15% annual contract discount (₹424/seat)',
      'Dedicated account manager & SLA support',
    ],
    cta: 'Contact Sales',
    contactOnly: true,
  },
];

export const INTL_ADDON = {
  id: 'intl_addon',
  name: 'International Feature Pack',
  price: 199,
  priceLabel: '₹199 / month',
  description: 'Add international travel features to Pro. Already included in Premium.',
};

export const getPlanMeta = (plan: string | null | undefined): PlanMeta =>
  PLANS.find((p) => p.id === normalizePlan(plan)) ?? PLANS[0];

export const ENTERPRISE_MIN_SEATS = 20;
