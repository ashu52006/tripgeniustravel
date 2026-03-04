import { TripPlan, TripSetup } from '@/types/trip';

export function generateMockTripPlan(setup: TripSetup): TripPlan {
  const isIndia = setup.destination.toLowerCase().includes('goa') || 
                  setup.destination.toLowerCase().includes('india') ||
                  setup.destination.toLowerCase().includes('jaipur') ||
                  setup.destination.toLowerCase().includes('manali') ||
                  setup.destination.toLowerCase().includes('delhi');
  
  const curr = setup.currency || '₹';
  const multiplier = isIndia ? 1 : 60;

  const daysData = Array.from({ length: setup.days }, (_, i) => {
    const date = new Date(setup.startDate);
    date.setDate(date.getDate() + i);
    const dayTitles = [
      'Arrival & First Impressions',
      'Cultural Deep Dive',
      'Nature & Adventure',
      'Local Hidden Gems',
      'Relaxation & Shopping',
      'Farewell Exploration',
    ];
    
    return {
      day: i + 1,
      date: date.toISOString().split('T')[0],
      title: dayTitles[i % dayTitles.length],
      places: [
        {
          id: `d${i + 1}-p1`,
          name: i === 0 ? 'Hotel Check-in & Breakfast' : 'Morning Breakfast',
          description: 'Start your day with authentic local breakfast',
          whyRecommended: 'Highly rated local café with authentic flavors and great ambiance',
          startTime: '08:00',
          endTime: '09:00',
          entryFee: 0,
          timeRequired: '1 hour',
          distanceFromPrevious: i === 0 ? 'From airport' : '0.5 km',
          crowdLevel: 'low' as const,
          weatherSuitability: 'Any weather',
          priority: 'recommended' as const,
          category: 'food' as const,
        },
        {
          id: `d${i + 1}-p2`,
          name: ['Fort Aguada', 'Amber Fort', 'Solang Valley', 'Humayun\'s Tomb', 'Basilica of Bom Jesus', 'Calangute Beach'][i % 6],
          description: 'One of the most iconic landmarks in the region',
          whyRecommended: 'Best visited in the morning when crowds are minimal and light is perfect for photos',
          startTime: '09:30',
          endTime: '11:30',
          entryFee: Math.round((200 + i * 50) * (isIndia ? 1 : 0.5)),
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
          name: ['Fisherman\'s Wharf', 'Chokhi Dhani', 'Mountain Café', 'Karim\'s', 'Britto\'s', 'Gunpowder'][i % 6],
          description: 'Authentic local cuisine at great prices',
          whyRecommended: 'Ranked in top local food spots — excellent taste at reasonable prices',
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
          name: ['Chapora Fort', 'Hawa Mahal', 'Rohtang Pass', 'Qutub Minar', 'Se Cathedral', 'Anjuna Flea Market'][i % 6],
          description: 'Afternoon cultural or scenic experience',
          whyRecommended: 'Beautiful in afternoon light, fewer crowds after 3 PM',
          startTime: '15:00',
          endTime: '17:00',
          entryFee: Math.round((150 + i * 30) * (isIndia ? 1 : 0.5)),
          timeRequired: '2 hours',
          distanceFromPrevious: `${4 + i} km`,
          crowdLevel: i % 2 === 0 ? 'low' as const : 'high' as const,
          weatherSuitability: 'Clear weather ideal',
          priority: i % 3 === 0 ? 'must-visit' as const : 'recommended' as const,
          category: 'activity' as const,
        },
        {
          id: `d${i + 1}-p6`,
          name: ['Vagator Sunset Point', 'Nahargarh Fort Sunset', 'Mountain Sunset View', 'India Gate at Dusk', 'Dona Paula Viewpoint', 'Baga Beach Sunset'][i % 6],
          description: 'Stunning sunset views over the landscape',
          whyRecommended: 'The golden hour here is legendary — arrive 30 min early for best spots',
          startTime: '18:00',
          endTime: '19:30',
          entryFee: 0,
          timeRequired: '1.5 hours',
          distanceFromPrevious: `${2} km`,
          crowdLevel: 'medium' as const,
          weatherSuitability: 'Clear skies for best sunset',
          priority: 'must-visit' as const,
          category: 'viewpoint' as const,
        },
        {
          id: `d${i + 1}-p7`,
          name: 'Dinner & Evening Leisure',
          description: 'Wind down with dinner and local evening culture',
          whyRecommended: 'Experience the nightlife and local dinner scene',
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
        transport: Math.round((450 + i * 100) * (isIndia ? 1 : multiplier / 60)),
        entryFees: Math.round((350 + i * 80) * (isIndia ? 1 : multiplier / 60)),
        food: Math.round((800 + i * 50) * (isIndia ? 1 : multiplier / 60)),
        activities: Math.round((300 + i * 60) * (isIndia ? 1 : multiplier / 60)),
        total: 0,
      },
    };
  });

  daysData.forEach(d => {
    d.cost.total = d.cost.transport + d.cost.entryFees + d.cost.food + d.cost.activities;
  });

  const totalRecommended = daysData.reduce((sum, d) => sum + d.cost.total, 0);
  const hotelCost = Math.round(totalRecommended * 0.6);
  const flightCost = Math.round(totalRecommended * 0.4);
  const fullTrip = totalRecommended + hotelCost + flightCost;

  return {
    setup,
    days: daysData,
    budget: {
      userBudget: setup.userBudget,
      minimumBudget: Math.round(fullTrip * 0.85),
      comfortableBudget: Math.round(fullTrip),
      idealBudget: Math.round(fullTrip * 1.2),
      currency: curr,
      tips: [
        `Reduce hotel category to stay within ${curr}${Math.round(fullTrip * 0.9).toLocaleString()}`,
        `Skip Day ${Math.min(3, setup.days)} optional activities to save ${curr}${Math.round(300 * (isIndia ? 1 : multiplier / 60)).toLocaleString()}`,
        'Book flights 3 weeks in advance to save up to 25%',
        'Use local transport instead of taxis to save 40% on travel',
        'Eat at local dhabas/cafés instead of tourist restaurants',
      ],
      breakdown: [
        { category: 'Accommodation', userBudget: Math.round(setup.userBudget * 0.35), recommended: hotelCost },
        { category: 'Transport & Flights', userBudget: Math.round(setup.userBudget * 0.25), recommended: flightCost },
        { category: 'Food & Dining', userBudget: Math.round(setup.userBudget * 0.2), recommended: Math.round(daysData.reduce((s, d) => s + d.cost.food, 0)) },
        { category: 'Activities & Entry', userBudget: Math.round(setup.userBudget * 0.15), recommended: Math.round(daysData.reduce((s, d) => s + d.cost.entryFees + d.cost.activities, 0)) },
        { category: 'Miscellaneous', userBudget: Math.round(setup.userBudget * 0.05), recommended: Math.round(fullTrip * 0.05) },
      ],
    },
    hotels: [
      { id: 'h1', name: 'Seaside Budget Inn', pricePerNight: Math.round(1200 * (isIndia ? 1 : multiplier / 60)), distanceToAttractions: '1.2 km', category: 'budget', safetyRating: 4.0, guestRating: 3.8, whyItFits: 'Closest budget option to Day 1 attractions', tag: 'budget-saver' },
      { id: 'h2', name: 'Heritage Comfort Hotel', pricePerNight: Math.round(2800 * (isIndia ? 1 : multiplier / 60)), distanceToAttractions: '0.8 km', category: 'comfort', safetyRating: 4.5, guestRating: 4.3, whyItFits: 'Best value for comfort — walking distance to key spots', tag: 'best-value' },
      { id: 'h3', name: 'Grand Palace Resort', pricePerNight: Math.round(5500 * (isIndia ? 1 : multiplier / 60)), distanceToAttractions: '2.0 km', category: 'premium', safetyRating: 4.8, guestRating: 4.7, whyItFits: 'Premium amenities with pool and spa for ultimate relaxation', tag: 'comfort-pick' },
    ],
    flights: [
      { id: 'f1', airline: 'IndiGo', departureTime: '06:00', arrivalTime: '08:30', duration: '2h 30m', price: Math.round(4200 * (isIndia ? 1 : multiplier / 60)), tag: 'cheapest' },
      { id: 'f2', airline: 'Air India', departureTime: '10:00', arrivalTime: '12:15', duration: '2h 15m', price: Math.round(5800 * (isIndia ? 1 : multiplier / 60)), tag: 'balanced' },
      { id: 'f3', airline: 'Vistara', departureTime: '14:00', arrivalTime: '15:45', duration: '1h 45m', price: Math.round(7200 * (isIndia ? 1 : multiplier / 60)), tag: 'fastest' },
    ],
  };
}
