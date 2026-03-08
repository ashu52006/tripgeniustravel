import { motion } from 'framer-motion';
import { Plane, Loader2 } from 'lucide-react';
import BackgroundCarousel from './BackgroundCarousel';

interface LoadingScreenProps {
  origin: string;
  destination: string;
}

export default function LoadingScreen({ origin, destination }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
    >
      <BackgroundCarousel />

      {/* Animated bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-primary/20"
            style={{ left: `${10 + i * 15}%`, bottom: 0 }}
            animate={{ y: [0, -500], opacity: [0, 0.6, 0] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Plane className="w-16 h-16 text-primary" />
        </motion.div>

        <motion.div
          className="mt-4 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-foreground font-semibold">{origin}</span>
          <motion.div
            className="h-0.5 bg-gradient-to-r from-primary to-accent min-w-[80px]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4 }}
          />
          <span className="text-foreground font-semibold">{destination}</span>
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 text-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Loader2 className="w-7 h-7 text-primary animate-spin mx-auto mb-3" />
        <h2 className="text-xl font-display font-bold text-foreground mb-1">
          Creating your perfect trip...
        </h2>
        <p className="text-sm text-muted-foreground">
          Finding flights, hotels & hidden gems
        </p>
        <div className="flex gap-2 mt-3 justify-center">
          {['✈️', '🏨', '🗺️', '🍽️', '💰', '🚕'].map((emoji, i) => (
            <motion.span
              key={i}
              className="text-xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
