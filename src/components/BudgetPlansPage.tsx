import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Sparkles, ArrowRight, ArrowLeft, Check, Crown, Gem, Star, Coins, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TripSetup, BudgetPlanOption, regionCurrencies } from '@/types/trip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export default function BudgetPlansPage({ setup, onSelectBudget, onBack }: BudgetPlansPageProps) {
  const [plans, setPlans] = useState<BudgetPlanOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customBudget, setCustomBudget] = useState('');

  const homeCurrency = regionCurrencies[setup.homeRegion];

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
          destCurrency: setup.currency,
          homeCurrency: setup.homeCurrency,
          homeCurrencyCode: homeCurrency.code,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }

      setPlans(data.plans || []);
      setLoaded(true);
    } catch (e) {
      console.error(e);
      toast.error('Could not fetch budget plans. Generating estimates...');
      // Fallback: generate mock plans
      const base = setup.days * setup.travelers * 50;
      const mockPlans: BudgetPlanOption[] = Array.from({ length: 10 }, (_, i) => {
        const multiplier = 0.5 + i * 0.35;
        const total = Math.round(base * multiplier);
        return {
          id: `plan-${i}`,
          name: ['Backpacker', 'Budget', 'Economy', 'Standard', 'Comfort', 'Premium', 'Deluxe', 'Luxury', 'Ultra Luxury', 'Royal'][i],
          level: i + 1,
          totalBudget: total,
          totalBudgetHome: total,
          description: ['Minimal spending, hostels', 'Budget hotels, local food', 'Clean stays, street food', 'Mid-range all around', 'Comfortable with extras', 'Nice hotels, good food', '4-star experience', 'Luxury hotels, fine dining', 'Top tier everything', 'No expense spared'][i],
          highlights: ['Basic', 'Value', 'Smart savings', 'Well-rounded', 'Comfortable', 'Treat yourself', 'Premium quality', 'High end', 'Ultra premium', 'Best of best'].slice(i, i + 2),
          hotelType: ['Hostel', 'Budget hotel', '2-star', '3-star', '3-star+', '4-star', '4-star+', '5-star', '5-star deluxe', 'Palace/Resort'][i],
          foodType: ['Street food', 'Local joints', 'Mix', 'Good restaurants', 'Nice restaurants', 'Fine dining mix', 'Fine dining', 'Gourmet', 'Michelin-level', 'Private chef'][i],
          transportType: ['Public', 'Public+auto', 'Mix', 'Taxi/auto', 'Taxi', 'Private car', 'Private car+', 'Luxury car', 'Chauffeur', 'Private jet lol'][i],
        };
      });
      setPlans(mockPlans);
      setLoaded(true);
    }
    setLoading(false);
  };

  const handleSelect = (plan: BudgetPlanOption) => {
    setSelectedPlan(plan.id);
    onSelectBudget(plan.totalBudgetHome);
  };

  const handleCustomBudget = () => {
    if (!customBudget || isNaN(Number(customBudget))) return;
    onSelectBudget(Number(customBudget));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-12"
    >
      <div className="fixed inset-0 pointer-events-none bg-gradient-ocean" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Wallet className="w-12 h-12 text-primary mx-auto mb-3" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-hero mb-2">
            Choose Your Budget
          </h1>
          <p className="text-muted-foreground">
            {setup.origin} → {setup.destination} • {setup.days} days • {setup.travelers} traveler(s)
          </p>
        </motion.div>

        {!loaded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Button
              onClick={fetchBudgetPlans}
              disabled={loading}
              size="lg"
              className="h-16 px-12 text-lg bg-gradient-hero border-0 text-primary-foreground font-bold gap-3 rounded-2xl shadow-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing budgets...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate 10 Budget Plans
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </Button>

            {loading && (
              <div className="mt-8 flex justify-center gap-3">
                {['🏨', '✈️', '🍽️', '🎫', '🚕'].map((emoji, i) => (
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
            )}
          </motion.div>
        )}

        {loaded && (
          <>
            {/* Budget Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {plans.map((plan, i) => (
                <motion.button
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSelect(plan)}
                  className={`glass rounded-2xl p-5 text-left transition-all duration-300 border-2 ${
                    selectedPlan === plan.id
                      ? 'border-primary shadow-glow bg-primary/5'
                      : `${planColors[i]} hover:border-primary/40 hover:shadow-card`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{planIcons[i]}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-foreground">{plan.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            Level {plan.level}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
                      </div>
                    </div>
                    {selectedPlan === plan.id && (
                      <Check className="w-6 h-6 text-primary shrink-0" />
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
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
                </motion.button>
              ))}
            </div>

            {/* Custom Budget */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-6 mb-8"
            >
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Or Enter Your Own Budget
              </h3>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    {setup.homeCurrency}
                  </span>
                  <Input
                    type="number"
                    value={customBudget}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    placeholder="Enter amount..."
                    className="h-12 pl-10 bg-secondary/50 border-border rounded-xl text-lg"
                  />
                </div>
                <Button
                  onClick={handleCustomBudget}
                  disabled={!customBudget}
                  className="h-12 px-6 bg-gradient-hero border-0 text-primary-foreground rounded-xl gap-2"
                >
                  Use This Budget
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </>
        )}

        <div className="flex justify-center">
          <Button variant="outline" onClick={onBack} className="rounded-xl gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Trip Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
