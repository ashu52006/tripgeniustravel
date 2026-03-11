import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Gauge, ArrowRight, Plane, Navigation, Search, User, Baby } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TripSetup, TripType, TravelPace, UserRegion, regionCurrencies } from '@/types/trip';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCurrencyForDestination } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { DateRange } from 'react-day-picker';

interface CitySuggestion {
  city: string;
  country: string;
  type: string;
}

const tripTypes: { value: TripType; label: string; icon: string }[] = [
  { value: 'solo', label: 'Solo', icon: '🧑' },
  { value: 'couple', label: 'Couple', icon: '💑' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { value: 'group', label: 'Group', icon: '👥' },
  { value: 'business', label: 'Business', icon: '💼' },
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

function useCitySuggestions() {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.length < 2) { setSuggestions([]); return; }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const { data } = await supabase.functions.invoke('suggest-cities', { body: { query } });
        setSuggestions(data?.suggestions || []);
      } catch {
        setSuggestions([]);
      }
      setLoading(false);
    }, 300);
  }, []);

  const clear = useCallback(() => setSuggestions([]), []);

  return { suggestions, loading, search, clear };
}

export default function TripSetupForm({ homeRegion, onSubmit, onBack }: TripSetupFormProps) {
  const { t } = useLanguage();
  const homeCurrency = regionCurrencies[homeRegion];

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [maleCount, setMaleCount] = useState(1);
  const [femaleCount, setFemaleCount] = useState(0);
  const [kidsCount, setKidsCount] = useState(0);
  const [tripType, setTripType] = useState<TripType>('solo');
  const [pace, setPace] = useState<TravelPace>('normal');

  const [originFocused, setOriginFocused] = useState(false);
  const [destFocused, setDestFocused] = useState(false);

  const originSuggestions = useCitySuggestions();
  const destSuggestions = useCitySuggestions();

  const totalTravelers = maleCount + femaleCount + kidsCount;
  const destCurrency = destination ? getCurrencyForDestination(destination) : homeCurrency;
  const startDate = dateRange?.from;
  const endDate = dateRange?.to;
  const days = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !startDate || !endDate || days < 1 || totalTravelers < 1) return;
    const setup: TripSetup = {
      origin, destination, days,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      travelers: totalTravelers,
      travelerBreakdown: { male: maleCount, female: femaleCount, kids: kidsCount },
      userBudget: 0,
      currency: destCurrency.symbol,
      currencyCode: destCurrency.code,
      homeCurrency: homeCurrency.symbol,
      homeCurrencyCode: homeCurrency.code,
      homeRegion,
      tripType, pace,
    };
    onSubmit(setup);
  };

  const typeIcons: Record<string, string> = { city: '🏙️', town: '🏘️', village: '🏡', region: '🗺️' };

  const renderCityInput = (
    label: string,
    icon: React.ReactNode,
    value: string,
    setValue: (v: string) => void,
    hook: ReturnType<typeof useCitySuggestions>,
    focused: boolean,
    setFocused: (v: boolean) => void,
    placeholder: string,
  ) => (
    <div className="space-y-2 relative">
      <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
        {icon}
        {label}
      </Label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => { setValue(e.target.value); hook.search(e.target.value); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder}
          className="h-12 text-lg bg-secondary/50 border-border rounded-xl pr-10"
          required
        />
        {hook.loading && <Search className="absolute right-3 top-3.5 w-5 h-5 text-muted-foreground animate-pulse" />}
      </div>
      <AnimatePresence>
        {focused && hook.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-xl shadow-elevated overflow-hidden"
          >
            {hook.suggestions.map((s, i) => (
              <button
                key={`${s.city}-${s.country}-${i}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setValue(`${s.city}, ${s.country}`);
                  hook.clear();
                  setFocused(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-secondary/60 flex items-center gap-3 transition-colors"
              >
                <span className="text-lg">{typeIcons[s.type] || '📍'}</span>
                <div>
                  <span className="font-medium text-foreground">{s.city}</span>
                  <span className="text-sm text-muted-foreground ml-2">{s.country}</span>
                </div>
                <span className="ml-auto text-xs text-muted-foreground capitalize">{s.type}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-ocean" />
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: 300 + i * 100, height: 300 + i * 100,
              background: `radial-gradient(circle, hsl(var(--primary) / 0.2), transparent)`,
              left: `${20 + i * 25}%`, top: `${30 + i * 15}%`,
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
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
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
          {/* Origin & Destination with Autocomplete */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderCityInput(
              'From (Starting City)',
              <Navigation className="w-4 h-4 text-accent" />,
              origin, setOrigin, originSuggestions,
              originFocused, setOriginFocused,
              'e.g. Hyderabad, Mumbai...'
            )}
            {renderCityInput(
              t('destination'),
              <MapPin className="w-4 h-4 text-primary" />,
              destination, setDestination, destSuggestions,
              destFocused, setDestFocused,
              t('destinationPlaceholder')
            )}
          </div>

          {destination && destCurrency.code !== homeCurrency.code && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-highlight rounded-xl p-3 text-center text-sm text-muted-foreground"
            >
              💱 Destination currency: <span className="text-primary font-semibold">{destCurrency.symbol} {destCurrency.code}</span>
              {' '}• All prices shown in both {homeCurrency.code} & {destCurrency.code}
            </motion.div>
          )}

          {/* Single Date Range Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              Travel Dates
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal bg-secondary/50 border-border rounded-xl",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d, yyyy")} — {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : format(dateRange.from, "MMM d, yyyy")
                  ) : "Pick start & end dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {days > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-highlight rounded-xl p-3 text-center text-sm font-semibold text-primary"
            >
              ✈️ Trip Duration: {days} {days === 1 ? 'day' : 'days'}
            </motion.div>
          )}

          {/* Travelers Breakdown */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4 text-primary" />
              Travelers ({totalTravelers})
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Male', icon: <User className="w-4 h-4" />, value: maleCount, setValue: setMaleCount },
                { label: 'Female', icon: <User className="w-4 h-4" />, value: femaleCount, setValue: setFemaleCount },
                { label: 'Kids', icon: <Baby className="w-4 h-4" />, value: kidsCount, setValue: setKidsCount },
              ].map((item) => (
                <div key={item.label} className="glass-highlight rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2 text-xs font-medium text-muted-foreground">
                    {item.icon} {item.label}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg"
                      onClick={() => item.setValue(Math.max(0, item.value - 1))}>-</Button>
                    <span className="text-lg font-bold text-foreground w-8 text-center">{item.value}</span>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg"
                      onClick={() => item.setValue(Math.min(10, item.value + 1))}>+</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Plane className="w-4 h-4 text-primary" />
              Trip Type
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {tripTypes.map((tt) => (
                <button
                  key={tt.value}
                  type="button"
                  onClick={() => setTripType(tt.value)}
                  className={`p-3 rounded-xl text-center transition-all border-2 ${
                    tripType === tt.value
                      ? 'border-primary bg-primary/10 shadow-glow'
                      : 'border-border bg-secondary/30 hover:border-primary/30'
                  }`}
                >
                  <span className="text-2xl block mb-1">{tt.icon}</span>
                  <span className="text-xs font-medium text-foreground">{tt.label}</span>
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
            <Button
              type="submit"
              size="lg"
              disabled={!origin || !destination || !startDate || !endDate || days < 1 || totalTravelers < 1}
              className="flex-1 h-14 text-lg bg-gradient-hero border-0 text-primary-foreground font-semibold gap-2 rounded-xl shadow-glow hover:shadow-elevated transition-all"
            >
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
