CREATE TABLE public.shared_trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  created_by UUID NOT NULL,
  trip_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  trip_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared trips"
ON public.shared_trips
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create shared trips"
ON public.shared_trips
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own shared trips"
ON public.shared_trips
FOR DELETE
TO authenticated
USING (created_by = auth.uid());