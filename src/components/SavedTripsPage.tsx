import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CalendarDays, Users, Trash2, Loader2, ArrowLeft, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TripPlan } from '@/types/trip';
import { toast } from 'sonner';
import BackgroundCarousel from './BackgroundCarousel';

interface SavedTrip {
  id: string;
  trip_name: string;
  origin: string;
  destination: string;
  start_date: string;
  days: number;
  travelers: number;
  trip_data: TripPlan;
  created_at: string;
}

interface SavedTripsPageProps {
  onBack: () => void;
  onLoadTrip: (plan: TripPlan) => void;
}

export default function SavedTripsPage({ onBack, onLoadTrip }: SavedTripsPageProps) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_trips')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load saved trips');
      console.error(error);
    } else {
      setTrips((data as unknown as SavedTrip[]) || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from('saved_trips').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete trip');
    } else {
      setTrips((prev) => prev.filter((t) => t.id !== id));
      toast.success('Trip deleted');
    }
    setDeleting(null);
  };

  const handleLoad = (trip: SavedTrip) => {
    onLoadTrip(trip.trip_data);
    toast.success(`Loaded: ${trip.trip_name}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen px-4 py-12">
      <BackgroundCarousel />
      <div className="relative z-10 max-w-4xl mx-auto pt-16">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
          <Plane className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-hero mb-2">My Saved Trips</h1>
          <p className="text-muted-foreground">Your previously saved trip plans</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Loading your trips…</p>
          </div>
        ) : trips.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass rounded-2xl">
            <MapPin className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-foreground mb-2">No saved trips yet</h3>
            <p className="text-muted-foreground mb-6">Plan a trip and save it to see it here!</p>
            <Button onClick={onBack} className="rounded-xl bg-gradient-hero text-primary-foreground">
              Plan a Trip
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4 mb-8">
            <AnimatePresence>
              {trips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-5 border-2 border-border hover:border-primary/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-lg text-foreground truncate">{trip.trip_name}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          {trip.days} days · {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          Saved {new Date(trip.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" onClick={() => handleLoad(trip)} className="rounded-xl bg-gradient-hero text-primary-foreground gap-1.5">
                        <MapPin className="w-4 h-4" /> Load Trip
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(trip.id)}
                        disabled={deleting === trip.id}
                        className="rounded-xl text-destructive hover:bg-destructive/10 gap-1.5"
                      >
                        {deleting === trip.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="flex justify-center">
          <Button variant="outline" onClick={onBack} className="rounded-xl gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
