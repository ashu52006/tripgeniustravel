import { useCallback, useEffect, useMemo, useState } from 'react';
import { Star, ThumbsUp, Flag, Pencil, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { toast } from 'sonner';

export type SubjectType = 'hotel' | 'flight' | 'activity' | 'destination' | 'restaurant';
export type TravelerType = 'solo' | 'couple' | 'family' | 'business';

export const SUBJECT_LABELS: Record<SubjectType, string> = {
  hotel: 'Hotel',
  flight: 'Flight',
  activity: 'Activity',
  destination: 'Destination',
  restaurant: 'Restaurant',
};

export const TRAVELER_LABELS: Record<TravelerType, string> = {
  solo: 'Solo',
  couple: 'Couple',
  family: 'Family',
  business: 'Business',
};

export interface ReviewRow {
  id: string;
  user_id: string;
  subject_type: SubjectType;
  subject_key: string;
  subject_name: string;
  city: string | null;
  rating: number;
  title: string | null;
  body: string;
  traveler_type: TravelerType | null;
  photo_urls: string[];
  video_urls: string[];
  is_verified: boolean;
  status: string;
  helpful_count: number;
  admin_reply: string | null;
  created_at: string;
}

export function Stars({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange?.(n)}
          className={onChange ? 'transition-transform hover:scale-110' : 'cursor-default'}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}
          />
        </button>
      ))}
    </div>
  );
}

interface Props {
  subjectType: SubjectType;
  subjectKey: string;
  subjectName: string;
  city?: string;
  compact?: boolean;
}

export default function ReviewsSection({ subjectType, subjectKey, subjectName, city, compact }: Props) {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [myVotes, setMyVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // composer state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [travelerType, setTravelerType] = useState<TravelerType>('solo');
  const [photos, setPhotos] = useState('');
  const [videos, setVideos] = useState('');

  // filter / sort
  const [filterStar, setFilterStar] = useState<number | 'all'>('all');
  const [filterType, setFilterType] = useState<TravelerType | 'all'>('all');
  const [sort, setSort] = useState<'recent' | 'helpful' | 'high' | 'low'>('recent');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('subject_type', subjectType)
      .eq('subject_key', subjectKey)
      .order('created_at', { ascending: false });
    setReviews((data as unknown as ReviewRow[]) ?? []);
    if (user) {
      const { data: v } = await supabase.from('review_votes').select('review_id').eq('user_id', user.id);
      setMyVotes(((v as { review_id: string }[]) ?? []).map((x) => x.review_id));
    }
    setLoading(false);
  }, [subjectType, subjectKey, user]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setRating(5);
    setTitle('');
    setBody('');
    setTravelerType('solo');
    setPhotos('');
    setVideos('');
  };

  const submit = async () => {
    if (!user) return toast.error('Sign in to write a review');
    if (body.trim().length < 10) return toast.error('Please write at least 10 characters');
    setSaving(true);
    const payload = {
      user_id: user.id,
      subject_type: subjectType,
      subject_key: subjectKey,
      subject_name: subjectName,
      city: city ?? null,
      rating,
      title: title.trim() || null,
      body: body.trim().slice(0, 4000),
      traveler_type: travelerType,
      photo_urls: photos.split(/[\n,]/).map((s) => s.trim()).filter(Boolean).slice(0, 8),
      video_urls: videos.split(/[\n,]/).map((s) => s.trim()).filter(Boolean).slice(0, 4),
    };
    const { error } = editingId
      ? await supabase.from('reviews').update(payload as never).eq('id', editingId)
      : await supabase.from('reviews').insert(payload as never);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? 'Review updated' : 'Review published');
    resetForm();
    load();
  };

  const startEdit = (r: ReviewRow) => {
    setEditingId(r.id);
    setRating(r.rating);
    setTitle(r.title ?? '');
    setBody(r.body);
    setTravelerType(r.traveler_type ?? 'solo');
    setPhotos(r.photo_urls.join('\n'));
    setVideos(r.video_urls.join('\n'));
    window.scrollTo({ top: window.scrollY - 200, behavior: 'smooth' });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Review deleted');
    load();
  };

  const toggleHelpful = async (id: string) => {
    if (!user) return toast.error('Sign in to vote');
    const voted = myVotes.includes(id);
    const { error } = voted
      ? await supabase.from('review_votes').delete().eq('review_id', id).eq('user_id', user.id)
      : await supabase.from('review_votes').insert({ review_id: id, user_id: user.id } as never);
    if (error) return toast.error(error.message);
    load();
  };

  const report = async (id: string) => {
    if (!user) return toast.error('Sign in to report');
    const reason = window.prompt('Why are you reporting this review?');
    if (!reason) return;
    const { error } = await supabase
      .from('review_reports')
      .insert({ review_id: id, reporter_id: user.id, reason: reason.slice(0, 500) } as never);
    if (error) return toast.error(error.message);
    toast.success('Reported. Our team will review it.');
  };

  const adminReply = async (id: string) => {
    const reply = window.prompt('Official reply');
    if (!reply) return;
    const { error } = await supabase
      .from('reviews')
      .update({ admin_reply: reply.slice(0, 1000), admin_reply_at: new Date().toISOString() } as never)
      .eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Reply posted');
    load();
  };

  const visible = useMemo(() => {
    let list = reviews.filter((r) => r.status === 'published' || r.user_id === user?.id || isAdmin);
    if (filterStar !== 'all') list = list.filter((r) => r.rating === filterStar);
    if (filterType !== 'all') list = list.filter((r) => r.traveler_type === filterType);
    const sorters: Record<typeof sort, (a: ReviewRow, b: ReviewRow) => number> = {
      recent: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
      helpful: (a, b) => b.helpful_count - a.helpful_count,
      high: (a, b) => b.rating - a.rating,
      low: (a, b) => a.rating - b.rating,
    };
    return [...list].sort(sorters[sort]);
  }, [reviews, filterStar, filterType, sort, user, isAdmin]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-lg">Reviews for {subjectName}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={Math.round(avg)} />
            <span>{avg ? avg.toFixed(1) : '—'} · {reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <select className="h-9 rounded-lg border border-input bg-background px-2" value={String(filterStar)} onChange={(e) => setFilterStar(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">All stars</option>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star</option>)}
          </select>
          <select className="h-9 rounded-lg border border-input bg-background px-2" value={filterType} onChange={(e) => setFilterType(e.target.value as TravelerType | 'all')}>
            <option value="all">All travellers</option>
            {Object.entries(TRAVELER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="h-9 rounded-lg border border-input bg-background px-2" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="recent">Most recent</option>
            <option value="helpful">Most helpful</option>
            <option value="high">Highest rated</option>
            <option value="low">Lowest rated</option>
          </select>
        </div>
      </div>

      {!user && !compact && (
        <div className="glass rounded-2xl p-4 text-sm text-muted-foreground">
          Sign in to write a review for {subjectName}.
        </div>
      )}

      {user && !compact && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{editingId ? 'Edit your review' : 'Write a review'}</p>
            <Stars value={rating} onChange={setRating} size={22} />
          </div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Headline (optional)" />
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} rows={4} placeholder={`How was your experience with ${subjectName}?`} />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TRAVELER_LABELS) as TravelerType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTravelerType(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${travelerType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}
              >
                {TRAVELER_LABELS[t]}
              </button>
            ))}
          </div>
          <Input value={photos} onChange={(e) => setPhotos(e.target.value)} placeholder="Photo links (comma separated)" />
          <Input value={videos} onChange={(e) => setVideos(e.target.value)} placeholder="Video links (comma separated)" />
          <div className="flex gap-2">
            <Button onClick={submit} disabled={saving} className="rounded-xl">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? 'Save changes' : 'Publish review'}
            </Button>
            {editingId && <Button variant="ghost" onClick={resetForm}>Cancel</Button>}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => (
            <li key={r.id} className="glass rounded-2xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Stars value={r.rating} />
                    {r.title && <span className="font-semibold text-sm">{r.title}</span>}
                    {r.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        <ShieldCheck className="w-3 h-3" /> Verified traveller
                      </span>
                    )}
                    {r.traveler_type && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{TRAVELER_LABELS[r.traveler_type]}</span>
                    )}
                    {r.status !== 'published' && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{r.status}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                {(r.user_id === user?.id || isAdmin) && (
                  <div className="flex gap-1">
                    {r.user_id === user?.id && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(r)}><Pencil className="w-4 h-4" /></Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              </div>

              <p className="text-sm whitespace-pre-wrap">{r.body}</p>

              {r.photo_urls.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {r.photo_urls.map((u) => (
                    <img key={u} src={u} alt={`Review photo for ${r.subject_name}`} loading="lazy" className="h-24 w-32 object-cover rounded-lg flex-shrink-0" />
                  ))}
                </div>
              )}
              {r.video_urls.map((u) => (
                <a key={u} href={u} target="_blank" rel="noreferrer" className="text-xs text-primary underline block">Watch video</a>
              ))}

              {r.admin_reply && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-sm">
                  <p className="text-xs font-semibold text-primary mb-1">Reply from TripGenius</p>
                  {r.admin_reply}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button onClick={() => toggleHelpful(r.id)} className={`inline-flex items-center gap-1 text-xs ${myVotes.includes(r.id) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({r.helpful_count})
                </button>
                <button onClick={() => report(r.id)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
                {isAdmin && (
                  <button onClick={() => adminReply(r.id)} className="text-xs text-primary">Reply as TripGenius</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
