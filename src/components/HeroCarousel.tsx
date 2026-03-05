import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
    title: 'Paris',
    subtitle: 'City of Lights',
  },
  {
    url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1920&q=80',
    title: 'Tokyo',
    subtitle: 'Where tradition meets future',
  },
  {
    url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1920&q=80',
    title: 'Dubai',
    subtitle: 'City of Gold',
  },
  {
    url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&q=80',
    title: 'India',
    subtitle: 'Incredible diversity',
  },
  {
    url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80',
    title: 'Bali',
    subtitle: 'Island of Gods',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[420px] md:h-[520px] rounded-3xl overflow-hidden mb-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={heroImages[current].url}
            alt={heroImages[current].title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
        <motion.div
          key={`text-${current}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-2">
            {heroImages[current].title}
          </h2>
          <p className="text-lg md:text-xl text-white/80">
            {heroImages[current].subtitle}
          </p>
        </motion.div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 right-8 flex gap-2 z-10">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === current ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
