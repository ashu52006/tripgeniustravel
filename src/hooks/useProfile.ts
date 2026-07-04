import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  has_completed_onboarding: boolean;
  notification_choice: string | null;
  show_name_to_companions: boolean;
  plan: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) {
      setProfile(data as Profile);
    } else {
      // Ensure row exists (trigger normally does this, but backfill for safety)
      const { data: inserted } = await supabase
        .from('profiles')
        .insert({ id: user.id })
        .select('*')
        .maybeSingle();
      setProfile(inserted as Profile | null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(
    async (patch: Partial<Omit<Profile, 'id'>>) => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', user.id)
        .select('*')
        .maybeSingle();
      if (data) setProfile(data as Profile);
    },
    [user]
  );

  return { profile, loading, update, reload: load };
}
