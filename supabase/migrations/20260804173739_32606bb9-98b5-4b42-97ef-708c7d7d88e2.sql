-- Owner-scoped SELECT and UPDATE policies for shared_trips
CREATE POLICY "Users can view their own shared trips"
ON public.shared_trips FOR SELECT TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can update their own shared trips"
ON public.shared_trips FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Lock down SECURITY DEFINER trigger functions: not callable via the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Public share lookup: only anon/authenticated may call it, no PUBLIC grant
REVOKE ALL ON FUNCTION public.get_shared_trip(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_trip(text) TO anon, authenticated;