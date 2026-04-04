import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Users, Flame, Star, Plus, ChevronDown, ChevronUp, CloudSun, Navigation, Car, ExternalLink, Lock, Train, Bus, Footprints, Bike, Ship, Plane } from 'lucide-react';
import { DayPlan, PlacePriority, PlaceRecommendation } from '@/types/trip';

const priorityConfig: Record<PlacePriority, { icon: React.ReactNode; label: string; className: string }> = {
  'must-visit': { icon: <Flame className="w-3.5 h-3.5" />, label: 'Must Visit', className: 'bg-primary/15 text-primary border-primary/30' },
  'recommended': { icon: <Star className="w-3.5 h-3.5" />, label: 'Recommended', className: 'bg-accent/15 text-accent border-accent/30' },
  'optional': { icon: <Plus className="w-3.5 h-3.5" />, label: 'Optional', className: 'bg-muted text-muted-foreground border-border' },
};

const categoryEmoji: Record<string, string> = {
  attraction: '🏛️', food: '🍽️', transport: '🚗', rest: '😌',
  activity: '🎯', viewpoint: '🌅', flight: '✈️', hotel: '🏨',
};

const transportModeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  walk: { icon: <Footprints className="w-3.5 h-3.5" />, label: 'Walk', color: 'text-green-500' },
  taxi: { icon: <Car className="w-3.5 h-3.5" />, label: 'Taxi', color: 'text-yellow-500' },
  auto: { icon: <Car className="w-3.5 h-3.5" />, label: 'Auto', color: 'text-orange-500' },
  metro: { icon: <Train className="w-3.5 h-3.5" />, label: 'Metro', color: 'text-blue-500' },
  bus: { icon: <Bus className="w-3.5 h-3.5" />, label: 'Bus', color: 'text-teal-500' },
  train: { icon: <Train className="w-3.5 h-3.5" />, label: 'Train', color: 'text-indigo-500' },
  flight: { icon: <Plane className="w-3.5 h-3.5" />, label: 'Flight', color: 'text-purple-500' },
  ferry: { icon: <Ship className="w-3.5 h-3.5" />, label: 'Ferry', color: 'text-cyan-500' },
  bike: { icon: <Bike className="w-3.5 h-3.5" />, label: 'Bike', color: 'text-lime-500' },
};

const fallbackPlaceImage = (placeName: string, seed: string) =>
  `https://loremflickr.com/200/200/${placeName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ',') || 'travel,landmark'}?lock=${encodeURIComponent(seed)}`;

const resolveWikipediaPlaceImage = async (query: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=3&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const pages = data?.query?.pages ? (Object.values(data.query.pages) as Array<{ thumbnail?: { source?: string } }>) : [];
    const thumbnail = pages.find((page) => page?.thumbnail?.source)?.thumbnail?.source;

    return typeof thumbnail === 'string' ? thumbnail : null;
  } catch {
    return null;
  }
};

// Extract clean place name by removing prefixes like "Lunch at", "Dinner at", "Optional:", parenthetical info
const cleanPlaceName = (name: string): string => {
  return name
    .replace(/^(Lunch at|Dinner at|Breakfast at|Optional:|Visit|Explore|Tour)\s*/i, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .trim();
};

interface DayItineraryProps {
  dayPlan: DayPlan;
  currency: string;
  homeCurrency?: string;
  isLocked?: boolean;
  onSubscribe?: () => void;
}

export default function DayItinerary({ dayPlan, currency, homeCurrency, isLocked, onSubscribe }: DayItineraryProps) {
  const [expanded, setExpanded] = useState(!isLocked);
  const [placeImages, setPlaceImages] = useState<Record<string, string>>({});
  const showDual = homeCurrency && homeCurrency !== currency;

  useEffect(() => {
    let cancelled = false;

    const loadPlaceImages = async () => {
      const imageEntries = await Promise.all(
        dayPlan.places.map(async (place, index) => {
          const existingImage = place.imageUrl;
          if (
            existingImage &&
            existingImage.startsWith('http') &&
            !existingImage.includes('source.unsplash.com') &&
            !existingImage.includes('loremflickr.com')
          ) {
            return [place.id, existingImage] as const;
          }

          const clean = cleanPlaceName(place.name);
          const searchQueries = [
            clean,
            `${clean} ${place.category}`,
          ];

          for (const query of searchQueries) {
            const wikiImage = await resolveWikipediaPlaceImage(query);
            if (wikiImage) return [place.id, wikiImage] as const;
          }

          return [place.id, fallbackPlaceImage(place.name, `${dayPlan.day}-${index}`)] as const;
        })
      );

      if (!cancelled) {
        setPlaceImages(Object.fromEntries(imageEntries));
      }
    };

    loadPlaceImages();

    return () => {
      cancelled = true;
    };
  }, [dayPlan.day, dayPlan.title, dayPlan.places]);

  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden relative"
      >
        <div className="p-5 filter blur-sm pointer-events-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
              {dayPlan.day}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Day {dayPlan.day}: {dayPlan.title}</h3>
              <p className="text-sm text-muted-foreground">Locked content</p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <button
            onClick={onSubscribe}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-hero text-primary-foreground font-bold rounded-2xl shadow-glow hover:shadow-elevated transition-all"
          >
            <Lock className="w-5 h-5" />
            Subscribe for Full Plan
          </button>
        </div>
      </motion.div>
    );
  }

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
            <p className="font-display font-bold text-primary">
              {homeCurrency || currency}{dayPlan.cost.totalHome || dayPlan.cost.total}
            </p>
            {showDual && (
              <p className="text-xs text-muted-foreground">≈ {currency}{dayPlan.cost.total.toLocaleString()}</p>
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
                  const priority = priorityConfig[place.priority] || priorityConfig['optional'];
                  return (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * i }}
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
                                  {place.taxiFareHome && showDual && (
                                    <span className="text-muted-foreground"> (≈{place.taxiFareHome})</span>
                                  )}
                                </span>
                              )}
                              {place.entryFee > 0 && (
                                <span className="flex items-center gap-1">
                                  🎫 {homeCurrency || currency}{place.entryFeeHome || place.entryFee}
                                  {showDual && (
                                    <span className="text-muted-foreground"> (≈{currency}{place.entryFee})</span>
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

                            <a
                              href={place.mapUrl && place.mapUrl.startsWith('http')
                                ? place.mapUrl
                                : `https://www.google.com/maps/search/${encodeURIComponent(cleanPlaceName(place.name) + ' ' + (dayPlan.title?.replace(/^(Arrival in|Departure from|Exploring)\s*/i, '') || ''))}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                            >
                              <MapPin className="w-3 h-3" /> View on Map
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {/* Place Image */}
                          <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-border">
                            <img
                              src={placeImages[place.id] || fallbackPlaceImage(place.name, `${dayPlan.day}-${i}`)}
                              alt={`${place.name} photo`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const fallback = fallbackPlaceImage(place.name, `${dayPlan.day}-${i}`);
                                if ((e.currentTarget as HTMLImageElement).src !== fallback) {
                                  (e.currentTarget as HTMLImageElement).src = fallback;
                                } else {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Day Cost Breakdown - dual currency */}
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
                      <p className="font-semibold text-sm text-foreground">
                        {homeCurrency || currency}{item.value.toLocaleString()}
                      </p>
                      {showDual && (
                        <p className="text-xs text-muted-foreground">≈ {currency}{item.value.toLocaleString()}</p>
                      )}
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
