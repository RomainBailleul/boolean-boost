import { describe, it, expect } from "vitest";
import {
  generateBooleanQuery,
  normalizeForSearch,
  calculateRelevanceScore,
  getSortedSuggestions,
} from "../queryGenerator";

// ─── normalizeForSearch ───────────────────────────────────────────

describe("normalizeForSearch", () => {
  it("should lowercase text", () => {
    // Arrange
    const input = "Directeur Marketing";
    // Act
    const result = normalizeForSearch(input);
    // Assert
    expect(result).toBe("directeur marketing");
  });

  it("should remove accents", () => {
    // Arrange
    const input = "Directrice Générale Déléguée";
    // Act
    const result = normalizeForSearch(input);
    // Assert
    expect(result).toBe("directrice generale deleguee");
  });

  it("should trim whitespace", () => {
    // Arrange
    const input = "  DRH  ";
    // Act
    const result = normalizeForSearch(input);
    // Assert
    expect(result).toBe("drh");
  });

  it("should handle empty string", () => {
    expect(normalizeForSearch("")).toBe("");
  });

  it("should handle combined accents, casing, and whitespace", () => {
    expect(normalizeForSearch("  Président-Directeur Général  ")).toBe(
      "president-directeur general"
    );
  });
});

// ─── calculateRelevanceScore ──────────────────────────────────────

describe("calculateRelevanceScore", () => {
  it("should return 1000 for exact match", () => {
    // Arrange / Act
    const score = calculateRelevanceScore("DRH", "DRH");
    // Assert
    expect(score).toBe(1000);
  });

  it("should return 1000 for case-insensitive exact match", () => {
    expect(calculateRelevanceScore("drh", "DRH")).toBe(1000);
  });

  it("should return 800 when title starts with search term", () => {
    expect(calculateRelevanceScore("Direct", "Directeur Marketing")).toBe(800);
  });

  it("should return 600 when title contains search term", () => {
    expect(calculateRelevanceScore("Marketing", "Directeur Marketing")).toBe(600);
  });

  it("should return word match score for partial word matches", () => {
    const score = calculateRelevanceScore("market fin", "Marketing Financier");
    expect(score).toBeGreaterThan(0);
  });

  it("should return 0 when no match at all", () => {
    expect(calculateRelevanceScore("xyz", "Directeur Marketing")).toBe(0);
  });

  it("should ignore single-character search words", () => {
    // "a" alone should not match anything in word scoring
    expect(calculateRelevanceScore("a", "Analyste")).toBe(800); // startsWith still matches
  });
});

// ─── getSortedSuggestions ─────────────────────────────────────────

describe("getSortedSuggestions", () => {
  const titles = [
    "Directeur Marketing",
    "Directeur Commercial",
    "Marketing Manager",
    "Chef de Produit",
    "Responsable Marketing",
  ];

  it("should return suggestions sorted by relevance", () => {
    // Arrange / Act
    const result = getSortedSuggestions("marketing", titles);
    // Assert
    expect(result.length).toBeGreaterThan(0);
    // "Marketing Manager" starts with "marketing" → higher than "Directeur Marketing"
    expect(result[0]).toBe("Marketing Manager");
  });

  it("should respect maxResults limit", () => {
    const result = getSortedSuggestions("direct", titles, 2);
    expect(result).toHaveLength(2);
  });

  it("should return empty array for empty search", () => {
    expect(getSortedSuggestions("", titles)).toEqual([]);
  });

  it("should return empty array for whitespace-only search", () => {
    expect(getSortedSuggestions("   ", titles)).toEqual([]);
  });

  it("should return empty array when no title matches", () => {
    expect(getSortedSuggestions("zzzzz", titles)).toEqual([]);
  });
});

// ─── generateBooleanQuery ─────────────────────────────────────────

describe("generateBooleanQuery", () => {
  const mockData: Record<string, string[]> = {
    marketing: ["CMO", "Directeur Marketing", "Marketing Manager"],
    sales: ["VP Sales", "Sales Director"],
  };

  it("should generate OR query in free mode with inputValue", () => {
    // Arrange
    const options = { mode: "free" as const, inputValue: "CMO" };
    // Act
    const result = generateBooleanQuery(mockData, options);
    // Assert
    expect(result).toBe('"CMO"');
  });

  it("should generate OR query in free mode with selectedTitles", () => {
    const options = {
      mode: "free" as const,
      inputValue: "",
      selectedTitles: ["CMO", "Marketing Manager"],
    };
    const result = generateBooleanQuery(mockData, options);
    expect(result).toBe('"CMO" OR "Marketing Manager"');
  });

  it("should deduplicate titles in free mode", () => {
    const options = {
      mode: "free" as const,
      inputValue: "CMO",
      selectedTitles: ["CMO", "Marketing Manager"],
      customTitles: ["CMO"],
    };
    const result = generateBooleanQuery(mockData, options);
    expect(result).toBe('"CMO" OR "Marketing Manager"');
  });

  it("should generate query from category in category mode", () => {
    const options = {
      mode: "category" as const,
      selectedCategory: "sales",
    };
    const result = generateBooleanQuery(mockData, options);
    expect(result).toBe('"VP Sales" OR "Sales Director"');
  });

  it("should return empty string when no titles available", () => {
    const options = { mode: "free" as const, inputValue: "" };
    expect(generateBooleanQuery(mockData, options)).toBe("");
  });

  it("should return empty string for missing category", () => {
    const options = {
      mode: "category" as const,
      selectedCategory: "nonexistent",
    };
    expect(generateBooleanQuery(mockData, options)).toBe("");
  });
});
