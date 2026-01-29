
export enum TripType {
  SOLO = 'Solo',
  BACHELOR = 'Bachelor',
  COUPLE = 'Couple',
  FRIENDS = 'Friends',
  FAMILY = 'Family'
}

export enum Interest {
  NIGHTLIFE = 'Nightlife',
  BEACHES = 'Beaches',
  FOOD = 'Food',
  ADVENTURE = 'Adventure',
  SIGHTSEEING = 'Sightseeing',
  CULTURE = 'Local Culture'
}

export interface UserInput {
  fromCity: string;
  toCity: string;
  tripType: TripType;
  budget: number;
  duration: number;
  interests: Interest[];
}

export interface TravelOption {
  mode: string;
  type: string;
  estimatedCost: number;
  description: string;
}

export interface StayOption {
  name: string;
  type: string; 
  price: number;
  rating: number; 
  reviewCount: string;
  highlight: string;
  bookingUrl?: string;
}

export interface Accommodation {
  area: string;
  whyThisArea: string;
  options: StayOption[];
}

export interface DayItinerary {
  day: number;
  title: string;
  activities: string[];
  estimatedCost: number;
}

export interface CostBreakdown {
  travel: number;
  stay: number;
  food: number;
  activities: number;
  total: number;
}

export interface Source {
  title: string;
  uri: string;
}

export interface LocalTip {
  category: string; // e.g., "Culture Hack", "Safety", "Foodie Secret"
  text: string;
}

export interface TravelPlan {
  travelOptions: TravelOption[];
  accommodation: Accommodation;
  suggestedPlaces: string[];
  itinerary: DayItinerary[];
  costBreakdown: CostBreakdown;
  localTips: LocalTip[]; // Updated to structured objects
  summary: string;
  sources?: Source[];
}
