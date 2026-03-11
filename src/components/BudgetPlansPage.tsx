import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TripSetup, BudgetPlanOption, regionCurrencies } from '@/types/trip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BackgroundCarousel from './BackgroundCarousel';

interface BudgetPlansPageProps {
  setup: TripSetup;
  onSelectBudget: (budget: number) => void;
  onBack: () => void;
}

const planIcons = ['🎒', '💼', '🧳', '✨', '👑'];
const planColors = [
  'border-muted-foreground/30', 'border-accent/40', 'border-primary/40',
  'border-primary/60', 'border-warning/60',
];
const planImageKeywords = [
  'backpacker hostel dorm',
  'economy travel suitcase',
  'comfortable resort pool',
  'premium suite view',
  'luxury villa ocean',
];

const getPlanBadge = (level: number) => {
  if (level === 1) return { label: '💰 Budget Pick', className: 'bg-accent/15 text-accent border-accent/30' };
  if (level === 2) return null;
  if (level === 3) return { label: '⭐ Recommended', className: 'bg-primary/15 text-primary border-primary/30' };
  if (level === 4) return { label: '💎 Premium Choice', className: 'bg-primary/15 text-primary border-primary/30' };
  if (level === 5) return { label: '👑 Luxury', className: 'bg-warning/20 text-warning border-warning/40' };
  return null;
};

export default function BudgetPlansPage({ setup, onSelectBudget, onBack }: BudgetPlansPageProps) {
  const [plans, setPlans] = useState<BudgetPlanOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const homeCurrency = regionCurrencies[setup.homeRegion];

  useEffect(() => {
    fetchBudgetPlans();
  }, []);

  const fetchBudgetPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-budget-plans', {
        body: {
          origin: setup.origin,
          destination: setup.destination,
          days: setup.days,
          travelers: setup.travelers,
          tripType: setup.tripType,
          pace: setup.pace,
          startDate: setup.startDate,
          destCurrency: setup.currencyCode,
          homeCurrency: setup.homeCurrency,
          homeCurrencyCode: setup.homeCurrencyCode,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        generateFallback();
        return;
      }

      const plansList = Array.isArray(data) ? data : (data.plans || []);
      setPlans(plansList);
      setLoaded(true);
    } catch (e) {
      console.error(e);
      toast.error('Using estimated budget plans...');
      generateFallback();
    }
    setLoading(false);
  };

  const generateFallback = () => {
    const perDayUSD = [25, 60, 120, 250, 500];
    const names = ['Backpacker', 'Economy', 'Comfort', 'Premium', 'Luxury'];
    const descriptions = [
      'Hostels, street food, public transport',
      'Clean hotels, local restaurants, mix transport',
      'Comfortable stays, good dining, private transport',
      '4-star hotels, fine dining, premium transport',
      '5-star luxury, gourmet dining, chauffeur service',
    ];
    const hotelTypes = ['Hostel', '2-star hotel', '3-star hotel', '4-star hotel', '5-star resort'];
    const foodTypes = ['Street food', 'Local restaurants', 'Good restaurants', 'Fine dining', 'Gourmet'];
    const transportTypes = ['Public', 'Mix', 'Private car', 'Premium car', 'Chauffeur'];

    const currencyMultiplier = setup.homeCurrencyCode === 'USD' ? 1
      : setup.homeCurrencyCode === 'EUR' ? 0.92
      : setup.homeCurrencyCode === 'GBP' ? 0.79
      : setup.homeCurrencyCode === 'JPY' ? 150
      : setup.homeCurrencyCode === 'KRW' ? 1300
      : 83;

    const mockPlans: BudgetPlanOption[] = perDayUSD.map((daily, i) => {
      const totalUSD = daily * setup.days * setup.travelers;
      const total = Math.round(totalUSD * currencyMultiplier);
      return {
        id: `plan-${i}`,
        name: names[i],
        level: i + 1,
        totalBudget: total,
        totalBudgetHome: total,
        description: descriptions[i],
        highlights: [],
        hotelType: hotelTypes[i],
        foodType: foodTypes[i],
        transportType: transportTypes[i],
      };
    });
    setPlans(mockPlans);
    setLoaded(true);
    setLoading(false);
  };

  const handleSelect = (plan: BudgetPlanOption) => {
    setSelectedPlan(plan.id);
    onSelectBudget(plan.totalBudgetHome);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen px-4 py-12">
      <BackgroundCarousel />

      <div className="relative z-10 max-w-3xl mx-auto pt-16">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Wallet className="w-12 h-12 text-primary mx-auto mb-3" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-hero mb-2">Choose Your Budget</h1>
          <p className="text-muted-foreground">
            {setup.origin} → {setup.destination} • {setup.days} days • {setup.travelers} traveler(s)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            All prices in {homeCurrency.code} ({homeCurrency.symbol})
            {setup.currency !== setup.homeCurrency && ` & ${setup.currency}`}
          </p>
        </motion.div>

        {loading && !loaded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Analyzing budget options...</p>
          </motion.div>
        )}

        {loaded && (
          <div className="space-y-4 mb-8">
            {plans.map((plan, i) => {
              const badge = getPlanBadge(plan.level);
              return (
                <motion.button
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleSelect(plan)}
                  className={`w-full glass rounded-2xl p-5 text-left transition-all duration-300 border-2 relative ${
                    selectedPlan === plan.id
                      ? 'border-primary shadow-glow bg-primary/5'
                      : `${planColors[i]} hover:border-primary/40 hover:shadow-card`
                  }`}
                >
                  {badge && (
                    <div className={`absolute -top-3 left-4 px-3 py-0.5 rounded-full text-xs font-bold border ${badge.className}`}>
                      {badge.label}
                    </div>
                  )}

                  <div className="flex gap-4 mt-1">
                    <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-border">
                      <img
                        src={`https://picsum.photos/seed/${encodeURIComponent(setup.destination + '-' + (planImageKeywords[i] || plan.name))}/200/200`}
                        alt={`${plan.name} in ${setup.destination}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{planIcons[i]}</span>
                            <h3 className="font-display font-bold text-foreground text-lg">{plan.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
                        </div>
                        {selectedPlan === plan.id && <Check className="w-6 h-6 text-primary shrink-0" />}
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-display font-bold text-foreground">
                          {setup.homeCurrency}{plan.totalBudgetHome.toLocaleString()}
                        </span>
                        {setup.currency !== setup.homeCurrency && (
                          <span className="text-sm text-muted-foreground">
                            ({setup.currency}{plan.totalBudget.toLocaleString()})
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="glass-highlight rounded-full px-2 py-1">🏨 {plan.hotelType}</span>
                        <span className="glass-highlight rounded-full px-2 py-1">🍽️ {plan.foodType}</span>
                        <span className="glass-highlight rounded-full px-2 py-1">🚗 {plan.transportType}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <Button variant="outline" onClick={onBack} className="rounded-xl gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Trip Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
