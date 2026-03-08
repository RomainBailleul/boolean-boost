import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface CategoryStat {
  name: string;
  count: number;
}

interface PlatformStat {
  name: string;
  count: number;
}

interface DailyCount {
  date: string;
  count: number;
}

interface DashboardStats {
  totalQueries: number;
  totalTitles: number;
  topCategories: CategoryStat[];
  topPlatforms: PlatformStat[];
  dailyCounts: DailyCount[];
  myQueries: number;
  mySavedQueries: number;
  loading: boolean;
}

export const useDashboardStats = (user: User | null): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    totalQueries: 0,
    totalTitles: 0,
    topCategories: [],
    topPlatforms: [],
    dailyCounts: [],
    myQueries: 0,
    mySavedQueries: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch all usage events
      const { data: events } = await supabase
        .from('usage_events' as any)
        .select('*')
        .order('created_at', { ascending: false });

      const rows = (events as any[]) || [];

      // Total queries
      const totalQueries = rows.length;
      const totalTitles = rows.reduce((sum: number, r: any) => sum + (r.titles_count || 0), 0);

      // Category counts
      const catMap: Record<string, number> = {};
      rows.forEach((r: any) => {
        ((r.categories as string[]) || []).forEach((c: string) => {
          catMap[c] = (catMap[c] || 0) + 1;
        });
      });
      const topCategories = Object.entries(catMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Platform counts
      const platMap: Record<string, number> = {};
      rows.forEach((r: any) => {
        const p = r.platform || 'sales-navigator';
        platMap[p] = (platMap[p] || 0) + 1;
      });
      const topPlatforms = Object.entries(platMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // Daily counts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dayMap: Record<string, number> = {};
      rows.forEach((r: any) => {
        const d = new Date(r.created_at);
        if (d >= thirtyDaysAgo) {
          const key = d.toISOString().split('T')[0];
          dayMap[key] = (dayMap[key] || 0) + 1;
        }
      });
      const dailyCounts: DailyCount[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dailyCounts.push({ date: key.slice(5), count: dayMap[key] || 0 });
      }

      // Personal stats
      let myQueries = 0;
      let mySavedQueries = 0;
      if (user) {
        myQueries = rows.filter((r: any) => r.user_id === user.id).length;
        const { count } = await supabase
          .from('saved_queries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        mySavedQueries = count || 0;
      }

      setStats({
        totalQueries,
        totalTitles,
        topCategories,
        topPlatforms,
        dailyCounts,
        myQueries,
        mySavedQueries,
        loading: false,
      });
    };

    fetchStats();
  }, [user]);

  return stats;
};
