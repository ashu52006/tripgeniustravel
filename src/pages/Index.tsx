import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LayoutDashboard, CalendarDays, Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TripSetupForm from '@/components/TripSetupForm';
import DayItinerary from '@/components/DayItinerary';
import BudgetIntelligence from '@/components/BudgetIntelligence';
import TripDashboard from '@/components/TripDashboard';
import HeroCarousel from '@/components/HeroCarousel';
import AuthButton from '@/components/AuthButton';
import LanguageSelector from '@/components/LanguageSelector';
import { TripSetup, TripPlan } from '@/types/trip';
import { generateMockTripPlan } from '@/data/mockTripData';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

type View = 'setup' | 'plan' | 'loading';
type Tab = 'dashboard' | 'itinerary' | 'budget';

const Index = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<View>('setup');
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const handleAIPlan = async (setup: TripSetup) => {
    setView('loading');
    try {
      const { data, error } = await supabase.functions.invoke('generate-trip', {
        body: {
          destination: setup.destination,
          days: setup.days,
          travelers: setup.travelers,
          userBudget: setup.userBudget,
          currency: setup.currency,
          style: setup.style,
          pace: setup.pace,
          startDate: setup.startDate,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        setView('setup');
        return;
      }

      const tripPlan: TripPlan = {
        setup,
        days: data.days || [],
        budget: data.budget || {
          userBudget: setup.userBudget,
          minimumBudget: setup.userBudget * 0.8,
          comfortableBudget: setup.userBudget,
          idealBudget: setup.userBudget * 1.3,
          currency: setup.currency,
          tips: [],
          breakdown: [],
        },
        hotels: data.hotels || [],
        flights: data.flights || [],
      };

      setPlan(tripPlan);
      setView('plan');
      toast.success('Your AI trip plan is ready!');
    } catch (e: any) {
      console.error('AI plan error:', e);
      toast.error('AI planning failed. Using smart fallback...');
      // Fallback to mock data
      const fallback = generateMockTripPlan(setup);
      setPlan(fallback);
      setView('plan');
    }
  };

  const handleMockPlan = (setup: TripSetup) => {
    const tripPlan = generateMockTripPlan(setup);
    setPlan(tripPlan);
    setView('plan');
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'itinerary', label: t('itinerary'), icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'budget', label: t('budget'), icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view === 'plan' && (
              <Button variant="ghost" size="icon" onClick={() => setView('setup')} className="text-muted-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">
                {view === 'setup' || view === 'loading' ? t('appName') : plan?.setup.destination}
              </h1>
              {view === 'plan' && plan && (
                <p className="text-xs text-muted-foreground">
                  {plan.days.length} {t('days')} · {plan.setup.travelers} {t('travelers')} · {t(plan.setup.style)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <AuthButton />
          </div>
        </div>

        {/* Tabs */}
        {view === 'plan' && (
          <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-card'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HeroCarousel />

              <div className="text-center mb-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-hero mb-3">
                    {t('heroTitle')}
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                    {t('heroSubtitle')}
                  </p>
                </motion.div>
              </div>

              <TripSetupForm onSubmit={handleMockPlan} onAIPlan={handleAIPlan} />
            </motion.div>
          )}

          {view === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-16 h-16 text-primary" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  {t('loading')}
                </h2>
                <p className="text-muted-foreground">Analyzing destinations, prices & creating your personalized itinerary...</p>
              </div>
              <div className="flex gap-2 mt-4">
                {['✈️', '🏨', '🗺️', '🍽️', '💰'].map((emoji, i) => (
                  <motion.span
                    key={i}
                    className="text-3xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.3 }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'plan' && plan && (
            <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {activeTab === 'dashboard' && <TripDashboard plan={plan} />}
              {activeTab === 'itinerary' && (
                <div className="space-y-4">
                  {plan.days.map((day) => (
                    <DayItinerary key={day.day} dayPlan={day} currency={plan.budget.currency} />
                  ))}
                </div>
              )}
              {activeTab === 'budget' && <BudgetIntelligence budget={plan.budget} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
