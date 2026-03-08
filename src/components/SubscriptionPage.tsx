import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Rocket, Star, Zap, Building2, Phone, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackgroundCarousel from './BackgroundCarousel';
import { toast } from 'sonner';

interface SubscriptionPageProps {
  onBack: () => void;
  currentPlan?: string;
  onSubscribe?: (plan: string) => void;
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    priceLabel: 'Free',
    icon: <Star className="w-8 h-8" />,
    color: 'border-muted-foreground/30',
    features: [
      'AI trip planning (half itinerary)',
      'Up to 15 days visible per trip',
      'Basic budget analysis',
      'Dual currency display',
      'Single trip at a time',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 199,
    priceLabel: '₹199/mo',
    icon: <Zap className="w-8 h-8" />,
    color: 'border-accent/50',
    features: [
      'Full itinerary (all days unlocked)',
      'Up to 30-day trips',
      'Detailed budget pie charts',
      'Flight & hotel comparisons',
      'Place images & map links',
      'Save 3 trips',
    ],
    cta: 'Subscribe Now',
    popular: false,
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 599,
    priceLabel: '₹599/mo',
    icon: <Crown className="w-8 h-8" />,
    color: 'border-warning/60',
    features: [
      'Everything in Silver',
      'Up to 60-day trips',
      'Priority AI generation (faster)',
      'Taxi fare estimates between places',
      'Unlimited saved trips',
      'Export itinerary as PDF',
      'Email trip to companions',
    ],
    cta: 'Subscribe Now',
    popular: true,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 999,
    priceLabel: '₹999/mo',
    icon: <Rocket className="w-8 h-8" />,
    color: 'border-primary/70',
    features: [
      'Everything in Gold',
      'Up to 90-day trips',
      'Real-time price updates',
      'Personalized recommendations',
      'Priority customer support',
      'Multi-city trip planning',
      'Group trip coordination',
      'Ad-free experience',
    ],
    cta: 'Subscribe Now',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: -1,
    priceLabel: 'Contact Us',
    icon: <Building2 className="w-8 h-8" />,
    color: 'border-success/60',
    features: [
      'Lifetime access — no subscription needed',
      'Designed for tourism companies',
      'Unlimited trips & travelers',
      'White-label options available',
      'Dedicated account manager',
      'Custom API integration',
      'Bulk trip generation',
      'Analytics dashboard',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function SubscriptionPage({ onBack, currentPlan = 'basic', onSubscribe }: SubscriptionPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    if (planId === 'basic') return;
    if (planId === 'enterprise') {
      window.open('mailto:tripgenius@travel.com', '_blank');
      return;
    }
    
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // Razorpay integration
    const options = {
      key: 'rzp_test_placeholder', // Will be replaced with real key
      amount: plan.price * 100,
      currency: 'INR',
      name: 'TripGenius',
      description: `${plan.name} Plan Subscription`,
      handler: function (response: any) {
        toast.success(`Successfully subscribed to ${plan.name} plan!`);
        onSubscribe?.(planId);
      },
      prefill: {},
      theme: { color: '#0ea5e9' },
    };

    // Check if Razorpay is loaded
    if ((window as any).Razorpay) {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      toast.error('Payment system loading... please try again.');
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-12"
    >
      <BackgroundCarousel />

      <div className="relative z-10 max-w-6xl mx-auto pt-16">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10">
          <Crown className="w-14 h-14 text-warning mx-auto mb-3" />
          <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient-hero mb-3">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Unlock the full power of AI-powered trip planning
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {plans.slice(0, 4).map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass rounded-2xl p-6 border-2 relative transition-all duration-300 hover:shadow-glow ${
                plan.popular ? 'border-warning shadow-glow lg:scale-105' : plan.color
              } ${currentPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-warning text-warning-foreground text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="text-center mb-4">
                <div className="text-primary mb-2">{plan.icon}</div>
                <h3 className="text-xl font-display font-bold text-foreground">{plan.name}</h3>
                <p className="text-3xl font-display font-bold text-foreground mt-2">{plan.priceLabel}</p>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={currentPlan === plan.id}
                className={`w-full rounded-xl ${
                  plan.popular
                    ? 'bg-warning text-warning-foreground hover:bg-warning/90'
                    : 'bg-gradient-hero border-0 text-primary-foreground'
                }`}
              >
                {currentPlan === plan.id ? '✓ Current Plan' : plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Plan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-8 border-2 border-success/50 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-10 h-10 text-success" />
                <div>
                  <h3 className="text-2xl font-display font-bold text-foreground">Enterprise</h3>
                  <p className="text-sm text-muted-foreground">For Tourism Companies — Lifetime Access</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {plans[4].features.map((f, i) => (
                  <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="tel:7569488498" className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="w-4 h-4" /> 7569*****
                </a>
                <a href="mailto:tripgenius@travel.com" className="flex items-center gap-2 text-primary hover:underline">
                  <Mail className="w-4 h-4" /> tripgenius@travel.com
                </a>
              </div>
            </div>
            <Button
              onClick={() => handleSubscribe('enterprise')}
              size="lg"
              className="bg-success text-success-foreground rounded-xl px-8 hover:bg-success/90"
            >
              Contact Sales
            </Button>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={onBack} className="rounded-xl gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
