export type TravelStyle = 'budget' | 'balanced' | 'luxury' | 'adventure' | 'cultural';
export type TravelPace = 'relaxed' | 'normal' | 'fast';
export type PlacePriority = 'must-visit' | 'recommended' | 'optional';
export type CrowdLevel = 'low' | 'medium' | 'high';

export type UserRegion = 'india' | 'usa' | 'uk' | 'europe' | 'japan' | 'china' | 'korea' | 'uae' | 'australia' | 'brazil' | 'canada' | 'other';

export interface RegionCurrency {
  code: string;
  symbol: string;
  name: string;
}

export const regionCurrencies: Record<UserRegion, RegionCurrency> = {
  india: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  usa: { code: 'USD', symbol: '$', name: 'US Dollar' },
  uk: { code: 'GBP', symbol: '£', name: 'British Pound' },
  europe: { code: 'EUR', symbol: '€', name: 'Euro' },
  japan: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  china: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  korea: { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  uae: { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  australia: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  brazil: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  canada: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  other: { code: 'USD', symbol: '$', name: 'US Dollar' },
};

export interface TripSetup {
  origin: string;
  destination: string;
  days: number;
  startDate: string;
  endDate: string;
  travelers: number;
  userBudget: number;
  currency: string;
  homeCurrency: string;
  homeRegion: UserRegion;
  style: TravelStyle;
  pace: TravelPace;
}

export interface PlaceRecommendation {
  id: string;
  name: string;
  description: string;
  whyRecommended: string;
  startTime: string;
  endTime: string;
  entryFee: number;
  entryFeeHome?: number;
  timeRequired: string;
  distanceFromPrevious: string;
  taxiFare?: string;
  taxiFareHome?: string;
  crowdLevel: CrowdLevel;
  weatherSuitability: string;
  priority: PlacePriority;
  category: 'attraction' | 'food' | 'transport' | 'rest' | 'activity' | 'viewpoint' | 'flight' | 'hotel';
  imageUrl?: string;
  mapUrl?: string;
}

export interface DailyCost {
  transport: number;
  entryFees: number;
  food: number;
  activities: number;
  total: number;
  totalHome?: number;
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  places: PlaceRecommendation[];
  cost: DailyCost;
}

export interface BudgetPlanOption {
  id: string;
  name: string;
  level: number;
  totalBudget: number;
  totalBudgetHome: number;
  description: string;
  highlights: string[];
  hotelType: string;
  foodType: string;
  transportType: string;
}

export interface BudgetAnalysis {
  userBudget: number;
  minimumBudget: number;
  comfortableBudget: number;
  idealBudget: number;
  currency: string;
  homeCurrency?: string;
  tips: string[];
  breakdown: {
    category: string;
    userBudget: number;
    recommended: number;
  }[];
}

export interface HotelRecommendation {
  id: string;
  name: string;
  pricePerNight: number;
  pricePerNightHome?: number;
  distanceToAttractions: string;
  category: 'budget' | 'comfort' | 'premium';
  safetyRating: number;
  guestRating: number;
  whyItFits: string;
  tag?: 'best-value' | 'budget-saver' | 'comfort-pick';
}

export interface FlightRecommendation {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  priceHome?: number;
  from: string;
  to: string;
  tag?: 'cheapest' | 'balanced' | 'fastest';
}

export interface TripPlan {
  setup: TripSetup;
  days: DayPlan[];
  budget: BudgetAnalysis;
  hotels: HotelRecommendation[];
  flights: FlightRecommendation[];
  returnFlights?: FlightRecommendation[];
}
