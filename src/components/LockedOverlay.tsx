import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Feature } from '@/lib/entitlements';

interface LockedOverlayProps {
  feature: Feature;
  title?: string;
  description?: string;
  onUnlock: () => void;
  variant?: 'overlay' | 'inline';
  children?: React.ReactNode;
}

const featureCopy: Record<Feature, { title: string; description: string }> = {
  fullItinerary: { title: 'Unlock Full Itinerary', description: 'See all days of your trip, not just Day 1.' },
  liveMap: { title: 'Unlock Live Map & Expense Tracker', description: 'Real-time route, ETA and spend tracking.' },
  dayEditing: { title: 'Unlock Day Editing', description: 'Replace, add or remove any activity with auto de-duplication.' },
  buddyVisibility: { title: 'Unlock Travel Buddy Visibility', description: 'Let matched companions see your name and chat.' },
  unlimitedPdf: { title: 'Unlock Unlimited PDF Export', description: 'Export as often as you like on every trip.' },
  saveTrip: { title: 'Unlock Save Trip', description: 'Save unlimited trips to your library.' },
  shareTrip: { title: 'Unlock Trip Sharing', description: 'Generate a shareable public link.' },
};

export default function LockedOverlay({
  feature,
  title,
  description,
  onUnlock,
  variant = 'overlay',
  children,
}: LockedOverlayProps) {
  const copy = featureCopy[feature];

  if (variant === 'inline') {
    return (
      <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground">{title || copy.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description || copy.description}</p>
        </div>
        <Button size="sm" onClick={onUnlock} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          Unlock
        </Button>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="pointer-events-none select-none blur-[6px] opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="glass-strong rounded-2xl p-6 max-w-sm text-center border border-accent/40">
          <div className="w-14 h-14 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-foreground mb-1">{title || copy.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description || copy.description}</p>
          <Button onClick={onUnlock} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full">
            Unlock with Premium
          </Button>
        </div>
      </div>
    </div>
  );
}
