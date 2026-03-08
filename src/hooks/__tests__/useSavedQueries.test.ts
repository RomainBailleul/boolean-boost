import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSavedQueries } from "../useSavedQueries";

// ─── Supabase mock ──────────────────────────────────────────

const mockSelectData = [
  {
    id: "cloud-1",
    label: "Cloud Query",
    query: '"CTO" OR "CIO"',
    titles_count: 3,
    platform: "linkedin",
    location: "Paris",
    created_at: "2026-03-08T10:00:00Z",
    user_id: "user-42",
  },
];

const mockInsertReturn = {
  id: "cloud-new",
  label: "New Cloud",
  query: '"CMO"',
  titles_count: 1,
  platform: "sales-navigator",
  location: "",
  created_at: "2026-03-08T12:00:00Z",
  user_id: "user-42",
};

const mockDelete = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
const mockInsertSingle = vi.fn().mockResolvedValue({ data: mockInsertReturn, error: null });
const mockInsertSelect = vi.fn().mockReturnValue({ single: mockInsertSingle });
const mockInsert = vi.fn().mockReturnValue({ select: mockInsertSelect });
const mockOrder = vi.fn().mockReturnValue({ then: vi.fn((cb: any) => cb({ data: mockSelectData })) });
const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === "saved_queries") {
        return {
          select: mockSelect,
          insert: mockInsert,
          delete: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        };
      }
      return {};
    }),
  },
}));

const mockUser = { id: "user-42", email: "test@test.com" } as any;

describe("useSavedQueries", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Re-setup default mock returns
    mockOrder.mockReturnValue({ then: vi.fn((cb: any) => cb({ data: mockSelectData })) });
    mockInsertSingle.mockResolvedValue({ data: mockInsertReturn, error: null });
  });

  // ─── localStorage mode (no user) ────────────────────────────

  it("should return empty array when no saved queries", () => {
    const { result } = renderHook(() => useSavedQueries());
    expect(result.current.savedQueries).toEqual([]);
  });

  it("should load saved queries from localStorage", () => {
    const existing = [
      { id: "1", label: "Test", query: '"CMO"', titlesCount: 1, createdAt: "2026-01-01" },
    ];
    localStorage.setItem("boolean-boost-saved-queries", JSON.stringify(existing));
    const { result } = renderHook(() => useSavedQueries());
    expect(result.current.savedQueries).toHaveLength(1);
    expect(result.current.savedQueries[0].label).toBe("Test");
  });

  it("should save a new query", async () => {
    const { result } = renderHook(() => useSavedQueries());
    await act(async () => {
      await result.current.saveQuery("Ma requête", '"DRH" OR "HRD"', 2);
    });
    expect(result.current.savedQueries).toHaveLength(1);
    expect(result.current.savedQueries[0].label).toBe("Ma requête");
    expect(result.current.savedQueries[0].titlesCount).toBe(2);
  });

  it("should prepend new queries (most recent first)", async () => {
    const { result } = renderHook(() => useSavedQueries());
    await act(async () => {
      await result.current.saveQuery("First", '"A"', 1);
    });
    await act(async () => {
      await result.current.saveQuery("Second", '"B"', 1);
    });
    expect(result.current.savedQueries[0].label).toBe("Second");
    expect(result.current.savedQueries[1].label).toBe("First");
  });

  it("should generate default label when empty", async () => {
    const { result } = renderHook(() => useSavedQueries());
    await act(async () => {
      await result.current.saveQuery("", '"CMO"', 1);
    });
    expect(result.current.savedQueries[0].label).toMatch(/Requête du/);
  });

  it("should persist to localStorage on save", async () => {
    const { result } = renderHook(() => useSavedQueries());
    await act(async () => {
      await result.current.saveQuery("Persist test", '"CMO"', 1);
    });
    const stored = JSON.parse(localStorage.getItem("boolean-boost-saved-queries")!);
    expect(stored).toHaveLength(1);
  });

  it("should delete a query by id", async () => {
    const { result } = renderHook(() => useSavedQueries());
    await act(async () => {
      await result.current.saveQuery("To delete", '"CMO"', 1);
    });
    const id = result.current.savedQueries[0].id;
    await act(async () => {
      await result.current.deleteQuery(id);
    });
    expect(result.current.savedQueries).toHaveLength(0);
  });

  it("should handle corrupted localStorage gracefully", () => {
    localStorage.setItem("boolean-boost-saved-queries", "NOT_JSON");
    const { result } = renderHook(() => useSavedQueries());
    expect(result.current.savedQueries).toEqual([]);
  });

  it("should handle localStorage quota exceeded on save", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    const { result } = renderHook(() => useSavedQueries());
    await act(async () => {
      await result.current.saveQuery("Quota test", '"CMO"', 1);
    });
    expect(result.current.savedQueries).toHaveLength(1);
    setItemSpy.mockRestore();
  });

  // ─── Cloud mode (with user) ─────────────────────────────────

  describe("cloud mode", () => {
    it("should load queries from Supabase when user is provided", async () => {
      const { result } = renderHook(() => useSavedQueries(mockUser));

      await waitFor(() => {
        expect(result.current.savedQueries).toHaveLength(1);
      });

      expect(result.current.savedQueries[0].id).toBe("cloud-1");
      expect(result.current.savedQueries[0].label).toBe("Cloud Query");
      expect(result.current.savedQueries[0].titlesCount).toBe(3);
      expect(result.current.savedQueries[0].platform).toBe("linkedin");
    });

    it("should save query via Supabase insert when user is provided", async () => {
      const { result } = renderHook(() => useSavedQueries(mockUser));

      await waitFor(() => expect(result.current.savedQueries).toHaveLength(1));

      await act(async () => {
        await result.current.saveQuery("New Cloud", '"CMO"', 1, "sales-navigator", "");
      });

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-42",
        label: "New Cloud",
        query: '"CMO"',
        titles_count: 1,
        platform: "sales-navigator",
        location: "",
      });

      expect(result.current.savedQueries[0].id).toBe("cloud-new");
    });

    it("should not persist to localStorage in cloud mode", async () => {
      const { result } = renderHook(() => useSavedQueries(mockUser));

      await waitFor(() => expect(result.current.savedQueries).toHaveLength(1));

      await act(async () => {
        await result.current.saveQuery("Cloud Only", '"CEO"', 1);
      });

      expect(localStorage.getItem("boolean-boost-saved-queries")).toBeNull();
    });

    it("should delete query via Supabase and update state", async () => {
      const { result } = renderHook(() => useSavedQueries(mockUser));

      await waitFor(() => expect(result.current.savedQueries).toHaveLength(1));

      await act(async () => {
        await result.current.deleteQuery("cloud-1");
      });

      expect(result.current.savedQueries).toHaveLength(0);
    });

    it("should handle Supabase insert error gracefully", async () => {
      mockInsertSingle.mockResolvedValueOnce({ data: null, error: { message: "insert failed" } });

      const { result } = renderHook(() => useSavedQueries(mockUser));
      await waitFor(() => expect(result.current.savedQueries).toHaveLength(1));

      const prevLength = result.current.savedQueries.length;
      await act(async () => {
        await result.current.saveQuery("Fail", '"X"', 1);
      });

      // Should not add to state on error
      expect(result.current.savedQueries).toHaveLength(prevLength);
    });
  });
});
