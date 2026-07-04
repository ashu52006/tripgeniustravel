# Trip Genius — Alignment to Wireframe v2 Spec

The app already covers Landing, Auth, Region, Setup, Budget, Itinerary, Saved Trips, Subscription, and Share. This plan closes the gaps between what exists and the Master Prompt spec, without rebuilding what already works.

## Scope: What's Missing vs. Spec

1. **Centralized entitlement service** — currently `planLimits.ts` has all features enabled for everyone. Spec requires a single `canAccess(user, feature)` used at every gate point.
2. **Shared `<LockedOverlay />` component** — no reusable blur+lock+CTA pattern exists.
3. **Post-login onboarding flow (P1–P4)** — notification permission, re-verification/OTP, buddy visibility toggle, preferences form — none exist.
4. **Day-level editing with de-duplication (I8)** — no edit screen; no `tripService.editDay()` with cross-day de-dup.
5. **One-time free PDF export** — export is currently unlimited/ungated; spec says free users get 1 per trip, persisted on the Trip.
6. **Live Map gated screen (I6/I6b)** — map exists inline on itinerary; spec wants a dedicated screen with blurred preview for free users.
7. **Trust cues on budget tiers (I1)** — source caption + confidence flag from service, driven by data.
8. **Booking URL redirect model** — flights/hotels should expose `bookingUrl` and open in new tab (currently display-only).
9. **Buddy visibility toggle** on user profile (default off; premium-gated when turned on).

## Files to Add

- `src/lib/entitlements.ts` — `canAccess(user, feature)` + feature enum; single source of truth.
- `src/components/LockedOverlay.tsx` — blur + gold lock + "Unlock with Premium" CTA (inline + fullscreen variants).
- `src/components/onboarding/OnboardingFlow.tsx` — 4-step wizard (P1 notification, P2 re-verify OTP, P3 buddy visibility, P4 preferences). Persists `hasCompletedOnboarding` in `profiles` table.
- `src/hooks/useCountdown.ts` — reusable OTP countdown.
- `src/components/DayEditor.tsx` — I8 screen: edit day budget, replace/remove/add activity.
- `src/lib/tripEditing.ts` — pure `editDay(trip, dayNumber, change)` with cross-day de-dup returning `{ trip, swap? }`.
- `src/components/LiveMapScreen.tsx` — I6/I6b combined; blurred preview for free tier.
- Migration: extend `profiles` (or create) with `has_completed_onboarding`, `show_name_to_companions`, `notification_choice`, `plan` columns. Add `pdf_exported_once` (bool) on `saved_trips`.

## Files to Modify

- `src/lib/planLimits.ts` — keep as plan metadata; delegate feature checks to `entitlements.ts`.
- `src/pages/Index.tsx` — after auth success, route through onboarding if not completed; add DayEditor + LiveMapScreen steps; wire export PDF to check + set `pdfExportedOnce`.
- `src/components/DayItinerary.tsx` — wrap Day 2+ places in `<LockedOverlay feature="fullItinerary" />` for free users (currently all-unlocked). Add edit-pencil for premium.
- `src/components/SubscriptionPage.tsx` — unify locked CTA to point through entitlement upgrade path.
- `supabase/functions/generate-trip/index.ts` — return `bookingUrl`, `sourceCaption`, `confidence` on relevant items.
- `src/types/trip.ts` — add `bookingUrl` to Flight/Hotel; add `pdfExportedOnce`, `confidence`, `sourceCaption` where appropriate.

## Gating Rules (enforced via `canAccess`)

| Feature key | Free | Premium (silver+) |
|---|---|---|
| `fullItinerary` | Day 1 only | All days |
| `liveMap` | Blurred preview | Full |
| `dayEditing` | Locked | Full |
| `buddyVisibility` | Toggle locked | Toggle enabled |
| `unlimitedPdf` | 1 per trip | Unlimited |
| `saveTrip` | Locked | Unlimited |
| `shareTrip` | Locked | Unlimited |

Note: This reintroduces gating that was previously removed per user request. Prior instruction ("remove subscription for export pdf email trip and whatsapp share") conflicts with the new spec — new spec wins per this message.

## Implementation Order

1. Types + entitlements + LockedOverlay (foundation)
2. Migration for profiles/onboarding + pdf flag
3. OnboardingFlow + route guard in Index
4. DayItinerary locking for free users
5. LiveMapScreen with blur variant
6. DayEditor + tripEditing de-dup logic
7. Export PDF one-time logic + booking URL redirects
8. Trust cues on budget cards

## Out of Scope (Not Changing)

- Existing Landing, RegionSelector, TripSetupForm, BudgetPlansPage, SavedTripsPage, SharedTrip, Razorpay integration, saved trips flow.
- Mock services (`geminiService.ts`, `authService.ts`, `bookingService.ts`) — the app already uses real Supabase edge functions; wrapping them in additional mock service modules would duplicate work. Instead, existing edge functions are extended to return the spec-required fields.
- Landing page reviews/founders/recommended-trips restructure — already covered.

## Assumptions Flagged

- "Premium" = any paid tier (silver/gold/platinum). Basic = free.
- Onboarding OTP for mobile is mocked (no SMS provider wired); Gmail path resolves immediately since user is already authed via Supabase.
- MapView remains a static illustrative component; no real Google Maps SDK yet.
- Prior user directive removing gating on PDF/email/share is being reverted per this new spec.

Confirm to proceed, or tell me which gaps to skip.