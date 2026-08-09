export const APP_REVIEW = {
  subjectType: 'destination' as const,
  subjectKey: 'app:tripgenius',
  subjectName: 'TripGenius App',
};

const KEY = 'tg_app_review_prompt';

type State = { status: 'done' | 'snoozed'; until?: number };

export function getPromptState(): State | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as State) : null;
  } catch {
    return null;
  }
}

export function markDone() {
  localStorage.setItem(KEY, JSON.stringify({ status: 'done' } satisfies State));
}

export function snooze(days = 7) {
  localStorage.setItem(
    KEY,
    JSON.stringify({ status: 'snoozed', until: Date.now() + days * 86400000 } satisfies State),
  );
}

export function canPrompt(): boolean {
  const s = getPromptState();
  if (!s) return true;
  if (s.status === 'done') return false;
  return !s.until || Date.now() > s.until;
}
