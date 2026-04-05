import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Rocket, Star, Zap, Building2, Phone, Mail, ArrowLeft, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackgroundCarousel from './BackgroundCarousel';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
    priceLabel: 'Free Forever',
    priceSubtext: 'No credit card needed',
    icon: <Star className="w-8 h-8" />,
    color: 'border-muted-foreground/30',
    tag: null,
    features: [
      'Full AI trip planning — all days visible',
      'Up to 15-day trips',
      'Budget analysis & dual currency',
      'Export PDF, Email & Share',
      'Unlimited saved trips',
      'Place checkpoints & transport modes',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 199,
    priceLabel: '₹199',
    priceSubtext: 'per month',
    icon: <Zap className="w-8 h-8" />,
    color: 'border-accent/50',
    tag: null,
    features: [
      'Everything in Basic',
      'Up to 30-day trips',
      'Detailed budget pie charts',
      'Flight & hotel price comparisons',
      'Priority AI generation (2× faster)',
      'Ad-free experience',
    ],
    cta: 'Upgrade to Silver',
    popular: false,
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 599,
    priceLabel: '₹599',
    priceSubtext: 'per month',
    icon: <Crown className="w-8 h-8" />,
    color: 'border-warning/60',
    tag: { label: '⭐ Best Value', className: 'bg-warning text-warning-foreground' },
    features: [
      'Everything in Silver',
      'Up to 60-day trips',
      'Real-time taxi fare estimates',
      'Multi-city trip planning',
      'Personalized AI recommendations',
      'Priority customer support',
    ],
    cta: 'Upgrade to Gold',
    popular: true,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 999,
    priceLabel: '₹999',
    priceSubtext: 'per month',
    icon: <Rocket className="w-8 h-8" />,
    color: 'border-primary/70',
    tag: { label: '🚀 Power Users', className: 'bg-primary text-primary-foreground' },
    features: [
      'Everything in Gold',
      'Up to 90-day trips',
      'Real-time price tracking & alerts',
      'Group trip coordination tools',
      'Advanced analytics dashboard',
      'White-label trip sharing',
      'Dedicated account manager',
    ],
    cta: 'Upgrade to Platinum',
    popular: false,
  },
];

export default function SubscriptionPage({ onBack, currentPlan = 'basic', onSubscribe }: SubscriptionPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === 'basic') return;

    const plan = plans.find(p => p.id === planId);
    if (!plan || plan.price <= 0) return;

    setLoading(planId);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment system. Please try again.');
        setLoading(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { planId: plan.id, planName: plan.name, amount: plan.price },
      });

      if (error || data?.error) {
        toast.error(data?.error || 'Failed to create payment order');
        setLoading(null);
        return;
      }

      const options = {
        key: data.keyId,
        amount: plan.price * 100,
        currency: 'INR',
        name: 'TripGenius',
        description: `${plan.name} Plan — ₹${plan.price}/mo`,
        order_id: data.orderId,
        handler: function () {
          toast.success(`Successfully upgraded to ${plan.name}! 🎉`);
          onSubscribe?.(planId);
        },
        prefill: {},
        theme: { color: '#0ea5e9' },
        modal: { ondismiss: () => setLoading(null) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(null);
      });
      rzp.open();
    } catch (e: any) {
      console.error('Payment error:', e);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen px-4 py-12">
      <BackgroundCarousel />

      <div className="relative z-10 max-w-6xl mx-auto pt-16">
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            All core features are free — upgrade for extended capabilities
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient-hero mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No hidden fees. No locked itineraries. Choose the plan that fits your travel style.
          </p>
        </motion.div>

        {/* Plan comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass rounded-2xl p-6 border-2 relative transition-all duration-300 hover:shadow-glow flex flex-col ${
                plan.popular ? 'border-warning shadow-glow lg:scale-105' : plan.color
              } ${currentPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.tag && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold rounded-full whitespace-nowrap ${plan.tag.className}`}>
                  {plan.tag.label}
                </div>
              )}

              <div className="text-center mb-4">
                <div className="text-primary mb-2">{plan.icon}</div>
                <h3 className="text-xl font-display font-bold text-foreground">{plan.name}</h3>
                <p className="text-3xl font-display font-bold text-foreground mt-2">{plan.priceLabel}</p>
                <p className="text-xs text-muted-foreground">{plan.priceSubtext}</p>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={currentPlan === plan.id || loading === plan.id}
                className={`w-full rounded-xl ${
                  plan.popular
                    ? 'bg-warning text-warning-foreground hover:bg-warning/90'
                    : currentPlan === plan.id
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-gradient-hero border-0 text-primary-foreground'
                }`}
              >
                {loading === plan.id ? 'Processing...' : currentPlan === plan.id ? '✓ Current Plan' : plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Enterprise */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-8 border-2 border-muted-foreground/30 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-10 h-10 text-primary" />
                <div>
                  <h3 className="text-2xl font-display font-bold text-foreground">Enterprise</h3>
                  <p className="text-sm text-muted-foreground">For Tourism Companies — Lifetime Access</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  'Lifetime access — no subscription',
                  'Unlimited trips & travelers',
                  'White-label options',
                  'Dedicated account manager',
                  'Custom API integration',
                  'Bulk trip generation',
                  'Analytics dashboard',
                  'Priority support',
                ].map((f, i) => (
                  <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
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
              onClick={() => window.open('mailto:tripgenius@travel.com', '_blank')}
              size="lg"
              className="bg-gradient-hero border-0 text-primary-foreground rounded-xl px-8"
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
