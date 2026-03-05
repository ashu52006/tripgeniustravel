import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Wallet, Compass, Gauge, ArrowRight, Plane, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TripSetup, TravelStyle, TravelPace } from '@/types/trip';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCurrencyForDestination } from '@/lib/currencies';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const styles: { value: TravelStyle; labelKey: string; icon: string }[] = [
  { value: 'budget', labelKey: 'budget_label', icon: '💰' },
  { value: 'balanced', labelKey: 'balanced', icon: '⚖️' },
  { value: 'luxury', labelKey: 'luxury', icon: '✨' },
  { value: 'adventure', labelKey: 'adventure', icon: '🏔️' },
  { value: 'cultural', labelKey: 'cultural', icon: '🏛️' },
];

const paces: { value: TravelPace; labelKey: string; descKey: string }[] = [
  { value: 'relaxed', labelKey: 'relaxed', descKey: 'relaxedDesc' },
  { value: 'normal', labelKey: 'normal', descKey: 'normalDesc' },
  { value: 'fast', labelKey: 'fast', descKey: 'fastDesc' },
];

interface TripSetupFormProps {
  onSubmit: (setup: TripSetup) => void;
  onAIPlan: (setup: TripSetup) => void;
}

export default function TripSetupForm({ onSubmit, onAIPlan }: TripSetupFormProps) {
  const { t } = useLanguage();
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [startDate, setStartDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [userBudget, setUserBudget] = useState('');
  const [style, setStyle] = useState<TravelStyle>('balanced');
  const [pace, setPace] = useState<TravelPace>('normal');
  const [checkingBudget, setCheckingBudget] = useState(false);
  const [suggestedBudget, setSuggestedBudget] = useState<number | null>(null);

  const currency = destination ? getCurrencyForDestination(destination) : { code: 'USD', symbol: '$' };

  const handleCheckBudget = async () => {
    if (!destination) {
      toast.error('Please enter a destination first');
      return;
    }
    setCheckingBudget(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-trip', {
        body: {
          destination, days, travelers,
          userBudget: 999999,
          currency: currency.symbol,
          style, pace,
          startDate: startDate || new Date().toISOString().split('T')[0],
        },
      });
      if (error) throw error;
      if (data?.budget?.comfortableBudget) {
        setSuggestedBudget(data.budget.comfortableBudget);
        toast.success(`${t('estimatedBudget')}: ${currency.symbol}${data.budget.comfortableBudget.toLocaleString()}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not estimate budget. Try again.');
    }
    setCheckingBudget(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !userBudget) return;
    const setup: TripSetup = {
      destination, days, startDate, travelers,
      userBudget: Number(userBudget),
      currency: currency.symbol,
      style, pace,
    };
    onAIPlan(setup);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            {t('destination')}
          </Label>
          <Input
            value={destination}
            onChange={(e) => { setDestination(e.target.value); setSuggestedBudget(null); }}
            placeholder={t('destinationPlaceholder')}
            className="h-12 text-lg bg-card border-border rounded-xl"
            required
          />
        </div>

        {/* Days & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              {t('tripDuration')}
            </Label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" onClick={() => setDays(Math.max(1, days - 1))} className="h-12 w-12 rounded-xl">-</Button>
              <span className="text-2xl font-display font-bold text-foreground w-16 text-center">{days}</span>
              <Button type="button" variant="outline" size="icon" onClick={() => setDays(Math.min(14, days + 1))} className="h-12 w-12 rounded-xl">+</Button>
              <span className="text-muted-foreground">{t('days')}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              {t('startDate')}
            </Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 bg-card border-border rounded-xl" required />
          </div>
        </div>

        {/* Travelers & Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4 text-primary" />
              {t('travelers')}
            </Label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" onClick={() => setTravelers(Math.max(1, travelers - 1))} className="h-12 w-12 rounded-xl">-</Button>
              <span className="text-2xl font-display font-bold text-foreground w-16 text-center">{travelers}</span>
              <Button type="button" variant="outline" size="icon" onClick={() => setTravelers(Math.min(10, travelers + 1))} className="h-12 w-12 rounded-xl">+</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Wallet className="w-4 h-4 text-primary" />
              {t('yourBudget')} ({currency.symbol})
            </Label>
            <div className="space-y-2">
              <Input
                type="number"
                value={userBudget}
                onChange={(e) => setUserBudget(e.target.value)}
                placeholder={suggestedBudget ? `${t('estimatedBudget')}: ${currency.symbol}${suggestedBudget.toLocaleString()}` : 'e.g. 15000'}
                className="h-12 text-lg bg-card border-border rounded-xl"
                required
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCheckBudget}
                  disabled={checkingBudget || !destination}
                  className="text-xs gap-1.5 rounded-full"
                >
                  <Sparkles className="w-3 h-3" />
                  {checkingBudget ? '...' : t('checkBudget')}
                </Button>
                {suggestedBudget && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setUserBudget(String(suggestedBudget))}
                    className="text-xs rounded-full"
                  >
                    {t('useThisBudget')}: {currency.symbol}{suggestedBudget.toLocaleString()}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t('budgetHelper')}</p>
            </div>
          </div>
        </div>

        {/* Travel Style */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Compass className="w-4 h-4 text-primary" />
            {t('travelStyle')}
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {styles.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStyle(s.value)}
                className={`p-3 rounded-xl text-center transition-all border-2 ${
                  style === s.value
                    ? 'border-primary bg-primary/10 shadow-card'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <span className="text-2xl block mb-1">{s.icon}</span>
                <span className="text-xs font-medium text-foreground">{t(s.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pace */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Gauge className="w-4 h-4 text-primary" />
            {t('travelPace')}
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {paces.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPace(p.value)}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  pace === p.value
                    ? 'border-primary bg-primary/10 shadow-card'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <span className="font-semibold text-sm text-foreground">{t(p.labelKey)}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">{t(p.descKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full h-14 text-lg bg-gradient-hero border-0 text-primary-foreground font-semibold gap-2 rounded-xl">
          <Plane className="w-5 h-5" />
          {t('planMyTrip')}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </form>
    </motion.div>
  );
}
