import { MapPin, Navigation2, CloudSun, Wallet } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import LockedOverlay from './LockedOverlay';
import { canAccess } from '@/lib/entitlements';
import type { TripPlan } from '@/types/trip';

interface Props {
  plan: TripPlan;
  userPlan: string;
  onUpgrade: () => void;
}

// Stubbed MapView - real props interface for future SDK swap-in
interface MapViewProps {
  pins: Array<{ id: string; label: string; x: number; y: number }>;
  route?: { color: string };
  weather?: { temp: number; condition: string };
  eta?: string;
}

function MapView({ pins, weather, eta }: MapViewProps) {
  return (
    <div className="relative w-full h-[380px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-secondary to-accent/10 border border-border">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, hsl(var(--primary)/0.15), transparent 40%), radial-gradient(circle at 70% 70%, hsl(var(--accent)/0.15), transparent 40%)' }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 380">
        <path d="M 40 320 Q 120 200 200 220 T 360 60" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="6 6" fill="none" />
      </svg>
      {pins.map((p) => (
        <div
          key={p.id}
          className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center min-w-[44px] min-h-[44px] justify-end"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <div className="px-2 py-0.5 rounded-md bg-card border border-border text-[10px] font-medium shadow-sm whitespace-nowrap">{p.label}</div>
          <MapPin className="w-6 h-6 text-primary fill-primary/30 -mt-1" />
        </div>
      ))}
      <div className="absolute top-3 right-3 glass-strong rounded-xl px-3 py-2 text-xs flex items-center gap-2">
        <CloudSun className="w-4 h-4 text-accent" />
        <span>{weather?.condition} · {weather?.temp}°C</span>
      </div>
      <div className="absolute top-3 left-3 glass-strong rounded-xl px-3 py-2 text-xs flex items-center gap-2">
        <Navigation2 className="w-4 h-4 text-primary" />
        <span>ETA {eta}</span>
      </div>
    </div>
  );
}

export default function LiveMapScreen({ plan, userPlan, onUpgrade }: Props) {
  const allowed = canAccess(userPlan, 'liveMap');
  const today = plan.days[0];
  const spent = today?.cost.total ? Math.round(today.cost.total * 0.62) : 0;
  const dayBudget = today?.cost.total || 1;
  const pct = Math.min(100, Math.round((spent / dayBudget) * 100));

  const pins = (today?.places.slice(0, 5) || []).map((p, i) => ({
    id: p.id,
    label: p.name.length > 16 ? p.name.slice(0, 14) + '…' : p.name,
    x: 15 + i * 17,
    y: 75 - i * 12,
  }));

  const map = (
    <MapView
      pins={pins}
      route={{ color: 'primary' }}
      weather={{ temp: 28, condition: 'Sunny' }}
      eta="24 min"
    />
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Live Map & Expenses</h2>
        <p className="text-sm text-muted-foreground">Route, weather, ETA and real-time spend tracking.</p>
      </div>

      {allowed ? map : (
        <LockedOverlay feature="liveMap" onUnlock={onUpgrade}>
          {map}
        </LockedOverlay>
      )}

      <div className="glass-strong rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Today's spend</span>
          </div>
          <span className="text-sm">
            {plan.setup.homeCurrency}{spent.toLocaleString()} / {plan.setup.homeCurrency}{dayBudget.toLocaleString()}
          </span>
        </div>
        <Progress value={pct} />
        {!allowed && (
          <p className="text-xs text-muted-foreground mt-3">
            Live tracking updates every 60s on Premium. Upgrade to unlock.
          </p>
        )}
      </div>
    </div>
  );
}
