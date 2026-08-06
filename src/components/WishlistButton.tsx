import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { SubjectType } from '@/components/ReviewsSection';

interface Props {
  itemType: SubjectType;
  itemKey: string;
  title: string;
  subtitle?: string;
  city?: string;
  country?: string;
  imageUrl?: string;
  priceEstimate?: number;
  currency?: string;
  className?: string;
}

export default function WishlistButton({
  itemType,
  itemKey,
  title,
  subtitle,
  city,
  country,
  imageUrl,
  priceEstimate,
  currency = 'INR',
  className = '',
}: Props) {
  const { user } = useAuth();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setSavedId(null);
      return;
    }
    supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_key', itemKey)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setSavedId((data as { id: string } | null)?.id ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [user, itemKey]);

  const toggle = async () => {
    if (!user) return toast.error('Sign in to save to your wishlist');
    setBusy(true);
    if (savedId) {
      const { error } = await supabase.from('wishlist_items').delete().eq('id', savedId);
      setBusy(false);
      if (error) return toast.error(error.message);
      setSavedId(null);
      toast.success('Removed from wishlist');
      return;
    }
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: user.id,
        item_type: itemType,
        item_key: itemKey,
        title,
        subtitle: subtitle ?? null,
        city: city ?? null,
        country: country ?? null,
        image_url: imageUrl ?? null,
        price_estimate: priceEstimate ?? null,
        currency,
      } as never)
      .select('id')
      .maybeSingle();
    setBusy(false);
    if (error) return toast.error(error.message);
    setSavedId((data as { id: string } | null)?.id ?? null);
    toast.success('Saved to wishlist');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={savedId ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
      className={`inline-flex items-center justify-center rounded-full p-2 transition-colors hover:bg-primary/10 ${className}`}
    >
      <Heart className={`w-5 h-5 ${savedId ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
    </button>
  );
}
