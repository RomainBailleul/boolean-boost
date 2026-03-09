import { supabase } from '@/integrations/supabase/client';

const ANON_DAILY_LIMIT = 5;
const AUTH_DAILY_LIMIT = 20;
const STORAGE_KEY = 'bb-daily-usage';

interface DailyUsage {
  date: string;
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getLocalUsage(): DailyUsage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailyUsage = JSON.parse(raw);
      if (parsed.date === getTodayKey()) return parsed;
    }
  } catch {}
  return { date: getTodayKey(), count: 0 };
}

function incrementLocalUsage(): void {
  const usage = getLocalUsage();
  usage.count += 1;
  usage.date = getTodayKey();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {}
}

export interface UsageLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
}

export async function checkUsageLimit(): Promise<UsageLimitResult> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    // Authenticated: call edge function for server-side count
    try {
      const { data, error } = await supabase.functions.invoke('check-usage-limit', {
        body: {},
      });
      if (!error && data) {
        return data as UsageLimitResult;
      }
    } catch {}
    // Fallback: allow
    return { allowed: true, remaining: AUTH_DAILY_LIMIT, limit: AUTH_DAILY_LIMIT, used: 0 };
  }

  // Anonymous: use localStorage tracking
  const usage = getLocalUsage();
  const remaining = Math.max(0, ANON_DAILY_LIMIT - usage.count);
  return {
    allowed: remaining > 0,
    remaining,
    limit: ANON_DAILY_LIMIT,
    used: usage.count,
  };
}

export function recordUsage(): void {
  incrementLocalUsage();
}
