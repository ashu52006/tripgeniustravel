import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Plus, Trash2, RefreshCw, ArrowLeft, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { editDay } from '@/lib/tripEditing';
import type { TripPlan, PlaceRecommendation } from '@/types/trip';

interface Props {
  plan: TripPlan;
  dayNumber: number;
  onSave: (next: TripPlan) => void;
  onBack: () => void;
}

const suggestionPool: PlaceRecommendation[] = [
  { id: 'sug-1', name: 'Local Market Stroll', description: '', whyRecommended: 'Suggested alternative', startTime: '10:00', endTime: '12:00', entryFee: 0, timeRequired: '2h', distanceFromPrevious: '2km', crowdLevel: 'medium', weatherSuitability: 'Sunny', priority: 'optional', category: 'activity' },
  { id: 'sug-2', name: 'Rooftop Café', description: '', whyRecommended: 'Suggested alternative', startTime: '15:00', endTime: '16:30', entryFee: 0, timeRequired: '1.5h', distanceFromPrevious: '1km', crowdLevel: 'low', weatherSuitability: 'Any', priority: 'optional', category: 'food' },
  { id: 'sug-3', name: 'Sunset Viewpoint', description: '', whyRecommended: 'Suggested alternative', startTime: '17:30', endTime: '19:00', entryFee: 0, timeRequired: '1.5h', distanceFromPrevious: '3km', crowdLevel: 'medium', weatherSuitability: 'Clear', priority: 'recommended', category: 'viewpoint' },
  { id: 'sug-4', name: 'Museum Visit', description: '', whyRecommended: 'Suggested alternative', startTime: '11:00', endTime: '13:00', entryFee: 200, timeRequired: '2h', distanceFromPrevious: '4km', crowdLevel: 'medium', weatherSuitability: 'Any', priority: 'recommended', category: 'attraction' },
];

export default function DayEditor({ plan, dayNumber, onSave, onBack }: Props) {
  const [current, setCurrent] = useState<TripPlan>(plan);
  const day = current.days.find((d) => d.day === dayNumber);
  const [budget, setBudget] = useState<string>(String(day?.cost.total ?? 0));

  if (!day) return null;

  const apply = (result: ReturnType<typeof editDay>) => {
    setCurrent(result.trip);
    if (result.swap) {
      toast.success(
        `Swapped in ${result.swap.addedPlaceName} instead of ${result.swap.removedPlaceName} already on Day ${result.swap.otherDay}.`
      );
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-4 py-6 pt-28 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="font-display text-xl font-bold">Edit Day {day.day} — {day.title}</h2>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        Subject to availability. Adding a place already on another day will auto-swap that day for an alternative.
      </div>

      <div className="glass rounded-xl p-4">
        <label className="text-sm font-semibold flex items-center gap-2 mb-2"><Wallet className="w-4 h-4" /> Day budget</label>
        <div className="flex gap-2">
          <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="flex-1" />
          <Button
            variant="outline"
            onClick={() => apply(editDay(current, day.day, { type: 'setBudget', newDayBudget: Number(budget) || 0 }))}
          >
            Update budget
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {day.places.map((p) => (
          <div key={p.id} className="glass rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.startTime} – {p.endTime}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => {
                const replacement = suggestionPool[Math.floor(Math.random() * suggestionPool.length)];
                apply(editDay(current, day.day, { type: 'replace', activityId: p.id, newPlace: { ...replacement, id: `${replacement.id}-${Date.now()}` } }, suggestionPool));
              }}>
                <RefreshCw className="w-3.5 h-3.5" /> Replace
              </Button>
              <Button size="sm" variant="ghost" onClick={() => apply(editDay(current, day.day, { type: 'remove', activityId: p.id }))}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-3">
        <p className="text-sm font-semibold mb-2">Add an activity</p>
        <div className="grid gap-2">
          {suggestionPool.map((s) => (
            <button
              key={s.id}
              className="text-left p-2 rounded-lg hover:bg-secondary/40 flex items-center justify-between"
              onClick={() => apply(editDay(current, day.day, { type: 'add', newPlace: { ...s, id: `${s.id}-${Date.now()}` } }, suggestionPool))}
            >
              <span className="text-sm">{s.name}</span>
              <Plus className="w-4 h-4 text-primary" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>Cancel</Button>
        <Button className="flex-1" onClick={() => { onSave(current); toast.success('Day updated'); onBack(); }}>Save changes</Button>
      </div>
    </motion.div>
  );
}
