import { motion } from 'framer-motion';
import { Calendar, Wallet, TrendingUp, MapPin, Clock, ArrowRight } from 'lucide-react';
import { TripPlan } from '@/types/trip';

interface TripDashboardProps {
  plan: TripPlan;
}

export default function TripDashboard({ plan }: TripDashboardProps) {
  const totalDayCost = plan.days.reduce((s, d) => s + d.cost.total, 0);
  const avgDaily = Math.round(totalDayCost / plan.days.length);
  const startDate = new Date(plan.setup.startDate);
  const today = new Date();
  const daysUntil = Math.max(0, Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const stats = [
    { icon: <Calendar className="w-5 h-5" />, label: 'Trip Countdown', value: `${daysUntil} days`, sub: `${plan.days.length}-day trip` },
    { icon: <Wallet className="w-5 h-5" />, label: 'Recommended Budget', value: `${plan.budget.currency}${plan.budget.comfortableBudget.toLocaleString()}`, sub: `You planned: ${plan.budget.currency}${plan.budget.userBudget.toLocaleString()}` },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Daily Average', value: `${plan.budget.currency}${avgDaily.toLocaleString()}`, sub: 'per day activities' },
    { icon: <MapPin className="w-5 h-5" />, label: 'Total Places', value: `${plan.days.reduce((s, d) => s + d.places.length, 0)}`, sub: `across ${plan.days.length} days` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i }}
            className="p-4 rounded-xl bg-card shadow-card border border-border"
          >
            <div className="text-primary mb-2">{stat.icon}</div>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
            <span className="text-xs text-muted-foreground">{stat.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Today's First Stop */}
      {plan.days[0] && (
        <div className="p-5 rounded-xl bg-gradient-warm border border-border">
          <h4 className="font-display font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            First Stop — Day 1
          </h4>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
              🏛️
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{plan.days[0].places[1]?.name || plan.days[0].places[0]?.name}</p>
              <p className="text-sm text-muted-foreground">{plan.days[0].places[1]?.startTime || plan.days[0].places[0]?.startTime}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
        </div>
      )}

      {/* Hotels */}
      <div>
        <h4 className="font-display font-bold text-foreground mb-3">🏨 Recommended Hotels</h4>
        <div className="grid gap-3">
          {plan.hotels.map((hotel) => (
            <div key={hotel.id} className="p-4 rounded-xl bg-card shadow-card border border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{hotel.name}</span>
                  {hotel.tag && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      hotel.tag === 'best-value' ? 'bg-accent/15 text-accent' :
                      hotel.tag === 'budget-saver' ? 'bg-warning/15 text-warning' :
                      'bg-primary/15 text-primary'
                    }`}>
                      {hotel.tag === 'best-value' ? '⭐ Best Value' : hotel.tag === 'budget-saver' ? '💰 Budget Saver' : '✨ Comfort Pick'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{hotel.whyItFits} · {hotel.distanceToAttractions} from attractions</p>
                <p className="text-xs text-muted-foreground mt-0.5">Safety: {hotel.safetyRating}/5 · Guest: {hotel.guestRating}/5</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-foreground">{plan.budget.currency}{hotel.pricePerNight.toLocaleString()}</p>
                <span className="text-xs text-muted-foreground">/night</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flights */}
      <div>
        <h4 className="font-display font-bold text-foreground mb-3">✈️ Flight Options</h4>
        <div className="grid gap-3">
          {plan.flights.map((flight) => (
            <div key={flight.id} className="p-4 rounded-xl bg-card shadow-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-semibold text-foreground">{flight.airline}</span>
                  {flight.tag && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                      flight.tag === 'cheapest' ? 'bg-success/15 text-success' :
                      flight.tag === 'balanced' ? 'bg-accent/15 text-accent' :
                      'bg-info/15 text-info'
                    }`}>
                      {flight.tag === 'cheapest' ? '💰 Cheapest' : flight.tag === 'balanced' ? '⚖️ Balanced' : '⚡ Fastest'}
                    </span>
                  )}
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {flight.departureTime} → {flight.arrivalTime} · {flight.duration}
                  </p>
                </div>
              </div>
              <p className="font-display font-bold text-foreground">{plan.budget.currency}{flight.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
