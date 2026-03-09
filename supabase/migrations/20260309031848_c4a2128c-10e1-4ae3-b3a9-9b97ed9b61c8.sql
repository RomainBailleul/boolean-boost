
CREATE TABLE public.query_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  query text NOT NULL,
  categories text[] NOT NULL DEFAULT '{}',
  platform text NOT NULL DEFAULT 'sales-navigator',
  is_public boolean NOT NULL DEFAULT true,
  uses_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.query_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can read public templates
CREATE POLICY "Anyone can read public templates"
ON public.query_templates
FOR SELECT
USING (is_public = true);

-- Authenticated users can read their own templates (even private)
CREATE POLICY "Users can read own templates"
ON public.query_templates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can insert their own templates
CREATE POLICY "Users can insert own templates"
ON public.query_templates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND char_length(title) <= 200 AND char_length(query) <= 100000 AND char_length(description) <= 1000);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
ON public.query_templates
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for public listing
CREATE INDEX idx_query_templates_public ON public.query_templates (is_public, created_at DESC);
