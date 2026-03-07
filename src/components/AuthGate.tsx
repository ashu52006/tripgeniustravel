import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Plane, Shield, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { lovable } from '@/integrations/lovable/index';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthGateProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AuthGate({ onSuccess, onBack }: AuthGateProps) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      onSuccess();
    }
  }, [user, loading]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (error) console.error('Sign in error:', error);
    } catch (e) {
      console.error('Sign in error:', e);
    }
    setSigningIn(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-ocean" />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 200 + i * 80,
              height: 200 + i * 80,
              background: `radial-gradient(circle, hsl(200 100% 55% / ${0.05 + i * 0.02}), transparent)`,
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 5 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        {/* Flying plane */}
        <motion.div
          className="absolute"
          animate={{ x: ['-10vw', '110vw'], y: [200, -100], rotate: [-5, -15] }}
          transition={{ duration: 10, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
        >
          <Plane className="w-10 h-10 text-primary/20" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-hero mb-3">
            {t('signIn')} to Continue
          </h1>
          <p className="text-muted-foreground">
            Sign in to unlock AI-powered trip planning with personalized itineraries
          </p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-6">
          <div className="space-y-4">
            {[
              { icon: <Sparkles className="w-5 h-5 text-primary" />, text: 'AI-generated personalized itineraries' },
              { icon: <Plane className="w-5 h-5 text-accent" />, text: 'Flight & hotel recommendations' },
              { icon: <Shield className="w-5 h-5 text-success" />, text: 'Save & access your trips anytime' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                {item.icon}
                {item.text}
              </motion.div>
            ))}
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={signingIn || loading}
            size="lg"
            className="w-full h-14 text-lg bg-gradient-hero border-0 text-primary-foreground font-bold gap-3 rounded-2xl shadow-glow hover:shadow-elevated transition-all duration-300"
          >
            <LogIn className="w-5 h-5" />
            {signingIn ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full gap-2 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
