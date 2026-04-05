import { motion } from 'framer-motion';
import { Calendar, Wallet, TrendingUp, MapPin, Plane, Navigation, CalendarDays, ArrowRight } from 'lucide-react';
import { TripPlan } from '@/types/trip';
import BackgroundCarousel from './BackgroundCarousel';
import { Button } from '@/components/ui/button';

interface TripDashboardProps {
  plan: TripPlan;
  onViewItinerary?: () => void;
}

export default function TripDashboard({ plan }: TripDashboardProps) {
  const totalDayCost = plan.days.reduce((s, d) => s + d.cost.total, 0);
  const avgDaily = Math.round(totalDayCost / plan.days.length);
  const startDate = new Date(plan.setup.startDate);
  const today = new Date();
  const daysUntil = Math.max(0, Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const curr = plan.budget.currency;
  const homeCurr = plan.setup.homeCurrency;
  const showDual = homeCurr && homeCurr !== curr;

  const stats = [
    { icon: <Calendar className="w-5 h-5" />, label: 'Trip Countdown', value: `${daysUntil} days`, sub: `${plan.days.length}-day trip` },
    { icon: <Wallet className="w-5 h-5" />, label: 'Your Budget', value: `${homeCurr}${plan.budget.userBudget.toLocaleString()}`, sub: showDual ? `≈ ${curr}${plan.budget.comfortableBudget.toLocaleString()}` : '' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Daily Average', value: `${homeCurr}${avgDaily.toLocaleString()}`, sub: showDual ? `≈ ${curr}${avgDaily.toLocaleString()}` : 'per day' },
    { icon: <MapPin className="w-5 h-5" />, label: 'Total Places', value: `${plan.days.reduce((s, d) => s + d.places.length, 0)}`, sub: `across ${plan.days.length} days` },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative">
      <BackgroundCarousel />

      <div className="relative z-10 space-y-6">
        {/* Route */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <Navigation className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="font-display font-bold text-foreground">{plan.setup.origin}</p>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-accent via-primary to-accent" />
              <Plane className="w-5 h-5 text-primary" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-accent via-primary to-accent" />
            </div>
            <div className="text-center">
              <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display font-bold text-foreground">{plan.setup.destination}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }} className="glass rounded-xl p-4">
              <div className="text-primary mb-2">{stat.icon}</div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
              {stat.sub && <span className="text-xs text-muted-foreground">{stat.sub}</span>}
            </motion.div>
          ))}
        </div>

        {/* Flights */}
        {plan.flights.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-foreground mb-3">✈️ Outbound Flights ({plan.setup.origin} → {plan.setup.destination})</h4>
            <div className="grid gap-3">
              {plan.flights.map((flight) => (
                <div key={flight.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{flight.airline}</span>
                      {flight.tag && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          flight.tag === 'cheapest' ? 'bg-success/15 text-success' :
                          flight.tag === 'balanced' ? 'bg-accent/15 text-accent' : 'bg-info/15 text-info'
                        }`}>
                          {flight.tag === 'cheapest' ? '💰 Cheapest' : flight.tag === 'balanced' ? '⚖️ Balanced' : '⚡ Fastest'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {flight.from} → {flight.to} • {flight.departureTime} → {flight.arrivalTime} • {flight.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-foreground">{homeCurr}{(flight.priceHome || flight.price).toLocaleString()}</p>
                    {showDual && <p className="text-xs text-muted-foreground">≈ {curr}{flight.price.toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Return Flights */}
        {plan.returnFlights && plan.returnFlights.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-foreground mb-3">✈️ Return Flights ({plan.setup.destination} → {plan.setup.origin})</h4>
            <div className="grid gap-3">
              {plan.returnFlights.map((flight) => (
                <div key={flight.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{flight.airline}</span>
                      {flight.tag && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          flight.tag === 'cheapest' ? 'bg-success/15 text-success' :
                          flight.tag === 'balanced' ? 'bg-accent/15 text-accent' : 'bg-info/15 text-info'
                        }`}>
                          {flight.tag === 'cheapest' ? '💰 Cheapest' : flight.tag === 'balanced' ? '⚖️ Balanced' : '⚡ Fastest'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {flight.from} → {flight.to} • {flight.departureTime} → {flight.arrivalTime} • {flight.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-foreground">{homeCurr}{(flight.priceHome || flight.price).toLocaleString()}</p>
                    {showDual && <p className="text-xs text-muted-foreground">≈ {curr}{flight.price.toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotels */}
        {plan.hotels.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-foreground mb-3">🏨 Recommended Hotels</h4>
            <div className="grid gap-3">
              {plan.hotels.map((hotel) => (
                <div key={hotel.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{hotel.name}</span>
                      {hotel.tag && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          hotel.tag === 'best-value' ? 'bg-accent/15 text-accent' :
                          hotel.tag === 'budget-saver' ? 'bg-warning/15 text-warning' : 'bg-primary/15 text-primary'
                        }`}>
                          {hotel.tag === 'best-value' ? '⭐ Best Value' : hotel.tag === 'budget-saver' ? '💰 Budget Saver' : '✨ Comfort Pick'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{hotel.whyItFits} · {hotel.distanceToAttractions} from attractions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-foreground">{homeCurr}{(hotel.pricePerNightHome || hotel.pricePerNight).toLocaleString()}</p>
                    {showDual && <p className="text-xs text-muted-foreground">≈ {curr}{hotel.pricePerNight.toLocaleString()}</p>}
                    <span className="text-xs text-muted-foreground">/night</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
