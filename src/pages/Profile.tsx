import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Plane, Utensils, Accessibility, BookMarked, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { getPlanMeta } from '@/lib/entitlements';
import { useSeo } from '@/hooks/useSeo';
import { toast } from 'sonner';

const DIETARY = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Jain', 'Gluten-free', 'Nut allergy', 'No beef', 'No pork'];
const ACCESS = ['Wheelchair access', 'Step-free routes', 'Elevator required', 'Low-walking days', 'Sign language', 'Visual assistance'];
const INTERESTS = ['Beaches', 'Mountains', 'History', 'Food', 'Nightlife', 'Shopping', 'Wildlife', 'Adventure', 'Spiritual', 'Art & museums', 'Road trips', 'Family friendly'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'JPY', 'THB'];

function Chips({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            value.includes(o)
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary/60 text-muted-foreground border-border hover:border-primary/50'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, update } = useProfile();
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useSeo({
    title: 'Your Traveller Profile | TripGenius',
    description: 'Manage your travel preferences, passport details, home city, currency and accessibility needs on TripGenius.',
    noIndex: true,
  });

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/');
  }, [authLoading, user, navigate]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await update({
        full_name: form.full_name || null,
        phone: form.phone || null,
        home_city: form.home_city || null,
        preferred_currency: form.preferred_currency || 'INR',
        default_airport: form.default_airport || null,
        nationality: form.nationality || null,
        visa_notes: form.visa_notes || null,
        dietary_preferences: form.dietary_preferences ?? [],
        accessibility_needs: form.accessibility_needs ?? [],
        travel_interests: form.travel_interests ?? [],
        passport_number: form.passport_number || null,
        passport_expiry: form.passport_expiry || null,
        show_name_to_companions: !!form.show_name_to_companions,
      });
      toast.success('Profile saved');
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading your profile…</div>;
  }

  const planMeta = getPlanMeta(profile.plan);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to app
          </Link>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
            {planMeta.name} plan
          </span>
        </div>

        <header>
          <h1 className="text-3xl font-display font-bold text-gradient-hero">Traveller Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            These details personalise every itinerary, budget and booking suggestion we generate for you.
          </p>
        </header>

        <section className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Basics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Full name</Label><Input value={form.full_name ?? ''} onChange={(e) => set('full_name', e.target.value)} placeholder="Ashraf Ahmed" /></div>
            <div><Label>Phone</Label><Input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" /></div>
            <div><Label>Email</Label><Input value={user?.email ?? ''} disabled /></div>
            <div><Label>Home city</Label><Input value={form.home_city ?? ''} onChange={(e) => set('home_city', e.target.value)} placeholder="Hyderabad" /></div>
          </div>
        </section>

        <section className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold flex items-center gap-2"><Plane className="w-4 h-4 text-primary" /> Travel defaults</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Preferred currency</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.preferred_currency ?? 'INR'}
                onChange={(e) => set('preferred_currency', e.target.value)}
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><Label>Default departure airport</Label><Input value={form.default_airport ?? ''} onChange={(e) => set('default_airport', e.target.value)} placeholder="HYD" /></div>
            <div><Label>Nationality</Label><Input value={form.nationality ?? ''} onChange={(e) => set('nationality', e.target.value)} placeholder="Indian" /></div>
          </div>
          <div>
            <Label>Visa notes</Label>
            <Textarea value={form.visa_notes ?? ''} onChange={(e) => set('visa_notes', e.target.value)} placeholder="Existing visas, residency permits, previous refusals…" rows={2} />
          </div>
        </section>

        <section className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Passport</h2>
          <p className="text-xs text-muted-foreground">Stored privately against your account and never shared with other travellers.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Passport number</Label><Input value={form.passport_number ?? ''} onChange={(e) => set('passport_number', e.target.value)} placeholder="X1234567" /></div>
            <div><Label>Expiry date</Label><Input type="date" value={form.passport_expiry ?? ''} onChange={(e) => set('passport_expiry', e.target.value)} /></div>
          </div>
        </section>

        <section className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold flex items-center gap-2"><BookMarked className="w-4 h-4 text-primary" /> Travel interests</h2>
          <Chips options={INTERESTS} value={form.travel_interests ?? []} onChange={(v) => set('travel_interests', v)} />
        </section>

        <section className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold flex items-center gap-2"><Utensils className="w-4 h-4 text-primary" /> Dietary preferences</h2>
          <Chips options={DIETARY} value={form.dietary_preferences ?? []} onChange={(v) => set('dietary_preferences', v)} />
        </section>

        <section className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold flex items-center gap-2"><Accessibility className="w-4 h-4 text-primary" /> Accessibility needs</h2>
          <Chips options={ACCESS} value={form.accessibility_needs ?? []} onChange={(v) => set('accessibility_needs', v)} />
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-sm font-medium">Show my name to travel companions</p>
              <p className="text-xs text-muted-foreground">Off by default. Turn on to be discoverable on shared trips.</p>
            </div>
            <Switch checked={!!form.show_name_to_companions} onCheckedChange={(v) => set('show_name_to_companions', v)} />
          </div>
        </section>

        <div className="flex justify-end pb-10">
          <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2 bg-gradient-hero border-0 text-primary-foreground">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
