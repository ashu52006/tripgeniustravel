import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  has_completed_onboarding: boolean;
  notification_choice: string | null;
  show_name_to_companions: boolean;
  plan: string;
  full_name: string | null;
  phone: string | null;
  home_city: string | null;
  preferred_currency: string;
  default_airport: string | null;
  nationality: string | null;
  visa_notes: string | null;
  dietary_preferences: string[];
  accessibility_needs: string[];
  travel_interests: string[];
  passport_number: string | null;
  passport_expiry: string | null;
  plan_seats: number;
  intl_addon: boolean;
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
      setProfile(data as unknown as Profile);
    } else {
      const { data: inserted } = await supabase
        .from('profiles')
        .insert({ id: user.id })
        .select('*')
        .maybeSingle();
      setProfile((inserted as unknown as Profile) ?? null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(
    async (patch: Partial<Omit<Profile, 'id'>>) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .update(patch as never)
        .eq('id', user.id)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      if (data) setProfile(data as unknown as Profile);
    },
    [user]
  );

  return { profile, loading, update, reload: load };
}
