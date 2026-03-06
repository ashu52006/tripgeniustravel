import { motion } from 'framer-motion';
import { Plane, Loader2 } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-ocean" />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-primary/15"
            style={{ left: `${10 + i * 11}%`, bottom: 0 }}
            animate={{
              y: [0, -600 - i * 100],
              opacity: [0, 0.5, 0],
              scale: [0.5, 1.5, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Plane animation */}
      <div className="relative z-10">
        <motion.div
          className="relative"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Plane className="w-20 h-20 text-primary" />
          </motion.div>
        </motion.div>

        {/* Route line */}
        <motion.div
          className="mt-6 flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-foreground font-semibold">{origin}</span>
          <motion.div
            className="flex-1 h-0.5 bg-gradient-to-r from-primary via-accent to-primary min-w-[100px]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
          />
          <span className="text-foreground font-semibold">{destination}</span>
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 text-center mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Creating your perfect trip...
        </h2>
        <p className="text-muted-foreground">
          Finding flights, hotels, restaurants & hidden gems
        </p>
        <div className="flex gap-2 mt-6 justify-center">
          {['✈️', '🏨', '🗺️', '🍽️', '💰', '🚕'].map((emoji, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.3 }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
