import type { TripPlan, PlaceRecommendation } from '@/types/trip';

export interface EditDayChange {
  type: 'replace' | 'add' | 'remove' | 'setBudget';
  activityId?: string; // for replace/remove
  newPlace?: PlaceRecommendation; // for replace/add
  newDayBudget?: number; // for setBudget
}

export interface Swap {
  otherDay: number;
  removedPlaceName: string;
  addedPlaceName: string;
}

export interface EditDayResult {
  trip: TripPlan;
  swap?: Swap;
}

/**
 * Pure function: apply an edit to a single day, then de-duplicate across other days.
 * If the added/replaced place already exists elsewhere, that other day's copy is
 * automatically swapped for a suggested alternative and returned in `swap`.
 */
export function editDay(
  trip: TripPlan,
  dayNumber: number,
  change: EditDayChange,
  suggestionPool: PlaceRecommendation[] = []
): EditDayResult {
  const days = trip.days.map((d) => ({ ...d, places: [...d.places] }));
  const idx = days.findIndex((d) => d.day === dayNumber);
  if (idx === -1) return { trip };

  const day = days[idx];

  switch (change.type) {
    case 'setBudget': {
      if (typeof change.newDayBudget === 'number') {
        day.cost = { ...day.cost, total: change.newDayBudget };
      }
      break;
    }
    case 'remove': {
      day.places = day.places.filter((p) => p.id !== change.activityId);
      break;
    }
    case 'add': {
      if (change.newPlace) day.places = [...day.places, change.newPlace];
      break;
    }
    case 'replace': {
      if (change.newPlace && change.activityId) {
        day.places = day.places.map((p) => (p.id === change.activityId ? change.newPlace! : p));
      }
      break;
    }
  }

  days[idx] = day;

  // De-dup: if change added a place name, scan other days
  let swap: Swap | undefined;
  const addedName =
    change.type === 'add' || change.type === 'replace' ? change.newPlace?.name?.toLowerCase() : undefined;

  if (addedName) {
    for (let i = 0; i < days.length; i++) {
      if (i === idx) continue;
      const other = days[i];
      const dupeIdx = other.places.findIndex((p) => p.name.toLowerCase() === addedName);
      if (dupeIdx !== -1) {
        const dupe = other.places[dupeIdx];
        const usedNames = new Set(days.flatMap((d) => d.places.map((p) => p.name.toLowerCase())));
        const replacement = suggestionPool.find((s) => !usedNames.has(s.name.toLowerCase()));
        if (replacement) {
          const nextPlaces = [...other.places];
          nextPlaces[dupeIdx] = { ...replacement, id: `${replacement.id}-swap-${Date.now()}` };
          days[i] = { ...other, places: nextPlaces };
          swap = { otherDay: other.day, removedPlaceName: dupe.name, addedPlaceName: replacement.name };
        } else {
          const nextPlaces = other.places.filter((_, j) => j !== dupeIdx);
          days[i] = { ...other, places: nextPlaces };
          swap = { otherDay: other.day, removedPlaceName: dupe.name, addedPlaceName: '(removed — no alternative)' };
        }
        break;
      }
    }
  }

  return { trip: { ...trip, days }, swap };
}
