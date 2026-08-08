
-- Only answer about the caller themselves; block cross-user probing
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
      AND (auth.uid() IS NULL OR _user_id = auth.uid())
  )
$$;

CREATE OR REPLACE FUNCTION public.is_trip_member(_trip_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT (auth.uid() IS NULL OR _user_id = auth.uid()) AND (
    EXISTS (SELECT 1 FROM public.trip_members m WHERE m.trip_id = _trip_id AND m.user_id = _user_id)
    OR EXISTS (SELECT 1 FROM public.saved_trips t WHERE t.id = _trip_id AND t.user_id = _user_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_trip_owner(_trip_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT (auth.uid() IS NULL OR _user_id = auth.uid())
     AND EXISTS (SELECT 1 FROM public.saved_trips t WHERE t.id = _trip_id AND t.user_id = _user_id);
$$;

-- Remove implicit PUBLIC/anon execute everywhere
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_trip_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_trip_owner(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.accept_trip_invite(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_helpful_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_shared_trip(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_shared_collection(text) FROM PUBLIC;

-- Re-grant only what is required
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_trip_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_trip_owner(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.accept_trip_invite(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_helpful_count() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_shared_trip(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_shared_collection(text) TO anon, authenticated, service_role;
