import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'review-photos';

/** Uploads an image to the private review bucket and returns a long-lived signed URL. */
export async function uploadReviewPhoto(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (signErr || !data) throw signErr ?? new Error('Could not create image link');
  return data.signedUrl;
}
