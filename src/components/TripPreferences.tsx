import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, X, Sparkles, ArrowRight, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BackgroundCarousel from '@/components/BackgroundCarousel';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface TripPreferencesProps {
  destination: string;
  onSubmit: (selectedPlaces: string[], customPlaces: string[]) => void;
  onSkip: () => void;
  onBack: () => void;
}

interface SuggestedPlace {
  name: string;
  category: string;
  description: string;
}

export default function TripPreferences({ destination, onSubmit, onSkip, onBack }: TripPreferencesProps) {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState<SuggestedPlace[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [customPlace, setCustomPlace] = useState('');
  const [customPlaces, setCustomPlaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadSuggestions = async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-places', {
        body: { destination },
      });
      if (!error && data?.places) {
        setSuggestions(data.places);
      }
    } catch (e) {
      console.error('Failed to load place suggestions:', e);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const togglePlace = (name: string) => {
    setSelectedPlaces(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const addCustomPlace = () => {
    const trimmed = customPlace.trim();
    if (trimmed && !customPlaces.includes(trimmed)) {
      setCustomPlaces(prev => [...prev, trimmed]);
      setCustomPlace('');
    }
  };

  const removeCustomPlace = (place: string) => {
    setCustomPlaces(prev => prev.filter(p => p !== place));
  };

  const categoryIcons: Record<string, string> = {
    landmark: '🏛️', temple: '🛕', museum: '🏛️', park: '🌳', beach: '🏖️',
    market: '🛒', food: '🍜', nightlife: '🌃', adventure: '🧗', nature: '🌿',
    shopping: '🛍️', historical: '🏰', religious: '🕌', entertainment: '🎭',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative"
    >
      <BackgroundCarousel />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl glass rounded-3xl p-8 shadow-elevated"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Places to Visit in {destination}
            </h2>
            <p className="text-muted-foreground mt-1">
              Select must-visit spots or add your own — or skip to let AI decide
            </p>
          </div>

          {/* Load suggestions button */}
          {!loaded && (
            <Button
              onClick={loadSuggestions}
              disabled={loading}
              className="w-full mb-6 gap-2 rounded-xl bg-gradient-hero text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading suggestions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Get AI Place Suggestions
                </>
              )}
            </Button>
          )}

          {/* AI Suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mb-6"
              >
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Popular Places
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((place, i) => {
                    const isSelected = selectedPlaces.includes(place.name);
                    const emoji = categoryIcons[place.category.toLowerCase()] || '📍';
                    return (
                      <motion.button
                        key={place.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => togglePlace(place.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                            : 'glass border-border hover:border-primary/50 text-foreground'
                        }`}
                        title={place.description}
                      >
                        <span>{emoji}</span>
                        {place.name}
                        {isSelected && <span className="text-xs">✓</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom places */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Add Your Own Places
            </h3>
            <div className="flex gap-2">
              <Input
                value={customPlace}
                onChange={(e) => setCustomPlace(e.target.value)}
                placeholder="Type a place name..."
                className="flex-1 rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomPlace())}
              />
              <Button
                onClick={addCustomPlace}
                disabled={!customPlace.trim()}
                size="icon"
                className="rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {customPlaces.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {customPlaces.map(place => (
                  <Badge
                    key={place}
                    variant="secondary"
                    className="gap-1 px-3 py-1.5 rounded-xl text-sm"
                  >
                    📌 {place}
                    <button onClick={() => removeCustomPlace(place)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Selected count */}
          {(selectedPlaces.length > 0 || customPlaces.length > 0) && (
            <div className="mb-4 text-sm text-muted-foreground text-center">
              {selectedPlaces.length + customPlaces.length} place(s) selected — AI will prioritize these in your itinerary
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="rounded-xl">
              Back
            </Button>
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1 rounded-xl"
            >
              Skip — Let AI Decide
            </Button>
            <Button
              onClick={() => onSubmit(selectedPlaces, customPlaces)}
              disabled={selectedPlaces.length === 0 && customPlaces.length === 0}
              className="flex-1 gap-2 rounded-xl bg-gradient-hero text-primary-foreground"
            >
              Generate with these <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
