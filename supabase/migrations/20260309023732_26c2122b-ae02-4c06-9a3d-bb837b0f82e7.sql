CREATE TABLE public.feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  rating text NOT NULL,
  query_length integer NOT NULL DEFAULT 0,
  platform text NOT NULL DEFAULT 'sales-navigator',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback"
  ON public.feedback_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(rating) <= 50
    AND query_length >= 0
    AND query_length <= 100000
    AND char_length(platform) <= 200
  );

CREATE POLICY "Admins can read feedback"
  ON public.feedback_responses
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));