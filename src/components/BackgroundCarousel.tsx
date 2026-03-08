import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const travelImages = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
  'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1920&q=80',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1920&q=80',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&q=80',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
  'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=1920&q=80',
];

export default function BackgroundCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % travelImages.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.15, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={travelImages[current]}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
    </div>
  );
}
