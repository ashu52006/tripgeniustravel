import { motion } from 'framer-motion';
import { useState } from 'react';
import { Calendar, MapPin, Wallet, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sampleTrips, SampleTrip } from '@/data/sampleTrips';

interface Props {
  onPlanLikeThis: (trip: SampleTrip) => void;
}

export default function SampleTripsSection({ onPlanLikeThis }: Props) {
  const [preview, setPreview] = useState<SampleTrip | null>(null);

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
          Get inspired
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Hand-picked sample trips. Peek inside, then plan your own version in seconds.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sampleTrips.map((trip, i) => (
          <motion.button
            key={trip.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            onClick={() => setPreview(trip)}
            className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-elevated transition-all text-left bg-card border border-border/60"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={trip.imageUrl}
                alt={trip.destination}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-xs text-white/80 font-medium uppercase tracking-wide">
                  {trip.country}
                </p>
                <h3 className="text-2xl font-display font-bold text-white">{trip.destination}</h3>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-muted-foreground italic mb-3">"{trip.tagline}"</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{trip.days} days</span>
                <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />₹{trip.budgetINR.toLocaleString()}+</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{trip.highlights.length} spots</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Preview Modal */}
      {preview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-card rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elevated"
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative h-64">
              <img src={preview.imageUrl} alt={preview.destination} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <p className="text-xs text-white/80 uppercase tracking-wide">{preview.country}</p>
                <h3 className="text-3xl font-display font-bold text-white">{preview.destination}</h3>
                <p className="text-sm text-white/90 mt-1">{preview.vibe}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="glass rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-bold text-foreground">{preview.days} days</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-bold text-foreground">₹{preview.budgetINR.toLocaleString()}</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Suggested from</p>
                  <p className="font-bold text-foreground">{preview.origin}</p>
                </div>
              </div>

              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Highlights
              </h4>
              <ul className="space-y-2 mb-6">
                {preview.highlights.map((h, i) => (
                  <li key={h} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    {h}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => { onPlanLikeThis(preview); setPreview(null); }}
                className="w-full h-12 rounded-xl bg-gradient-hero text-primary-foreground gap-2 font-bold"
              >
                Plan mine like this <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
