// Curated sample trips with real destination photos (Unsplash).
// Clicking a sample either shows a static preview or pre-fills the trip form.

export interface SampleTrip {
  id: string;
  destination: string;
  country: string;
  origin: string; // suggested origin for pre-fill
  days: number;
  budgetINR: number;
  tagline: string;
  vibe: string;
  imageUrl: string;
  highlights: string[]; // 3-5 places
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&auto=format&fit=crop&q=80`;

export const sampleTrips: SampleTrip[] = [
  {
    id: 'goa-5d',
    destination: 'Goa',
    country: 'India',
    origin: 'Mumbai',
    days: 5,
    budgetINR: 35000,
    tagline: 'Beaches, sunsets & shacks',
    vibe: 'Beach · Nightlife · Relaxed',
    imageUrl: img('1512343879784-a960bf40e7f2'),
    highlights: ['Baga Beach', 'Fort Aguada', 'Anjuna Flea Market', 'Dudhsagar Falls', 'Palolem'],
  },
  {
    id: 'bali-7d',
    destination: 'Bali',
    country: 'Indonesia',
    origin: 'Delhi',
    days: 7,
    budgetINR: 95000,
    tagline: 'Rice terraces & temples',
    vibe: 'Culture · Beach · Wellness',
    imageUrl: img('1537996194471-e657df975ab4'),
    highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Uluwatu', 'Nusa Penida', 'Seminyak'],
  },
  {
    id: 'paris-6d',
    destination: 'Paris',
    country: 'France',
    origin: 'Mumbai',
    days: 6,
    budgetINR: 180000,
    tagline: 'City of light & love',
    vibe: 'Romantic · Art · Cuisine',
    imageUrl: img('1502602898657-3e91760cbb34'),
    highlights: ['Eiffel Tower', 'Louvre', 'Montmartre', 'Seine Cruise', 'Versailles'],
  },
  {
    id: 'tokyo-7d',
    destination: 'Tokyo',
    country: 'Japan',
    origin: 'Bangalore',
    days: 7,
    budgetINR: 210000,
    tagline: 'Neon nights & zen mornings',
    vibe: 'Tech · Food · Culture',
    imageUrl: img('1540959733332-eab4deabeeaf'),
    highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Mt. Fuji Day Trip', 'Akihabara', 'Tsukiji'],
  },
  {
    id: 'dubai-5d',
    destination: 'Dubai',
    country: 'UAE',
    origin: 'Delhi',
    days: 5,
    budgetINR: 90000,
    tagline: 'Desert luxury & sky-high views',
    vibe: 'Luxury · Adventure · Shopping',
    imageUrl: img('1512453979798-5ea266f8880c'),
    highlights: ['Burj Khalifa', 'Desert Safari', 'Palm Jumeirah', 'Dubai Mall', 'Old Souk'],
  },
  {
    id: 'kerala-6d',
    destination: 'Kerala',
    country: 'India',
    origin: 'Hyderabad',
    days: 6,
    budgetINR: 42000,
    tagline: "God's own backwaters",
    vibe: 'Nature · Ayurveda · Serene',
    imageUrl: img('1602216056096-3b40cc0c9944'),
    highlights: ['Alleppey Houseboat', 'Munnar Tea Gardens', 'Kochi Fort', 'Wayanad', 'Varkala'],
  },
];
