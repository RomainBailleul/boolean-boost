
CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  categories text[] NOT NULL DEFAULT '{}',
  platform text NOT NULL DEFAULT 'sales-navigator',
  location text NOT NULL DEFAULT '',
  titles_count integer NOT NULL DEFAULT 0,
  mode text NOT NULL DEFAULT 'free',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can insert usage events"
ON public.usage_events FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Anyone can read aggregated (we'll use a function for aggregation, but allow select for global stats)
CREATE POLICY "Anyone can read usage events"
ON public.usage_events FOR SELECT
TO anon, authenticated
USING (true);
