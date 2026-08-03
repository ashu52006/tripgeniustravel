import LiveMapScreen from '@/components/LiveMapScreen';
import type { TripPlan } from '@/types/trip';

const plan = {
  setup: { origin: 'Mumbai', destination: 'Goa', days: 1, travelers: 2, homeCurrency: '₹', currency: '₹' },
  days: [
    {
      day: 1,
      title: 'Beach day',
      places: [
        { name: 'Baga Beach', category: 'attraction' },
        { name: 'Fort Aguada', category: 'attraction' },
      ],
      cost: { total: 5000 },
    },
  ],
  budget: { currency: '₹' },
  hotels: [],
  flights: [],
} as unknown as TripPlan;

export default function MapTest() {
  return <LiveMapScreen plan={plan} userPlan="gold" onUpgrade={() => {}} />;
}
