
-- P0-02: Add indexes on usage_events for dashboard performance
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON public.usage_events (created_at);
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON public.usage_events (user_id);

-- P1-01: Replace permissive INSERT policy with validated one
DROP POLICY IF EXISTS "Anyone can insert usage events" ON public.usage_events;
CREATE POLICY "Anyone can insert usage events with validation"
ON public.usage_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  titles_count >= 0
  AND titles_count <= 10000
  AND array_length(categories, 1) IS NULL OR array_length(categories, 1) <= 20
  AND char_length(location) <= 200
  AND char_length(platform) <= 200
  AND char_length(mode) <= 50
);
