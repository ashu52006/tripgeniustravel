import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Globe, MapPin, Sparkles, ArrowRight, Star, ShieldCheck, Zap, Headphones, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroCarousel from './HeroCarousel';
import SampleTripsSection from './SampleTripsSection';
import Footer from './Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { reviews } from '@/data/reviews';
import { SampleTrip } from '@/data/sampleTrips';

interface LandingPageProps {
  onGetStarted: () => void;
  onPlanFromSample?: (trip: SampleTrip) => void;
}

export default function LandingPage({ onGetStarted, onPlanFromSample }: LandingPageProps) {
  const { t } = useLanguage();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <Sparkles className="w-6 h-6" />, title: 'AI-Powered Plans', desc: 'Smart itineraries tailored to your style' },
    { icon: <Globe className="w-6 h-6" />, title: 'Dual Currency', desc: 'See costs in both home & destination currency' },
    { icon: <MapPin className="w-6 h-6" />, title: 'Connected Routes', desc: 'Place-to-place distances with taxi fares' },
    { icon: <Plane className="w-6 h-6" />, title: 'Full Journey', desc: 'Flights, hotels, activities — all included' },
  ];

  // Show 3 reviews at a time
  const visibleReviews = [0, 1, 2].map(
    (offset) => reviews[(currentReviewIndex + offset) % reviews.length]
  );

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

        {/* Reviews Section */}
        <div className="max-w-6xl mx-auto px-4 pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-2">
              Loved by Travelers Worldwide
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              {reviews.length}+ happy travelers and counting
            </p>

            {/* Rotating review cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {visibleReviews.map((review, i) => (
                <motion.div
                  key={`${review.name}-${currentReviewIndex}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-foreground text-sm italic mb-3 leading-relaxed">
                    "{review.comment}"
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    — {review.name}, {review.location}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5">
              {Array.from({ length: Math.min(10, Math.ceil(reviews.length / 3)) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentReviewIndex(i * 3)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    Math.floor(currentReviewIndex / 3) % 10 === i
                      ? 'bg-primary w-6'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sample Trips */}
        {onPlanFromSample && <SampleTripsSection onPlanLikeThis={onPlanFromSample} />}

        {/* Trust bar */}
        <div className="max-w-5xl mx-auto px-4 pb-16">
          <div className="glass-strong rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: <Zap className="w-6 h-6" />, title: 'Ready in seconds', desc: 'Full itinerary in under 10s' },
              { icon: <ShieldCheck className="w-6 h-6" />, title: 'Trusted planning', desc: 'Dual-currency, transparent costs' },
              { icon: <Star className="w-6 h-6" />, title: '4.9 / 5 rating', desc: `From ${reviews.length}+ real travellers` },
            ].map((it) => (
              <div key={it.title} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-2">
                  {it.icon}
                </div>
                <h4 className="font-semibold text-foreground">{it.title}</h4>
                <p className="text-sm text-muted-foreground">{it.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="border-y border-border/50 bg-card/30">
          <div className="max-w-5xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Headphones className="w-5 h-5" />
                <span className="text-sm font-semibold">Customer care</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Need help before or during your trip?</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl">Reach the TripGenius support team, browse traveller feedback, or share your own experience.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="gap-2 rounded-xl">
                <Link to="/reviews"><MessageSquareText className="w-4 h-4" /> Customer reviews</Link>
              </Button>
              <Button asChild className="gap-2 rounded-xl">
                <Link to="/contact"><Headphones className="w-4 h-4" /> Get support</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
