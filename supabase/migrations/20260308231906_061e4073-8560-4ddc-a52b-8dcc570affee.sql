DROP POLICY IF EXISTS "Anyone can insert usage events with validation" ON public.usage_events;

CREATE POLICY "Anyone can insert usage events with validation"
ON public.usage_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  titles_count >= 0
  AND titles_count <= 10000
  AND char_length(location) <= 200
  AND char_length(platform) <= 200
  AND char_length(mode) <= 50
  AND (array_length(categories, 1) IS NULL OR array_length(categories, 1) <= 20)
);