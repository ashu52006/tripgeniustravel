import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LayoutDashboard, CalendarDays, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TripSetupForm from '@/components/TripSetupForm';
import DayItinerary from '@/components/DayItinerary';
import BudgetIntelligence from '@/components/BudgetIntelligence';
import TripDashboard from '@/components/TripDashboard';
import { TripSetup, TripPlan } from '@/types/trip';
import { generateMockTripPlan } from '@/data/mockTripData';

type View = 'setup' | 'plan';
type Tab = 'dashboard' | 'itinerary' | 'budget';

const Index = () => {
  const [view, setView] = useState<View>('setup');
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const handleSetup = (setup: TripSetup) => {
    const tripPlan = generateMockTripPlan(setup);
    setPlan(tripPlan);
    setView('plan');
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'itinerary', label: 'Itinerary', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view === 'plan' && (
              <Button variant="ghost" size="icon" onClick={() => setView('setup')} className="text-muted-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">
                {view === 'setup' ? 'TripGenius' : plan?.setup.destination}
              </h1>
              {view === 'plan' && plan && (
                <p className="text-xs text-muted-foreground">
                  {plan.days.length} days · {plan.setup.travelers} travelers · {plan.setup.style}
                </p>
              )}
            </div>
          </div>
          <span className="text-2xl">🧭</span>
        </div>

        {/* Tabs */}
        {view === 'plan' && (
          <div className="max-w-4xl mx-auto px-4 flex gap-1 pb-2">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-6xl mb-4 block">✈️</span>
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-hero mb-3">
                    Plan Smarter, Travel Better
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                    AI-powered day-by-day itinerary with honest budget analysis. 
                    We tell you what you <em>actually</em> need — not just what you want to hear.
                  </p>
                </motion.div>
              </div>

              <TripSetupForm onSubmit={handleSetup} />
            </motion.div>
          )}

          {view === 'plan' && plan && (
            <motion.div
              key="plan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
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
