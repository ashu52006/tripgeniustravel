import { TripPlan, TripSetup } from '@/types/trip';

type DestinationData = {
  attractions: string[];
  restaurants: string[];
  sunsetSpots: string[];
  culturalSpots: string[];
  currency: string;
  costMultiplier: number;
};

const destinations: Record<string, DestinationData> = {
  paris: {
    attractions: ['Eiffel Tower', 'Louvre Museum', 'Arc de Triomphe', 'Sacré-Cœur Basilica', 'Notre-Dame Cathedral', 'Musée d\'Orsay'],
    restaurants: ['Café de Flore', 'Le Bouillon Chartier', 'Breizh Café', 'L\'As du Fallafel', 'Pink Mamma', 'Chez Janou'],
    sunsetSpots: ['Seine River Cruise Sunset', 'Trocadéro Gardens Sunset', 'Montmartre Hilltop Sunset', 'Pont Alexandre III at Dusk', 'Sacré-Cœur Steps Sunset', 'Luxembourg Gardens Sunset'],
    culturalSpots: ['Champs-Élysées Walk', 'Le Marais District', 'Versailles Palace', 'Père Lachaise Cemetery', 'Sainte-Chapelle', 'Palais Royal Gardens'],
    currency: '€',
    costMultiplier: 5,
  },
  london: {
    attractions: ['Tower of London', 'British Museum', 'Buckingham Palace', 'Westminster Abbey', 'Tower Bridge', 'St Paul\'s Cathedral'],
    restaurants: ['Borough Market', 'Dishoom', 'Padella', 'The Ivy', 'Flat Iron', 'Sketch'],
    sunsetSpots: ['Primrose Hill Sunset', 'Sky Garden Sunset', 'Hampstead Heath Sunset', 'Greenwich Park Sunset', 'Waterloo Bridge Sunset', 'Parliament Hill Sunset'],
    culturalSpots: ['Camden Market', 'Notting Hill Walk', 'Covent Garden', 'Brick Lane', 'Soho District', 'South Bank Walk'],
    currency: '£',
    costMultiplier: 5.5,
  },
  tokyo: {
    attractions: ['Senso-ji Temple', 'Meiji Shrine', 'Tokyo Skytree', 'Imperial Palace', 'Shibuya Crossing', 'Tsukiji Outer Market'],
    restaurants: ['Ichiran Ramen', 'Sushi Dai', 'Tonkatsu Maisen', 'Afuri Ramen', 'Gyukatsu Motomura', 'Tempura Kondo'],
    sunsetSpots: ['Tokyo Tower at Dusk', 'Odaiba Seaside Sunset', 'Roppongi Hills Sunset', 'Mount Takao Sunset', 'Rainbow Bridge Sunset', 'Shibuya Sky Sunset'],
    culturalSpots: ['Harajuku District', 'Akihabara Electric Town', 'Ueno Park', 'Asakusa Old Town', 'Yanaka Heritage Walk', 'Shinjuku Gyoen Garden'],
    currency: '¥',
    costMultiplier: 0.5,
  },
  dubai: {
    attractions: ['Burj Khalifa', 'Dubai Frame', 'Palm Jumeirah', 'Dubai Museum', 'Dubai Miracle Garden', 'Atlantis Aquaventure'],
    restaurants: ['Al Ustad Special Kabab', 'Ravi Restaurant', 'Arabian Tea House', 'Salt Burger', 'Bu Qtair', 'Logma'],
    sunsetSpots: ['Burj Khalifa Sunset Deck', 'Kite Beach Sunset', 'Dubai Marina Sunset', 'Al Seef Sunset Walk', 'JBR Beach Sunset', 'Desert Safari Sunset'],
    culturalSpots: ['Al Fahidi Historical District', 'Gold Souk & Spice Souk', 'Jumeirah Mosque', 'Dubai Creek Dhow Cruise', 'Madinat Jumeirah', 'Global Village'],
    currency: 'AED',
    costMultiplier: 1.5,
  },
  bali: {
    attractions: ['Uluwatu Temple', 'Tegallalang Rice Terraces', 'Tanah Lot Temple', 'Sacred Monkey Forest', 'Tirta Empul Temple', 'Mount Batur'],
    restaurants: ['Warung Babi Guling', 'Locavore', 'La Favela', 'Nook Bali', 'Sisterfields', 'Warung Mak Beng'],
    sunsetSpots: ['Uluwatu Cliff Sunset', 'Tanah Lot Sunset', 'Seminyak Beach Sunset', 'Jimbaran Bay Sunset', 'Campuhan Ridge Sunset', 'Kecak Dance Sunset'],
    culturalSpots: ['Ubud Art Market', 'Tirta Gangga Water Palace', 'Besakih Temple', 'Ubud Palace', 'Goa Gajah Cave', 'Penglipuran Village'],
    currency: 'IDR',
    costMultiplier: 0.04,
  },
  newyork: {
    attractions: ['Statue of Liberty', 'Central Park', 'Empire State Building', 'Times Square', 'Brooklyn Bridge', 'Metropolitan Museum'],
    restaurants: ['Joe\'s Pizza', 'Katz\'s Delicatessen', 'Los Tacos No.1', 'Peter Luger Steak', 'Di Fara Pizza', 'Shake Shack'],
    sunsetSpots: ['Top of the Rock Sunset', 'Brooklyn Bridge Sunset', 'DUMBO Waterfront Sunset', 'The High Line Sunset', 'Gantry Plaza Sunset', 'Battery Park Sunset'],
    culturalSpots: ['Greenwich Village Walk', 'SoHo Art Galleries', 'Harlem Heritage Walk', 'Chelsea Market', 'Chinatown Exploration', 'Little Italy Walk'],
    currency: '$',
    costMultiplier: 5,
  },
  rome: {
    attractions: ['Colosseum', 'Vatican Museums', 'Pantheon', 'Trevi Fountain', 'Roman Forum', 'Spanish Steps'],
    restaurants: ['Da Enzo al 29', 'Pizzarium', 'Roscioli', 'Tonnarello', 'Antico Forno Roscioli', 'Supplizio'],
    sunsetSpots: ['Pincio Terrace Sunset', 'Janiculum Hill Sunset', 'Orange Garden Sunset', 'Castel Sant\'Angelo Sunset', 'Ponte Sisto Sunset', 'Aventine Hill Sunset'],
    culturalSpots: ['Trastevere District', 'Via Appia Antica', 'Borghese Gallery', 'Campo de\' Fiori Market', 'Jewish Ghetto Walk', 'Piazza Navona'],
    currency: '€',
    costMultiplier: 4.5,
  },
  bangkok: {
    attractions: ['Grand Palace', 'Wat Arun', 'Wat Pho', 'Chatuchak Market', 'Jim Thompson House', 'Wat Saket'],
    restaurants: ['Jay Fai', 'Thip Samai', 'Som Tam Nua', 'Raan Jay Fai', 'Krua Apsorn', 'Pee Aor Tom Yum'],
    sunsetSpots: ['Wat Arun Riverside Sunset', 'Rooftop Bar Sunset', 'Lumpini Park Sunset', 'Asiatique Riverfront Sunset', 'Sky Bar Sunset', 'Chao Phraya Cruise Sunset'],
    culturalSpots: ['Chinatown (Yaowarat)', 'Khao San Road', 'Floating Market', 'Erawan Shrine', 'Flower Market', 'Artist House Thonburi'],
    currency: '฿',
    costMultiplier: 0.2,
  },
  goa: {
    attractions: ['Fort Aguada', 'Basilica of Bom Jesus', 'Dudhsagar Falls', 'Se Cathedral', 'Chapora Fort', 'Reis Magos Fort'],
    restaurants: ['Fisherman\'s Wharf', 'Britto\'s', 'Gunpowder', 'Vinayak Family Restaurant', 'Mum\'s Kitchen', 'Café Bodega'],
    sunsetSpots: ['Vagator Sunset Point', 'Dona Paula Viewpoint', 'Cabo de Rama Sunset', 'Palolem Beach Sunset', 'Chapora Fort Sunset', 'Anjuna Beach Sunset'],
    culturalSpots: ['Fontainhas Latin Quarter', 'Anjuna Flea Market', 'Spice Plantation Tour', 'Old Goa Heritage Walk', 'Mapusa Market', 'Panjim Church Square'],
    currency: '₹',
    costMultiplier: 1,
  },
  jaipur: {
    attractions: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar', 'Nahargarh Fort', 'Jal Mahal'],
    restaurants: ['Chokhi Dhani', 'Laxmi Mishthan Bhandar', 'Tapri Central', 'Bar Palladio', 'Rawat Mishthan Bhandar', 'Suvarna Mahal'],
    sunsetSpots: ['Nahargarh Fort Sunset', 'Jal Mahal Sunset', 'Albert Hall Sunset', 'Amer Palace Sunset', 'Jaigarh Fort Sunset', 'Sisodia Rani Garden Sunset'],
    culturalSpots: ['Johari Bazaar', 'Bapu Bazaar', 'Birla Mandir', 'Galtaji Temple', 'Elefantastic Elephant Sanctuary', 'Block Printing Workshop'],
    currency: '₹',
    costMultiplier: 1,
  },
  manali: {
    attractions: ['Solang Valley', 'Rohtang Pass', 'Hadimba Temple', 'Old Manali', 'Jogini Waterfall', 'Vashisht Hot Springs'],
    restaurants: ['Lazy Dog Lounge', 'Johnson\'s Café', 'Drifters\' Café', 'Casa Bella Vista', 'Dylan\'s Toasted & Roasted', 'Il Forno'],
    sunsetSpots: ['Solang Valley Sunset', 'Beas River Sunset', 'Manali Club House Sunset', 'Gulaba Viewpoint Sunset', 'Hampta Pass Sunset', 'Old Manali Sunset'],
    culturalSpots: ['Manu Temple', 'Tibetan Monastery', 'Van Vihar Park', 'Naggar Castle', 'Great Himalayan National Park', 'Kullu Shawl Factory'],
    currency: '₹',
    costMultiplier: 1,
  },
  delhi: {
    attractions: ['Humayun\'s Tomb', 'Qutub Minar', 'Red Fort', 'India Gate', 'Lotus Temple', 'Akshardham Temple'],
    restaurants: ['Karim\'s', 'Paranthe Wali Gali', 'Moti Mahal', 'Indian Accent', 'Bukhara', 'Andhra Bhawan Canteen'],
    sunsetSpots: ['India Gate at Dusk', 'Lodhi Garden Sunset', 'Hauz Khas Lake Sunset', 'Rashtrapati Bhavan Sunset', 'Purana Qila Sunset', 'Nehru Park Sunset'],
    culturalSpots: ['Chandni Chowk Walk', 'Hauz Khas Village', 'Dilli Haat', 'Khan Market', 'Lodhi Art District', 'Connaught Place'],
    currency: '₹',
    costMultiplier: 1,
  },
  singapore: {
    attractions: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa Island', 'Merlion Park', 'Singapore Zoo', 'ArtScience Museum'],
    restaurants: ['Lau Pa Sat', 'Tian Tian Chicken Rice', 'Jumbo Seafood', 'Din Tai Fung', 'Burnt Ends', 'Satay by the Bay'],
    sunsetSpots: ['Marina Bay Sunset', 'Sentosa Beach Sunset', 'Henderson Waves Sunset', 'Gardens by the Bay Sunset', 'Mount Faber Sunset', 'East Coast Park Sunset'],
    culturalSpots: ['Chinatown Heritage Walk', 'Little India Exploration', 'Arab Street & Haji Lane', 'Kampong Glam', 'Peranakan Museum', 'Clarke Quay'],
    currency: 'S$',
    costMultiplier: 4.5,
  },
};

function findDestination(input: string): DestinationData {
  const lower = input.toLowerCase().replace(/[^a-z ]/g, '');
  
  for (const [key, data] of Object.entries(destinations)) {
    if (lower.includes(key)) return data;
  }

  const countryMap: Record<string, string> = {
    france: 'paris', italy: 'rome', japan: 'tokyo', thailand: 'bangkok',
    india: 'delhi', indonesia: 'bali', uae: 'dubai', uk: 'london',
    england: 'london', 'united states': 'newyork', usa: 'newyork',
    america: 'newyork',
  };

  for (const [country, city] of Object.entries(countryMap)) {
    if (lower.includes(country)) return destinations[city];
  }

  return {
    attractions: [
      `${input} Central Monument`, `${input} National Museum`, `${input} Old Town Square`,
      `${input} Royal Palace`, `${input} Grand Cathedral`, `${input} Historic Fort`,
    ],
    restaurants: [
      `${input} Local Kitchen`, `${input} Street Food Market`, `Café Central ${input}`,
      `${input} Bistro`, `Old Town Restaurant`, `The Local Eatery`,
    ],
    sunsetSpots: [
      `${input} Hilltop Sunset`, `${input} Riverside Sunset`, `${input} Tower Sunset`,
      `${input} Park Sunset`, `${input} Beach Sunset`, `${input} Bridge Sunset`,
    ],
    culturalSpots: [
      `${input} Art District`, `${input} Heritage Walk`, `${input} Local Market`,
      `${input} Old Quarter`, `${input} Craft Village`, `${input} Cultural Center`,
    ],
    currency: '$',
    costMultiplier: 4,
  };
}

export function generateMockTripPlan(setup: TripSetup): TripPlan {
  const dest = findDestination(setup.destination);
  const curr = dest.currency;

  const baseCosts = {
    entryFee: Math.round(200 * dest.costMultiplier),
    transport: Math.round(450 * dest.costMultiplier),
    food: Math.round(800 * dest.costMultiplier),
    activity: Math.round(300 * dest.costMultiplier),
    hotel: Math.round(2500 * dest.costMultiplier),
    flight: Math.round(5000 * dest.costMultiplier),
  };

  const daysData = Array.from({ length: setup.days }, (_, i) => {
    const date = new Date(setup.startDate);
    date.setDate(date.getDate() + i);
    const dayTitles = [
      'Arrival & First Impressions',
      'Iconic Landmarks Day',
      'Culture & Local Life',
      'Hidden Gems & Nature',
      'Relaxation & Shopping',
      'Farewell Exploration',
    ];

    const attraction = dest.attractions[i % dest.attractions.length];
    const restaurant = dest.restaurants[i % dest.restaurants.length];
    const sunsetSpot = dest.sunsetSpots[i % dest.sunsetSpots.length];
    const culturalSpot = dest.culturalSpots[i % dest.culturalSpots.length];
    const lunchSpot = dest.restaurants[(i + 3) % dest.restaurants.length];

    return {
      day: i + 1,
      date: date.toISOString().split('T')[0],
      title: dayTitles[i % dayTitles.length],
      places: [
        {
          id: `d${i + 1}-p1`,
          name: i === 0 ? `Check-in & Breakfast at ${restaurant}` : `Breakfast at ${restaurant}`,
          description: 'Start your day with authentic local flavors',
          whyRecommended: 'Highly rated local spot with great ambiance and authentic cuisine',
          startTime: '08:00',
          endTime: '09:00',
          entryFee: 0,
          timeRequired: '1 hour',
          distanceFromPrevious: i === 0 ? 'From airport/station' : '0.5 km',
          crowdLevel: 'low' as const,
          weatherSuitability: 'Any weather',
          priority: 'recommended' as const,
          category: 'food' as const,
        },
        {
          id: `d${i + 1}-p2`,
          name: attraction,
          description: `One of the most iconic landmarks in ${setup.destination}`,
          whyRecommended: 'Best visited in the morning when crowds are minimal',
          startTime: '09:30',
          endTime: '11:30',
          entryFee: Math.round(baseCosts.entryFee + i * 50 * dest.costMultiplier),
          timeRequired: '2 hours',
          distanceFromPrevious: `${3 + i} km`,
          crowdLevel: 'medium' as const,
          weatherSuitability: 'Clear skies preferred',
          priority: 'must-visit' as const,
          category: 'attraction' as const,
        },
        {
          id: `d${i + 1}-p3`,
          name: 'Travel & Rest',
          description: 'Commute to next destination with a short break',
          whyRecommended: 'Avoid the midday heat and recharge',
          startTime: '12:00',
          endTime: '13:00',
          entryFee: 0,
          timeRequired: '1 hour',
          distanceFromPrevious: `${2 + i} km`,
          crowdLevel: 'low' as const,
          weatherSuitability: 'Any',
          priority: 'optional' as const,
          category: 'transport' as const,
        },
        {
          id: `d${i + 1}-p4`,
          name: `Lunch at ${lunchSpot}`,
          description: `Popular local dining spot in ${setup.destination}`,
          whyRecommended: 'Great taste at reasonable prices — a local favorite',
          startTime: '13:00',
          endTime: '14:00',
          entryFee: 0,
          timeRequired: '1 hour',
          distanceFromPrevious: '1 km',
          crowdLevel: 'medium' as const,
          weatherSuitability: 'Any',
          priority: 'recommended' as const,
          category: 'food' as const,
        },
        {
          id: `d${i + 1}-p5`,
          name: culturalSpot,
          description: `Immerse yourself in the local culture of ${setup.destination}`,
          whyRecommended: 'Beautiful in afternoon light, fewer crowds after 3 PM',
          startTime: '15:00',
          endTime: '17:00',
          entryFee: Math.round(baseCosts.entryFee * 0.75 + i * 30 * dest.costMultiplier),
          timeRequired: '2 hours',
          distanceFromPrevious: `${4 + i} km`,
          crowdLevel: i % 2 === 0 ? 'low' as const : 'high' as const,
          weatherSuitability: 'Clear weather ideal',
          priority: i % 3 === 0 ? 'must-visit' as const : 'recommended' as const,
          category: 'activity' as const,
        },
        {
          id: `d${i + 1}-p6`,
          name: sunsetSpot,
          description: `Stunning sunset views in ${setup.destination}`,
          whyRecommended: 'The golden hour here is legendary',
          startTime: '18:00',
          endTime: '19:30',
          entryFee: 0,
          timeRequired: '1.5 hours',
          distanceFromPrevious: '2 km',
          crowdLevel: 'medium' as const,
          weatherSuitability: 'Clear skies for best sunset',
          priority: 'must-visit' as const,
          category: 'viewpoint' as const,
        },
        {
          id: `d${i + 1}-p7`,
          name: 'Dinner & Evening Leisure',
          description: 'Wind down with dinner and explore the evening scene',
          whyRecommended: `Experience ${setup.destination}'s nightlife`,
          startTime: '20:00',
          endTime: '22:00',
          entryFee: 0,
          timeRequired: '2 hours',
          distanceFromPrevious: '1.5 km',
          crowdLevel: 'medium' as const,
          weatherSuitability: 'Any',
          priority: 'recommended' as const,
          category: 'food' as const,
        },
      ],
      cost: {
        transport: Math.round(baseCosts.transport + i * 100 * dest.costMultiplier),
        entryFees: Math.round(baseCosts.entryFee * 1.75 + i * 80 * dest.costMultiplier),
        food: Math.round(baseCosts.food + i * 50 * dest.costMultiplier),
        activities: Math.round(baseCosts.activity + i * 60 * dest.costMultiplier),
        total: 0,
      },
    };
  });

  daysData.forEach(d => {
    d.cost.total = d.cost.transport + d.cost.entryFees + d.cost.food + d.cost.activities;
  });

  const totalDayCost = daysData.reduce((sum, d) => sum + d.cost.total, 0);
  const hotelCost = baseCosts.hotel * setup.days;
  const flightCost = baseCosts.flight;
  const fullTrip = totalDayCost + hotelCost + flightCost;

  return {
    setup,
    days: daysData,
    budget: {
      userBudget: setup.userBudget,
      minimumBudget: Math.round(fullTrip * 0.85),
      comfortableBudget: Math.round(fullTrip),
      idealBudget: Math.round(fullTrip * 1.2),
      currency: curr,
      homeCurrency: setup.homeCurrency,
      tips: [
        `Reduce hotel category to save ${curr}${Math.round(baseCosts.hotel * 0.3 * setup.days).toLocaleString()}`,
        `Skip optional activities on Day ${Math.min(3, setup.days)} to save ${curr}${Math.round(baseCosts.activity).toLocaleString()}`,
        'Book flights 3 weeks in advance to save up to 25%',
        `Use local transport in ${setup.destination} instead of taxis to save 40%`,
        'Eat at local spots instead of tourist restaurants to save on food',
      ],
      breakdown: [
        { category: 'Accommodation', userBudget: Math.round(setup.userBudget * 0.35), recommended: hotelCost },
        { category: 'Transport & Flights', userBudget: Math.round(setup.userBudget * 0.25), recommended: flightCost + Math.round(daysData.reduce((s, d) => s + d.cost.transport, 0)) },
        { category: 'Food & Dining', userBudget: Math.round(setup.userBudget * 0.2), recommended: Math.round(daysData.reduce((s, d) => s + d.cost.food, 0)) },
        { category: 'Activities & Entry', userBudget: Math.round(setup.userBudget * 0.15), recommended: Math.round(daysData.reduce((s, d) => s + d.cost.entryFees + d.cost.activities, 0)) },
        { category: 'Miscellaneous', userBudget: Math.round(setup.userBudget * 0.05), recommended: Math.round(fullTrip * 0.05) },
      ],
    },
    hotels: [
      {
        id: 'h1',
        name: `${setup.destination} Budget Stay`,
        pricePerNight: Math.round(baseCosts.hotel * 0.6),
        distanceToAttractions: '2 km',
        category: 'budget',
        safetyRating: 4,
        guestRating: 3.8,
        whyItFits: 'Affordable, clean, and close to public transport',
        tag: 'budget-saver',
      },
      {
        id: 'h2',
        name: `${setup.destination} Comfort Inn`,
        pricePerNight: baseCosts.hotel,
        distanceToAttractions: '1 km',
        category: 'comfort',
        safetyRating: 4.5,
        guestRating: 4.3,
        whyItFits: 'Great balance of price and comfort',
        tag: 'best-value',
      },
      {
        id: 'h3',
        name: `${setup.destination} Premium Hotel`,
        pricePerNight: Math.round(baseCosts.hotel * 1.5),
        distanceToAttractions: '0.5 km',
        category: 'premium',
        safetyRating: 5,
        guestRating: 4.7,
        whyItFits: 'Top-rated with excellent amenities',
        tag: 'comfort-pick',
      },
    ],
    flights: [
      {
        id: 'f1',
        airline: 'Budget Airways',
        departureTime: '06:00',
        arrivalTime: '10:00',
        duration: '4h',
        price: Math.round(baseCosts.flight * 0.7),
        from: setup.origin,
        to: setup.destination,
        tag: 'cheapest',
      },
      {
        id: 'f2',
        airline: 'National Airlines',
        departureTime: '10:00',
        arrivalTime: '14:00',
        duration: '4h',
        price: baseCosts.flight,
        from: setup.origin,
        to: setup.destination,
        tag: 'balanced',
      },
    ],
    returnFlights: [
      {
        id: 'rf1',
        airline: 'Budget Airways',
        departureTime: '18:00',
        arrivalTime: '22:00',
        duration: '4h',
        price: Math.round(baseCosts.flight * 0.7),
        from: setup.destination,
        to: setup.origin,
        tag: 'cheapest',
      },
      {
        id: 'rf2',
        airline: 'National Airlines',
        departureTime: '14:00',
        arrivalTime: '18:00',
        duration: '4h',
        price: baseCosts.flight,
        from: setup.destination,
        to: setup.origin,
        tag: 'balanced',
      },
    ],
  };
}
