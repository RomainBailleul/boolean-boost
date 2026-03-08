
CREATE TABLE public.saved_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  query TEXT NOT NULL,
  titles_count INTEGER NOT NULL DEFAULT 0,
  platform TEXT NOT NULL DEFAULT 'sales-navigator',
  location TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own queries"
  ON public.saved_queries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queries"
  ON public.saved_queries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own queries"
  ON public.saved_queries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_saved_queries_user_id ON public.saved_queries(user_id);
