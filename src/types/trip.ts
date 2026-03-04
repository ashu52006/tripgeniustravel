export type TravelStyle = 'budget' | 'balanced' | 'luxury' | 'adventure' | 'cultural';
export type TravelPace = 'relaxed' | 'normal' | 'fast';
export type PlacePriority = 'must-visit' | 'recommended' | 'optional';
export type CrowdLevel = 'low' | 'medium' | 'high';

export interface TripSetup {
  destination: string;
  days: number;
  startDate: string;
  travelers: number;
  userBudget: number;
  currency: string;
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
  timeRequired: string;
  distanceFromPrevious: string;
  crowdLevel: CrowdLevel;
  weatherSuitability: string;
  priority: PlacePriority;
  category: 'attraction' | 'food' | 'transport' | 'rest' | 'activity' | 'viewpoint';
  imageUrl?: string;
}

export interface DailyCost {
  transport: number;
  entryFees: number;
  food: number;
  activities: number;
  total: number;
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  places: PlaceRecommendation[];
  cost: DailyCost;
}

export interface BudgetAnalysis {
  userBudget: number;
  minimumBudget: number;
  comfortableBudget: number;
  idealBudget: number;
  currency: string;
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
  tag?: 'cheapest' | 'balanced' | 'fastest';
}

export interface TripPlan {
  setup: TripSetup;
  days: DayPlan[];
  budget: BudgetAnalysis;
  hotels: HotelRecommendation[];
  flights: FlightRecommendation[];
}
