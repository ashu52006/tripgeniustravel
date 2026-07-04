// Single source of truth for premium/free gating.
// Every gated action must go through canAccess() — do not scatter plan checks inline.

export type Feature =
  | 'fullItinerary'
  | 'liveMap'
  | 'dayEditing'
  | 'buddyVisibility'
  | 'unlimitedPdf'
  | 'saveTrip'
  | 'shareTrip';

export type PlanId = 'basic' | 'silver' | 'gold' | 'platinum';

const PREMIUM_PLANS: PlanId[] = ['silver', 'gold', 'platinum'];

export const isPremium = (plan: string | null | undefined): boolean =>
  !!plan && PREMIUM_PLANS.includes(plan as PlanId);

/** Central entitlement check. All feature keys resolve to premium-vs-free. */
export const canAccess = (plan: string | null | undefined, feature: Feature): boolean => {
  switch (feature) {
    case 'fullItinerary':
    case 'liveMap':
    case 'dayEditing':
    case 'buddyVisibility':
    case 'unlimitedPdf':
    case 'saveTrip':
    case 'shareTrip':
      return isPremium(plan);
    default:
      return false;
  }
};

export const FREE_DAYS_VISIBLE = 1;
