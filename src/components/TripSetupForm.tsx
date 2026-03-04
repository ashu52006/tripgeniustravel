import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Wallet, Compass, Gauge, ArrowRight, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TripSetup, TravelStyle, TravelPace } from '@/types/trip';

const styles: { value: TravelStyle; label: string; icon: string }[] = [
  { value: 'budget', label: 'Budget', icon: '💰' },
  { value: 'balanced', label: 'Balanced', icon: '⚖️' },
  { value: 'luxury', label: 'Luxury', icon: '✨' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'cultural', label: 'Cultural', icon: '🏛️' },
];

const paces: { value: TravelPace; label: string; description: string }[] = [
  { value: 'relaxed', label: 'Relaxed', description: '3-4 places/day' },
  { value: 'normal', label: 'Normal', description: '5-6 places/day' },
  { value: 'fast', label: 'Fast', description: '7+ places/day' },
];

interface TripSetupFormProps {
  onSubmit: (setup: TripSetup) => void;
}

export default function TripSetupForm({ onSubmit }: TripSetupFormProps) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [startDate, setStartDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [userBudget, setUserBudget] = useState('');
  const [style, setStyle] = useState<TravelStyle>('balanced');
  const [pace, setPace] = useState<TravelPace>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !userBudget) return;
    onSubmit({
      destination,
      days,
      startDate,
      travelers,
      userBudget: Number(userBudget),
      currency: '₹',
      style,
      pace,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Destination */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            Where do you want to go?
          </Label>
          <Input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Goa, Jaipur, Manali..."
            className="h-12 text-lg bg-card border-border"
            required
          />
        </div>

        {/* Days & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              Trip Duration
            </Label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" onClick={() => setDays(Math.max(1, days - 1))} className="h-12 w-12">-</Button>
              <span className="text-2xl font-display font-bold text-foreground w-16 text-center">{days}</span>
              <Button type="button" variant="outline" size="icon" onClick={() => setDays(Math.min(14, days + 1))} className="h-12 w-12">+</Button>
              <span className="text-muted-foreground">days</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              Start Date
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-12 bg-card border-border"
              required
            />
          </div>
        </div>

        {/* Travelers & Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4 text-primary" />
              Travelers
            </Label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" onClick={() => setTravelers(Math.max(1, travelers - 1))} className="h-12 w-12">-</Button>
              <span className="text-2xl font-display font-bold text-foreground w-16 text-center">{travelers}</span>
              <Button type="button" variant="outline" size="icon" onClick={() => setTravelers(Math.min(10, travelers + 1))} className="h-12 w-12">+</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Wallet className="w-4 h-4 text-primary" />
              Your Budget (₹)
            </Label>
            <Input
              type="number"
              value={userBudget}
              onChange={(e) => setUserBudget(e.target.value)}
              placeholder="e.g. 15000"
              className="h-12 text-lg bg-card border-border"
              required
            />
          </div>
        </div>

        {/* Travel Style */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Compass className="w-4 h-4 text-primary" />
            Travel Style
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
                <span className="text-xs font-medium text-foreground">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pace */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Gauge className="w-4 h-4 text-primary" />
            Travel Pace
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
                <span className="font-semibold text-sm text-foreground">{p.label}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">{p.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full h-14 text-lg bg-gradient-hero border-0 text-primary-foreground font-semibold gap-2 rounded-xl">
          <Plane className="w-5 h-5" />
          Plan My Trip
          <ArrowRight className="w-5 h-5" />
        </Button>
      </form>
    </motion.div>
  );
}
