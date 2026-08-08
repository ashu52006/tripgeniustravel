import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useSeo } from '@/hooks/useSeo';
import ReviewsSection, { SUBJECT_LABELS, Stars, type SubjectType } from '@/components/ReviewsSection';

interface SubjectRow {
  subject_type: SubjectType;
  subject_key: string;
  subject_name: string;
  city: string | null;
  rating: number;
}

export default function Reviews() {
  const [rows, setRows] = useState<SubjectRow[]>([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState<SubjectType | 'all'>('all');
  const [selected, setSelected] = useState<SubjectRow | null>(null);

  useSeo({
    title: 'Traveller Reviews & Ratings | TripGenius',
    description: 'Read verified traveller reviews and ratings for hotels, flights, activities, restaurants and destinations, then write your own.',
  });

  useEffect(() => {
    supabase
      .from('reviews')
      .select('subject_type, subject_key, subject_name, city, rating')
      .eq('status', 'published')
      .then(({ data }) => setRows((data as unknown as SubjectRow[]) ?? []));
  }, []);

  const subjects = useMemo(() => {
    const map = new Map<string, { row: SubjectRow; count: number; total: number }>();
    for (const r of rows) {
      const k = `${r.subject_type}:${r.subject_key}`;
      const cur = map.get(k) ?? { row: r, count: 0, total: 0 };
      cur.count += 1;
      cur.total += r.rating;
      map.set(k, cur);
    }
    const needle = q.trim().toLowerCase();
    return [...map.values()]
      .filter((s) => (type === 'all' ? true : s.row.subject_type === type))
      .filter((s) => (!needle ? true : s.row.subject_name.toLowerCase().includes(needle) || (s.row.city ?? '').toLowerCase().includes(needle)))
      .sort((a, b) => b.count - a.count);
  }, [rows, q, type]);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to app
        </Link>

        <header>
          <h1 className="text-3xl font-display font-bold text-gradient-hero">Traveller reviews</h1>
          <p className="text-muted-foreground text-sm mt-1">Honest ratings from real trips — hotels, flights, activities, restaurants and destinations.</p>
        </header>

        <div className="flex flex-wrap gap-2 items-center">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a hotel, city or activity" className="w-64" />
          <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as SubjectType | 'all')}>
            <option value="all">All categories</option>
            {Object.entries(SUBJECT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <Button className="rounded-xl gap-2 ml-auto" onClick={() => setComposing((c) => !c)}>
            <PenLine className="w-4 h-4" /> Write a review
          </Button>
        </div>

        {composing && (
          <div className="glass rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold">What are you reviewing?</p>
            <div className="grid sm:grid-cols-3 gap-2">
              <select
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                value={newType}
                onChange={(e) => setNewType(e.target.value as SubjectType)}
              >
                {Object.entries(SUBJECT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name (e.g. Taj Palace)" maxLength={120} />
              <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="City (optional)" maxLength={80} />
            </div>
            <Button
              className="rounded-xl"
              disabled={newName.trim().length < 2}
              onClick={() => {
                const name = newName.trim();
                setSelected({
                  subject_type: newType,
                  subject_key: `${newType}:${name.toLowerCase().replace(/\s+/g, '-')}`,
                  subject_name: name,
                  city: newCity.trim() || null,
                  rating: 0,
                });
                setComposing(false);
                setNewName('');
                setNewCity('');
              }}
            >
              Continue
            </Button>
          </div>
        )}

        {selected ? (
          <div className="space-y-4">
            <button className="text-sm text-primary" onClick={() => setSelected(null)}>← All reviewed places</button>
            <ReviewsSection
              subjectType={selected.subject_type}
              subjectKey={selected.subject_key}
              subjectName={selected.subject_name}
              city={selected.city ?? undefined}
            />
          </div>
        ) : subjects.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center space-y-2">
            <Star className="w-8 h-8 mx-auto text-amber-400" />
            <p className="font-semibold">No reviews yet</p>
            <p className="text-sm text-muted-foreground">Reviews you write on hotels, activities and destinations will appear here.</p>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3">
            {subjects.map((s) => (
              <li key={`${s.row.subject_type}:${s.row.subject_key}`}>
                <button onClick={() => setSelected(s.row)} className="glass rounded-2xl p-4 w-full text-left hover:scale-[1.01] transition-transform">
                  <p className="text-[11px] uppercase tracking-wide text-primary">{SUBJECT_LABELS[s.row.subject_type]}</p>
                  <p className="font-semibold">{s.row.subject_name}</p>
                  {s.row.city && <p className="text-xs text-muted-foreground">{s.row.city}</p>}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Stars value={Math.round(s.total / s.count)} />
                    {(s.total / s.count).toFixed(1)} · {s.count} review{s.count === 1 ? '' : 's'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
