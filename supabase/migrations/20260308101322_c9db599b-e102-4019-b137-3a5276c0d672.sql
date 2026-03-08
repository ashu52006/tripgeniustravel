CREATE TABLE public.saved_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id text NOT NULL DEFAULT 'basic',
  trip_name text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  start_date date NOT NULL,
  days integer NOT NULL,
  travelers integer NOT NULL DEFAULT 1,
  trip_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trips"
  ON public.saved_trips FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own trips"
  ON public.saved_trips FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own trips"
  ON public.saved_trips FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());