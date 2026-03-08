import { describe, it, expect } from "vitest";
import { generateVariants } from "../variantGenerator";

describe("generateVariants", () => {
  // ─── Empty input ─────────────────────────────────────────────

  it("should return empty array for empty string", () => {
    expect(generateVariants("")).toEqual([]);
  });

  it("should return empty array for whitespace-only string", () => {
    expect(generateVariants("   ")).toEqual([]);
  });

  // ─── Acronym expansion ───────────────────────────────────────

  it("should expand DRH acronym to FR/EN variants", () => {
    // Arrange / Act
    const result = generateVariants("DRH");
    // Assert
    expect(result).toContain("Directeur des Ressources Humaines");
    expect(result).toContain("Directrice des Ressources Humaines");
    expect(result).toContain("HR Director");
    expect(result).toContain("CHRO");
    expect(result).toContain("DRH");
  });

  it("should expand lowercase acronym (drh)", () => {
    const result = generateVariants("drh");
    expect(result).toContain("Directeur des Ressources Humaines");
    expect(result).toContain("DRH");
  });

  it("should expand CTO acronym", () => {
    const result = generateVariants("CTO");
    expect(result).toContain("Chief Technology Officer");
    expect(result).toContain("Directeur Technique");
    expect(result).toContain("Directrice Technique");
  });

  it("should expand CFO acronym", () => {
    const result = generateVariants("CFO");
    expect(result).toContain("Chief Financial Officer");
    expect(result).toContain("Directeur Financier");
    expect(result).toContain("Directrice Financière");
  });

  // ─── Reverse acronym lookup ──────────────────────────────────

  it("should find acronym from full title", () => {
    const result = generateVariants("Directeur des Ressources Humaines");
    expect(result).toContain("DRH");
    expect(result).toContain("Directrice des Ressources Humaines");
    expect(result).toContain("HR Director");
  });

  // ─── Gender variants ─────────────────────────────────────────

  it("should generate feminine variant from masculine", () => {
    const result = generateVariants("Directeur Marketing");
    expect(result).toContain("Directeur Marketing");
    expect(result).toContain("Directrice Marketing");
  });

  it("should generate masculine variant from feminine", () => {
    const result = generateVariants("Directrice Marketing");
    expect(result).toContain("Directeur Marketing");
    expect(result).toContain("Directrice Marketing");
  });

  it("should handle invariable forms (Responsable)", () => {
    const result = generateVariants("Responsable Marketing");
    // Should still include original
    expect(result).toContain("Responsable Marketing");
  });

  it("should handle adjective agreement (Administratif → Administrative)", () => {
    const result = generateVariants("Directeur Administratif et Financier");
    expect(result).toContain("Directrice Administrative et Financière");
  });

  // ─── FR ↔ EN translation ────────────────────────────────────

  it("should translate FR title to EN", () => {
    const result = generateVariants("Directeur Marketing");
    expect(result).toContain("Marketing Director");
  });

  it("should translate EN title to FR", () => {
    const result = generateVariants("Marketing Director");
    expect(result).toContain("Directeur Marketing");
  });

  it("should generate gender variants of translations", () => {
    const result = generateVariants("Marketing Director");
    expect(result).toContain("Directeur Marketing");
    expect(result).toContain("Directrice Marketing");
  });

  // ─── Seniority variants ──────────────────────────────────────

  it("should generate seniority variants for Director", () => {
    const result = generateVariants("Marketing Director");
    expect(result).toContain("Head of Marketing");
    expect(result).toContain("VP Marketing");
  });

  it("should generate seniority variants for Head of", () => {
    const result = generateVariants("Head of Marketing");
    expect(result).toContain("Director Marketing");
    expect(result).toContain("VP Marketing");
  });

  // ─── Unknown title ───────────────────────────────────────────

  it("should return original for unknown title", () => {
    const result = generateVariants("Underwater Basket Weaver");
    expect(result).toContain("Underwater Basket Weaver");
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  // ─── No duplicates ──────────────────────────────────────────

  it("should not contain duplicates", () => {
    const result = generateVariants("DRH");
    const unique = [...new Set(result)];
    expect(result).toHaveLength(unique.length);
  });
});
