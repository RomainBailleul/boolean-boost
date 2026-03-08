import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackQueryGenerated } from '../useUsageTracking';

const mockInsert = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'user-abc' } } },
      }),
    },
    from: vi.fn(() => ({ insert: mockInsert })),
  },
}));

describe('trackQueryGenerated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts event with user_id from session', async () => {
    await trackQueryGenerated({
      categories: ['Marketing'],
      platform: 'linkedin',
      location: 'Paris',
      titlesCount: 5,
      mode: 'category',
    });

    const { supabase } = await import('@/integrations/supabase/client');
    expect(supabase.from).toHaveBeenCalledWith('usage_events');
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-abc',
      categories: ['Marketing'],
      platform: 'linkedin',
      location: 'Paris',
      titles_count: 5,
      mode: 'category',
    });
  });

  it('inserts with null user_id when no session', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
    } as any);

    await trackQueryGenerated({
      categories: [],
      platform: 'sales-navigator',
      location: '',
      titlesCount: 1,
      mode: 'free',
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: null })
    );
  });
});
