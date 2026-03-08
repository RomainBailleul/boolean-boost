import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSavedQueries } from "../useSavedQueries";

describe("useSavedQueries", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ─── Initial state ──────────────────────────────────────────

  it("should return empty array when no saved queries", () => {
    // Arrange / Act
    const { result } = renderHook(() => useSavedQueries());
    // Assert
    expect(result.current.savedQueries).toEqual([]);
  });

  it("should load saved queries from localStorage", () => {
    // Arrange
    const existing = [
      { id: "1", label: "Test", query: '"CMO"', titlesCount: 1, createdAt: "2026-01-01" },
    ];
    localStorage.setItem("boolean-boost-saved-queries", JSON.stringify(existing));
    // Act
    const { result } = renderHook(() => useSavedQueries());
    // Assert
    expect(result.current.savedQueries).toHaveLength(1);
    expect(result.current.savedQueries[0].label).toBe("Test");
  });

  // ─── Save ───────────────────────────────────────────────────

  it("should save a new query", () => {
    // Arrange
    const { result } = renderHook(() => useSavedQueries());
    // Act
    act(() => {
      result.current.saveQuery("Ma requête", '"DRH" OR "HRD"', 2);
    });
    // Assert
    expect(result.current.savedQueries).toHaveLength(1);
    expect(result.current.savedQueries[0].label).toBe("Ma requête");
    expect(result.current.savedQueries[0].titlesCount).toBe(2);
  });

  it("should prepend new queries (most recent first)", () => {
    // Arrange
    const { result } = renderHook(() => useSavedQueries());
    // Act
    act(() => {
      result.current.saveQuery("First", '"A"', 1);
    });
    act(() => {
      result.current.saveQuery("Second", '"B"', 1);
    });
    // Assert
    expect(result.current.savedQueries[0].label).toBe("Second");
    expect(result.current.savedQueries[1].label).toBe("First");
  });

  it("should generate default label when empty", () => {
    const { result } = renderHook(() => useSavedQueries());
    act(() => {
      result.current.saveQuery("", '"CMO"', 1);
    });
    expect(result.current.savedQueries[0].label).toMatch(/Requête du/);
  });

  it("should persist to localStorage on save", () => {
    const { result } = renderHook(() => useSavedQueries());
    act(() => {
      result.current.saveQuery("Persist test", '"CMO"', 1);
    });
    const stored = JSON.parse(localStorage.getItem("boolean-boost-saved-queries")!);
    expect(stored).toHaveLength(1);
  });

  // ─── Delete ─────────────────────────────────────────────────

  it("should delete a query by id", () => {
    // Arrange
    const { result } = renderHook(() => useSavedQueries());
    act(() => {
      result.current.saveQuery("To delete", '"CMO"', 1);
    });
    const id = result.current.savedQueries[0].id;
    // Act
    act(() => {
      result.current.deleteQuery(id);
    });
    // Assert
    expect(result.current.savedQueries).toHaveLength(0);
  });

  // ─── Error handling ─────────────────────────────────────────

  it("should handle corrupted localStorage gracefully", () => {
    // Arrange
    localStorage.setItem("boolean-boost-saved-queries", "NOT_JSON");
    // Act — should not throw
    const { result } = renderHook(() => useSavedQueries());
    // Assert
    expect(result.current.savedQueries).toEqual([]);
  });

  it("should handle localStorage quota exceeded on save", () => {
    // Arrange
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    const { result } = renderHook(() => useSavedQueries());
    // Act — should not throw
    act(() => {
      result.current.saveQuery("Quota test", '"CMO"', 1);
    });
    // Assert — state still updated in memory
    expect(result.current.savedQueries).toHaveLength(1);
    setItemSpy.mockRestore();
  });
});
