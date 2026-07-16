import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, LayoutDashboard, CalendarDays, Wallet, Download, Mail, Save, Share2, FolderOpen, Link2, Crown, Map as MapIcon } from 'lucide-react';
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
import TripPreferences from '@/components/TripPreferences';
import OnboardingFlow from '@/components/OnboardingFlow';
import DayEditor from '@/components/DayEditor';
import LiveMapScreen from '@/components/LiveMapScreen';
import LockedOverlay from '@/components/LockedOverlay';
import AuthButton from '@/components/AuthButton';
import AuthGate from '@/components/AuthGate';
import LanguageSelector from '@/components/LanguageSelector';
import { TripSetup, TripPlan, UserRegion } from '@/types/trip';
import { SampleTrip } from '@/data/sampleTrips';
import { generateMockTripPlan } from '@/data/mockTripData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { canAccess, FREE_DAYS_VISIBLE } from '@/lib/entitlements';
import { toast } from 'sonner';

type AppStep = 'landing' | 'auth' | 'onboarding' | 'region' | 'setup' | 'budget' | 'preferences' | 'loading' | 'plan' | 'subscribe' | 'saved-trips' | 'day-editor' | 'live-map';
type Tab = 'dashboard' | 'itinerary' | 'budget' | 'map';

const Index = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile, update: updateProfile } = useProfile();
  const [step, setStep] = useState<AppStep>('landing');
  const [homeRegion, setHomeRegion] = useState<UserRegion>('india');
  const [tripSetup, setTripSetup] = useState<TripSetup | null>(null);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [pdfExportedForTrip, setPdfExportedForTrip] = useState(false);
  const [currentSavedTripId, setCurrentSavedTripId] = useState<string | null>(null);
  const [samplePrefill, setSamplePrefill] = useState<SampleTrip | null>(null);

  const userPlan = profile?.plan ?? 'basic';

  const handleGetStarted = () => {
    if (!user) return setStep('auth');
    if (profile && !profile.has_completed_onboarding) return setStep('onboarding');
    setStep('region');
  };

  const handlePlanFromSample = (trip: SampleTrip) => {
    setSamplePrefill(trip);
    if (!user) return setStep('auth');
    if (profile && !profile.has_completed_onboarding) return setStep('onboarding');
    setStep('setup');
  };

  const handleAuthSuccess = () => {
    if (profile && !profile.has_completed_onboarding) setStep('onboarding');
    else setStep('region');
  };

  const handleRegionSelect = (region: UserRegion) => { setHomeRegion(region); setStep('setup'); };
  const handleTripSetup = (setup: TripSetup) => { setTripSetup(setup); setStep('budget'); };
  const handleBudgetSelect = async (budget: number) => {
    if (!tripSetup) return;
    setTripSetup({ ...tripSetup, userBudget: budget });
    setStep('preferences');
  };

  const generateTrip = async (places: string[] = [], custom: string[] = []) => {
    if (!tripSetup) return;
    setStep('loading');
    try {
      const { data, error } = await supabase.functions.invoke('generate-trip', {
        body: {
          origin: tripSetup.origin, destination: tripSetup.destination, days: tripSetup.days,
          travelers: tripSetup.travelers, travelerBreakdown: tripSetup.travelerBreakdown,
          userBudget: tripSetup.userBudget, currency: tripSetup.currencyCode,
          homeCurrency: tripSetup.homeCurrency, homeCurrencyCode: tripSetup.homeCurrencyCode,
          destCurrencySymbol: tripSetup.currency, tripType: tripSetup.tripType, pace: tripSetup.pace,
          startDate: tripSetup.startDate, selectedPlaces: places, customPlaces: custom,
        },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); setStep('preferences'); return; }

      const aiDays = data.days || [];
      if (aiDays.length < tripSetup.days) {
        toast.warning(`AI generated ${aiDays.length} of ${tripSetup.days} days.`);
      }
      const tripPlan: TripPlan = {
        setup: tripSetup, days: aiDays,
        budget: {
          ...(data.budget || {
            userBudget: tripSetup.userBudget,
            minimumBudget: tripSetup.userBudget * 0.8,
            comfortableBudget: tripSetup.userBudget,
            idealBudget: tripSetup.userBudget * 1.3,
            currency: tripSetup.currency, tips: [], breakdown: [],
          }),
          homeCurrency: tripSetup.homeCurrency,
        },
        hotels: data.hotels || [], flights: data.flights || [], returnFlights: data.returnFlights || [],
      };
      setPlan(tripPlan);
      setPdfExportedForTrip(false);
      setCurrentSavedTripId(null);
      setStep('plan');
      toast.success('Your trip plan is ready!');
    } catch (e) {
      console.error('AI plan error:', e);
      toast.error('AI planning failed. Using smart fallback...');
      const fallback = generateMockTripPlan(tripSetup);
      setPlan(fallback); setStep('plan');
    }
  };

  const handleExportPdf = () => {
    if (!canAccess(userPlan, 'unlimitedPdf') && pdfExportedForTrip) {
      toast.error('Free PDF export used for this trip. Upgrade for unlimited exports.');
      return;
    }
    window.print();
    setPdfExportedForTrip(true);
    if (currentSavedTripId) {
      supabase.from('saved_trips').update({ pdf_exported_once: true }).eq('id', currentSavedTripId);
    }
    toast.success('Print dialog opened.');
  };

  const handleEmailTrip = () => {
    if (!plan) return;
    const subject = encodeURIComponent(`Trip Plan: ${plan.setup.origin} → ${plan.setup.destination}`);
    const body = encodeURIComponent(
      `Check out my trip plan!\n\n📍 ${plan.setup.origin} → ${plan.setup.destination}\n📅 ${plan.days.length} days\n\n` +
      plan.days.map(d => `Day ${d.day}: ${d.title}`).join('\n') + `\n\nPlanned with TripGenius ✈️`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShare = async () => {
    if (!plan) return;
    if (!canAccess(userPlan, 'shareTrip')) { setStep('subscribe'); return; }
    const shareText = `🌍 ${plan.setup.origin} → ${plan.setup.destination} · ${plan.days.length} days · Planned with TripGenius`;
    if (navigator.share) {
      try { await navigator.share({ title: 'My Trip', text: shareText }); } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard!');
    }
  };

  const handleShareLink = async () => {
    if (!plan || !user) return;
    if (!canAccess(userPlan, 'shareTrip')) { setStep('subscribe'); return; }
    try {
      const { data, error } = await supabase.from('shared_trips').insert({
        created_by: user.id, trip_name: `${plan.setup.origin} → ${plan.setup.destination}`,
        origin: plan.setup.origin, destination: plan.setup.destination, trip_data: plan as any,
      }).select('share_id').single();
      if (error) throw error;
      const url = `${window.location.origin}/shared/${data.share_id}`;
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied! 🔗');
    } catch (e) { toast.error('Failed to create share link.'); }
  };

  const handleSaveTrip = async () => {
    if (!plan || !user) return;
    if (!canAccess(userPlan, 'saveTrip')) { setStep('subscribe'); return; }
    try {
      const { data, error } = await supabase.from('saved_trips').insert({
        user_id: user.id, plan_id: userPlan,
        trip_name: `${plan.setup.origin} → ${plan.setup.destination}`,
        origin: plan.setup.origin, destination: plan.setup.destination,
        start_date: plan.setup.startDate, days: plan.days.length,
        travelers: plan.setup.travelers, trip_data: plan as any,
      }).select('id').single();
      if (error) throw error;
      setCurrentSavedTripId(data.id);
      toast.success('Trip saved! 🎉');
    } catch (e) { toast.error('Failed to save trip.'); }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'itinerary', label: t('itinerary'), icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'map', label: 'Live Map', icon: <MapIcon className="w-4 h-4" /> },
    { id: 'budget', label: t('budget'), icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {['plan','budget','setup','subscribe','saved-trips','preferences','day-editor'].includes(step) && (
              <Button variant="ghost" size="icon" onClick={() => {
                if (step === 'plan') setStep('budget');
                else if (step === 'preferences') setStep('budget');
                else if (step === 'budget') setStep('setup');
                else if (step === 'setup') setStep('region');
                else if (step === 'subscribe') setStep(plan ? 'plan' : 'region');
                else if (step === 'saved-trips') setStep('region');
                else if (step === 'day-editor') setStep('plan');
              }} className="text-muted-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-display font-bold text-gradient-hero">
                {step === 'plan' && plan ? plan.setup.destination : t('appName')}
              </h1>
              {step === 'plan' && plan && (
                <p className="text-xs text-muted-foreground">
                  {plan.setup.origin} → {plan.setup.destination} · {plan.days.length} {t('days')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && ['region','setup','plan'].includes(step) && (
              <Button variant="ghost" size="sm" onClick={() => setStep('saved-trips')} className="gap-1">
                <FolderOpen className="w-4 h-4" /> My Trips
              </Button>
            )}
            {user && ['plan','region','setup'].includes(step) && (
              <Button variant="ghost" size="sm" onClick={() => setStep('subscribe')} className="gap-1 text-warning">
                <Crown className="w-4 h-4" /> Upgrade
              </Button>
            )}
            {step === 'plan' && (
              <Button variant="ghost" size="sm" onClick={handleSaveTrip} className="gap-1">
                <Save className="w-4 h-4" /> Save
              </Button>
            )}
            <LanguageSelector />
            <AuthButton />
          </div>
        </div>

        {step === 'plan' && (
          <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-glow' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className={step === 'plan' ? 'max-w-5xl mx-auto px-4 py-8 pt-28' : ''}>
        <AnimatePresence mode="wait">
          {step === 'landing' && <LandingPage key="landing" onGetStarted={handleGetStarted} />}
          {step === 'auth' && <AuthGate key="auth" onSuccess={handleAuthSuccess} onBack={() => setStep('landing')} />}
          {step === 'onboarding' && (
            <OnboardingFlow key="onboarding" onComplete={() => setStep('region')} onUpgrade={() => setStep('subscribe')} />
          )}
          {step === 'region' && <RegionSelector key="region" onSelect={handleRegionSelect} />}
          {step === 'setup' && (
            <TripSetupForm key="setup" homeRegion={homeRegion} onSubmit={handleTripSetup} onBack={() => setStep('region')} />
          )}
          {step === 'budget' && tripSetup && (
            <BudgetPlansPage key="budget" setup={tripSetup} onSelectBudget={handleBudgetSelect} onBack={() => setStep('setup')} />
          )}
          {step === 'preferences' && tripSetup && (
            <TripPreferences key="preferences" destination={tripSetup.destination}
              onSubmit={(places, custom) => generateTrip(places, custom)}
              onSkip={() => generateTrip()} onBack={() => setStep('budget')} />
          )}
          {step === 'loading' && tripSetup && (
            <LoadingScreen key="loading" origin={tripSetup.origin} destination={tripSetup.destination} />
          )}
          {step === 'subscribe' && (
            <SubscriptionPage key="subscribe" onBack={() => setStep(plan ? 'plan' : 'region')} currentPlan={userPlan}
              onSubscribe={async (newPlan?: string) => {
                if (newPlan) await updateProfile({ plan: newPlan });
                setStep(plan ? 'plan' : 'region');
              }} />
          )}
          {step === 'saved-trips' && (
            <SavedTripsPage key="saved-trips" onBack={() => setStep('region')}
              onLoadTrip={(tripPlan) => { setPlan(tripPlan); setTripSetup(tripPlan.setup); setStep('plan'); }} />
          )}
          {step === 'day-editor' && plan && editingDay != null && (
            <DayEditor key="day-editor" plan={plan} dayNumber={editingDay}
              onSave={(next) => setPlan(next)} onBack={() => setStep('plan')} />
          )}

          {step === 'plan' && plan && (
            <div key="plan">
              {activeTab === 'dashboard' && <TripDashboard plan={plan} onViewItinerary={() => setActiveTab('itinerary')} />}
              {activeTab === 'itinerary' && (
                <div className="space-y-4">
                  <div className="flex gap-2 justify-end flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-1.5 rounded-xl"
                      disabled={!canAccess(userPlan, 'unlimitedPdf') && pdfExportedForTrip}>
                      <Download className="w-4 h-4" />
                      {!canAccess(userPlan, 'unlimitedPdf') && pdfExportedForTrip ? 'PDF used' : 'Export PDF'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleEmailTrip} className="gap-1.5 rounded-xl">
                      <Mail className="w-4 h-4" /> Email Trip
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 rounded-xl">
                      <Share2 className="w-4 h-4" /> Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShareLink} className="gap-1.5 rounded-xl">
                      <Link2 className="w-4 h-4" /> Copy Link
                    </Button>
                  </div>

                  {!canAccess(userPlan, 'unlimitedPdf') && (
                    <p className="text-xs text-muted-foreground text-right">
                      Free tier: 1 PDF export per trip. Save & Share require Premium.
                    </p>
                  )}

                  {plan.days.map((day, i) => {
                    const locked = !canAccess(userPlan, 'fullItinerary') && i >= FREE_DAYS_VISIBLE;
                    if (locked) {
                      return (
                        <LockedOverlay key={day.day} feature="fullItinerary" onUnlock={() => setStep('subscribe')}>
                          <DayItinerary dayPlan={day} currency={plan.budget.currency} homeCurrency={plan.setup.homeCurrency} />
                        </LockedOverlay>
                      );
                    }
                    return (
                      <div key={day.day} className="relative">
                        <DayItinerary dayPlan={day} currency={plan.budget.currency} homeCurrency={plan.setup.homeCurrency} />
                        {canAccess(userPlan, 'dayEditing') && (
                          <button
                            onClick={() => { setEditingDay(day.day); setStep('day-editor'); }}
                            className="absolute top-3 right-16 text-xs text-primary hover:underline"
                          >
                            ✎ Edit day
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {activeTab === 'map' && (
                <LiveMapScreen plan={plan} userPlan={userPlan} onUpgrade={() => setStep('subscribe')} />
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
