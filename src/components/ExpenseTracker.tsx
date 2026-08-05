import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Wallet, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { canAccess } from '@/lib/entitlements';
import LockedOverlay from './LockedOverlay';
import { toast } from 'sonner';

interface Expense {
  id: string;
  label: string;
  category: string;
  amount: number;
  currency: string;
  spent_on: string;
}

const CATEGORIES = ['Transport', 'Stay', 'Food', 'Activities', 'Shopping', 'Other'];

interface ExpenseTrackerProps {
  tripId?: string | null;
  plan?: string | null;
  currency?: string;
  budget?: number;
  onUpgrade: () => void;
}

export default function ExpenseTracker({ tripId, plan, currency = 'INR', budget, onUpgrade }: ExpenseTrackerProps) {
  const { user } = useAuth();
  const unlocked = canAccess(plan, 'expenseTracker');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user || !unlocked) return;
    let query = supabase.from('trip_expenses').select('*').order('spent_on', { ascending: false });
    query = tripId ? query.eq('trip_id', tripId) : query.is('trip_id', null);
    const { data } = await query;
    setExpenses((data as Expense[]) ?? []);
  }, [user, unlocked, tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const total = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses]);
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const fmt = (n: number) => `${currency === 'INR' ? '₹' : ''}${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}${currency === 'INR' ? '' : ` ${currency}`}`;

  const add = async () => {
    if (!user) return;
    const value = Number(amount);
    if (!label.trim() || !Number.isFinite(value) || value <= 0) {
      toast.error('Add a description and a valid amount');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('trip_expenses').insert({
      user_id: user.id,
      trip_id: tripId ?? null,
      label: label.trim(),
      category,
      amount: value,
      currency,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    setLabel('');
    setAmount('');
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('trip_expenses').delete().eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  const panel = (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-display font-bold flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" /> Expense Tracker
        </h3>
        <div className="text-right">
          <p className="text-xl font-display font-bold">{fmt(total)}</p>
          {budget ? (
            <p className={`text-xs ${total > budget ? 'text-destructive' : 'text-muted-foreground'}`}>
              of {fmt(budget)} budget · {Math.round((total / budget) * 100)}%
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">tracked so far</p>
          )}
        </div>
      </div>

      {budget ? (
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full ${total > budget ? 'bg-destructive' : 'bg-gradient-hero'}`}
            style={{ width: `${Math.min(100, (total / budget) * 100)}%` }}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_140px_auto] gap-2">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What did you spend on?" />
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" inputMode="decimal" />
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button onClick={add} disabled={saving} className="rounded-xl gap-1 bg-gradient-hero border-0 text-primary-foreground">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {byCategory.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {byCategory.map(([c, v]) => (
            <span key={c} className="text-xs px-3 py-1 rounded-full bg-secondary/70 text-muted-foreground flex items-center gap-1">
              <PieChart className="w-3 h-3" /> {c}: {fmt(v)}
            </span>
          ))}
        </div>
      )}

      <ul className="divide-y divide-border/60">
        {expenses.map((e) => (
          <li key={e.id} className="flex items-center justify-between py-2 text-sm">
            <div>
              <p className="font-medium">{e.label}</p>
              <p className="text-xs text-muted-foreground">
                {e.category} · {new Date(e.spent_on).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{fmt(Number(e.amount))}</span>
              <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => remove(e.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </li>
        ))}
        {expenses.length === 0 && (
          <li className="py-4 text-center text-sm text-muted-foreground">No expenses logged yet.</li>
        )}
      </ul>
    </div>
  );

  if (!unlocked) {
    return (
      <LockedOverlay feature="expenseTracker" onUnlock={onUpgrade}>
        {panel}
      </LockedOverlay>
    );
  }

  return panel;
}
