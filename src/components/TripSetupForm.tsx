import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Compass, Gauge, ArrowRight, Plane, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TripSetup, TravelStyle, TravelPace, UserRegion, regionCurrencies } from '@/types/trip';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCurrencyForDestination } from '@/lib/currencies';

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
  homeRegion: UserRegion;
  onSubmit: (setup: TripSetup) => void;
  onBack: () => void;
}

export default function TripSetupForm({ homeRegion, onSubmit, onBack }: TripSetupFormProps) {
  const { t } = useLanguage();
  const homeCurrency = regionCurrencies[homeRegion];

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [startDate, setStartDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState<TravelStyle>('balanced');
  const [pace, setPace] = useState<TravelPace>('normal');

  const destCurrency = destination ? getCurrencyForDestination(destination) : homeCurrency;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !startDate) return;
    const setup: TripSetup = {
      origin, destination, days, startDate, travelers,
      userBudget: 0, // Will be set after budget selection
      currency: destCurrency.symbol,
      homeCurrency: homeCurrency.symbol,
      homeRegion,
      style, pace,
    };
    onSubmit(setup);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-ocean" />
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: 300 + i * 100,
              height: 300 + i * 100,
              background: `radial-gradient(circle, hsl(200 100% 55% / 0.2), transparent)`,
              left: `${20 + i * 25}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 4 + i * 2, repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Plane className="w-12 h-12 text-primary mx-auto mb-3" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-hero mb-2">
            Plan Your Journey
          </h1>
          <p className="text-muted-foreground">
            Currency: {homeCurrency.symbol} {homeCurrency.code} ({homeCurrency.name})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-6">
          {/* Origin & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Navigation className="w-4 h-4 text-accent" />
                From (Starting City)
              </Label>
              <Input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Hyderabad, Mumbai..."
                className="h-12 text-lg bg-secondary/50 border-border rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                {t('destination')}
              </Label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t('destinationPlaceholder')}
                className="h-12 text-lg bg-secondary/50 border-border rounded-xl"
                required
              />
            </div>
          </div>

          {destination && destCurrency.code !== homeCurrency.code && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-highlight rounded-xl p-3 text-center text-sm text-muted-foreground"
            >
              💱 Destination currency: <span className="text-primary font-semibold">{destCurrency.symbol} {destCurrency.code}</span>
              {' '}• Prices shown in both {destCurrency.code} & {homeCurrency.code}
            </motion.div>
          )}

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
                <Button type="button" variant="outline" size="icon" onClick={() => setDays(Math.min(90, days + 1))} className="h-12 w-12 rounded-xl">+</Button>
                <span className="text-muted-foreground">{t('days')}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                {t('startDate')}
              </Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 bg-secondary/50 border-border rounded-xl" required />
            </div>
          </div>

          {/* Travelers */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4 text-primary" />
              {t('travelers')}
            </Label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" onClick={() => setTravelers(Math.max(1, travelers - 1))} className="h-12 w-12 rounded-xl">-</Button>
              <span className="text-2xl font-display font-bold text-foreground w-16 text-center">{travelers}</span>
              <Button type="button" variant="outline" size="icon" onClick={() => setTravelers(Math.min(20, travelers + 1))} className="h-12 w-12 rounded-xl">+</Button>
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
                      ? 'border-primary bg-primary/10 shadow-glow'
                      : 'border-border bg-secondary/30 hover:border-primary/30'
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
                      ? 'border-primary bg-primary/10 shadow-glow'
                      : 'border-border bg-secondary/30 hover:border-primary/30'
                  }`}
                >
                  <span className="font-semibold text-sm text-foreground">{t(p.labelKey)}</span>
                  <span className="text-xs text-muted-foreground block mt-0.5">{t(p.descKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} className="rounded-xl h-14">
              Back
            </Button>
            <Button type="submit" size="lg" className="flex-1 h-14 text-lg bg-gradient-hero border-0 text-primary-foreground font-semibold gap-2 rounded-xl shadow-glow hover:shadow-elevated transition-all">
              <Plane className="w-5 h-5" />
              Check Budget Options
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
