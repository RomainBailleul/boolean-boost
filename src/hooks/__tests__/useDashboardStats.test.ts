import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardStats } from '../useDashboardStats';

const mockEvents = [
  {
    id: '1', user_id: 'u1', categories: ['Marketing', 'Sales'],
    platform: 'linkedin', location: 'Paris', titles_count: 3,
    mode: 'category', created_at: new Date().toISOString(),
  },
  {
    id: '2', user_id: 'u2', categories: ['IT'],
    platform: 'sales-navigator', location: '', titles_count: 5,
    mode: 'free', created_at: new Date().toISOString(),
  },
];

const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();
const mockEq = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'usage_events') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
            }),
          }),
        };
      }
      // saved_queries count
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
        }),
      };
    }),
  },
}));

describe('useDashboardStats', () => {
  it('starts with loading true', () => {
    const { result } = renderHook(() => useDashboardStats(null));
    expect(result.current.loading).toBe(true);
  });

  it('computes stats from events', async () => {
    const { result } = renderHook(() => useDashboardStats(null));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalQueries).toBe(2);
    expect(result.current.totalTitles).toBe(8);
    expect(result.current.topCategories.length).toBeGreaterThan(0);
    expect(result.current.topPlatforms.length).toBe(2);
    expect(result.current.dailyCounts.length).toBe(30);
    expect(result.current.error).toBeNull();
  });

  it('computes personal stats when user provided', async () => {
    const user = { id: 'u1' } as any;
    const { result } = renderHook(() => useDashboardStats(user));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.myQueries).toBe(1);
    expect(result.current.mySavedQueries).toBe(2);
  });

  it('handles error gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useDashboardStats(null));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });
});
