import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, LayoutDashboard, CalendarDays, Wallet, Crown, Download, Mail, Save, Share2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingPage from '@/components/LandingPage';
import RegionSelector from '@/components/RegionSelector';
import TripSetupForm from '@/components/TripSetupForm';
import BudgetPlansPage from '@/components/BudgetPlansPage';
import LoadingScreen from '@/components/LoadingScreen';
import DayItinerary from '@/components/DayItinerary';
import BudgetIntelligence from '@/components/BudgetIntelligence';
import TripDashboard from '@/components/TripDashboard';
import SubscriptionPage from '@/components/SubscriptionPage';
import SavedTripsPage from '@/components/SavedTripsPage';
import AuthButton from '@/components/AuthButton';
import AuthGate from '@/components/AuthGate';
import LanguageSelector from '@/components/LanguageSelector';
import { TripSetup, TripPlan, UserRegion, regionCurrencies } from '@/types/trip';
import { generateMockTripPlan } from '@/data/mockTripData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPlanConfig } from '@/lib/planLimits';
import { toast } from 'sonner';

type AppStep = 'landing' | 'auth' | 'region' | 'setup' | 'budget' | 'loading' | 'plan' | 'subscribe' | 'saved-trips';
type Tab = 'dashboard' | 'itinerary' | 'budget';

const Index = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [step, setStep] = useState<AppStep>('landing');
  const [homeRegion, setHomeRegion] = useState<UserRegion>('india');
  const [tripSetup, setTripSetup] = useState<TripSetup | null>(null);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [userPlan, setUserPlan] = useState<string>('basic');

  const handleGetStarted = () => {
    if (user) {
      setStep('region');
    } else {
      setStep('auth');
    }
  };

  const handleAuthSuccess = () => setStep('region');

  const handleRegionSelect = (region: UserRegion) => {
    setHomeRegion(region);
    setStep('setup');
  };

  const handleTripSetup = (setup: TripSetup) => {
    setTripSetup(setup);
    setStep('budget');
  };

  const handleBudgetSelect = async (budget: number) => {
    if (!tripSetup) return;
    const finalSetup = { ...tripSetup, userBudget: budget };
    setTripSetup(finalSetup);
    setStep('loading');

    try {
      const { data, error } = await supabase.functions.invoke('generate-trip', {
        body: {
          origin: finalSetup.origin,
          destination: finalSetup.destination,
          days: finalSetup.days,
          travelers: finalSetup.travelers,
          userBudget: finalSetup.userBudget,
          currency: finalSetup.currencyCode,
          homeCurrency: finalSetup.homeCurrency,
          homeCurrencyCode: finalSetup.homeCurrencyCode,
          destCurrencySymbol: finalSetup.currency,
          style: finalSetup.style,
          pace: finalSetup.pace,
          startDate: finalSetup.startDate,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setStep('budget');
        return;
      }

      const tripPlan: TripPlan = {
        setup: finalSetup,
        days: data.days || [],
        budget: {
          ...(data.budget || {
            userBudget: finalSetup.userBudget,
            minimumBudget: finalSetup.userBudget * 0.8,
            comfortableBudget: finalSetup.userBudget,
            idealBudget: finalSetup.userBudget * 1.3,
            currency: finalSetup.currency,
            tips: [],
            breakdown: [],
          }),
          homeCurrency: finalSetup.homeCurrency,
        },
        hotels: data.hotels || [],
        flights: data.flights || [],
        returnFlights: data.returnFlights || [],
      };

      setPlan(tripPlan);
      setStep('plan');
      toast.success('Your AI trip plan is ready!');
    } catch (e: any) {
      console.error('AI plan error:', e);
      toast.error('AI planning failed. Using smart fallback...');
      const fallback = generateMockTripPlan(finalSetup);
      setPlan(fallback);
      setStep('plan');
    }
  };

  const planConfig = getPlanConfig(userPlan);

  // Free users see only first half of days
  const getFreeDays = () => {
    if (!plan) return 0;
    return Math.ceil(plan.days.length / 2);
  };

  const isLockedDay = (dayIndex: number) => {
    if (planConfig.allDaysUnlocked) return false;
    return dayIndex >= getFreeDays();
  };

  const handleExportPdf = () => {
    if (!planConfig.canExportPdf) {
      toast.error('PDF export is available on Gold plan and above. Upgrade to unlock!');
      setStep('subscribe');
      return;
    }
    window.print();
    toast.success('Print dialog opened! Save as PDF from there.');
  };

  const handleEmailTrip = () => {
    if (!planConfig.canEmailTrip || !plan) {
      toast.error('Email sharing is available on Gold plan and above. Upgrade to unlock!');
      setStep('subscribe');
      return;
    }
    const subject = encodeURIComponent(`Trip Plan: ${plan.setup.origin} → ${plan.setup.destination}`);
    const body = encodeURIComponent(
      `Check out my trip plan!\n\n` +
      `📍 ${plan.setup.origin} → ${plan.setup.destination}\n` +
      `📅 ${plan.days.length} days starting ${plan.setup.startDate}\n` +
      `👥 ${plan.setup.travelers} travelers\n` +
      `💰 Budget: ${plan.setup.homeCurrency}${plan.budget.userBudget.toLocaleString()}\n\n` +
      `Day-by-day highlights:\n` +
      plan.days.slice(0, planConfig.allDaysUnlocked ? plan.days.length : getFreeDays()).map(d =>
        `Day ${d.day}: ${d.title} - ${d.places.map(p => p.name).join(', ')}`
      ).join('\n') +
      `\n\nPlanned with TripGenius ✈️`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success('Email composer opened!');
  };

  const handleWhatsAppShare = () => {
    if (!planConfig.canEmailTrip || !plan) {
      toast.error('Sharing is available on Gold plan and above. Upgrade to unlock!');
      setStep('subscribe');
      return;
    }
    const text = encodeURIComponent(
      `🌍 *My Trip Plan*\n\n` +
      `📍 ${plan.setup.origin} → ${plan.setup.destination}\n` +
      `📅 ${plan.days.length} days starting ${plan.setup.startDate}\n` +
      `👥 ${plan.setup.travelers} travelers\n` +
      `💰 Budget: ${plan.setup.homeCurrency}${plan.budget.userBudget.toLocaleString()}\n\n` +
      `*Day-by-day highlights:*\n` +
      plan.days.slice(0, planConfig.allDaysUnlocked ? plan.days.length : getFreeDays()).map(d =>
        `📌 Day ${d.day}: ${d.title} - ${d.places.slice(0, 3).map(p => p.name).join(', ')}`
      ).join('\n') +
      `\n\n✈️ Planned with TripGenius`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success('WhatsApp opened!');
  };

  const handleSaveTrip = async () => {
    if (!plan || !user) {
      toast.error('Please sign in to save trips.');
      return;
    }
    if (planConfig.savedTripsLimit === 0) {
      toast.error('Saving trips requires Silver plan or above. Upgrade to unlock!');
      setStep('subscribe');
      return;
    }

    try {
      // Check existing saved trips count
      if (planConfig.savedTripsLimit > 0) {
        const { count } = await supabase
          .from('saved_trips')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (count !== null && count >= planConfig.savedTripsLimit) {
          toast.error(`You've reached your limit of ${planConfig.savedTripsLimit} saved trips. Upgrade for more!`);
          setStep('subscribe');
          return;
        }
      }

      const { error } = await supabase.from('saved_trips').insert({
        user_id: user.id,
        plan_id: userPlan,
        trip_name: `${plan.setup.origin} → ${plan.setup.destination}`,
        origin: plan.setup.origin,
        destination: plan.setup.destination,
        start_date: plan.setup.startDate,
        days: plan.days.length,
        travelers: plan.setup.travelers,
        trip_data: plan as any,
      });

      if (error) throw error;
      toast.success('Trip saved successfully! 🎉');
    } catch (e: any) {
      console.error('Save trip error:', e);
      toast.error('Failed to save trip. Please try again.');
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'itinerary', label: t('itinerary'), icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'budget', label: t('budget'), icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(step === 'plan' || step === 'budget' || step === 'setup' || step === 'subscribe') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (step === 'plan') setStep('budget');
                  else if (step === 'budget') setStep('setup');
                  else if (step === 'setup') setStep('region');
                  else if (step === 'subscribe') setStep('plan');
                }}
                className="text-muted-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-display font-bold text-gradient-hero">
                {step === 'plan' && plan ? plan.setup.destination : t('appName')}
              </h1>
              {step === 'plan' && plan && (
                <p className="text-xs text-muted-foreground">
                  {plan.setup.origin} → {plan.setup.destination} · {plan.days.length} {t('days')} · {plan.setup.travelers} {t('travelers')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step === 'plan' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveTrip}
                className="gap-1"
              >
                <Save className="w-4 h-4" />
                Save
                {planConfig.savedTripsLimit === 0 && <Crown className="w-3 h-3 text-warning" />}
              </Button>
            )}
            {step === 'plan' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('subscribe')}
                className="text-warning gap-1"
              >
                <Crown className="w-4 h-4" />
                {userPlan === 'basic' ? 'Upgrade' : userPlan}
              </Button>
            )}
            <LanguageSelector />
            <AuthButton />
          </div>
        </div>

        {step === 'plan' && (
          <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className={step === 'plan' ? 'max-w-5xl mx-auto px-4 py-8 pt-28' : ''}>
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <LandingPage key="landing" onGetStarted={handleGetStarted} />
          )}

          {step === 'auth' && (
            <AuthGate key="auth" onSuccess={handleAuthSuccess} onBack={() => setStep('landing')} />
          )}

          {step === 'region' && (
            <RegionSelector key="region" onSelect={handleRegionSelect} />
          )}

          {step === 'setup' && (
            <TripSetupForm
              key="setup"
              homeRegion={homeRegion}
              onSubmit={handleTripSetup}
              onBack={() => setStep('region')}
            />
          )}

          {step === 'budget' && tripSetup && (
            <BudgetPlansPage
              key="budget"
              setup={tripSetup}
              onSelectBudget={handleBudgetSelect}
              onBack={() => setStep('setup')}
            />
          )}

          {step === 'loading' && tripSetup && (
            <LoadingScreen key="loading" origin={tripSetup.origin} destination={tripSetup.destination} />
          )}

          {step === 'subscribe' && (
            <SubscriptionPage
              key="subscribe"
              onBack={() => setStep('plan')}
              currentPlan={userPlan}
              onSubscribe={(p) => { setUserPlan(p); setStep('plan'); }}
            />
          )}

          {step === 'plan' && plan && (
            <div key="plan">
              {activeTab === 'dashboard' && <TripDashboard plan={plan} />}
              {activeTab === 'itinerary' && (
                <div className="space-y-4">
                  {/* Action buttons for paid features */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPdf}
                      className={`gap-1.5 rounded-xl ${!planConfig.canExportPdf ? 'opacity-50' : ''}`}
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                      {!planConfig.canExportPdf && <Crown className="w-3 h-3 text-warning" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEmailTrip}
                      className={`gap-1.5 rounded-xl ${!planConfig.canEmailTrip ? 'opacity-50' : ''}`}
                    >
                      <Mail className="w-4 h-4" />
                      Email Trip
                      {!planConfig.canEmailTrip && <Crown className="w-3 h-3 text-warning" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleWhatsAppShare}
                      className={`gap-1.5 rounded-xl ${!planConfig.canEmailTrip ? 'opacity-50' : ''}`}
                    >
                      <Share2 className="w-4 h-4" />
                      WhatsApp
                      {!planConfig.canEmailTrip && <Crown className="w-3 h-3 text-warning" />}
                    </Button>
                  </div>
                  {plan.days.map((day, i) => (
                    <DayItinerary
                      key={day.day}
                      dayPlan={day}
                      currency={plan.budget.currency}
                      homeCurrency={plan.setup.homeCurrency}
                      isLocked={isLockedDay(i)}
                      onSubscribe={() => setStep('subscribe')}
                    />
                  ))}
                </div>
              )}
              {activeTab === 'budget' && <BudgetIntelligence budget={plan.budget} />}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
