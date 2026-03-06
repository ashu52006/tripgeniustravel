import { motion } from 'framer-motion';
import { Plane, Globe, MapPin, Sparkles, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroCarousel from './HeroCarousel';
import { useLanguage } from '@/contexts/LanguageContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const { t } = useLanguage();

  const features = [
    { icon: <Sparkles className="w-6 h-6" />, title: 'AI-Powered Plans', desc: 'Smart itineraries tailored to your style' },
    { icon: <Globe className="w-6 h-6" />, title: 'Dual Currency', desc: 'See costs in both home & destination currency' },
    { icon: <MapPin className="w-6 h-6" />, title: 'Connected Routes', desc: 'Place-to-place distances with taxi fares' },
    { icon: <Plane className="w-6 h-6" />, title: 'Full Journey', desc: 'Flights, hotels, activities — all included' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            style={{ left: `${15 + i * 18}%`, top: '80%' }}
            animate={{
              y: [0, -800],
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 0.5],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'easeOut',
            }}
          />
        ))}
        {/* Plane animation */}
        <motion.div
          className="absolute top-1/3"
          animate={{
            x: ['-10vw', '110vw'],
            y: [100, -150],
            rotate: [-5, -15],
          }}
          transition={{ duration: 8, repeat: Infinity, repeatDelay: 10, ease: 'easeInOut' }}
        >
          <Plane className="w-8 h-8 text-primary/30" />
        </motion.div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <HeroCarousel />

        <div className="relative -mt-32 z-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-display font-bold text-gradient-hero mb-4 leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {t('heroTitle')}
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {t('heroSubtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                onClick={onGetStarted}
                size="lg"
                className="h-16 px-12 text-lg bg-gradient-hero border-0 text-primary-foreground font-bold gap-3 rounded-2xl shadow-glow hover:shadow-elevated transition-all duration-300 hover:scale-105"
              >
                <Plane className="w-6 h-6" />
                {t('planMyTrip')}
                <ArrowRight className="w-6 h-6" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.15 }}
                className="glass rounded-2xl p-6 text-center hover:shadow-glow transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary group-hover:bg-primary/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-3xl mx-auto px-4 pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="glass rounded-2xl p-8 text-center"
          >
            <div className="flex justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-warning text-warning" />
              ))}
            </div>
            <p className="text-foreground italic font-display text-lg mb-3">
              "TripGenius planned our entire Bali trip in seconds. The dual currency display saved us from budget confusion!"
            </p>
            <p className="text-sm text-muted-foreground">— Priya S., Hyderabad</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
