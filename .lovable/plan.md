

# Remaining Implementation Plan

Based on the conversation history and current codebase, here are the features discussed but not yet implemented:

## 1. Remove Plan Limits for Free Features
**Problem**: `planLimits.ts` still restricts PDF export, email, and saved trips for basic users. The user previously asked to remove subscription gates from export/email/share.
- Update `planLimits.ts`: set `canExportPdf: true`, `canEmailTrip: true`, `savedTripsLimit: -1`, `allDaysUnlocked: true` for ALL plans
- Remove the locked day logic from `Index.tsx` (the `isLockedDay` / `getFreeDays` functions)
- Remove the Crown icon and subscription prompts from the Save button

## 2. Subscription Page Access Only After Login
**Problem**: User said subscription page should only open after login.
- In `Index.tsx`, wrap the subscription navigation to check `user` first; if not logged in, redirect to auth step before showing subscribe

## 3. Place/Checkpoint Selector (Pre-Generation)
**Problem**: User requested ability to choose specific places/landmarks before generating the itinerary.
- Add a new step `'preferences'` between `'budget'` and `'loading'` in `Index.tsx`
- Create `TripPreferences.tsx` component with:
  - AI-powered place suggestions for the destination (via a new edge function or reusing suggest-cities)
  - Checkboxes/chips to select must-visit places
  - Free-text input for custom places
  - Pass selected places to the `generate-trip` edge function prompt

## 4. Transportation Mode Suggestions in Itinerary
**Problem**: User wanted transport recommendations (road, flight, train) based on distance.
- Update the `generate-trip` edge function prompt to include a `transportMode` field per place (e.g., "walk", "taxi", "metro", "bus", "train", "flight")
- Update `PlaceRecommendation` type in `trip.ts` to add `transportMode` field
- Update `DayItinerary.tsx` to display transport mode icons/badges between places

## 5. Shareable Trip Links
**Problem**: Discussed in roadmap — generate public URLs for trip plans.
- Create a `shared_trips` table (public, no auth required for reading)
- Add an edge function or direct insert to create a share record with a UUID
- Create a `/shared/:id` route that loads and displays a read-only trip view
- Add a "Copy Link" button in the itinerary toolbar

## Implementation Order
1. Remove plan limits (quick fix, ~5 min)
2. Subscription page auth gate (quick fix, ~5 min)  
3. Transportation mode in itinerary (prompt update + UI, ~20 min)
4. Place/checkpoint selector (new component + edge function, ~30 min)
5. Shareable trip links (new table + route + edge function, ~40 min)

## Files to Create/Modify
- `src/lib/planLimits.ts` — unlock all features
- `src/pages/Index.tsx` — remove locked day logic, add auth gate for subscribe, add preferences step
- `src/components/TripPreferences.tsx` — new place selector component
- `src/components/DayItinerary.tsx` — add transport mode display
- `src/types/trip.ts` — add `transportMode` to `PlaceRecommendation`
- `supabase/functions/generate-trip/index.ts` — add transport mode + checkpoint support to prompt
- New migration for `shared_trips` table
- New route component for shared trip viewing

