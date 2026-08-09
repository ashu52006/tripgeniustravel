import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ImagePlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Stars } from '@/components/ReviewsSection';
import { APP_REVIEW, canPrompt, markDone, snooze } from '@/lib/appReview';
import { uploadReviewPhoto } from '@/lib/reviewPhotos';
import { toast } from 'sonner';

/** Shows a gentle one-time prompt asking the traveller to rate the TripGenius app. */
export default function AppReviewPrompt() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    if (!user || !canPrompt()) return;
    let cancelled = false;

    const start = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('subject_key', APP_REVIEW.subjectKey)
        .limit(1);
      if (cancelled) return;
      if (data && data.length > 0) {
        markDone();
        return;
      }
      // Wait until the traveller has actually used the app for a bit.
      timer.current = window.setTimeout(() => !cancelled && setOpen(true), 120000);
    };
    start();

    return () => {
      cancelled = true;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [user]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length || !user) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 4 - photos.length)) {
        urls.push(await uploadReviewPhoto(user.id, f));
      }
      setPhotos((p) => [...p, ...urls]);
    } catch (e) {
      toast.error((e as Error).message);
    }
    setUploading(false);
  };

  const submit = async () => {
    if (!user) return;
    if (body.trim().length < 5) return toast.error('Please add a few words about your experience');
    setSaving(true);
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      subject_type: APP_REVIEW.subjectType,
      subject_key: APP_REVIEW.subjectKey,
      subject_name: APP_REVIEW.subjectName,
      rating,
      body: body.trim().slice(0, 1000),
      photo_urls: photos,
    } as never);
    setSaving(false);
    if (error) return toast.error(error.message);
    markDone();
    setOpen(false);
    toast.success('Thank you for rating TripGenius!');
  };

  const later = () => {
    snooze(7);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[380px] z-50 glass-strong rounded-2xl p-4 shadow-elevated space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="font-semibold text-sm">How is TripGenius working for you?</p>
            </div>
            <button onClick={later} aria-label="Close" className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <Stars value={rating} onChange={setRating} size={26} />

          <Textarea
            rows={3}
            maxLength={1000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell other travellers what you liked about the app"
          />

          {photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((p) => (
                <img key={p} src={p} alt="Your TripGenius app review" className="h-14 w-20 object-cover rounded-lg" />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1 text-xs text-primary cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              Add photos
              <input type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
            </label>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="ghost" onClick={later}>Later</Button>
              <Button size="sm" className="rounded-xl" onClick={submit} disabled={saving || uploading}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Send
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
