import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DayItinerary from '@/components/DayItinerary';
import TripDashboard from '@/components/TripDashboard';
import BudgetIntelligence from '@/components/BudgetIntelligence';
import { TripPlan } from '@/types/trip';
import { supabase } from '@/integrations/supabase/client';

export default function SharedTrip() {
  const { shareId } = useParams<{ shareId: string }>();
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'itinerary' | 'budget'>('dashboard');

  useEffect(() => {
    const load = async () => {
      if (!shareId) return;
      const { data, error: err } = await supabase
        .rpc('get_shared_trip', { _share_id: shareId });

      const row = Array.isArray(data) ? data[0] : data;
      if (err || !row) {
        setError('Trip not found or link expired.');
      } else {
        setPlan(row.trip_data as unknown as TripPlan);
      }
      setLoading(false);
    };
    load();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-xl text-muted-foreground">{error || 'Trip not found'}</p>
        <Link to="/">
          <Button className="gap-2"><ArrowLeft className="w-4 h-4" /> Go Home</Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Overview' },
    { id: 'itinerary' as const, label: 'Itinerary' },
    { id: 'budget' as const, label: 'Budget' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-gradient-hero">
              {plan.setup.destination}
            </h1>
            <p className="text-xs text-muted-foreground">
              {plan.setup.origin} → {plan.setup.destination} · {plan.days.length} days · Shared Trip
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-1 rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Plan Your Own
            </Button>
          </Link>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 pt-28">
        {activeTab === 'dashboard' && <TripDashboard plan={plan} />}
        {activeTab === 'itinerary' && (
          <div className="space-y-4">
            {plan.days.map((day) => (
              <DayItinerary
                key={day.day}
                dayPlan={day}
                currency={plan.budget.currency}
                homeCurrency={plan.setup.homeCurrency}
              />
            ))}
          </div>
        )}
        {activeTab === 'budget' && <BudgetIntelligence budget={plan.budget} />}
      </main>
    </div>
  );
}
