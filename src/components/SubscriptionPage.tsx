import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Rocket, Star, Zap, Building2, Phone, Mail, ArrowLeft, Globe2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackgroundCarousel from './BackgroundCarousel';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PLANS, INTL_ADDON, ENTERPRISE_MIN_SEATS, normalizePlan, type PlanId } from '@/lib/entitlements';

interface SubscriptionPageProps {
  onBack: () => void;
  currentPlan?: string;
  onSubscribe?: (plan: string) => void;
}

const icons: Record<PlanId, JSX.Element> = {
  free: <Star className="w-8 h-8" />,
  pro: <Zap className="w-8 h-8" />,
  premium: <Crown className="w-8 h-8" />,
  enterprise: <Rocket className="w-8 h-8" />,
};

const borders: Record<PlanId, string> = {
  free: 'border-muted-foreground/30',
  pro: 'border-accent/50',
  premium: 'border-warning/60',
  enterprise: 'border-primary/70',
};

const tags: Partial<Record<PlanId, { label: string; className: string }>> = {
  premium: { label: '⭐ Best Value', className: 'bg-warning text-warning-foreground' },
  enterprise: { label: '🏢 For Teams', className: 'bg-primary text-primary-foreground' },
};

export default function SubscriptionPage({ onBack, currentPlan = 'free', onSubscribe }: SubscriptionPageProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const active = normalizePlan(currentPlan);

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const pay = async (id: string, name: string, amount: number, onDone: () => void) => {
    setLoading(id);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment system. Please try again.');
        setLoading(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { planId: id, planName: name, amount },
      });

      if (error || data?.error) {
        toast.error(data?.error || 'Failed to create payment order');
        setLoading(null);
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        amount: amount * 100,
        currency: 'INR',
        name: 'TripGenius',
        description: `${name} — ₹${amount}/mo`,
        order_id: data.orderId,
        handler: () => {
          toast.success(`${name} activated 🎉`);
          onDone();
        },
        theme: { color: '#0ea5e9' },
        modal: { ondismiss: () => setLoading(null) },
      });
      rzp.on('payment.failed', (r: any) => {
        toast.error(`Payment failed: ${r.error.description}`);
        setLoading(null);
      });
      rzp.open();
    } catch (e) {
      console.error('Payment error:', e);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleSubscribe = async (planId: PlanId) => {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan || plan.id === 'free') return;
    if (plan.contactOnly) {
      window.open('mailto:tripgenius@travel.com?subject=Enterprise%20plan%20enquiry', '_blank');
      return;
    }
    await pay(plan.id, `${plan.name} Plan`, plan.price, () => onSubscribe?.(plan.id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen px-4 py-12">
      <BackgroundCarousel />

      <div className="relative z-10 max-w-6xl mx-auto pt-16">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Plan with AI for free — upgrade when you travel more
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient-hero mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Free, Pro, Premium and Enterprise. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {PLANS.map((plan, i) => {
            const tag = tags[plan.id];
            const isCurrent = active === plan.id;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`glass rounded-2xl p-6 border-2 relative transition-all duration-300 hover:shadow-glow flex flex-col ${
                  plan.id === 'premium' ? 'border-warning shadow-glow lg:scale-105' : borders[plan.id]
                } ${isCurrent ? 'ring-2 ring-primary' : ''}`}
              >
                {tag && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold rounded-full whitespace-nowrap ${tag.className}`}>
                    {tag.label}
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="text-primary mb-2 flex justify-center">{icons[plan.id]}</div>
                  <h3 className="text-xl font-display font-bold text-foreground">{plan.name}</h3>
                  <p className="text-3xl font-display font-bold text-foreground mt-2">{plan.priceLabel}</p>
                  <p className="text-xs text-muted-foreground">{plan.priceSubtext}</p>
                  <p className="text-xs text-muted-foreground mt-2 italic">{plan.tagline}</p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.highlights.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || loading === plan.id || plan.id === 'free'}
                  className={`w-full rounded-xl ${
                    plan.id === 'premium'
                      ? 'bg-warning text-warning-foreground hover:bg-warning/90'
                      : isCurrent
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-gradient-hero border-0 text-primary-foreground'
                  }`}
                >
                  {loading === plan.id ? 'Processing...' : isCurrent ? '✓ Current Plan' : plan.cta}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* International add-on */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 border border-accent/40 mb-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <Globe2 className="w-10 h-10 text-accent shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display font-bold text-foreground">{INTL_ADDON.name} — {INTL_ADDON.priceLabel}</h3>
            <p className="text-sm text-muted-foreground">{INTL_ADDON.description}</p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={active !== 'pro' || loading === INTL_ADDON.id}
            onClick={() => pay(INTL_ADDON.id, INTL_ADDON.name, INTL_ADDON.price, () => onSubscribe?.('pro'))}
          >
            {active === 'premium' || active === 'enterprise'
              ? 'Included in your plan'
              : active !== 'pro'
              ? 'Pro plan required'
              : loading === INTL_ADDON.id
              ? 'Processing...'
              : 'Add for ₹199/mo'}
          </Button>
        </motion.div>

        {/* Enterprise detail */}
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
                  <p className="text-sm text-muted-foreground">
                    ₹499 per seat/month · minimum {ENTERPRISE_MIN_SEATS} seats (₹9,980/month) · 15% annual discount
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {[
                  'White-label platform & custom branding',
                  'Custom domain & email branding',
                  'REST API access + OpenAPI docs & sandbox',
                  'Role-based access control',
                  'Organization & employee management',
                  'Travel spend and department analytics',
                  'Quarterly business reviews & SLA support',
                  'Custom pricing for 500+ seats',
                ].map((f, i) => (
                  <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                One-time implementation fee of ₹2,00,000 applies for ERP integrations.
              </p>
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
              onClick={() => window.open('mailto:tripgenius@travel.com?subject=Enterprise%20plan%20enquiry', '_blank')}
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
