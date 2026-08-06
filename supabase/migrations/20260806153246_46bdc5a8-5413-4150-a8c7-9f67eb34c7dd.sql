
-- =========================
-- REVIEWS
-- =========================
CREATE TYPE public.review_subject AS ENUM ('hotel','flight','activity','destination','restaurant');
CREATE TYPE public.traveler_type AS ENUM ('solo','couple','family','business');
CREATE TYPE public.review_status AS ENUM ('published','hidden','removed');

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_type public.review_subject NOT NULL,
  subject_key text NOT NULL,
  subject_name text NOT NULL,
  city text,
  country text,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text NOT NULL,
  traveler_type public.traveler_type,
  photo_urls text[] NOT NULL DEFAULT '{}',
  video_urls text[] NOT NULL DEFAULT '{}',
  is_verified boolean NOT NULL DEFAULT false,
  status public.review_status NOT NULL DEFAULT 'published',
  helpful_count int NOT NULL DEFAULT 0,
  admin_reply text,
  admin_reply_at timestamptz,
  trip_id uuid REFERENCES public.saved_trips(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reviews_subject_idx ON public.reviews (subject_type, subject_key);
CREATE INDEX reviews_user_idx ON public.reviews (user_id);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published reviews are readable" ON public.reviews
  FOR SELECT USING (status = 'published' OR user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins moderate reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users delete own reviews" ON public.reviews
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.review_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.review_votes TO authenticated;
GRANT ALL ON public.review_votes TO service_role;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own votes" ON public.review_votes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users vote" ON public.review_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users unvote" ON public.review_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.sync_helpful_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.reviews r
     SET helpful_count = (SELECT count(*) FROM public.review_votes v WHERE v.review_id = r.id)
   WHERE r.id = COALESCE(NEW.review_id, OLD.review_id);
  RETURN NULL;
END; $$;
REVOKE EXECUTE ON FUNCTION public.sync_helpful_count() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER review_votes_count AFTER INSERT OR DELETE ON public.review_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_helpful_count();

CREATE TABLE public.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.review_reports TO authenticated;
GRANT ALL ON public.review_reports TO service_role;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Report a review" ON public.review_reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Admins read reports" ON public.review_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins resolve reports" ON public.review_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================
-- WISHLIST & COLLECTIONS
-- =========================
CREATE TABLE public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type public.review_subject NOT NULL,
  item_key text NOT NULL,
  title text NOT NULL,
  subtitle text,
  image_url text,
  city text,
  country text,
  price_estimate numeric,
  currency text NOT NULL DEFAULT 'INR',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  cover_url text,
  is_shared boolean NOT NULL DEFAULT false,
  share_id text NOT NULL DEFAULT encode(extensions.gen_random_bytes(8),'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX collections_share_id_key ON public.collections (share_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own collections" ON public.collections FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER collections_updated_at BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  wishlist_item_id uuid REFERENCES public.wishlist_items(id) ON DELETE CASCADE,
  title text NOT NULL,
  item_type public.review_subject NOT NULL,
  item_key text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_items TO authenticated;
GRANT ALL ON public.collection_items TO service_role;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own collection items" ON public.collection_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.get_shared_collection(_share_id text)
RETURNS TABLE (name text, description text, cover_url text, items jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.name, c.description, c.cover_url,
         COALESCE((SELECT jsonb_agg(to_jsonb(i) - 'collection_id') FROM public.collection_items i WHERE i.collection_id = c.id), '[]'::jsonb)
  FROM public.collections c
  WHERE c.share_id = _share_id AND c.is_shared = true
  LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.get_shared_collection(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_collection(text) TO anon, authenticated;

-- =========================
-- GROUP TRAVEL
-- =========================
CREATE TYPE public.trip_member_role AS ENUM ('owner','editor','viewer');

CREATE TABLE public.trip_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.saved_trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.trip_member_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trip_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_members TO authenticated;
GRANT ALL ON public.trip_members TO service_role;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_trip_member(_trip_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.trip_members m WHERE m.trip_id = _trip_id AND m.user_id = _user_id)
      OR EXISTS (SELECT 1 FROM public.saved_trips t WHERE t.id = _trip_id AND t.user_id = _user_id);
$$;
REVOKE EXECUTE ON FUNCTION public.is_trip_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_trip_member(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_trip_owner(_trip_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.saved_trips t WHERE t.id = _trip_id AND t.user_id = _user_id);
$$;
REVOKE EXECUTE ON FUNCTION public.is_trip_owner(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_trip_owner(uuid, uuid) TO authenticated;

CREATE POLICY "Members read membership" ON public.trip_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_trip_owner(trip_id, auth.uid()));
CREATE POLICY "Owner manages members" ON public.trip_members FOR INSERT TO authenticated
  WITH CHECK (public.is_trip_owner(trip_id, auth.uid()));
CREATE POLICY "Owner updates members" ON public.trip_members FOR UPDATE TO authenticated
  USING (public.is_trip_owner(trip_id, auth.uid())) WITH CHECK (public.is_trip_owner(trip_id, auth.uid()));
CREATE POLICY "Owner or self removes member" ON public.trip_members FOR DELETE TO authenticated
  USING (public.is_trip_owner(trip_id, auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Members can view shared trips" ON public.saved_trips FOR SELECT TO authenticated
  USING (public.is_trip_member(id, auth.uid()));

CREATE TABLE public.trip_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.saved_trips(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.trip_member_role NOT NULL DEFAULT 'viewer',
  token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(12),'hex'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX trip_invites_token_key ON public.trip_invites (token);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_invites TO authenticated;
GRANT ALL ON public.trip_invites TO service_role;
ALTER TABLE public.trip_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages invites" ON public.trip_invites FOR ALL TO authenticated
  USING (public.is_trip_owner(trip_id, auth.uid())) WITH CHECK (public.is_trip_owner(trip_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.accept_trip_invite(_token text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv public.trip_invites%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO inv FROM public.trip_invites WHERE token = _token AND accepted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid or used invite'; END IF;
  INSERT INTO public.trip_members (trip_id, user_id, role)
  VALUES (inv.trip_id, auth.uid(), inv.role)
  ON CONFLICT (trip_id, user_id) DO UPDATE SET role = EXCLUDED.role;
  UPDATE public.trip_invites SET accepted_at = now() WHERE id = inv.id;
  RETURN inv.trip_id;
END; $$;
REVOKE EXECUTE ON FUNCTION public.accept_trip_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_trip_invite(text) TO authenticated;

CREATE TABLE public.trip_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.saved_trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.trip_messages TO authenticated;
GRANT ALL ON public.trip_messages TO service_role;
ALTER TABLE public.trip_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read chat" ON public.trip_messages FOR SELECT TO authenticated USING (public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "Members post chat" ON public.trip_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "Authors delete chat" ON public.trip_messages FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.expense_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES public.trip_expenses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  settled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (expense_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_shares TO authenticated;
GRANT ALL ON public.expense_shares TO service_role;
ALTER TABLE public.expense_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Share participants read" ON public.expense_shares FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.trip_expenses e WHERE e.id = expense_id AND e.user_id = auth.uid()));
CREATE POLICY "Expense owner writes shares" ON public.expense_shares FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trip_expenses e WHERE e.id = expense_id AND e.user_id = auth.uid()));
CREATE POLICY "Participants settle shares" ON public.expense_shares FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.trip_expenses e WHERE e.id = expense_id AND e.user_id = auth.uid()))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.trip_expenses e WHERE e.id = expense_id AND e.user_id = auth.uid()));
CREATE POLICY "Expense owner deletes shares" ON public.expense_shares FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trip_expenses e WHERE e.id = expense_id AND e.user_id = auth.uid()));

CREATE TABLE public.trip_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.saved_trips(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NOT NULL,
  closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_votes TO authenticated;
GRANT ALL ON public.trip_votes TO service_role;
ALTER TABLE public.trip_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read polls" ON public.trip_votes FOR SELECT TO authenticated USING (public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "Members create polls" ON public.trip_votes FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "Creators update polls" ON public.trip_votes FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Creators delete polls" ON public.trip_votes FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE TABLE public.trip_vote_ballots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid NOT NULL REFERENCES public.trip_votes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vote_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_vote_ballots TO authenticated;
GRANT ALL ON public.trip_vote_ballots TO service_role;
ALTER TABLE public.trip_vote_ballots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read ballots" ON public.trip_vote_ballots FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trip_votes v WHERE v.id = vote_id AND public.is_trip_member(v.trip_id, auth.uid())));
CREATE POLICY "Members cast ballots" ON public.trip_vote_ballots FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.trip_votes v WHERE v.id = vote_id AND public.is_trip_member(v.trip_id, auth.uid())));
CREATE POLICY "Members change ballot" ON public.trip_vote_ballots FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Members remove ballot" ON public.trip_vote_ballots FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Members view trip expenses" ON public.trip_expenses FOR SELECT TO authenticated
  USING (trip_id IS NOT NULL AND public.is_trip_member(trip_id, auth.uid()));

-- =========================
-- PAYMENTS & REWARDS
-- =========================
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_percent int CHECK (discount_percent BETWEEN 1 AND 100),
  discount_flat numeric,
  currency text NOT NULL DEFAULT 'INR',
  max_uses int,
  used_count int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read active promos" ON public.promo_codes FOR SELECT TO authenticated
  USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage promos" ON public.promo_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER promo_codes_updated_at BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (promo_id, user_id)
);
GRANT SELECT, INSERT ON public.promo_redemptions TO authenticated;
GRANT ALL ON public.promo_redemptions TO service_role;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own redemptions" ON public.promo_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users redeem" ON public.promo_redemptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE TYPE public.wallet_kind AS ENUM ('wallet','points','cashback','referral');

CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.wallet_kind NOT NULL DEFAULT 'wallet',
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own wallet" ON public.wallet_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins adjust wallet" ON public.wallet_transactions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE DEFAULT upper(encode(extensions.gen_random_bytes(4),'hex')),
  referred_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  signups int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own referral" ON public.referrals FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own referral" ON public.referrals FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own referral" ON public.referrals FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================
-- ADMIN
-- =========================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins write audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND actor_id = auth.uid());

CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins write settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TYPE public.ticket_status AS ENUM ('open','pending','resolved','closed');

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  status public.ticket_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own tickets" ON public.support_tickets FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users or admins update tickets" ON public.support_tickets FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ticket_messages TO authenticated;
GRANT ALL ON public.ticket_messages TO service_role;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ticket participants read" ON public.ticket_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));
CREATE POLICY "Ticket participants write" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())));

INSERT INTO public.app_settings (key, value) VALUES
  ('feature_flags', '{"reviews":true,"wishlist":true,"group_travel":true,"wallet":true}'::jsonb),
  ('system_config', '{"support_email":"support@tripgenius.app","default_currency":"INR"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
