
-- Remove overly permissive public SELECT on shared_trips
DROP POLICY IF EXISTS "Anyone can view shared trips" ON public.shared_trips;

-- Revoke direct table SELECT from anon/authenticated so full-table scans are impossible
REVOKE SELECT ON public.shared_trips FROM anon, authenticated;

-- Provide a security definer function that returns a single trip only when the exact share_id is supplied
CREATE OR REPLACE FUNCTION public.get_shared_trip(_share_id text)
RETURNS TABLE (
  share_id text,
  trip_name text,
  origin text,
  destination text,
  trip_data jsonb,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT share_id, trip_name, origin, destination, trip_data, created_at
  FROM public.shared_trips
  WHERE share_id = _share_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_trip(text) TO anon, authenticated;
