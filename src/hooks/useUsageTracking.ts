import { supabase } from '@/integrations/supabase/client';

interface TrackEventParams {
  categories: string[];
  platform: string;
  location: string;
  titlesCount: number;
  mode: 'free' | 'category';
}

export const trackQueryGenerated = async (params: TrackEventParams) => {
  const { data: { session } } = await supabase.auth.getSession();

  await supabase.from('usage_events').insert({
    user_id: session?.user?.id ?? null,
    categories: params.categories,
    platform: params.platform,
    location: params.location,
    titles_count: params.titlesCount,
    mode: params.mode,
  });
};
