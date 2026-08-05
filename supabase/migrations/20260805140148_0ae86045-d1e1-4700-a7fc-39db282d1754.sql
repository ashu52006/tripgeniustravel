-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profile expansion
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS home_city text,
  ADD COLUMN IF NOT EXISTS preferred_currency text NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS default_airport text,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS visa_notes text,
  ADD COLUMN IF NOT EXISTS dietary_preferences text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS accessibility_needs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS travel_interests text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS passport_number text,
  ADD COLUMN IF NOT EXISTS passport_expiry date,
  ADD COLUMN IF NOT EXISTS plan_seats integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS intl_addon boolean NOT NULL DEFAULT false;

-- Migrate legacy plan ids to the new tiers
UPDATE public.profiles SET plan = CASE
  WHEN plan IN ('basic') THEN 'free'
  WHEN plan IN ('silver') THEN 'pro'
  WHEN plan IN ('gold') THEN 'premium'
  WHEN plan IN ('platinum') THEN 'enterprise'
  ELSE plan END;
ALTER TABLE public.profiles ALTER COLUMN plan SET DEFAULT 'free';

CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all trips" ON public.saved_trips
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete trips" ON public.saved_trips
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Expenses
CREATE TABLE public.trip_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trip_id uuid REFERENCES public.saved_trips(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other',
  label text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  spent_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_expenses TO authenticated;
GRANT ALL ON public.trip_expenses TO service_role;
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own expenses" ON public.trip_expenses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins view all expenses" ON public.trip_expenses
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_trip_expenses_user ON public.trip_expenses(user_id);
CREATE INDEX idx_trip_expenses_trip ON public.trip_expenses(trip_id);