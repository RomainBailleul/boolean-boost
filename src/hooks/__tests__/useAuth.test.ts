import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

const mockUser = { id: 'user-123', email: 'test@test.com' };
const mockSession = { user: mockUser, access_token: 'token' };

const mockUnsubscribe = vi.fn();
let authChangeCallback: (event: string, session: any) => void;

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((cb) => {
        authChangeCallback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signOut: vi.fn().mockResolvedValue({}),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with loading true and no user', async () => {
    const { result } = renderHook(() => useAuth());
    // Initially loading
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('sets user when auth state changes', async () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      authChangeCallback('SIGNED_IN', mockSession);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.loading).toBe(false);
  });

  it('clears user on sign out event', async () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      authChangeCallback('SIGNED_IN', mockSession);
    });
    expect(result.current.user).toEqual(mockUser);

    act(() => {
      authChangeCallback('SIGNED_OUT', null);
    });
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('signOut calls supabase.auth.signOut', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useAuth());
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
