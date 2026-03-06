import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Users, Flame, Star, Plus, ChevronDown, ChevronUp, CloudSun, Navigation, Car, ExternalLink } from 'lucide-react';
import { DayPlan, PlacePriority } from '@/types/trip';

const priorityConfig: Record<PlacePriority, { icon: React.ReactNode; label: string; className: string }> = {
  'must-visit': { icon: <Flame className="w-3.5 h-3.5" />, label: 'Must Visit', className: 'bg-primary/15 text-primary border-primary/30' },
  'recommended': { icon: <Star className="w-3.5 h-3.5" />, label: 'Recommended', className: 'bg-accent/15 text-accent border-accent/30' },
  'optional': { icon: <Plus className="w-3.5 h-3.5" />, label: 'Optional', className: 'bg-muted text-muted-foreground border-border' },
};

const categoryEmoji: Record<string, string> = {
  attraction: '🏛️', food: '🍽️', transport: '🚗', rest: '😌',
  activity: '🎯', viewpoint: '🌅', flight: '✈️', hotel: '🏨',
};

interface DayItineraryProps {
  dayPlan: DayPlan;
  currency: string;
  homeCurrency?: string;
}

export default function DayItinerary({ dayPlan, currency, homeCurrency }: DayItineraryProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
            {dayPlan.day}
          </div>
          <div className="text-left">
            <h3 className="font-display text-lg font-bold text-foreground">Day {dayPlan.day}: {dayPlan.title}</h3>
            <p className="text-sm text-muted-foreground">{new Date(dayPlan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-display font-bold text-primary">{currency}{dayPlan.cost.total.toLocaleString()}</p>
            {homeCurrency && homeCurrency !== currency && dayPlan.cost.totalHome && (
              <p className="text-xs text-muted-foreground">≈ {homeCurrency}{dayPlan.cost.totalHome.toLocaleString()}</p>
            )}
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5">
              <div className="relative">
                <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-border" />

                {dayPlan.places.map((place, i) => {
                  const priority = priorityConfig[place.priority];
                  return (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="relative pl-14 pb-6 last:pb-0"
                    >
                      <div className="absolute left-3 top-1 w-5 h-5 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xs">
                        {categoryEmoji[place.category] || '📍'}
                      </div>

                      <div className="glass rounded-xl p-4 hover:shadow-card transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-semibold text-primary">
                                {place.startTime} – {place.endTime}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${priority.className}`}>
                                {priority.icon} {priority.label}
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground mt-1">{place.name}</h4>
                            <p className="text-sm text-muted-foreground mt-0.5">{place.whyRecommended}</p>

                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {place.timeRequired}
                              </span>
                              <span className="flex items-center gap-1">
                                <Navigation className="w-3 h-3" /> {place.distanceFromPrevious}
                              </span>
                              {place.taxiFare && (
                                <span className="flex items-center gap-1 text-accent">
                                  <Car className="w-3 h-3" /> Taxi: {place.taxiFare}
                                  {place.taxiFareHome && homeCurrency !== currency && (
                                    <span className="text-muted-foreground"> (≈{place.taxiFareHome})</span>
                                  )}
                                </span>
                              )}
                              {place.entryFee > 0 && (
                                <span className="flex items-center gap-1">
                                  🎫 {currency}{place.entryFee}
                                  {place.entryFeeHome && homeCurrency !== currency && (
                                    <span className="text-muted-foreground"> (≈{homeCurrency}{place.entryFeeHome})</span>
                                  )}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {place.crowdLevel} crowd
                              </span>
                              <span className="flex items-center gap-1">
                                <CloudSun className="w-3 h-3" /> {place.weatherSuitability}
                              </span>
                            </div>

                            {/* Map Link */}
                            {place.mapUrl && (
                              <a
                                href={place.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                              >
                                <MapPin className="w-3 h-3" /> View on Map
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {/* Place Image */}
                          {place.imageUrl && (
                            <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                              <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Day Cost Breakdown */}
              <div className="mt-4 glass rounded-xl p-4">
                <h5 className="text-sm font-semibold text-foreground mb-2">Day {dayPlan.day} Cost Breakdown</h5>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Transport', value: dayPlan.cost.transport },
                    { label: 'Entry Fees', value: dayPlan.cost.entryFees },
                    { label: 'Food', value: dayPlan.cost.food },
                    { label: 'Activities', value: dayPlan.cost.activities },
                  ].map((item) => (
                    <div key={item.label}>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <p className="font-semibold text-sm text-foreground">{currency}{item.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
