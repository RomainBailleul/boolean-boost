import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface HistoryEntry {
  id: string;
  created_at: string;
  mode: string;
  categories: string[];
  platform: string;
  titles_count: number;
  location: string;
}

export const useRecentHistory = (user: User | null | undefined) => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setEntries([]); setLoading(false); return; }

    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('usage_events')
        .select('id, created_at, mode, categories, platform, titles_count, location')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setEntries((data as HistoryEntry[]) ?? []);
      setLoading(false);
    };

    fetch();
  }, [user?.id]);

  return { entries, loading };
};
