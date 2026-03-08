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

const planIcons = ['🎒', '💼', '🧳', '✈️', '🌟', '💎', '👑', '🏆', '🎯', '🌈'];
const planColors = [
  'border-muted-foreground/30', 'border-muted-foreground/50', 'border-accent/40',
  'border-accent/60', 'border-primary/40', 'border-primary/60', 'border-primary/80',
  'border-warning/50', 'border-warning/70', 'border-success/60',
];

// Unique curated image keywords per tier to avoid repeating images
const planImageKeywords = [
  'backpacker hostel dorm',
  'budget hotel room',
  'economy travel suitcase',
  'city hotel lobby',
  'comfortable resort pool',
  'premium suite view',
  'deluxe spa luxury',
  'luxury villa ocean',
  'ultra luxury penthouse',
  'royal palace suite',
];

const getPlanBadge = (level: number, totalPlans: number) => {
  if (level <= 2) return { label: '⚠️ Not Recommended', className: 'bg-destructive/15 text-destructive border-destructive/30' };
  if (level === 3) return { label: '💰 Budget Pick', className: 'bg-accent/15 text-accent border-accent/30' };
  if (level === 4 || level === 5) return { label: '⭐ Recommended', className: 'bg-primary/15 text-primary border-primary/30' };
  if (level === 6) return { label: '🏆 Best for Your Trip', className: 'bg-warning/20 text-warning border-warning/40' };
  if (level === 7) return { label: '💎 Premium Choice', className: 'bg-primary/15 text-primary border-primary/30' };
  if (level >= 8) return { label: '👑 Splurge', className: 'bg-muted text-muted-foreground border-border' };
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
          style: setup.style,
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
    // Realistic per-person per-day costs in USD, then multiply by days & travelers
    const perDayUSD = [15, 30, 50, 75, 100, 150, 200, 350, 500, 800];
    const mockPlans: BudgetPlanOption[] = perDayUSD.map((daily, i) => {
      const totalUSD = daily * setup.days * setup.travelers;
      // Rough conversion: use a multiplier based on home currency (default ~80 for INR-like)
      const currencyMultiplier = setup.homeCurrencyCode === 'USD' ? 1
        : setup.homeCurrencyCode === 'EUR' ? 0.92
        : setup.homeCurrencyCode === 'GBP' ? 0.79
        : setup.homeCurrencyCode === 'JPY' ? 150
        : setup.homeCurrencyCode === 'KRW' ? 1300
        : 83; // default INR
      const total = Math.round(totalUSD * currencyMultiplier);
      return {
        id: `plan-${i}`,
        name: ['Backpacker', 'Budget', 'Economy', 'Standard', 'Comfort', 'Premium', 'Deluxe', 'Luxury', 'Ultra Luxury', 'Royal'][i],
        level: i + 1,
        totalBudget: total,
        totalBudgetHome: total,
        description: ['Minimal spending, hostels', 'Budget hotels, local food', 'Clean stays, street food', 'Mid-range all around', 'Comfortable with extras', 'Nice hotels, good food', '4-star experience', 'Luxury hotels, fine dining', 'Top tier everything', 'No expense spared'][i],
        highlights: [],
        hotelType: ['Hostel', 'Budget hotel', '2-star', '3-star', '3-star+', '4-star', '4-star+', '5-star', '5-star deluxe', 'Palace'][i],
        foodType: ['Street food', 'Local joints', 'Mix', 'Good restaurants', 'Nice restaurants', 'Fine dining mix', 'Fine dining', 'Gourmet', 'Michelin-level', 'Private chef'][i],
        transportType: ['Public', 'Public+auto', 'Mix', 'Taxi/auto', 'Taxi', 'Private car', 'Private car+', 'Luxury car', 'Chauffeur', 'Limo'][i],
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

      <div className="relative z-10 max-w-5xl mx-auto pt-16">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {plans.map((plan, i) => (
              (() => {
                const badge = getPlanBadge(plan.level, plans.length);
                const isBestPlan = plan.level === 6;
                return (
                  <motion.button
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSelect(plan)}
                    className={`glass rounded-2xl p-5 text-left transition-all duration-300 border-2 relative ${
                      selectedPlan === plan.id
                        ? 'border-primary shadow-glow bg-primary/5'
                        : isBestPlan
                        ? 'border-warning shadow-glow'
                        : `${planColors[i]} hover:border-primary/40 hover:shadow-card`
                    }`}
                  >
                    {/* Recommendation Badge */}
                    {badge && (
                      <div className={`absolute -top-3 left-4 px-3 py-0.5 rounded-full text-xs font-bold border ${badge.className}`}>
                        {badge.label}
                      </div>
                    )}

                    <div className="flex gap-4 mt-1">
                      {/* Plan Image - unique per tier */}
                      <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-border">
                        <img
                          src={`https://picsum.photos/seed/${encodeURIComponent(setup.destination + '-' + (planImageKeywords[i] || plan.name))}/200/200`}
                          alt={`${plan.name} in ${setup.destination}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{planIcons[i]}</span>
                              <h3 className="font-display font-bold text-foreground">{plan.name}</h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                Level {plan.level}
                              </span>
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
              })()
            ))}
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
