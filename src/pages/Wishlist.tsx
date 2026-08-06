import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, FolderPlus, Trash2, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSeo } from '@/hooks/useSeo';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  item_type: string;
  item_key: string;
  title: string;
  subtitle: string | null;
  city: string | null;
  country: string | null;
  image_url: string | null;
  price_estimate: number | null;
  currency: string;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_shared: boolean;
  share_id: string;
}

export default function Wishlist() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollection, setNewCollection] = useState('');

  useSeo({
    title: 'Wishlist & Collections | TripGenius',
    description: 'Save hotels, flights, activities and destinations to your TripGenius wishlist and organise them into shareable collections.',
  });

  const load = useCallback(async () => {
    if (!user) return;
    const [w, c] = await Promise.all([
      supabase.from('wishlist_items').select('*').order('created_at', { ascending: false }),
      supabase.from('collections').select('*').order('created_at', { ascending: false }),
    ]);
    setItems((w.data as unknown as WishlistItem[]) ?? []);
    setCollections((c.data as unknown as Collection[]) ?? []);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const removeItem = async (id: string) => {
    const { error } = await supabase.from('wishlist_items').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Removed from wishlist');
    load();
  };

  const createCollection = async () => {
    if (!user || !newCollection.trim()) return;
    const { error } = await supabase
      .from('collections')
      .insert({ user_id: user.id, name: newCollection.trim().slice(0, 80) } as never);
    if (error) return toast.error(error.message);
    setNewCollection('');
    toast.success('Collection created');
    load();
  };

  const addToCollection = async (item: WishlistItem, collectionId: string) => {
    const { error } = await supabase.from('collection_items').insert({
      collection_id: collectionId,
      wishlist_item_id: item.id,
      item_type: item.item_type,
      item_key: item.item_key,
      title: item.title,
      image_url: item.image_url,
    } as never);
    if (error) return toast.error(error.message);
    toast.success('Added to collection');
  };

  const toggleShare = async (c: Collection) => {
    const { error } = await supabase.from('collections').update({ is_shared: !c.is_shared } as never).eq('id', c.id);
    if (error) return toast.error(error.message);
    if (!c.is_shared) {
      const url = `${window.location.origin}/collection/${c.share_id}`;
      await navigator.clipboard?.writeText(url).catch(() => undefined);
      toast.success('Sharing on — link copied');
    } else {
      toast.success('Sharing turned off');
    }
    load();
  };

  const deleteCollection = async (id: string) => {
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Heart className="w-12 h-12 text-primary" />
        <h1 className="text-2xl font-display font-bold">Sign in to view your wishlist</h1>
        <Link to="/"><Button className="rounded-xl">Back to TripGenius</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to app
        </Link>

        <header>
          <h1 className="text-3xl font-display font-bold text-gradient-hero">Wishlist & Collections</h1>
          <p className="text-muted-foreground text-sm mt-1">Save what you love, group it into collections, share it with anyone.</p>
        </header>

        <section className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-display font-bold flex items-center gap-2"><FolderPlus className="w-4 h-4" /> Collections</h2>
            <div className="flex gap-2">
              <Input value={newCollection} onChange={(e) => setNewCollection(e.target.value)} placeholder="e.g. Japan 2026" className="w-48" />
              <Button onClick={createCollection} className="rounded-xl gap-1"><Plus className="w-4 h-4" /> New</Button>
            </div>
          </div>
          {collections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No collections yet.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-3">
              {collections.map((c) => (
                <li key={c.id} className="rounded-xl border border-border p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.is_shared ? 'Public link active' : 'Private'}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleShare(c)}><Share2 className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteCollection(c.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-display font-bold flex items-center gap-2"><Heart className="w-4 h-4" /> Saved items</h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing saved yet. Tap the heart on any hotel, flight, activity or destination.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((it) => (
                <li key={it.id} className="rounded-xl border border-border overflow-hidden">
                  {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" className="h-32 w-full object-cover" />}
                  <div className="p-3 space-y-2">
                    <p className="font-semibold text-sm">{it.title}</p>
                    <p className="text-xs text-muted-foreground">{it.subtitle || [it.city, it.country].filter(Boolean).join(', ')}</p>
                    {it.price_estimate != null && (
                      <p className="text-xs font-medium">{it.currency} {Number(it.price_estimate).toLocaleString()}</p>
                    )}
                    <div className="flex gap-2">
                      {collections.length > 0 && (
                        <select
                          className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                          defaultValue=""
                          onChange={(e) => e.target.value && addToCollection(it, e.target.value)}
                        >
                          <option value="">Add to collection…</option>
                          {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeItem(it.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
