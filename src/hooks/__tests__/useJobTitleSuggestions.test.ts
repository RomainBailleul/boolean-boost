import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useJobTitleSuggestions } from "../useJobTitleSuggestions";

const mockData: Record<string, string[]> = {
  marketing: ["CMO", "Directeur Marketing", "Marketing Manager"],
  sales: ["VP Sales", "Sales Director", "Responsable Commercial"],
};

describe("useJobTitleSuggestions", () => {
  it("should return matching suggestions for input", () => {
    // Arrange / Act
    const { result } = renderHook(() => useJobTitleSuggestions("marketing", mockData));
    // Assert
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current).toContain("Marketing Manager");
  });

  it("should return empty array for empty input", () => {
    const { result } = renderHook(() => useJobTitleSuggestions("", mockData));
    expect(result.current).toEqual([]);
  });

  it("should return empty array for whitespace-only input", () => {
    const { result } = renderHook(() => useJobTitleSuggestions("   ", mockData));
    expect(result.current).toEqual([]);
  });

  it("should respect maxSuggestions limit", () => {
    const { result } = renderHook(() => useJobTitleSuggestions("a", mockData, 2));
    expect(result.current.length).toBeLessThanOrEqual(2);
  });

  it("should return empty for non-matching input", () => {
    const { result } = renderHook(() => useJobTitleSuggestions("zzzzz", mockData));
    expect(result.current).toEqual([]);
  });
});
