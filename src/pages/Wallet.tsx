import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet as WalletIcon, Gift, Ticket, Users, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSeo } from '@/hooks/useSeo';
import { toast } from 'sonner';

interface Txn {
  id: string;
  amount: number;
  currency: string;
  description: string;
  kind: string;
  created_at: string;
}

interface Referral {
  code: string;
  signups: number;
}

export default function Wallet() {
  const { user, loading: authLoading } = useAuth();
  const [txns, setTxns] = useState<Txn[]>([]);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [promo, setPromo] = useState('');
  const [busy, setBusy] = useState(false);

  useSeo({
    title: 'Wallet, Rewards & Referrals | TripGenius',
    description: 'Track your TripGenius wallet balance, reward points, promo code redemptions and referral earnings in one place.',
  });

  const load = useCallback(async () => {
    if (!user) return;
    const [t, r] = await Promise.all([
      supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('referrals').select('code, signups').eq('user_id', user.id).maybeSingle(),
    ]);
    setTxns((t.data as unknown as Txn[]) ?? []);
    if (r.data) {
      setReferral(r.data as unknown as Referral);
    } else {
      const code = `TG${user.id.slice(0, 6).toUpperCase()}`;
      const { data: created } = await supabase
        .from('referrals')
        .insert({ user_id: user.id, code } as never)
        .select('code, signups')
        .maybeSingle();
      setReferral((created as unknown as Referral) ?? null);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const balance = txns.reduce((s, t) => s + Number(t.amount || 0), 0);

  const redeem = async () => {
    if (!user || !promo.trim()) return;
    setBusy(true);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promo.trim().toUpperCase())
      .eq('active', true)
      .maybeSingle();
    if (error || !data) {
      setBusy(false);
      return toast.error('That promo code is not valid');
    }
    const p = data as unknown as {
      id: string; discount_flat: number | null; discount_percent: number | null;
      currency: string; max_uses: number | null; used_count: number; expires_at: string | null; description: string | null;
    };
    if (p.expires_at && new Date(p.expires_at) < new Date()) {
      setBusy(false);
      return toast.error('This promo code has expired');
    }
    if (p.max_uses != null && p.used_count >= p.max_uses) {
      setBusy(false);
      return toast.error('This promo code has been fully redeemed');
    }
    const { error: rErr } = await supabase.from('promo_redemptions').insert({ promo_id: p.id, user_id: user.id } as never);
    if (rErr) {
      setBusy(false);
      return toast.error(rErr.message.includes('duplicate') ? 'You already used this code' : rErr.message);
    }
    const credit = p.discount_flat ?? 0;
    if (credit > 0) {
      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        amount: credit,
        currency: p.currency,
        kind: 'promo',
        description: `Promo ${promo.trim().toUpperCase()}${p.description ? ` — ${p.description}` : ''}`,
      } as never);
    }
    setBusy(false);
    setPromo('');
    toast.success(credit > 0 ? `₹${credit} credited to your wallet` : 'Promo applied to your next payment');
    load();
  };

  const copyReferral = async () => {
    if (!referral) return;
    const link = `${window.location.origin}/?ref=${referral.code}`;
    await navigator.clipboard?.writeText(link).catch(() => undefined);
    toast.success('Referral link copied');
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <WalletIcon className="w-12 h-12 text-primary" />
        <h1 className="text-2xl font-display font-bold">Sign in to view your wallet</h1>
        <Link to="/"><Button className="rounded-xl">Back to TripGenius</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to app
        </Link>

        <h1 className="text-3xl font-display font-bold text-gradient-hero">Wallet & rewards</h1>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5">
            <WalletIcon className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-display font-bold">₹{balance.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground">Wallet balance</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <Gift className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-display font-bold">{Math.max(0, Math.round(balance))}</p>
            <p className="text-xs text-muted-foreground">Reward points</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <Users className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-display font-bold">{referral?.signups ?? 0}</p>
            <p className="text-xs text-muted-foreground">Referral signups</p>
          </div>
        </div>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-display font-bold flex items-center gap-2"><Ticket className="w-4 h-4" /> Redeem a promo code</h2>
          <div className="flex gap-2">
            <Input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} placeholder="TRIPGENIUS100" />
            <Button onClick={redeem} disabled={busy} className="rounded-xl">Redeem</Button>
          </div>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-display font-bold flex items-center gap-2"><Users className="w-4 h-4" /> Refer a friend</h2>
          <p className="text-sm text-muted-foreground">Share your link — you both earn wallet credit when they plan their first trip.</p>
          <div className="flex gap-2 items-center">
            <code className="text-sm px-3 py-2 rounded-lg bg-muted flex-1 truncate">{referral ? `${window.location.origin}/?ref=${referral.code}` : '…'}</code>
            <Button variant="outline" className="rounded-xl gap-1" onClick={copyReferral}><Copy className="w-4 h-4" /> Copy</Button>
          </div>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-display font-bold">Transaction history</h2>
          {txns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {txns.map((t) => (
                <li key={t.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()} · {t.kind}</p>
                  </div>
                  <span className={Number(t.amount) >= 0 ? 'text-emerald-600 font-semibold' : 'text-destructive font-semibold'}>
                    {Number(t.amount) >= 0 ? '+' : ''}{Number(t.amount).toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
