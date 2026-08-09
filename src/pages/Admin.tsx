import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Users, Map, Wallet, Search, Crown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { PLANS, normalizePlan } from '@/lib/entitlements';
import { useSeo } from '@/hooks/useSeo';
import { toast } from 'sonner';

interface AdminProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  home_city: string | null;
  plan: string;
  created_at: string;
}

interface AdminTrip {
  id: string;
  user_id: string;
  trip_name: string;
  origin: string;
  destination: string;
  days: number;
  created_at: string;
}

interface AdminReview {
  id: string;
  rating: number;
  body: string;
  status: string;
  photo_urls: string[];
  created_at: string;
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [appReviews, setAppReviews] = useState<AdminReview[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  useSeo({ title: 'Admin Console | TripGenius', description: 'TripGenius administration console.', noIndex: true });

  useEffect(() => {
    if (!authLoading && !user) navigate('/');
  }, [authLoading, user, navigate]);

  const loadAll = async () => {
    const [p, t, r, e] = await Promise.all([
      supabase.from('profiles').select('id, full_name, phone, home_city, plan, created_at').order('created_at', { ascending: false }),
      supabase.from('saved_trips').select('id, user_id, trip_name, origin, destination, days, created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('user_roles').select('user_id, role').eq('role', 'admin' as never),
      supabase.from('trip_expenses').select('amount'),
    ]);
    setProfiles((p.data as unknown as AdminProfile[]) ?? []);
    setTrips((t.data as unknown as AdminTrip[]) ?? []);
    setAdmins(((r.data as any[]) ?? []).map((x) => x.user_id));
    setExpenseTotal(((e.data as any[]) ?? []).reduce((s, x) => s + Number(x.amount || 0), 0));
  };

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return profiles;
    return profiles.filter(
      (p) =>
        p.id.includes(needle) ||
        (p.full_name ?? '').toLowerCase().includes(needle) ||
        (p.home_city ?? '').toLowerCase().includes(needle)
    );
  }, [profiles, q]);

  const setPlan = async (id: string, plan: string) => {
    setBusy(true);
    const { error } = await supabase.from('profiles').update({ plan } as never).eq('id', id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success('Plan updated');
    loadAll();
  };

  const toggleAdmin = async (id: string) => {
    setBusy(true);
    const isCurrently = admins.includes(id);
    const { error } = isCurrently
      ? await supabase.from('user_roles').delete().eq('user_id', id).eq('role', 'admin' as never)
      : await supabase.from('user_roles').insert({ user_id: id, role: 'admin' } as never);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(isCurrently ? 'Admin access revoked' : 'Admin access granted');
    loadAll();
  };

  const deleteTrip = async (id: string) => {
    const { error } = await supabase.from('saved_trips').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Trip deleted');
    loadAll();
  };

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Checking access…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-display font-bold">Admin access required</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Your account doesn't have the admin role. Ask an existing administrator to grant it.
        </p>
        <Link to="/"><Button variant="outline" className="rounded-xl gap-2"><ArrowLeft className="w-4 h-4" /> Back to app</Button></Link>
      </div>
    );
  }

  const stats = [
    { label: 'Users', value: profiles.length, icon: <Users className="w-5 h-5" /> },
    { label: 'Saved trips', value: trips.length, icon: <Map className="w-5 h-5" /> },
    { label: 'Paid users', value: profiles.filter((p) => normalizePlan(p.plan) !== 'free').length, icon: <Crown className="w-5 h-5" /> },
    { label: 'Tracked spend', value: `₹${expenseTotal.toLocaleString('en-IN')}`, icon: <Wallet className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to app
          </Link>
          <span className="text-xs px-3 py-1 rounded-full bg-destructive/10 text-destructive font-semibold">Admin console</span>
        </div>

        <h1 className="text-3xl font-display font-bold text-gradient-hero">Administration</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="text-primary mb-2">{s.icon}</div>
              <p className="text-2xl font-display font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <section className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-display font-bold">Users & subscriptions</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, city or id" className="pl-9 w-64" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">City</th>
                  <th className="py-2 pr-3">Plan</th>
                  <th className="py-2 pr-3">Joined</th>
                  <th className="py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-2 pr-3">
                      <p className="font-medium">{p.full_name || 'Unnamed traveller'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.id.slice(0, 8)}…</p>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{p.home_city || '—'}</td>
                    <td className="py-2 pr-3">
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        value={normalizePlan(p.plan)}
                        disabled={busy}
                        onChange={(e) => setPlan(p.id, e.target.value)}
                      >
                        {PLANS.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-2">
                      <Button size="sm" variant={admins.includes(p.id) ? 'default' : 'outline'} disabled={busy} onClick={() => toggleAdmin(p.id)} className="text-xs h-8">
                        {admins.includes(p.id) ? 'Admin' : 'Make admin'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-display font-bold">Recent trips</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2 pr-3">Trip</th>
                  <th className="py-2 pr-3">Route</th>
                  <th className="py-2 pr-3">Days</th>
                  <th className="py-2 pr-3">Created</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id} className="border-b border-border/50">
                    <td className="py-2 pr-3 font-medium">{t.trip_name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{t.origin} → {t.destination}</td>
                    <td className="py-2 pr-3">{t.days}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="py-2">
                      <Button size="sm" variant="ghost" className="text-destructive h-8" onClick={() => deleteTrip(t.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {trips.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No trips saved yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
